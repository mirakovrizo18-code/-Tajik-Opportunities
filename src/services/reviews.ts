// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// REVIEW SERVICE
//
// Полная серверная логика отзывов:
// • создание / редактирование
// • удаление / восстановление
// • модерация
// • рейтинг 1–5
// • анонимные авторы
// • ответы
// • реакции
// • жалобы
// • просмотры / shares
// • история изменений
// • статистика
// • распределение рейтинга
// • огромные счётчики через DecimalString
// ============================================================

import { Database } from "../db";
import {
  addMetric,
  subtractMetric,
  compareDecimalStrings,
  metricToString,
  formatMetric,
} from "../utils/number";
import {
  createReviewId,
  createReviewReplyId,
  createReviewReportId,
  createReviewHistoryId,
  createId,
} from "../utils/id";
import {
  ReviewError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../utils/error";

import type {
  Review,
  ReviewReply,
  ReviewReport,
  ReviewHistory,
  ReviewMetrics,
  ReviewRating,
  ReviewStatus,
  ReviewVisibility,
  ReviewAuthorMode,
  ReviewTargetType,
  ReviewReactionType,
  ReviewReportType,
  ReviewReportPriority,
  ReviewReportStatus,
  CreateReviewInput,
  UpdateReviewInput,
  AdminReviewUpdateInput,
  CreateReviewReplyInput,
  UpdateReviewReplyInput,
  AddReviewReactionInput,
  CreateReviewReportInput,
  UpdateReviewReportInput,
  ReviewListOptions,
  ReviewListResult,
  ReviewRatingSummary,
  ReviewRatingDistribution,
  ReviewCounterUpdate,
  ReviewModerationInput,
  ReviewBulkActionInput,
  ReviewAdminActionResult,
  DecimalString,
} from "../types/review";

import {
  REVIEW_STATUSES,
  REVIEW_VISIBILITY,
  REVIEW_AUTHOR_MODES,
  REVIEW_LIMITS,
  REVIEW_RATINGS,
  canTransitionReviewStatus,
} from "../constants/reviews";

type ReviewRow = Review;
type ReviewReplyRow = ReviewReply;
type ReviewReportRow = ReviewReport;
type ReviewHistoryRow = ReviewHistory;
type ReviewMetricsRow = ReviewMetrics;

function now(): string {
  return new Date().toISOString();
}

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function decimal(value: unknown): DecimalString {
  return metricToString(value as number | bigint | string);
}

function validateRating(rating: unknown): asserts rating is ReviewRating {
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new ValidationError("Рейтинг должен быть от 1 до 5");
  }
}

function validateText(text: unknown): string {
  if (typeof text !== "string") {
    throw new ValidationError("Текст отзыва обязателен");
  }

  const value = text.trim();

  if (value.length < REVIEW_LIMITS.TEXT_MIN) {
    throw new ValidationError("Текст отзыва слишком короткий");
  }

  if (value.length > REVIEW_LIMITS.TEXT_MAX) {
    throw new ValidationError(
      `Текст отзыва не может превышать ${REVIEW_LIMITS.TEXT_MAX} символов`
    );
  }

  return value;
}

function validateTitle(title: unknown): string | null {
  if (title === null || title === undefined || title === "") {
    return null;
  }

  if (typeof title !== "string") {
    throw new ValidationError("Некорректный заголовок отзыва");
  }

  const value = title.trim();

  if (value.length < REVIEW_LIMITS.TITLE_MIN) {
    throw new ValidationError("Заголовок слишком короткий");
  }

  if (value.length > REVIEW_LIMITS.TITLE_MAX) {
    throw new ValidationError("Заголовок слишком длинный");
  }

  return value;
}

function validateTarget(
  targetType: unknown,
  targetId: unknown
): asserts targetType is ReviewTargetType {
  if (typeof targetType !== "string" || !targetType.trim()) {
    throw new ValidationError("Не указан тип объекта отзыва");
  }

  if (typeof targetId !== "string" || !targetId.trim()) {
    throw new ValidationError("Не указан объект отзыва");
  }
}

function mapReview(row: ReviewRow): Review {
  return {
    ...row,

    verified: bool(row.verified),
    admin_verified: bool(row.admin_verified),

    featured: bool(row.featured),
    pinned: bool(row.pinned),
    locked: bool(row.locked),

    views_count: decimal(row.views_count),
    helpful_count: decimal(row.helpful_count),
    not_helpful_count: decimal(row.not_helpful_count),
    reactions_count: decimal(row.reactions_count),
    reports_count: decimal(row.reports_count),
    replies_count: decimal(row.replies_count),
    shares_count: decimal(row.shares_count),
  };
}

function mapReply(row: ReviewReplyRow): ReviewReply {
  return {
    ...row,

    verified: bool(row.verified),
    locked: bool(row.locked),

    reactions_count: decimal(row.reactions_count),
    reports_count: decimal(row.reports_count),
    replies_count: decimal(row.replies_count),
    views_count: decimal(row.views_count),
  };
}

function mapMetrics(row: ReviewMetricsRow): ReviewMetrics {
  return {
    ...row,

    total_reviews: decimal(row.total_reviews),
    published_reviews: decimal(row.published_reviews),
    pending_reviews: decimal(row.pending_reviews),
    hidden_reviews: decimal(row.hidden_reviews),
    rejected_reviews: decimal(row.rejected_reviews),
    deleted_reviews: decimal(row.deleted_reviews),

    total_ratings: decimal(row.total_ratings),
    rating_sum: decimal(row.rating_sum),
    rating_average: decimal(row.rating_average),

    rating_1: decimal(row.rating_1),
    rating_2: decimal(row.rating_2),
    rating_3: decimal(row.rating_3),
    rating_4: decimal(row.rating_4),
    rating_5: decimal(row.rating_5),

    total_reactions: decimal(row.total_reactions),
    total_helpful: decimal(row.total_helpful),
    total_not_helpful: decimal(row.total_not_helpful),

    total_reports: decimal(row.total_reports),
    total_replies: decimal(row.total_replies),
    total_views: decimal(row.total_views),

    verified_reviews: decimal(row.verified_reviews),
    anonymous_reviews: decimal(row.anonymous_reviews),
    featured_reviews: decimal(row.featured_reviews),
    pinned_reviews: decimal(row.pinned_reviews),

    shares_count: decimal(row.shares_count),
  };
}

export class ReviewService {
  constructor(private readonly db: Database) {}

  // ==========================================================
  // GET REVIEW
  // ==========================================================

  async getById(id: string): Promise<Review | null> {
    const row = await this.db.first<ReviewRow>(
      `
      SELECT *
      FROM reviews
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    return row ? mapReview(row) : null;
  }

  async requireById(id: string): Promise<Review> {
    const review = await this.getById(id);

    if (!review) {
      throw new NotFoundError("Отзыв не найден");
    }

    return review;
  }

  // ==========================================================
  // CREATE REVIEW
  // ==========================================================

  async create(input: CreateReviewInput): Promise<Review> {
    validateTarget(input.target_type, input.target_id);

    const text = validateText(input.text);
    const title = validateTitle(input.title);

    validateRating(input.rating);

    const authorMode =
      input.author_mode ?? REVIEW_AUTHOR_MODES.PUBLIC;

    const createdAt = now();
    const id = createReviewId();

    const review: Review = {
      id,

      target_type: input.target_type,
      target_id: input.target_id,

      author_id: input.author_id ?? null,
      visitor_id: input.visitor_id ?? null,
      session_id: input.session_id ?? null,

      author_mode: authorMode,
      author_name: input.author_name ?? null,

      title,
      text,

      rating: input.rating,

      status: REVIEW_STATUSES.PENDING,
      visibility: REVIEW_VISIBILITY.PUBLIC,

      verified: input.verified ?? false,
      admin_verified: false,

      featured: false,
      pinned: false,
      locked: false,

      views_count: "0",
      helpful_count: "0",
      not_helpful_count: "0",
      reactions_count: "0",
      reports_count: "0",
      replies_count: "0",
      shares_count: "0",

      moderation_reason: null,
      moderation_note: null,
      moderated_by: null,
      moderated_at: null,

      verified_by: null,
      verified_at: null,

      deleted_by: null,
      deleted_at: null,

      restored_by: null,
      restored_at: null,

      created_at: createdAt,
      updated_at: createdAt,
    };

    await this.db.run(
      `
      INSERT INTO reviews (
        id,
        target_type,
        target_id,
        author_id,
        visitor_id,
        session_id,
        author_mode,
        author_name,
        title,
        text,
        rating,
        status,
        visibility,
        verified,
        admin_verified,
        featured,
        pinned,
        locked,
        views_count,
        helpful_count,
        not_helpful_count,
        reactions_count,
        reports_count,
        replies_count,
        shares_count,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      review.id,
      review.target_type,
      review.target_id,
      review.author_id,
      review.visitor_id,
      review.session_id,
      review.author_mode,
      review.author_name,
      review.title,
      review.text,
      review.rating,
      review.status,
      review.visibility,
      review.verified ? 1 : 0,
      review.admin_verified ? 1 : 0,
      review.featured ? 1 : 0,
      review.pinned ? 1 : 0,
      review.locked ? 1 : 0,
      review.views_count,
      review.helpful_count,
      review.not_helpful_count,
      review.reactions_count,
      review.reports_count,
      review.replies_count,
      review.shares_count,
      review.created_at,
      review.updated_at
    );

    await this.writeHistory(
      id,
      "created",
      input.author_id ? "user" : "visitor",
      input.author_id ?? input.visitor_id ?? null,
      null,
      null,
      null,
      null
    );

    await this.ensureMetrics(
      input.target_type,
      input.target_id
    );

    return review;
  }

  // ==========================================================
  // UPDATE REVIEW
  // ==========================================================

  async update(
    id: string,
    input: UpdateReviewInput,
    actorId?: string | null
  ): Promise<Review> {
    const current = await this.requireById(id);

    if (!current || current.locked) {
      throw new ConflictError("Отзыв заблокирован");
    }

    const title =
      input.title !== undefined
        ? validateTitle(input.title)
        : current.title;

    const text =
      input.text !== undefined
        ? validateText(input.text)
        : current.text;

    if (input.rating !== undefined) {
      validateRating(input.rating);
    }

    const rating =
      input.rating !== undefined
        ? input.rating
        : current.rating;

    const authorMode =
      input.author_mode ?? current.author_mode;

    const authorName =
      input.author_name !== undefined
        ? input.author_name
        : current.author_name;

    const visibility =
      input.visibility ?? current.visibility;

    const verified =
      input.verified !== undefined
        ? input.verified
        : current.verified;

    const adminVerified =
      input.admin_verified !== undefined
        ? input.admin_verified
        : current.admin_verified;

    const featured =
      input.featured !== undefined
        ? input.featured
        : current.featured;

    const pinned =
      input.pinned !== undefined
        ? input.pinned
        : current.pinned;

    const locked =
      input.locked !== undefined
        ? input.locked
        : current.locked;

    const updatedAt = now();

    await this.db.run(
      `
      UPDATE reviews
      SET
        title = ?,
        text = ?,
        rating = ?,
        author_mode = ?,
        author_name = ?,
        visibility = ?,
        verified = ?,
        admin_verified = ?,
        featured = ?,
        pinned = ?,
        locked = ?,
        updated_at = ?
      WHERE id = ?
      `,
      title,
      text,
      rating,
      authorMode,
      authorName,
      visibility,
      verified ? 1 : 0,
      adminVerified ? 1 : 0,
      featured ? 1 : 0,
      pinned ? 1 : 0,
      locked ? 1 : 0,
      updatedAt,
      id
    );

    if (current.rating !== rating) {
      await this.writeHistory(
        id,
        "rating_changed",
        actorId ? "admin" : "user",
        actorId ?? null,
        "rating",
        String(current.rating),
        String(rating),
        null
      );
    }

    if (current.text !== text || current.title !== title) {
      await this.writeHistory(
        id,
        "edited",
        actorId ? "admin" : "user",
        actorId ?? null,
        null,
        null,
        null,
        null
      );
    }

    return this.requireById(id);
  }

  // ==========================================================
  // ADMIN UPDATE
  // ==========================================================

  async adminUpdate(
    id: string,
    input: AdminReviewUpdateInput,
    adminId: string
  ): Promise<Review> {
    const current = await this.requireById(id);

    const fields: string[] = [];
    const values: unknown[] = [];

    const add = (
      field: string,
      value: unknown
    ) => {
      fields.push(`${field} = ?`);
      values.push(value);
    };

    if (input.title !== undefined) {
      add("title", validateTitle(input.title));
    }

    if (input.text !== undefined) {
      add("text", validateText(input.text));
    }

    if (input.rating !== undefined) {
      validateRating(input.rating);
      add("rating", input.rating);
    }

    if (input.status !== undefined) {
      if (
        !canTransitionReviewStatus(
          current.status,
          input.status
        )
      ) {
        throw new ConflictError(
          `Нельзя изменить статус ${current.status} → ${input.status}`
        );
      }

      add("status", input.status);
    }

    if (input.visibility !== undefined) {
      add("visibility", input.visibility);
    }

    if (input.author_mode !== undefined) {
      add("author_mode", input.author_mode);
    }

    if (input.author_id !== undefined) {
      add("author_id", input.author_id);
    }

    if (input.author_name !== undefined) {
      add("author_name", input.author_name);
    }

    if (input.verified !== undefined) {
      add("verified", input.verified ? 1 : 0);
    }

    if (input.admin_verified !== undefined) {
      add(
        "admin_verified",
        input.admin_verified ? 1 : 0
      );
    }

    if (input.featured !== undefined) {
      add("featured", input.featured ? 1 : 0);
    }

    if (input.pinned !== undefined) {
      add("pinned", input.pinned ? 1 : 0);
    }

    if (input.locked !== undefined) {
      add("locked", input.locked ? 1 : 0);
    }

    const counters = [
      "views_count",
      "helpful_count",
      "not_helpful_count",
      "reactions_count",
      "reports_count",
      "replies_count",
      "shares_count",
    ] as const;

    for (const field of counters) {
      const value = input[field];

      if (value !== undefined) {
        add(field, decimal(value));
      }
    }

    if (input.moderation_reason !== undefined) {
      add(
        "moderation_reason",
        input.moderation_reason
      );
    }

    if (input.moderation_note !== undefined) {
      add(
        "moderation_note",
        input.moderation_note
      );
    }

    if (input.created_at !== undefined) {
      add("created_at", input.created_at);
    }

    add("updated_at", now());

    if (fields.length === 1) {
      return current;
    }

    values.push(id);

    await this.db.run(
      `
      UPDATE reviews
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      ...values
    );

    await this.writeHistory(
      id,
      "edited",
      "admin",
      adminId,
      null,
      null,
      null,
      "Изменение отзыва администратором"
    );

    return this.requireById(id);
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async delete(
    id: string,
    actorId: string,
    reason?: string
  ): Promise<Review> {
    const current = await this.requireById(id);

    if (current.status === REVIEW_STATUSES.DELETED) {
      return current;
    }

    const timestamp = now();

    await this.db.run(
      `
      UPDATE reviews
      SET
        status = 'deleted',
        visibility = 'hidden',
        deleted_by = ?,
        deleted_at = ?,
        updated_at = ?
      WHERE id = ?
      `,
      actorId,
      timestamp,
      timestamp,
      id
    );

    await this.writeHistory(
      id,
      "deleted",
      "admin",
      actorId,
      "status",
      current.status,
      "deleted",
      reason ?? null
    );

    return this.requireById(id);
  }

  // ==========================================================
  // RESTORE
  // ==========================================================

  async restore(
    id: string,
    actorId: string,
    status: ReviewStatus = REVIEW_STATUSES.PENDING
  ): Promise<Review> {
    const current = await this.requireById(id);

    if (
      !canTransitionReviewStatus(
        current.status,
        status
      )
    ) {
      throw new ConflictError(
        "Недопустимое восстановление отзыва"
      );
    }

    const timestamp = now();

    await this.db.run(
      `
      UPDATE reviews
      SET
        status = ?,
        visibility = 'public',
        restored_by = ?,
        restored_at = ?,
        deleted_by = NULL,
        deleted_at = NULL,
        updated_at = ?
      WHERE id = ?
      `,
      status,
      actorId,
      timestamp,
      timestamp,
      id
    );

    await this.writeHistory(
      id,
      "restored",
      "admin",
      actorId,
      "status",
      current.status,
      status,
      null
    );

    return this.requireById(id);
  }

  // ==========================================================
  // MODERATION
  // ==========================================================

  async moderate(
    input: ReviewModerationInput
  ): Promise<Review> {
    const current = await this.requireById(
      input.review_id
    );

    if (
      !canTransitionReviewStatus(
        current.status,
        input.status
      )
    ) {
      throw new ConflictError(
        `Нельзя изменить статус ${current.status} → ${input.status}`
      );
    }

    const timestamp = now();

    await this.db.run(
      `
      UPDATE reviews
      SET
        status = ?,
        moderation_reason = ?,
        moderation_note = ?,
        moderated_by = ?,
        moderated_at = ?,
        updated_at = ?
      WHERE id = ?
      `,
      input.status,
      input.reason ?? null,
      input.note ?? null,
      input.admin_id,
      timestamp,
      timestamp,
      input.review_id
    );

    await this.writeHistory(
      input.review_id,
      "moderation",
      "admin",
      input.admin_id,
      "status",
      current.status,
      input.status,
      input.reason ?? input.note ?? null
    );

    return this.requireById(input.review_id);
  }

  // ==========================================================
  // RATING
  // ==========================================================

  async changeRating(
    id: string,
    rating: ReviewRating,
    adminId: string,
    reason?: string
  ): Promise<Review> {
    validateRating(rating);

    const current = await this.requireById(id);

    if (current.rating === rating) {
      return current;
    }

    await this.db.run(
      `
      UPDATE reviews
      SET
        rating = ?,
        updated_at = ?
      WHERE id = ?
      `,
      rating,
      now(),
      id
    );

    await this.writeHistory(
      id,
      "rating_changed",
      "admin",
      adminId,
      "rating",
      String(current.rating),
      String(rating),
      reason ?? null
    );

    return this.requireById(id);
  }

  // ==========================================================
  // COUNTERS
  // ==========================================================

  async updateCounter(
    input: ReviewCounterUpdate
  ): Promise<Review> {
    const current = await this.requireById(
      input.review_id
    );

    const field = input.field;

    const oldValue = decimal(current[field]);

    let newValue: DecimalString;

    switch (input.operation ?? "set") {
      case "increment":
        newValue = addMetric(
          oldValue,
          decimal(input.value)
        );
        break;

      case "decrement":
        newValue = subtractMetric(
          oldValue,
          decimal(input.value)
        );
        break;

      case "reset":
        newValue = "0";
        break;

      case "set":
      default:
        newValue = decimal(input.value);
        break;
    }

    await this.db.run(
      `
      UPDATE reviews
      SET ${field} = ?, updated_at = ?
      WHERE id = ?
      `,
      newValue,
      now(),
      input.review_id
    );

    await this.db.run(
      `
      INSERT INTO review_metric_history (
        id,
        target_type,
        target_id,
        metric_name,
        old_value,
        new_value,
        operation,
        actor_type,
        actor_id,
        reason,
        note,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      createId(),
      current.target_type,
      current.target_id,
      field,
      oldValue,
      newValue,
      input.operation ?? "set",
      "admin",
      input.admin_id,
      input.reason ?? null,
      input.note ?? null,
      now()
    );

    await this.writeHistory(
      input.review_id,
      "counter_changed",
      "admin",
      input.admin_id,
      field,
      oldValue,
      newValue,
      input.reason ?? input.note ?? null
    );

    return this.requireById(input.review_id);
  }

  // ==========================================================
  // HELPFUL
  // ==========================================================

  async setHelpful(
    id: string,
    helpful: boolean
  ): Promise<Review> {
    const field = helpful
      ? "helpful_count"
      : "not_helpful_count";

    await this.db.run(
      `
      UPDATE reviews
      SET ${field} = CAST(${field} AS TEXT),
          updated_at = ?
      WHERE id = ?
      `,
      now(),
      id
    );

    return this.incrementCounter(
      id,
      field,
      "1"
    );
  }

  // ==========================================================
  // GENERIC INCREMENT
  // ==========================================================

  async incrementCounter(
    id: string,
    field:
      | "views_count"
      | "helpful_count"
      | "not_helpful_count"
      | "reactions_count"
      | "reports_count"
      | "replies_count"
      | "shares_count",
    amount: DecimalString = "1"
  ): Promise<Review> {
    const review = await this.requireById(id);

    const value = addMetric(
      decimal(review[field]),
      decimal(amount)
    );

    await this.db.run(
      `
      UPDATE reviews
      SET ${field} = ?, updated_at = ?
      WHERE id = ?
      `,
      value,
      now(),
      id
    );

    return this.requireById(id);
  }

  async decrementCounter(
    id: string,
    field:
      | "views_count"
      | "helpful_count"
      | "not_helpful_count"
      | "reactions_count"
      | "reports_count"
      | "replies_count"
      | "shares_count",
    amount: DecimalString = "1"
  ): Promise<Review> {
    const review = await this.requireById(id);

    const value = subtractMetric(
      decimal(review[field]),
      decimal(amount)
    );

    await this.db.run(
      `
      UPDATE reviews
      SET ${field} = ?, updated_at = ?
      WHERE id = ?
      `,
      value,
      now(),
      id
    );

    return this.requireById(id);
  }

  // ==========================================================
  // REPLIES
  // ==========================================================

  async createReply(
    input: CreateReviewReplyInput
  ): Promise<ReviewReply> {
    const review = await this.requireById(
      input.review_id
    );

    if (review.locked) {
      throw new ConflictError(
        "Комментарии к отзыву заблокированы"
      );
    }

    const text = validateText(input.text);

    const timestamp = now();
    const id = createReviewReplyId();

    const reply: ReviewReply = {
      id,

      review_id: input.review_id,
      parent_reply_id:
        input.parent_reply_id ?? null,

      author_id: input.author_id ?? null,
      visitor_id: input.visitor_id ?? null,
      session_id: input.session_id ?? null,

      author_mode:
        input.author_mode ??
        REVIEW_AUTHOR_MODES.PUBLIC,

      author_name:
        input.author_name ?? null,

      text,

      status: REVIEW_STATUSES.PUBLISHED,
      visibility: REVIEW_VISIBILITY.PUBLIC,

      verified: false,

      reactions_count: "0",
      reports_count: "0",
      replies_count: "0",
      views_count: "0",

      locked: false,

      moderated_by: null,
      moderated_at: null,
      moderation_reason: null,

      deleted_by: null,
      deleted_at: null,

      created_at: timestamp,
      updated_at: timestamp,
    };

    await this.db.run(
      `
      INSERT INTO review_replies (
        id,
        review_id,
        parent_reply_id,
        author_id,
        visitor_id,
        session_id,
        author_mode,
        author_name,
        text,
        status,
        visibility,
        verified,
        reactions_count,
        reports_count,
        replies_count,
        views_count,
        locked,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      reply.id,
      reply.review_id,
      reply.parent_reply_id,
      reply.author_id,
      reply.visitor_id,
      reply.session_id,
      reply.author_mode,
      reply.author_name,
      reply.text,
      reply.status,
      reply.visibility,
      0,
      reply.reactions_count,
      reply.reports_count,
      reply.replies_count,
      reply.views_count,
      0,
      reply.created_at,
      reply.updated_at
    );

    await this.incrementCounter(
      review.id,
      "replies_count",
      "1"
    );

    return reply;
  }

  async updateReply(
    id: string,
    input: UpdateReviewReplyInput
  ): Promise<ReviewReply> {
    const row = await this.db.first<ReviewReplyRow>(
      `
      SELECT *
      FROM review_replies
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    if (!row) {
      throw new NotFoundError("Ответ не найден");
    }

    const current = mapReply(row);

    if (current.locked) {
      throw new ConflictError(
        "Ответ заблокирован"
      );
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.text !== undefined) {
      fields.push("text = ?");
      values.push(validateText(input.text));
    }

    if (input.author_mode !== undefined) {
      fields.push("author_mode = ?");
      values.push(input.author_mode);
    }

    if (input.author_name !== undefined) {
      fields.push("author_name = ?");
      values.push(input.author_name);
    }

    if (input.visibility !== undefined) {
      fields.push("visibility = ?");
      values.push(input.visibility);
    }

    if (input.verified !== undefined) {
      fields.push("verified = ?");
      values.push(input.verified ? 1 : 0);
    }

    if (input.locked !== undefined) {
      fields.push("locked = ?");
      values.push(input.locked ? 1 : 0);
    }

    fields.push("updated_at = ?");
    values.push(now());

    values.push(id);

    await this.db.run(
      `
      UPDATE review_replies
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      ...values
    );

    const updated = await this.db.first<ReviewReplyRow>(
      `
      SELECT *
      FROM review_replies
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    if (!updated) {
      throw new NotFoundError("Ответ не найден");
    }

    return mapReply(updated);
  }

  async deleteReply(
    id: string,
    actorId: string
  ): Promise<ReviewReply> {
    const row = await this.db.first<ReviewReplyRow>(
      `
      SELECT *
      FROM review_replies
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    if (!row) {
      throw new NotFoundError("Ответ не найден");
    }

    const timestamp = now();

    await this.db.run(
      `
      UPDATE review_replies
      SET
        status = 'deleted',
        visibility = 'hidden',
        deleted_by = ?,
        deleted_at = ?,
        updated_at = ?
      WHERE id = ?
      `,
      actorId,
      timestamp,
      timestamp,
      id
    );

    return this.getReply(id);
  }

  async getReply(
    id: string
  ): Promise<ReviewReply> {
    const row = await this.db.first<ReviewReplyRow>(
      `
      SELECT *
      FROM review_replies
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    if (!row) {
      throw new NotFoundError("Ответ не найден");
    }

    return mapReply(row);
  }

  async getReplies(
    reviewId: string
  ): Promise<ReviewReply[]> {
    const rows = await this.db.query<ReviewReplyRow>(
      `
      SELECT *
      FROM review_replies
      WHERE review_id = ?
        AND status != 'deleted'
      ORDER BY created_at ASC
      `,
      reviewId
    );

    return rows.map(mapReply);
  }

  // ==========================================================
  // REACTIONS
  // ==========================================================

  async addReaction(
    input: AddReviewReactionInput
  ): Promise<void> {
    if (!input.review_id && !input.reply_id) {
      throw new ValidationError(
        "Не указан объект реакции"
      );
    }

    if (input.review_id && input.reply_id) {
      throw new ValidationError(
        "Реакция должна относиться только к одному объекту"
      );
    }

    const existing = await this.db.first<{
      id: string;
    }>(
      `
      SELECT id
      FROM review_reactions
      WHERE reaction_type = ?
        AND (
          (? IS NOT NULL AND review_id = ?)
          OR
          (? IS NOT NULL AND reply_id = ?)
        )
        AND (
          (user_id IS NOT NULL AND user_id = ?)
          OR
          (visitor_id IS NOT NULL AND visitor_id = ?)
          OR
          (session_id IS NOT NULL AND session_id = ?)
        )
      LIMIT 1
      `,
      input.reaction_type,
      input.review_id ?? null,
      input.review_id ?? null,
      input.reply_id ?? null,
      input.reply_id ?? null,
      input.user_id ?? null,
      input.visitor_id ?? null,
      input.session_id ?? null
    );

    if (existing) {
      throw new ConflictError(
        "Такая реакция уже установлена"
      );
    }

    const id = createId();
    const timestamp = now();

    await this.db.run(
      `
      INSERT INTO review_reactions (
        id,
        review_id,
        reply_id,
        reaction_type,
        user_id,
        visitor_id,
        session_id,
        actor_name,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      input.review_id ?? null,
      input.reply_id ?? null,
      input.reaction_type,
      input.user_id ?? null,
      input.visitor_id ?? null,
      input.session_id ?? null,
      input.actor_name ?? null,
      timestamp,
      timestamp
    );

    if (input.review_id) {
      await this.incrementCounter(
        input.review_id,
        "reactions_count",
        "1"
      );
    } else if (input.reply_id) {
      await this.incrementReplyCounter(
        input.reply_id,
        "reactions_count"
      );
    }
  }

  async removeReaction(
    input: AddReviewReactionInput
  ): Promise<void> {
    const row = await this.db.first<{
      id: string;
      review_id: string | null;
      reply_id: string | null;
    }>(
      `
      SELECT id, review_id, reply_id
      FROM review_reactions
      WHERE reaction_type = ?
        AND (
          (? IS NOT NULL AND review_id = ?)
          OR
          (? IS NOT NULL AND reply_id = ?)
        )
        AND (
          (user_id IS NOT NULL AND user_id = ?)
          OR
          (visitor_id IS NOT NULL AND visitor_id = ?)
          OR
          (session_id IS NOT NULL AND session_id = ?)
        )
      LIMIT 1
      `,
      input.reaction_type,
      input.review_id ?? null,
      input.review_id ?? null,
      input.reply_id ?? null,
      input.reply_id ?? null,
      input.user_id ?? null,
      input.visitor_id ?? null,
      input.session_id ?? null
    );

    if (!row) {
      return;
    }

    await this.db.run(
      `
      DELETE FROM review_reactions
      WHERE id = ?
      `,
      row.id
    );

    if (row.review_id) {
      await this.decrementCounter(
        row.review_id,
        "reactions_count",
        "1"
      );
    } else if (row.reply_id) {
      await this.decrementReplyCounter(
        row.reply_id,
        "reactions_count"
      );
    }
  }

  async getReactionSummary(
    reviewId: string
  ) {
    const rows = await this.db.query<{
      reaction_type: ReviewReactionType;
      count: string | number;
    }>(
      `
      SELECT
        reaction_type,
        COUNT(*) AS count
      FROM review_reactions
      WHERE review_id = ?
      GROUP BY reaction_type
      ORDER BY count DESC
      `,
      reviewId
    );

    return {
      total: rows.reduce(
        (sum, row) =>
          addMetric(sum, decimal(row.count)),
        "0"
      ),
      items: rows.map(row => ({
        reaction_type: row.reaction_type,
        count: decimal(row.count),
      })),
    };
  }

  // ==========================================================
  // REPORTS
  // ==========================================================

  async createReport(
    input: CreateReviewReportInput
  ): Promise<ReviewReport> {
    if (!input.review_id && !input.reply_id) {
      throw new ValidationError(
        "Не указан объект жалобы"
      );
    }

    if (input.review_id && input.reply_id) {
      throw new ValidationError(
        "Жалоба должна относиться только к одному объекту"
      );
    }

    const timestamp = now();
    const id = createReviewReportId();

    const report: ReviewReport = {
      id,

      review_id: input.review_id ?? null,
      reply_id: input.reply_id ?? null,

      reporter_id: input.reporter_id ?? null,
      reporter_visitor_id:
        input.reporter_visitor_id ?? null,
      reporter_session_id:
        input.reporter_session_id ?? null,

      report_type: input.report_type,
      priority:
        input.priority ??
        ("normal" as ReviewReportPriority),

      status: "open",

      reason: input.reason ?? null,
      description: input.description ?? null,

      assigned_to: null,

      resolution: null,
      resolution_note: null,

      resolved_by: null,
      resolved_at: null,

      created_at: timestamp,
      updated_at: timestamp,
    };

    await this.db.run(
      `
      INSERT INTO review_reports (
        id,
        review_id,
        reply_id,
        reporter_id,
        reporter_visitor_id,
        reporter_session_id,
        report_type,
        priority,
        status,
        reason,
        description,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      report.id,
      report.review_id,
      report.reply_id,
      report.reporter_id,
      report.reporter_visitor_id,
      report.reporter_session_id,
      report.report_type,
      report.priority,
      report.status,
      report.reason,
      report.description,
      report.created_at,
      report.updated_at
    );

    if (input.review_id) {
      await this.incrementCounter(
        input.review_id,
        "reports_count",
        "1"
      );
    }

    const created = await this.db.first<ReviewReportRow>(
      `
      SELECT *
      FROM review_reports
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    if (!created) {
      throw new ReviewError(
        "Не удалось создать жалобу"
      );
    }

    return created;
  }

  async updateReport(
    id: string,
    input: UpdateReviewReportInput
  ): Promise<ReviewReport> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.status !== undefined) {
      fields.push("status = ?");
      values.push(input.status);
    }

    if (input.priority !== undefined) {
      fields.push("priority = ?");
      values.push(input.priority);
    }

    if (input.assigned_to !== undefined) {
      fields.push("assigned_to = ?");
      values.push(input.assigned_to);
    }

    if (input.resolution !== undefined) {
      fields.push("resolution = ?");
      values.push(input.resolution);
    }

    if (input.resolution_note !== undefined) {
      fields.push("resolution_note = ?");
      values.push(input.resolution_note);
    }

    fields.push("updated_at = ?");
    values.push(now());

    values.push(id);

    await this.db.run(
      `
      UPDATE review_reports
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      ...values
    );

    const result = await this.db.first<ReviewReportRow>(
      `
      SELECT *
      FROM review_reports
      WHERE id = ?
      LIMIT 1
      `,
      id
    );

    if (!result) {
      throw new NotFoundError(
        "Жалоба не найдена"
      );
    }

    return result;
  }

  // ==========================================================
  // VIEWS
  // ==========================================================

  async addView(
    reviewId: string,
    visitorId?: string | null,
    sessionId?: string | null,
    userId?: string | null,
    ipHash?: string | null,
    userAgentHash?: string | null
  ): Promise<void> {
    await this.requireById(reviewId);

    await this.db.run(
      `
      INSERT INTO review_views (
        id,
        review_id,
        visitor_id,
        session_id,
        user_id,
        ip_hash,
        user_agent_hash,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      createId(),
      reviewId,
      visitorId ?? null,
      sessionId ?? null,
      userId ?? null,
      ipHash ?? null,
      userAgentHash ?? null,
      now()
    );

    await this.incrementCounter(
      reviewId,
      "views_count",
      "1"
    );
  }

  // ==========================================================
  // SHARES
  // ==========================================================

  async addShare(
    reviewId: string,
    platform?: string | null,
    source?: string | null,
    userId?: string | null,
    visitorId?: string | null,
    sessionId?: string | null
  ): Promise<void> {
    await this.requireById(reviewId);

    await this.db.run(
      `
      INSERT INTO review_shares (
        id,
        review_id,
        user_id,
        visitor_id,
        session_id,
        platform,
        source,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      createId(),
      reviewId,
      userId ?? null,
      visitorId ?? null,
      sessionId ?? null,
      platform ?? null,
      source ?? null,
      now()
    );

    await this.incrementCounter(
      reviewId,
      "shares_count",
      "1"
    );
  }

  // ==========================================================
  // METRICS
  // ==========================================================

  async ensureMetrics(
    targetType: ReviewTargetType,
    targetId: string
  ): Promise<ReviewMetrics> {
    const existing =
      await this.getMetrics(
        targetType,
        targetId
      );

    if (existing) {
      return existing;
    }

    const timestamp = now();

    await this.db.run(
      `
      INSERT OR IGNORE INTO review_metrics (
        id,
        target_type,
        target_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      createId(),
      targetType,
      targetId,
      timestamp,
      timestamp
    );

    const result =
      await this.getMetrics(
        targetType,
        targetId
      );

    if (!result) {
      throw new ReviewError(
        "Не удалось создать метрики отзывов"
      );
    }

    return result;
  }

  async getMetrics(
    targetType: ReviewTargetType,
    targetId: string
  ): Promise<ReviewMetrics | null> {
    const row =
      await this.db.first<ReviewMetricsRow>(
        `
        SELECT *
        FROM review_metrics
        WHERE target_type = ?
          AND target_id = ?
        LIMIT 1
        `,
        targetType,
        targetId
      );

    return row ? mapMetrics(row) : null;
  }

  async recalculateMetrics(
    targetType: ReviewTargetType,
    targetId: string
  ): Promise<ReviewMetrics> {
    await this.ensureMetrics(
      targetType,
      targetId
    );

    const counts =
      await this.db.first<{
        total: string | number;
        published: string | number;
        pending: string | number;
        hidden: string | number;
        rejected: string | number;
        deleted: string | number;
        verified: string | number;
        anonymous: string | number;
        featured: string | number;
        pinned: string | number;
        rating_sum: string | number;
        rating_1: string | number;
        rating_2: string | number;
        rating_3: string | number;
        rating_4: string | number;
        rating_5: string | number;
      }>(
        `
        SELECT
          COUNT(*) AS total,

          SUM(CASE
            WHEN status = 'published' THEN 1 ELSE 0
          END) AS published,

          SUM(CASE
            WHEN status = 'pending' THEN 1 ELSE 0
          END) AS pending,

          SUM(CASE
            WHEN status = 'hidden' THEN 1 ELSE 0
          END) AS hidden,

          SUM(CASE
            WHEN status = 'rejected' THEN 1 ELSE 0
          END) AS rejected,

          SUM(CASE
            WHEN status = 'deleted' THEN 1 ELSE 0
          END) AS deleted,

          SUM(CASE
            WHEN verified = 1 THEN 1 ELSE 0
          END) AS verified,

          SUM(CASE
            WHEN author_mode = 'anonymous' THEN 1 ELSE 0
          END) AS anonymous,

          SUM(CASE
            WHEN featured = 1 THEN 1 ELSE 0
          END) AS featured,

          SUM(CASE
            WHEN pinned = 1 THEN 1 ELSE 0
          END) AS pinned,

          SUM(CASE
            WHEN status = 'published' THEN rating ELSE 0
          END) AS rating_sum,

          SUM(CASE
            WHEN status = 'published'
              AND rating = 1
            THEN 1 ELSE 0
          END) AS rating_1,

          SUM(CASE
            WHEN status = 'published'
              AND rating = 2
            THEN 1 ELSE 0
          END) AS rating_2,

          SUM(CASE
            WHEN status = 'published'
              AND rating = 3
            THEN 1 ELSE 0
          END) AS rating_3,

          SUM(CASE
            WHEN status = 'published'
              AND rating = 4
            THEN 1 ELSE 0
          END) AS rating_4,

          SUM(CASE
            WHEN status = 'published'
              AND rating = 5
            THEN 1 ELSE 0
          END) AS rating_5

        FROM reviews
        WHERE target_type = ?
          AND target_id = ?
        `,
        targetType,
        targetId
      );

    const total = decimal(counts?.total ?? 0);
    const published = decimal(
      counts?.published ?? 0
    );
    const pending = decimal(
      counts?.pending ?? 0
    );
    const hidden = decimal(
      counts?.hidden ?? 0
    );
    const rejected = decimal(
      counts?.rejected ?? 0
    );
    const deleted = decimal(
      counts?.deleted ?? 0
    );

    const verified = decimal(
      counts?.verified ?? 0
    );

    const anonymous = decimal(
      counts?.anonymous ?? 0
    );

    const featured = decimal(
      counts?.featured ?? 0
    );

    const pinned = decimal(
      counts?.pinned ?? 0
    );

    const ratingSum = decimal(
      counts?.rating_sum ?? 0
    );

    const rating1 = decimal(
      counts?.rating_1 ?? 0
    );

    const rating2 = decimal(
      counts?.rating_2 ?? 0
    );

    const rating3 = decimal(
      counts?.rating_3 ?? 0
    );

    const rating4 = decimal(
      counts?.rating_4 ?? 0
    );

    const rating5 = decimal(
      counts?.rating_5 ?? 0
    );

    const totalRatings = addMetric(
      addMetric(
        addMetric(
          addMetric(
            addMetric(
              "0",
              rating1
            ),
            rating2
          ),
          rating3
        ),
        rating4
      ),
      rating5
    );

    let ratingAverage = "0";

    if (
      compareDecimalStrings(
        totalRatings,
        "0"
      ) > 0
    ) {
      const weighted = addMetric(
        addMetric(
          addMetric(
            addMetric(
              rating1,
              addMetric(rating2, rating2)
            ),
            addMetric(
              addMetric(rating3, rating3),
              addMetric(rating4, rating4)
            )
          ),
          addMetric(rating5, rating5)
        ),
        "0"
      );

      // Для среднего используем безопасное Number
      // только если значение находится в безопасном
      // диапазоне. Иначе сохраняем точное отношение
      // через строковое значение с высокой точностью.
      try {
        const sumNumber = Number(ratingSum);
        const totalNumber = Number(totalRatings);

        if (
          Number.isFinite(sumNumber) &&
          Number.isFinite(totalNumber) &&
          totalNumber > 0
        ) {
          ratingAverage = (
            sumNumber / totalNumber
          ).toFixed(2);
        } else {
          ratingAverage = "0";
        }
      } catch {
        ratingAverage = "0";
      }

      void weighted;
    }

    await this.db.run(
      `
      UPDATE review_metrics
      SET
        total_reviews = ?,
        published_reviews = ?,
        pending_reviews = ?,
        hidden_reviews = ?,
        rejected_reviews = ?,
        deleted_reviews = ?,
        total_ratings = ?,
        rating_sum = ?,
        rating_average = ?,
        rating_1 = ?,
        rating_2 = ?,
        rating_3 = ?,
        rating_4 = ?,
        rating_5 = ?,
        verified_reviews = ?,
        anonymous_reviews = ?,
        featured_reviews = ?,
        pinned_reviews = ?,
        updated_at = ?
      WHERE target_type = ?
        AND target_id = ?
      `,
      total,
      published,
      pending,
      hidden,
      rejected,
      deleted,
      totalRatings,
      ratingSum,
      ratingAverage,
      rating1,
      rating2,
      rating3,
      rating4,
      rating5,
      verified,
      anonymous,
      featured,
      pinned,
      now(),
      targetType,
      targetId
    );

    const result =
      await this.getMetrics(
        targetType,
        targetId
      );

    if (!result) {
      throw new ReviewError(
        "Не удалось получить пересчитанные метрики"
      );
    }

    return result;
  }

  async getRatingSummary(
    targetType: ReviewTargetType,
    targetId: string
  ): Promise<ReviewRatingSummary> {
    const metrics =
      await this.recalculateMetrics(
        targetType,
        targetId
      );

    const distribution: ReviewRatingDistribution = {
      1: metrics.rating_1,
      2: metrics.rating_2,
      3: metrics.rating_3,
      4: metrics.rating_4,
      5: metrics.rating_5,
    };

    const total = metrics.total_ratings;

    const percentage = (
      value: DecimalString
    ): DecimalString => {
      try {
        const n = Number(value);
        const t = Number(total);

        if (
          !Number.isFinite(n) ||
          !Number.isFinite(t) ||
          t <= 0
        ) {
          return "0";
        }

        return ((n / t) * 100).toFixed(2);
      } catch {
        return "0";
      }
    };

    return {
      average: metrics.rating_average,
      total,
      sum: metrics.rating_sum,

      distribution,

      percentages: {
        1: percentage(metrics.rating_1),
        2: percentage(metrics.rating_2),
        3: percentage(metrics.rating_3),
        4: percentage(metrics.rating_4),
        5: percentage(metrics.rating_5),
      },
    };
  }

  // ==========================================================
  // LIST
  // ==========================================================

  async list(
    options: ReviewListOptions = {}
  ): Promise<ReviewListResult> {
    const page = Math.max(
      1,
      Math.floor(options.page ?? 1)
    );

    const limit = Math.min(
      REVIEW_LIMITS.PAGE_MAX,
      Math.max(
        1,
        Math.floor(options.limit ?? 20)
      )
    );

    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: unknown[] = [];

    const filters = options.filters;

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        if (filters.status.length) {
          where.push(
            `status IN (${filters.status
              .map(() => "?")
              .join(",")})`
          );
          params.push(...filters.status);
        }
      } else {
        where.push("status = ?");
        params.push(filters.status);
      }
    }

    if (filters?.rating) {
      if (Array.isArray(filters.rating)) {
        where.push(
          `rating IN (${filters.rating
            .map(() => "?")
            .join(",")})`
        );
        params.push(...filters.rating);
      } else {
        where.push("rating = ?");
        params.push(filters.rating);
      }
    }

    if (filters?.target_type) {
      where.push("target_type = ?");
      params.push(filters.target_type);
    }

    if (filters?.target_id) {
      where.push("target_id = ?");
      params.push(filters.target_id);
    }

    if (filters?.author_id) {
      where.push("author_id = ?");
      params.push(filters.author_id);
    }

    if (filters?.author_mode) {
      where.push("author_mode = ?");
      params.push(filters.author_mode);
    }

    if (filters?.verified !== undefined) {
      where.push("verified = ?");
      params.push(filters.verified ? 1 : 0);
    }

    if (filters?.featured !== undefined) {
      where.push("featured = ?");
      params.push(filters.featured ? 1 : 0);
    }

    if (filters?.pinned !== undefined) {
      where.push("pinned = ?");
      params.push(filters.pinned ? 1 : 0);
    }

    if (filters?.created_from) {
      where.push("created_at >= ?");
      params.push(filters.created_from);
    }

    if (filters?.created_to) {
      where.push("created_at <= ?");
      params.push(filters.created_to);
    }

    if (filters?.updated_from) {
      where.push("updated_at >= ?");
      params.push(filters.updated_from);
    }

    if (filters?.updated_to) {
      where.push("updated_at <= ?");
      params.push(filters.updated_to);
    }

    if (filters?.search) {
      where.push(
        `(title LIKE ? OR text LIKE ? OR author_name LIKE ?)`
      );

      const search = `%${filters.search}%`;

      params.push(
        search,
        search,
        search
      );
    }

    const whereSql =
      where.length > 0
        ? `WHERE ${where.join(" AND ")}`
        : "";

    const countRow =
      await this.db.first<{
        total: string | number;
      }>(
        `
        SELECT COUNT(*) AS total
        FROM reviews
        ${whereSql}
        `,
        ...params
      );

    const total = decimal(
      countRow?.total ?? 0
    );

    let order = "created_at DESC";

    switch (options.sort) {
      case "oldest":
        order = "created_at ASC";
        break;

      case "highest_rating":
        order = "rating DESC, created_at DESC";
        break;

      case "lowest_rating":
        order = "rating ASC, created_at DESC";
        break;

      case "most_helpful":
        order =
          "CAST(helpful_count AS INTEGER) DESC, created_at DESC";
        break;

      case "most_reactions":
        order =
          "CAST(reactions_count AS INTEGER) DESC, created_at DESC";
        break;

      case "most_reported":
        order =
          "CAST(reports_count AS INTEGER) DESC, created_at DESC";
        break;

      case "most_discussion":
        order =
          "CAST(replies_count AS INTEGER) DESC, created_at DESC";
        break;

      case "featured":
        order =
          "featured DESC, created_at DESC";
        break;

      case "pinned":
        order =
          "pinned DESC, created_at DESC";
        break;

      case "newest":
      default:
        order = "created_at DESC";
        break;
    }

    if (options.direction === "asc") {
      order = order
        .replace(/DESC/g, "__TMP__")
        .replace(/ASC/g, "DESC")
        .replace(/__TMP__/g, "ASC");
    }

    const rows =
      await this.db.query<ReviewRow>(
        `
        SELECT *
        FROM reviews
        ${whereSql}
        ORDER BY ${order}
        LIMIT ?
        OFFSET ?
        `,
        ...params,
        limit,
        offset
      );

    const totalNumber = Number(total);

    const totalPages =
      Number.isFinite(totalNumber) &&
      totalNumber > 0
        ? Math.ceil(
            totalNumber / limit
          )
        : 0;

    const items = rows.map(mapReview);

    const first =
      items.length > 0
        ? items[0]
        : null;

    const ratingSummary =
      first
        ? await this.getRatingSummary(
            first.target_type,
            first.target_id
          )
        : undefined;

    return {
      items,

      pagination: {
        page,
        limit,
        total,
        total_pages: String(totalPages),

        has_previous: page > 1,
        has_next:
          page < totalPages,
      },

      rating_summary: ratingSummary,
    };
  }

  // ==========================================================
  // BULK ACTIONS
  // ==========================================================

  async bulkAction(
    input: ReviewBulkActionInput
  ): Promise<ReviewAdminActionResult[]> {
    const results: ReviewAdminActionResult[] = [];

    for (const reviewId of input.review_ids) {
      try {
        const review =
          await this.requireById(reviewId);

        switch (input.action) {
          case "approve":
            await this.moderate({
              review_id: reviewId,
              status: "published",
              reason: input.reason,
              note: input.note,
              admin_id: input.admin_id,
            });
            break;

          case "reject":
            await this.moderate({
              review_id: reviewId,
              status: "rejected",
              reason: input.reason,
              note: input.note,
              admin_id: input.admin_id,
            });
            break;

          case "hide":
            await this.moderate({
              review_id: reviewId,
              status: "hidden",
              reason: input.reason,
              note: input.note,
              admin_id: input.admin_id,
            });
            break;

          case "show":
            await this.moderate({
              review_id: reviewId,
              status: "published",
              reason: input.reason,
              note: input.note,
              admin_id: input.admin_id,
            });
            break;

          case "delete":
            await this.delete(
              reviewId,
              input.admin_id,
              input.reason ?? undefined
            );
            break;

          case "restore":
            await this.restore(
              reviewId,
              input.admin_id
            );
            break;

          case "archive":
            await this.moderate({
              review_id: reviewId,
              status: "archived",
              reason: input.reason,
              note: input.note,
              admin_id: input.admin_id,
            });
            break;

          case "pin":
            await this.adminUpdate(
              reviewId,
              { pinned: true },
              input.admin_id
            );
            break;

          case "unpin":
            await this.adminUpdate(
              reviewId,
              { pinned: false },
              input.admin_id
            );
            break;

          case "feature":
            await this.adminUpdate(
              reviewId,
              { featured: true },
              input.admin_id
            );
            break;

          case "unfeature":
            await this.adminUpdate(
              reviewId,
              { featured: false },
              input.admin_id
            );
            break;

          case "verify":
            await this.adminUpdate(
              reviewId,
              {
                verified: true,
                admin_verified: true,
              },
              input.admin_id
            );
            break;

          case "unverify":
            await this.adminUpdate(
              reviewId,
              {
                verified: false,
                admin_verified: false,
              },
              input.admin_id
            );
            break;

          default:
            throw new ValidationError(
              "Неизвестное массовое действие"
            );
        }

        results.push({
          success: true,
          review_id: reviewId,
          action: input.action,
          previous_status: review.status,
          new_status:
            (
              await this.requireById(
                reviewId
              )
            ).status,
        });
      } catch (error) {
        results.push({
          success: false,
          review_id: reviewId,
          action: input.action,
          errors: [
            {
              review_id: reviewId,
              code: "ACTION_FAILED",
              message:
                error instanceof Error
                  ? error.message
                  : "Ошибка выполнения действия",
            },
          ],
        });
      }
    }

    return results;
  }

  // ==========================================================
  // HISTORY
  // ==========================================================

  async writeHistory(
    reviewId: string,
    action: ReviewHistory["action"],
    actorType: ReviewHistory["actor_type"],
    actorId: string | null,
    fieldName: string | null,
    oldValue: string | null,
    newValue: string | null,
    note: string | null
  ): Promise<void> {
    await this.db.run(
      `
      INSERT INTO review_history (
        id,
        review_id,
        action,
        actor_type,
        actor_id,
        field_name,
        old_value,
        new_value,
        note,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      createReviewHistoryId(),
      reviewId,
      action,
      actorType,
      actorId,
      fieldName,
      oldValue,
      newValue,
      note,
      now()
    );
  }

  async getHistory(
    reviewId: string
  ): Promise<ReviewHistory[]> {
    const rows =
      await this.db.query<ReviewHistoryRow>(
        `
        SELECT *
        FROM review_history
        WHERE review_id = ?
        ORDER BY created_at DESC
        `,
        reviewId
      );

    return rows;
  }

  // ==========================================================
  // INTERNAL REPLY COUNTERS
  // ==========================================================

  private async incrementReplyCounter(
    id: string,
    field:
      | "reactions_count"
      | "reports_count"
      | "replies_count"
      | "views_count"
  ): Promise<void> {
    const row =
      await this.db.first<ReviewReplyRow>(
        `
        SELECT *
        FROM review_replies
        WHERE id = ?
        LIMIT 1
        `,
        id
      );

    if (!row) {
      throw new NotFoundError(
        "Ответ не найден"
      );
    }

    const current = mapReply(row);

    const value = addMetric(
      decimal(current[field]),
      "1"
    );

    await this.db.run(
      `
      UPDATE review_replies
      SET ${field} = ?, updated_at = ?
      WHERE id = ?
      `,
      value,
      now(),
      id
    );
  }

  private async decrementReplyCounter(
    id: string,
    field:
      | "reactions_count"
      | "reports_count"
      | "replies_count"
      | "views_count"
  ): Promise<void> {
    const row =
      await this.db.first<ReviewReplyRow>(
        `
        SELECT *
        FROM review_replies
        WHERE id = ?
        LIMIT 1
        `,
        id
      );

    if (!row) {
      return;
    }

    const current = mapReply(row);

    const value = subtractMetric(
      decimal(current[field]),
      "1"
    );

    await this.db.run(
      `
      UPDATE review_replies
      SET ${field} = ?, updated_at = ?
      WHERE id = ?
      `,
      value,
      now(),
      id
    );
  }
}

// ============================================================
// FACTORY
// ============================================================

export function createReviewService(
  db: Database
): ReviewService {
  return new ReviewService(db);
      }
