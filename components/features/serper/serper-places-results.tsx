'use client';

import type { SerperPlace } from '@/types';
import { sendLinkPlacesWebhook } from '@/lib/api';
import { MapPin, Phone, Star, ExternalLink, Copy, Check, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SerperPlacesResultsProps {
  places: SerperPlace[];
}

function PlaceCard({ place }: { place: SerperPlace }) {
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
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="p-5">
        {/* Title & Category */}
        <div className="mb-4">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-base">
            {place.title}
          </h3>
          {place.category && (
            <span className="text-sm text-zinc-400">{place.category}</span>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-2 mb-5">
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-400">{place.address}</span>
          </div>
          
          {place.phoneNumber && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-400">{place.phoneNumber}</span>
            </div>
          )}
          
          {place.rating && (
            <div className="flex items-center gap-3 text-sm">
              <Star className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-400">
                {place.rating} {place.ratingCount && `(${place.ratingCount} reviews)`}
              </span>
            </div>
          )}
        </div>

        {/* Website Link */}
        {hasWebsite && (
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:underline text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate">{place.website}</span>
            </a>
            <button
              onClick={() => copyToClipboard(place.website!)}
              className="shrink-0 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Send to Webhook Button */}
        <button
          onClick={sendToWebhook}
          disabled={webhookState === 'loading'}
          className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            webhookState === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : webhookState === 'error'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          } disabled:opacity-50`}
        >
          {webhookState === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : webhookState === 'success' ? (
            <>
              <Check className="h-4 w-4" />
              Sent!
            </>
          ) : webhookState === 'error' ? (
            <>
              Error - Try again
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to Webhook
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function SerperPlacesResults({ places }: SerperPlacesResultsProps) {
  const withWebsite = places.filter(p => p.website);
  const withoutWebsite = places.filter(p => !p.website);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
          Places
        </h2>
        <span className="text-sm text-zinc-500">
          {places.length} results {withWebsite.length > 0 && `· ${withWebsite.length} with website`}
        </span>
      </div>

      {withWebsite.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            With Website
          </h3>
          <div className="grid gap-4">
            {withWebsite.map((place) => (
              <PlaceCard key={place.cid} place={place} />
            ))}
          </div>
        </div>
      )}

      {withoutWebsite.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Without Website
          </h3>
          <div className="grid gap-4 opacity-40">
            {withoutWebsite.map((place) => (
              <PlaceCard key={place.cid} place={place} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
