import '@/helpers/chrome-color';

import {
  usePublicServerSettings,
  useServerName
} from '@/features/server/hooks';
import { getFileUrl } from '@/helpers/get-file-url';
import { memo, type CSSProperties } from 'react';

const sharkordTopBarStyle = {
  WebkitAppRegion: 'drag',
  background:
    'var(--sharkord-chrome-background, var(--sharkord-chrome-color, hsl(var(--card))))'
} as CSSProperties;

const TopBar = memo(() => {
  const publicSettings = usePublicServerSettings();
  const serverName = useServerName();
  const logoUrl = getFileUrl(publicSettings?.logo);

  return (
    <div
      className="relative flex h-8 w-full shrink-0 items-center justify-center overflow-hidden "
      style={sharkordTopBarStyle}
    >
      <div className="pointer-events-none absolute left-1/2 flex max-w-[70%] -translate-x-1/2 items-center gap-1.5 sm:max-w-[60%] sm:gap-2 lg:max-w-[50%]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-5 w-5 shrink-0 rounded object-cover sm:h-6 sm:w-6 sm:rounded-md"
            draggable={false}
          />
        ) : (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-foreground/80 sm:h-6 sm:w-6 sm:rounded-md sm:text-[11px]">
            {serverName?.trim()?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}

        <span className="min-w-0 truncate text-xs font-semibold text-foreground sm:text-sm">
          {serverName}
        </span>
      </div>
    </div>
  );
});

export { TopBar };
