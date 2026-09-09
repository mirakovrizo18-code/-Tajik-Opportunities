// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// HTTP UTILITIES
// Version: 2026.09.10 POWER PRODUCTION
// ============================================================
//
// Возможности:
//
// - HTTP method helpers
// - Headers utilities
// - JSON requests
// - Form requests
// - API requests
// - timeout / AbortController
// - retry with exponential backoff
// - JSON / text / binary response parsing
// - HttpError
// - status helpers
// - query parameter helpers
// - authorization helpers
// - request ID / visitor / session / CSRF
// - conditional requests / ETag
// - cache-control helpers
// - URL helpers
// - safe JSON serialization
// - response metadata
// - Cloudflare Workers Request compatibility
// - backward-compatible public API
//
// ВАЖНО:
// Не используются внешние зависимости.
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export interface HttpRequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: BodyInit | null;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  redirect?: RequestRedirect;
  referrerPolicy?: ReferrerPolicy;
  timeoutMs?: number;
}

export interface HttpJsonOptions
  extends Omit<HttpRequestOptions, "body"> {
  body?: unknown;
}

export interface HttpResponse<T = unknown> {
  response: Response;
  data: T;
}

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  maxDelayMs?: number;
  retryStatusCodes?: readonly number[];
  retryOnNetworkError?: boolean;
}

export interface FetchJsonOptions
  extends HttpJsonOptions,
    RetryOptions {}

export interface ApiRequestOptions
  extends FetchJsonOptions {
  token?: string;
  requestId?: string;
  visitorId?: string;
  sessionId?: string;
  adminSession?: string;
  csrfToken?: string;
  clientVersion?: string;
}

export interface HttpResponseMetadata {
  status: number;
  statusText: string;
  ok: boolean;
  url: string;
  contentType: string;
  requestId: string | null;
  etag: string | null;
}

export interface HttpRequestResult<T = unknown>
  extends HttpResponse<T> {
  metadata: HttpResponseMetadata;
}

export type QueryValue =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined;

export type QueryParams = Record<
  string,
  QueryValue | readonly QueryValue[]
>;

// ============================================================
// CONSTANTS
// ============================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const CONTENT_TYPE = {
  JSON: "application/json; charset=utf-8",
  TEXT: "text/plain; charset=utf-8",
  HTML: "text/html; charset=utf-8",
  FORM: "application/x-www-form-urlencoded; charset=utf-8",
  MULTIPART: "multipart/form-data",
  OCTET_STREAM: "application/octet-stream",
} as const;

export const REQUEST_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
  AUTHORIZATION: "Authorization",
  USER_AGENT: "User-Agent",
  CACHE_CONTROL: "Cache-Control",
  IF_NONE_MATCH: "If-None-Match",
  IF_MODIFIED_SINCE: "If-Modified-Since",
  ETAG: "ETag",
  LAST_MODIFIED: "Last-Modified",

  REQUEST_ID: "X-Request-ID",
  VISITOR_ID: "X-Visitor-ID",
  SESSION_ID: "X-Session-ID",
  ADMIN_SESSION: "X-Admin-Session",
  CSRF_TOKEN: "X-CSRF-Token",
  CLIENT_VERSION: "X-Client-Version",
} as const;

export const DEFAULT_RETRY_STATUS_CODES: readonly number[] = [
  HTTP_STATUS.TOO_MANY_REQUESTS,
  HTTP_STATUS.INTERNAL_SERVER_ERROR,
  HTTP_STATUS.BAD_GATEWAY,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
  HTTP_STATUS.GATEWAY_TIMEOUT,
];

export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_RETRY_DELAY_MS = 250;
export const DEFAULT_RETRY_MAX_DELAY_MS = 5000;
export const DEFAULT_TIMEOUT_MS = 30_000;

// ============================================================
// INTERNAL FETCH COMPATIBILITY
// ============================================================

type CompatibleFetch = (
  input: unknown,
  init?: RequestInit,
) => Promise<Response>;

const compatibleFetch =
  globalThis.fetch as unknown as CompatibleFetch;

function executeFetch(
  input: unknown,
  init?: RequestInit,
): Promise<Response> {
  return compatibleFetch(input, init);
}

// ============================================================
// METHOD HELPERS
// ============================================================

export function isHttpMethod(
  value: string,
): value is HttpMethod {
  if (typeof value !== "string") {
    return false;
  }

  return [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
  ].includes(value.toUpperCase());
}

export function normalizeMethod(
  method?: string,
): HttpMethod {
  const value = (
    method ?? "GET"
  ).toUpperCase();

  return isHttpMethod(value)
    ? value
    : "GET";
}

export function isBodylessMethod(
  method?: string,
): boolean {
  const normalized = normalizeMethod(method);

  return (
    normalized === "GET" ||
    normalized === "HEAD"
  );
}

export function isSafeMethod(
  method?: string,
): boolean {
  const normalized = normalizeMethod(method);

  return (
    normalized === "GET" ||
    normalized === "HEAD" ||
    normalized === "OPTIONS"
  );
}

export function isIdempotentMethod(
  method?: string,
): boolean {
  const normalized = normalizeMethod(method);

  return (
    normalized === "GET" ||
    normalized === "HEAD" ||
    normalized === "OPTIONS" ||
    normalized === "PUT" ||
    normalized === "DELETE"
  );
}

// ============================================================
// HEADER HELPERS
// ============================================================

export function createHeaders(
  input?: HeadersInit,
): Headers {
  return new Headers(input);
}

export function cloneHeaders(
  input?: HeadersInit,
): Headers {
  return new Headers(input);
}

export function setJsonHeaders(
  headers?: HeadersInit,
): Headers {
  const result = new Headers(headers);

  if (
    !result.has(
      REQUEST_HEADERS.CONTENT_TYPE,
    )
  ) {
    result.set(
      REQUEST_HEADERS.CONTENT_TYPE,
      CONTENT_TYPE.JSON,
    );
  }

  if (
    !result.has(
      REQUEST_HEADERS.ACCEPT,
    )
  ) {
    result.set(
      REQUEST_HEADERS.ACCEPT,
      CONTENT_TYPE.JSON,
    );
  }

  return result;
}

export function setTextHeaders(
  headers?: HeadersInit,
): Headers {
  const result = new Headers(headers);

  if (
    !result.has(
      REQUEST_HEADERS.CONTENT_TYPE,
    )
  ) {
    result.set(
      REQUEST_HEADERS.CONTENT_TYPE,
      CONTENT_TYPE.TEXT,
    );
  }

  return result;
}

export function setAcceptHeader(
  headers: Headers,
  value: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.ACCEPT,
    value,
  );

  return headers;
}

export function setContentTypeHeader(
  headers: Headers,
  value: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.CONTENT_TYPE,
    value,
  );

  return headers;
}

export function removeHeader(
  headers: Headers,
  name: string,
): Headers {
  headers.delete(name);
  return headers;
}

export function hasHeader(
  headers: Headers,
  name: string,
): boolean {
  return headers.has(name);
}

export function getHeader(
  headers: Headers,
  name: string,
): string | null {
  return headers.get(name);
}

export function setRequestId(
  headers: Headers,
  requestId: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.REQUEST_ID,
    requestId,
  );

  return headers;
}

export function getRequestId(
  response: Response,
): string | null {
  return response.headers.get(
    REQUEST_HEADERS.REQUEST_ID,
  );
}

export function setVisitorId(
  headers: Headers,
  visitorId: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.VISITOR_ID,
    visitorId,
  );

  return headers;
}

export function setSessionId(
  headers: Headers,
  sessionId: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.SESSION_ID,
    sessionId,
  );

  return headers;
}

export function setAdminSession(
  headers: Headers,
  session: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.ADMIN_SESSION,
    session,
  );

  return headers;
}

export function setCsrfToken(
  headers: Headers,
  token: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.CSRF_TOKEN,
    token,
  );

  return headers;
}

export function setClientVersion(
  headers: Headers,
  version: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.CLIENT_VERSION,
    version,
  );

  return headers;
}

export function getContentType(
  response: Response,
): string {
  return (
    response.headers.get(
      REQUEST_HEADERS.CONTENT_TYPE,
    ) ?? ""
  ).toLowerCase();
}

export function getContentLength(
  response: Response,
): number | null {
  const value = response.headers.get(
    "Content-Length",
  );

  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export function isJsonResponse(
  response: Response,
): boolean {
  const contentType = getContentType(response);

  return (
    contentType.includes(
      "application/json",
    ) ||
    contentType.includes("+json")
  );
}

export function isTextResponse(
  response: Response,
): boolean {
  const contentType = getContentType(response);

  return (
    contentType.startsWith("text/") ||
    isJsonResponse(response)
  );
}

// ============================================================
// JSON
// ============================================================

export function jsonBody(
  value: unknown,
): string {
  const result = JSON.stringify(
    value,
    (_key, item) => {
      if (typeof item === "bigint") {
        return item.toString();
      }

      return item;
    },
  );

  return result === undefined
    ? "null"
    : result;
}

export function safeJsonParse<
  T = unknown,
>(
  value: string,
): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function tryJsonParse<
  T = unknown,
>(
  value: string,
  fallback: T,
): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ============================================================
// TIMEOUT
// ============================================================

export function createTimeoutSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal,
): AbortSignal {
  const controller =
    new AbortController();

  const safeTimeout =
    Number.isFinite(timeoutMs)
      ? Math.max(0, timeoutMs)
      : DEFAULT_TIMEOUT_MS;

  const timer = setTimeout(
    () => {
      controller.abort(
        new Error(
          "HTTP request timeout",
        ),
      );
    },
    safeTimeout,
  );

  const cleanup = () => {
    clearTimeout(timer);
  };

  controller.signal.addEventListener(
    "abort",
    cleanup,
    {
      once: true,
    },
  );

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(
        externalSignal.reason,
      );
    } else {
      externalSignal.addEventListener(
        "abort",
        () => {
          controller.abort(
            externalSignal.reason,
          );
        },
        {
          once: true,
        },
      );
    }
  }

  return controller.signal;
}

export function shouldUseTimeout(
  timeoutMs: number | undefined,
): boolean {
  return (
    typeof timeoutMs === "number" &&
    Number.isFinite(timeoutMs) &&
    timeoutMs > 0
  );
}

// ============================================================
// REQUEST CREATION
// ============================================================

export function createJsonRequest(
  url: string | URL,
  options: HttpJsonOptions = {},
): Request {
  const headers =
    setJsonHeaders(options.headers);

  const method =
    normalizeMethod(options.method);

  const signal =
    shouldUseTimeout(options.timeoutMs)
      ? createTimeoutSignal(
          options.timeoutMs as number,
          options.signal,
        )
      : options.signal;

  const body =
    isBodylessMethod(method)
      ? undefined
      : jsonBody(
          options.body ?? {},
        );

  return new Request(url, {
    method,
    headers,
    body,
    signal,
    cache: options.cache,
    credentials: options.credentials,
    redirect: options.redirect,
    referrerPolicy:
      options.referrerPolicy,
  });
}

export function createHttpRequest(
  url: string | URL,
  options: HttpRequestOptions = {},
): Request {
  const method =
    normalizeMethod(options.method);

  const signal =
    shouldUseTimeout(options.timeoutMs)
      ? createTimeoutSignal(
          options.timeoutMs as number,
          options.signal,
        )
      : options.signal;

  return new Request(url, {
    method,
    headers: options.headers,
    body: isBodylessMethod(method)
      ? undefined
      : options.body,
    signal,
    cache: options.cache,
    credentials: options.credentials,
    redirect: options.redirect,
    referrerPolicy:
      options.referrerPolicy,
  });
}

// ============================================================
// FORM REQUEST
// ============================================================

export function createFormRequest(
  url: string | URL,
  form: URLSearchParams,
  options: HttpRequestOptions = {},
): Request {
  const headers =
    new Headers(options.headers);

  headers.set(
    REQUEST_HEADERS.CONTENT_TYPE,
    CONTENT_TYPE.FORM,
  );

  const signal =
    shouldUseTimeout(options.timeoutMs)
      ? createTimeoutSignal(
          options.timeoutMs as number,
          options.signal,
        )
      : options.signal;

  return new Request(url, {
    method: normalizeMethod(
      options.method ?? "POST",
    ),
    headers,
    body: form,
    signal,
    cache: options.cache,
    credentials: options.credentials,
    redirect: options.redirect,
    referrerPolicy:
      options.referrerPolicy,
  });
}

export function createUrlEncodedForm(
  values: Record<
    string,
    string |
    number |
    boolean |
    null |
    undefined
  >,
): URLSearchParams {
  const form =
    new URLSearchParams();

  for (
    const [key, value] of Object.entries(
      values,
    )
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    form.set(key, String(value));
  }

  return form;
}

// ============================================================
// ERROR
// ============================================================

export class HttpError
  extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly response?: Response;
  readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    url: string,
    response?: Response,
    data?: unknown,
  ) {
    super(message);

    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.response = response;
    this.data = data;
  }
}

export function isHttpError(
  error: unknown,
): error is HttpError {
  return error instanceof HttpError;
}

export function getHttpErrorStatus(
  error: unknown,
): number | null {
  return isHttpError(error)
    ? error.status
    : null;
}

// ============================================================
// RESPONSE PARSING
// ============================================================

export async function parseResponseBody<
  T = unknown,
>(
  response: Response,
): Promise<T> {
  if (
    response.status ===
    HTTP_STATUS.NO_CONTENT
  ) {
    return undefined as T;
  }

  const text =
    await response.text();

  if (!text) {
    return undefined as T;
  }

  if (isJsonResponse(response)) {
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  return text as T;
}

export async function parseResponseText(
  response: Response,
): Promise<string> {
  return response.text();
}

export async function parseResponseJson<
  T = unknown,
>(
  response: Response,
): Promise<T | null> {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  return safeJsonParse<T>(text);
}

export async function parseResponseBinary(
  response: Response,
): Promise<ArrayBuffer> {
  return response.arrayBuffer();
}

// ============================================================
// RESPONSE METADATA
// ============================================================

export function getResponseMetadata(
  response: Response,
): HttpResponseMetadata {
  return {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url,
    contentType: getContentType(response),
    requestId: getRequestId(response),
    etag: getEtag(response),
  };
}

export async function httpRequestDetailed<
  T = unknown,
>(
  input:
    | string
    | URL
    | Request,
  options: HttpRequestOptions = {},
): Promise<HttpRequestResult<T>> {
  const result =
    await httpRequest<T>(
      input,
      options,
    );

  return {
    ...result,
    metadata:
      getResponseMetadata(
        result.response,
      ),
  };
}

// ============================================================
// ERROR MESSAGE
// ============================================================

export function extractErrorMessage(
  data: unknown,
  fallback = "HTTP request failed",
): string {
  if (
    data &&
    typeof data === "object"
  ) {
    const value =
      data as Record<string, unknown>;

    if (
      typeof value.message ===
        "string" &&
      value.message.trim()
    ) {
      return value.message;
    }

    if (
      typeof value.error ===
        "string" &&
      value.error.trim()
    ) {
      return value.error;
    }

    if (
      value.error &&
      typeof value.error ===
        "object"
    ) {
      const nested =
        value.error as Record<
          string,
          unknown
        >;

      if (
        typeof nested.message ===
        "string"
      ) {
        return nested.message;
      }
    }

    if (
      typeof value.detail ===
      "string"
    ) {
      return value.detail;
    }

    if (
      typeof value.title ===
      "string"
    ) {
      return value.title;
    }
  }

  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data;
  }

  return fallback;
}

// ============================================================
// BASIC FETCH
// ============================================================

export async function httpRequest<
  T = unknown,
>(
  input:
    | string
    | URL
    | Request,
  options: HttpRequestOptions = {},
): Promise<HttpResponse<T>> {
  const signal =
    shouldUseTimeout(options.timeoutMs)
      ? createTimeoutSignal(
          options.timeoutMs as number,
          options.signal,
        )
      : options.signal;

  let requestInput: unknown;
  let fetchInit:
    | RequestInit
    | undefined;

  if (
    typeof input === "string"
  ) {
    requestInput =
      createHttpRequest(
        input,
        {
          ...options,
          signal,
        },
      );
  } else if (
    input instanceof URL
  ) {
    requestInput =
      createHttpRequest(
        input,
        {
          ...options,
          signal,
        },
      );
  } else {
    requestInput = input;

    if (
      signal !== options.signal &&
      signal !== undefined
    ) {
      fetchInit = {
        signal,
      };
    }
  }

  const response =
    await executeFetch(
      requestInput,
      fetchInit,
    );

  const data =
    await parseResponseBody<T>(
      response,
    );

  return {
    response,
    data,
  };
}

// ============================================================
// STATUS HELPERS
// ============================================================

export function isSuccessful(
  response: Response,
): boolean {
  return response.ok;
}

export function isClientError(
  response: Response,
): boolean {
  return (
    response.status >= 400 &&
    response.status < 500
  );
}

export function isServerError(
  response: Response,
): boolean {
  return response.status >= 500;
}

export function isRedirect(
  response: Response,
): boolean {
  return (
    response.status >= 300 &&
    response.status < 400
  );
}

export function isRateLimited(
  response: Response,
): boolean {
  return (
    response.status ===
    HTTP_STATUS.TOO_MANY_REQUESTS
  );
}

export function isUnauthorized(
  response: Response,
): boolean {
  return (
    response.status ===
    HTTP_STATUS.UNAUTHORIZED
  );
}

export function isForbidden(
  response: Response,
): boolean {
  return (
    response.status ===
    HTTP_STATUS.FORBIDDEN
  );
}

export function isNotFound(
  response: Response,
): boolean {
  return (
    response.status ===
    HTTP_STATUS.NOT_FOUND
  );
}

export function isNoContent(
  response: Response,
): boolean {
  return (
    response.status ===
    HTTP_STATUS.NO_CONTENT
  );
}

// ============================================================
// REQUIRE SUCCESS
// ============================================================

export async function requireSuccessful<
  T,
>(
  result: HttpResponse<T>,
): Promise<T> {
  if (!result.response.ok) {
    throw new HttpError(
      extractErrorMessage(
        result.data,
        `HTTP ${result.response.status}`,
      ),
      result.response.status,
      result.response.statusText,
      result.response.url,
      result.response,
      result.data,
    );
  }

  return result.data;
}

export async function requireResponse<
  T,
>(
  result: HttpResponse<T>,
): Promise<HttpResponse<T>> {
  if (!result.response.ok) {
    throw new HttpError(
      extractErrorMessage(
        result.data,
        `HTTP ${result.response.status}`,
      ),
      result.response.status,
      result.response.statusText,
      result.response.url,
      result.response,
      result.data,
    );
  }

  return result;
}

// ============================================================
// RETRY
// ============================================================

export function getRetryDelay(
  attempt: number,
  delayMs = DEFAULT_RETRY_DELAY_MS,
  maxDelayMs = DEFAULT_RETRY_MAX_DELAY_MS,
): number {
  const safeAttempt =
    Math.max(
      0,
      Math.floor(attempt),
    );

  const safeDelay =
    Number.isFinite(delayMs)
      ? Math.max(0, delayMs)
      : DEFAULT_RETRY_DELAY_MS;

  const safeMax =
    Number.isFinite(maxDelayMs)
      ? Math.max(
          safeDelay,
          maxDelayMs,
        )
      : DEFAULT_RETRY_MAX_DELAY_MS;

  return Math.min(
    safeMax,
    safeDelay *
      Math.pow(
        2,
        safeAttempt,
      ),
  );
}

export function shouldRetryStatus(
  status: number,
  statusCodes:
    | readonly number[]
    | undefined,
): boolean {
  const codes =
    statusCodes ??
    DEFAULT_RETRY_STATUS_CODES;

  return codes.includes(status);
}

// ============================================================
// JSON FETCH
// ============================================================

export async function fetchJson<
  T = unknown,
>(
  input:
    | string
    | URL
    | Request,
  options: FetchJsonOptions = {},
): Promise<T> {
  const retries =
    Math.max(
      0,
      options.retries ?? 0,
    );

  const retryStatusCodes =
    options.retryStatusCodes ??
    DEFAULT_RETRY_STATUS_CODES;

  const retryOnNetworkError =
    options.retryOnNetworkError ??
    true;

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      let requestInput: unknown;
      let fetchInit:
        | RequestInit
        | undefined;

      if (
        typeof input === "string"
      ) {
        requestInput =
          createJsonRequest(
            input,
            options,
          );
      } else if (
        input instanceof URL
      ) {
        requestInput =
          createJsonRequest(
            input,
            options,
          );
      } else {
        requestInput = input;

        if (
          options.signal !==
            undefined &&
          !shouldUseTimeout(
            options.timeoutMs,
          )
        ) {
          fetchInit = {
            signal:
              options.signal,
          };
        }

        if (
          shouldUseTimeout(
            options.timeoutMs,
          )
        ) {
          fetchInit = {
            signal:
              createTimeoutSignal(
                options.timeoutMs as number,
                options.signal,
              ),
          };
        }
      }

      const response =
        await executeFetch(
          requestInput,
          fetchInit,
        );

      const data =
        await parseResponseBody<T>(
          response,
        );

      if (response.ok) {
        return data;
      }

      const error =
        new HttpError(
          extractErrorMessage(
            data,
            `HTTP ${response.status}`,
          ),
          response.status,
          response.statusText,
          response.url,
          response,
          data,
        );

      lastError = error;

      const canRetry =
        attempt < retries &&
        shouldRetryStatus(
          response.status,
          retryStatusCodes,
        );

      if (!canRetry) {
        throw error;
      }
    } catch (error) {
      lastError = error;

      const canRetryNetwork =
        !isHttpError(error) &&
        retryOnNetworkError;

      if (
        attempt >= retries ||
        !canRetryNetwork
      ) {
        throw error;
      }
    }

    await sleep(
      getRetryDelay(
        attempt,
        options.delayMs ??
          DEFAULT_RETRY_DELAY_MS,
        options.maxDelayMs ??
          DEFAULT_RETRY_MAX_DELAY_MS,
      ),
    );
  }

  throw (
    lastError ??
    new Error(
      "HTTP request failed",
    )
  );
}

// ============================================================
// RAW JSON RESPONSE
// ============================================================

export async function fetchJsonResponse<
  T = unknown,
>(
  input:
    | string
    | URL
    | Request,
  options: FetchJsonOptions = {},
): Promise<HttpResponse<T>> {
  let requestInput: unknown;
  let fetchInit:
    | RequestInit
    | undefined;

  if (
    typeof input === "string"
  ) {
    requestInput =
      createJsonRequest(
        input,
        options,
      );
  } else if (
    input instanceof URL
  ) {
    requestInput =
      createJsonRequest(
        input,
        options,
      );
  } else {
    requestInput = input;

    if (
      options.signal !==
      undefined
    ) {
      fetchInit = {
        signal: options.signal,
      };
    }

    if (
      shouldUseTimeout(
        options.timeoutMs,
      )
    ) {
      fetchInit = {
        signal:
          createTimeoutSignal(
            options.timeoutMs as number,
            options.signal,
          ),
      };
    }
  }

  const response =
    await executeFetch(
      requestInput,
      fetchInit,
    );

  const data =
    await parseResponseBody<T>(
      response,
    );

  return {
    response,
    data,
  };
}

// ============================================================
// HTTP METHODS
// ============================================================

export async function httpGet<
  T = unknown,
>(
  url: string | URL,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return fetchJson<T>(
    url,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function httpPost<
  T = unknown,
>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return fetchJson<T>(
    url,
    {
      ...options,
      method: "POST",
      body,
    },
  );
}

export async function httpPut<
  T = unknown,
>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return fetchJson<T>(
    url,
    {
      ...options,
      method: "PUT",
      body,
    },
  );
}

export async function httpPatch<
  T = unknown,
>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return fetchJson<T>(
    url,
    {
      ...options,
      method: "PATCH",
      body,
    },
  );
}

export async function httpDelete<
  T = unknown,
>(
  url: string | URL,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return fetchJson<T>(
    url,
    {
      ...options,
      method: "DELETE",
    },
  );
}

export async function httpOptions<
  T = unknown,
>(
  url: string | URL,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return fetchJson<T>(
    url,
    {
      ...options,
      method: "OPTIONS",
    },
  );
}

export async function httpHead(
  url: string | URL,
  options: Omit<
    HttpJsonOptions,
    "method" | "body"
  > = {},
): Promise<Response> {
  const request =
    createJsonRequest(
      url,
      {
        ...options,
        method: "HEAD",
      },
    );

  return executeFetch(request);
}

// ============================================================
// QUERY PARAMETERS
// ============================================================

export function appendQuery(
  url: string | URL,
  params: QueryParams,
): string {
  const target =
    new URL(url.toString());

  for (
    const [key, value] of Object.entries(
      params,
    )
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      target.searchParams.delete(key);

      for (const item of value) {
        if (
          item === null ||
          item === undefined
        ) {
          continue;
        }

        target.searchParams.append(
          key,
          String(item),
        );
      }

      continue;
    }

    target.searchParams.set(
      key,
      String(value),
    );
  }

  return target.toString();
}

export function buildQueryString(
  params: QueryParams,
): string {
  const query =
    new URLSearchParams();

  for (
    const [key, value] of Object.entries(
      params,
    )
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (
          item === null ||
          item === undefined
        ) {
          continue;
        }

        query.append(
          key,
          String(item),
        );
      }

      continue;
    }

    query.set(
      key,
      String(value),
    );
  }

  return query.toString();
}

export function hasQueryParameter(
  url: string | URL,
  key: string,
): boolean {
  return new URL(
    url.toString(),
  ).searchParams.has(key);
}

export function getQueryParameter(
  url: string | URL,
  key: string,
): string | null {
  return new URL(
    url.toString(),
  ).searchParams.get(key);
}

export function removeQueryParameter(
  url: string | URL,
  key: string,
): string {
  const target =
    new URL(url.toString());

  target.searchParams.delete(key);

  return target.toString();
}

export function setQueryParameter(
  url: string | URL,
  key: string,
  value: string | number | boolean,
): string {
  const target =
    new URL(url.toString());

  target.searchParams.set(
    key,
    String(value),
  );

  return target.toString();
}

export function removeQueryParameters(
  url: string | URL,
  keys: readonly string[],
): string {
  const target =
    new URL(url.toString());

  for (const key of keys) {
    target.searchParams.delete(key);
  }

  return target.toString();
}

// ============================================================
// URL HELPERS
// ============================================================

export function normalizeUrl(
  url: string | URL,
): string {
  return new URL(
    url.toString(),
  ).toString();
}

export function isValidUrl(
  value: string,
): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getUrlOrigin(
  url: string | URL,
): string {
  return new URL(
    url.toString(),
  ).origin;
}

export function getUrlPath(
  url: string | URL,
): string {
  return new URL(
    url.toString(),
  ).pathname;
}

export function getUrlSearch(
  url: string | URL,
): string {
  return new URL(
    url.toString(),
  ).search;
}

export function getUrlHash(
  url: string | URL,
): string {
  return new URL(
    url.toString(),
  ).hash;
}

export function getUrlHostname(
  url: string | URL,
): string {
  return new URL(
    url.toString(),
  ).hostname;
}

export function joinUrl(
  base: string | URL,
  path: string,
): string {
  const baseUrl =
    new URL(base.toString());

  const cleanPath =
    path.replace(/^\/+/, "");

  return new URL(
    cleanPath,
    baseUrl.toString().replace(
      /\/?$/,
      "/",
    ),
  ).toString();
}

// ============================================================
// SLEEP
// ============================================================

export function sleep(
  milliseconds: number,
): Promise<void> {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        Math.max(
          0,
          milliseconds,
        ),
      ),
  );
}

// ============================================================
// GENERIC RETRY
// ============================================================

export async function withRetry<
  T,
>(
  operation: (
    attempt: number,
  ) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const retries =
    Math.max(
      0,
      options.retries ??
        DEFAULT_RETRY_COUNT,
    );

  const delayMs =
    options.delayMs ??
    DEFAULT_RETRY_DELAY_MS;

  const maxDelayMs =
    options.maxDelayMs ??
    DEFAULT_RETRY_MAX_DELAY_MS;

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      return await operation(
        attempt,
      );
    } catch (error) {
      lastError = error;

      if (
        attempt >= retries
      ) {
        throw error;
      }

      await sleep(
        getRetryDelay(
          attempt,
          delayMs,
          maxDelayMs,
        ),
      );
    }
  }

  throw (
    lastError ??
    new Error(
      "Operation failed",
    )
  );
}

// ============================================================
// CACHE / CONDITIONAL REQUESTS
// ============================================================

export function addIfNoneMatch(
  headers: Headers,
  etag: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.IF_NONE_MATCH,
    etag,
  );

  return headers;
}

export function addIfModifiedSince(
  headers: Headers,
  value: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.IF_MODIFIED_SINCE,
    value,
  );

  return headers;
}

export function getEtag(
  response: Response,
): string | null {
  return response.headers.get(
    REQUEST_HEADERS.ETAG,
  );
}

export function getLastModified(
  response: Response,
): string | null {
  return response.headers.get(
    REQUEST_HEADERS.LAST_MODIFIED,
  );
}

export function isNotModified(
  response: Response,
): boolean {
  return (
    response.status ===
    HTTP_STATUS.NOT_MODIFIED
  );
}

export function setCacheControl(
  headers: Headers,
  value: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.CACHE_CONTROL,
    value,
  );

  return headers;
}

export function setNoCache(
  headers: Headers,
): Headers {
  return setCacheControl(
    headers,
    "no-cache",
  );
}

export function setNoStore(
  headers: Headers,
): Headers {
  return setCacheControl(
    headers,
    "no-store",
  );
}

export function setPrivateCache(
  headers: Headers,
): Headers {
  return setCacheControl(
    headers,
    "private",
  );
}

export function setPublicCache(
  headers: Headers,
  maxAgeSeconds?: number,
): Headers {
  const maxAge =
    typeof maxAgeSeconds === "number" &&
    Number.isFinite(
      maxAgeSeconds,
    )
      ? Math.max(
          0,
          Math.floor(
            maxAgeSeconds,
          ),
        )
      : undefined;

  return setCacheControl(
    headers,
    maxAge === undefined
      ? "public"
      : `public, max-age=${maxAge}`,
  );
}

// ============================================================
// AUTHORIZATION
// ============================================================

export function createBearerToken(
  token: string,
): string {
  return `Bearer ${token}`;
}

export function setBearerAuthorization(
  headers: Headers,
  token: string,
): Headers {
  headers.set(
    REQUEST_HEADERS.AUTHORIZATION,
    createBearerToken(token),
  );

  return headers;
}

export function removeAuthorization(
  headers: Headers,
): Headers {
  headers.delete(
    REQUEST_HEADERS.AUTHORIZATION,
  );

  return headers;
}

export function hasAuthorization(
  headers: Headers,
): boolean {
  return headers.has(
    REQUEST_HEADERS.AUTHORIZATION,
  );
}

// ============================================================
// API HEADERS
// ============================================================

export function createApiHeaders(
  options: ApiRequestOptions = {},
): Headers {
  const headers =
    setJsonHeaders(options.headers);

  if (options.token) {
    setBearerAuthorization(
      headers,
      options.token,
    );
  }

  if (options.requestId) {
    setRequestId(
      headers,
      options.requestId,
    );
  }

  if (options.visitorId) {
    setVisitorId(
      headers,
      options.visitorId,
    );
  }

  if (options.sessionId) {
    setSessionId(
      headers,
      options.sessionId,
    );
  }

  if (options.adminSession) {
    setAdminSession(
      headers,
      options.adminSession,
    );
  }

  if (options.csrfToken) {
    setCsrfToken(
      headers,
      options.csrfToken,
    );
  }

  if (options.clientVersion) {
    setClientVersion(
      headers,
      options.clientVersion,
    );
  }

  return headers;
}

// ============================================================
// API REQUEST
// ============================================================

export async function apiRequest<
  T = unknown,
>(
  url: string | URL,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers =
    createApiHeaders(options);

  return fetchJson<T>(
    url,
    {
      ...options,
      headers,
    },
  );
}

export async function apiGet<
  T = unknown,
>(
  url: string | URL,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function apiPost<
  T = unknown,
>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      ...options,
      method: "POST",
      body,
    },
  );
}

export async function apiPut<
  T = unknown,
>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      ...options,
      method: "PUT",
      body,
    },
  );
}

export async function apiPatch<
  T = unknown,
>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      ...options,
      method: "PATCH",
      body,
    },
  );
}

export async function apiDelete<
  T = unknown,
>(
  url: string | URL,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      ...options,
      method: "DELETE",
    },
  );
}

export async function apiOptions<
  T = unknown,
>(
  url: string | URL,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      ...options,
      method: "OPTIONS",
    },
  );
}

export async function apiHead(
  url: string | URL,
  options: Omit<
    ApiRequestOptions,
    "method" | "body"
  > = {},
): Promise<Response> {
  const headers =
    createApiHeaders(options);

  const request =
    createJsonRequest(
      url,
      {
        ...options,
        headers,
        method: "HEAD",
      },
    );

  return executeFetch(request);
}

// ============================================================
// CONVENIENCE RESPONSE HELPERS
// ============================================================

export function getResponseStatus(
  response: Response,
): number {
  return response.status;
}

export function getResponseStatusText(
  response: Response,
): string {
  return response.statusText;
}

export function getResponseUrl(
  response: Response,
): string {
  return response.url;
}

export function isEmptyResponse(
  response: Response,
): boolean {
  return (
    response.status ===
      HTTP_STATUS.NO_CONTENT ||
    response.headers.get(
      REQUEST_HEADERS.CONTENT_LENGTH,
    ) === "0"
  );
}

// ============================================================
// END
// ============================================================
