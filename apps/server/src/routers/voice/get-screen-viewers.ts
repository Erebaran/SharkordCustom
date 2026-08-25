import { Permission } from '@sharkord/shared';
import { invariant } from '../../utils/invariant';
import { protectedProcedure } from '../../utils/trpc';
import { getScreenViewers } from './screen-viewers';

const getScreenViewersRoute = protectedProcedure.query(async ({ ctx }) => {
  await ctx.needsPermission(Permission.JOIN_VOICE_CHANNELS);

  invariant(ctx.currentVoiceChannelId, {
    code: 'BAD_REQUEST',
    message: 'User is not in a voice channel'
  });

  return getScreenViewers(ctx.currentVoiceChannelId, ctx.user.id);
});

export { getScreenViewersRoute };
