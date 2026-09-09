//
// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// METRICS UTILITY
// Version: 2026.09.09
//
// Поддерживает:
// • обычные числа
// • bigint
// • огромные значения в виде строк
// • просмотры
// • реакции
// • комментарии
// • отзывы
// • shares
// • saves
// • applications
// • clicks
// • unique views
// • рейтинги 1–5
// • распределение рейтингов
// • проценты
// • сравнение метрик
//
// ВАЖНО:
// Метрики хранятся как DecimalString.
// Нельзя использовать Number() для больших
// значений, если нужна математическая точность.
// ============================================================

// ============================================================
// BASIC TYPES
// ============================================================

export type MetricValue =
  | number
  | bigint
  | string;

export type DecimalString = string;

// ============================================================
// METRIC KEYS
// ============================================================

export type MetricKey =
  | "views"
  | "unique_views"
  | "likes"
  | "reactions"
  | "comments"
  | "replies"
  | "shares"
  | "saves"
  | "bookmarks"
  | "reviews"
  | "ratings"
  | "applications"
  | "clicks"
  | "contacts"
  | "followers"
  | "mentions"
  | "reports"
  | "impressions"
  | "engagements"
  | "positive_engagements"
  | "negative_engagements";

// ============================================================
// METRICS
// ============================================================

export interface Metrics {
  views?: MetricValue;
  unique_views?: MetricValue;

  likes?: MetricValue;
  reactions?: MetricValue;

  comments?: MetricValue;
  replies?: MetricValue;

  shares?: MetricValue;
  saves?: MetricValue;
  bookmarks?: MetricValue;

  reviews?: MetricValue;
  ratings?: MetricValue;

  applications?: MetricValue;
  clicks?: MetricValue;
  contacts?: MetricValue;

  followers?: MetricValue;
  mentions?: MetricValue;

  reports?: MetricValue;

  impressions?: MetricValue;

  engagements?: MetricValue;
  positive_engagements?: MetricValue;
  negative_engagements?: MetricValue;

  [key: string]:
    | MetricValue
    | undefined;
}

// ============================================================
// NORMALIZED METRICS
// ============================================================

export type NormalizedMetrics =
  Record<
    string,
    DecimalString
  >;

// ============================================================
// METRIC CHANGE
// ============================================================

export interface MetricChange {
  key: MetricKey | string;

  previous: DecimalString;
  current: DecimalString;
  difference: DecimalString;

  percentage: number | null;

  increased: boolean;
  decreased: boolean;
  unchanged: boolean;
}

// ============================================================
// METRICS UPDATE
// ============================================================

export type MetricsUpdate =
  Partial<Metrics>;

// ============================================================
// RATING DISTRIBUTION
// ============================================================

export interface RatingDistribution {
  1: DecimalString;
  2: DecimalString;
  3: DecimalString;
  4: DecimalString;
  5: DecimalString;
}

// ============================================================
// RATING SUMMARY
// ============================================================

export interface RatingSummary {
  average: number;
  total: DecimalString;

  distribution: RatingDistribution;

  oneStar: DecimalString;
  twoStar: DecimalString;
  threeStar: DecimalString;
  fourStar: DecimalString;
  fiveStar: DecimalString;
}

// ============================================================
// CONSTANTS
// ============================================================

const ZERO = "0";

const MAX_SAFE_INTEGER_STRING =
  "9007199254740991";

// ============================================================
// INTERNAL DECIMAL HELPERS
// ============================================================

function cleanDecimal(
  value: MetricValue | null | undefined,
): DecimalString {
  if (
    value === null ||
    value === undefined
  ) {
    return ZERO;
  }

  if (typeof value === "bigint") {
    return value < 0n
      ? "0"
      : value.toString();
  }

  if (typeof value === "number") {
    if (
      !Number.isFinite(value)
    ) {
      return ZERO;
    }

    if (
      value <= 0
    ) {
      return ZERO;
    }

    if (
      Number.isInteger(value) &&
      Number.isSafeInteger(value)
    ) {
      return String(value);
    }

    /*
     * Для нецелых чисел метрики
     * должны всё равно становиться
     * целыми счётчиками.
     */
    return String(
      Math.max(
        0,
        Math.trunc(value),
      ),
    );
  }

  const text =
    value.trim();

  if (!text) {
    return ZERO;
  }

  /*
   * Поддерживаем только
   * положительные целые DecimalString.
   */
  if (
    !/^\d+$/.test(text)
  ) {
    return ZERO;
  }

  const normalized =
    text.replace(
      /^0+(?=\d)/,
      "",
    );

  return normalized || ZERO;
}

// ============================================================
// BIGINT CONVERSION
// ============================================================

function toBigInt(
  value: MetricValue | null | undefined,
): bigint {
  const normalized =
    cleanDecimal(value);

  try {
    return BigInt(
      normalized,
    );
  } catch {
    return 0n;
  }
}

function fromBigInt(
  value: bigint,
): DecimalString {
  if (value <= 0n) {
    return ZERO;
  }

  return value.toString();
}

// ============================================================
// NORMALIZE
// ============================================================

export function normalizeMetricValue(
  value: MetricValue | null | undefined,
): DecimalString {
  return cleanDecimal(
    value,
  );
}

// ============================================================
// NORMALIZE METRICS
// ============================================================

export function normalizeMetrics(
  metrics:
    | Metrics
    | null
    | undefined,
): NormalizedMetrics {
  const result:
    NormalizedMetrics = {};

  if (!metrics) {
    return result;
  }

  for (
    const [key, value]
    of Object.entries(metrics)
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    result[key] =
      normalizeMetricValue(
        value,
      );
  }

  return result;
}

// ============================================================
// GET METRIC
// ============================================================

export function getMetric(
  metrics:
    | Metrics
    | NormalizedMetrics
    | null
    | undefined,
  key:
    | MetricKey
    | string,
): DecimalString {
  if (!metrics) {
    return ZERO;
  }

  return normalizeMetricValue(
    metrics[key],
  );
}

// ============================================================
// SET METRIC
// ============================================================

export function setMetric(
  metrics:
    | Metrics
    | NormalizedMetrics,
  key:
    | MetricKey
    | string,
  value: MetricValue,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  result[key] =
    normalizeMetricValue(
      value,
    );

  return result;
}

// ============================================================
// ADD METRIC
// ============================================================

export function addMetric(
  a: MetricValue,
  b: MetricValue,
): DecimalString {
  return fromBigInt(
    toBigInt(a) +
      toBigInt(b),
  );
}

// ============================================================
// SUBTRACT METRIC
// ============================================================

export function subtractMetric(
  a: MetricValue,
  b: MetricValue,
): DecimalString {
  const result =
    toBigInt(a) -
    toBigInt(b);

  return fromBigInt(
    result,
  );
}

// ============================================================
// COMPARE
// ============================================================

export function compareMetricValues(
  a: MetricValue,
  b: MetricValue,
): -1 | 0 | 1 {
  const left =
    toBigInt(a);

  const right =
    toBigInt(b);

  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

// ============================================================
// COMPATIBILITY ALIAS
// ============================================================

export function compareDecimalStrings(
  a: MetricValue,
  b: MetricValue,
): -1 | 0 | 1 {
  return compareMetricValues(
    a,
    b,
  );
}

// ============================================================
// INCREMENT
// ============================================================

export function incrementMetric(
  metrics:
    | Metrics
    | NormalizedMetrics,
  key:
    | MetricKey
    | string,
  amount: MetricValue = 1,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  result[key] =
    addMetric(
      result[key] ?? ZERO,
      amount,
    );

  return result;
}

// ============================================================
// DECREMENT
// ============================================================

export function decrementMetric(
  metrics:
    | Metrics
    | NormalizedMetrics,
  key:
    | MetricKey
    | string,
  amount: MetricValue = 1,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  result[key] =
    subtractMetric(
      result[key] ?? ZERO,
      amount,
    );

  return result;
}

// ============================================================
// APPLY CHANGES
// ============================================================

export function applyMetricChanges(
  metrics:
    | Metrics
    | NormalizedMetrics,
  changes:
    | MetricsUpdate
    | null
    | undefined,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  if (!changes) {
    return result;
  }

  for (
    const [key, value]
    of Object.entries(changes)
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    result[key] =
      normalizeMetricValue(
        value,
      );
  }

  return result;
}

// ============================================================
// INCREMENT MANY
// ============================================================

export function incrementMetrics(
  metrics:
    | Metrics
    | NormalizedMetrics,
  changes:
    | MetricsUpdate
    | null
    | undefined,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  if (!changes) {
    return result;
  }

  for (
    const [key, value]
    of Object.entries(changes)
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    result[key] =
      addMetric(
        result[key] ?? ZERO,
        value,
      );
  }

  return result;
}

// ============================================================
// DECREMENT MANY
// ============================================================

export function decrementMetrics(
  metrics:
    | Metrics
    | NormalizedMetrics,
  changes:
    | MetricsUpdate
    | null
    | undefined,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  if (!changes) {
    return result;
  }

  for (
    const [key, value]
    of Object.entries(changes)
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    result[key] =
      subtractMetric(
        result[key] ?? ZERO,
        value,
      );
  }

  return result;
}

// ============================================================
// MERGE
// ============================================================

export function mergeMetrics(
  ...items: Array<
    | Metrics
    | NormalizedMetrics
    | null
    | undefined
  >
): NormalizedMetrics {
  const result:
    NormalizedMetrics = {};

  for (
    const item of items
  ) {
    if (!item) {
      continue;
    }

    for (
      const [key, value]
      of Object.entries(item)
    ) {
      if (
        value === undefined
      ) {
        continue;
      }

      result[key] =
        normalizeMetricValue(
          value,
        );
    }
  }

  return result;
}

// ============================================================
// SUM
// ============================================================

export function sumMetrics(
  metrics:
    | Metrics
    | NormalizedMetrics
    | null
    | undefined,
): DecimalString {
  if (!metrics) {
    return ZERO;
  }

  let total = 0n;

  for (
    const value
    of Object.values(metrics)
  ) {
    total += toBigInt(
      value,
    );
  }

  return fromBigInt(
    total,
  );
}

// Compatibility
export function totalMetrics(
  metrics:
    | Metrics
    | NormalizedMetrics
    | null
    | undefined,
): DecimalString {
  return sumMetrics(
    metrics,
  );
}

// ============================================================
// ENGAGEMENT COUNT
// ============================================================

export function engagementCount(
  metrics:
    | Metrics
    | NormalizedMetrics
    | null
    | undefined,
): DecimalString {
  if (!metrics) {
    return ZERO;
  }

  const keys: MetricKey[] = [
    "likes",
    "reactions",
    "comments",
    "replies",
    "shares",
    "saves",
    "bookmarks",
    "reviews",
    "applications",
    "clicks",
  ];

  let total = 0n;

  for (
    const key of keys
  ) {
    total += toBigInt(
      metrics[key],
    );
  }

  return fromBigInt(
    total,
  );
}

// ============================================================
// RATIO
// ============================================================

export function ratio(
  numerator: MetricValue,
  denominator: MetricValue,
): number {
  const top =
    toBigInt(
      numerator,
    );

  const bottom =
    toBigInt(
      denominator,
    );

  if (
    bottom === 0n
  ) {
    return 0;
  }

  /*
   * Для процента/коэффициента
   * Number используется только
   * после ограничения результата.
   *
   * Сами счётчики остаются
   * BigInt/строками.
   */
  const topString =
    top.toString();

  const bottomString =
    bottom.toString();

  const topNumber =
    topString.length >
    MAX_SAFE_INTEGER_STRING.length
      ? Number.MAX_VALUE
      : Number(topString);

  const bottomNumber =
    bottomString.length >
    MAX_SAFE_INTEGER_STRING.length
      ? Number.MAX_VALUE
      : Number(bottomString);

  if (
    !Number.isFinite(
      topNumber,
    ) ||
    !Number.isFinite(
      bottomNumber,
    ) ||
    bottomNumber === 0
  ) {
    /*
     * Для одинаково огромных
     * значений возвращаем 1.
     */
    if (
      top === bottom
    ) {
      return 1;
    }

    return top > bottom
      ? 1
      : 0;
  }

  return (
    topNumber /
    bottomNumber
  );
}

// ============================================================
// PERCENTAGE
// ============================================================

export function percentage(
  numerator: MetricValue,
  denominator: MetricValue,
  decimals = 2,
): number {
  const value =
    ratio(
      numerator,
      denominator,
    ) * 100;

  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  const factor =
    Math.pow(
      10,
      Math.max(
        0,
        Math.min(
          12,
          decimals,
        ),
      ),
    );

  return (
    Math.round(
      value * factor,
    ) / factor
  );
}

// ============================================================
// RATE HELPERS
// ============================================================

export function interactionRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    engagementCount(
      metrics,
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function reactionRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "reactions",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function commentRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "comments",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function reviewRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "reviews",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function shareRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "shares",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function applicationRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "applications",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function clickRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "clicks",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

export function uniqueViewRate(
  metrics:
    | Metrics
    | NormalizedMetrics,
): number {
  return percentage(
    getMetric(
      metrics,
      "unique_views",
    ),
    getMetric(
      metrics,
      "views",
    ),
  );
}

// ============================================================
// DIFFERENCE
// ============================================================

export function metricDifference(
  current: MetricValue,
  previous: MetricValue,
): DecimalString {
  const currentValue =
    toBigInt(
      current,
    );

  const previousValue =
    toBigInt(
      previous,
    );

  return fromBigInt(
    currentValue -
      previousValue,
  );
}

// ============================================================
// PERCENT CHANGE
// ============================================================

export function metricPercentageChange(
  current: MetricValue,
  previous: MetricValue,
): number {
  const previousValue =
    toBigInt(
      previous,
    );

  if (
    previousValue === 0n
  ) {
    return 0;
  }

  return percentage(
    metricDifference(
      current,
      previous,
    ),
    previousValue,
  );
}

// ============================================================
// METRIC SHARE
// ============================================================

export function metricShare(
  value: MetricValue,
  total: MetricValue,
): number {
  return percentage(
    value,
    total,
  );
}

// ============================================================
// FORMAT
// ============================================================

export function metricToString(
  value: MetricValue,
): DecimalString {
  return normalizeMetricValue(
    value,
  );
}

// ============================================================
// HUMAN FORMAT
// ============================================================

export function formatMetric(
  value: MetricValue,
): string {
  const normalized =
    normalizeMetricValue(
      value,
    );

  const length =
    normalized.length;

  if (
    length <= 3
  ) {
    return normalized;
  }

  if (
    length <= 6
  ) {
    return (
      normalized.slice(
        0,
        -3,
      ) +
      "K"
    );
  }

  if (
    length <= 9
  ) {
    return (
      normalized.slice(
        0,
        -6,
      ) +
      "M"
    );
  }

  if (
    length <= 12
  ) {
    return (
      normalized.slice(
        0,
        -9,
      ) +
      "B"
    );
  }

  if (
    length <= 15
  ) {
    return (
      normalized.slice(
        0,
        -12,
      ) +
      "T"
    );
  }

  /*
   * Для очень больших значений
   * показываем точное число,
   * чтобы администратор мог увидеть
   * реальное значение.
   */
  return normalized;
}

// ============================================================
// FORMAT PERCENT
// ============================================================

export function formatMetricPercent(
  value: number,
  decimals = 2,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return "0%";
  }

  const factor =
    Math.pow(
      10,
      Math.max(
        0,
        Math.min(
          12,
          decimals,
        ),
      ),
    );

  const rounded =
    Math.round(
      value * factor,
    ) / factor;

  return `${rounded}%`;
}

// ============================================================
// RATING DISTRIBUTION
// ============================================================

export function createEmptyRatingDistribution():
  RatingDistribution {
  return {
    1: ZERO,
    2: ZERO,
    3: ZERO,
    4: ZERO,
    5: ZERO,
  };
}

// ============================================================
// CALCULATE RATING AVERAGE
// ============================================================

export function calculateAverage(
  values:
    | MetricValue[]
    | null
    | undefined,
): number {
  if (
    !values ||
    values.length === 0
  ) {
    return 0;
  }

  let total = 0;
  let count = 0;

  for (
    const value of values
  ) {
    const numeric =
      Number(
        normalizeMetricValue(
          value,
        ),
      );

    if (
      !Number.isFinite(
        numeric,
      )
    ) {
      continue;
    }

    total += numeric;
    count++;
  }

  if (
    count === 0
  ) {
    return 0;
  }

  return total / count;
}

// Compatibility
export function average(
  values:
    | MetricValue[]
    | null
    | undefined,
): number {
  return calculateAverage(
    values,
  );
}

// ============================================================
// RATING SUMMARY
// ============================================================

export function calculateRatingSummary(
  distribution:
    | Partial<RatingDistribution>
    | null
    | undefined,
): RatingSummary {
  const result =
    createEmptyRatingDistribution();

  if (distribution) {
    for (
      const key of [
        1,
        2,
        3,
        4,
        5,
      ] as const
    ) {
      result[key] =
        normalizeMetricValue(
          distribution[key],
        );
    }
  }

  let total = 0n;
  let weighted = 0n;

  for (
    const rating of [
      1,
      2,
      3,
      4,
      5,
    ] as const
  ) {
    const count =
      toBigInt(
        result[rating],
      );

    total += count;

    weighted +=
      count *
      BigInt(
        rating,
      );
  }

  let averageValue = 0;

  if (
    total > 0n
  ) {
    /*
     * Для среднего рейтинга
     * точность до 2 знаков.
     */
    const weightedNumber =
      Number(
        weighted.toString(),
      );

    const totalNumber =
      Number(
        total.toString(),
      );

    if (
      Number.isFinite(
        weightedNumber,
      ) &&
      Number.isFinite(
        totalNumber,
      ) &&
      totalNumber !== 0
    ) {
      averageValue =
        Math.round(
          (
            weightedNumber /
            totalNumber
          ) *
            100,
        ) / 100;
    }
  }

  return {
    average:
      averageValue,

    total:
      fromBigInt(
        total,
      ),

    distribution:
      result,

    oneStar:
      result[1],

    twoStar:
      result[2],

    threeStar:
      result[3],

    fourStar:
      result[4],

    fiveStar:
      result[5],
  };
}

// ============================================================
// RATING FROM VALUES
// ============================================================

export function ratingSummaryFromValues(
  ratings:
    | MetricValue[]
    | null
    | undefined,
): RatingSummary {
  const distribution =
    createEmptyRatingDistribution();

  if (!ratings) {
    return calculateRatingSummary(
      distribution,
    );
  }

  for (
    const value of ratings
  ) {
    const numeric =
      Number(
        normalizeMetricValue(
          value,
        ),
      );

    if (
      !Number.isInteger(
        numeric,
      )
    ) {
      continue;
    }

    if (
      numeric < 1 ||
      numeric > 5
    ) {
      continue;
    }

    const rating =
      numeric as
        | 1
        | 2
        | 3
        | 4
        | 5;

    distribution[rating] =
      addMetric(
        distribution[rating],
        1,
      );
  }

  return calculateRatingSummary(
    distribution,
  );
}

// ============================================================
// COMPARE METRICS
// ============================================================

export function compareMetrics(
  current:
    | Metrics
    | NormalizedMetrics,
  previous:
    | Metrics
    | NormalizedMetrics,
): MetricChange[] {
  const keys =
    new Set<string>([
      ...Object.keys(
        current ?? {},
      ),
      ...Object.keys(
        previous ?? {},
      ),
    ]);

  const result:
    MetricChange[] = [];

  for (
    const key of keys
  ) {
    const currentValue =
      getMetric(
        current,
        key,
      );

    const previousValue =
      getMetric(
        previous,
        key,
      );

    const comparison =
      compareMetricValues(
        currentValue,
        previousValue,
      );

    result.push({
      key,

      previous:
        previousValue,

      current:
        currentValue,

      difference:
        metricDifference(
          currentValue,
          previousValue,
        ),

      percentage:
        metricPercentageChange(
          currentValue,
          previousValue,
        ),

      increased:
        comparison > 0,

      decreased:
        comparison < 0,

      unchanged:
        comparison === 0,
    });
  }

  return result;
}

// ============================================================
// ZERO / POSITIVE / NEGATIVE
// ============================================================

export function isZeroMetric(
  value: MetricValue,
): boolean {
  return (
    toBigInt(
      value,
    ) === 0n
  );
}

export function isPositiveMetric(
  value: MetricValue,
): boolean {
  return (
    toBigInt(
      value,
    ) > 0n
  );
}

export function isNegativeMetric(
  value: MetricValue,
): boolean {
  /*
   * Метрики системы не должны
   * быть отрицательными.
   *
   * Поэтому функция сохранена
   * для совместимости и всегда
   * возвращает false.
   */
  return false;
}

// ============================================================
// KEYS
// ============================================================

export function metricKeys(
  metrics:
    | Metrics
    | NormalizedMetrics
    | null
    | undefined,
): string[] {
  if (!metrics) {
    return [];
  }

  return Object.keys(
    metrics,
  );
}

// ============================================================
// HAS KEY
// ============================================================

export function hasMetricKey(
  metrics:
    | Metrics
    | NormalizedMetrics
    | null
    | undefined,
  key:
    | MetricKey
    | string,
): boolean {
  if (!metrics) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(
    metrics,
    key,
  );
}

// ============================================================
// SUM VALUES
// ============================================================

export function sum(
  values:
    | MetricValue[]
    | null
    | undefined,
): DecimalString {
  if (
    !values ||
    values.length === 0
  ) {
    return ZERO;
  }

  let total = 0n;

  for (
    const value of values
  ) {
    total += toBigInt(
      value,
    );
  }

  return fromBigInt(
    total,
  );
}

// ============================================================
// DEFAULT METRICS
// ============================================================

export function createEmptyMetrics():
  NormalizedMetrics {
  return {
    views: ZERO,
    unique_views: ZERO,

    likes: ZERO,
    reactions: ZERO,

    comments: ZERO,
    replies: ZERO,

    shares: ZERO,
    saves: ZERO,
    bookmarks: ZERO,

    reviews: ZERO,
    ratings: ZERO,

    applications: ZERO,
    clicks: ZERO,
    contacts: ZERO,

    followers: ZERO,
    mentions: ZERO,

    reports: ZERO,
    impressions: ZERO,

    engagements: ZERO,
    positive_engagements: ZERO,
    negative_engagements: ZERO,
  };
}

// ============================================================
// UPDATE ENGAGEMENTS
// ============================================================

export function recalculateEngagements(
  metrics:
    | Metrics
    | NormalizedMetrics,
): NormalizedMetrics {
  const result =
    normalizeMetrics(
      metrics,
    );

  const engagement =
    engagementCount(
      result,
    );

  result.engagements =
    engagement;

  return result;
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  normalizeMetricValue,
  normalizeMetrics,

  getMetric,
  setMetric,

  addMetric,
  subtractMetric,

  compareMetricValues,
  compareDecimalStrings,

  incrementMetric,
  decrementMetric,

  applyMetricChanges,
  incrementMetrics,
  decrementMetrics,

  mergeMetrics,
  sumMetrics,
  totalMetrics,

  engagementCount,

  ratio,
  percentage,

  interactionRate,
  reactionRate,
  commentRate,
  reviewRate,
  shareRate,
  applicationRate,
  clickRate,
  uniqueViewRate,

  metricDifference,
  metricPercentageChange,
  metricShare,

  metricToString,
  formatMetric,
  formatMetricPercent,

  createEmptyRatingDistribution,
  calculateAverage,
  average,

  calculateRatingSummary,
  ratingSummaryFromValues,

  compareMetrics,

  isZeroMetric,
  isPositiveMetric,
  isNegativeMetric,

  metricKeys,
  hasMetricKey,

  sum,

  createEmptyMetrics,
  recalculateEngagements,
};
