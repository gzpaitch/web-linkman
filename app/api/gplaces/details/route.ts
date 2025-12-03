import { NextRequest, NextResponse } from 'next/server';

const GPLACES_API_KEY = process.env.NEXT_PUBLIC_GPLACES_API_KEY;
const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

interface GooglePlacePhoto {
  photo_reference: string;
  width: number;
  height: number;
  html_attributions?: string[];
}

interface GooglePlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get('id');

  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  if (!GPLACES_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const fields = [
      'name', 'photos', 'rating', 'reviews',
      'formatted_address', 'website', 'opening_hours',
      'formatted_phone_number', 'types', 'vicinity', 'place_id'
    ].join(',');

    const url = `${GOOGLE_PLACES_BASE}/details/json?key=${GPLACES_API_KEY}&place_id=${placeId}&fields=${fields}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: data.error_message || `Place not found: ${data.status}` },
        { status: 404 }
      );
    }

    const result = data.result;

    const place = {
      id: result.place_id,
      name: result.name,
      address: result.formatted_address,
      rating: result.rating,
      phone: result.formatted_phone_number,
      website: result.website,
      openingHours: result.opening_hours,
      types: result.types,
      vicinity: result.vicinity,
      photos: result.photos?.map((photo: GooglePlacePhoto) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        attributions: photo.html_attributions || [],
        url: `/api/gplaces/photo?ref=${photo.photo_reference}&maxwidth=800`,
      })),
      reviews: result.reviews?.map((review: GooglePlaceReview) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
      })),
    };

    return NextResponse.json(place);
  } catch (error) {
    console.error('GPlaces details error:', error);
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    );
  }
}
