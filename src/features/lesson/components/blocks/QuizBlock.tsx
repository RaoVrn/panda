import type { ContentQuizBlock } from "@/content/schema";
import { QuizCard } from "@/features/lesson/components/QuizCard";

export function QuizBlock({ block }: { block: ContentQuizBlock }) {
  return <QuizCard key={block.quiz.id} quiz={block.quiz} />;
}