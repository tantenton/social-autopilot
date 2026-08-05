import { Worker, Job } from 'bullmq';
import { redisConnection } from '../src/lib/queue';
import generateContentJob from './jobs/generateContent';
import generateVideoJob from './jobs/generateVideo';
import publishPostJob from './jobs/publishPost';
import syncMetricsJob from './jobs/syncMetrics';
import researchTrendsJob from './jobs/researchTrends';

// Research trends worker
const researchWorker = new Worker('research-trends', async (job: Job) => {
  return researchTrendsJob();
}, { connection: redisConnection, concurrency: 1 });

// Content generation worker
const contentWorker = new Worker('content-generation', async (job: Job) => {
  if (job.name === 'generate') return generateContentJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 2 });

// Publish post worker
const publishWorker = new Worker('publish-post', async (job: Job) => {
  if (job.name === 'publish') return publishPostJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 3 });

// Sync metrics worker
const metricsWorker = new Worker('sync-metrics', async (job: Job) => {
  if (job.name === 'sync') return syncMetricsJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 5 });

// Video generation worker
const videoGenerationWorker = new Worker('generate-video', async (job: Job) => {
  if (job.name === 'generate-video') return generateVideoJob(job);
  throw new Error('Unknown video job name: ' + job.name);
}, { connection: redisConnection, concurrency: 2 });

// Attach completed, failed, and error event listeners to all workers
const allWorkers = [
  { name: 'research-trends', worker: researchWorker },
  { name: 'content-generation', worker: contentWorker },
  { name: 'publish-post', worker: publishWorker },
  { name: 'sync-metrics', worker: metricsWorker },
  { name: 'generate-video', worker: videoGenerationWorker },
];

allWorkers.forEach(({ name, worker }) => {
  worker.on('completed', (job: Job, returnvalue: any) => {
    console.log(`[Worker:${name}] Job ${job.id} (${job.name}) completed successfully.`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[Worker:${name}] Job ${job?.id ?? 'unknown'} (${job?.name ?? 'unknown'}) failed: ${err.message}`, err);
  });

  worker.on('error', (err: Error) => {
    console.error(`[Worker:${name}] Worker encountered an error: ${err.message}`, err);
  });
});

console.log('Workers started with event listeners: content-generation, publish-post, sync-metrics, research-trends, generate-video');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await contentWorker.close();
  await publishWorker.close();
  await metricsWorker.close();
  await researchWorker.close();
  await videoGenerationWorker.close();
  await redisConnection.quit();
  process.exit(0);
});
