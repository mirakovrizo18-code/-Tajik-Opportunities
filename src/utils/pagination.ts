export interface PaginationOptions {
  page?: number;
  limit?: number;
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
  total: number;
  totalPages: number;
  offset: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  offset: number;
}

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

function toPositiveInteger(
  value: unknown,
  fallback: number,
): number {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  const integer = Math.floor(number);

  return integer > 0
    ? integer
    : fallback;
}

export function normalizePage(
  page: unknown,
  fallback = DEFAULT_PAGINATION.page,
): number {
  return toPositiveInteger(
    page,
    fallback,
  );
}

export function normalizeLimit(
  limit: unknown,
  fallback = DEFAULT_PAGINATION.limit,
  max = DEFAULT_PAGINATION.maxLimit,
): number {
  const normalized = toPositiveInteger(
    limit,
    fallback,
  );

  return Math.min(
    normalized,
    Math.max(1, max),
  );
}

export function createPagination(
  options: PaginationOptions = {},
): Pagination {
  const page = normalizePage(
    options.page,
  );

  const limit = normalizeLimit(
    options.limit,
    options.defaultLimit ??
      DEFAULT_PAGINATION.limit,
    options.maxLimit ??
      DEFAULT_PAGINATION.maxLimit,
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function createPaginationFromQuery(
  query: URLSearchParams | Record<string, unknown>,
  options: PaginationOptions = {},
): PaginationQuery {
  let page: unknown;
  let limit: unknown;

  if (query instanceof URLSearchParams) {
    page = query.get("page");
    limit =
      query.get("limit") ??
      query.get("per_page") ??
      query.get("perPage");
  } else {
    page = query.page;

    limit =
      query.limit ??
      query.per_page ??
      query.perPage;
  }

  return createPagination({
    ...options,
    page,
    limit,
  });
}

export function getOffset(
  page: number,
  limit: number,
): number {
  const normalizedPage =
    normalizePage(page);

  const normalizedLimit =
    normalizeLimit(limit);

  return (
    (normalizedPage - 1) *
    normalizedLimit
  );
}

export function getTotalPages(
  total: number,
  limit: number,
): number {
  const safeTotal =
    Number.isFinite(total) &&
    total > 0
      ? Math.floor(total)
      : 0;

  const safeLimit =
    normalizeLimit(limit);

  return Math.max(
    1,
    Math.ceil(
      safeTotal / safeLimit,
    ),
  );
}

export function createPaginationMeta(
  total: number,
  pagination: Pagination,
): PaginationMeta {
  const safeTotal =
    Number.isFinite(total) &&
    total >= 0
      ? Math.floor(total)
      : 0;

  const totalPages =
    safeTotal === 0
      ? 0
      : Math.ceil(
          safeTotal /
            pagination.limit,
        );

  const hasNext =
    pagination.page <
    totalPages;

  const hasPrevious =
    pagination.page > 1 &&
    totalPages > 0;

  return {
    page: pagination.page,
    limit: pagination.limit,
    total: safeTotal,
    totalPages,
    offset: pagination.offset,
    hasNext,
    hasPrevious,
    nextPage: hasNext
      ? pagination.page + 1
      : null,
    previousPage: hasPrevious
      ? pagination.page - 1
      : null,
  };
}

export function paginateArray<T>(
  items: readonly T[],
  pagination: Pagination,
): PaginatedResult<T> {
  const total = items.length;

  const data = items.slice(
    pagination.offset,
    pagination.offset +
      pagination.limit,
  );

  return {
    data,
    pagination:
      createPaginationMeta(
        total,
        pagination,
      ),
  };
}

export function paginate<T>(
  items: readonly T[],
  options: PaginationOptions = {},
): PaginatedResult<T> {
  const pagination =
    createPagination(options);

  return paginateArray(
    items,
    pagination,
  );
}

export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxVisible = 7,
): number[] {
  const current =
    normalizePage(currentPage);

  const total =
    Math.max(
      0,
      Math.floor(totalPages),
    );

  if (total === 0) {
    return [];
  }

  if (total <= maxVisible) {
    return Array.from(
      { length: total },
      (_, index) => index + 1,
    );
  }

  const visible =
    Math.max(3, Math.floor(maxVisible));

  const half =
    Math.floor(visible / 2);

  let start =
    current - half;

  let end =
    current + half;

  if (start < 1) {
    start = 1;
    end = visible;
  }

  if (end > total) {
    end = total;
    start =
      Math.max(
        1,
        total - visible + 1,
      );
  }

  return Array.from(
    {
      length:
        end - start + 1,
    },
    (_, index) =>
      start + index,
  );
}

export function hasNextPage(
  page: number,
  totalPages: number,
): boolean {
  return (
    normalizePage(page) <
    Math.max(
      0,
      Math.floor(totalPages),
    )
  );
}

export function hasPreviousPage(
  page: number,
): boolean {
  return normalizePage(page) > 1;
}

export function nextPage(
  page: number,
  totalPages: number,
): number | null {
  return hasNextPage(
    page,
    totalPages,
  )
    ? normalizePage(page) + 1
    : null;
}

export function previousPage(
  page: number,
): number | null {
  const normalized =
    normalizePage(page);

  return normalized > 1
    ? normalized - 1
    : null;
}

export function firstPage(): number {
  return 1;
}

export function lastPage(
  totalPages: number,
): number {
  return Math.max(
    1,
    Math.floor(totalPages),
  );
}

export function clampPage(
  page: number,
  totalPages: number,
): number {
  const normalizedTotal =
    Math.max(
      1,
      Math.floor(totalPages),
    );

  return Math.min(
    normalizePage(page),
    normalizedTotal,
  );
}

export function normalizePagination(
  page: unknown,
  limit: unknown,
  options: PaginationOptions = {},
): Pagination {
  return createPagination({
    ...options,
    page,
    limit,
  });
}

export function parsePaginationQuery(
  request: Request,
  options: PaginationOptions = {},
): PaginationQuery {
  const url =
    new URL(request.url);

  return createPaginationFromQuery(
    url.searchParams,
    options,
  );
}

export function paginationSql(
  pagination: Pagination,
): {
  limit: number;
  offset: number;
} {
  return {
    limit: pagination.limit,
    offset: pagination.offset,
  };
}

export function paginationParams(
  pagination: Pagination,
): [number, number] {
  return [
    pagination.limit,
    pagination.offset,
  ];
}

export function getPaginationSummary(
  pagination: PaginationMeta,
): string {
  if (pagination.total === 0) {
    return "Нет результатов";
  }

  const start =
    pagination.offset + 1;

  const end = Math.min(
    pagination.offset +
      pagination.limit,
    pagination.total,
  );

  return `${start}-${end} из ${pagination.total}`;
}

export function getPaginationSummaryObject(
  pagination: PaginationMeta,
): {
  from: number;
  to: number;
  total: number;
} {
  if (pagination.total === 0) {
    return {
      from: 0,
      to: 0,
      total: 0,
    };
  }

  return {
    from: pagination.offset + 1,
    to: Math.min(
      pagination.offset +
        pagination.limit,
      pagination.total,
    ),
    total: pagination.total,
  };
}

export function isValidPagination(
  pagination: Pagination,
): boolean {
  return (
    Number.isSafeInteger(
      pagination.page,
    ) &&
    pagination.page >= 1 &&
    Number.isSafeInteger(
      pagination.limit,
    ) &&
    pagination.limit >= 1 &&
    Number.isSafeInteger(
      pagination.offset,
    ) &&
    pagination.offset >= 0
  );
}

export function assertValidPagination(
  pagination: Pagination,
): void {
  if (
    !isValidPagination(
      pagination,
    )
  ) {
    throw new Error(
      "Invalid pagination parameters.",
    );
  }
}

export function buildPaginationLinks(
  baseUrl: string,
  pagination: PaginationMeta,
): {
  first: string;
  last: string;
  next: string | null;
  previous: string | null;
} {
  const build = (
    page: number,
  ): string => {
    const url =
      new URL(baseUrl);

    url.searchParams.set(
      "page",
      String(page),
    );

    url.searchParams.set(
      "limit",
      String(pagination.limit),
    );

    return url.toString();
  };

  return {
    first: build(1),

    last: build(
      Math.max(
        1,
        pagination.totalPages,
      ),
    ),

    next: pagination.nextPage
      ? build(
          pagination.nextPage,
        )
      : null,

    previous:
      pagination.previousPage
        ? build(
            pagination.previousPage,
          )
        : null,
  };
}

export function mergePaginationMeta(
  current: PaginationMeta,
  updates: Partial<PaginationMeta>,
): PaginationMeta {
  return {
    ...current,
    ...updates,
  };
}

export function mapPaginatedResult<
  T,
  U,
>(
  result: PaginatedResult<T>,
  mapper: (item: T, index: number) => U,
): PaginatedResult<U> {
  return {
    data: result.data.map(
      mapper,
    ),
    pagination:
      result.pagination,
  };
}

export function emptyPaginatedResult<
  T = never,
>(
  limit = DEFAULT_PAGINATION.limit,
): PaginatedResult<T> {
  const pagination =
    createPagination({
      page: 1,
      limit,
    });

  return {
    data: [],
    pagination:
      createPaginationMeta(
        0,
        pagination,
      ),
  };
}

export function paginationFromTotal(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return createPaginationMeta(
    total,
    createPagination({
      page,
      limit,
    }),
  );
}

export function getPageStart(
  page: number,
  limit: number,
): number {
  return (
    (normalizePage(page) - 1) *
    normalizeLimit(limit)
  );
}

export function getPageEnd(
  page: number,
  limit: number,
  total: number,
): number {
  const start =
    getPageStart(
      page,
      limit,
    );

  return Math.min(
    start +
      normalizeLimit(limit),
    Math.max(
      0,
      Math.floor(total),
    ),
  );
}

export function getItemsOnPage(
  page: number,
  limit: number,
  total: number,
): number {
  const start =
    getPageStart(
      page,
      limit,
    );

  const safeTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  if (start >= safeTotal) {
    return 0;
  }

  return Math.min(
    normalizeLimit(limit),
    safeTotal - start,
  );
}
