import type { Content, Module } from '@repo/shared/dist/schemas/module.schema';
import type { Quiz, QuizQuestion } from '@repo/shared/dist/schemas/quiz.schema';
import { forwardRef, useState, useEffect } from 'react';
import { LuBookOpenText, LuBrainCircuit, LuInfo } from 'react-icons/lu';

import { useModule } from '@/features/modules/api/get-module';
import { useQuiz } from '@/features/modules/api/get-quiz';

// MODULE CONTROLS
// 1. Fetching
export const EditModuleModal = forwardRef<
  HTMLDialogElement,
  { module: Module | null }
>(({ module }, ref) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useModule({
    moduleId: module?._id || '',
    queryConfig: { enabled: !!module?._id },
  });

  // 2. Local Copy of Module Content
  const [formData, setFormData] = useState<Module | null>(null);

  // 3. Syncing
  useEffect(() => {
    if (response?.data) {
      setFormData(response.data);
    }
  }, [response]);

  // 4. Update content within input
  const handleSlideChange = (
    index: number,
    field: keyof Content,
    value: string,
  ) => {
    if (!formData) return;

    const updatedContent = [...formData.content];

    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      content: updatedContent,
    });
  };

  // QUIZ CONTROLS
  // 1. Fetching
  const { data: quizRes, isLoading: isQuizLoading } = useQuiz({
    moduleId: module?._id || '',
    queryConfig: { enabled: !!module?._id },
  });

  // 2. Local "Draft" state for the Quiz
  const [quizData, setQuizData] = useState<Quiz | null>(null);

  // 3. Syncing Quiz Data
  useEffect(() => {
    if (quizRes?.data) {
      setQuizData(quizRes.data);
    }
  }, [quizRes]);

  // 4. Handler for Quiz Questions
  const handleQuestionChange = (
    qIndex: number,
    field: keyof QuizQuestion,
    value: any,
  ) => {
    if (!quizData) return;
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // 5. Handler for Choices (Nested)
  const handleChoiceChange = (
    qIndex: number,
    cIndex: number,
    value: string,
  ) => {
    if (!quizData) return;
    const updatedQuestions = [...quizData.questions];
    const updatedChoices = [...updatedQuestions[qIndex].choices];
    updatedChoices[cIndex] = { ...updatedChoices[cIndex], text: value };
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      choices: updatedChoices,
    };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  if (!module) return <dialog ref={ref} className="modal"></dialog>;

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box w-11/12 max-w-4xl bg-white">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold">
            {module.logo} Editing: {module.title}
          </h3>
          <p className="text-sm text-gray-400">ID: {module._id}</p>
        </div>

        <div className="py-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : isError ? (
            <div className="alert alert-error">Error loading slides.</div>
          ) : (
            <div className="">
              <div className="collapse-plus bg-base-100 border-base-300 collapse border">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title flex items-center gap-2 text-lg font-bold">
                  <LuInfo className="text-[#2a4362]" />
                  Module Information
                </div>
                <div className="collapse-content flex-col">
                  <div className="mb-4 flex flex-col">
                    <label className="label font-bold">Module Title</label>
                    <input
                      className="input input-bordered mt-2 w-full"
                      value={formData?.title || ''}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev ? { ...prev, title: e.target.value } : null,
                        )
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="label font-bold">
                      Module Description
                    </label>
                    <input
                      className="input input-bordered mt-2 w-full"
                      value={formData?.description || ''}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? { ...prev, description: e.target.value }
                            : null,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="collapse-plus bg-base-100 border-base-300 collapse border">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title flex items-center gap-2 text-lg font-bold">
                  <LuBookOpenText className="text-[#2a4362]" />
                  Module Content
                </div>
                <div className="collapse-content">
                  <div className="max-h-[50vh] space-y-4 overflow-y-auto px-2">
                    {formData?.content?.map((slide, index) => (
                      <div
                        key={index}
                        className="bg-bg-secondary space-y-4 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            Slide {index + 1}
                          </span>
                        </div>

                        {/* Primary Text (Always exists per schema) */}
                        <div className="form-control">
                          <label className="label py-1 text-xs font-semibold">
                            Slide Text
                          </label>
                          <textarea
                            className="textarea textarea-bordered w-full bg-white"
                            value={slide.text}
                            onChange={(e) =>
                              handleSlideChange(index, 'text', e.target.value)
                            }
                          />
                        </div>

                        {/* IMAGE SECTION: Only show if imageUrl is present or if you want to allow adding one */}
                        <div className="form-control flex flex-row-reverse justify-end gap-4">
                          <div className="flex flex-grow flex-col">
                            <label className="label py-1 text-xs font-semibold">
                              Image URL (Optional)
                            </label>
                            <input
                              type="text"
                              className="input input-sm input-bordered w-full bg-white"
                              placeholder="https://example.com/image.jpg"
                              value={slide.imageUrl || ''}
                              onChange={(e) =>
                                handleSlideChange(
                                  index,
                                  'imageUrl',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          {/* Visual Preview: Only show if the URL is valid/exists */}
                          {slide.imageUrl && (
                            <img
                              src={slide.imageUrl}
                              alt="Preview"
                              className="mt-2 h-20 w-32 rounded border object-cover"
                            />
                          )}
                        </div>

                        {/* REFERENCES SECTION: Grouped conditionally */}
                        <div className="flex w-full gap-4">
                          <div className="form-control flex flex-col">
                            <label className="label py-1 text-xs font-semibold">
                              Reference Name
                            </label>
                            <input
                              type="text"
                              className="input input-sm input-bordered bg-white"
                              placeholder="e.g. Wikipedia"
                              value={slide.reference || ''}
                              onChange={(e) =>
                                handleSlideChange(
                                  index,
                                  'reference',
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="form-control flex flex-grow flex-col">
                            <label className="label py-1 text-xs font-semibold">
                              Reference URL
                            </label>
                            <input
                              type="text"
                              className="input input-sm input-bordered w-full bg-white"
                              placeholder="https://..."
                              value={slide.referenceUrl || ''}
                              onChange={(e) =>
                                handleSlideChange(
                                  index,
                                  'referenceUrl',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="collapse-plus bg-base-100 border-base-300 collapse border">
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title flex items-center gap-2 text-lg font-bold">
                  <LuBrainCircuit className="text-[#2a4362]" />
                  Quiz Management ({quizData?.questions?.length || 0} Questions)
                </div>

                <div className="collapse-content">
                  {isQuizLoading ? (
                    <div className="flex justify-center p-10">
                      <span className="loading loading-spinner"></span>
                    </div>
                  ) : (
                    <div className="max-h-[50vh] space-y-6 overflow-y-auto p-2">
                      {quizData?.questions.map((question, qIndex) => (
                        <div
                          key={question._id}
                          className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"
                        >
                          {/* Question Text */}
                          <div className="form-control">
                            <label className="label text-xs font-bold text-gray-400">
                              QUESTION {qIndex + 1}
                            </label>
                            <input
                              className="input input-bordered w-full font-medium"
                              value={question.questionText}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  'questionText',
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* Choices Grid */}
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {question.choices.map((choice, cIndex) => (
                              <div
                                key={choice.id}
                                className="flex items-center gap-2"
                              >
                                {/* Radio Button to set Correct Answer */}
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  className="radio radio-success radio-sm"
                                  checked={question.correctAnswer === choice.id}
                                  onChange={() =>
                                    handleQuestionChange(
                                      qIndex,
                                      'correctAnswer',
                                      choice.id,
                                    )
                                  }
                                />
                                <input
                                  className="input input-sm input-bordered flex-1"
                                  value={choice.text}
                                  onChange={(e) =>
                                    handleChoiceChange(
                                      qIndex,
                                      cIndex,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action border-t pt-4">
          <form method="dialog">
            <button className="btn">Cancel</button>
          </form>
          <button className="btn hover:!bg-[#EF4444] hover:!text-white">
            Delete Module
          </button>
          <button
            className="btn !bg-[#2a4362] text-white"
            onClick={() => console.log('Payload:', formData)}
          >
            Save Changes
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

EditModuleModal.displayName = 'EditModuleModal';
