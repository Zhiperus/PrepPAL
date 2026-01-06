import { LuInbox } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import { FeedPostSkeleton } from '@/components/ui/skeletons/feed-skeletons';
import {
  useInfiniteFeed,
  type SortOption,
} from '@/features/community-posts/api/get-posts';
import { timeAgo } from '@/utils/dateUtil';

interface PostListProps {
  onSelectPost: (postId: string) => void;
}

export function PostList({ onSelectPost }: PostListProps) {
  const [searchParams] = useSearchParams();

  // 3. Read directly from URL Params
  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'newest';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteFeed({
      sort,
      search,
    });

  if (isLoading) {
    return (
      <div className="w-full max-w-lg space-y-6 px-4 pt-4">
        {[1, 2].map((i) => (
          <FeedPostSkeleton key={i} />
        ))}
      </div>
    );
  }

  const hasPosts = data?.pages?.some((page) => page.data.length > 0);

  if (!hasPosts) {
    return (
      <div className="flex w-full max-w-lg flex-col items-center justify-center py-20 text-gray-400">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <LuInbox className="h-10 w-10 opacity-50" />
        </div>
        <p className="text-lg font-medium">No posts found</p>
        <p className="text-sm">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-5 space-y-6 px-4 pt-4">
      {data?.pages.map((page, i) => (
        <div key={i} className="contents">
          {page.data.map((post) => (
            <div
              key={post._id}
              className="card bg-base-100 w-full overflow-hidden shadow-xl"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 p-4">
                <div className="avatar">
                  <div className="h-10 w-10 rounded-full ring ring-[#2a4263] ring-offset-2">
                    {post.author.userImage ? (
                      <img
                        src={post.author.userImage}
                        alt={post.author.name}
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-neutral text-neutral-content flex h-full w-full items-center justify-center rounded-full">
                        <span className="text-xs font-bold">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">
                    {post.author.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Rank #{post.author.rank}
                  </span>
                </div>
              </div>

              {/* Go Bag Picture */}
              <figure className="w-full bg-gray-100">
                <img
                  src={post.imageUrl}
                  alt="Community Post"
                  className="h-auto max-h-[500px] w-full object-cover"
                  loading="lazy"
                />
              </figure>

              {/* Caption */}
              <div className="card-body p-4 pt-3">
                <p className="text-gray-700">
                  <span className="mr-2 font-bold">{post.author.name}</span>
                  {post.caption}
                </p>
                <p className="mb-4 text-xs text-gray-400">
                  Posted{' '}
                  {timeAgo(
                    typeof post.createdAt === 'string'
                      ? post.createdAt
                      : post.createdAt.toISOString(),
                  )}
                </p>

                <div className="card-actions justify-center">
                  <button
                    onClick={() => onSelectPost(post._id)}
                    className="btn btn-soft bg-btn-primary hover:bg-btn-primary-hover mt-4 w-64 gap-2 rounded text-white hover:shadow-md"
                  >
                    Rate Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Load More Button */}
      {hasPosts && hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="btn btn-ghost btn-sm text-gray-500"
          >
            {isFetchingNextPage ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Load More Posts'
            )}
          </button>
        </div>
      )}

      {hasPosts && !hasNextPage && (
        <div className="py-6 text-center text-sm text-gray-400">
          You&apos;re all caught up! 🎉
        </div>
      )}
    </div>
  );
}
