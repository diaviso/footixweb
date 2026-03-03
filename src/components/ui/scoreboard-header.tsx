import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScoreboardHeaderProps {
  title: string;
  subtitle?: string;
  live?: boolean;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function ScoreboardHeader({
  title,
  subtitle,
  live,
  icon,
  rightContent,
  className,
}: ScoreboardHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-r from-[#0A1628] via-[#0D1D35] to-[#0A1628]',
        'dark:from-[#050810] dark:via-[#07090F] dark:to-[#050810]',
        'border border-[#1B2B40]',
        'px-6 py-4',
        className,
      )}
    >
      {/* Spotlight effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-[#E74C5E]/8 blur-2xl rounded-full" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Live dot */}
          {live && <div className="live-dot flex-shrink-0" />}

          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 text-[#E74C5E]">{icon}</div>
          )}

          {/* Text */}
          <div className="min-w-0">
            <h1 className="scoreboard-text text-xl sm:text-2xl font-black text-white truncate uppercase tracking-wider">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-white/40 mt-0.5 font-medium tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightContent && (
          <div className="flex-shrink-0">{rightContent}</div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E74C5E]/40 to-transparent" />
    </div>
  );
}
