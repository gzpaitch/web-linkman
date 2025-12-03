import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3';

function generateFilename(contentType: string): string {
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const ext = extMap[contentType] || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, folder, filename: customFilename } = body;

    if (!sourceUrl) {
      return NextResponse.json({ error: 'No source URL provided' }, { status: 400 });
    }

    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    const filename = customFilename || generateFilename(contentType);
    const key = folder ? `${folder}/${filename}` : filename;

    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    const publicUrl = `${S3_PUBLIC_URL}/${S3_BUCKET}/${key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: key,
    });
  } catch (error) {
    console.error('Upload from URL error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
