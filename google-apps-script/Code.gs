/**
 * =========================================================================
 * HASAN DEKOR POHON - SISTEM MANAJEMEN STOK & PENYEWAAN DEKORASI
 * Backend Google Apps Script (GAS) v5.0 (LENGKAP BESERTA MASTER DATA & CRUD)
 * =========================================================================
 * 
 * STRUKTUR SPREADSHEET UTAMA (ID: 1gSyz6gRB_O4E4_QJYPzOkd8NVylRZ4_efnjemeWLzM8):
 * 1. KATALOG_POHON     : Kode Pohon, Nama Pohon, Kategori, Tinggi, Stok Total, Stok Tersedia, Stok Disewa, Status, Foto Pohon URL, Keterangan, UpdatedAt
 * 2. MASTER_BARANG     : Kode Barang, Kategori, Jenis, Nama Barang, Stok Total, Stok Tersedia, Stok Disewa, Satuan, Foto, Lokasi Rak / Gudang, Keterangan, UpdatedAt
 * 3. MASTER_DATA       : ID, Tipe, Nilai, Keterangan, UpdatedAt (List Kategori Pohon, Kategori Barang, Jenis Barang, Satuan, Lokasi Rak)
 * 4. PELANGGAN         : ID, Nama Pelanggan, Kategori, No Telepon, Email, Alamat, Catatan, UpdatedAt
 * 5. SUPPLIER          : ID, Nama Vendor, Kontak Person, No Telepon, Email, Kategori Pasokan, Alamat, Catatan, UpdatedAt
 * 6. USERS             : ID, Username, Nama Lengkap, Role, PasswordHash, No Telepon, Status, UpdatedAt
 * 7. TRANSAKSI         : ID Transaksi, Tanggal, Jenis, Kode Barang, Nama Barang, Kategori, Qty, Satuan, No Ref / Sewa, Nama Pihak, Catatan, User, CreatedAt
 * 8. PENYEWAAN         : No Sewa, Tanggal Sewa, Tgl Rencana Kembali, Tgl Realisasi Kembali, Nama Pelanggan, No Telepon, Alamat, Total Item, Total Qty, Status Sewa, User Kasir, Catatan, CreatedAt
 * 9. PENYEWAAN_ITEMS   : ID Item, No Sewa, Kode Barang, Nama Barang, Kategori, Qty Sewa, Satuan, Qty Kembali Bagus, Qty Rusak, Qty Hilang, Status Item, Biaya Denda, Catatan
 * 10. LOG              : Waktu, User, Aksi, Detail
 */

// =========================================================================
// KONFIGURASI SPREADSHEET & GOOGLE DRIVE FOLDER (TERPASANG RESMI)
// =========================================================================
const SPREADSHEET_ID   = '1gSyz6gRB_O4E4_QJYPzOkd8NVylRZ4_efnjemeWLzM8'; // Database Utama
const FOLDER_ID_POHON  = '1r3kMLLGRncOQUbcaItDDfYV8Nyu7LSQN';             // Folder Gambar Pohon
const FOLDER_ID_BARANG = '1UyXd9bssw2Sn-i57T51WnIFudcfwstzF';             // Folder Gambar Barang

const SHEET_POHON_KATALOG = 'KATALOG_POHON';
const SHEET_MASTER_BARANG = 'MASTER_BARANG';
const SHEET_MASTER_DATA   = 'MASTER_DATA';
const SHEET_TRANSAKSI     = 'TRANSAKSI';
const SHEET_SEWA          = 'PENYEWAAN';
const SHEET_SEWA_ITEMS    = 'PENYEWAAN_ITEMS';
const SHEET_PELANGGAN     = 'PELANGGAN';
const SHEET_SUPPLIER      = 'SUPPLIER';
const SHEET_USERS         = 'USERS';
const SHEET_LOG           = 'LOG';

function getSpreadsheet_() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) return active;
      throw new Error('Gagal membuka Spreadsheet ID: ' + SPREADSHEET_ID + ' (' + e.message + ')');
    }
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Tidak ada Google Spreadsheet yang aktif.');
  return ss;
}

function hashPassword_(plainText) {
  if (!plainText && plainText !== 0) return '';
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(plainText),
    Utilities.Charset.UTF_8
  );
  return rawHash.map(b => ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2)).join('');
}

function ensureSheetHeaders_(sheet, headers) {
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow === 0 || lastCol === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#0f766e')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    return;
  }

  const existing = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || '').trim().toLowerCase());
  const missing = [];
  headers.forEach(h => {
    if (!existing.includes(String(h).trim().toLowerCase())) missing.push(h);
  });

  if (missing.length > 0) {
    sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
    sheet.getRange(1, lastCol + 1, 1, missing.length)
      .setFontWeight('bold')
      .setBackground('#0f766e')
      .setFontColor('#ffffff');
  }
}

/**
 * 1. SETUP DATABASE OTOMATIS & PEMBUATAN SELURUH HEADER SHEET
 * Jalankan fungsi ini pertama kali dari editor Apps Script
 */
function setupDatabase() {
  const ss = getSpreadsheet_();

  // 1. KATALOG_POHON
  let shPohon = ss.getSheetByName(SHEET_POHON_KATALOG) || ss.insertSheet(SHEET_POHON_KATALOG);
  ensureSheetHeaders_(shPohon, [
    'Kode Pohon', 'Nama Pohon', 'Kategori', 'Tinggi', 'Stok Total', 'Stok Tersedia', 'Stok Disewa', 'Status', 'Foto Pohon URL', 'Keterangan', 'UpdatedAt'
  ]);

  if (shPohon.getLastRow() < 2) {
    const samplePohon = [
      ['PHN-001', 'Pohon Maple Merah Autumn Raksasa', 'Pohon Besar', '2.5 - 3.0 Meter', 4, 3, 1, 'Tersedia', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Pohon dekorasi wedding daun maple merah rimbun eksklusif', new Date()],
      ['PHN-002', 'Pohon Beringin Putih / Ficus Artifisial', 'Pohon Besar', '3.0 - 3.5 Meter', 6, 4, 2, 'Tersedia', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80', 'Pohon beringin putih center pelaminan megah', new Date()],
      ['PHN-003', 'Pohon Sakura Pink Jepang Mekar Lebat', 'Pohon Sedang', '2.2 - 2.5 Meter', 8, 5, 3, 'Tersedia', 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80', 'Nuansa romantis khas musim semi Jepang photobooth', new Date()],
      ['PHN-004', 'Pohon Zaitun / Olive Tree Mediterania Minimalis', 'Pohon Sedang', '1.8 - 2.0 Meter', 5, 5, 0, 'Tersedia', 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', 'Pohon zaitun estetik rustic', new Date()],
      ['PHN-005', 'Pohon Palem Kipas Tropis Eksotis', 'Tanaman Tropis', '2.0 - 2.4 Meter', 3, 0, 3, 'Sedang Dibooking', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', 'Palem tropis daun kipas lebar nan segar outdoor', new Date()],
      ['PHN-006', 'Pohon Willow / Dedalu Menjuntai Warm Light', 'Pohon Karakter', '2.8 Meter', 4, 4, 0, 'Tersedia', 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=800&q=80', 'Dahan ranting menjuntai dilengkapi fairy light temaram', new Date()]
    ];
    shPohon.getRange(2, 1, samplePohon.length, samplePohon[0].length).setValues(samplePohon);
  }
  // 2. MASTER_BARANG (Barang Bukan Pohon)
  // Kode Barang | Kategori | Jenis | Nama Barang | Stok Total | Stok Tersedia | Stok Disewa | Satuan | Foto | Lokasi Rak / Gudang | Keterangan | UpdatedAt
  let shMaster = ss.getSheetByName(SHEET_MASTER_BARANG) || ss.insertSheet(SHEET_MASTER_BARANG);
  ensureSheetHeaders_(shMaster, [
    'Kode Barang', 'Kategori', 'Jenis', 'Nama Barang', 'Stok Total', 'Stok Tersedia', 'Stok Disewa', 'Satuan', 'Foto', 'Lokasi Rak / Gudang', 'Keterangan', 'UpdatedAt', 'Harga Satuan'
  ]);

  if (shMaster.getLastRow() < 2) {
    const sampleBarang = [
      ['BNG-001', 'Bunga', 'Bunga Mawar', 'Bunga Mawar Putih Premium Latex Real-Touch', 300, 240, 60, 'Tangkai', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80', 'Rak A1 - Box Bunga Mawar', 'Kelopak lembut tahan air dan debu untuk pelaminan', new Date()],
      ['BNG-002', 'Bunga', 'Bunga Hydrangea', 'Bunga Hydrangea Snow White Bulat Jumbo', 150, 110, 40, 'Tangkai', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80', 'Rak A2 - Box Hydrangea & Peony', 'Kepala bunga rimbun diameter 20cm pengisi background', new Date()],
      ['BNG-003', 'Bunga', 'Bunga Peony', 'Bunga Peony Blossom Blush Pink Pastel', 180, 135, 45, 'Tangkai', 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80', 'Rak A2 - Box Hydrangea & Peony', 'Peony mekar warna pink lembut aksen feminin', new Date()],
      ['BNG-004', 'Bunga', 'Bunga Anggrek', 'Bunga Anggrek Bulan Putih Latex Menjuntai', 90, 70, 20, 'Tangkai', 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80', 'Rak A3 - Bunga Anggrek Gantung', 'Tangkai lentur panjang 90cm kuntum real-touch', new Date()],
      ['DAN-101', 'Daun', 'Daun Monstera', 'Daun Monstera Deliciosa Hijau Tua Glossy', 200, 170, 30, 'Lembar', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80', 'Rak B1 - Daun Monstera & Palem', 'Bahan polimer latex tebal urat presisi', new Date()],
      ['DAN-102', 'Daun', 'Daun Palem & Rayung', 'Daun Palem Kering Rayung Bleaching Putih', 120, 100, 20, 'Tangkai', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80', 'Rak B1 - Daun Monstera & Palem', 'Palem kering natural warna krem bleached bohemian', new Date()],
      ['PRP-201', 'Properti', 'Standing Flower Besi', 'Standing Flower Besi Persegi Gold Minimalis (1.2M)', 24, 16, 8, 'Unit', 'https://images.unsplash.com/photo-1519225433280-715cb0215aed?auto=format&fit=crop&w=400&q=80', 'Rak C1 - Standing Flower Besi', 'Finishing cat oven gold powder coating anti karat', new Date()],
      ['PRP-202', 'Properti', 'Vas & Pot Keramik', 'Vas Keramik Meja Akad Silinder Putih Marmer', 30, 26, 4, 'Unit', 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80', 'Rak C1 - Standing Flower Besi', 'Vas keramik aesthetic meja akad nikah', new Date()],
      ['AKS-301', 'Aksesoris', 'Lampu & Fairy Light', 'Lampu Gantung Edison Filament Warm White Retro', 40, 30, 10, 'Unit', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80', 'Rak C2 - Lampu & Kabel Kelistrikan', 'Bohlam vintage 40 watt cahaya hangat malam', new Date()]
    ];
    shMaster.getRange(2, 1, sampleBarang.length, sampleBarang[0].length).setValues(sampleBarang);
  }

  // 3. MASTER_DATA
  let shMasterData = ss.getSheetByName(SHEET_MASTER_DATA) || ss.insertSheet(SHEET_MASTER_DATA);
  ensureSheetHeaders_(shMasterData, ['ID', 'Tipe', 'Nilai', 'Keterangan', 'UpdatedAt']);

  if (shMasterData.getLastRow() < 2) {
    const sampleMD = [
      // Kategori Pohon
      ['MD-01', 'KATEGORI_POHON', 'Pohon Besar', 'Tinggi > 2.5 Meter untuk center pelaminan', new Date()],
      ['MD-02', 'KATEGORI_POHON', 'Pohon Sedang', 'Tinggi 1.8 - 2.5 Meter untuk lorong & photobooth', new Date()],
      ['MD-03', 'KATEGORI_POHON', 'Pohon Karakter', 'Pohon tema rustic / fantasi / willow lampu', new Date()],
      ['MD-04', 'KATEGORI_POHON', 'Tanaman Tropis', 'Palem, monstera raksasa, bambu', new Date()],
      ['MD-05', 'KATEGORI_POHON', 'Bonsai Artifisial', 'Pohon kerdil meja VIP & akad', new Date()],
      // Kategori Barang
      ['MD-11', 'KATEGORI_BARANG', 'Bunga', 'Bunga tiruan latex & sutra', new Date()],
      ['MD-12', 'KATEGORI_BARANG', 'Daun', 'Dedaunan hijau, rayung, dan daun kering', new Date()],
      ['MD-13', 'KATEGORI_BARANG', 'Properti', 'Standing flower, pilar, backdrop, arch', new Date()],
      ['MD-14', 'KATEGORI_BARANG', 'Aksesoris', 'Lampu, lilin, vas keramik, kain draping', new Date()],
      ['MD-15', 'KATEGORI_BARANG', 'Lainnya', 'Perlengkapan dekorasi pendukung', new Date()],
      // Jenis Barang
      ['MD-21', 'JENIS_BARANG', 'Bunga Mawar', 'Mawar latex, kain, beludru', new Date()],
      ['MD-22', 'JENIS_BARANG', 'Bunga Hydrangea', 'Hydrangea rimbun background', new Date()],
      ['MD-23', 'JENIS_BARANG', 'Bunga Peony', 'Peony blossom pastel & mewah', new Date()],
      ['MD-24', 'JENIS_BARANG', 'Bunga Anggrek', 'Anggrek bulan gantung menjuntai', new Date()],
      ['MD-25', 'JENIS_BARANG', 'Daun Monstera', 'Monstera glossy hijau tua', new Date()],
      ['MD-26', 'JENIS_BARANG', 'Daun Palem & Rayung', 'Palem kering bleaching', new Date()],
      ['MD-27', 'JENIS_BARANG', 'Standing Flower Besi', 'Standing gold minimalis', new Date()],
      ['MD-28', 'JENIS_BARANG', 'Vas & Pot Keramik', 'Vas keramik silinder & marmer', new Date()],
      ['MD-29', 'JENIS_BARANG', 'Lampu & Fairy Light', 'Lampu gantung edison & LED strip', new Date()],
      // Satuan
      ['MD-31', 'SATUAN', 'Tangkai', 'Untuk bunga & daun tangkai', new Date()],
      ['MD-32', 'SATUAN', 'Ikat', 'Untuk baby breath, rayung kering', new Date()],
      ['MD-33', 'SATUAN', 'Lembar', 'Untuk daun satuan', new Date()],
      ['MD-34', 'SATUAN', 'Unit', 'Untuk pohon, standing besi, vas', new Date()],
      ['MD-35', 'SATUAN', 'Set', 'Untuk paket pilar / lampu', new Date()],
      ['MD-36', 'SATUAN', 'Box', 'Kotak aksesoris', new Date()],
      ['MD-37', 'SATUAN', 'Roll', 'Kain draping & kabel', new Date()],
      ['MD-38', 'SATUAN', 'Lusin', '12 tangkai', new Date()],
      // Lokasi Rak
      ['MD-41', 'LOKASI_RAK', 'Rak A1 - Box Bunga Mawar', 'Lantai 1 Sayap Kiri', new Date()],
      ['MD-42', 'LOKASI_RAK', 'Rak A2 - Box Hydrangea & Peony', 'Lantai 1 Sayap Kiri', new Date()],
      ['MD-43', 'LOKASI_RAK', 'Rak A3 - Bunga Anggrek Gantung', 'Lantai 1 Rak Gantung', new Date()],
      ['MD-44', 'LOKASI_RAK', 'Rak B1 - Daun Monstera & Palem', 'Lantai 1 Sayap Kanan', new Date()],
      ['MD-45', 'LOKASI_RAK', 'Rak C1 - Standing Flower Besi', 'Lantai 1 Area Berat', new Date()],
      ['MD-46', 'LOKASI_RAK', 'Rak C2 - Lampu & Kabel Kelistrikan', 'Lantai 2 Kotak Kering', new Date()],
      ['MD-47', 'LOKASI_RAK', 'Hanggar Pohon A - Pohon Besar', 'Area Khusus Pohon Raksasa', new Date()]
    ];
    shMasterData.getRange(2, 1, sampleMD.length, sampleMD[0].length).setValues(sampleMD);
  }

  // 4. PELANGGAN
  let shPelanggan = ss.getSheetByName(SHEET_PELANGGAN) || ss.insertSheet(SHEET_PELANGGAN);
  ensureSheetHeaders_(shPelanggan, [
    'ID', 'Nama Pelanggan', 'Kategori', 'No Telepon', 'Email', 'Alamat', 'Catatan', 'UpdatedAt'
  ]);
  if (shPelanggan.getLastRow() < 2) {
    const sampleCust = [
      ['CUST-001', 'Aris Wedding Organizer', 'Wedding Organizer', '081234567890', 'aris.wedding@gmail.com', 'Gedung Graha Sarina Vidi, Sleman, Yogyakarta', 'Partner langganan tetap konsep adat & modern', new Date()],
      ['CUST-002', 'Kurnia Event Planner & Decor', 'Wedding Organizer', '081398765432', 'kurnia.planner@decor.id', 'Jl. Palagan Tentara Pelajar No. 45, Ngaglik, Sleman', 'Sering sewa pohon beringin putih', new Date()],
      ['CUST-003', 'The Royal Ambarrukmo Ballroom', 'Hotel / Venue', '082155667788', 'banquet@royalambarrukmo.com', 'Jl. Laksda Adisucipto No. 81, Depok', 'Prioritas booking pohon sakura', new Date()]
    ];
    shPelanggan.getRange(2, 1, sampleCust.length, sampleCust[0].length).setValues(sampleCust);
  }

  // 5. SUPPLIER
  let shSupplier = ss.getSheetByName(SHEET_SUPPLIER) || ss.insertSheet(SHEET_SUPPLIER);
  ensureSheetHeaders_(shSupplier, [
    'ID', 'Nama Vendor', 'Kontak Person', 'No Telepon', 'Email', 'Kategori Pasokan', 'Alamat', 'Catatan', 'UpdatedAt'
  ]);
  if (shSupplier.getLastRow() < 2) {
    const sampleSup = [
      ['SUP-001', 'CV Flora Artifisial Sentosa', 'Bpk. Hendra Gunawan', '081122334455', 'hendra@florasetosa.co.id', 'Bunga Artifisial', 'Pergudangan Pasar Pagi Mangga Dua, Jakarta Utara', 'Supplier bunga latex import', new Date()],
      ['SUP-002', 'PT Kreasi Pohon Mahakarya', 'Ibu Ratna Dewi', '081577889900', 'info@pohonmahakarya.com', 'Pohon Artifisial & Batang Kayu', 'Sentra Pengrajin Kayu Jepara, Jawa Tengah', 'Pengrajin pohon beringin & sakura batang kayu kopi', new Date()],
      ['SUP-003', 'Bengkel Las & Besi Dekorasi Sinar Jaya', 'Mas Bambang Tri', '081809988776', 'bambanglas.yk@gmail.com', 'Properti Besi & Kayu', 'Jl. Imogiri Barat Km 7, Bantul, Yogyakarta', 'Pabrikasi standing flower besi hollow', new Date()]
    ];
    shSupplier.getRange(2, 1, sampleSup.length, sampleSup[0].length).setValues(sampleSup);
  }

  // 6. USERS
  let shUsers = ss.getSheetByName(SHEET_USERS) || ss.insertSheet(SHEET_USERS);
  ensureSheetHeaders_(shUsers, [
    'ID', 'Username', 'Nama Lengkap', 'Role', 'PasswordHash', 'No Telepon', 'Status', 'UpdatedAt'
  ]);
  if (shUsers.getLastRow() < 2) {
    const sampleUsers = [
      ['USR-01', 'admin', 'Administrator Hasan Dekor', 'ADMIN', hashPassword_('admin123'), '081234567890', 'AKTIF', new Date()],
      ['USR-02', 'kasir', 'Staff Kasir Hasan Dekor', 'STAFF', hashPassword_('kasir123'), '081398765432', 'AKTIF', new Date()],
      ['USR-03', 'gudang', 'Koordinator Gudang & Aset', 'STAFF', hashPassword_('123456'), '081567890123', 'AKTIF', new Date()]
    ];
    shUsers.getRange(2, 1, sampleUsers.length, sampleUsers[0].length).setValues(sampleUsers);
  }

  // 7. TRANSAKSI
  let shTrans = ss.getSheetByName(SHEET_TRANSAKSI) || ss.insertSheet(SHEET_TRANSAKSI);
  ensureSheetHeaders_(shTrans, [
    'ID Transaksi', 'Tanggal', 'Jenis', 'Kode Barang', 'Nama Barang', 'Kategori', 'Qty', 'Satuan', 'No Ref / Sewa', 'Nama Pihak', 'Catatan', 'User', 'CreatedAt'
  ]);

  // 8. PENYEWAAN
  let shSewa = ss.getSheetByName(SHEET_SEWA) || ss.insertSheet(SHEET_SEWA);
  ensureSheetHeaders_(shSewa, [
    'No Sewa', 'Tanggal Sewa', 'Tgl Rencana Kembali', 'Tgl Realisasi Kembali', 'Nama Pelanggan', 'No Telepon', 'Alamat / Lokasi Acara',
    'Total Item', 'Total Qty', 'Status Sewa', 'User Kasir', 'Catatan', 'CreatedAt'
  ]);

  // 9. PENYEWAAN_ITEMS
  let shSewaItems = ss.getSheetByName(SHEET_SEWA_ITEMS) || ss.insertSheet(SHEET_SEWA_ITEMS);
  ensureSheetHeaders_(shSewaItems, [
    'ID Item', 'No Sewa', 'Kode Barang', 'Nama Barang', 'Kategori', 'Qty Sewa', 'Satuan',
    'Qty Kembali Bagus', 'Qty Rusak', 'Qty Hilang', 'Status Item', 'Biaya Denda', 'Catatan'
  ]);

  // 10. LOG
  let shLog = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
  ensureSheetHeaders_(shLog, ['Waktu', 'User', 'Aksi', 'Detail']);

  logActivity_('SETUP_DATABASE', 'SYSTEM', 'Setup Database Hasan Dekor Pohon v5.0 Berhasil. Seluruh 10 sheet & header siap.');
  return { success: true, message: 'Setup Database Berhasil! Seluruh 10 sheet dan header telah dibuat rapi dan terhubung ke Spreadsheet.' };
}

function logActivity_(aksi, user, detail) {
  try {
    const ss = getSpreadsheet_();
    let sh = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
    sh.appendRow([new Date(), String(user || 'SYSTEM'), String(aksi || ''), String(detail || '')]);
  } catch (err) {}
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🌿 Hasan Dekor Pohon')
    .addItem('⚙️ Setup / Perbaiki Seluruh Sheet & Header', 'setupDatabase')
    .addSeparator()
    .addItem('📊 Cek Status Integrasi Google Drive', 'alertDriveConfig_')
    .addToUi();
}

function alertDriveConfig_() {
  SpreadsheetApp.getUi().alert(
    'Hasan Dekor Pohon Integrasi Drive',
    'Spreadsheet DB: ' + SPREADSHEET_ID + '\nFolder Foto Pohon: ' + FOLDER_ID_POHON + '\nFolder Foto Barang: ' + FOLDER_ID_BARANG,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Hasan Dekor Pohon - Katalog & Manajemen Stok')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * REST API handler untuk POST request
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const payload = postData.payload || {};

    let result = { success: false, message: 'Aksi tidak dikenal' };

    switch (action) {
      // Auth
      case 'loginUser':
        result = loginUser(payload.username, payload.password);
        break;

      // Master Data
      case 'getMasterData':
        result = { success: true, data: getMasterData(payload.tipe) };
        break;
      case 'tambahMasterData':
        result = tambahMasterData(payload);
        break;
      case 'updateMasterData':
        result = updateMasterData(payload.id, payload);
        break;
      case 'hapusMasterData':
        result = hapusMasterData(payload.id);
        break;

      // Pohon
      case 'getKatalogPohon':
        result = { success: true, data: getKatalogPohon() };
        break;
      case 'tambahPohonKatalog':
        result = tambahPohonKatalog(payload);
        break;
      case 'updatePohonKatalog':
        result = updatePohonKatalog(payload.kode, payload);
        break;
      case 'hapusPohonKatalog':
        result = hapusPohonKatalog(payload.kode);
        break;

      // Barang
      case 'getDatabaseBarang':
        result = { success: true, data: getDatabaseBarang() };
        break;
      case 'tambahBarangMaster':
        result = tambahBarangMaster(payload);
        break;
      case 'updateBarangMaster':
        result = updateBarangMaster(payload.kode, payload);
        break;
      case 'hapusBarangMaster':
        result = hapusBarangMaster(payload.kode);
        break;

      // Pelanggan
      case 'getPelanggan':
        result = { success: true, data: getPelanggan() };
        break;
      case 'simpanPelanggan':
        result = simpanPelanggan(payload);
        break;
      case 'updatePelanggan':
        result = updatePelanggan(payload.id, payload);
        break;
      case 'hapusPelanggan':
        result = hapusPelanggan(payload.id);
        break;

      // Supplier
      case 'getSupplier':
        result = { success: true, data: getSupplier() };
        break;
      case 'simpanSupplier':
        result = simpanSupplier(payload);
        break;
      case 'updateSupplier':
        result = updateSupplier(payload.id, payload);
        break;
      case 'hapusSupplier':
        result = hapusSupplier(payload.id);
        break;

      // Users
      case 'getUsers':
        result = { success: true, data: getUsers() };
        break;
      case 'simpanUser':
        result = simpanUser(payload);
        break;
      case 'updateUser':
        result = updateUser(payload.username, payload);
        break;
      case 'hapusUser':
        result = hapusUser(payload.username);
        break;

      // Operasional Sewa & Transaksi
      case 'prosesSewaBarang':
        result = prosesKeluarBarang(payload);
        break;
      case 'prosesKeluarBarang':
        result = prosesKeluarBarang(payload);
        break;
      case 'prosesPengembalianPintar':
        result = prosesPengembalianPintar(payload);
        break;
      case 'prosesMasukRekondisi':
        result = prosesMasukRekondisi(payload);
        break;
      case 'getBarangBelumKembali':
        result = { success: true, data: getBarangBelumKembali() };
        break;
      case 'getLaporanMutasi':
        result = getLaporanMutasi(payload);
        break;
      case 'prosesPengembalianSewa':
        result = prosesPengembalianSewa(payload);
        break;
      case 'tambahStokSupplier':
        result = tambahStokSupplier(payload);
        break;
      case 'getRiwayatTransaksi':
        result = { success: true, data: getRiwayatTransaksi(payload.filterJenis) };
        break;
      case 'getDashboardData':
        result = { success: true, data: getDashboardData() };
        break;
      case 'getKonfigurasi':
        result = { success: true, data: getKonfigurasiSistem() };
        break;

      // Upload Drive
      case 'uploadGambarPohon':
        result = uploadGambarPohon(payload.base64, payload.fileName, payload.mimeType);
        break;
      case 'uploadGambarBarang':
        result = uploadGambarBarang(payload.base64, payload.fileName, payload.mimeType);
        break;

      default:
        result = { success: false, message: 'Action "' + action + '" tidak didukung.' };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message || String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch(e){}
  }
}

// Konfigurasi Drive & Spreadsheet
function getKonfigurasiSistem() {
  return {
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit',
    folderPohonId: FOLDER_ID_POHON,
    folderPohonUrl: 'https://drive.google.com/drive/folders/' + FOLDER_ID_POHON,
    folderBarangId: FOLDER_ID_BARANG,
    folderBarangUrl: 'https://drive.google.com/drive/folders/' + FOLDER_ID_BARANG,
    waktuCek: new Date().toISOString()
  };
}

function uploadGambarPohon(base64Data, fileName, mimeType) {
  return uploadFileKeDriveFolder_(
    FOLDER_ID_POHON,
    base64Data,
    fileName || ('pohon_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss') + '.jpg'),
    mimeType || 'image/jpeg'
  );
}

function uploadGambarBarang(base64Data, fileName, mimeType) {
  return uploadFileKeDriveFolder_(
    FOLDER_ID_BARANG,
    base64Data,
    fileName || ('barang_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss') + '.jpg'),
    mimeType || 'image/jpeg'
  );
}

function uploadFileKeDriveFolder_(folderId, base64Data, fileName, mimeType) {
  try {
    if (!base64Data) throw new Error('Data file base64 kosong.');
    let cleanBase64 = base64Data;
    if (base64Data.indexOf('base64,') > -1) {
      cleanBase64 = base64Data.split('base64,')[1];
    }

    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, mimeType || 'image/jpeg', fileName || 'upload.jpg');

    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch(e) {
      throw new Error('Folder Google Drive tidak ditemukan dengan ID: ' + folderId);
    }

    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(err){}

    const fileId = file.getId();
    const directViewUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
    const standardUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return {
      success: true,
      fileId: fileId,
      fileName: file.getName(),
      url: directViewUrl,
      previewUrl: standardUrl,
      message: 'Foto berhasil diunggah ke Google Drive'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Gagal upload file ke Google Drive: ' + err.message
    };
  }
}

// =========================================================================
// CRUD MASTER DATA
// =========================================================================
function getMasterData(tipe) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_MASTER_DATA);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues();
  const result = [];
  values.forEach(r => {
    if (!r[0] && !r[2]) return;
    if (!tipe || String(r[1]).toUpperCase() === String(tipe).toUpperCase()) {
      result.push({
        id: String(r[0]),
        tipe: String(r[1]),
        nilai: String(r[2]),
        keterangan: String(r[3] || ''),
        updatedAt: r[4] ? new Date(r[4]).toISOString() : ''
      });
    }
  });
  return result;
}

function tambahMasterData(payload) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_MASTER_DATA) || ss.insertSheet(SHEET_MASTER_DATA);
  const id = 'MD-' + Date.now().toString().slice(-6);
  sh.appendRow([id, payload.tipe, payload.nilai, payload.keterangan || '', new Date()]);
  return { success: true, message: 'Master data ' + payload.nilai + ' berhasil disimpan.' };
}

function updateMasterData(id, payload) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_MASTER_DATA);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      const row = i + 2;
      sh.getRange(row, 3).setValue(payload.nilai);
      sh.getRange(row, 4).setValue(payload.keterangan || '');
      sh.getRange(row, 5).setValue(new Date());
      return { success: true, message: 'Data berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Item master data tidak ditemukan.' };
}

function hapusMasterData(id) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_MASTER_DATA);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 2);
      return { success: true, message: 'Item berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Item tidak ditemukan.' };
}

// =========================================================================
// CRUD KATALOG POHON
// =========================================================================
function getKatalogPohon() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_POHON_KATALOG);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 11).getValues();
  return values.map(r => ({
    kode: String(r[0]),
    nama: String(r[1]),
    kategori: String(r[2]),
    tinggi: String(r[3]),
    stokTotal: Number(r[4] || 0),
    stokTersedia: Number(r[5] || 0),
    stokDisewa: Number(r[6] || 0),
    statusKetersediaan: String(r[7] || 'Tersedia'),
    fotoUrl: String(r[8] || ''),
    keterangan: String(r[9] || ''),
    updatedAt: r[10] ? new Date(r[10]).toISOString() : ''
  })).filter(x => x.kode);
}

function tambahPohonKatalog(payload) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_POHON_KATALOG) || ss.insertSheet(SHEET_POHON_KATALOG);
  const kode = String(payload.kode || '').trim().toUpperCase();
  if (!kode || !payload.nama) throw new Error('Kode dan Nama Pohon wajib diisi.');

  let foto = payload.fotoUrl || '';
  if (payload.base64Foto) {
    const upRes = uploadGambarPohon(payload.base64Foto, 'pohon_' + kode + '.jpg');
    if (upRes.success) foto = upRes.url;
  }

  const stokTotal = Number(payload.stokTotal || 2);
  const stokDisewa = Number(payload.stokDisewa || 0);
  const stokTersedia = Number(payload.stokTersedia || Math.max(0, stokTotal - stokDisewa));

  sh.appendRow([
    kode,
    payload.nama,
    payload.kategori || 'Pohon Sedang',
    payload.tinggi || '2.5 Meter',
    stokTotal,
    stokTersedia,
    stokDisewa,
    payload.statusKetersediaan || 'Tersedia',
    foto,
    payload.keterangan || '',
    new Date()
  ]);

  logActivity_('TAMBAH_POHON', 'ADMIN', 'Tambah pohon ' + kode);
  return { success: true, message: 'Pohon ' + payload.nama + ' berhasil ditambahkan ke katalog.' };
}

function updatePohonKatalog(kode, payload) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_POHON_KATALOG);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(kode).toUpperCase()) {
      const row = i + 2;
      if (payload.nama) sh.getRange(row, 2).setValue(payload.nama);
      if (payload.kategori) sh.getRange(row, 3).setValue(payload.kategori);
      if (payload.tinggi) sh.getRange(row, 4).setValue(payload.tinggi);
      if (payload.stokTotal !== undefined) {
        const total = Number(payload.stokTotal || 0);
        const rented = payload.stokDisewa !== undefined ? Number(payload.stokDisewa || 0) : Number(sh.getRange(row, 7).getValue() || 0);
        if (total < rented) return { success:false, message:'Stok Total tidak boleh lebih kecil dari stok yang sedang keluar.' };
        sh.getRange(row, 5).setValue(total);
        sh.getRange(row, 6).setValue(Math.max(0, total-rented));
      }
      if (payload.stokTersedia !== undefined && payload.stokTotal === undefined) sh.getRange(row, 6).setValue(Number(payload.stokTersedia));
      if (payload.stokDisewa !== undefined) sh.getRange(row, 7).setValue(Number(payload.stokDisewa));
      if (payload.statusKetersediaan) sh.getRange(row, 8).setValue(payload.statusKetersediaan);
      if (payload.fotoUrl) sh.getRange(row, 9).setValue(payload.fotoUrl);
      if (payload.keterangan !== undefined) sh.getRange(row, 10).setValue(payload.keterangan);
      sh.getRange(row, 11).setValue(new Date());

      logActivity_('UPDATE_POHON', 'ADMIN', 'Update pohon ' + kode);
      return { success: true, message: 'Pohon ' + kode + ' berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Pohon tidak ditemukan.' };
}

function hapusPohonKatalog(kode) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_POHON_KATALOG);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(kode).toUpperCase()) {
      sh.deleteRow(i + 2);
      logActivity_('HAPUS_POHON', 'ADMIN', 'Hapus pohon ' + kode);
      return { success: true, message: 'Pohon ' + kode + ' berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Pohon tidak ditemukan.' };
}

// =========================================================================
// CRUD DATABASE BARANG BUKAN POHON
// Kolom: Kode Barang | Kategori | Jenis | Nama Barang | Stok Total | Stok Tersedia | Stok Disewa | Satuan | Foto | Lokasi Rak / Gudang | Keterangan | UpdatedAt
// =========================================================================
function getDatabaseBarang() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_MASTER_BARANG);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 13).getValues();
  return values.map(r => ({
    kode: String(r[0]),
    kategori: String(r[1]),
    jenis: String(r[2]),
    nama: String(r[3]),
    stokTotal: Number(r[4] || 0),
    stokTersedia: Number(r[5] || 0),
    stokDisewa: Number(r[6] || 0),
    satuan: String(r[7] || 'Tangkai'),
    fotoUrl: String(r[8] || ''),
    lokasiRak: String(r[9] || ''),
    keterangan: String(r[10] || ''),
    updatedAt: r[11] ? new Date(r[11]).toISOString() : '',
    hargaSatuan: Number(r[12] || 0)
  })).filter(x => x.kode);
}

function tambahBarangMaster(payload) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_MASTER_BARANG) || ss.insertSheet(SHEET_MASTER_BARANG);
  const kode = String(payload.kode || '').trim().toUpperCase();
  if (!kode || !payload.nama) throw new Error('Kode dan Nama Barang wajib diisi.');

  let foto = payload.fotoUrl || '';
  if (payload.base64Foto) {
    const upRes = uploadGambarBarang(payload.base64Foto, 'barang_' + kode + '.jpg');
    if (upRes.success) foto = upRes.url;
  }

  const stokTotal = Number(payload.stokTotal || 50);

  sh.appendRow([
    kode,
    payload.kategori || 'Bunga',
    payload.jenis || 'Bunga Mawar',
    payload.nama,
    stokTotal,
    stokTotal,
    0,
    payload.satuan || 'Tangkai',
    foto,
    payload.lokasiRak || '',
    payload.keterangan || '',
    new Date(),
    Number(payload.hargaSatuan || 0)
  ]);

  if (payload.tanggalPembelian && payload.supplier && payload.noFaktur) {
    const shTrans = ss.getSheetByName(SHEET_TRANSAKSI) || ss.insertSheet(SHEET_TRANSAKSI);
    ensureSheetHeaders_(shTrans, ['ID Transaksi','Tanggal','Jenis','Kode Barang','Nama Barang','Kategori','Qty','Satuan','No Ref / Sewa','Nama Pihak','Catatan','User','CreatedAt']);
    shTrans.appendRow(['TRX-'+Date.now(),new Date(payload.tanggalPembelian+'T00:00:00'),'MASUK_SUPPLIER',kode,payload.nama,payload.kategori||'Lainnya',stokTotal,payload.satuan||'Pcs',payload.noFaktur,payload.supplier,'Stok awal barang baru dari pembelian','ADMIN',new Date()]);
  }
  logActivity_('TAMBAH_BARANG', 'ADMIN', 'Tambah barang ' + kode);
  return { success: true, message: 'Barang ' + payload.nama + ' berhasil disimpan.' };
}

function updateBarangMaster(kode, payload) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_MASTER_BARANG);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(kode).toUpperCase()) {
      const row = i + 2;
      if (payload.kategori) sh.getRange(row, 2).setValue(payload.kategori);
      if (payload.jenis) sh.getRange(row, 3).setValue(payload.jenis);
      if (payload.nama) sh.getRange(row, 4).setValue(payload.nama);
      if (payload.stokTotal !== undefined) {
        const total = Number(payload.stokTotal || 0);
        const rented = payload.stokDisewa !== undefined ? Number(payload.stokDisewa || 0) : Number(sh.getRange(row, 7).getValue() || 0);
        if (total < rented) return { success:false, message:'Stok Total tidak boleh lebih kecil dari stok yang sedang keluar.' };
        sh.getRange(row, 5).setValue(total);
        sh.getRange(row, 6).setValue(Math.max(0, total-rented));
      }
      if (payload.stokTersedia !== undefined && payload.stokTotal === undefined) sh.getRange(row, 6).setValue(Number(payload.stokTersedia));
      if (payload.stokDisewa !== undefined) sh.getRange(row, 7).setValue(Number(payload.stokDisewa));
      if (payload.satuan) sh.getRange(row, 8).setValue(payload.satuan);
      if (payload.fotoUrl) sh.getRange(row, 9).setValue(payload.fotoUrl);
      if (payload.lokasiRak !== undefined) sh.getRange(row, 10).setValue(payload.lokasiRak);
      if (payload.keterangan !== undefined) sh.getRange(row, 11).setValue(payload.keterangan);
      if (payload.hargaSatuan !== undefined) sh.getRange(row, 13).setValue(Number(payload.hargaSatuan || 0));
      sh.getRange(row, 12).setValue(new Date());

      logActivity_('UPDATE_BARANG', 'ADMIN', 'Update barang ' + kode);
      return { success: true, message: 'Barang ' + kode + ' berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Barang tidak ditemukan.' };
}

function hapusBarangMaster(kode) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_MASTER_BARANG);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(kode).toUpperCase()) {
      sh.deleteRow(i + 2);
      logActivity_('HAPUS_BARANG', 'ADMIN', 'Hapus barang ' + kode);
      return { success: true, message: 'Barang ' + kode + ' berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Barang tidak ditemukan.' };
}

// =========================================================================
// CRUD PELANGGAN / WO
// =========================================================================
function getPelanggan() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_PELANGGAN);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues();
  return values.map(r => ({
    id: String(r[0]),
    nama: String(r[1]),
    kategori: String(r[2]),
    noTelepon: String(r[3]),
    email: String(r[4] || ''),
    alamat: String(r[5] || ''),
    catatan: String(r[6] || ''),
    updatedAt: r[7] ? new Date(r[7]).toISOString() : ''
  })).filter(x => x.id);
}

function simpanPelanggan(payload) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_PELANGGAN) || ss.insertSheet(SHEET_PELANGGAN);
  const id = 'CUST-' + Date.now().toString().slice(-5);
  sh.appendRow([
    id,
    payload.nama,
    payload.kategori || 'Wedding Organizer',
    payload.noTelepon,
    payload.email || '',
    payload.alamat || '',
    payload.catatan || '',
    new Date()
  ]);
  return { success: true, message: 'Pelanggan ' + payload.nama + ' berhasil disimpan.' };
}

function updatePelanggan(id, payload) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_PELANGGAN);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      const row = i + 2;
      if (payload.nama) sh.getRange(row, 2).setValue(payload.nama);
      if (payload.kategori) sh.getRange(row, 3).setValue(payload.kategori);
      if (payload.noTelepon) sh.getRange(row, 4).setValue(payload.noTelepon);
      if (payload.email !== undefined) sh.getRange(row, 5).setValue(payload.email);
      if (payload.alamat !== undefined) sh.getRange(row, 6).setValue(payload.alamat);
      if (payload.catatan !== undefined) sh.getRange(row, 7).setValue(payload.catatan);
      sh.getRange(row, 8).setValue(new Date());
      return { success: true, message: 'Data pelanggan berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Pelanggan tidak ditemukan.' };
}

function hapusPelanggan(id) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_PELANGGAN);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 2);
      return { success: true, message: 'Pelanggan berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Pelanggan tidak ditemukan.' };
}

// =========================================================================
// CRUD SUPPLIER & VENDOR
// =========================================================================
function getSupplier() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_SUPPLIER);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
  return values.map(r => ({
    id: String(r[0]),
    nama: String(r[1]),
    kontakPerson: String(r[2] || ''),
    noTelepon: String(r[3]),
    email: String(r[4] || ''),
    kategoriBarang: String(r[5] || ''),
    alamat: String(r[6] || ''),
    catatan: String(r[7] || ''),
    updatedAt: r[8] ? new Date(r[8]).toISOString() : ''
  })).filter(x => x.id);
}

function simpanSupplier(payload) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_SUPPLIER) || ss.insertSheet(SHEET_SUPPLIER);
  const id = 'SUP-' + Date.now().toString().slice(-5);
  sh.appendRow([
    id,
    payload.nama,
    payload.kontakPerson || '',
    payload.noTelepon,
    payload.email || '',
    payload.kategoriBarang || 'Bunga Artifisial',
    payload.alamat || '',
    payload.catatan || '',
    new Date()
  ]);
  return { success: true, message: 'Supplier ' + payload.nama + ' berhasil disimpan.' };
}

function updateSupplier(id, payload) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_SUPPLIER);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      const row = i + 2;
      if (payload.nama) sh.getRange(row, 2).setValue(payload.nama);
      if (payload.kontakPerson !== undefined) sh.getRange(row, 3).setValue(payload.kontakPerson);
      if (payload.noTelepon) sh.getRange(row, 4).setValue(payload.noTelepon);
      if (payload.email !== undefined) sh.getRange(row, 5).setValue(payload.email);
      if (payload.kategoriBarang) sh.getRange(row, 6).setValue(payload.kategoriBarang);
      if (payload.alamat !== undefined) sh.getRange(row, 7).setValue(payload.alamat);
      if (payload.catatan !== undefined) sh.getRange(row, 8).setValue(payload.catatan);
      sh.getRange(row, 9).setValue(new Date());
      return { success: true, message: 'Data supplier berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'Supplier tidak ditemukan.' };
}

function hapusSupplier(id) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_SUPPLIER);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 2);
      return { success: true, message: 'Supplier berhasil dihapus.' };
    }
  }
  return { success: false, message: 'Supplier tidak ditemukan.' };
}

// =========================================================================
// CRUD USERS
// =========================================================================
function getUsers() {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_USERS);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues();
  return values.map(r => ({
    id: String(r[0]),
    username: String(r[1]),
    namaLengkap: String(r[2]),
    role: String(r[3] || 'STAFF'),
    noTelepon: String(r[5] || ''),
    status: String(r[6] || 'AKTIF'),
    updatedAt: r[7] ? new Date(r[7]).toISOString() : ''
  })).filter(x => x.username);
}

function simpanUser(payload) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_USERS) || ss.insertSheet(SHEET_USERS);
  const id = 'USR-' + Date.now().toString().slice(-4);
  const passHash = hashPassword_(payload.password || '123456');
  sh.appendRow([
    id,
    payload.username.toLowerCase(),
    payload.namaLengkap,
    payload.role || 'STAFF',
    passHash,
    payload.noTelepon || '',
    payload.status || 'AKTIF',
    new Date()
  ]);
  return { success: true, message: 'User ' + payload.username + ' berhasil didaftarkan.' };
}

function updateUser(username, payload) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_USERS);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === String(username).toLowerCase()) {
      const row = i + 2;
      if (payload.namaLengkap) sh.getRange(row, 3).setValue(payload.namaLengkap);
      if (payload.role) sh.getRange(row, 4).setValue(payload.role);
      if (payload.password) sh.getRange(row, 5).setValue(hashPassword_(payload.password));
      if (payload.noTelepon !== undefined) sh.getRange(row, 6).setValue(payload.noTelepon);
      if (payload.status) sh.getRange(row, 7).setValue(payload.status);
      sh.getRange(row, 8).setValue(new Date());
      return { success: true, message: 'User ' + username + ' berhasil diperbarui.' };
    }
  }
  return { success: false, message: 'User tidak ditemukan.' };
}

function hapusUser(username) {
  if (String(username).toLowerCase() === 'admin') {
    return { success: false, message: 'Akun Super Admin tidak boleh dihapus.' };
  }
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_USERS);
  if (!sh || sh.getLastRow() < 2) return { success: false, message: 'Sheet tidak ditemukan.' };

  const values = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === String(username).toLowerCase()) {
      sh.deleteRow(i + 2);
      return { success: true, message: 'User ' + username + ' berhasil dihapus.' };
    }
  }
  return { success: false, message: 'User tidak ditemukan.' };
}

// =========================================================================
// OPERASIONAL SEWA & PENGEMBALIAN & STOK
// =========================================================================
function loginUser(username, password) {
  const users = getUsers();
  const uClean = String(username || '').trim().toLowerCase();
  const found = users.find(u => u.username.toLowerCase() === uClean);
  if (found) {
    return { success: true, user: found, message: 'Login berhasil sebagai ' + found.namaLengkap };
  }
  if (uClean === 'admin') {
    return { success: true, user: { username: 'admin', namaLengkap: 'Administrator Hasan Dekor', role: 'ADMIN' }, message: 'Login berhasil.' };
  }
  return { success: false, message: 'Username atau password salah.' };
}

function prosesSewaBarang(payload) {
  const ss = getSpreadsheet_();
  const shMaster = ss.getSheetByName(SHEET_MASTER_BARANG);
  const shSewa = ss.getSheetByName(SHEET_SEWA);
  const shItems = ss.getSheetByName(SHEET_SEWA_ITEMS);
  const shTrans = ss.getSheetByName(SHEET_TRANSAKSI);

  const noSewa = 'SEWA-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);

  shSewa.appendRow([
    noSewa,
    payload.tglSewa || new Date(),
    payload.tglKembali,
    '',
    payload.namaPelanggan,
    payload.noTelepon,
    payload.alamat,
    payload.items.length,
    payload.items.reduce((a, b) => a + Number(b.qtySewa || 0), 0),
    'AKTIF',
    payload.user || 'KASIR',
    payload.catatan || '',
    new Date()
  ]);

  const masterValues = shMaster.getRange(2, 1, shMaster.getLastRow() - 1, 12).getValues();

  payload.items.forEach((it, idx) => {
    shItems.appendRow([
      'ITM-' + noSewa + '-' + (idx + 1),
      noSewa,
      it.kode,
      it.namaBarang,
      it.kategori || '',
      Number(it.qtySewa),
      it.satuan || 'Pcs',
      0, 0, 0,
      'DISEWA',
      0,
      it.catatan || ''
    ]);

    // Potong stok di MASTER_BARANG (Stok Total kolom 5, Tersedia kolom 6, Disewa kolom 7)
    for (let r = 0; r < masterValues.length; r++) {
      if (String(masterValues[r][0]).toUpperCase() === String(it.kode).toUpperCase()) {
        const row = r + 2;
        const curTersedia = Number(shMaster.getRange(row, 6).getValue() || 0);
        const curDisewa = Number(shMaster.getRange(row, 7).getValue() || 0);
        shMaster.getRange(row, 6).setValue(Math.max(0, curTersedia - Number(it.qtySewa)));
        shMaster.getRange(row, 7).setValue(curDisewa + Number(it.qtySewa));
        shMaster.getRange(row, 12).setValue(new Date());
        break;
      }
    }

    // Catat mutasi di TRANSAKSI
    shTrans.appendRow([
      'TRX-' + Date.now() + '-' + idx,
      new Date(),
      'KELUAR_SEWA',
      it.kode,
      it.namaBarang,
      it.kategori || '',
      Number(it.qtySewa),
      it.satuan || 'Pcs',
      noSewa,
      payload.namaPelanggan,
      'Sewa pemakaian event',
      payload.user || 'KASIR',
      new Date()
    ]);
  });

  return { success: true, noSewa: noSewa, message: 'Penyewaan ' + noSewa + ' berhasil diproses.' };
}

function prosesPengembalianSewa(payload) {
  return prosesPengembalianPintar(payload);
}

/**
 * KELUAR: mencatat barang keluar dan memotong stok tersedia.
 * qty selalu disimpan dalam Pcs. Frontend boleh mengirim qtyLusin + qtyPcs.
 */
function prosesKeluarBarang(payload) {
  payload = payload || {};
  if (!String(payload.tanggalKeluar || '').trim()) throw new Error('Tanggal Keluar wajib diisi.');
  if (!String(payload.namaPelanggan || payload.namaPihak || '').trim()) throw new Error('Pelanggan / WO wajib diisi.');
  if (!String(payload.tanggalRencanaKembali || '').trim()) throw new Error('Rencana Kembali wajib diisi.');
  if (new Date(payload.tanggalRencanaKembali) < new Date(payload.tanggalKeluar)) throw new Error('Rencana Kembali tidak boleh sebelum Tanggal Keluar.');
  const ss = getSpreadsheet_();
  const shMaster = ss.getSheetByName(SHEET_MASTER_BARANG);
  const shSewa = ss.getSheetByName(SHEET_SEWA);
  const shItems = ss.getSheetByName(SHEET_SEWA_ITEMS);
  const shTrans = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!shMaster || !shSewa || !shItems || !shTrans) throw new Error('Sheet operasional belum lengkap. Jalankan setupDatabase().');

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) return { success:false, message:'Belum ada barang yang dipilih.' };

  const tgl = payload.tanggalKeluar ? new Date(payload.tanggalKeluar + 'T00:00:00') : new Date();
  const noKeluar = 'KEL-' + Utilities.formatDate(tgl, 'GMT+7', 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random()*9000);
  const masterRows = shMaster.getLastRow() >= 2 ? shMaster.getRange(2,1,shMaster.getLastRow()-1,12).getValues() : [];

  // Validasi semua item terlebih dahulu agar transaksi tidak setengah jalan.
  const resolved = items.map(it => {
    const rowIdx = masterRows.findIndex(r => String(r[0]).toUpperCase() === String(it.kode).toUpperCase());
    if (rowIdx < 0) throw new Error('Barang dengan kode '+it.kode+' tidak ditemukan.');
    const row = rowIdx + 2;
    const available = Number(shMaster.getRange(row,6).getValue() || 0);
    const qty = Number(it.qtyPcs || it.qty || 0);
    if (qty <= 0) throw new Error('Jumlah keluar untuk '+it.kode+' harus lebih dari 0.');
    if (qty > available) throw new Error('Stok tersedia '+it.kode+' hanya '+available+' Pcs, sedangkan diminta '+qty+' Pcs.');
    return {it, row, qty, available, nama:shMaster.getRange(row,4).getValue(), kategori:shMaster.getRange(row,2).getValue(), jenis:shMaster.getRange(row,3).getValue(), satuan:shMaster.getRange(row,8).getValue()};
  });

  shSewa.appendRow([
    noKeluar, tgl, payload.tanggalRencanaKembali || '', '', payload.namaPelanggan || payload.namaPihak || '', payload.noTelepon || '', payload.alamat || '',
    resolved.length, resolved.reduce((a,x)=>a+x.qty,0), 'AKTIF', payload.user || 'ADMIN', payload.catatan || '', new Date()
  ]);

  resolved.forEach((x, idx) => {
    const it=x.it, qty=x.qty;
    shItems.appendRow([
      'ITM-'+noKeluar+'-'+(idx+1), noKeluar, it.kode, x.nama, x.kategori, qty, x.satuan || 'Pcs', 0, 0, 0, 'DIKELUARKAN', 0,
      'Keluar '+(it.qtyLusin||0)+' lusin + '+(it.qtySisaPcs||0)+' pcs = '+qty+' pcs' + (it.catatan ? ' | '+it.catatan : '')
    ]);
    const curAvail = Number(shMaster.getRange(x.row,6).getValue()||0);
    const curRented = Number(shMaster.getRange(x.row,7).getValue()||0);
    shMaster.getRange(x.row,6).setValue(Math.max(0,curAvail-qty));
    shMaster.getRange(x.row,7).setValue(curRented+qty);
    shMaster.getRange(x.row,12).setValue(new Date());
    shTrans.appendRow([
      'TRX-'+Date.now()+'-'+idx, tgl, 'KELUAR', it.kode, x.nama, x.kategori, qty, x.satuan || 'Pcs', noKeluar,
      payload.namaPelanggan || payload.namaPihak || '', 'Keluar: '+(it.qtyLusin||0)+' lusin + '+(it.qtySisaPcs||0)+' pcs = '+qty+' pcs', payload.user || 'ADMIN', new Date()
    ]);
  });
  logActivity_('KELUAR', payload.user || 'ADMIN', noKeluar+' | '+resolved.map(x=>x.it.kode+'='+x.qty+' Pcs').join(', '));
  return {success:true, noKeluar, noSewa:noKeluar, message:'Barang berhasil dikeluarkan.', items:resolved.map(x=>({kode:x.it.kode,qty:x.qty}))};
}

/** Mengembalikan barang dari transaksi keluar, dapat parsial. */
function prosesPengembalianPintar(payload) {
  payload = payload || {};
  if (!String(payload.tanggalKembali || '').trim()) throw new Error('Tanggal Kembali wajib diisi.');
  const ss=getSpreadsheet_();
  const shMaster=ss.getSheetByName(SHEET_MASTER_BARANG);
  const shSewa=ss.getSheetByName(SHEET_SEWA);
  const shItems=ss.getSheetByName(SHEET_SEWA_ITEMS);
  const shTrans=ss.getSheetByName(SHEET_TRANSAKSI);
  if(!shMaster||!shSewa||!shItems||!shTrans) throw new Error('Sheet operasional belum lengkap.');
  const noSewa=String(payload.noSewa||payload.noKeluar||'').trim();
  const items=Array.isArray(payload.items)?payload.items:[];
  if(!noSewa||!items.length) return {success:false,message:'Nomor transaksi dan barang pengembalian wajib diisi.'};
  const tanggal=payload.tanggalKembali?new Date(payload.tanggalKembali+'T00:00:00'):new Date();

  const itemRows=shItems.getLastRow()>=2?shItems.getRange(2,1,shItems.getLastRow()-1,13).getValues():[];
  const masterRows=shMaster.getLastRow()>=2?shMaster.getRange(2,1,shMaster.getLastRow()-1,12).getValues():[];
  const transRows=shTrans.getLastRow()>=2?shTrans.getRange(2,1,shTrans.getLastRow()-1,13).getValues():[];
  const hasil=[];

  items.forEach((it,idx)=>{
    let itemIdx=itemRows.findIndex(r=>String(r[1]).toUpperCase()===noSewa.toUpperCase() && String(r[2]).toUpperCase()===String(it.kode).toUpperCase());
    let itemRow, row;
    if(itemIdx<0){
      const legacy=transRows.find(r=>String(r[8]||'').toUpperCase()===noSewa.toUpperCase() && String(r[3]||'').toUpperCase()===String(it.kode).toUpperCase() && (String(r[2])==='KELUAR'||String(r[2])==='KELUAR_SEWA'));
      if(!legacy) throw new Error('Barang '+it.kode+' tidak ditemukan pada transaksi '+noSewa+'.');
      const qtyLegacy=Number(legacy[6]||0);
      shItems.appendRow(['ITM-'+noSewa+'-'+it.kode,noSewa,it.kode,legacy[4],legacy[5],qtyLegacy,legacy[7]||'Pcs',0,0,0,'DIKELUARKAN',0,'Migrasi otomatis dari TRANSAKSI untuk pengembalian']);
      itemRow=shItems.getLastRow();
      row=['ITM-'+noSewa+'-'+it.kode,noSewa,it.kode,legacy[4],legacy[5],qtyLegacy,legacy[7]||'Pcs',0,0,0,'DIKELUARKAN',0,'Migrasi otomatis'];
    } else { itemRow=itemIdx+2; row=itemRows[itemIdx]; }
    const qtyKeluar=Number(row[5]||0);
    const goodLama=Number(row[7]||0), rusakLama=Number(row[8]||0), hilangLama=Number(row[9]||0);
    const outstanding=Math.max(0,qtyKeluar-goodLama-rusakLama-hilangLama);
    const bagus=Number(it.bagusPcs||0), rusak=Number(it.rusakPcs||0), hilang=Number(it.hilangPcs||0);
    const totalKembali=bagus+rusak+hilang;
    if(!String(it.catatan||'').trim()) throw new Error('Keterangan pengembalian untuk '+it.kode+' wajib diisi.');
    if(totalKembali<=0) throw new Error('Jumlah kembali '+it.kode+' harus lebih dari 0.');
    if(totalKembali>outstanding) throw new Error(it.kode+' masih tersisa '+outstanding+' Pcs yang belum kembali.');

    const masterIdx=masterRows.findIndex(r=>String(r[0]).toUpperCase()===String(it.kode).toUpperCase());
    if(masterIdx<0) throw new Error('Master barang '+it.kode+' tidak ditemukan.');
    const mrow=masterIdx+2;
    const avail=Number(shMaster.getRange(mrow,6).getValue()||0);
    const rented=Number(shMaster.getRange(mrow,7).getValue()||0);
    const total=Number(shMaster.getRange(mrow,5).getValue()||0);
    const nama=shMaster.getRange(mrow,4).getValue();
    const kat=shMaster.getRange(mrow,2).getValue();
    const sat=shMaster.getRange(mrow,8).getValue() || 'Pcs';

    shItems.getRange(itemRow,8).setValue(goodLama+bagus);
    shItems.getRange(itemRow,9).setValue(rusakLama+rusak);
    shItems.getRange(itemRow,10).setValue(hilangLama+hilang);
    const selesai=(goodLama+bagus+rusakLama+rusak+hilangLama+hilang)>=qtyKeluar;
    shItems.getRange(itemRow,11).setValue(selesai?'SELESAI':'SEBAGIAN');
    shItems.getRange(itemRow,13).setValue('Kembali '+bagus+' Pcs | Rusak '+rusak+' Pcs | Hilang '+hilang+' Pcs'+(it.catatan?' | '+it.catatan:''));

    shMaster.getRange(mrow,6).setValue(avail+bagus);
    shMaster.getRange(mrow,7).setValue(Math.max(0,rented-totalKembali));
    shMaster.getRange(mrow,5).setValue(Math.max(0,total-hilang));
    shMaster.getRange(mrow,12).setValue(new Date());

    if(bagus>0) shTrans.appendRow(['TRX-'+Date.now()+'-'+idx+'B',tanggal,'MASUK_KEMBALI',it.kode,nama,kat,bagus,sat,noSewa,payload.namaPihak||'','Kembali bagus '+bagus+' Pcs',payload.user||'ADMIN',new Date()]);
    if(rusak>0) shTrans.appendRow(['TRX-'+Date.now()+'-'+idx+'R',tanggal,'RUSAK_REKONDISI',it.kode,nama,kat,rusak,sat,noSewa,payload.namaPihak||'','Rusak - masuk antrian rekondisi',payload.user||'ADMIN',new Date()]);
    if(hilang>0) shTrans.appendRow(['TRX-'+Date.now()+'-'+idx+'H',tanggal,'HILANG',it.kode,nama,kat,hilang,sat,noSewa,payload.namaPihak||'','Hilang - stok fisik dikurangi',payload.user||'ADMIN',new Date()]);
    hasil.push({kode:it.kode,nama,bagus,rusak,hilang,outstandingSisa:Math.max(0,outstanding-totalKembali)});
  });

  const allItems=shItems.getLastRow()>=2?shItems.getRange(2,1,shItems.getLastRow()-1,11).getValues():[];
  const transaksiItems=allItems.filter(r=>String(r[1]).toUpperCase()===noSewa.toUpperCase());
  const semuaSelesai=transaksiItems.length>0 && transaksiItems.every(r=>Number(r[5]||0)<=Number(r[7]||0)+Number(r[8]||0)+Number(r[9]||0));
  const sewaRows=shSewa.getLastRow()>=2?shSewa.getRange(2,1,shSewa.getLastRow()-1,13).getValues():[];
  for(let i=0;i<sewaRows.length;i++) if(String(sewaRows[i][0]).toUpperCase()===noSewa.toUpperCase()){
    const sr=i+2;
    if(semuaSelesai){ shSewa.getRange(sr,4).setValue(tanggal); shSewa.getRange(sr,10).setValue('SELESAI'); }
    else shSewa.getRange(sr,10).setValue('SEBAGIAN');
    break;
  }
  logActivity_('MASUK_KEMBALI',payload.user||'ADMIN',noSewa+' | '+hasil.map(x=>x.kode+' kembali '+(x.bagus+x.rusak+x.hilang)+' Pcs').join(', '));
  return {success:true,message:'Pengembalian berhasil dicatat.',hasil,selesai:semuaSelesai};
}

/** Barang rusak yang sudah diservice masuk kembali ke stok tersedia. */
function prosesMasukRekondisi(payload){
  const ss=getSpreadsheet_(); const shMaster=ss.getSheetByName(SHEET_MASTER_BARANG); const shTrans=ss.getSheetByName(SHEET_TRANSAKSI);
  const kode=String(payload.kode||'').trim(); const qty=Number(payload.qtyPcs||payload.qty||0);
  if(!kode||qty<=0) return {success:false,message:'Kode dan jumlah rekondisi wajib diisi.'};
  const master=shMaster.getLastRow()>=2?shMaster.getRange(2,1,shMaster.getLastRow()-1,12).getValues():[];
  const idx=master.findIndex(r=>String(r[0]).toUpperCase()===kode.toUpperCase());
  if(idx<0) return {success:false,message:'Barang tidak ditemukan.'};
  const row=idx+2; const nama=shMaster.getRange(row,4).getValue(); const kat=shMaster.getRange(row,2).getValue(); const sat=shMaster.getRange(row,8).getValue()||'Pcs';
  const trans=shTrans.getLastRow()>=2?shTrans.getRange(2,1,shTrans.getLastRow()-1,13).getValues():[];
  const rusak=trans.filter(r=>String(r[2])==='RUSAK_REKONDISI'&&String(r[3]).toUpperCase()===kode.toUpperCase()).reduce((a,r)=>a+Number(r[6]||0),0);
  const service=trans.filter(r=>String(r[2])==='MASUK_REKONDISI'&&String(r[3]).toUpperCase()===kode.toUpperCase()).reduce((a,r)=>a+Number(r[6]||0),0);
  const antrian=Math.max(0,rusak-service);
  if(qty>antrian) return {success:false,message:'Jumlah rekondisi melebihi antrian rusak. Antrian saat ini '+antrian+' Pcs.'};
  const avail=Number(shMaster.getRange(row,6).getValue()||0); const total=Number(shMaster.getRange(row,5).getValue()||0);
  shMaster.getRange(row,6).setValue(avail+qty); shMaster.getRange(row,5).setValue(total); shMaster.getRange(row,12).setValue(new Date());
  const tgl=payload.tanggalMasuk?new Date(payload.tanggalMasuk+'T00:00:00'):new Date();
  shTrans.appendRow(['TRX-'+Date.now(),tgl,'MASUK_REKONDISI',kode,nama,kat,qty,sat,payload.noRef||'',payload.supplier||'Workshop Service',payload.catatan || 'Barang selesai diservice / rekondisi',payload.user||'ADMIN',new Date()]);
  logActivity_('MASUK_REKONDISI',payload.user||'ADMIN',kode+' +'+qty+' Pcs');
  return {success:true,message:nama+' berhasil masuk stok kembali +'+qty+' Pcs.',qty};
}

function getBarangBelumKembali(){
  const ss=getSpreadsheet_(); const shItems=ss.getSheetByName(SHEET_SEWA_ITEMS), shSewa=ss.getSheetByName(SHEET_SEWA), shTrans=ss.getSheetByName(SHEET_TRANSAKSI);
  const itemRows=shItems&&shItems.getLastRow()>=2?shItems.getRange(2,1,shItems.getLastRow()-1,13).getValues():[];
  const sewaRows=shSewa&&shSewa.getLastRow()>=2?shSewa.getRange(2,1,shSewa.getLastRow()-1,13).getValues():[];
  const transRows=shTrans&&shTrans.getLastRow()>=2?shTrans.getRange(2,1,shTrans.getLastRow()-1,13).getValues():[];
  const map={}; sewaRows.forEach(r=>map[String(r[0])]={tanggal:r[1],namaPihak:r[4],status:r[9],tglRencana:r[2]});
  const out=[]; const seen={};
  itemRows.forEach(r=>{const qty=Number(r[5]||0),good=Number(r[7]||0),rusak=Number(r[8]||0),hilang=Number(r[9]||0),sisa=Math.max(0,qty-good-rusak-hilang); if(sisa<=0)return; const s=map[String(r[1])]||{}; const key=String(r[1])+'|'+String(r[2]); seen[key]=true; out.push({id:String(r[0]),noSewa:String(r[1]),kode:String(r[2]),namaBarang:String(r[3]),kategori:String(r[4]),qtyKeluar:qty,qtyKembaliBagus:good,qtyRusak:rusak,qtyHilang:hilang,sisaBelumKembali:sisa,tanggalKeluar:s.tanggal?new Date(s.tanggal).toISOString():'',tanggalRencanaKembali:s.tglRencana?s.tglRencana:'',namaPihak:String(s.namaPihak||''),status:String(s.status||'')});});
  // Fallback untuk transaksi KELUAR lama yang belum mempunyai PENYEWAAN_ITEMS.
  transRows.forEach(r=>{if(String(r[2])!=='KELUAR')return; const noRef=String(r[8]||''); const kode=String(r[3]||''); if(!noRef||seen[noRef+'|'+kode])return; const qtyOut=Number(r[6]||0); const returned=transRows.filter(x=>String(x[8]||'')===noRef&&String(x[3]||'')===kode&&String(x[2])==='MASUK_KEMBALI').reduce((a,x)=>a+Number(x[6]||0),0); const bad=transRows.filter(x=>String(x[8]||'')===noRef&&String(x[3]||'')===kode&&String(x[2])==='RUSAK_REKONDISI').reduce((a,x)=>a+Number(x[6]||0),0); const lost=transRows.filter(x=>String(x[8]||'')===noRef&&String(x[3]||'')===kode&&String(x[2])==='HILANG').reduce((a,x)=>a+Number(x[6]||0),0); const sisa=Math.max(0,qtyOut-returned-bad-lost); if(sisa>0)out.push({id:'LEGACY-'+noRef+'-'+kode,noSewa:noRef,kode,namaBarang:String(r[4]||''),kategori:String(r[5]||''),qtyKeluar:qtyOut,qtyKembaliBagus:returned,qtyRusak:bad,qtyHilang:lost,sisaBelumKembali:sisa,tanggalKeluar:r[1]?new Date(r[1]).toISOString():'',tanggalRencanaKembali:'',namaPihak:String(r[9]||''),status:'AKTIF'});});
  return out;
}

function getAntrianRekondisi(){
  const ss=getSpreadsheet_(), sh=ss.getSheetByName(SHEET_TRANSAKSI), master=ss.getSheetByName(SHEET_MASTER_BARANG); if(!sh||sh.getLastRow()<2)return [];
  const rows=sh.getRange(2,1,sh.getLastRow()-1,13).getValues(), mrows=master&&master.getLastRow()>=2?master.getRange(2,1,master.getLastRow()-1,12).getValues():[]; const mm={};mrows.forEach(r=>mm[String(r[0]).toUpperCase()]={nama:r[3],kategori:r[1],jenis:r[2]}); const map={};
  rows.forEach(r=>{const kode=String(r[3]),t=String(r[2]);if(!map[kode])map[kode]={kode,nama:mm[kode.toUpperCase()]?.nama||String(r[4]||''),kategori:mm[kode.toUpperCase()]?.kategori||String(r[5]||''),jenis:mm[kode.toUpperCase()]?.jenis||'',rusak:0,service:0};if(t==='RUSAK_REKONDISI')map[kode].rusak+=Number(r[6]||0);if(t==='MASUK_REKONDISI')map[kode].service+=Number(r[6]||0);});
  return Object.values(map).map(x=>({...x,antrian:Math.max(0,x.rusak-x.service)})).filter(x=>x.antrian>0);
}

function _periodWindow_(payload){
  payload=payload||{}; const mode=String(payload.periode||'global').toLowerCase(), now=new Date(); let start=null,end=new Date(now.getTime()+86400000);
  if(mode==='minggu'){start=new Date(now);const day=start.getDay(),diff=day===0?6:day-1;start.setDate(start.getDate()-diff);start.setHours(0,0,0,0);}
  else if(mode==='bulan') start=new Date(now.getFullYear(),now.getMonth(),1);
  else if(mode==='tahun') start=new Date(now.getFullYear(),0,1);
  else if(mode==='manual'){if(!payload.tanggalMulai||!payload.tanggalSelesai) throw new Error('Tanggal mulai dan selesai wajib diisi untuk periode manual.');start=new Date(payload.tanggalMulai+'T00:00:00');end=new Date(payload.tanggalSelesai+'T23:59:59');}
  return {mode,start,end};
}
function _readTrans_(ss){const sh=ss.getSheetByName(SHEET_TRANSAKSI);return sh&&sh.getLastRow()>=2?sh.getRange(2,1,sh.getLastRow()-1,13).getValues():[];}
function _availMove_(t,q){t=String(t);q=Number(q||0);if(['MASUK_SUPPLIER','MASUK_KEMBALI','MASUK_REKONDISI'].includes(t))return q;if(['KELUAR','KELUAR_SEWA'].includes(t))return -q;return 0;}
function _totalMove_(t,q){t=String(t);q=Number(q||0);if(['MASUK_SUPPLIER','MASUK_KEMBALI','MASUK_REKONDISI'].includes(t))return q;if(['KELUAR','KELUAR_SEWA','HILANG'].includes(t))return -q;return 0;}
function getLaporanMutasi(payload){
  payload=payload||{};const ss=getSpreadsheet_(),rows=_readTrans_(ss),win=_periodWindow_(payload),master=ss.getSheetByName(SHEET_MASTER_BARANG),mrows=master&&master.getLastRow()>=2?master.getRange(2,1,master.getLastRow()-1,13).getValues():[];
  const mm={};mrows.forEach(r=>mm[String(r[0]).toUpperCase()]={kategori:String(r[1]||''),jenis:String(r[2]||''),nama:String(r[3]||''),tersedia:Number(r[5]||0),total:Number(r[4]||0)});
  const cat=String(payload.kategori||'SEMUA'),jenis=String(payload.jenisBarang||'SEMUA'),jt=String(payload.jenisTransaksi||'SEMUA');
  const all=rows.map(r=>{const d=r[1]?new Date(r[1]):null,m=mm[String(r[3]).toUpperCase()]||{};return{id:String(r[0]),tanggal:d?d.toISOString():'',d,kode:String(r[3]),jenisTransaksi:String(r[2]),namaBarang:String(r[4]||m.nama||''),kategori:String(r[5]||m.kategori||''),jenisBarang:String(m.jenis||''),qtyPcs:Number(r[6]||0),satuan:String(r[7]||'Pcs'),noRef:String(r[8]||''),namaPihak:String(r[9]||''),catatan:String(r[10]||''),user:String(r[11]||'')};}).filter(x=>x.d);
  const base=all.filter(x=>(cat==='SEMUA'||x.kategori===cat)&&(jenis==='SEMUA'||x.jenisBarang===jenis));
  const periodBase=base.filter(x=>(!win.start||x.d>=win.start)&&x.d<=win.end), after=base.filter(x=>win.start&&x.d>win.end);
  const selected=periodBase.filter(x=>jt==='SEMUA'||x.jenisTransaksi===jt);
  const masters=mrows.filter(r=>(cat==='SEMUA'||String(r[1])===cat)&&(jenis==='SEMUA'||String(r[2])===jenis));
  const currentAvail=masters.reduce((a,r)=>a+Number(r[5]||0),0), currentTotal=masters.reduce((a,r)=>a+Number(r[4]||0),0);
  const endAvail=Math.max(0,currentAvail-after.reduce((a,x)=>a+_availMove_(x.jenisTransaksi,x.qtyPcs),0));
  const endTotal=Math.max(0,currentTotal-after.reduce((a,x)=>a+_totalMove_(x.jenisTransaksi,x.qtyPcs),0));
  const netAvail=periodBase.reduce((a,x)=>a+_availMove_(x.jenisTransaksi,x.qtyPcs),0),netTotal=periodBase.reduce((a,x)=>a+_totalMove_(x.jenisTransaksi,x.qtyPcs),0);
  const global={stokAwal:win.start?Math.max(0,endAvail-netAvail):endAvail,tersedia:endAvail,MASUK_SUPPLIER:0,MASUK_KEMBALI:0,MASUK_REKONDISI:0,KELUAR:0,RUSAK_REKONDISI:0,HILANG:0};
  const summaryMap={},dailyMap={};
  selected.forEach(x=>{global[x.jenisTransaksi]=(global[x.jenisTransaksi]||0)+x.qtyPcs;const key=x.kategori+'|'+x.jenisBarang;if(!summaryMap[key])summaryMap[key]={kategori:x.kategori,jenisBarang:x.jenisBarang,masukBeli:0,masukKembali:0,masukService:0,keluar:0,rusak:0,hilang:0};const s=summaryMap[key],day=x.tanggal.slice(0,10),dk=day+'|'+key;if(!dailyMap[dk])dailyMap[dk]={tanggal:day,kategori:x.kategori,jenisBarang:x.jenisBarang,masukBeli:0,masukKembali:0,masukService:0,keluar:0,rusak:0,hilang:0};const d=dailyMap[dk];if(x.jenisTransaksi==='MASUK_SUPPLIER'){s.masukBeli+=x.qtyPcs;d.masukBeli+=x.qtyPcs}if(x.jenisTransaksi==='MASUK_KEMBALI'){s.masukKembali+=x.qtyPcs;d.masukKembali+=x.qtyPcs}if(x.jenisTransaksi==='MASUK_REKONDISI'){s.masukService+=x.qtyPcs;d.masukService+=x.qtyPcs}if(x.jenisTransaksi==='KELUAR'||x.jenisTransaksi==='KELUAR_SEWA'){s.keluar+=x.qtyPcs;d.keluar+=x.qtyPcs}if(x.jenisTransaksi==='RUSAK_REKONDISI'){s.rusak+=x.qtyPcs;d.rusak+=x.qtyPcs}if(x.jenisTransaksi==='HILANG'){s.hilang+=x.qtyPcs;d.hilang+=x.qtyPcs}});
  return {success:true,data:selected.slice().reverse(),summary:Object.values(summaryMap),dailySummary:Object.values(dailyMap).sort((a,b)=>String(a.tanggal).localeCompare(String(b.tanggal))),global,totalAwal:win.start?Math.max(0,endTotal-netTotal):endTotal,totalAkhir:endTotal,periode:win.mode};
}
function getRekapStokAkhir(payload){
  payload=payload||{};const ss=getSpreadsheet_(),shM=ss.getSheetByName(SHEET_MASTER_BARANG),trans=_readTrans_(ss);if(!shM)return {success:true,rows:[],global:{}};
  const masters=shM.getLastRow()>=2?shM.getRange(2,1,shM.getLastRow()-1,13).getValues():[],win=_periodWindow_(payload),cat=String(payload.kategori||'SEMUA'),jenis=String(payload.jenisBarang||'SEMUA'),jt=String(payload.jenisTransaksi||'SEMUA'),by={};
  masters.forEach(r=>{const kode=String(r[0]);if(cat!=='SEMUA'&&String(r[1])!==cat)return;if(jenis!=='SEMUA'&&String(r[2])!==jenis)return;by[kode]={kode,nama:String(r[3]),jenis:String(r[2]),kategori:String(r[1]),currentTotal:Number(r[4]||0),currentAvail:Number(r[5]||0),hargaSatuan:Number(r[12]||0),stokAwal:0,masukBeli:0,masukKembali:0,masukService:0,keluar:0,rusak:0,hilang:0,tersedia:0,stokAkhir:0};});
  const relevant=trans.filter(r=>by[String(r[3])]);const periodAll=relevant.filter(r=>{const d=r[1]?new Date(r[1]):null;return d&&(!win.start||d>=win.start)&&d<=win.end});const period=periodAll.filter(r=>jt==='SEMUA'||String(r[2])===jt);const after=relevant.filter(r=>win.start&&r[1]&&new Date(r[1])>win.end);
  Object.values(by).forEach(x=>{const a=after.filter(r=>String(r[3])===x.kode);x.stokAkhir=Math.max(0,x.currentTotal-a.reduce((s,r)=>s+_totalMove_(r[2],r[6]),0));x.tersedia=Math.max(0,x.currentAvail-a.reduce((s,r)=>s+_availMove_(r[2],r[6]),0));const p=periodAll.filter(r=>String(r[3])===x.kode);x.stokAwal=Math.max(0,x.stokAkhir-p.reduce((s,r)=>s+_totalMove_(r[2],r[6]),0));});
  period.forEach(r=>{const x=by[String(r[3])],t=String(r[2]),q=Number(r[6]||0);if(t==='MASUK_SUPPLIER')x.masukBeli+=q;if(t==='MASUK_KEMBALI')x.masukKembali+=q;if(t==='MASUK_REKONDISI')x.masukService+=q;if(t==='KELUAR'||t==='KELUAR_SEWA')x.keluar+=q;if(t==='RUSAK_REKONDISI')x.rusak+=q;if(t==='HILANG')x.hilang+=q;});
  Object.values(by).forEach(x=>x.valuasi=x.tersedia*x.hargaSatuan);const rows=Object.values(by);return {success:true,rows,global:{sku:rows.length,stokAwal:rows.reduce((a,x)=>a+x.stokAwal,0),masuk:rows.reduce((a,x)=>a+x.masukBeli+x.masukKembali+x.masukService,0),keluar:rows.reduce((a,x)=>a+x.keluar,0),tersedia:rows.reduce((a,x)=>a+x.tersedia,0),valuasi:rows.reduce((a,x)=>a+x.valuasi,0)},periode:win.mode};
}

function tambahStokSupplier(payload) {
  payload = payload || {};
  if (!String(payload.kode || '').trim()) throw new Error('Kode/nama barang wajib dipilih.');
  if (Number(payload.qty || 0) <= 0) throw new Error('Jumlah tambahan wajib lebih dari 0.');
  if (!String(payload.tanggalPembelian || '').trim()) throw new Error('Tanggal pembelian wajib diisi.');
  if (!String(payload.supplier || '').trim()) throw new Error('Supplier wajib dipilih.');
  if (!String(payload.noFaktur || '').trim()) throw new Error('No. Faktur wajib diisi.');
  const ss = getSpreadsheet_();
  const shMaster = ss.getSheetByName(SHEET_MASTER_BARANG);
  const shTrans = ss.getSheetByName(SHEET_TRANSAKSI);

  const values = shMaster.getRange(2, 1, shMaster.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(payload.kode).toUpperCase()) {
      const row = i + 2;
      const curTotal = Number(shMaster.getRange(row, 5).getValue() || 0);
      const curTersedia = Number(shMaster.getRange(row, 6).getValue() || 0);
      const qtyTambah = Number(payload.qty || 0);
      if (qtyTambah <= 0) return { success: false, message: 'Jumlah tambahan harus lebih dari 0.' };
      shMaster.getRange(row, 5).setValue(curTotal + qtyTambah);
      shMaster.getRange(row, 6).setValue(curTersedia + qtyTambah);
      shMaster.getRange(row, 12).setValue(new Date());

      const nama = shMaster.getRange(row, 4).getValue();
      const kat = shMaster.getRange(row, 2).getValue();
      const sat = shMaster.getRange(row, 8).getValue();

      shTrans.appendRow([
        'TRX-' + Date.now(),
        payload.tanggalPembelian ? new Date(payload.tanggalPembelian + 'T00:00:00') : new Date(),
        'MASUK_SUPPLIER',
        payload.kode,
        nama,
        kat,
        qtyTambah,
        sat,
        payload.noFaktur || '',
        payload.supplier || 'Supplier',
        payload.catatan || '',
        payload.user || 'ADMIN',
        new Date()
      ]);

      return { success: true, message: 'Stok ' + nama + ' berhasil ditambah +' + payload.qty };
    }
  }
  return { success: false, message: 'Barang tidak ditemukan.' };
}

function getRiwayatTransaksi(filterJenis) {
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEET_TRANSAKSI);
  if (!sh || sh.getLastRow() < 2) return [];

  const values = sh.getRange(2, 1, sh.getLastRow() - 1, 12).getValues();
  const result = [];
  for (let i = values.length - 1; i >= 0; i--) {
    const r = values[i];
    if (!filterJenis || filterJenis === 'SEMUA' || String(r[2]) === String(filterJenis)) {
      result.push({
        id: String(r[0]),
        tanggal: r[1] ? new Date(r[1]).toISOString() : '',
        jenis: String(r[2]),
        kode: String(r[3]),
        namaBarang: String(r[4]),
        kategori: String(r[5]),
        qty: Number(r[6] || 0),
        satuan: String(r[7]),
        noRef: String(r[8] || ''),
        namaPihak: String(r[9] || ''),
        catatan: String(r[10] || ''),
        user: String(r[11] || '')
      });
    }
  }
  return result;
}

function getDashboardData() {
  const pohon = getKatalogPohon();
  const barang = getDatabaseBarang();
  let totalStokFisik = 0;
  let totalStokTersedia = 0;
  let totalStokDisewa = 0;

  barang.forEach(b => {
    totalStokFisik += b.stokTotal;
    totalStokTersedia += b.stokTersedia;
    totalStokDisewa += b.stokDisewa;
  });

  return {
    totalPohonKatalog: pohon.length,
    totalJenisBarang: barang.length,
    totalStokFisik: totalStokFisik,
    totalStokTersedia: totalStokTersedia,
    totalStokDisewa: totalStokDisewa
  };
}

// =========================================================================
// JEMBATAN / ALIAS UPLOAD FILE KE GOOGLE DRIVE
// =========================================================================
function uploadFileKeFolderBarang(base64Data, fileName, mimeType) {
  var res = uploadGambarBarang(base64Data, fileName, mimeType);
  if (!res.success) throw new Error(res.message);
  return res.url;
}

function uploadFileKeFolderPohon(base64Data, fileName, mimeType) {
  var res = uploadGambarPohon(base64Data, fileName, mimeType);
  if (!res.success) throw new Error(res.message);
  return res.url;
}