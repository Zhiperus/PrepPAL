import type { ReactNode } from 'react';
import { use, useState } from 'react';

import { useFeedPosts } from '../api/feed-posts';

import { PostCardModal } from './post-card';

import { timeAgo } from '@/utils/dateUtil';

export function CommunityFeedLayout() {
  const { data: posts, isLoading } = useFeedPosts();

  const [postId, setPostId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('newest');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const sortedPosts = [...(posts || [])].sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === 'popular') {
        return (b.verificationCount || 0) - (a.verificationCount || 0);
      }
      return 0;
    });

  return (
    <div className='bg-base-200 min-h-screen flex flex-col items-center space-y-4 > *'>
      
      {/* Header */}
      <div className="flex flex-col items-center w-full max-w-lg px-4">
        
        <h1 className='mb-8 text-3xl font-bold text-[#2a4263] tracking-tight'>
          Community Posts
        </h1>

        <div className='flex w-full items-center gap-3 mb-6'>
          
          {/* Search Bar*/}
          <label className="input input-bordered flex items-center gap-3 flex-1 shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-[#2a4263] focus-within:border-transparent transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-50">
                <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
              </svg>
              <input type="search" className="grow text-sm" required placeholder="Search updates..." />
          </label>

          {/* 2. Sort Button*/}
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-square btn-outline border-base-300 bg-base-100 hover:bg-base-200 hover:border-base-400 shadow-sm text-gray-600"
              title="Sort Feed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </div>
            
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-lg border border-base-200 mt-2">
              <li><a onClick={() => setSortOption('newest')} className={sortOption === 'newest' ? 'active' : ''}>Newest</a></li>
              <li><a onClick={() => setSortOption('oldest')} className={sortOption === 'oldest' ? 'active' : ''}>Oldest</a></li>
              <li><a onClick={() => setSortOption('popular')} className={sortOption === 'popular' ? 'active' : ''}>Popular</a></li>
            </ul>
          </div>

        </div>
      </div>


      <div className="w-full max-w-lg space-y-6 px-4">
        {/* Post Cards */}
        {sortedPosts.map((post) => (
          <div key={post.id} className="card bg-base-100 w-full shadow-xl overflow-hidden">
            
             {/* User Info */}
            <div className='flex items-center p-4 gap-3'>
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring ring-offset-2 ring-[#2a4263]">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{post.author.name}</span>
                <span className="text-xs text-gray-500">Rank #{post.author.rank}</span>
              </div>
            </div>
            {/* Go Bag Picture */}
            <figure className="w-full">
              <img
                src={post.imageUrl} 
                alt="Community Post" 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </figure>

            {/* Caption*/}
            <div className="card-body p-4 pt-3">
               <p className="text-gray-700">
                 <span className="font-bold mr-2">{post.author.name}</span>
                 {post.caption}
               </p>
               <p className="text-text-placeholder mb-4 text-xs">
                  Posted {timeAgo(post.createdAt)}
               </p>
                {/* Rate Button */}
                <div className='card-actions justify-center'>
                    <button onClick={() => setPostId(post.id)} className="btn btn-soft bg-btn-primary hover:shadow-md mt-4 w-64 gap-2 rounded text-white">
                        Rate
                    </button>
                </div>
            </div>
            
            <PostCardModal
            isOpen={!!postId}           
            postId={postId}           
            onClose={() => setPostId(null)}/>
          </div>
        ))}
      </div>

    </div>
  );
}