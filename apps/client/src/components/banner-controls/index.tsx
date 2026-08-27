import { useCurrentVoiceChannelId } from '@/features/server/channels/hooks';
import { PluginSlot } from '@sharkord/shared';
import { Button, Tooltip } from '@sharkord/ui';
import { PanelRight, PanelRightClose } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PluginSlotRenderer } from '../plugin-slot-renderer';
import { VoiceButtons } from '../top-bar/voice-buttons';

type TBannerControlsProps = {
  onToggleRightSidebar: () => void;
  isOpen: boolean;
};

const BannerControls = memo(
  ({ onToggleRightSidebar, isOpen }: TBannerControlsProps) => {
    const { t } = useTranslation('topbar');
    const currentVoiceChannelId = useCurrentVoiceChannelId();

    return (
      <div className="absolute right-3 bottom-2 z-40 hidden items-center justify-end gap-1.5 rounded-xl border border-border/60 bg-background/75 p-1.5 shadow-sm backdrop-blur-md lg:flex [&_button]:inline-flex [&_button]:h-8 [&_button]:w-8 [&_button]:shrink-0 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-md [&_button]:p-0">
        <PluginSlotRenderer slotId={PluginSlot.TOPBAR_RIGHT} />

        {currentVoiceChannelId && (
          <VoiceButtons currentVoiceChannelId={currentVoiceChannelId} />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleRightSidebar}
          className="h-8 w-8 p-0"
        >
          {isOpen ? (
            <Tooltip content={t('closeMembersSidebar')} side="bottom">
              <div>
                <PanelRightClose className="h-4 w-4" />
              </div>
            </Tooltip>
          ) : (
            <Tooltip content={t('openMembersSidebar')} side="bottom">
              <div>
                <PanelRight className="h-4 w-4" />
              </div>
            </Tooltip>
          )}
        </Button>
      </div>
    );
  }
);

export { BannerControls };
