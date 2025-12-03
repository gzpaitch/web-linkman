'use client';

import { useState } from 'react';
import { uploadFile, uploadFromUrl } from '@/lib/api';
import { Upload, Link, Loader2, Check, Copy, Trash2 } from 'lucide-react';

export default function StorageTestPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadedUrl(null);

    const result = await uploadFile(file, { folder: 'test' });

    setIsUploading(false);

    if (result.success && result.url) {
      setUploadedUrl(result.url);
    } else {
      setError(result.error || 'Upload failed');
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);
    setError(null);
    setUploadedUrl(null);

    const result = await uploadFromUrl(urlInput.trim(), { folder: 'test' });

    setIsUploading(false);

    if (result.success && result.url) {
      setUploadedUrl(result.url);
    } else {
      setError(result.error || 'Upload failed');
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setUploadedUrl(null);
    setError(null);
    setUrlInput('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">S3 Storage Test</h1>
        <p className="text-sm text-zinc-500 mt-1">Test upload to S3 bucket</p>
      </div>

      {/* File Upload */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-medium mb-4 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </h2>
        <label className="block">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-zinc-100 file:text-zinc-700
              hover:file:bg-zinc-200
              dark:file:bg-zinc-800 dark:file:text-zinc-300
              dark:hover:file:bg-zinc-700
              disabled:opacity-50"
          />
        </label>
      </div>

      {/* URL Upload */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="font-medium mb-4 flex items-center gap-2">
          <Link className="h-4 w-4" />
          Upload from URL
        </h2>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={isUploading}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
          />
          <button
            onClick={handleUrlUpload}
            disabled={isUploading || !urlInput.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 py-4 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success */}
      {uploadedUrl && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="h-5 w-5" />
            <span className="font-medium">Upload successful!</span>
          </div>

          {/* Preview */}
          <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="w-full h-full object-contain"
            />
          </div>

          {/* URL */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <p className="flex-1 min-w-0 text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {uploadedUrl}
            </p>
            <button
              onClick={copyToClipboard}
              className="shrink-0 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <Trash2 className="h-4 w-4" />
            Clear and test again
          </button>
        </div>
      )}
    </div>
  );
}
