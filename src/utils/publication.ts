// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// PUBLICATION UTILITIES
// Version: 2026.09.10 POWER PRODUCTION
// ============================================================
//
// Единый utility-layer для publication.
//
// Основные задачи:
// - публичные номера публикаций
// - URL routing
// - absolute / relative URLs
// - publication ID
// - publication slug
// - диапазоны номеров
// - соседние публикации
// - безопасная нормализация контента
// - query parameters
// - pagination helpers
// - сравнение и сортировка
// - backward compatibility
// - удобные helpers для services
//
// ВАЖНО:
// public number и internal publication ID — разные сущности.
//
// Public number:
//   /1
//   /25
//   /100
//
// Internal ID:
//   pub_xxxxxxxxxxxxxxxxxxxx
//
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type PublicationNumberInput =
  | string
  | number
  | null
  | undefined;

export interface PublicationNumberRange {
  from: number;
  to: number;
}

export interface PublicationUrlInfo {
  number: number;
  path: string;
  url: string;
}

export interface PublicationNavigation {
  current: number;
  previous: number | null;
  next: number | null;
  previousPath: string | null;
  nextPath: string | null;
}

export interface PublicationSlugInfo {
  slug: string;
  valid: boolean;
  length: number;
}

export interface PublicationContentInfo {
  hasTitle: boolean;
  hasText: boolean;
  hasMedia: boolean;
  hasLinks: boolean;
  hasDocuments: boolean;
  hasContent: boolean;
}

export interface PublicationQueryOptions {
  page?: string | number;
  limit?: string | number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  featured?: boolean | string | number;
  pinned?: boolean | string | number;
}

export interface NormalizedPublicationQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  featured?: boolean;
  pinned?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

export const PUBLICATION_NUMBER_MIN = 1;

export const PUBLICATION_NUMBER_MAX =
  Number.MAX_SAFE_INTEGER;

export const PUBLICATION_RANGE_MAX_SIZE =
  10_000;

export const PUBLICATION_TITLE_MAX_LENGTH =
  300;

export const PUBLICATION_TEXT_MAX_LENGTH =
  50_000;

export const PUBLICATION_SLUG_MAX_LENGTH =
  180;

export const PUBLICATION_SEARCH_MAX_LENGTH =
  200;

export const PUBLICATION_PAGE_DEFAULT =
  1;

export const PUBLICATION_LIMIT_DEFAULT =
  20;

export const PUBLICATION_LIMIT_MAX =
  100;

// ============================================================
// BASIC PUBLIC NUMBER NORMALIZATION
// ============================================================

/**
 * Нормализует публичный номер публикации.
 *
 * Примеры:
 * "1"    -> 1
 * 25     -> 25
 * "025"  -> 25
 * ""     -> null
 * "12a"  -> null
 * 0      -> null
 *
 * Публичный номер всегда является положительным
 * безопасным целым числом.
 */
export function normalizePublicNumber(
  value: PublicationNumberInput
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "number"
  ) {
    if (
      !Number.isSafeInteger(
        value
      ) ||
      value <
        PUBLICATION_NUMBER_MIN
    ) {
      return null;
    }

    return value;
  }

  const text =
    String(value).trim();

  if (!text) {
    return null;
  }

  if (!/^\d+$/.test(text)) {
    return null;
  }

  const number =
    Number(text);

  if (
    !Number.isSafeInteger(
      number
    ) ||
    number <
      PUBLICATION_NUMBER_MIN
  ) {
    return null;
  }

  return number;
}

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================
//
// Старые services используют именно это имя.
// Оно намеренно возвращает number и выбрасывает ошибку
// при некорректном значении.
// ============================================================

export function normalizePublicationNumber(
  value:
    | string
    | number
): number {
  const normalized =
    normalizePublicNumber(
      value
    );

  if (
    normalized === null
  ) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return normalized;
}

// ============================================================
// NUMBER VALIDATION
// ============================================================

export function isValidPublicNumber(
  value: PublicationNumberInput
): boolean {
  return (
    normalizePublicNumber(
      value
    ) !== null
  );
}

export function isPositivePublicationNumber(
  value: PublicationNumberInput
): value is string | number {
  return isValidPublicNumber(
    value
  );
}

// ============================================================
// PUBLIC NUMBER ASSERTION
// ============================================================

export function assertPublicationNumber(
  value:
    | string
    | number
): number {
  return normalizePublicationNumber(
    value
  );
}

export function publicationNumberParam(
  value:
    | string
    | number
): number {
  return assertPublicationNumber(
    value
  );
}

// ============================================================
// PUBLICATION PATH
// ============================================================

export function publicationPath(
  value:
    | string
    | number
): string {
  const number =
    normalizePublicNumber(
      value
    );

  if (
    number === null
  ) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return `/${number}`;
}

// ============================================================
// PUBLICATION URL
// ============================================================

export function publicationUrl(
  origin: string,
  value:
    | string
    | number
): string {
  if (
    typeof origin !==
    "string"
  ) {
    throw new Error(
      "Invalid publication origin"
    );
  }

  const cleanOrigin =
    origin
      .trim()
      .replace(
        /\/+$/,
        ""
      );

  if (
    !cleanOrigin
  ) {
    throw new Error(
      "Publication origin cannot be empty"
    );
  }

  return `${cleanOrigin}${publicationPath(
    value
  )}`;
}

// ============================================================
// URL ALIASES
// ============================================================

export function getPublicationUrl(
  origin: string,
  value:
    | string
    | number
): string {
  return publicationUrl(
    origin,
    value
  );
}

export function getPublicationPath(
  value:
    | string
    | number
): string {
  return publicationPath(
    value
  );
}

export function normalizePublicationUrl(
  origin: string,
  value:
    | string
    | number
): string {
  return publicationUrl(
    origin,
    value
  );
}

// ============================================================
// PATH CHECKING
// ============================================================

export function isPublicationPath(
  pathname: string
): boolean {
  if (
    typeof pathname !==
    "string"
  ) {
    return false;
  }

  return /^\/\d+$/.test(
    pathname.trim()
  );
}

// ============================================================
// EXTRACT NUMBER FROM PATH
// ============================================================

export function getPublicationNumberFromPath(
  pathname: string
): number | null {
  if (
    typeof pathname !==
    "string"
  ) {
    return null;
  }

  const normalized =
    pathname
      .trim()
      .replace(
        /\/+/g,
        "/"
      );

  const value =
    normalized.match(
      /^\/(\d+)$/
    )?.[1];

  return normalizePublicNumber(
    value
  );
}

// ============================================================
// EXTRACT NUMBER FROM URL
// ============================================================

export function extractPublicationNumberFromUrl(
  value: string
): number | null {
  if (
    typeof value !==
    "string" ||
    !value.trim()
  ) {
    return null;
  }

  try {
    const url =
      new URL(value);

    return getPublicationNumberFromPath(
      url.pathname
    );
  } catch {
    return null;
  }
}

export function getPublicationNumberFromUrl(
  value: string
): number | null {
  return extractPublicationNumberFromUrl(
    value
  );
}

// ============================================================
// PATH MATCHING
// ============================================================

export function matchesPublicationPath(
  pathname: string,
  publicationNumber:
    | string
    | number
): boolean {
  const current =
    getPublicationNumberFromPath(
      pathname
    );

  const expected =
    normalizePublicNumber(
      publicationNumber
    );

  if (
    current === null ||
    expected === null
  ) {
    return false;
  }

  return current === expected;
}

// ============================================================
// DATABASE NUMBER NORMALIZATION
// ============================================================

export function normalizePublicationNumberForDb(
  value:
    | string
    | number
): number {
  return normalizePublicationNumber(
    value
  );
}

// ============================================================
// NEXT NUMBER
// ============================================================

export function nextPublicationNumber(
  currentMaximum:
    | string
    | number
    | null
    | undefined
): number {
  const current =
    normalizePublicNumber(
      currentMaximum
    );

  if (
    current === null
  ) {
    return 1;
  }

  if (
    current >=
    PUBLICATION_NUMBER_MAX
  ) {
    throw new Error(
      "Publication number limit reached"
    );
  }

  return current + 1;
}

// ============================================================
// PREVIOUS NUMBER
// ============================================================

export function previousPublicationNumber(
  current:
    | string
    | number
): number | null {
  const number =
    normalizePublicNumber(
      current
    );

  if (
    number === null ||
    number <=
      PUBLICATION_NUMBER_MIN
  ) {
    return null;
  }

  return number - 1;
}

// ============================================================
// NEXT / PREVIOUS URLS
// ============================================================

export function nextPublicationUrl(
  origin: string,
  current:
    | string
    | number
): string {
  const number =
    normalizePublicationNumber(
      current
    );

  if (
    number >=
    PUBLICATION_NUMBER_MAX
  ) {
    throw new Error(
      "Publication number limit reached"
    );
  }

  return publicationUrl(
    origin,
    number + 1
  );
}

export function previousPublicationUrl(
  origin: string,
  current:
    | string
    | number
): string | null {
  const previous =
    previousPublicationNumber(
      current
    );

  if (
    previous === null
  ) {
    return null;
  }

  return publicationUrl(
    origin,
    previous
  );
}

// ============================================================
// NAVIGATION
// ============================================================

export function getPublicationNavigation(
  origin: string,
  current:
    | string
    | number
): PublicationNavigation {
  const number =
    normalizePublicationNumber(
      current
    );

  const previous =
    previousPublicationNumber(
      number
    );

  const next =
    number >=
    PUBLICATION_NUMBER_MAX
      ? null
      : number + 1;

  return {
    current: number,

    previous,

    next,

    previousPath:
      previous === null
        ? null
        : publicationPath(
            previous
          ),

    nextPath:
      next === null
        ? null
        : publicationPath(
            next
          ),
  };
}

// ============================================================
// NUMBER COMPARISON
// ============================================================

export function comparePublicationNumbers(
  a:
    | string
    | number,
  b:
    | string
    | number
): number {
  const first =
    normalizePublicNumber(
      a
    );

  const second =
    normalizePublicNumber(
      b
    );

  if (
    first === null ||
    second === null
  ) {
    throw new Error(
      "Invalid publication number"
    );
  }

  if (
    first < second
  ) {
    return -1;
  }

  if (
    first > second
  ) {
    return 1;
  }

  return 0;
}

export function sortPublicationNumbers(
  values: Array<
    string | number
  >,
  direction:
    | "asc"
    | "desc" = "asc"
): number[] {
  const numbers =
    values.map(
      normalizePublicationNumber
    );

  if (
    numbers.some(
      (value) =>
        value === null
    )
  ) {
    throw new Error(
      "Invalid publication number in list"
    );
  }

  const result =
    numbers as number[];

  result.sort(
    (a, b) =>
      direction === "desc"
        ? b - a
        : a - b
  );

  return result;
}

// ============================================================
// NUMBER RANGE
// ============================================================

export function isPublicationNumberInRange(
  value:
    | string
    | number,
  min:
    | string
    | number,
  max:
    | string
    | number
): boolean {
  const current =
    normalizePublicNumber(
      value
    );

  const minimum =
    normalizePublicNumber(
      min
    );

  const maximum =
    normalizePublicNumber(
      max
    );

  if (
    current === null ||
    minimum === null ||
    maximum === null
  ) {
    return false;
  }

  return (
    current >= minimum &&
    current <= maximum
  );
}

export function createPublicationNumberRange(
  from:
    | string
    | number,
  to:
    | string
    | number
): PublicationNumberRange {
  const first =
    normalizePublicNumber(
      from
    );

  const last =
    normalizePublicNumber(
      to
    );

  if (
    first === null ||
    last === null
  ) {
    throw new Error(
      "Invalid publication number range"
    );
  }

  if (
    first > last
  ) {
    throw new Error(
      "Publication range start cannot be greater than end"
    );
  }

  return {
    from: first,
    to: last,
  };
}

export function isValidPublicationRange(
  from:
    | string
    | number,
  to:
    | string
    | number
): boolean {
  try {
    createPublicationNumberRange(
      from,
      to
    );

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// GENERATE NUMBER RANGE
// ============================================================

export function generatePublicationNumbers(
  from:
    | string
    | number,
  to:
    | string
    | number
): number[] {
  const range =
    createPublicationNumberRange(
      from,
      to
    );

  const size =
    range.to -
    range.from +
    1;

  if (
    size >
    PUBLICATION_RANGE_MAX_SIZE
  ) {
    throw new Error(
      "Publication number range is too large"
    );
  }

  const result: number[] =
    [];

  for (
    let number =
      range.from;
    number <=
      range.to;
    number++
  ) {
    result.push(
      number
    );
  }

  return result;
}

// ============================================================
// FORMATTERS
// ============================================================

export function formatPublicationNumber(
  value:
    | string
    | number
): string {
  const number =
    normalizePublicNumber(
      value
    );

  if (
    number === null
  ) {
    return "";
  }

  return `#${number}`;
}

export function publicPublicationLabel(
  value:
    | string
    | number
): string {
  return formatPublicationNumber(
    value
  );
}

export function formatPublicationNumberPadded(
  value:
    | string
    | number,
  width = 4
): string {
  const number =
    normalizePublicNumber(
      value
    );

  if (
    number === null
  ) {
    return "";
  }

  if (
    !Number.isInteger(width) ||
    width < 1 ||
    width > 20
  ) {
    throw new Error(
      "Invalid publication number width"
    );
  }

  return String(
    number
  ).padStart(
    width,
    "0"
  );
}

// ============================================================
// PUBLICATION URL INFO
// ============================================================

export function getPublicationUrlInfo(
  origin: string,
  value:
    | string
    | number
): PublicationUrlInfo {
  const number =
    normalizePublicNumber(
      value
    );

  if (
    number === null
  ) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return {
    number,

    path:
      publicationPath(
        number
      ),

    url:
      publicationUrl(
        origin,
        number
      ),
  };
}

// ============================================================
// PUBLICATION ID
// ============================================================

export function isValidPublicationId(
  value:
    | string
    | null
    | undefined
): boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  const text =
    value.trim();

  if (
    !text ||
    text.length >
      200
  ) {
    return false;
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      text
    )
  ) {
    return false;
  }

  return (
    /^[a-zA-Z0-9_-]+$/.test(
      text
    )
  );
}

export function normalizePublicationId(
  value:
    | string
    | null
    | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text =
    value.trim();

  if (
    !isValidPublicationId(
      text
    )
  ) {
    return null;
  }

  return text;
}

export function assertPublicationId(
  value: string
): string {
  const id =
    normalizePublicationId(
      value
    );

  if (
    id === null
  ) {
    throw new Error(
      "Invalid publication ID"
    );
  }

  return id;
}

// ============================================================
// PUBLICATION NUMBER DETECTION
// ============================================================

export function looksLikePublicationNumber(
  value: string
): boolean {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  return /^\d+$/.test(
    value.trim()
  );
}

export function looksLikePublicationId(
  value: string
): boolean {
  return (
    !looksLikePublicationNumber(
      value
    ) &&
    isValidPublicationId(
      value
    )
  );
}

// ============================================================
// SLUG NORMALIZATION
// ============================================================

export function normalizePublicationSlug(
  value:
    | string
    | null
    | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const slug =
    value
      .normalize(
        "NFKC"
      )
      .trim()
      .toLowerCase()
      .replace(
        /[_\s]+/g,
        "-"
      )
      .replace(
        /[^a-z0-9а-яё\-]+/gi,
        ""
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(
        0,
        PUBLICATION_SLUG_MAX_LENGTH
      );

  if (
    !slug
  ) {
    return null;
  }

  return slug;
}

export function isValidPublicationSlug(
  value:
    | string
    | null
    | undefined
): boolean {
  const normalized =
    normalizePublicationSlug(
      value
    );

  return (
    normalized !== null &&
    normalized.length > 0
  );
}

export function publicationSlugInfo(
  value:
    | string
    | null
    | undefined
): PublicationSlugInfo {
  const slug =
    normalizePublicationSlug(
      value
    );

  return {
    slug:
      slug ?? "",

    valid:
      slug !== null,

    length:
      slug?.length ?? 0,
  };
}

// ============================================================
// TITLE NORMALIZATION
// ============================================================

export function normalizePublicationTitle(
  value:
    | string
    | null
    | undefined,
  maxLength =
    PUBLICATION_TITLE_MAX_LENGTH
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    !Number.isInteger(
      maxLength
    ) ||
    maxLength < 1
  ) {
    maxLength =
      PUBLICATION_TITLE_MAX_LENGTH;
  }

  return value
    .normalize(
      "NFKC"
    )
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .slice(
      0,
      maxLength
    );
}

// ============================================================
// TEXT NORMALIZATION
// ============================================================

export function normalizePublicationText(
  value:
    | string
    | null
    | undefined,
  maxLength =
    PUBLICATION_TEXT_MAX_LENGTH
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    !Number.isInteger(
      maxLength
    ) ||
    maxLength < 1
  ) {
    maxLength =
      PUBLICATION_TEXT_MAX_LENGTH;
  }

  return value
    .normalize(
      "NFKC"
    )
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ""
    )
    .replace(
      /\r\n/g,
      "\n"
    )
    .trim()
    .slice(
      0,
      maxLength
    );
}

// ============================================================
// SEARCH TEXT
// ============================================================

export function normalizePublicationSearchQuery(
  value:
    | string
    | null
    | undefined
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return value
    .normalize(
      "NFKC"
    )
    .trim()
    .replace(
      /\s+/g,
      " "
    )
    .slice(
      0,
      PUBLICATION_SEARCH_MAX_LENGTH
    );
}

// ============================================================
// CONTENT CHECKING
// ============================================================

export function hasPublicationContent(
  title:
    | string
    | null
    | undefined,
  text:
    | string
    | null
    | undefined
): boolean {
  return Boolean(
    normalizePublicationTitle(
      title
    ) ||
    normalizePublicationText(
      text
    )
  );
}

export function hasAnyPublicationContent(
  content: {
    title?: string | null;
    text?: string | null;
    images?: unknown[];
    videos?: unknown[];
    documents?: unknown[];
    links?: unknown[];
  }
): boolean {
  if (
    hasPublicationContent(
      content.title,
      content.text
    )
  ) {
    return true;
  }

  if (
    Array.isArray(
      content.images
    ) &&
    content.images.length >
      0
  ) {
    return true;
  }

  if (
    Array.isArray(
      content.videos
    ) &&
    content.videos.length >
      0
  ) {
    return true;
  }

  if (
    Array.isArray(
      content.documents
    ) &&
    content.documents.length >
      0
  ) {
    return true;
  }

  if (
    Array.isArray(
      content.links
    ) &&
    content.links.length >
      0
  ) {
    return true;
  }

  return false;
}

// ============================================================
// CONTENT ANALYSIS
// ============================================================

export function analyzePublicationContent(
  content: {
    title?: string | null;
    text?: string | null;
    images?: unknown[];
    videos?: unknown[];
    documents?: unknown[];
    links?: unknown[];
  }
): PublicationContentInfo {
  const hasTitle =
    normalizePublicationTitle(
      content.title
    ).length >
    0;

  const hasText =
    normalizePublicationText(
      content.text
    ).length >
    0;

  const hasMedia =
    (
      Array.isArray(
        content.images
      ) &&
      content.images.length >
        0
    ) ||
    (
      Array.isArray(
        content.videos
      ) &&
      content.videos.length >
        0
    );

  const hasDocuments =
    Array.isArray(
      content.documents
    ) &&
    content.documents.length >
      0;

  const hasLinks =
    Array.isArray(
      content.links
    ) &&
    content.links.length >
      0;

  return {
    hasTitle,
    hasText,
    hasMedia,
    hasLinks,
    hasDocuments,

    hasContent:
      hasTitle ||
      hasText ||
      hasMedia ||
      hasDocuments ||
      hasLinks,
  };
}

// ============================================================
// QUERY NORMALIZATION
// ============================================================

function normalizePositiveInteger(
  value: unknown,
  fallback: number,
  maximum?: number
): number {
  const number =
    typeof value ===
    "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      number
    ) ||
    !Number.isInteger(
      number
    ) ||
    number < 1
  ) {
    return fallback;
  }

  if (
    maximum !== undefined
  ) {
    return Math.min(
      number,
      maximum
    );
  }

  return number;
}

function normalizeOptionalBoolean(
  value: unknown
): boolean | undefined {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  if (
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "yes"
  ) {
    return true;
  }

  if (
    value === 0 ||
    value === "0" ||
    value === "false" ||
    value === "no"
  ) {
    return false;
  }

  return undefined;
}

export function normalizePublicationQuery(
  options:
    | PublicationQueryOptions
    | null
    | undefined
): NormalizedPublicationQuery {
  const source =
    options ?? {};

  const page =
    normalizePositiveInteger(
      source.page,
      PUBLICATION_PAGE_DEFAULT
    );

  const limit =
    normalizePositiveInteger(
      source.limit,
      PUBLICATION_LIMIT_DEFAULT,
      PUBLICATION_LIMIT_MAX
    );

  const search =
    normalizePublicationSearchQuery(
      source.search
    );

  const result: NormalizedPublicationQuery = {
    page,
    limit,
  };

  if (
    search
  ) {
    result.search =
      search;
  }

  if (
    typeof source.category ===
      "string" &&
    source.category.trim()
  ) {
    result.category =
      source.category.trim();
  }

  if (
    typeof source.status ===
      "string" &&
    source.status.trim()
  ) {
    result.status =
      source.status.trim();
  }

  if (
    typeof source.sort ===
      "string" &&
    source.sort.trim()
  ) {
    result.sort =
      source.sort.trim();
  }

  const featured =
    normalizeOptionalBoolean(
      source.featured
    );

  if (
    featured !== undefined
  ) {
    result.featured =
      featured;
  }

  const pinned =
    normalizeOptionalBoolean(
      source.pinned
    );

  if (
    pinned !== undefined
  ) {
    result.pinned =
      pinned;
  }

  return result;
}

// ============================================================
// QUERY STRING
// ============================================================

export function publicationQueryString(
  options:
    | PublicationQueryOptions
    | null
    | undefined
): string {
  const query =
    normalizePublicationQuery(
      options
    );

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(query.page)
  );

  params.set(
    "limit",
    String(query.limit)
  );

  if (
    query.search
  ) {
    params.set(
      "search",
      query.search
    );
  }

  if (
    query.category
  ) {
    params.set(
      "category",
      query.category
    );
  }

  if (
    query.status
  ) {
    params.set(
      "status",
      query.status
    );
  }

  if (
    query.sort
  ) {
    params.set(
      "sort",
      query.sort
    );
  }

  if (
    query.featured !==
    undefined
  ) {
    params.set(
      "featured",
      query.featured
        ? "1"
        : "0"
    );
  }

  if (
    query.pinned !==
    undefined
  ) {
    params.set(
      "pinned",
      query.pinned
        ? "1"
        : "0"
    );
  }

  return params.toString();
}

// ============================================================
// URL WITH QUERY
// ============================================================

export function publicationUrlWithQuery(
  origin: string,
  value:
    | string
    | number,
  options:
    | PublicationQueryOptions
    | null
    | undefined
): string {
  const url =
    publicationUrl(
      origin,
      value
    );

  const query =
    publicationQueryString(
      options
    );

  return query
    ? `${url}?${query}`
    : url;
}

// ============================================================
// PUBLICATION SLUG + NUMBER
// ============================================================

export function publicationSlugPath(
  slug: string
): string {
  const normalized =
    normalizePublicationSlug(
      slug
    );

  if (
    normalized === null
  ) {
    throw new Error(
      "Invalid publication slug"
    );
  }

  return `/p/${encodeURIComponent(
    normalized
  )}`;
}

export function publicationNumberAndSlugPath(
  number:
    | string
    | number,
  slug:
    | string
    | null
    | undefined
): string {
  const normalizedNumber =
    normalizePublicationNumber(
      number
    );

  const normalizedSlug =
    normalizePublicationSlug(
      slug
    );

  if (
    normalizedSlug === null
  ) {
    return publicationPath(
      normalizedNumber
    );
  }

  return `${publicationPath(
    normalizedNumber
  )}/${encodeURIComponent(
    normalizedSlug
  )}`;
}

// ============================================================
// RANGE ITERATION
// ============================================================

export function forEachPublicationNumber(
  from:
    | string
    | number,
  to:
    | string
    | number,
  callback: (
    value: number,
  ) => void
): void {
  const range =
    createPublicationNumberRange(
      from,
      to
    );

  const size =
    range.to -
    range.from +
    1;

  if (
    size >
    PUBLICATION_RANGE_MAX_SIZE
  ) {
    throw new Error(
      "Publication number range is too large"
    );
  }

  for (
    let number =
      range.from;
    number <=
      range.to;
    number++
  ) {
    callback(number);
  }
}

// ============================================================
// NUMBER RANGE CHECK
// ============================================================

export function intersectsPublicationRanges(
  first: PublicationNumberRange,
  second: PublicationNumberRange
): boolean {
  return (
    first.from <=
      second.to &&
    second.from <=
      first.to
  );
}

export function containsPublicationRange(
  outer: PublicationNumberRange,
  inner: PublicationNumberRange
): boolean {
  return (
    outer.from <=
      inner.from &&
    outer.to >=
      inner.to
  );
}

// ============================================================
// PUBLICATION NUMBER KEY
// ============================================================

export function publicationNumberKey(
  value:
    | string
    | number
): string {
  return String(
    normalizePublicationNumber(
      value
    )
  );
}

// ============================================================
// PUBLICATION CACHE KEY
// ============================================================

export function publicationCacheKey(
  value:
    | string
    | number
): string {
  return `publication:${publicationNumberKey(
    value
  )}`;
}

export function publicationIdCacheKey(
  id: string
): string {
  return `publication:id:${assertPublicationId(
    id
  )}`;
}

// ============================================================
// PUBLICATION SEARCH KEY
// ============================================================

export function publicationSearchKey(
  query: string
): string {
  const normalized =
    normalizePublicationSearchQuery(
      query
    );

  if (
    !normalized
  ) {
    return "";
  }

  return `publication:search:${normalized.toLowerCase()}`;
}

// ============================================================
// PUBLICATION NUMBER SORT HELPERS
// ============================================================

export function isNextPublicationNumber(
  current:
    | string
    | number,
  candidate:
    | string
    | number
): boolean {
  const currentNumber =
    normalizePublicNumber(
      current
    );

  const candidateNumber =
    normalizePublicNumber(
      candidate
    );

  if (
    currentNumber === null ||
    candidateNumber === null
  ) {
    return false;
  }

  if (
    currentNumber >=
    PUBLICATION_NUMBER_MAX
  ) {
    return false;
  }

  return (
    candidateNumber ===
    currentNumber + 1
  );
}

export function isPreviousPublicationNumber(
  current:
    | string
    | number,
  candidate:
    | string
    | number
): boolean {
  const currentNumber =
    normalizePublicNumber(
      current
    );

  const candidateNumber =
    normalizePublicNumber(
      candidate
    );

  if (
    currentNumber === null ||
    candidateNumber === null
  ) {
    return false;
  }

  return (
    currentNumber > 1 &&
    candidateNumber ===
      currentNumber - 1
  );
}

// ============================================================
// PUBLICATION ID / NUMBER DISCRIMINATION
// ============================================================

export function resolvePublicationReference(
  value: unknown
):
  | {
      type: "number";
      number: number;
    }
  | {
      type: "id";
      id: string;
    }
  | null {
  if (
    typeof value !==
    "string" &&
    typeof value !==
    "number"
  ) {
    return null;
  }

  const publicNumber =
    normalizePublicNumber(
      value
    );

  if (
    publicNumber !==
    null
  ) {
    return {
      type: "number",
      number:
        publicNumber,
    };
  }

  if (
    typeof value ===
      "string" &&
    isValidPublicationId(
      value
    )
  ) {
    return {
      type: "id",
      id: value.trim(),
    };
  }

  return null;
}

// ============================================================
// PUBLICATION CONTENT LENGTHS
// ============================================================

export function getPublicationTitleLength(
  value:
    | string
    | null
    | undefined
): number {
  return normalizePublicationTitle(
    value
  ).length;
}

export function getPublicationTextLength(
  value:
    | string
    | null
    | undefined
): number {
  return normalizePublicationText(
    value
  ).length;
}

// ============================================================
// PUBLICATION CONTENT VALIDATION
// ============================================================

export function isValidPublicationTitle(
  value:
    | string
    | null
    | undefined
): boolean {
  return (
    getPublicationTitleLength(
      value
    ) > 0
  );
}

export function isValidPublicationText(
  value:
    | string
    | null
    | undefined
): boolean {
  return (
    getPublicationTextLength(
      value
    ) > 0
  );
}

// ============================================================
// ORIGIN NORMALIZATION
// ============================================================

export function normalizePublicationOrigin(
  origin: string
): string {
  const value =
    origin
      .trim()
      .replace(
        /\/+$/,
        ""
      );

  if (
    !value
  ) {
    throw new Error(
      "Publication origin cannot be empty"
    );
  }

  return value;
}

// ============================================================
// URL VALIDATION
// ============================================================

export function isValidPublicationUrl(
  origin: string,
  value:
    | string
    | number
): boolean {
  try {
    const url =
      publicationUrl(
        origin,
        value
      );

    new URL(url);

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// URL ORIGIN EXTRACTION
// ============================================================

export function getPublicationOrigin(
  value: string
): string | null {
  try {
    return new URL(
      value
    ).origin;
  } catch {
    return null;
  }
}

// ============================================================
// PATH NORMALIZATION
// ============================================================

export function normalizePublicationPath(
  pathname: string
): string | null {
  if (
    typeof pathname !==
    "string"
  ) {
    return null;
  }

  const number =
    getPublicationNumberFromPath(
      pathname
    );

  if (
    number === null
  ) {
    return null;
  }

  return publicationPath(
    number
  );
}

// ============================================================
// PUBLICATION NUMBER EXTRACTION FROM INPUT
// ============================================================

export function extractPublicationNumber(
  value: unknown
): number | null {
  if (
    typeof value ===
      "number" ||
    typeof value ===
      "string"
  ) {
    return normalizePublicNumber(
      value
    );
  }

  return null;
}

// ============================================================
// END
// ============================================================
