'use client';

import { useState } from 'react';
import type { GPlacesDetails } from '@/types';
import { getPhotoUrl } from '@/lib/api';
import { MapPin, Phone, Globe, Star, Clock, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';

interface GPlacesDetailsProps {
  place: GPlacesDetails;
  onBack: () => void;
}

export function GPlacesDetailsView({ place, onBack }: GPlacesDetailsProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [imgError, setImgError] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const mainPhoto = place.photos?.[0];
  const mainPhotoUrl = mainPhoto?.url || (mainPhoto ? getPhotoUrl(mainPhoto.reference, 800) : null);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      {/* Main Card */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Hero Image */}
        {mainPhotoUrl && !imgError && (
          <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainPhotoUrl}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {place.name}
            </h1>
            {place.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-zinc-400" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{place.rating}</span>
                {place.reviews && (
                  <span className="text-zinc-500">({place.reviews.length} reviews)</span>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
              <span className="text-zinc-600 dark:text-zinc-400">{place.address}</span>
            </div>

            {place.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-zinc-400 shrink-0" />
                <a
                  href={`tel:${place.phone}`}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {place.phone}
                </a>
              </div>
            )}

            {place.openingHours?.weekday_text && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {place.openingHours.weekday_text.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Website */}
          {place.website && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:underline font-medium"
              >
                <Globe className="h-5 w-5 text-zinc-400 shrink-0" />
                <span className="truncate">{place.website}</span>
                <ExternalLink className="h-4 w-4 text-zinc-400 shrink-0" />
              </a>
              <button
                onClick={() => copyToClipboard(place.website!)}
                className="shrink-0 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {place.reviews && place.reviews.length > 0 && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
              Reviews ({place.reviews.length})
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {place.reviews.slice(0, 5).map((review, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {review.author}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Star className="h-4 w-4" />
                    {review.rating}
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {place.photos && place.photos.length > 1 && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
              Photos ({place.photos.length})
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {place.photos.slice(1, 7).map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url || getPhotoUrl(photo.reference, 200)}
                    alt={`${place.name} photo ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
