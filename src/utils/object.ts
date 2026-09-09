/**
 * Object Utilities v2
 * Tajik Opportunities
 *
 * Универсальный, безопасный и расширенный набор утилит
 * для работы с объектами, массивами, значениями и путями.
 *
 * Совместимо:
 * - TypeScript strict mode
 * - Cloudflare Workers
 * - D1 / KV / R2
 * - ES2022+
 *
 * Возможности:
 * - type guards
 * - PropertyKey utilities
 * - безопасное чтение / запись
 * - pick / omit / pickBy / omitBy
 * - map / filter / reduce
 * - deep map / deep filter
 * - shallow / deep clone
 * - deep merge
 * - merge with customizer
 * - equality / diff
 * - JSON helpers
 * - flatten / unflatten
 * - path access
 * - immutable updates
 * - grouping / indexing
 * - sorting
 * - object conversion
 * - cleaning / sanitizing
 * - freeze / deepFreeze
 * - numeric helpers
 * - debug / inspection
 * - prototype pollution protection
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

export type Dictionary<T = unknown> = Record<string, T>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Nullish<T> = T | null | undefined;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

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

export type KeyValue<
  K extends PropertyKey = PropertyKey,
  V = unknown,
> = {
  key: K;
  value: V;
};

export type ObjectEntry<
  K extends PropertyKey = PropertyKey,
  V = unknown,
> = readonly [K, V];

export type ObjectPath =
  | string
  | readonly PropertyKey[];

export type ObjectPathValue<
  T,
  P extends readonly PropertyKey[],
> =
  P extends readonly [
    infer K extends keyof T,
    ...infer Rest extends PropertyKey[],
  ]
    ? Rest extends []
      ? T[K]
      : ObjectPathValue<T[K], Rest>
    : never;

export type Predicate<T = unknown> = (
  value: T,
  key: PropertyKey,
  object: unknown,
) => boolean;

export type Comparator<T> = (
  a: T,
  b: T,
) => number;

export type ObjectCustomizer = (
  targetValue: unknown,
  sourceValue: unknown,
  key: PropertyKey,
  target: UnknownRecord,
  source: UnknownRecord,
) => unknown;

export type CloneCustomizer = (
  value: unknown,
) => unknown;

export type DiffEntry = {
  path: string;
  type:
    | "added"
    | "removed"
    | "changed";
  before?: unknown;
  after?: unknown;
};

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DANGEROUS_KEYS = new Set<PropertyKey>([
  "__proto__",
  "prototype",
  "constructor",
]);

const EMPTY_OBJECT: Readonly<
  Record<string, never>
> = Object.freeze({});

const EMPTY_ARRAY: readonly never[] =
  Object.freeze([]);

const hasOwnProperty =
  Object.prototype.hasOwnProperty;

const objectToString =
  Object.prototype.toString;

/* ============================================================================
 * INTERNAL HELPERS
 * ========================================================================== */

function defineSafeProperty(
  object: object,
  key: PropertyKey,
  value: unknown,
): boolean {
  if (!safeKey(key)) {
    return false;
  }

  try {
    Object.defineProperty(
      object,
      key,
      {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      },
    );

    return true;
  } catch {
    return false;
  }
}

function createResultObject(): UnknownRecord {
  return {};
}

function createDictionary<T = unknown>():
  Record<string, T> {
  return Object.create(null) as Record<
    string,
    T
  >;
}

function isObjectLike(
  value: unknown,
): value is object {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isIndexable(
  value: unknown,
): value is UnknownRecord {
  return isObjectLike(value);
}

/* ============================================================================
 * TYPE GUARDS
 * ========================================================================== */

export function isObject(
  value: unknown,
): value is object {
  return isObjectLike(value);
}

export function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    isObjectLike(value) &&
    !Array.isArray(value)
  );
}

export function isFunction(
  value: unknown,
): value is (
  ...args: never[]
) => unknown {
  return typeof value === "function";
}

export function isAsyncFunction(
  value: unknown,
): boolean {
  return (
    typeof value === "function" &&
    objectToString.call(value) ===
      "[object AsyncFunction]"
  );
}

export function isGeneratorFunction(
  value: unknown,
): boolean {
  return (
    typeof value === "function" &&
    objectToString.call(value) ===
      "[object GeneratorFunction]"
  );
}

export function isArray(
  value: unknown,
): value is unknown[] {
  return Array.isArray(value);
}

export function isPrimitive(
  value: unknown,
): value is Primitive {
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

export function isString(
  value: unknown,
): value is string {
  return typeof value === "string";
}

export function isNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    !Number.isNaN(value)
  );
}

export function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function isInteger(
  value: unknown,
): value is number {
  return Number.isInteger(value);
}

export function isSafeInteger(
  value: unknown,
): value is number {
  return Number.isSafeInteger(value);
}

export function isNaNValue(
  value: unknown,
): boolean {
  return (
    typeof value === "number" &&
    Number.isNaN(value)
  );
}

export function isBoolean(
  value: unknown,
): value is boolean {
  return typeof value === "boolean";
}

export function isBigInt(
  value: unknown,
): value is bigint {
  return typeof value === "bigint";
}

export function isSymbol(
  value: unknown,
): value is symbol {
  return typeof value === "symbol";
}

export function isNull(
  value: unknown,
): value is null {
  return value === null;
}

export function isUndefined(
  value: unknown,
): value is undefined {
  return value === undefined;
}

export function isNullish(
  value: unknown,
): value is null | undefined {
  return (
    value === null ||
    value === undefined
  );
}

export function isTruthy(
  value: unknown,
): boolean {
  return Boolean(value);
}

export function isFalsy(
  value: unknown,
): boolean {
  return !value;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!isObjectLike(value)) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

export function isDate(
  value: unknown,
): value is Date {
  return (
    value instanceof Date &&
    !Number.isNaN(value.getTime())
  );
}

export function isInvalidDate(
  value: unknown,
): boolean {
  return (
    value instanceof Date &&
    Number.isNaN(value.getTime())
  );
}

export function isRegExp(
  value: unknown,
): value is RegExp {
  return value instanceof RegExp;
}

export function isMap(
  value: unknown,
): value is Map<unknown, unknown> {
  return value instanceof Map;
}

export function isSet(
  value: unknown,
): value is Set<unknown> {
  return value instanceof Set;
}

export function isWeakMap(
  value: unknown,
): value is WeakMap<object, unknown> {
  return value instanceof WeakMap;
}

export function isWeakSet(
  value: unknown,
): value is WeakSet<object> {
  return value instanceof WeakSet;
}

export function isPromiseLike(
  value: unknown,
): value is PromiseLike<unknown> {
  return (
    isObjectLike(value) &&
    "then" in value &&
    typeof value.then === "function"
  );
}

export function isError(
  value: unknown,
): value is Error {
  return value instanceof Error;
}

export function isURL(
  value: unknown,
): value is URL {
  return (
    typeof URL !== "undefined" &&
    value instanceof URL
  );
}

/* ============================================================================
 * KEY HELPERS
 * ========================================================================== */

export function isPropertyKey(
  value: unknown,
): value is PropertyKey {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "symbol"
  );
}

export function normalizeKey(
  key: PropertyKey,
): PropertyKey {
  return typeof key === "number"
    ? String(key)
    : key;
}

export function isDangerousKey(
  key: PropertyKey,
): boolean {
  return (
    typeof key === "string" &&
    DANGEROUS_KEYS.has(key)
  );
}

export function safeKey(
  key: PropertyKey,
): boolean {
  return !isDangerousKey(key);
}

export function safeKeys(
  keys: readonly PropertyKey[],
): PropertyKey[] {
  return keys.filter(safeKey);
}

export function unsafeKeys(
  keys: readonly PropertyKey[],
): PropertyKey[] {
  return keys.filter(isDangerousKey);
}

/* ============================================================================
 * OWN PROPERTY HELPERS
 * ========================================================================== */

export function hasOwn(
  object: object,
  key: PropertyKey,
): boolean {
  return hasOwnProperty.call(
    object,
    key,
  );
}

export function hasProperty(
  object: unknown,
  key: PropertyKey,
): boolean {
  return (
    isObjectLike(object) &&
    hasOwn(object, key)
  );
}

export function hasAnyProperty(
  object: unknown,
  keys: readonly PropertyKey[],
): boolean {
  if (!isObjectLike(object)) {
    return false;
  }

  return keys.some((key) =>
    hasOwn(object, key),
  );
}

export function hasAllProperties(
  object: unknown,
  keys: readonly PropertyKey[],
): boolean {
  if (!isObjectLike(object)) {
    return false;
  }

  return keys.every((key) =>
    hasOwn(object, key),
  );
}

/* ============================================================================
 * GETTERS
 * ========================================================================== */

export function getProperty<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback?: T,
): T | undefined {
  if (!isObjectLike(object)) {
    return fallback;
  }

  if (!Reflect.has(object, key)) {
    return fallback;
  }

  try {
    return Reflect.get(object, key) as T;
  } catch {
    return fallback;
  }
}

export function getOwnProperty<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback?: T,
): T | undefined {
  if (
    !isObjectLike(object) ||
    !hasOwn(object, key)
  ) {
    return fallback;
  }

  try {
    return Reflect.get(object, key) as T;
  } catch {
    return fallback;
  }
}

export function getObjectValue<T>(
  object: object,
  key: PropertyKey,
  fallback?: T,
): T | undefined {
  const value = getProperty<unknown>(
    object,
    key,
  );

  return value === undefined
    ? fallback
    : (value as T);
}

export function getString(
  object: unknown,
  key: PropertyKey,
  fallback = "",
): string {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return typeof value === "string"
    ? value
    : fallback;
}

export function getNumber(
  object: unknown,
  key: PropertyKey,
  fallback = 0,
): number {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return isFiniteNumber(value)
    ? value
    : fallback;
}

export function getBoolean(
  object: unknown,
  key: PropertyKey,
  fallback = false,
): boolean {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return typeof value === "boolean"
    ? value
    : fallback;
}

export function getBigInt(
  object: unknown,
  key: PropertyKey,
  fallback?: bigint,
): bigint | undefined {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return typeof value === "bigint"
    ? value
    : fallback;
}

export function getArray<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback: readonly T[] = EMPTY_ARRAY,
): readonly T[] {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return Array.isArray(value)
    ? (value as T[])
    : fallback;
}

export function getObject(
  object: unknown,
  key: PropertyKey,
): UnknownRecord | undefined {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return isPlainObject(value)
    ? value
    : undefined;
}

export function getOr<T>(
  object: unknown,
  key: PropertyKey,
  fallback: T,
): T {
  const value =
    getProperty<unknown>(
      object,
      key,
    );

  return value === undefined
    ? fallback
    : (value as T);
}

export function getStringOr(
  object: unknown,
  key: PropertyKey,
  fallback: string,
): string {
  return getString(
    object,
    key,
    fallback,
  );
}

export function getNumberOr(
  object: unknown,
  key: PropertyKey,
  fallback: number,
): number {
  return getNumber(
    object,
    key,
    fallback,
  );
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

  defineSafeProperty(
    object,
    key,
    value,
  );

  return object;
}

export function setProperties<T extends object>(
  object: T,
  values: UnknownRecord,
): T {
  for (
    const key of Reflect.ownKeys(values)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    defineSafeProperty(
      object,
      key,
      Reflect.get(values, key),
    );
  }

  return object;
}

export function assignSafe<T extends object>(
  object: T,
  ...sources: Array<
    UnknownRecord | null | undefined
  >
): T {
  for (const source of sources) {
    if (!source) {
      continue;
    }

    setProperties(
      object,
      source,
    );
  }

  return object;
}

export function deleteProperty<T extends object>(
  object: T,
  key: PropertyKey,
): boolean {
  if (!safeKey(key)) {
    return false;
  }

  try {
    return Reflect.deleteProperty(
      object,
      key,
    );
  } catch {
    return false;
  }
}

export function deleteProperties<T extends object>(
  object: T,
  keys: readonly PropertyKey[],
): T {
  for (const key of keys) {
    deleteProperty(object, key);
  }

  return object;
}

export function clearObject<T extends object>(
  object: T,
): T {
  for (
    const key of Reflect.ownKeys(object)
  ) {
    try {
      Reflect.deleteProperty(
        object,
        key,
      );
    } catch {
      // Ignore non-configurable properties.
    }
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
  const result =
    createResultObject() as Pick<T, K>;

  for (const key of keys) {
    if (
      !safeKey(key) ||
      !hasOwn(object, key)
    ) {
      continue;
    }

    defineSafeProperty(
      result,
      key,
      Reflect.get(object, key),
    );
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
  const excluded =
    new Set<PropertyKey>(keys);

  const result =
    createResultObject() as Omit<T, K>;

  for (
    const key of Reflect.ownKeys(object)
  ) {
    if (
      excluded.has(key) ||
      !safeKey(key)
    ) {
      continue;
    }

    defineSafeProperty(
      result,
      key,
      Reflect.get(object, key),
    );
  }

  return result;
}

export function pickBy<
  T extends UnknownRecord,
>(
  object: T,
  predicate: Predicate,
): Partial<T> {
  const result =
    createResultObject() as Partial<T>;

  for (
    const key of Reflect.ownKeys(object)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    const value =
      Reflect.get(object, key);

    if (
      predicate(
        value,
        key,
        object,
      )
    ) {
      defineSafeProperty(
        result,
        key,
        value,
      );
    }
  }

  return result;
}

export function omitBy<
  T extends UnknownRecord,
>(
  object: T,
  predicate: Predicate,
): Partial<T> {
  return pickBy(
    object,
    (
      value,
      key,
      source,
    ) =>
      !predicate(
        value,
        key,
        source,
      ),
  );
}

export function pickDefined<
  T extends UnknownRecord,
>(
  object: T,
): Partial<T> {
  return removeUndefined(object);
}

export function pickNonNull<
  T extends UnknownRecord,
>(
  object: T,
): Partial<T> {
  return removeNull(object);
}

/* ============================================================================
 * CLEANING
 * ========================================================================== */

export function removeUndefined<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  return pickBy(
    object as UnknownRecord,
    (value) =>
      value !== undefined,
  ) as Partial<T>;
}

export function removeNull<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  return pickBy(
    object as UnknownRecord,
    (value) =>
      value !== null,
  ) as Partial<T>;
}

export function sanitizeObject<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  return pickBy(
    object as UnknownRecord,
    (value) =>
      value !== null &&
      value !== undefined,
  ) as Partial<T>;
}

export function compactObject<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  return pickBy(
    object as UnknownRecord,
    (value) =>
      Boolean(value),
  ) as Partial<T>;
}

export function removeEmptyStrings<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  return pickBy(
    object as UnknownRecord,
    (value) =>
      typeof value !== "string" ||
      value.trim() !== "",
  ) as Partial<T>;
}

export function trimStrings<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  return mapObject(
    object,
    (value) =>
      typeof value === "string"
        ? value.trim()
        : value,
  ) as Partial<T>;
}

export function removeKeys(
  object: UnknownRecord,
  predicate: (
    key: PropertyKey,
    value: unknown,
  ) => boolean,
): UnknownRecord {
  return omitBy(
    object,
    (
      value,
      key,
    ) =>
      predicate(
        key,
        value,
      ),
  ) as UnknownRecord;
}

export function removeEmptyObjects<
  T extends UnknownRecord,
>(
  object: T,
): Partial<T> {
  return pickBy(
    object,
    (value) =>
      !isPlainObject(value) ||
      Object.keys(value).length > 0,
  );
}

export function deepClean<T>(
  value: T,
): T {
  return deepTransform(
    value,
    (current) => {
      if (
        current === null ||
        current === undefined
      ) {
        return {
          keep: false,
          value: current,
        };
      }

      if (
        typeof current === "string" &&
        current.trim() === ""
      ) {
        return {
          keep: false,
          value: current,
        };
      }

      return {
        keep: true,
        value: current,
      };
    },
  );
}

/* ============================================================================
 * KEYS / VALUES / ENTRIES
 * ========================================================================== */

export function objectKeys<T extends object>(
  object: T,
): Array<keyof T> {
  return Object.keys(
    object,
  ) as Array<keyof T>;
}

export function objectValues<T extends object>(
  object: T,
): Array<T[keyof T]> {
  return Object.values(
    object,
  ) as Array<T[keyof T]>;
}

export function objectEntries<T extends object>(
  object: T,
): Array<
  [keyof T, T[keyof T]]
> {
  return Object.entries(
    object,
  ) as Array<
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
  return Object.getOwnPropertySymbols(
    object,
  );
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
  return (
    enumerableObjectSize(object) ===
    0
  );
}

/* ============================================================================
 * CONVERSION
 * ========================================================================== */

export function toRecord(
  value: unknown,
): UnknownRecord {
  return isPlainObject(value)
    ? value
    : createResultObject();
}

export function toObject<
  T extends UnknownRecord,
>(
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
  entries: Iterable<
    readonly [K, V]
  >,
): Record<K, V> {
  const result =
    createResultObject();

  for (
    const [key, value] of entries
  ) {
    if (!safeKey(key)) {
      continue;
    }

    defineSafeProperty(
      result,
      key,
      value,
    );
  }

  return result as Record<K, V>;
}

export function toEntries(
  object: object,
): Array<
  [PropertyKey, unknown]
> {
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
      value: Reflect.get(
        object,
        key,
      ),
    }),
  );
}

export function objectToArray<
  T = unknown,
>(
  object: object,
): T[] {
  return objectValues(
    object,
  ) as T[];
}

export function objectToPairs(
  object: object,
): Array<
  [string, unknown]
> {
  return Object.entries(object);
}

export function objectToMap(
  object: object,
): Map<PropertyKey, unknown> {
  return new Map(
    toEntries(object),
  );
}

export function mapToObject<
  K extends PropertyKey,
  V,
>(
  map: Map<K, V>,
): Record<K, V> {
  return fromEntries(map);
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
  const result:
    Record<string, R> =
    createDictionary<R>();

  for (
    const key of Object.keys(object)
  ) {
    const typedKey =
      key as keyof T;

    result[key] =
      callback(
        object[typedKey] as T[keyof T],
        typedKey,
        object,
      );
  }

  return result;
}

export function mapValues<
  T extends AnyObject,
  R,
>(
  object: T,
  callback: (
    value: T[keyof T],
    key: keyof T,
  ) => R,
): Record<string, R> {
  return mapObject(
    object,
    (value, key) =>
      callback(
        value,
        key,
      ),
  );
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
  const entries:
    Array<readonly [string, R]> = [];

  for (
    const key of Object.keys(object)
  ) {
    entries.push(
      callback(
        object[key],
        key,
        object,
      ),
    );
  }

  return fromEntries(entries);
}

export function filterObject<
  T extends AnyObject,
>(
  object: T,
  predicate: (
    value: T[keyof T],
    key: keyof T,
    object: T,
  ) => boolean,
): Partial<T> {
  return pickBy(
    object as UnknownRecord,
    (value, key) =>
      predicate(
        value as T[keyof T],
        key as keyof T,
        object,
      ),
  ) as Partial<T>;
}

export function findObjectValue<
  T extends AnyObject,
>(
  object: T,
  predicate: (
    value: T[keyof T],
    key: keyof T,
  ) => boolean,
): T[keyof T] | undefined {
  for (
    const key of Object.keys(object)
  ) {
    const typedKey =
      key as keyof T;

    const value =
      object[typedKey];

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

export function findObjectEntry<
  T extends AnyObject,
>(
  object: T,
  predicate: (
    value: T[keyof T],
    key: keyof T,
  ) => boolean,
): [keyof T, T[keyof T]] | undefined {
  for (
    const key of Object.keys(object)
  ) {
    const typedKey =
      key as keyof T;

    const value =
      object[typedKey];

    if (
      predicate(
        value,
        typedKey,
      )
    ) {
      return [
        typedKey,
        value,
      ];
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
  let accumulator =
    initialValue;

  for (
    const key of Object.keys(object)
  ) {
    const typedKey =
      key as keyof T;

    accumulator =
      callback(
        accumulator,
        object[typedKey],
        typedKey,
        object,
      );
  }

  return accumulator;
}

export function someObject<
  T extends AnyObject,
>(
  object: T,
  predicate: Predicate,
): boolean {
  return Reflect.ownKeys(object).some(
    (key) =>
      predicate(
        Reflect.get(object, key),
        key,
        object,
      ),
  );
}

export function everyObject<
  T extends AnyObject,
>(
  object: T,
  predicate: Predicate,
): boolean {
  return Reflect.ownKeys(object).every(
    (key) =>
      predicate(
        Reflect.get(object, key),
        key,
        object,
      ),
  );
}

export function partitionObject<
  T extends AnyObject,
>(
  object: T,
  predicate: Predicate,
): [
  Partial<T>,
  Partial<T>,
] {
  const passed =
    createResultObject() as Partial<T>;

  const failed =
    createResultObject() as Partial<T>;

  for (
    const key of Reflect.ownKeys(object)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    const value =
      Reflect.get(object, key);

    defineSafeProperty(
      predicate(
        value,
        key,
        object,
      )
        ? passed
        : failed,
      key,
      value,
    );
  }

  return [passed, failed];
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
  for (
    const key of Reflect.ownKeys(object)
  ) {
    const value =
      Reflect.get(object, key);

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
  const key =
    findKey(
      object,
      predicate,
    );

  return key === undefined
    ? undefined
    : (Reflect.get(
        object,
        key,
      ) as T);
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

export function hasValue(
  object: object,
  predicate: (
    value: unknown,
    key: PropertyKey,
  ) => boolean,
): boolean {
  return findKey(
    object,
    predicate,
  ) !== undefined;
}

export function containsKey(
  object: object,
  key: PropertyKey,
): boolean {
  return hasOwn(
    object,
    key,
  );
}

/* ============================================================================
 * CLONE
 * ========================================================================== */

export function clone<T>(
  value: T,
): T {
  if (
    typeof structuredClone ===
    "function"
  ) {
    try {
      return structuredClone(value);
    } catch {
      // Fallback below.
    }
  }

  return shallowClone(value);
}

export function shallowClone<T>(
  value: T,
): T {
  if (Array.isArray(value)) {
    return [...value] as T;
  }

  if (isDate(value)) {
    return new Date(
      value.getTime(),
    ) as T;
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
    const result =
      createResultObject();

    for (
      const key of Reflect.ownKeys(value)
    ) {
      if (!safeKey(key)) {
        continue;
      }

      defineSafeProperty(
        result,
        key,
        Reflect.get(value, key),
      );
    }

    return result as T;
  }

  return value;
}

export function deepClone<T>(
  value: T,
): T {
  if (
    typeof structuredClone ===
    "function"
  ) {
    try {
      return structuredClone(value);
    } catch {
      // Fallback below.
    }
  }

  return deepCloneFallback(
    value,
    new WeakMap<
      object,
      unknown
    >(),
  ) as T;
}

export function deepCloneWith<T>(
  value: T,
  customizer: CloneCustomizer,
): T {
  const custom =
    customizer(value);

  if (custom !== value) {
    return custom as T;
  }

  return deepCloneCustom(
    value,
    customizer,
    new WeakMap<
      object,
      unknown
    >(),
  ) as T;
}

function deepCloneFallback(
  value: unknown,
  seen: WeakMap<
    object,
    unknown
  >,
): unknown {
  if (!isObjectLike(value)) {
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
    const result =
      new Map();

    seen.set(
      value,
      result,
    );

    for (
      const [
        key,
        nested,
      ] of value
    ) {
      result.set(
        deepCloneFallback(
          key,
          seen,
        ),
        deepCloneFallback(
          nested,
          seen,
        ),
      );
    }

    return result;
  }

  if (isSet(value)) {
    const result =
      new Set();

    seen.set(
      value,
      result,
    );

    for (
      const item of value
    ) {
      result.add(
        deepCloneFallback(
          item,
          seen,
        ),
      );
    }

    return result;
  }

  if (Array.isArray(value)) {
    const result:
      unknown[] = [];

    seen.set(
      value,
      result,
    );

    for (
      const item of value
    ) {
      result.push(
        deepCloneFallback(
          item,
          seen,
        ),
      );
    }

    return result;
  }

  const result =
    createResultObject();

  seen.set(
    value,
    result,
  );

  for (
    const key of Reflect.ownKeys(value)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    defineSafeProperty(
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

function deepCloneCustom(
  value: unknown,
  customizer: CloneCustomizer,
  seen: WeakMap<
    object,
    unknown
  >,
): unknown {
  const custom =
    customizer(value);

  if (custom !== value) {
    return custom;
  }

  if (!isObjectLike(value)) {
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
    const result =
      new Map();

    seen.set(value, result);

    for (
      const [key, nested] of value
    ) {
      result.set(
        deepCloneCustom(
          key,
          customizer,
          seen,
        ),
        deepCloneCustom(
          nested,
          customizer,
          seen,
        ),
      );
    }

    return result;
  }

  if (isSet(value)) {
    const result =
      new Set();

    seen.set(value, result);

    for (
      const item of value
    ) {
      result.add(
        deepCloneCustom(
          item,
          customizer,
          seen,
        ),
      );
    }

    return result;
  }

  if (Array.isArray(value)) {
    const result:
      unknown[] = [];

    seen.set(value, result);

    for (
      const item of value
    ) {
      result.push(
        deepCloneCustom(
          item,
          customizer,
          seen,
        ),
      );
    }

    return result;
  }

  const result =
    createResultObject();

  seen.set(value, result);

  for (
    const key of Reflect.ownKeys(value)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    defineSafeProperty(
      result,
      key,
      deepCloneCustom(
        Reflect.get(value, key),
        customizer,
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
  return Object.assign(
    createResultObject(),
    first,
    second,
  ) as T & U;
}

export function mergeMany<
  T extends AnyObject,
>(
  ...objects: AnyObject[]
): T {
  const result =
    createResultObject();

  for (
    const object of objects
  ) {
    setProperties(
      result,
      object,
    );
  }

  return result as T;
}

export function deepMerge<
  T extends AnyObject,
>(
  target: T,
  ...sources: AnyObject[]
): T {
  const result =
    deepClone(target);

  for (
    const source of sources
  ) {
    if (!isPlainObject(source)) {
      continue;
    }

    mergeInto(
      result as UnknownRecord,
      source,
    );
  }

  return result;
}

export function deepMergeWith<
  T extends AnyObject,
>(
  target: T,
  sources: readonly AnyObject[],
  customizer: ObjectCustomizer,
): T {
  const result =
    deepClone(target);

  for (
    const source of sources
  ) {
    mergeIntoCustom(
      result as UnknownRecord,
      source,
      customizer,
    );
  }

  return result;
}

function mergeInto(
  target: UnknownRecord,
  source: UnknownRecord,
): void {
  for (
    const key of Reflect.ownKeys(source)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    const sourceValue =
      Reflect.get(source, key);

    const targetValue =
      Reflect.get(target, key);

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

    defineSafeProperty(
      target,
      key,
      deepClone(sourceValue),
    );
  }
}

function mergeIntoCustom(
  target: UnknownRecord,
  source: UnknownRecord,
  customizer: ObjectCustomizer,
): void {
  for (
    const key of Reflect.ownKeys(source)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    const sourceValue =
      Reflect.get(source, key);

    const targetValue =
      Reflect.get(target, key);

    const customized =
      customizer(
        targetValue,
        sourceValue,
        key,
        target,
        source,
      );

    if (customized !== undefined) {
      defineSafeProperty(
        target,
        key,
        deepClone(customized),
      );

      continue;
    }

    if (
      isPlainObject(targetValue) &&
      isPlainObject(sourceValue)
    ) {
      mergeIntoCustom(
        targetValue,
        sourceValue,
        customizer,
      );

      continue;
    }

    defineSafeProperty(
      target,
      key,
      deepClone(sourceValue),
    );
  }
}

export function mergeDefined<
  T extends AnyObject,
>(
  ...objects: Array<
    Partial<T> |
    undefined |
    null
  >
): Partial<T> {
  const result =
    createResultObject() as Partial<T>;

  for (
    const object of objects
  ) {
    if (!object) {
      continue;
    }

    for (
      const key of Object.keys(object)
    ) {
      const value =
        object[key];

      if (value !== undefined) {
        defineSafeProperty(
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
  const result =
    shallowClone(object);

  setProperty(
    result as object,
    key,
    value,
  );

  return result as T &
    Record<K, V>;
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
  const result =
    deepClone(
      object,
    ) as Mutable<T>;

  updater(result);

  return result;
}

export function updateObjectSafe<
  T extends AnyObject,
>(
  object: T,
  updater: (
    draft: Mutable<T>,
  ) => void,
): T {
  const result =
    deepClone(
      object,
    ) as Mutable<T>;

  try {
    updater(result);
    return result;
  } catch {
    return deepClone(object);
  }
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
  if (!isObjectLike(value)) {
    return value as DeepReadonly<T>;
  }

  for (
    const key of Reflect.ownKeys(value)
  ) {
    const nested =
      Reflect.get(value, key);

    if (
      isObjectLike(nested) &&
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
  return isObjectLike(value)
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
  return equalsInternal(
    first,
    second,
    new WeakMap<
      object,
      WeakSet<object>
    >(),
  );
}

function equalsInternal(
  first: unknown,
  second: unknown,
  seen: WeakMap<
    object,
    WeakSet<object>
  >,
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
    isMap(first) &&
    isMap(second)
  ) {
    if (first.size !== second.size) {
      return false;
    }

    for (
      const [key, value] of first
    ) {
      if (!second.has(key)) {
        return false;
      }

      if (
        !equalsInternal(
          value,
          second.get(key),
          seen,
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

    for (
      const value of first
    ) {
      if (!second.has(value)) {
        return false;
      }
    }

    return true;
  }

  if (
    Array.isArray(first) &&
    Array.isArray(second)
  ) {
    if (first.length !== second.length) {
      return false;
    }

    for (
      let index = 0;
      index < first.length;
      index += 1
    ) {
      if (
        !equalsInternal(
          first[index],
          second[index],
          seen,
        )
      ) {
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

  let pairs =
    seen.get(first);

  if (!pairs) {
    pairs = new WeakSet();
    seen.set(first, pairs);
  }

  if (pairs.has(second)) {
    return true;
  }

  pairs.add(second);

  const firstKeys =
    Reflect.ownKeys(first);

  const secondKeys =
    Reflect.ownKeys(second);

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  for (
    const key of firstKeys
  ) {
    if (
      !hasOwn(second, key)
    ) {
      return false;
    }

    if (
      !equalsInternal(
        Reflect.get(first, key),
        Reflect.get(second, key),
        seen,
      )
    ) {
      return false;
    }
  }

  return true;
}

export const isEqual = equals;

export function shallowEquals(
  first: object,
  second: object,
): boolean {
  const firstKeys =
    Reflect.ownKeys(first);

  const secondKeys =
    Reflect.ownKeys(second);

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  for (
    const key of firstKeys
  ) {
    if (
      !hasOwn(second, key) ||
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

export function safeJsonParse<
  T = unknown,
>(
  value: string,
  fallback?: T,
): T | undefined {
  try {
    return JSON.parse(
      value,
    ) as T;
  } catch {
    return fallback;
  }
}

export function parseJson<
  T = unknown,
>(
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

export function jsonPretty<
  T = unknown,
>(
  value: T,
  spaces = 2,
): string | undefined {
  try {
    return JSON.stringify(
      value,
      bigintReplacer,
      Math.max(
        0,
        Math.min(10, spaces),
      ),
    );
  } catch {
    return undefined;
  }
}

export function isValidJson(
  value: unknown,
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
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
  const result:
    Record<string, unknown> =
    createDictionary();

  for (
    const key of Object.keys(object)
  ) {
    if (!safeKey(key)) {
      continue;
    }

    const value =
      object[key];

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
      result[path] =
        value;
    }
  }

  return result;
}

export function unflattenObject(
  object: Record<string, unknown>,
): UnknownRecord {
  const result =
    createResultObject();

  for (
    const [
      path,
      value,
    ] of Object.entries(object)
  ) {
    const parts =
      parsePath(path);

    if (parts.length === 0) {
      continue;
    }

    let current:
      UnknownRecord = result;

    let valid = true;

    for (
      let index = 0;
      index < parts.length;
      index += 1
    ) {
      const part =
        parts[index];

      if (!safeKey(part)) {
        valid = false;
        break;
      }

      const last =
        index ===
        parts.length - 1;

      if (last) {
        defineSafeProperty(
          current,
          part,
          value,
        );

        continue;
      }

      const existing =
        Reflect.get(
          current,
          part,
        );

      if (
        !isPlainObject(existing)
      ) {
        const next =
          createResultObject();

        defineSafeProperty(
          current,
          part,
          next,
        );

        current = next;
      } else {
        current = existing;
      }
    }

    if (!valid) {
      continue;
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
  if (typeof path !== "string") {
    return [...path];
  }

  if (!path) {
    return [];
  }

  return path
    .split(".")
    .filter(Boolean);
}

export function pathToString(
  path: ObjectPath,
): string {
  return parsePath(path)
    .map(String)
    .join(".");
}

export function getPath<T = unknown>(
  object: unknown,
  path: ObjectPath,
  fallback?: T,
): T | undefined {
  const keys =
    parsePath(path);

  if (keys.length === 0) {
    return fallback;
  }

  let current:
    unknown = object;

  for (
    const key of keys
  ) {
    if (
      !safeKey(key) ||
      !isObjectLike(current)
    ) {
      return fallback;
    }

    if (!Reflect.has(current, key)) {
      return fallback;
    }

    try {
      current =
        Reflect.get(
          current,
          key,
        );
    } catch {
      return fallback;
    }
  }

  return current === undefined
    ? fallback
    : (current as T);
}

export function hasPath(
  object: unknown,
  path: ObjectPath,
): boolean {
  const keys =
    parsePath(path);

  if (keys.length === 0) {
    return false;
  }

  let current:
    unknown = object;

  for (
    const key of keys
  ) {
    if (
      !safeKey(key) ||
      !isObjectLike(current) ||
      !Reflect.has(current, key)
    ) {
      return false;
    }

    current =
      Reflect.get(
        current,
        key,
      );
  }

  return true;
}

export function setPath<
  T extends object,
>(
  object: T,
  path: ObjectPath,
  value: unknown,
): T {
  const keys =
    parsePath(path);

  if (keys.length === 0) {
    return object;
  }

  let current:
    UnknownRecord =
    object as UnknownRecord;

  for (
    let index = 0;
    index < keys.length;
    index += 1
  ) {
    const key =
      keys[index];

    if (!safeKey(key)) {
      return object;
    }

    const last =
      index ===
      keys.length - 1;

    if (last) {
      defineSafeProperty(
        current,
        key,
        value,
      );

      break;
    }

    const existing =
      Reflect.get(
        current,
        key,
      );

    if (!isPlainObject(existing)) {
      const next =
        createResultObject();

      defineSafeProperty(
        current,
        key,
        next,
      );

      current = next;
    } else {
      current =
        existing;
    }
  }

  return object;
}

export function setPathImmutable<
  T extends object,
>(
  object: T,
  path: ObjectPath,
  value: unknown,
): T {
  const result =
    deepClone(object) as T;

  return setPath(
    result,
    path,
    value,
  );
}

export function deletePath<
  T extends object,
>(
  object: T,
  path: ObjectPath,
): boolean {
  const keys =
    parsePath(path);

  if (keys.length === 0) {
    return false;
  }

  let current:
    unknown = object;

  for (
    let index = 0;
    index < keys.length - 1;
    index += 1
  ) {
    const key =
      keys[index];

    if (
      !safeKey(key) ||
      !isObjectLike(current) ||
      !Reflect.has(current, key)
    ) {
      return false;
    }

    current =
      Reflect.get(
        current,
        key,
      );
  }

  if (
    !isObjectLike(current)
  ) {
    return false;
  }

  const finalKey =
    keys[keys.length - 1];

  if (!safeKey(finalKey)) {
    return false;
  }

  try {
    return Reflect.deleteProperty(
      current,
      finalKey,
    );
  } catch {
    return false;
  }
}

export function deletePathImmutable<
  T extends object,
>(
  object: T,
  path: ObjectPath,
): T {
  const result =
    deepClone(object) as T;

  deletePath(
    result,
    path,
  );

  return result;
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
  const result:
    Record<string, T[]> =
    createDictionary<T[]>();

  items.forEach(
    (
      item,
      index,
    ) => {
      const key =
        String(
          getKey(
            item,
            index,
          ),
        );

      if (!result[key]) {
        result[key] = [];
      }

      result[key].push(item);
    },
  );

  return result;
}

export function groupByMulti<T>(
  items: readonly T[],
  getKeys: (
    item: T,
    index: number,
  ) => readonly PropertyKey[],
): Record<string, T[]> {
  const result:
    Record<string, T[]> =
    createDictionary<T[]>();

  items.forEach(
    (
      item,
      index,
    ) => {
      const keys =
        getKeys(
          item,
          index,
        );

      for (
        const rawKey of keys
      ) {
        const key =
          String(rawKey);

        if (!result[key]) {
          result[key] = [];
        }

        result[key].push(item);
      }
    },
  );

  return result;
}

export function keyBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Record<string, T> {
  const result:
    Record<string, T> =
    createDictionary<T>();

  items.forEach(
    (
      item,
      index,
    ) => {
      const key =
        String(
          getKey(
            item,
            index,
          ),
        );

      if (safeKey(key)) {
        result[key] =
          item;
      }
    },
  );

  return result;
}

export const keyByLast = keyBy;

export function countBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Record<string, number> {
  const result:
    Record<string, number> =
    createDictionary<number>();

  items.forEach(
    (
      item,
      index,
    ) => {
      const key =
        String(
          getKey(
            item,
            index,
          ),
        );

      result[key] =
        (result[key] ?? 0) + 1;
    },
  );

  return result;
}

export function indexBy<T>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => PropertyKey,
): Map<PropertyKey, T> {
  const result =
    new Map<
      PropertyKey,
      T
    >();

  items.forEach(
    (
      item,
      index,
    ) => {
      result.set(
        getKey(
          item,
          index,
        ),
        item,
      );
    },
  );

  return result;
}

export function partition<T>(
  items: readonly T[],
  predicate: (
    item: T,
    index: number,
  ) => boolean,
): [
  T[],
  T[],
] {
  const passed: T[] = [];
  const failed: T[] = [];

  items.forEach(
    (
      item,
      index,
    ) => {
      if (
        predicate(
          item,
          index,
        )
      ) {
        passed.push(item);
      } else {
        failed.push(item);
      }
    },
  );

  return [
    passed,
    failed,
  ];
}

/* ============================================================================
 * TRANSFORMATIONS
 * ========================================================================== */

export function invertObject(
  object: Record<string, string>,
): Record<string, string> {
  const result:
    Record<string, string> =
    createDictionary<string>();

  for (
    const [
      key,
      value,
    ] of Object.entries(object)
  ) {
    if (safeKey(value)) {
      result[value] =
        key;
    }
  }

  return result;
}

export function invertObjectMulti(
  object: Record<string, string>,
): Record<string, string[]> {
  const result:
    Record<string, string[]> =
    createDictionary<string[]>();

  for (
    const [
      key,
      value,
    ] of Object.entries(object)
  ) {
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

export function renameKeys<
  T extends AnyObject,
>(
  object: T,
  mapping: Record<string, string>,
): Record<string, unknown> {
  const result =
    createResultObject();

  for (
    const key of Object.keys(object)
  ) {
    const nextKey =
      mapping[key] ?? key;

    if (!safeKey(nextKey)) {
      continue;
    }

    defineSafeProperty(
      result,
      nextKey,
      object[key],
    );
  }

  return result;
}

export function mapKeys<
  T extends AnyObject,
>(
  object: T,
  callback: (
    key: string,
    value: T[string],
  ) => string,
): Record<
  string,
  T[string]
> {
  const result:
    Record<
      string,
      T[string]
    > =
    createDictionary<
      T[string]
    >();

  for (
    const key of Object.keys(object)
  ) {
    const value =
      object[key] as T[string];

    const nextKey =
      callback(
        key,
        value,
      );

    if (!safeKey(nextKey)) {
      continue;
    }

    result[nextKey] =
      value;
  }

  return result;
}

export function mapKeysSafe<
  T extends UnknownRecord,
>(
  object: T,
  callback: (
    key: PropertyKey,
    value: unknown,
  ) => PropertyKey,
): UnknownRecord {
  const result =
    createResultObject();

  for (
    const key of Reflect.ownKeys(object)
  ) {
    const nextKey =
      callback(
        key,
        Reflect.get(object, key),
      );

    if (!safeKey(nextKey)) {
      continue;
    }

    defineSafeProperty(
      result,
      nextKey,
      Reflect.get(object, key),
    );
  }

  return result;
}

/* ============================================================================
 * DEFAULTS / FALLBACKS
 * ========================================================================== */

export function defaults<
  T extends AnyObject,
>(
  object: T,
  ...sources: AnyObject[]
): T {
  const result =
    deepClone(object) as T;

  for (
    const source of sources
  ) {
    for (
      const key of Object.keys(source)
    ) {
      if (
        !hasOwn(result, key) ||
        result[key] === undefined
      ) {
        defineSafeProperty(
          result,
          key,
          source[key],
        );
      }
    }
  }

  return result;
}

export function withDefaults<
  T extends AnyObject,
>(
  object:
    | T
    | null
    | undefined,
  fallback: T,
): T {
  if (object == null) {
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
  ...values: Array<
    T | undefined
  >
): T | undefined {
  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

export function firstNonNullish<T>(
  ...values: Array<
    T | null | undefined
  >
): T | undefined {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined
    ) {
      return value;
    }
  }

  return undefined;
}

export function valueOr<T>(
  value:
    | T
    | null
    | undefined,
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

export function valueOrUndefined<T>(
  value: T | null,
): T | undefined {
  return value === null
    ? undefined
    : value;
}

/* ============================================================================
 * SORTING
 * ========================================================================== */

export function sortObjectKeys(
  object: UnknownRecord,
  compare?: Comparator<string>,
): UnknownRecord {
  const keys =
    Object.keys(object).sort(compare);

  const result =
    createResultObject();

  for (
    const key of keys
  ) {
    defineSafeProperty(
      result,
      key,
      object[key],
    );
  }

  return result;
}

export function sortObjectByValue<T>(
  object: Record<string, T>,
  compare: Comparator<T>,
): Record<string, T> {
  const entries =
    Object.entries(object);

  entries.sort(
    (
      [, a],
      [, b],
    ) =>
      compare(a, b),
  );

  return fromEntries(entries);
}

export function sortObjectByKey<
  T,
>(
  object: Record<string, T>,
  compare?: Comparator<string>,
): Record<string, T> {
  const keys =
    Object.keys(object).sort(compare);

  const result:
    Record<string, T> =
    createDictionary<T>();

  for (
    const key of keys
  ) {
    result[key] =
      object[key];
  }

  return result;
}

/* ============================================================================
 * ARRAY / OBJECT HELPERS
 * ========================================================================== */

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
  const result:
    Dictionary<T> =
    createDictionary<T>();

  items.forEach(
    (
      item,
      index,
    ) => {
      const key =
        getKey(
          item,
          index,
        );

      if (safeKey(key)) {
        result[key] =
          item;
      }
    },
  );

  return result;
}

export function compactArray<T>(
  items: readonly T[],
): T[] {
  return items.filter(
    Boolean,
  );
}

export function unique<T>(
  items: readonly T[],
): T[] {
  return [
    ...new Set(items),
  ];
}

export function uniqueBy<T, K>(
  items: readonly T[],
  getKey: (
    item: T,
    index: number,
  ) => K,
): T[] {
  const seen =
    new Set<K>();

  const result: T[] = [];

  items.forEach(
    (
      item,
      index,
    ) => {
      const key =
        getKey(
          item,
          index,
        );

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      result.push(item);
    },
  );

  return result;
}

/* ============================================================================
 * SIZE / VALIDATION
 * ========================================================================== */

export function assertObject(
  value: unknown,
  message = "Expected an object",
): asserts value is UnknownRecord {
  if (!isObjectLike(value)) {
    throw new TypeError(message);
  }
}

export function assertPlainObject(
  value: unknown,
  message = "Expected a plain object",
): asserts value is Record<
  string,
  unknown
> {
  if (!isPlainObject(value)) {
    throw new TypeError(message);
  }
}

export function isNonEmptyObject(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    isPlainObject(value) &&
    Object.keys(value).length > 0
  );
}

export function objectHasValues(
  object: object,
): boolean {
  return (
    Object.keys(object).length > 0
  );
}

export function isEmpty(
  value: unknown,
): boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (typeof value === "string") {
    return value.length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (isMap(value) || isSet(value)) {
    return value.size === 0;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}

/* ============================================================================
 * NUMERIC HELPERS
 * ========================================================================== */

export function numericValue(
  value: unknown,
  fallback = 0,
): number {
  if (isFiniteNumber(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return fallback;
    }

    const parsed =
      Number(trimmed);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  if (typeof value === "bigint") {
    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  return fallback;
}

export function numericProperty(
  object: unknown,
  key: PropertyKey,
  fallback = 0,
): number {
  return numericValue(
    getProperty(
      object,
      key,
    ),
    fallback,
  );
}

export function clamp(
  value: number,
  min: number,
  max: number,
): number {
  if (min > max) {
    return clamp(
      value,
      max,
      min,
    );
  }

  return Math.min(
    Math.max(value, min),
    max,
  );
}

export function percentage(
  value: number,
  min = 0,
  max = 100,
): number {
  if (max === min) {
    return 0;
  }

  return clamp(
    ((value - min) /
      (max - min)) *
      100,
    0,
    100,
  );
}

/* ============================================================================
 * SAFE OBJECT CREATION
 * ========================================================================== */

export function createNullObject():
  UnknownRecord {
  return Object.create(
    null,
  ) as UnknownRecord;
}

export function createSafeObject(
  entries?: Iterable<
    readonly [
      PropertyKey,
      unknown,
    ]
  >,
): UnknownRecord {
  const result =
    createResultObject();

  if (!entries) {
    return result;
  }

  for (
    const [
      key,
      value,
    ] of entries
  ) {
    if (!safeKey(key)) {
      continue;
    }

    defineSafeProperty(
      result,
      key,
      value,
    );
  }

  return result;
}

/* ============================================================================
 * DEEP TRANSFORM
 * ========================================================================== */

export function deepMap<T>(
  value: T,
  mapper: (
    value: unknown,
    path: readonly PropertyKey[],
  ) => unknown,
): T {
  return deepMapInternal(
    value,
    mapper,
    [],
    new WeakMap<
      object,
      unknown
    >(),
  ) as T;
}

function deepMapInternal(
  value: unknown,
  mapper: (
    value: unknown,
    path: readonly PropertyKey[],
  ) => unknown,
  path: PropertyKey[],
  seen: WeakMap<
    object,
    unknown
  >,
): unknown {
  const mapped =
    mapper(value, path);

  if (
    mapped !== value
  ) {
    return mapped;
  }

  if (!isObjectLike(value)) {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  if (Array.isArray(value)) {
    const result:
      unknown[] = [];

    seen.set(value, result);

    value.forEach(
      (item, index) => {
        result[index] =
          deepMapInternal(
            item,
            mapper,
            [
              ...path,
              index,
            ],
            seen,
          );
      },
    );

    return result;
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

  if (isPlainObject(value)) {
    const result =
      createResultObject();

    seen.set(value, result);

    for (
      const key of Reflect.ownKeys(value)
    ) {
      if (!safeKey(key)) {
        continue;
      }

      defineSafeProperty(
        result,
        key,
        deepMapInternal(
          Reflect.get(value, key),
          mapper,
          [
            ...path,
            key,
          ],
          seen,
        ),
      );
    }

    return result;
  }

  return value;
}

export function deepTransform<T>(
  value: T,
  transformer: (
    value: unknown,
    path?: readonly PropertyKey[],
  ) =>
    | {
        keep: boolean;
        value: unknown;
      }
    | undefined,
): T {
  return deepTransformInternal(
    value,
    transformer,
    [],
    new WeakMap<
      object,
      unknown
    >(),
  ) as T;
}

function deepTransformInternal(
  value: unknown,
  transformer: (
    value: unknown,
    path?: readonly PropertyKey[],
  ) =>
    | {
        keep: boolean;
        value: unknown;
      }
    | undefined,
  path: PropertyKey[],
  seen: WeakMap<
    object,
    unknown
  >,
): unknown {
  const transformed =
    transformer(
      value,
      path,
    );

  if (
    transformed &&
    !transformed.keep
  ) {
    return undefined;
  }

  const current =
    transformed?.value ?? value;

  if (!isObjectLike(current)) {
    return current;
  }

  if (seen.has(current)) {
    return seen.get(current);
  }

  if (Array.isArray(current)) {
    const result:
      unknown[] = [];

    seen.set(current, result);

    for (
      let index = 0;
      index < current.length;
      index += 1
    ) {
      const nested =
        deepTransformInternal(
          current[index],
          transformer,
          [
            ...path,
            index,
          ],
          seen,
        );

      if (nested !== undefined) {
        result.push(nested);
      }
    }

    return result;
  }

  if (isPlainObject(current)) {
    const result =
      createResultObject();

    seen.set(current, result);

    for (
      const key of Reflect.ownKeys(current)
    ) {
      if (!safeKey(key)) {
        continue;
      }

      const nested =
        deepTransformInternal(
          Reflect.get(current, key),
          transformer,
          [
            ...path,
            key,
          ],
          seen,
        );

      if (nested !== undefined) {
        defineSafeProperty(
          result,
          key,
          nested,
        );
      }
    }

    return result;
  }

  return current;
}

/* ============================================================================
 * DIFF
 * ========================================================================== */

export function diff(
  before: unknown,
  after: unknown,
): DiffEntry[] {
  const changes: DiffEntry[] = [];

  diffInternal(
    before,
    after,
    [],
    changes,
    new WeakMap<
      object,
      WeakSet<object>
    >(),
  );

  return changes;
}

function diffInternal(
  before: unknown,
  after: unknown,
  path: PropertyKey[],
  changes: DiffEntry[],
  seen: WeakMap<
    object,
    WeakSet<object>
  >,
): void {
  if (equals(before, after)) {
    return;
  }

  if (
    isPlainObject(before) &&
    isPlainObject(after)
  ) {
    let pairs =
      seen.get(before);

    if (!pairs) {
      pairs = new WeakSet();
      seen.set(before, pairs);
    }

    if (pairs.has(after)) {
      return;
    }

    pairs.add(after);

    const keys = new Set(
      Reflect.ownKeys(before).concat(
        Reflect.ownKeys(after),
      ),
    );

    for (
      const key of keys
    ) {
      if (!safeKey(key)) {
        continue;
      }

      const beforeHas =
        hasOwn(before, key);

      const afterHas =
        hasOwn(after, key);

      const nextPath = [
        ...path,
        key,
      ];

      if (
        !beforeHas &&
        afterHas
      ) {
        changes.push({
          path: nextPath
            .map(String)
            .join("."),
          type: "added",
          after: Reflect.get(
            after,
            key,
          ),
        });

        continue;
      }

      if (
        beforeHas &&
        !afterHas
      ) {
        changes.push({
          path: nextPath
            .map(String)
            .join("."),
          type: "removed",
          before: Reflect.get(
            before,
            key,
          ),
        });

        continue;
      }

      diffInternal(
        Reflect.get(
          before,
          key,
        ),
        Reflect.get(
          after,
          key,
        ),
        nextPath,
        changes,
        seen,
      );
    }

    return;
  }

  changes.push({
    path: path.map(String).join("."),
    type: "changed",
    before,
    after,
  });
}

export function changedKeys(
  before: UnknownRecord,
  after: UnknownRecord,
): PropertyKey[] {
  const keys =
    new Set<PropertyKey>([
      ...Reflect.ownKeys(before),
      ...Reflect.ownKeys(after),
    ]);

  const changed: PropertyKey[] = [];

  for (
    const key of keys
  ) {
    if (
      !equals(
        Reflect.get(before, key),
        Reflect.get(after, key),
      )
    ) {
      changed.push(key);
    }
  }

  return changed;
}

/* ============================================================================
 * ASSERTIONS
 * ========================================================================== */

export function assertString(
  value: unknown,
  message = "Expected a string",
): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(message);
  }
}

export function assertNumber(
  value: unknown,
  message = "Expected a number",
): asserts value is number {
  if (!isFiniteNumber(value)) {
    throw new TypeError(message);
  }
}

export function assertArray(
  value: unknown,
  message = "Expected an array",
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(message);
  }
}

/* ============================================================================
 * EMPTY / CONSTANT HELPERS
 * ========================================================================== */

export function emptyObject<
  T extends AnyObject = AnyObject,
>(): T {
  return createResultObject() as T;
}

export function readonlyEmptyObject():
  Readonly<
    Record<string, never>
  > {
  return EMPTY_OBJECT;
}

export function emptyArray<
  T = never,
>(): readonly T[] {
  return EMPTY_ARRAY as readonly T[];
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

  if (isInvalidDate(value)) {
    return "invalid-date";
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

  if (isWeakMap(value)) {
    return "weakmap";
  }

  if (isWeakSet(value)) {
    return "weakset";
  }

  if (isPromiseLike(value)) {
    return "promise";
  }

  if (isError(value)) {
    return "error";
  }

  if (isURL(value)) {
    return "url";
  }

  if (isPlainObject(value)) {
    return "object";
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
  isFunction: boolean;
  isNullish: boolean;
  isFrozen: boolean;
  keys: number;
  enumerableKeys: number;
} {
  return {
    type: describeValue(object),
    isObject:
      isObjectLike(object),
    isPlainObject:
      isPlainObject(object),
    isArray:
      Array.isArray(object),
    isFunction:
      typeof object === "function",
    isNullish:
      object == null,
    isFrozen:
      isFrozen(object),
    keys:
      isObjectLike(object)
        ? Reflect.ownKeys(object)
            .length
        : 0,
    enumerableKeys:
      isObjectLike(object)
        ? Object.keys(object)
            .length
        : 0,
  };
}

/* ============================================================================
 * DEFAULT EXPORT
 * ========================================================================== */

export default {
  // Type guards
  isObject,
  isRecord,
  isFunction,
  isAsyncFunction,
  isGeneratorFunction,
  isArray,
  isPrimitive,
  isString,
  isNumber,
  isFiniteNumber,
  isInteger,
  isSafeInteger,
  isNaNValue,
  isBoolean,
  isBigInt,
  isSymbol,
  isNull,
  isUndefined,
  isNullish,
  isTruthy,
  isFalsy,
  isPlainObject,
  isDate,
  isInvalidDate,
  isRegExp,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isPromiseLike,
  isError,
  isURL,

  // Keys
  isPropertyKey,
  normalizeKey,
  isDangerousKey,
  safeKey,
  safeKeys,
  unsafeKeys,

  // Properties
  hasOwn,
  hasProperty,
  hasAnyProperty,
  hasAllProperties,

  // Getters
  getProperty,
  getOwnProperty,
  getObjectValue,
  getString,
  getNumber,
  getBoolean,
  getBigInt,
  getArray,
  getObject,
  getOr,
  getStringOr,
  getNumberOr,

  // Mutation
  setProperty,
  setProperties,
  assignSafe,
  deleteProperty,
  deleteProperties,
  clearObject,

  // Pick / omit
  pick,
  omit,
  pickBy,
  omitBy,
  pickDefined,
  pickNonNull,

  // Cleaning
  removeUndefined,
  removeNull,
  sanitizeObject,
  compactObject,
  removeEmptyStrings,
  trimStrings,
  removeKeys,
  removeEmptyObjects,
  deepClean,

  // Keys / values / entries
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

  // Conversion
  toRecord,
  toObject,
  fromEntries,
  toEntries,
  toKeyValueArray,
  objectToArray,
  objectToPairs,
  objectToMap,
  mapToObject,

  // Iteration
  mapObject,
  mapValues,
  mapEntries,
  filterObject,
  findObjectValue,
  findObjectEntry,
  reduceObject,
  someObject,
  everyObject,
  partitionObject,

  // Search
  findKey,
  findValue,
  containsValue,
  hasValue,
  containsKey,

  // Clone
  clone,
  shallowClone,
  deepClone,
  deepCloneWith,

  // Merge
  merge,
  mergeMany,
  deepMerge,
  deepMergeWith,
  mergeDefined,

  // Immutable
  withProperty,
  withoutProperty,
  updateObject,
  updateObjectSafe,

  // Freeze
  freeze,
  deepFreeze,
  isFrozen,

  // Equality
  equals,
  isEqual,
  shallowEquals,

  // JSON
  safeJsonParse,
  parseJson,
  safeJsonStringify,
  jsonStringify,
  jsonPretty,
  isValidJson,

  // Flatten
  flattenObject,
  unflattenObject,

  // Paths
  parsePath,
  pathToString,
  getPath,
  hasPath,
  setPath,
  setPathImmutable,
  deletePath,
  deletePathImmutable,

  // Grouping
  groupBy,
  groupByMulti,
  keyBy,
  keyByLast,
  countBy,
  indexBy,
  partition,

  // Transformations
  invertObject,
  invertObjectMulti,
  renameKeys,
  mapKeys,
  mapKeysSafe,

  // Defaults
  defaults,
  withDefaults,

  // Values
  firstDefined,
  firstNonNullish,
  valueOr,
  valueOrNull,
  valueOrUndefined,

  // Sorting
  sortObjectKeys,
  sortObjectByValue,
  sortObjectByKey,

  // Array helpers
  arrayToObject,
  arrayToDictionary,
  compactArray,
  unique,
  uniqueBy,

  // Validation
  assertObject,
  assertPlainObject,
  assertString,
  assertNumber,
  assertArray,
  isNonEmptyObject,
  objectHasValues,
  isEmpty,

  // Numbers
  numericValue,
  numericProperty,
  clamp,
  percentage,

  // Creation
  createNullObject,
  createSafeObject,

  // Deep transformations
  deepMap,
  deepTransform,

  // Diff
  diff,
  changedKeys,

  // Empty
  emptyObject,
  readonlyEmptyObject,
  emptyArray,

  // Debug
  describeValue,
  inspectObject,
};
