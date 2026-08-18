import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n';
import './index.css';
import './styles.css';

document.documentElement.lang = localStorage.getItem('language') === 'my' ? 'my' : 'en';

createRoot(document.getElementById('root')!).render(
  <App />
);
