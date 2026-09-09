```ts
// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// SECURITY UTILITIES
// Version: 2026.09
// ============================================================

import {
  createCsrfToken,
  createToken,
  randomBase64Url,
  safeEqual,
  sha256,
} from "./id";

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

export interface PasswordHash {
  algorithm: string;
  salt: string;
  hash: string;
  iterations: number;
}

export interface RequestAdminContext {
  authenticated: boolean;
  adminId: string | null;
  token: string | null;
}

const DEFAULT_HASH_ITERATIONS = 120_000;
const MIN_TOKEN_LENGTH = 16;
const MAX_TOKEN_LENGTH = 512;

/**
 * Безопасная случайная строка.
 */
export function secureRandom(length = 32): string {
  if (!Number.isInteger(length) || length <= 0 || length > 1024) {
    throw new Error("Invalid secure random length");
  }

  return randomBase64Url(length);
}

/**
 * Создает CSRF-токен.
 */
export function generateCsrfToken(): string {
  return createCsrfToken();
}

/**
 * Создает security token.
 */
export function generateSecurityToken(
  byteLength = 32
): string {
  return createToken(byteLength);
}

/**
 * Проверяет token.
 */
export function isValidToken(
  token: unknown,
  minLength = MIN_TOKEN_LENGTH,
  maxLength = MAX_TOKEN_LENGTH
): token is string {
  if (typeof token !== "string") {
    return false;
  }

  if (
    token.length < minLength ||
    token.length > maxLength
  ) {
    return false;
  }

  return /^[A-Za-z0-9_-]+$/.test(token);
}

/**
 * Безопасное сравнение токенов.
 */
export function compareTokens(
  a: unknown,
  b: unknown
): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  return safeEqual(a, b);
}

/**
 * Проверка CSRF.
 */
export function validateCsrfToken(
  provided: unknown,
  expected: unknown
): SecurityCheckResult {
  if (
    typeof provided !== "string" ||
    typeof expected !== "string"
  ) {
    return {
      allowed: false,
      reason: "CSRF token is missing",
      code: "CSRF_MISSING",
    };
  }

  if (!isValidToken(provided) || !isValidToken(expected)) {
    return {
      allowed: false,
      reason: "Invalid CSRF token",
      code: "CSRF_INVALID",
    };
  }

  if (!safeEqual(provided, expected)) {
    return {
      allowed: false,
      reason: "CSRF token mismatch",
      code: "CSRF_MISMATCH",
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Хэширует строку SHA-256.
 */
export async function hash(value: string): Promise<string> {
  return await sha256(value);
}

/**
 * Хэширует значение с контекстом.
 */
export async function hashWithContext(
  value: string,
  context: string
): Promise<string> {
  return await sha256(`${context}:${value}`);
}

/**
 * Создает fingerprint IP/User-Agent.
 */
export async function createClientFingerprint(
  ip: string,
  userAgent: string
): Promise<string> {
  return await sha256(
    `${ip.trim()}|${userAgent.trim()}`
  );
}

/**
 * Создает fingerprint с дополнительным salt.
 */
export async function createFingerprint(
  value: string,
  salt: string
): Promise<string> {
  return await sha256(`${salt}:${value}`);
}

/**
 * Проверяет безопасный Origin.
 */
export function isAllowedOrigin(
  origin: string | null,
  allowedOrigins: readonly string[]
): boolean {
  if (!origin) {
    return false;
  }

  const normalized = origin.trim().replace(/\/+$/, "");

  return allowedOrigins.some(
    (allowed) =>
      allowed.trim().replace(/\/+$/, "") === normalized
  );
}

/**
 * Проверяет Origin и Referer.
 */
export function validateRequestOrigin(
  request: Request,
  allowedOrigins: readonly string[]
): SecurityCheckResult {
  const origin = request.headers.get("Origin");

  if (origin) {
    if (!isAllowedOrigin(origin, allowedOrigins)) {
      return {
        allowed: false,
        reason: "Origin is not allowed",
        code: "ORIGIN_NOT_ALLOWED",
      };
    }

    return {
      allowed: true,
    };
  }

  const referer = request.headers.get("Referer");

  if (!referer) {
    return {
      allowed: true,
    };
  }

  try {
    const refererOrigin = new URL(referer).origin;

    if (
      isAllowedOrigin(
        refererOrigin,
        allowedOrigins
      )
    ) {
      return {
        allowed: true,
      };
    }
  } catch {
    return {
      allowed: false,
      reason: "Invalid Referer",
      code: "INVALID_REFERER",
    };
  }

  return {
    allowed: false,
    reason: "Referer is not allowed",
    code: "REFERER_NOT_ALLOWED",
  };
}

/**
 * Проверяет метод для state-changing операций.
 */
export function requiresCsrf(
  method: string
): boolean {
  const normalized = method.toUpperCase();

  return (
    normalized === "POST" ||
    normalized === "PUT" ||
    normalized === "PATCH" ||
    normalized === "DELETE"
  );
}

/**
 * Проверяет подозрительные HTTP-заголовки.
 */
export function detectHeaderInjection(
  request: Request
): SecurityCheckResult {
  const headers = [
    request.headers.get("User-Agent"),
    request.headers.get("Referer"),
    request.headers.get("Origin"),
    request.headers.get("X-Forwarded-For"),
  ];

  for (const value of headers) {
    if (value && /[\r\n]/.test(value)) {
      return {
        allowed: false,
        reason: "Header injection detected",
        code: "HEADER_INJECTION",
      };
    }
  }

  return {
    allowed: true,
  };
}

/**
 * Проверяет User-Agent.
 */
export function validateUserAgent(
  userAgent: string | null
): SecurityCheckResult {
  if (!userAgent) {
    return {
      allowed: true,
    };
  }

  if (userAgent.length > 2048) {
    return {
      allowed: false,
      reason: "User-Agent is too long",
      code: "USER_AGENT_TOO_LONG",
    };
  }

  if (/[\r\n\0]/.test(userAgent)) {
    return {
      allowed: false,
      reason: "Invalid User-Agent",
      code: "INVALID_USER_AGENT",
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Простейшее обнаружение очевидных bot/scanner signatures.
 */
export function detectSuspiciousUserAgent(
  userAgent: string | null
): SecurityCheckResult {
  if (!userAgent) {
    return {
      allowed: true,
    };
  }

  const ua = userAgent.toLocaleLowerCase();

  const suspiciousPatterns = [
    "sqlmap",
    "nikto",
    "nmap",
    "masscan",
    "nessus",
    "acunetix",
    "wpscan",
    "dirbuster",
    "gobuster",
    "zgrab",
    "nuclei",
  ];

  for (const pattern of suspiciousPatterns) {
    if (ua.includes(pattern)) {
      return {
        allowed: false,
        reason: "Suspicious client detected",
        code: "SUSPICIOUS_CLIENT",
      };
    }
  }

  return {
    allowed: true,
  };
}

/**
 * Проверяет размер request body.
 */
export function validateContentLength(
  request: Request,
  maxBytes: number
): SecurityCheckResult {
  const raw = request.headers.get("Content-Length");

  if (!raw) {
    return {
      allowed: true,
    };
  }

  const length = Number(raw);

  if (
    !Number.isSafeInteger(length) ||
    length < 0
  ) {
    return {
      allowed: false,
      reason: "Invalid Content-Length",
      code: "INVALID_CONTENT_LENGTH",
    };
  }

  if (length > maxBytes) {
    return {
      allowed: false,
      reason: "Request body is too large",
      code: "BODY_TOO_LARGE",
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Проверяет Content-Type.
 */
export function validateContentType(
  request: Request,
  allowedTypes: readonly string[]
): SecurityCheckResult {
  const contentType =
    request.headers.get("Content-Type");

  if (!contentType) {
    return {
      allowed: true,
    };
  }

  const normalized = contentType
    .split(";")[0]
    .trim()
    .toLocaleLowerCase();

  if (
    allowedTypes
      .map((type) => type.toLocaleLowerCase())
      .includes(normalized)
  ) {
    return {
      allowed: true,
    };
  }

  return {
    allowed: false,
    reason: "Content-Type is not allowed",
    code: "CONTENT_TYPE_NOT_ALLOWED",
  };
}

/**
 * Простая in-memory rate limiter.
 */
const rateLimitStore = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  if (
    !Number.isFinite(limit) ||
    limit <= 0 ||
    !Number.isFinite(windowMs) ||
    windowMs <= 0
  ) {
    throw new Error("Invalid rate limit configuration");
  }

  const normalizedKey = key.trim();

  if (!normalizedKey) {
    throw new Error("Rate limit key is required");
  }

  const current = rateLimitStore.get(normalizedKey);

  if (!current || now >= current.resetAt) {
    rateLimitStore.set(normalizedKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      limit,
      retryAfterSeconds: 0,
    };
  }

  current.count += 1;

  const allowed = current.count <= limit;
  const remaining = Math.max(
    0,
    limit - current.count
  );

  const retryAfterSeconds = allowed
    ? 0
    : Math.max(
        1,
        Math.ceil(
          (current.resetAt - now) / 1000
        )
      );

  return {
    allowed,
    remaining,
    limit,
    retryAfterSeconds,
  };
}

/**
 * Удаляет старые rate-limit записи.
 */
export function cleanupRateLimitStore(
  now = Date.now()
): void {
  for (const [key, value] of rateLimitStore) {
    if (now >= value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Полностью очищает локальное rate-limit состояние.
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Создает ключ rate limit.
 */
export function createRateLimitKey(
  scope: string,
  identifier: string
): string {
  return `${scope.trim()}:${identifier.trim()}`;
}

/**
 * Создает несколько ключей для защиты endpoint.
 */
export async function createRateLimitFingerprint(
  scope: string,
  ip: string,
  userAgent?: string
): Promise<string> {
  const source = [
    scope.trim(),
    ip.trim(),
    userAgent?.trim() ?? "",
  ].join("|");

  return await sha256(source);
}

/**
 * Проверяет пароль по минимальным требованиям.
 */
export function validatePasswordStrength(
  password: unknown
): SecurityCheckResult {
  if (typeof password !== "string") {
    return {
      allowed: false,
      reason: "Password must be a string",
      code: "INVALID_PASSWORD",
    };
  }

  if (password.length < 12) {
    return {
      allowed: false,
      reason: "Password must contain at least 12 characters",
      code: "PASSWORD_TOO_SHORT",
    };
  }

  if (password.length > 256) {
    return {
      allowed: false,
      reason: "Password is too long",
      code: "PASSWORD_TOO_LONG",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      allowed: false,
      reason: "Password must contain a lowercase letter",
      code: "PASSWORD_NO_LOWERCASE",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      allowed: false,
      reason: "Password must contain an uppercase letter",
      code: "PASSWORD_NO_UPPERCASE",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      allowed: false,
      reason: "Password must contain a number",
      code: "PASSWORD_NO_NUMBER",
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      allowed: false,
      reason: "Password must contain a special character",
      code: "PASSWORD_NO_SPECIAL",
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Создает PBKDF2 password hash.
 */
export async function hashPassword(
  password: string,
  iterations = DEFAULT_HASH_ITERATIONS
): Promise<PasswordHash> {
  const validation =
    validatePasswordStrength(password);

  if (!validation.allowed) {
    throw new Error(
      validation.reason ?? "Weak password"
    );
  }

  if (
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 1_000_000
  ) {
    throw new Error("Invalid PBKDF2 iterations");
  }

  const salt = randomBase64Url(32);

  const encoder = new TextEncoder();

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

  const bytes = new Uint8Array(derivedBits);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const hashValue = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return {
    algorithm: "PBKDF2-SHA256",
    salt,
    hash: hashValue,
    iterations,
  };
}

/**
 * Проверяет пароль против сохраненного hash.
 */
export async function verifyPassword(
  password: string,
  stored: PasswordHash
): Promise<boolean> {
  if (
    !password ||
    !stored ||
    stored.algorithm !== "PBKDF2-SHA256"
  ) {
    return false;
  }

  const encoder = new TextEncoder();

  try {
    const keyMaterial =
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );

    const derivedBits =
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: encoder.encode(stored.salt),
          iterations: stored.iterations,
          hash: "SHA-256",
        },
        keyMaterial,
        256
      );

    const bytes = new Uint8Array(derivedBits);

    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    const calculated = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    return safeEqual(
      calculated,
      stored.hash
    );
  } catch {
    return false;
  }
}

/**
 * Создает секрет для session binding.
 */
export async function createSessionBinding(
  sessionId: string,
  userAgent: string,
  ipPrefix: string
): Promise<string> {
  return await sha256(
    `${sessionId}|${userAgent}|${ipPrefix}`
  );
}

/**
 * Проверяет session binding.
 */
export async function verifySessionBinding(
  expected: string,
  sessionId: string,
  userAgent: string,
  ipPrefix: string
): Promise<boolean> {
  const actual =
    await createSessionBinding(
      sessionId,
      userAgent,
      ipPrefix
    );

  return safeEqual(expected, actual);
}

/**
 * Получает безопасный IP-префикс.
 */
export function getIpPrefix(
  ip: string
): string {
  const value = ip.trim();

  if (value.includes(".")) {
    const parts = value.split(".");

    if (parts.length === 4) {
      return parts.slice(0, 3).join(".");
    }
  }

  if (value.includes(":")) {
    const parts = value.split(":");

    return parts
      .slice(0, 4)
      .join(":");
  }

  return value;
}

/**
 * Проверяет IP в allowlist.
 */
export function isIpAllowed(
  ip: string,
  allowlist: readonly string[]
): boolean {
  const normalized = ip.trim();

  return allowlist.some(
    (allowed) =>
      allowed.trim() === normalized
  );
}

/**
 * Проверяет IP в denylist.
 */
export function isIpBlocked(
  ip: string,
  denylist: readonly string[]
): boolean {
  const normalized = ip.trim();

  return denylist.some(
    (blocked) =>
      blocked.trim() === normalized
  );
}

/**
 * Проверяет security headers.
 */
export function securityHeaders(): Record<
  string,
  string
> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

/**
 * Применяет security headers к Response.
 */
export function withSecurityHeaders(
  response: Response
): Response {
  const headers = new Headers(
    response.headers
  );

  for (const [key, value] of Object.entries(
    securityHeaders()
  )) {
    headers.set(key, value);
  }

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    }
  );
}

/**
 * Проверяет базовую безопасность HTTP-запроса.
 */
export function validateRequestSecurity(
  request: Request,
  options?: {
    allowedOrigins?: readonly string[];
    maxBodyBytes?: number;
    allowedContentTypes?: readonly string[];
    rejectSuspiciousUserAgents?: boolean;
  }
): SecurityCheckResult {
  const headerCheck =
    detectHeaderInjection(request);

  if (!headerCheck.allowed) {
    return headerCheck;
  }

  const userAgentCheck =
    validateUserAgent(
      request.headers.get("User-Agent")
    );

  if (!userAgentCheck.allowed) {
    return userAgentCheck;
  }

  if (
    options?.rejectSuspiciousUserAgents
  ) {
    const suspicious =
      detectSuspiciousUserAgent(
        request.headers.get("User-Agent")
      );

    if (!suspicious.allowed) {
      return suspicious;
    }
  }

  if (
    options?.maxBodyBytes !== undefined
  ) {
    const bodyCheck =
      validateContentLength(
        request,
        options.maxBodyBytes
      );

    if (!bodyCheck.allowed) {
      return bodyCheck;
    }
  }

  if (options?.allowedContentTypes) {
    const contentCheck =
      validateContentType(
        request,
        options.allowedContentTypes
      );

    if (!contentCheck.allowed) {
      return contentCheck;
    }
  }

  if (
    options?.allowedOrigins &&
    requiresCsrf(request.method)
  ) {
    const originCheck =
      validateRequestOrigin(
        request,
        options.allowedOrigins
      );

    if (!originCheck.allowed) {
      return originCheck;
    }
  }

  return {
    allowed: true,
  };
}

/**
 * Безопасно извлекает Bearer token.
 */
export function extractBearerToken(
  request: Request
): string | null {
  const header =
    request.headers.get("Authorization");

  if (!header) {
    return null;
  }

  const match =
    header.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    return null;
  }

  const token = match[1].trim();

  return isValidToken(token)
    ? token
    : null;
}

/**
 * Совместимое имя для существующего auth middleware.
 *
 * Не создаёт новую логику:
 * использует уже существующий extractBearerToken().
 */
export function getBearerToken(
  request: Request
): string | null {
  return extractBearerToken(request);
}

/**
 * Проверяет API token.
 */
export function validateApiToken(
  provided: unknown,
  expected: unknown
): boolean {
  if (
    typeof provided !== "string" ||
    typeof expected !== "string"
  ) {
    return false;
  }

  if (
    !isValidToken(provided) ||
    !isValidToken(expected)
  ) {
    return false;
  }

  return safeEqual(provided, expected);
}

/**
 * Создает nonce для CSP.
 */
export function generateCspNonce(): string {
  return randomBase64Url(16);
}

/**
 * Создает базовую Content Security Policy.
 */
export function createCsp(
  nonce?: string
): string {
  const scriptSource = nonce
    ? `'self' 'nonce-${nonce}'`
    : "'self'";

  return [
    "default-src 'self'",
    `script-src ${scriptSource}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Проверяет безопасное имя файла.
 */
export function isSafeFileName(
  fileName: string
): boolean {
  if (
    !fileName ||
    fileName.length > 255
  ) {
    return false;
  }

  if (
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("..")
  ) {
    return false;
  }

  return /^[\p{L}\p{N}._()\- ]+$/u.test(
    fileName
  );
}

/**
 * Безопасно извлекает расширение файла.
 */
export function getFileExtension(
  fileName: string
): string {
  const clean = fileName
    .trim()
    .toLocaleLowerCase();

  const index = clean.lastIndexOf(".");

  if (index <= 0) {
    return "";
  }

  return clean.slice(index + 1);
}

/**
 * Проверяет расширение.
 */
export function isAllowedFileExtension(
  fileName: string,
  allowed: readonly string[]
): boolean {
  const extension =
    getFileExtension(fileName);

  return allowed.some(
    (item) =>
      item
        .replace(/^\./, "")
        .toLocaleLowerCase() ===
      extension
  );
}

/**
 * Безопасное преобразование строки в HTTP header value.
 */
export function safeHeader(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\r\n\0]/g, "")
    .trim();
}

/**
 * Проверяет подозрительный SQL-паттерн.
 */
export function looksLikeSqlInjection(
  value: unknown
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const text = value
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");

  const patterns = [
    /'\s*(or|and)\s*['"]?\d/i,
    /union\s+select/i,
    /drop\s+table/i,
    /alter\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+.+\s+set/i,
    /--\s*$/i,
    /\/\*/,
    /\*\//,
  ];

  return patterns.some(
    (pattern) => pattern.test(text)
  );
}

/**
 * Проверяет очевидные XSS-паттерны.
 */
export function looksLikeXss(
  value: unknown
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const text = value.toLocaleLowerCase();

  const patterns = [
    /<script\b/i,
    /javascript\s*:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /data:text\/html/i,
  ];

  return patterns.some(
    (pattern) => pattern.test(text)
  );
}

/**
 * Проверяет потенциально опасный пользовательский ввод.
 */
export function inspectUserInput(
  value: unknown
): SecurityCheckResult {
  if (typeof value !== "string") {
    return {
      allowed: true,
    };
  }

  if (value.length > 1_000_000) {
    return {
      allowed: false,
      reason: "Input is too large",
      code: "INPUT_TOO_LARGE",
    };
  }

  if (/[\0\r\n]/.test(value)) {
    return {
      allowed: false,
      reason: "Invalid control characters",
      code: "INVALID_CONTROL_CHARACTERS",
    };
  }

  if (looksLikeXss(value)) {
    return {
      allowed: false,
      reason: "Potential XSS detected",
      code: "XSS_PATTERN",
    };
  }

  return {
    allowed: true,
  };
}

// ============================================================
// ADMIN REQUEST CONTEXT
// ============================================================

/**
 * Извлекает минимальный контекст администратора
 * из HTTP-запроса.
 *
 * Это compatibility helper для существующего
 * auth middleware. Проверка существования
 * администратора выполняется в auth.ts через БД.
 */
export function getRequestAdminContext(
  request: Request
): RequestAdminContext {
  const token =
    getBearerToken(request);

  const adminId =
    request.headers.get("X-Admin-ID")?.trim() || null;

  return {
    authenticated:
      Boolean(token || adminId),

    adminId,

    token,
  };
}

// ============================================================
// END
// ============================================================
```
