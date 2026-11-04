import React, { useState } from 'react';
import { 
  Shield, Lock, ArrowLeft, KeyRound, UserCheck, AlertTriangle, 
  Eye, EyeOff, Building2, MapPin, CheckCircle2, ChevronRight
} from 'lucide-react';
import { PoliceEmblem } from './Emblems';
import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';
import { apiAdminLogin } from '../services/api';

export function AdminLoginPage({ onNavigate, onLoginSuccess }) {
  const [accessType, setAccessType] = useState('phq'); // 'phq' | 'district'
  const [selectedDistrictId, setSelectedDistrictId] = useState('KTA-CITY');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Switch access level tab
  const handleAccessTypeChange = (type) => {
    setAccessType(type);
    setErrorMessage('');
    if (type === 'phq') {
      setUsername('phq_admin');
      setPassword('');
    } else {
      const dist = RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === selectedDistrictId) || RAJASTHAN_POLICE_DISTRICTS[0];
      const cleanId = (dist.id || 'dist').toLowerCase().replace(/-/g, '_');
      setUsername(`sp_${cleanId}`);
      setPassword('');
    }
  };

  // Change district in SP mode
  const handleDistrictChange = (distId) => {
    setSelectedDistrictId(distId);
    setErrorMessage('');
    const dist = RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === distId);
    if (dist) {
      const cleanId = dist.id.toLowerCase().replace(/-/g, '_');
      setUsername(`sp_${cleanId}`);
      setPassword('');
    }
  };

  // Submit Login
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('कृपया अधिकृत यूजर आईडी एवं पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await apiAdminLogin(username.trim(), password.trim());
      setIsLoading(false);

      if (res && res.success && res.user) {
        sessionStorage.setItem('rajpol_admin_auth', 'true');
        sessionStorage.setItem('rajpol_admin_user', JSON.stringify(res.user));
        if (res.token) {
          sessionStorage.setItem('rajpol_admin_token', res.token);
        }
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        setAttempts(prev => prev + 1);
        const errMsg = res?.error || 'अमान्य क्रेडेंशियल्स! कृपया सही अधिकृत पुलिस आईडी और पासवर्ड दर्ज करें।';
        setErrorMessage(errMsg);
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Login error:', err);
      setErrorMessage('सर्वर से कनेक्ट करने में असमर्थ। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Subtle Background Watermark */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.03,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <PoliceEmblem size={600} />
      </div>

      {/* Clean Breadcrumb Bar - Without Duplicate Emblems or Headings */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 24px',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
            <span style={{ cursor: 'pointer', color: 'var(--police-navy-800)', fontWeight: 600 }} onClick={() => onNavigate('home')}>मुख्य पृष्ठ</span>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>प्रशासनिक कमान लॉगिन</span>
          </div>

          <button
            onClick={() => onNavigate('home')}
            style={{
              background: '#ffffff',
              color: '#0a1c3d',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <ArrowLeft size={15} />
            <span>मुख्य वेबसाइट पर वापस जाएं</span>
          </button>
        </div>
      </div>

      {/* Main Content Login Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 16px',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden'
        }}>
          {/* Card Official Police Navy Header */}
          <div style={{
            background: 'var(--police-navy-950)',
            padding: '22px 28px',
            borderBottom: '3px solid var(--police-gold-500)',
            textAlign: 'center',
            color: '#ffffff'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '10px', 
              background: 'rgba(255,255,255,0.08)', 
              borderRadius: '50%', 
              marginBottom: '10px', 
              border: '1px solid rgba(212, 175, 55, 0.4)' 
            }}>
              <Shield size={36} color="#fde68a" />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 4px', color: '#ffffff', letterSpacing: '0.02em' }}>
              अधिकृत प्रशासनिक कमान लॉगिन
            </h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#fde68a', fontWeight: 600 }}>
              Police Headquarters & District SP Command Desk
            </p>
          </div>

          <div style={{ padding: '24px 28px' }}>
            {/* 2-Tier Access Level Selection Tabs - Clean Segmented Pill */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                लॉगिन स्तर का चयन करें (Select Command Level):
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => handleAccessTypeChange('phq')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '6px',
                    border: accessType === 'phq' ? '1px solid #cbd5e1' : 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: accessType === 'phq' ? '#ffffff' : 'transparent',
                    color: accessType === 'phq' ? '#0a1c3d' : '#64748b',
                    boxShadow: accessType === 'phq' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <Building2 size={15} color={accessType === 'phq' ? '#0a1c3d' : '#64748b'} />
                  <span>PHQ राज्य कमान</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessTypeChange('district')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '6px',
                    border: accessType === 'district' ? '1px solid #cbd5e1' : 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: accessType === 'district' ? '#ffffff' : 'transparent',
                    color: accessType === 'district' ? '#b91c1c' : '#64748b',
                    boxShadow: accessType === 'district' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <MapPin size={15} color={accessType === 'district' ? '#b91c1c' : '#64748b'} />
                  <span>जिला SP डेस्क</span>
                </button>
              </div>
            </div>

            {/* If District SP Mode: District Selector */}
            {accessType === 'district' && (
              <div style={{ marginBottom: '18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                  जिला पुलिस कार्यालय चुनें (Select Police District):
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: '#ffffff',
                    border: '1.5px solid #dc2626',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  {RAJASTHAN_POLICE_DISTRICTS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.nodalOfficer})
                    </option>
                  ))}
                </select>
                
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #f87171',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px'
              }}>
                <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Username / ID */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  अधिकारी आईडी / उपयोगकर्ता नाम (Officer ID):
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="उदा. phq_admin अथवा sp_kta_city"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--police-navy-800)'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <UserCheck size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  सुरक्षा पासवर्ड (Security Password):
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="गोपनीय पासवर्ड दर्ज करें"
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 38px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--police-navy-800)'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button - Official Police Navy */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--police-navy-950)',
                  color: '#ffffff',
                  border: '1.5px solid var(--police-gold-500)',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(10, 28, 61, 0.2)',
                  transition: 'background 0.2s ease',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isLoading) e.currentTarget.style.background = '#1e3a8a';
                }}
                onMouseOut={(e) => {
                  if (!isLoading) e.currentTarget.style.background = 'var(--police-navy-950)';
                }}
              >
                {isLoading ? (
                  <span>सुरक्षा सत्यापन जारी...</span>
                ) : (
                  <>
                    <Lock size={16} color="#fde68a" />
                    <span>कमान पोर्टल में प्रवेश करें (Secure Sign In)</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>

            
          </div>
        </div>
      </main>
    </div>
  );
}
