```ts
/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   RESPONSE UTILITY
   Cloudflare Workers / D1 compatible
   Version: 2026.09.09
   ============================================================ */

export interface RequestContext {
  requestId: string;
  ip?: string | null;
  userAgent?: string | null;
  country?: string | null;
  city?: string | null;
  colo?: string | null;
  method: string;
  url: string;
  path: string;
}

export interface ApiErrorDetails {
  code?: string;
  field?: string;
  fields?: Record<string, string>;
  details?: unknown;
  message?: string;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
    fields?: Record<string, string>;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
  requestId?: string;
}

/* ============================================================
   CORS
   ============================================================ */

export function corsHeaders(
  _request?: Request,
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, X-Request-ID, X-CSRF-Token, X-Visitor-ID, X-Session-ID, X-Client-Version, X-Admin-Session",
    "Access-Control-Max-Age": "86400",
  };
}

/* ============================================================
   HEADERS
   ============================================================ */

function createHeaders(
  extra?: HeadersInit,
): Headers {
  const headers = new Headers();

  headers.set(
    "Content-Type",
    "application/json; charset=utf-8",
  );

  headers.set(
    "Cache-Control",
    "no-store",
  );

  const cors = corsHeaders();

  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }

  if (extra) {
    const extraHeaders = new Headers(extra);

    extraHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

/* ============================================================
   SERIALIZATION
   ============================================================ */

function serialize(
  body: unknown,
): string {
  return JSON.stringify(
    body,
    (_key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

      return value;
    },
  );
}

/* ============================================================
   SUCCESS RESPONSE
   ============================================================ */

export function jsonResponse<T = unknown>(
  data: T,
  status = 200,
  options?: {
    requestId?: string;
    headers?: HeadersInit;
  },
): Response {
  const body: ApiResponseBody<T> = {
    success: true,
    data,
    ...(options?.requestId
      ? { requestId: options.requestId }
      : {}),
  };

  return new Response(
    serialize(body),
    {
      status,
      headers: createHeaders(options?.headers),
    },
  );
}

export function successResponse<T = unknown>(
  data: T,
  status = 200,
  headers?: HeadersInit,
  requestId?: string,
): Response {
  return jsonResponse(
    data,
    status,
    {
      headers,
      requestId,
    },
  );
}

/* ============================================================
   ERROR RESPONSE
   ============================================================ */

export function errorResponse(
  message: string,
  status = 500,
  options?: {
    requestId?: string;
    details?: unknown;
    code?: string;
    headers?: HeadersInit;
  },
): Response {
  const body: ApiResponseBody = {
    success: false,
    error: {
      code:
        options?.code ??
        defaultErrorCode(status),
      message,
      ...(options?.details !== undefined
        ? {
            details: options.details,
          }
        : {}),
    },
    ...(options?.requestId
      ? {
          requestId: options.requestId,
        }
      : {}),
  };

  return new Response(
    serialize(body),
    {
      status,
      headers: createHeaders(options?.headers),
    },
  );
}

function defaultErrorCode(
  status: number,
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

    case 429:
      return "RATE_LIMITED";

    case 500:
      return "INTERNAL_ERROR";

    case 502:
      return "BAD_GATEWAY";

    case 503:
      return "SERVICE_UNAVAILABLE";

    default:
      return `HTTP_${status}`;
  }
}

/* ============================================================
   COMMON ERROR HELPERS
   ============================================================ */

export function badRequestResponse(
  message = "Некорректный запрос",
  details?: unknown,
  requestId?: string,
): Response {
  return errorResponse(
    message,
    400,
    {
      code: "BAD_REQUEST",
      details,
      requestId,
    },
  );
}

export function unauthorizedResponse(
  message = "Требуется авторизация",
  requestId?: string,
): Response {
  return errorResponse(
    message,
    401,
    {
      code: "UNAUTHORIZED",
      requestId,
    },
  );
}

export function forbiddenResponse(
  message = "Доступ запрещён",
  requestId?: string,
): Response {
  return errorResponse(
    message,
    403,
    {
      code: "FORBIDDEN",
      requestId,
    },
  );
}

export function notFoundResponse(
  message = "Ресурс не найден",
  requestId?: string,
): Response {
  return errorResponse(
    message,
    404,
    {
      code: "NOT_FOUND",
      requestId,
    },
  );
}

export function conflictResponse(
  message = "Конфликт данных",
  details?: unknown,
  requestId?: string,
): Response {
  return errorResponse(
    message,
    409,
    {
      code: "CONFLICT",
      details,
      requestId,
    },
  );
}

export function tooManyRequestsResponse(
  message = "Слишком много запросов",
  requestId?: string,
): Response {
  return errorResponse(
    message,
    429,
    {
      code: "RATE_LIMITED",
      requestId,
    },
  );
}

export function serverErrorResponse(
  message = "Внутренняя ошибка сервера",
  details?: unknown,
  requestId?: string,
): Response {
  return errorResponse(
    message,
    500,
    {
      code: "INTERNAL_ERROR",
      details,
      requestId,
    },
  );
}

export function methodNotAllowedResponse(
  allowedMethods: string[] = ["GET"],
  requestId?: string,
): Response {
  return errorResponse(
    "Метод запроса не поддерживается",
    405,
    {
      code: "METHOD_NOT_ALLOWED",
      details: {
        allowedMethods,
      },
      headers: {
        Allow: allowedMethods.join(", "),
      },
      requestId,
    },
  );
}

/* ============================================================
   REQUEST CONTEXT
   ============================================================ */

export function getRequestContext(
  request: Request,
): RequestContext {
  const url = new URL(request.url);

  const cf = (
    request as Request & {
      cf?: Record<string, unknown>;
    }
  ).cf;

  const requestId =
    request.headers.get("X-Request-ID") ??
    crypto.randomUUID();

  return {
    requestId,

    ip:
      request.headers.get(
        "CF-Connecting-IP",
      ) ??
      request.headers.get(
        "X-Forwarded-For",
      ),

    userAgent:
      request.headers.get(
        "User-Agent",
      ),

    country:
      typeof cf?.country === "string"
        ? cf.country
        : null,

    city:
      typeof cf?.city === "string"
        ? cf.city
        : null,

    colo:
      typeof cf?.colo === "string"
        ? cf.colo
        : null,

    method:
      request.method.toUpperCase(),

    url: request.url,

    path: url.pathname,
  };
}

/* ============================================================
   RESPONSE HEADER MERGING
   ============================================================ */

export function responseWithHeaders(
  response: Response,
  headers?: HeadersInit,
): Response {
  const merged = new Headers(
    response.headers,
  );

  const cors = corsHeaders();

  for (const [key, value] of Object.entries(cors)) {
    if (!merged.has(key)) {
      merged.set(key, value);
    }
  }

  if (headers) {
    const extra = new Headers(headers);

    extra.forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers: merged,
    },
  );
}

/* ============================================================
   JSON REQUEST
   ============================================================ */

export async function readJson<T = unknown>(
  request: Request,
): Promise<T> {
  const contentType =
    request.headers.get("Content-Type") ?? "";

  if (
    contentType &&
    !contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    throw new Error(
      "Expected application/json",
    );
  }

  const text = await request.text();

  if (!text.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      "Invalid JSON body",
    );
  }
}

/* ============================================================
   JSON REQUEST DETECTION
   ============================================================ */

export function isJsonRequest(
  request: Request,
): boolean {
  const contentType =
    request.headers.get("Content-Type") ?? "";

  return contentType
    .toLowerCase()
    .includes("application/json");
}

/* ============================================================
   REQUEST ID
   ============================================================ */

export function withRequestId(
  response: Response,
  requestId: string,
): Response {
  return responseWithHeaders(
    response,
    {
      "X-Request-ID": requestId,
    },
  );
}

/* ============================================================
   NO CONTENT
   ============================================================ */

export function noContentResponse(
  headers?: HeadersInit,
): Response {
  const merged = createHeaders(headers);

  merged.delete("Content-Type");

  return new Response(null, {
    status: 204,
    headers: merged,
  });
}

/* ============================================================
   REDIRECT
   ============================================================ */

export function redirectResponse(
  location: string,
  status:
    | 301
    | 302
    | 303
    | 307
    | 308 = 302,
): Response {
  const headers = createHeaders();

  headers.delete("Content-Type");

  headers.set(
    "Location",
    location,
  );

  return new Response(null, {
    status,
    headers,
  });
}

/* ============================================================
   END
   ============================================================ */
```
