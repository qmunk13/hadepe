import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ArrowDownToLine, 
  ShoppingCart,
  MapPin, 
  Flower2, 
  X, 
  Edit2, 
  Trash2,
  ChevronLeft,
  LayoutGrid,
  Table as TableIcon,
  Tag
} from 'lucide-react';
import { Barang } from '../types';
import { EditBarangModal } from './EditBarangModal';

interface DatabaseBarangViewProps {
  barangList: Barang[];
  onOpenTambahBarang: () => void;
  onOpenTambahStok: () => void;
  onDirectSewa: (kode: string) => void;
  onEditBarang: (kode: string, data: Partial<Barang>) => Promise<boolean>;
  onHapusBarang: (kode: string) => Promise<boolean>;
  kategoriMasterList?: string[];
  jenisMasterList?: string[];
  satuanMasterList?: string[];
  lokasiMasterList?: string[];
}

export function toLusinPcs(qty: number) {
  const q = Math.max(0, Number(qty || 0));
  return { lusin: Math.floor(q / 12), pcs: q % 12 };
}

export function formatLusinPcs(qty: number) {
  const { lusin, pcs } = toLusinPcs(qty);
  return `${lusin} L + ${pcs} P (${qty} Pcs)`;
}

const THEME_KATEGORI: Record<string, { bg: string; border: string; text: string; badge: string; icon: string }> = {
  'Aksesoris': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-800', icon: '✨' },
  'Bunga':     { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800', icon: '🌸' },
  'Daun':      { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', icon: '🍃' },
  'Properti':  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', icon: '📦' },
  'Lainnya':   { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800', icon: '🧰' },
  'DEFAULT':   { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800', icon: '🏷️' }
};

export const DatabaseBarangView: React.FC<DatabaseBarangViewProps> = ({
  barangList,
  onOpenTambahBarang,
  onOpenTambahStok,
  onDirectSewa,
  onEditBarang,
  onHapusBarang,
  kategoriMasterList = [],
  jenisMasterList = [],
  satuanMasterList = [],
  lokasiMasterList = []
}) => {
  // 3-Level hierarchy states
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedJenis, setSelectedJenis] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const [zoomFoto, setZoomFoto] = useState<{ url: string; nama: string; kode: string } | null>(null);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);

  // Kategori List (Gabungan master & barang yang ada)
  const listKategori = useMemo(() => {
    const raw = [
      ...kategoriMasterList,
      ...barangList.map(b => b.kategori).filter(Boolean)
    ];
    const unique = Array.from(new Set(raw.map(s => s.trim()))).filter(Boolean);
    return unique.length > 0 ? unique : ['Bunga', 'Daun', 'Properti', 'Aksesoris', 'Lainnya'];
  }, [kategoriMasterList, barangList]);

  // Jenis List untuk Kategori terpilih
  const listJenisForCategory = useMemo(() => {
    if (!selectedCat) return [];
    const normCat = selectedCat.trim().toLowerCase();
    const items = barangList.filter(b => (b.kategori || '').trim().toLowerCase() === normCat);
    const jenisSet = new Set<string>();
    items.forEach(b => {
      if (b.jenis && b.jenis.trim()) jenisSet.add(b.jenis.trim());
    });
    // Juga tambahkan dari jenisMasterList jika ada
    jenisMasterList.forEach(j => {
      if (j && j.trim()) jenisSet.add(j.trim());
    });
    return Array.from(jenisSet);
  }, [selectedCat, barangList, jenisMasterList]);

  // Barang List untuk Jenis terpilih (Level 3)
  const filteredBarangLevel3 = useMemo(() => {
    if (!selectedCat || !selectedJenis) return [];
    const normCat = selectedCat.trim().toLowerCase();
    const normJenis = selectedJenis.trim().toLowerCase();
    const q = searchQuery.trim().toLowerCase();

    return barangList.filter(b => {
      const matchCat = (b.kategori || '').trim().toLowerCase() === normCat;
      const matchJenis = (b.jenis || '').trim().toLowerCase() === normJenis;
      const matchSearch = !q || (
        b.kode.toLowerCase().includes(q) ||
        b.nama.toLowerCase().includes(q) ||
        (b.lokasiRak && b.lokasiRak.toLowerCase().includes(q)) ||
        (b.keterangan && b.keterangan.toLowerCase().includes(q))
      );
      return matchCat && matchJenis && matchSearch;
    });
  }, [selectedCat, selectedJenis, searchQuery, barangList]);

  const handleDelete = async (b: Barang) => {
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${b.nama}" (${b.kode}) dari database gudang?`)) {
      await onHapusBarang(b.kode);
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
              <Flower2 className="w-6 h-6" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-teal-700 font-bold">Gudang & Inventaris</div>
              <h2 className="text-lg font-serif font-bold text-slate-900">Database Barang Bukan Pohon</h2>
              <p className="text-xs text-slate-500">Material Bunga, Daun, Properti, dan Aksesoris.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCat && selectedJenis && (
            <button
              onClick={() => setIsTableView(!isTableView)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {isTableView ? (
                <>
                  <LayoutGrid className="w-4 h-4 text-teal-700" />
                  <span>Tampilan Kartu</span>
                </>
              ) : (
                <>
                  <TableIcon className="w-4 h-4 text-teal-700" />
                  <span>Tampilan Tabel</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onOpenTambahStok}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>+ Tambah Beli</span>
          </button>

          <button
            onClick={onOpenTambahBarang}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 1: GRID TOMBOL KATEGORI UTAMA                                       */}
      {/* ========================================================================= */}
      {!selectedCat && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pilih Kategori Barang:</h3>
              <p className="text-xs text-slate-500">Klik salah satu kategori untuk melihat jenis dan daftar barang gudang.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Total <span className="font-bold text-slate-800">{barangList.length}</span> SKU
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listKategori.map((kat) => {
              const theme = THEME_KATEGORI[kat] || THEME_KATEGORI['DEFAULT'];
              const items = barangList.filter(b => (b.kategori || '').trim().toLowerCase() === kat.trim().toLowerCase());
              const totalStok = items.reduce((sum, curr) => sum + Number(curr.stokTotal || curr.stokTersedia || 0), 0);
              const { lusin, pcs } = toLusinPcs(totalStok);

              return (
                <button
                  key={kat}
                  onClick={() => {
                    setSelectedCat(kat);
                    setSelectedJenis('');
                    setSearchQuery('');
                  }}
                  className={`p-5 ${theme.bg} border-2 ${theme.border} hover:shadow-lg rounded-3xl text-left transition space-y-3 group cursor-pointer block w-full hover:-translate-y-0.5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-bold text-2xl shadow-xs">
                      {theme.icon}
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${theme.badge}`}>
                      {lusin} L + {pcs} P ({totalStok} Pcs)
                    </span>
                  </div>
                  <div>
                    <div className={`font-bold text-slate-900 text-base group-hover:${theme.text}`}>
                      {kat}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {items.length} Jenis Item Tersedia
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: GRID TOMBOL JENIS BARANG                                         */}
      {/* ========================================================================= */}
      {selectedCat && !selectedJenis && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setSelectedCat('')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span>Kembali ke Kategori</span>
            </button>
            <div className="font-serif font-bold text-teal-800 text-base sm:text-lg flex items-center gap-2">
              <span>Kategori:</span>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs sm:text-sm">
                {selectedCat}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Pilih Jenis Barang dalam Kategori "{selectedCat}":</h4>
            {listJenisForCategory.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                Belum ada jenis barang di kategori ini. Anda dapat menambahkan barang baru menggunakan tombol "+ Tambah Barang" di atas.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {listJenisForCategory.map((jns) => {
                  const normCat = selectedCat.trim().toLowerCase();
                  const normJns = jns.trim().toLowerCase();
                  const itemsInJenis = barangList.filter(
                    b => (b.kategori || '').trim().toLowerCase() === normCat &&
                         (b.jenis || '').trim().toLowerCase() === normJns
                  );
                  const totalStok = itemsInJenis.reduce((sum, curr) => sum + Number(curr.stokTotal || curr.stokTersedia || 0), 0);
                  const { lusin, pcs } = toLusinPcs(totalStok);

                  return (
                    <button
                      key={jns}
                      onClick={() => {
                        setSelectedJenis(jns);
                        setSearchQuery('');
                      }}
                      className="p-4 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/70 rounded-2xl text-left transition flex justify-between items-center cursor-pointer shadow-2xs group"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-teal-800">
                          {jns}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {itemsInJenis.length} SKU · <span className="font-semibold text-slate-600">{lusin} L + {pcs} P</span>
                        </div>
                      </div>
                      <span className="text-slate-300 group-hover:text-teal-700 font-bold text-sm">
                        ➔
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: DAFTAR BARANG (KARTU / TABEL)                                     */}
      {/* ========================================================================= */}
      {selectedCat && selectedJenis && (
        <div className="space-y-4">
          
          {/* Breadcrumb & Navigation Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedJenis('')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Pilih Jenis</span>
              </button>

              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span 
                  onClick={() => { setSelectedCat(''); setSelectedJenis(''); }}
                  className="cursor-pointer hover:underline text-slate-600"
                >
                  Semua Kategori
                </span>
                <span>&rsaquo;</span>
                <span 
                  onClick={() => setSelectedJenis('')}
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
                placeholder="Cari kode / nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 focus:bg-white"
              />
            </div>
          </div>

          {/* LEVEL 3 CONTENT: TABEL ATAU KARTU */}
          {filteredBarangLevel3.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Tidak ada data barang yang cocok untuk jenis "{selectedJenis}".
            </div>
          ) : isTableView ? (
            /* TABEL VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[900px]">
                  <thead className="bg-slate-100/80 uppercase text-slate-600 font-semibold border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">Foto</th>
                      <th className="py-3 px-3">Kode Barang</th>
                      <th className="py-3 px-3">Nama Barang</th>
                      <th className="py-3 px-2 text-center">Stok Total</th>
                      <th className="py-3 px-2 text-center text-emerald-800">Tersedia</th>
                      <th className="py-3 px-2 text-center text-amber-800">Disewa</th>
                      <th className="py-3 px-2 text-center">Satuan</th>
                      <th className="py-3 px-3">Lokasi Rak</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBarangLevel3.map((b) => {
                      const tot = toLusinPcs(b.stokTotal);
                      const ters = toLusinPcs(b.stokTersedia);
                      const dis = toLusinPcs(b.stokDisewa);

                      return (
                        <tr key={b.kode} className="hover:bg-teal-50/40 transition">
                          <td className="py-2.5 px-3 text-center">
                            <img
                              src={b.fotoUrl || fallbackImage}
                              alt={b.nama}
                              onClick={() => setZoomFoto({ url: b.fotoUrl || fallbackImage, nama: b.nama, kode: b.kode })}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 cursor-zoom-in inline-block shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackImage;
                              }}
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                            {b.kode}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{b.nama}</div>
                            {b.keterangan && (
                              <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{b.keterangan}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                            <div>{tot.lusin} L + {tot.pcs} P</div>
                            <div className="text-[9px] text-slate-400 font-normal">({b.stokTotal} {b.satuan})</div>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-emerald-700">
                            <div>{ters.lusin} L + {ters.pcs} P</div>
                            <div className="text-[9px] text-emerald-600 font-normal">({b.stokTersedia} {b.satuan})</div>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-amber-700">
                            <div>{dis.lusin} L + {dis.pcs} P</div>
                            <div className="text-[9px] text-amber-600 font-normal">({b.stokDisewa} {b.satuan})</div>
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600">
                            {b.satuan || 'Pcs'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {b.lokasiRak || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onDirectSewa(b.kode)}
                                title="Keluarkan Barang / Sewa"
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg transition text-[11px] cursor-pointer"
                              >
                                Keluar
                              </button>
                              <button
                                onClick={() => setEditingBarang(b)}
                                title="Edit Barang"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(b)}
                                title="Hapus Barang"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* KARTU VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBarangLevel3.map((item) => {
                const tot = toLusinPcs(item.stokTotal);
                const ters = toLusinPcs(item.stokTersedia);
                const dis = toLusinPcs(item.stokDisewa);

                return (
                  <div
                    key={item.kode}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold">
                          {item.kategori || selectedCat}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.jenis || selectedJenis}
                        </span>
                      </div>

                      <div className="mb-2.5 overflow-hidden rounded-xl border border-slate-100 h-36 bg-slate-50 relative group">
                        <img
                          src={item.fotoUrl || fallbackImage}
                          alt={item.nama}
                          onClick={() => setZoomFoto({ url: item.fotoUrl || fallbackImage, nama: item.nama, kode: item.kode })}
                          className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-mono font-bold text-teal-700">{item.kode}</span>
                        <span className="text-[10px] text-slate-400">Rak: {item.lokasiRak || '-'}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug mb-2" title={item.nama}>
                        {item.nama}
                      </h4>

                      {/* Grid Stok Lusin & Pcs */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl text-center text-[10px] mb-2 border border-slate-100">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Total</div>
                          <div className="font-bold text-slate-800">{tot.lusin}L + {tot.pcs}P</div>
                          <div className="text-[8px] text-slate-400">({item.stokTotal})</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-emerald-600 uppercase font-bold">Ready</div>
                          <div className="font-bold text-emerald-700">{ters.lusin}L + {ters.pcs}P</div>
                          <div className="text-[8px] text-emerald-600">({item.stokTersedia})</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-amber-600 uppercase font-bold">Sewa</div>
                          <div className="font-bold text-amber-700">{dis.lusin}L + {dis.pcs}P</div>
                          <div className="text-[8px] text-amber-600">({item.stokDisewa})</div>
                        </div>
                      </div>

                      {item.keterangan && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.keterangan}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-1.5">
                      <button
                        onClick={() => onDirectSewa(item.kode)}
                        className="flex-1 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold text-center transition cursor-pointer"
                      >
                        Keluar
                      </button>
                      <button
                        onClick={() => setEditingBarang(item)}
                        className="p-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Edit Barang */}
      {editingBarang && (
        <EditBarangModal
          barang={editingBarang}
          kategoriList={listKategori}
          jenisList={jenisMasterList}
          satuanList={satuanMasterList}
          lokasiList={lokasiMasterList}
          onClose={() => setEditingBarang(null)}
          onSave={onEditBarang}
        />
      )}

      {/* Modal Zoom Foto */}
      {zoomFoto && (
        <div 
          onClick={() => setZoomFoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="font-bold text-xs sm:text-sm">{zoomFoto.nama}</span>
                <span className="font-mono text-xs text-teal-300 ml-2">({zoomFoto.kode})</span>
              </div>
              <button 
                onClick={() => setZoomFoto(null)}
                className="text-white hover:text-slate-300 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-950 max-h-[75vh] flex items-center justify-center p-2">
              <img 
                src={zoomFoto.url} 
                alt={zoomFoto.nama} 
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
