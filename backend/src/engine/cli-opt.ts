import { store } from '../api/store.js';
import { optimize } from './optimizer.js';

console.log('=== ROUTELESS OPTIMIZER CLI ===');
const network = store.getNetwork();
const students = store.getStudents();

console.log('Running schedule optimizer...');
const opt = optimize(network, students);

console.log('\n--- SCHEDULE MODIFICATIONS ---');
opt.diff.forEach(d => {
  console.log(`[${d.busId}] ${d.oldDepartures.join(', ')} -> ${d.newDepartures.join(', ')}: ${d.changeDescription}`);
});

console.log('\n--- BEFORE VS AFTER COMPARISON ---');
console.table({
  'Served On Time': { Before: opt.before.metrics.servedOnTime, After: opt.after.metrics.servedOnTime },
  'Stranded': { Before: opt.before.metrics.stranded, After: opt.after.metrics.stranded },
  'Avg Wait (min)': { Before: opt.before.metrics.avgWaitMin, After: opt.after.metrics.avgWaitMin },
  'Load Factor': { Before: opt.before.metrics.loadFactor, After: opt.after.metrics.loadFactor },
  'Viability Gap ($)': { Before: opt.before.metrics.viabilityGap, After: opt.after.metrics.viabilityGap }
});
console.log(`\nScore Improvement: +${opt.scoreDelta}`);
