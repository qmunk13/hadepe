import { BookingOrder, ProductItem, StoreSettings } from '../types';

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function cleanPhoneForWa(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }
  return clean;
}

export function generateWhatsAppOrderUrl(order: BookingOrder, settings: StoreSettings): string {
  const targetPhone = cleanPhoneForWa(settings.whatsappNumber);

  const itemsList = order.items
    .map(
      (it: any, idx: number) =>
        `${idx + 1}. *[${it.productCode}] ${it.productName}*\n` +
        `   • Jumlah: ${it.quantity} Unit`
    )
    .join('\n\n');

  const servicesList: string[] = [];
  if (order.services.includeSetup) {
    servicesList.push(`• Jasa Pasang & Bongkar Tim Teknisi di Lokasi Venue`);
  }
  if (order.services.includeLighting) {
    servicesList.push(`• Instalasi Spotlight LED & Fairy Light Pohon`);
  }
  if (order.services.includeTransport) {
    servicesList.push(`• Pengiriman Khusus Truk Venue`);
  }

  const servicesText = servicesList.length > 0 ? servicesList.join('\n') : '• Pengambilan mandiri di workshop';
  const notesText = order.notes && order.notes.trim() ? order.notes.trim() : 'Tidak ada catatan khusus';

  const rawMessage = 
`🌿 *RESERVASI SEWA POHON & DEKORASI*
*HD-Pohon*
No. Reservasi: *#${order.orderNumber}*
Tanggal Pengajuan: ${formatDateIndo(order.createdAt)}

━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *DATA PEMESAN & ACARA*
• *Nama / WO:* ${order.customerName}
• *No. WhatsApp:* ${order.customerPhone}
• *Tanggal Acara:* ${formatDateIndo(order.eventDate)} s/d ${formatDateIndo(order.returnDate)} (${order.rentalDays} Hari)
• *Nama Gedung / Venue:* ${order.venueName}
• *Alamat Lokasi:* ${order.venueAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🌳 *POHON / ITEM YANG INGIN DISEWA:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ *KEBUTUHAN LAYANAN TAMBAHAN:*
${servicesText}

📝 *CATATAN KONSEP ACARA:*
${notesText}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Halo Admin *${settings.storeName}*, saya ingin melakukan reservasi dan konsultasi sewa pohon dekorasi untuk acara sesuai rincian di atas. Mohon konfirmasi ketersediaan unit untuk jadwal tersebut. Terima kasih!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(rawMessage)}`;
}

export function generateDirectProductInquiryUrl(product: ProductItem, settings: StoreSettings, optionalDate?: string): string {
  const targetPhone = cleanPhoneForWa(settings.whatsappNumber);

  const dateNotice = optionalDate ? `\n• Rencana Tanggal Acara: *${formatDateIndo(optionalDate)}*` : '';

  const rawMessage = 
`Halo Admin *${settings.storeName}*, saya tertarik untuk konsultasi sewa pohon dekorasi berikut:

🌳 *PRODUK:*
• *Nama:* ${product.name}
• *Kode:* ${product.code}
• *Kategori:* ${product.category}
• *Tinggi:* ${product.height}${dateNotice}

Apakah unit pohon ini masih tersedia untuk jadwal acara saya? Mohon informasi ketersediaan unit dan ketentuan sewanya. Terima kasih!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(rawMessage)}`;
}
