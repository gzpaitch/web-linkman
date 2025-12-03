'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { IgPostInfo } from '@/types';
import { Heart, MessageCircle, Play } from 'lucide-react';

interface InstagramPostsGridProps {
  posts: IgPostInfo[];
  username: string;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function proxyImageUrl(url: string): string {
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

function PostCard({ post }: { post: IgPostInfo }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyImageUrl(post.media_url)}
        alt={post.caption || 'Instagram post'}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      
      {post.is_video && (
        <div className="absolute right-2 top-2">
          <Play className="h-5 w-5 fill-white text-white drop-shadow" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="flex items-center gap-1 text-sm font-medium text-white">
          <Heart className="h-4 w-4 fill-white" />
          {formatCount(post.likes)}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-white">
          <MessageCircle className="h-4 w-4 fill-white" />
          {formatCount(post.comments)}
        </span>
      </div>
    </a>
  );
}

export function InstagramPostsGrid({ posts, username }: InstagramPostsGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Posts ({posts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">No posts found for @{username}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <PostCard key={post.shortcode} post={post} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
