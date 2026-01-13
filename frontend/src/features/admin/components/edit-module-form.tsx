import type { Content, Module } from '@repo/shared/dist/schemas/module.schema';
import type { Quiz, QuizQuestion } from '@repo/shared/dist/schemas/quiz.schema';
import { forwardRef, useState, useEffect } from 'react';
import {
  LuBookOpenText,
  LuBrainCircuit,
  LuInfo,
  LuPlus,
  LuTrash,
  LuSave,
  LuX,
} from 'react-icons/lu';

import { useModule } from '@/features/modules/api/get-module';
import { useQuiz } from '@/features/modules/api/get-quiz';
import { useUpdateModule } from '@/features/modules/api/update-module';
import { useUpdateQuiz } from '@/features/modules/api/update-quiz'; // 1. Ensure this is imported

export const EditModuleModal = forwardRef<
  HTMLDialogElement,
  { module: Module | null; onClose?: () => void }
>(({ module, onClose }, ref) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useModule({
    moduleId: module?._id || '',
    queryConfig: { enabled: !!module?._id },
  });

  const { data: quizRes, isLoading: isQuizLoading } = useQuiz({
    moduleId: module?._id || '',
    queryConfig: { enabled: !!module?._id },
  });

  // --- 2. LOCAL STATE ---
  const [formData, setFormData] = useState<Module | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);

  useEffect(() => {
    if (response?.data) setFormData(response.data);
  }, [response]);

  useEffect(() => {
    if (quizRes?.data) setQuizData(quizRes.data);
  }, [quizRes]);

  // --- 3. MUTATION HOOKS ---
  const updateModuleMutation = useUpdateModule();

  // 2. Initialize Quiz Mutation
  const updateQuizMutation = useUpdateQuiz();

  // Combine pending states for the button
  const isSaving =
    updateModuleMutation.isPending || updateQuizMutation.isPending;

  // ==========================================
  // MODULE CONTENT HANDLERS
  // ==========================================
  const handleSlideChange = (
    index: number,
    field: keyof Content,
    value: string,
  ) => {
    if (!formData) return;
    const updatedContent = [...formData.content];
    updatedContent[index] = { ...updatedContent[index], [field]: value };
    setFormData({ ...formData, content: updatedContent });
  };

  const handleAddSlide = () => {
    if (!formData) return;
    const newSlide: Content = {
      text: '',
      imageUrl: '',
      reference: '',
      referenceUrl: null,
    };
    setFormData({ ...formData, content: [...formData.content, newSlide] });
  };

  const handleRemoveSlide = (index: number) => {
    if (!formData) return;
    const updatedContent = formData.content.filter((_, i) => i !== index);
    setFormData({ ...formData, content: updatedContent });
  };

  // ==========================================
  // QUIZ HANDLERS
  // ==========================================
  const handleQuestionChange = (
    qIndex: number,
    field: keyof QuizQuestion,
    value: any,
  ) => {
    if (!quizData) return;
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      [field]: value,
    };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    if (!quizData) return;
    const newQuestion: QuizQuestion = {
      questionText: '',
      correctAnswer: 0,
      choices: [
        { id: 0, text: '' },
        { id: 1, text: '' },
      ],
    };
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion],
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (!quizData) return;
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

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

  const handleAddChoice = (qIndex: number) => {
    if (!quizData) return;
    const updatedQuestions = [...quizData.questions];
    const currentChoices = updatedQuestions[qIndex].choices;
    const nextId =
      currentChoices.length > 0
        ? Math.max(...currentChoices.map((c) => c.id)) + 1
        : 0;
    updatedQuestions[qIndex].choices = [
      ...currentChoices,
      { id: nextId, text: '' },
    ];
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleRemoveChoice = (qIndex: number, cIndex: number) => {
    if (!quizData) return;
    const updatedQuestions = [...quizData.questions];
    const updatedChoices = updatedQuestions[qIndex].choices.filter(
      (_, i) => i !== cIndex,
    );
    updatedQuestions[qIndex].choices = updatedChoices;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // ==========================================
  // SAVE HANDLER (FIXED)
  // ==========================================
  const handleSave = () => {
    if (!formData || !module?._id) return;

    // 1. Sanitize Module Content
    const sanitizedContent = formData.content.map((slide) => ({
      ...slide,
      imageUrl: slide.imageUrl?.trim() === '' ? null : slide.imageUrl,
      referenceUrl:
        slide.referenceUrl?.trim() === '' ? null : slide.referenceUrl,
    }));

    // 2. Update Module
    updateModuleMutation.mutate({
      moduleId: module._id,
      data: { ...formData, content: sanitizedContent },
    });

    // 3. Update Quiz (Wrapped in check to fix Type Error)
    if (quizData && quizData._id) {
      updateQuizMutation.mutate({
        quizId: quizData._id,
        data: quizData, // Typescript now knows quizData is not null here
      });
    }
  };

  if (!module) return <dialog ref={ref} className="modal"></dialog>;

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box w-11/12 max-w-4xl bg-white">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold">
            {module.logo} Editing: {module.title}
          </h3>
          <p className="text-sm text-gray-400">ID: {module._id}</p>
        </div>
        <div className="space-y-2 py-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : isError ? (
            <div className="alert alert-error">Error loading slides.</div>
          ) : (
            <>
              {/* INFO */}
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

              {/* CONTENT */}
              <div className="collapse-plus bg-base-100 border-base-300 collapse border">
                <input type="radio" name="my-accordion-3" defaultChecked />
                <div className="collapse-title flex items-center gap-2 text-lg font-bold">
                  <LuBookOpenText className="text-[#2a4362]" />
                  Module Content
                </div>
                <div className="collapse-content">
                  <div className="max-h-[50vh] space-y-4 overflow-y-auto px-2 pb-4">
                    {formData?.content?.map((slide, index) => (
                      <div
                        key={index}
                        className="bg-bg-secondary space-y-4 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            Slide {index + 1}
                          </span>
                          <button
                            className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"
                            onClick={() => handleRemoveSlide(index)}
                          >
                            <LuTrash />
                          </button>
                        </div>
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
                        <div className="form-control flex flex-row-reverse justify-end gap-4">
                          <div className="flex flex-grow flex-col">
                            <label className="label py-1 text-xs font-semibold">
                              Image URL (Optional)
                            </label>
                            <input
                              type="text"
                              className="input input-sm input-bordered w-full bg-white"
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
                          {slide.imageUrl && (
                            <img
                              src={slide.imageUrl}
                              alt="Preview"
                              className="mt-2 h-20 w-32 rounded border object-cover"
                            />
                          )}
                        </div>
                        <div className="form-control">
                          <label className="label py-1 text-xs font-semibold">
                            Reference URL (Optional)
                          </label>
                          <input
                            type="text"
                            className="input input-sm input-bordered w-full bg-white"
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
                    ))}
                  </div>
                  <button
                    onClick={handleAddSlide}
                    className="btn btn-outline btn-block mt-2 border-dashed border-gray-400 text-gray-500 hover:bg-gray-50"
                  >
                    <LuPlus /> Add New Slide
                  </button>
                </div>
              </div>

              {/* QUIZ */}
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
                    <>
                      <div className="max-h-[50vh] space-y-6 overflow-y-auto p-2 pb-4">
                        {quizData?.questions.map((question, qIndex) => (
                          <div
                            key={qIndex}
                            className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <label className="label text-xs font-bold text-gray-400">
                                QUESTION {qIndex + 1}
                              </label>
                              <button
                                className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50"
                                onClick={() => handleRemoveQuestion(qIndex)}
                              >
                                <LuTrash />
                              </button>
                            </div>

                            <div className="form-control">
                              <input
                                className="input input-bordered w-full font-medium"
                                value={question.questionText}
                                placeholder="Enter question text..."
                                onChange={(e) =>
                                  handleQuestionChange(
                                    qIndex,
                                    'questionText',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="label py-0 text-[10px] font-bold text-gray-400 uppercase">
                                Choices
                              </label>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {question.choices.map((choice, cIndex) => (
                                  <div
                                    key={cIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-${qIndex}`}
                                      className="radio radio-success radio-sm"
                                      checked={
                                        question.correctAnswer === choice.id
                                      }
                                      onChange={() =>
                                        handleQuestionChange(
                                          qIndex,
                                          'correctAnswer',
                                          choice.id,
                                        )
                                      }
                                      title="Mark as correct"
                                    />
                                    <div className="join w-full">
                                      <input
                                        className="input join-item input-sm input-bordered w-full"
                                        value={choice.text}
                                        placeholder={`Option text`}
                                        onChange={(e) =>
                                          handleChoiceChange(
                                            qIndex,
                                            cIndex,
                                            e.target.value,
                                          )
                                        }
                                      />
                                      <button
                                        className="btn join-item btn-sm btn-ghost border-l border-gray-300 text-gray-400 hover:text-red-500"
                                        onClick={() =>
                                          handleRemoveChoice(qIndex, cIndex)
                                        }
                                        disabled={question.choices.length <= 2}
                                      >
                                        <LuX size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={() => handleAddChoice(qIndex)}
                                  className="btn btn-sm btn-ghost border-dashed border-gray-300 text-gray-400 hover:bg-gray-50"
                                >
                                  <LuPlus size={14} /> Add Choice
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleAddQuestion}
                        className="btn btn-outline btn-block mt-2 border-dashed border-gray-400 text-gray-500 hover:bg-gray-50"
                      >
                        <LuPlus /> Add New Question
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
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
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <LuSave className="mr-2" /> Save Changes
              </>
            )}
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
