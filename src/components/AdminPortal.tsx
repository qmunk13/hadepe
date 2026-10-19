import React, { useState, useEffect } from 'react';
import { 
  Barang, 
  PohonKatalog, 
  Penyewaan, 
  Transaksi, 
  MasterDataItem, 
  MasterDataTipe,
  Pelanggan, 
  Supplier, 
  UserAccount, 
  ProductItem, 
  BookingOrder, 
  StoreSettings 
} from '../types';
import { AppDataService } from '../services/api';
import { CheckCircle2, AlertCircle, X, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { DashboardView } from './DashboardView';
import { KatalogView } from './KatalogView';
import { DatabaseBarangView } from './DatabaseBarangView';
import { SewaFormView } from './SewaFormView';
import { PengembalianView } from './PengembalianView';
import { RiwayatTransaksiView } from './RiwayatTransaksiView';
import { MasterDataView } from './MasterDataView';
import { RekapValuasiView } from './RekapValuasiView';
import { PelangganView } from './PelangganView';
import { SupplierView } from './SupplierView';
import { UsersView } from './UsersView';
import { TambahPohonModal } from './TambahPohonModal';
import { TambahBarangModal } from './TambahBarangModal';
import { TambahStokModal } from './TambahStokModal';
import { GoogleAppsScriptModal } from './GoogleAppsScriptModal';
import { PengaturanKontakView } from './PengaturanKontakView';
import { EditProfileModal } from './EditProfileModal';

interface AdminPortalProps {
  products: ProductItem[];
  onUpdateProducts: (newProducts: ProductItem[]) => void;
  orders: BookingOrder[];
  onUpdateOrders: (newOrders: BookingOrder[]) => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onBackToPublic: () => void;
  onPrintInvoice: (order: BookingOrder) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  settings,
  onUpdateSettings,
  onBackToPublic,
  onPrintInvoice
}) => {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const users = AppDataService.getUsers();
    return users.find(u => u.username === 'admin') || {
      id: 'usr-admin',
      username: 'admin',
      namaLengkap: 'Administrator Hasan Dekor',
      role: 'ADMIN',
      status: 'AKTIF'
    };
  });

  // Core Data States
  const [pohonList, setPohonList] = useState<PohonKatalog[]>(() => AppDataService.getPohonKatalog());
  const [barangList, setBarangList] = useState<Barang[]>(() => AppDataService.getLocalBarang());
  const [penyewaanList, setPenyewaanList] = useState<Penyewaan[]>(() => AppDataService.getLocalPenyewaan());
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(() => AppDataService.getLocalTransaksi());
  const [masterDataList, setMasterDataList] = useState<MasterDataItem[]>(() => AppDataService.getMasterData());
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>(() => AppDataService.getPelanggan());
  const [supplierList, setSupplierList] = useState<Supplier[]>(() => AppDataService.getSupplier());
  const [usersList, setUsersList] = useState<UserAccount[]>(() => AppDataService.getUsers());

  // Cross-Navigation & Preselected States
  const [sewaPreselectedKode, setSewaPreselectedKode] = useState<string | undefined>(undefined);
  const [kembaliInitialNoSewa, setKembaliInitialNoSewa] = useState<string | undefined>(undefined);

  // Modals
  const [isTambahPohonOpen, setIsTambahPohonOpen] = useState(false);
  const [isTambahBarangOpen, setIsTambahBarangOpen] = useState(false);
  const [isTambahStokOpen, setIsTambahStokOpen] = useState(false);
  const [isGasCodeOpen, setIsGasCodeOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Sync internal PohonKatalog with the public portal products
  const syncWithPublicProducts = (list: PohonKatalog[]) => {
    const converted: ProductItem[] = list.map(p => ({
      id: p.kode.toLowerCase(),
      code: p.kode,
      name: p.nama,
      category: (p.kategori as any) || 'Pohon Besar',
      height: p.tinggi || '2.8 Meter',
      widthSpread: p.widthSpread || '2.0 Meter',
      trunkType: p.trunkType || 'Batang Kayu Kering Alami',
      foliageType: p.foliageType || 'Daun Silk Premium',
      stockTotal: p.stokTotal,
      stockAvailable: p.stokTersedia,
      stockRented: p.stokDisewa,
      status: p.statusKetersediaan,
      imageUrl: p.fotoUrl || '/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg',
      description: p.keterangan || '',
      highlights: p.highlights || ['Batang kayu alami', 'Sistem knockdown kokoh'],
      recommendedFor: p.recommendedFor || ['Panggung Pelaminan', 'Entrance Gate'],
      includedAccessories: ['Base Plat Besi'],
      featured: true
    }));
    onUpdateProducts(converted);
  };

  const reloadAllData = () => {
    const p = AppDataService.getPohonKatalog();
    setPohonList(p);
    syncWithPublicProducts(p);
    setBarangList(AppDataService.getLocalBarang());
    setPenyewaanList(AppDataService.getLocalPenyewaan());
    setTransaksiList(AppDataService.getLocalTransaksi());
    setMasterDataList(AppDataService.getMasterData());
    setPelangganList(AppDataService.getPelanggan());
    setSupplierList(AppDataService.getSupplier());
    const updatedUsers = AppDataService.getUsers();
    setUsersList(updatedUsers);

    // Otomatis sinkronkan namaLengkap currentUser dengan database lokal & spreadsheet
    setCurrentUser(prev => {
      const targetUser = prev ? prev.username.toLowerCase() : 'admin';
      const found = updatedUsers.find(u => u.username.toLowerCase() === targetUser);
      return found || prev;
    });
  };

  useEffect(() => {
    syncWithPublicProducts(pohonList);
    // Sinkronkan akun & namaLengkap dari Spreadsheet saat awal dibuka jika Web App terhubung
    if (AppDataService.getGasUrl()) {
      AppDataService.syncUsersFromGoogleSheets().then(res => {
        if (res.success && res.users.length > 0) {
          setUsersList(res.users);
          setCurrentUser(prev => {
            const target = prev ? prev.username.toLowerCase() : 'admin';
            const found = res.users.find(u => u.username.toLowerCase() === target);
            return found || prev;
          });
        }
      }).catch(err => console.warn('Sync users error on mount:', err));
    }
  }, []);

  // Filter Master Data Helpers
  const kategoriPohonMaster = masterDataList.filter(m => m.tipe === 'KATEGORI_POHON').map(m => m.nilai);
  const kategoriBarangMaster = masterDataList.filter(m => m.tipe === 'KATEGORI_BARANG').map(m => m.nilai);
  const jenisBarangMaster = masterDataList.filter(m => m.tipe === 'JENIS_BARANG').map(m => m.nilai);
  const satuanMaster = masterDataList.filter(m => m.tipe === 'SATUAN').map(m => m.nilai);
  const lokasiMaster = masterDataList.filter(m => m.tipe === 'LOKASI_RAK').map(m => m.nilai);

  // Handlers for Pohon
  const handleTambahPohon = async (data: Partial<PohonKatalog>): Promise<boolean> => {
    const res = await AppDataService.tambahPohonKatalog(data);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  const handleEditPohon = async (kode: string, data: Partial<PohonKatalog>): Promise<boolean> => {
    const res = await AppDataService.updatePohonKatalog(kode, data);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  const handleHapusPohon = async (kode: string): Promise<boolean> => {
    const res = await AppDataService.hapusPohonKatalog(kode);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  // Handlers for Barang
  const handleTambahBarang = async (data: Partial<Barang>): Promise<boolean> => {
    const res = await AppDataService.tambahBarangBaru(data);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  const handleEditBarang = async (kode: string, data: Partial<Barang>): Promise<boolean> => {
    const res = await AppDataService.updateBarang(kode, data);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  const handleHapusBarang = async (kode: string): Promise<boolean> => {
    const res = await AppDataService.hapusBarang(kode);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  const handleTambahStok = async (payload: {
    kode: string;
    qty: number;
    supplier: string;
    noRef?: string;
    catatan?: string;
  }): Promise<boolean> => {
    const res = await AppDataService.tambahStokSupplier(payload);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  // Handler for Sewa Keluar
  const handleSubmitSewa = async (payload: {
    namaPelanggan: string;
    noTelepon: string;
    alamat: string;
    tglSewa: string;
    tglKembali: string;
    catatan: string;
    items: { kode: string; qtySewa: number }[];
  }): Promise<string | undefined> => {
    const res = await AppDataService.prosesSewa({
      ...payload,
      user: currentUser?.namaLengkap || 'admin'
    });
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return res.noSewa;
    }
    return undefined;
  };

  // Handler for Pengembalian
  const handleSubmitReturn = async (payload: {
    noSewa: string;
    namaPelanggan: string;
    items: Array<{
      idItem: string;
      qtyBagus: number;
      qtyRusak: number;
      qtyHilang: number;
      denda: number;
      catatan?: string;
    }>;
  }): Promise<boolean> => {
    const res = await AppDataService.prosesPengembalian({
      ...payload,
      user: currentUser?.namaLengkap || 'admin'
    });
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      reloadAllData();
      return true;
    }
    return false;
  };

  // Handlers for Master Data
  const handleTambahMaster = async (data: { tipe: MasterDataTipe; nilai: string; keterangan?: string }) => {
    const res = await AppDataService.tambahMasterData(data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleUpdateMaster = async (id: string, data: { nilai: string; keterangan?: string }) => {
    const res = await AppDataService.updateMasterData(id, data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleHapusMaster = async (id: string) => {
    const res = await AppDataService.hapusMasterData(id);
    if (res.success) reloadAllData();
    return res;
  };

  // Handlers for Pelanggan
  const handleTambahPelanggan = async (data: Partial<Pelanggan>) => {
    const res = await AppDataService.tambahPelanggan(data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleUpdatePelanggan = async (id: string, data: Partial<Pelanggan>) => {
    const res = await AppDataService.updatePelanggan(id, data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleHapusPelanggan = async (id: string) => {
    const res = await AppDataService.hapusPelanggan(id);
    if (res.success) reloadAllData();
    return res;
  };

  // Handlers for Supplier
  const handleTambahSupplier = async (data: Partial<Supplier>) => {
    const res = await AppDataService.tambahSupplier(data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleUpdateSupplier = async (id: string, data: Partial<Supplier>) => {
    const res = await AppDataService.updateSupplier(id, data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleHapusSupplier = async (id: string) => {
    const res = await AppDataService.hapusSupplier(id);
    if (res.success) reloadAllData();
    return res;
  };

  // Handlers for Users
  const handleTambahUser = async (data: Partial<UserAccount>) => {
    const res = await AppDataService.tambahUser(data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleUpdateUser = async (username: string, data: Partial<UserAccount>) => {
    const res = await AppDataService.updateUser(username, data);
    if (res.success) reloadAllData();
    return res;
  };

  const handleHapusUser = async (username: string) => {
    const res = await AppDataService.hapusUser(username);
    if (res.success) {
      showToast(res.message, 'success');
      reloadAllData();
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const handleSaveCurrentProfile = async (updatedData: Partial<UserAccount>) => {
    if (!currentUser) return { success: false, message: 'Tidak ada user aktif.' };
    const res = await AppDataService.updateUser(currentUser.username, updatedData);
    if (res.success) {
      showToast(res.message, 'success');
      reloadAllData();
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  // Direct actions across views
  const handleDirectSewa = (kode: string) => {
    setSewaPreselectedKode(kode);
    setCurrentTab('sewa');
  };

  const handleOpenReturnForSewa = (noSewa: string) => {
    setKembaliInitialNoSewa(noSewa);
    setCurrentTab('kembali');
  };

  const handleOpenInvoicePrint = (noSewa: string) => {
    const sewa = penyewaanList.find(s => s.noSewa === noSewa);
    if (sewa) {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Sidebar Navigasi Internal Hasan Dekor */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        user={currentUser}
        onLogout={() => setIsLogoutConfirmOpen(true)}
        onOpenGasCode={() => setIsGasCodeOpen(true)}
        onOpenPublicPortal={onBackToPublic}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Workspace Content Area */}
      <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-w-0 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            pohonList={pohonList}
            barangList={barangList}
            penyewaan={penyewaanList}
            onNavigateTab={setCurrentTab}
            onOpenReturn={handleOpenReturnForSewa}
            onOpenInvoice={handleOpenInvoicePrint}
            onOpenPublicPortal={onBackToPublic}
            onRefresh={reloadAllData}
          />
        )}

        {currentTab === 'katalog' && (
          <KatalogView
            pohonList={pohonList}
            onOpenTambahPohon={() => setIsTambahPohonOpen(true)}
            onEditPohon={handleEditPohon}
            onHapusPohon={handleHapusPohon}
            kategoriMasterList={kategoriPohonMaster}
          />
        )}

        {currentTab === 'database' && (
          <DatabaseBarangView
            barangList={barangList}
            onOpenTambahBarang={() => setIsTambahBarangOpen(true)}
            onOpenTambahStok={() => setIsTambahStokOpen(true)}
            onDirectSewa={handleDirectSewa}
            onEditBarang={handleEditBarang}
            onHapusBarang={handleHapusBarang}
            kategoriMasterList={kategoriBarangMaster}
            jenisMasterList={jenisBarangMaster}
            satuanMasterList={satuanMaster}
            lokasiMasterList={lokasiMaster}
          />
        )}

        {currentTab === 'sewa' && (
          <SewaFormView
            barangList={barangList}
            pelangganList={pelangganList}
            preselectedKode={sewaPreselectedKode}
            onClearPreselected={() => setSewaPreselectedKode(undefined)}
            onSubmitSewa={handleSubmitSewa}
            onOpenInvoice={handleOpenInvoicePrint}
          />
        )}

        {currentTab === 'kembali' && (
          <PengembalianView
            penyewaanList={penyewaanList}
            initialNoSewa={kembaliInitialNoSewa}
            onClearInitialNoSewa={() => setKembaliInitialNoSewa(undefined)}
            onSubmitReturn={handleSubmitReturn}
          />
        )}

        {currentTab === 'riwayat' && (
          <RiwayatTransaksiView
            transaksiList={transaksiList}
            penyewaanList={penyewaanList}
            onOpenInvoice={handleOpenInvoicePrint}
            onRefresh={reloadAllData}
          />
        )}

        {currentTab === 'master_data' && (
          <MasterDataView
            masterDataList={masterDataList}
            onTambahMaster={handleTambahMaster}
            onUpdateMaster={handleUpdateMaster}
            onHapusMaster={handleHapusMaster}
            onRefresh={reloadAllData}
          />
        )}

        {currentTab === 'rekap_valuasi' && (
          <RekapValuasiView
            pohonList={pohonList}
            barangList={barangList}
            onRefresh={reloadAllData}
          />
        )}

        {currentTab === 'pelanggan' && (
          <PelangganView
            pelangganList={pelangganList}
            onTambahPelanggan={handleTambahPelanggan}
            onUpdatePelanggan={handleUpdatePelanggan}
            onHapusPelanggan={handleHapusPelanggan}
          />
        )}

        {currentTab === 'supplier' && (
          <SupplierView
            supplierList={supplierList}
            onTambahSupplier={handleTambahSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onHapusSupplier={handleHapusSupplier}
          />
        )}

        {currentTab === 'users' && (
          <UsersView
            usersList={usersList}
            currentUser={currentUser}
            onTambahUser={handleTambahUser}
            onUpdateUser={handleUpdateUser}
            onHapusUser={handleHapusUser}
          />
        )}

        {currentTab === 'pengaturan' && (
          <PengaturanKontakView
            settings={settings}
            onSaveSettings={onUpdateSettings}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Modals for Internal Management */}
      <TambahPohonModal
        isOpen={isTambahPohonOpen}
        kategoriList={kategoriPohonMaster.length > 0 ? kategoriPohonMaster : ['Pohon Besar', 'Pohon Sedang', 'Pohon Karakter', 'Tanaman Tropis']}
        existingCodes={pohonList.map(p => p.kode)}
        onClose={() => setIsTambahPohonOpen(false)}
        onSave={handleTambahPohon}
      />

      <TambahBarangModal
        isOpen={isTambahBarangOpen}
        kategoriList={kategoriBarangMaster.length > 0 ? kategoriBarangMaster : ['Bunga', 'Daun', 'Properti', 'Aksesoris']}
        jenisList={jenisBarangMaster}
        satuanList={satuanMaster}
        lokasiList={lokasiMaster}
        existingCodes={barangList.map(b => b.kode)}
        onClose={() => setIsTambahBarangOpen(false)}
        onSave={handleTambahBarang}
      />

      <TambahStokModal
        isOpen={isTambahStokOpen}
        barangList={barangList}
        supplierList={supplierList}
        onClose={() => setIsTambahStokOpen(false)}
        onSave={handleTambahStok}
      />

      <GoogleAppsScriptModal
        isOpen={isGasCodeOpen}
        onClose={() => setIsGasCodeOpen(false)}
        onDataSynced={reloadAllData}
      />

      {/* Modal Edit Profil & Nama Lengkap Akun (Sinkron Spreadsheet) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        currentUser={currentUser}
        onClose={() => setIsEditProfileOpen(false)}
        onSaveProfile={handleSaveCurrentProfile}
        onGoToWhatsAppSettings={() => setCurrentTab('pengaturan')}
      />

      {/* Modal Konfirmasi Logout Internal */}
      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                Keluar dari Pengelola?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan keluar dari sesi pengelola internal dan kembali ke tampilan portal publik katalog Hasan Dekor.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  onBackToPublic();
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Ya, Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
