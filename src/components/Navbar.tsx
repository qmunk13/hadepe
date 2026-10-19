import React, { useState } from 'react';
import { MessageCircle, Lock, Menu, X, PhoneCall } from 'lucide-react';
import { StoreSettings } from '../types';

interface NavbarProps {
  onOpenReservation: () => void;
  onOpenAdmin: () => void;
  settings: StoreSettings;
  activeView: 'public' | 'admin';
  onBackToPublic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReservation,
  onOpenAdmin,
  settings,
  activeView,
  onBackToPublic
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a 
          href="#beranda" 
          onClick={(e) => {
            if (activeView === 'admin') {
              e.preventDefault();
              onBackToPublic();
            }
          }}
          className="flex items-center gap-2.5 text-slate-900 hover:text-teal-900 transition-colors shrink-0 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            🌿
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {settings.storeName}
          </span>
        </a>

        {/* Zone 2: 4 clean single-line text links (Hanya tampil di portal publik) */}
        {activeView !== 'admin' && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#katalog" className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0">
              Katalog Pohon
            </a>
            <a href="#cara-sewa" className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0">
              Cara Pemesanan
            </a>
            <a href="#tentang" className="hover:text-teal-800 transition-colors whitespace-nowrap shrink-0">
              Tentang & Lokasi
            </a>
            <a 
              href={`https://wa.me/${settings.whatsappNumber}?text=Halo%20Hasan%20Dekor,%20saya%20ingin%20tanya%20sewa%20pohon%20pelaminan`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Chat WhatsApp</span>
            </a>
          </nav>
        )}

        {/* Zone 3: 1 Primary Action + Admin Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {activeView === 'admin' ? (
            <button
              onClick={onBackToPublic}
              className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shrink-0"
            >
              &larr; Lihat Portal Publik
            </button>
          ) : (
            <>
              <button
                onClick={onOpenReservation}
                className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                aria-label="Pesan via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pesan via WhatsApp</span>
              </button>

              <button
                onClick={onOpenAdmin}
                title="Masuk Pengelola Internal"
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              >
                <Lock className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {activeView !== 'admin' && (
            <>
              <a
                href="#katalog"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-800"
              >
                Katalog Pohon
              </a>
              <a
                href="#cara-sewa"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-800"
              >
                Cara Pemesanan
              </a>
              <a
                href="#tentang"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-800"
              >
                Tentang & Lokasi
              </a>
            </>
          )}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="w-full text-center py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reservasi via WhatsApp</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full text-center py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl"
            >
              Login Pengelola Gudang
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
