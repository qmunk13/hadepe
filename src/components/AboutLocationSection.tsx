import React from 'react';
import { MapPin, Clock, Phone, Mail, MessageCircle, Star, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface AboutLocationSectionProps {
  settings: StoreSettings;
}

export const AboutLocationSection: React.FC<AboutLocationSectionProps> = ({ settings }) => {
  const testimonials = [
    {
      name: 'Rian Pradana',
      role: 'Owner Mahkota Wedding Organizer',
      event: 'Pernikahan di The Royal Ambarrukmo',
      comment: 'Pohon beringin putih dan maple dari HD-selalu jadi primadona klien kami. Batang kayunya alami, dedaunannya rimbun bersih tanpa rontokan serbuk di karpet hotel. Timnya tepat waktu saat loading dock!'
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Dekorator Rekanan Vidi Wedding Hall',
      event: 'Resepsi Graha Sarina Vidi Sleman',
      comment: 'Sangat terbantu dengan sistem pemesanan online via WhatsApp. Begitu isi form dari web, rincian item langsung terformat rapi di WA. Pohon sakura pink-nya juara untuk photobooth!'
    },
    {
      name: 'Bagus Dewanto',
      role: 'Event Producer Mandiri Gathering',
      event: 'Corporate Gala Dinner Hyatt Regency',
      comment: 'Pohon palem tropis dan zaitunnya membuat suasana ballroom formal jadi hangat dan berkelas. Komunikasi admin cepat dan responsif setiap saat.'
    }
  ];

  return (
    <section id="tentang" className="py-16 sm:py-20 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Testimonials */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs uppercase tracking-widest text-teal-800 font-bold mb-1">
              Kepercayaan Mitra
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Testimoni Wedding Organizer & Vendor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Telah dipercaya oleh lebih dari 150+ wedding organizer, hotel ballroom, dan dekorator pengantin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-xs">{t.name}</div>
                  <div className="text-[11px] text-teal-800 font-semibold">{t.role}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Location & Showroom Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Workshop & Showroom Info */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-teal-800 font-bold mb-1">
                Workshop & Showroom Fisik
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-900">
                Kunjungi Galeri Pohon HD-Pohon
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Anda dapat melihat langsung koleksi pohon artifisial, memilih variasi dahan dan jenis daun, atau berdiskusi langsung mengenai konsep pelaminan impian Anda bersama tim dekorator kami.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900">Alamat Workshop:</span>
                  <span className="text-slate-600 leading-relaxed">{settings.workshopAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900">Jam Operasional Showroom:</span>
                  <span className="text-slate-600">{settings.openingHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900">Kontak Telepon / WhatsApp:</span>
                  <span className="text-slate-600 font-mono">{settings.displayPhone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900">Email Korespondensi:</span>
                  <span className="text-slate-600">{settings.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=Halo%20Hasan%20Dekor,%20saya%20ingin%20jadwalkan%20kunjungan%20ke%20workshop`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Jadwalkan Kunjungan ke Workshop</span>
              </a>
            </div>
          </div>

          {/* Right: Quality Commitment & Service Assurance (No Bank Account) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Komitmen Kualitas HD-Pohon</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-0.5">🌿 Batang Kayu Asli Terawat</div>
                <div>Setiap pohon menggunakan rangka batang kayu hutan alami yang kokoh, berbobot stabil, dan tahan terhadap guncangan venue.</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-0.5">✨ Kebersihan Karpet Venue Terjamin</div>
                <div>Dedaunan silk & latex kami berkualitas tinggi, bebas rontokan debu halus sehingga ballroom hotel tetap bersih sempurna.</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-0.5">🚛 Armada & Teknisi Khusus</div>
                <div>Kami mengantar langsung ke titik loading dock gedung dan siap membantu perakitan tepat waktu.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
