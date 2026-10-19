import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Truck 
} from 'lucide-react';
import { Supplier } from '../types';
import { Pagination } from './Pagination';

interface SupplierViewProps {
  supplierList: Supplier[];
  onTambahSupplier: (data: Partial<Supplier>) => Promise<{ success: boolean; message: string }>;
  onUpdateSupplier: (id: string, data: Partial<Supplier>) => Promise<{ success: boolean; message: string }>;
  onHapusSupplier: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const SupplierView: React.FC<SupplierViewProps> = ({
  supplierList,
  onTambahSupplier,
  onUpdateSupplier,
  onHapusSupplier
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [showAddModal, setShowAddModal] = useState(false);
  const [nama, setNama] = useState('');
  const [kontakPerson, setKontakPerson] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [kategoriBarang, setKategoriBarang] = useState('Bunga Artifisial');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filtered = supplierList.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return !q || (
      (s.nama || s.namaSupplier || '').toLowerCase().includes(q) ||
      (s.kontakPerson && s.kontakPerson.toLowerCase().includes(q)) ||
      s.noTelepon.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      ((s.kategoriBarang || s.kategoriSuplai || '')).toLowerCase().includes(q)
    );
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noTelepon.trim()) {
      alert('Nama Vendor/Supplier dan No. Telepon wajib diisi!');
      return;
    }
    setSaving(true);
    try {
      const res = await onTambahSupplier({
        nama: nama.trim(),
        kontakPerson: kontakPerson.trim(),
        noTelepon: noTelepon.trim(),
        email: email.trim(),
        kategoriBarang,
        alamat: alamat.trim(),
        catatan: catatan.trim()
      });
      alert(res.message);
      if (res.success) {
        setNama('');
        setKontakPerson('');
        setNoTelepon('');
        setEmail('');
        setAlamat('');
        setCatatan('');
        setShowAddModal(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setSaving(true);
    try {
      const res = await onUpdateSupplier(editingSupplier.id, editingSupplier);
      alert(res.message);
      if (res.success) {
        setEditingSupplier(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (confirm(`Apakah Anda yakin ingin menghapus supplier "${s.nama}"?`)) {
      const res = await onHapusSupplier(s.id);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
            <Truck className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Data Supplier & Vendor Dekorasi</h2>
            <p className="text-xs text-slate-500">Pabrik & pengrajin bunga artifisial, pohon batang kayu, standing besi, vas, dan peralatan tata panggung.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Supplier Baru</span>
        </button>
      </div>

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
            placeholder="Cari nama vendor, kontak person, telepon, kategori..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-500 shrink-0 font-medium">
          Total: <span className="font-bold text-slate-800">{filtered.length}</span> vendor
        </div>
      </div>

      {/* Table Supplier */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Nama Vendor / Perusahaan</th>
                <th className="px-4 py-3.5">Kontak Person</th>
                <th className="px-4 py-3.5">Kategori Pasokan</th>
                <th className="px-4 py-3.5">No. Telepon / HP</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Alamat Gudang / Pabrik</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data vendor yang cocok.
                  </td>
                </tr>
              ) : (
                paginated.map(s => (
                  <tr key={s.id} className="hover:bg-teal-50/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-teal-800">
                      {s.id}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {s.nama}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {s.kontakPerson || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-semibold text-[11px]">
                        {s.kategoriBarang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{s.noTelepon}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={s.alamat}>
                      {s.alamat || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingSupplier(s)}
                          title="Edit Supplier"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          title="Hapus Supplier"
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginated.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada data vendor yang cocok.
            </div>
          ) : (
            paginated.map(s => (
              <div key={s.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
                    {s.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {s.kategoriBarang}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{s.nama}</div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                    <span>📞 {s.noTelepon}</span>
                    {s.kontakPerson && <span>• CP: {s.kontakPerson}</span>}
                  </div>
                  {s.alamat && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      📍 {s.alamat}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setEditingSupplier(s)}
                    className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="supplier"
        />
      </div>

      {/* Modal Tambah Supplier */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Tambah Supplier / Vendor Baru</span>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Toko *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: CV Flora Artifisial Sentosa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kontak Person (PIC)</label>
                  <input
                    type="text"
                    value={kontakPerson}
                    onChange={e => setKontakPerson(e.target.value)}
                    placeholder="Bpk. Hendra"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / HP *</label>
                  <input
                    type="tel"
                    required
                    value={noTelepon}
                    onChange={e => setNoTelepon(e.target.value)}
                    placeholder="0811223344"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Pasokan</label>
                  <select
                    value={kategoriBarang}
                    onChange={e => setKategoriBarang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="Bunga Artifisial">Bunga Artifisial</option>
                    <option value="Pohon Artifisial & Batang Kayu">Pohon Artifisial & Batang</option>
                    <option value="Daun & Rayung Kering">Daun & Rayung Kering</option>
                    <option value="Properti Besi & Kayu">Properti Besi & Kayu</option>
                    <option value="Aksesoris & Kelistrikan">Aksesoris & Kelistrikan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="info@vendor.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Gudang / Pabrik</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  placeholder="Kawasan Industri Jepara, Jawa Tengah..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Term pembayaran 14 hari, supplier pohon utama..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Supplier */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Edit Data Supplier / Vendor</span>
              <button onClick={() => setEditingSupplier(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Toko *</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.nama}
                  onChange={e => setEditingSupplier({ ...editingSupplier, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kontak Person</label>
                  <input
                    type="text"
                    value={editingSupplier.kontakPerson || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, kontakPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon *</label>
                  <input
                    type="tel"
                    required
                    value={editingSupplier.noTelepon}
                    onChange={e => setEditingSupplier({ ...editingSupplier, noTelepon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Pasokan</label>
                  <select
                    value={editingSupplier.kategoriBarang}
                    onChange={e => setEditingSupplier({ ...editingSupplier, kategoriBarang: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="Bunga Artifisial">Bunga Artifisial</option>
                    <option value="Pohon Artifisial & Batang Kayu">Pohon Artifisial & Batang</option>
                    <option value="Daun & Rayung Kering">Daun & Rayung Kering</option>
                    <option value="Properti Besi & Kayu">Properti Besi & Kayu</option>
                    <option value="Aksesoris & Kelistrikan">Aksesoris & Kelistrikan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat</label>
                <textarea
                  rows={2}
                  value={editingSupplier.alamat || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={editingSupplier.catatan || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
