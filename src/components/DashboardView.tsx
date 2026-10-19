import React, { useState } from 'react';
import { 
  TreePine, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight,
  Printer,
  Sparkles,
  RefreshCw,
  Flower2,
  Globe,
  Database,
  ExternalLink,
  Info,
  X,
  Package,
  Calendar,
  MapPin,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { Barang, PohonKatalog, Penyewaan, GOOGLE_WORKSPACE_CONFIG } from '../types';

interface DashboardViewProps {
  pohonList: PohonKatalog[];
  barangList: Barang[];
  penyewaan: Penyewaan[];
  onNavigateTab: (tab: string) => void;
  onOpenReturn: (noSewa: string) => void;
  onOpenInvoice: (noSewa: string) => void;
  onOpenPublicPortal: () => void;
  onRefresh?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pohonList,
  barangList,
  penyewaan,
  onNavigateTab,
  onOpenReturn,
  onOpenInvoice,
  onOpenPublicPortal,
  onRefresh
}) => {
  const totalPohon = pohonList.length;
  const totalBarang = barangList.length;
  const totalStokTersedia = barangList.reduce((sum, b) => sum + b.stokTersedia, 0);
  const totalStokDisewa = barangList.reduce((sum, b) => sum + b.stokDisewa, 0);
  const sewaAktif = penyewaan.filter(s => s.status === 'AKTIF');
  const lowStockItems = barangList.filter(b => b.stokTersedia <= 10);
  const [showRincianModal, setShowRincianModal] = useState(false);
  const barangDisewaList = barangList.filter(b => (b.stokDisewa || 0) > 0);

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase mb-3 text-teal-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Manajemen Stok & Portal Katalog Dekorasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Dashboard Hasan Dekor Pohon
          </h2>
          <div className="flex flex-wrap gap-2.5 mt-6">
            <button
              onClick={onOpenPublicPortal}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Buka Portal Publik</span>
            </button>
            <button
              onClick={() => onNavigateTab('database')}
              className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-semibold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Flower2 className="w-4 h-4 text-teal-700" />
              <span>Database Bunga & Daun</span>
            </button>
            <button
              onClick={() => onNavigateTab('sewa')}
              className="px-4 py-2.5 bg-teal-900/60 hover:bg-teal-900/80 text-white font-semibold text-xs rounded-xl border border-white/20 transition cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Sewa Baru</span>
            </button>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
          <TreePine className="w-64 h-64" />
        </div>
      </div>

      {/* Kartu Status Integrasi Google Spreadsheet & WhatsApp */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-50/50 via-white to-emerald-50/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Google Spreadsheet &amp; Drive</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Tersinkron
              </span>
            </div>
            
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateTab('pengaturan')}
            title="Klik untuk mengubah nomor WhatsApp reservasi"
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
            <span>Pengaturan</span>
          </button>
          <a
            href={GOOGLE_WORKSPACE_CONFIG.spreadsheetUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 transition"
          >
            <span>📊 Sheet</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <a
            href="https://drive.google.com/drive/folders/1r3kMLLGRncOQUbcaItDDfYV8Nyu7LSQN"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 transition"
          >
            <span>🌳 Pohon</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <a
            href="https://drive.google.com/drive/folders/1UyXd9bssw2Sn-i57T51WnIFudcfwstzF"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl shadow-2xs flex items-center gap-1.5 transition"
          >
            <span>🌸 Barang</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pohon di Katalog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pohon di Katalog</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <TreePine className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPohon}</div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">Tampil di portal publik </div>
        </div>

        {/* Card 2: Material Bunga & Daun */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Database Barang</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Flower2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{totalBarang} Item</div>
          <div className="text-[11px] text-slate-400 mt-1">Bunga, daun, properti, aksesoris</div>
        </div>

        {/* Card 3: Stok Tersedia di Gudang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stok Tersedia</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-700">{totalStokTersedia}</div>
          <div className="text-[11px] text-slate-400 mt-1">Siap dipakai & disewakan</div>
        </div>

        {/* Card 4: Sewa Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Penyewaan Aktif</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700">{sewaAktif.length} Sewa Berjalan</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between flex-wrap gap-1">
              <span>
                <strong className="text-amber-800 font-bold">{totalStokDisewa} unit barang</strong> di lokasi acara
              </span>
              <button
                type="button"
                onClick={() => setShowRincianModal(true)}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-bold underline cursor-pointer inline-flex items-center gap-0.5 ml-auto"
                title="Lihat rincian darimana angka unit ini berasal"
              >
                <span>Lihat Rincian</span>
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
            Total barang (bunga/daun/properti) yang sedang dibawa dan dipakai di gedung acara pernikahan
          </p>
        </div>
      </div>

      {/* 2 Columns: Penyewaan Terbaru & Peringatan Stok Kritis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table: Penyewaan Aktif (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Daftar Penyewaan Aktif (Bunga, Daun, Properti)</h3>
                <p className="text-xs text-slate-400">Penyewa yang saat ini sedang menggunakan perlengkapan dekorasi</p>
              </div>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {/* Tampilan Desktop: Tabel */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">No Sewa</th>
                    <th className="py-2.5 px-3">Pelanggan</th>
                    <th className="py-2.5 px-3">Tgl Rencana Kembali</th>
                    <th className="py-2.5 px-2 text-center">Total Qty</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sewaAktif.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada penyewaan aktif saat ini.
                      </td>
                    </tr>
                  ) : (
                    sewaAktif.map(s => {
                      const tglKembaliStr = s.tglKembali ? new Date(s.tglKembali).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-';
                      return (
                        <tr key={s.noSewa} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-mono font-bold text-teal-800">
                            {s.noSewa}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {s.namaPelanggan}
                            <div className="text-[10px] text-slate-400 font-normal">{s.noTelepon}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {tglKembaliStr}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-slate-800">
                            {s.totalQty} Item
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onOpenReturn(s.noSewa)}
                                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-[11px] rounded-lg transition cursor-pointer"
                                title="Form Pengembalian Pintar"
                              >
                                Kembali
                              </button>
                              <button
                                onClick={() => onOpenInvoice(s.noSewa)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                                title="Cetak Surat Jalan / Bukti Sewa"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Tampilan Khusus Mobile / HP: Card List Elegan */}
            <div className="md:hidden space-y-3">
              {sewaAktif.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  Tidak ada penyewaan aktif saat ini.
                </div>
              ) : (
                sewaAktif.map(s => {
                  const tglKembaliStr = s.tglKembali ? new Date(s.tglKembali).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-';
                  return (
                    <div key={s.noSewa} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-800 text-xs">
                          {s.noSewa}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {s.status}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm">{s.namaPelanggan}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>📞 {s.noTelepon}</span>
                          <span>•</span>
                          <span className="font-semibold text-teal-700">{s.totalQty} Item</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Kembali: <span className="font-medium text-slate-700">{tglKembaliStr}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <button
                          onClick={() => onOpenReturn(s.noSewa)}
                          className="flex-1 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl transition text-center shadow-2xs"
                        >
                          Proses Pengembalian
                        </button>
                        <button
                          onClick={() => onOpenInvoice(s.noSewa)}
                          className="p-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
                          title="Cetak Surat Jalan"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigateTab('sewa')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 justify-end ml-auto cursor-pointer"
            >
              <span>Buat Sewa Keluar Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Peringatan Stok Menipis (1 Kolom) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">Stok Gudang Menipis</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                {lowStockItems.length} Item
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Barang (bunga/daun/properti) dengan sisa stok &le; 10:
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {lowStockItems.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">
                  Semua persediaan barang gudang mencukupi.
                </div>
              ) : (
                lowStockItems.map(item => (
                  <div
                    key={item.kode}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/70 border border-red-100 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{item.nama}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.kode} · Total: {item.stokTotal} {item.satuan}
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-600 text-white">
                        Sisa: {item.stokTersedia} {item.satuan}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('database')}
            className="w-full mt-4 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer text-center"
          >
            Buka Database Barang Gudang
          </button>
        </div>
      </div>

      {/* Modal Rincian Barang di Lokasi Acara */}
      {showRincianModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setShowRincianModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                    Rincian {totalStokDisewa} Unit Barang di Lokasi Acara
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transparansi data stok barang yang sedang dibawa & dipakai di venue pelanggan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRincianModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
              
              {/* Box Penjelasan Sumber Data */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-xs text-teal-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-teal-900">
                  <Info className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Darimana angka {totalStokDisewa} unit ini berasal?</span>
                </div>
                <p className="leading-relaxed text-teal-900/90">
                  Angka <strong>{totalStokDisewa} unit barang</strong> adalah hasil penjumlahan otomatis dari kolom <strong>Stok Disewa</strong> pada seluruh item di Database Barang:
                </p>
                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200 font-mono text-[11px] text-teal-800">
                  Total di Lokasi Acara = Σ (Stok Disewa setiap item bunga, daun, & properti)
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Ketika ada penyewaan keluar baru, stok gudang otomatis berpindah dari <em>Stok Tersedia</em> menjadi <em>Stok Disewa</em>. Saat barang dikembalikan lewat menu <strong>Pengembalian</strong>, angka ini otomatis berkurang kembali.
                </p>
              </div>

              {/* Rincian Material yang Sedang di Lapangan */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Daftar Material yang Berada di Lapangan ({barangDisewaList.length} Jenis Barang)</span>
                  </h4>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Total: {totalStokDisewa} Unit
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Kode &amp; Nama Barang</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3 text-center">Unit Disewa</th>
                        <th className="py-2.5 px-3 text-center">Sisa di Gudang</th>
                        <th className="py-2.5 px-3 text-center">Total Aset</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {barangDisewaList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            Saat ini tidak ada unit barang yang berstatus disewa. Semua berada di gudang.
                          </td>
                        </tr>
                      ) : (
                        barangDisewaList.map(b => (
                          <tr key={b.kode} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{b.nama}</div>
                              <div className="text-[10px] font-mono text-teal-700">{b.kode}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {b.kategori}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                                {b.stokDisewa} {b.satuan}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center text-emerald-700 font-semibold">
                              {b.stokTersedia} {b.satuan}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600">
                              {b.stokTotal} {b.satuan}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rincian Transaksi Acara yang Aktif */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Penyewa &amp; Lokasi Acara yang Membawa Barang Ini ({sewaAktif.length} Sewa Aktif)</span>
                </h4>

                <div className="space-y-3">
                  {sewaAktif.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      Tidak ada transaksi penyewaan aktif.
                    </div>
                  ) : (
                    sewaAktif.map(s => {
                      const tglKembaliStr = s.tglKembali ? new Date(s.tglKembali).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-';
                      return (
                        <div key={s.noSewa} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-lg">
                              {s.noSewa}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {s.totalQty} Item Dibawa
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{s.namaPelanggan}</div>
                              <div className="text-[11px] text-slate-500">📞 {s.noTelepon}</div>
                            </div>
                            <div className="text-[11px] text-slate-600 sm:text-right">
                              <div>Rencana Kembali: <strong className="text-slate-800">{tglKembaliStr}</strong></div>
                              {s.alamat && (
                                <div className="text-slate-500 truncate mt-0.5">📍 {s.alamat}</div>
                              )}
                            </div>
                          </div>

                          {/* List items rented in this invoice */}
                          {s.items && s.items.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                              {s.items.map((it, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700 font-medium">
                                  {it.namaBarang} ({it.qtySewa} {it.satuan || 'unit'})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Stok otomatis kembali saat dicatat di menu Pengembalian.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRincianModal(false);
                    onNavigateTab('kembali');
                  }}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Buka Menu Pengembalian &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setShowRincianModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
