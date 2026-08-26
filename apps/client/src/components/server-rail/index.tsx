import { getFileUrl } from '@/helpers/get-file-url';
import '@/helpers/chrome-color';
import { setDmsOpen } from '@/features/server/actions';
import { setSelectedChannelId } from '@/features/server/channels/actions';
import { useDmsOpen, usePublicServerSettings } from '@/features/server/hooks';
import { Plus, Server, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

type TDesktopServer = {
  url: string;
  name?: string;
  avatarDataUrl?: string | null;
};

type TDesktopServerState = {
  currentServer?: string | null;
  appIconDataUrl?: string | null;
  servers?: TDesktopServer[];
};

type TDesktopServersApi = {
  getState: () => Promise<TDesktopServerState>;
  connect: (serverUrl: string) => Promise<unknown>;
  add: (serverUrl: string) => Promise<unknown>;
  remove: (serverUrl: string) => Promise<unknown>;
};

const getDesktopApi = () =>
  (
    window as Window & {
      sharkordDesktopServers?: TDesktopServersApi;
    }
  ).sharkordDesktopServers;

const firstLetter = (value?: string) =>
  String(value || '?').trim().charAt(0).toUpperCase() || '?';

const ServerRail = memo(() => {
  const publicSettings = usePublicServerSettings();
  const currentServerLogoUrl = getFileUrl(publicSettings?.logo);
  const dmsOpen = useDmsOpen();

  const [state, setState] = useState<TDesktopServerState>({
    currentServer: null,
    servers: []
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const api = getDesktopApi();
    if (!api) return;

    try {
      const nextState = await api.getState();
      setState({
        currentServer: nextState?.currentServer || null,
        appIconDataUrl: nextState?.appIconDataUrl || null,
        servers: Array.isArray(nextState?.servers) ? nextState.servers : []
      });
    } catch (caughtError) {
      console.error('[ServerRail] falha carregando servidores:', caughtError);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openDirectMessages = useCallback(() => {
    if (publicSettings?.directMessagesEnabled === false) return;

    setSelectedChannelId(undefined);
    setDmsOpen(true);
  }, [publicSettings?.directMessagesEnabled]);

  const connect = useCallback(
    async (url: string) => {
      setDmsOpen(false);
      const api = getDesktopApi();
      if (!api || !url) return;

      setDmsOpen(false);

      if (url === state.currentServer) {
        return;
      }

      setIsBusy(true);
      try {
        await api.connect(url);
      } catch (caughtError) {
        console.error('[ServerRail] falha conectando:', caughtError);
        setIsBusy(false);
      }
    },
    [state.currentServer]
  );

  const removeServer = useCallback(
    async (url: string, name?: string) => {
      const api = getDesktopApi();
      if (!api || !url || isBusy) return;

      const label = String(name || url).trim() || url;
      const confirmed = window.confirm(
        `Remover "${label}" da lista de servidores?`
      );

      if (!confirmed) return;

      setIsBusy(true);
      setError('');

      try {
        await api.remove(url);
        await refresh();
      } catch (caughtError) {
        console.error('[ServerRail] falha removendo servidor:', caughtError);
        window.alert(
          caughtError instanceof Error
            ? caughtError.message
            : 'Nao foi possivel remover o servidor.'
        );
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, refresh]
  );
  const addServer = useCallback(async () => {
    const value = serverUrl.trim();
    const api = getDesktopApi();

    if (!value) {
      setError('Digite o endereco do servidor.');
      return;
    }

    if (!api) {
      setError('API do Sharkord Desktop nao encontrada.');
      return;
    }

    setIsBusy(true);
    setError('');

    try {
      await api.add(value);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Nao foi possivel conectar ao servidor.'
      );
      setIsBusy(false);
    }
  }, [serverUrl]);

  return (
    <>
      <aside className="hidden h-full w-[72px] shrink-0 flex-col items-center pt-6 md:flex "
        style={{background: 'var(--sharkord-chrome-background, var(--sharkord-chrome-color, hsl(var(--card))))',}}
      >

        <button
          type="button"
          title="Direct Messages"
          onClick={openDirectMessages}
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-primary/15 text-primary shadow-lg transition',
            dmsOpen
              ? 'rounded-full ring-2 ring-foreground'
              : 'rounded-full hover:rounded-2xl'
          ].join(' ')}
        >
          {state.appIconDataUrl ? (
            <img
              src={state.appIconDataUrl}
              alt="Sharkord"
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <Server className="h-5 w-5" />
          )}
        </button>

        <div className="my-3 h-px w-8 shrink-0 bg-border" />

        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-0.5">
          {(state.servers || []).map((server) => {
            const active = !dmsOpen && server.url === state.currentServer;
            const isCurrentServer = server.url === state.currentServer;
            const serverAvatarUrl =
              isCurrentServer
                ? currentServerLogoUrl || server.avatarDataUrl
                : server.avatarDataUrl;

            return (
              <div
                key={server.url}
                className="group relative h-12 w-12 shrink-0"
              >
                <button
                  type="button"
                  title={`${server.name || server.url}\n${server.url}`}
                  disabled={isBusy}
                  onClick={() => void connect(server.url)}
                  className={[
                    'relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-muted text-sm font-semibold transition-all',
                    active
                      ? 'rounded-full ring-2 ring-foreground'
                      : 'rounded-full hover:rounded-2xl hover:bg-accent'
                  ].join(' ')}
                >
                {active && (
                  <span className="absolute -left-2 h-8 w-1 rounded-r bg-foreground" />
                )}

                {serverAvatarUrl ? (
                  <img
                    src={serverAvatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span>{firstLetter(server.name)}</span>
                )}
                </button>

                <button
                  type="button"
                  title={`Remover ${server.name || server.url}`}
                  aria-label={`Remover ${server.name || server.url}`}
                  disabled={isBusy}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void removeServer(server.url, server.name);
                  }}
                  className="absolute -right-1 -top-1 z-20 hidden h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 group-hover:flex focus:flex"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            title="Adicionar servidor"
            onClick={() => {
              setError('');
              setServerUrl('');
              setIsAddOpen(true);
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[24px] bg-muted text-green-500 transition-all hover:rounded-2xl hover:bg-green-500 hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-foreground">
              Adicionar servidor
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Digite o endereco do servidor Sharkord.
            </p>

            <input
              autoFocus
              value={serverUrl}
              disabled={isBusy}
              onChange={(event) => setServerUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void addServer();
                }
              }}
              placeholder="https://sharkord.exemplo.com"
              className="mt-4 h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />

            {error && (
              <div className="mt-2 text-sm text-destructive">{error}</div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setIsAddOpen(false)}
                className="h-9 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => void addServer()}
                className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isBusy ? 'Conectando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export { ServerRail };