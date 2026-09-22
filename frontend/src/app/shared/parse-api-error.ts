import { HttpErrorResponse } from '@angular/common/http';

export function parseApiError(
  err: HttpErrorResponse,
  fallback = 'Došlo je do greške. Pokušajte ponovno.'
): string {
  const body = err.error;
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const messages: string[] = [];
  for (const [field, value] of Object.entries(body)) {
    const text = Array.isArray(value) ? value.join(' ') : String(value);
    if (field === 'non_field_errors' || field === 'detail') {
      messages.push(text);
    } else {
      messages.push(`${field}: ${text}`);
    }
  }

  return messages.length ? messages.join(' | ') : fallback;
}
