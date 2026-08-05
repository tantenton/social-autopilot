import { Worker } from 'bullmq';
import { redisConnection, contentGenerationQueue, publishQueue, metricsQueue } from '../src/lib/queue';
import generateContentJob from './jobs/generateContent';
import generateVideoJob from './jobs/generateVideo';
import publishPostJob from './jobs/publishPost';
import syncMetricsJob from './jobs/syncMetrics';
import researchTrendsJob from './jobs/researchTrends';

// Research trends worker (optional — can also be triggered by cron or BullMQ repeat)
const researchWorker = new Worker('research-trends', async (job: any) => {
  return researchTrendsJob();
}, { connection: redisConnection, concurrency: 1 });

const contentWorker = new Worker('content-generation', async (job: any) => {
  if (job.name === 'generate') return generateContentJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 2 });

const publishWorker = new Worker('publish-post', async (job: any) => {
  if (job.name === 'publish') return publishPostJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 3 });

const metricsWorker = new Worker('sync-metrics', async (job: any) => {
  if (job.name === 'sync') return syncMetricsJob(job);
  throw new Error('Unknown job name: ' + job.name);
}, { connection: redisConnection, concurrency: 5 });

const videoGenerationWorker = new Worker('generate-video', async (job: any) => {
  if (job.name === 'generate-video') return generateVideoJob(job);
  throw new Error('Unknown video job name: ' + job.name);
}, { connection: redisConnection, concurrency: 2 });

console.log('Workers started: content-generation, publish-post, sync-metrics, research-trends, generate-video');

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
