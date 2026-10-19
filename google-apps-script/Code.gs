/**
 * =========================================================================
 * HASAN DEKOR POHON - BACKEND GOOGLE APPS SCRIPT (GAS) v4.5
 * Database: 1kG2fE2ILdkd9Bzg7pBFLJiw2ZjmnKajrk-7AkTPUStw
 * Folder Foto Pohon: 1r3kMLLGRncOQUbcaItDDfYV8Nyu7LSQN
 * Folder Data Barang: 1UyXd9bssw2Sn-i57T51WnIFudcfwstzF
 * =========================================================================
 */

const SPREADSHEET_ID   = '1kG2fE2ILdkd9Bzg7pBFLJiw2ZjmnKajrk-7AkTPUStw';
const FOLDER_ID_POHON  = '1r3kMLLGRncOQUbcaItDDfYV8Nyu7LSQN';
const FOLDER_ID_BARANG = '1UyXd9bssw2Sn-i57T51WnIFudcfwstzF';

const SHEET_POHON_KATALOG = 'KATALOG_POHON';
const SHEET_MASTER_BARANG = 'MASTER_BARANG';
const SHEET_TRANSAKSI     = 'TRANSAKSI';
const SHEET_SEWA          = 'PENYEWAAN';
const SHEET_SEWA_ITEMS    = 'PENYEWAAN_ITEMS';
const SHEET_PELANGGAN     = 'PELANGGAN';
const SHEET_SUPPLIER      = 'SUPPLIER';
const SHEET_USERS         = 'USERS';
const SHEET_MASTER_DATA   = 'MASTER_DATA';
const SHEET_LOG           = 'LOG';

function getSpreadsheet_() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      const active = SpreadsheetApp.getActiveSpreadsheet();
      if (active) return active;
      throw new Error('Gagal membuka Spreadsheet ID: ' + SPREADSHEET_ID);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Hasan Dekor Pohon - Manajemen Stok & Rental')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const payload = postData.payload || postData;

    let result = { success: true, message: 'Sinkronisasi berhasil diterima', timestamp: new Date().toISOString() };

    const ss = getSpreadsheet_();
    let logSheet = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
    logSheet.appendRow([new Date(), 'WEB_APP_SYNC', action || 'UPDATE', JSON.stringify(payload.summary || {})]);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function uploadFileKeDrive(base64Data, fileName, targetFolderId) {
  try {
    const folderId = targetFolderId || FOLDER_ID_POHON;
    const folder = DriveApp.getFolderById(folderId);
    const splitData = base64Data.split(',');
    const contentType = splitData[0].match(/:(.*?);/)[1];
    const decodedData = Utilities.base64Decode(splitData[1]);
    const blob = Utilities.newBlob(decodedData, contentType, fileName);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (e) {
    throw new Error(e.toString());
  }
}
