import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/cairo/200.css';
import '@fontsource/cairo/300.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import '@fontsource-variable/cairo';
import { App } from './App';
import './index.css';

// Safe Storage Polyfill for iframe environment compatibility
(() => {
  const setupPolyfill = (storageName: 'localStorage' | 'sessionStorage') => {
    try {
      const testKey = '__storage_test__';
      window[storageName].setItem(testKey, testKey);
      window[storageName].removeItem(testKey);
    } catch {
      const memoryStorage: Record<string, string> = {};
      const safeStorage: Storage = {
        getItem: (key: string) => (key in memoryStorage ? memoryStorage[key] : null),
        setItem: (key: string, value: string) => { memoryStorage[key] = String(value); },
        removeItem: (key: string) => { delete memoryStorage[key]; },
        clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); },
        get length() { return Object.keys(memoryStorage).length; },
        key: (index: number) => Object.keys(memoryStorage)[index] || null,
      };

      try {
        Object.defineProperty(window, storageName, {
          value: safeStorage,
          configurable: true,
          writable: true,
        });
      } catch {
        try {
          Object.defineProperty(Object.getPrototypeOf(window), storageName, {
            get: () => safeStorage,
            configurable: true,
          });
        } catch {
          // Ignore if cannot be redefined
        }
      }
    }
  };

  setupPolyfill('localStorage');
  setupPolyfill('sessionStorage');
})();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
