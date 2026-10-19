import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Save, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  ShieldCheck,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { UserAccount, GOOGLE_WORKSPACE_CONFIG } from '../types';
import { AppDataService } from '../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  currentUser: UserAccount | null;
  onClose: () => void;
  onSaveProfile: (updatedData: Partial<UserAccount>) => Promise<{ success: boolean; message: string }>;
  onGoToWhatsAppSettings: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSaveProfile,
  onGoToWhatsAppSettings
}) => {
  if (!isOpen || !currentUser) return null;

  const [namaLengkap, setNamaLengkap] = useState(currentUser.namaLengkap || '');
  const [noTelepon, setNoTelepon] = useState(currentUser.noTelepon || '');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setNamaLengkap(currentUser.namaLengkap || '');
      setNoTelepon(currentUser.noTelepon || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      setFeedback({ message: 'Nama lengkap tidak boleh kosong.', type: 'error' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await onSaveProfile({
        namaLengkap: namaLengkap.trim(),
        noTelepon: noTelepon.trim()
      });
      if (res.success) {
        setFeedback({ message: res.message || 'Nama lengkap berhasil disimpan dan disinkronkan ke Spreadsheet!', type: 'success' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFeedback({ message: res.message || 'Gagal menyimpan profil.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: 'Terjadi kesalahan: ' + (err.message || String(err)), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePullFromSheets = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const res = await AppDataService.syncUsersFromGoogleSheets();
      if (res.success && res.users.length > 0) {
        const found = res.users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
        if (found) {
          setNamaLengkap(found.namaLengkap);
          setNoTelepon(found.noTelepon || '');
          setFeedback({ 
            message: `Nama Lengkap berhasil ditarik dari Spreadsheet: "${found.namaLengkap}"`, 
            type: 'success' 
          });
        } else {
          setFeedback({ message: 'User tidak ditemukan di sheet USERS Google Spreadsheet.', type: 'error' });
        }
      } else {
        setFeedback({ message: res.message || 'Gagal menarik data dari Google Spreadsheet.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: 'Gagal sinkronisasi: ' + (err.message || String(err)), type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const isGasConnected = !!AppDataService.getGasUrl();

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base">Profil Pengguna &amp; Nama Lengkap</h3>
              <p className="text-xs text-slate-400">Sinkronisasi otomatis dengan sheet USERS Google Spreadsheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Card Info Sinkronisasi Spreadsheet */}
          <div className="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/70 text-teal-950 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Database className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Sheet Database: USERS</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    isGasConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isGasConnected ? '🟢 Live Auto-Sync' : '🟡 Mode Lokal'}
                  </span>
                </div>
                <div className="text-[11px] text-teal-800 font-mono truncate mt-0.5">
                  ID: {GOOGLE_WORKSPACE_CONFIG.spreadsheetId}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePullFromSheets}
              disabled={syncing || !isGasConnected}
              title="Tarik data nama lengkap terbaru dari spreadsheet"
              className="px-2.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Menarik...' : 'Tarik dari Sheets'}</span>
            </button>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 font-semibold text-xs animate-in fade-in ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Username (Readonly) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono font-bold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Akun</label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>{currentUser.role || 'ADMIN'}</span>
              </div>
            </div>
          </div>

          {/* Nama Lengkap (Harus sinkron dengan spreadsheet) */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Nama Lengkap * (Database Spreadsheet)</span>
              <span className="text-[10px] text-teal-700 font-semibold">Tersimpan di Sheet USERS</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={e => setNamaLengkap(e.target.value)}
                placeholder="Contoh: Hasan Basri (Owner & Admin)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nama ini akan tampil di seluruh aplikasi, dokumen invoice, surat jalan, dan riwayat mutasi transaksi.
            </p>
          </div>

          {/* Nomor HP / Telepon Pribadi */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Nomor HP / WhatsApp Personal</span>
              <span className="text-[10px] text-slate-500">Opsional</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noTelepon}
                onChange={e => setNoTelepon(e.target.value)}
                placeholder="Contoh: 08119500890"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
              />
            </div>
          </div>

          {/* Quick link to WhatsApp Settings */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-800 text-[11px]">Mau ganti nomor WhatsApp toko/reservasi?</div>
                <div className="text-[10px] text-slate-500">Nomor tujuan chat & reservasi formulir web publik</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToWhatsAppSettings();
              }}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold text-[11px] transition cursor-pointer shrink-0"
            >
              Buka Pengaturan WA
            </button>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan & Sinkron...' : 'Simpan ke Spreadsheet'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
