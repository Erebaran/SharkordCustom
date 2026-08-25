import { Permission } from '@sharkord/shared';
import { z } from 'zod';
import { VoiceRuntime } from '../../runtimes/voice';
import { invariant } from '../../utils/invariant';
import { protectedProcedure } from '../../utils/trpc';

const setServerMuteRoute = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
      muted: z.boolean()
    })
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.needsPermission(Permission.MANAGE_USERS);

    invariant(input.userId !== ctx.user.id, {
      code: 'BAD_REQUEST',
      message: 'Use the normal mute action for yourself'
    });

    const runtime = VoiceRuntime.findRuntimeByUserId(input.userId);

    invariant(runtime, {
      code: 'NOT_FOUND',
      message: 'User is not in a voice channel'
    });

    await runtime.setServerMute(input.userId, input.muted);

    return {
      success: true,
      userId: input.userId,
      muted: runtime.isServerMuted(input.userId)
    };
  });

export { setServerMuteRoute };
