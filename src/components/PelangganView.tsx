import React, { useState } from 'react';
import { 
  Users2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  X 
} from 'lucide-react';
import { Pelanggan } from '../types';
import { Pagination } from './Pagination';

interface PelangganViewProps {
  pelangganList: Pelanggan[];
  onTambahPelanggan: (data: Partial<Pelanggan>) => Promise<{ success: boolean; message: string }>;
  onUpdatePelanggan: (id: string, data: Partial<Pelanggan>) => Promise<{ success: boolean; message: string }>;
  onHapusPelanggan: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const PelangganView: React.FC<PelangganViewProps> = ({
  pelangganList,
  onTambahPelanggan,
  onUpdatePelanggan,
  onHapusPelanggan
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [showAddModal, setShowAddModal] = useState(false);
  const [nama, setNama] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kategori, setKategori] = useState('Wedding Organizer');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(null);

  const filtered = pelangganList.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || (
      (p.nama || p.namaPelanggan || '').toLowerCase().includes(q) ||
      p.noTelepon.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.alamat && p.alamat.toLowerCase().includes(q)) ||
      (p.kategori && p.kategori.toLowerCase().includes(q))
    );
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noTelepon.trim()) {
      alert('Nama Pelanggan dan No. Telepon wajib diisi!');
      return;
    }
    setSaving(true);
    try {
      const res = await onTambahPelanggan({
        nama: nama.trim(),
        noTelepon: noTelepon.trim(),
        email: email.trim(),
        alamat: alamat.trim(),
        kategori,
        catatan: catatan.trim()
      });
      alert(res.message);
      if (res.success) {
        setNama('');
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
    if (!editingPelanggan) return;
    setSaving(true);
    try {
      const res = await onUpdatePelanggan(editingPelanggan.id, editingPelanggan);
      alert(res.message);
      if (res.success) {
        setEditingPelanggan(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Pelanggan) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pelanggan "${p.nama}"?`)) {
      const res = await onHapusPelanggan(p.id);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
            <Users2 className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Data Pelanggan & Wedding Organizer (WO)</h2>
            <p className="text-xs text-slate-500">Kelola buku kontak pelanggan, wedding organizer langganan, hotel/venue, dan pihak perorangan.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
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
            placeholder="Cari nama pelanggan, nomor telepon, WO, alamat..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-500 shrink-0 font-medium">
          Total: <span className="font-bold text-slate-800">{filtered.length}</span> pelanggan
        </div>
      </div>

      {/* Table Pelanggan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Nama Pelanggan / WO</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">No. Telepon / WhatsApp</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Alamat Lengkap</th>
                <th className="px-4 py-3.5">Catatan</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data pelanggan yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginated.map(p => (
                  <tr key={p.id} className="hover:bg-teal-50/30 transition">
                    <td className="px-4 py-3 font-mono font-bold text-teal-800">
                      {p.id}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {p.nama}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-semibold text-[11px]">
                        {p.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.noTelepon}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.email ? (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.email}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={p.alamat}>
                      {p.alamat ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.alamat}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={p.catatan}>
                      {p.catatan || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingPelanggan(p)}
                          title="Edit Pelanggan"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          title="Hapus Pelanggan"
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
              Tidak ada data pelanggan yang sesuai dengan pencarian.
            </div>
          ) : (
            paginated.map(p => (
              <div key={p.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
                    {p.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {p.kategori || 'Umum'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm leading-snug">{p.nama || p.namaPelanggan}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>📞 {p.noTelepon}</span>
                    {p.email && <span>• {p.email}</span>}
                  </div>
                  {p.alamat && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      📍 {p.alamat}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setEditingPelanggan(p)}
                    className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
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
          itemName="pelanggan"
        />
      </div>

      {/* Modal Tambah Pelanggan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Tambah Pelanggan / WO Baru</span>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap / Nama WO *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Aris Wedding Organizer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={e => setKategori(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="Wedding Organizer">Wedding Organizer</option>
                    <option value="Event Organizer">Event Organizer</option>
                    <option value="Hotel / Venue">Hotel / Venue</option>
                    <option value="Dekorator">Dekorator</option>
                    <option value="Perorangan">Perorangan / Pengantin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / WA *</label>
                  <input
                    type="tel"
                    required
                    value={noTelepon}
                    onChange={e => setNoTelepon(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kontak@wedding.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor / Domisili</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  placeholder="Jl. Kaliurang Km 8, Sleman..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Spesialis tema adat jawa, sering sewa pohon..."
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
                  {saving ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Pelanggan */}
      {editingPelanggan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Edit Data Pelanggan / WO</span>
              <button onClick={() => setEditingPelanggan(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap / Nama WO *</label>
                <input
                  type="text"
                  required
                  value={editingPelanggan.nama}
                  onChange={e => setEditingPelanggan({ ...editingPelanggan, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editingPelanggan.kategori}
                    onChange={e => setEditingPelanggan({ ...editingPelanggan, kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="Wedding Organizer">Wedding Organizer</option>
                    <option value="Event Organizer">Event Organizer</option>
                    <option value="Hotel / Venue">Hotel / Venue</option>
                    <option value="Dekorator">Dekorator</option>
                    <option value="Perorangan">Perorangan / Pengantin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon / WA *</label>
                  <input
                    type="tel"
                    required
                    value={editingPelanggan.noTelepon}
                    onChange={e => setEditingPelanggan({ ...editingPelanggan, noTelepon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingPelanggan.email || ''}
                  onChange={e => setEditingPelanggan({ ...editingPelanggan, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat</label>
                <textarea
                  rows={2}
                  value={editingPelanggan.alamat || ''}
                  onChange={e => setEditingPelanggan({ ...editingPelanggan, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={editingPelanggan.catatan || ''}
                  onChange={e => setEditingPelanggan({ ...editingPelanggan, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPelanggan(null)}
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
