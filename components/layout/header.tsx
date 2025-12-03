'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Link2, Instagram, Search, MapPin, Bookmark, Menu } from 'lucide-react';
import { useApiState } from '@/hooks';
import { getHealth } from '@/lib/api';
import { BottomSheet } from '@/components/ui';

const NAV_ITEMS = [
  { href: '/', label: 'Scraper', icon: Link2 },
  { href: '/instagram', label: 'Instagram', icon: Instagram },
  { href: '/serper', label: 'Serper', icon: Search },
  { href: '/gplaces', label: 'GPlaces', icon: MapPin },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
];

function ApiStatusIndicator({ compact = false }: { compact?: boolean }) {
  const health = useApiState(getHealth);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      health.execute();
    }
  }, [health]);

  const isOnline = health.data?.status === 'healthy';
  const isOffline = health.error;

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium shrink-0",
      compact ? "px-2 py-1.5" : "px-3 py-1.5"
    )}>
      <span
        className={cn(
          'h-2 w-2 rounded-full shrink-0',
          health.isLoading && 'bg-zinc-400 animate-pulse',
          isOnline && 'bg-green-500',
          isOffline && 'bg-red-500'
        )}
      />
      {!compact && (
        <span className="text-zinc-600 dark:text-zinc-400">
          {health.isLoading ? 'Connecting...' : isOnline ? 'API Online' : 'API Offline'}
        </span>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group touch-manipulation"
          onClick={closeMenu}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-sm">
            <Link2 className="h-4 w-4 text-white dark:text-zinc-900" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                pathname === href
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop API Status */}
        <div className="hidden md:block">
          <ApiStatusIndicator />
        </div>

        {/* Mobile: API Status + Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ApiStatusIndicator compact />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:scale-95 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bottom Sheet */}
      <BottomSheet isOpen={mobileMenuOpen} onClose={closeMenu} title="Navigation">
        <nav className="px-4 py-6 space-y-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-medium transition-all duration-200 touch-manipulation',
                  isActive
                    ? 'bg-zinc-200 text-black dark:bg-zinc-100 dark:text-zinc-900 shadow-none'
                    : 'text-zinc-700 active:bg-zinc-100 active:scale-[0.98] dark:text-zinc-300 dark:active:bg-zinc-800'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: mobileMenuOpen ? 'slideInUp 300ms ease-out forwards' : 'none'
                }}
              >
                <div className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-white/20 dark:bg-zinc-900/20'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex-1">{label}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-zinc-200 dark:bg-zinc-800" />

        {/* API Status in Bottom Sheet */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              API Status
            </span>
            <ApiStatusIndicator />
          </div>
        </div>
      </BottomSheet>
    </header>
  );
}
