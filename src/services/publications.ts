import type { Env } from "../index";
import {
  decimalAdd,
  decimalSubtract,
  normalizeDecimalString,
} from "../utils/number";
import {
  normalizePublicationNumber,
  nextPublicationNumber,
} from "../utils/publication";

// ============================================================
// TAJIK OPPORTUNITIES
// PUBLICATION SERVICE
// Version: 2026.09.09 POWER PRODUCTION
// ============================================================

export type PublicationType =
  | "free"
  | "premium"
  | "vip"
  | "custom";

export type PublicationStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "hidden"
  | "deleted";

export type PublicationVisibility =
  | "public"
  | "private"
  | "unlisted";

export type AuthorVisibility =
  | "public"
  | "anonymous"
  | "custom";

export interface Publication {
  id: string;
  postNumber: string | null;

  authorId: string | null;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;

  title: string | null;
  text: string | null;

  categoryId: string | null;

  type: PublicationType;
  status: PublicationStatus;
  visibility: PublicationVisibility;
  authorVisibility: AuthorVisibility;

  background: string | null;
  font: string | null;
  textColor: string | null;

  priority: string;
  pinned: boolean;
  featured: boolean;

  publishedAt: string | null;
  expiresAt: string | null;
  autoDelete: boolean;

  viewsCount: string;
  uniqueViewsCount: string;
  likesCount: string;
  commentsCount: string;
  reactionsCount: string;
  bookmarksCount: string;
  sharesCount: string;
  sendsCount: string;
  reportsCount: string;
  contactsCount: string;
  applicationsCount: string;
  downloadsCount: string;
  clicksCount: string;
  externalClicksCount: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePublicationInput {
  id?: string;

  authorId?: string | null;

  title?: string | null;
  text?: string | null;

  categoryId?: string | null;

  type?: PublicationType;
  status?: PublicationStatus;

  visibility?: PublicationVisibility;
  authorVisibility?: AuthorVisibility;

  background?: string | null;
  font?: string | null;
  textColor?: string | null;

  priority?: string | number;
  pinned?: boolean;
  featured?: boolean;

  publishedAt?: string | null;
  expiresAt?: string | null;
  autoDelete?: boolean;

  authorName?: string | null;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
}

export interface UpdatePublicationInput {
  title?: string | null;
  text?: string | null;

  categoryId?: string | null;

  type?: PublicationType;
  status?: PublicationStatus;

  visibility?: PublicationVisibility;
  authorVisibility?: AuthorVisibility;

  background?: string | null;
  font?: string | null;
  textColor?: string | null;

  priority?: string | number;
  pinned?: boolean;
  featured?: boolean;

  publishedAt?: string | null;
  expiresAt?: string | null;
  autoDelete?: boolean;

  authorId?: string | null;
  authorName?: string | null;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
}

export interface PublicationFilters {
  status?: PublicationStatus;
  type?: PublicationType;
  categoryId?: string;
  authorId?: string;
  visibility?: PublicationVisibility;

  search?: string;

  page?: number;
  limit?: number;

  sort?:
    | "newest"
    | "oldest"
    | "popular"
    | "priority"
    | "comments"
    | "shares"
    | "views";
}

export interface PublicationListResult {
  items: Publication[];
  total: string;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PublicationActionResult {
  success: boolean;
  publication: Publication | null;
  message?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const MAX_TITLE_LENGTH = 500;
const MAX_TEXT_LENGTH = 100000;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const PUBLICATION_TYPES: readonly PublicationType[] = [
  "free",
  "premium",
  "vip",
  "custom",
];

const PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  "draft",
  "pending",
  "published",
  "rejected",
  "hidden",
  "deleted",
];

const VISIBILITIES: readonly PublicationVisibility[] = [
  "public",
  "private",
  "unlisted",
];

const AUTHOR_VISIBILITIES: readonly AuthorVisibility[] = [
  "public",
  "anonymous",
  "custom",
];

// ============================================================
// HELPERS
// ============================================================

function now(): string {
  return new Date().toISOString();
}

function clean(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const result =
    String(value).trim();

  return result || null;
}

function bool(
  value: unknown
): boolean {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function safeNumber(
  value: unknown,
  fallback: number
): number {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeType(
  value: unknown
): PublicationType {
  return PUBLICATION_TYPES.includes(
    value as PublicationType
  )
    ? (value as PublicationType)
    : "free";
}

function normalizeStatus(
  value: unknown
): PublicationStatus {
  return PUBLICATION_STATUSES.includes(
    value as PublicationStatus
  )
    ? (value as PublicationStatus)
    : "draft";
}

function normalizeVisibility(
  value: unknown
): PublicationVisibility {
  return VISIBILITIES.includes(
    value as PublicationVisibility
  )
    ? (value as PublicationVisibility)
    : "public";
}

function normalizeAuthorVisibility(
  value: unknown
): AuthorVisibility {
  return AUTHOR_VISIBILITIES.includes(
    value as AuthorVisibility
  )
    ? (value as AuthorVisibility)
    : "public";
}

function normalizeText(
  value: unknown,
  max: number
): string | null {
  const text =
    clean(value);

  if (!text) {
    return null;
  }

  return text.slice(
    0,
    max
  );
}

function normalizePriority(
  value: unknown
): string {
  return normalizeDecimalString(
    value ?? "0"
  );
}

function normalizeCounter(
  value: unknown
): string {
  try {
    return normalizeDecimalString(
      value ?? "0"
    );
  } catch {
    return "0";
  }
}

function sqlBool(
  value: boolean
): number {
  return value ? 1 : 0;
}

// ============================================================
// SERVICE
// ============================================================

export class PublicationService {
  constructor(
    private readonly env: Env
  ) {}

  // ==========================================================
  // GET BY ID
  // ==========================================================

  async getById(
    id: string
  ): Promise<Publication | null> {
    const row =
      await this.env.DB.prepare(
        `
        SELECT *
        FROM publications
        WHERE id = ?
        LIMIT 1
        `
      )
        .bind(id)
        .first<Record<string, unknown>>();

    return row
      ? this.mapRow(row)
      : null;
  }

  // ==========================================================
  // GET BY PUBLIC NUMBER
  // ==========================================================

  async getByPublicNumber(
    postNumber: string | number
  ): Promise<Publication | null> {
    const normalized =
      normalizePublicNumber(
        postNumber
      );

    const row =
      await this.env.DB.prepare(
        `
        SELECT *
        FROM publications
        WHERE post_number = ?
        LIMIT 1
        `
      )
        .bind(normalized)
        .first<Record<string, unknown>>();

    return row
      ? this.mapRow(row)
      : null;
  }

  // ==========================================================
  // LIST
  // ==========================================================

  async list(
    filters: PublicationFilters = {}
  ): Promise<PublicationListResult> {
    const page =
      Math.max(
        1,
        Math.floor(
          safeNumber(
            filters.page,
            DEFAULT_PAGE
          )
        )
      );

    const limit =
      Math.min(
        MAX_LIMIT,
        Math.max(
          1,
          Math.floor(
            safeNumber(
              filters.limit,
              DEFAULT_LIMIT
            )
          )
        )
      );

    const offset =
      (page - 1) *
      limit;

    const where: string[] = [];
    const bindings: unknown[] = [];

    if (
      filters.status
    ) {
      where.push(
        "p.status = ?"
      );
      bindings.push(
        filters.status
      );
    } else {
      where.push(
        "p.status != 'deleted'"
      );
    }

    if (
      filters.type
    ) {
      where.push(
        "p.type = ?"
      );
      bindings.push(
        filters.type
      );
    }

    if (
      filters.categoryId
    ) {
      where.push(
        "p.category_id = ?"
      );
      bindings.push(
        filters.categoryId
      );
    }

    if (
      filters.authorId
    ) {
      where.push(
        "p.author_id = ?"
      );
      bindings.push(
        filters.authorId
      );
    }

    if (
      filters.visibility
    ) {
      where.push(
        "p.visibility = ?"
      );
      bindings.push(
        filters.visibility
      );
    }

    if (
      filters.search
    ) {
      where.push(
        `
        (
          p.title LIKE ?
          OR p.text LIKE ?
          OR p.author_name LIKE ?
          OR p.author_username LIKE ?
        )
        `
      );

      const query =
        `%${filters.search}%`;

      bindings.push(
        query,
        query,
        query,
        query
      );
    }

    const whereSql =
      where.length
        ? `WHERE ${where.join(" AND ")}`
        : "";

    const orderSql =
      this.getOrderSql(
        filters.sort
      );

    const countRow =
      await this.env.DB.prepare(
        `
        SELECT COUNT(*) AS total
        FROM publications p
        ${whereSql}
        `
      )
        .bind(...bindings)
        .first<{
          total: number;
        }>();

    const total =
      String(
        countRow?.total ?? 0
      );

    const rows =
      await this.env.DB.prepare(
        `
        SELECT p.*
        FROM publications p
        ${whereSql}
        ${orderSql}
        LIMIT ? OFFSET ?
        `
      )
        .bind(
          ...bindings,
          limit,
          offset
        )
        .all<Record<string, unknown>>();

    const items =
      (rows.results ?? [])
        .map(
          row =>
            this.mapRow(row)
        );

    const totalNumber =
      Number(total);

    return {
      items,
      total,
      page,
      limit,
      hasMore:
        Number.isFinite(
          totalNumber
        )
          ? offset + items.length <
            totalNumber
          : items.length === limit,
    };
  }

  // ==========================================================
  // CREATE
  // ==========================================================

  async create(
    input: CreatePublicationInput
  ): Promise<Publication> {
    const id =
      clean(input.id) ??
      crypto.randomUUID();

    const createdAt =
      now();

    const status =
      normalizeStatus(
        input.status ??
          "draft"
      );

    const type =
      normalizeType(
        input.type
      );

    const visibility =
      normalizeVisibility(
        input.visibility
      );

    const authorVisibility =
      normalizeAuthorVisibility(
        input.authorVisibility
      );

    const title =
      normalizeText(
        input.title,
        MAX_TITLE_LENGTH
      );

    const text =
      normalizeText(
        input.text,
        MAX_TEXT_LENGTH
      );

    if (
      !title &&
      !text
    ) {
      throw new Error(
        "Публикация должна содержать заголовок или текст"
      );
    }

    const postNumber =
      await this.allocatePostNumber();

    const publishedAt =
      input.publishedAt ??
      (
        status === "published"
          ? createdAt
          : null
      );

    const expiresAt =
      input.expiresAt ??
      null;

    const autoDelete =
      input.autoDelete ??
      (
        type === "free"
      );

    await this.env.DB.prepare(
      `
      INSERT INTO publications (
        id,
        post_number,
        author_id,
        author_name,
        author_username,
        author_avatar_url,
        title,
        text,
        category_id,
        type,
        status,
        visibility,
        author_visibility,
        background,
        font,
        text_color,
        priority,
        pinned,
        featured,
        published_at,
        expires_at,
        auto_delete,
        views_count,
        unique_views_count,
        likes_count,
        comments_count,
        reactions_count,
        bookmarks_count,
        shares_count,
        sends_count,
        reports_count,
        contacts_count,
        applications_count,
        downloads_count,
        clicks_count,
        external_clicks_count,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
      `
    )
      .bind(
        id,
        postNumber,

        input.authorId ??
          null,

        input.authorName ??
          null,

        input.authorUsername ??
          null,

        input.authorAvatarUrl ??
          null,

        title,
        text,

        input.categoryId ??
          null,

        type,
        status,
        visibility,
        authorVisibility,

        input.background ??
          null,

        input.font ??
          null,

        input.textColor ??
          null,

        normalizePriority(
          input.priority
        ),

        sqlBool(
          Boolean(
            input.pinned
          )
        ),

        sqlBool(
          Boolean(
            input.featured
          )
        ),

        publishedAt,
        expiresAt,

        sqlBool(
          Boolean(
            autoDelete
          )
        ),

        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",

        createdAt,
        createdAt
      )
      .run();

    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      throw new Error(
        "Не удалось получить созданную публикацию"
      );
    }

    await this.writeHistory(
      id,
      "created",
      null,
      publication.status,
      null
    );

    return publication;
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  async update(
    id: string,
    input: UpdatePublicationInput
  ): Promise<Publication> {
    const existing =
      await this.getById(id);

    if (!existing) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (
      input.title !== undefined
    ) {
      sets.push(
        "title = ?"
      );
      values.push(
        normalizeText(
          input.title,
          MAX_TITLE_LENGTH
        )
      );
    }

    if (
      input.text !== undefined
    ) {
      sets.push(
        "text = ?"
      );
      values.push(
        normalizeText(
          input.text,
          MAX_TEXT_LENGTH
        )
      );
    }

    if (
      input.categoryId !== undefined
    ) {
      sets.push(
        "category_id = ?"
      );
      values.push(
        input.categoryId ??
          null
      );
    }

    if (
      input.type !== undefined
    ) {
      sets.push(
        "type = ?"
      );
      values.push(
        normalizeType(
          input.type
        )
      );
    }

    if (
      input.status !== undefined
    ) {
      sets.push(
        "status = ?"
      );
      values.push(
        normalizeStatus(
          input.status
        )
      );

      if (
        input.status ===
        "published" &&
        !existing.publishedAt
      ) {
        sets.push(
          "published_at = ?"
        );
        values.push(
          now()
        );
      }
    }

    if (
      input.visibility !== undefined
    ) {
      sets.push(
        "visibility = ?"
      );
      values.push(
        normalizeVisibility(
          input.visibility
        )
      );
    }

    if (
      input.authorVisibility !== undefined
    ) {
      sets.push(
        "author_visibility = ?"
      );
      values.push(
        normalizeAuthorVisibility(
          input.authorVisibility
        )
      );
    }

    if (
      input.background !== undefined
    ) {
      sets.push(
        "background = ?"
      );
      values.push(
        input.background ??
          null
      );
    }

    if (
      input.font !== undefined
    ) {
      sets.push(
        "font = ?"
      );
      values.push(
        input.font ??
          null
      );
    }

    if (
      input.textColor !== undefined
    ) {
      sets.push(
        "text_color = ?"
      );
      values.push(
        input.textColor ??
          null
      );
    }

    if (
      input.priority !== undefined
    ) {
      sets.push(
        "priority = ?"
      );
      values.push(
        normalizePriority(
          input.priority
        )
      );
    }

    if (
      input.pinned !== undefined
    ) {
      sets.push(
        "pinned = ?"
      );
      values.push(
        sqlBool(
          input.pinned
        )
      );
    }

    if (
      input.featured !== undefined
    ) {
      sets.push(
        "featured = ?"
      );
      values.push(
        sqlBool(
          input.featured
        )
      );
    }

    if (
      input.publishedAt !== undefined
    ) {
      sets.push(
        "published_at = ?"
      );
      values.push(
        input.publishedAt ??
          null
      );
    }

    if (
      input.expiresAt !== undefined
    ) {
      sets.push(
        "expires_at = ?"
      );
      values.push(
        input.expiresAt ??
          null
      );
    }

    if (
      input.autoDelete !== undefined
    ) {
      sets.push(
        "auto_delete = ?"
      );
      values.push(
        sqlBool(
          input.autoDelete
        )
      );
    }

    if (
      input.authorId !== undefined
    ) {
      sets.push(
        "author_id = ?"
      );
      values.push(
        input.authorId ??
          null
      );
    }

    if (
      input.authorName !== undefined
    ) {
      sets.push(
        "author_name = ?"
      );
      values.push(
        input.authorName ??
          null
      );
    }

    if (
      input.authorUsername !== undefined
    ) {
      sets.push(
        "author_username = ?"
      );
      values.push(
        input.authorUsername ??
          null
      );
    }

    if (
      input.authorAvatarUrl !== undefined
    ) {
      sets.push(
        "author_avatar_url = ?"
      );
      values.push(
        input.authorAvatarUrl ??
          null
      );
    }

    if (!sets.length) {
      return existing;
    }

    const updatedAt =
      now();

    sets.push(
      "updated_at = ?"
    );

    values.push(
      updatedAt
    );

    values.push(
      id
    );

    await this.env.DB.prepare(
      `
      UPDATE publications
      SET ${sets.join(", ")}
      WHERE id = ?
      `
    )
      .bind(...values)
      .run();

    const updated =
      await this.getById(
        id
      );

    if (!updated) {
      throw new Error(
        "Не удалось получить обновлённую публикацию"
      );
    }

    await this.writeHistory(
      id,
      "updated",
      existing.status,
      updated.status,
      JSON.stringify({
        changedFields:
          Object.keys(
            input
          ),
      })
    );

    return updated;
  }

  // ==========================================================
  // SUBMIT FOR MODERATION
  // ==========================================================

  async submitForModeration(
    id: string
  ): Promise<Publication> {
    return this.update(
      id,
      {
        status: "pending",
      }
    );
  }

  // ==========================================================
  // PUBLISH
  // ==========================================================

  async publish(
    id: string
  ): Promise<Publication> {
    const publication =
      await this.getById(id);

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const publishedAt =
      publication.publishedAt ??
      now();

    const updated =
      await this.update(
        id,
        {
          status: "published",
          publishedAt,
        }
      );

    await this.writeHistory(
      id,
      "published",
      publication.status,
      "published",
      null
    );

    return updated;
  }

  // ==========================================================
  // REJECT
  // ==========================================================

  async reject(
    id: string,
    reason?: string
  ): Promise<Publication> {
    const publication =
      await this.getById(id);

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const updated =
      await this.update(
        id,
        {
          status: "rejected",
        }
      );

    await this.writeHistory(
      id,
      "rejected",
      publication.status,
      "rejected",
      reason
        ? JSON.stringify({
            reason,
          })
        : null
    );

    return updated;
  }

  // ==========================================================
  // HIDE
  // ==========================================================

  async hide(
    id: string,
    reason?: string
  ): Promise<Publication> {
    const publication =
      await this.getById(id);

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const updated =
      await this.update(
        id,
        {
          status: "hidden",
        }
      );

    await this.writeHistory(
      id,
      "hidden",
      publication.status,
      "hidden",
      reason
        ? JSON.stringify({
            reason,
          })
        : null
    );

    return updated;
  }

  // ==========================================================
  // SOFT DELETE
  // ==========================================================

  async remove(
    id: string,
    reason?: string
  ): Promise<Publication> {
    const publication =
      await this.getById(id);

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const deletedAt =
      now();

    await this.env.DB.prepare(
      `
      UPDATE publications
      SET
        status = 'deleted',
        deleted_at = ?,
        updated_at = ?
      WHERE id = ?
      `
    )
      .bind(
        deletedAt,
        deletedAt,
        id
      )
      .run();

    /*
     * После удаления пересчитываем публичную
     * нумерацию. Внутренний id при этом
     * НЕ меняется.
     */
    await this.resequencePublicNumbers();

    const updated =
      await this.getById(
        id
      );

    if (!updated) {
      throw new Error(
        "Публикация была удалена"
      );
    }

    await this.writeHistory(
      id,
      "deleted",
      publication.status,
      "deleted",
      reason
        ? JSON.stringify({
            reason,
          })
        : null
    );

    return updated;
  }

  // ==========================================================
  // RESTORE
  // ==========================================================

  async restore(
    id: string
  ): Promise<Publication> {
    const publication =
      await this.getById(id);

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    if (
      publication.status !==
      "deleted"
    ) {
      return publication;
    }

    const newNumber =
      await this.allocatePostNumber();

    const restoredAt =
      now();

    await this.env.DB.prepare(
      `
      UPDATE publications
      SET
        status = 'draft',
        post_number = ?,
        deleted_at = NULL,
        updated_at = ?
      WHERE id = ?
      `
    )
      .bind(
        newNumber,
        restoredAt,
        id
      )
      .run();

    await this.resequencePublicNumbers();

    const restored =
      await this.getById(
        id
      );

    if (!restored) {
      throw new Error(
        "Не удалось восстановить публикацию"
      );
    }

    await this.writeHistory(
      id,
      "restored",
      "deleted",
      "draft",
      null
    );

    return restored;
  }

  // ==========================================================
  // PIN
  // ==========================================================

  async setPinned(
    id: string,
    pinned: boolean
  ): Promise<Publication> {
    return this.update(
      id,
      {
        pinned,
      }
    );
  }

  async pin(
    id: string
  ): Promise<Publication> {
    return this.setPinned(
      id,
      true
    );
  }

  async unpin(
    id: string
  ): Promise<Publication> {
    return this.setPinned(
      id,
      false
    );
  }

  // ==========================================================
  // FEATURED
  // ==========================================================

  async setFeatured(
    id: string,
    featured: boolean
  ): Promise<Publication> {
    return this.update(
      id,
      {
        featured,
      }
    );
  }

  // ==========================================================
  // CHANGE TYPE
  // ==========================================================

  async setType(
    id: string,
    type: PublicationType
  ): Promise<Publication> {
    return this.update(
      id,
      {
        type,
      }
    );
  }

  async grantVip(
    id: string
  ): Promise<Publication> {
    return this.setType(
      id,
      "vip"
    );
  }

  async grantPremium(
    id: string
  ): Promise<Publication> {
    return this.setType(
      id,
      "premium"
    );
  }

  async setFree(
    id: string
  ): Promise<Publication> {
    return this.setType(
      id,
      "free"
    );
  }

  async setCustom(
    id: string
  ): Promise<Publication> {
    return this.setType(
      id,
      "custom"
    );
  }

  // ==========================================================
  // EXPIRATION
  // ==========================================================

  async setExpiration(
    id: string,
    expiresAt: string | null,
    autoDelete = true
  ): Promise<Publication> {
    return this.update(
      id,
      {
        expiresAt,
        autoDelete,
      }
    );
  }

  async disableAutoDelete(
    id: string
  ): Promise<Publication> {
    return this.update(
      id,
      {
        autoDelete: false,
      }
    );
  }

  async enableAutoDelete(
    id: string
  ): Promise<Publication> {
    return this.update(
      id,
      {
        autoDelete: true,
      }
    );
  }

  // ==========================================================
  // METRICS
  // ==========================================================

  async incrementMetric(
    id: string,
    metric:
      | "views_count"
      | "unique_views_count"
      | "likes_count"
      | "comments_count"
      | "reactions_count"
      | "bookmarks_count"
      | "shares_count"
      | "sends_count"
      | "reports_count"
      | "contacts_count"
      | "applications_count"
      | "downloads_count"
      | "clicks_count"
      | "external_clicks_count",
    amount: string | number = "1"
  ): Promise<void> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const current =
      normalizeCounter(
        publication[
          this.metricToProperty(
            metric
          ) as keyof Publication
        ]
      );

    const next =
      decimalAdd(
        current,
        amount
      );

    await this.env.DB.prepare(
      `
      UPDATE publications
      SET
        ${metric} = ?,
        updated_at = ?
      WHERE id = ?
      `
    )
      .bind(
        next,
        now(),
        id
      )
      .run();
  }

  async decrementMetric(
    id: string,
    metric:
      | "views_count"
      | "unique_views_count"
      | "likes_count"
      | "comments_count"
      | "reactions_count"
      | "bookmarks_count"
      | "shares_count"
      | "sends_count"
      | "reports_count"
      | "contacts_count"
      | "applications_count"
      | "downloads_count"
      | "clicks_count"
      | "external_clicks_count",
    amount: string | number = "1"
  ): Promise<void> {
    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    const current =
      normalizeCounter(
        publication[
          this.metricToProperty(
            metric
          ) as keyof Publication
        ]
      );

    const next =
      decimalSubtract(
        current,
        amount
      );

    await this.env.DB.prepare(
      `
      UPDATE publications
      SET
        ${metric} = ?,
        updated_at = ?
      WHERE id = ?
      `
    )
      .bind(
        next,
        now(),
        id
      )
      .run();
  }

  // ==========================================================
  // ADMIN COUNTER OVERRIDE
  // ==========================================================

  async setMetric(
    id: string,
    metric:
      | "views_count"
      | "unique_views_count"
      | "likes_count"
      | "comments_count"
      | "reactions_count"
      | "bookmarks_count"
      | "shares_count"
      | "sends_count"
      | "reports_count"
      | "contacts_count"
      | "applications_count"
      | "downloads_count"
      | "clicks_count"
      | "external_clicks_count",
    value: string | number
  ): Promise<Publication> {
    const normalized =
      normalizeCounter(
        value
      );

    await this.env.DB.prepare(
      `
      UPDATE publications
      SET
        ${metric} = ?,
        updated_at = ?
      WHERE id = ?
      `
    )
      .bind(
        normalized,
        now(),
        id
      )
      .run();

    const publication =
      await this.getById(
        id
      );

    if (!publication) {
      throw new Error(
        "Публикация не найдена"
      );
    }

    await this.writeHistory(
      id,
      "metric_override",
      publication.status,
      publication.status,
      JSON.stringify({
        metric,
        value: normalized,
      })
    );

    return publication;
  }

  // ==========================================================
  // BULK STATUS
  // ==========================================================

  async bulkSetStatus(
    ids: string[],
    status: PublicationStatus
  ): Promise<number> {
    if (!ids.length) {
      return 0;
    }

    const normalizedIds =
      Array.from(
        new Set(
          ids
            .map(clean)
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            )
        )
      );

    if (!normalizedIds.length) {
      return 0;
    }

    const placeholders =
      normalizedIds
        .map(() => "?")
        .join(",");

    const result =
      await this.env.DB.prepare(
        `
        UPDATE publications
        SET
          status = ?,
          updated_at = ?
        WHERE id IN (${placeholders})
        `
      )
        .bind(
          status,
          now(),
          ...normalizedIds
        )
        .run();

    return (
      result.meta?.changes ??
      0
    );
  }

  // ==========================================================
  // EXPIRATION PROCESSOR
  // ==========================================================

  async processExpired(
    limit = 100
  ): Promise<number> {
    const current =
      now();

    const rows =
      await this.env.DB.prepare(
        `
        SELECT id
        FROM publications
        WHERE
          status = 'published'
          AND auto_delete = 1
          AND expires_at IS NOT NULL
          AND expires_at <= ?
        ORDER BY expires_at ASC
        LIMIT ?
        `
      )
        .bind(
          current,
          Math.min(
            1000,
            Math.max(
              1,
              limit
            )
          )
        )
        .all<{
          id: string;
        }>();

    let changed = 0;

    for (
      const row of
        rows.results ?? []
    ) {
      try {
        await this.remove(
          row.id,
          "automatic_expiration"
        );

        changed++;
      } catch {
        // Продолжаем обработку
        // остальных публикаций.
      }
    }

    return changed;
  }

  // ==========================================================
  // HISTORY
  // ==========================================================

  async getHistory(
    id: string,
    limit = 100
  ): Promise<
    Record<string, unknown>[]
  > {
    const rows =
      await this.env.DB.prepare(
        `
        SELECT *
        FROM publication_history
        WHERE publication_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        `
      )
        .bind(
          id,
          Math.min(
            500,
            Math.max(
              1,
              limit
            )
          )
        )
        .all<Record<string, unknown>>();

    return rows.results ?? [];
  }

  private async writeHistory(
    publicationId: string,
    action: string,
    oldStatus:
      | PublicationStatus
      | null,
    newStatus:
      | PublicationStatus
      | null,
    details: string | null
  ): Promise<void> {
    try {
      await this.env.DB.prepare(
        `
        INSERT INTO publication_history (
          id,
          publication_id,
          action,
          old_status,
          new_status,
          changes,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          crypto.randomUUID(),
          publicationId,
          action,
          oldStatus,
          newStatus,
          details,
          now()
        )
        .run();
    } catch {
      /*
       * История не должна ломать основную
       * операцию публикации.
       */
    }
  }

  // ==========================================================
  // POST NUMBER
  // ==========================================================

  private async allocatePostNumber():
    Promise<string> {
    const row =
      await this.env.DB.prepare(
        `
        SELECT post_number
        FROM publications
        WHERE post_number IS NOT NULL
        ORDER BY CAST(post_number AS INTEGER) DESC
        LIMIT 1
        `
      )
        .first<{
          post_number:
            | string
            | number
            | null;
        }>();

    if (
      !row?.post_number
    ) {
      return "1";
    }

    return nextPublicationNumber(
      row.post_number
    );
  }

  /**
   * Публичная нумерация:
   *
   * 1, 2, 3, 4...
   *
   * После удаления публикации последовательность
   * пересчитывается.
   *
   * Внутренний publication.id остаётся неизменным.
   */
  private async resequencePublicNumbers():
    Promise<void> {
    const rows =
      await this.env.DB.prepare(
        `
        SELECT id
        FROM publications
        WHERE status != 'deleted'
        ORDER BY
          CASE
            WHEN published_at IS NULL
              THEN created_at
            ELSE published_at
          END ASC,
          created_at ASC,
          id ASC
        `
      )
        .all<{
          id: string;
        }>();

    let number = 1;

    for (
      const row of
        rows.results ?? []
    ) {
      await this.env.DB.prepare(
        `
        UPDATE publications
        SET post_number = ?
        WHERE id = ?
        `
      )
        .bind(
          String(number),
          row.id
        )
        .run();

      number++;
    }
  }

  // ==========================================================
  // ORDER
  // ==========================================================

  private getOrderSql(
    sort:
      | PublicationFilters["sort"]
      | undefined
  ): string {
    switch (sort) {
      case "oldest":
        return `
          ORDER BY
            p.created_at ASC
        `;

      case "popular":
        return `
          ORDER BY
            CAST(p.views_count AS INTEGER) DESC,
            p.created_at DESC
        `;

      case "comments":
        return `
          ORDER BY
            CAST(p.comments_count AS INTEGER) DESC,
            p.created_at DESC
        `;

      case "shares":
        return `
          ORDER BY
            CAST(p.shares_count AS INTEGER) DESC,
            p.created_at DESC
        `;

      case "views":
        return `
          ORDER BY
            CAST(p.views_count AS INTEGER) DESC,
            p.created_at DESC
        `;

      case "priority":
        return `
          ORDER BY
            CAST(p.priority AS INTEGER) DESC,
            p.pinned DESC,
            p.featured DESC,
            p.created_at DESC
        `;

      case "newest":
      default:
        return `
          ORDER BY
            p.pinned DESC,
            p.featured DESC,
            CAST(p.priority AS INTEGER) DESC,
            COALESCE(
              p.published_at,
              p.created_at
            ) DESC
        `;
    }
  }

  // ==========================================================
  // ROW MAPPER
  // ==========================================================

  private mapRow(
    row: Record<string, unknown>
  ): Publication {
    return {
      id:
        String(
          row.id ?? ""
        ),

      postNumber:
        clean(
          row.post_number
        ),

      authorId:
        clean(
          row.author_id
        ),

      authorName:
        clean(
          row.author_name
        ),

      authorUsername:
        clean(
          row.author_username
        ),

      authorAvatarUrl:
        clean(
          row.author_avatar_url
        ),

      title:
        clean(
          row.title
        ),

      text:
        clean(
          row.text
        ),

      categoryId:
        clean(
          row.category_id
        ),

      type:
        normalizeType(
          row.type
        ),

      status:
        normalizeStatus(
          row.status
        ),

      visibility:
        normalizeVisibility(
          row.visibility
        ),

      authorVisibility:
        normalizeAuthorVisibility(
          row.author_visibility
        ),

      background:
        clean(
          row.background
        ),

      font:
        clean(
          row.font
        ),

      textColor:
        clean(
          row.text_color
        ),

      priority:
        normalizeCounter(
          row.priority
        ),

      pinned:
        bool(
          row.pinned
        ),

      featured:
        bool(
          row.featured
        ),

      publishedAt:
        clean(
          row.published_at
        ),

      expiresAt:
        clean(
          row.expires_at
        ),

      autoDelete:
        bool(
          row.auto_delete
        ),

      viewsCount:
        normalizeCounter(
          row.views_count
        ),

      uniqueViewsCount:
        normalizeCounter(
          row.unique_views_count
        ),

      likesCount:
        normalizeCounter(
          row.likes_count
        ),

      commentsCount:
        normalizeCounter(
          row.comments_count
        ),

      reactionsCount:
        normalizeCounter(
          row.reactions_count
        ),

      bookmarksCount:
        normalizeCounter(
          row.bookmarks_count
        ),

      sharesCount:
        normalizeCounter(
          row.shares_count
        ),

      sendsCount:
        normalizeCounter(
          row.sends_count
        ),

      reportsCount:
        normalizeCounter(
          row.reports_count
        ),

      contactsCount:
        normalizeCounter(
          row.contacts_count
        ),

      applicationsCount:
        normalizeCounter(
          row.applications_count
        ),

      downloadsCount:
        normalizeCounter(
          row.downloads_count
        ),

      clicksCount:
        normalizeCounter(
          row.clicks_count
        ),

      externalClicksCount:
        normalizeCounter(
          row.external_clicks_count
        ),

      createdAt:
        String(
          row.created_at ??
            ""
        ),

      updatedAt:
        String(
          row.updated_at ??
            ""
        ),

      deletedAt:
        clean(
          row.deleted_at
        ),
    };
  }

  private metricToProperty(
    metric: string
  ): string {
    const map: Record<
      string,
      string
    > = {
      views_count:
        "viewsCount",

      unique_views_count:
        "uniqueViewsCount",

      likes_count:
        "likesCount",

      comments_count:
        "commentsCount",

      reactions_count:
        "reactionsCount",

      bookmarks_count:
        "bookmarksCount",

      shares_count:
        "sharesCount",

      sends_count:
        "sendsCount",

      reports_count:
        "reportsCount",

      contacts_count:
        "contactsCount",

      applications_count:
        "applicationsCount",

      downloads_count:
        "downloadsCount",

      clicks_count:
        "clicksCount",

      external_clicks_count:
        "externalClicksCount",
    };

    return (
      map[metric] ??
      "viewsCount"
    );
  }
}

// ============================================================
// FACTORY
// ============================================================

export function createPublicationService(
  env: Env
): PublicationService {
  return new PublicationService(
    env
  );
}

// ============================================================
// SIMPLE FUNCTION API
// ============================================================

export async function getPublication(
  env: Env,
  id: string
): Promise<Publication | null> {
  return createPublicationService(
    env
  ).getById(id);
}

export async function getPublicationByNumber(
  env: Env,
  number: string | number
): Promise<Publication | null> {
  return createPublicationService(
    env
  ).getByPublicNumber(number);
}

export async function createPublication(
  env: Env,
  input: CreatePublicationInput
): Promise<Publication> {
  return createPublicationService(
    env
  ).create(input);
}

export async function updatePublication(
  env: Env,
  id: string,
  input: UpdatePublicationInput
): Promise<Publication> {
  return createPublicationService(
    env
  ).update(
    id,
    input
  );
}

export async function publishPublication(
  env: Env,
  id: string
): Promise<Publication> {
  return createPublicationService(
    env
  ).publish(id);
}

export async function deletePublication(
  env: Env,
  id: string,
  reason?: string
): Promise<Publication> {
  return createPublicationService(
    env
  ).remove(
    id,
    reason
  );
        }
