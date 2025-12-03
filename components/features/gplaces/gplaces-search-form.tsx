'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

interface GPlacesSearchFormProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

export function GPlacesSearchForm({ onSubmit, isLoading }: GPlacesSearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query.trim());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Places</CardTitle>
        <CardDescription>
          Search for places using Google Places API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Search Query
            </label>
            <Input
              placeholder="e.g., Barber Shop Berlin, Restaurant NYC"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Search Places
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
