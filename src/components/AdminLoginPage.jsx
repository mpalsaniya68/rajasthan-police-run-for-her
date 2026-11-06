import React, { useState } from 'react';
import { 
  Shield, Lock, ArrowLeft, KeyRound, UserCheck, AlertTriangle, 
  Eye, EyeOff, Building2, MapPin, CheckCircle2, ChevronRight, PackageCheck
} from 'lucide-react';
import { RAJASTHAN_POLICE_DISTRICTS } from '../data/mockData';
import { apiAdminLogin, apiExpoLogin } from '../services/api';

export const EXPO_COUNTERS = [
  { id: "auto", name: "✨ प्रोफ़ाइल के अनुसार स्वतः निर्धारित (Auto Detect Station)" },
  { id: "counter_01", name: "काउंटर-01 (21KM हाफ मैराथन - पुरुष)" },
  { id: "counter_02", name: "काउंटर-02 (21KM हाफ मैराथन - महिला)" },
  { id: "counter_03", name: "काउंटर-03 (10KM स्पीड चैलेंज - पुरुष)" },
  { id: "counter_04", name: "काउंटर-04 (10KM स्पीड चैलेंज - महिला)" },
  { id: "counter_05", name: "काउंटर-05 (5KM कम्युनिटी रन - समस्त)" },
  { id: "counter_06", name: "काउंटर-06 (2KM फन रन व परिवार)" },
  { id: "counter_07", name: "काउंटर-07 (पुलिस बल, VIP व मीडिया डेस्क)" },
  { id: "counter_08", name: "काउंटर-08 (सामान्य किट वितरण - डेस्क A)" },
  { id: "counter_09", name: "काउंटर-09 (सामान्य किट वितरण - डेस्क B)" },
  { id: "counter_10", name: "काउंटर-10 (हेल्पडेस्क व समस्या निवारण)" },
  { id: "gate_01", name: "गेट-01 (अल्बर्ट हॉल मुख्य प्रवेश - रेस डे)" },
  { id: "gate_02", name: "गेट-02 (रामनिवास बाग द्वार - रेस डे)" },
  { id: "gate_03", name: "गेट-03 (JLN मार्ग प्रवेश द्वार - रेस डे)" }
];

export function AdminLoginPage({ onNavigate, onLoginSuccess }) {
  const [accessType, setAccessType] = useState('phq'); // 'phq' | 'district' | 'expo'
  const [selectedDistrictId, setSelectedDistrictId] = useState('KTA-CITY');
  const [operatorName, setOperatorName] = useState('');
  const [selectedCounterId, setSelectedCounterId] = useState('auto');
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
      setUsername('');
    } else if (type === 'district') {
      const dist = RAJASTHAN_POLICE_DISTRICTS.find(d => d.id === selectedDistrictId) || RAJASTHAN_POLICE_DISTRICTS[0];
      const cleanId = (dist.id || 'dist').toLowerCase().replace(/-/g, '_');
      setUsername(`sp_${cleanId}`);
    }
    setPassword('');
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

    // 1. Volunteer Expo & Gate Desk Login
    if (accessType === 'expo') {
      if (!operatorName.trim()) {
        setErrorMessage('कृपया वॉलंटियर आईडी, मोबाइल नंबर अथवा ऑपरेटर नाम दर्ज करें।');
        return;
      }
      if (!password.trim()) {
        setErrorMessage('कृपया सुरक्षा पासवर्ड अथवा पिन दर्ज करें।');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const counterObj = EXPO_COUNTERS.find(c => c.id === selectedCounterId);
        const targetCounterId = selectedCounterId === "auto" ? "" : selectedCounterId;
        const targetCounterName = selectedCounterId === "auto" ? "" : (counterObj?.name || "");

        const res = await apiExpoLogin(operatorName.trim(), targetCounterId, targetCounterName, password.trim());
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
          setErrorMessage(res?.error || 'अमान्य एक्सपो सुरक्षा पासकोड! कृपया अधिकृत पिन दर्ज करें।');
        }
      } catch (err) {
        setIsLoading(false);
        console.error('Expo login error:', err);
        setErrorMessage('सर्वर से कनेक्ट करने में असमर्थ।');
      }
      return;
    }

    // 2. High Command (PHQ / District) Login
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
      {/* Clean Breadcrumb Bar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
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
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <ArrowLeft size={14} />
            <span>वेबसाइट</span>
          </button>
        </div>
      </div>

      {/* Main Content Login Container - Positioned higher with clean spacing */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 12px 50px',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          {/* Official Subtle Top Color Bar */}
          <div style={{ height: '4px', background: '#0b3a75' }}></div>

          {/* Official Government Card Header - Clean Light Sarkari Style */}
          <div style={{
            background: '#ffffff',
            padding: '20px 20px 14px',
            borderBottom: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              background: '#f0f4f8', 
              borderRadius: '50%', 
              marginBottom: '10px', 
              border: '1px solid #cbd5e1'
            }}>
              {accessType === 'expo' ? (
                <PackageCheck size={24} color="#0b3a75" />
              ) : (
                <Shield size={24} color="#0b3a75" />
              )}
            </div>
            <h1 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
              {accessType === 'expo' ? 'एक्सपो किट व गेट स्कैनर लॉगिन' : 'प्रशासनिक कमान लॉगिन'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              {accessType === 'expo' 
                ? 'टी-शर्ट, चेस्ट बिब आवंटन व गेट एंट्री अधिकृत स्टेशन' 
                : 'राजस्थान पुलिस मुख्यालय एवं जिला कमान डेस्क'}
            </p>
          </div>

          <div style={{ padding: '20px 18px' }}>
            {/* 3-Tier Access Level Selection Tabs */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                लॉगिन स्तर का चयन करें (Select Command Level):
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => handleAccessTypeChange('phq')}
                  style={{
                    padding: '9px 4px',
                    borderRadius: '6px',
                    border: accessType === 'phq' ? '1px solid #cbd5e1' : 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: accessType === 'phq' ? '#ffffff' : 'transparent',
                    color: accessType === 'phq' ? '#0a1c3d' : '#64748b',
                    boxShadow: accessType === 'phq' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <Building2 size={13} color={accessType === 'phq' ? '#0a1c3d' : '#64748b'} />
                  <span>PHQ कमान</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessTypeChange('district')}
                  style={{
                    padding: '9px 4px',
                    borderRadius: '6px',
                    border: accessType === 'district' ? '1px solid #cbd5e1' : 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: accessType === 'district' ? '#ffffff' : 'transparent',
                    color: accessType === 'district' ? '#b91c1c' : '#64748b',
                    boxShadow: accessType === 'district' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <MapPin size={13} color={accessType === 'district' ? '#b91c1c' : '#64748b'} />
                  <span>जिला SP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccessTypeChange('expo')}
                  style={{
                    padding: '9px 4px',
                    borderRadius: '6px',
                    border: accessType === 'expo' ? '1px solid #047857' : 'none',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: accessType === 'expo' ? '#047857' : 'transparent',
                    color: accessType === 'expo' ? '#ffffff' : '#047857',
                    boxShadow: accessType === 'expo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <PackageCheck size={13} color={accessType === 'expo' ? '#ffffff' : '#047857'} />
                  <span>📦 एक्सपो डेस्क</span>
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

            {/* If Expo Mode: Counter / Gate Selector */}
            {accessType === 'expo' && (
              <div style={{ marginBottom: '18px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  काउंटर / गेट स्टेशन चुनें (Select Station):
                </label>
                <select
                  value={selectedCounterId}
                  onChange={(e) => setSelectedCounterId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: '#ffffff',
                    border: '1.5px solid #16a34a',
                    borderRadius: '6px',
                    color: '#0f172a',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  {EXPO_COUNTERS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
              {/* If Expo Mode: Operator Name / Login ID */}
              {accessType === 'expo' ? (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    वॉलंटियर आईडी / मोबाइल नंबर (Volunteer ID or Mobile):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      required
                      placeholder="उदा. vol_rahul अथवा 9829012345"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <UserCheck size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              ) : (
                /* High Command Mode: Officer ID */
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
              )}

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  {accessType === 'expo' ? 'वॉलंटियर पासवर्ड / सुरक्षा पिन (Password / PIN):' : 'सुरक्षा पासवर्ड (Security Password):'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={accessType === 'expo' ? "PHQ द्वारा जारी पासवर्ड दर्ज करें (उदा. Vol#2027)" : "गोपनीय पासवर्ड दर्ज करें"}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: accessType === 'expo' ? '#047857' : '#0b3a75',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                  transition: 'background 0.15s ease',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!isLoading) e.currentTarget.style.background = accessType === 'expo' ? '#065f46' : '#082852';
                }}
                onMouseOut={(e) => {
                  if (!isLoading) e.currentTarget.style.background = accessType === 'expo' ? '#047857' : '#0b3a75';
                }}
              >
                {isLoading ? (
                  <span>सत्यापन जारी...</span>
                ) : (
                  <>
                    {accessType === 'expo' ? <PackageCheck size={18} color="#ffffff" /> : <Lock size={15} color="#ffffff" />}
                    <span>{accessType === 'expo' ? '📦 एक्सपो स्टेशन प्रारंभ करें (Launch Terminal)' : 'कमान पोर्टल में प्रवेश करें (Sign In)'}</span>
                    <ChevronRight size={15} />
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
