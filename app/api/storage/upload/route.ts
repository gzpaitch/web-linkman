import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, S3_PUBLIC_URL } from '@/lib/s3';

function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const customFilename = formData.get('filename') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = customFilename || generateFilename(file.name);
    const key = folder ? `${folder}/${filename}` : filename;

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    const publicUrl = `${S3_PUBLIC_URL}/${S3_BUCKET}/${key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
