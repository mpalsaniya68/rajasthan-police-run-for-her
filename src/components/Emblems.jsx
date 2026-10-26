import React from 'react';

// Official Rajasthan Police Emblem (Uses the authentic official circular crest with Red & Blue half, Vijay Stambh, and Sevārth Katibaddhatā)
export function PoliceEmblem({ size = 56, className = "" }) {
  return (
    <img 
      src="/rajasthan-police-logo.png" 
      alt="Official Rajasthan Police Crest" 
      width={size} 
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        filter: 'drop-shadow(0 2px 6px rgba(10, 28, 61, 0.25))'
      }}
    />
  );
}

// Official State Emblem of India (Ashoka Lion Capital with Satyameva Jayate)
export function StateEmblemOfIndia({ size = 48, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="State Emblem of India"
    >
      <defs>
        <linearGradient id="ashokaGold" x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.5" stopColor="#B45309" />
          <stop offset="1" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Central Lion Head */}
      <path d="M 44,22 Q 50,14 56,22 Q 62,32 58,44 L 42,44 Q 38,32 44,22 Z" fill="url(#ashokaGold)" />
      <circle cx="50" cy="24" r="5" fill="#FEF3C7" />
      
      {/* Left & Right Lion Profiles */}
      <path d="M 38,26 Q 30,22 28,30 Q 26,40 38,44 Z" fill="url(#ashokaGold)" />
      <path d="M 62,26 Q 70,22 72,30 Q 74,40 62,44 Z" fill="url(#ashokaGold)" />

      {/* Mane & Platform */}
      <path d="M 32,44 L 68,44 L 64,68 L 36,68 Z" fill="url(#ashokaGold)" />
      <rect x="22" y="68" width="56" height="10" fill="url(#ashokaGold)" rx="2" />
      
      {/* Ashoka Chakra */}
      <circle cx="50" cy="73" r="4" fill="#0A1C3D" />
      <circle cx="50" cy="73" r="3.2" fill="#FFFFFF" />
      <circle cx="50" cy="73" r="1.5" fill="#0A1C3D" />

      {/* Lotus Base */}
      <path d="M 28,78 Q 50,86 72,78 L 74,90 Q 50,96 26,90 Z" fill="url(#ashokaGold)" />

      {/* Devanagari Script: सत्यमेव जयते */}
      <text x="50" y="108" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="900" fontFamily="'Inter', 'Noto Sans Devanagari', sans-serif">
        सत्यमेव जयते
      </text>
    </svg>
  );
}

// "Run for Her" Vibrant Logo Badge
export function RunForHerBadge({ size = 48, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="pinkGradNew" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="0.5" stopColor="#C9184A" />
          <stop offset="1" stopColor="#800F2F" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#pinkGradNew)" />
      <circle cx="50" cy="50" r="44" stroke="#FFE4E6" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Dynamic Runner Silhouette */}
      <path 
        d="M52 22 A 6 6 0 1 0 52 34 A 6 6 0 1 0 52 22 Z M46 36 L58 35 L52 49 L62 57 L58 64 L46 53 L45 68 L36 67 L41 48 L34 46 L37 39 L47 38 Z M53 51 L59 66 L67 76 L61 80 L52 70 L48 55 Z" 
        fill="#FFFFFF" 
      />
      {/* Speed Lines */}
      <path d="M22 52 L34 50 M18 60 L30 58 M24 68 L34 66" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Gold Seal for Official Certificates
export function OfficialGoldSeal({ size = 80 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <img 
        src="/rajasthan-police-logo.png" 
        alt="Rajasthan Police Seal" 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 10px rgba(180, 83, 9, 0.4))'
        }}
      />
    </div>
  );
}
