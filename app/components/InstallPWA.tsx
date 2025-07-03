"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
};

export const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isInStandalone, setIsInStandalone] = useState(false);

  useEffect(() => {
    setIsIOSDevice(isIOS());
    setIsInStandalone(isStandalone());

    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
    };
    
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS devices, show install instructions if not in standalone mode
    if (isIOS() && !isStandalone()) {
      setShowIOSInstructions(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  const onIOSInstructionsClick = () => {
    setShowIOSInstructions(!showIOSInstructions);
  };

  // Don't show anything if already installed (standalone mode)
  if (isInStandalone) {
    return null;
  }

  // Don't show anything if no PWA support and not iOS
  if (!supportsPWA && !isIOSDevice) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            📱
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Install App</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isIOSDevice ? "Add to Home Screen" : "Add to home screen"}
            </p>
          </div>
          {supportsPWA && !isIOSDevice ? (
            <button 
              onClick={onClick} 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
            >
              Install
            </button>
          ) : isIOSDevice ? (
            <button 
              onClick={onIOSInstructionsClick} 
              type="button"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
            >
              How?
            </button>
          ) : null}
        </div>
        
        {showIOSInstructions && isIOSDevice && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p className="font-semibold">To install this app on iOS:</p>
                             <div className="space-y-1">
                 <p>1. Tap the Share button <span className="inline-block">📤</span></p>
                 <p>2. Scroll down and tap &quot;Add to Home Screen&quot;</p>
                 <p>3. Tap &quot;Add&quot; to confirm</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
