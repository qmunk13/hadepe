import React from 'react';
import { X, Printer, Phone, MapPin } from 'lucide-react';
import { BookingOrder, StoreSettings } from '../types';
import { formatDateIndo } from '../utils/whatsapp';

interface InvoicePrintModalProps {
  order: BookingOrder | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ order, settings, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="text-xs font-semibold text-slate-500">
            Preview Surat Jalan & Bukti Serah Terima Unit Pohon
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="space-y-6 text-slate-900 text-xs">
          
          {/* Header Surat */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl">
                🌿
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                  {settings.storeName}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  {settings.tagline}
                </p>
                <div className="text-[10px] text-slate-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-teal-700" /> {settings.workshopAddress}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-teal-700" /> {settings.displayPhone}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:pl-6 border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                SURAT JALAN & SERAH TERIMA UNIT
              </span>
              <div className="font-mono text-base font-bold text-slate-900 mt-0.5">
                #{order.orderNumber}
              </div>
              <div className="text-[10px] text-slate-400">
                Tanggal: {formatDateIndo(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Customer & Event Details Box */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Data Pemesan / Wedding Organizer:
              </span>
              <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
              <div className="text-slate-600 mt-0.5 font-mono">WA: {order.customerPhone}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Jadwal & Lokasi Acara:
              </span>
              <div className="font-bold text-slate-900">{order.venueName}</div>
              <div className="text-slate-600 text-[11px]">{order.venueAddress}</div>
              <div className="text-teal-800 font-semibold mt-1">
                Periode: {formatDateIndo(order.eventDate)} s/d {formatDateIndo(order.returnDate)} ({order.rentalDays} Hari)
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-500 font-bold bg-slate-100/80">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Kode SKU</th>
                  <th className="py-2.5 px-3">Nama Pohon / Properti</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Disewa</th>
                  <th className="py-2.5 px-3 text-center">Kondisi Serah Terima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{it.productCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{it.productName}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{it.quantity} Unit</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">[ Baik / Lengkap ]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Services Checklist */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
              Layanan Penunjang Acara:
            </span>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              {order.services.includeSetup && <li>✓ Jasa Pasang & Bongkar Tim Teknisi HD-Pohon</li>}
              {order.services.includeLighting && <li>✓ Instalasi Spotlight LED & Fairy Lights Pohon</li>}
              {order.services.includeTransport && <li>✓ Transportasi Antar-Jemput Truk Khusus Venue</li>}
              {!order.services.includeSetup && !order.services.includeLighting && !order.services.includeTransport && (
                <li>Pengambilan dan pengembalian mandiri di workshop</li>
              )}
            </ul>
            {order.notes && (
              <div className="pt-2 text-[11px]">
                <span className="font-semibold text-slate-700">Catatan Khusus: </span>
                <span className="text-slate-500 italic">{order.notes}</span>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div>
              <div className="text-slate-500 mb-14">Penyewa / Wedding Organizer:</div>
              <div className="font-bold border-t border-slate-400 pt-1 w-44 mx-auto">
                ( {order.customerName} )
              </div>
            </div>

            <div>
              <div className="text-slate-500 mb-14">Pengelola HD-Pohon:</div>
              <div className="font-bold border-t border-slate-400 pt-1 w-44 mx-auto">
                ( Hasan Syahputra )
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
