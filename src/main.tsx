import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import App from './App.tsx';
import i18n from './i18n';
import './index.css';
import './styles.css';

// Initial Language Sync
const initialLang = localStorage.getItem('language') || localStorage.getItem('i18nextLng') || 'en';
document.documentElement.setAttribute('lang', initialLang.startsWith('my') ? 'my' : 'en');

createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);