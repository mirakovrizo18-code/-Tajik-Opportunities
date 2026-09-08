import type { Env } from "../index";
import { createDatabase, type Database } from "../db/index";
import {
  REVIEW_DEFAULTS,
  REVIEW_LIMITS,
  REVIEW_RATINGS,
  REVIEW_SORT_FIELD_MAP,
  REVIEW_STATUSES,
  REVIEW_PUBLIC_STATUSES,
  REVIEW_TARGET_TYPES,
  REVIEW_AUTHOR_MODES,
  REVIEW_SOURCES,
  REVIEW_VERIFICATION_TYPES,
  REVIEW_MODERATION_ACTIONS,
  REVIEW_HISTORY_ACTIONS,
  REVIEW_REPORT_TYPES,
  REVIEW_REPORT_PRIORITIES,
  REVIEW_SORTS,
  isValidReviewRating,
  isValidReviewStatus,
  isValidReviewTargetType,
  isValidReviewAuthorMode,
  isValidReviewSource,
  isValidReviewVerificationType,
  isValidReviewSort,
  isReviewPublic,
  canTransitionReviewStatus,
  normalizeReviewRating,
  calculateRatingAverage,
  createEmptyRatingDistribution,
  type ReviewRating,
  type ReviewStatusValue,
  type ReviewTargetType,
  type ReviewAuthorMode,
  type ReviewSource,
  type ReviewVerificationType,
  type ReviewSort,
} from "../constants/reviews";

import type {
  Review,
  ReviewCreateInput,
  ReviewUpdateInput,
  ReviewAdminUpdateInput,
  ReviewHistory,
  ReviewReaction,
  ReviewReport,
  ReviewReply,
  ReviewMetrics,
  ReviewRatingDistribution,
  ReviewRatingSummary,
  ReviewFilters,
  ReviewQuery,
  ReviewListResult,
  ReviewDetails,
  ReviewCreateResult,
  ReviewUpdateResult,
  ReviewModerationResult,
  ReviewReactionResult,
  ReviewReportResult,
  ReviewHelpfulResult,
  ReviewAggregateResult,
  ReviewDuplicateCheck,
  ReviewBulkAction,
  ReviewBulkResult,
  ReviewAdminStatistics,
  ReviewCounterChange,
  ReviewRatingChange,
} from "../types/reviews";

import {
  addMetric,
  subtractMetric,
  compareDecimalStrings,
  metricToString,
} from "../utils/number";

import {
  createReviewId,
  createReviewHistoryId,
  createReviewReactionId,
  createReviewReportId,
  createReviewReplyId,
  createId,
} from "../utils/id";

import {
  validateString,
  validateId,
  validateInteger,
  validateRequiredFields,
} from "../utils/validation";

import {
  ReviewError,
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  DatabaseError,
} from "../utils/error";

import {
  logAdminAction,
} from "../utils/logger";

import {
  DEFAULT_REACTIONS,
} from "../constants/reactions";


type ActorType = "user" | "admin" | "system";

interface ReviewActor {
  id?: string | null;
  type?: ActorType;
}

interface ReviewServiceOptions {
  db?: Database;
  now?: () => string;
}

interface ReviewQueryRow {
  id: string;
  target_type: string;
  target_id: string;

  publication_id?: string | null;
  profile_id?: string | null;
  organization_id?: string | null;

  author_id?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;

  author_name?: string | null;
  author_mode: string;

  type: string;
  source: string;

  rating: number;

  title?: string | null;
  text: string;

  status: string;

  verification_type: string;
  verified: number;

  helpful_count: string;
  not_helpful_count: string;

  reactions_count: string;
  replies_count: string;
  reports_count: string;
  views_count: string;

  pinned: number;
  featured: number;
  locked: number;

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


function nowIso(): string {
  return new Date().toISOString();
}


function bool(value: unknown): boolean {
  return Number(value) === 1 || value === true;
}


function toReview(row: ReviewQueryRow): Review {
  return {
    id: row.id,

    target_type:
      row.target_type as ReviewTargetType,

    target_id: row.target_id,

    publication_id: row.publication_id ?? null,
    profile_id: row.profile_id ?? null,
    organization_id: row.organization_id ?? null,

    author_id: row.author_id ?? null,
    visitor_id: row.visitor_id ?? null,
    session_id: row.session_id ?? null,

    author_name: row.author_name ?? null,
    author_mode:
      row.author_mode as ReviewAuthorMode,

    type: row.type as Review["type"],
    source: row.source as ReviewSource,

    rating: row.rating as ReviewRating,

    title: row.title ?? null,
    text: row.text,

    status:
      row.status as ReviewStatusValue,

    verification_type:
      row.verification_type as ReviewVerificationType,

    verified: bool(row.verified),

    helpful_count:
      metricToString(row.helpful_count),

    not_helpful_count:
      metricToString(row.not_helpful_count),

    reactions_count:
      metricToString(row.reactions_count),

    replies_count:
      metricToString(row.replies_count),

    reports_count:
      metricToString(row.reports_count),

    views_count:
      metricToString(row.views_count),

    pinned: bool(row.pinned),
    featured: bool(row.featured),
    locked: bool(row.locked),

    moderation_reason:
      row.moderation_reason ?? null,

    rejection_reason:
      row.rejection_reason ?? null,

    moderated_by:
      row.moderated_by ?? null,

    moderated_at:
      row.moderated_at ?? null,

    published_at:
      row.published_at ?? null,

    edited_at:
      row.edited_at ?? null,

    deleted_at:
      row.deleted_at ?? null,

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}


function normalizeCounter(
  value: string | number | bigint | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return metricToString(value);
}


function ensureNonNegativeMetric(
  value: string | number | bigint,
): string {
  const normalized = metricToString(value);

  if (normalized.startsWith("-")) {
    throw new ValidationError(
      "Metric value cannot be negative",
    );
  }

  return normalized;
}


function buildWhere(
  filters: ReviewFilters = {},
): {
  sql: string;
  params: unknown[];
} {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.target_type) {
    if (
      !isValidReviewTargetType(
        filters.target_type,
      )
    ) {
      throw new ValidationError(
        "Invalid review target type",
      );
    }

    where.push("r.target_type = ?");
    params.push(filters.target_type);
  }

  if (filters.target_id) {
    where.push("r.target_id = ?");
    params.push(filters.target_id);
  }

  if (filters.publication_id) {
    where.push("r.publication_id = ?");
    params.push(filters.publication_id);
  }

  if (filters.profile_id) {
    where.push("r.profile_id = ?");
    params.push(filters.profile_id);
  }

  if (filters.organization_id) {
    where.push("r.organization_id = ?");
    params.push(filters.organization_id);
  }

  if (filters.author_id) {
    where.push("r.author_id = ?");
    params.push(filters.author_id);
  }

  if (filters.visitor_id) {
    where.push("r.visitor_id = ?");
    params.push(filters.visitor_id);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];

    for (const status of statuses) {
      if (!isValidReviewStatus(status)) {
        throw new ValidationError(
          "Invalid review status",
        );
      }
    }

    if (statuses.length === 1) {
      where.push("r.status = ?");
      params.push(statuses[0]);
    } else if (statuses.length > 1) {
      where.push(
        `r.status IN (${statuses.map(() => "?").join(", ")})`,
      );

      params.push(...statuses);
    }
  }

  if (filters.rating !== undefined) {
    const ratings = Array.isArray(filters.rating)
      ? filters.rating
      : [filters.rating];

    for (const rating of ratings) {
      if (!isValidReviewRating(rating)) {
        throw new ValidationError(
          "Invalid review rating",
        );
      }
    }

    if (ratings.length === 1) {
      where.push("r.rating = ?");
      params.push(ratings[0]);
    } else if (ratings.length > 1) {
      where.push(
        `r.rating IN (${ratings.map(() => "?").join(", ")})`,
      );

      params.push(...ratings);
    }
  }

  if (filters.min_rating !== undefined) {
    if (!isValidReviewRating(filters.min_rating)) {
      throw new ValidationError(
        "Invalid minimum rating",
      );
    }

    where.push("r.rating >= ?");
    params.push(filters.min_rating);
  }

  if (filters.max_rating !== undefined) {
    if (!isValidReviewRating(filters.max_rating)) {
      throw new ValidationError(
        "Invalid maximum rating",
      );
    }

    where.push("r.rating <= ?");
    params.push(filters.max_rating);
  }

  if (filters.verified !== undefined) {
    where.push("r.verified = ?");
    params.push(filters.verified ? 1 : 0);
  }

  if (filters.author_mode) {
    if (
      !isValidReviewAuthorMode(
        filters.author_mode,
      )
    ) {
      throw new ValidationError(
        "Invalid author mode",
      );
    }

    where.push("r.author_mode = ?");
    params.push(filters.author_mode);
  }

  if (filters.type) {
    where.push("r.type = ?");
    params.push(filters.type);
  }

  if (filters.source) {
    if (!isValidReviewSource(filters.source)) {
      throw new ValidationError(
        "Invalid review source",
      );
    }

    where.push("r.source = ?");
    params.push(filters.source);
  }

  if (filters.pinned !== undefined) {
    where.push("r.pinned = ?");
    params.push(filters.pinned ? 1 : 0);
  }

  if (filters.featured !== undefined) {
    where.push("r.featured = ?");
    params.push(filters.featured ? 1 : 0);
  }

  if (filters.locked !== undefined) {
    where.push("r.locked = ?");
    params.push(filters.locked ? 1 : 0);
  }

  if (filters.search?.trim()) {
    const search = `%${filters.search.trim()}%`;

    where.push(
      `(
        r.title LIKE ?
        OR r.text LIKE ?
        OR r.author_name LIKE ?
        OR r.target_id LIKE ?
      )`,
    );

    params.push(
      search,
      search,
      search,
      search,
    );
  }

  if (filters.created_from) {
    where.push("r.created_at >= ?");
    params.push(filters.created_from);
  }

  if (filters.created_to) {
    where.push("r.created_at <= ?");
    params.push(filters.created_to);
  }

  if (filters.updated_from) {
    where.push("r.updated_at >= ?");
    params.push(filters.updated_from);
  }

  if (filters.updated_to) {
    where.push("r.updated_at <= ?");
    params.push(filters.updated_to);
  }

  if (filters.has_reports) {
    where.push("r.reports_count != '0'");
  }

  if (filters.has_replies) {
    where.push("r.replies_count != '0'");
  }

  if (filters.has_reactions) {
    where.push("r.reactions_count != '0'");
  }

  return {
    sql:
      where.length > 0
        ? `WHERE ${where.join(" AND ")}`
        : "",
    params,
  };
}


export class ReviewService {
  private readonly db: Database;
  private readonly now: () => string;

  constructor(
    env: Env,
    options: ReviewServiceOptions = {},
  ) {
    this.db =
      options.db ??
      createDatabase(env);

    this.now =
      options.now ??
      nowIso;
  }


  // ==========================================================
  // CREATE
  // ==========================================================

  async create(
    input: ReviewCreateInput,
    actor: ReviewActor = {},
  ): Promise<ReviewCreateResult> {
    if (
      !isValidReviewTargetType(
        input.target_type,
      )
    ) {
      throw new ValidationError(
        "Invalid review target type",
      );
    }

    if (!input.target_id?.trim()) {
      throw new ValidationError(
        "Review target ID is required",
      );
    }

    if (!isValidReviewRating(input.rating)) {
      throw new ValidationError(
        "Review rating must be between 1 and 5",
      );
    }

    const text = input.text?.trim();

    if (
      !text ||
      text.length <
        REVIEW_LIMITS.TEXT_MIN ||
      text.length >
        REVIEW_LIMITS.TEXT_MAX
    ) {
      throw new ValidationError(
        "Invalid review text length",
      );
    }

    const title =
      input.title?.trim() || null;

    if (
      title &&
      (
        title.length <
          REVIEW_LIMITS.TITLE_MIN ||
        title.length >
          REVIEW_LIMITS.TITLE_MAX
      )
    ) {
      throw new ValidationError(
        "Invalid review title length",
      );
    }

    const authorMode =
      input.author_mode ??
      REVIEW_DEFAULTS.authorMode;

    if (
      !isValidReviewAuthorMode(
        authorMode,
      )
    ) {
      throw new ValidationError(
        "Invalid review author mode",
      );
    }

    const source =
      input.source ??
      REVIEW_DEFAULTS.source;

    if (!isValidReviewSource(source)) {
      throw new ValidationError(
        "Invalid review source",
      );
    }

    const verificationType =
      input.verification_type ??
      REVIEW_DEFAULTS.verificationType;

    if (
      !isValidReviewVerificationType(
        verificationType,
      )
    ) {
      throw new ValidationError(
        "Invalid verification type",
      );
    }

    const duplicate =
      await this.checkDuplicate({
        target_type: input.target_type,
        target_id: input.target_id,
        author_id:
          input.author_id ?? null,
        visitor_id:
          input.visitor_id ?? null,
        session_id:
          input.session_id ?? null,
      });

    if (duplicate.exists) {
      throw new ConflictError(
        "This visitor has already submitted a review for this target",
      );
    }

    const id =
      createReviewId();

    const now =
      this.now();

    const status =
      input.status ??
      REVIEW_DEFAULTS.status;

    if (!isValidReviewStatus(status)) {
      throw new ValidationError(
        "Invalid review status",
      );
    }

    const verified =
      Boolean(
        input.verified ??
        verificationType !==
          REVIEW_VERIFICATION_TYPES.NONE,
      );

    await this.db.run(
      `
      INSERT INTO reviews (
        id,
        target_type,
        target_id,
        publication_id,
        profile_id,
        organization_id,
        author_id,
        visitor_id,
        session_id,
        author_name,
        author_mode,
        type,
        source,
        rating,
        title,
        text,
        status,
        verification_type,
        verified,
        helpful_count,
        not_helpful_count,
        reactions_count,
        replies_count,
        reports_count,
        views_count,
        pinned,
        featured,
        locked,
        published_at,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, '0', '0',
        '0', '0', '0', '0',
        0, 0, 0,
        ?,
        ?, ?
      )
      `,
      id,
      input.target_type,
      input.target_id,
      input.publication_id ?? null,
      input.profile_id ?? null,
      input.organization_id ?? null,
      input.author_id ?? null,
      input.visitor_id ?? null,
      input.session_id ?? null,
      input.author_name ?? null,
      authorMode,
      input.type ?? REVIEW_DEFAULTS.type,
      source,
      input.rating,
      title,
      text,
      status,
      verificationType,
      verified ? 1 : 0,
      isReviewPublic(status) ? now : null,
      now,
      now,
    );

    await this.writeHistory(
      id,
      REVIEW_HISTORY_ACTIONS.CREATED,
      {
        new_status: status,
        new_rating: input.rating,
        actor,
      },
    );

    await this.writeEvent(
      id,
      "created",
      actor,
    );

    await this.recalculateTargetSummary(
      input.target_type,
      input.target_id,
    );

    const review =
      await this.getById(id);

    if (!review) {
      throw new DatabaseError(
        "Review was created but could not be loaded",
      );
    }

    return {
      review,
      created: true,
      moderation_required:
        status === REVIEW_STATUSES.PENDING,
    };
  }


  // ==========================================================
  // GET
  // ==========================================================

  async getById(
    id: string,
  ): Promise<Review | null> {
    const row =
      await this.db.first<ReviewQueryRow>(
        `
        SELECT *
        FROM reviews
        WHERE id = ?
        LIMIT 1
        `,
        id,
      );

    return row
      ? toReview(row)
      : null;
  }


  async getDetails(
    id: string,
  ): Promise<ReviewDetails | null> {
    const review =
      await this.getById(id);

    if (!review) {
      return null;
    }

    const [
      history,
      reactions,
      replies,
      reports,
      metrics,
    ] = await Promise.all([
      this.getHistory(id),
      this.getReactions(id),
      this.getReplies(id),
      this.getReports(id),
      this.getMetrics(id),
    ]);

    return {
      ...review,
      history,
      reactions,
      replies,
      reports,
      metrics,
    };
  }


  async list(
    query: ReviewQuery = {},
  ): Promise<ReviewListResult> {
    const page =
      Math.max(
        1,
        Math.floor(query.page ?? 1),
      );

    const limit =
      Math.min(
        100,
        Math.max(
          1,
          Math.floor(
            query.limit ?? 20,
          ),
        ),
      );

    const offset =
      (page - 1) * limit;

    const {
      sql: whereSql,
      params,
    } = buildWhere(
      query.filters,
    );

    const sort =
      query.sort?.sort ??
      REVIEW_DEFAULTS.sort;

    if (!isValidReviewSort(sort)) {
      throw new ValidationError(
        "Invalid review sort",
      );
    }

    const orderBy =
      REVIEW_SORT_FIELD_MAP[sort];

    const countRow =
      await this.db.first<{
        count: string;
      }>(
        `
        SELECT COUNT(*) AS count
        FROM reviews r
        ${whereSql}
        `,
        ...params,
      );

    const total =
      metricToString(
        countRow?.count ?? "0",
      );

    const rows =
      await this.db.query<ReviewQueryRow>(
        `
        SELECT *
        FROM reviews r
        ${whereSql}
        ORDER BY ${orderBy}
        LIMIT ?
        OFFSET ?
        `,
        ...params,
        limit,
        offset,
      );

    const reviews =
      rows.map(toReview);

    const totalNumber =
      Number(total);

    const totalPages =
      Number.isFinite(totalNumber) &&
      totalNumber > 0
        ? Math.ceil(
            totalNumber / limit,
          )
        : 0;

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        total_pages:
          metricToString(totalPages),
        has_next:
          page < totalPages,
        has_previous:
          page > 1,
      },
      filters: query.filters,
      sort: query.sort,
    };
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  async update(
    id: string,
    input: ReviewUpdateInput,
    actor: ReviewActor = {},
  ): Promise<ReviewUpdateResult> {
    const existing =
      await this.getById(id);

    if (!existing) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    if (existing.locked) {
      throw new AuthorizationError(
        "Review is locked",
      );
    }

    const sets: string[] = [];
    const params: unknown[] = [];
    const changedFields: string[] = [];

    let newRating =
      existing.rating;

    if (input.rating !== undefined) {
      if (
        !isValidReviewRating(
          input.rating,
        )
      ) {
        throw new ValidationError(
          "Invalid review rating",
        );
      }

      if (
        input.rating !==
        existing.rating
      ) {
        sets.push("rating = ?");
        params.push(input.rating);
        changedFields.push("rating");
        newRating = input.rating;
      }
    }

    if (input.title !== undefined) {
      const title =
        input.title?.trim() || null;

      if (
        title &&
        (
          title.length <
            REVIEW_LIMITS.TITLE_MIN ||
          title.length >
            REVIEW_LIMITS.TITLE_MAX
        )
      ) {
        throw new ValidationError(
          "Invalid review title length",
        );
      }

      if (title !== existing.title) {
        sets.push("title = ?");
        params.push(title);
        changedFields.push("title");
      }
    }

    if (input.text !== undefined) {
      const text =
        input.text.trim();

      if (
        text.length <
          REVIEW_LIMITS.TEXT_MIN ||
        text.length >
          REVIEW_LIMITS.TEXT_MAX
      ) {
        throw new ValidationError(
          "Invalid review text length",
        );
      }

      if (text !== existing.text) {
        sets.push("text = ?");
        params.push(text);
        changedFields.push("text");
      }
    }

    if (input.author_name !== undefined) {
      const name =
        input.author_name?.trim() ||
        null;

      if (
        name &&
        name.length >
          REVIEW_LIMITS.AUTHOR_NAME_MAX
      ) {
        throw new ValidationError(
          "Author name is too long",
        );
      }

      if (
        name !== existing.author_name
      ) {
        sets.push("author_name = ?");
        params.push(name);
        changedFields.push(
          "author_name",
        );
      }
    }

    if (input.author_mode !== undefined) {
      if (
        !isValidReviewAuthorMode(
          input.author_mode,
        )
      ) {
        throw new ValidationError(
          "Invalid author mode",
        );
      }

      if (
        input.author_mode !==
        existing.author_mode
      ) {
        sets.push(
          "author_mode = ?",
        );
        params.push(
          input.author_mode,
        );
        changedFields.push(
          "author_mode",
        );
      }
    }

    if (
      input.verification_type !==
      undefined
    ) {
      if (
        !isValidReviewVerificationType(
          input.verification_type,
        )
      ) {
        throw new ValidationError(
          "Invalid verification type",
        );
      }

      if (
        input.verification_type !==
        existing.verification_type
      ) {
        sets.push(
          "verification_type = ?",
        );
        params.push(
          input.verification_type,
        );
        changedFields.push(
          "verification_type",
        );
      }
    }

    if (input.verified !== undefined) {
      if (
        input.verified !==
        existing.verified
      ) {
        sets.push("verified = ?");
        params.push(
          input.verified ? 1 : 0,
        );
        changedFields.push(
          "verified",
        );
      }
    }

    if (input.pinned !== undefined) {
      if (
        input.pinned !==
        existing.pinned
      ) {
        sets.push("pinned = ?");
        params.push(
          input.pinned ? 1 : 0,
        );
        changedFields.push("pinned");
      }
    }

    if (input.featured !== undefined) {
      if (
        input.featured !==
        existing.featured
      ) {
        sets.push("featured = ?");
        params.push(
          input.featured ? 1 : 0,
        );
        changedFields.push(
          "featured",
        );
      }
    }

    if (input.locked !== undefined) {
      if (
        input.locked !==
        existing.locked
      ) {
        sets.push("locked = ?");
        params.push(
          input.locked ? 1 : 0,
        );
        changedFields.push("locked");
      }
    }

    if (
      input.status !== undefined &&
      input.status !== existing.status
    ) {
      if (
        !isValidReviewStatus(
          input.status,
        )
      ) {
        throw new ValidationError(
          "Invalid review status",
        );
      }

      if (
        !canTransitionReviewStatus(
          existing.status,
          input.status,
        )
      ) {
        throw new ConflictError(
          `Invalid review status transition: ${existing.status} -> ${input.status}`,
        );
      }

      sets.push("status = ?");
      params.push(input.status);
      changedFields.push("status");

      if (
        input.status ===
        REVIEW_STATUSES.PUBLISHED
      ) {
        sets.push(
          "published_at = COALESCE(published_at, ?)",
        );
        params.push(this.now());
      }

      if (
        input.status ===
        REVIEW_STATUSES.DELETED
      ) {
        sets.push(
          "deleted_at = ?",
        );
        params.push(this.now());
      }
    }

    if (
      input.moderation_reason !==
      undefined
    ) {
      sets.push(
        "moderation_reason = ?",
      );
      params.push(
        input.moderation_reason ??
          null,
      );
      changedFields.push(
        "moderation_reason",
      );
    }

    if (
      input.rejection_reason !==
      undefined
    ) {
      sets.push(
        "rejection_reason = ?",
      );
      params.push(
        input.rejection_reason ??
          null,
      );
      changedFields.push(
        "rejection_reason",
      );
    }

    if (sets.length === 0) {
      return {
        review: existing,
        changed_fields: [],
      };
    }

    const now =
      this.now();

    sets.push(
      "updated_at = ?",
      "edited_at = ?",
    );

    params.push(now, now);
    params.push(id);

    await this.db.run(
      `
      UPDATE reviews
      SET ${sets.join(", ")}
      WHERE id = ?
      `,
      ...params,
    );

    await this.writeHistory(
      id,
      REVIEW_HISTORY_ACTIONS.UPDATED,
      {
        old_status:
          existing.status,
        new_status:
          input.status ??
          existing.status,

        old_rating:
          existing.rating,
        new_rating:

          newRating,

        old_title:
          existing.title,
        new_title:
          input.title ??
          existing.title,

        old_text:
          existing.text,
        new_text:
          input.text ??
          existing.text,

        changed_fields:
          changedFields,
        actor,
      },
    );

    await this.writeEvent(
      id,
      "updated",
      actor,
      {
        changed_fields:
          changedFields,
      },
    );

    if (
      changedFields.includes(
        "rating",
      ) ||
      changedFields.includes(
        "status",
      ) ||
      changedFields.includes(
        "verified",
      )
    ) {
      await this.recalculateTargetSummary(
        existing.target_type,
        existing.target_id,
      );
    }

    const review =
      await this.getById(id);

    if (!review) {
      throw new DatabaseError(
        "Updated review could not be loaded",
      );
    }

    return {
      review,
      changed_fields:
        changedFields,
    };
  }


  // ==========================================================
  // ADMIN UPDATE
  // ==========================================================

  async adminUpdate(
    id: string,
    input: ReviewAdminUpdateInput,
    adminId: string,
    reason?: string,
  ): Promise<Review> {
    if (!adminId) {
      throw new AuthorizationError(
        "Admin ID is required",
      );
    }

    const existing =
      await this.getById(id);

    if (!existing) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const normalInput:
      ReviewUpdateInput = {
        ...input,
      };

    delete (
      normalInput as ReviewUpdateInput & {
        helpful_count?: unknown;
        not_helpful_count?: unknown;
        reactions_count?: unknown;
        replies_count?: unknown;
        reports_count?: unknown;
        views_count?: unknown;
      }
    ).helpful_count;

    const result =
      await this.update(
        id,
        normalInput,
        {
          id: adminId,
          type: "admin",
        },
      );

    const counterFields = [
      "helpful_count",
      "not_helpful_count",
      "reactions_count",
      "replies_count",
      "reports_count",
      "views_count",
    ] as const;

    for (const field of counterFields) {
      const value =
        input[field];

      if (value === undefined) {
        continue;
      }

      await this.setCounter(
        id,
        field,
        value,
        adminId,
        reason ??
          "Admin manually changed review counter",
      );
    }

    if (
      input.rating !== undefined &&
      input.rating !== existing.rating
    ) {
      await logAdminAction(
        this.db.db,
        adminId,
        "review.rating.changed",
        "review",
        id,
        {
          old_rating:
            existing.rating,
          new_rating:
            input.rating,
          reason:
            reason ?? null,
        },
      );
    }

    await logAdminAction(
      this.db.db,
      adminId,
      "review.admin_updated",
      "review",
      id,
      {
        changed_fields:
          result.changed_fields,
        reason:
          reason ?? null,
      },
    );

    const review =
      await this.getById(id);

    if (!review) {
      throw new DatabaseError(
        "Review disappeared after admin update",
      );
    }

    return review;
  }


  // ==========================================================
  // MODERATION
  // ==========================================================

  async moderate(
    id: string,
    action: string,
    adminId: string,
    reason?: string,
  ): Promise<ReviewModerationResult> {
    if (!adminId) {
      throw new AuthorizationError(
        "Admin ID is required",
      );
    }

    const review =
      await this.getById(id);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const allowedActions =
      Object.values(
        REVIEW_MODERATION_ACTIONS,
      ) as string[];

    if (
      !allowedActions.includes(action)
    ) {
      throw new ValidationError(
        "Invalid review moderation action",
      );
    }

    let newStatus =
      review.status;

    switch (action) {
      case REVIEW_MODERATION_ACTIONS.APPROVE:
        newStatus =
          REVIEW_STATUSES.PUBLISHED;
        break;

      case REVIEW_MODERATION_ACTIONS.REJECT:
        newStatus =
          REVIEW_STATUSES.REJECTED;
        break;

      case REVIEW_MODERATION_ACTIONS.HIDE:
        newStatus =
          REVIEW_STATUSES.HIDDEN;
        break;

      case REVIEW_MODERATION_ACTIONS.UNHIDE:
        newStatus =
          REVIEW_STATUSES.PUBLISHED;
        break;

      case REVIEW_MODERATION_ACTIONS.DELETE:
        newStatus =
          REVIEW_STATUSES.DELETED;
        break;

      case REVIEW_MODERATION_ACTIONS.RESTORE:
        newStatus =
          REVIEW_STATUSES.PUBLISHED;
        break;

      case REVIEW_MODERATION_ACTIONS.MARK_SPAM:
        newStatus =
          REVIEW_STATUSES.SPAM;
        break;

      case REVIEW_MODERATION_ACTIONS.UNMARK_SPAM:
        newStatus =
          REVIEW_STATUSES.PENDING;
        break;

      case REVIEW_MODERATION_ACTIONS.PIN:
      case REVIEW_MODERATION_ACTIONS.UNPIN:
      case REVIEW_MODERATION_ACTIONS.FEATURE:
      case REVIEW_MODERATION_ACTIONS.UNFEATURE:
      case REVIEW_MODERATION_ACTIONS.LOCK:
      case REVIEW_MODERATION_ACTIONS.UNLOCK:
        break;

      default:
        break;
    }

    if (
      newStatus !== review.status &&
      !canTransitionReviewStatus(
        review.status,
        newStatus,
      )
    ) {
      throw new ConflictError(
        `Cannot change review status from ${review.status} to ${newStatus}`,
      );
    }

    if (
      action ===
      REVIEW_MODERATION_ACTIONS.PIN
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET pinned = 1,
            updated_at = ?
        WHERE id = ?
        `,
        this.now(),
        id,
      );
    }

    if (
      action ===
      REVIEW_MODERATION_ACTIONS.UNPIN
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET pinned = 0,
            updated_at = ?
        WHERE id = ?
        `,
        this.now(),
        id,
      );
    }

    if (
      action ===
      REVIEW_MODERATION_ACTIONS.FEATURE
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET featured = 1,
            updated_at = ?
        WHERE id = ?
        `,
        this.now(),
        id,
      );
    }

    if (
      action ===
      REVIEW_MODERATION_ACTIONS.UNFEATURE
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET featured = 0,
            updated_at = ?
        WHERE id = ?
        `,
        this.now(),
        id,
      );
    }

    if (
      action ===
      REVIEW_MODERATION_ACTIONS.LOCK
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET locked = 1,
            updated_at = ?
        WHERE id = ?
        `,
        this.now(),
        id,
      );
    }

    if (
      action ===
      REVIEW_MODERATION_ACTIONS.UNLOCK
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET locked = 0,
            updated_at = ?
        WHERE id = ?
        `,
        this.now(),
        id,
      );
    }

    if (
      newStatus !== review.status
    ) {
      await this.db.run(
        `
        UPDATE reviews
        SET
          status = ?,
          moderated_by = ?,
          moderated_at = ?,
          moderation_reason = ?,
          rejection_reason = ?,
          published_at =
            CASE
              WHEN ? = 'published'
              THEN COALESCE(published_at, ?)
              ELSE published_at
            END,
          deleted_at =
            CASE
              WHEN ? = 'deleted'
              THEN ?
              ELSE deleted_at
            END,
          updated_at = ?
        WHERE id = ?
        `,
        newStatus,
        adminId,
        this.now(),
        reason ?? null,
        newStatus ===
          REVIEW_STATUSES.REJECTED
          ? reason ?? null
          : null,
        newStatus,
        this.now(),
        newStatus,
        this.now(),
        this.now(),
        id,
      );
    }

    await this.writeHistory(
      id,
      this.historyActionForModeration(
        action,
      ),
      {
        old_status:
          review.status,
        new_status:
          newStatus,
        reason,
        actor: {
          id: adminId,
          type: "admin",
        },
      },
    );

    await this.writeEvent(
      id,
      this.eventForModeration(
        action,
      ),
      {
        id: adminId,
        type: "admin",
      },
      {
        reason:
          reason ?? null,
      },
    );

    await logAdminAction(
      this.db.db,
      adminId,
      `review.${action}`,
      "review",
      id,
      {
        old_status:
          review.status,
        new_status:
          newStatus,
        reason:
          reason ?? null,
      },
    );

    if (
      newStatus !== review.status
    ) {
      await this.recalculateTargetSummary(
        review.target_type,
        review.target_id,
      );
    }

    const updated =
      await this.getById(id);

    if (!updated) {
      throw new DatabaseError(
        "Moderated review could not be loaded",
      );
    }

    return {
      review: updated,
      action,
      previous_status:
        review.status,
      new_status:
        updated.status,
      changed_by:
        adminId,
      reason:
        reason ?? null,
    };
  }


  // ==========================================================
  // REACTIONS
  // ==========================================================

  async addReaction(
    reviewId: string,
    reactionTypeId: string,
    actor: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
    },
  ): Promise<ReviewReactionResult> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    if (!isReviewPublic(review.status)) {
      throw new AuthorizationError(
        "Cannot react to this review",
      );
    }

    const identity =
      this.requireIdentity(actor);

    const existing =
      await this.db.first<ReviewReaction>(
        `
        SELECT *
        FROM review_reactions
        WHERE
          review_id = ?
          AND reaction_type_id = ?
          AND (
            (? IS NOT NULL AND user_id = ?)
            OR
            (? IS NOT NULL AND visitor_id = ?)
            OR
            (? IS NOT NULL AND session_id = ?)
          )
        LIMIT 1
        `,
        reviewId,
        reactionTypeId,
        identity.userId,
        identity.userId,
        identity.visitorId,
        identity.visitorId,
        identity.sessionId,
        identity.sessionId,
      );

    if (existing) {
      return {
        reaction: existing,
        added: false,
        removed: false,
        reactions_count:
          review.reactions_count,
      };
    }

    const id =
      createReviewReactionId();

    const now =
      this.now();

    await this.db.run(
      `
      INSERT INTO review_reactions (
        id,
        review_id,
        reaction_type_id,
        user_id,
        visitor_id,
        session_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      reviewId,
      reactionTypeId,
      identity.userId,
      identity.visitorId,
      identity.sessionId,
      now,
      now,
    );

    const newCount =
      addMetric(
        review.reactions_count,
        "1",
      );

    await this.db.run(
      `
      UPDATE reviews
      SET reactions_count = ?,
          updated_at = ?
      WHERE id = ?
      `,
      newCount,
      now,
      reviewId,
    );

    await this.writeEvent(
      reviewId,
      "reaction_added",
      {
        id:
          identity.userId ??
          identity.visitorId ??
          identity.sessionId,
        type: "user",
      },
      {
        reaction_type_id:
          reactionTypeId,
      },
    );

    return {
      reaction: {
        id,
        review_id: reviewId,
        reaction_type_id:
          reactionTypeId,
        user_id:
          identity.userId ?? null,
        visitor_id:
          identity.visitorId ?? null,
        session_id:
          identity.sessionId ?? null,
        created_at: now,
        updated_at: now,
      },
      added: true,
      removed: false,
      reactions_count:
        newCount,
    };
  }


  async removeReaction(
    reviewId: string,
    reactionTypeId: string,
    actor: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
    },
  ): Promise<ReviewReactionResult> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const identity =
      this.requireIdentity(actor);

    const existing =
      await this.db.first<ReviewReaction>(
        `
        SELECT *
        FROM review_reactions
        WHERE
          review_id = ?
          AND reaction_type_id = ?
          AND (
            (? IS NOT NULL AND user_id = ?)
            OR
            (? IS NOT NULL AND visitor_id = ?)
            OR
            (? IS NOT NULL AND session_id = ?)
          )
        LIMIT 1
        `,
        reviewId,
        reactionTypeId,
        identity.userId,
        identity.userId,
        identity.visitorId,
        identity.visitorId,
        identity.sessionId,
        identity.sessionId,
      );

    if (!existing) {
      return {
        reaction: null,
        added: false,
        removed: false,
        reactions_count:
          review.reactions_count,
      };
    }

    await this.db.run(
      `
      DELETE FROM review_reactions
      WHERE id = ?
      `,
      existing.id,
    );

    const newCount =
      subtractMetric(
        review.reactions_count,
        "1",
      );

    await this.db.run(
      `
      UPDATE reviews
      SET reactions_count = ?,
          updated_at = ?
      WHERE id = ?
      `,
      newCount,
      this.now(),
      reviewId,
    );

    await this.writeEvent(
      reviewId,
      "reaction_removed",
      {
        id:
          identity.userId ??
          identity.visitorId ??
          identity.sessionId,
        type: "user",
      },
      {
        reaction_type_id:
          reactionTypeId,
      },
    );

    return {
      reaction: existing,
      added: false,
      removed: true,
      reactions_count:
        newCount,
    };
  }


  async getReactions(
    reviewId: string,
  ): Promise<ReviewReaction[]> {
    return await this.db.query<ReviewReaction>(
      `
      SELECT
        rr.*,
        rt.name AS reaction_type
      FROM review_reactions rr
      LEFT JOIN reaction_types rt
        ON rt.id = rr.reaction_type_id
      WHERE rr.review_id = ?
      ORDER BY rr.created_at ASC
      `,
      reviewId,
    );
  }


  // ==========================================================
  // HELPFUL
  // ==========================================================

  async setHelpful(
    reviewId: string,
    value: 1 | -1,
    actor: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
    },
  ): Promise<ReviewHelpfulResult> {
    if (value !== 1 && value !== -1) {
      throw new ValidationError(
        "Helpful value must be 1 or -1",
      );
    }

    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const identity =
      this.requireIdentity(actor);

    const existing =
      await this.db.first<{
        id: string;
        value: number;
      }>(
        `
        SELECT id, value
        FROM review_helpful_votes
        WHERE
          review_id = ?
          AND (
            (? IS NOT NULL AND user_id = ?)
            OR
            (? IS NOT NULL AND visitor_id = ?)
            OR
            (? IS NOT NULL AND session_id = ?)
          )
        LIMIT 1
        `,
        reviewId,
        identity.userId,
        identity.userId,
        identity.visitorId,
        identity.visitorId,
        identity.sessionId,
        identity.sessionId,
      );

    if (existing) {
      if (existing.value === value) {
        return {
          helpful:
            value === 1,
          not_helpful:
            value === -1,
          helpful_count:
            review.helpful_count,
          not_helpful_count:
            review.not_helpful_count,
        };
      }

      await this.db.run(
        `
        UPDATE review_helpful_votes
        SET value = ?,
            updated_at = ?
        WHERE id = ?
        `,
        value,
        this.now(),
        existing.id,
      );

      let helpful =
        review.helpful_count;

      let notHelpful =
        review.not_helpful_count;

      if (value === 1) {
        helpful =
          addMetric(
            helpful,
            "1",
          );

        notHelpful =
          subtractMetric(
            notHelpful,
            "1",
          );
      } else {
        notHelpful =
          addMetric(
            notHelpful,
            "1",
          );

        helpful =
          subtractMetric(
            helpful,
            "1",
          );
      }

      await this.db.run(
        `
        UPDATE reviews
        SET
          helpful_count = ?,
          not_helpful_count = ?,
          updated_at = ?
        WHERE id = ?
        `,
        helpful,
        notHelpful,
        this.now(),
        reviewId,
      );

      return {
        helpful:
          value === 1,
        not_helpful:
          value === -1,
        helpful_count:
          helpful,
        not_helpful_count:
          notHelpful,
      };
    }

    const id =
      createId("rvhelp");

    await this.db.run(
      `
      INSERT INTO review_helpful_votes (
        id,
        review_id,
        user_id,
        visitor_id,
        session_id,
        value,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      reviewId,
      identity.userId,
      identity.visitorId,
      identity.sessionId,
      value,
      this.now(),
      this.now(),
    );

    const helpful =
      value === 1
        ? addMetric(
            review.helpful_count,
            "1",
          )
        : review.helpful_count;

    const notHelpful =
      value === -1
        ? addMetric(
            review.not_helpful_count,
            "1",
          )
        : review.not_helpful_count;

    await this.db.run(
      `
      UPDATE reviews
      SET
        helpful_count = ?,
        not_helpful_count = ?,
        updated_at = ?
      WHERE id = ?
      `,
      helpful,
      notHelpful,
      this.now(),
      reviewId,
    );

    return {
      helpful:
        value === 1,
      not_helpful:
        value === -1,
      helpful_count:
        helpful,
      not_helpful_count:
        notHelpful,
    };
  }


  // ==========================================================
  // REPORTS
  // ==========================================================

  async report(
    reviewId: string,
    type: string,
    actor: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
    },
    reason?: string,
    details?: string,
  ): Promise<ReviewReportResult> {
    if (
      !(
        Object.values(
          REVIEW_REPORT_TYPES,
        ) as string[]
      ).includes(type)
    ) {
      throw new ValidationError(
        "Invalid review report type",
      );
    }

    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const identity =
      this.requireIdentity(actor);

    const existing =
      await this.db.first<ReviewReport>(
        `
        SELECT *
        FROM review_reports
        WHERE
          review_id = ?
          AND (
            (? IS NOT NULL AND reporter_id = ?)
            OR
            (? IS NOT NULL AND visitor_id = ?)
            OR
            (? IS NOT NULL AND session_id = ?)
          )
        LIMIT 1
        `,
        reviewId,
        identity.userId,
        identity.userId,
        identity.visitorId,
        identity.visitorId,
        identity.sessionId,
        identity.sessionId,
      );

    if (existing) {
      return {
        report: existing,
        created: false,
        review_status:
          review.status,
      };
    }

    const id =
      createReviewReportId();

    const now =
      this.now();

    await this.db.run(
      `
      INSERT INTO review_reports (
        id,
        review_id,
        reporter_id,
        visitor_id,
        session_id,
        type,
        priority,
        reason,
        details,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
      )
      `,
      id,
      reviewId,
      identity.userId,
      identity.visitorId,
      identity.sessionId,
      type,
      REVIEW_REPORT_PRIORITIES.NORMAL,
      reason ?? null,
      details ?? null,
      now,
      now,
    );

    const newCount =
      addMetric(
        review.reports_count,
        "1",
      );

    await this.db.run(
      `
      UPDATE reviews
      SET reports_count = ?,
          updated_at = ?
      WHERE id = ?
      `,
      newCount,
      now,
      reviewId,
    );

    await this.writeEvent(
      reviewId,
      "reported",
      {
        id:
          identity.userId ??
          identity.visitorId ??
          identity.sessionId,
        type: "user",
      },
      {
        report_type:
          type,
      },
    );

    const report =
      await this.db.first<ReviewReport>(
        `
        SELECT *
        FROM review_reports
        WHERE id = ?
        `,
        id,
      );

    if (!report) {
      throw new DatabaseError(
        "Review report was created but could not be loaded",
      );
    }

    return {
      report,
      created: true,
      review_status:
        review.status,
    };
  }


  async getReports(
    reviewId: string,
  ): Promise<ReviewReport[]> {
    return await this.db.query<ReviewReport>(
      `
      SELECT *
      FROM review_reports
      WHERE review_id = ?
      ORDER BY created_at DESC
      `,
      reviewId,
    );
  }


  // ==========================================================
  // REPLIES
  // ==========================================================

  async createReply(
    reviewId: string,
    text: string,
    actor: {
      userId?: string;
      visitorId?: string;
      authorName?: string;
      authorMode?: ReviewAuthorMode;
    },
  ): Promise<ReviewReply> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    if (!text?.trim()) {
      throw new ValidationError(
        "Reply text is required",
      );
    }

    const cleanText =
      text.trim();

    if (
      cleanText.length >
      REVIEW_LIMITS.REPLY_MAX
    ) {
      throw new ValidationError(
        "Reply is too long",
      );
    }

    if (
      !actor.userId &&
      !actor.visitorId
    ) {
      throw new AuthorizationError(
        "Reply author is required",
      );
    }

    const id =
      createReviewReplyId();

    const now =
      this.now();

    const authorMode =
      actor.authorMode ??
      REVIEW_AUTHOR_MODES.PUBLIC;

    await this.db.run(
      `
      INSERT INTO review_replies (
        id,
        review_id,
        author_id,
        visitor_id,
        author_name,
        author_mode,
        text,
        status,
        reactions_count,
        reports_count,
        pinned,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, 'published',
        '0', '0', 0, ?, ?
      )
      `,
      id,
      reviewId,
      actor.userId ?? null,
      actor.visitorId ?? null,
      actor.authorName ?? null,
      authorMode,
      cleanText,
      now,
      now,
    );

    const repliesCount =
      addMetric(
        review.replies_count,
        "1",
      );

    await this.db.run(
      `
      UPDATE reviews
      SET replies_count = ?,
          updated_at = ?
      WHERE id = ?
      `,
      repliesCount,
      now,
      reviewId,
    );

    await this.writeEvent(
      reviewId,
      "reply_added",
      {
        id:
          actor.userId ??
          actor.visitorId,
        type: "user",
      },
    );

    const reply =
      await this.db.first<ReviewReply>(
        `
        SELECT *
        FROM review_replies
        WHERE id = ?
        `,
        id,
      );

    if (!reply) {
      throw new DatabaseError(
        "Reply was created but could not be loaded",
      );
    }

    return reply;
  }


  async getReplies(
    reviewId: string,
  ): Promise<ReviewReply[]> {
    return await this.db.query<ReviewReply>(
      `
      SELECT *
      FROM review_replies
      WHERE review_id = ?
      ORDER BY pinned DESC, created_at ASC
      `,
      reviewId,
    );
  }


  // ==========================================================
  // HISTORY
  // ==========================================================

  async getHistory(
    reviewId: string,
  ): Promise<ReviewHistory[]> {
    return await this.db.query<ReviewHistory>(
      `
      SELECT *
      FROM review_history
      WHERE review_id = ?
      ORDER BY created_at DESC
      `,
      reviewId,
    );
  }


  private async writeHistory(
    reviewId: string,
    action: string,
    data: {
      old_status?: ReviewStatusValue;
      new_status?: ReviewStatusValue;

      old_rating?: ReviewRating;
      new_rating?: ReviewRating;

      old_title?: string | null;
      new_title?: string | null;

      old_text?: string | null;
      new_text?: string | null;

      changed_fields?: string[];

      reason?: string;

      actor?: ReviewActor;
    },
  ): Promise<void> {
    await this.db.run(
      `
      INSERT INTO review_history (
        id,
        review_id,
        action,
        old_status,
        new_status,
        old_rating,
        new_rating,
        old_title,
        new_title,
        old_text,
        new_text,
        changed_fields,
        reason,
        actor_id,
        actor_type,
        metadata,
        created_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
      `,
      createReviewHistoryId(),
      reviewId,
      action,
      data.old_status ?? null,
      data.new_status ?? null,
      data.old_rating ?? null,
      data.new_rating ?? null,
      data.old_title ?? null,
      data.new_title ?? null,
      data.old_text ?? null,
      data.new_text ?? null,
      data.changed_fields
        ? JSON.stringify(
            data.changed_fields,
          )
        : null,
      data.reason ?? null,
      data.actor?.id ?? null,
      data.actor?.type ?? "system",
      null,
      this.now(),
    );
  }


  private async writeEvent(
    reviewId: string,
    event: string,
    actor: ReviewActor = {},
    metadata?: Record<
      string,
      unknown
    >,
  ): Promise<void> {
    await this.db.run(
      `
      INSERT INTO review_events (
        id,
        review_id,
        event,
        actor_id,
        actor_type,
        metadata,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      createId("rvevent"),
      reviewId,
      event,
      actor.id ?? null,
      actor.type ?? "system",
      metadata
        ? JSON.stringify(metadata)
        : null,
      this.now(),
    );
  }


  // ==========================================================
  // METRICS
  // ==========================================================

  async getMetrics(
    reviewId: string,
  ): Promise<ReviewMetrics> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const rows =
      await this.db.query<{
        metric: string;
        value: string;
      }>(
        `
        SELECT metric, value
        FROM review_metrics
        WHERE review_id = ?
        `,
        reviewId,
      );

    const metrics: ReviewMetrics = {
      reviews: "1",
      ratings: "1",

      rating_sum:
        String(review.rating),

      rating_average:
        String(review.rating),

      rating_1:
        review.rating === 1 ? "1" : "0",

      rating_2:
        review.rating === 2 ? "1" : "0",

      rating_3:
        review.rating === 3 ? "1" : "0",

      rating_4:
        review.rating === 4 ? "1" : "0",

      rating_5:
        review.rating === 5 ? "1" : "0",

      helpful:
        review.helpful_count,

      not_helpful:
        review.not_helpful_count,

      reactions:
        review.reactions_count,

      replies:
        review.replies_count,

      reports:
        review.reports_count,

      views:
        review.views_count,
    };

    for (const row of rows) {
      const key =
        row.metric as keyof ReviewMetrics;

      if (key in metrics) {
        metrics[key] =
          metricToString(row.value);
      }
    }

    return metrics;
  }


  async incrementView(
    reviewId: string,
  ): Promise<string> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const value =
      addMetric(
        review.views_count,
        "1",
      );

    await this.db.run(
      `
      UPDATE reviews
      SET views_count = ?,
          updated_at = ?
      WHERE id = ?
      `,
      value,
      this.now(),
      reviewId,
    );

    await this.db.run(
      `
      INSERT INTO review_views (
        id,
        review_id,
        created_at
      )
      VALUES (?, ?, ?)
      `,
      createId("rvview"),
      reviewId,
      this.now(),
    );

    return value;
  }


  // ==========================================================
  // HUGE COUNTERS
  // ==========================================================

  async getCounter(
    reviewId: string,
    counter:
      | "helpful_count"
      | "not_helpful_count"
      | "reactions_count"
      | "replies_count"
      | "reports_count"
      | "views_count",
  ): Promise<string> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    return review[counter];
  }


  async setCounter(
    reviewId: string,
    counter:
      | "helpful_count"
      | "not_helpful_count"
      | "reactions_count"
      | "replies_count"
      | "reports_count"
      | "views_count",
    value:
      | string
      | number
      | bigint,
    adminId?: string,
    reason?: string,
  ): Promise<ReviewCounterChange> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const newValue =
      ensureNonNegativeMetric(
        value,
      );

    const oldValue =
      review[counter];

    await this.db.run(
      `
      UPDATE reviews
      SET ${counter} = ?,
          updated_at = ?
      WHERE id = ?
      `,
      newValue,
      this.now(),
      reviewId,
    );

    await this.writeHistory(
      reviewId,
      REVIEW_HISTORY_ACTIONS.COUNTER_CHANGED,
      {
        reason:
          reason ??
          "Counter manually changed",
        actor: {
          id:
            adminId ?? null,
          type:
            adminId
              ? "admin"
              : "system",
        },
      },
    );

    await this.writeEvent(
      reviewId,
      "counter_changed",
      {
        id:
          adminId ?? null,
        type:
          adminId
            ? "admin"
            : "system",
      },
      {
        counter,
        old_value:
          oldValue,
        new_value:
          newValue,
        reason:
          reason ?? null,
      },
    );

    if (adminId) {
      await logAdminAction(
        this.db.db,
        adminId,
        "review.counter.changed",
        "review",
        reviewId,
        {
          counter,
          old_value:
            oldValue,
          new_value:
            newValue,
          reason:
            reason ?? null,
        },
      );
    }

    return {
      review_id:
        reviewId,
      counter,
      old_value:
        oldValue,
      new_value:
        newValue,
      delta:
        compareDecimalStrings(
          newValue,
          oldValue,
        ) === 0
          ? "0"
          : undefined,
      changed_by:
        adminId ?? null,
      reason:
        reason ?? null,
    };
  }


  async incrementCounter(
    reviewId: string,
    counter:
      | "helpful_count"
      | "not_helpful_count"
      | "reactions_count"
      | "replies_count"
      | "reports_count"
      | "views_count",
    amount:
      | string
      | number
      | bigint = "1",
  ): Promise<string> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const current =
      review[counter];

    const value =
      addMetric(
        current,
        metricToString(amount),
      );

    await this.db.run(
      `
      UPDATE reviews
      SET ${counter} = ?,
          updated_at = ?
      WHERE id = ?
      `,
      value,
      this.now(),
      reviewId,
    );

    return value;
  }


  async decrementCounter(
    reviewId: string,
    counter:
      | "helpful_count"
      | "not_helpful_count"
      | "reactions_count"
      | "replies_count"
      | "reports_count"
      | "views_count",
    amount:
      | string
      | number
      | bigint = "1",
  ): Promise<string> {
    const review =
      await this.getById(reviewId);

    if (!review) {
      throw new NotFoundError(
        "Review not found",
      );
    }

    const current =
      review[counter];

    const value =
      subtractMetric(
        current,
        metricToString(amount),
      );

    await this.db.run(
      `
      UPDATE reviews
      SET ${counter} = ?,
          updated_at = ?
      WHERE id = ?
      `,
      value,
      this.now(),
      reviewId,
    );

    return value;
  }


  // ==========================================================
  // RATING AGGREGATION
  // ==========================================================

  async getRatingSummary(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<ReviewRatingSummary> {
    const row =
      await this.db.first<{
        reviews_count: string;
        ratings_count: string;
        rating_sum: string;
        rating_average: string;
        rating_1: string;
        rating_2: string;
        rating_3: string;
        rating_4: string;
        rating_5: string;
        verified_reviews_count: string;
      }>(
        `
        SELECT
          reviews_count,
          ratings_count,
          rating_sum,
          rating_average,
          rating_1,
          rating_2,
          rating_3,
          rating_4,
          rating_5,
          verified_reviews_count
        FROM review_rating_summaries
        WHERE target_type = ?
          AND target_id = ?
        LIMIT 1
        `,
        targetType,
        targetId,
      );

    if (!row) {
      return {
        count: "0",
        average: "0",
        sum: "0",
        distribution:
          createEmptyRatingDistribution(),
        one_star: "0",
        two_star: "0",
        three_star: "0",
        four_star: "0",
        five_star: "0",
      };
    }

    return {
      count:
        metricToString(
          row.reviews_count,
        ),
      average:
        metricToString(
          row.rating_average,
        ),
      sum:
        metricToString(
          row.rating_sum,
        ),
      distribution: {
        "1":
          metricToString(
            row.rating_1,
          ),
        "2":
          metricToString(
            row.rating_2,
          ),
        "3":
          metricToString(
            row.rating_3,
          ),
        "4":
          metricToString(
            row.rating_4,
          ),
        "5":
          metricToString(
            row.rating_5,
          ),
      },
      one_star:
        metricToString(
          row.rating_1,
        ),
      two_star:
        metricToString(
          row.rating_2,
        ),
      three_star:
        metricToString(
          row.rating_3,
        ),
      four_star:
        metricToString(
          row.rating_4,
        ),
      five_star:
        metricToString(
          row.rating_5,
        ),
    };
  }


  async recalculateTargetSummary(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<ReviewRatingSummary> {
    const rows =
      await this.db.query<{
        rating: number;
        count: string;
        verified_count: string;
      }>(
        `
        SELECT
          rating,
          COUNT(*) AS count,
          SUM(
            CASE
              WHEN verified = 1
              THEN 1
              ELSE 0
            END
          ) AS verified_count
        FROM reviews
        WHERE
          target_type = ?
          AND target_id = ?
          AND status IN ('published')
        GROUP BY rating
        `,
        targetType,
        targetId,
      );

    const distribution =
      createEmptyRatingDistribution();

    let total =
      "0";

    let sum =
      "0";

    let verified =
      "0";

    for (const row of rows) {
      const rating =
        Number(row.rating);

      const count =
        metricToString(
          row.count,
        );

      if (
        rating >= 1 &&
        rating <= 5
      ) {
        distribution[
          String(
            rating,
          ) as keyof ReviewRatingDistribution
        ] = count;
      }

      total =
        addMetric(
          total,
          count,
        );

      sum =
        addMetric(
          sum,
          (
            BigInt(rating) *
            BigInt(count)
          ).toString(),
        );

      verified =
        addMetric(
          verified,
          metricToString(
            row.verified_count ??
              "0",
          ),
        );
    }

    const average =
      calculateRatingAverage(
        distribution,
      );

    const now =
      this.now();

    const existing =
      await this.db.first<{
        id: string;
      }>(
        `
        SELECT id
        FROM review_rating_summaries
        WHERE target_type = ?
          AND target_id = ?
        LIMIT 1
        `,
        targetType,
        targetId,
      );

    if (existing) {
      await this.db.run(
        `
        UPDATE review_rating_summaries
        SET
          reviews_count = ?,
          ratings_count = ?,
          rating_sum = ?,
          rating_average = ?,
          rating_1 = ?,
          rating_2 = ?,
          rating_3 = ?,
          rating_4 = ?,
          rating_5 = ?,
          verified_reviews_count = ?,
          updated_at = ?
        WHERE id = ?
        `,
        total,
        total,
        sum,
        average,
        distribution["1"],
        distribution["2"],
        distribution["3"],
        distribution["4"],
        distribution["5"],
        verified,
        now,
        existing.id,
      );
    } else {
      await this.db.run(
        `
        INSERT INTO review_rating_summaries (
          id,
          target_type,
          target_id,
          reviews_count,
          ratings_count,
          rating_sum,
          rating_average,
          rating_1,
          rating_2,
          rating_3,
          rating_4,
          rating_5,
          verified_reviews_count,
          helpful_count,
          reactions_count,
          replies_count,
          reports_count,
          created_at,
          updated_at
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, '0', '0', '0', '0', ?, ?
        )
        `,
        createId("rsummary"),
        targetType,
        targetId,
        total,
        total,
        sum,
        average,
        distribution["1"],
        distribution["2"],
        distribution["3"],
        distribution["4"],
        distribution["5"],
        verified,
        now,
        now,
      );
    }

    return {
      count: total,
      average,
      sum,
      distribution,
      one_star:
        distribution["1"],
      two_star:
        distribution["2"],
      three_star:
        distribution["3"],
      four_star:
        distribution["4"],
      five_star:
        distribution["5"],
    };
  }


  async aggregate(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<ReviewAggregateResult> {
    const summary =
      await this.getRatingSummary(
        targetType,
        targetId,
      );

    const metrics =
      await this.getTargetMetrics(
        targetType,
        targetId,
      );

    return {
      target_type:
        targetType,
      target_id:
        targetId,
      summary,
      metrics,
    };
  }


  private async getTargetMetrics(
    targetType: ReviewTargetType,
    targetId: string,
  ): Promise<ReviewMetrics> {
    const row =
      await this.db.first<ReviewQueryRow & {
        total_helpful: string;
        total_not_helpful: string;
        total_reactions: string;
        total_replies: string;
        total_reports: string;
        total_views: string;
      }>(
        `
        SELECT
          SUM(CAST(helpful_count AS INTEGER)) AS total_helpful,
          SUM(CAST(not_helpful_count AS INTEGER)) AS total_not_helpful,
          SUM(CAST(reactions_count AS INTEGER)) AS total_reactions,
          SUM(CAST(replies_count AS INTEGER)) AS total_replies,
          SUM(CAST(reports_count AS INTEGER)) AS total_reports,
          SUM(CAST(views_count AS INTEGER)) AS total_views
        FROM reviews
        WHERE
          target_type = ?
          AND target_id = ?
          AND status = 'published'
        `,
        targetType,
        targetId,
      );

    const summary =
      await this.getRatingSummary(
        targetType,
        targetId,
      );

    return {
      reviews:
        summary.count,
      ratings:
        summary.count,

      rating_sum:
        summary.sum,

      rating_average:
        summary.average,

      rating_1:
        summary.one_star,

      rating_2:
        summary.two_star,

      rating_3:
        summary.three_star,

      rating_4:
        summary.four_star,

      rating_5:
        summary.five_star,

      helpful:
        metricToString(
          row?.total_helpful ??
            "0",
        ),

      not_helpful:
        metricToString(
          row?.total_not_helpful ??
            "0",
        ),

      reactions:
        metricToString(
          row?.total_reactions ??
            "0",
        ),

      replies:
        metricToString(
          row?.total_replies ??
            "0",
        ),

      reports:
        metricToString(
          row?.total_reports ??
            "0",
        ),

      views:
        metricToString(
          row?.total_views ??
            "0",
        ),
    };
  }


  // ==========================================================
  // DUPLICATE CHECK
  // ==========================================================

  async checkDuplicate(
    input: ReviewDuplicateCheck,
  ): Promise<ReviewDuplicateCheck> {
    const identityParts: string[] = [];
    const params: unknown[] = [
      input.target_type,
      input.target_id,
    ];

    if (input.author_id) {
      identityParts.push(
        "author_id = ?",
      );
      params.push(
        input.author_id,
      );
    }

    if (input.visitor_id) {
      identityParts.push(
        "visitor_id = ?",
      );
      params.push(
        input.visitor_id,
      );
    }

    if (input.session_id) {
      identityParts.push(
        "session_id = ?",
      );
      params.push(
        input.session_id,
      );
    }

    if (identityParts.length === 0) {
      return {
        ...input,
        exists: false,
      };
    }

    const row =
      await this.db.first<{
        id: string;
      }>(
        `
        SELECT id
        FROM reviews
        WHERE
          target_type = ?
          AND target_id = ?
          AND status != 'deleted'
          AND (
            ${identityParts.join(" OR ")}
          )
        LIMIT 1
        `,
        ...params,
      );

    return {
      ...input,
      exists:
        Boolean(row),
      review_id:
        row?.id ?? null,
    };
  }


  // ==========================================================
  // BULK MODERATION
  // ==========================================================

  async bulkAction(
    action: ReviewBulkAction,
    adminId: string,
  ): Promise<ReviewBulkResult> {
    if (!adminId) {
      throw new AuthorizationError(
        "Admin ID is required",
      );
    }

    const successfulIds: string[] = [];
    const failedIds: string[] = [];

    const errors: Array<{
      review_id: string;
      code: string;
      message: string;
    }> = [];

    for (const reviewId of action.review_ids) {
      try {
        await this.moderate(
          reviewId,
          action.action,
          adminId,
          action.reason,
        );

        successfulIds.push(
          reviewId,
        );
      } catch (error) {
        failedIds.push(
          reviewId,
        );

        errors.push({
          review_id:
            reviewId,
          code:
            error instanceof ReviewError
              ? error.code
              : "UNKNOWN_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
    }

    return {
      requested:
        action.review_ids.length,
      processed:
        successfulIds.length +
        failedIds.length,
      succeeded:
        successfulIds.length,
      failed:
        failedIds.length,
      successful_ids:
        successfulIds,
      failed_ids:
        failedIds,
      errors,
    };
  }


  // ==========================================================
  // ADMIN STATISTICS
  // ==========================================================

  async getAdminStatistics(): Promise<ReviewAdminStatistics> {
    const rows =
      await this.db.query<{
        status: string;
        count: string;
      }>(
        `
        SELECT
          status,
          COUNT(*) AS count
        FROM reviews
        GROUP BY status
        `,
      );

    const result: ReviewAdminStatistics = {
      total: "0",

      pending: "0",
      published: "0",
      hidden: "0",
      rejected: "0",
      deleted: "0",
      spam: "0",

      verified: "0",

      average_rating: "0",

      rating_distribution:
        createEmptyRatingDistribution(),

      reports: "0",
      reactions: "0",
      replies: "0",

      helpful: "0",
      not_helpful: "0",
    };

    for (const row of rows) {
      const count =
        metricToString(
          row.count,
        );

      result.total =
        addMetric(
          result.total,
          count,
        );

      switch (row.status) {
        case "pending":
          result.pending =
            count;
          break;

        case "published":
          result.published =
            count;
          break;

        case "hidden":
          result.hidden =
            count;
          break;

        case "rejected":
          result.rejected =
            count;
          break;

        case "deleted":
          result.deleted =
            count;
          break;

        case "spam":
          result.spam =
            count;
          break;
      }
    }

    const aggregate =
      await this.db.first<{
        verified: string;
        reports: string;
        reactions: string;
        replies: string;
        helpful: string;
        not_helpful: string;
      }>(
        `
        SELECT
          SUM(
            CASE
              WHEN verified = 1
              THEN 1
              ELSE 0
            END
          ) AS verified,

          SUM(CAST(reports_count AS INTEGER))
            AS reports,

          SUM(CAST(reactions_count AS INTEGER))
            AS reactions,

          SUM(CAST(replies_count AS INTEGER))
            AS replies,

          SUM(CAST(helpful_count AS INTEGER))
            AS helpful,

          SUM(CAST(not_helpful_count AS INTEGER))
            AS not_helpful

        FROM reviews
        `,
      );

    result.verified =
      metricToString(
        aggregate?.verified ??
          "0",
      );

    result.reports =
      metricToString(
        aggregate?.reports ??
          "0",
      );

    result.reactions =
      metricToString(
        aggregate?.reactions ??
          "0",
      );

    result.replies =
      metricToString(
        aggregate?.replies ??
          "0",
      );

    result.helpful =
      metricToString(
        aggregate?.helpful ??
          "0",
      );

    result.not_helpful =
      metricToString(
        aggregate?.not_helpful ??
          "0",
      );

    const ratings =
      await this.db.query<{
        rating: number;
        count: string;
      }>(
        `
        SELECT
          rating,
          COUNT(*) AS count
        FROM reviews
        WHERE status = 'published'
        GROUP BY rating
        `,
      );

    let sum = "0";
    let count = "0";

    for (const row of ratings) {
      const rating =
        Number(row.rating);

      const current =
        metricToString(
          row.count,
        );

      if (
        rating >= 1 &&
        rating <= 5
      ) {
        result.rating_distribution[
          String(
            rating,
          ) as keyof ReviewRatingDistribution
        ] = current;

        sum =
          addMetric(
            sum,
            (
              BigInt(rating) *
              BigInt(current)
            ).toString(),
          );

        count =
          addMetric(
            count,
            current,
          );
      }
    }

    result.average_rating =
      calculateRatingAverage(
        result.rating_distribution,
      );

    return result;
  }


  // ==========================================================
  // PRIVATE HELPERS
  // ==========================================================

  private requireIdentity(
    actor: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
    },
  ): {
    userId?: string;
    visitorId?: string;
    sessionId?: string;
  } {
    if (
      !actor.userId &&
      !actor.visitorId &&
      !actor.sessionId
    ) {
      throw new AuthorizationError(
        "User, visitor or session identity is required",
      );
    }

    return actor;
  }


  private historyActionForModeration(
    action: string,
  ): string {
    switch (action) {
      case "approve":
        return REVIEW_HISTORY_ACTIONS.APPROVED;

      case "reject":
        return REVIEW_HISTORY_ACTIONS.REJECTED;

      case "hide":
        return REVIEW_HISTORY_ACTIONS.HIDDEN;

      case "delete":
        return REVIEW_HISTORY_ACTIONS.DELETED;

      case "restore":
        return REVIEW_HISTORY_ACTIONS.RESTORED;

      case "mark_spam":
        return REVIEW_HISTORY_ACTIONS.SPAMMED;

      case "unmark_spam":
        return REVIEW_HISTORY_ACTIONS.UNSPAMMED;

      case "pin":
        return REVIEW_HISTORY_ACTIONS.PINNED;

      case "unpin":
        return REVIEW_HISTORY_ACTIONS.UNPINNED;

      case "feature":
        return REVIEW_HISTORY_ACTIONS.FEATURED;

      case "unfeature":
        return REVIEW_HISTORY_ACTIONS.UNFEATURED;

      default:
        return REVIEW_HISTORY_ACTIONS.UPDATED;
    }
  }


  private eventForModeration(
    action: string,
  ): string {
    switch (action) {
      case "approve":
        return "published";

      case "hide":
        return "hidden";

      case "delete":
        return "deleted";

      case "restore":
        return "restored";

      default:
        return "updated";
    }
  }
}


export function createReviewService(
  env: Env,
): ReviewService {
  return new ReviewService(env);
}


export async function getReview(
  env: Env,
  id: string,
): Promise<Review | null> {
  return await createReviewService(
    env,
  ).getById(id);
}


export async function listReviews(
  env: Env,
  query: ReviewQuery = {},
): Promise<ReviewListResult> {
  return await createReviewService(
    env,
  ).list(query);
}


export async function createReview(
  env: Env,
  input: ReviewCreateInput,
  actor?: ReviewActor,
): Promise<ReviewCreateResult> {
  return await createReviewService(
    env,
  ).create(
    input,
    actor,
  );
}
