import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Network, Student, Scenario } from '../../../contracts/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate fixtures directory
const contractsFixturesDir = path.resolve(__dirname, '../../../contracts/fixtures');

function loadJsonFixture<T>(filename: string): T {
  const filePath = path.join(contractsFixturesDir, filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as T;
}

export class MemoryStore {
  private network: Network;
  private students: Student[];
  private scenarios: Scenario[];

  constructor() {
    this.network = loadJsonFixture<Network>('network.json');
    this.students = loadJsonFixture<Student[]>('students.json');
    this.scenarios = [
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
        label: 'Chandan Bridge Closure',
        description: 'Route R2 unavailable due to bridge maintenance',
        patches: [{ type: 'closeRoute', routeId: 'R2' }]
      }
    ];
  }

  getNetwork(): Network {
    return JSON.parse(JSON.stringify(this.network));
  }

  setNetwork(network: Network): void {
    this.network = JSON.parse(JSON.stringify(network));
  }

  getStudents(): Student[] {
    return JSON.parse(JSON.stringify(this.students));
  }

  addStudent(student: Omit<Student, 'id'>): Student {
    const newStudent: Student = {
      ...student,
      id: `ST-${String(this.students.length + 1).padStart(3, '0')}`
    };
    this.students.push(newStudent);
    return newStudent;
  }

  getScenarios(): Scenario[] {
    return JSON.parse(JSON.stringify(this.scenarios));
  }

  getScenario(id: string): Scenario | undefined {
    return this.scenarios.find(s => s.id === id);
  }
}

export const store = new MemoryStore();
