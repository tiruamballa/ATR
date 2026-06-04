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
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: '20px',
        color: '#FACC15', // var(--yellow)
        textShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
      }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -70 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      +{amount} XP ⚡
    </motion.div>
  );
};

export default XPFloat;
