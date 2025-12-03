'use client';

import { useState, useCallback } from 'react';
import type { GPlacesDetails, GPlacesPhoto } from '@/types';
import { getPhotoUrl, uploadFromUrl } from '@/lib/api';
import { 
  MapPin, Phone, Globe, Star, Clock, ArrowLeft, ExternalLink, 
  Copy, Check, Upload, Loader2, X, CheckCircle, ImageIcon
} from 'lucide-react';

interface GPlacesDetailsProps {
  place: GPlacesDetails;
  onBack: () => void;
}

interface UploadResult {
  originalUrl: string;
  uploadedUrl: string;
}

interface BatchUploadState {
  isUploading: boolean;
  selectedPhotos: Set<number>;
  results: {
    successful: UploadResult[];
    failed: { url: string; error: string }[];
  } | null;
}

export function GPlacesDetailsView({ place, onBack }: GPlacesDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [allUrlsCopied, setAllUrlsCopied] = useState(false);
  
  const [batchState, setBatchState] = useState<BatchUploadState>({
    isUploading: false,
    selectedPhotos: new Set(),
    results: null,
  });

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const copyAllUrls = useCallback(() => {
    if (!batchState.results?.successful.length) return;
    const urls = batchState.results.successful.map(r => r.uploadedUrl).join(', ');
    navigator.clipboard.writeText(urls);
    setAllUrlsCopied(true);
    setTimeout(() => setAllUrlsCopied(false), 2000);
  }, [batchState.results]);

  const formatSummary = useCallback(() => {
    let summary = '';
    summary += `NAME: ${place.name} | \n`;
    summary += `LOCALIZAÇÃO: ${place.address} | \n`;
    summary += `TELEFONE: ${place.phone || 'N/A'} | \n`;
    summary += `WEBSITE: ${place.website || 'N/A'} | \n`;
    if (place.rating) summary += `RATING: ${place.rating} | \n`;
    
    if (place.reviews?.length) {
      place.reviews.slice(0, 5).forEach((review, idx) => {
        const text = review.text.replace(/\n/g, ' ').trim();
        summary += `REVIEW ${idx + 1}: ${review.author} - ${text} | \n`;
      });
    }
    return summary.trim();
  }, [place]);

  const togglePhotoSelection = useCallback((index: number) => {
    setBatchState(prev => {
      const newSelected = new Set(prev.selectedPhotos);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return { ...prev, selectedPhotos: newSelected };
    });
  }, []);

  const selectAllPhotos = useCallback(() => {
    if (!place.photos) return;
    setBatchState(prev => ({
      ...prev,
      selectedPhotos: new Set(place.photos!.map((_, i) => i)),
    }));
  }, [place.photos]);

  const deselectAllPhotos = useCallback(() => {
    setBatchState(prev => ({ ...prev, selectedPhotos: new Set() }));
  }, []);

  const performBatchUpload = useCallback(async () => {
    if (!place.photos || batchState.selectedPhotos.size === 0) return;

    setBatchState(prev => ({ ...prev, isUploading: true, results: null }));

    const successful: UploadResult[] = [];
    const failed: { url: string; error: string }[] = [];

    const selectedIndices = Array.from(batchState.selectedPhotos);

    for (const index of selectedIndices) {
      const photo = place.photos![index];
      const photoUrl = photo.url || getPhotoUrl(photo.reference, 800);

      try {
        const result = await uploadFromUrl(photoUrl, {
          folder: `gplaces/${place.id}`,
        });

        if (result.success && result.url) {
          successful.push({ originalUrl: photoUrl, uploadedUrl: result.url });
        } else {
          failed.push({ url: photoUrl, error: result.error || 'Upload failed' });
        }
      } catch (error) {
        failed.push({ url: photoUrl, error: 'Network error' });
      }

      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setBatchState(prev => ({
      ...prev,
      isUploading: false,
      selectedPhotos: new Set(),
      results: { successful, failed },
    }));
  }, [place, batchState.selectedPhotos]);

  const clearResults = useCallback(() => {
    setBatchState(prev => ({ ...prev, results: null }));
    setAllUrlsCopied(false);
  }, []);

  const mainPhoto = place.photos?.[0];
  const mainPhotoUrl = mainPhoto?.url || (mainPhoto ? getPhotoUrl(mainPhoto.reference, 800) : null);

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="shrink-0 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      title={`Copy ${field}`}
    >
      {copiedField === field ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Copy Notification */}
      {copiedField && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          {copiedField} copied!
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      {/* Main Card */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {mainPhotoUrl && !imgError && (
          <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainPhotoUrl}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {place.name}
              </h1>
              <CopyButton text={place.name} field="Name" />
            </div>
            {place.rating && (
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-4 sm:h-5 w-4 sm:w-5 text-zinc-400" />
                <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">{place.rating}</span>
                {place.reviews && (
                  <span className="text-zinc-500 text-sm">({place.reviews.length} reviews)</span>
                )}
              </div>
            )}
          </div>

          {/* Copy Summary Button */}
          <button
            onClick={() => copyToClipboard(formatSummary(), 'Summary')}
            className="w-full mb-4 sm:mb-6 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm sm:text-base"
          >
            <Copy className="h-4 w-4" />
            Copy Summary
          </button>

          {/* Details */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {/* Address */}
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-zinc-400 mt-0.5 shrink-0" />
              <span className="flex-1 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">{place.address}</span>
              <CopyButton text={place.address} field="Address" />
            </div>

            {/* Phone */}
            {place.phone && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-zinc-400 shrink-0" />
                <a
                  href={`tel:${place.phone}`}
                  className="flex-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm sm:text-base"
                >
                  {place.phone}
                </a>
                <CopyButton text={place.phone} field="Phone" />
              </div>
            )}

            {/* Opening Hours */}
            {place.openingHours?.weekday_text && (
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-zinc-400 mt-0.5 shrink-0" />
                <div className="flex-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  {place.openingHours.weekday_text.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
                <CopyButton 
                  text={place.openingHours.weekday_text.join('\n')} 
                  field="Hours" 
                />
              </div>
            )}
          </div>

          {/* Website */}
          {place.website && (
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
              <Globe className="h-5 w-5 text-zinc-400 shrink-0" />
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 text-zinc-900 dark:text-zinc-100 hover:underline font-medium text-sm sm:text-base truncate"
              >
                {place.website}
              </a>
              <ExternalLink className="h-4 w-4 text-zinc-400 shrink-0 hidden sm:block" />
              <CopyButton text={place.website} field="Website" />
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {place.reviews && place.reviews.length > 0 && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
              Reviews ({place.reviews.length})
            </h2>
            <button
              onClick={() => {
                const reviewsText = place.reviews!.slice(0, 5).map((r, i) => 
                  `REVIEW ${i + 1}: ${r.author} - ${r.text.replace(/\n/g, ' ')}`
                ).join(' | \n');
                copyToClipboard(reviewsText, 'Reviews');
              }}
              className="text-xs sm:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 shrink-0"
            >
              <Copy className="h-3 w-3" />
              Copy All
            </button>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {place.reviews.slice(0, 5).map((review, idx) => (
              <div key={idx} className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                    {review.author}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500">
                      <Star className="h-4 w-4" />
                      {review.rating}
                    </div>
                    <CopyButton 
                      text={`${review.author} - ${review.text}`} 
                      field={`Review ${idx + 1}`} 
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Grid with Upload */}
      {place.photos && place.photos.length > 0 && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
              Photos ({place.photos.length})
            </h2>
          </div>

          {/* Batch Upload Controls */}
          <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Upload to S3
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={selectAllPhotos}
                disabled={batchState.isUploading}
                className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                Select All ({place.photos.length})
              </button>
              <button
                onClick={deselectAllPhotos}
                disabled={batchState.isUploading}
                className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                Deselect All
              </button>
              {batchState.selectedPhotos.size > 0 && (
                <span className="text-xs sm:text-sm text-zinc-500">
                  {batchState.selectedPhotos.size} selected
                </span>
              )}
            </div>

            {batchState.selectedPhotos.size > 0 && (
              <button
                onClick={performBatchUpload}
                disabled={batchState.isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {batchState.isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload {batchState.selectedPhotos.size} Photo{batchState.selectedPhotos.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}

            {/* Upload Results */}
            {batchState.results && (
              <div className="mt-4 p-3 sm:p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Upload Results
                  </h4>
                  <button
                    onClick={clearResults}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                  >
                    <X className="h-4 w-4 text-zinc-400" />
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-zinc-500 mb-3">
                  Total: {batchState.results.successful.length + batchState.results.failed.length} | 
                  Success: {batchState.results.successful.length} | 
                  Failed: {batchState.results.failed.length}
                </div>

                {batchState.results.successful.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Successful ({batchState.results.successful.length})
                      </span>
                      <button
                        onClick={copyAllUrls}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 w-fit"
                      >
                        {allUrlsCopied ? 'Copied!' : `Copy All (${batchState.results.successful.length})`}
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {batchState.results.successful.map((result, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={result.uploadedUrl}
                            readOnly
                            className="flex-1 min-w-0 px-2 py-1 text-xs font-mono bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <button
                            onClick={() => copyToClipboard(result.uploadedUrl, `URL ${idx + 1}`)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded shrink-0"
                          >
                            <Copy className="h-3 w-3 text-zinc-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {batchState.results.failed.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Failed ({batchState.results.failed.length})
                    </span>
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                      {batchState.results.failed.map((error, idx) => (
                        <div key={idx} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                          {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photos Grid */}
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {place.photos.map((photo, idx) => {
                const photoUrl = photo.url || getPhotoUrl(photo.reference, 400);
                const isSelected = batchState.selectedPhotos.has(idx);
                
                return (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer group ${
                      isSelected ? 'ring-2 ring-zinc-900 dark:ring-zinc-100' : ''
                    }`}
                    onClick={() => !batchState.isUploading && togglePhotoSelection(idx)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`${place.name} photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Selection Overlay */}
                    <div className={`absolute inset-0 transition-opacity ${
                      isSelected 
                        ? 'bg-zinc-900/40 dark:bg-zinc-100/40' 
                        : 'bg-black/0 group-hover:bg-black/20'
                    }`}>
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' 
                          : 'border-white bg-white/50 group-hover:bg-white/80'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white dark:text-zinc-900" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
