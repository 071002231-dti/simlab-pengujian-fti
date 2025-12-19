
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, Settings, FlaskConical, X, ClipboardList } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  userRole: UserRole;
  onLogout?: () => void; // Optional, tidak digunakan lagi di sidebar
  isOpen: boolean; // Prop untuk status mobile
  onClose: () => void; // Fungsi tutup untuk mobile
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'bg-uii-blue text-white shadow-md' 
      : 'text-slate-600 hover:bg-blue-50 hover:text-uii-blue';
  };

  // Fungsi wrapper untuk menutup sidebar saat link diklik (khusus mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) { // 1024px is lg breakpoint
      onClose();
    }
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Header Sidebar */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-uii-blue rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">Lab FTI UII</h1>
            <p className="text-xs text-slate-500">Sistem Pengujian</p>
          </div>
        </div>
        {/* Close Button (Mobile Only) */}
        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
          
          <Link to="/dashboard" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard')}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pengujian</p>
          
          {userRole === UserRole.CUSTOMER && (
            <Link to="/request/new" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/request/new')}`}>
              <PlusCircle size={18} />
              Buat Permintaan
            </Link>
          )}

          <Link to="/requests" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/requests')}`}>
            <List size={18} />
            Data Pengujian
          </Link>
        </div>

        {(userRole === UserRole.ADMIN || userRole === UserRole.LABORAN) && (
          <div>
             <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Manajemen</p>
            <Link to="/admin/procedure-templates" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/procedure-templates')}`}>
              <ClipboardList size={18} />
              Template Prosedur
            </Link>
            {userRole === UserRole.ADMIN && (
              <Link to="/settings" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/settings')}`}>
                <Settings size={18} />
                Pengaturan Lab
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Footer Sidebar - Version Info */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-center text-xs text-slate-400">
          <p>SimLab FTI UII</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};
