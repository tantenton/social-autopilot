import { contentGenerationQueue, publishQueue, metricsQueue } from './queue';

export async function queueGenerateContent(ideaId: string, payload: { topic: string; platform: string; tone: string }) {
  return contentGenerationQueue.add('generate', { ideaId, ...payload }, {
    jobId: `gen-${ideaId}-${Date.now()}`,
  });
}

export async function queuePublishPost(postId: string, scheduledAt: Date | string | number) {
  return publishQueue.add('publish', { postId }, {
    delay: new Date(scheduledAt).getTime() - Date.now(),
    jobId: `pub-${postId}-${Date.now()}`,
  });
}

export async function queueSyncMetrics(postId: string) {
  return metricsQueue.add('sync', { postId }, { jobId: `metrics-${postId}-${Date.now()}` });
}
