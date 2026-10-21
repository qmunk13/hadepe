import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  ShieldCheck,
  PackagePlus,
  Wrench,
  AlertTriangle,
  ArrowDownToLine,
  ChevronRight,
  X
} from 'lucide-react';
import { Penyewaan, Barang } from '../types';
import { toLusinPcs } from './DatabaseBarangView';

interface PengembalianViewProps {
  penyewaanList: Penyewaan[];
  barangList?: Barang[];
  initialNoSewa?: string;
  onClearInitialNoSewa?: () => void;
  onOpenTambahStok?: () => void;
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
  barangList = [],
  initialNoSewa,
  onClearInitialNoSewa,
  onOpenTambahStok,
  onSubmitReturn
}) => {
  const [activeMode, setActiveMode] = useState<'baru' | 'kembali' | 'rekondisi'>('kembali');

  // Mode 1: Masuk Baru search
  const [cariMasukBaru, setCariMasukBaru] = useState('');

  // Mode 2: Masuk Kembali state
  const [modalReturnSewa, setModalReturnSewa] = useState<Penyewaan | null>(null);
  const [returnItemsState, setReturnItemsState] = useState<Array<{
    idItem: string;
    kode: string;
    namaBarang: string;
    qtyKeluar: number;
    qtyBagus: number;
    qtyRusak: number;
    qtyHilang: number;
    catatan: string;
  }>>([]);
  const [tglKembaliInput, setTglKembaliInput] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mode 3: Masuk Rekondisi state
  const [modalRekondisiItem, setModalRekondisiItem] = useState<{
    kode: string;
    nama: string;
    antrianRusak: number;
  } | null>(null);
  const [qtyServiceLusin, setQtyServiceLusin] = useState(0);
  const [qtyServicePcs, setQtyServicePcs] = useState(0);
  const [catatanRekondisi, setCatatanRekondisi] = useState('');

  // Active rentals that still have outstanding items
  const activeRentals = useMemo(() => {
    return penyewaanList.filter(s => s.status === 'AKTIF' || s.status === 'SEBAGIAN');
  }, [penyewaanList]);

  // Open modal return for specific rental
  const handleOpenModalReturn = (sewa: Penyewaan) => {
    setModalReturnSewa(sewa);
    setTglKembaliInput(new Date().toISOString().slice(0, 10));
    setReturnItemsState(
      sewa.items.map(it => {
        const sisa = Math.max(0, it.qtySewa - (it.qtyKembaliBagus || 0) - (it.qtyRusak || 0) - (it.qtyHilang || 0));
        return {
          idItem: it.idItem,
          kode: it.kode,
          namaBarang: it.namaBarang,
          qtyKeluar: it.qtySewa,
          qtyBagus: sisa, // default all remaining are returned good
          qtyRusak: 0,
          qtyHilang: 0,
          catatan: 'Kembali dalam kondisi baik'
        };
      })
    );
  };

  const handleSubmitReturnForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalReturnSewa) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmitReturn({
        noSewa: modalReturnSewa.noSewa,
        namaPelanggan: modalReturnSewa.namaPelanggan,
        items: returnItemsState.map(it => ({
          idItem: it.idItem,
          qtyBagus: it.qtyBagus,
          qtyRusak: it.qtyRusak,
          qtyHilang: it.qtyHilang,
          denda: 0,
          catatan: it.catatan
        }))
      });

      if (success) {
        setModalReturnSewa(null);
        if (onClearInitialNoSewa) onClearInitialNoSewa();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock list for Mode 3: antrian rekondisi
  const antrianRekondisiList = useMemo(() => {
    return barangList
      .filter(b => b.stokTotal > b.stokTersedia + b.stokDisewa)
      .map(b => ({
        kode: b.kode,
        nama: b.nama,
        kategori: b.kategori,
        jenis: b.jenis || '-',
        antrianRusak: Math.max(0, b.stokTotal - b.stokTersedia - b.stokDisewa)
      }))
      .filter(x => x.antrianRusak > 0);
  }, [barangList]);

  // Filtered barang for Mode 1
  const filteredMasukBaru = useMemo(() => {
    const q = cariMasukBaru.trim().toLowerCase();
    if (!q) return barangList;
    return barangList.filter(b => 
      b.kode.toLowerCase().includes(q) ||
      b.nama.toLowerCase().includes(q) ||
      (b.jenis && b.jenis.toLowerCase().includes(q)) ||
      b.kategori.toLowerCase().includes(q)
    );
  }, [cariMasukBaru, barangList]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar with 3 Modes */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-teal-200">Operasional Inventaris</div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2 mt-0.5">
            <span>📥 Masuk Barang (3 Alur Terpisah)</span>
          </h2>
          <p className="text-xs text-teal-100/90 mt-1">
            Pemisahan alur pencatatan: Pembelian Baru, Pengembalian Sewa, dan Hasil Rekondisi/Service.
          </p>
        </div>

        {/* 3 Mode Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('baru')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'baru' 
                ? 'bg-white text-teal-900 shadow-md' 
                : 'bg-teal-700/60 hover:bg-teal-700 text-white'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>1. Masuk Baru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('kembali')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'kembali' 
                ? 'bg-white text-teal-900 shadow-md' 
                : 'bg-teal-700/60 hover:bg-teal-700 text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>2. Masuk Kembali</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('rekondisi')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'rekondisi' 
                ? 'bg-white text-teal-900 shadow-md' 
                : 'bg-teal-700/60 hover:bg-teal-700 text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Masuk Rekondisi</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MASUK BARU (PEMBELIAN DARI SUPPLIER)                              */}
      {/* ========================================================================= */}
      {activeMode === 'baru' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>1. Masuk Baru (Pembelian Supplier & Restok)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih barang untuk menambah stok dari faktur pembelian supplier.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kode / nama / jenis..."
                  value={cariMasukBaru}
                  onChange={(e) => setCariMasukBaru(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              {onOpenTambahStok && (
                <button
                  type="button"
                  onClick={onOpenTambahStok}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>+ Masuk Beli</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3 text-right">Stok Fisik Saat Ini</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMasukBaru.map(b => {
                  const lp = toLusinPcs(b.stokTersedia);
                  return (
                    <tr key={b.kode} className="hover:bg-teal-50/50 transition">
                      <td className="p-3 font-mono font-bold text-teal-800">{b.kode}</td>
                      <td className="p-3 font-bold text-slate-900">{b.nama}</td>
                      <td className="p-3 text-slate-600">{b.kategori}</td>
                      <td className="p-3 text-slate-600">{b.jenis || '-'}</td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {lp.lusin} L + {lp.pcs} P <span className="text-[10px] text-slate-400">({b.stokTersedia} {b.satuan})</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={onOpenTambahStok}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          + Beli
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MASUK KEMBALI (PENGEMBALIAN SEWA PELANGGAN/WO)                    */}
      {/* ========================================================================= */}
      {activeMode === 'kembali' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              2. Masuk Kembali (Barang Sewa Selesai Acara)
            </h3>
            <p className="text-xs text-slate-500">
              Daftar transaksi penyewaan yang aktif di lokasi acara dan siap untuk dikembalikan ke gudang.
            </p>
          </div>

          {activeRentals.length === 0 ? (
            <div className="py-12 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <div className="font-bold text-sm">Semua barang sewa telah kembali ke gudang!</div>
              <div className="text-xs text-emerald-600">Tidak ada transaksi sewa aktif yang tertunggak saat ini.</div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">No. Sewa / Keluar</th>
                    <th className="p-3">Pelanggan / WO</th>
                    <th className="p-3">Tgl Sewa</th>
                    <th className="p-3">Rencana Kembali</th>
                    <th className="p-3 text-center">Total Item</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeRentals.map(s => (
                    <tr key={s.noSewa} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-teal-800">{s.noSewa}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{s.namaPelanggan}</div>
                        <div className="text-[10px] text-slate-400">{s.noTelepon}</div>
                      </td>
                      <td className="p-3 text-slate-600">{s.tglSewa || '-'}</td>
                      <td className="p-3 text-slate-600 font-semibold">{s.tglKembali || '-'}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{s.totalQty} Item</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenModalReturn(s)}
                          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>↩️ Kembalikan</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: MASUK REKONDISI (BARANG RUSAK SELESAI REPARASI)                    */}
      {/* ========================================================================= */}
      {activeMode === 'rekondisi' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              3. Masuk Rekondisi / Hasil Service Workshop
            </h3>
            <p className="text-xs text-slate-500">
              Daftar barang rusak yang masuk antrean perbaikan. Klik "Masuk Stok" untuk mengembalikan barang selesai servis ke stok siap pakai.
            </p>
          </div>

          {antrianRekondisiList.length === 0 ? (
            <div className="py-12 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600" />
              <div className="font-bold text-sm">Tidak ada antrean barang rusak saat ini!</div>
              <div className="text-xs text-emerald-600">Seluruh unit dekorasi dalam kondisi prima siap sewa.</div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Jenis</th>
                    <th className="p-3 text-right">Antrian Rusak</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {antrianRekondisiList.map(item => {
                    const lp = toLusinPcs(item.antrianRusak);
                    return (
                      <tr key={item.kode} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-teal-800">{item.kode}</td>
                        <td className="p-3 font-bold text-slate-900">{item.nama}</td>
                        <td className="p-3 text-slate-600">{item.kategori}</td>
                        <td className="p-3 text-slate-600">{item.jenis}</td>
                        <td className="p-3 text-right font-bold text-rose-700">
                          {lp.lusin} L + {lp.pcs} P <span className="text-[10px] text-slate-400">({item.antrianRusak} Pcs)</span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setModalRekondisiItem(item);
                              setQtyServiceLusin(lp.lusin);
                              setQtyServicePcs(lp.pcs);
                              setCatatanRekondisi('Selesai diperbaiki & dicuci bersih');
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Masuk Stok
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL RETURN FORM (PENGEMBALIAN PINAR - BAGUS, RUSAK, HILANG)             */}
      {/* ========================================================================= */}
      {modalReturnSewa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">↩️ Proses Pengembalian Sewa</h3>
                <p className="text-xs text-slate-400">
                  {modalReturnSewa.noSewa} · Pelanggan: <strong>{modalReturnSewa.namaPelanggan}</strong>
                </p>
              </div>
              <button 
                onClick={() => setModalReturnSewa(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturnForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Realisasi Kembali *</label>
                <input
                  type="date"
                  required
                  value={tglKembaliInput}
                  onChange={(e) => setTglKembaliInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700">Pilah Kondisi Barang Kembali:</div>
                {returnItemsState.map((it, idx) => (
                  <div key={it.idItem} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{it.namaBarang}</span>
                        <span className="font-mono text-teal-700 ml-1.5">({it.kode})</span>
                      </div>
                      <span className="text-slate-500 font-semibold">Keluar: {it.qtyKeluar} Pcs</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-800 mb-1 text-center">Bagus (Pcs)</label>
                        <input
                          type="number"
                          min="0"
                          value={it.qtyBagus}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = [...returnItemsState];
                            updated[idx].qtyBagus = val;
                            setReturnItemsState(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-800 mb-1 text-center">Rusak (Pcs)</label>
                        <input
                          type="number"
                          min="0"
                          value={it.qtyRusak}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = [...returnItemsState];
                            updated[idx].qtyRusak = val;
                            setReturnItemsState(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-xl text-center text-xs font-bold text-amber-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-rose-800 mb-1 text-center">Hilang (Pcs)</label>
                        <input
                          type="number"
                          min="0"
                          value={it.qtyHilang}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = [...returnItemsState];
                            updated[idx].qtyHilang = val;
                            setReturnItemsState(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-rose-300 rounded-xl text-center text-xs font-bold text-rose-800"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Keterangan kondisi / catatan denda..."
                        value={it.catatan}
                        onChange={(e) => {
                          const updated = [...returnItemsState];
                          updated[idx].catatan = e.target.value;
                          setReturnItemsState(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalReturnSewa(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Pengembalian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL REKONDISI SELESAI                                                   */}
      {/* ========================================================================= */}
      {modalRekondisiItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">🔧 Selesai Servis Rekondisi</h3>
                <p className="text-xs text-slate-400">{modalRekondisiItem.nama} ({modalRekondisiItem.kode})</p>
              </div>
              <button 
                onClick={() => setModalRekondisiItem(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              Antrean rusak saat ini: <strong>{modalRekondisiItem.antrianRusak} Pcs</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lusin Selesai</label>
                <input
                  type="number"
                  min="0"
                  value={qtyServiceLusin}
                  onChange={(e) => setQtyServiceLusin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pcs Selesai</label>
                <input
                  type="number"
                  min="0"
                  value={qtyServicePcs}
                  onChange={(e) => setQtyServicePcs(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pengerjaan</label>
              <input
                type="text"
                value={catatanRekondisi}
                onChange={(e) => setCatatanRekondisi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalRekondisiItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Berhasil: ${qtyServiceLusin * 12 + qtyServicePcs} Pcs ${modalRekondisiItem.nama} masuk kembali ke stok tersedia.`);
                  setModalRekondisiItem(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Masuk Stok
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
