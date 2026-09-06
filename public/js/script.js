/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   public/js/script.js
   ГЛОБАЛЬНЫЙ JAVASCRIPT САЙТА

   Версия: 2026
   ------------------------------------------------------------
   Что делает:
   • API-запросы
   • регистрация
   • вход
   • выход
   • проверка текущего пользователя
   • профиль
   • универсальные кнопки
   • модальные окна
   • мобильное меню
   • уведомления
   • копирование
   • Web Share
   • формы
   • безопасный HTML
   • навигация
   • обработка кликов
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     ОСНОВНЫЕ НАСТРОЙКИ
     ========================================================== */

  const API_PREFIX = "";

  const SITE_NAME = "🇹🇯 Tajik Opportunities";

  const SELECTORS = {
    login:
      '[data-action="login"], [data-auth="login"], #loginButton, #loginBtn, .login-button, .btn-login',

    register:
      '[data-action="register"], [data-auth="register"], #registerButton, #registerBtn, .register-button, .btn-register',

    logout:
      '[data-action="logout"], [data-auth="logout"], #logoutButton, #logoutBtn, .logout-button, .btn-logout',

    profile:
      '[data-action="profile"], [data-nav="profile"], #profileButton, #profileBtn, .profile-button, .btn-profile',

    add:
      '[data-action="add"], [data-nav="add"], #addButton, #addBtn, .add-button, .btn-add',

    notifications:
      '[data-action="notifications"], [data-nav="notifications"], #notificationButton, #notificationsButton',

    messages:
      '[data-action="messages"], [data-nav="messages"], #messageButton, #messagesButton',

    saved:
      '[data-action="saved"], [data-nav="saved"], #savedButton, #savedBtn',

    home:
      '[data-action="home"], [data-nav="home"], #homeButton, #homeBtn',

    closeModal:
      '[data-modal-close], .modal-close, [data-action="close-modal"]',

    menuToggle:
      '[data-menu-toggle], #menuToggle, .menu-toggle',

    mobileMenu:
      '[data-mobile-menu], #mobileMenu, .mobile-menu',
  };

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
    } catch {}

    return result;
  }

  function setQueryParams(params = {}, replace = true) {
    try {
      const url = new URL(window.location.href);

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
        window.history.replaceState({}, "", newUrl);
      } else {
        window.history.pushState({}, "", newUrl);
      }
    } catch (error) {
      console.warn(
        "Tajik Opportunities: не удалось обновить URL",
        error
      );
    }
  }

  /* ==========================================================
     ДАТА
     ========================================================== */

  function parseDate(value) {
    if (!value) {
      return null;
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  function formatDate(value, options = {}) {
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
      return date.toLocaleString("ru-RU");
    }
  }

  function formatRelativeDate(value) {
    const date = parseDate(value);

    if (!date) {
      return "";
    }

    let diff = Math.floor(
      (Date.now() - date.getTime()) / 1000
    );

    if (diff < 0) {
      diff = 0;
    }

    if (diff < 60) {
      return "только что";
    }

    const minutes = Math.floor(diff / 60);

    if (minutes < 60) {
      return `${minutes} мин. назад`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ч. назад`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} дн. назад`;
    }

    if (days < 30) {
      return `${Math.floor(days / 7)} нед. назад`;
    }

    if (days < 365) {
      return `${Math.floor(days / 30)} мес. назад`;
    }

    return `${Math.floor(days / 365)} г. назад`;
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
      return new Intl.NumberFormat("ru-RU").format(number);
    } catch {
      return String(number);
    }
  }

  function toNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }

  function toBoolean(value) {
    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true" ||
      value === "yes" ||
      value === "on"
    );
  }

  /* ==========================================================
     КАТЕГОРИИ
     ========================================================== */

  const categories = {
    jobs: { label: "💼 Работа", icon: "💼" },
    job_seekers: { label: "🔎 Ищу работу", icon: "🔎" },
    employees: { label: "👔 Ищу сотрудника", icon: "👔" },
    profiles: { label: "👤 Профили", icon: "👤" },
    news: { label: "📰 Новости", icon: "📰" },
    education: { label: "🎓 Образование", icon: "🎓" },
    courses: { label: "📚 Курсы", icon: "📚" },
    opportunities: { label: "🎁 Возможности", icon: "🎁" },
    announcements: { label: "📢 Объявления", icon: "📢" },
    services: { label: "🤝 Услуги", icon: "🤝" },
    ideas: { label: "💡 Идеи", icon: "💡" },
    projects: { label: "🚀 Проекты", icon: "🚀" },
    startups: { label: "🌱 Стартапы", icon: "🌱" },
    events: { label: "📅 Мероприятия", icon: "📅" },
    competitions: { label: "🏆 Конкурсы", icon: "🏆" },
    grants: { label: "💰 Гранты", icon: "💰" },
    volunteering: { label: "🤝 Волонтёрство", icon: "🤝" },
    products: { label: "🛍️ Товары", icon: "🛍️" },
    business: { label: "🏢 Бизнес", icon: "🏢" },
    it: { label: "💻 IT", icon: "💻" },
    sport: { label: "⚽ Спорт", icon: "⚽" },
    music: { label: "🎵 Музыка", icon: "🎵" },
    culture: { label: "🎭 Культура", icon: "🎭" },
    travel: { label: "✈️ Путешествия", icon: "✈️" },
    help: { label: "🆘 Помощь", icon: "🆘" },
    other: { label: "➕ Другое", icon: "➕" },
  };

  function getCategoryLabel(category) {
    const key = String(category || "other").toLowerCase();

    return (
      categories[key]?.label ||
      categories.other.label
    );
  }

  function getCategoryIcon(category) {
    const key = String(category || "other").toLowerCase();

    return (
      categories[key]?.icon ||
      categories.other.icon
    );
  }

  /* ==========================================================
     БЕЗОПАСНЫЕ URL
     ========================================================== */

  function safeExternalUrl(value) {
    const raw = String(value || "").trim();

    if (!raw) {
      return "";
    }

    try {
      const url = new URL(
        raw,
        window.location.origin
      );

      const allowed = [
        "http:",
        "https:",
        "mailto:",
        "tel:",
      ];

      if (!allowed.includes(url.protocol.toLowerCase())) {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function safeImageUrl(value) {
    const url = safeExternalUrl(value);

    if (!url) {
      return "";
    }

    try {
      const parsed = new URL(url);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
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
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(
      root.querySelectorAll(selector)
    );
  }

  /* ==========================================================
     COOKIE
     ========================================================== */

  function getCookie(name) {
    try {
      const cookies = document.cookie.split(";");

      for (const cookie of cookies) {
        const item = cookie.trim();

        if (item.startsWith(name + "=")) {
          return decodeURIComponent(
            item.slice(name.length + 1)
          );
        }
      }
    } catch {}

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
    const text = String(message || "").trim();

    if (!text) {
      return;
    }

    let container =
      document.getElementById(
        "toToastContainer"
      );

    if (!container) {
      container = document.createElement("div");

      container.id = "toToastContainer";

      container.setAttribute(
        "aria-live",
        "polite"
      );

      Object.assign(container.style, {
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
      });

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    toast.className =
      "to-toast to-toast-" + String(type);

    toast.textContent = text;

    Object.assign(toast.style, {
      maxWidth: "520px",
      width: "fit-content",
      padding: "12px 16px",
      borderRadius: "12px",
      background: "rgba(20,20,20,.94)",
      color: "#fff",
      fontSize: "14px",
      lineHeight: "1.4",
      boxShadow: "0 8px 30px rgba(0,0,0,.25)",
      pointerEvents: "auto",
      opacity: "0",
      transform: "translateY(10px)",
      transition:
        "opacity .2s ease, transform .2s ease",
    });

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform =
        "translateY(10px)";

      window.setTimeout(() => {
        toast.remove();

        if (container.children.length === 0) {
          container.remove();
        }
      }, 250);
    }, duration);
  }

  /* ==========================================================
     КОПИРОВАНИЕ
     ========================================================== */

  async function copyText(text) {
    const value = String(text ?? "");

    if (!value) {
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
          "function"
      ) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {}

    try {
      const textarea =
        document.createElement("textarea");

      textarea.value = value;
      textarea.setAttribute("readonly", "");

      Object.assign(textarea.style, {
        position: "fixed",
        opacity: "0",
        pointerEvents: "none",
      });

      document.body.appendChild(textarea);

      textarea.select();

      const result =
        document.execCommand("copy");

      textarea.remove();

      return result;
    } catch {
      return false;
    }
  }

  /* ==========================================================
     SHARE
     ========================================================== */

  async function shareContent({
    title = SITE_NAME,
    text = "",
    url = window.location.href,
  } = {}) {
    const safeUrl =
      safeExternalUrl(url) ||
      window.location.href;

    try {
      if (
        navigator.share &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({
          title,
          text,
          url: safeUrl,
        });

        return true;
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return false;
      }
    }

    const copied = await copyText(safeUrl);

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

    modal.classList.add("is-open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    const closeButton =
      modal.querySelector(
        SELECTORS.closeModal
      );

    if (closeButton) {
      setTimeout(() => {
        closeButton.focus();
      }, 20);
    }
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.remove("is-open");

    modal.hidden = true;

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
  }

  function findAuthModal() {
    return (
      document.querySelector(
        "#authModal"
      ) ||
      document.querySelector(
        "#loginModal"
      ) ||
      document.querySelector(
        "#auth-modal"
      ) ||
      document.querySelector(
        ".auth-modal"
      ) ||
      document.querySelector(
        '[data-modal="auth"]'
      ) ||
      document.querySelector(
        ".modal-auth"
      )
    );
  }

  function findRegisterModal() {
    return (
      document.querySelector(
        "#registerModal"
      ) ||
      document.querySelector(
        "#register-modal"
      ) ||
      document.querySelector(
        '[data-modal="register"]'
      )
    );
  }

  function findLoginModal() {
    return (
      document.querySelector(
        "#loginModal"
      ) ||
      document.querySelector(
        "#login-modal"
      ) ||
      document.querySelector(
        '[data-modal="login"]'
      )
    );
  }

  /* ==========================================================
     ПЕРЕКЛЮЧЕНИЕ AUTH
     ========================================================== */

  function switchAuthMode(mode) {
    const authModal = findAuthModal();
    const loginModal = findLoginModal();
    const registerModal = findRegisterModal();

    const login =
      document.querySelector(
        '[data-auth-tab="login"]'
      );

    const register =
      document.querySelector(
        '[data-auth-tab="register"]'
      );

    const loginForm =
      document.querySelector(
        '[data-auth-form="login"]'
      ) ||
      document.querySelector(
        "#loginForm"
      ) ||
      document.querySelector(
        "#login-form"
      );

    const registerForm =
      document.querySelector(
        '[data-auth-form="register"]'
      ) ||
      document.querySelector(
        "#registerForm"
      ) ||
      document.querySelector(
        "#register-form"
      );

    if (mode === "login") {
      if (login) {
        login.classList.add("active");
        login.setAttribute("aria-selected", "true");
      }

      if (register) {
        register.classList.remove("active");
        register.setAttribute("aria-selected", "false");
      }

      if (loginForm) {
        loginForm.hidden = false;
        loginForm.style.display = "";
      }

      if (registerForm) {
        registerForm.hidden = true;
        registerForm.style.display = "none";
      }

      if (registerModal && registerModal !== authModal) {
        closeModal(registerModal);
      }

      if (loginModal) {
        openModal(loginModal);
      } else if (authModal) {
        openModal(authModal);
      }

      return;
    }

    if (mode === "register") {
      if (login) {
        login.classList.remove("active");
        login.setAttribute("aria-selected", "false");
      }

      if (register) {
        register.classList.add("active");
        register.setAttribute("aria-selected", "true");
      }

      if (loginForm) {
        loginForm.hidden = true;
        loginForm.style.display = "none";
      }

      if (registerForm) {
        registerForm.hidden = false;
        registerForm.style.display = "";
      }

      if (loginModal && loginModal !== authModal) {
        closeModal(loginModal);
      }

      if (registerModal) {
        openModal(registerModal);
      } else if (authModal) {
        openModal(authModal);
      }
    }
  }

  /* ==========================================================
     LOADING BUTTON
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
        button.innerHTML;
    }

    button.disabled = Boolean(loading);

    button.setAttribute(
      "aria-busy",
      loading ? "true" : "false"
    );

    if (loading) {
      button.innerHTML =
        `<span class="to-button-spinner" aria-hidden="true"></span>${escapeHtml(
          loadingText
        )}`;
    } else if (
      button.dataset.originalText
    ) {
      button.innerHTML =
        button.dataset.originalText;

      delete button.dataset.originalText;
    }
  }

  /* ==========================================================
     FORM
     ========================================================== */

  function serializeForm(form) {
    const data = {};

    if (!form) {
      return data;
    }

    const formData = new FormData(form);

    formData.forEach((value, key) => {
      if (value instanceof File) {
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
        if (Array.isArray(data[key])) {
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
    });

    return data;
  }

  /* ==========================================================
     ССЫЛКИ
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
      encodeURIComponent(String(id))
    );
  }

  function profileUrl(username) {
    const value =
      String(username || "").trim();

    if (!value) {
      return "/profile.html";
    }

    return (
      "/profile.html?username=" +
      encodeURIComponent(value)
    );
  }

  /* ==========================================================
     МОБИЛЬНОЕ МЕНЮ
     ========================================================== */

  function initMobileMenu() {
    const toggle =
      document.querySelector(
        SELECTORS.menuToggle
      );

    const menu =
      document.querySelector(
        SELECTORS.mobileMenu
      );

    if (!toggle || !menu) {
      return;
    }

    if (
      toggle.dataset.toMenuInitialized ===
      "true"
    ) {
      return;
    }

    toggle.dataset.toMenuInitialized = "true";

    toggle.addEventListener("click", (event) => {
      event.preventDefault();

      const isOpen =
        menu.classList.contains("is-open") ||
        menu.hidden === false;

      menu.classList.toggle(
        "is-open",
        !isOpen
      );

      menu.hidden = isOpen;

      toggle.setAttribute(
        "aria-expanded",
        isOpen ? "false" : "true"
      );
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        menu.hidden = true;

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );
      });
    });
  }

  /* ==========================================================
     УВЕДОМЛЕНИЯ
     ========================================================== */

  async function getNotifications() {
    try {
      const result =
        await getJson("/api/notifications");

      if (Array.isArray(result)) {
        return result;
      }

      if (
        result &&
        Array.isArray(result.notifications)
      ) {
        return result.notifications;
      }

      if (
        result?.data &&
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

      badge.hidden = unread <= 0;
    });

    return unread;
  }

  /* ==========================================================
     ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
     ========================================================== */

  let currentUserCache;
  let currentUserLoaded = false;

  async function getCurrentUser(force = false) {
    if (
      currentUserLoaded &&
      !force
    ) {
      return currentUserCache || null;
    }

    try {
      const result =
        await getJson("/api/auth/me");

      let user = null;

      if (result?.user) {
        user = result.user;
      } else if (
        result?.data?.user
      ) {
        user = result.data.user;
      } else if (
        result &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        (
          result.id ||
          result.username ||
          result.email
        )
      ) {
        user = result;
      }

      currentUserCache = user;
      currentUserLoaded = true;

      return user;
    } catch {
      currentUserCache = null;
      currentUserLoaded = true;

      return null;
    }
  }

  function clearCurrentUser() {
    currentUserCache = null;
    currentUserLoaded = false;
  }

  /* ==========================================================
     НАВИГАЦИЯ
     ========================================================== */

  function navigate(url) {
    if (!url) {
      return;
    }

    window.location.href = url;
  }

  function goHome() {
    navigate("/index.html");
  }

  function goProfile(user = null) {
    const username =
      user?.username ||
      getQueryParam("username");

    navigate(
      profileUrl(username)
    );
  }

  function goAdd() {
    navigate("/add.html");
  }

  function goNotifications() {
    navigate("/notifications.html");
  }

  function goMessages() {
    navigate("/messages.html");
  }

  function goSaved() {
    navigate("/saved.html");
  }

  /* ==========================================================
     AUTH — ОТКРЫТЬ ВХОД
     ========================================================== */

  function openLogin() {
    const registerModal =
      findRegisterModal();

    if (registerModal) {
      closeModal(registerModal);
    }

    switchAuthMode("login");

    const loginModal =
      findLoginModal();

    if (
      loginModal &&
      loginModal !== findAuthModal()
    ) {
      openModal(loginModal);
    }

    const username =
      document.querySelector(
        'input[name="username"]'
      );

    if (username) {
      setTimeout(() => {
        username.focus();
      }, 50);
    }
  }

  /* ==========================================================
     AUTH — ОТКРЫТЬ РЕГИСТРАЦИЮ
     ========================================================== */

  function openRegister() {
    const loginModal =
      findLoginModal();

    if (loginModal) {
      closeModal(loginModal);
    }

    switchAuthMode("register");

    const registerModal =
      findRegisterModal();

    if (
      registerModal &&
      registerModal !== findAuthModal()
    ) {
      openModal(registerModal);
    }

    const name =
      document.querySelector(
        'input[name="name"]'
      );

    if (name) {
      setTimeout(() => {
        name.focus();
      }, 50);
    }
  }

  /* ==========================================================
     LOGIN
     ========================================================== */

  async function loginUser(payload) {
    const username =
      String(
        payload?.username ||
        payload?.login ||
        ""
      ).trim();

    const password =
      String(
        payload?.password ||
        ""
      );

    if (!username) {
      throw new Error(
        "Введите имя пользователя."
      );
    }

    if (!password) {
      throw new Error(
        "Введите пароль."
      );
    }

    const result =
      await postJson(
        "/api/auth/login",
        {
          username,
          password,
        }
      );

    clearCurrentUser();

    const user =
      await getCurrentUser(true);

    return {
      result,
      user,
    };
  }

  /* ==========================================================
     REGISTER
     ========================================================== */

  async function registerUser(payload) {
    const name =
      String(
        payload?.name ||
        ""
      ).trim();

    const username =
      String(
        payload?.username ||
        ""
      ).trim();

    const email =
      String(
        payload?.email ||
        ""
      ).trim();

    const password =
      String(
        payload?.password ||
        ""
      );

    if (!name) {
      throw new Error(
        "Введите ваше имя."
      );
    }

    if (!username) {
      throw new Error(
        "Введите имя пользователя."
      );
    }

    if (!password) {
      throw new Error(
        "Введите пароль."
      );
    }

    if (password.length < 6) {
      throw new Error(
        "Пароль должен содержать минимум 6 символов."
      );
    }

    const body = {
      name,
      username,
      password,
    };

    if (email) {
      body.email = email;
    }

    const result =
      await postJson(
        "/api/auth/register",
        body
      );

    clearCurrentUser();

    const user =
      await getCurrentUser(true);

    return {
      result,
      user,
    };
  }

  /* ==========================================================
     LOGOUT
     ========================================================== */

  async function logoutUser() {
    try {
      await postJson(
        "/api/auth/logout",
        {}
      );
    } finally {
      clearCurrentUser();
    }

    return true;
  }

  /* ==========================================================
     ОБНОВЛЕНИЕ UI ПО AUTH
     ========================================================== */

  function updateAuthUI(user) {
    const loggedIn = Boolean(user);

    document.documentElement.dataset.authenticated =
      loggedIn
        ? "true"
        : "false";

    document.body.dataset.authenticated =
      loggedIn
        ? "true"
        : "false";

    $$(
      '[data-auth-required], .auth-required'
    ).forEach((element) => {
      element.hidden = !loggedIn;
    });

    $$(
      '[data-auth-guest], .auth-guest'
    ).forEach((element) => {
      element.hidden = loggedIn;
    });

    $$(SELECTORS.profile).forEach((button) => {
      if (!loggedIn) {
        return;
      }

      if (
        button.tagName === "A"
      ) {
        button.href =
          profileUrl(user.username);
      }
    });

    $$(
      '[data-user-name], #currentUserName'
    ).forEach((element) => {
      element.textContent =
        user?.name ||
        user?.username ||
        "Пользователь";
    });

    $$(
      '[data-user-username], #currentUsername'
    ).forEach((element) => {
      element.textContent =
        user?.username
          ? "@" + user.username
          : "";
    });

    $$(
      '[data-user-avatar], #currentUserAvatar'
    ).forEach((element) => {
      const avatar =
        safeImageUrl(user?.avatar);

      if (
        element.tagName === "IMG"
      ) {
        if (avatar) {
          element.src = avatar;
        }

        element.alt =
          user?.name ||
          user?.username ||
          "Профиль";
      } else if (avatar) {
        element.style.backgroundImage =
          `url("${avatar}")`;
      }
    });
  }

  /* ==========================================================
     ЗАЩИЩЁННАЯ НАВИГАЦИЯ
     ========================================================== */

  async function requireAuth(
    action,
    options = {}
  ) {
    const user =
      await getCurrentUser();

    if (user) {
      if (typeof action === "function") {
        return action(user);
      }

      return user;
    }

    showToast(
      options.message ||
        "Сначала войдите в аккаунт.",
      "warning"
    );

    openLogin();

    return null;
  }

  /* ==========================================================
     ОБРАБОТКА AUTH ФОРМ
     ========================================================== */

  async function handleLoginForm(form) {
    if (!form) {
      return;
    }

    if (
      form.dataset.toAuthInitialized ===
      "login"
    ) {
      return;
    }

    form.dataset.toAuthInitialized =
      "login";

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const button =
          form.querySelector(
            'button[type="submit"], input[type="submit"]'
          );

        const data =
          serializeForm(form);

        setButtonLoading(
          button,
          true,
          "Входим..."
        );

        try {
          const result =
            await loginUser(data);

          const modal =
            form.closest(".modal") ||
            findLoginModal() ||
            findAuthModal();

          if (modal) {
            closeModal(modal);
          }

          updateAuthUI(
            result.user
          );

          showToast(
            "Вы успешно вошли в аккаунт.",
            "success"
          );

          if (
            typeof window.onTajikOpportunitiesLogin ===
            "function"
          ) {
            window.onTajikOpportunitiesLogin(
              result.user
            );
          }

          const redirect =
            form.dataset.redirect ||
            getQueryParam("redirect");

          if (redirect) {
            setTimeout(() => {
              navigate(redirect);
            }, 300);
          } else {
            setTimeout(() => {
              window.location.reload();
            }, 300);
          }
        } catch (error) {
          showToast(
            getErrorMessage(
              error,
              "Не удалось войти."
            ),
            "error",
            4500
          );
        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );
  }

  /* ==========================================================
     ОБРАБОТКА REGISTER ФОРМ
     ========================================================== */

  async function handleRegisterForm(form) {
    if (!form) {
      return;
    }

    if (
      form.dataset.toAuthInitialized ===
      "register"
    ) {
      return;
    }

    form.dataset.toAuthInitialized =
      "register";

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        const button =
          form.querySelector(
            'button[type="submit"], input[type="submit"]'
          );

        const data =
          serializeForm(form);

        const password =
          String(
            data.password ||
            ""
          );

        const confirmPassword =
          String(
            data.confirm_password ||
            data.password_confirm ||
            data.confirmPassword ||
            ""
          );

        if (
          confirmPassword &&
          password !== confirmPassword
        ) {
          showToast(
            "Пароли не совпадают.",
            "error"
          );

          return;
        }

        setButtonLoading(
          button,
          true,
          "Создаём аккаунт..."
        );

        try {
          const result =
            await registerUser(
              data
            );

          const modal =
            form.closest(".modal") ||
            findRegisterModal() ||
            findAuthModal();

          if (modal) {
            closeModal(modal);
          }

          updateAuthUI(
            result.user
          );

          showToast(
            "Аккаунт успешно создан.",
            "success"
          );

          if (
            typeof window.onTajikOpportunitiesRegister ===
            "function"
          ) {
            window.onTajikOpportunitiesRegister(
              result.user
            );
          }

          setTimeout(() => {
            window.location.reload();
          }, 500);
        } catch (error) {
          showToast(
            getErrorMessage(
              error,
              "Не удалось создать аккаунт."
            ),
            "error",
            4500
          );
        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );
  }

  /* ==========================================================
     ИНИЦИАЛИЗАЦИЯ AUTH ФОРМ
     ========================================================== */

  function initAuthForms() {
    const loginForms =
      $$(
        '[data-auth-form="login"], #loginForm, #login-form'
      );

    loginForms.forEach(
      handleLoginForm
    );

    const registerForms =
      $$(
        '[data-auth-form="register"], #registerForm, #register-form'
      );

    registerForms.forEach(
      handleRegisterForm
    );
  }

  /* ==========================================================
     УНИВЕРСАЛЬНЫЕ КНОПКИ
     ========================================================== */

  function initUniversalButtons() {
    document.addEventListener(
      "click",
      async (event) => {
        const target =
          event.target.closest(
            "button, a, [role='button']"
          );

        if (!target) {
          return;
        }

        /* ----------------------------------------------
           LOGIN
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.login
          )
        ) {
          const href =
            target.getAttribute("href");

          if (
            target.tagName !== "A" ||
            !href ||
            href === "#" ||
            href.startsWith("javascript:")
          ) {
            event.preventDefault();
          }

          openLogin();
          return;
        }

        /* ----------------------------------------------
           REGISTER
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.register
          )
        ) {
          const href =
            target.getAttribute("href");

          if (
            target.tagName !== "A" ||
            !href ||
            href === "#" ||
            href.startsWith("javascript:")
          ) {
            event.preventDefault();
          }

          openRegister();
          return;
        }

        /* ----------------------------------------------
           LOGOUT
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.logout
          )
        ) {
          event.preventDefault();

          if (
            target.dataset.confirm !==
            "false"
          ) {
            const confirmed =
              window.confirm(
                "Вы действительно хотите выйти из аккаунта?"
              );

            if (!confirmed) {
              return;
            }
          }

          setButtonLoading(
            target,
            true,
            "Выходим..."
          );

          try {
            await logoutUser();

            showToast(
              "Вы вышли из аккаунта.",
              "success"
            );

            setTimeout(() => {
              window.location.href =
                "/index.html";
            }, 300);
          } catch (error) {
            showToast(
              getErrorMessage(
                error,
                "Не удалось выйти."
              ),
              "error"
            );
          } finally {
            setButtonLoading(
              target,
              false
            );
          }

          return;
        }

        /* ----------------------------------------------
           PROFILE
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.profile
          )
        ) {
          event.preventDefault();

          const href =
            target.getAttribute("href");

          const user =
            await getCurrentUser();

          if (user) {
            navigate(
              profileUrl(
                user.username
              )
            );
          } else if (
            href &&
            href !== "#"
          ) {
            navigate(href);
          } else {
            openLogin();
          }

          return;
        }

        /* ----------------------------------------------
           ADD PUBLICATION
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.add
          )
        ) {
          event.preventDefault();

          await requireAuth(
            (user) => {
              goAdd();
            },
            {
              message:
                "Чтобы создать публикацию, войдите в аккаунт.",
            }
          );

          return;
        }

        /* ----------------------------------------------
           NOTIFICATIONS
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.notifications
          )
        ) {
          event.preventDefault();

          await requireAuth(
            () => {
              goNotifications();
            },
            {
              message:
                "Войдите в аккаунт, чтобы открыть уведомления.",
            }
          );

          return;
        }

        /* ----------------------------------------------
           MESSAGES
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.messages
          )
        ) {
          event.preventDefault();

          await requireAuth(
            () => {
              goMessages();
            },
            {
              message:
                "Войдите в аккаунт, чтобы открыть сообщения.",
            }
          );

          return;
        }

        /* ----------------------------------------------
           SAVED
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.saved
          )
        ) {
          event.preventDefault();

          await requireAuth(
            () => {
              goSaved();
            },
            {
              message:
                "Войдите в аккаунт, чтобы открыть сохранённые публикации.",
            }
          );

          return;
        }

        /* ----------------------------------------------
           HOME
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.home
          )
        ) {
          event.preventDefault();
          goHome();
          return;
        }

        /* ----------------------------------------------
           CLOSE MODAL
           ---------------------------------------------- */

        if (
          target.matches(
            SELECTORS.closeModal
          )
        ) {
          event.preventDefault();

          const modal =
            target.closest(".modal") ||
            target.closest(
              '[role="dialog"]'
            );

          if (modal) {
            closeModal(modal);
          }

          return;
        }

        /* ----------------------------------------------
           AUTH TABS
           ---------------------------------------------- */

        const loginTab =
          target.closest(
            '[data-auth-tab="login"]'
          );

        if (loginTab) {
          event.preventDefault();
          openLogin();
          return;
        }

        const registerTab =
          target.closest(
            '[data-auth-tab="register"]'
          );

        if (registerTab) {
          event.preventDefault();
          openRegister();
          return;
        }

        /* ----------------------------------------------
           DATA-NAV
           ---------------------------------------------- */

        const nav =
          target.closest(
            "[data-href]"
          );

        if (
          nav &&
          nav.dataset.href
        ) {
          event.preventDefault();

          navigate(
            nav.dataset.href
          );

          return;
        }

        /* ----------------------------------------------
           PUBLICATION
           ---------------------------------------------- */

        const publication =
          target.closest(
            "[data-publication-id]"
          );

        if (
          publication &&
          !target.closest(
            "button"
          )
        ) {
          const id =
            publication.dataset.publicationId;

          if (id) {
            navigate(
              publicationUrl(id)
            );
          }

          return;
        }

        /* ----------------------------------------------
           PROFILE LINK
           ---------------------------------------------- */

        const profileLink =
          target.closest(
            "[data-profile-username]"
          );

        if (profileLink) {
          event.preventDefault();

          const username =
            profileLink.dataset.profileUsername;

          navigate(
            profileUrl(username)
          );

          return;
        }
      }
    );
  }

  /* ==========================================================
     ЗАКРЫТИЕ MODAL ПО ФОНУ
     ========================================================== */

  function initModalBehavior() {
    document.addEventListener(
      "click",
      (event) => {
        const modal =
          event.target.closest(
            ".modal, [role='dialog']"
          );

        if (!modal) {
          return;
        }

        if (
          event.target === modal &&
          modal.dataset.closeOnBackdrop !==
            "false"
        ) {
          closeModal(modal);
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") {
          return;
        }

        const opened =
          document.querySelector(
            ".modal.is-open, [role='dialog'].is-open"
          );

        if (opened) {
          closeModal(opened);
        }
      }
    );
  }

  /* ==========================================================
     ССЫЛКИ С DATA-HREF
     ========================================================== */

  function initDataLinks() {
    $$("[data-href]").forEach(
      (element) => {
        if (
          element.dataset.toHrefInitialized ===
          "true"
        ) {
          return;
        }

        element.dataset.toHrefInitialized =
          "true";

        element.addEventListener(
          "click",
          (event) => {
            if (
              element.tagName === "A" &&
              element.getAttribute("href")
            ) {
              return;
            }

            event.preventDefault();

            const href =
              element.dataset.href;

            if (href) {
              navigate(href);
            }
          }
        );
      }
    );
  }

  /* ==========================================================
     ENTER В ФОРМАХ
     ========================================================== */

  function initFormAccessibility() {
    $$("form").forEach((form) => {
      form.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key !== "Enter"
          ) {
            return;
          }

          const target =
            event.target;

          if (
            target.tagName === "TEXTAREA"
          ) {
            return;
          }

          const submit =
            form.querySelector(
              'button[type="submit"], input[type="submit"]'
            );

          if (submit) {
            submit.click();
          }
        }
      );
    });
  }

  /* ==========================================================
     ОБНОВЛЕНИЕ AUTH СОСТОЯНИЯ
     ========================================================== */

  async function initAuthState() {
    const user =
      await getCurrentUser();

    updateAuthUI(user);

    return user;
  }

  /* ==========================================================
     ПЕРИОДИЧЕСКИЕ УВЕДОМЛЕНИЯ
     ========================================================== */

  function initNotificationPolling() {
    if (
      document.body.dataset.notificationPolling ===
      "true"
    ) {
      return;
    }

    document.body.dataset.notificationPolling =
      "true";

    window.setInterval(
      async () => {
        try {
          const user =
            await getCurrentUser();

          if (!user) {
            return;
          }

          await updateNotificationBadges();
        } catch {}
      },
      30000
    );
  }

  /* ==========================================================
     ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ
     ========================================================== */

  async function initGlobal() {
    initMobileMenu();

    initUniversalButtons();

    initModalBehavior();

    initAuthForms();

    initDataLinks();

    initFormAccessibility();

    initNotificationPolling();

    try {
      await initAuthState();
    } catch {}

    try {
      await updateNotificationBadges();
    } catch {}
  }

  /* ==========================================================
     ГЛОБАЛЬНЫЙ ОБЪЕКТ TO
     ========================================================== */

  const TO = {
    /* API */
    requestJson,
    getJson,
    postJson,
    putJson,
    deleteJson,

    /* Ошибки */
    getErrorMessage,

    /* Текст */
    escapeHtml,
    normalizeText,
    truncateText,
    debounce,

    /* URL */
    getQueryParam,
    getQueryParams,
    setQueryParams,
    safeExternalUrl,
    safeImageUrl,

    /* Дата */
    parseDate,
    formatDate,
    formatRelativeDate,

    /* Числа */
    formatNumber,
    toNumber,
    toBoolean,

    /* Категории */
    categories,
    getCategoryLabel,
    getCategoryIcon,

    /* DOM */
    $,
    $$,

    /* Cookie */
    getCookie,

    /* UI */
    showToast,
    openModal,
    closeModal,
    setButtonLoading,

    /* Copy / Share */
    copyText,
    shareContent,

    /* Forms */
    serializeForm,

    /* Auth */
    getCurrentUser,
    loginUser,
    registerUser,
    logoutUser,
    clearCurrentUser,
    requireAuth,
    openLogin,
    openRegister,
    switchAuthMode,

    /* Navigation */
    navigate,
    goHome,
    goProfile,
    goAdd,
    goNotifications,
    goMessages,
    goSaved,

    /* Publications */
    publicationUrl,
    profileUrl,

    /* Notifications */
    getNotifications,
    updateNotificationBadges,

    /* Mobile */
    initMobileMenu,

    /* Auth UI */
    updateAuthUI,
  };

  /* ==========================================================
     GLOBAL
     ========================================================== */

  window.TO = TO;

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
      () => {
        initGlobal();
      },
      { once: true }
    );
  } else {
    initGlobal();
  }
})();
