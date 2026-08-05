import { metricsQueue } from '../src/lib/queue';

export async function registerSyncMetricsRepeat() {
  await metricsQueue.add('sync-metrics-repeat', {}, {
    repeat: { pattern: '0 9 * * *' }, // Daily at 9 AM
    jobId: 'sync-metrics-daily',
  });
  console.log('Daily syncMetrics repeat registered');
}
