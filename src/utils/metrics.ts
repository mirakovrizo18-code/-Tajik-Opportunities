// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// METRICS / ANALYTICS UTILITIES
// Version: 2026.09 PRODUCTION
// ============================================================

import {
  addMetric,
  subtractMetric,
  compareDecimalStrings,
  metricToString,
  formatMetric,
} from "./number";

// ============================================================
// TYPES
// ============================================================

export type MetricValue =
  | number
  | bigint
  | string;

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

export interface NormalizedMetrics {
  views: string;
  unique_views: string;
  likes: string;
  reactions: string;
  comments: string;
  reviews: string;
  ratings: string;
  bookmarks: string;
  shares: string;
  sends: string;
  reports: string;
  contacts: string;
  applications: string;
  downloads: string;
  clicks: string;
  external_clicks: string;
}

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

// ============================================================
// METRIC KEYS
// ============================================================

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

// ============================================================
// DEFAULT METRICS
// ============================================================

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

// ============================================================
// INTERNAL HELPERS
// ============================================================

function normalizeMetricValue(
  value: MetricValue | null | undefined,
): string {
  return metricToString(
    value ?? "0",
  );
}

/**
 * Converts a metric to a JavaScript number only when
 * a normal numeric calculation is required.
 *
 * Huge counters remain stored as decimal strings.
 */
function metricToNumber(
  value: MetricValue,
): number {
  const normalized =
    normalizeMetricValue(value);

  const number =
    Number(normalized);

  if (
    !Number.isFinite(number)
  ) {
    return Number.MAX_VALUE;
  }

  return number;
}

/**
 * Safe percentage calculation for huge decimal counters.
 *
 * The actual counters remain exact strings.
 * Only the final percentage is represented as number.
 */
function metricPercentage(
  value: MetricValue,
  total: MetricValue,
): number {
  const valueNumber =
    metricToNumber(value);

  const totalNumber =
    metricToNumber(total);

  if (
    !Number.isFinite(valueNumber) ||
    !Number.isFinite(totalNumber) ||
    totalNumber === 0
  ) {
    return 0;
  }

  return (
    (valueNumber / totalNumber) *
    100
  );
}

/**
 * Safe ratio calculation.
 */
function metricRatio(
  numerator: MetricValue,
  denominator: MetricValue,
): number {
  const numeratorNumber =
    metricToNumber(numerator);

  const denominatorNumber =
    metricToNumber(denominator);

  if (
    !Number.isFinite(numeratorNumber) ||
    !Number.isFinite(denominatorNumber) ||
    denominatorNumber === 0
  ) {
    return 0;
  }

  return (
    numeratorNumber /
    denominatorNumber
  );
}

/**
 * Exact decimal-string sum.
 *
 * Does not use JavaScript number arithmetic.
 */
function sumMetricValues(
  values: readonly MetricValue[],
): string {
  let result = "0";

  for (const value of values) {
    result = addMetric(
      result,
      normalizeMetricValue(value),
    );
  }

  return result;
}

/**
 * Difference between two metrics.
 */
function difference(
  after: string,
  before: string,
): string {
  if (
    compareDecimalStrings(
      after,
      before,
    ) >= 0
  ) {
    return subtractMetric(
      after,
      before,
    );
  }

  return `-${subtractMetric(
    before,
    after,
  )}`;
}

// ============================================================
// NORMALIZATION
// ============================================================

export function normalizeMetrics(
  metrics: Metrics = {},
): NormalizedMetrics {
  return {
    views:
      normalizeMetricValue(
        metrics.views,
      ),

    unique_views:
      normalizeMetricValue(
        metrics.unique_views,
      ),

    likes:
      normalizeMetricValue(
        metrics.likes,
      ),

    reactions:
      normalizeMetricValue(
        metrics.reactions,
      ),

    comments:
      normalizeMetricValue(
        metrics.comments,
      ),

    reviews:
      normalizeMetricValue(
        metrics.reviews,
      ),

    ratings:
      normalizeMetricValue(
        metrics.ratings,
      ),

    bookmarks:
      normalizeMetricValue(
        metrics.bookmarks,
      ),

    shares:
      normalizeMetricValue(
        metrics.shares,
      ),

    sends:
      normalizeMetricValue(
        metrics.sends,
      ),

    reports:
      normalizeMetricValue(
        metrics.reports,
      ),

    contacts:
      normalizeMetricValue(
        metrics.contacts,
      ),

    applications:
      normalizeMetricValue(
        metrics.applications,
      ),

    downloads:
      normalizeMetricValue(
        metrics.downloads,
      ),

    clicks:
      normalizeMetricValue(
        metrics.clicks,
      ),

    external_clicks:
      normalizeMetricValue(
        metrics.external_clicks,
      ),
  };
}

// ============================================================
// GET / SET
// ============================================================

export function getMetric(
  metrics: Metrics,
  key: MetricKey,
): string {
  return normalizeMetricValue(
    metrics[key],
  );
}

export function setMetric(
  metrics: Metrics,
  key: MetricKey,
  value: MetricValue,
): NormalizedMetrics {
  const result =
    normalizeMetrics(metrics);

  result[key] =
    normalizeMetricValue(value);

  return result;
}

// ============================================================
// SINGLE METRIC INCREMENT / DECREMENT
// ============================================================

export function incrementMetric(
  metrics: Metrics,
  key: MetricKey,
  amount: MetricValue = 1,
): NormalizedMetrics {
  const result =
    normalizeMetrics(metrics);

  result[key] =
    addMetric(
      result[key],
      normalizeMetricValue(amount),
    );

  return result;
}

export function decrementMetric(
  metrics: Metrics,
  key: MetricKey,
  amount: MetricValue = 1,
): NormalizedMetrics {
  const result =
    normalizeMetrics(metrics);

  const current =
    result[key];

  const delta =
    normalizeMetricValue(amount);

  if (
    compareDecimalStrings(
      current,
      delta,
    ) < 0
  ) {
    result[key] = "0";
  } else {
    result[key] =
      subtractMetric(
        current,
        delta,
      );
  }

  return result;
}

// ============================================================
// APPLY ABSOLUTE CHANGES
// ============================================================

export function applyMetricChanges(
  metrics: Metrics,
  changes: Partial<
    Record<
      MetricKey,
      MetricValue
    >
  >,
): MetricsUpdate {
  const current =
    normalizeMetrics(metrics);

  const result = {
    ...current,
  };

  const history: MetricChange[] =
    [];

  for (const key of METRIC_KEYS) {
    if (
      changes[key] ===
      undefined
    ) {
      continue;
    }

    const before =
      result[key];

    const after =
      normalizeMetricValue(
        changes[key],
      );

    result[key] = after;

    history.push({
      key,
      before,
      after,
      delta:
        difference(
          after,
          before,
        ),
    });
  }

  return {
    changes: history,
    metrics: result,
  };
}

// ============================================================
// INCREMENT MULTIPLE METRICS
// ============================================================

export function incrementMetrics(
  metrics: Metrics,
  changes: Partial<
    Record<
      MetricKey,
      MetricValue
    >
  >,
): MetricsUpdate {
  const current =
    normalizeMetrics(metrics);

  const result = {
    ...current,
  };

  const history: MetricChange[] =
    [];

  for (const key of METRIC_KEYS) {
    if (
      changes[key] ===
      undefined
    ) {
      continue;
    }

    const before =
      result[key];

    const amount =
      normalizeMetricValue(
        changes[key],
      );

    const after =
      addMetric(
        before,
        amount,
      );

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

// ============================================================
// DECREMENT MULTIPLE METRICS
// ============================================================

export function decrementMetrics(
  metrics: Metrics,
  changes: Partial<
    Record<
      MetricKey,
      MetricValue
    >
  >,
): MetricsUpdate {
  const current =
    normalizeMetrics(metrics);

  const result = {
    ...current,
  };

  const history: MetricChange[] =
    [];

  for (const key of METRIC_KEYS) {
    if (
      changes[key] ===
      undefined
    ) {
      continue;
    }

    const before =
      result[key];

    const amount =
      normalizeMetricValue(
        changes[key],
      );

    const after =
      compareDecimalStrings(
        before,
        amount,
      ) < 0
        ? "0"
        : subtractMetric(
            before,
            amount,
          );

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

// ============================================================
// MERGE METRICS
// ============================================================

export function mergeMetrics(
  ...values: Metrics[]
): NormalizedMetrics {
  const result =
    normalizeMetrics();

  for (const metrics of values) {
    const normalized =
      normalizeMetrics(metrics);

    for (const key of METRIC_KEYS) {
      result[key] =
        addMetric(
          result[key],
          normalized[key],
        );
    }
  }

  return result;
}

// ============================================================
// TOTAL METRICS
// ============================================================

export function totalMetrics(
  metrics: Metrics,
): string {
  const normalized =
    normalizeMetrics(metrics);

  return sumMetricValues(
    METRIC_KEYS.map(
      (key) =>
        normalized[key],
    ),
  );
}

// ============================================================
// ENGAGEMENT
// ============================================================

export function engagementCount(
  metrics: Metrics,
): string {
  const normalized =
    normalizeMetrics(metrics);

  return sumMetricValues([
    normalized.likes,
    normalized.reactions,
    normalized.comments,
    normalized.reviews,
    normalized.bookmarks,
    normalized.shares,
    normalized.sends,
  ]);
}

// ============================================================
// RATES
// ============================================================

export function interactionRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      engagementCount(
        normalized,
      ),
      normalized.views,
    ) * 100
  );
}

export function reactionRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.reactions,
      normalized.views,
    ) * 100
  );
}

export function commentRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.comments,
      normalized.views,
    ) * 100
  );
}

export function reviewRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.reviews,
      normalized.views,
    ) * 100
  );
}

export function shareRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.shares,
      normalized.views,
    ) * 100
  );
}

export function applicationRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.applications,
      normalized.views,
    ) * 100
  );
}

export function clickRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.clicks,
      normalized.views,
    ) * 100
  );
}

export function uniqueViewRate(
  metrics: Metrics,
): number {
  const normalized =
    normalizeMetrics(metrics);

  return (
    metricRatio(
      normalized.unique_views,
      normalized.views,
    ) * 100
  );
}

// ============================================================
// DIFFERENCES
// ============================================================

export function metricDifference(
  a: MetricValue,
  b: MetricValue,
): string {
  return difference(
    normalizeMetricValue(a),
    normalizeMetricValue(b),
  );
}

// ============================================================
// PERCENTAGE CHANGE
// ============================================================

export function metricPercentageChange(
  oldValue: MetricValue,
  newValue: MetricValue,
): number {
  const oldMetric =
    normalizeMetricValue(oldValue);

  const newMetric =
    normalizeMetricValue(newValue);

  if (
    compareDecimalStrings(
      oldMetric,
      "0",
    ) === 0
  ) {
    return compareDecimalStrings(
      newMetric,
      "0",
    ) === 0
      ? 0
      : 100;
  }

  return (
    metricRatio(
      metricDifference(
        newMetric,
        oldMetric,
      ),
      oldMetric,
    ) * 100
  );
}

// ============================================================
// METRIC SHARE
// ============================================================

export function metricShare(
  value: MetricValue,
  total: MetricValue,
): number {
  return metricPercentage(
    normalizeMetricValue(value),
    normalizeMetricValue(total),
  );
}

// ============================================================
// FORMATTING
// ============================================================

export function formatMetricValue(
  value: MetricValue,
): string {
  return formatMetric(
    normalizeMetricValue(value),
  );
}

export function formatMetricPercent(
  value: number,
): string {
  if (
    !Number.isFinite(value)
  ) {
    return "0%";
  }

  return `${roundRating(
    value,
    2,
  )}%`;
}

// ============================================================
// RATINGS
// ============================================================

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

  const weighted =
    ratings.one * 1 +
    ratings.two * 2 +
    ratings.three * 3 +
    ratings.four * 4 +
    ratings.five * 5;

  return weighted / total;
}

// ============================================================
// RATING SUMMARY
// ============================================================

export function createRatingSummary(
  ratings: RatingDistribution,
): RatingSummary {
  const count =
    ratings.one +
    ratings.two +
    ratings.three +
    ratings.four +
    ratings.five;

  const percentages: RatingDistribution =
    {
      one:
        count === 0
          ? 0
          : (ratings.one /
              count) *
            100,

      two:
        count === 0
          ? 0
          : (ratings.two /
              count) *
            100,

      three:
        count === 0
          ? 0
          : (ratings.three /
              count) *
            100,

      four:
        count === 0
          ? 0
          : (ratings.four /
              count) *
            100,

      five:
        count === 0
          ? 0
          : (ratings.five /
              count) *
            100,
    };

  return {
    count: String(count),

    average:
      calculateRatingAverage(
        ratings,
      ),

    distribution: {
      ...ratings,
    },

    percentages,
  };
}

// ============================================================
// RATING ROUNDING
// ============================================================

export function roundRating(
  value: number,
  precision = 2,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  const safePrecision =
    Math.max(
      0,
      Math.min(
        10,
        Math.trunc(
          precision,
        ),
      ),
    );

  const factor =
    Math.pow(
      10,
      safePrecision,
    );

  return (
    Math.round(
      value * factor,
    ) / factor
  );
}

// ============================================================
// RATING NORMALIZATION
// ============================================================

export function normalizeRating(
  value: unknown,
): number {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(numeric)
  ) {
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

// ============================================================
// RATING VALIDATION
// ============================================================

export function isValidRating(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

// ============================================================
// EMPTY DISTRIBUTION
// ============================================================

export function createEmptyRatingDistribution(): RatingDistribution {
  return {
    one: 0,
    two: 0,
    three: 0,
    four: 0,
    five: 0,
  };
}

// ============================================================
// ADD RATING
// ============================================================

export function addRatingToDistribution(
  distribution: RatingDistribution,
  rating: number,
): RatingDistribution {
  const result = {
    ...distribution,
  };

  if (
    !isValidRating(rating)
  ) {
    return result;
  }

  switch (rating) {
    case 1:
      result.one++;
      break;

    case 2:
      result.two++;
      break;

    case 3:
      result.three++;
      break;

    case 4:
      result.four++;
      break;

    case 5:
      result.five++;
      break;
  }

  return result;
}

// ============================================================
// REMOVE RATING
// ============================================================

export function removeRatingFromDistribution(
  distribution: RatingDistribution,
  rating: number,
): RatingDistribution {
  const result = {
    ...distribution,
  };

  if (
    !isValidRating(rating)
  ) {
    return result;
  }

  switch (rating) {
    case 1:
      result.one =
        Math.max(
          0,
          result.one - 1,
        );
      break;

    case 2:
      result.two =
        Math.max(
          0,
          result.two - 1,
        );
      break;

    case 3:
      result.three =
        Math.max(
          0,
          result.three - 1,
        );
      break;

    case 4:
      result.four =
        Math.max(
          0,
          result.four - 1,
        );
      break;

    case 5:
      result.five =
        Math.max(
          0,
          result.five - 1,
        );
      break;
  }

  return result;
}

// ============================================================
// AVERAGE
// ============================================================

export function calculateAverage(
  values: readonly MetricValue[],
): number {
  if (
    values.length === 0
  ) {
    return 0;
  }

  let total = 0;

  for (const value of values) {
    const numeric =
      Number(
        normalizeMetricValue(value),
      );

    if (
      Number.isFinite(numeric)
    ) {
      total += numeric;
    }
  }

  return total / values.length;
}

// ============================================================
// COMPARISON
// ============================================================

export function compareMetrics(
  a: MetricValue,
  b: MetricValue,
): number {
  return compareDecimalStrings(
    normalizeMetricValue(a),
    normalizeMetricValue(b),
  );
}

// ============================================================
// ZERO / POSITIVE / NEGATIVE
// ============================================================

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

// ============================================================
// KEYS
// ============================================================

export function metricKeys(): MetricKey[] {
  return [
    ...METRIC_KEYS,
  ];
}

export function hasMetricKey(
  value: string,
): value is MetricKey {
  return METRIC_KEYS.includes(
    value as MetricKey,
  );
}

// ============================================================
// END
// ============================================================
