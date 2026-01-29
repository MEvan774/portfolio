// app/context/TransitionContext.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  const isNavigatingRef = useRef(false);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const transitionTo = useCallback(
    async (path: string, transitionConfig?: TransitionConfig): Promise<void> => {
      // Prevent multiple simultaneous transitions
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      // Update config if provided
      if (transitionConfig) {
        setConfig({ ...defaultConfig, ...transitionConfig });
      }

      // Start transition
      setIsTransitioning(true);

      // Wait for transition in (dots appear)
      await new Promise(resolve => setTimeout(resolve, 600));

      // Navigate to new page
      router.push(path);

      // Wait a bit for Next.js to render new page
      await new Promise(resolve => setTimeout(resolve, 100));

      // Wait for transition out (dots disappear)
      await new Promise(resolve => setTimeout(resolve, 600));

      // End transition
      setIsTransitioning(false);
      isNavigatingRef.current = false;
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