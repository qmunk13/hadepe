import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Calendar, MapPin, User, Phone, TreePine, Sparkles } from 'lucide-react';
import { ProductItem, BookingServiceOptions, BookingOrder, StoreSettings } from '../types';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  preselectedProduct: ProductItem | null;
  settings: StoreSettings;
  onOrderCompleted: (order: BookingOrder) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  products,
  preselectedProduct,
  settings,
  onOrderCompleted
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventDate, setEventDate] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [services, setServices] = useState<BookingServiceOptions>({
    includeSetup: true,
    includeLighting: true,
    includeTransport: true
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProductId(preselectedProduct.id);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [preselectedProduct, products]);

  if (!isOpen) return null;

  // Calculate rental duration
  const startMs = new Date(eventDate).getTime();
  const endMs = new Date(returnDate).getTime();
  const diffDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));

  const currentProduct = products.find((p) => p.id === selectedProductId) || preselectedProduct || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Mohon isi nama lengkap pemesan atau wedding organizer.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Mohon isi nomor WhatsApp yang aktif.');
      return;
    }

    if (!venueName.trim()) {
      setErrorMessage('Mohon isi nama gedung / lokasi acara pernikahan.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCode = eventDate.replace(/-/g, '');
    const orderNumber = `HDP-${dateCode}-${randomSuffix}`;

    const newOrder: BookingOrder = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      eventDate,
      returnDate,
      rentalDays: diffDays,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim() || venueName.trim(),
      notes: notes.trim(),
      services,
      items: [
        {
          productId: currentProduct.id,
          productCode: currentProduct.code,
          productName: currentProduct.name,
          quantity: quantity || 1
        }
      ],
      status: 'Menunggu Konfirmasi WA',
      createdAt: new Date().toISOString()
    };

    onOrderCompleted(newOrder);

    // Open WhatsApp
    const waUrl = generateWhatsAppOrderUrl(newOrder, settings);
    window.open(waUrl, '_blank');

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🌿
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight">
                Formulir Pemesanan & Reservasi Pohon
              </h3>
              <p className="text-xs text-slate-500">
                Terhubung langsung ke WhatsApp resmi HD-Pohon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Tree Product Selection */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <TreePine className="w-4 h-4 text-teal-800" />
              <span>Pilih Koleksi Pohon yang Ingin Dipesan:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} ({p.height})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 font-medium">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    max={currentProduct?.stockAvailable || 10}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-slate-500 text-[11px]">Unit</span>
                </div>
              </div>
            </div>

            {currentProduct && (
              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-600">
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="font-semibold text-slate-900">{currentProduct.name}</div>
                  <div className="text-slate-500">Tinggi: {currentProduct.height} · {currentProduct.category}</div>
                </div>
              </div>
            )}
          </div>

          {/* Schedule & Event Date */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Calendar className="w-4 h-4 text-teal-800" />
              <span>Jadwal Tanggal Acara:</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mulai Acara (Loading) *
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selesai Acara (Bongkar) *
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div className="text-[11px] text-teal-900 bg-teal-50 p-2 rounded-xl font-medium">
              Durasi acara: <strong className="font-bold">{diffDays} Hari</strong>
            </div>
          </div>

          {/* Customer & Venue Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pemesan / Wedding Organizer *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Ibu Diana / Mahkota WO"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Pemesan *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08123456xxxx"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Gedung / Hotel / Lokasi Acara *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Contoh: Gedung Graha Sarina Vidi / Hyatt Ballroom"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Acara / Titik Pengiriman
              </label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Jl. Magelang KM 8, Sleman, Yogyakarta"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700"
              />
            </div>

            {/* Service Checkboxes */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-[11px]">
                Kebutuhan Layanan:
              </span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.includeSetup}
                    onChange={(e) => setServices({ ...services, includeSetup: e.target.checked })}
                    className="rounded text-teal-800 focus:ring-teal-700 w-3.5 h-3.5"
                  />
                  <span>Jasa Pasang & Bongkar Tim HD-Pohon</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.includeLighting}
                    onChange={(e) => setServices({ ...services, includeLighting: e.target.checked })}
                    className="rounded text-teal-800 focus:ring-teal-700 w-3.5 h-3.5"
                  />
                  <span>Instalasi Spotlight LED & Lampu Pohon</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.includeTransport}
                    onChange={(e) => setServices({ ...services, includeTransport: e.target.checked })}
                    className="rounded text-teal-800 focus:ring-teal-700 w-3.5 h-3.5"
                  />
                  <span>Transportasi Truk Khusus Venue</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Konsep / Waktu Loading Dock
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tema pernikahan, jam loading dock gedung, request khusus dahan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold border border-rose-200 text-xs">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Kirim Reservasi ke WhatsApp Resmi HD-Pohon &rarr;</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Pesan reservasi langsung terformat dan terhubung ke admin WhatsApp HD-Pohon untuk verifikasi ketersediaan.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
