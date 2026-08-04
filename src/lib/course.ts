import type { Course, Lesson, Module } from '@/types/lesson'
import { NotFoundError } from '@/lib/errors'

/**
 * Course registry.
 * Content is wired in separately; this module owns the query API so the UI
 * never cares about where lesson content is stored.
 */
export function createEmptyCourse(): Course {
  return {
    name: 'Panda',
    modules: [],
    lessons: {},
  }
}

export function modulesOf(course: Course): Module[] {
  return [...course.modules].sort((a, b) => a.order - b.order)
}

export function lessonOf(course: Course, id: string): Lesson {
  const lesson = course.lessons[id]
  if (!lesson) throw new NotFoundError('lesson', id)
  return lesson
}

export function moduleLessons(course: Course, moduleId: string): Lesson[] {
  const module = course.modules.find((m) => m.id === moduleId)
  if (!module) throw new NotFoundError('module', moduleId)
  return module.lessons
    .map((id) => course.lessons[id])
    .filter((lesson): lesson is Lesson => Boolean(lesson))
    .sort((a, b) => a.meta.order - b.meta.order)
}

export function allLessons(course: Course): Lesson[] {
  return modulesOf(course).flatMap((module) => moduleLessons(course, module.id))
}

export function nextLesson(course: Course, currentId: string): Lesson | undefined {
  const lessons = allLessons(course)
  const index = lessons.findIndex((lesson) => lesson.meta.id === currentId)
  return index >= 0 ? lessons[index + 1] : undefined
}

export function previousLesson(course: Course, currentId: string): Lesson | undefined {
  const lessons = allLessons(course)
  const index = lessons.findIndex((lesson) => lesson.meta.id === currentId)
  return index > 0 ? lessons[index - 1] : undefined
}

export function isLessonUnlocked(
  lesson: Lesson,
  completedLessonIds: string[],
): boolean {
  return (lesson.meta.prerequisites ?? []).every((id) =>
    completedLessonIds.includes(id),
  )
}