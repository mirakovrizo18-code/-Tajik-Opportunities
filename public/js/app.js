/* ============================================================
   TAJIK OPPORTUNITIES
   Global Frontend Application
   Version 6.0
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     GLOBAL CONFIG
     ========================================================== */

  const API_BASE = "/api";

  const TO = {
    name: "Tajik Opportunities",
    version: "6.0.0"
  };

  /* ==========================================================
     HELPERS
     ========================================================== */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function truncate(text, length = 180) {
    if (!text) return "";

    const value = String(text);

    if (value.length <= length) {
      return value;
    }

    return value.slice(0, length).trim() + "…";
  }

  function formatNumber(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("ru-RU").format(number);
  }

  function formatDate(value, options = {}) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat(
      options.locale || "ru-RU",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...options
      }
    ).format(date);
  }

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function isValidURL(value) {
    if (!value) return false;

    try {
      const url = new URL(value);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  function debounce(callback, delay = 350) {
    let timer;

    return (...args) => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }

  /* ==========================================================
     API
     ========================================================== */

  async function apiRequest(
    endpoint,
    options = {}
  ) {
    const config = {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    };

    try {
      const response = await fetch(
        `${API_BASE}${endpoint}`,
        config
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message =
          typeof data === "object" && data?.error
            ? data.error
            : `Ошибка сервера: ${response.status}`;

        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error(
        "[Tajik Opportunities API]",
        error
      );

      throw error;
    }
  }

  async function getJSON(endpoint) {
    return apiRequest(endpoint, {
      method: "GET"
    });
  }

  async function postJSON(endpoint, body = {}) {
    return apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  /* ==========================================================
     MOBILE MENU
     ========================================================== */

  function closeMobileMenu() {
    const button = $(".mobile-menu-button");
    const nav = $(".site-nav");

    if (!nav) return;

    nav.classList.remove("open");

    if (button) {
      button.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    document.body.classList.remove("no-scroll");
  }

  function openMobileMenu() {
    const button = $(".mobile-menu-button");
    const nav = $(".site-nav");

    if (!nav) return;

    nav.classList.add("open");

    if (button) {
      button.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    document.body.classList.add("no-scroll");
  }

  function initMobileMenu() {
    const button = $(".mobile-menu-button");
    const nav = $(".site-nav");

    if (!button || !nav) return;

    button.setAttribute(
      "aria-expanded",
      "false"
    );

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen =
        nav.classList.contains("open");

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    $$("a", nav).forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) {
        return;
      }

      if (
        !nav.contains(event.target) &&
        !button.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });
  }

  /* ==========================================================
     ESCAPE KEY
     ========================================================== */

  function initEscapeKey() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") {
          return;
        }

        $$(".modal.show").forEach(
          (modal) => {
            modal.classList.remove("show");
          }
        );

        closeMobileMenu();

        document.body.classList.remove(
          "no-scroll"
        );
      }
    );
  }

  /* ==========================================================
     MODALS
     ========================================================== */

  function openModal(id) {
    const modal = document.getElementById(id);

    if (!modal) return false;

    modal.classList.add("show");

    document.body.classList.add("no-scroll");

    return true;
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("show");

    if (!$(".modal.show")) {
      document.body.classList.remove(
        "no-scroll"
      );
    }
  }

  function closeAllModals() {
    $$(".modal.show").forEach(
      (modal) => {
        modal.classList.remove("show");
      }
    );

    document.body.classList.remove(
      "no-scroll"
    );
  }

  function initModals() {
    $$("[data-modal-open]").forEach(
      (trigger) => {
        trigger.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            const modalId =
              trigger.getAttribute(
                "data-modal-open"
              );

            if (modalId) {
              openModal(modalId);
            }
          }
        );
      }
    );

    $$("[data-modal-close]").forEach(
      (trigger) => {
        trigger.addEventListener(
          "click",
          () => {
            const modal =
              trigger.closest(".modal");

            closeModal(modal);
          }
        );
      }
    );

    $$(".modal").forEach((modal) => {
      modal.addEventListener(
        "click",
        (event) => {
          if (event.target === modal) {
            closeModal(modal);
          }
        }
      );
    });
  }

  /* ==========================================================
     TOAST NOTIFICATIONS
     ========================================================== */

  function showToast(
    message,
    type = "success",
    duration = 3500
  ) {
    let container =
      $(".toast-container");

    if (!container) {
      container =
        document.createElement("div");

      container.className =
        "toast-container";

      document.body.appendChild(
        container
      );
    }

    const toast =
      document.createElement("div");

    toast.className =
      `toast ${type}`;

    toast.setAttribute(
      "role",
      "status"
    );

    toast.textContent =
      message || "";

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();

        if (
          container.children.length === 0
        ) {
          container.remove();
        }
      }, 300);
    }, duration);

    return toast;
  }

  function showSuccess(message) {
    return showToast(
      message,
      "success"
    );
  }

  function showError(message) {
    return showToast(
      message,
      "error"
    );
  }

  function showInfo(message) {
    return showToast(
      message,
      "info"
    );
  }

  function showWarning(message) {
    return showToast(
      message,
      "warning"
    );
  }

  /* ==========================================================
     COPY TO CLIPBOARD
     ========================================================== */

  async function copyText(text) {
    if (!text) {
      showError(
        "Нечего копировать"
      );

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
      } else {
        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value = text;

        textarea.style.position =
          "fixed";

        textarea.style.left =
          "-9999px";

        textarea.style.top =
          "-9999px";

        document.body.appendChild(
          textarea
        );

        textarea.focus();
        textarea.select();

        document.execCommand(
          "copy"
        );

        textarea.remove();
      }

      showSuccess("Скопировано");

      return true;
    } catch (error) {
      console.error(error);

      showError(
        "Не удалось скопировать"
      );

      return false;
    }
  }

  function initCopyButtons() {
    $$("[data-copy]").forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            const value =
              button.getAttribute(
                "data-copy"
              );

            if (!value) return;

            const copied =
              await copyText(value);

            if (copied) {
              button.classList.add(
                "copied"
              );

              setTimeout(() => {
                button.classList.remove(
                  "copied"
                );
              }, 1200);
            }
          }
        );
      }
    );
  }

  /* ==========================================================
     EXTERNAL LINKS
     ========================================================== */

  function initExternalLinks() {
    $$("a[href]").forEach((link) => {
      const href =
        link.getAttribute("href");

      if (!href) return;

      if (
        href.startsWith(
          "javascript:"
        )
      ) {
        return;
      }

      try {
        const url = new URL(
          href,
          window.location.href
        );

        if (
          url.origin !==
          window.location.origin
        ) {
          link.setAttribute(
            "target",
            "_blank"
          );

          link.setAttribute(
            "rel",
            "noopener noreferrer"
          );
        }
      } catch {
        // Invalid URL.
      }
    });
  }

  /* ==========================================================
     IMAGE FALLBACKS
     ========================================================== */

  function initImageFallbacks() {
    $$("img").forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          image.classList.add(
            "image-error"
          );

          image.setAttribute(
            "aria-hidden",
            "true"
          );
        },
        {
          once: true
        }
      );

      if (
        image.complete &&
        image.naturalWidth === 0
      ) {
        image.classList.add(
          "image-error"
        );
      }
    });
  }

  /* ==========================================================
     LAZY IMAGES
     ========================================================== */

  function initLazyImages() {
    $$("img[data-src]").forEach(
      (image) => {
        const source =
          image.getAttribute(
            "data-src"
          );

        if (!source) return;

        if (
          "IntersectionObserver" in
          window
        ) {
          const observer =
            new IntersectionObserver(
              (entries, obs) => {
                entries.forEach(
                  (entry) => {
                    if (
                      !entry.isIntersecting
                    ) {
                      return;
                    }

                    image.src =
                      source;

                    image.removeAttribute(
                      "data-src"
                    );

                    obs.unobserve(
                      image
                    );
                  }
                );
              },
              {
                rootMargin:
                  "200px"
              }
            );

          observer.observe(image);
        } else {
          image.src = source;

          image.removeAttribute(
            "data-src"
          );
        }
      }
    );
  }

  /* ==========================================================
     CURRENT YEAR
     ========================================================== */

  function initCurrentYear() {
    const year =
      new Date().getFullYear();

    $$(
      "[data-current-year]"
    ).forEach((element) => {
      element.textContent =
        year;
    });
  }

  /* ==========================================================
     ACTIVE NAVIGATION
     ========================================================== */

  function initActiveNavigation() {
    const currentPath =
      window.location.pathname
        .replace(/\/+$/, "");

    $$(
      ".site-nav a[href]"
    ).forEach((link) => {
      const href =
        link.getAttribute(
          "href"
        );

      if (!href) return;

      if (
        href.startsWith(
          "http://"
        ) ||
        href.startsWith(
          "https://"
        ) ||
        href.startsWith("#")
      ) {
        return;
      }

      let linkPath = href;

      try {
        linkPath =
          new URL(
            href,
            window.location.origin
          ).pathname
            .replace(/\/+$/, "");
      } catch {
        return;
      }

      if (
        linkPath ===
        currentPath
      ) {
        link.classList.add(
          "active"
        );

        link.setAttribute(
          "aria-current",
          "page"
        );
      }
    });
  }

  /* ==========================================================
     SEARCH
     ========================================================== */

  function initSearch() {
    const inputs = $$(
      "[data-site-search]"
    );

    inputs.forEach((input) => {
      const form =
        input.closest("form");

      if (!form) return;

      form.addEventListener(
        "submit",
        (event) => {
          const query =
            input.value.trim();

          if (!query) {
            event.preventDefault();
            return;
          }
        }
      );
    });
  }

  /* ==========================================================
     SEARCH PARAMETER HELPERS
     ========================================================== */

  function getURLParameter(
    name
  ) {
    return new URLSearchParams(
      window.location.search
    ).get(name);
  }

  function setURLParameter(
    name,
    value
  ) {
    const url =
      new URL(
        window.location.href
      );

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      url.searchParams.delete(
        name
      );
    } else {
      url.searchParams.set(
        name,
        value
      );
    }

    window.history.replaceState(
      {},
      "",
      url
    );
  }

  /* ==========================================================
     FORM UTILITIES
     ========================================================== */

  function getFormDataObject(
    form
  ) {
    const formData =
      new FormData(form);

    const data = {};

    for (
      const [
        key,
        value
      ] of formData.entries()
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          data,
          key
        )
      ) {
        if (
          !Array.isArray(
            data[key]
          )
        ) {
          data[key] = [
            data[key]
          ];
        }

        data[key].push(value);
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  function setLoading(
    element,
    loading = true,
    text = "Загрузка..."
  ) {
    if (!element) return;

    if (loading) {
      element.dataset.originalText =
        element.textContent;

      element.disabled = true;

      element.classList.add(
        "loading"
      );

      element.textContent = text;
    } else {
      element.disabled = false;

      element.classList.remove(
        "loading"
      );

      if (
        element.dataset.originalText
      ) {
        element.textContent =
          element.dataset.originalText;
      }
    }
  }

  /* ==========================================================
     NUMBER INPUTS
     ========================================================== */

  function initNumberInputs() {
    $$("input[type='number']").forEach(
      (input) => {
        input.addEventListener(
          "input",
          () => {
            if (
              input.value === ""
            ) {
              return;
            }

            const number =
              Number(input.value);

            if (
              Number.isNaN(number)
            ) {
              input.value = "";
            }
          }
        );
      }
    );
  }

  /* ==========================================================
     AUTO RESIZE TEXTAREA
     ========================================================== */

  function autoResizeTextarea(
    textarea
  ) {
    textarea.style.height =
      "auto";

    textarea.style.height =
      `${textarea.scrollHeight}px`;
  }

  function initTextareas() {
    $$("textarea").forEach(
      (textarea) => {
        if (
          textarea.dataset.autoresize ===
          "false"
        ) {
          return;
        }

        textarea.addEventListener(
          "input",
          () => {
            autoResizeTextarea(
              textarea
            );
          }
        );

        requestAnimationFrame(
          () => {
            autoResizeTextarea(
              textarea
            );
          }
        );
      }
    );
  }

  /* ==========================================================
     CHARACTER COUNTERS
     ========================================================== */

  function initCharacterCounters() {
    $$(
      "[data-character-counter]"
    ).forEach((counter) => {
      const targetId =
        counter.getAttribute(
          "data-character-counter"
        );

      const target =
        document.getElementById(
          targetId
        );

      if (!target) return;

      const update = () => {
        const length =
          target.value?.length ||
          0;

        counter.textContent =
          formatNumber(length);
      };

      target.addEventListener(
        "input",
        update
      );

      update();
    });
  }

  /* ==========================================================
     URL PREVIEW
     ========================================================== */

  function createURLPreview(
    url,
    container
  ) {
    if (!container) return;

    container.innerHTML = "";

    if (!isValidURL(url)) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = url;

    link.target = "_blank";

    link.rel =
      "noopener noreferrer";

    link.textContent =
      url;

    container.appendChild(
      link
    );
  }

  /* ==========================================================
     MEDIA URL HELPERS
     ========================================================== */

  function detectMediaType(url) {
    if (!url) {
      return "other";
    }

    const lower =
      url.toLowerCase();

    if (
      /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/.test(
        lower
      )
    ) {
      return "image";
    }

    if (
      /\.(mp4|webm|mov|m4v)(\?.*)?$/.test(
        lower
      )
    ) {
      return "video";
    }

    if (
      /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/.test(
        lower
      )
    ) {
      return "audio";
    }

    return "link";
  }

  /* ==========================================================
     SHARE
     ========================================================== */

  async function shareURL(
    url = window.location.href,
    title = TO.name,
    text = ""
  ) {
    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title,
          text,
          url
        });

        return true;
      }

      return await copyText(
        url
      );
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        return false;
      }

      return false;
    }
  }

  function initShareButtons() {
    $$("[data-share]").forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            const url =
              button.getAttribute(
                "data-share-url"
              ) ||
              window.location.href;

            const title =
              button.getAttribute(
                "data-share-title"
              ) ||
              document.title;

            const text =
              button.getAttribute(
                "data-share-text"
              ) ||
              "";

            await shareURL(
              url,
              title,
              text
            );
          }
        );
      }
    );
  }

  /* ==========================================================
     FAVORITE / SAVE
     ========================================================== */

  async function toggleFavorite(
    publicationId,
    button = null
  ) {
    if (!publicationId) {
      return null;
    }

    try {
      const result =
        await postJSON(
          `/publications/${encodeURIComponent(
            publicationId
          )}/favorite`,
          {}
        );

      if (button) {
        button.classList.toggle(
          "active",
          Boolean(
            result?.saved
          )
        );

        const count =
          button.querySelector(
            "[data-save-count]"
          );

        if (
          count &&
          result?.saves !==
            undefined
        ) {
          count.textContent =
            formatNumber(
              result.saves
            );
        }
      }

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось сохранить публикацию"
      );

      return null;
    }
  }

  function initFavoriteButtons() {
    $$(
      "[data-favorite]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const id =
            button.getAttribute(
              "data-favorite"
            );

          await toggleFavorite(
            id,
            button
          );
        }
      );
    });
  }

  /* ==========================================================
     REACTIONS
     ========================================================== */

  async function reactToPublication(
    publicationId,
    reaction = "like",
    button = null
  ) {
    if (!publicationId) {
      return null;
    }

    try {
      const result =
        await postJSON(
          `/publications/${encodeURIComponent(
            publicationId
          )}/react`,
          {
            reaction
          }
        );

      if (button) {
        $$(".reaction-button").forEach(
          (item) => {
            if (
              item.getAttribute(
                "data-reaction"
              ) === reaction
            ) {
              item.classList.toggle(
                "active",
                Boolean(
                  result?.reacted
                )
              );
            }
          }
        );
      }

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось поставить реакцию"
      );

      return null;
    }
  }

  function initReactionButtons() {
    $$(
      "[data-reaction]"
    ).forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const publicationId =
            button.getAttribute(
              "data-publication-id"
            );

          const reaction =
            button.getAttribute(
              "data-reaction"
            ) ||
            "like";

          if (!publicationId) {
            return;
          }

          await reactToPublication(
            publicationId,
            reaction,
            button
          );
        }
      );
    });
  }

  /* ==========================================================
     VIEW COUNT
     ========================================================== */

  async function registerView(
    publicationId
  ) {
    if (!publicationId) {
      return null;
    }

    try {
      return await postJSON(
        `/publications/${encodeURIComponent(
          publicationId
        )}/view`,
        {}
      );
    } catch {
      return null;
    }
  }

  /* ==========================================================
     COMMENTS
     ========================================================== */

  async function loadComments(
    publicationId
  ) {
    if (!publicationId) {
      return null;
    }

    try {
      return await getJSON(
        `/publications/${encodeURIComponent(
          publicationId
        )}/comments`
      );
    } catch (error) {
      showError(
        error.message ||
          "Не удалось загрузить комментарии"
      );

      return null;
    }
  }

  /* ==========================================================
     REPORT
     ========================================================== */

  async function reportPublication(
    publicationId,
    reason,
    details = ""
  ) {
    if (!publicationId) {
      return false;
    }

    try {
      await postJSON(
        "/reports",
        {
          publication_id:
            publicationId,
          reason,
          details
        }
      );

      showSuccess(
        "Жалоба отправлена модераторам"
      );

      return true;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось отправить жалобу"
      );

      return false;
    }
  }

  /* ==========================================================
     VISIBILITY HELPERS
     ========================================================== */

  function showElement(
    element
  ) {
    if (!element) return;

    element.hidden = false;

    element.classList.remove(
      "hide"
    );
  }

  function hideElement(
    element
  ) {
    if (!element) return;

    element.hidden = true;

    element.classList.add(
      "hide"
    );
  }

  /* ==========================================================
     LOADING STATES
     ========================================================== */

  function showLoading(
    element,
    text = "Загрузка..."
  ) {
    if (!element) return;

    element.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner" aria-hidden="true"></div>
        <div>${escapeHTML(text)}</div>
      </div>
    `;

    showElement(element);
  }

  function showEmpty(
    element,
    text = "Ничего не найдено"
  ) {
    if (!element) return;

    element.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔎</div>
        <div class="empty-state-title">
          ${escapeHTML(text)}
        </div>
      </div>
    `;

    showElement(element);
  }

  function showErrorState(
    element,
    text = "Произошла ошибка"
  ) {
    if (!element) return;

    element.innerHTML = `
      <div class="error-state">
        <div class="error-state-icon">⚠️</div>
        <div class="error-state-title">
          ${escapeHTML(text)}
        </div>
        <button type="button" data-retry>
          Повторить
        </button>
      </div>
    `;

    showElement(element);
  }

  /* ==========================================================
     CONNECTION STATUS
     ========================================================== */

  function updateConnectionStatus() {
    const elements =
      $$("[data-connection-status]");

    if (!elements.length) {
      return;
    }

    const online =
      navigator.onLine;

    elements.forEach(
      (element) => {
        element.textContent =
          online
            ? "Онлайн"
            : "Нет подключения";

        element.classList.toggle(
          "offline",
          !online
        );

        element.classList.toggle(
          "online",
          online
        );
      }
    );
  }

  function initConnectionStatus() {
    window.addEventListener(
      "online",
      updateConnectionStatus
    );

    window.addEventListener(
      "offline",
      updateConnectionStatus
    );

    updateConnectionStatus();
  }

  /* ==========================================================
     PREVENT DOUBLE SUBMIT
     ========================================================== */

  function initFormProtection() {
    $$("form").forEach((form) => {
      form.addEventListener(
        "submit",
        () => {
          form.classList.add(
            "submitting"
          );

          const buttons =
            $$(
              "button[type='submit']",
              form
            );

          buttons.forEach(
            (button) => {
              button.dataset.originalText =
                button.textContent;

              button.disabled =
                true;

              button.classList.add(
                "loading"
              );
            }
          );
        }
      );
    });
  }

  /* ==========================================================
     BACK TO TOP
     ========================================================== */

  function initBackToTop() {
    const button =
      $("[data-back-to-top]");

    if (!button) return;

    const update =
      () => {
        button.classList.toggle(
          "show",
          window.scrollY > 500
        );
      };

    window.addEventListener(
      "scroll",
      update,
      {
        passive: true
      }
    );

    button.addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );

    update();
  }

  /* ==========================================================
     SCROLL REVEAL
     ========================================================== */

  function initScrollReveal() {
    const elements =
      $$("[data-reveal]");

    if (!elements.length) {
      return;
    }

    if (
      !("IntersectionObserver" in
        window)
    ) {
      elements.forEach(
        (element) => {
          element.classList.add(
            "revealed"
          );
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "revealed"
              );

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.08
        }
      );

    elements.forEach(
      (element) => {
        observer.observe(
          element
        );
      }
    );
  }

  /* ==========================================================
     LANGUAGE
     ========================================================== */

  function getStoredLanguage() {
    try {
      return (
        localStorage.getItem(
          "to_language"
        ) || "ru"
      );
    } catch {
      return "ru";
    }
  }

  function setStoredLanguage(
    language
  ) {
    try {
      localStorage.setItem(
        "to_language",
        language
      );
    } catch {
      // Storage unavailable.
    }
  }

  function initLanguageSelector() {
    $$(
      "[data-language-selector]"
    ).forEach((select) => {
      const current =
        getStoredLanguage();

      if (
        select.querySelector(
          `option[value="${current}"]`
        )
      ) {
        select.value =
          current;
      }

      select.addEventListener(
        "change",
        () => {
          const language =
            select.value;

          setStoredLanguage(
            language
          );

          document.documentElement.setAttribute(
            "lang",
            language
          );

          window.dispatchEvent(
            new CustomEvent(
              "to:language-change",
              {
                detail: {
                  language
                }
              }
            )
          );
        }
      );
    });

    document.documentElement.setAttribute(
      "lang",
      getStoredLanguage()
    );
  }

  /* ==========================================================
     KEYBOARD ACCESSIBILITY
     ========================================================== */

  function initKeyboardAccessibility() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" &&
          event.target.matches(
            "[data-keyboard-click]"
          )
        ) {
          event.target.click();
        }
      }
    );
  }

  /* ==========================================================
     GLOBAL CLICK ACTIONS
     ========================================================== */

  function initGlobalActions() {
    document.addEventListener(
      "click",
      async (event) => {
        const target =
          event.target.closest(
            "[data-action]"
          );

        if (!target) return;

        const action =
          target.getAttribute(
            "data-action"
          );

        if (
          action ===
          "copy-link"
        ) {
          event.preventDefault();

          await copyText(
            target.getAttribute(
              "data-url"
            ) ||
              window.location.href
          );
        }

        if (
          action ===
          "share"
        ) {
          event.preventDefault();

          await shareURL(
            target.getAttribute(
              "data-url"
            ) ||
              window.location.href,
            target.getAttribute(
              "data-title"
            ) ||
              document.title,
            target.getAttribute(
              "data-text"
            ) ||
              ""
          );
        }

        if (
          action ===
          "back"
        ) {
          event.preventDefault();

          if (
            window.history.length >
            1
          ) {
            window.history.back();
          } else {
            window.location.href =
              "/";
          }
        }

        if (
          action ===
          "top"
        ) {
          event.preventDefault();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }
      }
    );
  }

  /* ==========================================================
     GLOBAL ERROR HANDLING
     ========================================================== */

  function initErrorHandling() {
    window.addEventListener(
      "error",
      (event) => {
        console.error(
          "[Tajik Opportunities]",
          event.error ||
            event.message
        );
      }
    );

    window.addEventListener(
      "unhandledrejection",
      (event) => {
        console.error(
          "[Tajik Opportunities]",
          event.reason
        );
      }
    );
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  function exposeGlobalAPI() {
    window.TajikOpportunities = {
      version: TO.version,

      $,
      $$,

      escapeHTML,
      truncate,

      formatNumber,
      formatDate,
      formatDateTime,

      isValidURL,
      debounce,

      apiRequest,
      getJSON,
      postJSON,

      openModal,
      closeModal,
      closeAllModals,

      showToast,
      showSuccess,
      showError,
      showInfo,
      showWarning,

      copyText,
      shareURL,

      toggleFavorite,
      reactToPublication,
      registerView,

      loadComments,
      reportPublication,

      showLoading,
      showEmpty,
      showErrorState,

      getFormDataObject,

      setLoading,

      getURLParameter,
      setURLParameter,

      detectMediaType,

      showElement,
      hideElement
    };
  }

  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  function init() {
    initMobileMenu();
    initEscapeKey();
    initModals();

    initCopyButtons();
    initShareButtons();

    initExternalLinks();
    initImageFallbacks();
    initLazyImages();

    initCurrentYear();
    initActiveNavigation();

    initSearch();

    initNumberInputs();
    initTextareas();
    initCharacterCounters();

    initFavoriteButtons();
    initReactionButtons();

    initConnectionStatus();
    initFormProtection();

    initBackToTop();
    initScrollReveal();

    initLanguageSelector();

    initKeyboardAccessibility();
    initGlobalActions();

    initErrorHandling();

    exposeGlobalAPI();

    document.documentElement.classList.add(
      "js-ready"
    );

    window.dispatchEvent(
      new CustomEvent(
        "to:ready"
      )
    );

    console.log(
      `%c${TO.name} v${TO.version}`,
      "font-weight:bold",
      "Frontend initialized"
    );
  }

  /* ==========================================================
     START
     ========================================================== */

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
