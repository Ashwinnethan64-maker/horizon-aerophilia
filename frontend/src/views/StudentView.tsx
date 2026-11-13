import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Bus, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

function formatClock(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export const StudentView: React.FC = () => {
  const { network, students, registerStudent, isLoading } = useStore();

  const [name, setName] = useState('');
  const [homeStopId, setHomeStopId] = useState('S1');
  const [arriveBy, setArriveBy] = useState('08:15');
  const [submitted, setSubmitted] = useState(false);

  const stops = network?.stops || [];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerStudent({
      name: name.trim() || 'Anonymous Student',
      homeStopId,
      destinationId: destinationStopId,
      ...(homeRoute ? { routeId: homeRoute.id } : {}),
      arriveBy,
      days: [1, 2, 3, 4, 5]
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Student Transit Portal & Daily Schedule</h2>
        <p className="text-emerald-100 text-sm">
          Register your daily commute to school or college. Our dynamic optimizer aligns bus schedules directly with verified student demand.
        </p>
      </div>

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
            <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Bus className="w-4 h-4 text-emerald-600" />
              Recommended Morning Service
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
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
                </div>
              </div>

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

              {/* Total Registered Count */}
              <div className="text-xs text-slate-500 flex items-center justify-between px-1">
                <span>Total Active Registrations:</span>
                <span className="font-semibold text-slate-700">{students.length} students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
