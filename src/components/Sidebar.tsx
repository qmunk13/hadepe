import React, { useState } from 'react';
import { 
  TreePine, 
  LayoutDashboard, 
  Flower2, 
  ShoppingCart, 
  RotateCcw, 
  FileText, 
  Globe, 
  Code2, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Database,
  Users2,
  Truck,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  MessageSquare
} from 'lucide-react';
import { UserAccount } from '../types';
import { AppDataService } from '../services/api';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: UserAccount | null;
  onLogout: () => void;
  onOpenGasCode: () => void;
  onOpenPublicPortal: () => void;
  onOpenEditProfile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setTab,
  user,
  onLogout,
  onOpenGasCode,
  onOpenPublicPortal,
  onOpenEditProfile,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc?: string;
  }

  // Menu Operasional
  const operasionalItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard Metrik', icon: LayoutDashboard },
    { id: 'katalog', label: 'Katalog Pohon', icon: TreePine },
    { id: 'database', label: 'Database Barang', icon: Flower2 },
    { id: 'sewa', label: 'Keluar', icon: ShoppingCart },
    { id: 'kembali', label: 'Masuk', icon: RotateCcw },
    { id: 'riwayat', label: 'Laporan & Mutasi', icon: FileText }
  ];

  // Menu Master Data, Mitra & Rekap
  const masterMitraItems: NavItem[] = [
    { id: 'master_data', label: 'Master Data', icon: Database },
    { id: 'rekap_valuasi', label: 'Rekap Stok & Valuasi', icon: BarChart3 },
    { id: 'pelanggan', label: 'Pelanggan / WO', icon: Users2 },
    { id: 'supplier', label: 'Supplier & Vendor', icon: Truck },
    { id: 'users', label: 'Users Pengguna', icon: ShieldCheck },
    { id: 'pengaturan', label: 'Pengaturan Kontak', icon: MessageSquare }
  ];

  const handleNavClick = (tabId: string) => {
    setTab(tabId);
    setMobileOpen(false);
  };

  const allItems = [...operasionalItems, ...masterMitraItems];
  const activeItem = allItems.find(x => x.id === currentTab);

  return (
    <>
      {/* 1. TOP BAR KHUSUS HP / MOBILE (NO PRINT) */}
      <div className="no-print md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 h-14 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Buka Menu Samping"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => handleNavClick('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              🌿
            </div>
            <div className="min-w-0">
              <div className="font-serif font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate">HD-Pohon</div>
              <div className="text-[10px] text-teal-700 font-semibold tracking-wider uppercase truncate">
                {activeItem?.label || 'Gudang & Sewa'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenPublicPortal}
            title="Buka Portal Publik"
            className="px-2.5 py-1.5 text-emerald-800 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition cursor-pointer text-xs font-bold border border-emerald-200 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Portal</span>
          </button>
          <button
            onClick={onLogout}
            title="Keluar dari portal pengelola"
            className="px-2.5 py-1.5 text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition cursor-pointer text-xs font-bold border border-rose-200 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* 2. BACKDROP OVERLAY KHUSUS MOBILE DRAWER */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="no-print md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* 3. SIDEBAR SAMPING (RESPONSIF DESKTOP + COLLAPSIBLE + DRAWER HP) */}
      <aside 
        className={`no-print fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30 bg-white border-r border-slate-200 flex flex-col justify-between shadow-xl md:shadow-none transition-all duration-300 ease-in-out h-screen ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'}`}
      >
        {/* Bagian Atas: Brand & Tombol Pengecil Sidebar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer min-w-0" 
            onClick={() => handleNavClick('dashboard')}
            title="HD-Pohon"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0 font-bold text-lg">
              🌿
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-serif font-bold text-slate-900 text-sm leading-tight truncate">
                  HD-Pohon
                </div>
                <div className="text-[10px] font-semibold tracking-wider text-teal-700 uppercase truncate">
                  Gudang & Rental
                </div>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Perbesar Sidebar' : 'Kecilkan Sidebar'}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition cursor-pointer"
            >
              {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bagian Tengah: Menu Navigasi Samping */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          
          {/* Kelompok 1: Menu Operasional */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operasional
              </div>
            )}
            <div className="space-y-1">
              {operasionalItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full px-3 py-2 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className={`p-1.5 rounded-xl ${
                      isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-teal-700 group-hover:bg-teal-50'
                    } transition shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate">{item.label}</div>
                        {item.desc && (
                          <div className={`text-[10px] truncate ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    )}
                    {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kelompok 2: Master Data, Mitra & Rekap */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Master & Rekap
              </div>
            )}
            <div className="space-y-1">
              {masterMitraItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full px-3 py-2 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <div className={`p-1.5 rounded-xl ${
                      isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-teal-700 group-hover:bg-teal-50'
                    } transition shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate">{item.label}</div>
                        {item.desc && (
                          <div className={`text-[10px] truncate ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    )}
                    {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kelompok 3: Akses Cepat */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Akses Terhubung
              </div>
            )}
            <div className="space-y-1">
              {/* Tombol Portal Publik */}
              <button
                onClick={() => {
                  onOpenPublicPortal();
                  setMobileOpen(false);
                }}
                title={isCollapsed ? 'Portal Publik' : undefined}
                className={`w-full px-3 py-2 rounded-2xl text-left flex items-center gap-3 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 font-semibold transition cursor-pointer ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
              >
                <div className="p-1.5 rounded-xl bg-white text-emerald-700 shadow-2xs shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-emerald-900 font-bold">Buka Portal Publik</div>
                    <div className="text-[10px] text-emerald-700 font-normal truncate">Katalog visual & WA booking</div>
                  </div>
                )}
              </button>

              {/* Tombol Kode Apps Script */}
              <button
                onClick={() => {
                  onOpenGasCode();
                  setMobileOpen(false);
                }}
                title={isCollapsed ? 'Sinkronisasi Spreadsheet' : undefined}
                className={`w-full px-3 py-2.5 rounded-2xl text-left flex items-center gap-3 transition cursor-pointer border ${
                  AppDataService.getGasUrl() 
                    ? 'text-teal-900 bg-teal-50/80 hover:bg-teal-100 border-teal-200' 
                    : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-200'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <div className={`p-1.5 rounded-xl shadow-2xs shrink-0 ${
                  AppDataService.getGasUrl() ? 'bg-teal-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>Sinkronisasi Sheets</span>
                      <span className={`w-2 h-2 rounded-full ${
                        AppDataService.getGasUrl() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`} />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {AppDataService.getGasUrl() ? '🟢 Auto-Sync Aktif' : '⚠️ Mode Lokal (Atur URL)'}
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Informasi Pengguna & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className={`flex items-center justify-between gap-2 ${isCollapsed ? 'flex-col items-center' : ''}`}>
            <button
              onClick={() => {
                if (onOpenEditProfile) {
                  onOpenEditProfile();
                  setMobileOpen(false);
                }
              }}
              className={`flex items-center gap-2.5 min-w-0 text-left hover:bg-slate-200/70 p-1.5 -ml-1 rounded-2xl transition cursor-pointer group ${
                isCollapsed ? 'justify-center' : 'flex-1'
              }`}
              title="Klik untuk ubah Nama Lengkap & Profil (Tersinkron Spreadsheet)"
            >
              <div 
                className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs relative group-hover:bg-teal-200 transition"
              >
                <User className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Akun Aktif" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate flex items-center justify-between">
                    <span className="truncate">{user?.namaLengkap || 'Administrator'}</span>
                    <span className="text-[9px] bg-teal-100 text-teal-800 px-1 py-0.2 rounded font-mono font-semibold ml-1 shrink-0">Ubah</span>
                  </div>
                  <div className="text-[10px] font-semibold text-teal-700 uppercase flex items-center gap-1">
                    <span>{user?.role || 'ADMIN'}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-emerald-700 font-normal">Sinkron Sheets</span>
                  </div>
                </div>
              )}
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
              title="Keluar dari portal pengelola"
              className={`p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-semibold text-xs border border-rose-100 ${
                isCollapsed ? 'w-full' : ''
              }`}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 4. DOCK / BOTTOM NAVIGATION BAR KHUSUS MOBILE (NO PRINT) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-pb">
        <div className="grid grid-cols-6 items-center">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'katalog', label: 'Katalog', icon: TreePine },
            { id: 'database', label: 'Database', icon: Flower2 },
            { id: 'sewa', label: 'Keluar', icon: ShoppingCart },
            { id: 'kembali', label: 'Kembali', icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-teal-50 text-teal-700 scale-110 shadow-2xs' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate max-w-[50px]">
                  {tab.label}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-teal-600 mt-0.5" />}
              </button>
            );
          })}
          
          {/* Tombol Menu Lainnya */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-700 transition"
          >
            <div className="p-1 rounded-xl text-slate-500">
              <Menu className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate">
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
