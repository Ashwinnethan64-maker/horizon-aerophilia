import React, { useState } from 'react';
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

type StudentTab = 'my_bus' | 'register' | 'routes' | 'alerts';

export const StudentView: React.FC = () => {
  const { network, students, registerStudent, reportIssue, isLoading, language } = useStore();

  const [activeTab, setActiveTab] = useState<StudentTab>('my_bus');
  const [name, setName] = useState('');
  const [homeStopId, setHomeStopId] = useState('S1');
  const [arriveBy, setArriveBy] = useState('08:15');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [submitted, setSubmitted] = useState(false);

  // Issue reporting form state
  const [reportStopId, setReportStopId] = useState('S2');
  const [reportType, setReportType] = useState<'overcrowded' | 'delayed' | 'not_arrived'>('overcrowded');
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const stops = network?.stops || [];
  const routes = network?.routes || [];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerStudent({
      name: name.trim() || 'Anonymous Student',
      homeStopId,
      destinationId: 'S6',
      arriveBy,
      days
    });
    setSubmitted(true);
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

  // Translations helper
  const t = {
    en: {
      portalTitle: 'Student Commute Companion',
      portalSubtitle: 'Understand scheduled departures, find your boarding stop, and express your daily travel demand to school.',
      myBusTab: 'My Morning Bus',
      registerTab: 'Register Need',
      routesTab: 'Routes & Stops',
      alertsTab: 'Service Alerts',
      scheduledTag: 'Scheduled Service • Not Live GPS',
      nextTripHeader: 'Your Next Morning Journey',
      boardingStop: 'Boarding Point',
      destination: 'Terminal Institution',
      estArrival: 'Scheduled Arrival',
      departs: 'Departs Stop',
      highCrowd: 'High Peak Crowding',
      fallbackNotice: 'Alternative Morning Run Available',
      fallbackDesc: 'Bus B3 has been provisioned at 07:45 AM in the updated plan for S2 / S3 students to alleviate capacity pressure.',
      registerTitle: 'Express Your Daily Travel Need',
      registerDesc: 'Registering helps local operators align bus capacity with actual student morning commute times.',
      fullName: 'Student Name',
      villageStop: 'Home Village / Nearest Boarding Stop',
      arriveDeadline: 'Target School Arrival Deadline',
      travelDays: 'Commute Days',
      saveNeed: 'Submit Travel Requirement',
      regSuccess: 'Commute need recorded! This updates the regional schedule optimizer and demand heatmap.',
      reportTitle: 'Report a Service Issue',
      reportDesc: 'Help the operator improve service by reporting delays, full buses, or cancellations. Marked as student-reported until verified.',
      reportBtn: 'Submit Incident Notice'
    },
    kn: {
      portalTitle: 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರಯಾಣ ಸಹಾಯಕ',
      portalSubtitle: 'ಬಸ್ ನಿರ್ಗಮನ ಸಮಯ, ಹತ್ತುವ ನಿಲ್ದಾಣ ಮತ್ತು ನಿಮ್ಮ ಶಾಲಾ ಪ್ರಯಾಣದ ಅಗತ್ಯಗಳನ್ನು ತಿಳಿಸಿ.',
      myBusTab: 'ನನ್ನ ಬಸ್',
      registerTab: 'ಅಗತ್ಯ ದಾಖಲಿಸಿ',
      routesTab: 'ಮಾರ್ಗಗಳು',
      alertsTab: 'ಸೂಚನೆಗಳು',
      scheduledTag: 'ನಿಗದಿತ ವೇಳಾಪಟ್ಟಿ • ಲೈವ್ GPS ಅಲ್ಲ',
      nextTripHeader: 'ನಿಮ್ಮ ಮುಂದಿನ ಶಾಲಾ ಪ್ರಯಾಣ',
      boardingStop: 'ಹತ್ತುವ ನಿಲ್ದಾಣ',
      destination: 'ಶಾಲೆ / ಕಾಲೇಜು',
      estArrival: 'ಆಗಮನ ಸಮಯ',
      departs: 'ಹೊರಡುವ ಸಮಯ',
      highCrowd: 'ಹೆಚ್ಚಿನ ಜನದಟ್ಟಣೆ',
      fallbackNotice: 'ಪರ್ಯಾಯ ಮುಂಜಾನೆ ಬಸ್ ಲಭ್ಯವಿದೆ',
      fallbackDesc: 'S2 / S3 ನಿಲ್ದಾಣದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಬೆಳಗ್ಗೆ 07:45 ಕ್ಕೆ ಬಸ್ B3 ವ್ಯವಸ್ಥೆ ಮಾಡಲಾಗಿದೆ.',
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
        {/* Soft decorative badge in corner */}
        <div className="absolute right-4 bottom-4 text-slate-700/30 hidden sm:block">
          <Bus className="w-24 h-24 stroke-1" />
        </div>
      </div>

      {/* Navigation Tabs (Mobile bottom bar / Top bar) */}
      <div className="grid grid-cols-4 gap-1 bg-white p-1.5 rounded-yg-card border border-yg-border shadow-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('my_bus')}
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
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
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
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
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
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
          className={`py-2 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
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
          {/* Main Journey Card */}
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-yg-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-yg-primary">
                  Today's Morning Service
                </span>
                <h3 className="text-lg font-bold text-yg-secondary">{t.nextTripHeader}</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                {t.highCrowd}
              </span>
            </div>

            {/* Departure / Arrival Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-yg-surfaceSubtle rounded-xl border border-yg-border space-y-1">
                <span className="text-xs text-yg-textSecondary font-medium">{t.boardingStop}</span>
                <div className="text-base font-bold text-yg-secondary">
                  Bari Village (Stop S1)
                </div>
                <div className="text-xs font-semibold text-yg-primary flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled: 07:15 AM (Trip 1)</span>
                </div>
              </div>

              <div className="p-4 bg-yg-surfaceSubtle rounded-xl border border-yg-border space-y-1">
                <span className="text-xs text-yg-textSecondary font-medium">{t.destination}</span>
                <div className="text-base font-bold text-yg-secondary">
                  Govt Inter College &amp; High School (S6)
                </div>
                <div className="text-xs font-semibold text-yg-secondary flex items-center gap-1 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Arrival: 08:12 AM</span>
                </div>
              </div>
            </div>

            {/* Bus Service Details */}
            <div className="p-4 rounded-xl bg-yg-primarySoft/60 border border-yg-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yg-primary text-white font-bold">
                  Bus B1
                </div>
                <div>
                  <div className="font-bold text-yg-secondary text-sm">Northern Trunk Corridor</div>
                  <div className="text-yg-textSecondary">Seats Capacity: 35 &bull; Fare: ₹25</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('routes')}
                className="text-xs font-bold text-yg-primary hover:underline flex items-center gap-1"
              >
                View Full Route Stops <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Fallback Option Callout */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/90 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-yg-warning" />
                <span>{t.fallbackNotice}</span>
              </div>
              <p className="leading-relaxed">{t.fallbackDesc}</p>
            </div>
          </div>

          {/* Quick Registration Card CTA */}
          <div className="p-4 bg-white rounded-yg-card border border-yg-border flex items-center justify-between text-xs shadow-xs">
            <div>
              <strong className="text-yg-secondary text-sm block">Need a different pickup point or time?</strong>
              <span className="text-yg-textSecondary">
                {students.length} students have currently registered commute needs.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="px-3.5 py-2 bg-yg-primary text-white rounded-yg-btn font-semibold hover:bg-yg-primaryHover transition-colors shrink-0"
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
                  .filter((s) => s.id !== 'S6')
                  .map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name} ({stop.id})
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
                value="Govt Inter College & High School (Terminal S6)"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
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
              disabled={isLoading}
              className="w-full bg-yg-primary hover:bg-yg-primaryHover text-white font-bold py-3 rounded-yg-btn text-sm transition-colors disabled:opacity-50 shadow-xs"
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

      {/* TAB 3: ROUTES & STOPS DIRECTORY */}
      {activeTab === 'routes' && (
        <div className="space-y-5">
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 space-y-4">
            <h3 className="font-bold text-yg-secondary text-base">Regional Bus Routes</h3>

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
                        <strong className="text-yg-secondary text-sm">{route.name}</strong>
                      </div>
                      <span className="text-[11px] text-yg-textSecondary font-semibold">
                        Terminal: {route.destinationStopId}
                      </span>
                    </div>

                    {/* Sequence of stops */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {routeStops.map((st, i) => (
                        <React.Fragment key={st!.id}>
                          <span
                            className={`px-2.5 py-1 rounded-md font-medium border ${
                              st!.id === 'S6'
                                ? 'bg-yg-primary text-white border-yg-primary font-bold'
                                : 'bg-white text-yg-secondary border-yg-border'
                            }`}
                          >
                            {st!.name} ({st!.id})
                          </span>
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
                  <span>Kishanpur Junction Peak Crowding Warning</span>
                </div>
                <p>
                  Bus B1 reaches capacity at Stop S2. If boarding here, please consider the optimized 07:45 AM B3 trip.
                </p>
                <span className="text-[10px] text-amber-700">Official Operator Notice &bull; Valid today</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Chandan Bridge Maintenance Check</span>
                </div>
                <p>
                  Route R2 runs as scheduled under normal conditions; monitor status if rainfall increases.
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
                    onChange={(e: any) => setReportType(e.target.value)}
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
                  placeholder="e.g. Bus B1 was completely full at 07:30 AM; 8 students could not get on."
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary"
                />
              </div>

              <button
                type="submit"
                disabled={!reportNote.trim()}
                className="flex items-center gap-2 bg-yg-secondary hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-yg-btn text-xs transition-colors disabled:opacity-50"
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
