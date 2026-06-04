import React from 'react';
import { motion } from 'framer-motion';

const XPFloat = ({ amount, x, y, onComplete }) => {
  return (
    <motion.div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '12px',
        color: '#22D3EE',
        padding: '4px 8px',
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid rgba(34, 211, 238, 0.25)',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      }}
      initial={{ opacity: 1, y: 0, scale: 0.95 }}
      animate={{ opacity: 0, y: -30, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      Saved
    </motion.div>
  );
};

export default XPFloat;
