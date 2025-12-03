'use client';

import { useState } from 'react';
import type { GPlacesSearchCandidate } from '@/types';
import { MapPin, ChevronRight } from 'lucide-react';

interface GPlacesResultsProps {
  results: GPlacesSearchCandidate[];
  onSelectPlace: (placeId: string) => void;
}

function PlaceCard({ place, onSelect }: { place: GPlacesSearchCandidate; onSelect: () => void }) {
  const [imgError, setImgError] = useState(false);

  const typeLabel = place.types?.[0]?.replace(/_/g, ' ') || 'Place';

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="shrink-0">
          {place.image && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={place.image}
              alt={place.name}
              className="h-20 w-20 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-zinc-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
            {place.name}
          </h3>
          <p className="text-sm text-zinc-500 mb-2 line-clamp-2">
            {place.formatted_address}
          </p>
          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
            {typeLabel}
          </span>
        </div>

        {/* Arrow */}
        <div className="shrink-0 flex items-center">
          <ChevronRight className="h-5 w-5 text-zinc-400" />
        </div>
      </div>
    </button>
  );
}

export function GPlacesResults({ results, onSelectPlace }: GPlacesResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
          Results
        </h2>
        <span className="text-sm text-zinc-500">
          {results.length} places found
        </span>
      </div>

      <div className="grid gap-3">
        {results.map((place) => (
          <PlaceCard
            key={place.place_id}
            place={place}
            onSelect={() => onSelectPlace(place.place_id)}
          />
        ))}
      </div>
    </div>
  );
}
