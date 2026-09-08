export type PlainObject = Record<string, unknown>;

export function isObject(value: unknown): value is PlainObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function isPlainObject(
  value: unknown
): value is PlainObject {
  if (!isObject(value)) return false;

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

export function isEmptyObject(
  value: unknown
): boolean {
  return isPlainObject(value) &&
    Object.keys(value).length === 0;
}

export function objectKeys<T extends PlainObject>(
  value: T
): Array<keyof T> {
  return Object.keys(value) as Array<keyof T>;
}

export function objectValues<T extends PlainObject>(
  value: T
): Array<T[keyof T]> {
  return Object.values(value) as Array<T[keyof T]>;
}

export function objectEntries<T extends PlainObject>(
  value: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(value) as Array<
    [keyof T, T[keyof T]]
  >;
}

export function hasOwn(
  value: unknown,
  key: PropertyKey
): boolean {
  return (
    isObject(value) &&
    Object.prototype.hasOwnProperty.call(value, key)
  );
}

export function getOwn<T = unknown>(
  value: unknown,
  key: PropertyKey,
  fallback?: T
): T | undefined {
  if (!hasOwn(value, key)) {
    return fallback;
  }

  return (value as PlainObject)[key] as T;
}

export function getString(
  value: unknown,
  key: PropertyKey,
  fallback = ""
): string {
  const result = getOwn<unknown>(value, key);

  return typeof result === "string"
    ? result
    : fallback;
}

export function getNumber(
  value: unknown,
  key: PropertyKey,
  fallback = 0
): number {
  const result = getOwn<unknown>(value, key);

  return typeof result === "number" &&
    Number.isFinite(result)
    ? result
    : fallback;
}

export function getBoolean(
  value: unknown,
  key: PropertyKey,
  fallback = false
): boolean {
  const result = getOwn<unknown>(value, key);

  return typeof result === "boolean"
    ? result
    : fallback;
}

export function getArray<T = unknown>(
  value: unknown,
  key: PropertyKey,
  fallback: T[] = []
): T[] {
  const result = getOwn<unknown>(value, key);

  return Array.isArray(result)
    ? (result as T[])
    : fallback;
}

export function getObject(
  value: unknown,
  key: PropertyKey,
  fallback: PlainObject = {}
): PlainObject {
  const result = getOwn<unknown>(value, key);

  return isObject(result)
    ? result
    : fallback;
}

export function pick<T extends PlainObject>(
  value: T,
  keys: readonly string[]
): PlainObject {
  const result: PlainObject = {};

  for (const key of keys) {
    if (hasOwn(value, key)) {
      result[key] = value[key];
    }
  }

  return result;
}

export function omit<T extends PlainObject>(
  value: T,
  keys: readonly string[]
): PlainObject {
  const excluded = new Set(keys);

  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (!excluded.has(key)) {
      result[key] = item;
    }
  }

  return result;
}

export function omitUndefined<T extends PlainObject>(
  value: T
): PlainObject {
  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) {
      result[key] = item;
    }
  }

  return result;
}

export function omitNullish<T extends PlainObject>(
  value: T
): PlainObject {
  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (item !== null && item !== undefined) {
      result[key] = item;
    }
  }

  return result;
}

export function compactObject<T extends PlainObject>(
  value: T
): PlainObject {
  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (
      item !== undefined &&
      item !== null &&
      item !== ""
    ) {
      result[key] = item;
    }
  }

  return result;
}

export function mapObject<T extends PlainObject, R>(
  value: T,
  mapper: (
    value: T[keyof T],
    key: keyof T
  ) => R
): Record<string, R> {
  const result: Record<string, R> = {};

  for (const [key, item] of Object.entries(value)) {
    result[key] = mapper(
      item as T[keyof T],
      key as keyof T
    );
  }

  return result;
}

export function filterObject<T extends PlainObject>(
  value: T,
  predicate: (
    value: T[keyof T],
    key: keyof T
  ) => boolean
): PlainObject {
  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (
      predicate(
        item as T[keyof T],
        key as keyof T
      )
    ) {
      result[key] = item;
    }
  }

  return result;
}

export function mergeObjects(
  ...objects: Array<PlainObject | null | undefined>
): PlainObject {
  const result: PlainObject = {};

  for (const object of objects) {
    if (!isObject(object)) continue;

    Object.assign(result, object);
  }

  return result;
}

export function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function deepMerge<T extends PlainObject>(
  target: T,
  ...sources: Array<PlainObject | null | undefined>
): T {
  const result = deepClone(target) as PlainObject;

  for (const source of sources) {
    if (!isPlainObject(source)) continue;

    for (const [key, value] of Object.entries(source)) {
      if (
        isPlainObject(value) &&
        isPlainObject(result[key])
      ) {
        result[key] = deepMerge(
          result[key] as PlainObject,
          value
        );
      } else {
        result[key] = deepClone(value);
      }
    }
  }

  return result as T;
}

export function setNested(
  object: PlainObject,
  path: string | string[],
  value: unknown
): PlainObject {
  const parts = Array.isArray(path)
    ? path
    : path.split(".").filter(Boolean);

  if (parts.length === 0) {
    return object;
  }

  let current: PlainObject = object;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (!isPlainObject(current[part])) {
      current[part] = {};
    }

    current = current[part] as PlainObject;
  }

  current[parts[parts.length - 1]] = value;

  return object;
}

export function getNested<T = unknown>(
  object: unknown,
  path: string | string[],
  fallback?: T
): T | undefined {
  const parts = Array.isArray(path)
    ? path
    : path.split(".").filter(Boolean);

  let current: unknown = object;

  for (const part of parts) {
    if (!isObject(current) || !hasOwn(current, part)) {
      return fallback;
    }

    current = current[part];
  }

  return current as T;
}

export function hasNested(
  object: unknown,
  path: string | string[]
): boolean {
  const marker = Symbol("missing");
  return getNested(object, path, marker) !== marker;
}

export function deleteNested(
  object: PlainObject,
  path: string | string[]
): boolean {
  const parts = Array.isArray(path)
    ? path
    : path.split(".").filter(Boolean);

  if (parts.length === 0) {
    return false;
  }

  let current: unknown = object;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!isObject(current)) {
      return false;
    }

    current = current[parts[i]];
  }

  if (!isObject(current)) {
    return false;
  }

  const key = parts[parts.length - 1];

  if (!hasOwn(current, key)) {
    return false;
  }

  delete current[key];

  return true;
}

export function flattenObject(
  object: PlainObject,
  prefix = ""
): PlainObject {
  const result: PlainObject = {};

  for (const [key, value] of Object.entries(object)) {
    const fullKey = prefix
      ? `${prefix}.${key}`
      : key;

    if (isPlainObject(value)) {
      Object.assign(
        result,
        flattenObject(value, fullKey)
      );
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

export function unflattenObject(
  object: PlainObject
): PlainObject {
  const result: PlainObject = {};

  for (const [key, value] of Object.entries(object)) {
    setNested(result, key, value);
  }

  return result;
}

export function removeKeysDeep(
  value: unknown,
  keys: readonly string[]
): unknown {
  const excluded = new Set(keys);

  if (Array.isArray(value)) {
    return value.map((item) =>
      removeKeysDeep(item, keys)
    );
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (excluded.has(key)) {
      continue;
    }

    result[key] = removeKeysDeep(item, keys);
  }

  return result;
}

export function replaceValuesDeep(
  value: unknown,
  replacer: (value: unknown, key?: string) => unknown
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) =>
      replaceValuesDeep(item, replacer)
    );
  }

  if (!isPlainObject(value)) {
    return replacer(value);
  }

  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    result[key] = replaceValuesDeep(
      item,
      (nested) => replacer(nested, key)
    );
  }

  return result;
}

export function sanitizeObject(
  value: unknown,
  maxDepth = 10
): unknown {
  function sanitize(
    input: unknown,
    depth: number
  ): unknown {
    if (depth > maxDepth) {
      return null;
    }

    if (
      input === null ||
      typeof input === "string" ||
      typeof input === "number" ||
      typeof input === "boolean"
    ) {
      return input;
    }

    if (typeof input === "bigint") {
      return input.toString();
    }

    if (input instanceof Date) {
      return input.toISOString();
    }

    if (Array.isArray(input)) {
      return input.map((item) =>
        sanitize(item, depth + 1)
      );
    }

    if (isPlainObject(input)) {
      const result: PlainObject = {};

      for (const [key, item] of Object.entries(input)) {
        if (
          key === "__proto__" ||
          key === "prototype" ||
          key === "constructor"
        ) {
          continue;
        }

        result[key] = sanitize(
          item,
          depth + 1
        );
      }

      return result;
    }

    return String(input);
  }

  return sanitize(value, 0);
}

export function redactKeys(
  value: unknown,
  keys: readonly string[],
  replacement = "[REDACTED]"
): unknown {
  const sensitive = new Set(
    keys.map((key) => key.toLowerCase())
  );

  if (Array.isArray(value)) {
    return value.map((item) =>
      redactKeys(item, keys, replacement)
    );
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const result: PlainObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (sensitive.has(key.toLowerCase())) {
      result[key] = replacement;
    } else {
      result[key] = redactKeys(
        item,
        keys,
        replacement
      );
    }
  }

  return result;
}

export function removeSensitiveFields(
  value: unknown
): unknown {
  return redactKeys(value, [
    "password",
    "password_hash",
    "passwordHash",
    "token",
    "access_token",
    "accessToken",
    "refresh_token",
    "refreshToken",
    "api_key",
    "apiKey",
    "secret",
    "client_secret",
    "clientSecret",
    "private_key",
    "privateKey",
    "csrf_token",
    "csrfToken",
    "authorization",
    "cookie",
  ]);
}

export function objectSize(
  value: unknown
): number {
  if (!isObject(value)) {
    return 0;
  }

  return Object.keys(value).length;
}

export function deepEqual(
  first: unknown,
  second: unknown
): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    typeof first !== typeof second ||
    first === null ||
    second === null
  ) {
    return false;
  }

  if (Array.isArray(first) || Array.isArray(second)) {
    if (
      !Array.isArray(first) ||
      !Array.isArray(second) ||
      first.length !== second.length
    ) {
      return false;
    }

    return first.every(
      (value, index) =>
        deepEqual(value, second[index])
    );
  }

  if (
    isPlainObject(first) &&
    isPlainObject(second)
  ) {
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) {
      return false;
    }

    return firstKeys.every(
      (key) =>
        hasOwn(second, key) &&
        deepEqual(first[key], second[key])
    );
  }

  return false;
}

export function invertObject(
  value: PlainObject
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, item] of Object.entries(value)) {
    result[String(item)] = key;
  }

  return result;
}

export function groupByKey<T extends PlainObject>(
  items: T[],
  key: keyof T
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const item of items) {
    const group = String(item[key]);

    if (!result[group]) {
      result[group] = [];
    }

    result[group].push(item);
  }

  return result;
}

export function indexByKey<T extends PlainObject>(
  items: T[],
  key: keyof T
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const item of items) {
    const value = item[key];

    if (
      value !== null &&
      value !== undefined
    ) {
      result[String(value)] = item;
    }
  }

  return result;
}

export function toRecord<T>(
  entries: Array<[string, T]>
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const [key, value] of entries) {
    result[key] = value;
  }

  return result;
}

export function fromRecord<T>(
  record: Record<string, T>
): Array<[string, T]> {
  return Object.entries(record);
}

export function ensureObject(
  value: unknown
): PlainObject {
  return isPlainObject(value)
    ? value
    : {};
}

export function ensureArray<T>(
  value: unknown
): T[] {
  return Array.isArray(value)
    ? (value as T[])
    : [];
    }
