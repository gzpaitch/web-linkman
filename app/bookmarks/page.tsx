'use client';

import { useBookmarks } from '@/hooks';
import { sendLinkPlacesWebhook } from '@/lib/api';
import { Button } from '@/components/ui';
import { MapPin, Phone, Star, ExternalLink, Copy, Check, Send, Loader2, Bookmark, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { SerperPlace } from '@/types';

function BookmarkCard({
  place,
  onRemove
}: {
  place: SerperPlace;
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [webhookState, setWebhookState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToWebhook = async () => {
    setWebhookState('loading');

    const result = await sendLinkPlacesWebhook({
      cid: place.cid,
      title: place.title,
      address: place.address,
      category: place.category,
      phoneNumber: place.phoneNumber,
      website: place.website,
      rating: place.rating,
      ratingCount: place.ratingCount,
      latitude: place.latitude,
      longitude: place.longitude,
    });

    if (result.success) {
      setWebhookState('success');
      setTimeout(() => setWebhookState('idle'), 2000);
    } else {
      setWebhookState('error');
      setTimeout(() => setWebhookState('idle'), 3000);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Title & Category */}
        <div className="mb-4 min-w-0">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-base sm:text-lg break-words">
            {place.title}
          </h3>
          {place.category && (
            <span className="text-sm text-zinc-400">{place.category}</span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base break-words min-w-0">{place.address}</span>
          </div>

          {place.phoneNumber && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">{place.phoneNumber}</span>
            </div>
          )}

          {place.rating && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Star className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
                {place.rating} {place.ratingCount && `(${place.ratingCount} reviews)`}
              </span>
            </div>
          )}
        </div>

        {/* Website */}
        {place.website && (
          <div className="flex items-center gap-2 sm:gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 min-w-0">
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:underline text-sm sm:text-base font-medium overflow-hidden"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate">{place.website}</span>
            </a>
            <button
              onClick={() => copyToClipboard(place.website!)}
              className="shrink-0 p-1.5 sm:p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={onRemove}
            variant="destructive"
            size="lg"
            className="w-full sm:flex-1 !bg-red-100 !text-red-600 hover:!bg-red-200 dark:!bg-red-900/20 dark:!text-red-400 dark:hover:!bg-red-900/30"
          >
            <Trash2 className="h-5 w-5" />
            Remove
          </Button>

          <Button
            onClick={sendToWebhook}
            disabled={webhookState === 'loading'}
            variant="secondary"
            size="lg"
            className={`w-full sm:flex-1 ${webhookState === 'success'
                ? '!bg-green-100 !text-green-700 dark:!bg-green-900/30 dark:!text-green-400'
                : webhookState === 'error'
                  ? '!bg-red-100 !text-red-700 dark:!bg-red-900/30 dark:!text-red-400'
                  : ''
              }`}
          >
            {webhookState === 'loading' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : webhookState === 'success' ? (
              <>
                <Check className="h-5 w-5" />
                Sent!
              </>
            ) : webhookState === 'error' ? (
              'Error'
            ) : (
              <>
                <Send className="h-5 w-5" />
                Webhook
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const { bookmarks, isLoaded, removeBookmark, clearBookmarks } = useBookmarks();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Bookmarks
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1">
            {bookmarks.length} saved place{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Button
            onClick={clearBookmarks}
            variant="ghost"
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-sm sm:text-base text-zinc-500">
            Save places from search results to view them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((place) => (
            <BookmarkCard
              key={place.cid}
              place={place}
              onRemove={() => removeBookmark(place.cid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
