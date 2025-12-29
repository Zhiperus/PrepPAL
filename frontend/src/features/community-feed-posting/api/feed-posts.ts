import { useQuery } from '@tanstack/react-query';

import { MOCK_FEED_RESPONSE } from '@/lib/mockData';

// Used for mock data
const getFeed = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Fake delay
    return MOCK_FEED_RESPONSE;
};

// Use this function for api calling
export const useFeedPosts = () => {
    return useQuery({
        queryKey: ['feed'], 
        queryFn: getFeed,
    });
};