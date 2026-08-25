import {
  ActivityLogType,
  ChannelPermission,
  getErrorMessage,
  OWNER_ROLE_ID,
  Permission,
  ServerEvents,
  UserStatus,
  type TConnectionParams
} from '@sharkord/shared';
import { TRPCError } from '@trpc/server';
import {
  applyWSSHandler,
  type CreateWSSContextFnOptions
} from '@trpc/server/adapters/ws';
import { eq } from 'drizzle-orm';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { db } from '../db';
import { getAllChannelUserPermissions } from '../db/queries/channels';
import { isUserDmParticipant } from '../db/queries/dms';
import { getUserById, getUserByToken } from '../db/queries/users';
import { channels } from '../db/schema';
import { getWsInfo } from '../helpers/get-ws-info';
import { logger } from '../logger';
import { enqueueActivityLog } from '../queues/activity-log';
import { appRouter } from '../routers';
import { getUserRoles } from '../routers/users/get-user-roles';
import { VoiceRuntime } from '../runtimes/voice';
import { invariant } from './invariant';
import { pubsub } from './pubsub';
import type { Context } from './trpc';

let wss: WebSocketServer | undefined;

const usersIpMap = new Map<number, string>();

const getUserIp = (userId: number): string | undefined => {
  return usersIpMap.get(userId);
};

const getOnlineUserIds = (): number[] => {
  if (!wss) return [];

  const userIdSet = new Set<number>();

  wss.clients.forEach((client) => {
    if (client.userId) {
      userIdSet.add(client.userId);
    }
  });

  return Array.from(userIdSet);
};

const createContext = async ({
  info,
  req
}: CreateWSSContextFnOptions): Promise<Context> => {
  const { token } = info.connectionParams as TConnectionParams;

  const decodedUser = await getUserByToken(token);

  invariant(decodedUser, {
    code: 'UNAUTHORIZED',
    message: 'Invalid authentication token'
  });

  invariant(!decodedUser.banned, {
    code: 'FORBIDDEN',
    message: 'User is banned'
  });

  const hasPermission = async (targetPermission: Permission | Permission[]) => {
    const user = await getUserById(decodedUser.id);

    if (!user) return false;

    const roles = await getUserRoles(user.id);

    const hasOwnerRole = roles.some((r) => r.id === OWNER_ROLE_ID);

    if (hasOwnerRole) return true;

    const permissionsSet = new Set<Permission>();

    for (const role of roles) {
      for (const permission of role.permissions) {
        permissionsSet.add(permission);
      }
    }

    if (Array.isArray(targetPermission)) {
      return targetPermission.every((p) => permissionsSet.has(p));
    }

    return permissionsSet.has(targetPermission);
  };

  const hasChannelPermission = async (
    channelId: number,
    targetPermission: ChannelPermission
  ) => {
    const channel = await db
      .select({
        private: channels.private,
        isDm: channels.isDm
      })
      .from(channels)
      .where(eq(channels.id, channelId))
      .limit(1)
      .get();

    if (!channel) return false;

    if (channel.isDm) {
      const isParticipant = await isUserDmParticipant(
        channelId,
        decodedUser.id
      );

      if (isParticipant) return true;
    }

    if (!channel.private) return true;

    const user = await getUserById(decodedUser.id);

    if (!user) return false;

    const roles = await getUserRoles(user.id);

    const hasOwnerRole = roles.some((r) => r.id === OWNER_ROLE_ID);

    if (hasOwnerRole) return true;

    const userChannelPermissions = await getAllChannelUserPermissions(
      decodedUser.id
    );

    const channelInfo = userChannelPermissions[channelId];

    if (!channelInfo) return false;
    if (!channelInfo.permissions[ChannelPermission.VIEW_CHANNEL]) return false;

    return channelInfo.permissions[targetPermission] === true;
  };

  const getOwnWs = () => {
    if (!wss) return undefined;
    return Array.from(wss.clients).find((client) => client.token === token);
  };

  const getUserWs = (userId: number) => {
    if (!wss) return undefined;
    return Array.from(wss.clients).find((client) => client.userId === userId);
  };

  const getStatusById = (userId: number) => {
    if (!wss) return UserStatus.OFFLINE;

    const isConnected = Array.from(wss.clients).some(
      (ws) => ws.userId === userId
    );

    return isConnected ? UserStatus.ONLINE : UserStatus.OFFLINE;
  };

  const setWsUserId = (userId: number) => {
    if (!wss) return;

    const ws = Array.from(wss.clients).find((client) => client.token === token);

    if (ws) {
      ws.userId = userId;
    }
  };

  const getConnectionInfo = () => {
    if (!wss) return getWsInfo(undefined, req);

    const ws = Array.from(wss.clients).find((client) => client.token === token);

    if (!ws) return undefined;

    return getWsInfo(ws, req);
  };

  const needsPermission = async (
    targetPermission: Permission | Permission[]
  ) => {
    invariant(await hasPermission(targetPermission), {
      code: 'FORBIDDEN',
      message: 'Insufficient permissions'
    });
  };

  const needsChannelPermission = async (
    channelId: number,
    targetPermission: ChannelPermission
  ) => {
    invariant(await hasChannelPermission(channelId, targetPermission), {
      code: 'FORBIDDEN',
      message: 'Insufficient channel permissions'
    });
  };

  const throwValidationError = (field: string, message: string) => {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: JSON.stringify([
        {
          code: 'custom',
          path: [field],
          message
        }
      ])
    });
  };

  const saveUserIp = async (userId: number, ip: string) => {
    usersIpMap.set(userId, ip);
  };

  return {
    pubsub,
    token,
    user: decodedUser,
    authenticated: false,
    userId: decodedUser.id,
    handshakeHash: '',
    currentVoiceChannelId: undefined,
    hasPermission,
    needsPermission,
    hasChannelPermission,
    needsChannelPermission,
    getOwnWs,
    getStatusById,
    setWsUserId,
    getUserWs,
    getConnectionInfo,
    throwValidationError,
    saveUserIp
  };
};

const createWsServer = async (server: http.Server) => {
  return new Promise<WebSocketServer>((resolve) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
      try {
        ws.userId = undefined;
        ws.token = '';

        ws.once('message', async (message) => {
          try {
            const parsed = JSON.parse(message.toString());
            const { token } = parsed.data as TConnectionParams;

            ws.token = token;
          } catch (error) {
            logger.error(
              'Failed to parse initial WebSocket message: %s',
              getErrorMessage(error)
            );
          }
        });

        ws.on('close', async () => {
          try {
            const userId = ws.userId;

            // Ignore connections that never authenticated through joinServer.
            if (!userId) {
              return;
            }

            /*
             * Sharkord may keep multiple WebSocket connections open for the
             * same user. When the app closes, those sockets can close almost
             * simultaneously. If we check immediately, one closing socket may
             * still see another as OPEN and skip cleanup forever.
             *
             * Give the remaining sockets a brief moment to finish closing,
             * then decide whether this was really the user's last session.
             */
            await new Promise((resolve) => setTimeout(resolve, 250));

            const hasOtherSessions = Array.from(wss?.clients ?? []).some(
              (client) =>
                client !== ws &&
                client.userId === userId &&
                client.readyState === WebSocket.OPEN
            );

            if (hasOtherSessions) {
              return;
            }

            const user = await getUserById(userId);

            if (!user) {
              return;
            }

            /*
             * Clean up any voice state still associated with this user.
             * This covers abrupt app closes where the normal leaveVoice
             * mutation never had a chance to run.
             */
            const voiceRuntime = VoiceRuntime.findRuntimeByUserId(user.id);

            if (voiceRuntime) {
              const channelId = voiceRuntime.id;

              voiceRuntime.removeUser(user.id);

              pubsub.publish(ServerEvents.USER_LEAVE_VOICE, {
                channelId,
                userId: user.id
              });

              logger.info(
                '%s automatically left voice channel %s after disconnect',
                user.name,
                channelId
              );
            }

            usersIpMap.delete(user.id);

            pubsub.publish(ServerEvents.USER_LEAVE, user.id);

            logger.info('%s left the server', user.name);

            enqueueActivityLog({
              type: ActivityLogType.USER_LEFT,
              userId: user.id
            });
          } catch (error) {
            logger.error(
              `Error occurred while handling WebSocket close: ${getErrorMessage(error)}`
            );
          }
        });

        ws.on('error', (err) => {
          logger.error('WebSocket client error:', err);
        });
      } catch (error) {
        logger.error(
          `Error occurred while handling WebSocket connection: ${getErrorMessage(error)}`
        );
      }
    });

    wss.on('close', () => {
      logger.debug('WebSocket server closed');
    });

    wss.on('error', (err) => {
      logger.error('WebSocket server error: %s', getErrorMessage(err));
    });

    applyWSSHandler({
      wss,
      router: appRouter,
      createContext,
      keepAlive: {
        enabled: true,
        pingMs: 30_000,
        pongWaitMs: 5_000
      }
    });

    resolve(wss);
  });
};

export { createContext, createWsServer, getOnlineUserIds, getUserIp };
