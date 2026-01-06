import React, { useState, type ChangeEvent, useEffect } from 'react';
import { LuSearch, LuArrowLeft } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import { useSearchFilter } from '../api/use-search-filter';

const TOP_SEARCHES: string[] = ['Fire', 'Earthquake', 'Evacuation', 'Go-bag'];

export function SearchModule(): React.JSX.Element {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { query, setQuery, filteredItems } = useSearchFilter(TOP_SEARCHES);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) setQuery(urlQuery);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val ? { q: val } : {}, { replace: true });
  };

  const handleSelection = (item: string) => {
    setQuery(item);
    setSearchParams({ q: item }, { replace: true });
    setIsFocused(false);
  };

  return (
    <div className="bg-base-200/95 border-base-300/50 fixed inset-x-0 top-15 z-30 mx-auto w-full max-w-lg border-b px-4 py-3 backdrop-blur-sm">
      <div className="flex w-full items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="btn btn-ghost btn-circle btn-sm hover:bg-base-300 text-text-primary shrink-0"
        >
          <LuArrowLeft className="h-6 w-6" />
        </button>

        <div className="relative flex-1">
          <label className="input input-bordered focus-within:ring-btn-primary focus-within:border-btn-primary border-base-300 flex w-full items-center gap-3 rounded-lg border bg-white p-2 shadow-sm transition-all focus-within:ring-1 focus-within:outline-none">
            <LuSearch className="h-4 w-4 text-slate-500 opacity-50" />
            <input
              type="search"
              className="w-full grow bg-transparent text-sm text-slate-900 outline-none"
              placeholder="Search modules..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </label>

          {isFocused && (
            <div className="animate-in fade-in slide-in-from-top-1 absolute top-[calc(100%+8px)] left-0 z-50 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl duration-200">
              {!query && (
                <div className="border-b border-slate-50 px-4 py-3">
                  <span className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Top Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TOP_SEARCHES.map((tag) => (
                      <button
                        key={tag}
                        onMouseDown={() => handleSelection(tag)}
                        className="hover:bg-btn-primary rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600 transition-colors hover:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50/50 px-4 py-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {query ? 'Search Results' : 'Suggested'}
              </div>

              <ul className="max-h-60 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <li
                      key={item}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                      onMouseDown={() => handleSelection(item)}
                    >
                      <LuSearch className="h-3 w-3 opacity-30" />
                      {item}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-sm text-slate-400 italic">
                    No results for &quot;{query}&quot;
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

