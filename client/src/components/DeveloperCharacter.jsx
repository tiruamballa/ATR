import React from 'react';

const DeveloperCharacter = () => {
  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center select-none overflow-visible">
      {/* Orbiting Code Particles */}
      <div className="absolute w-full h-full animate-orbit pointer-events-none overflow-visible">
        {/* Particle 1: Curly braces */}
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-cyan-400 font-mono text-lg font-bold opacity-80 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          {'{'}
        </span>
        {/* Particle 2: HTML tags */}
        <span className="absolute bottom-2 left-4 text-purple-400 font-mono text-sm font-bold opacity-80 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
          &lt;/&gt;
        </span>
        {/* Particle 3: Parenthesis */}
        <span className="absolute top-1/2 right-0 -translate-y-1/2 text-pink-400 font-mono text-lg font-bold opacity-80 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
          ( )
        </span>
      </div>

      {/* Orbiting Particle 2 (Opposite direction/delay) */}
      <div className="absolute w-4/5 h-4/5 animate-orbit pointer-events-none overflow-visible [animation-direction:reverse] [animation-duration:8s]">
        <span className="absolute top-0 right-4 text-emerald-400 font-mono text-xs font-bold opacity-80 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
          JS
        </span>
        <span className="absolute bottom-4 right-8 text-yellow-400 font-mono text-xs font-bold opacity-80">
          Java
        </span>
      </div>

      {/* Main Avatar Character - SVG drawing */}
      <svg
        className="w-32 h-32 animate-float filter drop-shadow-[0_10px_20px_rgba(6,182,212,0.25)] overflow-visible"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow Background Aura */}
        <circle cx="50" cy="50" r="32" fill="url(#avatarGlow)" opacity="0.15" />

        {/* Headphone band */}
        <path
          d="M26 48C26 30.5 40.5 24 50 24C59.5 24 74 30.5 74 48"
          stroke="#a855f7"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Hoodie / Head Cap */}
        <path
          d="M28 50C28 32 37.8 28 50 28C62.2 28 72 32 72 50C72 68 62.2 72 50 72C37.8 72 28 68 28 50Z"
          fill="#1e1b4b"
          stroke="#312e81"
          strokeWidth="2"
        />
        
        {/* Hoodie Inner shadow */}
        <path
          d="M32 50C32 36 40 32 50 32C60 32 68 36 68 50C68 64 60 67 50 67C40 67 32 64 32 50Z"
          fill="#0f172a"
        />

        {/* Face / Screen Glow Mask */}
        <rect x="38" y="44" width="24" height="18" rx="4" fill="#1e293b" />
        <rect
          x="39"
          y="45"
          width="22"
          height="16"
          rx="3"
          fill="#020617"
          stroke="#06b6d4"
          strokeWidth="1.5"
          className="animate-pulse"
        />

        {/* Cyber Spectacles / Eyes */}
        <circle cx="45" cy="53" r="3" fill="#06b6d4" className="glow-cyan" />
        <circle cx="55" cy="53" r="3" fill="#06b6d4" className="glow-cyan" />
        <path d="M48 53H52" stroke="#06b6d4" strokeWidth="1.5" />

        {/* Cool Smile on face */}
        <path
          d="M47 59C48.5 60.5 51.5 60.5 53 59"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Headphones Earpads */}
        <rect x="23" y="43" width="7" height="15" rx="3.5" fill="#a855f7" />
        <rect x="70" y="43" width="7" height="15" rx="3.5" fill="#a855f7" />

        {/* Floating Mini Laptop below */}
        <g transform="translate(0, 10)" className="animate-float-delayed">
          {/* Base */}
          <path
            d="M30 78H70L74 84H26L30 78Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1"
          />
          {/* Screen */}
          <path
            d="M34 78L36 64H64L66 78"
            fill="#1e293b"
            stroke="#06b6d4"
            strokeWidth="1"
          />
          {/* Coding lines on laptop screen */}
          <line x1="39" y1="68" x2="49" y2="68" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="39" y1="72" x2="55" y2="72" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="39" y1="75" x2="45" y2="75" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Gradients */}
        <defs>
          <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Decorative Floating Spark */}
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
      <div className="absolute bottom-6 left-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping [animation-delay:1.5s]" />
    </div>
  );
};

export default DeveloperCharacter;
