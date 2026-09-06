(() => {
  "use strict";

  const API = "/api";

  const SITE = {
    name: "Tajik Opportunities",
    username: "@tajikopportunities"
  };

  const state = {
    user: null,
    notifications: [],
    notificationCount: 0,
    initialized: false
  };

  /* =========================================================
     BASIC HELPERS
  ========================================================= */

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

  function formatNumber(value) {
    return new Intl.NumberFormat("ru-RU").format(
      Number(value || 0)
    );
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
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

  function debounce(fn, delay = 350) {
    let timer;

    return (...args) => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
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

  /* =========================================================
     API
  ========================================================= */

  async function request(
    endpoint,
    options = {}
  ) {
    const config = {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body !== undefined
          ? {
              "Content-Type":
                "application/json"
            }
          : {}),
        ...(options.headers || {})
      }
    };

    const response = await fetch(
      `${API}${endpoint}`,
      config
    );

    const type =
      response.headers.get("content-type") || "";

    let data;

    if (type.includes("application/json")) {
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
  }

  async function get(endpoint) {
    return request(endpoint, {
      method: "GET"
    });
  }

  async function post(endpoint, body = {}) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  async function put(endpoint, body = {}) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  }

  async function patch(endpoint, body = {}) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }

  async function del(endpoint) {
    return request(endpoint, {
      method: "DELETE"
    });
  }

  /* =========================================================
     TOAST
  ========================================================= */

  function toast(message, type = "info") {
    let container = $(".toast-container");

    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const item = document.createElement("div");

    item.className = `toast ${type}`;
    item.textContent = message || "";

    container.appendChild(item);

    requestAnimationFrame(() => {
      item.classList.add("show");
    });

    setTimeout(() => {
      item.classList.remove("show");

      setTimeout(() => {
        item.remove();

        if (!container.children.length) {
          container.remove();
        }
      }, 250);
    }, 3500);

    return item;
  }

  const showSuccess = (message) =>
    toast(message, "success");

  const showError = (message) =>
    toast(message, "error");

  const showInfo = (message) =>
    toast(message, "info");

  const showWarning = (message) =>
    toast(message, "warning");

  /* =========================================================
     CLIPBOARD
  ========================================================= */

  async function copyText(text) {
    if (!text) {
      showError("Нечего копировать");
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea =
          document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        textarea.remove();
      }

      showSuccess("Скопировано");

      return true;
    } catch {
      showError("Не удалось скопировать");

      return false;
    }
  }

  /* =========================================================
     SHARE
  ========================================================= */

  async function share(
    url = location.href,
    title = SITE.name,
    text = ""
  ) {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url
        });

        return true;
      }

      return await copyText(url);
    } catch (error) {
      if (error?.name === "AbortError") {
        return false;
      }

      return false;
    }
  }

  /* =========================================================
     CURRENT USER
  ========================================================= */

  async function loadCurrentUser() {
    try {
      const result = await get("/auth/me");

      state.user =
        result?.user ||
        result?.data ||
        null;

      updateUserInterface();

      return state.user;
    } catch {
      state.user = null;

      updateUserInterface();

      return null;
    }
  }

  /* =========================================================
     USER INTERFACE
  ========================================================= */

  function updateUserInterface() {
    const user = state.user;

    const profileText =
      $("#headerProfileText");

    const avatar =
      $("#headerAvatar");

    if (profileText) {
      if (user) {
        profileText.textContent =
          user.username
            ? `@${String(
                user.username
              ).replace(/^@/, "")}`
            : user.name ||
              "Профиль";
      } else {
        profileText.textContent =
          "Войти";
      }
    }

    if (avatar) {
      if (user?.avatar_url) {
        avatar.innerHTML = `
          <img
            src="${escapeHTML(
              user.avatar_url
            )}"
            alt=""
          >
        `;
      } else {
        avatar.textContent = "👤";
      }
    }

    $$("[data-user-name]").forEach(
      element => {
        element.textContent =
          user?.name || "";
      }
    );

    $$("[data-username]").forEach(
      element => {
        element.textContent =
          user?.username
            ? `@${String(
                user.username
              ).replace(/^@/, "")}`
            : "";
      }
    );

    $$("[data-auth-only]").forEach(
      element => {
        element.classList.toggle(
          "hidden",
          !user
        );
      }
    );

    $$("[data-guest-only]").forEach(
      element => {
        element.classList.toggle(
          "hidden",
          Boolean(user)
        );
      }
    );
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  async function login(
    username,
    password
  ) {
    try {
      const result = await post(
        "/auth/login",
        {
          username,
          password
        }
      );

      state.user =
        result?.user ||
        null;

      updateUserInterface();

      showSuccess("Вы вошли в аккаунт");

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось войти"
      );

      throw error;
    }
  }

  /* =========================================================
     REGISTER
  ========================================================= */

  async function register(data) {
    try {
      const result = await post(
        "/auth/register",
        data
      );

      state.user =
        result?.user ||
        null;

      updateUserInterface();

      showSuccess(
        "Аккаунт успешно создан"
      );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось создать аккаунт"
      );

      throw error;
    }
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function logout() {
    try {
      await post("/auth/logout", {});
    } catch {
      // Session may already be expired.
    }

    state.user = null;

    updateUserInterface();

    showSuccess("Вы вышли из аккаунта");

    setTimeout(() => {
      if (
        location.pathname !==
        "/"
      ) {
        location.href = "/";
      }
    }, 500);
  }

  /* =========================================================
     USERNAME
  ========================================================= */

  async function checkUsername(
    username
  ) {
    if (!username) {
      return {
        available: false
      };
    }

    try {
      return await get(
        `/auth/username?username=${encodeURIComponent(
          username
        )}`
      );
    } catch {
      return {
        available: false
      };
    }
  }

  function initUsernameChecker() {
    const inputs = $$(
      "[data-username-check]"
    );

    inputs.forEach(input => {
      const result =
        input.parentElement?.querySelector(
          "[data-username-result]"
        );

      const check = debounce(
        async () => {
          const username =
            input.value.trim();

          if (!username) {
            if (result) {
              result.textContent = "";
            }

            return;
          }

          if (result) {
            result.textContent =
              "Проверяем...";
          }

          const response =
            await checkUsername(
              username
            );

          if (!result) return;

          if (
            response?.available
          ) {
            result.textContent =
              "✅ свободен";

            result.className =
              "username-result available";
          } else {
            result.textContent =
              "❌ уже занят";

            result.className =
              "username-result unavailable";
          }
        },
        450
      );

      input.addEventListener(
        "input",
        check
      );
    });
  }

  /* =========================================================
     PROFILE
  ========================================================= */

  async function getProfile(username) {
    const query = username
      ? `?username=${encodeURIComponent(
          username
        )}`
      : "";

    return get(`/profile${query}`);
  }

  async function updateProfile(data) {
    try {
      const result =
        await patch(
          "/profile",
          data
        );

      state.user =
        result?.user ||
        result?.data ||
        state.user;

      updateUserInterface();

      showSuccess(
        "Профиль обновлён"
      );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось обновить профиль"
      );

      throw error;
    }
  }

  /* =========================================================
     PUBLICATIONS
  ========================================================= */

  async function getPublications(
    params = {}
  ) {
    const query =
      new URLSearchParams();

    Object.entries(params).forEach(
      ([key, value]) => {
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
      }
    );

    const suffix =
      query.toString()
        ? `?${query.toString()}`
        : "";

    return get(
      `/publications${suffix}`
    );
  }

  async function getPublication(
    id
  ) {
    return get(
      `/publications/${encodeURIComponent(
        id
      )}`
    );
  }

  async function createPublication(
    data
  ) {
    try {
      const result =
        await post(
          "/publications",
          data
        );

      showSuccess(
        "Публикация отправлена на модерацию"
      );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось создать публикацию"
      );

      throw error;
    }
  }

  /* =========================================================
     REACTIONS
  ========================================================= */

  async function react(
    publicationId,
    reaction = "like"
  ) {
    try {
      const result =
        await post(
          `/publications/${encodeURIComponent(
            publicationId
          )}/react`,
          {
            reaction
          }
        );

      updateReactionButtons(
        publicationId,
        result
      );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось поставить реакцию"
      );

      return null;
    }
  }

  function updateReactionButtons(
    publicationId,
    result
  ) {
    $$(
      `[data-reaction-publication="${publicationId}"]`
    ).forEach(button => {
      const reaction =
        button.getAttribute(
          "data-reaction"
        );

      button.classList.toggle(
        "active",
        Boolean(
          result?.reaction ===
            reaction ||
          result?.current_reaction ===
            reaction
        )
      );

      const count =
        result?.counts?.[reaction];

      const counter =
        button.querySelector(
          "[data-reaction-count]"
        );

      if (
        counter &&
        count !== undefined
      ) {
        counter.textContent =
          formatNumber(count);
      }
    });
  }

  /* =========================================================
     SAVE
  ========================================================= */

  async function toggleSave(
    publicationId
  ) {
    try {
      const result =
        await post(
          `/publications/${encodeURIComponent(
            publicationId
          )}/favorite`,
          {}
        );

      $$(
        `[data-save="${publicationId}"]`
      ).forEach(button => {
        button.classList.toggle(
          "active",
          Boolean(
            result?.saved
          )
        );

        const counter =
          button.querySelector(
            "[data-save-count]"
          );

        if (
          counter &&
          result?.saves !== undefined
        ) {
          counter.textContent =
            formatNumber(
              result.saves
            );
        }
      });

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось сохранить публикацию"
      );

      return null;
    }
  }

  /* =========================================================
     VIEWS
  ========================================================= */

  async function addView(
    publicationId
  ) {
    try {
      return await post(
        `/publications/${encodeURIComponent(
          publicationId
        )}/view`,
        {}
      );
    } catch {
      return null;
    }
  }

  /* =========================================================
     COMMENTS
  ========================================================= */

  async function getComments(
    publicationId
  ) {
    try {
      return await get(
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

  async function addComment(
    publicationId,
    text,
    parentId = null
  ) {
    if (!text?.trim()) {
      showError(
        "Введите комментарий"
      );

      return null;
    }

    try {
      const result =
        await post(
          `/publications/${encodeURIComponent(
            publicationId
          )}/comments`,
          {
            text: text.trim(),
            parent_id: parentId
          }
        );

      showSuccess(
        "Комментарий добавлен"
      );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось добавить комментарий"
      );

      return null;
    }
  }

  /* =========================================================
     FOLLOW
  ========================================================= */

  async function toggleFollow(
    username
  ) {
    try {
      return await post(
        "/follows/toggle",
        {
          username
        }
      );
    } catch (error) {
      showError(
        error.message ||
          "Не удалось изменить подписку"
      );

      return null;
    }
  }

  /* =========================================================
     REPORT
  ========================================================= */

  async function report(
    publicationId,
    reason,
    details = ""
  ) {
    try {
      const result =
        await post(
          "/reports",
          {
            publication_id:
              publicationId,
            reason,
            details
          }
        );

      showSuccess(
        "Жалоба отправлена"
      );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось отправить жалобу"
      );

      return null;
    }
  }

  /* =========================================================
     MESSAGES
  ========================================================= */

  async function getChats() {
    try {
      return await get(
        "/messages/chats"
      );
    } catch (error) {
      showError(
        error.message ||
          "Не удалось загрузить чаты"
      );

      return null;
    }
  }

  async function getMessages(
    userId
  ) {
    try {
      return await get(
        `/messages/${encodeURIComponent(
          userId
        )}`
      );
    } catch (error) {
      showError(
        error.message ||
          "Не удалось загрузить сообщения"
      );

      return null;
    }
  }

  async function sendMessage(
    userId,
    text,
    publicationId = null
  ) {
    if (!text?.trim()) {
      return null;
    }

    try {
      const result =
        await post(
          "/messages/send",
          {
            user_id: userId,
            text: text.trim(),
            publication_id:
              publicationId
          }
        );

      return result;
    } catch (error) {
      showError(
        error.message ||
          "Не удалось отправить сообщение"
      );

      return null;
    }
  }

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  async function loadNotifications() {
    try {
      const result =
        await get(
          "/notifications"
        );

      state.notifications =
        result?.notifications ||
        result?.items ||
        [];

      state.notificationCount =
        result?.unread_count ||
        result?.unread ||
        state.notifications.filter(
          item =>
            !item.read &&
            !item.is_read
        ).length;

      updateNotificationUI();

      return result;
    } catch {
      state.notifications = [];
      state.notificationCount = 0;

      updateNotificationUI();

      return null;
    }
  }

  function updateNotificationUI() {
    const badge =
      $("#notificationBadge");

    if (badge) {
      badge.textContent =
        formatNumber(
          state.notificationCount
        );

      badge.classList.toggle(
        "hidden",
        !state.notificationCount
      );
    }
  }

  async function markNotificationRead(
    id
  ) {
    try {
      const result =
        await post(
          `/notifications/${encodeURIComponent(
            id
          )}/read`,
          {}
        );

      await loadNotifications();

      return result;
    } catch {
      return null;
    }
  }

  /* =========================================================
     NOTIFICATION PANEL
  ========================================================= */

  function renderNotifications() {
    const list =
      $("#notificationList");

    if (!list) return;

    if (!state.notifications.length) {
      list.innerHTML = `
        <div class="notification-empty">
          Пока нет уведомлений.
        </div>
      `;

      return;
    }

    list.innerHTML =
      state.notifications
        .map(item => {
          const id =
            item.id ?? "";

          const title =
            item.title ||
            item.type ||
            "Уведомление";

          const text =
            item.message ||
            item.text ||
            "";

          const date =
            item.created_at
              ? formatDateTime(
                  item.created_at
                )
              : "";

          const unread =
            !item.read &&
            !item.is_read;

          return `
            <button
              type="button"
              class="notification-item ${
                unread
                  ? "unread"
                  : ""
              }"
              data-notification-id="${escapeHTML(
                id
              )}"
            >
              <strong>
                ${escapeHTML(title)}
              </strong>

              <span>
                ${escapeHTML(text)}
              </span>

              ${
                date
                  ? `<small>${escapeHTML(
                      date
                    )}</small>`
                  : ""
              }
            </button>
          `;
        })
        .join("");

    $$(
      "[data-notification-id]",
      list
    ).forEach(button => {
      button.addEventListener(
        "click",
        async () => {
          const id =
            button.getAttribute(
              "data-notification-id"
            );

          if (id) {
            await markNotificationRead(
              id
            );
          }
        }
      );
    });
  }

  function initNotifications() {
    const open =
      $("#notificationsButton");

    const panel =
      $("#notificationPanel");

    const close =
      $("#closeNotifications");

    if (!open || !panel) {
      return;
    }

    open.addEventListener(
      "click",
      async event => {
        event.preventDefault();

        panel.classList.toggle(
          "hidden"
        );

        if (
          !panel.classList.contains(
            "hidden"
          )
        ) {
          await loadNotifications();
          renderNotifications();
        }
      }
    );

    close?.addEventListener(
      "click",
      () => {
        panel.classList.add(
          "hidden"
        );
      }
    );

    document.addEventListener(
      "click",
      event => {
        if (
          panel.classList.contains(
            "hidden"
          )
        ) {
          return;
        }

        if (
          panel.contains(
            event.target
          ) ||
          open.contains(
            event.target
          )
        ) {
          return;
        }

        panel.classList.add(
          "hidden"
        );
      }
    );
  }

  /* =========================================================
     CATEGORY FILTERS
  ========================================================= */

  function initCategoryFilters() {
    $$(
      "[data-category]"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const category =
            button.getAttribute(
              "data-category"
            );

          if (!category) return;

          $$(
            "[data-category]"
          ).forEach(item => {
            item.classList.toggle(
              "active",
              item === button
            );
          });

          window.dispatchEvent(
            new CustomEvent(
              "to:category-change",
              {
                detail: {
                  category
                }
              }
            )
          );
        }
      );
    });
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  function initSearch() {
    const input =
      $("#searchInput");

    if (!input) return;

    const clear =
      $("#clearSearch");

    const update =
      debounce(() => {
        const query =
          input.value.trim();

        clear?.classList.toggle(
          "hidden",
          !query
        );

        window.dispatchEvent(
          new CustomEvent(
            "to:search",
            {
              detail: {
                query
              }
            }
          )
        );
      },
      400);

    input.addEventListener(
      "input",
      update
    );

    clear?.addEventListener(
      "click",
      () => {
        input.value = "";
        clear.classList.add(
          "hidden"
        );

        window.dispatchEvent(
          new CustomEvent(
            "to:search",
            {
              detail: {
                query: ""
              }
            }
          )
        );
      }
    );
  }

  /* =========================================================
     FILTERS
  ========================================================= */

  function initFilters() {
    const ids = [
      "countryFilter",
      "cityFilter",
      "scopeFilter",
      "sortSelect"
    ];

    ids.forEach(id => {
      const element =
        document.getElementById(id);

      if (!element) return;

      element.addEventListener(
        "change",
        () => {
          window.dispatchEvent(
            new CustomEvent(
              "to:filters-change"
            )
          );
        }
      );

      element.addEventListener(
        "input",
        debounce(() => {
          window.dispatchEvent(
            new CustomEvent(
              "to:filters-change"
            )
          );
        }, 400)
      );
    });
  }

  function getFilters() {
    const category =
      $(
        ".category-card.active[data-category], .category-chip.active[data-category]"
      )?.getAttribute(
        "data-category"
      ) || "all";

    return {
      search:
        $("#searchInput")?.value
          .trim() || "",

      country:
        $("#countryFilter")?.value
          .trim() || "",

      city:
        $("#cityFilter")?.value
          .trim() || "",

      scope:
        $("#scopeFilter")?.value ||
        "",

      sort:
        $("#sortSelect")?.value ||
        "newest",

      category:
        category === "all"
          ? ""
          : category
    };
  }

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {
    const ids = [
      "searchInput",
      "countryFilter",
      "cityFilter"
    ];

    ids.forEach(id => {
      const element =
        document.getElementById(id);

      if (element) {
        element.value = "";
      }
    });

    const scope =
      $("#scopeFilter");

    if (scope) {
      scope.value = "";
    }

    const sort =
      $("#sortSelect");

    if (sort) {
      sort.value = "newest";
    }

    $$(
      "[data-category]"
    ).forEach(
      button => {
        button.classList.toggle(
          "active",
          button.getAttribute(
            "data-category"
          ) === "all"
        );
      }
    );

    window.dispatchEvent(
      new CustomEvent(
        "to:filters-change"
      )
    );
  }

  function initResetFilters() {
    [
      "#resetFilters",
      "#emptyReset"
    ].forEach(selector => {
      $(selector)?.addEventListener(
        "click",
        resetFilters
      );
    });
  }

  /* =========================================================
     GLOBAL BUTTONS
  ========================================================= */

  function initGlobalButtons() {
    document.addEventListener(
      "click",
      async event => {
        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) return;

        const action =
          button.getAttribute(
            "data-action"
          );

        if (
          action ===
          "logout"
        ) {
          event.preventDefault();

          await logout();

          return;
        }

        if (
          action ===
          "copy-link"
        ) {
          event.preventDefault();

          await copyText(
            button.getAttribute(
              "data-url"
            ) ||
              location.href
          );

          return;
        }

        if (
          action ===
          "share"
        ) {
          event.preventDefault();

          await share(
            button.getAttribute(
              "data-url"
            ) ||
              location.href,
            button.getAttribute(
              "data-title"
            ) ||
              document.title,
            button.getAttribute(
              "data-text"
            ) ||
              ""
          );

          return;
        }

        if (
          action ===
          "save"
        ) {
          event.preventDefault();

          const id =
            button.getAttribute(
              "data-publication-id"
            );

          if (id) {
            await toggleSave(id);
          }

          return;
        }

        if (
          action ===
          "reaction"
        ) {
          event.preventDefault();

          const id =
            button.getAttribute(
              "data-publication-id"
            );

          const reaction =
            button.getAttribute(
              "data-reaction"
            ) ||
            "like";

          if (id) {
            await react(
              id,
              reaction
            );
          }

          return;
        }
      }
    );
  }

  /* =========================================================
     FORMS
  ========================================================= */

  function initAuthForms() {
    const loginForm =
      $("#loginForm");

    if (loginForm) {
      loginForm.addEventListener(
        "submit",
        async event => {
          event.preventDefault();

          const username =
            loginForm.elements
              .username?.value
              ?.trim();

          const password =
            loginForm.elements
              .password?.value || "";

          if (!username) {
            showError(
              "Введите username"
            );

            return;
          }

          if (!password) {
            showError(
              "Введите пароль"
            );

            return;
          }

          const button =
            loginForm.querySelector(
              "[type='submit']"
            );

          if (button) {
            button.disabled = true;
          }

          try {
            await login(
              username,
              password
            );

            setTimeout(() => {
              location.href =
                "/";
            }, 500);
          } finally {
            if (button) {
              button.disabled = false;
            }
          }
        }
      );
    }

    const registerForm =
      $("#registerForm");

    if (registerForm) {
      registerForm.addEventListener(
        "submit",
        async event => {
          event.preventDefault();

          const data = {
            name:
              registerForm.elements
                .name?.value
                ?.trim(),

            username:
              registerForm.elements
                .username?.value
                ?.trim(),

            password:
              registerForm.elements
                .password?.value || ""
          };

          if (!data.name) {
            showError(
              "Введите имя"
            );

            return;
          }

          if (!data.username) {
            showError(
              "Введите username"
            );

            return;
          }

          if (
            data.password.length <
            6
          ) {
            showError(
              "Пароль должен содержать минимум 6 символов"
            );

            return;
          }

          const button =
            registerForm.querySelector(
              "[type='submit']"
            );

          if (button) {
            button.disabled = true;
          }

          try {
            await register(
              data
            );

            setTimeout(() => {
              location.href =
                "/";
            }, 500);
          } finally {
            if (button) {
              button.disabled = false;
            }
          }
        }
      );
    }
  }

  /* =========================================================
     PUBLICATION FORM
  ========================================================= */

  function initPublicationForm() {
    const form =
      $("#publicationForm");

    if (!form) return;

    form.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        const data =
          Object.fromEntries(
            new FormData(form)
          );

        const media =
          $$(
            "[data-media-url]",
            form
          )
            .map(input =>
              input.value.trim()
            )
            .filter(Boolean);

        if (media.length) {
          data.media = media;
        }

        const button =
          form.querySelector(
            "[type='submit']"
          );

        if (button) {
          button.disabled = true;
        }

        try {
          await createPublication(
            data
          );

          form.reset();

          setTimeout(() => {
            if (
              location.pathname ===
              "/add.html"
            ) {
              location.href =
                "/";
            }
          }, 800);
        } finally {
          if (button) {
            button.disabled = false;
          }
        }
      }
    );
  }

  /* =========================================================
     MEDIA URL ADDER
  ========================================================= */

  function initMediaFields() {
    $$(
      "[data-add-media]"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const container =
            $(
              button.getAttribute(
                "data-add-media"
              )
            );

          if (!container) return;

          const wrapper =
            document.createElement(
              "div"
            );

          wrapper.className =
            "media-url-row";

          wrapper.innerHTML = `
            <input
              type="url"
              data-media-url
              placeholder="https://example.com/file"
            >

            <button
              type="button"
              data-remove-media
            >
              ×
            </button>
          `;

          container.appendChild(
            wrapper
          );

          wrapper
            .querySelector(
              "[data-remove-media]"
            )
            .addEventListener(
              "click",
              () => {
                wrapper.remove();
              }
            );
        }
      );
    });
  }

  /* =========================================================
     TEXTAREA
  ========================================================= */

  function initTextareas() {
    $$("textarea").forEach(
      textarea => {
        const resize =
          () => {
            textarea.style.height =
              "auto";

            textarea.style.height =
              `${textarea.scrollHeight}px`;
          };

        textarea.addEventListener(
          "input",
          resize
        );

        resize();
      }
    );
  }

  /* =========================================================
     CHARACTER COUNTERS
  ========================================================= */

  function initCounters() {
    $$(
      "[data-counter-for]"
    ).forEach(counter => {
      const target =
        document.getElementById(
          counter.getAttribute(
            "data-counter-for"
          )
        );

      if (!target) return;

      const update =
        () => {
          counter.textContent =
            formatNumber(
              target.value.length
            );
        };

      target.addEventListener(
        "input",
        update
      );

      update();
    });
  }

  /* =========================================================
     EXTERNAL LINKS
  ========================================================= */

  function initExternalLinks() {
    $$("a[href]").forEach(
      link => {
        const href =
          link.getAttribute(
            "href"
          );

        if (!href) return;

        try {
          const url =
            new URL(
              href,
              location.href
            );

          if (
            url.origin !==
            location.origin
          ) {
            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";
          }
        } catch {
          // Ignore invalid links.
        }
      }
    );
  }

  /* =========================================================
     IMAGE FALLBACK
  ========================================================= */

  function initImages() {
    $$("img").forEach(
      image => {
        image.addEventListener(
          "error",
          () => {
            image.classList.add(
              "image-error"
            );
          },
          {
            once: true
          }
        );
      }
    );
  }

  /* =========================================================
     MOBILE MENU
  ========================================================= */

  function initMobileMenu() {
    const button =
      $(".mobile-menu-button");

    const nav =
      $(".site-nav");

    if (!button || !nav) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        const open =
          nav.classList.toggle(
            "open"
          );

        button.setAttribute(
          "aria-expanded",
          String(open)
        );
      }
    );

    $$("a", nav).forEach(
      link => {
        link.addEventListener(
          "click",
          () => {
            nav.classList.remove(
              "open"
            );

            button.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        );
      }
    );
  }

  /* =========================================================
     MODALS
  ========================================================= */

  function initModals() {
    $$(
      "[data-modal-open]"
    ).forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.preventDefault();

          const id =
            button.getAttribute(
              "data-modal-open"
            );

          const modal =
            document.getElementById(
              id
            );

          if (modal) {
            modal.classList.add(
              "show"
            );

            document.body.classList.add(
              "no-scroll"
            );
          }
        }
      );
    });

    $$(
      "[data-modal-close]"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const modal =
            button.closest(
              ".modal"
            );

          modal?.classList.remove(
            "show"
          );

          if (
            !$(".modal.show")
          ) {
            document.body.classList.remove(
              "no-scroll"
            );
          }
        }
      );
    });
  }

  /* =========================================================
     CURRENT YEAR
  ========================================================= */

  function initYear() {
    const year =
      new Date().getFullYear();

    $$(
      "#currentYear, [data-current-year]"
    ).forEach(
      element => {
        element.textContent =
          year;
      }
    );
  }

  /* =========================================================
     ONLINE STATUS
  ========================================================= */

  function updateOnlineStatus() {
    $$(
      "[data-connection-status]"
    ).forEach(
      element => {
        element.textContent =
          navigator.onLine
            ? "Онлайн"
            : "Нет подключения";

        element.classList.toggle(
          "offline",
          !navigator.onLine
        );
      }
    );
  }

  /* =========================================================
     ESCAPE
  ========================================================= */

  function initEscape() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key !==
          "Escape"
        ) {
          return;
        }

        $$(".modal.show").forEach(
          modal => {
            modal.classList.remove(
              "show"
            );
          }
        );

        $(
          "#notificationPanel"
        )?.classList.add(
          "hidden"
        );

        document.body.classList.remove(
          "no-scroll"
        );
      }
    );
  }

  /* =========================================================
     GLOBAL API
  ========================================================= */

  window.TajikOpportunities = {
    site: SITE,
    state,

    $,
    $$,

    escapeHTML,
    formatNumber,
    formatDate,
    formatDateTime,
    debounce,
    isValidURL,

    request,
    get,
    post,
    put,
    patch,
    del,

    toast,
    showSuccess,
    showError,
    showInfo,
    showWarning,

    copyText,
    share,

    login,
    register,
    logout,

    loadCurrentUser,
    getProfile,
    updateProfile,
    checkUsername,

    getPublications,
    getPublication,
    createPublication,

    react,
    toggleSave,
    addView,

    getComments,
    addComment,

    toggleFollow,
    report,

    getChats,
    getMessages,
    sendMessage,

    loadNotifications,
    markNotificationRead,

    getFilters,
    resetFilters
  };

  /* =========================================================
     INIT
  ========================================================= */

  async function init() {
    if (state.initialized) {
      return;
    }

    state.initialized = true;

    initNotifications();
    initCategoryFilters();
    initSearch();
    initFilters();
    initResetFilters();

    initGlobalButtons();

    initAuthForms();
    initPublicationForm();
    initMediaFields();

    initUsernameChecker();

    initTextareas();
    initCounters();

    initExternalLinks();
    initImages();

    initMobileMenu();
    initModals();

    initYear();
    initEscape();

    window.addEventListener(
      "online",
      updateOnlineStatus
    );

    window.addEventListener(
      "offline",
      updateOnlineStatus
    );

    updateOnlineStatus();

    await loadCurrentUser();

    if (state.user) {
      await loadNotifications();
    }

    document.documentElement.classList.add(
      "js-ready"
    );

    window.dispatchEvent(
      new CustomEvent(
        "to:ready",
        {
          detail: {
            user: state.user
          }
        }
      )
    );
  }

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
