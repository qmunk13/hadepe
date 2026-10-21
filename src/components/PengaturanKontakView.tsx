import React, { useState } from 'react';
import { 
  Settings, 
  Phone, 
  Store, 
  MapPin, 
  Clock, 
  Mail, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
  RefreshCw,
  Database
} from 'lucide-react';
import { StoreSettings, GOOGLE_WORKSPACE_CONFIG } from '../types';
import { AppDataService } from '../services/api';

interface PengaturanKontakViewProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PengaturanKontakView: React.FC<PengaturanKontakViewProps> = ({
  settings,
  onSaveSettings,
  onShowToast
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  // Helper untuk membersihkan nomor telepon untuk format WA
  const cleanWaNumber = (input: string) => {
    let clean = input.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    }
    return clean;
  };

  const handleWaChange = (val: string) => {
    const cleaned = cleanWaNumber(val);
    setFormData(prev => ({
      ...prev,
      whatsappNumber: cleaned,
      displayPhone: val.trim()
    }));
  };

  const handlePullFromSpreadsheet = async () => {
    setIsPulling(true);
    try {
      const res = await AppDataService.syncSettingsFromGoogleSheets();
      if (res.success && res.settings) {
        setFormData({ ...res.settings });
        onSaveSettings(res.settings);
        onShowToast(res.message, 'success');
      } else {
        onShowToast(res.message, 'info');
      }
    } catch (e: any) {
      onShowToast('Gagal menarik dari spreadsheet: ' + (e.message || String(e)), 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.whatsappNumber.trim()) {
      onShowToast('Nomor WhatsApp wajib diisi.', 'error');
      return;
    }

    const cleaned = cleanWaNumber(formData.whatsappNumber);
    const updatedSettings: StoreSettings = {
      ...formData,
      whatsappNumber: cleaned,
      displayPhone: formData.displayPhone.trim() || `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
    };

    setIsSaving(true);
    try {
      // 1. Simpan ke local state React & localStorage
      onSaveSettings(updatedSettings);

      // 2. Simpan langsung ke sheet PENGATURAN_KONTAK di Google Spreadsheet
      const gasRes = await AppDataService.saveSettingsToGoogleSheets(updatedSettings);

      setSavedSuccess(true);
      onShowToast(gasRes.message, gasRes.success ? 'success' : 'info');
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      onShowToast('Tersimpan lokal. Namun sinkronisasi spreadsheet error: ' + (err.message || String(err)), 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const testWaLink = `https://wa.me/${cleanWaNumber(formData.whatsappNumber)}?text=${encodeURIComponent('Halo HD-Pohon, ini adalah tes nomor WhatsApp baru dari sistem...')}`;

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-slate-900 text-lg">Pengaturan Kontak & WhatsApp</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1">
                <Database className="w-3 h-3 text-teal-600" />
                Sheet: PENGATURAN_KONTAK
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Nomor WhatsApp dan kontak terhubung langsung ke Google Spreadsheet ID: <b className="font-mono text-teal-800">{GOOGLE_WORKSPACE_CONFIG.spreadsheetId}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePullFromSpreadsheet}
            disabled={isPulling}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Tarik nomor kontak dari Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin text-teal-700' : 'text-slate-500'}`} />
            <span>{isPulling ? 'Menarik...' : 'Tarik dari Sheet'}</span>
          </button>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tersimpan di Sheet &amp; Web!</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Pengaturan */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            {/* Bagian 1: WhatsApp Utama */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-emerald-900">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-sm">Nomor WhatsApp Reservasi Pelanggan</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>Nomor WhatsApp Aktif *</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Format: 08xx atau 628xx</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => handleWaChange(e.target.value)}
                      placeholder="Contoh: 08119500890 atau 628119500890"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Semua tombol "Pesan via WhatsApp", "Chat Admin", dan form reservasi di portal publik akan terhubung ke nomor ini.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Tampilan Nomor di Website (Display)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.displayPhone}
                      onChange={(e) => setFormData({ ...formData, displayPhone: e.target.value })}
                      placeholder="Contoh: +62 811-9500-890"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Teks nomor telepon yang tertulis di bagian header &amp; footer web.
                  </p>
                </div>
              </div>
            </div>

            {/* Bagian 2: Profil & Alamat Toko */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                <Store className="w-5 h-5 text-teal-800" />
                <h3 className="font-serif font-bold text-sm">Identitas Brand &amp; Lokasi Workshop</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Nama Usaha / Toko</label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Email Bisnis</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1.5">Tagline / Slogan Brand</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-teal-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1.5">Alamat Gudang &amp; Workshop</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={formData.workshopAddress}
                      onChange={(e) => setFormData({ ...formData, workshopAddress: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1.5">Jam Layanan &amp; Operasional</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Data otomatis disimpan ke Sheet <b>PENGATURAN_KONTAK</b> di Google Spreadsheet.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Menyimpan ke Spreadsheet...' : 'Simpan ke Google Spreadsheet'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Pratinjau Live & Pengujian */}
        <div className="space-y-4">
          {/* Card Pratinjau */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">Pratinjau Integrasi WhatsApp</h3>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="text-[11px] text-slate-400">Nomor Terhubung Saat Ini:</div>
              <div className="font-mono text-base font-bold text-emerald-400 tracking-wide">
                +{cleanWaNumber(formData.whatsappNumber) || '628xxxxxxxx'}
              </div>
              <div className="text-[11px] text-slate-300">
                Display: <b>{formData.displayPhone || '-'}</b>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 text-[11px]">Uji Coba Tautan:</div>
              <a
                href={testWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Tes Buka Chat WhatsApp</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/80 group-hover:text-white" />
              </a>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Klik tombol di atas untuk memastikan nomor WhatsApp dapat langsung dibuka di browser atau aplikasi WhatsApp Anda.
              </p>
            </div>
          </div>

          {/* Panduan Singkat */}
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl space-y-2.5 text-xs text-emerald-950">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>Petunjuk Pengisian Nomor WhatsApp:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-900/90 leading-relaxed">
              <li>Bisa diawali dengan <b>08</b> (misal: <code>08123456789</code>) atau <b>628</b>.</li>
              <li>Sistem otomatis mengonversi ke format internasional standar WhatsApp (<b>628...</b>).</li>
              <li>Pastikan nomor memiliki akun WhatsApp aktif untuk menerima rincian nama pohon, tanggal acara, dan alamat gedung dari pelanggan.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
