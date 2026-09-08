// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// VALIDATION UTILITIES
// Version: 2026.09
// ============================================================

/**
 * Общие функции валидации для API, публикаций,
 * профилей, комментариев, чата, админ-панели
 * и других компонентов системы.
 */

// ============================================================
// BASIC TYPES
// ============================================================

export type ValidationResult =
  | {
      valid: true;
      value: string;
    }
  | {
      valid: false;
      value: null;
      error: string;
    };

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrors {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================
// STRING
// ============================================================

export function isString(
  value: unknown
): value is string {
  return typeof value === "string";
}

export function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function validateString(
  value: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    trim?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 0,
    maxLength = Infinity,
    required = true,
    trim = true,
  } = options;

  if (value === null || value === undefined) {
    if (!required) {
      return {
        valid: true,
        value: "",
      };
    }

    return {
      valid: false,
      value: null,
      error: "Значение обязательно",
    };
  }

  if (typeof value !== "string") {
    return {
      valid: false,
      value: null,
      error: "Значение должно быть строкой",
    };
  }

  const normalized = trim
    ? value.trim()
    : value;

  if (
    required &&
    normalized.length === 0
  ) {
    return {
      valid: false,
      value: null,
      error: "Значение не может быть пустым",
    };
  }

  if (normalized.length < minLength) {
    return {
      valid: false,
      value: null,
      error: `Минимальная длина: ${minLength}`,
    };
  }

  if (normalized.length > maxLength) {
    return {
      valid: false,
      value: null,
      error: `Максимальная длина: ${maxLength}`,
    };
  }

  return {
    valid: true,
    value: normalized,
  };
}

// ============================================================
// NUMBER
// ============================================================

export function isNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function isInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value)
  );
}

export function validateNumber(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  } = {}
): boolean {
  const {
    min,
    max,
    integer = false,
    required = true,
  } = options;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return !required;
  }

  if (!isNumber(value)) {
    return false;
  }

  if (
    integer &&
    !Number.isInteger(value)
  ) {
    return false;
  }

  if (
    min !== undefined &&
    value < min
  ) {
    return false;
  }

  if (
    max !== undefined &&
    value > max
  ) {
    return false;
  }

  return true;
}

// ============================================================
// BOOLEAN
// ============================================================

export function isBoolean(
  value: unknown
): value is boolean {
  return typeof value === "boolean";
}

// ============================================================
// ARRAY
// ============================================================

export function isArray(
  value: unknown
): value is unknown[] {
  return Array.isArray(value);
}

export function validateArray(
  value: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): boolean {
  const {
    minLength = 0,
    maxLength = Infinity,
    required = true,
  } = options;

  if (
    value === null ||
    value === undefined
  ) {
    return !required;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return (
    value.length >= minLength &&
    value.length <= maxLength
  );
}

// ============================================================
// OBJECT
// ============================================================

export function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

// ============================================================
// EMAIL
// ============================================================

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function isValidEmail(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const email = value.trim();

  if (
    email.length < 3 ||
    email.length > 254
  ) {
    return false;
  }

  return EMAIL_REGEX.test(email);
}

// ============================================================
// PHONE
// ============================================================

export function normalizePhone(
  value: unknown
): string | null {
  if (!isString(value)) {
    return null;
  }

  const phone = value
    .trim()
    .replace(/[()\s-]/g, "");

  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    return null;
  }

  return phone;
}

export function isValidPhone(
  value: unknown
): value is string {
  return normalizePhone(value) !== null;
}

// ============================================================
// URL
// ============================================================

export function isValidUrl(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

// ============================================================
// UUID
// ============================================================

export function isValidUuid(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

// ============================================================
// ID
// ============================================================

export function isValidEntityId(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const id = value.trim();

  if (
    id.length < 3 ||
    id.length > 256
  ) {
    return false;
  }

  return /^[a-zA-Z0-9_-]+$/.test(id);
}

// ============================================================
// SLUG
// ============================================================

export function isValidSlug(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
    value
  );
}

// ============================================================
// USERNAME
// ============================================================

export function isValidUsername(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const username = value.trim();

  if (
    username.length < 2 ||
    username.length > 50
  ) {
    return false;
  }

  return /^[a-zA-Z0-9_.-]+$/.test(
    username
  );
}

// ============================================================
// NAME
// ============================================================

export function isValidName(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const name = value.trim();

  if (
    name.length < 1 ||
    name.length > 150
  ) {
    return false;
  }

  return /^[\p{L}\p{M}0-9 .,'’_-]+$/u.test(
    name
  );
}

// ============================================================
// LANGUAGE
// ============================================================

export type SupportedLanguage =
  | "ru"
  | "tj"
  | "en";

export function isSupportedLanguage(
  value: unknown
): value is SupportedLanguage {
  return (
    value === "ru" ||
    value === "tj" ||
    value === "en"
  );
}

// ============================================================
// DATE
// ============================================================

export function isValidDate(
  value: unknown
): value is string | Date {
  if (
    value instanceof Date
  ) {
    return !Number.isNaN(
      value.getTime()
    );
  }

  if (!isString(value)) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(
    date.getTime()
  );
}

// ============================================================
// ISO DATE
// ============================================================

export function isValidIsoDate(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return false;
  }

  return (
    date.toISOString() ===
    value
  );
}

// ============================================================
// ENUM
// ============================================================

export function isOneOf<T>(
  value: unknown,
  values: readonly T[]
): value is T {
  return values.includes(
    value as T
  );
}

// ============================================================
// JSON
// ============================================================

export function isValidJson(
  value: unknown
): boolean {
  if (!isString(value)) {
    return false;
  }

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// SAFE INTEGER
// ============================================================

export function isSafeInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value)
  );
}

// ============================================================
// POSITIVE INTEGER
// ============================================================

export function isPositiveInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

// ============================================================
// NON-NEGATIVE INTEGER
// ============================================================

export function isNonNegativeInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

// ============================================================
// PAGINATION
// ============================================================

export function validatePagination(
  page: unknown,
  limit: unknown,
  options: {
    maxLimit?: number;
  } = {}
): {
  valid: boolean;
  page: number;
  limit: number;
} {
  const maxLimit =
    options.maxLimit ?? 100;

  const parsedPage =
    typeof page === "string"
      ? Number(page)
      : page;

  const parsedLimit =
    typeof limit === "string"
      ? Number(limit)
      : limit;

  const validPage =
    isPositiveInteger(parsedPage)
      ? parsedPage
      : 1;

  const validLimit =
    isPositiveInteger(parsedLimit)
      ? Math.min(
          parsedLimit,
          maxLimit
        )
      : 20;

  return {
    valid:
      isPositiveInteger(parsedPage) &&
      isPositiveInteger(parsedLimit) &&
      parsedLimit <= maxLimit,
    page: validPage,
    limit: validLimit,
  };
}

// ============================================================
// TEXT SAFETY
// ============================================================

export function containsControlCharacters(
  value: unknown
): boolean {
  if (!isString(value)) {
    return false;
  }

  return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(
    value
  );
}

export function containsHtmlTags(
  value: unknown
): boolean {
  if (!isString(value)) {
    return false;
  }

  return /<[^>]*>/g.test(value);
}

export function stripHtml(
  value: string
): string {
  return value
    .replace(/<[^>]*>/g, "")
    .trim();
}

// ============================================================
// CONTENT VALIDATION
// ============================================================

export function validateContent(
  value: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    allowHtml?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 1,
    maxLength = 10000,
    allowHtml = false,
  } = options;

  if (!isString(value)) {
    return {
      valid: false,
      value: null,
      error: "Текст должен быть строкой",
    };
  }

  const content = value.trim();

  if (
    content.length < minLength
  ) {
    return {
      valid: false,
      value: null,
      error: `Минимальная длина: ${minLength}`,
    };
  }

  if (
    content.length > maxLength
  ) {
    return {
      valid: false,
      value: null,
      error: `Максимальная длина: ${maxLength}`,
    };
  }

  if (
    containsControlCharacters(content)
  ) {
    return {
      valid: false,
      value: null,
      error:
        "Текст содержит недопустимые управляющие символы",
    };
  }

  if (
    !allowHtml &&
    containsHtmlTags(content)
  ) {
    return {
      valid: false,
      value: null,
      error:
        "HTML-теги не разрешены",
    };
  }

  return {
    valid: true,
    value: content,
  };
}

// ============================================================
// PASSWORD
// ============================================================

export function validatePassword(
  value: unknown
): boolean {
  if (!isString(value)) {
    return false;
  }

  if (
    value.length < 8 ||
    value.length > 256
  ) {
    return false;
  }

  return true;
}

// ============================================================
// TOKEN
// ============================================================

export function isValidToken(
  value: unknown,
  minLength = 16,
  maxLength = 512
): value is string {
  if (!isString(value)) {
    return false;
  }

  if (
    value.length < minLength ||
    value.length > maxLength
  ) {
    return false;
  }

  return /^[A-Za-z0-9_-]+$/.test(
    value
  );
}

// ============================================================
// IP ADDRESS
// ============================================================

export function isValidIPv4(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (
      !/^\d+$/.test(part)
    ) {
      return false;
    }

    const number = Number(part);

    return (
      number >= 0 &&
      number <= 255
    );
  });
}

export function isValidIPv6(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  try {
    const url = new URL(
      `http://[${value}]`
    );

    return (
      url.hostname ===
      `[${value}]`
    );
  } catch {
    return false;
  }
}

// ============================================================
// FILE NAME
// ============================================================

export function isValidFileName(
  value: unknown
): value is string {
  if (!isString(value)) {
    return false;
  }

  const name = value.trim();

  if (
    name.length < 1 ||
    name.length > 255
  ) {
    return false;
  }

  if (
    /[<>:"/\\|?*\u0000-\u001F]/.test(
      name
    )
  ) {
    return false;
  }

  if (
    name === "." ||
    name === ".."
  ) {
    return false;
  }

  return true;
}

// ============================================================
// MIME TYPE
// ============================================================

export function isValidMimeType(
  value: unknown,
  allowed: readonly string[]
): value is string {
  if (!isString(value)) {
    return false;
  }

  return allowed.includes(
    value.toLowerCase().trim()
  );
}

// ============================================================
// REQUEST BODY
// ============================================================

export function validateRequestBody(
  value: unknown
): value is Record<string, unknown> {
  return isObject(value);
}

// ============================================================
// FIELD VALIDATION
// ============================================================

export function validateFields(
  fields: Record<
    string,
    {
      value: unknown;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
    }
  >
): ValidationErrors {
  const errors: ValidationError[] = [];

  for (
    const [
      field,
      config,
    ] of Object.entries(fields)
  ) {
    const result =
      validateString(
        config.value,
        {
          required:
            config.required ?? true,
          minLength:
            config.minLength,
          maxLength:
            config.maxLength,
        }
      );

    if (!result.valid) {
      errors.push({
        field,
        message: result.error,
        code: "INVALID_FIELD",
      });
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}

// ============================================================
// REQUIRED FIELD
// ============================================================

export function hasRequiredFields(
  object: unknown,
  fields: readonly string[]
): boolean {
  if (!isObject(object)) {
    return false;
  }

  return fields.every(
    (field) =>
      field in object &&
      object[field] !== null &&
      object[field] !== undefined &&
      String(
        object[field]
      ).trim().length > 0
  );
}

// ============================================================
// NORMALIZE STRING
// ============================================================

export function normalizeString(
  value: unknown
): string | null {
  if (!isString(value)) {
    return null;
  }

  const normalized =
    value
      .normalize("NFKC")
      .trim();

  return normalized || null;
}

// ============================================================
// NORMALIZE EMAIL
// ============================================================

export function normalizeEmail(
  value: unknown
): string | null {
  if (!isString(value)) {
    return null;
  }

  const email =
    value
      .trim()
      .toLowerCase();

  return isValidEmail(email)
    ? email
    : null;
}

// ============================================================
// NORMALIZE USERNAME
// ============================================================

export function normalizeUsername(
  value: unknown
): string | null {
  if (!isString(value)) {
    return null;
  }

  const username =
    value
      .trim()
      .toLowerCase();

  return isValidUsername(
    username
  )
    ? username
    : null;
}

// ============================================================
// END
// ============================================================
