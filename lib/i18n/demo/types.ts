/**
 * The /demo showcase carries structured mock content (posts, chat scripts, tables),
 * which `t()` cannot return, so each prototype keeps a typed TH/EN copy object here.
 * `Copy<typeof xTh>` makes the EN object fail to compile if any field is missing;
 * literal unions (e.g. severity) stay literal so both locales share the same values.
 */
export type Copy<T> = T extends string
  ? string extends T
    ? string
    : T
  : T extends number | boolean
  ? T
  : T extends readonly (infer U)[]
  ? Copy<U>[]
  : T extends object
  ? { [K in keyof T]: Copy<T[K]> }
  : T;

/** Replaces `{name}` placeholders, matching getTranslation()'s interpolation. */
export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match
  );
}
