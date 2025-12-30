import { useEffect, useState } from 'react';
import { LuSearch, LuArrowUpDown, LuInbox } from 'react-icons/lu';

import { PostCardModal } from './post-card';

import {
  useInfiniteFeed,
  type SortOption,
} from '@/features/community-posts/api/get-feed';
import { timeAgo } from '@/utils/dateUtil';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CommunityFeedLayout() {
  const [postId, setPostId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteFeed({
      sort: sortOption,
      search: debouncedSearch,
    });

  if (isLoading) {
    return (
      <div className="bg-base-200 flex min-h-screen flex-col items-center space-y-4 pb-20">
        <FeedHeaderSkeleton />
        <div className="w-full max-w-lg space-y-6 px-4">
          {[1, 2].map((i) => (
            <FeedPostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const hasPosts = data?.pages?.some((page) => page.data.length > 0);
  const selectedPost = data?.pages
    .flatMap((page) => page.data)
    .find((post) => post._id === postId);

  return (
    <div className="bg-base-200 flex min-h-screen flex-col items-center pb-20">
      <div className="bg-base-200/95 sticky top-0 z-30 w-full max-w-lg px-4 py-3 backdrop-blur-sm transition-all">
        <div className="flex w-full max-w-lg flex-col items-center px-4 pt-6">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-[#2a4263]">
            Community Posts
          </h1>
        </div>
        <div className="flex w-full items-center gap-3">
          <label className="input input-bordered flex flex-1 items-center gap-3 shadow-sm transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#2a4263] focus-within:outline-none">
            <LuSearch className="h-4 w-4 opacity-50" />
            <input
              type="search"
              className="grow text-sm"
              placeholder="Search items or captions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </label>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-square btn-outline border-base-300 bg-base-100 hover:border-base-400 hover:bg-base-200 text-gray-600 shadow-sm"
              title="Sort Feed"
            >
              <LuArrowUpDown className="h-5 w-5" />
            </div>

            <ul
              tabIndex={0}
              className="menu dropdown-content rounded-box border-base-200 bg-base-100 z-[1] mt-2 w-40 border p-2 shadow-lg"
            >
              <li>
                <a
                  onClick={() => setSortOption('newest')}
                  className={sortOption === 'newest' ? 'active font-bold' : ''}
                >
                  Newest
                </a>
              </li>
              <li>
                <a
                  onClick={() => setSortOption('oldest')}
                  className={sortOption === 'oldest' ? 'active font-bold' : ''}
                >
                  Oldest
                </a>
              </li>
              <li>
                <a
                  onClick={() => setSortOption('popular')}
                  className={sortOption === 'popular' ? 'active font-bold' : ''}
                >
                  Popular
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Feed Content */}
      <div className="flex w-full max-w-lg flex-col gap-5 space-y-6 px-4 pt-4">
        {!hasPosts ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <LuInbox className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-lg font-medium">No posts found</p>
            <p className="text-sm">Be the first to share your Go Bag!</p>
          </div>
        ) : (
          data?.pages.map((page, i) => (
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
                        onClick={() => setPostId(post._id)}
                        className="btn btn-soft bg-btn-primary mt-4 w-64 gap-2 rounded text-white hover:shadow-md"
                      >
                        Rate Bag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Load More Button or Skeleton */}
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

      <PostCardModal
        isOpen={!!postId}
        post={selectedPost}
        onClose={() => setPostId(null)}
      />
    </div>
  );
}

// --- SKELETON COMPONENTS ---

function FeedHeaderSkeleton() {
  return (
    <div className="flex w-full max-w-lg flex-col items-center px-4 pt-6">
      {/* Title */}
      <div className="skeleton mb-4 h-8 w-48 rounded-md"></div>
      {/* Search Bar + Sort Button */}
      <div className="mb-6 flex w-full items-center gap-3">
        <div className="skeleton h-12 flex-1 rounded-lg"></div>
        <div className="skeleton h-12 w-12 rounded-lg"></div>
      </div>
    </div>
  );
}

function FeedPostSkeleton() {
  return (
    <div className="card bg-base-100 w-full overflow-hidden shadow-xl">
      {/* Header: Avatar + Text */}
      <div className="flex items-center gap-3 p-4">
        <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-32 rounded"></div>
          <div className="skeleton h-3 w-16 rounded"></div>
        </div>
      </div>

      {/* Image Placeholder */}
      <div className="skeleton h-64 w-full"></div>

      {/* Body: Caption + Button */}
      <div className="card-body space-y-4 p-4">
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-3/4 rounded"></div>
        </div>

        {/* Button */}
        <div className="flex justify-center pt-2">
          <div className="skeleton h-10 w-64 rounded"></div>
        </div>
      </div>
    </div>
  );
}

