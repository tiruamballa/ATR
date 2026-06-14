import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ThreeDLogo = ({ size = 60 }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 800);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer select-none"
      style={{
        width: size,
        height: size,
        perspective: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        animate={
          clicked
            ? { rotateY: [0, 360, 720], rotateX: [0, 180, 360], scale: [1, 1.2, 1] }
            : { rotateY: 360 }
        }
        transition={
          clicked
            ? { duration: 0.8, ease: 'easeInOut' }
            : { duration: 10, repeat: Infinity, ease: 'linear' }
        }
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* Outer Glowing Face */}
        <div
          className="absolute inset-0 rounded-xl border-2 border-cyber-cyan opacity-80"
          style={{
            transform: 'translateZ(10px)',
            boxShadow: '0 0 25px rgba(0, 245, 212, 0.4), inset 0 0 15px rgba(0, 245, 212, 0.1)',
            background: 'rgba(0, 245, 212, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="font-display font-black text-cyber-cyan text-sm tracking-widest text-shadow-[0_0_10px_rgba(0, 245, 212, 0.8)]">
            ATR
          </span>
        </div>

        {/* Inner Holographic Face */}
        <div
          className="absolute inset-2 rounded-lg border border-cyber-purple opacity-65"
          style={{
            transform: 'translateZ(-10px) rotateY(180deg)',
            boxShadow: '0 0 15px rgba(123, 97, 255, 0.4)',
            background: 'rgba(123, 97, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="font-display text-[9px] font-bold text-cyber-purple">
            OM
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default ThreeDLogo;
