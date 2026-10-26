import React, { useState } from 'react';
import { Camera, Search, Clock, MapPin, Download, Share2, Sparkles, Filter, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { PoliceEmblem, RunForHerBadge } from './Emblems';

export function PhotoFinderHub() {
  const [activeTab, setActiveTab] = useState("bib"); // "bib", "timewindow", "photobooth"
  const [bibInput, setBibInput] = useState("RJ-21K-1048");
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("finish_line");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("07:15_07:30");
  const [foundPhotos, setFoundPhotos] = useState([
    {
      id: "P-101",
      location: "Albert Hall Finish Line",
      time: "07:22:18 AM",
      km: "21.097 KM",
      bibTag: "RJ-21K-1048",
      runnerName: "Pooja Choudhary",
      confidence: "99.4% AI Match",
      bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #0f2b5c 50%, #d62828 100%)",
      caption: "Crossing the finish line with triumphant fist pump at Albert Hall"
    },
    {
      id: "P-102",
      location: "JLN Marg / WTP Turnaround",
      time: "06:44:10 AM",
      km: "10.0 KM",
      bibTag: "RJ-21K-1048",
      runnerName: "Pooja Choudhary",
      confidence: "98.1% AI Match",
      bgGradient: "linear-gradient(135deg, #0a1c3d 0%, #183b75 60%, #c9184a 100%)",
      caption: "High pace rhythm running past World Trade Park cheer station"
    },
    {
      id: "P-103",
      location: "Medal Distribution Lounge",
      time: "07:35:40 AM",
      km: "Post-Finish",
      bibTag: "RJ-21K-1048",
      runnerName: "Pooja Choudhary",
      confidence: "100% Face & Bib Verified",
      bgGradient: "linear-gradient(135deg, #102444 0%, #1e40af 50%, #ab7c08 100%)",
      caption: "Receiving official Finisher Medal with Rajasthan Police officers"
    }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = bibInput.trim().toUpperCase();
    
    // Simulate finding photos for any searched bib
    setFoundPhotos([
      {
        id: "P-201",
        location: "Albert Hall Finish Gantry",
        time: "07:18:22 AM",
        km: "Finish Line",
        bibTag: query,
        runnerName: query.includes("10K") ? "Vikram Singh" : "Verified Participant",
        confidence: "98.9% AI Match",
        bgGradient: "linear-gradient(135deg, #0f2b5c 0%, #1d4ed8 50%, #c9184a 100%)",
        caption: "Finishing strong under the grand Rajasthan Police flag-off gantry"
      },
      {
        id: "P-202",
        location: "Birla Mandir Aid Station",
        time: "06:28:15 AM",
        km: "5 KM Checkpoint",
        bibTag: query,
        runnerName: query.includes("10K") ? "Vikram Singh" : "Verified Participant",
        confidence: "97.4% Match",
        bgGradient: "linear-gradient(135deg, #0a1c3d 0%, #2563eb 50%, #d97706 100%)",
        caption: "Hydration break and salute to women police volunteers"
      }
    ]);
  };

  const handleTimeWindowSearch = () => {
    setFoundPhotos([
      {
        id: "TW-1",
        location: "Albert Hall Finish Line",
        time: "07:19:40 AM",
        km: "Finish Line",
        bibTag: "Untagged Runner #1",
        runnerName: "Finish Line Group A",
        confidence: "Time-Window Match (07:15 - 07:30 AM)",
        bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #0f2b5c 50%, #d62828 100%)",
        caption: "Finish line cluster photo - Click 'Claim as My Photo' to tag your Bib"
      },
      {
        id: "TW-2",
        location: "Albert Hall Finish Line",
        time: "07:22:15 AM",
        km: "Finish Line",
        bibTag: "Untagged Runner #2",
        runnerName: "Finish Line Group B",
        confidence: "Time-Window Match (07:15 - 07:30 AM)",
        bgGradient: "linear-gradient(135deg, #0a1c3d 0%, #183b75 60%, #c9184a 100%)",
        caption: "Crossing finish timing mat with crowd cheering"
      },
      {
        id: "TW-3",
        location: "Albert Hall Finish Line",
        time: "07:26:50 AM",
        km: "Finish Line",
        bibTag: "Untagged Runner #3",
        runnerName: "Finish Line Group C",
        confidence: "Time-Window Match (07:15 - 07:30 AM)",
        bgGradient: "linear-gradient(135deg, #102444 0%, #1e40af 50%, #ab7c08 100%)",
        caption: "Finisher receiving medal from Rajasthan Police officers"
      }
    ]);
  };

  const downloadPhoto = (caption) => {
    alert(`तस्वीर डाउनलोड हो रही है: "${caption}" (HD Watermarked Quality)`);
  };

  const sharePhoto = (caption) => {
    const text = `📸 मेरी राजस्थान पुलिस मैराथन "RUN FOR HER" की आधिकारिक दौड़ तस्वीर! देखें: ${window.location.origin}#photos 🏃‍♀️👮‍♂️ #RunForHer #RajasthanPolice`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="photos" className="section-padding" style={{ position: 'relative', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge-pink">AI & Checkpoint Photo Finder</span>
          <h2>रेस फोटोज़ एवं एआई फाइंडर हब (Race Photo Finder)</h2>
          <p>
            दौड़ के दौरान खींची गई हजारों तस्वीरों में से अपनी फोटो तुरंत खोजें। एआई बिब रिकॉग्निशन एवं टाइम-विंडो बैकअप के साथ 100% फोटो प्राप्त करने की सुविधा।
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <button
            onClick={() => setActiveTab("bib")}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: activeTab === "bib" ? 'var(--police-navy-900)' : 'var(--police-navy-50)',
              color: activeTab === "bib" ? '#ffffff' : 'var(--text-body)',
              border: activeTab === "bib" ? '1px solid var(--police-navy-900)' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Camera size={15} /> 1. एआई बिब / सेल्फी द्वारा खोजें
          </button>

          <button
            onClick={() => { setActiveTab("timewindow"); handleTimeWindowSearch(); }}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: activeTab === "timewindow" ? 'var(--police-navy-900)' : 'var(--police-navy-50)',
              color: activeTab === "timewindow" ? '#ffffff' : 'var(--text-body)',
              border: activeTab === "timewindow" ? '1px solid var(--police-navy-900)' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={15} /> 2. टाइम-विंडो फॉलबैक (अगर बिब मिस हुआ)
          </button>

          <button
            onClick={() => setActiveTab("photobooth")}
            style={{
              padding: '9px 18px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: activeTab === "photobooth" ? 'var(--police-navy-900)' : 'var(--police-navy-50)',
              color: activeTab === "photobooth" ? '#ffffff' : 'var(--text-body)',
              border: activeTab === "photobooth" ? '1px solid var(--police-navy-900)' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} /> 3. आधिकारिक फिनिशर फोटो-बूथ गैलरी
          </button>
        </div>

        {/* Tab 1: AI Search Box */}
        {activeTab === "bib" && (
          <div className="gov-card" style={{ maxWidth: '680px', margin: '0 auto 30px auto', padding: '22px', border: '1px solid var(--border-medium)' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="अपना बिब नंबर दर्ज करें (उदा. RJ-21K-1048)..."
                value={bibInput}
                onChange={(e) => setBibInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-strong)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}
              />
              <button type="submit" className="btn-navy" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                <Search size={15} /> फोटो खोजें (AI Scan)
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>💡 सेल्फी अपलोड फीचर: कैमरे से चेहरा स्कैन करके भी फोटो खोजी जा सकती है।</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>✓ Zero Cost Client AI Filter</span>
            </div>
          </div>
        )}

        {/* Tab 2: Time-Window Checkpoint Fallback (Solution to Missing Photos) */}
        {activeTab === "timewindow" && (
          <div className="gov-card" style={{ maxWidth: '780px', margin: '0 auto 30px auto', padding: '22px', border: '2px solid var(--police-gold-500)', background: 'var(--police-gold-50)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertCircle size={20} color="var(--police-gold-700)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--police-navy-900)' }}>
                फुल-प्रूफ समाधान: अगर एआई से बिब नंबर मिस हो गया तो टाइम-विंडो से खोजें
              </strong>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginBottom: '14px' }}>
              दौड़ते समय हाथ आगे आने या बिब मुड़ जाने पर भी आपकी फोटो सुरक्षित है। नीचे वह चेकपॉइंट और समय चुनें जब आप वहां से गुजरे थे:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>रूट चेकपॉइंट</label>
                <select
                  value={selectedCheckpoint}
                  onChange={(e) => setSelectedCheckpoint(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="finish_line">अल्बर्ट हॉल फिनिश लाइन (Finish Line)</option>
                  <option value="wtp_10k">जेएलएन मार्ग / WTP (10 KM Turnaround)</option>
                  <option value="birla_mandir">बिड़ला मंदिर क्रॉसिंग (2.5 KM)</option>
                  <option value="flag_off">अल्बर्ट हॉल मुख्य फ्लैग-ऑफ (06:00 AM)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>आपका अनुमानित समय (Time Bracket)</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-strong)', background: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="06:30_06:45">सुबह 06:30 से 06:45 AM</option>
                  <option value="06:45_07:00">सुबह 06:45 से 07:00 AM</option>
                  <option value="07:00_07:15">सुबह 07:00 से 07:15 AM</option>
                  <option value="07:15_07:30">सुबह 07:15 से 07:30 AM (फिनिश पीक)</option>
                  <option value="07:30_07:45">सुबह 07:30 से 07:45 AM</option>
                  <option value="07:45_08:00">सुबह 07:45 से 08:00 AM</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleTimeWindowSearch}
                  className="btn-gold"
                  style={{ width: '100%', padding: '9px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  <Clock size={14} /> समय अनुसार फ़िल्टर करें
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              सिर्फ 15-20 तस्वीरों में से आप अपनी फोटो 1 क्लिक में पहचान कर क्लेम कर सकते हैं।
            </div>
          </div>
        )}

        {/* Tab 3: Official Photo Booth Info */}
        {activeTab === "photobooth" && (
          <div className="gov-card" style={{ maxWidth: '780px', margin: '0 auto 30px auto', padding: '20px', border: '1px solid #10b981', background: '#ecfdf5', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
              <Camera size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--police-navy-900)', marginBottom: '4px' }}>
              फिनिश लाइन ऑफिशियल फोटो-बूथ गैलरी
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', maxWidth: '580px', margin: '0 auto 12px auto' }}>
              अल्बर्ट हॉल परिसर में राजस्थान पुलिस बैकड्रॉप पर मेडल के साथ खींची गई सभी हाई-क्वालिटी आधिकारिक पोर्ट्रेट तस्वीरें नीचे उपलब्ध हैं।
            </p>
          </div>
        )}

        {/* Photos Grid Display */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {foundPhotos.map((photo) => (
            <div
              key={photo.id}
              className="gov-card"
              style={{
                overflow: 'hidden',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Photo Canvas Simulation with Official Police Branding */}
              <div style={{
                height: '230px',
                background: photo.bgGradient,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '14px',
                color: '#ffffff'
              }}>
                {/* Official Watermark & Bib Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(4px)', padding: '3px 8px', borderRadius: '4px' }}>
                    <PoliceEmblem size={22} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>RAJASTHAN POLICE</span>
                  </div>

                  <span style={{
                    background: 'var(--crimson-600)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    fontFamily: 'monospace'
                  }}>
                    {photo.bibTag}
                  </span>
                </div>

                {/* Center Runner Silhouette Representation */}
                <div style={{ textAlign: 'center', opacity: 0.9 }}>
                  <RunForHerBadge size={54} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '4px' }}>
                    RUN FOR HER 2026
                  </div>
                </div>

                {/* Bottom Photo Metadata Stamp */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'rgba(0, 0, 0, 0.55)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.7rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{photo.location}</div>
                    <div style={{ opacity: 0.8 }}>Time: {photo.time}</div>
                  </div>
                  <div style={{ color: '#fde68a', fontWeight: 800 }}>{photo.km}</div>
                </div>
              </div>

              {/* Photo Details & Actions */}
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, background: '#ecfdf5', padding: '2px 6px', borderRadius: '3px' }}>
                    ✓ {photo.confidence}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {photo.id}</span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', fontWeight: 600, marginBottom: '14px', minHeight: '36px' }}>
                  {photo.caption}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => downloadPhoto(photo.caption)}
                    className="btn-navy"
                    style={{ padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <Download size={13} /> HD डाउनलोड
                  </button>
                  <button
                    onClick={() => sharePhoto(photo.caption)}
                    style={{
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={13} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
