import type { ReviewStatus } from "../types";

export const REVIEW_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  HIDDEN: "hidden",
  REJECTED: "rejected",
  DELETED: "deleted",
  SPAM: "spam",
} as const;

export type ReviewStatusValue =
  typeof REVIEW_STATUSES[keyof typeof REVIEW_STATUSES];

export const REVIEW_STATUS_LABELS: Record<ReviewStatusValue, string> = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликован",
  hidden: "Скрыт",
  rejected: "Отклонён",
  deleted: "Удалён",
  spam: "Спам",
};

export const REVIEW_STATUS_LABELS_TJ: Record<ReviewStatusValue, string> = {
  draft: "Нақша",
  pending: "Дар модератсия",
  published: "Нашр шудааст",
  hidden: "Пинҳон",
  rejected: "Радшуда",
  deleted: "Нестшуда",
  spam: "Спам",
};

export const REVIEW_STATUS_DESCRIPTIONS: Record<
  ReviewStatusValue,
  string
> = {
  draft: "Отзыв сохранён как черновик и ещё не опубликован.",
  pending: "Отзыв ожидает проверки модератором.",
  published: "Отзыв доступен пользователям.",
  hidden: "Отзыв временно скрыт администрацией.",
  rejected: "Отзыв отклонён модерацией.",
  deleted: "Отзыв удалён из публичного отображения.",
  spam: "Отзыв помечен как спам.",
};

export const REVIEW_PUBLIC_STATUSES: ReviewStatusValue[] = [
  REVIEW_STATUSES.PUBLISHED,
];

export const REVIEW_MODERATION_STATUSES: ReviewStatusValue[] = [
  REVIEW_STATUSES.PENDING,
  REVIEW_STATUSES.PUBLISHED,
  REVIEW_STATUSES.HIDDEN,
  REVIEW_STATUSES.REJECTED,
  REVIEW_STATUSES.SPAM,
];

export const REVIEW_DELETED_STATUSES: ReviewStatusValue[] = [
  REVIEW_STATUSES.DELETED,
];

export const REVIEW_DRAFT_STATUSES: ReviewStatusValue[] = [
  REVIEW_STATUSES.DRAFT,
];

export const REVIEW_PENDING_STATUSES: ReviewStatusValue[] = [
  REVIEW_STATUSES.PENDING,
];

export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;

export type ReviewRating = typeof REVIEW_RATINGS[number];

export const MIN_REVIEW_RATING = 1;
export const MAX_REVIEW_RATING = 5;

export const DEFAULT_REVIEW_RATING = 5;

export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Нормально",
  4: "Хорошо",
  5: "Отлично",
};

export const REVIEW_RATING_LABELS_TJ: Record<ReviewRating, string> = {
  1: "Хеле бад",
  2: "Бад",
  3: "Мӯътадил",
  4: "Хуб",
  5: "Аъло",
};

export const REVIEW_RATING_SHORT_LABELS: Record<ReviewRating, string> = {
  1: "1 звезда",
  2: "2 звезды",
  3: "3 звезды",
  4: "4 звезды",
  5: "5 звёзд",
};

export const REVIEW_RATING_EMOJI: Record<ReviewRating, string> = {
  1: "😡",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

export const REVIEW_RATING_STARS: Record<ReviewRating, string> = {
  1: "★",
  2: "★★",
  3: "★★★",
  4: "★★★★",
  5: "★★★★★",
};

export const REVIEW_TITLE_MIN_LENGTH = 3;
export const REVIEW_TITLE_MAX_LENGTH = 200;

export const REVIEW_TEXT_MIN_LENGTH = 3;
export const REVIEW_TEXT_MAX_LENGTH = 10_000;

export const REVIEW_AUTHOR_NAME_MAX_LENGTH = 150;

export const REVIEW_REPLY_MAX_LENGTH = 10_000;

export const REVIEW_EDIT_WINDOW_MS =
  7 * 24 * 60 * 60 * 1000;

export const REVIEW_MAX_PER_TARGET_PER_VISITOR = 1;

export const REVIEW_MAX_IMAGES = 10;

export const REVIEW_MAX_REPORTS_PER_REVIEW = 100_000;

export const REVIEW_HELPFUL_LIMIT = {
  MIN: 0,
  MAX: Number.MAX_SAFE_INTEGER,
} as const;

/**
 * Виды целей, которым можно поставить отзыв.
 *
 * Основной сценарий проекта:
 * публикация / вакансия / организация / профиль.
 */
export const REVIEW_TARGET_TYPES = {
  PUBLICATION: "publication",
  PROFILE: "profile",
  ORGANIZATION: "organization",
  COMPANY: "company",
  EMPLOYER: "employer",
  SERVICE: "service",
  EVENT: "event",
  EDUCATION: "education",
  OTHER: "other",
} as const;

export type ReviewTargetType =
  typeof REVIEW_TARGET_TYPES[keyof typeof REVIEW_TARGET_TYPES];

export const REVIEW_TARGET_TYPE_LABELS: Record<
  ReviewTargetType,
  string
> = {
  publication: "Публикация",
  profile: "Профиль",
  organization: "Организация",
  company: "Компания",
  employer: "Работодатель",
  service: "Услуга",
  event: "Мероприятие",
  education: "Образовательная организация",
  other: "Другое",
};

export const REVIEW_TARGET_TYPE_LABELS_TJ: Record<
  ReviewTargetType,
  string
> = {
  publication: "Нашрия",
  profile: "Профил",
  organization: "Ташкилот",
  company: "Ширкат",
  employer: "Корфармо",
  service: "Хизматрасонӣ",
  event: "Чорабинӣ",
  education: "Муассисаи таълимӣ",
  other: "Дигар",
};

export const REVIEW_AUTHOR_MODES = {
  PUBLIC: "public",
  ANONYMOUS: "anonymous",
  HIDDEN: "hidden",
} as const;

export type ReviewAuthorMode =
  typeof REVIEW_AUTHOR_MODES[keyof typeof REVIEW_AUTHOR_MODES];

export const REVIEW_AUTHOR_MODE_LABELS: Record<
  ReviewAuthorMode,
  string
> = {
  public: "Публично",
  anonymous: "Анонимно",
  hidden: "Скрыто",
};

export const REVIEW_SOURCES = {
  WEB: "web",
  MOBILE: "mobile",
  API: "api",
  ADMIN: "admin",
  IMPORT: "import",
  SYSTEM: "system",
} as const;

export type ReviewSource =
  typeof REVIEW_SOURCES[keyof typeof REVIEW_SOURCES];

export const REVIEW_VERIFICATION_TYPES = {
  NONE: "none",
  VISITOR: "visitor",
  PROFILE: "profile",
  CONTACT: "contact",
  APPLICATION: "application",
  PURCHASE: "purchase",
  EMPLOYMENT: "employment",
  ADMIN: "admin",
} as const;

export type ReviewVerificationType =
  typeof REVIEW_VERIFICATION_TYPES[
    keyof typeof REVIEW_VERIFICATION_TYPES
  ];

export const REVIEW_MODERATION_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  HIDE: "hide",
  UNHIDE: "unhide",
  DELETE: "delete",
  RESTORE: "restore",
  MARK_SPAM: "mark_spam",
  UNMARK_SPAM: "unmark_spam",
  PIN: "pin",
  UNPIN: "unpin",
  FEATURE: "feature",
  UNFEATURE: "unfeature",
  EDIT: "edit",
  LOCK: "lock",
  UNLOCK: "unlock",
  RESET_RATING: "reset_rating",
  CHANGE_RATING: "change_rating",
  CHANGE_COUNTER: "change_counter",
} as const;

export type ReviewModerationAction =
  typeof REVIEW_MODERATION_ACTIONS[
    keyof typeof REVIEW_MODERATION_ACTIONS
  ];

export const REVIEW_HISTORY_ACTIONS = {
  CREATED: "created",
  UPDATED: "updated",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  RESTORED: "restored",
  DELETED: "deleted",
  SPAMMED: "spammed",
  UNSPAMMED: "unspammed",
  PINNED: "pinned",
  UNPINNED: "unpinned",
  FEATURED: "featured",
  UNFEATURED: "unfeatured",
  RATING_CHANGED: "rating_changed",
  COUNTER_CHANGED: "counter_changed",
  ADMIN_EDITED: "admin_edited",
  IMPORTED: "imported",
} as const;

export type ReviewHistoryAction =
  typeof REVIEW_HISTORY_ACTIONS[
    keyof typeof REVIEW_HISTORY_ACTIONS
  ];

export const REVIEW_REPORT_TYPES = {
  SPAM: "spam",
  HARASSMENT: "harassment",
  ABUSE: "abuse",
  PROFANITY: "profanity",
  HATE: "hate",
  FALSE_INFORMATION: "false_information",
  FRAUD: "fraud",
  ADVERTISEMENT: "advertisement",
  PERSONAL_DATA: "personal_data",
  COPYRIGHT: "copyright",
  OFF_TOPIC: "off_topic",
  DUPLICATE: "duplicate",
  OTHER: "other",
} as const;

export type ReviewReportType =
  typeof REVIEW_REPORT_TYPES[
    keyof typeof REVIEW_REPORT_TYPES
  ];

export const REVIEW_REPORT_LABELS: Record<
  ReviewReportType,
  string
> = {
  spam: "Спам",
  harassment: "Оскорбления или травля",
  abuse: "Злоупотребление",
  profanity: "Нецензурная лексика",
  hate: "Язык ненависти",
  false_information: "Недостоверная информация",
  fraud: "Мошенничество",
  advertisement: "Реклама",
  personal_data: "Персональные данные",
  copyright: "Нарушение авторских прав",
  off_topic: "Не по теме",
  duplicate: "Дубликат",
  other: "Другое",
};

export const REVIEW_REPORT_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type ReviewReportPriority =
  typeof REVIEW_REPORT_PRIORITIES[
    keyof typeof REVIEW_REPORT_PRIORITIES
  ];

export const REVIEW_REACTION_TARGET = "review" as const;

export const REVIEW_METRICS = {
  TOTAL: "reviews",
  RATING_COUNT: "ratings",
  RATING_SUM: "rating_sum",
  RATING_AVERAGE: "rating_average",
  ONE_STAR: "rating_1",
  TWO_STAR: "rating_2",
  THREE_STAR: "rating_3",
  FOUR_STAR: "rating_4",
  FIVE_STAR: "rating_5",
  HELPFUL: "helpful",
  NOT_HELPFUL: "not_helpful",
  REPORTS: "reports",
  REACTIONS: "reactions",
  REPLIES: "replies",
  VIEWS: "views",
} as const;

export type ReviewMetric =
  typeof REVIEW_METRICS[keyof typeof REVIEW_METRICS];

export const REVIEW_COUNTER_KEYS = [
  "helpful_count",
  "not_helpful_count",
  "reports_count",
  "reactions_count",
  "replies_count",
  "views_count",
] as const;

export type ReviewCounterKey =
  typeof REVIEW_COUNTER_KEYS[number];

export const REVIEW_DISTRIBUTION_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
] as const;

export type ReviewDistributionKey =
  typeof REVIEW_DISTRIBUTION_KEYS[number];

export const EMPTY_RATING_DISTRIBUTION: Record<
  ReviewDistributionKey,
  string
> = {
  "1": "0",
  "2": "0",
  "3": "0",
  "4": "0",
  "5": "0",
};

export const DEFAULT_REVIEW_SORT = "newest" as const;

export const REVIEW_SORTS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  HIGHEST_RATING: "highest_rating",
  LOWEST_RATING: "lowest_rating",
  MOST_HELPFUL: "most_helpful",
  MOST_REACTIONS: "most_reactions",
  MOST_REPLIES: "most_replies",
  MOST_REPORTED: "most_reported",
  RANDOM: "random",
} as const;

export type ReviewSort =
  typeof REVIEW_SORTS[keyof typeof REVIEW_SORTS];

export const REVIEW_VISIBILITY = {
  PUBLIC: "public",
  MODERATORS: "moderators",
  ADMINS: "admins",
  AUTHOR: "author",
} as const;

export type ReviewVisibility =
  typeof REVIEW_VISIBILITY[
    keyof typeof REVIEW_VISIBILITY
  ];

export const REVIEW_FEATURES = {
  CREATE: "reviews.create",
  EDIT: "reviews.edit",
  DELETE: "reviews.delete",
  MODERATE: "reviews.moderate",
  REPLY: "reviews.reply",
  REACT: "reviews.react",
  REPORT: "reviews.report",
  RATE: "reviews.rate",
  PIN: "reviews.pin",
  FEATURE: "reviews.feature",
  VERIFY: "reviews.verify",
  MANAGE_METRICS: "reviews.metrics.manage",
  MANAGE_COUNTERS: "reviews.counters.manage",
  EXPORT: "reviews.export",
  IMPORT: "reviews.import",
} as const;

export type ReviewFeature =
  typeof REVIEW_FEATURES[keyof typeof REVIEW_FEATURES];

export const REVIEW_DEFAULTS = {
  status: REVIEW_STATUSES.PENDING,
  rating: DEFAULT_REVIEW_RATING,
  authorMode: REVIEW_AUTHOR_MODES.PUBLIC,
  source: REVIEW_SOURCES.WEB,
  verificationType: REVIEW_VERIFICATION_TYPES.NONE,
  sort: DEFAULT_REVIEW_SORT,
  page: 1,
  limit: 20,
  pinned: false,
  featured: false,
  locked: false,
} as const;

export const REVIEW_LIMITS = {
  TITLE_MIN: REVIEW_TITLE_MIN_LENGTH,
  TITLE_MAX: REVIEW_TITLE_MAX_LENGTH,
  TEXT_MIN: REVIEW_TEXT_MIN_LENGTH,
  TEXT_MAX: REVIEW_TEXT_MAX_LENGTH,
  AUTHOR_NAME_MAX: REVIEW_AUTHOR_NAME_MAX_LENGTH,
  REPLY_MAX: REVIEW_REPLY_MAX_LENGTH,
  MAX_IMAGES: REVIEW_MAX_IMAGES,
  MAX_REPORTS: REVIEW_MAX_REPORTS_PER_REVIEW,
  MAX_PER_TARGET_PER_VISITOR:
    REVIEW_MAX_PER_TARGET_PER_VISITOR,
} as const;

export function isValidReviewStatus(
  value: unknown,
): value is ReviewStatusValue {
  return (
    typeof value === "string" &&
    (Object.values(REVIEW_STATUSES) as string[]).includes(value)
  );
}

export function isValidReviewRating(
  value: unknown,
): value is ReviewRating {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_REVIEW_RATING &&
    value <= MAX_REVIEW_RATING
  );
}

export function normalizeReviewRating(
  value: unknown,
): ReviewRating | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numeric)) {
    return null;
  }

  const rounded = Math.round(numeric);

  return isValidReviewRating(rounded)
    ? rounded
    : null;
}

export function isValidReviewTargetType(
  value: unknown,
): value is ReviewTargetType {
  return (
    typeof value === "string" &&
    (Object.values(REVIEW_TARGET_TYPES) as string[]).includes(value)
  );
}

export function isValidReviewAuthorMode(
  value: unknown,
): value is ReviewAuthorMode {
  return (
    typeof value === "string" &&
    (Object.values(REVIEW_AUTHOR_MODES) as string[]).includes(value)
  );
}

export function isValidReviewSource(
  value: unknown,
): value is ReviewSource {
  return (
    typeof value === "string" &&
    (Object.values(REVIEW_SOURCES) as string[]).includes(value)
  );
}

export function isValidReviewVerificationType(
  value: unknown,
): value is ReviewVerificationType {
  return (
    typeof value === "string" &&
    (Object.values(REVIEW_VERIFICATION_TYPES) as string[]).includes(value)
  );
}

export function isValidReviewSort(
  value: unknown,
): value is ReviewSort {
  return (
    typeof value === "string" &&
    (Object.values(REVIEW_SORTS) as string[]).includes(value)
  );
}

export function isReviewPublic(
  status: ReviewStatusValue,
): boolean {
  return REVIEW_PUBLIC_STATUSES.includes(status);
}

export function isReviewDeleted(
  status: ReviewStatusValue,
): boolean {
  return REVIEW_DELETED_STATUSES.includes(status);
}

export function isReviewPending(
  status: ReviewStatusValue,
): boolean {
  return REVIEW_PENDING_STATUSES.includes(status);
}

export function canEditReview(
  createdAt: Date | string | number,
  now: Date | string | number = Date.now(),
): boolean {
  const created = new Date(createdAt).getTime();
  const current = new Date(now).getTime();

  if (!Number.isFinite(created) || !Number.isFinite(current)) {
    return false;
  }

  return current - created <= REVIEW_EDIT_WINDOW_MS;
}

export function getRatingLabel(
  rating: ReviewRating,
): string {
  return REVIEW_RATING_LABELS[rating];
}

export function getRatingLabelTj(
  rating: ReviewRating,
): string {
  return REVIEW_RATING_LABELS_TJ[rating];
}

export function getRatingStars(
  rating: ReviewRating,
): string {
  return REVIEW_RATING_STARS[rating];
}

export function getRatingEmoji(
  rating: ReviewRating,
): string {
  return REVIEW_RATING_EMOJI[rating];
}

export function getRatingPercentage(
  ratingCount: number | string | bigint,
  totalCount: number | string | bigint,
): number {
  const count = Number(ratingCount);
  const total = Number(totalCount);

  if (
    !Number.isFinite(count) ||
    !Number.isFinite(total) ||
    total <= 0
  ) {
    return 0;
  }

  return Math.min(100, Math.max(0, (count / total) * 100));
}

export function calculateRatingAverage(
  distribution: Partial<
    Record<ReviewDistributionKey, number | string | bigint>
  >,
): string {
  let sum = 0n;
  let count = 0n;

  for (const rating of REVIEW_RATINGS) {
    const raw = distribution[String(rating) as ReviewDistributionKey];

    if (raw === undefined) {
      continue;
    }

    let current: bigint;

    try {
      current =
        typeof raw === "bigint"
          ? raw
          : BigInt(String(raw));
    } catch {
      continue;
    }

    if (current < 0n) {
      continue;
    }

    sum += BigInt(rating) * current;
    count += current;
  }

  if (count === 0n) {
    return "0";
  }

  const scaled = (sum * 100n) / count;

  const integer = scaled / 100n;
  const decimal = (scaled % 100n)
    .toString()
    .padStart(2, "0");

  return `${integer}.${decimal}`;
}

export function createEmptyRatingDistribution(): Record<
  ReviewDistributionKey,
  string
> {
  return {
    ...EMPTY_RATING_DISTRIBUTION,
  };
}

export function isValidReviewText(
  value: unknown,
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const length = value.trim().length;

  return (
    length >= REVIEW_TEXT_MIN_LENGTH &&
    length <= REVIEW_TEXT_MAX_LENGTH
  );
}

export function isValidReviewTitle(
  value: unknown,
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const length = value.trim().length;

  return (
    length >= REVIEW_TITLE_MIN_LENGTH &&
    length <= REVIEW_TITLE_MAX_LENGTH
  );
}

export function getNextReviewStatus(
  current: ReviewStatusValue,
  action: ReviewModerationAction,
): ReviewStatusValue | null {
  switch (action) {
    case REVIEW_MODERATION_ACTIONS.APPROVE:
      return REVIEW_STATUSES.PUBLISHED;

    case REVIEW_MODERATION_ACTIONS.REJECT:
      return REVIEW_STATUSES.REJECTED;

    case REVIEW_MODERATION_ACTIONS.HIDE:
      return REVIEW_STATUSES.HIDDEN;

    case REVIEW_MODERATION_ACTIONS.UNHIDE:
      return REVIEW_STATUSES.PUBLISHED;

    case REVIEW_MODERATION_ACTIONS.DELETE:
      return REVIEW_STATUSES.DELETED;

    case REVIEW_MODERATION_ACTIONS.RESTORE:
      return REVIEW_STATUSES.PUBLISHED;

    case REVIEW_MODERATION_ACTIONS.MARK_SPAM:
      return REVIEW_STATUSES.SPAM;

    case REVIEW_MODERATION_ACTIONS.UNMARK_SPAM:
      return REVIEW_STATUSES.PENDING;

    default:
      return current;
  }
}

export const REVIEW_STATUS_TRANSITIONS: Record<
  ReviewStatusValue,
  ReviewStatusValue[]
> = {
  draft: [
    REVIEW_STATUSES.pending,
    REVIEW_STATUSES.deleted,
  ],
  pending: [
    REVIEW_STATUSES.published,
    REVIEW_STATUSES.rejected,
    REVIEW_STATUSES.hidden,
    REVIEW_STATUSES.spam,
    REVIEW_STATUSES.deleted,
  ],
  published: [
    REVIEW_STATUSES.hidden,
    REVIEW_STATUSES.deleted,
    REVIEW_STATUSES.spam,
  ],
  hidden: [
    REVIEW_STATUSES.published,
    REVIEW_STATUSES.deleted,
    REVIEW_STATUSES.spam,
  ],
  rejected: [
    REVIEW_STATUSES.pending,
    REVIEW_STATUSES.deleted,
  ],
  deleted: [
    REVIEW_STATUSES.published,
    REVIEW_STATUSES.pending,
  ],
  spam: [
    REVIEW_STATUSES.pending,
    REVIEW_STATUSES.hidden,
    REVIEW_STATUSES.deleted,
  ],
};

export function canTransitionReviewStatus(
  from: ReviewStatusValue,
  to: ReviewStatusValue,
): boolean {
  if (from === to) {
    return true;
  }

  return (
    REVIEW_STATUS_TRANSITIONS[from]?.includes(to) ??
    false
  );
}

export const REVIEW_ADMIN_ACTIONS = [
  REVIEW_MODERATION_ACTIONS.APPROVE,
  REVIEW_MODERATION_ACTIONS.REJECT,
  REVIEW_MODERATION_ACTIONS.HIDE,
  REVIEW_MODERATION_ACTIONS.UNHIDE,
  REVIEW_MODERATION_ACTIONS.DELETE,
  REVIEW_MODERATION_ACTIONS.RESTORE,
  REVIEW_MODERATION_ACTIONS.MARK_SPAM,
  REVIEW_MODERATION_ACTIONS.UNMARK_SPAM,
  REVIEW_MODERATION_ACTIONS.PIN,
  REVIEW_MODERATION_ACTIONS.UNPIN,
  REVIEW_MODERATION_ACTIONS.FEATURE,
  REVIEW_MODERATION_ACTIONS.UNFEATURE,
  REVIEW_MODERATION_ACTIONS.EDIT,
  REVIEW_MODERATION_ACTIONS.LOCK,
  REVIEW_MODERATION_ACTIONS.UNLOCK,
  REVIEW_MODERATION_ACTIONS.RESET_RATING,
  REVIEW_MODERATION_ACTIONS.CHANGE_RATING,
  REVIEW_MODERATION_ACTIONS.CHANGE_COUNTER,
] as const;

export const REVIEW_PUBLIC_ACTIONS = {
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  REPLY: "reply",
  REACT: "react",
  REPORT: "report",
  HELPFUL: "helpful",
} as const;

export type ReviewPublicAction =
  typeof REVIEW_PUBLIC_ACTIONS[
    keyof typeof REVIEW_PUBLIC_ACTIONS
  ];

export const REVIEW_PERMISSION_RESOURCES = {
  REVIEWS: "reviews",
  REVIEW_RATINGS: "review_ratings",
  REVIEW_REACTIONS: "review_reactions",
  REVIEW_REPORTS: "review_reports",
  REVIEW_METRICS: "review_metrics",
  REVIEW_HISTORY: "review_history",
} as const;

export const REVIEW_EXPORT_FIELDS = [
  "id",
  "target_type",
  "target_id",
  "publication_id",
  "author_id",
  "author_name",
  "author_mode",
  "rating",
  "title",
  "text",
  "status",
  "verification_type",
  "helpful_count",
  "not_helpful_count",
  "reactions_count",
  "replies_count",
  "reports_count",
  "pinned",
  "featured",
  "created_at",
  "updated_at",
  "published_at",
] as const;

export const REVIEW_SEARCH_FIELDS = [
  "id",
  "title",
  "text",
  "author_name",
  "target_id",
  "publication_id",
  "status",
  "rating",
] as const;

export const REVIEW_SORT_FIELD_MAP: Record<
  ReviewSort,
  string
> = {
  newest: "created_at DESC",
  oldest: "created_at ASC",
  highest_rating: "rating DESC, created_at DESC",
  lowest_rating: "rating ASC, created_at DESC",
  most_helpful:
    "helpful_count DESC, created_at DESC",
  most_reactions:
    "reactions_count DESC, created_at DESC",
  most_replies:
    "replies_count DESC, created_at DESC",
  most_reported:
    "reports_count DESC, created_at DESC",
  random: "RANDOM()",
};

export const REVIEW_TYPES = {
  STANDARD: "standard",
  VERIFIED: "verified",
  ADMIN: "admin",
  SYSTEM: "system",
} as const;

export type ReviewType =
  typeof REVIEW_TYPES[keyof typeof REVIEW_TYPES];

export const REVIEW_TYPE_LABELS: Record<
  ReviewType,
  string
> = {
  standard: "Обычный отзыв",
  verified: "Подтверждённый отзыв",
  admin: "Административный отзыв",
  system: "Системный отзыв",
};

export const REVIEW_AUDIT_EVENTS = {
  REVIEW_CREATED: "review.created",
  REVIEW_UPDATED: "review.updated",
  REVIEW_DELETED: "review.deleted",
  REVIEW_RESTORED: "review.restored",
  REVIEW_APPROVED: "review.approved",
  REVIEW_REJECTED: "review.rejected",
  REVIEW_HIDDEN: "review.hidden",
  REVIEW_REPORTED: "review.reported",
  REVIEW_PINNED: "review.pinned",
  REVIEW_UNPINNED: "review.unpinned",
  REVIEW_FEATURED: "review.featured",
  REVIEW_REACTION_ADDED: "review.reaction_added",
  REVIEW_REACTION_REMOVED: "review.reaction_removed",
  REVIEW_RATING_CHANGED: "review.rating_changed",
  REVIEW_COUNTER_CHANGED: "review.counter_changed",
  REVIEW_REPLY_CREATED: "review.reply_created",
} as const;

export type ReviewAuditEvent =
  typeof REVIEW_AUDIT_EVENTS[
    keyof typeof REVIEW_AUDIT_EVENTS
  ];

/**
 * Проверка совместимости с типом ReviewStatus,
 * если он уже существует в src/types.
 */
export function isReviewStatusCompatible(
  value: unknown,
): value is ReviewStatus {
  return isValidReviewStatus(value);
}
