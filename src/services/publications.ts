import type { D1Database } from "@cloudflare/workers-types";

export type PublicationType = "news" | "opportunity" | "vacancy" | "education" | "event" | "grant" | "competition" | "other";
export type PublicationStatus = "draft" | "pending" | "approved" | "published" | "rejected" | "hidden" | "archived" | "deleted";
export type PublicationVisibility = "public" | "private" | "internal" | "archived";
export type PublicationPriority = "low" | "normal" | "high" | "urgent";
export type PublicationSource = "direct" | "import" | "api" | "form" | "migration";
export type PublicationHistoryAction = "created" | "updated" | "published" | "rejected" | "hidden" | "archived" | "restored" | "deleted" | "shared" | "viewed";
export type PublicationMetric = "views_count" | "shares_count" | "likes_count" | "comments_count" | "bookmarks_count";

export interface Publication {
  id: string;
  public_number: number;
  type: PublicationType;
  status: PublicationStatus;
  visibility: PublicationVisibility;
  priority: PublicationPriority;
  source: PublicationSource;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  featured_image: string | null;
  thumbnail: string | null;
  author_id: string | null;
  category_id: string | null;
  region_id: string | null;
  published_at: string | null;
  expires_at: string | null;
  featured_until: string | null;
  pinned_until: string | null;
  view_count: number;
  share_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PublicationMedia {
  id: string;
  publication_id: string;
  media_url: string;
  media_type: string;
  alt_text: string | null;
  position: number;
  created_at: string;
}

export interface CreatePublicationInput {
  type: PublicationType;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  featured_image?: string;
  thumbnail?: string;
  author_id?: string;
  category_id?: string;
  region_id?: string;
  published_at?: string;
  expires_at?: string;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;
  source?: PublicationSource;
}

export interface UpdatePublicationInput {
  type?: PublicationType;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  featured_image?: string;
  thumbnail?: string;
  author_id?: string;
  category_id?: string;
  region_id?: string;
  published_at?: string;
  expires_at?: string;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;
  status?: PublicationStatus;
}

export interface AdminPublicationOverrideInput {
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;
  featured_until?: string | null;
  pinned_until?: string | null;
}

export interface PublicationFilter {
  type?: PublicationType;
  status?: PublicationStatus;
  visibility?: PublicationVisibility;
  priority?: PublicationPriority;
  source?: PublicationSource;
  category_id?: string;
  region_id?: string;
  author_id?: string;
  published_after?: string;
  published_before?: string;
  search?: string;
}

export type PublicationSort = "created_at" | "-created_at" | "updated_at" | "-updated_at" | "published_at" | "-published_at" | "public_number" | "-public_number" | "view_count" | "-view_count" | "priority" | "-priority";

export interface PublicationListResult {
  items: Publication[];
  total: number;
  limit: number;
  offset: number;
}

export interface PublicationMetrics {
  publication_id: string;
  views_count: number;
  shares_count: number;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  updated_at: string;
}

export interface PublicationDetails extends Publication {
  media: PublicationMedia[];
  metrics: PublicationMetrics;
}

export interface PublicationSearchOptions {
  query: string;
  types?: PublicationType[];
  statuses?: PublicationStatus[];
  limit?: number;
  offset?: number;
  sort?: PublicationSort;
}

export interface PublicationBulkResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

interface Env {
  DB: D1Database;
}

function now(): string {
  return new Date().toISOString();
}

function stringValue(val: unknown): string {
  if (val == null) return "";
  return String(val).trim();
}

function nullableString(val: unknown): string | null {
  if (val == null) return null;
  const str = String(val).trim();
  return str.length === 0 ? null : str;
}

function requiredString(val: unknown): string {
  const str = stringValue(val);
  if (str.length === 0) {
    throw new Error("Required string value is empty");
  }
  return str;
}

function normalizeWhitespace(val: string): string {
  return val.replace(/\s+/g, " ").trim();
}

function bool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    return val.toLowerCase() === "true" || val === "1" || val === "yes";
  }
  return Boolean(val);
}

function limitValue(val: unknown): number {
  const num = finitePositiveNumber(val);
  return Math.min(Math.max(num, 1), 100);
}

function offsetValue(val: unknown): number {
  const num = finitePositiveNumber(val);
  return Math.max(num, 0);
}

function finitePositiveNumber(val: unknown): number {
  let num = 0;
  if (typeof val === "number") {
    num = val;
  } else if (typeof val === "string") {
    num = parseInt(val, 10);
  }
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function normalizeDate(val: unknown): string | null {
  const str = nullableString(val);
  if (!str) return null;
  const date = new Date(str);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function datePlusDays(baseDate: string, days: number): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function normalizeMetric(val: unknown): number {
  return Math.max(finitePositiveNumber(val), 0);
}

function parseTotal(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseInt(val, 10);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

function normalizeType(val: unknown): PublicationType {
  const str = stringValue(val).toLowerCase();
  const types: PublicationType[] = ["news", "opportunity", "vacancy", "education", "event", "grant", "competition", "other"];
  return (types.includes(str as PublicationType) ? str : "other") as PublicationType;
}

function normalizeStatus(val: unknown): PublicationStatus {
  const str = stringValue(val).toLowerCase();
  const statuses: PublicationStatus[] = ["draft", "pending", "approved", "published", "rejected", "hidden", "archived", "deleted"];
  return (statuses.includes(str as PublicationStatus) ? str : "draft") as PublicationStatus;
}

function normalizeVisibility(val: unknown): PublicationVisibility {
  const str = stringValue(val).toLowerCase();
  const visibilities: PublicationVisibility[] = ["public", "private", "internal", "archived"];
  return (visibilities.includes(str as PublicationVisibility) ? str : "public") as PublicationVisibility;
}

function normalizePriority(val: unknown): PublicationPriority {
  const str = stringValue(val).toLowerCase();
  const priorities: PublicationPriority[] = ["low", "normal", "high", "urgent"];
  return (priorities.includes(str as PublicationPriority) ? str : "normal") as PublicationPriority;
}

function mapPublication(row: Record<string, unknown>): Publication {
  return {
    id: requiredString(row.id),
    public_number: parseTotal(row.public_number),
    type: normalizeType(row.type),
    status: normalizeStatus(row.status),
    visibility: normalizeVisibility(row.visibility),
    priority: normalizePriority(row.priority),
    source: stringValue(row.source) as PublicationSource,
    title: requiredString(row.title),
    slug: requiredString(row.slug),
    description: nullableString(row.description),
    content: nullableString(row.content),
    featured_image: nullableString(row.featured_image),
    thumbnail: nullableString(row.thumbnail),
    author_id: nullableString(row.author_id),
    category_id: nullableString(row.category_id),
    region_id: nullableString(row.region_id),
    published_at: nullableString(row.published_at),
    expires_at: nullableString(row.expires_at),
    featured_until: nullableString(row.featured_until),
    pinned_until: nullableString(row.pinned_until),
    view_count: normalizeMetric(row.view_count),
    share_count: normalizeMetric(row.share_count),
    like_count: normalizeMetric(row.like_count),
    comment_count: normalizeMetric(row.comment_count),
    bookmark_count: normalizeMetric(row.bookmark_count),
    created_at: requiredString(row.created_at),
    updated_at: requiredString(row.updated_at),
    deleted_at: nullableString(row.deleted_at),
  };
}

function mapMedia(row: Record<string, unknown>): PublicationMedia {
  return {
    id: requiredString(row.id),
    publication_id: requiredString(row.publication_id),
    media_url: requiredString(row.media_url),
    media_type: requiredString(row.media_type),
    alt_text: nullableString(row.alt_text),
    position: parseTotal(row.position),
    created_at: requiredString(row.created_at),
  };
}

function safePublicationUrl(publicNumber: number): string {
  return publicNumber > 0 ? `/publication/${publicNumber}` : "";
}

export class PublicationService {
  constructor(private readonly env: Env) {}

  private get db(): D1Database {
    return this.env.DB;
  }

  async getNextPublicNumber(): Promise<number> {
    const result = await this.db
      .prepare("SELECT COALESCE(MAX(public_number), 0) + 1 as next_number FROM publications WHERE deleted_at IS NULL")
      .first<{ next_number: number }>();
    return result?.next_number || 1;
  }

  async create(input: CreatePublicationInput): Promise<Publication> {
    const id = crypto.randomUUID();
    const publicNumber = await this.getNextPublicNumber();
    const slug = input.slug || requiredString(input.title).toLowerCase().replace(/\s+/g, "-");

    await this.db
      .prepare(
        `
        INSERT INTO publications (
          id, public_number, type, status, visibility, priority, source,
          title, slug, description, content, featured_image, thumbnail,
          author_id, category_id, region_id, published_at, expires_at,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        id,
        publicNumber,
        normalizeType(input.type),
        "draft",
        normalizeVisibility(input.visibility || "public"),
        normalizePriority(input.priority || "normal"),
        normalizeType(input.source || "direct"),
        requiredString(input.title),
        slug,
        nullableString(input.description),
        nullableString(input.content),
        nullableString(input.featured_image),
        nullableString(input.thumbnail),
        nullableString(input.author_id),
        nullableString(input.category_id),
        nullableString(input.region_id),
        normalizeDate(input.published_at),
        normalizeDate(input.expires_at),
        now(),
        now(),
      )
      .run();

    return this.getById(id) as Promise<Publication>;
  }

  async getById(id: string): Promise<Publication | null> {
    const row = await this.db
      .prepare("SELECT * FROM publications WHERE id = ? AND deleted_at IS NULL LIMIT 1")
      .bind(requiredString(id))
      .first<Record<string, unknown>>();

    return row ? mapPublication(row) : null;
  }

  async getByPublicNumber(publicNumber: number): Promise<Publication | null> {
    const row = await this.db
      .prepare("SELECT * FROM publications WHERE public_number = ? AND deleted_at IS NULL LIMIT 1")
      .bind(parseTotal(publicNumber))
      .first<Record<string, unknown>>();

    return row ? mapPublication(row) : null;
  }

  async getDetails(id: string): Promise<PublicationDetails | null> {
    const publication = await this.getById(id);
    if (!publication) return null;

    const media = await this.getMedia(id);
    const metrics = await this.getMetrics(id);

    return {
      ...publication,
      media,
      metrics,
    };
  }

  async list(filter: PublicationFilter = {}, limit: number = 10, offset: number = 0): Promise<PublicationListResult> {
    let query = "SELECT * FROM publications WHERE deleted_at IS NULL";
    const params: unknown[] = [];

    if (filter.type) {
      query += " AND type = ?";
      params.push(normalizeType(filter.type));
    }
    if (filter.status) {
      query += " AND status = ?";
      params.push(normalizeStatus(filter.status));
    }
    if (filter.visibility) {
      query += " AND visibility = ?";
      params.push(normalizeVisibility(filter.visibility));
    }
    if (filter.priority) {
      query += " AND priority = ?";
      params.push(normalizePriority(filter.priority));
    }
    if (filter.category_id) {
      query += " AND category_id = ?";
      params.push(requiredString(filter.category_id));
    }
    if (filter.region_id) {
      query += " AND region_id = ?";
      params.push(requiredString(filter.region_id));
    }

    query += " ORDER BY public_number DESC LIMIT ? OFFSET ?";
    params.push(limitValue(limit), offsetValue(offset));

    const items = await this.db
      .prepare(query)
      .bind(...params)
      .all<Record<string, unknown>>();

    let total = 0;
    const countQuery = query.substring(0, query.lastIndexOf("ORDER")).replace("SELECT *", "SELECT COUNT(*) as count");
    const countResult = await this.db
      .prepare(countQuery)
      .bind(...params.slice(0, -2))
      .first<{ count: number }>();
    total = countResult?.count || 0;

    return {
      items: items.results.map(mapPublication),
      total,
      limit: limitValue(limit),
      offset: offsetValue(offset),
    };
  }

  async search(options: PublicationSearchOptions): Promise<PublicationListResult> {
    const query = requiredString(options.query);
    let sql = "SELECT * FROM publications WHERE deleted_at IS NULL AND (title LIKE ? OR description LIKE ? OR content LIKE ?)";
    const params: unknown[] = [
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
    ];

    if (options.types && options.types.length > 0) {
      sql += ` AND type IN (${options.types.map(() => "?").join(",")})`;
      options.types.forEach((t) => params.push(normalizeType(t)));
    }

    if (options.statuses && options.statuses.length > 0) {
      sql += ` AND status IN (${options.statuses.map(() => "?").join(",")})`;
      options.statuses.forEach((s) => params.push(normalizeStatus(s)));
    }

    sql += " ORDER BY public_number DESC LIMIT ? OFFSET ?";
    params.push(limitValue(options.limit || 10), offsetValue(options.offset || 0));

    const items = await this.db
      .prepare(sql)
      .bind(...params)
      .all<Record<string, unknown>>();

    return {
      items: items.results.map(mapPublication),
      total: items.results.length,
      limit: limitValue(options.limit || 10),
      offset: offsetValue(options.offset || 0),
    };
  }

  async update(id: string, input: UpdatePublicationInput): Promise<Publication | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updates: Record<string, unknown> = { updated_at: now() };
    const add = (key: keyof UpdatePublicationInput, normalized: unknown) => {
      if (key in input) {
        updates[key] = normalized;
      }
    };

    add("type", normalizeType(input.type || existing.type));
    add("title", input.title ? requiredString(input.title) : existing.title);
    add("slug", input.slug ? requiredString(input.slug) : existing.slug);
    add("description", nullableString(input.description ?? existing.description));
    add("content", nullableString(input.content ?? existing.content));
    add("featured_image", nullableString(input.featured_image ?? existing.featured_image));
    add("thumbnail", nullableString(input.thumbnail ?? existing.thumbnail));
    add("author_id", nullableString(input.author_id ?? existing.author_id));
    add("category_id", nullableString(input.category_id ?? existing.category_id));
    add("region_id", nullableString(input.region_id ?? existing.region_id));
    add("published_at", normalizeDate(input.published_at ?? existing.published_at));
    add("expires_at", normalizeDate(input.expires_at ?? existing.expires_at));
    add("visibility", normalizeVisibility(input.visibility || existing.visibility));
    add("priority", normalizePriority(input.priority || existing.priority));
    add("status", normalizeStatus(input.status || existing.status));

    const setClauses = Object.keys(updates).map((key) => `${key} = ?`);
    const values = Object.values(updates);

    await this.db
      .prepare(`UPDATE publications SET ${setClauses.join(", ")} WHERE id = ?`)
      .bind(...values, requiredString(id))
      .run();

    return this.getById(id);
  }

  async saveAdminOverride(publicationId: string, override: AdminPublicationOverrideInput): Promise<string> {
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `
        INSERT INTO publication_admin_overrides (id, publication_id, status, visibility, priority, featured_until, pinned_until, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        id,
        requiredString(publicationId),
        override.status ? normalizeStatus(override.status) : null,
        override.visibility ? normalizeVisibility(override.visibility) : null,
        override.priority ? normalizePriority(override.priority) : null,
        override.featured_until ? normalizeDate(override.featured_until) : null,
        override.pinned_until ? normalizeDate(override.pinned_until) : null,
        now(),
      )
      .run();

    return id;
  }

  async applyAdminOverride(publicationId: string): Promise<Publication | null> {
    const override = await this.db
      .prepare("SELECT * FROM publication_admin_overrides WHERE publication_id = ? ORDER BY created_at DESC LIMIT 1")
      .bind(requiredString(publicationId))
      .first<Record<string, unknown>>();

    if (!override) return this.getById(publicationId);

    const updates: Record<string, unknown> = { updated_at: now() };

    if (override.status) updates.status = normalizeStatus(override.status);
    if (override.visibility) updates.visibility = normalizeVisibility(override.visibility);
    if (override.priority) updates.priority = normalizePriority(override.priority);
    if (override.featured_until) updates.featured_until = normalizeDate(override.featured_until);
    if (override.pinned_until) updates.pinned_until = normalizeDate(override.pinned_until);

    const setClauses = Object.keys(updates).map((key) => `${key} = ?`);
    const values = Object.values(updates);

    await this.db
      .prepare(`UPDATE publications SET ${setClauses.join(", ")} WHERE id = ?`)
      .bind(...values, requiredString(publicationId))
      .run();

    return this.getById(publicationId);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;

    await this.db
      .prepare("UPDATE publications SET deleted_at = ?, updated_at = ? WHERE id = ?")
      .bind(now(), now(), requiredString(id))
      .run();

    return true;
  }

  async restore(id: string): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET deleted_at = NULL, updated_at = ? WHERE id = ?")
      .bind(now(), requiredString(id))
      .run();

    return this.getById(id);
  }

  async setPinned(id: string, pinnedUntil: string | null = null): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET pinned_until = ?, updated_at = ? WHERE id = ?")
      .bind(pinnedUntil ? normalizeDate(pinnedUntil) : null, now(), requiredString(id))
      .run();

    return this.getById(id);
  }

  async setFeatured(id: string, featuredUntil: string | null = null): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET featured_until = ?, updated_at = ? WHERE id = ?")
      .bind(featuredUntil ? normalizeDate(featuredUntil) : null, now(), requiredString(id))
      .run();

    return this.getById(id);
  }

  async publish(id: string): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET status = ?, published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?")
      .bind("published", now(), now(), requiredString(id))
      .run();

    await this.addHistory(id, "published");

    return this.getById(id);
  }

  async reject(id: string): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET status = ?, updated_at = ? WHERE id = ?")
      .bind("rejected", now(), requiredString(id))
      .run();

    await this.addHistory(id, "rejected");

    return this.getById(id);
  }

  async hide(id: string): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET visibility = ?, updated_at = ? WHERE id = ?")
      .bind("private", now(), requiredString(id))
      .run();

    await this.addHistory(id, "hidden");

    return this.getById(id);
  }

  async archive(id: string): Promise<Publication | null> {
    await this.db
      .prepare("UPDATE publications SET status = ?, updated_at = ? WHERE id = ?")
      .bind("archived", now(), requiredString(id))
      .run();

    await this.addHistory(id, "archived");

    return this.getById(id);
  }

  async ensureMetricRow(publicationId: string): Promise<void> {
    const existing = await this.db
      .prepare("SELECT id FROM publication_metrics WHERE publication_id = ? LIMIT 1")
      .bind(requiredString(publicationId))
      .first<{ id: string }>();

    if (existing) return;

    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `
        INSERT INTO publication_metrics (
          id, publication_id, views_count, shares_count, likes_count, comments_count, bookmarks_count, updated_at
        )
        VALUES (?, ?, 0, 0, 0, 0, 0, ?)
      `,
      )
      .bind(id, requiredString(publicationId), now())
      .run();
  }

  async getMetrics(publicationId: string): Promise<PublicationMetrics> {
    await this.ensureMetricRow(publicationId);

    const row = await this.db
      .prepare("SELECT * FROM publication_metrics WHERE publication_id = ? LIMIT 1")
      .bind(requiredString(publicationId))
      .first<Record<string, unknown>>();

    if (!row) {
      return {
        publication_id: publicationId,
        views_count: 0,
        shares_count: 0,
        likes_count: 0,
        comments_count: 0,
        bookmarks_count: 0,
        updated_at: now(),
      };
    }

    return {
      publication_id: requiredString(row.publication_id),
      views_count: normalizeMetric(row.views_count),
      shares_count: normalizeMetric(row.shares_count),
      likes_count: normalizeMetric(row.likes_count),
      comments_count: normalizeMetric(row.comments_count),
      bookmarks_count: normalizeMetric(row.bookmarks_count),
      updated_at: requiredString(row.updated_at),
    };
  }

  async incrementMetric(publicationId: string, metric: PublicationMetric, value: string = "1"): Promise<void> {
    await this.ensureMetricRow(publicationId);

    const numValue = finitePositiveNumber(value);
    if (numValue <= 0) return;

    const metricColumn = metric;

    await this.db
      .prepare(`UPDATE publication_metrics SET ${metricColumn} = ${metricColumn} + ?, updated_at = ? WHERE publication_id = ?`)
      .bind(numValue, now(), requiredString(publicationId))
      .run();
  }

  async addMedia(publicationId: string, mediaUrl: string, mediaType: string = "image", altText: string | null = null, position: number = 0): Promise<PublicationMedia> {
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `
        INSERT INTO publication_media (id, publication_id, media_url, media_type, alt_text, position, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        id,
        requiredString(publicationId),
        requiredString(mediaUrl),
        requiredString(mediaType),
        nullableString(altText),
        parseTotal(position),
        now(),
      )
      .run();

    const row = await this.db
      .prepare("SELECT * FROM publication_media WHERE id = ? LIMIT 1")
      .bind(id)
      .first<Record<string, unknown>>();

    return row ? mapMedia(row) : { id, publication_id: publicationId, media_url: mediaUrl, media_type: mediaType, alt_text: altText, position, created_at: now() };
  }

  async getMedia(publicationId: string): Promise<PublicationMedia[]> {
    const rows = await this.db
      .prepare("SELECT * FROM publication_media WHERE publication_id = ? ORDER BY position ASC")
      .bind(requiredString(publicationId))
      .all<Record<string, unknown>>();

    return rows.results.map(mapMedia);
  }

  async removeMedia(mediaId: string): Promise<boolean> {
    await this.db.prepare("DELETE FROM publication_media WHERE id = ?").bind(requiredString(mediaId)).run();

    return true;
  }

  async addHistory(publicationId: string, action: PublicationHistoryAction, metadata: Record<string, unknown> | null = null): Promise<string> {
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `
        INSERT INTO publication_history (id, publication_id, action, metadata, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      )
      .bind(
        id,
        requiredString(publicationId),
        requiredString(action),
        metadata ? JSON.stringify(metadata) : null,
        now(),
      )
      .run();

    return id;
  }

  async getHistory(publicationId: string, limit: number = 50): Promise<Array<{ id: string; action: PublicationHistoryAction; metadata: Record<string, unknown> | null; created_at: string }>> {
    const rows = await this.db
      .prepare("SELECT id, action, metadata, created_at FROM publication_history WHERE publication_id = ? ORDER BY created_at DESC LIMIT ?")
      .bind(requiredString(publicationId), limitValue(limit))
      .all<Record<string, unknown>>();

    return rows.results.map((row) => ({
      id: requiredString(row.id),
      action: stringValue(row.action) as PublicationHistoryAction,
      metadata: row.metadata ? (JSON.parse(stringValue(row.metadata)) as Record<string, unknown>) : null,
      created_at: requiredString(row.created_at),
    }));
  }

  async registerShare(
    publicationId: string,
    options: {
      userId?: string;
      visitorId?: string;
      sessionId?: string;
      shareType?: string;
      targetConversationId?: string;
      targetUserId?: string;
      source?: string;
    } = {},
  ): Promise<string> {
    const generatedIdValue = crypto.randomUUID();

    const id: string = generatedIdValue == null ? "" : String(generatedIdValue).trim();

    if (id.length === 0) {
      throw new Error("Не удалось сгенерировать ID события share");
    }

    await this.db
      .prepare(
        `
        INSERT INTO publication_share_events (
          id,
          publication_id,
          user_id,
          visitor_id,
          session_id,
          share_type,
          target_conversation_id,
          target_user_id,
          source,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        id,
        requiredString(publicationId),
        nullableString(options.userId),
        nullableString(options.visitorId),
        nullableString(options.sessionId),
        nullableString(options.shareType) || "share",
        nullableString(options.targetConversationId),
        nullableString(options.targetUserId),
        nullableString(options.source) || "publication",
        now(),
      )
      .run();

    await this.incrementMetric(publicationId, "shares_count", "1");

    return id;
  }

  async registerView(publicationId: string, visitorId: string | null = null, sessionId: string | null = null): Promise<string> {
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `
        INSERT INTO publication_view_events (id, publication_id, visitor_id, session_id, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      )
      .bind(id, requiredString(publicationId), nullableString(visitorId), nullableString(sessionId), now())
      .run();

    await this.incrementMetric(publicationId, "views_count", "1");

    return id;
  }

  async bulkStatus(publicationIds: string[], status: PublicationStatus): Promise<PublicationBulkResult> {
    const result: PublicationBulkResult = { success: 0, failed: 0, errors: [] };

    for (const id of publicationIds) {
      try {
        await this.update(id, { status });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({ id, error: String(error) });
      }
    }

    return result;
  }

  async bulkStatusDetailed(
    publicationIds: string[],
    status: PublicationStatus,
  ): Promise<{
    success: Publication[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const success: Publication[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of publicationIds) {
      try {
        const updated = await this.update(id, { status });
        if (updated) success.push(updated);
      } catch (error) {
        failed.push({ id, error: String(error) });
      }
    }

    return { success, failed };
  }

  async processExpired(): Promise<number> {
    const now_str = now();

    const result = await this.db
      .prepare(
        `
        UPDATE publications
        SET status = ?, updated_at = ?
        WHERE expires_at IS NOT NULL AND expires_at < ? AND status = ?
      `,
      )
      .bind("archived", now_str, now_str, "published")
      .run();

    return result.meta.changes;
  }

  async renumberPublications(): Promise<void> {
    const publications = await this.db
      .prepare("SELECT id FROM publications WHERE deleted_at IS NULL ORDER BY created_at ASC")
      .all<{ id: string }>();

    for (let i = 0; i < publications.results.length; i++) {
      const pub = publications.results[i];
      await this.db
        .prepare("UPDATE publications SET public_number = ? WHERE id = ?")
        .bind(i + 1, pub.id)
        .run();
    }
  }

  async permanentlyDelete(id: string): Promise<boolean> {
    await this.db.prepare("DELETE FROM publication_media WHERE publication_id = ?").bind(requiredString(id)).run();

    await this.db.prepare("DELETE FROM publication_history WHERE publication_id = ?").bind(requiredString(id)).run();

    await this.db.prepare("DELETE FROM publication_metrics WHERE publication_id = ?").bind(requiredString(id)).run();

    await this.db.prepare("DELETE FROM publication_admin_overrides WHERE publication_id = ?").bind(requiredString(id)).run();

    await this.db.prepare("DELETE FROM publication_share_events WHERE publication_id = ?").bind(requiredString(id)).run();

    await this.db.prepare("DELETE FROM publication_view_events WHERE publication_id = ?").bind(requiredString(id)).run();

    await this.db.prepare("DELETE FROM publications WHERE id = ?").bind(requiredString(id)).run();

    return true;
  }

  async publicFeed(limit: number = 20, offset: number = 0): Promise<PublicationListResult> {
    const now_str = now();

    const items = await this.db
      .prepare(
        `
        SELECT * FROM publications
        WHERE status = ? AND visibility = ? AND deleted_at IS NULL
          AND (published_at IS NULL OR published_at <= ?)
          AND (expires_at IS NULL OR expires_at > ?)
        ORDER BY pinned_until DESC, published_at DESC
        LIMIT ? OFFSET ?
      `,
      )
      .bind("published", "public", now_str, now_str, limitValue(limit), offsetValue(offset))
      .all<Record<string, unknown>>();

    const countResult = await this.db
      .prepare(
        `
        SELECT COUNT(*) as total FROM publications
        WHERE status = ? AND visibility = ? AND deleted_at IS NULL
          AND (published_at IS NULL OR published_at <= ?)
          AND (expires_at IS NULL OR expires_at > ?)
      `,
      )
      .bind("published", "public", now_str, now_str)
      .first<{ total: number }>();

    return {
      items: items.results.map(mapPublication),
      total: countResult?.total || 0,
      limit: limitValue(limit),
      offset: offsetValue(offset),
    };
  }

  getPublicUrl(publication: Publication): string {
    return safePublicationUrl(publication.public_number);
  }

  async adminSearch(query: string, limit: number = 50, offset: number = 0): Promise<PublicationListResult> {
    const searchQuery = `%${requiredString(query)}%`;

    const items = await this.db
      .prepare(
        `
        SELECT * FROM publications
        WHERE (title LIKE ? OR description LIKE ? OR content LIKE ? OR slug LIKE ?)
        ORDER BY public_number DESC
        LIMIT ? OFFSET ?
      `,
      )
      .bind(searchQuery, searchQuery, searchQuery, searchQuery, limitValue(limit), offsetValue(offset))
      .all<Record<string, unknown>>();

    const countResult = await this.db
      .prepare(
        `
        SELECT COUNT(*) as total FROM publications
        WHERE (title LIKE ? OR description LIKE ? OR content LIKE ? OR slug LIKE ?)
      `,
      )
      .bind(searchQuery, searchQuery, searchQuery, searchQuery)
      .first<{ total: number }>();

    return {
      items: items.results.map(mapPublication),
      total: countResult?.total || 0,
      limit: limitValue(limit),
      offset: offsetValue(offset),
    };
  }

  async getByReference(ref: string): Promise<Publication | null> {
    let publication = await this.getById(ref);
    if (publication) return publication;

    const publicNumber = finitePositiveNumber(ref);
    if (publicNumber > 0) {
      publication = await this.getByPublicNumber(publicNumber);
      if (publication) return publication;
    }

    const row = await this.db
      .prepare("SELECT * FROM publications WHERE slug = ? AND deleted_at IS NULL LIMIT 1")
      .bind(requiredString(ref))
      .first<Record<string, unknown>>();

    return row ? mapPublication(row) : null;
  }
}

export function createPublicationService(env: Env): PublicationService {
  return new PublicationService(env);
}

export async function createPublication(env: Env, input: CreatePublicationInput): Promise<Publication> {
  const service = createPublicationService(env);
  return service.create(input);
}

export async function getPublication(env: Env, id: string): Promise<Publication | null> {
  const service = createPublicationService(env);
  return service.getById(id);
}

export async function getPublicationByNumber(env: Env, publicNumber: number): Promise<Publication | null> {
  const service = createPublicationService(env);
  return service.getByPublicNumber(publicNumber);
}
