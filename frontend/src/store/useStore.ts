import { create } from 'zustand';
import type {
  Network,
  Student,
  SimResult,
  Weights,
  Bus,
  ScheduleDiffItem
} from '../../../contracts/types.js';
import { api } from '../api/client.js';

interface StoreState {
  // UI slice
  role: 'owner' | 'student';
  setRole: (role: 'owner' | 'student') => void;
  isLoading: boolean;
  error: string | null;
  replayTimeIndex: number;
  setReplayTimeIndex: (idx: number) => void;
  replayPlaying: boolean;
  setReplayPlaying: (playing: boolean) => void;
  replaySpeed: number;
  setReplaySpeed: (speed: number) => void;

  // Data slices
  network: Network | null;
  students: Student[];
  currentSchedule: Bus[];
  optimizedSchedule: Bus[] | null;
  scheduleDiff: ScheduleDiffItem[] | null;
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  weights: Weights;
  setWeights: (w: Partial<Weights>) => void;

  // Results slice
  baselineResult: SimResult | null;
  optimizedResult: SimResult | null;
  viewingOptimized: boolean;
  setViewingOptimized: (v: boolean) => void;
  scoreDelta: number | null;

  // Actions
  initialize: () => Promise<void>;
  runSimulation: (scenarioId?: string) => Promise<void>;
  runOptimization: () => Promise<void>;
  registerStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  executeWhatIf: (prompt: string) => Promise<string>;
}

export const useStore = create<StoreState>((set, get) => ({
  role: 'owner',
  setRole: (role) => set({ role }),
  isLoading: false,
  error: null,
  replayTimeIndex: 0,
  setReplayTimeIndex: (replayTimeIndex) => set({ replayTimeIndex }),
  replayPlaying: false,
  setReplayPlaying: (replayPlaying) => set({ replayPlaying }),
  replaySpeed: 1,
  setReplaySpeed: (replaySpeed) => set({ replaySpeed }),

  network: null,
  students: [],
  currentSchedule: [],
  optimizedSchedule: null,
  scheduleDiff: null,
  activeScenarioId: 'baseline',
  setActiveScenarioId: (id) => {
    set({ activeScenarioId: id });
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

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [network, students] = await Promise.all([
        api.getNetwork(),
        api.getStudents()
      ]);
      set({
        network,
        students,
        currentSchedule: network.buses,
        isLoading: false
      });
      // Initial simulation
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
        replayTimeIndex: 0
      });
    } catch (err: any) {
      set({ error: err.message || 'Optimization failed', isLoading: false });
    }
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
