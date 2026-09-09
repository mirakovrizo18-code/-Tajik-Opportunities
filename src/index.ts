// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// MAIN CLOUDFLARE WORKER
// Version: 2026.09.09 POWER PRODUCTION
// ============================================================

import {
  corsHeaders,
  jsonResponse,
  errorResponse,
  notFoundResponse,
  methodNotAllowedResponse,
  getRequestContext,
  type RequestContext,
} from "./utils/response";

import {
  normalizeMethod,
} from "./utils/http";

import {
  normalizePublicNumber,
} from "./utils/publication";

export interface Env {
  DB: D1Database;

  ENVIRONMENT: string;
  APP_NAME: string;

  // Optional R2 media storage.
  MEDIA?: R2Bucket;
}

type RouteHandler = (
  request: Request,
  env: Env,
  context: RequestContext
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

const APP_NAME = "Tajik Opportunities";
const VERSION = "2026.09.09";

const routes: Route[] = [];

// ============================================================
// RESPONSE HELPERS
// ============================================================

function json(
  data: unknown,
  status = 200,
  requestId?: string
): Response {
  return jsonResponse(data, status, {
    requestId,
  });
}

function error(
  message: string,
  status = 500,
  requestId?: string,
  details?: unknown
): Response {
  return errorResponse(
    message,
    status,
    {
      requestId,
      details,
    }
  );
}

// ============================================================
// GENERAL HELPERS
// ============================================================

function route(
  method: string,
  pattern: RegExp,
  handler: RouteHandler
): void {
  routes.push({
    method: method.toUpperCase(),
    pattern,
    handler,
  });
}

function getPath(request: Request): string {
  return new URL(request.url).pathname;
}

function getQuery(
  request: Request,
  name: string
): string | null {
  return new URL(request.url).searchParams.get(name);
}

function getNumberQuery(
  request: Request,
  name: string,
  fallback = 0
): number {
  const value = getQuery(request, name);

  if (!value) return fallback;

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return number;
}

function requestId(request: Request): string {
  return (
    request.headers.get("X-Request-ID") ??
    crypto.randomUUID()
  );
}

function responseWithHeaders(
  response: Response,
  request: Request
): Response {
  const headers = new Headers(response.headers);

  const cors = corsHeaders(request);

  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }

  headers.set(
    "X-Tajik-Opportunities-Version",
    VERSION
  );

  headers.set(
    "X-Request-ID",
    requestId(request)
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    }
  );
}

// ============================================================
// SAFE JSON BODY
// ============================================================

async function readJson<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("JSON body required");
  }

  const text = await request.text();

  if (!text.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

// ============================================================
// D1 HELPERS
// ============================================================

function requireDB(env: Env): D1Database {
  if (!env.DB) {
    throw new Error(
      "D1 database binding DB is not configured"
    );
  }

  return env.DB;
}

async function dbFirst<T = unknown>(
  env: Env,
  sql: string,
  bindings: unknown[] = []
): Promise<T | null> {
  const db = requireDB(env);

  const result = await db
    .prepare(sql)
    .bind(...bindings)
    .first<T>();

  return result ?? null;
}

async function dbAll<T = unknown>(
  env: Env,
  sql: string,
  bindings: unknown[] = []
): Promise<T[]> {
  const db = requireDB(env);

  const result = await db
    .prepare(sql)
    .bind(...bindings)
    .all<T>();

  return result.results ?? [];
}

async function dbRun(
  env: Env,
  sql: string,
  bindings: unknown[] = []
): Promise<D1Result> {
  const db = requireDB(env);

  return db
    .prepare(sql)
    .bind(...bindings)
    .run();
}

// ============================================================
// HEALTH
// ============================================================

route(
  "GET",
  /^\/health$/,
  async (_request, env) => {
    let database = "unknown";

    try {
      await dbFirst(
        env,
        "SELECT 1 AS ok"
      );

      database = "online";
    } catch {
      database = "offline";
    }

    return json({
      ok: true,
      app: env.APP_NAME || APP_NAME,
      version: VERSION,
      environment:
        env.ENVIRONMENT || "unknown",
      database,
      timestamp:
        new Date().toISOString(),
    });
  }
);

route(
  "GET",
  /^\/api\/health$/,
  async (_request, env) => {
    let database = "unknown";

    try {
      await dbFirst(
        env,
        "SELECT 1 AS ok"
      );

      database = "online";
    } catch {
      database = "offline";
    }

    return json({
      ok: true,
      app: env.APP_NAME || APP_NAME,
      version: VERSION,
      environment:
        env.ENVIRONMENT || "unknown",
      database,
      mediaStorage:
        env.MEDIA ? "configured" : "not_configured",
      timestamp:
        new Date().toISOString(),
    });
  }
);

// ============================================================
// API ROOT
// ============================================================

route(
  "GET",
  /^\/api$/,
  async () => {
    return json({
      ok: true,
      name: APP_NAME,
      version: VERSION,
      status: "online",

      modules: {
        profiles: true,
        publications: true,
        comments: true,
        reviews: true,
        reactions: true,
        bookmarks: true,
        shares: true,
        reports: true,
        chat: true,
        notifications: true,
        search: true,
        levels: true,
        badges: true,
        payments: true,
        premium: true,
        pro: true,
        top: true,
        vip: true,
        admin: true,
        analytics: true,
      },
    });
  }
);

// ============================================================
// CATEGORIES
// ============================================================

route(
  "GET",
  /^\/api\/categories$/,
  async (_request, env) => {
    try {
      const categories = await dbAll(
        env,
        `
        SELECT
          id,
          name,
          slug,
          description,
          status,
          sort_order,
          created_at,
          updated_at
        FROM categories
        WHERE status = 'active'
        ORDER BY sort_order ASC, name ASC
        `
      );

      return json({
        ok: true,
        categories,
      });
    } catch {
      return error(
        "Unable to load categories",
        500
      );
    }
  }
);

// ============================================================
// PUBLICATIONS LIST
// ============================================================

route(
  "GET",
  /^\/api\/publications$/,
  async (request, env) => {
    try {
      const page = Math.max(
        1,
        getNumberQuery(request, "page", 1)
      );

      const limit = Math.min(
        100,
        Math.max(
          1,
          getNumberQuery(request, "limit", 20)
        )
      );

      const offset =
        (page - 1) * limit;

      const status =
        getQuery(request, "status") ??
        "published";

      const category =
        getQuery(request, "category");

      const sort =
        getQuery(request, "sort") ??
        "newest";

      let orderBy =
        "p.created_at DESC";

      if (sort === "oldest") {
        orderBy =
          "p.created_at ASC";
      }

      if (sort === "popular") {
        orderBy =
          "CAST(p.views_count AS INTEGER) DESC, p.created_at DESC";
      }

      let sql = `
        SELECT
          p.*
        FROM publications p
        WHERE p.status = ?
      `;

      const bindings: unknown[] = [
        status,
      ];

      if (category) {
        sql += `
          AND p.category_id = ?
        `;

        bindings.push(category);
      }

      sql += `
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;

      bindings.push(limit, offset);

      const publications =
        await dbAll(
          env,
          sql,
          bindings
        );

      const countRow =
        await dbFirst<{ count: number }>(
          env,
          `
          SELECT COUNT(*) AS count
          FROM publications p
          WHERE p.status = ?
          `,
          [status]
        );

      const total =
        Number(countRow?.count ?? 0);

      return json({
        ok: true,
        publications,
        pagination: {
          page,
          limit,
          total,
          pages:
            Math.ceil(total / limit),
          hasNext:
            offset + publications.length <
            total,
        },
      });
    } catch {
      return error(
        "Unable to load publications",
        500
      );
    }
  }
);

// ============================================================
// PUBLICATION BY INTERNAL ID
// ============================================================

route(
  "GET",
  /^\/api\/publications\/([^/]+)$/,
  async (request, env) => {
    try {
      const path =
        getPath(request);

      const match =
        path.match(
          /^\/api\/publications\/([^/]+)$/
        );

      const id =
        match?.[1];

      if (!id) {
        return error(
          "Publication ID is required",
          400
        );
      }

      const publication =
        await dbFirst(
          env,
          `
          SELECT *
          FROM publications
          WHERE id = ?
          LIMIT 1
          `,
          [id]
        );

      if (!publication) {
        return error(
          "Publication not found",
          404
        );
      }

      return json({
        ok: true,
        publication,
      });
    } catch {
      return error(
        "Unable to load publication",
        500
      );
    }
  }
);

// ============================================================
// PUBLIC POST NUMBER
// ============================================================

route(
  "GET",
  /^\/([0-9]+)$/,
  async (request, env) => {
    try {
      const path =
        getPath(request);

      const match =
        path.match(/^\/([0-9]+)$/);

      const rawNumber =
        match?.[1];

      if (!rawNumber) {
        return notFoundResponse(
          "Publication not found"
        );
      }

      const postNumber =
        normalizePublicNumber(
          rawNumber
        );

      if (!postNumber) {
        return notFoundResponse(
          "Publication not found"
        );
      }

      const publication =
        await dbFirst(
          env,
          `
          SELECT *
          FROM publications
          WHERE post_number = ?
            AND status = 'published'
          LIMIT 1
          `,
          [postNumber]
        );

      if (!publication) {
        return notFoundResponse(
          "Publication not found"
        );
      }

      return json({
        ok: true,
        type: "publication",
        postNumber,
        publication,
      });
    } catch {
      return error(
        "Unable to load publication",
        500
      );
    }
  }
);

// ============================================================
// PUBLICATION CREATE
// ============================================================

route(
  "POST",
  /^\/api\/publications$/,
  async (request, env) => {
    try {
      const body =
        await readJson<Record<string, unknown>>(
          request
        );

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const text =
        typeof body.text === "string"
          ? body.text.trim()
          : "";

      const categoryId =
        typeof body.category_id === "string"
          ? body.category_id
          : null;

      const authorId =
        typeof body.author_id === "string"
          ? body.author_id
          : null;

      if (!text && !title) {
        return error(
          "Publication text or title is required",
          400
        );
      }

      const id =
        crypto.randomUUID();

      const now =
        new Date().toISOString();

      const result =
        await dbRun(
          env,
          `
          INSERT INTO publications (
            id,
            author_id,
            category_id,
            title,
            text,
            status,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
          `,
          [
            id,
            authorId,
            categoryId,
            title || null,
            text || null,
            now,
            now,
          ]
        );

      return json(
        {
          ok: true,
          publication_id: id,
          status: "pending",
          result,
        },
        201
      );
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to create publication",
        500
      );
    }
  }
);

// ============================================================
// NOTIFICATIONS BASIC ROUTES
// ============================================================

route(
  "GET",
  /^\/api\/notifications$/,
  async (request, env) => {
    try {
      const participantId =
        getQuery(
          request,
          "participant_id"
        );

      if (!participantId) {
        return json({
          ok: true,
          notifications: [],
          unread: 0,
        });
      }

      const notifications =
        await dbAll(
          env,
          `
          SELECT *
          FROM notifications
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 100
          `,
          [participantId]
        );

      return json({
        ok: true,
        notifications,
      });
    } catch {
      return error(
        "Unable to load notifications",
        500
      );
    }
  }
);

route(
  "GET",
  /^\/api\/notifications\/unread$/,
  async (request, env) => {
    try {
      const participantId =
        getQuery(
          request,
          "participant_id"
        );

      if (!participantId) {
        return json({
          ok: true,
          unread: 0,
        });
      }

      const row =
        await dbFirst<{ count: number }>(
          env,
          `
          SELECT COUNT(*) AS count
          FROM notifications
          WHERE user_id = ?
            AND read_at IS NULL
          `,
          [participantId]
        );

      return json({
        ok: true,
        unread:
          Number(row?.count ?? 0),
      });
    } catch {
      return error(
        "Unable to count notifications",
        500
      );
    }
  }
);

// ============================================================
// SEARCH
// ============================================================

route(
  "GET",
  /^\/api\/search$/,
  async (request, env) => {
    try {
      const query =
        (
          getQuery(
            request,
            "q"
          ) ?? ""
        ).trim();

      if (!query) {
        return json({
          ok: true,
          query: "",
          results: [],
        });
      }

      const like =
        `%${query}%`;

      const publications =
        await dbAll(
          env,
          `
          SELECT
            id,
            post_number,
            title,
            text,
            status,
            created_at
          FROM publications
          WHERE status = 'published'
            AND (
              title LIKE ?
              OR text LIKE ?
            )
          ORDER BY created_at DESC
          LIMIT 50
          `,
          [like, like]
        );

      const users =
        await dbAll(
          env,
          `
          SELECT
            id,
            name,
            username,
            avatar_url,
            level
          FROM users_profiles
          WHERE
            name LIKE ?
            OR username LIKE ?
          LIMIT 50
          `,
          [like, like]
        );

      return json({
        ok: true,
        query,
        results: {
          publications,
          users,
        },
      });
    } catch {
      return error(
        "Search failed",
        500
      );
    }
  }
);

// ============================================================
// SYSTEM SETTINGS
// ============================================================

route(
  "GET",
  /^\/api\/settings$/,
  async (_request, env) => {
    try {
      const settings =
        await dbAll(
          env,
          `
          SELECT *
          FROM system_settings
          ORDER BY key ASC
          `
        );

      return json({
        ok: true,
        settings,
      });
    } catch {
      return error(
        "Unable to load settings",
        500
      );
    }
  }
);

// ============================================================
// FEATURE FLAGS
// ============================================================

route(
  "GET",
  /^\/api\/features$/,
  async (_request, env) => {
    try {
      const features =
        await dbAll(
          env,
          `
          SELECT *
          FROM feature_flags
          ORDER BY key ASC
          `
        );

      return json({
        ok: true,
        features,
      });
    } catch {
      return error(
        "Unable to load feature flags",
        500
      );
    }
  }
);

// ============================================================
// MEDIA
// ============================================================

route(
  "GET",
  /^\/api\/media\/(.+)$/,
  async (request, env) => {
    if (!env.MEDIA) {
      return error(
        "Media storage is not configured",
        503
      );
    }

    const path =
      getPath(request);

    const match =
      path.match(
        /^\/api\/media\/(.+)$/
      );

    const key =
      match?.[1];

    if (!key) {
      return notFoundResponse(
        "Media not found"
      );
    }

    const object =
      await env.MEDIA.get(key);

    if (!object) {
      return notFoundResponse(
        "Media not found"
      );
    }

    const headers =
      new Headers();

    object.writeHttpMetadata(
      headers
    );

    headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    headers.set(
      "ETag",
      object.httpEtag
    );

    return new Response(
      object.body,
      {
        status: 200,
        headers,
      }
    );
  }
);

// ============================================================
// API 404
// ============================================================

async function handleRoute(
  request: Request,
  env: Env,
  context: RequestContext
): Promise<Response> {
  const path =
    getPath(request);

  const method =
    normalizeMethod(
      request.method
    );

  for (const item of routes) {
    if (
      item.method !== method
    ) {
      continue;
    }

    if (
      item.pattern.test(path)
    ) {
      return item.handler(
        request,
        env,
        context
      );
    }
  }

  if (
    path.startsWith("/api/")
  ) {
    return notFoundResponse(
      "API endpoint not found"
    );
  }

  return notFoundResponse(
    "Page not found"
  );
}

// ============================================================
// OPTIONS / CORS
// ============================================================

function handleOptions(
  request: Request
): Response {
  return new Response(
    null,
    {
      status: 204,
      headers: corsHeaders(request),
    }
  );
}

// ============================================================
// MAIN WORKER
// ============================================================

export default {
  async fetch(
    request: Request,
    env: Env,
    _executionContext: ExecutionContext
  ): Promise<Response> {
    const id =
      requestId(request);

    try {
      if (
        request.method === "OPTIONS"
      ) {
        return handleOptions(
          request
        );
      }

      const context =
        getRequestContext(
          request
        );

      const response =
        await handleRoute(
          request,
          env,
          context
        );

      const finalResponse =
        responseWithHeaders(
          response,
          request
        );

      finalResponse.headers.set(
        "X-Request-ID",
        id
      );

      return finalResponse;
    } catch (err) {
      console.error(
        "Tajik Opportunities Worker Error:",
        err
      );

      return responseWithHeaders(
        error(
          err instanceof Error
            ? err.message
            : "Internal server error",
          500,
          id
        ),
        request
      );
    }
  },
};
