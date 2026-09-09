import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  CONTENT_LIMITS,
  FILE_LIMITS,
} from "../constants/app";

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "document"
  | "unknown";

export interface FileValidationResult {
  valid: boolean;
  kind: FileKind;
  error?: string;
  size: number;
  mimeType: string;
  extension: string;
}

export interface FileMetadata {
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  kind: FileKind;
}

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
];

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a",
];

const VOICE_TYPES = [
  "audio/ogg",
  "audio/opus",
  "audio/webm",
];

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",

  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  ogv: "video/ogg",

  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  opus: "audio/opus",
  weba: "audio/webm",
  m4a: "audio/mp4",
  aac: "audio/aac",
  flac: "audio/flac",

  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",

  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
};

function getExtension(name: string): string {
  const clean = name.split("?")[0].split("#")[0];
  const parts = clean.toLowerCase().split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts.pop() ?? "";
}

function normalizeMimeType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(";")[0];
}

function fileNameSafe(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

function getLimit(
  source: unknown,
  fallback: number
): number {
  return typeof source === "number" && source > 0
    ? source
    : fallback;
}

function getImageLimit(): number {
  const limits = FILE_LIMITS as Record<string, unknown>;

  return getLimit(
    limits["IMAGE_MAX_SIZE"] ??
      limits["MAX_IMAGE_SIZE"] ??
      limits["MAX_IMAGE_BYTES"] ??
      limits["image"],
    10 * 1024 * 1024
  );
}

function getVideoLimit(): number {
  const limits = FILE_LIMITS as Record<string, unknown>;

  return getLimit(
    limits["VIDEO_MAX_SIZE"] ??
      limits["MAX_VIDEO_SIZE"] ??
      limits["MAX_VIDEO_BYTES"] ??
      limits["video"],
    100 * 1024 * 1024
  );
}

function getAudioLimit(): number {
  const limits = FILE_LIMITS as Record<string, unknown>;

  return getLimit(
    limits["AUDIO_MAX_SIZE"] ??
      limits["MAX_AUDIO_SIZE"] ??
      limits["MAX_AUDIO_BYTES"] ??
      limits["audio"],
    50 * 1024 * 1024
  );
}

function getDocumentLimit(): number {
  const limits = FILE_LIMITS as Record<string, unknown>;

  return getLimit(
    limits["DOCUMENT_MAX_SIZE"] ??
      limits["MAX_DOCUMENT_SIZE"] ??
      limits["MAX_DOCUMENT_BYTES"] ??
      limits["document"],
    50 * 1024 * 1024
  );
}

function allowedDocumentTypes(): readonly string[] {
  return Array.isArray(ALLOWED_DOCUMENT_TYPES)
    ? ALLOWED_DOCUMENT_TYPES.map(String).map(normalizeMimeType)
    : [];
}

function allowedImageTypes(): readonly string[] {
  return Array.isArray(ALLOWED_IMAGE_TYPES)
    ? ALLOWED_IMAGE_TYPES.map(String).map(normalizeMimeType)
    : [];
}

export function detectFileKind(
  mimeType: string,
  extension = ""
): FileKind {

  const mime = normalizeMimeType(mimeType);
  const ext = extension.toLowerCase().replace(/^\./, "");

  if (
    mime.startsWith("image/") ||
    allowedImageTypes().includes(mime)
  ) {
    return "image";
  }

  if (
    mime.startsWith("video/") ||
    VIDEO_TYPES.includes(mime)
  ) {
    return "video";
  }

  if (
    mime.startsWith("audio/") ||
    AUDIO_TYPES.includes(mime)
  ) {
    if (VOICE_TYPES.includes(mime)) {
      return "voice";
    }

    return "audio";
  }

  if (
    allowedDocumentTypes().includes(mime) ||
    Boolean(EXTENSION_TO_MIME[ext])
  ) {
    if (
      mime.startsWith("application/") ||
      mime.startsWith("text/")
    ) {
      return "document";
    }
  }

  return "unknown";
}

export function extensionFromMime(
  mimeType: string
): string {

  const mime = normalizeMimeType(mimeType);

  const entry = Object.entries(EXTENSION_TO_MIME)
    .find(([, value]) => value === mime);

  return entry?.[0] ?? "";
}

export function mimeFromExtension(
  extension: string
): string {

  const ext = extension
    .toLowerCase()
    .replace(/^\./, "");

  return EXTENSION_TO_MIME[ext] ?? "application/octet-stream";
}

export function isAllowedMimeType(
  mimeType: string,
  kind?: FileKind
): boolean {

  const mime = normalizeMimeType(mimeType);

  const detected = kind ?? detectFileKind(mime);

  if (detected === "image") {
    return (
      mime.startsWith("image/") ||
      allowedImageTypes().includes(mime)
    );
  }

  if (detected === "video") {
    return (
      mime.startsWith("video/") ||
      VIDEO_TYPES.includes(mime)
    );
  }

  if (
    detected === "audio" ||
    detected === "voice"
  ) {
    return (
      mime.startsWith("audio/") ||
      AUDIO_TYPES.includes(mime)
    );
  }

  if (detected === "document") {
    return (
      allowedDocumentTypes().includes(mime) ||
      mime.startsWith("application/") ||
      mime.startsWith("text/")
    );
  }

  return false;
}

export function getMaximumFileSize(
  kind: FileKind
): number {

  switch (kind) {
    case "image":
      return getImageLimit();

    case "video":
      return getVideoLimit();

    case "audio":
    case "voice":
      return getAudioLimit();

    case "document":
      return getDocumentLimit();

    default:
      return getDocumentLimit();
  }
}

export function validateFile(
  file: File
): FileValidationResult {

  const originalName = file.name || "file";
  const extension = getExtension(originalName);
  const mimeType = normalizeMimeType(
    file.type || mimeFromExtension(extension)
  );

  const kind = detectFileKind(
    mimeType,
    extension
  );

  const size = file.size;

  if (!size || size <= 0) {
    return {
      valid: false,
      kind,
      error: "Файл пустой или имеет некорректный размер.",
      size,
      mimeType,
      extension,
    };
  }

  if (kind === "unknown") {
    return {
      valid: false,
      kind,
      error: "Тип файла не поддерживается.",
      size,
      mimeType,
      extension,
    };
  }

  if (!isAllowedMimeType(mimeType, kind)) {
    return {
      valid: false,
      kind,
      error: "Этот тип файла запрещён.",
      size,
      mimeType,
      extension,
    };
  }

  const maximum = getMaximumFileSize(kind);

  if (size > maximum) {
    return {
      valid: false,
      kind,
      error: `Файл слишком большой. Максимальный размер: ${formatBytes(maximum)}.`,
      size,
      mimeType,
      extension,
    };
  }

  return {
    valid: true,
    kind,
    size,
    mimeType,
    extension,
  };
}

export function assertValidFile(
  file: File
): FileValidationResult {

  const result = validateFile(file);

  if (!result.valid) {
    throw new Error(
      result.error ?? "Недопустимый файл."
    );
  }

  return result;
}

export function createFileMetadata(
  file: File
): FileMetadata {

  const validation = assertValidFile(file);

  const originalName = fileNameSafe(
    file.name || "file"
  );

  return {
    name: originalName,
    originalName,
    mimeType: validation.mimeType,
    extension: validation.extension,
    size: validation.size,
    kind: validation.kind,
  };
}

export function formatBytes(
  bytes: number,
  decimals = 2
): string {

  if (!Number.isFinite(bytes) || bytes <= 0) {
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
    Math.floor(
      Math.log(bytes) / Math.log(1024)
    ),
    units.length - 1
  );

  const value =
    bytes / Math.pow(1024, index);

  return `${value.toFixed(
    Math.max(0, decimals)
  )} ${units[index]}`;
}

export function sanitizeFileName(
  name: string
): string {

  const safe = fileNameSafe(name);

  if (safe.length > 0) {
    return safe;
  }

  return "file";
}

export function generateStorageName(
  file: File,
  prefix = "uploads"
): string {

  const extension =
    getExtension(file.name) ||
    extensionFromMime(file.type);

  const timestamp =
    Date.now().toString(36);

  const random =
    crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 20);

  const safePrefix =
    prefix
      .replace(/[^a-zA-Z0-9/_-]/g, "")
      .replace(/^\/+|\/+$/g, "");

  const suffix = extension
    ? `.${extension}`
    : "";

  return `${safePrefix}/${timestamp}-${random}${suffix}`;
}

export function getContentDisposition(
  fileName: string,
  disposition: "inline" | "attachment" = "inline"
): string {

  const safe = sanitizeFileName(fileName);

  return `${disposition}; filename="${safe}"`;
}

export function isImage(
  file: File | FileValidationResult
): boolean {

  const kind =
    "kind" in file
      ? file.kind
      : detectFileKind(file.type);

  return kind === "image";
}

export function isVideo(
  file: File | FileValidationResult
): boolean {

  const kind =
    "kind" in file
      ? file.kind
      : detectFileKind(file.type);

  return kind === "video";
}

export function isAudio(
  file: File | FileValidationResult
): boolean {

  const kind =
    "kind" in file
      ? file.kind
      : detectFileKind(file.type);

  return (
    kind === "audio" ||
    kind === "voice"
  );
}

export function isDocument(
  file: File | FileValidationResult
): boolean {

  const kind =
    "kind" in file
      ? file.kind
      : detectFileKind(file.type);

  return kind === "document";
}

export function isVoice(
  file: File | FileValidationResult
): boolean {

  const kind =
    "kind" in file
      ? file.kind
      : detectFileKind(file.type);

  return kind === "voice";
}

export function isSupportedFile(
  file: File
): boolean {

  return validateFile(file).valid;
}

export function getUploadCategory(
  file: File
): "media" | "document" | "unknown" {

  const kind =
    detectFileKind(
      file.type,
      getExtension(file.name)
    );

  if (
    kind === "image" ||
    kind === "video" ||
    kind === "audio" ||
    kind === "voice"
  ) {
    return "media";
  }

  if (kind === "document") {
    return "document";
  }

  return "unknown";
}

export function validateFileCollection(
  files: readonly File[],
  maximumCount = 20
): {
  valid: boolean;
  files: FileValidationResult[];
  errors: string[];
} {

  const errors: string[] = [];

  if (files.length > maximumCount) {
    errors.push(
      `Можно загрузить максимум ${maximumCount} файлов.`
    );
  }

  const results = files.map(validateFile);

  for (const result of results) {
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    valid:
      errors.length === 0 &&
      files.length <= maximumCount,
    files: results,
    errors,
  };
}


// ============================================================
// CONTENT LIMIT HELPERS
// ============================================================

export function getPublicationMediaLimit(): number {
  const limits = CONTENT_LIMITS as Record<string, unknown>;

  return getLimit(
    limits["MAX_PUBLICATION_MEDIA"] ??
      limits["PUBLICATION_MEDIA_MAX"] ??
      limits["MAX_MEDIA_PER_PUBLICATION"],
    20
  );
}

export function getChatAttachmentLimit(): number {
  const limits = CONTENT_LIMITS as Record<string, unknown>;

  return getLimit(
    limits["MAX_CHAT_ATTACHMENTS"] ??
      limits["CHAT_ATTACHMENTS_MAX"],
    20
  );
}


// ============================================================
// MAGIC BYTE VALIDATION
// ============================================================

export function detectMagicType(
  bytes: Uint8Array
): string | null {

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46
  ) {
    return "image/gif";
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46
  ) {
    return "image/webp";
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  ) {
    return "application/zip";
  }

  return null;
}


// ============================================================
// END
// ============================================================
