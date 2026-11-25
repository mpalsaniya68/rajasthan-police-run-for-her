// Rajasthan Police Marathon - Mock Data & District Registry

export const RACE_CATEGORIES = [
  {
    id: "21k",
    name: "21 KM हाफ मैराथन",
    badge: "Competitive Timed",
    distance: "21.097 KM",
    minAge: 18,
    flagOff: "06:00 AM",
    cutOffTime: "3 घंटे 30 मिनट (सुबह 09:30 AM)",
    reporting: "05:00 AM",
    description: "The premier competitive endurance run for seasoned marathoners, police personnel, and serious athletes.",
    prizes: [
      { rank: "1st", amount: "₹51,000", trophy: "🥇", label: "प्रथम" },
      { rank: "2nd", amount: "₹31,000", trophy: "🥈", label: "द्वितीय" },
      { rank: "3rd", amount: "₹21,000", trophy: "🥉", label: "तृतीय" }
    ],
    totalPrize: "₹1,03,000",
    prizeNote: "नकद पुरस्कार केवल जयपुर मुख्य फ्लैगशिप (अल्बर्ट हॉल) ओपन पोडियम हेतु लागू है।",
    perks: [
      "RFID Timing Chip Bib",
      "फिनिशर मेडल 🥇",
      "ड्राई-फिट रनिंग टी-शर्ट 👕",
      "DGP हस्ताक्षरित ई-सर्टिफिकेट",
      "एनर्जी रिफ्रेशमेंट्स व ब्रेकफास्ट 🥪"
    ],
    color: "#ff2e63",
    iconName: "Zap"
  },
  {
    id: "10k",
    name: "10 KM स्पीड रन",
    badge: "Competitive Timed",
    distance: "10.0 KM",
    minAge: 15,
    flagOff: "06:15 AM",
    cutOffTime: "1 घंटा 45 मिनट (सुबह 08:00 AM)",
    reporting: "05:15 AM",
    description: "High-energy timed course designed for intermediate runners, university athletes, and enthusiastic youth.",
    prizes: [
      { rank: "1st", amount: "₹21,000", trophy: "🥇", label: "प्रथम" },
      { rank: "2nd", amount: "₹11,000", trophy: "🥈", label: "द्वितीय" },
      { rank: "3rd", amount: "₹5,100", trophy: "🥉", label: "तृतीय" }
    ],
    totalPrize: "₹37,100",
    prizeNote: "नकद पुरस्कार केवल जयपुर मुख्य फ्लैगशिप (अल्बर्ट हॉल) ओपन पोडियम हेतु लागू है।",
    perks: [
      "RFID Timing Chip Bib",
      "फिनिशर मेडल 🥇",
      "ड्राई-फिट रनिंग टी-शर्ट 👕",
      "नेट टाइमिंग ई-प्रमाण पत्र",
      "एनर्जी रिफ्रेशमेंट्स व हाइड्रेशन 🥪"
    ],
    color: "#d4af37",
    iconName: "Flame"
  },
  {
    id: "5k",
    name: "5 KM कम्युनिटी रन",
    badge: "Statewide Mass Run",
    distance: "5.0 KM",
    minAge: 10,
    flagOff: "06:45 AM",
    cutOffTime: "1 घंटा (सुबह 07:45 AM)",
    reporting: "05:30 AM",
    description: "The flagship mass awareness run happening simultaneously in Jaipur and all 41 Rajasthan Police Districts.",
    perks: [
      "फिनिशर मेडल 🥇",
      "ड्राई-फिट रनिंग टी-शर्ट 👕",
      "पोस्ट-रन न्यूट्रिशन रिफ्रेशमेंट्स 🥪",
      "डिजिटल सहभागिता ई-प्रमाण पत्र",
      "महिला सुरक्षा जागरूकता किट"
    ],
    color: "#00d2d3",
    iconName: "Users"
  },
  {
    id: "2k",
    name: "2 KM फैमिली वॉक",
    badge: "Awareness & Family",
    distance: "2.0 KM",
    minAge: 6,
    flagOff: "07:15 AM",
    cutOffTime: "45 मिनट (सुबह 08:00 AM)",
    reporting: "06:00 AM",
    description: "A joyful, celebratory walk/jog welcoming children, families, elders, and citizens pledging for women's dignity.",
    perks: [
      "सहभागिता मेडल 🥇",
      "इवेंट टी-शर्ट 👕",
      "पोस्ट-वॉक रिफ्रेशमेंट्स 🥪",
      "डिजिटल सहभागिता प्रमाण पत्र",
      "'Run for Her' कैप व बैज"
    ],
    color: "#10ac84",
    iconName: "HeartHandshake"
  }
];

export const isJaipurDistrict = (districtId, districtName = '') => {
  const d = (districtId || '').toLowerCase();
  const n = (districtName || '').toLowerCase();
  return d.includes('jpr') || d.includes('jaipur') || n.includes('jaipur');
};

export const RAJASTHAN_POLICE_DISTRICTS = [
  // 1. State Capital / Flagship Host
  { id: "JPR-COMM", name: "Jaipur", zone: "Jaipur", flagship: true, nodalOfficer: "Addl. CP (HQ), Jaipur", flagOffVenue: "Albert Hall Museum, Ram Niwas Garden" },
  
  // 2. Jodhpur
  { id: "JDH-COMM", name: "Jodhpur", zone: "Jodhpur", nodalOfficer: "DCP (HQ), Jodhpur", flagOffVenue: "Umaid Stadium, Jodhpur" },
  
  // 3. Kota
  { id: "KTA-CITY", name: "Kota", zone: "Kota", nodalOfficer: "SP Kota", flagOffVenue: "Kishore Sagar Talab Promenade, Kota" },
  
  // 4. Ajmer Range
  { id: "AJM", name: "Ajmer", zone: "Ajmer", nodalOfficer: "SP Ajmer", flagOffVenue: "Ana Sagar Chaupati, Ajmer" },
  { id: "BHL", name: "Bhilwara", zone: "Ajmer", nodalOfficer: "SP Bhilwara", flagOffVenue: "Sukhadia Stadium, Bhilwara" },
  { id: "NGR", name: "Nagaur", zone: "Ajmer", nodalOfficer: "SP Nagaur", flagOffVenue: "District Stadium, Nagaur" },
  { id: "TNK", name: "Tonk", zone: "Ajmer", nodalOfficer: "SP Tonk", flagOffVenue: "Police Parade Ground, Tonk" },
  { id: "BWR", name: "Beawar", zone: "Ajmer", nodalOfficer: "SP Beawar", flagOffVenue: "Subhash Udyan Ground, Beawar" },
  { id: "DID", name: "Didwana-Kuchaman", zone: "Ajmer", nodalOfficer: "SP Didwana-Kuchaman", flagOffVenue: "District Sports Ground, Didwana" },
  
  // 5. Jaipur Range
  { id: "ALW", name: "Alwar", zone: "Jaipur", nodalOfficer: "SP Alwar", flagOffVenue: "Company Bagh, Alwar" },
  { id: "DSA", name: "Dausa", zone: "Jaipur", nodalOfficer: "SP Dausa", flagOffVenue: "Rajesh Pilot Stadium, Dausa" },
  { id: "JJN", name: "Jhunjhunu", zone: "Jaipur", nodalOfficer: "SP Jhunjhunu", flagOffVenue: "Swarn Jayanti Stadium, Jhunjhunu" },
  { id: "SKR", name: "Sikar", zone: "Jaipur", nodalOfficer: "SP Sikar", flagOffVenue: "District Sports Stadium, Sikar" },
  { id: "KHT", name: "Khairthal-Tijara", zone: "Jaipur", nodalOfficer: "SP Khairthal-Tijara", flagOffVenue: "Sports Ground, Khairthal" },
  { id: "KTP", name: "Kotputli-Behror", zone: "Jaipur", nodalOfficer: "SP Kotputli-Behror", flagOffVenue: "Police Ground, Kotputli" },
  
  // 6. Bikaner Range
  { id: "BKN", name: "Bikaner", zone: "Bikaner", nodalOfficer: "SP Bikaner", flagOffVenue: "Dr. Karni Singh Stadium, Bikaner" },
  { id: "CHU", name: "Churu", zone: "Bikaner", nodalOfficer: "SP Churu", flagOffVenue: "Police Line Ground, Churu" },
  { id: "HNM", name: "Hanumangarh", zone: "Bikaner", nodalOfficer: "SP Hanumangarh", flagOffVenue: "Rajiv Gandhi Stadium, Hanumangarh" },
  { id: "SGN", name: "Sri Ganganagar", zone: "Bikaner", nodalOfficer: "SP Sri Ganganagar", flagOffVenue: "Maharaja Ganga Singh Stadium, Sri Ganganagar" },
  
  // 7. Bharatpur Range
  { id: "BTP", name: "Bharatpur", zone: "Bharatpur", nodalOfficer: "SP Bharatpur", flagOffVenue: "Loha Garh Stadium, Bharatpur" },
  { id: "DEG", name: "Deeg", zone: "Bharatpur", nodalOfficer: "SP Deeg", flagOffVenue: "Mela Ground, Deeg" },
  { id: "DHP", name: "Dholpur", zone: "Bharatpur", nodalOfficer: "SP Dholpur", flagOffVenue: "RAC Ground, Dholpur" },
  { id: "KRL", name: "Karauli", zone: "Bharatpur", nodalOfficer: "SP Karauli", flagOffVenue: "Munshi Trilok Chand Mathur Stadium, Karauli" },
  { id: "SWM", name: "Sawai Madhopur", zone: "Bharatpur", nodalOfficer: "SP Sawai Madhopur", flagOffVenue: "Indira Ground, Sawai Madhopur" },
  
  // 8. Kota Range
  { id: "BND", name: "Bundi", zone: "Kota", nodalOfficer: "SP Bundi", flagOffVenue: "Khel Sankul, Bundi" },
  { id: "BRN", name: "Baran", zone: "Kota", nodalOfficer: "SP Baran", flagOffVenue: "Police Lines, Baran" },
  { id: "JHL", name: "Jhalawar", zone: "Kota", nodalOfficer: "SP Jhalawar", flagOffVenue: "Sports Complex, Jhalawar" },
  
  // 9. Jodhpur Range
  { id: "BLT", name: "Balotra", zone: "Jodhpur", nodalOfficer: "SP Balotra", flagOffVenue: "Jasol Ground, Balotra" },
  { id: "BMR", name: "Barmer", zone: "Jodhpur", nodalOfficer: "SP Barmer", flagOffVenue: "Adarsh Stadium, Barmer" },
  { id: "JSM", name: "Jaisalmer", zone: "Jodhpur", nodalOfficer: "SP Jaisalmer", flagOffVenue: "Poonam Singh Stadium, Jaisalmer" },
  { id: "JLR", name: "Jalore", zone: "Jodhpur", nodalOfficer: "SP Jalore", flagOffVenue: "Stadium Ground, Jalore" },
  { id: "PLI", name: "Pali", zone: "Jodhpur", nodalOfficer: "SP Pali", flagOffVenue: "Bangur Stadium, Pali" },
  { id: "PHL", name: "Phalodi", zone: "Jodhpur", nodalOfficer: "SP Phalodi", flagOffVenue: "Stadium Ground, Phalodi" },
  { id: "SRH", name: "Sirohi", zone: "Jodhpur", nodalOfficer: "SP Sirohi", flagOffVenue: "Arvind Pavilion, Sirohi" },
  
  // 10. Udaipur Range
  { id: "BSW", name: "Banswara", zone: "Udaipur", nodalOfficer: "SP Banswara", flagOffVenue: "Kushal Bagh Ground, Banswara" },
  { id: "CHT", name: "Chittorgarh", zone: "Udaipur", nodalOfficer: "SP Chittorgarh", flagOffVenue: "Indira Gandhi Stadium, Chittorgarh" },
  { id: "DNG", name: "Dungarpur", zone: "Udaipur", nodalOfficer: "SP Dungarpur", flagOffVenue: "Laxman Ground, Dungarpur" },
  { id: "PRT", name: "Pratapgarh", zone: "Udaipur", nodalOfficer: "SP Pratapgarh", flagOffVenue: "Sports Stadium, Pratapgarh" },
  { id: "RSM", name: "Rajsamand", zone: "Udaipur", nodalOfficer: "SP Rajsamand", flagOffVenue: "JK Stadium, Kankroli" },
  { id: "SLM", name: "Salumbar", zone: "Udaipur", nodalOfficer: "SP Salumbar", flagOffVenue: "Police Ground, Salumbar" },
  { id: "UDR", name: "Udaipur", zone: "Udaipur", nodalOfficer: "SP Udaipur", flagOffVenue: "Fateh Sagar Paal, Udaipur" }
];

export const RACE_DAY_TIMELINE = [
  { time: "05:00 AM", title: "Participant Reporting & Warm-Up", desc: "Gates open at Albert Hall & District venues. Bib verification, baggage drop, and mass Zumba energizer session." },
  { time: "05:45 AM", title: "Opening Ceremony & Women's Safety Pledge", desc: "National Anthem, Welcome Address, and all 10,000+ runners taking the official 'Run for Her' Safety Oath." },
  { time: "06:00 AM", title: "Grand Flag-off by DGP Rajeev Sharma, IPS", desc: "Official siren & countdown flag-off of 21K Half Marathon, followed by 10K, 5K, and 2K waves." },
  { time: "06:15 - 08:30 AM", title: "Running Waves & Community Engagement", desc: "Live Rajasthan Police pipe band along JLN Marg, hydration points, cheer stations, and interactive safety displays." },
  { time: "08:30 - 10:00 AM", title: "Finish Line Festivities & Refreshments", desc: "Medal presentation at finish gantry, energetic breakfast, hydration zone, photo booths, and live DJ." }
];

export const SAFETY_HELPLINES = [
  { number: "112", title: "National Emergency Response", desc: "One-touch emergency assistance across all police, fire, and ambulance services." },
  { number: "1090", title: "Women Helpline (Garima)", desc: "Dedicated 24x7 Rajasthan Police helpline for prompt support against harassment or distress." },
  { number: "RajCop Citizen", title: "Official Police App", desc: "Mobile SOS feature, instant complaint filing, and verification directly to nearest PCR." },
  { number: "Nirbhaya Squad", title: "Mobile Patrols", desc: "Specially trained female tactical police personnel patrolling public spots and educational hubs." }
];

// Sample pre-loaded participants and verified finisher records (3 Canonical Example Runners)
export const INITIAL_REGISTRATIONS = [
  {
    id: "P-2fdfdd3a",
    bibNumber: "RJ-21K-1009",
    certificateId: "RJ-POL-2027-03ABE3",
    fullName: "Rajesh Kumar",
    gender: "Male",
    age: 26,
    mobile: "9829012345",
    email: "runner.demo@rajasthanpolice.gov.in",
    category: "21k",
    categoryName: "21 KM Half Marathon",
    venueType: "jaipur",
    districtName: "जयपुर (Jaipur)",
    runnerType: "Citizen Runner",
    tshirtSize: "L",
    emergencyContact: "9829099999 (Guardian)",
    registeredAt: "2026-11-11 08:33 AM",
    bibCollected: true,
    isCompleted: true,
    finishTime: "01:34:20",
    chipTime: "01:34:02",
    overallRank: "5 / 2410",
    genderRank: "4 / 1490",
    avgPace: "4:28 min/km",
    pledgeTaken: true,
    certificateIssued: true,
    status: "CERT_ISSUED",
    deliveryStatus: { sms: "Delivered", whatsapp: "Sent", email: "Delivered" }
  },
  {
    id: "REG-102",
    bibNumber: "RJ-10K-3419",
    certificateId: "RPM-2027-RAJ-3419",
    fullName: "Sub-Inspector Vikram Singh Shekhawat",
    gender: "Male",
    age: 31,
    mobile: "9414012345",
    email: "vikram.police@rajasthan.gov.in",
    category: "10k",
    categoryName: "10 KM Speed Run",
    venueType: "jaipur",
    districtName: "Jaipur",
    runnerType: "Police Personnel",
    tshirtSize: "L",
    emergencyContact: "Sunita Kanwar (94140 11223)",
    registeredAt: "2026-10-25 02:40 PM",
    bibCollected: true,
    isCompleted: true,
    finishTime: "00:44:10",
    chipTime: "00:43:55",
    overallRank: "21 / 3800",
    genderRank: "18 / 2650",
    avgPace: "4:24 min/km",
    pledgeTaken: true,
    certificateIssued: true,
    status: "CERT_ISSUED",
    deliveryStatus: { sms: "Delivered", whatsapp: "Sent", email: "Delivered" }
  },
  {
    id: "P-3042",
    bibNumber: "RJ-05K-3042",
    certificateId: "RJ-POL-2027-3042",
    fullName: "Kavita Meena",
    gender: "Female",
    age: 24,
    mobile: "9414000002",
    email: "kavita.meena@example.com",
    category: "5k",
    categoryName: "5 KM Community Run",
    venueType: "district",
    districtName: "Udaipur",
    runnerType: "Citizen Runner",
    tshirtSize: "N/A",
    emergencyContact: "Dr. R.K. Sharma (94140 99887)",
    registeredAt: "2026-10-25 04:15 PM",
    bibCollected: true,
    isCompleted: true,
    finishTime: "00:27:42",
    chipTime: "00:27:30",
    overallRank: "112 / 4150",
    genderRank: "24 / 2100",
    avgPace: "5:32 min/km",
    pledgeTaken: true,
    certificateIssued: true,
    status: "CERT_ISSUED",
    deliveryStatus: { sms: "Delivered", whatsapp: "Sent", email: "Delivered" }
  }
];

// Jaipur JLN Marg Heritage Course RFID Timing Gates & Key Landmarks
export const TRACKING_CHECKPOINTS = [
  { id: 'start', name: 'Albert Hall Museum (Flag-Off Gantry)', km: 0, landmark: 'राम निवास बाग, जयपुर', icon: 'Flag' },
  { id: 'cp_2_5k', name: 'Birla Mandir Crossing', km: 2.5, landmark: 'जेएलएन मार्ग, टोंक रोड कट', icon: 'Droplets' },
  { id: 'cp_5k', name: 'Rajasthan University Main Gate', km: 5.0, landmark: 'आरयू गेट (5K U-Turn / 10K-21K Straight)', icon: 'Timer' },
  { id: 'cp_7_5k', name: 'Gandhinagar Station Mod', km: 7.5, landmark: 'गांधीनगर मोड़, बजाज नगर', icon: 'HeartPulse' },
  { id: 'cp_10k', name: 'World Trade Park (WTP)', km: 10.0, landmark: 'WTP गेट (10K U-Turn / 21K Straight)', icon: 'Timer' },
  { id: 'cp_15k', name: 'Jawahar Circle / Patrika Gate', km: 15.0, landmark: 'जवाहर सर्किल लूप एवं पत्रिका गेट', icon: 'Music' },
  { id: 'cp_18k', name: 'Amar Jawan Jyoti Loop', km: 18.0, landmark: 'अमर जवान ज्योति / जनपथ क्रॉसिंग', icon: 'Shield' },
  { id: 'finish', name: 'Albert Hall Grand Finish Line', km: 21.097, landmark: 'अल्बर्ट हॉल फिनिशर मेडल एरिना', icon: 'Award' }
];

// Simulated Live Runner Tracks for Real-Time Course Visualizer (3 Canonical Example Runners)
export const INITIAL_TRACKING_PROFILES = [
  {
    bibNumber: "RJ-21K-1009",
    fullName: "Rajesh Kumar",
    category: "21k",
    categoryName: "21 KM Half Marathon",
    totalCourseKm: 21.097,
    gender: "Male",
    age: 26,
    mobile: "+91 98290 12345",
    districtName: "Jaipur",
    runnerType: "Citizen Runner",
    status: "FINISHED",
    currentKm: 21.097,
    currentProgressPct: 100,
    lastCheckpointId: "finish",
    lastCheckpointName: "Albert Hall Grand Finish Line",
    lastSeenTime: "07:34:20 AM",
    startTime: "06:00:00 AM",
    elapsedTime: "01:34:20",
    currentPace: "4:28 min/km",
    currentSpeed: "13.4 km/h",
    projectedFinishTime: "07:34:20 AM",
    projectedChipTime: "01:34:02",
    overallRank: "5 / 2410",
    genderRank: "4 / 1490",
    cheersCount: 94,
    safetyStatus: "NORMAL",
    splits: [
      { checkpointId: "start", name: "Albert Hall (Flag-Off)", distanceKm: 0, timestamp: "06:00:15 AM", splitTime: "00:00:00", pace: "-", status: "completed" },
      { checkpointId: "cp_2_5k", name: "Birla Mandir Crossing", distanceKm: 2.5, timestamp: "06:11:20 AM", splitTime: "00:11:05", pace: "4:26", status: "completed" },
      { checkpointId: "cp_5k", name: "Rajasthan University Gate", distanceKm: 5.0, timestamp: "06:22:35 AM", splitTime: "00:11:15", pace: "4:30", status: "completed" },
      { checkpointId: "cp_7_5k", name: "Gandhinagar Mod", distanceKm: 7.5, timestamp: "06:33:45 AM", splitTime: "00:11:10", pace: "4:28", status: "completed" },
      { checkpointId: "cp_10k", name: "World Trade Park (WTP)", distanceKm: 10.0, timestamp: "06:44:55 AM", splitTime: "00:11:10", pace: "4:28", status: "completed" },
      { checkpointId: "cp_15k", name: "Jawahar Circle / Patrika Gate", distanceKm: 15.0, timestamp: "07:07:20 AM", splitTime: "00:22:25", pace: "4:29", status: "completed" },
      { checkpointId: "cp_18k", name: "Amar Jawan Jyoti Loop", distanceKm: 18.0, timestamp: "07:20:40 AM", splitTime: "00:13:20", pace: "4:27", status: "completed" },
      { checkpointId: "finish", name: "Albert Hall Finish Line", distanceKm: 21.097, timestamp: "07:34:20 AM", splitTime: "00:13:40", pace: "4:25", status: "completed" }
    ]
  },
  {
    bibNumber: "RJ-10K-3419",
    fullName: "Sub-Inspector Vikram Singh Shekhawat",
    category: "10k",
    categoryName: "10 KM Speed Run",
    totalCourseKm: 10.0,
    gender: "Male",
    age: 31,
    mobile: "+91 94140 12345",
    districtName: "Jaipur",
    runnerType: "Police Personnel",
    status: "FINISHED",
    currentKm: 10.0,
    currentProgressPct: 100,
    lastCheckpointId: "finish",
    lastCheckpointName: "Albert Hall Grand Finish Line",
    lastSeenTime: "06:59:10 AM",
    startTime: "06:15:00 AM",
    elapsedTime: "00:44:10",
    currentPace: "4:24 min/km",
    currentSpeed: "13.6 km/h",
    projectedFinishTime: "06:59:10 AM",
    projectedChipTime: "00:43:55",
    overallRank: "21 / 3800",
    genderRank: "18 / 2650",
    cheersCount: 88,
    safetyStatus: "NORMAL",
    splits: [
      { checkpointId: "start", name: "Albert Hall (Flag-Off)", distanceKm: 0, timestamp: "06:15:15 AM", splitTime: "00:00:00", pace: "-", status: "completed" },
      { checkpointId: "cp_2_5k", name: "Birla Mandir Crossing", distanceKm: 2.5, timestamp: "06:26:10 AM", splitTime: "00:10:55", pace: "4:22", status: "completed" },
      { checkpointId: "cp_5k", name: "Rajasthan University Gate", distanceKm: 5.0, timestamp: "06:37:12 AM", splitTime: "00:11:02", pace: "4:24", status: "completed" },
      { checkpointId: "cp_7_5k", name: "Gandhinagar Mod", distanceKm: 7.5, timestamp: "06:48:15 AM", splitTime: "00:11:03", pace: "4:25", status: "completed" },
      { checkpointId: "finish", name: "Albert Hall Finish Line", distanceKm: 10.0, timestamp: "06:59:10 AM", splitTime: "00:10:55", pace: "4:22", status: "completed" }
    ]
  },
  {
    bibNumber: "RJ-05K-3042",
    fullName: "Kavita Meena",
    category: "5k",
    categoryName: "5 KM Community Run",
    totalCourseKm: 5.0,
    gender: "Female",
    age: 24,
    mobile: "+91 94140 00002",
    districtName: "Udaipur",
    runnerType: "Citizen Runner",
    status: "FINISHED",
    currentKm: 5.0,
    currentProgressPct: 100,
    lastCheckpointId: "finish",
    lastCheckpointName: "Albert Hall Finish Gantry",
    lastSeenTime: "07:12:45 AM",
    startTime: "06:45:00 AM",
    elapsedTime: "00:27:42",
    currentPace: "5:32 min/km",
    currentSpeed: "10.8 km/h",
    projectedFinishTime: "07:12:45 AM",
    projectedChipTime: "00:27:30",
    overallRank: "112 / 4150",
    genderRank: "24 / 2100",
    cheersCount: 53,
    safetyStatus: "NORMAL",
    splits: [
      { checkpointId: "start", name: "Albert Hall (Flag-Off)", distanceKm: 0, timestamp: "06:45:15 AM", splitTime: "00:00:00", pace: "-", status: "completed" },
      { checkpointId: "cp_2_5k", name: "Birla Mandir Crossing", distanceKm: 2.5, timestamp: "06:58:50 AM", splitTime: "00:13:35", pace: "5:26", status: "completed" },
      { checkpointId: "finish", name: "Albert Hall Finish Line", distanceKm: 5.0, timestamp: "07:12:45 AM", splitTime: "00:13:55", pace: "5:34", status: "completed" }
    ]
  }
];

export const PROHIBITED_ITEMS = [
  { item: "साइकिल, स्केटबोर्ड या रोलर स्केट्स", reason: "धावकों की सुरक्षा की दृष्टि से केवल अधिकृत पुलिस पायलट वाहन ही कोर्स पर मान्य होंगे।" },
  { item: "पालतू जानवर (Pets)", reason: "दौड़ मार्ग पर किसी भी प्रकार के पालतू जानवर लाने की अनुमति नहीं है।" },
  { item: "कांच की बोतलें / नुकीली वस्तुएं", reason: "केवल रिसाइकिल-योग्य डिस्पोजेबल कप व पेपर फ्लास्क ही उपयोग करें।" },
  { item: "राजनैतिक या वाणिज्यिक बैनर", reason: "यह केवल नारी सुरक्षा और खेल भावना को समर्पित गैर-व्यावसायिक आयोजन है।" }
];

export const NODAL_OFFICIALS = [
  { designation: "अतिरिक्त पुलिस महानिदेशक (ADGP)", role: "राज्य नोडल प्रभारी, कम्युनिटी पुलिसिंग", office: "पुलिस मुख्यालय, जयपुर", contact: "0141-2600000" },
  { designation: "पुलिस उपायुक्त (DCP Traffic)", role: "रूट, ट्रैफिक डायवर्जन एवं कॉरिडोर सुरक्षा", office: "जयपुर पुलिस", contact: "0141-2565656" },
  { designation: "मुख्य चिकित्सा एवं स्वास्थ्य अधिकारी (CMHO)", role: "आपातकालीन चिकित्सा एवं एम्बुलेंस ग्रिड", office: "स्वास्थ्य विभाग, जयपुर", contact: "108 / 102" },
  { designation: "महिला सुरक्षा नोडल कमान (निर्भया स्क्वाड)", role: "महिला धावक सुरक्षा एवं गरिमा हेल्पलाइन", office: "गरिमा डेस्क, राजस्थान पुलिस", contact: "1090 / 112" }
];
