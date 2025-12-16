
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from '../types';
import { AuthService } from '../services/database';
import { FlaskConical, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

// Google Client ID - will be set from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      return;
    }

    if (token) {
      handleTokenCallback(token);
    }
  }, [searchParams]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!(window as any).google) return;

    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
      }
    );
  };

  const handleGoogleCallback = async (response: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthService.loginWithGoogleToken(response.credential);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google');
      setIsLoading(false);
    }
  };

  const handleTokenCallback = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store token and fetch user data
      localStorage.setItem('auth_token', token);
      const user = await AuthService.getCurrentUser();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Token tidak valid');
      localStorage.removeItem('auth_token');
      setIsLoading(false);
    }
  };

  // Fallback Google login using popup/redirect
  const handleGoogleLoginFallback = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    // Remove trailing /api if present, then add /api/auth/google
    const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-5/12 bg-uii-blue relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 opacity-90"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 text-white">
          <div className="mb-8 inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
            <FlaskConical size={56} className="text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">Sistem Lab Pengujian <br/><span className="text-yellow-400">FTI UII</span></h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-md">
            Platform terpadu manajemen pengujian laboratorium.
            Mendukung Lab Tekstil, Teknik Kimia, dan Forensik Digital.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-blue-200 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
              <CheckCircle2 size={20} className="text-green-400" />
              <span>Login dengan akun Google</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-200 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
              <CheckCircle2 size={20} className="text-green-400" />
              <span>Staff, Admin & Customer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="max-w-md w-full">

          {/* Header Mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex p-3 bg-uii-blue rounded-xl text-white mb-4">
              <FlaskConical size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Lab Pengujian FTI UII</h2>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang</h2>
            <p className="text-slate-500">Silakan masuk dengan akun Google Anda untuk mengakses layanan laboratorium.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-uii-blue mb-4" />
              <p className="text-slate-500">Memproses login...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-800 leading-relaxed text-center">
                  Gunakan akun Google yang terdaftar di sistem untuk masuk.
                  <br />
                  <span className="text-xs text-blue-600 mt-1 block">Staff UII gunakan email @uii.ac.id</span>
                </p>
              </div>

              {/* Google Sign-In Button Container */}
              <div id="google-signin-button" className="flex justify-center"></div>

              {/* Fallback button if Google script doesn't load */}
              {!GOOGLE_CLIENT_ID && (
                <button
                  onClick={handleGoogleLoginFallback}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}

              <p className="text-xs text-slate-400 text-center">
                Dengan masuk, Anda menyetujui <a href="#" className="underline hover:text-slate-600">Syarat & Ketentuan</a> Layanan Lab FTI UII.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
