import {
  useCan,
  usePublicServerSettings,
  useServerName
} from '@/features/server/hooks';
import { getFileUrl } from '@/helpers/get-file-url';
import { Permission } from '@sharkord/shared';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@sharkord/ui';
import {
  Database,
  HardDrive,
  Link2,
  PackageOpen,
  Puzzle,
  Settings,
  Shield,
  Smile,
  UsersRound,
  X
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TServerScreenBaseProps } from '../screens';
import { Emojis } from './emojis';
import { General } from './general';
import { Invites } from './invites';
import { Plugins } from './plugins';
import { Roles } from './roles';
import { Storage } from './storage';
import { Updates } from './updates';
import { Users } from './users';

type TServerSettingsProps = TServerScreenBaseProps;

type TSectionTitleProps = {
  title: string;
};

const SectionTitle = memo(({ title }: TSectionTitleProps) => (
  <div className="mb-5 border-b border-border/70 pb-4">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
  </div>
));

const navItemClass =
  'h-9 w-full justify-start gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground ' +
  'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground ' +
  'hover:bg-accent/70 hover:text-foreground disabled:opacity-35';

const ServerSettings = memo(({ close }: TServerSettingsProps) => {
  const { t } = useTranslation('settings');
  const can = useCan();
  const serverName = useServerName();
  const publicSettings = usePublicServerSettings();
  const logoUrl = getFileUrl(publicSettings?.logo);

  const defaultTab = useMemo(() => {
    if (can(Permission.MANAGE_SETTINGS)) return 'general';
    if (can(Permission.MANAGE_ROLES)) return 'roles';
    if (can(Permission.MANAGE_EMOJIS)) return 'emojis';
    if (can(Permission.MANAGE_STORAGE)) return 'storage';
    if (can(Permission.MANAGE_USERS)) return 'users';
    if (can(Permission.MANAGE_INVITES)) return 'invites';
    if (can(Permission.MANAGE_UPDATES)) return 'updates';
    if (can(Permission.MANAGE_PLUGINS)) return 'plugins';
    return 'general';
  }, [can]);

  return (
    <div data-sharkord-settings-overlay className="left-0 right-0 md:left-[72px] fixed inset-y-0 bottom-0 top-8 z-[1000] flex items-center justify-center bg-black/70 p-0 backdrop-blur-[1px] md:left-[72px] xl:p-5">
      <style>{`
        [data-radix-popper-content-wrapper] {
          z-index: 1100 !important;
        }

        [data-slot="select-content"],
        [data-slot="dropdown-menu-content"],
        [data-slot="popover-content"] {
          z-index: 1101 !important;
        }
      `}</style>
      <div
        className="flex h-full w-full overflow-hidden bg-background text-foreground shadow-2xl xl:h-[min(860px,calc(100vh-72px))] xl:w-[min(1180px,calc(100vw-40px))] xl:border xl:border-border/70 xl:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-label={t('serverSettingsTitle')}
      >
        <Tabs
          defaultValue={defaultTab}
          orientation="vertical"
          className="flex h-full min-h-0 w-full flex-row items-stretch"
        >
          <aside className="flex w-[260px] shrink-0 flex-col border-r border-border/70 bg-card/95">
            <div className="border-b border-border/70 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                      {(serverName || 'S').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {serverName || t('serverSettingsTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('serverSettingsTitle')}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('serverSettingsTitle')}
              </div>

              <TabsList className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="general"
                  disabled={!can(Permission.MANAGE_SETTINGS)}
                  className={navItemClass}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>{t('generalTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="roles"
                  disabled={!can(Permission.MANAGE_ROLES)}
                  className={navItemClass}
                >
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>{t('rolesTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="emojis"
                  disabled={!can(Permission.MANAGE_EMOJIS)}
                  className={navItemClass}
                >
                  <Smile className="h-4 w-4 shrink-0" />
                  <span>{t('emojisTab')}</span>
                </TabsTrigger>

                <div className="my-2 h-px bg-border/70" />

                <TabsTrigger
                  value="storage"
                  disabled={!can(Permission.MANAGE_STORAGE)}
                  className={navItemClass}
                >
                  <HardDrive className="h-4 w-4 shrink-0" />
                  <span>{t('storageTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="users"
                  disabled={!can(Permission.MANAGE_USERS)}
                  className={navItemClass}
                >
                  <UsersRound className="h-4 w-4 shrink-0" />
                  <span>{t('usersTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="invites"
                  disabled={!can(Permission.MANAGE_INVITES)}
                  className={navItemClass}
                >
                  <Link2 className="h-4 w-4 shrink-0" />
                  <span>{t('invitesTab')}</span>
                </TabsTrigger>

                <div className="my-2 h-px bg-border/70" />

                <TabsTrigger
                  value="plugins"
                  disabled={!can(Permission.MANAGE_PLUGINS)}
                  className={navItemClass}
                >
                  <Puzzle className="h-4 w-4 shrink-0" />
                  <span>{t('pluginsTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="updates"
                  disabled={!can(Permission.MANAGE_UPDATES)}
                  className={navItemClass}
                >
                  <PackageOpen className="h-4 w-4 shrink-0" />
                  <span>{t('updatesTab')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2 border-t border-border/70 px-4 py-3 text-[11px] text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              <span>Sharkord Server</span>
            </div>
          </aside>

          <main className="relative min-w-0 flex-1 bg-background">
            <div className="absolute right-4 top-4 z-30">
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                title="Fechar (ESC)"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-full overflow-y-scroll [scrollbar-gutter:stable]">
              <div className="mx-auto box-border w-full max-w-[860px] min-w-0 px-8 py-10 pr-20">
                <TabsContent value="general" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('generalTab')} />
                  {can(Permission.MANAGE_SETTINGS) && <General />}
                </TabsContent>

                <TabsContent value="roles" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('rolesTab')} />
                  {can(Permission.MANAGE_ROLES) && <Roles />}
                </TabsContent>

                <TabsContent value="emojis" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('emojisTab')} />
                  {can(Permission.MANAGE_EMOJIS) && <Emojis />}
                </TabsContent>

                <TabsContent value="storage" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('storageTab')} />
                  {can(Permission.MANAGE_STORAGE) && <Storage />}
                </TabsContent>

                <TabsContent value="users" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('usersTab')} />
                  {can(Permission.MANAGE_USERS) && <Users />}
                </TabsContent>

                <TabsContent value="invites" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('invitesTab')} />
                  {can(Permission.MANAGE_INVITES) && <Invites />}
                </TabsContent>

                <TabsContent value="plugins" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('pluginsTab')} />
                  {can(Permission.MANAGE_PLUGINS) && <Plugins />}
                </TabsContent>

                <TabsContent value="updates" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('updatesTab')} />
                  {can(Permission.MANAGE_UPDATES) && <Updates />}
                </TabsContent>
              </div>
            </div>
          </main>
        </Tabs>
      </div>
    </div>
  );
});

export { ServerSettings };