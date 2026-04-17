// app/components/PageReadyNotifier.tsx
"use client";

import { useEffect } from 'react';
import { useTransition } from '../context/TransitionContext';

/**
 * Simple client component that notifies the transition system when the page is ready
 * 
 * Usage: Add this to any server component page:
 * 
 * export default async function MyPage() {
 *   // ... your server logic ...
 *   
 *   return (
 *     <>
 *       <PageReadyNotifier />
 *       <main>
 *         {/* your content *\/}
 *       </main>
 *     </>
 *   );
 * }
 */
export default function PageReadyNotifier() {
  const { notifyPageLoaded } = useTransition();

  useEffect(() => {
    // Small delay to ensure DOM is fully painted
    const timer = setTimeout(() => {
      console.log('✅ Page ready - notifying transition system');
      notifyPageLoaded();
    }, 100); // 100ms delay for DOM to settle

    return () => clearTimeout(timer);
  }, [notifyPageLoaded]);

  // This component renders nothing - it's invisible
  return null;
}