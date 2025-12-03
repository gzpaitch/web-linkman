'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { uploadFromUrl } from '@/lib/api';
import type { IgProfileInfo } from '@/types';
import { ExternalLink, BadgeCheck, Lock, User, Upload, Loader2, Check, Copy } from 'lucide-react';

interface InstagramProfileCardProps {
  profile: IgProfileInfo;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function proxyImageUrl(url: string): string {
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

export function InstagramProfileCard({ profile }: InstagramProfileCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleUploadAvatar = async () => {
    if (!profile.avatar_url || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    const result = await uploadFromUrl(profile.avatar_url, {
      folder: 'instagram/avatars',
      filename: `${profile.username}_avatar.jpg`,
    });

    setIsUploading(false);

    if (result.success && result.url) {
      setUploadedUrl(result.url);
    } else {
      setUploadError(result.error || 'Upload failed');
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative group">
            {profile.avatar_url && !imgError ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proxyImageUrl(profile.avatar_url)}
                  alt={profile.username}
                  className="h-16 w-16 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800"
                  onError={() => setImgError(true)}
                />
                {!uploadedUrl && (
                  <button
                    onClick={handleUploadAvatar}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Upload to S3"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-white" />
                    )}
                  </button>
                )}
                {uploadedUrl && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </>
            ) : (
              <div className="h-16 w-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <User className="h-8 w-8 text-zinc-400" />
              </div>
            )}
            {profile.is_verified && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                <BadgeCheck className="h-3 w-3 text-white dark:text-zinc-900" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{profile.name || profile.username}</h3>
            <p className="text-sm text-zinc-500">@{profile.username}</p>
            {profile.is_private && (
              <Badge variant="secondary" className="mt-1">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-semibold">{formatCount(profile.posts_count)}</p>
            <p className="text-xs text-zinc-500">Posts</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{formatCount(profile.followers_count)}</p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{formatCount(profile.following_count)}</p>
            <p className="text-xs text-zinc-500">Following</p>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        {profile.external_url && (
          <a
            href={profile.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ExternalLink className="h-4 w-4" />
            {profile.external_url}
          </a>
        )}

        {uploadError && (
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        )}

        {uploadedUrl && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 mb-1">Avatar URL (S3)</p>
              <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{uploadedUrl}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="shrink-0 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
