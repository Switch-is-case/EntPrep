"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the app is currently running as a standalone PWA.
 * Also checks localStorage to persist the status if detected once.
 */
export function useIsPWAInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      // 1. Check matchMedia (Android/Desktop Chrome)
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      
      // 2. Check navigator.standalone (iOS Safari)
      const isIOSStandalone = (navigator as any).standalone === true;
      
      // 3. Check localStorage (as a fallback or persistent flag)
      const wasInstalled = localStorage.getItem("pwa-installed") === "true";

      const currentStatus = isStandalone || isIOSStandalone || wasInstalled;
      
      if (currentStatus) {
        setIsInstalled(true);
        localStorage.setItem("pwa-installed", "true");
      }
    };

    checkStatus();
    
    // Listen for changes (e.g. if user installs while app is open)
    window.matchMedia("(display-mode: standalone)").addEventListener("change", (e) => {
      if (e.matches) {
        setIsInstalled(true);
        localStorage.setItem("pwa-installed", "true");
      }
    });
  }, []);

  return isInstalled;
}
