// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// REVIEW UTILITIES
// Version: 2026.09.09 POWER PRODUCTION
// ============================================================

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewStatus =
  | "draft"
  | "pending"
  | "published"
  | "hidden"
  | "rejected"
  | "deleted"
  | "archived";

export type ReviewVisibility =
  | "public"
  | "private"
  | "admin_only";

export type ReviewAuthorMode =
  | "registered"
  | "anonymous"
  | "admin_acting";

export type ReviewTargetType =
  | "publication"
  | "participant"
  | "company"
  | "service"
  | "opportunity"
  | "custom";

export interface ReviewValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ReviewRatingDistribution {
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
}

export interface ReviewCounterSet {
  reviews: string;
  replies: string;
  reactions: string;
  views: string;
  shares: string;
  reports: string;
  helpful: string;
}

export interface ReviewRatingSummary {
  average: string;
  total: string;
  distribution: ReviewRatingDistribution;
}

// ============================================================
// CONSTANTS
// ============================================================

export const REVIEW_MIN_RATING = 1;
export const REVIEW_MAX_RATING = 5;

export const REVIEW_DEFAULT_MAX_TEXT_LENGTH = 10000;
export const REVIEW_DEFAULT_MAX_TITLE_LENGTH = 300;

export const REVIEW_STATUSES: readonly ReviewStatus[] = [
  "draft",
  "pending",
  "published",
  "hidden",
  "rejected",
  "deleted",
  "archived",
];

export const REVIEW_VISIBILITIES: readonly ReviewVisibility[] = [
  "public",
  "private",
  "admin_only",
];

export const REVIEW_AUTHOR_MODES: readonly ReviewAuthorMode[] = [
  "registered",
  "anonymous",
  "admin_acting",
];

export const REVIEW_TARGET_TYPES: readonly ReviewTargetType[] = [
  "publication",
  "participant",
  "company",
  "service",
  "opportunity",
  "custom",
];

export const REVIEW_RATINGS: readonly ReviewRating[] = [
  1,
  2,
  3,
  4,
  5,
];

// ============================================================
// STATUS HELPERS
// ============================================================

export function isReviewStatus(
  value: unknown
): value is ReviewStatus {
  return (
    typeof value === "string" &&
    REVIEW_STATUSES.includes(
      value as ReviewStatus
    )
  );
}

export function isReviewVisibility(
  value: unknown
): value is ReviewVisibility {
  return (
    typeof value === "string" &&
    REVIEW_VISIBILITIES.includes(
      value as ReviewVisibility
    )
  );
}

export function isReviewAuthorMode(
  value: unknown
): value is ReviewAuthorMode {
  return (
    typeof value === "string" &&
    REVIEW_AUTHOR_MODES.includes(
      value as ReviewAuthorMode
    )
  );
}

export function isReviewTargetType(
  value: unknown
): value is ReviewTargetType {
  return (
    typeof value === "string" &&
    REVIEW_TARGET_TYPES.includes(
      value as ReviewTargetType
    )
  );
}

// ============================================================
// RATING HELPERS
// ============================================================

export function isReviewRating(
  value: unknown
): value is ReviewRating {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value)
  ) {
    return false;
  }

  return (
    value >= REVIEW_MIN_RATING &&
    value <= REVIEW_MAX_RATING
  );
}

export function normalizeReviewRating(
  value: unknown
): ReviewRating | null {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isInteger(number)) {
    return null;
  }

  if (
    number < REVIEW_MIN_RATING ||
    number > REVIEW_MAX_RATING
  ) {
    return null;
  }

  return number as ReviewRating;
}

export function requireReviewRating(
  value: unknown
): ReviewRating {
  const rating =
    normalizeReviewRating(value);

  if (rating === null) {
    throw new Error(
      "Review rating must be an integer from 1 to 5"
    );
  }

  return rating;
}

// ============================================================
// TEXT NORMALIZATION
// ============================================================

function removeControlCharacters(
  value: string
): string {
  return value.replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    ""
  );
}

export function normalizeReviewTitle(
  value: unknown,
  maxLength = REVIEW_DEFAULT_MAX_TITLE_LENGTH
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return removeControlCharacters(
    value
  )
    .trim()
    .slice(
      0,
      Math.max(1, maxLength)
    );
}

export function normalizeReviewText(
  value: unknown,
  maxLength = REVIEW_DEFAULT_MAX_TEXT_LENGTH
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return removeControlCharacters(
    value
  )
    .trim()
    .slice(
      0,
      Math.max(1, maxLength)
    );
}

export function hasReviewText(
  value: unknown
): boolean {
  return (
    typeof value === "string" &&
    removeControlCharacters(value).trim()
      .length > 0
  );
}

// ============================================================
// ID HELPERS
// ============================================================

export function normalizeReviewId(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const id =
    value.trim();

  if (
    !id ||
    id.length > 200 ||
    /[\u0000-\u001F\u007F]/.test(id)
  ) {
    return null;
  }

  return id;
}

export function normalizeReviewTargetId(
  value: unknown
): string | null {
  return normalizeReviewId(
    value
  );
}

// ============================================================
// COUNTER / DECIMAL STRING HELPERS
// ============================================================

export function normalizeDecimalString(
  value: unknown
): string {
  if (
    typeof value === "bigint"
  ) {
    return value.toString();
  }

  if (
    typeof value === "number"
  ) {
    if (
      !Number.isFinite(value) ||
      !Number.isInteger(value)
    ) {
      throw new Error(
        "Invalid decimal value"
      );
    }

    return String(value);
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value.trim();

    if (
      !/^\d+$/.test(
        normalized
      )
    ) {
      throw new Error(
        "Invalid decimal string"
      );
    }

    return normalized;
  }

  throw new Error(
    "Invalid decimal value"
  );
}

export function decimalAdd(
  a: unknown,
  b: unknown
): string {
  const left =
    BigInt(
      normalizeDecimalString(a)
    );

  const right =
    BigInt(
      normalizeDecimalString(b)
    );

  return (
    left + right
  ).toString();
}

export function decimalSubtract(
  a: unknown,
  b: unknown
): string {
  const left =
    BigInt(
      normalizeDecimalString(a)
    );

  const right =
    BigInt(
      normalizeDecimalString(b)
    );

  if (right > left) {
    return "0";
  }

  return (
    left - right
  ).toString();
}

export function decimalCompare(
  a: unknown,
  b: unknown
): number {
  const left =
    BigInt(
      normalizeDecimalString(a)
    );

  const right =
    BigInt(
      normalizeDecimalString(b)
    );

  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

export function decimalMax(
  a: unknown,
  b: unknown
): string {
  return decimalCompare(a, b) >= 0
    ? normalizeDecimalString(a)
    : normalizeDecimalString(b);
}

export function decimalMin(
  a: unknown,
  b: unknown
): string {
  return decimalCompare(a, b) <= 0
    ? normalizeDecimalString(a)
    : normalizeDecimalString(b);
}

// ============================================================
// COUNTERS
// ============================================================

export function createEmptyReviewCounters():
  ReviewCounterSet {
  return {
    reviews: "0",
    replies: "0",
    reactions: "0",
    views: "0",
    shares: "0",
    reports: "0",
    helpful: "0",
  };
}

export function normalizeReviewCounters(
  input?: Partial<ReviewCounterSet> | null
): ReviewCounterSet {
  return {
    reviews:
      normalizeDecimalString(
        input?.reviews ?? "0"
      ),

    replies:
      normalizeDecimalString(
        input?.replies ?? "0"
      ),

    reactions:
      normalizeDecimalString(
        input?.reactions ?? "0"
      ),

    views:
      normalizeDecimalString(
        input?.views ?? "0"
      ),

    shares:
      normalizeDecimalString(
        input?.shares ?? "0"
      ),

    reports:
      normalizeDecimalString(
        input?.reports ?? "0"
      ),

    helpful:
      normalizeDecimalString(
        input?.helpful ?? "0"
      ),
  };
}

export function incrementReviewCounter(
  value: unknown,
  amount: unknown = "1"
): string {
  return decimalAdd(
    value,
    amount
  );
}

export function decrementReviewCounter(
  value: unknown,
  amount: unknown = "1"
): string {
  return decimalSubtract(
    value,
    amount
  );
}

// ============================================================
// DISTRIBUTION
// ============================================================

export function createEmptyRatingDistribution():
  ReviewRatingDistribution {
  return {
    rating1: "0",
    rating2: "0",
    rating3: "0",
    rating4: "0",
    rating5: "0",
  };
}

export function normalizeRatingDistribution(
  input?: Partial<ReviewRatingDistribution> | null
): ReviewRatingDistribution {
  return {
    rating1:
      normalizeDecimalString(
        input?.rating1 ?? "0"
      ),

    rating2:
      normalizeDecimalString(
        input?.rating2 ?? "0"
      ),

    rating3:
      normalizeDecimalString(
        input?.rating3 ?? "0"
      ),

    rating4:
      normalizeDecimalString(
        input?.rating4 ?? "0"
      ),

    rating5:
      normalizeDecimalString(
        input?.rating5 ?? "0"
      ),
  };
}

export function getRatingDistributionKey(
  rating: ReviewRating
): keyof ReviewRatingDistribution {
  return `rating${rating}` as keyof ReviewRatingDistribution;
}

export function incrementRatingDistribution(
  distribution:
    Partial<ReviewRatingDistribution> | null | undefined,
  rating: ReviewRating,
  amount: unknown = "1"
): ReviewRatingDistribution {
  const normalized =
    normalizeRatingDistribution(
      distribution
    );

  const key =
    getRatingDistributionKey(
      rating
    );

  normalized[key] =
    decimalAdd(
      normalized[key],
      amount
    );

  return normalized;
}

export function decrementRatingDistribution(
  distribution:
    Partial<ReviewRatingDistribution> | null | undefined,
  rating: ReviewRating,
  amount: unknown = "1"
): ReviewRatingDistribution {
  const normalized =
    normalizeRatingDistribution(
      distribution
    );

  const key =
    getRatingDistributionKey(
      rating
    );

  normalized[key] =
    decimalSubtract(
      normalized[key],
      amount
    );

  return normalized;
}

// ============================================================
// RATING SUMMARY
// ============================================================

export function calculateRatingTotal(
  distribution:
    Partial<ReviewRatingDistribution> | null | undefined
): string {
  const normalized =
    normalizeRatingDistribution(
      distribution
    );

  let total =
    BigInt(0);

  for (
    let rating = 1;
    rating <= 5;
    rating++
  ) {
    const key =
      `rating${rating}` as keyof ReviewRatingDistribution;

    total +=
      BigInt(
        normalized[key]
      );
  }

  return total.toString();
}

/**
 * Возвращает среднее значение рейтинга.
 *
 * Для больших значений расчёт выполняется через BigInt.
 * Результат форматируется как decimal string.
 */
export function calculateRatingAverage(
  distribution:
    Partial<ReviewRatingDistribution> | null | undefined,
  precision = 2
): string {
  const normalized =
    normalizeRatingDistribution(
      distribution
    );

  let weighted =
    BigInt(0);

  let total =
    BigInt(0);

  for (
    let rating = 1;
    rating <= 5;
    rating++
  ) {
    const key =
      `rating${rating}` as keyof ReviewRatingDistribution;

    const count =
      BigInt(
        normalized[key]
      );

    weighted +=
      BigInt(rating) *
      count;

    total += count;
  }

  if (
    total === BigInt(0)
  ) {
    return "0";
  }

  const safePrecision =
    Math.min(
      6,
      Math.max(
        0,
        Math.floor(precision)
      )
    );

  const scale =
    BigInt(
      10 ** safePrecision
    );

  const scaled =
    (weighted * scale) /
    total;

  const integerPart =
    scaled / scale;

  const fraction =
    scaled % scale;

  if (
    safePrecision === 0
  ) {
    return integerPart.toString();
  }

  return (
    `${integerPart.toString()}.` +
    fraction
      .toString()
      .padStart(
        safePrecision,
        "0"
      )
  );
}

export function createRatingSummary(
  distribution:
    Partial<ReviewRatingDistribution> | null | undefined
): ReviewRatingSummary {
  const normalized =
    normalizeRatingDistribution(
      distribution
    );

  return {
    average:
      calculateRatingAverage(
        normalized,
        2
      ),

    total:
      calculateRatingTotal(
        normalized
      ),

    distribution:
      normalized,
  };
}

// ============================================================
// REVIEW VALIDATION
// ============================================================

export interface ReviewInput {
  targetType?: unknown;
  targetId?: unknown;
  authorId?: unknown;
  authorMode?: unknown;
  title?: unknown;
  text?: unknown;
  rating?: unknown;
  status?: unknown;
  visibility?: unknown;
}

export function validateReviewInput(
  input: ReviewInput
): ReviewValidationResult {
  const errors: string[] = [];

  if (
    !isReviewTargetType(
      input.targetType
    )
  ) {
    errors.push(
      "Invalid review target type"
    );
  }

  if (
    !normalizeReviewTargetId(
      input.targetId
    )
  ) {
    errors.push(
      "Review target ID is required"
    );
  }

  if (
    !isReviewAuthorMode(
      input.authorMode
    )
  ) {
    errors.push(
      "Invalid review author mode"
    );
  }

  if (
    input.authorMode !== "anonymous" &&
    !normalizeReviewId(
      input.authorId
    )
  ) {
    errors.push(
      "Author ID is required"
    );
  }

  if (
    input.title !== undefined &&
    input.title !== null &&
    typeof input.title !== "string"
  ) {
    errors.push(
      "Review title must be a string"
    );
  }

  if (
    input.text === undefined ||
    input.text === null ||
    !hasReviewText(
      input.text
    )
  ) {
    errors.push(
      "Review text is required"
    );
  }

  if (
    !isReviewRating(
      normalizeReviewRating(
        input.rating
      )
    )
  ) {
    errors.push(
      "Review rating must be from 1 to 5"
    );
  }

  if (
    input.status !== undefined &&
    !isReviewStatus(
      input.status
    )
  ) {
    errors.push(
      "Invalid review status"
    );
  }

  if (
    input.visibility !== undefined &&
    !isReviewVisibility(
      input.visibility
    )
  ) {
    errors.push(
      "Invalid review visibility"
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
}

// ============================================================
// STATUS TRANSITIONS
// ============================================================

const REVIEW_STATUS_TRANSITIONS:
  Record<
    ReviewStatus,
    readonly ReviewStatus[]
  > = {
    draft: [
      "draft",
      "pending",
      "deleted",
    ],

    pending: [
      "pending",
      "published",
      "rejected",
      "hidden",
      "deleted",
    ],

    published: [
      "published",
      "hidden",
      "deleted",
      "archived",
    ],

    hidden: [
      "hidden",
      "published",
      "deleted",
      "archived",
    ],

    rejected: [
      "rejected",
      "pending",
      "deleted",
    ],

    deleted: [
      "deleted",
      "archived",
    ],

    archived: [
      "archived",
    ],
  };

export function canTransitionReviewStatus(
  from: ReviewStatus,
  to: ReviewStatus
): boolean {
  return (
    REVIEW_STATUS_TRANSITIONS[from]?.includes(
      to
    ) ?? false
  );
}

export function assertReviewStatusTransition(
  from: ReviewStatus,
  to: ReviewStatus
): void {
  if (
    !canTransitionReviewStatus(
      from,
      to
    )
  ) {
    throw new Error(
      `Invalid review status transition: ${from} -> ${to}`
    );
  }
}

// ============================================================
// PUBLIC VISIBILITY
// ============================================================

export function isReviewPublic(
  status: ReviewStatus,
  visibility: ReviewVisibility
): boolean {
  return (
    status === "published" &&
    visibility === "public"
  );
}

export function canDisplayReview(
  status: ReviewStatus,
  visibility: ReviewVisibility,
  includeHidden = false
): boolean {
  if (
    status === "deleted"
  ) {
    return false;
  }

  if (
    status === "published" &&
    visibility === "public"
  ) {
    return true;
  }

  return includeHidden;
}

// ============================================================
// REVIEW NORMALIZATION
// ============================================================

export interface NormalizedReviewInput {
  targetType: ReviewTargetType;
  targetId: string;
  authorId: string | null;
  authorMode: ReviewAuthorMode;
  title: string;
  text: string;
  rating: ReviewRating;
  status: ReviewStatus;
  visibility: ReviewVisibility;
}

export function normalizeReviewInput(
  input: ReviewInput
): NormalizedReviewInput {
  const validation =
    validateReviewInput(
      input
    );

  if (
    !validation.valid
  ) {
    throw new Error(
      validation.errors.join(
        "; "
      )
    );
  }

  const targetType =
    input.targetType as ReviewTargetType;

  const targetId =
    normalizeReviewTargetId(
      input.targetId
    );

  const authorMode =
    input.authorMode as ReviewAuthorMode;

  const authorId =
    normalizeReviewId(
      input.authorId
    );

  const rating =
    normalizeReviewRating(
      input.rating
    );

  const status =
    isReviewStatus(
      input.status
    )
      ? input.status
      : "pending";

  const visibility =
    isReviewVisibility(
      input.visibility
    )
      ? input.visibility
      : "public";

  if (
    !targetId ||
    !rating
  ) {
    throw new Error(
      "Unable to normalize review"
    );
  }

  return {
    targetType,
    targetId,
    authorId:
      authorMode === "anonymous"
        ? null
        : authorId,
    authorMode,
    title:
      normalizeReviewTitle(
        input.title
      ),
    text:
      normalizeReviewText(
        input.text
      ),
    rating,
    status,
    visibility,
  };
}

// ============================================================
// EDITABLE FIELDS
// ============================================================

export const REVIEW_EDITABLE_FIELDS = [
  "title",
  "text",
  "rating",
  "status",
  "visibility",
  "verified",
  "featured",
  "pinned",
  "locked",
] as const;

export type ReviewEditableField =
  typeof REVIEW_EDITABLE_FIELDS[number];

export function isReviewEditableField(
  value: unknown
): value is ReviewEditableField {
  return (
    typeof value === "string" &&
    REVIEW_EDITABLE_FIELDS.includes(
      value as ReviewEditableField
    )
  );
}

// ============================================================
// SORT HELPERS
// ============================================================

export type ReviewSort =
  | "newest"
  | "oldest"
  | "highest_rating"
  | "lowest_rating"
  | "most_helpful"
  | "most_reactions"
  | "most_views"
  | "most_shares";

export const REVIEW_SORTS: readonly ReviewSort[] = [
  "newest",
  "oldest",
  "highest_rating",
  "lowest_rating",
  "most_helpful",
  "most_reactions",
  "most_views",
  "most_shares",
];

export function isReviewSort(
  value: unknown
): value is ReviewSort {
  return (
    typeof value === "string" &&
    REVIEW_SORTS.includes(
      value as ReviewSort
    )
  );
}

// ============================================================
// REVIEW FLAGS
// ============================================================

export interface ReviewFlags {
  verified: boolean;
  featured: boolean;
  pinned: boolean;
  locked: boolean;
}

export const DEFAULT_REVIEW_FLAGS:
  ReviewFlags = {
    verified: false,
    featured: false,
    pinned: false,
    locked: false,
};

export function normalizeReviewFlags(
  input?: Partial<ReviewFlags> | null
): ReviewFlags {
  return {
    verified:
      Boolean(
        input?.verified
      ),

    featured:
      Boolean(
        input?.featured
      ),

    pinned:
      Boolean(
        input?.pinned
      ),

    locked:
      Boolean(
        input?.locked
      ),
  };
}

// ============================================================
// RATING LABELS
// ============================================================

export const REVIEW_RATING_LABELS: Record<
  ReviewRating,
  string
> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Нормально",
  4: "Хорошо",
  5: "Отлично",
};

export const REVIEW_RATING_EMOJIS: Record<
  ReviewRating,
  string
> = {
  1: "😡",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😍",
};

export function getReviewRatingLabel(
  rating: ReviewRating
): string {
  return (
    REVIEW_RATING_LABELS[rating]
  );
}

export function getReviewRatingEmoji(
  rating: ReviewRating
): string {
  return (
    REVIEW_RATING_EMOJIS[rating]
  );
}

// ============================================================
// REVIEW TEXT SUMMARY
// ============================================================

export function truncateReviewText(
  value: unknown,
  maxLength = 160
): string {
  const text =
    normalizeReviewText(
      value,
      Math.max(
        maxLength,
        1
      )
    );

  if (
    text.length <= maxLength
  ) {
    return text;
  }

  return (
    text.slice(
      0,
      Math.max(
        0,
        maxLength - 1
      )
    ) + "…"
  );
}

// ============================================================
// DEFAULT REVIEW
// ============================================================

export function createDefaultReview():
  Partial<NormalizedReviewInput> {
  return {
    authorId: null,
    authorMode: "registered",
    title: "",
    text: "",
    rating: 5,
    status: "pending",
    visibility: "public",
  };
      }
