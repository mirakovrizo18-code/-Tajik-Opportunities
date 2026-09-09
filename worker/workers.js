/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   CLOUDFLARE WORKERS
   worker/workers.js
   Version: 2026.09.09 POWER CORE

   PURPOSE
   ------------------------------------------------------------
   • Common Cloudflare Worker runtime helpers
   • Request normalization
   • CORS
   • Security headers
   • Request ID
   • JSON responses
   • Error handling
   • D1 / R2 availability helpers
   • API routing helpers
   • Authentication context helpers
   • Admin context helpers
   • Rate-limit primitives
   • Pagination helpers
   • Safe parsing
   • Environment helpers

   IMPORTANT
   ------------------------------------------------------------
   This module does not replace src/index.ts.
   It is a reusable Worker-side core module that can be
   imported by the main Worker and future route modules.
============================================================ */


/* ============================================================
   APP CONSTANTS
============================================================ */

export const WORKER_VERSION = "2026.09.09";

export const APP = Object.freeze({
  name: "Tajik Opportunities",
  shortName: "TO",
  version: WORKER_VERSION,
  environment: "production",
  defaultLanguage: "ru",
  supportedLanguages: ["ru", "tg", "en", "uz"],

  headers: {
    requestId: "X-Request-ID",
    apiVersion: "X-API-Version",
    rateLimit: "X-RateLimit-Limit",
    rateRemaining: "X-RateLimit-Remaining",
    rateReset: "X-RateLimit-Reset"
  },

  paths: {
    api: "/api",
    health: "/health",
    admin: "/admin",
    assets: "/assets"
  }
});


/* ============================================================
   HTTP CONSTANTS
============================================================ */

export const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
});


export const METHODS = Object.freeze([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD"
]);


/* ============================================================
   ALLOWED CORS
============================================================ */

const DEFAULT_ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Request-ID",
  "X-CSRF-Token",
  "X-Visitor-ID",
  "X-Session-ID",
  "X-Client-Version",
  "X-Admin-Session"
];

const DEFAULT_ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS"
];


/* ============================================================
   BASIC UTILITIES
============================================================ */

export function now() {
  return Date.now();
}


export function isoNow() {
  return new Date().toISOString();
}


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}


export function isString(value) {
  return typeof value === "string";
}


export function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}


export function isBoolean(value) {
  return typeof value === "boolean";
}


export function toStringSafe(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  try {
    return String(value);
  } catch {
    return fallback;
  }
}


export function trimString(value, maxLength = 10000) {
  return toStringSafe(value)
    .trim()
    .slice(0, maxLength);
}


export function clamp(value, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(Math.max(number, min), max);
}


/* ============================================================
   REQUEST ID
============================================================ */

export function generateRequestId() {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // fallback below
  }

  const timestamp = Date.now().toString(36);

  let random = "";

  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    random = Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    random = Math.random()
      .toString(36)
      .slice(2);
  }

  return `to_${timestamp}_${random}`;
}


export function getRequestId(request) {
  return (
    request?.headers?.get(APP.headers.requestId) ||
    generateRequestId()
  );
}


/* ============================================================
   URL / ROUTE HELPERS
============================================================ */

export function getURL(request) {
  return new URL(request.url);
}


export function getPathname(request) {
  return getURL(request).pathname;
}


export function getMethod(request) {
  return request.method.toUpperCase();
}


export function getQuery(request, key, fallback = null) {
  const value = getURL(request).searchParams.get(key);

  return value === null ? fallback : value;
}


export function getQueryNumber(request, key, fallback = 0) {
  const value = Number(getQuery(request, key));

  return Number.isFinite(value)
    ? value
    : fallback;
}


export function getQueryBoolean(request, key, fallback = false) {
  const value = getQuery(request, key);

  if (value === null) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(
    value.toLowerCase()
  );
}


export function pathSegments(request) {
  return getPathname(request)
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);
}


export function routeMatches(request, pattern) {
  const pathname = getPathname(request);

  if (pattern instanceof RegExp) {
    return pattern.test(pathname);
  }

  return pathname === pattern;
}


export function isApiRequest(request) {
  return getPathname(request) === "/api" ||
    getPathname(request).startsWith("/api/");
}


export function isAdminPath(request) {
  return getPathname(request) === "/admin" ||
    getPathname(request).startsWith("/admin/");
}


/* ============================================================
   REQUEST BODY
============================================================ */

export async function readJSON(request, fallback = null) {
  try {
    const contentType =
      request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return fallback;
    }

    const text = await request.text();

    if (!text.trim()) {
      return fallback;
    }

    return JSON.parse(text);
  } catch {
    return fallback;
  }
}


export async function readJSONStrict(request) {
  const contentType =
    request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new WorkerError(
      "Content-Type должен быть application/json",
      HTTP.BAD_REQUEST,
      "INVALID_CONTENT_TYPE"
    );
  }

  const text = await request.text();

  if (!text.trim()) {
    throw new WorkerError(
      "Тело запроса пустое",
      HTTP.BAD_REQUEST,
      "EMPTY_BODY"
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new WorkerError(
      "Некорректный JSON",
      HTTP.BAD_REQUEST,
      "INVALID_JSON"
    );
  }
}


export async function readText(request, maxLength = 1_000_000) {
  const text = await request.text();

  return text.slice(0, maxLength);
}


export async function readFormData(request) {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}


/* ============================================================
   HEADERS
============================================================ */

export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Resource-Policy": "same-site",
    "X-XSS-Protection": "0"
  };
}


export function corsHeaders(request, env = {}) {
  const origin =
    request?.headers?.get("Origin") || "";

  const configuredOrigin =
    env?.CORS_ORIGIN ||
    env?.CORS_ALLOWED_ORIGIN ||
    "*";

  const allowOrigin =
    configuredOrigin === "*"
      ? "*"
      : origin === configuredOrigin
        ? origin
        : configuredOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods":
      env?.CORS_METHODS || DEFAULT_ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers":
      env?.CORS_HEADERS || DEFAULT_ALLOWED_HEADERS.join(", "),
    "Access-Control-Expose-Headers":
      "X-Request-ID, X-API-Version, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}


export function buildHeaders(request, env = {}, extra = {}) {
  const requestId = getRequestId(request);

  return {
    "Content-Type": "application/json; charset=utf-8",

    ...securityHeaders(),
    ...corsHeaders(request, env),

    [APP.headers.requestId]: requestId,
    [APP.headers.apiVersion]: "1",

    ...extra
  };
}


/* ============================================================
   RESPONSE HELPERS
============================================================ */

export function jsonResponse(
  request,
  env,
  data,
  status = HTTP.OK,
  extraHeaders = {}
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: buildHeaders(
        request,
        env,
        extraHeaders
      )
    }
  );
}


export function success(
  request,
  env,
  data = null,
  status = HTTP.OK,
  meta = {}
) {
  return jsonResponse(
    request,
    env,
    {
      success: true,
      data,
      meta,
      request_id: getRequestId(request),
      timestamp: isoNow()
    },
    status
  );
}


export function created(
  request,
  env,
  data = null,
  meta = {}
) {
  return success(
    request,
    env,
    data,
    HTTP.CREATED,
    meta
  );
}


export function accepted(
  request,
  env,
  data = null,
  meta = {}
) {
  return success(
    request,
    env,
    data,
    HTTP.ACCEPTED,
    meta
  );
}


export function noContent(request, env) {
  return new Response(null, {
    status: HTTP.NO_CONTENT,
    headers: {
      ...securityHeaders(),
      ...corsHeaders(request, env),
      [APP.headers.requestId]:
        getRequestId(request)
    }
  });
}


export function errorResponse(
  request,
  env,
  error,
  fallbackStatus = HTTP.INTERNAL_ERROR
) {
  const normalized =
    normalizeError(error);

  const status =
    normalized.status ||
    fallbackStatus;

  const isProduction =
    env?.ENVIRONMENT === "production" ||
    env?.ENVIRONMENT === "prod";

  return jsonResponse(
    request,
    env,
    {
      success: false,

      error: {
        code:
          normalized.code ||
          "INTERNAL_ERROR",

        message:
          normalized.publicMessage ||
          (
            isProduction
              ? "Внутренняя ошибка сервера"
              : normalized.message
          ),

        ...(isProduction
          ? {}
          : {
              details: normalized.details || null,
              stack: normalized.stack || null
            })
      },

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    status
  );
}


/* ============================================================
   ERROR SYSTEM
============================================================ */

export class WorkerError extends Error {
  constructor(
    message,
    status = HTTP.INTERNAL_ERROR,
    code = "WORKER_ERROR",
    details = null,
    publicMessage = null
  ) {
    super(message);

    this.name = "WorkerError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.publicMessage =
      publicMessage || message;
  }
}


export function normalizeError(error) {
  if (error instanceof WorkerError) {
    return error;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: HTTP.INTERNAL_ERROR,
      code: "INTERNAL_ERROR",
      details: null,
      publicMessage:
        "Внутренняя ошибка сервера"
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    stack: null,
    status: HTTP.INTERNAL_ERROR,
    code: "INTERNAL_ERROR",
    details: null,
    publicMessage:
      "Внутренняя ошибка сервера"
  };
}


/* ============================================================
   METHOD CHECK
============================================================ */

export function assertMethod(
  request,
  allowed
) {
  const method =
    getMethod(request);

  const methods =
    Array.isArray(allowed)
      ? allowed
      : [allowed];

  if (!methods.includes(method)) {
    throw new WorkerError(
      `Метод ${method} не поддерживается`,
      HTTP.METHOD_NOT_ALLOWED,
      "METHOD_NOT_ALLOWED"
    );
  }
}


/* ============================================================
   CORS PREFLIGHT
============================================================ */

export function handleOptions(
  request,
  env = {}
) {
  return new Response(null, {
    status: HTTP.NO_CONTENT,
    headers: {
      ...securityHeaders(),
      ...corsHeaders(request, env),
      [APP.headers.requestId]:
        getRequestId(request)
    }
  });
}


/* ============================================================
   ENVIRONMENT HELPERS
============================================================ */

export function getEnvironment(env) {
  return (
    env?.ENVIRONMENT ||
    "production"
  );
}


export function isProduction(env) {
  return getEnvironment(env) === "production";
}


export function isDevelopment(env) {
  return [
    "development",
    "dev",
    "local"
  ].includes(
    getEnvironment(env)
  );
}


export function requireEnv(
  env,
  key
) {
  const value = env?.[key];

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    throw new WorkerError(
      `Отсутствует обязательная переменная окружения: ${key}`,
      HTTP.INTERNAL_ERROR,
      "MISSING_ENVIRONMENT_VARIABLE"
    );
  }

  return value;
}


/* ============================================================
   D1 HELPERS
============================================================ */

export function hasD1(env) {
  return Boolean(
    env &&
    env.DB &&
    typeof env.DB.prepare === "function"
  );
}


export function requireD1(env) {
  if (!hasD1(env)) {
    throw new WorkerError(
      "D1 database binding DB недоступен",
      HTTP.SERVICE_UNAVAILABLE,
      "DATABASE_UNAVAILABLE"
    );
  }

  return env.DB;
}


export async function dbFirst(
  env,
  sql,
  params = []
) {
  const db =
    requireD1(env);

  const statement =
    db.prepare(sql);

  const bound =
    params.length
      ? statement.bind(...params)
      : statement;

  return await bound.first();
}


export async function dbAll(
  env,
  sql,
  params = []
) {
  const db =
    requireD1(env);

  const statement =
    db.prepare(sql);

  const bound =
    params.length
      ? statement.bind(...params)
      : statement;

  const result =
    await bound.all();

  return result?.results || [];
}


export async function dbRun(
  env,
  sql,
  params = []
) {
  const db =
    requireD1(env);

  const statement =
    db.prepare(sql);

  const bound =
    params.length
      ? statement.bind(...params)
      : statement;

  return await bound.run();
}


export async function dbBatch(
  env,
  statements
) {
  const db =
    requireD1(env);

  if (!Array.isArray(statements)) {
    throw new WorkerError(
      "Некорректный batch",
      HTTP.BAD_REQUEST,
      "INVALID_BATCH"
    );
  }

  return await db.batch(
    statements
  );
}


/* ============================================================
   R2 HELPERS
============================================================ */

export function hasR2(env, binding = "MEDIA") {
  return Boolean(
    env &&
    env[binding] &&
    typeof env[binding].put === "function"
  );
}


export function requireR2(
  env,
  binding = "MEDIA"
) {
  if (!hasR2(env, binding)) {
    throw new WorkerError(
      `R2 binding ${binding} недоступен`,
      HTTP.SERVICE_UNAVAILABLE,
      "STORAGE_UNAVAILABLE"
    );
  }

  return env[binding];
}


/* ============================================================
   CLOUDFLARE REQUEST METADATA
============================================================ */

export function getCF(request) {
  return request?.cf || null;
}


export function getClientIP(request) {
  return (
    request?.headers?.get("CF-Connecting-IP") ||
    request?.headers?.get("X-Real-IP") ||
    request?.headers?.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}


export function getCountry(request) {
  return (
    request?.headers?.get("CF-IPCountry") ||
    null
  );
}


export function getUserAgent(request) {
  return (
    request?.headers?.get("User-Agent") ||
    ""
  );
}


export function getReferer(request) {
  return (
    request?.headers?.get("Referer") ||
    null
  );
}


export function getRequestMetadata(request) {
  return {
    request_id: getRequestId(request),
    method: getMethod(request),
    pathname: getPathname(request),
    ip: getClientIP(request),
    country: getCountry(request),
    user_agent: getUserAgent(request),
    referer: getReferer(request),
    timestamp: isoNow()
  };
}


/* ============================================================
   VISITOR / SESSION HEADERS
============================================================ */

export function getVisitorId(request) {
  return (
    request?.headers?.get("X-Visitor-ID") ||
    request?.headers?.get("X-Visitor-Id") ||
    null
  );
}


export function getSessionId(request) {
  return (
    request?.headers?.get("X-Session-ID") ||
    request?.headers?.get("X-Session-Id") ||
    null
  );
}


export function getAdminSessionId(request) {
  return (
    request?.headers?.get("X-Admin-Session") ||
    request?.headers?.get("X-Admin-Session-ID") ||
    null
  );
}


/* ============================================================
   AUTHORIZATION
============================================================ */

export function getAuthorization(request) {
  return (
    request?.headers?.get("Authorization") ||
    ""
  );
}


export function getBearerToken(request) {
  const authorization =
    getAuthorization(request);

  if (!authorization) {
    return null;
  }

  const match =
    authorization.match(
      /^Bearer\s+(.+)$/i
    );

  return match
    ? match[1].trim()
    : null;
}


export function requireBearerToken(request) {
  const token =
    getBearerToken(request);

  if (!token) {
    throw new WorkerError(
      "Требуется авторизация",
      HTTP.UNAUTHORIZED,
      "AUTH_REQUIRED"
    );
  }

  return token;
}


/* ============================================================
   BASIC AUTH CONTEXT
============================================================ */

export function createRequestContext(
  request,
  env
) {
  return {
    request,
    env,

    requestId:
      getRequestId(request),

    method:
      getMethod(request),

    url:
      getURL(request),

    pathname:
      getPathname(request),

    visitorId:
      getVisitorId(request),

    sessionId:
      getSessionId(request),

    adminSessionId:
      getAdminSessionId(request),

    authorization:
      getAuthorization(request),

    bearerToken:
      getBearerToken(request),

    metadata:
      getRequestMetadata(request),

    startedAt:
      Date.now()
  };
}


/* ============================================================
   PAGINATION
============================================================ */

export function paginationFromRequest(
  request,
  defaults = {}
) {
  const defaultLimit =
    defaults.limit ?? 20;

  const maxLimit =
    defaults.maxLimit ?? 100;

  const page =
    Math.max(
      1,
      getQueryNumber(
        request,
        "page",
        1
      )
    );

  const limit =
    clamp(
      getQueryNumber(
        request,
        "limit",
        defaultLimit
      ),
      1,
      maxLimit
    );

  const offset =
    (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    maxLimit
  };
}


export function paginationMeta(
  page,
  limit,
  total
) {
  const safeTotal =
    Math.max(
      0,
      Number(total) || 0
    );

  const totalPages =
    Math.ceil(
      safeTotal / limit
    );

  return {
    page,
    limit,
    total: safeTotal,
    total_pages: totalPages,
    has_next:
      page < totalPages,
    has_previous:
      page > 1
  };
}


/* ============================================================
   SAFE INTEGER / DECIMAL STRING
============================================================ */

export function decimalString(
  value,
  fallback = "0"
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const text =
    String(value).trim();

  if (!/^-?\d+$/.test(text)) {
    return fallback;
  }

  return text;
}


export function addDecimalStrings(
  a,
  b
) {
  try {
    const left =
      BigInt(decimalString(a));

    const right =
      BigInt(decimalString(b));

    return (
      left + right
    ).toString();
  } catch {
    return "0";
  }
}


export function subtractDecimalStrings(
  a,
  b
) {
  try {
    const left =
      BigInt(decimalString(a));

    const right =
      BigInt(decimalString(b));

    const result =
      left - right;

    return (
      result < 0n
        ? 0n
        : result
    ).toString();
  } catch {
    return "0";
  }
}


/* ============================================================
   CACHE HELPERS
============================================================ */

export function cacheHeaders(
  options = {}
) {
  const {
    maxAge = 0,
    sMaxAge = 0,
    privateCache = false,
    noStore = false
  } = options;

  if (noStore) {
    return {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    };
  }

  if (privateCache) {
    return {
      "Cache-Control":
        `private, max-age=${maxAge}`
    };
  }

  if (sMaxAge > 0) {
    return {
      "Cache-Control":
        `public, max-age=${maxAge}, s-maxage=${sMaxAge}`
    };
  }

  return {
    "Cache-Control":
      `public, max-age=${maxAge}`
  };
}


export function withCache(
  response,
  options = {}
) {
  const headers =
    new Headers(
      response.headers
    );

  const extra =
    cacheHeaders(options);

  for (const [
    key,
    value
  ] of Object.entries(extra)) {
    headers.set(key, value);
  }

  return new Response(
    response.body,
    {
      status:
        response.status,
      statusText:
        response.statusText,
      headers
    }
  );
}


/* ============================================================
   ETAG
============================================================ */

export async function createETag(
  value
) {
  const text =
    typeof value === "string"
      ? value
      : JSON.stringify(value);

  const data =
    new TextEncoder().encode(text);

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  const hex =
    Array.from(
      new Uint8Array(digest)
    )
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(2, "0")
      )
      .join("");

  return `"${hex}"`;
}


export function matchesETag(
  request,
  etag
) {
  const incoming =
    request.headers.get(
      "If-None-Match"
    );

  return Boolean(
    incoming &&
    etag &&
    incoming === etag
  );
}


/* ============================================================
   RATE LIMIT PRIMITIVE
============================================================ */

const rateLimitMemory =
  new Map();


export function rateLimitKey(
  request,
  scope = "global"
) {
  return [
    scope,
    getClientIP(request),
    getVisitorId(request) || "no-visitor"
  ].join(":");
}


export function checkMemoryRateLimit(
  request,
  options = {}
) {
  const {
    scope = "global",
    limit = 60,
    windowMs = 60_000
  } = options;

  const key =
    rateLimitKey(
      request,
      scope
    );

  const current =
    Date.now();

  let record =
    rateLimitMemory.get(key);

  if (
    !record ||
    current >= record.resetAt
  ) {
    record = {
      count: 0,
      resetAt:
        current + windowMs
    };
  }

  record.count += 1;

  rateLimitMemory.set(
    key,
    record
  );

  const remaining =
    Math.max(
      0,
      limit - record.count
    );

  return {
    allowed:
      record.count <= limit,

    limit,

    remaining,

    resetAt:
      record.resetAt,

    retryAfter:
      Math.max(
        0,
        Math.ceil(
          (record.resetAt - current) /
          1000
        )
      )
  };
}


export function enforceRateLimit(
  request,
  options = {}
) {
  const result =
    checkMemoryRateLimit(
      request,
      options
    );

  if (!result.allowed) {
    throw new WorkerError(
      "Слишком много запросов. Попробуйте позже.",
      HTTP.TOO_MANY_REQUESTS,
      "RATE_LIMITED",
      result,
      "Слишком много запросов. Попробуйте позже."
    );
  }

  return result;
}


/* ============================================================
   RATE LIMIT RESPONSE HEADERS
============================================================ */

export function rateLimitHeaders(
  result
) {
  if (!result) {
    return {};
  }

  return {
    [APP.headers.rateLimit]:
      String(result.limit),

    [APP.headers.rateRemaining]:
      String(result.remaining),

    [APP.headers.rateReset]:
      String(
        Math.ceil(
          result.resetAt / 1000
        )
      )
  };
}


/* ============================================================
   REQUEST ID + RATE LIMIT RESPONSE
============================================================ */

export function successWithRateLimit(
  request,
  env,
  data,
  rateLimit,
  status = HTTP.OK,
  meta = {}
) {
  return jsonResponse(
    request,
    env,
    {
      success: true,
      data,
      meta,
      request_id:
        getRequestId(request),
      timestamp:
        isoNow()
    },
    status,
    rateLimitHeaders(
      rateLimit
    )
  );
}


/* ============================================================
   HEALTH
============================================================ */

export async function healthCheck(
  env
) {
  let database =
    "unavailable";

  if (hasD1(env)) {
    try {
      await dbFirst(
        env,
        "SELECT 1 AS ok"
      );

      database =
        "ok";
    } catch {
      database =
        "error";
    }
  }

  return {
    status:
      database === "ok"
        ? "ok"
        : "degraded",

    application:
      APP.name,

    version:
      APP.version,

    environment:
      getEnvironment(env),

    database,

    r2:
      hasR2(env)
        ? "available"
        : "not_configured",

    timestamp:
      isoNow()
  };
}


/* ============================================================
   HEALTH RESPONSE
============================================================ */

export async function healthResponse(
  request,
  env
) {
  const health =
    await healthCheck(env);

  const status =
    health.status === "ok"
      ? HTTP.OK
      : HTTP.SERVICE_UNAVAILABLE;

  return jsonResponse(
    request,
    env,
    {
      success:
        health.status === "ok",

      data:
        health,

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    status,
    cacheHeaders({
      noStore: true
    })
  );
}


/* ============================================================
   API ROOT RESPONSE
============================================================ */

export function apiRootResponse(
  request,
  env
) {
  return success(
    request,
    env,
    {
      name:
        APP.name,

      version:
        APP.version,

      environment:
        getEnvironment(env),

      api:
        "/api",

      status:
        "online"
    }
  );
}


/* ============================================================
   NOT FOUND
============================================================ */

export function notFound(
  request,
  env,
  message =
    "Запрашиваемый ресурс не найден"
) {
  return jsonResponse(
    request,
    env,
    {
      success: false,

      error: {
        code:
          "NOT_FOUND",

        message
      },

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    HTTP.NOT_FOUND
  );
}


/* ============================================================
   UNAUTHORIZED
============================================================ */

export function unauthorized(
  request,
  env,
  message =
    "Требуется авторизация"
) {
  return jsonResponse(
    request,
    env,
    {
      success: false,

      error: {
        code:
          "UNAUTHORIZED",

        message
      },

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    HTTP.UNAUTHORIZED
  );
}


/* ============================================================
   FORBIDDEN
============================================================ */

export function forbidden(
  request,
  env,
  message =
    "Доступ запрещён"
) {
  return jsonResponse(
    request,
    env,
    {
      success: false,

      error: {
        code:
          "FORBIDDEN",

        message
      },

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    HTTP.FORBIDDEN
  );
}


/* ============================================================
   CONFLICT
============================================================ */

export function conflict(
  request,
  env,
  message =
    "Конфликт данных"
) {
  return jsonResponse(
    request,
    env,
    {
      success: false,

      error: {
        code:
          "CONFLICT",

        message
      },

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    HTTP.CONFLICT
  );
}


/* ============================================================
   VALIDATION
============================================================ */

export function badRequest(
  request,
  env,
  message =
    "Некорректный запрос"
) {
  return jsonResponse(
    request,
    env,
    {
      success: false,

      error: {
        code:
          "BAD_REQUEST",

        message
      },

      request_id:
        getRequestId(request),

      timestamp:
        isoNow()
    },
    HTTP.BAD_REQUEST
  );
}


/* ============================================================
   JSON FIELD HELPERS
============================================================ */

export function requireField(
  object,
  field,
  options = {}
) {
  const {
    type = "string",
    allowEmpty = false,
    maxLength = 100000
  } = options;

  if (
    !object ||
    object[field] === undefined ||
    object[field] === null
  ) {
    throw new WorkerError(
      `Поле ${field} обязательно`,
      HTTP.BAD_REQUEST,
      "VALIDATION_ERROR"
    );
  }

  const value =
    object[field];

  if (type === "string") {
    if (
      typeof value !== "string"
    ) {
      throw new WorkerError(
        `Поле ${field} должно быть строкой`,
        HTTP.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }

    if (
      !allowEmpty &&
      value.trim() === ""
    ) {
      throw new WorkerError(
        `Поле ${field} не может быть пустым`,
        HTTP.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }

    if (
      value.length > maxLength
    ) {
      throw new WorkerError(
        `Поле ${field} слишком длинное`,
        HTTP.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }
  }

  return value;
}


/* ============================================================
   ARRAY HELPERS
============================================================ */

export function uniqueArray(
  values
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(values)
  ];
}


export function normalizeArray(
  value
) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  return [value];
}


/* ============================================================
   SAFE JSON SERIALIZATION
============================================================ */

export function safeJSON(
  value,
  fallback = null
) {
  try {
    return JSON.stringify(
      value,
      (_, current) => {
        if (
          typeof current === "bigint"
        ) {
          return current.toString();
        }

        return current;
      }
    );
  } catch {
    return fallback;
  }
}


export function parseJSON(
  value,
  fallback = null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  try {
    return JSON.parse(
      String(value)
    );
  } catch {
    return fallback;
  }
}


/* ============================================================
   SECURITY NORMALIZATION
============================================================ */

export function normalizeIdentifier(
  value,
  maxLength = 255
) {
  return toStringSafe(
    value
  )
    .trim()
    .slice(0, maxLength);
}


export function normalizeUsername(
  value
) {
  return normalizeIdentifier(
    value,
    64
  )
    .replace(/^@+/, "")
    .toLowerCase();
}


export function normalizeEmail(
  value
) {
  return normalizeIdentifier(
    value,
    320
  ).toLowerCase();
}


/* ============================================================
   CONTENT SECURITY
============================================================ */

export function containsDangerousHTML(
  value
) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /<\s*(script|iframe|object|embed|style|link|meta|svg)\b/i.test(
    value
  );
}


export function containsJavascriptURL(
  value
) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /^\s*javascript\s*:/i.test(
    value
  );
}


/* ============================================================
   PUBLICATION NUMBER
============================================================ */

export function normalizePostNumber(
  value
) {
  const number =
    Number(
      String(value)
        .replace(/^#/, "")
        .trim()
    );

  if (
    !Number.isSafeInteger(number) ||
    number < 1
  ) {
    return null;
  }

  return number;
}


/* ============================================================
   FEATURE FLAGS
============================================================ */

export function featureEnabled(
  env,
  name,
  fallback = false
) {
  if (!env) {
    return fallback;
  }

  const key =
    `FEATURE_${String(name)
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_")}`;

  const value =
    env[key];

  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on",
    "enabled"
  ].includes(
    String(value).toLowerCase()
  );
}


/* ============================================================
   ADMIN MODE HELPERS
============================================================ */

export function isActingMode(
  request
) {
  const value =
    request?.headers?.get(
      "X-TO-Acting-Mode"
    );

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(
    String(value || "")
      .toLowerCase()
  );
}


export function getActingParticipantId(
  request
) {
  return (
    request?.headers?.get(
      "X-TO-Acting-Participant-ID"
    ) ||
    null
  );
}


/* ============================================================
   ADMIN ACTION CONTEXT
============================================================ */

export function createAdminActionContext(
  request
) {
  return {
    adminSessionId:
      getAdminSessionId(request),

    actingMode:
      isActingMode(request),

    actingParticipantId:
      getActingParticipantId(request),

    requestId:
      getRequestId(request),

    ip:
      getClientIP(request),

    userAgent:
      getUserAgent(request),

    timestamp:
      isoNow()
  };
}


/* ============================================================
   INTERNAL REQUEST MARKER
============================================================ */

export function isInternalRequest(
  request
) {
  const value =
    request?.headers?.get(
      "X-TO-Internal"
    );

  return value === "1";
}


/* ============================================================
   RESPONSE ENVELOPE
============================================================ */

export function envelope({
  success: isSuccess = true,
  data = null,
  error = null,
  meta = {},
  requestId = null
} = {}) {
  return {
    success:
      Boolean(isSuccess),

    data,

    error,

    meta,

    request_id:
      requestId,

    timestamp:
      isoNow()
  };
}


/* ============================================================
   GENERIC WORKER HANDLER WRAPPER
============================================================ */

export async function runHandler(
  request,
  env,
  handler
) {
  const context =
    createRequestContext(
      request,
      env
    );

  try {
    const result =
      await handler(
        context
      );

    if (
      result instanceof Response
    ) {
      return result;
    }

    return success(
      request,
      env,
      result
    );
  } catch (error) {
    console.error(
      "[TAJIK OPPORTUNITIES]",
      {
        requestId:
          context.requestId,

        error
      }
    );

    return errorResponse(
      request,
      env,
      error
    );
  }
}


/* ============================================================
   ROUTE DEFINITIONS
============================================================ */

export function defineRoute(
  method,
  pattern,
  handler,
  options = {}
) {
  return {
    method:
      method.toUpperCase(),

    pattern,

    handler,

    options
  };
}


export function routeMatchesDefinition(
  request,
  route
) {
  if (
    route.method !== "*" &&
    route.method !== getMethod(request)
  ) {
    return false;
  }

  if (
    typeof route.pattern === "string"
  ) {
    return getPathname(request) ===
      route.pattern;
  }

  if (
    route.pattern instanceof RegExp
  ) {
    return route.pattern.test(
      getPathname(request)
    );
  }

  if (
    typeof route.pattern === "function"
  ) {
    return Boolean(
      route.pattern(request)
    );
  }

  return false;
}


/* ============================================================
   ROUTER
============================================================ */

export class WorkerRouter {
  constructor() {
    this.routes = [];
  }

  add(
    method,
    pattern,
    handler,
    options = {}
  ) {
    this.routes.push(
      defineRoute(
        method,
        pattern,
        handler,
        options
      )
    );

    return this;
  }

  get(
    pattern,
    handler,
    options = {}
  ) {
    return this.add(
      "GET",
      pattern,
      handler,
      options
    );
  }

  post(
    pattern,
    handler,
    options = {}
  ) {
    return this.add(
      "POST",
      pattern,
      handler,
      options
    );
  }

  put(
    pattern,
    handler,
    options = {}
  ) {
    return this.add(
      "PUT",
      pattern,
      handler,
      options
    );
  }

  patch(
    pattern,
    handler,
    options = {}
  ) {
    return this.add(
      "PATCH",
      pattern,
      handler,
      options
    );
  }

  delete(
    pattern,
    handler,
    options = {}
  ) {
    return this.add(
      "DELETE",
      pattern,
      handler,
      options
    );
  }

  options(
    pattern,
    handler,
    options = {}
  ) {
    return this.add(
      "OPTIONS",
      pattern,
      handler,
      options
    );
  }

  async handle(
    request,
    env
  ) {
    for (const route of this.routes) {
      if (
        routeMatchesDefinition(
          request,
          route
        )
      ) {
        return runHandler(
          request,
          env,
          route.handler
        );
      }
    }

    return notFound(
      request,
      env
    );
  }
}


/* ============================================================
   ERROR-SAFE EXECUTION
============================================================ */

export async function safeExecute(
  fn,
  fallback = null
) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}


/* ============================================================
   LOGGING
============================================================ */

export function logRequest(
  request,
  extra = {}
) {
  const metadata =
    getRequestMetadata(
      request
    );

  console.log(
    JSON.stringify({
      type: "request",
      ...metadata,
      ...extra
    })
  );
}


export function logError(
  request,
  error,
  extra = {}
) {
  const normalized =
    normalizeError(
      error
    );

  console.error(
    JSON.stringify({
      type: "error",

      request_id:
        getRequestId(request),

      method:
        getMethod(request),

      pathname:
        getPathname(request),

      code:
        normalized.code,

      message:
        normalized.message,

      ...extra
    })
  );
}


/* ============================================================
   WORKER REQUEST LIFECYCLE
============================================================ */

export async function processRequest(
  request,
  env,
  handler
) {
  const started =
    Date.now();

  const requestId =
    getRequestId(request);

  try {
    if (
      getMethod(request) ===
      "OPTIONS"
    ) {
      return handleOptions(
        request,
        env
      );
    }

    const response =
      await handler(
        request,
        env
      );

    const headers =
      new Headers(
        response.headers
      );

    headers.set(
      APP.headers.requestId,
      requestId
    );

    headers.set(
      "Server-Timing",
      `worker;dur=${Date.now() - started}`
    );

    return new Response(
      response.body,
      {
        status:
          response.status,

        statusText:
          response.statusText,

        headers
      }
    );
  } catch (error) {
    logError(
      request,
      error
    );

    return errorResponse(
      request,
      env,
      error
    );
  }
}


/* ============================================================
   DEFAULT WORKER HANDLER
============================================================ */

export async function handleWorker(
  request,
  env,
  router = null
) {
  return processRequest(
    request,
    env,
    async (
      currentRequest,
      currentEnv
    ) => {
      if (
        router &&
        typeof router.handle ===
          "function"
      ) {
        return await router.handle(
          currentRequest,
          currentEnv
        );
      }

      const pathname =
        getPathname(
          currentRequest
        );

      if (
        pathname === "/health" ||
        pathname === "/api/health"
      ) {
        return await healthResponse(
          currentRequest,
          currentEnv
        );
      }

      if (
        pathname === "/api" ||
        pathname === "/api/"
      ) {
        return apiRootResponse(
          currentRequest,
          currentEnv
        );
      }

      return notFound(
        currentRequest,
        currentEnv
      );
    }
  );
}


/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  APP,
  HTTP,
  WorkerError,
  WorkerRouter,

  now,
  isoNow,

  getURL,
  getPathname,
  getMethod,
  getQuery,
  pathSegments,

  getRequestId,
  generateRequestId,

  readJSON,
  readJSONStrict,
  readText,
  readFormData,

  corsHeaders,
  securityHeaders,
  buildHeaders,

  jsonResponse,
  success,
  created,
  accepted,
  noContent,
  errorResponse,

  hasD1,
  requireD1,
  dbFirst,
  dbAll,
  dbRun,
  dbBatch,

  hasR2,
  requireR2,

  getClientIP,
  getCountry,
  getUserAgent,
  getReferer,
  getRequestMetadata,

  getVisitorId,
  getSessionId,
  getAdminSessionId,

  getBearerToken,
  requireBearerToken,

  createRequestContext,
  createAdminActionContext,

  paginationFromRequest,
  paginationMeta,

  decimalString,
  addDecimalStrings,
  subtractDecimalStrings,

  createETag,
  matchesETag,

  checkMemoryRateLimit,
  enforceRateLimit,
  rateLimitHeaders,

  healthCheck,
  healthResponse,
  apiRootResponse,

  notFound,
  unauthorized,
  forbidden,
  conflict,
  badRequest,

  normalizeIdentifier,
  normalizeUsername,
  normalizeEmail,

  normalizePostNumber,

  featureEnabled,

  isActingMode,
  getActingParticipantId,

  safeJSON,
  parseJSON,

  runHandler,
  processRequest,
  handleWorker
};
