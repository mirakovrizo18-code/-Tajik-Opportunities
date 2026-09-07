/* =========================================================
   TAJIK OPPORTUNITIES
   CLOUDFLARE WORKER
   PUBLIC PLATFORM + ADMIN CONTROL
   ========================================================= */

const SITE_NAME = "Tajik Opportunities";
const OFFICIAL_USERNAME = "@tajikopportunities";
const ADMIN_USERNAME = "admin";

const CATEGORIES = [
  "Новости",
  "Образование",
  "Работа",
  "Возможности",
  "Объявления",
  "Услуги",
  "Идеи и проекты",
  "Стартапы и проекты",
  "Мероприятия",
  "Конкурсы",
  "Гранты",
  "Полезное",
  "Волонтёрство",
  "Товары и предложения",
  "Специалисты",
  "Другое"
];

const REACTIONS = [
  "like",
  "love",
  "support",
  "funny",
  "wow",
  "sad",
  "angry"
];

const MEDIA_TYPES = [
  "image",
  "gallery",
  "video",
  "music",
  "audio",
  "link",
  "document",
  "other"
];

let dbReady = false;
let dbPromise = null;

/* =========================================================
   MAIN
   ========================================================= */

export default {
  async fetch(request, env, ctx) {
    try {
      await ensureDatabase(env);

      const url = new URL(request.url);
      const path = normalizePath(url.pathname);

      if (request.method === "OPTIONS") {
        return new Response("", {
          status: 204,
          headers: corsHeaders(request)
        });
      }

      if (path === "/health") {
        return json({
          ok: true,
          site: SITE_NAME,
          time: now()
        }, 200, request);
      }

      if (!path.startsWith("/api/")) {
        return env.ASSETS.fetch(request);
      }

      return await router(request, env, path);

    } catch (error) {
      console.error(error);

      return json({
        ok: false,
        error: "SERVER_ERROR",
        message: error?.message || "Server error"
      }, 500, request);
    }
  }
};

/* =========================================================
   ROUTER
   ========================================================= */

async function router(request, env, path) {

  /* =======================================================
     PUBLIC
     ======================================================= */

  if (
    path === "/api/publications" &&
    request.method === "GET"
  ) {
    return getPublications(request, env);
  }

  if (
    path === "/api/publications" &&
    request.method === "POST"
  ) {
    return createPublication(request, env);
  }

  if (
    /^\/api\/publications\/[^/]+$/.test(path) &&
    request.method === "GET"
  ) {
    return getPublicPublication(request, env, path);
  }

  if (
    /^\/api\/publications\/[^/]+\/react$/.test(path) &&
    request.method === "POST"
  ) {
    return reactPublication(request, env, path);
  }

  if (
    /^\/api\/publications\/[^/]+\/save$/.test(path) &&
    request.method === "POST"
  ) {
    return savePublication(request, env, path);
  }

  if (
    /^\/api\/publications\/[^/]+\/share$/.test(path) &&
    request.method === "POST"
  ) {
    return sharePublication(request, env, path);
  }

  if (
    /^\/api\/publications\/[^/]+\/comments$/.test(path) &&
    request.method === "GET"
  ) {
    return getComments(request, env, path);
  }

  if (
    /^\/api\/publications\/[^/]+\/comments$/.test(path) &&
    request.method === "POST"
  ) {
    return createComment(request, env, path);
  }

  if (
    path === "/api/reports" &&
    request.method === "POST"
  ) {
    return createReport(request, env);
  }

  /* =======================================================
     GUEST / PARTICIPANT
     НЕТ РЕГИСТРАЦИИ
     НЕТ ВХОДА
     ======================================================= */

  if (
    path === "/api/me" &&
    request.method === "GET"
  ) {
    return getAnonymousParticipant(request, env);
  }

  if (
    path === "/api/me" &&
    request.method === "PUT"
  ) {
    return updateAnonymousParticipant(request, env);
  }

  if (
    path === "/api/my-publications" &&
    request.method === "GET"
  ) {
    return myPublications(request, env);
  }

  if (
    path === "/api/my-chat" &&
    request.method === "GET"
  ) {
    return participantChat(request, env);
  }

  if (
    path === "/api/my-chat" &&
    request.method === "POST"
  ) {
    return participantSendChat(request, env);
  }

  if (
    path === "/api/my-notifications" &&
    request.method === "GET"
  ) {
    return participantNotifications(request, env);
  }

  /* =======================================================
     ADMIN AUTH
     ======================================================= */

  if (
    path === "/api/admin/login" &&
    request.method === "POST"
  ) {
    return adminLogin(request, env);
  }

  if (
    path === "/api/admin/logout" &&
    request.method === "POST"
  ) {
    return adminLogout(request, env);
  }

  if (
    path === "/api/admin/me" &&
    request.method === "GET"
  ) {
    return adminMe(request, env);
  }

  /* =======================================================
     ADMIN DASHBOARD
     ======================================================= */

  if (
    path === "/api/admin/dashboard" &&
    request.method === "GET"
  ) {
    return adminDashboard(request, env);
  }

  if (
    path === "/api/admin/stats" &&
    request.method === "GET"
  ) {
    return adminStats(request, env);
  }

  if (
    path === "/api/admin/notifications" &&
    request.method === "GET"
  ) {
    return adminNotifications(request, env);
  }

  if (
    path === "/api/admin/audit" &&
    request.method === "GET"
  ) {
    return adminAudit(request, env);
  }

  /* =======================================================
     ADMIN PUBLICATIONS
     ======================================================= */

  if (
    path === "/api/admin/publications" &&
    request.method === "GET"
  ) {
    return adminPublications(request, env);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+$/.test(path) &&
    request.method === "GET"
  ) {
    return adminPublication(request, env, path);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+$/.test(path) &&
    request.method === "PUT"
  ) {
    return adminUpdatePublication(request, env, path);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+$/.test(path) &&
    request.method === "DELETE"
  ) {
    return adminDeletePublication(request, env, path);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+\/action$/.test(path) &&
    request.method === "POST"
  ) {
    return adminPublicationAction(request, env, path);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+\/counters$/.test(path) &&
    request.method === "PUT"
  ) {
    return adminCounters(request, env, path);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+\/media$/.test(path) &&
    request.method === "POST"
  ) {
    return adminAddMedia(request, env, path);
  }

  if (
    /^\/api\/admin\/publications\/[^/]+\/media\/[^/]+$/.test(path) &&
    request.method === "DELETE"
  ) {
    return adminDeleteMedia(request, env, path);
  }

  /* =======================================================
     ADMIN PARTICIPANTS
     ======================================================= */

  if (
    path === "/api/admin/participants" &&
    request.method === "GET"
  ) {
    return adminParticipants(request, env);
  }

  if (
    /^\/api\/admin\/participants\/[^/]+$/.test(path) &&
    request.method === "GET"
  ) {
    return adminParticipant(request, env, path);
  }

  if (
    /^\/api\/admin\/participants\/[^/]+$/.test(path) &&
    request.method === "PUT"
  ) {
    return adminUpdateParticipant(request, env, path);
  }

  if (
    /^\/api\/admin\/participants\/[^/]+$/.test(path) &&
    request.method === "DELETE"
  ) {
    return adminDeleteParticipant(request, env, path);
  }

  if (
    /^\/api\/admin\/participants\/[^/]+\/status$/.test(path) &&
    request.method === "POST"
  ) {
    return adminParticipantStatus(request, env, path);
  }

  if (
    /^\/api\/admin\/participants\/[^/]+\/counters$/.test(path) &&
    request.method === "PUT"
  ) {
    return adminParticipantCounters(request, env, path);
  }

  /* =======================================================
     ADMIN CHATS
     ======================================================= */

  if (
    path === "/api/admin/chats" &&
    request.method === "GET"
  ) {
    return adminChats(request, env);
  }

  if (
    /^\/api\/admin\/chats\/[^/]+$/.test(path) &&
    request.method === "GET"
  ) {
    return adminChatMessages(request, env, path);
  }

  if (
    /^\/api\/admin\/chats\/[^/]+$/.test(path) &&
    request.method === "POST"
  ) {
    return adminSendChat(request, env, path);
  }

  if (
    /^\/api\/admin\/chats\/[^/]+\/read$/.test(path) &&
    request.method === "POST"
  ) {
    return adminMarkChatRead(request, env, path);
  }

  /* =======================================================
     ADMIN COMMENTS
     ======================================================= */

  if (
    path === "/api/admin/comments" &&
    request.method === "GET"
  ) {
    return adminComments(request, env);
  }

  if (
    /^\/api\/admin\/comments\/[^/]+$/.test(path) &&
    request.method === "PUT"
  ) {
    return adminUpdateComment(request, env, path);
  }

  if (
    /^\/api\/admin\/comments\/[^/]+$/.test(path) &&
    request.method === "DELETE"
  ) {
    return adminDeleteComment(request, env, path);
  }

  /* =======================================================
     ADMIN REPORTS
     ======================================================= */

  if (
    path === "/api/admin/reports" &&
    request.method === "GET"
  ) {
    return adminReports(request, env);
  }

  if (
    /^\/api\/admin\/reports\/[^/]+$/.test(path) &&
    request.method === "PUT"
  ) {
    return adminUpdateReport(request, env, path);
  }

  /* =======================================================
     ADMIN SETTINGS
     ======================================================= */

  if (
    path === "/api/admin/settings" &&
    request.method === "GET"
  ) {
    return adminSettings(request, env);
  }

  if (
    path === "/api/admin/settings" &&
    request.method === "PUT"
  ) {
    return adminUpdateSettings(request, env);
  }

  /* =======================================================
     ADMIN SYSTEM
     ======================================================= */

  if (
    path === "/api/admin/system" &&
    request.method === "GET"
  ) {
    return adminSystem(request, env);
  }

  return json({
    ok: false,
    error: "API_ROUTE_NOT_FOUND"
  }, 404, request);
}

/* =========================================================
   DATABASE
   ========================================================= */

async function ensureDatabase(env) {
  if (dbReady) return;

  if (dbPromise) {
    await dbPromise;
    return;
  }

  dbPromise = (async () => {

    await env.DB.batch([

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,

          email TEXT,
          phone TEXT,

          avatar_url TEXT,
          bio TEXT,

          country TEXT,
          city TEXT,

          profession TEXT,
          education TEXT,
          languages TEXT,
          skills TEXT,

          website TEXT,
          social_links TEXT,

          role TEXT DEFAULT 'participant',
          status TEXT DEFAULT 'active',

          verified INTEGER DEFAULT 0,
          profile_visible INTEGER DEFAULT 1,

          followers_count INTEGER DEFAULT 0,
          following_count INTEGER DEFAULT 0,
          publications_count INTEGER DEFAULT 0,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS publications (
          id TEXT PRIMARY KEY,

          participant_id TEXT,
          tracking_code TEXT UNIQUE,

          title TEXT NOT NULL,
          text TEXT NOT NULL,

          category TEXT,

          country TEXT,
          city TEXT,
          location TEXT,
          scope TEXT,

          event_start TEXT,
          event_end TEXT,
          deadline TEXT,

          price REAL DEFAULT 0,
          currency TEXT,

          salary REAL DEFAULT 0,

          employment_type TEXT,
          work_format TEXT,

          experience TEXT,
          education TEXT,
          languages TEXT,

          tags TEXT,
          links TEXT,

          status TEXT DEFAULT 'pending',
          visibility TEXT DEFAULT 'public',

          is_pinned INTEGER DEFAULT 0,
          is_featured INTEGER DEFAULT 0,

          views_count INTEGER DEFAULT 0,

          likes_count INTEGER DEFAULT 0,
          love_count INTEGER DEFAULT 0,
          support_count INTEGER DEFAULT 0,
          funny_count INTEGER DEFAULT 0,
          wow_count INTEGER DEFAULT 0,
          sad_count INTEGER DEFAULT 0,
          angry_count INTEGER DEFAULT 0,

          comments_count INTEGER DEFAULT 0,
          shares_count INTEGER DEFAULT 0,
          saves_count INTEGER DEFAULT 0,
          reports_count INTEGER DEFAULT 0,

          admin_note TEXT,
          rejection_reason TEXT,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,

          published_at TEXT,
          deleted_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS publication_media (
          id TEXT PRIMARY KEY,
          publication_id TEXT NOT NULL,

          type TEXT NOT NULL,
          url TEXT NOT NULL,
          title TEXT,

          sort_order INTEGER DEFAULT 0,

          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS reactions (
          id TEXT PRIMARY KEY,

          publication_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,

          reaction TEXT NOT NULL,

          created_at TEXT NOT NULL,

          UNIQUE(
            publication_id,
            participant_id
          )
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS saves (
          id TEXT PRIMARY KEY,

          publication_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,

          created_at TEXT NOT NULL,

          UNIQUE(
            publication_id,
            participant_id
          )
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,

          publication_id TEXT NOT NULL,
          participant_id TEXT,

          parent_id TEXT,

          text TEXT NOT NULL,

          status TEXT DEFAULT 'published',

          likes_count INTEGER DEFAULT 0,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,

          deleted_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,

          publication_id TEXT,
          comment_id TEXT,

          participant_id TEXT,

          type TEXT,
          reason TEXT,

          status TEXT DEFAULT 'open',

          admin_note TEXT,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,

          participant_id TEXT NOT NULL,

          publication_id TEXT,

          sender_type TEXT NOT NULL,
          sender_id TEXT,

          sender_name TEXT,

          text TEXT NOT NULL,

          is_read INTEGER DEFAULT 0,

          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,

          participant_id TEXT,

          title TEXT NOT NULL,
          message TEXT NOT NULL,

          type TEXT,

          is_read INTEGER DEFAULT 0,

          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id TEXT PRIMARY KEY,

          admin_id TEXT,

          action TEXT NOT NULL,

          entity_type TEXT,
          entity_id TEXT,

          details TEXT,

          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
          id TEXT PRIMARY KEY,

          token TEXT UNIQUE NOT NULL,

          admin_username TEXT NOT NULL,

          role TEXT DEFAULT 'super_admin',

          expires_at TEXT NOT NULL,

          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,

          value TEXT,

          updated_at TEXT NOT NULL
        )
      `)
    ]);

    dbReady = true;
  })();

  await dbPromise;
}

/* =========================================================
   ADMIN LOGIN
   ========================================================= */

async function adminLogin(request, env) {
  const body = await readJSON(request);

  const username =
    clean(body.username);

  const password =
    String(body.password || "");

  if (
    username !== ADMIN_USERNAME ||
    !env.ADMIN_PASSWORD ||
    !constantTimeEqual(
      password,
      env.ADMIN_PASSWORD
    )
  ) {
    return json({
      ok: false,
      error: "INVALID_ADMIN_LOGIN"
    }, 401, request);
  }

  await env.DB.prepare(`
    DELETE FROM admin_sessions
    WHERE expires_at <= ?
  `).bind(now()).run();

  const token =
    crypto.randomUUID() +
    "." +
    crypto.randomUUID() +
    "." +
    crypto.randomUUID();

  const expiresAt =
    new Date(
      Date.now() +
      12 * 60 * 60 * 1000
    ).toISOString();

  await env.DB.prepare(`
    INSERT INTO admin_sessions (
      id,
      token,
      admin_username,
      role,
      expires_at,
      created_at
    )
    VALUES (
      ?, ?, ?, 'super_admin', ?, ?
    )
  `).bind(
    uid("admin_session"),
    token,
    ADMIN_USERNAME,
    expiresAt,
    now()
  ).run();

  await audit(env, {
    admin_id: ADMIN_USERNAME,
    action: "admin_login",
    entity_type: "system",
    entity_id: null,
    details: {
      role: "super_admin"
    }
  });

  return json({
    ok: true,

    token,

    expires_at:
      expiresAt,

    admin: {
      username:
        ADMIN_USERNAME,

      name:
        SITE_NAME,

      role:
        "super_admin",

      permissions:
        ["*"]
    }
  }, 200, request);
}

/* =========================================================
   ADMIN ME
   ========================================================= */

async function adminMe(request, env) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  return json({
    ok: true,
    admin: auth.admin
  }, 200, request);
}

/* =========================================================
   ADMIN LOGOUT
   ========================================================= */

async function adminLogout(request, env) {
  const token =
    getAdminToken(request);

  if (token) {
    await env.DB.prepare(`
      DELETE FROM admin_sessions
      WHERE token = ?
    `).bind(token).run();
  }

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN AUTH
   ========================================================= */

async function requireAdmin(
  request,
  env
) {
  const token =
    getAdminToken(request);

  if (!token) {
    return {
      ok: false,
      response: json({
        ok: false,
        error: "ADMIN_AUTH_REQUIRED"
      }, 401, request)
    };
  }

  const session =
    await env.DB.prepare(`
      SELECT *
      FROM admin_sessions

      WHERE token = ?
        AND expires_at > ?

      LIMIT 1
    `).bind(
      token,
      now()
    ).first();

  if (!session) {
    return {
      ok: false,
      response: json({
        ok: false,
        error: "ADMIN_SESSION_EXPIRED"
      }, 401, request)
    };
  }

  return {
    ok: true,

    admin: {
      username:
        ADMIN_USERNAME,

      name:
        SITE_NAME,

      role:
        "super_admin",

      permissions:
        ["*"]
    }
  };
}

/* =========================================================
   PUBLICATIONS
   ========================================================= */

async function getPublications(
  request,
  env
) {
  const url =
    new URL(request.url);

  const q =
    clean(
      url.searchParams.get("q")
    );

  const category =
    clean(
      url.searchParams.get("category")
    );

  const country =
    clean(
      url.searchParams.get("country")
    );

  const city =
    clean(
      url.searchParams.get("city")
    );

  const where = [
    "p.status = 'published'",
    "p.visibility = 'public'",
    "p.deleted_at IS NULL"
  ];

  const args = [];

  if (q) {
    const s = `%${q}%`;

    where.push(`
      (
        p.title LIKE ?
        OR p.text LIKE ?
        OR p.tags LIKE ?
      )
    `);

    args.push(
      s,
      s,
      s
    );
  }

  if (category) {
    where.push(
      "p.category = ?"
    );

    args.push(category);
  }

  if (country) {
    where.push(
      "p.country = ?"
    );

    args.push(country);
  }

  if (city) {
    where.push(
      "p.city = ?"
    );

    args.push(city);
  }

  const result =
    await env.DB.prepare(`
      SELECT

        p.*,

        u.name AS author_name,
        u.username AS author_username,
        u.avatar_url AS author_avatar,
        u.verified AS author_verified

      FROM publications p

      LEFT JOIN participants u
        ON u.id = p.participant_id

      WHERE ${where.join(" AND ")}

      ORDER BY
        p.is_pinned DESC,
        p.is_featured DESC,
        p.published_at DESC,
        p.created_at DESC

      LIMIT 100
    `).bind(...args).all();

  return json({
    ok: true,

    publications:
      result.results || []
  }, 200, request);
}

/* =========================================================
   CREATE PUBLICATION
   ========================================================= */

async function createPublication(
  request,
  env
) {
  const body =
    await readJSON(request);

  const title =
    clean(body.title);

  const text =
    clean(body.text);

  if (!title || !text) {
    return json({
      ok: false,
      error: "TITLE_AND_TEXT_REQUIRED"
    }, 400, request);
  }

  /*
   * НЕТ РЕГИСТРАЦИИ.
   *
   * Браузер может передать технический
   * anonymous participant ID.
   *
   * Если его нет — создаём автоматически.
   */

  let participantId =
    getParticipantId(request);

  let participant = null;

  if (participantId) {
    participant =
      await env.DB.prepare(`
        SELECT *
        FROM participants
        WHERE id = ?
        LIMIT 1
      `).bind(
        participantId
      ).first();
  }

  if (!participant) {

    participantId =
      uid("participant");

    let username =
      clean(body.username);

    if (!username) {
      username =
        "user_" +
        crypto.randomUUID()
          .replaceAll("-", "")
          .slice(0, 10);
    }

    username =
      username.replace(/^@/, "");

    let exists =
      await env.DB.prepare(`
        SELECT id
        FROM participants
        WHERE username = ?
        LIMIT 1
      `).bind(username).first();

    if (exists) {
      username +=
        "_" +
        Date.now()
          .toString()
          .slice(-6);
    }

    await env.DB.prepare(`
      INSERT INTO participants (
        id,
        name,
        username,
        email,
        phone,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      participantId,

      clean(body.name) ||
        "Участник",

      username,

      clean(body.email) ||
        null,

      clean(body.phone) ||
        null,

      now(),
      now()
    ).run();
  }

  const publicationId =
    uid("publication");

  const trackingCode =
    "TO-" +
    Date.now()
      .toString(36)
      .toUpperCase() +
    "-" +
    crypto.randomUUID()
      .replaceAll("-", "")
      .slice(0, 7)
      .toUpperCase();

  await env.DB.prepare(`
    INSERT INTO publications (
      id,
      participant_id,
      tracking_code,

      title,
      text,

      category,

      country,
      city,
      location,
      scope,

      event_start,
      event_end,
      deadline,

      price,
      currency,
      salary,

      employment_type,
      work_format,

      experience,
      education,
      languages,

      tags,
      links,

      status,
      visibility,

      created_at,
      updated_at
    )

    VALUES (
      ?, ?, ?,
      ?, ?,
      ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?,
      'pending',
      'public',
      ?, ?
    )
  `).bind(
    publicationId,
    participantId,
    trackingCode,

    title,
    text,

    clean(body.category) ||
      "Другое",

    clean(body.country) ||
      null,

    clean(body.city) ||
      null,

    clean(body.location) ||
      null,

    clean(body.scope) ||
      null,

    clean(body.event_start) ||
      null,

    clean(body.event_end) ||
      null,

    clean(body.deadline) ||
      null,

    Number(body.price || 0),

    clean(body.currency) ||
      null,

    Number(body.salary || 0),

    clean(body.employment_type) ||
      null,

    clean(body.work_format) ||
      null,

    clean(body.experience) ||
      null,

    clean(body.education) ||
      null,

    clean(body.languages) ||
      null,

    clean(body.tags) ||
      null,

    clean(body.links) ||
      null,

    now(),
    now()
  ).run();

  /* MEDIA */

  if (Array.isArray(body.media)) {

    for (
      let i = 0;
      i < body.media.length;
      i++
    ) {
      const media =
        body.media[i];

      const mediaUrl =
        typeof media === "string"
          ? clean(media)
          : clean(media?.url);

      if (!mediaUrl) {
        continue;
      }

      const mediaType =
        typeof media === "object"
          ? clean(media.type)
          : detectMediaType(mediaUrl);

      await env.DB.prepare(`
        INSERT INTO publication_media (
          id,
          publication_id,
          type,
          url,
          title,
          sort_order,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        uid("media"),
        publicationId,
        MEDIA_TYPES.includes(mediaType)
          ? mediaType
          : "other",
        mediaUrl,
        typeof media === "object"
          ? clean(media.title) || null
          : null,
        i,
        now()
      ).run();
    }
  }

  await audit(env, {
    action:
      "publication_created",

    entity_type:
      "publication",

    entity_id:
      publicationId,

    details: {
      participant_id:
        participantId,

      tracking_code:
        trackingCode,

      status:
        "pending"
    }
  });

  await notify(
    env,
    participantId,

    "Публикация отправлена",

    "Ваша публикация отправлена на проверку администрации.",

    "publication_pending"
  );

  return json({
    ok: true,

    publication_id:
      publicationId,

    participant_id:
      participantId,

    tracking_code:
      trackingCode,

    status:
      "pending",

    message:
      "Публикация отправлена на модерацию."
  }, 201, request);
}

/* =========================================================
   PUBLIC SINGLE
   ========================================================= */

async function getPublicPublication(
  request,
  env,
  path
) {
  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const publication =
    await env.DB.prepare(`
      SELECT

        p.*,

        u.name AS author_name,
        u.username AS author_username,
        u.avatar_url AS author_avatar,
        u.bio AS author_bio,
        u.verified AS author_verified

      FROM publications p

      LEFT JOIN participants u
        ON u.id = p.participant_id

      WHERE p.id = ?
        AND p.status = 'published'
        AND p.visibility = 'public'
        AND p.deleted_at IS NULL

      LIMIT 1
    `).bind(id).first();

  if (!publication) {
    return json({
      ok: false,
      error: "PUBLICATION_NOT_FOUND"
    }, 404, request);
  }

  await env.DB.prepare(`
    UPDATE publications

    SET
      views_count =
        views_count + 1,

      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    id
  ).run();

  const media =
    await env.DB.prepare(`
      SELECT *
      FROM publication_media

      WHERE publication_id = ?

      ORDER BY
        sort_order ASC
    `).bind(id).all();

  return json({
    ok: true,

    publication: {
      ...publication,

      views_count:
        Number(
          publication.views_count || 0
        ) + 1,

      media:
        media.results || []
    }
  }, 200, request);
}

/* =========================================================
   REACTION
   ========================================================= */

async function reactPublication(
  request,
  env,
  path
) {
  const publicationId =
    decodeURIComponent(
      path.split("/")[3]
    );

  const participantId =
    getParticipantId(request);

  const body =
    await readJSON(request);

  const reaction =
    clean(body.reaction) ||
    "like";

  if (
    !REACTIONS.includes(reaction)
  ) {
    return json({
      ok: false,
      error: "INVALID_REACTION"
    }, 400, request);
  }

  const publication =
    await env.DB.prepare(`
      SELECT id
      FROM publications

      WHERE id = ?
        AND status = 'published'
        AND deleted_at IS NULL

      LIMIT 1
    `).bind(
      publicationId
    ).first();

  if (!publication) {
    return json({
      ok: false,
      error: "PUBLICATION_NOT_FOUND"
    }, 404, request);
  }

  const existing =
    await env.DB.prepare(`
      SELECT *
      FROM reactions

      WHERE publication_id = ?
        AND participant_id = ?

      LIMIT 1
    `).bind(
      publicationId,
      participantId
    ).first();

  if (existing) {

    if (
      existing.reaction === reaction
    ) {

      await env.DB.prepare(`
        DELETE FROM reactions
        WHERE id = ?
      `).bind(
        existing.id
      ).run();

      await reactionCounter(
        env,
        publicationId,
        reaction,
        -1
      );

      return json({
        ok: true,
        action: "removed",
        reaction
      }, 200, request);
    }

    await env.DB.prepare(`
      UPDATE reactions

      SET
        reaction = ?,
        created_at = ?

      WHERE id = ?
    `).bind(
      reaction,
      now(),
      existing.id
    ).run();

    await reactionCounter(
      env,
      publicationId,
      existing.reaction,
      -1
    );

    await reactionCounter(
      env,
      publicationId,
      reaction,
      1
    );

    return json({
      ok: true,
      action: "changed",
      reaction
    }, 200, request);
  }

  await env.DB.prepare(`
    INSERT INTO reactions (
      id,
      publication_id,
      participant_id,
      reaction,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    uid("reaction"),
    publicationId,
    participantId,
    reaction,
    now()
  ).run();

  await reactionCounter(
    env,
    publicationId,
    reaction,
    1
  );

  return json({
    ok: true,
    action: "added",
    reaction
  }, 200, request);
}

/* =========================================================
   SAVE
   ========================================================= */

async function savePublication(
  request,
  env,
  path
) {
  const publicationId =
    decodeURIComponent(
      path.split("/")[3]
    );

  const participantId =
    getParticipantId(request);

  const existing =
    await env.DB.prepare(`
      SELECT id
      FROM saves

      WHERE publication_id = ?
        AND participant_id = ?

      LIMIT 1
    `).bind(
      publicationId,
      participantId
    ).first();

  if (existing) {

    await env.DB.prepare(`
      DELETE FROM saves
      WHERE id = ?
    `).bind(
      existing.id
    ).run();

    await env.DB.prepare(`
      UPDATE publications

      SET
        saves_count =
          CASE
            WHEN saves_count > 0
            THEN saves_count - 1
            ELSE 0
          END,

        updated_at = ?

      WHERE id = ?
    `).bind(
      now(),
      publicationId
    ).run();

    return json({
      ok: true,
      saved: false
    }, 200, request);
  }

  await env.DB.prepare(`
    INSERT INTO saves (
      id,
      publication_id,
      participant_id,
      created_at
    )
    VALUES (?, ?, ?, ?)
  `).bind(
    uid("save"),
    publicationId,
    participantId,
    now()
  ).run();

  await env.DB.prepare(`
    UPDATE publications

    SET
      saves_count =
        saves_count + 1,

      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    publicationId
  ).run();

  return json({
    ok: true,
    saved: true
  }, 200, request);
}

/* =========================================================
   SHARE
   ========================================================= */

async function sharePublication(
  request,
  env,
  path
) {
  const publicationId =
    decodeURIComponent(
      path.split("/")[3]
    );

  await env.DB.prepare(`
    UPDATE publications

    SET
      shares_count =
        shares_count + 1,

      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    publicationId
  ).run();

  return json({
    ok: true,
    shared: true
  }, 200, request);
}

/* =========================================================
   COMMENTS
   ========================================================= */

async function getComments(
  request,
  env,
  path
) {
  const publicationId =
    decodeURIComponent(
      path.split("/")[3]
    );

  const result =
    await env.DB.prepare(`
      SELECT

        c.*,

        u.name AS author_name,
        u.username AS author_username,
        u.avatar_url AS author_avatar,
        u.verified AS author_verified

      FROM comments c

      LEFT JOIN participants u
        ON u.id = c.participant_id

      WHERE c.publication_id = ?
        AND c.status = 'published'
        AND c.deleted_at IS NULL

      ORDER BY c.created_at ASC
    `).bind(
      publicationId
    ).all();

  return json({
    ok: true,
    comments:
      result.results || []
  }, 200, request);
}

async function createComment(
  request,
  env,
  path
) {
  const publicationId =
    decodeURIComponent(
      path.split("/")[3]
    );

  const participantId =
    getParticipantId(request);

  const body =
    await readJSON(request);

  const text =
    clean(body.text);

  if (!text) {
    return json({
      ok: false,
      error: "COMMENT_REQUIRED"
    }, 400, request);
  }

  await env.DB.prepare(`
    INSERT INTO comments (
      id,
      publication_id,
      participant_id,
      parent_id,
      text,
      status,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?,
      'published',
      ?, ?
    )
  `).bind(
    uid("comment"),
    publicationId,
    participantId,
    clean(body.parent_id) ||
      null,
    text,
    now(),
    now()
  ).run();

  await env.DB.prepare(`
    UPDATE publications

    SET
      comments_count =
        comments_count + 1,

      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    publicationId
  ).run();

  return json({
    ok: true
  }, 201, request);
}

/* =========================================================
   REPORT
   ========================================================= */

async function createReport(
  request,
  env
) {
  const body =
    await readJSON(request);

  const publicationId =
    clean(body.publication_id) ||
    null;

  const commentId =
    clean(body.comment_id) ||
    null;

  await env.DB.prepare(`
    INSERT INTO reports (
      id,
      publication_id,
      comment_id,
      participant_id,
      type,
      reason,
      status,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?,
      'open',
      ?, ?
    )
  `).bind(
    uid("report"),
    publicationId,
    commentId,
    getParticipantId(request),
    clean(body.type) ||
      "other",
    clean(body.reason) ||
      "Без причины",
    now(),
    now()
  ).run();

  if (publicationId) {
    await env.DB.prepare(`
      UPDATE publications

      SET
        reports_count =
          reports_count + 1,

        updated_at = ?

      WHERE id = ?
    `).bind(
      now(),
      publicationId
    ).run();
  }

  return json({
    ok: true
  }, 201, request);
}

/* =========================================================
   ANONYMOUS PARTICIPANT
   ========================================================= */

async function getAnonymousParticipant(
  request,
  env
) {
  const id =
    getParticipantId(request);

  const participant =
    await env.DB.prepare(`
      SELECT

        id,
        name,
        username,

        email,
        phone,

        avatar_url,
        bio,

        country,
        city,

        profession,
        education,
        languages,
        skills,

        website,
        social_links,

        role,
        status,

        verified,
        profile_visible,

        followers_count,
        following_count,
        publications_count,

        created_at,
        updated_at

      FROM participants

      WHERE id = ?

      LIMIT 1
    `).bind(id).first();

  if (!participant) {
    return json({
      ok: true,
      registered: false,
      participant: null
    }, 200, request);
  }

  return json({
    ok: true,
    registered: false,
    participant
  }, 200, request);
}

/* =========================================================
   UPDATE PARTICIPANT
   ========================================================= */

async function updateAnonymousParticipant(
  request,
  env
) {
  const id =
    getParticipantId(request);

  const body =
    await readJSON(request);

  /*
   * Участник НЕ регистрируется.
   * Он просто редактирует свои данные.
   */

  const allowed = [
    "name",
    "username",
    "email",
    "phone",
    "avatar_url",
    "bio",
    "country",
    "city",
    "profession",
    "education",
    "languages",
    "skills",
    "website",
    "social_links"
  ];

  const updates = [];
  const values = [];

  for (
    const field of allowed
  ) {
    if (
      body[field] !== undefined
    ) {
      updates.push(
        `${field} = ?`
      );

      values.push(
        clean(body[field])
      );
    }
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "NOTHING_TO_UPDATE"
    }, 400, request);
  }

  updates.push(
    "updated_at = ?"
  );

  values.push(now());
  values.push(id);

  try {

    await env.DB.prepare(`
      UPDATE participants

      SET
        ${updates.join(", ")}

      WHERE id = ?
    `).bind(
      ...values
    ).run();

  } catch (error) {

    if (
      String(error.message || "")
        .toLowerCase()
        .includes("unique")
    ) {
      return json({
        ok: false,
        error:
          "USERNAME_ALREADY_EXISTS"
      }, 409, request);
    }

    throw error;
  }

  return getAnonymousParticipant(
    request,
    env
  );
}

/* =========================================================
   MY PUBLICATIONS
   ========================================================= */

async function myPublications(
  request,
  env
) {
  const participantId =
    getParticipantId(request);

  const result =
    await env.DB.prepare(`
      SELECT *

      FROM publications

      WHERE participant_id = ?
        AND deleted_at IS NULL

      ORDER BY created_at DESC
    `).bind(
      participantId
    ).all();

  return json({
    ok: true,
    publications:
      result.results || []
  }, 200, request);
}

/* =========================================================
   PARTICIPANT CHAT
   ========================================================= */

async function participantChat(
  request,
  env
) {
  const participantId =
    getParticipantId(request);

  const url =
    new URL(request.url);

  const publicationId =
    clean(
      url.searchParams.get(
        "publication_id"
      )
    );

  const where = [
    "participant_id = ?"
  ];

  const args = [
    participantId
  ];

  if (publicationId) {
    where.push(
      "publication_id = ?"
    );

    args.push(
      publicationId
    );
  }

  const result =
    await env.DB.prepare(`
      SELECT *

      FROM chat_messages

      WHERE ${where.join(" AND ")}

      ORDER BY created_at ASC
    `).bind(
      ...args
    ).all();

  await env.DB.prepare(`
    UPDATE chat_messages

    SET is_read = 1

    WHERE participant_id = ?
      AND sender_type = 'official'
  `).bind(
    participantId
  ).run();

  return json({
    ok: true,

    official_account: {
      name: SITE_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    },

    messages:
      result.results || []
  }, 200, request);
}

/* =========================================================
   PARTICIPANT SEND CHAT
   ========================================================= */

async function participantSendChat(
  request,
  env
) {
  const participantId =
    getParticipantId(request);

  const body =
    await readJSON(request);

  const text =
    clean(body.text);

  if (!text) {
    return json({
      ok: false,
      error: "MESSAGE_REQUIRED"
    }, 400, request);
  }

  const id =
    uid("message");

  await env.DB.prepare(`
    INSERT INTO chat_messages (
      id,
      participant_id,
      publication_id,

      sender_type,
      sender_id,
      sender_name,

      text,

      is_read,
      created_at
    )
    VALUES (
      ?, ?, ?,

      'participant',
      ?,
      NULL,

      ?,

      0,
      ?
    )
  `).bind(
    id,

    participantId,

    clean(body.publication_id) ||
      null,

    participantId,

    text,

    now()
  ).run();

  return json({
    ok: true,
    message_id: id
  }, 201, request);
}

/* =========================================================
   PARTICIPANT NOTIFICATIONS
   ========================================================= */

async function participantNotifications(
  request,
  env
) {
  const participantId =
    getParticipantId(request);

  const result =
    await env.DB.prepare(`
      SELECT *

      FROM notifications

      WHERE participant_id = ?

      ORDER BY created_at DESC

      LIMIT 200
    `).bind(
      participantId
    ).all();

  return json({
    ok: true,

    notifications:
      result.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

async function adminDashboard(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const [
    totalPublications,
    pendingPublications,
    publishedPublications,
    rejectedPublications,
    archivedPublications,

    totalParticipants,
    activeParticipants,
    blockedParticipants,
    deletedParticipants,

    openReports,
    unreadMessages,
    totalComments
  ] = await Promise.all([

    scalar(
      env,
      `SELECT COUNT(*) FROM publications`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM publications
       WHERE status = 'pending'
       AND deleted_at IS NULL`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM publications
       WHERE status = 'published'
       AND deleted_at IS NULL`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM publications
       WHERE status = 'rejected'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM publications
       WHERE status = 'archived'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants
       WHERE status = 'active'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants
       WHERE status = 'blocked'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants
       WHERE status = 'deleted'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM reports
       WHERE status = 'open'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM chat_messages
       WHERE sender_type = 'participant'
       AND is_read = 0`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM comments
       WHERE deleted_at IS NULL`
    )
  ]);

  return json({
    ok: true,

    admin: auth.admin,

    publications: {
      total:
        totalPublications,

      pending:
        pendingPublications,

      published:
        publishedPublications,

      rejected:
        rejectedPublications,

      archived:
        archivedPublications
    },

    participants: {
      total:
        totalParticipants,

      active:
        activeParticipants,

      blocked:
        blockedParticipants,

      deleted:
        deletedParticipants
    },

    moderation: {
      open_reports:
        openReports,

      unread_messages:
        unreadMessages
    },

    comments:
      totalComments,

    official_account: {
      name: SITE_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    }
  }, 200, request);
}

/* =========================================================
   ADMIN STATS
   ========================================================= */

async function adminStats(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const [
    views,
    likes,
    love,
    support,
    funny,
    wow,
    sad,
    angry,
    comments,
    shares,
    saves,
    reports
  ] = await Promise.all([

    scalar(
      env,
      `SELECT COALESCE(
        SUM(views_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(likes_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(love_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(support_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(funny_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(wow_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(sad_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(angry_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(comments_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(shares_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(saves_count),0
      ) FROM publications`
    ),

    scalar(
      env,
      `SELECT COALESCE(
        SUM(reports_count),0
      ) FROM publications`
    )
  ]);

  return json({
    ok: true,

    statistics: {
      views,
      likes,
      comments,
      shares,
      saves,
      reports,

      reactions: {
        love,
        support,
        funny,
        wow,
        sad,
        angry
      }
    }
  }, 200, request);
}

/* =========================================================
   ADMIN PUBLICATIONS LIST
   ========================================================= */

async function adminPublications(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const url =
    new URL(request.url);

  const status =
    clean(
      url.searchParams.get(
        "status"
      )
    );

  const q =
    clean(
      url.searchParams.get(
        "q"
      )
    );

  const category =
    clean(
      url.searchParams.get(
        "category"
      )
    );

  const where = [
    "1 = 1"
  ];

  const args = [];

  if (status) {
    where.push(
      "p.status = ?"
    );

    args.push(status);
  }

  if (category) {
    where.push(
      "p.category = ?"
    );

    args.push(category);
  }

  if (q) {
    const s = `%${q}%`;

    where.push(`
      (
        p.title LIKE ?
        OR p.text LIKE ?
        OR p.tracking_code LIKE ?
        OR u.name LIKE ?
        OR u.username LIKE ?
      )
    `);

    args.push(
      s,
      s,
      s,
      s,
      s
    );
  }

  const result =
    await env.DB.prepare(`
      SELECT

        p.*,

        u.name AS author_name,
        u.username AS author_username,
        u.email AS author_email,
        u.phone AS author_phone,
        u.verified AS author_verified

      FROM publications p

      LEFT JOIN participants u
        ON u.id = p.participant_id

      WHERE ${where.join(" AND ")}

      ORDER BY
        p.created_at DESC

      LIMIT 1000
    `).bind(...args).all();

  return json({
    ok: true,

    publications:
      result.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN SINGLE PUBLICATION
   ========================================================= */

async function adminPublication(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const publication =
    await env.DB.prepare(`
      SELECT

        p.*,

        u.name AS author_name,
        u.username AS author_username,
        u.email AS author_email,
        u.phone AS author_phone,

        u.country AS author_country,
        u.city AS author_city,

        u.profession AS author_profession,
        u.education AS author_education,

        u.languages AS author_languages,
        u.skills AS author_skills,

        u.bio AS author_bio,

        u.verified AS author_verified,
        u.status AS author_status

      FROM publications p

      LEFT JOIN participants u
        ON u.id = p.participant_id

      WHERE p.id = ?

      LIMIT 1
    `).bind(id).first();

  if (!publication) {
    return json({
      ok: false,
      error: "PUBLICATION_NOT_FOUND"
    }, 404, request);
  }

  const [
    media,
    comments,
    reports
  ] = await Promise.all([

    env.DB.prepare(`
      SELECT *

      FROM publication_media

      WHERE publication_id = ?

      ORDER BY sort_order ASC
    `).bind(id).all(),

    env.DB.prepare(`
      SELECT

        c.*,

        u.name AS author_name,
        u.username AS author_username

      FROM comments c

      LEFT JOIN participants u
        ON u.id = c.participant_id

      WHERE c.publication_id = ?

      ORDER BY c.created_at DESC
    `).bind(id).all(),

    env.DB.prepare(`
      SELECT *

      FROM reports

      WHERE publication_id = ?

      ORDER BY created_at DESC
    `).bind(id).all()
  ]);

  return json({
    ok: true,

    publication,

    media:
      media.results || [],

    comments:
      comments.results || [],

    reports:
      reports.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN UPDATE PUBLICATION
   ========================================================= */

async function adminUpdatePublication(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const body =
    await readJSON(request);

  const fields = [
    "participant_id",
    "title",
    "text",
    "category",
    "country",
    "city",
    "location",
    "scope",
    "event_start",
    "event_end",
    "deadline",
    "price",
    "currency",
    "salary",
    "employment_type",
    "work_format",
    "experience",
    "education",
    "languages",
    "tags",
    "links",
    "status",
    "visibility",
    "is_pinned",
    "is_featured",
    "admin_note",
    "rejection_reason",
    "published_at"
  ];

  const updates = [];
  const values = [];

  for (
    const field of fields
  ) {
    if (
      body[field] !== undefined
    ) {
      updates.push(
        `${field} = ?`
      );

      values.push(
        body[field]
      );
    }
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "NOTHING_TO_UPDATE"
    }, 400, request);
  }

  updates.push(
    "updated_at = ?"
  );

  values.push(now());
  values.push(id);

  await env.DB.prepare(`
    UPDATE publications

    SET
      ${updates.join(", ")}

    WHERE id = ?
  `).bind(
    ...values
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "publication_updated",

    entity_type:
      "publication",

    entity_id:
      id,

    details:
      body
  });

  return adminPublication(
    request,
    env,
    `/api/admin/publications/${encodeURIComponent(id)}`
  );
}

/* =========================================================
   ADMIN DELETE PUBLICATION
   ========================================================= */

async function adminDeletePublication(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  await env.DB.prepare(`
    UPDATE publications

    SET
      status = 'deleted',
      visibility = 'hidden',
      deleted_at = ?,
      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    now(),
    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "publication_deleted",

    entity_type:
      "publication",

    entity_id:
      id
  });

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN PUBLICATION ACTION
   ========================================================= */

async function adminPublicationAction(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/")[4]
    );

  const body =
    await readJSON(request);

  const action =
    clean(body.action);

  const allowed = [
    "approve",
    "reject",
    "archive",
    "draft",
    "restore",
    "pin",
    "unpin",
    "feature",
    "unfeature",
    "hide",
    "show"
  ];

  if (!allowed.includes(action)) {
    return json({
      ok: false,
      error: "INVALID_ACTION"
    }, 400, request);
  }

  const publication =
    await env.DB.prepare(`
      SELECT *
      FROM publications
      WHERE id = ?
      LIMIT 1
    `).bind(id).first();

  if (!publication) {
    return json({
      ok: false,
      error: "PUBLICATION_NOT_FOUND"
    }, 404, request);
  }

  let status =
    publication.status;

  let visibility =
    publication.visibility;

  let pinned =
    Number(
      publication.is_pinned || 0
    );

  let featured =
    Number(
      publication.is_featured || 0
    );

  let publishedAt =
    publication.published_at;

  if (action === "approve") {
    status = "published";
    visibility = "public";
    publishedAt = now();
  }

  if (action === "reject") {
    status = "rejected";
    visibility = "hidden";
  }

  if (action === "archive") {
    status = "archived";
    visibility = "hidden";
  }

  if (action === "draft") {
    status = "draft";
    visibility = "hidden";
  }

  if (action === "restore") {
    status = "published";
    visibility = "public";
    publishedAt =
      publishedAt || now();
  }

  if (action === "pin") {
    pinned = 1;
  }

  if (action === "unpin") {
    pinned = 0;
  }

  if (action === "feature") {
    featured = 1;
  }

  if (action === "unfeature") {
    featured = 0;
  }

  if (action === "hide") {
    visibility = "hidden";
  }

  if (action === "show") {
    visibility = "public";
  }

  await env.DB.prepare(`
    UPDATE publications

    SET

      status = ?,
      visibility = ?,

      is_pinned = ?,
      is_featured = ?,

      published_at = ?,

      admin_note = ?,

      rejection_reason = ?,

      deleted_at = NULL,

      updated_at = ?

    WHERE id = ?
  `).bind(
    status,
    visibility,

    pinned,
    featured,

    publishedAt,

    clean(body.admin_note) ||
      publication.admin_note ||
      null,

    action === "reject"
      ? clean(body.reason) ||
        clean(body.rejection_reason) ||
        null
      : publication.rejection_reason ||
        null,

    now(),

    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      `publication_${action}`,

    entity_type:
      "publication",

    entity_id:
      id,

    details: {
      old_status:
        publication.status,

      new_status:
        status,

      visibility,

      reason:
        body.reason || null
    }
  });

  if (
    publication.participant_id
  ) {

    if (
      action === "approve"
    ) {
      await notify(
        env,

        publication.participant_id,

        "Публикация опубликована",

        `Публикация «${publication.title}» одобрена администрацией.`,

        "publication_approved"
      );
    }

    if (
      action === "reject"
    ) {
      await notify(
        env,

        publication.participant_id,

        "Публикация отклонена",

        clean(body.reason) ||
          "Публикация не прошла модерацию.",

        "publication_rejected"
      );
    }
  }

  return json({
    ok: true,

    action,

    publication_id:
      id,

    status,

    visibility,

    published_at:
      publishedAt
  }, 200, request);
}

/* =========================================================
   ADMIN COUNTERS
   ========================================================= */

async function adminCounters(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/")[4]
    );

  const body =
    await readJSON(request);

  const counters = [
    "views_count",

    "likes_count",
    "love_count",
    "support_count",
    "funny_count",
    "wow_count",
    "sad_count",
    "angry_count",

    "comments_count",
    "shares_count",
    "saves_count",
    "reports_count"
  ];

  const updates = [];
  const values = [];

  for (
    const field of counters
  ) {

    if (
      body[field] !== undefined
    ) {

      const value =
        Number(body[field]);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return json({
          ok: false,
          error:
            `INVALID_${field}`
        }, 400, request);
      }

      updates.push(
        `${field} = ?`
      );

      values.push(
        Math.floor(value)
      );
    }
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "NO_COUNTERS"
    }, 400, request);
  }

  updates.push(
    "updated_at = ?"
  );

  values.push(now());
  values.push(id);

  await env.DB.prepare(`
    UPDATE publications

    SET
      ${updates.join(", ")}

    WHERE id = ?
  `).bind(
    ...values
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "publication_counters_changed",

    entity_type:
      "publication",

    entity_id:
      id,

    details:
      body
  });

  return json({
    ok: true,

    publication_id:
      id,

    changed:
      body
  }, 200, request);
}

/* =========================================================
   ADMIN MEDIA
   ========================================================= */

async function adminAddMedia(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const publicationId =
    decodeURIComponent(
      path.split("/")[4]
    );

  const body =
    await readJSON(request);

  const url =
    clean(body.url);

  if (!url) {
    return json({
      ok: false,
      error: "MEDIA_URL_REQUIRED"
    }, 400, request);
  }

  const type =
    MEDIA_TYPES.includes(
      clean(body.type)
    )
      ? clean(body.type)
      : detectMediaType(url);

  const order =
    Number(
      body.sort_order || 0
    );

  const id =
    uid("media");

  await env.DB.prepare(`
    INSERT INTO publication_media (
      id,
      publication_id,
      type,
      url,
      title,
      sort_order,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    publicationId,
    type,
    url,
    clean(body.title) || null,
    order,
    now()
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "media_added",

    entity_type:
      "publication_media",

    entity_id:
      id,

    details: {
      publication_id:
        publicationId,

      type,
      url
    }
  });

  return json({
    ok: true,
    media_id: id
  }, 201, request);
}

async function adminDeleteMedia(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const mediaId =
    decodeURIComponent(
      path.split("/").pop()
    );

  await env.DB.prepare(`
    DELETE FROM publication_media
    WHERE id = ?
  `).bind(
    mediaId
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "media_deleted",

    entity_type:
      "publication_media",

    entity_id:
      mediaId
  });

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN PARTICIPANTS
   ========================================================= */

async function adminParticipants(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const url =
    new URL(request.url);

  const q =
    clean(
      url.searchParams.get("q")
    );

  const status =
    clean(
      url.searchParams.get(
        "status"
      )
    );

  const where = [
    "1 = 1"
  ];

  const args = [];

  if (q) {
    const s = `%${q}%`;

    where.push(`
      (
        name LIKE ?
        OR username LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    `);

    args.push(
      s,
      s,
      s,
      s
    );
  }

  if (status) {
    where.push(
      "status = ?"
    );

    args.push(status);
  }

  const result =
    await env.DB.prepare(`
      SELECT

        id,
        name,
        username,

        email,
        phone,

        avatar_url,
        bio,

        country,
        city,

        profession,
        education,
        languages,
        skills,

        website,
        social_links,

        role,
        status,

        verified,
        profile_visible,

        followers_count,
        following_count,
        publications_count,

        created_at,
        updated_at

      FROM participants

      WHERE ${where.join(" AND ")}

      ORDER BY created_at DESC

      LIMIT 1000
    `).bind(...args).all();

  return json({
    ok: true,

    participants:
      result.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN PARTICIPANT
   ========================================================= */

async function adminParticipant(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const participant =
    await env.DB.prepare(`
      SELECT

        id,
        name,
        username,

        email,
        phone,

        avatar_url,
        bio,

        country,
        city,

        profession,
        education,
        languages,
        skills,

        website,
        social_links,

        role,
        status,

        verified,
        profile_visible,

        followers_count,
        following_count,
        publications_count,

        created_at,
        updated_at

      FROM participants

      WHERE id = ?

      LIMIT 1
    `).bind(id).first();

  if (!participant) {
    return json({
      ok: false,
      error: "PARTICIPANT_NOT_FOUND"
    }, 404, request);
  }

  const [
    publications,
    chats
  ] = await Promise.all([

    env.DB.prepare(`
      SELECT *

      FROM publications

      WHERE participant_id = ?

      ORDER BY created_at DESC
    `).bind(id).all(),

    env.DB.prepare(`
      SELECT *

      FROM chat_messages

      WHERE participant_id = ?

      ORDER BY created_at DESC

      LIMIT 100
    `).bind(id).all()
  ]);

  return json({
    ok: true,

    participant,

    publications:
      publications.results || [],

    chat:
      chats.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN UPDATE PARTICIPANT
   ========================================================= */

async function adminUpdateParticipant(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const body =
    await readJSON(request);

  const fields = [
    "name",
    "username",

    "email",
    "phone",

    "avatar_url",
    "bio",

    "country",
    "city",

    "profession",
    "education",
    "languages",
    "skills",

    "website",
    "social_links",

    "role",
    "status",

    "verified",
    "profile_visible"
  ];

  const updates = [];
  const values = [];

  for (
    const field of fields
  ) {
    if (
      body[field] !== undefined
    ) {
      updates.push(
        `${field} = ?`
      );

      values.push(
        body[field]
      );
    }
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "NOTHING_TO_UPDATE"
    }, 400, request);
  }

  updates.push(
    "updated_at = ?"
  );

  values.push(now());
  values.push(id);

  try {

    await env.DB.prepare(`
      UPDATE participants

      SET
        ${updates.join(", ")}

      WHERE id = ?
    `).bind(
      ...values
    ).run();

  } catch (error) {

    if (
      String(error.message || "")
        .toLowerCase()
        .includes("unique")
    ) {
      return json({
        ok: false,
        error:
          "USERNAME_ALREADY_EXISTS"
      }, 409, request);
    }

    throw error;
  }

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "participant_updated",

    entity_type:
      "participant",

    entity_id:
      id,

    details:
      body
  });

  return adminParticipant(
    request,
    env,
    `/api/admin/participants/${encodeURIComponent(id)}`
  );
}

/* =========================================================
   ADMIN DELETE PARTICIPANT
   ========================================================= */

async function adminDeleteParticipant(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  await env.DB.prepare(`
    UPDATE participants

    SET
      status = 'deleted',
      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    id
  ).run();

  await env.DB.prepare(`
    UPDATE publications

    SET
      status = 'archived',
      visibility = 'hidden',
      updated_at = ?

    WHERE participant_id = ?
      AND deleted_at IS NULL
  `).bind(
    now(),
    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "participant_deleted",

    entity_type:
      "participant",

    entity_id:
      id
  });

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN PARTICIPANT STATUS
   ========================================================= */

async function adminParticipantStatus(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/")[4]
    );

  const body =
    await readJSON(request);

  const status =
    clean(body.status);

  const allowed = [
    "active",
    "blocked",
    "deleted",
    "suspended"
  ];

  if (!allowed.includes(status)) {
    return json({
      ok: false,
      error: "INVALID_STATUS"
    }, 400, request);
  }

  await env.DB.prepare(`
    UPDATE participants

    SET
      status = ?,
      updated_at = ?

    WHERE id = ?
  `).bind(
    status,
    now(),
    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "participant_status_changed",

    entity_type:
      "participant",

    entity_id:
      id,

    details: {
      status
    }
  });

  return json({
    ok: true,
    status
  }, 200, request);
}

/* =========================================================
   ADMIN PARTICIPANT COUNTERS
   ========================================================= */

async function adminParticipantCounters(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/")[4]
    );

  const body =
    await readJSON(request);

  const fields = [
    "followers_count",
    "following_count",
    "publications_count"
  ];

  const updates = [];
  const values = [];

  for (
    const field of fields
  ) {
    if (
      body[field] !== undefined
    ) {
      const value =
        Number(body[field]);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return json({
          ok: false,
          error:
            `INVALID_${field}`
        }, 400, request);
      }

      updates.push(
        `${field} = ?`
      );

      values.push(
        Math.floor(value)
      );
    }
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "NO_COUNTERS"
    }, 400, request);
  }

  updates.push(
    "updated_at = ?"
  );

  values.push(now());
  values.push(id);

  await env.DB.prepare(`
    UPDATE participants

    SET
      ${updates.join(", ")}

    WHERE id = ?
  `).bind(
    ...values
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "participant_counters_changed",

    entity_type:
      "participant",

    entity_id:
      id,

    details:
      body
  });

  return json({
    ok: true,
    changed:
      body
  }, 200, request);
}

/* =========================================================
   ADMIN CHATS
   ========================================================= */

async function adminChats(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const result =
    await env.DB.prepare(`
      SELECT

        c.participant_id,

        p.name AS participant_name,
        p.username AS participant_username,
        p.avatar_url AS participant_avatar,
        p.verified AS participant_verified,

        MAX(c.created_at)
          AS last_message_at,

        SUM(
          CASE
            WHEN
              c.sender_type = 'participant'
              AND c.is_read = 0
            THEN 1
            ELSE 0
          END
        ) AS unread_count

      FROM chat_messages c

      LEFT JOIN participants p
        ON p.id = c.participant_id

      GROUP BY
        c.participant_id,
        p.name,
        p.username,
        p.avatar_url,
        p.verified

      ORDER BY
        last_message_at DESC
    `).all();

  return json({
    ok: true,

    official_account: {
      name: SITE_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    },

    chats:
      result.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN CHAT
   ========================================================= */

async function adminChatMessages(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const participantId =
    decodeURIComponent(
      path.split("/").pop()
    );

  const result =
    await env.DB.prepare(`
      SELECT *

      FROM chat_messages

      WHERE participant_id = ?

      ORDER BY created_at ASC
    `).bind(
      participantId
    ).all();

  return json({
    ok: true,

    official_account: {
      name: SITE_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    },

    participant_id:
      participantId,

    messages:
      result.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN SEND CHAT
   ========================================================= */

async function adminSendChat(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const participantId =
    decodeURIComponent(
      path.split("/").pop()
    );

  const body =
    await readJSON(request);

  const text =
    clean(body.text);

  if (!text) {
    return json({
      ok: false,
      error: "MESSAGE_REQUIRED"
    }, 400, request);
  }

  const id =
    uid("message");

  await env.DB.prepare(`
    INSERT INTO chat_messages (
      id,
      participant_id,
      publication_id,

      sender_type,
      sender_id,
      sender_name,

      text,

      is_read,
      created_at
    )
    VALUES (
      ?, ?, ?,

      'official',
      'official',
      ?,

      ?,

      0,
      ?
    )
  `).bind(
    id,

    participantId,

    clean(body.publication_id) ||
      null,

    SITE_NAME,

    text,

    now()
  ).run();

  await notify(
    env,

    participantId,

    SITE_NAME,

    text,

    "official_message"
  );

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "official_message_sent",

    entity_type:
      "chat",

    entity_id:
      participantId,

    details: {
      publication_id:
        clean(body.publication_id) ||
        null,

      message_id:
        id
    }
  });

  return json({
    ok: true,

    message_id:
      id,

    official_account: {
      name: SITE_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    }
  }, 201, request);
}

/* =========================================================
   ADMIN MARK CHAT READ
   ========================================================= */

async function adminMarkChatRead(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const participantId =
    decodeURIComponent(
      path.split("/")[4]
    );

  await env.DB.prepare(`
    UPDATE chat_messages

    SET
      is_read = 1

    WHERE participant_id = ?
      AND sender_type = 'participant'
  `).bind(
    participantId
  ).run();

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN COMMENTS
   ========================================================= */

async function adminComments(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const result =
    await env.DB.prepare(`
      SELECT

        c.*,

        p.title AS publication_title,

        u.name AS author_name,
        u.username AS author_username

      FROM comments c

      LEFT JOIN publications p
        ON p.id = c.publication_id

      LEFT JOIN participants u
        ON u.id = c.participant_id

      ORDER BY c.created_at DESC

      LIMIT 1000
    `).all();

  return json({
    ok: true,

    comments:
      result.results || []
  }, 200, request);
}

async function adminUpdateComment(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const body =
    await readJSON(request);

  await env.DB.prepare(`
    UPDATE comments

    SET

      text =
        COALESCE(?, text),

      status =
        COALESCE(?, status),

      likes_count =
        COALESCE(?, likes_count),

      updated_at = ?

    WHERE id = ?
  `).bind(
    body.text !== undefined
      ? clean(body.text)
      : null,

    body.status !== undefined
      ? clean(body.status)
      : null,

    body.likes_count !== undefined
      ? Math.max(
          0,
          Math.floor(
            Number(
              body.likes_count
            )
          )
        )
      : null,

    now(),

    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "comment_updated",

    entity_type:
      "comment",

    entity_id:
      id,

    details:
      body
  });

  return json({
    ok: true
  }, 200, request);
}

async function adminDeleteComment(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  await env.DB.prepare(`
    UPDATE comments

    SET
      status = 'deleted',
      deleted_at = ?,
      updated_at = ?

    WHERE id = ?
  `).bind(
    now(),
    now(),
    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "comment_deleted",

    entity_type:
      "comment",

    entity_id:
      id
  });

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN REPORTS
   ========================================================= */

async function adminReports(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const result =
    await env.DB.prepare(`
      SELECT

        r.*,

        p.title AS publication_title,

        u.name AS participant_name,
        u.username AS participant_username

      FROM reports r

      LEFT JOIN publications p
        ON p.id = r.publication_id

      LEFT JOIN participants u
        ON u.id = r.participant_id

      ORDER BY r.created_at DESC

      LIMIT 1000
    `).all();

  return json({
    ok: true,

    reports:
      result.results || []
  }, 200, request);
}

async function adminUpdateReport(
  request,
  env,
  path
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const id =
    decodeURIComponent(
      path.split("/").pop()
    );

  const body =
    await readJSON(request);

  await env.DB.prepare(`
    UPDATE reports

    SET

      status =
        COALESCE(?, status),

      admin_note =
        COALESCE(?, admin_note),

      updated_at = ?

    WHERE id = ?
  `).bind(
    body.status !== undefined
      ? clean(body.status)
      : null,

    body.admin_note !== undefined
      ? clean(body.admin_note)
      : null,

    now(),

    id
  ).run();

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "report_updated",

    entity_type:
      "report",

    entity_id:
      id,

    details:
      body
  });

  return json({
    ok: true
  }, 200, request);
}

/* =========================================================
   ADMIN NOTIFICATIONS
   ========================================================= */

async function adminNotifications(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const [
    pending,
    totalParticipants,
    activeParticipants,
    deletedParticipants,
    blockedParticipants,
    openReports,
    unreadChats,
    totalPublications,
    publishedPublications
  ] = await Promise.all([

    scalar(
      env,
      `SELECT COUNT(*) FROM publications
       WHERE status = 'pending'
       AND deleted_at IS NULL`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants
       WHERE status = 'active'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants
       WHERE status = 'deleted'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM participants
       WHERE status = 'blocked'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM reports
       WHERE status = 'open'`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM chat_messages
       WHERE sender_type = 'participant'
       AND is_read = 0`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM publications`
    ),

    scalar(
      env,
      `SELECT COUNT(*) FROM publications
       WHERE status = 'published'
       AND deleted_at IS NULL`
    )
  ]);

  return json({
    ok: true,

    sections: {

      pending_posts: {
        title:
          "Эти посты ждут разрешения",

        count:
          pending
      },

      participants: {
        total:
          totalParticipants,

        active:
          activeParticipants,

        deleted:
          deletedParticipants,

        blocked:
          blockedParticipants
      },

      publications: {
        total:
          totalPublications,

        published:
          publishedPublications
      },

      moderation: {
        reports:
          openReports,

        unread_chats:
          unreadChats
      }
    }
  }, 200, request);
}

/* =========================================================
   ADMIN AUDIT
   ========================================================= */

async function adminAudit(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const result =
    await env.DB.prepare(`
      SELECT *

      FROM audit_log

      ORDER BY created_at DESC

      LIMIT 1000
    `).all();

  return json({
    ok: true,

    audit:
      result.results || []
  }, 200, request);
}

/* =========================================================
   ADMIN SETTINGS
   ========================================================= */

async function adminSettings(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const result =
    await env.DB.prepare(`
      SELECT *

      FROM system_settings

      ORDER BY key ASC
    `).all();

  const settings = {};

  for (
    const row of result.results || []
  ) {
    try {
      settings[row.key] =
        JSON.parse(row.value);
    } catch {
      settings[row.key] =
        row.value;
    }
  }

  return json({
    ok: true,

    settings
  }, 200, request);
}

async function adminUpdateSettings(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  const body =
    await readJSON(request);

  for (
    const [key, value]
    of Object.entries(body)
  ) {

    await env.DB.prepare(`
      INSERT INTO system_settings (
        key,
        value,
        updated_at
      )

      VALUES (?, ?, ?)

      ON CONFLICT(key)

      DO UPDATE SET
        value =
          excluded.value,

        updated_at =
          excluded.updated_at
    `).bind(
      clean(key),
      JSON.stringify(value),
      now()
    ).run();
  }

  await audit(env, {
    admin_id:
      auth.admin.username,

    action:
      "system_settings_updated",

    entity_type:
      "system",

    details:
      body
  });

  return adminSettings(
    request,
    env
  );
}

/* =========================================================
   ADMIN SYSTEM
   ========================================================= */

async function adminSystem(
  request,
  env
) {
  const auth =
    await requireAdmin(
      request,
      env
    );

  if (!auth.ok) {
    return auth.response;
  }

  return json({
    ok: true,

    site: {
      name: SITE_NAME,

      official_username:
        OFFICIAL_USERNAME
    },

    admin: {
      username:
        ADMIN_USERNAME,

      role:
        "super_admin",

      permissions:
        ["*"],

      registration:
        false
    },

    participant_system: {
      registration:
        false,

      login:
        false,

      social_login:
        false,

      google:
        false,

      facebook:
        false,

      telegram:
        false,

      apple:
        false,

      anonymous_usage:
        true
    },

    categories:
      CATEGORIES,

    reactions:
      REACTIONS,

    media_types:
      MEDIA_TYPES
  }, 200, request);
}

/* =========================================================
   NOTIFICATION
   ========================================================= */

async function notify(
  env,
  participantId,
  title,
  message,
  type
) {
  if (!participantId) {
    return;
  }

  await env.DB.prepare(`
    INSERT INTO notifications (
      id,
      participant_id,
      title,
      message,
      type,
      is_read,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).bind(
    uid("notification"),
    participantId,
    title,
    message,
    type || "system",
    now()
  ).run();
}

/* =========================================================
   AUDIT
   ========================================================= */

async function audit(
  env,
  data
) {
  await env.DB.prepare(`
    INSERT INTO audit_log (
      id,
      admin_id,
      action,
      entity_type,
      entity_id,
      details,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    uid("audit"),

    data.admin_id ||
      null,

    data.action ||
      "unknown",

    data.entity_type ||
      null,

    data.entity_id ||
      null,

    JSON.stringify(
      data.details || {}
    ),

    now()
  ).run();
}

/* =========================================================
   REACTION COUNTER
   ========================================================= */

async function reactionCounter(
  env,
  publicationId,
  reaction,
  delta
) {
  const fields = {
    like:
      "likes_count",

    love:
      "love_count",

    support:
      "support_count",

    funny:
      "funny_count",

    wow:
      "wow_count",

    sad:
      "sad_count",

    angry:
      "angry_count"
  };

  const field =
    fields[reaction];

  if (!field) {
    return;
  }

  await env.DB.prepare(`
    UPDATE publications

    SET

      ${field} =
        CASE

          WHEN ${field} + ? < 0
          THEN 0

          ELSE ${field} + ?

        END,

      updated_at = ?

    WHERE id = ?
  `).bind(
    delta,
    delta,
    now(),
    publicationId
  ).run();
}

/* =========================================================
   PARTICIPANT ID
   ========================================================= */

function getParticipantId(
  request
) {
  /*
   * НЕТ ЛОГИНА.
   *
   * Frontend сохраняет этот ID локально
   * и отправляет его обратно.
   */

  return (
    request.headers.get(
      "X-Participant-ID"
    ) ||
    request.headers.get(
      "X-User-ID"
    ) ||
    "anonymous"
  ).trim();
}

/* =========================================================
   ADMIN TOKEN
   ========================================================= */

function getAdminToken(
  request
) {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    authorization &&
    authorization.startsWith(
      "Bearer "
    )
  ) {
    return authorization
      .slice(7)
      .trim();
  }

  return (
    request.headers.get(
      "X-Admin-Token"
    ) || ""
  ).trim();
}

/* =========================================================
   HELPERS
   ========================================================= */

function now() {
  return new Date().toISOString();
}

function uid(prefix) {
  return (
    prefix +
    "_" +
    crypto.randomUUID()
  );
}

function clean(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\u0000/g, "");
}

function normalizePath(
  pathname
) {
  let path =
    pathname || "/";

  if (
    path.length > 1 &&
    path.endsWith("/")
  ) {
    path =
      path.slice(0, -1);
  }

  return path;
}

async function readJSON(
  request
) {
  const text =
    await request.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "INVALID_JSON"
    );
  }
}

async function scalar(
  env,
  sql,
  ...args
) {
  const row =
    await env.DB
      .prepare(sql)
      .bind(...args)
      .first();

  if (!row) {
    return 0;
  }

  const key =
    Object.keys(row)[0];

  return Number(
    row[key] || 0
  );
}

function constantTimeEqual(
  a,
  b
) {
  const x =
    String(a || "");

  const y =
    String(b || "");

  if (
    x.length !== y.length
  ) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < x.length;
    i++
  ) {
    result |=
      x.charCodeAt(i) ^
      y.charCodeAt(i);
  }

  return result === 0;
}

function detectMediaType(
  url
) {
  const value =
    String(url || "")
      .toLowerCase();

  if (
    /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/
      .test(value)
  ) {
    return "image";
  }

  if (
    /\.(mp4|webm|mov|mkv)(\?|$)/
      .test(value)
  ) {
    return "video";
  }

  if (
    /\.(mp3|wav|ogg|m4a)(\?|$)/
      .test(value)
  ) {
    return "audio";
  }

  if (
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?|$)/
      .test(value)
  ) {
    return "document";
  }

  return "link";
}

/* =========================================================
   RESPONSE
   ========================================================= */

function json(
  data,
  status,
  request
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders(request),

        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store",

        "X-Content-Type-Options":
          "nosniff",

        "X-Frame-Options":
          "SAMEORIGIN",

        "Referrer-Policy":
          "strict-origin-when-cross-origin"
      }
    }
  );
}

function corsHeaders(
  request
) {
  const origin =
    request?.headers.get(
      "Origin"
    );

  return {
    "Access-Control-Allow-Origin":
      origin || "*",

    "Access-Control-Allow-Credentials":
      "true",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Admin-Token, X-Participant-ID, X-User-ID",

    "Access-Control-Allow-Methods":
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",

    "Vary":
      "Origin"
  };
  }
