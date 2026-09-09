// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// METRICS UTILITY
// Version: 2026.09
// ============================================================

import {
  addMetric,
  subtractMetric,
  compareDecimalStrings,
  metricToString,
  formatMetric,
  percentage,
  ratio,
  average,
  sum,
} from "./number";

export type MetricValue = number | bigint | string;

export type MetricKey =
  | "views"
  | "unique_views"
  | "likes"
  | "reactions"
  | "comments"
  | "reviews"
  | "ratings"
  | "bookmarks"
  | "shares"
  | "sends"
  | "reports"
  | "contacts"
  | "applications"
  | "downloads"
  | "clicks"
  | "external_clicks";

export interface Metrics {
  views?: MetricValue;
  unique_views?: MetricValue;
  likes?: MetricValue;
  reactions?: MetricValue;
  comments?: MetricValue;
  reviews?: MetricValue;
  ratings?: MetricValue;
  bookmarks?: MetricValue;
  shares?: MetricValue;
  sends?: MetricValue;
  reports?: MetricValue;
  contacts?: MetricValue;
  applications?: MetricValue;
  downloads?: MetricValue;
  clicks?: MetricValue;
  external_clicks?: MetricValue;
}

export type NormalizedMetrics = Record<MetricKey, string>;

export interface MetricChange {
  key: MetricKey;
  before: string;
  after: string;
  delta: string;
}

export interface MetricsUpdate {
  changes: MetricChange[];
  metrics: NormalizedMetrics;
}

export interface RatingDistribution {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}

export interface RatingSummary {
  count: string;
  average: number;
  distribution: RatingDistribution;
  percentages: RatingDistribution;
}

export const METRIC_KEYS: MetricKey[] = [
  "views",
  "unique_views",
  "likes",
  "reactions",
  "comments",
  "reviews",
  "ratings",
  "bookmarks",
  "shares",
  "sends",
  "reports",
  "contacts",
  "applications",
  "downloads",
  "clicks",
  "external_clicks",
];

export const DEFAULT_METRICS: NormalizedMetrics = {
  views: "0",
  unique_views: "0",
  likes: "0",
  reactions: "0",
  comments: "0",
  reviews: "0",
  ratings: "0",
  bookmarks: "0",
  shares: "0",
  sends: "0",
  reports: "0",
  contacts: "0",
  applications: "0",
  downloads: "0",
  clicks: "0",
  external_clicks: "0",
};

function normalizeMetricValue(
  value: MetricValue | null | undefined,
): string {
  return metricToString(value ?? "0");
}

export function normalizeMetrics(
  metrics: Metrics = {},
): NormalizedMetrics {
  const result: NormalizedMetrics = {
    ...DEFAULT_METRICS,
  };

  for (const key of METRIC_KEYS) {
    result[key] = normalizeMetricValue(metrics[key]);
  }

  return result;
}

export function getMetric(
  metrics: Metrics,
  key: MetricKey,
): string {
  return normalizeMetricValue(metrics[key]);
}

export function setMetric(
  metrics: Metrics,
  key: MetricKey,
  value: MetricValue,
): NormalizedMetrics {
  const result = normalizeMetrics(metrics);
  result[key] = normalizeMetricValue(value);
  return result;
}

export function incrementMetric(
  metrics: Metrics,
  key: MetricKey,
  amount: MetricValue = 1,
): NormalizedMetrics {
  const result = normalizeMetrics(metrics);

  result[key] = addMetric(
    result[key] as never,
    normalizeMetricValue(amount) as never,
  ) as unknown as string;

  return result;
}

export function decrementMetric(
  metrics: Metrics,
  key: MetricKey,
  amount: MetricValue = 1,
): NormalizedMetrics {
  const result = normalizeMetrics(metrics);
  const current = result[key];
  const delta = normalizeMetricValue(amount);

  if (compareDecimalStrings(current, delta) < 0) {
    result[key] = "0";
  } else {
    result[key] = subtractMetric(
      current as never,
      delta as never,
    ) as unknown as string;
  }

  return result;
}

export function applyMetricChanges(
  metrics: Metrics,
  changes: Partial<Record<MetricKey, MetricValue>>,
): MetricsUpdate {
  const result = normalizeMetrics(metrics);
  const history: MetricChange[] = [];

  for (const key of METRIC_KEYS) {
    const value = changes[key];

    if (value === undefined) {
      continue;
    }

    const before = result[key];
    const after = normalizeMetricValue(value);

    result[key] = after;

    const comparison = compareDecimalStrings(
      after,
      before,
    );

    const delta =
      comparison >= 0
        ? subtractMetric(
            after as never,
            before as never,
          ) as unknown as string
        : `-${subtractMetric(
            before as never,
            after as never,
          ) as unknown as string}`;

    history.push({
      key,
      before,
      after,
      delta,
    });
  }

  return {
    changes: history,
    metrics: result,
  };
}

export function incrementMetrics(
  metrics: Metrics,
  changes: Partial<Record<MetricKey, MetricValue>>,
): MetricsUpdate {
  const result = normalizeMetrics(metrics);
  const history: MetricChange[] = [];

  for (const key of METRIC_KEYS) {
    const value = changes[key];

    if (value === undefined) {
      continue;
    }

    const before = result[key];
    const amount = normalizeMetricValue(value);

    const after = addMetric(
      before as never,
      amount as never,
    ) as unknown as string;

    result[key] = after;

    history.push({
      key,
      before,
      after,
      delta: amount,
    });
  }

  return {
    changes: history,
    metrics: result,
  };
}

export function decrementMetrics(
  metrics: Metrics,
  changes: Partial<Record<MetricKey, MetricValue>>,
): MetricsUpdate {
  const result = normalizeMetrics(metrics);
  const history: MetricChange[] = [];

  for (const key of METRIC_KEYS) {
    const value = changes[key];

    if (value === undefined) {
      continue;
    }

    const before = result[key];
    const amount = normalizeMetricValue(value);

    const after =
      compareDecimalStrings(before, amount) < 0
        ? "0"
        : subtractMetric(
            before as never,
            amount as never,
          ) as unknown as string;

    result[key] = after;

    history.push({
      key,
      before,
      after,
      delta:
        before === after
          ? "0"
          : `-${amount}`,
    });
  }

  return {
    changes: history,
    metrics: result,
  };
}

export function mergeMetrics(
  ...values: Metrics[]
): NormalizedMetrics {
  const result = normalizeMetrics();

  for (const metrics of values) {
    const normalized = normalizeMetrics(metrics);

    for (const key of METRIC_KEYS) {
      result[key] = addMetric(
        result[key] as never,
        normalized[key] as never,
      ) as unknown as string;
    }
  }

  return result;
}

export function totalMetrics(
  metrics: Metrics,
): string {
  const normalized = normalizeMetrics(metrics);

  return sum(
    METRIC_KEYS.map(
      (key) => normalized[key],
    ) as never,
  ) as unknown as string;
}

export function engagementCount(
  metrics: Metrics,
): string {
  const normalized = normalizeMetrics(metrics);

  return sum([
    normalized.likes,
    normalized.reactions,
    normalized.comments,
    normalized.reviews,
    normalized.bookmarks,
    normalized.shares,
    normalized.sends,
  ] as never) as unknown as string;
}

export function interactionRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    engagementCount(normalized) as never,
    normalized.views as never,
  ) * 100;
}

export function reactionRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.reactions as never,
    normalized.views as never,
  ) * 100;
}

export function commentRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.comments as never,
    normalized.views as never,
  ) * 100;
}

export function reviewRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.reviews as never,
    normalized.views as never,
  ) * 100;
}

export function shareRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.shares as never,
    normalized.views as never,
  ) * 100;
}

export function applicationRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.applications as never,
    normalized.views as never,
  ) * 100;
}

export function clickRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.clicks as never,
    normalized.views as never,
  ) * 100;
}

export function uniqueViewRate(
  metrics: Metrics,
): number {
  const normalized = normalizeMetrics(metrics);

  return ratio(
    normalized.unique_views as never,
    normalized.views as never,
  ) * 100;
}

export function metricDifference(
  a: MetricValue,
  b: MetricValue,
): string {
  const first = normalizeMetricValue(a);
  const second = normalizeMetricValue(b);

  if (compareDecimalStrings(first, second) >= 0) {
    return subtractMetric(
      first as never,
      second as never,
    ) as unknown as string;
  }

  return `-${subtractMetric(
    second as never,
    first as never,
  ) as unknown as string}`;
}

export function metricPercentageChange(
  oldValue: MetricValue,
  newValue: MetricValue,
): number {
  const oldMetric = normalizeMetricValue(oldValue);
  const newMetric = normalizeMetricValue(newValue);

  if (compareDecimalStrings(oldMetric, "0") === 0) {
    return compareDecimalStrings(newMetric, "0") === 0
      ? 0
      : 100;
  }

  return (
    ratio(
      metricDifference(
        newMetric,
        oldMetric,
      ) as never,
      oldMetric as never,
    ) * 100
  );
}

export function metricShare(
  value: MetricValue,
  total: MetricValue,
): number {
  return (
    ratio(
      normalizeMetricValue(value) as never,
      normalizeMetricValue(total) as never,
    ) * 100
  );
}

export function formatMetricValue(
  value: MetricValue,
): string {
  return formatMetric(
    normalizeMetricValue(value) as never,
  );
}

export function formatMetricPercent(
  value: MetricValue,
): string {
  return `${formatMetricValue(value)}%`;
}

export function calculateRatingAverage(
  ratings: RatingDistribution,
): number {
  const total =
    ratings.one +
    ratings.two +
    ratings.three +
    ratings.four +
    ratings.five;

  if (total === 0) {
    return 0;
  }

  return (
    ratings.one +
    ratings.two * 2 +
    ratings.three * 3 +
    ratings.four * 4 +
    ratings.five * 5
  ) / total;
}

export function createRatingSummary(
  ratings: RatingDistribution,
): RatingSummary {
  const count =
    ratings.one +
    ratings.two +
    ratings.three +
    ratings.four +
    ratings.five;

  const percentages: RatingDistribution = {
    one: percentage(ratings.one, count),
    two: percentage(ratings.two, count),
    three: percentage(ratings.three, count),
    four: percentage(ratings.four, count),
    five: percentage(ratings.five, count),
  };

  return {
    count: String(count),
    average: calculateRatingAverage(ratings),
    distribution: { ...ratings },
    percentages,
  };
}

export function roundRating(
  value: number,
  precision = 2,
): number {
  const factor = Math.pow(
    10,
    Math.max(0, precision),
  );

  return Math.round(
    value * factor,
  ) / factor;
}

export function normalizeRating(
  value: unknown,
): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      Math.round(numeric),
    ),
  );
}

export function isValidRating(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export function createEmptyRatingDistribution(): RatingDistribution {
  return {
    one: 0,
    two: 0,
    three: 0,
    four: 0,
    five: 0,
  };
}

export function addRatingToDistribution(
  distribution: RatingDistribution,
  rating: number,
): RatingDistribution {
  const result = { ...distribution };

  if (!isValidRating(rating)) {
    return result;
  }

  if (rating === 1) result.one++;
  else if (rating === 2) result.two++;
  else if (rating === 3) result.three++;
  else if (rating === 4) result.four++;
  else if (rating === 5) result.five++;

  return result;
}

export function removeRatingFromDistribution(
  distribution: RatingDistribution,
  rating: number,
): RatingDistribution {
  const result = { ...distribution };

  if (!isValidRating(rating)) {
    return result;
  }

  if (rating === 1) result.one = Math.max(0, result.one - 1);
  else if (rating === 2) result.two = Math.max(0, result.two - 1);
  else if (rating === 3) result.three = Math.max(0, result.three - 1);
  else if (rating === 4) result.four = Math.max(0, result.four - 1);
  else if (rating === 5) result.five = Math.max(0, result.five - 1);

  return result;
}

export function calculateAverage(
  values: readonly MetricValue[],
): number {
  if (values.length === 0) {
    return 0;
  }

  const numbers = values.map((value) =>
    Number(normalizeMetricValue(value)),
  );

  return average(numbers as never) as unknown as number;
}

export function compareMetrics(
  a: MetricValue,
  b: MetricValue,
): number {
  return compareDecimalStrings(
    normalizeMetricValue(a),
    normalizeMetricValue(b),
  );
}

export function isZeroMetric(
  value: MetricValue,
): boolean {
  return (
    compareDecimalStrings(
      normalizeMetricValue(value),
      "0",
    ) === 0
  );
}

export function isPositiveMetric(
  value: MetricValue,
): boolean {
  return (
    compareDecimalStrings(
      normalizeMetricValue(value),
      "0",
    ) > 0
  );
}

export function isNegativeMetric(
  value: MetricValue,
): boolean {
  return (
    compareDecimalStrings(
      normalizeMetricValue(value),
      "0",
    ) < 0
  );
}

export function metricKeys(): MetricKey[] {
  return [...METRIC_KEYS];
}

export function hasMetricKey(
  value: string,
): value is MetricKey {
  return METRIC_KEYS.includes(
    value as MetricKey,
  );
                                       }
