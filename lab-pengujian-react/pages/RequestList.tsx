
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LABS } from '../constants';
import { DataService, AuthService } from '../services/database';
import { StatusBadge } from '../components/StatusBadge';
import { RequestStatus, User, UserRole, TestRequest } from '../types';
import { Search, Filter, Download, FileSpreadsheet, FileText, ChevronDown, X, Eye, Calendar, FlaskConical, Loader2, CheckCircle, Play, Send, PackageCheck, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { exportToExcel, exportToPdf, downloadReportPdf } from '../utils/exportUtils';

interface RequestListProps {
  user: User;
}

export const RequestList: React.FC<RequestListProps> = ({ user }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // State untuk download PDF

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');

  // Fetch Data Function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await DataService.getRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Data on Mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdownRef, filterDropdownRef]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'excel' | 'pdf') => {
    setIsExportOpen(false);
    setIsExporting(true);

    try {
      if (type === 'excel') {
        const filename = exportToExcel(filteredRequests);
        alert(`File ${filename} berhasil diunduh!`);
      } else {
        const filename = await exportToPdf(filteredRequests);
        alert(`File ${filename} berhasil diunduh!`);
      }
    } catch (error: any) {
      alert(`Gagal mengunduh file: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // --- Handle Download PDF Single ---
  const handleDownloadPDF = async () => {
    if (!selectedRequest) return;
    setIsDownloading(true);

    try {
      const filename = await downloadReportPdf(selectedRequest.id);
      alert(`File ${filename} berhasil diunduh!`);
    } catch (error: any) {
      alert(`Gagal mengunduh laporan: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Handle Update Status ---
  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    if (!selectedRequest) return;
    setIsUpdating(true);
    try {
      await DataService.updateRequestStatus(selectedRequest.id, newStatus);
      
      // Update local state agar UI langsung berubah
      const updatedRequest = { ...selectedRequest, status: newStatus };
      setSelectedRequest(updatedRequest);
      
      // Update list utama
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      
      // LOGIKA NOTIFIKASI
      if (newStatus === RequestStatus.DELIVERED) {
        const customerEmail = AuthService.getCustomerEmail(selectedRequest.userId);
        setTimeout(() => {
          alert(`VALIDASI SUKSES!\n\nHasil uji telah dikirim otomatis ke email customer:\n${customerEmail}\n\nSertifikat Digital telah diterbitkan.`);
        }, 500);
      } else if (newStatus === RequestStatus.APPROVED) {
        alert('Permintaan disetujui. Laboran sekarang dapat memproses sampel.');
      } else {
        alert(`Status berhasil diperbarui menjadi: ${newStatus}`);
      }

    } catch (error) {
      alert('Gagal memperbarui status');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Logic Pemfilteran ---
  const filteredRequests = requests.filter((req) => {
    // 1. Filter berdasarkan Lab User (Jika user adalah Laboran)
    if (user.role === UserRole.LABORAN && user.labId) {
      if (req.labId !== user.labId) return false;
    }

    // 2. Filter Khusus Customer (Hanya lihat data miliknya)
    if (user.role === UserRole.CUSTOMER) {
        if (req.userId !== user.id) return false;
    }

    // 3. Filter berdasarkan Search Query (No Request, Customer, atau Tipe Uji)
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      req.id.toLowerCase().includes(query) ||
      req.customerName.toLowerCase().includes(query) ||
      req.testType.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;

    // 4. Filter berdasarkan Status Dropdown
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  // Helper to get Lab Name if user is admin (since filtered data might mix labs)
  const showLabName = !user.labId;

  // --- RENDER ACTION BUTTONS DALAM MODAL ---
  const renderActionButtons = () => {
    if (!selectedRequest || user.role === UserRole.CUSTOMER) return null;

    const { status } = selectedRequest;
    const isAdmin = user.role === UserRole.ADMIN;
    const isLaboran = user.role === UserRole.LABORAN;

    // 1. PENDING -> APPROVED (KHUSUS ADMIN)
    if (status === RequestStatus.PENDING) {
      if (isAdmin) {
        return (
          <button 
            onClick={() => handleStatusUpdate(RequestStatus.APPROVED)}
            disabled={isUpdating}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Setujui Permintaan
          </button>
        );
      } else if (isLaboran) {
        return (
          <div className="text-sm text-slate-500 italic bg-slate-100 px-3 py-2 rounded-lg flex items-center gap-2 border border-slate-200">
            <Lock size={16} className="text-slate-400" />
            Menunggu persetujuan Kepala Lab
          </div>
        );
      }
    }

    // 2. APPROVED -> RECEIVED (LABORAN / ADMIN)
    if (status === RequestStatus.APPROVED && (isLaboran || isAdmin)) {
      return (
        <button 
          onClick={() => handleStatusUpdate(RequestStatus.RECEIVED)}
          disabled={isUpdating}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
          Terima Sampel Fisik
        </button>
      );
    }

    // 3. RECEIVED -> IN_PROGRESS (LABORAN / ADMIN)
    if (status === RequestStatus.RECEIVED && (isLaboran || isAdmin)) {
      return (
        <button 
          onClick={() => handleStatusUpdate(RequestStatus.IN_PROGRESS)}
          disabled={isUpdating}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm flex items-center justify-center gap-2"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          Mulai Pengujian
        </button>
      );
    }

    // 4. IN_PROGRESS -> COMPLETED (LABORAN / ADMIN)
    if (status === RequestStatus.IN_PROGRESS && (isLaboran || isAdmin)) {
      return (
        <button 
          onClick={() => handleStatusUpdate(RequestStatus.COMPLETED)}
          disabled={isUpdating}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm flex items-center justify-center gap-2"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Selesai Uji & Input Data
        </button>
      );
    }

    // 5. COMPLETED -> DELIVERED (KHUSUS ADMIN - VALIDASI)
    if (status === RequestStatus.COMPLETED) {
      if (isAdmin) {
        return (
          <button 
            onClick={() => handleStatusUpdate(RequestStatus.DELIVERED)}
            disabled={isUpdating}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-sm flex items-center justify-center gap-2"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Validasi & Kirim Hasil
          </button>
        );
      } else if (isLaboran) {
        return (
           <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-orange-100">
            <Lock size={16} />
            Menunggu Validasi & Kirim oleh Admin
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col relative">
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data Pengujian</h2>
          <p className="text-sm text-slate-500">
            {user.role === UserRole.CUSTOMER 
              ? 'Daftar riwayat permintaan pengujian Anda.'
              : user.labId 
                ? `Daftar permintaan untuk ${LABS.find(l => l.id === user.labId)?.name}`
                : 'Daftar seluruh permintaan uji lab.'
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Search Input - Updated Styling */}
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Request / Jenis Uji..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/50 rounded-full p-0.5">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2.5 border rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto ${
                  statusFilter !== 'ALL' || isFilterOpen ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-slate-600 bg-white'
                }`}
                title="Filter Status"
              >
                <Filter size={18} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-0 md:left-auto md:right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden p-2">
                  <div className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1">Filter Status</div>
                  <button 
                    onClick={() => { setStatusFilter('ALL'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${statusFilter === 'ALL' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-slate-700'}`}
                  >
                    Semua Status
                  </button>
                  {Object.values(RequestStatus).map((status) => (
                    <button 
                      key={status}
                      onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${statusFilter === status ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-slate-700'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Export Dropdown */}
            <div className="relative flex-1 sm:flex-none" ref={exportDropdownRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                disabled={isExporting}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-uii-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${isExportOpen ? 'ring-2 ring-blue-300' : ''}`}
              >
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {isExporting ? 'Memproses...' : 'Export'}
                {!isExporting && <ChevronDown size={16} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />}
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    <button 
                      onClick={() => handleExport('excel')}
                      className="w-full px-4 py-3 text-sm text-slate-700 hover:bg-gray-50 hover:text-green-600 flex items-center gap-3 transition-colors text-left"
                    >
                      <div className="bg-green-100 p-1.5 rounded text-green-600">
                        <FileSpreadsheet size={16} />
                      </div>
                      <span>Export Excel (.xlsx)</span>
                    </button>
                    <button 
                      onClick={() => handleExport('pdf')}
                      className="w-full px-4 py-3 text-sm text-slate-700 hover:bg-gray-50 hover:text-red-600 flex items-center gap-3 transition-colors text-left border-t border-gray-50"
                    >
                      <div className="bg-red-100 p-1.5 rounded text-red-600">
                        <FileText size={16} />
                      </div>
                      <span>Export PDF (.pdf)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(statusFilter !== 'ALL' || searchQuery) && (
        <div className="px-4 md:px-6 pb-4 flex items-center gap-2 text-sm flex-wrap">
          <span className="text-slate-500">Filter aktif:</span>
          {searchQuery && (
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
              "{searchQuery}" <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {statusFilter !== 'ALL' && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
              Status: {statusFilter} <X size={12} className="cursor-pointer" onClick={() => setStatusFilter('ALL')} />
            </span>
          )}
          <button onClick={clearFilters} className="text-red-500 hover:underline ml-2 text-xs">Reset Filter</button>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">No. Request</th>
              {user.role !== UserRole.CUSTOMER && <th className="px-6 py-4">Customer</th>}
              <th className="px-6 py-4">Jenis Uji {showLabName ? '& Lab' : ''}</th>
              <th className="px-6 py-4">Tanggal Masuk</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <Loader2 className="mx-auto animate-spin mb-2" size={24} />
                  Memuat data...
                </td>
              </tr>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{req.id}</td>
                  {user.role !== UserRole.CUSTOMER && <td className="px-6 py-4 text-slate-600">{req.customerName}</td>}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-slate-800 font-medium">{req.testType}</span>
                      {showLabName && <span className="font-xs text-slate-500">{req.labName}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{req.dateSubmitted}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                    {req.expiryDate && (
                      <div className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                         Exp: {req.expiryDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedRequest(req)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide flex items-center gap-1 justify-end"
                    >
                      <Eye size={14} /> Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user.role === UserRole.CUSTOMER ? 5 : 6} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>Tidak ada data yang ditemukan.</p>
                    <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 gap-4">
        <span>Menampilkan {filteredRequests.length} dari {requests.length} data</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded bg-white disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50">Next</button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Detail Permintaan
                  <span className="text-sm font-normal text-slate-500 font-mono bg-white px-2 py-0.5 border rounded hidden sm:inline-block">{selectedRequest.id}</span>
                </h3>
                <p className="text-xs sm:hidden font-mono text-slate-500 mt-1">{selectedRequest.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status & Lab Info */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <FlaskConical size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Laboratorium</p>
                    <p className="font-medium text-slate-800">{selectedRequest.labName}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">Status Saat Ini</p>
                   <StatusBadge status={selectedRequest.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Nama Sampel</p>
                  <p className="font-medium text-slate-800 break-words">{selectedRequest.sampleName || '-'}</p>
                </div>
                <div>
                   <p className="text-sm text-slate-500 mb-1">Jenis Pengujian</p>
                   <p className="font-medium text-slate-800">{selectedRequest.testType}</p>
                </div>
                <div>
                   <p className="text-sm text-slate-500 mb-1">Tanggal Masuk</p>
                   <div className="flex items-center gap-2 text-slate-800">
                      <Calendar size={16} className="text-slate-400" />
                      {selectedRequest.dateSubmitted}
                   </div>
                </div>
                {selectedRequest.expiryDate && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Berlaku Hingga</p>
                    <p className="font-medium text-orange-600">{selectedRequest.expiryDate}</p>
                  </div>
                )}
              </div>

              <div>
                 <p className="text-sm text-slate-500 mb-1">Deskripsi / Catatan</p>
                 <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm leading-relaxed">
                   {selectedRequest.description || 'Tidak ada catatan tambahan.'}
                 </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Action Buttons Kiri (Untuk User Internal) */}
              <div className="w-full sm:w-auto flex gap-2">
                 {renderActionButtons()}
                 <button
                   onClick={() => {
                     setSelectedRequest(null);
                     navigate(`/requests/${selectedRequest.id}`);
                   }}
                   className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-uii-blue hover:bg-blue-50 border border-slate-200 rounded-lg transition-all flex items-center gap-2"
                 >
                   <ExternalLink size={16} />
                   <span className="hidden sm:inline">Halaman Detail</span>
                 </button>
              </div>

              {/* Tombol Standar Kanan */}
              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-800 border border-transparent hover:border-gray-200 rounded-lg transition-all"
                >
                  Tutup
                </button>
                {selectedRequest.status === RequestStatus.COMPLETED || selectedRequest.status === RequestStatus.DELIVERED ? (
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-uii-blue text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <><Loader2 size={16} className="animate-spin" /> Mengunduh...</>
                    ) : (
                      <><Download size={16} /> Download PDF</>
                    )}
                  </button>
                ) : user.role === UserRole.CUSTOMER ? (
                  <button disabled className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-slate-200 text-slate-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                    <Download size={16} /> Hasil Belum Tersedia
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
