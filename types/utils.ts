// Utility types for better type safety

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// Create a type with some properties required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Create a type with some properties optional
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Extract the type of array elements
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

// Extract the return type of a function
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any

// Extract the parameters of a function
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never

// Create a union of all property names
export type Keys<T> = keyof T

// Create a union of all property values
export type Values<T> = T[keyof T]

// Deep readonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Deep partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Non-empty array
export type NonEmptyArray<T> = [T, ...T[]]

// String literal union
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

// Branded types for better type safety
export type Brand<T, B> = T & { __brand: B }

export type UserId = Brand<string, "UserId">
export type ProjectId = Brand<string, "ProjectId">
export type DatasetId = Brand<string, "DatasetId">
export type AnalysisId = Brand<string, "AnalysisId">

// Event types
export interface BaseEvent {
  type: string
  timestamp: string
}

export interface AnalysisCompletedEvent extends BaseEvent {
  type: "analysis_completed"
  analysis_id: AnalysisId
  user_id: UserId
  result: Record<string, unknown>
}

export interface DataProcessingEvent extends BaseEvent {
  type: "data_processing_complete"
  dataset_id: DatasetId
  user_id: UserId
}

export type WebhookEvent = AnalysisCompletedEvent | DataProcessingEvent

// Form validation types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormState<T> {
  data: T
  errors: ValidationError[]
  isSubmitting: boolean
  isValid: boolean
}

// API hook return types
export interface UseQueryResult<T> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<void>
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>
  data: T | undefined
  error: Error | null
  isLoading: boolean
  isError: boolean
  reset: () => void
}
