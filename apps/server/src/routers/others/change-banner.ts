import { FileSaveType } from '@sharkord/shared';
import z from 'zod';
import { removeFile } from '../../db/mutations/files';
import { updateSettings } from '../../db/mutations/server';
import { publishSettings } from '../../db/publishers';
import { getSettings } from '../../db/queries/server';
import { fileManager } from '../../utils/file-manager';
import { protectedProcedure } from '../../utils/trpc';

const changeBannerRoute = protectedProcedure
  .input(
    z.object({
      fileId: z.string().optional()
    })
  )
  .mutation(async ({ ctx, input }) => {
    const settings = await getSettings();

    if (
      input.fileId &&
      !fileManager.temporaryFileHasMimeType(input.fileId, 'image/')
    ) {
      throw new Error('Invalid file type. Please try again.');
    }

    const oldBannerId = settings.bannerId;
    let newBannerId: number | null = null;

    if (input.fileId) {
      const newFile = await fileManager.saveFile(
        input.fileId,
        ctx.userId,
        FileSaveType.SERVER_BANNER
      );

      newBannerId = newFile.id;
    }

    await updateSettings({
      bannerId: newBannerId
    });

    if (oldBannerId && oldBannerId !== newBannerId) {
      await removeFile(oldBannerId);
    }

    publishSettings();
  });

export { changeBannerRoute };
