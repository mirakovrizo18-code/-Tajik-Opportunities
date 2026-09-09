/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   ADMIN + USER NOTIFICATION SETTINGS
   Version: 2026.09.09 POWER NOTIFICATION CENTER
   ============================================================ */

(() => {
  "use strict";

  const API = "/api/notifications";

  const STATE = {
    initialized: false,
    loading: false,

    mode: "admin",

    participantId: null,

    global: {},
    participant: {},
    forced: {},

    categories: [],
    events: [],

    dirty: false,
    saving: false,

    lastSavedAt: null
  };

  const DEFAULT_CATEGORIES = [
    {
      id: "reports",
      icon: "🚩",
      name: "Жалобы",
      description: "Жалобы на публикации, комментарии, участников и сообщения"
    },
    {
      id: "participants",
      icon: "👤",
      name: "Участники",
      description: "Регистрация, профиль, блокировки, изменения и действия участников"
    },
    {
      id: "comments",
      icon: "💬",
      name: "Комментарии",
      description: "Новые комментарии, ответы, упоминания и изменения"
    },
    {
      id: "publications",
      icon: "📰",
      name: "Публикации",
      description: "Новые публикации, модерация, публикация, редактирование и удаление"
    },
    {
      id: "chats",
      icon: "💬",
      name: "Чаты",
      description: "Новые сообщения, ответы, вложения и изменения чата"
    },
    {
      id: "reactions",
      icon: "❤️",
      name: "Реакции",
      description: "Лайки и другие реакции"
    },
    {
      id: "reviews",
      icon: "⭐",
      name: "Отзывы",
      description: "Новые отзывы, оценки, ответы и изменения"
    },
    {
      id: "shares",
      icon: "📤",
      name: "Поделиться",
      description: "Отправка и распространение публикаций"
    },
    {
      id: "bookmarks",
      icon: "🔖",
      name: "Сохранения",
      description: "Сохранения публикаций"
    },
    {
      id: "payments",
      icon: "💰",
      name: "Платежи",
      description: "Запросы, подтверждения, отклонения и возвраты"
    },
    {
      id: "premium",
      icon: "💎",
      name: "Premium",
      description: "Premium-подписки и услуги"
    },
    {
      id: "pro",
      icon: "🚀",
      name: "PRO",
      description: "PRO-услуги, права и сроки"
    },
    {
      id: "top",
      icon: "🏆",
      name: "TOP",
      description: "TOP-статус и изменения"
    },
    {
      id: "vip",
      icon: "👑",
      name: "VIP",
      description: "VIP-публикации и VIP-права"
    },
    {
      id: "levels",
      icon: "📈",
      name: "Уровни",
      description: "TO Level, повышение и изменение уровня"
    },
    {
      id: "badges",
      icon: "🎖️",
      name: "Значки",
      description: "Получение, изменение и удаление значков"
    },
    {
      id: "system",
      icon: "⚙️",
      name: "Системные",
      description: "Системные уведомления Tajik Opportunities"
    },
    {
      id: "statistics",
      icon: "📊",
      name: "Статистика",
      description: "Статистика платформы и отчёты"
    },
    {
      id: "activity",
      icon: "🕐",
      name: "Недавние действия",
      description: "Важные действия и изменения"
    },
    {
      id: "security",
      icon: "🔐",
      name: "Безопасность",
      description: "Входы, сессии, подозрительная активность и защита"
    }
  ];

  const DEFAULT_CHANNELS = [
    {
      id: "in_app",
      name: "В приложении",
      icon: "🔔"
    },
    {
      id: "push",
      name: "Push",
      icon: "📲"
    },
    {
      id: "sound",
      name: "Звук",
      icon: "🔊"
    },
    {
      id: "vibration",
      name: "Вибрация",
      icon: "📳"
    },
    {
      id: "badge",
      name: "Красный badge",
      icon: "🔴"
    },
    {
      id: "email",
      name: "Email",
      icon: "📧"
    },
    {
      id: "system_chat",
      name: "Системный чат",
      icon: "🇹🇯"
    }
  ];

  const DEFAULT_EVENTS = {
    comments: [
      "new_comment",
      "reply",
      "mention",
      "comment_reaction",
      "comment_edited",
      "comment_deleted",
      "comment_pinned"
    ],

    publications: [
      "publication_submitted",
      "publication_approved",
      "publication_rejected",
      "publication_published",
      "publication_edited",
      "publication_deleted",
      "publication_expired",
      "publication_pinned"
    ],

    chats: [
      "new_message",
      "message_reply",
      "message_reaction",
      "message_edited",
      "message_deleted",
      "chat_started",
      "chat_closed"
    ],

    reactions: [
      "new_reaction",
      "reaction_removed",
      "reaction_milestone"
    ],

    reviews: [
      "new_review",
      "review_reply",
      "review_reaction",
      "review_edited",
      "review_deleted",
      "rating_changed"
    ],

    shares: [
      "publication_shared",
      "publication_sent",
      "share_milestone"
    ],

    payments: [
      "payment_request",
      "payment_confirmed",
      "payment_rejected",
      "payment_refunded"
    ],

    premium: [
      "premium_requested",
      "premium_granted",
      "premium_revoked",
      "premium_expiring"
    ],

    pro: [
      "pro_requested",
      "pro_granted",
      "pro_revoked",
      "pro_expiring"
    ],

    top: [
      "top_requested",
      "top_granted",
      "top_revoked",
      "top_expiring"
    ],

    vip: [
      "vip_requested",
      "vip_granted",
      "vip_revoked",
      "vip_publication"
    ],

    levels: [
      "level_up",
      "level_changed",
      "level_reset",
      "level_manual_assignment"
    ],

    badges: [
      "badge_granted",
      "badge_removed"
    ],

    reports: [
      "new_report",
      "report_updated",
      "report_resolved",
      "report_dismissed"
    ],

    participants: [
      "participant_created",
      "profile_changed",
      "username_changed",
      "participant_blocked",
      "participant_unblocked"
    ],

    security: [
      "new_session",
      "session_closed",
      "suspicious_activity",
      "security_event"
    ],

    system: [
      "system_message",
      "maintenance",
      "service_status",
      "important_update"
    ]
  };

  const EVENT_LABELS = {
    new_comment: "Новый комментарий",
    reply: "Ответ на комментарий",
    mention: "Упоминание",
    comment_reaction: "Реакция на комментарий",
    comment_edited: "Комментарий изменён",
    comment_deleted: "Комментарий удалён",
    comment_pinned: "Комментарий закреплён",

    publication_submitted: "Публикация отправлена",
    publication_approved: "Публикация одобрена",
    publication_rejected: "Публикация отклонена",
    publication_published: "Публикация опубликована",
    publication_edited: "Публикация изменена",
    publication_deleted: "Публикация удалена",
    publication_expired: "Публикация истекла",
    publication_pinned: "Публикация закреплена",

    new_message: "Новое сообщение",
    message_reply: "Ответ на сообщение",
    message_reaction: "Реакция на сообщение",
    message_edited: "Сообщение изменено",
    message_deleted: "Сообщение удалено",
    chat_started: "Новый чат",
    chat_closed: "Чат закрыт",

    new_reaction: "Новая реакция",
    reaction_removed: "Реакция удалена",
    reaction_milestone: "Важный результат реакций",

    new_review: "Новый отзыв",
    review_reply: "Ответ на отзыв",
    review_reaction: "Реакция на отзыв",
    review_edited: "Отзыв изменён",
    review_deleted: "Отзыв удалён",
    rating_changed: "Изменение рейтинга",

    publication_shared: "Публикацию поделились",
    publication_sent: "Публикацию отправили",
    share_milestone: "Важный результат распространения",

    payment_request: "Запрос платежа",
    payment_confirmed: "Платёж подтверждён",
    payment_rejected: "Платёж отклонён",
    payment_refunded: "Возврат платежа",

    premium_requested: "Запрос Premium",
    premium_granted: "Premium выдан",
    premium_revoked: "Premium отключён",
    premium_expiring: "Premium заканчивается",

    pro_requested: "Запрос PRO",
    pro_granted: "PRO выдан",
    pro_revoked: "PRO отключён",
    pro_expiring: "PRO заканчивается",

    top_requested: "Запрос TOP",
    top_granted: "TOP выдан",
    top_revoked: "TOP отключён",
    top_expiring: "TOP заканчивается",

    vip_requested: "Запрос VIP",
    vip_granted: "VIP выдан",
    vip_revoked: "VIP отключён",
    vip_publication: "VIP-публикация",

    level_up: "Повышение уровня",
    level_changed: "Уровень изменён",
    level_reset: "Уровень сброшен",
    level_manual_assignment: "Уровень назначен администратором",

    badge_granted: "Значок выдан",
    badge_removed: "Значок удалён",

    new_report: "Новая жалоба",
    report_updated: "Жалоба обновлена",
    report_resolved: "Жалоба решена",
    report_dismissed: "Жалоба отклонена",

    participant_created: "Создан участник",
    profile_changed: "Профиль изменён",
    username_changed: "Username изменён",
    participant_blocked: "Участник заблокирован",
    participant_unblocked: "Участник разблокирован",

    new_session: "Новая сессия",
    session_closed: "Сессия закрыта",
    suspicious_activity: "Подозрительная активность",
    security_event: "Событие безопасности",

    system_message: "Системное сообщение",
    maintenance: "Технические работы",
    service_status: "Состояние сервиса",
    important_update: "Важное обновление"
  };


  // ==========================================================
  // HELPERS
  // ==========================================================

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clone(value) {
    try {
      return structuredClone(value);
    } catch {
      return JSON.parse(JSON.stringify(value));
    }
  }

  function deepMerge(base, extra) {
    const result = clone(base || {});

    if (!extra || typeof extra !== "object") {
      return result;
    }

    Object.entries(extra).forEach(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        result[key] = deepMerge(
          result[key] || {},
          value
        );
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  function toast(message, type = "info") {
    if (window.TOToast) {
      window.TOToast(message, type);
      return;
    }

    let container = qs("#notificationSettingsToasts");

    if (!container) {
      container = document.createElement("div");
      container.id = "notificationSettingsToasts";
      container.style.cssText = `
        position:fixed;
        right:20px;
        bottom:20px;
        z-index:999999;
        display:flex;
        flex-direction:column;
        gap:10px;
      `;
      document.body.appendChild(container);
    }

    const item = document.createElement("div");

    item.textContent = message;

    item.style.cssText = `
      background:#111827;
      color:white;
      padding:12px 16px;
      border-radius:12px;
      box-shadow:0 12px 30px rgba(0,0,0,.25);
      font-size:14px;
      max-width:340px;
    `;

    container.appendChild(item);

    setTimeout(() => {
      item.remove();
    }, 3500);
  }


  // ==========================================================
  // API
  // ==========================================================

  async function apiRequest(
    url,
    options = {}
  ) {
    const response = await fetch(
      url,
      {
        credentials: "include",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      }
    );

    let data = null;

    try {
      data = await response.json();
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


  // ==========================================================
  // DEFAULT SETTINGS
  // ==========================================================

  function defaultChannelSettings() {
    return {
      in_app: true,
      push: true,
      sound: true,
      vibration: true,
      badge: true,
      email: false,
      system_chat: true
    };
  }

  function defaultCategorySettings() {
    const result = {};

    DEFAULT_CATEGORIES.forEach(category => {
      result[category.id] = {
        enabled: true,
        channels: defaultChannelSettings(),
        events: {}
      };

      const events =
        DEFAULT_EVENTS[category.id] || [];

      events.forEach(event => {
        result[category.id].events[event] = {
          enabled: true,
          channels: defaultChannelSettings()
        };
      });
    });

    return result;
  }

  function defaultSettings() {
    return {
      enabled: true,

      global: true,

      sound: true,
      vibration: true,
      badge: true,

      push: true,
      email: false,
      system_chat: true,

      instant: true,
      grouped: false,

      quiet_hours: {
        enabled: false,
        start: "23:00",
        end: "07:00"
      },

      retention_days: 90,

      categories:
        defaultCategorySettings()
    };
  }


  // ==========================================================
  // LOAD
  // ==========================================================

  async function loadSettings(
    participantId = null
  ) {

    STATE.loading = true;

    try {

      const params =
        new URLSearchParams();

      if (participantId) {
        params.set(
          "participant_id",
          participantId
        );
      }

      params.set(
        "scope",
        participantId
          ? "participant"
          : "global"
      );

      let data = null;

      try {
        data = await apiRequest(
          `${API}/settings?${params.toString()}`
        );
      } catch {
        data = null;
      }

      const defaults =
        defaultSettings();

      STATE.global =
        deepMerge(
          defaults,
          data?.global ||
          data?.settings ||
          {}
        );

      STATE.participant =
        deepMerge(
          defaults,
          data?.participant ||
          {}
        );

      STATE.forced =
        deepMerge(
          defaults,
          data?.forced ||
          {}
        );

      STATE.categories =
        data?.categories ||
        DEFAULT_CATEGORIES;

      STATE.events =
        data?.events ||
        DEFAULT_EVENTS;

      STATE.lastSavedAt =
        data?.updated_at ||
        null;

      STATE.dirty = false;

      render();

    } finally {

      STATE.loading = false;
    }
  }


  // ==========================================================
  // SAVE
  // ==========================================================

  async function saveSettings() {

    if (STATE.saving) {
      return;
    }

    STATE.saving = true;

    try {

      const payload = {
        scope:
          STATE.participantId
            ? "participant"
            : "global",

        participant_id:
          STATE.participantId,

        global:
          STATE.global,

        participant:
          STATE.participant,

        forced:
          STATE.forced,

        categories:
          STATE.categories,

        events:
          STATE.events
      };

      await apiRequest(
        `${API}/settings`,
        {
          method: "PUT",
          body: JSON.stringify(payload)
        }
      );

      STATE.dirty = false;

      STATE.lastSavedAt =
        new Date().toISOString();

      toast(
        "Настройки уведомлений сохранены.",
        "success"
      );

      render();

    } catch (error) {

      toast(
        error.message ||
        "Не удалось сохранить настройки.",
        "error"
      );

    } finally {

      STATE.saving = false;
    }
  }


  // ==========================================================
  // UPDATE VALUE
  // ==========================================================

  function update(
    scope,
    path,
    value
  ) {

    const target =
      scope === "forced"
        ? STATE.forced
        : scope === "participant"
          ? STATE.participant
          : STATE.global;

    const parts =
      path.split(".");

    let current = target;

    for (
      let i = 0;
      i < parts.length - 1;
      i++
    ) {

      if (
        !current[parts[i]] ||
        typeof current[parts[i]] !== "object"
      ) {
        current[parts[i]] = {};
      }

      current =
        current[parts[i]];
    }

    current[
      parts[parts.length - 1]
    ] = value;

    STATE.dirty = true;
  }


  // ==========================================================
  // GET VALUE
  // ==========================================================

  function getValue(
    scope,
    path,
    fallback = false
  ) {

    const target =
      scope === "forced"
        ? STATE.forced
        : scope === "participant"
          ? STATE.participant
          : STATE.global;

    const parts =
      path.split(".");

    let current = target;

    for (const part of parts) {

      if (
        current == null ||
        typeof current !== "object" ||
        !(part in current)
      ) {
        return fallback;
      }

      current =
        current[part];
    }

    return current;
  }


  // ==========================================================
  // FORCE SETTINGS
  // ==========================================================

  function isForced(
    category,
    event = null,
    channel = null
  ) {

    if (!category) {
      return false;
    }

    const forced =
      STATE.forced?.categories?.[category];

    if (!forced) {
      return false;
    }

    if (
      event &&
      forced.events?.[event]
    ) {

      if (
        channel &&
        forced.events[event]
          .channels?.[channel] !== undefined
      ) {
        return true;
      }

      return true;
    }

    if (
      channel &&
      forced.channels?.[channel] !== undefined
    ) {
      return true;
    }

    return (
      forced.enabled !== undefined
    );
  }


  // ==========================================================
  // RENDER ROOT
  // ==========================================================

  function render() {

    const root =
      qs(
        "#notificationSettingsPanel"
      ) ||
      qs(
        "[data-notification-settings]"
      );

    if (!root) {
      return;
    }

    root.innerHTML = `
      <div class="notification-settings">

        <div class="notification-settings-header">

          <div>
            <div class="notification-settings-title">
              🔔 Настройки уведомлений
            </div>

            <div class="notification-settings-subtitle">
              Полный контроль уведомлений Tajik Opportunities
            </div>
          </div>

          <div class="notification-settings-actions">

            ${
              STATE.dirty
                ? `
                  <span class="notification-settings-unsaved">
                    ● Есть несохранённые изменения
                  </span>
                `
                : ""
            }

            <button
              type="button"
              data-notification-save
              ${STATE.saving ? "disabled" : ""}
            >
              ${
                STATE.saving
                  ? "Сохранение..."
                  : "💾 Сохранить"
              }
            </button>

          </div>

        </div>

        ${renderOverview()}

        ${renderGlobalSettings()}

        ${renderChannels()}

        ${renderCategories()}

        ${renderForcedSettings()}

        ${renderQuietHours()}

        ${renderRetention()}

      </div>
    `;

    bindEvents(root);
  }


  // ==========================================================
  // OVERVIEW
  // ==========================================================

  function renderOverview() {

    const settings =
      STATE.participantId
        ? STATE.participant
        : STATE.global;

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          Основные параметры
        </div>

        <div class="notification-settings-grid">

          ${toggleCard(
            "notifications-master",
            "🔔",
            "Уведомления",
            "Главный переключатель уведомлений",
            settings.enabled,
            STATE.participantId
              ? "participant.enabled"
              : "enabled",
            "participant"
          )}

          ${toggleCard(
            "notifications-in-app",
            "📱",
            "В приложении",
            "Показывать уведомления внутри Tajik Opportunities",
            settings.global,
            STATE.participantId
              ? "participant.global"
              : "global",
            "participant"
          )}

          ${toggleCard(
            "notifications-push",
            "📲",
            "Push",
            "Push-уведомления на устройство",
            settings.push,
            STATE.participantId
              ? "participant.push"
              : "push",
            "participant"
          )}

          ${toggleCard(
            "notifications-badge",
            "🔴",
            "Badge",
            "Показывать количество непрочитанных уведомлений",
            settings.badge,
            STATE.participantId
              ? "participant.badge"
              : "badge",
            "participant"
          )}

        </div>

      </section>
    `;
  }


  // ==========================================================
  // GLOBAL
  // ==========================================================

  function renderGlobalSettings() {

    const settings =
      STATE.participantId
        ? STATE.participant
        : STATE.global;

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          ⚙️ Общие настройки
        </div>

        <div class="notification-settings-options">

          ${checkbox(
            "sound",
            "🔊 Звук",
            settings.sound,
            `updateSetting('sound', this.checked)`
          )}

          ${checkbox(
            "vibration",
            "📳 Вибрация",
            settings.vibration,
            `updateSetting('vibration', this.checked)`
          )}

          ${checkbox(
            "push",
            "📲 Push",
            settings.push,
            `updateSetting('push', this.checked)`
          )}

          ${checkbox(
            "email",
            "📧 Email",
            settings.email,
            `updateSetting('email', this.checked)`
          )}

          ${checkbox(
            "system_chat",
            "🇹🇯 Системный чат",
            settings.system_chat,
            `updateSetting('system_chat', this.checked)`
          )}

          ${checkbox(
            "instant",
            "⚡ Мгновенная доставка",
            settings.instant,
            `updateSetting('instant', this.checked)`
          )}

          ${checkbox(
            "grouped",
            "📦 Группировать уведомления",
            settings.grouped,
            `updateSetting('grouped', this.checked)`
          )}

        </div>

      </section>
    `;
  }


  // ==========================================================
  // CHANNELS
  // ==========================================================

  function renderChannels() {

    const settings =
      STATE.participantId
        ? STATE.participant
        : STATE.global;

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          📡 Каналы доставки
        </div>

        <div class="notification-channel-grid">

          ${DEFAULT_CHANNELS.map(channel => {

            const enabled =
              settings[channel.id] !== undefined
                ? settings[channel.id]
                : true;

            return `
              <label
                class="notification-channel-card"
              >

                <span class="notification-channel-icon">
                  ${channel.icon}
                </span>

                <span class="notification-channel-content">

                  <strong>
                    ${escapeHtml(channel.name)}
                  </strong>

                  <small>
                    ${
                      channel.id === "push"
                        ? "Уведомления на телефон"
                        : channel.id === "email"
                          ? "Отправка на Email"
                          : channel.id === "system_chat"
                            ? "Уведомление через официальный чат"
                            : "Канал уведомлений"
                    }
                  </small>

                </span>

                <input
                  type="checkbox"
                  data-global-channel="${channel.id}"
                  ${enabled ? "checked" : ""}
                >

              </label>
            `;
          }).join("")}

        </div>

      </section>
    `;
  }


  // ==========================================================
  // CATEGORIES
  // ==========================================================

  function renderCategories() {

    const settings =
      STATE.participantId
        ? STATE.participant
        : STATE.global;

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          📂 Категории уведомлений
        </div>

        <div class="notification-category-list">

          ${DEFAULT_CATEGORIES.map(category => {

            const categorySettings =
              settings.categories?.[category.id] ||
              {};

            return `
              <details
                class="notification-category"
                data-category="${category.id}"
              >

                <summary>

                  <span class="notification-category-main">

                    <span class="notification-category-icon">
                      ${category.icon}
                    </span>

                    <span>
                      <strong>
                        ${escapeHtml(category.name)}
                      </strong>

                      <small>
                        ${escapeHtml(category.description)}
                      </small>
                    </span>

                  </span>

                  <span class="notification-category-controls">

                    <input
                      type="checkbox"
                      data-category-enabled="${category.id}"
                      ${
                        categorySettings.enabled !== false
                          ? "checked"
                          : ""
                      }
                    >

                  </span>

                </summary>

                <div class="notification-category-body">

                  <div class="notification-category-channels">

                    ${DEFAULT_CHANNELS.map(channel => {

                      const enabled =
                        categorySettings
                          .channels?.[channel.id] !== false;

                      const forced =
                        isForced(
                          category.id,
                          null,
                          channel.id
                        );

                      return `
                        <label
                          class="notification-mini-channel
                          ${forced ? "is-forced" : ""}"
                        >

                          <span>
                            ${channel.icon}
                            ${escapeHtml(channel.name)}
                          </span>

                          <input
                            type="checkbox"
                            data-category-channel="${category.id}"
                            data-channel="${channel.id}"
                            ${
                              enabled
                                ? "checked"
                                : ""
                            }
                            ${
                              forced
                                ? "disabled"
                                : ""
                            }
                          >

                          ${
                            forced
                              ? `
                                <em>
                                  🔒
                                </em>
                              `
                              : ""
                          }

                        </label>
                      `;
                    }).join("")}

                  </div>

                  ${renderEvents(
                    category.id,
                    categorySettings
                  )}

                </div>

              </details>
            `;
          }).join("")}

        </div>

      </section>
    `;
  }


  // ==========================================================
  // EVENTS
  // ==========================================================

  function renderEvents(
    categoryId,
    categorySettings
  ) {

    const events =
      DEFAULT_EVENTS[categoryId] ||
      [];

    if (!events.length) {
      return "";
    }

    return `
      <div class="notification-events">

        <div class="notification-events-title">
          События категории
        </div>

        ${events.map(event => {

          const eventSettings =
            categorySettings.events?.[event] ||
            {
              enabled: true,
              channels: defaultChannelSettings()
            };

          const forced =
            isForced(
              categoryId,
              event
            );

          return `
            <div
              class="notification-event
              ${forced ? "is-forced" : ""}"
            >

              <div class="notification-event-name">

                <span>
                  ${
                    escapeHtml(
                      EVENT_LABELS[event] ||
                      event
                    )
                  }
                </span>

                ${
                  forced
                    ? `<small>🔒 Принудительно</small>`
                    : ""
                }

              </div>

              <div class="notification-event-controls">

                <label>
                  <input
                    type="checkbox"
                    data-event-enabled="${categoryId}"
                    data-event="${event}"
                    ${
                      eventSettings.enabled !== false
                        ? "checked"
                        : ""
                    }
                    ${
                      forced
                        ? "disabled"
                        : ""
                    }
                  >
                  Вкл.
                </label>

                ${DEFAULT_CHANNELS.map(channel => {

                  const enabled =
                    eventSettings
                      .channels?.[channel.id] !== false;

                  const channelForced =
                    isForced(
                      categoryId,
                      event,
                      channel.id
                    );

                  return `
                    <label
                      title="${escapeHtml(
                        channel.name
                      )}"
                    >

                      <input
                        type="checkbox"
                        data-event-channel="${categoryId}"
                        data-event="${event}"
                        data-channel="${channel.id}"
                        ${
                          enabled
                            ? "checked"
                            : ""
                        }
                        ${
                          channelForced
                            ? "disabled"
                            : ""
                        }
                      >

                      ${channel.icon}

                    </label>
                  `;
                }).join("")}

              </div>

            </div>
          `;
        }).join("")}

      </div>
    `;
  }


  // ==========================================================
  // FORCED
  // ==========================================================

  function renderForcedSettings() {

    if (
      STATE.mode !== "admin" ||
      STATE.participantId
    ) {
      return "";
    }

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          🔒 Принудительные настройки
        </div>

        <div class="notification-forced-warning">

          <strong>
            Администратор имеет приоритет над настройками участника.
          </strong>

          <p>
            Принудительно включённые системные и безопасностные
            уведомления участник не сможет отключить.
          </p>

        </div>

        <div class="notification-forced-list">

          ${[
            ["security", "🔐", "Безопасность"],
            ["system", "⚙️", "Системные"],
            ["reports", "🚩", "Жалобы"],
            ["payments", "💰", "Платежи"]
          ].map(([id, icon, name]) => {

            const value =
              STATE.forced
                ?.categories
                ?.[id]
                ?.enabled === true;

            return `
              <label class="notification-forced-row">

                <span>
                  ${icon}
                  ${name}
                </span>

                <input
                  type="checkbox"
                  data-forced-category="${id}"
                  ${value ? "checked" : ""}
                >

              </label>
            `;
          }).join("")}

        </div>

      </section>
    `;
  }


  // ==========================================================
  // QUIET HOURS
  // ==========================================================

  function renderQuietHours() {

    const settings =
      STATE.participantId
        ? STATE.participant
        : STATE.global;

    const quiet =
      settings.quiet_hours ||
      {};

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          🌙 Тихие часы
        </div>

        <div class="notification-quiet">

          <label>
            <input
              type="checkbox"
              data-quiet-enabled
              ${
                quiet.enabled
                  ? "checked"
                  : ""
              }
            >

            Не беспокоить
          </label>

          <label>
            С:
            <input
              type="time"
              data-quiet-start
              value="${escapeHtml(
                quiet.start || "23:00"
              )}"
            >
          </label>

          <label>
            До:
            <input
              type="time"
              data-quiet-end
              value="${escapeHtml(
                quiet.end || "07:00"
              )}"
            >
          </label>

        </div>

      </section>
    `;
  }


  // ==========================================================
  // RETENTION
  // ==========================================================

  function renderRetention() {

    const settings =
      STATE.participantId
        ? STATE.participant
        : STATE.global;

    return `
      <section class="notification-settings-section">

        <div class="notification-settings-section-title">
          🗂 История уведомлений
        </div>

        <label class="notification-retention">

          <span>
            Срок хранения истории
          </span>

          <select data-retention>

            ${[
              [7, "7 дней"],
              [30, "30 дней"],
              [90, "90 дней"],
              [180, "180 дней"],
              [365, "1 год"],
              [0, "Бессрочно"]
            ].map(([value, label]) => `
              <option
                value="${value}"
                ${
                  Number(
                    settings.retention_days
                  ) === value
                    ? "selected"
                    : ""
                }
              >
                ${label}
              </option>
            `).join("")}

          </select>

        </label>

      </section>
    `;
  }


  // ==========================================================
  // UI COMPONENTS
  // ==========================================================

  function toggleCard(
    id,
    icon,
    title,
    description,
    checked,
    path,
    scope
  ) {

    return `
      <label
        class="notification-toggle-card"
        for="${id}"
      >

        <span class="notification-toggle-icon">
          ${icon}
        </span>

        <span class="notification-toggle-content">

          <strong>
            ${escapeHtml(title)}
          </strong>

          <small>
            ${escapeHtml(description)}
          </small>

        </span>

        <input
          id="${id}"
          type="checkbox"
          data-setting-path="${escapeHtml(path)}"
          data-setting-scope="${scope}"
          ${
            checked
              ? "checked"
              : ""
          }
        >

      </label>
    `;
  }


  function checkbox(
    id,
    label,
    checked,
    onchange
  ) {

    return `
      <label class="notification-option">

        <input
          type="checkbox"
          data-option="${id}"
          ${
            checked
              ? "checked"
              : ""
          }
        >

        <span>
          ${label}
        </span>

      </label>
    `;
  }


  // ==========================================================
  // EVENTS
  // ==========================================================

  function bindEvents(root) {

    const save =
      qs(
        "[data-notification-save]",
        root
      );

    if (save) {
      save.addEventListener(
        "click",
        saveSettings
      );
    }


    // --------------------------------------------------------
    // MAIN SETTINGS
    // --------------------------------------------------------

    qsa(
      "[data-setting-path]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          update(
            input.dataset.settingScope,
            input.dataset.settingPath,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // OPTIONS
    // --------------------------------------------------------

    qsa(
      "[data-option]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            input.dataset.option,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // GLOBAL CHANNELS
    // --------------------------------------------------------

    qsa(
      "[data-global-channel]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            input.dataset.globalChannel,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // CATEGORY ENABLE
    // --------------------------------------------------------

    qsa(
      "[data-category-enabled]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const category =
            input.dataset.categoryEnabled;

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            `categories.${category}.enabled`,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // CATEGORY CHANNEL
    // --------------------------------------------------------

    qsa(
      "[data-category-channel]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const category =
            input.dataset.categoryChannel;

          const channel =
            input.dataset.channel;

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            `categories.${category}.channels.${channel}`,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // EVENT ENABLE
    // --------------------------------------------------------

    qsa(
      "[data-event-enabled]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const category =
            input.dataset.eventEnabled;

          const event =
            input.dataset.event;

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            `categories.${category}.events.${event}.enabled`,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // EVENT CHANNEL
    // --------------------------------------------------------

    qsa(
      "[data-event-channel]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const category =
            input.dataset.eventChannel;

          const event =
            input.dataset.event;

          const channel =
            input.dataset.channel;

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            `categories.${category}.events.${event}.channels.${channel}`,
            input.checked
          );

          render();
        }
      );
    });


    // --------------------------------------------------------
    // FORCED
    // --------------------------------------------------------

    qsa(
      "[data-forced-category]",
      root
    ).forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const category =
            input.dataset.forcedCategory;

          if (
            !STATE.forced.categories
          ) {
            STATE.forced.categories = {};
          }

          if (
            !STATE.forced.categories[category]
          ) {
            STATE.forced.categories[category] = {};
          }

          STATE.forced
            .categories[category]
            .enabled =
              input.checked;

          STATE.dirty = true;

          render();
        }
      );
    });


    // --------------------------------------------------------
    // QUIET HOURS
    // --------------------------------------------------------

    const quietEnabled =
      qs(
        "[data-quiet-enabled]",
        root
      );

    const quietStart =
      qs(
        "[data-quiet-start]",
        root
      );

    const quietEnd =
      qs(
        "[data-quiet-end]",
        root
      );

    if (quietEnabled) {

      quietEnabled.addEventListener(
        "change",
        () => {

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            "quiet_hours.enabled",
            quietEnabled.checked
          );

          render();
        }
      );
    }

    if (quietStart) {

      quietStart.addEventListener(
        "change",
        () => {

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            "quiet_hours.start",
            quietStart.value
          );

          render();
        }
      );
    }

    if (quietEnd) {

      quietEnd.addEventListener(
        "change",
        () => {

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            "quiet_hours.end",
            quietEnd.value
          );

          render();
        }
      );
    }


    // --------------------------------------------------------
    // RETENTION
    // --------------------------------------------------------

    const retention =
      qs(
        "[data-retention]",
        root
      );

    if (retention) {

      retention.addEventListener(
        "change",
        () => {

          const scope =
            STATE.participantId
              ? "participant"
              : "global";

          update(
            scope,
            "retention_days",
            Number(
              retention.value
            )
          );

          render();
        }
      );
    }
  }


  // ==========================================================
  // ADMIN / PARTICIPANT MODE
  // ==========================================================

  async function openGlobalSettings() {

    STATE.mode = "admin";
    STATE.participantId = null;

    await loadSettings();
  }


  async function openParticipantSettings(
    participantId
  ) {

    if (!participantId) {
      throw new Error(
        "Не указан ID участника."
      );
    }

    STATE.mode = "admin";

    STATE.participantId =
      participantId;

    await loadSettings(
      participantId
    );
  }


  function getState() {
    return clone(STATE);
  }


  // ==========================================================
  // RESET
  // ==========================================================

  function resetUnsaved() {

    if (!STATE.dirty) {
      return;
    }

    loadSettings(
      STATE.participantId
    );
  }


  // ==========================================================
  // PUBLIC API
  // ==========================================================

  window.TONotificationSettings = {

    init(options = {}) {

      if (
        options.mode
      ) {
        STATE.mode =
          options.mode;
      }

      if (
        options.participantId
      ) {
        STATE.participantId =
          options.participantId;
      }

      STATE.initialized = true;

      return loadSettings(
        STATE.participantId
      );
    },

    load:
      loadSettings,

    save:
      saveSettings,

    render,

    openGlobal:
      openGlobalSettings,

    openParticipant:
      openParticipantSettings,

    reset:
      resetUnsaved,

    getState,

    update,

    getValue,

    isForced,

    categories:
      DEFAULT_CATEGORIES,

    events:
      DEFAULT_EVENTS,

    channels:
      DEFAULT_CHANNELS
  };


  // Алиас
  window.NotificationSettings =
    window.TONotificationSettings;


  // ==========================================================
  // AUTO INIT
  // ==========================================================

  function autoInit() {

    const root =
      qs(
        "#notificationSettingsPanel"
      ) ||
      qs(
        "[data-notification-settings]"
      );

    if (!root) {
      return;
    }

    if (
      STATE.initialized
    ) {
      return;
    }

    STATE.initialized = true;

    loadSettings()
      .catch(error => {

        console.warn(
          "Notification settings initialization failed:",
          error
        );

        render();
      });
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      autoInit,
      { once: true }
    );

  } else {

    autoInit();
  }

})();
