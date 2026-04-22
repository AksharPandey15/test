import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Only load ResizeObserver polyfill if needed
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  import('resize-observer-polyfill').then((Polyfill) => {
    window.ResizeObserver = Polyfill.default;
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
