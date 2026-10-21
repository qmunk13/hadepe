import React, { useState } from 'react';
import { X, Plus, TreePine } from 'lucide-react';
import { PohonKatalog } from '../types';
import { ImageUploadField } from './ImageUploadField';

interface TambahPohonModalProps {
  isOpen: boolean;
  kategoriList: string[];
  existingCodes: string[];
  onClose: () => void;
  onSave: (data: Partial<PohonKatalog>) => Promise<boolean>;
}

export const TambahPohonModal: React.FC<TambahPohonModalProps> = ({
  isOpen,
  kategoriList,
  existingCodes,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const nextCodeNumber = existingCodes.length + 1;
  const suggestedCode = `PHN-00${nextCodeNumber}`;

  const [kode, setKode] = useState(suggestedCode);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState(kategoriList[0] || 'Pohon Besar');
  const [tinggi, setTinggi] = useState('2.8 - 3.2 Meter');
  const [widthSpread, setWidthSpread] = useState('2.2 Meter');
  const [trunkType, setTrunkType] = useState('Batang Kayu Kering Alami Dilapisi Anti Rayap');
  const [foliageType, setFoliageType] = useState('Daun Silk Premium Halus');
  const [stokTotal, setStokTotal] = useState(3);
  const [fotoUrl, setFotoUrl] = useState('/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg');
  const [keterangan, setKeterangan] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode.trim() || !nama.trim()) return;

    setSaving(true);
    try {
      const success = await onSave({
        kode: kode.trim().toUpperCase(),
        nama: nama.trim(),
        kategori,
        tinggi,
        widthSpread,
        trunkType,
        foliageType,
        stokTotal: Number(stokTotal) || 1,
        stokTersedia: Number(stokTotal) || 1,
        stokDisewa: 0,
        statusKetersediaan: 'Tersedia',
        fotoUrl: fotoUrl.trim(),
        keterangan: keterangan.trim(),
        highlights: ['Batang kayu alami', 'Sistem knockdown kokoh', 'Daun rimbun premium'],
        recommendedFor: ['Panggung Pelaminan', 'Entrance Gate', 'Photobooth']
      });

      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <TreePine className="w-5 h-5 text-teal-200" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base">Tambah Pohon Artifisial Baru</h3>
              <p className="text-xs text-teal-200">Menambahkan varian pohon baru ke katalog dan gudang HD-Pohon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-teal-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Pohon *</label>
              <input
                type="text"
                required
                value={kode}
                onChange={e => setKode(e.target.value)}
                placeholder="misal: PHN-007"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Pohon *</label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-semibold"
              >
                {kategoriList.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Pohon Lengkap *</label>
              <input
                type="text"
                required
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="misal: Pohon Zaitun Mediterania Silver"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tinggi Pohon</label>
              <input
                type="text"
                value={tinggi}
                onChange={e => setTinggi(e.target.value)}
                placeholder="misal: 2.5 - 3.0 Meter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lebar Tajuk / Rimbun</label>
              <input
                type="text"
                value={widthSpread}
                onChange={e => setWidthSpread(e.target.value)}
                placeholder="misal: 2.0 Meter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bahan Batang</label>
              <input
                type="text"
                value={trunkType}
                onChange={e => setTrunkType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bahan & Tipe Daun</label>
              <input
                type="text"
                value={foliageType}
                onChange={e => setFoliageType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Unit Awal *</label>
              <input
                type="number"
                min="1"
                required
                value={stokTotal}
                onChange={e => setStokTotal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadField
                label="Foto Pohon (Upload dari Galeri HP / Komputer atau Pilih Koleksi)"
                currentUrl={fotoUrl}
                onChangeUrl={setFotoUrl}
                type="pohon"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan & Deskripsi</label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Deskripsi keunggulan pohon dekorasi..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Tambah ke Katalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
