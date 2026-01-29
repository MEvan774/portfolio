// app/hooks/usePageLoaded.ts
"use client";

import { useEffect } from 'react';
import { useTransition } from '../context/TransitionContext';

/**
 * Custom hook that notifies the transition system when a page is fully loaded
 * 
 * Usage in your page components:
 * 
 * // Simple usage - notifies immediately when component mounts
 * usePageLoaded();
 * 
 * // With async data - notifies when data is ready
 * usePageLoaded(isDataLoaded);
 * 
 * // Manual control
 * const { notifyLoaded } = usePageLoaded(false);
 * // Later, when ready:
 * notifyLoaded();
 */
export function usePageLoaded(isLoaded: boolean = true) {
  const { notifyPageLoaded } = useTransition();

  useEffect(() => {
    if (isLoaded) {
      console.log('✅ usePageLoaded: Page is ready');
      notifyPageLoaded();
    }
  }, [isLoaded, notifyPageLoaded]);

  return {
    notifyLoaded: notifyPageLoaded
  };
}

/**
 * Alternative: Automatic hook that waits for document ready
 * Use this if you don't have specific async data to wait for
 */
export function usePageLoadedAuto() {
  const { notifyPageLoaded } = useTransition();

  useEffect(() => {
    // Wait for all images and resources to load
    if (document.readyState === 'complete') {
      console.log('✅ usePageLoadedAuto: Document already complete');
      notifyPageLoaded();
    } else {
      const handleLoad = () => {
        console.log('✅ usePageLoadedAuto: Document loaded');
        notifyPageLoaded();
      };

      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [notifyPageLoaded]);
}