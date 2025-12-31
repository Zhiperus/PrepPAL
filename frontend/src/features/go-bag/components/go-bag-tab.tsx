import { useState } from 'react';
import { LuImageOff, LuRefreshCw, LuSend } from 'react-icons/lu';

import { useGoBag } from '../api/get-go-bag';

import PostBagModal from './post-go-bag-modal';
import UpdateGoBagModal from './update-go-bag-modal';

export default function YourGoBag() {
  const { data, isLoading } = useGoBag();
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  // State for modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const progressValue = data?.completeness || 0;
  const bagImage = data?.imageUrl || null;

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center space-y-10 p-10">
        <div className="w-full max-w-xs space-y-2">
          <div className="skeleton mx-auto h-4 w-32 rounded"></div>
          <div className="skeleton h-4 w-full rounded-full"></div>
        </div>
        <div className="skeleton h-48 w-full max-w-xs rounded-xl"></div>
        <div className="skeleton h-10 w-full max-w-xs rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center space-y-10 p-10">
      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="text-text-primary text-m mb-2 text-center font-medium">
          Go-Bag Completion ({progressValue}%)
        </div>
        <progress className="progress w-full" value={progressValue} max="100" />
      </div>

      {/* Image Container */}
      <div className="relative h-48 w-full max-w-xs overflow-hidden rounded-xl bg-gray-100 shadow-inner">
        {!bagImage && (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <LuImageOff className="mb-2 h-8 w-8 opacity-50" />
            <span className="text-sm font-medium">No Go Bag Yet</span>
          </div>
        )}

        {bagImage && (
          <>
            {!isImgLoaded && (
              <div className="skeleton absolute inset-0 h-full w-full" />
            )}
            <img
              src={bagImage}
              alt="Go-Bag"
              onLoad={() => setIsImgLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-500 ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        {/* Update Button */}
        <button
          className="group flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-[#2a4263] hover:text-[#2a4263] active:bg-gray-50 disabled:opacity-50"
          onClick={() => setIsUpdateModalOpen(true)}
        >
          <LuRefreshCw className="h-4 w-4 text-gray-500 transition-colors group-hover:text-[#2a4263]" />
          Update Go-Bag
        </button>

        <button
          className="flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2a4263] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1f324b] hover:shadow-md active:translate-y-[1px] disabled:opacity-50"
          onClick={() => setIsPostModalOpen(true)}
          disabled={!bagImage || progressValue === 0} // Optional: Disable if empty
        >
          <LuSend className="h-4 w-4" />
          Post Your Go-Bag
        </button>
      </div>

      {/* Render Modals */}
      {isUpdateModalOpen && (
        <UpdateGoBagModal onClose={() => setIsUpdateModalOpen(false)} />
      )}

      {isPostModalOpen && (
        <PostBagModal
          onClose={() => setIsPostModalOpen(false)}
          bagImage={bagImage}
          completeness={progressValue}
        />
      )}
    </div>
  );
}
