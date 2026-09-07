/* ============================================================
   TAJIK OPPORTUNITIES
   ADMIN CONTROL CENTER
   public/js/admin.js

   VERSION: 2026.09.07

   ADMIN MODE:
   - Без входа
   - Без пароля
   - Без регистрации
   - Сразу открывается панель
   - Полные права super_admin

   УПРАВЛЕНИЕ:
   - Dashboard
   - Статистика
   - Заявки
   - Публикации
   - Участники
   - Комментарии
   - Чаты
   - Уведомления
   - Корзина
   - Модерация
   - Редактирование данных
============================================================ */

"use strict";

/* ============================================================
   STATE
============================================================ */

const state = {
  authenticated: true,
  loading: false,

  admin: {
    id: "key-admin",
    name: "Главный администратор",
    username: "admin",
    role: "super_admin",
    permissions: ["*"],
    is_active: true
  },

  stats: {},
  submissions: [],
  posts: [],
  users: [],
  comments: [],
  chats: [],
  notifications: [],
  audit: [],

  trashPosts: [],
  rejectedSubmissions: [],

  filter: "pending",
  postFilter: "all",
  trashFilter: "all",

  userSearch: "",
  userFilter: "all",

  selectedSubmission: null,
  selectedPost: null,
  selectedUser: null,
  selectedComment: null,
  selectedChat: null,

  editingCounters: false
};


/* ============================================================
   HELPERS
============================================================ */

function $(id) {
  return document.getElementById(id);
}


function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {
  return escapeHtml(value);
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return escapeHtml(value);
    }

    return date.toLocaleString(
      "ru-RU",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  } catch {
    return escapeHtml(value);
  }
}


function formatNumber(value) {
  const number = Number(value || 0);

  return number.toLocaleString("ru-RU");
}


function getValue(id) {
  const element = $(id);

  if (!element) {
    return "";
  }

  return String(element.value || "").trim();
}


function setValue(id, value) {
  const element = $(id);

  if (!element) {
    return;
  }

  element.value =
    value === null ||
    value === undefined
      ? ""
      : value;
}


function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}


function getQuery(name) {
  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(name);
}


/* ============================================================
   API
============================================================ */

async function api(
  url,
  options = {}
) {
  const requestOptions = {
    credentials: "include",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {})
    }
  };

  if (
    requestOptions.body &&
    typeof requestOptions.body !== "string"
  ) {
    requestOptions.headers[
      "Content-Type"
    ] = "application/json";

    requestOptions.body =
      JSON.stringify(
        requestOptions.body
      );
  }

  const response =
    await fetch(
      url,
      requestOptions
    );

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json()
        .catch(() => ({}));
  } else {
    const text =
      await response.text()
        .catch(() => "");

    data = {
      ok: response.ok,
      message: text
    };
  }

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        data?.error ||
        `Ошибка API: ${response.status}`
      );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
}


function handleUnauthorized(error) {
  if (
    error &&
    error.status === 401
  ) {
    console.error(
      "Admin authorization is disabled. Worker should allow admin access."
    );

    return false;
  }

  return false;
}


/* ============================================================
   NOTIFICATION
============================================================ */

function notify(
  message,
  type = "success"
) {
  const old =
    document.querySelector(
      ".admin-toast"
    );

  old?.remove();

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `admin-toast admin-toast-${type}`;

  toast.textContent =
    message;

  Object.assign(
    toast.style,
    {
      position: "fixed",
      right: "22px",
      bottom: "22px",
      zIndex: "99999",
      padding: "14px 18px",
      borderRadius: "14px",
      background: "#111827",
      color: "#fff",
      boxShadow:
        "0 15px 45px rgba(0,0,0,.22)",
      fontWeight: "700",
      maxWidth: "420px"
    }
  );

  document.body.appendChild(
    toast
  );

  setTimeout(
    () => toast.remove(),
    3500
  );
}


/* ============================================================
   ADMIN INFORMATION
============================================================ */

async function loadAdmin() {
  try {
    const data =
      await api(
        "/api/admin/me"
      );

    if (data?.admin) {
      state.admin =
        data.admin;
    }

    updateAdminIdentity();

  } catch (error) {
    /*
     * Авторизация отключена.
     * Даже если /me отсутствует,
     * панель продолжает работать.
     */

    console.warn(
      "Не удалось получить /api/admin/me:",
      error
    );

    updateAdminIdentity();
  }
}


function updateAdminIdentity() {
  const name =
    state.admin?.name ||
    "Главный администратор";

  const username =
    state.admin?.username ||
    "admin";

  document
    .querySelectorAll(
      "[data-admin-name]"
    )
    .forEach(
      element => {
        element.textContent =
          name;
      }
    );

  document
    .querySelectorAll(
      "[data-admin-username]"
    )
    .forEach(
      element => {
        element.textContent =
          `@${username}`;
      }
    );

  document
    .querySelectorAll(
      "[data-admin-role]"
    )
    .forEach(
      element => {
        element.textContent =
          "SUPER ADMIN";
      }
    );
}


/* ============================================================
   DASHBOARD
============================================================ */

async function loadStats() {
  try {
    const data =
      await api(
        "/api/admin/stats"
      );

    state.stats =
      data.stats ||
      data ||
      {};

    renderStats();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Stats error:",
      error
    );
  }
}


function renderStats() {
  const stats =
    state.stats ||
    {};

  const values = {
    total:
      stats.total ||
      stats.total_publications ||
      stats.publications ||
      0,

    pending:
      stats.pending ||
      stats.pending_publications ||
      stats.pending_submissions ||
      0,

    published:
      stats.published ||
      stats.published_publications ||
      0,

    users:
      stats.users ||
      stats.total_users ||
      stats.participants ||
      0,

    comments:
      stats.comments ||
      stats.total_comments ||
      0,

    chats:
      stats.chats ||
      stats.total_chats ||
      0,

    notifications:
      stats.notifications ||
      stats.total_notifications ||
      0,

    views:
      stats.views ||
      stats.total_views ||
      0,

    likes:
      stats.likes ||
      stats.total_likes ||
      0
  };

  const map = {
    adminTotal:
      values.total,

    adminPending:
      values.pending,

    adminPublished:
      values.published,

    adminUsers:
      values.users,

    adminComments:
      values.comments,

    adminChats:
      values.chats,

    adminNotifications:
      values.notifications,

    adminViews:
      values.views,

    adminLikes:
      values.likes,

    totalPublications:
      values.total,

    pendingPublications:
      values.pending,

    publishedPublications:
      values.published,

    totalUsers:
      values.users
  };

  Object.entries(map)
    .forEach(
      ([id, value]) => {
        const element =
          $(id);

        if (element) {
          element.textContent =
            formatNumber(value);
        }
      }
    );
}


/* ============================================================
   SUBMISSIONS
============================================================ */

async function loadSubmissions() {
  try {
    const url =
      `/api/admin/submissions?status=${encodeURIComponent(
        state.filter
      )}`;

    const data =
      await api(url);

    state.submissions =
      data.submissions ||
      data.publications ||
      data.items ||
      [];

    renderSubmissions();

    updateSubmissionCounters();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Submissions error:",
      error
    );

    renderSubmissionsError(
      error
    );
  }
}


function renderSubmissionsError(
  error
) {
  const list =
    $("adminSubmissionsList") ||
    $("submissionsList");

  if (!list) {
    return;
  }

  list.innerHTML = `
    <div class="admin-empty">
      ⚠️ Не удалось загрузить заявки.<br>
      <small>
        ${escapeHtml(
          error?.message ||
          "Ошибка сервера"
        )}
      </small>
    </div>
  `;
}


function updateSubmissionCounters() {
  const count =
    state.submissions.length;

  document
    .querySelectorAll(
      "[data-pending-count]"
    )
    .forEach(
      element => {
        element.textContent =
          formatNumber(count);
      }
    );
}


function renderSubmissions() {
  const list =
    $("adminSubmissionsList") ||
    $("submissionsList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!state.submissions.length) {
    list.innerHTML = `
      <div class="admin-empty">
        <div style="font-size:42px;">
          📭
        </div>
        <strong>
          Заявок нет
        </strong>
        <div>
          В выбранном разделе пока ничего нет.
        </div>
      </div>
    `;

    return;
  }

  state.submissions.forEach(
    submission => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      const title =
        submission.title ||
        "Без названия";

      const author =
        submission.user_name ||
        submission.author_name ||
        submission.contact_name ||
        submission.username ||
        "Участник";

      const status =
        submission.status ||
        state.filter ||
        "pending";

      card.innerHTML = `
        <div class="admin-card-top">
          <div>
            <h3 class="admin-card-title">
              ${escapeHtml(title)}
            </h3>

            <div class="admin-card-meta">
              <span class="admin-badge">
                👤 ${escapeHtml(author)}
              </span>

              <span class="admin-badge">
                ID:
                ${escapeHtml(
                  submission.id
                )}
              </span>

              <span class="admin-badge">
                ${escapeHtml(status)}
              </span>
            </div>
          </div>
        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            submission.text ||
            submission.description ||
            ""
          ).slice(0, 500)}
        </div>

        <div class="admin-card-meta">
          📍 ${escapeHtml(
            submission.city ||
            submission.location ||
            "Не указано"
          )}
          ·
          📅 ${formatDate(
            submission.created_at
          )}
        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-primary"
            data-action="submission-open"
          >
            👁 Открыть
          </button>

          ${
            status === "pending"
              ? `
                <button
                  type="button"
                  class="admin-button admin-button-success"
                  data-action="submission-approve"
                >
                  ✓ Одобрить
                </button>

                <button
                  type="button"
                  class="admin-button admin-button-danger"
                  data-action="submission-reject"
                >
                  ✕ Отклонить
                </button>
              `
              : ""
          }

        </div>
      `;

      card
        .querySelector(
          '[data-action="submission-open"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openSubmission(
              submission
            )
        );

      card
        .querySelector(
          '[data-action="submission-approve"]'
        )
        ?.addEventListener(
          "click",
          () =>
            approveSubmission(
              submission.id
            )
        );

      card
        .querySelector(
          '[data-action="submission-reject"]'
        )
        ?.addEventListener(
          "click",
          () =>
            rejectSubmission(
              submission.id
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


function openSubmission(
  submission
) {
  state.selectedSubmission =
    submission;

  let modal =
    $("submissionModal");

  if (!modal) {
    createSubmissionModal();

    modal =
      $("submissionModal");
  }

  const title =
    $("submissionModalTitle");

  const body =
    $("submissionModalBody");

  if (title) {
    title.textContent =
      submission.title ||
      "Заявка";
  }

  if (body) {
    body.innerHTML =
      renderPublicationDetails(
        submission
      );
  }

  modal.hidden = false;
}


function createSubmissionModal() {
  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "submissionModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">
        <h2 id="submissionModalTitle">
          Заявка
        </h2>

        <button
          id="submissionClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>
      </div>

      <div
        id="submissionModalBody"
        class="admin-modal-body"
      ></div>

      <div class="admin-modal-footer">

        <button
          id="submissionCancel"
          type="button"
          class="admin-button admin-button-light"
        >
          Закрыть
        </button>

        <button
          id="submissionReject"
          type="button"
          class="admin-button admin-button-danger"
        >
          ✕ Отклонить
        </button>

        <button
          id="submissionApprove"
          type="button"
          class="admin-button admin-button-success"
        >
          ✓ Одобрить
        </button>

      </div>
    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("submissionClose")
    ?.addEventListener(
      "click",
      closeSubmissionModal
    );

  $("submissionCancel")
    ?.addEventListener(
      "click",
      closeSubmissionModal
    );

  $("submissionApprove")
    ?.addEventListener(
      "click",
      () => {
        if (
          state.selectedSubmission
        ) {
          approveSubmission(
            state.selectedSubmission.id
          );
        }
      }
    );

  $("submissionReject")
    ?.addEventListener(
      "click",
      () => {
        if (
          state.selectedSubmission
        ) {
          rejectSubmission(
            state.selectedSubmission.id
          );
        }
      }
    );
}


function closeSubmissionModal() {
  const modal =
    $("submissionModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedSubmission =
    null;
}


async function approveSubmission(
  id
) {
  if (!id) {
    return;
  }

  if (
    !confirm(
      "Одобрить эту публикацию?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/publication/action",
      {
        method: "POST",
        body: {
          id,
          action: "approve"
        }
      }
    );

    notify(
      "Публикация одобрена."
    );

    closeSubmissionModal();

    await Promise.all([
      loadSubmissions(),
      loadPosts(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось одобрить публикацию.",
      "error"
    );
  }
}


async function rejectSubmission(
  id
) {
  if (!id) {
    return;
  }

  const reason =
    prompt(
      "Причина отклонения:",
      ""
    );

  if (reason === null) {
    return;
  }

  try {
    await api(
      "/api/admin/publication/action",
      {
        method: "POST",
        body: {
          id,
          action: "reject",
          rejection_reason:
            reason
        }
      }
    );

    notify(
      "Публикация отклонена."
    );

    closeSubmissionModal();

    await Promise.all([
      loadSubmissions(),
      loadPosts(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось отклонить публикацию.",
      "error"
    );
  }
}


/* ============================================================
   PUBLICATIONS
============================================================ */

async function loadPosts() {
  try {
    const data =
      await api(
        "/api/admin/publications"
      );

    state.posts =
      data.publications ||
      data.posts ||
      data.items ||
      [];

    renderPosts();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Posts error:",
      error
    );
  }
}


function renderPosts() {
  const list =
    $("adminPostsList") ||
    $("postsList");

  if (!list) {
    return;
  }

  let posts =
    [...state.posts];

  if (
    state.postFilter &&
    state.postFilter !== "all"
  ) {
    posts =
      posts.filter(
        post =>
          post.status ===
          state.postFilter
      );
  }

  list.innerHTML = "";

  if (!posts.length) {
    list.innerHTML = `
      <div class="admin-empty">
        📄 Публикаций нет.
      </div>
    `;

    return;
  }

  posts.forEach(
    post => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <div class="admin-card-top">

          <div>
            <h3 class="admin-card-title">
              ${escapeHtml(
                post.title ||
                "Без названия"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ${escapeHtml(
                  post.status ||
                  "unknown"
                )}
              </span>

              <span class="admin-badge">
                ID:
                ${escapeHtml(
                  post.id
                )}
              </span>

              ${
                post.pinned
                  ? `
                    <span class="admin-badge">
                      📌 Закреплено
                    </span>
                  `
                  : ""
              }

              ${
                post.featured
                  ? `
                    <span class="admin-badge">
                      ⭐ Важное
                    </span>
                  `
                  : ""
              }

            </div>
          </div>

        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            post.text ||
            post.description ||
            ""
          ).slice(0, 600)}
        </div>

        <div class="admin-card-meta">

          👁 ${formatNumber(
            post.views
          )}

          · ❤️ ${formatNumber(
            post.likes
          )}

          · 💬 ${formatNumber(
            post.comments
          )}

          ·
          ${formatDate(
            post.created_at
          )}

        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-primary"
            data-action="post-open"
          >
            👁 Открыть
          </button>

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="post-edit"
          >
            ✏️ Изменить
          </button>

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="post-counters"
          >
            📊 Счётчики
          </button>

          <button
            type="button"
            class="admin-button admin-button-danger"
            data-action="post-delete"
          >
            🗑 Удалить
          </button>

        </div>
      `;

      card
        .querySelector(
          '[data-action="post-open"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openPost(post)
        );

      card
        .querySelector(
          '[data-action="post-edit"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openPostEdit(post)
        );

      card
        .querySelector(
          '[data-action="post-counters"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openCountersEditor(post)
        );

      card
        .querySelector(
          '[data-action="post-delete"]'
        )
        ?.addEventListener(
          "click",
          () =>
            deletePost(post.id)
        );

      list.appendChild(
        card
      );
    }
  );
}


function renderPublicationDetails(
  post
) {
  const ignored =
    new Set([
      "text",
      "description",
      "media",
      "created_at",
      "updated_at"
    ]);

  let fields = "";

  Object.entries(
    post || {}
  ).forEach(
    ([key, value]) => {

      if (
        ignored.has(key)
      ) {
        return;
      }

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return;
      }

      let display =
        value;

      if (
        typeof value ===
        "object"
      ) {
        display =
          safeJson(value);
      }

      fields += `
        <div
          style="
            padding:12px 0;
            border-bottom:1px solid rgba(0,0,0,.08);
          "
        >
          <strong>
            ${escapeHtml(key)}
          </strong>

          <div
            style="
              margin-top:4px;
              word-break:break-word;
            "
          >
            ${escapeHtml(display)}
          </div>
        </div>
      `;
    }
  );

  return `
    <div>

      <div
        style="
          margin-bottom:20px;
          font-size:16px;
          line-height:1.7;
        "
      >
        ${escapeHtml(
          post?.text ||
          post?.description ||
          "Нет текста"
        )}
      </div>

      <div>
        ${fields}
      </div>

      <div
        style="
          margin-top:20px;
          color:#6b7280;
        "
      >
        Создано:
        ${formatDate(
          post?.created_at
        )}
      </div>

      <div
        style="
          color:#6b7280;
        "
      >
        Изменено:
        ${formatDate(
          post?.updated_at
        )}
      </div>

    </div>
  `;
}


function openPost(post) {
  state.selectedPost =
    post;

  let modal =
    $("postModal");

  if (!modal) {
    createPostModal();

    modal =
      $("postModal");
  }

  const title =
    $("postModalTitle");

  const body =
    $("postModalBody");

  if (title) {
    title.textContent =
      post.title ||
      "Публикация";
  }

  if (body) {
    body.innerHTML =
      renderPublicationDetails(
        post
      );
  }

  modal.hidden = false;
}


function createPostModal() {
  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "postModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">

        <h2 id="postModalTitle">
          Публикация
        </h2>

        <button
          id="postModalClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <div
        id="postModalBody"
        class="admin-modal-body"
      ></div>

      <div class="admin-modal-footer">

        <button
          id="postModalCancel"
          type="button"
          class="admin-button admin-button-light"
        >
          Закрыть
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("postModalClose")
    ?.addEventListener(
      "click",
      closePostModal
    );

  $("postModalCancel")
    ?.addEventListener(
      "click",
      closePostModal
    );
}


function closePostModal() {
  const modal =
    $("postModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedPost =
    null;
}


/* ============================================================
   PUBLICATION EDITOR
============================================================ */

function openPostEdit(post) {
  state.selectedPost =
    post;

  let modal =
    $("postEditModal");

  if (!modal) {
    createPostEditModal();

    modal =
      $("postEditModal");
  }

  setValue(
    "postEditTitle",
    post.title
  );

  setValue(
    "postEditText",
    post.text ||
    post.description
  );

  setValue(
    "postEditCategory",
    post.category
  );

  setValue(
    "postEditCity",
    post.city
  );

  setValue(
    "postEditStatus",
    post.status
  );

  setValue(
    "postEditPrice",
    post.price
  );

  setValue(
    "postEditCurrency",
    post.currency
  );

  setValue(
    "postEditLocation",
    post.location
  );

  setValue(
    "postEditContactName",
    post.contact_name
  );

  setValue(
    "postEditContactPhone",
    post.contact_phone
  );

  setValue(
    "postEditContactTelegram",
    post.contact_telegram
  );

  setValue(
    "postEditContactEmail",
    post.contact_email
  );

  setValue(
    "postEditExternalUrl",
    post.external_url
  );

  const pinned =
    $("postEditPinned");

  if (pinned) {
    pinned.checked =
      Boolean(
        post.pinned
      );
  }

  const featured =
    $("postEditFeatured");

  if (featured) {
    featured.checked =
      Boolean(
        post.featured
      );
  }

  modal.hidden = false;
}


function createPostEditModal() {
  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "postEditModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">

        <h2>
          ✏️ Редактирование публикации
        </h2>

        <button
          id="postEditClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <form
        id="postEditForm"
        class="admin-modal-body"
      >

        <label>
          Название
          <input
            id="postEditTitle"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Текст
          <textarea
            id="postEditText"
            class="admin-textarea"
            rows="8"
          ></textarea>
        </label>

        <label>
          Категория
          <input
            id="postEditCategory"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Город
          <input
            id="postEditCity"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Статус
          <select
            id="postEditStatus"
            class="admin-input"
          >
            <option value="pending">
              pending
            </option>

            <option value="published">
              published
            </option>

            <option value="rejected">
              rejected
            </option>

            <option value="draft">
              draft
            </option>

            <option value="archived">
              archived
            </option>
          </select>
        </label>

        <label>
          Цена
          <input
            id="postEditPrice"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Валюта
          <input
            id="postEditCurrency"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Местоположение
          <input
            id="postEditLocation"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Контактное имя
          <input
            id="postEditContactName"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Телефон
          <input
            id="postEditContactPhone"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Telegram
          <input
            id="postEditContactTelegram"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Email
          <input
            id="postEditContactEmail"
            class="admin-input"
            type="email"
          >
        </label>

        <label>
          Внешняя ссылка
          <input
            id="postEditExternalUrl"
            class="admin-input"
            type="url"
          >
        </label>

        <label
          style="
            display:flex;
            gap:10px;
            align-items:center;
          "
        >
          <input
            id="postEditPinned"
            type="checkbox"
          >

          📌 Закрепить
        </label>

        <label
          style="
            display:flex;
            gap:10px;
            align-items:center;
          "
        >
          <input
            id="postEditFeatured"
            type="checkbox"
          >

          ⭐ Сделать важной
        </label>

        <div class="admin-modal-footer">

          <button
            id="postEditCancel"
            type="button"
            class="admin-button admin-button-light"
          >
            Отмена
          </button>

          <button
            type="submit"
            class="admin-button admin-button-primary"
          >
            💾 Сохранить
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("postEditClose")
    ?.addEventListener(
      "click",
      closePostEditModal
    );

  $("postEditCancel")
    ?.addEventListener(
      "click",
      closePostEditModal
    );

  $("postEditForm")
    ?.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        savePost();
      }
    );
}


function closePostEditModal() {
  const modal =
    $("postEditModal");

  if (modal) {
    modal.hidden = true;
  }
}


async function savePost() {
  const post =
    state.selectedPost;

  if (!post) {
    return;
  }

  const payload = {
    id: post.id,

    title:
      getValue(
        "postEditTitle"
      ),

    text:
      getValue(
        "postEditText"
      ),

    category:
      getValue(
        "postEditCategory"
      ),

    city:
      getValue(
        "postEditCity"
      ),

    status:
      getValue(
        "postEditStatus"
      ),

    price:
      getValue(
        "postEditPrice"
      ),

    currency:
      getValue(
        "postEditCurrency"
      ),

    location:
      getValue(
        "postEditLocation"
      ),

    contact_name:
      getValue(
        "postEditContactName"
      ),

    contact_phone:
      getValue(
        "postEditContactPhone"
      ),

    contact_telegram:
      getValue(
        "postEditContactTelegram"
      ),

    contact_email:
      getValue(
        "postEditContactEmail"
      ),

    external_url:
      getValue(
        "postEditExternalUrl"
      ),

    pinned:
      Boolean(
        $("postEditPinned")
          ?.checked
      ),

    featured:
      Boolean(
        $("postEditFeatured")
          ?.checked
      )
  };

  try {
    await api(
      "/api/admin/publication/edit",
      {
        method: "POST",
        body: payload
      }
    );

    notify(
      "Публикация сохранена."
    );

    closePostEditModal();

    await Promise.all([
      loadPosts(),
      loadSubmissions(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось сохранить публикацию.",
      "error"
    );
  }
}


/* ============================================================
   COUNTERS
============================================================ */

function createCountersModal() {
  if (
    $("countersModal")
  ) {
    return;
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "countersModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">

        <h2>
          📊 Ручное изменение счётчиков
        </h2>

        <button
          id="countersClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <div class="admin-modal-body">

        <input
          id="counterViews"
          class="admin-input"
          type="number"
          min="0"
          placeholder="Просмотры"
        >

        <input
          id="counterLikes"
          class="admin-input"
          type="number"
          min="0"
          placeholder="Лайки"
        >

        <input
          id="counterComments"
          class="admin-input"
          type="number"
          min="0"
          placeholder="Комментарии"
        >

        <input
          id="counterSaves"
          class="admin-input"
          type="number"
          min="0"
          placeholder="Сохранения"
        >

        <input
          id="counterShares"
          class="admin-input"
          type="number"
          min="0"
          placeholder="Репосты"
        >

        <input
          id="counterLove"
          class="admin-input"
          type="number"
          min="0"
          placeholder="❤️ Love"
        >

        <input
          id="counterSupport"
          class="admin-input"
          type="number"
          min="0"
          placeholder="👍 Support"
        >

        <input
          id="counterFunny"
          class="admin-input"
          type="number"
          min="0"
          placeholder="😂 Funny"
        >

        <input
          id="counterWow"
          class="admin-input"
          type="number"
          min="0"
          placeholder="😮 Wow"
        >

        <input
          id="counterSad"
          class="admin-input"
          type="number"
          min="0"
          placeholder="😢 Sad"
        >

        <input
          id="counterAngry"
          class="admin-input"
          type="number"
          min="0"
          placeholder="😡 Angry"
        >

      </div>

      <div class="admin-modal-footer">

        <button
          id="countersCancel"
          type="button"
          class="admin-button admin-button-light"
        >
          Отмена
        </button>

        <button
          id="countersSave"
          type="button"
          class="admin-button admin-button-primary"
        >
          💾 Сохранить
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("countersClose")
    ?.addEventListener(
      "click",
      closeCountersEditor
    );

  $("countersCancel")
    ?.addEventListener(
      "click",
      closeCountersEditor
    );

  $("countersSave")
    ?.addEventListener(
      "click",
      saveCounters
    );
}


function openCountersEditor(
  post
) {
  state.selectedPost =
    post;

  createCountersModal();

  setValue(
    "counterViews",
    post.views || 0
  );

  setValue(
    "counterLikes",
    post.likes || 0
  );

  setValue(
    "counterComments",
    post.comments || 0
  );

  setValue(
    "counterSaves",
    post.saves || 0
  );

  setValue(
    "counterShares",
    post.shares || 0
  );

  setValue(
    "counterLove",
    post.love || 0
  );

  setValue(
    "counterSupport",
    post.support || 0
  );

  setValue(
    "counterFunny",
    post.funny || 0
  );

  setValue(
    "counterWow",
    post.wow || 0
  );

  setValue(
    "counterSad",
    post.sad || 0
  );

  setValue(
    "counterAngry",
    post.angry || 0
  );

  const modal =
    $("countersModal");

  if (modal) {
    modal.hidden = false;
  }
}


function closeCountersEditor() {
  const modal =
    $("countersModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedPost =
    null;
}


async function saveCounters() {
  const post =
    state.selectedPost;

  if (!post) {
    return;
  }

  const counters = {
    views:
      Number(
        getValue(
          "counterViews"
        )
      ) || 0,

    likes:
      Number(
        getValue(
          "counterLikes"
        )
      ) || 0,

    comments:
      Number(
        getValue(
          "counterComments"
        )
      ) || 0,

    saves:
      Number(
        getValue(
          "counterSaves"
        )
      ) || 0,

    shares:
      Number(
        getValue(
          "counterShares"
        )
      ) || 0,

    love:
      Number(
        getValue(
          "counterLove"
        )
      ) || 0,

    support:
      Number(
        getValue(
          "counterSupport"
        )
      ) || 0,

    funny:
      Number(
        getValue(
          "counterFunny"
        )
      ) || 0,

    wow:
      Number(
        getValue(
          "counterWow"
        )
      ) || 0,

    sad:
      Number(
        getValue(
          "counterSad"
        )
      ) || 0,

    angry:
      Number(
        getValue(
          "counterAngry"
        )
      ) || 0
  };

  try {
    await api(
      "/api/admin/publication/counters",
      {
        method: "POST",
        body: {
          id: post.id,
          ...counters
        }
      }
    );

    notify(
      "Счётчики обновлены."
    );

    closeCountersEditor();

    await Promise.all([
      loadPosts(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось изменить счётчики.",
      "error"
    );
  }
}


/* ============================================================
   DELETE POST
============================================================ */

async function deletePost(
  id
) {
  if (!id) {
    return;
  }

  if (
    !confirm(
      "Переместить публикацию в корзину?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/publication/action",
      {
        method: "POST",
        body: {
          id,
          action: "delete"
        }
      }
    );

    notify(
      "Публикация перемещена в корзину."
    );

    await Promise.all([
      loadPosts(),
      loadTrash(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось удалить публикацию.",
      "error"
    );
  }
}


/* ============================================================
   TRASH
============================================================ */

async function loadTrash() {
  try {
    const data =
      await api(
        "/api/admin/trash"
      );

    state.trashPosts =
      data.posts ||
      data.publications ||
      data.items ||
      [];

    renderTrash();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Trash error:",
      error
    );
  }
}


function renderTrash() {
  const list =
    $("adminTrashList") ||
    $("trashList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!state.trashPosts.length) {
    list.innerHTML = `
      <div class="admin-empty">
        🗑 Корзина пуста.
      </div>
    `;

    return;
  }

  state.trashPosts.forEach(
    post => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <h3 class="admin-card-title">
          ${escapeHtml(
            post.title ||
            "Без названия"
          )}
        </h3>

        <div class="admin-card-meta">
          ID:
          ${escapeHtml(
            post.id
          )}

          ·

          ${formatDate(
            post.updated_at ||
            post.created_at
          )}
        </div>

        <div class="admin-card-actions">

          <button
            class="admin-button admin-button-success"
            type="button"
            data-action="restore"
          >
            ♻️ Восстановить
          </button>

          <button
            class="admin-button admin-button-danger"
            type="button"
            data-action="permanent"
          >
            🗑 Удалить навсегда
          </button>

        </div>
      `;

      card
        .querySelector(
          '[data-action="restore"]'
        )
        ?.addEventListener(
          "click",
          () =>
            restorePost(
              post.id
            )
        );

      card
        .querySelector(
          '[data-action="permanent"]'
        )
        ?.addEventListener(
          "click",
          () =>
            permanentDeletePost(
              post.id
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


async function restorePost(
  id
) {
  if (
    !confirm(
      "Восстановить публикацию?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/trash/restore",
      {
        method: "POST",
        body: {
          id
        }
      }
    );

    notify(
      "Публикация восстановлена."
    );

    await Promise.all([
      loadTrash(),
      loadPosts(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось восстановить.",
      "error"
    );
  }
}


async function permanentDeletePost(
  id
) {
  if (
    !confirm(
      "Удалить публикацию НАВСЕГДА? Это действие нельзя отменить."
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/trash/permanent-delete",
      {
        method: "POST",
        body: {
          id
        }
      }
    );

    notify(
      "Публикация удалена навсегда."
    );

    await loadTrash();

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось удалить.",
      "error"
    );
  }
}


async function emptyTrash() {
  if (
    !confirm(
      "Полностью очистить корзину?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/trash/empty",
      {
        method: "POST"
      }
    );

    notify(
      "Корзина очищена."
    );

    await Promise.all([
      loadTrash(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось очистить корзину.",
      "error"
    );
  }
}


async function trashAllPosts() {
  if (
    !confirm(
      "Переместить все публикации в корзину?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/trash/all",
      {
        method: "POST"
      }
    );

    notify(
      "Публикации перемещены в корзину."
    );

    await Promise.all([
      loadPosts(),
      loadTrash(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось выполнить действие.",
      "error"
    );
  }
}


/* ============================================================
   USERS / PARTICIPANTS
============================================================ */

async function loadUsers() {
  try {
    const data =
      await api(
        "/api/admin/users"
      );

    state.users =
      data.users ||
      data.participants ||
      data.items ||
      [];

    renderUsers();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Users error:",
      error
    );
  }
}


function renderUsers() {
  const list =
    $("adminUsersList") ||
    $("usersList") ||
    $("participantsList");

  if (!list) {
    return;
  }

  let users =
    [...state.users];

  const search =
    state.userSearch
      .toLowerCase()
      .trim();

  if (search) {
    users =
      users.filter(
        user => {

          const values =
            Object.values(
              user || {}
            )
              .filter(
                value =>
                  value !== null &&
                  value !== undefined
              )
              .map(
                value =>
                  typeof value ===
                  "object"
                    ? safeJson(value)
                    : String(value)
              )
              .join(" ")
              .toLowerCase();

          return values.includes(
            search
          );
        }
      );
  }

  if (
    state.userFilter &&
    state.userFilter !== "all"
  ) {
    users =
      users.filter(
        user => {

          const status =
            String(
              user.status ||
              user.account_status ||
              "active"
            )
              .toLowerCase();

          return (
            status ===
            state.userFilter
          );
        }
      );
  }

  list.innerHTML = "";

  if (!users.length) {
    list.innerHTML = `
      <div class="admin-empty">
        👤 Участники не найдены.
      </div>
    `;

    return;
  }

  users.forEach(
    user => {

      const id =
        user.id ||
        user.user_id ||
        user.uuid ||
        "";

      const name =
        user.name ||
        user.full_name ||
        user.display_name ||
        user.username ||
        user.contact_name ||
        "Без имени";

      const status =
        user.status ||
        user.account_status ||
        "active";

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <div class="admin-card-top">

          <div>

            <h3 class="admin-card-title">
              ${escapeHtml(name)}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ID:
                ${escapeHtml(id)}
              </span>

              <span class="admin-badge">
                ${escapeHtml(status)}
              </span>

            </div>

          </div>

        </div>

        <div class="admin-card-preview">

          ${
            user.phone
              ? `📞 ${escapeHtml(user.phone)}<br>`
              : ""
          }

          ${
            user.email
              ? `✉️ ${escapeHtml(user.email)}<br>`
              : ""
          }

          ${
            user.city
              ? `📍 ${escapeHtml(user.city)}<br>`
              : ""
          }

          ${
            user.created_at
              ? `📅 ${formatDate(user.created_at)}`
              : ""
          }

        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-primary"
            data-action="user-open"
          >
            👁 Все данные
          </button>

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="user-edit"
          >
            ✏️ Изменить
          </button>

          <button
            type="button"
            class="admin-button admin-button-danger"
            data-action="user-delete"
          >
            🗑 Удалить
          </button>

        </div>
      `;

      card
        .querySelector(
          '[data-action="user-open"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openUser(user)
        );

      card
        .querySelector(
          '[data-action="user-edit"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openUserEdit(user)
        );

      card
        .querySelector(
          '[data-action="user-delete"]'
        )
        ?.addEventListener(
          "click",
          () =>
            manageUser(
              id,
              "delete"
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


function renderUserAllData(
  user
) {
  let html = "";

  Object.entries(
    user || {}
  ).forEach(
    ([key, value]) => {

      let display =
        value;

      if (
        value === null ||
        value === undefined
      ) {
        display = "—";
      }

      if (
        typeof value ===
        "object"
      ) {
        display =
          safeJson(value);
      }

      html += `
        <div
          style="
            padding:13px 0;
            border-bottom:1px solid rgba(0,0,0,.08);
          "
        >

          <div
            style="
              font-size:12px;
              color:#6b7280;
              margin-bottom:4px;
              font-weight:700;
            "
          >
            ${escapeHtml(key)}
          </div>

          <div
            style="
              word-break:break-word;
            "
          >
            ${escapeHtml(display)}
          </div>

        </div>
      `;
    }
  );

  return html;
}


function openUser(user) {
  state.selectedUser =
    user;

  let modal =
    $("userModal");

  if (!modal) {
    createUserModal();

    modal =
      $("userModal");
  }

  const body =
    $("userModalBody");

  if (body) {
    body.innerHTML =
      renderUserAllData(
        user
      );
  }

  modal.hidden = false;
}


function createUserModal() {
  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "userModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">

        <h2>
          👤 Данные участника
        </h2>

        <button
          id="userModalClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <div
        id="userModalBody"
        class="admin-modal-body"
      ></div>

      <div class="admin-modal-footer">

        <button
          id="userModalEdit"
          type="button"
          class="admin-button admin-button-primary"
        >
          ✏️ Изменить
        </button>

        <button
          id="userModalCancel"
          type="button"
          class="admin-button admin-button-light"
        >
          Закрыть
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("userModalClose")
    ?.addEventListener(
      "click",
      closeUserModal
    );

  $("userModalCancel")
    ?.addEventListener(
      "click",
      closeUserModal
    );

  $("userModalEdit")
    ?.addEventListener(
      "click",
      () => {

        if (
          state.selectedUser
        ) {
          openUserEdit(
            state.selectedUser
          );
        }

      }
    );
}


function closeUserModal() {
  const modal =
    $("userModal");

  if (modal) {
    modal.hidden = true;
  }
}


function openUserEdit(
  user
) {
  state.selectedUser =
    user;

  let modal =
    $("userEditModal");

  if (!modal) {
    createUserEditModal();

    modal =
      $("userEditModal");
  }

  setValue(
    "userEditName",
    user.name ||
    user.full_name ||
    user.display_name
  );

  setValue(
    "userEditUsername",
    user.username
  );

  setValue(
    "userEditEmail",
    user.email
  );

  setValue(
    "userEditPhone",
    user.phone
  );

  setValue(
    "userEditCity",
    user.city
  );

  setValue(
    "userEditCountry",
    user.country
  );

  setValue(
    "userEditBio",
    user.bio
  );

  setValue(
    "userEditTelegram",
    user.contact_telegram ||
    user.telegram
  );

  setValue(
    "userEditStatus",
    user.status ||
    "active"
  );

  modal.hidden = false;
}


function createUserEditModal() {
  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "userEditModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">

        <h2>
          ✏️ Изменить участника
        </h2>

        <button
          id="userEditClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <form
        id="userEditForm"
        class="admin-modal-body"
      >

        <label>
          Имя
          <input
            id="userEditName"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Username
          <input
            id="userEditUsername"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Email
          <input
            id="userEditEmail"
            class="admin-input"
            type="email"
          >
        </label>

        <label>
          Телефон
          <input
            id="userEditPhone"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Город
          <input
            id="userEditCity"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Страна
          <input
            id="userEditCountry"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Telegram
          <input
            id="userEditTelegram"
            class="admin-input"
            type="text"
          >
        </label>

        <label>
          Статус
          <select
            id="userEditStatus"
            class="admin-input"
          >
            <option value="active">
              active
            </option>

            <option value="blocked">
              blocked
            </option>

            <option value="banned">
              banned
            </option>

            <option value="inactive">
              inactive
            </option>
          </select>
        </label>

        <label>
          Описание
          <textarea
            id="userEditBio"
            class="admin-textarea"
            rows="6"
          ></textarea>
        </label>

        <div class="admin-modal-footer">

          <button
            id="userEditCancel"
            type="button"
            class="admin-button admin-button-light"
          >
            Отмена
          </button>

          <button
            type="submit"
            class="admin-button admin-button-primary"
          >
            💾 Сохранить
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("userEditClose")
    ?.addEventListener(
      "click",
      closeUserEditModal
    );

  $("userEditCancel")
    ?.addEventListener(
      "click",
      closeUserEditModal
    );

  $("userEditForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        saveUser();

      }
    );
}


function closeUserEditModal() {
  const modal =
    $("userEditModal");

  if (modal) {
    modal.hidden = true;
  }
}


async function saveUser() {
  const user =
    state.selectedUser;

  if (!user) {
    return;
  }

  const id =
    user.id ||
    user.user_id ||
    user.uuid;

  try {
    await api(
      "/api/admin/user/edit",
      {
        method: "POST",
        body: {
          id,

          name:
            getValue(
              "userEditName"
            ),

          username:
            getValue(
              "userEditUsername"
            ),

          email:
            getValue(
              "userEditEmail"
            ),

          phone:
            getValue(
              "userEditPhone"
            ),

          city:
            getValue(
              "userEditCity"
            ),

          country:
            getValue(
              "userEditCountry"
            ),

          bio:
            getValue(
              "userEditBio"
            ),

          contact_telegram:
            getValue(
              "userEditTelegram"
            ),

          status:
            getValue(
              "userEditStatus"
            )
        }
      }
    );

    notify(
      "Данные участника изменены."
    );

    closeUserEditModal();

    await loadUsers();

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось изменить участника.",
      "error"
    );
  }
}


async function manageUser(
  id,
  action
) {
  if (!id) {
    return;
  }

  const texts = {
    delete:
      "Удалить участника?",
    ban:
      "Заблокировать участника?",
    unban:
      "Разблокировать участника?"
  };

  if (
    !confirm(
      texts[action] ||
      "Выполнить действие?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/user/action",
      {
        method: "POST",
        body: {
          id,
          action
        }
      }
    );

    notify(
      "Действие выполнено."
    );

    await Promise.all([
      loadUsers(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось выполнить действие.",
      "error"
    );
  }
}


/* ============================================================
   COMMENTS
============================================================ */

async function loadComments() {
  try {
    const data =
      await api(
        "/api/admin/comments"
      );

    state.comments =
      data.comments ||
      data.items ||
      [];

    renderComments();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Comments error:",
      error
    );
  }
}


function renderComments() {
  const list =
    $("adminCommentsList") ||
    $("commentsList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!state.comments.length) {
    list.innerHTML = `
      <div class="admin-empty">
        💬 Комментариев нет.
      </div>
    `;

    return;
  }

  state.comments.forEach(
    comment => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <div class="admin-card-top">

          <div>

            <h3 class="admin-card-title">
              ${escapeHtml(
                comment.author_name ||
                comment.username ||
                "Пользователь"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ID:
                ${escapeHtml(
                  comment.id
                )}
              </span>

              <span class="admin-badge">
                ${formatDate(
                  comment.created_at
                )}
              </span>

            </div>

          </div>

        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            comment.content ||
            comment.text ||
            ""
          )}
        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="comment-edit"
          >
            ✏️ Изменить
          </button>

          <button
            type="button"
            class="admin-button admin-button-danger"
            data-action="comment-delete"
          >
            🗑 Удалить
          </button>

        </div>
      `;

      card
        .querySelector(
          '[data-action="comment-edit"]'
        )
        ?.addEventListener(
          "click",
          () =>
            editComment(
              comment
            )
        );

      card
        .querySelector(
          '[data-action="comment-delete"]'
        )
        ?.addEventListener(
          "click",
          () =>
            deleteComment(
              comment.id
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


async function editComment(
  comment
) {
  const current =
    comment.content ||
    comment.text ||
    "";

  const text =
    prompt(
      "Измените комментарий:",
      current
    );

  if (text === null) {
    return;
  }

  try {
    await api(
      "/api/admin/comment/edit",
      {
        method: "POST",
        body: {
          id: comment.id,
          content: text
        }
      }
    );

    notify(
      "Комментарий изменён."
    );

    await Promise.all([
      loadComments(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось изменить комментарий.",
      "error"
    );
  }
}


async function deleteComment(
  id
) {
  if (
    !confirm(
      "Удалить комментарий?"
    )
  ) {
    return;
  }

  try {
    await api(
      "/api/admin/comment/action",
      {
        method: "POST",
        body: {
          id,
          action: "delete"
        }
      }
    );

    notify(
      "Комментарий удалён."
    );

    await Promise.all([
      loadComments(),
      loadStats()
    ]);

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось удалить комментарий.",
      "error"
    );
  }
}


/* ============================================================
   CHATS
============================================================ */

async function loadChats() {
  try {
    const data =
      await api(
        "/api/admin/chats"
      );

    state.chats =
      data.chats ||
      data.conversations ||
      data.items ||
      [];

    renderChats();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Chats error:",
      error
    );
  }
}


function renderChats() {
  const list =
    $("adminChatsList") ||
    $("chatsList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!state.chats.length) {
    list.innerHTML = `
      <div class="admin-empty">
        💬 Чатов пока нет.
      </div>
    `;

    return;
  }

  state.chats.forEach(
    chat => {

      const userId =
        chat.user_id ||
        chat.userId ||
        chat.id;

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <div class="admin-card-top">

          <div>

            <h3 class="admin-card-title">
              ${escapeHtml(
                chat.user_name ||
                chat.name ||
                chat.username ||
                "Пользователь"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ID:
                ${escapeHtml(
                  userId
                )}
              </span>

              <span class="admin-badge">
                ${formatDate(
                  chat.updated_at ||
                  chat.last_message_at
                )}
              </span>

              ${
                chat.unread
                  ? `
                    <span class="admin-badge">
                      🔴 ${formatNumber(chat.unread)}
                    </span>
                  `
                  : ""
              }

            </div>

          </div>

        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            chat.last_message ||
            chat.message ||
            "Нет сообщений"
          )}
        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-primary"
            data-action="chat-open"
          >
            💬 Открыть чат
          </button>

        </div>
      `;

      card
        .querySelector(
          '[data-action="chat-open"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openAdminChat(
              userId
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


async function openAdminChat(
  userId
) {
  try {
    const data =
      await api(
        `/api/admin/chat/messages?user_id=${encodeURIComponent(
          userId
        )}`
      );

    state.selectedChat = {
      userId,
      messages:
        data.messages ||
        []
    };

    showAdminChatModal();

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось открыть чат.",
      "error"
    );
  }
}


function showAdminChatModal() {
  let modal =
    $("adminChatModal");

  if (!modal) {
    createAdminChatModal();

    modal =
      $("adminChatModal");
  }

  const body =
    $("adminChatBody");

  if (!body) {
    return;
  }

  const messages =
    state.selectedChat?.messages ||
    [];

  body.innerHTML =
    messages.length
      ? messages
          .map(
            message => {

              const isAdmin =
                message.sender_type ===
                  "admin" ||
                message.author_type ===
                  "admin";

              return `
                <div
                  style="
                    padding:13px;
                    margin-bottom:9px;
                    border-radius:14px;
                    background:${
                      isAdmin
                        ? "#e8f1ff"
                        : "#f3f4f6"
                    };
                  "
                >

                  <strong>
                    ${escapeHtml(
                      message.sender_name ||
                      message.author_name ||
                      (
                        isAdmin
                          ? "Администратор"
                          : "Пользователь"
                      )
                    )}
                  </strong>

                  <div
                    style="
                      margin-top:6px;
                      line-height:1.55;
                      white-space:pre-wrap;
                    "
                  >
                    ${escapeHtml(
                      message.content ||
                      message.text ||
                      ""
                    )}
                  </div>

                  <small
                    style="
                      display:block;
                      margin-top:7px;
                      color:#6b7280;
                    "
                  >
                    ${formatDate(
                      message.created_at
                    )}
                  </small>

                </div>
              `;
            }
          )
          .join("")
      : `
          <div class="admin-empty">
            Сообщений нет.
          </div>
        `;

  modal.hidden = false;

  requestAnimationFrame(
    () => {
      body.scrollTop =
        body.scrollHeight;
    }
  );
}


function createAdminChatModal() {
  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "adminChatModal";

  modal.className =
    "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-box">

      <div class="admin-modal-header">

        <h2>
          💬 Чат с участником
        </h2>

        <button
          id="adminChatClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <div
        id="adminChatBody"
        class="admin-modal-body"
        style="
          max-height:500px;
          overflow:auto;
        "
      ></div>

      <div class="admin-modal-body">

        <textarea
          id="adminChatMessage"
          class="admin-textarea"
          style="min-height:100px;"
          placeholder="Введите ответ участнику..."
        ></textarea>

      </div>

      <div class="admin-modal-footer">

        <button
          id="adminChatCancel"
          type="button"
          class="admin-button admin-button-light"
        >
          Закрыть
        </button>

        <button
          id="adminChatSend"
          type="button"
          class="admin-button admin-button-success"
        >
          📤 Отправить
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(
    modal
  );

  $("adminChatClose")
    ?.addEventListener(
      "click",
      closeAdminChat
    );

  $("adminChatCancel")
    ?.addEventListener(
      "click",
      closeAdminChat
    );

  $("adminChatSend")
    ?.addEventListener(
      "click",
      sendAdminChatMessage
    );
}


function closeAdminChat() {
  const modal =
    $("adminChatModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedChat =
    null;
}


async function sendAdminChatMessage() {
  const chat =
    state.selectedChat;

  if (!chat) {
    return;
  }

  const content =
    getValue(
      "adminChatMessage"
    );

  if (!content) {
    notify(
      "Введите сообщение.",
      "error"
    );

    return;
  }

  try {
    await api(
      "/api/admin/chat/send",
      {
        method: "POST",
        body: {
          user_id:
            chat.userId,

          content
        }
      }
    );

    setValue(
      "adminChatMessage",
      ""
    );

    await openAdminChat(
      chat.userId
    );

    notify(
      "Сообщение отправлено."
    );

    await loadChats();

  } catch (error) {
    handleUnauthorized(error);

    notify(
      error.message ||
      "Не удалось отправить сообщение.",
      "error"
    );
  }
}


/* ============================================================
   NOTIFICATIONS
============================================================ */

async function loadNotifications() {
  try {
    const data =
      await api(
        "/api/admin/notifications"
      );

    state.notifications =
      data.notifications ||
      data.items ||
      [];

    renderNotifications();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Notifications error:",
      error
    );
  }
}


function renderNotifications() {
  const list =
    $("adminNotificationsList") ||
    $("notificationsList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!state.notifications.length) {
    list.innerHTML = `
      <div class="admin-empty">
        🔔 Уведомлений нет.
      </div>
    `;

    return;
  }

  state.notifications.forEach(
    notification => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <h3 class="admin-card-title">
          ${escapeHtml(
            notification.title ||
            "Уведомление"
          )}
        </h3>

        <div class="admin-card-preview">
          ${escapeHtml(
            notification.message ||
            notification.content ||
            ""
          )}
        </div>

        <div class="admin-card-meta">

          ${formatDate(
            notification.created_at
          )}

        </div>
      `;

      list.appendChild(
        card
      );
    }
  );
}


/* ============================================================
   AUDIT LOG
============================================================ */

async function loadAudit() {
  try {
    const data =
      await api(
        "/api/admin/audit"
      );

    state.audit =
      data.audit ||
      data.logs ||
      data.items ||
      [];

    renderAudit();

  } catch (error) {
    handleUnauthorized(error);

    console.error(
      "Audit error:",
      error
    );
  }
}


function renderAudit() {
  const list =
    $("adminAuditList") ||
    $("auditList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!state.audit.length) {
    list.innerHTML = `
      <div class="admin-empty">
        📋 Журнал действий пуст.
      </div>
    `;

    return;
  }

  state.audit.forEach(
    item => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      card.innerHTML = `
        <div class="admin-card-top">

          <strong>
            ${escapeHtml(
              item.action ||
              item.event ||
              "Действие"
            )}
          </strong>

          <span class="admin-badge">
            ${formatDate(
              item.created_at
            )}
          </span>

        </div>

        <div class="admin-card-preview">

          ${escapeHtml(
            item.description ||
            item.message ||
            item.target ||
            ""
          )}

        </div>

        <div class="admin-card-meta">

          Администратор:
          ${escapeHtml(
            item.admin_name ||
            "Главный администратор"
          )}

        </div>
      `;

      list.appendChild(
        card
      );
    }
  );
}


/* ============================================================
   FILTERS
============================================================ */

function setupFilters() {

  document
    .querySelectorAll(
      "[data-admin-filter]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          async () => {

            const filter =
              button.dataset
                .adminFilter;

            if (!filter) {
              return;
            }

            state.filter =
              filter;

            document
              .querySelectorAll(
                "[data-admin-filter]"
              )
              .forEach(
                item =>
                  item.classList.toggle(
                    "active",
                    item === button
                  )
              );

            await loadSubmissions();

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-post-filter]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            state.postFilter =
              button.dataset
                .postFilter ||
              "all";

            document
              .querySelectorAll(
                "[data-post-filter]"
              )
              .forEach(
                item =>
                  item.classList.toggle(
                    "active",
                    item === button
                  )
              );

            renderPosts();

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-trash-filter]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            state.trashFilter =
              button.dataset
                .trashFilter ||
              "all";

            document
              .querySelectorAll(
                "[data-trash-filter]"
              )
              .forEach(
                item =>
                  item.classList.toggle(
                    "active",
                    item === button
                  )
              );

            renderTrash();

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-user-filter]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            state.userFilter =
              button.dataset
                .userFilter ||
              "all";

            document
              .querySelectorAll(
                "[data-user-filter]"
              )
              .forEach(
                item =>
                  item.classList.toggle(
                    "active",
                    item === button
                  )
              );

            renderUsers();

          }
        );

      }
    );


  const userSearch =
    $("adminUserSearch") ||
    $("userSearch");

  userSearch
    ?.addEventListener(
      "input",
      event => {

        state.userSearch =
          event.target.value;

        renderUsers();

      }
    );
}


/* ============================================================
   REFRESH
============================================================ */

async function refreshEverything() {
  if (state.loading) {
    return;
  }

  state.loading =
    true;

  try {

    await Promise.allSettled([
      loadAdmin(),
      loadStats(),
      loadSubmissions(),
      loadPosts(),
      loadTrash(),
      loadUsers(),
      loadComments(),
      loadChats(),
      loadNotifications(),
      loadAudit()
    ]);

    updateAdminIdentity();

    notify(
      "Панель обновлена."
    );

  } finally {
    state.loading =
      false;
  }
}


/* ============================================================
   EVENTS
============================================================ */

function setupEvents() {

  /*
   * Старая форма входа больше НЕ используется.
   */

  const loginButton =
    $("adminLoginButton");

  if (loginButton) {
    loginButton.style.display =
      "none";
  }

  const password =
    $("adminPassword");

  if (password) {
    password.style.display =
      "none";
  }

  const loginForm =
    $("adminLoginForm");

  if (loginForm) {
    loginForm.style.display =
      "none";
  }


  /*
   * Старую кнопку logout скрываем.
   */

  const logout =
    $("adminLogout");

  if (logout) {
    logout.style.display =
      "none";
  }


  $("adminRefresh")
    ?.addEventListener(
      "click",
      refreshEverything
    );


  $("adminPostsRefresh")
    ?.addEventListener(
      "click",
      async () => {

        await Promise.all([
          loadPosts(),
          loadStats()
        ]);

        notify(
          "Публикации обновлены."
        );

      }
    );


  $("adminTrashRefresh")
    ?.addEventListener(
      "click",
      async () => {

        await Promise.all([
          loadTrash(),
          loadStats()
        ]);

        notify(
          "Корзина обновлена."
        );

      }
    );


  $("adminUsersRefresh")
    ?.addEventListener(
      "click",
      async () => {

        await Promise.all([
          loadUsers(),
          loadStats()
        ]);

        notify(
          "Участники обновлены."
        );

      }
    );


  $("adminCommentsRefresh")
    ?.addEventListener(
      "click",
      async () => {

        await Promise.all([
          loadComments(),
          loadStats()
        ]);

      }
    );


  $("adminChatsRefresh")
    ?.addEventListener(
      "click",
      loadChats
    );


  $("adminNotificationsRefresh")
    ?.addEventListener(
      "click",
      loadNotifications
    );


  $("adminAuditRefresh")
    ?.addEventListener(
      "click",
      loadAudit
    );


  $("trashEmptyButton")
    ?.addEventListener(
      "click",
      emptyTrash
    );


  $("trashAllPostsButton")
    ?.addEventListener(
      "click",
      trashAllPosts
    );


  document
    .querySelectorAll(
      [
        "submissionModal",
        "postModal",
        "postEditModal",
        "countersModal",
        "userModal",
        "userEditModal",
        "adminChatModal"
      ].map(
        id => `#${id}`
      ).join(",")
    )
    .forEach(
      modal => {

        modal.addEventListener(
          "click",
          event => {

            if (
              event.target !==
              event.currentTarget
            ) {
              return;
            }

            const map = {
              submissionModal:
                closeSubmissionModal,

              postModal:
                closePostModal,

              postEditModal:
                closePostEditModal,

              countersModal:
                closeCountersEditor,

              userModal:
                closeUserModal,

              userEditModal:
                closeUserEditModal,

              adminChatModal:
                closeAdminChat
            };

            map[
              modal.id
            ]?.();

          }
        );

      }
    );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      closeSubmissionModal();
      closePostModal();
      closePostEditModal();
      closeCountersEditor();
      closeUserModal();
      closeUserEditModal();
      closeAdminChat();

    }
  );
}


/* ============================================================
   REMOVE OLD LOGIN UI
============================================================ */

function removeOldLoginUI() {

  const selectors = [
    "#adminLogin",
    "#adminLoginPanel",
    ".admin-login",
    ".admin-login-panel",
    "[data-admin-login]"
  ];

  selectors.forEach(
    selector => {

      document
        .querySelectorAll(
          selector
        )
        .forEach(
          element => {

            /*
             * Не удаляем случайно
             * весь admin dashboard.
             * Скрываем только явно
             * обозначенные login-блоки.
             */

            element.hidden =
              true;

            element.style.display =
              "none";

          }
        );

    }
  );


  document
    .querySelectorAll(
      "[data-admin-dashboard]"
    )
    .forEach(
      element => {
        element.hidden =
          false;

        element.style.display =
          "";
      }
    );
}


/* ============================================================
   SHOW ADMIN PANEL
============================================================ */

function showDashboard() {

  state.authenticated =
    true;

  removeOldLoginUI();

  document
    .querySelectorAll(
      "[data-admin-dashboard]"
    )
    .forEach(
      element => {
        element.hidden =
          false;
      }
    );

  document
    .querySelectorAll(
      ".admin-dashboard"
    )
    .forEach(
      element => {

        if (
          element.dataset
            .adminDashboard ===
          "true"
        ) {
          element.hidden =
            false;
        }

      }
    );
}


/* ============================================================
   NEW AUTH FLOW
============================================================ */

async function checkAuthentication() {

  /*
   * Вход полностью отключён.
   *
   * Панель считается авторизованной
   * сразу после открытия страницы.
   */

  state.authenticated =
    true;

  showDashboard();

  updateAdminIdentity();

  await refreshEverything();
}


/*
 * Совместимость со старым admin.html.
 *
 * Если старый HTML где-то всё ещё
 * вызывает handleLogin(), функция
 * просто открывает панель.
 */
function handleLogin() {
  state.authenticated =
    true;

  showDashboard();

  refreshEverything();
}


/*
 * Совместимость со старым HTML.
 *
 * Реального logout больше нет.
 */
function handleLogout() {
  state.authenticated =
    true;

  showDashboard();

  notify(
    "Вход администратора отключён.",
    "info"
  );
}


/* ============================================================
   GLOBAL ADMIN API
============================================================ */

window.TajikAdmin = {
  state,

  api,

  refresh:
    refreshEverything,

  loadStats,

  loadSubmissions,

  loadPosts,

  loadUsers,

  loadComments,

  loadChats,

  loadNotifications,

  loadAudit,

  openPost,

  openPostEdit,

  openUser,

  openUserEdit,

  openAdminChat
};


/* ============================================================
   START
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    createCountersModal();

    setupEvents();

    setupFilters();

    showDashboard();

    await checkAuthentication();

  }
);
