import { Monitor, Moon, Sun } from 'lucide-react';
import { useIntl } from 'react-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store';

import type { LucideIcon } from 'lucide-react';
import type { TThemePreference } from '@/types';

const THEME_OPTIONS: ReadonlyArray<{ value: TThemePreference; icon: LucideIcon }> = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor }
];

export function ThemeToggle() {
  const { formatMessage } = useIntl();
  const preference = useThemeStore(state => state.preference);
  const setPreference = useThemeStore(state => state.setPreference);

  return (
    <div
      role="group"
      aria-label={formatMessage({ id: 'theme.toggle.label' })}
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
    >
      {THEME_OPTIONS.map(({ value, icon: Icon }) => {
        const isActive = preference === value;
        const label = formatMessage({ id: `theme.option.${value}` });
        return (
          <Button
            key={value}
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(isActive && 'bg-muted text-foreground')}
          >
            <Icon aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}
