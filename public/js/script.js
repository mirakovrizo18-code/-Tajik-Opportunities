/* ============================================================
   TAJIK OPPORTUNITIES
   Общие функции сайта
   public/js/script.js

   Совместимо с новым worker/worker.js
   Не зависит от старого app.js
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     ОСНОВНЫЕ НАСТРОЙКИ
     ========================================================== */

  const API_PREFIX = "";

  /* ==========================================================
     HTML SECURITY
     ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* ==========================================================
     ТЕКСТ
     ========================================================== */

  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function truncateText(value, maxLength = 180) {
    const text = String(value ?? "").trim();

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength).trimEnd() + "…";
  }

  /* ==========================================================
     DEBOUNCE
     ========================================================== */

  function debounce(callback, delay = 250) {
    let timer = null;

    return function (...args) {
      clearTimeout(timer);

      timer = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }

  /* ==========================================================
     API
     ========================================================== */

  async function requestJson(url, options = {}) {
    const requestUrl =
      url.startsWith("http://") ||
      url.startsWith("https://")
        ? url
        : API_PREFIX + url;

    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
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

    const response = await fetch(requestUrl, {
      ...options,
      headers,
      body,
      credentials: "include",
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = {};
      }
    } else {
      const text = await response.text();

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const error = new Error(
        getErrorMessage(
          data,
          `Ошибка сервера: ${response.status}`
        )
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }

  async function getJson(url, options = {}) {
    return requestJson(url, {
      ...options,
      method: "GET",
    });
  }

  async function postJson(url, body = {}, options = {}) {
    return requestJson(url, {
      ...options,
      method: "POST",
      body,
    });
  }

  async function putJson(url, body = {}, options = {}) {
    return requestJson(url, {
      ...options,
      method: "PUT",
      body,
    });
  }

  async function deleteJson(url, body = undefined, options = {}) {
    const config = {
      ...options,
      method: "DELETE",
    };

    if (body !== undefined) {
      config.body = body;
    }

    return requestJson(url, config);
  }

  /* ==========================================================
     ОШИБКИ
     ========================================================== */

  function getErrorMessage(error, fallback = "Произошла ошибка.") {
    if (!error) {
      return fallback;
    }

    if (typeof error === "string") {
      return error || fallback;
    }

    if (error.message && typeof error.message === "string") {
      return error.message;
    }

    if (error.error && typeof error.error === "string") {
      return error.error;
    }

    if (
      error.message &&
      typeof error.message === "object"
    ) {
      return (
        error.message.message ||
        error.message.error ||
        fallback
      );
    }

    if (
      error.data &&
      typeof error.data === "object"
    ) {
      return (
        error.data.message ||
        error.data.error ||
        fallback
      );
    }

    return fallback;
  }

  /* ==========================================================
     URL
     ========================================================== */

  function getQueryParam(name) {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      return params.get(name) || "";
    } catch {
      return "";
    }
  }

  function getQueryParams() {
    const result = {};

    try {
      const params = new URLSearchParams(
        window.location.search
      );

      params.forEach((value, key) => {
        result[key] = value;
      });
    } catch {
      // Ничего не делаем.
    }

    return result;
  }

  function setQueryParams(
    params = {},
    replace = true
  ) {
    try {
      const url = new URL(
        window.location.href
      );

      const current = url.searchParams;

      Object.keys(params).forEach((key) => {
        const value = params[key];

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const newUrl =
        url.pathname +
        (current.toString()
          ? "?" + current.toString()
          : "") +
        url.hash;

      if (replace) {
        window.history.replaceState(
          {},
          "",
          newUrl
        );
      } else {
        window.history.pushState(
          {},
          "",
          newUrl
        );
      }
    } catch (error) {
      console.warn(
        "Tajik Opportunities: не удалось обновить URL",
        error
      );
    }
  }

  /* ==========================================================
     ДАТА И ВРЕМЯ
     ========================================================== */

  function parseDate(value) {
    if (!value) {
      return null;
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  }

  function formatDate(
    value,
    options = {}
  ) {
    const date = parseDate(value);

    if (!date) {
      return "";
    }

    const defaultOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    try {
      return new Intl.DateTimeFormat(
        "ru-RU",
        {
          ...defaultOptions,
          ...options,
        }
      ).format(date);
    } catch {
      return date.toLocaleString(
        "ru-RU"
      );
    }
  }

  function formatRelativeDate(value) {
    const date = parseDate(value);

    if (!date) {
      return "";
    }

    const now = Date.now();
    const timestamp = date.getTime();

    let diff =
      Math.floor(
        (now - timestamp) / 1000
      );

    if (diff < 0) {
      diff = 0;
    }

    if (diff < 60) {
      return "только что";
    }

    const minutes =
      Math.floor(diff / 60);

    if (minutes < 60) {
      return `${minutes} мин. назад`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ч. назад`;
    }

    const days =
      Math.floor(hours / 24);

    if (days < 7) {
      return `${days} дн. назад`;
    }

    if (days < 30) {
      const weeks =
        Math.floor(days / 7);

      return `${weeks} нед. назад`;
    }

    if (days < 365) {
      const months =
        Math.floor(days / 30);

      return `${months} мес. назад`;
    }

    const years =
      Math.floor(days / 365);

    return `${years} г. назад`;
  }

  /* ==========================================================
     ЧИСЛА
     ========================================================== */

  function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    try {
      return new Intl.NumberFormat(
        "ru-RU"
      ).format(number);
    } catch {
      return String(number);
    }
  }

  /* ==========================================================
     КАТЕГОРИИ
     ========================================================== */

  const categories = {
    jobs: {
      label: "💼 Работа",
      icon: "💼",
    },

    job_seekers: {
      label: "🔎 Ищу работу",
      icon: "🔎",
    },

    employees: {
      label: "👔 Ищу сотрудника",
      icon: "👔",
    },

    profiles: {
      label: "👤 Профили",
      icon: "👤",
    },

    news: {
      label: "📰 Новости",
      icon: "📰",
    },

    education: {
      label: "🎓 Образование",
      icon: "🎓",
    },

    courses: {
      label: "📚 Курсы",
      icon: "📚",
    },

    opportunities: {
      label: "🎁 Возможности",
      icon: "🎁",
    },

    announcements: {
      label: "📢 Объявления",
      icon: "📢",
    },

    services: {
      label: "🤝 Услуги",
      icon: "🤝",
    },

    ideas: {
      label: "💡 Идеи",
      icon: "💡",
    },

    projects: {
      label: "🚀 Проекты",
      icon: "🚀",
    },

    startups: {
      label: "🌱 Стартапы",
      icon: "🌱",
    },

    events: {
      label: "📅 Мероприятия",
      icon: "📅",
    },

    competitions: {
      label: "🏆 Конкурсы",
      icon: "🏆",
    },

    grants: {
      label: "💰 Гранты",
      icon: "💰",
    },

    volunteering: {
      label: "🤝 Волонтёрство",
      icon: "🤝",
    },

    products: {
      label: "🛍️ Товары",
      icon: "🛍️",
    },

    business: {
      label: "🏢 Бизнес",
      icon: "🏢",
    },

    it: {
      label: "💻 IT",
      icon: "💻",
    },

    sport: {
      label: "⚽ Спорт",
      icon: "⚽",
    },

    music: {
      label: "🎵 Музыка",
      icon: "🎵",
    },

    culture: {
      label: "🎭 Культура",
      icon: "🎭",
    },

    travel: {
      label: "✈️ Путешествия",
      icon: "✈️",
    },

    help: {
      label: "🆘 Помощь",
      icon: "🆘",
    },

    other: {
      label: "➕ Другое",
      icon: "➕",
    },
  };

  function getCategoryLabel(category) {
    const key = String(
      category || "other"
    ).toLowerCase();

    return (
      categories[key]?.label ||
      categories.other.label
    );
  }

  function getCategoryIcon(category) {
    const key = String(
      category || "other"
    ).toLowerCase();

    return (
      categories[key]?.icon ||
      categories.other.icon
    );
  }

  /* ==========================================================
     БЕЗОПАСНЫЕ URL
     ========================================================== */

  function safeExternalUrl(value) {
    const raw = String(
      value || ""
    ).trim();

    if (!raw) {
      return "";
    }

    try {
      const url = new URL(
        raw,
        window.location.origin
      );

      const protocol =
        url.protocol.toLowerCase();

      const allowedProtocols = [
        "http:",
        "https:",
        "mailto:",
        "tel:",
      ];

      if (
        !allowedProtocols.includes(
          protocol
        )
      ) {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function safeImageUrl(value) {
    const url = safeExternalUrl(
      value
    );

    if (!url) {
      return "";
    }

    try {
      const parsed =
        new URL(url);

      if (
        parsed.protocol !==
          "http:" &&
        parsed.protocol !==
          "https:"
      ) {
        return "";
      }

      return url;
    } catch {
      return "";
    }
  }

  /* ==========================================================
     DOM
     ========================================================== */

  function $(selector, root = document) {
    return root.querySelector(
      selector
    );
  }

  function $$(selector, root = document) {
    return Array.from(
      root.querySelectorAll(
        selector
      )
    );
  }

  /* ==========================================================
     COOKIE
     ========================================================== */

  function getCookie(name) {
    try {
      const cookies =
        document.cookie.split(";");

      for (const cookie of cookies) {
        const item =
          cookie.trim();

        if (
          item.startsWith(
            name + "="
          )
        ) {
          return decodeURIComponent(
            item.slice(
              name.length + 1
            )
          );
        }
      }
    } catch {
      // Ничего не делаем.
    }

    return "";
  }

  /* ==========================================================
     TOAST
     ========================================================== */

  function showToast(
    message,
    type = "info",
    duration = 3000
  ) {
    const text =
      String(message || "").trim();

    if (!text) {
      return;
    }

    let container =
      document.getElementById(
        "toToastContainer"
      );

    if (!container) {
      container =
        document.createElement(
          "div"
        );

      container.id =
        "toToastContainer";

      container.setAttribute(
        "aria-live",
        "polite"
      );

      container.setAttribute(
        "aria-atomic",
        "true"
      );

      Object.assign(
        container.style,
        {
          position: "fixed",
          left: "16px",
          right: "16px",
          bottom: "20px",
          zIndex: "99999",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          pointerEvents: "none",
        }
      );

      document.body.appendChild(
        container
      );
    }

    const toast =
      document.createElement(
        "div"
      );

    toast.className =
      "to-toast to-toast-" +
      String(type);

    toast.textContent = text;

    Object.assign(
      toast.style,
      {
        maxWidth: "520px",
        width: "fit-content",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "rgba(20,20,20,.94)",
        color: "#fff",
        fontSize: "14px",
        lineHeight: "1.4",
        boxShadow:
          "0 8px 30px rgba(0,0,0,.25)",
        pointerEvents: "auto",
        opacity: "0",
        transform:
          "translateY(10px)",
        transition:
          "opacity .2s ease, transform .2s ease",
      }
    );

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform =
        "translateY(0)";
    });

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform =
        "translateY(10px)";

      window.setTimeout(() => {
        toast.remove();

        if (
          container.children
            .length === 0
        ) {
          container.remove();
        }
      }, 250);
    }, duration);
  }

  /* ==========================================================
     КОПИРОВАНИЕ
     ========================================================== */

  async function copyText(text) {
    const value = String(
      text ?? ""
    );

    if (!value) {
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(
          value
        );

        return true;
      }
    } catch {
      // Используем резервный способ.
    }

    try {
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value = value;
      textarea.setAttribute(
        "readonly",
        ""
      );

      Object.assign(
        textarea.style,
        {
          position: "fixed",
          opacity: "0",
          pointerEvents: "none",
        }
      );

      document.body.appendChild(
        textarea
      );

      textarea.select();

      const result =
        document.execCommand(
          "copy"
        );

      textarea.remove();

      return result;
    } catch {
      return false;
    }
  }

  /* ==========================================================
     ПОДЕЛИТЬСЯ
     ========================================================== */

  async function shareContent({
    title = "Tajik Opportunities",
    text = "",
    url = window.location.href,
  } = {}) {
    const safeUrl =
      safeExternalUrl(url) ||
      window.location.href;

    try {
      if (
        navigator.share &&
        typeof navigator.share ===
          "function"
      ) {
        await navigator.share({
          title,
          text,
          url: safeUrl,
        });

        return true;
      }
    } catch (error) {
      if (
        error &&
        error.name ===
          "AbortError"
      ) {
        return false;
      }
    }

    const copied =
      await copyText(
        safeUrl
      );

    if (copied) {
      showToast(
        "Ссылка скопирована.",
        "success"
      );

      return true;
    }

    return false;
  }

  /* ==========================================================
     МОДАЛЬНЫЕ ОКНА
     ========================================================== */

  function openModal(modal) {
    if (!modal) {
      return;
    }

    modal.hidden = false;

    modal.classList.add(
      "is-open"
    );

    document.body.classList.add(
      "modal-open"
    );

    const closeButton =
      modal.querySelector(
        "[data-modal-close], .modal-close"
      );

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.remove(
      "is-open"
    );

    modal.hidden = true;

    document.body.classList.remove(
      "modal-open"
    );
  }

  /* ==========================================================
     ФОРМЫ
     ========================================================== */

  function setButtonLoading(
    button,
    loading,
    loadingText = "Загрузка..."
  ) {
    if (!button) {
      return;
    }

    if (
      loading &&
      !button.dataset.originalText
    ) {
      button.dataset.originalText =
        button.textContent;
    }

    button.disabled = Boolean(
      loading
    );

    button.setAttribute(
      "aria-busy",
      loading
        ? "true"
        : "false"
    );

    if (loading) {
      button.textContent =
        loadingText;
    } else if (
      button.dataset.originalText
    ) {
      button.textContent =
        button.dataset.originalText;

      delete button.dataset
        .originalText;
    }
  }

  function serializeForm(form) {
    const data = {};

    if (!form) {
      return data;
    }

    const formData =
      new FormData(form);

    formData.forEach(
      (value, key) => {
        if (
          value instanceof File
        ) {
          if (value.name) {
            data[key] = value;
          }

          return;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            data,
            key
          )
        ) {
          if (
            Array.isArray(
              data[key]
            )
          ) {
            data[key].push(value);
          } else {
            data[key] = [
              data[key],
              value,
            ];
          }
        } else {
          data[key] = value;
        }
      }
    );

    return data;
  }

  /* ==========================================================
     ЧИСЛА / ID
     ========================================================== */

  function toNumber(value, fallback = 0) {
    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function toBoolean(value) {
    if (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true" ||
      value === "yes" ||
      value === "on"
    ) {
      return true;
    }

    return false;
  }

  /* ==========================================================
     СОЗДАНИЕ ССЫЛОК
     ========================================================== */

  function publicationUrl(id) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      return "/index.html";
    }

    return (
      "/post.html?id=" +
      encodeURIComponent(
        String(id)
      )
    );
  }

  function profileUrl(username) {
    const value =
      String(
        username || ""
      ).trim();

    if (!value) {
      return "/profile.html";
    }

    return (
      "/profile.html?username=" +
      encodeURIComponent(
        value
      )
    );
  }

  /* ==========================================================
     МОБИЛЬНОЕ МЕНЮ
     ========================================================== */

  function initMobileMenu() {
    const toggle =
      document.querySelector(
        "[data-menu-toggle], #menuToggle, .menu-toggle"
      );

    const menu =
      document.querySelector(
        "[data-mobile-menu], #mobileMenu, .mobile-menu"
      );

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener(
      "click",
      () => {
        const isOpen =
          menu.classList.contains(
            "is-open"
          );

        menu.classList.toggle(
          "is-open",
          !isOpen
        );

        menu.hidden = isOpen;

        toggle.setAttribute(
          "aria-expanded",
          isOpen
            ? "false"
            : "true"
        );
      }
    );

    menu
      .querySelectorAll("a")
      .forEach((link) => {
        link.addEventListener(
          "click",
          () => {
            menu.classList.remove(
              "is-open"
            );

            menu.hidden = true;

            toggle.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        );
      });
  }

  /* ==========================================================
     НОВЫЕ УВЕДОМЛЕНИЯ
     ========================================================== */

  async function getNotifications() {
    try {
      const result =
        await getJson(
          "/api/notifications"
        );

      if (Array.isArray(result)) {
        return result;
      }

      if (
        result &&
        Array.isArray(
          result.notifications
        )
      ) {
        return result.notifications;
      }

      if (
        result &&
        result.data &&
        Array.isArray(
          result.data.notifications
        )
      ) {
        return result.data.notifications;
      }

      return [];
    } catch {
      return [];
    }
  }

  async function updateNotificationBadges() {
    const notifications =
      await getNotifications();

    const unread =
      notifications.filter(
        (item) =>
          !(
            item.read === true ||
            item.is_read === true ||
            item.read_at
          )
      ).length;

    const badges =
      document.querySelectorAll(
        "[data-notification-count], #notificationCount, .notification-count"
      );

    badges.forEach((badge) => {
      badge.textContent =
        unread > 99
          ? "99+"
          : String(unread);

      badge.hidden =
        unread <= 0;
    });

    return unread;
  }

  /* ==========================================================
     ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
     ========================================================== */

  async function getCurrentUser() {
    try {
      const result =
        await getJson(
          "/api/auth/me"
        );

      if (
        result &&
        result.user
      ) {
        return result.user;
      }

      if (
        result &&
        result.data &&
        result.data.user
      ) {
        return result.data.user;
      }

      if (
        result &&
        typeof result ===
          "object" &&
        !Array.isArray(result)
      ) {
        return result;
      }

      return null;
    } catch {
      return null;
    }
  }

  /* ==========================================================
     ИНИЦИАЛИЗАЦИЯ
     ========================================================== */

  function initGlobal() {
    initMobileMenu();

    updateNotificationBadges().catch(
      () => {}
    );
  }

  /* ==========================================================
     ГЛОБАЛЬНЫЙ ОБЪЕКТ TAJIK OPPORTUNITIES
     ========================================================== */

  const TO = {
    // API
    requestJson,
    getJson,
    postJson,
    putJson,
    deleteJson,

    // Ошибки
    getErrorMessage,

    // Текст
    escapeHtml,
    normalizeText,
    truncateText,
    debounce,

    // URL
    getQueryParam,
    getQueryParams,
    setQueryParams,

    // Дата
    parseDate,
    formatDate,
    formatRelativeDate,

    // Числа
    formatNumber,
    toNumber,
    toBoolean,

    // Категории
    categories,
    getCategoryLabel,
    getCategoryIcon,

    // URL
    safeExternalUrl,
    safeImageUrl,
    publicationUrl,
    profileUrl,

    // DOM
    $,
    $$,

    // Cookie
    getCookie,

    // UI
    showToast,
    openModal,
    closeModal,
    setButtonLoading,

    // Копирование / Share
    copyText,
    shareContent,

    // Forms
    serializeForm,

    // Auth / notifications
    getCurrentUser,
    getNotifications,
    updateNotificationBadges,

    // Mobile
    initMobileMenu,
  };

  window.TO = TO;

  /*
   * Совместимость с возможным старым кодом.
   * Ничего критичного здесь не запускается.
   */

  window.TajikOpportunities =
    window.TajikOpportunities ||
    TO;

  /* ==========================================================
     DOM READY
     ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initGlobal,
      { once: true }
    );
  } else {
    initGlobal();
  }
})();
