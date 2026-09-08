// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// API RESPONSE UTILITIES
// Version: 2026.09
// ============================================================

import type { ApiResponse, Pagination } from "../types";

// ============================================================
// TYPES
// ============================================================

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ErrorDetails {
  code?: string;
  field?: string;
  fields?: Record<string, string>;
  details?: unknown;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ============================================================
// DEFAULT HEADERS
// ============================================================

function baseHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}

// ============================================================
// JSON RESPONSE
// ============================================================

export function json<T>(
  data: T,
  status = 200,
  headers: HeadersInit = {}
): Response {
  const responseHeaders = new Headers(
    baseHeaders()
  );

  const extraHeaders = new Headers(headers);

  extraHeaders.forEach(
    (value, key) => {
      responseHeaders.set(key, value);
    }
  );

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: responseHeaders,
    }
  );
}

// ============================================================
// SUCCESS
// ============================================================

export function success<T>(
  data: T,
  status = 200,
  meta?: ResponseMeta,
  headers: HeadersInit = {}
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    (
      response as ApiResponse<T> & {
        meta?: ResponseMeta;
      }
    ).meta = meta;
  }

  return json(
    response,
    status,
    headers
  );
}

// ============================================================
// CREATED
// ============================================================

export function created<T>(
  data: T,
  meta?: ResponseMeta,
  headers: HeadersInit = {}
): Response {
  return success(
    data,
    201,
    meta,
    headers
  );
}

// ============================================================
// NO CONTENT
// ============================================================

export function noContent(
  headers: HeadersInit = {}
): Response {
  const responseHeaders =
    new Headers(headers);

  return new Response(null, {
    status: 204,
    headers: responseHeaders,
  });
}

// ============================================================
// ERROR
// ============================================================

export function error(
  message: string,
  status = 500,
  details?: ErrorDetails,
  headers: HeadersInit = {}
): Response {
  const body: ApiResponse<null> & {
    error?: {
      message: string;
      code?: string;
      field?: string;
      fields?: Record<
        string,
        string
      >;
      details?: unknown;
    };
  } = {
    success: false,
    data: null,
    error: {
      message,
      ...details,
    },
  };

  return json(
    body,
    status,
    headers
  );
}

// ============================================================
// COMMON ERRORS
// ============================================================

export function badRequest(
  message = "Некорректный запрос",
  details?: ErrorDetails
): Response {
  return error(
    message,
    400,
    details
  );
}

export function unauthorized(
  message = "Требуется авторизация",
  details?: ErrorDetails
): Response {
  return error(
    message,
    401,
    details
  );
}

export function forbidden(
  message = "Доступ запрещён",
  details?: ErrorDetails
): Response {
  return error(
    message,
    403,
    details
  );
}

export function notFound(
  message = "Ресурс не найден",
  details?: ErrorDetails
): Response {
  return error(
    message,
    404,
    details
  );
}

export function methodNotAllowed(
  message = "Метод не поддерживается",
  details?: ErrorDetails
): Response {
  return error(
    message,
    405,
    details
  );
}

export function conflict(
  message = "Конфликт данных",
  details?: ErrorDetails
): Response {
  return error(
    message,
    409,
    details
  );
}

export function tooManyRequests(
  message = "Слишком много запросов",
  details?: ErrorDetails,
  retryAfter?: number
): Response {
  const headers: Record<
    string,
    string
  > = {};

  if (
    retryAfter !== undefined
  ) {
    headers[
      "Retry-After"
    ] = String(retryAfter);
  }

  return error(
    message,
    429,
    details,
    headers
  );
}

export function serverError(
  message = "Внутренняя ошибка сервера",
  details?: ErrorDetails
): Response {
  return error(
    message,
    500,
    details
  );
}

export function serviceUnavailable(
  message = "Сервис временно недоступен",
  details?: ErrorDetails
): Response {
  return error(
    message,
    503,
    details
  );
}

// ============================================================
// PAGINATION
// ============================================================

export function paginated<T>(
  items: T[],
  pagination: Pagination,
  meta?: ResponseMeta,
  status = 200
): Response {
  return success(
    {
      items,
      pagination,
    },
    status,
    meta
  );
}

// ============================================================
// PAGINATION BUILDER
// ============================================================

export function createPagination(
  page: number,
  limit: number,
  total: number
): Pagination {
  const safePage =
    Number.isInteger(page) &&
    page > 0
      ? page
      : 1;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0
      ? limit
      : 20;

  const safeTotal =
    Number.isInteger(total) &&
    total >= 0
      ? total
      : 0;

  const totalPages =
    safeTotal === 0
      ? 0
      : Math.ceil(
          safeTotal /
            safeLimit
        );

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    total_pages: totalPages,
    has_next:
      safePage <
      totalPages,
    has_previous:
      safePage > 1,
  };
}

// ============================================================
// RESPONSE WITH REQUEST ID
// ============================================================

export function withRequestId(
  response: Response,
  requestId: string
): Response {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "X-Request-ID",
    requestId
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

// ============================================================
// RESPONSE WITH SECURITY HEADERS
// ============================================================

export function withSecurityHeaders(
  response: Response
): Response {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  headers.set(
    "X-Frame-Options",
    "DENY"
  );

  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

// ============================================================
// CORS
// ============================================================

export function withCors(
  response: Response,
  origin = "*"
): Response {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "Access-Control-Allow-Origin",
    origin
  );

  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Request-ID, X-CSRF-Token, X-Admin-Token"
  );

  headers.set(
    "Access-Control-Expose-Headers",
    "X-Request-ID, Retry-After"
  );

  if (
    origin !== "*"
  ) {
    headers.set(
      "Vary",
      "Origin"
    );
  }

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

// ============================================================
// CACHE CONTROL
// ============================================================

export function noStore(
  response: Response
): Response {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  headers.set(
    "Pragma",
    "no-cache"
  );

  headers.set(
    "Expires",
    "0"
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

export function publicCache(
  response: Response,
  maxAge: number
): Response {
  const safeMaxAge =
    Number.isInteger(maxAge) &&
    maxAge >= 0
      ? maxAge
      : 60;

  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "Cache-Control",
    `public, max-age=${safeMaxAge}`
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText:
        response.statusText,
      headers,
    }
  );
}

// ============================================================
// REDIRECT
// ============================================================

export function redirect(
  url: string,
  status:
    | 301
    | 302
    | 303
    | 307
    | 308 = 302
): Response {
  return new Response(
    null,
    {
      status,
      headers: {
        Location: url,
      },
    }
  );
}

// ============================================================
// FILE RESPONSE
// ============================================================

export function file(
  body: BodyInit,
  contentType: string,
  options: {
    status?: number;
    fileName?: string;
    cacheControl?: string;
  } = {}
): Response {
  const headers =
    new Headers();

  headers.set(
    "Content-Type",
    contentType
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  if (
    options.fileName
  ) {
    const safeName =
      options.fileName
        .replace(
          /["\r\n]/g,
          ""
        );

    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeName}"`
    );
  }

  if (
    options.cacheControl
  ) {
    headers.set(
      "Cache-Control",
      options.cacheControl
    );
  } else {
    headers.set(
      "Cache-Control",
      "no-store"
    );
  }

  return new Response(
    body,
    {
      status:
        options.status ?? 200,
      headers,
    }
  );
}

// ============================================================
// TEXT RESPONSE
// ============================================================

export function text(
  value: string,
  status = 200,
  headers: HeadersInit = {}
): Response {
  const responseHeaders =
    new Headers();

  responseHeaders.set(
    "Content-Type",
    "text/plain; charset=utf-8"
  );

  const extra =
    new Headers(headers);

  extra.forEach(
    (headerValue, key) => {
      responseHeaders.set(
        key,
        headerValue
      );
    }
  );

  return new Response(
    value,
    {
      status,
      headers:
        responseHeaders,
    }
  );
}

// ============================================================
// HTML RESPONSE
// ============================================================

export function html(
  value: string,
  status = 200,
  headers: HeadersInit = {}
): Response {
  const responseHeaders =
    new Headers();

  responseHeaders.set(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  responseHeaders.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  const extra =
    new Headers(headers);

  extra.forEach(
    (headerValue, key) => {
      responseHeaders.set(
        key,
        headerValue
      );
    }
  );

  return new Response(
    value,
    {
      status,
      headers:
        responseHeaders,
    }
  );
}

// ============================================================
// STREAM RESPONSE
// ============================================================

export function stream(
  body: ReadableStream,
  contentType =
    "application/octet-stream",
  headers: HeadersInit = {}
): Response {
  const responseHeaders =
    new Headers();

  responseHeaders.set(
    "Content-Type",
    contentType
  );

  responseHeaders.set(
    "Cache-Control",
    "no-store"
  );

  const extra =
    new Headers(headers);

  extra.forEach(
    (headerValue, key) => {
      responseHeaders.set(
        key,
        headerValue
      );
    }
  );

  return new Response(
    body,
    {
      status: 200,
      headers:
        responseHeaders,
    }
  );
}

// ============================================================
// OPTIONS / CORS PREFLIGHT
// ============================================================

export function options(
  origin = "*"
): Response {
  return new Response(
    null,
    {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":
          origin,
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Request-ID, X-CSRF-Token, X-Admin-Token",
        "Access-Control-Max-Age":
          "86400",
      },
    }
  );
}

// ============================================================
// ERROR FROM UNKNOWN EXCEPTION
// ============================================================

export function fromException(
  exception: unknown,
  fallback =
    "Внутренняя ошибка сервера"
): Response {
  if (
    exception instanceof Response
  ) {
    return exception;
  }

  if (
    exception instanceof Error
  ) {
    return serverError(
      fallback,
      {
        code:
          "INTERNAL_ERROR",
        details:
          exception.message,
      }
    );
  }

  return serverError(
    fallback,
    {
      code:
        "UNKNOWN_ERROR",
    }
  );
}

// ============================================================
// END
// ============================================================
