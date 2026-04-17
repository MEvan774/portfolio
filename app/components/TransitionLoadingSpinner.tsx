// app/components/TransitionLoadingSpinner.tsx
"use client";

import { useTransition } from '../context/TransitionContext';
import styles from './TransitionLoadingSpinner.module.css';

/**
 * Loading spinner that appears during page transitions
 * - Desktop: Bottom right corner
 * - Mobile: Center of screen
 */
export default function TransitionLoadingSpinner() {
  const { isTransitioning } = useTransition();

  if (!isTransitioning) return null;

  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.wheel} />
      </div>
    </div>
  );
}