import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, LogIn, Shield, Server, Database, CheckCircle, AlertCircle } from 'lucide-react';

const stages = [
  { icon: Shield, label: 'Verifying credentials…' },
  { icon: Server, label: 'Connecting to UPIS Secure Server…' },
  { icon: Database, label: 'Loading branch data…' },
];

export default function Login() {
  const [email, setEmail] = useState('admin@upislounge.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStage, setCurrentStage] = useState(-1);
  const [done, setDone] = useState(false);
  const { setIsLoggedIn } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setCurrentStage(0);

    setTimeout(() => setCurrentStage(1), 600);
    setTimeout(() => setCurrentStage(2), 1400);

    try {
      const res = await authAPI.login(email, password);
      const { access, refresh } = res.data;
      setTimeout(() => {
        setDone(true);
        setTimeout(() => {
          setIsLoggedIn(access, refresh);
          navigate('/dashboard', { replace: true });
        }, 500);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid credentials. Please try again.'
      );
      setLoading(false);
      setCurrentStage(-1);
      setDone(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-gradient" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 mb-4 shadow-lg shadow-gold-500/20 animate-pulseGlow">
            <span className="text-2xl font-bold text-black">UL</span>
          </div>
          <h1 className="text-2xl font-bold text-white">UPIS Lounge System</h1>
          <p className="text-gray-500 text-sm mt-1">Stock Management & POS</p>
        </div>

        {!loading ? (
          <form onSubmit={handleSubmit} className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white mb-6">Welcome Back</h2>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-700/80 border border-dark-400/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-700/80 border border-dark-400/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-2.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-amber-500 text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              Sign In
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Demo: admin@upislounge.com / admin123
            </p>
          </form>
        ) : (
          <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-400/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col items-center gap-5">
              {done ? (
                <div className="flex flex-col items-center gap-3 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle size={28} className="text-green-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">Access Granted</p>
                  <p className="text-xs text-gray-500">Redirecting to dashboard…</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
                  <div className="space-y-3 w-full">
                    {stages.map((s, i) => (
                      <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${currentStage >= i ? 'opacity-100' : 'opacity-30'}`}>
                        <s.icon size={16} className={currentStage > i ? 'text-green-400' : currentStage === i ? 'text-gold-400' : 'text-gray-600'} />
                        <span className={`text-sm ${currentStage > i ? 'text-green-400' : currentStage === i ? 'text-white' : 'text-gray-600'}`}>
                          {s.label}
                        </span>
                        {currentStage > i && <CheckCircle size={14} className="ml-auto text-green-400" />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
