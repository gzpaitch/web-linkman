'use client';

import { useState, useEffect } from 'react';
import { SerperSearchForm, SerperPlacesResults, SerperSearchResults } from '@/components/features';
import { serperSearch } from '@/lib/api';
import { Badge, Button } from '@/components/ui';
import { X } from 'lucide-react';
import type { SerperSearchMode, SerperSearchParams, SerperPlacesResponse, SerperSearchResponse } from '@/types';

type SearchResult = {
  mode: SerperSearchMode;
  data: SerperPlacesResponse | SerperSearchResponse;
};

const STORAGE_KEY = 'serper-search-results';

export default function SerperPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  // Load results from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setResult(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save results to sessionStorage when they change
  useEffect(() => {
    if (result) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }
  }, [result]);

  const handleSearch = async (mode: SerperSearchMode, params: SerperSearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await serperSearch(mode, params);
      setResult({ mode, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const isPlacesResult = (r: SearchResult): r is { mode: 'places'; data: SerperPlacesResponse } => {
    return r.mode === 'places';
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SerperSearchForm onSubmit={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-zinc-500">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="truncate">Query: &quot;{result.data.searchParameters.q}&quot;</span>
              {result.data.searchParameters.location && (
                <Badge variant="secondary">{result.data.searchParameters.location}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 sm:ml-auto shrink-0">
              <span>Credits: {result.data.credits}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResults}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {isPlacesResult(result) ? (
            <SerperPlacesResults places={result.data.places} />
          ) : (
            <SerperSearchResults results={(result.data as SerperSearchResponse).organic} />
          )}
        </div>
      )}
    </div>
  );
}
