/* ============================================================
   TAJIK OPPORTUNITIES
   Страница отдельной публикации
   ============================================================ */

(() => {
  "use strict";

  const TO = window.TO;

  if (!TO) {
    console.error("Tajik Opportunities: utils.js не загружен.");
    return;
  }

  const state = {
    post: null,
    loading: false,
  };

  const elements = {
    loadingState: document.getElementById("postLoading"),
    contentState: document.getElementById("postContent"),
    errorState: document.getElementById("postError"),

    title: document.getElementById("postTitle"),
    category: document.getElementById("postCategory"),
    date: document.getElementById("postDate"),
    author: document.getElementById("postAuthor"),
    content: document.getElementById("postText"),
    image: document.getElementById("postImage"),
    imageWrapper: document.getElementById("postImageWrapper"),
    link: document.getElementById("postLink"),

    errorMessage: document.getElementById("postErrorMessage"),
    retryButton: document.getElementById("postRetry"),

    backButton: document.getElementById("postBack"),
    shareButton: document.getElementById("postShare"),
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindEvents();

    const id = TO.getQueryParam("id");

    if (!id) {
      showError("Публикация не указана.");
      return;
    }

    await loadPost(id);
  }

  // ==========================================================
  // СОБЫТИЯ
  // ==========================================================

  function bindEvents() {
    if (elements.retryButton) {
      elements.retryButton.addEventListener(
        "click",
        () => {
          const id = TO.getQueryParam("id");

          if (id) {
            loadPost(id);
          }
        }
      );
    }

    if (elements.backButton) {
      elements.backButton.addEventListener(
        "click",
        (event) => {
          if (document.referrer) {
            event.preventDefault();
            window.history.back();
          }
        }
      );
    }

    if (elements.shareButton) {
      elements.shareButton.addEventListener(
        "click",
        sharePost
      );
    }
  }

  // ==========================================================
  // ЗАГРУЗКА
  // ==========================================================

  async function loadPost(id) {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    try {
      const response = await TO.getJson(
        `/api/posts/${encodeURIComponent(id)}`
      );

      const post = extractPost(response);

      if (!post) {
        throw new Error(
          "Публикация не найдена."
        );
      }

      state.post = post;

      renderPost(post);

      hideLoading();
      hideError();
      showContent();

      updateDocumentMeta(post);
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка загрузки публикации",
        error
      );

      hideLoading();

      showError(
        TO.getErrorMessage(
          error,
          "Не удалось загрузить публикацию."
        )
      );
    } finally {
      state.loading = false;
    }
  }

  function extractPost(response) {
    if (!response) {
      return null;
    }

    if (
      response.id ||
      response.title ||
      response.content
    ) {
      return response;
    }

    if (response.post) {
      return response.post;
    }

    if (
      response.data &&
      response.data.post
    ) {
      return response.data.post;
    }

    if (
      response.data &&
      response.data.id
    ) {
      return response.data;
    }

    return null;
  }

  // ==========================================================
  // ОТРИСОВКА
  // ==========================================================

  function renderPost(post) {
    const title =
      post.title || "Без названия";

    const category =
      post.category || "Другое";

    const categoryLabel =
      TO.getCategoryLabel(category);

    const categoryIcon =
      TO.getCategoryIcon(category);

    // --------------------------------------------------------
    // Заголовок
    // --------------------------------------------------------

    if (elements.title) {
      elements.title.textContent = title;
    }

    // --------------------------------------------------------
    // Категория
    // --------------------------------------------------------

    if (elements.category) {
      elements.category.textContent =
        `${categoryIcon} ${categoryLabel}`;
    }

    // --------------------------------------------------------
    // Дата
    // --------------------------------------------------------

    const date =
      post.published_at ||
      post.created_at ||
      "";

    if (elements.date) {
      if (date) {
        elements.date.textContent =
          TO.formatDate(date);

        elements.date.dateTime = date;
      } else {
        elements.date.textContent = "";
      }
    }

    // --------------------------------------------------------
    // Автор
    // --------------------------------------------------------

    if (elements.author) {
      if (post.author_name) {
        elements.author.textContent =
          post.author_name;

        elements.author.hidden = false;
      } else {
        elements.author.hidden = true;
      }
    }

    // --------------------------------------------------------
    // Текст
    // --------------------------------------------------------

    renderContent(post.content || "");

    // --------------------------------------------------------
    // Изображение
    // --------------------------------------------------------

    renderImage(
      post.image_url || "",
      title
    );

    // --------------------------------------------------------
    // Дополнительная ссылка
    // --------------------------------------------------------

    renderExternalLink(
      post.link_url || ""
    );
  }

  // ==========================================================
  // ТЕКСТ ПУБЛИКАЦИИ
  // ==========================================================

  function renderContent(content) {
    if (!elements.content) {
      return;
    }

    const safeText = String(content);

    /*
     * Не используем innerHTML для текста пользователя.
     * Каждая строка выводится безопасно как обычный текст.
     */

    elements.content.innerHTML = "";

    const paragraphs =
      safeText
        .replace(/\r\n/g, "\n")
        .split(/\n{2,}/);

    paragraphs.forEach((paragraph) => {
      const cleaned =
        paragraph.trim();

      if (!cleaned) {
        return;
      }

      const p =
        document.createElement("p");

      p.textContent = cleaned;

      elements.content.appendChild(p);
    });
  }

  // ==========================================================
  // ИЗОБРАЖЕНИЕ
  // ==========================================================

  function renderImage(url, title) {
    if (
      !elements.image ||
      !elements.imageWrapper
    ) {
      return;
    }

    const safeUrl =
      TO.safeExternalUrl(url);

    if (!safeUrl) {
      elements.imageWrapper.hidden = true;
      elements.image.removeAttribute("src");
      return;
    }

    elements.imageWrapper.hidden = false;

    elements.image.src = safeUrl;
    elements.image.alt = title;
    elements.image.loading = "lazy";

    elements.image.onerror = () => {
      elements.imageWrapper.hidden = true;
    };
  }

  // ==========================================================
  // ВНЕШНЯЯ ССЫЛКА
  // ==========================================================

  function renderExternalLink(url) {
    if (!elements.link) {
      return;
    }

    const safeUrl =
      TO.safeExternalUrl(url);

    if (!safeUrl) {
      elements.link.hidden = true;
      elements.link.removeAttribute("href");
      return;
    }

    elements.link.href = safeUrl;
    elements.link.target = "_blank";
    elements.link.rel =
      "noopener noreferrer";

    elements.link.hidden = false;
  }

  // ==========================================================
  // META / TITLE
  // ==========================================================

  function updateDocumentMeta(post) {
    const title =
      post.title || "Tajik Opportunities";

    document.title =
      `${title} — Tajik Opportunities`;

    const description =
      String(post.content || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);

    updateMeta(
      'meta[name="description"]',
      description
    );

    updateMeta(
      'meta[property="og:title"]',
      title
    );

    updateMeta(
      'meta[property="og:description"]',
      description
    );

    if (post.image_url) {
      const safeImage =
        TO.safeExternalUrl(
          post.image_url
        );

      if (safeImage) {
        updateMeta(
          'meta[property="og:image"]',
          safeImage
        );
      }
    }
  }

  function updateMeta(selector, value) {
    const meta =
      document.querySelector(selector);

    if (meta && value) {
      meta.setAttribute(
        "content",
        value
      );
    }
  }

  // ==========================================================
  // ПОДЕЛИТЬСЯ
  // ==========================================================

  async function sharePost() {
    if (!state.post) {
      return;
    }

    const title =
      state.post.title ||
      "Tajik Opportunities";

    const url =
      window.location.href;

    if (
      navigator.share &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title,
          text:
            `${title} — Tajik Opportunities`,
          url,
        });

        return;
      } catch (error) {
        /*
         * Пользователь мог просто закрыть
         * системное окно Share.
         */
        if (
          error &&
          error.name === "AbortError"
        ) {
          return;
        }
      }
    }

    const copied =
      await TO.copyText(url);

    if (copied) {
      TO.showToast(
        "Ссылка скопирована.",
        "success"
      );
    } else {
      TO.showToast(
        "Не удалось скопировать ссылку.",
        "error"
      );
    }
  }

  // ==========================================================
  // UI СОСТОЯНИЯ
  // ==========================================================

  function showLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden = false;
    }

    if (elements.contentState) {
      elements.contentState.hidden = true;
    }

    if (elements.errorState) {
      elements.errorState.hidden = true;
    }
  }

  function hideLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden = true;
    }
  }

  function showContent() {
    if (elements.contentState) {
      elements.contentState.hidden = false;
    }
  }

  function showError(message) {
    if (elements.loadingState) {
      elements.loadingState.hidden = true;
    }

    if (elements.contentState) {
      elements.contentState.hidden = true;
    }

    if (elements.errorState) {
      elements.errorState.hidden = false;
    }

    if (elements.errorMessage) {
      elements.errorMessage.textContent =
        message;
    }
  }

  function hideError() {
    if (elements.errorState) {
      elements.errorState.hidden = true;
    }
  }
})();
