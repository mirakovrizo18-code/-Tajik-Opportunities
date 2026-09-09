// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// RESPONSE UTILITIES
// Version: 2026.09.09
//
// Единый интерфейс ответов Worker:
// • JSON
// • ошибки
// • 404
// • 405
// • CORS
// • RequestContext
// • request ID
// • security headers
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface RequestContext {
  requestId: string;

  ip: string | null;
  userAgent: string | null;

  locale: string | null;

  visitorId: string | null;
  sessionId: string | null;
  userId: string | null;
  adminId: string | null;

  method: string;
  path: string;
  url: string;

  timestamp: string;
}

export interface ResponseOptions {
  requestId?: string;

  headers?:
    | HeadersInit;

  details?: unknown;

  code?: string;

  success?: boolean;

  meta?: unknown;
}

export interface ErrorResponseOptions
  extends ResponseOptions {
  code?: string;
}

// ============================================================
// CORS
// ============================================================

export function corsHeaders(
  request?: Request,
): Record<string, string> {
  const origin =
    request?.headers.get(
      "Origin",
    ) ?? "*";

  return {
    "Access-Control-Allow-Origin":
      origin,

    "Access-Control-Allow-Methods":
      "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, X-Request-ID, Accept, Accept-Language",

    "Access-Control-Expose-Headers":
      "X-Request-ID, X-Tajik-Opportunities-Version",

    "Access-Control-Allow-Credentials":
      origin === "*"
        ? "false"
        : "true",

    "Access-Control-Max-Age":
      "86400",

    Vary:
      "Origin",
  };
}

// ============================================================
// REQUEST ID
// ============================================================

export function getRequestId(
  request?: Request,
): string {
  const existing =
    request?.headers.get(
      "X-Request-ID",
    );

  if (
    existing &&
    existing.trim().length > 0 &&
    existing.length <= 128
  ) {
    return existing.trim();
  }

  return crypto.randomUUID();
}

// ============================================================
// REQUEST CONTEXT
// ============================================================

export function getRequestContext(
  request: Request,
): RequestContext {
  const url =
    new URL(
      request.url,
    );

  const requestId =
    getRequestId(
      request,
    );

  const ip =
    request.headers.get(
      "CF-Connecting-IP",
    ) ??
    request.headers.get(
      "X-Forwarded-For",
    ) ??
    null;

  const userAgent =
    request.headers.get(
      "User-Agent",
    ) ?? null;

  const localeHeader =
    request.headers.get(
      "Accept-Language",
    );

  const locale =
    localeHeader
      ?.split(",")[0]
      ?.trim()
      ?.toLowerCase() ??
    null;

  const visitorId =
    request.headers.get(
      "X-Visitor-ID",
    ) ?? null;

  const sessionId =
    request.headers.get(
      "X-Session-ID",
    ) ?? null;

  const userId =
    request.headers.get(
      "X-User-ID",
    ) ?? null;

  const adminId =
    request.headers.get(
      "X-Admin-ID",
    ) ?? null;

  return {
    requestId,

    ip,
    userAgent,

    locale,

    visitorId,
    sessionId,
    userId,
    adminId,

    method:
      request.method.toUpperCase(),

    path:
      url.pathname,

    url:
      request.url,

    timestamp:
      new Date().toISOString(),
  };
}

// ============================================================
// HEADER BUILDER
// ============================================================

function createHeaders(
  request?: Request,
  additional?: HeadersInit,
): Headers {
  const headers =
    new Headers();

  const cors =
    corsHeaders(
      request,
    );

  for (
    const [key, value]
    of Object.entries(
      cors,
    )
  ) {
    headers.set(
      key,
      value,
    );
  }

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8",
  );

  headers.set(
    "Cache-Control",
    "no-store",
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  headers.set(
    "X-Frame-Options",
    "SAMEORIGIN",
  );

  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  if (additional) {
    const extra =
      new Headers(
        additional,
      );

    extra.forEach(
      (
        value,
        key,
      ) => {
        headers.set(
          key,
          value,
        );
      },
    );
  }

  return headers;
}

// ============================================================
// SERIALIZE
// ============================================================

function serialize(
  value: unknown,
): string {
  return JSON.stringify(
    value,
    (
      _key,
      current,
    ) => {
      if (
        typeof current ===
        "bigint"
      ) {
        return current.toString();
      }

      return current;
    },
  );
}

// ============================================================
// JSON RESPONSE
// ============================================================

export function jsonResponse(
  data: unknown,
  status = 200,
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  let requestId:
    | string
    | undefined;

  let headersInit:
    | HeadersInit
    | undefined;

  let meta:
    | unknown
    | undefined;

  if (
    options &&
    !Array.isArray(
      options,
    ) &&
    typeof options ===
      "object"
  ) {
    if (
      "requestId" in
      options ||
      "details" in
      options ||
      "code" in
      options ||
      "success" in
      options ||
      "meta" in
      options
    ) {
      const responseOptions =
        options as ResponseOptions;

      requestId =
        responseOptions.requestId;

      headersInit =
        responseOptions.headers;

      meta =
        responseOptions.meta;
    } else {
      headersInit =
        options as HeadersInit;
    }
  }

  const body =
    meta === undefined
      ? data
      : {
          data,
          meta,
        };

  const headers =
    createHeaders(
      undefined,
      headersInit,
    );

  if (requestId) {
    headers.set(
      "X-Request-ID",
      requestId,
    );
  }

  return new Response(
    serialize(body),
    {
      status,
      headers,
    },
  );
}

// ============================================================
// ERROR RESPONSE
// ============================================================

export function errorResponse(
  message:
    | string
    | unknown,
  status = 500,
  options?:
    | ErrorResponseOptions
    | HeadersInit,
): Response {
  let requestId:
    | string
    | undefined;

  let code:
    | string
    | undefined;

  let details:
    | unknown
    | undefined;

  let headersInit:
    | HeadersInit
    | undefined;

  if (
    options &&
    !Array.isArray(
      options,
    ) &&
    typeof options ===
      "object"
  ) {
    if (
      "requestId" in
      options ||
      "details" in
      options ||
      "code" in
      options ||
      "success" in
      options
    ) {
      const responseOptions =
        options as ErrorResponseOptions;

      requestId =
        responseOptions.requestId;

      code =
        responseOptions.code;

      details =
        responseOptions.details;

      headersInit =
        responseOptions.headers;
    } else {
      headersInit =
        options as HeadersInit;
    }
  }

  const body: {
    ok: false;
    error: string;
    code?: string;
    details?: unknown;
    requestId?: string;
  } = {
    ok: false,

    error:
      message instanceof Error
        ? message.message
        : String(message),
  };

  if (code) {
    body.code =
      code;
  }

  if (
    details !== undefined
  ) {
    body.details =
      details;
  }

  if (requestId) {
    body.requestId =
      requestId;
  }

  const headers =
    createHeaders(
      undefined,
      headersInit,
    );

  if (requestId) {
    headers.set(
      "X-Request-ID",
      requestId,
    );
  }

  return new Response(
    serialize(body),
    {
      status,
      headers,
    },
  );
}

// ============================================================
// 400
// ============================================================

export function badRequestResponse(
  message =
    "Bad request",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    400,
    options,
  );
}

// ============================================================
// 401
// ============================================================

export function unauthorizedResponse(
  message =
    "Unauthorized",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    401,
    options,
  );
}

// ============================================================
// 403
// ============================================================

export function forbiddenResponse(
  message =
    "Forbidden",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    403,
    options,
  );
}

// ============================================================
// 404
// ============================================================

export function notFoundResponse(
  message =
    "Not found",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    404,
    options,
  );
}

// ============================================================
// 405
// ============================================================

export function methodNotAllowedResponse(
  message =
    "Method not allowed",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  const response =
    errorResponse(
      message,
      405,
      options,
    );

  response.headers.set(
    "Allow",
    "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  return response;
}

// ============================================================
// 409
// ============================================================

export function conflictResponse(
  message =
    "Conflict",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    409,
    options,
  );
}

// ============================================================
// 422
// ============================================================

export function validationErrorResponse(
  message =
    "Validation failed",
  details?:
    unknown,
  options?:
    ResponseOptions,
): Response {
  return errorResponse(
    message,
    422,
    {
      ...options,
      details,
    },
  );
}

// ============================================================
// 429
// ============================================================

export function rateLimitResponse(
  message =
    "Too many requests",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    429,
    options,
  );
}

// ============================================================
// 500
// ============================================================

export function internalServerErrorResponse(
  message =
    "Internal server error",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    500,
    options,
  );
}

// ============================================================
// 503
// ============================================================

export function serviceUnavailableResponse(
  message =
    "Service unavailable",
  options?:
    | ResponseOptions
    | HeadersInit,
): Response {
  return errorResponse(
    message,
    503,
    options,
  );
}

// ============================================================
// SUCCESS HELPERS
// ============================================================

export function successResponse(
  data: unknown,
  status = 200,
  options?: ResponseOptions,
): Response {
  return jsonResponse(
    {
      ok: true,
      data,
    },
    status,
    options,
  );
}

export function createdResponse(
  data: unknown,
  options?: ResponseOptions,
): Response {
  return successResponse(
    data,
    201,
    options,
  );
}

export function noContentResponse(
  request?: Request,
): Response {
  const headers =
    createHeaders(
      request,
    );

  return new Response(
    null,
    {
      status: 204,
      headers,
    },
  );
}

// ============================================================
// RESPONSE WITH REQUEST ID
// ============================================================

export function addRequestId(
  response: Response,
  requestId: string,
): Response {
  const headers =
    new Headers(
      response.headers,
    );

  headers.set(
    "X-Request-ID",
    requestId,
  );

  return new Response(
    response.body,
    {
      status:
        response.status,

      statusText:
        response.statusText,

      headers,
    },
  );
}

// ============================================================
// DEFAULT
// ============================================================

export default {
  corsHeaders,
  getRequestId,
  getRequestContext,

  jsonResponse,
  errorResponse,

  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  methodNotAllowedResponse,
  conflictResponse,
  validationErrorResponse,
  rateLimitResponse,
  internalServerErrorResponse,
  serviceUnavailableResponse,

  successResponse,
  createdResponse,
  noContentResponse,

  addRequestId,
};
