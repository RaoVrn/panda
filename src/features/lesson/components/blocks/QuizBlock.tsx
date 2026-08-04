import type { ContentQuizBlock } from "@/content/schema";
import { QuizCard } from "@/features/learning/components/QuizCard";

export function QuizBlock({ block }: { block: ContentQuizBlock }) {
  return <QuizCard key={block.quiz.id} quiz={block.quiz} />;
}