import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, ArrowLeft, CheckCircle2, QrCode, Smartphone, 
  Building2, CreditCard, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import QRCode from 'qrcode';
import { PoliceEmblem, StateEmblemOfIndia } from './Emblems';

export function GovPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  runnerData,
  category,
  categoryName,
  feeAmount = 199
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'netbanking' | 'card'
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (isOpen) {
      const generatedOrderId = `ORD2027-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedTxnId = `TXN-RAJPOL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setOrderId(generatedOrderId);
      setTransactionId(generatedTxnId);

      // Generate UPI String
      const upiString = `upi://pay?pa=rajasthanpolice.marathon@sbi&pn=Rajasthan%20Police%20Marathon%202027&am=${feeAmount}&cu=INR&tn=RPM2027-${generatedOrderId}`;
      
      QRCode.toDataURL(upiString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0a1c3d',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error("QR Code error:", err));
    }
  }, [isOpen, feeAmount]);

  if (!isOpen) return null;

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          orderId,
          transactionId,
          feeAmount,
          paymentMethod: activeTab === 'upi' ? 'UPI_QR' : activeTab === 'netbanking' ? `NETBANKING_${selectedBank.toUpperCase()}` : 'DEBIT_CARD',
          paidAt: new Date().toISOString()
        });
      }
    }, 1200);
  };

  const banks = [
    { id: 'sbi', name: 'State Bank of India (भारतीय स्टेट बैंक)' },
    { id: 'pnb', name: 'Punjab National Bank (पंजाब नेशनल बैंक)' },
    { id: 'bob', name: 'Bank of Baroda (बैंक ऑफ बड़ौदा)' },
    { id: 'rmgb', name: 'Rajasthan Marudhara Gramin Bank (RMGB)' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Government Official Header */}
        <div style={{
          background: '#0a1c3d',
          color: '#ffffff',
          padding: '14px 20px',
          borderBottom: '3px solid #d4af37',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StateEmblemOfIndia size={36} />
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
            <PoliceEmblem size={38} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fde68a', letterSpacing: '0.03em' }}>
                राजस्थान सरकार | वित्त विभाग (Government of Rajasthan)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#e2e8f0' }}>
                e-Gras / SBI ePay — आधिकारिक ई-चालान एवं शुल्क भुगतान पोर्टल
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px'
            }}
            title="रद्द करें (Cancel)"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Challan & Order Metadata Table */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '18px',
            fontSize: '0.84rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>ई-चालान / ऑर्डर संदर्भ:</span>
                <strong style={{ color: '#0a1c3d' }}>{orderId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>आवेदक का नाम:</span>
                <strong style={{ color: '#0a1c3d' }}>{runnerData?.fullName || "धावक (Runner)"}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>चयनित दौड़ श्रेणी:</span>
                <strong style={{ color: '#0a1c3d' }}>{categoryName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.74rem', display: 'block' }}>पंजीकरण शुल्क (Fee):</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a1c3d' }}>₹{feeAmount}.00</span>
              </div>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '18px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '6px',
                border: activeTab === 'upi' ? '1px solid #cbd5e1' : 'none',
                background: activeTab === 'upi' ? '#ffffff' : 'transparent',
                color: activeTab === 'upi' ? '#0a1c3d' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'upi' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <QrCode size={16} />
              <span>UPI / Bharat QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '6px',
                border: activeTab === 'netbanking' ? '1px solid #cbd5e1' : 'none',
                background: activeTab === 'netbanking' ? '#ffffff' : 'transparent',
                color: activeTab === 'netbanking' ? '#0a1c3d' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'netbanking' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Building2 size={16} />
              <span>नेट बैंकिंग (Net Banking)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '6px',
                border: activeTab === 'card' ? '1px solid #cbd5e1' : 'none',
                background: activeTab === 'card' ? '#ffffff' : 'transparent',
                color: activeTab === 'card' ? '#0a1c3d' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'card' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <CreditCard size={16} />
              <span>डेबिट / क्रेडिट कार्ड</span>
            </button>
          </div>

          {/* TAB 1: UPI / Bharat QR */}
          {activeTab === 'upi' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                {qrCodeUrl ? (
                  <div style={{
                    padding: '10px',
                    border: '2px solid #0a1c3d',
                    borderRadius: '8px',
                    background: '#ffffff',
                    display: 'inline-block'
                  }}>
                    <img src={qrCodeUrl} alt="UPI QR Code" width="180" height="180" style={{ display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: '180px', height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RefreshCw className="animate-spin" size={24} color="#64748b" />
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0a1c3d', marginBottom: '4px' }}>
                किसी भी UPI ऐप से स्कैन कर भुगतान करें
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '14px' }}>
                PhonePe, Google Pay, Paytm, BHIM अथवा अन्य बैंकिंग ऐप
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: '#334155'
              }}>
                <span>आधिकारिक VPA: <strong>rajasthanpolice.marathon@sbi</strong></span>
              </div>
            </div>
          )}

          {/* TAB 2: Net Banking */}
          {activeTab === 'netbanking' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                अपना अधिकृत बैंक चुनें (Select Your Bank):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {banks.map(bank => (
                  <label
                    key={bank.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: selectedBank === bank.id ? '1.5px solid #0a1c3d' : '1px solid #e2e8f0',
                      background: selectedBank === bank.id ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  >
                    <input
                      type="radio"
                      name="bank"
                      value={bank.id}
                      checked={selectedBank === bank.id}
                      onChange={() => setSelectedBank(bank.id)}
                    />
                    <span>{bank.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Cards */}
          {activeTab === 'card' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.85rem'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  कार्ड संख्या (Card Number):
                </label>
                <input
                  type="text"
                  placeholder="xxxx xxxx xxxx xxxx"
                  defaultValue="4532 •••• •••• 8920"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    वैधता (MM / YY):
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    CVV:
                  </label>
                  <input
                    type="password"
                    maxLength="3"
                    placeholder="•••"
                    defaultValue="123"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  कार्डधारक का नाम (Name on Card):
                </label>
                <input
                  type="text"
                  placeholder="कार्ड पर लिखा नाम"
                  defaultValue={runnerData?.fullName || "RAJESH SHARMA"}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#475569',
                padding: '11px 20px',
                borderRadius: '6px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              रद्द करें (Cancel)
            </button>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              style={{
                background: '#0a1c3d',
                border: '1.5px solid #d4af37',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '6px',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(10, 28, 61, 0.25)'
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>शासकीय भुगतान सत्यापित हो रहा है...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} color="#4ade80" />
                  <span>सफल भुगतान अधिकृत करें (Pay ₹{feeAmount}.00)</span>
                </>
              )}
            </button>
          </div>

          {/* Security Assurance Footer */}
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.72rem',
            color: '#64748b'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} color="#059669" /> 256-Bit SSL Encrpyted
            </span>
            <span>•</span>
            <span>RBI / NPCI मान्यता प्राप्त शासकीय गेटवे</span>
            <span>•</span>
            <span>राजस्थान पुलिस राज्य मुख्यालय</span>
          </div>
        </div>
      </div>
    </div>
  );
}
