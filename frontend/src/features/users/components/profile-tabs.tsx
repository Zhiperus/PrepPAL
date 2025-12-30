import { useState } from 'react';

import { YourGoBag } from '@/features/go-bag/go-bag-tab';

function UserPostsList() {
  return <div className="p-4 text-center">Posts List Component</div>;
}

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<'posts' | 'gobag'>('posts');

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="bg-btn-primary flex items-center justify-between p-1.5">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 rounded-[10px] px-4 py-2 text-[18px] font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-bg-primary text-text-primary'
              : 'text-white'
          }`}
        >
          Your Posts
        </button>
        <button
          onClick={() => setActiveTab('gobag')}
          className={`flex-1 rounded-[10px] px-4 py-2 text-[18px] font-bold transition-all ${
            activeTab === 'gobag'
              ? 'bg-bg-primary text-text-primary'
              : 'text-white'
          }`}
        >
          Your Go Bag
        </button>
      </div>

      <div className="bg-bg-primary flex-1 overflow-y-auto">
        {activeTab === 'posts' ? <UserPostsList /> : <YourGoBag />}
      </div>
    </div>
  );
}
