import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  FolderTree, 
  Flower2, 
  Layers, 
  Scale, 
  MapPin 
} from 'lucide-react';
import { MasterDataItem, MasterDataTipe } from '../types';
import { Pagination } from './Pagination';
import { formatDateTimeIndo } from '../utils/formatters';

interface MasterDataViewProps {
  masterDataList: MasterDataItem[];
  onTambahMaster: (data: { tipe: MasterDataTipe; nilai: string; keterangan?: string }) => Promise<{ success: boolean; message: string }>;
  onUpdateMaster: (id: string, data: { nilai: string; keterangan?: string }) => Promise<{ success: boolean; message: string }>;
  onHapusMaster: (id: string) => Promise<{ success: boolean; message: string }>;
  onRefresh: () => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  masterDataList,
  onTambahMaster,
  onUpdateMaster,
  onHapusMaster
}) => {
  const [activeTab, setActiveTab] = useState<MasterDataTipe>('KATEGORI_POHON');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNilai, setNewNilai] = useState('');
  const [newKeterangan, setNewKeterangan] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [editNilai, setEditNilai] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');

  const tabs: Array<{ id: MasterDataTipe; label: string; icon: React.ElementType; desc: string }> = [
    { id: 'KATEGORI_POHON', label: 'List Kategori Pohon', icon: FolderTree, desc: 'Pohon Besar, Pohon Sedang, Karakter, Tropis, dll.' },
    { id: 'KATEGORI_BARANG', label: 'List Kategori Barang', icon: Flower2, desc: 'Bunga, Daun, Properti, Aksesoris, dll.' },
    { id: 'JENIS_BARANG', label: 'List Jenis Barang', icon: Layers, desc: 'Bunga Mawar, Daun Monstera, Standing Besi, dll.' },
    { id: 'SATUAN', label: 'List Satuan', icon: Scale, desc: 'Tangkai, Ikat, Lembar, Unit, Set, Box, Roll, dll.' },
    { id: 'LOKASI_RAK', label: 'List Lokasi Rak / Gudang', icon: MapPin, desc: 'Rak A1, Rak B1, Hanggar Pohon, dll.' }
  ];

  const currentTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];

  const filteredItems = masterDataList
    .filter(item => item.tipe === activeTab)
    .filter(item => {
      const q = searchQuery.toLowerCase().trim();
      return !q || item.nilai.toLowerCase().includes(q) || (item.keterangan && item.keterangan.toLowerCase().includes(q));
    });

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNilai.trim()) {
      alert('Nama / Nilai data wajib diisi!');
      return;
    }
    setSaving(true);
    try {
      const res = await onTambahMaster({
        tipe: activeTab,
        nilai: newNilai.trim(),
        keterangan: newKeterangan.trim()
      });
      alert(res.message);
      if (res.success) {
        setNewNilai('');
        setNewKeterangan('');
        setShowAddForm(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item: MasterDataItem) => {
    setEditingItem(item);
    setEditNilai(item.nilai);
    setEditKeterangan(item.keterangan || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editNilai.trim()) {
      alert('Nilai data tidak boleh kosong.');
      return;
    }
    setSaving(true);
    try {
      const res = await onUpdateMaster(editingItem.id, {
        nilai: editNilai.trim(),
        keterangan: editKeterangan.trim()
      });
      alert(res.message);
      if (res.success) {
        setEditingItem(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MasterDataItem) => {
    if (confirm(`Yakin ingin menghapus item "${item.nilai}" dari master data ${currentTabConfig.label}?`)) {
      const res = await onHapusMaster(item.id);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
            <Database className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Manajemen Master Data Referensi</h2>
            <p className="text-xs text-slate-500">Kelola daftar kategori pohon, kategori barang, jenis barang, satuan, dan lokasi rak gudang.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Form' : `Tambah ke ${currentTabConfig.label}`}</span>
        </button>
      </div>

      {/* Tabs Kategori Master Data */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = masterDataList.filter(m => m.tipe === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
                setShowAddForm(false);
                setEditingItem(null);
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-teal-800 text-white border-teal-800 shadow-sm shadow-teal-800/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${isActive ? 'bg-white/20 text-teal-100' : 'bg-slate-100 text-slate-600'}`}>
                  {count} item
                </span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">{tab.label}</div>
                <div className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-teal-200' : 'text-slate-400'}`}>
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Form Tambah Item Baru */}
      {showAddForm && (
        <form onSubmit={handleSaveAdd} className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-teal-200/80">
            <span className="text-xs font-bold text-teal-900">
              Form Tambah: <span className="font-semibold text-teal-700">{currentTabConfig.label}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 mb-1">Nama / Nilai *</label>
              <input
                type="text"
                required
                value={newNilai}
                onChange={e => setNewNilai(e.target.value)}
                placeholder="Contoh nama..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-teal-500 outline-none font-semibold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan Spesifikasi</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeterangan}
                  onChange={e => setNewKeterangan(e.target.value)}
                  placeholder="Deskripsi singkat..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-slate-700"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Cari di ${currentTabConfig.label}...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-500 shrink-0 font-medium">
          Total: <span className="font-bold text-slate-800">{filteredItems.length}</span> data
        </div>
      </div>

      {/* Tabel Master Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">No</th>
                <th className="px-4 py-3.5 w-56">Nilai / Nama Master</th>
                <th className="px-4 py-3.5">Keterangan</th>
                <th className="px-4 py-3.5 w-44">Terakhir Diperbarui</th>
                <th className="px-4 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Belum ada data untuk {currentTabConfig.label}. Klik "Tambah ke {currentTabConfig.label}" di atas.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={item.id} className="hover:bg-teal-50/30 transition">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {globalIdx}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {item.nilai}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.keterangan || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {formatDateTimeIndo(item.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(item)}
                            title="Edit Item"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Hapus Item"
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
          {paginatedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada data untuk {currentTabConfig.label}.
            </div>
          ) : (
            paginatedItems.map((item, idx) => {
              const itemIndex = (currentPage - 1) * pageSize + idx + 1;
              return (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-slate-400 font-mono text-xs font-bold pt-0.5">#{itemIndex}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{item.nilai}</div>
                      {item.keterangan && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.keterangan}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                      title="Hapus"
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
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="item master"
        />
      </div>

      {/* Modal Edit Master Data */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Edit Data Referensi</span>
              <button onClick={() => setEditingItem(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Nilai *</label>
                <input
                  type="text"
                  required
                  value={editNilai}
                  onChange={e => setEditNilai(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
                <textarea
                  rows={2}
                  value={editKeterangan}
                  onChange={e => setEditKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:border-teal-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
