/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   works.js
   Professional universal platform controller
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. GLOBAL CONFIG
     ============================================================ */

  const TO = window.TO = window.TO || {};

  TO.version = "4.0.0";
  TO.name = "Tajik Opportunities";
  TO.username = "@tajikopportunities";

  TO.config = {
    apiPrefix: "/api",
    siteName: "Tajik Opportunities",
    officialName: "🇹🇯 Tajik Opportunities✅",
    officialUsername: "@tajikopportunities",

    sessionCookie: "to_session",
    adminCookie: "to_admin",

    requestTimeout: 20000,
    pollingInterval: 15000,
    notificationInterval: 20000,
    viewDelay: 2500,

    debug: false
  };

  /* ============================================================
     2. CONSTANTS
     ============================================================ */

  TO.categories = [
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

  TO.reactions = [
    "like",
    "love",
    "support",
    "funny",
    "wow",
    "sad",
    "angry"
  ];

  TO.statuses = {
    pending: "На проверке",
    waiting_payment: "Ожидает оплаты",
    paid: "Оплачено",
    published: "Опубликовано",
    rejected: "Отклонено",
    hidden: "Скрыто",
    deleted: "Удалено"
  };

  TO.storage = {
    actor: "to_actor",
    testMode: "to_test_mode",
    stats: "to_manual_stats",
    theme: "to_theme",
    language: "to_language",
    translationCache: "to_translation_cache",
    viewed: "to_viewed_publications",
    saved: "to_saved_publications",
    drafts: "to_publication_drafts",
    lastNotificationCheck: "to_last_notification_check"
  };

  /* ============================================================
     3. BASIC HELPERS
     ============================================================ */

  TO.isBrowser = typeof window !== "undefined";

  TO.log = function (...args) {
    if (TO.config.debug && console && console.log) {
      console.log("[TO]", ...args);
    }
  };

  TO.warn = function (...args) {
    if (console && console.warn) {
      console.warn("[Tajik Opportunities]", ...args);
    }
  };

  TO.error = function (...args) {
    if (console && console.error) {
      console.error("[Tajik Opportunities]", ...args);
    }
  };

  TO.q = function (selector, root = document) {
    try {
      return root.querySelector(selector);
    } catch {
      return null;
    }
  };

  TO.qa = function (selector, root = document) {
    try {
      return Array.from(root.querySelectorAll(selector));
    } catch {
      return [];
    }
  };

  TO.byId = function (id) {
    return document.getElementById(id);
  };

  TO.exists = function (selector) {
    return !!TO.q(selector);
  };

  TO.escape = function (value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  TO.text = function (value, fallback = "") {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return String(value);
  };

  TO.number = function (value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  TO.bool = function (value) {
    if (typeof value === "boolean") return value;

    if (
      value === "true" ||
      value === "1" ||
      value === 1 ||
      value === "yes"
    ) {
      return true;
    }

    return false;
  };

  TO.now = function () {
    return new Date();
  };

  TO.isoNow = function () {
    return new Date().toISOString();
  };

  TO.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  TO.debounce = function (fn, delay = 300) {
    let timer;

    return function (...args) {
      clearTimeout(timer);

      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };

  TO.throttle = function (fn, delay = 300) {
    let waiting = false;

    return function (...args) {
      if (waiting) return;

      waiting = true;

      fn.apply(this, args);

      setTimeout(() => {
        waiting = false;
      }, delay);
    };
  };

  /* ============================================================
     4. LOCAL STORAGE
     ============================================================ */

  TO.store = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);

        if (value === null) {
          return fallback;
        }

        return JSON.parse(value);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  };

  /* ============================================================
     5. TOAST / NOTIFICATIONS
     ============================================================ */

  TO.toast = function (message, type = "info", duration = 3500) {
    if (!document.body) return;

    let container = TO.byId("toToastContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "toToastContainer";

      container.style.cssText = `
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:999999;
        display:flex;
        flex-direction:column;
        gap:10px;
        max-width:min(420px,calc(100vw - 36px));
        pointer-events:none;
      `;

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.style.cssText = `
      pointer-events:auto;
      padding:13px 16px;
      border-radius:14px;
      background:#111827;
      color:white;
      box-shadow:0 10px 35px rgba(0,0,0,.25);
      font-size:14px;
      line-height:1.45;
      animation:toToastIn .2s ease;
    `;

    if (type === "success") {
      toast.style.background = "#166534";
    }

    if (type === "error") {
      toast.style.background = "#991b1b";
    }

    if (type === "warning") {
      toast.style.background = "#92400e";
    }

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = ".2s";

      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  if (!document.getElementById("toToastStyle")) {
    const style = document.createElement("style");

    style.id = "toToastStyle";

    style.textContent = `
      @keyframes toToastIn {
        from {
          opacity:0;
          transform:translateY(10px);
        }
        to {
          opacity:1;
          transform:translateY(0);
        }
      }
    `;

    document.head.appendChild(style);
  }

  TO.confirm = async function (message) {
    return window.confirm(message);
  };

  /* ============================================================
     6. API CORE
     ============================================================ */

  TO.api = async function (
    endpoint,
    options = {}
  ) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, options.timeout || TO.config.requestTimeout);

    const method = options.method || "GET";

    const headers = {
      Accept: "application/json",
      ...(options.headers || {})
    };

    let body = options.body;

    if (
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob)
    ) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    try {
      const response = await fetch(
        endpoint.startsWith("/")
          ? endpoint
          : TO.config.apiPrefix + endpoint,
        {
          method,
          headers,
          body,
          credentials: "include",
          signal: controller.signal
        }
      );

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          raw: text
        };
      }

      if (!response.ok) {
        const error = new Error(
          data?.error ||
          data?.message ||
          `HTTP ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
      }

      return data;
    } finally {
      clearTimeout(timeout);
    }
  };

  TO.tryApi = async function (endpoint, options = {}, fallback = null) {
    try {
      return await TO.api(endpoint, options);
    } catch (error) {
      TO.log("API unavailable:", endpoint, error);

      return fallback;
    }
  };

  /* ============================================================
     7. NORMALIZE API DATA
     ============================================================ */

  TO.pick = function (object, keys, fallback = null) {
    if (!object) return fallback;

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ""
      ) {
        return object[key];
      }
    }

    return fallback;
  };

  TO.normalizeUser = function (user = {}) {
    return {
      id: TO.pick(user, ["id", "user_id", "uid"]),
      name: TO.pick(
        user,
        ["name", "full_name", "display_name"],
        ""
      ),
      surname: TO.pick(user, ["surname", "last_name"], ""),
      username: TO.pick(
        user,
        ["username", "user_name", "handle"],
        ""
      ),
      avatar: TO.pick(
        user,
        ["avatar", "avatar_url", "photo", "photo_url"],
        ""
      ),
      bio: TO.pick(user, ["bio", "description"], ""),
      country: TO.pick(user, ["country"], ""),
      city: TO.pick(user, ["city"], ""),
      verified: TO.bool(
        TO.pick(user, ["verified", "is_verified"], false)
      ),
      online: TO.bool(
        TO.pick(user, ["online", "is_online"], false)
      ),
      createdAt: TO.pick(
        user,
        ["created_at", "registration_date", "registered_at"],
        null
      )
    };
  };

  TO.normalizePublication = function (post = {}) {
    return {
      id: TO.pick(post, [
        "id",
        "publication_id",
        "post_id"
      ]),

      title: TO.pick(
        post,
        ["title", "name", "headline"],
        ""
      ),

      text: TO.pick(
        post,
        ["text", "content", "description", "body"],
        ""
      ),

      category: TO.pick(
        post,
        ["category", "category_id", "type"],
        "other"
      ),

      status: TO.pick(
        post,
        ["status", "publication_status"],
        "published"
      ),

      authorId: TO.pick(
        post,
        ["author_id", "user_id", "owner_id"],
        null
      ),

      authorName: TO.pick(
        post,
        ["author_name", "name", "author"],
        ""
      ),

      authorUsername: TO.pick(
        post,
        [
          "author_username",
          "username",
          "author_handle"
        ],
        ""
      ),

      authorAvatar: TO.pick(
        post,
        [
          "author_avatar",
          "avatar",
          "avatar_url"
        ],
        ""
      ),

      country: TO.pick(post, ["country"], ""),
      city: TO.pick(post, ["city"], ""),

      price: TO.pick(
        post,
        ["price", "amount", "salary"],
        null
      ),

      currency: TO.pick(
        post,
        ["currency", "currency_code"],
        ""
      ),

      views: TO.number(
        TO.pick(
          post,
          ["views", "views_count", "view_count"],
          0
        )
      ),

      likes: TO.number(
        TO.pick(
          post,
          ["likes", "likes_count"],
          0
        )
      ),

      comments: TO.number(
        TO.pick(
          post,
          ["comments", "comments_count"],
          0
        )
      ),

      shares: TO.number(
        TO.pick(
          post,
          ["shares", "shares_count"],
          0
        )
      ),

      saves: TO.number(
        TO.pick(
          post,
          ["saves", "saves_count"],
          0
        )
      ),

      reactions: TO.number(
        TO.pick(
          post,
          ["reactions", "reactions_count"],
          0
        )
      ),

      createdAt: TO.pick(
        post,
        [
          "created_at",
          "published_at",
          "date",
          "created"
        ],
        null
      ),

      updatedAt: TO.pick(
        post,
        ["updated_at", "edited_at"],
        null
      ),

      media: Array.isArray(post.media)
        ? post.media
        : [],

      url: TO.pick(
        post,
        ["url", "link", "external_url"],
        ""
      ),

      raw: post
    };
  };

  /* ============================================================
     8. AUTH
     ============================================================ */

  TO.auth = {
    user: null,
    admin: null,
    initialized: false,

    async me() {
      const data = await TO.tryApi(
        "/api/auth/me",
        {},
        null
      );

      if (!data) {
        this.user = null;
        return null;
      }

      this.user =
        data.user ||
        data.profile ||
        data.me ||
        data;

      return this.user;
    },

    async adminMe() {
      const data = await TO.tryApi(
        "/api/admin/me",
        {},
        null
      );

      if (!data) {
        this.admin = null;
        return null;
      }

      this.admin =
        data.admin ||
        data.user ||
        data.me ||
        data;

      return this.admin;
    },

    async logout() {
      await TO.tryApi(
        "/api/auth/logout",
        {
          method: "POST"
        }
      );

      this.user = null;

      TO.toast(
        "Вы вышли из аккаунта",
        "success"
      );

      setTimeout(() => {
        if (
          location.pathname !== "/index.html" &&
          location.pathname !== "/"
        ) {
          location.href = "/";
        }
      }, 500);
    },

    isLoggedIn() {
      return !!this.user;
    },

    isAdmin() {
      return !!this.admin;
    },

    getUser() {
      return TO.normalizeUser(this.user || {});
    }
  };

  /* ============================================================
     9. ACTOR / TEST MODE
     ============================================================ */

  TO.actor = {
    selected: null,

    load() {
      this.selected = TO.store.get(
        TO.storage.actor,
        null
      );

      return this.selected;
    },

    select(user) {
      if (!user) {
        this.clear();
        return;
      }

      this.selected = TO.normalizeUser(user);

      TO.store.set(
        TO.storage.actor,
        this.selected
      );

      TO.toast(
        `Выбран участник: ${
          this.selected.name ||
          this.selected.username ||
          this.selected.id
        }`,
        "success"
      );

      this.renderIndicator();
    },

    clear() {
      this.selected = null;

      TO.store.remove(
        TO.storage.actor
      );

      this.renderIndicator();
    },

    enableTestMode() {
      TO.store.set(
        TO.storage.testMode,
        true
      );

      this.renderIndicator();

      TO.toast(
        "Тестовый режим администратора включён",
        "warning"
      );
    },

    disableTestMode() {
      TO.store.set(
        TO.storage.testMode,
        false
      );

      this.renderIndicator();
    },

    testMode() {
      return !!TO.store.get(
        TO.storage.testMode,
        false
      );
    },

    get() {
      return this.selected;
    },

    active() {
      return (
        this.testMode() &&
        !!this.selected
      );
    },

    renderIndicator() {
      const old = TO.byId(
        "toActorIndicator"
      );

      if (old) old.remove();

      if (!this.active()) return;

      const el = document.createElement("div");

      el.id = "toActorIndicator";

      el.style.cssText = `
        position:fixed;
        left:50%;
        top:10px;
        transform:translateX(-50%);
        z-index:999998;
        padding:9px 14px;
        border-radius:999px;
        background:#7c2d12;
        color:white;
        font:600 13px Arial,sans-serif;
        box-shadow:0 6px 20px rgba(0,0,0,.25);
      `;

      el.textContent =
        "🧪 ТЕСТОВЫЙ РЕЖИМ · " +
        (
          this.selected.name ||
          this.selected.username ||
          this.selected.id
        );

      document.body.appendChild(el);
    }
  };

  /* ============================================================
     10. CATEGORIES
     ============================================================ */

  TO.category = {
    label(id) {
      const found = TO.categories.find(
        item => item[0] === id
      );

      return found
        ? found[1]
        : id || "➕ Другое";
    },

    async load() {
      const data = await TO.tryApi(
        "/api/categories",
        {},
        null
      );

      if (!data) {
        return TO.categories;
      }

      const list =
        data.categories ||
        data.items ||
        data;

      if (Array.isArray(list)) {
        return list;
      }

      return TO.categories;
    }
  };

  /* ============================================================
     11. PUBLICATIONS
     ============================================================ */

  TO.publications = {
    async list(params = {}) {
      const query = new URLSearchParams();

      Object.entries(params).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            query.set(key, value);
          }
        }
      );

      const endpoint =
        "/api/publications" +
        (query.toString()
          ? "?" + query.toString()
          : "");

      const data = await TO.api(endpoint);

      const list =
        data.publications ||
        data.posts ||
        data.items ||
        data.data ||
        data;

      return Array.isArray(list)
        ? list.map(TO.normalizePublication)
        : [];
    },

    async get(id) {
      if (!id) return null;

      const data = await TO.api(
        `/api/publications/${encodeURIComponent(id)}`
      );

      return TO.normalizePublication(
        data.publication ||
        data.post ||
        data
      );
    },

    async create(payload) {
      const data = await TO.api(
        "/api/publications",
        {
          method: "POST",
          body: payload
        }
      );

      TO.toast(
        "Публикация отправлена на проверку",
        "success"
      );

      return data;
    },

    async view(id) {
      if (!id) return;

      const viewed =
        TO.store.get(
          TO.storage.viewed,
          []
        );

      if (viewed.includes(String(id))) {
        return;
      }

      try {
        await TO.api(
          "/api/publications/view",
          {
            method: "POST",
            body: {
              publication_id: id,
              id
            }
          }
        );

        viewed.push(String(id));

        TO.store.set(
          TO.storage.viewed,
          viewed.slice(-1000)
        );
      } catch {}
    },

    async react(id, reaction = "like") {
      if (!id) return null;

      const data = await TO.api(
        "/api/publications/react",
        {
          method: "POST",
          body: {
            publication_id: id,
            id,
            reaction,
            type: reaction
          }
        }
      );

      TO.toast(
        "Реакция сохранена",
        "success"
      );

      return data;
    },

    async save(id) {
      if (!id) return null;

      const data = await TO.api(
        "/api/publications/save",
        {
          method: "POST",
          body: {
            publication_id: id,
            id
          }
        }
      );

      const saved =
        TO.store.get(
          TO.storage.saved,
          []
        );

      if (!saved.includes(String(id))) {
        saved.push(String(id));
      }

      TO.store.set(
        TO.storage.saved,
        saved
      );

      TO.toast(
        "Публикация сохранена",
        "success"
      );

      return data;
    },

    async share(id) {
      if (!id) return null;

      const data = await TO.api(
        "/api/publications/share",
        {
          method: "POST",
          body: {
            publication_id: id,
            id
          }
        }
      );

      const url =
        `${location.origin}/publication.html?id=${encodeURIComponent(id)}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: TO.config.siteName,
            url
          });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);

          TO.toast(
            "Ссылка скопирована",
            "success"
          );
        }
      } catch {}

      return data;
    }
  };

  /* ============================================================
     12. COMMENTS
     ============================================================ */

  TO.comments = {
    async list(publicationId) {
      if (!publicationId) return [];

      const data = await TO.api(
        `/api/comments?publication_id=${encodeURIComponent(
          publicationId
        )}`
      );

      const list =
        data.comments ||
        data.items ||
        data;

      return Array.isArray(list)
        ? list
        : [];
    },

    async create(publicationId, text, parentId = null) {
      if (!publicationId || !text?.trim()) {
        throw new Error(
          "Введите текст комментария"
        );
      }

      const payload = {
        publication_id: publicationId,
        text: text.trim(),
        content: text.trim()
      };

      if (parentId) {
        payload.parent_id = parentId;
        payload.reply_to = parentId;
      }

      const data = await TO.api(
        "/api/comments",
        {
          method: "POST",
          body: payload
        }
      );

      TO.toast(
        "Комментарий опубликован",
        "success"
      );

      return data;
    }
  };

  /* ============================================================
     13. SAVED
     ============================================================ */

  TO.saved = {
    has(id) {
      const saved =
        TO.store.get(
          TO.storage.saved,
          []
        );

      return saved.includes(String(id));
    },

    all() {
      return TO.store.get(
        TO.storage.saved,
        []
      );
    },

    clear() {
      TO.store.remove(
        TO.storage.saved
      );
    }
  };

  /* ============================================================
     14. CHAT
     ============================================================ */

  TO.chat = {
    async list() {
      const data = await TO.api(
        "/api/chat"
      );

      return (
        data.chats ||
        data.dialogs ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async messages(userId) {
      if (!userId) return [];

      const data = await TO.api(
        `/api/chat/messages?user_id=${encodeURIComponent(
          userId
        )}`
      );

      return (
        data.messages ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async send(userId, text, extra = {}) {
      if (!text?.trim()) {
        throw new Error(
          "Сообщение пустое"
        );
      }

      if (!userId) {
        throw new Error(
          "Не выбран получатель"
        );
      }

      const payload = {
        user_id: userId,
        recipient_id: userId,
        text: text.trim(),
        content: text.trim(),
        ...extra
      };

      return TO.api(
        "/api/chat/messages",
        {
          method: "POST",
          body: payload
        }
      );
    },

    async read(userId) {
      if (!userId) return null;

      return TO.tryApi(
        "/api/chat/read",
        {
          method: "POST",
          body: {
            user_id: userId,
            recipient_id: userId
          }
        },
        null
      );
    }
  };

  /* ============================================================
     15. ADMIN CHAT
     ============================================================ */

  TO.adminChat = {
    async list() {
      const data = await TO.api(
        "/api/admin/chats"
      );

      return (
        data.chats ||
        data.dialogs ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async messages(userId) {
      const data = await TO.api(
        `/api/admin/chat/messages?user_id=${encodeURIComponent(
          userId
        )}`
      );

      return (
        data.messages ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async send(userId, text, extra = {}) {
      if (!userId) {
        throw new Error(
          "Не выбран участник"
        );
      }

      if (!text?.trim()) {
        throw new Error(
          "Введите сообщение"
        );
      }

      return TO.api(
        "/api/admin/chat/send",
        {
          method: "POST",
          body: {
            user_id: userId,
            recipient_id: userId,

            sender_name:
              TO.config.officialName,

            sender_username:
              TO.config.officialUsername,

            text: text.trim(),
            content: text.trim(),

            ...extra
          }
        }
      );
    }
  };

  /* ============================================================
     16. OFFICIAL ADMIN IDENTITY
     ============================================================ */

  TO.official = {
    name: TO.config.officialName,
    username: TO.config.officialUsername,

    normalize(message = {}) {
      const copy = {
        ...message
      };

      if (
        copy.is_admin ||
        copy.sender_type === "admin" ||
        copy.author_type === "admin"
      ) {
        copy.sender_name =
          TO.config.officialName;

        copy.sender_username =
          TO.config.officialUsername;

        copy.author_name =
          TO.config.officialName;

        copy.author_username =
          TO.config.officialUsername;
      }

      return copy;
    }
  };

  /* ============================================================
     17. NOTIFICATIONS
     ============================================================ */

  TO.notifications = {
    async list() {
      const data = await TO.api(
        "/api/notifications"
      );

      return (
        data.notifications ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async read(id) {
      if (!id) return;

      return TO.api(
        "/api/notifications/read",
        {
          method: "POST",
          body: {
            id,
            notification_id: id
          }
        }
      );
    },

    async readAll() {
      const list =
        await this.list();

      for (const item of list) {
        const id =
          TO.pick(
            item,
            ["id", "notification_id"],
            null
          );

        if (id) {
          await this.read(id);
        }
      }

      TO.toast(
        "Уведомления отмечены как прочитанные",
        "success"
      );
    }
  };

  /* ============================================================
     18. REPORTS
     ============================================================ */

  TO.reports = {
    async create(payload) {
      const possibleEndpoints = [
        "/api/reports",
        "/api/report"
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          const result = await TO.api(
            endpoint,
            {
              method: "POST",
              body: payload
            }
          );

          TO.toast(
            "Жалоба отправлена",
            "success"
          );

          return result;
        } catch {}
      }

      throw new Error(
        "API жалоб пока недоступно"
      );
    },

    async listAdmin() {
      const data = await TO.tryApi(
        "/api/admin/reports",
        {},
        null
      );

      if (!data) return [];

      return (
        data.reports ||
        data.items ||
        data.data ||
        data ||
        []
      );
    }
  };

  /* ============================================================
     19. FOLLOW
     ============================================================ */

  TO.follow = {
    async toggle(userId) {
      if (!userId) {
        throw new Error(
          "Не указан пользователь"
        );
      }

      const endpoints = [
        "/api/follow",
        "/api/followers/toggle",
        "/api/profile/follow"
      ];

      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          return await TO.api(
            endpoint,
            {
              method: "POST",
              body: {
                user_id: userId,
                target_user_id: userId
              }
            }
          );
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError ||
        new Error(
          "Функция подписки пока недоступна"
        );
    }
  };

  /* ============================================================
     20. PROFILE
     ============================================================ */

  TO.profile = {
    async get() {
      const data = await TO.api(
        "/api/profile"
      );

      return (
        data.profile ||
        data.user ||
        data
      );
    },

    async update(payload) {
      return TO.api(
        "/api/profile",
        {
          method: "PUT",
          body: payload
        }
      );
    },

    async public(username) {
      if (!username) return null;

      const data = await TO.api(
        `/api/profile/public?username=${encodeURIComponent(
          username
        )}`
      );

      return (
        data.profile ||
        data.user ||
        data
      );
    }
  };

  /* ============================================================
     21. ADMIN DASHBOARD
     ============================================================ */

  TO.admin = {
    async dashboard() {
      const data = await TO.api(
        "/api/admin/dashboard"
      );

      return (
        data.dashboard ||
        data.stats ||
        data
      );
    },

    async notifications() {
      const data = await TO.api(
        "/api/admin/notifications"
      );

      return (
        data.notifications ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async users(params = {}) {
      const query =
        new URLSearchParams(params);

      const data = await TO.api(
        "/api/admin/users" +
        (
          query.toString()
            ? "?" + query.toString()
            : ""
        )
      );

      return (
        data.users ||
        data.participants ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async user(id) {
      return TO.api(
        `/api/admin/user?id=${encodeURIComponent(id)}`
      );
    },

    async editUser(payload) {
      return TO.api(
        "/api/admin/user/edit",
        {
          method: "POST",
          body: payload
        }
      );
    },

    async userAction(id, action, extra = {}) {
      return TO.api(
        "/api/admin/user/action",
        {
          method: "POST",
          body: {
            id,
            user_id: id,
            action,
            ...extra
          }
        }
      );
    },

    async publications(params = {}) {
      const query =
        new URLSearchParams(params);

      const data = await TO.api(
        "/api/admin/publications" +
        (
          query.toString()
            ? "?" + query.toString()
            : ""
        )
      );

      return (
        data.publications ||
        data.posts ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async editPublication(payload) {
      return TO.api(
        "/api/admin/publication/edit",
        {
          method: "POST",
          body: payload
        }
      );
    },

    async publicationAction(
      id,
      action,
      extra = {}
    ) {
      return TO.api(
        "/api/admin/publication/action",
        {
          method: "POST",
          body: {
            id,
            publication_id: id,
            action,
            ...extra
          }
        }
      );
    },

    async counters(payload) {
      return TO.api(
        "/api/admin/publication/counters",
        {
          method: "POST",
          body: payload
        }
      );
    },

    async comments() {
      const data = await TO.tryApi(
        "/api/admin/comments",
        {},
        null
      );

      if (!data) return [];

      return (
        data.comments ||
        data.items ||
        data.data ||
        data ||
        []
      );
    },

    async editComment(payload) {
      return TO.api(
        "/api/admin/comment/edit",
        {
          method: "POST",
          body: payload
        }
      );
    },

    async commentAction(
      id,
      action,
      extra = {}
    ) {
      return TO.api(
        "/api/admin/comment/action",
        {
          method: "POST",
          body: {
            id,
            comment_id: id,
            action,
            ...extra
          }
        }
      );
    },

    async payment(payload) {
      return TO.api(
        "/api/admin/payment",
        {
          method: "POST",
          body: payload
        }
      );
    }
  };

  /* ============================================================
     22. ADMIN PUBLICATION QUICK ACTIONS
     ============================================================ */

  TO.adminPublicationActions = {
    approve(id) {
      return TO.admin.publicationAction(
        id,
        "approve_free"
      );
    },

    publish(id) {
      return TO.admin.publicationAction(
        id,
        "publish"
      );
    },

    reject(id, reason = "") {
      return TO.admin.publicationAction(
        id,
        "reject",
        { reason }
      );
    },

    hide(id) {
      return TO.admin.publicationAction(
        id,
        "hide"
      );
    },

    delete(id) {
      return TO.admin.publicationAction(
        id,
        "delete"
      );
    },

    restore(id) {
      return TO.admin.publicationAction(
        id,
        "restore"
      );
    },

    pin(id) {
      return TO.admin.publicationAction(
        id,
        "pin"
      );
    },

    feature(id) {
      return TO.admin.publicationAction(
        id,
        "feature"
      );
    },

    payment(id, amount) {
      return TO.admin.publicationAction(
        id,
        "request_payment",
        {
          amount
        }
      );
    }
  };

  /* ============================================================
     23. MANUAL STATISTICS
     ============================================================ */

  TO.stats = {
    defaults: {
      participants: 0,
      publications: 0,
      reactions: 0,
      views: 0,
      shares: 0,
      saves: 0,
      followers: 0,
      subscribers: 0,
      comments: 0,
      notifications: 0,
      messages: 0,
      reports: 0,
      payments: 0,
      jobs: 0,
      projects: 0,
      services: 0,
      usersOnline: 0
    },

    load() {
      return {
        ...this.defaults,
        ...TO.store.get(
          TO.storage.stats,
          {}
        )
      };
    },

    save(stats) {
      TO.store.set(
        TO.storage.stats,
        stats
      );

      return stats;
    },

    get(name) {
      const stats = this.load();

      return TO.number(
        stats[name],
        0
      );
    },

    set(name, value) {
      const stats = this.load();

      stats[name] =
        Math.max(
          0,
          TO.number(value, 0)
        );

      return this.save(stats);
    },

    increment(name, amount = 1) {
      const stats = this.load();

      stats[name] =
        TO.number(
          stats[name],
          0
        ) +
        TO.number(
          amount,
          1
        );

      return this.save(stats);
    },

    render() {
      const stats =
        this.load();

      Object.entries(stats)
        .forEach(
          ([name, value]) => {
            TO.qa(
              `[data-to-stat="${name}"]`
            ).forEach(
              el => {
                el.textContent =
                  Number(value).toLocaleString(
                    "ru-RU"
                  );
              }
            );
          }
        );
    }
  };

  /* ============================================================
     24. DATE / TIME
     ============================================================ */

  TO.date = {
    format(value, options = {}) {
      if (!value) return "";

      const date =
        new Date(value);

      if (Number.isNaN(
        date.getTime()
      )) {
        return String(value);
      }

      return new Intl.DateTimeFormat(
        options.locale || "ru-RU",
        {
          dateStyle:
            options.dateStyle ||
            "medium",
          timeStyle:
            options.timeStyle ||
            undefined
        }
      ).format(date);
    },

    relative(value) {
      if (!value) return "";

      const date =
        new Date(value);

      if (Number.isNaN(
        date.getTime()
      )) {
        return "";
      }

      const diff =
        Date.now() -
        date.getTime();

      const minute = 60000;
      const hour = minute * 60;
      const day = hour * 24;

      if (diff < minute) {
        return "только что";
      }

      if (diff < hour) {
        return (
          Math.floor(diff / minute) +
          " мин назад"
        );
      }

      if (diff < day) {
        return (
          Math.floor(diff / hour) +
          " ч назад"
        );
      }

      if (diff < day * 7) {
        return (
          Math.floor(diff / day) +
          " дн назад"
        );
      }

      return this.format(value);
    }
  };

  /* ============================================================
     25. SEARCH
     ============================================================ */

  TO.search = {
    async publications(query, options = {}) {
      return TO.publications.list({
        search: query,
        q: query,
        ...options
      });
    },

    async users(query) {
      return TO.admin.users({
        search: query,
        q: query,
        username: query
      });
    },

    async all(query) {
      const [
        publications,
        users
      ] = await Promise.allSettled([
        this.publications(query),
        this.users(query)
      ]);

      return {
        publications:
          publications.status === "fulfilled"
            ? publications.value
            : [],

        users:
          users.status === "fulfilled"
            ? users.value
            : []
      };
    }
  };

  /* ============================================================
     26. TRANSLATION
     ============================================================ */

  TO.translation = {
    cache: TO.store.get(
      TO.storage.translationCache,
      {}
    ),

    detect(text) {
      if (!text) return "unknown";

      if (
        /[\u0400-\u04FF]/.test(text)
      ) {
        return "ru";
      }

      if (
        /[اآأإء-ي]/.test(text)
      ) {
        return "fa";
      }

      return "en";
    },

    async translate(
      text,
      target = "ru",
      source = "auto"
    ) {
      if (!text) return "";

      const key =
        `${source}:${target}:${text}`;

      if (this.cache[key]) {
        return this.cache[key];
      }

      /*
       * Translation API is intentionally optional.
       * If backend later provides /api/translate,
       * it will automatically be used.
       */

      try {
        const data =
          await TO.api(
            "/api/translate",
            {
              method: "POST",
              body: {
                text,
                source,
                target
              }
            }
          );

        const result =
          data.translation ||
          data.translated_text ||
          data.text;

        if (result) {
          this.cache[key] = result;

          TO.store.set(
            TO.storage.translationCache,
            this.cache
          );

          return result;
        }
      } catch {}

      return text;
    },

    async translateElement(
      element,
      target
    ) {
      if (!element) return;

      const original =
        element.dataset.toOriginal ||
        element.textContent;

      element.dataset.toOriginal =
        original;

      const translated =
        await this.translate(
          original,
          target
        );

      element.textContent =
        translated;
    }
  };

  /* ============================================================
     27. THEME
     ============================================================ */

  TO.theme = {
    get() {
      return TO.store.get(
        TO.storage.theme,
        "system"
      );
    },

    set(theme) {
      if (
        ![
          "light",
          "dark",
          "system"
        ].includes(theme)
      ) {
        theme = "system";
      }

      TO.store.set(
        TO.storage.theme,
        theme
      );

      this.apply();
    },

    apply() {
      const theme =
        this.get();

      let actual = theme;

      if (theme === "system") {
        actual =
          window.matchMedia &&
          window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
            ? "dark"
            : "light";
      }

      document.documentElement
        .setAttribute(
          "data-theme",
          actual
        );
    },

    toggle() {
      const current =
        this.get();

      this.set(
        current === "dark"
          ? "light"
          : "dark"
      );
    }
  };

  /* ============================================================
     28. URL / NAVIGATION
     ============================================================ */

  TO.nav = {
    go(url) {
      if (!url) return;

      location.href = url;
    },

    publication(id) {
      if (!id) return;

      const urls = [
        `/publication.html?id=${encodeURIComponent(id)}`,
        `/post.html?id=${encodeURIComponent(id)}`,
        `/?publication=${encodeURIComponent(id)}`
      ];

      location.href = urls[0];
    },

    profile(username) {
      if (!username) return;

      location.href =
        `/profile.html?user=${encodeURIComponent(
          username
        )}`;
    },

    chat(userId) {
      if (!userId) return;

      location.href =
        `/messages.html?user=${encodeURIComponent(
          userId
        )}`;
    }
  };

  /* ============================================================
     29. PUBLICATION CARD GENERATOR
     ============================================================ */

  TO.ui = {
    publicationCard(post) {
      const p =
        TO.normalizePublication(post);

      const media =
        p.media?.[0];

      let mediaHTML = "";

      if (
        media &&
        media.url
      ) {
        const type =
          media.type || "";

        if (
          type.startsWith("image") ||
          /\.(jpg|jpeg|png|webp|gif)$/i.test(
            media.url
          )
        ) {
          mediaHTML = `
            <div class="to-publication-media">
              <img
                src="${TO.escape(media.url)}"
                alt="${TO.escape(p.title)}"
                loading="lazy"
              >
            </div>
          `;
        } else if (
          type.startsWith("video")
        ) {
          mediaHTML = `
            <div class="to-publication-media">
              <video
                src="${TO.escape(media.url)}"
                controls
                preload="metadata"
              ></video>
            </div>
          `;
        }
      }

      const author =
        p.authorName ||
        p.authorUsername ||
        "Пользователь";

      return `
        <article
          class="to-publication-card"
          data-publication-id="${TO.escape(p.id)}"
        >

          ${mediaHTML}

          <div class="to-publication-content">

            <div class="to-publication-meta">

              <span>
                ${TO.escape(
                  TO.category.label(
                    p.category
                  )
                )}
              </span>

              ${
                p.status &&
                p.status !== "published"
                  ? `
                    <span>
                      ${TO.escape(
                        TO.statuses[
                          p.status
                        ] ||
                        p.status
                      )}
                    </span>
                  `
                  : ""
              }

            </div>

            <h3>
              ${TO.escape(p.title)}
            </h3>

            ${
              p.text
                ? `
                  <p>
                    ${TO.escape(
                      p.text.slice(
                        0,
                        400
                      )
                    )}
                  </p>
                `
                : ""
            }

            <div class="to-publication-author">
              ${TO.escape(author)}

              ${
                p.authorUsername
                  ? `
                    <span>
                      ${TO.escape(
                        p.authorUsername
                      )}
                    </span>
                  `
                  : ""
              }
            </div>

            <div class="to-publication-stats">

              <span>
                👁️ ${p.views}
              </span>

              <span>
                ❤️ ${
                  p.reactions ||
                  p.likes
                }
              </span>

              <span>
                💬 ${p.comments}
              </span>

              <span>
                🔖 ${p.saves}
              </span>

            </div>

            <div class="to-publication-actions">

              <button
                type="button"
                data-to-action="open-publication"
                data-id="${TO.escape(p.id)}"
              >
                Смотреть
              </button>

              <button
                type="button"
                data-to-action="react"
                data-id="${TO.escape(p.id)}"
              >
                ❤️
              </button>

              <button
                type="button"
                data-to-action="save"
                data-id="${TO.escape(p.id)}"
              >
                🔖
              </button>

              <button
                type="button"
                data-to-action="share"
                data-id="${TO.escape(p.id)}"
              >
                ↗️
              </button>

            </div>

          </div>

        </article>
      `;
    },

    renderPublications(
      container,
      publications
    ) {
      if (!container) return;

      if (!Array.isArray(
        publications
      ) ||
      !publications.length
      ) {
        container.innerHTML = `
          <div class="to-empty">
            Пока ничего нет.
          </div>
        `;

        return;
      }

      container.innerHTML =
        publications
          .map(
            p =>
              this.publicationCard(p)
          )
          .join("");
    }
  };

  /* ============================================================
     30. DELEGATED ACTION SYSTEM
     ============================================================ */

  TO.actions = {};

  TO.actions.openPublication =
    async function (button) {
      const id =
        button.dataset.id ||
        button.dataset.publicationId;

      if (!id) return;

      TO.nav.publication(id);
    };

  TO.actions.react =
    async function (button) {
      const id =
        button.dataset.id;

      const reaction =
        button.dataset.reaction ||
        "like";

      if (!id) return;

      try {
        await TO.publications.react(
          id,
          reaction
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось поставить реакцию",
          "error"
        );
      }
    };

  TO.actions.save =
    async function (button) {
      const id =
        button.dataset.id;

      if (!id) return;

      try {
        await TO.publications.save(
          id
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось сохранить",
          "error"
        );
      }
    };

  TO.actions.share =
    async function (button) {
      const id =
        button.dataset.id;

      if (!id) return;

      try {
        await TO.publications.share(
          id
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось поделиться",
          "error"
        );
      }
    };

  TO.actions.follow =
    async function (button) {
      const id =
        button.dataset.userId ||
        button.dataset.id;

      if (!id) return;

      try {
        await TO.follow.toggle(id);

        TO.toast(
          "Подписка обновлена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось изменить подписку",
          "error"
        );
      }
    };

  TO.actions.openProfile =
    function (button) {
      const username =
        button.dataset.username ||
        button.dataset.user;

      if (username) {
        TO.nav.profile(
          username
        );
      }
    };

  TO.actions.openChat =
    function (button) {
      const id =
        button.dataset.userId ||
        button.dataset.id;

      if (id) {
        TO.nav.chat(id);
      }
    };

  TO.actions.markNotification =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.notifications.read(
          id
        );

        button.disabled = true;

        TO.toast(
          "Уведомление прочитано",
          "success"
        );
      } catch {}
    };

  TO.actions.adminApprove =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.adminPublicationActions
          .approve(id);

        TO.toast(
          "Публикация одобрена",
          "success"
        );

        button.disabled = true;
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось одобрить",
          "error"
        );
      }
    };

  TO.actions.adminReject =
    async function (button) {
      const id =
        button.dataset.id;

      const reason =
        prompt(
          "Причина отклонения:"
        );

      if (reason === null) return;

      try {
        await TO.adminPublicationActions
          .reject(
            id,
            reason
          );

        TO.toast(
          "Публикация отклонена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось отклонить",
          "error"
        );
      }
    };

  TO.actions.adminDelete =
    async function (button) {
      const id =
        button.dataset.id;

      if (
        !await TO.confirm(
          "Удалить публикацию?"
        )
      ) {
        return;
      }

      try {
        await TO.adminPublicationActions
          .delete(id);

        TO.toast(
          "Публикация удалена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось удалить",
          "error"
        );
      }
    };

  TO.actions.adminRestore =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.adminPublicationActions
          .restore(id);

        TO.toast(
          "Публикация восстановлена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось восстановить",
          "error"
        );
      }
    };

  TO.actions.adminPin =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.adminPublicationActions
          .pin(id);

        TO.toast(
          "Публикация закреплена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось закрепить",
          "error"
        );
      }
    };

  TO.actions.adminFeature =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.adminPublicationActions
          .feature(id);

        TO.toast(
          "Публикация добавлена в избранное",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось выполнить действие",
          "error"
        );
      }
    };

  TO.actions.adminBlockUser =
    async function (button) {
      const id =
        button.dataset.userId ||
        button.dataset.id;

      try {
        await TO.admin.userAction(
          id,
          "block"
        );

        TO.toast(
          "Пользователь заблокирован",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось заблокировать",
          "error"
        );
      }
    };

  TO.actions.adminUnblockUser =
    async function (button) {
      const id =
        button.dataset.userId ||
        button.dataset.id;

      try {
        await TO.admin.userAction(
          id,
          "unblock"
        );

        TO.toast(
          "Пользователь разблокирован",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось разблокировать",
          "error"
        );
      }
    };

  /* ============================================================
     31. GLOBAL CLICK HANDLER
     ============================================================ */

  document.addEventListener(
    "click",
    async event => {
      const button =
        event.target.closest(
          "[data-to-action]"
        );

      if (!button) return;

      const action =
        button.dataset.toAction;

      const handler =
        TO.actions[action];

      if (
        typeof handler !==
        "function"
      ) {
        TO.log(
          "Unknown action:",
          action
        );

        return;
      }

      try {
        button.dataset.toBusy = "1";

        await handler(button);
      } catch (error) {
        TO.error(error);

        TO.toast(
          error.message ||
          "Произошла ошибка",
          "error"
        );
      } finally {
        delete button.dataset.toBusy;
      }
    }
  );

  /* ============================================================
     32. VIEW TRACKING
     ============================================================ */

  TO.viewTracking = {
    observer: null,

    init() {
      if (
        !("IntersectionObserver" in window)
      ) {
        return;
      }

      this.observer =
        new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const id =
                entry.target.dataset
                  .publicationId;

              if (!id) return;

              clearTimeout(
                entry.target.__toViewTimer
              );

              entry.target.__toViewTimer =
                setTimeout(
                  () => {
                    TO.publications.view(
                      id
                    );
                  },
                  TO.config.viewDelay
                );

              this.observer.unobserve(
                entry.target
              );
            });
          },
          {
            threshold: 0.35
          }
        );

      this.observe();
    },

    observe() {
      if (!this.observer) return;

      TO.qa(
        "[data-publication-id]"
      ).forEach(
        el =>
          this.observer.observe(el)
      );
    }
  };

  /* ============================================================
     33. SEARCH UI
     ============================================================ */

  TO.searchUI = {
    init() {
      const inputs =
        TO.qa(
          '[data-to-search]'
        );

      inputs.forEach(input => {
        input.addEventListener(
          "input",
          TO.debounce(
            async () => {
              const query =
                input.value.trim();

              if (!query) return;

              const targetSelector =
                input.dataset.toSearchTarget;

              const target =
                targetSelector
                  ? TO.q(
                      targetSelector
                    )
                  : null;

              if (!target) return;

              try {
                const posts =
                  await TO.search
                    .publications(
                      query
                    );

                TO.ui
                  .renderPublications(
                    target,
                    posts
                  );
              } catch (error) {
                TO.toast(
                  "Поиск временно недоступен",
                  "error"
                );
              }
            },
            500
          )
        );
      });
    }
  };

  /* ============================================================
     34. NOTIFICATION BADGE
     ============================================================ */

  TO.notificationBadge = {
    async refresh() {
      try {
        const list =
          await TO.notifications
            .list();

        const unread =
          Array.isArray(list)
            ? list.filter(
                item =>
                  !TO.bool(
                    TO.pick(
                      item,
                      [
                        "read",
                        "is_read",
                        "seen"
                      ],
                      false
                    )
                  )
              ).length
            : 0;

        TO.qa(
          "[data-to-notifications-count]"
        ).forEach(
          el => {
            el.textContent =
              unread;

            el.hidden =
              unread <= 0;
          }
        );
      } catch {}
    }
  };

  /* ============================================================
     35. ADMIN STATS AUTO RENDER
     ============================================================ */

  TO.adminStatsUI = {
    async refresh() {
      try {
        const server =
          await TO.admin
            .dashboard();

        const local =
          TO.stats.load();

        const merged = {
          ...local,
          ...server
        };

        Object.entries(
          merged
        ).forEach(
          ([key, value]) => {
            TO.qa(
              `[data-to-stat="${key}"]`
            ).forEach(
              el => {
                el.textContent =
                  TO.number(
                    value,
                    0
                  ).toLocaleString(
                    "ru-RU"
                  );
              }
            );
          }
        );

        return merged;
      } catch {
        TO.stats.render();

        return TO.stats.load();
      }
    }
  };

  /* ============================================================
     36. ADMIN MANUAL COUNTERS UI
     ============================================================ */

  TO.manualStatsUI = {
    init() {
      TO.qa(
        "[data-to-stat-edit]"
      ).forEach(
        input => {
          const name =
            input.dataset.toStatEdit;

          input.value =
            TO.stats.get(name);

          input.addEventListener(
            "change",
            () => {
              TO.stats.set(
                name,
                input.value
              );

              TO.stats.render();

              TO.toast(
                "Статистика сохранена",
                "success"
              );
            }
          );
        }
      );
    }
  };

  /* ============================================================
     37. DRAFT SYSTEM
     ============================================================ */

  TO.drafts = {
    all() {
      return TO.store.get(
        TO.storage.drafts,
        []
      );
    },

    save(draft) {
      const drafts =
        this.all();

      const id =
        draft.id ||
        `draft_${Date.now()}`;

      const item = {
        ...draft,
        id,
        updated_at:
          TO.isoNow()
      };

      const index =
        drafts.findIndex(
          x => x.id === id
        );

      if (index >= 0) {
        drafts[index] = item;
      } else {
        drafts.push(item);
      }

      TO.store.set(
        TO.storage.drafts,
        drafts
      );

      return item;
    },

    remove(id) {
      const drafts =
        this.all()
          .filter(
            x => x.id !== id
          );

      TO.store.set(
        TO.storage.drafts,
        drafts
      );
    },

    get(id) {
      return this.all()
        .find(
          x => x.id === id
        ) || null;
    }
  };

  /* ============================================================
     38. PUBLICATION FORM AUTOSAVE
     ============================================================ */

  TO.formAutosave = {
    init() {
      TO.qa(
        "form[data-to-publication-form]"
      ).forEach(form => {
        const handler =
          TO.debounce(
            () => {
              const data =
                Object.fromEntries(
                  new FormData(form)
                    .entries()
                );

              TO.drafts.save({
                form: data
              });
            },
            800
          );

        form.addEventListener(
          "input",
          handler
        );
      });
    }
  };

  /* ============================================================
     39. PUBLICATION FORM SUBMISSION
     ============================================================ */

  TO.forms = {
    async publication(form) {
      if (!form) return;

      const data =
        Object.fromEntries(
          new FormData(form)
            .entries()
        );

      if (!data.title) {
        TO.toast(
          "Введите заголовок",
          "warning"
        );

        return;
      }

      if (
        !data.text &&
        !data.content &&
        !data.description
      ) {
        TO.toast(
          "Введите описание",
          "warning"
        );

        return;
      }

      try {
        const result =
          await TO.publications
            .create(data);

        TO.toast(
          "Готово! Публикация отправлена администрации.",
          "success"
        );

        return result;
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось создать публикацию",
          "error"
        );
      }
    }
  };

  /* ============================================================
     40. ADMIN TEST CENTER
     ============================================================ */

  TO.testing = {
    participant: null,

    selectParticipant(user) {
      this.participant =
        TO.normalizeUser(user);

      TO.actor.select(
        this.participant
      );

      TO.actor.enableTestMode();

      return this.participant;
    },

    clearParticipant() {
      this.participant = null;

      TO.actor.clear();
      TO.actor.disableTestMode();
    },

    requireParticipant() {
      if (
        !TO.actor.active()
      ) {
        throw new Error(
          "Сначала выберите участника и включите тестовый режим"
        );
      }

      return TO.actor.get();
    },

    async like(publicationId) {
      const actor =
        this.requireParticipant();

      return TO.publications.react(
        publicationId,
        "like"
      );
    },

    async react(
      publicationId,
      reaction
    ) {
      this.requireParticipant();

      return TO.publications.react(
        publicationId,
        reaction
      );
    },

    async save(publicationId) {
      this.requireParticipant();

      return TO.publications.save(
        publicationId
      );
    },

    async share(publicationId) {
      this.requireParticipant();

      return TO.publications.share(
        publicationId
      );
    },

    async view(publicationId) {
      this.requireParticipant();

      /*
       * Remove local viewed marker temporarily
       * so testing can trigger a view request.
       */

      const old =
        TO.store.get(
          TO.storage.viewed,
          []
        );

      TO.store.set(
        TO.storage.viewed,
        old.filter(
          x =>
            String(x) !==
            String(publicationId)
        )
      );

      return TO.publications.view(
        publicationId
      );
    },

    async comment(
      publicationId,
      text,
      parentId = null
    ) {
      this.requireParticipant();

      return TO.comments.create(
        publicationId,
        text,
        parentId
      );
    },

    async message(
      userId,
      text
    ) {
      this.requireParticipant();

      return TO.chat.send(
        userId,
        text,
        {
          test_mode: true,
          actor_user_id:
            TO.actor.get()?.id
        }
      );
    },

    async follow(userId) {
      this.requireParticipant();

      return TO.follow.toggle(
        userId
      );
    },

    async createPublication(
      payload
    ) {
      this.requireParticipant();

      return TO.publications.create({
        ...payload,

        test_mode: true,

        actor_user_id:
          TO.actor.get()?.id
      });
    }
  };

  /* ============================================================
     41. ADMIN USER ACTIONS
     ============================================================ */

  TO.userManagement = {
    async block(id) {
      return TO.admin.userAction(
        id,
        "block"
      );
    },

    async unblock(id) {
      return TO.admin.userAction(
        id,
        "unblock"
      );
    },

    async verify(id) {
      return TO.admin.userAction(
        id,
        "verify"
      );
    },

    async delete(id) {
      return TO.admin.userAction(
        id,
        "delete"
      );
    },

    async restore(id) {
      return TO.admin.userAction(
        id,
        "restore"
      );
    },

    async moderator(id) {
      return TO.admin.userAction(
        id,
        "make_moderator"
      );
    },

    async removeModerator(id) {
      return TO.admin.userAction(
        id,
        "remove_moderator"
      );
    }
  };

  /* ============================================================
     42. KEYBOARD SHORTCUTS
     ============================================================ */

  document.addEventListener(
    "keydown",
    event => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        const search =
          TO.q(
            '[data-to-search]'
          );

        if (search) {
          search.focus();
        }
      }

      if (
        event.key === "Escape"
      ) {
        TO.qa(
          ".to-modal-open"
        ).forEach(
          el =>
            el.classList.remove(
              "to-modal-open"
            )
        );
      }
    }
  );

  /* ============================================================
     43. ONLINE STATUS
     ============================================================ */

  TO.online = {
    update() {
      const online =
        navigator.onLine;

      document.documentElement
        .classList.toggle(
          "to-offline",
          !online
        );

      TO.qa(
        "[data-to-online-status]"
      ).forEach(
        el => {
          el.textContent =
            online
              ? "Онлайн"
              : "Нет соединения";
        }
      );
    }
  };

  window.addEventListener(
    "online",
    () => {
      TO.online.update();

      TO.toast(
        "Соединение восстановлено",
        "success"
      );
    }
  );

  window.addEventListener(
    "offline",
    () => {
      TO.online.update();

      TO.toast(
        "Нет подключения к интернету",
        "warning"
      );
    }
  );

  /* ============================================================
     44. ERROR HANDLING
     ============================================================ */

  window.addEventListener(
    "unhandledrejection",
    event => {
      TO.error(
        "Unhandled promise:",
        event.reason
      );
    }
  );

  window.addEventListener(
    "error",
    event => {
      TO.error(
        "Global error:",
        event.error ||
        event.message
      );
    }
  );

  /* ============================================================
     45. PAGE INITIALIZATION
     ============================================================ */

  TO.init = async function () {
    TO.log(
      `Initializing ${TO.name} v${TO.version}`
    );

    TO.actor.load();

    TO.theme.apply();

    TO.online.update();

    TO.stats.render();

    TO.manualStatsUI.init();

    TO.searchUI.init();

    TO.formAutosave.init();

    TO.viewTracking.init();

    /*
     * Auth must never break the page.
     */

    await TO.auth.me();

    /*
     * Admin check is also optional.
     */

    await TO.auth.adminMe();

    TO.actor.renderIndicator();

    /*
     * Render notification badges only
     * when authentication is available.
     */

    if (TO.auth.isLoggedIn()) {
      TO.notificationBadge
        .refresh();
    }

    /*
     * Admin statistics only on pages
     * that actually expose admin elements.
     */

    if (
      TO.auth.isAdmin() ||
      TO.exists(
        "[data-to-stat]"
      )
    ) {
      TO.adminStatsUI.refresh();
    }

    /*
     * Automatically initialize buttons
     * and publication view tracking.
     */

    setTimeout(() => {
      TO.viewTracking.observe();
    }, 500);

    TO.log(
      "Initialization complete"
    );
  };

  /* ============================================================
     46. POLLING
     ============================================================ */

  TO.startPolling = function () {
    if (
      TO.__pollingStarted
    ) {
      return;
    }

    TO.__pollingStarted = true;

    setInterval(
      async () => {
        if (
          TO.auth.isLoggedIn()
        ) {
          await TO.notificationBadge
            .refresh();
        }
      },
      TO.config.notificationInterval
    );
  };

  /* ============================================================
     47. AUTO-REFRESH ADMIN
     ============================================================ */

  TO.startAdminPolling =
    function () {
      if (
        TO.__adminPollingStarted
      ) {
        return;
      }

      TO.__adminPollingStarted =
        true;

      setInterval(
        async () => {
          if (
            TO.auth.isAdmin()
          ) {
            await TO.adminStatsUI
              .refresh();
          }
        },
        TO.config.pollingInterval
      );
    };

  /* ============================================================
     48. HTML HELPERS
     ============================================================ */

  TO.html = {
    avatar(user, size = 42) {
      const u =
        TO.normalizeUser(user);

      if (u.avatar) {
        return `
          <img
            src="${TO.escape(u.avatar)}"
            width="${size}"
            height="${size}"
            alt="${TO.escape(
              u.name
            )}"
            loading="lazy"
            style="
              width:${size}px;
              height:${size}px;
              border-radius:50%;
              object-fit:cover;
            "
          >
        `;
      }

      const letter =
        (
          u.name ||
          u.username ||
          "?"
        )
          .trim()
          .charAt(0)
          .toUpperCase();

      return `
        <div
          style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:700;
          "
        >
          ${TO.escape(letter)}
        </div>
      `;
    },

    verified() {
      return "✅";
    },

    official() {
      return `
        <span
          class="to-official-account"
          title="Официальный аккаунт"
        >
          🇹🇯 Tajik Opportunities✅
        </span>
      `;
    }
  };

  /* ============================================================
     49. MESSAGE RENDERING
     ============================================================ */

  TO.ui.message = function (
    message
  ) {
    const m =
      TO.official.normalize(
        message
      );

    const isAdmin =
      m.is_admin ||
      m.sender_type === "admin" ||
      m.author_type === "admin";

    const sender =
      isAdmin
        ? TO.config.officialName
        : TO.pick(
            m,
            [
              "sender_name",
              "author_name",
              "name",
              "username"
            ],
            "Пользователь"
          );

    const text =
      TO.pick(
        m,
        [
          "text",
          "content",
          "message"
        ],
        ""
      );

    const time =
      TO.pick(
        m,
        [
          "created_at",
          "sent_at",
          "date"
        ],
        null
      );

    return `
      <div
        class="
          to-message
          ${
            isAdmin
              ? "to-message-admin"
              : "to-message-user"
          }
        "
        data-message-id="${TO.escape(
          TO.pick(
            m,
            ["id", "message_id"],
            ""
          )
        )}"
      >

        <div
          class="to-message-author"
        >
          ${TO.escape(sender)}
        </div>

        <div
          class="to-message-text"
        >
          ${TO.escape(text)}
        </div>

        ${
          time
            ? `
              <time>
                ${TO.escape(
                  TO.date.relative(
                    time
                  )
                )}
              </time>
            `
            : ""
        }

      </div>
    `;
  };

  /* ============================================================
     50. ADMIN PARTICIPANT CARD
     ============================================================ */

  TO.ui.participantCard =
    function (user) {
      const u =
        TO.normalizeUser(user);

      return `
        <div
          class="to-participant-card"
          data-user-id="${TO.escape(
            u.id
          )}"
        >

          <div class="to-participant-avatar">
            ${TO.html.avatar(u, 52)}
          </div>

          <div class="to-participant-info">

            <strong>
              ${TO.escape(
                u.name ||
                "Без имени"
              )}

              ${
                u.verified
                  ? " ✅"
                  : ""
              }
            </strong>

            ${
              u.username
                ? `
                  <div>
                    ${TO.escape(
                      u.username
                    )}
                  </div>
                `
                : ""
            }

            ${
              u.city ||
              u.country
                ? `
                  <div>
                    📍
                    ${TO.escape(
                      [
                        u.city,
                        u.country
                      ]
                        .filter(Boolean)
                        .join(", ")
                    )}
                  </div>
                `
                : ""
            }

          </div>

          <div
            class="to-participant-actions"
          >

            <button
              type="button"
              data-to-action="open-profile"
              data-username="${TO.escape(
                u.username
              )}"
            >
              Профиль
            </button>

            <button
              type="button"
              data-to-action="open-chat"
              data-user-id="${TO.escape(
                u.id
              )}"
            >
              Чат
            </button>

            <button
              type="button"
              data-to-action="admin-block-user"
              data-user-id="${TO.escape(
                u.id
              )}"
            >
              Заблокировать
            </button>

          </div>

        </div>
      `;
    };

  /* ============================================================
     51. ADMIN PUBLICATION CARD
     ============================================================ */

  TO.ui.adminPublicationCard =
    function (publication) {
      const p =
        TO.normalizePublication(
          publication
        );

      return `
        <div
          class="to-admin-publication-card"
          data-publication-id="${TO.escape(
            p.id
          )}"
        >

          <div>

            <strong>
              ${TO.escape(
                p.title ||
                "Без названия"
              )}
            </strong>

            <div>
              ${TO.escape(
                p.authorName ||
                "Неизвестный автор"
              )}

              ${
                p.authorUsername
                  ? `
                    · ${TO.escape(
                      p.authorUsername
                    )}
                  `
                  : ""
              }
            </div>

            <div>
              Статус:
              ${TO.escape(
                TO.statuses[
                  p.status
                ] ||
                p.status
              )}
            </div>

            <div>
              👁️ ${p.views}
              · ❤️ ${
                p.reactions ||
                p.likes
              }
              · 💬 ${p.comments}
              · 🔖 ${p.saves}
            </div>

          </div>

          <div
            class="to-admin-publication-actions"
          >

            <button
              type="button"
              data-to-action="open-publication"
              data-id="${TO.escape(
                p.id
              )}"
            >
              Читать
            </button>

            <button
              type="button"
              data-to-action="admin-approve"
              data-id="${TO.escape(
                p.id
              )}"
            >
              Одобрить
            </button>

            <button
              type="button"
              data-to-action="admin-reject"
              data-id="${TO.escape(
                p.id
              )}"
            >
              Отклонить
            </button>

            <button
              type="button"
              data-to-action="admin-pin"
              data-id="${TO.escape(
                p.id
              )}"
            >
              Закрепить
            </button>

            <button
              type="button"
              data-to-action="admin-delete"
              data-id="${TO.escape(
                p.id
              )}"
            >
              Удалить
            </button>

          </div>

        </div>
      `;
    };

  /* ============================================================
     52. ADMIN TEST ACTIONS
     ============================================================ */

  TO.actions.testLike =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.testing.like(id);

        TO.toast(
          "Тестовая реакция поставлена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message,
          "error"
        );
      }
    };

  TO.actions.testSave =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.testing.save(id);

        TO.toast(
          "Тестовое сохранение выполнено",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message,
          "error"
        );
      }
    };

  TO.actions.testView =
    async function (button) {
      const id =
        button.dataset.id;

      try {
        await TO.testing.view(id);

        TO.toast(
          "Тестовый просмотр засчитан",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message,
          "error"
        );
      }
    };

  TO.actions.testFollow =
    async function (button) {
      const id =
        button.dataset.userId ||
        button.dataset.id;

      try {
        await TO.testing.follow(id);

        TO.toast(
          "Тестовая подписка выполнена",
          "success"
        );
      } catch (error) {
        TO.toast(
          error.message,
          "error"
        );
      }
    };

  /* ============================================================
     53. ADMIN PAYMENT HELPERS
     ============================================================ */

  TO.payment = {
    async request(
      publicationId,
      amount,
      currency = "TJS"
    ) {
      return TO.admin.payment({
        publication_id:
          publicationId,

        id:
          publicationId,

        amount,

        currency,

        action:
          "request_payment"
      });
    },

    async confirm(
      publicationId,
      amount,
      currency = "TJS"
    ) {
      return TO.admin.payment({
        publication_id:
          publicationId,

        id:
          publicationId,

        amount,

        currency,

        action:
          "confirm_payment"
      });
    }
  };

  /* ============================================================
     54. ADMIN MODERATION HELPERS
     ============================================================ */

  TO.moderation = {
    async approveFree(id) {
      return TO.adminPublicationActions
        .approve(id);
    },

    async requestPayment(
      id,
      amount
    ) {
      return TO.adminPublicationActions
        .payment(
          id,
          amount
        );
    },

    async confirmPayment(
      id,
      amount
    ) {
      return TO.payment.confirm(
        id,
        amount
      );
    },

    async publish(id) {
      return TO.adminPublicationActions
        .publish(id);
    },

    async reject(
      id,
      reason
    ) {
      return TO.adminPublicationActions
        .reject(
          id,
          reason
        );
    },

    async hide(id) {
      return TO.adminPublicationActions
        .hide(id);
    },

    async pin(id) {
      return TO.adminPublicationActions
        .pin(id);
    },

    async feature(id) {
      return TO.adminPublicationActions
        .feature(id);
    }
  };

  /* ============================================================
     55. SAFE JSON DOWNLOAD / EXPORT
     ============================================================ */

  TO.export = {
    json(data, filename = "tajik-opportunities.json") {
      const blob =
        new Blob(
          [
            JSON.stringify(
              data,
              null,
              2
            )
          ],
          {
            type:
              "application/json"
          }
        );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;
      a.download = filename;

      document.body.appendChild(a);

      a.click();

      a.remove();

      URL.revokeObjectURL(url);
    }
  };

  /* ============================================================
     56. COPY TO CLIPBOARD
     ============================================================ */

  TO.copy = async function (
    text
  ) {
    if (!text) return false;

    try {
      await navigator.clipboard
        .writeText(text);

      TO.toast(
        "Скопировано",
        "success"
      );

      return true;
    } catch {
      return false;
    }
  };

  /* ============================================================
     57. PUBLICATION URL
     ============================================================ */

  TO.publicationUrl =
    function (id) {
      return (
        location.origin +
        `/publication.html?id=${encodeURIComponent(
          id
        )}`
      );
    };

  /* ============================================================
     58. SOCIAL SHARING
     ============================================================ */

  TO.social = {
    telegram(url, text = "") {
      return (
        "https://t.me/share/url?url=" +
        encodeURIComponent(url) +
        "&text=" +
        encodeURIComponent(text)
      );
    },

    whatsapp(url, text = "") {
      return (
        "https://wa.me/?text=" +
        encodeURIComponent(
          `${text} ${url}`
        )
      );
    }
  };

  /* ============================================================
     59. PWA / SERVICE WORKER
     ============================================================ */

  TO.pwa = {
    async register() {
      if (
        !("serviceWorker" in navigator)
      ) {
        return;
      }

      /*
       * Only register if the project
       * already contains sw.js.
       * This avoids generating a 404.
       */

      try {
        const response =
          await fetch(
            "/sw.js",
            {
              method: "HEAD",
              cache: "no-store"
            }
          );

        if (response.ok) {
          await navigator.serviceWorker
            .register("/sw.js");
        }
      } catch {}
    }
  };

  /* ============================================================
     60. URL PARAMETER HELPERS
     ============================================================ */

  TO.url = {
    get(name) {
      return new URLSearchParams(
        location.search
      ).get(name);
    },

    all() {
      return Object.fromEntries(
        new URLSearchParams(
          location.search
        ).entries()
      );
    },

    set(name, value) {
      const url =
        new URL(location.href);

      url.searchParams.set(
        name,
        value
      );

      history.pushState(
        {},
        "",
        url
      );
    },

    remove(name) {
      const url =
        new URL(location.href);

      url.searchParams.delete(
        name
      );

      history.pushState(
        {},
        "",
        url
      );
    }
  };

  /* ============================================================
     61. PAGE CONTEXT
     ============================================================ */

  TO.page = {
    name() {
      const path =
        location.pathname
          .split("/")
          .pop();

      return path ||
        "index.html";
    },

    isAdmin() {
      return (
        location.pathname
          .includes("admin")
      );
    },

    isProfile() {
      return (
        location.pathname
          .includes("profile")
      );
    },

    isMessages() {
      return (
        location.pathname
          .includes("messages")
      );
    },

    isNotifications() {
      return (
        location.pathname
          .includes("notifications")
      );
    },

    isAdd() {
      return (
        location.pathname
          .includes("add")
      );
    }
  };

  /* ============================================================
     62. ADMIN QUICK DATA LOADER
     ============================================================ */

  TO.adminUI = {
    async loadParticipants(
      container
    ) {
      if (!container) return;

      try {
        const users =
          await TO.admin.users();

        container.innerHTML =
          users
            .map(
              user =>
                TO.ui.participantCard(
                  user
                )
            )
            .join("");
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось загрузить участников",
          "error"
        );
      }
    },

    async loadPublications(
      container,
      params = {}
    ) {
      if (!container) return;

      try {
        const posts =
          await TO.admin
            .publications(
              params
            );

        container.innerHTML =
          posts
            .map(
              post =>
                TO.ui
                  .adminPublicationCard(
                    post
                  )
            )
            .join("");
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось загрузить публикации",
          "error"
        );
      }
    },

    async loadNotifications(
      container
    ) {
      if (!container) return;

      try {
        const list =
          await TO.admin
            .notifications();

        container.innerHTML =
          list
            .map(
              item => `
                <div
                  class="to-admin-notification"
                  data-id="${TO.escape(
                    TO.pick(
                      item,
                      [
                        "id",
                        "notification_id"
                      ],
                      ""
                    )
                  )}"
                >
                  <strong>
                    ${TO.escape(
                      TO.pick(
                        item,
                        [
                          "title",
                          "type"
                        ],
                        "Уведомление"
                      )
                    )}
                  </strong>

                  <div>
                    ${TO.escape(
                      TO.pick(
                        item,
                        [
                          "text",
                          "message",
                          "content"
                        ],
                        ""
                      )
                    )}
                  </div>
                </div>
              `
            )
            .join("");
      } catch (error) {
        TO.toast(
          error.message ||
          "Не удалось загрузить уведомления",
          "error"
        );
      }
    }
  };

  /* ============================================================
     63. GLOBAL DATA ATTRIBUTES
     ============================================================ */

  /*
   * The following HTML attributes can be used
   * anywhere without additional JS.
   *
   * data-to-action="react"
   * data-id="123"
   *
   * data-to-action="save"
   * data-id="123"
   *
   * data-to-action="share"
   * data-id="123"
   *
   * data-to-action="open-profile"
   * data-username="@user"
   *
   * data-to-action="open-chat"
   * data-user-id="123"
   */

  /* ============================================================
     64. LOGIN / REGISTER HELPERS
     ============================================================ */

  TO.login = async function (
    payload
  ) {
    const data =
      await TO.api(
        "/api/auth/login",
        {
          method: "POST",
          body: payload
        }
      );

    await TO.auth.me();

    return data;
  };

  TO.register = async function (
    payload
  ) {
    const data =
      await TO.api(
        "/api/auth/register",
        {
          method: "POST",
          body: payload
        }
      );

    await TO.auth.me();

    return data;
  };

  TO.checkUsername =
    async function (
      username
    ) {
      return TO.api(
        `/api/username/check?username=${encodeURIComponent(
          username
        )}`
      );
    };

  /* ============================================================
     65. ADMIN LOGIN
     ============================================================ */

  TO.adminLogin =
    async function (
      payload
    ) {
      const data =
        await TO.api(
          "/api/admin/login",
          {
            method: "POST",
            body: payload
          }
        );

      await TO.auth.adminMe();

      return data;
    };

  TO.adminLogout =
    async function () {
      await TO.tryApi(
        "/api/admin/logout",
        {
          method: "POST"
        }
      );

      TO.auth.admin = null;

      location.href =
        "/admin.html";
    };

  /* ============================================================
     66. ADMIN USER SEARCH
     ============================================================ */

  TO.adminSearchUsers =
    async function (
      query
    ) {
      return TO.admin.users({
        search: query,
        q: query,
        username: query,
        id: query
      });
    };

  /* ============================================================
     67. ADMIN PUBLICATION SEARCH
     ============================================================ */

  TO.adminSearchPublications =
    async function (
      query
    ) {
      return TO.admin.publications({
        search: query,
        q: query,
        title: query,
        author: query,
        id: query
      });
    };

  /* ============================================================
     68. REAL-TIME STYLE REFRESH
     ============================================================ */

  TO.refreshEverything =
    async function () {
      await TO.notificationBadge
        .refresh();

      await TO.adminStatsUI
        .refresh();

      TO.viewTracking.observe();
    };

  /* ============================================================
     69. ACCESSIBILITY
     ============================================================ */

  TO.accessibility = {
    init() {
      TO.qa(
        "img:not([alt])"
      ).forEach(
        img => {
          img.alt =
            TO.config.siteName;
        }
      );

      TO.qa(
        "button"
      ).forEach(
        button => {
          if (
            !button.getAttribute(
              "aria-label"
            ) &&
            !button.textContent.trim()
          ) {
            button.setAttribute(
              "aria-label",
              "Кнопка"
            );
          }
        }
      );
    }
  };

  /* ============================================================
     70. SECURITY HELPERS
     ============================================================ */

  TO.security = {
    safeUrl(url) {
      if (!url) return "";

      try {
        const parsed =
          new URL(
            url,
            location.origin
          );

        if (
          ![
            "http:",
            "https:"
          ].includes(
            parsed.protocol
          )
        ) {
          return "";
        }

        return parsed.href;
      } catch {
        return "";
      }
    },

    sanitizeText(text) {
      return TO.escape(
        text
      );
    }
  };

  /* ============================================================
     71. PERFORMANCE
     ============================================================ */

  TO.performance = {
    lazyImages() {
      if (
        !("IntersectionObserver" in window)
      ) {
        return;
      }

      const images =
        TO.qa(
          "img[data-src]"
        );

      const observer =
        new IntersectionObserver(
          entries => {
            entries.forEach(
              entry => {
                if (
                  !entry.isIntersecting
                ) {
                  return;
                }

                const img =
                  entry.target;

                img.src =
                  img.dataset.src;

                delete img.dataset.src;

                observer.unobserve(
                  img
                );
              }
            );
          }
        );

      images.forEach(
        img =>
          observer.observe(img)
      );
    }
  };

  /* ============================================================
     72. AUTO PAGE FEATURES
     ============================================================ */

  TO.auto = {
    init() {
      TO.performance
        .lazyImages();

      TO.accessibility
        .init();

      TO.searchUI
        .init();

      TO.viewTracking
        .observe();

      TO.stats
        .render();
    }
  };

  /* ============================================================
     73. STORAGE EVENT SYNC
     ============================================================ */

  window.addEventListener(
    "storage",
    event => {
      if (
        event.key ===
        TO.storage.theme
      ) {
        TO.theme.apply();
      }

      if (
        event.key ===
        TO.storage.stats
      ) {
        TO.stats.render();
      }

      if (
        event.key ===
        TO.storage.actor
      ) {
        TO.actor.load();
        TO.actor.renderIndicator();
      }
    }
  );

  /* ============================================================
     74. SYSTEM THEME CHANGE
     ============================================================ */

  if (
    window.matchMedia
  ) {
    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    if (
      media.addEventListener
    ) {
      media.addEventListener(
        "change",
        () => {
          if (
            TO.theme.get() ===
            "system"
          ) {
            TO.theme.apply();
          }
        }
      );
    }
  }

  /* ============================================================
     75. INIT
     ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      async () => {
        await TO.init();

        TO.auto.init();

        TO.startPolling();

        TO.startAdminPolling();

        TO.pwa.register();
      },
      {
        once: true
      }
    );
  } else {
    (async () => {
      await TO.init();

      TO.auto.init();

      TO.startPolling();

      TO.startAdminPolling();

      TO.pwa.register();
    })();
  }

})();
