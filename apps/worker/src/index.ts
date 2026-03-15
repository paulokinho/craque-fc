import { scoreResultsWorker }  from './workers/scoreResults.worker';
import { leaderboardWorker }   from './workers/leaderboard.worker';
import { notificationsWorker } from './workers/notifications.worker';
import { paymentWorker }       from './workers/payment.worker';
import { prizesWorker }        from './workers/prizes.worker';

const workers = [
  scoreResultsWorker,
  leaderboardWorker,
  notificationsWorker,
  paymentWorker,
  prizesWorker,
];

console.log(`🚀 Craque FC Worker started — ${workers.length} workers active`);
console.log('   • score-results    (concurrency: 1)');
console.log('   • leaderboard      (concurrency: 2)');
console.log('   • notifications    (concurrency: 5, rate-limited: 100/s)');
console.log('   • payments         (concurrency: 3)');
console.log('   • prizes           (concurrency: 1)');

async function shutdown() {
  console.log('\n⏳ Graceful shutdown — draining workers...');
  await Promise.all(workers.map(w => w.close()));
  console.log('✅ All workers closed');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
