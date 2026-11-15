import { Toaster } from '@/components/ui/sonner';
import { AppHeader } from '@/components/AppHeader';
import { HeicConverter } from '@/components/HeicConverter';
import { useResolvedTheme } from '@/hooks';

export function App() {
  const resolvedTheme = useResolvedTheme();

  return (
    <div className="min-h-svh bg-background">
      <AppHeader resolvedTheme={resolvedTheme} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <HeicConverter />
      </main>
      <Toaster position="bottom-right" theme={resolvedTheme} />
    </div>
  );
}
