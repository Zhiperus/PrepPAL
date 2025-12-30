import { useState } from 'react';
import { LuImageOff } from 'react-icons/lu';

import { useGoBag } from './api/get-go-bag';

export function YourGoBag() {
  const { data, isLoading } = useGoBag();
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const progressValue = data?.completeness || 0;
  const bagImage = data?.imageUrl;

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center space-y-10 p-10">
        {/* Progress Skeleton */}
        <div className="w-full max-w-xs space-y-2">
          <div className="skeleton mx-auto h-4 w-32 rounded"></div>
          <div className="skeleton h-4 w-full rounded-full"></div>
        </div>

        {/* Image Skeleton */}
        <div className="skeleton h-48 w-full max-w-xs rounded-xl"></div>

        {/* Button Skeleton */}
        <div className="skeleton h-10 w-full max-w-xs rounded-md"></div>
      </div>
    );
  }

  // 2. LOADED STATE
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
        {/* CASE A: No Image Uploaded Yet */}
        {!bagImage && (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <LuImageOff className="mb-2 h-8 w-8 opacity-50" />
            <span className="text-sm font-medium">No Go Bag Yet</span>
          </div>
        )}

        {/* CASE B: Image Exists */}
        {bagImage && (
          <>
            {/* Show skeleton ONLY while the specific image file is downloading */}
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

      <button
        className="bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disabled flex w-full max-w-xs cursor-pointer justify-center rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors"
        onClick={() => console.log('Open modal here later')}
      >
        Update Go-Bag
      </button>
    </div>
  );
}

