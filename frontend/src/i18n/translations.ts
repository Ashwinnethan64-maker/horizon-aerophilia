export type Language = 'en' | 'kn';

export const translations = {
  en: {
    app: {
      brandSubtitle: 'Mangaluru–Gurupura–Polali Student Mobility',
      transparencyNotice:
        'Data Transparency Notice: All vehicle replays and capacity metrics reflect deterministic timetable simulations. No real-time GPS telemetry is implied.',
      dismissNotice: 'Dismiss notice',
      mockMode: 'Mock Mode',
      liveApi: 'Live API',
      syncing: 'Synchronizing...',
      home: 'Home',
      owner: 'Owner',
      student: 'Student',
      retry: 'Retry',
      noticePrefix: 'Notice:',
      aboutTitle: 'About YatraGrid Platform',
      aboutDesc:
        'YatraGrid connects student commuting demand with practical bus operations and schedule optimization across Mangaluru, Gurupura, and Polali.',
      corePrinciples: 'Core Principles:',
      principle1: 'Deterministic Simulation: Seeded engine runs reproducible timetable evaluations.',
      principle2: 'Transparent Viability: Displays operating costs, revenue, and viability gap clearly.',
      principle3: 'Shared System: Student registrations directly feed the optimizer without artificial data splits.',
      close: 'Close',
      footerTagline: 'Every Student. Every Route. Connected.',
      activeScenario: 'Active Scenario:',
      engineLabel: 'Deterministic TS Engine'
    },
    landing: {
      badge: 'Demand-Driven Mobility',
      heroTitlePrefix: 'Every Student.',
      heroTitleHighlight: 'Every Route.',
      heroTitleSuffix: 'Connected.',
      heroDesc:
        'See where students need transport, plan bus schedules around real demand, and make journeys more reliable across Mangaluru, Gurupura, Polali and surrounding communities.',
      ctaOwner: 'Explore as Bus Owner',
      ctaStudent: 'Find My Bus',
      deterministicEngine: 'Deterministic Timetable Engine',
      corridorPreview: 'Corridor Preview',
      studyBuffer: '+5 km Study Buffer',
      sharedDemand: 'Shared Demand Registry:',
      studentsCount: 'Students',
      simulatedTag: 'SIMULATED',
      problemBadge: 'The Rural Mobility Gap',
      prob1Title: 'Overloaded Peak Buses',
      prob1Desc: 'Intermediate village stops face packed buses at 07:30 AM, leaving students stranded before school hours.',
      prob2Title: 'Mismatched Empty Runs',
      prob2Desc: 'Operators run fixed timetables without clear stop-by-stop student demand data, hurting daily viability.',
      prob3Title: 'Uncertain Student Journeys',
      prob3Desc: 'Students lack clear scheduled pickup times, crowding expectations, and honest fallback options.',
      ownerTag: 'For Bus Owners & Operators',
      ownerTitle: 'Operations Command Centre',
      ownerDesc:
        'Inspect stop-level demand heatmaps, replay deterministic timetable simulations on an interactive Leaflet map, test What-If changes, and optimize fleet schedules.',
      openOwner: 'Open Owner Portal',
      studentTag: 'For Students & Parents',
      studentTitle: 'Student Commute Companion',
      studentDesc:
        'Check your next scheduled morning bus, view crowding advisories, register your daily boarding stop, and browse corridor routes in English or ಕನ್ನಡ.',
      openStudent: 'Open Student Companion',
      howTitle: 'How YatraGrid Works',
      howSub: 'Shared demand data connects both portals',
      steps: [
        { step: '01', title: 'Register Demand', desc: 'Students submit home stop, deadline & commute days.' },
        { step: '02', title: 'Understand Demand', desc: 'Heatmaps highlight over-capacity stops & slots.' },
        { step: '03', title: 'Simulate', desc: 'Seeded engine replays boarding, waits & stranding.' },
        { step: '04', title: 'Optimize', desc: 'Respects fleet count, seat capacity & driver hours.' },
        { step: '05', title: 'Publish Schedule', desc: 'Updated departures appear in Student Companion.' }
      ],
      coverageTag: 'Mangaluru–Gurupura–Polali Corridor',
      coverageTitle: 'Ready to test the corridor simulation?',
      coverageDesc:
        'Switch seamlessly between the Owner Operations Console and Student Companion using real deterministic fixtures or the live Express API.',
      launchOwner: 'Launch Owner Portal',
      launchStudent: 'Launch Student Portal'
    },
    scenarios: {
      label: 'Scenarios:',
      baseline: 'Normal Day',
      exam_surge: 'Exam Day Surge',
      monsoon_rain: 'Monsoon Rain',
      breakdown_b1: 'Bus B1 Breakdown',
      bridge_repair: 'Chandan Bridge Closure'
    },
    impact: {
      title: 'Performance & Financial Viability Metrics',
      simulated: 'Simulated',
      subtitle: 'Holistic assessment of student accessibility, travel comfort, and carrier operating costs.',
      optimizedPlan: 'Optimized Plan',
      baselineSchedule: 'Baseline Schedule',
      servedOnTime: 'Served On Time',
      stranded: 'Stranded Students',
      avgWait: 'Average Wait',
      loadFactor: 'Fleet Load Factor',
      revenue: 'Est. Daily Revenue',
      cost: 'Operating Cost',
      viabilityGap: 'Viability Gap'
    },
    heatmap: {
      title: 'Stop Demand vs. Available Seats',
      all: 'All Morning',
      early: '≤ 08:15 AM',
      late: '> 08:15 AM',
      pressure: 'Capacity Pressure:',
      loading: 'Loading stop demand analytics...',
      demandSeries: 'Student Demand',
      baselineSeries: 'Baseline Seats',
      optimizedSeries: 'Optimized Seats'
    },
    owner: {
      baseline: 'Baseline',
      optimized: 'Optimized',
      optimizeBtn: 'Optimize Schedule',
      optimizing: 'Optimizing...',
      applyBtn: 'Apply Recommended Schedule',
      appliedBadge: 'Schedule Applied',
      tabs: {
        overview: 'Live Simulation & Map',
        optimizer: 'Route Optimizer & What-If',
        demand: 'Demand Intelligence',
        routes: 'Routes & Stops',
        fleet: 'Fleet & Constraints',
        financial: 'Financial Insights'
      },
      whatIfTitle: 'Natural Language What-If',
      whatIfDesc: 'Test hypothetical schedule shifts or capacity adjustments in plain English.',
      whatIfPlaceholder: 'e.g. Move Bus 3 to 07:45 AM...',
      outcomeEvaluated: 'Outcome Evaluated',
      reportsTitle: 'Live Student Commute Reports & Feedback'
    }
  },
  kn: {
    app: {
      brandSubtitle: 'ಮಂಗಳೂರು–ಗುರುಪುರ–ಪೊಳಲಿ ವಿದ್ಯಾರ್ಥಿ ಸಂಚಾರ',
      transparencyNotice:
        'ಮಾಹಿತಿ ಪಾರದರ್ಶಕತೆ ಸೂಚನೆ: ಎಲ್ಲಾ ವಾಹನ ಚಲನೆ ಮತ್ತು ಆಸನ ಮಾಹಿತಿಗಳು ನಿಗದಿತ ವೇಳಾಪಟ್ಟಿ ಸಿಮ್ಯುಲೇಶನ್ ಆಧಾರಿತವಾಗಿವೆ. ಇದು ಲೈವ್ GPS ಟ್ರ್ಯಾಕಿಂಗ್ ಅಲ್ಲ.',
      dismissNotice: 'ಸೂಚನೆ ಮುಚ್ಚಿ',
      mockMode: 'ಮಾಕ್ ಮೋಡ್',
      liveApi: 'ಲೈವ್ API',
      syncing: 'ಸಿಂಕ್ರೊನೈಸ್ ಆಗುತ್ತಿದೆ...',
      home: 'ಮುಖಪುಟ',
      owner: 'ಮಾಲೀಕರು',
      student: 'ವಿದ್ಯಾರ್ಥಿ',
      retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      noticePrefix: 'ಸೂಚನೆ:',
      aboutTitle: 'YatraGrid ವೇದಿಕೆಯ ಬಗ್ಗೆ',
      aboutDesc:
        'YatraGrid ಮಂಗಳೂರು, ಗುರುಪುರ ಮತ್ತು ಪೊಳಲಿ ಮಾರ್ಗಗಳಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಪ್ರಯಾಣದ ಬೇಡಿಕೆಯನ್ನು ಬಸ್ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ವೇಳಾಪಟ್ಟಿ ಆಪ್ಟಿಮೈಸೇಶನ್‌ನೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
      corePrinciples: 'ಮುಖ್ಯ ತತ್ವಗಳು:',
      principle1: 'ನಿಖರ ಸಿಮ್ಯುಲೇಶನ್: ಬೀಜಿತ ಎಂಜಿನ್ ಪುನರಾವರ್ತಿತ ವೇಳಾಪಟ್ಟಿ ಮೌಲ್ಯಮಾಪನ ನಡೆಸುತ್ತದೆ.',
      principle2: 'ಪಾರದರ್ಶಕ ಆರ್ಥಿಕತೆ: ಕಾರ್ಯಾಚರಣೆ ವೆಚ್ಚ, ಆದಾಯ ಮತ್ತು ಕೊರತೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸುತ್ತದೆ.',
      principle3: 'ಹಂಚಿದ ವ್ಯವಸ್ಥೆ: ವಿದ್ಯಾರ್ಥಿಗಳ ನೋಂದಣಿಗಳು ನೇರವಾಗಿ ಆಪ್ಟಿಮೈಜರ್‌ಗೆ ಸೇರುತ್ತವೆ.',
      close: 'ಮುಚ್ಚಿ',
      footerTagline: 'ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿ. ಪ್ರತಿ ಮಾರ್ಗ. ಸಂಪರ್ಕಿತ.',
      activeScenario: 'ಸಕ್ರಿಯ ಸನ್ನಿವೇಶ:',
      engineLabel: 'ನಿರ್ಧಾರಿತ TS ಎಂಜಿನ್'
    },
    landing: {
      badge: 'ಬೇಡಿಕೆ-ಆಧಾರಿತ ಸಂಚಾರ',
      heroTitlePrefix: 'ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿ.',
      heroTitleHighlight: 'ಪ್ರತಿ ಮಾರ್ಗ.',
      heroTitleSuffix: 'ಸಂಪರ್ಕಿತ.',
      heroDesc:
        'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಎಲ್ಲಿ ಸಾರಿಗೆ ಅಗತ್ಯವಿದೆ ಎಂಬುದನ್ನು ನೋಡಿ, ನೈಜ ಬೇಡಿಕೆಗೆ ಅನುಗುಣವಾಗಿ ಬಸ್ ವೇಳಾಪಟ್ಟಿಗಳನ್ನು ಯೋಜಿಸಿ ಮತ್ತು ಸ್ಥಳೀಯ ಸಮುದಾಯಗಳಲ್ಲಿ ಪ್ರಯಾಣವನ್ನು ವಿಶ್ವಾಸಾರ್ಹಗೊಳಿಸಿ.',
      ctaOwner: 'ಬಸ್ ಮಾಲೀಕರಾಗಿ ವೀಕ್ಷಿಸಿ',
      ctaStudent: 'ನನ್ನ ಬಸ್ ಹುಡುಕಿ',
      deterministicEngine: 'ನಿರ್ಧಾರಿತ ವೇಳಾಪಟ್ಟಿ ಎಂಜಿನ್',
      corridorPreview: 'ಮಾರ್ಗ ಮುನ್ನೋಟ',
      studyBuffer: '+5 ಕಿ.ಮೀ ಅಧ್ಯಯನ ವ್ಯಾಪ್ತಿ',
      sharedDemand: 'ಹಂಚಿದ ಬೇಡಿಕೆ ನೋಂದಣಿ:',
      studentsCount: 'ವಿದ್ಯಾರ್ಥಿಗಳು',
      simulatedTag: 'ಸಿಮ್ಯುಲೇಟೆಡ್',
      problemBadge: 'ಗ್ರಾಮೀಣ ಸಂಚಾರದ ಅಂತರ',
      prob1Title: 'ಬೆಳಗಿನ ದಟ್ಟಣೆಯ ಬಸ್‌ಗಳು',
      prob1Desc: 'ಮಧ್ಯದ ಗ್ರಾಮ ನಿಲ್ದಾಣಗಳಲ್ಲಿ ಬೆಳಗ್ಗೆ 07:30 ಕ್ಕೆ ಬಸ್‌ಗಳು ತುಂಬಿರುತ್ತವೆ, ವಿದ್ಯಾರ್ಥಿಗಳು ಶಾಲೆಗೆ ತಲುಪಲು ಕಷ್ಟಪಡುತ್ತಾರೆ.',
      prob2Title: 'ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದ ಖಾಲಿ ಸಂಚಾರ',
      prob2Desc: 'ನಿಲ್ದಾಣವಾರು ವಿದ್ಯಾರ್ಥಿ ಬೇಡಿಕೆ ಮಾಹಿತಿ ಇಲ್ಲದೆ ನಿಗದಿತ ವೇಳಾಪಟ್ಟಿ ನಡೆಸುವುದರಿಂದ ಆರ್ಥಿಕ ನಷ್ಟವಾಗುತ್ತದೆ.',
      prob3Title: 'ಅನಿಶ್ಚಿತ ವಿದ್ಯಾರ್ಥಿ ಪ್ರಯಾಣ',
      prob3Desc: 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸ್ಪಷ್ಟ ಬಸ್ ಸಮಯ, ಜನದಟ್ಟಣೆ ಮಾಹಿತಿ ಮತ್ತು ಪರ್ಯಾಯ ಆಯ್ಕೆಗಳು ಸಿಗುವುದಿಲ್ಲ.',
      ownerTag: 'ಬಸ್ ಮಾಲೀಕರು ಮತ್ತು ನಿರ್ವಾಹಕರಿಗೆ',
      ownerTitle: 'ಕಾರ್ಯಾಚರಣೆ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ',
      ownerDesc:
        'ನಿಲ್ದಾಣವಾರು ಬೇಡಿಕೆ ಹೀಟ್‌ಮ್ಯಾಪ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಲೀಫ್‌ಲೆಟ್ ನಕ್ಷೆಯಲ್ಲಿ ಸಿಮ್ಯುಲೇಶನ್ ವೀಕ್ಷಿಸಿ ಮತ್ತು ವೇಳಾಪಟ್ಟಿಯನ್ನು ಆಪ್ಟಿಮೈಜ್ ಮಾಡಿ.',
      openOwner: 'ಮಾಲೀಕರ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ',
      studentTag: 'ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಪೋಷಕರಿಗೆ',
      studentTitle: 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಯಾಣ ಸಹಾಯಕ',
      studentDesc:
        'ನಿಮ್ಮ ಮುಂದಿನ ಬೆಳಗಿನ ಬಸ್ ಸಮಯ, ಜನದಟ್ಟಣೆ ಸೂಚನೆಗಳು, ದೈನಂದಿನ ನಿಲ್ದಾಣ ನೋಂದಣಿ ಮತ್ತು ಮಾರ್ಗಗಳನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ನೋಡಿ.',
      openStudent: 'ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ',
      howTitle: 'YatraGrid ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
      howSub: 'ಹಂಚಿದ ಬೇಡಿಕೆ ಮಾಹಿತಿಯು ಎರಡೂ ಪೋರ್ಟಲ್‌ಗಳನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ',
      steps: [
        { step: '01', title: 'ಬೇಡಿಕೆ ನೋಂದಾಯಿಸಿ', desc: 'ವಿದ್ಯಾರ್ಥಿಗಳು ನಿಲ್ದಾಣ, ಸಮಯ ಮತ್ತು ದಿನಗಳನ್ನು ಸಲ್ಲಿಸುತ್ತಾರೆ.' },
        { step: '02', title: 'ಬೇಡಿಕೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ', desc: 'ಹೀಟ್‌ಮ್ಯಾಪ್ ಹೆಚ್ಚುವರಿ ಬೇಡಿಕೆಯ ನಿಲ್ದಾಣಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.' },
        { step: '03', title: 'ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ', desc: 'ಎಂಜಿನ್ ಬಸ್ ಹತ್ತುವಿಕೆ, ಕಾಯುವಿಕೆ ಮತ್ತು ದಟ್ಟಣೆಯನ್ನು ಲೆಕ್ಕಹಾಕುತ್ತದೆ.' },
        { step: '04', title: 'ಆಪ್ಟಿಮೈಜ್ ಮಾಡಿ', desc: 'ಬಸ್ ಸಂಖ್ಯೆ, ಆಸನ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಚಾಲಕರ ಅವಧಿಯನ್ನು ಪಾಲಿಸುತ್ತದೆ.' },
        { step: '05', title: 'ವೇಳಾಪಟ್ಟಿ ಪ್ರಕಟಿಸಿ', desc: 'ನವೀಕರಿಸಿದ ವೇಳಾಪಟ್ಟಿ ವಿದ್ಯಾರ್ಥಿ ಆ್ಯಪ್‌ನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.' }
      ],
      coverageTag: 'ಮಂಗಳೂರು–ಗುರುಪುರ–ಪೊಳಲಿ ಕಾರಿಡಾರ್',
      coverageTitle: 'ಕಾರಿಡಾರ್ ಸಿಮ್ಯುಲೇಶನ್ ಪರೀಕ್ಷಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
      coverageDesc:
        'ಮಾಲೀಕರ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಸಹಾಯಕದ ನಡುವೆ ಸುಲಭವಾಗಿ ಬದಲಾಯಿಸಿ.',
      launchOwner: 'ಮಾಲೀಕರ ಪೋರ್ಟಲ್',
      launchStudent: 'ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್'
    },
    scenarios: {
      label: 'ಸನ್ನಿವೇಶಗಳು:',
      baseline: 'ಸಾಮಾನ್ಯ ದಿನ',
      exam_surge: 'ಪರೀಕ್ಷಾ ದಿನದ ದಟ್ಟಣೆ',
      monsoon_rain: 'ಮುಂಗಾರು ಮಳೆ',
      breakdown_b1: 'ಬಸ್ B1 ತಾಂತ್ರಿಕ ದೋಷ',
      bridge_repair: 'ಚಂದನ್ ಸೇತುವೆ ದುರಸ್ತಿ'
    },
    impact: {
      title: 'ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಆರ್ಥಿಕ ಕಾರ್ಯಸಾಧ್ಯತೆ',
      simulated: 'ಸಿಮ್ಯುಲೇಟೆಡ್',
      subtitle: 'ವಿದ್ಯಾರ್ಥಿಗಳ ಲಭ್ಯತೆ, ಪ್ರಯಾಣದ ಸೌಕರ್ಯ ಮತ್ತು ಬಸ್ ನಿರ್ವಹಣಾ ವೆಚ್ಚದ ಸಮಗ್ರ ಮೌಲ್ಯಮಾಪನ.',
      optimizedPlan: 'ಆಪ್ಟಿಮೈಸ್ಡ್ ಯೋಜನೆ',
      baselineSchedule: 'ಮೂಲ ವೇಳಾಪಟ್ಟಿ',
      servedOnTime: 'ಸಮಯಕ್ಕೆ ತಲುಪಿದವರು',
      stranded: 'ತಲುಪದ ವಿದ್ಯಾರ್ಥಿಗಳು',
      avgWait: 'ಸರಾಸರಿ ಕಾಯುವಿಕೆ',
      loadFactor: 'ಬಸ್ ಭರ್ತಿ ಪ್ರಮಾಣ',
      revenue: 'ಅಂದಾಜು ದೈನಂದಿನ ಆದಾಯ',
      cost: 'ನಿರ್ವಹಣಾ ವೆಚ್ಚ',
      viabilityGap: 'ಕಾರ್ಯಸಾಧ್ಯತಾ ಅಂತರ'
    },
    heatmap: {
      title: 'ನಿಲ್ದಾಣದ ಬೇಡಿಕೆ ಮತ್ತು ಲಭ್ಯವಿರುವ ಆಸನಗಳು',
      all: 'ಎಲ್ಲಾ ಬೆಳಗಿನ ಸಮಯ',
      early: '≤ 08:15 AM',
      late: '> 08:15 AM',
      pressure: 'ಆಸನ ಒತ್ತಡ:',
      loading: 'ನಿಲ್ದಾಣದ ಬೇಡಿಕೆ ವಿಶ್ಲೇಷಣೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      demandSeries: 'ವಿದ್ಯಾರ್ಥಿ ಬೇಡಿಕೆ',
      baselineSeries: 'ಮೂಲ ಆಸನಗಳು',
      optimizedSeries: 'ಆಪ್ಟಿಮೈಸ್ಡ್ ಆಸನಗಳು'
    },
    owner: {
      baseline: 'ಮೂಲ',
      optimized: 'ಆಪ್ಟಿಮೈಸ್ಡ್',
      optimizeBtn: 'ವೇಳಾಪಟ್ಟಿ ಆಪ್ಟಿಮೈಜ್ ಮಾಡಿ',
      optimizing: 'ಆಪ್ಟಿಮೈಜ್ ಆಗುತ್ತಿದೆ...',
      applyBtn: 'ಶಿಫಾರಸು ವೇಳಾಪಟ್ಟಿ ಅನ್ವಯಿಸಿ',
      appliedBadge: 'ವೇಳಾಪಟ್ಟಿ ಅನ್ವಯಿಸಲಾಗಿದೆ',
      tabs: {
        overview: 'ಲೈವ್ ಸಿಮ್ಯುಲೇಶನ್ ಮತ್ತು ನಕ್ಷೆ',
        optimizer: 'ಮಾರ್ಗ ಆಪ್ಟಿಮೈಜರ್ ಮತ್ತು What-If',
        demand: 'ಬೇಡಿಕೆ ವಿಶ್ಲೇಷಣೆ',
        routes: 'ಮಾರ್ಗಗಳು ಮತ್ತು ನಿಲ್ದಾಣಗಳು',
        fleet: 'ಬಸ್‌ಗಳು ಮತ್ತು ನಿಯಮಗಳು',
        financial: 'ಆರ್ಥಿಕ ಒಳನೋಟಗಳು'
      },
      whatIfTitle: 'ನೈಸರ್ಗಿಕ ಭಾಷೆಯ What-If',
      whatIfDesc: 'ವೇಳಾಪಟ್ಟಿ ಬದಲಾವಣೆಗಳು ಅಥವಾ ಆಸನ ಸಾಮರ್ಥ್ಯದ ಬದಲಾವಣೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.',
      whatIfPlaceholder: 'ಉದಾ. Move Bus 3 to 07:45 AM...',
      outcomeEvaluated: 'ಫಲಿತಾಂಶ ಮೌಲ್ಯಮಾಪನ',
      reportsTitle: 'ವಿದ್ಯಾರ್ಥಿಗಳ ಪ್ರಯಾಣ ವರದಿಗಳು ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ'
    }
  }
} as const;

