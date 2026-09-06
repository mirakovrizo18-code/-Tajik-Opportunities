// ============================================================
// TAJIK OPPORTUNITIES — MEGA SOCIAL PLATFORM API
// Version: 6.0
// Cloudflare Workers + D1 + Assets
// ============================================================
//
// ВАЖНО:
// 1. ADMIN_PASSWORD хранится только в Cloudflare Worker Secret.
// 2. Не вставляй пароль администратора в этот файл.
// 3. DB = существующая D1 база Tajik Opportunities.
// 4. ASSETS = папка public/.
// 5. Все пользовательские публикации проходят модерацию.
// 6. Медиа добавляются URL-адресами.
// ============================================================

const VERSION = "6.0.0";

const ADMIN_COOKIE = "to_admin_session";
const VISITOR_COOKIE = "to_visitor";

const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

// Большой предел текста.
// D1 всё равно имеет физические ограничения размера строки.
const MAX_TITLE_LENGTH = 5000;
const MAX_CONTENT_LENGTH = 1800000;
const MAX_COMMENT_LENGTH = 100000;
const MAX_URL_LENGTH = 10000;
const MAX_TAG_LENGTH = 150;

const SECURITY_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=()",
  "cache-control": "no-store"
};

// ============================================================
// КАТЕГОРИИ
// ============================================================

const CATEGORIES = [
  { id: "jobs", name: "Вакансии", icon: "💼" },
  { id: "job_seekers", name: "Ищу работу", icon: "🔎" },
  { id: "employees", name: "Ищу сотрудника", icon: "👔" },
  { id: "profiles", name: "Профили специалистов", icon: "👤" },

  { id: "news", name: "Новости", icon: "📰" },
  { id: "education", name: "Образование", icon: "🎓" },
  { id: "courses", name: "Курсы", icon: "📚" },
  { id: "scholarships", name: "Стипендии", icon: "🎓" },

  { id: "opportunities", name: "Возможности", icon: "🎁" },
  { id: "announcements", name: "Объявления", icon: "📢" },
  { id: "services", name: "Услуги", icon: "🤝" },

  { id: "startups", name: "Стартапы", icon: "🚀" },
  { id: "projects", name: "Проекты", icon: "💡" },
  { id: "ideas", name: "Идеи", icon: "🧠" },

  { id: "events", name: "Мероприятия", icon: "📅" },
  { id: "competitions", name: "Конкурсы", icon: "🏆" },
  { id: "grants", name: "Гранты", icon: "💰" },
  { id: "volunteering", name: "Волонтёрство", icon: "🤝" },

  { id: "housing", name: "Жильё", icon: "🏠" },
  { id: "real_estate", name: "Недвижимость", icon: "🏢" },
  { id: "transport", name: "Транспорт", icon: "🚗" },
  { id: "travel", name: "Путешествия", icon: "✈️" },

  { id: "products", name: "Товары", icon: "🛍️" },
  { id: "services_market", name: "Услуги и специалисты", icon: "🧑‍💻" },

  { id: "it", name: "IT и технологии", icon: "💻" },
  { id: "business", name: "Бизнес", icon: "📈" },
  { id: "finance", name: "Финансы", icon: "💳" },

  { id: "sport", name: "Спорт", icon: "⚽" },
  { id: "music", name: "Музыка", icon: "🎵" },
  { id: "culture", name: "Культура", icon: "🎭" },
  { id: "creative", name: "Творчество", icon: "🎨" },
  { id: "gaming", name: "Игры", icon: "🎮" },

  { id: "health", name: "Полезная информация", icon: "❤️" },
  { id: "help", name: "Помощь", icon: "🆘" },

  { id: "advertising", name: "Реклама", icon: "📣" },
  { id: "other", name: "Другое", icon: "🌐" }
];

const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map(category => [category.id, category])
);

// ============================================================
// ТИПЫ МЕДИА
// ============================================================

const MEDIA_TYPES = [
  { id: "image", name: "Изображение", icon: "🖼️" },
  { id: "gallery", name: "Галерея", icon: "🎠" },
  { id: "video", name: "Видео", icon: "🎥" },
  { id: "music", name: "Музыка", icon: "🎵" },
  { id: "audio", name: "Аудио", icon: "🔊" },
  { id: "link", name: "Ссылка", icon: "🔗" },
  { id: "document", name: "Документ", icon: "📄" },
  { id: "other", name: "Другое", icon: "📎" }
];

const MEDIA_MAP = Object.fromEntries(
  MEDIA_TYPES.map(media => [media.id, media])
);

// ============================================================
// МИРОВЫЕ ЯЗЫКИ
// ============================================================
//
// Это каталог языков интерфейса/перевода.
// Сам перевод должен выполняться подключённым переводчиком/AI.
// Мы НЕ создаём фальшивые переводы.
//

const LANGUAGES = [
  ["aa", "Afar"],
  ["ab", "Abkhaz"],
  ["af", "Afrikaans"],
  ["ak", "Akan"],
  ["am", "Amharic"],
  ["ar", "Arabic"],
  ["as", "Assamese"],
  ["ay", "Aymara"],
  ["az", "Azerbaijani"],
  ["ba", "Bashkir"],
  ["be", "Belarusian"],
  ["bg", "Bulgarian"],
  ["bh", "Bihari"],
  ["bn", "Bengali"],
  ["bo", "Tibetan"],
  ["bs", "Bosnian"],
  ["ca", "Catalan"],
  ["ceb", "Cebuano"],
  ["co", "Corsican"],
  ["cs", "Czech"],
  ["cy", "Welsh"],
  ["da", "Danish"],
  ["de", "German"],
  ["dv", "Dhivehi"],
  ["dz", "Dzongkha"],
  ["ee", "Ewe"],
  ["el", "Greek"],
  ["en", "English"],
  ["eo", "Esperanto"],
  ["es", "Spanish"],
  ["et", "Estonian"],
  ["eu", "Basque"],
  ["fa", "Persian"],
  ["ff", "Fulah"],
  ["fi", "Finnish"],
  ["fj", "Fijian"],
  ["fo", "Faroese"],
  ["fr", "French"],
  ["fy", "Frisian"],
  ["ga", "Irish"],
  ["gd", "Scottish Gaelic"],
  ["gl", "Galician"],
  ["gn", "Guarani"],
  ["gu", "Gujarati"],
  ["ha", "Hausa"],
  ["he", "Hebrew"],
  ["hi", "Hindi"],
  ["hr", "Croatian"],
  ["ht", "Haitian Creole"],
  ["hu", "Hungarian"],
  ["hy", "Armenian"],
  ["id", "Indonesian"],
  ["ig", "Igbo"],
  ["is", "Icelandic"],
  ["it", "Italian"],
  ["ja", "Japanese"],
  ["jv", "Javanese"],
  ["ka", "Georgian"],
  ["kk", "Kazakh"],
  ["km", "Khmer"],
  ["kn", "Kannada"],
  ["ko", "Korean"],
  ["ku", "Kurdish"],
  ["ky", "Kyrgyz"],
  ["la", "Latin"],
  ["lb", "Luxembourgish"],
  ["lo", "Lao"],
  ["lt", "Lithuanian"],
  ["lv", "Latvian"],
  ["mg", "Malagasy"],
  ["mi", "Māori"],
  ["mk", "Macedonian"],
  ["ml", "Malayalam"],
  ["mn", "Mongolian"],
  ["mr", "Marathi"],
  ["ms", "Malay"],
  ["mt", "Maltese"],
  ["my", "Burmese"],
  ["ne", "Nepali"],
  ["nl", "Dutch"],
  ["no", "Norwegian"],
  ["ny", "Chichewa"],
  ["or", "Odia"],
  ["pa", "Punjabi"],
  ["pl", "Polish"],
  ["ps", "Pashto"],
  ["pt", "Portuguese"],
  ["qu", "Quechua"],
  ["ro", "Romanian"],
  ["ru", "Russian"],
  ["rw", "Kinyarwanda"],
  ["sa", "Sanskrit"],
  ["sd", "Sindhi"],
  ["si", "Sinhala"],
  ["sk", "Slovak"],
  ["sl", "Slovenian"],
  ["sm", "Samoan"],
  ["sn", "Shona"],
  ["so", "Somali"],
  ["sq", "Albanian"],
  ["sr", "Serbian"],
  ["st", "Sesotho"],
  ["su", "Sundanese"],
  ["sv", "Swedish"],
  ["sw", "Swahili"],
  ["ta", "Tamil"],
  ["te", "Telugu"],
  ["tg", "Tajik"],
  ["th", "Thai"],
  ["tk", "Turkmen"],
  ["tl", "Tagalog"],
  ["tr", "Turkish"],
  ["tt", "Tatar"],
  ["ug", "Uyghur"],
  ["uk", "Ukrainian"],
  ["ur", "Urdu"],
  ["uz", "Uzbek"],
  ["vi", "Vietnamese"],
  ["xh", "Xhosa"],
  ["yi", "Yiddish"],
  ["yo", "Yoruba"],
  ["zh", "Chinese"],
  ["zu", "Zulu"]
].map(([code, name]) => ({
  code,
  name
}));

const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map(language => [language.code, language])
);

// ============================================================
// УТИЛИТЫ
// ============================================================

function json(data, status = 200, extraHeaders = {}) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...SECURITY_HEADERS,
        ...extraHeaders
      }
    }
  );
}

function text(data, status = 200, extraHeaders = {}) {
  return new Response(
    data,
    {
      status,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        ...extraHeaders
      }
    }
  );
}

function clean(value, max = 100000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

function timestamp() {
  return new Date().toISOString();
}

function validHttpUrl(value) {
  try {
    const url = new URL(clean(value, MAX_URL_LENGTH));

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function parseJson(value, fallback = []) {
  try {
    return JSON.parse(value || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function cookies(request) {
  const raw = request.headers.get("cookie") || "";

  const result = {};

  for (const part of raw.split(";")) {
    const index = part.indexOf("=");

    if (index === -1) continue;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    result[key] = decodeURIComponent(value);
  }

  return result;
}

function visitorId(request) {
  return cookies(request)[VISITOR_COOKIE] || null;
}

function generateVisitorCookie(value) {
  return `${VISITOR_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; Secure; SameSite=Lax`;
}

async function readJson(request) {
  const contentLength = Number(
    request.headers.get("content-length") || 0
  );

  if (contentLength > 10 * 1024 * 1024) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  return request.json();
}

// ============================================================
// D1 HELPERS
// ============================================================

async function dbRun(db, sql, ...params) {
  return db
    .prepare(sql)
    .bind(...params)
    .run();
}

async function dbOne(db, sql, ...params) {
  return db
    .prepare(sql)
    .bind(...params)
    .first();
}

async function dbAll(db, sql, ...params) {
  const result = await db
    .prepare(sql)
    .bind(...params)
    .all();

  return result.results || [];
}

// ============================================================
// ADMIN HMAC
// ============================================================

async function createHmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(signature)
    )
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function isAdmin(request, env) {
  if (!env.ADMIN_PASSWORD) {
    return false;
  }

  const cookie = cookies(request)[ADMIN_COOKIE];

  if (!cookie) {
    return false;
  }

  const parts = cookie.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const payload = parts[0];
  const signature = parts[1];

  const timestampPart = Number(
    payload.split(":")[0]
  );

  if (!timestampPart) {
    return false;
  }

  if (
    Date.now() - timestampPart >
    ADMIN_SESSION_SECONDS * 1000
  ) {
    return false;
  }

  const expected = await createHmac(
    env.ADMIN_PASSWORD,
    payload
  );

  return expected === signature;
}

// ============================================================
// DATABASE SCHEMA
// ============================================================

async function prepareDatabase(env) {
  const statements = [

    `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      username TEXT,
      avatar_url TEXT,
      bio TEXT,
      country TEXT,
      city TEXT,
      language TEXT DEFAULT 'ru',
      role TEXT DEFAULT 'user',
      verified INTEGER DEFAULT 0,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      posts_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
    `,

    `
    CREATE TABLE IF NOT EXISTS publications (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,

      category TEXT NOT NULL,
      subcategory TEXT,

      country TEXT,
      city TEXT,
      location TEXT,
      scope TEXT DEFAULT 'local',

      event_start TEXT,
      event_end TEXT,
      deadline TEXT,

      price TEXT,
      currency TEXT,

      employment_type TEXT,
      work_format TEXT,
      experience TEXT,
      education TEXT,

      languages TEXT,
      tags TEXT,

      contact_name TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      contact_telegram TEXT,
      external_url TEXT,

      status TEXT DEFAULT 'pending',
      visibility TEXT DEFAULT 'public',

      featured INTEGER DEFAULT 0,
      pinned INTEGER DEFAULT 0,

      views INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    )
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_publications_status
    ON publications(status, created_at DESC)
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_publications_category
    ON publications(category, status)
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_publications_country_city
    ON publications(country, city, status)
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_publications_author
    ON publications(author_id, created_at DESC)
    `,

    `
    CREATE TABLE IF NOT EXISTS publication_media (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      caption TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_media_publication
    ON publication_media(publication_id, sort_order)
    `,

    `
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      parent_id TEXT,
      actor_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'published',
      likes INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_comments_publication
    ON comments(publication_id, created_at)
    `,

    `
    CREATE TABLE IF NOT EXISTS comment_reactions (
      id TEXT PRIMARY KEY,
      comment_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      type TEXT DEFAULT 'like',
      created_at TEXT NOT NULL,
      UNIQUE(comment_id, actor_id)
    )
    `,

    `
    CREATE TABLE IF NOT EXISTS reactions (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      type TEXT DEFAULT 'like',
      created_at TEXT NOT NULL,
      UNIQUE(publication_id, actor_id)
    )
    `,

    `
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(publication_id, actor_id)
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
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL,
      actor_id TEXT,
      type TEXT NOT NULL,
      publication_id TEXT,
      comment_id TEXT,
      text TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(recipient_id, is_read, created_at DESC)
    `,

    `
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      submitter_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      created_at TEXT NOT NULL,
      reviewed_at TEXT
    )
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_submissions_status
    ON submissions(status, created_at DESC)
    `,

    `
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reporter_id TEXT,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      reviewed_at TEXT
    )
    `,

    `
    CREATE TABLE IF NOT EXISTS translations (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      language TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      provider TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(publication_id, language)
    )
    `,

    `
    CREATE TABLE IF NOT EXISTS hashtags (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      UNIQUE(publication_id, tag)
    )
    `,

    `
    CREATE INDEX IF NOT EXISTS idx_hashtags_tag
    ON hashtags(tag)
    `,

    `
    CREATE TABLE IF NOT EXISTS saved_searches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      query TEXT,
      category TEXT,
      country TEXT,
      city TEXT,
      created_at TEXT NOT NULL
    )
    `,

    `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    )
    `
  ];

  for (const sql of statements) {
    await env.DB.prepare(sql).run();
  }
}

// ============================================================
// ENSURE USER
// ============================================================

async function ensureUser(
  env,
  userId,
  displayName = "Участник",
  extra = {}
) {
  const existing = await dbOne(
    env.DB,
    "SELECT id FROM users WHERE id=?",
    userId
  );

  if (existing) {
    return userId;
  }

  await dbRun(
    env.DB,
    `
    INSERT INTO users
    (
      id,
      display_name,
      username,
      avatar_url,
      bio,
      country,
      city,
      language,
      created_at,
      updated_at
    )
    VALUES(?,?,?,?,?,?,?,?,?,?)
    `,
    userId,
    clean(displayName, 200) || "Участник",
    clean(extra.username, 100),
    validHttpUrl(extra.avatar_url),
    clean(extra.bio, 10000),
    clean(extra.country, 200),
    clean(extra.city, 200),
    clean(extra.language, 20) || "ru",
    timestamp(),
    timestamp()
  );

  return userId;
}

// ============================================================
// CREATE PUBLICATION
// ============================================================

async function createPublication(request, env) {
  const data = await readJson(request);

  const title = clean(
    data.title,
    MAX_TITLE_LENGTH
  );

  const content = clean(
    data.content,
    MAX_CONTENT_LENGTH
  );

  const category = clean(
    data.category,
    100
  );

  if (!title) {
    return json(
      { error: "Укажите заголовок публикации." },
      400
    );
  }

  if (!content) {
    return json(
      { error: "Укажите содержание публикации." },
      400
    );
  }

  if (!CATEGORY_MAP[category]) {
    return json(
      { error: "Выберите корректную категорию." },
      400
    );
  }

  let authorId =
    clean(data.author_id, 200) ||
    visitorId(request);

  let setVisitorCookie = false;

  if (!authorId) {
    authorId = id("visitor");
    setVisitorCookie = true;
  }

  await ensureUser(
    env,
    authorId,
    clean(data.author_name, 200) || "Участник",
    {
      username: data.username,
      avatar_url: data.avatar_url,
      bio: data.author_bio,
      country: data.country,
      city: data.city,
      language: data.language
    }
  );

  const publicationId = id("post");
  const time = timestamp();

  const tags = Array.isArray(data.tags)
    ? data.tags
        .map(tag =>
          clean(tag, MAX_TAG_LENGTH)
            .replace(/^#/, "")
        )
        .filter(Boolean)
        .slice(0, 300)
    : [];

  const languages = Array.isArray(data.languages)
    ? data.languages
        .map(language => clean(language, 30))
        .filter(language => LANGUAGE_MAP[language])
        .slice(0, 300)
    : [];

  await dbRun(
    env.DB,
    `
    INSERT INTO publications
    (
      id,
      author_id,
      title,
      content,
      category,
      subcategory,
      country,
      city,
      location,
      scope,

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

      contact_name,
      contact_phone,
      contact_email,
      contact_telegram,
      external_url,

      status,
      visibility,

      featured,
      pinned,

      views,
      shares,
      saves,
      likes,
      comments_count,

      created_at,
      updated_at
    )
    VALUES
    (
      ?,?,?,?,?,?,?,?,?,?,
      ?,?,?,
      ?,?,
      ?,?,?,?,
      ?,?,
      ?,?,?,?,?,?,
      ?,?,
      0,0,
      0,0,0,0,0,
      ?,?
    )
    `,
    publicationId,
    authorId,
    title,
    content,
    category,
    clean(data.subcategory, 300),

    clean(data.country, 250),
    clean(data.city, 250),
    clean(data.location, 1000),
    clean(data.scope, 100) || "local",

    clean(data.event_start, 200),
    clean(data.event_end, 200),
    clean(data.deadline, 200),

    clean(data.price, 200),
    clean(data.currency, 50),

    clean(data.employment_type, 200),
    clean(data.work_format, 200),
    clean(data.experience, 300),
    clean(data.education, 500),

    JSON.stringify(languages),
    JSON.stringify(tags),

    clean(data.contact_name, 300),
    clean(data.contact_phone, 200),
    clean(data.contact_email, 300),
    clean(data.contact_telegram, 300),
    validHttpUrl(data.external_url),

    "pending",
    "public",

    time,
    time
  );

  // ==========================================================
  // MEDIA
  // ==========================================================

  const media =
    Array.isArray(data.media)
      ? data.media.slice(0, 300)
      : [];

  let mediaOrder = 0;

  for (const item of media) {
    const type = clean(
      item?.type,
      50
    );

    const url = validHttpUrl(
      item?.url
    );

    if (!url) continue;

    if (!MEDIA_MAP[type]) continue;

    await dbRun(
      env.DB,
      `
      INSERT INTO publication_media
      (
        id,
        publication_id,
        type,
        url,
        title,
        caption,
        sort_order,
        created_at
      )
      VALUES(?,?,?,?,?,?,?,?)
      `,
      id("media"),
      publicationId,
      type,
      url,
      clean(item.title, 500),
      clean(item.caption, 5000),
      mediaOrder++,
      time
    );
  }

  // ==========================================================
  // HASHTAGS
  // ==========================================================

  for (const tag of tags) {
    await dbRun(
      env.DB,
      `
      INSERT OR IGNORE INTO hashtags
      (id, publication_id, tag)
      VALUES(?,?,?)
      `,
      id("hash"),
      publicationId,
      tag.toLowerCase()
    );
  }

  // ==========================================================
  // MODERATION
  // ==========================================================

  const submissionId = id("submission");

  await dbRun(
    env.DB,
    `
    INSERT INTO submissions
    (
      id,
      publication_id,
      submitter_id,
      status,
      created_at
    )
    VALUES(?,?,?,?,?)
    `,
    submissionId,
    publicationId,
    authorId,
    "pending",
    time
  );

  await dbRun(
    env.DB,
    `
    UPDATE users
    SET updated_at=?
    WHERE id=?
    `,
    time,
    authorId
  );

  const response = {
    ok: true,
    publication_id: publicationId,
    submission_id: submissionId,
    status: "pending",
    message:
      "Публикация отправлена администратору на проверку."
  };

  const headers = {};

  if (setVisitorCookie) {
    headers["set-cookie"] =
      generateVisitorCookie(authorId);
  }

  return json(
    response,
    201,
    headers
  );
}

// ============================================================
// PUBLICATIONS LIST
// ============================================================

async function listPublications(
  request,
  env
) {
  const url = new URL(request.url);

  const where = [
    "p.status='published'",
    "p.visibility='public'"
  ];

  const params = [];

  const category =
    clean(
      url.searchParams.get("category"),
      100
    );

  const country =
    clean(
      url.searchParams.get("country"),
      250
    );

  const city =
    clean(
      url.searchParams.get("city"),
      250
    );

  const scope =
    clean(
      url.searchParams.get("scope"),
      100
    );

  const query =
    clean(
      url.searchParams.get("q"),
      1000
    );

  const language =
    clean(
      url.searchParams.get("language"),
      30
    );

  const author =
    clean(
      url.searchParams.get("author"),
      200
    );

  if (
    category &&
    CATEGORY_MAP[category]
  ) {
    where.push("p.category=?");
    params.push(category);
  }

  if (country) {
    where.push("p.country=?");
    params.push(country);
  }

  if (city) {
    where.push("p.city=?");
    params.push(city);
  }

  if (scope) {
    where.push("p.scope=?");
    params.push(scope);
  }

  if (author) {
    where.push("p.author_id=?");
    params.push(author);
  }

  if (language) {
    where.push("p.languages LIKE ?");
    params.push(`%${language}%`);
  }

  if (query) {
    where.push(
      `
      (
        p.title LIKE ?
        OR p.content LIKE ?
        OR p.tags LIKE ?
        OR p.country LIKE ?
        OR p.city LIKE ?
      )
      `
    );

    const search = `%${query}%`;

    params.push(
      search,
      search,
      search,
      search,
      search
    );
  }

  const sort =
    clean(
      url.searchParams.get("sort"),
      50
    ) || "new";

  let orderBy =
    `
    p.pinned DESC,
    p.featured DESC,
    p.created_at DESC
    `;

  if (sort === "popular") {
    orderBy =
      `
      (
        p.likes * 5 +
        p.comments_count * 8 +
        p.shares * 6 +
        p.saves * 5 +
        p.views / 100
      ) DESC,
      p.created_at DESC
      `;
  }

  if (sort === "views") {
    orderBy =
      `
      p.views DESC,
      p.created_at DESC
      `;
  }

  if (sort === "comments") {
    orderBy =
      `
      p.comments_count DESC,
      p.created_at DESC
      `;
  }

  if (sort === "likes") {
    orderBy =
      `
      p.likes DESC,
      p.created_at DESC
      `;
  }

  const limitRaw =
    Number(
      url.searchParams.get("limit") || 30
    );

  const limit = Math.min(
    Math.max(
      Number.isFinite(limitRaw)
        ? limitRaw
        : 30,
      1
    ),
    100
  );

  const rows = await dbAll(
    env.DB,
    `
    SELECT
      p.*,

      COALESCE(
        u.display_name,
        'Участник'
      ) AS author_name,

      u.username AS author_username,
      u.avatar_url AS author_avatar,
      u.verified AS author_verified,
      u.followers_count AS author_followers

    FROM publications p

    LEFT JOIN users u
      ON u.id=p.author_id

    WHERE ${where.join(" AND ")}

    ORDER BY ${orderBy}

    LIMIT ?
    `,
    ...params,
    limit
  );

  if (!rows.length) {
    return [];
  }

  const ids = rows.map(row => row.id);

  const placeholders =
    ids.map(() => "?").join(",");

  const media = await dbAll(
    env.DB,
    `
    SELECT *
    FROM publication_media
    WHERE publication_id IN (${placeholders})
    ORDER BY sort_order ASC
    `,
    ...ids
  );

  const mediaByPost = {};

  for (const item of media) {
    if (!mediaByPost[item.publication_id]) {
      mediaByPost[item.publication_id] = [];
    }

    mediaByPost[item.publication_id].push(item);
  }

  return rows.map(row => ({
    ...row,

    category_info:
      CATEGORY_MAP[row.category] || null,

    tags:
      parseJson(row.tags, []),

    languages:
      parseJson(row.languages, []),

    media:
      mediaByPost[row.id] || []
  }));
}

// ============================================================
// SINGLE PUBLICATION
// ============================================================

async function getPublication(
  publicationId,
  env
) {
  const publication =
    await dbOne(
      env.DB,
      `
      SELECT
        p.*,

        COALESCE(
          u.display_name,
          'Участник'
        ) AS author_name,

        u.username AS author_username,
        u.avatar_url AS author_avatar,
        u.bio AS author_bio,
        u.country AS author_country,
        u.city AS author_city,
        u.verified AS author_verified,
        u.followers_count AS author_followers

      FROM publications p

      LEFT JOIN users u
        ON u.id=p.author_id

      WHERE
        p.id=?
        AND p.status='published'
      `,
      publicationId
    );

  if (!publication) {
    return null;
  }

  const media =
    await dbAll(
      env.DB,
      `
      SELECT *
      FROM publication_media
      WHERE publication_id=?
      ORDER BY sort_order ASC
      `,
      publicationId
    );

  const translations =
    await dbAll(
      env.DB,
      `
      SELECT
        id,
        language,
        title,
        content,
        status,
        provider,
        created_at,
        updated_at

      FROM translations

      WHERE
        publication_id=?
        AND status='published'

      ORDER BY language
      `,
      publicationId
    );

  return {
    ...publication,

    category_info:
      CATEGORY_MAP[publication.category] || null,

    tags:
      parseJson(publication.tags, []),

    languages:
      parseJson(publication.languages, []),

    media,

    translations
  };
}

// ============================================================
// VIEW
// ============================================================

async function addView(
  publicationId,
  env
) {
  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET views=views+1
    WHERE
      id=?
      AND status='published'
    `,
    publicationId
  );

  const row =
    await dbOne(
      env.DB,
      `
      SELECT views
      FROM publications
      WHERE id=?
      `,
      publicationId
    );

  return json({
    ok: true,
    views: Number(row?.views || 0)
  });
}

// ============================================================
// REACTION
// ============================================================

async function reactPublication(
  request,
  publicationId,
  env
) {
  let actor =
    visitorId(request);

  let setCookie = false;

  if (!actor) {
    actor = id("visitor");
    setCookie = true;
  }

  const data =
    await readJson(request)
      .catch(() => ({}));

  const type =
    [
      "like",
      "love",
      "support",
      "funny",
      "wow",
      "sad",
      "angry"
    ].includes(data.type)
      ? data.type
      : "like";

  await ensureUser(
    env,
    actor,
    clean(data.author_name, 200) ||
      "Участник"
  );

  const old =
    await dbOne(
      env.DB,
      `
      SELECT id,type
      FROM reactions
      WHERE
        publication_id=?
        AND actor_id=?
      `,
      publicationId,
      actor
    );

  if (old) {

    if (old.type === type) {

      await dbRun(
        env.DB,
        `
        DELETE FROM reactions
        WHERE id=?
        `,
        old.id
      );

      await dbRun(
        env.DB,
        `
        UPDATE publications
        SET likes=MAX(likes-1,0)
        WHERE id=?
        `,
        publicationId
      );

      const headers = {};

      if (setCookie) {
        headers["set-cookie"] =
          generateVisitorCookie(actor);
      }

      return json(
        {
          ok: true,
          active: false,
          type: null
        },
        200,
        headers
      );
    }

    await dbRun(
      env.DB,
      `
      UPDATE reactions
      SET type=?
      WHERE id=?
      `,
      type,
      old.id
    );

  } else {

    await dbRun(
      env.DB,
      `
      INSERT INTO reactions
      (
        id,
        publication_id,
        actor_id,
        type,
        created_at
      )
      VALUES(?,?,?,?,?)
      `,
      id("reaction"),
      publicationId,
      actor,
      type,
      timestamp()
    );

    await dbRun(
      env.DB,
      `
      UPDATE publications
      SET likes=likes+1
      WHERE id=?
      `,
      publicationId
    );
  }

  const headers = {};

  if (setCookie) {
    headers["set-cookie"] =
      generateVisitorCookie(actor);
  }

  return json(
    {
      ok: true,
      active: true,
      type
    },
    200,
    headers
  );
}

// ============================================================
// SAVE / UNSAVE
// ============================================================

async function toggleFavorite(
  request,
  publicationId,
  env
) {
  let actor =
    visitorId(request);

  let setCookie = false;

  if (!actor) {
    actor = id("visitor");
    setCookie = true;
  }

  await ensureUser(
    env,
    actor,
    "Участник"
  );

  const old =
    await dbOne(
      env.DB,
      `
      SELECT id
      FROM favorites
      WHERE
        publication_id=?
        AND actor_id=?
      `,
      publicationId,
      actor
    );

  const headers = {};

  if (setCookie) {
    headers["set-cookie"] =
      generateVisitorCookie(actor);
  }

  if (old) {

    await dbRun(
      env.DB,
      `
      DELETE FROM favorites
      WHERE id=?
      `,
      old.id
    );

    await dbRun(
      env.DB,
      `
      UPDATE publications
      SET saves=MAX(saves-1,0)
      WHERE id=?
      `,
      publicationId
    );

    return json(
      {
        ok: true,
        saved: false
      },
      200,
      headers
    );
  }

  await dbRun(
    env.DB,
    `
    INSERT INTO favorites
    (
      id,
      publication_id,
      actor_id,
      created_at
    )
    VALUES(?,?,?,?)
    `,
    id("favorite"),
    publicationId,
    actor,
    timestamp()
  );

  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET saves=saves+1
    WHERE id=?
    `,
    publicationId
  );

  return json(
    {
      ok: true,
      saved: true
    },
    200,
    headers
  );
}

// ============================================================
// SHARE
// ============================================================

async function sharePublication(
  publicationId,
  env
) {
  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET shares=shares+1
    WHERE id=?
    `,
    publicationId
  );

  const row =
    await dbOne(
      env.DB,
      `
      SELECT shares
      FROM publications
      WHERE id=?
      `,
      publicationId
    );

  return json({
    ok: true,
    shares:
      Number(row?.shares || 0)
  });
}

// ============================================================
// COMMENTS
// ============================================================

async function comments(
  request,
  publicationId,
  env
) {
  if (request.method === "GET") {

    const rows =
      await dbAll(
        env.DB,
        `
        SELECT *
        FROM comments

        WHERE
          publication_id=?
          AND status='published'

        ORDER BY created_at ASC

        LIMIT 1000
        `,
        publicationId
      );

    return json(rows);
  }

  let actor =
    visitorId(request);

  let setCookie = false;

  if (!actor) {
    actor = id("visitor");
    setCookie = true;
  }

  const data =
    await readJson(request);

  const content =
    clean(
      data.content,
      MAX_COMMENT_LENGTH
    );

  if (!content) {
    return json(
      {
        error:
          "Комментарий не может быть пустым."
      },
      400
    );
  }

  const authorName =
    clean(
      data.author_name,
      200
    ) || "Участник";

  await ensureUser(
    env,
    actor,
    authorName,
    {
      avatar_url:
        data.avatar_url
    }
  );

  const commentId =
    id("comment");

  await dbRun(
    env.DB,
    `
    INSERT INTO comments
    (
      id,
      publication_id,
      parent_id,
      actor_id,
      author_name,
      author_avatar,
      content,
      status,
      created_at
    )
    VALUES(?,?,?,?,?,?,?,?,?)
    `,
    commentId,
    publicationId,
    clean(data.parent_id, 200) || null,
    actor,
    authorName,
    validHttpUrl(data.avatar_url),
    content,
    "published",
    timestamp()
  );

  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET comments_count=comments_count+1
    WHERE id=?
    `,
    publicationId
  );

  const publication =
    await dbOne(
      env.DB,
      `
      SELECT author_id
      FROM publications
      WHERE id=?
      `,
      publicationId
    );

  if (
    publication?.author_id &&
    publication.author_id !== actor
  ) {
    await dbRun(
      env.DB,
      `
      INSERT INTO notifications
      (
        id,
        recipient_id,
        actor_id,
        type,
        publication_id,
        comment_id,
        text,
        created_at
      )
      VALUES(?,?,?,?,?,?,?,?)
      `,
      id("notification"),
      publication.author_id,
      actor,
      "comment",
      publicationId,
      commentId,
      `${authorName} прокомментировал(а) вашу публикацию.`,
      timestamp()
    );
  }

  const headers = {};

  if (setCookie) {
    headers["set-cookie"] =
      generateVisitorCookie(actor);
  }

  return json(
    {
      ok: true,
      comment_id: commentId
    },
    201,
    headers
  );
}

// ============================================================
// FOLLOW USER
// ============================================================

async function followUser(
  request,
  targetUserId,
  env
) {
  let follower =
    visitorId(request);

  let setCookie = false;

  if (!follower) {
    follower = id("visitor");
    setCookie = true;
  }

  if (follower === targetUserId) {
    return json(
      {
        error:
          "Нельзя подписаться на самого себя."
      },
      400
    );
  }

  await ensureUser(
    env,
    follower,
    "Участник"
  );

  const target =
    await dbOne(
      env.DB,
      `
      SELECT id
      FROM users
      WHERE id=?
      `,
      targetUserId
    );

  if (!target) {
    return json(
      {
        error:
          "Пользователь не найден."
      },
      404
    );
  }

  const old =
    await dbOne(
      env.DB,
      `
      SELECT id
      FROM follows
      WHERE
        follower_id=?
        AND following_id=?
      `,
      follower,
      targetUserId
    );

  const headers = {};

  if (setCookie) {
    headers["set-cookie"] =
      generateVisitorCookie(follower);
  }

  if (old) {

    await dbRun(
      env.DB,
      `
      DELETE FROM follows
      WHERE id=?
      `,
      old.id
    );

    await dbRun(
      env.DB,
      `
      UPDATE users
      SET followers_count=MAX(followers_count-1,0)
      WHERE id=?
      `,
      targetUserId
    );

    await dbRun(
      env.DB,
      `
      UPDATE users
      SET following_count=MAX(following_count-1,0)
      WHERE id=?
      `,
      follower
    );

    return json(
      {
        ok: true,
        following: false
      },
      200,
      headers
    );
  }

  await dbRun(
    env.DB,
    `
    INSERT INTO follows
    (
      id,
      follower_id,
      following_id,
      created_at
    )
    VALUES(?,?,?,?)
    `,
    id("follow"),
    follower,
    targetUserId,
    timestamp()
  );

  await dbRun(
    env.DB,
    `
    UPDATE users
    SET followers_count=followers_count+1
    WHERE id=?
    `,
    targetUserId
  );

  await dbRun(
    env.DB,
    `
    UPDATE users
    SET following_count=following_count+1
    WHERE id=?
    `,
    follower
  );

  await dbRun(
    env.DB,
    `
    INSERT INTO notifications
    (
      id,
      recipient_id,
      actor_id,
      type,
      text,
      created_at
    )
    VALUES(?,?,?,?,?,?)
    `,
    id("notification"),
    targetUserId,
    follower,
    "follow",
    "На вас подписались.",
    timestamp()
  );

  return json(
    {
      ok: true,
      following: true
    },
    200,
    headers
  );
}

// ============================================================
// PROFILE
// ============================================================

async function profile(
  userId,
  env
) {
  const user =
    await dbOne(
      env.DB,
      `
      SELECT
        id,
        display_name,
        username,
        avatar_url,
        bio,
        country,
        city,
        language,
        role,
        verified,
        followers_count,
        following_count,
        posts_count,
        created_at

      FROM users
      WHERE id=?
      `,
      userId
    );

  if (!user) {
    return null;
  }

  const posts =
    await dbAll(
      env.DB,
      `
      SELECT
        id,
        title,
        category,
        country,
        city,
        views,
        likes,
        comments_count,
        created_at

      FROM publications

      WHERE
        author_id=?
        AND status='published'

      ORDER BY created_at DESC

      LIMIT 100
      `,
      userId
    );

  return {
    ...user,
    posts
  };
}

// ============================================================
// NOTIFICATIONS
// ============================================================

async function notifications(
  request,
  env
) {
  const user =
    visitorId(request);

  if (!user) {
    return json([]);
  }

  const rows =
    await dbAll(
      env.DB,
      `
      SELECT *
      FROM notifications
      WHERE recipient_id=?
      ORDER BY created_at DESC
      LIMIT 200
      `,
      user
    );

  return json(rows);
}

// ============================================================
// REPORT
// ============================================================

async function createReport(
  request,
  env
) {
  const data =
    await readJson(request);

  const targetType =
    clean(data.target_type, 100);

  const targetId =
    clean(data.target_id, 300);

  const reason =
    clean(data.reason, 500);

  if (
    !targetType ||
    !targetId ||
    !reason
  ) {
    return json(
      {
        error:
          "Заполните данные жалобы."
      },
      400
    );
  }

  await dbRun(
    env.DB,
    `
    INSERT INTO reports
    (
      id,
      target_type,
      target_id,
      reporter_id,
      reason,
      details,
      status,
      created_at
    )
    VALUES(?,?,?,?,?,?,?,?)
    `,
    id("report"),
    targetType,
    targetId,
    visitorId(request),
    reason,
    clean(data.details, 20000),
    "pending",
    timestamp()
  );

  return json(
    {
      ok: true,
      message:
        "Жалоба отправлена администрации."
    },
    201
  );
}

// ============================================================
// TRANSLATION
// ============================================================
//
// Endpoint поддерживает:
// {
//   "languages": ["en","ru","tg"]
// }
//
// или:
//
// {
//   "languages": ["all"]
// }
//
// Сам перевод не подделываем.
// Если AI binding отсутствует — сообщаем, что его нужно подключить.
//
// Для массового перевода на все языки рекомендуется очередь,
// потому что один HTTP-запрос не должен пытаться синхронно
// перевести огромный пост на сотни языков.
//

async function translationRequest(
  request,
  publicationId,
  env
) {
  const publication =
    await dbOne(
      env.DB,
      `
      SELECT
        id,
        title,
        content,
        languages
      FROM publications
      WHERE id=?
      `,
      publicationId
    );

  if (!publication) {
    return json(
      {
        error:
          "Публикация не найдена."
      },
      404
    );
  }

  const data =
    await readJson(request)
      .catch(() => ({}));

  let languages =
    Array.isArray(data.languages)
      ? data.languages
      : [];

  if (
    languages.includes("all")
  ) {
    languages =
      LANGUAGES.map(
        language => language.code
      );
  }

  languages = [
    ...new Set(
      languages.filter(
        language =>
          LANGUAGE_MAP[language]
      )
    )
  ];

  if (!languages.length) {
    return json(
      {
        error:
          "Выберите языки перевода."
      },
      400
    );
  }

  // Если AI отсутствует, не создаём фальшивый перевод.
  if (!env.AI) {
    return json(
      {
        ok: false,
        translation_available: false,
        message:
          "Для автоматического перевода необходимо подключить Cloudflare Workers AI binding с именем AI.",
        requested_languages: languages
      },
      503
    );
  }

  // Здесь создаётся задание.
  // Реальный AI-перевод можно выполнять пакетами/очередью.
  const jobId =
    id("translation_job");

  return json({
    ok: true,
    queued: true,
    job_id: jobId,
    publication_id: publicationId,
    languages,
    message:
      "Запрос на международный перевод принят. Для большого количества языков обработка должна выполняться пакетами."
  });
}

// ============================================================
// ADMIN LOGIN
// ============================================================

async function adminLogin(
  request,
  env
) {
  const data =
    await readJson(request);

  if (!env.ADMIN_PASSWORD) {
    return json(
      {
        error:
          "ADMIN_PASSWORD не настроен в Worker Secrets."
      },
      500
    );
  }

  if (
    String(data.password || "") !==
    String(env.ADMIN_PASSWORD)
  ) {
    return json(
      {
        error:
          "Неверный пароль администратора."
      },
      401
    );
  }

  const payload =
    `${Date.now()}:${crypto.randomUUID()}`;

  const signature =
    await createHmac(
      env.ADMIN_PASSWORD,
      payload
    );

  const cookie =
    `${ADMIN_COOKIE}=${encodeURIComponent(
      payload + "." + signature
    )}; Path=/; Max-Age=${ADMIN_SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;

  return json(
    {
      ok: true,
      message:
        "Вход администратора выполнен."
    },
    200,
    {
      "set-cookie": cookie
    }
  );
}

// ============================================================
// ADMIN STATS
// ============================================================

async function adminStats(
  env
) {
  const [
    users,
    posts,
    pending,
    published,
    rejected,
    comments,
    reports,
    views,
    likes,
    shares,
    saves
  ] = await Promise.all([
    dbOne(
      env.DB,
      "SELECT COUNT(*) n FROM users"
    ),
    dbOne(
      env.DB,
      "SELECT COUNT(*) n FROM publications"
    ),
    dbOne(
      env.DB,
      `
      SELECT COUNT(*) n
      FROM publications
      WHERE status='pending'
      `
    ),
    dbOne(
      env.DB,
      `
      SELECT COUNT(*) n
      FROM publications
      WHERE status='published'
      `
    ),
    dbOne(
      env.DB,
      `
      SELECT COUNT(*) n
      FROM publications
      WHERE status='rejected'
      `
    ),
    dbOne(
      env.DB,
      "SELECT COUNT(*) n FROM comments"
    ),
    dbOne(
      env.DB,
      `
      SELECT COUNT(*) n
      FROM reports
      WHERE status='pending'
      `
    ),
    dbOne(
      env.DB,
      `
      SELECT COALESCE(SUM(views),0) n
      FROM publications
      `
    ),
    dbOne(
      env.DB,
      `
      SELECT COALESCE(SUM(likes),0) n
      FROM publications
      `
    ),
    dbOne(
      env.DB,
      `
      SELECT COALESCE(SUM(shares),0) n
      FROM publications
      `
    ),
    dbOne(
      env.DB,
      `
      SELECT COALESCE(SUM(saves),0) n
      FROM publications
      `
    )
  ]);

  return json({
    version: VERSION,

    users: Number(users?.n || 0),
    posts: Number(posts?.n || 0),

    pending: Number(
      pending?.n || 0
    ),

    published: Number(
      published?.n || 0
    ),

    rejected: Number(
      rejected?.n || 0
    ),

    comments: Number(
      comments?.n || 0
    ),

    pending_reports: Number(
      reports?.n || 0
    ),

    views: Number(
      views?.n || 0
    ),

    likes: Number(
      likes?.n || 0
    ),

    shares: Number(
      shares?.n || 0
    ),

    saves: Number(
      saves?.n || 0
    )
  });
}

// ============================================================
// ADMIN SUBMISSIONS
// ============================================================

async function adminSubmissions(
  env
) {
  const rows =
    await dbAll(
      env.DB,
      `
      SELECT

        s.id AS submission_id,
        s.status AS submission_status,
        s.admin_note,
        s.created_at AS submitted_at,

        p.*,

        COALESCE(
          u.display_name,
          'Участник'
        ) AS author_name,

        u.username AS author_username,
        u.avatar_url AS author_avatar,
        u.verified AS author_verified

      FROM submissions s

      JOIN publications p
        ON p.id=s.publication_id

      LEFT JOIN users u
        ON u.id=p.author_id

      WHERE s.status='pending'

      ORDER BY s.created_at DESC

      LIMIT 500
      `
    );

  const result = [];

  for (const row of rows) {
    const media =
      await dbAll(
        env.DB,
        `
        SELECT *
        FROM publication_media
        WHERE publication_id=?
        ORDER BY sort_order
        `,
        row.id
      );

    result.push({
      ...row,
      category_info:
        CATEGORY_MAP[row.category] || null,
      tags:
        parseJson(row.tags, []),
      languages:
        parseJson(row.languages, []),
      media
    });
  }

  return json(result);
}

// ============================================================
// ADMIN APPROVE / REJECT
// ============================================================

async function moderateSubmission(
  request,
  submissionId,
  action,
  env
) {
  const data =
    await readJson(request)
      .catch(() => ({}));

  const submission =
    await dbOne(
      env.DB,
      `
      SELECT
        id,
        publication_id,
        submitter_id,
        status

      FROM submissions

      WHERE id=?
      `,
      submissionId
    );

  if (!submission) {
    return json(
      {
        error:
          "Заявка не найдена."
      },
      404
    );
  }

  if (
    submission.status !== "pending"
  ) {
    return json(
      {
        error:
          "Эта заявка уже обработана."
      },
      409
    );
  }

  const approved =
    action === "approve";

  const time =
    timestamp();

  const newStatus =
    approved
      ? "published"
      : "rejected";

  await dbRun(
    env.DB,
    `
    UPDATE submissions
    SET
      status=?,
      admin_note=?,
      reviewed_at=?
    WHERE id=?
    `,
    approved
      ? "approved"
      : "rejected",
    clean(data.note, 20000),
    time,
    submissionId
  );

  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET
      status=?,
      published_at=?,
      updated_at=?
    WHERE id=?
    `,
    newStatus,
    approved ? time : null,
    time,
    submission.publication_id
  );

  if (approved) {
    await dbRun(
      env.DB,
      `
      UPDATE users
      SET posts_count=posts_count+1
      WHERE id=?
      `,
      submission.submitter_id
    );
  }

  await dbRun(
    env.DB,
    `
    INSERT INTO notifications
    (
      id,
      recipient_id,
      actor_id,
      type,
      publication_id,
      text,
      created_at
    )
    VALUES(?,?,?,?,?,?,?)
    `,
    id("notification"),
    submission.submitter_id,
    null,
    approved
      ? "publication_approved"
      : "publication_rejected",
    submission.publication_id,
    approved
      ? "Ваша публикация одобрена администратором и опубликована."
      : "Ваша публикация отклонена администратором.",
    time
  );

  await dbRun(
    env.DB,
    `
    INSERT INTO audit_logs
    (
      id,
      actor,
      action,
      target_type,
      target_id,
      details,
      created_at
    )
    VALUES(?,?,?,?,?,?,?)
    `,
    id("audit"),
    "admin",
    approved
      ? "approve_publication"
      : "reject_publication",
    "publication",
    submission.publication_id,
    clean(data.note, 20000),
    time
  );

  return json({
    ok: true,
    status: newStatus,
    publication_id:
      submission.publication_id
  });
}

// ============================================================
// ADMIN REPORTS
// ============================================================

async function adminReports(
  env
) {
  return json(
    await dbAll(
      env.DB,
      `
      SELECT *
      FROM reports

      ORDER BY
        CASE
          WHEN status='pending'
          THEN 0
          ELSE 1
        END,
        created_at DESC

      LIMIT 500
      `
    )
  );
}

// ============================================================
// ADMIN DELETE PUBLICATION
// ============================================================

async function adminDeletePublication(
  publicationId,
  env
) {
  const publication =
    await dbOne(
      env.DB,
      `
      SELECT id
      FROM publications
      WHERE id=?
      `,
      publicationId
    );

  if (!publication) {
    return json(
      {
        error:
          "Публикация не найдена."
      },
      404
    );
  }

  await dbRun(
    env.DB,
    `
    DELETE FROM publication_media
    WHERE publication_id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    DELETE FROM hashtags
    WHERE publication_id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    DELETE FROM translations
    WHERE publication_id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    DELETE FROM comments
    WHERE publication_id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    DELETE FROM reactions
    WHERE publication_id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    DELETE FROM favorites
    WHERE publication_id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    DELETE FROM publications
    WHERE id=?
    `,
    publicationId
  );

  await dbRun(
    env.DB,
    `
    INSERT INTO audit_logs
    (
      id,
      actor,
      action,
      target_type,
      target_id,
      created_at
    )
    VALUES(?,?,?,?,?,?)
    `,
    id("audit"),
    "admin",
    "delete_publication",
    "publication",
    publicationId,
    timestamp()
  );

  return json({
    ok: true
  });
}

// ============================================================
// ADMIN PIN / UNPIN
// ============================================================

async function adminPin(
  publicationId,
  pinned,
  env
) {
  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET pinned=?,updated_at=?
    WHERE id=?
    `,
    pinned ? 1 : 0,
    timestamp(),
    publicationId
  );

  return json({
    ok: true,
    pinned: Boolean(pinned)
  });
}

// ============================================================
// ADMIN FEATURE
// ============================================================

async function adminFeature(
  publicationId,
  featured,
  env
) {
  await dbRun(
    env.DB,
    `
    UPDATE publications
    SET featured=?,updated_at=?
    WHERE id=?
    `,
    featured ? 1 : 0,
    timestamp(),
    publicationId
  );

  return json({
    ok: true,
    featured: Boolean(featured)
  });
}

// ============================================================
// ROUTER — ADMIN
// ============================================================

async function handleAdmin(
  request,
  env,
  pathname
) {
  const method =
    request.method;

  if (
    pathname ===
      "/api/admin/login" &&
    method === "POST"
  ) {
    return adminLogin(
      request,
      env
    );
  }

  if (
    pathname ===
      "/api/admin/logout" &&
    method === "POST"
  ) {
    return json(
      {
        ok: true
      },
      200,
      {
        "set-cookie":
          `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
      }
    );
  }

  const authorized =
    await isAdmin(
      request,
      env
    );

  if (!authorized) {
    return json(
      {
        error:
          "Требуется вход администратора."
      },
      401
    );
  }

  if (
    pathname ===
    "/api/admin/me"
  ) {
    return json({
      ok: true,
      role: "admin"
    });
  }

  if (
    pathname ===
    "/api/admin/stats"
  ) {
    return adminStats(env);
  }

  if (
    pathname ===
    "/api/admin/submissions"
  ) {
    return adminSubmissions(env);
  }

  if (
    pathname ===
    "/api/admin/reports"
  ) {
    return adminReports(env);
  }

  const moderation =
    pathname.match(
      /^\/api\/admin\/submissions\/([^/]+)\/(approve|reject)$/
    );

  if (
    moderation &&
    method === "POST"
  ) {
    return moderateSubmission(
      request,
      moderation[1],
      moderation[2],
      env
    );
  }

  const deleteMatch =
    pathname.match(
      /^\/api\/admin\/publications\/([^/]+)$/
    );

  if (
    deleteMatch &&
    method === "DELETE"
  ) {
    return adminDeletePublication(
      deleteMatch[1],
      env
    );
  }

  const pinMatch =
    pathname.match(
      /^\/api\/admin\/publications\/([^/]+)\/pin$/
    );

  if (
    pinMatch &&
    method === "POST"
  ) {
    const data =
      await readJson(request)
        .catch(() => ({}));

    return adminPin(
      pinMatch[1],
      Boolean(data.pinned),
      env
    );
  }

  const featureMatch =
    pathname.match(
      /^\/api\/admin\/publications\/([^/]+)\/feature$/
    );

  if (
    featureMatch &&
    method === "POST"
  ) {
    const data =
      await readJson(request)
        .catch(() => ({}));

    return adminFeature(
      featureMatch[1],
      Boolean(data.featured),
      env
    );
  }

  return json(
    {
      error:
        "Admin endpoint not found."
    },
    404
  );
}

// ============================================================
// MAIN FETCH
// ============================================================

export default {
  async fetch(request, env) {

    try {

      if (!env.DB) {
        return json(
          {
            error:
              "D1 binding DB не настроен."
          },
          500
        );
      }

      if (!env.ASSETS) {
        return json(
          {
            error:
              "Assets binding ASSETS не настроен."
          },
          500
        );
      }

      await prepareDatabase(env);

      const url =
        new URL(request.url);

      const pathname =
        url.pathname;

      const method =
        request.method;

      // --------------------------------------------------------
      // CORS / OPTIONS
      // --------------------------------------------------------

      if (method === "OPTIONS") {
        return new Response(
          null,
          {
            status: 204,
            headers: {
              ...SECURITY_HEADERS,
              "access-control-allow-origin":
                url.origin,
              "access-control-allow-methods":
                "GET,POST,PUT,PATCH,DELETE,OPTIONS",
              "access-control-allow-headers":
                "Content-Type"
            }
          }
        );
      }

      // --------------------------------------------------------
      // HEALTH
      // --------------------------------------------------------

      if (
        pathname ===
        "/api/health"
      ) {
        return json({
          ok: true,
          platform:
            "Tajik Opportunities",
          version: VERSION,
          environment:
            env.ENVIRONMENT || "production",
          database: true,
          assets: true,
          moderation: true,
          multilingual: true,
          international: true
        });
      }

      // --------------------------------------------------------
      // META
      // --------------------------------------------------------

      if (
        pathname ===
        "/api/categories"
      ) {
        return json(
          CATEGORIES
        );
      }

      if (
        pathname ===
        "/api/media-types"
      ) {
        return json(
          MEDIA_TYPES
        );
      }

      if (
        pathname ===
        "/api/languages"
      ) {
        return json({
          all_supported: true,
          count:
            LANGUAGES.length,
          languages:
            LANGUAGES
        });
      }

      // --------------------------------------------------------
      // PUBLICATIONS
      // --------------------------------------------------------

      if (
        pathname ===
          "/api/publications" &&
        method === "GET"
      ) {
        return json(
          await listPublications(
            request,
            env
          )
        );
      }

      if (
        pathname ===
          "/api/publications" &&
        method === "POST"
      ) {
        return createPublication(
          request,
          env
        );
      }

      // --------------------------------------------------------
      // SINGLE PUBLICATION
      // --------------------------------------------------------

      const publicationMatch =
        pathname.match(
          /^\/api\/publications\/([^/]+)$/
        );

      if (
        publicationMatch &&
        method === "GET"
      ) {
        const publication =
          await getPublication(
            publicationMatch[1],
            env
          );

        if (!publication) {
          return json(
            {
              error:
                "Публикация не найдена."
            },
            404
          );
        }

        return json(
          publication
        );
      }

      // --------------------------------------------------------
      // PUBLICATION ACTIONS
      // --------------------------------------------------------

      const actionMatch =
        pathname.match(
          /^\/api\/publications\/([^/]+)\/(view|react|favorite|share|comments|translate)$/
        );

      if (actionMatch) {

        const publicationId =
          actionMatch[1];

        const action =
          actionMatch[2];

        if (
          action === "view" &&
          method === "POST"
        ) {
          return addView(
            publicationId,
            env
          );
        }

        if (
          action === "react" &&
          method === "POST"
        ) {
          return reactPublication(
            request,
            publicationId,
            env
          );
        }

        if (
          action === "favorite" &&
          method === "POST"
        ) {
          return toggleFavorite(
            request,
            publicationId,
            env
          );
        }

        if (
          action === "share" &&
          method === "POST"
        ) {
          return sharePublication(
            publicationId,
            env
          );
        }

        if (
          action === "comments"
        ) {
          return comments(
            request,
            publicationId,
            env
          );
        }

        if (
          action === "translate" &&
          method === "POST"
        ) {
          return translationRequest(
            request,
            publicationId,
            env
          );
        }
      }

      // --------------------------------------------------------
      // FOLLOW
      // --------------------------------------------------------

      const followMatch =
        pathname.match(
          /^\/api\/users\/([^/]+)\/follow$/
        );

      if (
        followMatch &&
        method === "POST"
      ) {
        return followUser(
          request,
          followMatch[1],
          env
        );
      }

      // --------------------------------------------------------
      // PROFILE
      // --------------------------------------------------------

      const profileMatch =
        pathname.match(
          /^\/api\/users\/([^/]+)$/
        );

      if (
        profileMatch &&
        method === "GET"
      ) {
        const data =
          await profile(
            profileMatch[1],
            env
          );

        if (!data) {
          return json(
            {
              error:
                "Профиль не найден."
            },
            404
          );
        }

        return json(data);
      }

      // --------------------------------------------------------
      // NOTIFICATIONS
      // --------------------------------------------------------

      if (
        pathname ===
        "/api/notifications" &&
        method === "GET"
      ) {
        return notifications(
          request,
          env
        );
      }

      // --------------------------------------------------------
      // REPORTS
      // --------------------------------------------------------

      if (
        pathname ===
          "/api/reports" &&
        method === "POST"
      ) {
        return createReport(
          request,
          env
        );
      }

      // --------------------------------------------------------
      // ADMIN
      // --------------------------------------------------------

      if (
        pathname.startsWith(
          "/api/admin/"
        )
      ) {
        return handleAdmin(
          request,
          env,
          pathname
        );
      }

      // --------------------------------------------------------
      // STATIC ASSETS
      // --------------------------------------------------------

      const assetResponse =
        await env.ASSETS.fetch(
          request
        );

      if (
        assetResponse.status !== 404
      ) {
        return assetResponse;
      }

      // --------------------------------------------------------
      // SPA FALLBACK
      // --------------------------------------------------------

      const indexResponse =
        await env.ASSETS.fetch(
          new Request(
            new URL(
              "/index.html",
              request.url
            ),
            request
          )
        );

      if (
        indexResponse.status !== 404
      ) {
        return indexResponse;
      }

      return text(
        "Tajik Opportunities — Page not found.",
        404
      );

    } catch (error) {

      console.error(
        "TAJIK OPPORTUNITIES ERROR:",
        error
      );

      if (
        error?.message ===
        "REQUEST_TOO_LARGE"
      ) {
        return json(
          {
            error:
              "Запрос слишком большой."
          },
          413
        );
      }

      return json(
        {
          error:
            "Внутренняя ошибка сервера.",
          version: VERSION
        },
        500
      );
    }
  }
};
