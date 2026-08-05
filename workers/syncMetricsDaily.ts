import { metricsQueue } from '../src/lib/queue';

// Daily sync of metrics for all published posts from past 7 days
metricsQueue.add('sync', { userId: 'all' }, {
  repeat: { pattern: '0 9 * * *' }, // Every day at 09:00
  jobId: 'sync-metrics-daily',
}).catch((e) => console.error('Failed to register syncMetrics daily job:', e));
