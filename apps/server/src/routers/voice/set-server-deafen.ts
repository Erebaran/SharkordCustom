import { Permission } from '@sharkord/shared';
import { z } from 'zod';
import { VoiceRuntime } from '../../runtimes/voice';
import { invariant } from '../../utils/invariant';
import { protectedProcedure } from '../../utils/trpc';

const setServerDeafenRoute = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
      deafened: z.boolean()
    })
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.needsPermission(Permission.MANAGE_USERS);

    invariant(input.userId !== ctx.user.id, {
      code: 'BAD_REQUEST',
      message: 'Use the normal sound mute action for yourself'
    });

    const runtime = VoiceRuntime.findRuntimeByUserId(input.userId);

    invariant(runtime, {
      code: 'NOT_FOUND',
      message: 'User is not in a voice channel'
    });

    await runtime.setServerDeafen(input.userId, input.deafened);

    return {
      success: true,
      userId: input.userId,
      deafened: runtime.isServerDeafened(input.userId)
    };
  });

export { setServerDeafenRoute };
