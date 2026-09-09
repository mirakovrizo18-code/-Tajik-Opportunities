/**
 * Object Utilities
 * Tajik Opportunities
 *
 * Расширенный набор безопасных утилит для работы с объектами.
 *
 * Совместимо:
 * - TypeScript strict mode
 * - Cloudflare Workers
 * - D1 / KV / R2
 * - ES2022+
 *
 * Особенности:
 * - безопасная работа с PropertyKey
 * - поддержка string / number / symbol ключей
 * - deep clone / deep merge / deep equal
 * - безопасный JSON
 * - pick / omit
 * - map / filter / reduce
 * - flatten / unflatten
 * - группировка и индексация
 * - очистка объектов
 * - immutable helpers
 * - type guards
 * - защита от prototype pollution
 */

/* ============================================================================
 * TYPES
 * ========================================================================== */

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

export type Nullish<T> = T | null | undefined;

export type Dictionary<T = unknown> = Record<string, T>;

export type KeyValue<K extends PropertyKey = PropertyKey, V = unknown> = {
  key: K;
  value: V;
};

export type ObjectEntry<K extends PropertyKey = PropertyKey, V = unknown> =
  readonly [K, V];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? DeepRequired<T[P]>
    : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

export type NonNullableObject<T extends object> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type WritableKeys<T> = {
  [K in keyof T]-?: (<U>() => U extends {
    [P in K]: T[K];
  }
    ? 1
    : 2) extends <U>() => U extends {
    -readonly [P in K]: T[K];
  }
    ? 1
    : 2
  ? K
  : never;
}[keyof T];

export type ObjectPath = string | readonly PropertyKey[];

export type ObjectPathValue<T, P extends readonly PropertyKey[]> =
  P extends readonly [
    infer K extends keyof T,
    ...infer Rest extends PropertyKey[],
  ]
    ? Rest extends []
      ? T[K]
      : ObjectPathValue<T[K], Rest>
    : never;

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DANGEROUS_KEYS = new Set<PropertyKey>([
  "__proto__",
  "prototype",
  "constructor",
]);

const EMPTY_OBJECT: Readonly<Record<string, never>> = Object.freeze({});

/* ============================================================================
 * TYPE GUARDS
 * ========================================================================== */

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function isFunction(
  value: unknown,
): value is (...args: never[]) => unknown {
  return typeof value === "function";
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

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === "bigint";
}

export function isSymbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!isObject(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

export function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map;
}

export function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set;
}

export function isPromiseLike(
  value: unknown,
): value is PromiseLike<unknown> {
  return (
    isObject(value) &&
    "then" in value &&
    typeof value.then === "function"
  );
}

/* ============================================================================
 * KEY HELPERS
 * ========================================================================== */

export function isPropertyKey(value: unknown): value is PropertyKey {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "symbol"
  );
}

export function normalizeKey(key: PropertyKey): PropertyKey {
  if (typeof key === "number") {
    return String(key);
  }

  return key;
}

export function isDangerousKey(key: PropertyKey): boolean {
  return (
    typeof key === "string" &&
    DANGEROUS_KEYS.has(key)
  );
}

export function safeKey(key: PropertyKey): boolean {
  return !isDangerousKey(key);
}

/* ============================================================================
 * OWN PROPERTY HELPERS
 * ========================================================================== */

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

export function hasAnyProperty(
  object: unknown,
  keys: readonly PropertyKey[],
): boolean {
  if (!isObject(object)) {
    return false;
  }

  return keys.some((key) => hasOwn(object, key));
}

export function hasAllProperties(
  object: unknown,
  keys: readonly PropertyKey[],
): boolean {
  if (!isObject(object)) {
    return false;
  }

  return keys.every((key) => hasOwn(object, key));
}

/* ============================================================================
 * GETTERS
 * ========================================================================== */

export function getProperty<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback?: T,
): T | undefined {
  if (!isObject(object)) {
    return fallback;
  }

  if (!Reflect.has(object, key)) {
    return fallback;
  }

  return Reflect.get(object, key) as T;
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

export function getString(
  object: unknown,
  key: PropertyKey,
  fallback = "",
): string {
  const value = getProperty<unknown>(object, key);

  return typeof value === "string"
    ? value
    : fallback;
}

export function getNumber(
  object: unknown,
  key: PropertyKey,
  fallback = 0,
): number {
  const value = getProperty<unknown>(object, key);

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

export function getBoolean(
  object: unknown,
  key: PropertyKey,
  fallback = false,
): boolean {
  const value = getProperty<unknown>(object, key);

  return typeof value === "boolean"
    ? value
    : fallback;
}

export function getArray<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback: readonly T[] = [],
): readonly T[] {
  const value = getProperty<unknown>(object, key);

  return Array.isArray(value)
    ? (value as T[])
    : fallback;
}

/* ============================================================================
 * SETTERS / MUTATION
 * ========================================================================== */

export function setProperty<T extends object>(
  object: T,
  key: PropertyKey,
  value: unknown,
): T {
  if (!safeKey(key)) {
    return object;
  }

  Reflect.set(object, key, value);

  return object;
}

export function setProperties<T extends object>(
  object: T,
  values: UnknownRecord,
): T {
  for (const key of Reflect.ownKeys(values)) {
    if (!safeKey(key)) {
      continue;
    }

    Reflect.set(
      object,
      key,
      Reflect.get(values, key),
    );
  }

  return object;
}

export function deleteProperty<T extends object>(
  object: T,
  key: PropertyKey,
): boolean {
  return Reflect.deleteProperty(object, key);
}

export function deleteProperties<T extends object>(
  object: T,
  keys: readonly PropertyKey[],
): T {
  for (const key of keys) {
    Reflect.deleteProperty(object, key);
  }

  return object;
}

/* ============================================================================
 * PICK / OMIT
 * ========================================================================== */

export function pick<
  T extends UnknownRecord,
  K extends keyof T,
>(
  object: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (hasOwn(object, key)) {
      Reflect.set(
        result,
        key,
        Reflect.get(object, key),
      );
    }
  }

  return result;
}

export function omit<
  T extends UnknownRecord,
  K extends keyof T,
>(
  object: T,
  keys: readonly K[],
): Omit<T, K> {
  const excluded = new Set<PropertyKey>(keys);
  const result = {} as Omit<T, K>;

  for (const key of Reflect.ownKeys(object)) {
    if (!excluded.has(key)) {
      Reflect.set(
        result,
        key,
        Reflect.get(object, key),
      );
    }
  }

  return result;
}

export function pickDefined<T extends UnknownRecord>(
  object: T,
): Partial<T> {
  return removeUndefined(object);
}

export function pickNonNull<T extends UnknownRecord>(
  object: T,
): Partial<T> {
  return removeNull(object);
}

/* ============================================================================
 * CLEANING
 * ========================================================================== */

export function removeUndefined<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (value !== undefined) {
      Reflect.set(result, key, value);
    }
  }

  return result;
}

export function removeNull<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (value !== null) {
      Reflect.set(result, key, value);
    }
  }

  return result;
}

export function sanitizeObject<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (value !== null && value !== undefined) {
      Reflect.set(result, key, value);
    }
  }

  return result;
}

export function compactObject<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (Boolean(value)) {
      Reflect.set(result, key, value);
    }
  }

  return result;
}

export function removeEmptyStrings<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    if (
      typeof value !== "string" ||
      value.trim() !== ""
    ) {
      Reflect.set(result, key, value);
    }
  }

  return result;
}

export function trimStrings<T extends AnyObject>(
  object: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    Reflect.set(
      result,
      key,
      typeof value === "string"
        ? value.trim()
        : value,
    );
  }

  return result;
}

export function removeKeys(
  object: UnknownRecord,
  predicate: (
    key: PropertyKey,
    value: unknown,
  ) => boolean,
): UnknownRecord {
  const result: UnknownRecord = {};

  for (const key of Reflect.ownKeys(object)) {
    const value = Reflect.get(object, key);

    if (!predicate(key, value)) {
      Reflect.set(result, key, value);
    }
  }

  return result;
}

/* ============================================================================
 * KEYS / VALUES / ENTRIES
 * ========================================================================== */

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

export function ownKeys(
  object: object,
): PropertyKey[] {
  return Reflect.ownKeys(object);
}

export function stringKeys(
  object: object,
): string[] {
  return Object.keys(object);
}

export function symbolKeys(
  object: object,
): symbol[] {
  return Object.getOwnPropertySymbols(object);
}

export function objectSize(
  object: object,
): number {
  return Reflect.ownKeys(object).length;
}

export function enumerableObjectSize(
  object: object,
): number {
  return Object.keys(object).length;
}

export function isEmptyObject(
  object: object,
): boolean {
  return objectSize(object) === 0;
}

export function isEnumerableEmpty(
  object: object,
): boolean {
  return enumerableObjectSize(object) === 0;
}

/* ============================================================================
 * CONVERSION
 * ========================================================================== */

export function toRecord(
  value: unknown,
): UnknownRecord {
  if (isPlainObject(value)) {
    return value;
  }

  return {};
}

export function toObject<T extends UnknownRecord>(
  value: unknown,
  fallback: T,
): T {
  return isPlainObject(value)
    ? (value as T)
    : fallback;
}

export function fromEntries<
  K extends PropertyKey,
  V,
>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

export function toEntries(
  object: object,
): Array<[PropertyKey, unknown]> {
  return Reflect.ownKeys(object).map(
    (key) => [
      key,
      Reflect.get(object, key),
    ],
  );
}

export function toKeyValueArray(
  object: object,
): Array<KeyValue> {
  return Reflect.ownKeys(object).map(
    (key) => ({
      key,
      value: Reflect.get(object, key),
    }),
  );
}

/* ============================================================================
 * MAP / FILTER / REDUCE
 * ========================================================================== */

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

  for (const key of Object.keys(object)) {
    result[key] = callback(
      object[key],
      key as keyof T,
      object,
    );
  }

  return result;
}

export function mapEntries<
  T extends AnyObject,
  R,
>(
  object: T,
  callback: (
    value: unknown,
    key: string,
    object: T,
  ) => readonly [string, R],
): Record<string, R> {
  const entries: Array<readonly [string, R]> = [];

  for (const key of Object.keys(object)) {
    entries.push(
      callback(
        object[key],
        key,
        object,
      ),
    );
  }

  return Object.fromEntries(entries) as Record<
    string,
    R
  >;
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

  for (const key of Object.keys(object)) {
    const typedKey = key as keyof T;
    const value = object[typedKey];

    if (
      predicate(
        value,
        typedKey,
        object,
      )
    ) {
      Reflect.set(result, key, value);
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
  for (const key of Object.keys(object)) {
    const typedKey = key as keyof T;
    const value = object[typedKey];

    if (
      predicate(
        value,
        typedKey,
      )
    ) {
      return value;
    }
  }

  return undefined;
}

export function findObjectEntry<T extends AnyObject>(
  object: T,
  predicate: (
    value: T[keyof T],
    key: keyof T,
  ) => boolean,
): [keyof T, T[keyof T]] | undefined {
  for (const key of Object.keys(object)) {
    const typedKey = key as keyof T;
    const value = object[typedKey];

    if (
      predicate(
        value,
        typedKey,
      )
    ) {
      return [typedKey, value];
    }
  }

  return undefined;
}

export function reduceObject<
  T extends AnyObject,
  R,
>(
  object: T,
  callback: (
    accumulator: R,
    value: T[keyof T],
    key: keyof T,
    object: T,
  ) => R,
  initialValue: R,
): R {
  let accumulator = initialValue;

  for (const key of Object.keys(object)) {
    const typedKey = key as keyof T;

    accumulator = callback(
      accumulator,
      object[typedKey],
      typedKey,
      object,
    );
  }

  return accumulator;
}

/* ============================================================================
 * SEARCH / QUERY
 * ========================================================================== */

export function findKey<T extends object>(
  object: T,
  predicate: (
    value: unknown,
    key: PropertyKey,
  ) => boolean,
): PropertyKey | undefined {
  for (const key of Reflect.ownKeys(object)) {
    const value = Reflect.get(object, key);

    if (predicate(value, key)) {
      return key;
    }
  }

  return undefined;
}

export function findValue<T = unknown>(
  object: object,
  predicate: (
    value: unknown,
    key: PropertyKey,
  ) => boolean,
): T | undefined {
  const key = findKey(
    object,
    predicate,
  );

  return key === undefined
    ? undefined
    : (Reflect.get(object, key) as T);
}

export function containsValue(
  object: object,
  expected: unknown,
): boolean {
  return Reflect.ownKeys(object).some(
    (key) =>
      Object.is(
        Reflect.get(object, key),
        expected,
      ),
  );
}

export function containsKey(
  object: object,
  key: PropertyKey,
): boolean {
  return hasOwn(object, key);
}

/* ============================================================================
 * CLONE
 * ========================================================================== */

export function clone<T>(value: T): T {
  if (
    typeof structuredClone === "function"
  ) {
    try {
      return structuredClone(value);
    } catch {
      // Fallback below.
    }
  }

  return shallowClone(value);
}

export function shallowClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return [...value] as T;
  }

  if (isDate(value)) {
    return new Date(value.getTime()) as T;
  }

  if (isRegExp(value)) {
    return new RegExp(
      value.source,
      value.flags,
    ) as T;
  }

  if (isMap(value)) {
    return new Map(value) as T;
  }

  if (isSet(value)) {
    return new Set(value) as T;
  }

  if (isPlainObject(value)) {
    const result: UnknownRecord = {};

    for (const key of Reflect.ownKeys(value)) {
      if (safeKey(key)) {
        Reflect.set(
          result,
          key,
          Reflect.get(value, key),
        );
      }
    }

    return result as T;
  }

  return value;
}

export function deepClone<T>(value: T): T {
  if (
    typeof structuredClone === "function"
  ) {
    return structuredClone(value);
  }

  return deepCloneFallback(
    value,
    new WeakMap<object, unknown>(),
  ) as T;
}

function deepCloneFallback(
  value: unknown,
  seen: WeakMap<object, unknown>,
): unknown {
  if (!isObject(value)) {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  if (isDate(value)) {
    return new Date(
      value.getTime(),
    );
  }

  if (isRegExp(value)) {
    return new RegExp(
      value.source,
      value.flags,
    );
  }

  if (isMap(value)) {
    const result = new Map();

    seen.set(value, result);

    for (const [
      key,
      nested,
    ] of value.entries()) {
      result.set(
        deepCloneFallback(key, seen),
        deepCloneFallback(nested, seen),
      );
    }

    return result;
  }

  if (isSet(value)) {
    const result = new Set();

    seen.set(value, result);

    for (const item of value.values()) {
      result.add(
        deepCloneFallback(item, seen),
      );
    }

    return result;
  }

  if (Array.isArray(value)) {
    const result: unknown[] = [];

    seen.set(value, result);

    for (const item of value) {
      result.push(
        deepCloneFallback(item, seen),
      );
    }

    return result;
  }

  const result: UnknownRecord = {};

  seen.set(value, result);

  for (const key of Reflect.ownKeys(value)) {
    if (!safeKey(key)) {
      continue;
    }

    Reflect.set(
      result,
      key,
      deepCloneFallback(
        Reflect.get(value, key),
        seen,
      ),
    );
  }

  return result;
}

/* ============================================================================
 * MERGE
 * ========================================================================== */

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

export function mergeMany<T extends AnyObject>(
  ...objects: AnyObject[]
): T {
  const result: UnknownRecord = {};

  for (const object of objects) {
    for (const key of Object.keys(object)) {
      if (!safeKey(key)) {
        continue;
      }

      result[key] = object[key];
    }
  }

  return result as T;
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
  target: UnknownRecord,
  source: UnknownRecord,
): void {
  for (const key of Reflect.ownKeys(source)) {
    if (!safeKey(key)) {
      continue;
    }

    const sourceValue = Reflect.get(
      source,
      key,
    );

    const targetValue = Reflect.get(
      target,
      key,
    );

    if (
      isPlainObject(targetValue) &&
      isPlainObject(sourceValue)
    ) {
      mergeInto(
        targetValue,
        sourceValue,
      );
      continue;
    }

    Reflect.set(
      target,
      key,
      deepClone(sourceValue),
    );
  }
}

export function mergeDefined<T extends AnyObject>(
  ...objects: Array<Partial<T> | undefined | null>
): Partial<T> {
  const result: Partial<T> = {};

  for (const object of objects) {
    if (!object) {
      continue;
    }

    for (const key of Object.keys(object)) {
      const value = object[key];

      if (value !== undefined) {
        Reflect.set(
          result,
          key,
          value,
        );
      }
    }
  }

  return result;
}

/* ============================================================================
 * IMMUTABLE UPDATES
 * ========================================================================== */

export function withProperty<
  T extends object,
  K extends PropertyKey,
  V,
>(
  object: T,
  key: K,
  value: V,
): T & Record<K, V> {
  const result = shallowClone(object);

  Reflect.set(
    result as object,
    key,
    value,
  );

  return result as T & Record<K, V>;
}

export function withoutProperty<
  T extends object,
  K extends keyof T,
>(
  object: T,
  key: K,
): Omit<T, K> {
  return omit(
    object as UnknownRecord,
    [key],
  ) as Omit<T, K>;
}

export function updateObject<
  T extends AnyObject,
>(
  object: T,
  updater: (
    draft: Mutable<T>,
  ) => void,
): T {
  const result = deepClone(object) as Mutable<T>;

  updater(result);

  return result;
}

/* ============================================================================
 * FREEZE
 * ========================================================================== */

export function freeze<T>(
  value: T,
): Readonly<T> {
  return Object.freeze(value);
}

export function deepFreeze<T>(
  value: T,
): DeepReadonly<T> {
  if (!isObject(value)) {
    return value as DeepReadonly<T>;
  }

  for (const key of Reflect.ownKeys(value)) {
    const nested = Reflect.get(
      value,
      key,
    );

    if (
      isObject(nested) &&
      !Object.isFrozen(nested)
    ) {
      deepFreeze(nested);
    }
  }

  return Object.freeze(
    value,
  ) as DeepReadonly<T>;
}

export function isFrozen(
  value: unknown,
): boolean {
  return isObject(value)
    ? Object.isFrozen(value)
    : true;
}

/* ============================================================================
 * EQUALITY
 * ========================================================================== */

export function equals(
  first: unknown,
  second: unknown,
): boolean {
  if (Object.is(first, second)) {
    return true;
  }

  if (
    isDate(first) &&
    isDate(second)
  ) {
    return (
      first.getTime() ===
      second.getTime()
    );
  }

  if (
    isRegExp(first) &&
    isRegExp(second)
  ) {
    return (
      first.source === second.source &&
      first.flags === second.flags
    );
  }

  if (
    Array.isArray(first) &&
    Array.isArray(second)
  ) {
    if (first.length !== second.length) {
      return false;
    }

    for (let i = 0; i < first.length; i += 1) {
      if (!equals(first[i], second[i])) {
        return false;
      }
    }

    return true;
  }

  if (
    isMap(first) &&
    isMap(second)
  ) {
    if (first.size !== second.size) {
      return false;
    }

    for (const [key, value] of first) {
      if (
        !second.has(key) ||
        !equals(
          value,
          second.get(key),
        )
      ) {
        return false;
      }
    }

    return true;
  }

  if (
    isSet(first) &&
    isSet(second)
  ) {
    if (first.size !== second.size) {
      return false;
    }

    for (const value of first) {
      if (!second.has(value)) {
        return false;
      }
    }

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

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  for (const key of firstKeys) {
    if (!Reflect.has(second, key)) {
      return false;
    }

    if (
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

export function shallowEquals(
  first: object,
  second: object,
): boolean {
  const firstKeys = Reflect.ownKeys(first);
  const secondKeys = Reflect.ownKeys(second);

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  for (const key of firstKeys) {
    if (
      !Reflect.has(second, key) ||
      !Object.is(
        Reflect.get(first, key),
        Reflect.get(second, key),
      )
    ) {
      return false;
    }
  }

  return true;
}

/* ============================================================================
 * JSON
 * ========================================================================== */

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

export function parseJson<T = unknown>(
  value: unknown,
  fallback?: T,
): T | undefined {
  if (typeof value !== "string") {
    return fallback;
  }

  return safeJsonParse<T>(
    value,
    fallback,
  );
}

export function safeJsonStringify(
  value: unknown,
  fallback = "",
): string {
  try {
    return JSON.stringify(
      value,
      bigintReplacer,
    );
  } catch {
    return fallback;
  }
}

export function jsonStringify<T>(
  value: T,
): string | undefined {
  try {
    return JSON.stringify(
      value,
      bigintReplacer,
    );
  } catch {
    return undefined;
  }
}

function bigintReplacer(
  _key: string,
  value: unknown,
): unknown {
  return typeof value === "bigint"
    ? value.toString()
    : value;
}

/* ============================================================================
 * FLATTEN / UNFLATTEN
 * ========================================================================== */

export function flattenObject(
  object: UnknownRecord,
  prefix = "",
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(object)) {
    const value = object[key];

    const path = prefix
      ? `${prefix}.${key}`
      : key;

    if (
      isPlainObject(value) &&
      Object.keys(value).length > 0
    ) {
      Object.assign(
        result,
        flattenObject(
          value,
          path,
        ),
      );
    } else {
      result[path] = value;
    }
  }

  return result;
}

export function unflattenObject(
  object: Record<string, unknown>,
): UnknownRecord {
  const result: UnknownRecord = {};

  for (const [path, value] of Object.entries(object)) {
    const parts = path.split(".");

    let current: UnknownRecord = result;

    for (
      let index = 0;
      index < parts.length;
      index += 1
    ) {
      const part = parts[index];

      if (!safeKey(part)) {
        break;
      }

      const last =
        index === parts.length - 1;

      if (last) {
        Reflect.set(
          current,
          part,
          value,
        );
        continue;
      }

      const existing =
        Reflect.get(current, part);

      if (
        !isPlainObject(existing)
      ) {
        const next: UnknownRecord = {};

        Reflect.set(
          current,
          part,
          next,
        );

        current = next;
      } else {
        current = existing;
      }
    }
  }

  return result;
}

/* ============================================================================
 * PATH ACCESS
 * ========================================================================== */

export function parsePath(
  path: ObjectPath,
): PropertyKey[] {
  if (Array.isArray(path)) {
    return [...path];
  }

  if (!path) {
    return [];
  }

  return path
    .split(".")
    .filter(Boolean);
}

export function getPath<T = unknown>(
  object: unknown,
  path: ObjectPath,
  fallback?: T,
): T | undefined {
  const keys = parsePath(path);

  let current: unknown = object;

  for (const key of keys) {
    if (!isObject(current)) {
      return fallback;
    }

    if (!Reflect.has(current, key)) {
      return fallback;
    }

    current = Reflect.get(
      current,
      key,
    );
  }

  return current === undefined
    ? fallback
    : (current as T);
}

export function hasPath(
  object: unknown,
  path: ObjectPath,
): boolean {
  const keys = parsePath(path);

  if (keys.length === 0) {
    return false;
  }

  let current: unknown = object;

  for (const key of keys) {
    if (
      !isObject(current) ||
      !Reflect.has(current, key)
    ) {
      return false;
    }

    current = Reflect.get(
      current,
      key,
    );
  }

  return true;
}

export function setPath<T extends object>(
  object: T,
  path: ObjectPath,
  value: unknown,
): T {
  const keys = parsePath(path);

  if (keys.length === 0) {
    return object;
  }

  let current: UnknownRecord =
    object as UnknownRecord;

  for (
    let index = 0;
    index < keys.length;
    index += 1
  ) {
    const key = keys[index];

    if (!safeKey(key)) {
      return object;
    }

    const last =
      index === keys.length - 1;

    if (last) {
      Reflect.set(
        current,
        key,
        value,
      );
      break;
    }

    const existing =
      Reflect.get(current, key);

    if (!isObject(existing)) {
      const next: UnknownRecord = {};

      Reflect.set(
        current,
        key,
        next,
      );

      current = next;
    } else {
      current = existing as UnknownRecord;
    }
  }

  return object;
}

export function deletePath<T extends object>(
  object: T,
  path: ObjectPath,
): boolean {
  const keys = parsePath(path);

  if (keys.length === 0) {
    return false;
  }

  let current: unknown = object;

  for (
    let index = 0;
    index < keys.length - 1;
    index += 1
  ) {
    const key = keys[index];

    if (
      !isObject(current) ||
      !Reflect.has(current, key)
    ) {
      return false;
    }

    current = Reflect.get(
      current,
      key,
    );
  }

  if (!isObject(current)) {
    return false;
  }

  return Reflect.deleteProperty(
    current,
    keys[keys.length - 1],
  );
}

/* ============================================================================
 * GROUPING / INDEXING
 * ========================================================================== */

export function groupBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  items.forEach((item, index) => {
    const key = String(
      getKey(item, index),
    );

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(item);
  });

  return result;
}

export function keyBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Record<string, T> {
  const result: Record<string, T> = {};

  items.forEach((item, index) => {
    const key = String(
      getKey(item, index),
    );

    result[key] = item;
  });

  return result;
}

export function countBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Record<string, number> {
  const result: Record<string, number> = {};

  items.forEach((item, index) => {
    const key = String(
      getKey(item, index),
    );

    result[key] =
      (result[key] ?? 0) + 1;
  });

  return result;
}

export function indexBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Map<PropertyKey, T> {
  const result = new Map<PropertyKey, T>();

  items.forEach((item, index) => {
    result.set(
      getKey(item, index),
      item,
    );
  });

  return result;
}

/* ============================================================================
 * TRANSFORMATIONS
 * ========================================================================== */

export function invertObject(
  object: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(object)) {
    if (safeKey(value)) {
      result[value] = key;
    }
  }

  return result;
}

export function invertObjectMulti(
  object: Record<string, string>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(object)) {
    if (!safeKey(value)) {
      continue;
    }

    if (!result[value]) {
      result[value] = [];
    }

    result[value].push(key);
  }

  return result;
}

export function renameKeys<T extends AnyObject>(
  object: T,
  mapping: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(object)) {
    const nextKey =
      mapping[key] ?? key;

    if (!safeKey(nextKey)) {
      continue;
    }

    result[nextKey] = object[key];
  }

  return result;
}

export function mapKeys<T extends AnyObject>(
  object: T,
  callback: (
    key: string,
    value: T[string],
  ) => string,
): Record<string, T[string]> {
  const result: Record<string, T[string]> = {};

  for (const key of Object.keys(object)) {
    const nextKey = callback(
      key,
      object[key],
    );

    if (!safeKey(nextKey)) {
      continue;
    }

    result[nextKey] = object[key];
  }

  return result;
}

/* ============================================================================
 * DEFAULTS / FALLBACKS
 * ========================================================================== */

export function defaults<T extends AnyObject>(
  object: T,
  ...sources: AnyObject[]
): T {
  const result = {
    ...object,
  } as T;

  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (
        !hasOwn(result, key) ||
        result[key] === undefined
      ) {
        Reflect.set(
          result,
          key,
          source[key],
        );
      }
    }
  }

  return result;
}

export function withDefaults<T extends AnyObject>(
  object: T | null | undefined,
  fallback: T,
): T {
  if (!object) {
    return deepClone(fallback);
  }

  return deepMerge(
    deepClone(fallback),
    object,
  );
}

/* ============================================================================
 * NULLISH / VALUE HELPERS
 * ========================================================================== */

export function firstDefined<T>(
  ...values: Array<T | undefined>
): T | undefined {
  return values.find(
    (value) => value !== undefined,
  );
}

export function firstNonNullish<T>(
  ...values: Array<T | null | undefined>
): T | undefined {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined,
  );
}

export function valueOr<T>(
  value: T | null | undefined,
  fallback: T,
): T {
  return value == null
    ? fallback
    : value;
}

export function valueOrNull<T>(
  value: T | undefined,
): T | null {
  return value === undefined
    ? null
    : value;
}

/* ============================================================================
 * SORTING
 * ========================================================================== */

export function sortObjectKeys(
  object: UnknownRecord,
  compare?: (
    a: string,
    b: string,
  ) => number,
): UnknownRecord {
  const keys = Object.keys(object).sort(
    compare,
  );

  const result: UnknownRecord = {};

  for (const key of keys) {
    result[key] = object[key];
  }

  return result;
}

export function sortObjectByValue<T>(
  object: Record<string, T>,
  compare: (
    a: T,
    b: T,
  ) => number,
): Record<string, T> {
  const entries = Object.entries(object);

  entries.sort(
    ([, a], [, b]) =>
      compare(a, b),
  );

  return Object.fromEntries(
    entries,
  ) as Record<string, T>;
}

/* ============================================================================
 * SAFE OBJECT CREATION
 * ========================================================================== */

export function createNullObject(): UnknownRecord {
  return Object.create(null) as UnknownRecord;
}

export function createSafeObject(
  entries?: Iterable<readonly [PropertyKey, unknown]>,
): UnknownRecord {
  const result: UnknownRecord = {};

  if (!entries) {
    return result;
  }

  for (const [key, value] of entries) {
    if (!safeKey(key)) {
      continue;
    }

    Reflect.set(
      result,
      key,
      value,
    );
  }

  return result;
}

/* ============================================================================
 * ARRAY / OBJECT HELPERS
 * ========================================================================== */

export function objectToArray<T = unknown>(
  object: object,
): T[] {
  return objectValues(object) as T[];
}

export function objectToPairs(
  object: object,
): Array<[string, unknown]> {
  return Object.entries(object);
}

export function arrayToObject<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Record<string, T> {
  return keyBy(
    items,
    getKey,
  );
}

export function arrayToDictionary<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => string,
): Dictionary<T> {
  const result: Dictionary<T> = {};

  items.forEach((item, index) => {
    const key = getKey(
      item,
      index,
    );

    if (safeKey(key)) {
      result[key] = item;
    }
  });

  return result;
}

/* ============================================================================
 * SIZE / VALIDATION
 * ========================================================================== */

export function assertObject(
  value: unknown,
  message = "Expected an object",
): asserts value is UnknownRecord {
  if (!isObject(value)) {
    throw new TypeError(message);
  }
}

export function assertPlainObject(
  value: unknown,
  message = "Expected a plain object",
): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new TypeError(message);
  }
}

export function isNonEmptyObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    isPlainObject(value) &&
    Object.keys(value).length > 0
  );
}

export function objectHasValues(
  object: object,
): boolean {
  return Object.keys(object).length > 0;
}

/* ============================================================================
 * CLAMP / NUMBER-LIKE OBJECT HELPERS
 * ========================================================================== */

export function numericValue(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return fallback;
}

export function numericProperty(
  object: unknown,
  key: PropertyKey,
  fallback = 0,
): number {
  return numericValue(
    getProperty(object, key),
    fallback,
  );
}

/* ============================================================================
 * EMPTY / CONSTANT HELPERS
 * ========================================================================== */

export function emptyObject<
  T extends AnyObject = AnyObject,
>(): T {
  return {} as T;
}

export function readonlyEmptyObject():
  Readonly<Record<string, never>> {
  return EMPTY_OBJECT;
}

/* ============================================================================
 * DEBUG / INSPECTION
 * ========================================================================== */

export function describeValue(
  value: unknown,
): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  if (isDate(value)) {
    return "date";
  }

  if (isRegExp(value)) {
    return "regexp";
  }

  if (isMap(value)) {
    return "map";
  }

  if (isSet(value)) {
    return "set";
  }

  return typeof value;
}

export function inspectObject(
  object: unknown,
): {
  type: string;
  isObject: boolean;
  isPlainObject: boolean;
  isArray: boolean;
  keys: number;
} {
  return {
    type: describeValue(object),
    isObject: isObject(object),
    isPlainObject: isPlainObject(object),
    isArray: isArray(object),
    keys: isObject(object)
      ? Reflect.ownKeys(object).length
      : 0,
  };
}

/* ============================================================================
 * DEFAULT EXPORT
 * ========================================================================== */

export default {
  isObject,
  isFunction,
  isArray,
  isPrimitive,
  isString,
  isNumber,
  isFiniteNumber,
  isBoolean,
  isBigInt,
  isSymbol,
  isNull,
  isUndefined,
  isNullish,
  isPlainObject,
  isDate,
  isRegExp,
  isMap,
  isSet,

  isPropertyKey,
  normalizeKey,
  isDangerousKey,
  safeKey,

  hasOwn,
  hasProperty,
  hasAnyProperty,
  hasAllProperties,

  getProperty,
  getObjectValue,
  getString,
  getNumber,
  getBoolean,
  getArray,

  setProperty,
  setProperties,
  deleteProperty,
  deleteProperties,

  pick,
  omit,
  pickDefined,
  pickNonNull,

  removeUndefined,
  removeNull,
  sanitizeObject,
  compactObject,
  removeEmptyStrings,
  trimStrings,
  removeKeys,

  objectKeys,
  objectValues,
  objectEntries,
  ownKeys,
  stringKeys,
  symbolKeys,
  objectSize,
  enumerableObjectSize,
  isEmptyObject,
  isEnumerableEmpty,

  toRecord,
  toObject,
  fromEntries,
  toEntries,
  toKeyValueArray,

  mapObject,
  mapEntries,
  filterObject,
  findObjectValue,
  findObjectEntry,
  reduceObject,

  findKey,
  findValue,
  containsValue,
  containsKey,

  clone,
  shallowClone,
  deepClone,

  merge,
  mergeMany,
  deepMerge,
  mergeDefined,

  withProperty,
  withoutProperty,
  updateObject,

  freeze,
  deepFreeze,
  isFrozen,

  equals,
  shallowEquals,

  safeJsonParse,
  parseJson,
  safeJsonStringify,
  jsonStringify,

  flattenObject,
  unflattenObject,

  parsePath,
  getPath,
  hasPath,
  setPath,
  deletePath,

  groupBy,
  keyBy,
  countBy,
  indexBy,

  invertObject,
  invertObjectMulti,
  renameKeys,
  mapKeys,

  defaults,
  withDefaults,

  firstDefined,
  firstNonNullish,
  valueOr,
  valueOrNull,

  sortObjectKeys,
  sortObjectByValue,

  createNullObject,
  createSafeObject,

  objectToArray,
  objectToPairs,
  arrayToObject,
  arrayToDictionary,

  assertObject,
  assertPlainObject,
  isNonEmptyObject,
  objectHasValues,

  numericValue,
  numericProperty,

  emptyObject,
  readonlyEmptyObject,

  describeValue,
  inspectObject,
};
