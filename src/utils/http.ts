import {
  HTTP,
  CONTENT_TYPES,
  HEADERS,
} from "../constants/app";

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
  credentials?: RequestCredentials;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  referrer?: string;
}

export interface HttpRetryOptions {
  retries?: number;
  delayMs?: number;
  backoff?: number;
  maxDelayMs?: number;
  retryMethods?: HttpMethod[];
  retryStatuses?: number[];
}

export interface HttpClientOptions {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  timeoutMs?: number;
  retry?: HttpRetryOptions;
}

export interface HttpResult<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  data: T | null;
  response: Response;
}

export interface HttpErrorData {
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
  [key: string]: unknown;
}

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly response: Response;
  readonly data: unknown;

  constructor(
    message: string,
    response: Response,
    data: unknown = null,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.response = response;
    this.data = data;
  }
}

function normalizeBaseUrl(
  baseUrl: string,
): string {
  return baseUrl.replace(/\/+$/, "");
}

function joinUrl(
  baseUrl: string,
  path: string,
): string {
  if (
    /^https?:\/\//i.test(path)
  ) {
    return path;
  }

  const base =
    normalizeBaseUrl(baseUrl);

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${base}${normalizedPath}`;
}

function toHeaders(
  headers?: HeadersInit,
): Headers {
  return new Headers(headers);
}

function isJsonContentType(
  contentType: string | null,
): boolean {
  if (!contentType) {
    return false;
  }

  return (
    contentType.includes(
      "application/json",
    ) ||
    contentType.includes(
      "+json",
    )
  );
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  if (
    response.status === 204 ||
    response.status === 205
  ) {
    return null;
  }

  const contentType =
    response.headers.get(
      "content-type",
    );

  const text =
    await response.text();

  if (!text) {
    return null;
  }

  if (
    isJsonContentType(contentType)
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    data &&
    typeof data === "object"
  ) {
    const object =
      data as HttpErrorData;

    if (
      typeof object.message ===
      "string"
    ) {
      return object.message;
    }

    if (
      typeof object.error ===
      "string"
    ) {
      return object.error;
    }
  }

  return fallback;
}

function isRetryableStatus(
  status: number,
  statuses: number[],
): boolean {
  return statuses.includes(status);
}

function sleep(
  milliseconds: number,
): Promise<void> {
  if (milliseconds <= 0) {
    return Promise.resolve();
  }

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds,
      ),
  );
}

function calculateRetryDelay(
  attempt: number,
  options: HttpRetryOptions,
): number {
  const base =
    Math.max(
      0,
      options.delayMs ?? 250,
    );

  const backoff =
    Math.max(
      1,
      options.backoff ?? 2,
    );

  const max =
    Math.max(
      base,
      options.maxDelayMs ?? 10_000,
    );

  return Math.min(
    max,
    base *
      Math.pow(
        backoff,
        Math.max(
          0,
          attempt - 1,
        ),
      ),
  );
}

function createAbortSignal(
  timeoutMs: number | undefined,
  signal?: AbortSignal,
): {
  signal?: AbortSignal;
  cleanup: () => void;
} {
  if (
    timeoutMs === undefined ||
    timeoutMs <= 0
  ) {
    return {
      signal,
      cleanup: () => undefined,
    };
  }

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(
          new Error(
            "HTTP request timeout.",
          ),
        ),
      timeoutMs,
    );

  const abortListener =
    () => {
      controller.abort(
        signal?.reason,
      );
    };

  if (signal) {
    if (signal.aborted) {
      controller.abort(
        signal.reason,
      );
    } else {
      signal.addEventListener(
        "abort",
        abortListener,
        { once: true },
      );
    }
  }

  return {
    signal:
      controller.signal,
    cleanup: () => {
      clearTimeout(timer);

      if (signal) {
        signal.removeEventListener(
          "abort",
          abortListener,
        );
      }
    },
  };
}

export function isHttpMethod(
  value: unknown,
): value is HttpMethod {
  return (
    typeof value === "string" &&
    [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
    ].includes(
      value.toUpperCase(),
    )
  );
}

export function normalizeHttpMethod(
  value: unknown,
): HttpMethod {
  const method =
    String(
      value ?? "GET",
    ).toUpperCase();

  if (
    !isHttpMethod(method)
  ) {
    return "GET";
  }

  return method;
}

export function isSuccessStatus(
  status: number,
): boolean {
  return (
    status >= 200 &&
    status < 300
  );
}

export function isRedirectStatus(
  status: number,
): boolean {
  return (
    status >= 300 &&
    status < 400
  );
}

export function isClientErrorStatus(
  status: number,
): boolean {
  return (
    status >= 400 &&
    status < 500
  );
}

export function isServerErrorStatus(
  status: number,
): boolean {
  return status >= 500;
}

export function isRetryableError(
  error: unknown,
): boolean {
  if (
    error instanceof HttpError
  ) {
    return (
      error.status === 408 ||
      error.status === 425 ||
      error.status === 429 ||
      error.status >= 500
    );
  }

  if (
    error instanceof Error
  ) {
    return (
      error.name ===
        "AbortError" ||
      error.name ===
        "TypeError" ||
      error.message
        .toLowerCase()
        .includes("network")
    );
  }

  return false;
}

export async function request<T = unknown>(
  url: string,
  options: HttpRequestOptions = {},
): Promise<HttpResult<T>> {
  const method =
    normalizeHttpMethod(
      options.method,
    );

  const response =
    await fetch(url, {
      ...options,
      method,
    });

  const data =
    await parseResponseBody(
      response,
    );

  return {
    ok: response.ok,
    status: response.status,
    statusText:
      response.statusText,
    headers: response.headers,
    data: data as T | null,
    response,
  };
}

export async function requestOrThrow<
  T = unknown,
>(
  url: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const result =
    await request<T>(
      url,
      options,
    );

  if (!result.ok) {
    throw new HttpError(
      getErrorMessage(
        result.data,
        `HTTP ${result.status}`,
      ),
      result.response,
      result.data,
    );
  }

  return result.data as T;
}

export async function requestWithRetry<
  T = unknown,
>(
  url: string,
  options: HttpRequestOptions = {},
  retryOptions: HttpRetryOptions = {},
): Promise<HttpResult<T>> {
  const retries = Math.max(
    0,
    Math.floor(
      retryOptions.retries ?? 2,
    ),
  );

  const retryMethods =
    retryOptions.retryMethods ??
    [
      "GET",
      "HEAD",
      "OPTIONS",
    ];

  const retryStatuses =
    retryOptions.retryStatuses ??
    [
      408,
      425,
      429,
      500,
      502,
      503,
      504,
    ];

  const method =
    normalizeHttpMethod(
      options.method,
    );

  let lastError:
    | unknown
    | undefined;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      const result =
        await request<T>(
          url,
          options,
        );

      if (
        result.ok ||
        !retryMethods.includes(
          method,
        ) ||
        !isRetryableStatus(
          result.status,
          retryStatuses,
        ) ||
        attempt >= retries
      ) {
        return result;
      }

      await sleep(
        calculateRetryDelay(
          attempt + 1,
          retryOptions,
        ),
      );
    } catch (error) {
      lastError = error;

      if (
        !retryMethods.includes(
          method,
        ) ||
        attempt >= retries ||
        !isRetryableError(error)
      ) {
        throw error;
      }

      await sleep(
        calculateRetryDelay(
          attempt + 1,
          retryOptions,
        ),
      );
    }
  }

  throw (
    lastError ??
    new Error(
      "HTTP request failed.",
    )
  );
}

export async function get<T = unknown>(
  url: string,
  options: Omit<
    HttpRequestOptions,
    "method" | "body"
  > = {},
): Promise<HttpResult<T>> {
  return request<T>(
    url,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function getOrThrow<
  T = unknown,
>(
  url: string,
  options: Omit<
    HttpRequestOptions,
    "method" | "body"
  > = {},
): Promise<T> {
  return requestOrThrow<T>(
    url,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function post<T = unknown>(
  url: string,
  body?: BodyInit | null,
  options: Omit<
    HttpRequestOptions,
    "method" | "body"
  > = {},
): Promise<HttpResult<T>> {
  return request<T>(
    url,
    {
      ...options,
      method: "POST",
      body,
    },
  );
}

export async function put<T = unknown>(
  url: string,
  body?: BodyInit | null,
  options: Omit<
    HttpRequestOptions,
    "method" | "body"
  > = {},
): Promise<HttpResult<T>> {
  return request<T>(
    url,
    {
      ...options,
      method: "PUT",
      body,
    },
  );
}

export async function patch<T = unknown>(
  url: string,
  body?: BodyInit | null,
  options: Omit<
    HttpRequestOptions,
    "method" | "body"
  > = {},
): Promise<HttpResult<T>> {
  return request<T>(
    url,
    {
      ...options,
      method: "PATCH",
      body,
    },
  );
}

export async function del<T = unknown>(
  url: string,
  options: Omit<
    HttpRequestOptions,
    "method"
  > = {},
): Promise<HttpResult<T>> {
  return request<T>(
    url,
    {
      ...options,
      method: "DELETE",
    },
  );
}

export async function head(
  url: string,
  options: Omit<
    HttpRequestOptions,
    "method" | "body"
  > = {},
): Promise<HttpResult<null>> {
  return request<null>(
    url,
    {
      ...options,
      method: "HEAD",
    },
  );
}

export function jsonBody(
  value: unknown,
): string {
  return JSON.stringify(
    value,
  );
}

export function jsonHeaders(
  headers?: HeadersInit,
): Headers {
  const result =
    toHeaders(headers);

  if (
    !result.has(
      "content-type",
    )
  ) {
    result.set(
      "content-type",
      CONTENT_TYPES.JSON ??
        "application/json",
    );
  }

  return result;
}

export function buildJsonRequest(
  body: unknown,
  options: HttpRequestOptions = {},
): HttpRequestOptions {
  return {
    ...options,
    headers: jsonHeaders(
      options.headers,
    ),
    body: jsonBody(body),
  };
}

export function buildFormRequest(
  body: FormData,
  options: HttpRequestOptions = {},
): HttpRequestOptions {
  return {
    ...options,
    body,
  };
}

export function getHeader(
  headers: HeadersInit,
  name: string,
): string | null {
  return toHeaders(
    headers,
  ).get(name);
}

export function hasHeader(
  headers: HeadersInit,
  name: string,
): boolean {
  return toHeaders(
    headers,
  ).has(name);
}

export function setHeader(
  headers: HeadersInit,
  name: string,
  value: string,
): Headers {
  const result =
    toHeaders(headers);

  result.set(
    name,
    value,
  );

  return result;
}

export function deleteHeader(
  headers: HeadersInit,
  name: string,
): Headers {
  const result =
    toHeaders(headers);

  result.delete(name);

  return result;
}

export function mergeHeaders(
  ...sources: Array<
    HeadersInit | undefined
  >
): Headers {
  const result =
    new Headers();

  for (const source of sources) {
    if (!source) {
      continue;
    }

    const headers =
      new Headers(source);

    headers.forEach(
      (value, key) => {
        result.set(
          key,
          value,
        );
      },
    );
  }

  return result;
}

export function contentType(
  response: Response,
): string | null {
  return response.headers.get(
    "content-type",
  );
}

export function contentLength(
  response: Response,
): number | null {
  const value =
    response.headers.get(
      "content-length",
    );

  if (!value) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export function responseRequestId(
  response: Response,
): string | null {
  return (
    response.headers.get(
      HEADERS.REQUEST_ID ??
        "x-request-id",
    ) ??
    response.headers.get(
      "x-request-id",
    )
  );
}

export function createHttpClient(
  options: HttpClientOptions = {},
) {
  const baseUrl =
    options.baseUrl ?? "";

  const defaultHeaders =
    new Headers(
      options.defaultHeaders,
    );

  async function send<T = unknown>(
    path: string,
    requestOptions: HttpRequestOptions = {},
  ): Promise<HttpResult<T>> {
    const url =
      joinUrl(
        baseUrl,
        path,
      );

    const headers =
      mergeHeaders(
        defaultHeaders,
        requestOptions.headers,
      );

    const timeout =
      createAbortSignal(
        options.timeoutMs,
        requestOptions.signal,
      );

    try {
      return await requestWithRetry<T>(
        url,
        {
          ...requestOptions,
          headers,
          signal: timeout.signal,
        },
        options.retry,
      );
    } finally {
      timeout.cleanup();
    }
  }

  return {
    request: send,

    get<T = unknown>(
      path: string,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ) {
      return send<T>(
        path,
        {
          ...requestOptions,
          method: "GET",
        },
      );
    },

    post<T = unknown>(
      path: string,
      body?: BodyInit | null,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ) {
      return send<T>(
        path,
        {
          ...requestOptions,
          method: "POST",
          body,
        },
      );
    },

    put<T = unknown>(
      path: string,
      body?: BodyInit | null,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ) {
      return send<T>(
        path,
        {
          ...requestOptions,
          method: "PUT",
          body,
        },
      );
    },

    patch<T = unknown>(
      path: string,
      body?: BodyInit | null,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ) {
      return send<T>(
        path,
        {
          ...requestOptions,
          method: "PATCH",
          body,
        },
      );
    },

    delete<T = unknown>(
      path: string,
      requestOptions: Omit<
        HttpRequestOptions,
        "method"
      > = {},
    ) {
      return send<T>(
        path,
        {
          ...requestOptions,
          method: "DELETE",
        },
      );
    },

    head(
      path: string,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ) {
      return send<null>(
        path,
        {
          ...requestOptions,
          method: "HEAD",
        },
      );
    },

    async getOrThrow<T = unknown>(
      path: string,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ): Promise<T> {
      const result =
        await send<T>(
          path,
          {
            ...requestOptions,
            method: "GET",
          },
        );

      if (!result.ok) {
        throw new HttpError(
          getErrorMessage(
            result.data,
            `HTTP ${result.status}`,
          ),
          result.response,
          result.data,
        );
      }

      return result.data as T;
    },

    async postJson<T = unknown>(
      path: string,
      body: unknown,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ): Promise<HttpResult<T>> {
      return send<T>(
        path,
        buildJsonRequest(
          body,
          {
            ...requestOptions,
            method: "POST",
          },
        ),
      );
    },

    async putJson<T = unknown>(
      path: string,
      body: unknown,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ): Promise<HttpResult<T>> {
      return send<T>(
        path,
        buildJsonRequest(
          body,
          {
            ...requestOptions,
            method: "PUT",
          },
        ),
      );
    },

    async patchJson<T = unknown>(
      path: string,
      body: unknown,
      requestOptions: Omit<
        HttpRequestOptions,
        "method" | "body"
      > = {},
    ): Promise<HttpResult<T>> {
      return send<T>(
        path,
        buildJsonRequest(
          body,
          {
            ...requestOptions,
            method: "PATCH",
          },
        ),
      );
    },
  };
}

export const http = createHttpClient({
  timeoutMs:
    HTTP.REQUEST_TIMEOUT_MS ?? 30_000,
  retry: {
    retries: 2,
    delayMs: 250,
    backoff: 2,
    maxDelayMs: 5_000,
  },
});
