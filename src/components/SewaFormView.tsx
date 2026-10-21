import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Calendar, 
  User, 
  Phone, 
  FileCheck,
  CheckCircle2,
  ChevronLeft,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Check
} from 'lucide-react';
import { Barang, Pelanggan } from '../types';
import { toLusinPcs, formatLusinPcs } from './DatabaseBarangView';

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

  // Form inputs
  const [tglKeluar, setTglKeluar] = useState(now.toISOString().slice(0, 10));
  const [tglRencanaKembali, setTglRencanaKembali] = useState(duaHari.toISOString().slice(0, 10));
  const [selectedPelangganNama, setSelectedPelangganNama] = useState('');
  const [catatan, setCatatan] = useState('');
  const [qtyLusin, setQtyLusin] = useState(0);
  const [qtyPcs, setQtyPcs] = useState(0);

  // 3-Level hierarchy selection
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedJenis, setSelectedJenis] = useState<string>('');
  const [searchLevel3, setSearchLevel3] = useState<string>('');
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [lastCreatedNoSewa, setLastCreatedNoSewa] = useState<string | null>(null);

  // Handle preselectedKode from Database View
  useEffect(() => {
    if (preselectedKode) {
      const b = barangList.find(x => x.kode.toUpperCase() === preselectedKode.toUpperCase());
      if (b) {
        setSelectedCat(b.kategori || '');
        setSelectedJenis(b.jenis || '');
        setSelectedBarang(b);
        setQtyLusin(0);
        setQtyPcs(1);
      }
    }
  }, [preselectedKode, barangList]);

  // Categories list
  const categories = useMemo(() => {
    const raw = barangList.map(b => b.kategori).filter(Boolean);
    const unique = Array.from(new Set(raw.map(s => s.trim()))).filter(Boolean);
    return unique.length > 0 ? unique : ['Bunga', 'Daun', 'Properti', 'Aksesoris', 'Lainnya'];
  }, [barangList]);

  // Jenis list for selected category
  const jenisList = useMemo(() => {
    if (!selectedCat) return [];
    const norm = selectedCat.trim().toLowerCase();
    const items = barangList.filter(b => (b.kategori || '').trim().toLowerCase() === norm);
    const setJ = new Set<string>();
    items.forEach(b => {
      if (b.jenis && b.jenis.trim()) setJ.add(b.jenis.trim());
    });
    return Array.from(setJ);
  }, [selectedCat, barangList]);

  // Available items in Level 3 with stock > 0
  const availableItems = useMemo(() => {
    if (!selectedCat || !selectedJenis) return [];
    const normCat = selectedCat.trim().toLowerCase();
    const normJns = selectedJenis.trim().toLowerCase();
    const q = searchLevel3.trim().toLowerCase();

    return barangList
      .filter(b => (b.kategori || '').trim().toLowerCase() === normCat &&
                   (b.jenis || '').trim().toLowerCase() === normJns &&
                   (b.stokTersedia > 0))
      .filter(b => !q || b.kode.toLowerCase().includes(q) || b.nama.toLowerCase().includes(q));
  }, [selectedCat, selectedJenis, searchLevel3, barangList]);

  const totalQtyRequested = qtyLusin * 12 + qtyPcs;

  const handlePilihBarang = (b: Barang) => {
    setSelectedBarang(b);
    setQtyLusin(0);
    setQtyPcs(1);
    // Smooth scroll to form panel
    const formEl = document.getElementById('panelFormKeluar');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang) {
      alert('Pilih barang yang akan dikeluarkan terlebih dahulu.');
      return;
    }
    if (!selectedPelangganNama.trim()) {
      alert('Pilih pelanggan / wedding organizer terlebih dahulu.');
      return;
    }
    if (totalQtyRequested <= 0) {
      alert('Jumlah keluar (Lusin + Pcs) harus lebih dari 0.');
      return;
    }
    if (totalQtyRequested > selectedBarang.stokTersedia) {
      alert(`Stok tersedia hanya ${selectedBarang.stokTersedia} Pcs (${toLusinPcs(selectedBarang.stokTersedia).lusin} L + ${toLusinPcs(selectedBarang.stokTersedia).pcs} P).`);
      return;
    }

    const pel = pelangganList.find(p => p.nama === selectedPelangganNama);

    setSubmitting(true);
    try {
      const noSewa = await onSubmitSewa({
        namaPelanggan: selectedPelangganNama,
        noTelepon: pel?.noTelepon || '-',
        alamat: pel?.alamat || 'Lokasi Venue Acara',
        tglSewa: tglKeluar,
        tglKembali: tglRencanaKembali,
        catatan: `Keluar ${qtyLusin} Lusin + ${qtyPcs} Pcs = ${totalQtyRequested} Pcs. ${catatan}`.trim(),
        items: [{
          kode: selectedBarang.kode,
          qtySewa: totalQtyRequested
        }]
      });

      if (noSewa) {
        setLastCreatedNoSewa(noSewa);
        // Reset state
        setSelectedBarang(null);
        setQtyLusin(0);
        setQtyPcs(0);
        setCatatan('');
        if (onClearPreselected) onClearPreselected();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-teal-700 font-bold">Operasional Gudang</div>
          <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <span>📤 Keluar Barang (Sewa & Pemakaian)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Alur pemilihan terstruktur: Kategori &rarr; Jenis &rarr; Pilih Barang Gudang &rarr; Form Keluar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCat && selectedJenis && (
            <button
              onClick={() => setIsTableView(!isTableView)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {isTableView ? <LayoutGrid className="w-4 h-4 text-teal-700" /> : <TableIcon className="w-4 h-4 text-teal-700" />}
              <span>{isTableView ? 'Tampilan Kartu' : 'Tampilan Tabel'}</span>
            </button>
          )}

          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
            1 Lusin = 12 Pcs
          </span>
        </div>
      </div>

      {/* Success Notification Banner after submission */}
      {lastCreatedNoSewa && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Transaksi Keluar berhasil dicatat dengan nomor: <strong className="font-mono text-sm">{lastCreatedNoSewa}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenInvoice(lastCreatedNoSewa)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition cursor-pointer"
            >
              Cetak Surat Jalan / SPK
            </button>
            <button
              onClick={() => setLastCreatedNoSewa(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 1: PILIH KATEGORI                                                  */}
      {/* ========================================================================= */}
      {!selectedCat && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pilih Kategori Barang:</h3>
              <p className="text-xs text-slate-500">Mulai dari kategori barang yang ingin dikeluarkan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((kat) => {
              const items = barangList.filter(b => (b.kategori || '').trim().toLowerCase() === kat.trim().toLowerCase());
              const readyStock = items.reduce((sum, curr) => sum + Number(curr.stokTersedia || 0), 0);
              const { lusin, pcs } = toLusinPcs(readyStock);

              return (
                <button
                  key={kat}
                  onClick={() => {
                    setSelectedCat(kat);
                    setSelectedJenis('');
                    setSelectedBarang(null);
                  }}
                  className="p-5 bg-white border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/70 rounded-3xl text-left transition group shadow-2xs cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl font-bold">
                      📦
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      {lusin}L + {pcs}P Ready
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-800">
                      {kat}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {items.length} jenis barang terdaftar
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: PILIH JENIS BARANG                                               */}
      {/* ========================================================================= */}
      {selectedCat && !selectedJenis && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => {
                setSelectedCat('');
                setSelectedBarang(null);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span>Kembali ke Kategori</span>
            </button>
            <div className="font-serif font-bold text-teal-800 text-base">
              Kategori: {selectedCat}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {jenisList.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                Tidak ada jenis barang pada kategori ini.
              </div>
            ) : (
              jenisList.map((jns) => {
                const normCat = selectedCat.trim().toLowerCase();
                const normJns = jns.trim().toLowerCase();
                const items = barangList.filter(
                  b => (b.kategori || '').trim().toLowerCase() === normCat &&
                       (b.jenis || '').trim().toLowerCase() === normJns &&
                       b.stokTersedia > 0
                );
                const totalReady = items.reduce((sum, curr) => sum + Number(curr.stokTersedia || 0), 0);
                const { lusin, pcs } = toLusinPcs(totalReady);

                return (
                  <button
                    key={jns}
                    onClick={() => {
                      setSelectedJenis(jns);
                      setSearchLevel3('');
                    }}
                    className="p-4 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/70 rounded-2xl text-left transition flex justify-between items-center cursor-pointer shadow-2xs group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-teal-800">
                        {jns}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {items.length} Barang Ready ({lusin}L + {pcs}P)
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-teal-700 font-bold text-sm">➔</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: DAFTAR BARANG TERSEDIA & FORM KELUAR                             */}
      {/* ========================================================================= */}
      {selectedCat && selectedJenis && (
        <div className="space-y-5">
          
          {/* Breadcrumb & Navigation */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedJenis('');
                  setSelectedBarang(null);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Pilih Jenis</span>
              </button>

              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span 
                  onClick={() => { setSelectedCat(''); setSelectedJenis(''); setSelectedBarang(null); }}
                  className="cursor-pointer hover:underline text-slate-600"
                >
                  Kategori
                </span>
                <span>&rsaquo;</span>
                <span 
                  onClick={() => { setSelectedJenis(''); setSelectedBarang(null); }}
                  className="cursor-pointer hover:underline text-slate-600"
                >
                  {selectedCat}
                </span>
                <span>&rsaquo;</span>
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                  {selectedJenis}
                </span>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari barang ready..."
                value={searchLevel3}
                onChange={(e) => setSearchLevel3(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 focus:bg-white"
              />
            </div>
          </div>

          {/* List Barang Level 3 */}
          {availableItems.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Tidak ada stok barang yang tersedia (ready) untuk jenis ini.
            </div>
          ) : isTableView ? (
            /* Tabel Level 3 */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[800px]">
                  <thead className="bg-slate-100/80 uppercase text-slate-600 font-semibold border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-3 px-3 text-center w-12">Foto</th>
                      <th className="py-3 px-3">Kode</th>
                      <th className="py-3 px-3">Nama Barang</th>
                      <th className="py-3 px-2 text-right">Stok Tersedia</th>
                      <th className="py-3 px-3">Lokasi</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {availableItems.map((b) => {
                      const lp = toLusinPcs(b.stokTersedia);
                      const isChosen = selectedBarang?.kode === b.kode;
                      return (
                        <tr key={b.kode} className={`transition ${isChosen ? 'bg-teal-50/80' : 'hover:bg-slate-50'}`}>
                          <td className="py-2.5 px-3 text-center">
                            <img
                              src={b.fotoUrl || fallbackImage}
                              alt={b.nama}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 inline-block shadow-2xs"
                              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{b.kode}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{b.nama}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-emerald-700">
                            {lp.lusin} L + {lp.pcs} P <span className="text-[10px] text-slate-400">({b.stokTersedia} {b.satuan})</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{b.lokasiRak || '-'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handlePilihBarang(b)}
                              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                                isChosen ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-teal-700 hover:bg-teal-800 text-white'
                              }`}
                            >
                              {isChosen ? '✓ Terpilih' : 'Pilih'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Kartu Level 3 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableItems.map((b) => {
                const lp = toLusinPcs(b.stokTersedia);
                const isChosen = selectedBarang?.kode === b.kode;
                return (
                  <div
                    key={b.kode}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between ${
                      isChosen ? 'border-2 border-teal-600 ring-2 ring-teal-100' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="h-40 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                        <img
                          src={b.fotoUrl || fallbackImage}
                          alt={b.nama}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                        <span className="font-mono font-bold text-teal-800">{b.kode}</span>
                        <span className="text-[10px] text-slate-400">{b.satuan || 'Pcs'}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{b.nama}</h4>
                      <div className="mt-3 p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-center font-bold text-xs">
                        Tersedia: {lp.lusin} Lusin + {lp.pcs} Pcs ({b.stokTersedia} {b.satuan})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePilihBarang(b)}
                      className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        isChosen ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-teal-700 hover:bg-teal-800 text-white'
                      }`}
                    >
                      {isChosen ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Barang Terpilih</span>
                        </>
                      ) : (
                        <span>📤 Pilih untuk Keluar</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORM KELUAR PANEL: MUNCUL SAAT BARANG SUDAH DIPILIH                      */}
          {/* ========================================================================= */}
          {selectedBarang && (
            <div id="panelFormKeluar" className="bg-white rounded-3xl border-2 border-teal-600 shadow-xl overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-teal-200">Barang Keluar Terpilih</div>
                  <h3 className="font-bold text-base sm:text-lg">{selectedBarang.nama}</h3>
                  <div className="text-xs text-teal-100 font-mono mt-0.5">
                    {selectedBarang.kode} · {selectedBarang.kategori} · {selectedBarang.jenis}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBarang(null)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Ganti Barang
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
                
                {/* Info Barcode / Lokasi & Stok */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Lokasi Rak Gudang:</span>
                    <span className="font-bold text-slate-800 ml-1.5">{selectedBarang.lokasiRak || 'Gudang Utama'}</span>
                  </div>
                  <div className="text-emerald-700 font-bold">
                    Stok Tersedia: {toLusinPcs(selectedBarang.stokTersedia).lusin} Lusin + {toLusinPcs(selectedBarang.stokTersedia).pcs} Pcs ({selectedBarang.stokTersedia} {selectedBarang.satuan})
                  </div>
                </div>

                {/* Grid Inputs: Tanggal & Pelanggan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Keluar *</label>
                    <input
                      type="date"
                      required
                      value={tglKeluar}
                      onChange={(e) => setTglKeluar(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pelanggan / WO *</label>
                    <select
                      required
                      value={selectedPelangganNama}
                      onChange={(e) => setSelectedPelangganNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700 focus:bg-white"
                    >
                      <option value="">-- Pilih Pelanggan / WO --</option>
                      {pelangganList.map((p) => (
                        <option key={p.id} value={p.nama}>{p.nama} ({p.kategori || 'WO'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Rencana Kembali *</label>
                    <input
                      type="date"
                      required
                      value={tglRencanaKembali}
                      onChange={(e) => setTglRencanaKembali(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-700 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Grid Inputs: Lusin & Pcs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 text-center">Jumlah - Lusin (x12)</label>
                    <input
                      type="number"
                      min="0"
                      value={qtyLusin}
                      onChange={(e) => setQtyLusin(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 text-center">Jumlah - Sisa Pcs</label>
                    <input
                      type="number"
                      min="0"
                      value={qtyPcs}
                      onChange={(e) => setQtyPcs(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="p-2.5 rounded-xl bg-white border border-teal-200 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Dikeluarkan</div>
                      <div className="text-sm font-extrabold text-teal-800">
                        {totalQtyRequested} {selectedBarang.satuan || 'Pcs'}
                      </div>
                      <div className="text-[10px] text-teal-600 font-semibold">
                        ({qtyLusin} Lusin + {qtyPcs} Pcs)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan / Keterangan Event */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Acara / Lokasi Venue</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pemakaian pelaminan Gedung Graha Sarina Vidi. Loading dock pagi."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 focus:bg-white"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting || totalQtyRequested <= 0}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Menyimpan...' : 'Simpan Transaksi Keluar & Potong Stok'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
