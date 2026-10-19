import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowDownToLine, 
  ShoppingCart,
  MapPin, 
  Flower2, 
  X, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { Barang } from '../types';
import { Pagination } from './Pagination';
import { EditBarangModal } from './EditBarangModal';
import { formatDateTimeIndo } from '../utils/formatters';

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

export const DatabaseBarangView: React.FC<DatabaseBarangViewProps> = ({
  barangList,
  onOpenTambahBarang,
  onOpenTambahStok,
  onDirectSewa,
  onEditBarang,
  onHapusBarang,
  kategoriMasterList,
  jenisMasterList,
  satuanMasterList,
  lokasiMasterList
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('SEMUA');
  const [selectedJenis, setSelectedJenis] = useState('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [zoomFoto, setZoomFoto] = useState<{ url: string; nama: string; kode: string } | null>(null);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);

  const defaultCategories = ['SEMUA', 'Bunga', 'Daun', 'Properti', 'Aksesoris', 'Lainnya'];
  const categories = kategoriMasterList && kategoriMasterList.length > 0 
    ? ['SEMUA', ...Array.from(new Set(kategoriMasterList))] 
    : defaultCategories;

  const availableJenis: string[] = Array.from(new Set([
    ...(jenisMasterList || []),
    ...barangList.map(b => b.jenis).filter((j): j is string => Boolean(j))
  ]));
  const jenisOptions = ['SEMUA', ...availableJenis];

  const filteredBarang = barangList.filter(item => {
    const matchCat = selectedKategori === 'SEMUA' || item.kategori === selectedKategori;
    const matchJenis = selectedJenis === 'SEMUA' || (item.jenis && item.jenis === selectedJenis);
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (
      item.kode.toLowerCase().includes(q) ||
      item.nama.toLowerCase().includes(q) ||
      (item.jenis && item.jenis.toLowerCase().includes(q)) ||
      (item.lokasiRak && item.lokasiRak.toLowerCase().includes(q)) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );
    return matchCat && matchJenis && matchQuery;
  });

  const paginatedList = filteredBarang.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';

  const handleDelete = async (b: Barang) => {
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${b.nama}" (${b.kode}) dari database gudang?`)) {
      await onHapusBarang(b.kode);
    }
  };

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
              <h2 className="text-lg font-serif font-bold text-slate-900">Database Barang Gudang</h2>
              <p className="text-xs text-slate-500">Koleksi bunga artificial, dedaunan, properti besi/kayu, standing flower, dan aksesoris pesta.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenTambahStok}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Stok Masuk Supplier</span>
          </button>
          
          <button
            onClick={onOpenTambahBarang}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kode barang, nama, jenis, atau lokasi rak..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Kategori:</span>
            <select
              value={selectedKategori}
              onChange={e => {
                setSelectedKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'SEMUA' ? 'Semua Kategori' : cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Jenis:</span>
            <select
              value={selectedJenis}
              onChange={e => {
                setSelectedJenis(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              {jenisOptions.map(j => (
                <option key={j} value={j}>{j === 'SEMUA' ? 'Semua Jenis' : j}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table & Cards Database Barang */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tampilan Desktop: Tabel Lengkap */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1050px]">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3.5 py-3.5 text-center w-14">Foto</th>
                <th className="px-3.5 py-3.5 min-w-[220px]">Nama Barang &amp; Kode</th>
                <th className="px-3.5 py-3.5 text-center">Stok Total</th>
                <th className="px-3.5 py-3.5 text-center">Tersedia</th>
                <th className="px-3.5 py-3.5 text-center">Disewa</th>
                <th className="px-3.5 py-3.5">Satuan</th>
                <th className="px-3.5 py-3.5">Lokasi Rak</th>
                <th className="px-3.5 py-3.5">Keterangan</th>
                <th className="px-3.5 py-3.5">UpdatedAt</th>
                <th className="px-3.5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan kriteria pencarian & filter.
                  </td>
                </tr>
              ) : (
                paginatedList.map(item => {
                  const isAvailable = item.stokTersedia > 0;
                  const imgSrc = item.fotoUrl || fallbackImage;
                  return (
                    <tr key={item.kode} className="hover:bg-teal-50/40 transition">
                      <td className="px-3.5 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setZoomFoto({ url: imgSrc, nama: item.nama, kode: item.kode })}
                          className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs hover:ring-2 hover:ring-teal-500 transition cursor-zoom-in group shrink-0 inline-block"
                          title="Klik untuk memperbesar foto barang"
                        >
                          <img
                            src={imgSrc}
                            alt={item.nama}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackImage;
                            }}
                          />
                        </button>
                      </td>
                     
                      <td className="px-3.5 py-2.5 min-w-[220px]">
                        <div className="font-bold text-slate-900 leading-snug">{item.nama}</div>
                        <div className="text-[10px] text-teal-700 font-mono mt-0.5">{item.kode} · {item.kategori || '-'}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-slate-800">
                        {item.stokTotal}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-lg font-bold text-xs ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.stokTersedia}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                          {item.stokDisewa}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                        {item.satuan}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600">
                        {item.lokasiRak ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                            <span className="truncate max-w-[130px]">{item.lokasiRak}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-500 max-w-[180px] truncate" title={item.keterangan}>
                        {item.keterangan || '-'}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-400 text-[11px]">
                        {formatDateTimeIndo(item.updatedAt)}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingBarang(item)}
                            title="Edit Data Barang"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Hapus Barang"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDirectSewa(item.kode)}
                            disabled={!isAvailable}
                            title={isAvailable ? 'Sewa barang ini sekarang' : 'Stok sedang habis'}
                            className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Tampilan Khusus Mobile / HP: Card Item List */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada barang yang cocok dengan kriteria pencarian & filter.
            </div>
          ) : (
            paginatedList.map(item => {
              const isAvailable = item.stokTersedia > 0;
              const imgSrc = item.fotoUrl || fallbackImage;
              return (
                <div key={item.kode} className="p-4 space-y-3 hover:bg-slate-50/60 transition">
                  {/* Baris Atas: Foto + Nama & Kategori */}
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setZoomFoto({ url: imgSrc, nama: item.nama, kode: item.kode })}
                      className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs shrink-0"
                      title="Perbesar Foto"
                    >
                      <img
                        src={imgSrc}
                        alt={item.nama}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
                          {item.kode}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 truncate">
                          {item.kategori}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {item.nama}
                      </div>
                      {item.lokasiRak && (
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>📍 Rak: {item.lokasiRak}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Baris Tengah: 3 Chip Metrik Stok */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Stok Total</div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{item.stokTotal} {item.satuan}</div>
                    </div>
                    <div className="border-x border-slate-200/80">
                      <div className="text-[10px] text-emerald-700 font-medium">Tersedia</div>
                      <div className="font-bold text-emerald-800 text-xs mt-0.5">{item.stokTersedia} {item.satuan}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-700 font-medium">Disewa</div>
                      <div className="font-bold text-amber-800 text-xs mt-0.5">{item.stokDisewa} {item.satuan}</div>
                    </div>
                  </div>

                  {/* Baris Bawah: Tombol Aksi */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onDirectSewa(item.kode)}
                      disabled={!isAvailable}
                      className="flex-1 py-2 px-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Sewa Barang' : 'Stok Kosong'}</span>
                    </button>
                    <button
                      onClick={() => setEditingBarang(item)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl transition cursor-pointer"
                      title="Edit Data Barang"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition cursor-pointer"
                      title="Hapus Barang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredBarang.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="barang"
        />
      </div>

      {/* Modal Zoom Foto */}
      {zoomFoto && (
        <div 
          onClick={() => setZoomFoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700/50"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-teal-400 font-bold mr-2">{zoomFoto.kode}</span>
                <span className="font-bold text-sm text-slate-100">{zoomFoto.nama}</span>
              </div>
              <button
                onClick={() => setZoomFoto(null)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={zoomFoto.url}
                alt={zoomFoto.nama}
                className="max-h-[70vh] w-auto max-w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Barang */}
      {editingBarang && (
        <EditBarangModal
          barang={editingBarang}
          kategoriList={categories.filter(c => c !== 'SEMUA')}
          jenisList={availableJenis}
          satuanList={satuanMasterList}
          lokasiList={lokasiMasterList}
          onClose={() => setEditingBarang(null)}
          onSave={onEditBarang}
        />
      )}
    </div>
  );
};
