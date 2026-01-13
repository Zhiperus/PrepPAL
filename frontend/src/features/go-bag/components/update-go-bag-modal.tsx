import type { BagItem } from '@repo/shared/dist/schemas/goBag.schema';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { LuUpload, LuCheck, LuX } from 'react-icons/lu';

import { useGoBag } from '../api/get-go-bag';
import { useUpdateGoBag } from '../api/update-go-bag';

interface FormValues {
  packedIds: string[];
  image: File | null;
}

export default function UpdateGoBagModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useGoBag();
  const updateMutation = useUpdateGoBag();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      packedIds: [],
      image: null,
    },
  });

  const watchedPackedIds = watch('packedIds');
  const watchedImage = watch('image');

  useEffect(() => {
    if (data?.items) {
      const initialPacked = (data.items as BagItem[])
        .filter((item) => item.isPacked)
        .map((item) => item._id);

      reset({
        packedIds: initialPacked,
        image: null,
      });
    }
  }, [data, reset]);

  const groupedItems = useMemo(() => {
    if (!data?.items) return {};
    return (data.items as BagItem[]).reduce(
      (acc, item) => {
        const cat =
          item.category.charAt(0).toUpperCase() + item.category.slice(1);
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, BagItem[]>,
    );
  }, [data]);

  const onFormSubmit = (values: FormValues) => {
    updateMutation.mutate(
      {
        items: values.packedIds,
        image: values.image || undefined,
      },
      { onSuccess: onClose },
    );
  };

  if (isLoading) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
        {/* HEADER */}
        <div className="z-10 flex shrink-0 flex-col border-b border-gray-100 bg-white px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#2A4263]">
                Update Checklist
              </h3>
              <p className="text-sm text-gray-500">
                Check off items you have packed.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-circle btn-ghost btn-sm text-gray-400 hover:bg-gray-100"
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs font-bold tracking-wider text-gray-500 uppercase">
              <span>Current Status</span>
              <span
                className={
                  data?.completeness === 100
                    ? 'text-green-600'
                    : 'text-[#2A4263]'
                }
              >
                {data?.items?.length
                  ? Math.round(
                      (watchedPackedIds.length / data.items.length) * 100,
                    )
                  : 0}
                % Ready
              </span>
            </div>
            <progress
              className={`progress h-2 w-full ${data?.completeness === 100 ? 'progress-success' : 'progress-primary'}`}
              value={watchedPackedIds.length}
              max={data?.items?.length || 100}
            />
          </div>
        </div>

        {/* FORM CONTAINER */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 space-y-6 overflow-y-auto bg-gray-50 px-6 py-6">
            {/* 1. IMAGE UPLOAD SECTION */}
            <div
              className={`rounded-xl border-2 border-dashed p-5 transition-all duration-300 ${
                !watchedImage
                  ? 'border-orange-300 bg-orange-50/40' // Obvious warning state
                  : 'border-gray-300 bg-white' // Normal state
              }`}
            >
              <label className="label mb-3 p-0">
                <span className="label-text flex items-center gap-2 font-bold text-[#2A4263]">
                  <LuUpload className="h-4 w-4" />
                  Update Evidence Photo
                  {!watchedImage && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </span>
              </label>

              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setValue('image', file, { shouldDirty: true });
                      if (file) setPreviewUrl(URL.createObjectURL(file));
                    }}
                    className={`file-input file-input-bordered file-input-sm w-full max-w-xs bg-white text-xs ${
                      !watchedImage
                        ? 'file-input-warning'
                        : 'file-input-primary'
                    }`}
                  />
                  <div
                    className={`mt-2 text-xs font-medium ${!watchedImage ? 'text-orange-600' : 'text-gray-400'}`}
                  >
                    {!watchedImage
                      ? 'You must upload a new photo to verify these changes.'
                      : 'Photo attached successfully.'}
                  </div>
                </div>

                {(previewUrl || data?.imageUrl) && (
                  <div className="avatar">
                    <div
                      className={`h-16 w-16 overflow-hidden rounded-lg bg-gray-100 ring ring-offset-2 transition-all ${
                        !watchedImage ? 'ring-orange-200' : 'ring-gray-200'
                      }`}
                    >
                      <img
                        src={previewUrl || data?.imageUrl || ''}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. CATEGORIES ACCORDION */}
            <div className="flex flex-col gap-3">
              {Object.entries(groupedItems).map(([category, items], idx) => {
                const checkedCount = items.filter((i) =>
                  watchedPackedIds.includes(i._id),
                ).length;
                const isComplete =
                  checkedCount === items.length && items.length > 0;

                return (
                  <div
                    key={category}
                    className="collapse-arrow collapse rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <input type="checkbox" defaultChecked={idx === 0} />
                    <div className="collapse-title flex items-center gap-3 py-4 font-medium text-[#2A4263]">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {isComplete ? (
                          <LuCheck className="h-3 w-3" />
                        ) : (
                          checkedCount
                        )}
                      </div>
                      <span className="text-lg">{category}</span>
                      <span className="mr-2 ml-auto text-xs font-normal text-gray-400">
                        {checkedCount}/{items.length}
                      </span>
                    </div>

                    <div className="collapse-content">
                      <Controller
                        name="packedIds"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-col gap-1 pt-2 pb-2">
                            {items.map((item) => {
                              const isChecked = field.value.includes(item._id);
                              return (
                                <label
                                  key={item._id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 ${isChecked ? 'bg-blue-50/50' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-sm rounded-md border-gray-300 transition-all checked:border-[#2A4263] checked:bg-[#2A4263]"
                                    checked={isChecked}
                                    onChange={() => {
                                      const next = isChecked
                                        ? field.value.filter(
                                            (id) => id !== item._id,
                                          )
                                        : [...field.value, item._id];
                                      field.onChange(next);
                                    }}
                                  />
                                  <span
                                    className={`text-sm transition-colors ${isChecked ? 'font-semibold text-[#2A4263]' : 'text-gray-600'}`}
                                  >
                                    {item.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || !watchedImage || updateMutation.isPending}
              className="btn bg-[#2A4263] px-8 text-white hover:bg-[#1f324b] disabled:bg-gray-300 disabled:text-gray-500"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
            </button>
          </div>
        </form>
      </div>
      <div
        className="modal-backdrop bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
    </div>
  );
}
