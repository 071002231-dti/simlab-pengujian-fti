
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../services/database'; // Import DataService
import { DASHBOARD_STATS } from '../constants';
import { StatusBadge } from '../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Activity, CheckCircle, AlertCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { User, UserRole, TestRequest } from '../types';

interface DashboardProps {
  user: User;
}

const iconMap: any = {
  'FileText': FileText,
  'Activity': Activity,
  'CheckCircle': CheckCircle,
  'AlertCircle': AlertCircle
};

const chartData = [
  { name: 'Tekstil', requests: 45, color: '#0054a6' },
  { name: 'Kimia', requests: 32, color: '#fdb913' },
  { name: 'Forensik', requests: 18, color: '#10b981' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const navigate = useNavigate();
  
  // State untuk data dinamis
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DataService.getRequests();
        setRequests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Recent Requests
  // Laboran hanya melihat request dari Lab-nya sendiri
  const recentRequests = requests.filter(req => {
    if (user.role === UserRole.CUSTOMER) return req.userId === user.id;
    if (user.role === UserRole.LABORAN) return req.labId === user.labId;
    return true; // Admin sees all
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, {user.name}</h2>
          <p className="text-slate-500">Ringkasan aktivitas lab hari ini.</p>
        </div>
        <span className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border self-start md:self-auto">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_STATS.map((stat, idx) => {
          const Icon = iconMap[stat.iconName] || FileText;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${idx === 0 ? 'bg-blue-50 text-blue-600' : idx === 1 ? 'bg-purple-50 text-purple-600' : idx === 2 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layout Grid: Jika Admin 3 kolom (2 chart + 1 list), jika bukan Admin 1 kolom full width */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        {/* Chart Section - HANYA UNTUK ADMIN */}
        {isAdmin && (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Permintaan per Lab</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="requests" radius={[4, 4, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Permintaan Terbaru</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {isLoading ? (
               <div className="flex items-center justify-center h-full text-slate-400">
                  <Loader2 className="animate-spin mr-2" /> Memuat...
               </div>
            ) : recentRequests.length > 0 ? (
              recentRequests.map((req) => (
              <div key={req.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="bg-slate-100 p-2 rounded-full mt-1">
                  <Clock size={16} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{req.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{req.customerName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-2">{req.labName}</p>
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))
           ) : (
              <div className="text-center text-slate-400 py-8">
                <p>Belum ada permintaan terbaru.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/requests')}
            className="mt-4 w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Lihat Semua <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
