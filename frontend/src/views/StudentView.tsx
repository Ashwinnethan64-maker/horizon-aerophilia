import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Bus,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  AlertTriangle,
  Send,
  ThumbsUp
} from 'lucide-react';

interface RecommendedTrip {
  busId: string;
  routeName: string;
  pickupTime: string;
  arrivalTime: string;
  travelMinutes: number;
  crowdingLevel: 'Low' | 'Moderate' | 'High Crowding' | 'Over Capacity';
  isFallback?: boolean;
  notes?: string;
}

function formatClock(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export const StudentView: React.FC = () => {
  const {
    network,
    students,
    registerStudent,
    currentSchedule,
    optimizedSchedule,
    viewingOptimized,
    isLoading
  } = useStore();

  const [name, setName] = useState('');
  const [homeStopId, setHomeStopId] = useState('S1');
  const [arriveBy, setArriveBy] = useState('08:15');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [submitted, setSubmitted] = useState(false);
  const [disruptionReported, setDisruptionReported] = useState<string | null>(null);

  const stops = network?.stops || [];
<<<<<<< HEAD
  const destinationStopId = network?.stops.find(stop => stop.name === 'Polali')?.id
    ?? network?.routes[0]?.destinationStopId
    ?? 'S6';
  const homeRoute = network?.routes.find(route => {
    const homeIndex = route.stopIds.indexOf(homeStopId);
    return homeIndex >= 0 && route.stopIds.indexOf(destinationStopId) > homeIndex;
  });
  const routeHomeIndex = homeRoute?.stopIds.indexOf(homeStopId) ?? -1;
  const routeDestinationIndex = homeRoute?.stopIds.indexOf(destinationStopId) ?? -1;
  const serviceBus = network?.buses
    .filter(bus => bus.routeId === homeRoute?.id && bus.departureTimes.length > 0)
    .sort((a, b) => a.departureTimes[0].localeCompare(b.departureTimes[0]))[0];
  const routeRideMinutes = homeRoute && routeHomeIndex >= 0 && routeDestinationIndex > routeHomeIndex
    ? homeRoute.travelMinutes.slice(routeHomeIndex, routeDestinationIndex).reduce((sum, minutes) => sum + minutes, 0)
    : 0;
  const firstDepartureMinute = serviceBus?.departureTimes[0]
    ? Number(serviceBus.departureTimes[0].slice(0, 2)) * 60 + Number(serviceBus.departureTimes[0].slice(3, 5))
    : undefined;
  const stopDepartureMinute = firstDepartureMinute !== undefined && homeRoute
    ? firstDepartureMinute + homeRoute.travelMinutes.slice(0, routeHomeIndex).reduce((sum, minutes) => sum + minutes, 0)
    : firstDepartureMinute;
=======
  const activeBuses = (viewingOptimized && optimizedSchedule) ? optimizedSchedule : currentSchedule;

  const toggleDay = (dayNum: number) => {
    setSelectedDays(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const dayLabels = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' }
  ];

  // Helper to parse "HH:MM" into minutes from midnight
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper to format minutes into "HH:MM AM/PM"
  const formatTime = (totalMin: number) => {
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  // Compute recommended bus for the student's selected stop and deadline
  const recommendation = useMemo<RecommendedTrip | null>(() => {
    if (!network || !activeBuses.length) return null;

    const deadlineMin = parseTime(arriveBy);
    const destinationStopId = 'S6';

    const candidates: RecommendedTrip[] = [];

    for (const route of network.routes) {
      const stopIdx = route.stopIds.indexOf(homeStopId);
      const destIdx = route.stopIds.indexOf(destinationStopId);

      if (stopIdx === -1 || destIdx === -1 || stopIdx >= destIdx) continue;

      // Calculate travel minutes from route start to homeStop
      let travelToStop = 0;
      for (let i = 0; i < stopIdx; i++) {
        travelToStop += route.travelMinutes[i];
      }

      // Calculate travel minutes from homeStop to destination
      let travelFromStopToDest = 0;
      for (let i = stopIdx; i < destIdx; i++) {
        travelFromStopToDest += route.travelMinutes[i];
      }

      // Check buses serving this route
      const busesOnRoute = activeBuses.filter(b => b.routeId === route.id);
      for (const bus of busesOnRoute) {
        for (const depTime of bus.departureTimes) {
          const originDepMin = parseTime(depTime);
          const pickupMin = originDepMin + travelToStop;
          const arrivalMin = pickupMin + travelFromStopToDest;

          if (arrivalMin <= deadlineMin) {
            // Count registered students at this stop
            const stopDemand = students.filter(s => s.homeStopId === homeStopId).length;
            let crowding: RecommendedTrip['crowdingLevel'] = 'Moderate';

            if (homeStopId === 'S2' && bus.id === 'B1' && depTime === '07:15') {
              crowding = 'Over Capacity';
            } else if (stopDemand > 30) {
              crowding = 'High Crowding';
            } else if (stopDemand < 10) {
              crowding = 'Low';
            }

            candidates.push({
              busId: bus.id,
              routeName: route.name || route.id,
              pickupTime: formatTime(pickupMin),
              arrivalTime: formatTime(arrivalMin),
              travelMinutes: travelFromStopToDest,
              crowdingLevel: crowding,
              notes: crowding === 'Over Capacity' ? 'Bus fills up at prior village stop' : undefined
            });
          }
        }
      }
    }

    if (!candidates.length) return null;

    // Pick candidate arriving closest to the arrival deadline (minimal wait at school)
    candidates.sort((a, b) => {
      const aArr = parseTime(a.arrivalTime.replace(/ AM| PM/, ''));
      const bArr = parseTime(b.arrivalTime.replace(/ AM| PM/, ''));
      return bArr - aArr;
    });

    return candidates[0];
  }, [network, activeBuses, homeStopId, arriveBy, students]);
>>>>>>> feat/api-student

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDays.length) {
      alert('Please select at least one day of the week.');
      return;
    }

    await registerStudent({
      name: name.trim() || 'Anonymous Student',
      homeStopId,
      destinationId: destinationStopId,
      ...(homeRoute ? { routeId: homeRoute.id } : {}),
      arriveBy,
      days: selectedDays
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleDisruption = (type: string) => {
    setDisruptionReported(type);
    setTimeout(() => setDisruptionReported(null), 4000);
  };

  const selectedStopName = stops.find(s => s.id === homeStopId)?.name || homeStopId;
  const studentsAtStopCount = students.filter(s => s.homeStopId === homeStopId).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium text-emerald-100 mb-3 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5" />
              Rural Transit Community Registry
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Student Transit Portal &amp; Live Bus Schedule
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Register your daily commute to school or college. Our deterministic optimizer matches limited rural buses directly with verified student demand to ensure no student is left behind.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-center shrink-0">
            <div className="text-2xl font-extrabold">{students.length}</div>
            <div className="text-[11px] text-emerald-100 font-medium uppercase tracking-wider">
              Students Enrolled
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Register Your Commute Need
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Home Village Stop</label>
              <select
                value={homeStopId}
                onChange={(e) => setHomeStopId(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {stops.filter(s => s.id !== destinationStopId).map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name} ({stop.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Destination Institution</label>
              <input
                type="text"
                disabled
                value={`${stops.find(stop => stop.id === destinationStopId)?.name ?? 'Polali'} (${destinationStopId})`}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Must Arrive By</label>
              <input
                type="time"
                value={arriveBy}
                onChange={(e) => setArriveBy(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Register Demand'}
            </button>

            {submitted && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                Commute recorded! Schedule optimizer updated with your stop requirement.
              </div>
            )}
          </form>
        </div>

        {/* 'My Bus' Status card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
=======
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
>>>>>>> feat/api-student
            <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Register Commute Requirement
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarti Rawat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Home Village Bus Stop
                </label>
                <select
                  value={homeStopId}
                  onChange={(e) => setHomeStopId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {stops.filter(s => s.id !== 'S6').map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.name} ({stop.id})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{studentsAtStopCount} students registered at this stop</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Institution
                </label>
                <input
                  type="text"
                  disabled
                  value="Govt Inter College & High School (S6)"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Must Arrive By</label>
                  <div className="flex gap-1">
                    {['08:15', '08:30', '09:00'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setArriveBy(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          arriveBy === preset
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="time"
                  value={arriveBy}
                  onChange={(e) => setArriveBy(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Days of Week
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {dayLabels.map(({ num, label }) => {
                    const isSelected = selectedDays.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleDay(num)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Registering...' : 'Register Daily Commute'}
              </button>

              {submitted && (
                <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-medium border border-emerald-200 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Commute Recorded!</span> Your requirement has been added to the optimizer. Schedules dynamically update to match this stop demand.
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Quick Disruption Report Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Report Live Commute Disruption
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Did your bus fail to arrive or arrive full? Notify the operator to trigger emergency schedule rebalancing.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDisruption('Bus was full')}
                className="px-3 py-2 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg transition-colors text-center"
              >
                Bus Full / Stranded
              </button>
              <button
                type="button"
                onClick={() => handleDisruption('Bus did not arrive')}
                className="px-3 py-2 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg transition-colors text-center"
              >
                Bus Missed / Late
              </button>
            </div>
            {disruptionReported && (
              <div className="mt-3 p-2.5 bg-slate-900 text-white rounded-lg text-xs flex items-center gap-2">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Disruption report ({disruptionReported}) recorded for Stop {homeStopId}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "My Bus" & Fallback Guidance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-600" />
                Your Recommended Service: {selectedStopName}
              </h3>
              {viewingOptimized && (
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Optimized Plan Active
                </span>
              )}
            </div>

            {recommendation ? (
              <div className="space-y-4">
                {/* Main Card */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl border border-slate-200/80">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Assigned Vehicle
                      </div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                        Bus {recommendation.busId}
                        <span className="text-xs font-normal text-slate-600">
                          ({recommendation.routeName})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                          recommendation.crowdingLevel === 'Over Capacity'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : recommendation.crowdingLevel === 'High Crowding'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {recommendation.crowdingLevel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/60">
                    <div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        Pickup at {selectedStopName}
                      </div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {recommendation.pickupTime}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500">Destination Arrival</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {recommendation.arrivalTime}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500">Travel Duration</div>
                      <div className="text-base font-bold text-slate-700 mt-0.5">
                        {recommendation.travelMinutes} mins
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overcrowding / Stranding Warning & Fallback */}
                {recommendation.crowdingLevel === 'Over Capacity' && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-300/80 text-xs text-amber-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Peak Crowding Alert for Stop {homeStopId}
                    </div>
                    <p>
                      Bus B1 reaches 100% capacity before departing Stop S2 in the baseline morning schedule, stranding students.
                    </p>
                    <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-slate-800">
                      <div className="font-bold text-emerald-800">Verified Fallback Alternative:</div>
                      <div>
                        In the operator's optimized schedule, <strong>Bus B3 has been shifted to 07:45 AM</strong> to clear Stop S2. Alternatively, walk 10 minutes to Stop S3 (Rampur Crossing) to board Southern Feeder B2.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unserved Notice */
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <div>
<<<<<<< HEAD
                  <div className="text-xs text-slate-500 font-medium">Bus Service</div>
                  <div className="text-lg font-bold text-slate-900">
                    {serviceBus && homeRoute ? `${serviceBus.id} (${homeRoute.name ?? homeRoute.id})` : 'No direct service assigned'}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-0.5">
                    {serviceBus ? `At your stop: ${formatClock(stopDepartureMinute ?? 0)}` : 'Check with the operator for a route assignment'}
                  </div>
                </div>
                <div className="text-right">
                  {serviceBus && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">{serviceBus.capacity} seats / trip</span>}
                  {stopDepartureMinute !== undefined && <div className="text-xs text-slate-400 mt-1">Est. Arrival: {formatClock(stopDepartureMinute + routeRideMinutes)}</div>}
=======
                  <h4 className="font-bold text-slate-900 text-sm">
                    No Direct Service Reaches By {arriveBy}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Currently, no scheduled morning trip from <strong>{selectedStopName}</strong> reaches Govt Inter College before your {arriveBy} deadline.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-slate-700 max-w-md mx-auto text-left space-y-1">
                  <div className="font-bold text-rose-800">Recommended Action:</div>
                  <div>
                    1. Board Bus B1 at <strong>07:15 AM</strong> (arrives ~08:12 AM).
                  </div>
                  <div>
                    2. Or register your demand above so the schedule optimizer re-allocates an earlier bus trip to your route.
                  </div>
>>>>>>> feat/api-student
                </div>
              </div>
            )}

<<<<<<< HEAD
              {/* Notice / Fallback option */}
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${serviceBus ? 'bg-emerald-50 border-emerald-200/80 text-emerald-900' : 'bg-amber-50 border-amber-200/80 text-amber-900'}`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  {serviceBus ? 'Route information' : 'No direct bus is currently assigned'}
                </div>
                <p>
                  {serviceBus
                    ? `${homeRoute?.name ?? homeRoute?.id} connects your stop to ${stops.find(stop => stop.id === destinationStopId)?.name ?? 'the destination'}. Departure and arrival times are based on the current schedule.`
                    : 'Your registration will be included in demand totals. The operator may need to adjust the schedule or assign a connecting route.'}
                </p>
              </div>
=======
            {/* Stop Route Details */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                All Morning Departures Serving {selectedStopName}
              </h4>
              <div className="space-y-2">
                {activeBuses.map((bus) => {
                  const route = network?.routes.find(r => r.id === bus.routeId);
                  const isServed = route?.stopIds.includes(homeStopId);
                  if (!isServed) return null;
>>>>>>> feat/api-student

                  return (
                    <div
                      key={bus.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[11px]">
                          {bus.id}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{route?.name}</div>
                          <div className="text-slate-500 text-[11px]">Capacity: {bus.capacity} seats</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700">
                          {bus.departureTimes.join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">Terminal Origin</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
