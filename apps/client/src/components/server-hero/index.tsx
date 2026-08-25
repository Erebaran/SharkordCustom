import { usePublicServerSettings } from '@/features/server/hooks';
import { getFileUrl } from '@/helpers/get-file-url';
import { memo } from 'react';

const ServerHero = memo(() => {
  const publicSettings = usePublicServerSettings();
  const bannerUrl = getFileUrl(publicSettings?.banner);

  return (
    <div className="relative h-44 w-full shrink-0 border-b border-border bg-card overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="h-full w-full object-cover object-center block"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/55 to-transparent" />
      </div>
    </div>
  );
});

export { ServerHero };