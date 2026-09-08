// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// REQUEST UTILITIES
// Version: 2026.09
// ============================================================

import {
  createRequestId,
} from "./id";

// ============================================================
// TYPES
// ============================================================

export interface RequestContext {
  request: Request;
  requestId: string;
  url: URL;
  method: string;
  path: string;
  pathname: string;
  origin: string | null;
  userAgent: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  cfRay: string | null;
  contentType: string | null;
  contentLength: number | null;
}

export interface ParsedBody<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  offset: number;
}

export interface RequestHeaders {
  authorization: string | null;
  adminToken: string | null;
  csrfToken: string | null;
  requestId: string | null;
  contentType: string | null;
  userAgent: string | null;
  referer: string | null;
  origin: string | null;
}

// ============================================================
// REQUEST ID
// ============================================================

export function getRequestId(
  request: Request
): string {
  const existing =
    request.headers.get(
      "X-Request-ID"
    );

  if (
    existing &&
    existing.length <= 256
  ) {
    return existing;
  }

  return createRequestId();
}

// ============================================================
// URL
// ============================================================

export function getUrl(
  request: Request
): URL {
  return new URL(
    request.url
  );
}

export function getPath(
  request: Request
): string {
  return getUrl(request).pathname;
}

export function getPathSegments(
  request: Request
): string[] {
  return getPath(request)
    .split("/")
    .filter(Boolean);
}

// ============================================================
// METHOD
// ============================================================

export function getMethod(
  request: Request
): string {
  return request.method.toUpperCase();
}

export function isMethod(
  request: Request,
  method: string
): boolean {
  return (
    getMethod(request) ===
    method.toUpperCase()
  );
}

export function isGet(
  request: Request
): boolean {
  return isMethod(
    request,
    "GET"
  );
}

export function isPost(
  request: Request
): boolean {
  return isMethod(
    request,
    "POST"
  );
}

export function isPut(
  request: Request
): boolean {
  return isMethod(
    request,
    "PUT"
  );
}

export function isPatch(
  request: Request
): boolean {
  return isMethod(
    request,
    "PATCH"
  );
}

export function isDelete(
  request: Request
): boolean {
  return isMethod(
    request,
    "DELETE"
  );
}

export function isOptions(
  request: Request
): boolean {
  return isMethod(
    request,
    "OPTIONS"
  );
}

// ============================================================
// HEADERS
// ============================================================

export function getHeaders(
  request: Request
): RequestHeaders {
  return {
    authorization:
      request.headers.get(
        "Authorization"
      ),
    adminToken:
      request.headers.get(
        "X-Admin-Token"
      ),
    csrfToken:
      request.headers.get(
        "X-CSRF-Token"
      ),
    requestId:
      request.headers.get(
        "X-Request-ID"
      ),
    contentType:
      request.headers.get(
        "Content-Type"
      ),
    userAgent:
      request.headers.get(
        "User-Agent"
      ),
    referer:
      request.headers.get(
        "Referer"
      ),
    origin:
      request.headers.get(
        "Origin"
      ),
  };
}

// ============================================================
// AUTHORIZATION
// ============================================================

export function getAuthorization(
  request: Request
): string | null {
  return request.headers.get(
    "Authorization"
  );
}

export function getBearerToken(
  request: Request
): string | null {
  const authorization =
    getAuthorization(request);

  if (!authorization) {
    return null;
  }

  const match =
    authorization.match(
      /^Bearer\s+(.+)$/i
    );

  if (!match) {
    return null;
  }

  const token =
    match[1].trim();

  return token || null;
}

export function getAdminToken(
  request: Request
): string | null {
  const headerToken =
    request.headers.get(
      "X-Admin-Token"
    );

  if (
    headerToken &&
    headerToken.trim()
  ) {
    return headerToken.trim();
  }

  return getBearerToken(
    request
  );
}

// ============================================================
// QUERY PARAMS
// ============================================================

export function getQueryParam(
  request: Request,
  name: string
): string | null {
  return getUrl(request)
    .searchParams
    .get(name);
}

export function getQueryParams(
  request: Request
): URLSearchParams {
  return getUrl(request)
    .searchParams;
}

export function getAllQueryParams(
  request: Request,
  name: string
): string[] {
  return getUrl(request)
    .searchParams
    .getAll(name);
}

export function hasQueryParam(
  request: Request,
  name: string
): boolean {
  return getUrl(request)
    .searchParams
    .has(name);
}

export function getStringQuery(
  request: Request,
  name: string,
  fallback = ""
): string {
  return (
    getQueryParam(
      request,
      name
    ) ?? fallback
  );
}

export function getOptionalStringQuery(
  request: Request,
  name: string
): string | null {
  const value =
    getQueryParam(
      request,
      name
    );

  if (
    value === null
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

// ============================================================
// NUMBER QUERY
// ============================================================

export function getNumberQuery(
  request: Request,
  name: string,
  fallback: number
): number {
  const value =
    getQueryParam(
      request,
      name
    );

  if (
    value === null ||
    value.trim() === ""
  ) {
    return fallback;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

export function getIntegerQuery(
  request: Request,
  name: string,
  fallback: number
): number {
  const number =
    getNumberQuery(
      request,
      name,
      fallback
    );

  return Number.isInteger(
    number
  )
    ? number
    : fallback;
}

export function getPositiveIntegerQuery(
  request: Request,
  name: string,
  fallback: number
): number {
  const number =
    getIntegerQuery(
      request,
      name,
      fallback
    );

  return number > 0
    ? number
    : fallback;
}

// ============================================================
// BOOLEAN QUERY
// ============================================================

export function getBooleanQuery(
  request: Request,
  name: string,
  fallback = false
): boolean {
  const value =
    getQueryParam(
      request,
      name
    );

  if (
    value === null
  ) {
    return fallback;
  }

  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "true":
    case "1":
    case "yes":
    case "on":
      return true;

    case "false":
    case "0":
    case "no":
    case "off":
      return false;

    default:
      return fallback;
  }
}

// ============================================================
// PAGINATION
// ============================================================

export function getPagination(
  request: Request,
  defaults: {
    page?: number;
    limit?: number;
    maxLimit?: number;
  } = {}
): PaginationQuery {
  const defaultPage =
    defaults.page ?? 1;

  const defaultLimit =
    defaults.limit ?? 20;

  const maxLimit =
    defaults.maxLimit ?? 100;

  const page =
    getPositiveIntegerQuery(
      request,
      "page",
      defaultPage
    );

  const requestedLimit =
    getPositiveIntegerQuery(
      request,
      "limit",
      defaultLimit
    );

  const limit =
    Math.min(
      requestedLimit,
      maxLimit
    );

  const offset =
    (page - 1) *
    limit;

  return {
    page,
    limit,
    offset,
  };
}

// ============================================================
// BODY
// ============================================================

export async function readTextBody(
  request: Request,
  maxBytes = 1024 * 1024
): Promise<ParsedBody<string>> {
  try {
    const contentLength =
      request.headers.get(
        "Content-Length"
      );

    if (
      contentLength
    ) {
      const length =
        Number(contentLength);

      if (
        Number.isFinite(length) &&
        length > maxBytes
      ) {
        return {
          success: false,
          data: null,
          error:
            "Размер запроса слишком большой",
        };
      }
    }

    const text =
      await request.text();

    if (
      new TextEncoder()
        .encode(text)
        .byteLength >
      maxBytes
    ) {
      return {
        success: false,
        data: null,
        error:
          "Размер запроса слишком большой",
      };
    }

    return {
      success: true,
      data: text,
      error: null,
    };
  } catch {
    return {
      success: false,
      data: null,
      error:
        "Не удалось прочитать тело запроса",
    };
  }
}

// ============================================================
// JSON BODY
// ============================================================

export async function readJsonBody<T = unknown>(
  request: Request,
  maxBytes = 1024 * 1024
): Promise<ParsedBody<T>> {
  try {
    const contentType =
      request.headers.get(
        "Content-Type"
      );

    if (
      contentType &&
      !contentType
        .toLowerCase()
        .includes(
          "application/json"
        )
    ) {
      return {
        success: false,
        data: null,
        error:
          "Ожидается JSON-запрос",
      };
    }

    const body =
      await readTextBody(
        request,
        maxBytes
      );

    if (
      !body.success ||
      body.data === null
    ) {
      return {
        success: false,
        data: null,
        error:
          body.error ??
          "Пустое тело запроса",
      };
    }

    if (
      !body.data.trim()
    ) {
      return {
        success: false,
        data: null,
        error:
          "Тело запроса пустое",
      };
    }

    try {
      const parsed =
        JSON.parse(
          body.data
        ) as T;

      return {
        success: true,
        data: parsed,
        error: null,
      };
    } catch {
      return {
        success: false,
        data: null,
        error:
          "Некорректный JSON",
      };
    }
  } catch {
    return {
      success: false,
      data: null,
      error:
        "Не удалось обработать JSON",
    };
  }
}

// ============================================================
// FORM DATA
// ============================================================

export async function readFormData(
  request: Request
): Promise<
  | {
      success: true;
      data: FormData;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: string;
    }
> {
  try {
    const formData =
      await request.formData();

    return {
      success: true,
      data: formData,
      error: null,
    };
  } catch {
    return {
      success: false,
      data: null,
      error:
        "Не удалось обработать FormData",
    };
  }
}

// ============================================================
// COOKIE
// ============================================================

export function getCookie(
  request: Request,
  name: string
): string | null {
  const header =
    request.headers.get(
      "Cookie"
    );

  if (!header) {
    return null;
  }

  const cookies =
    header.split(";");

  for (
    const cookie of cookies
  ) {
    const index =
      cookie.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key =
      cookie
        .slice(0, index)
        .trim();

    if (
      key !== name
    ) {
      continue;
    }

    return decodeURIComponent(
      cookie
        .slice(index + 1)
        .trim()
    );
  }

  return null;
}

export function getCookies(
  request: Request
): Record<string, string> {
  const header =
    request.headers.get(
      "Cookie"
    );

  const result: Record<
    string,
    string
  > = {};

  if (!header) {
    return result;
  }

  for (
    const cookie of header.split(";")
  ) {
    const index =
      cookie.indexOf("=");

    if (index === -1) {
      continue;
    }

    const key =
      cookie
        .slice(0, index)
        .trim();

    const value =
      cookie
        .slice(index + 1)
        .trim();

    if (!key) {
      continue;
    }

    try {
      result[key] =
        decodeURIComponent(
          value
        );
    } catch {
      result[key] =
        value;
    }
  }

  return result;
}

// ============================================================
// CLIENT IP
// ============================================================

export function getClientIp(
  request: Request
): string | null {
  const cfConnectingIp =
    request.headers.get(
      "CF-Connecting-IP"
    );

  if (
    cfConnectingIp
  ) {
    return cfConnectingIp.trim();
  }

  const realIp =
    request.headers.get(
      "X-Real-IP"
    );

  if (realIp) {
    return realIp.trim();
  }

  const forwarded =
    request.headers.get(
      "X-Forwarded-For"
    );

  if (forwarded) {
    return (
      forwarded
        .split(",")[0]
        ?.trim() ?? null
    );
  }

  return null;
}

// ============================================================
// CLOUDFLARE LOCATION
// ============================================================

export function getCountry(
  request: Request
): string | null {
  return (
    request.headers.get(
      "CF-IPCountry"
    ) ??
    request.headers.get(
      "CF-Country"
    )
  );
}

export function getCity(
  request: Request
): string | null {
  return request.headers.get(
    "CF-IPCity"
  );
}

export function getRegion(
  request: Request
): string | null {
  return request.headers.get(
    "CF-Region"
  );
}

export function getCfRay(
  request: Request
): string | null {
  return request.headers.get(
    "CF-Ray"
  );
}

// ============================================================
// USER AGENT
// ============================================================

export function getUserAgent(
  request: Request
): string | null {
  return request.headers.get(
    "User-Agent"
  );
}

// ============================================================
// ORIGIN / REFERER
// ============================================================

export function getOrigin(
  request: Request
): string | null {
  return request.headers.get(
    "Origin"
  );
}

export function getReferer(
  request: Request
): string | null {
  return request.headers.get(
    "Referer"
  );
}

// ============================================================
// CONTENT TYPE
// ============================================================

export function getContentType(
  request: Request
): string | null {
  return request.headers.get(
    "Content-Type"
  );
}

export function isJsonRequest(
  request: Request
): boolean {
  const contentType =
    getContentType(request);

  return Boolean(
    contentType &&
      contentType
        .toLowerCase()
        .includes(
          "application/json"
        )
  );
}

export function isMultipartRequest(
  request: Request
): boolean {
  const contentType =
    getContentType(request);

  return Boolean(
    contentType &&
      contentType
        .toLowerCase()
        .includes(
          "multipart/form-data"
        )
  );
}

// ============================================================
// CONTENT LENGTH
// ============================================================

export function getContentLength(
  request: Request
): number | null {
  const value =
    request.headers.get(
      "Content-Length"
    );

  if (!value) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

// ============================================================
// REQUEST CONTEXT
// ============================================================

export function createRequestContext(
  request: Request
): RequestContext {
  const url =
    getUrl(request);

  return {
    request,
    requestId:
      getRequestId(request),
    url,
    method:
      request.method.toUpperCase(),
    path:
      url.pathname,
    pathname:
      url.pathname,
    origin:
      getOrigin(request),
    userAgent:
      getUserAgent(request),
    ip:
      getClientIp(request),
    country:
      getCountry(request),
    city:
      getCity(request),
    region:
      getRegion(request),
    cfRay:
      getCfRay(request),
    contentType:
      getContentType(request),
    contentLength:
      getContentLength(request),
  };
}

// ============================================================
// PATH MATCHING
// ============================================================

export function pathMatches(
  request: Request,
  pattern: string | RegExp
): boolean {
  const path =
    getPath(request);

  if (
    typeof pattern ===
    "string"
  ) {
    return path === pattern;
  }

  return pattern.test(path);
}

// ============================================================
// API PATH
// ============================================================

export function isApiRequest(
  request: Request
): boolean {
  return (
    getPath(request) ===
      "/api" ||
    getPath(request).startsWith(
      "/api/"
    )
  );
}

// ============================================================
// ADMIN PATH
// ============================================================

export function isAdminRequest(
  request: Request
): boolean {
  const path =
    getPath(request);

  return (
    path === "/admin" ||
    path.startsWith(
      "/admin/"
    ) ||
    path === "/api/admin" ||
    path.startsWith(
      "/api/admin/"
    )
  );
}

// ============================================================
// QUERY ARRAY
// ============================================================

export function getQueryArray(
  request: Request,
  name: string
): string[] {
  return getAllQueryParams(
    request,
    name
  )
    .map(
      (value) =>
        value.trim()
    )
    .filter(Boolean);
}

// ============================================================
// SAFE QUERY VALUE
// ============================================================

export function getSafeQuery(
  request: Request,
  name: string,
  maxLength = 500
): string | null {
  const value =
    getOptionalStringQuery(
      request,
      name
    );

  if (!value) {
    return null;
  }

  return value.slice(
    0,
    maxLength
  );
}

// ============================================================
// END
// ============================================================
