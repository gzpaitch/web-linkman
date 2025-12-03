import { S3Client } from '@aws-sdk/client-s3';

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || 'us-east-1';
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.warn('S3 credentials not configured');
}

export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
  forcePathStyle: true,
});

export const S3_BUCKET = process.env.S3_BUCKET || 'gplaces';
export const S3_PUBLIC_URL = endpoint?.replace('/storage/v1/s3', '/storage/v1/object/public') || '';
