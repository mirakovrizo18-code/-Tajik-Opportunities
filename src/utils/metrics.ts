/**
 * src/utils/metrics.ts
 * ------------------------------------------------------------
 * Метрики проекта Tajik Opportunities
 *
 * Совместимо с:
 * - Cloudflare Workers
 * - D1
 * - TypeScript strict mode
 * - unknown / JSON / URL / database values
 * ------------------------------------------------------------
 */

/* ============================================================
 * БАЗОВЫЕ ТИПЫ
 * ============================================================ */

export type MetricValue = number;

/**
 * Внешние источники могут вернуть практически что угодно.
 * Нормализация выполняется через toNumber().
 */
export type MetricInput = unknown;

export interface Metrics {
  users: number;
  activeUsers: number;
  newUsers: number;

  publications: number;
  publishedPublications: number;
  draftPublications: number;

  comments: number;
  reactions: number;
  reviews: number;

  views: number;
  shares: number;

  likes: number;
  dislikes: number;

  reports: number;
  notifications: number;

  jobs: number;
  employers: number;
  applicants: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface NormalizedMetrics extends Metrics {
  engagementRate: number;
  activityRate: number;
  reactionRate: number;
  commentRate: number;
  reviewRate: number;
  shareRate: number;
  publicationRate: number;
}

export interface MetricPoint {
  label: string;
  value: number;
}

export interface MetricSeries {
  name: string;
  points: MetricPoint[];
}

export interface RateOptions {
  decimals?: number;
  multiplier?: number;
  fallback?: number;
}

/* ============================================================
 * NUMBER NORMALIZATION
 * ============================================================ */

export function toNumber(
  value: unknown,
  fallback = 0,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "bigint") {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (normalized.length === 0) {
      return fallback;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
      ? parsed
      : fallback;
  }

  /*
   * Поддержка объектов с valueOf(), например некоторых
   * database/runtime values.
   */
  try {
    const primitive = (value as {
      valueOf?: () => unknown;
    }).valueOf?.();

    if (
      primitive !== value &&
      (
        typeof primitive === "number" ||
        typeof primitive === "string" ||
        typeof primitive === "boolean"
      )
    ) {
      return toNumber(primitive, fallback);
    }
  } catch {
    // Игнорируем небезопасные valueOf().
  }

  return fallback;
}

/* ============================================================
 * ЧИСЛА
 * ============================================================ */

export function toNonNegativeNumber(
  value: unknown,
  fallback = 0,
): number {
  return Math.max(
    0,
    toNumber(value, fallback),
  );
}

export function toInteger(
  value: unknown,
  fallback = 0,
): number {
  const parsed = toNumber(value, fallback);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.trunc(parsed);
}

export function toNonNegativeInteger(
  value: unknown,
  fallback = 0,
): number {
  return Math.max(
    0,
    toInteger(value, fallback),
  );
}

/* ============================================================
 * ОКРУГЛЕНИЕ
 * ============================================================ */

export function round(
  value: unknown,
  decimals = 2,
): number {
  const number = toNumber(value);

  const safeDecimals = Math.max(
    0,
    Math.min(
      20,
      Math.trunc(
        toNumber(decimals, 2),
      ),
    ),
  );

  const factor = 10 ** safeDecimals;

  return Math.round(
    (number + Number.EPSILON) * factor,
  ) / factor;
}

export function floor(
  value: unknown,
  decimals = 0,
): number {
  const number = toNumber(value);

  const safeDecimals = Math.max(
    0,
    Math.trunc(toNumber(decimals)),
  );

  const factor = 10 ** safeDecimals;

  return Math.floor(
    number * factor,
  ) / factor;
}

export function ceil(
  value: unknown,
  decimals = 0,
): number {
  const number = toNumber(value);

  const safeDecimals = Math.max(
    0,
    Math.trunc(toNumber(decimals)),
  );

  const factor = 10 ** safeDecimals;

  return Math.ceil(
    number * factor,
  ) / factor;
}

/* ============================================================
 * ПРОЦЕНТЫ
 * ============================================================ */

export function percentage(
  value: unknown,
  total: unknown,
  options: RateOptions = {},
): number {
  const numerator = toNumber(value);
  const denominator = toNumber(total);

  const multiplier = Number.isFinite(
    options.multiplier,
  )
    ? Number(options.multiplier)
    : 100;

  const fallback = Number.isFinite(
    options.fallback,
  )
    ? Number(options.fallback)
    : 0;

  if (denominator === 0) {
    return fallback;
  }

  const result =
    (numerator / denominator) * multiplier;

  return round(
    Number.isFinite(result)
      ? result
      : fallback,
    options.decimals ?? 2,
  );
}

export function ratio(
  value: unknown,
  total: unknown,
): number {
  const numerator = toNumber(value);
  const denominator = toNumber(total);

  if (denominator === 0) {
    return 0;
  }

  const result = numerator / denominator;

  if (!Number.isFinite(result)) {
    return 0;
  }

  return Math.max(0, result);
}

export function percentageClamped(
  value: unknown,
  total: unknown,
  decimals = 2,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      percentage(
        value,
        total,
        { decimals },
      ),
    ),
  );
}

/* ============================================================
 * БАЗОВЫЕ ОПЕРАЦИИ
 * ============================================================ */

export function sum(
  values: readonly unknown[],
): number {
  return values.reduce(
    (total, value) =>
      total + toNumber(value),
    0,
  );
}

export function average(
  values: readonly unknown[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return round(
    sum(values) / values.length,
    2,
  );
}

export function min(
  values: readonly unknown[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.min(
    ...values.map((value) =>
      toNumber(value),
    ),
  );
}

export function max(
  values: readonly unknown[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(
    ...values.map((value) =>
      toNumber(value),
    ),
  );
}

/* ============================================================
 * DEFAULT METRICS
 * ============================================================ */

export const DEFAULT_METRICS: Metrics = {
  users: 0,
  activeUsers: 0,
  newUsers: 0,

  publications: 0,
  publishedPublications: 0,
  draftPublications: 0,

  comments: 0,
  reactions: 0,
  reviews: 0,

  views: 0,
  shares: 0,

  likes: 0,
  dislikes: 0,

  reports: 0,
  notifications: 0,

  jobs: 0,
  employers: 0,
  applicants: 0,
};

/* ============================================================
 * NORMALIZE METRICS
 * ============================================================ */

export function normalizeMetrics(
  input?: Partial<Metrics> | null,
): Metrics {
  const source = input ?? {};

  return {
    users: toNonNegativeInteger(
      source.users,
    ),

    activeUsers: toNonNegativeInteger(
      source.activeUsers,
    ),

    newUsers: toNonNegativeInteger(
      source.newUsers,
    ),

    publications: toNonNegativeInteger(
      source.publications,
    ),

    publishedPublications:
      toNonNegativeInteger(
        source.publishedPublications,
      ),

    draftPublications:
      toNonNegativeInteger(
        source.draftPublications,
      ),

    comments: toNonNegativeInteger(
      source.comments,
    ),

    reactions: toNonNegativeInteger(
      source.reactions,
    ),

    reviews: toNonNegativeInteger(
      source.reviews,
    ),

    views: toNonNegativeInteger(
      source.views,
    ),

    shares: toNonNegativeInteger(
      source.shares,
    ),

    likes: toNonNegativeInteger(
      source.likes,
    ),

    dislikes: toNonNegativeInteger(
      source.dislikes,
    ),

    reports: toNonNegativeInteger(
      source.reports,
    ),

    notifications:
      toNonNegativeInteger(
        source.notifications,
      ),

    jobs: toNonNegativeInteger(
      source.jobs,
    ),

    employers: toNonNegativeInteger(
      source.employers,
    ),

    applicants: toNonNegativeInteger(
      source.applicants,
    ),

    createdAt:
      typeof source.createdAt === "string"
        ? source.createdAt
        : undefined,

    updatedAt:
      typeof source.updatedAt === "string"
        ? source.updatedAt
        : undefined,
  };
}

/* ============================================================
 * RATE / ENGAGEMENT
 * ============================================================ */

export function calculateEngagementRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  const interactions =
    normalized.likes +
    normalized.dislikes +
    normalized.comments +
    normalized.reviews +
    normalized.shares;

  return percentageClamped(
    interactions,
    normalized.views,
  );
}

export function calculateActivityRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return percentageClamped(
    normalized.activeUsers,
    normalized.users,
  );
}

export function calculateReactionRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return percentageClamped(
    normalized.reactions,
    normalized.views,
  );
}

export function calculateCommentRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return percentageClamped(
    normalized.comments,
    normalized.views,
  );
}

export function calculateReviewRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return percentageClamped(
    normalized.reviews,
    normalized.views,
  );
}

export function calculateShareRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return percentageClamped(
    normalized.shares,
    normalized.views,
  );
}

export function calculatePublicationRate(
  metrics: Partial<Metrics>,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return percentageClamped(
    normalized.publishedPublications,
    normalized.publications,
  );
}

/* ============================================================
 * NORMALIZED STATISTICS
 * ============================================================ */

export function buildNormalizedMetrics(
  input?: Partial<Metrics> | null,
): NormalizedMetrics {
  const metrics =
    normalizeMetrics(input);

  return {
    ...metrics,

    engagementRate:
      calculateEngagementRate(metrics),

    activityRate:
      calculateActivityRate(metrics),

    reactionRate:
      calculateReactionRate(metrics),

    commentRate:
      calculateCommentRate(metrics),

    reviewRate:
      calculateReviewRate(metrics),

    shareRate:
      calculateShareRate(metrics),

    publicationRate:
      calculatePublicationRate(metrics),
  };
}

/* ============================================================
 * INCREMENT / DECREMENT
 * ============================================================ */

export function increment(
  value: unknown,
  amount: unknown = 1,
): number {
  return (
    toNumber(value) +
    toNumber(amount, 1)
  );
}

export function decrement(
  value: unknown,
  amount: unknown = 1,
): number {
  return Math.max(
    0,
    toNumber(value) -
      toNumber(amount, 1),
  );
}

/* ============================================================
 * UPDATE METRICS
 * ============================================================ */

export function updateMetrics(
  current: Partial<Metrics>,
  changes: Partial<Metrics>,
): Metrics {
  const result: Metrics =
    normalizeMetrics(current);

  const keys = Object.keys(changes) as Array<
    keyof Metrics
  >;

  for (const key of keys) {
    const value = changes[key];

    if (
      key === "createdAt" ||
      key === "updatedAt"
    ) {
      if (typeof value === "string") {
        result[key] = value;
      }

      continue;
    }

    result[key] =
      toNumber(value);
  }

  return normalizeMetrics(result);
}

/* ============================================================
 * СРАВНЕНИЕ
 * ============================================================ */

export function calculateChange(
  current: unknown,
  previous: unknown,
): number {
  return (
    toNumber(current) -
    toNumber(previous)
  );
}

export function calculateGrowthRate(
  current: unknown,
  previous: unknown,
): number {
  const currentValue =
    toNumber(current);

  const previousValue =
    toNumber(previous);

  if (previousValue === 0) {
    return currentValue > 0
      ? 100
      : 0;
  }

  return round(
    (
      (currentValue - previousValue) /
      Math.abs(previousValue)
    ) * 100,
    2,
  );
}

export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  growthRate: number;
  increased: boolean;
  decreased: boolean;
  unchanged: boolean;
}

export function compareMetrics(
  current: unknown,
  previous: unknown,
): MetricComparison {
  const currentValue =
    toNumber(current);

  const previousValue =
    toNumber(previous);

  const change =
    currentValue - previousValue;

  return {
    current: currentValue,
    previous: previousValue,
    change,

    growthRate:
      calculateGrowthRate(
        currentValue,
        previousValue,
      ),

    increased: change > 0,
    decreased: change < 0,
    unchanged: change === 0,
  };
}

/* ============================================================
 * ВАЛИДАЦИЯ
 * ============================================================ */

export function isValidMetric(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

export function isValidMetricInput(
  value: unknown,
): boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return true;
  }

  return (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  );
}

/* ============================================================
 * JSON
 * ============================================================ */

export function metricsToJSON(
  metrics: Partial<Metrics>,
): string {
  return JSON.stringify(
    normalizeMetrics(metrics),
  );
}

export function metricsFromJSON(
  value: unknown,
): Metrics {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return normalizeMetrics();
  }

  try {
    const parsed: unknown =
      JSON.parse(value);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return normalizeMetrics();
    }

    return normalizeMetrics(
      parsed as Partial<Metrics>,
    );
  } catch {
    return normalizeMetrics();
  }
}

/* ============================================================
 * METRIC POINTS
 * ============================================================ */

export function createMetricPoint(
  label: unknown,
  value: unknown,
): MetricPoint {
  return {
    label: String(label),
    value: toNumber(value),
  };
}

export function createMetricSeries(
  name: unknown,
  values: readonly unknown[],
): MetricSeries {
  return {
    name: String(name),

    points: values.map(
      (value, index) =>
        createMetricPoint(
          index + 1,
          value,
        ),
    ),
  };
}

/* ============================================================
 * DASHBOARD
 * ============================================================ */

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;

  totalPublications: number;
  totalComments: number;
  totalReactions: number;
  totalReviews: number;
  totalViews: number;
  totalShares: number;

  engagementRate: number;
  activityRate: number;
  publicationRate: number;
}

export function createDashboardMetrics(
  input?: Partial<Metrics> | null,
): DashboardMetrics {
  const metrics =
    buildNormalizedMetrics(input);

  return {
    totalUsers: metrics.users,
    activeUsers: metrics.activeUsers,

    totalPublications:
      metrics.publications,

    totalComments:
      metrics.comments,

    totalReactions:
      metrics.reactions,

    totalReviews:
      metrics.reviews,

    totalViews:
      metrics.views,

    totalShares:
      metrics.shares,

    engagementRate:
      metrics.engagementRate,

    activityRate:
      metrics.activityRate,

    publicationRate:
      metrics.publicationRate,
  };
}

/* ============================================================
 * АГРЕГАЦИЯ
 * ============================================================ */

export function aggregateMetrics(
  items: readonly Partial<Metrics>[],
): Metrics {
  const result =
    normalizeMetrics();

  for (const item of items) {
    const metrics =
      normalizeMetrics(item);

    result.users += metrics.users;
    result.activeUsers +=
      metrics.activeUsers;
    result.newUsers +=
      metrics.newUsers;

    result.publications +=
      metrics.publications;

    result.publishedPublications +=
      metrics.publishedPublications;

    result.draftPublications +=
      metrics.draftPublications;

    result.comments +=
      metrics.comments;

    result.reactions +=
      metrics.reactions;

    result.reviews +=
      metrics.reviews;

    result.views +=
      metrics.views;

    result.shares +=
      metrics.shares;

    result.likes +=
      metrics.likes;

    result.dislikes +=
      metrics.dislikes;

    result.reports +=
      metrics.reports;

    result.notifications +=
      metrics.notifications;

    result.jobs +=
      metrics.jobs;

    result.employers +=
      metrics.employers;

    result.applicants +=
      metrics.applicants;
  }

  return result;
}

/* ============================================================
 * USERS
 * ============================================================ */

export function userActivityRate(
  activeUsers: unknown,
  totalUsers: unknown,
): number {
  return percentageClamped(
    activeUsers,
    totalUsers,
  );
}

export function newUserRate(
  newUsers: unknown,
  totalUsers: unknown,
): number {
  return percentageClamped(
    newUsers,
    totalUsers,
  );
}

/* ============================================================
 * PUBLICATIONS
 * ============================================================ */

export function publicationSuccessRate(
  published: unknown,
  total: unknown,
): number {
  return percentageClamped(
    published,
    total,
  );
}

export function averageViewsPerPublication(
  views: unknown,
  publications: unknown,
): number {
  const publicationCount =
    toNumber(publications);

  if (publicationCount === 0) {
    return 0;
  }

  return round(
    toNumber(views) /
      publicationCount,
    2,
  );
}

export function averageCommentsPerPublication(
  comments: unknown,
  publications: unknown,
): number {
  const publicationCount =
    toNumber(publications);

  if (publicationCount === 0) {
    return 0;
  }

  return round(
    toNumber(comments) /
      publicationCount,
    2,
  );
}

/* ============================================================
 * REACTIONS
 * ============================================================ */

export function likeRate(
  likes: unknown,
  views: unknown,
): number {
  return percentageClamped(
    likes,
    views,
  );
}

export function dislikeRate(
  dislikes: unknown,
  views: unknown,
): number {
  return percentageClamped(
    dislikes,
    views,
  );
}

export function likeDislikeRatio(
  likes: unknown,
  dislikes: unknown,
): number {
  const likeValue =
    toNumber(likes);

  const dislikeValue =
    toNumber(dislikes);

  if (dislikeValue === 0) {
    return likeValue > 0
      ? likeValue
      : 0;
  }

  return round(
    likeValue / dislikeValue,
    2,
  );
}

/* ============================================================
 * РАБОТА / ВАКАНСИИ
 * ============================================================ */

export function employerActivityRate(
  employers: unknown,
  users: unknown,
): number {
  return percentageClamped(
    employers,
    users,
  );
}

export function applicantEmployerRatio(
  applicants: unknown,
  employers: unknown,
): number {
  const employerCount =
    toNumber(employers);

  if (employerCount === 0) {
    return 0;
  }

  return round(
    toNumber(applicants) /
      employerCount,
    2,
  );
}

/* ============================================================
 * ФОРМАТИРОВАНИЕ
 * ============================================================ */

export function formatNumber(
  value: unknown,
  locale = "ru-RU",
): string {
  return toNumber(value)
    .toLocaleString(locale);
}

export function formatPercentage(
  value: unknown,
  decimals = 2,
): string {
  return `${round(
    value,
    decimals,
  )}%`;
}

export function formatCompactNumber(
  value: unknown,
): string {
  const number =
    toNumber(value);

  if (
    Math.abs(number) < 1_000
  ) {
    return String(
      Math.round(number),
    );
  }

  if (
    Math.abs(number) < 1_000_000
  ) {
    return `${round(
      number / 1_000,
      1,
    )}K`;
  }

  if (
    Math.abs(number) < 1_000_000_000
  ) {
    return `${round(
      number / 1_000_000,
      1,
    )}M`;
  }

  return `${round(
    number / 1_000_000_000,
    1,
  )}B`;
}

/* ============================================================
 * CLAMP
 * ============================================================ */

export function clampMetric(
  value: unknown,
  minValue = 0,
  maxValue = Number.MAX_SAFE_INTEGER,
): number {
  const number =
    toNumber(value);

  const minNumber =
    toNumber(minValue);

  const maxNumber =
    Math.max(
      minNumber,
      toNumber(
        maxValue,
        Number.MAX_SAFE_INTEGER,
      ),
    );

  return Math.min(
    maxNumber,
    Math.max(
      minNumber,
      number,
    ),
  );
}

/* ============================================================
 * DEFAULT EXPORT
 * ============================================================ */

export default {
  DEFAULT_METRICS,

  toNumber,
  toNonNegativeNumber,
  toInteger,
  toNonNegativeInteger,

  round,
  floor,
  ceil,

  percentage,
  percentageClamped,
  ratio,

  sum,
  average,
  min,
  max,

  normalizeMetrics,
  buildNormalizedMetrics,

  increment,
  decrement,
  updateMetrics,

  calculateChange,
  calculateGrowthRate,
  compareMetrics,

  calculateEngagementRate,
  calculateActivityRate,
  calculateReactionRate,
  calculateCommentRate,
  calculateReviewRate,
  calculateShareRate,
  calculatePublicationRate,

  isValidMetric,
  isValidMetricInput,

  metricsToJSON,
  metricsFromJSON,

  createMetricPoint,
  createMetricSeries,

  createDashboardMetrics,
  aggregateMetrics,

  userActivityRate,
  newUserRate,

  publicationSuccessRate,
  averageViewsPerPublication,
  averageCommentsPerPublication,

  likeRate,
  dislikeRate,
  likeDislikeRatio,

  employerActivityRate,
  applicantEmployerRatio,

  formatNumber,
  formatPercentage,
  formatCompactNumber,

  clampMetric,
};
