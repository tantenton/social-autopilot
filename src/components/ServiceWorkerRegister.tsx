'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {
        // Silent fail
      });
  }, []);

  return null;
}
