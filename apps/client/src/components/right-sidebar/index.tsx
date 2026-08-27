import { ResizableSidebar } from '@/components/resizable-sidebar';
import { ServerSearch } from '@/components/top-bar/server-search';
import { UserAvatar } from '@/components/user-avatar';
import { userRolesSelector } from '@/features/server/selectors';
import { useUserById, useUsers } from '@/features/server/users/hooks';
import type { IRootState } from '@/features/store';
import { getFileUrl } from '@/helpers/get-file-url';
import { LocalStorageKey } from '@/helpers/storage';
import { cn } from '@/lib/utils';
import {
  DELETED_USER_IDENTITY_AND_NAME,
  type TJoinedRole
} from '@sharkord/shared';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { UserPopover } from '../user-popover';

const MAX_USERS_TO_SHOW = 100;
const MIN_WIDTH = 180;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 240;

type TUserProps = {
  userId: number;
  name: string;
  banned: boolean;
  role?: TJoinedRole | null;
};

type TMemberRoleInfo = {
  userId: number;
  roles: TJoinedRole[];
};

type TRoleGroup = {
  key: string;
  role: TJoinedRole | null;
  users: {
    id: number;
    name: string;
    banned: boolean;
  }[];
};

const getPrimaryRole = (roles: TJoinedRole[]) => {
  if (!roles.length) return null;

  return [...roles].sort((roleA, roleB) => {
    const defaultA = Boolean(roleA.isDefault);
    const defaultB = Boolean(roleB.isDefault);

    if (defaultA !== defaultB) {
      return Number(defaultA) - Number(defaultB);
    }

    return Number(roleA.id ?? 0) - Number(roleB.id ?? 0);
  })[0];
};

const User = memo(({ userId, name, banned, role }: TUserProps) => {
  const user = useUserById(userId);
  const bannerUrl = getFileUrl(user?.banner);

  return (
    <UserPopover userId={userId}>
      <div className="group relative flex min-h-12 min-w-0 select-none items-center gap-3 overflow-hidden rounded-md rounded-tl-lg px-2 py-1.5">
        {bannerUrl ? (
          <>
            <img
              src={bannerUrl}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0 bg-black/45" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/30" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-muted/35 transition-colors group-hover:bg-accent" />
        )}

        <div className="relative z-10 shrink-0 rounded-full bg-black/15 p-0.5 shadow-sm">
          <UserAvatar userId={userId} className="h-8 w-8 shrink-0" />
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              'truncate text-sm font-medium',
              bannerUrl
                ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                : 'text-foreground',
              banned && 'line-through text-muted-foreground'
            )}
            style={
              !banned && role?.color
                ? {
                    color: role.color
                  }
                : undefined
            }
          >
            {name}
          </span>

          {role && (
            <span
              className={cn(
                'truncate text-[10px] font-medium uppercase tracking-wide',
                bannerUrl
                  ? 'text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                  : 'text-muted-foreground'
              )}
            >
              {role.name}
            </span>
          )}
        </div>
      </div>
    </UserPopover>
  );
});

type TRoleHeaderProps = {
  role: TJoinedRole | null;
  count: number;
};

const RoleHeader = memo(({ role, count }: TRoleHeaderProps) => (
  <div
    className="flex min-h-7 select-none items-center px-2 pt-2 text-[11px] font-bold uppercase tracking-wide"
    style={
      role?.color
        ? {
            color: role.color
          }
        : undefined
    }
  >
    <span className={cn(!role?.color && 'text-muted-foreground')}>
      {role?.name || 'Members'}
    </span>

    <span
      className={cn('ml-1 opacity-80', !role?.color && 'text-muted-foreground')}
    >
      {' - '}
      {count}
    </span>
  </div>
));
type TRightSidebarProps = {
  className?: string;
  isOpen?: boolean;
};

const RightSidebar = memo(
  ({ className, isOpen = true }: TRightSidebarProps) => {
    const { t } = useTranslation('sidebar');
    const users = useUsers();

    const filteredUsers = useMemo(
      () =>
        users
          .filter((user) => user.name !== DELETED_USER_IDENTITY_AND_NAME)
          .slice(0, MAX_USERS_TO_SHOW),
      [users]
    );

    const memberRoles = useSelector((state: IRootState) =>
      filteredUsers.map(
        (user): TMemberRoleInfo => ({
          userId: user.id,
          roles: userRolesSelector(state, user.id)
        })
      )
    );

    const roleGroups = useMemo(() => {
      const rolesByUserId = new Map(
        memberRoles.map((item) => [item.userId, item.roles])
      );

      const groups = new Map<string, TRoleGroup>();

      for (const user of filteredUsers) {
        const primaryRole = getPrimaryRole(rolesByUserId.get(user.id) || []);
        const key = primaryRole ? `role-${primaryRole.id}` : 'role-none';

        if (!groups.has(key)) {
          groups.set(key, {
            key,
            role: primaryRole,
            users: []
          });
        }

        groups.get(key)!.users.push(user);
      }

      return Array.from(groups.values()).sort((groupA, groupB) => {
        const roleA = groupA.role;
        const roleB = groupB.role;

        if (!roleA && roleB) return 1;
        if (roleA && !roleB) return -1;
        if (!roleA && !roleB) return 0;

        const defaultA = Boolean(roleA?.isDefault);
        const defaultB = Boolean(roleB?.isDefault);

        if (defaultA !== defaultB) {
          return Number(defaultA) - Number(defaultB);
        }

        return Number(roleA?.id ?? 0) - Number(roleB?.id ?? 0);
      });
    }, [filteredUsers, memberRoles]);

    const usersCount = users.filter(
      (user) => user.name !== DELETED_USER_IDENTITY_AND_NAME
    ).length;

    const hasHiddenUsers = usersCount > MAX_USERS_TO_SHOW;

    return (
      <ResizableSidebar
        storageKey={LocalStorageKey.RIGHT_SIDEBAR_WIDTH}
        minWidth={MIN_WIDTH}
        maxWidth={MAX_WIDTH}
        defaultWidth={DEFAULT_WIDTH}
        edge="left"
        isOpen={isOpen}
        className={cn('h-full bg-card/75', className)}
      >
        <div className="border-b border-border p-2">
          <div className="w-full [&>button]:w-full [&>button]:max-w-none">
            <ServerSearch />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div>
            {roleGroups.map((group) => (
              <div key={group.key}>
                <RoleHeader role={group.role} count={group.users.length} />

                <div className="space-y-1">
                  {group.users.map((user) => (
                    <User
                      key={user.id}
                      userId={user.id}
                      name={user.name}
                      banned={user.banned}
                      role={group.role}
                    />
                  ))}
                </div>
              </div>
            ))}

            {hasHiddenUsers && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                +{usersCount - MAX_USERS_TO_SHOW} more...
              </div>
            )}
          </div>
        </div>
      </ResizableSidebar>
    );
  }
);

export { RightSidebar };
