export interface MimeDefinition {
  mime: string;
  extensions: string[];
  category: MimeCategory;
  description: string;
  compressible: boolean;
  safeForPublic: boolean;
}

export type MimeCategory =
  | "image"
  | "document"
  | "text"
  | "audio"
  | "video"
  | "archive"
  | "font"
  | "application"
  | "unknown";

const MIME_DEFINITIONS: MimeDefinition[] = [
  {
    mime: "image/jpeg",
    extensions: ["jpg", "jpeg", "jpe"],
    category: "image",
    description: "JPEG image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "image/png",
    extensions: ["png"],
    category: "image",
    description: "PNG image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "image/gif",
    extensions: ["gif"],
    category: "image",
    description: "GIF image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "image/webp",
    extensions: ["webp"],
    category: "image",
    description: "WebP image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "image/avif",
    extensions: ["avif"],
    category: "image",
    description: "AVIF image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "image/svg+xml",
    extensions: ["svg"],
    category: "image",
    description: "SVG image",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "image/bmp",
    extensions: ["bmp"],
    category: "image",
    description: "Bitmap image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "image/x-icon",
    extensions: ["ico"],
    category: "image",
    description: "Icon image",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/pdf",
    extensions: ["pdf"],
    category: "document",
    description: "PDF document",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "text/plain",
    extensions: ["txt"],
    category: "text",
    description: "Plain text",
    compressible: true,
    safeForPublic: true,
  },
  {
    mime: "text/csv",
    extensions: ["csv"],
    category: "text",
    description: "CSV document",
    compressible: true,
    safeForPublic: true,
  },
  {
    mime: "text/html",
    extensions: ["html", "htm"],
    category: "text",
    description: "HTML document",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "text/css",
    extensions: ["css"],
    category: "text",
    description: "CSS stylesheet",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "text/javascript",
    extensions: ["js", "mjs"],
    category: "application",
    description: "JavaScript",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "application/javascript",
    extensions: ["js"],
    category: "application",
    description: "JavaScript",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "application/json",
    extensions: ["json"],
    category: "application",
    description: "JSON document",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "application/xml",
    extensions: ["xml"],
    category: "application",
    description: "XML document",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "text/xml",
    extensions: ["xml"],
    category: "text",
    description: "XML document",
    compressible: true,
    safeForPublic: false,
  },
  {
    mime: "application/zip",
    extensions: ["zip"],
    category: "archive",
    description: "ZIP archive",
    compressible: false,
    safeForPublic: false,
  },
  {
    mime: "application/gzip",
    extensions: ["gz"],
    category: "archive",
    description: "GZIP archive",
    compressible: false,
    safeForPublic: false,
  },
  {
    mime: "application/x-7z-compressed",
    extensions: ["7z"],
    category: "archive",
    description: "7-Zip archive",
    compressible: false,
    safeForPublic: false,
  },
  {
    mime: "application/x-rar-compressed",
    extensions: ["rar"],
    category: "archive",
    description: "RAR archive",
    compressible: false,
    safeForPublic: false,
  },
  {
    mime: "application/msword",
    extensions: ["doc"],
    category: "document",
    description: "Microsoft Word document",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
    category: "document",
    description: "Word Open XML document",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/vnd.ms-excel",
    extensions: ["xls"],
    category: "document",
    description: "Microsoft Excel spreadsheet",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
    category: "document",
    description: "Excel Open XML spreadsheet",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/vnd.ms-powerpoint",
    extensions: ["ppt"],
    category: "document",
    description: "Microsoft PowerPoint presentation",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extensions: ["pptx"],
    category: "document",
    description: "PowerPoint Open XML presentation",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "application/rtf",
    extensions: ["rtf"],
    category: "document",
    description: "Rich Text Format document",
    compressible: true,
    safeForPublic: true,
  },
  {
    mime: "application/epub+zip",
    extensions: ["epub"],
    category: "document",
    description: "EPUB ebook",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "audio/mpeg",
    extensions: ["mp3"],
    category: "audio",
    description: "MP3 audio",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "audio/wav",
    extensions: ["wav"],
    category: "audio",
    description: "WAV audio",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "audio/ogg",
    extensions: ["ogg"],
    category: "audio",
    description: "OGG audio",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "audio/webm",
    extensions: ["weba", "webm"],
    category: "audio",
    description: "WebM audio",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "audio/mp4",
    extensions: ["m4a"],
    category: "audio",
    description: "MPEG-4 audio",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "video/mp4",
    extensions: ["mp4"],
    category: "video",
    description: "MPEG-4 video",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "video/webm",
    extensions: ["webm"],
    category: "video",
    description: "WebM video",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "video/ogg",
    extensions: ["ogv"],
    category: "video",
    description: "OGG video",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "video/mpeg",
    extensions: ["mpeg", "mpg"],
    category: "video",
    description: "MPEG video",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "font/woff",
    extensions: ["woff"],
    category: "font",
    description: "WOFF font",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "font/woff2",
    extensions: ["woff2"],
    category: "font",
    description: "WOFF2 font",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "font/ttf",
    extensions: ["ttf"],
    category: "font",
    description: "TrueType font",
    compressible: false,
    safeForPublic: true,
  },
  {
    mime: "font/otf",
    extensions: ["otf"],
    category: "font",
    description: "OpenType font",
    compressible: false,
    safeForPublic: true,
  },
];

const MIME_BY_TYPE = new Map(
  MIME_DEFINITIONS.map((item) => [
    item.mime.toLowerCase(),
    item,
  ])
);

const MIME_BY_EXTENSION = new Map<
  string,
  MimeDefinition
>();

for (const definition of MIME_DEFINITIONS) {
  for (const extension of definition.extensions) {
    MIME_BY_EXTENSION.set(
      extension.toLowerCase(),
      definition
    );
  }
}

const EXECUTABLE_EXTENSIONS = new Set([
  "exe",
  "dll",
  "com",
  "bat",
  "cmd",
  "msi",
  "scr",
  "ps1",
  "sh",
  "bash",
  "bin",
  "app",
  "apk",
  "jar",
  "class",
  "wasm",
]);

const DANGEROUS_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-sh",
  "application/x-shellscript",
  "application/x-bat",
  "application/vnd.android.package-archive",
  "application/java-archive",
  "application/x-httpd-php",
]);

export function normalizeMimeType(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .split(";")[0]
    .trim();

  if (!normalized || !normalized.includes("/")) {
    return null;
  }

  return normalized;
}

export function getMimeDefinition(
  mime: unknown
): MimeDefinition | null {
  const normalized = normalizeMimeType(mime);

  if (!normalized) {
    return null;
  }

  return MIME_BY_TYPE.get(normalized) ?? null;
}

export function getMimeByExtension(
  extension: string
): MimeDefinition | null {
  const normalized = extension
    .trim()
    .toLowerCase()
    .replace(/^\./, "");

  return MIME_BY_EXTENSION.get(normalized) ?? null;
}

export function getMimeType(
  filename: string
): string | null {
  const extension =
    getExtension(filename);

  if (!extension) {
    return null;
  }

  return (
    getMimeByExtension(extension)?.mime ??
    null
  );
}

export function getExtension(
  filename: string
): string | null {
  const clean = filename
    .split(/[?#]/)[0]
    .replace(/\\/g, "/");

  const base =
    clean.split("/").pop() ?? "";

  const index = base.lastIndexOf(".");

  if (
    index <= 0 ||
    index === base.length - 1
  ) {
    return null;
  }

  return base
    .slice(index + 1)
    .toLowerCase();
}

export function isMimeType(
  value: unknown,
  mime: string
): boolean {
  const first = normalizeMimeType(value);
  const second = normalizeMimeType(mime);

  return (
    first !== null &&
    second !== null &&
    first === second
  );
}

export function isMimeCategory(
  mime: string,
  category: MimeCategory
): boolean {
  return (
    getMimeDefinition(mime)?.category ===
    category
  );
}

export function isImageMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "image");
}

export function isDocumentMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "document");
}

export function isAudioMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "audio");
}

export function isVideoMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "video");
}

export function isArchiveMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "archive");
}

export function isTextMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "text");
}

export function isFontMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "font");
}

export function isApplicationMime(
  mime: string
): boolean {
  return isMimeCategory(mime, "application");
}

export function isDangerousMime(
  mime: string
): boolean {
  const normalized = normalizeMimeType(mime);

  if (!normalized) {
    return true;
  }

  return DANGEROUS_MIME_TYPES.has(normalized);
}

export function isExecutableExtension(
  filenameOrExtension: string
): boolean {
  const extension =
    filenameOrExtension.includes(".")
      ? getExtension(filenameOrExtension)
      : filenameOrExtension
          .trim()
          .toLowerCase()
          .replace(/^\./, "");

  return (
    extension !== null &&
    EXECUTABLE_EXTENSIONS.has(extension)
  );
}

export function isSafeMimeType(
  mime: string
): boolean {
  if (isDangerousMime(mime)) {
    return false;
  }

  const definition =
    getMimeDefinition(mime);

  return definition?.safeForPublic ?? false;
}

export function isSafeFilename(
  filename: string
): boolean {
  if (
    typeof filename !== "string" ||
    !filename.trim()
  ) {
    return false;
  }

  const normalized = filename
    .trim()
    .replace(/\\/g, "/");

  const basename =
    normalized.split("/").pop() ?? "";

  if (!basename) {
    return false;
  }

  if (
    basename === "." ||
    basename === ".."
  ) {
    return false;
  }

  if (
    basename.includes("\0") ||
    basename.includes("\r") ||
    basename.includes("\n")
  ) {
    return false;
  }

  if (
    /[<>:"/\\|?*]/.test(basename)
  ) {
    return false;
  }

  if (
    isExecutableExtension(basename)
  ) {
    return false;
  }

  return true;
}

export function validateFileType(
  filename: string,
  mime: string
): boolean {
  if (!isSafeFilename(filename)) {
    return false;
  }

  const normalizedMime =
    normalizeMimeType(mime);

  if (!normalizedMime) {
    return false;
  }

  if (isDangerousMime(normalizedMime)) {
    return false;
  }

  const extension =
    getExtension(filename);

  if (!extension) {
    return false;
  }

  const definition =
    getMimeDefinition(normalizedMime);

  if (!definition) {
    return false;
  }

  return definition.extensions.includes(
    extension
  );
}

export function getContentDisposition(
  filename: string,
  disposition: "inline" | "attachment" = "inline"
): string {
  const safe = sanitizeFilename(filename);

  const encoded = encodeURIComponent(safe)
    .replace(/['()]/g, escape);

  return `${disposition}; filename="${safe}"; filename*=UTF-8''${encoded}`;
}

export function sanitizeFilename(
  filename: string,
  fallback = "file"
): string {
  if (
    typeof filename !== "string" ||
    !filename.trim()
  ) {
    return fallback;
  }

  let result = filename
    .trim()
    .replace(/\\/g, "_")
    .replace(/[\/:*?"<>|]/g, "_")
    .replace(/[\r\n\0]/g, "_")
    .replace(/\s+/g, " ");

  result = result.replace(
    /^\.+$/,
    "_"
  );

  if (
    !result ||
    result === "." ||
    result === ".."
  ) {
    return fallback;
  }

  if (isExecutableExtension(result)) {
    return fallback;
  }

  return result.slice(0, 255);
}

export function extensionMatchesMime(
  extension: string,
  mime: string
): boolean {
  const definition =
    getMimeByExtension(extension);

  const normalized =
    normalizeMimeType(mime);

  return (
    definition !== null &&
    normalized !== null &&
    definition.mime === normalized
  );
}

export function getExtensionsForMime(
  mime: string
): string[] {
  return [
    ...(getMimeDefinition(mime)
      ?.extensions ?? []),
  ];
}

export function getMimesForExtension(
  extension: string
): string[] {
  const definition =
    getMimeByExtension(extension);

  return definition
    ? [definition.mime]
    : [];
}

export function isAllowedExtension(
  filename: string,
  allowedExtensions: readonly string[]
): boolean {
  const extension =
    getExtension(filename);

  if (!extension) {
    return false;
  }

  const allowed = new Set(
    allowedExtensions.map((item) =>
      item
        .trim()
        .toLowerCase()
        .replace(/^\./, "")
    )
  );

  return allowed.has(extension);
}

export function isAllowedMime(
  mime: string,
  allowedMimes: readonly string[]
): boolean {
  const normalized =
    normalizeMimeType(mime);

  if (!normalized) {
    return false;
  }

  const allowed = new Set(
    allowedMimes
      .map(normalizeMimeType)
      .filter(
        (item): item is string =>
          item !== null
      )
  );

  return allowed.has(normalized);
}

export function isAllowedFile(
  filename: string,
  mime: string,
  allowedExtensions: readonly string[],
  allowedMimes: readonly string[]
): boolean {
  if (!isSafeFilename(filename)) {
    return false;
  }

  if (
    isExecutableExtension(filename) ||
    isDangerousMime(mime)
  ) {
    return false;
  }

  return (
    isAllowedExtension(
      filename,
      allowedExtensions
    ) &&
    isAllowedMime(
      mime,
      allowedMimes
    ) &&
    extensionMatchesMime(
      getExtension(filename) ?? "",
      mime
    )
  );
}

export function inferMimeFromHeaders(
  contentType: string | null
): string | null {
  if (!contentType) {
    return null;
  }

  return normalizeMimeType(contentType);
}

export function isMultipart(
  contentType: string | null
): boolean {
  return (
    typeof contentType === "string" &&
    contentType
      .toLowerCase()
      .startsWith("multipart/form-data")
  );
}

export function isJsonMime(
  contentType: string | null
): boolean {
  const normalized =
    normalizeMimeType(contentType);

  return normalized === "application/json";
}

export function isFormMime(
  contentType: string | null
): boolean {
  const normalized =
    normalizeMimeType(contentType);

  return (
    normalized ===
      "application/x-www-form-urlencoded" ||
    isMultipart(contentType)
  );
}

export function getMimeCategory(
  mime: string
): MimeCategory {
  return (
    getMimeDefinition(mime)?.category ??
    "unknown"
  );
}

export function getMimeDescription(
  mime: string
): string {
  return (
    getMimeDefinition(mime)?.description ??
    "Unknown file type"
  );
}

export function isCompressibleMime(
  mime: string
): boolean {
  return (
    getMimeDefinition(mime)
      ?.compressible ?? false
  );
}

export function isPublicSafeMime(
  mime: string
): boolean {
  return (
    getMimeDefinition(mime)
      ?.safeForPublic ?? false
  );
}

export function listMimeDefinitions(): MimeDefinition[] {
  return MIME_DEFINITIONS.map(
    (definition) => ({
      ...definition,
      extensions: [
        ...definition.extensions,
      ],
    })
  );
}

export function listMimeTypes(): string[] {
  return MIME_DEFINITIONS.map(
    (definition) => definition.mime
  );
}

export function listExtensions(): string[] {
  return Array.from(
    MIME_BY_EXTENSION.keys()
  ).sort();
}

export function detectMimeFromFilename(
  filename: string,
  fallback = "application/octet-stream"
): string {
  return (
    getMimeType(filename) ??
    fallback
  );
}

export function normalizeFilename(
  filename: string
): string {
  return sanitizeFilename(filename);
}

export function isOctetStream(
  mime: string
): boolean {
  return (
    normalizeMimeType(mime) ===
    "application/octet-stream"
  );
}

export function isUnknownMime(
  mime: string
): boolean {
  return (
    getMimeDefinition(mime) === null
  );
}

export function getMimeCharset(
  mime: string
): string | null {
  const category =
    getMimeCategory(mime);

  if (
    category === "text" ||
    normalizeMimeType(mime) ===
      "application/json" ||
    normalizeMimeType(mime) ===
      "application/javascript" ||
    normalizeMimeType(mime) ===
      "application/xml"
  ) {
    return "UTF-8";
  }

  return null;
    }
