export interface ApiErrorBody {
  detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
}

export interface ApiError extends Error {
  status: number;
}
