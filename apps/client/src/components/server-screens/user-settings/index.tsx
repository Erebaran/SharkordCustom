import { UserAvatar } from '@/components/user-avatar';
import { useOwnPublicUser } from '@/features/server/users/hooks';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@sharkord/ui';
import {
  Bell,
  Download,
  KeyRound,
  MonitorCog,
  Palette,
  UserRound,
  X
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TServerScreenBaseProps } from '../screens';
import { Devices } from './devices';
import { Notifications } from './notifications';
import { Others } from './others';
import { Password } from './password';
import { Profile } from './profile';
import { Updates } from './updates';

type TUserSettingsProps = TServerScreenBaseProps;

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
  'hover:bg-accent/70 hover:text-foreground';

const UserSettings = memo(({ close }: TUserSettingsProps) => {
  const { t } = useTranslation('settings');
  const ownPublicUser = useOwnPublicUser();

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
        aria-label={t('userSettingsTitle')}
      >
        <Tabs
          defaultValue="profile"
          orientation="vertical"
          className="flex h-full min-h-0 w-full flex-row items-stretch"
        >
          <aside className="flex w-[260px] shrink-0 flex-col border-r border-border/70 bg-card/95">
            <div className="border-b border-border/70 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                {ownPublicUser ? (
                  <UserAvatar
                    userId={ownPublicUser.id}
                    className="h-10 w-10 shrink-0"
                    showStatusBadge={false}
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                )}

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {ownPublicUser?.name || t('userSettingsTitle')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('userSettingsTitle')}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('userSettingsTitle')}
              </div>

              <TabsList className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="profile"
                  className={navItemClass}
                >
                  <UserRound className="h-4 w-4 shrink-0" />
                  <span>{t('profileTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="devices"
                  className={navItemClass}
                >
                  <MonitorCog className="h-4 w-4 shrink-0" />
                  <span>{t('devicesTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="password"
                  className={navItemClass}
                >
                  <KeyRound className="h-4 w-4 shrink-0" />
                  <span>{t('passwordTab')}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="notifications"
                  className={navItemClass}
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  <span>{t('notificationsTab')}</span>
                </TabsTrigger>

                <div className="my-2 h-px bg-border/70" />

                <TabsTrigger
                  value="others"
                  className={navItemClass}
                >
                  <Palette className="h-4 w-4 shrink-0" />
                  <span>{t('othersTab')}</span>
                </TabsTrigger>

            <TabsTrigger
              value="updates"
              className={navItemClass}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Updates</span>
            </TabsTrigger>
              </TabsList>
            </div>

            <div className="border-t border-border/70 px-4 py-3 text-[11px] text-muted-foreground">
              Sharkord
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
              <div className="mx-auto w-full max-w-[820px] px-8 py-10 pr-20">
                <TabsContent value="profile" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('profileTab')} />
                  <Profile />
                </TabsContent>

                <TabsContent value="devices" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('devicesTab')} />
                  <Devices />
                </TabsContent>

                <TabsContent value="password" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('passwordTab')} />
                  <Password />
                </TabsContent>

                <TabsContent value="notifications" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('notificationsTab')} />
                  <Notifications />
                </TabsContent>

                <TabsContent value="others" className="m-0 w-full min-w-0 [&>*]:w-full">
                  <SectionTitle title={t('othersTab')} />
                  <Others />
                </TabsContent>

          <TabsContent value="updates" className="m-0 w-full min-w-0 [&>*]:w-full">
            <SectionTitle title="Updates" />
            <Updates />
          </TabsContent>
              </div>
            </div>
          </main>
        </Tabs>
      </div>
    </div>
  );
});

export { UserSettings };