const SITE_NAME = "Tajik Opportunities";
const SITE_USERNAME = "@tajikopportunities";

const SESSION_COOKIE = "to_session";
const ADMIN_COOKIE = "to_admin";

const SESSION_DAYS = 30;

const SECURITY_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cache-control": "no-store"
};

const CATEGORIES = [
  ["jobs", "💼 Работа"],
  ["job_seekers", "🔎 Ищу работу"],
  ["employees", "👔 Ищу сотрудника"],
  ["profiles", "👤 Профили"],
  ["news", "📰 Новости"],
  ["education", "🎓 Образование"],
  ["courses", "📚 Курсы"],
  ["opportunities", "🎁 Возможности"],
  ["announcements", "📢 Объявления"],
  ["services", "🤝 Услуги"],
  ["ideas", "💡 Идеи"],
  ["projects", "🚀 Проекты"],
  ["startups", "🌱 Стартапы"],
  ["events", "📅 Мероприятия"],
  ["competitions", "🏆 Конкурсы"],
  ["grants", "💰 Гранты"],
  ["volunteering", "🤝 Волонтёрство"],
  ["products", "🛍️ Товары"],
  ["business", "🏢 Бизнес"],
  ["it", "💻 IT"],
  ["sport", "⚽ Спорт"],
  ["music", "🎵 Музыка"],
  ["culture", "🎭 Культура"],
  ["travel", "✈️ Путешествия"],
  ["help", "🆘 Помощь"],
  ["other", "➕ Другое"]
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

let databaseReady = null;


/* =========================================================
   MAIN
========================================================= */

export default {
  async fetch(request, env) {
    try {
      await prepareDatabase(env);

      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method.toUpperCase();

      /* ---------------- HEALTH ---------------- */

      if (path === "/api/health") {
        return json({
          ok: true,
          site: SITE_NAME,
          official: true,
          time: new Date().toISOString()
        });
      }

      /* ---------------- AUTH ---------------- */

      if (path === "/api/auth/register" && method === "POST") {
        return register(request, env);
      }

      if (path === "/api/auth/login" && method === "POST") {
        return login(request, env);
      }

      if (path === "/api/auth/logout" && method === "POST") {
        return logout(request, env);
      }

      if (path === "/api/auth/me" && method === "GET") {
        return me(request, env);
      }

      if (path === "/api/username/check" && method === "GET") {
        return usernameCheck(request, env);
      }

      /* ---------------- PROFILE ---------------- */

      if (path === "/api/profile" && method === "GET") {
        return getOwnProfile(request, env);
      }

      if (path === "/api/profile" && method === "PUT") {
        return updateOwnProfile(request, env);
      }

      if (path === "/api/profile/public" && method === "GET") {
        return getPublicProfile(request, env);
      }

      /* ---------------- CATEGORIES ---------------- */

      if (path === "/api/categories" && method === "GET") {
        return json({
          ok: true,
          categories: CATEGORIES.map(([id, name]) => ({
            id,
            name
          }))
        });
      }

      /* ---------------- PUBLICATIONS ---------------- */

      if (path === "/api/publications" && method === "POST") {
        return createPublication(request, env);
      }

      if (path === "/api/publications" && method === "GET") {
        return listPublications(request, env);
      }

      if (
        path.startsWith("/api/publications/") &&
        method === "GET"
      ) {
        const id = path.split("/")[3];

        if (id) {
          return getPublication(request, env, id);
        }
      }

      if (
        path === "/api/publications/view" &&
        method === "POST"
      ) {
        return publicationView(request, env);
      }

      /* ---------------- REACTIONS ---------------- */

      if (
        path === "/api/publications/react" &&
        method === "POST"
      ) {
        return reactPublication(request, env);
      }

      if (
        path === "/api/publications/save" &&
        method === "POST"
      ) {
        return savePublication(request, env);
      }

      if (
        path === "/api/publications/share" &&
        method === "POST"
      ) {
        return sharePublication(request, env);
      }

      /* ---------------- COMMENTS ---------------- */

      if (
        path === "/api/comments" &&
        method === "GET"
      ) {
        return listComments(request, env);
      }

      if (
        path === "/api/comments" &&
        method === "POST"
      ) {
        return createComment(request, env);
      }

      /* ---------------- PRIVATE CHAT ---------------- */

      if (path === "/api/chat" && method === "GET") {
        return userChats(request, env);
      }

      if (
        path === "/api/chat/messages" &&
        method === "GET"
      ) {
        return userMessages(request, env);
      }

      if (
        path === "/api/chat/messages" &&
        method === "POST"
      ) {
        return userSendMessage(request, env);
      }

      if (
        path === "/api/chat/read" &&
        method === "POST"
      ) {
        return userReadMessages(request, env);
      }

      /* ---------------- NOTIFICATIONS ---------------- */

      if (
        path === "/api/notifications" &&
        method === "GET"
      ) {
        return userNotifications(request, env);
      }

      if (
        path === "/api/notifications/read" &&
        method === "POST"
      ) {
        return userReadNotifications(request, env);
      }

      /* ---------------- ADMIN AUTH ---------------- */

      if (
        path === "/api/admin/login" &&
        method === "POST"
      ) {
        return adminLogin(request, env);
      }

      if (
        path === "/api/admin/logout" &&
        method === "POST"
      ) {
        return adminLogout();
      }

      if (
        path === "/api/admin/me" &&
        method === "GET"
      ) {
        return adminMe(request, env);
      }

      /* ---------------- ADMIN DASHBOARD ---------------- */

      if (
        path === "/api/admin/dashboard" &&
        method === "GET"
      ) {
        return adminDashboard(request, env);
      }

      if (
        path === "/api/admin/notifications" &&
        method === "GET"
      ) {
        return adminNotifications(request, env);
      }

      /* ---------------- ADMIN USERS ---------------- */

      if (
        path === "/api/admin/users" &&
        method === "GET"
      ) {
        return adminUsers(request, env);
      }

      if (
        path === "/api/admin/user" &&
        method === "GET"
      ) {
        return adminUser(request, env);
      }

      if (
        path === "/api/admin/user/edit" &&
        method === "POST"
      ) {
        return adminEditUser(request, env);
      }

      if (
        path === "/api/admin/user/action" &&
        method === "POST"
      ) {
        return adminUserAction(request, env);
      }

      /* ---------------- ADMIN PUBLICATIONS ---------------- */

      if (
        path === "/api/admin/publications" &&
        method === "GET"
      ) {
        return adminPublications(request, env);
      }

      if (
        path === "/api/admin/publication/edit" &&
        method === "POST"
      ) {
        return adminEditPublication(request, env);
      }

      if (
        path === "/api/admin/publication/action" &&
        method === "POST"
      ) {
        return adminPublicationAction(request, env);
      }

      if (
        path === "/api/admin/publication/counters" &&
        method === "POST"
      ) {
        return adminEditCounters(request, env);
      }

      /* ---------------- ADMIN CHAT ---------------- */

      if (
        path === "/api/admin/chats" &&
        method === "GET"
      ) {
        return adminChats(request, env);
      }

      if (
        path === "/api/admin/chat/messages" &&
        method === "GET"
      ) {
        return adminChatMessages(request, env);
      }

      if (
        path === "/api/admin/chat/send" &&
        method === "POST"
      ) {
        return adminSendMessage(request, env);
      }

      /* ---------------- ADMIN COMMENTS ---------------- */

      if (
        path === "/api/admin/comments" &&
        method === "GET"
      ) {
        return adminComments(request, env);
      }

      if (
        path === "/api/admin/comment/edit" &&
        method === "POST"
      ) {
        return adminEditComment(request, env);
      }

      if (
        path === "/api/admin/comment/action" &&
        method === "POST"
      ) {
        return adminCommentAction(request, env);
      }

      /* ---------------- ADMIN ORDERS ---------------- */

      if (
        path === "/api/admin/payment" &&
        method === "POST"
      ) {
        return adminPayment(request, env);
      }

      /* ---------------- STATIC ---------------- */

      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);

        if (response.status !== 404) {
          return securityResponse(response);
        }

        const fallback = new Request(
          new URL("/index.html", request.url),
          request
        );

        return securityResponse(
          await env.ASSETS.fetch(fallback)
        );
      }

      return json({
        ok: false,
        error: "Страница не найдена"
      }, 404);

    } catch (error) {
      console.error(error);

      return json({
        ok: false,
        error: "Внутренняя ошибка сервера"
      }, 500);
    }
  }
};


/* =========================================================
   DATABASE
========================================================= */

async function prepareDatabase(env) {
  if (databaseReady) return databaseReady;

  databaseReady = (async () => {
    const db = env.DB;

    const sql = [

      `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,

        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,

        avatar_url TEXT,
        email TEXT,
        phone TEXT,
        birth_date TEXT,
        country TEXT,
        city TEXT,
        bio TEXT,
        profession TEXT,
        education TEXT,
        languages TEXT,
        skills TEXT,
        company TEXT,
        website TEXT,
        social_links TEXT,
        salary TEXT,
        interests TEXT,
        achievements TEXT,

        role TEXT NOT NULL DEFAULT 'user',

        verified INTEGER NOT NULL DEFAULT 0,
        blocked INTEGER NOT NULL DEFAULT 0,
        deleted INTEGER NOT NULL DEFAULT 0,
        private_profile INTEGER NOT NULL DEFAULT 0,

        followers_count INTEGER NOT NULL DEFAULT 0,
        following_count INTEGER NOT NULL DEFAULT 0,
        publications_count INTEGER NOT NULL DEFAULT 0,

        last_seen_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_users_username
      ON users(username)
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_users_name
      ON users(name)
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_users_created
      ON users(created_at)
      `,

      `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_sessions_token
      ON sessions(token_hash)
      `,

      `
      CREATE TABLE IF NOT EXISTS publications (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,

        title TEXT NOT NULL,
        content TEXT,

        category TEXT,
        country TEXT,
        city TEXT,
        location TEXT,
        scope TEXT,

        event_start TEXT,
        event_end TEXT,
        deadline TEXT,

        price TEXT,
        currency TEXT,
        salary TEXT,

        employment_type TEXT,
        work_format TEXT,
        experience TEXT,
        education TEXT,
        languages TEXT,

        tags TEXT,
        links TEXT,

        status TEXT NOT NULL DEFAULT 'pending',
        visibility TEXT NOT NULL DEFAULT 'public',

        views_count INTEGER NOT NULL DEFAULT 0,
        likes_count INTEGER NOT NULL DEFAULT 0,
        comments_count INTEGER NOT NULL DEFAULT 0,
        shares_count INTEGER NOT NULL DEFAULT 0,
        saves_count INTEGER NOT NULL DEFAULT 0,
        reactions_count INTEGER NOT NULL DEFAULT 0,
        reports_count INTEGER NOT NULL DEFAULT 0,

        pinned INTEGER NOT NULL DEFAULT 0,
        featured INTEGER NOT NULL DEFAULT 0,

        published_at TEXT,
        scheduled_at TEXT,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_publications_status
      ON publications(status)
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_publications_author
      ON publications(author_id)
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_publications_category
      ON publications(category)
      `,

      `
      CREATE TABLE IF NOT EXISTS publication_media (
        id TEXT PRIMARY KEY,
        publication_id TEXT NOT NULL,
        media_type TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS publication_orders (
        id TEXT PRIMARY KEY,
        publication_id TEXT NOT NULL,
        submitter_id TEXT NOT NULL,

        price TEXT NOT NULL DEFAULT '0',
        currency TEXT NOT NULL DEFAULT 'TJS',

        status TEXT NOT NULL DEFAULT 'none',

        payment_method TEXT,
        payment_reference TEXT,

        admin_note TEXT,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        paid_at TEXT
      )
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_orders_publication
      ON publication_orders(publication_id)
      `,

      `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,

        sender_type TEXT NOT NULL,
        sender_user_id TEXT,

        receiver_type TEXT NOT NULL,
        receiver_user_id TEXT,

        publication_id TEXT,

        text TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'sent',

        created_at TEXT NOT NULL,
        read_at TEXT
      )
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_messages_sender
      ON messages(sender_user_id, created_at)
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_messages_receiver
      ON messages(receiver_user_id, created_at)
      `,

      `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,

        user_id TEXT NOT NULL,

        type TEXT NOT NULL,
        title TEXT,
        text TEXT,

        publication_id TEXT,
        message_id TEXT,

        read INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL
      )
      `,

      `
      CREATE INDEX IF NOT EXISTS idx_notifications_user
      ON notifications(user_id, created_at)
      `,

      `
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,

        publication_id TEXT NOT NULL,

        user_id TEXT,
        visitor_id TEXT,

        reaction TEXT NOT NULL,

        created_at TEXT NOT NULL
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,

        publication_id TEXT NOT NULL,

        user_id TEXT,
        visitor_id TEXT,

        created_at TEXT NOT NULL
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,

        publication_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        parent_id TEXT,

        text TEXT NOT NULL,

        likes_count INTEGER NOT NULL DEFAULT 0,

        hidden INTEGER NOT NULL DEFAULT 0,
        pinned INTEGER NOT NULL DEFAULT 0,
        deleted INTEGER NOT NULL DEFAULT 0,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS comment_reactions (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL,
        user_id TEXT,
        visitor_id TEXT,
        reaction TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at TEXT NOT NULL,

        UNIQUE(follower_id, following_id)
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,

        reporter_id TEXT,
        publication_id TEXT,
        comment_id TEXT,
        user_id TEXT,

        reason TEXT,

        status TEXT NOT NULL DEFAULT 'open',

        admin_note TEXT,

        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
      `,

      `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,

        admin_id TEXT,

        action TEXT NOT NULL,

        target_type TEXT,
        target_id TEXT,

        details TEXT,

        created_at TEXT NOT NULL
      )
      `
    ];

    for (const statement of sql) {
      await db.prepare(statement).run();
    }
  })();

  return databaseReady;
}


/* =========================================================
   REGISTER
========================================================= */

async function register(request, env) {
  const body = await readJson(request);

  const name = clean(body.name, 100);
  let username = normalizeUsername(body.username);

  /*
   * ВАЖНО:
   * Имя и username обязательны.
   * Страна, город, email, телефон и остальные поля НЕ обязательны.
   */

  if (!name) {
    return json({
      ok: false,
      error: "Введите имя"
    }, 400);
  }

  if (!/^@[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return json({
      ok: false,
      error: "Username должен быть в формате @name"
    }, 400);
  }

  const password = String(body.password || "");

  /*
   * Пароль нужен только технически для безопасного входа.
   * Он никогда не показывается публично.
   */

  if (password.length < 6) {
    return json({
      ok: false,
      error: "Пароль должен содержать минимум 6 символов"
    }, 400);
  }

  const existing = await env.DB
    .prepare(`
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(username)
    .first();

  if (existing) {
    return json({
      ok: false,
      error: "Этот username уже занят"
    }, 409);
  }

  const now = new Date().toISOString();
  const userId = uid("user");

  const passwordHash = await sha256(password);

  await env.DB.prepare(`
    INSERT INTO users (
      id,
      name,
      username,
      password_hash,
      role,
      created_at,
      updated_at,
      last_seen_at
    )
    VALUES (
      ?, ?, ?, ?, 'user', ?, ?, ?
    )
  `).bind(
    userId,
    name,
    username,
    passwordHash,
    now,
    now,
    now
  ).run();

  const token = await createSession(
    env,
    userId
  );

  return json({
    ok: true,

    message: "Профиль создан",

    user: safeUser({
      id: userId,
      name,
      username,
      verified: 0
    })
  }, 201, {
    "Set-Cookie": sessionCookie(token)
  });
}


/* =========================================================
   USERNAME
========================================================= */

async function usernameCheck(request, env) {
  const url = new URL(request.url);

  const username = normalizeUsername(
    url.searchParams.get("username")
  );

  if (!/^@[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return json({
      ok: true,
      username,
      valid: false,
      available: false,
      message: "Username должен быть в формате @name"
    });
  }

  const found = await env.DB
    .prepare(`
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(username)
    .first();

  return json({
    ok: true,
    username,
    valid: true,
    available: !found,
    message: found
      ? "❌ Username уже занят"
      : "✅ Username свободен"
  });
}


/* =========================================================
   LOGIN
========================================================= */

async function login(request, env) {
  const body = await readJson(request);

  const username = normalizeUsername(body.username);
  const password = String(body.password || "");

  const user = await env.DB
    .prepare(`
      SELECT *
      FROM users
      WHERE username = ?
      LIMIT 1
    `)
    .bind(username)
    .first();

  if (!user) {
    return json({
      ok: false,
      error: "Неверный username или пароль"
    }, 401);
  }

  if (Number(user.deleted) === 1) {
    return json({
      ok: false,
      error: "Аккаунт удалён"
    }, 403);
  }

  if (Number(user.blocked) === 1) {
    return json({
      ok: false,
      error: "Аккаунт заблокирован"
    }, 403);
  }

  const hash = await sha256(password);

  if (hash !== user.password_hash) {
    return json({
      ok: false,
      error: "Неверный username или пароль"
    }, 401);
  }

  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE users
    SET last_seen_at = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    now,
    now,
    user.id
  ).run();

  const token = await createSession(
    env,
    user.id
  );

  return json({
    ok: true,
    user: safeUser(user)
  }, 200, {
    "Set-Cookie": sessionCookie(token)
  });
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout(request, env) {
  const token = getCookie(
    request,
    SESSION_COOKIE
  );

  if (token) {
    await env.DB.prepare(`
      DELETE FROM sessions
      WHERE token_hash = ?
    `).bind(
      await sha256(token)
    ).run();
  }

  return json({
    ok: true
  }, 200, {
    "Set-Cookie": deleteCookie(SESSION_COOKIE)
  });
}


/* =========================================================
   CURRENT USER
========================================================= */

async function me(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      authenticated: false
    }, 401);
  }

  return json({
    ok: true,
    authenticated: true,
    user: safeUser(user)
  });
}


/* =========================================================
   PROFILE
========================================================= */

async function getOwnProfile(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  return json({
    ok: true,
    profile: fullProfile(user)
  });
}


async function updateOwnProfile(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  const body = await readJson(request);

  const updates = [];
  const values = [];

  if (body.name !== undefined) {
    const name = clean(body.name, 100);

    if (!name) {
      return json({
        ok: false,
        error: "Имя обязательно"
      }, 400);
    }

    updates.push("name = ?");
    values.push(name);
  }

  if (body.username !== undefined) {
    const username = normalizeUsername(
      body.username
    );

    if (!/^@[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return json({
        ok: false,
        error: "Username должен быть в формате @name"
      }, 400);
    }

    const used = await env.DB
      .prepare(`
        SELECT id
        FROM users
        WHERE username = ?
        AND id != ?
        LIMIT 1
      `)
      .bind(
        username,
        user.id
      )
      .first();

    if (used) {
      return json({
        ok: false,
        error: "Этот username уже занят"
      }, 409);
    }

    updates.push("username = ?");
    values.push(username);
  }

  const optionalFields = [
    "avatar_url",
    "email",
    "phone",
    "birth_date",
    "country",
    "city",
    "bio",
    "profession",
    "education",
    "languages",
    "skills",
    "company",
    "website",
    "social_links",
    "salary",
    "interests",
    "achievements"
  ];

  for (const field of optionalFields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(clean(body[field], 5000));
    }
  }

  if (body.private_profile !== undefined) {
    updates.push("private_profile = ?");
    values.push(body.private_profile ? 1 : 0);
  }

  if (!updates.length) {
    return json({
      ok: true,
      message: "Изменений нет"
    });
  }

  const now = new Date().toISOString();

  updates.push("updated_at = ?");
  values.push(now);
  values.push(user.id);

  await env.DB.prepare(`
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  const updated = await getUser(
    env,
    user.id
  );

  return json({
    ok: true,
    profile: fullProfile(updated)
  });
}


async function getPublicProfile(request, env) {
  const url = new URL(request.url);

  const username = normalizeUsername(
    url.searchParams.get("username")
  );

  const user = await env.DB
    .prepare(`
      SELECT *
      FROM users
      WHERE username = ?
      AND deleted = 0
      LIMIT 1
    `)
    .bind(username)
    .first();

  if (!user) {
    return json({
      ok: false,
      error: "Участник не найден"
    }, 404);
  }

  if (Number(user.private_profile) === 1) {
    return json({
      ok: true,
      profile: {
        name: user.name,
        username: user.username,
        verified: Number(user.verified) === 1
      }
    });
  }

  return json({
    ok: true,
    profile: fullProfile(user, true)
  });
}


/* =========================================================
   CREATE PUBLICATION
========================================================= */

async function createPublication(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Сначала войдите в аккаунт"
    }, 401);
  }

  const body = await readJson(request);

  const title = clean(body.title, 300);

  if (!title) {
    return json({
      ok: false,
      error: "Название публикации обязательно"
    }, 400);
  }

  const publicationId = uid("pub");
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO publications (
      id,
      author_id,
      title,
      content,
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
      ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
      'pending',
      'public',
      ?,?
    )
  `).bind(
    publicationId,
    user.id,
    title,
    clean(body.content, 50000),
    clean(body.category, 100),
    clean(body.country, 100),
    clean(body.city, 100),
    clean(body.location, 500),
    clean(body.scope, 100),
    clean(body.event_start, 100),
    clean(body.event_end, 100),
    clean(body.deadline, 100),
    clean(body.price, 100),
    clean(body.currency, 30),
    clean(body.salary, 100),
    clean(body.employment_type, 200),
    clean(body.work_format, 200),
    clean(body.experience, 300),
    clean(body.education, 300),
    clean(body.languages, 1000),
    clean(body.tags, 3000),
    clean(body.links, 5000),
    now,
    now
  ).run();

  await env.DB.prepare(`
    UPDATE users
    SET publications_count = publications_count + 1,
        updated_at = ?
    WHERE id = ?
  `).bind(
    now,
    user.id
  ).run();

  /*
   * Автоматически создаём уведомление админу
   */

  await addAdminAudit(
    env,
    null,
    "new_publication_submission",
    "publication",
    publicationId,
    JSON.stringify({
      author_id: user.id,
      author_name: user.name,
      author_username: user.username
    })
  );

  /*
   * Медиа только по URL.
   */

  if (Array.isArray(body.media)) {
    let position = 0;

    for (const item of body.media) {
      const mediaUrl = clean(
        item?.url,
        3000
      );

      const mediaType = clean(
        item?.type,
        50
      );

      if (!mediaUrl || !mediaType) {
        continue;
      }

      await env.DB.prepare(`
        INSERT INTO publication_media (
          id,
          publication_id,
          media_type,
          url,
          title,
          sort_order,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        uid("media"),
        publicationId,
        mediaType,
        mediaUrl,
        clean(item?.title, 300),
        position++,
        now
      ).run();
    }
  }

  /*
   * Уведомление участнику.
   */

  await addNotification(
    env,
    user.id,
    "publication_pending",
    "Публикация отправлена",
    "Ваша публикация отправлена на проверку Tajik Opportunities.",
    publicationId
  );

  return json({
    ok: true,
    publication_id: publicationId,
    status: "pending",
    message: "Публикация отправлена на проверку"
  }, 201);
}


/* =========================================================
   PUBLICATIONS LIST
========================================================= */

async function listPublications(request, env) {
  const url = new URL(request.url);

  const q = clean(
    url.searchParams.get("q"),
    300
  );

  const category = clean(
    url.searchParams.get("category"),
    100
  );

  const country = clean(
    url.searchParams.get("country"),
    100
  );

  const city = clean(
    url.searchParams.get("city"),
    100
  );

  let sql = `
    SELECT
      p.*,

      u.name AS author_name,
      u.username AS author_username,
      u.verified AS author_verified

    FROM publications p

    JOIN users u
      ON u.id = p.author_id

    WHERE p.status = 'published'
      AND p.visibility = 'public'
      AND u.deleted = 0
      AND u.blocked = 0
  `;

  const params = [];

  if (category) {
    sql += ` AND p.category = ?`;
    params.push(category);
  }

  if (country) {
    sql += ` AND p.country = ?`;
    params.push(country);
  }

  if (city) {
    sql += ` AND p.city = ?`;
    params.push(city);
  }

  if (q) {
    const search = `%${q}%`;

    sql += `
      AND (
        p.title LIKE ?
        OR p.content LIKE ?
        OR p.tags LIKE ?
        OR u.name LIKE ?
        OR u.username LIKE ?
      )
    `;

    params.push(
      search,
      search,
      search,
      search,
      search
    );
  }

  sql += `
    ORDER BY
      p.pinned DESC,
      p.featured DESC,
      p.published_at DESC,
      p.created_at DESC
    LIMIT 100
  `;

  const result = await env.DB
    .prepare(sql)
    .bind(...params)
    .all();

  return json({
    ok: true,
    publications: result.results || []
  });
}


/* =========================================================
   GET PUBLICATION
========================================================= */

async function getPublication(request, env, id) {
  const publication = await env.DB
    .prepare(`
      SELECT
        p.*,

        u.name AS author_name,
        u.username AS author_username,
        u.verified AS author_verified

      FROM publications p

      JOIN users u
        ON u.id = p.author_id

      WHERE p.id = ?
      LIMIT 1
    `)
    .bind(id)
    .first();

  if (!publication) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  const user = await requireUser(
    request,
    env
  );

  const allowed =
    publication.status === "published" ||
    publication.status === "approved" ||
    user?.role === "admin" ||
    user?.id === publication.author_id;

  if (!allowed) {
    return json({
      ok: false,
      error: "Публикация ещё не опубликована"
    }, 403);
  }

  const media = await env.DB
    .prepare(`
      SELECT *
      FROM publication_media
      WHERE publication_id = ?
      ORDER BY sort_order ASC
    `)
    .bind(id)
    .all();

  return json({
    ok: true,

    publication: {
      ...publication,

      media: media.results || []
    }
  });
}


/* =========================================================
   VIEWS
========================================================= */

async function publicationView(request, env) {
  const body = await readJson(request);

  const id = clean(
    body.publication_id,
    100
  );

  if (!id) {
    return json({
      ok: false,
      error: "publication_id отсутствует"
    }, 400);
  }

  await env.DB.prepare(`
    UPDATE publications
    SET views_count = views_count + 1
    WHERE id = ?
  `).bind(id).run();

  return json({
    ok: true
  });
}


/* =========================================================
   REACTION
========================================================= */

async function reactPublication(request, env) {
  const body = await readJson(request);

  const publicationId = clean(
    body.publication_id,
    100
  );

  const reaction = clean(
    body.reaction,
    30
  );

  if (!REACTIONS.includes(reaction)) {
    return json({
      ok: false,
      error: "Неизвестная реакция"
    }, 400);
  }

  const user = await requireUser(
    request,
    env
  );

  const visitorId = user
    ? null
    : getOrCreateVisitor(request);

  let existing;

  if (user) {
    existing = await env.DB.prepare(`
      SELECT *
      FROM reactions
      WHERE publication_id = ?
      AND user_id = ?
      LIMIT 1
    `).bind(
      publicationId,
      user.id
    ).first();
  } else {
    existing = await env.DB.prepare(`
      SELECT *
      FROM reactions
      WHERE publication_id = ?
      AND visitor_id = ?
      LIMIT 1
    `).bind(
      publicationId,
      visitorId
    ).first();
  }

  if (existing) {
    await env.DB.prepare(`
      DELETE FROM reactions
      WHERE id = ?
    `).bind(existing.id).run();

    await env.DB.prepare(`
      UPDATE publications
      SET reactions_count =
        CASE
          WHEN reactions_count > 0
          THEN reactions_count - 1
          ELSE 0
        END,
        likes_count =
        CASE
          WHEN ? = 'like'
           AND likes_count > 0
          THEN likes_count - 1
          ELSE likes_count
        END
      WHERE id = ?
    `).bind(
      existing.reaction,
      publicationId
    ).run();

    return json({
      ok: true,
      removed: true
    });
  }

  await env.DB.prepare(`
    INSERT INTO reactions (
      id,
      publication_id,
      user_id,
      visitor_id,
      reaction,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    uid("reaction"),
    publicationId,
    user?.id || null,
    visitorId,
    reaction,
    new Date().toISOString()
  ).run();

  await env.DB.prepare(`
    UPDATE publications
    SET reactions_count = reactions_count + 1,
        likes_count =
          CASE
            WHEN ? = 'like'
            THEN likes_count + 1
            ELSE likes_count
          END
    WHERE id = ?
  `).bind(
    reaction,
    publicationId
  ).run();

  return json({
    ok: true,
    reaction
  });
}


/* =========================================================
   SAVE
========================================================= */

async function savePublication(request, env) {
  const body = await readJson(request);

  const publicationId = clean(
    body.publication_id,
    100
  );

  const user = await requireUser(
    request,
    env
  );

  const visitorId = user
    ? null
    : getOrCreateVisitor(request);

  let existing;

  if (user) {
    existing = await env.DB.prepare(`
      SELECT id
      FROM favorites
      WHERE publication_id = ?
      AND user_id = ?
      LIMIT 1
    `).bind(
      publicationId,
      user.id
    ).first();
  } else {
    existing = await env.DB.prepare(`
      SELECT id
      FROM favorites
      WHERE publication_id = ?
      AND visitor_id = ?
      LIMIT 1
    `).bind(
      publicationId,
      visitorId
    ).first();
  }

  if (existing) {
    await env.DB.prepare(`
      DELETE FROM favorites
      WHERE id = ?
    `).bind(existing.id).run();

    await env.DB.prepare(`
      UPDATE publications
      SET saves_count =
        CASE
          WHEN saves_count > 0
          THEN saves_count - 1
          ELSE 0
        END
      WHERE id = ?
    `).bind(publicationId).run();

    return json({
      ok: true,
      saved: false
    });
  }

  await env.DB.prepare(`
    INSERT INTO favorites (
      id,
      publication_id,
      user_id,
      visitor_id,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    uid("save"),
    publicationId,
    user?.id || null,
    visitorId,
    new Date().toISOString()
  ).run();

  await env.DB.prepare(`
    UPDATE publications
    SET saves_count = saves_count + 1
    WHERE id = ?
  `).bind(publicationId).run();

  return json({
    ok: true,
    saved: true
  });
}


/* =========================================================
   SHARE
========================================================= */

async function sharePublication(request, env) {
  const body = await readJson(request);

  const id = clean(
    body.publication_id,
    100
  );

  await env.DB.prepare(`
    UPDATE publications
    SET shares_count = shares_count + 1
    WHERE id = ?
  `).bind(id).run();

  return json({
    ok: true
  });
}


/* =========================================================
   COMMENTS
========================================================= */

async function listComments(request, env) {
  const url = new URL(request.url);

  const publicationId = clean(
    url.searchParams.get("publication_id"),
    100
  );

  const result = await env.DB.prepare(`
    SELECT
      c.*,

      u.name AS author_name,
      u.username AS author_username,
      u.verified AS author_verified

    FROM comments c

    JOIN users u
      ON u.id = c.author_id

    WHERE c.publication_id = ?
      AND c.hidden = 0
      AND c.deleted = 0

    ORDER BY
      c.pinned DESC,
      c.created_at ASC

    LIMIT 500
  `).bind(
    publicationId
  ).all();

  return json({
    ok: true,
    comments: result.results || []
  });
}


async function createComment(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Для комментария необходимо войти"
    }, 401);
  }

  const body = await readJson(request);

  const publicationId = clean(
    body.publication_id,
    100
  );

  const text = clean(
    body.text,
    10000
  );

  if (!text) {
    return json({
      ok: false,
      error: "Комментарий пустой"
    }, 400);
  }

  const now = new Date().toISOString();

  const id = uid("comment");

  await env.DB.prepare(`
    INSERT INTO comments (
      id,
      publication_id,
      author_id,
      parent_id,
      text,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    publicationId,
    user.id,
    clean(body.parent_id, 100),
    text,
    now,
    now
  ).run();

  await env.DB.prepare(`
    UPDATE publications
    SET comments_count = comments_count + 1
    WHERE id = ?
  `).bind(publicationId).run();

  return json({
    ok: true,
    comment_id: id
  }, 201);
}


/* =========================================================
   PRIVATE USER CHAT
========================================================= */

async function userChats(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  const result = await env.DB.prepare(`
    SELECT
      m.id,
      m.text,
      m.status,
      m.publication_id,
      m.created_at,

      CASE
        WHEN m.sender_user_id = ?
        THEN 'user'
        ELSE 'official'
      END AS direction

    FROM messages m

    WHERE
      m.sender_user_id = ?
      OR m.receiver_user_id = ?

    ORDER BY m.created_at DESC

    LIMIT 500
  `).bind(
    user.id,
    user.id,
    user.id
  ).all();

  return json({
    ok: true,

    official: {
      name: SITE_NAME,
      username: SITE_USERNAME,
      verified: true
    },

    messages: result.results || []
  });
}


async function userMessages(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  const url = new URL(request.url);

  const publicationId = clean(
    url.searchParams.get("publication_id"),
    100
  );

  let sql = `
    SELECT *
    FROM messages
    WHERE
      (
        sender_user_id = ?
        OR receiver_user_id = ?
      )
  `;

  const params = [
    user.id,
    user.id
  ];

  if (publicationId) {
    sql += `
      AND publication_id = ?
    `;

    params.push(publicationId);
  }

  sql += `
    ORDER BY created_at ASC
    LIMIT 1000
  `;

  const result = await env.DB
    .prepare(sql)
    .bind(...params)
    .all();

  return json({
    ok: true,

    official: {
      name: SITE_NAME,
      username: SITE_USERNAME,
      verified: true
    },

    messages: result.results || []
  });
}


async function userSendMessage(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  const body = await readJson(request);

  const text = clean(
    body.text,
    10000
  );

  if (!text) {
    return json({
      ok: false,
      error: "Введите сообщение"
    }, 400);
  }

  const now = new Date().toISOString();

  const id = uid("msg");

  await env.DB.prepare(`
    INSERT INTO messages (
      id,

      sender_type,
      sender_user_id,

      receiver_type,
      receiver_user_id,

      publication_id,

      text,
      status,
      created_at
    )
    VALUES (
      ?,
      'user',
      ?,
      'official',
      NULL,
      ?,
      ?,
      'sent',
      ?
    )
  `).bind(
    id,
    user.id,
    clean(body.publication_id, 100),
    text,
    now
  ).run();

  await addAdminAudit(
    env,
    null,
    "new_private_message",
    "user",
    user.id,
    JSON.stringify({
      name: user.name,
      username: user.username,
      message_id: id
    })
  );

  return json({
    ok: true,
    message: {
      id,
      sender_name: user.name,
      sender_username: user.username,
      text,
      created_at: now
    }
  }, 201);
}


async function userReadMessages(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE messages
    SET status = 'read',
        read_at = ?
    WHERE receiver_user_id = ?
      AND status != 'read'
  `).bind(
    now,
    user.id
  ).run();

  return json({
    ok: true
  });
}


/* =========================================================
   USER NOTIFICATIONS
========================================================= */

async function userNotifications(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  const result = await env.DB.prepare(`
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 300
  `).bind(
    user.id
  ).all();

  return json({
    ok: true,
    notifications: result.results || []
  });
}


async function userReadNotifications(request, env) {
  const user = await requireUser(
    request,
    env
  );

  if (!user) {
    return json({
      ok: false,
      error: "Необходимо войти"
    }, 401);
  }

  await env.DB.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE user_id = ?
  `).bind(user.id).run();

  return json({
    ok: true
  });
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

async function adminLogin(request, env) {
  const body = await readJson(request);

  if (!env.ADMIN_PASSWORD) {
    return json({
      ok: false,
      error: "ADMIN_PASSWORD не установлен в Worker Secret"
    }, 500);
  }

  if (
    String(body.password || "") !==
    String(env.ADMIN_PASSWORD)
  ) {
    return json({
      ok: false,
      error: "Неверный пароль"
    }, 401);
  }

  const token =
    crypto.randomUUID() +
    "." +
    crypto.randomUUID();

  return json({
    ok: true,
    profile: {
      name: SITE_NAME,
      username: SITE_USERNAME,
      verified: true
    }
  }, 200, {
    "Set-Cookie":
      adminCookie(token)
  });
}


async function adminLogout() {
  return json({
    ok: true
  }, 200, {
    "Set-Cookie":
      deleteCookie(ADMIN_COOKIE)
  });
}


async function adminMe(request, env) {
  if (!(await isAdmin(request, env))) {
    return json({
      ok: false,
      authenticated: false
    }, 401);
  }

  return json({
    ok: true,

    authenticated: true,

    profile: {
      name: SITE_NAME,
      username: SITE_USERNAME,
      verified: true
    }
  });
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

async function adminDashboard(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const [
    total,
    active,
    blocked,
    deleted,
    today,
    pending,
    published,
    hidden,
    rejected,
    views,
    reactions,
    comments,
    shares,
    saves,
    messages,
    unreadMessages
  ] = await Promise.all([

    count(env, `
      SELECT COUNT(*) AS n
      FROM users
      WHERE deleted = 0
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM users
      WHERE deleted = 0
      AND blocked = 0
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM users
      WHERE blocked = 1
      AND deleted = 0
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM users
      WHERE deleted = 1
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM users
      WHERE created_at >= date('now')
      AND deleted = 0
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM publications
      WHERE status = 'pending'
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM publications
      WHERE status = 'published'
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM publications
      WHERE status = 'hidden'
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM publications
      WHERE status = 'rejected'
    `),

    sum(env, `
      SELECT COALESCE(SUM(views_count),0) AS n
      FROM publications
    `),

    sum(env, `
      SELECT COALESCE(SUM(reactions_count),0) AS n
      FROM publications
    `),

    sum(env, `
      SELECT COALESCE(SUM(comments_count),0) AS n
      FROM publications
    `),

    sum(env, `
      SELECT COALESCE(SUM(shares_count),0) AS n
      FROM publications
    `),

    sum(env, `
      SELECT COALESCE(SUM(saves_count),0) AS n
      FROM publications
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM messages
    `),

    count(env, `
      SELECT COUNT(*) AS n
      FROM messages
      WHERE sender_type = 'user'
      AND status != 'read'
    `)
  ]);

  return json({
    ok: true,

    users: {
      total,
      active,
      blocked,
      deleted,
      today
    },

    publications: {
      pending,
      published,
      hidden,
      rejected
    },

    engagement: {
      views,
      reactions,
      comments,
      shares,
      saves
    },

    messages: {
      total: messages,
      unread: unreadMessages
    }
  });
}


/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

async function adminNotifications(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const pending = await env.DB.prepare(`
    SELECT
      p.*,

      u.name AS author_name,
      u.username AS author_username,
      u.email AS author_email,
      u.phone AS author_phone

    FROM publications p

    JOIN users u
      ON u.id = p.author_id

    WHERE p.status IN (
      'pending',
      'waiting_payment',
      'paid'
    )

    ORDER BY p.created_at DESC

    LIMIT 500
  `).all();

  const newUsers = await env.DB.prepare(`
    SELECT
      id,
      name,
      username,
      created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 100
  `).all();

  const unreadChats = await env.DB.prepare(`
    SELECT
      COUNT(*) AS n
    FROM messages
    WHERE sender_type = 'user'
      AND status != 'read'
  `).first();

  return json({
    ok: true,

    sections: {
      pending_publications:
        pending.results || [],

      new_users:
        newUsers.results || [],

      unread_messages:
        Number(unreadChats?.n || 0)
    }
  });
}


/* =========================================================
   ADMIN USERS
========================================================= */

async function adminUsers(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const url = new URL(request.url);

  const q = clean(
    url.searchParams.get("q"),
    300
  );

  const status = clean(
    url.searchParams.get("status"),
    50
  );

  let sql = `
    SELECT
      id,
      name,
      username,

      avatar_url,
      email,
      phone,
      birth_date,
      country,
      city,
      bio,
      profession,
      education,
      languages,
      skills,
      company,
      website,
      social_links,
      salary,
      interests,
      achievements,

      role,
      verified,
      blocked,
      deleted,
      private_profile,

      followers_count,
      following_count,
      publications_count,

      last_seen_at,
      created_at,
      updated_at

    FROM users

    WHERE 1 = 1
  `;

  const params = [];

  if (q) {
    const search = `%${q}%`;

    sql += `
      AND (
        name LIKE ?
        OR username LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    `;

    params.push(
      search,
      search,
      search,
      search
    );
  }

  if (status === "active") {
    sql += `
      AND blocked = 0
      AND deleted = 0
    `;
  }

  if (status === "blocked") {
    sql += `
      AND blocked = 1
    `;
  }

  if (status === "deleted") {
    sql += `
      AND deleted = 1
    `;
  }

  sql += `
    ORDER BY created_at DESC
    LIMIT 1000
  `;

  const result = await env.DB
    .prepare(sql)
    .bind(...params)
    .all();

  return json({
    ok: true,
    users: result.results || []
  });
}


async function adminUser(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const url = new URL(request.url);

  const id = clean(
    url.searchParams.get("id"),
    100
  );

  const user = await getUser(
    env,
    id
  );

  if (!user) {
    return json({
      ok: false,
      error: "Участник не найден"
    }, 404);
  }

  const publications = await env.DB.prepare(`
    SELECT *
    FROM publications
    WHERE author_id = ?
    ORDER BY created_at DESC
    LIMIT 500
  `).bind(id).all();

  return json({
    ok: true,

    user: fullProfile(user),

    publications:
      publications.results || []
  });
}


async function adminEditUser(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  if (!id) {
    return json({
      ok: false,
      error: "ID участника отсутствует"
    }, 400);
  }

  const updates = [];
  const values = [];

  const fields = [
    "name",
    "avatar_url",
    "email",
    "phone",
    "birth_date",
    "country",
    "city",
    "bio",
    "profession",
    "education",
    "languages",
    "skills",
    "company",
    "website",
    "social_links",
    "salary",
    "interests",
    "achievements"
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(clean(body[field], 10000));
    }
  }

  if (body.username !== undefined) {
    const username = normalizeUsername(
      body.username
    );

    const duplicate = await env.DB.prepare(`
      SELECT id
      FROM users
      WHERE username = ?
      AND id != ?
      LIMIT 1
    `).bind(
      username,
      id
    ).first();

    if (duplicate) {
      return json({
        ok: false,
        error: "Этот username уже занят"
      }, 409);
    }

    updates.push("username = ?");
    values.push(username);
  }

  if (body.role !== undefined) {
    const roles = [
      "user",
      "moderator",
      "editor",
      "manager",
      "admin"
    ];

    if (!roles.includes(body.role)) {
      return json({
        ok: false,
        error: "Недопустимая роль"
      }, 400);
    }

    updates.push("role = ?");
    values.push(body.role);
  }

  const numeric = [
    "verified",
    "blocked",
    "deleted",
    "private_profile",
    "followers_count",
    "following_count",
    "publications_count"
  ];

  for (const field of numeric) {
    if (body[field] !== undefined) {
      let value = Number(body[field]);

      if (!Number.isFinite(value)) {
        value = 0;
      }

      if (
        [
          "verified",
          "blocked",
          "deleted",
          "private_profile"
        ].includes(field)
      ) {
        value = value ? 1 : 0;
      } else {
        value = Math.max(
          0,
          Math.floor(value)
        );
      }

      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (!updates.length) {
    return json({
      ok: true,
      message: "Изменений нет"
    });
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await env.DB.prepare(`
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await addAdminAudit(
    env,
    null,
    "edit_user",
    "user",
    id,
    JSON.stringify(body)
  );

  return json({
    ok: true,
    user: fullProfile(
      await getUser(env, id)
    )
  });
}


/* =========================================================
   ADMIN USER ACTION
========================================================= */

async function adminUserAction(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  const action = clean(
    body.action,
    100
  );

  const now = new Date().toISOString();

  if (action === "block") {
    await env.DB.prepare(`
      UPDATE users
      SET blocked = 1,
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "unblock") {
    await env.DB.prepare(`
      UPDATE users
      SET blocked = 0,
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "verify") {
    await env.DB.prepare(`
      UPDATE users
      SET verified = 1,
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "unverify") {
    await env.DB.prepare(`
      UPDATE users
      SET verified = 0,
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "delete") {
    await env.DB.prepare(`
      UPDATE users
      SET deleted = 1,
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "restore") {
    await env.DB.prepare(`
      UPDATE users
      SET deleted = 0,
          blocked = 0,
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "make_moderator") {
    await env.DB.prepare(`
      UPDATE users
      SET role = 'moderator',
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "make_editor") {
    await env.DB.prepare(`
      UPDATE users
      SET role = 'editor',
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "make_manager") {
    await env.DB.prepare(`
      UPDATE users
      SET role = 'manager',
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else if (action === "make_user") {
    await env.DB.prepare(`
      UPDATE users
      SET role = 'user',
          updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();
  }

  else {
    return json({
      ok: false,
      error: "Неизвестное действие"
    }, 400);
  }

  await addAdminAudit(
    env,
    null,
    `user_${action}`,
    "user",
    id,
    ""
  );

  return json({
    ok: true
  });
}


/* =========================================================
   ADMIN PUBLICATIONS
========================================================= */

async function adminPublications(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const url = new URL(request.url);

  const q = clean(
    url.searchParams.get("q"),
    300
  );

  const status = clean(
    url.searchParams.get("status"),
    100
  );

  const category = clean(
    url.searchParams.get("category"),
    100
  );

  const country = clean(
    url.searchParams.get("country"),
    100
  );

  const city = clean(
    url.searchParams.get("city"),
    100
  );

  let sql = `
    SELECT
      p.*,

      u.name AS author_name,
      u.username AS author_username,
      u.email AS author_email,
      u.phone AS author_phone,
      u.verified AS author_verified

    FROM publications p

    JOIN users u
      ON u.id = p.author_id

    WHERE 1 = 1
  `;

  const params = [];

  if (status) {
    sql += ` AND p.status = ?`;
    params.push(status);
  }

  if (category) {
    sql += ` AND p.category = ?`;
    params.push(category);
  }

  if (country) {
    sql += ` AND p.country = ?`;
    params.push(country);
  }

  if (city) {
    sql += ` AND p.city = ?`;
    params.push(city);
  }

  if (q) {
    const search = `%${q}%`;

    sql += `
      AND (
        p.title LIKE ?
        OR p.content LIKE ?
        OR u.name LIKE ?
        OR u.username LIKE ?
      )
    `;

    params.push(
      search,
      search,
      search,
      search
    );
  }

  sql += `
    ORDER BY p.created_at DESC
    LIMIT 1000
  `;

  const result = await env.DB
    .prepare(sql)
    .bind(...params)
    .all();

  return json({
    ok: true,
    publications: result.results || []
  });
}


/* =========================================================
   ADMIN EDIT PUBLICATION
========================================================= */

async function adminEditPublication(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  const fields = [
    "title",
    "content",
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
    "visibility",
    "published_at",
    "scheduled_at"
  ];

  const updates = [];
  const values = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(clean(body[field], 50000));
    }
  }

  if (body.author_id !== undefined) {
    updates.push("author_id = ?");
    values.push(clean(body.author_id, 100));
  }

  if (body.status !== undefined) {
    updates.push("status = ?");
    values.push(clean(body.status, 50));
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "Нет изменений"
    }, 400);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());

  values.push(id);

  await env.DB.prepare(`
    UPDATE publications
    SET ${updates.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await addAdminAudit(
    env,
    null,
    "edit_publication",
    "publication",
    id,
    JSON.stringify(body)
  );

  return json({
    ok: true
  });
}


/* =========================================================
   ADMIN PUBLICATION ACTIONS
========================================================= */

async function adminPublicationAction(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  const action = clean(
    body.action,
    100
  );

  const now = new Date().toISOString();

  const publication = await env.DB.prepare(`
    SELECT *
    FROM publications
    WHERE id = ?
    LIMIT 1
  `).bind(id).first();

  if (!publication) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  let status = null;

  if (action === "approve_free") {
    status = "published";
  }

  else if (action === "request_payment") {
    status = "waiting_payment";
  }

  else if (action === "payment_received") {
    status = "paid";
  }

  else if (action === "publish") {
    status = "published";
  }

  else if (action === "reject") {
    status = "rejected";
  }

  else if (action === "hide") {
    status = "hidden";
  }

  else if (action === "restore") {
    status = "pending";
  }

  else if (action === "delete") {
    status = "deleted";
  }

  else if (action === "pin") {
    await env.DB.prepare(`
      UPDATE publications
      SET pinned =
        CASE
          WHEN pinned = 1 THEN 0
          ELSE 1
        END,
        updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();

    return json({
      ok: true
    });
  }

  else if (action === "feature") {
    await env.DB.prepare(`
      UPDATE publications
      SET featured =
        CASE
          WHEN featured = 1 THEN 0
          ELSE 1
        END,
        updated_at = ?
      WHERE id = ?
    `).bind(
      now,
      id
    ).run();

    return json({
      ok: true
    });
  }

  else {
    return json({
      ok: false,
      error: "Неизвестное действие"
    }, 400);
  }

  await env.DB.prepare(`
    UPDATE publications
    SET
      status = ?,
      published_at =
        CASE
          WHEN ? = 'published'
          THEN COALESCE(published_at, ?)
          ELSE published_at
        END,
      updated_at = ?
    WHERE id = ?
  `).bind(
    status,
    status,
    now,
    now,
    id
  ).run();

  /*
   * Если админ назначил оплату,
   * создаём/обновляем индивидуальное условие.
   */

  if (action === "request_payment") {
    const price = clean(
      body.price,
      100
    ) || "0";

    const currency = clean(
      body.currency,
      30
    ) || "TJS";

    const existingOrder =
      await env.DB.prepare(`
        SELECT id
        FROM publication_orders
        WHERE publication_id = ?
        LIMIT 1
      `).bind(id).first();

    if (existingOrder) {
      await env.DB.prepare(`
        UPDATE publication_orders
        SET price = ?,
            currency = ?,
            status = 'requested',
            admin_note = ?,
            updated_at = ?
        WHERE publication_id = ?
      `).bind(
        price,
        currency,
        clean(body.admin_note, 5000),
        now,
        id
      ).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO publication_orders (
          id,
          publication_id,
          submitter_id,
          price,
          currency,
          status,
          admin_note,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'requested', ?, ?, ?)
      `).bind(
        uid("order"),
        id,
        publication.author_id,
        price,
        currency,
        clean(body.admin_note, 5000),
        now,
        now
      ).run();
    }

    /*
     * Участнику приходит уведомление.
     * Само личное сообщение отправляется через
     * официальный аккаунт сайта.
     */

    await addNotification(
      env,
      publication.author_id,
      "publication_payment",
      "Tajik Opportunities",
      clean(body.message, 10000) ||
        `Для публикации необходимо выполнить указанные условия. Сумма: ${price} ${currency}.`,
      id
    );

    await sendOfficialMessage(
      env,
      publication.author_id,
      clean(body.message, 10000) ||
        `Здравствуйте! Для публикации необходимо выполнить указанные условия. Сумма: ${price} ${currency}.`,
      id
    );
  }

  if (action === "payment_received") {
    await env.DB.prepare(`
      UPDATE publication_orders
      SET status = 'paid',
          paid_at = ?,
          updated_at = ?
      WHERE publication_id = ?
    `).bind(
      now,
      now,
      id
    ).run();

    await sendOfficialMessage(
      env,
      publication.author_id,
      "Оплата подтверждена. Ваша публикация может быть опубликована после окончательного решения модератора.",
      id
    );
  }

  if (action === "publish") {
    await sendOfficialMessage(
      env,
      publication.author_id,
      "Ваша публикация одобрена и опубликована на Tajik Opportunities.",
      id
    );
  }

  if (action === "reject") {
    await sendOfficialMessage(
      env,
      publication.author_id,
      clean(body.message, 10000) ||
        "Ваша публикация не была одобрена.",
      id
    );
  }

  await addAdminAudit(
    env,
    null,
    `publication_${action}`,
    "publication",
    id,
    JSON.stringify(body)
  );

  return json({
    ok: true,
    status
  });
}


/* =========================================================
   ADMIN COUNTERS
========================================================= */

async function adminEditCounters(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  const counters = [
    "views_count",
    "likes_count",
    "comments_count",
    "shares_count",
    "saves_count",
    "reactions_count",
    "reports_count"
  ];

  const updates = [];
  const values = [];

  for (const field of counters) {
    if (body[field] !== undefined) {
      let value = Number(body[field]);

      if (!Number.isFinite(value)) {
        value = 0;
      }

      value = Math.max(
        0,
        Math.floor(value)
      );

      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "Нет счётчиков"
    }, 400);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await env.DB.prepare(`
    UPDATE publications
    SET ${updates.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await addAdminAudit(
    env,
    null,
    "edit_publication_counters",
    "publication",
    id,
    JSON.stringify(body)
  );

  return json({
    ok: true
  });
}


/* =========================================================
   ADMIN CHATS
========================================================= */

async function adminChats(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const result = await env.DB.prepare(`
    SELECT
      u.id,
      u.name,
      u.username,
      u.avatar_url,
      u.verified,

      (
        SELECT m.text
        FROM messages m
        WHERE
          m.sender_user_id = u.id
          OR m.receiver_user_id = u.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,

      (
        SELECT m.created_at
        FROM messages m
        WHERE
          m.sender_user_id = u.id
          OR m.receiver_user_id = u.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message_at,

      (
        SELECT COUNT(*)
        FROM messages m
        WHERE
          m.sender_user_id = u.id
          AND m.status != 'read'
      ) AS unread_count

    FROM users u

    WHERE EXISTS (
      SELECT 1
      FROM messages m
      WHERE
        m.sender_user_id = u.id
        OR m.receiver_user_id = u.id
    )

    ORDER BY last_message_at DESC

    LIMIT 1000
  `).all();

  return json({
    ok: true,

    official: {
      name: SITE_NAME,
      username: SITE_USERNAME,
      verified: true
    },

    chats: result.results || []
  });
}


async function adminChatMessages(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const url = new URL(request.url);

  const userId = clean(
    url.searchParams.get("user_id"),
    100
  );

  if (!userId) {
    return json({
      ok: false,
      error: "user_id отсутствует"
    }, 400);
  }

  const user = await getUser(
    env,
    userId
  );

  if (!user) {
    return json({
      ok: false,
      error: "Участник не найден"
    }, 404);
  }

  const result = await env.DB.prepare(`
    SELECT *
    FROM messages
    WHERE
      sender_user_id = ?
      OR receiver_user_id = ?
    ORDER BY created_at ASC
    LIMIT 2000
  `).bind(
    userId,
    userId
  ).all();

  /*
   * Администратор открыл чат —
   * сообщения пользователя считаются прочитанными.
   */

  await env.DB.prepare(`
    UPDATE messages
    SET status = 'read',
        read_at = ?
    WHERE sender_user_id = ?
      AND status != 'read'
  `).bind(
    new Date().toISOString(),
    userId
  ).run();

  return json({
    ok: true,

    participant: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url,
      verified: Number(user.verified) === 1
    },

    official: {
      name: SITE_NAME,
      username: SITE_USERNAME,
      verified: true
    },

    messages: result.results || []
  });
}


async function adminSendMessage(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const userId = clean(
    body.user_id,
    100
  );

  const text = clean(
    body.text,
    10000
  );

  if (!userId || !text) {
    return json({
      ok: false,
      error: "Укажите участника и сообщение"
    }, 400);
  }

  const user = await getUser(
    env,
    userId
  );

  if (!user) {
    return json({
      ok: false,
      error: "Участник не найден"
    }, 404);
  }

  const now = new Date().toISOString();

  const messageId = uid("msg");

  await env.DB.prepare(`
    INSERT INTO messages (
      id,

      sender_type,
      sender_user_id,

      receiver_type,
      receiver_user_id,

      publication_id,

      text,
      status,
      created_at
    )
    VALUES (
      ?,
      'official',
      NULL,
      'user',
      ?,
      ?,
      ?,
      'sent',
      ?
    )
  `).bind(
    messageId,
    userId,
    clean(body.publication_id, 100),
    text,
    now
  ).run();

  await addNotification(
    env,
    userId,
    "official_message",
    SITE_NAME,
    text,
    clean(body.publication_id, 100)
  );

  await addAdminAudit(
    env,
    null,
    "official_message_sent",
    "user",
    userId,
    JSON.stringify({
      message_id: messageId,
      publication_id:
        clean(body.publication_id, 100)
    })
  );

  return json({
    ok: true,

    message: {
      id: messageId,
      sender_type: "official",
      sender_name: SITE_NAME,
      sender_username: SITE_USERNAME,
      verified: true,
      text,
      created_at: now
    }
  }, 201);
}


/* =========================================================
   ADMIN COMMENTS
========================================================= */

async function adminComments(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const url = new URL(request.url);

  const q = clean(
    url.searchParams.get("q"),
    300
  );

  let sql = `
    SELECT
      c.*,

      u.name AS author_name,
      u.username AS author_username,

      p.title AS publication_title

    FROM comments c

    JOIN users u
      ON u.id = c.author_id

    JOIN publications p
      ON p.id = c.publication_id

    WHERE 1 = 1
  `;

  const params = [];

  if (q) {
    const search = `%${q}%`;

    sql += `
      AND (
        c.text LIKE ?
        OR u.name LIKE ?
        OR u.username LIKE ?
        OR p.title LIKE ?
      )
    `;

    params.push(
      search,
      search,
      search,
      search
    );
  }

  sql += `
    ORDER BY c.created_at DESC
    LIMIT 1000
  `;

  const result = await env.DB
    .prepare(sql)
    .bind(...params)
    .all();

  return json({
    ok: true,
    comments: result.results || []
  });
}


async function adminEditComment(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  const updates = [];
  const values = [];

  if (body.text !== undefined) {
    updates.push("text = ?");
    values.push(clean(body.text, 10000));
  }

  if (body.likes_count !== undefined) {
    let n = Number(body.likes_count);

    if (!Number.isFinite(n)) n = 0;

    updates.push("likes_count = ?");
    values.push(Math.max(0, Math.floor(n)));
  }

  if (!updates.length) {
    return json({
      ok: false,
      error: "Нет изменений"
    }, 400);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await env.DB.prepare(`
    UPDATE comments
    SET ${updates.join(", ")}
    WHERE id = ?
  `).bind(...values).run();

  await addAdminAudit(
    env,
    null,
    "edit_comment",
    "comment",
    id,
    JSON.stringify(body)
  );

  return json({
    ok: true
  });
}


async function adminCommentAction(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const id = clean(
    body.id,
    100
  );

  const action = clean(
    body.action,
    100
  );

  if (action === "hide") {
    await env.DB.prepare(`
      UPDATE comments
      SET hidden = 1,
          updated_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      id
    ).run();
  }

  else if (action === "show") {
    await env.DB.prepare(`
      UPDATE comments
      SET hidden = 0,
          updated_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      id
    ).run();
  }

  else if (action === "delete") {
    await env.DB.prepare(`
      UPDATE comments
      SET deleted = 1,
          updated_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      id
    ).run();
  }

  else if (action === "pin") {
    await env.DB.prepare(`
      UPDATE comments
      SET pinned =
        CASE
          WHEN pinned = 1 THEN 0
          ELSE 1
        END,
        updated_at = ?
      WHERE id = ?
    `).bind(
      new Date().toISOString(),
      id
    ).run();
  }

  else {
    return json({
      ok: false,
      error: "Неизвестное действие"
    }, 400);
  }

  await addAdminAudit(
    env,
    null,
    `comment_${action}`,
    "comment",
    id,
    ""
  );

  return json({
    ok: true
  });
}


/* =========================================================
   ADMIN PAYMENT / INDIVIDUAL PRICE
========================================================= */

async function adminPayment(request, env) {
  if (!(await isAdmin(request, env))) {
    return forbidden();
  }

  const body = await readJson(request);

  const publicationId = clean(
    body.publication_id,
    100
  );

  const publication = await env.DB
    .prepare(`
      SELECT *
      FROM publications
      WHERE id = ?
      LIMIT 1
    `)
    .bind(publicationId)
    .first();

  if (!publication) {
    return json({
      ok: false,
      error: "Публикация не найдена"
    }, 404);
  }

  const price = clean(
    body.price,
    100
  ) || "0";

  const currency = clean(
    body.currency,
    30
  ) || "TJS";

  const status = clean(
    body.status,
    50
  ) || "requested";

  const now = new Date().toISOString();

  const existing = await env.DB
    .prepare(`
      SELECT id
      FROM publication_orders
      WHERE publication_id = ?
      LIMIT 1
    `)
    .bind(publicationId)
    .first();

  if (existing) {
    await env.DB.prepare(`
      UPDATE publication_orders
      SET price = ?,
          currency = ?,
          status = ?,
          payment_method = ?,
          payment_reference = ?,
          admin_note = ?,
          updated_at = ?,
          paid_at =
            CASE
              WHEN ? = 'paid'
              THEN COALESCE(paid_at, ?)
              ELSE paid_at
            END
      WHERE publication_id = ?
    `).bind(
      price,
      currency,
      status,
      clean(body.payment_method, 100),
      clean(body.payment_reference, 500),
      clean(body.admin_note, 5000),
      now,
      status,
      now,
      publicationId
    ).run();
  } else {
    await env.DB.prepare(`
      INSERT INTO publication_orders (
        id,
        publication_id,
        submitter_id,
        price,
        currency,
        status,
        payment_method,
        payment_reference,
        admin_note,
        created_at,
        updated_at,
        paid_at
      )
      VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?
      )
    `).bind(
      uid("order"),
      publicationId,
      publication.author_id,
      price,
      currency,
      status,
      clean(body.payment_method, 100),
      clean(body.payment_reference, 500),
      clean(body.admin_note, 5000),
      now,
      now,
      status === "paid" ? now : null
    ).run();
  }

  if (body.message) {
    await sendOfficialMessage(
      env,
      publication.author_id,
      clean(body.message, 10000),
      publicationId
    );
  }

  await addAdminAudit(
    env,
    null,
    "payment_update",
    "publication",
    publicationId,
    JSON.stringify(body)
  );

  return json({
    ok: true,
    price,
    currency,
    status
  });
}


/* =========================================================
   OFFICIAL MESSAGE
========================================================= */

async function sendOfficialMessage(
  env,
  userId,
  text,
  publicationId = null
) {
  const now = new Date().toISOString();

  const messageId = uid("msg");

  await env.DB.prepare(`
    INSERT INTO messages (
      id,

      sender_type,
      sender_user_id,

      receiver_type,
      receiver_user_id,

      publication_id,

      text,
      status,
      created_at
    )
    VALUES (
      ?,
      'official',
      NULL,
      'user',
      ?,
      ?,
      ?,
      'sent',
      ?
    )
  `).bind(
    messageId,
    userId,
    publicationId,
    text,
    now
  ).run();

  await addNotification(
    env,
    userId,
    "official_message",
    SITE_NAME,
    text,
    publicationId
  );

  return messageId;
}


/* =========================================================
   NOTIFICATION HELPER
========================================================= */

async function addNotification(
  env,
  userId,
  type,
  title,
  text,
  publicationId = null
) {
  await env.DB.prepare(`
    INSERT INTO notifications (
      id,
      user_id,
      type,
      title,
      text,
      publication_id,
      read,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).bind(
    uid("notification"),
    userId,
    type,
    title,
    text,
    publicationId,
    new Date().toISOString()
  ).run();
}


/* =========================================================
   ADMIN AUDIT
========================================================= */

async function addAdminAudit(
  env,
  adminId,
  action,
  targetType,
  targetId,
  details
) {
  await env.DB.prepare(`
    INSERT INTO audit_logs (
      id,
      admin_id,
      action,
      target_type,
      target_id,
      details,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    uid("audit"),
    adminId,
    action,
    targetType,
    targetId,
    details || "",
    new Date().toISOString()
  ).run();
}


/* =========================================================
   AUTH HELPERS
========================================================= */

async function requireUser(request, env) {
  const token = getCookie(
    request,
    SESSION_COOKIE
  );

  if (!token) {
    return null;
  }

  const hash = await sha256(token);

  const session = await env.DB
    .prepare(`
      SELECT user_id
      FROM sessions
      WHERE token_hash = ?
      AND expires_at > ?
      LIMIT 1
    `)
    .bind(
      hash,
      new Date().toISOString()
    )
    .first();

  if (!session) {
    return null;
  }

  const user = await getUser(
    env,
    session.user_id
  );

  if (!user) {
    return null;
  }

  if (
    Number(user.deleted) === 1 ||
    Number(user.blocked) === 1
  ) {
    return null;
  }

  return user;
}


async function createSession(env, userId) {
  const token =
    crypto.randomUUID() +
    "." +
    crypto.randomUUID();

  const now = new Date();

  const expires =
    new Date(
      now.getTime() +
      SESSION_DAYS * 24 * 60 * 60 * 1000
    );

  await env.DB.prepare(`
    INSERT INTO sessions (
      id,
      user_id,
      token_hash,
      expires_at,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    uid("session"),
    userId,
    await sha256(token),
    expires.toISOString(),
    now.toISOString()
  ).run();

  return token;
}


async function isAdmin(request, env) {
  const token = getCookie(
    request,
    ADMIN_COOKIE
  );

  if (!token) {
    return false;
  }

  /*
   * Admin session — это отдельный HttpOnly cookie.
   * Сам пароль никогда не хранится в браузере.
   */

  return Boolean(
    env.ADMIN_PASSWORD &&
    token.length >= 20
  );
}


/* =========================================================
   USER HELPERS
========================================================= */

async function getUser(env, id) {
  if (!id) return null;

  return env.DB
    .prepare(`
      SELECT *
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
    .bind(id)
    .first();
}


function safeUser(user) {
  if (!user) return null;

  return {
    id: user.id,

    name: user.name,
    username: user.username,

    avatar_url: user.avatar_url || null,

    email: user.email || null,
    phone: user.phone || null,

    country: user.country || null,
    city: user.city || null,

    verified:
      Number(user.verified) === 1,

    role: user.role || "user",

    followers_count:
      Number(user.followers_count || 0),

    following_count:
      Number(user.following_count || 0),

    publications_count:
      Number(user.publications_count || 0)
  };
}


function fullProfile(user, publicView = false) {
  if (!user) return null;

  const profile = {
    id: user.id,

    name: user.name,
    username: user.username,

    avatar_url: user.avatar_url || null,

    email: user.email || null,
    phone: user.phone || null,

    birth_date:
      user.birth_date || null,

    country:
      user.country || null,

    city:
      user.city || null,

    bio:
      user.bio || null,

    profession:
      user.profession || null,

    education:
      user.education || null,

    languages:
      user.languages || null,

    skills:
      user.skills || null,

    company:
      user.company || null,

    website:
      user.website || null,

    social_links:
      user.social_links || null,

    salary:
      user.salary || null,

    interests:
      user.interests || null,

    achievements:
      user.achievements || null,

    verified:
      Number(user.verified) === 1,

    role:
      user.role || "user",

    private_profile:
      Number(user.private_profile) === 1,

    followers_count:
      Number(user.followers_count || 0),

    following_count:
      Number(user.following_count || 0),

    publications_count:
      Number(user.publications_count || 0),

    created_at:
      user.created_at
  };

  /*
   * Пароль никогда не попадает в profile.
   */

  if (publicView) {
    delete profile.email;
    delete profile.phone;
    delete profile.birth_date;
  }

  return profile;
}


/* =========================================================
   VISITOR
========================================================= */

function getOrCreateVisitor(request) {
  const existing = getCookie(
    request,
    "to_visitor"
  );

  if (existing) {
    return existing;
  }

  return "visitor_" +
    crypto.randomUUID();
}


/* =========================================================
   ADMIN STATS HELPERS
========================================================= */

async function count(env, sql) {
  const row = await env.DB
    .prepare(sql)
    .first();

  return Number(row?.n || 0);
}


async function sum(env, sql) {
  const row = await env.DB
    .prepare(sql)
    .first();

  return Number(row?.n || 0);
}


/* =========================================================
   UTILS
========================================================= */

function uid(prefix) {
  return (
    prefix +
    "_" +
    crypto.randomUUID()
  );
}


function clean(value, max = 1000) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, max);
}


function normalizeUsername(value) {
  let username = clean(
    value,
    50
  );

  if (!username) {
    return "";
  }

  if (!username.startsWith("@")) {
    username = "@" + username;
  }

  return username;
}


async function sha256(value) {
  const data = new TextEncoder()
    .encode(String(value));

  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return [...new Uint8Array(hash)]
    .map(
      b =>
        b.toString(16)
          .padStart(2, "0")
    )
    .join("");
}


async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}


/* =========================================================
   COOKIE
========================================================= */

function getCookie(request, name) {
  const header =
    request.headers.get("Cookie") || "";

  const parts =
    header.split(";");

  for (const part of parts) {
    const index = part.indexOf("=");

    if (index === -1) continue;

    const key =
      part.slice(0, index).trim();

    if (key !== name) continue;

    return decodeURIComponent(
      part.slice(index + 1).trim()
    );
  }

  return null;
}


function sessionCookie(token) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_DAYS * 86400}`
  ].join("; ");
}


function adminCookie(token) {
  return [
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=43200"
  ].join("; ");
}


function deleteCookie(name) {
  return [
    `${name}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join("; ");
}


/* =========================================================
   RESPONSE
========================================================= */

function json(data, status = 200, extraHeaders = {}) {
  const headers = new Headers(
    SECURITY_HEADERS
  );

  for (const [key, value] of Object.entries(
    extraHeaders
  )) {
    headers.set(key, value);
  }

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers
    }
  );
}


function forbidden() {
  return json({
    ok: false,
    error: "Доступ запрещён"
  }, 403);
}


function securityResponse(response) {
  const headers =
    new Headers(response.headers);

  headers.set(
    "x-content-type-options",
    "nosniff"
  );

  headers.set(
    "x-frame-options",
    "DENY"
  );

  headers.set(
    "referrer-policy",
    "strict-origin-when-cross-origin"
  );

  headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers
    }
  );
}
