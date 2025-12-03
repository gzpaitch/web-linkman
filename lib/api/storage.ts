import type { UploadResult, UploadOptions, StorageFileInfo } from '@/types';

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.folder) formData.append('folder', options.folder);
  if (options.filename) formData.append('filename', options.filename);

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.error || 'Upload failed' };
  }

  return response.json();
}

export async function uploadFromUrl(
  sourceUrl: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const response = await fetch('/api/storage/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceUrl,
      folder: options.folder,
      filename: options.filename,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.error || 'Upload failed' };
  }

  return response.json();
}

export async function deleteFile(
  path: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/storage/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.error || 'Delete failed' };
  }

  return { success: true };
}

export async function listFiles(
  folder: string = ''
): Promise<{ files: StorageFileInfo[]; error?: string }> {
  const params = new URLSearchParams({ folder });
  const response = await fetch(`/api/storage/list?${params}`);

  if (!response.ok) {
    const error = await response.json();
    return { files: [], error: error.error || 'List failed' };
  }

  return response.json();
}
