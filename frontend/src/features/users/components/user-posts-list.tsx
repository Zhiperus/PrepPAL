import type { Post } from '@repo/shared/dist/schemas/post.schema';

import { useUserPosts } from '../api/get-user-posts';

import { useUser } from '@/lib/auth';

export function UserPostsList() {
  const { data: user } = useUser();

  const { data: posts, isLoading } = useUserPosts({
    userId: user?._id || '',
    queryConfig: {
      enabled: !!user?._id,
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-6 w-40 rounded"></div>
            <div className="skeleton h-56 w-full rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="font-medium">No posts yet.</p>
        <p className="text-sm">Share your Go Bag progress!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 pb-20">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const dateString = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(post.createdAt));

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-lg font-bold text-[#2A4263]">{dateString}</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <img
          src={post.imageUrl}
          alt={`Go Bag update from ${dateString}`}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
