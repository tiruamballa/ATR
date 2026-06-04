import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import ThreeDLogo from '../components/ThreeDLogo';
import CyberButton from '../components/CyberButton';

// Scanline visual effect
const Scanlines = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      borderRadius: '16px',
      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,212,0.012) 2px, rgba(0,245,212,0.012) 4px)',
      zIndex: 2
    }}
  />
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  // Redesign state
  const controls = useAnimation();
  const btnRef = useRef(null);
  const [flashRed, setFlashRed] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [meltdown, setMeltdown] = useState(false);
  const [alertBanner, setAlertBanner] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const triggerExplosion = () => {
    import('canvas-confetti').then(({ default: confetti }) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 90,
        startVelocity: 25,
        colors: ['#FF6B6B', '#FACC15', '#FF4444', '#FF8800'],
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        }
      });
    });
  };

  const handleWrongPassword = (errMsg) => {
    const count = failCount + 1;
    setFailCount(count);

    // 1. Flash screen red
    setFlashRed(true);
    setTimeout(() => setFlashRed(false), 220);

    // 2. Shake login card
    controls.start({
      x: [0, -18, 18, -14, 14, -8, 8, -4, 4, 0],
      transition: { duration: 0.55 }
    });

    // 3. Fire button explosion particles
    triggerExplosion();

    // 4. Typewriter error
    const msg = count >= 3
      ? 'INITIATING LOCKDOWN... JUST KIDDING. TRY AGAIN, AGENT.'
      : errMsg || 'ACCESS DENIED — IDENTITY NOT RECOGNIZED';
    
    setErrorText('');
    let i = 0;
    const timer = setInterval(() => {
      setErrorText(msg.slice(0, i + 1));
      i++;
      if (i >= msg.length) clearInterval(timer);
    }, 38);

    // 5. Alert banner
    setAlertBanner(true);
    setTimeout(() => setAlertBanner(false), 3500);

    // 6. Meltdown mode
    if (count >= 3) setMeltdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    setLoading(true);

    const res = await login(password);
    setLoading(false);

    if (res.success) {
      setUnlocking(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } else {
      handleWrongPassword(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden select-none z-10">
      
      {/* Red screen flash overlay */}
      {flashRed && (
        <div className="fixed inset-0 bg-red-500/10 z-50 pointer-events-none" />
      )}

      {/* Alert Banner */}
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: alertBanner ? 0 : -80 }}
        className="fixed top-0 left-0 right-0 z-50 bg-cyber-red/10 backdrop-blur-md border-b border-cyber-red/30 py-3 text-center text-xs font-mono tracking-wider text-cyber-red"
      >
        ⚠ UNAUTHORIZED ACCESS ATTEMPT LOGGED — SECURITY MONITORING ACTIVE
      </motion.div>

      {/* Vault door unlock transition on successful passcode verification */}
      {unlocking && (
        <div className="fixed inset-0 z-50 flex bg-black">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 bg-slate-900 border-r-2 border-cyber-cyan"
          />
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 bg-slate-900 border-l-2 border-cyber-cyan"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-cyber-cyan z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold mb-4 font-display"
            >
              ✓
            </motion.div>
            <div className="text-sm font-display tracking-widest uppercase">
              IDENTITY CONFIRMED — WELCOME BACK, AGENT
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card Panel */}
      <motion.div
        animate={controls}
        className="w-full max-w-md relative z-20"
      >
        <motion.div
          animate={meltdown ? { skewX: [0, 3, -3, 2, -2, 0], opacity: [1, 0.7, 1, 0.5, 1] } : {}}
          transition={meltdown ? { duration: 0.5, repeat: Infinity } : {}}
          className="rounded-2xl border border-cyber-cyan/30 bg-[#0D111A]/85 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden"
          style={{ boxShadow: 'var(--glow-cyan)' }}
        >
          <Scanlines />

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

          {/* Header Branding */}
          <div className="text-center mb-6 relative z-10 flex flex-col items-center">
            <div className="mb-4">
              <ThreeDLogo size={70} />
            </div>
            <div className="font-mono text-[9px] text-slate-500 tracking-[0.25em] mb-2 uppercase">
              ░░ IDENTITY VERIFICATION ░░
            </div>
            <h1 className="text-2xl font-black tracking-widest text-cyber-cyan text-shadow-[0_0_15px_rgba(0,245,212,0.6)] font-display">
              ATR OS v2.0
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-body">
              Academic & Technical Roadmap Tracker • tiruamballa
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Password input */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2.5">
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/5 bg-black/45 text-white font-mono text-center text-lg tracking-[0.25em] focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_15px_rgba(0,245,212,0.15)] transition-all duration-300"
                />
              </div>
            </div>

            {/* Error Message Typewriter Alert */}
            {errorText && (
              <div className="p-3.5 rounded-xl bg-cyber-red/5 border border-cyber-red/20 text-cyber-red text-xs font-mono leading-relaxed relative z-20">
                <span>{errorText}</span>
                <span className="animate-blink">█</span>
              </div>
            )}

            {/* Login button */}
            <div ref={btnRef} className="w-full">
              <CyberButton
                type="submit"
                variant="cyan"
                disabled={loading}
                className="w-full py-4 font-bold text-sm tracking-widest"
              >
                {loading ? 'VERIFYING...' : 'INITIATE ACCESS'}
              </CyberButton>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-500 mt-6 select-none font-mono tracking-wider">
          SECURED CONNECTION AT 83.9B-ATR // LEVEL READY
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
