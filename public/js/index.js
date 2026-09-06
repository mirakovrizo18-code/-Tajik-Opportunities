(() => {
  "use strict";

  const API_URL = "/api/publications";
  const PREVIEW_LENGTH = 220;

  let allPosts = [];
  let filteredPosts = [];

  let currentCategory = "";
  let currentSearch = "";
  let currentSort = "newest";

  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const categoryButtons = document.querySelectorAll("[data-category]");
  const sortSelect = document.getElementById("sortSelect");
  const resultsInfo = document.getElementById("resultsInfo");
  const resetFilters = document.getElementById("resetFilters");
  const loadingState = document.getElementById("loadingState");
  const postsGrid = document.getElementById("postsGrid");
  const emptyState = document.getElementById("emptyState");
  const emptyReset = document.getElementById("emptyReset");
  const errorState = document.getElementById("errorState");
  const retryButton = document.getElementById("retryButton");

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(value) {
    return String(value ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\u00a0/g, " ")
      .trim();
  }

  function formatContent(value) {
    const text = normalizeText(value);

    if (!text) return "";

    return escapeHtml(text)
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n/g, "<br>");
  }

  function truncateText(value, maxLength = PREVIEW_LENGTH) {
    const text = normalizeText(value);

    if (text.length <= maxLength) {
      return text;
    }

    const shortened = text.slice(0, maxLength);
    const lastSpace = shortened.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.7) {
      return shortened.slice(0, lastSpace).trim() + "…";
    }

    return shortened.trim() + "…";
  }

  function formatDate(value) {
    if (!value) return "";

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

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("ru-RU").format(
      Number(value || 0)
    );
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
      "Возможности": "🎁",
      "Объявления": "📢",
      "Услуги": "🛠️",
      "Идеи и проекты": "💡",
      "Стартапы": "🚀",
      "Полезное": "📚",
      "Товары": "🛍️",
      "Другое": "✨"
    };

    return icons[category] || "✨";
  }

  function getCategoryClass(category) {
    return String(category || "other")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "other";
  }

  function showElement(element) {
    element?.classList.remove("hidden");
  }

  function hideElement(element) {
    element?.classList.add("hidden");
  }

  function showLoading() {
    showElement(loadingState);
    hideElement(errorState);
    hideElement(emptyState);
    hideElement(postsGrid);
  }

  function showError(message) {
    hideElement(loadingState);
    hideElement(emptyState);
    hideElement(postsGrid);

    showElement(errorState);

    if (resultsInfo) {
      resultsInfo.textContent =
        message || "Не удалось загрузить публикации.";
    }
  }

  function showEmpty() {
    hideElement(loadingState);
    hideElement(errorState);

    showElement(emptyState);
    showElement(postsGrid);
  }

  function normalizePost(post) {
    const normalized = {
      ...post,

      id:
        post.id ??
        post.publication_id ??
        post.post_id,

      title:
        post.title ||
        post.name ||
        "Без заголовка",

      content:
        post.content ||
        post.description ||
        post.text ||
        "",

      category:
        post.category ||
        post.type ||
        "Другое",

      author_name:
        post.author_name ||
        post.user_name ||
        post.name_author ||
        "",

      author_username:
        post.author_username ||
        post.username ||
        "",

      author_avatar:
        post.author_avatar ||
        post.avatar_url ||
        post.avatar ||
        "",

      published_at:
        post.published_at ||
        post.created_at ||
        post.date ||
        null,

      image_url:
        post.image_url ||
        post.cover_url ||
        post.image ||
        "",

      link_url:
        post.link_url ||
        post.source_url ||
        post.url ||
        "",

      country:
        post.country ||
        "",

      city:
        post.city ||
        "",

      location:
        post.location ||
        "",

      views_count:
        post.views_count ??
        post.views ??
        0,

      likes_count:
        post.likes_count ??
        post.likes ??
        0,

      comments_count:
        post.comments_count ??
        post.comments ??
        0,

      shares_count:
        post.shares_count ??
        post.shares ??
        0,

      saves_count:
        post.saves_count ??
        post.saves ??
        0,

      saved:
        Boolean(
          post.saved ??
          post.is_saved ??
          false
        ),

      liked:
        Boolean(
          post.liked ??
          post.is_liked ??
          false
        ),

      tags:
        Array.isArray(post.tags)
          ? post.tags
          : []
    };

    return normalized;
  }

  async function loadPosts() {
    showLoading();

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        credentials: "same-origin",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const posts =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.posts)
            ? data.posts
            : Array.isArray(data?.publications)
              ? data.publications
              : Array.isArray(data?.items)
                ? data.items
                : [];

      allPosts = posts.map(normalizePost);

      hideElement(loadingState);

      applyFilters();

    } catch (error) {
      console.error(
        "Failed to load publications:",
        error
      );

      showError(
        "Не удалось загрузить публикации. Попробуйте ещё раз."
      );
    }
  }

  function applyFilters() {
    const search = currentSearch.trim().toLowerCase();

    filteredPosts = allPosts.filter(post => {
      const category = String(
        post.category || ""
      ).trim();

      const categoryMatches =
        !currentCategory ||
        currentCategory === "all" ||
        category === currentCategory;

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
        post.author_name,
        post.author_username,
        post.country,
        post.city,
        post.location,
        ...post.tags
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

  function getTime(value) {
    if (!value) return 0;

    const time = new Date(value).getTime();

    return Number.isNaN(time)
      ? 0
      : time;
  }

  function sortPosts() {
    filteredPosts.sort((a, b) => {
      if (currentSort === "popular") {
        return (
          Number(b.views_count || 0) -
          Number(a.views_count || 0)
        );
      }

      if (currentSort === "likes") {
        return (
          Number(b.likes_count || 0) -
          Number(a.likes_count || 0)
        );
      }

      if (currentSort === "oldest") {
        return (
          getTime(a.published_at) -
          getTime(b.published_at)
        );
      }

      return (
        getTime(b.published_at) -
        getTime(a.published_at)
      );
    });
  }

  function renderPosts() {
    if (!postsGrid) return;

    postsGrid.innerHTML = "";

    if (!filteredPosts.length) {
      showEmpty();
      return;
    }

    hideElement(emptyState);
    showElement(postsGrid);

    const fragment =
      document.createDocumentFragment();

    filteredPosts.forEach(post => {
      fragment.appendChild(
        createPostCard(post)
      );
    });

    postsGrid.appendChild(fragment);
  }

  function createPostCard(post) {
    const article = document.createElement("article");

    article.className = "post-card";

    if (post.id !== undefined && post.id !== null) {
      article.dataset.postId = post.id;
    }

    const category = String(
      post.category || "Другое"
    );

    const categoryIcon =
      getCategoryIcon(category);

    const categoryClass =
      getCategoryClass(category);

    const title =
      escapeHtml(post.title);

    const rawContent =
      normalizeText(post.content);

    const preview =
      truncateText(rawContent);

    const hasLongContent =
      rawContent.length > PREVIEW_LENGTH;

    const date =
      formatDate(post.published_at);

    const dateTime =
      formatDateTime(post.published_at);

    const imageUrl =
      String(post.image_url || "").trim();

    const linkUrl =
      String(post.link_url || "").trim();

    const authorName =
      String(post.author_name || "").trim();

    const authorUsername =
      String(post.author_username || "")
        .replace(/^@/, "")
        .trim();

    const authorAvatar =
      String(post.author_avatar || "").trim();

    const postId =
      escapeHtml(post.id ?? "");

    const safePostUrl =
      `/post.html?id=${encodeURIComponent(
        post.id ?? ""
      )}`;

    const shareUrl =
      `${window.location.origin}${safePostUrl}`;

    const authorHtml =
      authorName || authorUsername
        ? `
          <div class="post-author">

            <div class="post-author-avatar">

              ${
                authorAvatar
                  ? `
                    <img
                      src="${escapeHtml(authorAvatar)}"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    >
                  `
                  : "👤"
              }

            </div>

            <div class="post-author-info">

              ${
                authorName
                  ? `
                    <strong>
                      ${escapeHtml(authorName)}
                    </strong>
                  `
                  : ""
              }

              ${
                authorUsername
                  ? `
                    <span>
                      @${escapeHtml(authorUsername)}
                    </span>
                  `
                  : ""
              }

            </div>

          </div>
        `
        : "";

    const imageHtml =
      imageUrl &&
      /^https?:\/\//i.test(imageUrl)
        ? `
          <div class="post-card-image">

            <img
              src="${escapeHtml(imageUrl)}"
              alt="${title}"
              loading="lazy"
              decoding="async"
              onerror="
                this.parentElement.classList.add('image-error');
                this.style.display='none';
              "
            >

          </div>
        `
        : "";

    const moreButtonHtml =
      hasLongContent
        ? `
          <button
            type="button"
            class="post-card-link post-card-more"
            aria-expanded="false"
          >
            <span class="post-card-more-text">
              Подробнее
            </span>

            <span
              class="post-card-more-icon"
              aria-hidden="true"
            >
              ↓
            </span>
          </button>
        `
        : "";

    const sourceButtonHtml =
      linkUrl &&
      /^https?:\/\//i.test(linkUrl)
        ? `
          <a
            href="${escapeHtml(linkUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            class="post-card-link post-card-source"
          >
            <span>
              Перейти к источнику
            </span>

            <span aria-hidden="true">
              ↗
            </span>
          </a>
        `
        : "";

    article.innerHTML = `
      ${imageHtml}

      <div class="post-card-content">

        <div class="post-card-meta">

          <span
            class="post-category post-category-${escapeHtml(
              categoryClass
            )}"
          >

            <span
              class="post-category-icon"
              aria-hidden="true"
            >
              ${categoryIcon}
            </span>

            <span>
              ${escapeHtml(category)}
            </span>

          </span>

          ${
            date
              ? `
                <time
                  datetime="${escapeHtml(
                    post.published_at || ""
                  )}"
                  title="${escapeHtml(dateTime)}"
                >
                  ${escapeHtml(date)}
                </time>
              `
              : ""
          }

        </div>

        ${authorHtml}

        <h3 class="post-card-title">
          ${title}
        </h3>

        <div class="post-card-text">

          <p class="post-card-excerpt">
            ${escapeHtml(preview)}
          </p>

          ${
            hasLongContent
              ? `
                <div
                  class="post-card-full-content hidden"
                  aria-hidden="true"
                >
                  <div class="post-card-full-inner">
                    ${formatContent(rawContent)}
                  </div>
                </div>
              `
              : ""
          }

        </div>

        ${
          post.country ||
          post.city ||
          post.location
            ? `
              <div class="post-location">

                ${
                  post.country
                    ? `
                      <span>
                        🌍
                        ${escapeHtml(post.country)}
                      </span>
                    `
                    : ""
                }

                ${
                  post.city
                    ? `
                      <span>
                        📍
                        ${escapeHtml(post.city)}
                      </span>
                    `
                    : ""
                }

                ${
                  !post.city && post.location
                    ? `
                      <span>
                        📍
                        ${escapeHtml(post.location)}
                      </span>
                    `
                    : ""
                }

              </div>
            `
            : ""
        }

        <div class="post-card-stats">

          <span>
            👁️
            ${formatNumber(post.views_count)}
          </span>

          <span>
            ❤️
            ${formatNumber(post.likes_count)}
          </span>

          <span>
            💬
            ${formatNumber(post.comments_count)}
          </span>

          <span>
            📤
            ${formatNumber(post.shares_count)}
          </span>

          <span>
            🔖
            ${formatNumber(post.saves_count)}
          </span>

        </div>

        <div class="post-card-interactions">

          <button
            type="button"
            class="post-interaction ${
              post.liked ? "active" : ""
            }"
            data-action="reaction"
            data-publication-id="${postId}"
            data-reaction="like"
          >
            ❤️
            <span>
              Нравится
            </span>
          </button>

          <a
            href="${safePostUrl}"
            class="post-interaction"
          >
            💬
            <span>
              Комментарии
            </span>
          </a>

          <button
            type="button"
            class="post-interaction"
            data-action="share"
            data-url="${escapeHtml(shareUrl)}"
            data-title="${title}"
          >
            📤
            <span>
              Поделиться
            </span>
          </button>

          <button
            type="button"
            class="post-interaction ${
              post.saved ? "active" : ""
            }"
            data-action="save"
            data-publication-id="${postId}"
          >
            🔖
            <span>
              ${
                post.saved
                  ? "Сохранено"
                  : "Сохранить"
              }
            </span>
          </button>

        </div>

        ${
          moreButtonHtml || sourceButtonHtml
            ? `
              <div class="post-card-footer">

                <div class="post-card-actions">
                  ${moreButtonHtml}
                  ${sourceButtonHtml}
                </div>

              </div>
            `
            : ""
        }

      </div>
    `;

    setupMoreButton(article);
    setupReactionButton(article, post);
    setupSaveButton(article, post);
    setupShareButton(article, post);

    return article;
  }

  function setupMoreButton(article) {
    const button =
      article.querySelector(
        ".post-card-more"
      );

    const content =
      article.querySelector(
        ".post-card-full-content"
      );

    if (!button || !content) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen =
        button.getAttribute(
          "aria-expanded"
        ) === "true";

      button.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );

      content.classList.toggle(
        "hidden",
        isOpen
      );

      content.setAttribute(
        "aria-hidden",
        String(isOpen)
      );

      const text =
        button.querySelector(
          ".post-card-more-text"
        );

      const icon =
        button.querySelector(
          ".post-card-more-icon"
        );

      if (text) {
        text.textContent =
          isOpen
            ? "Подробнее"
            : "Скрыть";
      }

      if (icon) {
        icon.textContent =
          isOpen
            ? "↓"
            : "↑";
      }
    });
  }

  async function setupReactionButton(article, post) {
    const button =
      article.querySelector(
        '[data-action="reaction"]'
      );

    if (!button || !post.id) {
      return;
    }

    button.addEventListener("click", async () => {
      if (button.disabled) {
        return;
      }

      button.disabled = true;

      try {
        const response = await fetch(
          "/api/publications/react",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json"
            },
            credentials:
              "same-origin",
            body: JSON.stringify({
              publication_id:
                post.id,
              reaction: "like",
              type: "like"
            })
          }
        );

        const data =
          await response.json().catch(
            () => ({})
          );

        if (!response.ok) {
          if (response.status === 401) {
            showToast(
              "Войдите в аккаунт, чтобы поставить реакцию."
            );
          } else {
            showToast(
              data?.error ||
              data?.message ||
              "Не удалось поставить реакцию."
            );
          }

          return;
        }

        post.liked =
          data?.liked ??
          data?.reacted ??
          true;

        if (
          data?.likes_count !== undefined
        ) {
          post.likes_count =
            data.likes_count;
        } else if (post.liked) {
          post.likes_count =
            Number(post.likes_count || 0) + 1;
        }

        button.classList.toggle(
          "active",
          Boolean(post.liked)
        );

        updateCardStats(
          article,
          post
        );

      } catch (error) {
        console.error(
          "Reaction error:",
          error
        );

        showToast(
          "Ошибка соединения. Попробуйте ещё раз."
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  async function setupSaveButton(article, post) {
    const button =
      article.querySelector(
        '[data-action="save"]'
      );

    if (!button || !post.id) {
      return;
    }

    button.addEventListener("click", async () => {
      if (button.disabled) {
        return;
      }

      button.disabled = true;

      try {
        const newSaved =
          !Boolean(post.saved);

        const response =
          await fetch(
            "/api/publications/save",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Accept:
                  "application/json"
              },
              credentials:
                "same-origin",
              body: JSON.stringify({
                publication_id:
                  post.id,
                saved:
                  newSaved,
                save:
                  newSaved
              })
            }
          );

        const data =
          await response.json().catch(
            () => ({})
          );

        if (!response.ok) {
          if (response.status === 401) {
            showToast(
              "Войдите в аккаунт, чтобы сохранять публикации."
            );
          } else {
            showToast(
              data?.error ||
              data?.message ||
              "Не удалось сохранить публикацию."
            );
          }

          return;
        }

        post.saved =
          data?.saved ??
          data?.is_saved ??
          newSaved;

        if (
          data?.saves_count !== undefined
        ) {
          post.saves_count =
            data.saves_count;
        } else {
          post.saves_count =
            Math.max(
              0,
              Number(post.saves_count || 0) +
                (post.saved ? 1 : -1)
            );
        }

        button.classList.toggle(
          "active",
          Boolean(post.saved)
        );

        const label =
          button.querySelector("span");

        if (label) {
          label.textContent =
            post.saved
              ? "Сохранено"
              : "Сохранить";
        }

        updateCardStats(
          article,
          post
        );

        showToast(
          post.saved
            ? "Публикация сохранена."
            : "Публикация удалена из сохранённых."
        );

      } catch (error) {
        console.error(
          "Save error:",
          error
        );

        showToast(
          "Ошибка соединения. Попробуйте ещё раз."
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  async function setupShareButton(article, post) {
    const button =
      article.querySelector(
        '[data-action="share"]'
      );

    if (!button || !post.id) {
      return;
    }

    button.addEventListener("click", async () => {
      const url =
        button.dataset.url ||
        `${location.origin}/post.html?id=${encodeURIComponent(
          post.id
        )}`;

      const title =
        post.title ||
        "Tajik Opportunities";

      try {
        if (
          navigator.share
        ) {
          await navigator.share({
            title,
            text:
              "Посмотрите эту публикацию на Tajik Opportunities",
            url
          });
        } else if (
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            url
          );

          showToast(
            "Ссылка скопирована."
          );
        } else {
          window.prompt(
            "Скопируйте ссылку:",
            url
          );
        }

        try {
          const response =
            await fetch(
              "/api/publications/share",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                  Accept:
                    "application/json"
                },
                credentials:
                  "same-origin",
                body: JSON.stringify({
                  publication_id:
                    post.id
                })
              }
            );

          if (response.ok) {
            const data =
              await response.json().catch(
                () => ({})
              );

            if (
              data?.shares_count !==
              undefined
            ) {
              post.shares_count =
                data.shares_count;

              updateCardStats(
                article,
                post
              );
            } else {
              post.shares_count =
                Number(
                  post.shares_count || 0
                ) + 1;

              updateCardStats(
                article,
                post
              );
            }
          }

        } catch (shareError) {
          console.warn(
            "Share counter error:",
            shareError
          );
        }

      } catch (error) {
        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "Share error:",
            error
          );
        }
      }
    });
  }

  function updateCardStats(article, post) {
    const stats =
      article.querySelectorAll(
        ".post-card-stats span"
      );

    if (stats.length >= 5) {
      stats[0].innerHTML =
        `👁️ ${formatNumber(post.views_count)}`;

      stats[1].innerHTML =
        `❤️ ${formatNumber(post.likes_count)}`;

      stats[2].innerHTML =
        `💬 ${formatNumber(post.comments_count)}`;

      stats[3].innerHTML =
        `📤 ${formatNumber(post.shares_count)}`;

      stats[4].innerHTML =
        `🔖 ${formatNumber(post.saves_count)}`;
    }
  }

  function showToast(message) {
    const toast =
      document.getElementById("toast");

    if (!toast) {
      return;
    }

    toast.textContent =
      String(message || "");

    toast.classList.add("show");

    clearTimeout(
      showToast.timer
    );

    showToast.timer =
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2800);
  }

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
      Boolean(currentCategory) ||
      currentSearch.trim() !== "" ||
      currentSort !== "newest";

    resetFilters?.classList.toggle(
      "hidden",
      !filtersActive
    );
  }

  function updateFilterButtons() {
    categoryButtons.forEach(button => {
      const category =
        button.getAttribute(
          "data-category"
        );

      button.classList.toggle(
        "active",
        category ===
          (currentCategory || "all")
      );
    });
  }

  function handleSearch() {
    currentSearch =
      searchInput?.value || "";

    clearSearch?.classList.toggle(
      "hidden",
      !currentSearch
    );

    applyFilters();
  }

  function clearSearchInput() {
    if (searchInput) {
      searchInput.value = "";
    }

    currentSearch = "";

    clearSearch?.classList.add(
      "hidden"
    );

    applyFilters();

    searchInput?.focus();
  }

  function resetAllFilters() {
    currentCategory = "";
    currentSearch = "";
    currentSort = "newest";

    if (searchInput) {
      searchInput.value = "";
    }

    if (sortSelect) {
      sortSelect.value = "newest";
    }

    clearSearch?.classList.add(
      "hidden"
    );

    applyFilters();
  }

  function initEvents() {
    searchInput?.addEventListener(
      "input",
      handleSearch
    );

    clearSearch?.addEventListener(
      "click",
      clearSearchInput
    );

    categoryButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          currentCategory =
            button.getAttribute(
              "data-category"
            ) || "";

          if (
            currentCategory ===
            "all"
          ) {
            currentCategory = "";
          }

          applyFilters();
        }
      );
    });

    sortSelect?.addEventListener(
      "change",
      () => {
        currentSort =
          sortSelect.value ||
          "newest";

        applyFilters();
      }
    );

    resetFilters?.addEventListener(
      "click",
      resetAllFilters
    );

    emptyReset?.addEventListener(
      "click",
      resetAllFilters
    );

    retryButton?.addEventListener(
      "click",
      loadPosts
    );

    window.addEventListener(
      "to:search",
      event => {
        currentSearch =
          event.detail?.query ||
          "";

        if (searchInput) {
          searchInput.value =
            currentSearch;
        }

        clearSearch?.classList.toggle(
          "hidden",
          !currentSearch
        );

        applyFilters();
      }
    );

    window.addEventListener(
      "to:category-change",
      event => {
        currentCategory =
          event.detail?.category ||
          "";

        if (
          currentCategory ===
          "all"
        ) {
          currentCategory = "";
        }

        applyFilters();
      }
    );

    window.addEventListener(
      "to:filters-change",
      () => {
        applyFilters();
      }
    );
  }

  function readUrlFilters() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const category =
      params.get("category");

    if (category) {
      currentCategory =
        category === "all"
          ? ""
          : category;
    }

    const search =
      params.get("search");

    if (search) {
      currentSearch =
        search;

      if (searchInput) {
        searchInput.value =
          search;
      }

      clearSearch?.classList.remove(
        "hidden"
      );
    }

    const sort =
      params.get("sort");

    if (
      sort === "newest" ||
      sort === "oldest" ||
      sort === "popular" ||
      sort === "likes"
    ) {
      currentSort = sort;

      if (sortSelect) {
        sortSelect.value = sort;
      }
    }

    updateFilterButtons();
  }

  function init() {
    initEvents();
    readUrlFilters();
    loadPosts();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
