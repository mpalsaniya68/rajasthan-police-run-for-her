import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export const ALBERT_HALL_MAPS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Albert+Hall+Museum,Ram+Niwas+Garden,Jaipur,Rajasthan';

export const JAIPUR_ROUTE_CONFIGS = {
  '21k': {
    id: '21k',
    shortBadge: '21 KM',
    title: 'HALF MARATHON ROUTE — ALBERT HALL, JAIPUR',
    timing: 'Reporting: 05:00 AM • Flag-Off: 06:00 AM',
    accent: '#dc2626',
    accentSoft: '#fef2f2',
    accentBorder: '#fecaca',
    outbound: [
      { label: 'Trimurti Circle', km: '1.5 KM' },
      { label: 'Birla Mandir / RU', km: '3.5 KM' },
      { label: 'Gandhi Circle', km: '5.5 KM' },
      { label: 'MNIT & Apex Circle', km: '8.5 KM' }
    ],
    turnaround: { label: 'Jawahar Circle', sub: 'U-TURN • 10.5 KM' },
    inbound: [
      { label: 'World Trade Park', km: '12 KM' },
      { label: 'KV School Loop', km: '15.5 KM' },
      { label: 'Jawahar Kala Kendra', km: '17.5 KM' },
      { label: 'JDA / Soni Hospital', km: '19.5 KM' }
    ]
  },
  '10k': {
    id: '10k',
    shortBadge: '10 KM',
    title: '10 KM MARATHON ROUTE — ALBERT HALL, JAIPUR',
    timing: 'Reporting: 05:15 AM • Flag-Off: 06:15 AM',
    accent: '#1d4ed8',
    accentSoft: '#eff6ff',
    accentBorder: '#bfdbfe',
    outbound: [
      { label: 'Trimurti Circle', km: '1.2 KM' },
      { label: 'Birla Mandir', km: '2.2 KM' },
      { label: 'Rajasthan Univ.', km: '3.2 KM' },
      { label: 'Gandhi Circle', km: '4.2 KM' }
    ],
    turnaround: { label: 'DB Crossing / MNIT', sub: 'U-TURN • 5.0 KM' },
    inbound: [
      { label: 'Commerce College', km: '6.0 KM' },
      { label: 'Jawahar Kala Kendra', km: '7.2 KM' },
      { label: 'Kanoria College', km: '8.2 KM' },
      { label: 'JDA Circle', km: '9.0 KM' }
    ]
  },
  '5k': {
    id: '5k',
    shortBadge: '5 KM',
    title: '5 KM MARATHON ROUTE — ALBERT HALL, JAIPUR',
    timing: 'Reporting: 05:30 AM • Flag-Off: 06:45 AM',
    accent: '#0f172a',
    accentSoft: '#f8fafc',
    accentBorder: '#cbd5e1',
    outbound: [
      { label: 'Trimurti Circle', km: '1.0 KM' },
      { label: 'Birla Mandir', km: '1.8 KM' },
      { label: 'Rajasthan Univ.', km: '2.2 KM' }
    ],
    turnaround: { label: 'Gandhi Circle', sub: 'U-TURN • 2.5 KM' },
    inbound: [
      { label: 'Kanoria College', km: '3.0 KM' },
      { label: 'JDA Circle', km: '3.8 KM' },
      { label: 'Soni Hospital', km: '4.4 KM' }
    ]
  },
  '2k': {
    id: '2k',
    shortBadge: '2 KM',
    title: '2 KM FUN RUN ROUTE — ALBERT HALL, JAIPUR',
    timing: 'Reporting: 06:00 AM • Flag-Off: 07:15 AM',
    accent: '#0284c7',
    accentSoft: '#f0f9ff',
    accentBorder: '#bae6fd',
    outbound: [
      { label: 'Ram Niwas Gate', km: '0.4 KM' },
      { label: 'JLN Marg Corridor', km: '0.8 KM' }
    ],
    turnaround: { label: 'Trimurti Circle', sub: 'U-TURN • 1.0 KM' },
    inbound: [
      { label: 'JLN Marg Return', km: '1.4 KM' },
      { label: 'Albert Hall Approach', km: '1.8 KM' }
    ]
  }
};

export function getJaipurRouteConfig(p) {
  if (!p) return null;
  const distId = String(p.districtId || '').toLowerCase();
  const distName = String(p.districtName || '').toLowerCase();
  const isJaipur =
    distId === 'jpr-comm' ||
    distId === 'jaipur_comm' ||
    distId.includes('jaipur') ||
    distName.includes('jaipur') ||
    distName.includes('जयपुर');
  if (!isJaipur) return null;

  const rawCat = String(p.category || p.categoryId || p.categoryName || '').toLowerCase();
  if (rawCat.includes('21')) return JAIPUR_ROUTE_CONFIGS['21k'];
  if (rawCat.includes('10')) return JAIPUR_ROUTE_CONFIGS['10k'];
  if (rawCat.includes('5')) return JAIPUR_ROUTE_CONFIGS['5k'];
  if (rawCat.includes('2')) return JAIPUR_ROUTE_CONFIGS['2k'];
  return null;
}

/**
 * Creative Horizontal SVG Route Map Card + Clickable Albert Hall Google Maps Link & QR
 * Used in both On-Screen E-Pass Preview and A4 PDF Print!
 */
export function HorizontalRouteMapCard({ route, locationQrUrl }) {
  if (!route) return null;

  const outCount = route.outbound.length;
  const inCount = route.inbound.length;

  // Track geometry in 760 x 210 SVG coordinate space
  const leftX = 112;
  const rightX = 626;
  const topY = 68;
  const botY = 148;
  const midY = (topY + botY) / 2;

  const getStopX = (index, total, reverse = false) => {
    const usableStart = leftX + 44;
    const usableEnd = rightX - 44;
    if (total <= 1) return (usableStart + usableEnd) / 2;
    const ratio = index / (total - 1);
    return reverse
      ? usableEnd - ratio * (usableEnd - usableStart)
      : usableStart + ratio * (usableEnd - usableStart);
  };

  return (
    <div
      className="epass-route-map-panel"
      style={{
        marginTop: '16px',
        border: '1.5px solid var(--police-navy-900)',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#ffffff'
      }}
    >
      {/* Top Navy Header Strip */}
      <div style={{
        background: 'linear-gradient(90deg, #051126 0%, #0a1c3d 100%)',
        color: '#ffffff',
        padding: '8px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: route.accent,
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.72rem',
            padding: '2px 9px',
            borderRadius: '999px',
            letterSpacing: '0.04em'
          }}>
            {route.shortBadge}
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fef08a', letterSpacing: '0.02em' }}>
            {route.title}
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 700 }}>
          {route.timing}
        </span>
      </div>

      {/* Horizontal Body: Creative SVG Map (Left) + Clickable Albert Hall Google Maps Box (Right) */}
      <div
        className="epass-route-body-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 172px',
          gap: '12px',
          padding: '12px 14px',
          alignItems: 'center',
          background: '#ffffff'
        }}
      >
        {/* Creative Horizontal SVG Route Infographic */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 760 232"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            role="img"
            aria-label={route.title}
          >
            {/* Subtle Map Canvas Background */}
            <rect x="2" y="2" width="756" height="228" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Subtle JLN Marg Corridor Fill */}
            <rect x={leftX} y={topY - 7} width={rightX - leftX} height={botY - topY + 14} rx="40" fill={route.accentSoft} />

            {/* Center Dashed Road Divider */}
            <line
              x1={leftX + 36}
              y1={midY}
              x2={rightX - 18}
              y2={midY}
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="8 7"
            />
            <text
              x={(leftX + rightX) / 2}
              y={midY + 4}
              textAnchor="middle"
              fill="#64748b"
              fontSize="9.5"
              fontWeight="800"
              letterSpacing="1.6"
              style={{ paintOrder: 'stroke', stroke: route.accentSoft, strokeWidth: '6px' }}
            >
              JLN MARG CORRIDOR
            </text>

            {/* Continuous Rounded U-Loop Track */}
            <path
              d={`M ${leftX} ${topY} L ${rightX - 24} ${topY} A 40 40 0 0 1 ${rightX - 24} ${botY} L ${leftX} ${botY}`}
              fill="none"
              stroke={route.accent}
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Directional Chevrons along Outbound (Top →) and Inbound (Bottom ←) */}
            {[0.25, 0.5, 0.75].map((t, i) => {
              const ax = leftX + 24 + t * (rightX - leftX - 68);
              return (
                <g key={`arr-${i}`}>
                  <path d={`M ${ax - 4} ${topY - 3} L ${ax + 3} ${topY} L ${ax - 4} ${topY + 3}`} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={`M ${ax + 4} ${botY - 3} L ${ax - 3} ${botY} L ${ax + 4} ${botY + 3}`} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })}

            {/* Outbound Landmarks (Above Top Track) */}
            {route.outbound.map((stop, idx) => {
              const cx = getStopX(idx, outCount, false);
              return (
                <g key={`out-${idx}`}>
                  <line x1={cx} y1={topY - 6} x2={cx} y2={topY - 22} stroke="#94a3b8" strokeWidth="1.2" />
                  <circle cx={cx} cy={topY} r="6" fill="#ffffff" stroke={route.accent} strokeWidth="3" />
                  <text x={cx} y={topY - 37} textAnchor="middle" fill="#0a1c3d" fontSize="10.5" fontWeight="800">
                    {stop.label}
                  </text>
                  <text x={cx} y={topY - 25} textAnchor="middle" fill={route.accent} fontSize="9" fontWeight="800">
                    {stop.km}
                  </text>
                </g>
              );
            })}

            {/* Inbound Landmarks (Below Bottom Track) */}
            {route.inbound.map((stop, idx) => {
              const cx = getStopX(idx, inCount, true);
              return (
                <g key={`in-${idx}`}>
                  <line x1={cx} y1={botY + 6} x2={cx} y2={botY + 20} stroke="#94a3b8" strokeWidth="1.2" />
                  <circle cx={cx} cy={botY} r="6" fill="#ffffff" stroke={route.accent} strokeWidth="3" />
                  <text x={cx} y={botY + 32} textAnchor="middle" fill="#0a1c3d" fontSize="10.5" fontWeight="800">
                    {stop.label}
                  </text>
                  <text x={cx} y={botY + 44} textAnchor="middle" fill="#475569" fontSize="9" fontWeight="700">
                    {stop.km}
                  </text>
                </g>
              );
            })}

            {/* Left Anchor: Albert Hall START / FINISH Landmark */}
            <g>
              <rect x="14" y="48" width="98" height="120" rx="12" fill="#0a1c3d" stroke="#d4af37" strokeWidth="2" />
              {/* Stylized Albert Hall Dome Silhouette */}
              <circle cx="63" cy="84" r="21" fill="#dc2626" stroke="#fde68a" strokeWidth="1.5" />
              <path d="M 49 91 L 77 91 M 52 91 L 52 83 L 74 83 L 74 91 M 56 83 C 56 75, 70 75, 70 83 M 63 73 L 63 77" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <text x="63" y="122" textAnchor="middle" fill="#fde68a" fontSize="9.5" fontWeight="900" letterSpacing="0.8">
                START / FINISH
              </text>
              <text x="63" y="137" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="900">
                ALBERT HALL
              </text>
              <text x="63" y="151" textAnchor="middle" fill="#cbd5e1" fontSize="8.8" fontWeight="700">
                Jaipur
              </text>
            </g>

            {/* Right Anchor: U-Turn Point Badge */}
            <g>
              <rect x="640" y="58" width="108" height="100" rx="12" fill="#ffffff" stroke={route.accent} strokeWidth="2.2" />
              <circle cx="694" cy="86" r="16" fill={route.accent} />
              <text x="694" y="91" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
                ↺
              </text>
              <text x="694" y="119" textAnchor="middle" fill="#0a1c3d" fontSize="10.2" fontWeight="900">
                {route.turnaround.label}
              </text>
              <text x="694" y="134" textAnchor="middle" fill={route.accent} fontSize="8.6" fontWeight="800">
                {route.turnaround.sub}
              </text>
              <text x="694" y="148" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="700">
                Water & Medical
              </text>
            </g>

            {/* Compact Micro-Legend */}
            <text x="16" y="218" fill="#475569" fontSize="9" fontWeight="700">
              💧 Hydration Stations Every 2 KM   •   ✚ Medical & Ambulance Support   •   🏁 Start & Finish: Albert Hall, Ram Niwas Garden
            </text>
          </svg>
        </div>

        {/* Right Side: Clickable Albert Hall Google Maps Location Card (Works in Browser + A4 PDF + QR Scan!) */}
        <a
          href={ALBERT_HALL_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="epass-location-link"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1.5px solid #93c5fd',
            textDecoration: 'none',
            color: '#0a1c3d',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          title="Google Maps पर अल्बर्ट हॉल का रास्ता खोलें"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 900, color: '#1d4ed8', letterSpacing: '0.03em' }}>
            <MapPin size={14} color="#dc2626" />
            <span>ALBERT HALL LOCATION</span>
          </div>

          {locationQrUrl && (
            <div style={{ background: '#ffffff', padding: '4px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <img
                src={locationQrUrl}
                alt="Albert Hall Google Maps QR"
                style={{ width: '82px', height: '82px', display: 'block' }}
              />
            </div>
          )}

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#1d4ed8',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '5px 10px',
            borderRadius: '999px',
            width: '100%',
            justifyContent: 'center'
          }}>
            <Navigation size={11} />
            <span>Google Maps रास्ता</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 700, lineHeight: 1.2 }}>
            क्लिक करें या QR स्कैन करें
          </div>
        </a>
      </div>
    </div>
  );
}

/**
 * Draws the exact same Creative Horizontal Route Map + Albert Hall Google Maps QR directly onto the E-Pass PNG Canvas!
 */
export function drawHorizontalRouteMapOnCanvas(ctx, route, locQrImg, boxX, boxY, boxW, boxH, drawRRect) {
  // 1. Outer Card Border
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0a1c3d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawRRect(boxX, boxY, boxW, boxH, 12);
  ctx.fill();
  ctx.stroke();

  // 2. Top Navy Header Bar
  ctx.fillStyle = '#0a1c3d';
  ctx.fillRect(boxX, boxY, boxW, 44);

  // Category Pill inside Header
  ctx.fillStyle = route.accent;
  ctx.beginPath();
  drawRRect(boxX + 16, boxY + 9, 76, 26, 13);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(route.shortBadge, boxX + 54, boxY + 27);

  // Route Title & Timing
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(route.title, boxX + 104, boxY + 28);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(route.timing, boxX + boxW - 18, boxY + 27);
  ctx.textAlign = 'left';

  // 3. Left Horizontal Track Area (x: boxX+14 .. boxX+896, y: boxY+56 .. boxY+boxH-14)
  const mapX = boxX + 14;
  const mapY = boxY + 56;
  const mapW = 882;
  const mapH = boxH - 70;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRRect(mapX, mapY, mapW, mapH, 10);
  ctx.fill();
  ctx.stroke();

  const leftX = mapX + 132;
  const rightX = mapX + mapW - 144;
  const topY = mapY + 76;
  const botY = mapY + 174;
  const midY = (topY + botY) / 2;
  const loopR = (botY - topY) / 2;

  // Corridor soft highlight
  ctx.fillStyle = route.accentSoft;
  ctx.beginPath();
  drawRRect(leftX, topY - 8, rightX - leftX + loopR, botY - topY + 16, loopR + 8);
  ctx.fill();

  // Center Dashed Divider
  ctx.save();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(leftX + 34, midY);
  ctx.lineTo(rightX - 10, midY);
  ctx.stroke();
  ctx.restore();

  // Corridor center label
  ctx.fillStyle = route.accentSoft;
  ctx.fillRect((leftX + rightX) / 2 - 82, midY - 10, 164, 20);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JLN MARG CORRIDOR', (leftX + rightX) / 2, midY + 4);

  // Main U-Loop Route Path
  ctx.strokeStyle = route.accent;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(leftX, topY);
  ctx.lineTo(rightX, topY);
  ctx.arc(rightX, midY, loopR, -Math.PI / 2, Math.PI / 2, false);
  ctx.lineTo(leftX, botY);
  ctx.stroke();

  // Directional White Chevrons
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  [0.24, 0.5, 0.76].forEach((t) => {
    const ax = leftX + 20 + t * (rightX - leftX - 40);
    // Top →
    ctx.beginPath();
    ctx.moveTo(ax - 5, topY - 4);
    ctx.lineTo(ax + 4, topY);
    ctx.lineTo(ax - 5, topY + 4);
    ctx.stroke();
    // Bottom ←
    ctx.beginPath();
    ctx.moveTo(ax + 5, botY - 4);
    ctx.lineTo(ax - 4, botY);
    ctx.lineTo(ax + 5, botY + 4);
    ctx.stroke();
  });

  // Helper for stop X positions
  const getStopX = (idx, total, reverse = false) => {
    const s = leftX + 52;
    const e = rightX - 38;
    if (total <= 1) return (s + e) / 2;
    const ratio = idx / (total - 1);
    return reverse ? e - ratio * (e - s) : s + ratio * (e - s);
  };

  // Outbound Stops (Top)
  route.outbound.forEach((stop, idx) => {
    const cx = getStopX(idx, route.outbound.length, false);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, topY - 7);
    ctx.lineTo(cx, topY - 24);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = route.accent;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, topY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0a1c3d';
    ctx.font = 'bold 12.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stop.label, cx, topY - 42);
    ctx.fillStyle = route.accent;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(stop.km, cx, topY - 27);
  });

  // Inbound Stops (Bottom)
  route.inbound.forEach((stop, idx) => {
    const cx = getStopX(idx, route.inbound.length, true);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, botY + 7);
    ctx.lineTo(cx, botY + 24);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = route.accent;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, botY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0a1c3d';
    ctx.font = 'bold 12.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stop.label, cx, botY + 38);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(stop.km, cx, botY + 53);
  });

  // Left Anchor: Albert Hall Start/Finish Card
  const ahX = mapX + 14;
  const ahY = mapY + 50;
  const ahW = 114;
  const ahH = 148;
  ctx.fillStyle = '#0a1c3d';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  drawRRect(ahX, ahY, ahW, ahH, 12);
  ctx.fill();
  ctx.stroke();

  // Dome Circle Badge
  const domeX = ahX + ahW / 2;
  const domeY = ahY + 42;
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(domeX, domeY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Minimal Albert Hall icon lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(domeX - 14, domeY + 8);
  ctx.lineTo(domeX + 14, domeY + 8);
  ctx.moveTo(domeX - 11, domeY + 8);
  ctx.lineTo(domeX - 11, domeY);
  ctx.lineTo(domeX + 11, domeY);
  ctx.lineTo(domeX + 11, domeY + 8);
  ctx.moveTo(domeX - 7, domeY);
  ctx.arc(domeX, domeY, 7, Math.PI, 0, false);
  ctx.moveTo(domeX, domeY - 12);
  ctx.lineTo(domeX, domeY - 7);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('START / FINISH', domeX, ahY + 90);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13.5px sans-serif';
  ctx.fillText('ALBERT HALL', domeX, ahY + 110);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Jaipur', domeX, ahY + 128);

  // Right Anchor: U-Turn Card
  const utX = mapX + mapW - 134;
  const utY = mapY + 60;
  const utW = 122;
  const utH = 128;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = route.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  drawRRect(utX, utY, utW, utH, 12);
  ctx.fill();
  ctx.stroke();

  const utCX = utX + utW / 2;
  ctx.fillStyle = route.accent;
  ctx.beginPath();
  ctx.arc(utCX, utY + 32, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('↺', utCX, utY + 38);

  ctx.fillStyle = '#0a1c3d';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(route.turnaround.label, utCX, utY + 72);
  ctx.fillStyle = route.accent;
  ctx.font = 'bold 10.5px sans-serif';
  ctx.fillText(route.turnaround.sub, utCX, utY + 90);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('Water & Medical', utCX, utY + 109);

  // Bottom Legend inside Map Box
  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11.5px sans-serif';
  ctx.fillText(
    '💧 Hydration Stations Every 2 KM   •   ✚ Medical & Ambulance Support   •   🏁 Start & Finish: Albert Hall, Jaipur',
    mapX + 16,
    mapY + mapH - 12
  );

  // 4. Right Side: Albert Hall Google Maps Directions QR Card
  const locX = mapX + mapW + 14;
  const locY = mapY;
  const locW = boxW - mapW - 42;
  const locH = mapH;

  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  drawRRect(locX, locY, locW, locH, 12);
  ctx.fill();
  ctx.stroke();

  const locCX = locX + locW / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 12.5px sans-serif';
  ctx.fillText('📍 ALBERT HALL', locCX, locY + 26);
  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('GOOGLE MAPS ROUTE', locCX, locY + 44);

  // Location QR Box
  const qrSize = 132;
  const qrX = locCX - qrSize / 2;
  const qrY = locY + 56;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  drawRRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 8);
  ctx.fill();
  ctx.stroke();

  if (locQrImg && locQrImg.complete && locQrImg.naturalWidth > 0) {
    ctx.drawImage(locQrImg, qrX, qrY, qrSize, qrSize);
  }

  // Blue Direction Pill
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  drawRRect(locX + 16, locY + locH - 54, locW - 32, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11.5px sans-serif';
  ctx.fillText('Scan for Directions', locCX, locY + locH - 36);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('अल्बर्ट हॉल का रास्ता देखें', locCX, locY + locH - 10);
  ctx.textAlign = 'left';
}
