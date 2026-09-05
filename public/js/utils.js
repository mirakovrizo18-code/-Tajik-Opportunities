/* ============================================================
   TAJIK OPPORTUNITIES — COMMON UTILITIES
   ============================================================ */

(function () {
  "use strict";

  /* ==========================================================
     SAFE HTML
     ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* ==========================================================
     TEXT HELPERS
     ========================================================== */

  function truncateText(value, maxLength = 180) {
    const text = String(value ?? "")
      .trim()
      .replace(/\s+/g, " ");

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength).trimEnd()}…`;
  }


  function normalizeText(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFKC")
      .trim();
  }


  /* ==========================================================
     DATE HELPERS
     ========================================================== */

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }


  function formatDateTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }


  function formatRelativeDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = Date.now();
    const diff = now - date.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return "только что";
    }

    if (diff < hour) {
      const minutes = Math.floor(diff / minute);

      return `${minutes} ${
        pluralize(
          minutes,
          "минуту",
          "минуты",
          "минут"
        )
      } назад`;
    }

    if (diff < day) {
      const hours = Math.floor(diff / hour);

      return `${hours} ${
        pluralize(
          hours,
          "час",
          "часа",
          "часов"
        )
      } назад`;
    }

    if (diff < 7 * day) {
      const days = Math.floor(diff / day);

      return `${days} ${
        pluralize(
          days,
          "день",
          "дня",
          "дней"
        )
      } назад`;
    }

    return formatDate(value);
  }


  function pluralize(
    number,
    one,
    few,
    many
  ) {
    const n = Math.abs(Number(number)) % 100;
    const last = n % 10;

    if (n >= 11 && n <= 19) {
      return many;
    }

    if (last === 1) {
      return one;
    }

    if (
      last >= 2 &&
      last <= 4
    ) {
      return few;
    }

    return many;
  }


  /* ==========================================================
     CATEGORY HELPERS
     ========================================================== */

  const CATEGORY_ICONS = {
    "Новости": "📰",
    "Вакансии": "💼",
    "Образование": "🎓",
    "Гранты": "💰",
    "Конкурсы": "🏆",
    "Стажировки": "🚀",
    "Мероприятия": "📅",
    "Волонтёрство": "🤝",
    "Другое": "✨"
  };


  function getCategoryIcon(category) {
    return CATEGORY_ICONS[category] || "✨";
  }


  function getCategoryLabel(category) {
    const value = String(category ?? "").trim();

    if (!value) {
      return "Другое";
    }

    return value;
  }


  /* ==========================================================
     API
     ========================================================== */

  async function apiFetch(
    url,
    options = {}
  ) {
    const config = {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "accept": "application/json"
      },
      ...options
    };

    if (
      config.body &&
      typeof config.body !== "string"
    ) {
      config.body = JSON.stringify(
        config.body
      );
    }

    if (
      config.body &&
      !config.headers["content-type"]
    ) {
      config.headers["content-type"] =
        "application/json";
    }

    const response = await fetch(
      url,
      config
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.error ||
        `Ошибка сервера: ${response.status}`;

      const error = new Error(message);

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }


  /* ==========================================================
     GET JSON
     ========================================================== */

  async function getJson(
    url
  ) {
    return apiFetch(url, {
      method: "GET"
    });
  }


  /* ==========================================================
     POST JSON
     ========================================================== */

  async function postJson(
    url,
    data = {}
  ) {
    return apiFetch(url, {
      method: "POST",
      body: data
    });
  }


  /* ==========================================================
     QUERY PARAMETERS
     ========================================================== */

  function getQueryParam(
    name
  ) {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return params.get(name);
  }


  function setQueryParams(
    paramsObject,
    replace = true
  ) {
    const url =
      new URL(window.location.href);

    Object.entries(
      paramsObject || {}
    ).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(
            key,
            value
          );
        }
      }
    );

    if (replace) {
      window.history.replaceState(
        {},
        "",
        url
      );
    } else {
      window.history.pushState(
        {},
        "",
        url
      );
    }
  }


  /* ==========================================================
     URL HELPERS
     ========================================================== */

  function isSafeUrl(
    value
  ) {
    if (!value) {
      return false;
    }

    try {
      const url =
        new URL(
          value,
          window.location.origin
        );

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }


  function safeExternalUrl(
    value
  ) {
    if (!isSafeUrl(value)) {
      return "";
    }

    try {
      return new URL(
        value,
        window.location.origin
      ).toString();
    } catch {
      return "";
    }
  }


  /* ==========================================================
     DOM HELPERS
     ========================================================== */

  function $(selector, parent = document) {
    return parent.querySelector(
      selector
    );
  }


  function $$(selector, parent = document) {
    return Array.from(
      parent.querySelectorAll(
        selector
      )
    );
  }


  function show(element) {
    if (!element) {
      return;
    }

    element.classList.remove(
      "hidden"
    );
  }


  function hide(element) {
    if (!element) {
      return;
    }

    element.classList.add(
      "hidden"
    );
  }


  function setText(
    element,
    value
  ) {
    if (!element) {
      return;
    }

    element.textContent =
      String(value ?? "");
  }


  /* ==========================================================
     TOAST
     ========================================================== */

  let toastTimer = null;


  function showToast(
    message,
    type = "info",
    duration = 3500
  ) {
    let toast =
      document.getElementById(
        "toast"
      );

    if (!toast) {
      toast =
        document.createElement(
          "div"
        );

      toast.id = "toast";
      toast.className =
        "toast";

      toast.setAttribute(
        "role",
        "status"
      );

      toast.setAttribute(
        "aria-live",
        "polite"
      );

      document.body.appendChild(
        toast
      );
    }

    toast.classList.remove(
      "toast-success",
      "toast-error",
      "toast-warning",
      "toast-info",
      "show"
    );

    toast.classList.add(
      `toast-${type}`
    );

    toast.textContent =
      String(message ?? "");

    requestAnimationFrame(() => {
      toast.classList.add(
        "show"
      );
    });

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(
      () => {
        toast.classList.remove(
          "show"
        );
      },
      duration
    );
  }


  /* ==========================================================
     COPY TO CLIPBOARD
     ========================================================== */

  async function copyText(
    value
  ) {
    const text =
      String(value ?? "");

    if (!text) {
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          text
        );

        return true;
      }
    } catch {
      // Continue to fallback.
    }

    try {
      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value = text;

      textarea.style.position =
        "fixed";

      textarea.style.opacity = "0";

      document.body.appendChild(
        textarea
      );

      textarea.focus();
      textarea.select();

      const successful =
        document.execCommand(
          "copy"
        );

      textarea.remove();

      return successful;
    } catch {
      return false;
    }
  }


  /* ==========================================================
     DEBOUNCE
     ========================================================== */

  function debounce(
    callback,
    delay = 250
  ) {
    let timer = null;

    return function (...args) {
      clearTimeout(timer);

      timer = setTimeout(
        () => {
          callback.apply(
            this,
            args
          );
        },
        delay
      );
    };
  }


  /* ==========================================================
     FORM HELPERS
     ========================================================== */

  function setButtonLoading(
    button,
    loading,
    loadingText = "Загрузка..."
  ) {
    if (!button) {
      return;
    }

    if (loading) {
      if (
        !button.dataset.originalText
      ) {
        button.dataset.originalText =
          button.textContent;
      }

      button.disabled = true;

      button.setAttribute(
        "aria-busy",
        "true"
      );

      button.textContent =
        loadingText;
    } else {
      button.disabled = false;

      button.removeAttribute(
        "aria-busy"
      );

      if (
        button.dataset.originalText
      ) {
        button.textContent =
          button.dataset.originalText;
      }
    }
  }


  /* ==========================================================
     YEAR
     ========================================================== */

  function setCurrentYear() {
    const elements =
      document.querySelectorAll(
        "#currentYear"
      );

    const year =
      new Date().getFullYear();

    elements.forEach(
      (element) => {
        element.textContent =
          String(year);
      }
    );
  }


  /* ==========================================================
     STATUS HELPERS
     ========================================================== */

  function getStatusLabel(
    status
  ) {
    const labels = {
      pending: "На модерации",
      approved: "Одобрена",
      rejected: "Отклонена"
    };

    return (
      labels[status] ||
      "Неизвестный статус"
    );
  }


  function getStatusIcon(
    status
  ) {
    const icons = {
      pending: "⏳",
      approved: "✅",
      rejected: "❌"
    };

    return icons[status] || "ℹ️";
  }


  /* ==========================================================
     SHARE
     ========================================================== */

  async function sharePage(
    title,
    text,
    url = window.location.href
  ) {
    const shareData = {
      title:
        String(title ?? ""),
      text:
        String(text ?? ""),
      url:
        String(url ?? "")
    };

    if (
      navigator.share
    ) {
      try {
        await navigator.share(
          shareData
        );

        return true;
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return false;
        }
      }
    }

    const copied =
      await copyText(url);

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
     ERROR MESSAGE
     ========================================================== */

  function getErrorMessage(
    error,
    fallback =
      "Произошла ошибка. Попробуйте ещё раз."
  ) {
    if (!error) {
      return fallback;
    }

    if (
      typeof error ===
      "string"
    ) {
      return error;
    }

    if (
      error.message
    ) {
      return error.message;
    }

    return fallback;
  }


  /* ==========================================================
     EXPOSE GLOBAL API
     ========================================================== */

  window.TO = {
    escapeHtml,
    truncateText,
    normalizeText,

    formatDate,
    formatDateTime,
    formatRelativeDate,
    pluralize,

    getCategoryIcon,
    getCategoryLabel,

    apiFetch,
    getJson,
    postJson,

    getQueryParam,
    setQueryParams,

    isSafeUrl,
    safeExternalUrl,

    $,
    $$,
    show,
    hide,
    setText,

    showToast,

    copyText,
    debounce,

    setButtonLoading,

    setCurrentYear,

    getStatusLabel,
    getStatusIcon,

    sharePage,

    getErrorMessage
  };


  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      setCurrentYear();
    }
  );

})();
