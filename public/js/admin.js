"use strict";

/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   SUPER ADMIN CONTROL CENTER
   ------------------------------------------------------------
   НЕ ДЕМО.
   НЕ УПРОЩЁННАЯ ПАНЕЛЬ.

   Архитектура:
   ------------------------------------------------------------
   SUPER ADMIN
        │
        ├── Dashboard
        ├── Super Search
        ├── Participants
        ├── Profiles
        ├── Publications
        ├── Comments
        ├── Reviews
        ├── Reactions
        ├── Shares
        ├── Bookmarks
        ├── Reports
        ├── Chats
        ├── Messages
        ├── Notifications
        ├── Payments
        ├── Premium
        ├── PRO
        ├── TOP
        ├── VIP
        ├── Levels
        ├── Achievements
        ├── Permissions
        ├── Blocks
        ├── Activity
        ├── Moderation
        ├── Analytics
        ├── Metrics
        ├── Categories
        ├── Tags
        ├── Backgrounds
        ├── Fonts
        ├── Media
        ├── Search
        ├── Feature Flags
        ├── System Settings
        ├── Security
        ├── Admins
        ├── Roles
        ├── Audit Logs
        ├── Backup / Restore
        ├── Maintenance
        └── ACT AS PARTICIPANT

   ВАЖНО:
   ------------------------------------------------------------
   Frontend не является источником прав.
   Все опасные действия должны повторно проверяться Worker
   на сервере.

   SUPER ADMIN может действовать от имени участника без
   искусственного функционального ограничения, но сервер
   сохраняет:
   • реального администратора;
   • выбранный профиль;
   • действие;
   • объект;
   • дату/время;
   • старое/новое значение;
   • request ID / session ID;
   • причину, если требуется.

   Это позволяет иметь полный контроль без потери аудита.
   ============================================================ */

(function (window, document) {
  "use strict";

  /* ============================================================
     CONFIG
     ============================================================ */

  const CONFIG = {
    appName: "Tajik Opportunities",

    api: {
      dashboard: "/api/admin/dashboard",

      search: "/api/admin/search",

      participants: "/api/admin/participants",
      participant: "/api/admin/participants",

      profiles: "/api/admin/profiles",
      profile: "/api/admin/profiles",

      publications: "/api/admin/publications",
      publication: "/api/admin/publications",

      comments: "/api/admin/comments",
      comment: "/api/admin/comments",

      reviews: "/api/admin/reviews",
      review: "/api/admin/reviews",

      reactions: "/api/admin/reactions",
      reaction: "/api/admin/reactions",

      shares: "/api/admin/shares",
      bookmarks: "/api/admin/bookmarks",
      views: "/api/admin/views",

      reports: "/api/admin/reports",
      report: "/api/admin/reports",

      conversations: "/api/admin/conversations",
      conversation: "/api/admin/conversations",

      messages: "/api/admin/messages",
      message: "/api/admin/messages",

      notifications: "/api/admin/notifications",
      notification: "/api/admin/notifications",

      payments: "/api/admin/payments",
      payment: "/api/admin/payments",

      services: "/api/admin/services",

      levels: "/api/admin/levels",
      levelSettings: "/api/admin/levels/settings",

      achievements: "/api/admin/achievements",

      permissions: "/api/admin/permissions",
      participantPermissions:
        "/api/admin/permissions/participant",

      blocks: "/api/admin/blocks",

      activity: "/api/admin/activity",

      moderation: "/api/admin/moderation",

      analytics: "/api/admin/analytics",

      metrics: "/api/admin/metrics",

      categories: "/api/admin/categories",

      tags: "/api/admin/tags",

      media: "/api/admin/media",

      backgrounds: "/api/admin/backgrounds",

      fonts: "/api/admin/fonts",

      featureFlags: "/api/admin/feature-flags",

      settings: "/api/admin/settings",

      security: "/api/admin/security",

      admins: "/api/admin/admins",

      roles: "/api/admin/roles",

      audit: "/api/admin/audit",

      backup: "/api/admin/backup",

      maintenance: "/api/admin/maintenance",

      acting: "/api/admin/acting",

      system: "/api/admin/system"
    },

    storage: {
      lastSection:
        "to_admin_last_section",
      acting:
        "to_admin_acting_mode",
      filters:
        "to_admin_filters"
    },

    pagination: {
      defaultLimit: 25,
      maxLimit: 100
    },

    search: {
      debounce: 300,
      minLength: 1
    },

    dangerousActions: [
      "delete",
      "hard_delete",
      "restore",
      "block",
      "unblock",
      "revoke",
      "grant",
      "set_permission",
      "reset_level",
      "change_username",
      "change_role",
      "delete_admin",
      "backup_restore",
      "maintenance",
      "clear_data",
      "impersonate"
    ]
  };

  /* ============================================================
     ADMIN SECTIONS
     ============================================================ */

  const SECTIONS = [
    {
      id: "dashboard",
      icon: "📊",
      title: "Dashboard",
      permission: "admin.dashboard"
    },

    {
      id: "search",
      icon: "🔎",
      title: "Super Search",
      permission: "admin.search"
    },

    {
      id: "participants",
      icon: "👤",
      title: "Участники",
      permission: "participants.manage"
    },

    {
      id: "profiles",
      icon: "🪪",
      title: "Профили",
      permission: "profiles.manage"
    },

    {
      id: "publications",
      icon: "📰",
      title: "Публикации",
      permission: "publications.manage"
    },

    {
      id: "comments",
      icon: "💬",
      title: "Комментарии",
      permission: "comments.manage"
    },

    {
      id: "reviews",
      icon: "⭐",
      title: "Отзывы",
      permission: "reviews.manage"
    },

    {
      id: "reactions",
      icon: "❤️",
      title: "Реакции",
      permission: "reactions.manage"
    },

    {
      id: "shares",
      icon: "📤",
      title: "Поделиться",
      permission: "shares.manage"
    },

    {
      id: "reports",
      icon: "🚩",
      title: "Жалобы",
      permission: "reports.manage"
    },

    {
      id: "chats",
      icon: "💬",
      title: "Чаты",
      permission: "chat.manage"
    },

    {
      id: "messages",
      icon: "✉️",
      title: "Сообщения",
      permission: "messages.manage"
    },

    {
      id: "notifications",
      icon: "🔔",
      title: "Уведомления",
      permission: "notifications.manage"
    },

    {
      id: "payments",
      icon: "💰",
      title: "Платежи",
      permission: "payments.manage"
    },

    {
      id: "services",
      icon: "👑",
      title: "Premium / PRO / TOP / VIP",
      permission: "services.manage"
    },

    {
      id: "levels",
      icon: "🏆",
      title: "TO Levels",
      permission: "levels.manage"
    },

    {
      id: "achievements",
      icon: "🎖️",
      title: "Достижения",
      permission: "achievements.manage"
    },

    {
      id: "permissions",
      icon: "🔐",
      title: "Права",
      permission: "permissions.manage"
    },

    {
      id: "blocks",
      icon: "⛔",
      title: "Блокировки",
      permission: "blocks.manage"
    },

    {
      id: "activity",
      icon: "🛰️",
      title: "Активность",
      permission: "activity.view"
    },

    {
      id: "moderation",
      icon: "🛡️",
      title: "Модерация",
      permission: "moderation.manage"
    },

    {
      id: "analytics",
      icon: "📈",
      title: "Аналитика",
      permission: "analytics.view"
    },

    {
      id: "metrics",
      icon: "🔢",
      title: "Метрики",
      permission: "metrics.manage"
    },

    {
      id: "categories",
      icon: "🗂️",
      title: "Категории",
      permission: "categories.manage"
    },

    {
      id: "tags",
      icon: "🏷️",
      title: "Теги и статусы",
      permission: "tags.manage"
    },

    {
      id: "media",
      icon: "🖼️",
      title: "Медиа",
      permission: "media.manage"
    },

    {
      id: "backgrounds",
      icon: "🎨",
      title: "Фоны",
      permission: "backgrounds.manage"
    },

    {
      id: "fonts",
      icon: "🔤",
      title: "Шрифты",
      permission: "fonts.manage"
    },

    {
      id: "feature-flags",
      icon: "🧪",
      title: "Feature Flags",
      permission: "features.manage"
    },

    {
      id: "settings",
      icon: "⚙️",
      title: "Настройки системы",
      permission: "settings.manage"
    },

    {
      id: "security",
      icon: "🔒",
      title: "Безопасность",
      permission: "security.manage"
    },

    {
      id: "admins",
      icon: "👑",
      title: "Администраторы",
      permission: "admins.manage"
    },

    {
      id: "roles",
      icon: "🎭",
      title: "Роли",
      permission: "roles.manage"
    },

    {
      id: "audit",
      icon: "📜",
      title: "Audit Log",
      permission: "audit.view"
    },

    {
      id: "backup",
      icon: "💾",
      title: "Backup / Restore",
      permission: "system.backup"
    },

    {
      id: "maintenance",
      icon: "🚧",
      title: "Maintenance",
      permission: "system.maintenance"
    },

    {
      id: "system",
      icon: "🖥️",
      title: "Система",
      permission: "system.manage"
    }
  ];

  /* ============================================================
     SERVICE TYPES
     ============================================================ */

  const SERVICES = [
    {
      id: "free",
      title: "FREE",
      icon: "🆓"
    },

    {
      id: "top",
      title: "TOP",
      icon: "🔥"
    },

    {
      id: "premium",
      title: "PREMIUM",
      icon: "⭐"
    },

    {
      id: "pro",
      title: "PRO",
      icon: "💎"
    },

    {
      id: "vip",
      title: "VIP",
      icon: "👑"
    },

    {
      id: "custom",
      title: "CUSTOM",
      icon: "⚙️"
    }
  ];

  /* ============================================================
     STATE
     ============================================================ */

  const state = {
    initialized: false,

    authenticated: false,

    isSuperAdmin: false,

    admin: null,

    permissions: {},

    role: null,

    section:
      "dashboard",

    previousSection:
      null,

    loading: false,

    data: {},

    counts: {},

    unread: {},

    filters: {},

    search: {
      query: "",
      results: [],
      loading: false,
      type: "all"
    },

    selected: {
      participantId: null,
      publicationId: null,
      commentId: null,
      reviewId: null,
      reportId: null,
      conversationId: null,
      messageId: null
    },

    acting: {
      active: false,
      participantId: null,
      participant: null,
      realAdminId: null,
      startedAt: null
    },

    modal: null,

    requestCounter: 0,

    pendingRequests: new Map(),

    listeners: new Set()
  };

  /* ============================================================
     EVENT BUS
     ============================================================ */

  function emit(event, detail) {
    const payload = {
      event,
      detail: detail || {},
      state
    };

    state.listeners.forEach(
      function (listener) {
        try {
          listener(payload);
        } catch (error) {
          console.error(
            "[TO Admin] listener error:",
            error
          );
        }
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "to:admin:" + event,
        {
          detail: payload
        }
      )
    );
  }

  function on(event, listener) {
    if (
      typeof listener !==
      "function"
    ) {
      return function () {};
    }

    const wrapped =
      function (payload) {
        if (
          !payload ||
          payload.event === event
        ) {
          listener(payload);
        }
      };

    state.listeners.add(
      wrapped
    );

    return function () {
      state.listeners.delete(
        wrapped
      );
    };
  }

  /* ============================================================
     HELPERS
     ============================================================ */

  function clone(value) {
    try {
      return JSON.parse(
        JSON.stringify(value)
      );
    } catch {
      return value;
    }
  }

  function escapeHtml(value) {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  function safeJson(value) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return "{}";
    }
  }

  function getSection(
    sectionId
  ) {
    return (
      SECTIONS.find(
        function (item) {
          return (
            item.id ===
            sectionId
          );
        }
      ) || null
    );
  }

  function can(
    permission
  ) {
    if (
      state.isSuperAdmin
    ) {
      return true;
    }

    if (
      !permission
    ) {
      return true;
    }

    return Boolean(
      state.permissions?.[
        permission
      ]
    );
  }

  function isDangerous(
    action
  ) {
    return CONFIG.dangerousActions.includes(
      action
    );
  }

  function now() {
    return new Date().toISOString();
  }

  function generateRequestId() {
    state.requestCounter += 1;

    return (
      "admin-" +
      Date.now().toString(36) +
      "-" +
      state.requestCounter.toString(36)
    );
  }

  function saveLocalState() {
    try {
      localStorage.setItem(
        CONFIG.storage.lastSection,
        state.section
      );

      localStorage.setItem(
        CONFIG.storage.acting,
        JSON.stringify(
          state.acting
        )
      );

      localStorage.setItem(
        CONFIG.storage.filters,
        JSON.stringify(
          state.filters
        )
      );
    } catch {
      /* ignore */
    }
  }

  function restoreLocalState() {
    try {
      const section =
        localStorage.getItem(
          CONFIG.storage.lastSection
        );

      if (
        section &&
        getSection(section)
      ) {
        state.section =
          section;
      }

      const actingRaw =
        localStorage.getItem(
          CONFIG.storage.acting
        );

      if (
        actingRaw
      ) {
        const acting =
          JSON.parse(
            actingRaw
          );

        if (
          acting?.active &&
          acting?.participantId
        ) {
          state.acting =
            acting;
        }
      }

      const filtersRaw =
        localStorage.getItem(
          CONFIG.storage.filters
        );

      if (
        filtersRaw
      ) {
        state.filters =
          JSON.parse(
            filtersRaw
          );
      }
    } catch {
      /* ignore */
    }
  }

  /* ============================================================
     API REQUEST
     ============================================================ */

  async function request(
    url,
    options
  ) {
    const requestId =
      generateRequestId();

    const opts =
      Object.assign(
        {
          credentials:
            "include",

          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            "X-Request-ID":
              requestId
          }
        },
        options || {}
      );

    if (
      opts.headers &&
      !opts.headers[
        "X-Request-ID"
      ]
    ) {
      opts.headers[
        "X-Request-ID"
      ] =
        requestId;
    }

    const controller =
      new AbortController();

    if (
      opts.signal
    ) {
      delete opts.signal;
    }

    opts.signal =
      controller.signal;

    const timeout =
      window.setTimeout(
        function () {
          controller.abort();
        },
        60000
      );

    state.pendingRequests.set(
      requestId,
      {
        controller,
        url,
        startedAt:
          Date.now()
      }
    );

    emit(
      "request-start",
      {
        requestId,
        url
      }
    );

    try {
      const response =
        await fetch(
          url,
          opts
        );

      let data = null;

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          data =
            await response.json();
        } catch {
          data = null;
        }
      } else {
        try {
          const text =
            await response.text();

          data =
            text
              ? { text }
              : null;
        } catch {
          data = null;
        }
      }

      if (
        !response.ok
      ) {
        const error =
          new Error(
            data?.message ||
            data?.error ||
            (
              "Ошибка административного API: " +
              response.status
            )
          );

        error.status =
          response.status;

        error.data =
          data;

        error.requestId =
          requestId;

        throw error;
      }

      emit(
        "request-success",
        {
          requestId,
          url,
          data
        }
      );

      return data;
    } catch (error) {
      emit(
        "request-error",
        {
          requestId,
          url,
          error
        }
      );

      throw error;
    } finally {
      window.clearTimeout(
        timeout
      );

      state.pendingRequests.delete(
        requestId
      );
    }
  }

  /* ============================================================
     QUERY BUILDER
     ============================================================ */

  function buildQuery(
    params
  ) {
    const query =
      new URLSearchParams();

    Object.entries(
      params || {}
    ).forEach(
      function ([
        key,
        value
      ]) {
        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return;
        }

        if (
          Array.isArray(
            value
          )
        ) {
          value.forEach(
            function (item) {
              query.append(
                key,
                String(item)
              );
            }
          );

          return;
        }

        if (
          typeof value ===
          "object"
        ) {
          query.set(
            key,
            JSON.stringify(
              value
            )
          );

          return;
        }

        query.set(
          key,
          String(value)
        );
      }
    );

    return query.toString();
  }

  function withQuery(
    url,
    params
  ) {
    const query =
      buildQuery(params);

    return query
      ? url +
          (
            url.includes("?")
              ? "&"
              : "?"
          ) +
          query
      : url;
  }

  /* ============================================================
     GENERIC CRUD
     ============================================================ */

  async function list(
    endpoint,
    params
  ) {
    return request(
      withQuery(
        endpoint,
        params
      ),
      {
        method: "GET"
      }
    );
  }

  async function get(
    endpoint,
    id,
    params
  ) {
    return request(
      withQuery(
        endpoint +
          "/" +
          encodeURIComponent(
            id
          ),
        params
      ),
      {
        method: "GET"
      }
    );
  }

  async function create(
    endpoint,
    payload
  ) {
    return request(
      endpoint,
      {
        method: "POST",
        body:
          JSON.stringify(
            payload || {}
          )
      }
    );
  }

  async function update(
    endpoint,
    id,
    payload
  ) {
    return request(
      endpoint +
        "/" +
        encodeURIComponent(
          id
        ),
      {
        method: "PUT",
        body:
          JSON.stringify(
            payload || {}
          )
      }
    );
  }

  async function remove(
    endpoint,
    id,
    payload
  ) {
    return request(
      endpoint +
        "/" +
        encodeURIComponent(
          id
        ),
      {
        method: "DELETE",
        body:
          JSON.stringify(
            payload || {}
          )
      }
    );
  }

  async function action(
    endpoint,
    payload
  ) {
    return request(
      endpoint,
      {
        method: "POST",
        body:
          JSON.stringify(
            payload || {}
          )
      }
    );
  }

  /* ============================================================
     CONFIRMATION
     ============================================================ */

  function confirmAction(
    title,
    message,
    options
  ) {
    const opts =
      options || {};

    return new Promise(
      function (resolve) {
        const modal =
          document.createElement(
            "div"
          );

        modal.className =
          "to-admin-confirm-overlay";

        modal.innerHTML = `
          <div class="to-admin-confirm-modal">

            <div class="to-admin-confirm-icon">
              ${
                opts.danger
                  ? "⚠️"
                  : "❓"
              }
            </div>

            <h3>
              ${escapeHtml(
                title ||
                "Подтверждение"
              )}
            </h3>

            <p>
              ${escapeHtml(
                message ||
                "Вы действительно хотите выполнить это действие?"
              )}
            </p>

            ${
              opts.requireText
                ? `
                  <input
                    type="text"
                    data-confirm-text
                    placeholder="${escapeHtml(
                      opts.requireText
                    )}"
                    autocomplete="off"
                  >
                `
                : ""
            }

            <div class="to-admin-confirm-actions">

              <button
                type="button"
                data-confirm-cancel
              >
                Отмена
              </button>

              <button
                type="button"
                data-confirm-ok
                class="${
                  opts.danger
                    ? "danger"
                    : "primary"
                }"
              >
                ${
                  opts.confirmText ||
                  "Подтвердить"
                }
              </button>

            </div>

          </div>
        `;

        document.body.appendChild(
          modal
        );

        const close =
          function (result) {
            modal.remove();
            resolve(result);
          };

        modal
          .querySelector(
            "[data-confirm-cancel]"
          )
          .addEventListener(
            "click",
            function () {
              close(false);
            }
          );

        modal
          .querySelector(
            "[data-confirm-ok]"
          )
          .addEventListener(
            "click",
            function () {
              if (
                opts.requireText
              ) {
                const input =
                  modal.querySelector(
                    "[data-confirm-text]"
                  );

                if (
                  input.value !==
                  opts.requireText
                ) {
                  input.focus();
                  return;
                }
              }

              close(true);
            }
          );

        modal.addEventListener(
          "click",
          function (event) {
            if (
              event.target ===
              modal
            ) {
              close(false);
            }
          }
        );
      }
    );
  }

  async function executeDangerous(
    actionName,
    title,
    message,
    callback,
    options
  ) {
    const opts =
      options || {};

    const confirmed =
      await confirmAction(
        title,
        message,
        {
          danger:
            opts.danger !== false,

          confirmText:
            opts.confirmText ||
            "Да, выполнить",

          requireText:
            opts.requireText
        }
      );

    if (
      !confirmed
    ) {
      return {
        cancelled:
          true
      };
    }

    emit(
      "dangerous-action-confirmed",
      {
        action:
          actionName
      }
    );

    return callback();
  }

  /* ============================================================
     AUTH / ADMIN PROFILE
     ============================================================ */

  async function loadAdminSession() {
    try {
      const data =
        await request(
          CONFIG.api.system +
            "/session",
          {
            method: "GET"
          }
        );

      state.authenticated =
        Boolean(
          data?.authenticated
        );

      state.admin =
        data?.admin ||
        null;

      state.role =
        data?.role ||
        null;

      state.permissions =
        data?.permissions ||
        {};

      state.isSuperAdmin =
        Boolean(
          data?.is_superadmin ||
          data?.isSuperAdmin ||
          data?.admin?.is_superadmin ||
          data?.admin?.role ===
            "superadmin"
        );

      emit(
        "session-loaded",
        data
      );

      return data;
    } catch (error) {
      state.authenticated =
        false;

      emit(
        "session-error",
        {
          error
        }
      );

      throw error;
    }
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */

  async function loadDashboard() {
    const data =
      await list(
        CONFIG.api.dashboard,
        {
          range:
            state.filters.dashboardRange ||
            "30d"
        }
      );

    state.data.dashboard =
      data;

    state.counts =
      data?.counts ||
      state.counts;

    state.unread =
      data?.unread ||
      state.unread;

    emit(
      "dashboard-loaded",
      data
    );

    return data;
  }

  /* ============================================================
     SUPER SEARCH
     ============================================================ */

  async function superSearch(
    query,
    options
  ) {
    const opts =
      options || {};

    const text =
      String(
        query ??
        state.search.query ??
        ""
      ).trim();

    state.search.query =
      text;

    if (
      text.length <
      CONFIG.search.minLength
    ) {
      state.search.results =
        [];

      return {
        items: []
      };
    }

    state.search.loading =
      true;

    emit(
      "search-loading",
      {
        query:
          text
      }
    );

    try {
      const data =
        await list(
          CONFIG.api.search,
          {
            q:
              text,

            type:
              opts.type ||
              state.search.type ||
              "all",

            page:
              opts.page ||
              1,

            limit:
              Math.min(
                opts.limit ||
                  CONFIG.pagination.defaultLimit,
                CONFIG.pagination.maxLimit
              ),

            include:
              [
                "participants",
                "profiles",
                "publications",
                "comments",
                "reviews",
                "chats",
                "messages",
                "reports",
                "payments",
                "activity"
              ]
          }
        );

      state.search.results =
        data?.items ||
        data?.results ||
        [];

      emit(
        "search-loaded",
        data
      );

      return data;
    } finally {
      state.search.loading =
        false;
    }
  }

  /* ============================================================
     PARTICIPANTS
     ============================================================ */

  async function listParticipants(
    params
  ) {
    const data =
      await list(
        CONFIG.api.participants,
        params
      );

    state.data.participants =
      data;

    emit(
      "participants-loaded",
      data
    );

    return data;
  }

  async function getParticipant(
    participantId
  ) {
    state.selected.participantId =
      participantId;

    const data =
      await get(
        CONFIG.api.participant,
        participantId
      );

    state.data.participant =
      data;

    emit(
      "participant-loaded",
      data
    );

    return data;
  }

  async function updateParticipant(
    participantId,
    changes
  ) {
    return executeDangerous(
      "update_participant",
      "Изменение участника",
      "Вы действительно хотите изменить данные этого участника?",
      async function () {
        const data =
          await update(
            CONFIG.api.participant,
            participantId,
            {
              changes,
              acting:
                getActingContext(),
              audit:
                createAuditContext(
                  "participant.update"
                )
            }
          );

        emit(
          "participant-updated",
          {
            participantId,
            changes,
            data
          }
        );

        return data;
      }
    );
  }

  /* ============================================================
     PROFILE CONTROL
     ============================================================ */

  async function updateProfile(
    participantId,
    changes
  ) {
    return executeDangerous(
      "update_profile",
      "Изменение профиля",
      "Вы действительно хотите изменить профиль участника?",
      async function () {
        return update(
          CONFIG.api.profiles,
          participantId,
          {
            changes,
            acting:
              getActingContext(),
            audit:
              createAuditContext(
                "profile.update"
              )
          }
        );
      }
    );
  }

  async function updateUsername(
    participantId,
    username
  ) {
    return executeDangerous(
      "change_username",
      "Изменение username",
      "Username может влиять на ссылки и идентификацию участника. Продолжить?",
      async function () {
        return action(
          CONFIG.api.profiles +
            "/username",
          {
            participant_id:
              participantId,

            username,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "profile.username_change"
              )
          }
        );
      }
    );
  }

  async function updateAvatar(
    participantId,
    avatar
  ) {
    return action(
      CONFIG.api.profiles +
        "/avatar",
      {
        participant_id:
          participantId,

        avatar,

        acting:
          getActingContext(),

        audit:
          createAuditContext(
            "profile.avatar_change"
          )
      }
    );
  }

  /* ============================================================
     PUBLICATIONS
     ============================================================ */

  async function listPublications(
    params
  ) {
    return list(
      CONFIG.api.publications,
      params
    );
  }

  async function getPublication(
    id
  ) {
    state.selected.publicationId =
      id;

    return get(
      CONFIG.api.publication,
      id
    );
  }

  async function updatePublication(
    id,
    changes
  ) {
    return executeDangerous(
      "update_publication",
      "Изменение публикации",
      "Вы действительно хотите изменить эту публикацию?",
      async function () {
        return update(
          CONFIG.api.publication,
          id,
          {
            changes,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "publication.update"
              )
          }
        );
      }
    );
  }

  async function moderatePublication(
    id,
    moderationAction,
    options
  ) {
    const opts =
      options || {};

    return executeDangerous(
      "publication_moderation",
      "Модерация публикации",
      "Подтвердить действие модерации?",
      async function () {
        return action(
          CONFIG.api.publications +
            "/moderate",
          {
            publication_id:
              id,

            action:
              moderationAction,

            reason:
              opts.reason ||
              null,

            publish:
              opts.publish === true,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "publication.moderation"
              )
          }
        );
      }
    );
  }

  async function setPublicationMetrics(
    id,
    metrics
  ) {
    return executeDangerous(
      "set_metrics",
      "Изменение метрик публикации",
      "Вы действительно хотите вручную изменить счетчики публикации?",
      async function () {
        return action(
          CONFIG.api.metrics +
            "/publication",
          {
            publication_id:
              id,

            metrics,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "publication.metrics.update"
              )
          }
        );
      }
    );
  }

  async function setPublicationType(
    id,
    type,
    options
  ) {
    return updatePublication(
      id,
      {
        publication_type:
          type,

        vip:
          type === "vip",

        premium:
          type === "premium",

        options:
          options || {}
      }
    );
  }

  async function setPublicationExpiration(
    id,
    expiration
  ) {
    return updatePublication(
      id,
      {
        expiration
      }
    );
  }

  async function setPublicationPosition(
    id,
    position
  ) {
    return updatePublication(
      id,
      {
        position
      }
    );
  }

  /* ============================================================
     COMMENTS
     ============================================================ */

  async function listComments(
    params
  ) {
    return list(
      CONFIG.api.comments,
      params
    );
  }

  async function updateComment(
    id,
    changes
  ) {
    return executeDangerous(
      "update_comment",
      "Изменение комментария",
      "Вы действительно хотите изменить комментарий?",
      async function () {
        return update(
          CONFIG.api.comment,
          id,
          {
            changes,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "comment.update"
              )
          }
        );
      }
    );
  }

  async function deleteComment(
    id,
    options
  ) {
    const opts =
      options || {};

    return executeDangerous(
      "delete",
      "Удаление комментария",
      "Вы действительно хотите удалить комментарий?",
      async function () {
        return remove(
          CONFIG.api.comment,
          id,
          {
            permanent:
              Boolean(
                opts.permanent
              ),

            reason:
              opts.reason ||
              null,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "comment.delete"
              )
          }
        );
      },
      {
        requireText:
          opts.permanent
            ? "DELETE"
            : undefined
      }
    );
  }

  /* ============================================================
     REVIEWS
     ============================================================ */

  async function listReviews(
    params
  ) {
    return list(
      CONFIG.api.reviews,
      params
    );
  }

  async function updateReview(
    id,
    changes
  ) {
    return update(
      CONFIG.api.review,
      id,
      {
        changes,

        acting:
          getActingContext(),

        audit:
          createAuditContext(
            "review.update"
          )
      }
    );
  }

  async function moderateReview(
    id,
    moderationAction,
    reason
  ) {
    return executeDangerous(
      "review_moderation",
      "Модерация отзыва",
      "Подтвердить действие с отзывом?",
      async function () {
        return action(
          CONFIG.api.reviews +
            "/moderate",
          {
            review_id:
              id,

            action:
              moderationAction,

            reason:
              reason ||
              null,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "review.moderation"
              )
          }
        );
      }
    );
  }

  async function setReviewMetrics(
    id,
    metrics
  ) {
    return executeDangerous(
      "set_review_metrics",
      "Изменение статистики отзыва",
      "Вы действительно хотите изменить счетчики/оценки?",
      async function () {
        return action(
          CONFIG.api.metrics +
            "/review",
          {
            review_id:
              id,

            metrics,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "review.metrics.update"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     REACTIONS
     ============================================================ */

  async function listReactions(
    params
  ) {
    return list(
      CONFIG.api.reactions,
      params
    );
  }

  async function createReactionAsParticipant(
    participantId,
    targetType,
    targetId,
    reactionType
  ) {
    return executeDangerous(
      "reaction_as_participant",
      "Реакция от имени участника",
      "Добавить реакцию от имени выбранного участника?",
      async function () {
        return action(
          CONFIG.api.reactions +
            "/act-as",
          {
            participant_id:
              participantId,

            target_type:
              targetType,

            target_id:
              targetId,

            reaction_type:
              reactionType,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "reaction.create_as_participant"
              )
          }
        );
      }
    );
  }

  async function deleteReaction(
    id
  ) {
    return executeDangerous(
      "delete",
      "Удаление реакции",
      "Удалить реакцию?",
      async function () {
        return remove(
          CONFIG.api.reaction,
          id,
          {
            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "reaction.delete"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     SHARES / BOOKMARKS / VIEWS
     ============================================================ */

  async function listShares(
    params
  ) {
    return list(
      CONFIG.api.shares,
      params
    );
  }

  async function listBookmarks(
    params
  ) {
    return list(
      CONFIG.api.bookmarks,
      params
    );
  }

  async function listViews(
    params
  ) {
    return list(
      CONFIG.api.views,
      params
    );
  }

  async function setShareMetrics(
    publicationId,
    metrics
  ) {
    return setPublicationMetrics(
      publicationId,
      {
        shares_count:
          metrics.shares_count
      }
    );
  }

  /* ============================================================
     REPORTS
     ============================================================ */

  async function listReports(
    params
  ) {
    return list(
      CONFIG.api.reports,
      params
    );
  }

  async function updateReport(
    id,
    changes
  ) {
    return update(
      CONFIG.api.report,
      id,
      {
        changes,

        audit:
          createAuditContext(
            "report.update"
          )
      }
    );
  }

  async function resolveReport(
    id,
    resolution
  ) {
    return executeDangerous(
      "resolve_report",
      "Обработка жалобы",
      "Подтвердить обработку жалобы?",
      async function () {
        return action(
          CONFIG.api.reports +
            "/resolve",
          {
            report_id:
              id,

            resolution,

            audit:
              createAuditContext(
                "report.resolve"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     CHAT
     ============================================================ */

  async function listConversations(
    params
  ) {
    return list(
      CONFIG.api.conversations,
      params
    );
  }

  async function getConversation(
    id
  ) {
    state.selected.conversationId =
      id;

    return get(
      CONFIG.api.conversation,
      id
    );
  }

  async function listMessages(
    conversationId,
    params
  ) {
    return list(
      CONFIG.api.messages,
      Object.assign(
        {},
        params || {},
        {
          conversation_id:
            conversationId
        }
      )
    );
  }

  async function sendMessageAsParticipant(
    participantId,
    conversationId,
    message
  ) {
    return executeDangerous(
      "send_message_as_participant",
      "Отправка сообщения от имени участника",
      "Отправить сообщение от имени выбранного профиля?",
      async function () {
        return action(
          CONFIG.api.messages +
            "/act-as",
          {
            participant_id:
              participantId,

            conversation_id:
              conversationId,

            message,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "message.create_as_participant"
              )
          }
        );
      }
    );
  }

  async function editMessage(
    messageId,
    text
  ) {
    return update(
      CONFIG.api.message,
      messageId,
      {
        text,

        acting:
          getActingContext(),

        audit:
          createAuditContext(
            "message.update"
          )
      }
    );
  }

  async function deleteMessage(
    messageId,
    permanent
  ) {
    return executeDangerous(
      "delete",
      "Удаление сообщения",
      permanent
        ? "Удалить сообщение окончательно?"
        : "Удалить сообщение?",
      async function () {
        return remove(
          CONFIG.api.message,
          messageId,
          {
            permanent:
              Boolean(
                permanent
              ),

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "message.delete"
              )
          }
        );
      },
      {
        requireText:
          permanent
            ? "DELETE"
            : undefined
      }
    );
  }

  /* ============================================================
     NOTIFICATIONS
     ============================================================ */

  async function listNotifications(
    params
  ) {
    return list(
      CONFIG.api.notifications,
      params
    );
  }

  async function createNotification(
    payload
  ) {
    return create(
      CONFIG.api.notifications,
      Object.assign(
        {},
        payload,
        {
          audit:
            createAuditContext(
              "notification.create"
            )
        }
      )
    );
  }

  async function sendSystemNotification(
    payload
  ) {
    return executeDangerous(
      "system_notification",
      "Системное уведомление",
      "Отправить официальное уведомление участникам?",
      async function () {
        return action(
          CONFIG.api.notifications +
            "/system-send",
          {
            payload,

            audit:
              createAuditContext(
                "notification.system_send"
              )
          }
        );
      }
    );
  }

  async function setParticipantNotificationSettings(
    participantId,
    settings
  ) {
    return update(
      CONFIG.api.notifications,
      participantId,
      {
        settings,

        audit:
          createAuditContext(
            "notification.settings.update"
          )
      }
    );
  }

  /* ============================================================
     PAYMENTS
     ============================================================ */

  async function listPayments(
    params
  ) {
    return list(
      CONFIG.api.payments,
      params
    );
  }

  async function confirmPayment(
    paymentId,
    options
  ) {
    return executeDangerous(
      "payment_confirm",
      "Подтверждение платежа",
      "Вы действительно подтверждаете этот платеж?",
      async function () {
        return action(
          CONFIG.api.payments +
            "/confirm",
          {
            payment_id:
              paymentId,

            options:
              options || {},

            audit:
              createAuditContext(
                "payment.confirm"
              )
          }
        );
      }
    );
  }

  async function rejectPayment(
    paymentId,
    reason
  ) {
    return executeDangerous(
      "payment_reject",
      "Отклонение платежа",
      "Отклонить платеж?",
      async function () {
        return action(
          CONFIG.api.payments +
            "/reject",
          {
            payment_id:
              paymentId,

            reason:
              reason ||
              null,

            audit:
              createAuditContext(
                "payment.reject"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     SERVICES
     ============================================================ */

  async function getParticipantServices(
    participantId
  ) {
    return get(
      CONFIG.api.services,
      participantId
    );
  }

  async function grantService(
    participantId,
    service,
    options
  ) {
    const opts =
      options || {};

    return executeDangerous(
      "grant",
      "Выдача услуги",
      "Выдать участнику выбранную услугу и права?",
      async function () {
        return action(
          CONFIG.api.services +
            "/grant",
          {
            participant_id:
              participantId,

            service,

            price:
              opts.price ??
              null,

            currency:
              opts.currency ||
              "TJS",

            starts_at:
              opts.startsAt ||
              null,

            ends_at:
              opts.endsAt ||
              null,

            unlimited:
              Boolean(
                opts.unlimited
              ),

            permissions:
              opts.permissions ||
              {},

            features:
              opts.features ||
              {},

            reason:
              opts.reason ||
              null,

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "service.grant"
              )
          }
        );
      }
    );
  }

  async function revokeService(
    participantId,
    service,
    options
  ) {
    return executeDangerous(
      "revoke",
      "Отзыв услуги",
      "Отозвать услугу у участника?",
      async function () {
        return action(
          CONFIG.api.services +
            "/revoke",
          {
            participant_id:
              participantId,

            service,

            options:
              options || {},

            acting:
              getActingContext(),

            audit:
              createAuditContext(
                "service.revoke"
              )
          }
        );
      }
    );
  }

  async function setServicePrice(
    participantId,
    service,
    price
  ) {
    return action(
      CONFIG.api.services +
        "/price",
      {
        participant_id:
          participantId,

        service,

        price,

        audit:
          createAuditContext(
            "service.price.update"
          )
      }
    );
  }

  /* ============================================================
     LEVELS
     ============================================================ */

  async function setParticipantLevel(
    participantId,
    level,
    options
  ) {
    if (
      window.TOLevels &&
      typeof window.TOLevels.adminSetLevel ===
        "function"
    ) {
      return window.TOLevels.adminSetLevel(
        participantId,
        level,
        options
      );
    }

    return action(
      CONFIG.api.levels +
        "/set",
      {
        participant_id:
          participantId,

        level,

        options:
          options || {},

        audit:
          createAuditContext(
            "level.set"
          )
      }
    );
  }

  async function resetParticipantLevel(
    participantId,
    options
  ) {
    return executeDangerous(
      "reset_level",
      "Сброс уровня",
      "Вернуть участника на Lv.0?",
      async function () {
        return action(
          CONFIG.api.levels +
            "/reset",
          {
            participant_id:
              participantId,

            options:
              options || {},

            audit:
              createAuditContext(
                "level.reset"
              )
          }
        );
      }
    );
  }

  async function saveLevelSettings(
    settings
  ) {
    return update(
      CONFIG.api.levelSettings,
      "global",
      {
        settings,

        audit:
          createAuditContext(
            "level.settings.update"
          )
      }
    );
  }

  /* ============================================================
     PERMISSIONS
     ============================================================ */

  async function getPermissions(
    participantId
  ) {
    return get(
      CONFIG.api.participantPermissions,
      participantId
    );
  }

  async function setPermission(
    participantId,
    permission,
    value,
    options
  ) {
    return executeDangerous(
      "set_permission",
      "Изменение права",
      "Изменить это право участника?",
      async function () {
        return action(
          CONFIG.api.permissions +
            "/set",
          {
            participant_id:
              participantId,

            permission,

            value,

            mode:
              options?.mode ||
              "override",

            starts_at:
              options?.startsAt ||
              null,

            ends_at:
              options?.endsAt ||
              null,

            reason:
              options?.reason ||
              null,

            audit:
              createAuditContext(
                "permission.set"
              )
          }
        );
      }
    );
  }

  async function setPermissions(
    participantId,
    permissions,
    options
  ) {
    return executeDangerous(
      "set_permissions",
      "Изменение прав участника",
      "Сохранить полный набор индивидуальных прав?",
      async function () {
        return action(
          CONFIG.api.permissions +
            "/set-many",
          {
            participant_id:
              participantId,

            permissions,

            options:
              options || {},

            audit:
              createAuditContext(
                "permissions.set_many"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     BLOCKS
     ============================================================ */

  async function blockParticipant(
    participantId,
    options
  ) {
    const opts =
      options || {};

    return executeDangerous(
      "block",
      "Блокировка участника",
      "Вы действительно хотите заблокировать участника?",
      async function () {
        return action(
          CONFIG.api.blocks +
            "/create",
          {
            participant_id:
              participantId,

            scope:
              opts.scope ||
              "full",

            reason:
              opts.reason ||
              null,

            starts_at:
              opts.startsAt ||
              now(),

            ends_at:
              opts.endsAt ||
              null,

            permanent:
              Boolean(
                opts.permanent
              ),

            message:
              opts.message ||
              "🚫 Вы заблокированы. Для выяснения причины и запроса разблокировки обратитесь к администрации.",

            allow_admin_chat:
              opts.allowAdminChat !==
              false,

            audit:
              createAuditContext(
                "participant.block"
              )
          }
        );
      }
    );
  }

  async function unblockParticipant(
    participantId,
    reason
  ) {
    return executeDangerous(
      "unblock",
      "Разблокировка",
      "Разблокировать участника?",
      async function () {
        return action(
          CONFIG.api.blocks +
            "/remove",
          {
            participant_id:
              participantId,

            reason:
              reason ||
              null,

            audit:
              createAuditContext(
                "participant.unblock"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     ACT AS PARTICIPANT
     ============================================================ */

  function getActingContext() {
    if (
      !state.acting.active
    ) {
      return {
        active:
          false,

        real_admin_id:
          state.admin?.id ||
          null
      };
    }

    return {
      active:
        true,

      participant_id:
        state.acting.participantId,

      real_admin_id:
        state.acting.realAdminId ||
        state.admin?.id ||
        null,

      started_at:
        state.acting.startedAt ||
        null
    };
  }

  function createAuditContext(
    actionName
  ) {
    return {
      action:
        actionName,

      timestamp:
        now(),

      admin_id:
        state.admin?.id ||
        null,

      admin_role:
        state.role ||
        null,

      superadmin:
        state.isSuperAdmin,

      acting:
        getActingContext()
    };
  }

  async function loadActingParticipant(
    participantId
  ) {
    const data =
      await getParticipant(
        participantId
      );

    return (
      data?.participant ||
      data?.profile ||
      data
    );
  }

  async function startActingAsParticipant(
    participantId
  ) {
    if (
      !state.isSuperAdmin
    ) {
      throw new Error(
        "Только SUPER ADMIN может использовать режим Acting."
      );
    }

    const participant =
      await loadActingParticipant(
        participantId
      );

    const confirmed =
      await confirmAction(
        "🎭 Действовать от имени участника",
        "Вы входите в полный режим управления выбранным профилем. Все серверные действия будут аудироваться.",
        {
          confirmText:
            "Войти в профиль"
        }
      );

    if (
      !confirmed
    ) {
      return {
        cancelled:
          true
      };
    }

    state.acting = {
      active:
        true,

      participantId,

      participant,

      realAdminId:
        state.admin?.id ||
        null,

      startedAt:
        now()
    };

    saveLocalState();

    await action(
      CONFIG.api.acting +
        "/start",
      {
        participant_id:
          participantId,

        audit:
          createAuditContext(
            "acting.start"
          )
      }
    );

    emit(
      "acting-started",
      {
        participant
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "to:admin:acting-profile-changed",
        {
          detail: {
            participantId,
            participant,
            active:
              true
          }
        }
      )
    );

    renderActingBanner();

    return participant;
  }

  async function stopActingAsParticipant() {
    if (
      !state.acting.active
    ) {
      return true;
    }

    const confirmed =
      await confirmAction(
        "Завершить режим Acting?",
        "Вернуться к реальному административному профилю?",
        {
          confirmText:
            "Завершить"
        }
      );

    if (
      !confirmed
    ) {
      return false;
    }

    const previous =
      clone(
        state.acting
      );

    try {
      await action(
        CONFIG.api.acting +
          "/stop",
        {
          participant_id:
            previous.participantId,

          audit:
            createAuditContext(
              "acting.stop"
            )
        }
      );
    } finally {
      state.acting = {
        active:
          false,

        participantId:
          null,

        participant:
          null,

        realAdminId:
          state.admin?.id ||
          null,

        startedAt:
          null
      };

      saveLocalState();

      emit(
        "acting-stopped",
        previous
      );

      renderActingBanner();
    }

    return true;
  }

  async function switchActingParticipant(
    participantId
  ) {
    if (
      !state.acting.active
    ) {
      return startActingAsParticipant(
        participantId
      );
    }

    const confirmed =
      await confirmAction(
        "Переключить профиль?",
        "Завершить текущий профиль и перейти к другому участнику?",
        {
          confirmText:
            "Переключить"
        }
      );

    if (
      !confirmed
    ) {
      return false;
    }

    await action(
      CONFIG.api.acting +
        "/switch",
      {
        from_participant_id:
          state.acting.participantId,

        to_participant_id:
          participantId,

        audit:
          createAuditContext(
            "acting.switch"
          )
      }
    );

    const participant =
      await loadActingParticipant(
        participantId
      );

    state.acting.participantId =
      participantId;

    state.acting.participant =
      participant;

    state.acting.startedAt =
      now();

    saveLocalState();

    emit(
      "acting-switched",
      {
        participant
      }
    );

    renderActingBanner();

    return participant;
  }

  /* ============================================================
     ADMIN ACTING ACTIONS
     ============================================================ */

  async function createCommentAsParticipant(
    participantId,
    publicationId,
    text,
    options
  ) {
    return executeDangerous(
      "comment_as_participant",
      "Комментарий от имени участника",
      "Создать комментарий от имени выбранного профиля?",
      async function () {
        return action(
          CONFIG.api.comments +
            "/act-as",
          {
            participant_id:
              participantId,

            publication_id:
              publicationId,

            text,

            parent_comment_id:
              options?.parentCommentId ||
              null,

            audit:
              createAuditContext(
                "comment.create_as_participant"
              )
          }
        );
      }
    );
  }

  async function createReviewAsParticipant(
    participantId,
    targetType,
    targetId,
    review,
    options
  ) {
    return executeDangerous(
      "review_as_participant",
      "Отзыв от имени участника",
      "Создать отзыв от имени выбранного профиля?",
      async function () {
        return action(
          CONFIG.api.reviews +
            "/act-as",
          {
            participant_id:
              participantId,

            target_type:
              targetType,

            target_id:
              targetId,

            review,

            audit:
              createAuditContext(
                "review.create_as_participant"
              )
          }
        );
      }
    );
  }

  async function createPublicationAsParticipant(
    participantId,
    publication,
    options
  ) {
    return executeDangerous(
      "publication_as_participant",
      "Публикация от имени участника",
      "Создать публикацию от имени выбранного профиля?",
      async function () {
        return action(
          CONFIG.api.publications +
            "/act-as",
          {
            participant_id:
              participantId,

            publication,

            options:
              options || {},

            audit:
              createAuditContext(
                "publication.create_as_participant"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     ACTIVITY MONITOR
     ============================================================ */

  async function listActivity(
    params
  ) {
    return list(
      CONFIG.api.activity,
      params
    );
  }

  async function getParticipantActivity(
    participantId,
    params
  ) {
    return list(
      CONFIG.api.activity,
      Object.assign(
        {},
        params || {},
        {
          participant_id:
            participantId
        }
      )
    );
  }

  /* ============================================================
     MODERATION
     ============================================================ */

  async function loadModerationQueue(
    params
  ) {
    return list(
      CONFIG.api.moderation,
      params
    );
  }

  async function bulkModeration(
    ids,
    moderationAction,
    options
  ) {
    return executeDangerous(
      "bulk_moderation",
      "Массовая модерация",
      "Применить действие ко всем выбранным объектам?",
      async function () {
        return action(
          CONFIG.api.moderation +
            "/bulk",
          {
            ids,

            action:
              moderationAction,

            options:
              options || {},

            audit:
              createAuditContext(
                "moderation.bulk"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     ANALYTICS / METRICS
     ============================================================ */

  async function loadAnalytics(
    params
  ) {
    return list(
      CONFIG.api.analytics,
      params
    );
  }

  async function loadMetrics(
    params
  ) {
    return list(
      CONFIG.api.metrics,
      params
    );
  }

  async function updateMetrics(
    targetType,
    targetId,
    metrics
  ) {
    return executeDangerous(
      "set_metrics",
      "Изменение метрик",
      "Вы действительно хотите изменить статистику объекта?",
      async function () {
        return action(
          CONFIG.api.metrics +
            "/set",
          {
            target_type:
              targetType,

            target_id:
              targetId,

            metrics,

            audit:
              createAuditContext(
                "metrics.set"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     CATEGORIES
     ============================================================ */

  async function listCategories() {
    return list(
      CONFIG.api.categories
    );
  }

  async function createCategory(
    category
  ) {
    return create(
      CONFIG.api.categories,
      category
    );
  }

  async function updateCategory(
    id,
    changes
  ) {
    return update(
      CONFIG.api.categories,
      id,
      {
        changes,

        audit:
          createAuditContext(
            "category.update"
          )
      }
    );
  }

  async function deleteCategory(
    id
  ) {
    return executeDangerous(
      "delete",
      "Удаление категории",
      "Удалить категорию?",
      async function () {
        return remove(
          CONFIG.api.categories,
          id,
          {
            audit:
              createAuditContext(
                "category.delete"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     TAGS / STATUSES
     ============================================================ */

  async function listTags(
    params
  ) {
    return list(
      CONFIG.api.tags,
      params
    );
  }

  async function createTag(
    tag
  ) {
    return create(
      CONFIG.api.tags,
      {
        tag,

        audit:
          createAuditContext(
            "tag.create"
          )
      }
    );
  }

  async function updateTag(
    id,
    changes
  ) {
    return update(
      CONFIG.api.tags,
      id,
      {
        changes,

        audit:
          createAuditContext(
            "tag.update"
          )
      }
    );
  }

  /* ============================================================
     MEDIA
     ============================================================ */

  async function listMedia(
    params
  ) {
    return list(
      CONFIG.api.media,
      params
    );
  }

  async function deleteMedia(
    id,
    options
  ) {
    return executeDangerous(
      "delete",
      "Удаление медиа",
      "Удалить медиафайл?",
      async function () {
        return remove(
          CONFIG.api.media,
          id,
          {
            permanent:
              Boolean(
                options?.permanent
              ),

            audit:
              createAuditContext(
                "media.delete"
              )
          }
        );
      },
      {
        requireText:
          options?.permanent
            ? "DELETE"
            : undefined
      }
    );
  }

  /* ============================================================
     BACKGROUNDS / FONTS
     ============================================================ */

  async function listBackgrounds() {
    return list(
      CONFIG.api.backgrounds
    );
  }

  async function updateBackground(
    id,
    changes
  ) {
    return update(
      CONFIG.api.backgrounds,
      id,
      {
        changes,

        audit:
          createAuditContext(
            "background.update"
          )
      }
    );
  }

  async function listFonts() {
    return list(
      CONFIG.api.fonts
    );
  }

  async function updateFont(
    id,
    changes
  ) {
    return update(
      CONFIG.api.fonts,
      id,
      {
        changes,

        audit:
          createAuditContext(
            "font.update"
          )
      }
    );
  }

  /* ============================================================
     FEATURE FLAGS
     ============================================================ */

  async function listFeatureFlags() {
    return list(
      CONFIG.api.featureFlags
    );
  }

  async function setFeatureFlag(
    flag,
    value,
    options
  ) {
    return executeDangerous(
      "feature_flag",
      "Изменение Feature Flag",
      "Изменить состояние системной функции?",
      async function () {
        return action(
          CONFIG.api.featureFlags +
            "/set",
          {
            flag,
            value,

            scope:
              options?.scope ||
              "global",

            participant_id:
              options?.participantId ||
              null,

            category_id:
              options?.categoryId ||
              null,

            publication_id:
              options?.publicationId ||
              null,

            starts_at:
              options?.startsAt ||
              null,

            ends_at:
              options?.endsAt ||
              null,

            audit:
              createAuditContext(
                "feature_flag.set"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     SYSTEM SETTINGS
     ============================================================ */

  async function getSystemSettings() {
    return list(
      CONFIG.api.settings
    );
  }

  async function setSystemSetting(
    key,
    value
  ) {
    return executeDangerous(
      "system_setting",
      "Изменение системной настройки",
      "Изменить системную настройку?",
      async function () {
        return action(
          CONFIG.api.settings +
            "/set",
          {
            key,
            value,

            audit:
              createAuditContext(
                "system_setting.set"
              )
          }
        );
      }
    );
  }

  async function emergencyToggle(
    feature,
    enabled,
    reason
  ) {
    return executeDangerous(
      "maintenance",
      "Экстренное управление системой",
      "Изменить состояние критической функции системы?",
      async function () {
        return action(
          CONFIG.api.system +
            "/emergency-toggle",
          {
            feature,
            enabled,
            reason:

              reason ||
              null,

            audit:
              createAuditContext(
                "system.emergency_toggle"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     SECURITY
     ============================================================ */

  async function loadSecurity(
    params
  ) {
    return list(
      CONFIG.api.security,
      params
    );
  }

  async function revokeSession(
    sessionId
  ) {
    return executeDangerous(
      "revoke",
      "Отозвать сессию",
      "Закрыть эту сессию?",
      async function () {
        return action(
          CONFIG.api.security +
            "/revoke-session",
          {
            session_id:
              sessionId,

            audit:
              createAuditContext(
                "security.session_revoke"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     ADMINS / ROLES
     ============================================================ */

  async function listAdmins(
    params
  ) {
    return list(
      CONFIG.api.admins,
      params
    );
  }

  async function createAdmin(
    admin
  ) {
    return executeDangerous(
      "create_admin",
      "Создание администратора",
      "Создать нового администратора?",
      async function () {
        return create(
          CONFIG.api.admins,
          {
            admin,

            audit:
              createAuditContext(
                "admin.create"
              )
          }
        );
      }
    );
  }

  async function updateAdmin(
    id,
    changes
  ) {
    return executeDangerous(
      "change_role",
      "Изменение администратора",
      "Изменить права или данные администратора?",
      async function () {
        return update(
          CONFIG.api.admins,
          id,
          {
            changes,

            audit:
              createAuditContext(
                "admin.update"
              )
          }
        );
      }
    );
  }

  async function deleteAdmin(
    id
  ) {
    return executeDangerous(
      "delete_admin",
      "Удаление администратора",
      "Удалить администратора окончательно?",
      async function () {
        return remove(
          CONFIG.api.admins,
          id,
          {
            audit:
              createAuditContext(
                "admin.delete"
              )
          }
        );
      },
      {
        requireText:
          "DELETE"
      }
    );
  }

  async function listRoles() {
    return list(
      CONFIG.api.roles
    );
  }

  async function updateRole(
    id,
    changes
  ) {
    return executeDangerous(
      "change_role",
      "Изменение роли",
      "Изменить права роли?",
      async function () {
        return update(
          CONFIG.api.roles,
          id,
          {
            changes,

            audit:
              createAuditContext(
                "role.update"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     AUDIT
     ============================================================ */

  async function listAudit(
    params
  ) {
    return list(
      CONFIG.api.audit,
      params
    );
  }

  async function exportAudit(
    params
  ) {
    return action(
      CONFIG.api.audit +
        "/export",
      {
        filters:
          params || {},

        audit:
          createAuditContext(
            "audit.export"
          )
      }
    );
  }

  /* ============================================================
     BACKUP / RESTORE
     ============================================================ */

  async function createBackup(
    options
  ) {
    return executeDangerous(
      "backup_restore",
      "Создание резервной копии",
      "Создать резервную копию системы?",
      async function () {
        return action(
          CONFIG.api.backup +
            "/create",
          {
            options:
              options || {},

            audit:
              createAuditContext(
                "backup.create"
              )
          }
        );
      }
    );
  }

  async function listBackups() {
    return list(
      CONFIG.api.backup
    );
  }

  async function restoreBackup(
    backupId
  ) {
    return executeDangerous(
      "backup_restore",
      "Восстановление системы",
      "ВНИМАНИЕ: восстановление может изменить большое количество данных. Продолжить?",
      async function () {
        return action(
          CONFIG.api.backup +
            "/restore",
          {
            backup_id:
              backupId,

            audit:
              createAuditContext(
                "backup.restore"
              )
          }
        );
      },
      {
        requireText:
          "RESTORE"
      }
    );
  }

  /* ============================================================
     MAINTENANCE
     ============================================================ */

  async function getMaintenance() {
    return list(
      CONFIG.api.maintenance
    );
  }

  async function setMaintenance(
    enabled,
    options
  ) {
    return executeDangerous(
      "maintenance",
      "Режим обслуживания",
      enabled
        ? "Включить режим обслуживания сайта?"
        : "Отключить режим обслуживания?",
      async function () {
        return action(
          CONFIG.api.maintenance +
            "/set",
          {
            enabled,

            message:
              options?.message ||
              null,

            allow_admin:
              options?.allowAdmin !==
              false,

            starts_at:
              options?.startsAt ||
              null,

            ends_at:
              options?.endsAt ||
              null,

            audit:
              createAuditContext(
                "maintenance.set"
              )
          }
        );
      }
    );
  }

  /* ============================================================
     RENDER NAVIGATION
     ============================================================ */

  function renderNavigation(
    container
  ) {
    if (!container) {
      return null;
    }

    const grouped =
      [
        {
          title:
            "Основное",

          ids: [
            "dashboard",
            "search",
            "participants",
            "profiles"
          ]
        },

        {
          title:
            "Контент",

          ids: [
            "publications",
            "comments",
            "reviews",
            "reactions",
            "shares",
            "media"
          ]
        },

        {
          title:
            "Коммуникации",

          ids: [
            "chats",
            "messages",
            "notifications"
          ]
        },

        {
          title:
            "Монетизация",

          ids: [
            "payments",
            "services"
          ]
        },

        {
          title:
            "Управление",

          ids: [
            "levels",
            "achievements",
            "permissions",
            "blocks",
            "reports",
            "moderation"
          ]
        },

        {
          title:
            "Система",

          ids: [
            "analytics",
            "metrics",
            "categories",
            "tags",
            "backgrounds",
            "fonts",
            "feature-flags",
            "settings",
            "security"
          ]
        },

        {
          title:
            "Администрация",

          ids: [
            "admins",
            "roles",
            "audit",
            "backup",
            "maintenance",
            "system"
          ]
        }
      ];

    container.innerHTML =
      grouped
        .map(
          function (group) {
            const items =
              group.ids
                .map(
                  function (
                    sectionId
                  ) {
                    const section =
                      getSection(
                        sectionId
                      );

                    if (
                      !section ||
                      !can(
                        section.permission
                      )
                    ) {
                      return "";
                    }

                    const count =
                      getSectionCount(
                        sectionId
                      );

                    return `
                      <button
                        type="button"
                        class="
                          to-admin-nav-item
                          ${
                            state.section ===
                            sectionId
                              ? "is-active"
                              : ""
                          }
                        "
                        data-admin-section="${escapeHtml(
                          sectionId
                        )}"
                      >

                        <span class="to-admin-nav-icon">
                          ${section.icon}
                        </span>

                        <span class="to-admin-nav-title">
                          ${escapeHtml(
                            section.title
                          )}
                        </span>

                        ${
                          count > 0
                            ? `
                              <span class="to-admin-nav-count">
                                ${escapeHtml(
                                  count
                                )}
                              </span>
                            `
                            : ""
                        }

                      </button>
                    `;
                  }
                )
                .join("");

            if (!items.trim()) {
              return "";
            }

            return `
              <div class="to-admin-nav-group">

                <div class="to-admin-nav-group-title">
                  ${escapeHtml(
                    group.title
                  )}
                </div>

                ${items}

              </div>
            `;
          }
        )
        .join("");

    container
      .querySelectorAll(
        "[data-admin-section]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              openSection(
                button.dataset.adminSection
              );
            }
          );
        }
      );

    return container;
  }

  function getSectionCount(
    sectionId
  ) {
    const map = {
      reports:
        state.unread.reports,

      comments:
        state.unread.comments,

      publications:
        state.unread.publications,

      chats:
        state.unread.chats,

      messages:
        state.unread.messages,

      reviews:
        state.unread.reviews,

      notifications:
        state.unread.notifications,

      payments:
        state.unread.payments
    };

    return Number(
      map[sectionId] ||
      0
    );
  }

  /* ============================================================
     ADMIN HEADER
     ============================================================ */

  function renderHeader(
    container
  ) {
    if (!container) {
      return null;
    }

    const acting =
      state.acting.active;

    container.innerHTML = `
      <header class="to-admin-header">

        <div class="to-admin-header-brand">

          <div class="to-admin-header-logo">
            🇹🇯
          </div>

          <div>
            <strong>
              Tajik Opportunities
            </strong>

            <span>
              SUPER ADMIN CONTROL CENTER
            </span>
          </div>

        </div>

        <div class="to-admin-header-search">

          <input
            type="search"
            data-admin-super-search
            value="${escapeHtml(
              state.search.query
            )}"
            placeholder="🔎 Найти участника, @username, ID, пост, чат, сообщение..."
          >

          <button
            type="button"
            data-admin-search-button
          >
            Найти
          </button>

        </div>

        <div class="to-admin-header-actions">

          <button
            type="button"
            data-admin-action="notifications"
            title="Уведомления"
          >
            🔔
            ${
              state.unread.notifications
                ? `
                  <b>
                    ${escapeHtml(
                      state.unread.notifications
                    )}
                  </b>
                `
                : ""
            }
          </button>

          <button
            type="button"
            data-admin-action="profile"
          >
            👑
            ${
              escapeHtml(
                state.admin?.name ||
                state.admin?.username ||
                "ADMIN"
              )
            }
          </button>

        </div>

      </header>

      ${
        acting
          ? `
            <div class="to-admin-acting-banner">

              <div>
                🎭
                <strong>
                  Вы действуете от имени:
                </strong>

                <span>
                  ${
                    escapeHtml(
                      state.acting.participant?.name ||
                      "Участник"
                    )
                  }
                </span>

                ${
                  state.acting.participant?.username
                    ? `
                      <small>
                        @${escapeHtml(
                          state.acting.participant.username
                        )}
                      </small>
                    `
                    : ""
                }
              </div>

              <div>

                <button
                  type="button"
                  data-admin-action="switch-acting"
                >
                  🔄 Переключить профиль
                </button>

                <button
                  type="button"
                  data-admin-action="stop-acting"
                  class="danger"
                >
                  Завершить режим
                </button>

              </div>

            </div>
          `
          : ""
      }
    `;

    bindHeader(
      container
    );

    return container;
  }

  function bindHeader(
    container
  ) {
    const input =
      container.querySelector(
        "[data-admin-super-search]"
      );

    const searchButton =
      container.querySelector(
        "[data-admin-search-button]"
      );

    searchButton?.addEventListener(
      "click",
      function () {
        superSearch(
          input?.value ||
            ""
        );

        openSection(
          "search"
        );
      }
    );

    input?.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key ===
          "Enter"
        ) {
          event.preventDefault();

          searchButton?.click();
        }
      }
    );

    container
      .querySelectorAll(
        "[data-admin-action]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            async function () {
              const actionName =
                button.dataset.adminAction;

              if (
                actionName ===
                "notifications"
              ) {
                openSection(
                  "notifications"
                );
              }

              if (
                actionName ===
                "stop-acting"
              ) {
                await stopActingAsParticipant();
              }

              if (
                actionName ===
                "switch-acting"
              ) {
                openParticipantSwitcher();
              }

              if (
                actionName ===
                "profile"
              ) {
                openAdminProfile();
              }
            }
          );
        }
      );
  }

  /* ============================================================
     PARTICIPANT SWITCHER
     ============================================================ */

  function openParticipantSwitcher() {
    openModal(
      "switch-participant",
      `
        <div class="to-admin-switcher">

          <h3>
            🎭 Переключить профиль участника
          </h3>

          <input
            type="search"
            data-switch-search
            placeholder="Username, имя или ID"
          >

          <div
            data-switch-results
          >
            Введите запрос для поиска.
          </div>

        </div>
      `
    );

    const input =
      document.querySelector(
        "[data-switch-search]"
      );

    const results =
      document.querySelector(
        "[data-switch-results]"
      );

    let timer = null;

    input?.addEventListener(
      "input",
      function () {
        window.clearTimeout(
          timer
        );

        timer =
          window.setTimeout(
            async function () {
              const data =
                await superSearch(
                  input.value,
                  {
                    type:
                      "participants"
                  }
                );

              const items =
                data?.items ||
                data?.results ||
                [];

              results.innerHTML =
                items
                  .map(
                    function (
                      item
                    ) {
                      const id =
                        item.id ||
                        item.participant_id;

                      return `
                        <button
                          type="button"
                          data-switch-participant="${escapeHtml(
                            id
                          )}"
                        >
                          <strong>
                            ${escapeHtml(
                              item.name ||
                              item.username ||
                              "Участник"
                            )}
                          </strong>

                          ${
                            item.username
                              ? `
                                <span>
                                  @${escapeHtml(
                                    item.username
                                  )}
                                </span>
                              `
                              : ""
                          }

                          <small>
                            ${escapeHtml(
                              id
                            )}
                          </small>
                        </button>
                      `;
                    }
                  )
                  .join("") ||
                "Ничего не найдено.";

              results
                .querySelectorAll(
                  "[data-switch-participant]"
                )
                .forEach(
                  function (
                    button
                  ) {
                    button.addEventListener(
                      "click",
                      async function () {
                        await switchActingParticipant(
                          button.dataset.switchParticipant
                        );

                        closeModal();
                      }
                    );
                  }
                );
            },
            CONFIG.search.debounce
          );
      }
    );
  }

  /* ============================================================
     SECTION OPEN
     ============================================================ */

  function openSection(
    sectionId
  ) {
    const section =
      getSection(
        sectionId
      );

    if (
      !section
    ) {
      return false;
    }

    if (
      !can(
        section.permission
      )
    ) {
      showToast(
        "Недостаточно прав для этого раздела.",
        "error"
      );

      return false;
    }

    state.previousSection =
      state.section;

    state.section =
      sectionId;

    saveLocalState();

    emit(
      "section-changed",
      {
        section:
          sectionId
      }
    );

    renderAdmin();

    return true;
  }

  /* ============================================================
     MAIN RENDER
     ============================================================ */

  function getRoot() {
    return (
      document.querySelector(
        "[data-to-admin]"
      ) ||
      document.querySelector(
        "#admin-app"
      ) ||
      document.querySelector(
        ".admin-app"
      )
    );
  }

  function ensureRoot() {
    let root =
      getRoot();

    if (
      root
    ) {
      return root;
    }

    root =
      document.createElement(
        "div"
      );

    root.id =
      "admin-app";

    root.dataset.toAdmin =
      "true";

    document.body.appendChild(
      root
    );

    return root;
  }

  function renderAdmin() {
    const root =
      ensureRoot();

    root.classList.add(
      "to-admin-shell"
    );

    root.innerHTML = `
      <div class="to-admin-layout">

        <aside class="to-admin-sidebar">

          <div
            data-admin-navigation
          ></div>

        </aside>

        <main class="to-admin-main">

          <div
            data-admin-header
          ></div>

          <div
            class="to-admin-content"
            data-admin-content
          ></div>

        </main>

      </div>

      <div
        data-admin-modal-root
      ></div>

      <div
        data-admin-toast-root
      ></div>
    `;

    renderNavigation(
      root.querySelector(
        "[data-admin-navigation]"
      )
    );

    renderHeader(
      root.querySelector(
        "[data-admin-header]"
      )
    );

    renderSection(
      root.querySelector(
        "[data-admin-content]"
      )
    );

    return root;
  }

  /* ============================================================
     SECTION RENDERER
     ============================================================ */

  function renderSection(
    container
  ) {
    if (!container) {
      return;
    }

    const renderers = {
      dashboard:
        renderDashboard,

      search:
        renderSearch,

      participants:
        renderParticipants,

      profiles:
        renderProfiles,

      publications:
        renderPublications,

      comments:
        renderComments,

      reviews:
        renderReviews,

      reactions:
        renderReactions,

      shares:
        renderShares,

      reports:
        renderReports,

      chats:
        renderChats,

      messages:
        renderMessages,

      notifications:
        renderNotifications,

      payments:
        renderPayments,

      services:
        renderServices,

      levels:
        renderLevels,

      achievements:
        renderAchievements,

      permissions:
        renderPermissions,

      blocks:
        renderBlocks,

      activity:
        renderActivity,

      moderation:
        renderModeration,

      analytics:
        renderAnalytics,

      metrics:
        renderMetrics,

      categories:
        renderCategories,

      tags:
        renderTags,

      media:
        renderMedia,

      backgrounds:
        renderBackgrounds,

      fonts:
        renderFonts,

      "feature-flags":
        renderFeatureFlags,

      settings:
        renderSettings,

      security:
        renderSecurity,

      admins:
        renderAdmins,

      roles:
        renderRoles,

      audit:
        renderAudit,

      backup:
        renderBackup,

      maintenance:
        renderMaintenance,

      system:
        renderSystem
    };

    const renderer =
      renderers[
        state.section
      ];

    if (
      renderer
    ) {
      renderer(
        container
      );

      return;
    }

    renderPlaceholder(
      container,
      state.section
    );
  }

  /* ============================================================
     COMMON SECTION UI
     ============================================================ */

  function sectionHeader(
    title,
    description,
    actions
  ) {
    return `
      <div class="to-admin-section-header">

        <div>
          <div class="to-admin-section-kicker">
            🇹🇯 TAJIK OPPORTUNITIES
          </div>

          <h1>
            ${escapeHtml(
              title
            )}
          </h1>

          ${
            description
              ? `
                <p>
                  ${escapeHtml(
                    description
                  )}
                </p>
              `
              : ""
          }
        </div>

        ${
          actions
            ? `
              <div class="to-admin-section-actions">
                ${actions}
              </div>
            `
            : ""
        }

      </div>
    `;
  }

  function toolbar(
    buttons
  ) {
    return `
      <div class="to-admin-toolbar">
        ${
          buttons ||
          ""
        }
      </div>
    `;
  }

  function card(
    title,
    content,
    options
  ) {
    const opts =
      options || {};

    return `
      <section
        class="
          to-admin-card
          ${
            opts.className ||
            ""
          }
        "
      >

        ${
          title
            ? `
              <div class="to-admin-card-header">
                <h3>
                  ${escapeHtml(
                    title
                  )}
                </h3>

                ${
                  opts.action ||
                  ""
                }
              </div>
            `
            : ""
        }

        <div class="to-admin-card-body">
          ${
            content ||
            ""
          }
        </div>

      </section>
    `;
  }

  function statCard(
    icon,
    title,
    value,
    subtitle
  ) {
    return `
      <div class="to-admin-stat">

        <div class="to-admin-stat-icon">
          ${icon}
        </div>

        <div class="to-admin-stat-body">

          <span>
            ${escapeHtml(
              title
            )}
          </span>

          <strong>
            ${escapeHtml(
              value
            )}
          </strong>

          ${
            subtitle
              ? `
                <small>
                  ${escapeHtml(
                    subtitle
                  )}
                </small>
              `
              : ""
          }

        </div>

      </div>
    `;
  }

  function emptyState(
    text
  ) {
    return `
      <div class="to-admin-empty">
        <div>
          📭
        </div>

        <span>
          ${escapeHtml(
            text ||
            "Нет данных."
          )}
        </span>
      </div>
    `;
  }

  function renderPlaceholder(
    container,
    sectionId
  ) {
    const section =
      getSection(
        sectionId
      );

    container.innerHTML =
      sectionHeader(
        section?.title ||
          sectionId,
        "Раздел управления готов к подключению серверного API."
      ) +
      card(
        null,
        emptyState(
          "Выберите действие или загрузите данные."
        )
      );
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */

  async function renderDashboard(
    container
  ) {
    container.innerHTML =
      sectionHeader(
        "Dashboard",
        "Центральная панель управления всей платформой."
      ) +
      `<div data-dashboard-loading>
        ⏳ Загрузка...
      </div>`;

    try {
      const data =
        await loadDashboard();

      const counts =
        data?.counts ||
        {};

      container.innerHTML =
        sectionHeader(
          "Dashboard",
          "Центральная панель управления всей платформой."
        ) +

        `<div class="to-admin-stats-grid">

          ${statCard(
            "👤",
            "Участники",
            counts.participants ??
              0
          )}

          ${statCard(
            "📰",
            "Публикации",
            counts.publications ??
              0
          )}

          ${statCard(
            "💬",
            "Комментарии",
            counts.comments ??
              0
          )}

          ${statCard(
            "⭐",
            "Отзывы",
            counts.reviews ??
              0
          )}

          ${statCard(
            "🚩",
            "Жалобы",
            counts.reports ??
              0
          )}

          ${statCard(
            "💬",
            "Чаты",
            counts.conversations ??
              0
          )}

          ${statCard(
            "✉️",
            "Сообщения",
            counts.messages ??
              0
          )}

          ${statCard(
            "💰",
            "Платежи",
            counts.payments ??
              0
          )}

        </div>` +

        card(
          "🚨 Требует внимания",
          renderDashboardAttention(
            data
          )
        ) +

        card(
          "⚡ Быстрые действия",
          `
            <div class="to-admin-quick-actions">

              <button
                data-quick="search"
              >
                🔎 Найти участника
              </button>

              <button
                data-quick="reports"
              >
                🚩 Жалобы
              </button>

              <button
                data-quick="publications"
              >
                📰 Модерация публикаций
              </button>

              <button
                data-quick="chats"
              >
                💬 Чаты
              </button>

              <button
                data-quick="notifications"
              >
                🔔 Уведомления
              </button>

              <button
                data-quick="participants"
              >
                👤 Участники
              </button>

            </div>
          `
        );

      container
        .querySelectorAll(
          "[data-quick]"
        )
        .forEach(
          function (button) {
            button.addEventListener(
              "click",
              function () {
                openSection(
                  button.dataset.quick
                );
              }
            );
          }
        );
    } catch (error) {
      container.innerHTML =
        sectionHeader(
          "Dashboard",
          "Ошибка загрузки."
        ) +
        card(
          null,
          `
            <div class="to-admin-error">
              ${escapeHtml(
                error.message
              )}
            </div>
          `
        );
    }
  }

  function renderDashboardAttention(
    data
  ) {
    const items = [];

    const unread =
      data?.unread ||
      {};

    if (
      unread.reports
    ) {
      items.push(
        `🚩 ${unread.reports} новых жалоб`
      );
    }

    if (
      unread.publications
    ) {
      items.push(
        `📰 ${unread.publications} публикаций требуют внимания`
      );
    }

    if (
      unread.messages
    ) {
      items.push(
        `💬 ${unread.messages} новых сообщений`
      );
    }

    if (
      unread.payments
    ) {
      items.push(
        `💰 ${unread.payments} платежей`
      );
    }

    return items.length
      ? `
        <ul>
          ${items
            .map(
              function (item) {
                return `
                  <li>
                    ${escapeHtml(
                      item
                    )}
                  </li>
                `;
              }
            )
            .join("")}
        </ul>
      `
      : emptyState(
          "Критических задач сейчас нет."
        );
  }

  /* ============================================================
     SEARCH
     ============================================================ */

  async function renderSearch(
    container
  ) {
    container.innerHTML =
      sectionHeader(
        "Super Search",
        "Поиск по участникам, профилям, публикациям, комментариям, отзывам, чатам, сообщениям, жалобам и техническим идентификаторам."
      ) +

      card(
        null,
        `
          <div class="to-admin-search-panel">

            <input
              type="search"
              data-search-input
              value="${escapeHtml(
                state.search.query
              )}"
              placeholder="Username / имя / ID / технический ID / пост / сообщение / чат"
            >

            <select
              data-search-type
            >
              <option value="all">
                Всё
              </option>

              <option value="participants">
                Участники
              </option>

              <option value="publications">
                Публикации
              </option>

              <option value="comments">
                Комментарии
              </option>

              <option value="reviews">
                Отзывы
              </option>

              <option value="chats">
                Чаты
              </option>

              <option value="messages">
                Сообщения
              </option>

              <option value="reports">
                Жалобы
              </option>
            </select>

            <button
              type="button"
              data-search-submit
              class="primary"
            >
              🔎 Найти
            </button>

          </div>
        `
      ) +

      card(
        "Результаты",
        `
          <div
            data-search-results
          >
            ${
              state.search.results.length
                ? renderSearchResults(
                    state.search.results
                  )
                : emptyState(
                    "Введите запрос."
                  )
            }
          </div>
        `
      );

    const input =
      container.querySelector(
        "[data-search-input]"
      );

    const type =
      container.querySelector(
        "[data-search-type]"
      );

    const submit =
      container.querySelector(
        "[data-search-submit]"
      );

    type.value =
      state.search.type;

    submit.addEventListener(
      "click",
      async function () {
        state.search.type =
          type.value;

        await superSearch(
          input.value,
          {
            type:
              type.value
          }
        );

        const results =
          container.querySelector(
            "[data-search-results]"
          );

        results.innerHTML =
          renderSearchResults(
            state.search.results
          );
      }
    );
  }

  function renderSearchResults(
    items
  ) {
    if (
      !Array.isArray(items) ||
      !items.length
    ) {
      return emptyState(
        "Ничего не найдено."
      );
    }

    return `
      <div class="to-admin-search-results">

        ${items
          .map(
            function (item) {
              const id =
                item.id ||
                item.participant_id ||
                item.publication_id ||
                item.comment_id ||
                item.review_id ||
                item.conversation_id ||
                item.message_id;

              const type =
                item.type ||
                item.entity_type ||
                "object";

              return `
                <article
                  class="to-admin-search-result"
                >

                  <div>

                    <strong>
                      ${escapeHtml(
                        item.name ||
                        item.title ||
                        item.text ||
                        item.username ||
                        type
                      )}
                    </strong>

                    ${
                      item.username
                        ? `
                          <span>
                            @${escapeHtml(
                              item.username
                            )}
                          </span>
                        `
                        : ""
                    }

                    <small>
                      ${escapeHtml(
                        type
                      )}
                      ·
                      ${escapeHtml(
                        id
                      )}
                    </small>

                  </div>

                  <div>

                    <button
                      type="button"
                      data-result-open="${escapeHtml(
                        id
                      )}"
                      data-result-type="${escapeHtml(
                        type
                      )}"
                    >
                      Открыть
                    </button>

                    ${
                      type ===
                        "participant" ||
                      type ===
                        "participants"
                        ? `
                          <button
                            type="button"
                            data-result-act="${escapeHtml(
                              id
                            )}"
                          >
                            🎭 Управлять
                          </button>
                        `
                        : ""
                    }

                  </div>

                </article>
              `;
            }
          )
          .join("")}

      </div>
    `;
  }

  /* ============================================================
     PARTICIPANTS
     ============================================================ */

  async function renderParticipants(
    container
  ) {
    container.innerHTML =
      sectionHeader(
        "Участники",
        "Полное управление участниками и их профилями."
      ) +
      card(
        null,
        "⏳ Загрузка участников..."
      );

    try {
      const data =
        await listParticipants({
          page:
            state.filters.participantsPage ||
            1,

          limit:
            CONFIG.pagination.defaultLimit
        });

      const items =
        data?.items ||
        data?.participants ||
        [];

      container.innerHTML =
        sectionHeader(
          "Участники",
          "Полное управление участниками и их профилями."
        ) +

        toolbar(
          `
            <button
              data-participants-refresh
            >
              🔄 Обновить
            </button>

            <button
              data-participant-search
            >
              🔎 Поиск
            </button>
          `
        ) +

        card(
          "Список участников",
          items.length
            ? renderParticipantTable(
                items
              )
            : emptyState(
                "Участники не найдены."
              )
        );

      bindParticipantTable(
        container
      );
    } catch (error) {
      renderError(
        container,
        error
      );
    }
  }

  function renderParticipantTable(
    items
  ) {
    return `
      <div class="to-admin-table-wrap">

        <table class="to-admin-table">

          <thead>
            <tr>
              <th>Участник</th>
              <th>Username</th>
              <th>Level</th>
              <th>Service</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>

            ${items
              .map(
                function (
                  participant
                ) {
                  const id =
                    participant.id ||
                    participant.participant_id;

                  return `
                    <tr>

                      <td>
                        <strong>
                          ${escapeHtml(
                            participant.name ||
                            "Без имени"
                          )}
                        </strong>

                        <small>
                          ${escapeHtml(
                            id
                          )}
                        </small>
                      </td>

                      <td>
                        ${
                          participant.username
                            ? "@" +
                              escapeHtml(
                                participant.username
                              )
                            : "—"
                        }
                      </td>

                      <td>
                        Lv.${escapeHtml(
                          participant.level ??
                          0
                        )}
                      </td>

                      <td>
                        ${escapeHtml(
                          participant.service ||
                          participant.plan ||
                          "FREE"
                        )}
                      </td>

                      <td>
                        ${escapeHtml(
                          participant.status ||
                          "active"
                        )}
                      </td>

                      <td>

                        <div class="to-admin-row-actions">

                          <button
                            data-participant-open="${escapeHtml(
                              id
                            )}"
                          >
                            Открыть
                          </button>

                          <button
                            data-participant-act="${escapeHtml(
                              id
                            )}"
                          >
                            🎭
                          </button>

                          <button
                            data-participant-chat="${escapeHtml(
                              id
                            )}"
                          >
                            💬
                          </button>

                          <button
                            data-participant-block="${escapeHtml(
                              id
                            )}"
                            class="danger"
                          >
                            ⛔
                          </button>

                        </div>

                      </td>

                    </tr>
                  `;
                }
              )
              .join("")}

          </tbody>

        </table>

      </div>
    `;
  }

  function bindParticipantTable(
    container
  ) {
    container
      .querySelectorAll(
        "[data-participant-open]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            async function () {
              const id =
                button.dataset.participantOpen;

              await getParticipant(
                id
              );

              openParticipantControlCenter(
                id
              );
            }
          );
        }
      );

    container
      .querySelectorAll(
        "[data-participant-act]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            async function () {
              await startActingAsParticipant(
                button.dataset.participantAct
              );
            }
          );
        }
      );

    container
      .querySelectorAll(
        "[data-participant-block]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            async function () {
              await blockParticipant(
                button.dataset.participantBlock,
                {
                  scope:
                    "full"
                }
              );
            }
          );
        }
      );

    container
      .querySelectorAll(
        "[data-participant-chat]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              openParticipantChat(
                button.dataset.participantChat
              );
            }
          );
        }
      );
  }

  /* ============================================================
     PARTICIPANT CONTROL CENTER
     ============================================================ */

  async function openParticipantControlCenter(
    participantId
  ) {
    const data =
      await getParticipant(
        participantId
      );

    const participant =
      data?.participant ||
      data?.profile ||
      data;

    openModal(
      "participant-control",
      renderParticipantControlCenter(
        participant
      )
    );

    bindParticipantControlCenter(
      participantId
    );
  }

  function renderParticipantControlCenter(
    participant
  ) {
    const id =
      participant.id ||
      participant.participant_id;

    return `
      <div class="to-admin-participant-center">

        <header class="to-admin-participant-center-header">

          <div>

            <div class="to-admin-avatar">
              ${
                participant.avatar
                  ? `
                    <img
                      src="${escapeHtml(
                        participant.avatar
                      )}"
                      alt=""
                    >
                  `
                  : "👤"
              }
            </div>

            <div>

              <h2>
                ${escapeHtml(
                  participant.name ||
                  "Участник"
                )}
              </h2>

              ${
                participant.username
                  ? `
                    <p>
                      @${escapeHtml(
                        participant.username
                      )}
                    </p>
                  `
                  : ""
              }

              <small>
                ID:
                ${escapeHtml(
                  id
                )}
              </small>

            </div>

          </div>

          <div>

            <button
              data-control-act
              class="primary"
            >
              🎭 Действовать от имени
            </button>

          </div>

        </header>

        <nav class="to-admin-participant-tabs">

          <button data-control-tab="profile">
            🪪 Профиль
          </button>

          <button data-control-tab="publications">
            📰 Публикации
          </button>

          <button data-control-tab="messages">
            💬 Сообщения
          </button>

          <button data-control-tab="comments">
            💬 Комментарии
          </button>

          <button data-control-tab="reactions">
            ❤️ Реакции
          </button>

          <button data-control-tab="reviews">
            ⭐ Отзывы
          </button>

          <button data-control-tab="saved">
            🔖 Сохранённое
          </button>

          <button data-control-tab="subscriptions">
            👥 Подписки
          </button>

          <button data-control-tab="notifications">
            🔔 Уведомления
          </button>

          <button data-control-tab="services">
            👑 Services
          </button>

          <button data-control-tab="level">
            🏆 Level
          </button>

          <button data-control-tab="permissions">
            🔐 Права
          </button>

          <button data-control-tab="blocks">
            ⛔ Блокировки
          </button>

          <button data-control-tab="activity">
            🛰️ Активность
          </button>

          <button data-control-tab="history">
            📜 История
          </button>

          <button data-control-tab="security">
            🔒 Безопасность
          </button>

        </nav>

        <div
          class="to-admin-participant-tab-content"
          data-control-content
        >
          ${renderParticipantOverview(
            participant
          )}
        </div>

      </div>
    `;
  }

  function renderParticipantOverview(
    participant
  ) {
    return `
      <div class="to-admin-profile-overview">

        ${statCard(
          "🏆",
          "TO Level",
          "Lv." +
            (
              participant.level ??
              0
            )
        )}

        ${statCard(
          "⭐",
          "Service",
          participant.service ||
            "FREE"
        )}

        ${statCard(
          "📰",
          "Публикации",
          participant.publications_count ??
            0
        )}

        ${statCard(
          "💬",
          "Комментарии",
          participant.comments_count ??
            0
        )}

        ${statCard(
          "❤️",
          "Реакции",
          participant.reactions_count ??
            0
        )}

        ${statCard(
          "👁️",
          "Просмотры",
          participant.views_count ??
            0
        )}

        ${statCard(
          "🚩",
          "Жалобы",
          participant.reports_count ??
            0
        )}

        ${statCard(
          "🕐",
          "Последний визит",
          participant.last_seen ||
            "—"
        )}

      </div>

      <div class="to-admin-profile-actions">

        <button data-control-action="edit">
          ✏️ Изменить профиль
        </button>

        <button data-control-action="level">
          🏆 Изменить Level
        </button>

        <button data-control-action="service">
          👑 Управлять услугами
        </button>

        <button data-control-action="permissions">
          🔐 Управлять правами
        </button>

        <button data-control-action="notifications">
          🔔 Настройки уведомлений
        </button>

        <button data-control-action="block">
          ⛔ Блокировки
        </button>

      </div>
    `;
  }

  function bindParticipantControlCenter(
    participantId
  ) {
    const modal =
      document.querySelector(
        ".to-admin-modal"
      );

    if (!modal) {
      return;
    }

    modal
      .querySelector(
        "[data-control-act]"
      )
      ?.addEventListener(
        "click",
        async function () {
          await startActingAsParticipant(
            participantId
          );

          closeModal();
        }
      );

    modal
      .querySelectorAll(
        "[data-control-tab]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            async function () {
              await loadParticipantControlTab(
                participantId,
                button.dataset.controlTab,
                modal.querySelector(
                  "[data-control-content]"
                )
              );
            }
          );
        }
      );

    modal
      .querySelectorAll(
        "[data-control-action]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              handleParticipantControlAction(
                participantId,
                button.dataset.controlAction
              );
            }
          );
        }
      );
  }

  async function loadParticipantControlTab(
    participantId,
    tab,
    container
  ) {
    if (!container) {
      return;
    }

    container.innerHTML =
      "⏳ Загрузка...";

    try {
      let data;

      switch (
        tab
      ) {
        case "publications":
          data =
            await listPublications({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                data?.publications ||
                []
            );
          break;

        case "comments":
          data =
            await listComments({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "reviews":
          data =
            await listReviews({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "reactions":
          data =
            await listReactions({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "activity":
          data =
            await getParticipantActivity(
              participantId
            );
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "permissions":
          data =
            await getPermissions(
              participantId
            );
          container.innerHTML =
            renderPermissionsObject(
              data
            );
          break;

        case "services":
          data =
            await getParticipantServices(
              participantId
            );
          container.innerHTML =
            renderServicesObject(
              data
            );
          break;

        case "notifications":
          data =
            await listNotifications({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "security":
          data =
            await loadSecurity({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "history":
          data =
            await listAudit({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "saved":
          data =
            await listBookmarks({
              participant_id:
                participantId
            });
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "subscriptions":
          data =
            await list(
              CONFIG.api.participants +
                "/" +
                encodeURIComponent(
                  participantId
                ) +
                "/subscriptions"
            );
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "messages":
          data =
            await listMessages(
              null,
              {
                participant_id:
                  participantId
              }
            );
          container.innerHTML =
            renderGenericItems(
              data?.items ||
                []
            );
          break;

        case "level":
          data =
            await get(
              CONFIG.api.levels,
              participantId
            );
          container.innerHTML =
            renderLevelObject(
              data
            );
          break;

        default:
          data =
            await getParticipant(
              participantId
            );

          container.innerHTML =
            renderParticipantOverview(
              data?.participant ||
                data?.profile ||
                data
            );
      }
    } catch (error) {
      container.innerHTML =
        `
          <div class="to-admin-error">
            ${escapeHtml(
              error.message
            )}
          </div>
        `;
    }
  }

  function renderGenericItems(
    items
  ) {
    if (
      !Array.isArray(
        items
      ) ||
      !items.length
    ) {
      return emptyState(
        "Нет данных."
      );
    }

    return `
      <div class="to-admin-generic-list">

        ${items
          .map(
            function (item) {
              return `
                <article>

                  <strong>
                    ${escapeHtml(
                      item.title ||
                      item.name ||
                      item.username ||
                      item.action ||
                      item.type ||
                      "Объект"
                    )}
                  </strong>

                  <p>
                    ${escapeHtml(
                      item.text ||
                      item.description ||
                      item.reason ||
                      ""
                    )}
                  </p>

                  <small>
                    ${escapeHtml(
                      item.id ||
                      item.created_at ||
                      item.updated_at ||
                      ""
                    )}
                  </small>

                </article>
              `;
            }
          )
          .join("")}

      </div>
    `;
  }

  function renderPermissionsObject(
    data
  ) {
    const permissions =
      data?.permissions ||
      data ||
      {};

    return `
      <div class="to-admin-permissions-grid">

        ${Object.entries(
          permissions
        )
          .map(
            function ([
              key,
              value
            ]) {
              return `
                <div>

                  <code>
                    ${escapeHtml(
                      key
                    )}
                  </code>

                  <strong>
                    ${escapeHtml(
                      typeof value ===
                        "object"
                        ? JSON.stringify(
                            value
                          )
                        : String(
                            value
                          )
                    )}
                  </strong>

                </div>
              `;
            }
          )
          .join("")}

      </div>
    `;
  }

  function renderServicesObject(
    data
  ) {
    return renderGenericItems(
      Array.isArray(
        data
      )
        ? data
        : data?.services ||
          []
    );
  }

  function renderLevelObject(
    data
  ) {
    const profile =
      data?.profile ||
      data ||
      {};

    return `
      <div class="to-admin-level-control">

        <h3>
          🏆 TO Level
        </h3>

        <div class="to-admin-level-current">
          Lv.${escapeHtml(
            profile.level ??
            0
          )}
        </div>

        <p>
          Automatic:
          Lv.${escapeHtml(
            profile.automaticLevel ??
            0
          )}
        </p>

        <p>
          XP:
          ${escapeHtml(
            profile.xp ??
            0
          )}
        </p>

        <p>
          Mode:
          ${escapeHtml(
            profile.mode ||
            "hybrid"
          )}
        </p>

      </div>
    `;
  }

  function handleParticipantControlAction(
    participantId,
    actionName
  ) {
    switch (
      actionName
    ) {
      case "edit":
        openProfileEditor(
          participantId
        );
        break;

      case "level":
        openLevelEditor(
          participantId
        );
        break;

      case "service":
        openServiceEditor(
          participantId
        );
        break;

      case "permissions":
        openPermissionEditor(
          participantId
        );
        break;

      case "notifications":
        openNotificationEditor(
          participantId
        );
        break;

      case "block":
        openBlockEditor(
          participantId
        );
        break;

      default:
        break;
    }
  }

  /* ============================================================
     PROFILE EDITOR
     ============================================================ */

  function openProfileEditor(
    participantId
  ) {
    openModal(
      "profile-editor",
      `
        <div>

          <h2>
            ✏️ Полное редактирование профиля
          </h2>

          <label>
            Имя
            <input
              data-profile-name
              type="text"
            >
          </label>

          <label>
            Username
            <input
              data-profile-username
              type="text"
            >
          </label>

          <label>
            Avatar URL
            <input
              data-profile-avatar
              type="url"
            >
          </label>

          <label>
            Статус
            <input
              data-profile-status
              type="text"
            >
          </label>

          <label>
            Bio
            <textarea
              data-profile-bio
            ></textarea>
          </label>

          <button
            type="button"
            data-profile-save
            class="primary"
          >
            Сохранить
          </button>

        </div>
      `
    );

    document
      .querySelector(
        "[data-profile-save]"
      )
      ?.addEventListener(
        "click",
        async function () {
          await updateProfile(
            participantId,
            {
              name:
                document.querySelector(
                  "[data-profile-name]"
                )?.value,

              username:
                document.querySelector(
                  "[data-profile-username]"
                )?.value,

              avatar:
                document.querySelector(
                  "[data-profile-avatar]"
                )?.value,

              status:
                document.querySelector(
                  "[data-profile-status]"
                )?.value,

              bio:
                document.querySelector(
                  "[data-profile-bio]"
                )?.value
            }
          );

          closeModal();
        }
      );
  }

  /* ============================================================
     LEVEL EDITOR
     ============================================================ */

  function openLevelEditor(
    participantId
  ) {
    openModal(
      "level-editor",
      `
        <div>

          <h2>
            🏆 Управление TO Level
          </h2>

          <label>
            Уровень
            <select
              data-admin-level
            >
              ${Array.from(
                {
                  length: 13
                },
                function (
                  _,
                  index
                ) {
                  return `
                    <option value="${index}">
                      Lv.${index}
                      ${
                        index === 0
                          ? " — скрыт"
                          : ""
                      }
                    </option>
                  `;
                }
              ).join("")}
            </select>
          </label>

          <label>
            Режим
            <select
              data-admin-level-mode
            >
              <option value="manual">
                Manual
              </option>

              <option value="hybrid">
                Hybrid
              </option>

              <option value="automatic">
                Automatic
              </option>
            </select>
          </label>

          <label>
            Причина
            <textarea
              data-admin-level-reason
            ></textarea>
          </label>

          <button
            type="button"
            data-admin-level-save
            class="primary"
          >
            👑 Назначить
          </button>

        </div>
      `
    );

    document
      .querySelector(
        "[data-admin-level-save]"
      )
      ?.addEventListener(
        "click",
        async function () {
          const level =
            Number(
              document.querySelector(
                "[data-admin-level]"
              )?.value
            );

          await setParticipantLevel(
            participantId,
            level,
            {
              mode:
                document.querySelector(
                  "[data-admin-level-mode]"
                )?.value,

              reason:
                document.querySelector(
                  "[data-admin-level-reason]"
                )?.value
            }
          );

          closeModal();
        }
      );
  }

  /* ============================================================
     SERVICE EDITOR
     ============================================================ */

  function openServiceEditor(
    participantId
  ) {
    openModal(
      "service-editor",
      `
        <div>

          <h2>
            👑 Управление услугами
          </h2>

          <div class="to-admin-service-grid">

            ${SERVICES
              .map(
                function (
                  service
                ) {
                  return `
                    <button
                      type="button"
                      data-service="${escapeHtml(
                        service.id
                      )}"
                    >
                      ${service.icon}
                      ${escapeHtml(
                        service.title
                      )}
                    </button>
                  `;
                }
              )
              .join("")}

          </div>

          <label>
            Цена
            <input
              type="number"
              data-service-price
              min="0"
              step="0.01"
            >
          </label>

          <label>
            Начало
            <input
              type="datetime-local"
              data-service-start
            >
          </label>

          <label>
            Окончание
            <input
              type="datetime-local"
              data-service-end
            >
          </label>

          <label>
            <input
              type="checkbox"
              data-service-unlimited
            >
            Без срока
          </label>

          <button
            type="button"
            data-service-grant
            class="primary"
          >
            Выдать
          </button>

        </div>
      `
    );

    let selected =
      "free";

    document
      .querySelectorAll(
        "[data-service]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              selected =
                button.dataset.service;

              document
                .querySelectorAll(
                  "[data-service]"
                )
                .forEach(
                  function (
                    item
                  ) {
                    item.classList.toggle(
                      "is-selected",
                      item ===
                        button
                    );
                  }
                );
            }
          );
        }
      );

    document
      .querySelector(
        "[data-service-grant]"
      )
      ?.addEventListener(
        "click",
        async function () {
          await grantService(
            participantId,
            selected,
            {
              price:
                Number(
                  document.querySelector(
                    "[data-service-price]"
                  )?.value ||
                    0
                ),

              startsAt:
                document.querySelector(
                  "[data-service-start]"
                )?.value ||
                null,

              endsAt:
                document.querySelector(
                  "[data-service-end]"
                )?.value ||
                null,

              unlimited:
                document.querySelector(
                  "[data-service-unlimited]"
                )?.checked
            }
          );

          closeModal();
        }
      );
  }

  /* ============================================================
     PERMISSION EDITOR
     ============================================================ */

  function openPermissionEditor(
    participantId
  ) {
    openModal(
      "permission-editor",
      `
        <div>

          <h2>
            🔐 Индивидуальные права
          </h2>

          <p>
            Inherit / Allow / Deny
          </p>

          <textarea
            data-permission-json
            rows="18"
            placeholder='{"publications.create":"allow"}'
          ></textarea>

          <button
            type="button"
            data-permission-save
            class="primary"
          >
            Сохранить права
          </button>

        </div>
      `
    );

    document
      .querySelector(
        "[data-permission-save]"
      )
      ?.addEventListener(
        "click",
        async function () {
          const raw =
            document.querySelector(
              "[data-permission-json]"
            )?.value ||
            "{}";

          let permissions;

          try {
            permissions =
              JSON.parse(
                raw
              );
          } catch {
            showToast(
              "Неверный JSON.",
              "error"
            );

            return;
          }

          await setPermissions(
            participantId,
            permissions
          );

          closeModal();
        }
      );
  }

  /* ============================================================
     NOTIFICATION EDITOR
     ============================================================ */

  function openNotificationEditor(
    participantId
  ) {
    openModal(
      "notification-editor",
      `
        <div>

          <h2>
            🔔 Уведомления участника
          </h2>

          <p>
            Можно отдельно управлять каждой категорией и каналом.
          </p>

          <textarea
            data-notification-json
            rows="20"
            placeholder='{"comments":{"enabled":true}}'
          ></textarea>

          <button
            type="button"
            data-notification-save
            class="primary"
          >
            Сохранить
          </button>

        </div>
      `
    );

    document
      .querySelector(
        "[data-notification-save]"
      )
      ?.addEventListener(
        "click",
        async function () {
          const raw =
            document.querySelector(
              "[data-notification-json]"
            )?.value ||
            "{}";

          let settings;

          try {
            settings =
              JSON.parse(
                raw
              );
          } catch {
            showToast(
              "Неверный JSON.",
              "error"
            );

            return;
          }

          await setParticipantNotificationSettings(
            participantId,
            settings
          );

          closeModal();
        }
      );
  }

  /* ============================================================
     BLOCK EDITOR
     ============================================================ */

  function openBlockEditor(
    participantId
  ) {
    openModal(
      "block-editor",
      `
        <div>

          <h2>
            ⛔ Управление блокировкой
          </h2>

          <label>
            Область
            <select
              data-block-scope
            >
              <option value="full">
                Полная блокировка
              </option>

              <option value="publications">
                Публикации
              </option>

              <option value="chat">
                Чат
              </option>

              <option value="comments">
                Комментарии
              </option>

              <option value="media">
                Медиа
              </option>

              <option value="premium">
                Premium / VIP
              </option>
            </select>
          </label>

          <label>
            Причина
            <textarea
              data-block-reason
            ></textarea>
          </label>

          <label>
            До
            <input
              type="datetime-local"
              data-block-end
            >
          </label>

          <label>
            <input
              type="checkbox"
              data-block-permanent
            >
            Навсегда
          </label>

          <button
            type="button"
            data-block-save
            class="danger"
          >
            Заблокировать
          </button>

          <button
            type="button"
            data-unblock
          >
            Разблокировать
          </button>

        </div>
      `
    );

    document
      .querySelector(
        "[data-block-save]"
      )
      ?.addEventListener(
        "click",
        async function () {
          await blockParticipant(
            participantId,
            {
              scope:
                document.querySelector(
                  "[data-block-scope]"
                )?.value,

              reason:
                document.querySelector(
                  "[data-block-reason]"
                )?.value,

              endsAt:
                document.querySelector(
                  "[data-block-end]"
                )?.value ||
                null,

              permanent:
                document.querySelector(
                  "[data-block-permanent]"
                )?.checked
            }
          );

          closeModal();
        }
      );

    document
      .querySelector(
        "[data-unblock]"
      )
      ?.addEventListener(
        "click",
        async function () {
          await unblockParticipant(
            participantId
          );

          closeModal();
        }
      );
  }

  /* ============================================================
     SIMPLE SECTION RENDERERS
     ============================================================ */

  async function renderProfiles(
    container
  ) {
    renderEntitySection(
      container,
      "Профили",
      "Управление профилями, аватарами, именами, username и презентацией.",
      CONFIG.api.profiles
    );
  }

  async function renderPublications(
    container
  ) {
    renderEntitySection(
      container,
      "Публикации",
      "Полная модерация и редактирование публикаций.",
      CONFIG.api.publications
    );
  }

  async function renderComments(
    container
  ) {
    renderEntitySection(
      container,
      "Комментарии",
      "Модерация, редактирование, ответы и реакции.",
      CONFIG.api.comments
    );
  }

  async function renderReviews(
    container
  ) {
    renderEntitySection(
      container,
      "Отзывы",
      "Отзывы, оценки 1–5, ответы, реакции и модерация.",
      CONFIG.api.reviews
    );
  }

  async function renderReactions(
    container
  ) {
    renderEntitySection(
      container,
      "Реакции",
      "Полное управление реакциями и их статистикой.",
      CONFIG.api.reactions
    );
  }

  async function renderShares(
    container
  ) {
    renderEntitySection(
      container,
      "Поделиться",
      "История распространения публикаций и статистика shares.",
      CONFIG.api.shares
    );
  }

  async function renderReports(
    container
  ) {
    renderEntitySection(
      container,
      "Жалобы",
      "Приватные жалобы участников и центр их обработки.",
      CONFIG.api.reports
    );
  }

  async function renderChats(
    container
  ) {
    renderEntitySection(
      container,
      "Чаты",
      "Личные чаты, официальный system chat и управление диалогами.",
      CONFIG.api.conversations
    );
  }

  async function renderMessages(
    container
  ) {
    renderEntitySection(
      container,
      "Сообщения",
      "Текст, медиа, редактирование, удаление, реакции и управление сообщениями.",
      CONFIG.api.messages
    );
  }

  async function renderNotifications(
    container
  ) {
    renderEntitySection(
      container,
      "Уведомления",
      "Глобальные, персональные и принудительные уведомления.",
      CONFIG.api.notifications
    );
  }

  async function renderPayments(
    container
  ) {
    renderEntitySection(
      container,
      "Платежи",
      "Ручное подтверждение, отклонение и управление платежами.",
      CONFIG.api.payments
    );
  }

  async function renderServices(
    container
  ) {
    renderEntitySection(
      container,
      "Premium / PRO / TOP / VIP",
      "Услуги, сроки, цены и индивидуальные права.",
      CONFIG.api.services
    );
  }

  async function renderLevels(
    container
  ) {
    renderEntitySection(
      container,
      "TO Levels",
      "Lv.0–Lv.12, XP, автоматический и ручной режим.",
      CONFIG.api.levels
    );
  }

  async function renderAchievements(
    container
  ) {
    renderEntitySection(
      container,
      "Достижения",
      "Бейджи, достижения и награды.",
      CONFIG.api.achievements
    );
  }

  async function renderPermissions(
    container
  ) {
    renderEntitySection(
      container,
      "Права",
      "Индивидуальные права участников и системные разрешения.",
      CONFIG.api.permissions
    );
  }

  async function renderBlocks(
    container
  ) {
    renderEntitySection(
      container,
      "Блокировки",
      "Полные и частичные ограничения.",
      CONFIG.api.blocks
    );
  }

  async function renderActivity(
    container
  ) {
    renderEntitySection(
      container,
      "Активность",
      "Online, last seen, техническая активность и история действий.",
      CONFIG.api.activity
    );
  }

  async function renderModeration(
    container
  ) {
    renderEntitySection(
      container,
      "Модерация",
      "Единый центр обработки контента и нарушений.",
      CONFIG.api.moderation
    );
  }

  async function renderAnalytics(
    container
  ) {
    renderEntitySection(
      container,
      "Аналитика",
      "Глубокая статистика платформы.",
      CONFIG.api.analytics
    );
  }

  async function renderMetrics(
    container
  ) {
    renderEntitySection(
      container,
      "Метрики",
      "Ручное и автоматическое управление счетчиками.",
      CONFIG.api.metrics
    );
  }

  async function renderCategories(
    container
  ) {
    renderEntitySection(
      container,
      "Категории",
      "Категории возможностей и публикаций.",
      CONFIG.api.categories
    );
  }

  async function renderTags(
    container
  ) {
    renderEntitySection(
      container,
      "Теги и статусы",
      "Собственные статусы, теги, значки и оформление.",
      CONFIG.api.tags
    );
  }

  async function renderMedia(
    container
  ) {
    renderEntitySection(
      container,
      "Медиа",
      "Фото, видео, документы, аудио и файлы.",
      CONFIG.api.media
    );
  }

  async function renderBackgrounds(
    container
  ) {
    renderEntitySection(
      container,
      "Фоны",
      "Управление фонами публикаций и профилей.",
      CONFIG.api.backgrounds
    );
  }

  async function renderFonts(
    container
  ) {
    renderEntitySection(
      container,
      "Шрифты",
      "Управление шрифтами и стилями.",
      CONFIG.api.fonts
    );
  }

  async function renderFeatureFlags(
    container
  ) {
    renderEntitySection(
      container,
      "Feature Flags",
      "Включение функций глобально, по категории, публикации или участнику.",
      CONFIG.api.featureFlags
    );
  }

  async function renderSettings(
    container
  ) {
    renderEntitySection(
      container,
      "Настройки системы",
      "Все глобальные настройки платформы.",
      CONFIG.api.settings
    );
  }

  async function renderSecurity(
    container
  ) {
    renderEntitySection(
      container,
      "Безопасность",
      "Сессии, подозрительная активность, безопасность и доступ.",
      CONFIG.api.security
    );
  }

  async function renderAdmins(
    container
  ) {
    renderEntitySection(
      container,
      "Администраторы",
      "Управление административными аккаунтами.",
      CONFIG.api.admins
    );
  }

  async function renderRoles(
    container
  ) {
    renderEntitySection(
      container,
      "Роли",
      "Роли и наборы разрешений.",
      CONFIG.api.roles
    );
  }

  async function renderAudit(
    container
  ) {
    renderEntitySection(
      container,
      "Audit Log",
      "Полная история административных действий.",
      CONFIG.api.audit
    );
  }

  async function renderBackup(
    container
  ) {
    renderEntitySection(
      container,
      "Backup / Restore",
      "Резервные копии и восстановление.",
      CONFIG.api.backup
    );
  }

  async function renderMaintenance(
    container
  ) {
    renderEntitySection(
      container,
      "Maintenance",
      "Аварийный и плановый режим обслуживания.",
      CONFIG.api.maintenance
    );
  }

  async function renderSystem(
    container
  ) {
    renderEntitySection(
      container,
      "Система",
      "Технический контроль всей платформы.",
      CONFIG.api.system
    );
  }

  /* ============================================================
     GENERIC ENTITY SECTION
     ============================================================ */

  async function renderEntitySection(
    container,
    title,
    description,
    endpoint
  ) {
    container.innerHTML =
      sectionHeader(
        title,
        description
      ) +
      card(
        null,
        "⏳ Загрузка..."
      );

    try {
      const data =
        await list(
          endpoint,
          {
            page:
              1,

            limit:
              CONFIG.pagination.defaultLimit
          }
        );

      const items =
        data?.items ||
        data?.results ||
        data?.data ||
        [];

      container.innerHTML =
        sectionHeader(
          title,
          description
        ) +

        toolbar(
          `
            <button
              data-entity-refresh
            >
              🔄 Обновить
            </button>

            <button
              data-entity-export
            >
              📤 Экспорт
            </button>

            ${
              state.isSuperAdmin
                ? `
                  <button
                    data-entity-create
                    class="primary"
                  >
                    ＋ Создать
                  </button>
                `
                : ""
            }
          `
        ) +

        card(
          "Данные",
          items.length
            ? renderGenericItems(
                items
              )
            : emptyState(
                "Нет объектов."
              )
        );

      container
        .querySelector(
          "[data-entity-refresh]"
        )
        ?.addEventListener(
          "click",
          function () {
            renderEntitySection(
              container,
              title,
              description,
              endpoint
            );
          }
        );

      container
        .querySelector(
          "[data-entity-export]"
        )
        ?.addEventListener(
          "click",
          async function () {
            try {
              const data =
                await action(
                  endpoint +
                    "/export",
                  {
                    filters:
                      state.filters[
                        title
                      ] ||
                      {},

                    audit:
                      createAuditContext(
                        title +
                          ".export"
                      )
                  }
                );

              showToast(
                data?.message ||
                  "Экспорт запущен.",
                "success"
              );
            } catch (error) {
              showToast(
                error.message,
                "error"
              );
            }
          }
        );

      container
        .querySelector(
          "[data-entity-create]"
        )
        ?.addEventListener(
          "click",
          function () {
            openGenericCreate(
              endpoint,
              title
            );
          }
        );
    } catch (error) {
      renderError(
        container,
        error
      );
    }
  }

  function openGenericCreate(
    endpoint,
    title
  ) {
    openModal(
      "generic-create",
      `
        <div>

          <h2>
            ＋ Создать: ${escapeHtml(
              title
            )}
          </h2>

          <textarea
            data-generic-json
            rows="20"
            placeholder="JSON"
          >{}</textarea>

          <button
            type="button"
            data-generic-save
            class="primary"
          >
            Создать
          </button>

        </div>
      `
    );

    document
      .querySelector(
        "[data-generic-save]"
      )
      ?.addEventListener(
        "click",
        async function () {
          const raw =
            document.querySelector(
              "[data-generic-json]"
            )?.value ||
            "{}";

          let payload;

          try {
            payload =
              JSON.parse(
                raw
              );
          } catch {
            showToast(
              "Неверный JSON.",
              "error"
            );

            return;
          }

          await create(
            endpoint,
            {
              ...payload,

              audit:
                createAuditContext(
                  "generic.create"
                )
            }
          );

          closeModal();

          renderAdmin();
        }
      );
  }

  /* ============================================================
     MODAL
     ============================================================ */

  function openModal(
    id,
    html
  ) {
    closeModal();

    const root =
      document.querySelector(
        "[data-admin-modal-root]"
      ) ||
      document.body;

    const overlay =
      document.createElement(
        "div"
      );

    overlay.className =
      "to-admin-modal-overlay";

    overlay.innerHTML = `
      <div
        class="to-admin-modal"
        data-modal-id="${escapeHtml(
          id
        )}"
      >

        <button
          type="button"
          class="to-admin-modal-close"
          data-modal-close
        >
          ×
        </button>

        <div class="to-admin-modal-content">
          ${
            html ||
            ""
          }
        </div>

      </div>
    `;

    root.appendChild(
      overlay
    );

    state.modal =
      overlay;

    overlay
      .querySelector(
        "[data-modal-close]"
      )
      ?.addEventListener(
        "click",
        closeModal
      );

    overlay.addEventListener(
      "click",
      function (event) {
        if (
          event.target ===
          overlay
        ) {
          closeModal();
        }
      }
    );

    document.addEventListener(
      "keydown",
      modalEscapeHandler
    );

    return overlay;
  }

  function modalEscapeHandler(
    event
  ) {
    if (
      event.key ===
      "Escape"
    ) {
      closeModal();
    }
  }

  function closeModal() {
    if (
      state.modal
    ) {
      state.modal.remove();
      state.modal =
        null;
    }

    document.removeEventListener(
      "keydown",
      modalEscapeHandler
    );
  }

  /* ============================================================
     TOAST
     ============================================================ */

  function showToast(
    message,
    type
  ) {
    const root =
      document.querySelector(
        "[data-admin-toast-root]"
      ) ||
      document.body;

    const toast =
      document.createElement(
        "div"
      );

    toast.className =
      "to-admin-toast " +
      (
        type ||
        "info"
      );

    toast.textContent =
      message ||
      "";

    root.appendChild(
      toast
    );

    window.setTimeout(
      function () {
        toast.classList.add(
          "is-closing"
        );

        window.setTimeout(
          function () {
            toast.remove();
          },
          300
        );
      },
      4500
    );
  }

  function renderError(
    container,
    error
  ) {
    container.innerHTML =
      sectionHeader(
        "Ошибка",
        "Не удалось загрузить раздел."
      ) +
      card(
        null,
        `
          <div class="to-admin-error">

            <strong>
              ${escapeHtml(
                error?.message ||
                "Неизвестная ошибка."
              )}
            </strong>

            ${
              error?.status
                ? `
                  <small>
                    HTTP ${escapeHtml(
                      error.status
                    )}
                  </small>
                `
                : ""
            }

          </div>
        `
      );
  }

  /* ============================================================
     ACTING BANNER
     ============================================================ */

  function renderActingBanner() {
    const header =
      document.querySelector(
        "[data-admin-header]"
      );

    if (
      header
    ) {
      renderHeader(
        header
      );
    }
  }

  /* ============================================================
     PARTICIPANT CHAT
     ============================================================ */

  function openParticipantChat(
    participantId
  ) {
    if (
      window.TOChatUI &&
      typeof window.TOChatUI.openPrivateChat ===
        "function"
    ) {
      window.TOChatUI.openPrivateChat(
        participantId
      );

      return;
    }

    if (
      window.ChatUI &&
      typeof window.ChatUI.openPrivateChat ===
        "function"
    ) {
      window.ChatUI.openPrivateChat(
        participantId
      );

      return;
    }

    openSection(
      "chats"
    );
  }

  /* ============================================================
     ADMIN PROFILE
     ============================================================ */

  function openAdminProfile() {
    openModal(
      "admin-profile",
      `
        <div>

          <h2>
            👑 Администратор
          </h2>

          <p>
            ${escapeHtml(
              state.admin?.name ||
              "SUPER ADMIN"
            )}
          </p>

          <p>
            Role:
            ${escapeHtml(
              state.role ||
              "superadmin"
            )}
          </p>

          <p>
            Admin ID:
            ${escapeHtml(
              state.admin?.id ||
              "—"
            )}
          </p>

        </div>
      `
    );
  }

  /* ============================================================
     AUTO REFRESH / UNREAD
     ============================================================ */

  async function refreshUnread() {
    try {
      const data =
        await request(
          CONFIG.api.dashboard +
            "/unread",
          {
            method:
              "GET"
          }
        );

      state.unread =
        data?.unread ||
        data ||
        {};

      emit(
        "unread-updated",
        state.unread
      );

      renderNavigation(
        document.querySelector(
          "[data-admin-navigation]"
        )
      );

      renderHeader(
        document.querySelector(
          "[data-admin-header]"
        )
      );
    } catch {
      /* unread не должен ломать админку */
    }
  }

  let refreshTimer =
    null;

  function startAutoRefresh() {
    window.clearInterval(
      refreshTimer
    );

    refreshTimer =
      window.setInterval(
        function () {
          refreshUnread();
        },
        30000
      );
  }

  /* ============================================================
     GLOBAL ADMIN EVENTS
     ============================================================ */

  document.addEventListener(
    "to:notifications:unread-changed",
    function () {
      refreshUnread();
    }
  );

  document.addEventListener(
    "to:chat:unread-changed",
    function () {
      refreshUnread();
    }
  );

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  async function init(
    options
  ) {
    if (
      state.initialized
    ) {
      return API;
    }

    const opts =
      options || {};

    restoreLocalState();

    if (
      opts.admin
    ) {
      state.admin =
        opts.admin;
    }

    if (
      opts.permissions
    ) {
      state.permissions =
        opts.permissions;
    }

    if (
      opts.role
    ) {
      state.role =
        opts.role;
    }

    if (
      opts.isSuperAdmin !==
      undefined
    ) {
      state.isSuperAdmin =
        Boolean(
          opts.isSuperAdmin
        );
    }

    try {
      await loadAdminSession();
    } catch {
      /*
       * Не показываем фиктивные права.
       * Сервер остаётся источником истины.
       */
    }

    state.initialized =
      true;

    renderAdmin();

    startAutoRefresh();

    emit(
      "initialized"
    );

    return API;
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  const API = {
    CONFIG,
    SECTIONS,
    SERVICES,
    state,

    on,

    init,

    request,
    list,
    get,
    create,
    update,
    remove,
    action,

    can,
    isDangerous,

    openSection,
    renderAdmin,

    loadAdminSession,
    loadDashboard,

    superSearch,

    listParticipants,
    getParticipant,
    updateParticipant,
    updateProfile,
    updateUsername,
    updateAvatar,

    listPublications,
    getPublication,
    updatePublication,
    moderatePublication,
    setPublicationMetrics,
    setPublicationType,
    setPublicationExpiration,
    setPublicationPosition,

    listComments,
    updateComment,
    deleteComment,

    listReviews,
    updateReview,
    moderateReview,
    setReviewMetrics,

    listReactions,
    createReactionAsParticipant,
    deleteReaction,

    listShares,
    listBookmarks,
    listViews,
    setShareMetrics,

    listReports,
    updateReport,
    resolveReport,

    listConversations,
    getConversation,
    listMessages,
    sendMessageAsParticipant,
    editMessage,
    deleteMessage,

    listNotifications,
    createNotification,
    sendSystemNotification,
    setParticipantNotificationSettings,

    listPayments,
    confirmPayment,
    rejectPayment,

    getParticipantServices,
    grantService,
    revokeService,
    setServicePrice,

    setParticipantLevel,
    resetParticipantLevel,
    saveLevelSettings,

    getPermissions,
    setPermission,
    setPermissions,

    blockParticipant,
    unblockParticipant,

    getActingContext,
    startActingAsParticipant,
    stopActingAsParticipant,
    switchActingParticipant,

    createCommentAsParticipant,
    createReviewAsParticipant,
    createPublicationAsParticipant,

    listActivity,
    getParticipantActivity,

    loadModerationQueue,
    bulkModeration,

    loadAnalytics,
    loadMetrics,
    updateMetrics,

    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    listTags,
    createTag,
    updateTag,

    listMedia,
    deleteMedia,

    listBackgrounds,
    updateBackground,

    listFonts,
    updateFont,

    listFeatureFlags,
    setFeatureFlag,

    getSystemSettings,
    setSystemSetting,
    emergencyToggle,

    loadSecurity,
    revokeSession,

    listAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,

    listRoles,
    updateRole,

    listAudit,
    exportAudit,

    createBackup,
    listBackups,
    restoreBackup,

    getMaintenance,
    setMaintenance,

    confirmAction,
    executeDangerous,

    openModal,
    closeModal,

    showToast,

    refreshUnread
  };

  /* ============================================================
     GLOBAL NAMES
     ============================================================ */

  window.TOAdmin =
    API;

  window.Admin =
    API;

  window.TajikOpportunitiesAdmin =
    API;

  /* ============================================================
     DOM READY
     ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      const root =
        getRoot();

      const shouldAutoInit =
        Boolean(
          root ||
          document.querySelector(
            "[data-admin-page]"
          ) ||
          document.body.dataset.admin ===
            "true"
        );

      if (
        shouldAutoInit
      ) {
        init().catch(
          function (error) {
            console.error(
              "[TO Admin] initialization error:",
              error
            );
          }
        );
      }
    }
  );

})(window, document);
