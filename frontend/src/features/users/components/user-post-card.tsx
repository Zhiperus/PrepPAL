import type { Post } from '@repo/shared/dist/schemas/post.schema';
import { FiPackage } from 'react-icons/fi';
import { LuImageOff } from 'react-icons/lu';

export default function UserPostCard({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  let dateString = 'Unknown Date';
  try {
    dateString = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(post.createdAt));
  } catch (e) {
    console.error(e);
  }

  return (
    <article
      onClick={onClick}
      className="bg-bg-primary group border-border-container flex cursor-pointer items-start gap-4 overflow-hidden rounded-xl border p-3 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Thumbnail Image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="Update"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <LuImageOff className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1 py-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2A4263]">{dateString}</h3>

          {post.bagSnapshot && post.bagSnapshot.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
              <FiPackage className="h-3 w-3" />
              {post.bagSnapshot.length} items
            </span>
          )}
        </div>

        {post.caption ? (
          <p className="line-clamp-2 text-sm text-gray-600">{post.caption}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">No caption provided.</p>
        )}
      </div>
    </article>
  );
}
