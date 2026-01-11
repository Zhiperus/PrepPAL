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
    <div className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pt-10 md:flex-row md:items-center md:justify-between lg:pt-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#2a4263]">
              Community Posts
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              See what others have prepared and rate their go bags.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <div className="relative max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LuSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-gray-300 bg-gray-100 py-3 pr-3 pl-10 text-sm shadow-sm transition-all focus:border-[#2a4263] focus:bg-white focus:ring-[#2a4263] focus:outline-none"
              placeholder="Search items or captions..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn h-[46px] gap-2 rounded-lg border-none bg-[#2a4263] text-white shadow-sm hover:bg-[#1e3a5a]"
              title="Sort Feed"
            >
              <LuArrowUpDown className="h-5 w-5" />
              <span className="hidden font-medium sm:inline">
                {currentSort.charAt(0).toUpperCase() + currentSort.slice(1)}
              </span>
            </div>

            <ul
              tabIndex={0}
              className="menu dropdown-content rounded-box z-[10] mt-2 w-40 border border-gray-100 bg-white p-2 shadow-xl"
            >
              {['newest', 'oldest', 'popular'].map((option) => (
                <li key={option}>
                  <a
                    onClick={() => handleSortChange(option)}
                    className={
                      currentSort === option
                        ? 'bg-[#2a4263] text-white focus:bg-[#2a4263] focus:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

