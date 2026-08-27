import { useModViewOpen } from '@/features/app/hooks';
import { closeServerScreens } from '@/features/server-screens/actions';
import { useServerScreenInfo } from '@/features/server-screens/hooks';
import { createElement, memo, useCallback, useEffect, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { CategorySettings } from './category-settings';
import { ChannelSettings } from './channel-settings';
import { ServerScreen } from './screens';
import { ServerSettings } from './server-settings';
import { UserSettings } from './user-settings';

const ScreensMap = {
  [ServerScreen.SERVER_SETTINGS]: ServerSettings,
  [ServerScreen.CHANNEL_SETTINGS]: ChannelSettings,
  [ServerScreen.USER_SETTINGS]: UserSettings,
  [ServerScreen.CATEGORY_SETTINGS]: CategorySettings
};

const portalRoot = document.getElementById('portal')!;

type TWindowWithUserSettingsDiag = Window & {
  __userSettingsDiagInstalled?: boolean;
};

const diagnosticWindow = window as TWindowWithUserSettingsDiag;

if (!diagnosticWindow.__userSettingsDiagInstalled) {
  diagnosticWindow.__userSettingsDiagInstalled = true;

  window.addEventListener('error', (event) => {
    console.error(
      '[UserSettingsDiag] window.error ' +
        JSON.stringify({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error ? String(event.error?.stack || event.error) : null
        })
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error(
      '[UserSettingsDiag] unhandledrejection ' +
        JSON.stringify({
          reason: String(
            (event as PromiseRejectionEvent).reason?.stack ||
              (event as PromiseRejectionEvent).reason
          )
        })
    );
  });
}

type TComponentWrapperProps = {
  children: React.ReactNode;
};

const ComponentWrapper = ({ children }: TComponentWrapperProps) => {
  const { isOpen } = useModViewOpen();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // when mod view is open, do not close server screens
      if (isOpen) return;

      if (e.key === 'Escape') {
        closeServerScreens();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return children;
};

const ServerScreensProvider = memo(() => {
  const { isOpen, props, openServerScreen } = useServerScreenInfo();

  console.log(
    '[ServerScreens state] ' +
      JSON.stringify({
        isOpen,
        openServerScreen,
        props
      })
  );
  let component: JSX.Element | null = null;

  if (openServerScreen && ScreensMap[openServerScreen]) {
    const baseProps = {
      ...props,
      isOpen,
      close: closeServerScreens
    };

    // @ts-expect-error - ÃƒÆ’Ã‚Â© lidar irmoum
    component = createElement(ScreensMap[openServerScreen], baseProps);
  }

  const realIsOpen = isOpen && !!component;

  if (realIsOpen && openServerScreen === ServerScreen.USER_SETTINGS) {
    setTimeout(() => {
      const p = document.getElementById('portal');
      const rect = p?.getBoundingClientRect();
      const center = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      );

      console.log(
        '[UserSettingsDiag] portal ' +
          JSON.stringify({
            exists: !!p,
            display: p ? getComputedStyle(p).display : null,
            visibility: p ? getComputedStyle(p).visibility : null,
            opacity: p ? getComputedStyle(p).opacity : null,
            position: p ? getComputedStyle(p).position : null,
            zIndex: p ? getComputedStyle(p).zIndex : null,
            children: p?.children.length ?? null,
            childTags: p ? Array.from(p.children).map((el) => el.tagName) : [],
            text: p?.textContent?.slice(0, 300) ?? null,
            html: p?.innerHTML?.slice(0, 500) ?? null,
            rect: rect
              ? {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height
                }
              : null,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            centerElement: center
              ? {
                  tag: center.tagName,
                  id: (center as HTMLElement).id || null,
                  className:
                    typeof (center as HTMLElement).className === 'string'
                      ? (center as HTMLElement).className
                      : null,
                  text: center.textContent?.slice(0, 150) ?? null
                }
              : null
          })
      );
    }, 100);
  }

  console.log(
    '[ServerScreens render] ' +
      JSON.stringify({
        isOpen,
        openServerScreen,
        hasComponent: !!component,
        realIsOpen
      })
  );

  if (realIsOpen) {
    portalRoot.style.display = 'block';
  } else {
    portalRoot.style.display = 'none';
  }

  if (!realIsOpen) return null;

  return createPortal(
    <ComponentWrapper>{component}</ComponentWrapper>,
    portalRoot
  );
});

export { ServerScreensProvider };
