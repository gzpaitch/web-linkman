'use client';

import { useState } from 'react';
import { InstagramSearch, InstagramProfileCard, InstagramPostsGrid } from '@/components/features';
import { Button } from '@/components/ui';
import { useApiState } from '@/hooks';
import { getInstagramProfilePublic, getInstagramPosts } from '@/lib/api';
import { AlertCircle, Grid3X3, Loader2 } from 'lucide-react';

export default function InstagramPage() {
  const [username, setUsername] = useState<string | null>(null);

  const profileApi = useApiState(getInstagramProfilePublic);
  const postsApi = useApiState(getInstagramPosts);

  const handleSearch = async (searchUsername: string) => {
    setUsername(searchUsername);
    profileApi.reset();
    postsApi.reset();
    await profileApi.execute(searchUsername);
  };

  const handleLoadPosts = async () => {
    if (username) {
      await postsApi.execute(username, 12);
    }
  };

  const canLoadPosts = profileApi.data && !profileApi.data.is_private && !postsApi.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <InstagramSearch onSearch={handleSearch} isLoading={profileApi.isLoading} />

      {profileApi.error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50 overflow-hidden">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5 break-words">{profileApi.error.message}</p>
          </div>
        </div>
      )}

      {profileApi.data && <InstagramProfileCard profile={profileApi.data} />}

      {canLoadPosts && (
        <Button
          onClick={handleLoadPosts}
          disabled={postsApi.isLoading}
          className="w-full"
          variant="outline"
        >
          {postsApi.isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Grid3X3 className="h-4 w-4 mr-2" />
          )}
          {postsApi.isLoading ? 'Loading posts...' : 'Load Posts'}
        </Button>
      )}

      {postsApi.error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50 overflow-hidden">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-red-800 dark:text-red-300">Error loading posts</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5 break-words">{postsApi.error.message}</p>
          </div>
        </div>
      )}

      {postsApi.data && username && (
        <InstagramPostsGrid posts={postsApi.data.posts} username={username} />
      )}
    </div>
  );
}
