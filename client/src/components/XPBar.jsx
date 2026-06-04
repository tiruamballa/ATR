import React from 'react';
import { motion } from 'framer-motion';

const XPBar = ({ label, current, max, level, color = '#00F5D4' }) => {
  const percentage = Math.max(0, Math.min((current / max) * 100, 100));

  return (
    <div className="mb-4">
      {/* Label and Level details */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-body text-sm font-medium text-slate-400">
          {label}
        </span>
        <span
          className="font-display text-[10px] font-semibold tracking-wider"
          style={{ color }}
        >
          LVL {level}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-900 border border-white/5 rounded-md h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            height: '100%',
            borderRadius: '4px',
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>

      {/* Numerical Progress details */}
      <div className="font-mono text-[10px] text-slate-500 mt-1">
        {current} / {max} XP ({Math.round(percentage)}%)
      </div>
    </div>
  );
};

export default XPBar;
