export type JsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export interface JsonParseResult<T = JsonValue> {
  success: boolean;
  value: T | null;
  error: string | null;
}

export interface JsonStringifyOptions {
  pretty?: boolean;
  maxLength?: number;
  sortKeys?: boolean;
}

const DEFAULT_MAX_LENGTH = 5 * 1024 * 1024;

export function isJsonPrimitive(
  value: unknown
): value is JsonPrimitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export function isJsonValue(
  value: unknown,
  maxDepth = 20
): value is JsonValue {
  function check(
    input: unknown,
    depth: number
  ): boolean {
    if (depth > maxDepth) {
      return false;
    }

    if (isJsonPrimitive(input)) {
      if (
        typeof input === "number" &&
        !Number.isFinite(input)
      ) {
        return false;
      }

      return true;
    }

    if (Array.isArray(input)) {
      return input.every((item) =>
        check(item, depth + 1)
      );
    }

    if (
      typeof input === "object" &&
      input !== null
    ) {
      return Object.entries(input).every(
        ([key, item]) =>
          typeof key === "string" &&
          check(item, depth + 1)
      );
    }

    return false;
  }

  return check(value, 0);
}

export function safeJsonParse<T = JsonValue>(
  value: string
): JsonParseResult<T> {
  if (typeof value !== "string") {
    return {
      success: false,
      value: null,
      error: "JSON input must be a string",
    };
  }

  try {
    const parsed = JSON.parse(value) as T;

    return {
      success: true,
      value: parsed,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      value: null,
      error:
        error instanceof Error
          ? error.message
          : "Invalid JSON",
    };
  }
}

export function parseJson<T = JsonValue>(
  value: string,
  fallback: T
): T {
  const result = safeJsonParse<T>(value);

  return result.success && result.value !== null
    ? result.value
    : fallback;
}

export function stringifyJson(
  value: unknown,
  options: JsonStringifyOptions = {}
): string | null {
  try {
    const normalized = options.sortKeys
      ? sortJsonKeys(value)
      : value;

    const result = JSON.stringify(
      normalized,
      createJsonReplacer(),
      options.pretty ? 2 : undefined
    );

    if (result === undefined) {
      return null;
    }

    const maxLength =
      options.maxLength ?? DEFAULT_MAX_LENGTH;

    if (result.length > maxLength) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
}

export function stringifyJsonSafe(
  value: unknown,
  fallback = "{}",
  options: JsonStringifyOptions = {}
): string {
  return (
    stringifyJson(value, options) ??
    fallback
  );
}

export function parseJsonObject(
  value: string
): Record<string, unknown> | null {
  const result =
    safeJsonParse<unknown>(value);

  if (
    !result.success ||
    !result.value ||
    typeof result.value !== "object" ||
    Array.isArray(result.value)
  ) {
    return null;
  }

  return result.value as Record<string, unknown>;
}

export function parseJsonArray<T = unknown>(
  value: string
): T[] | null {
  const result =
    safeJsonParse<unknown>(value);

  if (
    !result.success ||
    !Array.isArray(result.value)
  ) {
    return null;
  }

  return result.value as T[];
}

export function safeJsonObject<T extends object>(
  value: T
): Record<string, unknown> {
  try {
    const parsed = JSON.parse(
      JSON.stringify(value)
    );

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

export function jsonClone<T>(value: T): T {
  try {
    return JSON.parse(
      JSON.stringify(value)
    ) as T;
  } catch {
    return value;
  }
}

export function sortJsonKeys(
  value: unknown
): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }

  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date)
  ) {
    const object = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(object).sort()) {
      result[key] = sortJsonKeys(object[key]);
    }

    return result;
  }

  return value;
}

export function createJsonReplacer() {
  const seen = new WeakSet<object>();

  return (
    key: string,
    value: unknown
  ): unknown => {
    if (typeof value === "bigint") {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (
      value &&
      typeof value === "object"
    ) {
      if (seen.has(value)) {
        return "[Circular]";
      }

      seen.add(value);
    }

    if (
      typeof value === "number" &&
      !Number.isFinite(value)
    ) {
      return null;
    }

    if (typeof value === "undefined") {
      return null;
    }

    if (typeof value === "function") {
      return undefined;
    }

    if (typeof value === "symbol") {
      return String(value);
    }

    return value;
  };
}

export function jsonSize(
  value: unknown
): number {
  const serialized = stringifyJson(value);

  return serialized?.length ?? 0;
}

export function isValidJson(
  value: string,
  maxLength = DEFAULT_MAX_LENGTH
): boolean {
  if (
    typeof value !== "string" ||
    value.length > maxLength
  ) {
    return false;
  }

  const result =
    safeJsonParse<unknown>(value);

  return result.success &&
    isJsonValue(result.value);
}

export function normalizeJson(
  value: string
): string | null {
  const parsed =
    safeJsonParse<unknown>(value);

  if (!parsed.success) {
    return null;
  }

  return stringifyJson(parsed.value);
}

export function prettyJson(
  value: unknown
): string {
  return stringifyJsonSafe(value, "{}", {
    pretty: true,
  });
}

export function compactJson(
  value: unknown
): string {
  return stringifyJsonSafe(value, "{}", {
    pretty: false,
  });
}

export function mergeJsonObjects(
  ...values: Array<
    string | Record<string, unknown>
  >
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const value of values) {
    let object: Record<string, unknown> | null;

    if (typeof value === "string") {
      object = parseJsonObject(value);
    } else {
      object = value;
    }

    if (!object) continue;

    Object.assign(result, object);
  }

  return result;
}

export function getJsonValue(
  value: string,
  path: string
): unknown {
  const parsed =
    safeJsonParse<unknown>(value);

  if (!parsed.success) {
    return undefined;
  }

  const parts = path
    .split(".")
    .filter(Boolean);

  let current: unknown = parsed.value;

  for (const part of parts) {
    if (
      current === null ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(part);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= current.length
      ) {
        return undefined;
      }

      current = current[index];
      continue;
    }

    const object =
      current as Record<string, unknown>;

    if (!(part in object)) {
      return undefined;
    }

    current = object[part];
  }

  return current;
}

export function hasJsonPath(
  value: string,
  path: string
): boolean {
  return getJsonValue(value, path) !== undefined;
}

export function setJsonValue(
  value: string,
  path: string,
  newValue: unknown
): string | null {
  const parsed =
    safeJsonParse<unknown>(value);

  if (!parsed.success) {
    return null;
  }

  const parts = path
    .split(".")
    .filter(Boolean);

  if (parts.length === 0) {
    return stringifyJson(newValue);
  }

  let current: unknown = parsed.value;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];

    if (
      current === null ||
      typeof current !== "object"
    ) {
      return null;
    }

    if (Array.isArray(current)) {
      const index = Number(part);

      if (
        !Number.isInteger(index) ||
        index < 0
      ) {
        return null;
      }

      if (
        current[index] === undefined
      ) {
        current[index] =
          /^\d+$/.test(nextPart)
            ? []
            : {};
      }

      current = current[index];
    } else {
      const object =
        current as Record<string, unknown>;

      if (
        object[part] === null ||
        typeof object[part] !== "object"
      ) {
        object[part] =
          /^\d+$/.test(nextPart)
            ? []
            : {};
      }

      current = object[part];
    }
  }

  const last =
    parts[parts.length - 1];

  if (
    current === null ||
    typeof current !== "object"
  ) {
    return null;
  }

  if (Array.isArray(current)) {
    const index = Number(last);

    if (
      !Number.isInteger(index) ||
      index < 0
    ) {
      return null;
    }

    current[index] = newValue;
  } else {
    (
      current as Record<string, unknown>
    )[last] = newValue;
  }

  return stringifyJson(parsed.value);
}

export function deleteJsonValue(
  value: string,
  path: string
): string | null {
  const parsed =
    safeJsonParse<unknown>(value);

  if (!parsed.success) {
    return null;
  }

  const parts = path
    .split(".")
    .filter(Boolean);

  if (parts.length === 0) {
    return stringifyJson(null);
  }

  let current: unknown = parsed.value;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (
      current === null ||
      typeof current !== "object"
    ) {
      return stringifyJson(parsed.value);
    }

    if (Array.isArray(current)) {
      const index = Number(part);

      if (
        !Number.isInteger(index) ||
        current[index] === undefined
      ) {
        return stringifyJson(parsed.value);
      }

      current = current[index];
    } else {
      current = (
        current as Record<string, unknown>
      )[part];
    }
  }

  if (
    current === null ||
    typeof current !== "object"
  ) {
    return stringifyJson(parsed.value);
  }

  const last =
    parts[parts.length - 1];

  if (Array.isArray(current)) {
    const index = Number(last);

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < current.length
    ) {
      current.splice(index, 1);
    }
  } else {
    delete (
      current as Record<string, unknown>
    )[last];
  }

  return stringifyJson(parsed.value);
}

export function jsonArrayUnique<T>(
  values: T[]
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const value of values) {
    const key =
      stringifyJson(value) ??
      String(value);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
}

export function jsonArrayCompact<T>(
  values: Array<T | null | undefined>
): T[] {
  return values.filter(
    (value): value is T =>
      value !== null &&
      value !== undefined
  );
}

export function jsonArrayChunk<T>(
  values: T[],
  size: number
): T[][] {
  if (
    !Number.isInteger(size) ||
    size <= 0
  ) {
    return [];
  }

  const result: T[][] = [];

  for (
    let index = 0;
    index < values.length;
    index += size
  ) {
    result.push(
      values.slice(index, index + size)
    );
  }

  return result;
}

export function jsonToBase64(
  value: unknown
): string | null {
  const json = stringifyJson(value);

  if (json === null) {
    return null;
  }

  try {
    const bytes =
      new TextEncoder().encode(json);

    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  } catch {
    return null;
  }
}

export function base64ToJson<T = unknown>(
  value: string
): T | null {
  try {
    const binary = atob(value);

    const bytes =
      Uint8Array.from(
        binary,
        (char) => char.charCodeAt(0)
      );

    const json =
      new TextDecoder().decode(bytes);

    const result =
      safeJsonParse<T>(json);

    return result.success
      ? result.value
      : null;
  } catch {
    return null;
  }
}

export function jsonRecord(
  entries: Array<[string, unknown]>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    result[key] = value;
  }

  return result;
}

export function jsonPick(
  value: unknown,
  keys: readonly string[]
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const source =
    value as Record<string, unknown>;

  const result: Record<string, unknown> = {};

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
  }

  return result;
}

export function jsonOmit(
  value: unknown,
  keys: readonly string[]
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const excluded = new Set(keys);
  const source =
    value as Record<string, unknown>;

  const result: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(source)) {
    if (!excluded.has(key)) {
      result[key] = item;
    }
  }

  return result;
    }
