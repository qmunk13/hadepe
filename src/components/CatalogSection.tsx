import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Eye, SlidersHorizontal } from 'lucide-react';
import { ProductItem, StoreSettings } from '../types';

interface CatalogSectionProps {
  products: ProductItem[];
  settings: StoreSettings;
  onOpenReservationWithProduct: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onZoomImage: (imageUrl: string, title: string) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  settings,
  onOpenReservationWithProduct,
  onSelectProduct,
  onZoomImage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE_ONLY'>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'NAME_ASC' | 'HEIGHT'>('FEATURED');

  const categories = ['SEMUA', 'Pohon Besar', 'Pohon Sedang', 'Pohon Karakter', 'Tanaman Tropis', 'Properti & Bunga'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'SEMUA' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAvailability =
        availabilityFilter === 'ALL' || (availabilityFilter === 'AVAILABLE_ONLY' && p.stockAvailable > 0);
      return matchCategory && matchSearch && matchAvailability;
    }).sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'HEIGHT') return b.height.localeCompare(a.height);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, availabilityFilter, sortBy]);

  return (
    <section id="katalog" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-teal-800 font-bold mb-1">
              Koleksi Eksklusif Hasan Dekor
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Katalog Pohon Artifisial & Tanaman Dekorasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Semua unit dirawat higienis, berstruktur kokoh dengan batang kayu alami pilihan. Pilih pohon dekorasi favorit Anda untuk reservasi pemesanan via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-800 tabular-nums">{filteredProducts.length}</span> dari <span className="font-bold text-slate-800 tabular-nums">{products.length}</span> koleksi
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          
          {/* Row 1: Search & Sort Options */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari maple, sakura, beringin, tinggi 3 meter, kode..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-600"
              >
                <option value="FEATURED">Koleksi Pilihan (Featured)</option>
                <option value="NAME_ASC">Nama Koleksi (A - Z)</option>
                <option value="HEIGHT">Dimensi Tinggi Pohon</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-600"
              >
                <option value="ALL">Semua Ketersediaan</option>
                <option value="AVAILABLE_ONLY">Hanya Siap Sewa (Ready)</option>
              </select>
            </div>

          </div>

          {/* Row 2: Category Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" /> Kategori:
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {cat === 'SEMUA' ? 'Semua Koleksi' : cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Tidak ada pohon yang cocok</h3>
            <p className="text-xs text-slate-500 mt-1">
              Coba gunakan kata kunci pencarian yang berbeda atau pilih kategori "Semua Koleksi".
            </p>
            <button
              onClick={() => {
                setSelectedCategory('SEMUA');
                setSearchQuery('');
                setAvailabilityFilter('ALL');
              }}
              className="mt-5 px-4 py-2 bg-teal-800 text-white text-xs font-semibold rounded-xl hover:bg-teal-900 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const isAvailable = product.stockAvailable > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Image Container */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => onSelectProduct(product)}
                      />

                      {/* Top Action Overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onZoomImage(product.imageUrl, product.name);
                          }}
                          title="Zoom Foto Detail"
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-teal-900 hover:bg-white flex items-center justify-center shadow-sm transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stock availability indicator tag */}
                      <div className="absolute bottom-3 left-3">
                        <span
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md shadow-xs ${
                            isAvailable
                              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                              : 'bg-rose-950/80 text-rose-200 border border-rose-500/40'
                          }`}
                        >
                          {isAvailable ? `Siap Sewa (${product.stockAvailable} Unit)` : 'Sedang Dibooking Penuh'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-5 sm:p-6 space-y-3">
                      
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="font-mono font-bold text-teal-800">{product.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-700 font-semibold">{product.height}</span>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-serif font-bold text-slate-900 text-lg sm:text-xl line-clamp-1 group-hover:text-teal-900 transition-colors cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                        <span className="text-slate-500">Bentang: <strong className="text-slate-800">{product.widthSpread}</strong></span>
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="text-xs font-semibold text-teal-800 hover:text-teal-900 hover:underline"
                        >
                          Lihat Spesifikasi &rarr;
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Card Bottom CTA Actions (No Price, Direct WhatsApp Booking) */}
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                    <button
                      onClick={() => onOpenReservationWithProduct(product)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Pesan / Reservasi via WhatsApp</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
