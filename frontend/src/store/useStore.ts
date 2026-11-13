import { create } from 'zustand';
import type {
  Network,
  Student,
  Scenario,
  SimResult,
  Weights,
  Bus,
  ScheduleDiffItem
} from '../../../contracts/types.js';
import { api } from '../api/client.js';

export interface ReportedIssue {
  id: string;
  stopId: string;
  type: 'delayed' | 'overcrowded' | 'not_arrived' | 'other';
  studentName: string;
  note: string;
  timestamp: string;
  status: 'unverified' | 'acknowledged' | 'resolved';
}

export type OwnerTab =
  | 'overview'
  | 'simulation'
  | 'optimizer'
  | 'demand'
  | 'routes'
  | 'fleet'
  | 'financial';

interface StoreState {
  // Navigation & Localization
  role: 'landing' | 'owner' | 'student';
  setRole: (role: 'landing' | 'owner' | 'student') => void;
  language: 'en' | 'kn';
  setLanguage: (lang: 'en' | 'kn') => void;
  activeOwnerTab: OwnerTab;
  setActiveOwnerTab: (tab: OwnerTab) => void;

  // Selected map entities for inspection
  selectedStopId: string | null;
  setSelectedStopId: (id: string | null) => void;
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;

  // Status & Replay controls
  isLoading: boolean;
  error: string | null;
  replayTimeIndex: number;
  setReplayTimeIndex: (idx: number) => void;
  replayPlaying: boolean;
  setReplayPlaying: (playing: boolean) => void;
  replaySpeed: number;
  setReplaySpeed: (speed: number) => void;
  isMockMode: boolean;
  toggleMockMode: () => Promise<void>;

  // Core data
  network: Network | null;
  students: Student[];
  currentSchedule: Bus[];
  optimizedSchedule: Bus[] | null;
  scheduleDiff: ScheduleDiffItem[] | null;
  scenarios: Scenario[];
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  weights: Weights;
  setWeights: (w: Partial<Weights>) => void;

  // Simulation outputs
  baselineResult: SimResult | null;
  optimizedResult: SimResult | null;
  viewingOptimized: boolean;
  setViewingOptimized: (v: boolean) => void;
  scoreDelta: number | null;
  scheduleApplied: boolean;

  // Student reports
  reportedIssues: ReportedIssue[];
  reportIssue: (issue: Omit<ReportedIssue, 'id' | 'timestamp' | 'status'>) => void;

  // Actions
  initialize: () => Promise<void>;
  runSimulation: (scenarioId?: string) => Promise<void>;
  runOptimization: () => Promise<void>;
  applyOptimizedSchedule: () => void;
  registerStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  executeWhatIf: (prompt: string) => Promise<string>;
}

const getInitialLanguage = (): 'en' | 'kn' => {
  try {
    const saved = window.localStorage.getItem('yg_language');
    return saved === 'kn' ? 'kn' : 'en';
  } catch {
    return 'en';
  }
};

export const useStore = create<StoreState>((set, get) => ({
  role: 'landing',
  setRole: (role) => set({ role }),
  language: getInitialLanguage(),
  setLanguage: (language) => {
    try {
      window.localStorage.setItem('yg_language', language);
    } catch {
      // Ignore storage errors
    }
    set({ language });
  },
  activeOwnerTab: 'overview',
  setActiveOwnerTab: (activeOwnerTab) => set({ activeOwnerTab }),

  selectedStopId: 'S2',
  setSelectedStopId: (selectedStopId) => set({ selectedStopId }),
  selectedRouteId: 'R1',
  setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),

  isLoading: false,
  error: null,
  replayTimeIndex: 0,
  setReplayTimeIndex: (replayTimeIndex) => set({ replayTimeIndex }),
  replayPlaying: false,
  setReplayPlaying: (replayPlaying) => set({ replayPlaying }),
  replaySpeed: 1,
  setReplaySpeed: (replaySpeed) => set({ replaySpeed }),
  isMockMode: api.isMock,

  toggleMockMode: async () => {
    const nextMode = !get().isMockMode;
    api.setMockMode(nextMode);
    if (!nextMode) {
      // Switching to Live API: verify backend health before committing LIVE API badge
      try {
        await api.getHealth();
        set({ isMockMode: false, error: null });
        await get().initialize();
      } catch (err: any) {
        api.setMockMode(true);
        set({
          isMockMode: true,
          error: err?.message || 'Live API is unreachable; staying in Mock Mode.'
        });
      }
      return;
    }
    set({ isMockMode: true, error: null });
    await get().initialize();
  },

  network: null,
  students: [],
  currentSchedule: [],
  optimizedSchedule: null,
  scheduleDiff: null,
  scenarios: [],
  activeScenarioId: 'baseline',
  setActiveScenarioId: (id) => {
    set({ activeScenarioId: id, scheduleApplied: false });
    get().runSimulation(id);
  },

  weights: {
    served: 10.0,
    wait: 2.0,
    crowding: 1.5,
    viability: 1.1
  },
  setWeights: (newWeights) =>
    set((state) => ({ weights: { ...state.weights, ...newWeights } })),

  baselineResult: null,
  optimizedResult: null,
  viewingOptimized: false,
  setViewingOptimized: (viewingOptimized) => set({ viewingOptimized }),
  scoreDelta: null,
  scheduleApplied: false,

  reportedIssues: [
    {
      id: 'REP-101',
      stopId: 'S2',
      type: 'overcrowded',
      studentName: 'Kunal Ghosh',
      note: 'Bus B1 was packed full at 07:30 AM; 9 of us could not board.',
      timestamp: '07:32 AM',
      status: 'acknowledged'
    },
    {
      id: 'REP-102',
      stopId: 'S3',
      type: 'delayed',
      studentName: 'Aarav Sharma',
      note: 'Morning feeder bus ran 12 minutes late due to road work.',
      timestamp: '07:44 AM',
      status: 'unverified'
    }
  ],

  reportIssue: (issue) => {
    const newReport: ReportedIssue = {
      ...issue,
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
      status: 'unverified'
    };
    set((state) => ({ reportedIssues: [newReport, ...state.reportedIssues] }));
  },

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [network, students, scenarios] = await Promise.all([
        api.getNetwork(),
        api.getStudents(),
        api.getScenarios()
      ]);
      const nextStopId = network.stops.some((s) => s.id === get().selectedStopId)
        ? get().selectedStopId
        : (network.stops[1]?.id ?? network.stops[0]?.id ?? null);
      const nextRouteId = network.routes.some((r) => r.id === get().selectedRouteId)
        ? get().selectedRouteId
        : (network.routes[0]?.id ?? null);
      set({
        network,
        students,
        scenarios,
        currentSchedule: network.buses,
        selectedStopId: nextStopId,
        selectedRouteId: nextRouteId,
        isLoading: false
      });
      await get().runSimulation();
    } catch (err: any) {
      set({ error: err.message || 'Initialization failed', isLoading: false });
    }
  },

  runSimulation: async (scenarioId) => {
    set({ isLoading: true, error: null });
    try {
      const activeId = scenarioId ?? get().activeScenarioId;
      const res = await api.simulate(activeId);
      set({
        baselineResult: res,
        optimizedResult: null,
        optimizedSchedule: null,
        scheduleDiff: null,
        scoreDelta: null,
        viewingOptimized: false,
        isLoading: false,
        replayTimeIndex: 0
      });
    } catch (err: any) {
      set({ error: err.message || 'Simulation failed', isLoading: false });
    }
  },

  runOptimization: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.optimize(get().weights, get().activeScenarioId);
      set({
        optimizedSchedule: res.schedule,
        scheduleDiff: res.diff,
        baselineResult: res.before,
        optimizedResult: res.after,
        scoreDelta: res.scoreDelta,
        viewingOptimized: true,
        isLoading: false,
        replayTimeIndex: 0,
        scheduleApplied: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Optimization failed', isLoading: false });
    }
  },

  applyOptimizedSchedule: () => {
    const { optimizedSchedule, optimizedResult } = get();
    if (!optimizedSchedule || !optimizedResult) return;
    set({
      currentSchedule: optimizedSchedule,
      baselineResult: optimizedResult,
      viewingOptimized: false,
      scheduleApplied: true
    });
  },

  registerStudent: async (studentData) => {
    set({ isLoading: true, error: null });
    try {
      const newStudent = await api.registerStudent(studentData);
      set((state) => ({
        students: [...state.students, newStudent],
        isLoading: false
      }));
      await get().runSimulation();
    } catch (err: any) {
      set({ error: err.message || 'Student registration failed', isLoading: false });
    }
  },

  executeWhatIf: async (prompt: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.whatif(prompt);
      set({
        optimizedResult: res.result,
        viewingOptimized: true,
        isLoading: false
      });
      return res.explanation;
    } catch (err: any) {
      set({ error: err.message || 'What-if failed', isLoading: false });
      throw err;
    }
  }
}));
