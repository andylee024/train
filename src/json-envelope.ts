export type JsonEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): JsonEnvelope<T> {
  return { ok: true, data };
}

export function err(message: string): JsonEnvelope<never> {
  return { ok: false, error: message };
}
