import { useIntl } from 'react-intl';

import { ThemeToggle } from '@/components/ThemeToggle';

import type { TResolvedTheme } from '@/types';

interface IAppHeaderProps {
  resolvedTheme: TResolvedTheme;
}

export function AppHeader({ resolvedTheme }: IAppHeaderProps) {
  const { formatMessage } = useIntl();
  const markSrc = resolvedTheme === 'dark' ? `${import.meta.env.BASE_URL}mark-light.svg` : `${import.meta.env.BASE_URL}mark-dark.svg`;

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
        <img src={markSrc} alt="Chimes AI" className="h-8 w-auto" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-foreground">
            {formatMessage({ id: 'app.title' })}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {formatMessage({ id: 'app.subtitle' })}
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
