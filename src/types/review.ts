// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// REVIEW SYSTEM TYPES
// ============================================================

export type ReviewId = string;
export type ReviewReplyId = string;
export type ReviewReportId = string;
export type ReviewHistoryId = string;
export type ReviewMetricId = string;

export type DecimalString = string;

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
  | "unlisted"
  | "hidden";

export type ReviewAuthorMode =
  | "public"
  | "anonymous"
  | "hidden";

export type ReviewTargetType =
  | "publication"
  | "profile"
  | "organization"
  | "user"
  | "company"
  | "service"
  | "event"
  | "course"
  | "opportunity"
  | "other";

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewReactionType =
  | "like"
  | "love"
  | "useful"
  | "support"
  | "interesting"
  | "congratulations"
  | "sad"
  | "angry"
  | "wow"
  | "celebrate"
  | "thanks";

export type ReviewReportType =
  | "spam"
  | "abuse"
  | "harassment"
  | "hate"
  | "false_information"
  | "advertisement"
  | "personal_data"
  | "copyright"
  | "off_topic"
  | "duplicate"
  | "fake_review"
  | "manipulated_rating"
  | "other";

export type ReviewReportStatus =
  | "open"
  | "under_review"
  | "resolved"
  | "rejected"
  | "dismissed"
  | "escalated";

export type ReviewReportPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export type ReviewActorType =
  | "user"
  | "visitor"
  | "admin"
  | "moderator"
  | "system"
  | "api"
  | "import"
  | "migration";

export type ReviewSourceType =
  | "website"
  | "admin"
  | "import"
  | "api"
  | "migration"
  | "system";

export type ReviewHistoryAction =
  | "created"
  | "edited"
  | "status_changed"
  | "rating_changed"
  | "author_changed"
  | "visibility_changed"
  | "counter_changed"
  | "reaction_changed"
  | "moderation"
  | "restored"
  | "deleted";

export type ReviewMetricOperation =
  | "set"
  | "increment"
  | "decrement"
  | "recalculate"
  | "reset";

export type ReviewModerationQueueStatus =
  | "pending"
  | "assigned"
  | "processing"
  | "approved"
  | "rejected"
  | "dismissed";

export type ReviewLockType =
  | "moderation"
  | "editing"
  | "investigation"
  | "report";

export interface Review {
  id: ReviewId;

  target_type: ReviewTargetType;
  target_id: string;

  author_id: string | null;
  visitor_id: string | null;
  session_id: string | null;

  author_mode: ReviewAuthorMode;
  author_name: string | null;

  title: string | null;
  text: string;

  rating: ReviewRating;

  status: ReviewStatus;
  visibility: ReviewVisibility;

  verified: boolean;
  admin_verified: boolean;

  featured: boolean;
  pinned: boolean;
  locked: boolean;

  /*
   * Все счётчики — DecimalString.
   *
   * Это принципиально важно:
   * SQLite INTEGER ограничен signed 64-bit,
   * поэтому значения, которые администратор может
   * установить вручную, не должны ограничиваться number.
   */
  views_count: DecimalString;
  helpful_count: DecimalString;
  not_helpful_count: DecimalString;
  reactions_count: DecimalString;
  reports_count: DecimalString;
  replies_count: DecimalString;
  shares_count: DecimalString;

  moderation_reason: string | null;
  moderation_note: string | null;
  moderated_by: string | null;
  moderated_at: string | null;

  verified_by: string | null;
  verified_at: string | null;

  deleted_by: string | null;
  deleted_at: string | null;

  restored_by: string | null;
  restored_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface ReviewWithDetails extends Review {
  target?: {
    id: string;
    type: ReviewTargetType;
    title?: string | null;
    name?: string | null;
  };

  author?: {
    id: string;
    name: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;

  rating_label?: string;
  rating_stars?: string;

  replies?: ReviewReply[];

  reactions?: ReviewReactionSummary;

  reports?: ReviewReport[];

  metrics?: ReviewMetrics;

  can_edit?: boolean;
  can_delete?: boolean;
  can_report?: boolean;
  can_reply?: boolean;
  can_react?: boolean;
}

export interface CreateReviewInput {
  target_type: ReviewTargetType;
  target_id: string;

  author_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  author_mode?: ReviewAuthorMode;
  author_name?: string | null;

  title?: string | null;
  text: string;

  rating: ReviewRating;

  source?: ReviewSourceType;

  verified?: boolean;
}

export interface UpdateReviewInput {
  title?: string | null;
  text?: string;
  rating?: ReviewRating;

  author_mode?: ReviewAuthorMode;
  author_name?: string | null;

  visibility?: ReviewVisibility;

  verified?: boolean;
  admin_verified?: boolean;

  featured?: boolean;
  pinned?: boolean;
  locked?: boolean;
}

export interface AdminReviewUpdateInput {
  title?: string | null;
  text?: string;
  rating?: ReviewRating;

  status?: ReviewStatus;
  visibility?: ReviewVisibility;

  author_mode?: ReviewAuthorMode;
  author_id?: string | null;
  author_name?: string | null;

  verified?: boolean;
  admin_verified?: boolean;

  featured?: boolean;
  pinned?: boolean;
  locked?: boolean;

  created_at?: string;
  updated_at?: string;

  views_count?: DecimalString;
  helpful_count?: DecimalString;
  not_helpful_count?: DecimalString;
  reactions_count?: DecimalString;
  reports_count?: DecimalString;
  replies_count?: DecimalString;
  shares_count?: DecimalString;

  moderation_reason?: string | null;
  moderation_note?: string | null;
}

export interface ReviewReply {
  id: ReviewReplyId;

  review_id: ReviewId;
  parent_reply_id: ReviewReplyId | null;

  author_id: string | null;
  visitor_id: string | null;
  session_id: string | null;

  author_mode: ReviewAuthorMode;
  author_name: string | null;

  text: string;

  status: ReviewStatus;
  visibility: ReviewVisibility;

  verified: boolean;

  reactions_count: DecimalString;
  reports_count: DecimalString;
  replies_count: DecimalString;
  views_count: DecimalString;

  locked: boolean;

  moderated_by: string | null;
  moderated_at: string | null;
  moderation_reason: string | null;

  deleted_by: string | null;
  deleted_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateReviewReplyInput {
  review_id: ReviewId;

  parent_reply_id?: ReviewReplyId | null;

  author_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  author_mode?: ReviewAuthorMode;
  author_name?: string | null;

  text: string;

  source?: ReviewSourceType;
}

export interface UpdateReviewReplyInput {
  text?: string;

  author_mode?: ReviewAuthorMode;
  author_name?: string | null;

  visibility?: ReviewVisibility;
  verified?: boolean;
  locked?: boolean;
}

export interface ReviewReaction {
  id: string;

  review_id: ReviewId | null;
  reply_id: ReviewReplyId | null;

  reaction_type: ReviewReactionType;

  user_id: string | null;
  visitor_id: string | null;
  session_id: string | null;

  actor_name: string | null;

  created_at: string;
  updated_at: string;
}

export interface ReviewReactionSummaryItem {
  reaction_type: ReviewReactionType;
  count: DecimalString;
  reacted_by_current_actor?: boolean;
}

export interface ReviewReactionSummary {
  total: DecimalString;
  items: ReviewReactionSummaryItem[];
}

export interface AddReviewReactionInput {
  review_id?: ReviewId;
  reply_id?: ReviewReplyId;

  reaction_type: ReviewReactionType;

  user_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  actor_name?: string | null;
}

export interface ReviewReport {
  id: ReviewReportId;

  review_id: ReviewId | null;
  reply_id: ReviewReplyId | null;

  reporter_id: string | null;
  reporter_visitor_id: string | null;
  reporter_session_id: string | null;

  report_type: ReviewReportType;
  priority: ReviewReportPriority;

  status: ReviewReportStatus;

  reason: string | null;
  description: string | null;

  assigned_to: string | null;

  resolution: string | null;
  resolution_note: string | null;

  resolved_by: string | null;
  resolved_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateReviewReportInput {
  review_id?: ReviewId;
  reply_id?: ReviewReplyId;

  reporter_id?: string | null;
  reporter_visitor_id?: string | null;
  reporter_session_id?: string | null;

  report_type: ReviewReportType;
  priority?: ReviewReportPriority;

  reason?: string | null;
  description?: string | null;
}

export interface UpdateReviewReportInput {
  status?: ReviewReportStatus;
  priority?: ReviewReportPriority;

  assigned_to?: string | null;

  resolution?: string | null;
  resolution_note?: string | null;
}

export interface ReviewHistory {
  id: ReviewHistoryId;

  review_id: ReviewId;

  action: ReviewHistoryAction;

  actor_type: ReviewActorType;
  actor_id: string | null;

  field_name: string | null;

  old_value: string | null;
  new_value: string | null;

  reason: string | null;
  note: string | null;

  metadata: Record<string, unknown> | null;

  created_at: string;
}

export interface ReviewMetricHistory {
  id: string;

  target_type: ReviewTargetType;
  target_id: string;

  metric_name: string;

  old_value: DecimalString | null;
  new_value: DecimalString | null;

  operation: ReviewMetricOperation;

  actor_type: ReviewActorType;
  actor_id: string | null;

  reason: string | null;
  note: string | null;

  created_at: string;
}

export interface ReviewMetrics {
  id: ReviewMetricId;

  target_type: ReviewTargetType;
  target_id: string;

  total_reviews: DecimalString;
  published_reviews: DecimalString;
  pending_reviews: DecimalString;
  hidden_reviews: DecimalString;
  rejected_reviews: DecimalString;
  deleted_reviews: DecimalString;

  total_ratings: DecimalString;
  rating_sum: DecimalString;

  rating_average: DecimalString;

  rating_1: DecimalString;
  rating_2: DecimalString;
  rating_3: DecimalString;
  rating_4: DecimalString;
  rating_5: DecimalString;

  total_reactions: DecimalString;
  total_helpful: DecimalString;
  total_not_helpful: DecimalString;

  total_reports: DecimalString;
  total_replies: DecimalString;
  total_views: DecimalString;

  verified_reviews: DecimalString;
  anonymous_reviews: DecimalString;
  featured_reviews: DecimalString;
  pinned_reviews: DecimalString;

  shares_count: DecimalString;

  created_at: string;
  updated_at: string;
}

export interface ReviewRatingDistribution {
  1: DecimalString;
  2: DecimalString;
  3: DecimalString;
  4: DecimalString;
  5: DecimalString;
}

export interface ReviewRatingSummary {
  average: DecimalString;
  total: DecimalString;
  sum: DecimalString;

  distribution: ReviewRatingDistribution;

  percentages: {
    1: DecimalString;
    2: DecimalString;
    3: DecimalString;
    4: DecimalString;
    5: DecimalString;
  };
}

export interface ReviewView {
  id: string;

  review_id: ReviewId;

  visitor_id: string | null;
  session_id: string | null;
  user_id: string | null;

  ip_hash: string | null;
  user_agent_hash: string | null;

  created_at: string;
}

export interface ReviewShare {
  id: string;

  review_id: ReviewId;

  user_id: string | null;
  visitor_id: string | null;
  session_id: string | null;

  platform: string | null;
  source: string | null;

  created_at: string;
}

export interface ReviewMention {
  id: string;

  review_id: ReviewId | null;
  reply_id: ReviewReplyId | null;

  mentioned_user_id: string | null;
  mentioned_name: string | null;

  created_at: string;
}

export interface ReviewAdminLock {
  id: string;

  review_id: ReviewId;

  admin_id: string;

  lock_type: ReviewLockType;

  locked_at: string;
  expires_at: string | null;
}

export interface ReviewModerationQueueItem {
  id: string;

  review_id: ReviewId;

  priority: ReviewReportPriority;

  reason: string | null;

  assigned_to: string | null;

  status: ReviewModerationQueueStatus;

  created_at: string;
  updated_at: string;
}

export interface ReviewListFilters {
  status?: ReviewStatus | ReviewStatus[];
  rating?: ReviewRating | ReviewRating[];

  target_type?: ReviewTargetType;
  target_id?: string;

  author_id?: string;
  author_mode?: ReviewAuthorMode;

  verified?: boolean;
  featured?: boolean;
  pinned?: boolean;

  has_replies?: boolean;
  has_reports?: boolean;

  created_from?: string;
  created_to?: string;

  updated_from?: string;
  updated_to?: string;

  search?: string;
}

export type ReviewSort =
  | "newest"
  | "oldest"
  | "highest_rating"
  | "lowest_rating"
  | "most_helpful"
  | "most_reactions"
  | "most_reported"
  | "most_discussion"
  | "featured"
  | "pinned";

export type ReviewSortDirection = "asc" | "desc";

export interface ReviewListOptions {
  filters?: ReviewListFilters;

  sort?: ReviewSort;
  direction?: ReviewSortDirection;

  page?: number;
  limit?: number;
}

export interface ReviewPagination {
  page: number;
  limit: number;
  total: DecimalString;
  total_pages: DecimalString;

  has_previous: boolean;
  has_next: boolean;
}

export interface ReviewListResult {
  items: ReviewWithDetails[];

  pagination: ReviewPagination;

  rating_summary?: ReviewRatingSummary;
}

export interface ReviewModerationInput {
  review_id: ReviewId;

  status: ReviewStatus;

  reason?: string | null;
  note?: string | null;

  admin_id: string;
}

export interface ReviewCounterUpdate {
  review_id: ReviewId;

  field:
    | "views_count"
    | "helpful_count"
    | "not_helpful_count"
    | "reactions_count"
    | "reports_count"
    | "replies_count"
    | "shares_count";

  value: DecimalString;

  operation?: ReviewMetricOperation;

  reason?: string | null;
  note?: string | null;

  admin_id: string;
}

export interface ReviewRatingUpdate {
  review_id: ReviewId;

  rating: ReviewRating;

  reason?: string | null;
  note?: string | null;

  admin_id: string;
}

export interface ReviewAuthorUpdate {
  review_id: ReviewId;

  author_id?: string | null;
  author_name?: string | null;
  author_mode?: ReviewAuthorMode;

  reason?: string | null;
  note?: string | null;

  admin_id: string;
}

export interface ReviewBulkActionInput {
  review_ids: ReviewId[];

  action:
    | "approve"
    | "reject"
    | "hide"
    | "show"
    | "delete"
    | "restore"
    | "archive"
    | "pin"
    | "unpin"
    | "feature"
    | "unfeature"
    | "verify"
    | "unverify";

  reason?: string | null;
  note?: string | null;

  admin_id: string;
}

export interface ReviewAdminActionResult {
  success: boolean;

  review_id?: ReviewId;

  action: string;

  previous_status?: ReviewStatus;
  new_status?: ReviewStatus;

  affected_count?: DecimalString;

  message?: string;

  errors?: Array<{
    review_id?: ReviewId;
    code: string;
    message: string;
  }>;
}

export interface ReviewValidationResult {
  valid: boolean;

  errors: Array<{
    field: string;
    code: string;
    message: string;
  }>;

  warnings: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

export interface ReviewPermissionContext {
  user_id?: string | null;
  admin_id?: string | null;

  permissions: string[];

  is_superadmin?: boolean;
  is_admin?: boolean;
  is_moderator?: boolean;
}

export interface ReviewActorContext {
  actor_type: ReviewActorType;

  actor_id?: string | null;

  user_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  ip_hash?: string | null;
  user_agent_hash?: string | null;
}

export interface ReviewEvent {
  id: string;

  review_id: ReviewId;

  event_type: string;

  actor_type: ReviewActorType;
  actor_id: string | null;

  metadata: Record<string, unknown> | null;

  created_at: string;
}

export interface ReviewNotificationPayload {
  event:
    | "new_review"
    | "review_approved"
    | "review_rejected"
    | "review_reply"
    | "review_reaction"
    | "review_report"
    | "review_mention";

  review_id: ReviewId;

  target_id: string;

  actor_id?: string | null;

  message?: string;

  metadata?: Record<string, unknown>;
}

export interface ReviewExportRecord {
  id: string;

  target_type: ReviewTargetType;
  target_id: string;

  author_id: string | null;
  author_name: string | null;
  author_mode: ReviewAuthorMode;

  title: string | null;
  text: string;

  rating: ReviewRating;

  status: ReviewStatus;
  visibility: ReviewVisibility;

  verified: boolean;
  featured: boolean;
  pinned: boolean;

  helpful_count: DecimalString;
  not_helpful_count: DecimalString;
  reactions_count: DecimalString;
  reports_count: DecimalString;
  replies_count: DecimalString;

  created_at: string;
  updated_at: string;
}

export const REVIEW_RATINGS: readonly ReviewRating[] = [
  1,
  2,
  3,
  4,
  5,
];

export function isReviewRating(
  value: unknown
): value is ReviewRating {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export function normalizeReviewRating(
  value: unknown
): ReviewRating {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 5;
  }

  const rounded = Math.round(numberValue);

  if (rounded <= 1) {
    return 1;
  }

  if (rounded >= 5) {
    return 5;
  }

  return rounded as ReviewRating;
}

export function reviewRatingStars(
  rating: ReviewRating
): string {
  return (
    "★".repeat(rating) +
    "☆".repeat(5 - rating)
  );
}

export function isReviewPublic(
  review: Pick<Review, "status" | "visibility">
): boolean {
  return (
    review.status === "published" &&
    review.visibility === "public"
  );
}

export function isReviewDeleted(
  review: Pick<Review, "status">
): boolean {
  return review.status === "deleted";
}

export function isReviewEditable(
  review: Pick<Review, "status" | "locked">
): boolean {
  return (
    review.status !== "deleted" &&
    review.status !== "archived" &&
    !review.locked
  );
}

export function isReviewModeratable(
  review: Pick<Review, "status">
): boolean {
  return review.status !== "deleted";
}

export function createEmptyRatingDistribution(): ReviewRatingDistribution {
  return {
    1: "0",
    2: "0",
    3: "0",
    4: "0",
    5: "0",
  };
}
