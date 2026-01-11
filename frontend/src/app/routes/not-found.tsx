import { LuFileQuestion, LuArrowLeft } from 'react-icons/lu';

import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';

export default function NotFoundRoute() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="flex max-w-md flex-col items-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
          <LuFileQuestion className="h-10 w-10 text-[#2a4263]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2a4263]">
            Page Not Found
          </h1>
          <p className="text-gray-500">
            Sorry, we couldn’t find the page you’re looking for. It might have
            been removed or the link may be incorrect.
          </p>
        </div>

        <Link
          to={paths.home.getHref()}
          replace
          className="btn h-12 gap-2 rounded-xl border-none bg-[#2a4263] px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-[#1e3a5a] hover:shadow-lg active:scale-95"
        >
          <LuArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>

        <div className="pt-8 text-xs text-gray-400">
          <p>Error Code: 404</p>
        </div>
      </div>
    </div>
  );
}
