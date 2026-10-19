import React, { useState } from 'react';
import { X, Save, TreePine } from 'lucide-react';
import { PohonKatalog } from '../types';
import { ImageUploadField } from './ImageUploadField';

interface EditPohonModalProps {
  pohon: PohonKatalog;
  kategoriList: string[];
  onClose: () => void;
  onSave: (kode: string, data: Partial<PohonKatalog>) => Promise<boolean>;
}

export const EditPohonModal: React.FC<EditPohonModalProps> = ({
  pohon,
  kategoriList,
  onClose,
  onSave
}) => {
  const [nama, setNama] = useState(pohon.nama);
  const [kategori, setKategori] = useState(pohon.kategori);
  const [tinggi, setTinggi] = useState(pohon.tinggi);
  const [fotoUrl, setFotoUrl] = useState(pohon.fotoUrl || '');
  const [stokTotal, setStokTotal] = useState(pohon.stokTotal);
  const [stokTersedia, setStokTersedia] = useState(pohon.stokTersedia);
  const [stokDisewa, setStokDisewa] = useState(pohon.stokDisewa);
  const [status, setStatus] = useState(pohon.statusKetersediaan);
  const [keterangan, setKeterangan] = useState(pohon.keterangan || '');
  const [widthSpread, setWidthSpread] = useState(pohon.widthSpread || '');
  const [trunkType, setTrunkType] = useState(pohon.trunkType || '');
  const [foliageType, setFoliageType] = useState(pohon.foliageType || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await onSave(pohon.kode, {
        nama,
        kategori,
        tinggi,
        fotoUrl,
        stokTotal: Number(stokTotal),
        stokTersedia: Number(stokTersedia),
        stokDisewa: Number(stokDisewa),
        statusKetersediaan: status,
        keterangan,
        widthSpread,
        trunkType,
        foliageType
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
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <TreePine className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Edit Pohon Artifisial</h3>
              <p className="text-xs text-slate-500 font-mono">Kode: {pohon.kode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pohon *</label>
              <input
                type="text"
                required
                value={nama}
                onChange={e => setNama(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Pohon *</label>
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              >
                {kategoriList.map(kat => (
                  <option key={kat} value={kat}>{kat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tinggi Pohon</label>
              <input
                type="text"
                value={tinggi}
                onChange={e => setTinggi(e.target.value)}
                placeholder="misal: 2.8 - 3.2 Meter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lebar Tajuk / Kanopi</label>
              <input
                type="text"
                value={widthSpread}
                onChange={e => setWidthSpread(e.target.value)}
                placeholder="misal: 2.4 Meter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bahan Batang Utama</label>
              <input
                type="text"
                value={trunkType}
                onChange={e => setTrunkType(e.target.value)}
                placeholder="misal: Kayu Alami Dilapisi Anti Rayap"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bahan & Karakter Daun</label>
              <input
                type="text"
                value={foliageType}
                onChange={e => setFoliageType(e.target.value)}
                placeholder="misal: Daun Silk Premium Halus"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Total</label>
              <input
                type="number"
                min="0"
                value={stokTotal}
                onChange={e => setStokTotal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tersedia</label>
              <input
                type="number"
                min="0"
                value={stokTersedia}
                onChange={e => setStokTersedia(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Disewa</label>
              <input
                type="number"
                min="0"
                value={stokDisewa}
                onChange={e => setStokDisewa(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Sedang Dibooking">Sedang Dibooking</option>
                <option value="Perawatan">Perawatan</option>
              </select>
            </div>
          </div>

          <ImageUploadField
            label="Foto Pohon (Upload dari Galeri HP / Komputer atau Pilih Koleksi)"
            currentUrl={fotoUrl}
            onChangeUrl={setFotoUrl}
            type="pohon"
          />

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Catatan Spesifikasi</label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Catatan keunggulan pohon, instalasi, dan kecocokan panggung..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
