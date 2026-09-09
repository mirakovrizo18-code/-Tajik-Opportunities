import {
  isPlainObject,
  getProperty,
  hasProperty,
} from "./object";

import {
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
  normalizeWhitespace,
  sanitizeUserText,
  stripHtml,
} from "./string";

import {
  isValidEmail,
  isValidPhone,
  isValidUsername,
  isValidUrl,
} from "./validation";

// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// FORM UTILITIES
// Version: 2026.09.10 POWER PRODUCTION
// ============================================================
//
// Возможности:
//
// - FormData -> FormRecord
// - FormRecord -> FormData
// - типизированное чтение полей
// - массивы
// - файлы
// - вложенные FormData keys
// - нормализация
// - sanitization
// - HTML stripping
// - schema validation
// - required validation
// - email / phone / username / url
// - date / number / integer / boolean
// - min / max / length / pattern
// - custom validation
// - pick / omit
// - remove empty
// - deep clone
// - file extraction
// - error helpers
// - schema helpers
// - contact/profile/publication forms
// - backward compatibility
//
// ВАЖНО:
// Не используется внешний пакет.
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type FormPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type FormObject = {
  [key: string]: FormValue;
};

export type FormValue =
  | FormPrimitive
  | File
  | FormValue[]
  | FormObject;

export type FormRecord = Record<
  string,
  FormValue
>;

export type FormFieldValidator = (
  value: FormValue,
  data: FormRecord,
) =>
  | FormFieldError
  | string
  | null
  | undefined;

export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
  value?: FormValue;
}

export interface FormValidationResult<
  T = FormRecord,
> {
  valid: boolean;
  data: T | null;
  errors: FormFieldError[];
}

export interface FormFieldOptions {
  required?: boolean;

  minLength?: number;
  maxLength?: number;

  min?: number;
  max?: number;

  pattern?: RegExp;

  type?:
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "email"
    | "phone"
    | "username"
    | "url"
    | "date"
    | "file"
    | "array"
    | "object";

  sanitize?: boolean;
  trim?: boolean;
  normalize?: boolean;

  allowEmpty?: boolean;

  /**
   * Преобразовывать строковые числовые / boolean значения.
   */
  coerce?: boolean;

  /**
   * Удалять HTML перед validation.
   */
  stripHtml?: boolean;

  /**
   * Разрешить несколько значений.
   */
  multiple?: boolean;

  /**
   * Дополнительная пользовательская проверка.
   */
  validate?: FormFieldValidator;
}

export interface FormSchema {
  [field: string]: FormFieldOptions;
}

export interface FormDataParseOptions {
  maxFields?: number;
  maxFiles?: number;
  maxFieldLength?: number;

  /**
   * Включать пустые поля.
   */
  includeEmpty?: boolean;

  /**
   * Преобразовывать строки "123", "true", "false".
   *
   * По умолчанию false для обратной совместимости.
   */
  convertTypes?: boolean;

  /**
   * Поддерживать nested keys:
   *
   * user[name]
   * user[email]
   * user[address][city]
   *
   * По умолчанию false.
   */
  parseNestedKeys?: boolean;
}

export interface ParsedFormData {
  data: FormRecord;
  files: File[];
  fields: string[];
}

export interface FormErrorMap {
  [field: string]: string[];
}

export interface FormValidationOptions {
  stopAtFirstError?: boolean;
  includeUnknownFields?: boolean;
}

export interface NestedPathResult {
  path: string;
  value: FormValue;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_PARSE_OPTIONS: Required<
  FormDataParseOptions
> = {
  maxFields: 200,
  maxFiles: 20,
  maxFieldLength: 100_000,
  includeEmpty: false,
  convertTypes: false,
  parseNestedKeys: false,
};

const DEFAULT_FIELD_NAME_MAX_LENGTH =
  200;

const DEFAULT_MAX_ERROR_LENGTH =
  1_000;

const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// ============================================================
// INTERNAL TYPE GUARDS
// ============================================================

function isFileValue(
  value: FormValue,
): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File
  );
}

function isFormDataValue(
  value: FormDataEntryValue,
): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File
  );
}

function isFormRecordObject(
  value: FormValue,
): value is FormObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !isFileValue(value)
  );
}

// ============================================================
// KEY UTILITIES
// ============================================================

function normalizeKey(
  key: string,
): string {
  return String(key)
    .normalize("NFKC")
    .trim()
    .replace(/\[\]$/, "")
    .slice(
      0,
      DEFAULT_FIELD_NAME_MAX_LENGTH,
    );
}

function normalizeFieldName(
  field: string,
): string {
  return String(field)
    .normalize("NFKC")
    .trim();
}

// ============================================================
// STRING CONVERSION
// ============================================================

function convertStringValue(
  value: string,
): FormPrimitive {
  const trimmed =
    value.trim();

  if (trimmed === "") {
    return "";
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (
    /^-?\d+$/.test(trimmed) &&
    trimmed.length < 16
  ) {
    const number =
      Number(trimmed);

    if (
      Number.isSafeInteger(
        number,
      )
    ) {
      return number;
    }
  }

  if (
    /^-?\d+\.\d+$/.test(
      trimmed,
    ) &&
    trimmed.length < 16
  ) {
    const number =
      Number(trimmed);

    if (
      Number.isFinite(
        number,
      )
    ) {
      return number;
    }
  }

  return value;
}

// ============================================================
// NESTED KEY PARSING
// ============================================================

function parseNestedPath(
  key: string,
): string[] {
  const normalized =
    normalizeKey(key);

  if (!normalized) {
    return [];
  }

  const parts: string[] = [];

  const bracketPattern =
    /^([^[\]]+)|\[([^[\]]*)\]/g;

  let match: RegExpExecArray | null;

  while (
    (match =
      bracketPattern.exec(
        normalized,
      )) !== null
  ) {
    const value =
      match[1] ??
      match[2] ??
      "";

    if (value) {
      parts.push(value);
    }
  }

  if (
    parts.length === 0
  ) {
    return [normalized];
  }

  return parts;
}

function setNestedFormValue(
  target: FormRecord,
  path: readonly string[],
  value: FormValue,
): void {
  if (path.length === 0) {
    return;
  }

  if (path.length === 1) {
    addFormValue(
      target,
      path[0],
      value,
    );

    return;
  }

  const first =
    path[0];

  let current =
    target[first];

  if (
    !isFormRecordObject(
      current,
    )
  ) {
    current = {};
    target[first] =
      current;
  }

  setNestedFormValue(
    current,
    path.slice(1),
    value,
  );
}

// ============================================================
// FORM VALUE INSERTION
// ============================================================

function addFormValue(
  target: FormRecord,
  key: string,
  value: FormValue,
): void {
  if (!hasProperty(target, key)) {
    target[key] = value;
    return;
  }

  const existing =
    getProperty<FormValue>(
      target,
      key,
    );

  if (
    Array.isArray(
      existing,
    )
  ) {
    existing.push(value);
    return;
  }

  target[key] = [
    existing as FormValue,
    value,
  ];
}

// ============================================================
// FORM VALUE EMPTY CHECK
// ============================================================

function isEmptyFormValue(
  value: FormValue,
): boolean {
  if (
    value === undefined ||
    value === null
  ) {
    return true;
  }

  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return true;
  }

  if (
    Array.isArray(value) &&
    value.length === 0
  ) {
    return true;
  }

  return false;
}

// ============================================================
// FORM DATA -> RECORD
// ============================================================

export function formDataToRecord(
  formData: FormData,
  options: FormDataParseOptions = {},
): ParsedFormData {
  const config: Required<
    FormDataParseOptions
  > = {
    ...DEFAULT_PARSE_OPTIONS,
    ...options,
  };

  const data: FormRecord = {};
  const files: File[] = [];
  const fields: string[] = [];

  let fieldCount = 0;

  for (
    const [
      rawKey,
      rawValue,
    ] of formData.entries()
  ) {
    if (
      fieldCount >=
      config.maxFields
    ) {
      throw new Error(
        "Form contains too many fields.",
      );
    }

    const key =
      normalizeKey(rawKey);

    if (!key) {
      continue;
    }

    if (
      isFormDataValue(
        rawValue,
      )
    ) {
      if (
        rawValue.size === 0 &&
        !config.includeEmpty
      ) {
        continue;
      }

      if (
        files.length >=
        config.maxFiles
      ) {
        throw new Error(
          "Form contains too many files.",
        );
      }

      files.push(rawValue);

      if (
        config.parseNestedKeys
      ) {
        const path =
          parseNestedPath(
            rawKey,
          );

        setNestedFormValue(
          data,
          path,
          rawValue,
        );
      } else {
        addFormValue(
          data,
          key,
          rawValue,
        );
      }

      if (
        !fields.includes(key)
      ) {
        fields.push(key);
      }

      fieldCount++;
      continue;
    }

    if (
      rawValue.length >
      config.maxFieldLength
    ) {
      throw new Error(
        `Form field "${key}" is too long.`,
      );
    }

    if (
      !config.includeEmpty &&
      rawValue.trim() === ""
    ) {
      continue;
    }

    const finalValue =
      config.convertTypes
        ? convertStringValue(
            rawValue,
          )
        : rawValue;

    if (
      config.parseNestedKeys
    ) {
      const path =
        parseNestedPath(
          rawKey,
        );

      setNestedFormValue(
        data,
        path,
        finalValue,
      );
    } else {
      addFormValue(
        data,
        key,
        finalValue,
      );
    }

    if (
      !fields.includes(key)
    ) {
      fields.push(key);
    }

    fieldCount++;
  }

  return {
    data,
    files,
    fields,
  };
}

// ============================================================
// ALIASES
// ============================================================

export function formToObject(
  formData: FormData,
): FormRecord {
  return formDataToRecord(
    formData,
  ).data;
}

export function parseFormData(
  formData: FormData,
  options: FormDataParseOptions = {},
): ParsedFormData {
  return formDataToRecord(
    formData,
    options,
  );
}

export function formDataToObject(
  formData: FormData,
  options: FormDataParseOptions = {},
): FormRecord {
  return formDataToRecord(
    formData,
    options,
  ).data;
}

// ============================================================
// FIELD READERS
// ============================================================

export function getFormValue<
  T = FormValue,
>(
  data:
    | FormRecord
    | FormData,
  field: string,
  fallback?: T,
): T | undefined {
  if (
    data instanceof FormData
  ) {
    const value =
      data.get(field);

    if (value === null) {
      return fallback;
    }

    return value as T;
  }

  const value =
    data[field];

  return value === undefined
    ? fallback
    : (value as T);
}

export function getFormValues(
  data:
    | FormRecord
    | FormData,
  field: string,
): FormValue[] {
  if (
    data instanceof FormData
  ) {
    return data
      .getAll(field)
      .map(
        (value) =>
          value as FormValue,
      );
  }

  const value =
    data[field];

  if (value === undefined) {
    return [];
  }

  return Array.isArray(
    value,
  )
    ? value
    : [value];
}

export function getFormString(
  data:
    | FormRecord
    | FormData,
  field: string,
  fallback = "",
): string {
  const value =
    getFormValue<FormValue>(
      data,
      field,
    );

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return String(value);
  }

  return fallback;
}

export function getFormNumber(
  data:
    | FormRecord
    | FormData,
  field: string,
  fallback?: number,
): number | undefined {
  const value =
    getFormValue<FormValue>(
      data,
      field,
    );

  if (
    typeof value ===
    "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const number =
      Number(value);

    if (
      Number.isFinite(number)
    ) {
      return number;
    }
  }

  return fallback;
}

export function getFormBoolean(
  data:
    | FormRecord
    | FormData,
  field: string,
  fallback = false,
): boolean {
  const value =
    getFormValue<FormValue>(
      data,
      field,
    );

  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    if (
      normalized ===
        "true" ||
      normalized ===
        "1" ||
      normalized ===
        "yes"
    ) {
      return true;
    }

    if (
      normalized ===
        "false" ||
      normalized ===
        "0" ||
      normalized ===
        "no"
    ) {
      return false;
    }
  }

  return fallback;
}

// ============================================================
// FIELD CHECKS
// ============================================================

export function hasFormField(
  data:
    | FormRecord
    | FormData,
  field: string,
): boolean {
  if (
    data instanceof FormData
  ) {
    return data.has(field);
  }

  return hasProperty(
    data,
    field,
  );
}

export function isFormFieldEmpty(
  data:
    | FormRecord
    | FormData,
  field: string,
): boolean {
  return isEmptyFormValue(
    getFormValue<FormValue>(
      data,
      field,
    ),
  );
}

export function countFormFields(
  data: FormRecord,
): number {
  return Object.keys(
    data,
  ).length;
}

// ============================================================
// REQUIRED FIELDS
// ============================================================

export function requireFormFields(
  data: FormRecord,
  fields: readonly string[],
): FormFieldError[] {
  const errors: FormFieldError[] = [];

  for (const rawField of fields) {
    const field =
      normalizeFieldName(
        rawField,
      );

    if (!field) {
      continue;
    }

    const value =
      getProperty<FormValue>(
        data,
        field,
      );

    if (
      isEmptyFormValue(value)
    ) {
      errors.push({
        field,
        message:
          `Поле "${field}" обязательно.`,
        code: "REQUIRED",
      });
    }
  }

  return errors;
}

// ============================================================
// TYPE VALIDATION
// ============================================================

function validateFieldType(
  value: FormValue,
  type:
    | FormFieldOptions["type"],
): boolean {
  if (
    type === undefined
  ) {
    return true;
  }

  switch (type) {
    case "string":
      return (
        typeof value ===
        "string"
      );

    case "number":
      return (
        typeof value ===
          "number" &&
        Number.isFinite(
          value,
        )
      );

    case "integer":
      return (
        typeof value ===
          "number" &&
        Number.isSafeInteger(
          value,
        )
      );

    case "boolean":
      return (
        typeof value ===
        "boolean"
      );

    case "email":
      return (
        typeof value ===
          "string" &&
        isValidEmail(
          value,
        )
      );

    case "phone":
      return (
        typeof value ===
          "string" &&
        isValidPhone(
          value,
        )
      );

    case "username":
      return (
        typeof value ===
          "string" &&
        isValidUsername(
          value,
        )
      );

    case "url":
      return (
        typeof value ===
          "string" &&
        isValidUrl(
          value,
        )
      );

    case "date":
      if (
        typeof value !==
        "string"
      ) {
        return false;
      }

      return (
        !Number.isNaN(
          Date.parse(value),
        )
      );

    case "file":
      return isFileValue(
        value,
      );

    case "array":
      return Array.isArray(
        value,
      );

    case "object":
      return (
        isPlainObject(value)
      );

    default:
      return true;
  }
}

// ============================================================
// NORMALIZATION
// ============================================================

export function normalizeFormValue(
  value: FormValue,
  options: FormFieldOptions = {},
): FormValue {
  if (
    isFileValue(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      (item) =>
        normalizeFormValue(
          item,
          options,
        ),
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(value)
    ) {
      result[key] =
        normalizeFormValue(
          item,
          options,
        );
    }

    return result;
  }

  if (
    typeof value !==
    "string"
  ) {
    return value;
  }

  let result =
    value;

  if (
    options.trim !==
    false
  ) {
    result =
      result.trim();
  }

  result =
    result.replace(
      CONTROL_CHARACTER_PATTERN,
      "",
    );

  if (
    options.normalize !==
    false
  ) {
    result =
      normalizeWhitespace(
        result,
      );
  }

  if (
    options.stripHtml
  ) {
    result =
      stripHtml(result);
  }

  if (
    options.sanitize
  ) {
    result =
      sanitizeUserText(
        result,
      );
  }

  return result;
}

export function normalizeForm(
  data: FormRecord,
  schema: FormSchema = {},
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    result[key] =
      normalizeFormValue(
        value,
        schema[key] ??
          {},
      );
  }

  return result;
}

// ============================================================
// SPECIAL NORMALIZERS
// ============================================================

export function normalizeFormEmail(
  value:
    | string
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return normalizeEmail(
    value,
  );
}

export function normalizeFormPhone(
  value:
    | string
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return normalizePhone(
    value,
  );
}

export function normalizeFormUsername(
  value:
    | string
    | null
    | undefined,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return normalizeUsername(
    value,
  );
}

// ============================================================
// SANITIZATION
// ============================================================

export function sanitizeFormValue(
  value: FormValue,
): FormValue {
  if (
    isFileValue(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      sanitizeFormValue,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(value)
    ) {
      result[key] =
        sanitizeFormValue(
          item,
        );
    }

    return result;
  }

  if (
    typeof value ===
    "string"
  ) {
    return sanitizeUserText(
      value,
    );
  }

  return value;
}

export function sanitizeForm(
  data: FormRecord,
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    result[key] =
      sanitizeFormValue(
        value,
      );
  }

  return result;
}

// ============================================================
// HTML STRIPPING
// ============================================================

export function stripHtmlFromFormValue(
  value: FormValue,
): FormValue {
  if (
    isFileValue(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      stripHtmlFromFormValue,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(value)
    ) {
      result[key] =
        stripHtmlFromFormValue(
          item,
        );
    }

    return result;
  }

  if (
    typeof value ===
    "string"
  ) {
    return stripHtml(value);
  }

  return value;
}

export function stripHtmlFromForm(
  data: FormRecord,
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    result[key] =
      stripHtmlFromFormValue(
        value,
      );
  }

  return result;
}

// ============================================================
// FIELD VALIDATION
// ============================================================

function resetPatternState(
  pattern: RegExp,
): void {
  if (
    pattern.global ||
    pattern.sticky
  ) {
    pattern.lastIndex = 0;
  }
}

function createFieldError(
  field: string,
  message: string,
  code: string,
  value?: FormValue,
): FormFieldError {
  return {
    field,
    message,
    code,
    value,
  };
}

function validateCustomField(
  field: string,
  value: FormValue,
  data: FormRecord,
  validator:
    | FormFieldValidator
    | undefined,
): FormFieldError | null {
  if (!validator) {
    return null;
  }

  const result =
    validator(
      value,
      data,
    );

  if (
    result === null ||
    result === undefined
  ) {
    return null;
  }

  if (
    typeof result === "string"
  ) {
    return createFieldError(
      field,
      result.slice(
        0,
        DEFAULT_MAX_ERROR_LENGTH,
      ),
      "CUSTOM",
      value,
    );
  }

  return {
    ...result,
    field:
      result.field || field,
    value:
      result.value ??
      value,
  };
}

export function validateFormField(
  field: string,
  value: FormValue,
  options: FormFieldOptions = {},
): FormFieldError | null {
  const normalizedField =
    normalizeFieldName(field);

  const empty =
    isEmptyFormValue(value);

  if (empty) {
    if (
      options.required &&
      !options.allowEmpty
    ) {
      return createFieldError(
        normalizedField,
        `Поле "${normalizedField}" обязательно.`,
        "REQUIRED",
        value,
      );
    }

    return null;
  }

  if (
    !validateFieldType(
      value,
      options.type,
    )
  ) {
    return createFieldError(
      normalizedField,
      `Поле "${normalizedField}" имеет недопустимый тип.`,
      "INVALID_TYPE",
      value,
    );
  }

  if (
    typeof value === "string"
  ) {
    if (
      options.minLength !==
        undefined &&
      value.length <
        options.minLength
    ) {
      return createFieldError(
        normalizedField,
        `Поле "${normalizedField}" должно содержать минимум ${options.minLength} символов.`,
        "MIN_LENGTH",
        value,
      );
    }

    if (
      options.maxLength !==
        undefined &&
      value.length >
        options.maxLength
    ) {
      return createFieldError(
        normalizedField,
        `Поле "${normalizedField}" не должно превышать ${options.maxLength} символов.`,
        "MAX_LENGTH",
        value,
      );
    }

    if (
      options.pattern
    ) {
      resetPatternState(
        options.pattern,
      );

      const matched =
        options.pattern.test(
          value,
        );

      resetPatternState(
        options.pattern,
      );

      if (!matched) {
        return createFieldError(
          normalizedField,
          `Поле "${normalizedField}" имеет неверный формат.`,
          "PATTERN",
          value,
        );
      }
    }
  }

  if (
    typeof value === "number"
  ) {
    if (
      options.min !==
        undefined &&
      value < options.min
    ) {
      return createFieldError(
        normalizedField,
        `Значение "${normalizedField}" не может быть меньше ${options.min}.`,
        "MIN",
        value,
      );
    }

    if (
      options.max !==
        undefined &&
      value > options.max
    ) {
      return createFieldError(
        normalizedField,
        `Значение "${normalizedField}" не может быть больше ${options.max}.`,
        "MAX",
        value,
      );
    }
  }

  return null;
}

// ============================================================
// VALIDATE WHOLE FORM
// ============================================================

export function validateForm(
  data: FormRecord,
  schema: FormSchema,
  options: FormValidationOptions = {},
): FormValidationResult {
  const normalized =
    normalizeForm(
      data,
      schema,
    );

  const errors: FormFieldError[] =
    [];

  for (
    const [
      field,
      fieldOptions,
    ] of Object.entries(
      schema,
    )
  ) {
    const value =
      normalized[field];

    const error =
      validateFormField(
        field,
        value,
        fieldOptions,
      );

    if (error) {
      errors.push(error);

      if (
        options.stopAtFirstError
      ) {
        break;
      }

      continue;
    }

    const customError =
      validateCustomField(
        field,
        value,
        normalized,
        fieldOptions.validate,
      );

    if (customError) {
      errors.push(
        customError,
      );

      if (
        options.stopAtFirstError
      ) {
        break;
      }
    }
  }

  return {
    valid:
      errors.length === 0,
    data:
      errors.length === 0
        ? normalized
        : null,
    errors,
  };
}

// ============================================================
// ERROR HELPERS
// ============================================================

export function hasFormErrors(
  result:
    | FormValidationResult
    | null
    | undefined,
): boolean {
  return Boolean(
    result &&
      result.errors.length >
        0,
  );
}

export function getFirstFormError(
  result:
    | FormValidationResult
    | null
    | undefined,
): FormFieldError | null {
  if (
    !result ||
    result.errors.length === 0
  ) {
    return null;
  }

  return result.errors[0];
}

export function getFormError(
  result:
    | FormValidationResult
    | null
    | undefined,
  field: string,
): FormFieldError | null {
  if (!result) {
    return null;
  }

  const normalized =
    normalizeFieldName(field);

  return (
    result.errors.find(
      (error) =>
        error.field ===
        normalized,
    ) ?? null
  );
}

export function getFormErrors(
  result:
    | FormValidationResult
    | null
    | undefined,
  field?: string,
): FormFieldError[] {
  if (!result) {
    return [];
  }

  if (
    field === undefined
  ) {
    return [...result.errors];
  }

  const normalized =
    normalizeFieldName(field);

  return result.errors.filter(
    (error) =>
      error.field ===
      normalized,
  );
}

export function formErrorsToMap(
  errors: readonly FormFieldError[],
): FormErrorMap {
  const map: FormErrorMap =
    {};

  for (const error of errors) {
    if (!map[error.field]) {
      map[error.field] = [];
    }

    map[error.field].push(
      error.message,
    );
  }

  return map;
}

export function validationResultToErrorMap(
  result:
    | FormValidationResult
    | null
    | undefined,
): FormErrorMap {
  return formErrorsToMap(
    result?.errors ?? [],
  );
}

// ============================================================
// CONTACT FORM
// ============================================================

export function validateContactForm(
  data: FormRecord,
): FormValidationResult {
  const normalized: FormRecord =
    {
      ...data,
    };

  if (
    typeof normalized.email ===
    "string"
  ) {
    normalized.email =
      normalizeEmail(
        normalized.email,
      );
  }

  if (
    typeof normalized.phone ===
    "string"
  ) {
    normalized.phone =
      normalizePhone(
        normalized.phone,
      );
  }

  const schema: FormSchema =
    {
      name: {
        required: true,
        type: "string",
        minLength: 2,
        maxLength: 100,
        sanitize: true,
      },

      email: {
        required: true,
        type: "email",
        maxLength: 254,
        trim: true,
        normalize: false,
      },

      phone: {
        required: false,
        type: "phone",
        maxLength: 30,
        trim: true,
        normalize: false,
      },

      message: {
        required: true,
        type: "string",
        minLength: 2,
        maxLength: 10_000,
        sanitize: true,
      },
    };

  return validateForm(
    normalized,
    schema,
  );
}

// ============================================================
// PROFILE FORM
// ============================================================

export function validateProfileForm(
  data: FormRecord,
): FormValidationResult {
  const normalized: FormRecord =
    {
      ...data,
    };

  if (
    typeof normalized.username ===
    "string"
  ) {
    normalized.username =
      normalizeUsername(
        normalized.username,
      );
  }

  if (
    typeof normalized.email ===
    "string"
  ) {
    normalized.email =
      normalizeEmail(
        normalized.email,
      );
  }

  if (
    typeof normalized.phone ===
    "string"
  ) {
    normalized.phone =
      normalizePhone(
        normalized.phone,
      );
  }

  const schema: FormSchema =
    {
      display_name: {
        required: true,
        type: "string",
        minLength: 2,
        maxLength: 100,
        sanitize: true,
      },

      username: {
        required: false,
        type: "username",
        maxLength: 50,
        trim: true,
        normalize: false,
      },

      email: {
        required: false,
        type: "email",
        maxLength: 254,
        trim: true,
        normalize: false,
      },

      phone: {
        required: false,
        type: "phone",
        maxLength: 30,
        trim: true,
        normalize: false,
      },

      bio: {
        required: false,
        type: "string",
        maxLength: 5_000,
        sanitize: true,
      },

      website: {
        required: false,
        type: "url",
        maxLength: 2_048,
        trim: true,
        normalize: false,
      },
    };

  return validateForm(
    normalized,
    schema,
  );
}

// ============================================================
// PUBLICATION FORM
// ============================================================

export function validatePublicationForm(
  data: FormRecord,
): FormValidationResult {
  const schema: FormSchema =
    {
      title: {
        required: true,
        type: "string",
        minLength: 3,
        maxLength: 300,
        sanitize: true,
      },

      description: {
        required: true,
        type: "string",
        minLength: 10,
        maxLength: 100_000,
        sanitize: true,
      },

      category_id: {
        required: true,
        type: "string",
        maxLength: 100,
        trim: true,
        normalize: false,
      },

      location: {
        required: false,
        type: "string",
        maxLength: 300,
        sanitize: true,
      },

      salary: {
        required: false,
        type: "string",
        maxLength: 300,
        sanitize: true,
      },

      contact_name: {
        required: false,
        type: "string",
        maxLength: 100,
        sanitize: true,
      },

      contact_phone: {
        required: false,
        type: "phone",
        maxLength: 30,
        trim: true,
        normalize: false,
      },

      contact_email: {
        required: false,
        type: "email",
        maxLength: 254,
        trim: true,
        normalize: false,
      },

      external_url: {
        required: false,
        type: "url",
        maxLength: 2_048,
        trim: true,
        normalize: false,
      },
    };

  return validateForm(
    data,
    schema,
  );
}

// ============================================================
// SCHEMA HELPERS
// ============================================================

export function createFormSchema(
  schema: FormSchema,
): FormSchema {
  return {
    ...schema,
  };
}

export function mergeFormSchemas(
  ...schemas: FormSchema[]
): FormSchema {
  const result: FormSchema =
    {};

  for (const schema of schemas) {
    for (
      const [
        field,
        options,
      ] of Object.entries(
        schema,
      )
    ) {
      result[field] = {
        ...(result[field] ??
          {}),
        ...options,
      };
    }
  }

  return result;
}

export function requiredField(
  type:
    | FormFieldOptions["type"],
  options: FormFieldOptions = {},
): FormFieldOptions {
  return {
    ...options,
    required: true,
    type,
  };
}

export function optionalField(
  type:
    | FormFieldOptions["type"],
  options: FormFieldOptions = {},
): FormFieldOptions {
  return {
    ...options,
    required: false,
    type,
  };
}

// ============================================================
// PICK / OMIT
// ============================================================

export function pickFormFields(
  data: FormRecord,
  fields: readonly string[],
): FormRecord {
  const result: FormRecord =
    {};

  for (const field of fields) {
    const normalized =
      normalizeFieldName(
        field,
      );

    if (
      hasProperty(
        data,
        normalized,
      )
    ) {
      result[normalized] =
        getProperty<FormValue>(
          data,
          normalized,
        ) as FormValue;
    }
  }

  return result;
}

export function omitFormFields(
  data: FormRecord,
  fields: readonly string[],
): FormRecord {
  const blocked =
    new Set(
      fields.map(
        normalizeFieldName,
      ),
    );

  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    if (
      !blocked.has(key)
    ) {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================
// FORM DATA SERIALIZATION
// ============================================================

function appendFormDataValue(
  formData: FormData,
  key: string,
  value: FormValue,
): void {
  if (
    value === undefined
  ) {
    return;
  }

  if (
    value === null
  ) {
    formData.append(
      key,
      "",
    );

    return;
  }

  if (
    isFileValue(value)
  ) {
    formData.append(
      key,
      value,
      value.name,
    );

    return;
  }

  if (
    Array.isArray(value)
  ) {
    for (const item of value) {
      appendFormDataValue(
        formData,
        `${key}[]`,
        item,
      );
    }

    return;
  }

  if (
    typeof value === "object"
  ) {
    formData.append(
      key,
      JSON.stringify(value),
    );

    return;
  }

  formData.append(
    key,
    String(value),
  );
}

export function objectToFormData(
  data: FormRecord,
): FormData {
  const formData =
    new FormData();

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    appendFormDataValue(
      formData,
      key,
      value,
    );
  }

  return formData;
}

export function formRecordToFormData(
  data: FormRecord,
): FormData {
  return objectToFormData(
    data,
  );
}

// ============================================================
// FORM FILES
// ============================================================

export function getFormFiles(
  data: FormRecord,
): File[] {
  const files: File[] =
    [];

  for (
    const value of Object.values(
      data,
    )
  ) {
    collectFiles(
      value,
      files,
    );
  }

  return files;
}

function collectFiles(
  value: FormValue,
  files: File[],
): void {
  if (
    isFileValue(value)
  ) {
    files.push(value);
    return;
  }

  if (
    Array.isArray(value)
  ) {
    for (const item of value) {
      collectFiles(
        item,
        files,
      );
    }

    return;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    for (
      const item of Object.values(
        value,
      )
    ) {
      collectFiles(
        item,
        files,
      );
    }
  }
}

export function hasFormFiles(
  data: FormRecord,
): boolean {
  return (
    getFormFiles(
      data,
    ).length > 0
  );
}

export function countFormFiles(
  data: FormRecord,
): number {
  return getFormFiles(
    data,
  ).length;
}

// ============================================================
// EMPTY VALUES
// ============================================================

export function removeEmptyFormFields(
  data: FormRecord,
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    if (
      value === undefined ||
      value === null
    ) {
      continue;
    }

    if (
      typeof value ===
        "string" &&
      value.trim() === ""
    ) {
      continue;
    }

    if (
      Array.isArray(value) &&
      value.length === 0
    ) {
      continue;
    }

    result[key] =
      removeEmptyFormValue(
        value,
      );
  }

  return result;
}

function removeEmptyFormValue(
  value: FormValue,
): FormValue {
  if (
    isFileValue(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .filter(
        (item) =>
          !isEmptyFormValue(
            item,
          ),
      )
      .map(
        removeEmptyFormValue,
      );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        child,
      ] of Object.entries(
        value,
      )
    ) {
      if (
        isEmptyFormValue(
          child,
        )
      ) {
        continue;
      }

      result[key] =
        removeEmptyFormValue(
          child,
        );
    }

    return result;
  }

  return value;
}

export function removeEmptyFormValuesDeep(
  data: FormRecord,
): FormRecord {
  return removeEmptyFormFields(
    data,
  );
}

// ============================================================
// CLONE
// ============================================================

export function cloneFormData(
  data: FormRecord,
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    result[key] =
      cloneFormValue(value);
  }

  return result;
}

function cloneFormValue(
  value: FormValue,
): FormValue {
  if (
    isFileValue(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      cloneFormValue,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(
        value,
      )
    ) {
      result[key] =
        cloneFormValue(
          item,
        );
    }

    return result;
  }

  return value;
}

export function cloneFormValueDeep(
  value: FormValue,
): FormValue {
  return cloneFormValue(
    value,
  );
}

// ============================================================
// DEEP NORMALIZATION
// ============================================================

export function normalizeFormDeep(
  data: FormRecord,
  options: FormFieldOptions = {},
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    result[key] =
      normalizeFormValue(
        value,
        options,
      );
  }

  return result;
}

// ============================================================
// FORM FIELD FLATTENING
// ============================================================

function flattenFormValue(
  value: FormValue,
  prefix: string,
  result: NestedPathResult[],
): void {
  if (
    isFileValue(value)
  ) {
    result.push({
      path: prefix,
      value,
    });

    return;
  }

  if (
    Array.isArray(value)
  ) {
    for (
      let index = 0;
      index < value.length;
      index++
    ) {
      const nextPath =
        prefix
          ? `${prefix}.${index}`
          : String(index);

      flattenFormValue(
        value[index],
        nextPath,
        result,
      );
    }

    return;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const entries =
      Object.entries(value);

    if (
      entries.length === 0
    ) {
      result.push({
        path: prefix,
        value,
      });

      return;
    }

    for (
      const [
        key,
        item,
      ] of entries
    ) {
      const nextPath =
        prefix
          ? `${prefix}.${key}`
          : key;

      flattenFormValue(
        item,
        nextPath,
        result,
      );
    }

    return;
  }

  result.push({
    path: prefix,
    value,
  });
}

export function flattenForm(
  data: FormRecord,
): NestedPathResult[] {
  const result:
    NestedPathResult[] = [];

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    flattenFormValue(
      value,
      key,
      result,
    );
  }

  return result;
}

// ============================================================
// FORM FIELD NAME HELPERS
// ============================================================

export function normalizeFormFieldName(
  field: string,
): string {
  return normalizeFieldName(
    field,
  );
}

export function normalizeFormFields(
  fields: readonly string[],
): string[] {
  const result: string[] =
    [];

  for (const field of fields) {
    const normalized =
      normalizeFieldName(
        field,
      );

    if (
      normalized &&
      !result.includes(
        normalized,
      )
    ) {
      result.push(
        normalized,
      );
    }
  }

  return result;
}

// ============================================================
// TYPE COERCION
// ============================================================

export function coerceFormValue(
  value: FormValue,
): FormValue {
  if (
    isFileValue(value)
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      coerceFormValue,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(
        value,
      )
    ) {
      result[key] =
        coerceFormValue(
          item,
        );
    }

    return result;
  }

  if (
    typeof value === "string"
  ) {
    return convertStringValue(
      value,
    );
  }

  return value;
}

export function coerceForm(
  data: FormRecord,
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(data)
  ) {
    result[key] =
      coerceFormValue(
        value,
      );
  }

  return result;
}

// ============================================================
// SAFE FORM PREPARATION
// ============================================================

export function prepareForm(
  data: FormRecord,
  schema: FormSchema = {},
): FormRecord {
  return removeEmptyFormFields(
    sanitizeForm(
      normalizeForm(
        data,
        schema,
      ),
    ),
  );
}

export function prepareFormForValidation(
  data: FormRecord,
  schema: FormSchema,
): FormRecord {
  return normalizeForm(
    data,
    schema,
  );
}

// ============================================================
// COMMON VALIDATORS
// ============================================================

export function isValidFormEmail(
  value: FormValue,
): boolean {
  return (
    typeof value ===
      "string" &&
    isValidEmail(value)
  );
}

export function isValidFormPhone(
  value: FormValue,
): boolean {
  return (
    typeof value ===
      "string" &&
    isValidPhone(value)
  );
}

export function isValidFormUsername(
  value: FormValue,
): boolean {
  return (
    typeof value ===
      "string" &&
    isValidUsername(value)
  );
}

export function isValidFormUrl(
  value: FormValue,
): boolean {
  return (
    typeof value ===
      "string" &&
    isValidUrl(value)
  );
}

export function isValidFormDate(
  value: FormValue,
): boolean {
  return (
    typeof value ===
      "string" &&
    !Number.isNaN(
      Date.parse(value),
    )
  );
}

// ============================================================
// SCHEMA FIELD LISTS
// ============================================================

export function getRequiredFormFields(
  schema: FormSchema,
): string[] {
  return Object.entries(
    schema,
  )
    .filter(
      ([
        ,
        options,
      ]) =>
        options.required ===
        true,
    )
    .map(
      ([
        field,
      ]) => field,
    );
}

export function getOptionalFormFields(
  schema: FormSchema,
): string[] {
  return Object.entries(
    schema,
  )
    .filter(
      ([
        ,
        options,
      ]) =>
        options.required !==
        true,
    )
    .map(
      ([
        field,
      ]) => field,
    );
}

export function getSchemaFieldType(
  schema: FormSchema,
  field: string,
):
  | FormFieldOptions["type"]
  | undefined {
  return schema[field]?.type;
}

// ============================================================
// SCHEMA CHECKS
// ============================================================

export function hasSchemaField(
  schema: FormSchema,
  field: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    schema,
    field,
  );
}

export function isRequiredSchemaField(
  schema: FormSchema,
  field: string,
): boolean {
  return (
    schema[field]?.required ===
    true
  );
}

// ============================================================
// FORM DATA SIZE HELPERS
// ============================================================

export function getFormDataFieldCount(
  formData: FormData,
): number {
  let count = 0;

  for (
    const _entry of formData.entries()
  ) {
    count++;
  }

  return count;
}

export function getFormDataFileCount(
  formData: FormData,
): number {
  let count = 0;

  for (
    const [
      ,
      value,
    ] of formData.entries()
  ) {
    if (
      isFormDataValue(value)
    ) {
      count++;
    }
  }

  return count;
}

export function getFormDataFiles(
  formData: FormData,
): File[] {
  const files: File[] =
    [];

  for (
    const [
      ,
      value,
    ] of formData.entries()
  ) {
    if (
      isFormDataValue(value)
    ) {
      files.push(value);
    }
  }

  return files;
}

// ============================================================
// FORM DATA CLEANING
// ============================================================

export function cleanFormData(
  formData: FormData,
  options: FormDataParseOptions = {},
): FormRecord {
  const parsed =
    formDataToRecord(
      formData,
      options,
    );

  return removeEmptyFormFields(
    sanitizeForm(
      parsed.data,
    ),
  );
}

// ============================================================
// FIELD PRESENCE
// ============================================================

export function findMissingFormFields(
  data: FormRecord,
  fields: readonly string[],
): string[] {
  const missing: string[] =
    [];

  for (const field of fields) {
    const normalized =
      normalizeFieldName(
        field,
      );

    const value =
      getProperty<FormValue>(
        data,
        normalized,
      );

    if (
      isEmptyFormValue(value)
    ) {
      missing.push(
        normalized,
      );
    }
  }

  return missing;
}

export function hasAllFormFields(
  data: FormRecord,
  fields: readonly string[],
): boolean {
  return (
    findMissingFormFields(
      data,
      fields,
    ).length === 0
  );
}

// ============================================================
// FIELD COPYING
// ============================================================

export function copyFormFields(
  source: FormRecord,
  target: FormRecord,
  fields: readonly string[],
): FormRecord {
  for (const field of fields) {
    const normalized =
      normalizeFieldName(
        field,
      );

    if (
      hasProperty(
        source,
        normalized,
      )
    ) {
      target[normalized] =
        getProperty<FormValue>(
          source,
          normalized,
        ) as FormValue;
    }
  }

  return target;
}

// ============================================================
// FIELD TRANSFORMATION
// ============================================================

export function mapFormFields(
  data: FormRecord,
  callback: (
    value: FormValue,
    field: string,
  ) => FormValue,
): FormRecord {
  const result: FormRecord =
    {};

  for (
    const [
      field,
      value,
    ] of Object.entries(data)
  ) {
    result[field] =
      callback(
        value,
        field,
      );
  }

  return result;
}

// ============================================================
// STRING-ONLY CLEANING
// ============================================================

export function trimFormStrings(
  data: FormRecord,
): FormRecord {
  return mapFormFields(
    data,
    (
      value,
    ) => {
      if (
        typeof value ===
        "string"
      ) {
        return value.trim();
      }

      if (
        Array.isArray(value)
      ) {
        return value.map(
          (item) =>
            typeof item ===
            "string"
              ? item.trim()
              : item,
        );
      }

      return value;
    },
  );
}

export function normalizeFormWhitespace(
  data: FormRecord,
): FormRecord {
  return mapFormFields(
    data,
    (
      value,
    ) => {
      if (
        typeof value ===
        "string"
      ) {
        return normalizeWhitespace(
          value,
        );
      }

      if (
        Array.isArray(value)
      ) {
        return value.map(
          (item) =>
            typeof item ===
            "string"
              ? normalizeWhitespace(
                  item,
                )
              : item,
        );
      }

      return value;
    },
  );
}

// ============================================================
// PUBLIC API HELPERS
// ============================================================

export function validateAndPrepareForm(
  data: FormRecord,
  schema: FormSchema,
): FormValidationResult {
  const prepared =
    prepareForm(
      data,
      schema,
    );

  return validateForm(
    prepared,
    schema,
  );
}

export function validateRequiredForm(
  data: FormRecord,
  fields: readonly string[],
): FormValidationResult {
  const errors =
    requireFormFields(
      data,
      fields,
    );

  return {
    valid:
      errors.length === 0,
    data:
      errors.length === 0
        ? data
        : null,
    errors,
  };
}

// ============================================================
// FORM VALUE SERIALIZATION
// ============================================================

export function formValueToString(
  value: FormValue,
  fallback = "",
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return String(value);
  }

  if (
    isFileValue(value)
  ) {
    return value.name;
  }

  try {
    return JSON.stringify(
      value,
    );
  } catch {
    return fallback;
  }
}

export function serializeForm(
  data: FormRecord,
): string {
  try {
    return JSON.stringify(
      data,
    );
  } catch {
    return "{}";
  }
}

// ============================================================
// FORM VALUE JSON PARSING
// ============================================================

export function parseFormJson(
  value: string,
): FormRecord | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  try {
    const parsed:
      unknown =
      JSON.parse(value);

    if (
      !isPlainObject(parsed)
    ) {
      return null;
    }

    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(
        parsed as Record<
          string,
          unknown
        >,
      )
    ) {
      result[key] =
        normalizeUnknownFormValue(
          item,
        );
    }

    return result;
  } catch {
    return null;
  }
}

function normalizeUnknownFormValue(
  value: unknown,
): FormValue {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      normalizeUnknownFormValue,
    );
  }

  if (
    typeof value ===
    "object"
  ) {
    const result: FormRecord =
      {};

    for (
      const [
        key,
        item,
      ] of Object.entries(
        value as Record<
          string,
          unknown
        >,
      )
    ) {
      result[key] =
        normalizeUnknownFormValue(
          item,
        );
    }

    return result;
  }

  return String(value);
}

// ============================================================
// FINAL SAFETY HELPERS
// ============================================================

export function assertFormRecord(
  value: unknown,
): FormRecord {
  if (
    !isPlainObject(value)
  ) {
    throw new Error(
      "Expected a form record.",
    );
  }

  const result: FormRecord =
    {};

  for (
    const [
      key,
      item,
    ] of Object.entries(
      value as Record<
        string,
        unknown
      >,
    )
  ) {
    result[key] =
      normalizeUnknownFormValue(
        item,
      );
  }

  return result;
}

export function isFormRecord(
  value: unknown,
): value is FormRecord {
  return (
    isPlainObject(value)
  );
}

export function isFormValue(
  value: unknown,
): value is FormValue {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return true;
  }

  if (
    typeof File !==
      "undefined" &&
    value instanceof File
  ) {
    return true;
  }

  if (
    Array.isArray(value)
  ) {
    return value.every(
      isFormValue,
    );
  }

  if (
    typeof value ===
    "object"
  ) {
    return Object.values(
      value,
    ).every(
      isFormValue,
    );
  }

  return false;
}

// ============================================================
// END OF FILE
// ============================================================
