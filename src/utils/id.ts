// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// ID / TOKEN UTILITIES
// Version: 2026.09
// ============================================================

/**
 * Безопасная генерация идентификаторов.
 *
 * Используется для:
 * - visitor_id
 * - session_id
 * - request_id
 * - conversation_id
 * - message_id
 * - publication_id
 * - comment_id
 * - notification_id
 * - activity_id
 * - admin session ID
 * - других внутренних идентификаторов.
 *
 * Не используем Math.random() для security-sensitive ID.
 */

// ============================================================
// RANDOM BYTES
// ============================================================

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  crypto.getRandomValues(bytes);

  return bytes;
}

// ============================================================
// HEX
// ============================================================

export function randomHex(length = 16): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Invalid random hex length");
  }

  const bytes = randomBytes(length);

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

// ============================================================
// BASE64URL
// ============================================================

export function randomBase64Url(
  byteLength = 32
): string {
  if (
    !Number.isInteger(byteLength) ||
    byteLength <= 0
  ) {
    throw new Error("Invalid random byte length");
  }

  const bytes = randomBytes(byteLength);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// ============================================================
// UUID
// ============================================================

export function uuid(): string {
  return crypto.randomUUID();
}

// ============================================================
// SHORT ID
// ============================================================

export function shortId(length = 16): string {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const bytes = randomBytes(length);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += alphabet[
      bytes[i] % alphabet.length
    ];
  }

  return result;
}

// ============================================================
// PUBLIC ID
// ============================================================

export function publicId(
  prefix = "to"
): string {
  const cleanPrefix = prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  return `${cleanPrefix}_${shortId(20)}`;
}

// ============================================================
// VISITOR ID
// ============================================================

export function createVisitorId(): string {
  return `visitor_${randomBase64Url(32)}`;
}

// ============================================================
// SESSION ID
// ============================================================

export function createSessionId(): string {
  return `session_${randomBase64Url(48)}`;
}

// ============================================================
// ADMIN SESSION ID
// ============================================================

export function createAdminSessionId(): string {
  return `admin_${randomBase64Url(48)}`;
}

// ============================================================
// REQUEST ID
// ============================================================

export function createRequestId(): string {
  return `req_${randomBase64Url(24)}`;
}

// ============================================================
// ENTITY IDS
// ============================================================

export function createPublicationId(): string {
  return publicId("pub");
}

export function createCommentId(): string {
  return publicId("comment");
}

export function createConversationId(): string {
  return publicId("conversation");
}

export function createMessageId(): string {
  return publicId("message");
}

export function createNotificationId(): string {
  return publicId("notification");
}

export function createReportId(): string {
  return publicId("report");
}

export function createReactionId(): string {
  return publicId("reaction");
}

export function createBookmarkId(): string {
  return publicId("bookmark");
}

export function createShareId(): string {
  return publicId("share");
}

export function createProfileId(): string {
  return publicId("profile");
}

export function createActivityId(): string {
  return publicId("activity");
}

export function createEventId(): string {
  return publicId("event");
}

export function createAdminActivityId(): string {
  return publicId("admin_activity");
}

// ============================================================
// TOKEN
// ============================================================

export function createToken(
  byteLength = 32
): string {
  return randomBase64Url(byteLength);
}

// ============================================================
// CSRF TOKEN
// ============================================================

export function createCsrfToken(): string {
  return randomBase64Url(32);
}

// ============================================================
// VERIFICATION TOKEN
// ============================================================

export function createVerificationToken(): string {
  return randomBase64Url(32);
}

// ============================================================
// PASSWORD RESET TOKEN
// ============================================================

export function createPasswordResetToken(): string {
  return randomBase64Url(48);
}

// ============================================================
// INVITATION TOKEN
// ============================================================

export function createInvitationToken(): string {
  return randomBase64Url(32);
}

// ============================================================
// API KEY
// ============================================================

export function createApiKey(): string {
  return `to_live_${randomBase64Url(32)}`;
}

// ============================================================
// IDEMPOTENCY KEY
// ============================================================

export function createIdempotencyKey(): string {
  return `idem_${randomBase64Url(24)}`;
}

// ============================================================
// HASH HELPERS
// ============================================================

export async function sha256(
  value: string
): Promise<string> {
  const encoder = new TextEncoder();

  const data = encoder.encode(value);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const bytes = new Uint8Array(digest);

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export async function sha256Base64Url(
  value: string
): Promise<string> {
  const encoder = new TextEncoder();

  const data = encoder.encode(value);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const bytes = new Uint8Array(digest);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// ============================================================
// ID VALIDATION
// ============================================================

export function isValidId(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (value.length < 3 || value.length > 256) {
    return false;
  }

  return /^[a-zA-Z0-9_-]+$/.test(value);
}

export function isValidUuid(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

// ============================================================
// SAFE ID NORMALIZATION
// ============================================================

export function normalizeId(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (!isValidId(normalized)) {
    return null;
  }

  return normalized;
}

// ============================================================
// TIMESTAMP ID
// ============================================================

export function timestampId(
  prefix = "to"
): string {
  const timestamp = Date.now()
    .toString(36)
    .toLowerCase();

  return `${prefix}_${timestamp}_${shortId(12)}`;
}

// ============================================================
// SAFE COMPARISON
// ============================================================

export function safeEqual(
  a: string,
  b: string
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================================
// END
// ============================================================
