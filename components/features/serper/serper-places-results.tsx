'use client';

import type { SerperPlace } from '@/types';
import { sendLinkPlacesWebhook } from '@/lib/api';
import { useBookmarks } from '@/hooks';
import { Button } from '@/components/ui';
import { MapPin, Phone, Star, ExternalLink, Copy, Check, Send, Loader2, Bookmark } from 'lucide-react';
import { useState } from 'react';

interface SerperPlacesResultsProps {
  places: SerperPlace[];
}

interface PlaceCardProps {
  place: SerperPlace;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

function PlaceCard({ place, isBookmarked, onToggleBookmark }: PlaceCardProps) {
  const hasWebsite = !!place.website;
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
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-base sm:text-lg wrap-break-word">
            {place.title}
          </h3>
          {place.category && (
            <span className="text-sm text-zinc-400">{place.category}</span>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-400 wrap-break-word min-w-0 text-sm sm:text-base">{place.address}</span>
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

        {/* Website Link */}
        {hasWebsite && (
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
            onClick={onToggleBookmark}
            variant={isBookmarked ? 'default' : 'secondary'}
            size="lg"
            className="w-full sm:flex-1"
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>

          <Button
            onClick={sendToWebhook}
            disabled={webhookState === 'loading'}
            variant="secondary"
            size="lg"
            className={`w-full sm:flex-1 ${
              webhookState === 'success'
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

export function SerperPlacesResults({ places }: SerperPlacesResultsProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const withWebsite = places.filter(p => p.website);
  const withoutWebsite = places.filter(p => !p.website);

  return (
    <div className="space-y-6 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100 text-lg">
          Places
        </h2>
        <span className="text-sm text-zinc-500">
          {places.length} results {withWebsite.length > 0 && `· ${withWebsite.length} with website`}
        </span>
      </div>

      {withWebsite.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            With Website
          </h3>
          <div className="grid gap-4">
            {withWebsite.map((place) => (
              <PlaceCard
                key={place.cid}
                place={place}
                isBookmarked={isBookmarked(place.cid)}
                onToggleBookmark={() => toggleBookmark(place)}
              />
            ))}
          </div>
        </div>
      )}

      {withoutWebsite.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            Without Website
          </h3>
          <div className="grid gap-4 opacity-40">
            {withoutWebsite.map((place) => (
              <PlaceCard
                key={place.cid}
                place={place}
                isBookmarked={isBookmarked(place.cid)}
                onToggleBookmark={() => toggleBookmark(place)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
