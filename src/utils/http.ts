// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// HTTP UTILITIES
// Version: 2026.09.09 POWER PRODUCTION
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
  extends HttpRequestOptions {
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
}

export interface FetchJsonOptions
  extends HttpJsonOptions,
    RetryOptions {}


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


// ============================================================
// METHOD HELPERS
// ============================================================

export function isHttpMethod(
  value: string
): value is HttpMethod {

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
  method?: string
): HttpMethod {

  const value =
    (method ?? "GET").toUpperCase();

  if (isHttpMethod(value)) {
    return value;
  }

  return "GET";
}


// ============================================================
// HEADER HELPERS
// ============================================================

export function createHeaders(
  input?: HeadersInit
): Headers {

  return new Headers(input);
}


export function setJsonHeaders(
  headers?: HeadersInit
): Headers {

  const result = new Headers(headers);

  if (!result.has(REQUEST_HEADERS.CONTENT_TYPE)) {
    result.set(
      REQUEST_HEADERS.CONTENT_TYPE,
      CONTENT_TYPE.JSON
    );
  }

  if (!result.has(REQUEST_HEADERS.ACCEPT)) {
    result.set(
      REQUEST_HEADERS.ACCEPT,
      CONTENT_TYPE.JSON
    );
  }

  return result;
}


export function setTextHeaders(
  headers?: HeadersInit
): Headers {

  const result = new Headers(headers);

  if (!result.has(REQUEST_HEADERS.CONTENT_TYPE)) {
    result.set(
      REQUEST_HEADERS.CONTENT_TYPE,
      CONTENT_TYPE.TEXT
    );
  }

  return result;
}


export function setRequestId(
  headers: Headers,
  requestId: string
): Headers {

  headers.set(
    REQUEST_HEADERS.REQUEST_ID,
    requestId
  );

  return headers;
}


export function getRequestId(
  response: Response
): string | null {

  return response.headers.get(
    REQUEST_HEADERS.REQUEST_ID
  );
}


export function getContentType(
  response: Response
): string {

  return (
    response.headers.get(
      REQUEST_HEADERS.CONTENT_TYPE
    ) ?? ""
  ).toLowerCase();
}


export function isJsonResponse(
  response: Response
): boolean {

  const contentType =
    getContentType(response);

  return (
    contentType.includes("application/json") ||
    contentType.includes("+json")
  );
}


// ============================================================
// JSON SERIALIZATION
// ============================================================

export function jsonBody(
  value: unknown
): string {

  return JSON.stringify(
    value,
    (_key, item) => {

      if (typeof item === "bigint") {
        return item.toString();
      }

      return item;
    }
  );
}


export function createJsonRequest(
  url: string | URL,
  options: HttpJsonOptions = {}
): Request {

  const headers =
    setJsonHeaders(options.headers);

  const method =
    normalizeMethod(options.method);

  const body =
    method === "GET" ||
    method === "HEAD"
      ? undefined
      : jsonBody(options.body ?? {});

  return new Request(url, {
    method,
    headers,
    body,
    signal: options.signal,
    cache: options.cache,
    credentials: options.credentials,
    redirect: options.redirect,
    referrerPolicy: options.referrerPolicy,
  });
}


// ============================================================
// FORM REQUEST
// ============================================================

export function createFormRequest(
  url: string | URL,
  form: URLSearchParams,
  options: HttpRequestOptions = {}
): Request {

  const headers =
    new Headers(options.headers);

  headers.set(
    REQUEST_HEADERS.CONTENT_TYPE,
    CONTENT_TYPE.FORM
  );

  return new Request(url, {
    method: normalizeMethod(
      options.method ?? "POST"
    ),
    headers,
    body: form,
    signal: options.signal,
  });
}


// ============================================================
// REQUEST TIMEOUT
// ============================================================

export function createTimeoutSignal(
  timeoutMs: number,
  externalSignal?: AbortSignal
): AbortSignal {

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => controller.abort(
        new Error("HTTP request timeout")
      ),
      timeoutMs
    );

  const cleanup = () => {
    clearTimeout(timer);
  };

  controller.signal.addEventListener(
    "abort",
    cleanup,
    { once: true }
  );

  if (externalSignal) {

    if (externalSignal.aborted) {
      controller.abort(
        externalSignal.reason
      );
    } else {

      externalSignal.addEventListener(
        "abort",
        () => {
          controller.abort(
            externalSignal.reason
          );
        },
        { once: true }
      );
    }
  }

  return controller.signal;
}


// ============================================================
// ERROR
// ============================================================

export class HttpError extends Error {

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
    data?: unknown
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


// ============================================================
// RESPONSE PARSING
// ============================================================

export async function parseResponseBody<T = unknown>(
  response: Response
): Promise<T> {

  if (response.status === HTTP_STATUS.NO_CONTENT) {
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


// ============================================================
// ERROR MESSAGE
// ============================================================

export function extractErrorMessage(
  data: unknown,
  fallback = "HTTP request failed"
): string {

  if (
    data &&
    typeof data === "object"
  ) {

    const value =
      data as Record<string, unknown>;

    if (
      typeof value.message === "string" &&
      value.message.trim()
    ) {
      return value.message;
    }

    if (
      typeof value.error === "string" &&
      value.error.trim()
    ) {
      return value.error;
    }

    if (
      value.error &&
      typeof value.error === "object"
    ) {

      const nested =
        value.error as Record<string, unknown>;

      if (
        typeof nested.message === "string"
      ) {
        return nested.message;
      }
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return fallback;
}


// ============================================================
// BASIC FETCH
// ============================================================

export async function httpRequest<T = unknown>(
  input: string | URL | Request,
  options: HttpRequestOptions = {}
): Promise<HttpResponse<T>> {

  let signal =
    options.signal;

  if (
    options.timeoutMs &&
    options.timeoutMs > 0
  ) {

    signal =
      createTimeoutSignal(
        options.timeoutMs,
        options.signal
      );
  }

  const response =
    await fetch(input, {
      method: normalizeMethod(options.method),
      headers: options.headers,
      body: options.body,
      signal,
      cache: options.cache,
      credentials: options.credentials,
      redirect: options.redirect,
      referrerPolicy: options.referrerPolicy,
    });

  const data =
    await parseResponseBody<T>(response);

  return {
    response,
    data,
  };
}


// ============================================================
// CHECK RESPONSE
// ============================================================

export function isSuccessful(
  response: Response
): boolean {

  return response.ok;
}


export function isClientError(
  response: Response
): boolean {

  return (
    response.status >= 400 &&
    response.status < 500
  );
}


export function isServerError(
  response: Response
): boolean {

  return response.status >= 500;
}


// ============================================================
// REQUIRE SUCCESS
// ============================================================

export async function requireSuccessful<T>(
  result: HttpResponse<T>
): Promise<T> {

  if (!result.response.ok) {

    throw new HttpError(
      extractErrorMessage(
        result.data,
        `HTTP ${result.response.status}`
      ),
      result.response.status,
      result.response.statusText,
      result.response.url,
      result.response,
      result.data
    );
  }

  return result.data;
}


// ============================================================
// JSON FETCH
// ============================================================

export async function fetchJson<T = unknown>(
  input: string | URL | Request,
  options: FetchJsonOptions = {}
): Promise<T> {

  const retries =
    Math.max(
      0,
      options.retries ?? 0
    );

  const retryStatusCodes =
    options.retryStatusCodes ??
    [
      HTTP_STATUS.TOO_MANY_REQUESTS,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.BAD_GATEWAY,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      HTTP_STATUS.GATEWAY_TIMEOUT,
    ];

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {

    try {

      const request =
        input instanceof Request
          ? input
          : createJsonRequest(
              input,
              options
            );

      const response =
        await fetch(
          request
        );

      const data =
        await parseResponseBody<T>(
          response
        );

      if (response.ok) {
        return data;
      }

      const error =
        new HttpError(
          extractErrorMessage(
            data,
            `HTTP ${response.status}`
          ),
          response.status,
          response.statusText,
          response.url,
          response,
          data
        );

      lastError = error;

      const canRetry =
        attempt < retries &&
        retryStatusCodes.includes(
          response.status
        );

      if (!canRetry) {
        throw error;
      }

    } catch (error) {

      lastError = error;

      if (attempt >= retries) {
        throw error;
      }
    }

    const baseDelay =
      options.delayMs ?? 250;

    const maxDelay =
      options.maxDelayMs ?? 5000;

    const delay =
      Math.min(
        maxDelay,
        baseDelay *
          Math.pow(2, attempt)
      );

    await sleep(delay);
  }

  throw (
    lastError ??
    new Error("HTTP request failed")
  );
}


// ============================================================
// HTTP METHODS
// ============================================================

export async function httpGet<T = unknown>(
  url: string | URL,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {}
): Promise<T> {

  return fetchJson<T>(
    url,
    {
      ...options,
      method: "GET",
    }
  );
}


export async function httpPost<T = unknown>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {}
): Promise<T> {

  return fetchJson<T>(
    url,
    {
      ...options,
      method: "POST",
      body,
    }
  );
}


export async function httpPut<T = unknown>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {}
): Promise<T> {

  return fetchJson<T>(
    url,
    {
      ...options,
      method: "PUT",
      body,
    }
  );
}


export async function httpPatch<T = unknown>(
  url: string | URL,
  body?: unknown,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {}
): Promise<T> {

  return fetchJson<T>(
    url,
    {
      ...options,
      method: "PATCH",
      body,
    }
  );
}


export async function httpDelete<T = unknown>(
  url: string | URL,
  options: Omit<
    FetchJsonOptions,
    "method" | "body"
  > = {}
): Promise<T> {

  return fetchJson<T>(
    url,
    {
      ...options,
      method: "DELETE",
    }
  );
}


// ============================================================
// QUERY PARAMETERS
// ============================================================

export function appendQuery(
  url: string | URL,
  params: Record<
    string,
    string |
    number |
    boolean |
    null |
    undefined
  >
): string {

  const target =
    new URL(url.toString());

  for (
    const [key, value] of
    Object.entries(params)
  ) {

    if (
      value === null ||
      value === undefined
    ) {
      continue;
    }

    target.searchParams.set(
      key,
      String(value)
    );
  }

  return target.toString();
}


// ============================================================
// SLEEP
// ============================================================

export function sleep(
  milliseconds: number
): Promise<void> {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        Math.max(0, milliseconds)
      )
  );
}


// ============================================================
// RETRY HELPER
// ============================================================

export async function withRetry<T>(
  operation: (
    attempt: number
  ) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {

  const retries =
    Math.max(
      0,
      options.retries ?? 3
    );

  const delayMs =
    options.delayMs ?? 250;

  const maxDelayMs =
    options.maxDelayMs ?? 5000;

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {

    try {
      return await operation(attempt);
    } catch (error) {

      lastError = error;

      if (attempt >= retries) {
        throw error;
      }

      const delay =
        Math.min(
          maxDelayMs,
          delayMs *
            Math.pow(2, attempt)
        );

      await sleep(delay);
    }
  }

  throw (
    lastError ??
    new Error("Operation failed")
  );
}


// ============================================================
// CACHE / CONDITIONAL REQUESTS
// ============================================================

export function addIfNoneMatch(
  headers: Headers,
  etag: string
): Headers {

  headers.set(
    REQUEST_HEADERS.IF_NONE_MATCH,
    etag
  );

  return headers;
}


export function addIfModifiedSince(
  headers: Headers,
  value: string
): Headers {

  headers.set(
    REQUEST_HEADERS.IF_MODIFIED_SINCE,
    value
  );

  return headers;
}


export function getEtag(
  response: Response
): string | null {

  return response.headers.get(
    REQUEST_HEADERS.ETAG
  );
}


export function isNotModified(
  response: Response
): boolean {

  return (
    response.status ===
    HTTP_STATUS.NOT_MODIFIED
  );
}


// ============================================================
// AUTHORIZATION
// ============================================================

export function createBearerToken(
  token: string
): string {

  return `Bearer ${token}`;
}


export function setBearerAuthorization(
  headers: Headers,
  token: string
): Headers {

  headers.set(
    REQUEST_HEADERS.AUTHORIZATION,
    createBearerToken(token)
  );

  return headers;
}


// ============================================================
// API REQUEST
// ============================================================

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


export function createApiHeaders(
  options: ApiRequestOptions = {}
): Headers {

  const headers =
    setJsonHeaders(
      options.headers
    );

  if (options.token) {
    setBearerAuthorization(
      headers,
      options.token
    );
  }

  if (options.requestId) {
    headers.set(
      REQUEST_HEADERS.REQUEST_ID,
      options.requestId
    );
  }

  if (options.visitorId) {
    headers.set(
      REQUEST_HEADERS.VISITOR_ID,
      options.visitorId
    );
  }

  if (options.sessionId) {
    headers.set(
      REQUEST_HEADERS.SESSION_ID,
      options.sessionId
    );
  }

  if (options.adminSession) {
    headers.set(
      REQUEST_HEADERS.ADMIN_SESSION,
      options.adminSession
    );
  }

  if (options.csrfToken) {
    headers.set(
      REQUEST_HEADERS.CSRF_TOKEN,
      options.csrfToken
    );
  }

  if (options.clientVersion) {
    headers.set(
      REQUEST_HEADERS.CLIENT_VERSION,
      options.clientVersion
    );
  }

  return headers;
}


export async function apiRequest<T = unknown>(
  url: string | URL,
  options: ApiRequestOptions = {}
): Promise<T> {

  const headers =
    createApiHeaders(options);

  return fetchJson<T>(
    url,
    {
      ...options,
      headers,
    }
  );
}


// ============================================================
// DOWNLOAD RESPONSE
// ============================================================

export async function fetchBinary(
  url: string | URL,
  options: HttpRequestOptions = {}
): Promise<ArrayBuffer> {

  const response =
    await fetch(
      url,
      {
        method: normalizeMethod(
          options.method ?? "GET"
        ),
        headers: options.headers,
        signal: options.signal,
      }
    );

  if (!response.ok) {

    const data =
      await parseResponseBody(response);

    throw new HttpError(
      extractErrorMessage(
        data,
        `HTTP ${response.status}`
      ),
      response.status,
      response.statusText,
      response.url,
      response,
      data
    );
  }

  return response.arrayBuffer();
}


// ============================================================
// END
// ============================================================
