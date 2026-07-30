import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'metric' | 'table' | 'hero';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  if (variant === 'metric') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="cockpit-card h-28 animate-pulse bg-cockpit-surface-2/40 border border-cockpit-border/40 rounded-2xl p-5 flex flex-col justify-between">
            <div className="h-3 w-24 bg-cockpit-border/60 rounded" />
            <div className="h-7 w-32 bg-cockpit-border/80 rounded my-2" />
            <div className="h-2.5 w-16 bg-cockpit-border/40 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`cockpit-card h-64 animate-pulse bg-cockpit-surface-2/40 border border-cockpit-border/40 rounded-2xl p-6 flex flex-col justify-between ${className}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-cockpit-border/80 rounded" />
            <div className="h-3.5 w-32 bg-cockpit-border/50 rounded" />
          </div>
          <div className="w-12 h-12 rounded-full bg-cockpit-border/60" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-cockpit-border/30">
          <div className="h-10 bg-cockpit-border/50 rounded" />
          <div className="h-10 bg-cockpit-border/50 rounded" />
          <div className="h-10 bg-cockpit-border/50 rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`cockpit-card animate-pulse bg-cockpit-surface-2/40 border border-cockpit-border/40 rounded-2xl p-4 space-y-3 ${className}`}>
        <div className="h-8 bg-cockpit-border/60 rounded w-full mb-4" />
        {items.map((_, i) => (
          <div key={i} className="h-10 bg-cockpit-border/40 rounded w-full flex items-center justify-between px-4">
            <div className="h-3.5 w-24 bg-cockpit-border/60 rounded" />
            <div className="h-3.5 w-36 bg-cockpit-border/60 rounded" />
            <div className="h-3.5 w-16 bg-cockpit-border/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="cockpit-card h-44 animate-pulse bg-cockpit-surface-2/40 border border-cockpit-border/40 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="h-5 w-36 bg-cockpit-border/80 rounded" />
            <div className="h-4 w-16 bg-cockpit-border/60 rounded-full" />
          </div>
          <div className="space-y-2 my-4">
            <div className="h-3.5 w-full bg-cockpit-border/40 rounded" />
            <div className="h-3.5 w-3/4 bg-cockpit-border/40 rounded" />
          </div>
          <div className="h-3 w-28 bg-cockpit-border/50 rounded" />
        </div>
      ))}
    </div>
  );
}
