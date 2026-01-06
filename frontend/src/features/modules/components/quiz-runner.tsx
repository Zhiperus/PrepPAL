import { useState, useMemo, useEffect, useRef } from 'react';
import {
  LuX,
  LuCircleX,
  LuArrowRight,
  LuCircleCheck,
  LuCircleHelp,
  LuArrowLeft,
  LuTriangleAlert,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';

import { useQuiz } from '../api/get-quiz';
import { useSubmitQuiz } from '../api/submit-attempt';

import { paths } from '@/config/paths';

// Helper to ensure questions have a stable ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getQuestionKey = (q: any) => q.uniqueId || `index-${q.originalIndex}`;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuizRunner(): React.ReactNode {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  const hasInitialized = useRef(false);
  const [isFinished, setIsFinished] = useState(false);

  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz({
    mutationConfig: {
      onSuccess: () => {
        navigate(paths.app.modules.getHref());
      },
      onError: (error) => {
        console.error('Failed to submit quiz:', error);
        setIsFinished(false);
      },
    },
  });

  const {
    data: quizData,
    isLoading,
    isError,
  } = useQuiz({
    moduleId: moduleId || '',
    queryConfig: {
      enabled: !!moduleId,
      staleTime: Infinity,
    },
  });
  const quiz = quizData?.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queue, setQueue] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string | number>>(
    new Set(),
  );

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 1. Initialize Queue
  useEffect(() => {
    if (quiz?.questions && !hasInitialized.current) {
       
      const initializedQuestions = quiz.questions.map(
        (q: any, index: number) => ({
          ...q,
          originalIndex: index,
          uniqueId: `local-q-${index}`,
        }),
      );
      setQueue(initializedQuestions);
      hasInitialized.current = true;
    }
  }, [quiz]);

  const currentQuestion = queue[0];
  const totalQuestions = quiz?.questions.length || 0;

  const rawCurrentNumber = history.length + 1;
  const currentNumber =
    totalQuestions > 0 ? Math.min(rawCurrentNumber, totalQuestions) : 1;

  // Self-Healing Effect (Restores state if you go back to a completed question)
  useEffect(() => {
    if (!currentQuestion) return;

    const qId = getQuestionKey(currentQuestion);
    const isActuallySolved = completedIds.has(qId);

    if (isActuallySolved && !isFeedbackMode) {
      // Restore the user's previous selection from history if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const historyItem = history.find((h: any) => getQuestionKey(h) === qId);
      if (historyItem) {
        setSelectedOptionId(historyItem.selectedAnswerId);
      } else {
        // Fallback if not found (shouldn't happen in normal flow)
        setSelectedOptionId(currentQuestion.correctAnswer);
      }
      setIsFeedbackMode(true);
    }
  }, [currentQuestion, completedIds, isFeedbackMode, history]);

  const currentOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray(currentQuestion.choices || []);
  }, [currentQuestion]);

  const isAlreadySolved = useMemo(() => {
    if (!currentQuestion) return false;
    return completedIds.has(getQuestionKey(currentQuestion));
  }, [currentQuestion, completedIds]);

  const isCurrentCorrect = useMemo(() => {
    if (!currentQuestion || selectedOptionId === null) return false;
    const choices = currentQuestion.choices || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedChoice = choices.find((o: any) => o.id === selectedOptionId);
    return selectedChoice
      ? selectedChoice.id === currentQuestion.correctAnswer
      : false;
  }, [currentQuestion, selectedOptionId]);

  const handleSelectOption = (choiceId: number) => {
    if (!isFeedbackMode && !isAlreadySolved) {
      setSelectedOptionId(choiceId);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOptionId === null) return;
    setIsFeedbackMode(true);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    // --- LOGIC CHANGE: UNBLOCKED NAVIGATION ---
    // We now advance regardless of whether the answer was correct or not.

    if (isAlreadySolved) {
      // Review Mode (Question already answered)
      const newQueue = queue.slice(1);

      // We don't add to history here because it's already there from the first pass.
      // But we might need to visually restore the NEXT question's state.

      if (newQueue.length === 0) {
        handleSubmit();
      } else {
        setQueue(newQueue);
        resetStateForNextQuestion(newQueue[0]);
      }
    } else {
      // New Attempt Mode
      const newCompleted = new Set(completedIds);
      newCompleted.add(getQuestionKey(currentQuestion));
      setCompletedIds(newCompleted);

      // 1. Record the attempt (Right OR Wrong)
      const historyEntry = {
        ...currentQuestion,
        selectedAnswerId: selectedOptionId,
      };

      setHistory((prev) => [...prev, historyEntry]);

      const newQueue = queue.slice(1);

      if (newQueue.length === 0) {
        // Submit immediately with the new entry
        handleSubmit([...history, historyEntry]);
      } else {
        setQueue(newQueue);
        // 2. Reset UI for next question
        setSelectedOptionId(null);
        setIsFeedbackMode(false);
      }
    }
  };

  // Helper to safely reset or restore state when moving between questions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetStateForNextQuestion = (nextQ: any) => {
    const nextQId = nextQ ? getQuestionKey(nextQ) : null;
    if (nextQ && completedIds.has(nextQId!)) {
      // If next question is also solved, restore its state from history
       
      const prevAnswer = history.find(
        (h: any) => getQuestionKey(h) === nextQId,
      );
      setSelectedOptionId(
        prevAnswer ? prevAnswer.selectedAnswerId : nextQ.correctAnswer,
      );
      setIsFeedbackMode(true);
    } else {
      setSelectedOptionId(null);
      setIsFeedbackMode(false);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const previousQuestion = history[history.length - 1];
    const newHistory = history.slice(0, -1); // Remove from history so we can "re-answer" if needed, OR just view.

    // In this "Submit with Mistakes" model, usually Back = Review.
    // So we keep it in completedIds, but we visually move back.

    setQueue((prev) => [previousQuestion, ...prev]);
    // NOTE: If you want to allow changing the answer, you'd modify history/completedIds here.
    // For now, let's assume "Back" is for review, so we restore the selection.

    // We actually REMOVE it from history in this logic so the progress bar syncs correctly
    // (since currentNumber relies on history.length).
    setHistory(newHistory);

    setSelectedOptionId(previousQuestion.selectedAnswerId);
    setIsFeedbackMode(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (finalHistory?: any[]) => {
    if (!moduleId) return;
    setIsFinished(true);

    const historyToSubmit = finalHistory || history;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = historyToSubmit.map((q: any) => ({
      questionIndex: q.originalIndex,
      // Fallback to -1 or similar if something went wrong, but flow guarantees selection
      selectedAnswerId: q.selectedAnswerId,
    }));

    submitQuiz({
      moduleId,
      answers,
    });
  };

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB]">
        <span className="loading loading-spinner loading-lg text-[#2A4263]"></span>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F9FAFB]">
        <h2 className="text-xl font-bold text-gray-800">Failed to load quiz</h2>
        <button
          onClick={() => navigate('..', { relative: 'path' })}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isSubmitting || isFinished) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F9FAFB]">
        <span className="loading loading-spinner loading-lg text-[#2A4263]"></span>
        <p className="font-medium text-gray-500">Submitting results...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center">
        Preparing questions...
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F9FAFB] font-sans text-gray-800">
      {/* HEADER */}
      <div className="sticky top-0 z-20 w-full border-b border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 pt-15">
          <button
            type="button"
            title="Report this question"
            onClick={() => setIsReportModalOpen(true)}
            className="rounded-full p-2 text-[#2A4263] transition-colors hover:bg-yellow-50 hover:text-yellow-600"
          >
            <LuTriangleAlert size={24} />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              QUESTION
            </span>
            <span className="text-lg font-bold text-[#2A4263]">
              {currentNumber} <span className="text-gray-300">of</span>{' '}
              {totalQuestions}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('..', { relative: 'path' })}
            title="Close quiz"
            className="rounded-full p-2 text-[#2A4263] transition-colors hover:bg-gray-100 hover:text-red-600"
          >
            <LuX size={24} />
          </button>
        </div>
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full bg-[#2A4263] transition-all duration-300"
            style={{ width: `${(currentNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 pb-40">
        <div className="mb-10">
          <h1
            key={getQuestionKey(currentQuestion)}
            className="animate-in slide-in-from-right-8 fade-in text-2xl leading-tight font-bold text-[#2A4263] duration-300 md:text-3xl"
          >
            {currentQuestion.questionText}
          </h1>
          <p className="mt-4 text-gray-500 italic">
            {isAlreadySolved
              ? 'Review your answer.'
              : 'Select the correct answer.'}
          </p>
        </div>

        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {currentOptions.map((option: any) => {
            const isSelected = selectedOptionId === option.id;
            const isThisOptionCorrect =
              option.id === currentQuestion.correctAnswer;

            let containerStyle =
              'bg-[#2A4263] border-2 border-[#2A4263] text-white hover:bg-[#0891B2] hover:border-[#0891B2]';
            let circleStyle = 'border-white/50 group-hover:border-white';

            if (isFeedbackMode) {
              if (isThisOptionCorrect) {
                containerStyle = 'bg-green-600 border-green-600';
                circleStyle = 'border-white bg-white text-green-600';
              } else if (isSelected && !isCurrentCorrect) {
                containerStyle = 'bg-red-600 border-red-600';
                circleStyle = 'border-white bg-white text-red-600';
              } else {
                containerStyle = 'bg-[#2A4263] opacity-40';
              }
            } else if (isSelected) {
              containerStyle =
                'bg-[#0891B2] border-[#0891B2] shadow-md scale-[1.01]';
              circleStyle = 'border-white';
            }

            return (
              <button
                key={option.id}
                disabled={isFeedbackMode || isAlreadySolved}
                onClick={() => handleSelectOption(option.id)}
                className={`group relative flex w-full items-center rounded-2xl p-5 text-left transition-all duration-200 ${containerStyle} ${isAlreadySolved && !isSelected && !isThisOptionCorrect ? 'opacity-50' : ''}`}
              >
                <div
                  className={`mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] transition-all ${circleStyle}`}
                >
                  {isFeedbackMode && isThisOptionCorrect ? (
                    <LuCircleCheck size={16} />
                  ) : isFeedbackMode && isSelected && !isCurrentCorrect ? (
                    <LuCircleX size={16} />
                  ) : (
                    isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )
                  )}
                </div>
                <span className="text-lg font-medium">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:p-6">
        <div className="mx-auto max-w-2xl">
          {isFeedbackMode && (
            <div
              className={`animate-in slide-in-from-bottom-4 fade-in mb-4 flex gap-3 rounded-xl p-4 duration-300 ${isCurrentCorrect ? 'border border-green-200 bg-green-50' : 'border border-red-200 bg-red-50'}`}
            >
              <div
                className={`mt-0.5 shrink-0 ${isCurrentCorrect ? 'text-green-600' : 'text-red-600'}`}
              >
                {isCurrentCorrect ? (
                  <LuCircleCheck size={24} />
                ) : (
                  <LuCircleHelp size={24} />
                )}
              </div>
              <div>
                <h4
                  className={`font-bold ${isCurrentCorrect ? 'text-green-800' : 'text-red-800'}`}
                >
                  {isCurrentCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 italic">
                  {currentQuestion?.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                type="button"
                title="Go to previous question"
                onClick={handleBack}
                className="rounded-xl bg-gray-100 px-5 py-4 text-gray-600 shadow-sm transition-colors hover:bg-gray-200"
              >
                <LuArrowLeft size={24} />
              </button>
            )}

            {!isFeedbackMode ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionId === null}
                className={`flex-1 rounded-xl py-4 text-xl font-bold text-white transition-all duration-200 ${selectedOptionId ? 'bg-[#2A4263] shadow-lg hover:-translate-y-0.5 hover:bg-[#0891B2] hover:shadow-xl active:translate-y-0' : 'cursor-not-allowed bg-gray-300'}`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2A4263] py-4 text-xl font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#0891B2]"
              >
                {queue.length === 1 ? 'Finish Assessment' : 'Next Question'}
                <LuArrowRight size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-sm scale-100 rounded-3xl bg-white p-8 shadow-2xl duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2A4263]">
                Report a Question?
              </h2>
              <button
                type="button"
                title="Close report modal"
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 transition-colors hover:text-red-600"
              >
                <LuX size={24} />
              </button>
            </div>
            <textarea
              className="mb-6 h-32 w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 text-lg outline-none focus:border-[#2A4263]"
              placeholder="Type here"
            ></textarea>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="w-full rounded-2xl bg-[#2A4263] py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#0891B2]"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
