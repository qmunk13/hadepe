import React from 'react';
import { CalendarCheck, MessageSquare, Truck, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types';

interface HowToOrderSectionProps {
  settings: StoreSettings;
}

export const HowToOrderSection: React.FC<HowToOrderSectionProps> = ({ settings }) => {
  const steps = [
    {
      step: '01',
      icon: <CalendarCheck className="w-6 h-6 text-teal-700" />,
      title: 'Pilih Koleksi Pohon',
      desc: 'Buka katalog, periksa spesifikasi tinggi dan bentang kanopi yang cocok dengan luas panggung atau photobooth pelaminan Anda.'
    },
    {
      step: '02',
      icon: <MessageSquare className="w-6 h-6 text-teal-700" />,
      title: 'Isi Formulir Reservasi',
      desc: 'Klik tombol "Pesan via WhatsApp", masukkan tanggal acara, nama gedung/venue, serta layanan yang dibutuhkan (pasang/bongkar/lighting).'
    },
    {
      step: '03',
      icon: <ShieldCheck className="w-6 h-6 text-teal-700" />,
      title: 'Konfirmasi Jadwal via WhatsApp',
      desc: 'Rincian pesanan langsung terkirim otomatis ke WhatsApp resmi Hasan Dekor. Admin kami segera memverifikasi ketersediaan stok fisik.'
    },
    {
      step: '04',
      icon: <Truck className="w-6 h-6 text-teal-700" />,
      title: 'Pengantaran & Pemasangan di Venue',
      desc: 'Armada & tim teknisi kami mengantar pohon ke venue pernikahan tepat waktu saat jam loading dock, merakit, dan membongkar pasca acara.'
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana cara mengetahui ketersediaan pohon untuk tanggal acara saya?',
      a: 'Anda dapat langsung mengisi formulir reservasi atau mengklik tombol "Chat WhatsApp" di setiap produk. Admin kami akan langsung mengecek jadwal booking unit tersebut.'
    },
    {
      q: 'Apakah tim Hasan Dekor bisa membantu pemasangan di gedung?',
      a: 'Tentu saja! Kami memiliki tim teknisi berpengalaman yang siap merakit pohon di venue pelaminan sebelum acara dimulai dan membongkarnya kembali setelah acara selesai.'
    },
    {
      q: 'Apakah pohon berukuran besar bisa masuk lift barang gedung pernikahan?',
      a: 'Bisa. Semua pohon berukuran besar (3 meter ke atas) dirancang dengan sistem knockdown presisi yang dapat dilepas menjadi 2-3 bagian dahan sehingga aman masuk lift hotel maupun pintu standar gedung.'
    },
    {
      q: 'Area mana saja yang dijangkau oleh layanan Hasan Dekor Pohon?',
      a: 'Layanan reguler kami melayani seluruh area Yogyakarta, Sleman, Bantul, Solo, Klaten, Magelang, Semarang, dan sekitarnya. Untuk pengiriman luar kota dapat dikonsultasikan via WhatsApp.'
    }
  ];

  return (
    <section id="cara-sewa" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-teal-800 font-bold mb-1">
            Alur Booking Mudah
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Cara Reservasi Pohon via WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Terintegrasi langsung dengan WhatsApp resmi Hasan Dekor untuk proses reservasi yang cepat dan transparan.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 relative flex flex-col justify-between hover:bg-white hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-300">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto pt-8 border-t border-slate-100">
          <h3 className="font-serif font-bold text-slate-900 text-xl text-center mb-8">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 bg-stone-50/80 rounded-2xl border border-slate-200/70 space-y-2">
                <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-start gap-2">
                  <span className="text-teal-700 font-bold shrink-0">Q:</span>
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
