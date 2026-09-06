/**
 * ============================================================
 * TAJIK OPPORTUNITIES
 * Cloudflare Worker
 * ============================================================
 *
 * Version: 2026.09.07
 *
 * Основные задачи:
 * - Static Assets
 * - API
 * - Profiles
 * - Opportunities
 * - Publications
 * - Messages
 * - Admin chat
 * - Anonymous messages
 * - Notifications
 * - Health check
 * - CORS
 * - Security headers
 * - D1
 * - KV
 *
 * ============================================================
 */

const VERSION = "2026.09.07";
const APP_NAME = "Tajik Opportunities";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store"
};

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=UTF-8",
  "Cache-Control": "no-store"
};

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS"
];

/* ============================================================
   MAIN WORKER
============================================================ */

export default {
  async fetch(request, env, ctx) {
    const requestId = crypto.randomUUID();

    try {
      const response = await handleRequest(
        request,
        env,
        ctx
      );

      return addSecurityHeaders(
        addRequestId(response, requestId)
      );
    } catch (error) {
      console.error(
        "Worker error:",
        error
      );

      return addSecurityHeaders(
        addRequestId(
          jsonResponse(
            {
              success: false,
              ok: false,
              error: "INTERNAL_ERROR",
              message:
                "Произошла внутренняя ошибка сервера.",
              requestId
            },
            500
          ),
          requestId
        )
      );
    }
  }
};

/* ============================================================
   REQUEST ROUTER
============================================================ */

async function handleRequest(
  request,
  env,
  ctx
) {
  const url = new URL(
    request.url
  );

  const method =
    request.method.toUpperCase();

  if (
    !ALLOWED_METHODS.includes(method)
  ) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error: "METHOD_NOT_ALLOWED"
      },
      405,
      {
        Allow:
          ALLOWED_METHODS.join(", ")
      }
    );
  }

  if (method === "OPTIONS") {
    return corsResponse();
  }

  /* ----------------------------------------------------------
     HEALTH
  ---------------------------------------------------------- */

  if (
    url.pathname === "/health" ||
    url.pathname === "/api/health"
  ) {
    return jsonResponse({
      success: true,
      ok: true,
      app: APP_NAME,
      version: VERSION,
      status: "ok",
      timestamp:
        new Date().toISOString()
    });
  }

  /* ----------------------------------------------------------
     API
  ---------------------------------------------------------- */

  if (
    url.pathname.startsWith("/api/")
  ) {
    return handleApi(
      request,
      env,
      ctx
    );
  }

  /* ----------------------------------------------------------
     STATIC ASSETS
  ---------------------------------------------------------- */

  if (env.ASSETS) {
    return env.ASSETS.fetch(
      request
    );
  }

  /* ----------------------------------------------------------
     FALLBACK
  ---------------------------------------------------------- */

  return htmlResponse(`
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(APP_NAME)}</title>

<style>
*{
  box-sizing:border-box;
}

body{
  margin:0;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;

  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(32,199,122,.18),
      transparent 35%
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(229,199,107,.10),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #04100b,
      #071a12 50%,
      #06130e
    );

  color:#f7faf8;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;
}

.card{
  width:min(680px,100%);
  padding:45px 30px;

  border:
    1px solid rgba(255,255,255,.09);

  border-radius:28px;

  text-align:center;

  background:
    rgba(15,38,28,.88);

  box-shadow:
    0 25px 80px rgba(0,0,0,.35);
}

.logo{
  font-size:50px;
  margin-bottom:15px;
}

h1{
  margin:0 0 12px;
}

p{
  color:#9caea5;
  line-height:1.6;
}
</style>
</head>

<body>

<div class="card">

  <div class="logo">🇹🇯</div>

  <h1>${escapeHtml(APP_NAME)}</h1>

  <p>
    Cloudflare Worker успешно запущен.
  </p>

</div>

</body>
</html>
`);
}

/* ============================================================
   API ROUTER
============================================================ */

async function handleApi(
  request,
  env,
  ctx
) {
  const url = new URL(
    request.url
  );

  const path =
    normalizePath(
      url.pathname
    );

  /* ----------------------------------------------------------
     API INFORMATION
  ---------------------------------------------------------- */

  if (path === "/api") {
    return jsonResponse({
      success: true,
      ok: true,
      app: APP_NAME,
      version: VERSION,

      endpoints: {
        health:
          "/api/health",

        profile:
          "/api/profile",

        opportunities:
          "/api/opportunities",

        publications:
          "/api/publications",

        messages:
          "/api/messages",

        adminChat:
          "/api/admin-chat",

        notifications:
          "/api/notifications"
      }
    });
  }

  /* ----------------------------------------------------------
     PROFILE
  ---------------------------------------------------------- */

  if (
    path === "/api/profile"
  ) {
    return handleProfile(
      request,
      env
    );
  }

  /* ----------------------------------------------------------
     PUBLICATIONS
  ---------------------------------------------------------- */

  if (
    path === "/api/publications"
  ) {
    return handlePublications(
      request,
      env
    );
  }

  /* ----------------------------------------------------------
     OPPORTUNITIES
  ---------------------------------------------------------- */

  if (
    path === "/api/opportunities"
  ) {
    return handleOpportunities(
      request,
      env
    );
  }

  /* ----------------------------------------------------------
     MESSAGES
  ---------------------------------------------------------- */

  if (
    path === "/api/messages"
  ) {
    return handleMessages(
      request,
      env
    );
  }

  /* ----------------------------------------------------------
     ADMIN CHAT
  ---------------------------------------------------------- */

  if (
    path === "/api/admin-chat"
  ) {
    return handleAdminChat(
      request,
      env
    );
  }

  /* ----------------------------------------------------------
     NOTIFICATIONS
  ---------------------------------------------------------- */

  if (
    path === "/api/notifications"
  ) {
    return handleNotifications(
      request,
      env
    );
  }

  return jsonResponse(
    {
      success: false,
      ok: false,
      error: "NOT_FOUND",
      message:
        "API endpoint не найден."
    },
    404
  );
}

/* ============================================================
   PUBLICATIONS API
============================================================ */

async function handlePublications(
  request,
  env
) {
  const method =
    request.method.toUpperCase();

  /* ----------------------------------------------------------
     CHECK D1
  ---------------------------------------------------------- */

  if (
    !env.DB ||
    typeof env.DB.prepare !==
      "function"
  ) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error: "DATABASE_NOT_CONFIGURED",
        message:
          "D1 database не подключена к Worker."
      },
      500
    );
  }

  /* ----------------------------------------------------------
     GET PUBLICATIONS
  ---------------------------------------------------------- */

  if (method === "GET") {
    const url =
      new URL(request.url);

    const category =
      cleanText(
        url.searchParams.get(
          "category"
        ),
        100
      );

    const city =
      cleanText(
        url.searchParams.get(
          "city"
        ),
        100
      );

    const status =
      cleanText(
        url.searchParams.get(
          "status"
        ),
        50
      ) || "published";

    const search =
      cleanText(
        url.searchParams.get(
          "search"
        ),
        200
      );

    const limit =
      clampNumber(
        url.searchParams.get(
          "limit"
        ),
        1,
        100,
        30
      );

    const offset =
      clampNumber(
        url.searchParams.get(
          "offset"
        ),
        0,
        1000000,
        0
      );

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push(
        "status = ?"
      );

      params.push(status);
    }

    if (category) {
      conditions.push(
        "category = ?"
      );

      params.push(category);
    }

    if (city) {
      conditions.push(
        "city = ?"
      );

      params.push(city);
    }

    if (search) {
      conditions.push(`
        (
          title LIKE ?
          OR text LIKE ?
          OR city LIKE ?
          OR category LIKE ?
          OR hashtags LIKE ?
        )
      `);

      const q = `%${search}%`;

      params.push(
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

    const sql = `
      SELECT
        *
      FROM publications
      ${where}
      ORDER BY
        COALESCE(
          published_at,
          created_at
        ) DESC
      LIMIT ?
      OFFSET ?
    `;

    params.push(
      limit,
      offset
    );

    const result =
      await env.DB
        .prepare(sql)
        .bind(...params)
        .all();

    const publications =
      (result.results || [])
        .map(
          normalizePublicationFromDb
        );

    return jsonResponse({
      success: true,
      ok: true,
      total:
        publications.length,
      publications
    });
  }

  /* ----------------------------------------------------------
     POST PUBLICATION
  ---------------------------------------------------------- */

  if (method === "POST") {
    return createPublication(
      request,
      env
    );
  }

  return jsonResponse(
    {
      success: false,
      ok: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   CREATE PUBLICATION
============================================================ */

async function createPublication(
  request,
  env
) {
  /* ----------------------------------------------------------
     AUTH
  ---------------------------------------------------------- */

  const userId =
    getUserId(request);

  if (!userId) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error: "AUTH_REQUIRED",
        message:
          "Необходима авторизация для создания публикации."
      },
      401
    );
  }

  /* ----------------------------------------------------------
     BODY
  ---------------------------------------------------------- */

  const body =
    await readJson(request);

  /* ----------------------------------------------------------
     BASIC VALIDATION
  ---------------------------------------------------------- */

  const title =
    cleanText(
      body.title,
      180
    );

  const content =
    cleanText(
      body.content,
      10000
    );

  const category =
    cleanText(
      body.category,
      100
    );

  if (
    title.length < 5
  ) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error:
          "TITLE_TOO_SHORT",
        message:
          "Заголовок должен содержать минимум 5 символов."
      },
      400
    );
  }

  if (
    content.length < 20
  ) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error:
          "CONTENT_TOO_SHORT",
        message:
          "Описание должно содержать минимум 20 символов."
      },
      400
    );
  }

  if (!category) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error:
          "CATEGORY_REQUIRED",
        message:
          "Необходимо выбрать категорию."
      },
      400
    );
  }

  /* ----------------------------------------------------------
     FIELDS
  ---------------------------------------------------------- */

  const subcategory =
    cleanText(
      body.subcategory,
      100
    );

  const country =
    cleanText(
      body.country,
      100
    );

  const city =
    cleanText(
      body.city,
      100
    );

  const location =
    cleanText(
      body.location,
      250
    );

  const scope =
    cleanText(
      body.scope,
      100
    );

  const eventStart =
    normalizeDateValue(
      body.event_start
    );

  const eventEnd =
    normalizeDateValue(
      body.event_end
    );

  const deadline =
    normalizeDateValue(
      body.deadline
    );

  if (
    eventStart &&
    eventEnd &&
    new Date(eventEnd) <
      new Date(eventStart)
  ) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error:
          "INVALID_EVENT_DATES",
        message:
          "Дата окончания не может быть раньше даты начала."
      },
      400
    );
  }

  /* ----------------------------------------------------------
     PRICE
  ---------------------------------------------------------- */

  let price = 0;

  if (
    body.price !== undefined &&
    body.price !== null &&
    body.price !== ""
  ) {
    price =
      Number(
        body.price
      );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return jsonResponse(
        {
          success: false,
          ok: false,
          error:
            "INVALID_PRICE",
          message:
            "Некорректная цена."
        },
        400
      );
    }

    price = Math.round(price);
  }

  const currency =
    cleanText(
      body.currency,
      20
    );

  const employmentType =
    cleanText(
      body.employment_type,
      100
    );

  const workFormat =
    cleanText(
      body.work_format,
      100
    );

  const experience =
    cleanText(
      body.experience,
      150
    );

  const education =
    cleanText(
      body.education,
      150
    );

  const languages =
    normalizeList(
      body.languages
    );

  const tags =
    normalizeList(
      body.tags
    );

  const contactName =
    cleanText(
      body.contact_name,
      150
    );

  const contactPhone =
    cleanText(
      body.contact_phone,
      60
    );

  const contactEmail =
    cleanText(
      body.contact_email,
      200
    );

  const contactTelegram =
    cleanText(
      body.contact_telegram,
      150
    );

  const externalUrl =
    cleanUrl(
      body.external_url
    );

  if (
    body.external_url &&
    !externalUrl
  ) {
    return jsonResponse(
      {
        success: false,
        ok: false,
        error:
          "INVALID_EXTERNAL_URL",
        message:
          "Ссылка должна начинаться с http:// или https://."
      },
      400
    );
  }

  const authorName =
    cleanText(
      body.author_name,
      150
    );

  const language =
    cleanText(
      body.language,
      20
    ) || "ru";

  const translateAll =
    body.translate_all === true ||
    body.translate_all === 1 ||
    body.translate_all === "1"
      ? 1
      : 0;

  /* ----------------------------------------------------------
     MEDIA
  ---------------------------------------------------------- */

  const media =
    normalizeMedia(
      body.media
    );

  for (
    const item of media
  ) {
    if (
      !isHttpUrl(
        item.url
      )
    ) {
      return jsonResponse(
        {
          success: false,
          ok: false,
          error:
            "INVALID_MEDIA_URL",
          message:
            "Некоторые ссылки на медиафайлы некорректны."
        },
        400
      );
    }
  }

  /* ----------------------------------------------------------
     IDS
  ---------------------------------------------------------- */

  const id =
    crypto.randomUUID();

  const trackingCode =
    await generateTrackingCode(
      env.DB
    );

  const now =
    new Date().toISOString();

  /*
   * В существующей таблице
   * publications нет author_name.
   *
   * Поэтому имя автора сохраняем
   * через contact_name, если
   * contact_name ещё не передан.
   */

  const finalContactName =
    contactName ||
    authorName;

  /* ----------------------------------------------------------
     HASHTAGS
  ---------------------------------------------------------- */

  const hashtags =
    JSON.stringify(
      tags
    );

  /* ----------------------------------------------------------
     MEDIA JSON
  ---------------------------------------------------------- */

  const mediaJson =
    JSON.stringify(
      media
    );

  /* ----------------------------------------------------------
     INSERT PUBLICATION
  ---------------------------------------------------------- */

  const insertPublication = env.DB
    .prepare(`
      INSERT INTO publications (
        id,
        user_id,
        title,
        text,
        category,
        city,
        country,
        hashtags,
        media,
        status,
        views,
        likes,
        comments,
        saves,
        shares,
        love,
        support,
        funny,
        wow,
        sad,
        angry,
        price,
        pinned,
        featured,
        created_at,
        updated_at,
        tracking_code,
        subcategory,
        location,
        scope,
        event_start,
        event_end,
        deadline,
        currency,
        employment_type,
        experience,
        published_at,
        rejection_reason,
        translate_all,
        language,
        contact_telegram,
        contact_email,
        contact_phone,
        contact_name,
        education,
        work_format,
        external_url,
        languages
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, ?, 0, 0, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        NULL, NULL, ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      )
    `)
    .bind(
      id,
      userId,
      title,
      content,
      category,
      city,
      country,
      hashtags,
      mediaJson,

      "pending",

      price,

      now,
      now,

      trackingCode,

      subcategory,
      location,
      scope,
      eventStart,
      eventEnd,
      deadline,
      currency,
      employmentType,
      experience,

      translateAll,
      language,

      contactTelegram,
      contactEmail,
      contactPhone,
      finalContactName,
      education,
      workFormat,
      externalUrl,

      JSON.stringify(
        languages
      )
    );

  /* ----------------------------------------------------------
     MEDIA INSERTS
  ---------------------------------------------------------- */

  const statements = [
    insertPublication
  ];

  for (
    const item of media
  ) {
    statements.push(
      env.DB
        .prepare(`
          INSERT INTO publication_media (
            id,
            publication_id,
            media_type,
            media_url,
            media_caption,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          crypto.randomUUID(),
          id,
          item.type,
          item.url,
          item.caption || "",
          now
        )
    );
  }

  /* ----------------------------------------------------------
     BATCH
  ---------------------------------------------------------- */

  await env.DB.batch(
    statements
  );

  /* ----------------------------------------------------------
     RESPONSE
  ---------------------------------------------------------- */

  return jsonResponse(
    {
      success: true,
      ok: true,

      message:
        "Публикация успешно отправлена на модерацию.",

      tracking_code:
        trackingCode,

      publication: {
        id,
        tracking_code:
          trackingCode,
        status: "pending",
        title,
        category,
        city,
        created_at: now
      }
    },
    201
  );
}

/* ============================================================
   TRACKING CODE
============================================================ */

async function generateTrackingCode(
  db
) {
  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    const random =
      crypto.randomUUID()
        .replaceAll(
          "-",
          ""
        )
        .slice(
          0,
          8
        )
        .toUpperCase();

    const code =
      `TO-${random}`;

    const existing =
      await db
        .prepare(`
          SELECT id
          FROM publications
          WHERE tracking_code = ?
          LIMIT 1
        `)
        .bind(code)
        .first();

    if (!existing) {
      return code;
    }
  }

  throw new Error(
    "Unable to generate unique tracking code"
  );
}

/* ============================================================
   NORMALIZE PUBLICATION
============================================================ */

function normalizePublicationFromDb(
  row
) {
  let hashtags = [];
  let media = [];
  let languages = [];

  try {
    if (
      row.hashtags
    ) {
      hashtags =
        JSON.parse(
          row.hashtags
        );
    }
  } catch {
    hashtags =
      row.hashtags
        ? String(
            row.hashtags
          )
            .split(",")
            .map(
              item =>
                item.trim()
            )
            .filter(Boolean)
        : [];
  }

  try {
    if (
      row.media
    ) {
      media =
        JSON.parse(
          row.media
        );
    }
  } catch {
    media = [];
  }

  try {
    if (
      row.languages
    ) {
      languages =
        JSON.parse(
          row.languages
        );
    }
  } catch {
    languages =
      row.languages
        ? String(
            row.languages
          )
            .split(",")
            .map(
              item =>
                item.trim()
            )
            .filter(Boolean)
        : [];
  }

  return {
    ...row,

    content:
      row.text || "",

    tags:
      hashtags,

    languages,

    media
  };
}

/* ============================================================
   PROFILE API
============================================================ */

async function handleProfile(
  request,
  env
) {
  const method =
    request.method.toUpperCase();

  if (
    method === "GET"
  ) {
    const userId =
      getUserId(request);

    if (!userId) {
      return jsonResponse({
        success: true,
        authenticated: false,
        profile: null
      });
    }

    const profile =
      await readKV(
        env,
        `profile:${userId}`
      );

    return jsonResponse({
      success: true,
      authenticated: true,
      profile:
        profile ||
        createEmptyProfile(
          userId
        )
    });
  }

  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH"
  ) {
    const userId =
      getUserId(request);

    if (!userId) {
      return jsonResponse(
        {
          success: false,
          error:
            "AUTH_REQUIRED",
          message:
            "Необходима авторизация."
        },
        401
      );
    }

    const body =
      await readJson(
        request
      );

    const oldProfile =
      (await readKV(
        env,
        `profile:${userId}`
      )) ||
      createEmptyProfile(
        userId
      );

    const profile = {
      ...oldProfile,
      ...sanitizeProfile(
        body
      ),
      id: userId,
      updatedAt:
        new Date().toISOString()
    };

    await writeKV(
      env,
      `profile:${userId}`,
      profile
    );

    return jsonResponse({
      success: true,
      profile
    });
  }

  return jsonResponse(
    {
      success: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   OPPORTUNITIES API
============================================================ */

async function handleOpportunities(
  request,
  env
) {
  const method =
    request.method.toUpperCase();

  if (
    method === "GET"
  ) {
    const url =
      new URL(request.url);

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
      );

    const limit =
      clampNumber(
        url.searchParams.get(
          "limit"
        ),
        1,
        100,
        30
      );

    let opportunities =
      (await readKV(
        env,
        "opportunities:index"
      )) || [];

    if (category) {
      opportunities =
        opportunities.filter(
          item =>
            String(
              item.category || ""
            ).toLowerCase() ===
            category.toLowerCase()
        );
    }

    if (city) {
      opportunities =
        opportunities.filter(
          item =>
            String(
              item.city || ""
            ).toLowerCase() ===
            city.toLowerCase()
        );
    }

    if (search) {
      const q =
        search.toLowerCase();

      opportunities =
        opportunities.filter(
          item => {
            const text = [
              item.title,
              item.description,
              item.company,
              item.city,
              item.category
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return text.includes(q);
          }
        );
    }

    opportunities =
      opportunities
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        )
        .slice(
          0,
          limit
        );

    return jsonResponse({
      success: true,
      total:
        opportunities.length,
      opportunities
    });
  }

  if (
    method === "POST"
  ) {
    const userId =
      getUserId(request);

    if (!userId) {
      return jsonResponse(
        {
          success: false,
          error:
            "AUTH_REQUIRED"
        },
        401
      );
    }

    const body =
      await readJson(
        request
      );

    if (!body.title) {
      return jsonResponse(
        {
          success: false,
          error:
            "TITLE_REQUIRED"
        },
        400
      );
    }

    const opportunity = {
      id:
        crypto.randomUUID(),

      ownerId:
        userId,

      title:
        cleanText(
          body.title,
          180
        ),

      description:
        cleanText(
          body.description,
          5000
        ),

      category:
        cleanText(
          body.category,
          100
        ),

      city:
        cleanText(
          body.city,
          100
        ),

      company:
        cleanText(
          body.company,
          180
        ),

      salary:
        cleanText(
          body.salary,
          150
        ),

      schedule:
        cleanText(
          body.schedule,
          150
        ),

      status:
        "active",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };

    const list =
      (await readKV(
        env,
        "opportunities:index"
      )) || [];

    list.unshift(
      opportunity
    );

    await writeKV(
      env,
      "opportunities:index",
      list.slice(
        0,
        1000
      )
    );

    return jsonResponse(
      {
        success: true,
        opportunity
      },
      201
    );
  }

  return jsonResponse(
    {
      success: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   USER MESSAGES
============================================================ */

async function handleMessages(
  request,
  env
) {
  const method =
    request.method.toUpperCase();

  const userId =
    getUserId(request);

  if (!userId) {
    return jsonResponse(
      {
        success: false,
        error:
          "AUTH_REQUIRED"
      },
      401
    );
  }

  if (
    method === "GET"
  ) {
    const messages =
      (await readKV(
        env,
        `messages:${userId}`
      )) || [];

    return jsonResponse({
      success: true,
      messages
    });
  }

  if (
    method === "POST"
  ) {
    const body =
      await readJson(
        request
      );

    if (!body.text) {
      return jsonResponse(
        {
          success: false,
          error:
            "MESSAGE_REQUIRED"
        },
        400
      );
    }

    const message = {
      id:
        crypto.randomUUID(),

      userId,

      text:
        cleanText(
          body.text,
          5000
        ),

      createdAt:
        new Date().toISOString(),

      read: false
    };

    const messages =
      (await readKV(
        env,
        `messages:${userId}`
      )) || [];

    messages.push(
      message
    );

    await writeKV(
      env,
      `messages:${userId}`,
      messages.slice(
        -500
      )
    );

    return jsonResponse(
      {
        success: true,
        message
      },
      201
    );
  }

  return jsonResponse(
    {
      success: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   ADMIN CHAT
============================================================ */

async function handleAdminChat(
  request,
  env
) {
  const method =
    request.method.toUpperCase();

  const userId =
    getUserId(request);

  /* ----------------------------------------------------------
     POST MESSAGE
  ---------------------------------------------------------- */

  if (
    method === "POST"
  ) {
    const body =
      await readJson(
        request
      );

    if (!body.text) {
      return jsonResponse(
        {
          success: false,
          error:
            "MESSAGE_REQUIRED"
        },
        400
      );
    }

    const anonymous =
      body.anonymous === true;

    const conversationId =
      body.conversationId ||
      crypto.randomUUID();

    const message = {
      id:
        crypto.randomUUID(),

      conversationId,

      senderType:
        "user",

      userId:
        userId || null,

      anonymous,

      text:
        cleanText(
          body.text,
          5000
        ),

      createdAt:
        new Date().toISOString(),

      readByAdmin:
        false
    };

    const key =
      `admin-chat:${conversationId}`;

    const conversation =
      (await readKV(
        env,
        key
      )) || {
        id:
          conversationId,

        userId:
          userId || null,

        anonymous,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),

        messages: []
      };

    conversation.messages.push(
      message
    );

    conversation.updatedAt =
      new Date().toISOString();

    await writeKV(
      env,
      key,
      conversation
    );

    const conversations =
      (await readKV(
        env,
        "admin-chat:index"
      )) || [];

    const existing =
      conversations.find(
        item =>
          item.id ===
          conversationId
      );

    if (!existing) {
      conversations.unshift({
        id:
          conversationId,

        userId:
          userId || null,

        anonymous,

        unread:
          true,

        createdAt:
          conversation.createdAt,

        updatedAt:
          conversation.updatedAt
      });
    } else {
      existing.unread =
        true;

      existing.updatedAt =
        conversation.updatedAt;
    }

    await writeKV(
      env,
      "admin-chat:index",
      conversations.slice(
        0,
        1000
      )
    );

    return jsonResponse(
      {
        success: true,
        conversationId,
        message
      },
      201
    );
  }

  /* ----------------------------------------------------------
     GET
  ---------------------------------------------------------- */

  if (
    method === "GET"
  ) {
    const url =
      new URL(request.url);

    const conversationId =
      url.searchParams.get(
        "conversationId"
      );

    if (!conversationId) {
      return jsonResponse({
        success: true,

        conversations:
          (await readKV(
            env,
            "admin-chat:index"
          )) || []
      });
    }

    const conversation =
      await readKV(
        env,
        `admin-chat:${conversationId}`
      );

    return jsonResponse({
      success: true,
      conversation:
        conversation || null
    });
  }

  return jsonResponse(
    {
      success: false,
      error:
        "METHOD_NOT_ALLOWED"
    },
    405
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

async function handleNotifications(
  request,
  env
) {
  const userId =
    getUserId(request);

  if (!userId) {
    return jsonResponse(
      {
        success: false,
        error:
          "AUTH_REQUIRED"
      },
      401
    );
  }

  const notifications =
    (await readKV(
      env,
      `notifications:${userId}`
    )) || [];

  return jsonResponse({
    success: true,

    unread:
      notifications.filter(
        item =>
          !item.read
      ).length,

    notifications
  });
}

/* ============================================================
   PROFILE HELPERS
============================================================ */

function createEmptyProfile(
  userId
) {
  return {
    id: userId,

    name: "",

    username: "",

    avatar: "",

    cover: "",

    bio: "",

    city: "",

    phone: "",

    email: "",

    verified: false,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };
}

function sanitizeProfile(
  data
) {
  return {
    name:
      cleanText(
        data.name,
        120
      ),

    username:
      cleanText(
        data.username,
        80
      ),

    avatar:
      cleanText(
        data.avatar,
        1000
      ),

    cover:
      cleanText(
        data.cover,
        1000
      ),

    bio:
      cleanText(
        data.bio,
        2000
      ),

    city:
      cleanText(
        data.city,
        100
      ),

    phone:
      cleanText(
        data.phone,
        50
      ),

    email:
      cleanText(
        data.email,
        200
      )
  };
}

/* ============================================================
   KV STORAGE
============================================================ */

async function readKV(
  env,
  key
) {
  if (
    env.DATA &&
    typeof env.DATA.get ===
      "function"
  ) {
    return env.DATA.get(
      key,
      "json"
    );
  }

  if (
    env.KV &&
    typeof env.KV.get ===
      "function"
  ) {
    return env.KV.get(
      key,
      "json"
    );
  }

  return null;
}

async function writeKV(
  env,
  key,
  value
) {
  if (
    env.DATA &&
    typeof env.DATA.put ===
      "function"
  ) {
    await env.DATA.put(
      key,
      JSON.stringify(
        value
      )
    );

    return true;
  }

  if (
    env.KV &&
    typeof env.KV.put ===
      "function"
  ) {
    await env.KV.put(
      key,
      JSON.stringify(
        value
      )
    );

    return true;
  }

  return false;
}

/* ============================================================
   USER IDENTIFICATION
============================================================ */

function getUserId(
  request
) {
  /* ----------------------------------------------------------
     X-User-ID
  ---------------------------------------------------------- */

  const header =
    request.headers.get(
      "X-User-ID"
    );

  if (header) {
    return sanitizeId(
      header
    );
  }

  /* ----------------------------------------------------------
     BEARER
  ---------------------------------------------------------- */

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
    return sanitizeId(
      authorization.slice(
        7
      )
    );
  }

  return null;
}

function sanitizeId(
  value
) {
  return String(value)
    .trim()
    .replace(
      /[^a-zA-Z0-9_\-:.@]/g,
      ""
    )
    .slice(
      0,
      200
    ) || null;
}

/* ============================================================
   JSON
============================================================ */

async function readJson(
  request
) {
  const contentType =
    request.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    return {};
  }

  try {
    const text =
      await request.text();

    if (!text) {
      return {};
    }

    const parsed =
      JSON.parse(text);

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return {};
    }

    return parsed;
  } catch {
    throw new Error(
      "Invalid JSON body"
    );
  }
}

/* ============================================================
   JSON RESPONSE
============================================================ */

function jsonResponse(
  data,
  status = 200,
  extraHeaders = {}
) {
  const headers =
    new Headers(
      JSON_HEADERS
    );

  Object.entries(
    extraHeaders
  ).forEach(
    ([key, value]) =>
      headers.set(
        key,
        String(value)
      )
  );

  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,
      headers
    }
  );
}

/* ============================================================
   HTML RESPONSE
============================================================ */

function htmlResponse(
  html,
  status = 200
) {
  return new Response(
    html,
    {
      status,
      headers: {
        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "no-store"
      }
    }
  );
}

/* ============================================================
   CORS
============================================================ */

function corsResponse() {
  return new Response(
    null,
    {
      status: 204,

      headers: {
        "Access-Control-Allow-Origin":
          "*",

        "Access-Control-Allow-Methods":
          ALLOWED_METHODS.join(
            ", "
          ),

        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-User-ID",

        "Access-Control-Max-Age":
          "86400"
      }
    }
  );
}

/* ============================================================
   SECURITY HEADERS
============================================================ */

function addSecurityHeaders(
  response
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
    "Access-Control-Allow-Origin",
    "*"
  );

  headers.set(
    "Access-Control-Allow-Methods",
    ALLOWED_METHODS.join(
      ", "
    )
  );

  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-User-ID"
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

function addRequestId(
  response,
  requestId
) {
  const headers =
    new Headers(
      response.headers
    );

  headers.set(
    "X-Request-ID",
    requestId
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

/* ============================================================
   TEXT HELPERS
============================================================ */

function cleanText(
  value,
  maxLength = 1000
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(
      /\u0000/g,
      ""
    )
    .trim()
    .slice(
      0,
      maxLength
    );
}

/* ============================================================
   URL HELPERS
============================================================ */

function cleanUrl(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const url =
    String(value).trim();

  return isHttpUrl(
    url
  )
    ? url.slice(
        0,
        2000
      )
    : "";
}

function isHttpUrl(
  value
) {
  try {
    const url =
      new URL(
        String(value)
      );

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

/* ============================================================
   DATE HELPERS
============================================================ */

function normalizeDateValue(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const text =
    String(value).trim();

  if (!text) {
    return null;
  }

  const date =
    new Date(text);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

/* ============================================================
   LIST HELPERS
============================================================ */

function normalizeList(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        item =>
          cleanText(
            item,
            100
          )
      )
      .filter(Boolean)
      .slice(
        0,
        100
      );
  }

  return String(value)
    .split(
      /[,;\n]/
    )
    .map(
      item =>
        cleanText(
          item,
          100
        )
    )
    .filter(Boolean)
    .slice(
      0,
      100
    );
}

/* ============================================================
   MEDIA HELPERS
============================================================ */

function normalizeMedia(
  value
) {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      item => {
        if (
          typeof item ===
          "string"
        ) {
          return {
            type:
              "image",
            url:
              cleanText(
                item,
                2000
              ),
            caption:
              ""
          };
        }

        if (
          !item ||
          typeof item !==
            "object"
        ) {
          return null;
        }

        const type =
          cleanText(
            item.type ||
              item.media_type ||
              "image",
            50
          );

        const url =
          cleanText(
            item.url ||
              item.media_url ||
              "",
            2000
          );

        const caption =
          cleanText(
            item.caption ||
              item.media_caption ||
              "",
            500
          );

        if (!url) {
          return null;
        }

        return {
          type:
            type || "image",

          url,

          caption
        };
      }
    )
    .filter(Boolean)
    .slice(
      0,
      50
    );
}

/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHtml(
  value
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
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

  if (
    path.length > 1 &&
    path.endsWith("/")
  ) {
    return path.slice(
      0,
      -1
    );
  }

  return path;
}

/* ============================================================
   NUMBER
============================================================ */

function clampNumber(
  value,
  min,
  max,
  fallback
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(
      min,
      Math.floor(number)
    )
  );
    }
