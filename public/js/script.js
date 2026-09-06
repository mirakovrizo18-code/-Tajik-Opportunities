/* ============================================================
   TAJIK OPPORTUNITIES
   Главная страница — публикации, поиск, фильтрация и статистика
   Совместимо с новым worker/worker.js
   ============================================================ */

(() => {
  "use strict";

  const TO = window.TO;

  if (!TO) {
    console.error("Tajik Opportunities: utils.js не загружен.");
    return;
  }

  const state = {
    posts: [],
    filteredPosts: [],
    search: "",
    category: "all",
    sort: "newest",
    loading: false,
  };

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
          updateUrl();
        }, 250)
      );

      elements.searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          resetSearch();
        }

        if (event.key === "Enter") {
          state.search = elements.searchInput.value.trim();
          applyFilters();
          updateUrl();
        }
      });
    }

    if (elements.clearSearch) {
      elements.clearSearch.addEventListener("click", resetSearch);
    }

    elements.categoryChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        state.category = chip.dataset.category || "all";

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
      elements.resetFilters.addEventListener(
        "click",
        resetFilters
      );
    }

    if (elements.emptyReset) {
      elements.emptyReset.addEventListener(
        "click",
        resetFilters
      );
    }

    if (elements.retryButton) {
      elements.retryButton.addEventListener(
        "click",
        loadPosts
      );
    }
  }

  // ==========================================================
  // URL
  // ==========================================================

  function applyQueryParams() {
    const categoryParam = TO.getQueryParam("category");
    const searchParam = TO.getQueryParam("q");
    const sortParam = TO.getQueryParam("sort");

    if (categoryParam) {
      const validCategory =
        elements.categoryChips.some(
          (chip) =>
            chip.dataset.category === categoryParam
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

    if (
      state.category &&
      state.category !== "all"
    ) {
      params.category = state.category;
    }

    if (
      state.sort &&
      state.sort !== "newest"
    ) {
      params.sort = state.sort;
    }

    if (typeof TO.setQueryParams === "function") {
      TO.setQueryParams(params, true);
    }
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
      const response =
        await TO.getJson("/api/publications");

      const posts = extractPosts(response);

      state.posts = Array.isArray(posts)
        ? posts.map(normalizePost)
        : [];

      applyFilters();
      hideError();
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка загрузки публикаций",
        error
      );

      showError(
        typeof TO.getErrorMessage === "function"
          ? TO.getErrorMessage(
              error,
              "Не удалось загрузить публикации."
            )
          : "Не удалось загрузить публикации."
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

    if (
      response &&
      Array.isArray(response.publications)
    ) {
      return response.publications;
    }

    if (
      response &&
      Array.isArray(response.posts)
    ) {
      return response.posts;
    }

    if (
      response &&
      response.data &&
      Array.isArray(response.data.publications)
    ) {
      return response.data.publications;
    }

    if (
      response &&
      response.data &&
      Array.isArray(response.data.posts)
    ) {
      return response.data.posts;
    }

    return [];
  }

  // ==========================================================
  // НОРМАЛИЗАЦИЯ
  // ==========================================================

  function normalizePost(post) {
    if (!post || typeof post !== "object") {
      return {};
    }

    return {
      ...post,

      id:
        post.id ??
        post.publication_id ??
        "",

      title:
        post.title ??
        post.name ??
        "Без названия",

      content:
        post.content ??
        post.description ??
        post.text ??
        "",

      category:
        post.category ??
        post.category_id ??
        "other",

      author_name:
        post.author_name ??
        post.user_name ??
        post.username ??
        post.author?.name ??
        post.user?.name ??
        "",

      username:
        post.username ??
        post.author_username ??
        post.author?.username ??
        post.user?.username ??
        "",

      image_url:
        post.image_url ??
        post.image ??
        post.cover_url ??
        "",

      created_at:
        post.created_at ??
        post.createdAt ??
        post.date ??
        "",

      published_at:
        post.published_at ??
        post.publishedAt ??
        "",

      views: toNumber(
        post.views ??
        post.view_count ??
        0
      ),

      likes: toNumber(
        post.likes ??
        post.like_count ??
        0
      ),

      comments: toNumber(
        post.comments ??
        post.comment_count ??
        0
      ),

      saves: toNumber(
        post.saves ??
        post.save_count ??
        0
      ),

      shares: toNumber(
        post.shares ??
        post.share_count ??
        0
      ),
    };
  }

  function toNumber(value) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }

  // ==========================================================
  // ФИЛЬТРАЦИЯ
  // ==========================================================

  function applyFilters() {
    let result = [...state.posts];

    // Категория
    if (
      state.category &&
      state.category !== "all"
    ) {
      result = result.filter((post) => {
        return (
          String(post.category || "")
            .toLowerCase() ===
          String(state.category || "")
            .toLowerCase()
        );
      });
    }

    // Поиск
    const search =
      typeof TO.normalizeText === "function"
        ? TO.normalizeText(state.search)
        : String(state.search || "")
            .toLowerCase();

    if (search) {
      result = result.filter((post) => {
        const searchableText = [
          post.title,
          post.content,
          post.category,
          post.author_name,
          post.username,
          post.contact,
          post.city,
          post.country,
          post.tags,
          post.hashtags,
        ]
          .filter(Boolean)
          .map((value) =>
            typeof TO.normalizeText === "function"
              ? TO.normalizeText(value)
              : String(value).toLowerCase()
          )
          .join(" ");

        return searchableText.includes(search);
      });
    }

    // Сортировка
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

    const time =
      new Date(value).getTime();

    return Number.isFinite(time)
      ? time
      : 0;
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

    elements.postsGrid.innerHTML =
      state.filteredPosts
        .map(renderPostCard)
        .join("");

    bindPostImageFallbacks();
  }

  function renderPostCard(post) {
    const id = String(post.id || "");

    const title =
      typeof TO.escapeHtml === "function"
        ? TO.escapeHtml(
            post.title || "Без названия"
          )
        : escapeHtml(
            post.title || "Без названия"
          );

    const category = String(
      post.category || "other"
    );

    const categoryLabel =
      typeof TO.escapeHtml === "function"
        ? TO.escapeHtml(
            getCategoryLabel(category)
          )
        : escapeHtml(
            getCategoryLabel(category)
          );

    const categoryIcon =
      getCategoryIcon(category);

    const contentText =
      post.content || "";

    const content =
      typeof TO.truncateText === "function"
        ? TO.escapeHtml(
            TO.truncateText(
              contentText,
              180
            )
          )
        : escapeHtml(
            String(contentText).slice(
              0,
              180
            )
          );

    const authorRaw =
      post.author_name ||
      post.username ||
      "";

    const author =
      typeof TO.escapeHtml === "function"
        ? TO.escapeHtml(authorRaw)
        : escapeHtml(authorRaw);

    const date =
      post.published_at ||
      post.created_at ||
      post.date ||
      "";

    const formattedDate =
      date &&
      typeof TO.formatRelativeDate ===
        "function"
        ? TO.escapeHtml(
            TO.formatRelativeDate(date)
          )
        : "";

    const fullDate =
      date &&
      typeof TO.formatDate ===
        "function"
        ? TO.escapeHtml(
            TO.formatDate(date)
          )
        : "";

    const postUrl =
      "/post.html?id=" +
      encodeURIComponent(id);

    const imageUrl =
      typeof TO.safeExternalUrl ===
      "function"
        ? TO.safeExternalUrl(
            post.image_url || ""
          )
        : "";

    const imageHtml = imageUrl
      ? `
        <div class="post-card-image">
          <img
            src="${escapeHtml(imageUrl)}"
            alt="${title}"
            loading="lazy"
            decoding="async"
            data-image-fallback="true"
          >
        </div>
      `
      : `
        <div class="post-card-image post-card-image-placeholder">
          <span aria-hidden="true">
            ${categoryIcon}
          </span>
        </div>
      `;

    return `
      <article
        class="post-card"
        data-publication-id="${escapeHtml(id)}"
      >
        <a
          class="post-card-link"
          href="${postUrl}"
          aria-label="Открыть публикацию: ${title}"
        >
          ${imageHtml}

          <div class="post-card-body">

            <div class="post-card-meta">

              <span class="post-card-category">
                <span aria-hidden="true">
                  ${categoryIcon}
                </span>

                ${categoryLabel}
              </span>

              ${
                formattedDate
                  ? `
                    <time
                      class="post-card-date"
                      datetime="${escapeHtml(
                        date
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
                    <span aria-hidden="true">
                      👤
                    </span>

                    <span>
                      ${author}
                    </span>
                  </div>
                `
                : ""
            }

            <div class="post-card-stats">

              <span title="Просмотры">
                👁️ ${formatNumber(post.views)}
              </span>

              <span title="Лайки">
                ❤️ ${formatNumber(post.likes)}
              </span>

              <span title="Комментарии">
                💬 ${formatNumber(post.comments)}
              </span>

              <span title="Сохранения">
                🔖 ${formatNumber(post.saves)}
              </span>

              <span title="Поделились">
                ↗️ ${formatNumber(post.shares)}
              </span>

            </div>

            <div class="post-card-footer">

              <span class="post-card-more">
                Подробнее
                <span aria-hidden="true">
                  →
                </span>
              </span>

            </div>

          </div>
        </a>
      </article>
    `;
  }

  // ==========================================================
  // КАТЕГОРИИ
  // ==========================================================

  function getCategoryLabel(category) {
    if (
      typeof TO.getCategoryLabel ===
      "function"
    ) {
      return TO.getCategoryLabel(
        category
      );
    }

    const labels = {
      jobs: "💼 Работа",
      job_seekers: "🔎 Ищу работу",
      employees: "👔 Ищу сотрудника",
      profiles: "👤 Профили",
      news: "📰 Новости",
      education: "🎓 Образование",
      courses: "📚 Курсы",
      opportunities: "🎁 Возможности",
      announcements: "📢 Объявления",
      services: "🤝 Услуги",
      ideas: "💡 Идеи",
      projects: "🚀 Проекты",
      startups: "🌱 Стартапы",
      events: "📅 Мероприятия",
      competitions: "🏆 Конкурсы",
      grants: "💰 Гранты",
      volunteering: "🤝 Волонтёрство",
      products: "🛍️ Товары",
      business: "🏢 Бизнес",
      it: "💻 IT",
      sport: "⚽ Спорт",
      music: "🎵 Музыка",
      culture: "🎭 Культура",
      travel: "✈️ Путешествия",
      help: "🆘 Помощь",
      other: "➕ Другое",
    };

    return (
      labels[category] ||
      labels.other
    );
  }

  function getCategoryIcon(category) {
    if (
      typeof TO.getCategoryIcon ===
      "function"
    ) {
      return TO.getCategoryIcon(
        category
      );
    }

    const icons = {
      jobs: "💼",
      job_seekers: "🔎",
      employees: "👔",
      profiles: "👤",
      news: "📰",
      education: "🎓",
      courses: "📚",
      opportunities: "🎁",
      announcements: "📢",
      services: "🤝",
      ideas: "💡",
      projects: "🚀",
      startups: "🌱",
      events: "📅",
      competitions: "🏆",
      grants: "💰",
      volunteering: "🤝",
      products: "🛍️",
      business: "🏢",
      it: "💻",
      sport: "⚽",
      music: "🎵",
      culture: "🎭",
      travel: "✈️",
      help: "🆘",
      other: "➕",
    };

    return icons[category] || "📰";
  }

  // ==========================================================
  // FALLBACK ИЗОБРАЖЕНИЙ
  // ==========================================================

  function bindPostImageFallbacks() {
    const images =
      document.querySelectorAll(
        'img[data-image-fallback="true"]'
      );

    images.forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          const wrapper =
            image.closest(
              ".post-card-image"
            );

          if (!wrapper) {
            return;
          }

          wrapper.classList.add(
            "post-card-image-placeholder"
          );

          image.remove();

          const icon =
            document.createElement("span");

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
  // РЕЗУЛЬТАТЫ
  // ==========================================================

  function updateResultsInfo() {
    if (!elements.resultsInfo) {
      return;
    }

    const total =
      state.filteredPosts.length;

    elements.resultsInfo.textContent =
      total === 0
        ? "Публикации не найдены"
        : `Найдено публикаций: ${formatNumber(
            total
          )}`;
  }

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

  // ==========================================================
  // КАТЕГОРИИ
  // ==========================================================

  function updateCategoryButtons() {
    elements.categoryChips.forEach(
      (chip) => {
        const active =
          chip.dataset.category ===
          state.category;

        chip.classList.toggle(
          "active",
          active
        );

        chip.setAttribute(
          "aria-pressed",
          active
            ? "true"
            : "false"
        );
      }
    );
  }

  // ==========================================================
  // ПОИСК
  // ==========================================================

  function updateSearchButton() {
    if (!elements.clearSearch) {
      return;
    }

    const hasSearch =
      Boolean(
        elements.searchInput &&
        elements.searchInput.value.trim()
      );

    elements.clearSearch.hidden =
      !hasSearch;
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
  // СБРОС
  // ==========================================================

  function resetFilters() {
    state.search = "";
    state.category = "all";
    state.sort = "newest";

    if (elements.searchInput) {
      elements.searchInput.value = "";
    }

    if (elements.sortSelect) {
      elements.sortSelect.value =
        "newest";
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
      elements.resetFilters.hidden =
        !hasFilters;
    }
  }

  // ==========================================================
  // UI СОСТОЯНИЯ
  // ==========================================================

  function showLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden =
        false;
    }

    if (elements.postsGrid) {
      elements.postsGrid.hidden =
        true;
    }

    hideEmpty();
    hideError();
  }

  function hideLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden =
        true;
    }

    if (elements.postsGrid) {
      elements.postsGrid.hidden =
        false;
    }
  }

  function showEmpty() {
    if (elements.emptyState) {
      elements.emptyState.hidden =
        false;
    }
  }

  function hideEmpty() {
    if (elements.emptyState) {
      elements.emptyState.hidden =
        true;
    }
  }

  function showError(message) {
    if (elements.errorState) {
      elements.errorState.hidden =
        false;

      const messageElement =
        elements.errorState.querySelector(
          "[data-error-message]"
        );

      if (messageElement) {
        messageElement.textContent =
          message;
      }
    }

    if (elements.postsGrid) {
      elements.postsGrid.hidden =
        true;
    }

    hideEmpty();
  }

  function hideError() {
    if (elements.errorState) {
      elements.errorState.hidden =
        true;
    }
  }

  // ==========================================================
  // HTML SECURITY
  // ==========================================================

  function escapeHtml(value) {
    if (
      typeof TO.escapeHtml ===
      "function"
    ) {
      return TO.escapeHtml(value);
    }

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ==========================================================
  // ПУБЛИЧНЫЙ API СТРАНИЦЫ
  // ==========================================================

  window.TajikOpportunitiesHome = {
    reload: loadPosts,

    reset: resetFilters,

    search(value) {
      state.search = String(
        value || ""
      ).trim();

      if (elements.searchInput) {
        elements.searchInput.value =
          state.search;
      }

      updateSearchButton();
      applyFilters();
      updateUrl();
    },

    category(value) {
      state.category =
        String(value || "all");

      updateCategoryButtons();
      applyFilters();
      updateUrl();
    },

    sort(value) {
      if (
        value !== "oldest" &&
        value !== "newest"
      ) {
        value = "newest";
      }

      state.sort = value;

      if (elements.sortSelect) {
        elements.sortSelect.value =
          value;
      }

      applyFilters();
      updateUrl();
    },

    getState: () => ({
      posts: [...state.posts],
      filteredPosts: [
        ...state.filteredPosts,
      ],
      search: state.search,
      category: state.category,
      sort: state.sort,
      loading: state.loading,
    }),
  };
})();
