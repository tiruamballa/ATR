import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    // Presetted demo email and password from seeding
    const res = await login('demo@atr.com', 'password123');
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError('Demo login failed. Make sure DB is running and seeded.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1D] px-4 relative overflow-hidden select-none">
      {/* Decorative Neon Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white font-extrabold text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-3">
            A
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            ATR Roadmap
          </h2>
          <p className="text-sm text-gray-400 mt-1.5">
            Placement Preparation Roadmap Tracker • B.Tech IT
          </p>
        </div>

        {/* Card Panel */}
        <div className="rounded-2xl border border-white/10 bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl glass-panel relative overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-5 flex items-center">
            <ShieldCheck className="text-cyan-400 mr-2" size={20} />
            Sign In to your account
          </h3>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm flex items-start">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-10 glass-input"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 glass-input"
                />
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111827]/90 px-3 text-gray-500 font-semibold">Or Evaluate Quick</span>
            </div>
          </div>

          {/* Fast Demo Login button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 font-bold text-sm shadow-inner transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            🚀 Launch Demo Account
          </button>
        </div>

        {/* Footer redirect */}
        <p className="text-center text-xs text-gray-400 mt-6 select-none">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Register for Free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
