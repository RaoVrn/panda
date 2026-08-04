export class NotFoundError extends Error {
  readonly kind: 'lesson' | 'module'

  constructor(kind: 'lesson' | 'module', id: string) {
    super(`No ${kind} found with id "${id}"`)
    this.name = 'NotFoundError'
    this.kind = kind
  }
}

export class CircularDependencyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircularDependencyError'
  }
}