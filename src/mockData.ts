import { 
  Barang, 
  PohonKatalog, 
  Penyewaan, 
  Transaksi, 
  MasterDataItem, 
  Pelanggan, 
  Supplier, 
  UserAccount 
} from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';

export const INITIAL_POHON_KATALOG: PohonKatalog[] = INITIAL_PRODUCTS.map((p) => ({
  id: p.id,
  kode: p.code,
  nama: p.name,
  kategori: p.category,
  tinggi: p.height,
  fotoUrl: p.imageUrl,
  stokTotal: p.stockTotal,
  stokTersedia: p.stockAvailable,
  stokDisewa: p.stockRented,
  statusKetersediaan: p.status,
  keterangan: p.description,
  widthSpread: p.widthSpread,
  trunkType: p.trunkType,
  foliageType: p.foliageType,
  highlights: p.highlights,
  recommendedFor: p.recommendedFor,
  tanggalInput: '2026-01-15',
  updatedAt: new Date().toISOString()
}));

export const INITIAL_BARANG: Barang[] = [
  {
    id: 'brg-001',
    kode: 'STN-PLAT-01',
    nama: 'Plat Besi Dudukan Pohon Heavy Duty 60x60cm',
    kategori: 'Hardware & Base',
    jenis: 'Base Plate',
    stokTotal: 20,
    stokTersedia: 16,
    stokDisewa: 4,
    satuan: 'Unit',
    lokasiRak: 'Gudang Utama - Rak A1',
    keterangan: 'Plat stabilizer baja pemberat bawah pohon knockdown.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'brg-002',
    kode: 'ACC-POT-RSC',
    nama: 'Cover Pot Kayu Rustic Finishing Natural Teak',
    kategori: 'Pot & Cover',
    jenis: 'Wooden Pot',
    stokTotal: 15,
    stokTersedia: 12,
    stokDisewa: 3,
    satuan: 'Pcs',
    lokasiRak: 'Gudang Utama - Rak B2',
    keterangan: 'Penutup pot base plat agar tampak natural estetik.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'brg-003',
    kode: 'LGT-SPOT-WARM',
    nama: 'Spotlight LED 50W Warm White IP65',
    kategori: 'Lighting',
    jenis: 'Uplight Decor',
    stokTotal: 30,
    stokTersedia: 24,
    stokDisewa: 6,
    satuan: 'Unit',
    lokasiRak: 'Gudang Elektrik - Rak E1',
    keterangan: 'Sorot pohon bawah ke atas untuk efek megah pelaminan malam hari.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'brg-004',
    kode: 'FLR-WIST-WHT',
    nama: 'Bunga Gantung Wisteria Putih Sulur 110cm',
    kategori: 'Daun & Bunga Artifisial',
    jenis: 'Juntaian Bunga',
    stokTotal: 120,
    stokTersedia: 100,
    stokDisewa: 20,
    satuan: 'Tangkai',
    lokasiRak: 'Rak Bunga - C3',
    keterangan: 'Aksesoris sulur tambahan untuk beringin putih pelaminan.',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_MASTER_DATA: MasterDataItem[] = [
  { id: 'md-1', tipe: 'KATEGORI_POHON', nilai: 'Pohon Besar', keterangan: 'Tinggi > 2.5 Meter', updatedAt: new Date().toISOString() },
  { id: 'md-2', tipe: 'KATEGORI_POHON', nilai: 'Pohon Sedang', keterangan: 'Tinggi 1.8 - 2.5 Meter', updatedAt: new Date().toISOString() },
  { id: 'md-3', tipe: 'KATEGORI_POHON', nilai: 'Pohon Lorong Entrance', keterangan: 'Format gate melengkung', updatedAt: new Date().toISOString() },
  { id: 'md-4', tipe: 'KATEGORI_BARANG', nilai: 'Hardware & Base', keterangan: 'Plat dudukan & bracket', updatedAt: new Date().toISOString() },
  { id: 'md-5', tipe: 'KATEGORI_BARANG', nilai: 'Pot & Cover', keterangan: 'Cover pot kayu & fiberglass', updatedAt: new Date().toISOString() },
  { id: 'md-6', tipe: 'KATEGORI_BARANG', nilai: 'Lighting', keterangan: 'Lampu sorot panggung', updatedAt: new Date().toISOString() },
  { id: 'md-7', tipe: 'JENIS_BARANG', nilai: 'Base Plate', updatedAt: new Date().toISOString() },
  { id: 'md-8', tipe: 'JENIS_BARANG', nilai: 'Wooden Pot', updatedAt: new Date().toISOString() },
  { id: 'md-9', tipe: 'SATUAN', nilai: 'Unit', updatedAt: new Date().toISOString() },
  { id: 'md-10', tipe: 'SATUAN', nilai: 'Pcs', updatedAt: new Date().toISOString() },
  { id: 'md-11', tipe: 'SATUAN', nilai: 'Tangkai', updatedAt: new Date().toISOString() },
  { id: 'md-12', tipe: 'LOKASI_RAK', nilai: 'Gudang Utama - Rak A1', updatedAt: new Date().toISOString() },
  { id: 'md-13', tipe: 'LOKASI_RAK', nilai: 'Gudang Utama - Rak B2', updatedAt: new Date().toISOString() }
];

export const INITIAL_PELANGGAN: Pelanggan[] = [
  {
    id: 'plg-001',
    kodePelanggan: 'CUST-001',
    nama: 'Diana Maharani (Mahkota WO)',
    namaPelanggan: 'Diana Maharani',
    kontakPic: 'Diana Maharani',
    noTelepon: '08119500890',
    email: 'diana.mahkota@gmail.com',
    alamat: 'Jl. Magelang KM 8, Mlati, Sleman, Yogyakarta',
    kategori: 'Wedding Organizer Partner',
    totalSewa: 12,
    catatan: 'Prioritas booking, pembayaran termin tepat waktu.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'plg-002',
    kodePelanggan: 'CUST-002',
    nama: 'Arya Putra Decor Studio',
    namaPelanggan: 'Arya Putra',
    kontakPic: 'Bpk. Arya',
    noTelepon: '081234567890',
    email: 'aryaputradecor@gmail.com',
    alamat: 'Jl. Kaliurang KM 9, Ngaglik, Sleman',
    kategori: 'Vendor Dekorasi',
    totalSewa: 8,
    catatan: 'Spesialis tema rustic autumn & royal putih.',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SUPPLIER: Supplier[] = [
  {
    id: 'sup-001',
    kodeSupplier: 'SUP-001',
    nama: 'CV Kayu Alami Sentosa Jepara',
    namaSupplier: 'CV Kayu Alami Sentosa Jepara',
    kontakPic: 'H. Sudirman',
    noTelepon: '081329881122',
    email: 'kayu.sentosa@gmail.com',
    kategoriBarang: 'Batang Pohon Hutan & Treatment Kering Anti Rayap',
    alamat: 'Tahunan, Jepara, Jawa Tengah',
    statusAktif: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-002',
    kodeSupplier: 'SUP-002',
    nama: 'Indo Silk Flower Importir',
    namaSupplier: 'Indo Silk Flower Importir',
    kontakPic: 'Ibu Linda',
    noTelepon: '08170099881',
    email: 'indosilkflower@gmail.com',
    kategoriBarang: 'Daun Maple Silk, Ficus Putih & Bunga Sakura Premium',
    alamat: 'Mangga Dua, Jakarta Utara',
    statusAktif: true,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    namaLengkap: 'Administrator HD-Pohon',
    role: 'ADMIN',
    status: 'AKTIF',
    noHp: '08119500890',
    email: 'hdpohon@gmail.com',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'usr-staff1',
    username: 'staff',
    namaLengkap: 'Budi Santoso (Logistik)',
    role: 'STAFF',
    status: 'AKTIF',
    noHp: '081288990011',
    email: 'budi.logistik@gmail.com',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_PENYEWAAN: Penyewaan[] = [
  {
    noSewa: 'SEWA-20261024-8192',
    tglSewa: '2026-10-24',
    tglKembali: '2026-10-25',
    namaPelanggan: 'Diana Maharani (Mahkota WO)',
    noTelepon: '08119500890',
    alamat: 'Gedung Graha Sarina Vidi, Sleman, Yogyakarta',
    totalItem: 1,
    totalQty: 2,
    status: 'AKTIF',
    user: 'admin',
    catatan: 'Wedding adat jawa klasik modern. Loading dock 08.00 pagi.',
    items: [
      {
        idItem: 'item-1',
        noSewa: 'SEWA-20261024-8192',
        kode: 'PHN-002',
        namaBarang: 'Pohon Beringin Putih Wedding Pelaminan',
        kategori: 'Pohon Besar',
        qtySewa: 2,
        satuan: 'Unit',
        qtyKembaliBagus: 0,
        qtyRusak: 0,
        qtyHilang: 0,
        statusItem: 'DISEWA',
        denda: 0
      }
    ]
  }
];

export const INITIAL_TRANSAKSI: Transaksi[] = [
  {
    id: 'TRX-1729001',
    tanggal: '2026-10-18T10:00:00.000Z',
    jenis: 'MASUK_SUPPLIER',
    kodeBarang: 'PHN-001',
    namaBarang: 'Pohon Maple Merah Autumn Raksasa',
    kategori: 'Pohon Besar',
    qty: 2,
    satuan: 'Unit',
    noRef: 'PO-202610-01',
    namaPihak: 'CV Kayu Alami Sentosa Jepara',
    catatan: 'Restok persiapan high wedding season akhir tahun.',
    user: 'admin'
  }
];
