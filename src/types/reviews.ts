import type {
  ReviewAuthorMode,
  ReviewRating,
  ReviewSource,
  ReviewStatusValue,
  ReviewTargetType,
  ReviewVerificationType,
  ReviewReportType,
  ReviewReportPriority,
  ReviewSort,
  ReviewType,
  ReviewMetric,
} from "../constants/reviews";

import type { DecimalString } from "../utils/number";

export type ReviewID = string;
export type ReviewHistoryID = string;
export type ReviewReportID = string;
export type ReviewReactionID = string;
export type ReviewReplyID = string;

export interface Review {
  id: ReviewID;

  target_type: ReviewTargetType;
  target_id: string;

  publication_id?: string | null;
  profile_id?: string | null;
  organization_id?: string | null;

  author_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  author_name?: string | null;
  author_mode: ReviewAuthorMode;

  type: ReviewType;
  source: ReviewSource;

  rating: ReviewRating;

  title?: string | null;
  text: string;

  status: ReviewStatusValue;

  verification_type: ReviewVerificationType;
  verified: boolean;

  helpful_count: DecimalString;
  not_helpful_count: DecimalString;

  reactions_count: DecimalString;
  replies_count: DecimalString;
  reports_count: DecimalString;
  views_count: DecimalString;

  pinned: boolean;
  featured: boolean;
  locked: boolean;

  moderation_reason?: string | null;
  rejection_reason?: string | null;

  moderated_by?: string | null;
  moderated_at?: string | null;

  published_at?: string | null;

  edited_at?: string | null;
  deleted_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface ReviewCreateInput {
  target_type: ReviewTargetType;
  target_id: string;

  publication_id?: string | null;
  profile_id?: string | null;
  organization_id?: string | null;

  author_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  author_name?: string | null;
  author_mode?: ReviewAuthorMode;

  type?: ReviewType;
  source?: ReviewSource;

  rating: ReviewRating;

  title?: string | null;
  text: string;

  status?: ReviewStatusValue;

  verification_type?: ReviewVerificationType;
  verified?: boolean;
}

export interface ReviewUpdateInput {
  rating?: ReviewRating;
  title?: string | null;
  text?: string;

  author_name?: string | null;
  author_mode?: ReviewAuthorMode;

  verification_type?: ReviewVerificationType;
  verified?: boolean;

  status?: ReviewStatusValue;

  moderation_reason?: string | null;
  rejection_reason?: string | null;

  pinned?: boolean;
  featured?: boolean;
  locked?: boolean;
}

export interface ReviewAdminUpdateInput
  extends ReviewUpdateInput {
  helpful_count?: DecimalString | number | bigint;
  not_helpful_count?: DecimalString | number | bigint;
  reactions_count?: DecimalString | number | bigint;
  replies_count?: DecimalString | number | bigint;
  reports_count?: DecimalString | number | bigint;
  views_count?: DecimalString | number | bigint;
}

export interface ReviewHistory {
  id: ReviewHistoryID;

  review_id: ReviewID;

  action: string;

  old_status?: ReviewStatusValue | null;
  new_status?: ReviewStatusValue | null;

  old_rating?: ReviewRating | null;
  new_rating?: ReviewRating | null;

  old_title?: string | null;
  new_title?: string | null;

  old_text?: string | null;
  new_text?: string | null;

  changed_fields?: string | null;

  reason?: string | null;

  actor_id?: string | null;
  actor_type?: "user" | "admin" | "system";

  metadata?: string | null;

  created_at: string;
}

export interface ReviewReaction {
  id: ReviewReactionID;

  review_id: ReviewID;

  reaction_type_id: string;
  reaction_type?: string | null;

  user_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  created_at: string;
  updated_at?: string | null;
}

export interface ReviewReport {
  id: ReviewReportID;

  review_id: ReviewID;

  reporter_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  type: ReviewReportType;
  priority: ReviewReportPriority;

  reason?: string | null;
  details?: string | null;

  status:
    | "pending"
    | "reviewing"
    | "resolved"
    | "dismissed"
    | "rejected";

  handled_by?: string | null;
  handled_at?: string | null;

  resolution?: string | null;

  created_at: string;
  updated_at: string;
}

export interface ReviewReply {
  id: ReviewReplyID;

  review_id: ReviewID;

  author_id?: string | null;
  visitor_id?: string | null;

  author_name?: string | null;
  author_mode: ReviewAuthorMode;

  text: string;

  status:
    | "pending"
    | "published"
    | "hidden"
    | "rejected"
    | "deleted";

  reactions_count: DecimalString;
  reports_count: DecimalString;

  pinned: boolean;

  created_at: string;
  updated_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
}

export interface ReviewMetricRecord {
  id: string;

  review_id?: ReviewID | null;

  target_type?: ReviewTargetType | null;
  target_id?: string | null;

  metric: ReviewMetric;

  value: DecimalString;

  period_start?: string | null;
  period_end?: string | null;

  created_at: string;
  updated_at: string;
}

export interface ReviewRatingDistribution {
  one: DecimalString;
  two: DecimalString;
  three: DecimalString;
  four: DecimalString;
  five: DecimalString;
}

export interface ReviewRatingSummary {
  count: DecimalString;

  average: DecimalString;

  sum: DecimalString;

  distribution: ReviewRatingDistribution;

  one_star: DecimalString;
  two_star: DecimalString;
  three_star: DecimalString;
  four_star: DecimalString;
  five_star: DecimalString;
}

export interface ReviewMetrics {
  reviews: DecimalString;
  ratings: DecimalString;

  rating_sum: DecimalString;
  rating_average: DecimalString;

  rating_1: DecimalString;
  rating_2: DecimalString;
  rating_3: DecimalString;
  rating_4: DecimalString;
  rating_5: DecimalString;

  helpful: DecimalString;
  not_helpful: DecimalString;

  reactions: DecimalString;
  replies: DecimalString;
  reports: DecimalString;
  views: DecimalString;
}

export interface ReviewTargetSummary {
  target_type: ReviewTargetType;
  target_id: string;

  reviews_count: DecimalString;
  ratings_count: DecimalString;

  rating_average: DecimalString;
  rating_sum: DecimalString;

  distribution: ReviewRatingDistribution;

  verified_reviews_count: DecimalString;

  helpful_count: DecimalString;
  reactions_count: DecimalString;
  replies_count: DecimalString;
  reports_count: DecimalString;
}

export interface ReviewFilters {
  target_type?: ReviewTargetType;
  target_id?: string;

  publication_id?: string;
  profile_id?: string;
  organization_id?: string;

  author_id?: string;
  visitor_id?: string;

  status?: ReviewStatusValue | ReviewStatusValue[];

  rating?: ReviewRating | ReviewRating[];

  min_rating?: ReviewRating;
  max_rating?: ReviewRating;

  verified?: boolean;

  author_mode?: ReviewAuthorMode;

  type?: ReviewType;
  source?: ReviewSource;

  pinned?: boolean;
  featured?: boolean;
  locked?: boolean;

  search?: string;

  created_from?: string;
  created_to?: string;

  updated_from?: string;
  updated_to?: string;

  has_reports?: boolean;
  has_replies?: boolean;
  has_reactions?: boolean;
}

export interface ReviewSortOptions {
  sort?: ReviewSort;
  direction?: "asc" | "desc";
}

export interface ReviewPagination {
  page: number;
  limit: number;

  total: DecimalString;
  total_pages: DecimalString;

  has_next: boolean;
  has_previous: boolean;
}

export interface ReviewListResult {
  reviews: Review[];
  pagination: ReviewPagination;
  filters?: ReviewFilters;
  sort?: ReviewSortOptions;
}

export interface ReviewDetails extends Review {
  history?: ReviewHistory[];
  reactions?: ReviewReaction[];
  replies?: ReviewReply[];
  reports?: ReviewReport[];
  metrics?: ReviewMetrics;
}

export interface ReviewCreateResult {
  review: Review;
  created: boolean;
  moderation_required: boolean;
}

export interface ReviewUpdateResult {
  review: Review;
  changed_fields: string[];
}

export interface ReviewModerationResult {
  review: Review;

  action: string;

  previous_status: ReviewStatusValue;
  new_status: ReviewStatusValue;

  changed_by?: string | null;
  reason?: string | null;
}

export interface ReviewReactionResult {
  reaction?: ReviewReaction | null;

  added: boolean;
  removed: boolean;

  reactions_count: DecimalString;
}

export interface ReviewReportResult {
  report: ReviewReport;

  created: boolean;

  review_status?: ReviewStatusValue;
}

export interface ReviewHelpfulResult {
  helpful: boolean;
  not_helpful: boolean;

  helpful_count: DecimalString;
  not_helpful_count: DecimalString;
}

export interface ReviewRatingChange {
  review_id: ReviewID;

  old_rating: ReviewRating;
  new_rating: ReviewRating;

  changed_by?: string | null;
  reason?: string | null;
}

export interface ReviewCounterChange {
  review_id: ReviewID;

  counter:
    | "helpful_count"
    | "not_helpful_count"
    | "reactions_count"
    | "replies_count"
    | "reports_count"
    | "views_count";

  old_value: DecimalString;
  new_value: DecimalString;

  delta?: DecimalString;

  changed_by?: string | null;
  reason?: string | null;
}

export interface ReviewBulkAction {
  review_ids: ReviewID[];

  action:
    | "approve"
    | "reject"
    | "hide"
    | "unhide"
    | "delete"
    | "restore"
    | "mark_spam"
    | "unmark_spam"
    | "pin"
    | "unpin"
    | "feature"
    | "unfeature"
    | "lock"
    | "unlock";

  reason?: string;
}

export interface ReviewBulkResult {
  requested: number;
  processed: number;
  succeeded: number;
  failed: number;

  successful_ids: ReviewID[];
  failed_ids: ReviewID[];

  errors: Array<{
    review_id: ReviewID;
    code: string;
    message: string;
  }>;
}

export interface ReviewAdminStatistics {
  total: DecimalString;

  pending: DecimalString;
  published: DecimalString;
  hidden: DecimalString;
  rejected: DecimalString;
  deleted: DecimalString;
  spam: DecimalString;

  verified: DecimalString;

  average_rating: DecimalString;

  rating_distribution: ReviewRatingDistribution;

  reports: DecimalString;
  reactions: DecimalString;
  replies: DecimalString;

  helpful: DecimalString;
  not_helpful: DecimalString;
}

export interface ReviewPermissionContext {
  admin_id?: string;
  user_id?: string;

  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;

  can_moderate: boolean;
  can_reply: boolean;
  can_react: boolean;
  can_report: boolean;

  can_manage_metrics: boolean;
  can_manage_counters: boolean;

  can_pin: boolean;
  can_feature: boolean;

  can_view_history: boolean;
  can_export: boolean;
  can_import: boolean;
}

export interface ReviewQuery {
  filters?: ReviewFilters;
  sort?: ReviewSortOptions;

  page?: number;
  limit?: number;

  include_reactions?: boolean;
  include_replies?: boolean;
  include_reports?: boolean;
  include_history?: boolean;
  include_metrics?: boolean;
}

export interface ReviewAggregateQuery {
  target_type: ReviewTargetType;
  target_id: string;

  statuses?: ReviewStatusValue[];

  verified_only?: boolean;

  min_rating?: ReviewRating;
  max_rating?: ReviewRating;
}

export interface ReviewAggregateResult {
  target_type: ReviewTargetType;
  target_id: string;

  summary: ReviewRatingSummary;

  metrics: ReviewMetrics;
}

export interface ReviewDuplicateCheck {
  exists: boolean;

  review_id?: ReviewID | null;

  target_type: ReviewTargetType;
  target_id: string;

  visitor_id?: string | null;
  session_id?: string | null;
  author_id?: string | null;
}

export interface ReviewModerationQueueItem {
  review: Review;

  reports_count: DecimalString;

  latest_report?: ReviewReport | null;

  risk_score?: number;

  priority: ReviewReportPriority;

  age_seconds?: DecimalString;
}

export interface ReviewModerationQueue {
  items: ReviewModerationQueueItem[];

  pagination: ReviewPagination;

  pending_count: DecimalString;

  urgent_count: DecimalString;
  high_priority_count: DecimalString;
}

export interface ReviewNotificationPayload {
  review_id: ReviewID;

  target_type: ReviewTargetType;
  target_id: string;

  author_id?: string | null;

  event:
    | "created"
    | "approved"
    | "rejected"
    | "hidden"
    | "reply"
    | "reaction"
    | "report"
    | "rating_changed";

  message?: string;
}

export interface ReviewExportOptions {
  filters?: ReviewFilters;

  fields?: string[];

  format?: "json" | "csv";

  include_history?: boolean;
  include_reports?: boolean;
  include_reactions?: boolean;
  include_replies?: boolean;
}

export interface ReviewImportRecord {
  id?: string;

  target_type: ReviewTargetType;
  target_id: string;

  publication_id?: string | null;

  author_id?: string | null;
  author_name?: string | null;

  author_mode?: ReviewAuthorMode;

  rating: ReviewRating;

  title?: string | null;
  text: string;

  status?: ReviewStatusValue;

  verified?: boolean;
  verification_type?: ReviewVerificationType;

  created_at?: string;
}

export interface ReviewImportResult {
  total: number;
  imported: number;
  skipped: number;
  failed: number;

  imported_ids: ReviewID[];

  errors: Array<{
    row: number;
    code: string;
    message: string;
  }>;
}

export interface ReviewEvent {
  id: string;

  review_id: ReviewID;

  event:
    | "created"
    | "updated"
    | "published"
    | "hidden"
    | "deleted"
    | "restored"
    | "reported"
    | "reaction_added"
    | "reaction_removed"
    | "reply_added"
    | "rating_changed"
    | "counter_changed";

  actor_id?: string | null;
  actor_type?: "user" | "admin" | "system";

  metadata?: Record<string, unknown> | null;

  created_at: string;
}
