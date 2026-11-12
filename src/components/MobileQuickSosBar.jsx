import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X } from 'lucide-react';

export function MobileQuickSosBar() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside aria-label="राजस्थान पुलिस महिला सुरक्षा व आपातकालीन हेल्पलाइन" className="mobile-quick-sos-bar no-print">
      <div className="sos-bar-container">
        <a 
          href="tel:1090" 
          className="sos-btn sos-btn-1090" 
          title="महिला गरिमा हेल्पलाइन 1090 पर कॉल करें"
          aria-label="कॉल करें 1090 महिला गरिमा हेल्पलाइन"
        >
          <PhoneCall size={15} />
          <span><strong>1090</strong> महिला गरिमा</span>
        </a>

        <a 
          href="tel:112" 
          className="sos-btn sos-btn-112" 
          title="आपातकालीन पुलिस सेवा 112 पर कॉल करें"
          aria-label="कॉल करें 112 आपातकालीन पुलिस"
        >
          <ShieldAlert size={15} />
          <span><strong>112</strong> पुलिस आपात</span>
        </a>

        <button 
          onClick={() => setIsDismissed(true)} 
          className="sos-close-btn"
          aria-label="हेल्पलाइन बार बंद करें"
          title="बंद करें"
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        .mobile-quick-sos-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 995;
          background: rgba(10, 28, 61, 0.95);
          backdrop-filter: blur(10px);
          border-top: 2px solid #e11d48;
          padding: 6px 12px;
          padding-bottom: max(6px, env(safe-area-inset-bottom));
          box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.35);
          display: flex;
          justify-content: center;
        }
        .sos-bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 520px;
        }
        .sos-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .sos-btn:active {
          transform: scale(0.97);
          opacity: 0.9;
        }
        .sos-btn-1090 {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
          color: #ffffff;
          border: 1px solid #fda4af;
        }
        .sos-btn-112 {
          background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
          color: #fde68a;
          border: 1px solid #fde68a;
        }
        .sos-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justifyContent: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.15s;
        }
        .sos-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        @media (min-width: 769px) {
          .mobile-quick-sos-bar {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}
