
import React, { useState, useRef, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { NewRequest } from './pages/NewRequest';
import { RequestList } from './pages/RequestList';
import { RequestDetail } from './pages/RequestDetail';
import { ProcedureTemplates } from './pages/admin/ProcedureTemplates';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { AuthService } from './services/database';
import { UserRole, User } from './types';
import { Bell, Check, Info, AlertTriangle, Menu, LogOut, ChevronDown } from 'lucide-react';
import { LABS } from './constants';

// Mock Data Notifikasi (Updated with userId and labId)
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    userId: null, // General notification for the lab team
    labId: 1, // LAB TEKSTIL ONLY
    title: 'Permintaan Baru Masuk',
    message: 'PT. Tekstil Maju Jaya mengirimkan sampel baru.',
    time: '5 menit yang lalu',
    type: 'info',
    read: false,
  },
  {
    id: 2,
    userId: 999, // SPECIFIC CUSTOMER (Budi)
    labId: null,
    title: 'Hasil Uji Selesai',
    message: 'Pengujian REQ-202511-005 telah divalidasi.',
    time: '1 jam yang lalu',
    type: 'success',
    read: false,
  },
  {
    id: 3,
    userId: 999, // SPECIFIC CUSTOMER (Budi)
    labId: null,
    title: 'Status Berubah',
    message: 'Sampel REQ-202511-004 telah diterima lab.',
    time: 'Kemarin',
    type: 'info',
    read: true,
  },
  {
    id: 4,
    userId: null, 
    labId: 2, // LAB KIMIA ONLY
    title: 'Peringatan Expired',
    message: 'Sampel #SMP-998 (Tanah Liat) akan kadaluarsa besok.',
    time: 'Kemarin',
    type: 'warning',
    read: true,
  },
  {
    id: 5,
    userId: null,
    labId: 3, // LAB FORENSIK ONLY
    title: 'Barang Bukti Diterima',
    message: 'Harddisk WD Blue (REQ-006) siap untuk imaging.',
    time: '2 jam yang lalu',
    type: 'info',
    read: false,
  },
  {
    id: 6,
    userId: null,
    labId: 1, // LAB TEKSTIL ONLY
    title: 'Kalibrasi Alat',
    message: 'Alat uji tarik benang perlu kalibrasi mingguan.',
    time: 'Hari ini',
    type: 'warning',
    read: false,
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk Mobile Sidebar
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside notification and user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef, userMenuRef]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, []);

  // Updated Login Handler to receive full User object from Auth Service
  const handleLogin = (userData: User) => {
    setUser(userData);
    // In a real app, you would store the auth token in localStorage here
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsSidebarOpen(false);
  };

  // Check for auth callback or login routes
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  // FILTER NOTIFICATIONS BASED ON ROLE & LAB ID
  const userNotifications = MOCK_NOTIFICATIONS.filter(n => {
    // 1. CUSTOMER: Hanya melihat notifikasi miliknya sendiri (berdasarkan userId)
    if (user.role === UserRole.CUSTOMER) {
      return n.userId === user.id;
    }

    // 2. LABORAN:
    // - Melihat notifikasi yang ditujukan ke Lab mereka (labId match)
    // - ATAU notifikasi personal (userId match)
    if (user.role === UserRole.LABORAN) {
      return n.labId === user.labId || n.userId === user.id;
    }

    // 3. ADMIN:
    // - Melihat semua notifikasi operasional Lab (yang punya labId)
    // - Melihat notifikasi personal admin (jika ada)
    if (user.role === UserRole.ADMIN) {
      return n.labId !== null || n.userId === user.id;
    }

    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          userRole={user.role} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-8 w-full transition-all duration-300">
          {/* Top Header */}
          <header className="flex justify-between lg:justify-end items-center mb-6 md:mb-8 relative z-20">
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100 lg:hidden text-slate-600"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-3 md:gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`relative p-2 rounded-full border transition-colors ${isNotifOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-slate-600'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-semibold text-slate-800 text-sm">Notifikasi</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} Baru</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {userNotifications.length > 0 ? userNotifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`mt-1 p-1.5 rounded-full h-fit ${
                              notif.type === 'success' ? 'bg-green-100 text-green-600' :
                              notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notif.type === 'success' ? <Check size={14} /> :
                               notif.type === 'warning' ? <AlertTriangle size={14} /> :
                               <Info size={14} />}
                            </div>
                            <div>
                              <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">
                                {notif.time}
                              </p>
                            </div>
                            {!notif.read && (
                              <div className="absolute right-4 top-5 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-slate-400 text-sm">Tidak ada notifikasi.</div>
                      )}
                    </div>
                    <div className="p-2 text-center border-t border-gray-50 bg-slate-50/50">
                      <button className="text-xs font-medium text-blue-600 hover:text-blue-800 py-1">
                        Tandai semua sudah dibaca
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile with Dropdown */}
              <div className="relative pl-4 border-l border-gray-200" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-3 p-1.5 rounded-lg transition-colors ${isUserMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                       {user.role.replace('_', ' ')}
                       {user.labId && ` - ${LABS.find(l => l.id === user.labId)?.code}`}
                    </p>
                  </div>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 shadow-md object-cover" />
                  ) : (
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm md:text-base">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <ChevronDown size={16} className={`text-slate-400 hidden md:block transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50">
                    {/* User Info (Mobile) */}
                    <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">
                        {user.role.replace('_', ' ')}
                        {user.labId && ` - ${LABS.find(l => l.id === user.labId)?.code}`}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-left"
                      >
                        <LogOut size={18} />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/request/new" element={<NewRequest user={user} />} />
            <Route path="/requests" element={<RequestList user={user} />} />
            <Route path="/requests/:id" element={<RequestDetail user={user} />} />
            <Route path="/admin/procedure-templates" element={<ProcedureTemplates user={user} />} />
            <Route path="/settings" element={<div className="text-slate-500">Halaman Pengaturan (Coming Soon)</div>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
