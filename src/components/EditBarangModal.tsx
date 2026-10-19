import React, { useState } from 'react';
import { X, Save, Flower2 } from 'lucide-react';
import { Barang } from '../types';
import { ImageUploadField } from './ImageUploadField';

interface EditBarangModalProps {
  barang: Barang;
  kategoriList: string[];
  jenisList?: string[];
  satuanList?: string[];
  lokasiList?: string[];
  onClose: () => void;
  onSave: (kode: string, data: Partial<Barang>) => Promise<boolean>;
}

export const EditBarangModal: React.FC<EditBarangModalProps> = ({
  barang,
  kategoriList,
  jenisList = [],
  satuanList = [],
  lokasiList = [],
  onClose,
  onSave
}) => {
  const [nama, setNama] = useState(barang.nama);
  const [kategori, setKategori] = useState(barang.kategori);
  const [jenis, setJenis] = useState(barang.jenis);
  const [stokTotal, setStokTotal] = useState(barang.stokTotal);
  const [stokTersedia, setStokTersedia] = useState(barang.stokTersedia);
  const [stokDisewa, setStokDisewa] = useState(barang.stokDisewa);
  const [satuan, setSatuan] = useState(barang.satuan);
  const [lokasiRak, setLokasiRak] = useState(barang.lokasiRak || '');
  const [fotoUrl, setFotoUrl] = useState(barang.fotoUrl || '');
  const [keterangan, setKeterangan] = useState(barang.keterangan || '');
  const [saving, setSaving] = useState(false);

  const defaultSatuan = ['Tangkai', 'Ikat', 'Lembar', 'Unit', 'Set', 'Box', 'Roll', 'Lusin'];
  const satList = satuanList.length > 0 ? satuanList : defaultSatuan;

  const defaultLokasi = [
    'Rak A1 - Box Bunga Mawar',
    'Rak A2 - Box Hydrangea & Peony',
    'Rak A3 - Bunga Anggrek Gantung',
    'Rak B1 - Daun Monstera & Palem',
    'Rak C1 - Standing Flower Besi',
    'Rak C2 - Lampu & Kabel Kelistrikan',
    'Hanggar Pohon A - Pohon Besar',
    'Hanggar Pohon B - Pohon Karakter'
  ];
  const lokList = lokasiList.length > 0 ? lokasiList : defaultLokasi;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await onSave(barang.kode, {
        nama,
        kategori,
        jenis,
        stokTotal: Number(stokTotal),
        stokTersedia: Number(stokTersedia),
        stokDisewa: Number(stokDisewa),
        satuan,
        lokasiRak,
        fotoUrl,
        keterangan
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
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Flower2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Edit Barang Gudang</h3>
              <p className="text-xs text-slate-500 font-mono">Kode: {barang.kode}</p>
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Barang *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={e => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Jenis Barang</label>
              <input
                type="text"
                value={jenis}
                onChange={e => setJenis(e.target.value)}
                placeholder="misal: Bunga Mawar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stok Total</label>
              <input
                type="number"
                min="0"
                value={stokTotal}
                onChange={e => setStokTotal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tersedia</label>
              <input
                type="number"
                min="0"
                value={stokTersedia}
                onChange={e => setStokTersedia(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-teal-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Disewa</label>
              <input
                type="number"
                min="0"
                value={stokDisewa}
                onChange={e => setStokDisewa(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-amber-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan *</label>
              <select
                value={satuan}
                onChange={e => setSatuan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {satList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Rak Simpan</label>
              <select
                value={lokasiRak}
                onChange={e => setLokasiRak(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">-- Pilih Lokasi Rak --</option>
                {lokList.map(lok => (
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
              placeholder="Keterangan spesifikasi barang, warna, kelengkapan..."
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
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
