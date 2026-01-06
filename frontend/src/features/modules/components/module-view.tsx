import { GoArrowLeft } from 'react-icons/go';
import { useNavigate, useParams } from 'react-router';

import { paths } from '@/config/paths';
import { useModule } from '@/features/modules/api/get-module';

export default function ModuleView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useModule({
    moduleId: moduleId!,
    queryConfig: { enabled: !!moduleId },
  });
  const module = data?.data;

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (!module) return <div className="p-10 text-center">Module not found</div>;

  return (
    <div className="relative mx-auto w-full max-w-4xl space-y-6 p-4 pb-12 md:p-8">
      <div className="sticky top-0 flex items-center justify-center gap-4 pt-10 lg:static lg:justify-normal lg:pt-0">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2 rounded-2xl bg-gray-50 p-5 text-slate-500 hover:bg-transparent hover:text-slate-800"
        >
          <GoArrowLeft className="h-5 w-5" />
          <span className="text-base font-normal">Back to Modules</span>
        </button>
      </div>

      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          {/* This will be commented for now and will be implemented once the module creator is finished */}
          {/* <span className="text-3xl">{module.logo}</span> */}
          <h1 className="text-2xl leading-tight font-bold text-slate-900 md:text-3xl">
            {module.title}
          </h1>
        </div>
        <p className="mt-2 text-lg font-medium text-slate-500">
          {module.description}
        </p>
      </div>

      <div className="space-y-12">
        {module.content.map((block, index) => (
          <div
            key={index}
            className="flex flex-col gap-6 md:flex-row md:items-start"
          >
            {block.imageUrl && (
              <div className="w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm md:w-2/5">
                <img
                  src={block.imageUrl}
                  alt={`Illustration for section ${index + 1}`}
                  className="h-64 w-full object-cover md:h-full"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div className="prose prose-slate max-w-none text-justify text-base leading-relaxed text-slate-600 md:text-lg">
                <p>{block.text}</p>
              </div>

              {block.reference && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Source:</span>{' '}
                  {block.referenceUrl ? (
                    <a
                      href={block.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {block.reference}
                    </a>
                  ) : (
                    <span className="italic">{block.reference}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => navigate(paths.app.quiz.getHref(moduleId!))}
            className="btn btn-soft bg-btn-primary btn-lg hover:bg-btn-primary-hover w-full text-lg text-white shadow-lg hover:shadow-md md:w-auto md:px-12"
          >
            Test Your Knowledge
          </button>
        </div>
      </div>
    </div>
  );
}
