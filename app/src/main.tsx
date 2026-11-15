import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { DEFAULT_LOCALE, MESSAGES, resolveLocale } from '@/locales';

import { App } from './App';
import './index.css';

const locale = resolveLocale(navigator.languages);
document.documentElement.lang = locale;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={MESSAGES[locale]}>
      <App />
    </IntlProvider>
  </StrictMode>
);
