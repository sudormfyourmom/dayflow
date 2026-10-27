import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'urgent' | 'high' | 'normal' | 'low' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-surface-elevated text-text-primary border border-border-subtle',
    secondary: 'bg-surface-hover text-text-secondary',
    outline: 'border border-border text-text-secondary',
    urgent: 'bg-status-danger/15 text-red-400 border border-status-danger/30',
    high: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    normal: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    low: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
    success: 'bg-status-success/15 text-emerald-400 border border-status-success/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
