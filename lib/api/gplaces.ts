import type { GPlacesSearchCandidate, GPlacesDetails } from '@/types';

export async function searchGooglePlaces(query: string): Promise<GPlacesSearchCandidate[]> {
  const response = await fetch(`/api/gplaces/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates || [];
}

export async function getPlaceDetails(placeId: string): Promise<GPlacesDetails> {
  const response = await fetch(`/api/gplaces/details?id=${encodeURIComponent(placeId)}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get details: ${response.status}`);
  }

  return response.json();
}

export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `/api/gplaces/photo?ref=${photoReference}&maxwidth=${maxWidth}`;
}
