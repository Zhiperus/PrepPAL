import type { ReactNode } from 'react';
import { useState } from 'react';

import { PostCardModal } from './post-card';

import { MOCK_FEED_RESPONSE } from '@/lib/mockData';


export function CommunityFeedLayout() {
  const posts = MOCK_FEED_RESPONSE;

  const [postId, setPostId] = useState<string | null>(null);

  return (
    <div className='bg-base-200 min-h-screen flex flex-col items-center space-y-4 > *'>
      
      <h1 className='mb-6 text-3xl font-bold text-[#2a4263]'>Community Posts</h1>

        <label className="input">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
                >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
                </g>
            </svg>
            <input type="search" required placeholder="Search" />
        </label>

      <div className="w-full max-w-lg space-y-6 px-4">
        
        {/* Post Cards */}
        {posts.map((post) => (
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
                {/* Rate Button */}
                <div className='card-actions justify-center'>
                    <button onClick={() => setPostId(post.id)} className="btn btn-soft bg-btn-primary mt-4 w-64 gap-2 rounded text-white">
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