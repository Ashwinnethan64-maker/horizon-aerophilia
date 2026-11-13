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

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  isMock: USE_MOCK,

  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    if (USE_MOCK) return mockApi.getHealth();
    return fetchJson('/health');
  },

  async getNetwork(): Promise<Network> {
    if (USE_MOCK) return mockApi.getNetwork();
    return fetchJson('/network');
  },

  async getStudents(): Promise<Student[]> {
    if (USE_MOCK) return mockApi.getStudents();
    return fetchJson('/students');
  },

  async registerStudent(student: Omit<Student, 'id'>): Promise<Student> {
    if (USE_MOCK) return mockApi.registerStudent(student);
    return fetchJson('/students', {
      method: 'POST',
      body: JSON.stringify(student)
    });
  },

  async getScenarios(): Promise<Scenario[]> {
    if (USE_MOCK) return mockApi.getScenarios();
    return fetchJson('/scenarios');
  },

  async simulate(scenarioId?: string, seed?: number): Promise<SimResult> {
    if (USE_MOCK) return mockApi.simulate(scenarioId, seed);
    return fetchJson('/simulate', {
      method: 'POST',
      body: JSON.stringify({ scenarioId, seed })
    });
  },

  async optimize(weights?: Weights, scenarioId?: string, seed?: number): Promise<OptimizationResult> {
    if (USE_MOCK) return mockApi.optimize(weights, scenarioId, seed);
    return fetchJson('/optimize', {
      method: 'POST',
      body: JSON.stringify({ weights, scenarioId, seed })
    });
  },

  async whatif(prompt: string): Promise<WhatIfResponse> {
    if (USE_MOCK) return mockApi.whatif(prompt);
    return fetchJson('/whatif', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }
};

