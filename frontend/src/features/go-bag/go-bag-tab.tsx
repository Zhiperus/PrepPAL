import React, { useState } from 'react';

import { useBag } from './api/get-bag-items';

export function YourGoBag() {
  const { progressValue, bagImage } = useBag();
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  return (
    <div className="p-10 space-y-10 flex flex-col items-center max-w-md mx-auto">
      <div className="w-full max-w-xs">
        <div className="text-text-primary text-m font-medium mb-2 text-center"> 
          Go-Bag Completion ({progressValue}%)
        </div>
        <progress className="progress w-full" value={progressValue} max="100" />
      </div>

      <div className="w-full max-w-xs relative overflow-hidden rounded-xl h-48 bg-gray-100 shadow-inner">
        {(!bagImage || !isImgLoaded) && (
          <div className="skeleton absolute inset-0 w-full h-full" />
        )}
        
        {bagImage && (
          <img 
            src={bagImage} 
            alt="Go-Bag" 
            onLoad={() => setIsImgLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              isImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <button 
        className="bg-btn-primary hover:bg-btn-primary-hover disabled:bg-btn-primary-disabled flex cursor-pointer justify-center rounded-md px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors w-full max-w-xs"
        onClick={() => console.log('Open modal here later')}
      >
        Update Go-Bag
      </button>
      
    </div>
  );
}