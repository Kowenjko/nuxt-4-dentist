export interface PaginationI {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponseI<T> {
  data: T
  pagination?: PaginationI
}

export interface DeleteResponseI {
  message: string
}
