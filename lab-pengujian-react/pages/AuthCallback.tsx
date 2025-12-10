
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthService } from '../services/database';
import { User } from '../types';

interface AuthCallbackProps {
  onLogin: (user: User) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(decodeURIComponent(errorParam));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setStatus('error');
        setError('Token tidak ditemukan');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Store token
        localStorage.setItem('auth_token', token);

        // Fetch user data
        const user = await AuthService.getCurrentUser();

        setStatus('success');

        // Notify parent and redirect
        setTimeout(() => {
          onLogin(user);
          navigate('/');
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Gagal memproses login');
        localStorage.removeItem('auth_token');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-uii-blue mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Memproses Login</h2>
            <p className="text-slate-500">Mohon tunggu sebentar...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Login Berhasil!</h2>
            <p className="text-slate-500">Mengalihkan ke dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Login Gagal</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-slate-500 text-sm">Mengalihkan ke halaman login...</p>
          </>
        )}
      </div>
    </div>
  );
};
