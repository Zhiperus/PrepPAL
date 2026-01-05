import type { User } from '@repo/shared/dist/schemas/user.schema';
import { useState } from "react";
import { FaLocationDot, FaThumbsUp } from "react-icons/fa6";
import { LuChevronRight } from "react-icons/lu";
import { MdNavigateNext } from "react-icons/md";

import { useInfiniteFeed } from '@/features/community-posts/api/get-posts';
import PostCardModal from "@/features/community-posts/components/post-card";
import { timeAgo } from '@/utils/dateUtil';

type ProfileHeaderProps = {
  user: User & { rank?: number };
};

export function UserDashboard({ user }: ProfileHeaderProps) {
    const [postId, setPostId] = useState<string | null>(null);

    const { data, isLoading } = useInfiniteFeed({
        sort: 'newest',
        search: '',
    });

    const latestPosts = data?.pages.flatMap((page) => page.data).slice(0, 3) || [];
    const selectedPost = data?.pages
    .flatMap((page) => page.data)
    .find((post) => post._id === postId);

    return (
        <div className="p-15">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold text-text-primary tracking-tight mb-2">
                    Hello, {user.householdName}.
                </h1>

                <div className="flex flex-row items-center gap-2 text-gray-600 font-medium text-sm sm:text-base">
                    <FaLocationDot className="w-4 h-4 text-text-primary" />

                    <span className="text-text-secondary">
                        Brgy. {user.location?.barangay}, {user.location?.city}, {user.location?.province}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Progress Tracker */}
                <div>
                    <h2 className="text-2xl font-semibold text-text-primary">Current Progress</h2>
                    <span className="text-text-sceondary">Track your disaster preparedness levels.</span>
                    <div className="flex flex-row items-center gap-8">
                        <div className="flex flex-col items-center gap-2 mt-6">
                            <div
                                className="radial-progress text-[#2a4263] font-bold"
                                style={{
                                    "--value": 85,
                                    "--size": "6.5rem",
                                    "--thickness": "0.8rem",
                                } as React.CSSProperties}
                                role="progressbar"
                                aria-valuenow={85}
                            >
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <FaThumbsUp className="w-6 h-6" />
                                    <span className="text-xl">85%</span>
                                </div>
                            </div>
                            <span className="text-gray-500 font-medium text-sm">Preparedness</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-5">

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-gray-800 text-sm">Go-Bag Preparation</span>
                                    <span className="font-extrabold text-[#2a4263] text-sm">93%</span>
                                </div>
                                <progress
                                    className="progress w-full h-3 border border-gray-200 bg-gray-100 [&::-webkit-progress-value]:bg-[#2a4263] [&::-moz-progress-bar]:bg-[#2a4263]"
                                    value="93"
                                    max="100"
                                ></progress>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-gray-800 text-sm">DRR Courses</span>
                                    <span className="font-extrabold text-[#2a4263] text-sm">24%</span>
                                </div>
                                <progress
                                    className="progress w-full h-3 border border-gray-200 bg-gray-100 [&::-webkit-progress-value]:bg-[#2a4263] [&::-moz-progress-bar]:bg-[#2a4263]"
                                    value="24"
                                    max="100"
                                ></progress>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Courses */}
                <div>
                    <h2 className="text-2xl font-semibold text-text-primary">Continue on Courses</h2>
                    <span className="text-text-secondary">Learn more from modules.</span>
                    <div className="card card-side bg-bg-info bg-opacity-90 shadow-sm mt-1">
                        <figure className="p-2">
                            <img className="rounded-xl"
                                src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
                                alt="Movie" />
                        </figure>
                        <div className="card-body">
                            <p className="text-text-placeholder">Last Viewed</p>
                            <h2 className="card-title text-text-primary">Disaster Preparedness Floods</h2>
                            <p className="text-text-secondary">by NDRRMC</p>
                            <div className="card-actions justify-end">
                                <button className="btn bg-btn-primary"><MdNavigateNext className="text-white text-xl" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community Posts */}
                <div>
                    <h2 className="text-2xl font-semibold text-text-primary">Community Posts</h2>
                    <span className="text-text-secondary">See how others are doing.</span>
                    <div className="flex flex-col rounded-lg p-5 bg-bg-info bg-opacity-90 shadow-sm mt-1">
                        <div>
                            {latestPosts.map((post, index) => (
                                <div
                                    key={post._id}
                                    className={`flex justify-between items-start py-5 ${index !== latestPosts.length - 1 ? "border-b border-gray-400" : ""
                                        }`}
                                >
                                    <div className="flex flex-col mr-4 flex-1">

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="avatar">
                                                <div className="w-10 h-10 rounded-full ring ring-offset-1 ring-white">
                                                    <img src={post.author.userImage} alt={post.author.name} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#2a4263] text-sm leading-none">
                                                    {post.author.name}
                                                </span>
                                                <span className="text-gray-400 text-xs mt-1">
                                                    {' '}
                                                    {timeAgo(
                                                        typeof post.createdAt === 'string'
                                                            ? post.createdAt
                                                            : post.createdAt.toISOString(),
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[#2a4263] font-medium text-sm mb-2 leading-snug line-clamp-2">
                                            {post.caption}
                                        </p>

                                        <button className="flex items-center text-gray-500 hover:text-[#2a4263] text-sm font-bold transition-colors mt-auto"
                                                onClick={() => setPostId(post._id)}>
                                            Learn More<LuChevronRight className="ml-1 w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="h-24 w-24 shrink-0">
                                        <img
                                            src={post.imageUrl}
                                            alt="Post"
                                            className="h-full w-full object-cover rounded-xl shadow-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a className="link link-hover items-center justify-center" href="\app\community-posts"> Show more...</a>
                    </div>
                </div>
            </div>
            <PostCardModal
                    isOpen={!!postId}
                    post={selectedPost}
                    onClose={() => setPostId(null)}
                  />
        </div>
    )
}