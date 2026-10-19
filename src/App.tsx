/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HowToOrderSection } from './components/HowToOrderSection';
import { AboutLocationSection } from './components/AboutLocationSection';
import { ReservationModal } from './components/ReservationModal';
import { AdminPortal } from './components/AdminPortal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from './data/initialProducts';
import { ProductItem, BookingOrder, StoreSettings } from './types';
import { MessageCircle, Lock } from 'lucide-react';
import { AppDataService } from './services/api';

export default function App() {
  // 1. Persistent States
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('hasan_products_v2');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<BookingOrder[]>(() => {
    try {
      const saved = localStorage.getItem('hasan_orders_v2');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'ord-sample-1',
          orderNumber: 'HDP-20261024-8192',
          customerName: 'Diana Maharani (Mahkota Wedding Organizer)',
          customerPhone: '08119500890',
          eventDate: '2026-10-24',
          returnDate: '2026-10-25',
          rentalDays: 2,
          venueName: 'Gedung Graha Sarina Vidi, Sleman',
          venueAddress: 'Jl. Magelang KM 8, Mlati, Sleman, Yogyakarta',
          services: { includeSetup: true, includeLighting: true, includeTransport: true },
          notes: 'Loading dock jam 08.00 pagi, tema pelaminan adat jawa modern klasik.',
          items: [
            {
              productId: 'phn-002',
              productCode: 'PHN-002',
              productName: 'Pohon Beringin Putih Wedding Pelaminan',
              quantity: 2
            }
          ],
          status: 'Menunggu Konfirmasi WA',
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('hasan_settings_v2');
      return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('hasan_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hasan_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hasan_settings_v2', JSON.stringify(settings));
  }, [settings]);

  const [isSyncing, setIsSyncing] = useState(false);

  const syncLatestDataFromSheets = useCallback(async () => {
    if (!AppDataService.getGasUrl()) return;
    setIsSyncing(true);
    try {
      // 1. Ambil kontak & WhatsApp terbaru dari Google Sheets
      const resSettings = await AppDataService.syncSettingsFromGoogleSheets();
      if (resSettings.success && resSettings.settings) {
        setSettings(resSettings.settings);
      }

      // 2. Ambil katalog produk pohon terbaru langsung dari Google Spreadsheet
      const resKatalog = await AppDataService.syncKatalogPohonFromGoogleSheets();
      if (resKatalog.success && resKatalog.products && resKatalog.products.length > 0) {
        setProducts(resKatalog.products);
      }
    } catch (err) {
      console.warn('Real-time sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sinkronkan data produk pohon & kontak dari Google Spreadsheet saat awal dibuka & berkala
  useEffect(() => {
    syncLatestDataFromSheets();

    // Auto-sync setiap 60 detik agar pengunjung & pemilik toko selalu melihat data terbaru secara real-time
    const interval = setInterval(() => {
      syncLatestDataFromSheets();
    }, 60000);

    // Auto-sync saat tab browser kembali aktif (pengunjung beralih ke tab website)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncLatestDataFromSheets();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [syncLatestDataFromSheets]);

  // 2. View & Modal States
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationPreselectedProduct, setReservationPreselectedProduct] = useState<ProductItem | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [printingOrder, setPrintingOrder] = useState<BookingOrder | null>(null);

  // Admin login modal state
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  const handleOpenReservation = (product?: ProductItem) => {
    setReservationPreselectedProduct(product || null);
    setIsReservationOpen(true);
  };

  const handleOrderCompleted = (newOrder: BookingOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Otomatis kirim data reservasi baru ke Google Spreadsheet pemilik toko
    AppDataService.simpanReservasiOnline(newOrder);
  };

  // Admin Authentication
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123' || adminPasswordInput === 'hasan123' || adminPasswordInput.trim() === 'admin') {
      setShowAdminLoginModal(false);
      setAdminPasswordInput('');
      setAdminAuthError('');
      setActiveView('admin');
      window.scrollTo(0, 0);
    } else {
      setAdminAuthError('Password salah. Silakan coba kembali.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-600 selection:text-white w-full max-w-full overflow-x-hidden">
      
      {/* Main Navbar: Tampil di Portal Publik */}
      {activeView === 'public' && (
        <Navbar
          onOpenReservation={() => handleOpenReservation()}
          onOpenAdmin={() => setShowAdminLoginModal(true)}
          settings={settings}
          activeView={activeView}
          onBackToPublic={() => setActiveView('public')}
        />
      )}

      {/* Main Page Routing: Public Portal vs Admin Portal */}
      {activeView === 'admin' ? (
        <AdminPortal
          products={products}
          onUpdateProducts={setProducts}
          orders={orders}
          onUpdateOrders={setOrders}
          settings={settings}
          onUpdateSettings={setSettings}
          onBackToPublic={() => setActiveView('public')}
          onPrintInvoice={(ord) => setPrintingOrder(ord)}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Presentation */}
          <HeroSection
            settings={settings}
            onExploreCatalog={() => {
              const el = document.getElementById('katalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Product Catalog (No Price, Direct WA Reservation) */}
          <CatalogSection
            products={products}
            settings={settings}
            onOpenReservationWithProduct={(p) => handleOpenReservation(p)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onZoomImage={(url, title) => setZoomImage({ url, title })}
            isSyncing={isSyncing}
            onRefresh={syncLatestDataFromSheets}
          />

          {/* How to Order & FAQs */}
          <HowToOrderSection settings={settings} />

          {/* About, Location & Testimonials (No Bank Account) */}
          <AboutLocationSection settings={settings} />

          {/* Footer Publik */}
          <footer className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="font-serif font-bold text-lg text-white flex items-center justify-center md:justify-start gap-2">
                  <span>🌿</span>
                  <span>{settings.storeName}</span>
                </div>
                <p className="text-slate-400 max-w-md text-xs">
                  {settings.tagline}. Menghadirkan panggung pernikahan megah dengan pohon artifisial berkualitas.
                </p>
                <div className="text-[11px] text-slate-500 pt-2">
                  &copy; {new Date().getFullYear()} {settings.storeName}. Seluruh hak cipta dilindungi.
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-5 text-slate-300">
                <a href="#katalog" className="hover:text-white transition">Katalog Pohon</a>
                <a href="#cara-sewa" className="hover:text-white transition">Cara Reservasi</a>
                <a href="#tentang" className="hover:text-white transition">Kontak & Workshop</a>
                <button
                  onClick={() => setShowAdminLoginModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login Pengelola</span>
                </button>
              </div>
            </div>
          </footer>
        </main>
      )}

      {/* Online WhatsApp Tree Reservation Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        products={products}
        preselectedProduct={reservationPreselectedProduct}
        settings={settings}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenReservationWithProduct={(p) => handleOpenReservation(p)}
        settings={settings}
        onZoomImage={(url, title) => setZoomImage({ url, title })}
      />

      {/* SPK & Surat Jalan Delivery Print Modal */}
      <InvoicePrintModal
        order={printingOrder}
        settings={settings}
        onClose={() => setPrintingOrder(null)}
      />

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
              <span className="font-serif font-bold text-sm text-slate-200">{zoomImage.title}</span>
              <button
                onClick={() => setZoomImage(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] flex items-center justify-center p-2 bg-slate-950">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setShowAdminLoginModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto text-xl font-bold">
                🔒
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                Masuk
              </h3>
              <p className="text-xs text-slate-500">
                Akses internal untuk mengelola katalog, stok pohon, dan rekap pesanan.
              </p>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Masukkan sandi..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-700 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                 Hasan Dekor Pohon
                </span>
              </div>

              {adminAuthError && (
                <div className="text-xs text-rose-600 font-semibold p-2 bg-rose-50 rounded-xl border border-rose-200">
                  {adminAuthError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Masuk &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Fast WhatsApp Contact Badge on Public View */}
      {activeView === 'public' && (
        <aside
          aria-label="Pusat Bantuan WhatsApp"
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 group"
        >
          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Halo Admin Hasan Dekor Pohon, saya ingin tanya ketersediaan sewa pohon dekorasi untuk acara...')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer font-bold text-xs"
          >
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span className="hidden sm:inline">Hubungi WhatsApp</span>
          </a>
        </aside>
      )}

    </div>
  );
}
