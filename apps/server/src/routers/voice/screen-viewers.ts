type TViewerConsumerIds = Map<number, Set<string>>;
type TStreamerViewers = Map<number, TViewerConsumerIds>;

const viewersByChannel = new Map<number, TStreamerViewers>();

const getOrCreateStreamerViewers = (
  channelId: number,
  streamerId: number
): TViewerConsumerIds => {
  let channelViewers = viewersByChannel.get(channelId);

  if (!channelViewers) {
    channelViewers = new Map();
    viewersByChannel.set(channelId, channelViewers);
  }

  let streamerViewers = channelViewers.get(streamerId);

  if (!streamerViewers) {
    streamerViewers = new Map();
    channelViewers.set(streamerId, streamerViewers);
  }

  return streamerViewers;
};

const addScreenViewer = (
  channelId: number,
  streamerId: number,
  viewerId: number,
  consumerId: string
): void => {
  if (streamerId === viewerId) return;

  const streamerViewers = getOrCreateStreamerViewers(channelId, streamerId);
  const consumerIds = streamerViewers.get(viewerId) ?? new Set<string>();

  consumerIds.add(consumerId);
  streamerViewers.set(viewerId, consumerIds);
};

const removeScreenViewer = (
  channelId: number,
  streamerId: number,
  viewerId: number,
  consumerId: string
): void => {
  const channelViewers = viewersByChannel.get(channelId);
  const streamerViewers = channelViewers?.get(streamerId);
  const consumerIds = streamerViewers?.get(viewerId);

  if (!channelViewers || !streamerViewers || !consumerIds) return;

  consumerIds.delete(consumerId);

  if (consumerIds.size === 0) {
    streamerViewers.delete(viewerId);
  }

  if (streamerViewers.size === 0) {
    channelViewers.delete(streamerId);
  }

  if (channelViewers.size === 0) {
    viewersByChannel.delete(channelId);
  }
};

const getScreenViewers = (channelId: number, streamerId: number): number[] => {
  const streamerViewers = viewersByChannel.get(channelId)?.get(streamerId);

  if (!streamerViewers) return [];

  return Array.from(streamerViewers.keys()).sort((a, b) => a - b);
};

export { addScreenViewer, getScreenViewers, removeScreenViewer };
