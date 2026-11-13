import type {
  Network,
  Student,
  Scenario,
  SimResult,
  OptimizationResult,
  WhatIfResponse,
  Weights
} from '../../../contracts/types.js';
import { mockApi } from './mock.js';
import { enrichNetworkCoordinates } from '../data/stopCoordinates.js';

const ENV_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
let activeMockMode = ENV_MOCK;

// Prefer same-origin /api (proxied by Vite in dev) unless an explicit remote URL is set
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

async function fetchWithRetry(url: string, options?: RequestInit, retries = 1): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, {
        ...options,
        signal: options?.signal ?? AbortSignal.timeout(12_000),
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }
  const msg = lastError instanceof Error ? lastError.message : 'Network error';
  throw new Error(
    `Backend API unreachable (${msg}). Ensure the backend server is running on port 3001, or switch to Mock Mode.`
  );
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE_URL}${path}`, options, 1);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get isMock(): boolean {
    return activeMockMode;
  },

  setMockMode(enable: boolean): void {
    activeMockMode = enable;
  },

  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    if (activeMockMode) return mockApi.getHealth();
    return fetchJson('/health');
  },

  async getNetwork(): Promise<Network> {
    const net = activeMockMode
      ? await mockApi.getNetwork()
      : await fetchJson<Network>('/network');
    return enrichNetworkCoordinates(net);
  },

  async getStudents(): Promise<Student[]> {
    if (activeMockMode) return mockApi.getStudents();
    return fetchJson('/students');
  },

  async registerStudent(student: Omit<Student, 'id'>): Promise<Student> {
    if (activeMockMode) return mockApi.registerStudent(student);
    return fetchJson('/students', {
      method: 'POST',
      body: JSON.stringify(student)
    });
  },

  async getScenarios(): Promise<Scenario[]> {
    if (activeMockMode) return mockApi.getScenarios();
    return fetchJson('/scenarios');
  },

  async simulate(scenarioId?: string, seed?: number): Promise<SimResult> {
    if (activeMockMode) return mockApi.simulate(scenarioId, seed);
    return fetchJson('/simulate', {
      method: 'POST',
      body: JSON.stringify({ scenarioId, seed })
    });
  },

  async optimize(weights?: Weights, scenarioId?: string, seed?: number): Promise<OptimizationResult> {
    if (activeMockMode) return mockApi.optimize(weights, scenarioId, seed);
    return fetchJson('/optimize', {
      method: 'POST',
      body: JSON.stringify({ weights, scenarioId, seed })
    });
  },

  async whatif(prompt: string): Promise<WhatIfResponse> {
    if (activeMockMode) return mockApi.whatif(prompt);
    return fetchJson('/whatif', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }
};
