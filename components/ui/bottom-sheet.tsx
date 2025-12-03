'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);
    const isDragging = useRef<boolean>(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;

        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        if (diff > 0 && sheetRef.current) {
            const resistance = 1 - Math.min(diff / 500, 0.5);
            sheetRef.current.style.transform = `translateY(${diff * resistance}px)`;
            sheetRef.current.style.transition = 'none';
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;

        const diff = currentY.current - startY.current;

        if (sheetRef.current) {
            sheetRef.current.style.transition = '';
        }

        if (diff > 120) {
            onClose();
        } else if (sheetRef.current) {
            sheetRef.current.style.transform = '';
        }

        isDragging.current = false;
    };

    if (!isMounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-all duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out',
                    isOpen ? 'translate-y-0' : 'translate-y-full'
                )}
                style={{
                    maxHeight: '85vh',
                    paddingBottom: 'env(safe-area-inset-bottom)'
                }}
            >
                {/* Drag Handle */}
                <div
                    className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-all active:w-16 active:bg-zinc-400 dark:active:bg-zinc-600" />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}
