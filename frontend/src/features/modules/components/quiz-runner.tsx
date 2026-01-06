import { 
  X, 
  XCircle, 
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  TriangleAlert
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MOCK_QUIZ } from '../api/mock-data'; // not sure lang kung pano ko to i-implement as api from json?

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type Question = typeof MOCK_QUIZ.questions[0];

export function QuizRunner(): React.ReactNode {
  const navigate = useNavigate();
  const quiz = MOCK_QUIZ;

  const [queue, setQueue] = useState<Question[]>([]);
  const [history, setHistory] = useState<Question[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  useEffect(() => {
    if (quiz?.questions) {
      setQueue(quiz.questions);
    }
  }, [quiz]);

  const currentQuestion = queue[0];
  const totalQuestions = quiz.questions.length;
  const currentNumber = history.length + 1;

  const currentOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray(currentQuestion.choices || []);
  }, [currentQuestion]);

  const isAlreadySolved = useMemo(() => {
    return currentQuestion && completedIds.has(currentQuestion.id);
  }, [currentQuestion, completedIds]);

  // FIX: Mapping para sa tamang correctness check
  const isCurrentCorrect = useMemo(() => {
    if (!currentQuestion || selectedOptionId === null) return false;
    const choices = currentQuestion.choices || [];
    return choices.find(o => o.id === selectedOptionId)?.isCorrect ?? false;
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

    if (isAlreadySolved) {
      const newQueue = queue.slice(1);
      setHistory(prev => [...prev, currentQuestion]);
      if (newQueue.length === 0) {
        handleSubmit();
      } else {
        setQueue(newQueue);
        const nextQ = newQueue[0];
        if (nextQ && completedIds.has(nextQ.id)) {
            const correctOpt = nextQ.choices.find(o => o.isCorrect);
            setSelectedOptionId(correctOpt?.id || null);
            setIsFeedbackMode(true);
        } else {
            setSelectedOptionId(null);
            setIsFeedbackMode(false);
        }
      }
      return;
    }

    if (isCurrentCorrect) {
      const newCompleted = new Set(completedIds);
      newCompleted.add(currentQuestion.id);
      setCompletedIds(newCompleted);
      setHistory(prev => [...prev, currentQuestion]);

      const newQueue = queue.slice(1);
      if (newQueue.length === 0) {
        handleSubmit();
      } else {
        setQueue(newQueue);
        setSelectedOptionId(null);
        setIsFeedbackMode(false);
      }
    } else {
      const remainingQueue = queue.slice(1);
      const retryQuestion = { ...currentQuestion };
      const insertIndex = Math.floor(Math.random() * (remainingQueue.length + 1));
      const newQueue = [
        ...remainingQueue.slice(0, insertIndex),
        retryQuestion,
        ...remainingQueue.slice(insertIndex)
      ];
      setQueue(newQueue);
      setSelectedOptionId(null);
      setIsFeedbackMode(false);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const previousQuestion = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setQueue(prev => [previousQuestion, ...prev]);
    setHistory(newHistory);
    const correctOption = previousQuestion.choices.find(o => o.isCorrect);
    setSelectedOptionId(correctOption?.id || null);
    setIsFeedbackMode(true);
  };

  const handleSubmit = () => {
    setIsFinished(true);
  };

  if (isFinished) return <div className="min-h-screen bg-white" />;
  if (!currentQuestion) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F9FAFB] font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 w-full bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <button type="button" title="Report this question" onClick={() => setIsReportModalOpen(true)} className="p-2 text-[#2A4263] hover:text-yellow-600 transition-colors rounded-full hover:bg-yellow-50">
            <TriangleAlert size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">QUESTION</span>
            <span className="text-lg font-bold text-[#2A4263]">
               {currentNumber} <span className="text-gray-300">of</span> {totalQuestions}
            </span>
          </div>

          <button type="button" onClick={() => navigate(-1)} title="Close quiz" className="p-2 text-[#2A4263] hover:text-red-600 transition-colors rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="h-1.5 w-full bg-gray-100">
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10 pb-40">
        <div className="mb-10">
          {/* FIX: Ginamit ang 'questionText' */}
          <h1 key={currentQuestion.id} className="animate-in slide-in-from-right-8 fade-in duration-300 text-2xl md:text-3xl font-bold leading-tight text-[#2A4263]">
            {currentQuestion.questionText}
          </h1>
          <p className="text-gray-500 mt-4 italic">{isAlreadySolved ? "Review your answer." : "Select the correct answer."}</p>
        </div>

        <div className="space-y-4">
          {currentOptions.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let containerStyle = "bg-[#2A4263] border-2 border-[#2A4263] text-white hover:bg-[#0891B2] hover:border-[#0891B2]";
            let circleStyle = "border-white/50 group-hover:border-white";

            if (isFeedbackMode) {
              if (option.isCorrect) {
                containerStyle = "bg-green-600 border-green-600";
                circleStyle = "border-white bg-white text-green-600";
              } else if (isSelected && !isCurrentCorrect) {
                containerStyle = "bg-red-600 border-red-600";
                circleStyle = "border-white bg-white text-red-600";
              } else {
                containerStyle = "bg-[#2A4263] opacity-40";
              }
            } else if (isSelected) {
              containerStyle = "bg-[#0891B2] border-[#0891B2] shadow-md scale-[1.01]";
              circleStyle = "border-white";
            }

            return (
              <button
                key={option.id}
                disabled={isFeedbackMode || isAlreadySolved}
                onClick={() => handleSelectOption(option.id)}
                className={`group relative flex w-full items-center rounded-2xl p-5 text-left transition-all duration-200 ${containerStyle} ${isAlreadySolved ? 'cursor-default' : ''}`}
              >
                <div className={`mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2px] transition-all ${circleStyle}`}>
                  {isFeedbackMode && option.isCorrect ? <CheckCircle2 size={16} /> : 
                   isFeedbackMode && isSelected && !isCurrentCorrect ? <XCircle size={16} /> : 
                   isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                </div>
                <span className="text-lg font-medium">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-2xl">
          {isFeedbackMode && (
            <div className={`mb-4 animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl p-4 flex gap-3 ${isCurrentCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`mt-0.5 shrink-0 ${isCurrentCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCurrentCorrect ? <CheckCircle2 size={24} /> : <HelpCircle size={24} />}
              </div>
              <div>
                  <h4 className={`font-bold ${isCurrentCorrect ? 'text-green-800' : 'text-red-800'}`}>{isCurrentCorrect ? 'Correct!' : 'Incorrect'}</h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed italic">{currentQuestion?.explanation}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button type="button" title="Go to previous question" onClick={handleBack} className="rounded-xl bg-gray-100 px-5 py-4 text-gray-600 hover:bg-gray-200 transition-colors shadow-sm">
                <ArrowLeft size={24} />
              </button>
            )}

            {!isFeedbackMode ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionId === null}
                className={`flex-1 rounded-xl py-4 text-xl font-bold text-white transition-all duration-200 ${selectedOptionId ? 'bg-[#2A4263] hover:bg-[#0891B2] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2A4263] py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#0891B2] hover:-translate-y-0.5"
              >
                {queue.length === 1 && isCurrentCorrect ? "Finish Assessment" : "Next Question"} 
                <ArrowRight size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
           <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-2xl text-[#2A4263]">Report a Question?</h2>
                 <button type="button" title="Close report modal" onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-red-600 transition-colors"><X size={24} /></button>
              </div>
              <textarea className="w-full border-2 border-gray-200 rounded-2xl p-4 h-32 mb-6 focus:border-[#2A4263] outline-none resize-none bg-gray-50 text-lg" placeholder="Type here"></textarea>
              <button onClick={() => setIsReportModalOpen(false)} className="w-full bg-[#2A4263] hover:bg-[#0891B2] text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-lg">Submit</button>
           </div>
        </div>
      )}
    </div>
  );
}