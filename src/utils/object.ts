// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// OBJECT UTILITIES
// Version: 2026.09.09
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type AnyObject =
  Record<string, unknown>;

export type UnknownRecord =
  Record<string, unknown>;

// ============================================================
// IS OBJECT
// ============================================================

export function isObject(
  value: unknown,
): value is AnyObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

// ============================================================
// IS PLAIN OBJECT
// ============================================================

export function isPlainObject(
  value: unknown,
): value is AnyObject {
  if (!isObject(value)) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value,
    );

  return (
    prototype ===
      Object.prototype ||
    prototype === null
  );
}

// ============================================================
// HAS OWN PROPERTY
// ============================================================

export function hasOwn(
  object: object,
  key: PropertyKey,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    object,
    key,
  );
}

// ============================================================
// GET
// ============================================================

export function getObjectValue<T = unknown>(
  object: unknown,
  key: PropertyKey,
  fallback?: T,
): T | undefined {
  if (
    object === null ||
    typeof object !== "object"
  ) {
    return fallback;
  }

  if (
    !hasOwn(
      object,
      key,
    )
  ) {
    return fallback;
  }

  /*
   * PropertyKey может быть string,
   * number или symbol.
   *
   * Приведение объекта к Record<PropertyKey, unknown>
   * позволяет TypeScript корректно индексировать
   * все допустимые ключи.
   */
  const record =
    object as Record<
      PropertyKey,
      unknown
    >;

  const value =
    record[key];

  if (
    value === undefined
  ) {
    return fallback;
  }

  return value as T;
}

// ============================================================
// SET
// ============================================================

export function setObjectValue(
  object: AnyObject,
  key: string,
  value: unknown,
): AnyObject {
  object[key] = value;

  return object;
}

// ============================================================
// DELETE
// ============================================================

export function deleteObjectKey(
  object: AnyObject,
  key: string,
): AnyObject {
  delete object[key];

  return object;
}

// ============================================================
// PICK
// ============================================================

export function pick<T extends AnyObject>(
  object: T,
  keys: readonly string[],
): Partial<T> {
  const result:
    Partial<T> = {};

  for (
    const key of keys
  ) {
    if (
      hasOwn(
        object,
        key,
      )
    ) {
      (
        result as AnyObject
      )[key] =
        object[key];
    }
  }

  return result;
}

// ============================================================
// OMIT
// ============================================================

export function omit<T extends AnyObject>(
  object: T,
  keys: readonly string[],
): Partial<T> {
  const result:
    AnyObject = {};

  const excluded =
    new Set(
      keys,
    );

  for (
    const key of Object.keys(
      object,
    )
  ) {
    if (
      excluded.has(key)
    ) {
      continue;
    }

    result[key] =
      object[key];
  }

  return result as Partial<T>;
}

// ============================================================
// CLONE
// ============================================================

export function cloneObject<T>(
  object: T,
): T {
  if (
    object === null ||
    typeof object !== "object"
  ) {
    return object;
  }

  if (
    typeof structuredClone ===
    "function"
  ) {
    try {
      return structuredClone(
        object,
      );
    } catch {
      // fallback ниже
    }
  }

  if (
    Array.isArray(object)
  ) {
    return [
      ...object,
    ] as T;
  }

  return {
    ...(object as AnyObject),
  } as T;
}

// ============================================================
// DEEP CLONE
// ============================================================

export function deepClone<T>(
  value: T,
): T {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return value;
  }

  if (
    typeof structuredClone ===
    "function"
  ) {
    try {
      return structuredClone(
        value,
      );
    } catch {
      // fallback
    }
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      (item) =>
        deepClone(item),
    ) as T;
  }

  const source =
    value as AnyObject;

  const result:
    AnyObject = {};

  for (
    const key of Object.keys(
      source,
    )
  ) {
    result[key] =
      deepClone(
        source[key],
      );
  }

  return result as T;
}

// ============================================================
// MERGE
// ============================================================

export function mergeObjects(
  ...objects: Array<
    AnyObject | null | undefined
  >
): AnyObject {
  const result:
    AnyObject = {};

  for (
    const object of objects
  ) {
    if (
      !isObject(object)
    ) {
      continue;
    }

    Object.assign(
      result,
      object,
    );
  }

  return result;
}

// ============================================================
// DEEP MERGE
// ============================================================

export function deepMerge(
  ...objects: Array<
    AnyObject | null | undefined
  >
): AnyObject {
  const result:
    AnyObject = {};

  for (
    const object of objects
  ) {
    if (
      !isObject(object)
    ) {
      continue;
    }

    for (
      const key of Object.keys(
        object,
      )
    ) {
      const value =
        object[key];

      const current =
        result[key];

      if (
        isPlainObject(
          current,
        ) &&
        isPlainObject(
          value,
        )
      ) {
        result[key] =
          deepMerge(
            current,
            value,
          );
      } else {
        result[key] =
          value;
      }
    }
  }

  return result;
}

// ============================================================
// KEYS
// ============================================================

export function objectKeys(
  object: object,
): string[] {
  return Object.keys(
    object,
  );
}

// ============================================================
// VALUES
// ============================================================

export function objectValues<T = unknown>(
  object: Record<
    string,
    T
  >,
): T[] {
  return Object.values(
    object,
  );
}

// ============================================================
// ENTRIES
// ============================================================

export function objectEntries<T = unknown>(
  object: Record<
    string,
    T
  >,
): Array<
  [string, T]
> {
  return Object.entries(
    object,
  );
}

// ============================================================
// FROM ENTRIES
// ============================================================

export function objectFromEntries<T = unknown>(
  entries:
    | Iterable<
        readonly [
          string,
          T,
        ]
      >
    | Array<
        readonly [
          string,
          T,
        ]
      >,
): Record<string, T> {
  return Object.fromEntries(
    entries,
  ) as Record<
    string,
    T
  >;
}

// ============================================================
// IS EMPTY
// ============================================================

export function isEmptyObject(
  object: unknown,
): boolean {
  if (
    !isObject(object)
  ) {
    return true;
  }

  return (
    Object.keys(
      object,
    ).length === 0
  );
}

// ============================================================
// SIZE
// ============================================================

export function objectSize(
  object: unknown,
): number {
  if (
    !isObject(object)
  ) {
    return 0;
  }

  return Object.keys(
    object,
  ).length;
}

// ============================================================
// MAP VALUES
// ============================================================

export function mapObjectValues<T, R>(
  object: Record<
    string,
    T
  >,
  mapper: (
    value: T,
    key: string,
  ) => R,
): Record<
  string,
  R
> {
  const result:
    Record<
      string,
      R
    > = {};

  for (
    const [key, value]
    of Object.entries(
      object,
    )
  ) {
    result[key] =
      mapper(
        value,
        key,
      );
  }

  return result;
}

// ============================================================
// FILTER
// ============================================================

export function filterObject<T>(
  object: Record<
    string,
    T
  >,
  predicate: (
    value: T,
    key: string,
  ) => boolean,
): Record<
  string,
  T
> {
  const result:
    Record<
      string,
      T
    > = {};

  for (
    const [key, value]
    of Object.entries(
      object,
    )
  ) {
    if (
      predicate(
        value,
        key,
      )
    ) {
      result[key] =
        value;
    }
  }

  return result;
}

// ============================================================
// FIND
// ============================================================

export function findObjectValue<T>(
  object: Record<
    string,
    T
  >,
  predicate: (
    value: T,
    key: string,
  ) => boolean,
): T | undefined {
  for (
    const [key, value]
    of Object.entries(
      object,
    )
  ) {
    if (
      predicate(
        value,
        key,
      )
    ) {
      return value;
    }
  }

  return undefined;
}

// ============================================================
// FREEZE
// ============================================================

export function freezeObject<T>(
  object: T,
): Readonly<T> {
  return Object.freeze(
    object,
  );
}

// ============================================================
// SAFE JSON OBJECT
// ============================================================

export function toSafeObject(
  value: unknown,
): AnyObject {
  if (
    !isObject(value)
  ) {
    return {};
  }

  return {
    ...value,
  };
}

// ============================================================
// REMOVE UNDEFINED
// ============================================================

export function removeUndefined<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  const result:
    AnyObject = {};

  for (
    const [key, value]
    of Object.entries(
      object,
    )
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    result[key] =
      value;
  }

  return result as Partial<T>;
}

// ============================================================
// REMOVE NULL
// ============================================================

export function removeNull<
  T extends AnyObject,
>(
  object: T,
): Partial<T> {
  const result:
    AnyObject = {};

  for (
    const [key, value]
    of Object.entries(
      object,
    )
  ) {
    if (
      value === null
    ) {
      continue;
    }

    result[key] =
      value;
  }

  return result as Partial<T>;
}

// ============================================================
// SANITIZE OBJECT
// ============================================================

export function sanitizeObject(
  object: unknown,
): AnyObject {
  if (
    !isObject(object)
  ) {
    return {};
  }

  const result:
    AnyObject = {};

  for (
    const [key, value]
    of Object.entries(
      object,
    )
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    result[key] =
      value;
  }

  return result;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  isObject,
  isPlainObject,

  hasOwn,

  getObjectValue,
  setObjectValue,
  deleteObjectKey,

  pick,
  omit,

  cloneObject,
  deepClone,

  mergeObjects,
  deepMerge,

  objectKeys,
  objectValues,
  objectEntries,
  objectFromEntries,

  isEmptyObject,
  objectSize,

  mapObjectValues,
  filterObject,
  findObjectValue,

  freezeObject,

  toSafeObject,
  removeUndefined,
  removeNull,
  sanitizeObject,
};
