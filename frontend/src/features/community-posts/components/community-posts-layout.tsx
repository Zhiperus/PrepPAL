import { useState } from 'react';
// Import the FeedPost type
import type { FeedPost } from '@repo/shared/dist/schemas/post.schema';

import FeedHeader from './feed-header';
import PostCardModal from './post-card';
import PostList from './post-list';

import { useGoBag } from '@/features/go-bag/api/get-go-bag';
import PostBagModal from '@/features/go-bag/components/post-go-bag-modal';

export default function CommunityFeedRoute() {
  // CHANGED: Store the object, not the ID
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // REMOVED: Redundant useInfiniteFeed hook.
  // We rely on PostList to handle data fetching now.

  const { data: goBag } = useGoBag();

  return (
    <div className="bg-base-200 flex min-h-screen flex-col items-center pb-20">
      <FeedHeader onCreatePost={() => setIsPostModalOpen(true)} />

      {/* CHANGED: Capture the post object directly */}
      <PostList onSelectPost={(post) => setSelectedPost(post)} />

      <PostCardModal
        isOpen={!!selectedPost}
        post={selectedPost || undefined}
        onClose={() => setSelectedPost(null)}
      />

      {isPostModalOpen && (
        <PostBagModal
          onClose={() => setIsPostModalOpen(false)}
          completeness={0}
          bagImage={goBag?.imageUrl || null}
        />
      )}
    </div>
  );
}
