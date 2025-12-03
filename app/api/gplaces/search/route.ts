import { NextRequest, NextResponse } from 'next/server';

const GPLACES_API_KEY = process.env.NEXT_PUBLIC_GPLACES_API_KEY;
const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!GPLACES_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = `${GOOGLE_PLACES_BASE}/findplacefromtext/json?key=${GPLACES_API_KEY}&inputtype=textquery&input=${encodeURIComponent(query)}&fields=formatted_address,icon,name,photos,place_id,types`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json({ candidates: [] });
    }

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: data.error_message || `API error: ${data.status}` },
        { status: 400 }
      );
    }

    const candidates = data.candidates.map((item: {
      place_id: string;
      name: string;
      formatted_address: string;
      icon: string;
      types?: string[];
      photos?: { photo_reference: string }[];
    }) => {
      let image = '';
      if (item.photos && item.photos.length > 0) {
        image = `/api/gplaces/photo?ref=${item.photos[0].photo_reference}&maxwidth=400`;
      }

      return {
        place_id: item.place_id,
        name: item.name,
        formatted_address: item.formatted_address,
        icon: item.icon,
        types: item.types || [],
        image,
      };
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('GPlaces search error:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}
