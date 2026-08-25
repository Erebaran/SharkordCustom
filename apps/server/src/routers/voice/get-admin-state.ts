import { Permission } from '@sharkord/shared';
import { z } from 'zod';
import { VoiceRuntime } from '../../runtimes/voice';
import { protectedProcedure } from '../../utils/trpc';

const getAdminStateRoute = protectedProcedure
  .input(
    z.object({
      userId: z.number()
    })
  )
  .query(async ({ ctx, input }) => {
    await ctx.needsPermission(Permission.MANAGE_USERS);

    const runtime = VoiceRuntime.findRuntimeByUserId(input.userId);

    return {
      inVoice: Boolean(runtime),
      muted: runtime?.isServerMuted(input.userId) ?? false,
      deafened: runtime?.isServerDeafened(input.userId) ?? false
    };
  });

export { getAdminStateRoute };
