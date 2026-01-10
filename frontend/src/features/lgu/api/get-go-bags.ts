import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

// Re-using the types you defined in your UI
export interface GoBagItem {
  _id: string;
  name: string;
  category: string;
  defaultQuantity: number;
}

export interface User {
  _id: string;
  householdName: string;
  email: string;
  phoneNumber: string;
  location: {
    barangay: string;
    city: string;
  };
  householdInfo: {
    memberCount: number;
    pets: number;
    femaleCount: number;
  };
  points: {
    goBag: number;
  };
  profileImage: string | null;
}

export interface PopulatedGoBag {
  _id: string;
  userId: User;
  imageUrl: string;
  items: GoBagItem[];
  lastUpdated: string;
  completeness: number;
}

export const getResidentGoBags = ({
  lguId,
}: {
  lguId: string;
}): Promise<PopulatedGoBag[]> => {
  return api.get('/lgu/go-bags', {
    params: { lguId },
  });
};

export const useResidentGoBags = (lguId: string) => {
  return useQuery({
    queryKey: ['lgu-resident-go-bags', lguId],
    queryFn: () => getResidentGoBags({ lguId }),
    enabled: !!lguId,
  });
};
