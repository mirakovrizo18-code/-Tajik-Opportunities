/* ============================================================
   TAJIK OPPORTUNITIES
   ADMIN CONTROL CENTER
   /js/admin.js

   Полное управление:
   - администрация
   - статистика
   - участники
   - публикации
   - ручные счётчики
   - модерация
   - корзина
   - комментарии
   - чаты
   - уведомления
   - платежи
============================================================ */


/* ============================================================
   STATE
============================================================ */

const state = {
  authenticated: false,
  loading: false,

  submissions: [],
  posts: [],

  users: [],
  comments: [],
  chats: [],
  notifications: [],

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

const $ = id =>
  document.getElementById(id);


async function api(
  url,
  options = {}
) {
  const response = await fetch(
    url,
    {
      credentials: "same-origin",
      ...options,

      headers: {
        "content-type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.error ||
      data.message ||
      `Ошибка ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  return data;
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttr(value) {
  return escapeHtml(value);
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "ru-RU",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("ru-RU");
}


function getValue(id) {
  return String(
    $(id)?.value || ""
  ).trim();
}


function setValue(
  id,
  value
) {
  const element = $(id);

  if (element) {
    element.value =
      value ?? "";
  }
}


function showMessage(
  element,
  message,
  type = ""
) {
  if (!element) {
    return;
  }

  element.textContent =
    message;

  element.className =
    type
      ? `admin-message ${type} show`
      : "admin-message";
}


function handleUnauthorized(error) {
  if (
    error &&
    error.status === 401
  ) {
    state.authenticated = false;

    showLogin();

    return true;
  }

  return false;
}


/* ============================================================
   AUTHENTICATION
============================================================ */

function showLogin() {
  const login =
    $("adminLogin");

  const dashboard =
    $("adminDashboard");

  if (login) {
    login.hidden = false;
    login.style.display = "";
  }

  if (dashboard) {
    dashboard.hidden = true;
    dashboard.classList.remove(
      "active"
    );
  }

  state.authenticated =
    false;
}


function showDashboard() {
  const login =
    $("adminLogin");

  const dashboard =
    $("adminDashboard");

  if (login) {
    login.hidden = true;
    login.style.display = "none";
  }

  if (dashboard) {
    dashboard.hidden = false;
    dashboard.style.display = "block";
    dashboard.classList.add(
      "active"
    );
  }

  state.authenticated =
    true;
}


async function checkAuthentication() {
  try {
    await api(
      "/api/admin/me"
    );

    showDashboard();

    await refreshEverything();

  } catch {
    showLogin();
  }
}


async function handleLogin() {
  const input =
    $("adminPassword");

  const button =
    $("adminLoginButton");

  const message =
    $("adminLoginMessage");

  const password =
    input?.value || "";

  if (!password) {
    showMessage(
      message,
      "Введите пароль администратора.",
      "error"
    );

    return;
  }

  if (button) {
    button.disabled = true;
  }

  showMessage(
    message,
    "Проверяем пароль..."
  );

  try {
    await api(
      "/api/admin/login",
      {
        method: "POST",

        body: JSON.stringify({
          password
        })
      }
    );

    if (input) {
      input.value = "";
    }

    showMessage(
      message,
      "Вход выполнен.",
      "success"
    );

    showDashboard();

    await refreshEverything();

  } catch (error) {
    showMessage(
      message,
      error.message ||
      "Не удалось войти.",
      "error"
    );

  } finally {
    if (button) {
      button.disabled = false;
    }
  }
}


async function handleLogout() {
  try {
    await api(
      "/api/admin/logout",
      {
        method: "POST"
      }
    );
  } catch {
    // локальный выход
  }

  state.authenticated =
    false;

  state.submissions = [];
  state.posts = [];
  state.users = [];
  state.comments = [];
  state.chats = [];
  state.notifications = [];

  state.trashPosts = [];
  state.rejectedSubmissions = [];

  showLogin();
}


/* ============================================================
   REFRESH EVERYTHING
============================================================ */

async function refreshEverything() {
  if (!state.authenticated) {
    return;
  }

  state.loading = true;

  const requests = [
    loadStats(),
    loadSubmissions(),
    loadPosts(),
    loadTrash(),

    loadUsers(),
    loadComments(),
    loadChats(),
    loadNotifications()
  ];

  await Promise.allSettled(
    requests
  );

  state.loading = false;
}


/* ============================================================
   STATISTICS
============================================================ */

async function loadStats() {
  try {
    let data;

    try {
      data = await api(
        "/api/admin/dashboard"
      );
    } catch {
      data = await api(
        "/api/admin/stats"
      );
    }

    const stats =
      data.stats ||
      data.dashboard ||
      data ||
      {};

    setText(
      "pendingCount",
      stats.pending ??
      stats.pending_posts ??
      0
    );

    setText(
      "approvedCount",
      stats.approved ??
      stats.published ??
      stats.approved_posts ??
      0
    );

    setText(
      "rejectedCount",
      stats.rejected ??
      stats.rejected_posts ??
      0
    );

    setText(
      "totalCount",
      stats.total_posts ??
      stats.total ??
      0
    );

    setText(
      "trashCount",
      stats.trash_posts ??
      stats.trash ??
      0
    );

    setText(
      "totalSubmissionsCount",
      stats.total_submissions ??
      stats.submissions ??
      0
    );

    /* Дополнительные статистические поля,
       если они присутствуют в HTML */

    setText(
      "usersCount",
      stats.users ??
      stats.total_users ??
      stats.participants ??
      0
    );

    setText(
      "commentsCount",
      stats.comments ??
      stats.total_comments ??
      0
    );

    setText(
      "viewsCount",
      stats.views ??
      stats.total_views ??
      0
    );

    setText(
      "likesCount",
      stats.likes ??
      stats.total_likes ??
      0
    );

    setText(
      "sharesCount",
      stats.shares ??
      stats.total_shares ??
      0
    );

  } catch (error) {
    handleUnauthorized(error);
  }
}


function setText(
  id,
  value
) {
  const element = $(id);

  if (element) {
    element.textContent =
      formatNumber(value);
  }
}


/* ============================================================
   SUBMISSIONS
============================================================ */

async function loadSubmissions() {
  const loading =
    $("submissionsLoading");

  const errorBox =
    $("submissionsError");

  const empty =
    $("submissionsEmpty");

  if (loading) {
    loading.hidden = false;
  }

  if (errorBox) {
    errorBox.hidden = true;
  }

  try {
    let data;

    try {
      data = await api(
        `/api/admin/submissions?status=${encodeURIComponent(
          state.filter
        )}`
      );
    } catch {
      data = await api(
        `/api/admin/publications?status=${encodeURIComponent(
          state.filter
        )}`
      );
    }

    state.submissions =
      data.submissions ||
      data.publications ||
      [];

    renderSubmissions();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить заявки.";

      errorBox.hidden =
        false;
    }

  } finally {
    if (loading) {
      loading.hidden = true;
    }
  }
}


function renderSubmissions() {
  const list =
    $("submissionsList");

  const empty =
    $("submissionsEmpty");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (
    !state.submissions.length
  ) {
    if (empty) {
      empty.hidden = false;
    }

    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  state.submissions.forEach(
    submission => {

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
                submission.title ||
                "Без названия"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ${escapeHtml(
                  submission.category ||
                  "Без категории"
                )}
              </span>

              <span class="admin-badge">
                ${formatDate(
                  submission.created_at
                )}
              </span>

              <span class="admin-badge">
                👤 ${escapeHtml(
                  submission.author_name ||
                  submission.username ||
                  "Автор не указан"
                )}
              </span>

            </div>

          </div>

          <span class="admin-badge pending">
            ${escapeHtml(
              submission.status ||
              "pending"
            )}
          </span>

        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            submission.content ||
            ""
          )}
        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="submission-view"
          >
            👁 Открыть
          </button>

          ${
            submission.status === "pending"
              ? `
                <button
                  type="button"
                  class="admin-button admin-button-success"
                  data-action="submission-approve"
                >
                  ✅ Опубликовать
                </button>

                <button
                  type="button"
                  class="admin-button admin-button-danger"
                  data-action="submission-reject"
                >
                  ❌ Отклонить
                </button>
              `
              : ""
          }

        </div>
      `;

      card
        .querySelector(
          '[data-action="submission-view"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openSubmission(
              submission.id
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

      list.appendChild(card);
    }
  );
}


function openSubmission(id) {
  const submission =
    state.submissions.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!submission) {
    return;
  }

  state.selectedSubmission =
    submission;

  const modal =
    $("submissionModal");

  const body =
    $("submissionModalBody");

  if (!modal || !body) {
    return;
  }

  body.innerHTML = `
    <div class="admin-detail">

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Заголовок
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.title ||
            "Без названия"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Категория
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.category ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Автор
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.author_name ||
            submission.username ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          ID
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.id
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Контакт
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.contact ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Дата
        </span>

        <div class="admin-detail-value">
          ${formatDate(
            submission.created_at
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Статус
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.status ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Текст
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            submission.content ||
            ""
          )}
        </div>
      </div>

      ${
        submission.image_url
          ? `
            <div class="admin-detail-row">
              <span class="admin-detail-label">
                Изображение
              </span>

              <a
                href="${escapeAttr(
                  submission.image_url
                )}"
                target="_blank"
                rel="noopener"
              >
                Открыть изображение
              </a>
            </div>
          `
          : ""
      }

      ${
        submission.link_url
          ? `
            <div class="admin-detail-row">
              <span class="admin-detail-label">
                Ссылка
              </span>

              <a
                href="${escapeAttr(
                  submission.link_url
                )}"
                target="_blank"
                rel="noopener"
              >
                Открыть ссылку
              </a>
            </div>
          `
          : ""
      }

    </div>
  `;

  modal.hidden = false;
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


/* ============================================================
   APPROVE / REJECT
============================================================ */

async function approveSubmission(id) {
  const confirmed =
    confirm(
      "Опубликовать эту заявку?"
    );

  if (!confirmed) {
    return;
  }

  try {

    try {
      await api(
        `/api/admin/submissions/${encodeURIComponent(
          id
        )}/approve`,
        {
          method: "POST"
        }
      );
    } catch {
      await api(
        "/api/admin/publication/action",
        {
          method: "POST",

          body: JSON.stringify({
            id,
            action: "publish"
          })
        }
      );
    }

    closeSubmissionModal();

    await refreshEverything();

    alert(
      "✅ Публикация размещена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось опубликовать."
    );
  }
}


async function rejectSubmission(id) {
  const reason =
    prompt(
      "Укажите причину отклонения:"
    );

  if (reason === null) {
    return;
  }

  try {

    try {
      await api(
        `/api/admin/submissions/${encodeURIComponent(
          id
        )}/reject`,
        {
          method: "POST",

          body: JSON.stringify({
            reason:
              reason.trim() ||
              "Материал не соответствует требованиям."
          })
        }
      );
    } catch {
      await api(
        "/api/admin/publication/action",
        {
          method: "POST",

          body: JSON.stringify({
            id,
            action: "reject",
            reason:
              reason.trim() ||
              "Материал не соответствует требованиям."
          })
        }
      );
    }

    closeSubmissionModal();

    await refreshEverything();

    alert(
      "❌ Заявка отклонена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось отклонить заявку."
    );
  }
}


/* ============================================================
   POSTS
============================================================ */

async function loadPosts() {
  const loading =
    $("adminPostsLoading");

  const errorBox =
    $("adminPostsError");

  const empty =
    $("adminPostsEmpty");

  if (loading) {
    loading.hidden = false;
  }

  if (errorBox) {
    errorBox.hidden = true;
  }

  try {
    let data;

    try {
      data = await api(
        "/api/admin/posts"
      );
    } catch {
      data = await api(
        "/api/admin/publications"
      );
    }

    state.posts =
      data.posts ||
      data.publications ||
      [];

    renderPosts();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить публикации.";

      errorBox.hidden = false;
    }

  } finally {
    if (loading) {
      loading.hidden = true;
    }
  }
}


function renderPosts() {
  const list =
    $("adminPostsList");

  const empty =
    $("adminPostsEmpty");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  let posts =
    [...state.posts];

  if (
    state.postFilter !== "all"
  ) {
    posts =
      posts.filter(
        post =>
          post.category ===
          state.postFilter
      );
  }

  if (!posts.length) {
    if (empty) {
      empty.hidden = false;
    }

    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  posts.forEach(
    post => {

      const counters =
        getCounters(post);

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
                  post.category ||
                  "Без категории"
                )}
              </span>

              <span class="admin-badge">
                ${formatDate(
                  post.published_at ||
                  post.created_at
                )}
              </span>

              <span class="admin-badge">
                👤 ${escapeHtml(
                  post.author_name ||
                  post.username ||
                  "Автор"
                )}
              </span>

            </div>

          </div>

          <span class="admin-badge approved">
            ${escapeHtml(
              post.status ||
              "published"
            )}
          </span>

        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            post.content ||
            ""
          )}
        </div>

        <div
          class="admin-card-meta"
          style="
            margin-top:10px;
            margin-bottom:13px;
          "
        >

          <span class="admin-badge">
            👁 ${formatNumber(
              counters.views
            )}
          </span>

          <span class="admin-badge">
            ❤️ ${formatNumber(
              counters.likes
            )}
          </span>

          <span class="admin-badge">
            💬 ${formatNumber(
              counters.comments
            )}
          </span>

          <span class="admin-badge">
            🔄 ${formatNumber(
              counters.shares
            )}
          </span>

        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="post-open"
          >
            👁 Открыть
          </button>

          <button
            type="button"
            class="admin-button admin-button-primary"
            data-action="post-counters"
          >
            🔢 Счётчики
          </button>

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="post-edit"
          >
            ✏️ Редактировать
          </button>

          <button
            type="button"
            class="admin-button admin-button-warning"
            data-action="post-trash"
          >
            🗑 В корзину
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
            openPost(
              post.id
            )
        );

      card
        .querySelector(
          '[data-action="post-counters"]'
        )
        ?.addEventListener(
          "click",
          () =>
            openCountersEditor(
              post
            )
        );

      card
        .querySelector(
          '[data-action="post-edit"]'
        )
        ?.addEventListener(
          "click",
          () =>
            editPost(
              post.id
            )
        );

      card
        .querySelector(
          '[data-action="post-trash"]'
        )
        ?.addEventListener(
          "click",
          () =>
            trashPost(
              post.id
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


/* ============================================================
   COUNTERS
============================================================ */

function getCounters(post) {
  return {
    views:
      Number(
        post.views ??
        post.view_count ??
        post.views_count ??
        0
      ),

    likes:
      Number(
        post.likes ??
        post.like_count ??
        post.likes_count ??
        0
      ),

    comments:
      Number(
        post.comments ??
        post.comment_count ??
        post.comments_count ??
        0
      ),

    shares:
      Number(
        post.shares ??
        post.share_count ??
        post.shares_count ??
        0
      )
  };
}


function openCountersEditor(
  post
) {
  state.selectedPost =
    post;

  const modal =
    $("countersModal");

  const body =
    $("countersModalBody");

  if (!modal || !body) {
    /*
     * Если пользователь ещё не добавил
     * модальное окно в HTML,
     * создаём его автоматически.
     */

    createCountersModal();

    return openCountersEditor(
      post
    );
  }

  const counters =
    getCounters(post);

  body.innerHTML = `
    <div class="admin-detail">

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          Публикация
        </span>

        <div class="admin-detail-value">
          <strong>
            ${escapeHtml(
              post.title ||
              "Без названия"
            )}
          </strong>
        </div>

      </div>

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          ID публикации
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            post.id
          )}
        </div>

      </div>

      <div class="admin-edit-grid">

        <div class="admin-form-group">

          <label for="counterViews">
            👁 Просмотры
          </label>

          <input
            id="counterViews"
            class="admin-input"
            type="text"
            inputmode="numeric"
            value="${escapeAttr(
              counters.views
            )}"
          >

        </div>

        <div class="admin-form-group">

          <label for="counterLikes">
            ❤️ Лайки
          </label>

          <input
            id="counterLikes"
            class="admin-input"
            type="text"
            inputmode="numeric"
            value="${escapeAttr(
              counters.likes
            )}"
          >

        </div>

        <div class="admin-form-group">

          <label for="counterComments">
            💬 Комментарии
          </label>

          <input
            id="counterComments"
            class="admin-input"
            type="text"
            inputmode="numeric"
            value="${escapeAttr(
              counters.comments
            )}"
          >

        </div>

        <div class="admin-form-group">

          <label for="counterShares">
            🔄 Репосты
          </label>

          <input
            id="counterShares"
            class="admin-input"
            type="text"
            inputmode="numeric"
            value="${escapeAttr(
              counters.shares
            )}"
          >

        </div>

      </div>

      <div
        style="
          margin-top:15px;
          padding:13px;
          border-radius:12px;
          background:#fff7ed;
          border:1px solid #fed7aa;
          color:#9a3412;
        "
      >
        ⚠️ Вы можете вручную установить
        любое допустимое числовое значение.
        После подтверждения новые значения
        отправляются на сервер и должны
        отображаться всем пользователям.
      </div>

    </div>
  `;

  modal.hidden = false;
}


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
          🔢 Управление счётчиками
        </h2>

        <button
          id="countersClose"
          type="button"
          class="admin-modal-close"
        >
          ×
        </button>

      </div>

      <div
        id="countersModalBody"
        class="admin-modal-body"
      ></div>

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
          class="admin-button admin-button-success"
        >
          ✅ Подтвердить изменения
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

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {
        closeCountersEditor();
      }

    }
  );
}


function parseCounter(
  value
) {
  const clean =
    String(value ?? "")
      .replaceAll(
        " ",
        ""
      )
      .replaceAll(
        ",",
        ""
      );

  if (!/^\d+$/.test(clean)) {
    return null;
  }

  const number =
    Number(clean);

  if (
    !Number.isSafeInteger(
      number
    )
  ) {
    /*
     * BigInt используется ниже
     * для очень больших значений.
     */
    try {
      return BigInt(clean);
    } catch {
      return null;
    }
  }

  return number;
}


function counterPayloadValue(
  value
) {
  const parsed =
    parseCounter(value);

  if (parsed === null) {
    return null;
  }

  /*
   * JSON не умеет передавать BigInt.
   * Для огромных значений передаём строку.
   */
  if (
    typeof parsed ===
    "bigint"
  ) {
    return parsed.toString();
  }

  return parsed;
}


async function saveCounters() {
  const post =
    state.selectedPost;

  if (!post) {
    return;
  }

  const views =
    counterPayloadValue(
      getValue(
        "counterViews"
      )
    );

  const likes =
    counterPayloadValue(
      getValue(
        "counterLikes"
      )
    );

  const comments =
    counterPayloadValue(
      getValue(
        "counterComments"
      )
    );

  const shares =
    counterPayloadValue(
      getValue(
        "counterShares"
      )
    );

  if (
    views === null ||
    likes === null ||
    comments === null ||
    shares === null
  ) {
    alert(
      "Все счётчики должны содержать только целые числа 0 или больше."
    );

    return;
  }

  const confirmed =
    confirm(
      "Подтвердить новые значения?\n\n" +
      `Просмотры: ${views}\n` +
      `Лайки: ${likes}\n` +
      `Комментарии: ${comments}\n` +
      `Репосты: ${shares}`
    );

  if (!confirmed) {
    return;
  }

  const button =
    $("countersSave");

  if (button) {
    button.disabled = true;
    button.textContent =
      "Сохраняем...";
  }

  try {

    /*
     * Основной существующий endpoint.
     */
    await api(
      "/api/admin/publication/counters",
      {
        method: "POST",

        body: JSON.stringify({
          id: post.id,

          views,
          likes,
          comments,
          shares
        })
      }
    );

    /*
     * Обновляем локальный объект.
     */
    post.views = views;
    post.likes = likes;
    post.comments = comments;
    post.shares = shares;

    closeCountersEditor();

    await Promise.all([
      loadPosts(),
      loadStats()
    ]);

    alert(
      "✅ Счётчики успешно изменены."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Сервер не принял изменение счётчиков."
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent =
        "✅ Подтвердить изменения";
    }
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


/* ============================================================
   OPEN POST
============================================================ */

function openPost(id) {
  const post =
    state.posts.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!post) {
    return;
  }

  state.selectedPost =
    post;

  const modal =
    $("postModal");

  const body =
    $("postModalBody");

  if (!modal || !body) {
    return;
  }

  const counters =
    getCounters(post);

  body.innerHTML = `

    <div class="admin-detail">

      ${
        post.image_url
          ? `
            <img
              src="${escapeAttr(
                post.image_url
              )}"
              alt=""
              style="
                width:100%;
                max-height:420px;
                object-fit:cover;
                border-radius:12px;
                margin-bottom:15px;
              "
            >
          `
          : ""
      }

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          Заголовок
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            post.title ||
            "Без названия"
          )}
        </div>

      </div>

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          Автор
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            post.author_name ||
            post.username ||
            "—"
          )}
        </div>

      </div>

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          Категория
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            post.category ||
            "—"
          )}
        </div>

      </div>

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          ID
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            post.id
          )}
        </div>

      </div>

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          Статистика
        </span>

        <div class="admin-card-meta">

          <span class="admin-badge">
            👁 ${formatNumber(
              counters.views
            )}
          </span>

          <span class="admin-badge">
            ❤️ ${formatNumber(
              counters.likes
            )}
          </span>

          <span class="admin-badge">
            💬 ${formatNumber(
              counters.comments
            )}
          </span>

          <span class="admin-badge">
            🔄 ${formatNumber(
              counters.shares
            )}
          </span>

        </div>

      </div>

      <div class="admin-detail-row">

        <span class="admin-detail-label">
          Текст
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            post.content ||
            ""
          )}
        </div>

      </div>

      <div class="admin-card-actions">

        <button
          type="button"
          class="admin-button admin-button-primary"
          id="openCountersFromPost"
        >
          🔢 Изменить цифры
        </button>

      </div>

      ${
        post.link_url
          ? `
            <div class="admin-detail-row">

              <a
                href="${escapeAttr(
                  post.link_url
                )}"
                target="_blank"
                rel="noopener"
              >
                🔗 Открыть ссылку
              </a>

            </div>
          `
          : ""
      }

    </div>
  `;

  $("openCountersFromPost")
    ?.addEventListener(
      "click",
      () => {

        closePostModal();

        setTimeout(
          () =>
            openCountersEditor(
              post
            ),
          50
        );

      }
    );

  modal.hidden = false;
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
   EDIT POST
============================================================ */

function editPost(id) {
  const post =
    state.posts.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!post) {
    return;
  }

  state.selectedPost =
    post;

  const modal =
    $("postEditModal");

  if (!modal) {
    alert(
      "Форма редактирования не найдена."
    );

    return;
  }

  setValue(
    "editPostTitle",
    post.title
  );

  setValue(
    "editPostContent",
    post.content
  );

  setValue(
    "editPostCategory",
    post.category
  );

  setValue(
    "editPostImage",
    post.image_url
  );

  setValue(
    "editPostLink",
    post.link_url
  );

  setValue(
    "editPostContact",
    post.contact
  );

  setValue(
    "editPostAuthor",
    post.author_name
  );

  modal.hidden = false;
}


function closePostEditModal() {
  const modal =
    $("postEditModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedPost =
    null;
}


async function savePost() {
  const post =
    state.selectedPost;

  if (!post) {
    return;
  }

  const title =
    getValue(
      "editPostTitle"
    );

  const content =
    getValue(
      "editPostContent"
    );

  const category =
    getValue(
      "editPostCategory"
    );

  const image_url =
    getValue(
      "editPostImage"
    );

  const link_url =
    getValue(
      "editPostLink"
    );

  const contact =
    getValue(
      "editPostContact"
    );

  const author_name =
    getValue(
      "editPostAuthor"
    );

  if (
    title.length < 5
  ) {
    alert(
      "Заголовок должен содержать минимум 5 символов."
    );

    return;
  }

  if (
    content.length < 20
  ) {
    alert(
      "Описание должно содержать минимум 20 символов."
    );

    return;
  }

  if (!category) {
    alert(
      "Укажите категорию."
    );

    return;
  }

  const confirmed =
    confirm(
      "Сохранить изменения публикации?"
    );

  if (!confirmed) {
    return;
  }

  const button =
    $("postEditSave");

  if (button) {
    button.disabled = true;
    button.textContent =
      "Сохраняем...";
  }

  try {

    try {

      await api(
        `/api/admin/posts/${encodeURIComponent(
          post.id
        )}`,
        {
          method: "PUT",

          body: JSON.stringify({
            title,
            content,
            category,
            image_url,
            link_url,
            contact,
            author_name
          })
        }
      );

    } catch {

      await api(
        "/api/admin/publication/edit",
        {
          method: "POST",

          body: JSON.stringify({
            id: post.id,
            title,
            content,
            category,
            image_url,
            link_url,
            contact,
            author_name
          })
        }
      );

    }

    closePostEditModal();

    await Promise.all([
      loadPosts(),
      loadStats()
    ]);

    alert(
      "✅ Публикация изменена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось изменить публикацию."
    );

  } finally {

    if (button) {
      button.disabled = false;

      button.textContent =
        "💾 Сохранить изменения";
    }
  }
}


/* ============================================================
   POST ACTIONS
============================================================ */

async function publicationAction(
  id,
  action,
  confirmation
) {
  if (confirmation) {
    const confirmed =
      confirm(
        confirmation
      );

    if (!confirmed) {
      return false;
    }
  }

  try {

    await api(
      "/api/admin/publication/action",
      {
        method: "POST",

        body: JSON.stringify({
          id,
          action
        })
      }
    );

    return true;

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return false;
    }

    alert(
      error.message ||
      "Действие не выполнено."
    );

    return false;
  }
}


async function trashPost(id) {
  const post =
    state.posts.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!post) {
    return;
  }

  const ok =
    await publicationAction(
      id,
      "trash",
      `Переместить «${post.title || "публикацию"}» в корзину?`
    );

  if (!ok) {
    /*
     * Старый endpoint,
     * если worker поддерживает его.
     */
    try {

      await api(
        `/api/admin/posts/${encodeURIComponent(
          id
        )}/trash`,
        {
          method: "POST"
        }
      );

    } catch {
      return;
    }
  }

  await Promise.all([
    loadPosts(),
    loadTrash(),
    loadStats()
  ]);

  alert(
    "🗑 Публикация перемещена в корзину."
  );
}


async function trashAllPosts() {
  if (!state.posts.length) {
    alert(
      "Опубликованных публикаций нет."
    );

    return;
  }

  const confirmed =
    confirm(
      `Переместить ВСЕ ${state.posts.length} публикаций в корзину?`
    );

  if (!confirmed) {
    return;
  }

  try {

    try {

      await api(
        "/api/admin/posts/all/trash",
        {
          method: "POST"
        }
      );

    } catch {

      for (
        const post of state.posts
      ) {

        await api(
          "/api/admin/publication/action",
          {
            method: "POST",

            body: JSON.stringify({
              id: post.id,
              action: "trash"
            })
          }
        );

      }

    }

    await refreshEverything();

    alert(
      "🗑 Все публикации перемещены в корзину."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось переместить публикации."
    );
  }
}


/* ============================================================
   TRASH
============================================================ */

async function loadTrash() {
  const loading =
    $("trashLoading");

  const errorBox =
    $("trashError");

  const empty =
    $("trashEmpty");

  if (loading) {
    loading.hidden = false;
  }

  if (errorBox) {
    errorBox.hidden = true;
  }

  try {

    let data;

    try {
      data = await api(
        "/api/admin/trash"
      );
    } catch {
      data = {
        posts: [],
        rejected_submissions: []
      };
    }

    state.trashPosts =
      data.posts ||
      [];

    state.rejectedSubmissions =
      data.rejected_submissions ||
      [];

    renderTrash();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить корзину.";

      errorBox.hidden = false;
    }

  } finally {

    if (loading) {
      loading.hidden = true;
    }
  }
}


function renderTrash() {
  const list =
    $("trashList");

  const empty =
    $("trashEmpty");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  let deletedPosts =
    state.trashPosts || [];

  let rejected =
    state.rejectedSubmissions || [];

  if (
    state.trashFilter ===
    "posts"
  ) {
    rejected = [];
  }

  if (
    state.trashFilter ===
    "submissions"
  ) {
    deletedPosts = [];
  }

  const total =
    deletedPosts.length +
    rejected.length;

  if (!total) {
    if (empty) {
      empty.hidden = false;
    }

    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  deletedPosts.forEach(
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
              🗑 ${escapeHtml(
                post.title ||
                "Без названия"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ${escapeHtml(
                  post.category ||
                  "Без категории"
                )}
              </span>

              <span class="admin-badge">
                Удалён:
                ${formatDate(
                  post.deleted_at
                )}
              </span>

            </div>

          </div>

        </div>

        <div class="admin-card-preview">
          ${escapeHtml(
            post.content ||
            ""
          )}
        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-success"
            data-action="restore"
          >
            ♻️ Восстановить
          </button>

          <button
            type="button"
            class="admin-button admin-button-danger"
            data-action="permanent"
          >
            ❌ Удалить навсегда
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

  rejected.forEach(
    submission => {

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
              ❌ ${escapeHtml(
                submission.title ||
                "Без названия"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge rejected">
                Отклонено
              </span>

              <span class="admin-badge">
                ${formatDate(
                  submission.reviewed_at
                )}
              </span>

            </div>

          </div>

        </div>

        <div class="admin-card-preview">
          <strong>
            Причина:
          </strong>

          ${escapeHtml(
            submission.rejection_reason ||
            "Не указана"
          )}
        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-success"
            data-action="restore-submission"
          >
            ♻️ Восстановить
          </button>

          <button
            type="button"
            class="admin-button admin-button-danger"
            data-action="delete-submission"
          >
            ❌ Удалить навсегда
          </button>

        </div>
      `;

      card
        .querySelector(
          '[data-action="restore-submission"]'
        )
        ?.addEventListener(
          "click",
          () =>
            restoreRejectedSubmission(
              submission.id
            )
        );

      card
        .querySelector(
          '[data-action="delete-submission"]'
        )
        ?.addEventListener(
          "click",
          () =>
            permanentDeleteRejectedSubmission(
              submission.id
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


async function restorePost(id) {
  const confirmed =
    confirm(
      "Восстановить публикацию?"
    );

  if (!confirmed) {
    return;
  }

  try {

    try {

      await api(
        `/api/admin/posts/${encodeURIComponent(
          id
        )}/restore`,
        {
          method: "POST"
        }
      );

    } catch {

      await api(
        "/api/admin/publication/action",
        {
          method: "POST",

          body: JSON.stringify({
            id,
            action: "restore"
          })
        }
      );

    }

    await refreshEverything();

    alert(
      "♻️ Публикация восстановлена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось восстановить."
    );
  }
}


async function permanentDeletePost(
  id
) {
  const confirmed =
    confirm(
      "Удалить публикацию окончательно?"
    );

  if (!confirmed) {
    return;
  }

  const second =
    confirm(
      "ВНИМАНИЕ!\n\nЭто действие нельзя отменить.\n\nПродолжить?"
    );

  if (!second) {
    return;
  }

  try {

    try {

      await api(
        `/api/admin/posts/${encodeURIComponent(
          id
        )}/permanent`,
        {
          method: "DELETE"
        }
      );

    } catch {

      await api(
        "/api/admin/publication/action",
        {
          method: "POST",

          body: JSON.stringify({
            id,
            action: "delete"
          })
        }
      );

    }

    await refreshEverything();

    alert(
      "❌ Публикация удалена окончательно."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось удалить публикацию."
    );
  }
}


async function restoreRejectedSubmission(
  id
) {
  const confirmed =
    confirm(
      "Вернуть заявку на повторную модерацию?"
    );

  if (!confirmed) {
    return;
  }

  try {

    await api(
      `/api/admin/submissions/${encodeURIComponent(
        id
      )}/restore`,
      {
        method: "POST"
      }
    );

    await refreshEverything();

    alert(
      "♻️ Заявка восстановлена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось восстановить заявку."
    );
  }
}


async function permanentDeleteRejectedSubmission(
  id
) {
  const confirmed =
    confirm(
      "Удалить заявку окончательно?"
    );

  if (!confirmed) {
    return;
  }

  const second =
    confirm(
      "Это действие нельзя отменить.\n\nПродолжить?"
    );

  if (!second) {
    return;
  }

  try {

    await api(
      `/api/admin/submissions/${encodeURIComponent(
        id
      )}/permanent`,
      {
        method: "DELETE"
      }
    );

    await refreshEverything();

    alert(
      "❌ Заявка удалена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось удалить заявку."
    );
  }
}


async function emptyTrash() {
  const total =
    state.trashPosts.length +
    state.rejectedSubmissions.length;

  if (!total) {
    alert(
      "Корзина уже пустая."
    );

    return;
  }

  const confirmed =
    confirm(
      `В корзине ${total} материалов.\n\nОчистить всю корзину?`
    );

  if (!confirmed) {
    return;
  }

  const second =
    confirm(
      "ВНИМАНИЕ!\n\nВсе материалы будут удалены окончательно.\n\nПродолжить?"
    );

  if (!second) {
    return;
  }

  try {

    await api(
      "/api/admin/trash/empty",
      {
        method: "DELETE"
      }
    );

    await refreshEverything();

    alert(
      "🧹 Корзина очищена."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось очистить корзину."
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
      [];

    renderUsers();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    /*
     * Раздел может отсутствовать
     * в старом HTML — это не ошибка
     * всей панели.
     */
  }
}


function renderUsers() {
  const list =
    $("adminUsersList") ||
    $("usersList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

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

          const text =
            [
              user.id,
              user.username,
              user.name,
              user.full_name,
              user.display_name,
              user.email,
              user.phone
            ]
              .join(" ")
              .toLowerCase();

          return text.includes(
            search
          );
        }
      );
  }

  if (
    state.userFilter !==
    "all"
  ) {
    users =
      users.filter(
        user =>
          String(
            user.status ||
            ""
          ).toLowerCase() ===
          state.userFilter
      );
  }

  if (!users.length) {

    list.innerHTML = `
      <div class="admin-empty">
        👥 Участники не найдены.
      </div>
    `;

    return;
  }

  users.forEach(
    user => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "admin-card";

      const status =
        user.status ||
        "active";

      card.innerHTML = `

        <div class="admin-card-top">

          <div>

            <h3 class="admin-card-title">
              ${escapeHtml(
                user.name ||
                user.full_name ||
                user.display_name ||
                "Без имени"
              )}
            </h3>

            <div class="admin-card-meta">

              ${
                user.username
                  ? `
                    <span class="admin-badge">
                      @${escapeHtml(
                        String(
                          user.username
                        ).replace(
                          /^@/,
                          ""
                        )
                      )}
                    </span>
                  `
                  : ""
              }

              <span class="admin-badge">
                ID:
                ${escapeHtml(
                  user.id
                )}
              </span>

              <span class="admin-badge">
                ${escapeHtml(
                  status
                )}
              </span>

            </div>

          </div>

        </div>

        <div class="admin-card-preview">

          ${
            user.email
              ? `📧 ${escapeHtml(
                  user.email
                )}<br>`
              : ""
          }

          ${
            user.phone
              ? `📱 ${escapeHtml(
                  user.phone
                )}<br>`
              : ""
          }

          ${
            user.created_at
              ? `📅 ${formatDate(
                  user.created_at
                )}`
              : ""
          }

        </div>

        <div class="admin-card-actions">

          <button
            type="button"
            class="admin-button admin-button-light"
            data-action="user-open"
          >
            👤 Открыть
          </button>

          <button
            type="button"
            class="admin-button admin-button-primary"
            data-action="user-edit"
          >
            ✏️ Изменить
          </button>

          <button
            type="button"
            class="admin-button admin-button-warning"
            data-action="user-action"
          >
            ⚙️ Управление
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
            openUser(
              user.id
            )
        );

      card
        .querySelector(
          '[data-action="user-edit"]'
        )
        ?.addEventListener(
          "click",
          () =>
            editUser(
              user
            )
        );

      card
        .querySelector(
          '[data-action="user-action"]'
        )
        ?.addEventListener(
          "click",
          () =>
            manageUser(
              user
            )
        );

      list.appendChild(
        card
      );
    }
  );
}


async function openUser(id) {
  try {

    const data =
      await api(
        `/api/admin/user?id=${encodeURIComponent(
          id
        )}`
      );

    const user =
      data.user ||
      data;

    state.selectedUser =
      user;

    showUserModal(
      user
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось загрузить участника."
    );
  }
}


function showUserModal(
  user
) {
  let modal =
    $("userModal");

  if (!modal) {
    createUserModal();
    modal =
      $("userModal");
  }

  const body =
    $("userModalBody");

  if (!body) {
    return;
  }

  body.innerHTML = `

    <div class="admin-detail">

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Имя
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            user.name ||
            user.full_name ||
            user.display_name ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Username
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            user.username ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          ID
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            user.id
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Email
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            user.email ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Телефон
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            user.phone ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Статус
        </span>

        <div class="admin-detail-value">
          ${escapeHtml(
            user.status ||
            "—"
          )}
        </div>
      </div>

      <div class="admin-detail-row">
        <span class="admin-detail-label">
          Регистрация
        </span>

        <div class="admin-detail-value">
          ${formatDate(
            user.created_at
          )}
        </div>
      </div>

    </div>
  `;

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
          👤 Участник
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
}


function closeUserModal() {
  const modal =
    $("userModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedUser =
    null;
}


function editUser(user) {
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
    user.display_name ||
    ""
  );

  setValue(
    "userEditUsername",
    user.username ||
    ""
  );

  setValue(
    "userEditEmail",
    user.email ||
    ""
  );

  setValue(
    "userEditPhone",
    user.phone ||
    ""
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

      <div class="admin-modal-body">

        <div class="admin-form-group">

          <label>
            Имя
          </label>

          <input
            id="userEditName"
            class="admin-input"
            type="text"
          >

        </div>

        <div class="admin-form-group">

          <label>
            Username
          </label>

          <input
            id="userEditUsername"
            class="admin-input"
            type="text"
          >

        </div>

        <div class="admin-form-group">

          <label>
            Email
          </label>

          <input
            id="userEditEmail"
            class="admin-input"
            type="email"
          >

        </div>

        <div class="admin-form-group">

          <label>
            Телефон
          </label>

          <input
            id="userEditPhone"
            class="admin-input"
            type="text"
          >

        </div>

      </div>

      <div class="admin-modal-footer">

        <button
          id="userEditCancel"
          type="button"
          class="admin-button admin-button-light"
        >
          Отмена
        </button>

        <button
          id="userEditSave"
          type="button"
          class="admin-button admin-button-success"
        >
          💾 Сохранить
        </button>

      </div>

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

  $("userEditSave")
    ?.addEventListener(
      "click",
      saveUser
    );
}


function closeUserEditModal() {
  const modal =
    $("userEditModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedUser =
    null;
}


async function saveUser() {
  const user =
    state.selectedUser;

  if (!user) {
    return;
  }

  const payload = {
    id: user.id,

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
      )
  };

  const confirmed =
    confirm(
      "Сохранить изменения участника?"
    );

  if (!confirmed) {
    return;
  }

  try {

    await api(
      "/api/admin/user/edit",
      {
        method: "POST",

        body: JSON.stringify(
          payload
        )
      }
    );

    closeUserEditModal();

    await loadUsers();

    alert(
      "✅ Данные участника изменены."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось изменить участника."
    );
  }
}


async function manageUser(
  user
) {
  const action =
    prompt(
      "Введите действие:\n\n" +
      "block — заблокировать\n" +
      "unblock — разблокировать\n" +
      "delete — удалить\n\n" +
      "Или отмените."
    );

  if (!action) {
    return;
  }

  const normalized =
    action
      .trim()
      .toLowerCase();

  if (
    ![
      "block",
      "unblock",
      "delete"
    ].includes(
      normalized
    )
  ) {
    alert(
      "Неизвестное действие."
    );

    return;
  }

  const confirmed =
    confirm(
      `Выполнить действие "${normalized}" для участника?`
    );

  if (!confirmed) {
    return;
  }

  try {

    await api(
      "/api/admin/user/action",
      {
        method: "POST",

        body: JSON.stringify({
          id: user.id,
          action: normalized
        })
      }
    );

    await loadUsers();

    alert(
      "✅ Действие выполнено."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Действие не выполнено."
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
      [];

    renderComments();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }
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

        body: JSON.stringify({
          id: comment.id,
          content: text
        })
      }
    );

    await loadComments();

    alert(
      "✅ Комментарий изменён."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось изменить комментарий."
    );
  }
}


async function deleteComment(
  id
) {
  const confirmed =
    confirm(
      "Удалить комментарий?"
    );

  if (!confirmed) {
    return;
  }

  try {

    await api(
      "/api/admin/comment/action",
      {
        method: "POST",

        body: JSON.stringify({
          id,
          action: "delete"
        })
      }
    );

    await loadComments();

    alert(
      "🗑 Комментарий удалён."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось удалить комментарий."
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
      [];

    renderChats();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }
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
                chat.username ||
                "Пользователь"
              )}
            </h3>

            <div class="admin-card-meta">

              <span class="admin-badge">
                ID:
                ${escapeHtml(
                  chat.user_id ||
                  chat.id ||
                  ""
                )}
              </span>

              <span class="admin-badge">
                ${formatDate(
                  chat.updated_at ||
                  chat.last_message_at
                )}
              </span>

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
              chat.user_id ||
              chat.id
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

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось открыть чат."
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
            message => `
              <div
                style="
                  padding:10px;
                  margin-bottom:8px;
                  border-radius:10px;
                  background:#f3f4f6;
                "
              >
                <strong>
                  ${escapeHtml(
                    message.sender_name ||
                    message.author_name ||
                    "Пользователь"
                  )}
                </strong>

                <div style="margin-top:5px;">
                  ${escapeHtml(
                    message.content ||
                    message.text ||
                    ""
                  )}
                </div>

                <small
                  style="
                    color:#6b7280;
                  "
                >
                  ${formatDate(
                    message.created_at
                  )}
                </small>
              </div>
            `
          )
          .join("")
      : `
          <div class="admin-empty">
            Сообщений нет.
          </div>
        `;

  modal.hidden = false;
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
        style="max-height:500px;overflow:auto;"
      ></div>

      <div class="admin-modal-body">

        <textarea
          id="adminChatMessage"
          class="admin-textarea"
          style="min-height:100px;"
          placeholder="Введите ответ..."
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
    alert(
      "Введите сообщение."
    );

    return;
  }

  try {

    await api(
      "/api/admin/chat/send",
      {
        method: "POST",

        body: JSON.stringify({
          user_id:
            chat.userId,

          content
        })
      }
    );

    setValue(
      "adminChatMessage",
      ""
    );

    await openAdminChat(
      chat.userId
    );

    alert(
      "✅ Сообщение отправлено."
    );

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }

    alert(
      error.message ||
      "Не удалось отправить сообщение."
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
      [];

    renderNotifications();

  } catch (error) {

    if (
      handleUnauthorized(error)
    ) {
      return;
    }
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

          <span class="admin-badge">
            ${formatDate(
              notification.created_at
            )}
          </span>

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
   EVENTS
============================================================ */

function setupEvents() {

  $("adminLoginButton")
    ?.addEventListener(
      "click",
      handleLogin
    );


  $("adminPassword")
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {
          handleLogin();
        }

      }
    );


  $("adminLogout")
    ?.addEventListener(
      "click",
      handleLogout
    );


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

      }
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
      () =>
        state.selectedSubmission &&
        approveSubmission(
          state.selectedSubmission.id
        )
    );


  $("submissionReject")
    ?.addEventListener(
      "click",
      () =>
        state.selectedSubmission &&
        rejectSubmission(
          state.selectedSubmission.id
        )
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


  [
    "submissionModal",
    "postModal",
    "postEditModal",
    "countersModal",
    "userModal",
    "userEditModal",
    "adminChatModal"
  ].forEach(
    id => {

      document
        .getElementById(id)
        ?.addEventListener(
          "click",
          event => {

            if (
              event.target !==
              event.currentTarget
            ) {
              return;
            }

            const closeMap = {
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

            closeMap[id]?.();

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
   START
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
     * Создаём дополнительные окна
     * заранее, чтобы интерфейс был готов.
     */

    createCountersModal();

    setupEvents();

    setupFilters();

    checkAuthentication();

  }
);
