import React from 'react';
import { 
  BarChart3, 
  TreePine, 
  Flower2, 
  Package, 
  MapPin, 
  Printer, 
  RotateCcw, 
  AlertTriangle,
  Warehouse 
} from 'lucide-react';
import { Barang, PohonKatalog } from '../types';
import { formatNumberIndo } from '../utils/formatters';

interface RekapValuasiViewProps {
  pohonList: PohonKatalog[];
  barangList: Barang[];
  onRefresh: () => void;
}

export const RekapValuasiView: React.FC<RekapValuasiViewProps> = ({
  pohonList,
  barangList,
  onRefresh
}) => {
  let totalPohonUnit = 0;
  let pohonTersedia = 0;
  let pohonDisewa = 0;
  const rekapPohonKat: { [kat: string]: { varian: number; unit: number; tersedia: number; disewa: number } } = {};
  pohonList.forEach(p => {
    totalPohonUnit += (p.stokTotal || 0);
    pohonTersedia += (p.stokTersedia || 0);
    pohonDisewa += (p.stokDisewa || 0);
    if (!rekapPohonKat[p.kategori]) {
      rekapPohonKat[p.kategori] = { varian: 0, unit: 0, tersedia: 0, disewa: 0 };
    }
    rekapPohonKat[p.kategori].varian++;
    rekapPohonKat[p.kategori].unit += (p.stokTotal || 0);
    rekapPohonKat[p.kategori].tersedia += (p.stokTersedia || 0);
    rekapPohonKat[p.kategori].disewa += (p.stokDisewa || 0);
  });

  let totalBarangFisik = 0;
  let barangTersedia = 0;
  let barangDisewa = 0;
  let lowStockCount = 0;
  const rekapBarangKat: { [kat: string]: { jenisCount: number; totalFisik: number; tersedia: number; disewa: number } } = {};
  const rekapRak: { [rak: string]: { itemCount: number; totalQty: number } } = {};
  barangList.forEach(b => {
    totalBarangFisik += b.stokTotal;
    barangTersedia += b.stokTersedia;
    barangDisewa += b.stokDisewa;
    if (b.stokTersedia <= 10) lowStockCount++;
    if (!rekapBarangKat[b.kategori]) {
      rekapBarangKat[b.kategori] = { jenisCount: 0, totalFisik: 0, tersedia: 0, disewa: 0 };
    }
    rekapBarangKat[b.kategori].jenisCount++;
    rekapBarangKat[b.kategori].totalFisik += b.stokTotal;
    rekapBarangKat[b.kategori].tersedia += b.stokTersedia;
    rekapBarangKat[b.kategori].disewa += b.stokDisewa;

    const rakName = b.lokasiRak || 'Gudang Utama / Belum Diplot';
    if (!rekapRak[rakName]) {
      rekapRak[rakName] = { itemCount: 0, totalQty: 0 };
    }
    rekapRak[rakName].itemCount++;
    rekapRak[rakName].totalQty += b.stokTotal;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
            <BarChart3 className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Rekap Stok Akhir & Valuasi Aset Gudang</h2>
            <p className="text-xs text-slate-500">Laporan komprehensif audit fisik inventaris pohon artifisial, material bunga, properti, dan utilisasi rak gudang.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto no-print">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF Rekap</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Pohon Artifisial</span>
            <TreePine className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {formatNumberIndo(totalPohonUnit)} <span className="text-xs font-sans font-medium text-slate-500">Unit ({pohonList.length} varian)</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold">
              {pohonTersedia} Ready
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold">
              {pohonDisewa} Disewa
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Barang Non-Pohon</span>
            <Flower2 className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {formatNumberIndo(totalBarangFisik)} <span className="text-xs font-sans font-medium text-slate-500">Fisik ({barangList.length} SKU)</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold">
              {formatNumberIndo(barangTersedia)} Ready
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold">
              {formatNumberIndo(barangDisewa)} Disewa
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Tingkat Utilisasi</span>
            <Package className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {totalBarangFisik > 0 ? ((barangDisewa / totalBarangFisik) * 100).toFixed(1) : '0'}%
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Rasio stok barang yang sedang aktif tersewa di lapangan saat ini.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Peringatan Stok</span>
            <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">
            {lowStockCount} <span className="text-xs font-sans font-medium text-slate-500">SKU Menipis</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Barang dengan stok tersedia di bawah 10 unit perlu reorder supplier.
          </p>
        </div>
      </div>

      {/* Grid Dua Kolom: Rekap Per Kategori Pohon & Barang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <TreePine className="w-4 h-4 text-teal-700" />
              <span>Rekap Pohon Artifisial Per Kategori</span>
            </h3>
            <span className="text-xs font-bold text-teal-800">{pohonList.length} Varian</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Kategori Pohon</th>
                  <th className="px-4 py-2.5 text-center">Varian</th>
                  <th className="px-4 py-2.5 text-center">Total Unit</th>
                  <th className="px-4 py-2.5 text-center">Tersedia</th>
                  <th className="px-4 py-2.5 text-center">Disewa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {Object.entries(rekapPohonKat).map(([kat, val]) => (
                  <tr key={kat} className="hover:bg-teal-50/30">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{kat}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-slate-600">{val.varian}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-slate-800">{val.unit}</td>
                    <td className="px-4 py-2.5 text-center text-emerald-700 font-bold">{val.tersedia}</td>
                    <td className="px-4 py-2.5 text-center text-amber-700 font-bold">{val.disewa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-teal-700" />
              <span>Rekap Barang Gudang Per Kategori</span>
            </h3>
            <span className="text-xs font-bold text-teal-800">{barangList.length} SKU</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Kategori Barang</th>
                  <th className="px-4 py-2.5 text-center">Jumlah SKU</th>
                  <th className="px-4 py-2.5 text-center">Total Fisik</th>
                  <th className="px-4 py-2.5 text-center">Tersedia</th>
                  <th className="px-4 py-2.5 text-center">Disewa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {Object.entries(rekapBarangKat).map(([kat, val]) => (
                  <tr key={kat} className="hover:bg-teal-50/30">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{kat}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-slate-600">{val.jenisCount}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-slate-800">{formatNumberIndo(val.totalFisik)}</td>
                    <td className="px-4 py-2.5 text-center text-emerald-700 font-bold">{formatNumberIndo(val.tersedia)}</td>
                    <td className="px-4 py-2.5 text-center text-amber-700 font-bold">{formatNumberIndo(val.disewa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Lokasi Rak */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-teal-700" />
            <span>Audit Lokasi Rak & Posisi Fisik Gudang</span>
          </h3>
          <span className="text-xs text-slate-500">{Object.keys(rekapRak).length} Lokasi Rak Terpetakan</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(rekapRak).map(([rak, val]) => (
            <div key={rak} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{rak}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Menyimpan <span className="font-semibold text-slate-700">{val.itemCount} macam barang</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-teal-800">{formatNumberIndo(val.totalQty)}</div>
                <div className="text-[9px] text-slate-400">Total Unit</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
