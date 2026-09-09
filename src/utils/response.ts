// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// HTTP / RESPONSE UTILITIES
// File: src/utils/response.ts
// Version: 2026.09.09-fixed
//
// Надёжная система HTTP-ответов для Cloudflare Workers:
// • JSON / TEXT / HTML
// • единый формат API
// • ошибки и валидация
// • CORS
// • security headers
// • Request ID
// • pagination
// • rate limiting
// • ETag / 304
// • response headers
// • безопасная сериализация
// • обработка неизвестных ошибок
// • Cloudflare Workers compatible
// ============================================================

import type { ApiErrorCode } from "../types/api";


// ============================================================
// TYPES
// ============================================================

export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  url: string;
  userAgent?: string;
  ip?: string;
}

export interface ApiErrorDetails {
  code?: string;
  field?: string;
  fields?: Record<string, string>;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiResponseError {
  code?: string;
  message: string;
  details?: unknown;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiResponseError;
  meta?: Record<string, unknown>;
}

export interface ResponseOptions {
  requestId?: string;
  headers?: HeadersInit;
  cacheControl?: string;
  contentType?: string;
  statusText?: string;
}

export interface ErrorResponseOptions {
  requestId?: string;
  details?: unknown;
  headers?: HeadersInit;
  code?: string | ApiErrorCode;
}

export interface RateLimitOptions {
  limit: number;
  remaining: number;
  reset?: number;
}

export interface JsonResponseOptions
  extends ResponseOptions {
  /**
   * Request is optional and is used only for
   * request-aware header construction.
   *
   * This property fixes strict TypeScript
   * compatibility with jsonResponse().
   */
  request?: Request;

  meta?: Record<string, unknown>;
  page?: number;
  limit?: number;
  total?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  total?: number;
}

export interface ResponseFactoryOptions
  extends ResponseOptions {
  request?: Request;
}

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


// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_CACHE_CONTROL =
  "no-store";

const DEFAULT_CONTENT_TYPE =
  "application/json; charset=utf-8";

const DEFAULT_TEXT_CONTENT_TYPE =
  "text/plain; charset=utf-8";

const DEFAULT_HTML_CONTENT_TYPE =
  "text/html; charset=utf-8";

const DEFAULT_PAGE =
  1;

const DEFAULT_PAGE_LIMIT =
  20;

const MAX_PAGE_LIMIT =
  100;

const MAX_HEADER_VALUE_LENGTH =
  4096;

const DEFAULT_SECURITY_HEADERS:
  Record<string, string> = {
    "X-Content-Type-Options":
      "nosniff",

    "X-Frame-Options":
      "DENY",

    "Referrer-Policy":
      "strict-origin-when-cross-origin",

    "Permissions-Policy":
      "geolocation=(), microphone=(), camera=()",
  };


// ============================================================
// INTERNAL VALUE HELPERS
// ============================================================

function toStringValue(
  value: unknown,
  fallback = "",
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return `${value}`;
  }

  try {
    return `${value}`;
  } catch {
    return fallback;
  }
}


function safeHeaderValue(
  value: unknown
): string {
  const result =
    toStringValue(value)
      .replace(
        /[\r\n]/g,
        ""
      )
      .slice(
        0,
        MAX_HEADER_VALUE_LENGTH
      );

  return result;
}


function toFiniteNumber(
  value: unknown,
  fallback: number
): number {
  const number =
    typeof value === "number"
      ? value
      : Number(
          typeof value === "string"
            ? value.trim()
            : value
        );

  return Number.isFinite(number)
    ? number
    : fallback;
}


function normalizePositiveInteger(
  value: unknown,
  fallback: number
): number {
  const number =
    toFiniteNumber(
      value,
      fallback
    );

  return Math.max(
    1,
    Math.floor(number)
  );
}


function normalizeNonNegativeInteger(
  value: unknown,
  fallback = 0
): number {
  const number =
    toFiniteNumber(
      value,
      fallback
    );

  return Math.max(
    0,
    Math.floor(number)
  );
}


// ============================================================
// CORS
// ============================================================

export function corsHeaders(
  _request?: Request
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin":
      "*",

    "Access-Control-Allow-Methods":
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",

    "Access-Control-Allow-Headers":
      [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Request-ID",
        "X-API-Version",
        "If-None-Match",
      ].join(", "),

    "Access-Control-Expose-Headers":
      [
        "X-Request-ID",
        "X-API-Version",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "ETag",
        "Server-Timing",
      ].join(", "),

    "Access-Control-Max-Age":
      "86400",
  };
}


// ============================================================
// HEADERS
// ============================================================

function createHeaders(
  request?: Request,
  options: ResponseOptions = {}
): Headers {
  const headers =
    new Headers();

  const cors =
    corsHeaders(
      request
    );

  for (
    const [key, value]
    of Object.entries(
      cors
    )
  ) {
    headers.set(
      key,
      safeHeaderValue(
        value
      )
    );
  }

  for (
    const [key, value]
    of Object.entries(
      DEFAULT_SECURITY_HEADERS
    )
  ) {
    headers.set(
      key,
      safeHeaderValue(
        value
      )
    );
  }

  headers.set(
    "Cache-Control",
    safeHeaderValue(
      options.cacheControl ??
      DEFAULT_CACHE_CONTROL
    )
  );

  headers.set(
    "Content-Type",
    safeHeaderValue(
      options.contentType ??
      DEFAULT_CONTENT_TYPE
    )
  );

  if (options.headers) {
    const customHeaders =
      new Headers(
        options.headers
      );

    customHeaders.forEach(
      (
        value,
        key
      ) => {
        headers.set(
          key,
          safeHeaderValue(
            value
          )
        );
      }
    );
  }

  if (options.requestId) {
    headers.set(
      "X-Request-ID",
      safeHeaderValue(
        options.requestId
      )
    );
  }

  return headers;
}


// ============================================================
// SAFE SERIALIZATION
// ============================================================

function serializeInternal(
  value: unknown,
  seen: Set<object>
): unknown {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (
    typeof value === "bigint"
  ) {
    return `${value}`;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    if (
      typeof value === "number" &&
      !Number.isFinite(value)
    ) {
      return null;
    }

    return value;
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString();
  }

  if (
    value instanceof URL
  ) {
    return value.toString();
  }

  if (
    value instanceof Map
  ) {
    const result:
      Record<string, unknown> = {};

    for (
      const [key, item]
      of value.entries()
    ) {
      result[
        toStringValue(key)
      ] =
        serializeInternal(
          item,
          seen
        );
    }

    return result;
  }

  if (
    value instanceof Set
  ) {
    return Array.from(
      value.values(),
      item =>
        serializeInternal(
          item,
          seen
        )
    );
  }

  if (
    Array.isArray(value)
  ) {
    if (
      seen.has(value)
    ) {
      return "[Circular]";
    }

    seen.add(value);

    const result =
      value.map(
        item =>
          serializeInternal(
            item,
            seen
          )
      );

    seen.delete(value);

    return result;
  }

  if (
    typeof value === "object"
  ) {
    const object =
      value as Record<
        string,
        unknown
      >;

    if (
      seen.has(object)
    ) {
      return "[Circular]";
    }

    seen.add(object);

    const result:
      Record<string, unknown> = {};

    for (
      const [key, item]
      of Object.entries(
        object
      )
    ) {
      result[key] =
        serializeInternal(
          item,
          seen
        );
    }

    seen.delete(object);

    return result;
  }

  try {
    return `${value}`;
  } catch {
    return null;
  }
}


export function serialize(
  value: unknown
): unknown {
  return serializeInternal(
    value,
    new Set<object>()
  );
}


export function serializeJson(
  value: unknown
): string {
  try {
    return JSON.stringify(
      serialize(value)
    );
  } catch {
    return JSON.stringify(
      "[Unserializable]"
    );
  }
}


// ============================================================
// PAGINATION
// ============================================================

export function normalizePagination(
  page?: number,
  limit?: number,
  total?: number
): PaginationMeta | undefined {
  if (
    page === undefined &&
    limit === undefined &&
    total === undefined
  ) {
    return undefined;
  }

  const safePage =
    normalizePositiveInteger(
      page,
      DEFAULT_PAGE
    );

  const safeLimit =
    Math.min(
      MAX_PAGE_LIMIT,
      normalizePositiveInteger(
        limit,
        DEFAULT_PAGE_LIMIT
      )
    );

  const result:
    PaginationMeta = {
    page:
      safePage,

    limit:
      safeLimit,
  };

  if (total !== undefined) {
    const safeTotal =
      normalizeNonNegativeInteger(
        total,
        0
      );

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          safeTotal /
          safeLimit
        )
      );

    result.total =
      safeTotal;

    result.totalPages =
      totalPages;

    result.hasNext =
      safePage <
      totalPages;

    result.hasPrevious =
      safePage >
      1;
  }

  return result;
}


export function createPaginationMeta(
  options: PaginationOptions
): PaginationMeta {
  return (
    normalizePagination(
      options.page,
      options.limit,
      options.total
    ) ??
    {
      page:
        DEFAULT_PAGE,

      limit:
        DEFAULT_PAGE_LIMIT,
    }
  );
}


export function getTotalPages(
  total: number,
  limit: number
): number {
  const safeTotal =
    normalizeNonNegativeInteger(
      total,
      0
    );

  const safeLimit =
    Math.min(
      MAX_PAGE_LIMIT,
      normalizePositiveInteger(
        limit,
        DEFAULT_PAGE_LIMIT
      )
    );

  return Math.max(
    1,
    Math.ceil(
      safeTotal /
      safeLimit
    )
  );
}


export function getPaginationOffset(
  page: number,
  limit: number
): number {
  const safePage =
    normalizePositiveInteger(
      page,
      DEFAULT_PAGE
    );

  const safeLimit =
    Math.min(
      MAX_PAGE_LIMIT,
      normalizePositiveInteger(
        limit,
        DEFAULT_PAGE_LIMIT
      )
    );

  return (
    safePage - 1
  ) * safeLimit;
}


// ============================================================
// META
// ============================================================

function buildMeta(
  meta?: Record<string, unknown>,
  pagination?: PaginationMeta
): Record<string, unknown> | undefined {
  if (
    !meta &&
    !pagination
  ) {
    return undefined;
  }

  const result:
    Record<string, unknown> = {
    ...(meta ?? {}),
  };

  if (pagination) {
    result.pagination =
      pagination;
  }

  return result;
}


// ============================================================
// RESPONSE BODY
// ============================================================

function createBody<T>(
  data: T,
  meta?: Record<string, unknown>,
  pagination?: PaginationMeta
): ApiResponseBody<T> {
  const body:
    ApiResponseBody<T> = {
    success: true,
    data:
      serialize(data) as T,
  };

  const finalMeta =
    buildMeta(
      meta,
      pagination
    );

  if (finalMeta) {
    body.meta =
      finalMeta;
  }

  return body;
}


// ============================================================
// JSON RESPONSE
// ============================================================

export function jsonResponse<T>(
  data: T,
  status = 200,
  options: JsonResponseOptions = {}
): Response {
  const pagination =
    normalizePagination(
      options.page,
      options.limit,
      options.total
    );

  const body =
    createBody(
      data,
      options.meta,
      pagination
    );

  const headers =
    createHeaders(
      options.request,
      {
        ...options,
        requestId:
          options.requestId,
      }
    );

  return new Response(
    serializeJson(body),
    {
      status:
        Math.max(
          100,
          Math.min(
            599,
            Math.floor(status)
          )
        ),

      statusText:
        options.statusText,

      headers,
    }
  );
}


export function successResponse<T>(
  data: T,
  status = 200,
  options: ResponseOptions = {}
): Response {
  return jsonResponse(
    data,
    status,
    options
  );
}


// ============================================================
// ERROR CODES
// ============================================================

function defaultErrorCode(
  status: number
): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";

    case 401:
      return "UNAUTHORIZED";

    case 403:
      return "FORBIDDEN";

    case 404:
      return "NOT_FOUND";

    case 405:
      return "METHOD_NOT_ALLOWED";

    case 409:
      return "CONFLICT";

    case 410:
      return "GONE";

    case 415:
      return "UNSUPPORTED_MEDIA_TYPE";

    case 422:
      return "VALIDATION_ERROR";

    case 429:
      return "RATE_LIMITED";

    default:
      return status >= 500
        ? "INTERNAL_SERVER_ERROR"
        : "ERROR";
  }
}


// ============================================================
// ERROR RESPONSE
// ============================================================

export function errorResponse(
  message: string,
  status = 500,
  options: ErrorResponseOptions = {}
): Response {
  const safeStatus =
    Math.max(
      100,
      Math.min(
        599,
        Math.floor(status)
      )
    );

  const error:
    ApiResponseError = {
    code:
      options.code ??
      defaultErrorCode(
        safeStatus
      ),

    message:
      toStringValue(
        message,
        "Request failed"
      ),

    ...(options.details !==
    undefined
      ? {
          details:
            serialize(
              options.details
            ),
        }
      : {}),
  };

  const body:
    ApiResponseBody = {
    success:
      false,

    error,
  };

  const headers =
    createHeaders(
      undefined,
      {
        requestId:
          options.requestId,

        headers:
          options.headers,
      }
    );

  return new Response(
    serializeJson(body),
    {
      status:
        safeStatus,

      headers,
    }
  );
}


// ============================================================
// STANDARD ERROR HELPERS
// ============================================================

export function badRequestResponse(
  message = "Bad request",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    400,
    {
      ...options,
      code:
        options.code ??
        "BAD_REQUEST",
    }
  );
}


export function unauthorizedResponse(
  message = "Unauthorized",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    401,
    {
      ...options,
      code:
        options.code ??
        "UNAUTHORIZED",
    }
  );
}


export function forbiddenResponse(
  message = "Forbidden",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    403,
    {
      ...options,
      code:
        options.code ??
        "FORBIDDEN",
    }
  );
}


export function notFoundResponse(
  message = "Not found",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    404,
    {
      ...options,
      code:
        options.code ??
        "NOT_FOUND",
    }
  );
}


export function conflictResponse(
  message = "Conflict",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    409,
    {
      ...options,
      code:
        options.code ??
        "CONFLICT",
    }
  );
}


export function goneResponse(
  message = "Gone",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    410,
    {
      ...options,
      code:
        options.code ??
        "GONE",
    }
  );
}


export function unsupportedMediaTypeResponse(
  message = "Unsupported media type",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    415,
    {
      ...options,
      code:
        options.code ??
        "UNSUPPORTED_MEDIA_TYPE",
    }
  );
}


export function validationErrorResponse(
  message = "Validation error",
  details?: unknown,
  options: ErrorResponseOptions = {}
): Response {
  const finalDetails =
    details !== undefined
      ? details
      : options.details;

  return errorResponse(
    message,
    422,
    {
      ...options,
      details:
        finalDetails,

      code:
        options.code ??
        "VALIDATION_ERROR",
    }
  );
}


export function tooManyRequestsResponse(
  message = "Too many requests",
  options:
    ErrorResponseOptions &
    RateLimitOptions = {
      limit: 100,
      remaining: 0,
    }
): Response {
  const headers =
    new Headers(
      options.headers
    );

  headers.set(
    "X-RateLimit-Limit",
    toStringValue(
      normalizeNonNegativeInteger(
        options.limit,
        0
      )
    )
  );

  headers.set(
    "X-RateLimit-Remaining",
    toStringValue(
      normalizeNonNegativeInteger(
        options.remaining,
        0
      )
    )
  );

  if (
    options.reset !== undefined
  ) {
    headers.set(
      "X-RateLimit-Reset",
      toStringValue(
        normalizeNonNegativeInteger(
          options.reset,
          0
        )
      )
    );
  }

  return errorResponse(
    message,
    429,
    {
      ...options,
      headers,
      code:
        options.code ??
        "RATE_LIMITED",
    }
  );
}


export function serverErrorResponse(
  message = "Internal server error",
  options: ErrorResponseOptions = {}
): Response {
  return errorResponse(
    message,
    500,
    {
      ...options,
      code:
        options.code ??
        "INTERNAL_SERVER_ERROR",
    }
  );
}


export function methodNotAllowedResponse(
  allowedMethods: string[] = [],
  options: ErrorResponseOptions = {}
): Response {
  const headers =
    new Headers(
      options.headers
    );

  if (
    allowedMethods.length > 0
  ) {
    headers.set(
      "Allow",
      allowedMethods
        .map(
          method =>
            toStringValue(
              method
            )
              .trim()
              .toUpperCase()
        )
        .filter(
          Boolean
        )
        .join(", ")
    );
  }

  return errorResponse(
    "Method not allowed",
    405,
    {
      ...options,
      headers,
      code:
        options.code ??
        "METHOD_NOT_ALLOWED",
    }
  );
}


// ============================================================
// REQUEST CONTEXT
// ============================================================

export function getRequestContext(
  request: Request
): RequestContext {
  const url =
    new URL(
      request.url
    );

  const requestId =
    request.headers.get(
      "X-Request-ID"
    )?.trim() ||
    crypto.randomUUID();

  const userAgent =
    request.headers.get(
      "User-Agent"
    ) ?? undefined;

  const ip =
    request.headers.get(
      "CF-Connecting-IP"
    ) ??
    request.headers.get(
      "X-Forwarded-For"
    ) ??
    undefined;

  return {
    requestId,
    method:
      request.method,
    path:
      url.pathname,
    url:
      request.url,
    userAgent,
    ip,
  };
}


// ============================================================
// RESPONSE HEADERS
// ============================================================

export function responseWithHeaders(
  response: Response,
  headers?: HeadersInit
): Response {
  const resultHeaders =
    new Headers(
      response.headers
    );

  if (headers) {
    const extraHeaders =
      new Headers(
        headers
      );

    extraHeaders.forEach(
      (
        value,
        key
      ) => {
        resultHeaders.set(
          key,
          safeHeaderValue(
            value
          )
        );
      }
    );
  }

  return new Response(
    response.body,
    {
      status:
        response.status,

      statusText:
        response.statusText,

      headers:
        resultHeaders,
    }
  );
}


export function withRequestId(
  response: Response,
  requestId: string
): Response {
  return responseWithHeaders(
    response,
    {
      "X-Request-ID":
        safeHeaderValue(
          requestId
        ),
    }
  );
}


export function withApiVersion(
  response: Response,
  version: string
): Response {
  return responseWithHeaders(
    response,
    {
      "X-API-Version":
        safeHeaderValue(
          version
        ),
    }
  );
}


export function withRateLimit(
  response: Response,
  options: RateLimitOptions
): Response {
  const headers:
    Record<string, string> = {
    "X-RateLimit-Limit":
      toStringValue(
        normalizeNonNegativeInteger(
          options.limit,
          0
        )
      ),

    "X-RateLimit-Remaining":
      toStringValue(
        normalizeNonNegativeInteger(
          options.remaining,
          0
        )
      ),
  };

  if (
    options.reset !== undefined
  ) {
    headers[
      "X-RateLimit-Reset"
    ] =
      toStringValue(
        normalizeNonNegativeInteger(
          options.reset,
          0
        )
      );
  }

  return responseWithHeaders(
    response,
    headers
  );
}


// ============================================================
// EMPTY / OPTIONS / REDIRECT
// ============================================================

export function noContentResponse(
  options: ResponseOptions = {}
): Response {
  const headers =
    createHeaders(
      undefined,
      {
        ...options,
        contentType:
          options.contentType ??
          "text/plain; charset=utf-8",
      }
    );

  return new Response(
    null,
    {
      status: 204,
      headers,
    }
  );
}


export function optionsResponse(
  request?: Request
): Response {
  const headers =
    createHeaders(
      request,
      {
        contentType:
          "text/plain; charset=utf-8",
      }
    );

  return new Response(
    null,
    {
      status: 204,
      headers,
    }
  );
}


export function redirectResponse(
  url: string,
  status = 302,
  options: ResponseOptions = {}
): Response {
  const headers =
    createHeaders(
      undefined,
      {
        ...options,
        contentType:
          "text/plain; charset=utf-8",
      }
    );

  headers.set(
    "Location",
    safeHeaderValue(
      url
    )
  );

  return new Response(
    null,
    {
      status:
        Math.max(
          300,
          Math.min(
            399,
            Math.floor(status)
          )
        ),

      statusText:
        options.statusText,

      headers,
    }
  );
}


// ============================================================
// TEXT / HTML
// ============================================================

export function textResponse(
  text: string,
  status = 200,
  options: ResponseOptions = {}
): Response {
  const headers =
    createHeaders(
      undefined,
      {
        ...options,

        contentType:
          options.contentType ??
          DEFAULT_TEXT_CONTENT_TYPE,
      }
    );

  return new Response(
    toStringValue(
      text
    ),
    {
      status:
        Math.max(
          100,
          Math.min(
            599,
            Math.floor(status)
          )
        ),

      statusText:
        options.statusText,

      headers,
    }
  );
}


export function htmlResponse(
  html: string,
  status = 200,
  options: ResponseOptions = {}
): Response {
  const headers =
    createHeaders(
      undefined,
      {
        ...options,

        contentType:
          DEFAULT_HTML_CONTENT_TYPE,
      }
    );

  return new Response(
    toStringValue(
      html
    ),
    {
      status:
        Math.max(
          100,
          Math.min(
            599,
            Math.floor(status)
          )
        ),

      statusText:
        options.statusText,

      headers,
    }
  );
}


// ============================================================
// REQUEST BODY
// ============================================================

export async function readJson<
  T = unknown
>(
  request: Request
): Promise<T> {
  const text =
    await request.text();

  if (!text.trim()) {
    throw new Error(
      "Request body is empty"
    );
  }

  try {
    return JSON.parse(
      text
    ) as T;
  } catch {
    throw new Error(
      "Invalid JSON"
    );
  }
}


export async function tryReadJson<
  T = unknown
>(
  request: Request
): Promise<T | null> {
  try {
    return await readJson<T>(
      request
    );
  } catch {
    return null;
  }
}


export function isJsonRequest(
  request: Request
): boolean {
  const contentType =
    request.headers.get(
      "Content-Type"
    ) ?? "";

  return contentType
    .toLowerCase()
    .includes(
      "application/json"
    );
}


// ============================================================
// ETAG
// ============================================================

export async function createEtag(
  data: unknown
): Promise<string> {
  const serialized =
    serializeJson(
      data
    );

  const bytes =
    new TextEncoder().encode(
      serialized
    );

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      bytes
    );

  const hashArray =
    Array.from(
      new Uint8Array(
        hashBuffer
      )
    );

  const hash =
    hashArray
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(
              2,
              "0"
            )
      )
      .join("");

  return `"${hash}"`;
}


export function isNotModified(
  request: Request,
  etag: string
): boolean {
  const ifNoneMatch =
    request.headers.get(
      "If-None-Match"
    );

  if (!ifNoneMatch) {
    return false;
  }

  const normalized =
    ifNoneMatch
      .split(",")
      .map(
        value =>
          value.trim()
      );

  return (
    normalized.includes(
      "*"
    ) ||
    normalized.includes(
      etag
    )
  );
}


export function notModifiedResponse(
  etag?: string
): Response {
  const headers =
    new Headers();

  headers.set(
    "Cache-Control",
    "no-store"
  );

  if (etag) {
    headers.set(
      "ETag",
      safeHeaderValue(
        etag
      )
    );
  }

  return new Response(
    null,
    {
      status: 304,
      headers,
    }
  );
}


// ============================================================
// ERROR NORMALIZATION
// ============================================================

function extractErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error
  ) {
    return (
      error.message ||
      "Internal server error"
    );
  }

  if (
    typeof error === "string"
  ) {
    return (
      error ||
      "Internal server error"
    );
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const object =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof object.message ===
      "string"
    ) {
      return (
        object.message ||
        "Internal server error"
      );
    }

    if (
      typeof object.error ===
      "string"
    ) {
      return (
        object.error ||
        "Internal server error"
      );
    }
  }

  return "Internal server error";
}


export function jsonErrorFromUnknown(
  error: unknown,
  requestId?: string
): Response {
  if (
    error instanceof Error
  ) {
    return serverErrorResponse(
      error.message ||
        "Internal server error",
      {
        requestId,
      }
    );
  }

  if (
    typeof error === "string"
  ) {
    return serverErrorResponse(
      error,
      {
        requestId,
      }
    );
  }

  return serverErrorResponse(
    extractErrorMessage(
      error
    ),
    {
      requestId,
      details:
        serialize(error),
    }
  );
}


// ============================================================
// TIMING
// ============================================================

export function addResponseTiming(
  response: Response,
  startedAt: number
): Response {
  const nowValue =
    performance.now();

  const elapsed =
    Math.max(
      0,
      Math.round(
        nowValue -
        startedAt
      )
    );

  return responseWithHeaders(
    response,
    {
      "Server-Timing":
        `app;dur=${elapsed}`,
    }
  );
}


// ============================================================
// CACHE HELPERS
// ============================================================

export function withCacheControl(
  response: Response,
  cacheControl: string
): Response {
  return responseWithHeaders(
    response,
    {
      "Cache-Control":
        safeHeaderValue(
          cacheControl
        ),
    }
  );
}


export function withETag(
  response: Response,
  etag: string
): Response {
  return responseWithHeaders(
    response,
    {
      ETag:
        safeHeaderValue(
          etag
        ),
    }
  );
}


// ============================================================
// REQUEST ID HELPER
// ============================================================

export function getRequestId(
  request: Request,
  fallback?: string
): string {
  return (
    request.headers.get(
      "X-Request-ID"
    )?.trim() ||
    fallback ||
    crypto.randomUUID()
  );
}


// ============================================================
// COMMON API RESPONSE
// ============================================================

export function createdResponse<T>(
  data: T,
  options: ResponseOptions = {}
): Response {
  return jsonResponse(
    data,
    201,
    options
  );
}


export function acceptedResponse<T>(
  data: T,
  options: ResponseOptions = {}
): Response {
  return jsonResponse(
    data,
    202,
    options
  );
}


export function partialContentResponse<T>(
  data: T,
  options: JsonResponseOptions = {}
): Response {
  return jsonResponse(
    data,
    206,
    options
  );
}


// ============================================================
// EXPORT ALIASES
// ============================================================

export const okResponse =
  successResponse;

export const badResponse =
  badRequestResponse;

export const unauthorized =
  unauthorizedResponse;

export const forbidden =
  forbiddenResponse;

export const notFound =
  notFoundResponse;

export const conflict =
  conflictResponse;

export const validationError =
  validationErrorResponse;

export const tooManyRequests =
  tooManyRequestsResponse;

export const internalServerError =
  serverErrorResponse;
