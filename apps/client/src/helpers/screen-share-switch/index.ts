const SWITCH_SCREEN_SHARE_KEY = '__sharkordSwitchScreenShareSource';

type TSwitchScreenShareSource = () => Promise<void> | void;

const getSwitchScreenShareSource = () => {
  const candidate = Reflect.get(window, SWITCH_SCREEN_SHARE_KEY);

  return typeof candidate === 'function'
    ? (candidate as TSwitchScreenShareSource)
    : undefined;
};

const canSwitchScreenShareSource = () =>
  getSwitchScreenShareSource() !== undefined;

const switchScreenShareSource = async () => {
  const switchSource = getSwitchScreenShareSource();

  if (!switchSource) {
    console.warn('[ScreenShare React] Electron switch bridge unavailable.');
    return;
  }

  try {
    await switchSource();
  } catch (error) {
    console.error('[ScreenShare React] Failed to switch source:', error);
  }
};

export { canSwitchScreenShareSource, switchScreenShareSource };
