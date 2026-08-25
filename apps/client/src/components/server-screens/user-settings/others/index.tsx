import { LanguageSwitcher } from '@/components/language-switcher';
import { setAutoJoinLastChannel } from '@/features/app/actions';
import { useAutoJoinLastChannel } from '@/features/app/hooks';
import {
  DEFAULT_COLOR,
  DEFAULT_SECOND_COLOR,
  getSharkordChromeColor,
  getSharkordChromeGradientEnabled,
  getSharkordChromeSecondColor,
  resetSharkordChromeColor,
  setSharkordChromeColor,
  setSharkordChromeGradientEnabled,
  setSharkordChromeSecondColor
} from '@/helpers/chrome-color';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Group,
  Switch
} from '@sharkord/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Others = memo(() => {
  const { t } = useTranslation('settings');
  const autoJoinLastChannel = useAutoJoinLastChannel();

  const [chromeColor, setChromeColor] = useState(getSharkordChromeColor());
  const [secondColor, setSecondColor] = useState(
    getSharkordChromeSecondColor()
  );
  const [gradientEnabled, setGradientEnabled] = useState(
    getSharkordChromeGradientEnabled()
  );

  const handleChromeColorChange = (value: string) => {
    setChromeColor(value);
    setSharkordChromeColor(value);
  };

  const handleSecondColorChange = (value: string) => {
    setSecondColor(value);
    setSharkordChromeSecondColor(value);
  };

  const handleGradientToggle = (enabled: boolean) => {
    setGradientEnabled(enabled);
    setSharkordChromeGradientEnabled(enabled);
  };

  const handleResetChromeColor = () => {
    resetSharkordChromeColor();
    setChromeColor(DEFAULT_COLOR);
    setSecondColor(DEFAULT_SECOND_COLOR);
    setGradientEnabled(false);
  };

  const previewBackground = gradientEnabled
    ? `linear-gradient(135deg, ${chromeColor}, ${secondColor})`
    : chromeColor;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('othersTitle')}</CardTitle>
          <CardDescription>{t('othersDesc')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Group
            label={t('autoJoinLastChannelLabel')}
            description={t('autoJoinLastChannelDesc')}
          >
            <Switch
              checked={autoJoinLastChannel}
              onCheckedChange={(value) => setAutoJoinLastChannel(value)}
            />
          </Group>

          <Group label={t('languageLabel')} description={t('languageDesc')}>
            <LanguageSwitcher />
          </Group>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência do aplicativo</CardTitle>
          <CardDescription>
            Personalize a barra superior e o dock de servidores com cor sólida
            ou gradiente.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Group
            label="Usar gradiente"
            description="Combina duas cores na Top Bar e no Dock."
          >
            <Switch
              checked={gradientEnabled}
              onCheckedChange={handleGradientToggle}
            />
          </Group>

          <Group
            label={gradientEnabled ? 'Primeira cor' : 'Cor da barra superior e do dock'}
            description="A alteração é aplicada imediatamente e fica salva neste dispositivo."
          >
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={chromeColor}
                onChange={(event) =>
                  handleChromeColorChange(event.target.value)
                }
                className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
                aria-label="Primeira cor"
              />
              <code className="min-w-[82px] text-sm text-muted-foreground">
                {chromeColor.toUpperCase()}
              </code>
            </div>
          </Group>

          {gradientEnabled && (
            <Group
              label="Segunda cor"
              description="Cor usada no outro extremo do gradiente."
            >
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondColor}
                  onChange={(event) =>
                    handleSecondColorChange(event.target.value)
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
                  aria-label="Segunda cor"
                />
                <code className="min-w-[82px] text-sm text-muted-foreground">
                  {secondColor.toUpperCase()}
                </code>
              </div>
            </Group>
          )}

          <div
            className="h-12 w-full rounded-lg border border-border"
            style={{ background: previewBackground }}
            aria-label="Prévia da aparência"
          />

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChromeColor}
            >
              Restaurar padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { Others };