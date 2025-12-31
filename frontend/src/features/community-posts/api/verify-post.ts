import type { VerifyPostRequest } from '@repo/shared/dist/schemas/post.schema';
import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

export const verifyPost = ({ postId, verifiedItemIds }: VerifyPostRequest) => {
  return api.post(`/posts/${postId}/verify`, { verifiedItemIds });
};

type UseVerifyPostOptions = {
  mutationConfig?: MutationConfig<typeof verifyPost>;
};

export const useVerifyPost = ({
  mutationConfig,
}: UseVerifyPostOptions = {}) => {
  // const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: verifyPost,
  });
};
