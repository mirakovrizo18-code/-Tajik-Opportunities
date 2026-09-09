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
  getRequestContext,
  type RequestContext,
} from "./utils/response";

import {
  normalizeMethod,
} from "./utils/http";

import {
  normalizePublicNumber,
} from "./utils/publication";

// ============================================================
// ENVIRONMENT
// ============================================================

export interface Env {
  DB: D1Database;

  ENVIRONMENT?: string;
  APP_NAME?: string;

  MEDIA?: R2Bucket;
}

// ============================================================
// TYPES
// ============================================================

type RouteHandler = (
  request: Request,
  env: Env,
  context: RequestContext,
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

// ============================================================
// APP
// ============================================================

const APP_NAME = "Tajik Opportunities";
const VERSION = "2026.09.09";

const routes: Route[] = [];

// ============================================================
// ROUTER
// ============================================================

function route(
  method: string,
  pattern: RegExp,
  handler: RouteHandler,
): void {
  routes.push({
    method: method.toUpperCase(),
    pattern,
    handler,
  });
}

// ============================================================
// RESPONSE
// ============================================================

function json(
  data: unknown,
  status = 200,
  requestId?: string,
): Response {
  return jsonResponse(
    data,
    status,
    {
      requestId,
    },
  );
}

function error(
  message: string,
  status = 500,
  requestId?: string,
  details?: unknown,
): Response {
  return errorResponse(
    message,
    status,
    {
      requestId,
      details,
    },
  );
}

function withHeaders(
  response: Response,
  request: Request,
  id: string,
): Response {
  const headers =
    new Headers(response.headers);

  const cors =
    corsHeaders(request);

  for (
    const [key, value]
    of Object.entries(cors)
  ) {
    headers.set(key, value);
  }

  headers.set(
    "X-Tajik-Opportunities-Version",
    VERSION,
  );

  headers.set(
    "X-Request-ID",
    id,
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    },
  );
}

// ============================================================
// REQUEST HELPERS
// ============================================================

function getPath(
  request: Request,
): string {
  return new URL(
    request.url,
  ).pathname;
}

function getQuery(
  request: Request,
  name: string,
): string | null {
  return new URL(
    request.url,
  ).searchParams.get(name);
}

function getNumberQuery(
  request: Request,
  name: string,
  fallback: number,
): number {
  const value =
    getQuery(
      request,
      name,
    );

  if (
    value === null ||
    value.trim() === ""
  ) {
    return fallback;
  }

  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return fallback;
  }

  return parsed;
}

function getRequestId(
  request: Request,
): string {
  const incoming =
    request.headers.get(
      "X-Request-ID",
    );

  if (
    incoming &&
    incoming.length <= 128
  ) {
    return incoming;
  }

  return crypto.randomUUID();
}

// ============================================================
// JSON
// ============================================================

async function readJson<T>(
  request: Request,
): Promise<T> {
  const contentType =
    request.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType
      .toLowerCase()
      .includes(
        "application/json",
      )
  ) {
    throw new Error(
      "JSON body required",
    );
  }

  const text =
    await request.text();

  if (
    !text.trim()
  ) {
    return {} as T;
  }

  try {
    return JSON.parse(
      text,
    ) as T;
  } catch {
    throw new Error(
      "Invalid JSON body",
    );
  }
}

// ============================================================
// D1
// ============================================================

function requireDB(
  env: Env,
): D1Database {
  if (!env.DB) {
    throw new Error(
      "D1 database binding DB is not configured",
    );
  }

  return env.DB;
}

async function dbFirst<T = unknown>(
  env: Env,
  sql: string,
  bindings: unknown[] = [],
): Promise<T | null> {
  return (
    await requireDB(env)
      .prepare(sql)
      .bind(...bindings)
      .first<T>()
  ) ?? null;
}

async function dbAll<T = unknown>(
  env: Env,
  sql: string,
  bindings: unknown[] = [],
): Promise<T[]> {
  const result =
    await requireDB(env)
      .prepare(sql)
      .bind(...bindings)
      .all<T>();

  return result.results ?? [];
}

async function dbRun(
  env: Env,
  sql: string,
  bindings: unknown[] = [],
): Promise<D1Result> {
  return requireDB(env)
    .prepare(sql)
    .bind(...bindings)
    .run();
}

// ============================================================
// OPTIONS
// ============================================================

function handleOptions(
  request: Request,
): Response {
  return new Response(
    null,
    {
      status: 204,
      headers:
        corsHeaders(request),
    },
  );
}

// ============================================================
// HEALTH
// ============================================================

async function databaseStatus(
  env: Env,
): Promise<
  "online" | "offline"
> {
  try {
    await dbFirst(
      env,
      "SELECT 1 AS ok",
    );

    return "online";
  } catch {
    return "offline";
  }
}

route(
  "GET",
  /^\/health$/,
  async (
    _request,
    env,
  ) => {
    return json({
      ok: true,
      app:
        env.APP_NAME ??
        APP_NAME,
      version: VERSION,
      environment:
        env.ENVIRONMENT ??
        "production",
      database:
        await databaseStatus(env),
      mediaStorage:
        env.MEDIA
          ? "configured"
          : "not_configured",
      timestamp:
        new Date().toISOString(),
    });
  },
);

route(
  "GET",
  /^\/api\/health$/,
  async (
    _request,
    env,
  ) => {
    return json({
      ok: true,
      app:
        env.APP_NAME ??
        APP_NAME,
      version: VERSION,
      environment:
        env.ENVIRONMENT ??
        "production",
      database:
        await databaseStatus(env),
      mediaStorage:
        env.MEDIA
          ? "configured"
          : "not_configured",
      timestamp:
        new Date().toISOString(),
    });
  },
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

      languages: [
        "ru",
        "tj",
        "en",
        "fa",
      ],

      modules: {
        profiles: true,
        visitors: true,
        publications: true,
        comments: true,
        reviews: true,
        reactions: true,
        bookmarks: true,
        shares: true,
        reports: true,

        conversations: true,
        messages: true,
        chat: true,

        notifications: true,
        notificationSettings: true,

        search: true,
        activity: true,

        levels: true,
        badges: true,

        payments: true,
        premium: true,
        pro: true,
        top: true,
        vip: true,

        admin: true,
        analytics: true,
        moderation: true,
        featureFlags: true,
        audit: true,

        media: true,
      },
    });
  },
);

// ============================================================
// CATEGORIES
// ============================================================

route(
  "GET",
  /^\/api\/categories$/,
  async (
    _request,
    env,
  ) => {
    try {
      const categories =
        await dbAll(
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
          ORDER BY
            sort_order ASC,
            name ASC
          `,
        );

      return json({
        ok: true,
        categories,
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load categories",
        500,
      );
    }
  },
);

// ============================================================
// PUBLICATIONS
// ============================================================

route(
  "GET",
  /^\/api\/publications$/,
  async (
    request,
    env,
  ) => {
    try {
      const rawPage =
        getNumberQuery(
          request,
          "page",
          1,
        );

      const rawLimit =
        getNumberQuery(
          request,
          "limit",
          20,
        );

      const page =
        Math.max(
          1,
          Math.floor(rawPage),
        );

      const limit =
        Math.min(
          100,
          Math.max(
            1,
            Math.floor(rawLimit),
          ),
        );

      const offset =
        (page - 1) *
        limit;

      const status =
        getQuery(
          request,
          "status",
        ) ??
        "published";

      const category =
        getQuery(
          request,
          "category",
        );

      const sort =
        getQuery(
          request,
          "sort",
        ) ??
        "newest";

      let orderBy =
        "p.created_at DESC";

      if (
        sort === "oldest"
      ) {
        orderBy =
          "p.created_at ASC";
      }

      /*
       * Не используем CAST большого
       * счётчика в INTEGER.
       *
       * publication_metric_totals
       * хранит значения как TEXT.
       */
      if (
        sort === "popular"
      ) {
        orderBy = `
          (
            SELECT
              LENGTH(m.views)
          FROM publication_metric_totals m
          WHERE m.publication_id = p.id
          LIMIT 1
        ) DESC,
        (
          SELECT
            m.views
          FROM publication_metric_totals m
          WHERE m.publication_id = p.id
          LIMIT 1
        ) DESC,
        p.created_at DESC
        `;
      }

      let sql = `
        SELECT
          p.*
        FROM publications p
        WHERE p.status = ?
      `;

      const bindings:
        unknown[] = [
          status,
        ];

      if (category) {
        sql += `
          AND p.category_id = ?
        `;

        bindings.push(
          category,
        );
      }

      sql += `
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;

      bindings.push(
        limit,
        offset,
      );

      const publications =
        await dbAll(
          env,
          sql,
          bindings,
        );

      const countRow =
        await dbFirst<{
          count: number;
        }>(
          env,
          `
          SELECT
            COUNT(*) AS count
          FROM publications p
          WHERE p.status = ?
          `,
          [status],
        );

      const total =
        Number(
          countRow?.count ??
          0,
        );

      return json({
        ok: true,
        publications,

        pagination: {
          page,
          limit,
          total,
          pages:
            Math.ceil(
              total / limit,
            ),
          hasNext:
            offset +
              publications.length <
            total,
        },
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load publications",
        500,
      );
    }
  },
);

// ============================================================
// PUBLICATION BY INTERNAL ID
// ============================================================

route(
  "GET",
  /^\/api\/publications\/([^/]+)$/,
  async (
    request,
    env,
  ) => {
    try {
      const match =
        getPath(
          request,
        ).match(
          /^\/api\/publications\/([^/]+)$/,
        );

      const id =
        match?.[1];

      if (!id) {
        return error(
          "Publication ID is required",
          400,
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
          [id],
        );

      if (!publication) {
        return error(
          "Publication not found",
          404,
        );
      }

      return json({
        ok: true,
        publication,
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load publication",
        500,
      );
    }
  },
);

// ============================================================
// PUBLIC POST NUMBER
// /1
// /2
// /3
// ============================================================

route(
  "GET",
  /^\/([0-9]+)$/,
  async (
    request,
    env,
  ) => {
    try {
      const match =
        getPath(
          request,
        ).match(
          /^\/([0-9]+)$/,
        );

      const rawNumber =
        match?.[1];

      if (!rawNumber) {
        return notFoundResponse(
          "Publication not found",
        );
      }

      const postNumber =
        normalizePublicNumber(
          rawNumber,
        );

      if (
        postNumber ===
        null ||
        postNumber ===
        undefined ||
        !Number.isFinite(
          postNumber,
        ) ||
        postNumber <= 0
      ) {
        return notFoundResponse(
          "Publication not found",
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
          [postNumber],
        );

      if (!publication) {
        return notFoundResponse(
          "Publication not found",
        );
      }

      return json({
        ok: true,
        type: "publication",
        postNumber,
        publication,
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load publication",
        500,
      );
    }
  },
);

// ============================================================
// CREATE PUBLICATION
// ============================================================

route(
  "POST",
  /^\/api\/publications$/,
  async (
    request,
    env,
  ) => {
    try {
      const body =
        await readJson<
          Record<
            string,
            unknown
          >
        >(
          request,
        );

      const title =
        typeof body.title ===
        "string"
          ? body.title.trim()
          : "";

      const text =
        typeof body.text ===
        "string"
          ? body.text.trim()
          : "";

      const description =
        typeof body.description ===
        "string"
          ? body.description.trim()
          : "";

      const categoryId =
        typeof body.category_id ===
        "string"
          ? body.category_id
          : null;

      const authorId =
        typeof body.author_id ===
        "string"
          ? body.author_id
          : null;

      if (
        !title &&
        !text &&
        !description
      ) {
        return error(
          "Publication text or title is required",
          400,
        );
      }

      const id =
        crypto.randomUUID();

      const now =
        new Date().toISOString();

      /*
       * Используем только базовые поля,
       * которые присутствуют в основной
       * таблице publications.
       */
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
        VALUES (
          ?, ?, ?, ?, ?, 'pending', ?, ?
        )
        `,
        [
          id,
          authorId,
          categoryId,
          title ||
            description ||
            null,
          text ||
            description ||
            null,
          now,
          now,
        ],
      );

      return json(
        {
          ok: true,
          publication_id: id,
          status: "pending",
          message:
            "Publication submitted for moderation",
        },
        201,
      );
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to create publication",
        500,
      );
    }
  },
);

// ============================================================
// NOTIFICATIONS
// ============================================================

route(
  "GET",
  /^\/api\/notifications$/,
  async (
    request,
    env,
  ) => {
    try {
      const participantId =
        getQuery(
          request,
          "participant_id",
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
          [participantId],
        );

      const unreadRow =
        await dbFirst<{
          count: number;
        }>(
          env,
          `
          SELECT
            COUNT(*) AS count
          FROM notifications
          WHERE user_id = ?
            AND read_at IS NULL
          `,
          [participantId],
        );

      return json({
        ok: true,
        notifications,
        unread:
          Number(
            unreadRow?.count ??
            0,
          ),
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load notifications",
        500,
      );
    }
  },
);

// ============================================================
// UNREAD NOTIFICATIONS
// ============================================================

route(
  "GET",
  /^\/api\/notifications\/unread$/,
  async (
    request,
    env,
  ) => {
    try {
      const participantId =
        getQuery(
          request,
          "participant_id",
        );

      if (!participantId) {
        return json({
          ok: true,
          unread: 0,
        });
      }

      const row =
        await dbFirst<{
          count: number;
        }>(
          env,
          `
          SELECT
            COUNT(*) AS count
          FROM notifications
          WHERE user_id = ?
            AND read_at IS NULL
          `,
          [participantId],
        );

      return json({
        ok: true,
        unread:
          Number(
            row?.count ??
            0,
          ),
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to count notifications",
        500,
      );
    }
  },
);

// ============================================================
// SEARCH
// ============================================================

route(
  "GET",
  /^\/api\/search$/,
  async (
    request,
    env,
  ) => {
    try {
      const query =
        (
          getQuery(
            request,
            "q",
          ) ?? ""
        ).trim();

      if (!query) {
        return json({
          ok: true,
          query: "",
          results: {
            publications: [],
            users: [],
          },
        });
      }

      const limitedQuery =
        query.slice(
          0,
          300,
        );

      const like =
        `%${limitedQuery}%`;

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
          ORDER BY
            created_at DESC
          LIMIT 50
          `,
          [
            like,
            like,
          ],
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
          ORDER BY
            name ASC
          LIMIT 50
          `,
          [
            like,
            like,
          ],
        );

      return json({
        ok: true,
        query: limitedQuery,
        results: {
          publications,
          users,
        },
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Search failed",
        500,
      );
    }
  },
);

// ============================================================
// SYSTEM SETTINGS
// ============================================================

route(
  "GET",
  /^\/api\/settings$/,
  async (
    _request,
    env,
  ) => {
    try {
      const settings =
        await dbAll(
          env,
          `
          SELECT *
          FROM system_settings
          ORDER BY key ASC
          `,
        );

      return json({
        ok: true,
        settings,
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load settings",
        500,
      );
    }
  },
);

// ============================================================
// FEATURE FLAGS
// ============================================================

route(
  "GET",
  /^\/api\/features$/,
  async (
    _request,
    env,
  ) => {
    try {
      const features =
        await dbAll(
          env,
          `
          SELECT *
          FROM feature_flags
          ORDER BY key ASC
          `,
        );

      return json({
        ok: true,
        features,
      });
    } catch (err) {
      return error(
        err instanceof Error
          ? err.message
          : "Unable to load feature flags",
        500,
      );
    }
  },
);

// ============================================================
// MEDIA / R2
// ============================================================

route(
  "GET",
  /^\/api\/media\/(.+)$/,
  async (
    request,
    env,
  ) => {
    if (!env.MEDIA) {
      return error(
        "Media storage is not configured",
        503,
      );
    }

    const match =
      getPath(
        request,
      ).match(
        /^\/api\/media\/(.+)$/,
      );

    const key =
      match?.[1];

    if (!key) {
      return notFoundResponse(
        "Media not found",
      );
    }

    let decodedKey: string;

    try {
      decodedKey =
        decodeURIComponent(
          key,
        );
    } catch {
      return error(
        "Invalid media key",
        400,
      );
    }

    const object =
      await env.MEDIA.get(
        decodedKey,
      );

    if (!object) {
      return notFoundResponse(
        "Media not found",
      );
    }

    const headers =
      new Headers();

    object.writeHttpMetadata(
      headers,
    );

    headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );

    headers.set(
      "ETag",
      object.httpEtag,
    );

    return new Response(
      object.body,
      {
        status: 200,
        headers,
      },
    );
  },
);

// ============================================================
// ROUTE DISPATCH
// ============================================================

async function handleRoute(
  request: Request,
  env: Env,
  context: RequestContext,
): Promise<Response> {
  const path =
    getPath(request);

  const method =
    normalizeMethod(
      request.method,
    );

  for (const item of routes) {
    if (
      item.method !==
      method
    ) {
      continue;
    }

    /*
     * RegExp.test() может быть опасен
     * для RegExp с global/sticky.
     * Наши маршруты такими не являются,
     * но сбрасываем lastIndex для безопасности.
     */
    item.pattern.lastIndex = 0;

    if (
      item.pattern.test(path)
    ) {
      return item.handler(
        request,
        env,
        context,
      );
    }
  }

  if (
    path === "/api" ||
    path.startsWith(
      "/api/",
    )
  ) {
    return notFoundResponse(
      "API endpoint not found",
    );
  }

  return notFoundResponse(
    "Page not found",
  );
}

// ============================================================
// METHOD NOT ALLOWED
// ============================================================

function methodNotAllowed(
  request: Request,
): Response {
  const path =
    getPath(request);

  const exists =
    routes.some(
      (item) => {
        item.pattern.lastIndex = 0;

        return item.pattern.test(
          path,
        );
      },
    );

  if (!exists) {
    return notFoundResponse(
      "Endpoint not found",
    );
  }

  return new Response(
    JSON.stringify({
      ok: false,
      error:
        "Method not allowed",
    }),
    {
      status: 405,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        Allow:
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        ...corsHeaders(request),
      },
    },
  );
}

// ============================================================
// MAIN WORKER
// ============================================================

export default {
  async fetch(
    request: Request,
    env: Env,
    _executionContext: ExecutionContext,
  ): Promise<Response> {
    const id =
      getRequestId(
        request,
      );

    try {
      if (
        request.method
          .toUpperCase() ===
        "OPTIONS"
      ) {
        return withHeaders(
          handleOptions(
            request,
          ),
          request,
          id,
        );
      }

      const context =
        getRequestContext(
          request,
        );

      const path =
        getPath(request);

      const normalizedMethod =
        normalizeMethod(
          request.method,
        );

      /*
       * Сначала проверяем существование
       * маршрута с нужным методом.
       */
      const matchingPath =
        routes.some(
          (item) => {
            item.pattern.lastIndex = 0;

            return (
              item.pattern.test(
                path,
              )
            );
          },
        );

      const matchingMethod =
        routes.some(
          (item) => {
            if (
              item.method !==
              normalizedMethod
            ) {
              return false;
            }

            item.pattern.lastIndex = 0;

            return item.pattern.test(
              path,
            );
          },
        );

      if (
        matchingPath &&
        !matchingMethod
      ) {
        return withHeaders(
          methodNotAllowed(
            request,
          ),
          request,
          id,
        );
      }

      const response =
        await handleRoute(
          request,
          env,
          context,
        );

      return withHeaders(
        response,
        request,
        id,
      );
    } catch (err) {
      console.error(
        "Tajik Opportunities Worker Error",
        err,
      );

      return withHeaders(
        error(
          err instanceof Error
            ? err.message
            : "Internal server error",
          500,
          id,
        ),
        request,
        id,
      );
    }
  },
};
