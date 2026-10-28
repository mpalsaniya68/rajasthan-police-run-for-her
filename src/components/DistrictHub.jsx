import React, { useState } from 'react';
import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';
import { MapPin, Shield, Search, ArrowRight } from 'lucide-react';

export function DistrictHub({ onSelectDistrict }) {
  const [districtFilter, setDistrictFilter] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");

  const zones = ["All", "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Bharatpur"];

  const filteredDistricts = RAJASTHAN_POLICE_DISTRICTS.filter(d => {
    const matchesQuery = d.name.toLowerCase().includes(districtFilter.toLowerCase()) || 
                         d.nodalOfficer.toLowerCase().includes(districtFilter.toLowerCase()) ||
                         d.flagOffVenue.toLowerCase().includes(districtFilter.toLowerCase());
    const matchesZone = selectedZone === "All" || d.zone === selectedZone;
    return matchesQuery && matchesZone;
  });

  return (
    <section id="districts" className="section-padding" style={{ position: 'relative', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-gold">Simultaneous Statewide Runs</span>
          <h2>राजस्थान के समस्त पुलिस जिले (Districts Coordination)</h2>
          <p>
            महानिदेशक पुलिस के निर्देशानुसार संबंधित जिला पुलिस अधीक्षक (SP) के नेतृत्व में एक साथ 5KM एवं 10KM की दौड़ आयोजित होगी।
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="gov-card" style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Zone Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {zones.map(z => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: selectedZone === z ? 'var(--police-navy-800)' : 'var(--police-navy-50)',
                  color: selectedZone === z ? '#ffffff' : 'var(--text-body)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {z} ज़ोन
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <input
              type="text"
              placeholder="जिला, एसपी या वेन्यू खोजें..."
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontSize: '0.82rem'
              }}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Districts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '14px',
          maxHeight: '480px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filteredDistricts.map(dist => (
            <div
              key={dist.id}
              className="gov-card"
              style={{
                padding: '16px',
                border: dist.flagship ? '2px solid var(--crimson-600)' : '1px solid var(--border-subtle)',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="var(--police-navy-800)" />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>{dist.zone} ज़ोन</span>
                  </div>
                  {dist.flagship && (
                    <span style={{ background: 'var(--crimson-600)', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '2px' }}>
                      मुख्य वेन्यू
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.05rem', color: 'var(--police-navy-900)', marginBottom: '4px' }}>
                  {dist.name}
                </h4>

                <div style={{ fontSize: '0.78rem', color: 'var(--police-gold-700)', fontWeight: 700, marginBottom: '4px' }}>
                  नोडल: {dist.nodalOfficer}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '14px' }}>
                  <MapPin size={12} color="var(--crimson-600)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{dist.flagOffVenue}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectDistrict(dist.id)}
                className="btn-secondary"
                style={{ width: '100%', padding: '7px 10px', fontSize: '0.78rem', justifyContent: 'center' }}
              >
                <span>इस जिले में भाग लें</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
