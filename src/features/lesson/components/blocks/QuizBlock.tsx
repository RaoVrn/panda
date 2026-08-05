import type { ContentQuizBlock } from "@/content/schema";
import { QuizCard } from "@/features/lesson/components/QuizCard";
import { useLessonId } from "@/features/lesson/lessonModeContext";

export function QuizBlock({ block }: { block: ContentQuizBlock }) {
  const lessonId = useLessonId();
  return <QuizCard key={block.quiz.id} quiz={block.quiz} lessonId={lessonId} />;
}