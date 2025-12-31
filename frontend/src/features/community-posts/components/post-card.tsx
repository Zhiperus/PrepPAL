import type {
  FeedPost,
  SnapshotItem,
} from '@repo/shared/dist/schemas/post.schema';
import { useState, useEffect, useMemo } from 'react';

import { useVerifyPost } from '../api/verify-post';

import Toast from '@/components/ui/toast/toast';
import { timeAgo } from '@/utils/dateUtil';

interface PostCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: FeedPost;
}

export default function PostCardModal({
  isOpen,
  onClose,
  post,
}: PostCardModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Local Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const verifyMutation = useVerifyPost({
    mutationConfig: {
      onSuccess: () => {
        setToast({
          show: true,
          message: `Verification success! Author awarded points.`,
          type: 'success',
        });

        // Delay closing slightly so user sees success
        setTimeout(() => {
          onClose();
          setToast((prev) => ({ ...prev, show: false }));
        }, 2000);
      },
      onError: (error: any) => {
        setToast({
          show: true,
          message: error?.response?.data?.message || 'Failed to verify post',
          type: 'error',
        });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCheckedItems(new Set());
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, post]);

  const toggleItem = (itemId: string) => {
    const next = new Set(checkedItems);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setCheckedItems(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    verifyMutation.mutate({
      postId: post._id,
      verifiedItemIds: Array.from(checkedItems),
    });
  };

  const groupedItems = useMemo(() => {
    if (!post?.bagSnapshot) return {};

    return post.bagSnapshot.reduce(
      (acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, SnapshotItem[]>,
    );
  }, [post]);

  if (!isOpen || !post) return null;

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      {/* Toast Notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="modal-box flex h-[90vh] w-11/12 max-w-6xl flex-col overflow-hidden bg-white p-0 lg:flex-row">
        <div className="relative flex min-h-[300px] w-full items-center justify-center bg-black lg:min-h-full lg:w-3/5">
          <img
            src={post.imageUrl}
            alt="Go Bag Image"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="relative flex h-full w-full flex-col lg:w-2/5">
          <div className="z-10 flex shrink-0 items-center gap-3 border-b bg-white p-4 shadow-sm">
            <div className="avatar">
              <div className="h-10 w-10 rounded-full ring ring-[#2a4263] ring-offset-2">
                <img src={post.author.userImage} alt={post.author.name} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{post.author.name}</h3>
              <p className="text-xs text-gray-500">Rank #{post.author.rank}</p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost ml-auto"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              <span className="mr-2 font-bold text-gray-900">
                {post.author.name}
              </span>
              {post.caption}
            </p>
            <p className="mb-4 text-xs text-gray-400">
              Posted{' '}
              {timeAgo(
                typeof post.createdAt === 'string'
                  ? post.createdAt
                  : new Date(post.createdAt).toISOString(),
              )}
            </p>

            {/* Checklist Loop */}
            <div className="space-y-4">
              <div className="divider text-xs tracking-widest text-gray-400 uppercase">
                Verify Contents
              </div>

              {Object.entries(groupedItems).map(([category, items]) => (
                <div
                  key={category}
                  className="card border border-gray-100 bg-white shadow-sm"
                >
                  <div className="card-body p-3">
                    <h4 className="card-title mb-2 text-xs font-bold tracking-wider text-[#2a4263] uppercase">
                      {category}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {items.map((item) => (
                        <label
                          key={item.itemId}
                          className="label hover:bg-base-100 cursor-pointer justify-start gap-3 rounded p-1 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={checkedItems.has(item.itemId)}
                            onChange={() => toggleItem(item.itemId)}
                          />
                          <span
                            className={`label-text text-xs leading-tight ${
                              checkedItems.has(item.itemId)
                                ? 'font-semibold text-gray-800'
                                : 'text-gray-500'
                            }`}
                          >
                            {item.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              className="btn w-full bg-[#2a4263] text-white hover:bg-[#1f304a]"
              onClick={handleSubmit}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Confirm Verification'
              )}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
}
