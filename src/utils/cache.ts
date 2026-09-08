// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// CACHE UTILITIES
// Version: 2026.09
// ============================================================

export interface CacheEntry<T = unknown> {
  value: T;
  createdAt: number;
  expiresAt: number;
  staleAt?: number;
}

export interface CacheOptions {
  ttlMs?: number;
  staleMs?: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export interface CacheResult<T> {
  value: T | null;
  hit: boolean;
  stale: boolean;
}

const DEFAULT_TTL_MS = 60_000;

const memoryCache = new Map<
  string,
  CacheEntry
>();

let cacheHits = 0;
let cacheMisses = 0;

/**
 * Нормализует cache key.
 */
export function normalizeCacheKey(
  key: string
): string {
  return key.trim();
}

/**
 * Создает cache key из namespace и частей.
 */
export function createCacheKey(
  namespace: string,
  ...parts: unknown[]
): string {
  const normalizedNamespace =
    namespace
      .trim()
      .toLocaleLowerCase();

  const normalizedParts = parts
    .map((part) => {
      if (
        part === null ||
        part === undefined
      ) {
        return "";
      }

      if (typeof part === "string") {
        return part.trim();
      }

      if (
        typeof part === "number" ||
        typeof part === "boolean" ||
        typeof part === "bigint"
      ) {
        return String(part);
      }

      try {
        return JSON.stringify(part);
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  return [
    normalizedNamespace,
    ...normalizedParts,
  ].join(":");
}

/**
 * Записывает значение в memory cache.
 */
export function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): void {
  const normalizedKey =
    normalizeCacheKey(key);

  if (!normalizedKey) {
    return;
  }

  const ttl =
    options.ttlMs ?? DEFAULT_TTL_MS;

  if (
    !Number.isFinite(ttl) ||
    ttl <= 0
  ) {
    throw new Error("Invalid cache TTL");
  }

  const now = Date.now();

  const entry: CacheEntry<T> = {
    value,
    createdAt: now,
    expiresAt: now + ttl,
  };

  if (
    options.staleMs !== undefined &&
    Number.isFinite(options.staleMs) &&
    options.staleMs > 0
  ) {
    entry.staleAt =
      entry.expiresAt +
      options.staleMs;
  }

  memoryCache.set(
    normalizedKey,
    entry
  );
}

/**
 * Получает значение из memory cache.
 */
export function cacheGet<T>(
  key: string
): CacheResult<T> {
  const normalizedKey =
    normalizeCacheKey(key);

  if (!normalizedKey) {
    cacheMisses++;

    return {
      value: null,
      hit: false,
      stale: false,
    };
  }

  const entry =
    memoryCache.get(
      normalizedKey
    ) as CacheEntry<T> | undefined;

  if (!entry) {
    cacheMisses++;

    return {
      value: null,
      hit: false,
      stale: false,
    };
  }

  const now = Date.now();

  if (now < entry.expiresAt) {
    cacheHits++;

    return {
      value: entry.value,
      hit: true,
      stale: false,
    };
  }

  if (
    entry.staleAt !== undefined &&
    now < entry.staleAt
  ) {
    cacheHits++;

    return {
      value: entry.value,
      hit: true,
      stale: true,
    };
  }

  memoryCache.delete(
    normalizedKey
  );

  cacheMisses++;

  return {
    value: null,
    hit: false,
    stale: false,
  };
}

/**
 * Получает значение или создает его через factory.
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T> | T,
  options: CacheOptions = {}
): Promise<T> {
  const cached =
    cacheGet<T>(key);

  if (
    cached.hit &&
    cached.value !== null
  ) {
    return cached.value;
  }

  const value =
    await factory();

  cacheSet(
    key,
    value,
    options
  );

  return value;
}

/**
 * Удаляет cache entry.
 */
export function cacheDelete(
  key: string
): boolean {
  return memoryCache.delete(
    normalizeCacheKey(key)
  );
}

/**
 * Проверяет наличие cache entry.
 */
export function cacheHas(
  key: string
): boolean {
  const result =
    cacheGet(key);

  return result.hit;
}

/**
 * Очищает весь memory cache.
 */
export function cacheClear(): void {
  memoryCache.clear();
}

/**
 * Удаляет expired entries.
 */
export function cacheCleanup(
  now = Date.now()
): number {
  let deleted = 0;

  for (
    const [
      key,
      entry
    ] of memoryCache
  ) {
    const expiration =
      entry.staleAt ??
      entry.expiresAt;

    if (now >= expiration) {
      memoryCache.delete(key);
      deleted++;
    }
  }

  return deleted;
}

/**
 * Возвращает статистику cache.
 */
export function cacheStats(): CacheStats {
  const total =
    cacheHits + cacheMisses;

  return {
    size: memoryCache.size,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate:
      total === 0
        ? 0
        : cacheHits / total,
  };
}

/**
 * Сбрасывает статистику cache.
 */
export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Возвращает все cache keys.
 */
export function cacheKeys(): string[] {
  return Array.from(
    memoryCache.keys()
  );
}

/**
 * Удаляет записи по prefix.
 */
export function cacheDeleteByPrefix(
  prefix: string
): number {
  const normalizedPrefix =
    prefix.trim();

  if (!normalizedPrefix) {
    return 0;
  }

  let deleted = 0;

  for (
    const key of memoryCache.keys()
  ) {
    if (
      key.startsWith(
        normalizedPrefix
      )
    ) {
      memoryCache.delete(key);
      deleted++;
    }
  }

  return deleted;
}

/**
 * Удаляет записи по namespace.
 */
export function cacheInvalidateNamespace(
  namespace: string
): number {
  return cacheDeleteByPrefix(
    `${namespace.trim()}:`
  );
}

/**
 * Создает заголовки Cache-Control.
 */
export function cacheControl(
  options: {
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    staleIfError?: number;
    public?: boolean;
    private?: boolean;
    noCache?: boolean;
    noStore?: boolean;
  } = {}
): string {
  const directives: string[] = [];

  if (options.public) {
    directives.push("public");
  }

  if (options.private) {
    directives.push("private");
  }

  if (options.noStore) {
    directives.push("no-store");
  }

  if (options.noCache) {
    directives.push("no-cache");
  }

  if (
    options.maxAge !== undefined &&
    Number.isFinite(options.maxAge) &&
    options.maxAge >= 0
  ) {
    directives.push(
      `max-age=${Math.floor(options.maxAge)}`
    );
  }

  if (
    options.sMaxAge !== undefined &&
    Number.isFinite(options.sMaxAge) &&
    options.sMaxAge >= 0
  ) {
    directives.push(
      `s-maxage=${Math.floor(options.sMaxAge)}`
    );
  }

  if (
    options.staleWhileRevalidate !== undefined &&
    Number.isFinite(options.staleWhileRevalidate) &&
    options.staleWhileRevalidate >= 0
  ) {
    directives.push(
      `stale-while-revalidate=${Math.floor(
        options.staleWhileRevalidate
      )}`
    );
  }

  if (
    options.staleIfError !== undefined &&
    Number.isFinite(options.staleIfError) &&
    options.staleIfError >= 0
  ) {
    directives.push(
      `stale-if-error=${Math.floor(
        options.staleIfError
      )}`
    );
  }

  return directives.join(", ");
}

/**
 * Cache-Control для публичного контента.
 */
export function publicCacheControl(
  maxAge = 60,
  sMaxAge = 300
): string {
  return cacheControl({
    public: true,
    maxAge,
    sMaxAge,
    staleWhileRevalidate: 60,
    staleIfError: 300,
  });
}

/**
 * Cache-Control для приватных данных.
 */
export function privateCacheControl(
  maxAge = 0
): string {
  return cacheControl({
    private: true,
    maxAge,
    noCache: maxAge === 0,
  });
}

/**
 * Cache-Control для чувствительных данных.
 */
export function noStoreCacheControl(): string {
  return cacheControl({
    noStore: true,
    noCache: true,
  });
}

/**
 * Применяет Cache-Control к Response.
 */
export function withCacheControl(
  response: Response,
  value: string
): Response {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "Cache-Control",
    value
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

/**
 * Делает Response публично кэшируемым.
 */
export function withPublicCache(
  response: Response,
  maxAge = 60,
  sMaxAge = 300
): Response {
  return withCacheControl(
    response,
    publicCacheControl(
      maxAge,
      sMaxAge
    )
  );
}

/**
 * Запрещает кэширование Response.
 */
export function withNoStore(
  response: Response
): Response {
  return withCacheControl(
    response,
    noStoreCacheControl()
  );
}

/**
 * Добавляет ETag.
 */
export async function withEtag(
  response: Response,
  content: string
): Promise<Response> {
  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(
        content
      )
    );

  const bytes =
    new Uint8Array(digest);

  let hex = "";

  for (const byte of bytes) {
    hex += byte
      .toString(16)
      .padStart(2, "0");
  }

  const etag = `"${hex}"`;

  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "ETag",
    etag
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

/**
 * Проверяет If-None-Match.
 */
export function matchesEtag(
  request: Request,
  etag: string
): boolean {
  const provided =
    request.headers.get(
      "If-None-Match"
    );

  if (!provided) {
    return false;
  }

  return provided
    .split(",")
    .map((value) => value.trim())
    .some(
      (value) =>
        value === etag ||
        value === "*"
    );
}

/**
 * Создает 304 Not Modified.
 */
export function notModified(
  etag?: string
): Response {
  const headers =
    new Headers();

  if (etag) {
    headers.set(
      "ETag",
      etag
    );
  }

  headers.set(
    "Cache-Control",
    publicCacheControl()
  );

  return new Response(
    null,
    {
      status: 304,
      headers,
    }
  );
}

/**
 * Простой stale-while-revalidate helper.
 *
 * Возвращает старое значение,
 * пока factory выполняется в фоне.
 */
export async function staleWhileRevalidate<T>(
  key: string,
  factory: () => Promise<T>,
  options: {
    ttlMs?: number;
    staleMs?: number;
  } = {}
): Promise<T> {
  const cached =
    cacheGet<T>(key);

  if (
    cached.hit &&
    !cached.stale &&
    cached.value !== null
  ) {
    return cached.value;
  }

  if (
    cached.hit &&
    cached.stale &&
    cached.value !== null
  ) {
    void refreshCache(
      key,
      factory,
      options
    );

    return cached.value;
  }

  return await refreshCache(
    key,
    factory,
    options
  );
}

/**
 * Обновляет cache.
 */
async function refreshCache<T>(
  key: string,
  factory: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const value =
    await factory();

  cacheSet(
    key,
    value,
    options
  );

  return value;
}

/**
 * Создает cache key для публикации.
 */
export function publicationCacheKey(
  publicationId: string
): string {
  return createCacheKey(
    "publication",
    publicationId
  );
}

/**
 * Создает cache key для списка публикаций.
 */
export function publicationsListCacheKey(
  query: unknown
): string {
  return createCacheKey(
    "publications:list",
    query
  );
}

/**
 * Создает cache key для категории.
 */
export function categoryCacheKey(
  categoryId: string
): string {
  return createCacheKey(
    "category",
    categoryId
  );
}

/**
 * Создает cache key для профиля.
 */
export function profileCacheKey(
  profileId: string
): string {
  return createCacheKey(
    "profile",
    profileId
  );
}

/**
 * Создает cache key для статистики.
 */
export function statisticsCacheKey(
  scope: string,
  ...parts: unknown[]
): string {
  return createCacheKey(
    "statistics",
    scope,
    ...parts
  );
}

/**
 * Создает cache key для настроек.
 */
export function settingsCacheKey(
  key: string
): string {
  return createCacheKey(
    "setting",
    key
  );
}

/**
 * Создает cache key для feature flag.
 */
export function featureFlagCacheKey(
  key: string
): string {
  return createCacheKey(
    "feature",
    key
  );
    }
