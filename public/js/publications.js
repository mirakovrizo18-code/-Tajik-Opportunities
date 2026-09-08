/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   PUBLICATIONS FRONTEND MODULE
   File: public/js/publications.js
   Version: 2026.09.09
   ============================================================ */

"use strict";

(() => {
  const CONFIG = Object.freeze({
    selectors: {
      list: "[data-publications]",
      card: "[data-publication-id]",
      search: "[data-publication-search]",
      category: "[data-publication-category]",
      type: "[data-publication-type]",
      status: "[data-publication-status]",
      sort: "[data-publication-sort]",
      limit: "[data-publication-limit]",
      pagination: "[data-publication-pagination]",
      empty: "[data-publications-empty]",
      loading: "[data-publications-loading]",
      resultCount: "[data-publication-result-count]",
      createForm: "[data-publication-form]",
      detail: "[data-publication-detail]"
    },

    page: 1,
    limit: 12,
    sort: "latest",

    defaultImage:
      "/assets/images/publication-placeholder.svg",

    debounce: 350,

    types: {
      opportunity: "Возможность",
      job: "Вакансия",
      education: "Образование",
      internship: "Стажировка",
      grant: "Грант",
      competition: "Конкурс",
      event: "Мероприятие",
      business: "Бизнес",
      news: "Новости",
      other: "Другое"
    },

    employment: {
      full_time: "Полная занятость",
      part_time: "Частичная занятость",
      temporary: "Временная",
      contract: "Контракт",
      internship: "Стажировка",
      volunteer: "Волонтёрство",
      freelance: "Фриланс",
      remote: "Удалённая работа"
    }
  });


  /* ==========================================================
     STATE
     ========================================================== */

  const state = {
    page: CONFIG.page,
    limit: CONFIG.limit,

    search: "",
    category: "",
    type: "",
    status: "published",
    sort: CONFIG.sort,

    publications: [],
    total: 0,
    pages: 0,

    loading: false,

    activeView: "grid",

    selectedPublication: null,

    favoriteIds: new Set(),

    viewedIds: new Set(),

    reactionState: new Map(),

    initialized: false,

    searchTimer: null
  };


  /* ==========================================================
     HELPERS
     ========================================================== */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }


  function $$(selector, root = document) {
    return Array.from(
      root.querySelectorAll(selector)
    );
  }


  function escapeHtml(value) {
    const div =
      document.createElement("div");

    div.textContent =
      value == null
        ? ""
        : String(value);

    return div.innerHTML;
  }


  function escapeAttr(value) {
    return escapeHtml(value)
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function number(value) {
    const n =
      Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  }


  function bigNumber(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "0";
    }

    const str =
      String(value).trim();

    if (
      !/^\d+$/.test(str)
    ) {
      return "0";
    }

    return str.replace(
      /^0+(?=\d)/,
      ""
    );
  }


  function formatNumber(value) {
    const str =
      bigNumber(value);

    if (
      str.length <= 3
    ) {
      return str;
    }

    let result = "";
    let count = 0;

    for (
      let i = str.length - 1;
      i >= 0;
      i--
    ) {
      result =
        str[i] + result;

      count++;

      if (
        count % 3 === 0 &&
        i !== 0
      ) {
        result =
          " " + result;
      }
    }

    return result;
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
      return String(value);
    }

    return new Intl.DateTimeFormat(
      document.documentElement.lang === "tg"
        ? "tg-TJ"
        : "ru-RU",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    ).format(date);
  }


  function relativeDate(value) {
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
      return "";
    }

    const seconds =
      Math.floor(
        (Date.now() -
          date.getTime()) /
          1000
      );

    if (
      seconds < 60
    ) {
      return "только что";
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (
      minutes < 60
    ) {
      return `${minutes} мин. назад`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (
      hours < 24
    ) {
      return `${hours} ч. назад`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (
      days < 30
    ) {
      return `${days} дн. назад`;
    }

    return formatDate(value);
  }


  function toast(
    message,
    type = "info"
  ) {
    if (
      typeof window.showToast ===
      "function"
    ) {
      window.showToast(
        message,
        type
      );

      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        "to:toast",
        {
          detail: {
            message,
            type
          }
        }
      )
    );
  }


  function publicationId(publication) {
    return (
      publication?.id ||
      publication?.publication_id ||
      publication?.public_id ||
      ""
    );
  }


  function publicationTitle(publication) {
    return (
      publication?.title ||
      publication?.name ||
      "Без названия"
    );
  }


  function publicationDescription(
    publication
  ) {
    return (
      publication?.short_description ||
      publication?.description ||
      publication?.excerpt ||
      publication?.content ||
      ""
    );
  }


  function publicationType(
    publication
  ) {
    return (
      publication?.type ||
      publication?.publication_type ||
      "other"
    );
  }


  function categoryName(
    publication
  ) {
    return (
      publication?.category_name ||
      publication?.category?.name ||
      ""
    );
  }


  function imageUrl(
    publication
  ) {
    return (
      publication?.cover_url ||
      publication?.image_url ||
      publication?.thumbnail_url ||
      publication?.images?.[0]?.url ||
      CONFIG.defaultImage
    );
  }


  function authorName(
    publication
  ) {
    return (
      publication?.author_name ||
      publication?.organization_name ||
      publication?.company_name ||
      publication?.username ||
      "Пользователь"
    );
  }


  function rating(
    publication
  ) {
    return number(
      publication?.rating_average ??
      publication?.average_rating ??
      publication?.rating ??
      0
    );
  }


  function counter(
    publication,
    ...keys
  ) {
    for (
      const key of keys
    ) {
      if (
        publication?.[key] !==
        undefined
      ) {
        return bigNumber(
          publication[key]
        );
      }
    }

    return "0";
  }


  function statusLabel(status) {
    const labels = {
      draft: "Черновик",
      pending: "На проверке",
      published: "Опубликовано",
      rejected: "Отклонено",
      hidden: "Скрыто",
      deleted: "Удалено"
    };

    return (
      labels[status] ||
      status ||
      ""
    );
  }


  function getCurrentReaction(
    id
  ) {
    return (
      state.reactionState.get(id) ||
      null
    );
  }


  /* ==========================================================
     STAR RATING
     ========================================================== */

  function renderStars(value) {
    const ratingValue =
      Math.max(
        0,
        Math.min(
          5,
          number(value)
        )
      );

    let html =
      `<div class="to-publication-stars" aria-label="Рейтинг ${ratingValue.toFixed(1)} из 5">`;

    for (
      let i = 1;
      i <= 5;
      i++
    ) {
      html += `
        <span
          class="to-publication-star${
            i <= Math.round(ratingValue)
              ? " is-active"
              : ""
          }"
          aria-hidden="true"
        >★</span>
      `;
    }

    html += "</div>";

    return html;
  }


  /* ==========================================================
     REACTION
     ========================================================== */

  function renderReactionButton(
    publication
  ) {
    const id =
      publicationId(
        publication
      );

    const current =
      getCurrentReaction(id);

    const count =
      counter(
        publication,
        "reactions_count",
        "reaction_count"
      );

    return `
      <button
        type="button"
        class="to-publication-reaction-button${
          current
            ? " is-active"
            : ""
        }"
        data-publication-reaction="${escapeAttr(id)}"
        aria-label="Реакции"
        aria-expanded="false"
      >
        <span>
          ${
            current === "love"
              ? "❤️"
              : current === "like"
              ? "👍"
              : "😊"
          }
        </span>

        <span>
          ${formatNumber(count)}
        </span>
      </button>

      <div
        class="to-publication-reaction-menu"
        data-publication-reaction-menu="${escapeAttr(id)}"
        hidden
      >
        ${renderReactionMenu(id)}
      </div>
    `;
  }


  function renderReactionMenu(
    id
  ) {
    const reactions = [
      ["like", "👍", "Нравится"],
      ["love", "❤️", "Любовь"],
      ["useful", "💡", "Полезно"],
      ["support", "🤝", "Поддержка"],
      ["interesting", "👀", "Интересно"],
      ["congratulations", "🎉", "Поздравляю"],
      ["sad", "😢", "Грустно"],
      ["angry", "😡", "Злюсь"],
      ["wow", "😮", "Вау"],
      ["celebrate", "🥳", "Праздную"],
      ["thanks", "🙏", "Спасибо"]
    ];

    return reactions
      .map(
        ([type, icon, label]) => `
          <button
            type="button"
            class="to-reaction-menu-item"
            data-publication-reaction-type="${escapeAttr(id)}"
            data-reaction-type="${escapeAttr(type)}"
            title="${escapeAttr(label)}"
          >
            <span>${icon}</span>
            <small>${escapeHtml(label)}</small>
          </button>
        `
      )
      .join("");
  }


  async function toggleReactionMenu(
    id
  ) {
    const menu =
      document.querySelector(
        `[data-publication-reaction-menu="${CSS.escape(id)}"]`
      );

    if (!menu) {
      return;
    }

    const willOpen =
      menu.hidden;

    $$(
      "[data-publication-reaction-menu]"
    ).forEach(item => {
      item.hidden = true;
    });

    menu.hidden =
      !willOpen;
  }


  async function react(
    id,
    reactionType
  ) {
    if (
      !id ||
      !reactionType
    ) {
      return;
    }

    try {
      const current =
        getCurrentReaction(id);

      if (
        current === reactionType
      ) {
        await window.API.reactions.remove(
          "publication",
          id,
          reactionType
        );

        state.reactionState.delete(
          id
        );

        toast(
          "Реакция удалена.",
          "success"
        );
      } else {
        await window.API.reactions.add(
          "publication",
          id,
          reactionType
        );

        state.reactionState.set(
          id,
          reactionType
        );

        toast(
          "Реакция добавлена.",
          "success"
        );
      }

      await load({
        keepPage: true
      });

    } catch (error) {
      console.error(
        "[TO Publications] Reaction:",
        error
      );

      toast(
        error.message ||
          "Не удалось изменить реакцию.",
        "error"
      );
    }
  }


  /* ==========================================================
     PUBLICATION CARD
     ========================================================== */

  function renderCard(
    publication
  ) {
    const id =
      publicationId(
        publication
      );

    const title =
      publicationTitle(
        publication
      );

    const description =
      publicationDescription(
        publication
      );

    const type =
      publicationType(
        publication
      );

    const category =
      categoryName(
        publication
      );

    const ratingValue =
      rating(
        publication
      );

    const views =
      counter(
        publication,
        "views_count",
        "views"
      );

    const likes =
      counter(
        publication,
        "likes_count",
        "likes"
      );

    const comments =
      counter(
        publication,
        "comments_count",
        "comments"
      );

    const reviews =
      counter(
        publication,
        "reviews_count",
        "review_count"
      );

    const shares =
      counter(
        publication,
        "shares_count",
        "shares"
      );

    const bookmarks =
      counter(
        publication,
        "bookmarks_count",
        "bookmarks"
      );

    const image =
      imageUrl(
        publication
      );

    const status =
      publication?.status ||
      "published";

    const featured =
      publication?.featured === true ||
      publication?.is_featured === true;

    const pinned =
      publication?.pinned === true ||
      publication?.is_pinned === true;

    const urgent =
      publication?.urgent === true ||
      publication?.is_urgent === true;

    const verified =
      publication?.verified === true ||
      publication?.is_verified === true;

    const saved =
      state.favoriteIds.has(id) ||
      publication?.is_bookmarked === true ||
      publication?.bookmarked === true;

    const location =
      publication?.location ||
      publication?.city ||
      "";

    const salary =
      publication?.salary ||
      publication?.salary_text ||
      "";

    const company =
      publication?.company_name ||
      publication?.organization_name ||
      "";

    const createdAt =
      publication?.created_at ||
      publication?.published_at;

    return `
      <article
        class="to-publication-card"
        data-publication-id="${escapeAttr(id)}"
        data-publication-type="${escapeAttr(type)}"
      >

        <div class="to-publication-image-wrap">

          <a
            href="/publication/${encodeURIComponent(id)}"
            class="to-publication-image-link"
            data-publication-open="${escapeAttr(id)}"
          >
            <img
              class="to-publication-image"
              src="${escapeAttr(image)}"
              alt="${escapeAttr(title)}"
              loading="lazy"
              decoding="async"
              onerror="this.src='${escapeAttr(
                CONFIG.defaultImage
              )}'"
            >
          </a>

          <div class="to-publication-badges">

            ${
              featured
                ? `
                  <span class="to-publication-badge is-featured">
                    ⭐ Рекомендуем
                  </span>
                `
                : ""
            }

            ${
              pinned
                ? `
                  <span class="to-publication-badge is-pinned">
                    📌 Закреплено
                  </span>
                `
                : ""
            }

            ${
              urgent
                ? `
                  <span class="to-publication-badge is-urgent">
                    🔥 Срочно
                  </span>
                `
                : ""
            }

            ${
              verified
                ? `
                  <span class="to-publication-badge is-verified">
                    ✓ Проверено
                  </span>
                `
                : ""
            }

          </div>

          <button
            type="button"
            class="to-publication-bookmark${
              saved
                ? " is-active"
                : ""
            }"
            data-publication-bookmark="${escapeAttr(id)}"
            aria-label="${
              saved
                ? "Удалить из избранного"
                : "Добавить в избранное"
            }"
            aria-pressed="${
              saved
                ? "true"
                : "false"
            }"
          >
            ${
              saved
                ? "🔖"
                : "☆"
            }
          </button>

        </div>


        <div class="to-publication-body">

          <div class="to-publication-topline">

            <span class="to-publication-type">
              ${escapeHtml(
                CONFIG.types[type] ||
                type
              )}
            </span>

            ${
              category
                ? `
                  <span class="to-publication-category">
                    ${escapeHtml(category)}
                  </span>
                `
                : ""
            }

          </div>


          <h3 class="to-publication-title">

            <a
              href="/publication/${encodeURIComponent(id)}"
              data-publication-open="${escapeAttr(id)}"
            >
              ${escapeHtml(title)}
            </a>

          </h3>


          <div class="to-publication-description">
            ${escapeHtml(
              truncate(
                description,
                180
              )
            )}
          </div>


          ${
            company
              ? `
                <div class="to-publication-company">
                  🏢
                  ${escapeHtml(company)}
                </div>
              `
              : ""
          }


          ${
            location
              ? `
                <div class="to-publication-location">
                  📍
                  ${escapeHtml(location)}
                </div>
              `
              : ""
          }


          ${
            salary
              ? `
                <div class="to-publication-salary">
                  💰
                  ${escapeHtml(salary)}
                </div>
              `
              : ""
          }


          <div class="to-publication-rating">

            ${renderStars(
              ratingValue
            )}

            <strong>
              ${ratingValue.toFixed(1)}
            </strong>

            <span>
              (${formatNumber(reviews)})
            </span>

          </div>


          <div class="to-publication-stats">

            <span title="Просмотры">
              👁
              ${formatNumber(views)}
            </span>

            <span title="Лайки">
              👍
              ${formatNumber(likes)}
            </span>

            <span title="Комментарии">
              💬
              ${formatNumber(comments)}
            </span>

            <span title="Поделились">
              ↗
              ${formatNumber(shares)}
            </span>

          </div>


          <div class="to-publication-footer">

            <div class="to-publication-author">

              <span class="to-publication-author-avatar">
                ${escapeHtml(
                  authorName(
                    publication
                  ).charAt(0).toUpperCase()
                )}
              </span>

              <span>
                ${escapeHtml(
                  authorName(
                    publication
                  )
                )}
              </span>

            </div>

            <time
              datetime="${escapeAttr(
                createdAt || ""
              )}"
              title="${escapeAttr(
                formatDate(createdAt)
              )}"
            >
              ${escapeHtml(
                relativeDate(createdAt)
              )}
            </time>

          </div>


          <div class="to-publication-actions">

            <button
              type="button"
              class="to-publication-action"
              data-publication-like="${escapeAttr(id)}"
            >
              👍
              <span>
                ${formatNumber(likes)}
              </span>
            </button>

            ${renderReactionButton(
              publication
            )}

            <button
              type="button"
              class="to-publication-action"
              data-publication-comments="${escapeAttr(id)}"
            >
              💬
              <span>
                ${formatNumber(comments)}
              </span>
            </button>

            <button
              type="button"
              class="to-publication-action"
              data-publication-share="${escapeAttr(id)}"
            >
              ↗
            </button>

            ${
              bookmarks
                ? `
                  <span class="to-publication-bookmark-count">
                    🔖
                    ${formatNumber(bookmarks)}
                  </span>
                `
                : ""
            }

          </div>

        </div>

      </article>
    `;
  }


  function truncate(
    text,
    max
  ) {
    const value =
      String(text || "").trim();

    if (
      value.length <= max
    ) {
      return value;
    }

    return (
      value.slice(
        0,
        max
      ).trimEnd() +
      "…"
    );
  }


  /* ==========================================================
     LOAD PUBLICATIONS
     ========================================================== */

  async function load(
    options = {}
  ) {
    const list =
      $(
        CONFIG.selectors.list
      );

    if (!list) {
      return null;
    }

    const keepPage =
      options.keepPage === true;

    if (!keepPage) {
      state.page =
        Math.max(
          1,
          state.page
        );
    }

    state.loading = true;

    renderLoading();

    try {
      const response =
        await window.API.publications.list({
          page:
            state.page,

          limit:
            state.limit,

          search:
            state.search || undefined,

          category:
            state.category || undefined,

          type:
            state.type || undefined,

          status:
            state.status || undefined,

          sort:
            state.sort
        });

      const data =
        response || {};

      state.publications =
        Array.isArray(data)
          ? data
          : (
              data.items ||
              data.publications ||
              data.results ||
              []
            );

      const pagination =
        data.pagination ||
        data.meta ||
        {};

      state.total =
        bigNumber(
          pagination.total ??
          data.total ??
          state.publications.length
        );

      state.pages =
        Number(
          pagination.total_pages ??
          pagination.pages ??
          data.pages ??
          Math.ceil(
            Number(state.total) /
            state.limit
          )
        );

      render();

      return data;

    } catch (error) {
      console.error(
        "[TO Publications] Load:",
        error
      );

      list.innerHTML = `
        <div class="to-publications-error">

          <div>
            ⚠️
          </div>

          <h3>
            Не удалось загрузить публикации
          </h3>

          <p>
            ${escapeHtml(
              error.message ||
              "Ошибка сервера."
            )}
          </p>

          <button
            type="button"
            data-publications-retry
          >
            Повторить
          </button>

        </div>
      `;

      toast(
        error.message ||
          "Не удалось загрузить публикации.",
        "error"
      );

      throw error;

    } finally {
      state.loading = false;
    }
  }


  function renderLoading() {
    const list =
      $(
        CONFIG.selectors.list
      );

    if (!list) {
      return;
    }

    list.innerHTML = `
      <div class="to-publications-loading">
        ${Array.from(
          {
            length: Math.min(
              6,
              state.limit
            )
          },
          () => `
            <div class="to-publication-skeleton">
              <div class="to-skeleton-image"></div>
              <div class="to-skeleton-content">
                <div class="to-skeleton-line"></div>
                <div class="to-skeleton-line"></div>
                <div class="to-skeleton-line short"></div>
              </div>
            </div>
          `
        ).join("")}
      </div>
    `;
  }


  function render() {
    const list =
      $(
        CONFIG.selectors.list
      );

    if (!list) {
      return;
    }

    list.classList.toggle(
      "is-list-view",
      state.activeView === "list"
    );

    list.classList.toggle(
      "is-grid-view",
      state.activeView === "grid"
    );

    if (
      !state.publications.length
    ) {
      list.innerHTML = `
        <div class="to-publications-empty">

          <div class="to-publications-empty-icon">
            🔎
          </div>

          <h3>
            Ничего не найдено
          </h3>

          <p>
            Попробуйте изменить поисковый запрос или фильтры.
          </p>

          <button
            type="button"
            data-publications-clear
          >
            Сбросить фильтры
          </button>

        </div>
      `;

      renderPagination();
      updateResultCount();

      return;
    }

    list.innerHTML =
      state.publications
        .map(
          publication =>
            renderCard(
              publication
            )
        )
        .join("");

    renderPagination();
    updateResultCount();
  }


  function updateResultCount() {
    $$(
      CONFIG.selectors.resultCount
    ).forEach(element => {
      element.textContent =
        formatNumber(
          state.total
        );
    });
  }


  /* ==========================================================
     PAGINATION
     ========================================================== */

  function renderPagination() {
    const container =
      $(
        CONFIG.selectors.pagination
      );

    if (!container) {
      return;
    }

    const pages =
      state.pages ||
      Math.ceil(
        Number(state.total) /
        state.limit
      );

    if (
      pages <= 1
    ) {
      container.innerHTML = "";
      return;
    }

    const current =
      state.page;

    const items = [];

    if (
      current > 1
    ) {
      items.push(`
        <button
          type="button"
          data-publication-page="${
            current - 1
          }"
        >
          ←
        </button>
      `);
    }

    const start =
      Math.max(
        1,
        current - 2
      );

    const end =
      Math.min(
        pages,
        current + 2
      );

    if (
      start > 1
    ) {
      items.push(`
        <button
          type="button"
          data-publication-page="1"
        >
          1
        </button>
      `);

      if (
        start > 2
      ) {
        items.push(
          "<span>…</span>"
        );
      }
    }

    for (
      let page = start;
      page <= end;
      page++
    ) {
      items.push(`
        <button
          type="button"
          class="${
            page === current
              ? "is-active"
              : ""
          }"
          data-publication-page="${page}"
        >
          ${page}
        </button>
      `);
    }

    if (
      end < pages
    ) {
      if (
        end < pages - 1
      ) {
        items.push(
          "<span>…</span>"
        );
      }

      items.push(`
        <button
          type="button"
          data-publication-page="${pages}"
        >
          ${pages}
        </button>
      `);
    }

    if (
      current < pages
    ) {
      items.push(`
        <button
          type="button"
          data-publication-page="${
            current + 1
          }"
        >
          →
        </button>
      `);
    }

    container.innerHTML =
      items.join("");
  }


  /* ==========================================================
     FILTERS
     ========================================================== */

  function readFilters() {
    const search =
      $(
        CONFIG.selectors.search
      );

    const category =
      $(
        CONFIG.selectors.category
      );

    const type =
      $(
        CONFIG.selectors.type
      );

    const status =
      $(
        CONFIG.selectors.status
      );

    const sort =
      $(
        CONFIG.selectors.sort
      );

    const limit =
      $(
        CONFIG.selectors.limit
      );

    if (search) {
      state.search =
        search.value.trim();
    }

    if (category) {
      state.category =
        category.value || "";
    }

    if (type) {
      state.type =
        type.value || "";
    }

    if (status) {
      state.status =
        status.value || "published";
    }

    if (sort) {
      state.sort =
        sort.value || "latest";
    }

    if (limit) {
      const value =
        Number(
          limit.value
        );

      if (
        Number.isInteger(value) &&
        value > 0 &&
        value <= 100
      ) {
        state.limit =
          value;
      }
    }
  }


  function resetFilters() {
    state.search = "";
    state.category = "";
    state.type = "";
    state.status = "published";
    state.sort = "latest";
    state.page = 1;

    const controls = [
      CONFIG.selectors.search,
      CONFIG.selectors.category,
      CONFIG.selectors.type,
      CONFIG.selectors.status,
      CONFIG.selectors.sort
    ];

    controls.forEach(
      selector => {
        $$(selector).forEach(
          element => {
            if (
              selector ===
              CONFIG.selectors.status
            ) {
              element.value =
                "published";
            } else if (
              selector ===
              CONFIG.selectors.sort
            ) {
              element.value =
                "latest";
            } else {
              element.value = "";
            }
          }
        );
      }
    );

    load();
  }


  function initFilters() {
    $$(
      CONFIG.selectors.search
    ).forEach(input => {
      input.addEventListener(
        "input",
        () => {
          clearTimeout(
            state.searchTimer
          );

          state.searchTimer =
            setTimeout(
              () => {
                readFilters();
                state.page = 1;
                load();
              },
              CONFIG.debounce
            );
        }
      );

      input.addEventListener(
        "keydown",
        event => {
          if (
            event.key === "Enter"
          ) {
            event.preventDefault();

            clearTimeout(
              state.searchTimer
            );

            readFilters();
            state.page = 1;
            load();
          }
        }
      );
    });

    [
      CONFIG.selectors.category,
      CONFIG.selectors.type,
      CONFIG.selectors.status,
      CONFIG.selectors.sort,
      CONFIG.selectors.limit
    ].forEach(
      selector => {
        $$(selector).forEach(
          element => {
            element.addEventListener(
              "change",
              () => {
                readFilters();
                state.page = 1;
                load();
              }
            );
          }
        );
      }
    );
  }


  /* ==========================================================
     BOOKMARKS
     ========================================================== */

  async function toggleBookmark(
    id
  ) {
    if (!id) {
      return;
    }

    const currentlySaved =
      state.favoriteIds.has(id);

    try {
      if (
        currentlySaved
      ) {
        await window.API.bookmarks.remove(
          id
        );

        state.favoriteIds.delete(
          id
        );

        toast(
          "Удалено из избранного.",
          "success"
        );
      } else {
        await window.API.bookmarks.add(
          id
        );

        state.favoriteIds.add(
          id
        );

        toast(
          "Добавлено в избранное.",
          "success"
        );
      }

      render();

    } catch (error) {
      console.error(
        "[TO Publications] Bookmark:",
        error
      );

      toast(
        error.message ||
          "Не удалось изменить избранное.",
        "error"
      );
    }
  }


  /* ==========================================================
     LIKE
     ========================================================== */

  async function like(
    id
  ) {
    if (!id) {
      return;
    }

    try {
      await window.API.reactions.add(
        "publication",
        id,
        "like"
      );

      state.reactionState.set(
        id,
        "like"
      );

      toast(
        "Нравится.",
        "success"
      );

      await load({
        keepPage: true
      });

    } catch (error) {
      console.error(
        "[TO Publications] Like:",
        error
      );

      toast(
        error.message ||
          "Не удалось поставить реакцию.",
        "error"
      );
    }
  }


  /* ==========================================================
     VIEW TRACKING
     ========================================================== */

  async function trackView(
    id
  ) {
    if (
      !id ||
      state.viewedIds.has(id)
    ) {
      return;
    }

    state.viewedIds.add(id);

    try {
      await window.API.views.add(
        id
      );
    } catch (error) {
      console.debug(
        "[TO Publications] View tracking:",
        error
      );
    }
  }


  function observeViews() {
    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(
            entry => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const id =
                entry.target.dataset
                  .publicationId;

              trackView(id);

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.5
        }
      );

    $$(
      CONFIG.selectors.card
    ).forEach(card => {
      observer.observe(card);
    });
  }


  /* ==========================================================
     SHARE
     ========================================================== */

  async function share(
    id
  ) {
    if (!id) {
      return;
    }

    const url =
      new URL(
        `/publication/${encodeURIComponent(id)}`,
        window.location.origin
      ).toString();

    const publication =
      state.publications.find(
        item =>
          publicationId(item) === id
      );

    const data = {
      title:
        publication
          ? publicationTitle(
              publication
            )
          : "Tajik Opportunities",

      text:
        publication
          ? truncate(
              publicationDescription(
                publication
              ),
              200
            )
          : "Посмотрите эту публикацию на Tajik Opportunities.",

      url
    };

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          data
        );
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          url
        );

        toast(
          "Ссылка скопирована.",
          "success"
        );
      }

      try {
        await window.API.shares.create(
          id,
          "web"
        );
      } catch {
        /* analytics failure must not break sharing */
      }

    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "[TO Publications] Share:",
          error
        );
      }
    }
  }


  /* ==========================================================
     PUBLICATION DETAIL
     ========================================================== */

  async function loadDetail(
    id
  ) {
    if (!id) {
      return null;
    }

    try {
      const publication =
        await window.API.publications.get(
          id
        );

      state.selectedPublication =
        publication;

      renderDetail(
        publication
      );

      trackView(id);

      return publication;

    } catch (error) {
      console.error(
        "[TO Publications] Detail:",
        error
      );

      toast(
        error.message ||
          "Не удалось загрузить публикацию.",
        "error"
      );

      throw error;
    }
  }


  function renderDetail(
    publication
  ) {
    const container =
      $(
        CONFIG.selectors.detail
      );

    if (
      !container ||
      !publication
    ) {
      return;
    }

    const id =
      publicationId(
        publication
      );

    const title =
      publicationTitle(
        publication
      );

    const description =
      publicationDescription(
        publication
      );

    const type =
      publicationType(
        publication
      );

    const category =
      categoryName(
        publication
      );

    const ratingValue =
      rating(
        publication
      );

    container.innerHTML = `
      <article
        class="to-publication-detail-card"
        data-publication-id="${escapeAttr(id)}"
      >

        <div class="to-publication-detail-header">

          <div>

            <span class="to-publication-type">
              ${escapeHtml(
                CONFIG.types[type] ||
                type
              )}
            </span>

            ${
              category
                ? `
                  <span class="to-publication-category">
                    ${escapeHtml(category)}
                  </span>
                `
                : ""
            }

            <h1>
              ${escapeHtml(title)}
            </h1>

            <div class="to-publication-rating">
              ${renderStars(
                ratingValue
              )}
              <strong>
                ${ratingValue.toFixed(1)}
              </strong>
            </div>

          </div>

          <button
            type="button"
            data-publication-detail-bookmark="${escapeAttr(id)}"
          >
            ${
              state.favoriteIds.has(id)
                ? "🔖 В избранном"
                : "☆ В избранное"
            }
          </button>

        </div>


        <div class="to-publication-detail-gallery">

          ${
            publication.images?.length
              ? publication.images
                  .map(
                    image => `
                      <img
                        src="${escapeAttr(
                          image.url
                        )}"
                        alt="${escapeAttr(
                          title
                        )}"
                        loading="lazy"
                      >
                    `
                  )
                  .join("")
              : `
                  <img
                    src="${escapeAttr(
                      imageUrl(
                        publication
                      )
                    )}"
                    alt="${escapeAttr(
                      title
                    )}"
                  >
                `
          }

        </div>


        <div class="to-publication-detail-content">

          <div class="to-publication-detail-description">
            ${formatText(
              description
            )}
          </div>

          ${
            publication.company_name ||
            publication.organization_name
              ? `
                <div>
                  <strong>Организация:</strong>
                  ${escapeHtml(
                    publication.company_name ||
                    publication.organization_name
                  )}
                </div>
              `
              : ""
          }

          ${
            publication.location ||
            publication.city
              ? `
                <div>
                  <strong>Местоположение:</strong>
                  ${escapeHtml(
                    publication.location ||
                    publication.city
                  )}
                </div>
              `
              : ""
          }

          ${
            publication.employment_type
              ? `
                <div>
                  <strong>Тип занятости:</strong>
                  ${escapeHtml(
                    CONFIG.employment[
                      publication.employment_type
                    ] ||
                    publication.employment_type
                  )}
                </div>
              `
              : ""
          }

          ${
            publication.salary ||
            publication.salary_text
              ? `
                <div>
                  <strong>Оплата:</strong>
                  ${escapeHtml(
                    publication.salary ||
                    publication.salary_text
                  )}
                </div>
              `
              : ""
          }

        </div>


        <div class="to-publication-detail-actions">

          <button
            type="button"
            data-publication-detail-like="${escapeAttr(id)}"
          >
            👍
            ${formatNumber(
              counter(
                publication,
                "likes_count",
                "likes"
              )
            )}
          </button>

          <button
            type="button"
            data-publication-detail-share="${escapeAttr(id)}"
          >
            ↗ Поделиться
          </button>

          <a
            href="#reviews"
            data-publication-detail-reviews
          >
            ⭐ Отзывы
          </a>

        </div>

      </article>
    `;
  }


  function formatText(
    value
  ) {
    return escapeHtml(
      value || ""
    )
      .replace(
        /\n{2,}/g,
        "</p><p>"
      )
      .replace(
        /\n/g,
        "<br>"
      )
      .replace(
        /^/,
        "<p>"
      )
      .replace(
        /$/,
        "</p>"
      );
  }


  /* ==========================================================
     CREATE PUBLICATION
     ========================================================== */

  async function createPublication(
    event
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const payload = {};

    formData.forEach(
      (value, key) => {
        if (
          value instanceof File
        ) {
          if (
            value.size > 0
          ) {
            if (
              !payload.files
            ) {
              payload.files = [];
            }

            payload.files.push(
              value
            );
          }

          return;
        }

        payload[key] =
          String(value).trim();
      }
    );

    if (
      !payload.title
    ) {
      toast(
        "Введите название публикации.",
        "error"
      );

      return;
    }

    if (
      !payload.description &&
      !payload.content
    ) {
      toast(
        "Введите описание публикации.",
        "error"
      );

      return;
    }

    try {
      const result =
        await window.API.publications.create(
          payload
        );

      toast(
        "Публикация отправлена.",
        "success"
      );

      form.reset();

      await load();

      return result;

    } catch (error) {
      console.error(
        "[TO Publications] Create:",
        error
      );

      toast(
        error.message ||
          "Не удалось создать публикацию.",
        "error"
      );
    }
  }


  /* ==========================================================
     VIEW SWITCHER
     ========================================================== */

  function setView(
    view
  ) {
    if (
      view !== "grid" &&
      view !== "list"
    ) {
      return;
    }

    state.activeView =
      view;

    document.documentElement
      .dataset.publicationsView =
      view;

    $$( 
      "[data-publication-view]"
    ).forEach(button => {
      button.classList.toggle(
        "is-active",
        button.dataset.publicationView ===
          view
      );

      button.setAttribute(
        "aria-pressed",
        button.dataset.publicationView ===
          view
          ? "true"
          : "false"
      );
    });

    render();
  }


  function initViewSwitcher() {
    $$(
      "[data-publication-view]"
    ).forEach(button => {
      button.addEventListener(
        "click",
        () => {
          setView(
            button.dataset.publicationView
          );
        }
      );
    });
  }


  /* ==========================================================
     EVENTS
     ========================================================== */

  function initEvents() {
    document.addEventListener(
      "click",
      event => {

        const page =
          event.target.closest(
            "[data-publication-page]"
          );

        if (page) {
          state.page =
            Number(
              page.dataset.publicationPage
            ) || 1;

          load();
          return;
        }


        const retry =
          event.target.closest(
            "[data-publications-retry]"
          );

        if (retry) {
          load();
          return;
        }


        const clear =
          event.target.closest(
            "[data-publications-clear]"
          );

        if (clear) {
          resetFilters();
          return;
        }


        const bookmark =
          event.target.closest(
            "[data-publication-bookmark]"
          );

        if (bookmark) {
          toggleBookmark(
            bookmark.dataset.publicationBookmark
          );
          return;
        }


        const likeButton =
          event.target.closest(
            "[data-publication-like]"
          );

        if (likeButton) {
          like(
            likeButton.dataset.publicationLike
          );
          return;
        }


        const reactionButton =
          event.target.closest(
            "[data-publication-reaction]"
          );

        if (reactionButton) {
          toggleReactionMenu(
            reactionButton.dataset.publicationReaction
          );
          return;
        }


        const reactionType =
          event.target.closest(
            "[data-publication-reaction-type]"
          );

        if (reactionType) {
          react(
            reactionType.dataset
              .publicationReactionType,
            reactionType.dataset
              .reactionType
          );
          return;
        }


        const comments =
          event.target.closest(
            "[data-publication-comments]"
          );

        if (comments) {
          const id =
            comments.dataset
              .publicationComments;

          window.location.href =
            `/publication/${encodeURIComponent(
              id
            )}#comments`;

          return;
        }


        const shareButton =
          event.target.closest(
            "[data-publication-share]"
          );

        if (shareButton) {
          share(
            shareButton.dataset
              .publicationShare
          );
          return;
        }


        const detailBookmark =
          event.target.closest(
            "[data-publication-detail-bookmark]"
          );

        if (detailBookmark) {
          toggleBookmark(
            detailBookmark.dataset
              .publicationDetailBookmark
          );
          return;
        }


        const detailLike =
          event.target.closest(
            "[data-publication-detail-like]"
          );

        if (detailLike) {
          like(
            detailLike.dataset
              .publicationDetailLike
          );
          return;
        }


        const detailShare =
          event.target.closest(
            "[data-publication-detail-share]"
          );

        if (detailShare) {
          share(
            detailShare.dataset
              .publicationDetailShare
          );
          return;
        }


        const detailReviews =
          event.target.closest(
            "[data-publication-detail-reviews]"
          );

        if (detailReviews) {
          const id =
            state.selectedPublication
              ? publicationId(
                  state.selectedPublication
                )
              : null;

          if (
            id &&
            window.TOReviews
          ) {
            window.TOReviews.init({
              targetType:
                "publication",
              targetId:
                id
            });
          }

          return;
        }
      }
    );


    document.addEventListener(
      "submit",
      event => {
        const form =
          event.target.closest(
            CONFIG.selectors.createForm
          );

        if (form) {
          createPublication(
            event
          );
        }
      }
    );


    document.addEventListener(
      "click",
      event => {
        const open =
          event.target.closest(
            "[data-publication-open]"
          );

        if (!open) {
          return;
        }

        const id =
          open.dataset.publicationOpen;

        if (
          !id
        ) {
          return;
        }

        trackView(id);
      }
    );
  }


  /* ==========================================================
     FAVORITES PRELOAD
     ========================================================== */

  async function loadFavorites() {
    try {
      const result =
        await window.API.bookmarks.list({
          limit: 100
        });

      const items =
        Array.isArray(result)
          ? result
          : (
              result?.items ||
              result?.bookmarks ||
              []
            );

      items.forEach(
        item => {
          const id =
            item.publication_id ||
            item.publicationId ||
            item.id;

          if (id) {
            state.favoriteIds.add(
              String(id)
            );
          }
        }
      );

    } catch (error) {
      console.debug(
        "[TO Publications] Favorites:",
        error
      );
    }
  }


  /* ==========================================================
     INIT
     ========================================================== */

  async function init(options = {}) {
    if (
      options.limit
    ) {
      const limit =
        Number(options.limit);

      if (
        Number.isInteger(limit) &&
        limit > 0 &&
        limit <= 100
      ) {
        state.limit =
          limit;
      }
    }

    if (
      options.sort
    ) {
      state.sort =
        options.sort;
    }

    if (
      options.category
    ) {
      state.category =
        options.category;
    }

    if (
      options.type
    ) {
      state.type =
        options.type;
    }

    if (
      !state.initialized
    ) {
      initFilters();
      initViewSwitcher();
      initEvents();

      state.initialized =
        true;
    }

    if (
      options.loadFavorites !== false
    ) {
      await loadFavorites();
    }

    if (
      $(
        CONFIG.selectors.list
      )
    ) {
      return load();
    }

    return null;
  }


  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const Publications = {
    state,
    config: CONFIG,

    init,

    load,

    refresh() {
      return load({
        keepPage: true
      });
    },

    render,

    renderCard,

    resetFilters,

    setView,

    setTarget() {
      /* reserved for future detail integration */
    },

    get(id) {
      return loadDetail(id);
    },

    create: createPublication,

    bookmark:
      toggleBookmark,

    like,

    react,

    share,

    trackView
  };


  /* ==========================================================
     GLOBAL EXPORT
     ========================================================== */

  window.TOPublications =
    Publications;

  window.Publications =
    Publications;


  /* ==========================================================
     AUTO INIT
     ========================================================== */

  function autoInit() {
    if (
      state.initialized
    ) {
      return;
    }

    if (
      $(
        CONFIG.selectors.list
      ) ||
      $(
        CONFIG.selectors.createForm
      ) ||
      $(
        CONFIG.selectors.detail
      )
    ) {
      Publications.init();
    }
  }


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      autoInit,
      {
        once: true
      }
    );
  } else {
    autoInit();
  }


  window.addEventListener(
    "to:api-ready",
    autoInit
  );


  window.addEventListener(
    "to:publication-target-change",
    event => {
      const detail =
        event.detail || {};

      if (
        detail.id
      ) {
        loadDetail(
          detail.id
        );
      }
    }
  );


  /* ==========================================================
     END
     ========================================================== */

})();
