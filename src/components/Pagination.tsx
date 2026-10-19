import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize = 12,
  onPageChange,
  itemName = 'data'
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize && currentPage === 1) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 rounded-b-2xl">
        <div>
          Menampilkan <span className="font-semibold text-slate-700">{startItem}-{endItem}</span> dari <span className="font-semibold text-slate-700">{totalItems}</span> {itemName} (Maks. 12 per halaman)
        </div>
        <div className="text-[11px] text-slate-400">Halaman 1 dari 1</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 rounded-b-2xl">
      <div>
        Menampilkan <span className="font-semibold text-slate-700">{startItem}-{endItem}</span> dari <span className="font-semibold text-slate-700">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Sebelumnya</span>
        </button>
        <div className="px-3 py-1 font-semibold text-slate-700 bg-teal-50 border border-teal-200 rounded-lg text-teal-800">
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
};
