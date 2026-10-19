import React, { useState } from 'react';
import { X, MessageCircle, Eye } from 'lucide-react';
import { ProductItem, StoreSettings } from '../types';
import { generateDirectProductInquiryUrl } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onOpenReservationWithProduct: (product: ProductItem) => void;
  settings: StoreSettings;
  onZoomImage: (url: string, title: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenReservationWithProduct,
  settings,
  onZoomImage
}) => {
  const [eventDate, setEventDate] = useState<string>('');

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-mono font-bold text-teal-800">{product.code}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Image & Quick Zoom */}
          <div className="md:col-span-5 bg-slate-100 p-6 flex flex-col justify-between">
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-900">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => onZoomImage(product.imageUrl, product.name)}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Foto Penuh</span>
              </button>
            </div>

            {/* Quick Rental Notice */}
            <div className="mt-4 p-4 bg-teal-50/80 rounded-2xl border border-teal-100 text-xs text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🌿 Catatan Instalasi Venue</span>
              </div>
              <p className="text-teal-800/90 text-[11px] leading-relaxed">
                Pohon menggunakan sistem sambungan kokoh (knockdown) yang mudah dibawa melalui pintu standar maupun lift gedung ballroom tanpa merusak dahan.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Specifications & Actions */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 leading-tight">
                  {product.name}
                </h2>
                <div className="mt-1 text-xs text-emerald-800 font-bold">
                  Status: {product.status} ({product.stockAvailable} Unit Siap Pakai)
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Technical Specifications Grid */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-2">
                <div className="font-bold text-slate-900 text-xs mb-2">Spesifikasi Detail Produk:</div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Tinggi Pohon:</span>
                    <span className="font-semibold text-slate-800">{product.height}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Bentang Daun:</span>
                    <span className="font-semibold text-slate-800">{product.widthSpread}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Bahan Batang:</span>
                    <span className="font-semibold text-slate-800">{product.trunkType}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Jenis Dedaunan:</span>
                    <span className="font-semibold text-slate-800">{product.foliageType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Stok Siap Pakai:</span>
                    <span className="font-bold text-emerald-700">{product.stockAvailable} Unit Tersedia</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Total Populasi:</span>
                    <span className="font-semibold text-slate-800">{product.stockTotal} Unit</span>
                  </div>
                </div>
              </div>

              {/* Recommended For */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900">Rekomendasi Penempatan:</div>
                <ul className="space-y-1 text-slate-600">
                  {product.recommendedFor.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-700 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optional Date for Direct Inquiry */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rencana Tanggal Acara Anda (Opsional):
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

            </div>

            {/* Action Buttons (No Prices, Direct WhatsApp Booking) */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenReservationWithProduct(product);
                }}
                className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
              >
                <span>Isi Form Reservasi Online</span>
              </button>

              <a
                href={generateDirectProductInquiryUrl(product, settings, eventDate)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WA Sekarang</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
