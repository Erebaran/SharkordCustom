import { ImagePicker } from '@/components/image-picker';
import { usePublicServerSettings } from '@/features/server/hooks';
import { uploadImage } from '@/helpers/upload-file';
import { useFilePicker } from '@/hooks/use-file-picker';
import { getTRPCClient } from '@/lib/trpc';
import { Group } from '@sharkord/ui';
import { memo, useCallback } from 'react';
import { toast } from 'sonner';

type TBannerManagerProps = {
  refetch: () => Promise<void>;
};

const BannerManager = memo(({ refetch }: TBannerManagerProps) => {
  const openFilePicker = useFilePicker();
  const publicSettings = usePublicServerSettings();
  const banner = publicSettings?.banner ?? null;

  const removeBanner = useCallback(async () => {
    const trpc = getTRPCClient();

    try {
      await trpc.others.changeBanner.mutate({
        fileId: undefined
      });

      await refetch();

      toast.success('Banner removed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Could not remove banner. Please try again.');
    }
  }, [refetch]);

  const onBannerClick = useCallback(async () => {
    const trpc = getTRPCClient();

    try {
      const [file] = await openFilePicker('image/*');

      if (!file) {
        return;
      }

      const temporaryFile = await uploadImage(file);

      if (!temporaryFile) {
        return;
      }

      await trpc.others.changeBanner.mutate({
        fileId: temporaryFile.id
      });

      await refetch();

      toast.success('Banner updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Could not update banner. Please try again.');
    }
  }, [openFilePicker, refetch]);

  return (
    <Group
      label="Banner"
      description="Wide image recommended. This banner is shown in the server header."
    >
      <ImagePicker
        image={banner}
        onImageClick={onBannerClick}
        onRemoveImageClick={removeBanner}
        className="aspect-[16/5] w-full max-w-xl object-cover"
      />
    </Group>
  );
});

export { BannerManager };