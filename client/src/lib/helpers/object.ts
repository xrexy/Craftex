import type { ValueOf } from "../types";

export type UnwrapPick<T> = T extends Pick<infer U, infer K> ? U : never;

// https://github.com/melt-ui/melt-ui/blob/develop/src/lib/internal/helpers/object.ts
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(obj)) {
    if (!keys.includes(key as unknown as K)) {
      result[key as keyof Omit<T, K>] = obj[key] as ValueOf<Omit<T, K>>;
    }
  }
  return result;
}

export function pick<T extends Record<PropertyKey, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of Object.keys(obj)) {
    if (keys.includes(key as unknown as K)) {
      result[key as keyof Pick<T, K>] = obj[key] as ValueOf<Pick<T, K>>;
    }
  }
  return result;
}

