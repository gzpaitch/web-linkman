import { NextRequest, NextResponse } from 'next/server';

const GPLACES_API_KEY = process.env.NEXT_PUBLIC_GPLACES_API_KEY;
const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const photoRef = searchParams.get('ref');
  const maxWidth = searchParams.get('maxwidth') || '400';

  if (!photoRef) {
    return NextResponse.json({ error: 'Photo reference is required' }, { status: 400 });
  }

  if (!GPLACES_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = `${GOOGLE_PLACES_BASE}/photo?key=${GPLACES_API_KEY}&maxwidth=${maxWidth}&photoreference=${photoRef}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch photo' }, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('GPlaces photo error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}
