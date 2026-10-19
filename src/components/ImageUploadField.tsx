import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, X, RefreshCw, Sparkles, FolderTree } from 'lucide-react';
import { AppDataService } from '../services/api';

interface ImageUploadFieldProps {
  label?: string;
  currentUrl: string;
  onChangeUrl: (url: string) => void;
  type?: 'pohon' | 'barang';
  presetOptions?: { label: string; url: string }[];
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Foto Produk / Aset',
  currentUrl,
  onChangeUrl,
  type = 'pohon',
  presetOptions
}) => {
  const [tab, setTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultPohonPresets = [
    { label: 'Pohon Beringin Putih Wedding', url: '/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg' },
    { label: 'Pohon Maple Merah Autumn', url: '/src/assets/images/tree_maple_red_autumn_1792371618899.jpg' },
    { label: 'Pohon Sakura Pink Jepang', url: '/src/assets/images/tree_sakura_pink_cherry_1792371619213.jpg' },
    { label: 'Pohon Palem Tropis & Monstera', url: '/src/assets/images/tree_tropical_palm_decor_1792371619582.jpg' },
    { label: 'Panggung Pelaminan Full Pohon', url: '/src/assets/images/hero_wedding_tree_decor_1792371617267.jpg' }
  ];

  const presets = presetOptions || defaultPohonPresets;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Memproses file foto...');

    try {
      if (type === 'pohon') {
        const res = await AppDataService.uploadFotoPohon(file);
        onChangeUrl(res.url);
        setUploadStatus(res.driveSuccess ? 'Foto tersimpan ke Google Drive!' : 'Foto tersimpan lokal!');
      } else {
        const res = await AppDataService.uploadFotoBarang(file);
        onChangeUrl(res.url);
        setUploadStatus(res.driveSuccess ? 'Foto tersimpan ke Google Drive!' : 'Foto tersimpan lokal!');
      }
    } catch (err: any) {
      setUploadStatus('Gagal membaca foto.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700">{label}</label>
        
        {/* Method Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              tab === 'upload' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('preset')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              tab === 'preset' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Koleksi Pilihan</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              tab === 'url' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {/* 1. Tab Upload File dari Komputer / HP */}
      {tab === 'upload' && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-200 hover:border-teal-600 bg-teal-50/40 hover:bg-teal-50/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              {uploading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-teal-800" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div className="font-bold text-slate-800 text-xs">
              {uploading ? 'Sedang memproses foto...' : 'Klik untuk Pilih Foto dari Galeri HP / Komputer'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mendukung JPG, PNG, WEBP (Otomatis dioptimalkan & sinkron ke Drive)
            </p>
          </div>
        </div>
      )}

      {/* 2. Tab Pilihan Preset Koleksi */}
      {tab === 'preset' && (
        <div className="space-y-1.5">
          <select
            value={presets.some(p => p.url === currentUrl) ? currentUrl : ''}
            onChange={e => {
              if (e.target.value) onChangeUrl(e.target.value);
            }}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="">-- Pilih dari Koleksi Hasan Dekor --</option>
            {presets.map(p => (
              <option key={p.url} value={p.url}>{p.label}</option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 block">
            Pilihan foto resolusi tinggi siap pakai untuk kebutuhan showcase.
          </span>
        </div>
      )}

      {/* 3. Tab Input Link URL */}
      {tab === 'url' && (
        <div>
          <input
            type="text"
            value={currentUrl}
            onChange={e => onChangeUrl(e.target.value)}
            placeholder="https://... link gambar langsung"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-teal-700"
          />
        </div>
      )}

      {/* Status Alert if any */}
      {uploadStatus && (
        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[11px] font-semibold flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Live Thumbnail Preview */}
      {currentUrl && (
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 relative group">
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = '/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <span>Foto Terpasang</span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">Aktif</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5 max-w-xs">
              {currentUrl.startsWith('data:') ? 'Base64 Local Image File' : currentUrl}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition cursor-pointer shrink-0"
          >
            Ganti Foto
          </button>
        </div>
      )}
    </div>
  );
};
