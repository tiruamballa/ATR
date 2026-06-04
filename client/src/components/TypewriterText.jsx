import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 45, style = {}, className = '', onComplete }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className} style={style}>
      {display}
      <span className="animate-blink font-mono">█</span>
    </span>
  );
};

export default TypewriterText;
