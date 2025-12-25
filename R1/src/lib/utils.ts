import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse API errors into a field -> messages map for inline validation.
 */
export function parseApiError(err: any): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!err) return out;

  if (err.errors && typeof err.errors === 'object') {
    for (const k of Object.keys(err.errors)) {
      const val = (err.errors as any)[k];
      out[k] = Array.isArray(val) ? val.map((v) => String(v)) : [String(val)];
    }
    return out;
  }

  if (Array.isArray(err.detail)) {
    for (const e of err.detail) {
      const loc = Array.isArray(e.loc) && e.loc.length ? String(e.loc[e.loc.length - 1]) : '_';
      if (!out[loc]) out[loc] = [];
      out[loc].push(e.msg || e.message || JSON.stringify(e));
    }
    return out;
  }

  if (typeof err.detail === 'object' && err.detail !== null) {
    for (const k of Object.keys(err.detail)) {
      const v = (err.detail as any)[k];
      out[k] = Array.isArray(v) ? v.map((x) => String(x)) : [String(v)];
    }
    return out;
  }

  if (typeof err.detail === 'string') {
    out['_'] = [err.detail];
    return out;
  }

  if (err.status) {
    out['_'] = [`Error ${err.status}`];
    return out;
  }

  return out;
}
