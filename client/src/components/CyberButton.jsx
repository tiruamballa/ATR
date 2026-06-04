import React from 'react';
import { motion } from 'framer-motion';

const CyberButton = ({ children, variant = 'cyan', onClick, className = '', disabled = false, type = 'button' }) => {
  const colors = {
    cyan: ['#22D3EE', '#0B0F14'],
    purple: ['#8B5CF6', '#FFFFFF'],
    red: ['#EF4444', '#FFFFFF'],
    yellow: ['#F59E0B', '#0B0F14'],
    pink: ['#EC4899', '#FFFFFF'],
    orange: ['#F97316', '#0B0F14']
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
