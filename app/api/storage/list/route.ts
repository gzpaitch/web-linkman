import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || '';

    const { Contents } = await s3Client.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: folder ? `${folder}/` : undefined,
      MaxKeys: 100,
    }));

    const files = (Contents || [])
      .filter(item => item.Key && !item.Key.endsWith('/'))
      .map(item => ({
        name: item.Key?.split('/').pop() || '',
        path: item.Key || '',
        url: `${S3_PUBLIC_URL}/${S3_BUCKET}/${item.Key}`,
        size: item.Size,
        lastModified: item.LastModified?.toISOString(),
      }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'List failed' },
      { status: 500 }
    );
  }
}
