/* ============================================================
   TAJIK OPPORTUNITIES
   Homepage publications
   ============================================================ */

(() => {
  "use strict";

  const API_URL = "/api/posts";

  let allPosts = [];
  let filteredPosts = [];

  let currentCategory = "all";
  let currentSearch = "";
  let currentSort = "newest";

  /* ==========================================================
     DOM
     ========================================================== */

  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");

  const categoryButtons = document.querySelectorAll(
    ".category-chip"
  );

  const sortSelect = document.getElementById("sortSelect");

  const resultsInfo = document.getElementById(
    "resultsInfo"
  );

  const resetFilters = document.getElementById(
    "resetFilters"
  );

  const loadingState = document.getElementById(
    "loadingState"
  );

  const postsGrid = document.getElementById(
    "postsGrid"
  );

  const emptyState = document.getElementById(
    "emptyState"
  );

  const emptyReset = document.getElementById(
    "emptyReset"
  );

  const errorState = document.getElementById(
    "errorState"
  );

  const retryButton = document.getElementById(
    "retryButton"
  );

  /* ==========================================================
     HELPERS
     ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function truncateText(value, maxLength = 180) {
    const text = String(value ?? "").trim();

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength).trim() + "…";
  }

  function getCategoryIcon(category) {
    const icons = {
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

    return icons[category] || "✨";
  }

  function showElement(element) {
    if (!element) return;

    element.classList.remove("hidden");
  }

  function hideElement(element) {
    if (!element) return;

    element.classList.add("hidden");
  }

  /* ==========================================================
     LOADING / ERROR / EMPTY
     ========================================================== */

  function showLoading() {
    showElement(loadingState);
    hideElement(errorState);
    hideElement(emptyState);
    hideElement(postsGrid);
  }

  function hideLoading() {
    hideElement(loadingState);
    showElement(postsGrid);
  }

  function showError() {
    hideElement(loadingState);
    hideElement(emptyState);
    hideElement(postsGrid);
    showElement(errorState);

    if (resultsInfo) {
      resultsInfo.textContent =
        "Не удалось загрузить публикации.";
    }
  }

  function showEmpty() {
    hideElement(loadingState);
    hideElement(errorState);
    showElement(emptyState);
    showElement(postsGrid);
  }

  /* ==========================================================
     FETCH POSTS
     ========================================================== */

  async function loadPosts() {
    showLoading();

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.posts)) {
        throw new Error(
          "Некорректный ответ API."
        );
      }

      allPosts = data.posts;

      hideLoading();

      applyFilters();
    } catch (error) {
      console.error(
        "Failed to load posts:",
        error
      );

      showError();
    }
  }

  /* ==========================================================
     FILTERS
     ========================================================== */

  function applyFilters() {
    const search = currentSearch
      .trim()
      .toLowerCase();

    filteredPosts = allPosts.filter((post) => {
      const categoryMatches =
        currentCategory === "all" ||
        String(post.category || "") ===
          currentCategory;

      if (!categoryMatches) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableText = [
        post.title,
        post.content,
        post.category,
        post.author_name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });

    sortPosts();

    renderPosts();
    updateResultsInfo();
    updateFilterButtons();
  }

  /* ==========================================================
     SORT
     ========================================================== */

  function sortPosts() {
    filteredPosts.sort((a, b) => {
      const dateA = new Date(
        a.published_at || 0
      ).getTime();

      const dateB = new Date(
        b.published_at || 0
      ).getTime();

      if (currentSort === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }

  /* ==========================================================
     RENDER POSTS
     ========================================================== */

  function renderPosts() {
    if (!postsGrid) {
      return;
    }

    postsGrid.innerHTML = "";

    if (!filteredPosts.length) {
      showEmpty();
      return;
    }

    hideElement(emptyState);
    showElement(postsGrid);

    const fragment =
      document.createDocumentFragment();

    filteredPosts.forEach((post) => {
      const card = createPostCard(post);

      fragment.appendChild(card);
    });

    postsGrid.appendChild(fragment);
  }

  /* ==========================================================
     POST CARD
     ========================================================== */

  function createPostCard(post) {
    const article =
      document.createElement("article");

    article.className = "post-card";

    const category =
      escapeHtml(post.category || "Другое");

    const categoryIcon =
      getCategoryIcon(post.category);

    const title =
      escapeHtml(post.title || "Без заголовка");

    const content =
      escapeHtml(
        truncateText(post.content || "")
      );

    const date =
      escapeHtml(
        formatDate(post.published_at)
      );

    const imageUrl =
      typeof post.image_url === "string"
        ? post.image_url.trim()
        : "";

    const linkUrl =
      typeof post.link_url === "string"
        ? post.link_url.trim()
        : "";

    let imageHtml = "";

    if (imageUrl) {
      imageHtml = `
        <div class="post-card-image">
          <img
            src="${escapeHtml(imageUrl)}"
            alt="${title}"
            loading="lazy"
            onerror="this.parentElement.classList.add('image-error')"
          >
        </div>
      `;
    }

    const externalLinkHtml = linkUrl
      ? `
          <a
            href="${escapeHtml(linkUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="post-card-link"
          >
            Подробнее
            <span>↗</span>
          </a>
        `
      : `
          <a
            href="/post.html?id=${encodeURIComponent(
              post.id || ""
            )}"
            class="post-card-link"
          >
            Читать
            <span>→</span>
          </a>
        `;

    article.innerHTML = `
      ${imageHtml}

      <div class="post-card-content">

        <div class="post-card-meta">

          <span class="post-category">
            ${categoryIcon}
            ${category}
          </span>

          ${
            date
              ? `
                <time datetime="${escapeHtml(
                  post.published_at || ""
                )}">
                  ${date}
                </time>
              `
              : ""
          }

        </div>

        <h3 class="post-card-title">
          ${title}
        </h3>

        <p class="post-card-excerpt">
          ${content}
        </p>

        <div class="post-card-footer">
          ${externalLinkHtml}
        </div>

      </div>
    `;

    return article;
  }

  /* ==========================================================
     RESULTS INFO
     ========================================================== */

  function updateResultsInfo() {
    if (!resultsInfo) {
      return;
    }

    const count =
      filteredPosts.length;

    if (count === 0) {
      resultsInfo.textContent =
        "Публикаций не найдено.";
    } else if (count === 1) {
      resultsInfo.textContent =
        "Найдена 1 публикация.";
    } else if (
      count >= 2 &&
      count <= 4
    ) {
      resultsInfo.textContent =
        `Найдено ${count} публикации.`;
    } else {
      resultsInfo.textContent =
        `Найдено ${count} публикаций.`;
    }

    const filtersActive =
      currentCategory !== "all" ||
      currentSearch.trim() !== "" ||
      currentSort !== "newest";

    if (resetFilters) {
      resetFilters.classList.toggle(
        "hidden",
        !filtersActive
      );
    }
  }

  /* ==========================================================
     CATEGORY BUTTONS
     ========================================================== */

  function updateFilterButtons() {
    categoryButtons.forEach((button) => {
      const category =
        button.getAttribute(
          "data-category"
        );

      button.classList.toggle(
        "active",
        category === currentCategory
      );
    });
  }

  /* ==========================================================
     SEARCH
     ========================================================== */

  function handleSearch() {
    currentSearch =
      searchInput
        ? searchInput.value
        : "";

    if (clearSearch) {
      clearSearch.classList.toggle(
        "hidden",
        currentSearch.length === 0
      );
    }

    applyFilters();
  }

  function clearSearchInput() {
    if (searchInput) {
      searchInput.value = "";
    }

    currentSearch = "";

    if (clearSearch) {
      clearSearch.classList.add(
        "hidden"
      );
    }

    applyFilters();

    if (searchInput) {
      searchInput.focus();
    }
  }

  /* ==========================================================
     RESET FILTERS
     ========================================================== */

  function resetAllFilters() {
    currentCategory = "all";
    currentSearch = "";
    currentSort = "newest";

    if (searchInput) {
      searchInput.value = "";
    }

    if (sortSelect) {
      sortSelect.value = "newest";
    }

    if (clearSearch) {
      clearSearch.classList.add(
        "hidden"
      );
    }

    applyFilters();
  }

  /* ==========================================================
     EVENTS
     ========================================================== */

  function initEvents() {
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        handleSearch
      );
    }

    if (clearSearch) {
      clearSearch.addEventListener(
        "click",
        clearSearchInput
      );
    }

    categoryButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          currentCategory =
            button.getAttribute(
              "data-category"
            ) || "all";

          applyFilters();
        }
      );
    });

    if (sortSelect) {
      sortSelect.addEventListener(
        "change",
        () => {
          currentSort =
            sortSelect.value || "newest";

          applyFilters();
        }
      );
    }

    if (resetFilters) {
      resetFilters.addEventListener(
        "click",
        resetAllFilters
      );
    }

    if (emptyReset) {
      emptyReset.addEventListener(
        "click",
        resetAllFilters
      );
    }

    if (retryButton) {
      retryButton.addEventListener(
        "click",
        loadPosts
      );
    }
  }

  /* ==========================================================
     URL FILTER
     ========================================================== */

  function readUrlFilters() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const category =
      params.get("category");

    if (
      category &&
      [...categoryButtons].some(
        (button) =>
          button.getAttribute(
            "data-category"
          ) === category
      )
    ) {
      currentCategory = category;
    }

    const search =
      params.get("search");

    if (search) {
      currentSearch = search;

      if (searchInput) {
        searchInput.value = search;
      }

      if (clearSearch) {
        clearSearch.classList.remove(
          "hidden"
        );
      }
    }

    updateFilterButtons();
  }

  /* ==========================================================
     INIT
     ========================================================== */

  function init() {
    initEvents();
    readUrlFilters();
    loadPosts();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
