import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@sharkord/ui';
import { Download, RefreshCw, RotateCcw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

type TUpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'installing'
  | 'error'
  | 'development';

type TUpdaterState = {
  status?: TUpdaterStatus;
  currentVersion?: string;
  availableVersion?: string | null;
  progress?: number;
  error?: string | null;
  packaged?: boolean;
};

type TUpdaterResult = {
  state?: TUpdaterState;
};

type TUpdaterApi = {
  getState: () => Promise<TUpdaterResult | TUpdaterState>;
  check: () => Promise<TUpdaterResult | TUpdaterState>;
  download: () => Promise<TUpdaterResult | TUpdaterState>;
  install: () => Promise<TUpdaterResult | TUpdaterState>;
  onState: (callback: (state: TUpdaterState) => void) => () => void;
};

declare global {
  interface Window {
    sharkordUpdater?: TUpdaterApi;
  }
}

const unwrapState = (
  value: TUpdaterResult | TUpdaterState | null | undefined
): TUpdaterState | null => {
  if (!value) return null;

  if ('state' in value && value.state) {
    return value.state;
  }

  return value as TUpdaterState;
};

const Updates = memo(() => {
  const [state, setState] = useState<TUpdaterState>({
    status: 'idle',
    progress: 0
  });

  const updater = window.sharkordUpdater;

  useEffect(() => {
    if (!updater) {
      setState({
        status: 'development',
        packaged: false
      });

      return;
    }

    let mounted = true;

    updater
      .getState()
      .then((result) => {
        if (!mounted) return;

        const nextState = unwrapState(result);

        if (nextState) {
          setState(nextState);
        }
      })
      .catch((error) => {
        if (!mounted) return;

        setState({
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        });
      });

    const unsubscribe = updater.onState((nextState) => {
      if (mounted) {
        setState(nextState);
      }
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [updater]);

  const status = state.status || 'idle';
  const progress = Math.max(0, Math.min(100, Number(state.progress || 0)));

  const statusCopy = useMemo(() => {
    switch (status) {
      case 'checking':
        return {
          title: 'Checking for updatesâ€¦',
          detail: 'Looking for a newer version of Sharkord Desktop.'
        };

      case 'available':
        return {
          title: 'Update available',
          detail: state.availableVersion
            ? `Version ${state.availableVersion} is ready to download.`
            : 'A newer version is ready to download.'
        };

      case 'downloading':
        return {
          title: 'Downloading updateâ€¦',
          detail: `${progress.toFixed(1)}% complete`
        };

      case 'downloaded':
        return {
          title: 'Update ready',
          detail: state.availableVersion
            ? `Version ${state.availableVersion} has been downloaded.`
            : 'The update has been downloaded and is ready to install.'
        };

      case 'installing':
        return {
          title: 'Restarting to installâ€¦',
          detail: 'Sharkord Desktop will close and install the update.'
        };

      case 'not-available':
        return {
          title: 'You are up to date',
          detail: 'You already have the latest version of Sharkord Desktop.'
        };

      case 'development':
        return {
          title: 'Updates unavailable in development',
          detail: 'Auto-update is available only in the packaged desktop app.'
        };

      case 'error':
        return {
          title: 'Update failed',
          detail: state.error || 'An unexpected updater error occurred.'
        };

      case 'idle':
      default:
        return {
          title: 'Updates',
          detail:
            'Check whether a newer version of Sharkord Desktop is available.'
        };
    }
  }, [progress, state.availableVersion, state.error, status]);

  const action = useMemo(() => {
    if (status === 'available') {
      return {
        label: 'Download',
        icon: Download
      };
    }

    if (status === 'downloaded') {
      return {
        label: 'Restart and install',
        icon: RotateCcw
      };
    }

    return {
      label: 'Check for updates',
      icon: RefreshCw
    };
  }, [status]);

  const busy =
    status === 'checking' ||
    status === 'downloading' ||
    status === 'installing';

  const disabled = !updater || busy || status === 'development';

  const onAction = useCallback(async () => {
    if (!updater || disabled) return;

    try {
      let result: TUpdaterResult | TUpdaterState;

      if (status === 'available') {
        result = await updater.download();
      } else if (status === 'downloaded') {
        result = await updater.install();
      } else {
        result = await updater.check();
      }

      const nextState = unwrapState(result);

      if (nextState) {
        setState(nextState);
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  }, [disabled, status, updater]);

  const ActionIcon = action.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sharkord Desktop</CardTitle>
          <CardDescription>
            Desktop client version and update information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between gap-6 py-3 first:pt-0">
              <span className="text-sm text-muted-foreground">
                Current version
              </span>
              <span className="truncate text-sm font-medium">
                {state.currentVersion || 'â€”'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6 py-3">
              <span className="text-sm text-muted-foreground">
                Available version
              </span>
              <span className="truncate text-sm font-medium">
                {state.availableVersion || 'â€”'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6 py-3 last:pb-0">
              <span className="text-sm text-muted-foreground">
                Update channel
              </span>
              <span className="text-sm font-medium">Stable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{statusCopy.title}</CardTitle>
          <CardDescription>{statusCopy.detail}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'downloading' && (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="text-right text-xs text-muted-foreground">
                {progress.toFixed(1)}%
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onAction} disabled={disabled}>
              <ActionIcon
                className={`mr-2 h-4 w-4 ${
                  status === 'checking' ? 'animate-spin' : ''
                }`}
              />
              {action.label}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { Updates };
