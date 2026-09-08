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
  validateRequiredFields,
} from "./validation";

export type FormPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type FormValue =
  | FormPrimitive
  | File
  | FormValue[]
  | {
      [key: string]: FormValue;
    };

export type FormRecord = Record<
  string,
  FormValue
>;

export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidationResult<T = FormRecord> {
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
}

export interface FormSchema {
  [field: string]: FormFieldOptions;
}

export interface FormDataParseOptions {
  maxFields?: number;
  maxFiles?: number;
  maxFieldLength?: number;
  includeEmpty?: boolean;
}

export interface ParsedFormData {
  data: FormRecord;
  files: File[];
  fields: string[];
}

const DEFAULT_PARSE_OPTIONS: Required<FormDataParseOptions> = {
  maxFields: 200,
  maxFiles: 20,
  maxFieldLength: 100_000,
  includeEmpty: false,
};

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

function normalizeKey(
  key: string,
): string {
  return String(key)
    .trim()
    .replace(/\[\]$/, "");
}

function convertStringValue(
  value: string,
): FormPrimitive {
  const trimmed = value.trim();

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
    const number = Number(trimmed);

    if (Number.isSafeInteger(number)) {
      return number;
    }
  }

  if (
    /^-?\d+\.\d+$/.test(trimmed) &&
    trimmed.length < 16
  ) {
    const number = Number(trimmed);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return value;
}

export function formDataToRecord(
  formData: FormData,
  options: FormDataParseOptions = {},
): ParsedFormData {
  const config = {
    ...DEFAULT_PARSE_OPTIONS,
    ...options,
  };

  const data: FormRecord = {};
  const files: File[] = [];
  const fields: string[] = [];

  let fieldCount = 0;

  for (const [rawKey, rawValue] of formData.entries()) {
    if (fieldCount >= config.maxFields) {
      throw new Error(
        "Form contains too many fields.",
      );
    }

    const key = normalizeKey(rawKey);

    if (!key) {
      continue;
    }

    if (isFormDataValue(rawValue)) {
      if (
        rawValue.size === 0 &&
        !config.includeEmpty
      ) {
        continue;
      }

      if (files.length >= config.maxFiles) {
        throw new Error(
          "Form contains too many files.",
        );
      }

      files.push(rawValue);

      addFormValue(
        data,
        key,
        rawValue,
      );

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

    addFormValue(
      data,
      key,
      rawValue,
    );

    if (!fields.includes(key)) {
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

function addFormValue(
  target: FormRecord,
  key: string,
  value: FormValue,
): void {
  if (!hasProperty(target, key)) {
    target[key] = value;
    return;
  }

  const existing = target[key];

  if (Array.isArray(existing)) {
    existing.push(value);
    return;
  }

  target[key] = [
    existing,
    value,
  ];
}

export function getFormValue<T = FormValue>(
  data: FormRecord | FormData,
  field: string,
  fallback?: T,
): T | undefined {
  if (data instanceof FormData) {
    const value = data.get(field);

    if (value === null) {
      return fallback;
    }

    return value as T;
  }

  const value = data[field];

  return (
    value === undefined
      ? fallback
      : (value as T)
  );
}

export function getFormValues(
  data: FormRecord | FormData,
  field: string,
): FormValue[] {
  if (data instanceof FormData) {
    return data
      .getAll(field)
      .map((value) => value as FormValue);
  }

  const value = data[field];

  if (value === undefined) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}

export function hasFormField(
  data: FormRecord | FormData,
  field: string,
): boolean {
  if (data instanceof FormData) {
    return data.has(field);
  }

  return hasProperty(data, field);
}

export function requireFormFields(
  data: FormRecord,
  fields: readonly string[],
): FormFieldError[] {
  const missing = validateRequiredFields(
    data,
    fields,
  );

  return missing.map((field) => ({
    field,
    message: `Поле "${field}" обязательно.`,
    code: "REQUIRED",
  }));
}

function validateFieldType(
  value: FormValue,
  type: FormFieldOptions["type"],
): boolean {
  if (type === undefined) {
    return true;
  }

  switch (type) {
    case "string":
      return (
        typeof value === "string"
      );

    case "number":
      return (
        typeof value === "number" &&
        Number.isFinite(value)
      );

    case "integer":
      return (
        typeof value === "number" &&
        Number.isSafeInteger(value)
      );

    case "boolean":
      return typeof value === "boolean";

    case "email":
      return (
        typeof value === "string" &&
        isValidEmail(value)
      );

    case "phone":
      return (
        typeof value === "string" &&
        isValidPhone(value)
      );

    case "username":
      return (
        typeof value === "string" &&
        isValidUsername(value)
      );

    case "url":
      return (
        typeof value === "string" &&
        isValidUrl(value)
      );

    case "date":
      if (
        typeof value !== "string"
      ) {
        return false;
      }

      return (
        !Number.isNaN(
          Date.parse(value),
        )
      );

    case "file":
      return isFileValue(value);

    case "array":
      return Array.isArray(value);

    case "object":
      return isPlainObject(value);

    default:
      return true;
  }
}

export function normalizeFormValue(
  value: FormValue,
  options: FormFieldOptions = {},
): FormValue {
  if (isFileValue(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
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
    const result: FormRecord = {};

    for (const [key, item] of Object.entries(
      value,
    )) {
      result[key] =
        normalizeFormValue(
          item,
          options,
        );
    }

    return result;
  }

  if (
    typeof value !== "string"
  ) {
    return value;
  }

  let result = value;

  if (
    options.trim !== false
  ) {
    result = result.trim();
  }

  if (
    options.normalize !== false
  ) {
    result =
      normalizeWhitespace(result);
  }

  if (options.sanitize) {
    result =
      sanitizeUserText(result);
  }

  return result;
}

export function normalizeForm(
  data: FormRecord,
  schema: FormSchema = {},
): FormRecord {
  const result: FormRecord = {};

  for (const [key, value] of Object.entries(
    data,
  )) {
    result[key] =
      normalizeFormValue(
        value,
        schema[key] ?? {},
      );
  }

  return result;
}

export function sanitizeForm(
  data: FormRecord,
): FormRecord {
  const result: FormRecord = {};

  for (const [key, value] of Object.entries(
    data,
  )) {
    if (isFileValue(value)) {
      result[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      result[key] = value.map(
        (item) => {
          if (
            typeof item ===
            "string"
          ) {
            return sanitizeUserText(
              item,
            );
          }

          return item;
        },
      );

      continue;
    }

    if (
      typeof value ===
      "string"
    ) {
      result[key] =
        sanitizeUserText(value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function stripHtmlFromForm(
  data: FormRecord,
): FormRecord {
  const result: FormRecord = {};

  for (const [key, value] of Object.entries(
    data,
  )) {
    if (
      typeof value === "string"
    ) {
      result[key] =
        stripHtml(value);
    } else if (
      Array.isArray(value)
    ) {
      result[key] =
        value.map((item) =>
          typeof item === "string"
            ? stripHtml(item)
            : item,
        );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function validateFormField(
  field: string,
  value: FormValue,
  options: FormFieldOptions = {},
): FormFieldError | null {
  const empty =
    value === undefined ||
    value === null ||
    (
      typeof value === "string" &&
      value.trim() === ""
    );

  if (empty) {
    if (
      options.required &&
      !options.allowEmpty
    ) {
      return {
        field,
        message: `Поле "${field}" обязательно.`,
        code: "REQUIRED",
      };
    }

    return null;
  }

  if (
    !validateFieldType(
      value,
      options.type,
    )
  ) {
    return {
      field,
      message: `Поле "${field}" имеет недопустимый тип.`,
      code: "INVALID_TYPE",
    };
  }

  if (
    typeof value === "string"
  ) {
    if (
      options.minLength !== undefined &&
      value.length <
        options.minLength
    ) {
      return {
        field,
        message: `Поле "${field}" должно содержать минимум ${options.minLength} символов.`,
        code: "MIN_LENGTH",
      };
    }

    if (
      options.maxLength !== undefined &&
      value.length >
        options.maxLength
    ) {
      return {
        field,
        message: `Поле "${field}" не должно превышать ${options.maxLength} символов.`,
        code: "MAX_LENGTH",
      };
    }

    if (
      options.pattern &&
      !options.pattern.test(value)
    ) {
      return {
        field,
        message: `Поле "${field}" имеет неверный формат.`,
        code: "PATTERN",
      };
    }
  }

  if (
    typeof value === "number"
  ) {
    if (
      options.min !== undefined &&
      value < options.min
    ) {
      return {
        field,
        message: `Значение "${field}" не может быть меньше ${options.min}.`,
        code: "MIN",
      };
    }

    if (
      options.max !== undefined &&
      value > options.max
    ) {
      return {
        field,
        message: `Значение "${field}" не может быть больше ${options.max}.`,
        code: "MAX",
      };
    }
  }

  return null;
}

export function validateForm(
  data: FormRecord,
  schema: FormSchema,
): FormValidationResult {
  const normalized =
    normalizeForm(
      data,
      schema,
    );

  const errors: FormFieldError[] = [];

  for (const [
    field,
    options,
  ] of Object.entries(schema)) {
    const value =
      normalized[field];

    const error =
      validateFormField(
        field,
        value,
        options,
      );

    if (error) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    data:
      errors.length === 0
        ? normalized
        : null,
    errors,
  };
}

export function validateContactForm(
  data: FormRecord,
): FormValidationResult {
  const normalized = {
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

  const schema: FormSchema = {
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

export function validateProfileForm(
  data: FormRecord,
): FormValidationResult {
  const normalized = {
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

  const schema: FormSchema = {
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

export function validatePublicationForm(
  data: FormRecord,
): FormValidationResult {
  const schema: FormSchema = {
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

export function pickFormFields(
  data: FormRecord,
  fields: readonly string[],
): FormRecord {
  const result: FormRecord = {};

  for (const field of fields) {
    if (hasProperty(data, field)) {
      result[field] =
        getProperty<FormValue>(
          data,
          field,
        ) as FormValue;
    }
  }

  return result;
}

export function omitFormFields(
  data: FormRecord,
  fields: readonly string[],
): FormRecord {
  const blocked = new Set(fields);
  const result: FormRecord = {};

  for (const [key, value] of Object.entries(
    data,
  )) {
    if (!blocked.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

export function formToObject(
  formData: FormData,
): FormRecord {
  return formDataToRecord(
    formData,
  ).data;
}

export function objectToFormData(
  data: FormRecord,
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(
    data,
  )) {
    appendFormDataValue(
      formData,
      key,
      value,
    );
  }

  return formData;
}

function appendFormDataValue(
  formData: FormData,
  key: string,
  value: FormValue,
): void {
  if (value === undefined) {
    return;
  }

  if (value === null) {
    formData.append(key, "");
    return;
  }

  if (isFileValue(value)) {
    formData.append(
      key,
      value,
      value.name,
    );
    return;
  }

  if (Array.isArray(value)) {
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

export function getFormFiles(
  data: FormRecord,
): File[] {
  const files: File[] = [];

  for (const value of Object.values(
    data,
  )) {
    collectFiles(value, files);
  }

  return files;
}

function collectFiles(
  value: FormValue,
  files: File[],
): void {
  if (isFileValue(value)) {
    files.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectFiles(item, files);
    }
    return;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    for (const item of Object.values(
      value,
    )) {
      collectFiles(item, files);
    }
  }
}

export function removeEmptyFormFields(
  data: FormRecord,
): FormRecord {
  const result: FormRecord = {};

  for (const [key, value] of Object.entries(
    data,
  )) {
    if (
      value === undefined ||
      value === null
    ) {
      continue;
    }

    if (
      typeof value === "string" &&
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

    result[key] = value;
  }

  return result;
}

export function cloneFormData(
  data: FormRecord,
): FormRecord {
  const result: FormRecord = {};

  for (const [key, value] of Object.entries(
    data,
  )) {
    if (isFileValue(value)) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] =
        value.map((item) =>
          cloneFormValue(item),
        );
    } else if (
      value !== null &&
      typeof value === "object"
    ) {
      result[key] =
        cloneFormValue(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function cloneFormValue(
  value: FormValue,
): FormValue {
  if (isFileValue(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      cloneFormValue,
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: FormRecord = {};

    for (const [key, item] of Object.entries(
      value,
    )) {
      result[key] =
        cloneFormValue(item);
    }

    return result;
  }

  return value;
  }
