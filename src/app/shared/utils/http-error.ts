export interface HttpErrorLike {
  status?: number;
  error?: { detail?: unknown };
}

function isErrorLike(e: unknown): e is HttpErrorLike {
  return typeof e === 'object' && e !== null;
}

export function httpErrorStatus(e: unknown): number | null {
  if (!isErrorLike(e)) return null;
  const status = (e as HttpErrorLike).status;
  return typeof status === 'number' ? status : null;
}

export function httpErrorDetail(e: unknown): string | null {
  if (!isErrorLike(e)) return null;
  const detail = (e as HttpErrorLike).error?.detail;
  return typeof detail === 'string' ? detail : null;
}
