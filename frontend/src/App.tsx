import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { translations } from './i18n/translations';
import { LandingView } from './views/LandingView';
import { OwnerView } from './views/OwnerView';
import { StudentView } from './views/StudentView';
import {
  GraduationCap,
  LayoutDashboard,
  Info,
  X,
  Wifi,
  WifiOff,
  Home
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    initialize,
    error,
    activeScenarioId,
    isMockMode,
    toggleMockMode,
    isLoading
  } = useStore();
  const [showTransparencyNotice, setShowTransparencyNotice] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const t = translations[language].app;

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col font-sans text-[#111111] antialiased">
      {/* Top Notice Banner: Operational Honesty & Transparency */}
      {showTransparencyNotice && (
        <aside
          aria-label="Operational Transparency Notice"
          className="bg-[#10233F] text-white text-[11px] py-1.5 px-4 border-b-2 border-[#111111] flex items-center justify-between gap-3"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#FFD93D] shrink-0" />
            <span className="truncate">
              {t.transparencyNotice}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTransparencyNotice(false)}
            aria-label="Dismiss notice"
            className="text-slate-300 hover:text-white p-0.5 rounded transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Navigation Header */}
      <header className="bg-white border-b-2 border-[#111111] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRole('landing')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
              title="Return to YatraGrid Home"
            >
              <img
                src="/yatragrid-logo.png"
                alt="YatraGrid"
                width={48}
                height={40}
                className="h-9 sm:h-10 w-auto object-contain shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-[#111111] text-lg sm:text-xl tracking-tight leading-none">
                    YatraGrid
                  </span>
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#0866F5] border border-[#111111] hidden sm:inline-block">
                    Mobility
                  </span>
                </div>
                <p className="text-[11px] text-[#454545] hidden md:block">
                  {t.brandSubtitle}
                </p>
              </div>
            </button>

            {/* Interactive Mock Mode / Live API Toggle Pill */}
            <button
              type="button"
              onClick={() => toggleMockMode()}
              title={
                isMockMode
                  ? 'Using local fixture mock data. Click to connect to live Express API.'
                  : 'Connected to live Express API. Click to switch to local mock fixtures.'
              }
              className={`flex items-center gap-1.5 text-[10px] font-display font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors border-2 border-[#111111] cursor-pointer ${
                isMockMode
                  ? 'bg-[#FFD93D] text-[#111111] hover:bg-[#f2ca24]'
                  : 'bg-[#178653] text-white hover:bg-[#136d43]'
              }`}
            >
              {isMockMode ? (
                <>
                  <WifiOff className="w-3 h-3" />
                  {t.mockMode}
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3" />
                  {t.liveApi}
                </>
              )}
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoading && (
              <span className="text-[11px] font-semibold text-[#0866F5] animate-pulse hidden lg:inline">
                Synchronizing...
              </span>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-[#F6F4EA] rounded-[4px] p-0.5 border-2 border-[#111111] text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-[2px] transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#10233F] text-white'
                    : 'text-[#454545] hover:text-[#111111]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2 py-1 rounded-[2px] transition-colors cursor-pointer ${
                  language === 'kn'
                    ? 'bg-[#10233F] text-white'
                    : 'text-[#454545] hover:text-[#111111]'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* About / Guide Button */}
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="p-2 rounded-[4px] border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#EAF2FF] hidden sm:flex items-center justify-center cursor-pointer"
              title="About YatraGrid & Architecture"
              aria-label="About YatraGrid"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-[#F6F4EA] p-1 rounded-[4px] border-2 border-[#111111] gap-1">
              <button
                type="button"
                onClick={() => setRole('landing')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer ${
                  role === 'landing'
                    ? 'bg-[#FFD93D] text-[#111111] border border-[#111111]'
                    : 'text-[#454545] hover:text-[#111111]'
                }`}
                title="Overview Landing Page"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.home}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer ${
                  role === 'owner'
                    ? 'bg-[#10233F] text-white'
                    : 'text-[#454545] hover:text-[#111111]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.owner}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-[#0866F5] text-white'
                    : 'text-[#454545] hover:text-[#111111]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.student}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-[#111111] shadow-[4px_4px_0_0_#111111] text-[#D93636] text-xs sm:text-sm rounded-[4px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold uppercase">Notice:</span>
              <span className="text-[#111111] font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => initialize()}
              className="nb-btn-outline px-3 py-1.5 text-xs shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {role === 'landing' && <LandingView />}
        {role === 'owner' && <OwnerView />}
        {role === 'student' && <StudentView />}
      </main>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-[#10233F]/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] shadow-[8px_8px_0_0_#111111] max-w-lg w-full p-6 border-2 border-[#111111] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
              <div className="flex items-center gap-2">
                <img
                  src="/yatragrid-logo.png"
                  alt="YatraGrid"
                  width={34}
                  height={28}
                  className="h-7 w-auto object-contain shrink-0"
                />
                <h3 className="font-display font-bold text-[#111111] text-base">
                  {t.aboutTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="text-[#111111] hover:text-[#0866F5] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#454545] space-y-3 leading-relaxed">
              <p>
                <strong className="text-[#111111]">YatraGrid</strong> connects student commuting demand with practical bus operations and schedule optimization across Mangaluru, Gurupura, and Polali.
              </p>
              <div className="p-3 bg-[#FFFDF5] rounded-[4px] border-2 border-[#111111] space-y-2">
                <div className="font-display font-bold text-[#111111]">Core Principles:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Deterministic Simulation:</strong> Seeded engine runs reproducible timetable evaluations.</li>
                  <li><strong>Transparent Viability:</strong> Displays operating costs, revenue, and viability gap clearly.</li>
                  <li><strong>Shared System:</strong> Student registrations directly feed the optimizer without artificial data splits.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="nb-btn-primary px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t-2 border-[#111111] py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#454545]">
          <div className="flex items-center gap-2">
            <strong className="font-display text-[#111111]">YatraGrid</strong> &bull; Every Student. Every Route. Connected.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Active Scenario: <strong className="text-[#111111] capitalize">{activeScenarioId.replace(/_/g, ' ')}</strong>
            </span>
            <span>&bull;</span>
            <span>Deterministic TS Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
