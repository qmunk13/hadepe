import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { GOOGLE_WORKSPACE_CONFIG } from '../types';
import { AppDataService } from '../services/api';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced?: () => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  onDataSynced
}) => {
  if (!isOpen) return null;

  const [gasUrl, setGasUrl] = useState(AppDataService.getGasUrl());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'code' | 'guide'>('status');

  const handleSaveGasUrl = (e: React.FormEvent) => {
    e.preventDefault();
    AppDataService.setGasUrl(gasUrl);
    setSaveMessage('URL Web App Google Apps Script berhasil disimpan!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App terlebih dahulu sebelum menguji koneksi.'
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await AppDataService.testGasConnection(gasUrl);
      setTestResult(res);
      if (res.success) {
        AppDataService.setGasUrl(gasUrl);
      }
    } finally {
      setTesting(false);
    }
  };

  const handlePullData = async () => {
    if (!gasUrl.trim()) {
      setPullResult({
        success: false,
        message: 'Pasang URL Web App terlebih dahulu untuk menarik data.'
      });
      return;
    }
    setPulling(true);
    setPullResult(null);
    try {
      const res = await AppDataService.pullFromGoogleSheets();
      setPullResult(res);
      if (res.success && onDataSynced) {
        onDataSynced();
      }
    } finally {
      setPulling(false);
    }
  };

  const handlePushData = async () => {
    if (!gasUrl.trim()) {
      setPushResult({
        success: false,
        message: 'Pasang URL Web App terlebih dahulu untuk mengirim semua data.'
      });
      return;
    }
    setPushing(true);
    setPushResult(null);
    try {
      const res = await AppDataService.pushAllToGoogleSheets();
      setPushResult(res);
      if (res.success && onDataSynced) {
        onDataSynced();
      }
    } finally {
      setPushing(false);
    }
  };

  const gasScriptCode = `/**
 * =========================================================================
 * HASAN DEKOR POHON - SISTEM MANAJEMEN STOK & PENYEWAAN DEKORASI
 * Backend Google Apps Script (Code.gs) v5.2
 * Terkoneksi otomatis ke Google Spreadsheet & Google Drive Hasan Dekor
 * Spreadsheet ID: ${GOOGLE_WORKSPACE_CONFIG.spreadsheetId}
 * =========================================================================
 */

const SPREADSHEET_ID   = '${GOOGLE_WORKSPACE_CONFIG.spreadsheetId}';
const FOLDER_ID_POHON  = '${GOOGLE_WORKSPACE_CONFIG.folderPohonId}';
const FOLDER_ID_BARANG = '${GOOGLE_WORKSPACE_CONFIG.folderBarangId}';

function getSpreadsheet_() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "ping";
  var ss = getSpreadsheet_();
  
  if (action === "ping") {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      status: "Connected",
      title: ss.getName(),
      spreadsheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Hasan Dekor API Ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const payload = postData.payload || {};

    let result = { success: false, message: 'Aksi tidak dikenal' };

    switch (action) {
      case 'getKonfigurasi':
        result = { success: true, data: { spreadsheetId: SPREADSHEET_ID, waktu: new Date().toISOString() } };
        break;

      // 1. KATALOG POHON
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

      // 2. DATABASE BARANG NON-POHON
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
      case 'tambahStokSupplier':
        result = tambahStokSupplier(payload);
        break;

      // 3. PENYEWAAN & PENGEMBALIAN
      case 'prosesSewaBarang':
        result = prosesSewaBarang(payload);
        break;
      case 'prosesPengembalianSewa':
        result = prosesPengembalianSewa(payload);
        break;

      // 4. MASTER DATA, PELANGGAN & SUPPLIER
      case 'getMasterData':
        result = { success: true, data: getMasterData(payload.tipe) };
        break;
      case 'tambahMasterData':
        result = tambahMasterData(payload);
        break;
      case 'getPelanggan':
        result = { success: true, data: getPelanggan() };
        break;
      case 'tambahPelanggan':
        result = tambahPelanggan(payload);
        break;
      case 'getSupplier':
        result = { success: true, data: getSupplier() };
        break;
      case 'tambahSupplier':
        result = tambahSupplier(payload);
        break;

      // 5. MANAJEMEN USER / PENGGUNA (NAMA LENGKAP & PROFIL)
      case 'getUsers':
        result = { success: true, data: getUsers() };
        break;
      case 'tambahUser':
        result = tambahUser(payload);
        break;
      case 'updateUser':
        result = updateUser(payload);
        break;
      case 'hapusUser':
        result = hapusUser(payload.username);
        break;

      // 6. PENGATURAN KONTAK & WHATSAPP
      case 'getPengaturanKontak':
        result = { success: true, data: getPengaturanKontak() };
        break;
      case 'updatePengaturanKontak':
        result = updatePengaturanKontak(payload);
        break;

      // 7. UPLOAD GAMBAR KE GOOGLE DRIVE
      case 'uploadGambarPohon':
        result = uploadGambarKeDrive(payload, FOLDER_ID_POHON, 'PHN_FOTO_');
        break;
      case 'uploadGambarBarang':
        result = uploadGambarKeDrive(payload, FOLDER_ID_BARANG, 'BRG_FOTO_');
        break;

      // 8. SYNC SEMUA DATA (BULK PUSH DARI WEB KE GOOGLE SPREADSHEET)
      case 'pushSemuaData':
        result = pushSemuaData(payload);
        break;

      default:
        result = { success: false, message: 'Action ' + action + ' tidak didukung.' };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message || String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch(e){}
  }
}

// =========================================================================
// HELPER CRUD KATALOG POHON
// =========================================================================
function getKatalogPohon() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "KATALOG_POHON", [
    "KODE", "NAMA_POHON", "KATEGORI", "TINGGI", "FOTO_URL", "STOK_TOTAL", 
    "STOK_TERSEDIA", "STOK_DISEWA", "STATUS", "KETERANGAN", "LAST_UPDATED"
  ]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var result = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    result.push({
      kode: String(r[0]),
      nama: String(r[1] || ''),
      kategori: String(r[2] || 'Pohon Sedang'),
      tinggi: String(r[3] || '2.0 Meter'),
      fotoUrl: String(r[4] || ''),
      stokTotal: Number(r[5] || 0),
      stokTersedia: Number(r[6] || 0),
      stokDisewa: Number(r[7] || 0),
      statusKetersediaan: String(r[8] || 'Tersedia'),
      keterangan: String(r[9] || ''),
      updatedAt: String(r[10] || new Date().toISOString())
    });
  }
  return result;
}

function tambahPohonKatalog(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "KATALOG_POHON", [
    "KODE", "NAMA_POHON", "KATEGORI", "TINGGI", "FOTO_URL", "STOK_TOTAL", 
    "STOK_TERSEDIA", "STOK_DISEWA", "STATUS", "KETERANGAN", "LAST_UPDATED"
  ]);

  var kode = String(payload.kode || '').trim().toUpperCase();
  if (!kode) return { success: false, message: 'Kode pohon wajib diisi.' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === kode) {
      return { success: false, message: 'Kode pohon ' + kode + ' sudah ada di spreadsheet.' };
    }
  }

  var row = [
    kode,
    payload.nama || '',
    payload.kategori || 'Pohon Sedang',
    payload.tinggi || '2.0 Meter',
    payload.fotoUrl || '',
    Number(payload.stokTotal || 0),
    Number(payload.stokTersedia || 0),
    Number(payload.stokDisewa || 0),
    payload.statusKetersediaan || 'Tersedia',
    payload.keterangan || '',
    new Date().toISOString()
  ];
  sheet.appendRow(row);
  return { success: true, message: 'Pohon ' + payload.nama + ' (' + kode + ') berhasil disimpan di Google Spreadsheet.' };
}

function updatePohonKatalog(kode, payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "KATALOG_POHON");
  var data = sheet.getDataRange().getValues();
  var targetKode = String(kode).toUpperCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === targetKode) {
      var rowNum = i + 1;
      if (payload.nama !== undefined) sheet.getRange(rowNum, 2).setValue(payload.nama);
      if (payload.kategori !== undefined) sheet.getRange(rowNum, 3).setValue(payload.kategori);
      if (payload.tinggi !== undefined) sheet.getRange(rowNum, 4).setValue(payload.tinggi);
      if (payload.fotoUrl !== undefined) sheet.getRange(rowNum, 5).setValue(payload.fotoUrl);
      if (payload.stokTotal !== undefined) sheet.getRange(rowNum, 6).setValue(Number(payload.stokTotal));
      if (payload.stokTersedia !== undefined) sheet.getRange(rowNum, 7).setValue(Number(payload.stokTersedia));
      if (payload.stokDisewa !== undefined) sheet.getRange(rowNum, 8).setValue(Number(payload.stokDisewa));
      if (payload.statusKetersediaan !== undefined) sheet.getRange(rowNum, 9).setValue(payload.statusKetersediaan);
      if (payload.keterangan !== undefined) sheet.getRange(rowNum, 10).setValue(payload.keterangan);
      sheet.getRange(rowNum, 11).setValue(new Date().toISOString());
      return { success: true, message: 'Pohon ' + targetKode + ' berhasil diupdate di spreadsheet.' };
    }
  }
  return { success: false, message: 'Pohon ' + targetKode + ' tidak ditemukan di spreadsheet.' };
}

function hapusPohonKatalog(kode) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "KATALOG_POHON");
  var data = sheet.getDataRange().getValues();
  var targetKode = String(kode).toUpperCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === targetKode) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Pohon ' + targetKode + ' berhasil dihapus dari spreadsheet.' };
    }
  }
  return { success: false, message: 'Pohon ' + targetKode + ' tidak ditemukan di spreadsheet.' };
}

// =========================================================================
// HELPER CRUD DATABASE BARANG NON-POHON
// =========================================================================
function getDatabaseBarang() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "DATABASE_BARANG", [
    "KODE", "KATEGORI", "JENIS", "NAMA_BARANG", "STOK_TOTAL", "STOK_TERSEDIA", 
    "STOK_DISEWA", "SATUAN", "FOTO_URL", "LOKASI_RAK", "KETERANGAN", "LAST_UPDATED"
  ]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var result = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    result.push({
      kode: String(r[0]),
      kategori: String(r[1] || 'Bunga'),
      jenis: String(r[2] || ''),
      nama: String(r[3] || ''),
      stokTotal: Number(r[4] || 0),
      stokTersedia: Number(r[5] || 0),
      stokDisewa: Number(r[6] || 0),
      satuan: String(r[7] || 'Tangkai'),
      fotoUrl: String(r[8] || ''),
      lokasiRak: String(r[9] || ''),
      keterangan: String(r[10] || ''),
      updatedAt: String(r[11] || new Date().toISOString())
    });
  }
  return result;
}

function tambahBarangMaster(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "DATABASE_BARANG", [
    "KODE", "KATEGORI", "JENIS", "NAMA_BARANG", "STOK_TOTAL", "STOK_TERSEDIA", 
    "STOK_DISEWA", "SATUAN", "FOTO_URL", "LOKASI_RAK", "KETERANGAN", "LAST_UPDATED"
  ]);

  var kode = String(payload.kode || '').trim().toUpperCase();
  if (!kode) return { success: false, message: 'Kode barang wajib diisi.' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === kode) {
      return { success: false, message: 'Kode barang ' + kode + ' sudah ada di spreadsheet.' };
    }
  }

  var stok = Number(payload.stokTotal || payload.stokTersedia || 0);
  var row = [
    kode,
    payload.kategori || 'Bunga',
    payload.jenis || '',
    payload.nama || '',
    stok,
    stok,
    0,
    payload.satuan || 'Tangkai',
    payload.fotoUrl || '',
    payload.lokasiRak || '',
    payload.keterangan || '',
    new Date().toISOString()
  ];
  sheet.appendRow(row);
  return { success: true, message: 'Barang ' + payload.nama + ' (' + kode + ') berhasil disimpan di Google Spreadsheet.' };
}

function updateBarangMaster(kode, payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "DATABASE_BARANG");
  var data = sheet.getDataRange().getValues();
  var targetKode = String(kode).toUpperCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === targetKode) {
      var rowNum = i + 1;
      if (payload.kategori !== undefined) sheet.getRange(rowNum, 2).setValue(payload.kategori);
      if (payload.jenis !== undefined) sheet.getRange(rowNum, 3).setValue(payload.jenis);
      if (payload.nama !== undefined) sheet.getRange(rowNum, 4).setValue(payload.nama);
      if (payload.stokTotal !== undefined) sheet.getRange(rowNum, 5).setValue(Number(payload.stokTotal));
      if (payload.stokTersedia !== undefined) sheet.getRange(rowNum, 6).setValue(Number(payload.stokTersedia));
      if (payload.stokDisewa !== undefined) sheet.getRange(rowNum, 7).setValue(Number(payload.stokDisewa));
      if (payload.satuan !== undefined) sheet.getRange(rowNum, 8).setValue(payload.satuan);
      if (payload.fotoUrl !== undefined) sheet.getRange(rowNum, 9).setValue(payload.fotoUrl);
      if (payload.lokasiRak !== undefined) sheet.getRange(rowNum, 10).setValue(payload.lokasiRak);
      if (payload.keterangan !== undefined) sheet.getRange(rowNum, 11).setValue(payload.keterangan);
      sheet.getRange(rowNum, 12).setValue(new Date().toISOString());
      return { success: true, message: 'Barang ' + targetKode + ' berhasil diupdate di spreadsheet.' };
    }
  }
  return { success: false, message: 'Barang ' + targetKode + ' tidak ditemukan di spreadsheet.' };
}

function hapusBarangMaster(kode) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "DATABASE_BARANG");
  var data = sheet.getDataRange().getValues();
  var targetKode = String(kode).toUpperCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === targetKode) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Barang ' + targetKode + ' berhasil dihapus dari spreadsheet.' };
    }
  }
  return { success: false, message: 'Barang ' + targetKode + ' tidak ditemukan di spreadsheet.' };
}

function tambahStokSupplier(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "DATABASE_BARANG");
  var data = sheet.getDataRange().getValues();
  var targetKode = String(payload.kode).toUpperCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === targetKode) {
      var rowNum = i + 1;
      var curTotal = Number(data[i][4] || 0);
      var curTersedia = Number(data[i][5] || 0);
      var addQty = Number(payload.qty || 0);
      sheet.getRange(rowNum, 5).setValue(curTotal + addQty);
      sheet.getRange(rowNum, 6).setValue(curTersedia + addQty);
      sheet.getRange(rowNum, 12).setValue(new Date().toISOString());

      // Catat mutasi
      var sheetTrx = getOrCreateSheet_(ss, "MUTASI_TRANSAKSI", [
        "ID_TRANSAKSI", "TANGGAL", "JENIS_MUTASI", "KODE", "NAMA_BARANG", "KATEGORI", "QTY", "SATUAN", "NO_REF", "NAMA_PIHAK", "CATATAN", "USER"
      ]);
      sheetTrx.appendRow([
        "TRX-" + Date.now(),
        new Date().toISOString(),
        "MASUK_SUPPLIER",
        targetKode,
        String(data[i][3] || ''),
        String(data[i][1] || ''),
        addQty,
        String(data[i][7] || 'Unit'),
        payload.noFaktur || 'FAK-SUP',
        payload.supplier || 'Supplier',
        payload.catatan || '',
        payload.user || 'ADMIN'
      ]);

      return { success: true, message: 'Stok ' + targetKode + ' berhasil ditambah +' + addQty + ' di spreadsheet.' };
    }
  }
  return { success: false, message: 'Barang ' + targetKode + ' tidak ditemukan.' };
}

// =========================================================================
// HELPER PENYEWAAN & MUTASI
// =========================================================================
function prosesSewaBarang(payload) {
  var ss = getSpreadsheet_();
  var sheetSewa = getOrCreateSheet_(ss, "PENYEWAAN", [
    "NO_SEWA", "TGL_SEWA", "TGL_KEMBALI", "NAMA_PELANGGAN", "NO_TELEPON", "ALAMAT", 
    "TOTAL_ITEM", "TOTAL_QTY", "STATUS", "USER", "CATATAN", "ITEMS_JSON", "LAST_UPDATED"
  ]);

  var row = [
    payload.noSewa,
    payload.tglSewa,
    payload.tglKembali,
    payload.namaPelanggan,
    payload.noTelepon,
    payload.alamat,
    payload.totalItem,
    payload.totalQty,
    payload.status || 'AKTIF',
    payload.user,
    payload.catatan || '',
    JSON.stringify(payload.items || []),
    new Date().toISOString()
  ];
  sheetSewa.appendRow(row);

  // Catat setiap mutasi keluar sewa
  var sheetTrx = getOrCreateSheet_(ss, "MUTASI_TRANSAKSI", [
    "ID_TRANSAKSI", "TANGGAL", "JENIS_MUTASI", "KODE", "NAMA_BARANG", "KATEGORI", "QTY", "SATUAN", "NO_REF", "NAMA_PIHAK", "CATATAN", "USER"
  ]);
  
  if (Array.isArray(payload.items)) {
    payload.items.forEach(function(it) {
      sheetTrx.appendRow([
        "TRX-" + Date.now() + "-" + it.kode,
        new Date().toISOString(),
        "KELUAR_SEWA",
        it.kode,
        it.namaBarang,
        it.kategori || '',
        it.qtySewa,
        it.satuan || 'Unit',
        payload.noSewa,
        payload.namaPelanggan,
        it.catatan || 'Sewa keluar',
        payload.user
      ]);
    });
  }

  return { success: true, message: 'Penyewaan ' + payload.noSewa + ' berhasil dicatat di Spreadsheet!' };
}

function prosesPengembalianSewa(payload) {
  var ss = getSpreadsheet_();
  var sheetSewa = getOrCreateSheet_(ss, "PENYEWAAN");
  var data = sheetSewa.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === payload.noSewa) {
      sheetSewa.getRange(i + 1, 9).setValue('SELESAI');
      sheetSewa.getRange(i + 1, 13).setValue(new Date().toISOString());
      return { success: true, message: 'Pengembalian sewa ' + payload.noSewa + ' berhasil dicatat.' };
    }
  }
  return { success: false, message: 'Penyewaan tidak ditemukan di spreadsheet.' };
}

// =========================================================================
// HELPER MASTER DATA, PELANGGAN & SUPPLIER
// =========================================================================
function getMasterData(filterTipe) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "MASTER_DATA", ["ID", "TIPE", "NILAI", "KETERANGAN", "LAST_UPDATED"]);
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    if (filterTipe && r[1] !== filterTipe) continue;
    result.push({
      id: String(r[0]),
      tipe: String(r[1]),
      nilai: String(r[2]),
      keterangan: String(r[3] || ''),
      updatedAt: String(r[4] || '')
    });
  }
  return result;
}

function tambahMasterData(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "MASTER_DATA", ["ID", "TIPE", "NILAI", "KETERANGAN", "LAST_UPDATED"]);
  var id = payload.id || ("MD-" + Date.now());
  sheet.appendRow([id, payload.tipe, payload.nilai, payload.keterangan || '', new Date().toISOString()]);
  return { success: true, message: 'Master data ' + payload.nilai + ' berhasil disimpan.' };
}

function getPelanggan() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "PELANGGAN", ["ID", "NAMA", "NO_TELEPON", "EMAIL", "ALAMAT", "KATEGORI", "TOTAL_SEWA", "CATATAN", "LAST_UPDATED"]);
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    result.push({
      id: String(r[0]),
      nama: String(r[1]),
      noTelepon: String(r[2]),
      email: String(r[3] || ''),
      alamat: String(r[4] || ''),
      kategori: String(r[5] || 'Wedding Organizer'),
      totalSewa: Number(r[6] || 0),
      catatan: String(r[7] || ''),
      updatedAt: String(r[8] || '')
    });
  }
  return result;
}

function tambahPelanggan(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "PELANGGAN", ["ID", "NAMA", "NO_TELEPON", "EMAIL", "ALAMAT", "KATEGORI", "TOTAL_SEWA", "CATATAN", "LAST_UPDATED"]);
  var id = payload.id || ("CUST-" + Date.now().toString().slice(-5));
  sheet.appendRow([id, payload.nama, payload.noTelepon, payload.email || '', payload.alamat || '', payload.kategori || 'Wedding Organizer', 0, payload.catatan || '', new Date().toISOString()]);
  return { success: true, message: 'Pelanggan ' + payload.nama + ' berhasil disimpan di spreadsheet.' };
}

function getSupplier() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "SUPPLIER", ["ID", "NAMA", "KONTAK_PERSON", "NO_TELEPON", "EMAIL", "KATEGORI_BARANG", "ALAMAT", "CATATAN", "LAST_UPDATED"]);
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;
    result.push({
      id: String(r[0]),
      nama: String(r[1]),
      kontakPerson: String(r[2] || ''),
      noTelepon: String(r[3]),
      email: String(r[4] || ''),
      kategoriBarang: String(r[5] || 'Bunga Artifisial'),
      alamat: String(r[6] || ''),
      catatan: String(r[7] || ''),
      updatedAt: String(r[8] || '')
    });
  }
  return result;
}

function tambahSupplier(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "SUPPLIER", ["ID", "NAMA", "KONTAK_PERSON", "NO_TELEPON", "EMAIL", "KATEGORI_BARANG", "ALAMAT", "CATATAN", "LAST_UPDATED"]);
  var id = payload.id || ("SUP-" + Date.now().toString().slice(-5));
  sheet.appendRow([id, payload.nama, payload.kontakPerson || '', payload.noTelepon, payload.email || '', payload.kategoriBarang || 'Bunga Artifisial', payload.alamat || '', payload.catatan || '', new Date().toISOString()]);
  return { success: true, message: 'Supplier ' + payload.nama + ' berhasil disimpan di spreadsheet.' };
}

// =========================================================================
// HELPER MANAJEMEN USER / PENGGUNA (SINKRON NAMA LENGKAP & ROLE)
// =========================================================================
function getUsers() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "USERS", [
    "ID", "USERNAME", "NAMA_LENGKAP", "ROLE", "NO_TELEPON", "STATUS", "LAST_UPDATED"
  ]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    // Inisialisasi default user admin jika sheet baru dibuat
    var initRows = [
      ["USR-0001", "admin", "Administrator Hasan Dekor", "ADMIN", "08119500890", "AKTIF", new Date().toISOString()],
      ["USR-0002", "kasir", "Staff Kasir Hasan Dekor", "KASIR", "08123456789", "AKTIF", new Date().toISOString()],
      ["USR-0003", "gudang", "Koordinator Gudang & Aset", "GUDANG", "08198765432", "AKTIF", new Date().toISOString()]
    ];
    for (var k = 0; k < initRows.length; k++) {
      sheet.appendRow(initRows[k]);
    }
    data = sheet.getDataRange().getValues();
  }

  var result = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[1]) continue;
    result.push({
      id: String(r[0] || 'USR-' + i),
      username: String(r[1]).trim().toLowerCase(),
      namaLengkap: String(r[2] || 'Pengguna Hasan Dekor'),
      role: String(r[3] || 'STAFF').toUpperCase(),
      noTelepon: String(r[4] || ''),
      status: String(r[5] || 'AKTIF').toUpperCase(),
      updatedAt: String(r[6] || new Date().toISOString())
    });
  }
  return result;
}

function tambahUser(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "USERS", [
    "ID", "USERNAME", "NAMA_LENGKAP", "ROLE", "NO_TELEPON", "STATUS", "LAST_UPDATED"
  ]);
  var username = String(payload.username || '').trim().toLowerCase();
  var namaLengkap = String(payload.namaLengkap || '').trim();
  if (!username || !namaLengkap) {
    return { success: false, message: 'Username dan Nama Lengkap wajib diisi.' };
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === username) {
      return { success: false, message: 'Username ' + username + ' sudah terdaftar di Spreadsheet.' };
    }
  }

  var id = payload.id || ("USR-" + Date.now().toString().slice(-4));
  var row = [
    id,
    username,
    namaLengkap,
    String(payload.role || 'STAFF').toUpperCase(),
    String(payload.noTelepon || ''),
    String(payload.status || 'AKTIF').toUpperCase(),
    new Date().toISOString()
  ];
  sheet.appendRow(row);
  return { success: true, message: 'Akun ' + username + ' (' + namaLengkap + ') berhasil disimpan ke Spreadsheet.' };
}

function updateUser(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "USERS", [
    "ID", "USERNAME", "NAMA_LENGKAP", "ROLE", "NO_TELEPON", "STATUS", "LAST_UPDATED"
  ]);
  var username = String(payload.username || '').trim().toLowerCase();
  if (!username) return { success: false, message: 'Username tidak valid.' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === username) {
      var rowNum = i + 1;
      if (payload.namaLengkap) sheet.getRange(rowNum, 3).setValue(String(payload.namaLengkap).trim());
      if (payload.role) sheet.getRange(rowNum, 4).setValue(String(payload.role).toUpperCase());
      if (payload.noTelepon !== undefined) sheet.getRange(rowNum, 5).setValue(String(payload.noTelepon));
      if (payload.status) sheet.getRange(rowNum, 6).setValue(String(payload.status).toUpperCase());
      sheet.getRange(rowNum, 7).setValue(new Date().toISOString());

      return { 
        success: true, 
        message: 'Nama lengkap & profil ' + username + ' berhasil disinkronkan ke Spreadsheet!' 
      };
    }
  }
  return tambahUser(payload);
}

function hapusUser(username) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "USERS");
  var uTarget = String(username || '').trim().toLowerCase();
  if (uTarget === 'admin') return { success: false, message: 'Akun admin utama tidak boleh dihapus.' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === uTarget) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'User ' + username + ' berhasil dihapus dari Spreadsheet.' };
    }
  }
  return { success: false, message: 'User tidak ditemukan di spreadsheet.' };
}

// =========================================================================
// HELPER PENGATURAN KONTAK & WHATSAPP (SHEET: PENGATURAN_KONTAK)
// =========================================================================
function getPengaturanKontak() {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "PENGATURAN_KONTAK", [
    "WHATSAPP_NUMBER", "DISPLAY_PHONE", "NAMA_TOKO", "TAGLINE", "EMAIL", "ALAMAT_WORKSHOP", "JAM_OPERASIONAL", "LAST_UPDATED"
  ]);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    var defaultRow = [
      "628119500890",
      "+62 811-9500-890",
      "Hasan Dekor Pohon Artifisial",
      "Koleksi Pohon Dekorasi Panggung & Pelaminan Terlengkap",
      "kontak@hasandekorasi.com",
      "Jl. Melati Indah No. 88, Cibubur, Jakarta Timur",
      "Senin - Minggu: 08.00 - 20.00 WIB",
      new Date().toISOString()
    ];
    sheet.appendRow(defaultRow);
    return {
      whatsappNumber: defaultRow[0],
      displayPhone: defaultRow[1],
      storeName: defaultRow[2],
      tagline: defaultRow[3],
      email: defaultRow[4],
      workshopAddress: defaultRow[5],
      openingHours: defaultRow[6]
    };
  }
  var row = sheet.getRange(2, 1, 1, 8).getValues()[0];
  return {
    whatsappNumber: String(row[0] || '628119500890'),
    displayPhone: String(row[1] || '+62 811-9500-890'),
    storeName: String(row[2] || 'Hasan Dekor'),
    tagline: String(row[3] || ''),
    email: String(row[4] || ''),
    workshopAddress: String(row[5] || ''),
    openingHours: String(row[6] || '')
  };
}

function updatePengaturanKontak(payload) {
  var ss = getSpreadsheet_();
  var sheet = getOrCreateSheet_(ss, "PENGATURAN_KONTAK", [
    "WHATSAPP_NUMBER", "DISPLAY_PHONE", "NAMA_TOKO", "TAGLINE", "EMAIL", "ALAMAT_WORKSHOP", "JAM_OPERASIONAL", "LAST_UPDATED"
  ]);
  var lastRow = sheet.getLastRow();
  var values = [
    String(payload.whatsappNumber || ''),
    String(payload.displayPhone || ''),
    String(payload.storeName || 'Hasan Dekor'),
    String(payload.tagline || ''),
    String(payload.email || ''),
    String(payload.workshopAddress || ''),
    String(payload.openingHours || ''),
    new Date().toISOString()
  ];
  if (lastRow >= 2) {
    sheet.getRange(2, 1, 1, 8).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
  return { 
    success: true, 
    message: 'Pengaturan kontak & nomor WhatsApp (' + (payload.whatsappNumber || '') + ') berhasil disimpan di Google Spreadsheet!',
    data: payload 
  };
}

// =========================================================================
// HELPER UPLOAD GAMBAR KE GOOGLE DRIVE
// =========================================================================
function uploadGambarKeDrive(payload, targetFolderId, prefix) {
  try {
    var folder = DriveApp.getFolderById(targetFolderId);
    var base64Data = payload.base64;
    if (base64Data.indexOf(';base64,') > -1) {
      base64Data = base64Data.split(';base64,')[1];
    }
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, payload.mimeType || 'image/jpeg', prefix + Date.now() + '_' + (payload.fileName || 'foto.jpg'));
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Direct viewable URL
    var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
    return { success: true, url: directUrl, fileId: file.getId(), message: 'Foto berhasil disimpan di Google Drive!' };
  } catch (e) {
    return { success: false, message: 'Upload Drive error: ' + e.message };
  }
}

// =========================================================================
// HELPER PUSH SEMUA DATA KE SPREADSHEET (BULK SYNC DARI WEB KE GOOGLE SHEETS)
// =========================================================================
function pushSemuaData(payload) {
  var ss = getSpreadsheet_();

  // 1. Simpan Pohon
  if (Array.isArray(payload.pohonList) && payload.pohonList.length > 0) {
    var sheetPohon = getOrCreateSheet_(ss, "KATALOG_POHON", [
      "KODE", "NAMA_POHON", "KATEGORI", "TINGGI", "FOTO_URL", "STOK_TOTAL", 
      "STOK_TERSEDIA", "STOK_DISEWA", "STATUS", "KETERANGAN", "LAST_UPDATED"
    ]);
    sheetPohon.clearContents();
    sheetPohon.appendRow([
      "KODE", "NAMA_POHON", "KATEGORI", "TINGGI", "FOTO_URL", "STOK_TOTAL", 
      "STOK_TERSEDIA", "STOK_DISEWA", "STATUS", "KETERANGAN", "LAST_UPDATED"
    ]);
    sheetPohon.getRange(1, 1, 1, 11).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');
    
    var rowsPohon = payload.pohonList.map(function(p) {
      return [
        p.kode, p.nama, p.kategori, p.tinggi, p.fotoUrl || '', 
        Number(p.stokTotal || 0), Number(p.stokTersedia || 0), Number(p.stokDisewa || 0), 
        p.statusKetersediaan || 'Tersedia', p.keterangan || '', p.updatedAt || new Date().toISOString()
      ];
    });
    sheetPohon.getRange(2, 1, rowsPohon.length, 11).setValues(rowsPohon);
  }

  // 2. Simpan Barang
  if (Array.isArray(payload.barangList) && payload.barangList.length > 0) {
    var sheetBarang = getOrCreateSheet_(ss, "DATABASE_BARANG", [
      "KODE", "KATEGORI", "JENIS", "NAMA_BARANG", "STOK_TOTAL", "STOK_TERSEDIA", 
      "STOK_DISEWA", "SATUAN", "FOTO_URL", "LOKASI_RAK", "KETERANGAN", "LAST_UPDATED"
    ]);
    sheetBarang.clearContents();
    sheetBarang.appendRow([
      "KODE", "KATEGORI", "JENIS", "NAMA_BARANG", "STOK_TOTAL", "STOK_TERSEDIA", 
      "STOK_DISEWA", "SATUAN", "FOTO_URL", "LOKASI_RAK", "KETERANGAN", "LAST_UPDATED"
    ]);
    sheetBarang.getRange(1, 1, 1, 12).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');

    var rowsBarang = payload.barangList.map(function(b) {
      return [
        b.kode, b.kategori, b.jenis, b.nama, 
        Number(b.stokTotal || 0), Number(b.stokTersedia || 0), Number(b.stokDisewa || 0), 
        b.satuan, b.fotoUrl || '', b.lokasiRak || '', b.keterangan || '', b.updatedAt || new Date().toISOString()
      ];
    });
    sheetBarang.getRange(2, 1, rowsBarang.length, 12).setValues(rowsBarang);
  }

  // 3. Simpan Users / Pengguna (Sinkron Nama Lengkap & Akun)
  if (Array.isArray(payload.usersList) && payload.usersList.length > 0) {
    var sheetUsers = getOrCreateSheet_(ss, "USERS", [
      "ID", "USERNAME", "NAMA_LENGKAP", "ROLE", "NO_TELEPON", "STATUS", "LAST_UPDATED"
    ]);
    sheetUsers.clearContents();
    sheetUsers.appendRow([
      "ID", "USERNAME", "NAMA_LENGKAP", "ROLE", "NO_TELEPON", "STATUS", "LAST_UPDATED"
    ]);
    sheetUsers.getRange(1, 1, 1, 7).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');

    var rowsUsers = payload.usersList.map(function(u) {
      return [
        u.id || ('USR-' + Date.now()),
        String(u.username || '').toLowerCase(),
        String(u.namaLengkap || ''),
        String(u.role || 'STAFF').toUpperCase(),
        String(u.noTelepon || ''),
        String(u.status || 'AKTIF').toUpperCase(),
        u.updatedAt || new Date().toISOString()
      ];
    });
    sheetUsers.getRange(2, 1, rowsUsers.length, 7).setValues(rowsUsers);
  }

  // 4. Simpan Master Data
  if (Array.isArray(payload.masterDataList) && payload.masterDataList.length > 0) {
    var sheetMaster = getOrCreateSheet_(ss, "MASTER_DATA", ["ID", "TIPE", "NILAI", "KETERANGAN", "LAST_UPDATED"]);
    sheetMaster.clearContents();
    sheetMaster.appendRow(["ID", "TIPE", "NILAI", "KETERANGAN", "LAST_UPDATED"]);
    sheetMaster.getRange(1, 1, 1, 5).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');
    var rowsMaster = payload.masterDataList.map(function(m) {
      return [m.id, m.tipe, m.nilai, m.keterangan || '', m.updatedAt || new Date().toISOString()];
    });
    sheetMaster.getRange(2, 1, rowsMaster.length, 5).setValues(rowsMaster);
  }

  // 5. Simpan Pelanggan
  if (Array.isArray(payload.pelangganList) && payload.pelangganList.length > 0) {
    var sheetPelanggan = getOrCreateSheet_(ss, "PELANGGAN", ["ID", "NAMA", "NO_TELEPON", "EMAIL", "ALAMAT", "KATEGORI", "TOTAL_SEWA", "CATATAN", "LAST_UPDATED"]);
    sheetPelanggan.clearContents();
    sheetPelanggan.appendRow(["ID", "NAMA", "NO_TELEPON", "EMAIL", "ALAMAT", "KATEGORI", "TOTAL_SEWA", "CATATAN", "LAST_UPDATED"]);
    sheetPelanggan.getRange(1, 1, 1, 9).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');
    var rowsPelanggan = payload.pelangganList.map(function(c) {
      return [c.id, c.nama, c.noTelepon, c.email || '', c.alamat || '', c.kategori || 'Wedding Organizer', Number(c.totalSewa || 0), c.catatan || '', c.updatedAt || new Date().toISOString()];
    });
    sheetPelanggan.getRange(2, 1, rowsPelanggan.length, 9).setValues(rowsPelanggan);
  }

  // 6. Simpan Supplier
  if (Array.isArray(payload.supplierList) && payload.supplierList.length > 0) {
    var sheetSupplier = getOrCreateSheet_(ss, "SUPPLIER", ["ID", "NAMA", "KONTAK_PERSON", "NO_TELEPON", "EMAIL", "KATEGORI_BARANG", "ALAMAT", "CATATAN", "LAST_UPDATED"]);
    sheetSupplier.clearContents();
    sheetSupplier.appendRow(["ID", "NAMA", "KONTAK_PERSON", "NO_TELEPON", "EMAIL", "KATEGORI_BARANG", "ALAMAT", "CATATAN", "LAST_UPDATED"]);
    sheetSupplier.getRange(1, 1, 1, 9).setBackground('#0f766e').setFontColor('#ffffff').setFontWeight('bold');
    var rowsSupplier = payload.supplierList.map(function(s) {
      return [s.id, s.nama, s.kontakPerson || '', s.noTelepon, s.email || '', s.kategoriBarang || 'Bunga Artifisial', s.alamat || '', s.catatan || '', s.updatedAt || new Date().toISOString()];
    });
    sheetSupplier.getRange(2, 1, rowsSupplier.length, 9).setValues(rowsSupplier);
  }

  // 7. Simpan Pengaturan Kontak & WhatsApp
  if (payload.settings) {
    var sheetKontak = getOrCreateSheet_(ss, "PENGATURAN_KONTAK", [
      "WHATSAPP_NUMBER", "DISPLAY_PHONE", "NAMA_TOKO", "TAGLINE", "EMAIL", "ALAMAT_WORKSHOP", "JAM_OPERASIONAL", "LAST_UPDATED"
    ]);
    var s = payload.settings;
    var kontakValues = [
      String(s.whatsappNumber || ''),
      String(s.displayPhone || ''),
      String(s.storeName || 'Hasan Dekor'),
      String(s.tagline || ''),
      String(s.email || ''),
      String(s.workshopAddress || ''),
      String(s.openingHours || ''),
      new Date().toISOString()
    ];
    if (sheetKontak.getLastRow() >= 2) {
      sheetKontak.getRange(2, 1, 1, 8).setValues([kontakValues]);
    } else {
      sheetKontak.appendRow(kontakValues);
    }
  }

  return { success: true, message: 'Semua data pohon, barang, master, akun pengguna, dan pengaturan kontak WhatsApp berhasil disinkronkan ke Spreadsheet!' };
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gasScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConnected = !!gasUrl.trim();

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base">Sinkronisasi Google Spreadsheet</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {GOOGLE_WORKSPACE_CONFIG.spreadsheetId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'status' 
                ? 'border-teal-600 text-teal-900 font-bold bg-white rounded-t-xl' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Koneksi & Sinkronisasi</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'code' 
                ? 'border-teal-600 text-teal-900 font-bold bg-white rounded-t-xl' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Kode Apps Script (Code.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'guide' 
                ? 'border-teal-600 text-teal-900 font-bold bg-white rounded-t-xl' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Cara Pasang (3 Menit)</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {activeTab === 'status' && (
            <>
              {/* Status Indicator Card */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                isConnected 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <div className={`p-2 rounded-xl mt-0.5 ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isConnected ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {isConnected ? 'URL Web App Google Apps Script Terpasang' : 'Penyimpanan Database Lokal (Belum Terhubung ke Spreadsheet)'}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {isConnected 
                      ? 'Setiap penambahan pohon baru, barang, sewa, atau transaksi mutasi akan OTOMATIS dikirim langsung ke Google Spreadsheet Anda secara real-time.'
                      : 'Saat ini data baru tersimpan di memori browser (localStorage). Agar penambahan otomatis tersimpan ke Google Spreadsheet Anda, masukkan URL Web App Google Apps Script di bawah.'}
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  Tautan Google Workspace Anda:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <a
                    href={GOOGLE_WORKSPACE_CONFIG.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition font-semibold text-slate-800 group"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>Buka Google Spreadsheet</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </a>

                  <a
                    href={GOOGLE_WORKSPACE_CONFIG.folderPohonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition font-semibold text-slate-800 group"
                  >
                    <div className="flex items-center gap-2">
                      <span>📁</span>
                      <span>Folder Drive Foto Pohon</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </a>
                </div>
              </div>

              {/* Daftar Sheet yang Dibuat Otomatis di Google Spreadsheet */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  Sheet Database yang Dibuat Otomatis di Spreadsheet:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>PENGATURAN_KONTAK</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>USERS</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>KATALOG_POHON</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>DATABASE_BARANG</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>PENYEWAAN</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>MUTASI_TRANSAKSI</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>MASTER_DATA</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>PELANGGAN</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>SUPPLIER</span>
                  </div>
                </div>
              </div>

              {/* Web App URL Form with Test & Push Actions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800">
                    URL Web App Deployment (Google Apps Script):
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Belum punya URL? Lihat panduan</span>
                  </button>
                </div>

                <form onSubmit={handleSaveGasUrl} className="space-y-2.5">
                  <input
                    type="url"
                    value={gasUrl}
                    onChange={e => { setGasUrl(e.target.value); setTestResult(null); }}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-teal-700"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={testing}
                      onClick={handleTestConnection}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-teal-600' : ''}`} />
                      <span>{testing ? 'Menguji...' : 'Tes Sambungan'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={pushing || !gasUrl.trim()}
                      onClick={handlePushData}
                      title="Mengirim semua pohon, barang, dan pelanggan lokal ke spreadsheet Anda"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <ArrowUpFromLine className={`w-3.5 h-3.5 ${pushing ? 'animate-bounce' : ''}`} />
                      <span>{pushing ? 'Mengirim Data...' : 'Kirim Semua Data Lokal ke Sheets'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={pulling || !gasUrl.trim()}
                      onClick={handlePullData}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <ArrowDownToLine className={`w-3.5 h-3.5 ${pulling ? 'animate-bounce' : ''}`} />
                      <span>{pulling ? 'Menarik...' : 'Tarik dari Sheets'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs ml-auto"
                    >
                      Simpan URL
                    </button>
                  </div>
                </form>

                {testResult && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    testResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {pushResult && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    pushResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {pushResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{pushResult.message}</span>
                  </div>
                )}

                {pullResult && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    pullResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {pullResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{pullResult.message}</span>
                  </div>
                )}

                {saveMessage && (
                  <p className="text-[11px] text-emerald-600 font-semibold">{saveMessage}</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p className="text-xs">
                  Salin seluruh kode di bawah ini lalu tempelkan di file <b>Code.gs</b> pada Apps Script spreadsheet Anda. Kode ini sudah otomatis menangani pembuatan sheet, penambahan pohon/barang, dan mutasi.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-800">
                    Kode Google Apps Script v5.2 Lengkap (Code.gs):
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Seluruh Kode'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                  {gasScriptCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Buka Editor Apps Script di Spreadsheet Anda</span>
                </h4>
                <p className="text-slate-600 text-xs pl-8">
                  Buka spreadsheet Anda (ID: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">{GOOGLE_WORKSPACE_CONFIG.spreadsheetId}</code>), lalu klik menu <b>Ekstensi (Extensions) &rarr; Apps Script</b>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Tempelkan Kode Script</span>
                </h4>
                <p className="text-slate-600 text-xs pl-8">
                  Hapus semua kode lama di file <b>Code.gs</b>, lalu tempelkan (paste) kode dari tab <b>"Kode Apps Script (Code.gs)"</b> di atas. Tekan <b>Ctrl + S</b> untuk menyimpan.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Deploy sebagai Web App (Penting!)</span>
                </h4>
                <div className="text-slate-600 text-xs pl-8 space-y-1.5">
                  <p>1. Klik tombol biru <b>Deploy (Terapkan) &rarr; New deployment (Penerapan baru)</b>.</p>
                  <p>2. Pilih jenis gear ⚙️ <b>Web app</b>.</p>
                  <p>3. Di bagian <b>Execute as</b>: pilih <b>Me (email Anda)</b>.</p>
                  <p className="text-amber-800 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                    4. Di bagian <b>Who has access</b>: PASTIKAN pilih <b>"Anyone" (Siapa saja)</b> agar web frontend dapat mengirim data penambahan barang.
                  </p>
                  <p>5. Klik <b>Deploy</b>, lalu salin (copy) <b>Web app URL</b> yang berakhiran <code className="font-mono text-teal-800">/exec</code>.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>Tempelkan URL di Aplikasi Ini</span>
                </h4>
                <p className="text-slate-600 text-xs pl-8">
                  Kembali ke tab <b>"Koneksi & Sinkronisasi"</b>, tempelkan URL tersebut ke input URL Web App, lalu klik <b>"Simpan URL"</b> dan <b>"Tes Sambungan"</b>. Selesai! Semua penambahan pohon, barang, dan penyewaan akan otomatis tersimpan langsung ke Google Spreadsheet.
                </p>
              </div>
            </div>
          )}

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-700" />
            <span>Koneksi live 2-arah Google Workspace</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
