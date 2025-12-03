import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from '@/lib/s3';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: path,
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
