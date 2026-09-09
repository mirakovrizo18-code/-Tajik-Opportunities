/* ============================================================
   TAJIK OPPORTUNITIES
   METRICS UTILITY
   Production-safe decimal metric helpers

   Supports:
   • number
   • bigint
   • decimal strings
   • huge counters
   • ratings
   • percentages
   • ratios
   • distributions
   ============================================================ */

export type MetricValue = number | bigint | string;

export type MetricKey =
  | "views"
  | "unique_views"
  | "likes"
  | "reactions"
  | "comments"
  | "replies"
  | "shares"
  | "saves"
  | "applications"
  | "clicks"
  | "reports"
  | "hides"
  | "favorites"
  | "followers"
  | "participants"
  | "messages"
  | "reviews"
  | "rating_count"
  | "rating_sum"
  | "positive"
  | "negative"
  | string;

export type Metrics = Record<string, MetricValue>;

export type NormalizedMetrics = Record<string, string>;

export interface MetricChange {
  key: MetricKey;
  before: string;
  after: string;
  delta: string;
}

export interface MetricsUpdate {
  [key: string]: MetricValue | null | undefined;
}

export interface RatingDistribution {
  [rating: string]: string;
}

export interface RatingSummary {
  average: string;
  count: string;
  sum: string;
  distribution: RatingDistribution;
}

/* ------------------------------------------------------------
   INTERNAL DECIMAL HELPERS
   ------------------------------------------------------------ */

function clean(value: MetricValue | null | undefined): string {
  if (value === null || value === undefined) return "0";

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "0";

    if (Number.isInteger(value)) {
      return String(value);
    }

    return String(value);
  }

  const text = String(value).trim();

  if (!text) return "0";

  if (!/^-?\d+(?:\.\d+)?$/.test(text)) {
    return "0";
  }

  return normalizeDecimal(text);
}

function normalizeDecimal(value: string): string {
  let negative = false;
  let text = value.trim();

  if (text.startsWith("-")) {
    negative = true;
    text = text.slice(1);
  }

  const parts = text.split(".");
  let integerPart = parts[0] || "0";
  let decimalPart = parts[1] || "";

  integerPart = integerPart.replace(/^0+(?=\d)/, "");
  decimalPart = decimalPart.replace(/0+$/, "");

  const result =
    decimalPart.length > 0
      ? `${integerPart}.${decimalPart}`
      : integerPart;

  if (result === "0") return "0";

  return negative ? `-${result}` : result;
}

function splitDecimal(value: string): {
  negative: boolean;
  integer: string;
  fraction: string;
} {
  const normalized = normalizeDecimal(value);

  const negative = normalized.startsWith("-");
  const absolute = negative ? normalized.slice(1) : normalized;

  const parts = absolute.split(".");

  return {
    negative,
    integer: parts[0] || "0",
    fraction: parts[1] || "",
  };
}

function compareAbs(a: string, b: string): number {
  const aa = normalizeDecimal(a);
  const bb = normalizeDecimal(b);

  const pa = splitDecimal(aa);
  const pb = splitDecimal(bb);

  if (pa.integer.length !== pb.integer.length) {
    return pa.integer.length > pb.integer.length ? 1 : -1;
  }

  if (pa.integer !== pb.integer) {
    return pa.integer > pb.integer ? 1 : -1;
  }

  const max = Math.max(pa.fraction.length, pb.fraction.length);

  const fa = pa.fraction.padEnd(max, "0");
  const fb = pb.fraction.padEnd(max, "0");

  if (fa === fb) return 0;

  return fa > fb ? 1 : -1;
}

function addPositive(a: string, b: string): string {
  const pa = splitDecimal(a);
  const pb = splitDecimal(b);

  const scale = Math.max(
    pa.fraction.length,
    pb.fraction.length,
  );

  const ai = BigInt(
    `${pa.integer}${pa.fraction.padEnd(scale, "0")}`,
  );

  const bi = BigInt(
    `${pb.integer}${pb.fraction.padEnd(scale, "0")}`,
  );

  const sum = ai + bi;

  if (scale === 0) {
    return sum.toString();
  }

  const raw = sum.toString().padStart(scale + 1, "0");

  const integerPart = raw.slice(0, -scale) || "0";
  const fractionPart = raw.slice(-scale);

  return normalizeDecimal(
    `${integerPart}.${fractionPart}`,
  );
}

function subtractPositive(a: string, b: string): string {
  const comparison = compareAbs(a, b);

  if (comparison === 0) return "0";

  const pa = splitDecimal(a);
  const pb = splitDecimal(b);

  const scale = Math.max(
    pa.fraction.length,
    pb.fraction.length,
  );

  const ai = BigInt(
    `${pa.integer}${pa.fraction.padEnd(scale, "0")}`,
  );

  const bi = BigInt(
    `${pb.integer}${pb.fraction.padEnd(scale, "0")}`,
  );

  const result = comparison > 0
    ? ai - bi
    : bi - ai;

  const raw = result.toString();

  if (scale === 0) {
    return raw;
  }

  const padded = raw.padStart(scale + 1, "0");

  const integerPart = padded.slice(0, -scale) || "0";
  const fractionPart = padded.slice(-scale);

  const absolute = normalizeDecimal(
    `${integerPart}.${fractionPart}`,
  );

  return comparison > 0 ? absolute : `-${absolute}`;
}

/* ------------------------------------------------------------
   PUBLIC DECIMAL OPERATIONS
   ------------------------------------------------------------ */

export function metricToString(
  value: MetricValue | null | undefined,
): string {
  return clean(value);
}

export function addMetric(
  a: MetricValue | null | undefined,
  b: MetricValue | null | undefined,
): string {
  const aa = clean(a);
  const bb = clean(b);

  const sa = splitDecimal(aa);
  const sb = splitDecimal(bb);

  if (sa.negative === sb.negative) {
    const result = addPositive(
      sa.negative ? aa.slice(1) : aa,
      sb.negative ? bb.slice(1) : bb,
    );

    return sa.negative ? `-${result}` : result;
  }

  const absA = sa.negative ? aa.slice(1) : aa;
  const absB = sb.negative ? bb.slice(1) : bb;

  const comparison = compareAbs(absA, absB);

  if (comparison === 0) return "0";

  if (comparison > 0) {
    const result = subtractPositive(absA, absB);
    return sa.negative ? `-${result}` : result;
  }

  const result = subtractPositive(absB, absA);
  return sb.negative ? `-${result}` : result;
}

export function subtractMetric(
  a: MetricValue | null | undefined,
  b: MetricValue | null | undefined,
): string {
  const bb = clean(b);

  if (bb.startsWith("-")) {
    return addMetric(a, bb.slice(1));
  }

  return addMetric(a, `-${bb}`);
}

export function compareDecimalStrings(
  a: MetricValue | null | undefined,
  b: MetricValue | null | undefined,
): number {
  const aa = clean(a);
  const bb = clean(b);

  const sa = splitDecimal(aa);
  const sb = splitDecimal(bb);

  if (sa.negative && !sb.negative) return -1;
  if (!sa.negative && sb.negative) return 1;

  const comparison = compareAbs(
    sa.negative ? aa.slice(1) : aa,
    sb.negative ? bb.slice(1) : bb,
  );

  return sa.negative ? -comparison : comparison;
}

export function incrementMetric(
  value: MetricValue | null | undefined,
  amount: MetricValue = 1,
): string {
  return addMetric(value, amount);
}

export function decrementMetric(
  value: MetricValue | null | undefined,
  amount: MetricValue = 1,
): string {
  return subtractMetric(value, amount);
}

/* ------------------------------------------------------------
   NORMALIZATION
   ------------------------------------------------------------ */

export function normalizeMetricValue(
  value: MetricValue | null | undefined,
): string {
  return clean(value);
}

export function normalizeMetrics(
  metrics: Metrics | null | undefined,
): NormalizedMetrics {
  const result: NormalizedMetrics = {};

  if (!metrics) return result;

  for (const [key, value] of Object.entries(metrics)) {
    result[key] = clean(value);
  }

  return result;
}

export function getMetric(
  metrics: Metrics | null | undefined,
  key: MetricKey,
): string {
  if (!metrics) return "0";

  return clean(metrics[String(key)]);
}

export function setMetric(
  metrics: Metrics,
  key: MetricKey,
  value: MetricValue,
): Metrics {
  return {
    ...metrics,
    [String(key)]: clean(value),
  };
}

/* ------------------------------------------------------------
   BULK OPERATIONS
   ------------------------------------------------------------ */

export function applyMetricChanges(
  metrics: Metrics,
  changes: MetricsUpdate,
): Metrics {
  const result: Metrics = {
    ...metrics,
  };

  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined) continue;

    result[key] = clean(value);
  }

  return result;
}

export function incrementMetrics(
  metrics: Metrics,
  changes: MetricsUpdate,
): Metrics {
  const result: Metrics = {
    ...metrics,
  };

  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined) continue;

    result[key] = addMetric(
      result[key],
      value,
    );
  }

  return result;
}

export function decrementMetrics(
  metrics: Metrics,
  changes: MetricsUpdate,
): Metrics {
  const result: Metrics = {
    ...metrics,
  };

  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined) continue;

    result[key] = subtractMetric(
      result[key],
      value,
    );
  }

  return result;
}

export function mergeMetrics(
  ...metricsList: Array<Metrics | null | undefined>
): Metrics {
  const result: Metrics = {};

  for (const metrics of metricsList) {
    if (!metrics) continue;

    for (const [key, value] of Object.entries(metrics)) {
      result[key] = addMetric(
        result[key],
        value,
      );
    }
  }

  return result;
}

export function totalMetrics(
  metrics: Metrics | null | undefined,
): string {
  if (!metrics) return "0";

  let total = "0";

  for (const value of Object.values(metrics)) {
    total = addMetric(total, value);
  }

  return total;
}

/* ------------------------------------------------------------
   RATIOS / PERCENTAGES
   ------------------------------------------------------------ */

function decimalNumber(value: MetricValue): number {
  const n = Number(clean(value));

  if (!Number.isFinite(n)) return 0;

  return n;
}

export function ratio(
  numerator: MetricValue,
  denominator: MetricValue,
): number {
  const n = decimalNumber(numerator);
  const d = decimalNumber(denominator);

  if (d === 0) return 0;

  return n / d;
}

export function percentage(
  numerator: MetricValue,
  denominator: MetricValue,
  decimals = 2,
): number {
  const value = ratio(numerator, denominator) * 100;

  return Number(
    value.toFixed(Math.max(0, decimals)),
  );
}

export function interactionRate(
  metrics: Metrics,
): number {
  const interactions = addMetric(
    addMetric(getMetric(metrics, "reactions"), getMetric(metrics, "comments")),
    addMetric(getMetric(metrics, "shares"), getMetric(metrics, "saves")),
  );

  return percentage(
    interactions,
    getMetric(metrics, "views"),
  );
}

export function reactionRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "reactions"),
    getMetric(metrics, "views"),
  );
}

export function commentRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "comments"),
    getMetric(metrics, "views"),
  );
}

export function reviewRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "reviews"),
    getMetric(metrics, "views"),
  );
}

export function shareRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "shares"),
    getMetric(metrics, "views"),
  );
}

export function applicationRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "applications"),
    getMetric(metrics, "views"),
  );
}

export function clickRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "clicks"),
    getMetric(metrics, "views"),
  );
}

export function uniqueViewRate(metrics: Metrics): number {
  return percentage(
    getMetric(metrics, "unique_views"),
    getMetric(metrics, "views"),
  );
}

export function engagementCount(
  metrics: Metrics,
): string {
  let result = "0";

  const keys = [
    "reactions",
    "comments",
    "replies",
    "shares",
    "saves",
    "applications",
    "clicks",
  ];

  for (const key of keys) {
    result = addMetric(
      result,
      getMetric(metrics, key),
    );
  }

  return result;
}

/* ------------------------------------------------------------
   DIFFERENCES
   ------------------------------------------------------------ */

export function metricDifference(
  current: MetricValue,
  previous: MetricValue,
): string {
  return subtractMetric(current, previous);
}

export function metricPercentageChange(
  current: MetricValue,
  previous: MetricValue,
): number {
  const oldValue = clean(previous);

  if (oldValue === "0") {
    return clean(current) === "0" ? 0 : 100;
  }

  return percentage(
    subtractMetric(current, previous),
    oldValue,
  );
}

export function metricShare(
  value: MetricValue,
  total: MetricValue,
): number {
  return percentage(value, total);
}

/* ------------------------------------------------------------
   FORMATTING
   ------------------------------------------------------------ */

export function formatMetricValue(
  value: MetricValue,
): string {
  const normalized = clean(value);

  const n = Number(normalized);

  if (!Number.isFinite(n)) {
    return normalized;
  }

  return new Intl.NumberFormat("ru-RU").format(n);
}

export function formatMetric(
  value: MetricValue,
): string {
  return formatMetricValue(value);
}

export function formatMetricPercent(
  value: number,
  decimals = 2,
): string {
  return `${value.toFixed(decimals)}%`;
}

/* ------------------------------------------------------------
   RATINGS
   ------------------------------------------------------------ */

export function addRating(
  distribution: RatingDistribution,
  rating: number,
): RatingDistribution {
  const safeRating = Math.min(
    5,
    Math.max(1, Math.round(rating)),
  );

  const key = String(safeRating);

  return {
    ...distribution,
    [key]: addMetric(
      distribution[key],
      1,
    ),
  };
}

export function ratingSum(
  distribution: RatingDistribution,
): string {
  let result = "0";

  for (let rating = 1; rating <= 5; rating++) {
    const count = getMetric(
      distribution,
      String(rating),
    );

    result = addMetric(
      result,
      multiplyMetric(count, rating),
    );
  }

  return result;
}

export function multiplyMetric(
  value: MetricValue,
  multiplier: MetricValue,
): string {
  const a = decimalNumber(value);
  const b = decimalNumber(multiplier);

  if (
    Number.isSafeInteger(a) &&
    Number.isSafeInteger(b)
  ) {
    return (
      BigInt(Math.trunc(a)) *
      BigInt(Math.trunc(b))
    ).toString();
  }

  return String(a * b);
}

export function calculateAverage(
  values: Array<MetricValue>,
): string {
  if (values.length === 0) return "0";

  let total = "0";

  for (const value of values) {
    total = addMetric(total, value);
  }

  return String(
    decimalNumber(total) / values.length,
  );
}

export function buildRatingSummary(
  distribution: RatingDistribution,
): RatingSummary {
  let count = "0";

  for (const value of Object.values(distribution)) {
    count = addMetric(count, value);
  }

  const sum = ratingSum(distribution);

  const average =
    count === "0"
      ? "0"
      : String(
          decimalNumber(sum) /
            decimalNumber(count),
        );

  return {
    average,
    count,
    sum,
    distribution: {
      ...distribution,
    },
  };
}

export function calculateRatingSummary(
  ratings: number[],
): RatingSummary {
  const distribution: RatingDistribution = {};

  for (let i = 1; i <= 5; i++) {
    distribution[String(i)] = "0";
  }

  for (const rating of ratings) {
    const safe = Math.min(
      5,
      Math.max(1, Math.round(rating)),
    );

    distribution[String(safe)] = addMetric(
      distribution[String(safe)],
      1,
    );
  }

  return buildRatingSummary(distribution);
}

/* ------------------------------------------------------------
   COMPARISON
   ------------------------------------------------------------ */

export function compareMetrics(
  a: Metrics,
  b: Metrics,
): Record<string, number> {
  const keys = new Set([
    ...Object.keys(a),
    ...Object.keys(b),
  ]);

  const result: Record<string, number> = {};

  for (const key of keys) {
    result[key] = compareDecimalStrings(
      a[key],
      b[key],
    );
  }

  return result;
}

export function isZeroMetric(
  value: MetricValue | null | undefined,
): boolean {
  return clean(value) === "0";
}

export function isPositiveMetric(
  value: MetricValue | null | undefined,
): boolean {
  return compareDecimalStrings(value, "0") > 0;
}

export function isNegativeMetric(
  value: MetricValue | null | undefined,
): boolean {
  return compareDecimalStrings(value, "0") < 0;
}

export function metricKeys(
  metrics: Metrics | null | undefined,
): string[] {
  return metrics ? Object.keys(metrics) : [];
}

export function hasMetricKey(
  metrics: Metrics | null | undefined,
  key: MetricKey,
): boolean {
  return !!metrics && Object.prototype.hasOwnProperty.call(
    metrics,
    String(key),
  );
}

export function sum(
  values: Array<MetricValue>,
): string {
  let result = "0";

  for (const value of values) {
    result = addMetric(result, value);
  }

  return result;
}

export function average(
  values: Array<MetricValue>,
): string {
  return calculateAverage(values);
      }
