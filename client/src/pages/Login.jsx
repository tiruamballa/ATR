import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    setLoading(true);

    const res = await login(password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorText(res.message || 'Invalid passcode. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 relative overflow-hidden">
      <div className="w-full max-w-sm bg-[#1E293B] border border-white/5 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold font-display text-white tracking-widest">
            ATR
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-body tracking-wider font-semibold">
            Tiru Amballa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              ACCESS PASSCODE
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-[#0F172A] text-white font-mono text-center text-lg tracking-[0.25em] focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorText && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-mono text-center">
              {errorText}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10"
          >
            {loading ? 'VERIFYING...' : 'INITIATE ACCESS'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
