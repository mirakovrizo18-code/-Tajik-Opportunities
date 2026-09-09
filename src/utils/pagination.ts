/* ============================================================
   TAJIK OPPORTUNITIES
   PAGINATION UTILITY
   ============================================================ */

export interface PaginationOptions {
  page?: number | string | null;
  limit?: number | string | null;
  defaultLimit?: number;
  maxLimit?: number;
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
}

export interface PaginatedResult<T> {
  items: T[];
  data?: T[];
  pagination: PaginationMeta;
}

function safeInteger(
  value: unknown,
  fallback: number,
): number {
  const n =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.max(
    0,
    Math.floor(n),
  );
}

export function normalizePage(
  page: unknown,
): number {
  return Math.max(
    1,
    safeInteger(page, 1),
  );
}

export function normalizeLimit(
  limit: unknown,
  defaultLimit = 20,
  maxLimit = 100,
): number {
  const normalized =
    safeInteger(
      limit,
      defaultLimit,
    );

  return Math.min(
    Math.max(1, normalized),
    Math.max(1, maxLimit),
  );
}

export function getPagination(
  options: PaginationOptions = {},
): Pagination {
  const defaultLimit =
    options.defaultLimit ?? 20;

  const maxLimit =
    options.maxLimit ?? 100;

  const page = normalizePage(
    options.page,
  );

  const limit = normalizeLimit(
    options.limit,
    defaultLimit,
    maxLimit,
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function parsePagination(
  page?: unknown,
  limit?: unknown,
  defaultLimit = 20,
  maxLimit = 100,
): Pagination {
  return getPagination({
    page: page as
      | number
      | string
      | null
      | undefined,
    limit: limit as
      | number
      | string
      | null
      | undefined,
    defaultLimit,
    maxLimit,
  });
}

export function calculateOffset(
  page: unknown,
  limit: unknown,
): number {
  const normalizedPage =
    normalizePage(page);

  const normalizedLimit =
    normalizeLimit(
      limit,
      20,
      100,
    );

  return (
    (normalizedPage - 1) *
    normalizedLimit
  );
}

export function calculateTotalPages(
  total: number | string | bigint,
  limit: number,
): number {
  const totalNumber =
    typeof total === "bigint"
      ? Number(total)
      : Number(total);

  if (
    !Number.isFinite(totalNumber) ||
    totalNumber <= 0 ||
    limit <= 0
  ) {
    return 0;
  }

  return Math.ceil(
    totalNumber / limit,
  );
}

export function createPaginationMeta(
  total: number | string | bigint,
  pagination: Pagination,
): PaginationMeta {
  const totalPages =
    calculateTotalPages(
      total,
      pagination.limit,
    );

  return {
    page: pagination.page,
    limit: pagination.limit,
    offset: pagination.offset,
    total:
      typeof total === "bigint"
        ? total.toString()
        : total,
    totalPages,
    hasNext:
      pagination.page < totalPages,
    hasPrevious:
      pagination.page > 1 &&
      totalPages > 0,
    nextPage:
      pagination.page < totalPages
        ? pagination.page + 1
        : null,
    previousPage:
      pagination.page > 1
        ? pagination.page - 1
        : null,
  };
}

export function paginate<T>(
  items: T[],
  total: number | string | bigint,
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

export function getPageFromRequest(
  request: Request,
  defaultPage = 1,
): number {
  try {
    const url =
      new URL(request.url);

    return normalizePage(
      url.searchParams.get("page") ??
        defaultPage,
    );
  } catch {
    return defaultPage;
  }
}

export function getLimitFromRequest(
  request: Request,
  defaultLimit = 20,
  maxLimit = 100,
): number {
  try {
    const url =
      new URL(request.url);

    return normalizeLimit(
      url.searchParams.get("limit"),
      defaultLimit,
      maxLimit,
    );
  } catch {
    return defaultLimit;
  }
}

export function paginationFromRequest(
  request: Request,
  defaultLimit = 20,
  maxLimit = 100,
): Pagination {
  return getPagination({
    page: getPageFromRequest(request),
    limit: getLimitFromRequest(
      request,
      defaultLimit,
      maxLimit,
    ),
    defaultLimit,
    maxLimit,
  });
}

export function buildPaginationQuery(
  pagination: Pagination,
): string {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(pagination.page),
  );

  params.set(
    "limit",
    String(pagination.limit),
  );

  return params.toString();
}
