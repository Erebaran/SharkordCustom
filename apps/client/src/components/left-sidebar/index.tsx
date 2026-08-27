import { ResizableSidebar } from '@/components/resizable-sidebar';
import { useDmsOpen, useServerName } from '@/features/server/hooks';
import { LocalStorageKey } from '@/helpers/storage';
import { cn } from '@/lib/utils';
import { TestId } from '@sharkord/shared';
import { memo } from 'react';
import { Categories } from './categories';
import { DirectMessages } from './direct-messages';
import { PluginButtons } from './plugin-buttons';
import { ServerDropdownMenu } from './server-dropdown';
import { UserControl } from './user-control';
import { VoiceControl } from './voice-control';

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 288;

type TLeftSidebarProps = {
  className?: string;
};

const LeftSidebar = memo(({ className }: TLeftSidebarProps) => {
  const serverName = useServerName();
  const dmsOpen = useDmsOpen();

  return (
    <ResizableSidebar
      storageKey={LocalStorageKey.LEFT_SIDEBAR_WIDTH}
      minWidth={MIN_WIDTH}
      maxWidth={MAX_WIDTH}
      defaultWidth={DEFAULT_WIDTH}
      edge="right"
      className={cn('h-full bg-card/95', className)}
      data-testid={TestId.LEFT_SIDEBAR}
    >
      {!dmsOpen && (
        <>
          <div className="flex h-12 w-full shrink-0 items-center justify-start border-b border-border px-2">
            <div
              className="min-w-0 flex-1 text-left"
              data-testid={TestId.LEFT_SIDEBAR_SERVER_NAME}
            >
              <ServerDropdownMenu triggerLabel={serverName} />
            </div>
          </div>

          <PluginButtons />
        </>
      )}

      <div className="flex-1 overflow-y-auto">
        {dmsOpen ? <DirectMessages /> : <Categories />}
      </div>

      <VoiceControl />
      <UserControl />
    </ResizableSidebar>
  );
});

export { LeftSidebar };
