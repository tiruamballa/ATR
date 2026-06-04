import React from 'react';
import { motion } from 'framer-motion';

const CyberButton = ({ children, variant = 'cyan', onClick, className = '', disabled = false, type = 'button' }) => {
  const colors = {
    cyan: ['#00F5D4', '#0B0F19'],
    purple: ['#7B61FF', '#FFFFFF'],
    red: ['#FF6B6B', '#FFFFFF'],
    yellow: ['#FACC15', '#0B0F19'],
    pink: ['#F472B6', '#FFFFFF'],
    orange: ['#F97316', '#0B0F19']
  };

  const [buttonColor, textColor] = colors[variant] || colors['cyan'];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cyber-btn ${className}`}
      style={{
        '--btn-color': buttonColor,
        '--btn-text': textColor,
      }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      <span>{children}</span>
    </motion.button>
  );
};

export default CyberButton;
