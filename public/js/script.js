/* ============================================================
   TAJIK OPPORTUNITIES
   Главная страница — загрузка и фильтрация публикаций
   ============================================================ */

(() => {
  "use strict";

  const TO = window.TO;

  if (!TO) {
    console.error("Tajik Opportunities: utils.js не загружен.");
    return;
  }

  // ==========================================================
  // СОСТОЯНИЕ
  // ==========================================================

  const state = {
    posts: [],
    filteredPosts: [],
    search: "",
    category: "all",
    sort: "newest",
    loading: false,
  };

  // ==========================================================
  // DOM
  // ==========================================================

  const elements = {
    searchInput: document.getElementById("searchInput"),
    clearSearch: document.getElementById("clearSearch"),

    categoryChips: Array.from(
      document.querySelectorAll(".category-chip")
    ),

    sortSelect: document.getElementById("sortSelect"),

    resultsInfo: document.getElementById("resultsInfo"),
    resetFilters: document.getElementById("resetFilters"),

    loadingState: document.getElementById("loadingState"),
    postsGrid: document.getElementById("postsGrid"),
    emptyState: document.getElementById("emptyState"),
    emptyReset: document.getElementById("emptyReset"),

    errorState: document.getElementById("errorState"),
    retryButton: document.getElementById("retryButton"),
  };

  // ==========================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================================================

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    applyQueryParams();
    bindEvents();
    updateSearchButton();

    await loadPosts();
  }

  // ==========================================================
  // СОБЫТИЯ
  // ==========================================================

  function bindEvents() {
    if (elements.searchInput) {
      elements.searchInput.addEventListener(
        "input",
        TO.debounce(() => {
          state.search = elements.searchInput.value.trim();
          updateSearchButton();
          applyFilters();
        }, 250)
      );

      elements.searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          resetSearch();
        }
      });
    }

    if (elements.clearSearch) {
      elements.clearSearch.addEventListener("click", resetSearch);
    }

    elements.categoryChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const category = chip.dataset.category || "all";

        state.category = category;

        updateCategoryButtons();
        applyFilters();
        updateUrl();
      });
    });

    if (elements.sortSelect) {
      elements.sortSelect.addEventListener("change", () => {
        state.sort = elements.sortSelect.value || "newest";
        applyFilters();
        updateUrl();
      });
    }

    if (elements.resetFilters) {
      elements.resetFilters.addEventListener("click", resetFilters);
    }

    if (elements.emptyReset) {
      elements.emptyReset.addEventListener("click", resetFilters);
    }

    if (elements.retryButton) {
      elements.retryButton.addEventListener("click", loadPosts);
    }
  }

  // ==========================================================
  // QUERY PARAMS
  // ==========================================================

  function applyQueryParams() {
    const categoryParam = TO.getQueryParam("category");
    const searchParam = TO.getQueryParam("q");
    const sortParam = TO.getQueryParam("sort");

    if (categoryParam) {
      const validCategory = elements.categoryChips.some(
        (chip) => chip.dataset.category === categoryParam
      );

      if (validCategory) {
        state.category = categoryParam;
      }
    }

    if (searchParam) {
      state.search = searchParam;

      if (elements.searchInput) {
        elements.searchInput.value = searchParam;
      }
    }

    if (
      sortParam === "newest" ||
      sortParam === "oldest"
    ) {
      state.sort = sortParam;

      if (elements.sortSelect) {
        elements.sortSelect.value = sortParam;
      }
    }

    updateCategoryButtons();
  }

  function updateUrl() {
    const params = {};

    if (state.search) {
      params.q = state.search;
    }

    if (state.category && state.category !== "all") {
      params.category = state.category;
    }

    if (state.sort && state.sort !== "newest") {
      params.sort = state.sort;
    }

    TO.setQueryParams(params, true);
  }

  // ==========================================================
  // ЗАГРУЗКА ПУБЛИКАЦИЙ
  // ==========================================================

  async function loadPosts() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    try {
      const response = await TO.getJson("/api/posts");

      const posts = extractPosts(response);

      state.posts = Array.isArray(posts) ? posts : [];

      applyFilters();

      hideError();
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка загрузки публикаций",
        error
      );

      showError(
        TO.getErrorMessage(
          error,
          "Не удалось загрузить публикации."
        )
      );
    } finally {
      state.loading = false;
      hideLoading();
    }
  }

  function extractPosts(response) {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && Array.isArray(response.posts)) {
      return response.posts;
    }

    if (response && response.data && Array.isArray(response.data.posts)) {
      return response.data.posts;
    }

    return [];
  }

  // ==========================================================
  // ФИЛЬТРАЦИЯ
  // ==========================================================

  function applyFilters() {
    let result = [...state.posts];

    // --------------------------------------------------------
    // Категория
    // --------------------------------------------------------

    if (state.category && state.category !== "all") {
      result = result.filter((post) => {
        return String(post.category || "").toLowerCase() ===
          String(state.category || "").toLowerCase();
      });
    }

    // --------------------------------------------------------
    // Поиск
    // --------------------------------------------------------

    const search = TO.normalizeText(state.search);

    if (search) {
      result = result.filter((post) => {
        const searchableText = [
          post.title,
          post.content,
          post.category,
          post.author_name,
          post.contact,
        ]
          .filter(Boolean)
          .map((value) => TO.normalizeText(value))
          .join(" ");

        return searchableText.includes(search);
      });
    }

    // --------------------------------------------------------
    // Сортировка
    // --------------------------------------------------------

    result.sort((a, b) => {
      const dateA = getPostTime(a);
      const dateB = getPostTime(b);

      if (state.sort === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });

    state.filteredPosts = result;

    renderPosts();
    updateResultsInfo();
    updateResetButton();

    hideError();
  }

  function getPostTime(post) {
    const value =
      post.published_at ||
      post.created_at ||
      post.date ||
      "";

    const time = new Date(value).getTime();

    return Number.isFinite(time) ? time : 0;
  }

  // ==========================================================
  // ОТРИСОВКА
  // ==========================================================

  function renderPosts() {
    if (!elements.postsGrid) {
      return;
    }

    if (!state.filteredPosts.length) {
      elements.postsGrid.innerHTML = "";
      showEmpty();
      return;
    }

    hideEmpty();

    elements.postsGrid.innerHTML = state.filteredPosts
      .map(renderPostCard)
      .join("");

    bindPostImageFallbacks();
  }

  function renderPostCard(post) {
    const id = String(post.id || "");

    const title = TO.escapeHtml(
      post.title || "Без названия"
    );

    const category = String(
      post.category || "Другое"
    );

    const categoryLabel = TO.escapeHtml(
      TO.getCategoryLabel(category)
    );

    const categoryIcon = TO.getCategoryIcon(category);

    const content = TO.escapeHtml(
      TO.truncateText(
        post.content || "",
        180
      )
    );

    const author = post.author_name
      ? TO.escapeHtml(post.author_name)
      : "";

    const date = post.published_at || post.created_at;

    const formattedDate = date
      ? TO.escapeHtml(
          TO.formatRelativeDate(date)
        )
      : "";

    const fullDate = date
      ? TO.escapeHtml(
          TO.formatDate(date)
        )
      : "";

    const postUrl =
      "/post.html?id=" +
      encodeURIComponent(id);

    const imageUrl = TO.safeExternalUrl(
      post.image_url || ""
    );

    const imageHtml = imageUrl
      ? `
        <div class="post-card-image">
          <img
            src="${TO.escapeHtml(imageUrl)}"
            alt="${title}"
            loading="lazy"
            data-image-fallback="true"
          >
        </div>
      `
      : `
        <div class="post-card-image post-card-image-placeholder">
          <span aria-hidden="true">${categoryIcon}</span>
        </div>
      `;

    return `
      <article class="post-card">
        <a
          class="post-card-link"
          href="${postUrl}"
          aria-label="Открыть публикацию: ${title}"
        >
          ${imageHtml}

          <div class="post-card-body">

            <div class="post-card-meta">
              <span class="post-card-category">
                <span aria-hidden="true">${categoryIcon}</span>
                ${categoryLabel}
              </span>

              ${
                formattedDate
                  ? `
                    <time
                      class="post-card-date"
                      datetime="${TO.escapeHtml(
                        date || ""
                      )}"
                      title="${fullDate}"
                    >
                      ${formattedDate}
                    </time>
                  `
                  : ""
              }
            </div>

            <h3 class="post-card-title">
              ${title}
            </h3>

            ${
              content
                ? `
                  <p class="post-card-excerpt">
                    ${content}
                  </p>
                `
                : ""
            }

            ${
              author
                ? `
                  <div class="post-card-author">
                    <span aria-hidden="true">👤</span>
                    <span>${author}</span>
                  </div>
                `
                : ""
            }

            <div class="post-card-footer">
              <span class="post-card-more">
                Подробнее
                <span aria-hidden="true">→</span>
              </span>
            </div>

          </div>
        </a>
      </article>
    `;
  }

  // ==========================================================
  // FALLBACK ДЛЯ ИЗОБРАЖЕНИЙ
  // ==========================================================

  function bindPostImageFallbacks() {
    const images = document.querySelectorAll(
      'img[data-image-fallback="true"]'
    );

    images.forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          const wrapper = image.closest(
            ".post-card-image"
          );

          if (!wrapper) {
            return;
          }

          wrapper.classList.add(
            "post-card-image-placeholder"
          );

          image.remove();

          const icon = document.createElement("span");

          icon.setAttribute(
            "aria-hidden",
            "true"
          );

          icon.textContent = "📰";

          wrapper.appendChild(icon);
        },
        { once: true }
      );
    });
  }

  // ==========================================================
  // ИНФОРМАЦИЯ О РЕЗУЛЬТАТАХ
  // ==========================================================

  function updateResultsInfo() {
    if (!elements.resultsInfo) {
      return;
    }

    const total = state.filteredPosts.length;

    const text =
      total === 0
        ? "Публикации не найдены"
        : `Найдено публикаций: ${total}`;

    elements.resultsInfo.textContent = text;
  }

  // ==========================================================
  // КНОПКИ КАТЕГОРИЙ
  // ==========================================================

  function updateCategoryButtons() {
    elements.categoryChips.forEach((chip) => {
      const active =
        chip.dataset.category === state.category;

      chip.classList.toggle(
        "active",
        active
      );

      chip.setAttribute(
        "aria-pressed",
        active ? "true" : "false"
      );
    });
  }

  // ==========================================================
  // ПОИСК
  // ==========================================================

  function updateSearchButton() {
    if (!elements.clearSearch) {
      return;
    }

    const hasSearch = Boolean(
      elements.searchInput &&
      elements.searchInput.value.trim()
    );

    elements.clearSearch.hidden = !hasSearch;
  }

  function resetSearch() {
    state.search = "";

    if (elements.searchInput) {
      elements.searchInput.value = "";
      elements.searchInput.focus();
    }

    updateSearchButton();
    applyFilters();
    updateUrl();
  }

  // ==========================================================
  // СБРОС ФИЛЬТРОВ
  // ==========================================================

  function resetFilters() {
    state.search = "";
    state.category = "all";
    state.sort = "newest";

    if (elements.searchInput) {
      elements.searchInput.value = "";
    }

    if (elements.sortSelect) {
      elements.sortSelect.value = "newest";
    }

    updateSearchButton();
    updateCategoryButtons();

    applyFilters();
    updateUrl();
  }

  function updateResetButton() {
    const hasFilters =
      Boolean(state.search) ||
      state.category !== "all" ||
      state.sort !== "newest";

    if (elements.resetFilters) {
      elements.resetFilters.hidden = !hasFilters;
    }
  }

  // ==========================================================
  // СОСТОЯНИЯ UI
  // ==========================================================

  function showLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden = false;
    }

    if (elements.postsGrid) {
      elements.postsGrid.hidden = true;
    }

    hideEmpty();
    hideError();
  }

  function hideLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden = true;
    }

    if (elements.postsGrid) {
      elements.postsGrid.hidden = false;
    }
  }

  function showEmpty() {
    if (elements.emptyState) {
      elements.emptyState.hidden = false;
    }
  }

  function hideEmpty() {
    if (elements.emptyState) {
      elements.emptyState.hidden = true;
    }
  }

  function showError(message) {
    if (elements.errorState) {
      elements.errorState.hidden = false;

      const messageElement =
        elements.errorState.querySelector(
          "[data-error-message]"
        );

      if (messageElement) {
        messageElement.textContent = message;
      }
    }

    if (elements.postsGrid) {
      elements.postsGrid.hidden = true;
    }

    hideEmpty();
  }

  function hideError() {
    if (elements.errorState) {
      elements.errorState.hidden = true;
    }
  }

  // ==========================================================
  // ЗАЩИТА ОТ НЕОЖИДАННЫХ ДАННЫХ
  // ==========================================================

  window.TajikOpportunitiesHome = {
    reload: loadPosts,
    reset: resetFilters,
    getState: () => ({
      posts: [...state.posts],
      filteredPosts: [...state.filteredPosts],
      search: state.search,
      category: state.category,
      sort: state.sort,
    }),
  };
})();
