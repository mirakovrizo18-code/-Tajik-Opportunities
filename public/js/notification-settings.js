/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   NOTIFICATION SETTINGS
   File: public/js/notification-settings.js
   Version: 2026.09.09 POWER NOTIFICATION SETTINGS

   СИСТЕМА НАСТРОЕК УВЕДОМЛЕНИЙ
   ------------------------------------------------------------
   • Глобальные настройки
   • Настройки конкретного участника
   • Настройки администратора
   • Наследование
   • Allow / Deny / Inherit
   • Категории уведомлений
   • Отдельные типы событий
   • Push
   • In-App
   • Badge
   • Sound
   • Vibration
   • Email
   • System Chat
   • История уведомлений
   • Приоритет
   • Мгновенная доставка
   • Группировка
   • Тихие уведомления
   • Принудительно включённые уведомления
   • Принудительно отключённые уведомления
   • Временные настройки
   • Постоянные настройки
   • Настройки конкретного участника
   • Поиск участника
   • Сброс настроек
   • Предпросмотр уведомлений
   • Проверка Push
   • Управление разрешением браузера
   • Массовое изменение
   • Audit hooks
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIG
     ========================================================== */

  const CONFIG = {
    API: {
      SETTINGS: "/api/notifications/settings",
      GLOBAL: "/api/notifications/settings/global",
      USER: "/api/notifications/settings/user",
      PREVIEW: "/api/notifications/settings/preview",
      TEST_PUSH: "/api/notifications/settings/test-push",
      RESET: "/api/notifications/settings/reset",
      HISTORY: "/api/notifications/settings/history"
    },

    STORAGE: {
      MODE: "to_notification_settings_mode",
      USER_ID: "to_notification_settings_user",
      LOCAL_CACHE: "to_notification_settings_cache"
    },

    MODES: {
      PARTICIPANT: "participant",
      ADMIN: "admin"
    },

    VALUES: {
      INHERIT: "inherit",
      ALLOW: "allow",
      DENY: "deny"
    },

    DELIVERY: [
      "in_app",
      "push",
      "badge",
      "sound",
      "vibration",
      "email",
      "system_chat"
    ],

    POLL_INTERVAL: 30000,

    DEBOUNCE: 350
  };

  /* ==========================================================
     CATEGORIES
     ========================================================== */

  const CATEGORIES = {
    comments: {
      id: "comments",
      icon: "💬",
      title: "Комментарии",
      description:
        "Уведомления о комментариях к вашим публикациям."
    },

    comment_replies: {
      id: "comment_replies",
      icon: "↩️",
      title: "Ответы",
      description:
        "Ответы на ваши комментарии."
    },

    mentions: {
      id: "mentions",
      icon: "@",
      title: "Упоминания",
      description:
        "Когда вас упоминают в публикации, комментарии или чате."
    },

    reactions: {
      id: "reactions",
      icon: "❤️",
      title: "Реакции",
      description:
        "Реакции на ваши публикации и комментарии."
    },

    reviews: {
      id: "reviews",
      icon: "⭐",
      title: "Отзывы",
      description:
        "Новые отзывы, ответы и действия с отзывами."
    },

    shares: {
      id: "shares",
      icon: "📤",
      title: "Поделиться",
      description:
        "Когда вашу публикацию отправляют другим пользователям."
    },

    saves: {
      id: "saves",
      icon: "🔖",
      title: "Сохранения",
      description:
        "События, связанные с сохранением публикаций."
    },

    publications: {
      id: "publications",
      icon: "📰",
      title: "Публикации",
      description:
        "Одобрение, отклонение, изменение и другие события публикаций."
    },

    chats: {
      id: "chats",
      icon: "💬",
      title: "Чаты",
      description:
        "Новые сообщения и действия в личных чатах."
    },

    chat_mentions: {
      id: "chat_mentions",
      icon: "📣",
      title: "Упоминания в чатах",
      description:
        "Упоминания вас в личных и системных чатах."
    },

    reports: {
      id: "reports",
      icon: "🚩",
      title: "Жалобы",
      description:
        "Статус ваших жалоб и действия администрации."
    },

    payments: {
      id: "payments",
      icon: "💰",
      title: "Платежи",
      description:
        "Платежи, подтверждения, отклонения и запросы."
    },

    premium: {
      id: "premium",
      icon: "👑",
      title: "Premium",
      description:
        "События Premium."
    },

    vip: {
      id: "vip",
      icon: "👑",
      title: "VIP",
      description:
        "События VIP."
    },

    pro: {
      id: "pro",
      icon: "💎",
      title: "PRO",
      description:
        "События PRO."
    },

    top: {
      id: "top",
      icon: "🔥",
      title: "TOP",
      description:
        "События TOP."
    },

    levels: {
      id: "levels",
      icon: "🏆",
      title: "Уровни",
      description:
        "Изменение уровня и достижения."
    },

    badges: {
      id: "badges",
      icon: "🎖️",
      title: "Бейджи",
      description:
        "Новые и изменённые бейджи."
    },

    followers: {
      id: "followers",
      icon: "👥",
      title: "Подписки",
      description:
        "Новые подписчики и подписки."
    },

    profile: {
      id: "profile",
      icon: "👤",
      title: "Профиль",
      description:
        "Изменения профиля и связанные события."
    },

    recommendations: {
      id: "recommendations",
      icon: "🧠",
      title: "Рекомендации",
      description:
        "Новые рекомендации платформы."
    },

    opportunities: {
      id: "opportunities",
      icon: "🚀",
      title: "Возможности",
      description:
        "Работа, сотрудничество, проекты и другие возможности."
    },

    statistics: {
      id: "statistics",
      icon: "📊",
      title: "Статистика",
      description:
        "Важные изменения статистики."
    },

    system: {
      id: "system",
      icon: "⚙️",
      title: "Система",
      description:
        "Важные системные уведомления."
    },

    security: {
      id: "security",
      icon: "🔐",
      title: "Безопасность",
      description:
        "Безопасность аккаунта, устройства и сессии."
    },

    activity: {
      id: "activity",
      icon: "🕐",
      title: "Активность",
      description:
        "Важные события активности."
    }
  };

  /* ==========================================================
     EVENTS
     ========================================================== */

  const EVENTS = {
    comments: [
      "new_comment",
      "comment_edited",
      "comment_deleted",
      "comment_pinned",
      "comment_unpinned"
    ],

    comment_replies: [
      "comment_reply",
      "reply_to_reply"
    ],

    mentions: [
      "mention",
      "publication_mention",
      "comment_mention"
    ],

    reactions: [
      "reaction",
      "reaction_removed",
      "comment_reaction",
      "review_reaction"
    ],

    reviews: [
      "new_review",
      "review_reply",
      "review_edited",
      "review_deleted",
      "review_published",
      "review_hidden"
    ],

    shares: [
      "publication_shared",
      "profile_shared"
    ],

    saves: [
      "publication_saved",
      "publication_unsaved"
    ],

    publications: [
      "publication_created",
      "publication_pending",
      "publication_approved",
      "publication_rejected",
      "publication_edited",
      "publication_deleted",
      "publication_hidden",
      "publication_restored",
      "publication_featured",
      "publication_pinned",
      "publication_unpinned",
      "publication_expiring"
    ],

    chats: [
      "new_message",
      "message_reply",
      "message_forward",
      "message_pinned",
      "message_edited",
      "message_deleted",
      "conversation_started"
    ],

    chat_mentions: [
      "chat_mention"
    ],

    reports: [
      "report_created",
      "report_status_changed",
      "report_resolved",
      "report_rejected"
    ],

    payments: [
      "payment_created",
      "payment_pending",
      "payment_confirmed",
      "payment_rejected",
      "payment_refunded"
    ],

    premium: [
      "premium_requested",
      "premium_approved",
      "premium_rejected",
      "premium_changed",
      "premium_suspended",
      "premium_restored"
    ],

    vip: [
      "vip_requested",
      "vip_approved",
      "vip_rejected",
      "vip_changed",
      "vip_suspended",
      "vip_restored"
    ],

    pro: [
      "pro_requested",
      "pro_approved",
      "pro_rejected",
      "pro_changed",
      "pro_suspended",
      "pro_restored"
    ],

    top: [
      "top_requested",
      "top_approved",
      "top_rejected",
      "top_changed",
      "top_suspended",
      "top_restored"
    ],

    levels: [
      "level_up",
      "level_down",
      "level_changed",
      "achievement_unlocked"
    ],

    badges: [
      "badge_added",
      "badge_removed",
      "badge_changed"
    ],

    followers: [
      "new_follower",
      "follower_removed"
    ],

    profile: [
      "profile_changed",
      "username_changed",
      "avatar_changed",
      "profile_verified"
    ],

    recommendations: [
      "recommendation",
      "recommended_publication",
      "recommended_user",
      "recommended_opportunity"
    ],

    opportunities: [
      "new_opportunity",
      "application_received",
      "application_status_changed",
      "collaboration_request"
    ],

    statistics: [
      "important_statistics",
      "milestone_reached",
      "publication_milestone",
      "profile_milestone"
    ],

    system: [
      "system_message",
      "maintenance",
      "feature_update",
      "terms_update",
      "privacy_update",
      "important_notice"
    ],

    security: [
      "new_device",
      "new_session",
      "security_warning",
      "password_change",
      "admin_security_event",
      "suspicious_activity"
    ],

    activity: [
      "important_activity",
      "admin_action",
      "account_action"
    ]
  };

  /* ==========================================================
     STATE
     ========================================================== */

  const state = {
    initialized: false,

    mode:
      loadStorage(
        CONFIG.STORAGE.MODE,
        CONFIG.MODES.PARTICIPANT
      ),

    userId:
      loadStorage(
        CONFIG.STORAGE.USER_ID,
        ""
      ),

    settings: {},

    globalSettings: {},

    userSettings: {},

    effectiveSettings: {},

    history: [],

    loading: false,
    saving: false,

    dirty: false,

    search: "",

    activeCategory: "all",

    previewEvent: null,

    pollTimer: null,

    saveTimers: {},

    destroyed: false
  };

  /* ==========================================================
     HELPERS
     ========================================================== */

  function loadStorage(key, fallback) {
    try {
      const value =
        localStorage.getItem(key);

      return value === null
        ? fallback
        : value;
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(
        key,
        String(value ?? "")
      );
    } catch {
      // ignore
    }
  }

  function escapeHtml(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function qs(selector) {
    if (
      Array.isArray(selector)
    ) {
      for (
        const item of selector
      ) {
        const found =
          document.querySelector(item);

        if (found) {
          return found;
        }
      }

      return null;
    }

    return document.querySelector(
      selector
    );
  }

  function qsa(selector) {
    if (
      Array.isArray(selector)
    ) {
      const result = [];

      selector.forEach(
        (item) => {
          document
            .querySelectorAll(item)
            .forEach((node) => {
              if (
                !result.includes(node)
              ) {
                result.push(node);
              }
            });
        }
      );

      return result;
    }

    return [
      ...document.querySelectorAll(
        selector
      )
    ];
  }

  function dispatch(
    eventName,
    detail = {}
  ) {
    document.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail
        }
      )
    );
  }

  function getRoot() {
    return qs([
      "#notification-settings",
      "#notifications-settings",
      "[data-notification-settings]",
      ".notification-settings"
    ]);
  }

  /* ==========================================================
     API
     ========================================================== */

  async function request(
    url,
    options = {}
  ) {
    const headers = {
      Accept:
        "application/json",
      ...(options.body
        ? {
            "Content-Type":
              "application/json"
          }
        : {}),
      ...(options.headers || {})
    };

    const response =
      await fetch(
        url,
        {
          credentials: "include",
          ...options,
          headers
        }
      );

    let data = null;

    try {
      data =
        await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        `HTTP ${response.status}`
      );
    }

    return data;
  }

  /* ==========================================================
     LOAD SETTINGS
     ========================================================== */

  async function loadSettings(
    options = {}
  ) {
    if (state.loading) {
      return;
    }

    state.loading = true;

    try {
      const params =
        new URLSearchParams();

      params.set(
        "mode",
        state.mode
      );

      if (
        state.mode ===
          CONFIG.MODES.ADMIN &&
        state.userId
      ) {
        params.set(
          "user_id",
          state.userId
        );
      }

      const data =
        await request(
          `${CONFIG.API.SETTINGS}?${params.toString()}`
        );

      state.settings =
        data?.settings ??
        {};

      state.globalSettings =
        data?.global ??
        data?.global_settings ??
        {};

      state.userSettings =
        data?.user ??
        data?.user_settings ??
        {};

      state.effectiveSettings =
        data?.effective ??
        data?.effective_settings ??
        {};

      state.history =
        data?.history ??
        [];

      state.dirty = false;

      cacheSettings();

      render();

      return data;
    } catch (error) {
      console.error(
        "[TO Notification Settings] load:",
        error
      );

      showError(
        error?.message ||
        "Не удалось загрузить настройки."
      );

      throw error;
    } finally {
      state.loading = false;
    }
  }

  /* ==========================================================
     CACHE
     ========================================================== */

  function cacheSettings() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE.LOCAL_CACHE,
        JSON.stringify({
          settings:
            state.settings,
          global:
            state.globalSettings,
          user:
            state.userSettings,
          effective:
            state.effectiveSettings
        })
      );
    } catch {
      // ignore
    }
  }

  function restoreCache() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.STORAGE.LOCAL_CACHE
        );

      if (!raw) {
        return false;
      }

      const data =
        JSON.parse(raw);

      state.settings =
        data?.settings ?? {};

      state.globalSettings =
        data?.global ?? {};

      state.userSettings =
        data?.user ?? {};

      state.effectiveSettings =
        data?.effective ?? {};

      return true;
    } catch {
      return false;
    }
  }

  /* ==========================================================
     SETTINGS MODEL
     ========================================================== */

  function createDefaultSetting(
    category,
    event
  ) {
    return {
      category,
      event,

      state:
        CONFIG.VALUES.INHERIT,

      enabled: true,

      deliveries: {
        in_app: true,
        push: false,
        badge: true,
        sound: true,
        vibration: true,
        email: false,
        system_chat: false
      },

      priority: "normal",

      instant: true,

      group: false,

      quiet: false,

      force: false,

      user_can_change: true,

      start_at: null,

      end_at: null,

      expires_at: null
    };
  }

  function getSetting(
    category,
    event
  ) {
    const key =
      `${category}.${event}`;

    const candidates = [
      state.settings?.[key],
      state.settings?.[category]?.[
        event
      ],
      state.userSettings?.[key],
      state.userSettings?.[category]?.[
        event
      ],
      state.effectiveSettings?.[key],
      state.effectiveSettings?.[
        category
      ]?.[event]
    ];

    for (
      const candidate of candidates
    ) {
      if (
        candidate &&
        typeof candidate ===
          "object"
      ) {
        return {
          ...createDefaultSetting(
            category,
            event
          ),
          ...candidate,
          deliveries: {
            ...createDefaultSetting(
              category,
              event
            ).deliveries,
            ...(candidate.deliveries ||
              {})
          }
        };
      }
    }

    return createDefaultSetting(
      category,
      event
    );
  }

  function setLocalSetting(
    category,
    event,
    patch
  ) {
    const key =
      `${category}.${event}`;

    const current =
      getSetting(
        category,
        event
      );

    const next = {
      ...current,
      ...patch,

      deliveries: {
        ...current.deliveries,
        ...(patch.deliveries ||
          {})
      }
    };

    if (
      !state.settings ||
      typeof state.settings !==
        "object"
    ) {
      state.settings = {};
    }

    state.settings[key] =
      next;

    state.dirty = true;

    cacheSettings();

    scheduleSave(
      category,
      event
    );
  }

  /* ==========================================================
     SAVE
     ========================================================== */

  function scheduleSave(
    category,
    event
  ) {
    const key =
      `${category}.${event}`;

    clearTimeout(
      state.saveTimers[key]
    );

    state.saveTimers[key] =
      setTimeout(
        () => {
          saveSetting(
            category,
            event
          );
        },
        CONFIG.DEBOUNCE
      );
  }

  async function saveSetting(
    category,
    event
  ) {
    const setting =
      getSetting(
        category,
        event
      );

    state.saving = true;

    try {
      const payload = {
        mode: state.mode,
        user_id:
          state.mode ===
          CONFIG.MODES.ADMIN
            ? state.userId || null
            : null,

        category,
        event,

        setting
      };

      await request(
        CONFIG.API.SETTINGS,
        {
          method: "PUT",
          body:
            JSON.stringify(
              payload
            )
        }
      );

      state.dirty = false;

      dispatch(
        "to:notification-setting-changed",
        {
          category,
          event,
          setting,
          mode: state.mode,
          userId:
            state.userId
        }
      );
    } catch (error) {
      console.error(
        "[TO Notification Settings] save:",
        error
      );

      showToast(
        error?.message ||
        "Не удалось сохранить настройку."
      );
    } finally {
      state.saving = false;
    }
  }

  /* ==========================================================
     GLOBAL CATEGORY CONTROL
     ========================================================== */

  async function setCategoryState(
    category,
    stateValue
  ) {
    if (
      !CATEGORIES[category]
    ) {
      return;
    }

    const events =
      EVENTS[category] ||
      [];

    if (!events.length) {
      return;
    }

    state.saving = true;

    try {
      await request(
        CONFIG.API.SETTINGS,
        {
          method: "PUT",
          body:
            JSON.stringify({
              mode:
                state.mode,

              user_id:
                state.mode ===
                CONFIG.MODES.ADMIN
                  ? state.userId ||
                    null
                  : null,

              category,

              state:
                stateValue,

              events:
                events.map(
                  (event) => ({
                    event,
                    state:
                      stateValue
                  })
                )
            })
        }
      );

      events.forEach(
        (event) => {
          setLocalSettingWithoutSave(
            category,
            event,
            {
              state:
                stateValue,
              enabled:
                stateValue !==
                CONFIG.VALUES.DENY
            }
          );
        }
      );

      render();

      dispatch(
        "to:notification-category-changed",
        {
          category,
          state:
            stateValue
        }
      );
    } catch (error) {
      console.error(
        "[TO Notification Settings] category:",
        error
      );

      showToast(
        error?.message ||
        "Не удалось изменить категорию."
      );
    } finally {
      state.saving = false;
    }
  }

  function setLocalSettingWithoutSave(
    category,
    event,
    patch
  ) {
    const key =
      `${category}.${event}`;

    const current =
      getSetting(
        category,
        event
      );

    state.settings[key] = {
      ...current,
      ...patch,

      deliveries: {
        ...current.deliveries,
        ...(patch.deliveries ||
          {})
      }
    };
  }

  /* ==========================================================
     DELIVERY CONTROL
     ========================================================== */

  function toggleDelivery(
    category,
    event,
    delivery
  ) {
    if (
      !CONFIG.DELIVERY.includes(
        delivery
      )
    ) {
      return;
    }

    const setting =
      getSetting(
        category,
        event
      );

    const current =
      Boolean(
        setting.deliveries?.[
          delivery
        ]
      );

    setLocalSetting(
      category,
      event,
      {
        deliveries: {
          [delivery]:
            !current
        }
      }
    );

    render();
  }

  function setEnabled(
    category,
    event,
    enabled
  ) {
    setLocalSetting(
      category,
      event,
      {
        enabled:
          Boolean(enabled),

        state:
          enabled
            ? CONFIG.VALUES.ALLOW
            : CONFIG.VALUES.DENY
      }
    );

    render();
  }

  function setInheritance(
    category,
    event
  ) {
    setLocalSetting(
      category,
      event,
      {
        state:
          CONFIG.VALUES.INHERIT
      }
    );

    render();
  }

  function setForce(
    category,
    event,
    force
  ) {
    setLocalSetting(
      category,
      event,
      {
        force:
          Boolean(force)
      }
    );

    render();
  }

  function setUserCanChange(
    category,
    event,
    value
  ) {
    setLocalSetting(
      category,
      event,
      {
        user_can_change:
          Boolean(value)
      }
    );

    render();
  }

  function setPriority(
    category,
    event,
    priority
  ) {
    const allowed = [
      "low",
      "normal",
      "high",
      "critical"
    ];

    if (
      !allowed.includes(
        priority
      )
    ) {
      return;
    }

    setLocalSetting(
      category,
      event,
      {
        priority
      }
    );

    render();
  }

  function setInstant(
    category,
    event,
    value
  ) {
    setLocalSetting(
      category,
      event,
      {
        instant:
          Boolean(value)
      }
    );

    render();
  }

  function setGroup(
    category,
    event,
    value
  ) {
    setLocalSetting(
      category,
      event,
      {
        group:
          Boolean(value)
      }
    );

    render();
  }

  function setQuiet(
    category,
    event,
    value
  ) {
    setLocalSetting(
      category,
      event,
      {
        quiet:
          Boolean(value)
      }
    );

    render();
  }

  /* ==========================================================
     SEARCH
     ========================================================== */

  function matchesSearch(
    category,
    event
  ) {
    if (
      !state.search.trim()
    ) {
      return true;
    }

    const query =
      state.search
        .trim()
        .toLowerCase();

    const categoryData =
      CATEGORIES[category];

    const haystack = [
      category,
      event,
      categoryData?.title,
      categoryData?.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(
      query
    );
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  function render() {
    renderSummary();
    renderCategories();
    renderEvents();
    renderControls();
  }

  function renderSummary() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const summary =
      root.querySelector(
        "[data-notification-settings-summary]"
      );

    if (!summary) {
      return;
    }

    const allEvents =
      Object.values(
        EVENTS
      ).flat();

    let enabled = 0;
    let denied = 0;
    let inherited = 0;

    Object.entries(
      EVENTS
    ).forEach(
      ([category, events]) => {
        events.forEach(
          (event) => {
            const setting =
              getSetting(
                category,
                event
              );

            if (
              setting.state ===
              CONFIG.VALUES.DENY
            ) {
              denied++;
            } else if (
              setting.state ===
              CONFIG.VALUES.INHERIT
            ) {
              inherited++;
            } else if (
              setting.enabled
            ) {
              enabled++;
            }
          }
        );
      }
    );

    summary.innerHTML = `
      <div class="notification-settings-summary-item">
        <strong>${allEvents.length}</strong>
        <span>событий</span>
      </div>

      <div class="notification-settings-summary-item">
        <strong>${enabled}</strong>
        <span>включено</span>
      </div>

      <div class="notification-settings-summary-item">
        <strong>${denied}</strong>
        <span>отключено</span>
      </div>

      <div class="notification-settings-summary-item">
        <strong>${inherited}</strong>
        <span>наследуется</span>
      </div>
    `;
  }

  function renderCategories() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      root.querySelector(
        "[data-notification-settings-categories]"
      );

    if (!container) {
      return;
    }

    const entries =
      Object.entries(
        CATEGORIES
      ).filter(
        ([category]) =>
          category === "all" ||
          state.activeCategory ===
            "all" ||
          category ===
            state.activeCategory
      );

    container.innerHTML =
      entries
        .map(
          ([category, data]) => {
            const events =
              EVENTS[category] ||
              [];

            const enabled =
              events.filter(
                (event) =>
                  getSetting(
                    category,
                    event
                  ).enabled
              ).length;

            const active =
              state.activeCategory ===
              category;

            return `
              <button
                type="button"
                class="
                  notification-settings-category
                  ${
                    active
                      ? "is-active"
                      : ""
                  }
                "
                data-ns-category="${escapeHtml(
                  category
                )}"
              >
                <span class="notification-settings-category-icon">
                  ${data.icon}
                </span>

                <span class="notification-settings-category-text">
                  <strong>
                    ${escapeHtml(
                      data.title
                    )}
                  </strong>

                  <small>
                    ${enabled}/${events.length}
                  </small>
                </span>
              </button>
            `;
          }
        )
        .join("");
  }

  function renderEvents() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      root.querySelector(
        "[data-notification-settings-events]"
      );

    if (!container) {
      return;
    }

    const categories =
      state.activeCategory ===
      "all"
        ? Object.keys(EVENTS)
        : [
            state.activeCategory
          ];

    const html = [];

    categories.forEach(
      (category) => {
        const categoryData =
          CATEGORIES[
            category
          ];

        if (
          !categoryData
        ) {
          return;
        }

        const events =
          EVENTS[category] ||
          [];

        const visibleEvents =
          events.filter(
            (event) =>
              matchesSearch(
                category,
                event
              )
          );

        if (
          !visibleEvents.length
        ) {
          return;
        }

        html.push(`
          <section
            class="notification-settings-section"
            data-notification-settings-section="${escapeHtml(
              category
            )}"
          >

            <div class="notification-settings-section-header">

              <div>
                <span class="notification-settings-section-icon">
                  ${categoryData.icon}
                </span>

                <div>
                  <h3>
                    ${escapeHtml(
                      categoryData.title
                    )}
                  </h3>

                  <p>
                    ${escapeHtml(
                      categoryData.description
                    )}
                  </p>
                </div>
              </div>

              ${
                isAdmin()
                  ? `
                    <div class="notification-settings-category-actions">

                      <button
                        type="button"
                        data-ns-category-action="allow"
                        data-ns-category="${escapeHtml(
                          category
                        )}"
                      >
                        Включить всё
                      </button>

                      <button
                        type="button"
                        data-ns-category-action="deny"
                        data-ns-category="${escapeHtml(
                          category
                        )}"
                      >
                        Отключить всё
                      </button>

                      <button
                        type="button"
                        data-ns-category-action="inherit"
                        data-ns-category="${escapeHtml(
                          category
                        )}"
                      >
                        Наследовать
                      </button>

                    </div>
                  `
                  : ""
              }

            </div>

            <div class="notification-settings-events">
              ${visibleEvents
                .map(
                  (
                    event
                  ) =>
                    renderEvent(
                      category,
                      event
                    )
                )
                .join("")}
            </div>

          </section>
        `);
      }
    );

    container.innerHTML =
      html.length
        ? html.join("")
        : `
          <div class="notification-settings-empty">
            🔎 Ничего не найдено.
          </div>
        `;
  }

  function renderEvent(
    category,
    event
  ) {
    const setting =
      getSetting(
        category,
        event
      );

    const stateLabel =
      setting.state ===
      CONFIG.VALUES.ALLOW
        ? "Разрешено"
        : setting.state ===
          CONFIG.VALUES.DENY
        ? "Запрещено"
        : "Наследуется";

    return `
      <div
        class="notification-setting-card"
        data-ns-event="${escapeHtml(
          event
        )}"
        data-ns-category="${escapeHtml(
          category
        )}"
      >

        <div class="notification-setting-main">

          <div class="notification-setting-title-row">

            <strong>
              ${escapeHtml(
                getEventLabel(
                  event
                )
              )}
            </strong>

            <span
              class="
                notification-setting-state
                notification-setting-state-${escapeHtml(
                  setting.state
                )}
              "
            >
              ${escapeHtml(
                stateLabel
              )}
            </span>

          </div>

          <div class="notification-setting-key">
            ${escapeHtml(
              category
            )}.${escapeHtml(
              event
            )}
          </div>

        </div>

        <div class="notification-setting-controls">

          <div class="notification-setting-switch-row">

            ${renderSwitch(
              category,
              event,
              "enabled",
              Boolean(
                setting.enabled
              ),
              "Получать уведомление"
            )}

            ${renderSwitch(
              category,
              event,
              "force",
              Boolean(
                setting.force
              ),
              "Принудительно"
            )}

            ${renderSwitch(
              category,
              event,
              "user_can_change",
              Boolean(
                setting.user_can_change
              ),
              "Пользователь может менять"
            )}

          </div>

          <div class="notification-setting-deliveries">

            ${CONFIG.DELIVERY.map(
              (delivery) =>
                renderDelivery(
                  category,
                  event,
                  delivery,
                  Boolean(
                    setting
                      .deliveries?.[
                      delivery
                    ]
                  )
                )
            ).join("")}

          </div>

          <div class="notification-setting-extra">

            <label>
              <span>Приоритет</span>

              <select
                data-ns-priority
                data-category="${escapeHtml(
                  category
                )}"
                data-event="${escapeHtml(
                  event
                )}"
              >
                ${[
                  "low",
                  "normal",
                  "high",
                  "critical"
                ]
                  .map(
                    (
                      value
                    ) => `
                      <option
                        value="${value}"
                        ${
                          setting.priority ===
                          value
                            ? "selected"
                            : ""
                        }
                      >
                        ${getPriorityLabel(
                          value
                        )}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </label>

            ${renderSwitch(
              category,
              event,
              "instant",
              Boolean(
                setting.instant
              ),
              "Мгновенно"
            )}

            ${renderSwitch(
              category,
              event,
              "group",
              Boolean(
                setting.group
              ),
              "Группировать"
            )}

            ${renderSwitch(
              category,
              event,
              "quiet",
              Boolean(
                setting.quiet
              ),
              "Без звука"
            )}

          </div>

          <div class="notification-setting-state-actions">

            <button
              type="button"
              data-ns-state="allow"
              data-category="${escapeHtml(
                category
              )}"
              data-event="${escapeHtml(
                event
              )}"
            >
              ✓ Разрешить
            </button>

            <button
              type="button"
              data-ns-state="deny"
              data-category="${escapeHtml(
                category
              )}"
              data-event="${escapeHtml(
                event
              )}"
            >
              ✕ Запретить
            </button>

            <button
              type="button"
              data-ns-state="inherit"
              data-category="${escapeHtml(
                category
              )}"
              data-event="${escapeHtml(
                event
              )}"
            >
              ↔ Наследовать
            </button>

          </div>

        </div>

      </div>
    `;
  }

  function renderSwitch(
    category,
    event,
    key,
    checked,
    label
  ) {
    return `
      <label
        class="notification-setting-switch"
      >
        <input
          type="checkbox"
          data-ns-toggle="${escapeHtml(
            key
          )}"
          data-category="${escapeHtml(
            category
          )}"
          data-event="${escapeHtml(
            event
          )}"
          ${checked ? "checked" : ""}
        >

        <span></span>

        <small>
          ${escapeHtml(
            label
          )}
        </small>
      </label>
    `;
  }

  function renderDelivery(
    category,
    event,
    delivery,
    enabled
  ) {
    const labels = {
      in_app: "Сайт",
      push: "Push",
      badge: "Badge",
      sound: "Звук",
      vibration: "Вибрация",
      email: "Email",
      system_chat: "Системный чат"
    };

    const icons = {
      in_app: "🔔",
      push: "📱",
      badge: "🔴",
      sound: "🔊",
      vibration: "📳",
      email: "✉️",
      system_chat: "💬"
    };

    return `
      <label
        class="
          notification-delivery
          ${
            enabled
              ? "is-enabled"
              : ""
          }
        "
      >

        <input
          type="checkbox"
          data-ns-delivery="${escapeHtml(
            delivery
          )}"
          data-category="${escapeHtml(
            category
          )}"
          data-event="${escapeHtml(
            event
          )}"
          ${enabled ? "checked" : ""}
        >

        <span>
          ${icons[delivery]}
        </span>

        <small>
          ${escapeHtml(
            labels[delivery]
          )}
        </small>

      </label>
    `;
  }

  function renderControls() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const userInput =
      root.querySelector(
        "[data-ns-user-id]"
      );

    if (userInput) {
      userInput.value =
        state.userId;
    }

    const searchInput =
      root.querySelector(
        "[data-ns-search]"
      );

    if (
      searchInput &&
      document.activeElement !==
        searchInput
    ) {
      searchInput.value =
        state.search;
    }

    const saving =
      root.querySelector(
        "[data-ns-saving]"
      );

    if (saving) {
      saving.hidden =
        !state.saving;
    }
  }

  /* ==========================================================
     LABELS
     ========================================================== */

  function getEventLabel(
    event
  ) {
    const labels = {
      new_comment:
        "Новый комментарий",
      comment_edited:
        "Комментарий изменён",
      comment_deleted:
        "Комментарий удалён",
      comment_pinned:
        "Комментарий закреплён",
      comment_unpinned:
        "Комментарий откреплён",

      comment_reply:
        "Ответ на комментарий",
      reply_to_reply:
        "Ответ на ответ",

      mention:
        "Упоминание",
      publication_mention:
        "Упоминание в публикации",
      comment_mention:
        "Упоминание в комментарии",

      reaction:
        "Новая реакция",
      reaction_removed:
        "Реакция удалена",
      comment_reaction:
        "Реакция на комментарий",
      review_reaction:
        "Реакция на отзыв",

      new_review:
        "Новый отзыв",
      review_reply:
        "Ответ на отзыв",
      review_edited:
        "Отзыв изменён",
      review_deleted:
        "Отзыв удалён",
      review_published:
        "Отзыв опубликован",
      review_hidden:
        "Отзыв скрыт",

      publication_shared:
        "Публикацию отправили",
      profile_shared:
        "Профиль отправили",

      publication_saved:
        "Публикацию сохранили",
      publication_unsaved:
        "Публикацию удалили из сохранённых",

      publication_created:
        "Публикация создана",
      publication_pending:
        "Публикация ожидает модерации",
      publication_approved:
        "Публикация одобрена",
      publication_rejected:
        "Публикация отклонена",
      publication_edited:
        "Публикация изменена",
      publication_deleted:
        "Публикация удалена",
      publication_hidden:
        "Публикация скрыта",
      publication_restored:
        "Публикация восстановлена",
      publication_featured:
        "Публикация выделена",
      publication_pinned:
        "Публикация закреплена",
      publication_unpinned:
        "Публикация откреплена",
      publication_expiring:
        "Публикация скоро истечёт",

      new_message:
        "Новое сообщение",
      message_reply:
        "Ответ на сообщение",
      message_forward:
        "Пересланное сообщение",
      message_pinned:
        "Сообщение закреплено",
      message_edited:
        "Сообщение изменено",
      message_deleted:
        "Сообщение удалено",
      conversation_started:
        "Новый диалог",

      chat_mention:
        "Упоминание в чате",

      report_created:
        "Жалоба создана",
      report_status_changed:
        "Статус жалобы изменён",
      report_resolved:
        "Жалоба рассмотрена",
      report_rejected:
        "Жалоба отклонена",

      payment_created:
        "Создан платёж",
      payment_pending:
        "Платёж ожидает подтверждения",
      payment_confirmed:
        "Платёж подтверждён",
      payment_rejected:
        "Платёж отклонён",
      payment_refunded:
        "Платёж возвращён",

      premium_requested:
        "Запрос Premium",
      premium_approved:
        "Premium предоставлен",
      premium_rejected:
        "Premium отклонён",
      premium_changed:
        "Premium изменён",
      premium_suspended:
        "Premium приостановлен",
      premium_restored:
        "Premium восстановлен",

      vip_requested:
        "Запрос VIP",
      vip_approved:
        "VIP предоставлен",
      vip_rejected:
        "VIP отклонён",
      vip_changed:
        "VIP изменён",
      vip_suspended:
        "VIP приостановлен",
      vip_restored:
        "VIP восстановлен",

      pro_requested:
        "Запрос PRO",
      pro_approved:
        "PRO предоставлен",
      pro_rejected:
        "PRO отклонён",
      pro_changed:
        "PRO изменён",
      pro_suspended:
        "PRO приостановлен",
      pro_restored:
        "PRO восстановлен",

      top_requested:
        "Запрос TOP",
      top_approved:
        "TOP предоставлен",
      top_rejected:
        "TOP отклонён",
      top_changed:
        "TOP изменён",
      top_suspended:
        "TOP приостановлен",
      top_restored:
        "TOP восстановлен",

      level_up:
        "Уровень повышен",
      level_down:
        "Уровень понижен",
      level_changed:
        "Уровень изменён",
      achievement_unlocked:
        "Получено достижение",

      badge_added:
        "Добавлен бейдж",
      badge_removed:
        "Бейдж удалён",
      badge_changed:
        "Бейдж изменён",

      new_follower:
        "Новый подписчик",
      follower_removed:
        "Подписка удалена",

      profile_changed:
        "Профиль изменён",
      username_changed:
        "Username изменён",
      avatar_changed:
        "Аватар изменён",
      profile_verified:
        "Профиль подтверждён",

      recommendation:
        "Новая рекомендация",
      recommended_publication:
        "Рекомендованная публикация",
      recommended_user:
        "Рекомендованный участник",
      recommended_opportunity:
        "Рекомендованная возможность",

      new_opportunity:
        "Новая возможность",
      application_received:
        "Получен отклик",
      application_status_changed:
        "Статус отклика изменён",
      collaboration_request:
        "Предложение сотрудничества",

      important_statistics:
        "Важная статистика",
      milestone_reached:
        "Достигнут результат",
      publication_milestone:
        "Достижение публикации",
      profile_milestone:
        "Достижение профиля",

      system_message:
        "Системное сообщение",
      maintenance:
        "Технические работы",
      feature_update:
        "Новое обновление",
      terms_update:
        "Изменение правил",
      privacy_update:
        "Изменение политики",
      important_notice:
        "Важное уведомление",

      new_device:
        "Новое устройство",
      new_session:
        "Новая сессия",
      security_warning:
        "Предупреждение безопасности",
      password_change:
        "Изменение пароля",
      admin_security_event:
        "Событие безопасности",
      suspicious_activity:
        "Подозрительная активность",

      important_activity:
        "Важная активность",
      admin_action:
        "Действие администратора",
      account_action:
        "Действие аккаунта"
    };

    return (
      labels[event] ||
      event
        .replace(/_/g, " ")
        .replace(
          /^./,
          (char) =>
            char.toUpperCase()
        )
    );
  }

  function getPriorityLabel(
    priority
  ) {
    const labels = {
      low: "Низкий",
      normal: "Обычный",
      high: "Высокий",
      critical: "Критический"
    };

    return (
      labels[priority] ||
      priority
    );
  }

  /* ==========================================================
     RESET
     ========================================================== */

  async function resetSettings(
    scope = "current"
  ) {
    const confirmed =
      window.confirm(
        scope === "all"
          ? "Вы действительно хотите сбросить все настройки уведомлений?"
          : "Вы действительно хотите сбросить настройки уведомлений?"
      );

    if (!confirmed) {
      return false;
    }

    try {
      await request(
        CONFIG.API.RESET,
        {
          method: "POST",
          body:
            JSON.stringify({
              mode:
                state.mode,
              user_id:
                state.userId ||
                null,
              scope
            })
        }
      );

      await loadSettings();

      showToast(
        "Настройки уведомлений сброшены."
      );

      return true;
    } catch (error) {
      console.error(
        "[TO Notification Settings] reset:",
        error
      );

      showToast(
        error?.message ||
        "Не удалось сбросить настройки."
      );

      return false;
    }
  }

  /* ==========================================================
     USER
     ========================================================== */

  function setUser(
    userId
  ) {
    state.userId =
      String(
        userId || ""
      ).trim();

    saveStorage(
      CONFIG.STORAGE.USER_ID,
      state.userId
    );

    if (
      isAdmin() &&
      state.userId
    ) {
      loadSettings();
    }
  }

  function isAdmin() {
    return (
      state.mode ===
      CONFIG.MODES.ADMIN
    );
  }

  function setMode(
    mode
  ) {
    state.mode =
      mode ===
      CONFIG.MODES.ADMIN
        ? CONFIG.MODES.ADMIN
        : CONFIG.MODES.PARTICIPANT;

    saveStorage(
      CONFIG.STORAGE.MODE,
      state.mode
    );

    dispatch(
      "to:notification-settings-mode",
      {
        mode:
          state.mode
      }
    );

    loadSettings();
  }

  /* ==========================================================
     PUSH
     ========================================================== */

  async function requestPushPermission() {
    if (
      !("Notification" in window)
    ) {
      showToast(
        "Ваш браузер не поддерживает Push-уведомления."
      );

      return "unsupported";
    }

    try {
      const permission =
        await Notification.requestPermission();

      dispatch(
        "to:push-permission",
        {
          permission
        }
      );

      if (
        permission ===
        "granted"
      ) {
        showToast(
          "Push-уведомления разрешены."
        );
      } else if (
        permission ===
        "denied"
      ) {
        showToast(
          "Push-уведомления запрещены браузером."
        );
      }

      return permission;
    } catch (error) {
      console.error(
        "[TO Notifications] push permission:",
        error
      );

      return "error";
    }
  }

  async function testPush() {
    try {
      await request(
        CONFIG.API.TEST_PUSH,
        {
          method: "POST",
          body:
            JSON.stringify({
              mode:
                state.mode,
              user_id:
                state.userId ||
                null
            })
        }
      );

      showToast(
        "Тестовое уведомление отправлено."
      );

      return true;
    } catch (error) {
      console.error(
        "[TO Notifications] test push:",
        error
      );

      showToast(
        error?.message ||
        "Не удалось отправить тестовое уведомление."
      );

      return false;
    }
  }

  /* ==========================================================
     PREVIEW
     ========================================================== */

  async function preview(
    category,
    event
  ) {
    state.previewEvent = {
      category,
      event
    };

    try {
      const data =
        await request(
          CONFIG.API.PREVIEW,
          {
            method: "POST",
            body:
              JSON.stringify({
                mode:
                  state.mode,
                user_id:
                  state.userId ||
                  null,
                category,
                event,
                setting:
                  getSetting(
                    category,
                    event
                  )
              })
          }
        );

      showPreview(
        data?.notification ??
        {
          title:
            getEventLabel(
              event
            ),
          body:
            "Предпросмотр уведомления.",
          icon:
            CATEGORIES[
              category
            ]?.icon ??
            "🔔"
        }
      );

      return data;
    } catch (error) {
      console.error(
        "[TO Notifications] preview:",
        error
      );

      showPreview({
        title:
          getEventLabel(
            event
          ),
        body:
          "Предпросмотр уведомления.",
        icon:
          CATEGORIES[
            category
          ]?.icon ??
          "🔔"
      });
    }
  }

  function showPreview(
    notification
  ) {
    let modal =
      document.querySelector(
        "#to-notification-preview"
      );

    if (!modal) {
      modal =
        document.createElement(
          "div"
        );

      modal.id =
        "to-notification-preview";

      modal.className =
        "to-notification-preview-modal";

      modal.innerHTML = `
        <div class="to-notification-preview-backdrop"
             data-ns-preview-close></div>

        <div class="to-notification-preview-dialog">

          <button
            type="button"
            class="to-notification-preview-close"
            data-ns-preview-close
          >
            ×
          </button>

          <div
            class="to-notification-preview-icon"
            data-ns-preview-icon
          ></div>

          <h3
            data-ns-preview-title
          ></h3>

          <p
            data-ns-preview-body
          ></p>

          <small
            data-ns-preview-time
          ></small>

        </div>
      `;

      document.body.appendChild(
        modal
      );
    }

    const icon =
      modal.querySelector(
        "[data-ns-preview-icon]"
      );

    const title =
      modal.querySelector(
        "[data-ns-preview-title]"
      );

    const body =
      modal.querySelector(
        "[data-ns-preview-body]"
      );

    const time =
      modal.querySelector(
        "[data-ns-preview-time]"
      );

    if (icon) {
      icon.textContent =
        notification.icon ||
        "🔔";
    }

    if (title) {
      title.textContent =
        notification.title ||
        "Уведомление";
    }

    if (body) {
      body.textContent =
        notification.body ||
        "";
    }

    if (time) {
      time.textContent =
        "Сейчас";
    }

    modal.classList.add(
      "is-open"
    );
  }

  function closePreview() {
    const modal =
      document.querySelector(
        "#to-notification-preview"
      );

    if (modal) {
      modal.classList.remove(
        "is-open"
      );
    }
  }

  /* ==========================================================
     HISTORY
     ========================================================== */

  async function loadHistory() {
    try {
      const params =
        new URLSearchParams();

      params.set(
        "mode",
        state.mode
      );

      if (state.userId) {
        params.set(
          "user_id",
          state.userId
        );
      }

      const data =
        await request(
          `${CONFIG.API.HISTORY}?${params.toString()}`
        );

      state.history =
        data?.history ??
        data?.items ??
        [];

      renderHistory();

      return state.history;
    } catch (error) {
      console.error(
        "[TO Notification Settings] history:",
        error
      );

      return [];
    }
  }

  function renderHistory() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      root.querySelector(
        "[data-ns-history]"
      );

    if (!container) {
      return;
    }

    if (
      !state.history.length
    ) {
      container.innerHTML = `
        <div class="notification-settings-history-empty">
          История изменений пока пуста.
        </div>
      `;

      return;
    }

    container.innerHTML =
      state.history
        .map(
          (item) => `
            <div
              class="notification-settings-history-item"
            >
              <div>
                <strong>
                  ${escapeHtml(
                    item.action ||
                    "Изменение"
                  )}
                </strong>

                <small>
                  ${escapeHtml(
                    item.category ||
                    ""
                  )}
                  ${
                    item.event
                      ? `.${escapeHtml(
                          item.event
                        )}`
                      : ""
                  }
                </small>
              </div>

              <time>
                ${escapeHtml(
                  item.created_at ||
                  item.timestamp ||
                  ""
                )}
              </time>
            </div>
          `
        )
        .join("");
  }

  /* ==========================================================
     TOAST
     ========================================================== */

  function showToast(
    message
  ) {
    let toast =
      document.querySelector(
        "#to-notification-settings-toast"
      );

    if (!toast) {
      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "to-notification-settings-toast";

      toast.className =
        "to-notification-settings-toast";

      document.body.appendChild(
        toast
      );
    }

    toast.textContent =
      String(message || "");

    toast.classList.add(
      "is-visible"
    );

    clearTimeout(
      toast.__hideTimer
    );

    toast.__hideTimer =
      setTimeout(
        () => {
          toast.classList.remove(
            "is-visible"
          );
        },
        3000
      );
  }

  function showError(
    message
  ) {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      root.querySelector(
        "[data-notification-settings-events]"
      );

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="notification-settings-error">
        <div>⚠️</div>
        <h3>
          Не удалось загрузить настройки
        </h3>
        <p>
          ${escapeHtml(
            message
          )}
        </p>
        <button
          type="button"
          data-ns-retry
        >
          Повторить
        </button>
      </div>
    `;
  }

  /* ==========================================================
     EVENTS
     ========================================================== */

  function handleClick(
    event
  ) {
    const target =
      event.target.closest(
        "[data-ns-category]," +
        "[data-ns-category-action]," +
        "[data-ns-state]," +
        "[data-ns-preview]," +
        "[data-ns-preview-close]," +
        "[data-ns-reset]," +
        "[data-ns-test-push]," +
        "[data-ns-push-permission]," +
        "[data-ns-history]," +
        "[data-ns-retry]"
      );

    if (!target) {
      return;
    }

    const category =
      target.getAttribute(
        "data-ns-category"
      );

    const categoryAction =
      target.getAttribute(
        "data-ns-category-action"
      );

    if (
      categoryAction &&
      category
    ) {
      event.preventDefault();

      if (
        categoryAction ===
        "allow"
      ) {
        setCategoryState(
          category,
          CONFIG.VALUES.ALLOW
        );
      } else if (
        categoryAction ===
        "deny"
      ) {
        setCategoryState(
          category,
          CONFIG.VALUES.DENY
        );
      } else if (
        categoryAction ===
        "inherit"
      ) {
        setCategoryState(
          category,
          CONFIG.VALUES.INHERIT
        );
      }

      return;
    }

    if (category) {
      event.preventDefault();

      state.activeCategory =
        state.activeCategory ===
        category
          ? "all"
          : category;

      render();

      return;
    }

    const stateButton =
      target.getAttribute(
        "data-ns-state"
      );

    const eventName =
      target.getAttribute(
        "data-event"
      );

    if (
      stateButton &&
      category &&
      eventName
    ) {
      event.preventDefault();

      if (
        stateButton ===
        "allow"
      ) {
        setLocalSetting(
          category,
          eventName,
          {
            state:
              CONFIG.VALUES.ALLOW,
            enabled: true
          }
        );
      }

      if (
        stateButton ===
        "deny"
      ) {
        setLocalSetting(
          category,
          eventName,
          {
            state:
              CONFIG.VALUES.DENY,
            enabled: false
          }
        );
      }

      if (
        stateButton ===
        "inherit"
      ) {
        setInheritance(
          category,
          eventName
        );
      }

      render();

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-preview"
      )
    ) {
      event.preventDefault();

      preview(
        target.getAttribute(
          "data-category"
        ),
        target.getAttribute(
          "data-event"
        )
      );

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-preview-close"
      )
    ) {
      event.preventDefault();

      closePreview();

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-reset"
      )
    ) {
      event.preventDefault();

      resetSettings(
        target.getAttribute(
          "data-ns-reset"
        ) || "current"
      );

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-test-push"
      )
    ) {
      event.preventDefault();

      testPush();

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-push-permission"
      )
    ) {
      event.preventDefault();

      requestPushPermission();

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-history"
      )
    ) {
      event.preventDefault();

      loadHistory();

      return;
    }

    if (
      target.hasAttribute(
        "data-ns-retry"
      )
    ) {
      event.preventDefault();

      loadSettings();

      return;
    }
  }

  function handleChange(
    event
  ) {
    const target =
      event.target;

    if (
      target.matches(
        "[data-ns-toggle]"
      )
    ) {
      const category =
        target.getAttribute(
          "data-category"
        );

      const eventName =
        target.getAttribute(
          "data-event"
        );

      const key =
        target.getAttribute(
          "data-ns-toggle"
        );

      if (
        !category ||
        !eventName ||
        !key
      ) {
        return;
      }

      const value =
        Boolean(
          target.checked
        );

      if (
        key === "enabled"
      ) {
        setEnabled(
          category,
          eventName,
          value
        );
      } else if (
        key === "force"
      ) {
        setForce(
          category,
          eventName,
          value
        );
      } else if (
        key ===
        "user_can_change"
      ) {
        setUserCanChange(
          category,
          eventName,
          value
        );
      } else if (
        key === "instant"
      ) {
        setInstant(
          category,
          eventName,
          value
        );
      } else if (
        key === "group"
      ) {
        setGroup(
          category,
          eventName,
          value
        );
      } else if (
        key === "quiet"
      ) {
        setQuiet(
          category,
          eventName,
          value
        );
      }

      return;
    }

    if (
      target.matches(
        "[data-ns-delivery]"
      )
    ) {
      const category =
        target.getAttribute(
          "data-category"
        );

      const eventName =
        target.getAttribute(
          "data-event"
        );

      const delivery =
        target.getAttribute(
          "data-ns-delivery"
        );

      if (
        category &&
        eventName &&
        delivery
      ) {
        toggleDelivery(
          category,
          eventName,
          delivery
        );
      }

      return;
    }

    if (
      target.matches(
        "[data-ns-priority]"
      )
    ) {
      const category =
        target.getAttribute(
          "data-category"
        );

      const eventName =
        target.getAttribute(
          "data-event"
        );

      if (
        category &&
        eventName
      ) {
        setPriority(
          category,
          eventName,
          target.value
        );
      }

      return;
    }

    if (
      target.matches(
        "[data-ns-user-id]"
      )
    ) {
      setUser(
        target.value
      );
    }
  }

  function handleInput(
    event
  ) {
    const target =
      event.target;

    if (
      target.matches(
        "[data-ns-search]"
      )
    ) {
      state.search =
        target.value || "";

      clearTimeout(
        state.__searchTimer
      );

      state.__searchTimer =
        setTimeout(
          () => {
            renderEvents();
          },
          CONFIG.DEBOUNCE
        );
    }

    if (
      target.matches(
        "[data-ns-user-id]"
      )
    ) {
      state.userId =
        target.value.trim();

      saveStorage(
        CONFIG.STORAGE.USER_ID,
        state.userId
      );
    }
  }

  /* ==========================================================
     AUTO REFRESH
     ========================================================== */

  function startPolling() {
    stopPolling();

    state.pollTimer =
      setInterval(
        () => {
          if (
            document.hidden ||
            state.saving
          ) {
            return;
          }

          if (
            getRoot()
          ) {
            loadSettings({
              silent: true
            });
          }
        },
        CONFIG.POLL_INTERVAL
      );
  }

  function stopPolling() {
    if (
      state.pollTimer
    ) {
      clearInterval(
        state.pollTimer
      );

      state.pollTimer =
        null;
    }
  }

  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  function init(
    options = {}
  ) {
    if (
      state.initialized
    ) {
      return api;
    }

    if (
      options.mode
    ) {
      setModeSilently(
        options.mode
      );
    }

    if (
      options.userId
    ) {
      state.userId =
        String(
          options.userId
        );

      saveStorage(
        CONFIG.STORAGE.USER_ID,
        state.userId
      );
    }

    restoreCache();

    document.addEventListener(
      "click",
      handleClick
    );

    document.addEventListener(
      "change",
      handleChange
    );

    document.addEventListener(
      "input",
      handleInput
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    state.initialized =
      true;

    render();

    if (
      getRoot()
    ) {
      loadSettings();
    }

    startPolling();

    dispatch(
      "to:notification-settings-ready",
      {
        mode:
          state.mode,
        userId:
          state.userId
      }
    );

    return api;
  }

  function setModeSilently(
    mode
  ) {
    state.mode =
      mode ===
      CONFIG.MODES.ADMIN
        ? CONFIG.MODES.ADMIN
        : CONFIG.MODES.PARTICIPANT;

    saveStorage(
      CONFIG.STORAGE.MODE,
      state.mode
    );
  }

  function handleVisibility() {
    if (
      document.hidden
    ) {
      return;
    }

    if (
      state.initialized &&
      getRoot()
    ) {
      loadSettings({
        silent: true
      });
    }
  }

  function destroy() {
    if (
      state.destroyed
    ) {
      return;
    }

    stopPolling();

    clearTimeout(
      state.__searchTimer
    );

    Object.values(
      state.saveTimers
    ).forEach(
      (timer) => {
        clearTimeout(timer);
      }
    );

    document.removeEventListener(
      "click",
      handleClick
    );

    document.removeEventListener(
      "change",
      handleChange
    );

    document.removeEventListener(
      "input",
      handleInput
    );

    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );

    state.destroyed =
      true;
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const api = {
    init,
    destroy,

    loadSettings,
    loadHistory,

    getSettings: () =>
      state.settings,

    getGlobalSettings: () =>
      state.globalSettings,

    getUserSettings: () =>
      state.userSettings,

    getEffectiveSettings: () =>
      state.effectiveSettings,

    getState: () => ({
      ...state
    }),

    setMode,
    getMode: () =>
      state.mode,

    setUser,

    setCategoryState,

    setEnabled,
    setInheritance,
    setForce,
    setUserCanChange,

    toggleDelivery,

    setPriority,
    setInstant,
    setGroup,
    setQuiet,

    resetSettings,

    requestPushPermission,
    testPush,

    preview,

    closePreview,

    categories:
      CATEGORIES,

    events:
      EVENTS,

    values:
      CONFIG.VALUES
  };

  /* ==========================================================
     GLOBAL EXPORT
     ========================================================== */

  window.TONotificationSettings =
    api;

  window.NotificationSettings =
    api;

  /* ==========================================================
     AUTO INIT
     ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => init(),
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
