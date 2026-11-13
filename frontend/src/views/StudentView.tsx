import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Bus,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  Navigation,
  Bell,
  HelpCircle
} from 'lucide-react';
import { TransportMap, MapLayerToggles } from '../components/TransportMap';
import { computeReplaySnapshot, getReplayBounds } from '../components/simReplay';

type StudentTab = 'my_bus' | 'register' | 'routes' | 'alerts';

interface RecommendedTrip {
  busId: string;
  routeId: string;
  routeName: string;
  pickupTime: string;
  arrivalTime: string;
  travelMinutes: number;
  capacity: number;
  meetsDeadline: boolean;
  crowdingLevel: 'Normal Load' | 'Moderate Demand' | 'High Peak Crowding';
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatClock(totalMin: number): string {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const StudentView: React.FC = () => {
  const {
    network,
    students,
    registerStudent,
    reportIssue,
    isLoading,
    language,
    baselineResult,
    optimizedResult,
    currentSchedule,
    optimizedSchedule,
    viewingOptimized,
    replayTimeIndex,
    setSelectedStopId
  } = useStore();

  const [activeTab, setActiveTab] = useState<StudentTab>('my_bus');
  const [name, setName] = useState('');
  const [homeStopId, setHomeStopId] = useState('S1');
  const [arriveBy, setArriveBy] = useState('08:15');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [submitted, setSubmitted] = useState(false);

  const [reportStopId, setReportStopId] = useState('S2');
  const [reportType, setReportType] = useState<'overcrowded' | 'delayed' | 'not_arrived'>('overcrowded');
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const stops = network?.stops ?? [];
  const routes = network?.routes ?? [];
  const activeBuses = (viewingOptimized && optimizedSchedule) ? optimizedSchedule : currentSchedule;
  const activeResult = (viewingOptimized && optimizedResult) ? optimizedResult : baselineResult;

  // Ensure homeStopId and reportStopId remain valid when toggling Mock Mode <-> Live API
  useEffect(() => {
    if (!stops.length) return;
    if (!stops.some((s) => s.id === homeStopId)) {
      setHomeStopId(stops[0].id);
    }
    if (!stops.some((s) => s.id === reportStopId)) {
      setReportStopId(stops[1]?.id ?? stops[0].id);
    }
  }, [stops, homeStopId, reportStopId]);

  // Dynamically identify destination terminal stop for the selected home stop
  const destinationStopId = useMemo(() => {
    const polaliStop = stops.find((s) => s.name.toLowerCase().includes('polali'))?.id;
    const directRoute = routes.find((r) => {
      const idx = r.stopIds.indexOf(homeStopId);
      return idx >= 0 && idx < r.stopIds.length - 1;
    });
    if (polaliStop && directRoute?.stopIds.includes(polaliStop) && polaliStop !== homeStopId) {
      return polaliStop;
    }
    return directRoute?.destinationStopId ?? polaliStop ?? routes[0]?.destinationStopId ?? 'S6';
  }, [stops, routes, homeStopId]);

  const selectedStop = stops.find((s) => s.id === homeStopId);
  const destinationStop = stops.find((s) => s.id === destinationStopId);

  // Recommend best bus trip matching selected boarding stop and target arrival time
  const recommendation = useMemo<RecommendedTrip | null>(() => {
    if (!network || !activeBuses.length) return null;

    const deadlineMin = parseTime(arriveBy);
    const demandAtStop = students.filter((s) => s.homeStopId === homeStopId).length;
    const candidates: Array<RecommendedTrip & { arrMin: number }> = [];

    for (const route of routes) {
      const stopIdx = route.stopIds.indexOf(homeStopId);
      const destIdx = route.stopIds.indexOf(destinationStopId);
      if (stopIdx === -1 || destIdx === -1 || stopIdx >= destIdx) continue;

      const travelToStop = route.travelMinutes
        .slice(0, stopIdx)
        .reduce((sum, m) => sum + m, 0);
      const rideMinutes = route.travelMinutes
        .slice(stopIdx, destIdx)
        .reduce((sum, m) => sum + m, 0);

      for (const bus of activeBuses.filter((b) => b.routeId === route.id)) {
        for (const dep of bus.departureTimes) {
          const depMin = parseTime(dep);
          const pickupMin = depMin + travelToStop;
          const arrMin = pickupMin + rideMinutes;
          const loadRatio = demandAtStop / Math.max(1, bus.capacity);

          candidates.push({
            busId: bus.id,
            routeId: route.id,
            routeName: route.name ?? `Route ${route.id}`,
            pickupTime: formatClock(pickupMin),
            arrivalTime: formatClock(arrMin),
            travelMinutes: rideMinutes,
            capacity: bus.capacity,
            meetsDeadline: arrMin <= deadlineMin,
            crowdingLevel:
              loadRatio >= 0.95
                ? 'High Peak Crowding'
                : loadRatio >= 0.65
                ? 'Moderate Demand'
                : 'Normal Load',
            arrMin
          });
        }
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => {
      if (a.meetsDeadline !== b.meetsDeadline) return a.meetsDeadline ? -1 : 1;
      return a.arrMin - b.arrMin;
    });
    const best = candidates[0];
    return {
      busId: best.busId,
      routeId: best.routeId,
      routeName: best.routeName,
      pickupTime: best.pickupTime,
      arrivalTime: best.arrivalTime,
      travelMinutes: best.travelMinutes,
      capacity: best.capacity,
      meetsDeadline: best.meetsDeadline,
      crowdingLevel: best.crowdingLevel
    };
  }, [network, routes, activeBuses, homeStopId, destinationStopId, arriveBy, students]);

  const events = activeResult?.events ?? [];
  const bounds = useMemo(() => getReplayBounds(events), [events]);
  const currentMinute = bounds.minMinute + Math.min(replayTimeIndex, bounds.totalMinutes);

  const snapshot = useMemo(
    () => computeReplaySnapshot(network, students, events, activeBuses, currentMinute),
    [network, students, events, activeBuses, currentMinute]
  );

  const studentMapLayers: MapLayerToggles = {
    baseMap: true,
    coreArea: true,
    studyBuffer: false,
    routes: true,
    stops: true,
    buses: true,
    demandIntensity: false,
    anchors: true
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!days.length) return;
    const matchingRoute = routes.find((r) => {
      const idx = r.stopIds.indexOf(homeStopId);
      return idx >= 0 && r.stopIds.indexOf(destinationStopId) > idx;
    });

    await registerStudent({
      name: name.trim() || 'Student Commuter',
      homeStopId,
      destinationId: destinationStopId,
      ...(matchingRoute ? { routeId: matchingRoute.id } : {}),
      arriveBy,
      days
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNote.trim()) return;
    reportIssue({
      stopId: reportStopId,
      type: reportType,
      studentName: name.trim() || 'Student Commuter',
      note: reportNote.trim()
    });
    setReportSuccess(true);
    setReportNote('');
  };

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const dayLabels = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' }
  ];

  const t = {
    en: {
      portalTitle: 'Student Commute Companion',
      portalSubtitle: 'Mangaluru–Gurupura–Polali Corridor: find scheduled departures, see boarding points, and register your school travel demand.',
      myBusTab: 'My Morning Bus',
      registerTab: 'Register Need',
      routesTab: 'Corridor Map & Routes',
      alertsTab: 'Service Alerts',
      scheduledTag: 'Scheduled Service • Not Live GPS',
      nextTripHeader: 'Your Next Morning Journey',
      boardingStop: 'Boarding Point',
      destination: 'Terminal Destination',
      fallbackNotice: 'Alternative / Schedule Advisory',
      registerTitle: 'Express Your Daily Travel Need',
      registerDesc: 'Registering helps local bus operators align seat capacity with student morning travel times.',
      fullName: 'Student Name',
      villageStop: 'Home Village / Nearest Boarding Stop',
      arriveDeadline: 'Target School Arrival Deadline',
      travelDays: 'Commute Days',
      saveNeed: 'Submit Travel Requirement',
      regSuccess: 'Commute need recorded! This updates the regional schedule optimizer and demand analytics.',
      reportTitle: 'Report a Service Issue',
      reportDesc: 'Help operators improve service by reporting delays, full buses, or cancellations. Marked as student-reported until verified.',
      reportBtn: 'Submit Incident Notice'
    },
    kn: {
      portalTitle: 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಯಾಣ ಸಹಾಯಕ',
      portalSubtitle: 'ಮಂಗಳೂರು–ಗುರುಪುರ–ಪೊಳಲಿ ಮಾರ್ಗ: ಬಸ್ ನಿರ್ಗಮನ ಸಮಯ, ಹತ್ತುವ ನಿಲ್ದಾಣ ಮತ್ತು ನಿಮ್ಮ ಶಾಲಾ ಪ್ರಯಾಣದ ಅಗತ್ಯಗಳನ್ನು ತಿಳಿಸಿ.',
      myBusTab: 'ನನ್ನ ಬಸ್',
      registerTab: 'ಅಗತ್ಯ ದಾಖಲಿಸಿ',
      routesTab: 'ಮಾರ್ಗ ನಕ್ಷೆ',
      alertsTab: 'ಸೂಚನೆಗಳು',
      scheduledTag: 'ನಿಗದಿತ ವೇಳಾಪಟ್ಟಿ • ಲೈವ್ GPS ಅಲ್ಲ',
      nextTripHeader: 'ನಿಮ್ಮ ಮುಂದಿನ ಶಾಲಾ ಪ್ರಯಾಣ',
      boardingStop: 'ಹತ್ತುವ ನಿಲ್ದಾಣ',
      destination: 'ಗಮ್ಯಸ್ಥಾನ',
      fallbackNotice: 'ಪರ್ಯಾಯ ವೇಳಾಪಟ್ಟಿ ಸೂಚನೆ',
      registerTitle: 'ನಿಮ್ಮ ದೈನಂದಿನ ಪ್ರಯಾಣದ ಅಗತ್ಯ ದಾಖಲಿಸಿ',
      registerDesc: 'ದಾಖಲಾತಿಗಳು ಬಸ್ ಮಾಲೀಕರಿಗೆ ಸೂಕ್ತ ವೇಳಾಪಟ್ಟಿ ಸಿದ್ಧಪಡಿಸಲು ನೆರವಾಗುತ್ತವೆ.',
      fullName: 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು',
      villageStop: 'ಹತ್ತಿರದ ಬಸ್ ನಿಲ್ದಾಣ',
      arriveDeadline: 'ಶಾಲೆ ತಲುಪಬೇಕಾದ ಸಮಯ',
      travelDays: 'ಪ್ರಯಾಣಿಸುವ ದಿನಗಳು',
      saveNeed: 'ಅಗತ್ಯವನ್ನು ಸಲ್ಲಿಸಿ',
      regSuccess: 'ಪ್ರಯಾಣದ ಅಗತ್ಯ ದಾಖಲಾಗಿದೆ! ಇದು ವೇಳಾಪಟ್ಟಿ ಆಪ್ಟಿಮೈಜರ್‌ನಲ್ಲಿ ನವೀಕರಣಗೊಂಡಿದೆ.',
      reportTitle: 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      reportDesc: 'ವಿಳಂಬ ಅಥವಾ ತುಂಬಿದ ಬಸ್‌ಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ.',
      reportBtn: 'ವರದಿ ಸಲ್ಲಿಸಿ'
    }
  }[language];

  const nominalFare = network?.economics?.averageFare ?? 25;
  const alternativeBus = activeBuses.find((b) => b.id !== recommendation?.busId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Mobile-Friendly Hero Card */}
      <div className="bg-yg-secondary text-white rounded-yg-card p-6 shadow-yg-card relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#24476B] text-[11px] font-semibold text-yg-primarySoft mb-3 border border-[#3A5D82]">
            <Clock className="w-3 h-3" />
            <span>{t.scheduledTag}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            {t.portalTitle}
          </h2>
          <p className="text-yg-primarySoft text-xs sm:text-sm leading-relaxed">
            {t.portalSubtitle}
          </p>
        </div>
        <div className="absolute right-4 bottom-4 text-slate-700/30 hidden sm:block">
          <Bus className="w-24 h-24 stroke-1" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-white p-1.5 rounded-yg-card border border-yg-border shadow-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('my_bus')}
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === 'my_bus'
              ? 'bg-yg-primary text-white shadow-xs'
              : 'text-yg-textSecondary hover:text-yg-secondary hover:bg-yg-surfaceSubtle'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>{t.myBusTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === 'register'
              ? 'bg-yg-primary text-white shadow-xs'
              : 'text-yg-textSecondary hover:text-yg-secondary hover:bg-yg-surfaceSubtle'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.registerTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('routes')}
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === 'routes'
              ? 'bg-yg-primary text-white shadow-xs'
              : 'text-yg-textSecondary hover:text-yg-secondary hover:bg-yg-surfaceSubtle'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>{t.routesTab}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-yg-primary text-white shadow-xs'
              : 'text-yg-textSecondary hover:text-yg-secondary hover:bg-yg-surfaceSubtle'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t.alertsTab}</span>
        </button>
      </div>

      {/* TAB 1: MY BUS (NEXT JOURNEY CARD) */}
      {activeTab === 'my_bus' && (
        <div className="space-y-5">
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-yg-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-yg-primary">
                  Today's Morning Service
                </span>
                <h3 className="text-lg font-bold text-yg-secondary">{t.nextTripHeader}</h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  recommendation?.crowdingLevel === 'High Peak Crowding'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-yg-primarySoft text-yg-primary border-yg-primary/30'
                }`}
              >
                {recommendation?.crowdingLevel ?? 'Scheduled Lookup'}
              </span>
            </div>

            {/* Quick Boarding Stop Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-yg-surfaceSubtle p-3 rounded-xl border border-yg-border">
              <div>
                <label className="block text-[11px] font-semibold text-yg-textSecondary mb-1">
                  Check Departures From Stop
                </label>
                <select
                  value={homeStopId}
                  onChange={(e) => {
                    setHomeStopId(e.target.value);
                    setSelectedStopId(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn bg-white text-yg-secondary font-medium"
                >
                  {stops
                    .filter((s) => s.id !== destinationStopId)
                    .map((stop) => (
                      <option key={stop.id} value={stop.id}>
                        {stop.name} ({stop.id}) {stop.kannadaName ? `— ${stop.kannadaName}` : ''}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-yg-textSecondary mb-1">
                  Target School Arrival
                </label>
                <input
                  type="time"
                  value={arriveBy}
                  onChange={(e) => setArriveBy(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn bg-white text-yg-secondary font-medium"
                />
              </div>
            </div>

            {/* Departure / Arrival Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-yg-surfaceSubtle rounded-xl border border-yg-border space-y-1">
                <span className="text-xs text-yg-textSecondary font-medium">{t.boardingStop}</span>
                <div className="text-base font-bold text-yg-secondary">
                  {selectedStop?.name ?? homeStopId} (Stop {homeStopId})
                </div>
                <div className="text-xs font-semibold text-yg-primary flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {recommendation
                      ? `Scheduled: ${recommendation.pickupTime}`
                      : 'No direct morning trip found'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-yg-surfaceSubtle rounded-xl border border-yg-border space-y-1">
                <span className="text-xs text-yg-textSecondary font-medium">{t.destination}</span>
                <div className="text-base font-bold text-yg-secondary">
                  {destinationStop?.name ?? 'Polali'} ({destinationStopId})
                </div>
                <div className="text-xs font-semibold text-yg-secondary flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {recommendation
                      ? `Est. Arrival: ${recommendation.arrivalTime} (${recommendation.travelMinutes} min ride)`
                      : `Target deadline: ${arriveBy}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bus Service Details */}
            {recommendation ? (
              <div className="p-4 rounded-xl bg-yg-primarySoft/60 border border-yg-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-yg-primary text-white font-bold">
                    {recommendation.busId}
                  </div>
                  <div>
                    <div className="font-bold text-yg-secondary text-sm">
                      {recommendation.routeName} ({recommendation.routeId})
                    </div>
                    <div className="text-yg-textSecondary">
                      Seats Capacity: {recommendation.capacity} &bull; Nominal Fare: ₹{nominalFare}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('routes')}
                  className="text-xs font-bold text-yg-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Corridor Map <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                <div className="font-bold">No Direct Trip Assigned</div>
                <p>
                  No scheduled bus currently runs from <strong>{selectedStop?.name ?? homeStopId}</strong> to{' '}
                  <strong>{destinationStop?.name ?? destinationStopId}</strong>. Submit your commute demand below so the optimizer prioritizes this stop.
                </p>
              </div>
            )}

            {/* Advisory Callout */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/90 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-yg-warning" />
                <span>{t.fallbackNotice}</span>
              </div>
              <p className="leading-relaxed">
                {recommendation?.meetsDeadline === false
                  ? `The earliest scheduled arrival (${recommendation.arrivalTime}) is after your ${arriveBy} target. Register your demand so the optimizer can shift an earlier departure.`
                  : alternativeBus
                  ? `Backup fleet unit ${alternativeBus.id} (${alternativeBus.departureTimes[0] ?? '07:00'}) operates on the corridor network when peak crowding occurs at intermediate stops.`
                  : 'All vehicle arrivals follow the active morning timetable plan simulated in Operator View.'}
              </p>
            </div>
          </div>

          {/* Quick Registration Card CTA */}
          <div className="p-4 bg-white rounded-yg-card border border-yg-border flex items-center justify-between gap-3 text-xs shadow-xs">
            <div>
              <strong className="text-yg-secondary text-sm block">Need a different boarding stop or arrival time?</strong>
              <span className="text-yg-textSecondary">
                {students.length} students have currently registered commute needs.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="px-3.5 py-2 bg-yg-primary text-white rounded-yg-btn font-semibold hover:bg-yg-primaryHover transition-colors shrink-0 cursor-pointer"
            >
              Update My Commute
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER COMMUTE NEED */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-5">
          <div className="pb-3 border-b border-yg-border">
            <h3 className="font-bold text-yg-secondary text-base">{t.registerTitle}</h3>
            <p className="text-xs text-yg-textSecondary mt-0.5">{t.registerDesc}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-yg-secondary mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary bg-white text-yg-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-yg-secondary mb-1">
                {t.villageStop}
              </label>
              <select
                value={homeStopId}
                onChange={(e) => setHomeStopId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary bg-white text-yg-secondary"
              >
                {stops
                  .filter((s) => s.id !== destinationStopId)
                  .map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name} ({stop.id}) {stop.kannadaName ? `— ${stop.kannadaName}` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-yg-secondary mb-1">
                {t.destination}
              </label>
              <input
                type="text"
                disabled
                value={`${destinationStop?.name ?? 'Polali'} (${destinationStopId})`}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-yg-surfaceSubtle border border-yg-border rounded-yg-btn text-yg-textSecondary cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-yg-secondary mb-1">
                {t.arriveDeadline}
              </label>
              <input
                type="time"
                value={arriveBy}
                onChange={(e) => setArriveBy(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary bg-white text-yg-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-yg-secondary mb-1.5">
                {t.travelDays}
              </label>
              <div className="flex flex-wrap gap-2">
                {dayLabels.map((d) => {
                  const isSelected = days.includes(d.num);
                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => toggleDay(d.num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-yg-primary text-white border-yg-primary shadow-xs'
                          : 'bg-yg-surfaceSubtle text-yg-textSecondary border-yg-border hover:bg-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !days.length}
              className="w-full bg-yg-primary hover:bg-yg-primaryHover text-white font-bold py-3 rounded-yg-btn text-sm transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isLoading ? 'Saving Requirement...' : t.saveNeed}
            </button>

            {submitted && (
              <div className="p-3 bg-yg-primarySoft border border-yg-primary/30 rounded-xl flex items-center gap-2.5 text-xs text-yg-secondary font-medium">
                <CheckCircle className="w-4 h-4 text-yg-primary shrink-0" />
                <span>{t.regSuccess}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 3: ROUTES & STOPS DIRECTORY + LEAFLET MAP */}
      {activeTab === 'routes' && (
        <div className="space-y-5">
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-yg-secondary text-base">
                Interactive Mangaluru–Gurupura–Polali Map
              </h3>
              <span className="text-[10px] bg-yg-secondarySoft text-yg-secondary px-2 py-0.5 rounded-full font-bold">
                Student View
              </span>
            </div>
            <div className="w-full h-72 sm:h-96 rounded-lg overflow-hidden border border-yg-border">
              <TransportMap snapshot={snapshot} layers={studentMapLayers} />
            </div>
          </div>

          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-4">
            <h3 className="font-bold text-yg-secondary text-base">Corridor Bus Routes &amp; Stops</h3>

            <div className="space-y-4">
              {routes.map((route) => {
                const routeStops = route.stopIds
                  .map((id) => stops.find((s) => s.id === id))
                  .filter(Boolean);

                return (
                  <div
                    key={route.id}
                    className="p-4 rounded-xl bg-yg-surfaceSubtle border border-yg-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white px-2 py-0.5 rounded text-xs bg-yg-secondary">
                          {route.id}
                        </span>
                        <strong className="text-yg-secondary text-sm">{route.name ?? `Route ${route.id}`}</strong>
                      </div>
                      <span className="text-[11px] text-yg-textSecondary font-semibold">
                        Terminal: {route.destinationStopId}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {routeStops.map((st, i) => (
                        <React.Fragment key={st!.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setHomeStopId(st!.id);
                              setSelectedStopId(st!.id);
                            }}
                            className={`px-2.5 py-1 rounded-md font-medium border cursor-pointer transition-colors ${
                              st!.id === destinationStopId
                                ? 'bg-yg-primary text-white border-yg-primary font-bold'
                                : st!.id === homeStopId
                                ? 'bg-yg-secondary text-white border-yg-secondary font-bold'
                                : 'bg-white text-yg-secondary border-yg-border hover:border-yg-primary'
                            }`}
                          >
                            {st!.name} ({st!.id})
                          </button>
                          {i < routeStops.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-yg-textSecondary" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE ALERTS & REPORTING */}
      {activeTab === 'alerts' && (
        <div className="space-y-5">
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-4">
            <h3 className="font-bold text-yg-secondary text-base">Active Operational Notices</h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-yg-warning" />
                  <span>Peak Morning Corridor Crowding Watch</span>
                </div>
                <p>
                  High student boardings between 07:15 AM and 08:15 AM along Vamanjoor–Gurupura and Kadri corridors. Register your stop so schedule optimization reflects actual demand.
                </p>
                <span className="text-[10px] text-amber-700">Official Operator Notice &bull; Valid today</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Addoor &amp; Phalguni Bridge Corridor Status</span>
                </div>
                <p>
                  Corridor routes operate on normal morning headway under standard weather conditions; check operator alerts during heavy monsoon rainfall.
                </p>
                <span className="text-[10px] text-blue-700">Official Operator Notice &bull; Valid today</span>
              </div>
            </div>
          </div>

          {/* Student Delay / Overcrowding Feedback Form */}
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-4">
            <div>
              <h3 className="font-bold text-yg-secondary text-base">{t.reportTitle}</h3>
              <p className="text-xs text-yg-textSecondary mt-0.5">{t.reportDesc}</p>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-yg-secondary mb-1">
                    Affected Stop
                  </label>
                  <select
                    value={reportStopId}
                    onChange={(e) => setReportStopId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn bg-white"
                  >
                    {stops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-yg-secondary mb-1">
                    Issue Category
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'overcrowded' | 'delayed' | 'not_arrived')}
                    className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn bg-white"
                  >
                    <option value="overcrowded">Bus Packed / Could Not Board</option>
                    <option value="delayed">Bus Arrived &gt; 10m Late</option>
                    <option value="not_arrived">Bus Did Not Arrive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-yg-secondary mb-1">
                  Details / Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Morning feeder bus was full at 07:30 AM; 8 students could not get on."
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary"
                />
              </div>

              <button
                type="submit"
                disabled={!reportNote.trim()}
                className="flex items-center gap-2 bg-yg-secondary hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-yg-btn text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.reportBtn}</span>
              </button>

              {reportSuccess && (
                <div className="p-3 bg-yg-primarySoft border border-yg-primary/30 rounded-xl text-xs text-yg-secondary font-medium">
                  Notice logged! It has been posted to the operator's active feedback feed as student-reported.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;
