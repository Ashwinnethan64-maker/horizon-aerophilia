import React from 'react';
import { useStore } from '../store/useStore';
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Route as RouteIcon,
  ShieldCheck,
  Sliders,
  Users
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setRole, students, network } = useStore();

  const stopCount = network?.stops.length ?? 6;
  const routeCount = network?.routes.length ?? 2;
  const busCount = network?.buses.length ?? 3;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION — Asymmetric 60/40 Neo-Brutalist Composition */}
      <section className="relative bg-white border-2 border-[#111111] rounded-[4px] shadow-[8px_8px_0_0_#111111] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 60% */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 self-start bg-[#FFD93D] text-[#111111] border-2 border-[#111111] px-3 py-1 rounded-[4px] shadow-[3px_3px_0_0_#111111] -rotate-1 font-display text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#0866F5]" />
              Demand-Driven Mobility
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-[#111111]">
              Every Student.{' '}
              <span className="text-[#0866F5]">Every Route.</span>{' '}
              Connected.
            </h1>

            <p className="text-base sm:text-lg text-[#454545] leading-relaxed max-w-xl">
              See where students need transport, plan bus schedules around real demand, and make journeys more reliable across Mangaluru, Gurupura, Polali and surrounding communities.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className="nb-btn-primary px-6 py-3.5 text-sm sm:text-base"
              >
                <LayoutDashboard className="w-4 h-4" />
                Explore as Bus Owner
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className="nb-btn-secondary px-6 py-3.5 text-sm sm:text-base"
              >
                <GraduationCap className="w-4 h-4" />
                Find My Bus
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-[#454545]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#178653]" />
                Deterministic Timetable Engine
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0866F5]" />
                {stopCount} Corridor Stops &bull; {routeCount} Routes &bull; {busCount} Fleet Units
              </span>
            </div>
          </div>

          {/* Right 40%: Original Mangaluru–Gurupura–Polali Network Illustration */}
          <div className="lg:col-span-5 bg-[#10233F] border-t-2 lg:border-t-0 lg:border-l-2 border-[#111111] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="nb-halftone absolute inset-0 opacity-15 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
              <span className="bg-[#0866F5] text-white border-2 border-[#111111] px-2.5 py-1 rounded-[4px] font-display text-[11px] font-bold uppercase tracking-wider">
                Corridor Preview
              </span>
              <span className="bg-[#FFD93D] text-[#111111] border-2 border-[#111111] px-2.5 py-1 rounded-full font-display text-[11px] font-bold">
                +5 km Study Buffer
              </span>
            </div>

            {/* Clean SVG Corridor Schematic */}
            <div className="relative z-10 bg-[#FFFDF5] border-2 border-[#111111] rounded-[4px] p-4 shadow-[4px_4px_0_0_#111111]">
              <svg viewBox="0 0 360 210" className="w-full h-auto" role="img" aria-label="Mangaluru Gurupura Polali bus corridor diagram">
                {/* 5km Buffer Band */}
                <path
                  d="M 24 155 Q 150 45 335 72"
                  fill="none"
                  stroke="#EAF2FF"
                  strokeWidth="44"
                  strokeLinecap="round"
                />
                {/* Primary Trunk Route */}
                <path
                  d="M 32 155 Q 145 95 205 88 T 325 75"
                  fill="none"
                  stroke="#0866F5"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Feeder Route */}
                <path
                  d="M 140 165 Q 230 140 325 75"
                  fill="none"
                  stroke="#10233F"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />

                {/* Stop Nodes */}
                <g>
                  <circle cx="32" cy="155" r="9" fill="#FFD93D" stroke="#111111" strokeWidth="3" />
                  <text x="20" y="182" fontSize="11" fontWeight="700" fill="#111111" fontFamily="Space Grotesk, sans-serif">
                    Mangaluru
                  </text>
                </g>
                <g>
                  <circle cx="205" cy="88" r="8" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
                  <text x="172" y="68" fontSize="11" fontWeight="700" fill="#111111" fontFamily="Space Grotesk, sans-serif">
                    Gurupura
                  </text>
                </g>
                <g>
                  <circle cx="140" cy="165" r="7" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
                  <text x="108" y="188" fontSize="10" fontWeight="600" fill="#454545" fontFamily="Inter, sans-serif">
                    Bondantila
                  </text>
                </g>
                <g>
                  <circle cx="325" cy="75" r="10" fill="#178653" stroke="#111111" strokeWidth="3" />
                  <text x="292" y="54" fontSize="11" fontWeight="700" fill="#111111" fontFamily="Space Grotesk, sans-serif">
                    Polali
                  </text>
                </g>

                {/* Simulated Bus Badge */}
                <g transform="translate(128, 92)">
                  <rect width="40" height="22" rx="3" fill="#0866F5" stroke="#111111" strokeWidth="2.5" />
                  <text x="20" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF" fontFamily="Space Grotesk, sans-serif">
                    BUS
                  </text>
                </g>
              </svg>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-[#EAF2FF]">
              <span>Shared Demand Registry: <strong className="text-[#FFD93D]">{students.length} Students</strong></span>
              <span className="font-mono text-[11px]">SIMULATED</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM STRIP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-[#EAF2FF] text-[#0866F5] border-2 border-[#111111] rounded-[4px]">
            The Rural Mobility Gap
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="nb-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-[4px] bg-[#D93636] text-white border-2 border-[#111111] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#111111]">Overloaded Peak Buses</h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              Intermediate village stops face packed buses at 07:30 AM, leaving students stranded before school hours.
            </p>
          </div>
          <div className="nb-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-[4px] bg-[#FFD93D] text-[#111111] border-2 border-[#111111] flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#111111]">Mismatched Empty Runs</h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              Operators run fixed timetables without clear stop-by-stop student demand data, hurting daily viability.
            </p>
          </div>
          <div className="nb-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-[4px] bg-[#0866F5] text-white border-2 border-[#111111] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#111111]">Uncertain Student Journeys</h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              Students lack clear scheduled pickup times, crowding expectations, and honest fallback options.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TWO PORTALS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="nb-card-shadow p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
          <div className="space-y-3">
            <span className="inline-block bg-[#10233F] text-white text-xs font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px]">
              For Bus Owners &amp; Operators
            </span>
            <h2 className="font-display font-bold text-2xl text-[#111111]">
              Operations Command Centre
            </h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              Inspect stop-level demand heatmaps, replay deterministic timetable simulations on an interactive Leaflet map, test What-If changes, and optimize fleet schedules.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className="nb-btn-primary px-5 py-3 text-sm self-start"
          >
            Open Owner Portal <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="nb-card-shadow p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#EAF2FF]">
          <div className="space-y-3">
            <span className="inline-block bg-[#FFD93D] text-[#111111] border-2 border-[#111111] text-xs font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px]">
              For Students &amp; Parents
            </span>
            <h2 className="font-display font-bold text-2xl text-[#111111]">
              Student Commute Companion
            </h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              Check your next scheduled morning bus, view crowding advisories, register your daily boarding stop, and browse corridor routes in English or ಕನ್ನಡ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="nb-btn-secondary px-5 py-3 text-sm self-start"
          >
            Open Student Companion <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="nb-card p-6 sm:p-8 bg-white space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-2xl text-[#111111]">
            How YatraGrid Works
          </h2>
          <span className="text-xs font-semibold text-[#454545]">
            Shared demand data connects both portals
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Register Demand', desc: 'Students submit home stop, deadline & commute days.' },
            { step: '02', title: 'Understand Demand', desc: 'Heatmaps highlight over-capacity stops & slots.' },
            { step: '03', title: 'Simulate', desc: 'Seeded engine replays boarding, waits & stranding.' },
            { step: '04', title: 'Optimize', desc: 'Respects fleet count, seat capacity & driver hours.' },
            { step: '05', title: 'Publish Schedule', desc: 'Updated departures appear in Student Companion.' }
          ].map((item) => (
            <div key={item.step} className="p-4 bg-[#FFFDF5] border-2 border-[#111111] rounded-[4px] space-y-1.5">
              <span className="inline-block font-display font-bold text-xs px-2 py-0.5 bg-[#0866F5] text-white rounded-[4px]">
                {item.step}
              </span>
              <div className="font-display font-bold text-sm text-[#111111]">{item.title}</div>
              <p className="text-xs text-[#454545] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LOCAL COVERAGE & FINAL CTA */}
      <section className="bg-[#10233F] text-white border-2 border-[#111111] rounded-[4px] shadow-[6px_6px_0_0_#111111] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#FFD93D]">
            <ShieldCheck className="w-4 h-4" />
            Mangaluru–Gurupura–Polali Corridor
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl">
            Ready to test the corridor simulation?
          </h2>
          <p className="text-sm text-[#EAF2FF] leading-relaxed">
            Switch seamlessly between the Owner Operations Console and Student Companion using real deterministic fixtures or the live Express API.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className="nb-btn-primary px-5 py-3 text-sm"
          >
            <Sliders className="w-4 h-4" />
            Launch Owner Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="nb-btn-secondary px-5 py-3 text-sm"
          >
            <RouteIcon className="w-4 h-4" />
            Launch Student Portal
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingView;

