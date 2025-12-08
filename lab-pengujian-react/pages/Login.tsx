
import React, { useState } from 'react';
import { User } from '../types';
import { AuthService } from '../services/database';
import { FlaskConical, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Loader2, X, Send } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'internal' | 'customer'>('internal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk Forgot Password
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleInternalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await AuthService.loginInternal(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const user = await AuthService.loginGoogle();
      onLogin(user);
    } catch (err) {
      setError('Gagal terhubung ke Google.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('sending');
    
    // Simulasi proses kirim email
    setTimeout(() => {
      setResetStatus('success');
      setTimeout(() => {
        setShowForgotPass(false);
        setResetStatus('idle');
        setResetEmail('');
      }, 3000); // Tutup modal otomatis setelah 3 detik
    }, 1500);
  };

  // Helper untuk mengisi form otomatis (untuk demo)
  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
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
              <span>Single Sign-On Staff UII</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-200 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
              <CheckCircle2 size={20} className="text-green-400" />
              <span>Google Auth untuk Customer</span>
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
            <p className="text-slate-500">Silakan masuk untuk mengakses layanan laboratorium.</p>
          </div>

          {/* Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-8">
            <button
              onClick={() => setActiveTab('internal')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'internal' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Staff & Admin UII
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'customer' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Customer / Umum
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {activeTab === 'internal' ? (
            <form onSubmit={handleInternalLogin} className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Institusi</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@uii.ac.id"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#0054a6] focus:ring-[#0054a6] accent-[#0054a6]" 
                  />
                  <span className="group-hover:text-slate-800 transition-colors">Ingat saya</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setShowForgotPass(true)} 
                  className="text-[#0054a6] font-medium hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-uii-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> Memproses...</>
                ) : (
                  <>Masuk Sistem <ArrowRight size={20} /></>
                )}
              </button>

              {/* Helper untuk Demo (Hanya visible saat development/demo) */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Quick Access (Demo Mode)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => fillCredentials('admin@uii.ac.id', 'admin')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border">Admin</button>
                  <button type="button" onClick={() => fillCredentials('laboran.tekstil@uii.ac.id', '123')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border">Laboran Tekstil</button>
                  <button type="button" onClick={() => fillCredentials('laboran.kimia@uii.ac.id', '123')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border">Laboran Kimia</button>
                  <button type="button" onClick={() => fillCredentials('laboran.forensik@uii.ac.id', '123')} className="text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 border">Laboran Forensik</button>
                </div>
              </div>

            </form>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-800 leading-relaxed">
                  Bagi pelanggan umum, mahasiswa luar, atau mitra industri, silakan gunakan akun Google Anda untuk mengakses dashboard tracking dan hasil uji.
                </p>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3 group"
              >
                 {isLoading ? (
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                ) : (
                  <>
                    {/* Google Icon SVG */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-slate-400 mt-8">
                Dengan masuk, Anda menyetujui <a href="#" className="underline hover:text-slate-600">Syarat & Ketentuan</a> Layanan Lab FTI UII.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowForgotPass(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-uii-blue mb-4 mx-auto">
                <Lock size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Lupa Password?</h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Masukkan alamat email institusi Anda. Kami akan mengirimkan link untuk mereset password.
              </p>

              {resetStatus === 'success' ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex flex-col items-center text-center animate-in fade-in">
                  <CheckCircle2 size={32} className="mb-2" />
                  <p className="font-medium">Email terkirim!</p>
                  <p className="text-xs mt-1">Silakan cek inbox atau folder spam Anda.</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Institusi</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="nama@uii.ac.id"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={resetStatus === 'sending' || !resetEmail}
                    className="w-full py-3 bg-uii-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {resetStatus === 'sending' ? (
                      <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
                    ) : (
                      <>Kirim Link Reset <Send size={18} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
            <div className="bg-slate-50 p-4 text-center border-t border-gray-100">
              <button 
                onClick={() => setShowForgotPass(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
