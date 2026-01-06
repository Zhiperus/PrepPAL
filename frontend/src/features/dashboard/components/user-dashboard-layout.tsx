import { useState } from 'react';
import { FaLocationDot, FaThumbsUp } from 'react-icons/fa6';
import {
  LuPackage,
  LuBookOpen,
  LuUsers,
  LuChevronRight,
  LuTrophy,
  LuPlay,
} from 'react-icons/lu';
import { MdNavigateNext } from 'react-icons/md';
import { Link, useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { useInfiniteFeed } from '@/features/community-posts/api/get-posts';
import PostCardModal from '@/features/community-posts/components/post-card';
import { useModule } from '@/features/modules/api/get-module';
import { useUser } from '@/lib/auth';
import { getPercent } from '@/utils/getPercent';

const MAX_GOBAG_POINTS = 100;
const MAX_MODULE_POINTS = 50;

export function UserDashboard() {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUser();
  const [postId, setPostId] = useState<string | null>(null);

  const recentModuleData = user?.completedModules?.at(-1);
  const recentModuleId = recentModuleData?.moduleId;

  const { data: moduleData, isLoading: isModuleLoading } = useModule({
    moduleId: recentModuleId as string,
    queryConfig: { enabled: !!recentModuleId },
  });
  const moduleDetails = moduleData?.data;

  const { data: feedData } = useInfiniteFeed({ sort: 'newest', search: '' });

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#2a4263]"></span>
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

  const { goBag, modules, community } = user.points;
  const goBagPercent = getPercent(goBag, MAX_GOBAG_POINTS);
  const modPercent = getPercent(modules, MAX_MODULE_POINTS);
  const totalPercent = getPercent(
    Math.min(goBag, MAX_GOBAG_POINTS) + Math.min(modules, MAX_MODULE_POINTS),
    MAX_GOBAG_POINTS + MAX_MODULE_POINTS,
  );

  const latestPosts =
    feedData?.pages.flatMap((page) => page.data).slice(0, 3) || [];
  const selectedPost = feedData?.pages
    .flatMap((page) => page.data)
    .find((post) => post._id === postId);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8 md:p-10 lg:p-15">
      {/* Header */}
      <div className="mb-8 pt-10 lg:pt-0">
        <h1 className="text-text-primary mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Hello, {user.householdName}.
        </h1>
        <div className="flex flex-row items-center gap-2 text-sm font-medium text-gray-600">
          <FaLocationDot className="text-text-primary h-4 w-4 shrink-0" />
          <span className="text-text-secondary line-clamp-1">
            Brgy. {user.location?.barangay}, {user.location?.city}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:gap-10">
        {/* Achievement Summary */}
        <section>
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="text-text-primary text-xl font-semibold sm:text-2xl">
              Achievement Summary
            </h2>
            <div className="badge badge-outline w-full gap-2 self-center p-4 font-bold text-[#2a4263] sm:w-fit lg:self-start">
              <LuTrophy className="h-4 w-4" />
              Total: {(goBag + modules + community).toFixed(0)} pts
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* GoBag, Courses, Community cards */}
            {[
              { label: 'Go-Bag', val: goBag, icon: LuPackage, color: 'blue' },
              {
                label: 'Courses',
                val: modules.toFixed(1),
                icon: LuBookOpen,
                color: 'indigo',
              },
              {
                label: 'Community',
                val: community,
                icon: LuUsers,
                color: 'orange',
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 rounded-2xl border border-${item.color}-100 bg-white p-4 shadow-sm`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-${item.color}-50 text-${item.color}-600`}
                >
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {item.label}
                  </p>
                  <p className="text-xl font-black text-[#2a4263]">
                    {item.val} <span className="text-xs font-normal">pts</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Tracker */}
        <section>
          <h2 className="text-text-primary text-xl font-semibold sm:text-2xl">
            Current Progress
          </h2>
          <p className="text-text-secondary mb-4 text-sm">
            Track your disaster preparedness levels.
          </p>

          <div className="flex flex-col items-center gap-6 rounded-2xl border border-white bg-white/50 p-6 md:flex-row md:gap-10">
            <div className="flex flex-col items-center gap-2">
              <div
                className="radial-progress font-bold text-[#2a4263]"
                style={
                  {
                    '--value': totalPercent,
                    '--size': '6.5rem',
                    '--thickness': '0.8rem',
                  } as any
                }
                role="progressbar"
              >
                <div className="flex flex-col items-center gap-1">
                  <FaThumbsUp className="h-6 w-6" />
                  <span className="text-xl">{totalPercent}%</span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Preparedness
              </span>
            </div>

            <div className="flex w-full flex-1 flex-col gap-6">
              {[
                { label: 'Go-Bag Preparation', val: goBagPercent },
                { label: 'DRR Courses', val: modPercent },
              ].map((bar) => (
                <div key={bar.label} className="w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      {bar.label}
                    </span>
                    <span className="text-sm font-extrabold text-[#2a4263]">
                      {bar.val}%
                    </span>
                  </div>
                  <progress
                    className="progress h-3 w-full border border-gray-200 bg-gray-100"
                    value={bar.val}
                    max="100"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Continue Learning Section */}
        <section>
          <h2 className="text-text-primary mb-1 text-xl font-semibold sm:text-2xl">
            {recentModuleId ? 'Continue Learning' : 'Get Started'}
          </h2>
          <p className="text-text-secondary mb-5 text-sm">
            {recentModuleId
              ? 'Resume where you left off.'
              : 'Start your first module.'}
          </p>

          {recentModuleId ? (
            <div
              onClick={() => navigate(`/app/modules/${recentModuleId}`)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-[#2A4362] text-white shadow-xl transition-transform hover:scale-[1.01] sm:flex-row"
            >
              {/* Background/Image Container */}
              <div className="relative h-40 overflow-hidden sm:h-auto sm:w-1/3 md:w-1/2">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#2A4362]/40 via-[#2A4362]/80 to-[#2A4362] sm:bg-gradient-to-r sm:to-transparent" />
                <img
                  className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1932"
                  alt="Course"
                />
              </div>

              {/* Text Content */}
              <div className="relative z-20 flex flex-1 flex-col justify-center bg-[#2A4362] p-6 md:p-10">
                <span className="mb-2 text-[10px] font-bold tracking-widest text-blue-300 uppercase sm:text-xs">
                  Recent Activity: {recentModuleData.bestScore}% Score
                </span>
                <h3 className="mb-2 text-2xl leading-tight font-bold sm:text-3xl">
                  {isModuleLoading ? 'Loading module...' : moduleDetails?.title}
                </h3>
                <p className="line-clamp-2 text-sm font-medium text-slate-300 sm:text-base">
                  {moduleDetails?.description ||
                    'Pick up where you left off to boost your readiness.'}
                </p>
                <div className="mt-6">
                  <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#2A4362] transition-colors hover:bg-blue-50 sm:text-base">
                    {recentModuleData.bestScore === 100
                      ? 'Review Module'
                      : 'Improve Score'}
                    <MdNavigateNext size={24} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <LuPlay size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#2A4362] sm:text-xl">
                No progress yet!
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Go to the Learning Center to start your first quiz and begin
                earning preparedness points.
              </p>
              <button
                onClick={() => navigate('/app/modules')}
                className="btn btn-sm sm:btn-md mt-6 bg-[#2A4362] text-white"
              >
                Browse Modules
              </button>
            </div>
          )}
        </section>

        {/* Community Posts */}
        <section>
          <h2 className="text-text-primary text-xl font-semibold sm:text-2xl">
            Community Posts
          </h2>
          <p className="text-text-secondary mb-4 text-sm">
            See how others are doing.
          </p>
          <div className="bg-bg-info bg-opacity-90 flex flex-col rounded-xl p-4 shadow-sm sm:p-6">
            <div className="divide-y divide-gray-300">
              {latestPosts.map((post) => (
                <div
                  key={post._id}
                  className="flex flex-row items-start justify-between gap-4 py-5"
                >
                  <div className="flex flex-1 flex-col">
                    <div className="mb-3 flex items-center gap-2 sm:gap-3">
                      <div className="avatar">
                        <div className="h-8 w-8 rounded-full ring ring-white sm:h-10 sm:w-10">
                          <img
                            src={post.author.userImage}
                            alt={post.author.name}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="line-clamp-1 text-xs font-bold text-[#2a4263] sm:text-sm">
                          {post.author.name}
                        </span>
                      </div>
                    </div>
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed font-medium text-[#2a4263] sm:text-sm">
                      {post.caption}
                    </p>
                    <button
                      onClick={() => setPostId(post._id)}
                      className="mt-auto flex items-center text-xs font-bold text-gray-500 hover:text-[#2a4263] sm:text-sm"
                    >
                      Learn More{' '}
                      <LuChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                  <div className="h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link
              to={paths.app['community-posts'].getHref()}
              className="link link-hover mt-4 text-center text-sm font-semibold"
            >
              Show more...
            </Link>
          </div>
        </section>
      </div>
      <PostCardModal
        isOpen={!!postId}
        post={selectedPost}
        onClose={() => setPostId(null)}
      />
    </div>
  );
}
