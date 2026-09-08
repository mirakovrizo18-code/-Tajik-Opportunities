// src/constants/reviews.ts

export const REVIEW_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  HIDDEN: "hidden",
  REJECTED: "rejected",
  DELETED: "deleted",
  ARCHIVED: "archived",
} as const;

export type ReviewStatus =
  (typeof REVIEW_STATUSES)[keyof typeof REVIEW_STATUSES];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликован",
  hidden: "Скрыт",
  rejected: "Отклонён",
  deleted: "Удалён",
  archived: "Архивирован",
};

export const REVIEW_STATUS_LABELS_TJ: Record<ReviewStatus, string> = {
  draft: "Лоиҳа",
  pending: "Дар модератсия",
  published: "Нашршуда",
  hidden: "Пинҳон",
  rejected: "Радшуда",
  deleted: "Нестшуда",
  archived: "Бойгонӣ",
};

export const REVIEW_STATUS_DESCRIPTIONS: Record<ReviewStatus, string> = {
  draft: "Отзыв ещё не опубликован и находится в черновике.",
  pending: "Отзыв ожидает проверки модератором.",
  published: "Отзыв доступен пользователям.",
  hidden: "Отзыв временно скрыт.",
  rejected: "Отзыв отклонён модерацией.",
  deleted: "Отзыв удалён.",
  archived: "Отзыв перенесён в архив.",
};

export const REVIEW_ACTIONS = {
  CREATE: "create",
  EDIT: "edit",
  SUBMIT: "submit",
  APPROVE: "approve",
  REJECT: "reject",
  HIDE: "hide",
  SHOW: "show",
  DELETE: "delete",
  RESTORE: "restore",
  ARCHIVE: "archive",
  UNARCHIVE: "unarchive",
  PIN: "pin",
  UNPIN: "unpin",
  FEATURE: "feature",
  UNFEATURE: "unfeature",
  LOCK: "lock",
  UNLOCK: "unlock",
  MARK_HELPFUL: "mark_helpful",
  MARK_NOT_HELPFUL: "mark_not_helpful",
  ADD_REACTION: "add_reaction",
  REMOVE_REACTION: "remove_reaction",
  REPORT: "report",
  RESOLVE_REPORT: "resolve_report",
  REOPEN_REPORT: "reopen_report",
  RESTORE_FROM_BACKUP: "restore_from_backup",
  CHANGE_RATING: "change_rating",
  CHANGE_COUNTERS: "change_counters",
  CHANGE_AUTHOR: "change_author",
  CHANGE_DATE: "change_date",
} as const;

export type ReviewAction =
  (typeof REVIEW_ACTIONS)[keyof typeof REVIEW_ACTIONS];

export const REVIEW_TARGET_TYPES = {
  PUBLICATION: "publication",
  PROFILE: "profile",
  ORGANIZATION: "organization",
  USER: "user",
  COMPANY: "company",
  SERVICE: "service",
  EVENT: "event",
  COURSE: "course",
  OPPORTUNITY: "opportunity",
  OTHER: "other",
} as const;

export type ReviewTargetType =
  (typeof REVIEW_TARGET_TYPES)[keyof typeof REVIEW_TARGET_TYPES];

export const REVIEW_AUTHOR_MODES = {
  PUBLIC: "public",
  ANONYMOUS: "anonymous",
  HIDDEN: "hidden",
} as const;

export type ReviewAuthorMode =
  (typeof REVIEW_AUTHOR_MODES)[keyof typeof REVIEW_AUTHOR_MODES];

export const REVIEW_RATINGS = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
} as const;

export type ReviewRating =
  (typeof REVIEW_RATINGS)[keyof typeof REVIEW_RATINGS];

export const REVIEW_RATING_VALUES: ReviewRating[] = [1, 2, 3, 4, 5];

export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  1: "1 звезда",
  2: "2 звезды",
  3: "3 звезды",
  4: "4 звезды",
  5: "5 звёзд",
};

export const REVIEW_RATING_LABELS_TJ: Record<ReviewRating, string> = {
  1: "1 ситора",
  2: "2 ситора",
  3: "3 ситора",
  4: "4 ситора",
  5: "5 ситора",
};

export const REVIEW_RATING_DESCRIPTIONS: Record<ReviewRating, string> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Удовлетворительно",
  4: "Хорошо",
  5: "Отлично",
};

export const REVIEW_RATING_DESCRIPTIONS_TJ: Record<ReviewRating, string> = {
  1: "Хеле бад",
  2: "Бад",
  3: "Қаноатбахш",
  4: "Хуб",
  5: "Аъло",
};

export const REVIEW_DEFAULTS = {
  STATUS: REVIEW_STATUSES.PENDING,
  AUTHOR_MODE: REVIEW_AUTHOR_MODES.PUBLIC,
  RATING: 5,
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_TITLE_LENGTH: 2,
  MAX_TITLE_LENGTH: 200,
  MIN_TEXT_LENGTH: 1,
  MAX_TEXT_LENGTH: 5000,
  MAX_IMAGES: 10,
  MAX_REPLIES: 100,
} as const;

export const REVIEW_LIMITS = {
  TITLE_MIN: 2,
  TITLE_MAX: 200,

  TEXT_MIN: 1,
  TEXT_MAX: 5000,

  SHORT_TEXT_MAX: 500,
  PREVIEW_MAX: 300,

  IMAGES_MAX: 10,

  REACTIONS_PER_REVIEW: 1000000000,
  REPORTS_PER_REVIEW: 1000000000,

  EDIT_WINDOW_MINUTES: 60 * 24 * 7,

  MAX_RATING: 5,
  MIN_RATING: 1,

  PAGE_MAX: 100,
} as const;

export const REVIEW_SORTS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  HIGHEST_RATING: "highest_rating",
  LOWEST_RATING: "lowest_rating",
  MOST_HELPFUL: "most_helpful",
  MOST_REACTIONS: "most_reactions",
  MOST_REPORTED: "most_reported",
  MOST_DISCUSSION: "most_discussion",
  FEATURED: "featured",
  PINNED: "pinned",
} as const;

export type ReviewSort =
  (typeof REVIEW_SORTS)[keyof typeof REVIEW_SORTS];

export const REVIEW_SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type ReviewSortDirection =
  (typeof REVIEW_SORT_DIRECTIONS)[keyof typeof REVIEW_SORT_DIRECTIONS];

export const REVIEW_REPORT_TYPES = {
  SPAM: "spam",
  ABUSE: "abuse",
  HARASSMENT: "harassment",
  HATE: "hate",
  FALSE_INFORMATION: "false_information",
  ADVERTISEMENT: "advertisement",
  PERSONAL_DATA: "personal_data",
  COPYRIGHT: "copyright",
  OFF_TOPIC: "off_topic",
  DUPLICATE: "duplicate",
  FAKE_REVIEW: "fake_review",
  MANIPULATED_RATING: "manipulated_rating",
  OTHER: "other",
} as const;

export type ReviewReportType =
  (typeof REVIEW_REPORT_TYPES)[keyof typeof REVIEW_REPORT_TYPES];

export const REVIEW_REPORT_STATUSES = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  REJECTED: "rejected",
  DISMISSED: "dismissed",
  ESCALATED: "escalated",
} as const;

export type ReviewReportStatus =
  (typeof REVIEW_REPORT_STATUSES)[keyof typeof REVIEW_REPORT_STATUSES];

export const REVIEW_REPORT_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ReviewReportPriority =
  (typeof REVIEW_REPORT_PRIORITIES)[keyof typeof REVIEW_REPORT_PRIORITIES];

export const REVIEW_REPORT_ACTIONS = {
  REVIEW: "review",
  HIDE_REVIEW: "hide_review",
  DELETE_REVIEW: "delete_review",
  RESTORE_REVIEW: "restore_review",
  WARN_AUTHOR: "warn_author",
  BAN_AUTHOR: "ban_author",
  DISMISS: "dismiss",
  ESCALATE: "escalate",
  RESOLVE: "resolve",
} as const;

export type ReviewReportAction =
  (typeof REVIEW_REPORT_ACTIONS)[keyof typeof REVIEW_REPORT_ACTIONS];

export const REVIEW_REACTION_TARGETS = {
  REVIEW: "review",
  REPLY: "reply",
} as const;

export type ReviewReactionTarget =
  (typeof REVIEW_REACTION_TARGETS)[keyof typeof REVIEW_REACTION_TARGETS];

export const REVIEW_METRICS = {
  TOTAL: "total",
  PUBLISHED: "published",
  PENDING: "pending",
  HIDDEN: "hidden",
  REJECTED: "rejected",
  DELETED: "deleted",

  TOTAL_RATINGS: "total_ratings",
  RATING_SUM: "rating_sum",
  RATING_AVERAGE: "rating_average",

  RATING_1: "rating_1",
  RATING_2: "rating_2",
  RATING_3: "rating_3",
  RATING_4: "rating_4",
  RATING_5: "rating_5",

  TOTAL_REACTIONS: "total_reactions",
  TOTAL_HELPFUL: "total_helpful",
  TOTAL_NOT_HELPFUL: "total_not_helpful",

  TOTAL_REPORTS: "total_reports",
  TOTAL_REPLIES: "total_replies",
  TOTAL_VIEWS: "total_views",

  VERIFIED_REVIEWS: "verified_reviews",
  ANONYMOUS_REVIEWS: "anonymous_reviews",
  FEATURED_REVIEWS: "featured_reviews",
  PINNED_REVIEWS: "pinned_reviews",
} as const;

export type ReviewMetric =
  (typeof REVIEW_METRICS)[keyof typeof REVIEW_METRICS];

export const REVIEW_METRIC_KEYS: ReviewMetric[] = Object.values(
  REVIEW_METRICS
);

export const REVIEW_RATING_DISTRIBUTION_KEYS = {
  1: "rating_1",
  2: "rating_2",
  3: "rating_3",
  4: "rating_4",
  5: "rating_5",
} as const;

export const REVIEW_MODERATION_REASONS = {
  SPAM: "spam",
  ABUSE: "abuse",
  HARASSMENT: "harassment",
  HATE: "hate",
  FALSE_INFORMATION: "false_information",
  ADVERTISEMENT: "advertisement",
  PERSONAL_DATA: "personal_data",
  OFF_TOPIC: "off_topic",
  DUPLICATE: "duplicate",
  FAKE_REVIEW: "fake_review",
  MANIPULATION: "rating_manipulation",
  LOW_QUALITY: "low_quality",
  POLICY_VIOLATION: "policy_violation",
  OTHER: "other",
} as const;

export type ReviewModerationReason =
  (typeof REVIEW_MODERATION_REASONS)[keyof typeof REVIEW_MODERATION_REASONS];

export const REVIEW_VISIBILITY = {
  PUBLIC: "public",
  UNLISTED: "unlisted",
  HIDDEN: "hidden",
} as const;

export type ReviewVisibility =
  (typeof REVIEW_VISIBILITY)[keyof typeof REVIEW_VISIBILITY];

export const REVIEW_FEATURE_STATES = {
  NORMAL: "normal",
  FEATURED: "featured",
  PINNED: "pinned",
} as const;

export type ReviewFeatureState =
  (typeof REVIEW_FEATURE_STATES)[keyof typeof REVIEW_FEATURE_STATES];

export const REVIEW_VERIFICATION_STATES = {
  UNVERIFIED: "unverified",
  VERIFIED: "verified",
  ADMIN_VERIFIED: "admin_verified",
} as const;

export type ReviewVerificationState =
  (typeof REVIEW_VERIFICATION_STATES)[keyof typeof REVIEW_VERIFICATION_STATES];

export const REVIEW_SOURCE_TYPES = {
  WEBSITE: "website",
  ADMIN: "admin",
  IMPORT: "import",
  API: "api",
  MIGRATION: "migration",
  SYSTEM: "system",
} as const;

export type ReviewSourceType =
  (typeof REVIEW_SOURCE_TYPES)[keyof typeof REVIEW_SOURCE_TYPES];

export const REVIEW_EVENT_TYPES = {
  CREATED: "created",
  UPDATED: "updated",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  SHOWN: "shown",
  DELETED: "deleted",
  RESTORED: "restored",
  ARCHIVED: "archived",
  PINNED: "pinned",
  UNPINNED: "unpinned",
  FEATURED: "featured",
  UNFEATURED: "unfeatured",
  RATING_CHANGED: "rating_changed",
  REACTION_ADDED: "reaction_added",
  REACTION_REMOVED: "reaction_removed",
  REPORT_CREATED: "report_created",
  REPORT_RESOLVED: "report_resolved",
  REPORT_REJECTED: "report_rejected",
  REPLY_CREATED: "reply_created",
  COUNTERS_CHANGED: "counters_changed",
  AUTHOR_CHANGED: "author_changed",
} as const;

export type ReviewEventType =
  (typeof REVIEW_EVENT_TYPES)[keyof typeof REVIEW_EVENT_TYPES];

export const REVIEW_PERMISSIONS = {
  VIEW: "reviews.view",
  VIEW_HIDDEN: "reviews.view_hidden",
  VIEW_DELETED: "reviews.view_deleted",

  CREATE: "reviews.create",
  EDIT: "reviews.edit",
  DELETE: "reviews.delete",
  RESTORE: "reviews.restore",

  MODERATE: "reviews.moderate",
  APPROVE: "reviews.approve",
  REJECT: "reviews.reject",
  HIDE: "reviews.hide",
  SHOW: "reviews.show",

  PIN: "reviews.pin",
  FEATURE: "reviews.feature",

  REPLY: "reviews.reply",

  REACTIONS_VIEW: "reviews.reactions.view",
  REACTIONS_MANAGE: "reviews.reactions.manage",

  REPORTS_VIEW: "reviews.reports.view",
  REPORTS_MANAGE: "reviews.reports.manage",

  RATINGS_VIEW: "reviews.ratings.view",
  RATINGS_MANAGE: "reviews.ratings.manage",

  METRICS_VIEW: "reviews.metrics.view",
  METRICS_MANAGE: "reviews.metrics.manage",

  COUNTERS_VIEW: "reviews.counters.view",
  COUNTERS_MANAGE: "reviews.counters.manage",

  AUTHOR_MANAGE: "reviews.author.manage",
  DATE_MANAGE: "reviews.date.manage",

  HISTORY_VIEW: "reviews.history.view",
  EXPORT: "reviews.export",
  IMPORT: "reviews.import",

  BULK_MANAGE: "reviews.bulk.manage",
  FULL_CONTROL: "reviews.full_control",
} as const;

export type ReviewPermission =
  (typeof REVIEW_PERMISSIONS)[keyof typeof REVIEW_PERMISSIONS];

export const REVIEW_ADMIN_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  HIDE: "hide",
  SHOW: "show",
  DELETE: "delete",
  RESTORE: "restore",
  PIN: "pin",
  UNPIN: "unpin",
  FEATURE: "feature",
  UNFEATURE: "unfeature",
  LOCK: "lock",
  UNLOCK: "unlock",

  EDIT_TEXT: "edit_text",
  EDIT_TITLE: "edit_title",
  EDIT_RATING: "edit_rating",
  EDIT_AUTHOR: "edit_author",
  EDIT_STATUS: "edit_status",
  EDIT_DATE: "edit_date",

  SET_VIEWS: "set_views",
  SET_HELPFUL: "set_helpful",
  SET_NOT_HELPFUL: "set_not_helpful",
  SET_REACTIONS: "set_reactions",
  SET_REPORTS: "set_reports",
  SET_REPLIES: "set_replies",

  ADD_REACTION: "add_reaction",
  REMOVE_REACTION: "remove_reaction",

  VERIFY: "verify",
  UNVERIFY: "unverify",

  RESTORE_VERSION: "restore_version",
  VIEW_HISTORY: "view_history",
  EXPORT: "export",
} as const;

export type ReviewAdminAction =
  (typeof REVIEW_ADMIN_ACTIONS)[keyof typeof REVIEW_ADMIN_ACTIONS];

export const REVIEW_PUBLIC_STATUSES: ReviewStatus[] = [
  REVIEW_STATUSES.PUBLISHED,
];

export const REVIEW_MODERATION_STATUSES: ReviewStatus[] = [
  REVIEW_STATUSES.DRAFT,
  REVIEW_STATUSES.PENDING,
  REVIEW_STATUSES.PUBLISHED,
  REVIEW_STATUSES.HIDDEN,
  REVIEW_STATUSES.REJECTED,
  REVIEW_STATUSES.ARCHIVED,
];

export const REVIEW_DELETED_STATUSES: ReviewStatus[] = [
  REVIEW_STATUSES.DELETED,
];

export function isValidReviewStatus(
  value: unknown
): value is ReviewStatus {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_STATUSES).includes(
      value as ReviewStatus
    )
  );
}

export function isPublicReviewStatus(
  value: unknown
): value is "published" {
  return value === REVIEW_STATUSES.PUBLISHED;
}

export function isDeletedReviewStatus(
  value: unknown
): value is "deleted" {
  return value === REVIEW_STATUSES.DELETED;
}

export function isValidReviewRating(
  value: unknown
): value is ReviewRating {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= REVIEW_LIMITS.MIN_RATING &&
    value <= REVIEW_LIMITS.MAX_RATING
  );
}

export function normalizeReviewRating(
  value: unknown
): ReviewRating {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return REVIEW_RATINGS.FIVE;
  }

  const rounded = Math.round(rating);

  if (rounded < 1) {
    return REVIEW_RATINGS.ONE;
  }

  if (rounded > 5) {
    return REVIEW_RATINGS.FIVE;
  }

  return rounded as ReviewRating;
}

export function ratingToStars(
  rating: ReviewRating
): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function getRatingLabel(
  rating: ReviewRating,
  language: "ru" | "tj" = "ru"
): string {
  return language === "tj"
    ? REVIEW_RATING_LABELS_TJ[rating]
    : REVIEW_RATING_LABELS[rating];
}

export function getRatingDescription(
  rating: ReviewRating,
  language: "ru" | "tj" = "ru"
): string {
  return language === "tj"
    ? REVIEW_RATING_DESCRIPTIONS_TJ[rating]
    : REVIEW_RATING_DESCRIPTIONS[rating];
}

export function isValidReviewTargetType(
  value: unknown
): value is ReviewTargetType {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_TARGET_TYPES).includes(
      value as ReviewTargetType
    )
  );
}

export function isValidReviewAuthorMode(
  value: unknown
): value is ReviewAuthorMode {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_AUTHOR_MODES).includes(
      value as ReviewAuthorMode
    )
  );
}

export function isValidReviewSort(
  value: unknown
): value is ReviewSort {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_SORTS).includes(
      value as ReviewSort
    )
  );
}

export function isValidReviewReportType(
  value: unknown
): value is ReviewReportType {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_REPORT_TYPES).includes(
      value as ReviewReportType
    )
  );
}

export function isValidReviewReportStatus(
  value: unknown
): value is ReviewReportStatus {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_REPORT_STATUSES).includes(
      value as ReviewReportStatus
    )
  );
}

export function canReviewBePublic(
  status: ReviewStatus,
  visibility: ReviewVisibility = REVIEW_VISIBILITY.PUBLIC
): boolean {
  return (
    status === REVIEW_STATUSES.PUBLISHED &&
    visibility === REVIEW_VISIBILITY.PUBLIC
  );
}

export function canEditReview(
  status: ReviewStatus
): boolean {
  return (
    status !== REVIEW_STATUSES.DELETED &&
    status !== REVIEW_STATUSES.ARCHIVED
  );
}

export function canDeleteReview(
  status: ReviewStatus
): boolean {
  return status !== REVIEW_STATUSES.DELETED;
}

export function canRestoreReview(
  status: ReviewStatus
): boolean {
  return (
    status === REVIEW_STATUSES.DELETED ||
    status === REVIEW_STATUSES.HIDDEN ||
    status === REVIEW_STATUSES.REJECTED ||
    status === REVIEW_STATUSES.ARCHIVED
  );
}

export function canModerateReview(
  status: ReviewStatus
): boolean {
  return status !== REVIEW_STATUSES.DELETED;
}

export function canTransitionReviewStatus(
  from: ReviewStatus,
  to: ReviewStatus
): boolean {
  if (from === to) {
    return true;
  }

  const transitions: Record<ReviewStatus, ReviewStatus[]> = {
    draft: ["pending", "deleted"],
    pending: ["published", "rejected", "hidden", "deleted"],
    published: ["hidden", "deleted", "archived"],
    hidden: ["published", "rejected", "deleted", "archived"],
    rejected: ["pending", "published", "deleted", "archived"],
    deleted: ["pending", "published", "hidden", "archived"],
    archived: ["pending", "published", "deleted"],
  };

  return transitions[from]?.includes(to) ?? false;
}

export function calculateRatingAverage(
  distribution: Record<ReviewRating, number>
): number {
  const total =
    distribution[1] +
    distribution[2] +
    distribution[3] +
    distribution[4] +
    distribution[5];

  if (total <= 0) {
    return 0;
  }

  const sum =
    distribution[1] * 1 +
    distribution[2] * 2 +
    distribution[3] * 3 +
    distribution[4] * 4 +
    distribution[5] * 5;

  return Number((sum / total).toFixed(2));
}

export function createEmptyRatingDistribution(): Record<
  ReviewRating,
  number
> {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
}

export function addRatingToDistribution(
  distribution: Record<ReviewRating, number>,
  rating: ReviewRating,
  amount = 1
): Record<ReviewRating, number> {
  return {
    ...distribution,
    [rating]: Math.max(
      0,
      distribution[rating] + amount
    ),
  };
}

export function removeRatingFromDistribution(
  distribution: Record<ReviewRating, number>,
  rating: ReviewRating,
  amount = 1
): Record<ReviewRating, number> {
  return {
    ...distribution,
    [rating]: Math.max(
      0,
      distribution[rating] - amount
    ),
  };
}

export function getRatingDistributionTotal(
  distribution: Record<ReviewRating, number>
): number {
  return (
    distribution[1] +
    distribution[2] +
    distribution[3] +
    distribution[4] +
    distribution[5]
  );
}

export function getRatingPercentage(
  distribution: Record<ReviewRating, number>,
  rating: ReviewRating
): number {
  const total = getRatingDistributionTotal(distribution);

  if (total <= 0) {
    return 0;
  }

  return Number(
    ((distribution[rating] / total) * 100).toFixed(2)
  );
}

export const REVIEW_DEFAULT_RATING_DISTRIBUTION =
  createEmptyRatingDistribution();

export const REVIEW_RATING_WEIGHTS = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
} as const;

export const REVIEW_NOTIFICATION_EVENTS = {
  NEW_REVIEW: "new_review",
  REVIEW_APPROVED: "review_approved",
  REVIEW_REJECTED: "review_rejected",
  REVIEW_REPLY: "review_reply",
  REVIEW_REACTION: "review_reaction",
  REVIEW_REPORT: "review_report",
  REVIEW_MENTION: "review_mention",
} as const;

export type ReviewNotificationEvent =
  (typeof REVIEW_NOTIFICATION_EVENTS)[keyof typeof REVIEW_NOTIFICATION_EVENTS];

export const REVIEW_SEARCH_FIELDS = [
  "title",
  "text",
  "author_name",
  "publication_title",
  "profile_name",
] as const;

export type ReviewSearchField =
  (typeof REVIEW_SEARCH_FIELDS)[number];

export const REVIEW_FILTERS = {
  STATUS: "status",
  RATING: "rating",
  TARGET_TYPE: "target_type",
  TARGET_ID: "target_id",
  AUTHOR_ID: "author_id",
  AUTHOR_MODE: "author_mode",
  VERIFIED: "verified",
  FEATURED: "featured",
  PINNED: "pinned",
  HAS_REPLIES: "has_replies",
  HAS_REPORTS: "has_reports",
  CREATED_FROM: "created_from",
  CREATED_TO: "created_to",
  UPDATED_FROM: "updated_from",
  UPDATED_TO: "updated_to",
  SEARCH: "search",
} as const;

export type ReviewFilter =
  (typeof REVIEW_FILTERS)[keyof typeof REVIEW_FILTERS];

export const REVIEW_COUNTER_FIELDS = {
  VIEWS: "views_count",
  HELPFUL: "helpful_count",
  NOT_HELPFUL: "not_helpful_count",
  REACTIONS: "reactions_count",
  REPORTS: "reports_count",
  REPLIES: "replies_count",
  SHARES: "shares_count",
} as const;

export type ReviewCounterField =
  (typeof REVIEW_COUNTER_FIELDS)[keyof typeof REVIEW_COUNTER_FIELDS];

export const REVIEW_EDITABLE_ADMIN_FIELDS = [
  "title",
  "text",
  "rating",
  "status",
  "visibility",
  "author_mode",
  "author_id",
  "author_name",
  "verified",
  "featured",
  "pinned",
  "created_at",
  "updated_at",
  "views_count",
  "helpful_count",
  "not_helpful_count",
  "reactions_count",
  "reports_count",
  "replies_count",
  "shares_count",
] as const;

export type ReviewEditableAdminField =
  (typeof REVIEW_EDITABLE_ADMIN_FIELDS)[number];

export const REVIEW_HISTORY_ACTIONS = {
  CREATED: "created",
  EDITED: "edited",
  STATUS_CHANGED: "status_changed",
  RATING_CHANGED: "rating_changed",
  AUTHOR_CHANGED: "author_changed",
  VISIBILITY_CHANGED: "visibility_changed",
  COUNTER_CHANGED: "counter_changed",
  REACTION_CHANGED: "reaction_changed",
  MODERATION: "moderation",
  RESTORED: "restored",
  DELETED: "deleted",
} as const;

export type ReviewHistoryAction =
  (typeof REVIEW_HISTORY_ACTIONS)[keyof typeof REVIEW_HISTORY_ACTIONS];

export const REVIEW_BULK_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  HIDE: "hide",
  SHOW: "show",
  DELETE: "delete",
  RESTORE: "restore",
  ARCHIVE: "archive",
  PIN: "pin",
  UNPIN: "unpin",
  FEATURE: "feature",
  UNFEATURE: "unfeature",
  VERIFY: "verify",
  UNVERIFY: "unverify",
} as const;

export type ReviewBulkAction =
  (typeof REVIEW_BULK_ACTIONS)[keyof typeof REVIEW_BULK_ACTIONS];

export const REVIEW_EXPORT_FIELDS = [
  "id",
  "target_type",
  "target_id",
  "author_id",
  "author_name",
  "author_mode",
  "title",
  "text",
  "rating",
  "status",
  "visibility",
  "verified",
  "featured",
  "pinned",
  "helpful_count",
  "not_helpful_count",
  "reactions_count",
  "reports_count",
  "replies_count",
  "created_at",
  "updated_at",
] as const;

export function isReviewMetric(
  value: unknown
): value is ReviewMetric {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_METRICS).includes(
      value as ReviewMetric
    )
  );
}

export function isReviewAction(
  value: unknown
): value is ReviewAction {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_ACTIONS).includes(
      value as ReviewAction
    )
  );
}

export function isReviewAdminAction(
  value: unknown
): value is ReviewAdminAction {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_ADMIN_ACTIONS).includes(
      value as ReviewAdminAction
    )
  );
}

export function isReviewPermission(
  value: unknown
): value is ReviewPermission {
  return (
    typeof value === "string" &&
    Object.values(REVIEW_PERMISSIONS).includes(
      value as ReviewPermission
    )
  );
  }
