import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  TreePine,
  Image as ImageIcon,
  Table as TableIcon,
  LayoutGrid,
  Edit2,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { PohonKatalog } from '../types';
import { Pagination } from './Pagination';
import { EditPohonModal } from './EditPohonModal';

interface KatalogViewProps {
  pohonList: PohonKatalog[];
  onOpenTambahPohon: () => void;
  onEditPohon: (kode: string, data: Partial<PohonKatalog>) => Promise<boolean>;
  onHapusPohon: (kode: string) => Promise<boolean>;
  kategoriMasterList?: string[];
}

export const KatalogView: React.FC<KatalogViewProps> = ({
  pohonList,
  onOpenTambahPohon,
  onEditPohon,
  onHapusPohon,
  kategoriMasterList
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal edit state
  const [editingPohon, setEditingPohon] = useState<PohonKatalog | null>(null);

  // Modal zoom preview foto
  const [zoomFoto, setZoomFoto] = useState<{ url: string; nama: string; kode: string } | null>(null);

  const defaultCategories = ['SEMUA', 'Pohon Besar', 'Pohon Sedang', 'Pohon Karakter', 'Tanaman Tropis', 'Bonsai Artifisial'];
  const categories = kategoriMasterList && kategoriMasterList.length > 0 
    ? ['SEMUA', ...Array.from(new Set(kategoriMasterList))] 
    : defaultCategories;

  const statuses = ['SEMUA', 'Tersedia', 'Sedang Dibooking', 'Perawatan'];

  const filteredPohon = pohonList.filter(item => {
    const matchCat = selectedKategori === 'SEMUA' || item.kategori === selectedKategori;
    const matchStatus = selectedStatus === 'SEMUA' || item.statusKetersediaan === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (
      item.kode.toLowerCase().includes(q) ||
      item.nama.toLowerCase().includes(q) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(q))
    );
    return matchCat && matchStatus && matchQuery;
  });

  const totalPages = Math.ceil(filteredPohon.length / pageSize) || 1;
  const paginatedList = filteredPohon.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fallbackImage = '/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg';

  const handleDelete = async (pohon: PohonKatalog) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pohon "${pohon.nama}" (${pohon.kode}) dari katalog?`)) {
      await onHapusPohon(pohon.kode);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
              <TreePine className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">Manajemen Katalog Pohon Artifisial</h2>
              <p className="text-xs text-slate-500">Showcase katalog pohon wedding & dekorasi tanpa harga, lengkap dengan manajemen stok & status ketersediaan.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Toggle View: Tabel vs Grid */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Galeri</span>
            </button>
          </div>

          <button
            onClick={onOpenTambahPohon}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pohon</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Input Pencarian */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kode pohon, nama pohon dekorasi, maple, beringin..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st === 'SEMUA' ? 'Semua Status' : st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Kategori Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-xs font-bold text-slate-500 mr-1 shrink-0">Kategori:</span>
          {categories.map(cat => {
            const isActive = selectedKategori === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedKategori(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer text-xs ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'SEMUA' ? 'Semua Kategori' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAMPILAN 1: TABEL KATALOG POHON */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5 text-center w-16">Foto</th>
                  <th className="px-4 py-3.5">Kode</th>
                  <th className="px-4 py-3.5 min-w-[240px]">Nama Pohon Dekorasi</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Tinggi</th>
                  <th className="px-4 py-3.5 text-center">Stok Total</th>
                  <th className="px-4 py-3.5 text-center">Tersedia</th>
                  <th className="px-4 py-3.5 text-center">Disewa</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Keterangan</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Tidak ada pohon dekorasi yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map(item => {
                    const imgSrc = item.fotoUrl || fallbackImage;
                    const isTersedia = item.statusKetersediaan === 'Tersedia';
                    return (
                      <tr key={item.kode} className="hover:bg-teal-50/40 transition">
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setZoomFoto({ url: imgSrc, nama: item.nama, kode: item.kode })}
                            className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs hover:ring-2 hover:ring-teal-500 transition cursor-zoom-in group shrink-0"
                            title="Klik untuk memperbesar foto"
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
                        <td className="px-4 py-2.5 font-mono font-bold text-teal-800">
                          {item.kode}
                        </td>
                        <td className="px-4 py-2.5 min-w-[240px]">
                          <div className="font-bold text-slate-900 text-sm leading-snug">{item.nama}</div>
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">{item.kategori} · Tinggi {item.tinggi || '-'}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] whitespace-nowrap">
                            {item.kategori}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {item.tinggi || '-'}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-800">
                          {item.stokTotal ?? 0}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {item.stokTersedia ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                            {item.stokDisewa ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            isTersedia
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : item.statusKetersediaan === 'Sedang Dibooking'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {item.statusKetersediaan}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate" title={item.keterangan}>
                          {item.keterangan || '-'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingPohon(item)}
                              title="Edit Pohon"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              title="Hapus Pohon"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada pohon dekorasi yang sesuai kriteria pencarian.
              </div>
            ) : (
              paginatedList.map(item => {
                const imgSrc = item.fotoUrl || fallbackImage;
                const isTersedia = item.statusKetersediaan === 'Tersedia';
                return (
                  <div key={item.kode} className="p-4 space-y-3 hover:bg-slate-50/60 transition">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setZoomFoto({ url: imgSrc, nama: item.nama, kode: item.kode })}
                        className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs shrink-0"
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
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isTersedia ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.statusKetersediaan}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                          {item.nama}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.kategori} • Tinggi: <span className="font-semibold text-slate-700">{item.tinggi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Stok Total</div>
                        <div className="font-bold text-slate-800 text-xs mt-0.5">{item.stokTotal} unit</div>
                      </div>
                      <div className="border-x border-slate-200/80">
                        <div className="text-[10px] text-emerald-700 font-medium">Tersedia</div>
                        <div className="font-bold text-emerald-800 text-xs mt-0.5">{item.stokTersedia} unit</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-amber-700 font-medium">Disewa</div>
                        <div className="font-bold text-amber-800 text-xs mt-0.5">{item.stokDisewa} unit</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingPohon(item)}
                        className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Pohon</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredPohon.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="pohon"
          />
        </div>
      )}

      {/* TAMPILAN 2: GRID KARTU POHON */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {paginatedList.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-2xl border border-slate-200">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada pohon yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau kategori filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedList.map(item => {
                const imgSrc = item.fotoUrl || fallbackImage;
                const isTersedia = item.statusKetersediaan === 'Tersedia';
                return (
                  <div
                    key={item.kode}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                  >
                    <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={item.nama}
                        onClick={() => setZoomFoto({ url: imgSrc, nama: item.nama, kode: item.kode })}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImage;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out cursor-zoom-in"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs uppercase tracking-wider">
                          {item.kategori}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-xs ${
                          isTersedia
                            ? 'bg-emerald-100/95 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100/95 text-amber-800 border border-amber-200'
                        }`}>
                          {item.statusKetersediaan}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">{item.kode}</span>
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600">
                            Tinggi: {item.tinggi}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-teal-700 transition min-h-[2.8rem] flex items-center">
                          {item.nama}
                        </h3>

                        <div className="mt-3 grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-xl text-center text-xs">
                          <div>
                            <div className="text-[10px] text-slate-400">Total</div>
                            <div className="font-bold text-slate-800">{item.stokTotal ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-emerald-600">Tersedia</div>
                            <div className="font-bold text-emerald-700">{item.stokTersedia ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-amber-600">Disewa</div>
                            <div className="font-bold text-amber-700">{item.stokDisewa ?? 0}</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                          {item.keterangan || 'Dekorasi pohon artifisial berkualitas prima HD-Pohon'}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingPohon(item)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Edit Pohon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Hapus Pohon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <a
                          href={`https://wa.me/628119500890?text=${encodeURIComponent(`Halo HD-Pohon, saya tertarik untuk sewa pohon: ${item.nama} (${item.kode})`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1"
                        >
                          <span>Reservasi WA</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPohon.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemName="pohon"
            />
          </div>
        </div>
      )}

      {/* Modal Zoom Preview Foto */}
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
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
              Foto Pohon Artifisial HD-Pohon
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Pohon */}
      {editingPohon && (
        <EditPohonModal
          pohon={editingPohon}
          kategoriList={categories.filter(c => c !== 'SEMUA')}
          onClose={() => setEditingPohon(null)}
          onSave={onEditPohon}
        />
      )}
    </div>
  );
};
