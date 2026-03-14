import { useState, useEffect } from 'react';

/**
 * usePWAInstall
 * Returns { canInstall, install, isInstalled }
 *
 * canInstall  — true when the browser has fired beforeinstallprompt
 * install()   — triggers the native install dialog
 * isInstalled — true if already running in standalone/PWA mode
 */
export function usePWAInstall() {
  const [prompt,      setPrompt]      = useState(null);
  const [canInstall,  setCanInstall]  = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed / running standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      setPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setPrompt(null);
    }
  };

  return { canInstall, install, isInstalled };
}