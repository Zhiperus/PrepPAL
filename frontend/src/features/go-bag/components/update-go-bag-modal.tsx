import type { BagItem } from '@repo/shared/dist/schemas/goBag.schema';
import { useState, useEffect, useMemo } from 'react';
import { LuUpload, LuCheck, LuX } from 'react-icons/lu';

import { useGoBag } from '../api/get-go-bag';
import { useUpdateGoBag } from '../api/update-go-bag';

export default function UpdateGoBagModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading } = useGoBag();
  const updateMutation = useUpdateGoBag();

  const [packedIds, setPackedIds] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data?.items) {
      const initialPacked = new Set(
        (data.items as BagItem[])
          .filter((item) => item.isPacked)
          .map((item) => item._id),
      );
      setPackedIds(initialPacked);
    }
  }, [data]);

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

  const toggleItem = (id: string) => {
    const next = new Set(packedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPackedIds(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        items: Array.from(packedIds),
        image: selectedFile || undefined,
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

          {/* Progress Bar */}
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
                {/* Calculate local progress for immediate feedback */}
                {data?.items?.length
                  ? Math.round((packedIds.size / data.items.length) * 100)
                  : 0}
                % Ready
              </span>
            </div>
            <progress
              className={`progress h-2 w-full ${
                data?.completeness === 100
                  ? 'progress-success'
                  : 'progress-primary'
              }`}
              value={packedIds.size}
              max={data?.items?.length || 100}
            />
          </div>
        </div>

        {/* BODY: Scrollable List */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-6 py-6">
            {/* 1. Categories Accordion */}
            <div className="flex flex-col gap-3">
              {Object.entries(groupedItems).map(([category, items], idx) => {
                // Calculate stats for this category
                const checkedCount = items.filter((i) =>
                  packedIds.has(i._id),
                ).length;
                const isComplete =
                  checkedCount === items.length && items.length > 0;

                return (
                  <div
                    key={category}
                    className="collapse-arrow collapse rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    {/* Make the first category open by default for visibility */}
                    <input type="checkbox" defaultChecked={idx === 0} />

                    <div className="collapse-title flex items-center gap-3 py-4 font-medium text-[#2A4263]">
                      {/* Status Bubble */}
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isComplete
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
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
                      <div className="flex flex-col gap-1 pt-2 pb-2">
                        {items.map((item) => {
                          const isChecked = packedIds.has(item._id);
                          return (
                            <label
                              key={item._id} // ✅ Using _id as key
                              className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 ${
                                isChecked ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm rounded-md border-gray-300 transition-all checked:border-[#2A4263] checked:bg-[#2A4263]"
                                checked={isChecked}
                                onChange={() => toggleItem(item._id)} // ✅ Using _id to toggle
                              />
                              <span
                                className={`text-sm transition-colors ${
                                  isChecked
                                    ? 'font-semibold text-[#2A4263]'
                                    : 'text-gray-600'
                                }`}
                              >
                                {item.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Image Upload Section */}
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5">
              <label className="label mb-3 p-0">
                <span className="label-text flex items-center gap-2 font-bold text-[#2A4263]">
                  <LuUpload className="h-4 w-4" /> Update Evidence Photo
                </span>
              </label>

              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-primary file-input-bordered file-input-sm w-full max-w-xs bg-white text-xs"
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    Upload a new photo to show your progress.
                  </div>
                </div>

                {/* Preview */}
                {(previewUrl || data?.imageUrl) && (
                  <div className="avatar">
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100 ring ring-gray-200 ring-offset-2">
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
              disabled={updateMutation.isPending}
              className="btn bg-[#2A4263] px-8 text-white hover:bg-[#1f324b] disabled:bg-gray-300"
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
