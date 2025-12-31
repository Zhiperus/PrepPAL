import type { Post } from '@repo/shared/dist/schemas/post.schema';
import { useMemo } from 'react';
import {
  FaCheckCircle,
  FaUtensils,
  FaTint,
  FaPumpSoap,
  FaMedkit,
  FaTools,
  FaMobileAlt,
  FaTshirt,
  FaFileAlt,
  FaQuestionCircle,
} from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  food: {
    label: 'Food & Nutrition',
    icon: FaUtensils,
    color: 'text-orange-500',
  },
  water: { label: 'Water & Hydration', icon: FaTint, color: 'text-blue-500' },
  hygiene: {
    label: 'Hygiene & Sanitation',
    icon: FaPumpSoap,
    color: 'text-teal-500',
  },
  'first-aid': {
    label: 'First Aid & Meds',
    icon: FaMedkit,
    color: 'text-red-500',
  },
  tools: { label: 'Tools & Gear', icon: FaTools, color: 'text-gray-600' },
  tech: { label: 'Electronics', icon: FaMobileAlt, color: 'text-indigo-500' },
  clothing: { label: 'Clothing', icon: FaTshirt, color: 'text-purple-500' },
  documents: {
    label: 'Important Docs',
    icon: FaFileAlt,
    color: 'text-yellow-600',
  },
  other: {
    label: 'Miscellaneous',
    icon: FaQuestionCircle,
    color: 'text-gray-400',
  },
};

const CATEGORY_ORDER = [
  'water',
  'food',
  'first-aid',
  'hygiene',
  'tools',
  'tech',
  'clothing',
  'documents',
  'other',
];

export default function PostDetailModal({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const groupedItems = useMemo(() => {
    if (!post.bagSnapshot) return {};

    const groups: Record<string, typeof post.bagSnapshot> = {};

    post.bagSnapshot.forEach((item) => {
      const category = (item as any).category || 'other';

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [post.bagSnapshot]);

  const hasItems = post.bagSnapshot && post.bagSnapshot.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="bg-bg-page animate-in fade-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl duration-200">
        <div className="border-border-container flex items-center justify-between border-b bg-white px-4 py-3">
          <h2 className="font-semibold text-gray-800">Bag Audit Log</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <IoMdClose className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-0">
          {/* Large Image View */}
          {post.imageUrl && (
            <div className="relative aspect-video w-full bg-gray-100">
              <img
                src={post.imageUrl}
                className="absolute inset-0 h-full w-full object-cover"
                alt="Full view"
              />
            </div>
          )}

          <div className="space-y-6 p-5">
            {/* Full Caption */}
            {post.caption && (
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  Notes
                </span>
                <p className="leading-relaxed text-gray-700">{post.caption}</p>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiPackage className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">
                  Items in bag ({post.bagSnapshot?.length || 0})
                </span>
              </div>

              {hasItems ? (
                <div className="space-y-4">
                  {CATEGORY_ORDER.map((catKey) => {
                    const items = groupedItems[catKey];
                    // If no items for this category, skip rendering
                    if (!items || items.length === 0) return null;

                    const config =
                      CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG['other'];
                    const Icon = config.icon;

                    return (
                      <div
                        key={catKey}
                        className="border-border-container bg-bg-primary overflow-hidden rounded-xl border"
                      >
                        {/* Category Header */}
                        <div className="border-border-container flex items-center gap-2 border-b bg-gray-50 px-3 py-2">
                          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                          <h4 className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                            {config.label}
                          </h4>
                        </div>

                        {/* Items in this Category */}
                        <div className="divide-y divide-gray-100">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50/50"
                            >
                              <div className="flex items-center gap-3">
                                <FaCheckCircle className="h-4 w-4 shrink-0 text-green-500/50" />
                                <span className="font-medium text-gray-700">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <p className="text-sm text-gray-400 italic">
                    No items recorded for this update.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
