import { useState, useEffect, useMemo } from 'react';

import { api } from '@/lib/api-client';
import { MOCK_GOBAG_RESPONSE } from '@/lib/mockData'; 

export type BagItem = {
  itemId: string;   
  name: string;    
  category: string; 
  isPacked: boolean; 
};

export const useBag = () => {
  const [items, setItems] = useState<BagItem[]>([]);
  const [bagImage, setBagImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBagData = async () => {
    //   const response = await api.get('/go-bag');
      const response = { data: MOCK_GOBAG_RESPONSE };
      
      setItems(response.data.items || []);

      // @ts-expect-error: temporary mock data mismatch
      setBagImage(response.data.image || null);
    };

    fetchBagData();
  }, []);

  const progressValue = useMemo(() => {
    if (items.length === 0) return 0;
    const completed = items.filter((i) => i.isPacked).length;
    return Math.round((completed / items.length) * 100);
  }, [items]);

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, isPacked: !item.isPacked } : item
      )
    );
  };

  return { items, progressValue, toggleItem, bagImage };
};