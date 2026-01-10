'use client';
import { useEffect } from 'react';

export const SWProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SCORM Service Worker registered', reg))
        .catch((err) => console.error('SCORM Service Worker registration failed', err));
    }
  }, []);

  return <>{children}</>;
};
