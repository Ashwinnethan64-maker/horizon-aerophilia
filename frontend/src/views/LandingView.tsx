import React from 'react';
import { useStore } from '../store/useStore';
import { translations } from '../i18n/translations';
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
  const { setRole, students, network, language } = useStore();
  const t = translations[language].landing;
  const isKn = language === 'kn';

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
              {t.badge}
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.98] text-[#111111]">
              {t.heroTitlePrefix}{' '}
              <span className="text-[#0866F5]">{t.heroTitleHighlight}</span>{' '}
              {t.heroTitleSuffix}
            </h1>

            <p className="text-base sm:text-lg text-[#454545] leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className="nb-btn-primary px-6 py-3.5 text-sm sm:text-base"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.ctaOwner}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className="nb-btn-secondary px-6 py-3.5 text-sm sm:text-base"
              >
                <GraduationCap className="w-4 h-4" />
                {t.ctaStudent}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-[#454545]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#178653]" />
                {t.deterministicEngine}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0866F5]" />
                {isKn
                  ? `${stopCount} ನಿಲ್ದಾಣಗಳು • ${routeCount} ಮಾರ್ಗಗಳು • ${busCount} ಬಸ್‌ಗಳು`
                  : `${stopCount} Corridor Stops • ${routeCount} Routes • ${busCount} Fleet Units`}
              </span>
            </div>
          </div>

          {/* Right 40%: Original Mangaluru–Gurupura–Polali Network Illustration */}
          <div className="lg:col-span-5 bg-[#10233F] border-t-2 lg:border-t-0 lg:border-l-2 border-[#111111] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="nb-halftone absolute inset-0 opacity-15 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
              <span className="bg-[#0866F5] text-white border-2 border-[#111111] px-2.5 py-1 rounded-[4px] font-display text-[11px] font-bold uppercase tracking-wider">
                {t.corridorPreview}
              </span>
              <span className="bg-[#FFD93D] text-[#111111] border-2 border-[#111111] px-2.5 py-1 rounded-full font-display text-[11px] font-bold">
                {t.studyBuffer}
              </span>
            </div>

            {/* Clean SVG Corridor Schematic */}
            <div className="relative z-10 bg-[#FFFDF5] border-2 border-[#111111] rounded-[4px] p-4 shadow-[4px_4px_0_0_#111111]">
              <svg viewBox="0 0 360 210" className="w-full h-auto" role="img" aria-label={t.corridorPreview}>
                <path
                  d="M 24 155 Q 150 45 335 72"
                  fill="none"
                  stroke="#EAF2FF"
                  strokeWidth="44"
                  strokeLinecap="round"
                />
                <path
                  d="M 32 155 Q 145 95 205 88 T 325 75"
                  fill="none"
                  stroke="#0866F5"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 140 165 Q 230 140 325 75"
                  fill="none"
                  stroke="#10233F"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                />

                <g>
                  <circle cx="32" cy="155" r="9" fill="#FFD93D" stroke="#111111" strokeWidth="3" />
                  <text x="20" y="182" fontSize="11" fontWeight="700" fill="#111111" fontFamily="Space Grotesk, sans-serif">
                    {isKn ? 'ಮಂಗಳೂರು' : 'Mangaluru'}
                  </text>
                </g>
                <g>
                  <circle cx="205" cy="88" r="8" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
                  <text x="172" y="68" fontSize="11" fontWeight="700" fill="#111111" fontFamily="Space Grotesk, sans-serif">
                    {isKn ? 'ಗುರುಪುರ' : 'Gurupura'}
                  </text>
                </g>
                <g>
                  <circle cx="140" cy="165" r="7" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
                  <text x="108" y="188" fontSize="10" fontWeight="600" fill="#454545" fontFamily="Inter, sans-serif">
                    {isKn ? 'ಬೊಂಡಂತಿಲ' : 'Bondantila'}
                  </text>
                </g>
                <g>
                  <circle cx="325" cy="75" r="10" fill="#178653" stroke="#111111" strokeWidth="3" />
                  <text x="292" y="54" fontSize="11" fontWeight="700" fill="#111111" fontFamily="Space Grotesk, sans-serif">
                    {isKn ? 'ಪೊಳಲಿ' : 'Polali'}
                  </text>
                </g>

                <g transform="translate(128, 92)">
                  <rect width="40" height="22" rx="3" fill="#0866F5" stroke="#111111" strokeWidth="2.5" />
                  <text x="20" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF" fontFamily="Space Grotesk, sans-serif">
                    {isKn ? 'ಬಸ್' : 'BUS'}
                  </text>
                </g>
              </svg>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-[#EAF2FF]">
              <span>
                {t.sharedDemand}{' '}
                <strong className="text-[#FFD93D]">
                  {students.length} {t.studentsCount}
                </strong>
              </span>
              <span className="font-mono text-[11px]">{t.simulatedTag}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM STRIP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-[#EAF2FF] text-[#0866F5] border-2 border-[#111111] rounded-[4px]">
            {t.problemBadge}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="nb-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-[4px] bg-[#D93636] text-white border-2 border-[#111111] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#111111]">{t.prob1Title}</h2>
            <p className="text-sm text-[#454545] leading-relaxed">{t.prob1Desc}</p>
          </div>
          <div className="nb-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-[4px] bg-[#FFD93D] text-[#111111] border-2 border-[#111111] flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#111111]">{t.prob2Title}</h2>
            <p className="text-sm text-[#454545] leading-relaxed">{t.prob2Desc}</p>
          </div>
          <div className="nb-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-[4px] bg-[#0866F5] text-white border-2 border-[#111111] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-lg text-[#111111]">{t.prob3Title}</h2>
            <p className="text-sm text-[#454545] leading-relaxed">{t.prob3Desc}</p>
          </div>
        </div>
      </section>

      {/* 3. TWO PORTALS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="nb-card-shadow p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
          <div className="space-y-3">
            <span className="inline-block bg-[#10233F] text-white text-xs font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px]">
              {t.ownerTag}
            </span>
            <h2 className="font-display font-bold text-2xl text-[#111111]">
              {t.ownerTitle}
            </h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              {t.ownerDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className="nb-btn-primary px-5 py-3 text-sm self-start"
          >
            {t.openOwner} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="nb-card-shadow p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#EAF2FF]">
          <div className="space-y-3">
            <span className="inline-block bg-[#FFD93D] text-[#111111] border-2 border-[#111111] text-xs font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px]">
              {t.studentTag}
            </span>
            <h2 className="font-display font-bold text-2xl text-[#111111]">
              {t.studentTitle}
            </h2>
            <p className="text-sm text-[#454545] leading-relaxed">
              {t.studentDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="nb-btn-secondary px-5 py-3 text-sm self-start"
          >
            {t.openStudent} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="nb-card p-6 sm:p-8 bg-white space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-bold text-2xl text-[#111111]">
            {t.howTitle}
          </h2>
          <span className="text-xs font-semibold text-[#454545]">
            {t.howSub}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {t.steps.map((item) => (
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
            {t.coverageTag}
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl">
            {t.coverageTitle}
          </h2>
          <p className="text-sm text-[#EAF2FF] leading-relaxed">
            {t.coverageDesc}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setRole('owner')}
            className="nb-btn-primary px-5 py-3 text-sm"
          >
            <Sliders className="w-4 h-4" />
            {t.launchOwner}
          </button>
          <button
            type="button"
            onClick={() => setRole('student')}
            className="nb-btn-secondary px-5 py-3 text-sm"
          >
            <RouteIcon className="w-4 h-4" />
            {t.launchStudent}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
