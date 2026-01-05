import { useParams } from 'react-router-dom';

import { QuizRunner } from '@/features/modules/components/quiz-runner';

interface QuizRunnerRouteProps {
  moduleId?: string;
}

export default function QuizRunnerRoute({ moduleId: propModuleId }: QuizRunnerRouteProps) {
  const { moduleId } = useParams<{ moduleId: string }>();
  const finalModuleId = propModuleId || moduleId;

  if (!finalModuleId) return <div>Error: No Module ID</div>;

  return <QuizRunner moduleId={finalModuleId} />;
}