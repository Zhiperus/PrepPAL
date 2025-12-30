import { useState, useEffect } from 'react';

import { GO_BAG_CATEGORIES } from '@/lib/checklist';
import { MOCK_FEED_RESPONSE } from '@/lib/mockData';
import { timeAgo } from '@/utils/dateUtil';


interface PostCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export function PostCardModal({ isOpen, onClose, postId }: PostCardModalProps) {
  const post = MOCK_FEED_RESPONSE.find((p) => p.id === postId);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Reset state when a new post is opened
  useEffect(() => {
    setCheckedItems(new Set());
  }, [postId]);

  if (!isOpen || !post) return null;

  const toggleItem = (item: string) => {
    const next = new Set(checkedItems);
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
    }
    setCheckedItems(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verified Items:", Array.from(checkedItems));
    onClose();
  };
  
  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-6xl p-0 overflow-hidden flex flex-col lg:flex-row bg-white h-[90vh]">

        {/* Go Bag Pic*/}
        <div className="w-full lg:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] lg:min-h-full">
          <img
            src={post.imageUrl}
            alt="Go Bag Image"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Post Info*/}
        <div className="w-full lg:w-2/5 flex flex-col h-full">
          {/* Author Info */}
          <div className="p-4 border-b flex items-center gap-3 bg-white shrink-0 z-10">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full ring ring-offset-2 ring-[#2a4263]">
                <img src={post.author.avatarUrl} alt={post.author.name} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{post.author.name}</h3>
              <p className="text-xs text-gray-500">Rank #{post.author.rank}</p>
            </div>
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost ml-auto">✕</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <p className="text-text-secondary mb-4 text-sm leading-relaxed">
               <span className="font-bold mr-2 text-gray-900">{post.author.name}</span>
               {post.caption}
            </p>
            <p className="text-text-placeholder mb-4 text-xs">
                  Posted {timeAgo(post.createdAt)}
               </p>
            <div className="bg-base-200 rounded-lg p-3 text-xs mb-6 border border-base-300">
                <span className="font-bold text-gray-500 uppercase tracking-wide">Go Bag Items:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                    {post.bagSnapshot.map(item => (
                        <span key={item.itemId} className="badge badge-sm badge-outline bg-white">{item.name}</span>
                    ))}
                </div>
            </div>

            {/* Go Bag Checklist */}
            <div className="space-y-4">
                <div className="divider text-xs text-gray-400 uppercase tracking-widest">Go Bag Checklist</div>
                
                {GO_BAG_CATEGORIES.map((category) => (
                    <div key={category.title} className="card bg-white shadow-sm border border-gray-100">
                        <div className="card-body p-3">
                            <h4 className="card-title text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                                {category.title}
                            </h4>
                            <div className="flex flex-col gap-2">
                                {category.items.map((item) => (
                                    <label key={item} className="cursor-pointer label justify-start gap-3 p-1 hover:bg-base-100 rounded transition-colors">
                                        <input 
                                            type="checkbox" 
                                            className="checkbox checkbox-sm checkbox-btn-primary"
                                            checked={checkedItems.has(item)}
                                            onChange={() => toggleItem(item)}
                                        />
                                        <span className={`label-text text-xs leading-tight ${checkedItems.has(item) ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="p-4 border-t bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button className="btn bg-btn-primary hover:shadow-md w-full text-white" onClick={handleSubmit}>
                Submit Checklist
            </button>
          </div>

        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}