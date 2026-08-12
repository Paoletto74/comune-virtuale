import { useEffect, useState } from 'react';

const INSTALL_DISMISSED_KEY = 'cv-pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    function onBeforeInstall(e: BeforeInstallPromptEvent) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  }

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="installPrompt" role="region" aria-label="Installa app">
      <p className="installPromptText">Installa Comune Virtuale per un accesso rapido.</p>
      <div className="installPromptActions">
        <button type="button" className="installPromptInstall" onClick={() => void handleInstall()}>
          Installa
        </button>
        <button type="button" className="installPromptDismiss" onClick={handleDismiss}>
          Non ora
        </button>
      </div>
    </div>
  );
}
