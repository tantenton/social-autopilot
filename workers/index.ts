import { Worker, Job } from 'bullmq';
import { redisConnection } from '../src/lib/queue';
import generateContentJob from './jobs/generateContent';
import generateVideoJob from './jobs/generateVideo';
import publishPostJob from './jobs/publishPost';
import syncMetricsJob from './jobs/syncMetrics';
import researchTrendsJob from './jobs/researchTrends';

// Instantiate BullMQ Workers
const researchWorker = new Worker('research-trends', async (job: Job) => {
  return researchTrendsJob();
}, { connection: redisConnection, concurrency: 1 });

const contentWorker = new Worker('content-generation', async (job: Job) => {
  if (job.name === 'generate') return generateContentJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 2 });

const publishWorker = new Worker('publish-post', async (job: Job) => {
  if (job.name === 'publish') return publishPostJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 3 });

const metricsWorker = new Worker('sync-metrics', async (job: Job) => {
  if (job.name === 'sync') return syncMetricsJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 5 });

const videoGenerationWorker = new Worker('generate-video', async (job: Job) => {
  if (job.name === 'generate-video') return generateVideoJob(job);
  throw new Error('Unknown video job name: ' + job.name);
}, { connection: redisConnection, concurrency: 2 });

// Sanitize logs (no secrets, access tokens, or private credentials)
const allWorkers = [
  { name: 'research-trends', worker: researchWorker },
  { name: 'content-generation', worker: contentWorker },
  { name: 'publish-post', worker: publishWorker },
  { name: 'sync-metrics', worker: metricsWorker },
  { name: 'generate-video', worker: videoGenerationWorker },
];

allWorkers.forEach(({ name, worker }) => {
  worker.on('completed', (job: Job) => {
    console.log(`[Worker:${name}] Job ${job.id} (${job.name}) completed successfully.`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[Worker:${name}] Job ${job?.id ?? 'unknown'} (${job?.name ?? 'unknown'}) failed: ${err.message}`);
  });

  worker.on('error', (err: Error) => {
    console.error(`[Worker:${name}] Internal worker error: ${err.message}`);
  });
});

console.log('Workers started with observability listeners: content-generation, publish-post, sync-metrics, research-trends, generate-video');

// Graceful shutdown for SIGTERM and SIGINT
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down worker pool...`);
  try {
    await Promise.all([
      contentWorker.close(),
      publishWorker.close(),
      metricsWorker.close(),
      researchWorker.close(),
      videoGenerationWorker.close(),
    ]);
    await redisConnection.quit();
    console.log('All workers and Redis connections successfully closed.');
    process.exit(0);
  } catch (err: any) {
    console.error('Error during worker graceful shutdown:', err?.message || err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
