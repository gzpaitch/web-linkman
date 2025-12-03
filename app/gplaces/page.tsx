'use client';

import { useState } from 'react';
import { GPlacesSearchForm, GPlacesResults, GPlacesDetailsView } from '@/components/features';
import { searchGooglePlaces, getPlaceDetails } from '@/lib/api';
import type { GPlacesSearchCandidate, GPlacesDetails } from '@/types';

type ViewState = 
  | { type: 'search' }
  | { type: 'results'; results: GPlacesSearchCandidate[]; query: string }
  | { type: 'details'; place: GPlacesDetails };

export default function GPlacesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>({ type: 'search' });

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchGooglePlaces(query);
      setView({ type: 'results', results, query });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = async (placeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const place = await getPlaceDetails(placeId);
      setView({ type: 'details', place });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load place details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (view.type === 'details') {
      setView({ type: 'search' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {view.type !== 'details' && (
        <GPlacesSearchForm onSubmit={handleSearch} isLoading={isLoading} />
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && view.type !== 'details' && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
        </div>
      )}

      {!isLoading && view.type === 'results' && view.results.length > 0 && (
        <GPlacesResults results={view.results} onSelectPlace={handleSelectPlace} />
      )}

      {!isLoading && view.type === 'results' && view.results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">No places found for &quot;{view.query}&quot;</p>
        </div>
      )}

      {view.type === 'details' && (
        <GPlacesDetailsView place={view.place} onBack={handleBack} />
      )}
    </div>
  );
}
