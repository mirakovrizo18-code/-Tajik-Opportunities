import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  FILE_LIMITS,
} from "../constants/app";

import {
  getMimeDefinition,
  normalizeMimeType,
  validateFileName,
  validateFileMime,
  isDangerousMimeType,
  getMimeCategory,
  type MimeCategory,
} from "./mime";

export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  categories?: readonly MimeCategory[];
  requireKnownMime?: boolean;
  rejectDangerous?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileName: string;
  mimeType: string;
  extension: string;
  size: number;
  category: MimeCategory | "unknown";
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  category: MimeCategory | "unknown";
  lastModified?: number;
}

export interface FileUploadLimits {
  maxFileSize: number;
  maxImageSize: number;
  maxDocumentSize: number;
  maxTotalSize: number;
  maxFiles: number;
}

export const DEFAULT_FILE_UPLOAD_LIMITS: FileUploadLimits = {
  maxFileSize:
    Number(FILE_LIMITS.MAX_FILE_SIZE ?? 25 * 1024 * 1024),

  maxImageSize:
    Number(FILE_LIMITS.MAX_IMAGE_SIZE ?? 10 * 1024 * 1024),

  maxDocumentSize:
    Number(FILE_LIMITS.MAX_DOCUMENT_SIZE ?? 25 * 1024 * 1024),

  maxTotalSize:
    Number(FILE_LIMITS.MAX_TOTAL_SIZE ?? 50 * 1024 * 1024),

  maxFiles:
    Number(FILE_LIMITS.MAX_FILES ?? 10),
};

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
] as const;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
] as const;

export const ARCHIVE_MIME_TYPES = [
  "application/zip",
  "application/x-7z-compressed",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-tar",
] as const;

function safeNumber(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function getExtension(fileName: string): string {
  const clean = fileName.split(/[\\/]/).pop() ?? "";
  const index = clean.lastIndexOf(".");

  if (index <= 0 || index === clean.length - 1) {
    return "";
  }

  return clean.slice(index + 1).toLowerCase();
}

function getFileName(file: File): string {
  return typeof file.name === "string"
    ? file.name.trim()
    : "";
}

function getFileType(file: File): string {
  return normalizeMimeType(file.type || "");
}

export function getFileInfo(file: File): FileInfo {
  const name = getFileName(file);
  const type = getFileType(file);
  const extension = getExtension(name);
  const definition = getMimeDefinition(type);

  return {
    name,
    size: safeNumber(file.size),
    type,
    extension,
    category: definition?.category ?? "unknown",
    lastModified:
      typeof file.lastModified === "number"
        ? file.lastModified
        : undefined,
  };
}

export function formatFileSize(
  bytes: number,
  decimals = 2,
): string {
  const size = safeNumber(bytes);

  if (size === 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB",
  ];

  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );

  const value = size / Math.pow(1024, index);

  return `${value.toFixed(
    index === 0 ? 0 : decimals,
  )} ${units[index]}`;
}

export function isFileLike(
  value: unknown,
): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).name === "string" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).type === "string"
  );
}

export function isImageFile(file: File): boolean {
  const type = getFileType(file);

  return (
    type.startsWith("image/") &&
    !isDangerousMimeType(type)
  );
}

export function isDocumentFile(file: File): boolean {
  const type = getFileType(file);

  return DOCUMENT_MIME_TYPES.includes(
    type as (typeof DOCUMENT_MIME_TYPES)[number],
  );
}

export function isArchiveFile(file: File): boolean {
  const type = getFileType(file);

  return ARCHIVE_MIME_TYPES.includes(
    type as (typeof ARCHIVE_MIME_TYPES)[number],
  );
}

export function getFileCategory(
  file: File,
): MimeCategory | "unknown" {
  const type = getFileType(file);

  return getMimeCategory(type) ?? "unknown";
}

export function isAllowedImageFile(
  file: File,
): boolean {
  const type = getFileType(file);

  return (
    (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type) ||
    IMAGE_MIME_TYPES.includes(
      type as (typeof IMAGE_MIME_TYPES)[number],
    )
  );
}

export function isAllowedDocumentFile(
  file: File,
): boolean {
  const type = getFileType(file);

  return (
    (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(type) ||
    DOCUMENT_MIME_TYPES.includes(
      type as (typeof DOCUMENT_MIME_TYPES)[number],
    )
  );
}

export function getDefaultMaxSize(
  file: File,
): number {
  if (isImageFile(file)) {
    return DEFAULT_FILE_UPLOAD_LIMITS.maxImageSize;
  }

  if (isDocumentFile(file)) {
    return DEFAULT_FILE_UPLOAD_LIMITS.maxDocumentSize;
  }

  return DEFAULT_FILE_UPLOAD_LIMITS.maxFileSize;
}

export function validateUploadedFile(
  file: File,
  options: FileValidationOptions = {},
): FileValidationResult {
  const name = getFileName(file);
  const type = getFileType(file);
  const size = safeNumber(file.size);
  const extension = getExtension(name);
  const category = getFileCategory(file);

  const errors: string[] = [];
  const warnings: string[] = [];

  const maxSize =
    options.maxSize ??
    getDefaultMaxSize(file);

  if (!name) {
    errors.push("Имя файла отсутствует.");
  } else {
    const nameResult = validateFileName(name);

    if (!nameResult.valid) {
      errors.push(
        ...(nameResult.errors ?? [
          "Недопустимое имя файла.",
        ]),
      );
    }
  }

  if (size <= 0) {
    errors.push("Файл пустой.");
  }

  if (size > maxSize) {
    errors.push(
      `Размер файла превышает допустимый предел ${formatFileSize(
        maxSize,
      )}.`,
    );
  }

  if (size > DEFAULT_FILE_UPLOAD_LIMITS.maxFileSize) {
    errors.push(
      `Размер файла превышает общий предел ${formatFileSize(
        DEFAULT_FILE_UPLOAD_LIMITS.maxFileSize,
      )}.`,
    );
  }

  if (!type) {
    if (options.requireKnownMime !== false) {
      errors.push("Не удалось определить MIME-тип файла.");
    } else {
      warnings.push(
        "MIME-тип файла не указан.",
      );
    }
  }

  if (
    options.rejectDangerous !== false &&
    type &&
    isDangerousMimeType(type)
  ) {
    errors.push(
      "Этот тип файла запрещён по соображениям безопасности.",
    );
  }

  if (
    options.allowedMimeTypes &&
    type &&
    !options.allowedMimeTypes
      .map(normalizeMimeType)
      .includes(type)
  ) {
    errors.push(
      "MIME-тип файла не входит в список разрешённых.",
    );
  }

  if (
    options.allowedExtensions &&
    extension &&
    !options.allowedExtensions
      .map((item) =>
        item
          .toLowerCase()
          .replace(/^\./, ""),
      )
      .includes(extension)
  ) {
    errors.push(
      "Расширение файла не входит в список разрешённых.",
    );
  }

  if (
    options.categories &&
    category !== "unknown" &&
    !options.categories.includes(category)
  ) {
    errors.push(
      "Категория файла не разрешена.",
    );
  }

  if (
    options.requireKnownMime !== false &&
    type &&
    extension
  ) {
    const mimeValidation = validateFileMime(
      name,
      type,
    );

    if (!mimeValidation.valid) {
      errors.push(
        ...(mimeValidation.errors ?? [
          "MIME-тип и расширение файла не совпадают.",
        ]),
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fileName: name,
    mimeType: type,
    extension,
    size,
    category,
  };
}

export function validateImageUpload(
  file: File,
): FileValidationResult {
  return validateUploadedFile(file, {
    maxSize:
      DEFAULT_FILE_UPLOAD_LIMITS.maxImageSize,
    allowedMimeTypes:
      Array.from(IMAGE_MIME_TYPES),
    categories: ["image"],
    requireKnownMime: true,
    rejectDangerous: true,
  });
}

export function validateDocumentUpload(
  file: File,
): FileValidationResult {
  return validateUploadedFile(file, {
    maxSize:
      DEFAULT_FILE_UPLOAD_LIMITS.maxDocumentSize,
    allowedMimeTypes:
      Array.from(DOCUMENT_MIME_TYPES),
    categories: ["document", "text"],
    requireKnownMime: true,
    rejectDangerous: true,
  });
}

export function validateFileList(
  files: readonly File[],
  options: FileValidationOptions = {},
  limits: FileUploadLimits =
    DEFAULT_FILE_UPLOAD_LIMITS,
): {
  valid: boolean;
  errors: string[];
  files: FileValidationResult[];
  totalSize: number;
} {
  const errors: string[] = [];

  if (files.length > limits.maxFiles) {
    errors.push(
      `Можно загрузить не более ${limits.maxFiles} файлов.`,
    );
  }

  let totalSize = 0;

  const results = files.map((file) => {
    totalSize += safeNumber(file.size);

    return validateUploadedFile(
      file,
      options,
    );
  });

  if (totalSize > limits.maxTotalSize) {
    errors.push(
      `Общий размер файлов превышает допустимый предел ${formatFileSize(
        limits.maxTotalSize,
      )}.`,
    );
  }

  for (const result of results) {
    if (!result.valid) {
      errors.push(
        `${result.fileName || "Файл"}: ${result.errors.join(
          " ",
        )}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    files: results,
    totalSize,
  };
}

export function sanitizeUploadedFileName(
  fileName: string,
): string {
  let name = String(fileName ?? "");

  name = name
    .replace(/[\\/]/g, "_")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\.\./g, "_")
    .replace(/[<>:"|?*]/g, "_")
    .trim();

  if (!name) {
    return "file";
  }

  const extension = getExtension(name);
  const base = extension
    ? name.slice(
        0,
        -(extension.length + 1),
      )
    : name;

  const safeBase = base
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_\-.]+|[_\-.]+$/g, "");

  const safeExtension = extension
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

  if (!safeBase) {
    return safeExtension
      ? `file.${safeExtension}`
      : "file";
  }

  return safeExtension
    ? `${safeBase}.${safeExtension}`
    : safeBase;
}

export function getSafeStorageFileName(
  file: File,
  generatedId: string,
): string {
  const extension = getExtension(
    getFileName(file),
  );

  const safeId = String(generatedId)
    .replace(/[^a-zA-Z0-9_-]/g, "");

  if (!safeId) {
    throw new Error(
      "Invalid generated file identifier.",
    );
  }

  return extension
    ? `${safeId}.${extension}`
    : safeId;
}

export function getFileExtension(
  fileName: string,
): string {
  return getExtension(fileName);
}

export function hasExtension(
  fileName: string,
): boolean {
  return Boolean(getExtension(fileName));
}

export function extensionEquals(
  fileName: string,
  extension: string,
): boolean {
  const actual = getExtension(fileName);
  const expected = extension
    .toLowerCase()
    .replace(/^\./, "");

  return actual === expected;
}

export function mimeEquals(
  file: File,
  mimeType: string,
): boolean {
  return (
    getFileType(file) ===
    normalizeMimeType(mimeType)
  );
}

export function isWithinSizeLimit(
  file: File,
  maxSize: number,
): boolean {
  return (
    safeNumber(file.size) <=
    safeNumber(maxSize)
  );
}

export function calculateTotalFileSize(
  files: readonly File[],
): number {
  return files.reduce(
    (total, file) =>
      total + safeNumber(file.size),
    0,
  );
}

export function countFilesByCategory(
  files: readonly File[],
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const file of files) {
    const category = getFileCategory(file);

    result[category] =
      (result[category] ?? 0) + 1;
  }

  return result;
}

export function findDuplicateFileNames(
  files: readonly File[],
): string[] {
  const counts = new Map<string, number>();

  for (const file of files) {
    const name = getFileName(file).toLowerCase();

    counts.set(
      name,
      (counts.get(name) ?? 0) + 1,
    );
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
}

export function isProbablySafeUpload(
  file: File,
): boolean {
  const result = validateUploadedFile(file, {
    requireKnownMime: true,
    rejectDangerous: true,
  });

  return result.valid;
}

export function getUploadSummary(
  files: readonly File[],
): {
  count: number;
  totalSize: number;
  totalSizeFormatted: string;
  categories: Record<string, number>;
  valid: boolean;
} {
  const validation = validateFileList(
    files,
  );

  return {
    count: files.length,
    totalSize: validation.totalSize,
    totalSizeFormatted:
      formatFileSize(validation.totalSize),
    categories:
      countFilesByCategory(files),
    valid: validation.valid,
  };
}
