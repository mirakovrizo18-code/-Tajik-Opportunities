/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   REVIEWS FRONTEND MODULE
   File: public/js/reviews.js
   Version: 2026.09.09
   ============================================================ */

"use strict";

(() => {
  /* ==========================================================
     CONFIG
     ========================================================== */

  const CONFIG = Object.freeze({
    selectors: {
      reviewList: "[data-reviews]",
      reviewForm: "[data-review-form]",
      reviewTarget: "[data-review-target]",
      ratingInput: "[data-rating-input]",
      ratingStars: "[data-rating-stars]",
      ratingValue: "[data-rating-value]",
      ratingSummary: "[data-rating-summary]",
      reviewCount: "[data-review-count]",
      reviewAverage: "[data-review-average]",
      ratingDistribution: "[data-rating-distribution]",
      reviewSort: "[data-review-sort]",
      reviewFilter: "[data-review-filter]",
      reviewPagination: "[data-review-pagination]",
      reviewTemplate: "template[data-review-template]",
      replyTemplate: "template[data-review-reply-template]"
    },

    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,

    ratings: [1, 2, 3, 4, 5],

    ratingLabels: {
      1: "Ужасно",
      2: "Плохо",
      3: "Нормально",
      4: "Хорошо",
      5: "Отлично"
    },

    reactionTypes: [
      "like",
      "love",
      "useful",
      "support",
      "interesting",
      "congratulations",
      "sad",
      "angry",
      "wow",
      "celebrate",
      "thanks"
    ],

    reactionIcons: {
      like: "👍",
      love: "❤️",
      useful: "💡",
      support: "🤝",
      interesting: "👀",
      congratulations: "🎉",
      sad: "😢",
      angry: "😡",
      wow: "😮",
      celebrate: "🥳",
      thanks: "🙏"
    },

    reactionLabels: {
      like: "Нравится",
      love: "Любовь",
      useful: "Полезно",
      support: "Поддерживаю",
      interesting: "Интересно",
      congratulations: "Поздравляю",
      sad: "Грустно",
      angry: "Злюсь",
      wow: "Вау",
      celebrate: "Праздную",
      thanks: "Спасибо"
    }
  });


  /* ==========================================================
     STATE
     ========================================================== */

  const state = {
    targetType: null,
    targetId: null,

    page: CONFIG.defaultPage,
    limit: CONFIG.defaultLimit,

    sort: "latest",
    status: "published",

    reviews: [],
    total: 0,
    pages: 0,

    average: "0",
    totalRatings: 0,

    distribution: {
      1: "0",
      2: "0",
      3: "0",
      4: "0",
      5: "0"
    },

    loading: false,
    submitting: false,

    selectedRating: 0,

    editingId: null,

    expandedReplies: new Set(),

    activeReactions: new Map(),

    initialized: false
  };


  /* ==========================================================
     HELPERS
     ========================================================== */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }


  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }


  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }


  function escapeAttribute(value) {
    return escapeHtml(value)
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function normalizeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  }


  function normalizeBigNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0";
    }

    const string = String(value).trim();

    if (!/^\d+$/.test(string)) {
      return "0";
    }

    return string.replace(/^0+(?=\d)/, "");
  }


  function formatBigNumber(value) {
    const normalized =
      normalizeBigNumber(value);

    if (normalized.length <= 3) {
      return normalized;
    }

    let result = "";
    let count = 0;

    for (
      let i = normalized.length - 1;
      i >= 0;
      i--
    ) {
      result =
        normalized[i] + result;

      count++;

      if (
        count % 3 === 0 &&
        i !== 0
      ) {
        result = " " + result;
      }
    }

    return result;
  }


  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat(
      document.documentElement.lang === "tg"
        ? "tg-TJ"
        : "ru-RU",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);
  }


  function relativeDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const seconds =
      Math.floor(
        (Date.now() - date.getTime()) / 1000
      );

    if (seconds < 60) {
      return "только что";
    }

    const minutes =
      Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} мин. назад`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} ч. назад`;
    }

    const days =
      Math.floor(hours / 24);

    if (days < 30) {
      return `${days} дн. назад`;
    }

    return formatDate(value);
  }


  function getReviewId(review) {
    return (
      review?.id ||
      review?.review_id ||
      review?.public_id ||
      ""
    );
  }


  function getAuthorName(review) {
    if (
      review?.author_mode === "anonymous" ||
      review?.is_anonymous === true
    ) {
      return "Анонимный пользователь";
    }

    return (
      review?.author_name ||
      review?.username ||
      review?.display_name ||
      "Пользователь"
    );
  }


  function getReviewText(review) {
    return (
      review?.text ||
      review?.content ||
      review?.body ||
      ""
    );
  }


  function getReviewTitle(review) {
    return (
      review?.title ||
      ""
    );
  }


  function getRating(review) {
    const rating =
      Number(
        review?.rating ??
        review?.rating_value ??
        0
      );

    if (
      rating < 1 ||
      rating > 5
    ) {
      return 0;
    }

    return Math.round(rating);
  }


  function getReplies(review) {
    return Array.isArray(review?.replies)
      ? review.replies
      : [];
  }


  function getReactionCount(review) {
    return normalizeBigNumber(
      review?.reactions_count ??
      review?.reaction_count ??
      0
    );
  }


  function getHelpfulCount(review) {
    return normalizeBigNumber(
      review?.helpful_count ?? 0
    );
  }


  function getNotHelpfulCount(review) {
    return normalizeBigNumber(
      review?.not_helpful_count ?? 0
    );
  }


  function showToast(
    message,
    type = "info"
  ) {
    if (
      typeof window.showToast === "function"
    ) {
      window.showToast(
        message,
        type
      );

      return;
    }

    const event =
      new CustomEvent(
        "to:toast",
        {
          detail: {
            message,
            type
          }
        }
      );

    window.dispatchEvent(event);
  }


  function setLoading(element, loading) {
    if (!element) {
      return;
    }

    element.classList.toggle(
      "is-loading",
      loading
    );

    element.setAttribute(
      "aria-busy",
      loading ? "true" : "false"
    );
  }


  /* ==========================================================
     TARGET DETECTION
     ========================================================== */

  function detectTarget() {
    const element =
      $(
        CONFIG.selectors.reviewTarget
      );

    if (!element) {
      return false;
    }

    state.targetType =
      element.dataset.targetType ||
      element.dataset.type ||
      null;

    state.targetId =
      element.dataset.targetId ||
      element.dataset.id ||
      null;

    return Boolean(
      state.targetType &&
      state.targetId
    );
  }


  function setTarget(
    targetType,
    targetId
  ) {
    state.targetType = targetType;
    state.targetId = targetId;

    const elements =
      $$(
        CONFIG.selectors.reviewTarget
      );

    elements.forEach(element => {
      element.dataset.targetType =
        targetType;

      element.dataset.targetId =
        targetId;
    });
  }


  /* ==========================================================
     RATING STARS
     ========================================================== */

  function renderStars(
    rating = 0,
    options = {}
  ) {
    const {
      interactive = false,
      size = "medium",
      name = "rating"
    } = options;

    const value =
      Math.max(
        0,
        Math.min(
          5,
          Number(rating) || 0
        )
      );

    let html =
      `<div class="to-rating-stars to-rating-stars--${size}" `;

    if (interactive) {
      html +=
        `data-rating-control="${escapeAttribute(name)}"`;
    }

    html += ">";

    for (let i = 1; i <= 5; i++) {
      const active =
        i <= value;

      html += `
        <button
          type="button"
          class="to-rating-star${active ? " is-active" : ""}"
          data-rating="${i}"
          ${interactive ? "" : "disabled"}
          aria-label="${escapeAttribute(
            CONFIG.ratingLabels[i]
          )}"
          aria-pressed="${active ? "true" : "false"}"
        >
          <span aria-hidden="true">★</span>
        </button>
      `;
    }

    html += "</div>";

    return html;
  }


  function updateRatingControls(
    value
  ) {
    const rating =
      Math.max(
        0,
        Math.min(
          5,
          Number(value) || 0
        )
      );

    state.selectedRating =
      rating;

    $$(
      CONFIG.selectors.ratingStars
    ).forEach(container => {
      $$(
        "[data-rating]",
        container
      ).forEach(star => {
        const starValue =
          Number(
            star.dataset.rating
          );

        const active =
          starValue <= rating;

        star.classList.toggle(
          "is-active",
          active
        );

        star.setAttribute(
          "aria-pressed",
          active ? "true" : "false"
        );
      });
    });

    $$(
      CONFIG.selectors.ratingInput
    ).forEach(input => {
      input.value =
        rating > 0
          ? String(rating)
          : "";
    });

    $$(
      CONFIG.selectors.ratingValue
    ).forEach(element => {
      element.textContent =
        rating > 0
          ? `${rating}/5 — ${CONFIG.ratingLabels[rating]}`
          : "Выберите оценку";
    });
  }


  function initRatingControls() {
    document.addEventListener(
      "click",
      event => {
        const star =
          event.target.closest(
            "[data-rating]"
          );

        if (!star) {
          return;
        }

        const container =
          star.closest(
            "[data-rating-control], [data-rating-stars]"
          );

        if (!container) {
          return;
        }

        const rating =
          Number(
            star.dataset.rating
          );

        if (
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5
        ) {
          return;
        }

        updateRatingControls(
          rating
        );
      }
    );
  }


  /* ==========================================================
     RATING SUMMARY
     ========================================================== */

  function normalizeDistribution(
    distribution
  ) {
    const result = {
      1: "0",
      2: "0",
      3: "0",
      4: "0",
      5: "0"
    };

    if (!distribution) {
      return result;
    }

    if (Array.isArray(distribution)) {
      distribution.forEach(item => {
        const rating =
          Number(
            item.rating ??
            item.value ??
            item.stars
          );

        if (
          rating >= 1 &&
          rating <= 5
        ) {
          result[rating] =
            normalizeBigNumber(
              item.count
            );
        }
      });

      return result;
    }

    Object.keys(result).forEach(
      rating => {
        result[rating] =
          normalizeBigNumber(
            distribution[rating] ??
            distribution[String(rating)] ??
            0
          );
      }
    );

    return result;
  }


  function calculateDistributionTotal(
    distribution
  ) {
    return Object.values(
      distribution
    ).reduce(
      (sum, value) =>
        sum + Number(value),
      0
    );
  }


  function renderRatingSummary(
    summary = {}
  ) {
    const average =
      summary.average ??
      summary.rating_average ??
      summary.avg ??
      state.average ??
      "0";

    const total =
      summary.total ??
      summary.total_ratings ??
      summary.count ??
      state.totalRatings ??
      0;

    const distribution =
      normalizeDistribution(
        summary.distribution ??
        summary.rating_distribution ??
        state.distribution
      );

    state.average =
      String(average);

    state.totalRatings =
      normalizeBigNumber(total);

    state.distribution =
      distribution;

    $$(
      CONFIG.selectors.reviewAverage
    ).forEach(element => {
      element.textContent =
        Number(average || 0).toFixed(1);
    });

    $$(
      CONFIG.selectors.reviewCount
    ).forEach(element => {
      element.textContent =
        formatBigNumber(total);
    });

    $$(
      CONFIG.selectors.ratingSummary
    ).forEach(element => {
      element.innerHTML = `
        <div class="to-rating-summary-main">
          <strong class="to-rating-summary-average">
            ${escapeHtml(
              Number(average || 0).toFixed(1)
            )}
          </strong>

          ${renderStars(
            Number(average || 0),
            {
              interactive: false
            }
          )}

          <span class="to-rating-summary-count">
            ${formatBigNumber(total)}
            отзывов
          </span>
        </div>

        <div class="to-rating-summary-distribution">
          ${renderDistribution(distribution, total)}
        </div>
      `;
    });

    $$(
      CONFIG.selectors.ratingDistribution
    ).forEach(element => {
      element.innerHTML =
        renderDistribution(
          distribution,
          total
        );
    });
  }


  function renderDistribution(
    distribution,
    total
  ) {
    const totalNumber =
      Number(total) ||
      calculateDistributionTotal(
        distribution
      );

    return CONFIG.ratings
      .slice()
      .reverse()
      .map(rating => {
        const count =
          Number(
            distribution[rating] || 0
          );

        const percent =
          totalNumber > 0
            ? Math.round(
                (count / totalNumber) * 100
              )
            : 0;

        return `
          <div
            class="to-rating-distribution-row"
            data-rating-row="${rating}"
          >
            <span class="to-rating-distribution-label">
              ${rating} ★
            </span>

            <div class="to-rating-distribution-bar">
              <span
                class="to-rating-distribution-fill"
                style="width:${percent}%"
              ></span>
            </div>

            <span class="to-rating-distribution-count">
              ${formatBigNumber(count)}
            </span>
          </div>
        `;
      })
      .join("");
  }


  async function loadRatingSummary() {
    if (
      !state.targetType ||
      !state.targetId
    ) {
      return null;
    }

    try {
      const summary =
        await window.API.reviews.ratingSummary(
          state.targetType,
          state.targetId
        );

      renderRatingSummary(
        summary || {}
      );

      return summary;

    } catch (error) {
      console.warn(
        "[TO Reviews] Rating summary:",
        error
      );

      return null;
    }
  }


  /* ==========================================================
     REVIEW CARD
     ========================================================== */

  function renderReview(review) {
    const id =
      getReviewId(review);

    const rating =
      getRating(review);

    const author =
      getAuthorName(review);

    const title =
      getReviewTitle(review);

    const text =
      getReviewText(review);

    const createdAt =
      review.created_at ||
      review.createdAt;

    const updatedAt =
      review.updated_at ||
      review.updatedAt;

    const replies =
      getReplies(review);

    const helpful =
      getHelpfulCount(review);

    const notHelpful =
      getNotHelpfulCount(review);

    const reactions =
      getReactionCount(review);

    const verified =
      review.verified === true ||
      review.is_verified === true ||
      review.verification_status === "verified";

    const featured =
      review.featured === true ||
      review.is_featured === true;

    const pinned =
      review.pinned === true ||
      review.is_pinned === true;

    const anonymous =
      review.author_mode === "anonymous" ||
      review.is_anonymous === true;

    const avatar =
      review.author_avatar ||
      review.avatar_url ||
      "";

    const currentReaction =
      state.activeReactions.get(id) ||
      review.current_reaction ||
      null;

    return `
      <article
        class="to-review-card"
        data-review-id="${escapeAttribute(id)}"
      >

        ${
          pinned
            ? `
              <div class="to-review-pin">
                📌 Закреплённый отзыв
              </div>
            `
            : ""
        }

        ${
          featured
            ? `
              <div class="to-review-featured">
                ⭐ Рекомендуемый отзыв
              </div>
            `
            : ""
        }

        <header class="to-review-header">

          <div class="to-review-author">

            ${
              avatar
                ? `
                  <img
                    class="to-review-avatar"
                    src="${escapeAttribute(avatar)}"
                    alt=""
                    loading="lazy"
                  >
                `
                : `
                  <div class="to-review-avatar to-review-avatar--placeholder">
                    ${escapeHtml(
                      author.charAt(0).toUpperCase()
                    )}
                  </div>
                `
            }

            <div class="to-review-author-info">

              <div class="to-review-author-name">
                ${escapeHtml(author)}

                ${
                  verified
                    ? `
                      <span
                        class="to-review-verified"
                        title="Подтверждённый пользователь"
                        aria-label="Подтверждённый пользователь"
                      >
                        ✓
                      </span>
                    `
                    : ""
                }
              </div>

              <time
                class="to-review-date"
                datetime="${escapeAttribute(
                  createdAt || ""
                )}"
                title="${escapeAttribute(
                  formatDate(createdAt)
                )}"
              >
                ${escapeHtml(
                  relativeDate(createdAt)
                )}
              </time>

              ${
                updatedAt &&
                updatedAt !== createdAt
                  ? `
                    <span class="to-review-edited">
                      · изменён
                    </span>
                  `
                  : ""
              }

            </div>
          </div>

          <div class="to-review-rating">
            ${renderStars(rating)}
            <span class="to-review-rating-number">
              ${rating}/5
            </span>
          </div>

        </header>


        ${
          title
            ? `
              <h3 class="to-review-title">
                ${escapeHtml(title)}
              </h3>
            `
            : ""
        }


        <div class="to-review-content">
          ${formatReviewText(text)}
        </div>


        <div class="to-review-meta">

          ${
            review.target_name
              ? `
                <span>
                  ${escapeHtml(
                    review.target_name
                  )}
                </span>
              `
              : ""
          }

          ${
            review.source
              ? `
                <span>
                  ${escapeHtml(
                    review.source
                  )}
                </span>
              `
              : ""
          }

        </div>


        <div class="to-review-actions">

          <button
            type="button"
            class="to-review-action"
            data-review-helpful="true"
            data-review-id="${escapeAttribute(id)}"
            aria-label="Полезный отзыв"
          >
            👍
            <span>
              ${formatBigNumber(helpful)}
            </span>
          </button>

          <button
            type="button"
            class="to-review-action"
            data-review-helpful="false"
            data-review-id="${escapeAttribute(id)}"
            aria-label="Отзыв не полезен"
          >
            👎
            <span>
              ${formatBigNumber(notHelpful)}
            </span>
          </button>

          <button
            type="button"
            class="to-review-action"
            data-review-reactions="${escapeAttribute(id)}"
          >
            😊
            <span>
              ${formatBigNumber(reactions)}
            </span>
          </button>

          <button
            type="button"
            class="to-review-action"
            data-review-reply-toggle="${escapeAttribute(id)}"
          >
            💬
            <span>
              ${formatBigNumber(
                review.replies_count ??
                replies.length
              )}
            </span>
          </button>

          <button
            type="button"
            class="to-review-action"
            data-review-share="${escapeAttribute(id)}"
          >
            ↗
            Поделиться
          </button>

          <button
            type="button"
            class="to-review-action"
            data-review-report="${escapeAttribute(id)}"
          >
            ⚑
            Пожаловаться
          </button>

        </div>


        <div
          class="to-review-reaction-panel"
          data-review-reaction-panel="${escapeAttribute(id)}"
          hidden
        >
          ${renderReactionPicker(
            id,
            currentReaction
          )}
        </div>


        <div
          class="to-review-replies"
          data-review-replies="${escapeAttribute(id)}"
          hidden
        >

          <div class="to-review-replies-list">
            ${
              replies.length
                ? replies
                    .map(reply =>
                      renderReply(
                        reply,
                        id
                      )
                    )
                    .join("")
                : `
                  <div class="to-review-no-replies">
                    Пока нет ответов.
                  </div>
                `
            }
          </div>

          <form
            class="to-review-reply-form"
            data-review-reply-form="${escapeAttribute(id)}"
          >
            <textarea
              name="text"
              rows="2"
              maxlength="5000"
              placeholder="Напишите ответ..."
              required
            ></textarea>

            <button type="submit">
              Ответить
            </button>
          </form>

        </div>

      </article>
    `;
  }


  function formatReviewText(text) {
    const safe =
      escapeHtml(text);

    return safe
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
     REPLIES
     ========================================================== */

  function renderReply(
    reply,
    reviewId
  ) {
    const author =
      reply.author_name ||
      reply.username ||
      "Пользователь";

    const text =
      reply.text ||
      reply.content ||
      "";

    const createdAt =
      reply.created_at ||
      reply.createdAt;

    return `
      <article
        class="to-review-reply"
        data-reply-id="${escapeAttribute(
          reply.id || ""
        )}"
      >

        <div class="to-review-reply-avatar">
          ${escapeHtml(
            author.charAt(0).toUpperCase()
          )}
        </div>

        <div class="to-review-reply-body">

          <div class="to-review-reply-header">
            <strong>
              ${escapeHtml(author)}
            </strong>

            <time
              datetime="${escapeAttribute(
                createdAt || ""
              )}"
            >
              ${escapeHtml(
                relativeDate(createdAt)
              )}
            </time>
          </div>

          <div class="to-review-reply-text">
            ${formatReviewText(text)}
          </div>

          <div class="to-review-reply-actions">

            <button
              type="button"
              data-reply-helpful="${escapeAttribute(
                reply.id || ""
              )}"
            >
              👍
              ${formatBigNumber(
                reply.helpful_count || 0
              )}
            </button>

            <button
              type="button"
              data-reply-report="${escapeAttribute(
                reply.id || ""
              )}"
            >
              ⚑
            </button>

          </div>

        </div>

      </article>
    `;
  }


  /* ==========================================================
     REACTIONS
     ========================================================== */

  function renderReactionPicker(
    reviewId,
    activeReaction = null
  ) {
    return `
      <div class="to-reaction-picker">

        ${CONFIG.reactionTypes
          .map(type => {
            const active =
              activeReaction === type;

            return `
              <button
                type="button"
                class="to-reaction-option${
                  active
                    ? " is-active"
                    : ""
                }"
                data-review-reaction="${escapeAttribute(
                  reviewId
                )}"
                data-reaction-type="${escapeAttribute(
                  type
                )}"
                aria-pressed="${
                  active
                    ? "true"
                    : "false"
                }"
                title="${escapeAttribute(
                  CONFIG.reactionLabels[type]
                )}"
              >
                <span>
                  ${CONFIG.reactionIcons[type]}
                </span>

                <small>
                  ${escapeHtml(
                    CONFIG.reactionLabels[type]
                  )}
                </small>
              </button>
            `;
          })
          .join("")}

      </div>
    `;
  }


  async function reactToReview(
    reviewId,
    reactionType
  ) {
    if (!reviewId || !reactionType) {
      return;
    }

    try {
      const current =
        state.activeReactions.get(
          reviewId
        );

      if (
        current === reactionType
      ) {
        await window.API.reviews.removeReaction(
          reviewId,
          reactionType
        );

        state.activeReactions.delete(
          reviewId
        );

        showToast(
          "Реакция удалена.",
          "success"
        );
      } else {
        await window.API.reviews.react(
          reviewId,
          reactionType
        );

        state.activeReactions.set(
          reviewId,
          reactionType
        );

        showToast(
          "Реакция добавлена.",
          "success"
        );
      }

      await loadReviews({
        keepPage: true
      });

    } catch (error) {
      console.error(
        "[TO Reviews] Reaction:",
        error
      );

      showToast(
        error.message ||
          "Не удалось изменить реакцию.",
        "error"
      );
    }
  }


  /* ==========================================================
     LOAD REVIEWS
     ========================================================== */

  async function loadReviews(options = {}) {
    if (
      !state.targetType ||
      !state.targetId
    ) {
      return null;
    }

    const {
      keepPage = false
    } = options;

    if (!keepPage) {
      state.page =
        Math.max(
          1,
          state.page
        );
    }

    state.loading = true;

    const list =
      $(
        CONFIG.selectors.reviewList
      );

    setLoading(
      list,
      true
    );

    try {
      const response =
        await window.API.reviews.list({
          target_type:
            state.targetType,

          target_id:
            state.targetId,

          status:
            state.status,

          sort:
            state.sort,

          page:
            state.page,

          limit:
            Math.min(
              state.limit,
              CONFIG.maxLimit
            )
        });

      const data =
        response || {};

      state.reviews =
        Array.isArray(data)
          ? data
          : (
              data.items ||
              data.reviews ||
              data.results ||
              []
            );

      const pagination =
        data.pagination ||
        data.meta ||
        {};

      state.total =
        normalizeBigNumber(
          pagination.total ??
          data.total ??
          state.reviews.length
        );

      state.pages =
        Number(
          pagination.total_pages ??
          pagination.pages ??
          data.pages ??
          0
        );

      renderReviews();

      await loadRatingSummary();

      return data;

    } catch (error) {
      console.error(
        "[TO Reviews] Load:",
        error
      );

      if (list) {
        list.innerHTML = renderError(
          "Не удалось загрузить отзывы."
        );
      }

      showToast(
        error.message ||
          "Не удалось загрузить отзывы.",
        "error"
      );

      throw error;

    } finally {
      state.loading = false;

      setLoading(
        list,
        false
      );
    }
  }


  function renderReviews() {
    const list =
      $(
        CONFIG.selectors.reviewList
      );

    if (!list) {
      return;
    }

    if (!state.reviews.length) {
      list.innerHTML =
        renderEmptyReviews();

      renderPagination();

      return;
    }

    list.innerHTML =
      state.reviews
        .map(review =>
          renderReview(review)
        )
        .join("");

    renderPagination();
  }


  function renderEmptyReviews() {
    return `
      <div class="to-reviews-empty">

        <div class="to-reviews-empty-icon">
          ★
        </div>

        <h3>
          Отзывов пока нет
        </h3>

        <p>
          Будьте первым, кто оставит отзыв и оценку.
        </p>

        <button
          type="button"
          data-review-scroll-form
        >
          Оставить отзыв
        </button>

      </div>
    `;
  }


  function renderError(message) {
    return `
      <div class="to-reviews-error">

        <div class="to-reviews-error-icon">
          ⚠️
        </div>

        <p>
          ${escapeHtml(message)}
        </p>

        <button
          type="button"
          data-review-retry
        >
          Повторить
        </button>

      </div>
    `;
  }


  /* ==========================================================
     PAGINATION
     ========================================================== */

  function renderPagination() {
    const container =
      $(
        CONFIG.selectors.reviewPagination
      );

    if (!container) {
      return;
    }

    const total =
      Number(state.total) || 0;

    const pages =
      state.pages ||
      Math.ceil(
        total / state.limit
      );

    if (pages <= 1) {
      container.innerHTML = "";
      return;
    }

    const current =
      state.page;

    const buttons = [];

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

    if (current > 1) {
      buttons.push(`
        <button
          type="button"
          data-review-page="${
            current - 1
          }"
        >
          ←
        </button>
      `);
    }

    if (start > 1) {
      buttons.push(`
        <button
          type="button"
          data-review-page="1"
        >
          1
        </button>
      `);

      if (start > 2) {
        buttons.push(
          `<span>…</span>`
        );
      }
    }

    for (
      let page = start;
      page <= end;
      page++
    ) {
      buttons.push(`
        <button
          type="button"
          class="${
            page === current
              ? "is-active"
              : ""
          }"
          data-review-page="${page}"
        >
          ${page}
        </button>
      `);
    }

    if (end < pages) {
      if (end < pages - 1) {
        buttons.push(
          `<span>…</span>`
        );
      }

      buttons.push(`
        <button
          type="button"
          data-review-page="${pages}"
        >
          ${pages}
        </button>
      `);
    }

    if (current < pages) {
      buttons.push(`
        <button
          type="button"
          data-review-page="${
            current + 1
          }"
        >
          →
        </button>
      `);
    }

    container.innerHTML =
      buttons.join("");
  }


  /* ==========================================================
     CREATE / EDIT REVIEW
     ========================================================== */

  function getReviewForm() {
    return $(
      CONFIG.selectors.reviewForm
    );
  }


  function formToPayload(form) {
    const formData =
      new FormData(form);

    const payload = {};

    formData.forEach(
      (value, key) => {
        if (
          value instanceof File
        ) {
          if (value.size > 0) {
            payload[key] = value;
          }

          return;
        }

        payload[key] =
          String(value).trim();
      }
    );

    payload.target_type =
      payload.target_type ||
      state.targetType;

    payload.target_id =
      payload.target_id ||
      state.targetId;

    payload.rating =
      Number(
        payload.rating ||
        state.selectedRating
      );

    return payload;
  }


  function validateReviewPayload(
    payload
  ) {
    const errors = [];

    if (
      !payload.target_type
    ) {
      errors.push(
        "Не указан объект отзыва."
      );
    }

    if (
      !payload.target_id
    ) {
      errors.push(
        "Не указан объект отзыва."
      );
    }

    if (
      !Number.isInteger(
        Number(payload.rating)
      ) ||
      Number(payload.rating) < 1 ||
      Number(payload.rating) > 5
    ) {
      errors.push(
        "Выберите оценку от 1 до 5."
      );
    }

    const text =
      String(
        payload.text ||
        payload.content ||
        ""
      ).trim();

    if (!text) {
      errors.push(
        "Введите текст отзыва."
      );
    }

    if (text.length > 20000) {
      errors.push(
        "Текст отзыва слишком длинный."
      );
    }

    return errors;
  }


  async function submitReview(
    event
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    if (state.submitting) {
      return;
    }

    const payload =
      formToPayload(form);

    const errors =
      validateReviewPayload(
        payload
      );

    if (errors.length) {
      showToast(
        errors[0],
        "error"
      );

      return;
    }

    state.submitting = true;

    setLoading(
      form,
      true
    );

    try {
      let result;

      if (state.editingId) {
        result =
          await window.API.reviews.update(
            state.editingId,
            payload
          );

        showToast(
          "Отзыв успешно изменён.",
          "success"
        );

      } else {
        result =
          await window.API.reviews.create(
            payload
          );

        showToast(
          "Отзыв отправлен.",
          "success"
        );
      }

      state.editingId = null;

      resetReviewForm();

      await loadReviews();

      return result;

    } catch (error) {
      console.error(
        "[TO Reviews] Submit:",
        error
      );

      showToast(
        error.message ||
          "Не удалось сохранить отзыв.",
        "error"
      );

    } finally {
      state.submitting = false;

      setLoading(
        form,
        false
      );
    }
  }


  function resetReviewForm() {
    const form =
      getReviewForm();

    if (!form) {
      return;
    }

    form.reset();

    state.editingId = null;
    state.selectedRating = 0;

    updateRatingControls(0);

    const submitButton =
      form.querySelector(
        "[type='submit']"
      );

    if (submitButton) {
      submitButton.textContent =
        "Опубликовать отзыв";
    }

    const cancelButton =
      form.querySelector(
        "[data-review-edit-cancel]"
      );

    if (cancelButton) {
      cancelButton.hidden = true;
    }
  }


  function startEditingReview(
    review
  ) {
    const form =
      getReviewForm();

    if (!form) {
      return;
    }

    state.editingId =
      getReviewId(review);

    const fields = [
      "title",
      "text",
      "content"
    ];

    fields.forEach(name => {
      const input =
        form.elements[name];

      if (!input) {
        return;
      }

      input.value =
        review[name] ??
        (
          name === "text"
            ? review.content
            : ""
        ) ??
        "";
    });

    const rating =
      getRating(review);

    updateRatingControls(
      rating
    );

    const submitButton =
      form.querySelector(
        "[type='submit']"
      );

    if (submitButton) {
      submitButton.textContent =
        "Сохранить изменения";
    }

    const cancelButton =
      form.querySelector(
        "[data-review-edit-cancel]"
      );

    if (cancelButton) {
      cancelButton.hidden = false;
    }

    form.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }


  /* ==========================================================
     DELETE REVIEW
     ========================================================== */

  async function deleteReview(
    reviewId
  ) {
    if (!reviewId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Вы действительно хотите удалить этот отзыв?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await window.API.reviews.remove(
        reviewId
      );

      showToast(
        "Отзыв удалён.",
        "success"
      );

      await loadReviews();

    } catch (error) {
      console.error(
        "[TO Reviews] Delete:",
        error
      );

      showToast(
        error.message ||
          "Не удалось удалить отзыв.",
        "error"
      );
    }
  }


  /* ==========================================================
     HELPFUL
     ========================================================== */

  async function setHelpful(
    reviewId,
    value
  ) {
    if (!reviewId) {
      return;
    }

    try {
      await window.API.reviews.helpful(
        reviewId,
        Boolean(value)
      );

      showToast(
        value
          ? "Отзыв отмечен как полезный."
          : "Отметка обновлена.",
        "success"
      );

      await loadReviews({
        keepPage: true
      });

    } catch (error) {
      console.error(
        "[TO Reviews] Helpful:",
        error
      );

      showToast(
        error.message ||
          "Не удалось изменить оценку полезности.",
        "error"
      );
    }
  }


  /* ==========================================================
     REPORT
     ========================================================== */

  async function reportReview(
    reviewId
  ) {
    if (!reviewId) {
      return;
    }

    const reason =
      window.prompt(
        "Укажите причину жалобы:"
      );

    if (!reason) {
      return;
    }

    try {
      await window.API.reviews.report(
        reviewId,
        {
          type: "other",
          reason:
            reason.trim()
        }
      );

      showToast(
        "Жалоба отправлена.",
        "success"
      );

    } catch (error) {
      console.error(
        "[TO Reviews] Report:",
        error
      );

      showToast(
        error.message ||
          "Не удалось отправить жалобу.",
        "error"
      );
    }
  }


  /* ==========================================================
     REPLIES
     ========================================================== */

  async function loadReplies(
    reviewId
  ) {
    try {
      const replies =
        await window.API.reviews.replies(
          reviewId,
          {
            status: "published",
            sort: "oldest"
          }
        );

      const review =
        state.reviews.find(
          item =>
            getReviewId(item) ===
            reviewId
        );

      if (review) {
        review.replies =
          Array.isArray(replies)
            ? replies
            : (
                replies?.items ||
                replies?.replies ||
                []
              );
      }

      return replies;

    } catch (error) {
      console.error(
        "[TO Reviews] Replies:",
        error
      );

      showToast(
        error.message ||
          "Не удалось загрузить ответы.",
        "error"
      );

      return null;
    }
  }


  async function toggleReplies(
    reviewId
  ) {
    const container =
      document.querySelector(
        `[data-review-replies="${CSS.escape(
          reviewId
        )}"]`
      );

    if (!container) {
      return;
    }

    const isOpen =
      !container.hidden;

    if (isOpen) {
      container.hidden = true;

      state.expandedReplies.delete(
        reviewId
      );

      return;
    }

    container.hidden = false;

    state.expandedReplies.add(
      reviewId
    );

    await loadReplies(
      reviewId
    );
  }


  async function submitReply(
    event,
    reviewId
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const textarea =
      form.querySelector(
        "textarea[name='text']"
      );

    const text =
      String(
        textarea?.value || ""
      ).trim();

    if (!text) {
      showToast(
        "Введите текст ответа.",
        "error"
      );

      return;
    }

    try {
      await window.API.reviews.createReply(
        reviewId,
        {
          text
        }
      );

      if (textarea) {
        textarea.value = "";
      }

      showToast(
        "Ответ отправлен.",
        "success"
      );

      await loadReviews({
        keepPage: true
      });

      const repliesContainer =
        document.querySelector(
          `[data-review-replies="${CSS.escape(
            reviewId
          )}"]`
        );

      if (repliesContainer) {
        repliesContainer.hidden =
          false;
      }

    } catch (error) {
      console.error(
        "[TO Reviews] Reply:",
        error
      );

      showToast(
        error.message ||
          "Не удалось отправить ответ.",
        "error"
      );
    }
  }


  /* ==========================================================
     SHARE
     ========================================================== */

  async function shareReview(
    reviewId
  ) {
    const url =
      new URL(
        window.location.href
      );

    url.hash =
      `review-${reviewId}`;

    const shareData = {
      title:
        document.title ||
        "Tajik Opportunities",

      text:
        "Посмотрите этот отзыв на Tajik Opportunities.",

      url:
        url.toString()
    };

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData
        );
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          url.toString()
        );

        showToast(
          "Ссылка скопирована.",
          "success"
        );
      }

      if (
        window.API?.shares
      ) {
        try {
          await window.API.shares.create(
            state.targetId,
            "review"
          );
        } catch {
          /* share analytics is optional */
        }
      }

    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "[TO Reviews] Share:",
          error
        );
      }
    }
  }


  /* ==========================================================
     SORT / FILTER
     ========================================================== */

  function initFilters() {
    const sort =
      $(
        CONFIG.selectors.reviewSort
      );

    if (sort) {
      sort.value =
        state.sort;

      sort.addEventListener(
        "change",
        () => {
          state.sort =
            sort.value ||
            "latest";

          state.page = 1;

          loadReviews();
        }
      );
    }

    const filter =
      $(
        CONFIG.selectors.reviewFilter
      );

    if (filter) {
      filter.value =
        state.status;

      filter.addEventListener(
        "change",
        () => {
          state.status =
            filter.value ||
            "published";

          state.page = 1;

          loadReviews();
        }
      );
    }
  }


  /* ==========================================================
     EVENT HANDLERS
     ========================================================== */

  function initEvents() {
    document.addEventListener(
      "submit",
      event => {
        const reviewForm =
          event.target.closest(
            CONFIG.selectors.reviewForm
          );

        if (reviewForm) {
          submitReview(event);
          return;
        }

        const replyForm =
          event.target.closest(
            "[data-review-reply-form]"
          );

        if (replyForm) {
          const reviewId =
            replyForm.dataset.reviewReplyForm;

          submitReply(
            event,
            reviewId
          );
        }
      }
    );


    document.addEventListener(
      "click",
      event => {

        const pageButton =
          event.target.closest(
            "[data-review-page]"
          );

        if (pageButton) {
          state.page =
            Number(
              pageButton.dataset.reviewPage
            ) || 1;

          loadReviews();

          return;
        }


        const retry =
          event.target.closest(
            "[data-review-retry]"
          );

        if (retry) {
          loadReviews();

          return;
        }


        const scrollForm =
          event.target.closest(
            "[data-review-scroll-form]"
          );

        if (scrollForm) {
          const form =
            getReviewForm();

          form?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          return;
        }


        const editCancel =
          event.target.closest(
            "[data-review-edit-cancel]"
          );

        if (editCancel) {
          resetReviewForm();

          return;
        }


        const helpful =
          event.target.closest(
            "[data-review-helpful]"
          );

        if (helpful) {
          setHelpful(
            helpful.dataset.reviewId,
            helpful.dataset.reviewHelpful ===
              "true"
          );

          return;
        }


        const reactionToggle =
          event.target.closest(
            "[data-review-reactions]"
          );

        if (reactionToggle) {
          const id =
            reactionToggle.dataset.reviewReactions;

          const panel =
            document.querySelector(
              `[data-review-reaction-panel="${CSS.escape(
                id
              )}"]`
            );

          if (panel) {
            panel.hidden =
              !panel.hidden;
          }

          return;
        }


        const reaction =
          event.target.closest(
            "[data-review-reaction]"
          );

        if (reaction) {
          reactToReview(
            reaction.dataset.reviewReaction,
            reaction.dataset.reactionType
          );

          return;
        }


        const replyToggle =
          event.target.closest(
            "[data-review-reply-toggle]"
          );

        if (replyToggle) {
          toggleReplies(
            replyToggle.dataset.reviewReplyToggle
          );

          return;
        }


        const report =
          event.target.closest(
            "[data-review-report]"
          );

        if (report) {
          reportReview(
            report.dataset.reviewReport
          );

          return;
        }


        const share =
          event.target.closest(
            "[data-review-share]"
          );

        if (share) {
          shareReview(
            share.dataset.reviewShare
          );

          return;
        }


        const deleteButton =
          event.target.closest(
            "[data-review-delete]"
          );

        if (deleteButton) {
          deleteReview(
            deleteButton.dataset.reviewDelete
          );

          return;
        }


        const editButton =
          event.target.closest(
            "[data-review-edit]"
          );

        if (editButton) {
          const id =
            editButton.dataset.reviewEdit;

          const review =
            state.reviews.find(
              item =>
                getReviewId(item) === id
            );

          if (review) {
            startEditingReview(
              review
            );
          }

          return;
        }
      }
    );
  }


  /* ==========================================================
     ADMIN / USER ACTION EVENTS
     ========================================================== */

  function addManagementActions() {
    const cards =
      $$(
        "[data-review-id]"
      );

    cards.forEach(card => {
      const id =
        card.dataset.reviewId;

      const review =
        state.reviews.find(
          item =>
            getReviewId(item) === id
        );

      if (!review) {
        return;
      }

      const owner =
        review.is_owner === true ||
        review.can_edit === true;

      const admin =
        review.can_manage === true ||
        review.is_admin === true;

      if (
        !owner &&
        !admin
      ) {
        return;
      }

      const actions =
        card.querySelector(
          ".to-review-actions"
        );

      if (!actions) {
        return;
      }

      if (owner) {
        const edit =
          document.createElement(
            "button"
          );

        edit.type = "button";
        edit.className =
          "to-review-action";
        edit.dataset.reviewEdit =
          id;
        edit.textContent =
          "✏️ Изменить";

        actions.appendChild(
          edit
        );
      }

      if (owner || admin) {
        const remove =
          document.createElement(
            "button"
          );

        remove.type = "button";
        remove.className =
          "to-review-action";
        remove.dataset.reviewDelete =
          id;
        remove.textContent =
          "🗑 Удалить";

        actions.appendChild(
          remove
        );
      }
    });
  }


  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const Reviews = {

    state,

    config: CONFIG,

    init(options = {}) {
      if (
        options.targetType &&
        options.targetId
      ) {
        setTarget(
          options.targetType,
          options.targetId
        );
      } else {
        detectTarget();
      }

      if (
        options.limit
      ) {
        state.limit =
          Math.min(
            CONFIG.maxLimit,
            Math.max(
              1,
              Number(options.limit)
            )
          );
      }

      if (
        options.sort
      ) {
        state.sort =
          options.sort;
      }

      if (
        options.status
      ) {
        state.status =
          options.status;
      }

      if (
        !state.initialized
      ) {
        initRatingControls();
        initEvents();
        initFilters();

        state.initialized =
          true;
      }

      if (
        state.targetType &&
        state.targetId
      ) {
        return loadReviews();
      }

      return Promise.resolve(
        null
      );
    },

    setTarget,

    load: loadReviews,

    refresh() {
      return loadReviews({
        keepPage: true
      });
    },

    loadSummary:
      loadRatingSummary,

    renderStars,

    renderReview,

    submit:
      submitReview,

    reset:
      resetReviewForm,

    edit:
      startEditingReview,

    remove:
      deleteReview,

    helpful:
      setHelpful,

    report:
      reportReview,

    react:
      reactToReview,

    reply:
      submitReply,

    share:
      shareReview
  };


  /* ==========================================================
     GLOBAL EXPORT
     ========================================================== */

  window.TOReviews =
    Reviews;

  window.Reviews =
    Reviews;


  /* ==========================================================
     AUTO INITIALIZATION
     ========================================================== */

  function autoInit() {
    if (
      state.initialized
    ) {
      return;
    }

    const reviewList =
      $(
        CONFIG.selectors.reviewList
      );

    const reviewForm =
      $(
        CONFIG.selectors.reviewForm
      );

    if (
      !reviewList &&
      !reviewForm
    ) {
      return;
    }

    Reviews.init();
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


  /* ==========================================================
     API READY SUPPORT
     ========================================================== */

  window.addEventListener(
    "to:api-ready",
    () => {
      autoInit();
    }
  );


  /* ==========================================================
     EXTERNAL TARGET SUPPORT
     ========================================================== */

  window.addEventListener(
    "to:review-target-change",
    event => {
      const detail =
        event.detail || {};

      if (
        detail.targetType &&
        detail.targetId
      ) {
        Reviews.init({
          targetType:
            detail.targetType,

          targetId:
            detail.targetId
        });
      }
    }
  );


  /* ==========================================================
     END
     ========================================================== */

})();
