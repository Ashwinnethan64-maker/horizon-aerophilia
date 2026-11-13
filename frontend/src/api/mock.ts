import type {
  Network,
  Student,
  Scenario,
  SimResult,
  OptimizationResult,
  WhatIfResponse,
  Weights
} from '../../../contracts/types.js';
import networkFixture from '../../../contracts/fixtures/network.json';
import studentsFixture from '../../../contracts/fixtures/students.json';
import sampleSimResult from '../../../contracts/fixtures/sample-simresult.json';

// In-memory working copies so modifications during a mock session persist
const mockNetwork: Network = JSON.parse(JSON.stringify(networkFixture));
let mockStudents: Student[] = JSON.parse(JSON.stringify(studentsFixture));
const mockSimResult: SimResult = JSON.parse(JSON.stringify(sampleSimResult));

const mockScenarios: Scenario[] = [
  {
    id: 'baseline',
    label: 'Normal Day',
    description: 'Standard school morning schedule and demand',
    patches: []
  },
  {
    id: 'exam_surge',
    label: 'Board Exam Surge',
    description: '1.4x student demand and earlier arrival targets',
    patches: [{ type: 'demandMultiplier', value: 1.4 }]
  },
  {
    id: 'monsoon_rain',
    label: 'Monsoon Rain',
    description: 'Travel times 1.3x slower due to waterlogging',
    patches: [{ type: 'travelTimeMultiplier', value: 1.3 }]
  },
  {
    id: 'breakdown_b1',
    label: 'Bus B1 Breakdown',
    description: 'Bus B1 is unavailable for service',
    patches: [{ type: 'removeBus', busId: 'B1' }]
  },
  {
    id: 'bridge_repair',
    label: 'Addoor Bridge Closure',
    description: 'Route R2 unavailable due to Addoor river bridge maintenance',
    patches: [{ type: 'closeRoute', routeId: 'R2' }]
  }
];

export const mockApi = {
  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    return { status: 'mock-ok', timestamp: new Date().toISOString(), version: '1.0.0-mock' };
  },

  async getNetwork(): Promise<Network> {
    return JSON.parse(JSON.stringify(mockNetwork));
  },

  async getStudents(): Promise<Student[]> {
    return JSON.parse(JSON.stringify(mockStudents));
  },

  async registerStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const newStudent: Student = {
      ...student,
      id: `ST-${String(mockStudents.length + 1).padStart(3, '0')}`
    };
    mockStudents.push(newStudent);
    return newStudent;
  },

  async getScenarios(): Promise<Scenario[]> {
    return JSON.parse(JSON.stringify(mockScenarios));
  },

  async simulate(scenarioId?: string, _seed?: number): Promise<SimResult> {
    const result: SimResult = JSON.parse(JSON.stringify(mockSimResult));

    // Dynamic mock adjustments based on scenario
    if (scenarioId === 'exam_surge') {
      result.metrics.stranded += 14;
      result.metrics.avgWaitMin += 4.5;
      result.metrics.loadFactor = 0.98;
    } else if (scenarioId === 'breakdown_b1') {
      result.metrics.servedOnTime = Math.max(0, result.metrics.servedOnTime - 25);
      result.metrics.stranded += 25;
      result.metrics.avgWaitMin += 12.0;
    } else if (scenarioId === 'monsoon_rain') {
      result.metrics.avgWaitMin += 6.0;
      result.metrics.stranded += 8;
    }

    return result;
  },

  async optimize(_weights?: Weights, _scenarioId?: string, _seed?: number): Promise<OptimizationResult> {
    const afterResult: SimResult = {
      events: mockSimResult.events,
      metrics: {
        servedOnTime: 89,
        stranded: 4,
        avgWaitMin: 9.2,
        loadFactor: 0.82,
        revenue: 2225,
        cost: 2340,
        viabilityGap: 115
      }
    };

    return {
      schedule: mockNetwork.buses.map(b => {
        if (b.id === 'B1') return { ...b, departureTimes: ['07:05', '08:20'] };
        if (b.id === 'B3') return { ...b, departureTimes: ['07:45'] };
        return b;
      }),
      diff: [
        {
          busId: 'B1',
          oldDepartures: ['07:15', '08:30'],
          newDepartures: ['07:05', '08:20'],
          changeDescription: 'Shifted morning trip 10m earlier to relieve Stop S2 peak rush'
        },
        {
          busId: 'B3',
          oldDepartures: ['12:00'],
          newDepartures: ['07:45'],
          changeDescription: 'Reallocated midday bus B3 to morning peak rush'
        }
      ],
      before: mockSimResult,
      after: afterResult,
      scoreDelta: 248.5
    };
  },

  async whatif(prompt: string): Promise<WhatIfResponse> {
    return {
      parsedAction: {
        action: 'shift_departure',
        busId: 'B3',
        newTime: '07:45'
      },
      explanation: `Interpreted "${prompt}": Shifted Bus 3 from 12:00 to 07:45. This captures 22 additional students and drops stranded count from 28 to 6.`,
      result: {
        events: mockSimResult.events,
        metrics: {
          servedOnTime: 87,
          stranded: 6,
          avgWaitMin: 11.1,
          loadFactor: 0.84,
          revenue: 2175,
          cost: 2340,
          viabilityGap: 165
        }
      }
    };
  },

  reset(): void {
    mockStudents = JSON.parse(JSON.stringify(studentsFixture));
  }
};
