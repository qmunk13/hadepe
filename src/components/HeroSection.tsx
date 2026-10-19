import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck, Clock } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroSectionProps {
  settings: StoreSettings;
  onExploreCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onExploreCatalog }) => {
  return (
    <section id="beranda" className="relative overflow-hidden bg-gradient-to-b from-stone-100/80 via-white to-slate-50 border-b border-slate-200/80 pt-8 pb-16 lg:pt-14 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Top 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Showcase Koleksi Pohon Dekorasi Wedding 2026</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Penyewaan Pohon Artifisial & <span className="text-teal-800 underline decoration-teal-300 decoration-wavy decoration-1">Dekorasi Pelaminan</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Hadirkan keindahan alami pohon maple merah autumn, beringin putih pelaminan, sakura mekar Jepang, dan palem tropis rimbun untuk pernikahan, photobooth, lamaran, dan event bergengsi. Sistem pemesanan online instan terhubung langsung ke WhatsApp.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreCatalog}
                className="px-6 py-3.5 bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Jelajahi Katalog Pohon</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Halo Hasan Dekor Pohon, saya ingin konsultasi dan tanya sewa pohon dekorasi untuk acara saya...')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi via WhatsApp</span>
              </a>
            </div>

            {/* Quick Proof Badges */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>100% Batang Kayu Asli</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Siap Antar & Pasang di Venue</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Respon Cepat via WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image with Scrim */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 bg-slate-900 group">
              <img
                src="https://lh3.googleusercontent.com/d/1I5ZJamph3pNLJbwkad2zIclY3BiAsrhQ"
                alt="Dekorasi pohon artifisial pelaminan Hasan Dekor"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                  Koleksi Panggung Pelaminan
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold mt-1 text-white">
                  Instalasi Pohon Raksasa Ballroom & Photobooth
                </h3>
                <p className="text-xs text-slate-200 mt-1 max-w-md">
                  Material dedaunan sutra & latex premium anti-rontok dengan struktur batang kayu alami pilihan.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Item Feature / Trust Banner */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center text-lg shrink-0">
              🌳
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Kayu Alami Terawat</div>
              <div className="text-xs text-slate-500 mt-0.5">Batang kayu asli keras dilapisi anti rayap dan jamur.</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center text-lg shrink-0">
              ✨
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Daun Bebas Rontok</div>
              <div className="text-xs text-slate-500 mt-0.5">Dedaunan silk & latex bersih tidak mengotori karpet venue.</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center text-lg shrink-0">
              🛠️
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Layanan Setting di Lokasi</div>
              <div className="text-xs text-slate-500 mt-0.5">Tim teknisi kami siap merakit dan membongkar tepat waktu.</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center text-lg shrink-0">
              💬
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Integrasi WhatsApp Instan</div>
              <div className="text-xs text-slate-500 mt-0.5">Rincian pesanan terkirim otomatis, booking cepat tanpa ribet.</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
