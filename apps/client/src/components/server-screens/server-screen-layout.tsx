import '@/helpers/chrome-color';

import { Button } from '@sharkord/ui';
import { ChevronLeft } from 'lucide-react';
import { memo, type CSSProperties } from 'react';

type TServerScreenLayoutProps = {
  close: () => void;
  title: string;
  children: React.ReactNode;
};

const headerStyle = {
  WebkitAppRegion: 'drag',
  background:
    'var(--sharkord-chrome-background, var(--sharkord-chrome-color, hsl(var(--card))))'
} as CSSProperties;

const noDragStyle = {
  WebkitAppRegion: 'no-drag'
} as CSSProperties;

const ServerScreenLayout = memo(
  ({ close, title, children }: TServerScreenLayoutProps) => {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground dark">
        <div
          className="flex h-8 shrink-0 items-center gap-1.5 px-1.5"
          style={headerStyle}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Voltar"
            className="h-6 w-6 shrink-0 rounded-md p-0 text-foreground/80 hover:bg-white/10 hover:text-foreground"
            style={noDragStyle}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <h1 className="truncate text-sm font-semibold leading-none">
            {title}
          </h1>
        </div>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    );
  }
);

export { ServerScreenLayout };
