import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, variant = 'default' }) {
  const variants = {
    default: 'bg-card border border-border',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success/10 border border-success/20',
    warning: 'bg-warning/10 border border-warning/20',
    destructive: 'bg-destructive/10 border border-destructive/20',
  };

  return (
    <div className={cn('rounded-xl p-5 transition-all duration-300 hover:shadow-lg', variants[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-xs font-medium uppercase tracking-wider',
            variant === 'primary' ? 'text-primary-foreground/70' :
            variant === 'accent' ? 'text-accent-foreground/70' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend !== undefined && (
            <p className={cn('text-xs mt-2 font-medium',
              trend >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center',
            variant === 'primary' ? 'bg-primary-foreground/10' :
            variant === 'accent' ? 'bg-accent-foreground/10' : 'bg-muted'
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}