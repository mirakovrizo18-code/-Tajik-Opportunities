 /* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   SUPER SEARCH SYSTEM
   File: public/js/search.js
   Version: 2026.09.09 POWER SEARCH

   • Публичный поиск
   • Поиск публикаций
   • Поиск участников
   • Поиск комментариев
   • Поиск отзывов
   • Поиск категорий
   • Поиск возможностей
   • Поиск компаний
   • Поиск сохранённых
   • Поиск по чатам
   • Административный Super Search
   • Username / name / ID
   • Технические идентификаторы
   • Фильтры
   • Сортировка
   • История поиска
   • Быстрый переход
   • Debounce
   • Pagination
   • Безопасный HTML
   • Поддержка огромных чисел
   ============================================================ */

(() => {
  "use strict";

  const CONFIG = {
    API: {
      SEARCH: "/api/search",
      PUBLICATIONS: "/api/search/publications",
      PARTICIPANTS: "/api/search/participants",
      COMMENTS: "/api/search/comments",
      REVIEWS: "/api/search/reviews",
      CATEGORIES: "/api/search/categories",
      OPPORTUNITIES: "/api/search/opportunities",
      COMPANIES: "/api/search/companies",
      SAVED: "/api/search/saved",
      CHATS: "/api/search/chats",
      HISTORY: "/api/search/history"
    },

    STORAGE: {
      HISTORY: "to_search_history",
      LAST_QUERY: "to_search_last_query",
      LAST_TYPE: "to_search_last_type"
    },

    TYPES: {
      ALL: "all",
      PUBLICATIONS: "publications",
      PARTICIPANTS: "participants",
      COMMENTS: "comments",
      REVIEWS: "reviews",
      CATEGORIES: "categories",
      OPPORTUNITIES: "opportunities",
      COMPANIES: "companies",
      SAVED: "saved",
      CHATS: "chats"
    },

    SORTS: [
      "relevance",
      "newest",
      "oldest",
      "popular",
      "updated"
    ],

    DEFAULT_PAGE_SIZE: 20,
    MAX_HISTORY: 50,
    DEBOUNCE: 350
  };

  const state = {
    initialized: false,

    mode: "participant",

    query: "",

    type: CONFIG.TYPES.ALL,

    category: "",

    status: "",

    city: "",

    country: "",

    language: "",

    level: "",

    service: "",

    publicationType: "",

    employmentType: "",

    sort: "relevance",

    dateFrom: "",

    dateTo: "",

    minRating: "",

    maxRating: "",

    verifiedOnly: false,

    hasMedia: false,

    hasComments: false,

    hasReviews: false,

    savedOnly: false,

    page: 1,

    pageSize:
      CONFIG.DEFAULT_PAGE_SIZE,

    total: 0,

    pages: 0,

    results: [],

    history: [],

    loading: false,

    loadingMore: false,

    error: null,

    selectedResult: null,

    suggestions: [],

    suggestionsLoading: false,

    searchTimer: null,

    abortController: null
  };

  /* ==========================================================
     HELPERS
     ========================================================== */

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

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return [
      ...root.querySelectorAll(selector)
    ];
  }

  function dispatch(name, detail = {}) {
    document.dispatchEvent(
      new CustomEvent(name, {
        detail
      })
    );
  }

  function getRoot() {
    return qs([
      "#search",
      "#search-page",
      "#search-container",
      "[data-search]",
      ".search-page"
    ].join(","));
  }

  function isAdmin() {
    return (
      state.mode === "admin"
    );
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function formatNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0";
    }

    const stringValue =
      String(value);

    if (
      /^\d+$/.test(stringValue)
    ) {
      if (
        stringValue.length > 15
      ) {
        return `${stringValue.slice(
          0,
          6
        )}…`;
      }

      return Number(
        stringValue
      ).toLocaleString("ru-RU");
    }

    return escapeHtml(
      stringValue
    );
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return escapeHtml(
        value
      );
    }

    return date.toLocaleString(
      "ru-RU",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  }

  function getObjectId(item) {
    return (
      item?.id ||
      item?.public_id ||
      item?.publication_id ||
      item?.user_id ||
      item?.profile_id ||
      item?.comment_id ||
      item?.review_id ||
      ""
    );
  }

  function getTitle(item) {
    return (
      item?.title ||
      item?.name ||
      item?.display_name ||
      item?.username ||
      item?.author_name ||
      item?.text ||
      "Без названия"
    );
  }

  function getDescription(item) {
    return (
      item?.description ||
      item?.excerpt ||
      item?.body ||
      item?.text ||
      ""
    );
  }

  function getImage(item) {
    return (
      item?.avatar_url ||
      item?.image_url ||
      item?.cover_url ||
      item?.thumbnail_url ||
      item?.media_url ||
      ""
    );
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
          credentials:
            "include",
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
     QUERY
     ========================================================== */

  function buildParams(
    extra = {}
  ) {
    const params =
      new URLSearchParams();

    if (state.query) {
      params.set(
        "q",
        state.query
      );
    }

    params.set(
      "type",
      state.type
    );

    params.set(
      "page",
      String(state.page)
    );

    params.set(
      "page_size",
      String(state.pageSize)
    );

    params.set(
      "sort",
      state.sort
    );

    const filters = {
      category:
        state.category,
      status:
        state.status,
      city:
        state.city,
      country:
        state.country,
      language:
        state.language,
      level:
        state.level,
      service:
        state.service,
      publication_type:
        state.publicationType,
      employment_type:
        state.employmentType,
      date_from:
        state.dateFrom,
      date_to:
        state.dateTo,
      min_rating:
        state.minRating,
      max_rating:
        state.maxRating
    };

    Object.entries(
      filters
    ).forEach(
      ([key, value]) => {
        if (
          value !== "" &&
          value !== null &&
          value !== undefined
        ) {
          params.set(
            key,
            String(value)
          );
        }
      }
    );

    if (
      state.verifiedOnly
    ) {
      params.set(
        "verified",
        "1"
      );
    }

    if (
      state.hasMedia
    ) {
      params.set(
        "has_media",
        "1"
      );
    }

    if (
      state.hasComments
    ) {
      params.set(
        "has_comments",
        "1"
      );
    }

    if (
      state.hasReviews
    ) {
      params.set(
        "has_reviews",
        "1"
      );
    }

    if (
      state.savedOnly
    ) {
      params.set(
        "saved_only",
        "1"
      );
    }

    Object.entries(
      extra
    ).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          params.set(
            key,
            String(value)
          );
        }
      }
    );

    return params;
  }

  function getSearchEndpoint() {
    switch (
      state.type
    ) {
      case CONFIG.TYPES.PUBLICATIONS:
        return CONFIG.API.PUBLICATIONS;

      case CONFIG.TYPES.PARTICIPANTS:
        return CONFIG.API.PARTICIPANTS;

      case CONFIG.TYPES.COMMENTS:
        return CONFIG.API.COMMENTS;

      case CONFIG.TYPES.REVIEWS:
        return CONFIG.API.REVIEWS;

      case CONFIG.TYPES.CATEGORIES:
        return CONFIG.API.CATEGORIES;

      case CONFIG.TYPES.OPPORTUNITIES:
        return CONFIG.API.OPPORTUNITIES;

      case CONFIG.TYPES.COMPANIES:
        return CONFIG.API.COMPANIES;

      case CONFIG.TYPES.SAVED:
        return CONFIG.API.SAVED;

      case CONFIG.TYPES.CHATS:
        return CONFIG.API.CHATS;

      default:
        return CONFIG.API.SEARCH;
    }
  }

  /* ==========================================================
     SEARCH
     ========================================================== */

  async function search(
    options = {}
  ) {
    if (
      state.loading &&
      !options.force
    ) {
      return;
    }

    if (
      state.abortController
    ) {
      state.abortController.abort();
    }

    state.abortController =
      new AbortController();

    state.loading = true;
    state.error = null;

    if (
      !options.append
    ) {
      state.page = 1;
      state.results = [];
    }

    renderLoading();

    try {
      const params =
        buildParams();

      const data =
        await request(
          `${getSearchEndpoint()}?${params.toString()}`,
          {
            signal:
              state.abortController
                .signal
          }
        );

      const items =
        data?.results ??
        data?.items ??
        data?.publications ??
        data?.participants ??
        data?.data ??
        [];

      if (
        options.append
      ) {
        state.results =
          state.results.concat(
            items
          );
      } else {
        state.results =
          items;
      }

      state.total =
        Number(
          data?.total ??
          data?.pagination?.total ??
          state.results.length
        );

      state.pages =
        Number(
          data?.pages ??
          data?.pagination?.pages ??
          Math.ceil(
            state.total /
              state.pageSize
          )
        );

      saveLastSearch();
      addToHistory(
        state.query
      );

      render();

      dispatch(
        "to:search-complete",
        {
          query:
            state.query,
          type:
            state.type,
          results:
            state.results,
          total:
            state.total
        }
      );

      return data;
    } catch (error) {
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "[TO Search]",
        error
      );

      state.error =
        error?.message ||
        "Ошибка поиска.";

      renderError();

      throw error;
    } finally {
      state.loading = false;
      state.loadingMore = false;
    }
  }

  async function loadMore() {
    if (
      state.loading ||
      state.loadingMore
    ) {
      return;
    }

    if (
      state.page >=
      state.pages
    ) {
      return;
    }

    state.loadingMore =
      true;

    state.page += 1;

    try {
      await search({
        append: true,
        force: true
      });
    } catch {
      state.page -= 1;
    }
  }

  /* ==========================================================
     SUGGESTIONS
     ========================================================== */

  async function loadSuggestions(
    query
  ) {
    const value =
      normalize(query);

    if (
      value.length < 2
    ) {
      state.suggestions = [];
      renderSuggestions();
      return;
    }

    state.suggestionsLoading =
      true;

    try {
      const params =
        new URLSearchParams();

      params.set(
        "q",
        value
      );

      params.set(
        "limit",
        "10"
      );

      params.set(
        "type",
        state.type
      );

      const data =
        await request(
          `${CONFIG.API.SEARCH}/suggestions?${params.toString()}`
        );

      state.suggestions =
        data?.suggestions ??
        data?.items ??
        [];

      renderSuggestions();
    } catch (error) {
      console.error(
        "[TO Search suggestions]",
        error
      );

      state.suggestions =
        [];
      renderSuggestions();
    } finally {
      state.suggestionsLoading =
        false;
    }
  }

  function renderSuggestions() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-suggestions]",
        root
      );

    if (!container) {
      return;
    }

    if (
      !state.suggestions.length
    ) {
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    container.hidden = false;

    container.innerHTML =
      state.suggestions
        .map(
          (item) => {
            const text =
              typeof item ===
              "string"
                ? item
                : item?.text ||
                  item?.query ||
                  item?.title ||
                  item?.name ||
                  "";

            return `
              <button
                type="button"
                class="search-suggestion"
                data-search-suggestion="${escapeHtml(
                  text
                )}"
              >
                🔎
                <span>
                  ${escapeHtml(
                    text
                  )}
                </span>
              </button>
            `;
          }
        )
        .join("");
  }

  /* ==========================================================
     HISTORY
     ========================================================== */

  function loadHistory() {
    try {
      const raw =
        localStorage.getItem(
          CONFIG.STORAGE.HISTORY
        );

      const parsed =
        raw
          ? JSON.parse(raw)
          : [];

      state.history =
        Array.isArray(parsed)
          ? parsed
          : [];
    } catch {
      state.history = [];
    }

    return state.history;
  }

  function addToHistory(
    query
  ) {
    const value =
      normalize(query);

    if (
      value.length < 2
    ) {
      return;
    }

    state.history =
      state.history.filter(
        (item) =>
          String(item).toLowerCase() !==
          value.toLowerCase()
      );

    state.history.unshift(
      value
    );

    state.history =
      state.history.slice(
        0,
        CONFIG.MAX_HISTORY
      );

    try {
      localStorage.setItem(
        CONFIG.STORAGE.HISTORY,
        JSON.stringify(
          state.history
        )
      );
    } catch {
      // ignore
    }
  }

  function clearHistory() {
    state.history = [];

    try {
      localStorage.removeItem(
        CONFIG.STORAGE.HISTORY
      );
    } catch {
      // ignore
    }

    renderHistory();

    dispatch(
      "to:search-history-cleared"
    );
  }

  async function syncHistory() {
    try {
      const data =
        await request(
          CONFIG.API.HISTORY
        );

      const remote =
        data?.items ??
        data?.history ??
        [];

      if (
        Array.isArray(remote)
      ) {
        state.history =
          remote
            .map(
              (item) =>
                typeof item ===
                "string"
                  ? item
                  : item?.query
            )
            .filter(Boolean);

        localStorage.setItem(
          CONFIG.STORAGE.HISTORY,
          JSON.stringify(
            state.history
          )
        );
      }
    } catch {
      // local history remains available
    }
  }

  function renderHistory() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-history]",
        root
      );

    if (!container) {
      return;
    }

    if (
      !state.history.length
    ) {
      container.innerHTML = `
        <div class="search-history-empty">
          История поиска пуста.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search-history-header">
        <strong>
          Недавние поиски
        </strong>

        <button
          type="button"
          data-search-clear-history
        >
          Очистить
        </button>
      </div>

      <div class="search-history-list">
        ${state.history
          .map(
            (item) => `
              <button
                type="button"
                class="search-history-item"
                data-search-history-item="${escapeHtml(
                  item
                )}"
              >
                🕘
                <span>
                  ${escapeHtml(
                    item
                  )}
                </span>
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  /* ==========================================================
     STORAGE
     ========================================================== */

  function saveLastSearch() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE.LAST_QUERY,
        state.query
      );

      localStorage.setItem(
        CONFIG.STORAGE.LAST_TYPE,
        state.type
      );
    } catch {
      // ignore
    }
  }

  function restoreLastSearch() {
    try {
      state.query =
        localStorage.getItem(
          CONFIG.STORAGE.LAST_QUERY
        ) || "";

      state.type =
        localStorage.getItem(
          CONFIG.STORAGE.LAST_TYPE
        ) ||
        CONFIG.TYPES.ALL;
    } catch {
      // ignore
    }
  }

  /* ==========================================================
     FILTERS
     ========================================================== */

  function setFilter(
    key,
    value
  ) {
    const mapping = {
      q: "query",
      type: "type",
      category: "category",
      status: "status",
      city: "city",
      country: "country",
      language: "language",
      level: "level",
      service: "service",
      publication_type:
        "publicationType",
      employment_type:
        "employmentType",
      sort: "sort",
      date_from:
        "dateFrom",
      date_to:
        "dateTo",
      min_rating:
        "minRating",
      max_rating:
        "maxRating",
      verified:
        "verifiedOnly",
      has_media:
        "hasMedia",
      has_comments:
        "hasComments",
      has_reviews:
        "hasReviews",
      saved_only:
        "savedOnly"
    };

    const property =
      mapping[key] || key;

    if (
      Object.prototype.hasOwnProperty.call(
        state,
        property
      )
    ) {
      state[property] =
        value;
    }

    dispatch(
      "to:search-filter-changed",
      {
        key,
        value
      }
    );
  }

  function resetFilters() {
    state.category = "";
    state.status = "";
    state.city = "";
    state.country = "";
    state.language = "";
    state.level = "";
    state.service = "";
    state.publicationType = "";
    state.employmentType = "";
    state.sort = "relevance";
    state.dateFrom = "";
    state.dateTo = "";
    state.minRating = "";
    state.maxRating = "";
    state.verifiedOnly = false;
    state.hasMedia = false;
    state.hasComments = false;
    state.hasReviews = false;
    state.savedOnly = false;
    state.page = 1;

    render();

    dispatch(
      "to:search-filters-reset"
    );
  }

  /* ==========================================================
     RESULT TYPE
     ========================================================== */

  function getResultType(
    item
  ) {
    return (
      item?.result_type ||
      item?.type ||
      state.type
    );
  }

  function getResultIcon(
    type
  ) {
    const icons = {
      publications: "📰",
      publication: "📰",
      participants: "👤",
      participant: "👤",
      comments: "💬",
      comment: "💬",
      reviews: "⭐",
      review: "⭐",
      categories: "📂",
      category: "📂",
      opportunities: "🚀",
      opportunity: "🚀",
      companies: "🏢",
      company: "🏢",
      saved: "🔖",
      chats: "💬",
      chat: "💬"
    };

    return (
      icons[type] ||
      "🔎"
    );
  }

  /* ==========================================================
     RESULT ACTION
     ========================================================== */

  function getResultUrl(
    item
  ) {
    const type =
      getResultType(item);

    const id =
      getObjectId(item);

    const postNumber =
      item?.post_number ||
      item?.public_number;

    if (
      type ===
        "publications" ||
      type === "publication"
    ) {
      if (postNumber) {
        return `/${encodeURIComponent(
          postNumber
        )}`;
      }

      if (id) {
        return `/?publication=${encodeURIComponent(
          id
        )}`;
      }
    }

    if (
      type ===
        "participants" ||
      type === "participant"
    ) {
      return `/profile/${encodeURIComponent(
        id
      )}`;
    }

    if (
      type ===
        "comments" ||
      type === "comment"
    ) {
      const publication =
        item?.publication_id ||
        item?.post_number;

      if (publication) {
        return `/${encodeURIComponent(
          publication
        )}`;
      }
    }

    if (
      type ===
        "reviews" ||
      type === "review"
    ) {
      return `/?review=${encodeURIComponent(
        id
      )}`;
    }

    if (
      type === "chats" ||
      type === "chat"
    ) {
      return `/?chat=${encodeURIComponent(
        id
      )}`;
    }

    if (
      type ===
        "categories" ||
      type === "category"
    ) {
      return `/?category=${encodeURIComponent(
        id
      )}`;
    }

    if (
      type ===
        "opportunities" ||
      type === "opportunity"
    ) {
      return `/?opportunity=${encodeURIComponent(
        id
      )}`;
    }

    if (
      type ===
        "companies" ||
      type === "company"
    ) {
      return `/?company=${encodeURIComponent(
        id
      )}`;
    }

    return `/?search=${encodeURIComponent(
      state.query
    )}`;
  }

  function openResult(
    item
  ) {
    state.selectedResult =
      item;

    const url =
      getResultUrl(item);

    dispatch(
      "to:search-result-open",
      {
        item,
        url
      }
    );

    if (
      window.location.pathname !==
      url
    ) {
      window.location.href =
        url;
    }
  }

  /* ==========================================================
     ADMIN QUICK ACTIONS
     ========================================================== */

  function adminAction(
    action,
    item
  ) {
    if (!isAdmin()) {
      return;
    }

    dispatch(
      "to:admin-search-action",
      {
        action,
        item,
        id:
          getObjectId(item)
      }
    );
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  function render() {
    renderInputs();
    renderFilters();
    renderHistory();
    renderSuggestions();
    renderResults();
    renderPagination();
    renderSummary();
  }

  function renderInputs() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const input =
      qs(
        "[data-search-input]",
        root
      );

    if (
      input &&
      document.activeElement !==
        input
    ) {
      input.value =
        state.query;
    }

    const type =
      qs(
        "[data-search-type]",
        root
      );

    if (type) {
      type.value =
        state.type;
    }

    const values = {
      category:
        state.category,
      status:
        state.status,
      city:
        state.city,
      country:
        state.country,
      language:
        state.language,
      level:
        state.level,
      service:
        state.service,
      publication_type:
        state.publicationType,
      employment_type:
        state.employmentType,
      sort:
        state.sort,
      date_from:
        state.dateFrom,
      date_to:
        state.dateTo,
      min_rating:
        state.minRating,
      max_rating:
        state.maxRating
    };

    Object.entries(
      values
    ).forEach(
      ([key, value]) => {
        const element =
          qs(
            `[data-search-filter="${key}"]`,
            root
          );

        if (element) {
          element.value =
            value;
        }
      }
    );

    const checks = {
      verified:
        state.verifiedOnly,
      has_media:
        state.hasMedia,
      has_comments:
        state.hasComments,
      has_reviews:
        state.hasReviews,
      saved_only:
        state.savedOnly
    };

    Object.entries(
      checks
    ).forEach(
      ([key, value]) => {
        const element =
          qs(
            `[data-search-checkbox="${key}"]`,
            root
          );

        if (element) {
          element.checked =
            Boolean(value);
        }
      }
    );
  }

  function renderFilters() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const filterCount =
      Object.values({
        category:
          state.category,
        status:
          state.status,
        city:
          state.city,
        country:
          state.country,
        language:
          state.language,
        level:
          state.level,
        service:
          state.service,
        publicationType:
          state.publicationType,
        employmentType:
          state.employmentType,
        dateFrom:
          state.dateFrom,
        dateTo:
          state.dateTo,
        minRating:
          state.minRating,
        maxRating:
          state.maxRating
      }).filter(Boolean)
        .length +
      [
        state.verifiedOnly,
        state.hasMedia,
        state.hasComments,
        state.hasReviews,
        state.savedOnly
      ].filter(Boolean).length;

    qsa(
      "[data-search-filter-count]",
      root
    ).forEach(
      (element) => {
        element.textContent =
          String(filterCount);
      }
    );
  }

  function renderSummary() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-summary]",
        root
      );

    if (!container) {
      return;
    }

    if (
      state.loading
    ) {
      container.textContent =
        "Поиск...";
      return;
    }

    if (
      state.error
    ) {
      container.textContent =
        "Ошибка поиска";
      return;
    }

    if (
      !state.query &&
      !state.results.length
    ) {
      container.textContent =
        "";
      return;
    }

    container.textContent =
      `${formatNumber(
        state.total
      )} результатов`;
  }

  function renderLoading() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-results]",
        root
      );

    if (!container) {
      return;
    }

    if (
      state.loading &&
      !state.results.length
    ) {
      container.innerHTML = `
        <div class="search-loading">
          <div class="search-spinner"></div>
          <strong>
            Выполняем поиск…
          </strong>
          <span>
            Ищем публикации, участников и возможности.
          </span>
        </div>
      `;
    }
  }

  function renderError() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-results]",
        root
      );

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="search-error">
        <div class="search-error-icon">
          ⚠️
        </div>

        <h3>
          Не удалось выполнить поиск
        </h3>

        <p>
          ${escapeHtml(
            state.error ||
            "Произошла неизвестная ошибка."
          )}
        </p>

        <button
          type="button"
          data-search-retry
        >
          Повторить
        </button>
      </div>
    `;
  }

  function renderResults() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-results]",
        root
      );

    if (!container) {
      return;
    }

    if (
      state.loading &&
      !state.results.length
    ) {
      return;
    }

    if (
      !state.results.length
    ) {
      container.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">
            🔎
          </div>

          <h3>
            Ничего не найдено
          </h3>

          <p>
            Попробуйте изменить запрос или фильтры.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML =
      state.results
        .map(
          (item, index) =>
            renderResult(
              item,
              index
            )
        )
        .join("");
  }

  function renderResult(
    item,
    index
  ) {
    const type =
      getResultType(item);

    const icon =
      getResultIcon(type);

    const title =
      getTitle(item);

    const description =
      getDescription(item);

    const image =
      getImage(item);

    const id =
      getObjectId(item);

    const rating =
      item?.rating ??
      item?.average_rating;

    const reactions =
      item?.reactions_count ??
      item?.likes_count ??
      0;

    const comments =
      item?.comments_count ??
      0;

    const shares =
      item?.shares_count ??
      0;

    const views =
      item?.views_count ??
      0;

    const verified =
      Boolean(
        item?.verified ||
        item?.is_verified ||
        item?.verified_at
      );

    return `
      <article
        class="search-result"
        data-search-result-index="${index}"
        data-search-result-id="${escapeHtml(
          id
        )}"
      >

        <div class="search-result-media">

          ${
            image
              ? `
                <img
                  src="${escapeHtml(
                    image
                  )}"
                  alt=""
                  loading="lazy"
                >
              `
              : `
                <div class="search-result-placeholder">
                  ${icon}
                </div>
              `
          }

        </div>

        <div class="search-result-content">

          <div class="search-result-top">

            <span class="search-result-type">
              ${icon}
              ${escapeHtml(
                getTypeLabel(
                  type
                )
              )}
            </span>

            ${
              verified
                ? `
                  <span
                    class="search-result-verified"
                    title="Подтверждено"
                  >
                    ✓
                  </span>
                `
                : ""
            }

          </div>

          <h3>
            ${escapeHtml(
              title
            )}
          </h3>

          ${
            item?.username
              ? `
                <div class="search-result-username">
                  @${escapeHtml(
                    item.username
                  )}
                </div>
              `
              : ""
          }

          ${
            description
              ? `
                <p>
                  ${escapeHtml(
                    truncate(
                      description,
                      260
                    )
                  )}
                </p>
              `
              : ""
          }

          <div class="search-result-meta">

            ${
              rating !==
                undefined &&
              rating !== null &&
              rating !== ""
                ? `
                  <span>
                    ⭐ ${escapeHtml(
                      rating
                    )}
                  </span>
                `
                : ""
            }

            <span>
              ❤️ ${formatNumber(
                reactions
              )}
            </span>

            <span>
              💬 ${formatNumber(
                comments
              )}
            </span>

            <span>
              📤 ${formatNumber(
                shares
              )}
            </span>

            <span>
              👁 ${formatNumber(
                views
              )}
            </span>

            ${
              item?.created_at
                ? `
                  <time>
                    ${formatDate(
                      item.created_at
                    )}
                  </time>
                `
                : ""
            }

          </div>

        </div>

        <div class="search-result-actions">

          <button
            type="button"
            data-search-open
            data-search-result-index="${index}"
          >
            Открыть
          </button>

          ${
            isAdmin()
              ? renderAdminActions(
                  index
                )
              : ""
          }

        </div>

      </article>
    `;
  }

  function renderAdminActions(
    index
  ) {
    return `
      <div
        class="search-result-admin-actions"
      >
        <button
          type="button"
          data-admin-search-action="profile"
          data-search-result-index="${index}"
        >
          👤 Профиль
        </button>

        <button
          type="button"
          data-admin-search-action="edit"
          data-search-result-index="${index}"
        >
          ✏️ Изменить
        </button>

        <button
          type="button"
          data-admin-search-action="chat"
          data-search-result-index="${index}"
        >
          💬 Чат
        </button>

        <button
          type="button"
          data-admin-search-action="permissions"
          data-search-result-index="${index}"
        >
          🔐 Права
        </button>

        <button
          type="button"
          data-admin-search-action="moderate"
          data-search-result-index="${index}"
        >
          🛡️ Модерация
        </button>
      </div>
    `;
  }

  function renderPagination() {
    const root =
      getRoot();

    if (!root) {
      return;
    }

    const container =
      qs(
        "[data-search-pagination]",
        root
      );

    if (!container) {
      return;
    }

    if (
      state.pages <= 1
    ) {
      container.innerHTML = "";
      return;
    }

    const pages =
      buildPageList(
        state.page,
        state.pages
      );

    container.innerHTML = `
      <button
        type="button"
        data-search-page="${Math.max(
          1,
          state.page - 1
        )}"
        ${
          state.page <= 1
            ? "disabled"
            : ""
        }
      >
        ←
      </button>

      ${pages
        .map(
          (page) =>
            page === "..."
              ? `
                <span>
                  …
                </span>
              `
              : `
                <button
                  type="button"
                  data-search-page="${page}"
                  ${
                    Number(page) ===
                    state.page
                      ? "aria-current='page'"
                      : ""
                  }
                >
                  ${page}
                </button>
              `
        )
        .join("")}

      <button
        type="button"
        data-search-page="${Math.min(
          state.pages,
          state.page + 1
        )}"
        ${
          state.page >=
          state.pages
            ? "disabled"
            : ""
        }
      >
        →
      </button>

      ${
        state.page <
        state.pages
          ? `
            <button
              type="button"
              data-search-load-more
            >
              Показать ещё
            </button>
          `
          : ""
      }
    `;
  }

  function buildPageList(
    current,
    total
  ) {
    if (
      total <= 7
    ) {
      return Array.from(
        {
          length: total
        },
        (_, index) =>
          index + 1
      );
    }

    const pages = [
      1
    ];

    if (
      current > 4
    ) {
      pages.push("...");
    }

    for (
      let i =
        Math.max(
          2,
          current - 1
        );
      i <=
        Math.min(
          total - 1,
          current + 1
        );
      i++
    ) {
      pages.push(i);
    }

    if (
      current <
      total - 3
    ) {
      pages.push("...");
    }

    pages.push(total);

    return pages;
  }

  function getTypeLabel(
    type
  ) {
    const labels = {
      all: "Всё",
      publications:
        "Публикация",
      publication:
        "Публикация",
      participants:
        "Участник",
      participant:
        "Участник",
      comments:
        "Комментарий",
      comment:
        "Комментарий",
      reviews:
        "Отзыв",
      review:
        "Отзыв",
      categories:
        "Категория",
      category:
        "Категория",
      opportunities:
        "Возможность",
      opportunity:
        "Возможность",
      companies:
        "Компания",
      company:
        "Компания",
      saved:
        "Сохранённое",
      chats:
        "Чат",
      chat:
        "Чат"
    };

    return (
      labels[type] ||
      type ||
      "Результат"
    );
  }

  function truncate(
    value,
    max
  ) {
    const text =
      String(value || "");

    if (
      text.length <= max
    ) {
      return text;
    }

    return (
      text.slice(
        0,
        max - 1
      ) + "…"
    );
  }

  /* ==========================================================
     EVENTS
     ========================================================== */

  function handleClick(
    event
  ) {
    const target =
      event.target.closest(
        "[data-search-suggestion]," +
        "[data-search-history-item]," +
        "[data-search-clear-history]," +
        "[data-search-clear]," +
        "[data-search-open]," +
        "[data-search-page]," +
        "[data-search-load-more]," +
        "[data-search-retry]," +
        "[data-admin-search-action]"
      );

    if (!target) {
      return;
    }

    if (
      target.hasAttribute(
        "data-search-suggestion"
      )
    ) {
      event.preventDefault();

      const query =
        target.getAttribute(
          "data-search-suggestion"
        ) || "";

      state.query =
        query;

      const input =
        qs(
          "[data-search-input]"
        );

      if (input) {
        input.value =
          query;
      }

      state.suggestions =
        [];

      renderSuggestions();

      search({
        force: true
      });

      return;
    }

    if (
      target.hasAttribute(
        "data-search-history-item"
      )
    ) {
      event.preventDefault();

      const query =
        target.getAttribute(
          "data-search-history-item"
        ) || "";

      state.query =
        query;

      const input =
        qs(
          "[data-search-input]"
        );

      if (input) {
        input.value =
          query;
      }

      search({
        force: true
      });

      return;
    }

    if (
      target.hasAttribute(
        "data-search-clear-history"
      )
    ) {
      event.preventDefault();

      clearHistory();

      return;
    }

    if (
      target.hasAttribute(
        "data-search-clear"
      )
    ) {
      event.preventDefault();

      state.query = "";

      resetFilters();

      render();

      return;
    }

    if (
      target.hasAttribute(
        "data-search-open"
      )
    ) {
      event.preventDefault();

      const index =
        Number(
          target.getAttribute(
            "data-search-result-index"
          )
        );

      const item =
        state.results[index];

      if (item) {
        openResult(item);
      }

      return;
    }

    if (
      target.hasAttribute(
        "data-search-page"
      )
    ) {
      event.preventDefault();

      const page =
        Number(
          target.getAttribute(
            "data-search-page"
          )
        );

      if (
        page >= 1 &&
        page <= state.pages &&
        page !== state.page
      ) {
        state.page =
          page;

        search({
          force: true
        });
      }

      return;
    }

    if (
      target.hasAttribute(
        "data-search-load-more"
      )
    ) {
      event.preventDefault();

      loadMore();

      return;
    }

    if (
      target.hasAttribute(
        "data-search-retry"
      )
    ) {
      event.preventDefault();

      search({
        force: true
      });

      return;
    }

    if (
      target.hasAttribute(
        "data-admin-search-action"
      )
    ) {
      event.preventDefault();

      if (!isAdmin()) {
        return;
      }

      const index =
        Number(
          target.getAttribute(
            "data-search-result-index"
          )
        );

      const item =
        state.results[index];

      if (item) {
        adminAction(
          target.getAttribute(
            "data-admin-search-action"
          ),
          item
        );
      }
    }
  }

  function handleInput(
    event
  ) {
    const target =
      event.target;

    if (
      target.matches(
        "[data-search-input]"
      )
    ) {
      state.query =
        normalize(
          target.value
        );

      clearTimeout(
        state.searchTimer
      );

      state.searchTimer =
        setTimeout(
          () => {
            loadSuggestions(
              state.query
            );
          },
          CONFIG.DEBOUNCE
        );

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
        "[data-search-type]"
      )
    ) {
      state.type =
        target.value ||
        CONFIG.TYPES.ALL;

      state.page = 1;

      search({
        force: true
      });

      return;
    }

    if (
      target.matches(
        "[data-search-filter]"
      )
    ) {
      const key =
        target.getAttribute(
          "data-search-filter"
        );

      setFilter(
        key,
        target.value
      );

      state.page = 1;

      search({
        force: true
      });

      return;
    }

    if (
      target.matches(
        "[data-search-checkbox]"
      )
    ) {
      const key =
        target.getAttribute(
          "data-search-checkbox"
        );

      setFilter(
        key,
        Boolean(
          target.checked
        )
      );

      state.page = 1;

      search({
        force: true
      });
    }
  }

  function handleSubmit(
    event
  ) {
    const form =
      event.target;

    if (
      !form.matches(
        "[data-search-form]"
      )
    ) {
      return;
    }

    event.preventDefault();

    const input =
      qs(
        "[data-search-input]",
        form
      );

    state.query =
      normalize(
        input?.value ||
        state.query
      );

    state.suggestions =
      [];

    renderSuggestions();

    search({
      force: true
    });
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  function setQuery(
    query,
    options = {}
  ) {
    state.query =
      normalize(query);

    if (
      options.search !== false
    ) {
      search({
        force: true
      });
    } else {
      render();
    }
  }

  function setType(
    type,
    options = {}
  ) {
    const allowed =
      Object.values(
        CONFIG.TYPES
      );

    state.type =
      allowed.includes(type)
        ? type
        : CONFIG.TYPES.ALL;

    if (
      options.search !== false
    ) {
      search({
        force: true
      });
    } else {
      render();
    }
  }

  function getResults() {
    return [
      ...state.results
    ];
  }

  function getState() {
    return {
      ...state,
      results: [
        ...state.results
      ],
      history: [
        ...state.history
      ]
    };
  }

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
      state.mode =
        options.mode ===
        "admin"
          ? "admin"
          : "participant";
    }

    if (
      options.query !==
      undefined
    ) {
      state.query =
        normalize(
          options.query
        );
    } else {
      restoreLastSearch();
    }

    if (
      options.type
    ) {
      setTypeSilently(
        options.type
      );
    }

    loadHistory();

    document.addEventListener(
      "click",
      handleClick
    );

    document.addEventListener(
      "input",
      handleInput
    );

    document.addEventListener(
      "change",
      handleChange
    );

    document.addEventListener(
      "submit",
      handleSubmit
    );

    state.initialized =
      true;

    render();

    if (
      state.query
    ) {
      search({
        force: true
      });
    }

    syncHistory();

    dispatch(
      "to:search-ready",
      {
        mode:
          state.mode
      }
    );

    return api;
  }

  function setTypeSilently(
    type
  ) {
    const allowed =
      Object.values(
        CONFIG.TYPES
      );

    state.type =
      allowed.includes(type)
        ? type
        : CONFIG.TYPES.ALL;
  }

  function destroy() {
    document.removeEventListener(
      "click",
      handleClick
    );

    document.removeEventListener(
      "input",
      handleInput
    );

    document.removeEventListener(
      "change",
      handleChange
    );

    document.removeEventListener(
      "submit",
      handleSubmit
    );

    clearTimeout(
      state.searchTimer
    );

    if (
      state.abortController
    ) {
      state.abortController.abort();
    }

    state.initialized =
      false;
  }

  const api = {
    init,
    destroy,

    search,
    loadMore,

    setQuery,
    setType,
    setFilter,
    resetFilters,

    getResults,
    getState,

    loadHistory,
    clearHistory,
    syncHistory,

    loadSuggestions,

    openResult,

    adminAction,

    categories:
      CATEGORIES,

    types:
      CONFIG.TYPES,

    config:
      CONFIG
  };

  window.TOSearch =
    api;

  window.Search =
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
