import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Transaksi, Penyewaan } from '../types';
import { Pagination } from './Pagination';
import { formatDateTimeIndo, formatDateIndo } from '../utils/formatters';
import { toLusinPcs } from './DatabaseBarangView';

interface RiwayatTransaksiViewProps {
  transaksiList: Transaksi[];
  penyewaanList: Penyewaan[];
  onOpenInvoice: (noSewa: string) => void;
  onRefresh: () => void;
}

export const RiwayatTransaksiView: React.FC<RiwayatTransaksiViewProps> = ({
  transaksiList,
  penyewaanList,
  onOpenInvoice
}) => {
  const [subTab, setSubTab] = useState<'transaksi' | 'penyewaan'>('transaksi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenis, setSelectedJenis] = useState<string>('SEMUA');
  const [selectedStatusSewa, setSelectedStatusSewa] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter Mutasi Transaksi
  const filteredTransaksi = transaksiList.filter(t => {
    const matchJenis = selectedJenis === 'SEMUA' || t.jenis === selectedJenis;
    const q = searchQuery.toLowerCase().trim();
    const matchQ = !q || (
      ((t.kode || t.kodeBarang || '')).toLowerCase().includes(q) ||
      t.namaBarang.toLowerCase().includes(q) ||
      (t.noRef || '').toLowerCase().includes(q) ||
      (t.namaPihak || '').toLowerCase().includes(q)
    );
    return matchJenis && matchQ;
  });

  // Filter Penyewaan
  const filteredPenyewaan = penyewaanList.filter(s => {
    const matchStatus = selectedStatusSewa === 'SEMUA' || s.status === selectedStatusSewa;
    const q = searchQuery.toLowerCase().trim();
    const matchQ = !q || (
      s.noSewa.toLowerCase().includes(q) ||
      s.namaPelanggan.toLowerCase().includes(q) ||
      (s.alamat || '').toLowerCase().includes(q)
    );
    return matchStatus && matchQ;
  });

  const totalPages = subTab === 'transaksi' 
    ? Math.ceil(filteredTransaksi.length / pageSize) || 1
    : Math.ceil(filteredPenyewaan.length / pageSize) || 1;

  const paginatedTransaksi = filteredTransaksi.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedPenyewaan = filteredPenyewaan.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getJenisBadge = (jenis: Transaksi['jenis']) => {
    switch (jenis) {
      case 'KELUAR_SEWA':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800"><ArrowUpRight className="w-3 h-3" /> Sewa Keluar</span>;
      case 'KEMBALI_BAGUS':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800"><RotateCcw className="w-3 h-3" /> Kembali Bagus</span>;
      case 'BARANG_RUSAK':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800"><AlertTriangle className="w-3 h-3" /> Rusak</span>;
      case 'BARANG_HILANG':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800"><AlertTriangle className="w-3 h-3" /> Hilang</span>;
      case 'MASUK_SUPPLIER':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800"><ArrowDownLeft className="w-3 h-3" /> Masuk Supplier</span>;
      case 'PENYESUAIAN_OPNAME':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">Opname Stok</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">{jenis}</span>;
    }
  };

  const getSewaStatusBadge = (status: Penyewaan['status']) => {
    switch (status) {
      case 'AKTIF':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-xs">Sedang Disewa (Aktif)</span>;
      case 'SELESAI':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-lg text-xs">Selesai (Kembali Penuh)</span>;
      case 'SELESAI_DENGAN_CATATAN':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 font-bold rounded-lg text-xs">Selesai (Ada Rusak/Hilang)</span>;
      case 'BATAL':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-lg text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">Laporan Mutasi Stok & Surat Jalan Sewa</h2>
              <p className="text-xs text-slate-500">Catatan riwayat arus barang dekorasi, audit operasional, dan arsip cetak surat jalan.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Toggle Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setSubTab('transaksi'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'transaksi' 
              ? 'bg-teal-900 text-white shadow-xs' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mutasi Arus Barang ({filteredTransaksi.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('penyewaan'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'penyewaan' 
              ? 'bg-teal-900 text-white shadow-xs' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Surat Jalan & Kontrak Sewa ({filteredPenyewaan.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={subTab === 'transaksi' ? "Cari kode, nama barang, nomor ref/nota, pihak..." : "Cari no sewa, WO/pelanggan, alamat..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 focus:bg-white text-xs"
          />
        </div>

        {subTab === 'transaksi' ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 shrink-0">Jenis:</span>
            <select
              value={selectedJenis}
              onChange={e => { setSelectedJenis(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 text-xs font-semibold"
            >
              <option value="SEMUA">Semua Jenis Mutasi</option>
              <option value="KELUAR_SEWA">Sewa Keluar</option>
              <option value="KEMBALI_BAGUS">Kembali Bagus</option>
              <option value="BARANG_RUSAK">Barang Rusak</option>
              <option value="BARANG_HILANG">Barang Hilang</option>
              <option value="MASUK_SUPPLIER">Masuk Supplier</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 shrink-0">Status:</span>
            <select
              value={selectedStatusSewa}
              onChange={e => { setSelectedStatusSewa(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-700 text-xs font-semibold"
            >
              <option value="SEMUA">Semua Status Sewa</option>
              <option value="AKTIF">Sedang Disewa (Aktif)</option>
              <option value="SELESAI">Selesai (Kembali Penuh)</option>
              <option value="SELESAI_DENGAN_CATATAN">Selesai (Ada Rusak/Hilang)</option>
              <option value="BATAL">Dibatalkan</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Content */}
      {subTab === 'transaksi' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Kode & Barang</th>
                  <th className="py-3 px-4 text-center">Jumlah</th>
                  <th className="py-3 px-4">No. Ref / Sewa</th>
                  <th className="py-3 px-4">Pihak / Mitra</th>
                  <th className="py-3 px-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada catatan mutasi yang cocok.
                    </td>
                  </tr>
                ) : (
                  paginatedTransaksi.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {formatDateTimeIndo(t.tanggal)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getJenisBadge(t.jenis)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.namaBarang}</div>
                        <div className="font-mono text-[10px] text-teal-700">{t.kode} &bull; {t.kategori}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        <div>{toLusinPcs(t.qty).lusin} L + {toLusinPcs(t.qty).pcs} P</div>
                        <div className="text-[10px] font-normal text-slate-400">({t.qty} {t.satuan || 'Pcs'})</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {t.noRef || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {t.namaPihak || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {t.user || 'admin'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedTransaksi.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada catatan mutasi yang cocok.
              </div>
            ) : (
              paginatedTransaksi.map(t => (
                <div key={t.id} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">
                      {formatDateTimeIndo(t.tanggal)}
                    </span>
                    {getJenisBadge(t.jenis)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{t.namaBarang}</div>
                    <div className="text-[10px] text-teal-700 font-mono mt-0.5">{t.kode} &bull; {t.kategori}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                    <span className="text-slate-500">Jumlah Mutasi:</span>
                    <span className="font-bold text-slate-900">{t.qty} {t.satuan}</span>
                  </div>
                  {(t.noRef || t.namaPihak) && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Ref: <span className="font-mono font-medium text-slate-700">{t.noRef || '-'}</span></span>
                      <span>Mitra: <span className="font-medium text-slate-700">{t.namaPihak || '-'}</span></span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredTransaksi.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemName="catatan mutasi"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">No. Surat Jalan</th>
                  <th className="py-3 px-4">Tgl Sewa - Kembali</th>
                  <th className="py-3 px-4">Pelanggan / WO</th>
                  <th className="py-3 px-4 text-center">Total Item</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPenyewaan.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada data penyewaan yang cocok.
                    </td>
                  </tr>
                ) : (
                  paginatedPenyewaan.map(s => (
                    <tr key={s.noSewa} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        {s.noSewa}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div>{formatDateIndo(s.tglSewa)} s/d</div>
                        <div className="font-semibold text-slate-900">{formatDateIndo(s.tglKembali)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.namaPelanggan}</div>
                        <div className="text-[11px] text-slate-500">{s.noTelepon} &bull; {s.alamat}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {s.totalItem} jenis ({s.totalQty} pcs)
                      </td>
                      <td className="py-3 px-4">
                        {getSewaStatusBadge(s.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenInvoice(s.noSewa)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak SPK</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedPenyewaan.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada data penyewaan yang cocok.
              </div>
            ) : (
              paginatedPenyewaan.map(s => (
                <div key={s.noSewa} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-800 text-xs">
                      {s.noSewa}
                    </span>
                    {getSewaStatusBadge(s.status)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{s.namaPelanggan}</div>
                    <div className="text-xs text-slate-500 mt-0.5">📞 {s.noTelepon}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                    <div>Periode: <span className="font-medium text-slate-800">{formatDateIndo(s.tglSewa)} s/d {formatDateIndo(s.tglKembali)}</span></div>
                    <div className="mt-0.5 font-semibold text-teal-700">{s.totalItem} jenis ({s.totalQty} pcs)</div>
                  </div>
                  <button
                    onClick={() => onOpenInvoice(s.noSewa)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Surat Jalan</span>
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPenyewaan.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemName="surat jalan sewa"
            />
          </div>
        </div>
      )}

    </div>
  );
};
