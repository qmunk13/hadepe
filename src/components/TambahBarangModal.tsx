import React, { useState } from 'react';
import { X, Plus, Flower2 } from 'lucide-react';
import { Barang } from '../types';
import { ImageUploadField } from './ImageUploadField';

interface TambahBarangModalProps {
  isOpen: boolean;
  kategoriList: string[];
  jenisList?: string[];
  satuanList?: string[];
  lokasiList?: string[];
  existingCodes: string[];
  onClose: () => void;
  onSave: (data: Partial<Barang>) => Promise<boolean>;
}

export const TambahBarangModal: React.FC<TambahBarangModalProps> = ({
  isOpen,
  kategoriList,
  jenisList = [],
  satuanList = [],
  lokasiList = [],
  existingCodes,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const nextCodeNum = existingCodes.length + 1;
  const suggestedCode = `BRG-${String(nextCodeNum).padStart(3, '0')}`;

  const [kode, setKode] = useState(suggestedCode);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState(kategoriList[0] || 'Bunga');
  const [jenis, setJenis] = useState(jenisList[0] || 'Bunga Mawar');
  const [satuan, setSatuan] = useState(satuanList[0] || 'Tangkai');
  const [lokasiRak, setLokasiRak] = useState(lokasiList[0] || 'Rak A1 - Box Bunga Mawar');
  const [stokTotal, setStokTotal] = useState(50);
  const [fotoUrl, setFotoUrl] = useState('');
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
        jenis: jenis.trim(),
        satuan,
        lokasiRak,
        stokTotal: Number(stokTotal) || 0,
        stokTersedia: Number(stokTotal) || 0,
        stokDisewa: 0,
        fotoUrl: fotoUrl.trim(),
        keterangan: keterangan.trim()
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
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <Flower2 className="w-5 h-5 text-teal-200" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base">Tambah Barang Gudang Baru</h3>
              <p className="text-xs text-teal-200">Input bunga, daun, properti pilar atau aksesoris dekorasi</p>
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
              <label className="block font-semibold text-slate-700 mb-1">Kode Barang *</label>
              <input
                type="text"
                required
                value={kode}
                onChange={e => setKode(e.target.value)}
                placeholder="misal: BRG-025"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Barang *</label>
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
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Barang Lengkap *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="misal: Bunga Peony Silk Pastel Peach"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Barang</label>
              <input
                type="text"
                value={jenis}
                onChange={e => setJenis(e.target.value)}
                placeholder="misal: Bunga Peony"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
              <select
                value={satuan}
                onChange={e => setSatuan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {(satuanList.length > 0 ? satuanList : ['Tangkai', 'Ikat', 'Lembar', 'Unit', 'Set', 'Box']).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Awal Fisik *</label>
              <input
                type="number"
                min="0"
                required
                value={stokTotal}
                onChange={e => setStokTotal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Rak Simpan</label>
              <select
                value={lokasiRak}
                onChange={e => setLokasiRak(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {(lokasiList.length > 0 ? lokasiList : ['Rak A1 - Box Bunga Mawar', 'Rak B1 - Daun Monstera', 'Rak C1 - Standing Besi']).map(lok => (
                  <option key={lok} value={lok}>{lok}</option>
                ))}
              </select>
            </div>
          </div>

          <ImageUploadField
            label="Foto Barang / Properti (Upload dari Galeri HP / Komputer atau Link)"
            currentUrl={fotoUrl}
            onChangeUrl={setFotoUrl}
            type="barang"
          />

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan / Kondisi</label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Warna, kelengkapan, atau instruksi penyimpanan..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
              <span>{saving ? 'Menyimpan...' : 'Simpan Barang Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
