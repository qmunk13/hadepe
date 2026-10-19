import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { Penyewaan } from '../types';

interface ReturnItemState {
  kode: string;
  namaBarang: string;
  qtySewa: number;
  qtyBagus: number;
  qtyRusak: number;
  qtyHilang: number;
  denda: number;
  catatan: string;
}

interface PengembalianViewProps {
  penyewaanList: Penyewaan[];
  initialNoSewa?: string;
  onClearInitialNoSewa?: () => void;
  onSubmitReturn: (payload: {
    noSewa: string;
    namaPelanggan: string;
    items: Array<{
      idItem: string;
      qtyBagus: number;
      qtyRusak: number;
      qtyHilang: number;
      denda: number;
      catatan?: string;
    }>;
  }) => Promise<boolean>;
}

export const PengembalianView: React.FC<PengembalianViewProps> = ({
  penyewaanList,
  initialNoSewa,
  onClearInitialNoSewa,
  onSubmitReturn
}) => {
  const [searchNoSewa, setSearchNoSewa] = useState(initialNoSewa || '');
  const [selectedSewa, setSelectedSewa] = useState<Penyewaan | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRentals = penyewaanList.filter(s => s.status === 'AKTIF');

  useEffect(() => {
    if (initialNoSewa) {
      setSearchNoSewa(initialNoSewa);
      loadSewaDetail(initialNoSewa);
    }
  }, [initialNoSewa, penyewaanList]);

  const loadSewaDetail = (noSewa: string) => {
    const found = penyewaanList.find(s => s.noSewa.toUpperCase() === noSewa.trim().toUpperCase());
    if (found) {
      setSelectedSewa(found);
      setReturnItems(found.items.map(it => ({
        kode: it.kode,
        namaBarang: it.namaBarang,
        qtySewa: it.qtySewa,
        qtyBagus: it.qtySewa,
        qtyRusak: 0,
        qtyHilang: 0,
        denda: 0,
        catatan: ''
      })));
    } else {
      setSelectedSewa(null);
      setReturnItems([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNoSewa.trim()) return;
    loadSewaDetail(searchNoSewa);
  };

  const setAllGood = () => {
    setReturnItems(prev => prev.map(it => ({
      ...it,
      qtyBagus: it.qtySewa,
      qtyRusak: 0,
      qtyHilang: 0,
      denda: 0,
      catatan: 'Kembali lengkap dan kondisi bagus'
    })));
  };

  const updateItemReturn = (index: number, field: keyof ReturnItemState, val: any) => {
    setReturnItems(prev => {
      const copy = [...prev];
      const target = { ...copy[index] };
      if (field === 'catatan') {
        target.catatan = String(val);
      } else if (field === 'denda') {
        target.denda = Number(val) || 0;
      } else {
        const num = Math.max(0, Number(val) || 0);
        (target as any)[field] = num;
        if (field === 'qtyRusak' || field === 'qtyHilang') {
          const sisa = Math.max(0, target.qtySewa - (target.qtyRusak + target.qtyHilang));
          target.qtyBagus = sisa;
        } else if (field === 'qtyBagus') {
          if (target.qtyBagus + target.qtyRusak + target.qtyHilang > target.qtySewa) {
            target.qtyRusak = 0;
            target.qtyHilang = Math.max(0, target.qtySewa - target.qtyBagus);
          }
        }
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!selectedSewa) return;
    for (const it of returnItems) {
      if (it.qtyBagus + it.qtyRusak + it.qtyHilang !== it.qtySewa) {
        alert(`Kuantitas untuk ${it.namaBarang} belum seimbang! Total Bagus (${it.qtyBagus}) + Rusak (${it.qtyRusak}) + Hilang (${it.qtyHilang}) harus = ${it.qtySewa}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const ok = await onSubmitReturn({
        noSewa: selectedSewa.noSewa,
        namaPelanggan: selectedSewa.namaPelanggan,
        items: returnItems.map((it, idx) => {
          const lineItem = selectedSewa.items[idx];
          return {
            idItem: lineItem?.idItem || `ITM-${selectedSewa.noSewa}-${idx + 1}`,
            qtyBagus: it.qtyBagus,
            qtyRusak: it.qtyRusak,
            qtyHilang: it.qtyHilang,
            denda: it.denda,
            catatan: it.catatan
          };
        })
      });
      if (ok) {
        setSelectedSewa(null);
        setReturnItems([]);
        setSearchNoSewa('');
        if (onClearInitialNoSewa) onClearInitialNoSewa();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-900">Form Pengembalian Sewa Pintar (Smart Return)</h2>
          <p className="text-xs text-slate-500">
            Pemeriksaan kondisi barang: <span className="text-emerald-700 font-bold">Qty Bagus</span> menambah stok kembali, sedangkan <span className="text-amber-700 font-bold">Rusak / Hilang</span> dicatat tanpa menambah stok.
          </p>
        </div>
        {activeRentals.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedSewa?.noSewa || ''}
              onChange={e => {
                if (e.target.value) {
                  setSearchNoSewa(e.target.value);
                  loadSewaDetail(e.target.value);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="">Pilih dari {activeRentals.length} Sewa Aktif...</option>
              {activeRentals.map(s => (
                <option key={s.noSewa} value={s.noSewa}>
                  {s.noSewa} - {s.namaPelanggan}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchNoSewa}
              onChange={e => setSearchNoSewa(e.target.value)}
              placeholder="Masukkan nomor sewa lengkap (contoh: SEWA-20261016-1042)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
          >
            Cari Data Sewa
          </button>
        </form>
      </div>

      {/* Selected Rental Card & Return Form */}
      {selectedSewa ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400">Nomor Sewa:</span>
              <span className="font-bold text-teal-800 font-mono ml-1.5 text-sm">{selectedSewa.noSewa}</span>
            </div>
            <div>
              <span className="text-slate-400">Penyewa:</span>
              <span className="font-bold text-slate-800 ml-1.5">{selectedSewa.namaPelanggan}</span>
              <span className="text-slate-400 ml-1">({selectedSewa.noTelepon})</span>
            </div>
            <div>
              <span className="text-slate-400">Tanggal Sewa:</span>
              <span className="font-medium text-slate-800 ml-1.5">
                {new Date(selectedSewa.tglSewa || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>
              <span className={`ml-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                selectedSewa.status === 'AKTIF' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {selectedSewa.status}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm">Evaluasi Kondisi Barang Dikembalikan</h3>
              <p className="text-xs text-slate-400">Periksa kuantitas fisik yang kembali dalam kondisi bagus, rusak, atau hilang</p>
            </div>
            <button
              type="button"
              onClick={setAllGood}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Set Semua Kembali Bagus (100%)</span>
            </button>
          </div>

          {/* Tampilan Desktop: Tabel */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Kode & Nama Barang</th>
                  <th className="py-2.5 px-2 text-center">Qty Sewa</th>
                  <th className="py-2.5 px-2 text-center bg-emerald-50 text-emerald-800 font-bold">Qty Bagus (+)</th>
                  <th className="py-2.5 px-2 text-center bg-amber-50 text-amber-800 font-bold">Qty Rusak (0)</th>
                  <th className="py-2.5 px-2 text-center bg-red-50 text-red-800 font-bold">Qty Hilang (0)</th>
                  <th className="py-2.5 px-3">Catatan Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnItems.map((it, idx) => (
                  <tr key={it.kode} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{it.namaBarang}</div>
                      <div className="text-[10px] text-teal-700 font-mono">{it.kode}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-800 text-sm">
                      {it.qtySewa}
                    </td>
                    <td className="py-3 px-2 text-center bg-emerald-50/30">
                      <input
                        type="number"
                        min={0}
                        max={it.qtySewa}
                        value={it.qtyBagus}
                        onChange={e => updateItemReturn(idx, 'qtyBagus', e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-emerald-300 rounded-lg text-xs text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </td>
                    <td className="py-3 px-2 text-center bg-amber-50/30">
                      <input
                        type="number"
                        min={0}
                        max={it.qtySewa}
                        value={it.qtyRusak}
                        onChange={e => updateItemReturn(idx, 'qtyRusak', e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-amber-300 rounded-lg text-xs text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </td>
                    <td className="py-3 px-2 text-center bg-red-50/30">
                      <input
                        type="number"
                        min={0}
                        max={it.qtySewa}
                        value={it.qtyHilang}
                        onChange={e => updateItemReturn(idx, 'qtyHilang', e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-red-300 rounded-lg text-xs text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={it.catatan}
                        onChange={e => updateItemReturn(idx, 'catatan', e.target.value)}
                        placeholder="Contoh: Dahan patah / pot retak"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tampilan Khusus Mobile / HP */}
          <div className="md:hidden space-y-3">
            {returnItems.map((it, idx) => (
              <div key={it.kode} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-snug">{it.namaBarang}</div>
                    <div className="text-[10px] text-teal-700 font-mono mt-0.5">{it.kode}</div>
                  </div>
                  <div className="px-2 py-1 bg-teal-50 text-teal-800 rounded-lg text-xs font-bold shrink-0">
                    Sewa: {it.qtySewa}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-200 text-center">
                    <label className="block text-[10px] font-bold text-emerald-800 mb-1">Bagus (+)</label>
                    <input
                      type="number"
                      min={0}
                      max={it.qtySewa}
                      value={it.qtyBagus}
                      onChange={e => updateItemReturn(idx, 'qtyBagus', e.target.value)}
                      className="w-full py-1 text-center font-bold text-sm bg-white border border-emerald-300 rounded-lg text-emerald-800 focus:outline-none"
                    />
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-200 text-center">
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">Rusak</label>
                    <input
                      type="number"
                      min={0}
                      max={it.qtySewa}
                      value={it.qtyRusak}
                      onChange={e => updateItemReturn(idx, 'qtyRusak', e.target.value)}
                      className="w-full py-1 text-center font-bold text-sm bg-white border border-amber-300 rounded-lg text-amber-800 focus:outline-none"
                    />
                  </div>
                  <div className="bg-red-50/60 p-2 rounded-xl border border-red-200 text-center">
                    <label className="block text-[10px] font-bold text-red-800 mb-1">Hilang</label>
                    <input
                      type="number"
                      min={0}
                      max={it.qtySewa}
                      value={it.qtyHilang}
                      onChange={e => updateItemReturn(idx, 'qtyHilang', e.target.value)}
                      className="w-full py-1 text-center font-bold text-sm bg-white border border-red-300 rounded-lg text-red-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={it.catatan}
                    onChange={e => updateItemReturn(idx, 'catatan', e.target.value)}
                    placeholder="Catatan kondisi (opsional)..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Logika Stok Otomatis:</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hanya barang dengan status <b className="text-emerald-700">Qty Bagus</b> yang kembali menambah stok tersedia di <b>Database Gudang</b>.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengembalian & Perbarui Stok'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Belum ada sewa yang dipilih</p>
          <p className="text-xs text-slate-400 mt-1">Cari nomor sewa di atas atau pilih dari daftar sewa aktif untuk memeriksa barang kembali.</p>
        </div>
      )}
    </div>
  );
};
