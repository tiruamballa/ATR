import React, { useRef } from 'react';

const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    ref.current.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-3px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transition: 'transform 0.12s ease',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};

export default TiltCard;
