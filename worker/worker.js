/* ============================================================
   TAJIK OPPORTUNITIES
   Cloudflare Worker
   ============================================================ */

const SITE_NAME = "Tajik Opportunities";
const OFFICIAL_NAME = "Tajik Opportunities";
const OFFICIAL_USERNAME = "@tajikopportunities";

const ADMIN_USERNAME = "admin";

const COOKIE_PARTICIPANT = "to_participant";
const COOKIE_ADMIN = "to_admin";

const PARTICIPANT_SESSION_DAYS = 365;
const ADMIN_SESSION_HOURS = 12;

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
  "Поддержка",
  "Реклама",
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
  "audio",
  "music",
  "document",
  "link"
];

const PUBLIC_STATUSES = ["published"];
const ALL_PUBLICATION_STATUSES = [
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
  "deleted",
  "awaiting_payment",
  "paid"
];

let schemaPromise = null;

/* ============================================================
   BASIC HELPERS
   ============================================================ */

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...securityHeaders(),
      ...extraHeaders
    }
  });
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  };
}

function now() {
  return new Date().toISOString();
}

function randomId(prefix = "") {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);

  let value = "";
  for (const b of bytes) {
    value += b.toString(16).padStart(2, "0");
  }

  return prefix + value;
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(hash)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}

function clean(value, max = 10000) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, max);
}

function bool(value) {
  return value === true ||
    value === 1 ||
    value === "1" ||
    value === "true";
}

function int(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function parseJSON(value, fallback = null) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getPathParts(url) {
  return url.pathname
    .split("/")
    .filter(Boolean);
}

function isSafeId(value) {
  return /^[a-zA-Z0-9_-]{1,120}$/.test(value || "");
}

function normalizeUsername(value) {
  let username = clean(value, 100).toLowerCase();

  if (username && !username.startsWith("@")) {
    username = "@" + username;
  }

  return username;
}

function validUrl(value) {
  try {
    const u = new URL(value);

    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

/* ============================================================
   COOKIE HELPERS
   ============================================================ */

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";

  const parts = cookie.split(";");

  for (const part of parts) {
    const index = part.indexOf("=");

    if (index === -1) continue;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function setCookie(name, value, options = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`
  ];

  parts.push(`Path=${options.path || "/"}`);

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  parts.push("Secure");

  parts.push(
    `SameSite=${options.sameSite || "Lax"}`
  );

  if (options.expires) {
    parts.push(`Expires=${options.expires}`);
  }

  return parts.join("; ");
}

function deleteCookie(name) {
  return setCookie(name, "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "Lax"
  });
}

/* ============================================================
   CORS
   ============================================================ */

function corsHeaders(request) {
  const origin = request.headers.get("Origin");

  const allowed = [
    "https://tajik-opportunities.com",
    "https://www.tajik-opportunities.com"
  ];

  const headers = {};

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Access-Control-Allow-Headers"] =
      "Content-Type, Authorization, X-Requested-With";
    headers["Access-Control-Allow-Methods"] =
      "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers["Vary"] = "Origin";
  }

  return headers;
}

/* ============================================================
   DATABASE SCHEMA
   ============================================================ */

async function ensureDatabase(env) {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {

    await env.DB.batch([
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY,
          display_name TEXT,
          username TEXT,
          email TEXT,
          phone TEXT,
          avatar_url TEXT,
          bio TEXT,
          country TEXT,
          city TEXT,
          profession TEXT,
          website TEXT,
          social_links TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          role TEXT NOT NULL DEFAULT 'participant',
          verified INTEGER NOT NULL DEFAULT 0,
          blocked INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          last_seen_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_username
        ON participants(username)
        WHERE username IS NOT NULL AND username != ''
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS participant_sessions (
          id TEXT PRIMARY KEY,
          participant_id TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          last_seen_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_participant_sessions_token
        ON participant_sessions(token_hash)
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS publications (
          id TEXT PRIMARY KEY,
          participant_id TEXT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT,
          country TEXT,
          city TEXT,
          location TEXT,
          scope TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          visibility TEXT NOT NULL DEFAULT 'private',
          featured INTEGER NOT NULL DEFAULT 0,
          pinned INTEGER NOT NULL DEFAULT 0,
          verified INTEGER NOT NULL DEFAULT 0,

          event_start TEXT,
          event_end TEXT,
          deadline TEXT,

          price REAL,
          currency TEXT,

          employment_type TEXT,
          work_format TEXT,
          experience TEXT,
          education TEXT,
          languages TEXT,

          tags TEXT,
          links TEXT,

          views_count INTEGER NOT NULL DEFAULT 0,
          likes_count INTEGER NOT NULL DEFAULT 0,
          comments_count INTEGER NOT NULL DEFAULT 0,
          shares_count INTEGER NOT NULL DEFAULT 0,
          saves_count INTEGER NOT NULL DEFAULT 0,
          reports_count INTEGER NOT NULL DEFAULT 0,

          reaction_like INTEGER NOT NULL DEFAULT 0,
          reaction_love INTEGER NOT NULL DEFAULT 0,
          reaction_support INTEGER NOT NULL DEFAULT 0,
          reaction_funny INTEGER NOT NULL DEFAULT 0,
          reaction_wow INTEGER NOT NULL DEFAULT 0,
          reaction_sad INTEGER NOT NULL DEFAULT 0,
          reaction_angry INTEGER NOT NULL DEFAULT 0,

          payment_amount REAL NOT NULL DEFAULT 0,
          payment_currency TEXT DEFAULT 'TJS',
          payment_status TEXT NOT NULL DEFAULT 'not_required',

          admin_note TEXT,

          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          published_at TEXT,
          deleted_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_publications_status
        ON publications(status)
      `),

      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_publications_created
        ON publications(created_at)
      `),

      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_publications_participant
        ON publications(participant_id)
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS publication_media (
          id TEXT PRIMARY KEY,
          publication_id TEXT NOT NULL,
          type TEXT NOT NULL,
          url TEXT NOT NULL,
          title TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
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
          UNIQUE(publication_id, participant_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS saves (
          id TEXT PRIMARY KEY,
          publication_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(publication_id, participant_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS shares (
          id TEXT PRIMARY KEY,
          publication_id TEXT NOT NULL,
          participant_id TEXT,
          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          publication_id TEXT NOT NULL,
          participant_id TEXT,
          parent_id TEXT,
          content TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'published',
          pinned INTEGER NOT NULL DEFAULT 0,
          likes_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS comment_reactions (
          id TEXT PRIMARY KEY,
          comment_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          reaction TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(comment_id, participant_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          publication_id TEXT,
          comment_id TEXT,
          participant_id TEXT,
          reason TEXT,
          details TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          admin_note TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          participant_id TEXT NOT NULL,
          sender_type TEXT NOT NULL,
          sender_id TEXT,
          message TEXT NOT NULL,
          publication_id TEXT,
          read_at TEXT,
          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE INDEX IF NOT EXISTS idx_chat_participant
        ON chat_messages(participant_id, created_at)
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          participant_id TEXT,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT,
          publication_id TEXT,
          comment_id TEXT,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id TEXT PRIMARY KEY,
          admin_username TEXT,
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
          token_hash TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          last_seen_at TEXT
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS follows (
          id TEXT PRIMARY KEY,
          follower_id TEXT NOT NULL,
          target_participant_id TEXT,
          target_publication_id TEXT,
          created_at TEXT NOT NULL,
          UNIQUE(follower_id, target_participant_id, target_publication_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS blocks (
          id TEXT PRIMARY KEY,
          participant_id TEXT NOT NULL,
          target_participant_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(participant_id, target_participant_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS polls (
          id TEXT PRIMARY KEY,
          publication_id TEXT NOT NULL,
          question TEXT NOT NULL,
          options TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS poll_votes (
          id TEXT PRIMARY KEY,
          poll_id TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          option_index INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(poll_id, participant_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS hashtags (
          id TEXT PRIMARY KEY,
          tag TEXT NOT NULL UNIQUE,
          usage_count INTEGER NOT NULL DEFAULT 0
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS publication_hashtags (
          publication_id TEXT NOT NULL,
          hashtag_id TEXT NOT NULL,
          UNIQUE(publication_id, hashtag_id)
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS ads (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT,
          media_url TEXT,
          target_url TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          starts_at TEXT,
          ends_at TEXT,
          budget REAL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id TEXT PRIMARY KEY,
          participant_id TEXT,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          admin_reply TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `),

      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id TEXT PRIMARY KEY,
          participant_id TEXT,
          event_type TEXT NOT NULL,
          entity_type TEXT,
          entity_id TEXT,
          metadata TEXT,
          created_at TEXT NOT NULL
        )
      `)
    ]);

    await env.DB.batch([
      env.DB.prepare(`
        INSERT OR IGNORE INTO system_settings
        (key, value, updated_at)
        VALUES (?, ?, ?)
      `).bind(
        "site_name",
        SITE_NAME,
        now()
      ),

      env.DB.prepare(`
        INSERT OR IGNORE INTO system_settings
        (key, value, updated_at)
        VALUES (?, ?, ?)
      `).bind(
        "registration_enabled",
        "false",
        now()
      ),

      env.DB.prepare(`
        INSERT OR IGNORE INTO system_settings
        (key, value, updated_at)
        VALUES (?, ?, ?)
      `).bind(
        "participant_login_enabled",
        "false",
        now()
      ),

      env.DB.prepare(`
        INSERT OR IGNORE INTO system_settings
        (key, value, updated_at)
        VALUES (?, ?, ?)
      `).bind(
        "publication_requires_approval",
        "true",
        now()
      ),

      env.DB.prepare(`
        INSERT OR IGNORE INTO system_settings
        (key, value, updated_at)
        VALUES (?, ?, ?)
      `).bind(
        "publication_fee_default",
        "0",
        now()
      )
    ]);

  })();

  return schemaPromise;
}

/* ============================================================
   PARTICIPANT SESSION
   ============================================================ */

async function getParticipant(request, env) {
  const token = getCookie(request, COOKIE_PARTICIPANT);

  if (!token) return null;

  const hash = await sha256(token);

  const row = await env.DB.prepare(`
    SELECT
      p.*,
      s.expires_at AS session_expires_at
    FROM participant_sessions s
    JOIN participants p
      ON p.id = s.participant_id
    WHERE s.token_hash = ?
    LIMIT 1
  `).bind(hash).first();

  if (!row) return null;

  if (new Date(row.session_expires_at) < new Date()) {
    return null;
  }

  if (row.blocked) return null;

  return row;
}

async function createAnonymousParticipant(env) {
  const participantId = randomId("p_");
  const token = randomId("s_");
  const tokenHash = await sha256(token);

  const created = now();

  const expires = new Date(
    Date.now() +
    PARTICIPANT_SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO participants (
        id,
        display_name,
        username,
        status,
        role,
        verified,
        blocked,
        created_at,
        updated_at,
        last_seen_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      participantId,
      "Участник",
      null,
      "active",
      "participant",
      0,
      0,
      created,
      created,
      created
    ),

    env.DB.prepare(`
      INSERT INTO participant_sessions (
        id,
        participant_id,
        token_hash,
        created_at,
        expires_at,
        last_seen_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      randomId("ps_"),
      participantId,
      tokenHash,
      created,
      expires,
      created
    )
  ]);

  return {
    participantId,
    token,
    expires
  };
}

async function ensureParticipant(request, env) {
  const existing = await getParticipant(request, env);

  if (existing) {
    await env.DB.prepare(`
      UPDATE participants
      SET last_seen_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      now(),
      now(),
      existing.id
    ).run();

    return {
      participant: existing,
      cookie: null
    };
  }

  const created = await createAnonymousParticipant(env);

  const participant = await env.DB.prepare(`
    SELECT *
    FROM participants
    WHERE id = ?
  `).bind(created.participantId).first();

  return {
    participant,
    cookie: setCookie(
      COOKIE_PARTICIPANT,
      created.token,
      {
        maxAge:
          PARTICIPANT_SESSION_DAYS *
          24 *
          60 *
          60,
        httpOnly: true,
        sameSite: "Lax"
      }
    )
  };
}

/* ============================================================
   REQUEST BODY
   ============================================================ */

async function body(request) {
  const contentType =
    request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  if (
    contentType.includes(
      "application/x-www-form-urlencoded"
    )
  ) {
    const form = await request.formData();

    return Object.fromEntries(form.entries());
  }

  try {
    return await request.json();
  } catch {
    return {};
  }
}

/* ============================================================
   PUBLIC PUBLICATIONS
   ============================================================ */

async function publicPublications(request, env) {
  const url = new URL(request.url);

  const category = clean(
    url.searchParams.get("category"),
    100
  );

  const search = clean(
    url.searchParams.get("search"),
    200
  );

  const city = clean(
    url.searchParams.get("city"),
    100
  );

  const country = clean(
    url.searchParams.get("country"),
    100
  );

  const limit = Math.min(
    Math.max(
      int(url.searchParams.get("limit"), 20),
      1
    ),
    100
  );

  const offset = Math.max(
    int(url.searchParams.get("offset"), 0),
    0
  );

  const where = [
    `p.status = 'published'`,
    `p.visibility = 'public'`,
    `p.deleted_at IS NULL`
  ];

  const params = [];

  if (category) {
    where.push("p.category = ?");
    params.push(category);
  }

  if (city) {
    where.push("p.city = ?");
    params.push(city);
  }

  if (country) {
    where.push("p.country = ?");
    params.push(country);
  }

  if (search) {
    where.push(`
      (
        p.title LIKE ?
        OR p.content LIKE ?
        OR p.tags LIKE ?
      )
    `);

    const q = `%${search}%`;

    params.push(q, q, q);
  }

  const query = `
    SELECT
      p.*,
      COALESCE(
        (
          SELECT COUNT(*)
          FROM publication_media pm
          WHERE pm.publication_id = p.id
        ),
        0
      ) AS media_count
    FROM publications p
    WHERE ${where.join(" AND ")}
    ORDER BY
      p.pinned DESC,
      p.featured DESC,
      COALESCE(p.published_at, p.created_at) DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const result = await env.DB
    .prepare(query)
    .bind(...params)
    .all();

  return json({
    ok: true,
    publications: result.results || [],
    count: result.results?.length || 0,
    limit,
    offset
  });
}

async function getPublicPublication(id, env) {
  const publication = await env.DB.prepare(`
    SELECT *
    FROM publications
    WHERE id = ?
      AND status = 'published'
      AND visibility = 'public'
      AND deleted_at IS NULL
    LIMIT 1
  `).bind(id).first();

  if (!publication) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  await env.DB.prepare(`
    UPDATE publications
    SET views_count = views_count + 1
    WHERE id = ?
  `).bind(id).run();

  const media = await env.DB.prepare(`
    SELECT *
    FROM publication_media
    WHERE publication_id = ?
    ORDER BY sort_order ASC, created_at ASC
  `).bind(id).all();

  const comments = await env.DB.prepare(`
    SELECT
      c.*,
      p.display_name,
      p.username,
      p.avatar_url
    FROM comments c
    LEFT JOIN participants p
      ON p.id = c.participant_id
    WHERE c.publication_id = ?
      AND c.status = 'published'
      AND c.deleted_at IS NULL
    ORDER BY c.pinned DESC, c.created_at ASC
  `).bind(id).all();

  return json({
    ok: true,
    publication: {
      ...publication,
      media: media.results || [],
      comments: comments.results || []
    }
  });
}

/* ============================================================
   PUBLICATION CREATION
   ============================================================ */

async function createPublication(request, env) {
  const data = await body(request);

  /*
   ============================================================
   ВАЖНО:

   УЧАСТНИК НЕ ПЕРЕДАЁТ:
   - имя
   - username
   - пароль
   - participant_id

   НУЖНЫ ТОЛЬКО:
   - title
   - content

   Поэтому здесь больше НЕТ ПРОВЕРКИ ИМЕНИ/USERNAME.
   ============================================================
  */

  const title = clean(
    data.title ??
    data.heading ??
    data.name,
    300
  );

  const content = clean(
    data.content ??
    data.text ??
    data.description ??
    data.body,
    30000
  );

  if (!title) {
    return json({
      ok: false,
      error: "Введите заголовок"
    }, 400);
  }

  if (!content) {
    return json({
      ok: false,
      error: "Введите текст"
    }, 400);
  }

  /*
   Проверяем participant session.
   Если её ещё нет — создаём технического
   участника автоматически.

   Пользователь этого НЕ видит.
  */

  const participantResult =
    await ensureParticipant(request, env);

  const participant =
    participantResult.participant;

  const publicationId = randomId("pub_");
  const created = now();

  const category = clean(data.category, 100);
  const country = clean(data.country, 100);
  const city = clean(data.city, 100);
  const location = clean(data.location, 300);
  const scope = clean(data.scope, 50);

  const eventStart = clean(
    data.event_start ??
    data.eventStart,
    100
  );

  const eventEnd = clean(
    data.event_end ??
    data.eventEnd,
    100
  );

  const deadline = clean(
    data.deadline,
    100
  );

  const price =
    data.price === undefined ||
    data.price === null ||
    data.price === ""
      ? null
      : Number(data.price);

  const currency = clean(
    data.currency,
    20
  );

  const employmentType = clean(
    data.employment_type,
    100
  );

  const workFormat = clean(
    data.work_format,
    100
  );

  const experience = clean(
    data.experience,
    200
  );

  const education = clean(
    data.education,
    300
  );

  const languages = clean(
    typeof data.languages === "string"
      ? data.languages
      : JSON.stringify(data.languages || []),
    2000
  );

  const tags = clean(
    typeof data.tags === "string"
      ? data.tags
      : JSON.stringify(data.tags || []),
    3000
  );

  const links = clean(
    typeof data.links === "string"
      ? data.links
      : JSON.stringify(data.links || []),
    5000
  );

  /*
   По умолчанию публикация всегда PENDING.
   Публично она не появляется.
  */

  await env.DB.prepare(`
    INSERT INTO publications (
      id,
      participant_id,
      title,
      content,
      category,
      country,
      city,
      location,
      scope,
      status,
      visibility,
      featured,
      pinned,
      verified,
      event_start,
      event_end,
      deadline,
      price,
      currency,
      employment_type,
      work_format,
      experience,
      education,
      languages,
      tags,
      links,
      payment_amount,
      payment_currency,
      payment_status,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?
    )
  `).bind(
    publicationId,
    participant.id,
    title,
    content,
    category || null,
    country || null,
    city || null,
    location || null,
    scope || null,
    "pending",
    "private",
    0,
    0,
    0,
    eventStart || null,
    eventEnd || null,
    deadline || null,
    Number.isFinite(price) ? price : null,
    currency || null,
    employmentType || null,
    workFormat || null,
    experience || null,
    education || null,
    languages || null,
    tags || null,
    links || null,
    0,
    "TJS",
    "not_required",
    created,
    created
  ).run();

  /*
   MEDIA ПО URL
  */

  let media = data.media;

  if (typeof media === "string") {
    media = parseJSON(media, []);
  }

  if (!Array.isArray(media)) {
    media = [];
  }

  const mediaStatements = [];

  media.forEach((item, index) => {
    if (!item) return;

    const type = clean(
      item.type,
      30
    );

    const url = clean(
      item.url,
      2000
    );

    if (
      !MEDIA_TYPES.includes(type) ||
      !validUrl(url)
    ) {
      return;
    }

    mediaStatements.push(
      env.DB.prepare(`
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
        randomId("media_"),
        publicationId,
        type,
        url,
        clean(item.title, 300) || null,
        index,
        created
      )
    );
  });

  if (mediaStatements.length) {
    await env.DB.batch(mediaStatements);
  }

  /*
   Уведомление админу.
  */

  await env.DB.prepare(`
    INSERT INTO notifications (
      id,
      participant_id,
      type,
      title,
      message,
      publication_id,
      is_read,
      created_at
    )
    VALUES (?, NULL, ?, ?, ?, ?, 0, ?)
  `).bind(
    randomId("notif_"),
    "new_publication",
    "Новая публикация",
    `Новая публикация ожидает проверки: ${title}`,
    publicationId,
    created
  ).run();

  const headers = {};

  if (participantResult.cookie) {
    headers["Set-Cookie"] =
      participantResult.cookie;
  }

  return json({
    ok: true,
    message:
      "Публикация отправлена на проверку администратору.",
    status: "pending",
    publication_id: publicationId
  }, 201, headers);
}

/* ============================================================
   PARTICIPANT REACTIONS
   ============================================================ */

async function reactPublication(
  request,
  env,
  publicationId
) {
  const data = await body(request);

  const reaction = clean(
    data.reaction || "like",
    30
  );

  if (!REACTIONS.includes(reaction)) {
    return json({
      ok: false,
      error: "Недопустимая реакция"
    }, 400);
  }

  const session =
    await ensureParticipant(request, env);

  const participant =
    session.participant;

  const publication =
    await env.DB.prepare(`
      SELECT id
      FROM publications
      WHERE id = ?
        AND status = 'published'
        AND visibility = 'public'
        AND deleted_at IS NULL
    `).bind(publicationId).first();

  if (!publication) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
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
      participant.id
    ).first();

  const statements = [];

  if (existing) {
    statements.push(
      env.DB.prepare(`
        UPDATE publications
        SET reaction_${existing.reaction} =
          CASE
            WHEN reaction_${existing.reaction} > 0
            THEN reaction_${existing.reaction} - 1
            ELSE 0
          END
        WHERE id = ?
      `).bind(publicationId),

      env.DB.prepare(`
        DELETE FROM reactions
        WHERE id = ?
      `).bind(existing.id)
    );
  }

  if (!existing || existing.reaction !== reaction) {
    statements.push(
      env.DB.prepare(`
        INSERT INTO reactions (
          id,
          publication_id,
          participant_id,
          reaction,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        randomId("reaction_"),
        publicationId,
        participant.id,
        reaction,
        now()
      ),

      env.DB.prepare(`
        UPDATE publications
        SET
          reaction_${reaction} =
            reaction_${reaction} + 1,
          likes_count =
            likes_count + ?
        WHERE id = ?
      `).bind(
        reaction === "like" ? 1 : 0,
        publicationId
      )
    );
  }

  await env.DB.batch(statements);

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] = session.cookie;
  }

  return json({
    ok: true,
    reaction:
      !existing ||
      existing.reaction !== reaction
        ? reaction
        : null
  }, 200, headers);
}

/* ============================================================
   SAVE
   ============================================================ */

async function savePublication(
  request,
  env,
  publicationId
) {
  const session =
    await ensureParticipant(request, env);

  const participant =
    session.participant;

  const existing =
    await env.DB.prepare(`
      SELECT id
      FROM saves
      WHERE publication_id = ?
        AND participant_id = ?
      LIMIT 1
    `).bind(
      publicationId,
      participant.id
    ).first();

  if (existing) {
    await env.DB.batch([
      env.DB.prepare(`
        DELETE FROM saves
        WHERE id = ?
      `).bind(existing.id),

      env.DB.prepare(`
        UPDATE publications
        SET saves_count =
          CASE
            WHEN saves_count > 0
            THEN saves_count - 1
            ELSE 0
          END
        WHERE id = ?
      `).bind(publicationId)
    ]);
  } else {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO saves (
          id,
          publication_id,
          participant_id,
          created_at
        )
        VALUES (?, ?, ?, ?)
      `).bind(
        randomId("save_"),
        publicationId,
        participant.id,
        now()
      ),

      env.DB.prepare(`
        UPDATE publications
        SET saves_count = saves_count + 1
        WHERE id = ?
      `).bind(publicationId)
    ]);
  }

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] = session.cookie;
  }

  return json({
    ok: true,
    saved: !existing
  }, 200, headers);
}

/* ============================================================
   COMMENTS
   ============================================================ */

async function getComments(publicationId, env) {
  const result = await env.DB.prepare(`
    SELECT
      c.*,
      p.display_name,
      p.username,
      p.avatar_url,
      p.verified
    FROM comments c
    LEFT JOIN participants p
      ON p.id = c.participant_id
    WHERE c.publication_id = ?
      AND c.status = 'published'
      AND c.deleted_at IS NULL
    ORDER BY c.pinned DESC, c.created_at ASC
  `).bind(publicationId).all();

  return json({
    ok: true,
    comments: result.results || []
  });
}

async function addComment(
  request,
  env,
  publicationId
) {
  const data = await body(request);

  const content = clean(
    data.content ??
    data.text ??
    data.message,
    10000
  );

  if (!content) {
    return json({
      ok: false,
      error: "Введите комментарий"
    }, 400);
  }

  const session =
    await ensureParticipant(request, env);

  const participant =
    session.participant;

  const commentId =
    randomId("comment_");

  const created = now();

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO comments (
        id,
        publication_id,
        participant_id,
        parent_id,
        content,
        status,
        pinned,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, 'published', 0, ?, ?)
    `).bind(
      commentId,
      publicationId,
      participant.id,
      clean(data.parent_id, 120) || null,
      content,
      created,
      created
    ),

    env.DB.prepare(`
      UPDATE publications
      SET comments_count =
        comments_count + 1
      WHERE id = ?
    `).bind(publicationId)
  ]);

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] =
      session.cookie;
  }

  return json({
    ok: true,
    comment_id: commentId
  }, 201, headers);
}

/* ============================================================
   REPORT
   ============================================================ */

async function createReport(request, env) {
  const data = await body(request);

  const session =
    await ensureParticipant(request, env);

  const publicationId =
    clean(data.publication_id, 120) || null;

  const commentId =
    clean(data.comment_id, 120) || null;

  const reason =
    clean(data.reason, 300);

  const details =
    clean(data.details, 5000);

  await env.DB.prepare(`
    INSERT INTO reports (
      id,
      publication_id,
      comment_id,
      participant_id,
      reason,
      details,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).bind(
    randomId("report_"),
    publicationId,
    commentId,
    session.participant.id,
    reason || "Другое",
    details || null,
    now(),
    now()
  ).run();

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] =
      session.cookie;
  }

  return json({
    ok: true,
    message: "Жалоба отправлена"
  }, 201, headers);
}

/* ============================================================
   PARTICIPANT PROFILE
   ============================================================ */

async function participantMe(
  request,
  env
) {
  const session =
    await ensureParticipant(request, env);

  const participant =
    session.participant;

  const publications =
    await env.DB.prepare(`
      SELECT *
      FROM publications
      WHERE participant_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(participant.id).all();

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] =
      session.cookie;
  }

  return json({
    ok: true,

    /*
      Технический ID не является
      регистрацией пользователя.
    */
    participant: {
      id: participant.id,
      display_name: participant.display_name,
      username: participant.username,
      avatar_url: participant.avatar_url,
      bio: participant.bio,
      country: participant.country,
      city: participant.city,
      profession: participant.profession,
      website: participant.website,
      verified: !!participant.verified
    },

    publications:
      publications.results || []
  }, 200, headers);
}

/* ============================================================
   PARTICIPANT PROFILE UPDATE
   ============================================================ */

async function updateParticipant(
  request,
  env
) {
  const data = await body(request);

  const session =
    await ensureParticipant(request, env);

  const p =
    session.participant;

  /*
    Это НЕ обязательные поля.
    Пользователь вообще может ими
    не пользоваться.
  */

  const displayName =
    data.display_name !== undefined
      ? clean(data.display_name, 200)
      : p.display_name;

  const username =
    data.username !== undefined
      ? normalizeUsername(data.username)
      : p.username;

  if (username) {
    if (
      !/^@[a-z0-9_.-]{3,50}$/.test(username)
    ) {
      return json({
        ok: false,
        error:
          "Некорректный username"
      }, 400);
    }

    const occupied =
      await env.DB.prepare(`
        SELECT id
        FROM participants
        WHERE username = ?
          AND id != ?
        LIMIT 1
      `).bind(
        username,
        p.id
      ).first();

    if (occupied) {
      return json({
        ok: false,
        error: "Username уже занят"
      }, 409);
    }
  }

  await env.DB.prepare(`
    UPDATE participants
    SET
      display_name = ?,
      username = ?,
      email = ?,
      phone = ?,
      avatar_url = ?,
      bio = ?,
      country = ?,
      city = ?,
      profession = ?,
      website = ?,
      social_links = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    displayName || "Участник",
    username || null,
    clean(data.email, 300) || p.email || null,
    clean(data.phone, 100) || p.phone || null,
    clean(data.avatar_url, 2000) || p.avatar_url || null,
    clean(data.bio, 5000) || p.bio || null,
    clean(data.country, 100) || p.country || null,
    clean(data.city, 100) || p.city || null,
    clean(data.profession, 200) || p.profession || null,
    clean(data.website, 2000) || p.website || null,
    clean(data.social_links, 5000) || p.social_links || null,
    now(),
    p.id
  ).run();

  return json({
    ok: true,
    message: "Профиль обновлён"
  });
}

/* ============================================================
   PARTICIPANT CHAT
   ============================================================ */

async function participantChat(
  request,
  env
) {
  const session =
    await ensureParticipant(request, env);

  const messages =
    await env.DB.prepare(`
      SELECT *
      FROM chat_messages
      WHERE participant_id = ?
      ORDER BY created_at ASC
      LIMIT 500
    `).bind(
      session.participant.id
    ).all();

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] =
      session.cookie;
  }

  return json({
    ok: true,

    official: {
      name: OFFICIAL_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    },

    messages:
      messages.results || []
  }, 200, headers);
}

async function participantSendChat(
  request,
  env
) {
  const data = await body(request);

  const message = clean(
    data.message ??
    data.text ??
    data.content,
    10000
  );

  if (!message) {
    return json({
      ok: false,
      error: "Введите сообщение"
    }, 400);
  }

  const session =
    await ensureParticipant(request, env);

  const publicationId =
    clean(data.publication_id, 120) || null;

  await env.DB.prepare(`
    INSERT INTO chat_messages (
      id,
      participant_id,
      sender_type,
      sender_id,
      message,
      publication_id,
      created_at
    )
    VALUES (?, ?, 'participant', ?, ?, ?, ?)
  `).bind(
    randomId("msg_"),
    session.participant.id,
    session.participant.id,
    message,
    publicationId,
    now()
  ).run();

  const headers = {};

  if (session.cookie) {
    headers["Set-Cookie"] =
      session.cookie;
  }

  return json({
    ok: true,
    message: "Сообщение отправлено"
  }, 201, headers);
}

/* ============================================================
   PARTICIPANT NOTIFICATIONS
   ============================================================ */

async function participantNotifications(
  request,
  env
) {
  const session =
    await ensureParticipant(request, env);

  const result =
    await env.DB.prepare(`
      SELECT *
      FROM notifications
      WHERE participant_id = ?
      ORDER BY created_at DESC
      LIMIT 200
    `).bind(
      session.participant.id
    ).all();

  return json({
    ok: true,
    notifications:
      result.results || []
  });
}

/* ============================================================
   ADMIN AUTH
   ============================================================ */

async function getAdmin(request, env) {
  const token =
    getCookie(request, COOKIE_ADMIN);

  if (!token) {
    return null;
  }

  const hash =
    await sha256(token);

  const row =
    await env.DB.prepare(`
      SELECT *
      FROM admin_sessions
      WHERE token_hash = ?
      LIMIT 1
    `).bind(hash).first();

  if (!row) return null;

  if (
    new Date(row.expires_at) <
    new Date()
  ) {
    return null;
  }

  await env.DB.prepare(`
    UPDATE admin_sessions
    SET last_seen_at = ?
    WHERE id = ?
  `).bind(
    now(),
    row.id
  ).run();

  return row;
}

async function requireAdmin(
  request,
  env
) {
  const admin =
    await getAdmin(request, env);

  if (!admin) {
    return {
      error: json({
        ok: false,
        error: "Требуется авторизация администратора"
      }, 401)
    };
  }

  return {
    admin
  };
}

/* ============================================================
   ADMIN LOGIN
   ============================================================ */

async function adminLogin(
  request,
  env
) {
  const data = await body(request);

  const username =
    clean(data.username, 100);

  const password =
    String(data.password || "");

  if (username !== ADMIN_USERNAME) {
    return json({
      ok: false,
      error: "Неверные данные"
    }, 401);
  }

  if (
    !env.ADMIN_PASSWORD ||
    password !== env.ADMIN_PASSWORD
  ) {
    return json({
      ok: false,
      error: "Неверные данные"
    }, 401);
  }

  const token =
    randomId("admin_");

  const hash =
    await sha256(token);

  const created =
    new Date();

  const expires =
    new Date(
      created.getTime() +
      ADMIN_SESSION_HOURS *
      60 *
      60 *
      1000
    );

  await env.DB.prepare(`
    INSERT INTO admin_sessions (
      id,
      token_hash,
      username,
      created_at,
      expires_at,
      last_seen_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    randomId("as_"),
    hash,
    ADMIN_USERNAME,
    created.toISOString(),
    expires.toISOString(),
    created.toISOString()
  ).run();

  await env.DB.prepare(`
    INSERT INTO audit_log (
      id,
      admin_username,
      action,
      entity_type,
      details,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    randomId("audit_"),
    ADMIN_USERNAME,
    "admin_login",
    "admin",
    "Вход администратора",
    now()
  ).run();

  return json({
    ok: true,
    admin: {
      username: ADMIN_USERNAME,
      role: "super_admin",
      permissions: ["*"]
    }
  }, 200, {
    "Set-Cookie": setCookie(
      COOKIE_ADMIN,
      token,
      {
        maxAge:
          ADMIN_SESSION_HOURS *
          60 *
          60,
        httpOnly: true,
        sameSite: "Strict"
      }
    )
  });
}

async function adminLogout(
  request,
  env
) {
  const token =
    getCookie(request, COOKIE_ADMIN);

  if (token) {
    const hash =
      await sha256(token);

    await env.DB.prepare(`
      DELETE FROM admin_sessions
      WHERE token_hash = ?
    `).bind(hash).run();
  }

  return json({
    ok: true
  }, 200, {
    "Set-Cookie":
      deleteCookie(COOKIE_ADMIN)
  });
}

async function adminMe(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  return json({
    ok: true,
    admin: {
      username: ADMIN_USERNAME,
      role: "super_admin",
      permissions: ["*"],
      official_account: {
        name: OFFICIAL_NAME,
        username: OFFICIAL_USERNAME,
        verified: true
      }
    }
  });
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */

async function adminStats(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const [
    participants,
    publications,
    pending,
    published,
    rejected,
    comments,
    reports,
    unreadMessages,
    notifications,
    views,
    likes,
    saves,
    shares
  ] = await Promise.all([
    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM participants
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE deleted_at IS NULL
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'pending'
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'published'
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM publications
      WHERE status = 'rejected'
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM comments
      WHERE deleted_at IS NULL
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM reports
      WHERE status = 'pending'
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM chat_messages
      WHERE sender_type = 'participant'
        AND read_at IS NULL
    `).first(),

    env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE is_read = 0
    `).first(),

    env.DB.prepare(`
      SELECT COALESCE(SUM(views_count), 0) AS count
      FROM publications
    `).first(),

    env.DB.prepare(`
      SELECT COALESCE(SUM(likes_count), 0) AS count
      FROM publications
    `).first(),

    env.DB.prepare(`
      SELECT COALESCE(SUM(saves_count), 0) AS count
      FROM publications
    `).first(),

    env.DB.prepare(`
      SELECT COALESCE(SUM(shares_count), 0) AS count
      FROM publications
    `).first()
  ]);

  return json({
    ok: true,
    stats: {
      participants: int(participants?.count),
      publications: int(publications?.count),
      pending: int(pending?.count),
      published: int(published?.count),
      rejected: int(rejected?.count),
      comments: int(comments?.count),
      reports: int(reports?.count),
      unread_messages: int(unreadMessages?.count),
      unread_notifications: int(notifications?.count),
      views: int(views?.count),
      likes: int(likes?.count),
      saves: int(saves?.count),
      shares: int(shares?.count)
    }
  });
}

/* ============================================================
   ADMIN PUBLICATIONS
   ============================================================ */

async function adminPublications(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const url =
    new URL(request.url);

  const status =
    clean(url.searchParams.get("status"), 50);

  const search =
    clean(url.searchParams.get("search"), 200);

  const limit =
    Math.min(
      Math.max(
        int(url.searchParams.get("limit"), 100),
        1
      ),
      500
    );

  const offset =
    Math.max(
      int(url.searchParams.get("offset"), 0),
      0
    );

  const where = [];
  const params = [];

  if (status) {
    where.push("p.status = ?");
    params.push(status);
  }

  if (search) {
    where.push(`
      (
        p.title LIKE ?
        OR p.content LIKE ?
        OR p.category LIKE ?
        OR p.city LIKE ?
      )
    `);

    const q = `%${search}%`;

    params.push(q, q, q, q);
  }

  const query = `
    SELECT
      p.*,
      participant.display_name AS participant_name,
      participant.username AS participant_username,
      participant.avatar_url AS participant_avatar
    FROM publications p
    LEFT JOIN participants participant
      ON participant.id = p.participant_id
    ${where.length
      ? "WHERE " + where.join(" AND ")
      : ""}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const result =
    await env.DB
      .prepare(query)
      .bind(...params)
      .all();

  return json({
    ok: true,
    publications:
      result.results || []
  });
}

async function adminPublication(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const publication =
    await env.DB.prepare(`
      SELECT
        p.*,
        participant.display_name AS participant_name,
        participant.username AS participant_username,
        participant.email AS participant_email
      FROM publications p
      LEFT JOIN participants participant
        ON participant.id = p.participant_id
      WHERE p.id = ?
      LIMIT 1
    `).bind(id).first();

  if (!publication) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  const [
    media,
    comments,
    reports,
    reactions
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
        p.display_name,
        p.username
      FROM comments c
      LEFT JOIN participants p
        ON p.id = c.participant_id
      WHERE c.publication_id = ?
      ORDER BY c.created_at DESC
    `).bind(id).all(),

    env.DB.prepare(`
      SELECT *
      FROM reports
      WHERE publication_id = ?
      ORDER BY created_at DESC
    `).bind(id).all(),

    env.DB.prepare(`
      SELECT reaction, COUNT(*) AS count
      FROM reactions
      WHERE publication_id = ?
      GROUP BY reaction
    `).bind(id).all()
  ]);

  return json({
    ok: true,
    publication: {
      ...publication,
      media: media.results || [],
      comments: comments.results || [],
      reports: reports.results || [],
      reactions: reactions.results || []
    }
  });
}

/* ============================================================
   ADMIN EDIT PUBLICATION
   ============================================================ */

async function adminUpdatePublication(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const existing =
    await env.DB.prepare(`
      SELECT *
      FROM publications
      WHERE id = ?
    `).bind(id).first();

  if (!existing) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  const allowedFields = [
    "title",
    "content",
    "category",
    "country",
    "city",
    "location",
    "scope",
    "visibility",
    "event_start",
    "event_end",
    "deadline",
    "price",
    "currency",
    "employment_type",
    "work_format",
    "experience",
    "education",
    "languages",
    "tags",
    "links",
    "featured",
    "pinned",
    "verified",
    "admin_note",
    "payment_amount",
    "payment_currency",
    "payment_status"
  ];

  const sets = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] === undefined) continue;

    if (
      [
        "featured",
        "pinned",
        "verified"
      ].includes(field)
    ) {
      sets.push(`${field} = ?`);
      values.push(bool(data[field]) ? 1 : 0);
      continue;
    }

    if (
      field === "price" ||
      field === "payment_amount"
    ) {
      sets.push(`${field} = ?`);

      const n =
        Number(data[field]);

      values.push(
        Number.isFinite(n)
          ? n
          : 0
      );

      continue;
    }

    sets.push(`${field} = ?`);

    values.push(
      clean(data[field], 30000) || null
    );
  }

  if (!sets.length) {
    return json({
      ok: false,
      error: "Нет изменений"
    }, 400);
  }

  sets.push("updated_at = ?");

  values.push(now());
  values.push(id);

  await env.DB.prepare(`
    UPDATE publications
    SET ${sets.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await writeAudit(
    env,
    check.admin.username,
    "publication_update",
    "publication",
    id,
    data
  );

  return json({
    ok: true,
    message: "Публикация обновлена"
  });
}

/* ============================================================
   ADMIN PUBLICATION ACTION
   ============================================================ */

async function adminPublicationAction(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const action =
    clean(data.action, 50);

  const existing =
    await env.DB.prepare(`
      SELECT *
      FROM publications
      WHERE id = ?
    `).bind(id).first();

  if (!existing) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  let status =
    existing.status;

  let visibility =
    existing.visibility;

  let publishedAt =
    existing.published_at;

  let deletedAt =
    existing.deleted_at;

  switch (action) {

    case "approve":
    case "publish":
      status = "published";
      visibility = "public";
      publishedAt = now();
      deletedAt = null;
      break;

    case "reject":
      status = "rejected";
      visibility = "private";
      break;

    case "archive":
      status = "archived";
      visibility = "private";
      break;

    case "draft":
      status = "draft";
      visibility = "private";
      break;

    case "hide":
      visibility = "private";
      break;

    case "show":
      if (existing.status === "published") {
        visibility = "public";
      }
      break;

    case "delete":
      status = "deleted";
      visibility = "private";
      deletedAt = now();
      break;

    case "restore":
      status = "draft";
      visibility = "private";
      deletedAt = null;
      break;

    case "pin":
      await env.DB.prepare(`
        UPDATE publications
        SET pinned = 1,
            updated_at = ?
        WHERE id = ?
      `).bind(now(), id).run();

      break;

    case "unpin":
      await env.DB.prepare(`
        UPDATE publications
        SET pinned = 0,
            updated_at = ?
        WHERE id = ?
      `).bind(now(), id).run();

      break;

    case "feature":
      await env.DB.prepare(`
        UPDATE publications
        SET featured = 1,
            updated_at = ?
        WHERE id = ?
      `).bind(now(), id).run();

      break;

    case "unfeature":
      await env.DB.prepare(`
        UPDATE publications
        SET featured = 0,
            updated_at = ?
        WHERE id = ?
      `).bind(now(), id).run();

      break;

    default:
      return json({
        ok: false,
        error: "Неизвестное действие"
      }, 400);
  }

  if (
    ![
      "pin",
      "unpin",
      "feature",
      "unfeature"
    ].includes(action)
  ) {
    await env.DB.prepare(`
      UPDATE publications
      SET
        status = ?,
        visibility = ?,
        published_at = ?,
        deleted_at = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      status,
      visibility,
      publishedAt,
      deletedAt,
      now(),
      id
    ).run();
  }

  await writeAudit(
    env,
    check.admin.username,
    `publication_${action}`,
    "publication",
    id,
    {}
  );

  return json({
    ok: true,
    status,
    visibility,
    message:
      action === "approve" ||
      action === "publish"
        ? "Публикация одобрена и опубликована"
        : "Действие выполнено"
  });
}

/* ============================================================
   ADMIN COUNTERS
   ============================================================ */

async function adminCounters(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const fields = [
    "views_count",
    "likes_count",
    "comments_count",
    "shares_count",
    "saves_count",
    "reports_count",
    "reaction_like",
    "reaction_love",
    "reaction_support",
    "reaction_funny",
    "reaction_wow",
    "reaction_sad",
    "reaction_angry"
  ];

  const sets = [];
  const values = [];

  for (const field of fields) {
    if (data[field] === undefined) continue;

    sets.push(`${field} = ?`);

    values.push(
      int(data[field], 0)
    );
  }

  if (!sets.length) {
    return json({
      ok: false,
      error: "Не переданы счётчики"
    }, 400);
  }

  sets.push("updated_at = ?");

  values.push(now());
  values.push(id);

  await env.DB.prepare(`
    UPDATE publications
    SET ${sets.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await writeAudit(
    env,
    check.admin.username,
    "publication_counters_update",
    "publication",
    id,
    data
  );

  return json({
    ok: true,
    message:
      "Счётчики изменены"
  });
}

/* ============================================================
   ADMIN PARTICIPANTS
   ============================================================ */

async function adminParticipants(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const url =
    new URL(request.url);

  const search =
    clean(url.searchParams.get("search"), 200);

  const limit =
    Math.min(
      Math.max(
        int(url.searchParams.get("limit"), 100),
        1
      ),
      500
    );

  const offset =
    Math.max(
      int(url.searchParams.get("offset"), 0),
      0
    );

  let query = `
    SELECT *
    FROM participants
  `;

  const params = [];

  if (search) {
    query += `
      WHERE
        display_name LIKE ?
        OR username LIKE ?
        OR email LIKE ?
        OR city LIKE ?
        OR country LIKE ?
    `;

    const q = `%${search}%`;

    params.push(
      q,
      q,
      q,
      q,
      q
    );
  }

  query += `
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const result =
    await env.DB
      .prepare(query)
      .bind(...params)
      .all();

  return json({
    ok: true,
    participants:
      result.results || []
  });
}

async function adminParticipant(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const participant =
    await env.DB.prepare(`
      SELECT *
      FROM participants
      WHERE id = ?
    `).bind(id).first();

  if (!participant) {
    return json({
      ok: false,
      error: "Участник не найден"
    }, 404);
  }

  const [
    publications,
    messages,
    reports
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
      ORDER BY created_at ASC
    `).bind(id).all(),

    env.DB.prepare(`
      SELECT *
      FROM reports
      WHERE participant_id = ?
      ORDER BY created_at DESC
    `).bind(id).all()
  ]);

  return json({
    ok: true,
    participant: {
      ...participant,
      password: undefined
    },
    publications:
      publications.results || [],
    messages:
      messages.results || [],
    reports:
      reports.results || []
  });
}

async function adminUpdateParticipant(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const allowed = [
    "display_name",
    "username",
    "email",
    "phone",
    "avatar_url",
    "bio",
    "country",
    "city",
    "profession",
    "website",
    "social_links",
    "status",
    "role",
    "verified",
    "blocked"
  ];

  const sets = [];
  const values = [];

  for (const field of allowed) {
    if (data[field] === undefined) continue;

    if (
      field === "verified" ||
      field === "blocked"
    ) {
      sets.push(`${field} = ?`);

      values.push(
        bool(data[field]) ? 1 : 0
      );

      continue;
    }

    if (field === "username") {
      const username =
        normalizeUsername(data[field]);

      if (
        username &&
        !/^@[a-z0-9_.-]{3,50}$/.test(username)
      ) {
        return json({
          ok: false,
          error: "Некорректный username"
        }, 400);
      }

      sets.push("username = ?");
      values.push(username || null);
      continue;
    }

    sets.push(`${field} = ?`);

    values.push(
      clean(data[field], 10000) || null
    );
  }

  if (!sets.length) {
    return json({
      ok: false,
      error: "Нет изменений"
    }, 400);
  }

  sets.push("updated_at = ?");

  values.push(now());
  values.push(id);

  try {
    await env.DB.prepare(`
      UPDATE participants
      SET ${sets.join(", ")}
      WHERE id = ?
    `).bind(...values).run();
  } catch (error) {
    return json({
      ok: false,
      error:
        "Не удалось изменить участника",
      details:
        String(error?.message || error)
    }, 409);
  }

  await writeAudit(
    env,
    check.admin.username,
    "participant_update",
    "participant",
    id,
    data
  );

  return json({
    ok: true,
    message: "Участник обновлён"
  });
}

async function adminDeleteParticipant(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const action =
    clean(data.action, 30) ||
    "deactivate";

  if (action === "delete") {
    await env.DB.prepare(`
      UPDATE participants
      SET
        status = 'deleted',
        blocked = 1,
        updated_at = ?
      WHERE id = ?
    `).bind(now(), id).run();
  } else if (action === "block") {
    await env.DB.prepare(`
      UPDATE participants
      SET
        status = 'blocked',
        blocked = 1,
        updated_at = ?
      WHERE id = ?
    `).bind(now(), id).run();
  } else if (action === "unblock") {
    await env.DB.prepare(`
      UPDATE participants
      SET
        status = 'active',
        blocked = 0,
        updated_at = ?
      WHERE id = ?
    `).bind(now(), id).run();
  } else if (action === "restore") {
    await env.DB.prepare(`
      UPDATE participants
      SET
        status = 'active',
        blocked = 0,
        updated_at = ?
      WHERE id = ?
    `).bind(now(), id).run();
  } else {
    return json({
      ok: false,
      error: "Неизвестное действие"
    }, 400);
  }

  await writeAudit(
    env,
    check.admin.username,
    `participant_${action}`,
    "participant",
    id,
    {}
  );

  return json({
    ok: true,
    message: "Действие выполнено"
  });
}

/* ============================================================
   ADMIN CHAT
   ============================================================ */

async function adminChatList(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const result =
    await env.DB.prepare(`
      SELECT
        p.id,
        p.display_name,
        p.username,
        p.avatar_url,
        p.verified,
        p.created_at,

        (
          SELECT cm.message
          FROM chat_messages cm
          WHERE cm.participant_id = p.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT cm.created_at
          FROM chat_messages cm
          WHERE cm.participant_id = p.id
          ORDER BY cm.created_at DESC
          LIMIT 1
        ) AS last_message_at,

        (
          SELECT COUNT(*)
          FROM chat_messages cm
          WHERE cm.participant_id = p.id
            AND cm.sender_type = 'participant'
            AND cm.read_at IS NULL
        ) AS unread_count

      FROM participants p

      WHERE EXISTS (
        SELECT 1
        FROM chat_messages cm
        WHERE cm.participant_id = p.id
      )

      ORDER BY last_message_at DESC
    `).all();

  return json({
    ok: true,
    chats:
      result.results || []
  });
}

async function adminChatMessages(
  request,
  env,
  participantId
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  await env.DB.prepare(`
    UPDATE chat_messages
    SET read_at = ?
    WHERE participant_id = ?
      AND sender_type = 'participant'
      AND read_at IS NULL
  `).bind(
    now(),
    participantId
  ).run();

  const result =
    await env.DB.prepare(`
      SELECT *
      FROM chat_messages
      WHERE participant_id = ?
      ORDER BY created_at ASC
      LIMIT 1000
    `).bind(participantId).all();

  return json({
    ok: true,

    official: {
      name: OFFICIAL_NAME,
      username: OFFICIAL_USERNAME,
      verified: true
    },

    messages:
      result.results || []
  });
}

async function adminSendChat(
  request,
  env,
  participantId
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const message =
    clean(
      data.message ??
      data.text ??
      data.content,
      10000
    );

  if (!message) {
    return json({
      ok: false,
      error: "Введите сообщение"
    }, 400);
  }

  await env.DB.prepare(`
    INSERT INTO chat_messages (
      id,
      participant_id,
      sender_type,
      sender_id,
      message,
      publication_id,
      created_at
    )
    VALUES (?, ?, 'official', ?, ?, ?, ?)
  `).bind(
    randomId("msg_"),
    participantId,
    OFFICIAL_USERNAME,
    message,
    clean(data.publication_id, 120) || null,
    now()
  ).run();

  await env.DB.prepare(`
    INSERT INTO notifications (
      id,
      participant_id,
      type,
      title,
      message,
      is_read,
      created_at
    )
    VALUES (?, ?, 'official_message', ?, ?, 0, ?)
  `).bind(
    randomId("notif_"),
    participantId,
    OFFICIAL_NAME,
    message,
    now()
  ).run();

  await writeAudit(
    env,
    check.admin.username,
    "chat_message_send",
    "participant",
    participantId,
    {}
  );

  return json({
    ok: true,
    message: "Сообщение отправлено"
  });
}

/* ============================================================
   ADMIN COMMENTS
   ============================================================ */

async function adminComments(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const url =
    new URL(request.url);

  const publicationId =
    clean(
      url.searchParams.get(
        "publication_id"
      ),
      120
    );

  const search =
    clean(
      url.searchParams.get("search"),
      200
    );

  const where = [];
  const params = [];

  if (publicationId) {
    where.push(
      "c.publication_id = ?"
    );

    params.push(publicationId);
  }

  if (search) {
    where.push(
      "c.content LIKE ?"
    );

    params.push(`%${search}%`);
  }

  const result =
    await env.DB.prepare(`
      SELECT
        c.*,
        p.display_name,
        p.username
      FROM comments c
      LEFT JOIN participants p
        ON p.id = c.participant_id
      ${
        where.length
          ? "WHERE " + where.join(" AND ")
          : ""
      }
      ORDER BY c.created_at DESC
      LIMIT 500
    `).bind(...params).all();

  return json({
    ok: true,
    comments:
      result.results || []
  });
}

async function adminUpdateComment(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const sets = [];
  const values = [];

  if (data.content !== undefined) {
    sets.push("content = ?");
    values.push(
      clean(data.content, 10000)
    );
  }

  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(
      clean(data.status, 50)
    );
  }

  if (data.pinned !== undefined) {
    sets.push("pinned = ?");
    values.push(
      bool(data.pinned) ? 1 : 0
    );
  }

  if (data.deleted !== undefined) {
    sets.push("deleted_at = ?");
    values.push(
      bool(data.deleted)
        ? now()
        : null
    );
  }

  if (!sets.length) {
    return json({
      ok: false,
      error: "Нет изменений"
    }, 400);
  }

  sets.push("updated_at = ?");
  values.push(now());
  values.push(id);

  await env.DB.prepare(`
    UPDATE comments
    SET ${sets.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await writeAudit(
    env,
    check.admin.username,
    "comment_update",
    "comment",
    id,
    data
  );

  return json({
    ok: true
  });
}

/* ============================================================
   ADMIN REPORTS
   ============================================================ */

async function adminReports(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const url =
    new URL(request.url);

  const status =
    clean(
      url.searchParams.get("status"),
      50
    );

  const where = [];
  const params = [];

  if (status) {
    where.push("r.status = ?");
    params.push(status);
  }

  const result =
    await env.DB.prepare(`
      SELECT
        r.*,
        p.display_name,
        p.username,
        pub.title AS publication_title
      FROM reports r
      LEFT JOIN participants p
        ON p.id = r.participant_id
      LEFT JOIN publications pub
        ON pub.id = r.publication_id
      ${
        where.length
          ? "WHERE " + where.join(" AND ")
          : ""
      }
      ORDER BY r.created_at DESC
      LIMIT 500
    `).bind(...params).all();

  return json({
    ok: true,
    reports:
      result.results || []
  });
}

async function adminUpdateReport(
  request,
  env,
  id
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const status =
    clean(
      data.status,
      50
    ) || "reviewed";

  const adminNote =
    clean(
      data.admin_note,
      5000
    );

  await env.DB.prepare(`
    UPDATE reports
    SET
      status = ?,
      admin_note = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    status,
    adminNote || null,
    now(),
    id
  ).run();

  await writeAudit(
    env,
    check.admin.username,
    "report_update",
    "report",
    id,
    data
  );

  return json({
    ok: true
  });
}

/* ============================================================
   ADMIN NOTIFICATIONS
   ============================================================ */

async function adminNotifications(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const result =
    await env.DB.prepare(`
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 500
    `).all();

  return json({
    ok: true,
    notifications:
      result.results || []
  });
}

/* ============================================================
   ADMIN AUDIT
   ============================================================ */

async function adminAudit(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

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
  });
}

async function writeAudit(
  env,
  username,
  action,
  entityType,
  entityId,
  details
) {
  await env.DB.prepare(`
    INSERT INTO audit_log (
      id,
      admin_username,
      action,
      entity_type,
      entity_id,
      details,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    randomId("audit_"),
    username,
    action,
    entityType || null,
    entityId || null,
    JSON.stringify(details || {}),
    now()
  ).run();
}

/* ============================================================
   ADMIN SETTINGS
   ============================================================ */

async function adminSettings(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const result =
    await env.DB.prepare(`
      SELECT *
      FROM system_settings
      ORDER BY key ASC
    `).all();

  const settings = {};

  for (const row of result.results || []) {
    settings[row.key] =
      row.value;
  }

  return json({
    ok: true,
    settings
  });
}

async function adminUpdateSettings(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  const data = await body(request);

  const entries =
    Object.entries(data || {});

  const statements = [];

  for (const [key, value] of entries) {
    if (!/^[a-zA-Z0-9_.-]{1,100}$/.test(key)) {
      continue;
    }

    statements.push(
      env.DB.prepare(`
        INSERT INTO system_settings (
          key,
          value,
          updated_at
        )
        VALUES (?, ?, ?)
        ON CONFLICT(key)
        DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `).bind(
        key,
        typeof value === "string"
          ? value
          : JSON.stringify(value),
        now()
      )
    );
  }

  if (statements.length) {
    await env.DB.batch(statements);
  }

  await writeAudit(
    env,
    check.admin.username,
    "settings_update",
    "settings",
    null,
    data
  );

  return json({
    ok: true,
    message: "Настройки сохранены"
  });
}

/* ============================================================
   USERNAME CHECK
   ============================================================ */

async function checkUsername(
  request,
  env
) {
  const url =
    new URL(request.url);

  const username =
    normalizeUsername(
      url.searchParams.get("username")
    );

  if (
    !/^@[a-z0-9_.-]{3,50}$/.test(username)
  ) {
    return json({
      ok: true,
      valid: false,
      available: false
    });
  }

  const existing =
    await env.DB.prepare(`
      SELECT id
      FROM participants
      WHERE username = ?
      LIMIT 1
    `).bind(username).first();

  return json({
    ok: true,
    valid: true,
    available: !existing,
    username
  });
}

/* ============================================================
   ADMIN SYSTEM
   ============================================================ */

async function adminSystem(
  request,
  env
) {
  const check =
    await requireAdmin(request, env);

  if (check.error) return check.error;

  return json({
    ok: true,

    site: {
      name: SITE_NAME,
      official_name: OFFICIAL_NAME,
      official_username: OFFICIAL_USERNAME
    },

    participant_system: {
      registration: false,
      login: false,
      password: false,
      required_name: false,
      required_username: false,
      free_submission: true,
      automatic_technical_identity: true
    },

    moderation: {
      publication_approval: true
    },

    categories: CATEGORIES,

    media_types: MEDIA_TYPES,

    reactions: REACTIONS,

    admin: {
      username: ADMIN_USERNAME,
      role: "super_admin",
      permissions: ["*"]
    }
  });
}

/* ============================================================
   HEALTH
   ============================================================ */

async function health(env) {
  try {
    await env.DB.prepare(`
      SELECT 1 AS ok
    `).first();

    return json({
      ok: true,
      service: SITE_NAME,
      database: "connected",
      time: now()
    });
  } catch (error) {
    return json({
      ok: false,
      database: "error",
      error:
        String(error?.message || error)
    }, 500);
  }
}

/* ============================================================
   ROUTER
   ============================================================ */

async function router(request, env) {
  const url =
    new URL(request.url);

  const path =
    url.pathname.replace(/\/+$/, "") || "/";

  const method =
    request.method.toUpperCase();

  /* OPTIONS */

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(request),
        ...securityHeaders(),
        "Access-Control-Max-Age": "86400"
      }
    });
  }

  /* Health */

  if (
    path === "/api/health" &&
    method === "GET"
  ) {
    return health(env);
  }

  /* ==========================================================
     PUBLIC
     ========================================================== */

  if (
    path === "/api/publications" &&
    method === "GET"
  ) {
    return publicPublications(
      request,
      env
    );
  }

  if (
    path === "/api/publications" &&
    method === "POST"
  ) {
    return createPublication(
      request,
      env
    );
  }

  if (
    path.startsWith("/api/publications/") &&
    method === "GET"
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[2];

    if (
      id &&
      isSafeId(id) &&
      parts.length === 3
    ) {
      return getPublicPublication(
        id,
        env
      );
    }
  }

  if (
    path.startsWith("/api/publications/") &&
    path.endsWith("/react") &&
    method === "POST"
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[2];

    return reactPublication(
      request,
      env,
      id
    );
  }

  if (
    path.startsWith("/api/publications/") &&
    path.endsWith("/save") &&
    method === "POST"
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[2];

    return savePublication(
      request,
      env,
      id
    );
  }

  if (
    path.startsWith("/api/publications/") &&
    path.endsWith("/comments") &&
    method === "GET"
  ) {
    const parts =
      getPathParts(url);

    return getComments(
      parts[2],
      env
    );
  }

  if (
    path.startsWith("/api/publications/") &&
    path.endsWith("/comments") &&
    method === "POST"
  ) {
    const parts =
      getPathParts(url);

    return addComment(
      request,
      env,
      parts[2]
    );
  }

  if (
    path === "/api/reports" &&
    method === "POST"
  ) {
    return createReport(
      request,
      env
    );
  }

  /* ==========================================================
     USER
     ========================================================== */

  if (
    path ===
      "/api/participant/username/check" &&
    method === "GET"
  ) {
    return checkUsername(
      request,
      env
    );
  }

  if (
    path === "/api/participant/me" &&
    method === "GET"
  ) {
    return participantMe(
      request,
      env
    );
  }

  if (
    path === "/api/participant/me" &&
    ["PUT", "PATCH"].includes(method)
  ) {
    return updateParticipant(
      request,
      env
    );
  }

  if (
    path ===
      "/api/participant/publications" &&
    method === "GET"
  ) {
    const session =
      await ensureParticipant(
        request,
        env
      );

    const result =
      await env.DB.prepare(`
        SELECT *
        FROM publications
        WHERE participant_id = ?
        ORDER BY created_at DESC
      `).bind(
        session.participant.id
      ).all();

    const headers = {};

    if (session.cookie) {
      headers["Set-Cookie"] =
        session.cookie;
    }

    return json({
      ok: true,
      publications:
        result.results || []
    }, 200, headers);
  }

  if (
    path === "/api/participant/chat" &&
    method === "GET"
  ) {
    return participantChat(
      request,
      env
    );
  }

  if (
    path === "/api/participant/chat" &&
    method === "POST"
  ) {
    return participantSendChat(
      request,
      env
    );
  }

  if (
    path ===
      "/api/participant/notifications" &&
    method === "GET"
  ) {
    return participantNotifications(
      request,
      env
    );
  }

  /* ==========================================================
     ADMIN AUTH
     ========================================================== */

  if (
    path === "/api/admin/login" &&
    method === "POST"
  ) {
    return adminLogin(
      request,
      env
    );
  }

  if (
    path === "/api/admin/logout" &&
    method === "POST"
  ) {
    return adminLogout(
      request,
      env
    );
  }

  if (
    path === "/api/admin/me" &&
    method === "GET"
  ) {
    return adminMe(
      request,
      env
    );
  }

  /* ==========================================================
     ADMIN DASHBOARD
     ========================================================== */

  if (
    path === "/api/admin/stats" &&
    method === "GET"
  ) {
    return adminStats(
      request,
      env
    );
  }

  if (
    path === "/api/admin/system" &&
    method === "GET"
  ) {
    return adminSystem(
      request,
      env
    );
  }

  /* ==========================================================
     ADMIN PUBLICATIONS
     ========================================================== */

  if (
    path === "/api/admin/publications" &&
    method === "GET"
  ) {
    return adminPublications(
      request,
      env
    );
  }

  if (
    path.startsWith(
      "/api/admin/publications/"
    )
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[3];

    if (
      parts.length === 4 &&
      method === "GET"
    ) {
      return adminPublication(
        request,
        env,
        id
      );
    }

    if (
      parts.length === 4 &&
      ["PUT", "PATCH"].includes(method)
    ) {
      return adminUpdatePublication(
        request,
        env,
        id
      );
    }

    if (
      parts.length === 5 &&
      parts[4] === "action" &&
      method === "POST"
    ) {
      return adminPublicationAction(
        request,
        env,
        id
      );
    }

    if (
      parts.length === 5 &&
      parts[4] === "counters" &&
      method === "POST"
    ) {
      return adminCounters(
        request,
        env,
        id
      );
    }
  }

  /* ==========================================================
     ADMIN PARTICIPANTS
     ========================================================== */

  if (
    path === "/api/admin/participants" &&
    method === "GET"
  ) {
    return adminParticipants(
      request,
      env
    );
  }

  if (
    path.startsWith(
      "/api/admin/participants/"
    )
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[3];

    if (
      parts.length === 4 &&
      method === "GET"
    ) {
      return adminParticipant(
        request,
        env,
        id
      );
    }

    if (
      parts.length === 4 &&
      ["PUT", "PATCH"].includes(method)
    ) {
      return adminUpdateParticipant(
        request,
        env,
        id
      );
    }

    if (
      parts.length === 4 &&
      method === "DELETE"
    ) {
      return adminDeleteParticipant(
        request,
        env,
        id
      );
    }
  }

  /* ==========================================================
     ADMIN CHAT
     ========================================================== */

  if (
    path === "/api/admin/chat" &&
    method === "GET"
  ) {
    return adminChatList(
      request,
      env
    );
  }

  if (
    path.startsWith("/api/admin/chat/")
  ) {
    const parts =
      getPathParts(url);

    const participantId =
      parts[3];

    if (
      parts.length === 5 &&
      parts[4] === "messages" &&
      method === "GET"
    ) {
      return adminChatMessages(
        request,
        env,
        participantId
      );
    }

    if (
      parts.length === 5 &&
      parts[4] === "send" &&
      method === "POST"
    ) {
      return adminSendChat(
        request,
        env,
        participantId
      );
    }
  }

  /* ==========================================================
     ADMIN COMMENTS
     ========================================================== */

  if (
    path === "/api/admin/comments" &&
    method === "GET"
  ) {
    return adminComments(
      request,
      env
    );
  }

  if (
    path.startsWith("/api/admin/comments/")
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[3];

    if (
      parts.length === 4 &&
      ["PUT", "PATCH"].includes(method)
    ) {
      return adminUpdateComment(
        request,
        env,
        id
      );
    }
  }

  /* ==========================================================
     ADMIN REPORTS
     ========================================================== */

  if (
    path === "/api/admin/reports" &&
    method === "GET"
  ) {
    return adminReports(
      request,
      env
    );
  }

  if (
    path.startsWith("/api/admin/reports/")
  ) {
    const parts =
      getPathParts(url);

    const id =
      parts[3];

    if (
      parts.length === 4 &&
      ["PUT", "PATCH"].includes(method)
    ) {
      return adminUpdateReport(
        request,
        env,
        id
      );
    }
  }

  /* ==========================================================
     ADMIN NOTIFICATIONS
     ========================================================== */

  if (
    path === "/api/admin/notifications" &&
    method === "GET"
  ) {
    return adminNotifications(
      request,
      env
    );
  }

  /* ==========================================================
     ADMIN AUDIT
     ========================================================== */

  if (
    path === "/api/admin/audit" &&
    method === "GET"
  ) {
    return adminAudit(
      request,
      env
    );
  }

  /* ==========================================================
     ADMIN SETTINGS
     ========================================================== */

  if (
    path === "/api/admin/settings" &&
    method === "GET"
  ) {
    return adminSettings(
      request,
      env
    );
  }

  if (
    path === "/api/admin/settings" &&
    ["PUT", "PATCH", "POST"].includes(method)
  ) {
    return adminUpdateSettings(
      request,
      env
    );
  }

  return null;
}

/* ============================================================
   MAIN
   ============================================================ */

export default {
  async fetch(request, env) {

    try {

      await ensureDatabase(env);

      const result =
        await router(request, env);

      if (result) {
        const headers =
          new Headers(result.headers);

        const cors =
          corsHeaders(request);

        for (
          const [key, value]
          of Object.entries(cors)
        ) {
          headers.set(key, value);
        }

        return new Response(
          result.body,
          {
            status: result.status,
            headers
          }
        );
      }

      /*
       Если API-маршрут не найден,
       отдаём Assets.
      */

      if (
        request.method === "GET" &&
        env.ASSETS
      ) {
        return env.ASSETS.fetch(
          request
        );
      }

      return json({
        ok: false,
        error: "Маршрут не найден"
      }, 404);

    } catch (error) {

      console.error(error);

      return json({
        ok: false,
        error: "Внутренняя ошибка сервера",
        details:
          env.ENVIRONMENT === "production"
            ? undefined
            : String(
                error?.stack ||
                error?.message ||
                error
              )
      }, 500);
    }
  }
};
