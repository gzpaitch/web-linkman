'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import type { SerperSearchMode, SerperSearchParams } from '@/types';

interface SerperSearchFormProps {
  onSubmit: (mode: SerperSearchMode, params: SerperSearchParams) => void;
  isLoading?: boolean;
}

const SEARCH_MODES = [
  { value: 'places', label: 'Places (Google Maps)' },
  { value: 'search', label: 'Web Search' },
];

const COUNTRIES = [
  { value: '', label: 'Any Country' },
  { value: 'br', label: 'Brazil' },
  { value: 'us', label: 'United States' },
  { value: 'de', label: 'Germany' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'pt', label: 'Portugal' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'be', label: 'Belgium' },
  { value: 'at', label: 'Austria' },
  { value: 'ch', label: 'Switzerland' },
];

const LANGUAGES = [
  { value: '', label: 'Default' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
];

export function SerperSearchForm({ onSubmit, isLoading }: SerperSearchFormProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [mode, setMode] = useState<SerperSearchMode>('places');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const params: SerperSearchParams = {
      q: query.trim(),
      ...(location && { location }),
      ...(country && { gl: country }),
      ...(language && { hl: language }),
    };

    onSubmit(mode, params);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Search</CardTitle>
        <CardDescription>
          Search for places or web results using Serper.dev API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Search Query
            </label>
            <Input
              placeholder="e.g., Barber Linktree"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Search Mode
              </label>
              <Select
                value={mode}
                onChange={(val) => setMode(val as SerperSearchMode)}
                options={SEARCH_MODES}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Location <span className="text-xs font-normal text-zinc-400">(Optional)</span>
              </label>
              <Input
                placeholder="e.g., Germany, Berlin"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Country
              </label>
              <Select
                value={country}
                onChange={setCountry}
                options={COUNTRIES}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Language
              </label>
              <Select
                value={language}
                onChange={setLanguage}
                options={LANGUAGES}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
