import {
  ActivityLogType,
  DisconnectCode,
  Permission,
  ServerEvents
} from '@sharkord/shared';
import z from 'zod';
import { enqueueActivityLog } from '../../queues/activity-log';
import { VoiceRuntime } from '../../runtimes/voice';
import { invariant } from '../../utils/invariant';
import { protectedProcedure } from '../../utils/trpc';

const kickRoute = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
      reason: z.string().optional()
    })
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.needsPermission(Permission.MANAGE_USERS);

    invariant(input.userId !== ctx.user.id, {
      code: 'BAD_REQUEST',
      message: 'You cannot kick yourself'
    });

    const userWs = ctx.getUserWs(input.userId);

    invariant(userWs, {
      code: 'NOT_FOUND',
      message: 'User is not connected'
    });

    /*
     * Remove the user from voice before closing the WebSocket.
     * This guarantees the sidebar/runtime is cleaned immediately,
     * instead of depending only on the asynchronous WS close handler.
     */
    const voiceRuntime = VoiceRuntime.findRuntimeByUserId(input.userId);

    if (voiceRuntime) {
      const channelId = voiceRuntime.id;

      voiceRuntime.removeUser(input.userId);

      ctx.pubsub.publish(ServerEvents.USER_LEAVE_VOICE, {
        channelId,
        userId: input.userId
      });
    }

    userWs.close(DisconnectCode.KICKED, input.reason);

    enqueueActivityLog({
      type: ActivityLogType.USER_KICKED,
      userId: input.userId,
      details: {
        reason: input.reason,
        kickedBy: ctx.userId
      }
    });
  });

export { kickRoute };
