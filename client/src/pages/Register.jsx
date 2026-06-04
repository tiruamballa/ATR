import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertTriangle, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import ThreeDLogo from '../components/ThreeDLogo';
import CyberButton from '../components/CyberButton';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Try using another email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden select-none z-10">
      
      {/* Decorative Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,212,0.012) 2px, rgba(0,245,212,0.012) 4px)',
          zIndex: 2
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-20"
      >
        {/* Card Panel */}
        <div
          className="rounded-2xl border border-cyber-cyan/30 bg-[#0D111A]/85 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden"
          style={{ boxShadow: 'var(--glow-cyan)' }}
        >
          {/* HUD Corner Trim Accents */}
          {[{ top: 0, left: 0, w: '28px', h: '3px' },
            { top: 0, left: 0, w: '3px', h: '28px' },
            { bottom: 0, right: 0, w: '28px', h: '3px' },
            { bottom: 0, right: 0, w: '3px', h: '28px' }
          ].map((s, i) => (
            <div
              key={i}
              className="absolute bg-cyber-cyan"
              style={{
                top: s.top,
                left: s.left,
                bottom: s.bottom,
                right: s.right,
                width: s.w,
                height: s.h,
                borderRadius: '2px',
                zIndex: 3
              }}
            />
          ))}

          {/* Branding header */}
          <div className="text-center mb-6 relative z-10 flex flex-col items-center">
            <div className="mb-4">
              <ThreeDLogo size={70} />
            </div>
            <div className="font-mono text-[9px] text-slate-500 tracking-[0.25em] mb-2 uppercase">
              ░░ AGENT REGISTRATION ░░
            </div>
            <h1 className="text-2xl font-black tracking-widest text-cyber-cyan text-shadow-[0_0_15px_rgba(0,245,212,0.6)] font-display">
              CREATE ACCOUNT
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-body">
              Academic & Technical Roadmap Tracker • B.Tech IT
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono flex items-start">
              <AlertTriangle size={14} className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-9 glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Register button */}
            <CyberButton
              type="submit"
              variant="cyan"
              disabled={loading}
              className="w-full py-3.5 font-bold text-xs mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
            </CyberButton>
          </form>
        </div>

        {/* Footer redirect */}
        <p className="text-center text-[10px] text-slate-500 mt-6 select-none font-mono tracking-wider">
          ALREADY SECURED ACCESS?{' '}
          <Link to="/login" className="text-cyber-cyan hover:underline font-bold">
            SIGN IN HERE
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
