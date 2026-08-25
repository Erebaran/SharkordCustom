import { Permission, ServerEvents } from '@sharkord/shared';
import { z } from 'zod';
import { logger } from '../../logger';
import { VoiceRuntime } from '../../runtimes/voice';
import { invariant } from '../../utils/invariant';
import { protectedProcedure } from '../../utils/trpc';

const disconnectVoiceUserRoute = protectedProcedure
  .input(
    z.object({
      userId: z.number()
    })
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.needsPermission(Permission.MANAGE_USERS);

    invariant(input.userId !== ctx.user.id, {
      code: 'BAD_REQUEST',
      message: 'Use the leave voice action to disconnect yourself'
    });

    const runtime = VoiceRuntime.findRuntimeByUserId(input.userId);

    invariant(runtime, {
      code: 'NOT_FOUND',
      message: 'User is not in a voice channel'
    });

    const channelId = runtime.id;
    const userInChannel = runtime.getUser(input.userId);

    invariant(userInChannel, {
      code: 'NOT_FOUND',
      message: 'User is not in a voice channel'
    });

    runtime.removeUser(input.userId);

    ctx.pubsub.publish(ServerEvents.USER_LEAVE_VOICE, {
      channelId,
      userId: input.userId
    });

    logger.info(
      'User %s disconnected user %s from voice channel %s',
      ctx.user.id,
      input.userId,
      channelId
    );

    return {
      success: true,
      channelId,
      userId: input.userId
    };
  });

export { disconnectVoiceUserRoute };
