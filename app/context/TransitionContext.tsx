// app/context/TransitionContext.tsx - FIXED TIMING
"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface TransitionConfig {
  dotColor?: [number, number, number];
  spacing?: number;
  dotSize?: number;
  speed?: number;
}

interface TransitionContextType {
  isTransitioning: boolean;
  config: TransitionConfig;
  transitionTo: (path: string, config?: TransitionConfig) => Promise<void>;
  startTransition: () => void;
  endTransition: () => void;
  notifyPageLoaded: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

interface TransitionProviderProps {
  children: ReactNode;
  defaultConfig?: TransitionConfig;
}

export function TransitionProvider({ children, defaultConfig = {} }: TransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [config, setConfig] = useState<TransitionConfig>(defaultConfig);
  const router = useRouter();
  const pathname = usePathname();
  const isNavigatingRef = useRef(false);
  const pageLoadedRef = useRef(false);
  const resolveTransitionRef = useRef<(() => void) | null>(null);

  // Reset page loaded state when route changes
  useEffect(() => {
    pageLoadedRef.current = false;
  }, [pathname]);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const notifyPageLoaded = useCallback(() => {
    console.log('📦 Page loaded, ready to transition out');
    pageLoadedRef.current = true;
    
    if (resolveTransitionRef.current) {
      resolveTransitionRef.current();
      resolveTransitionRef.current = null;
    }
  }, []);

  const transitionTo = useCallback(
    async (path: string, transitionConfig?: TransitionConfig): Promise<void> => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      // Update config if provided
      if (transitionConfig) {
        setConfig({ ...defaultConfig, ...transitionConfig });
      }

      const speed = transitionConfig?.speed || defaultConfig.speed || 600;

      console.log('🎬 Starting transition to:', path);

      // PHASE 1: Transition IN (dots appear and FULLY cover screen)
      setIsTransitioning(true);
      console.log('🔵 Transition IN starting...');

      // Wait for FULL transition in animation to complete
      await new Promise(resolve => setTimeout(resolve, speed));

      console.log('⚫ Screen fully covered, now navigating...');

      // PHASE 2: Navigate (screen is completely covered)
      router.push(path);

      // Small delay for Next.js to start the navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('⏳ Waiting for new page to load...');

      // PHASE 3: Wait for page to signal it's ready OR timeout
      await new Promise<void>(resolve => {
        resolveTransitionRef.current = resolve;

        const timeoutId = setTimeout(() => {
          console.log('⏰ Timeout - transitioning out anyway');
          resolve();
        }, 3000);

        // If page is already loaded, resolve immediately
        if (pageLoadedRef.current) {
          console.log('✅ Page already loaded');
          clearTimeout(timeoutId);
          resolve();
        }

        const originalResolve = resolve;
        resolveTransitionRef.current = () => {
          clearTimeout(timeoutId);
          originalResolve();
        };
      });

      console.log('🎭 Page ready, starting transition OUT...');

      // Small delay before starting transition out
      await new Promise(resolve => setTimeout(resolve, 50));

      // PHASE 4: Transition OUT (dots disappear, revealing page)
      // Note: isTransitioning is still true, canvas will animate from 1 to 0
      console.log('🔴 Transition OUT starting...');

      // Wait for transition out animation
      await new Promise(resolve => setTimeout(resolve, speed));

      console.log('✨ Transition complete!');

      // PHASE 5: Clean up
      setIsTransitioning(false);
      isNavigatingRef.current = false;
      pageLoadedRef.current = false;
    },
    [router, defaultConfig]
  );

  return (
    <TransitionContext.Provider
      value={{
        isTransitioning,
        config,
        transitionTo,
        startTransition,
        endTransition,
        notifyPageLoaded,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return context;
}