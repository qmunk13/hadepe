import React, { useState } from 'react';
import { X, ArrowDownToLine, Package } from 'lucide-react';
import { Barang, Supplier } from '../types';

interface TambahStokModalProps {
  isOpen: boolean;
  barangList: Barang[];
  supplierList?: Supplier[];
  onClose: () => void;
  onSave: (payload: {
    kode: string;
    qty: number;
    supplier: string;
    noRef?: string;
    catatan?: string;
  }) => Promise<boolean>;
}

export const TambahStokModal: React.FC<TambahStokModalProps> = ({
  isOpen,
  barangList,
  supplierList = [],
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [selectedKode, setSelectedKode] = useState(barangList[0]?.kode || '');
  const [qty, setQty] = useState(10);
  const [supplier, setSupplier] = useState(supplierList[0]?.nama || 'PT Flora Artifisial Indonesia');
  const [noRef, setNoRef] = useState(`PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`);
  const [catatan, setCatatan] = useState('Restock barang dari supplier / vendor mitra');
  const [saving, setSaving] = useState(false);

  const currentBarang = barangList.find(b => b.kode === selectedKode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKode || qty <= 0) return;

    setSaving(true);
    try {
      const success = await onSave({
        kode: selectedKode,
        qty: Number(qty),
        supplier,
        noRef,
        catatan
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
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <ArrowDownToLine className="w-5 h-5 text-emerald-200" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base">Tambah Stok Masuk Supplier</h3>
              <p className="text-xs text-emerald-200">Menambah stok fisik barang dan mencatat mutasi masuk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Barang yang Masuk *</label>
            <select
              required
              value={selectedKode}
              onChange={e => setSelectedKode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 focus:bg-white text-xs font-semibold"
            >
              {barangList.map(b => (
                <option key={b.kode} value={b.kode}>
                  [{b.kode}] {b.nama} (Stok Saat Ini: {b.stokTersedia} {b.satuan})
                </option>
              ))}
            </select>
          </div>

          {currentBarang && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-emerald-900">
              <div>
                <span className="font-semibold block">{currentBarang.nama}</span>
                <span className="text-[11px] text-emerald-700">Kategori: {currentBarang.kategori} | Lokasi: {currentBarang.lokasiRak || '-'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Tersedia</span>
                <span className="font-bold text-base">{currentBarang.stokTersedia} {currentBarang.satuan}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Masuk *</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 focus:bg-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Supplier / Vendor</label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="Nama Toko / Pabrik"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">No. Surat Jalan / Nota Pembelian</label>
            <input
              type="text"
              value={noRef}
              onChange={e => setNoRef(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>{saving ? 'Memproses...' : 'Tambah ke Stok'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
