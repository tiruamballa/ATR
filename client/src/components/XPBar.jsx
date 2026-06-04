import React from 'react';
import { motion } from 'framer-motion';

const XPBar = ({ label, current, max, color = '#22D3EE' }) => {
  const percentage = Math.max(0, Math.min((current / max) * 100, 100));

  return (
    <div className="mb-4 last:mb-0">
      {/* Label and Percentage */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-body text-xs font-semibold text-slate-300">
          {label}
        </span>
        <span className="font-mono text-xs font-semibold text-slate-300">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-900 border border-white/5 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: '9999px',
            background: color,
          }}
        />
      </div>

      {/* Numerical Details */}
      <div className="font-mono text-[9px] text-slate-500 mt-1 uppercase tracking-wider">
        {current} / {max} Completed
      </div>
    </div>
  );
};

export default XPBar;
