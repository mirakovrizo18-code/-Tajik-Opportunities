/**
 * src/utils/metrics.ts
 * ------------------------------------------------------------
 * Метрики проекта Tajik Opportunities
 *
 * Назначение:
 * - безопасный подсчёт статистики;
 * - нормализация числовых значений;
 * - расчёт процентов и коэффициентов;
 * - статистика публикаций, комментариев, реакций и отзывов;
 * - совместимость с Cloudflare Workers / TypeScript strict mode;
 *
 * ВАЖНО:
 * Все вычисляемые числовые значения внутри этого файла имеют тип number.
 * Значения из D1, URL, JSON и других внешних источников сначала
 * нормализуются через toNumber().
 * ------------------------------------------------------------
 */

/* ============================================================
 * БАЗОВЫЕ ТИПЫ
 * ============================================================ */

export type MetricValue = number;

export type MetricInput =
  | number
  | string
  | null
  | undefined
  | boolean;

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
 * БЕЗОПАСНОЕ ПРЕОБРАЗОВАНИЕ В NUMBER
 * ============================================================ */

/**
 * Преобразует любое входное значение в конечное число.
 *
 * Примеры:
 * toNumber("15")      -> 15
 * toNumber("15.5")    -> 15.5
 * toNumber(null)      -> 0
 * toNumber(undefined) -> 0
 * toNumber("abc")     -> 0
 */
export function toNumber(
  value: MetricInput,
  fallback = 0,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return fallback;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Только неотрицательное число.
 */
export function toNonNegativeNumber(
  value: MetricInput,
  fallback = 0,
): number {
  return Math.max(0, toNumber(value, fallback));
}

/**
 * Целое неотрицательное число.
 */
export function toInteger(
  value: MetricInput,
  fallback = 0,
): number {
  const parsed = toNumber(value, fallback);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.trunc(parsed);
}

/**
 * Целое неотрицательное число.
 */
export function toNonNegativeInteger(
  value: MetricInput,
  fallback = 0,
): number {
  return Math.max(0, toInteger(value, fallback));
}

/* ============================================================
 * ОКРУГЛЕНИЕ
 * ============================================================ */

export function round(
  value: MetricInput,
  decimals = 2,
): number {
  const number = toNumber(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  const safeDecimals = Math.max(
    0,
    Math.min(20, Math.trunc(decimals)),
  );

  const factor = 10 ** safeDecimals;

  return Math.round((number + Number.EPSILON) * factor) / factor;
}

export function floor(
  value: MetricInput,
  decimals = 0,
): number {
  const number = toNumber(value);
  const safeDecimals = Math.max(0, Math.trunc(decimals));
  const factor = 10 ** safeDecimals;

  return Math.floor(number * factor) / factor;
}

export function ceil(
  value: MetricInput,
  decimals = 0,
): number {
  const number = toNumber(value);
  const safeDecimals = Math.max(0, Math.trunc(decimals));
  const factor = 10 ** safeDecimals;

  return Math.ceil(number * factor) / factor;
}

/* ============================================================
 * ПРОЦЕНТЫ
 * ============================================================ */

/**
 * Возвращает процент.
 *
 * percentage(25, 100) -> 25
 * percentage(1, 4)    -> 25
 */
export function percentage(
  value: MetricInput,
  total: MetricInput,
  options: RateOptions = {},
): number {
  const numerator = toNumber(value);
  const denominator = toNumber(total);

  const multiplier = Number.isFinite(options.multiplier)
    ? Number(options.multiplier)
    : 100;

  const fallback = Number.isFinite(options.fallback)
    ? Number(options.fallback)
    : 0;

  if (denominator === 0) {
    return fallback;
  }

  const result = (numerator / denominator) * multiplier;

  return round(
    Number.isFinite(result) ? result : fallback,
    options.decimals ?? 2,
  );
}

/**
 * Коэффициент от 0 до 1.
 */
export function ratio(
  value: MetricInput,
  total: MetricInput,
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

/**
 * Процент с ограничением 0–100.
 */
export function percentageClamped(
  value: MetricInput,
  total: MetricInput,
  decimals = 2,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      percentage(value, total, { decimals }),
    ),
  );
}

/* ============================================================
 * БАЗОВЫЕ ОПЕРАЦИИ
 * ============================================================ */

export function sum(
  values: readonly MetricInput[],
): number {
  return values.reduce(
    (total, value) => total + toNumber(value),
    0,
  );
}

export function average(
  values: readonly MetricInput[],
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
  values: readonly MetricInput[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.min(
    ...values.map((value) => toNumber(value)),
  );
}

export function max(
  values: readonly MetricInput[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(
    ...values.map((value) => toNumber(value)),
  );
}

/* ============================================================
 * БЕЗОПАСНЫЙ METRICS OBJECT
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

export function normalizeMetrics(
  input?: Partial<Metrics> | null,
): Metrics {
  const source = input ?? {};

  return {
    users: toNonNegativeInteger(source.users),
    activeUsers: toNonNegativeInteger(source.activeUsers),
    newUsers: toNonNegativeInteger(source.newUsers),

    publications: toNonNegativeInteger(source.publications),
    publishedPublications: toNonNegativeInteger(
      source.publishedPublications,
    ),
    draftPublications: toNonNegativeInteger(
      source.draftPublications,
    ),

    comments: toNonNegativeInteger(source.comments),
    reactions: toNonNegativeInteger(source.reactions),
    reviews: toNonNegativeInteger(source.reviews),

    views: toNonNegativeInteger(source.views),
    shares: toNonNegativeInteger(source.shares),

    likes: toNonNegativeInteger(source.likes),
    dislikes: toNonNegativeInteger(source.dislikes),

    reports: toNonNegativeInteger(source.reports),
    notifications: toNonNegativeInteger(source.notifications),

    jobs: toNonNegativeInteger(source.jobs),
    employers: toNonNegativeInteger(source.employers),
    applicants: toNonNegativeInteger(source.applicants),

    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

/* ============================================================
 * RATE / ENGAGEMENT
 * ============================================================ */

export function calculateEngagementRate(
  metrics: Partial<Metrics>,
): number {
  const normalized = normalizeMetrics(metrics);

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
  const normalized = normalizeMetrics(metrics);

  return percentageClamped(
    normalized.activeUsers,
    normalized.users,
  );
}

export function calculateReactionRate(
  metrics: Partial<Metrics>,
): number {
  const normalized = normalizeMetrics(metrics);

  return percentageClamped(
    normalized.reactions,
    normalized.views,
  );
}

export function calculateCommentRate(
  metrics: Partial<Metrics>,
): number {
  const normalized = normalizeMetrics(metrics);

  return percentageClamped(
    normalized.comments,
    normalized.views,
  );
}

export function calculateReviewRate(
  metrics: Partial<Metrics>,
): number {
  const normalized = normalizeMetrics(metrics);

  return percentageClamped(
    normalized.reviews,
    normalized.views,
  );
}

export function calculateShareRate(
  metrics: Partial<Metrics>,
): number {
  const normalized = normalizeMetrics(metrics);

  return percentageClamped(
    normalized.shares,
    normalized.views,
  );
}

export function calculatePublicationRate(
  metrics: Partial<Metrics>,
): number {
  const normalized = normalizeMetrics(metrics);

  return percentageClamped(
    normalized.publishedPublications,
    normalized.publications,
  );
}

/* ============================================================
 * НОРМАЛИЗОВАННАЯ СТАТИСТИКА
 * ============================================================ */

export function buildNormalizedMetrics(
  input?: Partial<Metrics> | null,
): NormalizedMetrics {
  const metrics = normalizeMetrics(input);

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
  value: MetricInput,
  amount: MetricInput = 1,
): number {
  return toNumber(value) + toNumber(amount);
}

export function decrement(
  value: MetricInput,
  amount: MetricInput = 1,
): number {
  return Math.max(
    0,
    toNumber(value) - toNumber(amount),
  );
}

/**
 * Изменяет несколько метрик одновременно.
 */
export function updateMetrics(
  current: Partial<Metrics>,
  changes: Partial<Metrics>,
): Metrics {
  const base = normalizeMetrics(current);

  const result: Metrics = {
    ...base,
  };

  const keys = Object.keys(changes) as Array<
    keyof Metrics
  >;

  for (const key of keys) {
    const value = changes[key];

    if (typeof value === "string") {
      const parsed = toNumber(value);

      if (Number.isFinite(parsed)) {
        (result[key] as unknown) = parsed;
      }

      continue;
    }

    if (typeof value === "number") {
      (result[key] as unknown) = Number.isFinite(value)
        ? value
        : 0;

      continue;
    }

    if (
      key === "createdAt" ||
      key === "updatedAt"
    ) {
      (result[key] as unknown) = value;
    }
  }

  return normalizeMetrics(result);
}

/* ============================================================
 * СРАВНЕНИЕ МЕТРИК
 * ============================================================ */

export function calculateChange(
  current: MetricInput,
  previous: MetricInput,
): number {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  return currentValue - previousValue;
}

export function calculateGrowthRate(
  current: MetricInput,
  previous: MetricInput,
): number {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  if (previousValue === 0) {
    if (currentValue > 0) {
      return 100;
    }

    return 0;
  }

  return round(
    ((currentValue - previousValue) /
      Math.abs(previousValue)) *
      100,
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
  current: MetricInput,
  previous: MetricInput,
): MetricComparison {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);
  const change = currentValue - previousValue;

  return {
    current: currentValue,
    previous: previousValue,
    change,
    growthRate: calculateGrowthRate(
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
): value is MetricInput {
  return (
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  );
}

/* ============================================================
 * СЕРИАЛИЗАЦИЯ
 * ============================================================ */

export function metricsToJSON(
  metrics: Partial<Metrics>,
): string {
  const normalized = normalizeMetrics(metrics);

  return JSON.stringify(normalized);
}

export function metricsFromJSON(
  value: string | null | undefined,
): Metrics {
  if (!value) {
    return normalizeMetrics();
  }

  try {
    const parsed: unknown = JSON.parse(value);

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
  label: string,
  value: MetricInput,
): MetricPoint {
  return {
    label,
    value: toNumber(value),
  };
}

export function createMetricSeries(
  name: string,
  values: readonly MetricInput[],
): MetricSeries {
  return {
    name,
    points: values.map(
      (value, index) =>
        createMetricPoint(
          String(index + 1),
          value,
        ),
    ),
  };
}

/* ============================================================
 * ПОКАЗАТЕЛИ ДЛЯ DASHBOARD
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
  const metrics = buildNormalizedMetrics(input);

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
  const result = normalizeMetrics();

  for (const item of items) {
    const metrics = normalizeMetrics(item);

    result.users += metrics.users;
    result.activeUsers += metrics.activeUsers;
    result.newUsers += metrics.newUsers;

    result.publications += metrics.publications;
    result.publishedPublications +=
      metrics.publishedPublications;
    result.draftPublications +=
      metrics.draftPublications;

    result.comments += metrics.comments;
    result.reactions += metrics.reactions;
    result.reviews += metrics.reviews;

    result.views += metrics.views;
    result.shares += metrics.shares;

    result.likes += metrics.likes;
    result.dislikes += metrics.dislikes;

    result.reports += metrics.reports;
    result.notifications += metrics.notifications;

    result.jobs += metrics.jobs;
    result.employers += metrics.employers;
    result.applicants += metrics.applicants;
  }

  return result;
}

/* ============================================================
 * МЕТРИКИ ПОЛЬЗОВАТЕЛЕЙ
 * ============================================================ */

export function userActivityRate(
  activeUsers: MetricInput,
  totalUsers: MetricInput,
): number {
  return percentageClamped(
    activeUsers,
    totalUsers,
  );
}

export function newUserRate(
  newUsers: MetricInput,
  totalUsers: MetricInput,
): number {
  return percentageClamped(
    newUsers,
    totalUsers,
  );
}

/* ============================================================
 * МЕТРИКИ ПУБЛИКАЦИЙ
 * ============================================================ */

export function publicationSuccessRate(
  published: MetricInput,
  total: MetricInput,
): number {
  return percentageClamped(
    published,
    total,
  );
}

export function averageViewsPerPublication(
  views: MetricInput,
  publications: MetricInput,
): number {
  const publicationCount =
    toNumber(publications);

  if (publicationCount === 0) {
    return 0;
  }

  return round(
    toNumber(views) / publicationCount,
    2,
  );
}

export function averageCommentsPerPublication(
  comments: MetricInput,
  publications: MetricInput,
): number {
  const publicationCount =
    toNumber(publications);

  if (publicationCount === 0) {
    return 0;
  }

  return round(
    toNumber(comments) / publicationCount,
    2,
  );
}

/* ============================================================
 * МЕТРИКИ РЕАКЦИЙ
 * ============================================================ */

export function likeRate(
  likes: MetricInput,
  views: MetricInput,
): number {
  return percentageClamped(
    likes,
    views,
  );
}

export function dislikeRate(
  dislikes: MetricInput,
  views: MetricInput,
): number {
  return percentageClamped(
    dislikes,
    views,
  );
}

export function likeDislikeRatio(
  likes: MetricInput,
  dislikes: MetricInput,
): number {
  const likeValue = toNumber(likes);
  const dislikeValue = toNumber(dislikes);

  if (dislikeValue === 0) {
    return likeValue > 0 ? likeValue : 0;
  }

  return round(
    likeValue / dislikeValue,
    2,
  );
}

/* ============================================================
 * МЕТРИКИ РАБОТЫ / ВАКАНСИЙ
 * ============================================================ */

export function employerActivityRate(
  employers: MetricInput,
  users: MetricInput,
): number {
  return percentageClamped(
    employers,
    users,
  );
}

export function applicantEmployerRatio(
  applicants: MetricInput,
  employers: MetricInput,
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
  value: MetricInput,
  locale = "ru-RU",
): string {
  return toNumber(value).toLocaleString(
    locale,
  );
}

export function formatPercentage(
  value: MetricInput,
  decimals = 2,
): string {
  return `${round(value, decimals)}%`;
}

export function formatCompactNumber(
  value: MetricInput,
): string {
  const number = toNumber(value);

  if (Math.abs(number) < 1_000) {
    return String(Math.round(number));
  }

  if (Math.abs(number) < 1_000_000) {
    return `${round(number / 1_000, 1)}K`;
  }

  if (Math.abs(number) < 1_000_000_000) {
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
 * БЕЗОПАСНЫЙ LIMIT
 * ============================================================ */

export function clampMetric(
  value: MetricInput,
  minValue = 0,
  maxValue = Number.MAX_SAFE_INTEGER,
): number {
  const number = toNumber(value);

  const minNumber = toNumber(minValue);
  const maxNumber = Math.max(
    minNumber,
    toNumber(maxValue),
  );

  return Math.min(
    maxNumber,
    Math.max(minNumber, number),
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
