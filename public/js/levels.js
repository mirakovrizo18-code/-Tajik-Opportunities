"use strict";

/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   TO LEVEL SYSTEM
   ------------------------------------------------------------
   Уровни участника: Lv.0 — Lv.12

   Lv.0:
   • технический уровень
   • публично НЕ отображается

   Lv.1–Lv.12:
   • публично отображаются
   • собственный badge
   • название
   • описание
   • прогресс
   • достижения

   ВАЖНО:
   • TO Level НЕ равен FREE / TOP / PREMIUM / PRO / VIP
   • уровень и права пользователя разделены
   • администратор может назначить любой Lv.1–Lv.12
   • администратор может вернуть Lv.0
   • автоматический уровень отделён от ручного
   • режимы: automatic / manual / hybrid
   • сервер остаётся источником истины
   ============================================================ */

(function (window, document) {
  "use strict";

  const CONFIG = {
    api: {
      profile: "/api/levels/profile",
      levels: "/api/levels",
      progress: "/api/levels/progress",
      history: "/api/levels/history",

      adminProfile: "/api/admin/levels/participant",
      adminSet: "/api/admin/levels/set",
      adminReset: "/api/admin/levels/reset",
      adminHistory: "/api/admin/levels/history",
      adminSettings: "/api/admin/levels/settings"
    },

    storage: {
      profile: "to_level_profile_v1",
      settings: "to_level_settings_v1"
    },

    minLevel: 0,
    maxLevel: 12,

    publicMinLevel: 1,

    modes: {
      AUTOMATIC: "automatic",
      MANUAL: "manual",
      HYBRID: "hybrid"
    },

    defaultMode: "hybrid",

    badgePrefix: "🇹🇯 TO Lv. ",

    languages: [
      "ru",
      "tj",
      "en",
      "uz"
    ],

    levels: [
      {
        level: 0,
        name: {
          ru: "Без уровня",
          tj: "Бе сатҳ",
          en: "No Level",
          uz: "Darajasiz"
        },
        short: {
          ru: "Lv.0",
          tj: "Lv.0",
          en: "Lv.0",
          uz: "Lv.0"
        },
        description: {
          ru: "Технический начальный уровень. Публично не отображается.",
          tj: "Сатҳи ибтидоии техникӣ. Ба таври умумӣ намоиш дода намешавад.",
          en: "Technical initial level. Not publicly displayed.",
          uz: "Texnik boshlang‘ich daraja. Ommaga ko‘rsatilmaydi."
        },
        public: false
      },

      {
        level: 1,
        name: {
          ru: "Новичок",
          tj: "Навомӯз",
          en: "Newcomer",
          uz: "Yangi ishtirokchi"
        },
        short: {
          ru: "Lv.1",
          tj: "Lv.1",
          en: "Lv.1",
          uz: "Lv.1"
        },
        description: {
          ru: "Начальный публичный уровень участника.",
          tj: "Сатҳи ибтидоии оммавии иштирокчӣ.",
          en: "The first public participant level.",
          uz: "Ishtirokchining birinchi ommaviy darajasi."
        },
        public: true
      },

      {
        level: 2,
        name: {
          ru: "Участник",
          tj: "Иштирокчӣ",
          en: "Participant",
          uz: "Ishtirokchi"
        },
        short: {
          ru: "Lv.2",
          tj: "Lv.2",
          en: "Lv.2",
          uz: "Lv.2"
        },
        description: {
          ru: "Активный участник платформы.",
          tj: "Иштирокчии фаъоли платформа.",
          en: "An active platform participant.",
          uz: "Platformaning faol ishtirokchisi."
        },
        public: true
      },

      {
        level: 3,
        name: {
          ru: "Активный",
          tj: "Фаъол",
          en: "Active",
          uz: "Faol"
        },
        short: {
          ru: "Lv.3",
          tj: "Lv.3",
          en: "Lv.3",
          uz: "Lv.3"
        },
        description: {
          ru: "Участник с регулярной полезной активностью.",
          tj: "Иштирокчии дорои фаъолияти мунтазами муфид.",
          en: "A participant with regular useful activity.",
          uz: "Muntazam foydali faoliyatga ega ishtirokchi."
        },
        public: true
      },

      {
        level: 4,
        name: {
          ru: "Продвинутый",
          tj: "Пешрафта",
          en: "Advanced",
          uz: "Ilg‘or"
        },
        short: {
          ru: "Lv.4",
          tj: "Lv.4",
          en: "Lv.4",
          uz: "Lv.4"
        },
        description: {
          ru: "Продвинутый участник с заметным вкладом.",
          tj: "Иштирокчии пешрафта бо саҳми назаррас.",
          en: "An advanced participant with meaningful contribution.",
          uz: "Sezilarli hissa qo‘shgan ilg‘or ishtirokchi."
        },
        public: true
      },

      {
        level: 5,
        name: {
          ru: "Доверенный",
          tj: "Эътимоднок",
          en: "Trusted",
          uz: "Ishonchli"
        },
        short: {
          ru: "Lv.5",
          tj: "Lv.5",
          en: "Lv.5",
          uz: "Lv.5"
        },
        description: {
          ru: "Участник с устойчивой положительной репутацией.",
          tj: "Иштирокчии дорои обрӯи устувори мусбат.",
          en: "A participant with a stable positive reputation.",
          uz: "Barqaror ijobiy obro‘ga ega ishtirokchi."
        },
        public: true
      },

      {
        level: 6,
        name: {
          ru: "Опытный",
          tj: "Таҷрибадор",
          en: "Experienced",
          uz: "Tajribali"
        },
        short: {
          ru: "Lv.6",
          tj: "Lv.6",
          en: "Lv.6",
          uz: "Lv.6"
        },
        description: {
          ru: "Опытный участник с высокой полезной активностью.",
          tj: "Иштирокчии ботаҷриба бо фаъолияти баланди муфид.",
          en: "An experienced participant with strong useful activity.",
          uz: "Yuqori foydali faollikka ega tajribali ishtirokchi."
        },
        public: true
      },

      {
        level: 7,
        name: {
          ru: "Проверенный участник",
          tj: "Иштирокчии санҷидашуда",
          en: "Verified Participant",
          uz: "Tasdiqlangan ishtirokchi"
        },
        short: {
          ru: "Lv.7",
          tj: "Lv.7",
          en: "Lv.7",
          uz: "Lv.7"
        },
        description: {
          ru: "Высокий уровень доверия и активности.",
          tj: "Сатҳи баланди эътимод ва фаъолият.",
          en: "A high level of trust and activity.",
          uz: "Yuqori ishonch va faollik darajasi."
        },
        public: true
      },

      {
        level: 8,
        name: {
          ru: "Авторитетный",
          tj: "Бонуфуз",
          en: "Respected",
          uz: "Nufuzli"
        },
        short: {
          ru: "Lv.8",
          tj: "Lv.8",
          en: "Lv.8",
          uz: "Lv.8"
        },
        description: {
          ru: "Авторитетный участник сообщества.",
          tj: "Иштирокчии бонуфузи ҷомеа.",
          en: "A respected community participant.",
          uz: "Hamjamiyatdagi nufuzli ishtirokchi."
        },
        public: true
      },

      {
        level: 9,
        name: {
          ru: "Профессионал",
          tj: "Мутахассис",
          en: "Professional",
          uz: "Professional"
        },
        short: {
          ru: "Lv.9",
          tj: "Lv.9",
          en: "Lv.9",
          uz: "Lv.9"
        },
        description: {
          ru: "Профессиональный уровень участника.",
          tj: "Сатҳи касбии иштирокчӣ.",
          en: "A professional participant level.",
          uz: "Ishtirokchining professional darajasi."
        },
        public: true
      },

      {
        level: 10,
        name: {
          ru: "Лидер",
          tj: "Роҳбар",
          en: "Leader",
          uz: "Lider"
        },
        short: {
          ru: "Lv.10",
          tj: "Lv.10",
          en: "Lv.10",
          uz: "Lv.10"
        },
        description: {
          ru: "Высокий лидерский уровень.",
          tj: "Сатҳи баланди роҳбарӣ.",
          en: "A high leadership level.",
          uz: "Yuqori yetakchilik darajasi."
        },
        public: true
      },

      {
        level: 11,
        name: {
          ru: "Элита",
          tj: "Элита",
          en: "Elite",
          uz: "Elita"
        },
        short: {
          ru: "Lv.11",
          tj: "Lv.11",
          en: "Lv.11",
          uz: "Lv.11"
        },
        description: {
          ru: "Элитный уровень участника.",
          tj: "Сатҳи элитаи иштирокчӣ.",
          en: "An elite participant level.",
          uz: "Ishtirokchining elita darajasi."
        },
        public: true
      },

      {
        level: 12,
        name: {
          ru: "Global",
          tj: "Global",
          en: "Global",
          uz: "Global"
        },
        short: {
          ru: "Lv.12",
          tj: "Lv.12",
          en: "Lv.12",
          uz: "Lv.12"
        },
        description: {
          ru: "Максимальный уровень Tajik Opportunities.",
          tj: "Сатҳи баландтарини Tajik Opportunities.",
          en: "The highest Tajik Opportunities level.",
          uz: "Tajik Opportunities platformasidagi eng yuqori daraja."
        },
        public: true
      }
    ],

    actions: {
      profile_complete: {
        label: "Заполнение профиля",
        defaultXp: 10
      },

      profile_verified: {
        label: "Проверка профиля",
        defaultXp: 50
      },

      publication_created: {
        label: "Создание публикации",
        defaultXp: 20
      },

      publication_published: {
        label: "Публикация одобрена",
        defaultXp: 30
      },

      useful_reaction_received: {
        label: "Получена полезная реакция",
        defaultXp: 3
      },

      comment_created: {
        label: "Комментарий",
        defaultXp: 2
      },

      reply_created: {
        label: "Ответ",
        defaultXp: 2
      },

      share_received: {
        label: "Публикация поделена",
        defaultXp: 5
      },

      bookmark_received: {
        label: "Публикация сохранена",
        defaultXp: 3
      },

      review_received: {
        label: "Получен отзыв",
        defaultXp: 5
      },

      positive_review: {
        label: "Положительный отзыв",
        defaultXp: 10
      },

      premium_activity: {
        label: "Premium активность",
        defaultXp: 10
      },

      top_activity: {
        label: "TOP активность",
        defaultXp: 10
      },

      pro_activity: {
        label: "PRO активность",
        defaultXp: 15
      },

      vip_activity: {
        label: "VIP активность",
        defaultXp: 15
      },

      achievement_unlocked: {
        label: "Достижение",
        defaultXp: 25
      },

      admin_bonus: {
        label: "Административный бонус",
        defaultXp: 0
      }
    },

    defaultThresholds: [
      0,
      100,
      300,
      700,
      1500,
      3000,
      5500,
      9000,
      14000,
      21000,
      30000,
      42000,
      60000
    ],

    defaultSettings: {
      enabled: true,

      mode: "hybrid",

      showBadge: true,
      showProgress: true,
      showLevelName: true,

      automaticPromotion: true,
      automaticDemotion: false,

      adminOverride: true,

      level0Public: false,

      requireUniqueActions: true,
      antiSpam: true,

      resetProgressOnDemotion: false,

      thresholds: [
        0,
        100,
        300,
        700,
        1500,
        3000,
        5500,
        9000,
        14000,
        21000,
        30000,
        42000,
        60000
      ]
    }
  };

  const state = {
    loaded: false,

    participantId: null,

    profile: {
      level: 0,
      automaticLevel: 0,
      manualLevel: null,

      xp: 0,

      mode: CONFIG.defaultMode,

      progress: 0,
      nextThreshold: 100,

      badgeVisible: false,

      achievements: [],

      permissions: {}
    },

    settings: JSON.parse(
      JSON.stringify(CONFIG.defaultSettings)
    ),

    definitions: CONFIG.levels.slice(),

    history: [],

    adminMode: false,

    actingAsParticipant: false,

    dirty: false,

    saving: false,

    listeners: new Set()
  };

  /* ============================================================
     EVENTS
     ============================================================ */

  function emit(event, detail) {
    const payload = {
      event,
      detail: detail || {},
      state
    };

    state.listeners.forEach(function (listener) {
      try {
        listener(payload);
      } catch (error) {
        console.error(
          "[TO Levels] listener error:",
          error
        );
      }
    });

    document.dispatchEvent(
      new CustomEvent(
        "to:levels:" + event,
        {
          detail: payload
        }
      )
    );
  }

  function on(event, listener) {
    if (typeof listener !== "function") {
      return function () {};
    }

    const wrapped = function (payload) {
      if (
        !payload ||
        payload.event === event
      ) {
        listener(payload);
      }
    };

    state.listeners.add(wrapped);

    return function unsubscribe() {
      state.listeners.delete(wrapped);
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
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getLanguage() {
    const lang =
      document.documentElement?.lang ||
      navigator.language ||
      "ru";

    if (
      CONFIG.languages.includes(
        lang.toLowerCase()
      )
    ) {
      return lang.toLowerCase();
    }

    if (
      lang.toLowerCase().startsWith("tj")
    ) {
      return "tj";
    }

    if (
      lang.toLowerCase().startsWith("uz")
    ) {
      return "uz";
    }

    if (
      lang.toLowerCase().startsWith("en")
    ) {
      return "en";
    }

    return "ru";
  }

  function normalizeLevel(level) {
    const value =
      Number(level);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(
      CONFIG.minLevel,
      Math.min(
        CONFIG.maxLevel,
        Math.floor(value)
      )
    );
  }

  function getDefinition(level) {
    const normalized =
      normalizeLevel(level);

    return (
      state.definitions.find(
        function (item) {
          return item.level === normalized;
        }
      ) ||
      CONFIG.levels[0]
    );
  }

  function getName(
    level,
    language
  ) {
    const definition =
      getDefinition(level);

    const lang =
      language || getLanguage();

    return (
      definition.name?.[lang] ||
      definition.name?.ru ||
      "Без уровня"
    );
  }

  function getDescription(
    level,
    language
  ) {
    const definition =
      getDefinition(level);

    const lang =
      language || getLanguage();

    return (
      definition.description?.[lang] ||
      definition.description?.ru ||
      ""
    );
  }

  function isPublicLevel(level) {
    return (
      normalizeLevel(level) >=
      CONFIG.publicMinLevel
    );
  }

  function getPublicLevel() {
    const level =
      normalizeLevel(
        state.profile.level
      );

    if (
      !isPublicLevel(level)
    ) {
      return 0;
    }

    return level;
  }

  function getBadgeText(
    level
  ) {
    const normalized =
      normalizeLevel(level);

    if (
      !isPublicLevel(normalized)
    ) {
      return "";
    }

    return (
      CONFIG.badgePrefix +
      normalized
    );
  }

  function getThreshold(level) {
    const normalized =
      normalizeLevel(level);

    return Number(
      state.settings.thresholds?.[
        normalized
      ] ??
      CONFIG.defaultThresholds[
        normalized
      ] ??
      0
    );
  }

  function getNextThreshold(level) {
    const normalized =
      normalizeLevel(level);

    if (
      normalized >=
      CONFIG.maxLevel
    ) {
      return null;
    }

    return Number(
      state.settings.thresholds?.[
        normalized + 1
      ] ??
      CONFIG.defaultThresholds[
        normalized + 1
      ] ??
      0
    );
  }

  function calculateProgress(
    xp,
    level
  ) {
    const currentXp =
      Math.max(
        0,
        Number(xp) || 0
      );

    const normalized =
      normalizeLevel(level);

    const currentThreshold =
      getThreshold(normalized);

    const nextThreshold =
      getNextThreshold(normalized);

    if (
      nextThreshold === null
    ) {
      return {
        xp: currentXp,
        currentThreshold,
        nextThreshold: null,
        value: 100,
        remaining: 0
      };
    }

    const range =
      nextThreshold -
      currentThreshold;

    const progress =
      range <= 0
        ? 100
        : Math.max(
            0,
            Math.min(
              100,
              (
                (
                  currentXp -
                  currentThreshold
                ) /
                range
              ) *
              100
            )
          );

    return {
      xp: currentXp,
      currentThreshold,
      nextThreshold,
      value: progress,
      remaining: Math.max(
        0,
        nextThreshold -
          currentXp
      )
    };
  }

  function calculateAutomaticLevel(
    xp
  ) {
    const currentXp =
      Math.max(
        0,
        Number(xp) || 0
      );

    let level = 0;

    for (
      let index = 0;
      index <= CONFIG.maxLevel;
      index += 1
    ) {
      const threshold =
        getThreshold(index);

      if (
        currentXp >= threshold
      ) {
        level = index;
      }
    }

    return normalizeLevel(level);
  }

  function resolveFinalLevel() {
    const automaticLevel =
      normalizeLevel(
        state.profile.automaticLevel
      );

    const manualLevel =
      state.profile.manualLevel === null ||
      state.profile.manualLevel === undefined
        ? null
        : normalizeLevel(
            state.profile.manualLevel
          );

    switch (
      state.profile.mode ||
      state.settings.mode
    ) {
      case CONFIG.modes.MANUAL:
        return manualLevel === null
          ? automaticLevel
          : manualLevel;

      case CONFIG.modes.AUTOMATIC:
        return automaticLevel;

      case CONFIG.modes.HYBRID:
      default:
        return manualLevel === null
          ? automaticLevel
          : manualLevel;
    }
  }

  function recalculate() {
    state.profile.automaticLevel =
      calculateAutomaticLevel(
        state.profile.xp
      );

    state.profile.level =
      resolveFinalLevel();

    const progress =
      calculateProgress(
        state.profile.xp,
        state.profile.level
      );

    state.profile.progress =
      progress.value;

    state.profile.nextThreshold =
      progress.nextThreshold;

    state.profile.badgeVisible =
      Boolean(
        state.settings.showBadge &&
        isPublicLevel(
          state.profile.level
        )
      );

    return state.profile;
  }

  function markDirty() {
    state.dirty = true;

    saveLocal();

    emit("changed");
  }

  function saveLocal() {
    try {
      localStorage.setItem(
        CONFIG.storage.profile,
        JSON.stringify(
          state.profile
        )
      );

      localStorage.setItem(
        CONFIG.storage.settings,
        JSON.stringify(
          state.settings
        )
      );
    } catch {
      /* storage может быть недоступен */
    }
  }

  function loadLocal() {
    try {
      const profileRaw =
        localStorage.getItem(
          CONFIG.storage.profile
        );

      const settingsRaw =
        localStorage.getItem(
          CONFIG.storage.settings
        );

      return {
        profile: profileRaw
          ? JSON.parse(profileRaw)
          : null,

        settings: settingsRaw
          ? JSON.parse(settingsRaw)
          : null
      };
    } catch {
      return {
        profile: null,
        settings: null
      };
    }
  }

  /* ============================================================
     API
     ============================================================ */

  async function request(
    url,
    options
  ) {
    const opts = Object.assign(
      {
        credentials: "include",
        headers: {
          Accept:
            "application/json",
          "Content-Type":
            "application/json"
        }
      },
      options || {}
    );

    const response =
      await fetch(
        url,
        opts
      );

    let data = null;

    try {
      data =
        await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
          data?.error ||
          "Ошибка системы уровней."
        );

      error.status =
        response.status;

      error.data =
        data;

      throw error;
    }

    return data;
  }

  async function load(
    options
  ) {
    const opts =
      options || {};

    emit("loading");

    const local =
      opts.useLocal === false
        ? null
        : loadLocal();

    if (
      local?.profile
    ) {
      state.profile =
        Object.assign(
          {},
          state.profile,
          local.profile
        );
    }

    if (
      local?.settings
    ) {
      state.settings =
        Object.assign(
          {},
          state.settings,
          local.settings
        );
    }

    recalculate();

    try {
      const query =
        new URLSearchParams();

      if (
        state.participantId
      ) {
        query.set(
          "participant_id",
          state.participantId
        );
      }

      const url =
        CONFIG.api.profile +
        (
          query.toString()
            ? "?" +
              query.toString()
            : ""
        );

      const data =
        await request(
          url,
          {
            method: "GET"
          }
        );

      if (
        data?.profile
      ) {
        state.profile =
          Object.assign(
            {},
            state.profile,
            data.profile
          );
      }

      if (
        data?.settings
      ) {
        state.settings =
          Object.assign(
            {},
            state.settings,
            data.settings
          );
      }

      if (
        Array.isArray(
          data?.levels
        )
      ) {
        state.definitions =
          data.levels;
      }

      recalculate();

      state.loaded = true;
      state.dirty = false;

      saveLocal();

      emit(
        "loaded",
        data
      );

      return data;
    } catch (error) {
      emit(
        "error",
        {
          action: "load",
          error
        }
      );

      throw error;
    }
  }

  async function loadProgress() {
    const query =
      new URLSearchParams();

    if (
      state.participantId
    ) {
      query.set(
        "participant_id",
        state.participantId
      );
    }

    const url =
      CONFIG.api.progress +
      (
        query.toString()
          ? "?" +
            query.toString()
          : ""
      );

    return request(
      url,
      {
        method: "GET"
      }
    );
  }

  async function loadHistory(
    participantId
  ) {
    const id =
      participantId ||
      state.participantId;

    const query =
      new URLSearchParams();

    if (id) {
      query.set(
        "participant_id",
        id
      );
    }

    return request(
      CONFIG.api.history +
        (
          query.toString()
            ? "?" +
              query.toString()
            : ""
        ),
      {
        method: "GET"
      }
    );
  }

  async function saveSettings(
    settings
  ) {
    const payload =
      settings ||
      state.settings;

    const data =
      await request(
        CONFIG.api.adminSettings,
        {
          method: "PUT",
          body: JSON.stringify({
            settings: payload
          })
        }
      );

    if (
      data?.settings
    ) {
      state.settings =
        Object.assign(
          {},
          state.settings,
          data.settings
        );
    }

    recalculate();
    saveLocal();

    emit(
      "settings-saved",
      data
    );

    return data;
  }

  /* ============================================================
     PARTICIPANT
     ============================================================ */

  function setParticipant(
    participantId
  ) {
    state.participantId =
      participantId ||
      null;

    emit(
      "participant-changed",
      {
        participantId:
          state.participantId
      }
    );
  }

  function setActingMode(
    enabled,
    participantId
  ) {
    state.actingAsParticipant =
      Boolean(enabled);

    if (
      participantId
    ) {
      setParticipant(
        participantId
      );
    }

    emit(
      "acting-mode-changed",
      {
        enabled:
          state.actingAsParticipant,
        participantId:
          state.participantId
      }
    );
  }

  function setAdminMode(
    enabled
  ) {
    state.adminMode =
      Boolean(enabled);

    emit(
      "admin-mode-changed",
      {
        enabled:
          state.adminMode
      }
    );
  }

  /* ============================================================
     LEVEL CONTROL
     ============================================================ */

  function setMode(
    mode
  ) {
    if (
      !Object.values(
        CONFIG.modes
      ).includes(mode)
    ) {
      return false;
    }

    state.profile.mode =
      mode;

    recalculate();
    markDirty();

    return true;
  }

  function setManualLevel(
    level
  ) {
    const normalized =
      normalizeLevel(level);

    state.profile.manualLevel =
      normalized;

    state.profile.mode =
      CONFIG.modes.MANUAL;

    recalculate();
    markDirty();

    emit(
      "manual-level-changed",
      {
        level:
          normalized
      }
    );

    return normalized;
  }

  function clearManualLevel() {
    state.profile.manualLevel =
      null;

    state.profile.mode =
      state.settings.mode ||
      CONFIG.modes.HYBRID;

    recalculate();
    markDirty();

    emit(
      "manual-level-cleared"
    );

    return true;
  }

  function setXP(
    xp
  ) {
    const value =
      Math.max(
        0,
        Number(xp) || 0
      );

    state.profile.xp =
      value;

    recalculate();
    markDirty();

    emit(
      "xp-changed",
      {
        xp: value,
        automaticLevel:
          state.profile.automaticLevel,
        level:
          state.profile.level
      }
    );

    return value;
  }

  function addXP(
    amount,
    reason
  ) {
    const value =
      Math.max(
        0,
        Number(amount) || 0
      );

    const previous =
      state.profile.level;

    state.profile.xp +=
      value;

    recalculate();

    markDirty();

    if (
      state.profile.level >
      previous
    ) {
      emit(
        "level-up",
        {
          previousLevel:
            previous,
          newLevel:
            state.profile.level,
          xp: state.profile.xp,
          reason:
            reason || null
        }
      );
    }

    return state.profile.xp;
  }

  function applyAction(
    actionId,
    multiplier
  ) {
    const action =
      CONFIG.actions[actionId];

    if (!action) {
      return false;
    }

    const factor =
      Number(multiplier);

    const safeFactor =
      Number.isFinite(factor)
        ? factor
        : 1;

    const amount =
      Math.max(
        0,
        action.defaultXp *
          safeFactor
      );

    return addXP(
      amount,
      actionId
    );
  }

  /* ============================================================
     ADMIN SET / RESET
     ============================================================ */

  async function adminSetLevel(
    participantId,
    level,
    options
  ) {
    const id =
      participantId ||
      state.participantId;

    if (!id) {
      throw new Error(
        "Не указан participant_id."
      );
    }

    const normalized =
      normalizeLevel(level);

    const opts =
      options || {};

    const payload = {
      participant_id: id,
      level: normalized,

      mode:
        opts.mode ||
        CONFIG.modes.MANUAL,

      reason:
        opts.reason ||
        "admin_level_change",

      keep_xp:
        opts.keepXp !== false,

      force:
        opts.force !== false,

      notify_participant:
        opts.notifyParticipant !== false
    };

    const data =
      await request(
        CONFIG.api.adminSet,
        {
          method: "PUT",
          body:
            JSON.stringify(
              payload
            )
        }
      );

    if (
      id === state.participantId
    ) {
      state.profile.level =
        normalized;

      state.profile.manualLevel =
        normalized;

      state.profile.mode =
        payload.mode;

      recalculate();

      saveLocal();
    }

    emit(
      "admin-level-set",
      {
        participantId: id,
        level: normalized,
        data
      }
    );

    return data;
  }

  async function adminResetLevel(
    participantId,
    options
  ) {
    const id =
      participantId ||
      state.participantId;

    if (!id) {
      throw new Error(
        "Не указан participant_id."
      );
    }

    const opts =
      options || {};

    const data =
      await request(
        CONFIG.api.adminReset,
        {
          method: "PUT",
          body: JSON.stringify({
            participant_id: id,

            level:
              opts.level === undefined
                ? 0
                : normalizeLevel(
                    opts.level
                  ),

            clear_manual:
              opts.clearManual !== false,

            reset_xp:
              Boolean(
                opts.resetXp
              ),

            reason:
              opts.reason ||
              "admin_level_reset",

            notify_participant:
              opts.notifyParticipant !== false
          })
        }
      );

    if (
      id === state.participantId
    ) {
      if (
        opts.clearManual !== false
      ) {
        state.profile.manualLevel =
          null;
      }

      if (
        opts.resetXp
      ) {
        state.profile.xp = 0;
      }

      state.profile.mode =
        CONFIG.modes.HYBRID;

      recalculate();

      saveLocal();
    }

    emit(
      "admin-level-reset",
      {
        participantId: id,
        data
      }
    );

    return data;
  }

  /* ============================================================
     ACHIEVEMENTS
     ============================================================ */

  function hasAchievement(
    achievementId
  ) {
    return state.profile.achievements.some(
      function (item) {
        return (
          item === achievementId ||
          item?.id === achievementId
        );
      }
    );
  }

  function addAchievement(
    achievement
  ) {
    if (!achievement) {
      return false;
    }

    const id =
      typeof achievement === "string"
        ? achievement
        : achievement.id;

    if (!id) {
      return false;
    }

    if (
      hasAchievement(id)
    ) {
      return false;
    }

    state.profile.achievements.push(
      typeof achievement === "string"
        ? {
            id,
            awardedAt:
              new Date().toISOString()
          }
        : achievement
    );

    markDirty();

    emit(
      "achievement-added",
      {
        achievement:
          typeof achievement === "string"
            ? {
                id
              }
            : achievement
      }
    );

    return true;
  }

  function removeAchievement(
    achievementId
  ) {
    const before =
      state.profile.achievements.length;

    state.profile.achievements =
      state.profile.achievements.filter(
        function (item) {
          return (
            item !== achievementId &&
            item?.id !== achievementId
          );
        }
      );

    if (
      state.profile.achievements.length !==
      before
    ) {
      markDirty();

      emit(
        "achievement-removed",
        {
          achievementId
        }
      );

      return true;
    }

    return false;
  }

  /* ============================================================
     UI
     ============================================================ */

  function renderBadge(
    container,
    options
  ) {
    const opts =
      options || {};

    if (!container) {
      return null;
    }

    const level =
      getPublicLevel();

    if (
      level === 0 &&
      opts.showLevel0 !== true
    ) {
      container.innerHTML =
        "";

      container.hidden =
        true;

      return container;
    }

    container.hidden =
      false;

    const definition =
      getDefinition(level);

    const name =
      getName(level);

    const badge =
      getBadgeText(level);

    container.innerHTML = `
      <span
        class="to-level-badge"
        data-to-level="${level}"
        title="${escapeHtml(
          getDescription(level)
        )}"
      >
        <span class="to-level-badge-icon">
          🇹🇯
        </span>

        <span class="to-level-badge-text">
          ${escapeHtml(
            badge
              ? badge.replace(
                  "🇹🇯 ",
                  ""
                )
              : ""
          )}
        </span>

        ${
          opts.showName !== false
            ? `
              <span class="to-level-badge-name">
                ${escapeHtml(name)}
              </span>
            `
            : ""
        }
      </span>
    `;

    container.addEventListener(
      "click",
      function () {
        emit(
          "badge-click",
          {
            level
          }
        );

        if (
          typeof opts.onClick ===
          "function"
        ) {
          opts.onClick(
            level,
            definition
          );
        }
      },
      {
        once: true
      }
    );

    return container;
  }

  function renderProgress(
    container
  ) {
    if (!container) {
      return null;
    }

    const level =
      normalizeLevel(
        state.profile.level
      );

    const progress =
      calculateProgress(
        state.profile.xp,
        level
      );

    const name =
      getName(level);

    const max =
      progress.nextThreshold === null;

    container.innerHTML = `
      <div class="to-level-progress">

        <div class="to-level-progress-header">

          <div>
            <strong>
              🇹🇯 TO Level ${level}
            </strong>

            <span>
              ${escapeHtml(name)}
            </span>
          </div>

          <div>
            <strong>
              ${Math.round(
                progress.value
              )}%
            </strong>
          </div>

        </div>

        <div
          class="to-level-progress-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${Math.round(
            progress.value
          )}"
        >
          <span
            style="width:${Math.max(
              0,
              Math.min(
                100,
                progress.value
              )
            )}%"
          ></span>
        </div>

        <div class="to-level-progress-footer">

          <span>
            XP: ${escapeHtml(
              progress.xp
            )}
          </span>

          <span>
            ${
              max
                ? "Максимальный уровень"
                : "До следующего: " +
                  escapeHtml(
                    progress.remaining
                  ) +
                  " XP"
            }
          </span>

        </div>

      </div>
    `;

    return container;
  }

  function renderProfileCard(
    container
  ) {
    if (!container) {
      return null;
    }

    const level =
      normalizeLevel(
        state.profile.level
      );

    const definition =
      getDefinition(level);

    const progress =
      calculateProgress(
        state.profile.xp,
        level
      );

    const publicLevel =
      isPublicLevel(level);

    container.innerHTML = `
      <article
        class="to-level-profile-card"
        data-level="${level}"
      >

        <div class="to-level-profile-top">

          <div class="to-level-profile-badge">
            ${
              publicLevel
                ? `
                  <span>
                    🇹🇯
                  </span>

                  <strong>
                    TO Lv. ${level}
                  </strong>
                `
                : `
                  <span>
                    —
                  </span>

                  <strong>
                    Уровень скрыт
                  </strong>
                `
            }
          </div>

          <div class="to-level-profile-info">

            <h3>
              ${escapeHtml(
                getName(level)
              )}
            </h3>

            <p>
              ${escapeHtml(
                getDescription(level)
              )}
            </p>

          </div>

        </div>

        <div class="to-level-profile-progress">

          <div class="to-level-progress-bar">
            <span
              style="width:${Math.max(
                0,
                Math.min(
                  100,
                  progress.value
                )
              )}%"
            ></span>
          </div>

          <div>
            ${Math.round(
              progress.value
            )}%
          </div>

        </div>

        <div class="to-level-profile-meta">

          <span>
            XP:
            <strong>
              ${escapeHtml(
                progress.xp
              )}
            </strong>
          </span>

          <span>
            Автоматически:
            <strong>
              Lv.${escapeHtml(
                state.profile.automaticLevel
              )}
            </strong>
          </span>

          <span>
            Режим:
            <strong>
              ${escapeHtml(
                state.profile.mode
              )}
            </strong>
          </span>

        </div>

      </article>
    `;

    return container;
  }

  function renderAll(
    container
  ) {
    if (!container) {
      return null;
    }

    container.innerHTML = `
      <div class="to-level-center">

        <header class="to-level-center-header">

          <div>
            <div class="to-level-kicker">
              🇹🇯 TAJIK OPPORTUNITIES
            </div>

            <h2>
              TO Level
            </h2>

            <p>
              Система уровней доверия и активности
              участника.
            </p>
          </div>

          <div
            data-to-level-badge-container
          ></div>

        </header>

        <section
          data-to-level-profile
        ></section>

        <section class="to-level-all-levels">

          <h3>
            Все уровни
          </h3>

          <div class="to-level-list">
            ${state.definitions.map(
              function (definition) {
                const level =
                  definition.level;

                const current =
                  level ===
                  state.profile.level;

                const publicLevel =
                  isPublicLevel(level);

                return `
                  <button
                    type="button"
                    class="
                      to-level-list-item
                      ${
                        current
                          ? "is-current"
                          : ""
                      }
                      ${
                        !publicLevel
                          ? "is-hidden-level"
                          : ""
                      }
                    "
                    data-level-select="${level}"
                  >

                    <span class="to-level-list-number">
                      ${
                        publicLevel
                          ? "🇹🇯 Lv." +
                            level
                          : "Lv.0"
                      }
                    </span>

                    <span class="to-level-list-name">
                      ${escapeHtml(
                        getName(level)
                      )}
                    </span>

                    ${
                      current
                        ? `
                          <span class="to-level-list-current">
                            ✓
                          </span>
                        `
                        : ""
                    }

                  </button>
                `;
              }
            ).join("")}
          </div>

        </section>

      </div>
    `;

    renderBadge(
      container.querySelector(
        "[data-to-level-badge-container]"
      )
    );

    renderProfileCard(
      container.querySelector(
        "[data-to-level-profile]"
      )
    );

    container
      .querySelectorAll(
        "[data-level-select]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              const level =
                Number(
                  button.dataset.levelSelect
                );

              emit(
                "level-selected",
                {
                  level,
                  definition:
                    getDefinition(level)
                }
              );
            }
          );
        }
      );

    return container;
  }

  /* ============================================================
     ADMIN UI
     ============================================================ */

  function renderAdminPanel(
    container
  ) {
    if (!container) {
      return null;
    }

    state.adminMode = true;

    const current =
      normalizeLevel(
        state.profile.level
      );

    container.innerHTML = `
      <section class="to-level-admin">

        <header class="to-level-admin-header">

          <div>
            <div class="to-level-kicker">
              👑 SUPER ADMIN
            </div>

            <h2>
              Управление TO Level
            </h2>

            <p>
              Администратор может назначить участнику
              любой уровень от Lv.0 до Lv.12.
            </p>
          </div>

          <div class="to-level-admin-current">
            Текущий:
            <strong>
              Lv.${current}
            </strong>
          </div>

        </header>

        <div class="to-level-admin-form">

          <label>
            Participant ID

            <input
              type="text"
              data-level-participant-id
              value="${escapeHtml(
                state.participantId || ""
              )}"
              placeholder="participant_id"
            >
          </label>

          <label>
            Уровень

            <select
              data-level-admin-select
            >
              ${Array.from(
                {
                  length:
                    CONFIG.maxLevel + 1
                },
                function (_, index) {
                  return `
                    <option
                      value="${index}"
                      ${
                        index === current
                          ? "selected"
                          : ""
                      }
                    >
                      ${
                        index === 0
                          ? "Lv.0 — скрыт"
                          : "Lv." +
                            index +
                            " — " +
                            escapeHtml(
                              getName(index)
                            )
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
              data-level-admin-mode
            >
              <option value="automatic">
                Automatic
              </option>

              <option value="manual">
                Manual
              </option>

              <option value="hybrid">
                Hybrid
              </option>
            </select>
          </label>

          <label>
            Причина

            <input
              type="text"
              data-level-admin-reason
              placeholder="Причина изменения"
            >
          </label>

          <div class="to-level-admin-actions">

            <button
              type="button"
              data-level-admin-action="set"
              class="primary"
            >
              👑 Назначить уровень
            </button>

            <button
              type="button"
              data-level-admin-action="reset"
            >
              ↩️ Вернуть Lv.0
            </button>

            <button
              type="button"
              data-level-admin-action="clear"
            >
              Автоматический режим
            </button>

          </div>

        </div>

        <div class="to-level-admin-warning">
          ⚠️ Lv.0 технически существует всегда, но
          публичный badge для Lv.0 не показывается.
        </div>

      </section>
    `;

    const mode =
      container.querySelector(
        "[data-level-admin-mode]"
      );

    mode.value =
      state.profile.mode ||
      CONFIG.modes.HYBRID;

    container
      .querySelectorAll(
        "[data-level-admin-action]"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            async function () {
              const action =
                button.dataset.levelAdminAction;

              const id =
                container
                  .querySelector(
                    "[data-level-participant-id]"
                  )
                  ?.value
                  ?.trim();

              if (!id) {
                showError(
                  container,
                  "Укажите Participant ID."
                );

                return;
              }

              setParticipant(id);

              try {
                if (
                  action === "set"
                ) {
                  const level =
                    Number(
                      container
                        .querySelector(
                          "[data-level-admin-select]"
                        )
                        ?.value
                    );

                  const reason =
                    container
                      .querySelector(
                        "[data-level-admin-reason]"
                      )
                      ?.value
                      ?.trim();

                  await adminSetLevel(
                    id,
                    level,
                    {
                      mode:
                        mode.value,

                      reason:
                        reason ||
                        "admin_level_change"
                    }
                  );
                }

                if (
                  action === "reset"
                ) {
                  await adminResetLevel(
                    id,
                    {
                      level: 0,
                      clearManual:
                        true,
                      resetXp:
                        false,
                      reason:
                        "admin_return_to_level_0"
                    }
                  );
                }

                if (
                  action === "clear"
                ) {
                  clearManualLevel();
                }

                renderAdminPanel(
                  container
                );

              } catch (error) {
                console.error(
                  "[TO Levels]",
                  error
                );

                showError(
                  container,
                  error.message
                );
              }
            }
          );
        }
      );

    return container;
  }

  function showError(
    container,
    message
  ) {
    let error =
      container.querySelector(
        ".to-level-error"
      );

    if (!error) {
      error =
        document.createElement(
          "div"
        );

      error.className =
        "to-level-error";

      container.prepend(
        error
      );
    }

    error.textContent =
      message ||
      "Произошла ошибка.";

    error.hidden =
      false;

    window.setTimeout(
      function () {
        error.hidden =
          true;
      },
      6000
    );
  }

  /* ============================================================
     DATA ATTRIBUTES AUTO RENDER
     ============================================================ */

  function autoRender() {
    document
      .querySelectorAll(
        "[data-to-level-badge]"
      )
      .forEach(
        function (container) {
          renderBadge(
            container,
            {
              showName:
                container.dataset.showName !==
                "false"
            }
          );
        }
      );

    document
      .querySelectorAll(
        "[data-to-level-progress]"
      )
      .forEach(
        function (container) {
          renderProgress(
            container
          );
        }
      );

    document
      .querySelectorAll(
        "[data-to-level-profile]"
      )
      .forEach(
        function (container) {
          renderProfileCard(
            container
          );
        }
      );

    document
      .querySelectorAll(
        "[data-to-level-center]"
      )
      .forEach(
        function (container) {
          renderAll(
            container
          );
        }
      );

    document
      .querySelectorAll(
        "[data-to-level-admin]"
      )
      .forEach(
        function (container) {
          renderAdminPanel(
            container
          );
        }
      );
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  const API = {
    CONFIG,
    state,

    on,

    load,
    loadProgress,
    loadHistory,

    saveSettings,

    setParticipant,
    setActingMode,
    setAdminMode,

    setMode,

    setManualLevel,
    clearManualLevel,

    setXP,
    addXP,
    applyAction,

    adminSetLevel,
    adminResetLevel,

    hasAchievement,
    addAchievement,
    removeAchievement,

    recalculate,

    getDefinition,
    getName,
    getDescription,

    getPublicLevel,
    getBadgeText,

    getThreshold,
    getNextThreshold,

    calculateProgress,
    calculateAutomaticLevel,

    renderBadge,
    renderProgress,
    renderProfileCard,
    renderAll,
    renderAdminPanel,

    isPublicLevel
  };

  window.TOLevels =
    API;

  window.TOLevel =
    API;

  window.Levels =
    API;

  /* ============================================================
     GLOBAL EVENTS
     ============================================================ */

  document.addEventListener(
    "to:profile:changed",
    function (event) {
      const profile =
        event.detail?.profile;

      if (!profile) {
        return;
      }

      if (
        profile.id &&
        state.participantId &&
        profile.id !==
          state.participantId
      ) {
        return;
      }

      if (
        profile.id
      ) {
        state.participantId =
          profile.id;
      }

      if (
        profile.level !==
        undefined
      ) {
        state.profile.level =
          normalizeLevel(
            profile.level
          );
      }

      if (
        profile.level_xp !==
        undefined
      ) {
        state.profile.xp =
          Math.max(
            0,
            Number(
              profile.level_xp
            ) || 0
          );
      }

      recalculate();

      autoRender();
    }
  );

  document.addEventListener(
    "to:admin:acting-profile-changed",
    function (event) {
      const participantId =
        event.detail?.participantId;

      if (
        participantId
      ) {
        setParticipant(
          participantId
        );

        setActingMode(
          true,
          participantId
        );
      }
    }
  );

  /* ============================================================
     DOM READY
     ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    async function () {
      autoRender();

      const hasLevelUI =
        document.querySelector(
          "[data-to-level-badge]," +
          "[data-to-level-progress]," +
          "[data-to-level-profile]," +
          "[data-to-level-center]," +
          "[data-to-level-admin]"
        );

      if (!hasLevelUI) {
        return;
      }

      try {
        await load();

        autoRender();
      } catch (error) {
        console.warn(
          "[TO Levels] API load failed:",
          error
        );

        autoRender();
      }
    }
  );

})(window, document);
