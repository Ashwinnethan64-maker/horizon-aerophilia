import { store } from '../api/store.js';
import { simulate } from './simulator.js';

console.log('=== ROUTELESS SIMULATOR CLI ===');
const network = store.getNetwork();
const students = store.getStudents();
console.log(`Loaded network: ${network.stops.length} stops, ${network.routes.length} routes, ${network.buses.length} buses.`);
console.log(`Loaded demand: ${students.length} students registered.\n`);

console.log('Running baseline simulation...');
const result = simulate(network, students, undefined, 42);

console.log('\n--- BASELINE METRICS ---');
console.table(result.metrics);
console.log(`Total events recorded: ${result.events.length}`);

