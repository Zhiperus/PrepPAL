import { useEffect, useState } from 'react';
import { LuArrowUpDown, LuSearch } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import { type SortOption } from '@/features/community-posts/api/get-posts';
import { useDebounce } from '@/hooks/use-debounce';

export function FeedHeader() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(initialSearch);

  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (debouncedSearch) {
        newParams.set('search', debouncedSearch);
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
  }, [debouncedSearch, setSearchParams]);

  const handleSortChange = (newSort: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', newSort);
      return newParams;
    });
  };

  const currentSort = (searchParams.get('sort') as SortOption) || 'newest';

  return (
    <div className="bg-base-200/95 sticky top-0 z-30 w-full max-w-lg px-4 py-3 backdrop-blur-sm transition-all">
      <div className="flex w-full max-w-lg flex-col items-center px-4 pt-6">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[#2a4263]">
          Community Posts
        </h1>
      </div>
      <div className="flex w-full items-center gap-3">
        <label className="input input-bordered flex flex-1 items-center gap-3 shadow-sm transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#2a4263] focus-within:outline-none">
          <LuSearch className="h-4 w-4 opacity-50" />
          <input
            type="search"
            className="grow text-sm"
            placeholder="Search items or captions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </label>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-square btn-outline border-base-300 bg-base-100 hover:border-base-400 hover:bg-base-200 text-gray-600 shadow-sm"
            title="Sort Feed"
          >
            <LuArrowUpDown className="h-5 w-5" />
          </div>

          <ul
            tabIndex={0}
            className="menu dropdown-content rounded-box border-base-200 bg-base-100 z-[1] mt-2 w-40 border p-2 shadow-lg"
          >
            {['newest', 'oldest', 'popular'].map((option) => (
              <li key={option}>
                <a
                  onClick={() => handleSortChange(option)}
                  className={currentSort === option ? 'active font-bold' : ''}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
