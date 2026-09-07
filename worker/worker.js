/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   CLOUDFLARE WORKER
   Version: 2026.09.07 POWER ADMIN

   USER SYSTEM
   ------------------------------------------------------------
   • Нет регистрации
   • Нет обычного логина
   • Нет пароля пользователя
   • Нет обычного профиля
   • Пользователь указывает имя при публикации
   • Все отправленные данные сохраняются

   ADMIN SYSTEM
   ------------------------------------------------------------
   • Один главный администратор
   • Role: super_admin
   • Permissions: *
   • Вход администратора НЕ требуется
   • Полный доступ к API
   • Публикации
   • Участники
   • Чат
   • Уведомления
   • Статистика
   • Журнал действий

   PUBLICATION FLOW
   ------------------------------------------------------------
   Участник
      ↓
   POST /api/publications
      ↓
   D1
      ↓
   status = pending
      ↓
   Админ-панель
      ↓
   approve / reject / edit / delete
      ↓
   published
      ↓
   Сайт
============================================================ */

const VERSION = "2026.09.07";

const SITE_NAME = "Tajik Opportunities";

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS"
];

const PUBLICATION_STATUSES = [
  "pending",
  "published",
  "rejected",
  "draft",
  "archived"
];

const ADMIN = {
  id: "key-admin",
  name: "Главный администратор",
  username: "admin",
  role: "super_admin",
  permissions: ["*"],
  is_active: true
};


/* ============================================================
   ENTRY
============================================================ */

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      console.error("WORKER_ERROR", error);

      return json(
        {
          ok: false,
          error: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Internal server error",
          version: VERSION
        },
        500,
        request
      );
    }
  }
};


/* ============================================================
   MAIN REQUEST
============================================================ */

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  if (!ALLOWED_METHODS.includes(request.method)) {
    return json(
      {
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      request
    );
  }

  if (request.method === "OPTIONS") {
    return corsResponse(request);
  }

  if (
    path === "/health" ||
    path === "/api/health"
  ) {
    return json(
      {
        ok: true,
        service: SITE_NAME,
        version: VERSION,
        status: "healthy",
        environment:
          env.ENVIRONMENT || "production",
        database: !!env.DB,
        assets: !!env.ASSETS,
        time: new Date().toISOString()
      },
      200,
      request
    );
  }

  if (path.startsWith("/api")) {
    const response = await handleApi(
      request,
      env,
      ctx
    );

    return withSecurity(
      response,
      request
    );
  }

  if (env.ASSETS) {
    const assetResponse =
      await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    if (
      request.method === "GET" &&
      !path.includes(".")
    ) {
      const fallbackRequest =
        new Request(
          new URL(
            "/index.html",
            request.url
          ),
          request
        );

      const fallback =
        await env.ASSETS.fetch(
          fallbackRequest
        );

      if (fallback.status !== 404) {
        return fallback;
      }
    }
  }

  return json(
    {
      ok: false,
      error: "NOT_FOUND"
    },
    404,
    request
  );
}


/* ============================================================
   API ROUTER
============================================================ */

async function handleApi(
  request,
  env,
  ctx
) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);


  /* ==========================================================
     API ROOT
  ========================================================== */

  if (
    path === "/api" ||
    path === "/api/"
  ) {
    return json(
      {
        ok: true,

        service: SITE_NAME,
        version: VERSION,
        api: "v1",

        user_mode: "name_only",

        authentication: {
          users: false,
          registration: false,
          login: false,
          password: false,
          profile: false
        },

        admin: {
          enabled: true,
          login_required: false,
          password_required: false,
          session_required: false,
          role: ADMIN.role,
          permissions: ADMIN.permissions
        },

        features: {
          publications: true,
          moderation: true,
          participants: true,
          chat: true,
          notifications: true,
          statistics: true,
          audit_log: true
        }
      },
      200,
      request
    );
  }


  /* ==========================================================
     ADMIN
  ========================================================== */

  if (
    path === "/api/admin" ||
    path.startsWith("/api/admin/")
  ) {
    return handleAdminApi(
      request,
      env,
      ctx
    );
  }


  /* ==========================================================
     PUBLICATIONS
  ========================================================== */

  if (
    path === "/api/publications"
  ) {
    if (
      request.method === "GET"
    ) {
      return handlePublicationsList(
        request,
        env
      );
    }

    if (
      request.method === "POST"
    ) {
      return handleCreatePublication(
        request,
        env
      );
    }

    return methodNotAllowed(
      request
    );
  }


  const publicationMatch =
    path.match(
      /^\/api\/publications\/([^/]+)$/
    );

  if (publicationMatch) {
    const id =
      decodeURIComponent(
        publicationMatch[1]
      );

    if (
      request.method === "GET"
    ) {
      return handlePublicationById(
        request,
        env,
        id
      );
    }

    return methodNotAllowed(
      request
    );
  }


  /* ==========================================================
     PUBLIC CHAT
  ========================================================== */

  if (
    path === "/api/admin-chat" ||
    path.startsWith("/api/admin-chat/")
  ) {
    return handlePublicChat(
      request,
      env,
      ctx
    );
  }


  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  if (
    path === "/api/notifications"
  ) {
    return handleNotifications(
      request,
      env
    );
  }


  /* ==========================================================
     LEGACY
  ========================================================== */

  if (
    path === "/api/opportunities" ||
    path.startsWith(
      "/api/opportunities/"
    )
  ) {
    return handleLegacyOpportunities(
      request,
      env
    );
  }


  if (
    path === "/api/messages" ||
    path.startsWith(
      "/api/messages/"
    )
  ) {
    return handleLegacyMessages(
      request,
      env
    );
  }


  return json(
    {
      ok: false,
      error: "API_ROUTE_NOT_FOUND",
      path
    },
    404,
    request
  );
}


/* ============================================================
   ADMIN ACCESS
============================================================ */

async function requireAdmin(
  request,
  env
) {
  return {
    ok: true,
    admin: {
      ...ADMIN
    }
  };
}


/* ============================================================
   ADMIN ROUTER
============================================================ */

async function handleAdminApi(
  request,
  env,
  ctx
) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);

  const access =
    await requireAdmin(
      request,
      env
    );

  if (!access.ok) {
    return json(
      {
        ok: false,
        error: "ADMIN_ACCESS_DENIED"
      },
      401,
      request
    );
  }


  /* ----------------------------------------------------------
     ADMIN ROOT
  ---------------------------------------------------------- */

  if (
    path === "/api/admin" ||
    path === "/api/admin/"
  ) {
    return json(
      {
        ok: true,
        admin: access.admin,

        permissions: ["*"],

        authentication: {
          login_required: false,
          password_required: false,
          session_required: false
        },

        sections: [
          "dashboard",
          "publications",
          "participants",
          "users",
          "chat",
          "notifications",
          "statistics",
          "audit"
        ]
      },
      200,
      request
    );
  }


  /* ----------------------------------------------------------
     ME
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/me"
  ) {
    return json(
      {
        ok: true,
        authenticated: true,
        login_required: false,
        admin: access.admin,
        permissions: ["*"]
      },
      200,
      request
    );
  }


  /* ----------------------------------------------------------
     DASHBOARD
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/dashboard"
  ) {
    return handleAdminDashboard(
      request,
      env
    );
  }


  /* ----------------------------------------------------------
     STATS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/stats"
  ) {
    return handleAdminStats(
      request,
      env
    );
  }


  /* ----------------------------------------------------------
     PUBLICATIONS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/publications" ||
    path.startsWith(
      "/api/admin/publications/"
    )
  ) {
    return handleAdminPublications(
      request,
      env,
      ctx
    );
  }


  /* ----------------------------------------------------------
     PARTICIPANTS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/participants" ||
    path.startsWith(
      "/api/admin/participants/"
    )
  ) {
    return handleAdminParticipants(
      request,
      env,
      ctx
    );
  }


  /* ----------------------------------------------------------
     USERS ALIAS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/users" ||
    path.startsWith(
      "/api/admin/users/"
    )
  ) {
    return handleAdminParticipants(
      request,
      env,
      ctx
    );
  }


  /* ----------------------------------------------------------
     CHAT
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/chat" ||
    path.startsWith(
      "/api/admin/chat/"
    )
  ) {
    return handleAdminChat(
      request,
      env,
      ctx
    );
  }


  /* ----------------------------------------------------------
     NOTIFICATIONS
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/notifications" ||
    path.startsWith(
      "/api/admin/notifications/"
    )
  ) {
    return handleAdminNotifications(
      request,
      env
    );
  }


  /* ----------------------------------------------------------
     AUDIT
  ---------------------------------------------------------- */

  if (
    path === "/api/admin/audit"
  ) {
    return handleAdminAudit(
      request,
      env
    );
  }


  return json(
    {
      ok: false,
      error: "ADMIN_ROUTE_NOT_FOUND",
      path
    },
    404,
    request
  );
}


/* ============================================================
   DASHBOARD
============================================================ */

async function handleAdminDashboard(
  request,
  env
) {
  const stats =
    await collectDashboardStats(
      env
    );

  return json(
    {
      ok: true,

      admin: ADMIN,

      stats,

      moderation: {
        pending_publications:
          stats.publications.pending,

        pending_participants:
          stats.participants.total
      }
    },
    200,
    request
  );
}


/* ============================================================
   STATISTICS
============================================================ */

async function handleAdminStats(
  request,
  env
) {
  const stats =
    await collectDashboardStats(
      env
    );

  return json(
    {
      ok: true,
      stats
    },
    200,
    request
  );
}


/* ============================================================
   DASHBOARD STATISTICS
============================================================ */

async function collectDashboardStats(
  env
) {
  const stats = {
    publications: {
      total: 0,
      pending: 0,
      published: 0,
      rejected: 0,
      draft: 0,
      archived: 0
    },

    participants: {
      total: 0,
      active: 0,
      banned: 0
    },

    chat: {
      total: 0,
      conversations: 0,
      unread: 0
    },

    notifications: {
      total: 0,
      unread: 0
    },

    engagement: {
      views: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0
    }
  };


  if (!env.DB) {
    return stats;
  }


  /* PUBLICATIONS */

  try {
    const row =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM publications
          `
        )
        .first();

    stats.publications.total =
      Number(row?.count || 0);
  } catch {}


  for (
    const status
    of PUBLICATION_STATUSES
  ) {
    try {
      const row =
        await env.DB
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM publications
            WHERE status = ?
            `
          )
          .bind(status)
          .first();

      stats.publications[status] =
        Number(row?.count || 0);
    } catch {}
  }


  /* ENGAGEMENT */

  try {
    const row =
      await env.DB
        .prepare(
          `
          SELECT
            COALESCE(SUM(views), 0) AS views,
            COALESCE(SUM(likes), 0) AS likes,
            COALESCE(SUM(comments), 0) AS comments,
            COALESCE(SUM(saves), 0) AS saves,
            COALESCE(SUM(shares), 0) AS shares
          FROM publications
          `
        )
        .first();

    stats.engagement = {
      views: Number(row?.views || 0),
      likes: Number(row?.likes || 0),
      comments: Number(row?.comments || 0),
      saves: Number(row?.saves || 0),
      shares: Number(row?.shares || 0)
    };
  } catch {}


  /* PARTICIPANTS */

  try {
    await ensureParticipantsTable(
      env
    );

    const row =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM participants
          `
        )
        .first();

    stats.participants.total =
      Number(row?.count || 0);

    const active =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM participants
          WHERE is_banned = 0
          `
        )
        .first();

    stats.participants.active =
      Number(active?.count || 0);

    const banned =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM participants
          WHERE is_banned = 1
          `
        )
        .first();

    stats.participants.banned =
      Number(banned?.count || 0);
  } catch {}


  /* CHAT */

  try {
    await ensureAdminChatTable(
      env
    );

    const row =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM admin_chat
          `
        )
        .first();

    stats.chat.total =
      Number(row?.count || 0);

    const conversations =
      await env.DB
        .prepare(
          `
          SELECT COUNT(
            DISTINCT conversation_id
          ) AS count
          FROM admin_chat
          `
        )
        .first();

    stats.chat.conversations =
      Number(
        conversations?.count || 0
      );

    const unread =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM admin_chat
          WHERE sender_type = 'user'
          AND (
            read_at IS NULL
            OR read_at = ''
          )
          `
        )
        .first();

    stats.chat.unread =
      Number(
        unread?.count || 0
      );
  } catch {}


  /* NOTIFICATIONS */

  try {
    await ensureNotificationsTable(
      env
    );

    const total =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM notifications
          `
        )
        .first();

    stats.notifications.total =
      Number(total?.count || 0);

    const unread =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM notifications
          WHERE is_read = 0
          `
        )
        .first();

    stats.notifications.unread =
      Number(
        unread?.count || 0
      );
  } catch {}


  return stats;
}


/* ============================================================
   PUBLICATION LIST
============================================================ */

async function handlePublicationsList(
  request,
  env
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  const url =
    new URL(request.url);

  const status =
    url.searchParams.get(
      "status"
    ) || "published";

  const category =
    url.searchParams.get(
      "category"
    );

  const city =
    url.searchParams.get(
      "city"
    );

  const search =
    url.searchParams.get(
      "search"
    ) ||
    url.searchParams.get(
      "q"
    );

  const page =
    Math.max(
      1,
      Number(
        url.searchParams.get(
          "page"
        ) || 1
      )
    );

  const limit =
    Math.min(
      100,
      Math.max(
        1,
        Number(
          url.searchParams.get(
            "limit"
          ) || 20
        )
      )
    );

  const offset =
    (page - 1) * limit;

  const conditions = [];
  const bindings = [];

  if (
    status !== "all"
  ) {
    conditions.push(
      "status = ?"
    );

    bindings.push(
      status
    );
  }

  if (category) {
    conditions.push(
      "category = ?"
    );

    bindings.push(
      category
    );
  }

  if (city) {
    conditions.push(
      "city = ?"
    );

    bindings.push(
      city
    );
  }

  if (search) {
    conditions.push(
      `
      (
        title LIKE ?
        OR text LIKE ?
        OR category LIKE ?
        OR city LIKE ?
        OR contact_name LIKE ?
      )
      `
    );

    const q =
      `%${search}%`;

    bindings.push(
      q,
      q,
      q,
      q,
      q
    );
  }

  const where =
    conditions.length
      ? `WHERE ${conditions.join(
          " AND "
        )}`
      : "";

  try {
    const result =
      await env.DB
        .prepare(
          `
          SELECT *
          FROM publications
          ${where}
          ORDER BY
            pinned DESC,
            featured DESC,
            COALESCE(
              published_at,
              created_at
            ) DESC
          LIMIT ? OFFSET ?
          `
        )
        .bind(
          ...bindings,
          limit,
          offset
        )
        .all();

    const count =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count
          FROM publications
          ${where}
          `
        )
        .bind(
          ...bindings
        )
        .first();

    return json(
      {
        ok: true,
        data:
          result.results || [],

        pagination: {
          page,
          limit,
          total:
            Number(
              count?.count || 0
            ),
          pages:
            Math.ceil(
              Number(
                count?.count || 0
              ) / limit
            )
        }
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATIONS_QUERY_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   GET PUBLICATION
============================================================ */

async function handlePublicationById(
  request,
  env,
  id
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error: "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  try {
    const publication =
      await env.DB
        .prepare(
          `
          SELECT *
          FROM publications
          WHERE id = ?
          LIMIT 1
          `
        )
        .bind(id)
        .first();

    if (!publication) {
      return json(
        {
          ok: false,
          error:
            "PUBLICATION_NOT_FOUND"
        },
        404,
        request
      );
    }


    /* Increase views only for public
       published content */

    if (
      publication.status ===
      "published"
    ) {
      try {
        await env.DB
          .prepare(
            `
            UPDATE publications
            SET views =
              COALESCE(
                views,
                0
              ) + 1
            WHERE id = ?
            `
          )
          .bind(id)
          .run();

        publication.views =
          Number(
            publication.views || 0
          ) + 1;
      } catch {}
    }


    let media = [];

    try {
      const result =
        await env.DB
          .prepare(
            `
            SELECT *
            FROM publication_media
            WHERE publication_id = ?
            ORDER BY id ASC
            `
          )
          .bind(id)
          .all();

      media =
        result.results || [];
    } catch {}


    let participant = null;

    if (
      publication.user_id
    ) {
      participant =
        await getParticipant(
          env,
          publication.user_id
        );
    }


    return json(
      {
        ok: true,
        publication,
        media,
        participant
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATION_QUERY_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   CREATE PUBLICATION
============================================================ */

async function handleCreatePublication(
  request,
  env
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error:
          "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }


  const now =
    new Date().toISOString();

  const id =
    cleanString(body.id) ||
    crypto.randomUUID();

  const trackingCode =
    cleanString(
      body.tracking_code
    ) ||
    createTrackingCode();


  /*
    IMPORTANT:
    Public user can never force
    "published".

    Every new publication starts
    as pending unless it is an
    internal/admin request.
  */

  const status =
    "pending";


  const userId =
    cleanString(
      body.user_id
    ) ||
    crypto.randomUUID();


  const participant =
    await upsertParticipant(
      env,
      {
        id: userId,

        name:
          cleanString(
            body.contact_name ||
            body.name ||
            body.user_name
          ) ||
          "Пользователь",

        username:
          cleanString(
            body.username
          ),

        email:
          cleanString(
            body.contact_email ||
            body.email
          ),

        phone:
          cleanString(
            body.contact_phone ||
            body.phone
          ),

        telegram:
          cleanString(
            body.contact_telegram ||
            body.telegram
          ),

        city:
          cleanString(
            body.city
          ),

        country:
          cleanString(
            body.country
          )
      }
    );


  const fields = {
    id,

    user_id:
      participant.id,

    title:
      cleanString(
        body.title
      ),

    text:
      cleanString(
        body.text
      ),

    category:
      cleanString(
        body.category
      ),

    city:
      cleanString(
        body.city
      ),

    country:
      cleanString(
        body.country
      ),

    hashtags:
      cleanString(
        body.hashtags
      ),

    media:
      cleanString(
        body.media
      ),

    status,

    views: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,

    love: 0,
    support: 0,
    funny: 0,
    wow: 0,
    sad: 0,
    angry: 0,

    price:
      cleanString(
        body.price
      ),

    pinned: 0,
    featured: 0,

    created_at:
      body.created_at ||
      now,

    updated_at:
      now,

    tracking_code:
      trackingCode,

    subcategory:
      cleanString(
        body.subcategory
      ),

    location:
      cleanString(
        body.location
      ),

    scope:
      cleanString(
        body.scope
      ),

    event_start:
      cleanString(
        body.event_start
      ),

    event_end:
      cleanString(
        body.event_end
      ),

    deadline:
      cleanString(
        body.deadline
      ),

    currency:
      cleanString(
        body.currency
      ),

    employment_type:
      cleanString(
        body.employment_type
      ),

    experience:
      cleanString(
        body.experience
      ),

    published_at:
      null,

    rejection_reason:
      null,

    translate_all:
      body.translate_all
        ? 1
        : 0,

    language:
      cleanString(
        body.language
      ) || "ru",

    contact_telegram:
      cleanString(
        body.contact_telegram
      ),

    contact_email:
      cleanString(
        body.contact_email
      ),

    contact_phone:
      cleanString(
        body.contact_phone
      ),

    contact_name:
      cleanString(
        body.contact_name ||
        body.name ||
        body.user_name
      ),

    education:
      cleanString(
        body.education
      ),

    work_format:
      cleanString(
        body.work_format
      ),

    external_url:
      cleanString(
        body.external_url
      ),

    languages:
      cleanString(
        body.languages
      )
  };


  try {
    const columns =
      Object.keys(fields);

    const placeholders =
      columns
        .map(() => "?")
        .join(", ");

    const values =
      columns.map(
        column =>
          fields[column]
      );

    await env.DB
      .prepare(
        `
        INSERT INTO publications
        (
          ${columns.join(", ")}
        )
        VALUES
        (
          ${placeholders}
        )
        `
      )
      .bind(...values)
      .run();


    await writeAuditLog(
      env,
      "publication_submitted",
      id,
      {
        publication_id: id,
        participant_id:
          participant.id,
        title:
          fields.title,
        status: "pending"
      }
    );


    return json(
      {
        ok: true,

        message:
          "Публикация отправлена на проверку.",

        publication: fields,

        participant,

        moderation: {
          status: "pending",
          requires_approval: true
        },

        tracking_code:
          trackingCode
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATION_CREATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   ADMIN PUBLICATIONS
============================================================ */

async function handleAdminPublications(
  request,
  env,
  ctx
) {
  const url =
    new URL(request.url);

  const path =
    normalizePath(
      url.pathname
    );


  /* ----------------------------------------------------------
     LIST
  ---------------------------------------------------------- */

  if (
    path ===
    "/api/admin/publications"
  ) {
    if (
      request.method === "GET"
    ) {
      return handleAdminPublicationList(
        request,
        env
      );
    }

    if (
      request.method === "POST"
    ) {
      return handleCreatePublication(
        request,
        env
      );
    }

    return methodNotAllowed(
      request
    );
  }


  const match =
    path.match(
      /^\/api\/admin\/publications\/([^/]+)(?:\/([^/]+))?$/
    );


  if (!match) {
    return json(
      {
        ok: false,
        error:
          "INVALID_PUBLICATION_ROUTE"
      },
      400,
      request
    );
  }


  const id =
    decodeURIComponent(
      match[1]
    );

  const action =
    match[2]
      ? decodeURIComponent(
          match[2]
        )
      : null;


  if (action) {
    return handlePublicationAction(
      request,
      env,
      id,
      action
    );
  }


  if (
    request.method === "GET"
  ) {
    return handlePublicationById(
      request,
      env,
      id
    );
  }


  if (
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    return handleAdminPublicationUpdate(
      request,
      env,
      id
    );
  }


  if (
    request.method === "DELETE"
  ) {
    return handleAdminPublicationDelete(
      request,
      env,
      id
    );
  }


  return methodNotAllowed(
    request
  );
}


/* ============================================================
   ADMIN PUBLICATION LIST
   Includes participant information
============================================================ */

async function handleAdminPublicationList(
  request,
  env
) {
  if (!env.DB) {
    return json(
      {
        ok: false,
        error:
          "DATABASE_NOT_CONFIGURED"
      },
      500,
      request
    );
  }


  const url =
    new URL(request.url);


  /*
    Default = ALL.
    This is important for admin.
  */

  const status =
    url.searchParams.get(
      "status"
    ) || "all";


  const search =
    url.searchParams.get(
      "search"
    ) ||
    url.searchParams.get(
      "q"
    );


  const category =
    url.searchParams.get(
      "category"
    );


  const city =
    url.searchParams.get(
      "city"
    );


  const page =
    Math.max(
      1,
      Number(
        url.searchParams.get(
          "page"
        ) || 1
      )
    );


  const limit =
    Math.min(
      200,
      Math.max(
        1,
        Number(
          url.searchParams.get(
            "limit"
          ) || 50
        )
      )
    );


  const offset =
    (page - 1) * limit;


  const conditions = [];
  const bindings = [];


  if (
    status !== "all" &&
    PUBLICATION_STATUSES.includes(
      status
    )
  ) {
    conditions.push(
      "p.status = ?"
    );

    bindings.push(
      status
    );
  }


  if (category) {
    conditions.push(
      "p.category = ?"
    );

    bindings.push(
      category
    );
  }


  if (city) {
    conditions.push(
      "p.city = ?"
    );

    bindings.push(
      city
    );
  }


  if (search) {
    conditions.push(
      `
      (
        p.title LIKE ?
        OR p.text LIKE ?
        OR p.category LIKE ?
        OR p.city LIKE ?
        OR p.contact_name LIKE ?
        OR p.contact_email LIKE ?
        OR p.contact_phone LIKE ?
        OR p.tracking_code LIKE ?
        OR pt.name LIKE ?
        OR pt.email LIKE ?
        OR pt.phone LIKE ?
      )
      `
    );


    const q =
      `%${search}%`;


    for (
      let i = 0;
      i < 11;
      i++
    ) {
      bindings.push(q);
    }
  }


  const where =
    conditions.length
      ? `WHERE ${conditions.join(
          " AND "
        )}`
      : "";


  try {
    const result =
      await env.DB
        .prepare(
          `
          SELECT
            p.*,

            pt.id AS participant_id,
            pt.name AS participant_name,
            pt.username AS participant_username,
            pt.email AS participant_email,
            pt.phone AS participant_phone,
            pt.telegram AS participant_telegram,
            pt.city AS participant_city,
            pt.country AS participant_country,
            pt.is_banned AS participant_is_banned,
            pt.is_active AS participant_is_active,
            pt.created_at AS participant_created_at

          FROM publications p

          LEFT JOIN participants pt
            ON pt.id = p.user_id

          ${where}

          ORDER BY
            CASE
              WHEN p.status = 'pending'
              THEN 0
              WHEN p.status = 'published'
              THEN 1
              ELSE 2
            END,

            p.pinned DESC,
            p.featured DESC,
            p.created_at DESC

          LIMIT ? OFFSET ?
          `
        )
        .bind(
          ...bindings,
          limit,
          offset
        )
        .all();


    const count =
      await env.DB
        .prepare(
          `
          SELECT COUNT(*) AS count

          FROM publications p

          LEFT JOIN participants pt
            ON pt.id = p.user_id

          ${where}
          `
        )
        .bind(
          ...bindings
        )
        .first();


    const rows =
      result.results || [];


    return json(
      {
        ok: true,

        data: rows,

        publications: rows,

        pending:
          rows.filter(
            item =>
              item.status ===
              "pending"
          ),

        pagination: {
          page,
          limit,
          total:
            Number(
              count?.count || 0
            ),
          pages:
            Math.ceil(
              Number(
                count?.count || 0
              ) / limit
            )
        }
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "ADMIN_PUBLICATIONS_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PUBLICATION ACTIONS
============================================================ */

async function handlePublicationAction(
  request,
  env,
  id,
  action
) {
  const now =
    new Date().toISOString();


  /* APPROVE */

  if (
    action === "approve" ||
    action === "publish"
  ) {
    try {
      await env.DB
        .prepare(
          `
          UPDATE publications

          SET
            status = 'published',
            published_at = ?,
            rejection_reason = NULL,
            updated_at = ?

          WHERE id = ?
          `
        )
        .bind(
          now,
          now,
          id
        )
        .run();


      await writeAuditLog(
        env,
        "publication_approved",
        id,
        {
          status:
            "published"
        }
      );


      return json(
        {
          ok: true,
          id,
          status:
            "published",
          message:
            "Публикация подтверждена и опубликована."
        },
        200,
        request
      );
    } catch (error) {
      return json(
        {
          ok: false,
          error:
            "PUBLICATION_APPROVE_FAILED",
          message:
            error.message
        },
        500,
        request
      );
    }
  }


  /* REJECT */

  if (
    action === "reject"
  ) {
    let body = {};

    try {
      body =
        await request.json();
    } catch {}


    const reason =
      cleanString(
        body.reason ||
        body.rejection_reason
      );


    try {
      await env.DB
        .prepare(
          `
          UPDATE publications

          SET
            status = 'rejected',
            rejection_reason = ?,
            updated_at = ?

          WHERE id = ?
          `
        )
        .bind(
          reason,
          now,
          id
        )
        .run();


      await writeAuditLog(
        env,
        "publication_rejected",
        id,
        {
          reason
        }
      );


      return json(
        {
          ok: true,
          id,
          status:
            "rejected",
          rejection_reason:
            reason
        },
        200,
        request
      );
    } catch (error) {
      return json(
        {
          ok: false,
          error:
            "PUBLICATION_REJECT_FAILED",
          message:
            error.message
        },
        500,
        request
      );
    }
  }


  /* PIN */

  if (
    action === "pin" ||
    action === "unpin"
  ) {
    return updatePublicationFlag(
      request,
      env,
      id,
      "pinned",
      action === "pin"
        ? 1
        : 0
    );
  }


  /* FEATURE */

  if (
    action === "feature" ||
    action === "unfeature"
  ) {
    return updatePublicationFlag(
      request,
      env,
      id,
      "featured",
      action === "feature"
        ? 1
        : 0
    );
  }


  /* ARCHIVE */

  if (
    action === "archive"
  ) {
    return updatePublicationStatus(
      request,
      env,
      id,
      "archived"
    );
  }


  /* DRAFT */

  if (
    action === "draft"
  ) {
    return updatePublicationStatus(
      request,
      env,
      id,
      "draft"
    );
  }


  return json(
    {
      ok: false,
      error:
        "UNKNOWN_PUBLICATION_ACTION"
    },
    400,
    request
  );
}


/* ============================================================
   PUBLICATION STATUS
============================================================ */

async function updatePublicationStatus(
  request,
  env,
  id,
  status
) {
  try {
    await env.DB
      .prepare(
        `
        UPDATE publications
        SET
          status = ?,
          updated_at = ?
        WHERE id = ?
        `
      )
      .bind(
        status,
        new Date().toISOString(),
        id
      )
      .run();


    await writeAuditLog(
      env,
      "publication_status_changed",
      id,
      {
        status
      }
    );


    return json(
      {
        ok: true,
        id,
        status
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATION_STATUS_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PUBLICATION FLAG
============================================================ */

async function updatePublicationFlag(
  request,
  env,
  id,
  field,
  value
) {
  if (
    field !== "pinned" &&
    field !== "featured"
  ) {
    return json(
      {
        ok: false,
        error:
          "INVALID_FLAG"
      },
      400,
      request
    );
  }


  try {
    await env.DB
      .prepare(
        `
        UPDATE publications

        SET
          ${field} = ?,
          updated_at = ?

        WHERE id = ?
        `
      )
      .bind(
        value,
        new Date().toISOString(),
        id
      )
      .run();


    await writeAuditLog(
      env,
      `publication_${field}`,
      id,
      {
        value
      }
    );


    return json(
      {
        ok: true,
        id,
        [field]: value
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATION_FLAG_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   UPDATE PUBLICATION
   ADMIN CAN CHANGE EVERYTHING
============================================================ */

async function handleAdminPublicationUpdate(
  request,
  env,
  id
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }


  const allowed = [
    "title",
    "text",
    "category",
    "city",
    "country",
    "hashtags",
    "media",
    "status",
    "price",
    "pinned",
    "featured",
    "subcategory",
    "location",
    "scope",
    "event_start",
    "event_end",
    "deadline",
    "currency",
    "employment_type",
    "experience",
    "rejection_reason",
    "translate_all",
    "language",
    "contact_telegram",
    "contact_email",
    "contact_phone",
    "contact_name",
    "education",
    "work_format",
    "external_url",
    "languages"
  ];


  const updates = [];
  const values = [];


  for (
    const field
    of allowed
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      updates.push(
        `${field} = ?`
      );


      if (
        field === "pinned" ||
        field === "featured" ||
        field === "translate_all"
      ) {
        values.push(
          body[field]
            ? 1
            : 0
        );
      } else {
        values.push(
          cleanString(
            body[field]
          )
        );
      }
    }
  }


  if (!updates.length) {
    return json(
      {
        ok: false,
        error:
          "NOTHING_TO_UPDATE"
      },
      400,
      request
    );
  }


  /*
    If admin changes status
    to published, automatically
    create published_at.
  */

  if (
    body.status ===
    "published"
  ) {
    updates.push(
      "published_at = ?"
    );

    values.push(
      new Date().toISOString()
    );
  }


  updates.push(
    "updated_at = ?"
  );

  values.push(
    new Date().toISOString()
  );

  values.push(id);


  try {
    await env.DB
      .prepare(
        `
        UPDATE publications
        SET
          ${updates.join(", ")}
        WHERE id = ?
        `
      )
      .bind(...values)
      .run();


    /*
      If contact name or contact
      information changed, also
      update participant.
    */

    const publication =
      await env.DB
        .prepare(
          `
          SELECT user_id
          FROM publications
          WHERE id = ?
          `
        )
        .bind(id)
        .first();


    if (
      publication?.user_id
    ) {
      await updateParticipantFromPublication(
        env,
        publication.user_id,
        body
      );
    }


    await writeAuditLog(
      env,
      "publication_updated",
      id,
      body
    );


    return json(
      {
        ok: true,
        id,
        message:
          "Публикация полностью обновлена."
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATION_UPDATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   DELETE PUBLICATION
============================================================ */

async function handleAdminPublicationDelete(
  request,
  env,
  id
) {
  try {
    await env.DB
      .prepare(
        `
        DELETE FROM publication_media
        WHERE publication_id = ?
        `
      )
      .bind(id)
      .run();
  } catch {}


  try {
    await env.DB
      .prepare(
        `
        DELETE FROM publications
        WHERE id = ?
        `
      )
      .bind(id)
      .run();


    await writeAuditLog(
      env,
      "publication_deleted",
      id,
      {}
    );


    return json(
      {
        ok: true,
        id,
        message:
          "Публикация удалена."
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PUBLICATION_DELETE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PARTICIPANTS
============================================================ */

async function handleAdminParticipants(
  request,
  env,
  ctx
) {
  const url =
    new URL(request.url);

  const path =
    normalizePath(
      url.pathname
    );


  if (
    path ===
    "/api/admin/participants" ||
    path ===
    "/api/admin/users"
  ) {
    if (
      request.method === "GET"
    ) {
      return handleParticipantsList(
        request,
        env
      );
    }


    if (
      request.method === "POST"
    ) {
      return handleParticipantCreate(
        request,
        env
      );
    }


    return methodNotAllowed(
      request
    );
  }


  const match =
    path.match(
      /^\/api\/admin\/(?:participants|users)\/([^/]+)(?:\/([^/]+))?$/
    );


  if (!match) {
    return json(
      {
        ok: false,
        error:
          "INVALID_PARTICIPANT_ROUTE"
      },
      400,
      request
    );
  }


  const id =
    decodeURIComponent(
      match[1]
    );

  const action =
    match[2]
      ? decodeURIComponent(
          match[2]
        )
      : null;


  if (
    action === "ban" ||
    action === "unban"
  ) {
    return handleParticipantBan(
      request,
      env,
      id,
      action
    );
  }


  if (
    action === "delete"
  ) {
    return handleParticipantDelete(
      request,
      env,
      id
    );
  }


  if (
    action === "publications"
  ) {
    return handleParticipantPublications(
      request,
      env,
      id
    );
  }


  if (
    request.method === "GET"
  ) {
    return handleParticipantById(
      request,
      env,
      id
    );
  }


  if (
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    return handleParticipantUpdate(
      request,
      env,
      id
    );
  }


  return methodNotAllowed(
    request
  );
}


/* ============================================================
   PARTICIPANTS LIST
============================================================ */

async function handleParticipantsList(
  request,
  env
) {
  try {
    await ensureParticipantsTable(
      env
    );


    const url =
      new URL(request.url);

    const search =
      url.searchParams.get(
        "search"
      ) ||
      url.searchParams.get(
        "q"
      );


    const status =
      url.searchParams.get(
        "status"
      );


    const conditions = [];
    const bindings = [];


    if (search) {
      conditions.push(
        `
        (
          p.name LIKE ?
          OR p.username LIKE ?
          OR p.email LIKE ?
          OR p.phone LIKE ?
          OR p.telegram LIKE ?
          OR p.city LIKE ?
          OR p.country LIKE ?
          OR p.id LIKE ?
        )
        `
      );


      const q =
        `%${search}%`;


      for (
        let i = 0;
        i < 8;
        i++
      ) {
        bindings.push(q);
      }
    }


    if (
      status === "banned"
    ) {
      conditions.push(
        "p.is_banned = 1"
      );
    }


    if (
      status === "active"
    ) {
      conditions.push(
        "p.is_banned = 0"
      );
    }


    const where =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";


    const result =
      await env.DB
        .prepare(
          `
          SELECT
            p.*,

            (
              SELECT COUNT(*)
              FROM publications pub
              WHERE pub.user_id = p.id
            ) AS publications_count,

            (
              SELECT COUNT(*)
              FROM publications pub
              WHERE
                pub.user_id = p.id
                AND pub.status = 'pending'
            ) AS pending_count,

            (
              SELECT MAX(pub.created_at)
              FROM publications pub
              WHERE pub.user_id = p.id
            ) AS last_publication_at

          FROM participants p

          ${where}

          ORDER BY
            p.updated_at DESC

          LIMIT 500
          `
        )
        .bind(...bindings)
        .all();


    return json(
      {
        ok: true,
        participants:
          result.results || [],
        users:
          result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANTS_QUERY_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PARTICIPANT BY ID
============================================================ */

async function handleParticipantById(
  request,
  env,
  id
) {
  try {
    const participant =
      await getParticipant(
        env,
        id
      );


    if (!participant) {
      return json(
        {
          ok: false,
          error:
            "PARTICIPANT_NOT_FOUND"
        },
        404,
        request
      );
    }


    const publications =
      await env.DB
        .prepare(
          `
          SELECT *
          FROM publications
          WHERE user_id = ?
          ORDER BY created_at DESC
          `
        )
        .bind(id)
        .all();


    return json(
      {
        ok: true,

        participant,

        publications:
          publications.results ||
          []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANT_QUERY_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   CREATE PARTICIPANT
============================================================ */

async function handleParticipantCreate(
  request,
  env
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }


  try {
    const participant =
      await upsertParticipant(
        env,
        {
          id:
            cleanString(
              body.id
            ) ||
            crypto.randomUUID(),

          name:
            cleanString(
              body.name
            ) ||
            "Пользователь",

          username:
            cleanString(
              body.username
            ),

          email:
            cleanString(
              body.email
            ),

          phone:
            cleanString(
              body.phone
            ),

          telegram:
            cleanString(
              body.telegram
            ),

          city:
            cleanString(
              body.city
            ),

          country:
            cleanString(
              body.country
            )
        }
      );


    await writeAuditLog(
      env,
      "participant_created",
      participant.id,
      participant
    );


    return json(
      {
        ok: true,
        participant
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANT_CREATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   UPDATE PARTICIPANT
   ADMIN CAN CHANGE ALL DATA
============================================================ */

async function handleParticipantUpdate(
  request,
  env,
  id
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "INVALID_JSON"
      },
      400,
      request
    );
  }


  const allowed = [
    "name",
    "username",
    "email",
    "phone",
    "telegram",
    "city",
    "country",
    "is_banned",
    "is_active",
    "notes"
  ];


  const updates = [];
  const values = [];


  for (
    const field
    of allowed
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        body,
        field
      )
    ) {
      updates.push(
        `${field} = ?`
      );


      if (
        field === "is_banned" ||
        field === "is_active"
      ) {
        values.push(
          body[field]
            ? 1
            : 0
        );
      } else {
        values.push(
          cleanString(
            body[field]
          )
        );
      }
    }
  }


  if (!updates.length) {
    return json(
      {
        ok: false,
        error:
          "NOTHING_TO_UPDATE"
      },
      400,
      request
    );
  }


  updates.push(
    "updated_at = ?"
  );

  values.push(
    new Date().toISOString()
  );

  values.push(id);


  try {
    await env.DB
      .prepare(
        `
        UPDATE participants
        SET
          ${updates.join(", ")}
        WHERE id = ?
        `
      )
      .bind(...values)
      .run();


    await writeAuditLog(
      env,
      "participant_updated",
      id,
      body
    );


    const participant =
      await getParticipant(
        env,
        id
      );


    return json(
      {
        ok: true,
        participant
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANT_UPDATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PARTICIPANT BAN
============================================================ */

async function handleParticipantBan(
  request,
  env,
  id,
  action
) {
  const banned =
    action === "ban"
      ? 1
      : 0;


  try {
    await env.DB
      .prepare(
        `
        UPDATE participants
        SET
          is_banned = ?,
          updated_at = ?
        WHERE id = ?
        `
      )
      .bind(
        banned,
        new Date().toISOString(),
        id
      )
      .run();


    await writeAuditLog(
      env,
      `participant_${action}`,
      id,
      {
        is_banned: banned
      }
    );


    return json(
      {
        ok: true,
        id,
        is_banned:
          Boolean(banned)
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANT_BAN_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PARTICIPANT DELETE
============================================================ */

async function handleParticipantDelete(
  request,
  env,
  id
) {
  try {
    /*
      Remove participant publications
      first so no orphan records remain.
    */

    await env.DB
      .prepare(
        `
        DELETE FROM publication_media

        WHERE publication_id IN (
          SELECT id
          FROM publications
          WHERE user_id = ?
        )
        `
      )
      .bind(id)
      .run();


    await env.DB
      .prepare(
        `
        DELETE FROM publications
        WHERE user_id = ?
        `
      )
      .bind(id)
      .run();


    await env.DB
      .prepare(
        `
        DELETE FROM participants
        WHERE id = ?
        `
      )
      .bind(id)
      .run();


    await writeAuditLog(
      env,
      "participant_deleted",
      id,
      {}
    );


    return json(
      {
        ok: true,
        id,
        message:
          "Участник и связанные данные удалены."
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANT_DELETE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PARTICIPANT PUBLICATIONS
============================================================ */

async function handleParticipantPublications(
  request,
  env,
  id
) {
  try {
    const result =
      await env.DB
        .prepare(
          `
          SELECT *
          FROM publications
          WHERE user_id = ?
          ORDER BY created_at DESC
          `
        )
        .bind(id)
        .all();


    return json(
      {
        ok: true,
        participant_id: id,
        publications:
          result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "PARTICIPANT_PUBLICATIONS_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   PARTICIPANTS TABLE
============================================================ */

async function ensureParticipantsTable(
  env
) {
  await env.DB
    .prepare(
      `
      CREATE TABLE IF NOT EXISTS participants (

        id TEXT PRIMARY KEY,

        name TEXT,

        username TEXT,

        email TEXT,

        phone TEXT,

        telegram TEXT,

        city TEXT,

        country TEXT,

        is_banned INTEGER DEFAULT 0,

        is_active INTEGER DEFAULT 1,

        notes TEXT,

        created_at TEXT,

        updated_at TEXT

      )
      `
    )
    .run();


  /*
    Create useful indexes.
  */

  try {
    await env.DB
      .prepare(
        `
        CREATE INDEX IF NOT EXISTS
        idx_participants_name

        ON participants(name)
        `
      )
      .run();
  } catch {}


  try {
    await env.DB
      .prepare(
        `
        CREATE INDEX IF NOT EXISTS
        idx_participants_email

        ON participants(email)
        `
      )
      .run();
  } catch {}
}


/* ============================================================
   UPSERT PARTICIPANT
============================================================ */

async function upsertParticipant(
  env,
  data
) {
  await ensureParticipantsTable(
    env
  );


  const now =
    new Date().toISOString();


  const existing =
    await getParticipant(
      env,
      data.id
    );


  if (existing) {
    const fields = [
      ["name", data.name],
      ["username", data.username],
      ["email", data.email],
      ["phone", data.phone],
      ["telegram", data.telegram],
      ["city", data.city],
      ["country", data.country]
    ];


    const updates = [];
    const values = [];


    for (
      const [field, value]
      of fields
    ) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        updates.push(
          `${field} = ?`
        );

        values.push(
          value
        );
      }
    }


    if (updates.length) {
      updates.push(
        "updated_at = ?"
      );

      values.push(
        now
      );

      values.push(
        data.id
      );


      await env.DB
        .prepare(
          `
          UPDATE participants

          SET
            ${updates.join(", ")}

          WHERE id = ?
          `
        )
        .bind(...values)
        .run();
    }


    return getParticipant(
      env,
      data.id
    );
  }


  await env.DB
    .prepare(
      `
      INSERT INTO participants
      (
        id,
        name,
        username,
        email,
        phone,
        telegram,
        city,
        country,
        is_banned,
        is_active,
        notes,
        created_at,
        updated_at
      )

      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .bind(
      data.id,
      data.name || "Пользователь",
      data.username || null,
      data.email || null,
      data.phone || null,
      data.telegram || null,
      data.city || null,
      data.country || null,
      0,
      1,
      null,
      now,
      now
    )
    .run();


  return getParticipant(
    env,
    data.id
  );
}


/* ============================================================
   GET PARTICIPANT
============================================================ */

async function getParticipant(
  env,
  id
) {
  if (!id) {
    return null;
  }


  try {
    await ensureParticipantsTable(
      env
    );


    return await env.DB
      .prepare(
        `
        SELECT *
        FROM participants
        WHERE id = ?
        LIMIT 1
        `
      )
      .bind(id)
      .first();
  } catch {
    return null;
  }
}


/* ============================================================
   UPDATE PARTICIPANT FROM PUBLICATION
============================================================ */

async function updateParticipantFromPublication(
  env,
  id,
  body
) {
  const fields = {
    name:
      body.contact_name ||
      body.name ||
      body.user_name,

    email:
      body.contact_email ||
      body.email,

    phone:
      body.contact_phone ||
      body.phone,

    telegram:
      body.contact_telegram ||
      body.telegram,

    city:
      body.city,

    country:
      body.country
  };


  const updates = [];
  const values = [];


  for (
    const [field, value]
    of Object.entries(fields)
  ) {
    if (
      value !== undefined &&
      value !== null
    ) {
      updates.push(
        `${field} = ?`
      );

      values.push(
        cleanString(value)
      );
    }
  }


  if (!updates.length) {
    return;
  }


  updates.push(
    "updated_at = ?"
  );

  values.push(
    new Date().toISOString()
  );

  values.push(id);


  try {
    await env.DB
      .prepare(
        `
        UPDATE participants

        SET
          ${updates.join(", ")}

        WHERE id = ?
        `
      )
      .bind(...values)
      .run();
  } catch {}
}


/* ============================================================
   CHAT
============================================================ */

async function handlePublicChat(
  request,
  env,
  ctx
) {
  await ensureAdminChatTable(
    env
  );


  const url =
    new URL(request.url);

  const path =
    normalizePath(
      url.pathname
    );


  if (
    path ===
    "/api/admin-chat"
  ) {
    if (
      request.method === "GET"
    ) {
      return handleChatList(
        request,
        env,
        false
      );
    }


    if (
      request.method === "POST"
    ) {
      return handleChatSend(
        request,
        env,
        "user"
      );
    }
  }


  const match =
    path.match(
      /^\/api\/admin-chat\/([^/]+)$/
    );


  if (match) {
    const id =
      decodeURIComponent(
        match[1]
      );


    if (
      request.method === "GET"
    ) {
      return handleChatConversation(
        request,
        env,
        id
      );
    }


    if (
      request.method === "PATCH" ||
      request.method === "PUT"
    ) {
      return handleChatUpdate(
        request,
        env,
        id
      );
    }
  }


  return json(
    {
      ok: false,
      error:
        "CHAT_ROUTE_NOT_FOUND"
    },
    404,
    request
  );
}


/* ============================================================
   ADMIN CHAT
============================================================ */

async function handleAdminChat(
  request,
  env,
  ctx
) {
  await ensureAdminChatTable(
    env
  );


  const url =
    new URL(request.url);

  const path =
    normalizePath(
      url.pathname
    );


  if (
    path ===
    "/api/admin/chat"
  ) {
    if (
      request.method === "GET"
    ) {
      return handleChatList(
        request,
        env,
        true
      );
    }


    if (
      request.method === "POST"
    ) {
      return handleChatSend(
        request,
        env,
        "admin"
      );
    }
  }


  const match =
    path.match(
      /^\/api\/admin\/chat\/([^/]+)$/
    );


  if (match) {
    const id =
      decodeURIComponent(
        match[1]
      );


    if (
      request.method === "GET"
    ) {
      return handleChatConversation(
        request,
        env,
        id
      );
    }


    if (
      request.method === "PATCH" ||
      request.method === "PUT"
    ) {
      return handleChatUpdate(
        request,
        env,
        id
      );
    }
  }


  return json(
    {
      ok: false,
      error:
        "ADMIN_CHAT_ROUTE_NOT_FOUND"
    },
    404,
    request
  );
}


/* ============================================================
   CHAT LIST
============================================================ */

async function handleChatList(
  request,
  env,
  adminView
) {
  try {
    const result =
      await env.DB
        .prepare(
          `
          SELECT *

          FROM admin_chat

          ORDER BY
            created_at DESC

          LIMIT 1000
          `
        )
        .all();


    const messages =
      result.results || [];


    return json(
      {
        ok: true,

        messages,

        conversations:
          groupChatConversations(
            messages
          ),

        unread:
          messages.filter(
            message =>
              message.sender_type ===
                "user" &&
              (
                !message.read_at
              )
          ).length,

        admin_view:
          Boolean(
            adminView
          )
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "CHAT_LIST_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   CHAT SEND
============================================================ */

async function handleChatSend(
  request,
  env,
  senderType
) {
  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error:
          "INVALID_JSON"
      },
      400,
      request
    );
  }


  const message =
    cleanString(
      body.message ||
      body.text ||
      body.content
    );


  if (!message) {
    return json(
      {
        ok: false,
        error:
          "MESSAGE_REQUIRED"
      },
      400,
      request
    );
  }


  const id =
    crypto.randomUUID();


  const now =
    new Date().toISOString();


  const conversationId =
    cleanString(
      body.conversation_id
    ) ||
    cleanString(
      body.user_id
    ) ||
    crypto.randomUUID();


  let senderName;


  if (
    senderType ===
    "admin"
  ) {
    senderName =
      ADMIN.name;
  } else {
    senderName =
      cleanString(
        body.name ||
        body.sender_name
      ) ||
      "Пользователь";
  }


  try {
    await env.DB
      .prepare(
        `
        INSERT INTO admin_chat
        (
          id,
          conversation_id,
          sender_type,
          sender_name,
          user_id,
          message,
          created_at,
          read_at
        )

        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(
        id,
        conversationId,
        senderType,
        senderName,
        cleanString(
          body.user_id
        ),
        message,
        now,
        senderType === "admin"
          ? now
          : null
      )
      .run();


    return json(
      {
        ok: true,
        id,
        conversation_id:
          conversationId,
        sender_type:
          senderType
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "CHAT_SEND_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   CHAT CONVERSATION
============================================================ */

async function handleChatConversation(
  request,
  env,
  conversationId
) {
  try {
    const result =
      await env.DB
        .prepare(
          `
          SELECT *

          FROM admin_chat

          WHERE conversation_id = ?

          ORDER BY
            created_at ASC
          `
        )
        .bind(
          conversationId
        )
        .all();


    return json(
      {
        ok: true,

        conversation_id:
          conversationId,

        messages:
          result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "CHAT_CONVERSATION_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   CHAT UPDATE
============================================================ */

async function handleChatUpdate(
  request,
  env,
  id
) {
  let body = {};

  try {
    body =
      await request.json();
  } catch {}


  try {
    if (
      body.read === true ||
      body.read_at
    ) {
      await env.DB
        .prepare(
          `
          UPDATE admin_chat

          SET
            read_at = ?

          WHERE id = ?
          `
        )
        .bind(
          body.read_at ||
            new Date().toISOString(),
          id
        )
        .run();
    }


    return json(
      {
        ok: true,
        id
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "CHAT_UPDATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   CHAT GROUPING
============================================================ */

function groupChatConversations(
  messages
) {
  const map =
    new Map();


  for (
    const message
    of messages
  ) {
    const id =
      message.conversation_id ||
      message.user_id ||
      message.id;


    if (!map.has(id)) {
      map.set(
        id,
        {
          conversation_id:
            id,

          user_id:
            message.user_id ||
            null,

          participant_name:
            message.sender_type ===
              "user"
              ? message.sender_name
              : null,

          last_message:
            message.message,

          last_message_at:
            message.created_at,

          unread: 0,

          messages: []
        }
      );
    }


    const conversation =
      map.get(id);


    conversation.messages.push(
      message
    );


    conversation.last_message =
      message.message;


    conversation.last_message_at =
      message.created_at;


    if (
      message.sender_type ===
        "user" &&
      !message.read_at
    ) {
      conversation.unread++;
    }


    if (
      message.sender_type ===
        "user"
    ) {
      conversation.participant_name =
        message.sender_name;
    }
  }


  return Array.from(
    map.values()
  ).sort(
    (a, b) =>
      String(
        b.last_message_at || ""
      ).localeCompare(
        String(
          a.last_message_at || ""
        )
      )
  );
}


/* ============================================================
   CHAT TABLE
============================================================ */

async function ensureAdminChatTable(
  env
) {
  await env.DB
    .prepare(
      `
      CREATE TABLE IF NOT EXISTS admin_chat
      (
        id TEXT PRIMARY KEY,

        conversation_id TEXT,

        sender_type TEXT,

        sender_name TEXT,

        user_id TEXT,

        message TEXT,

        created_at TEXT,

        read_at TEXT
      )
      `
    )
    .run();


  try {
    await env.DB
      .prepare(
        `
        CREATE INDEX IF NOT EXISTS
        idx_admin_chat_conversation

        ON admin_chat(
          conversation_id
        )
        `
      )
      .run();
  } catch {}


  try {
    await env.DB
      .prepare(
        `
        CREATE INDEX IF NOT EXISTS
        idx_admin_chat_created

        ON admin_chat(
          created_at
        )
        `
      )
      .run();
  } catch {}
}


/* ============================================================
   NOTIFICATIONS
============================================================ */

async function handleNotifications(
  request,
  env
) {
  if (
    request.method !== "GET"
  ) {
    return methodNotAllowed(
      request
    );
  }


  try {
    await ensureNotificationsTable(
      env
    );


    const url =
      new URL(request.url);


    const userId =
      url.searchParams.get(
        "user_id"
      );


    let result;


    if (userId) {
      result =
        await env.DB
          .prepare(
            `
            SELECT *

            FROM notifications

            WHERE
              user_id = ?
              OR user_id IS NULL

            ORDER BY
              created_at DESC

            LIMIT 200
            `
          )
          .bind(
            userId
          )
          .all();
    } else {
      result =
        await env.DB
          .prepare(
            `
            SELECT *

            FROM notifications

            ORDER BY
              created_at DESC

            LIMIT 200
            `
          )
          .all();
    }


    return json(
      {
        ok: true,

        notifications:
          result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "NOTIFICATIONS_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   ADMIN NOTIFICATIONS
============================================================ */

async function handleAdminNotifications(
  request,
  env
) {
  await ensureNotificationsTable(
    env
  );


  const url =
    new URL(request.url);

  const path =
    normalizePath(
      url.pathname
    );


  if (
    path ===
    "/api/admin/notifications"
  ) {
    if (
      request.method === "GET"
    ) {
      return handleNotifications(
        request,
        env
      );
    }


    if (
      request.method === "POST"
    ) {
      return createNotification(
        request,
        env
      );
    }


    return methodNotAllowed(
      request
    );
  }


  const match =
    path.match(
      /^\/api\/admin\/notifications\/([^/]+)$/
    );


  if (
    match &&
    (
      request.method ===
        "PATCH" ||
      request.method ===
        "PUT"
    )
  ) {
    return markNotificationRead(
      request,
      env,
      decodeURIComponent(
        match[1]
      )
    );
  }


  return json(
    {
      ok: false,
      error:
        "NOTIFICATION_ROUTE_NOT_FOUND"
    },
    404,
    request
  );
}


/* ============================================================
   CREATE NOTIFICATION
============================================================ */

async function createNotification(
  request,
  env
) {
  let body;


  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error:
          "INVALID_JSON"
      },
      400,
      request
    );
  }


  const id =
    crypto.randomUUID();


  const now =
    new Date().toISOString();


  try {
    await env.DB
      .prepare(
        `
        INSERT INTO notifications
        (
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          created_at
        )

        VALUES
        (?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(
        id,
        cleanString(
          body.user_id
        ),
        cleanString(
          body.title
        ),
        cleanString(
          body.message
        ),
        cleanString(
          body.type
        ) || "system",
        0,
        now
      )
      .run();


    await writeAuditLog(
      env,
      "notification_created",
      id,
      body
    );


    return json(
      {
        ok: true,
        id
      },
      201,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "NOTIFICATION_CREATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   MARK NOTIFICATION READ
============================================================ */

async function markNotificationRead(
  request,
  env,
  id
) {
  try {
    await env.DB
      .prepare(
        `
        UPDATE notifications

        SET
          is_read = 1

        WHERE id = ?
        `
      )
      .bind(id)
      .run();


    return json(
      {
        ok: true,
        id,
        is_read: 1
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "NOTIFICATION_UPDATE_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   NOTIFICATIONS TABLE
============================================================ */

async function ensureNotificationsTable(
  env
) {
  await env.DB
    .prepare(
      `
      CREATE TABLE IF NOT EXISTS notifications
      (
        id TEXT PRIMARY KEY,

        user_id TEXT,

        title TEXT,

        message TEXT,

        type TEXT,

        is_read INTEGER DEFAULT 0,

        created_at TEXT
      )
      `
    )
    .run();


  try {
    await env.DB
      .prepare(
        `
        CREATE INDEX IF NOT EXISTS
        idx_notifications_user

        ON notifications(
          user_id
        )
        `
      )
      .run();
  } catch {}
}


/* ============================================================
   AUDIT LOG
============================================================ */

async function handleAdminAudit(
  request,
  env
) {
  try {
    await ensureAuditTable(
      env
    );


    const url =
      new URL(request.url);


    const limit =
      Math.min(
        1000,
        Math.max(
          1,
          Number(
            url.searchParams.get(
              "limit"
            ) || 200
          )
        )
      );


    const result =
      await env.DB
        .prepare(
          `
          SELECT *

          FROM audit_log

          ORDER BY
            created_at DESC

          LIMIT ?
          `
        )
        .bind(limit)
        .all();


    return json(
      {
        ok: true,
        logs:
          result.results || []
      },
      200,
      request
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          "AUDIT_FAILED",
        message:
          error.message
      },
      500,
      request
    );
  }
}


/* ============================================================
   AUDIT TABLE
============================================================ */

async function ensureAuditTable(
  env
) {
  await env.DB
    .prepare(
      `
      CREATE TABLE IF NOT EXISTS audit_log
      (
        id TEXT PRIMARY KEY,

        action TEXT,

        target_id TEXT,

        data TEXT,

        created_at TEXT
      )
      `
    )
    .run();


  try {
    await env.DB
      .prepare(
        `
        CREATE INDEX IF NOT EXISTS
        idx_audit_created

        ON audit_log(
          created_at
        )
        `
      )
      .run();
  } catch {}
}


/* ============================================================
   WRITE AUDIT
============================================================ */

async function writeAuditLog(
  env,
  action,
  targetId,
  data
) {
  if (!env.DB) {
    return;
  }


  try {
    await ensureAuditTable(
      env
    );


    await env.DB
      .prepare(
        `
        INSERT INTO audit_log
        (
          id,
          action,
          target_id,
          data,
          created_at
        )

        VALUES
        (?, ?, ?, ?, ?)
        `
      )
      .bind(
        crypto.randomUUID(),
        action,
        targetId || null,
        JSON.stringify(
          data || {}
        ),
        new Date().toISOString()
      )
      .run();
  } catch (error) {
    console.error(
      "AUDIT_WRITE_ERROR",
      error
    );
  }
}


/* ============================================================
   LEGACY OPPORTUNITIES
============================================================ */

async function handleLegacyOpportunities(
  request,
  env
) {
  if (
    request.method === "GET"
  ) {
    return handlePublicationsList(
      request,
      env
    );
  }


  if (
    request.method === "POST"
  ) {
    return handleCreatePublication(
      request,
      env
    );
  }


  return methodNotAllowed(
    request
  );
}


/* ============================================================
   LEGACY MESSAGES
============================================================ */

async function handleLegacyMessages(
  request,
  env
) {
  if (
    request.method === "GET"
  ) {
    return handleChatList(
      request,
      env,
      false
    );
  }


  if (
    request.method === "POST"
  ) {
    return handleChatSend(
      request,
      env,
      "user"
    );
  }


  return methodNotAllowed(
    request
  );
}


/* ============================================================
   TRACKING CODE
============================================================ */

function createTrackingCode() {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase();


  const random =
    crypto
      .randomUUID()
      .replace(
        /-/g,
        ""
      )
      .slice(
        0,
        10
      )
      .toUpperCase();


  return `TO-${timestamp}-${random}`;
}


/* ============================================================
   STRING CLEANER
============================================================ */

function cleanString(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }


  if (
    typeof value === "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return null;
    }
  }


  return String(value)
    .trim();
}


/* ============================================================
   PATH
============================================================ */

function normalizePath(
  path
) {
  if (!path) {
    return "/";
  }


  let result =
    path.replace(
      /\/+/g,
      "/"
    );


  if (
    result.length > 1 &&
    result.endsWith("/")
  ) {
    result =
      result.slice(
        0,
        -1
      );
  }


  return result;
}


/* ============================================================
   METHOD
============================================================ */

function methodNotAllowed(
  request
) {
  return json(
    {
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405,
    request
  );
}


/* ============================================================
   JSON
============================================================ */

function json(
  data,
  status = 200,
  request = null
) {
  const headers =
    new Headers();


  headers.set(
    "Content-Type",
    "application/json; charset=utf-8"
  );


  headers.set(
    "Cache-Control",
    "no-store"
  );


  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );


  headers.set(
    "X-Frame-Options",
    "SAMEORIGIN"
  );


  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );


  if (request) {
    applyCors(
      headers,
      request
    );
  }


  return new Response(
    JSON.stringify(
      data
    ),
    {
      status,
      headers
    }
  );
}


/* ============================================================
   CORS
============================================================ */

function corsResponse(
  request
) {
  const headers =
    new Headers();


  applyCors(
    headers,
    request
  );


  headers.set(
    "Access-Control-Allow-Headers",
    [
      "Content-Type",
      "Accept",
      "X-Admin-Key",
      "X-Admin-ID",
      "X-Admin-Username"
    ].join(", ")
  );


  headers.set(
    "Access-Control-Allow-Methods",
    ALLOWED_METHODS.join(
      ", "
    )
  );


  return new Response(
    null,
    {
      status: 204,
      headers
    }
  );
}


/* ============================================================
   APPLY CORS
============================================================ */

function applyCors(
  headers,
  request
) {
  const origin =
    request.headers.get(
      "Origin"
    );


  if (origin) {
    headers.set(
      "Access-Control-Allow-Origin",
      origin
    );

    headers.set(
      "Vary",
      "Origin"
    );
  } else {
    headers.set(
      "Access-Control-Allow-Origin",
      "https://tajik-opportunities.com"
    );
  }
}


/* ============================================================
   SECURITY
============================================================ */

function withSecurity(
  response,
  request
) {
  const headers =
    new Headers(
      response.headers
    );


  headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );


  headers.set(
    "X-Frame-Options",
    "SAMEORIGIN"
  );


  headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );


  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );


  headers.set(
    "Cross-Origin-Resource-Policy",
    "same-origin"
  );


  applyCors(
    headers,
    request
  );


  return new Response(
    response.body,
    {
      status:
        response.status,

      statusText:
        response.statusText,

      headers
    }
  );
  }
