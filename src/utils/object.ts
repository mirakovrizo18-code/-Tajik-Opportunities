/**
 * Object Utilities
 * Tajik Opportunities
 *
 * Безопасные утилиты для работы с объектами.
 * Совместимо с TypeScript strict mode и Cloudflare Workers.
 */

export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

export type AnyObject = Record<string, unknown>;

export type UnknownRecord = Record<PropertyKey, unknown>;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!isObject(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    typeof value === "symbol"
  );
}

export function hasOwn(
  object: object,
  key: PropertyKey,
): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function hasProperty(
  object: unknown,
  key: PropertyKey,
): boolean {
  return isObject(object) && hasOwn(object, key);
}

export function getProperty<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback?: T,
): T | unknown {
  if (!isObject(object)) {
    return fallback;
  }

  return Reflect.has(object, key)
    ? Reflect.get(object, key)
    : fallback;
}

export function getObjectValue<T>(
  object: object,
  key: PropertyKey,
  fallback?: T,
): T | undefined {
  const value = Reflect.get(object, key);

  return value === undefined
    ? fallback
    : (value as T);
}

export function setProperty<T extends object>(
  object: T,
  key: PropertyKey,
  value: unknown,
): T {
  Reflect.set(object, key, value);
  return object;
}

export function deleteProperty<T extends object>(
  object: T,
  key: PropertyKey,
): boolean {
  return Reflect.deleteProperty(object, key);
}

export function pick<
  T extends Record<PropertyKey, unknown>,
  K extends keyof T,
>(
  object: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (hasOwn(object, key)) {
      result[key] = object[key];
    }
  }

  return result;
}

export function omit<
  T extends Record<PropertyKey, unknown>,
  K extends keyof T,
>(
  object: T,
  keys: readonly K[],
): Omit<T, K> {
  const excluded = new Set<PropertyKey>(keys);
  const result = {} as Omit<T, K>;

  for (const key of Reflect.ownKeys(object)) {
    if (!excluded.has(key)) {
      Reflect.set(result, key, Reflect.get(object, key));
    }
  }

  return result;
}

export function removeUndefined<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

export function removeNull<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (value !== null) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

export function sanitizeObject<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (value !== null && value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

export function objectKeys<T extends object>(
  object: T,
): Array<keyof T> {
  return Object.keys(object) as Array<keyof T>;
}

export function objectValues<T extends object>(
  object: T,
): Array<T[keyof T]> {
  return Object.values(object) as Array<T[keyof T]>;
}

export function objectEntries<T extends object>(
  object: T,
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(object) as Array<
    [keyof T, T[keyof T]]
  >;
}

export function objectSize(object: object): number {
  return Reflect.ownKeys(object).length;
}

export function isEmptyObject(object: object): boolean {
  return objectSize(object) === 0;
}

export function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  if (Array.isArray(value)) {
    return [...value] as T;
  }

  if (isPlainObject(value)) {
    return { ...value } as T;
  }

  return value;
}

export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

export function merge<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(
  first: T,
  second: U,
): T & U {
  return {
    ...first,
    ...second,
  } as T & U;
}

export function deepMerge<T extends AnyObject>(
  target: T,
  ...sources: AnyObject[]
): T {
  const result = deepClone(target);

  for (const source of sources) {
    mergeInto(result, source);
  }

  return result;
}

function mergeInto(
  target: AnyObject,
  source: AnyObject,
): void {
  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = target[key];

    if (
      isPlainObject(targetValue) &&
      isPlainObject(sourceValue)
    ) {
      mergeInto(targetValue, sourceValue);
      continue;
    }

    target[key] = deepClone(sourceValue);
  }
}

export function mapObject<
  T extends AnyObject,
  R,
>(
  object: T,
  callback: (
    value: T[keyof T],
    key: keyof T,
    object: T,
  ) => R,
): Record<string, R> {
  const result: Record<string, R> = {};

  for (const [key, value] of Object.entries(object)) {
    result[key] = callback(
      value as T[keyof T],
      key as keyof T,
      object,
    );
  }

  return result;
}

export function filterObject<T extends AnyObject>(
  object: T,
  predicate: (
    value: T[keyof T],
    key: keyof T,
    object: T,
  ) => boolean,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (
      predicate(
        value as T[keyof T],
        key as keyof T,
        object,
      )
    ) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

export function findObjectValue<T extends AnyObject>(
  object: T,
  predicate: (
    value: T[keyof T],
    key: keyof T,
  ) => boolean,
): T[keyof T] | undefined {
  for (const [key, value] of Object.entries(object)) {
    if (
      predicate(
        value as T[keyof T],
        key as keyof T,
      )
    ) {
      return value as T[keyof T];
    }
  }

  return undefined;
}

export function freeze<T>(value: T): Readonly<T> {
  return Object.freeze(value);
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (!isObject(value)) {
    return value;
  }

  for (const key of Reflect.ownKeys(value)) {
    const nested = Reflect.get(value, key);

    if (isObject(nested) && !Object.isFrozen(nested)) {
      deepFreeze(nested);
    }
  }

  return Object.freeze(value);
}

export function safeJsonParse<T = unknown>(
  value: string,
  fallback?: T,
): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(
  value: unknown,
  fallback = "",
): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

export function fromEntries<K extends PropertyKey, V>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

export function invertObject(
  object: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(object)) {
    result[value] = key;
  }

  return result;
}

export function compactObject<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(object)) {
    if (value) {
      result[key as keyof T] = value as T[keyof T];
    }
  }

  return result;
}

export function equals(
  first: unknown,
  second: unknown,
): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    !isPlainObject(first) ||
    !isPlainObject(second)
  ) {
    return false;
  }

  const firstKeys = Reflect.ownKeys(first);
  const secondKeys = Reflect.ownKeys(second);

  if (firstKeys.length !== secondKeys.length) {
    return false;
  }

  for (const key of firstKeys) {
    if (
      !Reflect.has(second, key) ||
      !equals(
        Reflect.get(first, key),
        Reflect.get(second, key),
      )
    ) {
      return false;
    }
  }

  return true;
}
