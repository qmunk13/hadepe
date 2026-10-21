import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TreePine, 
  Flower2, 
  Package, 
  Printer, 
  RotateCcw, 
  AlertTriangle,
  Warehouse,
  Search,
  Filter
} from 'lucide-react';
import { Barang, PohonKatalog } from '../types';
import { toLusinPcs, formatLusinPcs } from './DatabaseBarangView';
import { formatRupiah } from '../utils/formatters';

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
  const [periode, setPeriode] = useState<'bulan' | 'global' | 'tahun' | 'manual'>('bulan');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [filterKategori, setFilterKategori] = useState('SEMUA');
  const [filterJenis, setFilterJenis] = useState('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories & Jenis options
  const categories = useMemo(() => {
    const raw = Array.from(new Set(barangList.map(b => b.kategori).filter(Boolean)));
    return ['SEMUA', ...raw];
  }, [barangList]);

  const jenisList = useMemo(() => {
    const raw = Array.from(new Set(barangList.map(b => b.jenis).filter(Boolean)));
    return ['SEMUA', ...raw];
  }, [barangList]);

  // Filtered barang list
  const filteredBarang = useMemo(() => {
    return barangList.filter(b => {
      const matchCat = filterKategori === 'SEMUA' || b.kategori === filterKategori;
      const matchJenis = filterJenis === 'SEMUA' || b.jenis === filterJenis;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || b.kode.toLowerCase().includes(q) || b.nama.toLowerCase().includes(q);
      return matchCat && matchJenis && matchSearch;
    });
  }, [barangList, filterKategori, filterJenis, searchQuery]);

  // Calculate summary metrics
  const totalSKU = filteredBarang.length;
  const totalStokFisik = filteredBarang.reduce((sum, b) => sum + Number(b.stokTotal || 0), 0);
  const totalTersedia = filteredBarang.reduce((sum, b) => sum + Number(b.stokTersedia || 0), 0);
  const totalDisewa = filteredBarang.reduce((sum, b) => sum + Number(b.stokDisewa || 0), 0);
  
  // Asumsi harga satuan default Rp 25.000 jika harga belum terisi untuk estimasi valuasi aset
  const totalValuasi = filteredBarang.reduce((sum, b) => {
    const harga = Number(b.hargaSatuan || 25000);
    return sum + (b.stokTotal * harga);
  }, 0);

  const lpFisik = toLusinPcs(totalStokFisik);
  const lpTersedia = toLusinPcs(totalTersedia);
  const lpDisewa = toLusinPcs(totalDisewa);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-teal-700 font-bold">Audit Inventaris & Keuangan</div>
          <h2 className="font-serif font-bold text-slate-900 text-xl sm:text-2xl mt-0.5">
            📈 Rekap Stok Akhir & Valuasi Aset
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Perhitungan stok menggunakan basis Pcs dan dikonversi otomatis ke Lusin + Pcs (1 Lusin = 12 Pcs) untuk akurasi audit fisik dan valuasi nilai aset.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={periode} 
            onChange={(e) => setPeriode(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="bulan">Bulan Ini</option>
            <option value="global">Semua Periode (Global)</option>
            <option value="tahun">Tahun Ini</option>
            <option value="manual">Manual (Rentang Tanggal)</option>
          </select>

          {periode === 'manual' && (
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <span className="text-xs text-slate-400">-</span>
              <input 
                type="date" 
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* 5 Metrik Utama Rekap Valuasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Item / SKU</div>
          <div className="text-2xl font-black text-slate-900">{totalSKU}</div>
          <div className="text-[11px] text-teal-700 font-semibold">{pohonList.length} Pohon + {barangList.length} Barang</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Stok Fisik</div>
          <div className="text-2xl font-black text-slate-900">{totalStokFisik.toLocaleString('id-ID')}</div>
          <div className="text-[11px] text-slate-500 font-bold">{lpFisik.lusin} Lusin + {lpFisik.pcs} Pcs</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-700">Stok Siap Sewa (Ready)</div>
          <div className="text-2xl font-black text-emerald-700">{totalTersedia.toLocaleString('id-ID')}</div>
          <div className="text-[11px] text-emerald-600 font-bold">{lpTersedia.lusin} Lusin + {lpTersedia.pcs} Pcs</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-amber-700">Sedang Disewa (Keluar)</div>
          <div className="text-2xl font-black text-amber-700">{totalDisewa.toLocaleString('id-ID')}</div>
          <div className="text-[11px] text-amber-600 font-bold">{lpDisewa.lusin} Lusin + {lpDisewa.pcs} Pcs</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-teal-800">Estimasi Valuasi Aset</div>
          <div className="text-xl sm:text-2xl font-black text-teal-800">{formatRupiah(totalValuasi)}</div>
          <div className="text-[11px] text-slate-400">Total inventaris gudang</div>
        </div>
      </div>

      {/* Filter Row: Kategori, Jenis & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kategori:</span>
          </div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <span>Jenis:</span>
          </div>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            {jenisList.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode / nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700"
          />
        </div>
      </div>

      {/* Tabel Audit Rekap Valuasi */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[950px]">
            <thead className="bg-slate-900 text-white text-[10px] uppercase font-semibold">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Jenis / Nama Barang</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Stok Fisik Total</th>
                <th className="p-3 text-right text-emerald-400">Stok Tersedia</th>
                <th className="p-3 text-right text-amber-400">Sedang Disewa</th>
                <th className="p-3 text-right">Nilai / Satuan</th>
                <th className="p-3 text-right">Subtotal Valuasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBarang.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada barang yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredBarang.map((b) => {
                  const harga = Number(b.hargaSatuan || 25000);
                  const subValuasi = b.stokTotal * harga;
                  const lpTot = toLusinPcs(b.stokTotal);
                  const lpTers = toLusinPcs(b.stokTersedia);
                  const lpDis = toLusinPcs(b.stokDisewa);

                  return (
                    <tr key={b.kode} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-teal-800">{b.kode}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{b.nama}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{b.jenis || '-'} · Rak: {b.lokasiRak || '-'}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {b.kategori}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        <div>{lpTot.lusin} L + {lpTot.pcs} P</div>
                        <div className="text-[9px] text-slate-400 font-normal">({b.stokTotal} {b.satuan})</div>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        <div>{lpTers.lusin} L + {lpTers.pcs} P</div>
                        <div className="text-[9px] text-emerald-600 font-normal">({b.stokTersedia} {b.satuan})</div>
                      </td>
                      <td className="p-3 text-right font-bold text-amber-700">
                        <div>{lpDis.lusin} L + {lpDis.pcs} P</div>
                        <div className="text-[9px] text-amber-600 font-normal">({b.stokDisewa} {b.satuan})</div>
                      </td>
                      <td className="p-3 text-right text-slate-600 font-medium">
                        {formatRupiah(harga)}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {formatRupiah(subValuasi)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
