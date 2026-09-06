(() => {
  "use strict";

  /* ============================================================
     TAJIK OPPORTUNITIES
     Universal client engine
     File: public/js/works.js
     ============================================================ */

  const TO = {};

  window.TO = TO;
  window.TajikOpportunities = TO;

  /* ============================================================
     CONSTANTS
     ============================================================ */

  const SITE_NAME = "Tajik Opportunities";
  const SITE_USERNAME = "@tajikopportunities";

  const SESSION_COOKIE = "to_session";
  const ADMIN_COOKIE = "to_admin";
  const SESSION_DAYS = 30;

  const STORAGE = {
    USER: "to_user",
    ADMIN: "to_admin_user",
    ACTOR: "to_test_actor",
    TEST_MODE: "to_test_mode",
    STATS: "to_manual_stats",
    THEME: "to_theme",
    LANGUAGE: "to_language",
    PROFILE_CACHE: "to_profile_cache",
    CATEGORIES: "to_categories_cache",
    SAVED: "to_saved",
    FOLLOWING: "to_following",
    VIEWED: "to_viewed",
    REACTIONS: "to_reactions",
    LAST_CHAT: "to_last_chat"
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

  const REACTION_ICONS = {
    like: "👍",
    love: "❤️",
    support: "🤝",
    funny: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😡"
  };

  const PUBLICATION_STATUSES = [
    "pending",
    "waiting_payment",
    "paid",
    "published",
    "rejected",
    "hidden",
    "deleted"
  ];

  /* ============================================================
     API
     ============================================================ */

  const API = {
    authRegister: "/api/auth/register",
    authLogin: "/api/auth/login",
    authLogout: "/api/auth/logout",
    authMe: "/api/auth/me",
    usernameCheck: "/api/username/check",

    profile: "/api/profile",
    profilePublic: "/api/profile/public",

    categories: "/api/categories",

    publications: "/api/publications",
    posts: "/api/posts",

    publicationView: "/api/publications/view",
    publicationReact: "/api/publications/react",
    publicationSave: "/api/publications/save",
    publicationShare: "/api/publications/share",

    comments: "/api/comments",
    reactions: "/api/reactions",
    saves: "/api/saves",
    shares: "/api/shares",
    views: "/api/views",
    follows: "/api/follows",

    chat: "/api/chat",
    chatMessages: "/api/chat/messages",
    chatRead: "/api/chat/read",

    notifications: "/api/notifications",
    notificationsRead: "/api/notifications/read",

    reports: "/api/reports",

    admin: "/api/admin",
    adminLogin: "/api/admin/login",
    adminLogout: "/api/admin/logout",
    adminMe: "/api/admin/me",

    adminDashboard: "/api/admin/dashboard",
    adminNotifications: "/api/admin/notifications",

    adminUsers: "/api/admin/users",
    adminUser: "/api/admin/user",
    adminUserEdit: "/api/admin/user/edit",
    adminUserAction: "/api/admin/user/action",

    adminPublications: "/api/admin/publications",
    adminPublicationEdit: "/api/admin/publication/edit",
    adminPublicationAction: "/api/admin/publication/action",
    adminPublicationCounters: "/api/admin/publication/counters",

    adminChats: "/api/admin/chats",
    adminChatMessages: "/api/admin/chat/messages",
    adminChatSend: "/api/admin/chat/send",

    adminComments: "/api/admin/comments",
    adminCommentEdit: "/api/admin/comment/edit",
    adminCommentAction: "/api/admin/comment/action",

    adminPayment: "/api/admin/payment",

    adminReports: "/api/admin/reports",
    adminTrash: "/api/admin/trash",
    adminStats: "/api/admin/stats",
    adminTesting: "/api/admin/testing",
    adminAudit: "/api/admin/audit"
  };

  TO.API = API;
  TO.SITE_NAME = SITE_NAME;
  TO.SITE_USERNAME = SITE_USERNAME;
  TO.CATEGORIES = CATEGORIES;
  TO.REACTIONS = REACTIONS;
  TO.PUBLICATION_STATUSES = PUBLICATION_STATUSES;

  /* ============================================================
     STORAGE
     ============================================================ */

  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        if (value === null) return fallback;
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

  TO.storage = storage;

  /* ============================================================
     HELPERS
     ============================================================ */

  const helpers = {
    id(value) {
      return String(
        value ??
        ""
      ).trim();
    },

    first(...values) {
      for (const value of values) {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          return value;
        }
      }
      return "";
    },

    number(value, fallback = 0) {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    },

    bool(value) {
      if (typeof value === "boolean") return value;
      if (value === 1 || value === "1") return true;
      if (String(value).toLowerCase() === "true") return true;
      return false;
    },

    escape(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },

    unescape(value) {
      const div = document.createElement("div");
      div.innerHTML = String(value ?? "");
      return div.textContent || "";
    },

    text(value, max = 5000) {
      return helpers.escape(String(value ?? "").slice(0, max));
    },

    formatNumber(value) {
      return new Intl.NumberFormat(
        document.documentElement.lang || "ru-RU"
      ).format(helpers.number(value));
    },

    formatDate(value, options = {}) {
      if (!value) return "";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat(
        document.documentElement.lang || "ru-RU",
        {
          dateStyle: options.dateStyle || "medium",
          timeStyle: options.timeStyle || undefined
        }
      ).format(date);
    },

    relativeDate(value) {
      if (!value) return "";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const seconds = Math.floor(
        (Date.now() - date.getTime()) / 1000
      );

      if (seconds < 10) return "только что";
      if (seconds < 60) return `${seconds} сек. назад`;

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} мин. назад`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} ч. назад`;

      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} дн. назад`;

      return helpers.formatDate(value);
    },

    username(user) {
      const value = helpers.first(
        user?.username,
        user?.user_name,
        user?.handle
      );

      if (!value) return "";

      return String(value).startsWith("@")
        ? String(value)
        : `@${value}`;
    },

    userId(user) {
      return helpers.first(
        user?.id,
        user?.user_id,
        user?.userId,
        user?.uid
      );
    },

    publicationId(publication) {
      return helpers.first(
        publication?.id,
        publication?.publication_id,
        publication?.publicationId,
        publication?.post_id,
        publication?.postId
      );
    },

    commentId(comment) {
      return helpers.first(
        comment?.id,
        comment?.comment_id,
        comment?.commentId
      );
    },

    media(publication) {
      const media = helpers.first(
        publication?.media,
        publication?.attachments,
        publication?.files,
        []
      );

      return Array.isArray(media) ? media : [];
    },

    categoryLabel(category) {
      const key = String(category || "").toLowerCase();

      const found = CATEGORIES.find(
        item => item[0] === key
      );

      return found ? found[1] : category || "";
    },

    normalizePublication(item) {
      if (!item) return null;

      const id = helpers.publicationId(item);

      return {
        ...item,
        id,
        publication_id: id,

        title: helpers.first(
          item.title,
          item.name,
          "Без названия"
        ),

        text: helpers.first(
          item.text,
          item.description,
          item.content,
          item.body,
          ""
        ),

        category: helpers.first(
          item.category,
          item.category_id,
          "other"
        ),

        status: helpers.first(
          item.status,
          "published"
        ),

        author: item.author || item.user || {
          id: item.author_id || item.user_id,
          name: item.author_name || item.name || "",
          username: item.author_username || item.username || ""
        },

        views: helpers.number(
          helpers.first(
            item.views,
            item.view_count,
            item.views_count
          )
        ),

        likes: helpers.number(
          helpers.first(
            item.likes,
            item.like_count,
            item.likes_count
          )
        ),

        comments_count: helpers.number(
          helpers.first(
            item.comments_count,
            item.comment_count
          )
        ),

        saves: helpers.number(
          helpers.first(
            item.saves,
            item.save_count,
            item.saves_count
          )
        ),

        shares: helpers.number(
          helpers.first(
            item.shares,
            item.share_count,
            item.shares_count
          )
        ),

        created_at: helpers.first(
          item.created_at,
          item.createdAt,
          item.published_at,
          item.date
        )
      };
    },

    list(data) {
      if (Array.isArray(data)) return data;

      if (!data || typeof data !== "object") {
        return [];
      }

      return (
        data.items ||
        data.publications ||
        data.posts ||
        data.results ||
        data.users ||
        data.notifications ||
        data.comments ||
        data.messages ||
        data.chats ||
        data.reports ||
        data.data ||
        []
      );
    }
  };

  TO.helpers = helpers;

  /* ============================================================
     TOAST
     ============================================================ */

  const toast = (() => {
    let root = null;

    function ensure() {
      if (root && document.body.contains(root)) {
        return root;
      }

      root = document.createElement("div");

      root.id = "to-toast-root";

      Object.assign(root.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "999999",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "calc(100vw - 40px)",
        pointerEvents: "none"
      });

      document.body.appendChild(root);

      return root;
    }

    function show(message, type = "info", timeout = 3500) {
      if (!document.body) return;

      const item = document.createElement("div");

      item.textContent = String(message || "");

      Object.assign(item.style, {
        padding: "12px 16px",
        borderRadius: "12px",
        background:
          type === "error"
            ? "#dc2626"
            : type === "success"
              ? "#16a34a"
              : type === "warning"
                ? "#d97706"
                : "#1f2937",
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,.18)",
        fontSize: "14px",
        lineHeight: "1.4",
        pointerEvents: "auto",
        opacity: "0",
        transform: "translateY(-8px)",
        transition: "all .2s ease"
      });

      ensure().appendChild(item);

      requestAnimationFrame(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      });

      setTimeout(() => {
        item.style.opacity = "0";
        item.style.transform = "translateY(-8px)";

        setTimeout(() => item.remove(), 250);
      }, timeout);
    }

    return {
      show,
      success(message) {
        show(message, "success");
      },
      error(message) {
        show(message, "error");
      },
      warning(message) {
        show(message, "warning");
      },
      info(message) {
        show(message, "info");
      }
    };
  })();

  TO.toast = toast;

  /* ============================================================
     CONFIRM
     ============================================================ */

  function confirmAction(message, title = "Подтверждение") {
    return new Promise(resolve => {
      if (typeof window.confirm === "function") {
        resolve(window.confirm(`${title}\n\n${message}`));
      } else {
        resolve(false);
      }
    });
  }

  TO.confirm = confirmAction;

  /* ============================================================
     REQUEST
     ============================================================ */

  async function request(
    url,
    options = {},
    config = {}
  ) {
    const {
      method = "GET",
      body,
      headers = {},
      timeout = 15000,
      silent = false,
      parse = true
    } = {
      ...options,
      ...config
    };

    const controller = new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      timeout
    );

    const finalHeaders = {
      Accept: "application/json",
      ...headers
    };

    const fetchOptions = {
      method,
      credentials: "include",
      headers: finalHeaders,
      signal: controller.signal
    };

    if (
      body !== undefined &&
      body !== null &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      if (
        body instanceof FormData ||
        body instanceof Blob ||
        typeof body === "string"
      ) {
        fetchOptions.body = body;
      } else {
        finalHeaders["Content-Type"] =
          "application/json";

        fetchOptions.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(
        url,
        fetchOptions
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data = null;

      if (parse) {
        if (contentType.includes("application/json")) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        } else {
          try {
            const text = await response.text();
            data = text ? { text } : null;
          } catch {
            data = null;
          }
        }
      }

      if (!response.ok) {
        const error = new Error(
          data?.message ||
          data?.error ||
          `HTTP ${response.status}`
        );

        error.status = response.status;
        error.data = data;
        error.url = url;

        throw error;
      }

      return {
        ok: true,
        status: response.status,
        data,
        headers: response.headers
      };
    } catch (error) {
      if (!silent) {
        if (error.name === "AbortError") {
          toast.error("Запрос выполнялся слишком долго.");
        } else if (
          error.status === 401
        ) {
          toast.warning(
            "Требуется авторизация."
          );
        } else if (
          error.status === 403
        ) {
          toast.error(
            "Недостаточно прав для этого действия."
          );
        }
      }

      return {
        ok: false,
        status: error.status || 0,
        error,
        data: error.data || null
      };
    } finally {
      clearTimeout(timer);
    }
  }

  TO.request = request;

  async function tryRequests(
    requests,
    options = {}
  ) {
    let last = null;

    for (const item of requests) {
      const result = await request(
        item.url,
        item.options || {},
        {
          silent: true,
          ...options
        }
      );

      last = result;

      if (result.ok) {
        return result;
      }

      if (
        result.status &&
        ![404, 405, 501].includes(result.status)
      ) {
        return result;
      }
    }

    return last || {
      ok: false,
      status: 0,
      data: null
    };
  }

  TO.tryRequests = tryRequests;

  /* ============================================================
     AUTH
     ============================================================ */

  const auth = {
    user: null,

    async me() {
      const result = await request(
        API.authMe,
        {},
        { silent: true }
      );

      if (result.ok) {
        const user =
          result.data?.user ||
          result.data?.data ||
          result.data;

        if (
          user &&
          typeof user === "object"
        ) {
          this.user = user;
          storage.set(
            STORAGE.USER,
            user
          );
          return user;
        }

        this.user = null;
        return null;
      }

      this.user = storage.get(
        STORAGE.USER,
        null
      );

      return this.user;
    },

    async register(payload) {
      const result = await request(
        API.authRegister,
        {
          method: "POST",
          body: payload
        }
      );

      if (result.ok) {
        const user =
          result.data?.user ||
          result.data?.data?.user ||
          null;

        if (user) {
          this.user = user;
          storage.set(
            STORAGE.USER,
            user
          );
        }

        toast.success(
          "Регистрация выполнена."
        );
      }

      return result;
    },

    async login(payload) {
      const result = await request(
        API.authLogin,
        {
          method: "POST",
          body: payload
        }
      );

      if (result.ok) {
        const user =
          result.data?.user ||
          result.data?.data?.user ||
          result.data?.data ||
          null;

        if (user) {
          this.user = user;
          storage.set(
            STORAGE.USER,
            user
          );
        }

        toast.success(
          "Вы успешно вошли."
        );
      }

      return result;
    },

    async logout() {
      await request(
        API.authLogout,
        {
          method: "POST",
          body: {}
        },
        { silent: true }
      );

      this.user = null;

      storage.remove(
        STORAGE.USER
      );

      toast.success(
        "Вы вышли из аккаунта."
      );

      return true;
    },

    isLoggedIn() {
      return !!(
        this.user ||
        storage.get(STORAGE.USER)
      );
    },

    getUser() {
      return (
        this.user ||
        storage.get(STORAGE.USER, null)
      );
    }
  };

  TO.auth = auth;

  /* ============================================================
     ACTOR / TESTING
     ============================================================ */

  const actor = {
    isTestMode() {
      return storage.get(
        STORAGE.TEST_MODE,
        false
      ) === true;
    },

    enable(user) {
      if (!user) {
        toast.error(
          "Сначала выберите участника."
        );
        return false;
      }

      storage.set(
        STORAGE.ACTOR,
        user
      );

      storage.set(
        STORAGE.TEST_MODE,
        true
      );

      toast.success(
        `Тестовый режим: ${
          helpers.first(
            user.name,
            user.full_name,
            user.username,
            "участник"
          )
        }`
      );

      this.renderIndicator();

      return true;
    },

    disable() {
      storage.set(
        STORAGE.TEST_MODE,
        false
      );

      storage.remove(
        STORAGE.ACTOR
      );

      toast.info(
        "Тестовый режим выключен."
      );

      this.renderIndicator();
    },

    selected() {
      return storage.get(
        STORAGE.ACTOR,
        null
      );
    },

    current() {
      if (
        this.isTestMode() &&
        this.selected()
      ) {
        return this.selected();
      }

      return auth.getUser();
    },

    id() {
      return helpers.userId(
        this.current()
      );
    },

    renderIndicator() {
      let el =
        document.getElementById(
          "to-test-indicator"
        );

      if (!this.isTestMode()) {
        if (el) el.remove();
        return;
      }

      if (!el) {
        el = document.createElement("div");
        el.id = "to-test-indicator";

        Object.assign(el.style, {
          position: "fixed",
          bottom: "15px",
          left: "15px",
          zIndex: "999998",
          padding: "10px 14px",
          borderRadius: "12px",
          background: "#7c3aed",
          color: "#fff",
          fontSize: "13px",
          boxShadow:
            "0 8px 30px rgba(0,0,0,.25)"
        });

        document.body.appendChild(el);
      }

      const user = this.selected();

      el.innerHTML = `
        <strong>🧪 ТЕСТОВЫЙ РЕЖИМ</strong><br>
        ${helpers.escape(
          helpers.first(
            user?.name,
            user?.full_name,
            user?.username,
            "Участник"
          )
        )}
        <button
          type="button"
          data-to-action="disable-test-mode"
          style="
            margin-left:8px;
            border:0;
            border-radius:7px;
            padding:4px 8px;
            cursor:pointer;
          "
        >Выйти</button>
      `;
    }
  };

  TO.actor = actor;

  /* ============================================================
     PUBLICATIONS
     ============================================================ */

  const publications = {
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

      const suffix =
        query.toString()
          ? `?${query.toString()}`
          : "";

      const result =
        await tryRequests([
          {
            url:
              API.publications +
              suffix
          },
          {
            url:
              API.posts +
              suffix
          }
        ]);

      if (!result?.ok) {
        return [];
      }

      return helpers
        .list(result.data)
        .map(
          helpers.normalizePublication
        )
        .filter(Boolean);
    },

    async get(id) {
      const safeId =
        encodeURIComponent(id);

      const result =
        await tryRequests([
          {
            url:
              `${API.publications}/${safeId}`
          },
          {
            url:
              `${API.posts}/${safeId}`
          }
        ]);

      if (!result?.ok) {
        return null;
      }

      return helpers.normalizePublication(
        result.data?.publication ||
        result.data?.post ||
        result.data?.data ||
        result.data
      );
    },

    async create(payload) {
      const actorUser =
        actor.current();

      const body = {
        ...payload
      };

      if (
        actor.isTestMode() &&
        actorUser
      ) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actorUser);
      }

      const result = await request(
        API.publications,
        {
          method: "POST",
          body
        }
      );

      if (result.ok) {
        toast.success(
          "Публикация отправлена на проверку."
        );
      }

      return result;
    },

    async edit(id, payload) {
      const body = {
        id,
        publication_id: id,
        ...payload
      };

      const result =
        await tryRequests([
          {
            url:
              API.adminPublicationEdit,
            options: {
              method: "POST",
              body
            }
          },
          {
            url:
              `${API.publications}/${encodeURIComponent(id)}`,
            options: {
              method: "PUT",
              body: payload
            }
          }
        ]);

      if (result.ok) {
        toast.success(
          "Публикация изменена."
        );
      }

      return result;
    },

    async remove(id) {
      const result =
        await tryRequests([
          {
            url:
              API.adminPublicationAction,
            options: {
              method: "POST",
              body: {
                id,
                publication_id: id,
                action: "delete"
              }
            }
          },
          {
            url:
              `${API.publications}/${encodeURIComponent(id)}`,
            options: {
              method: "DELETE"
            }
          }
        ]);

      if (result.ok) {
        toast.success(
          "Публикация удалена."
        );
      }

      return result;
    },

    async restore(id) {
      return admin.publicationAction(
        id,
        "restore"
      );
    },

    async moderate(id, action, extra = {}) {
      return admin.publicationAction(
        id,
        action,
        extra
      );
    }
  };

  TO.publications = publications;

  /* ============================================================
     VIEWS
     ============================================================ */

  const views = {
    async add(publicationId) {
      const id =
        helpers.id(publicationId);

      if (!id) return null;

      const viewed =
        storage.get(
          STORAGE.VIEWED,
          {}
        );

      const key =
        `${location.pathname}:${id}`;

      if (viewed[key]) {
        return {
          ok: true,
          duplicate: true
        };
      }

      viewed[key] = Date.now();

      storage.set(
        STORAGE.VIEWED,
        viewed
      );

      const actorUser =
        actor.current();

      const body = {
        publication_id: id,
        id
      };

      if (
        actor.isTestMode() &&
        actorUser
      ) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actorUser);
      }

      return await tryRequests([
        {
          url: API.publicationView,
          options: {
            method: "POST",
            body
          }
        },
        {
          url: API.views,
          options: {
            method: "POST",
            body
          }
        }
      ], {
        silent: true
      });
    },

    observe(root = document) {
      if (
        !("IntersectionObserver" in window)
      ) {
        return;
      }

      const elements =
        root.querySelectorAll(
          "[data-publication-id], [data-post-id]"
        );

      if (!elements.length) return;

      const observer =
        new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (
                !entry.isIntersecting ||
                entry.intersectionRatio < 0.5
              ) {
                return;
              }

              const el =
                entry.target;

              const id =
                el.dataset.publicationId ||
                el.dataset.postId;

              if (id) {
                views.add(id);
                observer.unobserve(el);
              }
            });
          },
          {
            threshold: 0.5
          }
        );

      elements.forEach(
        element =>
          observer.observe(element)
      );
    }
  };

  TO.views = views;

  /* ============================================================
     REACTIONS
     ============================================================ */

  const reactions = {
    async toggle(
      publicationId,
      reaction = "like"
    ) {
      if (
        !REACTIONS.includes(reaction)
      ) {
        reaction = "like";
      }

      const body = {
        publication_id:
          publicationId,
        id: publicationId,
        reaction
      };

      const current =
        actor.current();

      if (
        actor.isTestMode() &&
        current
      ) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(current);
      }

      const result =
        await tryRequests([
          {
            url:
              API.publicationReact,
            options: {
              method: "POST",
              body
            }
          },
          {
            url:
              API.reactions,
            options: {
              method: "POST",
              body
            }
          }
        ]);

      if (result.ok) {
        toast.success(
          `${REACTION_ICONS[reaction]} Реакция обновлена.`
        );
      }

      return result;
    },

    async comment(
      commentId,
      reaction = "like"
    ) {
      const body = {
        comment_id: commentId,
        id: commentId,
        reaction
      };

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      return await request(
        API.reactions,
        {
          method: "POST",
          body
        },
        { silent: false }
      );
    }
  };

  TO.reactions = reactions;

  /* ============================================================
     COMMENTS
     ============================================================ */

  const comments = {
    async list(publicationId) {
      const query =
        new URLSearchParams({
          publication_id:
            publicationId
        });

      const result =
        await request(
          `${API.comments}?${query}`,
          {},
          { silent: true }
        );

      if (!result.ok) {
        return [];
      }

      return helpers.list(
        result.data
      );
    },

    async create(
      publicationId,
      text,
      parentId = null
    ) {
      if (!String(text || "").trim()) {
        toast.warning(
          "Введите комментарий."
        );
        return {
          ok: false
        };
      }

      const body = {
        publication_id:
          publicationId,
        text: String(text).trim()
      };

      if (parentId) {
        body.parent_id = parentId;
        body.parentId = parentId;
      }

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      const result =
        await request(
          API.comments,
          {
            method: "POST",
            body
          }
        );

      if (result.ok) {
        toast.success(
          "Комментарий добавлен."
        );
      }

      return result;
    },

    async edit(commentId, text) {
      const result =
        await tryRequests([
          {
            url:
              API.adminCommentEdit,
            options: {
              method: "POST",
              body: {
                id: commentId,
                comment_id: commentId,
                text
              }
            }
          },
          {
            url:
              `${API.comments}/${encodeURIComponent(commentId)}`,
            options: {
              method: "PUT",
              body: { text }
            }
          }
        ]);

      return result;
    },

    async remove(commentId) {
      const result =
        await tryRequests([
          {
            url:
              API.adminCommentAction,
            options: {
              method: "POST",
              body: {
                id: commentId,
                comment_id: commentId,
                action: "delete"
              }
            }
          },
          {
            url:
              `${API.comments}/${encodeURIComponent(commentId)}`,
            options: {
              method: "DELETE"
            }
          }
        ]);

      if (result.ok) {
        toast.success(
          "Комментарий удалён."
        );
      }

      return result;
    }
  };

  TO.comments = comments;

  /* ============================================================
     SAVES
     ============================================================ */

  const saves = {
    async toggle(publicationId) {
      const body = {
        publication_id:
          publicationId,
        id: publicationId
      };

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      const result =
        await request(
          API.publicationSave,
          {
            method: "POST",
            body
          },
          { silent: true }
        );

      if (
        !result.ok &&
        [404, 405].includes(result.status)
      ) {
        return request(
          API.saves,
          {
            method: "POST",
            body
          }
        );
      }

      if (result.ok) {
        toast.success(
          "Сохранения обновлены."
        );
      }

      return result;
    }
  };

  TO.saves = saves;

  /* ============================================================
     SHARES
     ============================================================ */

  const shares = {
    async track(publicationId, platform = "copy") {
      const body = {
        publication_id:
          publicationId,
        id: publicationId,
        platform
      };

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      return await tryRequests([
        {
          url:
            API.publicationShare,
          options: {
            method: "POST",
            body
          }
        },
        {
          url:
            API.shares,
          options: {
            method: "POST",
            body
          }
        }
      ], {
        silent: true
      });
    },

    async copy(publicationId) {
      const url =
        new URL(
          `/publication.html?id=${encodeURIComponent(
            publicationId
          )}`,
          location.origin
        ).href;

      try {
        await navigator.clipboard.writeText(
          url
        );

        await this.track(
          publicationId,
          "copy"
        );

        toast.success(
          "Ссылка скопирована."
        );

        return true;
      } catch {
        toast.error(
          "Не удалось скопировать ссылку."
        );

        return false;
      }
    },

    async telegram(publicationId, title = "") {
      const url =
        new URL(
          `/publication.html?id=${encodeURIComponent(
            publicationId
          )}`,
          location.origin
        ).href;

      await this.track(
        publicationId,
        "telegram"
      );

      const text =
        `${title || SITE_NAME}\n${url}`;

      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(
          text
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
    },

    async native(publicationId, title = "") {
      const url =
        new URL(
          `/publication.html?id=${encodeURIComponent(
            publicationId
          )}`,
          location.origin
        ).href;

      await this.track(
        publicationId,
        "native"
      );

      if (
        navigator.share
      ) {
        try {
          await navigator.share({
            title,
            text: title,
            url
          });

          return true;
        } catch {
          return false;
        }
      }

      return this.copy(publicationId);
    }
  };

  TO.shares = shares;

  /* ============================================================
     FOLLOW
     ============================================================ */

  const follow = {
    async toggle(userId, target = {}) {
      const body = {
        user_id: userId,
        target_user_id: userId,
        username:
          target.username ||
          target.user_username ||
          ""
      };

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      const result =
        await request(
          API.follows,
          {
            method: "POST",
            body
          },
          { silent: true }
        );

      if (result.ok) {
        toast.success(
          "Подписка обновлена."
        );
      }

      return result;
    }
  };

  TO.follow = follow;

  /* ============================================================
     MESSAGES
     ============================================================ */

  const messages = {
    async chats() {
      const result =
        await request(
          API.chat,
          {},
          { silent: true }
        );

      if (!result.ok) {
        return [];
      }

      return helpers.list(
        result.data
      );
    },

    async list(userId = null) {
      const query =
        new URLSearchParams();

      if (userId) {
        query.set(
          "user_id",
          userId
        );

        query.set(
          "participant_id",
          userId
        );
      }

      const result =
        await request(
          `${API.chatMessages}?${query}`,
          {},
          { silent: true }
        );

      if (!result.ok) {
        return [];
      }

      return helpers.list(
        result.data
      );
    },

    async send(
      text,
      userId = null,
      extra = {}
    ) {
      if (!String(text || "").trim()) {
        return {
          ok: false
        };
      }

      const body = {
        text: String(text).trim(),
        ...extra
      };

      if (userId) {
        body.user_id = userId;
        body.recipient_id = userId;
      }

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      const result =
        await request(
          API.chatMessages,
          {
            method: "POST",
            body
          }
        );

      if (result.ok) {
        toast.success(
          "Сообщение отправлено."
        );
      }

      return result;
    },

    async read(userId = null) {
      const body = {};

      if (userId) {
        body.user_id = userId;
        body.chat_id = userId;
      }

      return request(
        API.chatRead,
        {
          method: "POST",
          body
        },
        { silent: true }
      );
    },

    openAdmin() {
      const params =
        new URLSearchParams({
          admin: "1"
        });

      window.location.href =
        `/messages.html?${params}`;
    },

    official() {
      return {
        id: "official",
        name: SITE_NAME,
        username: SITE_USERNAME,
        displayName:
          `🇹🇯 ${SITE_NAME}✅`,
        official: true
      };
    }
  };

  TO.messages = messages;

  /* ============================================================
     ADMIN CHAT
     ============================================================ */

  const adminChat = {
    async chats() {
      const result =
        await request(
          API.adminChats,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async messages(userId) {
      const query =
        new URLSearchParams({
          user_id: userId
        });

      const result =
        await request(
          `${API.adminChatMessages}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async send(userId, text, extra = {}) {
      const body = {
        user_id: userId,
        recipient_id: userId,
        text,
        ...extra
      };

      return request(
        API.adminChatSend,
        {
          method: "POST",
          body
        }
      );
    }
  };

  TO.adminChat = adminChat;

  /* ============================================================
     NOTIFICATIONS
     ============================================================ */

  const notifications = {
    async list() {
      const result =
        await request(
          API.notifications,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async read(id) {
      const body = {
        id,
        notification_id: id
      };

      return request(
        API.notificationsRead,
        {
          method: "POST",
          body
        },
        { silent: true }
      );
    },

    async readAll() {
      return request(
        API.notificationsRead,
        {
          method: "POST",
          body: {
            all: true,
            read_all: true
          }
        },
        { silent: true }
      );
    }
  };

  TO.notifications = notifications;

  /* ============================================================
     REPORTS
     ============================================================ */

  const reports = {
    async create(payload) {
      const body = {
        ...payload
      };

      if (actor.isTestMode()) {
        body.test_mode = true;
        body.test_actor_id =
          helpers.userId(actor.current());
      }

      const result =
        await request(
          API.reports,
          {
            method: "POST",
            body
          }
        );

      if (result.ok) {
        toast.success(
          "Жалоба отправлена."
        );
      }

      return result;
    },

    async list() {
      const result =
        await tryRequests([
          {
            url:
              API.adminReports
          },
          {
            url:
              API.reports
          }
        ]);

      return result?.ok
        ? helpers.list(result.data)
        : [];
    }
  };

  TO.reports = reports;

  /* ============================================================
     PROFILE
     ============================================================ */

  const profile = {
    async me() {
      const result =
        await request(
          API.profile,
          {},
          { silent: true }
        );

      if (result.ok) {
        const data =
          result.data?.profile ||
          result.data?.user ||
          result.data?.data ||
          result.data;

        if (data) {
          const cache =
            storage.get(
              STORAGE.PROFILE_CACHE,
              {}
            );

          cache.me = data;

          storage.set(
            STORAGE.PROFILE_CACHE,
            cache
          );

          return data;
        }
      }

      const cache =
        storage.get(
          STORAGE.PROFILE_CACHE,
          {}
        );

      return (
        cache.me ||
        auth.getUser()
      );
    },

    async update(payload) {
      const result =
        await request(
          API.profile,
          {
            method: "PUT",
            body: payload
          }
        );

      if (result.ok) {
        const data =
          result.data?.profile ||
          result.data?.user ||
          result.data?.data ||
          payload;

        const cache =
          storage.get(
            STORAGE.PROFILE_CACHE,
            {}
          );

        cache.me = data;

        storage.set(
          STORAGE.PROFILE_CACHE,
          cache
        );

        auth.user = {
          ...auth.getUser(),
          ...data
        };

        storage.set(
          STORAGE.USER,
          auth.user
        );

        toast.success(
          "Профиль обновлён."
        );
      }

      return result;
    },

    async public(username) {
      const clean =
        String(username || "")
          .replace(/^@/, "");

      const query =
        new URLSearchParams({
          username: `@${clean}`
        });

      const result =
        await request(
          `${API.profilePublic}?${query}`,
          {},
          { silent: true }
        );

      if (!result.ok) {
        return null;
      }

      const data =
        result.data?.profile ||
        result.data?.user ||
        result.data?.data ||
        result.data;

      const cache =
        storage.get(
          STORAGE.PROFILE_CACHE,
          {}
        );

      cache[`@${clean}`] = data;

      storage.set(
        STORAGE.PROFILE_CACHE,
        cache
      );

      return data;
    }
  };

  TO.profile = profile;

  /* ============================================================
     CATEGORIES
     ============================================================ */

  const categories = {
    async list() {
      const result =
        await request(
          API.categories,
          {},
          { silent: true }
        );

      if (result.ok) {
        const list =
          helpers.list(result.data);

        if (list.length) {
          storage.set(
            STORAGE.CATEGORIES,
            list
          );

          return list;
        }
      }

      return storage.get(
        STORAGE.CATEGORIES,
        CATEGORIES.map(
          ([id, label]) => ({
            id,
            name: label,
            label
          })
        )
      );
    }
  };

  TO.categories = categories;

  /* ============================================================
     ADMIN
     ============================================================ */

  const admin = {
    user: null,

    async login(payload) {
      const result =
        await request(
          API.adminLogin,
          {
            method: "POST",
            body: payload
          }
        );

      if (result.ok) {
        const adminUser =
          result.data?.admin ||
          result.data?.user ||
          result.data?.data ||
          null;

        this.user = adminUser;

        if (adminUser) {
          storage.set(
            STORAGE.ADMIN,
            adminUser
          );
        }

        toast.success(
          "Вход администратора выполнен."
        );
      }

      return result;
    },

    async logout() {
      await request(
        API.adminLogout,
        {
          method: "POST",
          body: {}
        },
        { silent: true }
      );

      this.user = null;

      storage.remove(
        STORAGE.ADMIN
      );
    },

    async me() {
      const result =
        await request(
          API.adminMe,
          {},
          { silent: true }
        );

      if (result.ok) {
        const data =
          result.data?.admin ||
          result.data?.user ||
          result.data?.data ||
          result.data;

        this.user = data || null;

        if (data) {
          storage.set(
            STORAGE.ADMIN,
            data
          );
        }

        return data;
      }

      return storage.get(
        STORAGE.ADMIN,
        null
      );
    },

    async dashboard() {
      const result =
        await request(
          API.adminDashboard,
          {},
          { silent: true }
        );

      return result.ok
        ? result.data
        : null;
    },

    async users(params = {}) {
      const query =
        new URLSearchParams();

      Object.entries(params)
        .forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            query.set(
              key,
              value
            );
          }
        });

      const result =
        await request(
          `${API.adminUsers}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async user(id) {
      const query =
        new URLSearchParams({
          id
        });

      const result =
        await request(
          `${API.adminUser}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? (
          result.data?.user ||
          result.data?.data ||
          result.data
        )
        : null;
    },

    async editUser(id, data) {
      return request(
        API.adminUserEdit,
        {
          method: "POST",
          body: {
            id,
            user_id: id,
            ...data
          }
        }
      );
    },

    async userAction(id, action, extra = {}) {
      const result =
        await request(
          API.adminUserAction,
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

      if (result.ok) {
        toast.success(
          `Действие "${action}" выполнено.`
        );
      }

      return result;
    },

    async publications(params = {}) {
      const query =
        new URLSearchParams();

      Object.entries(params)
        .forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            query.set(
              key,
              value
            );
          }
        });

      const result =
        await request(
          `${API.adminPublications}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers
            .list(result.data)
            .map(
              helpers.normalizePublication
            )
        : [];
    },

    async publicationAction(
      id,
      action,
      extra = {}
    ) {
      const result =
        await request(
          API.adminPublicationAction,
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

      if (result.ok) {
        toast.success(
          `Публикация: ${action}`
        );
      }

      return result;
    },

    async publicationCounters(
      id,
      counters
    ) {
      return request(
        API.adminPublicationCounters,
        {
          method: "POST",
          body: {
            id,
            publication_id: id,
            ...counters
          }
        }
      );
    },

    async editPublication(
      id,
      data
    ) {
      return request(
        API.adminPublicationEdit,
        {
          method: "POST",
          body: {
            id,
            publication_id: id,
            ...data
          }
        }
      );
    },

    async comments(params = {}) {
      const query =
        new URLSearchParams(params);

      const result =
        await request(
          `${API.adminComments}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async commentAction(
      id,
      action,
      extra = {}
    ) {
      return request(
        API.adminCommentAction,
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

    async payment(
      publicationId,
      action,
      amount = null,
      extra = {}
    ) {
      return request(
        API.adminPayment,
        {
          method: "POST",
          body: {
            publication_id:
              publicationId,
            id: publicationId,
            action,
            amount,
            ...extra
          }
        }
      );
    },

    async notifications() {
      const result =
        await request(
          API.adminNotifications,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async reports() {
      const result =
        await request(
          API.adminReports,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async trash(params = {}) {
      const query =
        new URLSearchParams(params);

      const result =
        await request(
          `${API.adminTrash}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    },

    async stats() {
      const result =
        await request(
          API.adminStats,
          {},
          { silent: true }
        );

      return result.ok
        ? result.data
        : null;
    },

    async audit(params = {}) {
      const query =
        new URLSearchParams(params);

      const result =
        await request(
          `${API.adminAudit}?${query}`,
          {},
          { silent: true }
        );

      return result.ok
        ? helpers.list(result.data)
        : [];
    }
  };

  TO.admin = admin;

  /* ============================================================
     TESTING CENTER
     ============================================================ */

  const testing = {
    selected() {
      return actor.selected();
    },

    select(user) {
      return actor.enable(user);
    },

    clear() {
      actor.disable();
    },

    async serverAction(
      action,
      payload = {}
    ) {
      const selected =
        actor.selected();

      if (!selected) {
        toast.error(
          "Не выбран участник для тестирования."
        );

        return {
          ok: false
        };
      }

      const body = {
        action,
        test_mode: true,
        test_actor_id:
          helpers.userId(selected),
        actor_id:
          helpers.userId(selected),
        ...payload
      };

      const result =
        await request(
          API.adminTesting,
          {
            method: "POST",
            body
          },
          { silent: true }
        );

      if (!result.ok) {
        toast.warning(
          "Серверный тестовый API пока недоступен."
        );
      }

      return result;
    },

    async like(publicationId, reaction = "like") {
      const result =
        await this.serverAction(
          "reaction",
          {
            publication_id:
              publicationId,
            reaction
          }
        );

      if (result.ok) return result;

      return reactions.toggle(
        publicationId,
        reaction
      );
    },

    async comment(
      publicationId,
      text,
      parentId = null
    ) {
      const result =
        await this.serverAction(
          "comment",
          {
            publication_id:
              publicationId,
            text,
            parent_id: parentId
          }
        );

      if (result.ok) return result;

      return comments.create(
        publicationId,
        text,
        parentId
      );
    },

    async save(publicationId) {
      const result =
        await this.serverAction(
          "save",
          {
            publication_id:
              publicationId
          }
        );

      if (result.ok) return result;

      return saves.toggle(
        publicationId
      );
    },

    async share(publicationId) {
      const result =
        await this.serverAction(
          "share",
          {
            publication_id:
              publicationId
          }
        );

      if (result.ok) return result;

      return shares.track(
        publicationId,
        "test"
      );
    },

    async view(publicationId) {
      const result =
        await this.serverAction(
          "view",
          {
            publication_id:
              publicationId
          }
        );

      if (result.ok) return result;

      return views.add(
        publicationId
      );
    },

    async follow(userId) {
      const result =
        await this.serverAction(
          "follow",
          {
            target_user_id:
              userId
          }
        );

      if (result.ok) return result;

      return follow.toggle(
        userId
      );
    },

    async message(text, recipientId = null) {
      const result =
        await this.serverAction(
          "message",
          {
            text,
            recipient_id:
              recipientId
          }
        );

      if (result.ok) return result;

      return messages.send(
        text,
        recipientId
      );
    },

    async publication(payload) {
      return this.serverAction(
        "publication",
        {
          publication: payload,
          ...payload
        }
      );
    },

    async report(payload) {
      const result =
        await this.serverAction(
          "report",
          payload
        );

      if (result.ok) return result;

      return reports.create(
        payload
      );
    },

    async deleteReport(id) {
      return this.serverAction(
        "delete_report",
        {
          report_id: id
        }
      );
    },

    async notification(payload) {
      return this.serverAction(
        "notification",
        payload
      );
    }
  };

  TO.testing = testing;

  /* ============================================================
     MANUAL STATISTICS
     ============================================================ */

  const stats = {
    defaults: {
      participants: 0,
      publications: 0,
      reactions: 0,
      views: 0,
      shares: 0,
      saves: 0,
      followers: 0,
      comments: 0,
      notifications: 0,
      messages: 0,
      reports: 0
    },

    get() {
      return {
        ...this.defaults,
        ...storage.get(
          STORAGE.STATS,
          {}
        )
      };
    },

    set(name, value) {
      const data =
        this.get();

      data[name] =
        Math.max(
          0,
          helpers.number(value)
        );

      storage.set(
        STORAGE.STATS,
        data
      );

      return data;
    },

    increment(
      name,
      amount = 1
    ) {
      const data =
        this.get();

      data[name] =
        Math.max(
          0,
          helpers.number(
            data[name]
          ) +
          helpers.number(
            amount
          )
        );

      storage.set(
        STORAGE.STATS,
        data
      );

      return data[name];
    },

    async sync() {
      const server =
        await admin.stats();

      if (
        server &&
        typeof server === "object"
      ) {
        const local =
          this.get();

        const merged = {
          ...local,
          ...server
        };

        storage.set(
          STORAGE.STATS,
          merged
        );

        return merged;
      }

      return this.get();
    }
  };

  TO.stats = stats;

  /* ============================================================
     TRANSLATION
     ============================================================ */

  const translation = {
    languages: [
      ["tg", "Тоҷикӣ"],
      ["ru", "Русский"],
      ["en", "English"],
      ["fa", "فارسی"],
      ["uz", "O'zbek"],
      ["kk", "Қазақша"],
      ["ky", "Кыргызча"],
      ["tr", "Türkçe"],
      ["de", "Deutsch"],
      ["fr", "Français"],
      ["es", "Español"],
      ["ar", "العربية"],
      ["zh", "中文"],
      ["hi", "हिन्दी"]
    ],

    getLanguage() {
      return (
        storage.get(
          STORAGE.LANGUAGE,
          null
        ) ||
        document.documentElement.lang ||
        "ru"
      );
    },

    setLanguage(lang) {
      const exists =
        this.languages.some(
          item => item[0] === lang
        );

      if (!exists) return false;

      storage.set(
        STORAGE.LANGUAGE,
        lang
      );

      document.documentElement.lang =
        lang;

      this.apply();

      return true;
    },

    async text(
      text,
      from = "auto",
      to = this.getLanguage()
    ) {
      if (!text) return "";

      if (
        from &&
        from !== "auto" &&
        from === to
      ) {
        return text;
      }

      const result =
        await request(
          API.translations,
          {
            method: "POST",
            body: {
              text,
              source_language: from,
              target_language: to
            }
          },
          { silent: true }
        );

      if (result.ok) {
        return (
          result.data?.translation ||
          result.data?.translated_text ||
          result.data?.text ||
          text
        );
      }

      return text;
    },

    apply() {
      const lang =
        this.getLanguage();

      document
        .querySelectorAll(
          "[data-i18n]"
        )
        .forEach(el => {
          const key =
            el.dataset.i18n;

          const dictionary =
            window.TO_TRANSLATIONS?.[
              lang
            ];

          if (
            dictionary &&
            dictionary[key]
          ) {
            el.textContent =
              dictionary[key];
          }
        });

      document
        .querySelectorAll(
          "[data-i18n-placeholder]"
        )
        .forEach(el => {
          const key =
            el.dataset.i18nPlaceholder;

          const dictionary =
            window.TO_TRANSLATIONS?.[
              lang
            ];

          if (
            dictionary &&
            dictionary[key]
          ) {
            el.placeholder =
              dictionary[key];
          }
        });

      if (
        ["fa", "ar"].includes(lang)
      ) {
        document.documentElement.dir =
          "rtl";
      } else {
        document.documentElement.dir =
          "ltr";
      }
    }
  };

  TO.translation = translation;

  /* ============================================================
     THEME
     ============================================================ */

  const theme = {
    get() {
      return storage.get(
        STORAGE.THEME,
        "system"
      );
    },

    set(value) {
      if (
        !["light", "dark", "system"]
          .includes(value)
      ) {
        value = "system";
      }

      storage.set(
        STORAGE.THEME,
        value
      );

      this.apply();

      return value;
    },

    apply() {
      const value =
        this.get();

      let effective = value;

      if (value === "system") {
        effective =
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
          effective
        );

      document.documentElement
        .classList.toggle(
          "dark",
          effective === "dark"
        );

      document.documentElement
        .classList.toggle(
          "light",
          effective === "light"
        );
    }
  };

  TO.theme = theme;

  /* ============================================================
     SEARCH
     ============================================================ */

  const search = {
    async all(query, options = {}) {
      const q =
        String(query || "").trim();

      if (!q) {
        return {
          users: [],
          publications: [],
          categories: []
        };
      }

      const params = {
        ...options,
        search: q,
        q
      };

      const publications =
        await publicationsSearch(
          params
        );

      let users = [];

      try {
        users =
          await admin.users({
            search: q
          });
      } catch {}

      const categoryMatches =
        CATEGORIES
          .filter(
            ([id, label]) =>
              id
                .toLowerCase()
                .includes(q.toLowerCase()) ||
              label
                .toLowerCase()
                .includes(q.toLowerCase())
          )
          .map(
            ([id, label]) => ({
              id,
              label
            })
          );

      return {
        users,
        publications,
        categories:
          categoryMatches
      };
    }
  };

  async function publicationsSearch(params) {
    return publications.list(
      params
    );
  }

  TO.search = search;

  /* ============================================================
     UI PUBLICATION CARD
     ============================================================ */

  const ui = {
    publicationCard(publication) {
      const p =
        helpers.normalizePublication(
          publication
        );

      if (!p) return "";

      const id =
        helpers.escape(
          p.id
        );

      const media =
        helpers.media(p);

      const firstMedia =
        media[0];

      let mediaHTML = "";

      if (firstMedia?.url) {
        const type =
          String(
            firstMedia.type ||
            ""
          ).toLowerCase();

        if (
          type.includes("video") ||
          /\.(mp4|webm|mov)(\?|$)/i.test(
            firstMedia.url
          )
        ) {
          mediaHTML = `
            <video
              src="${helpers.escape(
                firstMedia.url
              )}"
              controls
              preload="metadata"
              style="
                width:100%;
                max-height:520px;
                object-fit:cover;
                border-radius:12px;
              "
            ></video>
          `;
        } else {
          mediaHTML = `
            <img
              src="${helpers.escape(
                firstMedia.url
              )}"
              alt="${helpers.escape(
                p.title
              )}"
              loading="lazy"
              style="
                width:100%;
                max-height:520px;
                object-fit:cover;
                border-radius:12px;
              "
            >
          `;
        }
      }

      const author =
        p.author || {};

      const authorName =
        helpers.first(
          author.name,
          author.full_name,
          author.username,
          "Пользователь"
        );

      const username =
        helpers.username(
          author
        );

      return `
        <article
          class="to-publication-card"
          data-publication-id="${id}"
          data-post-id="${id}"
          data-id="${id}"
        >
          <div class="to-publication-author">
            <strong>
              ${helpers.escape(authorName)}
            </strong>

            ${
              username
                ? `<span>${helpers.escape(
                    username
                  )}</span>`
                : ""
            }
          </div>

          <div class="to-publication-date">
            ${helpers.escape(
              helpers.relativeDate(
                p.created_at
              )
            )}
          </div>

          <div class="to-publication-category">
            ${helpers.escape(
              helpers.categoryLabel(
                p.category
              )
            )}
          </div>

          <h2 class="to-publication-title">
            ${helpers.escape(p.title)}
          </h2>

          ${
            p.text
              ? `
                <div class="to-publication-text">
                  ${helpers.escape(
                    p.text
                  )}
                </div>
              `
              : ""
          }

          ${
            mediaHTML
              ? `
                <div class="to-publication-media">
                  ${mediaHTML}
                </div>
              `
              : ""
          }

          <div class="to-publication-stats">
            <span>👁 ${helpers.formatNumber(
              p.views
            )}</span>

            <span>👍 ${helpers.formatNumber(
              p.likes
            )}</span>

            <span>💬 ${helpers.formatNumber(
              p.comments_count
            )}</span>

            <span>🔖 ${helpers.formatNumber(
              p.saves
            )}</span>

            <span>↗️ ${helpers.formatNumber(
              p.shares
            )}</span>
          </div>

          <div
            class="to-publication-actions"
            style="
              display:flex;
              flex-wrap:wrap;
              gap:8px;
            "
          >
            <button
              type="button"
              data-to-action="react"
              data-publication-id="${id}"
              data-reaction="like"
            >👍</button>

            <button
              type="button"
              data-to-action="react"
              data-publication-id="${id}"
              data-reaction="love"
            >❤️</button>

            <button
              type="button"
              data-to-action="save"
              data-publication-id="${id}"
            >🔖</button>

            <button
              type="button"
              data-to-action="share-copy"
              data-publication-id="${id}"
            >🔗</button>

            <button
              type="button"
              data-to-action="share-telegram"
              data-publication-id="${id}"
              data-title="${helpers.escape(
                p.title
              )}"
            >Telegram</button>

            <button
              type="button"
              data-to-action="report"
              data-publication-id="${id}"
            >⚠️</button>
          </div>
        </article>
      `;
    },

    renderPublications(
      container,
      items
    ) {
      if (!container) return;

      container.innerHTML =
        items
          .map(
            item =>
              this.publicationCard(item)
          )
          .join("");

      views.observe(
        container
      );
    }
  };

  TO.ui = ui;

  /* ============================================================
     AUTO ACTIONS
     ============================================================ */

  async function handleAction(
    element,
    action
  ) {
    const id =
      element.dataset.publicationId ||
      element.dataset.postId ||
      element.dataset.id;

    switch (action) {
      case "react": {
        const reaction =
          element.dataset.reaction ||
          "like";

        if (
          actor.isTestMode()
        ) {
          return testing.like(
            id,
            reaction
          );
        }

        return reactions.toggle(
          id,
          reaction
        );
      }

      case "save": {
        if (
          actor.isTestMode()
        ) {
          return testing.save(id);
        }

        return saves.toggle(id);
      }

      case "share-copy":
        return shares.copy(id);

      case "share-telegram":
        return shares.telegram(
          id,
          element.dataset.title ||
          ""
        );

      case "share":
        return shares.native(
          id,
          element.dataset.title ||
          ""
        );

      case "view":
        return views.add(id);

      case "follow":
        return follow.toggle(
          element.dataset.userId ||
          element.dataset.id
        );

      case "message":
        return messages.send(
          element.dataset.text ||
          "",
          element.dataset.userId
        );

      case "report": {
        const reason =
          window.prompt(
            "Укажите причину жалобы:"
          );

        if (!reason) {
          return null;
        }

        return reports.create({
          type: "publication",
          target_type: "publication",
          target_id: id,
          publication_id: id,
          reason
        });
      }

      case "disable-test-mode":
        return actor.disable();

      case "enable-test-mode": {
        const user =
          storage.get(
            STORAGE.ACTOR,
            null
          );

        return actor.enable(
          user
        );
      }

      case "admin-approve":
        return admin.publicationAction(
          id,
          "approve_free"
        );

      case "admin-publish":
        return admin.publicationAction(
          id,
          "publish"
        );

      case "admin-reject":
        return admin.publicationAction(
          id,
          "reject"
        );

      case "admin-hide":
        return admin.publicationAction(
          id,
          "hide"
        );

      case "admin-delete":
        if (
          await confirmAction(
            "Удалить публикацию?"
          )
        ) {
          return admin.publicationAction(
            id,
            "delete"
          );
        }

        return null;

      case "admin-restore":
        return admin.publicationAction(
          id,
          "restore"
        );

      case "admin-pin":
        return admin.publicationAction(
          id,
          "pin"
        );

      case "admin-feature":
        return admin.publicationAction(
          id,
          "feature"
        );

      case "admin-request-payment":
        return admin.publicationAction(
          id,
          "request_payment"
        );

      case "admin-payment-received":
        return admin.payment(
          id,
          "payment_received"
        );

      case "admin-user-block":
        return admin.userAction(
          element.dataset.userId,
          "block"
        );

      case "admin-user-unblock":
        return admin.userAction(
          element.dataset.userId,
          "unblock"
        );

      case "admin-user-verify":
        return admin.userAction(
          element.dataset.userId,
          "verify"
        );

      default:
        return null;
    }
  }

  TO.handleAction =
    handleAction;

  function bindActions(root = document) {
    root
      .querySelectorAll(
        "[data-to-action]"
      )
      .forEach(element => {
        if (
          element.dataset.toBound === "1"
        ) {
          return;
        }

        element.dataset.toBound = "1";

        element.addEventListener(
          "click",
          async event => {
            event.preventDefault();

            const action =
              element.dataset.toAction;

            try {
              await handleAction(
                element,
                action
              );
            } catch (error) {
              console.error(
                "[TO action]",
                error
              );

              toast.error(
                "Не удалось выполнить действие."
              );
            }
          }
        );
      });
  }

  TO.bindActions =
    bindActions;

  /* ============================================================
     MUTATION OBSERVER
     ============================================================ */

  function observeDOM() {
    if (
      !("MutationObserver" in window) ||
      !document.body
    ) {
      return;
    }

    const observer =
      new MutationObserver(
        mutations => {
          let changed = false;

          for (const mutation of mutations) {
            if (
              mutation.addedNodes.length
            ) {
              changed = true;
              break;
            }
          }

          if (changed) {
            bindActions(
              document
            );

            views.observe(
              document
            );

            actor.renderIndicator();
          }
        }
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

    TO.domObserver =
      observer;
  }

  /* ============================================================
     AUTOMATIC VIEW TRACKING
     ============================================================ */

  function autoViews() {
    views.observe(
      document
    );
  }

  /* ============================================================
     AUTO PROFILE / AUTH UI
     ============================================================ */

  function updateAuthUI() {
    const user =
      auth.getUser();

    document
      .querySelectorAll(
        "[data-to-user-name]"
      )
      .forEach(el => {
        el.textContent =
          helpers.first(
            user?.name,
            user?.full_name,
            user?.username,
            "Пользователь"
          );
      });

    document
      .querySelectorAll(
        "[data-to-username]"
      )
      .forEach(el => {
        el.textContent =
          helpers.username(
            user
          );
      });

    document
      .querySelectorAll(
        "[data-to-user-id]"
      )
      .forEach(el => {
        el.textContent =
          helpers.userId(
            user
          ) || "";
      });

    document
      .querySelectorAll(
        "[data-to-auth]"
      )
      .forEach(el => {
        const mode =
          el.dataset.toAuth;

        const logged =
          auth.isLoggedIn();

        if (
          mode === "logged-in"
        ) {
          el.hidden = !logged;
        }

        if (
          mode === "logged-out"
        ) {
          el.hidden = logged;
        }
      });
  }

  /* ============================================================
     ADMIN QUICK ACTIONS
     ============================================================ */

  async function adminQuickRefresh() {
    const [
      dashboard,
      users,
      publicationsList,
      reportList,
      notificationList,
      trash
    ] = await Promise.all([
      admin.dashboard(),
      admin.users(),
      admin.publications(),
      admin.reports(),
      admin.notifications(),
      admin.trash()
    ]);

    return {
      dashboard,
      users,
      publications:
        publicationsList,
      reports: reportList,
      notifications:
        notificationList,
      trash
    };
  }

  TO.adminQuickRefresh =
    adminQuickRefresh;

  /* ============================================================
     ADMIN STAT CARD
     ============================================================ */

  function renderStats(
    container,
    data
  ) {
    if (!container) return;

    const source = {
      ...stats.get(),
      ...(data || {})
    };

    const labels = {
      participants:
        "Участники",
      publications:
        "Публикации",
      reactions:
        "Реакции",
      views:
        "Просмотры",
      shares:
        "Репосты",
      saves:
        "Сохранения",
      followers:
        "Подписчики",
      comments:
        "Комментарии",
      notifications:
        "Уведомления",
      messages:
        "Сообщения",
      reports:
        "Жалобы"
    };

    container.innerHTML =
      Object.entries(
        labels
      )
        .map(
          ([key, label]) => `
            <div
              class="to-stat"
              data-stat="${key}"
            >
              <div>
                ${helpers.escape(label)}
              </div>
              <strong>
                ${helpers.formatNumber(
                  source[key] || 0
                )}
              </strong>
            </div>
          `
        )
        .join("");
  }

  TO.renderStats =
    renderStats;

  /* ============================================================
     ADMIN PARTICIPANT CARD
     ============================================================ */

  function renderParticipantCard(
    user
  ) {
    const id =
      helpers.userId(user);

    const username =
      helpers.username(user);

    const name =
      helpers.first(
        user.name,
        user.full_name,
        user.username,
        "Без имени"
      );

    return `
      <article
        class="to-participant-card"
        data-user-id="${helpers.escape(id)}"
      >
        <strong>
          ${helpers.escape(name)}
        </strong>

        ${
          username
            ? `<span>${helpers.escape(
                username
              )}</span>`
            : ""
        }

        ${
          user.email
            ? `<div>${helpers.escape(
                user.email
              )}</div>`
            : ""
        }

        ${
          user.phone
            ? `<div>${helpers.escape(
                user.phone
              )}</div>`
            : ""
        }

        ${
          user.created_at
            ? `<div>Регистрация: ${helpers.escape(
                helpers.formatDate(
                  user.created_at
                )
              )}</div>`
            : ""
        }

        <div
          style="
            display:flex;
            flex-wrap:wrap;
            gap:6px;
            margin-top:10px;
          "
        >
          <button
            type="button"
            data-to-action="select-test-user"
            data-user-id="${helpers.escape(id)}"
          >
            🧪 Тестировать
          </button>

          <button
            type="button"
            data-to-action="admin-user-block"
            data-user-id="${helpers.escape(id)}"
          >
            🚫 Заблокировать
          </button>

          <button
            type="button"
            data-to-action="admin-user-verify"
            data-user-id="${helpers.escape(id)}"
          >
            ✅ Верифицировать
          </button>
        </div>
      </article>
    `;
  }

  TO.renderParticipantCard =
    renderParticipantCard;

  /* ============================================================
     ADMIN PUBLICATION CARD
     ============================================================ */

  function renderAdminPublicationCard(
    publication
  ) {
    const p =
      helpers.normalizePublication(
        publication
      );

    if (!p) return "";

    const id =
      helpers.escape(p.id);

    return `
      <article
        class="to-admin-publication-card"
        data-publication-id="${id}"
      >
        <div>
          <strong>
            ${helpers.escape(p.title)}
          </strong>
        </div>

        <div>
          ${helpers.escape(
            helpers.first(
              p.author?.name,
              p.author?.username,
              "Автор"
            )
          )}
        </div>

        <div>
          ${helpers.escape(
            p.status
          )}
        </div>

        <div>
          👁 ${helpers.formatNumber(p.views)}
          · 👍 ${helpers.formatNumber(p.likes)}
          · 💬 ${helpers.formatNumber(p.comments_count)}
        </div>

        <div
          style="
            display:flex;
            flex-wrap:wrap;
            gap:6px;
            margin-top:10px;
          "
        >
          <button
            type="button"
            data-to-action="admin-approve"
            data-publication-id="${id}"
          >
            ✅ Одобрить
          </button>

          <button
            type="button"
            data-to-action="admin-request-payment"
            data-publication-id="${id}"
          >
            💰 Оплата
          </button>

          <button
            type="button"
            data-to-action="admin-publish"
            data-publication-id="${id}"
          >
            📢 Опубликовать
          </button>

          <button
            type="button"
            data-to-action="admin-reject"
            data-publication-id="${id}"
          >
            ❌ Отклонить
          </button>

          <button
            type="button"
            data-to-action="admin-hide"
            data-publication-id="${id}"
          >
            👁 Скрыть
          </button>

          <button
            type="button"
            data-to-action="admin-pin"
            data-publication-id="${id}"
          >
            📌 Закрепить
          </button>

          <button
            type="button"
            data-to-action="admin-feature"
            data-publication-id="${id}"
          >
            ⭐ Выделить
          </button>

          <button
            type="button"
            data-to-action="admin-delete"
            data-publication-id="${id}"
          >
            🗑 Удалить
          </button>
        </div>
      </article>
    `;
  }

  TO.renderAdminPublicationCard =
    renderAdminPublicationCard;

  /* ============================================================
     TEST USER SELECTION
     ============================================================ */

  async function selectTestUserById(
    userId
  ) {
    const user =
      await admin.user(
        userId
      );

    if (!user) {
      toast.error(
        "Участник не найден."
      );

      return false;
    }

    return testing.select(
      user
    );
  }

  TO.selectTestUserById =
    selectTestUserById;

  /* ============================================================
     TEST CENTER UI
     ============================================================ */

  function renderTestCenter(
    container,
    users = []
  ) {
    if (!container) return;

    const selected =
      actor.selected();

    container.innerHTML = `
      <section
        class="to-test-center"
        style="
          padding:16px;
          border:1px solid rgba(127,127,127,.25);
          border-radius:16px;
        "
      >
        <h2>🧪 Тестовый центр</h2>

        <p>
          Здесь администратор может безопасно
          тестировать реальные пользовательские
          сценарии через специальный тестовый режим.
        </p>

        <div>
          <strong>Выбранный участник:</strong>
          ${
            selected
              ? helpers.escape(
                  helpers.first(
                    selected.name,
                    selected.full_name,
                    selected.username,
                    "Участник"
                  )
                )
              : "не выбран"
          }
        </div>

        ${
          selected
            ? `
              <button
                type="button"
                data-to-action="disable-test-mode"
              >
                Выключить тестовый режим
              </button>
            `
            : ""
        }

        <div
          class="to-test-users"
          style="
            display:grid;
            gap:8px;
            margin-top:15px;
          "
        >
          ${users
            .map(
              user =>
                renderParticipantCard(
                  user
                )
            )
            .join("")}
        </div>
      </section>
    `;

    bindTestSelection(
      container
    );
  }

  function bindTestSelection(
    root
  ) {
    root
      .querySelectorAll(
        '[data-to-action="select-test-user"]'
      )
      .forEach(button => {
        if (
          button.dataset.toBound === "1"
        ) {
          return;
        }

        button.dataset.toBound = "1";

        button.addEventListener(
          "click",
          async () => {
            const id =
              button.dataset.userId;

            await selectTestUserById(
              id
            );
          }
        );
      });
  }

  TO.renderTestCenter =
    renderTestCenter;

  /* ============================================================
     API ALIASES
     ============================================================ */

  TO.getPublications =
    publications.list.bind(
      publications
    );

  TO.getPublication =
    publications.get.bind(
      publications
    );

  TO.createPublication =
    publications.create.bind(
      publications
    );

  TO.updatePublication =
    publications.edit.bind(
      publications
    );

  TO.deletePublication =
    publications.remove.bind(
      publications
    );

  TO.restorePublication =
    publications.restore.bind(
      publications
    );

  TO.react =
    reactions.toggle.bind(
      reactions
    );

  TO.comment =
    comments.create.bind(
      comments
    );

  TO.save =
    saves.toggle.bind(
      saves
    );

  TO.share =
    shares.native.bind(
      shares
    );

  TO.followUser =
    follow.toggle.bind(
      follow
    );

  TO.sendMessage =
    messages.send.bind(
      messages
    );

  TO.getNotifications =
    notifications.list.bind(
      notifications
    );

  TO.report =
    reports.create.bind(
      reports
    );

  /* ============================================================
     PUBLICATION STATUS HELPERS
     ============================================================ */

  TO.status = {
    isPending(status) {
      return status === "pending";
    },

    isWaitingPayment(status) {
      return status ===
        "waiting_payment";
    },

    isPaid(status) {
      return status === "paid";
    },

    isPublished(status) {
      return status === "published";
    },

    isRejected(status) {
      return status === "rejected";
    },

    isHidden(status) {
      return status === "hidden";
    },

    isDeleted(status) {
      return status === "deleted";
    }
  };

  /* ============================================================
     URL HELPERS
     ============================================================ */

  TO.urls = {
    publication(id) {
      return new URL(
        `/publication.html?id=${encodeURIComponent(
          id
        )}`,
        location.origin
      ).href;
    },

    profile(username) {
      return new URL(
        `/profile.html?user=${encodeURIComponent(
          username
        )}`,
        location.origin
      ).href;
    },

    messages(userId = "") {
      return new URL(
        `/messages.html${
          userId
            ? `?user=${encodeURIComponent(
                userId
              )}`
            : ""
        }`,
        location.origin
      ).href;
    },

    notifications() {
      return "/notifications.html";
    }
  };

  /* ============================================================
     LOGIN / LOGOUT GLOBAL BUTTONS
     ============================================================ */

  document.addEventListener(
    "click",
    async event => {
      const target =
        event.target.closest(
          "[data-to-action]"
        );

      if (!target) return;

      const action =
        target.dataset.toAction;

      if (
        action === "logout"
      ) {
        event.preventDefault();
        await auth.logout();
        updateAuthUI();
        return;
      }

      if (
        action === "admin-logout"
      ) {
        event.preventDefault();
        await admin.logout();
        location.reload();
        return;
      }

      if (
        action === "admin-refresh"
      ) {
        event.preventDefault();

        const data =
          await adminQuickRefresh();

        const container =
          document.querySelector(
            "[data-to-stats]"
          );

        if (container) {
          renderStats(
            container,
            data.dashboard
          );
        }

        return;
      }

      if (
        action === "select-test-user"
      ) {
        event.preventDefault();

        await selectTestUserById(
          target.dataset.userId
        );

        actor.renderIndicator();

        return;
      }
    }
  );

  /* ============================================================
     SEARCH FORM AUTO SUPPORT
     ============================================================ */

  document.addEventListener(
    "submit",
    async event => {
      const form =
        event.target.closest(
          "[data-to-search]"
        );

      if (!form) return;

      event.preventDefault();

      const input =
        form.querySelector(
          'input[name="q"], input[name="search"], input[type="search"]'
        );

      const query =
        input?.value?.trim() ||
        "";

      if (!query) return;

      const results =
        await search.all(
          query
        );

      const container =
        document.querySelector(
          "[data-to-search-results]"
        );

      if (!container) return;

      container.innerHTML = `
        <div>
          <h3>Публикации</h3>

          ${
            results.publications
              .map(
                p =>
                  ui.publicationCard(
                    p
                  )
              )
              .join("") ||
            "<p>Ничего не найдено.</p>"
          }
        </div>

        <div>
          <h3>Участники</h3>

          ${
            results.users
              .map(
                user =>
                  renderParticipantCard(
                    user
                  )
              )
              .join("") ||
            "<p>Участники не найдены.</p>"
          }
        </div>

        <div>
          <h3>Категории</h3>

          ${
            results.categories
              .map(
                category =>
                  `<div>
                    ${helpers.escape(
                      category.label
                    )}
                  </div>`
              )
              .join("") ||
            "<p>Категории не найдены.</p>"
          }
        </div>
      `;

      bindActions(
        container
      );

      views.observe(
        container
      );
    }
  );

  /* ============================================================
     COMMENT FORM AUTO SUPPORT
     ============================================================ */

  document.addEventListener(
    "submit",
    async event => {
      const form =
        event.target.closest(
          "[data-to-comment-form]"
        );

      if (!form) return;

      event.preventDefault();

      const input =
        form.querySelector(
          "textarea, input[name='text']"
        );

      const publicationId =
        form.dataset.publicationId ||
        form.dataset.postId;

      const parentId =
        form.dataset.parentId ||
        null;

      if (!publicationId) {
        toast.error(
          "Не указана публикация."
        );
        return;
      }

      const text =
        input?.value?.trim() ||
        "";

      if (!text) {
        toast.warning(
          "Введите комментарий."
        );
        return;
      }

      let result;

      if (
        actor.isTestMode()
      ) {
        result =
          await testing.comment(
            publicationId,
            text,
            parentId
          );
      } else {
        result =
          await comments.create(
            publicationId,
            text,
            parentId
          );
      }

      if (result?.ok) {
        input.value = "";
      }
    }
  );

  /* ============================================================
     MESSAGE FORM AUTO SUPPORT
     ============================================================ */

  document.addEventListener(
    "submit",
    async event => {
      const form =
        event.target.closest(
          "[data-to-message-form]"
        );

      if (!form) return;

      event.preventDefault();

      const input =
        form.querySelector(
          "textarea, input[name='text']"
        );

      const text =
        input?.value?.trim() ||
        "";

      const userId =
        form.dataset.userId ||
        null;

      if (!text) return;

      const result =
        actor.isTestMode()
          ? await testing.message(
              text,
              userId
            )
          : await messages.send(
              text,
              userId
            );

      if (result?.ok) {
        input.value = "";
      }
    }
  );

  /* ============================================================
     THEME CHANGE LISTENER
     ============================================================ */

  if (
    window.matchMedia
  ) {
    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    media.addEventListener?.(
      "change",
      () => {
        if (
          theme.get() === "system"
        ) {
          theme.apply();
        }
      }
    );
  }

  /* ============================================================
     GLOBAL ERROR PROTECTION
     ============================================================ */

  window.addEventListener(
    "unhandledrejection",
    event => {
      console.error(
        "[Tajik Opportunities]",
        event.reason
      );
    }
  );

  /* ============================================================
     INIT
     ============================================================ */

  async function init() {
    try {
      theme.apply();
      translation.apply();

      await auth.me();

      updateAuthUI();

      bindActions(
        document
      );

      autoViews();

      observeDOM();

      actor.renderIndicator();

      /*
       * Обновляем авторизацию немного позже.
       * Это позволяет существующим app.js/index.js
       * успеть загрузить свои данные.
       */
      setTimeout(
        async () => {
          try {
            await auth.me();
            updateAuthUI();
            bindActions(
              document
            );
            actor.renderIndicator();
          } catch {}
        },
        1500
      );

      /*
       * Периодическое обновление уведомлений.
       */
      if (
        !window.__TO_NOTIFICATION_TIMER
      ) {
        window.__TO_NOTIFICATION_TIMER =
          setInterval(
            async () => {
              try {
                const list =
                  await notifications.list();

                const unread =
                  list.filter(
                    item =>
                      !helpers.bool(
                        item.read ??
                        item.is_read
                      )
                  ).length;

                document
                  .querySelectorAll(
                    "[data-to-unread-notifications]"
                  )
                  .forEach(el => {
                    el.textContent =
                      helpers.formatNumber(
                        unread
                      );
                  });
              } catch {}
            },
            30000
          );
      }

      /*
       * Тестовый режим.
       */
      if (
        actor.isTestMode() &&
        actor.selected()
      ) {
        actor.renderIndicator();
      }

      /*
       * Отдельно обновляем stats только
       * если на странице есть соответствующий
       * контейнер.
       */
      const statsContainer =
        document.querySelector(
          "[data-to-stats]"
        );

      if (statsContainer) {
        const server =
          await admin.stats();

        renderStats(
          statsContainer,
          server
        );
      }

      /*
       * Автоматически подставляем категории
       * в элементы select.
       */
      document
        .querySelectorAll(
          "select[data-to-categories]"
        )
        .forEach(select => {
          if (
            select.dataset.toCategoriesReady ===
            "1"
          ) {
            return;
          }

          select.dataset.toCategoriesReady =
            "1";

          const current =
            select.value;

          select.innerHTML =
            `<option value="">Выберите категорию</option>` +
            CATEGORIES
              .map(
                ([id, label]) =>
                  `<option value="${helpers.escape(
                    id
                  )}">
                    ${helpers.escape(
                      label
                    )}
                  </option>`
              )
              .join("");

          select.value =
            current;
        });

      console.info(
        `[${SITE_NAME}] works.js initialized`
      );
    } catch (error) {
      console.error(
        `[${SITE_NAME}] init error`,
        error
      );
    }
  }

  TO.init = init;

  /* ============================================================
     READY
     ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
