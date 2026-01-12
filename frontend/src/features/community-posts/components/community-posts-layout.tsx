import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { FeedHeader } from './feed-header';
import PostCardModal from './post-card';
import PostBagModal from '@/features/go-bag/components/post-go-bag-modal';
import { PostList } from './post-list';

import {
  useInfiniteFeed,
  type SortOption,
} from '@/features/community-posts/api/get-posts';

export default function CommunityFeedRoute() {
  const [postId, setPostId] = useState<string | null>(null);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'newest';

  const { data } = useInfiniteFeed({ sort, search });

  const selectedPost = data?.pages
    .flatMap((page) => page.data)
    .find((post) => post._id === postId);

  return (
    <div className="bg-base-200 flex min-h-screen flex-col items-center pb-20">
      <FeedHeader onCreatePost={() => setIsPostModalOpen(true)} />

      <PostList onSelectPost={setPostId} />

      <PostCardModal
        isOpen={!!postId}
        post={selectedPost}
        onClose={() => setPostId(null)}
      />

      {isPostModalOpen && (
        <PostBagModal
          onClose={() => setIsPostModalOpen(false)}
          completeness={0} 
          bagImage={null} 
        />
      )}
    </div>
  );
}
