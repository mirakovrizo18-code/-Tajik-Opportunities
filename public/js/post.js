/* ============================================================
   TAJIK OPPORTUNITIES
   Publication page
   ============================================================ */

(() => {
  "use strict";

  const API_URL = "/api/posts";

  let currentPost = null;

  /* ==========================================================
     DOM
     ========================================================== */

  const loading = document.getElementById(
    "postLoading"
  );

  const content = document.getElementById(
    "postContent"
  );

  const error = document.getElementById(
    "postError"
  );

  const errorMessage = document.getElementById(
    "postErrorMessage"
  );

  const retryButton = document.getElementById(
    "postRetry"
  );

  const backButton = document.getElementById(
    "postBack"
  );

  const category = document.getElementById(
    "postCategory"
  );

  const date = document.getElementById(
    "postDate"
  );

  const title = document.getElementById(
    "postTitle"
  );

  const author = document.getElementById(
    "postAuthor"
  );

  const authorName = document.getElementById(
    "postAuthorName"
  );

  const imageWrapper = document.getElementById(
    "postImageWrapper"
  );

  const image = document.getElementById(
    "postImage"
  );

  const text = document.getElementById(
    "postText"
  );

  const linkBox = document.getElementById(
    "postLink"
  );

  const externalLink = document.getElementById(
    "postExternalLink"
  );

  const shareButton = document.getElementById(
    "postShare"
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

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(parsed);
  }

  function getCategoryIcon(value) {
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

    return icons[value] || "✨";
  }

  function show(element) {
    if (element) {
      element.hidden = false;
    }
  }

  function hide(element) {
    if (element) {
      element.hidden = true;
    }
  }

  /* ==========================================================
     GET POST ID
     ========================================================== */

  function getPostId() {
    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("id");
  }

  /* ==========================================================
     API
     ========================================================== */

  async function fetchPosts() {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (
      !data ||
      !Array.isArray(data.posts)
    ) {
      throw new Error(
        "Некорректный ответ сервера."
      );
    }

    return data.posts;
  }

  async function loadPost() {
    show(loading);
    hide(content);
    hide(error);

    const postId = getPostId();

    if (!postId) {
      showError(
        "В URL не указан идентификатор публикации."
      );

      return;
    }

    try {
      const posts = await fetchPosts();

      const post = posts.find(
        (item) =>
          String(item.id) ===
          String(postId)
      );

      if (!post) {
        showError(
          "Публикация не найдена или больше недоступна."
        );

        return;
      }

      currentPost = post;

      renderPost(post);

      hide(loading);
      show(content);

      updatePageMeta(post);
    } catch (err) {
      console.error(
        "Failed to load post:",
        err
      );

      showError(
        "Не удалось получить данные публикации. Проверьте подключение к интернету и попробуйте снова."
      );
    }
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  function renderPost(post) {
    const postCategory =
      String(
        post.category || "Другое"
      );

    const postTitle =
      String(
        post.title || "Без заголовка"
      );

    const postContent =
      String(
        post.content || ""
      );

    /* --------------------------------------------------------
       CATEGORY
       -------------------------------------------------------- */

    if (category) {
      category.textContent =
        `${getCategoryIcon(
          postCategory
        )} ${postCategory}`;
    }

    /* --------------------------------------------------------
       DATE
       -------------------------------------------------------- */

    if (date) {
      const formatted =
        formatDate(
          post.published_at
        );

      date.textContent =
        formatted || "Дата неизвестна";
    }

    /* --------------------------------------------------------
       TITLE
       -------------------------------------------------------- */

    if (title) {
      title.textContent =
        postTitle;
    }

    /* --------------------------------------------------------
       AUTHOR
       -------------------------------------------------------- */

    const name =
      String(
        post.author_name || ""
      ).trim();

    if (author && authorName) {
      if (name) {
        authorName.textContent = name;
        show(author);
      } else {
        hide(author);
      }
    }

    /* --------------------------------------------------------
       IMAGE
       -------------------------------------------------------- */

    const imageUrl =
      String(
        post.image_url || ""
      ).trim();

    if (
      image &&
      imageWrapper &&
      imageUrl
    ) {
      image.src = imageUrl;
      image.alt = postTitle;

      image.onerror = () => {
        hide(imageWrapper);
      };

      show(imageWrapper);
    } else {
      hide(imageWrapper);
    }

    /* --------------------------------------------------------
       TEXT
       -------------------------------------------------------- */

    if (text) {
      /*
       * Текст публикации намеренно вставляется
       * как обычный текст, а не через innerHTML.
       * Это защищает страницу от HTML/XSS
       * в пользовательских заявках.
       */

      text.textContent =
        postContent;

      text.style.whiteSpace =
        "pre-wrap";
    }

    /* --------------------------------------------------------
       EXTERNAL LINK
       -------------------------------------------------------- */

    const url =
      String(
        post.link_url || ""
      ).trim();

    if (
      linkBox &&
      externalLink &&
      url
    ) {
      externalLink.href = url;

      show(linkBox);
    } else {
      hide(linkBox);
    }
  }

  /* ==========================================================
     PAGE META
     ========================================================== */

  function updatePageMeta(post) {
    const postTitle =
      String(
        post.title || "Публикация"
      ).trim();

    document.title =
      `${postTitle} — Tajik Opportunities`;

    const description =
      String(
        post.content || ""
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);

    let meta =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!meta) {
      meta =
        document.createElement(
          "meta"
        );

      meta.name =
        "description";

      document.head.appendChild(
        meta
      );
    }

    meta.content =
      description ||
      "Публикация на Tajik Opportunities.";

    updateOpenGraph(
      "og:title",
      postTitle
    );

    updateOpenGraph(
      "og:description",
      description ||
        "Публикация на Tajik Opportunities."
    );

    updateOpenGraph(
      "og:type",
      "article"
    );
  }

  function updateOpenGraph(
    property,
    value
  ) {
    let meta =
      document.querySelector(
        `meta[property="${property}"]`
      );

    if (!meta) {
      meta =
        document.createElement(
          "meta"
        );

      meta.setAttribute(
        "property",
        property
      );

      document.head.appendChild(
        meta
      );
    }

    meta.setAttribute(
      "content",
      value
    );
  }

  /* ==========================================================
     SHARE
     ========================================================== */

  async function sharePost() {
    if (!currentPost) {
      return;
    }

    const shareUrl =
      window.location.href;

    const shareTitle =
      String(
        currentPost.title ||
          "Tajik Opportunities"
      );

    const shareText =
      `Посмотрите эту публикацию на Tajik Opportunities: ${shareTitle}`;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });

        return;
      }

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );

        showToast(
          "Ссылка скопирована"
        );

        return;
      }

      fallbackCopy(
        shareUrl
      );
    } catch (err) {
      /*
       * Пользователь мог просто закрыть
       * системное окно «Поделиться».
       * В этом случае не показываем ошибку.
       */

      if (
        err &&
        err.name ===
          "AbortError"
      ) {
        return;
      }

      console.error(
        "Share error:",
        err
      );
    }
  }

  /* ==========================================================
     COPY FALLBACK
     ========================================================== */

  function fallbackCopy(value) {
    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value =
      value;

    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";

    document.body.appendChild(
      textarea
    );

    textarea.select();

    try {
      document.execCommand(
        "copy"
      );

      showToast(
        "Ссылка скопирована"
      );
    } catch {
      showToast(
        "Не удалось скопировать ссылку"
      );
    }

    textarea.remove();
  }

  /* ==========================================================
     TOAST
     ========================================================== */

  function showToast(message) {
    const toast =
      document.getElementById(
        "toast"
      );

    if (!toast) {
      return;
    }

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(() => {
        toast.classList.remove(
          "show"
        );
      }, 3000);
  }

  /* ==========================================================
     ERROR
     ========================================================== */

  function showError(message) {
    hide(loading);
    hide(content);
    show(error);

    if (errorMessage) {
      errorMessage.textContent =
        message;
    }
  }

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  function goBack() {
    if (
      window.history.length > 1
    ) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }

  /* ==========================================================
     EVENTS
     ========================================================== */

  function initEvents() {
    if (retryButton) {
      retryButton.addEventListener(
        "click",
        loadPost
      );
    }

    if (backButton) {
      backButton.addEventListener(
        "click",
        goBack
      );
    }

    if (shareButton) {
      shareButton.addEventListener(
        "click",
        sharePost
      );
    }
  }

  /* ==========================================================
     INIT
     ========================================================== */

  function init() {
    initEvents();
    loadPost();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
