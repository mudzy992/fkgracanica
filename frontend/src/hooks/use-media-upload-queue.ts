import { useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mediaUploadQueueFor } from './media-upload-queue-controller';
export type { UploadQueueState } from './media-upload-queue-controller';

export function useMediaUploadQueue(ownerId: string) {
  const controller = mediaUploadQueueFor(useQueryClient(), ownerId);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return { state, enqueue: controller.enqueue, retryRefresh: controller.retryRefresh, clearReport: controller.clearReport };
}
