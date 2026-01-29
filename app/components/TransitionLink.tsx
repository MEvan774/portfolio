// app/components/TransitionLink.tsx
"use client";

import { ReactNode, MouseEvent } from 'react';
import { useTransition } from '../context/TransitionContext';

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  dotColor?: [number, number, number];
  spacing?: number;
  dotSize?: number;
  speed?: number;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/**
 * Drop-in replacement for Next.js Link component with page transitions
 * Use this anywhere you want a smooth transition when navigating
 */
export default function TransitionLink({
  href,
  children,
  className = '',
  dotColor,
  spacing,
  dotSize,
  speed,
  onClick,
  style,
  ariaLabel,
}: TransitionLinkProps) {
  const { transitionTo } = useTransition();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Call custom onClick if provided
    onClick?.(e);

    // Start transition and navigate
    await transitionTo(href, {
      dotColor,
      spacing,
      dotSize,
      speed,
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}