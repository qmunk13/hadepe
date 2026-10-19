import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2,
  Database,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { UserAccount, GOOGLE_WORKSPACE_CONFIG } from '../types';
import { AppDataService } from '../services/api';
import { Pagination } from './Pagination';
import { formatDateTimeIndo } from '../utils/formatters';

interface UsersViewProps {
  usersList: UserAccount[];
  currentUser: UserAccount | null;
  onTambahUser: (data: Partial<UserAccount>) => Promise<{ success: boolean; message: string }>;
  onUpdateUser: (username: string, data: Partial<UserAccount>) => Promise<{ success: boolean; message: string }>;
  onHapusUser: (username: string) => Promise<{ success: boolean; message: string }>;
}

export const UsersView: React.FC<UsersViewProps> = ({
  usersList,
  currentUser,
  onTambahUser,
  onUpdateUser,
  onHapusUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [noTelepon, setNoTelepon] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pulling, setPulling] = useState(false);

  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusFeedback({ message, type });
    setTimeout(() => {
      setStatusFeedback(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handlePullUsersFromSheets = async () => {
    setPulling(true);
    try {
      const res = await AppDataService.syncUsersFromGoogleSheets();
      if (res.success) {
        showStatus(res.message, 'success');
      } else {
        showStatus(res.message || 'Gagal menarik data pengguna dari Spreadsheet.', 'error');
      }
    } catch (err: any) {
      showStatus('Error sinkronisasi: ' + (err.message || String(err)), 'error');
    } finally {
      setPulling(false);
    }
  };

  const filtered = usersList.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    return !q || (
      u.username.toLowerCase().includes(q) ||
      u.namaLengkap.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.noTelepon && u.noTelepon.toLowerCase().includes(q))
    );
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !namaLengkap.trim()) {
      showStatus('Username dan Nama Lengkap wajib diisi!', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await onTambahUser({
        username: username.trim().toLowerCase(),
        namaLengkap: namaLengkap.trim(),
        role,
        noTelepon: noTelepon.trim(),
        password: password.trim() || '123456',
        status: 'AKTIF'
      });
      showStatus(res.message, res.success ? 'success' : 'error');
      if (res.success) {
        setUsername('');
        setNamaLengkap('');
        setNoTelepon('');
        setPassword('');
        setShowAddModal(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await onUpdateUser(editingUser.username, editingUser);
      showStatus(res.message, res.success ? 'success' : 'error');
      if (res.success) {
        setEditingUser(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserAccount) => {
    if (u.username.toLowerCase() === 'admin') {
      showStatus('Akun Super Admin "admin" tidak dapat dihapus demi keamanan sistem.', 'error');
      return;
    }
    const res = await onHapusUser(u.username);
    showStatus(res.message, res.success ? 'success' : 'error');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-slate-900">Manajemen Pengguna &amp; Hak Akses</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                Sheet USERS
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Nama lengkap &amp; profil staf tersinkron langsung ke Google Spreadsheet ID: <code className="font-mono text-teal-800">{GOOGLE_WORKSPACE_CONFIG.spreadsheetId}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handlePullUsersFromSheets}
            disabled={pulling}
            title="Tarik data nama lengkap dan user terbaru dari Spreadsheet"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pulling ? 'animate-spin' : ''}`} />
            <span>{pulling ? 'Menarik...' : 'Tarik dari Sheets'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {statusFeedback && (
        <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in ${
          statusFeedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {statusFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusFeedback.message}</span>
        </div>
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
            placeholder="Cari username, nama lengkap staf, role..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-500 shrink-0 font-medium">
          Total: <span className="font-bold text-slate-800">{filtered.length}</span> akun
        </div>
      </div>

      {/* Table Users */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Nama Lengkap</th>
                <th className="px-4 py-3.5">Hak Akses (Role)</th>
                <th className="px-4 py-3.5">No. Telepon</th>
                <th className="px-4 py-3.5">Status Akun</th>
                <th className="px-4 py-3.5">Terakhir Update</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada akun yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginated.map(u => {
                  const isCurrent = currentUser?.username.toLowerCase() === u.username.toLowerCase();
                  return (
                    <tr key={u.username} className="hover:bg-teal-50/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-teal-800">
                        @{u.username}
                        {isCurrent && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-teal-100 text-teal-800 font-sans font-bold">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {u.namaLengkap}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          u.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {u.noTelepon || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{u.status || 'AKTIF'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {formatDateTimeIndo(u.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingUser(u)}
                            title="Edit Akun Pengguna"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.username.toLowerCase() !== 'admin' && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Hapus Akun Pengguna"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
          {paginated.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada akun yang sesuai dengan pencarian.
            </div>
          ) : (
            paginated.map(u => {
              const isCurrent = currentUser?.username.toLowerCase() === u.username.toLowerCase();
              return (
                <div key={u.username} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-teal-800 text-xs">
                      <span>@{u.username}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-teal-100 text-teal-800 font-sans font-bold">
                          Anda
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{u.namaLengkap}</div>
                    {u.noTelepon && (
                      <div className="text-xs text-slate-500 mt-0.5">📞 {u.noTelepon}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Akun</span>
                    </button>
                    {u.username.toLowerCase() !== 'admin' && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="pengguna"
        />
      </div>

      {/* Modal Tambah User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Tambah Pengguna Baru</span>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Contoh: kasir2 / staf_gudang"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={e => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Rina Amalia"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Peran</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="STAFF">STAFF (Kasir/Gudang)</option>
                    <option value="ADMIN">ADMIN (Full Access)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. Telepon</label>
                  <input
                    type="tel"
                    value={noTelepon}
                    onChange={e => setNoTelepon(e.target.value)}
                    placeholder="081234..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password Baru</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Default: 123456"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:border-teal-500 outline-none"
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
                  {saving ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">Edit Akun Pengguna</span>
              <button onClick={() => setEditingUser(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingUser.namaLengkap}
                  onChange={e => setEditingUser({ ...editingUser, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Peran</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingUser.status || 'AKTIF'}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. Telepon</label>
                <input
                  type="tel"
                  value={editingUser.noTelepon || ''}
                  onChange={e => setEditingUser({ ...editingUser, noTelepon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ganti Password (Kosongkan bila tidak diganti)</label>
                <input
                  type="password"
                  placeholder="Ketik password baru..."
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:border-teal-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
