import type { Post } from '@repo/shared/dist/schemas/post.schema';
import { useState } from 'react';
import { RxChevronLeft, RxChevronRight } from 'react-icons/rx';

import { useUserPosts } from '../api/get-user-posts';

import PostDetailModal from './post-detail-modal';
import PostCard from './user-post-card';

import { useUser } from '@/lib/auth';

export function UserPostsList() {
  const { data: user } = useUser();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [page, setPage] = useState(1);

  const {
    data: postsData,
    isLoading,
    isFetching,
  } = useUserPosts({
    userId: user?.id || '',
    params: { page },
    queryConfig: {
      enabled: !!user?.id,
    },
  });

  const posts = postsData?.data as Post[] | undefined;

  const meta = postsData?.meta;

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-24 w-full items-center gap-4 rounded-xl border p-3"
          >
            <div className="skeleton h-16 w-16 rounded-lg"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-32 rounded"></div>
              <div className="skeleton h-3 w-48 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    // Return your empty state here
    return <div className="p-8 text-center text-gray-500">No posts found.</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-3 p-4 pb-20">
        {/* Helper text if fetching in background */}
        {isFetching && !isLoading && (
          <div className="animate-pulse text-center text-xs text-gray-400">
            Updating...
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onClick={() => setSelectedPost(post)}
          />
        ))}

        {/* 4. Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || isFetching}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RxChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm font-medium text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === meta.totalPages || isFetching}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <RxChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
