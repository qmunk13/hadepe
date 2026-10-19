export interface PohonKatalog {
  id?: string;
  kode: string;
  nama: string;
  kategori: string;
  tinggi: string;
  fotoUrl: string;
  stokTotal: number;
  stokTersedia: number;
  stokDisewa: number;
  statusKetersediaan: 'Tersedia' | 'Sedang Dibooking' | 'Perawatan' | string;
  keterangan: string;
  widthSpread?: string;
  trunkType?: string;
  foliageType?: string;
  highlights?: string[];
  recommendedFor?: string[];
  tanggalInput?: string;
  driveFolderId?: string;
  lokasiWorkshop?: string;
  updatedAt?: string;
  [key: string]: any;
}

export type Pohon = PohonKatalog;

export interface Barang {
  id?: string;
  kode: string;
  kategori: string;
  jenis?: string;
  nama: string;
  stokTotal: number;
  stokTersedia: number;
  stokDisewa: number;
  satuan: string;
  fotoUrl?: string;
  lokasiRak?: string;
  keterangan: string;
  driveFolderId?: string;
  updatedAt?: string;
  [key: string]: any;
}

export type MasterDataTipe = 'KATEGORI_POHON' | 'KATEGORI_BARANG' | 'JENIS_BARANG' | 'SATUAN' | 'LOKASI_RAK';

export interface MasterDataItem {
  id: string;
  tipe: MasterDataTipe;
  nilai: string;
  keterangan?: string;
  updatedAt: string;
  [key: string]: any;
}

export interface MasterDataLists {
  kategoriPohon: string[];
  kategoriBarang: string[];
  jenisBarang: string[];
  satuan?: string[];
  satuanBarang?: string[];
  lokasi?: string[];
  lokasiRak?: string[];
  [key: string]: any;
}

export interface Pelanggan {
  id: string;
  kodePelanggan?: string;
  nama?: string;
  namaPelanggan?: string;
  tipe?: string;
  kontakPic?: string;
  noTelepon: string;
  email?: string;
  alamat: string;
  kategori?: string;
  totalSewa?: number;
  totalTransaksiSewa?: number;
  statusMember?: string;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Supplier {
  id: string;
  kodeSupplier?: string;
  nama?: string;
  namaSupplier?: string;
  kontakPic?: string;
  kontakPerson?: string;
  noTelepon: string;
  email?: string;
  kategoriBarang?: string;
  kategoriSuplai?: string;
  alamat: string;
  statusAktif?: boolean;
  totalPasokanQty?: number;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PenyewaanItem {
  idItem: string;
  noSewa: string;
  kode: string;
  namaBarang: string;
  kategori: string;
  qtySewa: number;
  satuan: string;
  qtyKembaliBagus: number;
  qtyRusak: number;
  qtyHilang: number;
  statusItem: string;
  denda: number;
  catatan?: string;
  [key: string]: any;
}

export interface Penyewaan {
  noSewa: string;
  tglSewa?: string;
  tglKembali?: string;
  tglRealisasi?: string;
  namaPelanggan: string;
  noTelepon: string;
  alamat?: string;
  totalItem: number;
  totalQty: number;
  status: 'AKTIF' | 'SELESAI' | 'SELESAI_DENGAN_CATATAN' | 'BATAL' | string;
  user?: string;
  catatan?: string;
  items: PenyewaanItem[];
  [key: string]: any;
}

export interface Transaksi {
  id: string;
  tanggal: string;
  jenis: string;
  kode?: string;
  kodeBarang?: string;
  namaBarang: string;
  kategori: string;
  qty: number;
  satuan: string;
  noRef?: string;
  namaPihak?: string;
  catatan?: string;
  user?: string;
  createdAt?: string;
  [key: string]: any;
}

export type TransaksiMutasi = Transaksi;

export interface UserAccount {
  id?: string;
  username: string;
  namaLengkap: string;
  role: 'ADMIN' | 'STAFF' | 'ADMINISTRATOR' | 'KASIR_RENTAL' | 'STAFF_GUDANG' | 'DRIVER_LOGISTIK' | string;
  password?: string;
  noHp?: string;
  noTelepon?: string;
  email?: string;
  statusAktif?: boolean;
  status?: 'AKTIF' | 'NONAKTIF' | string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface UserSession {
  user?: UserAccount;
  loginTime?: string;
  username?: string;
  namaLengkap?: string;
  role?: string;
  isLoggedIn?: boolean;
  token?: string;
  [key: string]: any;
}

export interface RekapStokItem {
  kode: string;
  nama: string;
  kategori: string;
  jenis?: string;
  satuan: string;
  stokAwal: number;
  stokMasuk: number;
  sewaKeluar: number;
  kembaliBagus: number;
  rusak: number;
  hilang: number;
  stokTotalAkhir: number;
  stokTersedia: number;
  sedangDisewa: number;
  nilaiSatuan: number;
  totalNilaiAset: number;
  statusStok: 'AMAN' | 'MENIPIS' | 'KRITIS' | string;
  rekomendasi: string;
  masuk?: number;
  keluar?: number;
  stokAkhir?: number;
  totalNilai?: number;
  [key: string]: any;
}

export interface CloudConfig {
  spreadsheetId: string;
  folderBarangId: string;
  folderPohonId: string;
  gasWebhookUrl: string;
  autoSyncEnabled: boolean;
  lastSyncedAt: string;
  [key: string]: any;
}

export interface SyncLogEntry {
  id?: string;
  waktu?: string;
  timestamp?: string;
  aksi?: string;
  target?: string;
  status?: 'SUCCESS' | 'ERROR' | 'PENDING' | string;
  message?: string;
  pesan?: string;
  detailPayload?: string;
  [key: string]: any;
}

export interface AppSettings {
  namaBisnis: string;
  tagline: string;
  alamatGudang: string;
  noWhatsapp: string;
  emailBisnis: string;
  jamOperasional: string;
  syaratKetentuan: string[];
  [key: string]: any;
}

export interface GasConfig {
  webAppUrl: string;
  autoSync: boolean;
  lastSync?: string;
}

export interface BookingServiceOptions {
  includeSetup: boolean;
  includeLighting: boolean;
  includeTransport: boolean;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: 'Pohon Besar' | 'Pohon Sedang' | 'Pohon Karakter' | 'Tanaman Tropis' | 'Properti & Bunga' | string;
  height: string;
  widthSpread: string;
  trunkType: string;
  foliageType: string;
  stockTotal: number;
  stockAvailable: number;
  stockRented: number;
  status: 'Tersedia' | 'Sedang Dibooking' | 'Perawatan' | string;
  imageUrl: string;
  description: string;
  highlights: string[];
  recommendedFor: string[];
  includedAccessories: string[];
  featured?: boolean;
}

export interface BookingOrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
}

export interface BookingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  organizerName?: string;
  eventDate: string;
  returnDate: string;
  rentalDays: number;
  venueName: string;
  venueAddress: string;
  services: BookingServiceOptions;
  notes?: string;
  items: BookingOrderItem[];
  status: 'Menunggu Konfirmasi WA' | 'Dikonfirmasi' | 'Sedang Disewa' | 'Selesai' | 'Dibatalkan';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  displayPhone: string;
  email: string;
  workshopAddress: string;
  openingHours: string;
}

export const GOOGLE_WORKSPACE_CONFIG = {
  spreadsheetId: '1kG2fE2ILdkd9Bzg7pBFLJiw2ZjmnKajrk-7AkTPUStw',
  spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1kG2fE2ILdkd9Bzg7pBFLJiw2ZjmnKajrk-7AkTPUStw/edit',
  webAppUrl: '',
  folderPohonId: '1r3kMLLGRncOQUbcaItDDfYV8Nyu7LSQN',
  folderPohonUrl: 'https://drive.google.com/drive/folders/1r3kMLLGRncOQUbcaItDDfYV8Nyu7LSQN',
  folderBarangId: '1UyXd9bssw2Sn-i57T51WnIFudcfwstzF',
  folderBarangUrl: 'https://drive.google.com/drive/folders/1UyXd9bssw2Sn-i57T51WnIFudcfwstzF'
};
