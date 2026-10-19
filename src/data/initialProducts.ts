import { ProductItem, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'phn-001',
    code: 'PHN-001',
    name: 'Pohon Maple Merah Autumn Raksasa',
    category: 'Pohon Besar',
    height: '2.8 - 3.2 Meter',
    widthSpread: '2.4 Meter (Rimbun)',
    trunkType: 'Batang Kayu Kering Alami Dilapisi Anti Rayap',
    foliageType: 'Daun Maple Merah Silk Premium (Tahan Rontok)',
    stockTotal: 4,
    stockAvailable: 3,
    stockRented: 1,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_maple_red_autumn_1792371618899.jpg',
    description: 'Pohon dekorasi ikonik dengan daun maple merah keemasan bergaya autumn fall yang sangat megah. Sangat diminati untuk center pelaminan mewah, panggung resepsi adat maupun modern, dan photobooth tematik musim gugur.',
    highlights: [
      'Batang kayu hutan alami pilihan dengan urat kayu realistis',
      'Daun maple warna merah crimson gradasi keemasan premium',
      'Sistem knockdown 3 bagian mudah masuk lift gedung',
      'Termasuk cover alas bawah pot nuansa kayu/rumput'
    ],
    recommendedFor: [
      'Center Panggung Pelaminan (Main Stage)',
      'Entrance Gate & Red Carpet Lorong Masuk',
      'Photobooth VIP & Engagement Backdrop'
    ],
    includedAccessories: ['Standing Plat Baja Stabilizer', 'Cover Pot Kayu Rustic', 'Daun Tambahan Touch-Up'],
    featured: true
  },
  {
    id: 'phn-002',
    code: 'PHN-002',
    name: 'Pohon Beringin Putih Wedding Pelaminan',
    category: 'Pohon Besar',
    height: '3.0 - 3.5 Meter',
    widthSpread: '2.8 Meter (Kanopi Melebar)',
    trunkType: 'Kayu Alami Keras Berakar Lilit Artistik',
    foliageType: 'Daun Ficus Putih Salju & Bunga Wisteria Menjuntai',
    stockTotal: 6,
    stockAvailable: 4,
    stockRented: 2,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg',
    description: 'Masterpiece pohon dekorasi pernikahan pelaminan bergaya classic all-white royal wedding. Ranting lebat dengan juntaian wisteria dan dedaunan putih bersih memancarkan keagungan sakral saat disorot lampu warm-white panggung.',
    highlights: [
      'Kanopi melebar menyerupai payung raksasa pelindung kursi pengantin',
      'Batang berakar lilit alami memberi kesan ratusan tahun',
      'Dilengkapi dudukan micro fairy lights tersembunyi',
      'Bahan lembut bebas bau kimia dan tidak meninggalkan serpihan kotor'
    ],
    recommendedFor: [
      'Samping Kanan-Kiri Kursi Pengantin Pelaminan',
      'Pilar Lorong Jalan Pengantin (Catwalk Wedding)',
      'Ballroom Hotel Bintang 5 & Gedung Pertemuan'
    ],
    includedAccessories: ['Base Plat Berat Anti Geser', 'Bunga Rangkai Kaki Pohon', 'Dudukan Lampu Sorot'],
    featured: true
  },
  {
    id: 'phn-003',
    code: 'PHN-003',
    name: 'Pohon Sakura Pink Jepang Mekar Lebat',
    category: 'Pohon Sedang',
    height: '2.2 - 2.5 Meter',
    widthSpread: '2.0 Meter',
    trunkType: 'Batang Kayu Mahoni Alami Berkelok Estetik',
    foliageType: 'Kelopak Bunga Sakura Sutra Lembut 4 Lapis',
    stockTotal: 8,
    stockAvailable: 5,
    stockRented: 3,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_sakura_pink_cherry_1792371619213.jpg',
    description: 'Pohon sakura Jepang mekar sempurna bernuansa pastel romantis. Ideal untuk menghidupkan area photobooth pesta pernikahan, sweet seventeen, lamaran, maupun backdrop akad nikah yang dreamy dan fotogenik.',
    highlights: [
      'Warna kelopak pink pastel soft yang sangat cantik di kamera',
      'Dahan fleksibel bisa disesuaikan lekukan saat di venue',
      'Bobot kokoh namun aman dipindahkan',
      'Tersedia sepasang simetris untuk gapura lorong'
    ],
    recommendedFor: [
      'Area Photobooth & Corner Selfie Tamu Undangan',
      'Dekorasi Panggung Akad Nikah & Lamaran',
      'Pameran Mall & Corporate Gala Dinner'
    ],
    includedAccessories: ['Pot Minimalis Putih Kotak', 'Batu Kerikil Hias / Lumut Sintetis', 'Pita Hias'],
    featured: true
  },
  {
    id: 'phn-004',
    code: 'PHN-004',
    name: 'Pohon Palem Kipas & Monstera Tropis Set',
    category: 'Tanaman Tropis',
    height: '2.0 - 2.4 Meter',
    widthSpread: '1.6 Meter per Cluster',
    trunkType: 'Batang Palem Serat Alami & Log Wood Pot',
    foliageType: 'Daun Palem Kipas & Monstera Latex Real-Touch',
    stockTotal: 5,
    stockAvailable: 4,
    stockRented: 1,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_tropical_palm_decor_1792371619862.jpg',
    description: 'Rangkaian tanaman tropis rimbun dengan daun palem kipas lebar, monstera deliciosa latex tebal, dan pakis hutan. Cocok untuk konsep pernikahan tropical botanical, bohemian rustic, modern garden, dan event outdoor/indoor.',
    highlights: [
      'Daun latex tebal dengan urat daun presisi mirip tanaman hidup',
      'Termasuk planter box geometri hitam mewah & standing pot kayu',
      'Tahan air dan cuaca lembap tanpa khawatir layu',
      'Bisa disusun rapat sebagai sekat pembatas ruangan VIP'
    ],
    recommendedFor: [
      'Dekorasi Tema Rustic Tropical & Garden Party',
      'Penyekat Area Meja VIP & Lounge Ballroom',
      'Stage Musik Akustik & Photobooth Bohemian'
    ],
    includedAccessories: ['Planter Pot Modern Matte Black', 'Aksesoris Tanaman Pakis Bawah'],
    featured: true
  },
  {
    id: 'phn-005',
    code: 'PHN-005',
    name: 'Pohon Zaitun Mediterania Minimalis (Olive Tree)',
    category: 'Pohon Sedang',
    height: '1.9 - 2.2 Meter',
    widthSpread: '1.4 Meter',
    trunkType: 'Batang Kayu Kopi Bertekstur Eksotis',
    foliageType: 'Daun Olive Hijau Sage dengan Buah Zaitun Halus',
    stockTotal: 6,
    stockAvailable: 6,
    stockRented: 0,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_tropical_palm_decor_1792371619862.jpg',
    description: 'Pohon zaitun estetik dengan daun hijau keperakan khas pedesaan Italia / Mediterania. Memberikan sentuhan elegan, tenang, dan kontemporer bagi pernikahan modern minimalis dan intimate dinner.',
    highlights: [
      'Karakter ranting airy dan ramping tidak memblokir pandangan panggung',
      'Warna daun sage green yang serasi dengan gaun pengantin modern',
      'Dilengkapi pot tanah liat terracotta atau keramik putih marmer',
      'Mudah ditempatkan di sudut photogallery atau meja penerima tamu'
    ],
    recommendedFor: [
      'Intimate Wedding Reception & Akad Nikah',
      'Galeri Foto Pre-Wedding & Meja Angpao',
      'Cafe, Restoran, dan Private Studio Shoot'
    ],
    includedAccessories: ['Pot Keramik Marmer Silinder', 'Cover Goni Estetik'],
    featured: false
  },
  {
    id: 'phn-006',
    code: 'PHN-006',
    name: 'Pohon Willow Dedalu Menjuntai Warm Fairy Light',
    category: 'Pohon Karakter',
    height: '2.6 - 2.9 Meter',
    widthSpread: '2.3 Meter (Dahan Menunduk Rimbun)',
    trunkType: 'Batang Kayu Ukir Artistik Kuat',
    foliageType: 'Dedaunan Menjuntai Lembut Disertai 400 Titik Lampu LED',
    stockTotal: 3,
    stockAvailable: 2,
    stockRented: 1,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/hero_wedding_tree_decor_1792371617920.jpg',
    description: 'Pohon dahan menjuntai ala pohon dedalu dongeng malam dengan ribuan rumbai berhiaskan lampu warm white lembut. Menghadirkan atmosfer malam yang syahdu, glamor, dan spektakuler bagi resepsi wedding malam.',
    highlights: [
      'Sudah built-in kabel instalasi lampu warm-white low voltage aman',
      'Efek cahaya gemerlap menciptakan latar foto video yang magis',
      'Juntaian helai daun lembut bergoyang anggun tertiup angin/AC',
      'Termasuk adaptor colokan listrik tinggal tancap'
    ],
    recommendedFor: [
      'Resepsi Pernikahan Malam (Night Reception)',
      'Spot Utama Photobooth Bintang Glamour',
      'Grand Entrance Gate Karpet Merah Tamu VIP'
    ],
    includedAccessories: ['Adaptor Listrik 12V Aman', 'Dimmer Kontrol Cahaya', 'Kabel Sambung 10 Meter'],
    featured: true
  },
  {
    id: 'phn-007',
    code: 'PHN-007',
    name: 'Pohon Cemara Pinus Nordic Rustic (Winter Forest)',
    category: 'Pohon Karakter',
    height: '2.4 - 2.7 Meter',
    widthSpread: '1.5 Meter',
    trunkType: 'Batang Kayu Keras Asli dengan Kulit Kayu Berserat',
    foliageType: 'Jarum Cemara Tebal Dark Green Realistis',
    stockTotal: 4,
    stockAvailable: 4,
    stockRented: 0,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_maple_red_autumn_1792371618899.jpg',
    description: 'Pohon pinus hutan Nordic dengan jarum lebat dan tekstur kulit kayu autentik. Pilihan nomor satu untuk pesta pernikahan konsep hutan pinus pinewood, rustic mountain, natal, dan peluncuran produk akhir tahun.',
    highlights: [
      'Bentuk piramida kerucut simetris rapi dan rimbun',
      'Bahan jarum PE ramah lingkungan tidak mudah gepeng',
      'Bisa dihiasi bola ornamen kristal atau lampu kawat tembaga',
      'Cocok dipadukan dengan karpet lumut dan kayu log silinder'
    ],
    recommendedFor: [
      'Pernikahan Tema Hutan Hujan / Pine Forest Wedding',
      'Event Akhir Tahun, Natal & Tahun Baru',
      'Photocorner Suasana Alam Pegunungan'
    ],
    includedAccessories: ['Standing Tripod Besi Kuat', 'Cover Karung Goni Vintage'],
    featured: false
  },
  {
    id: 'prop-001',
    code: 'PRP-101',
    name: 'Standing Flower Besi Minimalis Gold (1 Pasang)',
    category: 'Properti & Bunga',
    height: '1.2 - 1.5 Meter',
    widthSpread: '40 x 40 cm',
    trunkType: 'Besi Hollow Kokoh Cat Oven Gold Powder-Coated',
    foliageType: 'Termasuk Rangkaian Bunga Mawar & Daun Monstera',
    stockTotal: 12,
    stockAvailable: 9,
    stockRented: 3,
    status: 'Tersedia',
    imageUrl: '/src/assets/images/tree_white_ficus_wedding_1792371618263.jpg',
    description: 'Standing pilar besi persegi elegan berbalut warna emas lembut anti karat. Disertai rangkaian bunga artificial mawar putih dan peony yang rimbun sebagai aksen pelengkap samping pohon dekorasi.',
    highlights: [
      'Cat oven gold mewah anti gores dan tidak memantulkan silau kasar',
      'Dapat ditempatkan sebagai penanda jalan masuk red carpet',
      'Kombinasi fleksibel dengan semua jenis pohon artifisial'
    ],
    recommendedFor: [
      'Aksen Lorong Jalan Pengantin Menuju Pelaminan',
      'Pengapit Meja Resepsi Buku Tamu',
      'Aksen Samping Pohon Dekorasi Utama'
    ],
    includedAccessories: ['1 Pasang Standing (2 Unit)', 'Busa Oase Bunga', 'Cover Bawah'],
    featured: false
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'Hasan Dekor Pohon',
  tagline: 'Penyewaan Pohon Artifisial Raksasa & Tanaman Dekorasi Pelaminan',
  whatsappNumber: '628119500890',
  displayPhone: '+62 811-9500-890',
  email: 'hasandekorpohon@gmail.com',
  workshopAddress: 'Jalan Pangeran Tubagus Angke No. 74 Jakarta 11330',
  openingHours: 'Senin - Minggu: 07.30 - 21.00 WIB (Fast Response 24 Jam via WhatsApp)'
};
