import { useState } from 'react';

export function useSearchFilter(initialItems: string[]) {
  const [query, setQuery] = useState('');

  const filteredItems = initialItems.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );

  return { query, setQuery, filteredItems };
}
