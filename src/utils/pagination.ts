/**
 * ============================================================
 * 🇹🇯 TAJIK OPPORTUNITIES
 * PAGINATION UTILITY
 *
 * Безопасная, расширенная и строго типизированная
 * система пагинации для Cloudflare Workers / D1.
 *
 * Возможности:
 * - нормализация page / limit
 * - защита от NaN / Infinity / отрицательных значений
 * - поддержка number / string / bigint
 * - работа с Request / URL
 * - offset / cursor helpers
 * - metadata
 * - SQL LIMIT / OFFSET
 * - сортировка и query parameters
 * - совместимость camelCase / snake_case
 * - aliases для старого API
 * - безопасная работа с unknown runtime-значениями
 * ============================================================
 */

/* ============================================================
 * TYPES
 * ============================================================ */

export type PaginationInput =
  | number
  | string
  | bigint
  | null
  | undefined;

export type TotalValue =
  | number
  | string
  | bigint;

export interface PaginationOptions {
  page?: PaginationInput;
  limit?: PaginationInput;

  defaultPage?: number;
  defaultLimit?: number;

  maxPage?: number;
  maxLimit?: number;

  minLimit?: number;

  offset?: number;

  pageParam?: string;
  limitParam?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  offset: number;

  total: number | string;

  totalPages: number;

  hasNext: boolean;
  hasPrevious: boolean;

  nextPage: number | null;
  previousPage: number | null;

  firstPage: number;
  lastPage: number;

  from: number;
  to: number;

  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface PaginatedResult<T> {
  items: T[];
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationLinkOptions {
  baseUrl: string;
  pageParam?: string;
  limitParam?: string;
  extraParams?: Record<string, string | number>;
}

export interface PaginationLinks {
  first: string;
  last: string;
  next: string | null;
  previous: string | null;
}

export interface CursorPaginationOptions {
  limit?: PaginationInput;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface CursorPagination<TCursor = string> {
  limit: number;
  cursor: TCursor | null;
}

export interface CursorPaginationMeta<TCursor = string> {
  limit: number;
  nextCursor: TCursor | null;
  previousCursor: TCursor | null;
  hasNext: boolean;
  hasPrevious: boolean;
}

/* ============================================================
 * CONSTANTS
 * ============================================================ */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const DEFAULT_MAX_LIMIT = 100;
export const DEFAULT_MIN_LIMIT = 1;

export const DEFAULT_PAGE_PARAM = "page";
export const DEFAULT_LIMIT_PARAM = "limit";

/* ============================================================
 * INTERNAL HELPERS
 * ============================================================ */

function toFiniteNumber(
  value: unknown,
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  if (typeof value === "bigint") {
    const numberValue =
      Number(value);

    return Number.isFinite(
      numberValue,
    )
      ? numberValue
      : null;
  }

  if (typeof value === "string") {
    const trimmed =
      value.trim();

    if (trimmed === "") {
      return null;
    }

    const numberValue =
      Number(trimmed);

    return Number.isFinite(
      numberValue,
    )
      ? numberValue
      : null;
  }

  return null;
}

function safeInteger(
  value: unknown,
  fallback: number,
): number {
  const parsed =
    toFiniteNumber(value);

  if (parsed === null) {
    return Math.floor(fallback);
  }

  return Math.floor(parsed);
}

function positiveInteger(
  value: unknown,
  fallback: number,
): number {
  return Math.max(
    1,
    safeInteger(
      value,
      fallback,
    ),
  );
}

function normalizeTotal(
  total: TotalValue,
): number {
  const value =
    toFiniteNumber(total);

  if (
    value === null ||
    value <= 0
  ) {
    return 0;
  }

  return Math.floor(value);
}

function normalizeDefaultLimit(
  value: unknown,
  fallback = DEFAULT_LIMIT,
): number {
  return Math.max(
    DEFAULT_MIN_LIMIT,
    safeInteger(
      value,
      fallback,
    ),
  );
}

function normalizeMaxLimit(
  value: unknown,
  fallback = DEFAULT_MAX_LIMIT,
): number {
  return Math.max(
    DEFAULT_MIN_LIMIT,
    safeInteger(
      value,
      fallback,
    ),
  );
}

function normalizeOptionalOffset(
  value: unknown,
): number | undefined {
  const parsed =
    toFiniteNumber(value);

  if (
    parsed === null ||
    parsed < 0
  ) {
    return undefined;
  }

  return Math.floor(parsed);
}

function toPaginationInput(
  value: unknown,
): PaginationInput {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "bigint"
  ) {
    return value;
  }

  return undefined;
}

function toTotalValue(
  value: unknown,
): TotalValue {
  if (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "bigint"
  ) {
    return value;
  }

  return 0;
}

function getUnknownRecordValue(
  source: Record<string, unknown>,
  key: string,
): unknown {
  return source[key];
}

/* ============================================================
 * PAGE NORMALIZATION
 * ============================================================ */

export function normalizePage(
  page: unknown,
  defaultPage = DEFAULT_PAGE,
): number {
  const fallback =
    positiveInteger(
      defaultPage,
      DEFAULT_PAGE,
    );

  return positiveInteger(
    page,
    fallback,
  );
}

export function normalizePageSafe(
  page: unknown,
  defaultPage = DEFAULT_PAGE,
): number {
  return normalizePage(
    page,
    defaultPage,
  );
}

/* ============================================================
 * LIMIT NORMALIZATION
 * ============================================================ */

export function normalizeLimit(
  limit: unknown,
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = DEFAULT_MAX_LIMIT,
  minLimit = DEFAULT_MIN_LIMIT,
): number {
  const safeMax =
    normalizeMaxLimit(
      maxLimit,
    );

  const requestedMin =
    safeInteger(
      minLimit,
      DEFAULT_MIN_LIMIT,
    );

  const safeMin =
    Math.min(
      Math.max(
        DEFAULT_MIN_LIMIT,
        requestedMin,
      ),
      safeMax,
    );

  const safeDefault =
    Math.min(
      Math.max(
        safeMin,
        normalizeDefaultLimit(
          defaultLimit,
        ),
      ),
      safeMax,
    );

  const normalized =
    positiveInteger(
      limit,
      safeDefault,
    );

  return Math.min(
    Math.max(
      normalized,
      safeMin,
    ),
    safeMax,
  );
}

/* ============================================================
 * OFFSET
 * ============================================================ */

export function calculateOffset(
  page: unknown,
  limit: unknown,
): number {
  const normalizedPage =
    normalizePage(page);

  const normalizedLimit =
    normalizeLimit(limit);

  return Math.max(
    0,
    (
      normalizedPage - 1
    ) * normalizedLimit,
  );
}

export function calculateOffsetFromPagination(
  pagination: Pagination,
): number {
  return Math.max(
    0,
    (
      pagination.page - 1
    ) * pagination.limit,
  );
}

/* ============================================================
 * PAGINATION CREATION
 * ============================================================ */

export function getPagination(
  options: PaginationOptions = {},
): Pagination {
  const defaultPage =
    positiveInteger(
      options.defaultPage,
      DEFAULT_PAGE,
    );

  const defaultLimit =
    normalizeDefaultLimit(
      options.defaultLimit,
      DEFAULT_LIMIT,
    );

  const maxLimit =
    normalizeMaxLimit(
      options.maxLimit,
      DEFAULT_MAX_LIMIT,
    );

  const minLimit =
    safeInteger(
      options.minLimit,
      DEFAULT_MIN_LIMIT,
    );

  const page =
    normalizePage(
      options.page,
      defaultPage,
    );

  const limit =
    normalizeLimit(
      options.limit,
      defaultLimit,
      maxLimit,
      minLimit,
    );

  const calculatedOffset =
    (
      page - 1
    ) * limit;

  const customOffset =
    normalizeOptionalOffset(
      options.offset,
    );

  return {
    page,
    limit,
    offset:
      customOffset ??
      calculatedOffset,
  };
}

export function createPagination(
  page?: PaginationInput,
  limit?: PaginationInput,
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = DEFAULT_MAX_LIMIT,
): Pagination {
  return getPagination({
    page,
    limit,
    defaultLimit,
    maxLimit,
  });
}

export function parsePagination(
  page?: unknown,
  limit?: unknown,
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = DEFAULT_MAX_LIMIT,
): Pagination {
  return getPagination({
    page:
      toPaginationInput(page),

    limit:
      toPaginationInput(limit),

    defaultLimit,
    maxLimit,
  });
}

/* ============================================================
 * TOTAL PAGES
 * ============================================================ */

export function calculateTotalPages(
  total: TotalValue,
  limit: number,
): number {
  const totalNumber =
    normalizeTotal(total);

  const safeLimit =
    positiveInteger(
      limit,
      DEFAULT_LIMIT,
    );

  if (
    totalNumber <= 0 ||
    safeLimit <= 0
  ) {
    return 0;
  }

  return Math.ceil(
    totalNumber / safeLimit,
  );
}

export function getTotalPages(
  total: TotalValue,
  limit: number,
): number {
  return calculateTotalPages(
    total,
    limit,
  );
}

/* ============================================================
 * PAGE BOUNDS
 * ============================================================ */

export function getFirstPage(): number {
  return 1;
}

export function getLastPage(
  total: TotalValue,
  limit: number,
): number {
  return Math.max(
    1,
    calculateTotalPages(
      total,
      limit,
    ),
  );
}

export function isFirstPage(
  page: unknown,
): boolean {
  return (
    normalizePage(page) === 1
  );
}

export function isLastPage(
  page: unknown,
  total: TotalValue,
  limit: number,
): boolean {
  const normalizedPage =
    normalizePage(page);

  const totalPages =
    calculateTotalPages(
      total,
      limit,
    );

  return (
    totalPages > 0 &&
    normalizedPage >=
      totalPages
  );
}

/* ============================================================
 * PAGE RANGE
 * ============================================================ */

export function getPageRange(
  total: TotalValue,
  pagination: Pagination,
): number[] {
  const totalPages =
    calculateTotalPages(
      total,
      pagination.limit,
    );

  if (totalPages <= 0) {
    return [];
  }

  const pages: number[] = [];

  for (
    let page = 1;
    page <= totalPages;
    page += 1
  ) {
    pages.push(page);
  }

  return pages;
}

export function getPageRangeAround(
  currentPage: unknown,
  total: TotalValue,
  limit: number,
  radius = 2,
): number[] {
  const current =
    normalizePage(
      currentPage,
    );

  const totalPages =
    calculateTotalPages(
      total,
      limit,
    );

  if (totalPages <= 0) {
    return [];
  }

  const safeRadius =
    Math.max(
      0,
      safeInteger(
        radius,
        2,
      ),
    );

  const start =
    Math.max(
      1,
      current - safeRadius,
    );

  const end =
    Math.min(
      totalPages,
      current + safeRadius,
    );

  const result: number[] = [];

  for (
    let page = start;
    page <= end;
    page += 1
  ) {
    result.push(page);
  }

  return result;
}

/* ============================================================
 * METADATA
 * ============================================================ */

export function createPaginationMeta(
  total: TotalValue,
  pagination: Pagination,
): PaginationMeta {
  const totalNumber =
    normalizeTotal(total);

  const totalPages =
    calculateTotalPages(
      totalNumber,
      pagination.limit,
    );

  const normalizedPage =
    normalizePage(
      pagination.page,
    );

  const normalizedLimit =
    normalizeLimit(
      pagination.limit,
    );

  const normalizedOffset =
    Math.max(
      0,
      Math.floor(
        pagination.offset,
      ),
    );

  const normalizedTotalPages =
    Math.max(
      0,
      totalPages,
    );

  const hasNext =
    normalizedPage <
    normalizedTotalPages;

  const hasPrevious =
    normalizedPage > 1 &&
    normalizedTotalPages > 0;

  const nextPage =
    hasNext
      ? normalizedPage + 1
      : null;

  const previousPage =
    hasPrevious
      ? normalizedPage - 1
      : null;

  const from =
    totalNumber <= 0
      ? 0
      : normalizedOffset + 1;

  const to =
    totalNumber <= 0
      ? 0
      : Math.min(
          normalizedOffset +
            normalizedLimit,
          totalNumber,
        );

  return {
    page:
      normalizedPage,

    limit:
      normalizedLimit,

    offset:
      normalizedOffset,

    total:
      typeof total === "bigint"
        ? total.toString()
        : typeof total === "string"
          ? total
          : totalNumber,

    totalPages:
      normalizedTotalPages,

    hasNext,
    hasPrevious,

    nextPage,
    previousPage,

    firstPage: 1,

    lastPage:
      normalizedTotalPages,

    from,
    to,

    total_pages:
      normalizedTotalPages,

    has_next:
      hasNext,

    has_previous:
      hasPrevious,

    next_page:
      nextPage,

    previous_page:
      previousPage,
  };
}

/* ============================================================
 * RESULT
 * ============================================================ */

export function paginate<T>(
  items: T[],
  total: TotalValue,
  pagination: Pagination,
): PaginatedResult<T> {
  const meta =
    createPaginationMeta(
      total,
      pagination,
    );

  return {
    items,
    data: items,
    pagination: meta,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  total: TotalValue,
  pagination: Pagination,
): PaginatedResult<T> {
  return paginate(
    items,
    total,
    pagination,
  );
}

/* ============================================================
 * ARRAY PAGINATION
 * ============================================================ */

export function paginateArray<T>(
  items: readonly T[],
  pagination: Pagination,
): T[] {
  const start =
    Math.max(
      0,
      Math.floor(
        pagination.offset,
      ),
    );

  const end =
    start +
    Math.max(
      1,
      Math.floor(
        pagination.limit,
      ),
    );

  return items.slice(
    start,
    end,
  );
}

export function paginateArrayWithMeta<T>(
  items: readonly T[],
  pagination: Pagination,
): PaginatedResult<T> {
  const pageItems =
    paginateArray(
      items,
      pagination,
    );

  return paginate(
    pageItems,
    items.length,
    pagination,
  );
}

/* ============================================================
 * REQUEST HELPERS
 * ============================================================ */

export function getPageFromRequest(
  request: Request,
  defaultPage = DEFAULT_PAGE,
  paramName = DEFAULT_PAGE_PARAM,
): number {
  try {
    const url =
      new URL(request.url);

    const value =
      url.searchParams.get(
        paramName,
      );

    return normalizePage(
      value,
      defaultPage,
    );
  } catch {
    return normalizePage(
      defaultPage,
    );
  }
}

export function getLimitFromRequest(
  request: Request,
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = DEFAULT_MAX_LIMIT,
  paramName = DEFAULT_LIMIT_PARAM,
): number {
  try {
    const url =
      new URL(request.url);

    const value =
      url.searchParams.get(
        paramName,
      );

    return normalizeLimit(
      value,
      defaultLimit,
      maxLimit,
    );
  } catch {
    return normalizeLimit(
      defaultLimit,
      defaultLimit,
      maxLimit,
    );
  }
}

export function paginationFromRequest(
  request: Request,
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = DEFAULT_MAX_LIMIT,
): Pagination {
  return getPagination({
    page:
      getPageFromRequest(
        request,
      ),

    limit:
      getLimitFromRequest(
        request,
        defaultLimit,
        maxLimit,
      ),

    defaultLimit,
    maxLimit,
  });
}

export function paginationFromUrl(
  url: string | URL,
  options: PaginationOptions = {},
): Pagination {
  try {
    const parsed =
      typeof url === "string"
        ? new URL(url)
        : url;

    const pageParam =
      options.pageParam ??
      DEFAULT_PAGE_PARAM;

    const limitParam =
      options.limitParam ??
      DEFAULT_LIMIT_PARAM;

    return getPagination({
      ...options,

      page:
        toPaginationInput(
          parsed.searchParams.get(
            pageParam,
          ),
        ),

      limit:
        toPaginationInput(
          parsed.searchParams.get(
            limitParam,
          ),
        ),
    });
  } catch {
    return getPagination(
      options,
    );
  }
}

/* ============================================================
 * URL / QUERY
 * ============================================================ */

export function buildPaginationQuery(
  pagination: Pagination,
): string {
  const params =
    new URLSearchParams();

  params.set(
    DEFAULT_PAGE_PARAM,
    String(
      pagination.page,
    ),
  );

  params.set(
    DEFAULT_LIMIT_PARAM,
    String(
      pagination.limit,
    ),
  );

  return params.toString();
}

export function buildPaginationSearchParams(
  pagination: Pagination,
): URLSearchParams {
  const params =
    new URLSearchParams();

  params.set(
    DEFAULT_PAGE_PARAM,
    String(
      pagination.page,
    ),
  );

  params.set(
    DEFAULT_LIMIT_PARAM,
    String(
      pagination.limit,
    ),
  );

  return params;
}

export function buildPaginationUrl(
  baseUrl: string,
  pagination: Pagination,
  extraParams?: Record<
    string,
    string | number
  >,
): string {
  try {
    const url =
      new URL(baseUrl);

    url.searchParams.set(
      DEFAULT_PAGE_PARAM,
      String(
        pagination.page,
      ),
    );

    url.searchParams.set(
      DEFAULT_LIMIT_PARAM,
      String(
        pagination.limit,
      ),
    );

    if (extraParams) {
      for (
        const [
          key,
          value,
        ] of Object.entries(
          extraParams,
        )
      ) {
        url.searchParams.set(
          key,
          String(value),
        );
      }
    }

    return url.toString();
  } catch {
    return baseUrl;
  }
}

/* ============================================================
 * PAGINATION LINKS
 * ============================================================ */

export function createPaginationLinks(
  total: TotalValue,
  pagination: Pagination,
  options: PaginationLinkOptions,
): PaginationLinks {
  const totalPages =
    calculateTotalPages(
      total,
      pagination.limit,
    );

  const baseUrl =
    options.baseUrl;

  const pageParam =
    options.pageParam ??
    DEFAULT_PAGE_PARAM;

  const limitParam =
    options.limitParam ??
    DEFAULT_LIMIT_PARAM;

  const build =
    (page: number): string => {
      try {
        const url =
          new URL(baseUrl);

        url.searchParams.set(
          pageParam,
          String(page),
        );

        url.searchParams.set(
          limitParam,
          String(
            pagination.limit,
          ),
        );

        if (
          options.extraParams
        ) {
          for (
            const [
              key,
              value,
            ] of Object.entries(
              options.extraParams,
            )
          ) {
            url.searchParams.set(
              key,
              String(value),
            );
          }
        }

        return url.toString();
      } catch {
        return baseUrl;
      }
    };

  return {
    first:
      build(1),

    last:
      build(
        Math.max(
          1,
          totalPages,
        ),
      ),

    next:
      pagination.page <
      totalPages
        ? build(
            pagination.page + 1,
          )
        : null,

    previous:
      pagination.page > 1
        ? build(
            pagination.page - 1,
          )
        : null,
  };
}

/* ============================================================
 * SQL HELPERS
 * ============================================================ */

export function getSqlLimit(
  pagination: Pagination,
): number {
  return Math.max(
    1,
    Math.floor(
      pagination.limit,
    ),
  );
}

export function getSqlOffset(
  pagination: Pagination,
): number {
  return Math.max(
    0,
    Math.floor(
      pagination.offset,
    ),
  );
}

export function buildSqlPagination(
  pagination: Pagination,
): string {
  return `LIMIT ${getSqlLimit(
    pagination,
  )} OFFSET ${getSqlOffset(
    pagination,
  )}`;
}

export function buildSqlPaginationParams(
  pagination: Pagination,
): {
  limit: number;
  offset: number;
} {
  return {
    limit:
      getSqlLimit(
        pagination,
      ),

    offset:
      getSqlOffset(
        pagination,
      ),
  };
}

/* ============================================================
 * PAGE VALIDATION
 * ============================================================ */

export function isValidPage(
  page: unknown,
): boolean {
  const value =
    toFiniteNumber(page);

  return (
    value !== null &&
    Number.isInteger(value) &&
    value >= 1
  );
}

export function isValidLimit(
  limit: unknown,
  maxLimit = DEFAULT_MAX_LIMIT,
): boolean {
  const value =
    toFiniteNumber(limit);

  return (
    value !== null &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <=
      normalizeMaxLimit(
        maxLimit,
      )
  );
}

/* ============================================================
 * PAGE NAVIGATION
 * ============================================================ */

export function getNextPage(
  page: unknown,
  total: TotalValue,
  limit: number,
): number | null {
  const current =
    normalizePage(page);

  const totalPages =
    calculateTotalPages(
      total,
      limit,
    );

  return current < totalPages
    ? current + 1
    : null;
}

export function getPreviousPage(
  page: unknown,
): number | null {
  const current =
    normalizePage(page);

  return current > 1
    ? current - 1
    : null;
}

export function clampPage(
  page: unknown,
  total: TotalValue,
  limit: number,
): number {
  const current =
    normalizePage(page);

  const totalPages =
    calculateTotalPages(
      total,
      limit,
    );

  if (totalPages <= 0) {
    return 1;
  }

  return Math.min(
    current,
    totalPages,
  );
}

/* ============================================================
 * CURSOR PAGINATION
 * ============================================================ */

export function getCursorPagination<
  TCursor = string,
>(
  cursor?: TCursor | null,
  options: CursorPaginationOptions = {},
): CursorPagination<TCursor> {
  const limit =
    normalizeLimit(
      options.limit,
      options.defaultLimit ??
        DEFAULT_LIMIT,
      options.maxLimit ??
        DEFAULT_MAX_LIMIT,
    );

  return {
    limit,
    cursor:
      cursor ?? null,
  };
}

export function createCursorMeta<
  TCursor = string,
>(
  limit: number,
  nextCursor:
    | TCursor
    | null,
  previousCursor:
    | TCursor
    | null = null,
): CursorPaginationMeta<TCursor> {
  const normalizedLimit =
    normalizeLimit(
      limit,
    );

  return {
    limit:
      normalizedLimit,

    nextCursor,

    previousCursor,

    hasNext:
      nextCursor !== null,

    hasPrevious:
      previousCursor !== null,
  };
}

/* ============================================================
 * PAGE MATH
 * ============================================================ */

export function pageStart(
  page: unknown,
  limit: unknown,
): number {
  return calculateOffset(
    page,
    limit,
  );
}

export function pageEnd(
  page: unknown,
  limit: unknown,
): number {
  const normalizedPage =
    normalizePage(page);

  const normalizedLimit =
    normalizeLimit(limit);

  return (
    normalizedPage *
    normalizedLimit
  ) - 1;
}

export function recordsFrom(
  pagination: Pagination,
): number {
  return (
    Math.max(
      0,
      Math.floor(
        pagination.offset,
      ),
    ) + 1
  );
}

export function recordsTo(
  total: TotalValue,
  pagination: Pagination,
): number {
  const normalizedTotal =
    normalizeTotal(total);

  if (
    normalizedTotal <= 0
  ) {
    return 0;
  }

  return Math.min(
    normalizedTotal,
    Math.max(
      0,
      Math.floor(
        pagination.offset,
      ),
    ) +
      Math.max(
        1,
        Math.floor(
          pagination.limit,
        ),
      ),
  );
}

/* ============================================================
 * NORMALIZATION
 * ============================================================ */

export function normalizePagination(
  pagination:
    | Partial<Pagination>
    | null
    | undefined,
): Pagination {
  return getPagination({
    page:
      toPaginationInput(
        pagination?.page,
      ),

    limit:
      toPaginationInput(
        pagination?.limit,
      ),

    offset:
      normalizeOptionalOffset(
        pagination?.offset,
      ),
  });
}

export function ensurePagination(
  value: unknown,
): Pagination {
  if (
    value &&
    typeof value === "object"
  ) {
    const source =
      value as Record<
        string,
        unknown
      >;

    return getPagination({
      page:
        toPaginationInput(
          getUnknownRecordValue(
            source,
            "page",
          ),
        ),

      limit:
        toPaginationInput(
          getUnknownRecordValue(
            source,
            "limit",
          ),
        ),

      offset:
        normalizeOptionalOffset(
          getUnknownRecordValue(
            source,
            "offset",
          ),
        ),
    });
  }

  return getPagination();
}

/* ============================================================
 * PAGINATION META NORMALIZATION
 * ============================================================ */

export function normalizePaginationMeta(
  value: unknown,
): PaginationMeta {
  if (
    value &&
    typeof value === "object"
  ) {
    const source =
      value as Record<
        string,
        unknown
      >;

    const pagination =
      getPagination({
        page:
          toPaginationInput(
            getUnknownRecordValue(
              source,
              "page",
            ),
          ),

        limit:
          toPaginationInput(
            getUnknownRecordValue(
              source,
              "limit",
            ),
          ),

        offset:
          normalizeOptionalOffset(
            getUnknownRecordValue(
              source,
              "offset",
            ),
          ),
      });

    const total =
      toTotalValue(
        getUnknownRecordValue(
          source,
          "total",
        ),
      );

    return createPaginationMeta(
      total,
      pagination,
    );
  }

  return createPaginationMeta(
    0,
    getPagination(),
  );
}

/* ============================================================
 * OFFSET PAGINATION CHECKS
 * ============================================================ */

export function hasMorePages(
  total: TotalValue,
  pagination: Pagination,
): boolean {
  return (
    pagination.page <
    calculateTotalPages(
      total,
      pagination.limit,
    )
  );
}

export function hasPreviousPages(
  pagination: Pagination,
): boolean {
  return pagination.page > 1;
}

/* ============================================================
 * ADDITIONAL SAFE HELPERS
 * ============================================================ */

export function isPagination(
  value: unknown,
): value is Pagination {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const source =
    value as Record<
      string,
      unknown
    >;

  return (
    isValidPage(
      source.page,
    ) &&
    isValidLimit(
      source.limit,
    ) &&
    toFiniteNumber(
      source.offset,
    ) !== null &&
    Number(
      source.offset,
    ) >= 0
  );
}

export function normalizePaginationQuery(
  value: unknown,
): PaginationQuery {
  const pagination =
    ensurePagination(
      value,
    );

  return {
    page:
      pagination.page,

    limit:
      pagination.limit,

    offset:
      pagination.offset,
  };
}

export function getPaginationFromQuery(
  query:
    | URLSearchParams
    | Record<
        string,
        unknown
      >,
): Pagination {
  if (
    query instanceof
    URLSearchParams
  ) {
    return getPagination({
      page:
        toPaginationInput(
          query.get(
            DEFAULT_PAGE_PARAM,
          ),
        ),

      limit:
        toPaginationInput(
          query.get(
            DEFAULT_LIMIT_PARAM,
          ),
        ),
    });
  }

  return getPagination({
    page:
      toPaginationInput(
        query[
          DEFAULT_PAGE_PARAM
        ],
      ),

    limit:
      toPaginationInput(
        query[
          DEFAULT_LIMIT_PARAM
        ],
      ),
  });
}

/* ============================================================
 * DEFAULT EXPORT
 * ============================================================ */

export default {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  DEFAULT_MAX_LIMIT,
  DEFAULT_MIN_LIMIT,

  normalizePage,
  normalizePageSafe,
  normalizeLimit,

  getPagination,
  createPagination,
  parsePagination,

  calculateOffset,
  calculateOffsetFromPagination,

  calculateTotalPages,
  getTotalPages,

  getFirstPage,
  getLastPage,
  isFirstPage,
  isLastPage,

  getPageRange,
  getPageRangeAround,

  createPaginationMeta,

  paginate,
  createPaginatedResult,

  paginateArray,
  paginateArrayWithMeta,

  getPageFromRequest,
  getLimitFromRequest,
  paginationFromRequest,
  paginationFromUrl,

  buildPaginationQuery,
  buildPaginationSearchParams,
  buildPaginationUrl,

  createPaginationLinks,

  getSqlLimit,
  getSqlOffset,
  buildSqlPagination,
  buildSqlPaginationParams,

  isValidPage,
  isValidLimit,

  getNextPage,
  getPreviousPage,
  clampPage,

  getCursorPagination,
  createCursorMeta,

  pageStart,
  pageEnd,
  recordsFrom,
  recordsTo,

  normalizePagination,
  ensurePagination,
  normalizePaginationMeta,

  hasMorePages,
  hasPreviousPages,

  isPagination,
  normalizePaginationQuery,
  getPaginationFromQuery,
};
