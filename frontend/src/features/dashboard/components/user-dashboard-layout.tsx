import { useState } from 'react';
import { FaLocationDot, FaThumbsUp } from 'react-icons/fa6';
import { LuChevronRight } from 'react-icons/lu';
import { MdNavigateNext } from 'react-icons/md';

import { useInfiniteFeed } from '@/features/community-posts/api/get-posts';
import PostCardModal from '@/features/community-posts/components/post-card';
import { useUser } from '@/lib/auth';
import { timeAgo } from '@/utils/dateUtil';
import { getPercent } from '@/utils/getPercent';

const MAX_GOBAG_POINTS = 100;
const MAX_MODULE_POINTS = 50;

export function UserDashboard() {
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();
  const [postId, setPostId] = useState<string | null>(null);

  const { data: feedData } = useInfiniteFeed({
    sort: 'newest',
    search: '',
  });

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const { goBag, modules } = user.points;
  const goBagPercent = getPercent(goBag, MAX_GOBAG_POINTS);
  const modPercent = getPercent(modules, MAX_MODULE_POINTS);
  const totalPercent = Math.round((goBagPercent + modPercent) / 2);

  const latestPosts =
    feedData?.pages.flatMap((page) => page.data).slice(0, 3) || [];

  const selectedPost = feedData?.pages
    .flatMap((page) => page.data)
    .find((post) => post._id === postId);

  return (
    <div className="p-15">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-text-primary mb-2 text-5xl font-extrabold tracking-tight">
          Hello, {user.householdName}.
        </h1>

        <div className="flex flex-row items-center gap-2 text-sm font-medium text-gray-600 sm:text-base">
          <FaLocationDot className="text-text-primary h-4 w-4" />

          <span className="text-text-secondary">
            Brgy. {user.location?.barangay}, {user.location?.city},{' '}
            {user.location?.province}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Progress Tracker */}
        <div>
          <h2 className="text-text-primary text-2xl font-semibold">
            Current Progress
          </h2>
          <span className="text-text-sceondary">
            Track your disaster preparedness levels.
          </span>
          <div className="flex flex-row items-center gap-8">
            <div className="mt-6 flex flex-col items-center gap-2">
              <div
                className="radial-progress font-bold text-[#2a4263]"
                style={
                  {
                    '--value': totalPercent,
                    '--size': '6.5rem',
                    '--thickness': '0.8rem',
                  } as React.CSSProperties
                }
                role="progressbar"
                aria-valuenow={totalPercent}
              >
                <div className="mt-1 flex flex-col items-center gap-1">
                  <FaThumbsUp className="h-6 w-6" />
                  <span className="text-xl">{totalPercent}%</span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Preparedness
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    Go-Bag Preparation
                  </span>
                  <span className="text-sm font-extrabold text-[#2a4263]">
                    {goBagPercent}%
                  </span>
                </div>
                <progress
                  className="progress h-3 w-full border border-gray-200 bg-gray-100 [&::-moz-progress-bar]:bg-[#2a4263] [&::-webkit-progress-value]:bg-[#2a4263]"
                  value={goBagPercent}
                  max="100"
                ></progress>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    DRR Courses
                  </span>
                  <span className="text-sm font-extrabold text-[#2a4263]">
                    {modPercent}%
                  </span>
                </div>
                <progress
                  className="progress h-3 w-full border border-gray-200 bg-gray-100 [&::-moz-progress-bar]:bg-[#2a4263] [&::-webkit-progress-value]:bg-[#2a4263]"
                  value={modPercent}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div>
          <h2 className="text-text-primary text-2xl font-semibold">
            Continue on Courses
          </h2>
          <span className="text-text-secondary">Learn more from modules.</span>
          <div className="card card-side bg-bg-info bg-opacity-90 mt-1 shadow-sm">
            <figure className="p-2">
              <img
                className="rounded-xl"
                src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
                alt="Movie"
              />
            </figure>
            <div className="card-body">
              <p className="text-text-placeholder">Last Viewed</p>
              <h2 className="card-title text-text-primary">
                Disaster Preparedness Floods
              </h2>
              <p className="text-text-secondary">by NDRRMC</p>
              <div className="card-actions justify-end">
                <button className="btn bg-btn-primary">
                  <MdNavigateNext className="text-xl text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Community Posts */}
        <div>
          <h2 className="text-text-primary text-2xl font-semibold">
            Community Posts
          </h2>
          <span className="text-text-secondary">See how others are doing.</span>
          <div className="bg-bg-info bg-opacity-90 mt-1 flex flex-col rounded-lg p-5 shadow-sm">
            <div>
              {latestPosts.map((post, index) => (
                <div
                  key={post._id}
                  className={`flex items-start justify-between py-5 ${
                    index !== latestPosts.length - 1
                      ? 'border-b border-gray-400'
                      : ''
                  }`}
                >
                  <div className="mr-4 flex flex-1 flex-col">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="avatar">
                        <div className="h-10 w-10 rounded-full ring ring-white ring-offset-1">
                          <img
                            src={post.author.userImage}
                            alt={post.author.name}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm leading-none font-bold text-[#2a4263]">
                          {post.author.name}
                        </span>
                        <span className="mt-1 text-xs text-gray-400">
                          {' '}
                          {timeAgo(
                            typeof post.createdAt === 'string'
                              ? post.createdAt
                              : post.createdAt.toISOString(),
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="mb-2 line-clamp-2 text-sm leading-snug font-medium text-[#2a4263]">
                      {post.caption}
                    </p>

                    <button
                      className="mt-auto flex items-center text-sm font-bold text-gray-500 transition-colors hover:text-[#2a4263]"
                      onClick={() => setPostId(post._id)}
                    >
                      Learn More
                      <LuChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>

                  <div className="h-24 w-24 shrink-0">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="h-full w-full rounded-xl object-cover shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <a
              className="link link-hover items-center justify-center"
              href="\app\community-posts"
            >
              {' '}
              Show more...
            </a>
          </div>
        </div>
      </div>
      <PostCardModal
        isOpen={!!postId}
        post={selectedPost}
        onClose={() => setPostId(null)}
      />
    </div>
  );
}

