import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Calendar, 
  User, 
  Phone, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Barang, Pelanggan } from '../types';

interface CartItem {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  stokTersedia: number;
  qty: number;
}

interface SewaFormViewProps {
  barangList: Barang[];
  pelangganList?: Pelanggan[];
  preselectedKode?: string;
  onClearPreselected?: () => void;
  onSubmitSewa: (payload: {
    namaPelanggan: string;
    noTelepon: string;
    alamat: string;
    tglSewa: string;
    tglKembali: string;
    catatan: string;
    items: { kode: string; qtySewa: number }[];
  }) => Promise<string | undefined>;
  onOpenInvoice: (noSewa: string) => void;
}

export const SewaFormView: React.FC<SewaFormViewProps> = ({
  barangList,
  pelangganList = [],
  preselectedKode,
  onClearPreselected,
  onSubmitSewa,
  onOpenInvoice
}) => {
  const now = new Date();
  const duaHari = new Date(now.getTime() + 2 * 24 * 3600 * 1000);

  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [tglSewa, setTglSewa] = useState(now.toISOString().slice(0, 10));
  const [tglKembali, setTglKembali] = useState(duaHari.toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (preselectedKode) {
      const b = barangList.find(x => x.kode === preselectedKode);
      if (b && b.stokTersedia > 0) {
        return [{
          kode: b.kode,
          nama: b.nama,
          kategori: b.kategori,
          satuan: b.satuan,
          stokTersedia: b.stokTersedia,
          qty: Math.min(10, b.stokTersedia)
        }];
      }
    }
    return [];
  });

  const addItemToCart = (kode: string) => {
    if (!kode) return;
    const b = barangList.find(x => x.kode === kode);
    if (!b) return;
    if (b.stokTersedia <= 0) {
      alert(`Stok barang ${b.nama} saat ini sedang kosong/habis dipakai!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.kode === kode);
      if (existing) {
        if (existing.qty + 1 > b.stokTersedia) {
          alert(`Maksimal stok tersedia hanya ${b.stokTersedia} ${b.satuan}.`);
          return prev;
        }
        return prev.map(item => item.kode === kode ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, {
        kode: b.kode,
        nama: b.nama,
        kategori: b.kategori,
        satuan: b.satuan,
        stokTersedia: b.stokTersedia,
        qty: 1
      }];
    });
  };

  const updateQty = (kode: string, newQty: number) => {
    setCart(prev => prev.map(item => {
      if (item.kode === kode) {
        const validated = Math.max(1, Math.min(newQty, item.stokTersedia));
        return { ...item, qty: validated };
      }
      return item;
    }));
  };

  const removeItem = (kode: string) => {
    setCart(prev => prev.filter(item => item.kode !== kode));
  };

  const totalQtyBarang = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPelanggan.trim() || !noTelepon.trim()) {
      alert('Nama Pelanggan dan Nomor Telepon / WA wajib diisi.');
      return;
    }
    if (cart.length === 0) {
      alert('Pilih minimal satu barang (Bunga, Daun, atau Properti) untuk disewa.');
      return;
    }
    setIsSubmitting(true);
    try {
      const createdNoSewa = await onSubmitSewa({
        namaPelanggan: namaPelanggan.trim(),
        noTelepon: noTelepon.trim(),
        alamat: alamat.trim(),
        tglSewa,
        tglKembali,
        catatan: catatan.trim(),
        items: cart.map(c => ({
          kode: c.kode,
          qtySewa: c.qty
        }))
      });
      if (createdNoSewa) {
        setCart([]);
        setNamaPelanggan('');
        setNoTelepon('');
        setAlamat('');
        setCatatan('');
        if (onClearPreselected) onClearPreselected();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-900">Form Sewa & Pemakaian Dekorasi</h2>
          <p className="text-xs text-slate-500">Pencatatan pengeluaran barang dekorasi (Bunga, Daun, Properti, Aksesoris) & pemotongan stok otomatis</p>
        </div>
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-teal-600" />
          <span>Faktur Sewa Keluar</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1: Data Penyewa & Jadwal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="font-serif font-bold text-slate-900 text-sm">Informasi Pelanggan & Acara</h3>
          </div>

          {pelangganList && pelangganList.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih dari Master Pelanggan / WO (Opsional)</label>
              <select
                onChange={e => {
                  const p = pelangganList.find(x => x.id === e.target.value);
                  if (p) {
                    setNamaPelanggan(p.nama || p.namaPelanggan || '');
                    setNoTelepon(p.noTelepon || '');
                    setAlamat(p.alamat || '');
                  }
                }}
                defaultValue=""
                className="w-full px-3.5 py-2.5 bg-teal-50/50 border border-teal-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500 font-medium text-slate-700"
              >
                <option value="">-- Pilih dari Kontak Pelanggan / WO Tersimpan --</option>
                {pelangganList.map(p => (
                  <option key={p.id} value={p.id}>
                    {(p.nama || p.namaPelanggan || 'Pelanggan')} ({p.kategori || 'Umum'}) - {p.noTelepon}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Penyewa / Wedding Organizer *</label>
            <input
              type="text"
              required
              value={namaPelanggan}
              onChange={e => setNamaPelanggan(e.target.value)}
              placeholder="Contoh: Aris WO / Ibu Rina Susanti"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp / HP *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={noTelepon}
                onChange={e => setNoTelepon(e.target.value)}
                placeholder="08123456xxxx"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tgl Pinjam / Kirim</label>
              <input
                type="date"
                required
                value={tglSewa}
                onChange={e => setTglSewa(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tgl Rencana Kembali</label>
              <input
                type="date"
                required
                value={tglKembali}
                onChange={e => setTglKembali(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Gedung / Alamat Acara</label>
            <textarea
              rows={2}
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
              placeholder="Contoh: Gedung Graha Sarina Vidi, Jl. Magelang Km 8"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              placeholder="Tema wedding rustic autumn, pelaminan bunga mawar & pilar gold"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Kolom 2 & 3: Keranjang Barang */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-4">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-sm">Barang Dekorasi yang Disewa</h3>
                <p className="text-xs text-slate-400">Pilih bunga, daun, standing pilar, atau lampu dari database barang</p>
              </div>
              <div className="w-full sm:w-80">
                <select
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) {
                      addItemToCart(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-teal-50/80 border border-teal-200 text-teal-900 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">+ Pilih Bunga, Daun, atau Properti...</option>
                  {barangList.map(k => (
                    <option
                      key={k.kode}
                      value={k.kode}
                      disabled={k.stokTersedia <= 0}
                    >
                      [{k.kategori}] {k.kode} - {k.nama} {k.stokTersedia <= 0 ? '(HABIS)' : `(Sisa: ${k.stokTersedia} ${k.satuan})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto min-h-[220px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Kode & Nama Barang</th>
                    <th className="py-2.5 px-2">Kategori</th>
                    <th className="py-2.5 px-2 text-center">Tersedia</th>
                    <th className="py-2.5 px-2 text-center" style={{ width: '120px' }}>Qty Sewa</th>
                    <th className="py-2.5 px-2 text-center">Satuan</th>
                    <th className="py-2.5 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">Keranjang barang masih kosong</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Pilih bunga, daun, atau properti dari dropdown di atas.</p>
                      </td>
                    </tr>
                  ) : (
                    cart.map(item => (
                      <tr key={item.kode} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{item.nama}</div>
                          <div className="text-[10px] text-teal-700 font-mono">{item.kode}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-slate-600">
                          {item.stokTersedia}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="number"
                            min={1}
                            max={item.stokTersedia}
                            value={item.qty}
                            onChange={e => updateQty(item.kode, parseInt(e.target.value, 10) || 1)}
                            className="w-20 px-2 py-1 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="py-3 px-2 text-center font-medium text-slate-600">
                          {item.satuan}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.kode)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Cart View */}
            <div className="sm:hidden space-y-2.5">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                  <ShoppingCart className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700 text-xs">Keranjang masih kosong</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pilih barang dari dropdown di atas.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.kode} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate">{item.nama}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-teal-700">{item.kode}</span>
                        <span>•</span>
                        <span>Sisa: {item.stokTersedia} {item.satuan}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.kode, item.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.stokTersedia}
                        value={item.qty}
                        onChange={e => updateQty(item.kode, parseInt(e.target.value, 10) || 1)}
                        className="w-12 h-7 text-center font-bold text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQty(item.kode, item.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-100"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.kode)}
                        className="p-1.5 text-red-500 hover:text-red-700 ml-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left text-xs text-slate-600">
                <div>
                  Total Jenis Barang: <span className="font-bold text-slate-900">{cart.length} Item</span>
                  <span className="mx-2">·</span>
                  Total Kuantitas: <span className="font-bold text-teal-800 text-sm">{totalQtyBarang} Unit/Tangkai</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Stok tersedia di database barang akan otomatis dipotong setelah tombol diklik.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Kosongkan
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0 || isSubmitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-teal-600/25 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Proses & Kurangi Stok'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
