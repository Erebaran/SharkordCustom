import '@/helpers/chrome-color';
import { BannerControls } from '@/components/banner-controls';
import { LeftSidebar } from '@/components/left-sidebar';
import { ModViewSheet } from '@/components/mod-view-sheet';
import { Protect } from '@/components/protect';
import { RightSidebar } from '@/components/right-sidebar';
import { ServerHero } from '@/components/server-hero';
import { ServerRail } from '@/components/server-rail';
import { ThreadSidebar } from '@/components/thread-sidebar';
import { TopBar } from '@/components/top-bar';
import { VoiceChatSidebar } from '@/components/voice-chat-sidebar';
import { VoiceProvider } from '@/components/voice-provider';
import { useSelectedDmChannelId, useThreadSidebar } from '@/features/app/hooks';
import { setDmsOpen } from '@/features/server/actions';
import { setSelectedChannelId } from '@/features/server/channels/actions';
import { useDmsOpen, usePublicServerSettings } from '@/features/server/hooks';
import { getLocalStorageItemBool, LocalStorageKey } from '@/helpers/storage';
import { useSwipeGestures } from '@/hooks/use-swipe-gestures';
import { cn } from '@/lib/utils';
import { Permission, TestId } from '@sharkord/shared';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ContentWrapper } from './content-wrapper';
import { PreventBrowser } from './prevent-browser';

const ServerView = memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUsersOpen, setIsMobileUsersOpen] = useState(false);
  const [isDesktopRightSidebarOpen, setIsDesktopRightSidebarOpen] = useState(
    getLocalStorageItemBool(LocalStorageKey.RIGHT_SIDEBAR_STATE, true)
  );

  const dmsOpen = useDmsOpen();
  const selectedDmChannelId = useSelectedDmChannelId();
  const publicSettings = usePublicServerSettings();
  const previousServerChannelIdRef = useRef<number | undefined>(undefined);
  const { isOpen: isThreadSidebarOpen } = useThreadSidebar();

  const handleDesktopRightSidebarToggle = useCallback(() => {
    setIsDesktopRightSidebarOpen((prev) => !prev);
    localStorage.setItem(
      LocalStorageKey.RIGHT_SIDEBAR_STATE,
      !isDesktopRightSidebarOpen ? 'true' : 'false'
    );
  }, [isDesktopRightSidebarOpen]);

  const handleSwipeRight = useCallback(() => {
    if (isMobileMenuOpen || isMobileUsersOpen) {
      setIsMobileMenuOpen(false);
      setIsMobileUsersOpen(false);
      return;
    }
    setIsMobileMenuOpen(true);
  }, [isMobileMenuOpen, isMobileUsersOpen]);

  const handleSwipeLeft = useCallback(() => {
    if (isMobileMenuOpen || isMobileUsersOpen) {
      setIsMobileMenuOpen(false);
      setIsMobileUsersOpen(false);
      return;
    }
    setIsMobileUsersOpen(true);
  }, [isMobileMenuOpen, isMobileUsersOpen]);

  const swipeHandlers = useSwipeGestures({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft
  });

  // DM MEMBERS TEMPORARIO V7.8A
  useEffect(() => {
    if (dmsOpen) {
      setIsMobileUsersOpen(false);
    }
  }, [dmsOpen]);
  useEffect(() => {
    if (publicSettings?.directMessagesEnabled === false && dmsOpen) {
      setDmsOpen(false);

      if (previousServerChannelIdRef.current) {
        setSelectedChannelId(previousServerChannelIdRef.current);
      }
    }
  }, [publicSettings?.directMessagesEnabled, dmsOpen]);

  return (
    <VoiceProvider>
      <div
        data-testid={TestId.SERVER_VIEW}
        className="flex h-dvh min-h-0 flex-col bg-background text-foreground dark"
        {...swipeHandlers}
      >
        <TopBar />

        <div
          className="relative flex min-h-0 flex-1 overflow-hidden"
          style={{
            background:
              'var(--sharkord-chrome-background, var(--sharkord-chrome-color, hsl(var(--card))))'
          }}
        >
          <PreventBrowser />

          <ServerRail />

          <div
            className="flex min-w-0 flex-1 flex-col bg-background overflow-hidden border-l border-t border-border"
          >
            {!dmsOpen && (
              <div className="relative shrink-0">
                <div
              data-sharkord-hero-chrome-corner
              style={{
                background:
                  'var(--sharkord-chrome-background, var(--sharkord-chrome-color, hsl(var(--card))))'
              }}
            >
              <ServerHero />
            </div>

                <BannerControls
                  onToggleRightSidebar={handleDesktopRightSidebarToggle}
                  isOpen={isDesktopRightSidebarOpen}
                />
              </div>
            )}

            <div className="relative flex min-h-0 flex-1 overflow-hidden">
              {isMobileMenuOpen && (
                <div
                  className="fixed inset-0 z-30 bg-black/50 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}

              {isMobileUsersOpen && (
                <div
                  className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                  onClick={() => setIsMobileUsersOpen(false)}
                />
              )}

              <LeftSidebar
                className={cn(
                  'fixed inset-y-0 left-0 z-40 h-full transition-transform duration-300 ease-in-out md:relative md:inset-auto md:z-20 md:flex',
                  isMobileMenuOpen
                    ? 'translate-x-0'
                    : '-translate-x-full md:translate-x-0'
                )}
              />

              <ContentWrapper
                isDmMode={dmsOpen}
                selectedDmChannelId={selectedDmChannelId}
              />

              <VoiceChatSidebar />
              <ThreadSidebar isOpen={isThreadSidebarOpen} />

              <RightSidebar
                className={cn(
                  'fixed top-0 right-0 bottom-0 z-40 h-full',
                  'lg:relative lg:z-0',
                  isMobileUsersOpen
                    ? 'translate-x-0 lg:translate-x-0'
                    : 'translate-x-full lg:translate-x-0'
                )}
                isOpen={!dmsOpen && (isMobileUsersOpen || isDesktopRightSidebarOpen)}
              />

              <Protect permission={Permission.MANAGE_USERS}>
                <ModViewSheet />
              </Protect>
            </div>
          </div>
        </div>
      </div>
    </VoiceProvider>
  );
});

export { ServerView };