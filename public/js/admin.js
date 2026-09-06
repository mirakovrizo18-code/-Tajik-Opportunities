const state = {
  authenticated: false,

  loading: false,

  submissions: [],

  posts: [],

  trashPosts: [],

  rejectedSubmissions: [],

  filter: "pending",

  postFilter: "all",

  trashFilter: "all",

  selectedSubmission: null,

  selectedPost: null
};


/* ============================================================
   HELPERS
============================================================ */

const $ = (id) =>
  document.getElementById(id);


async function api(
  url,
  options = {}
) {
  const response =
    await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "content-type":
          "application/json",
        ...(options.headers || {})
      }
    });

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error =
      new Error(
        data.error ||
          `Ошибка ${response.status}`
      );

    error.status =
      response.status;

    throw error;
  }

  return data;
}


function showLogin() {
  const login =
    $("adminLogin");

  const dashboard =
    $("adminDashboard");

  if (login) {
    login.hidden = false;
  }

  if (dashboard) {
    dashboard.hidden = true;
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
  }

  if (dashboard) {
    dashboard.hidden = false;
  }

  state.authenticated =
    true;
}


function showMessage(
  element,
  message,
  type = ""
) {
  if (!element) return;

  element.textContent =
    message;

  element.className =
    type
      ? `admin-message ${type}`
      : "admin-message";
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function escapeAttr(value) {
  return escapeHtml(value);
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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


function getValue(id) {
  return String(
    $(id)?.value || ""
  ).trim();
}


function setValue(
  id,
  value
) {
  const element =
    $(id);

  if (element) {
    element.value =
      value ?? "";
  }
}


/* ============================================================
   AUTH
============================================================ */

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
      button.disabled =
        false;
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
    // Выход всё равно выполняется локально.
  }

  state.authenticated =
    false;

  state.submissions =
    [];

  state.posts =
    [];

  state.trashPosts =
    [];

  state.rejectedSubmissions =
    [];

  showLogin();
}


/* ============================================================
   REFRESH EVERYTHING
============================================================ */

async function refreshEverything() {
  await Promise.all([
    loadStats(),
    loadSubmissions(),
    loadPosts(),
    loadTrash()
  ]);
}


/* ============================================================
   STATISTICS
============================================================ */

async function loadStats() {
  try {
    const data =
      await api(
        "/api/admin/stats"
      );

    const stats =
      data.stats || {};

    if (
      $("pendingCount")
    ) {
      $("pendingCount")
        .textContent =
          stats.pending ??
          0;
    }

    if (
      $("approvedCount")
    ) {
      $("approvedCount")
        .textContent =
          stats.approved ??
          0;
    }

    if (
      $("rejectedCount")
    ) {
      $("rejectedCount")
        .textContent =
          stats.rejected ??
          0;
    }

    if (
      $("totalCount")
    ) {
      $("totalCount")
        .textContent =
          stats.total_posts ??
          0;
    }

    if (
      $("trashCount")
    ) {
      $("trashCount")
        .textContent =
          stats.trash_posts ??
          0;
    }

    if (
      $("totalSubmissionsCount")
    ) {
      $("totalSubmissionsCount")
        .textContent =
          stats.total_submissions ??
          0;
    }

  } catch (error) {
    if (
      error.status === 401
    ) {
      showLogin();
    }
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
    loading.hidden =
      false;
  }

  if (errorBox) {
    errorBox.hidden =
      true;
  }

  try {
    const data =
      await api(
        `/api/admin/submissions?status=${encodeURIComponent(
          state.filter
        )}`
      );

    state.submissions =
      data.submissions ||
      [];

    renderSubmissions();

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
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
      loading.hidden =
        true;
    }
  }
}


function renderSubmissions() {
  const list =
    $("submissionsList");

  const empty =
    $("submissionsEmpty");

  if (!list) return;

  list.innerHTML =
    "";

  if (
    !state.submissions.length
  ) {
    if (empty) {
      empty.hidden =
        false;
    }

    return;
  }

  if (empty) {
    empty.hidden =
      true;
  }

  for (
    const submission
    of state.submissions
  ) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "admin-submission-card";

    card.innerHTML = `
      <div class="admin-card-content">

        <h3>
          ${escapeHtml(
            submission.title ||
              "Без названия"
          )}
        </h3>

        <div class="admin-card-meta">

          <span>
            ${escapeHtml(
              submission.category ||
                "Без категории"
            )}
          </span>

          <span>
            ${formatDate(
              submission.created_at
            )}
          </span>

          <span>
            ${escapeHtml(
              submission.author_name ||
                "Автор не указан"
            )}
          </span>

        </div>

        <div class="admin-status">
          ${escapeHtml(
            submission.status ||
              ""
          )}
        </div>

      </div>

      <div class="admin-card-actions">

        <button
          type="button"
          class="admin-view-button"
          data-id="${escapeAttr(
            submission.id
          )}"
        >
          👁 Открыть
        </button>

      </div>
    `;

    card
      .querySelector(
        ".admin-view-button"
      )
      ?.addEventListener(
        "click",
        () =>
          openSubmission(
            submission.id
          )
      );

    list.appendChild(
      card
    );
  }
}


function openSubmission(id) {
  const submission =
    state.submissions.find(
      item =>
        item.id === id
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
    <div class="submission-details">

      <h2>
        ${escapeHtml(
          submission.title ||
            "Без названия"
        )}
      </h2>

      <p>
        <strong>Категория:</strong>
        ${escapeHtml(
          submission.category ||
            "—"
        )}
      </p>

      <p>
        <strong>Автор:</strong>
        ${escapeHtml(
          submission.author_name ||
            "—"
        )}
      </p>

      <p>
        <strong>Контакт:</strong>
        ${escapeHtml(
          submission.contact ||
            "—"
        )}
      </p>

      <p>
        <strong>Дата:</strong>
        ${formatDate(
          submission.created_at
        )}
      </p>

      <p>
        <strong>Код:</strong>
        ${escapeHtml(
          submission.tracking_code ||
            "—"
        )}
      </p>

      ${
        submission.rejection_reason
          ? `
            <p>
              <strong>
                Причина отклонения:
              </strong>
              ${escapeHtml(
                submission.rejection_reason
              )}
            </p>
          `
          : ""
      }

      <hr>

      <div class="submission-text">
        ${escapeHtml(
          submission.content ||
            ""
        ).replace(
          /\n/g,
          "<br>"
        )}
      </div>

      ${
        submission.image_url
          ? `
            <p>
              <strong>
                Изображение:
              </strong>

              <a
                href="${escapeAttr(
                  submission.image_url
                )}"
                target="_blank"
                rel="noopener"
              >
                Открыть
              </a>
            </p>
          `
          : ""
      }

      ${
        submission.link_url
          ? `
            <p>
              <strong>
                Ссылка:
              </strong>

              <a
                href="${escapeAttr(
                  submission.link_url
                )}"
                target="_blank"
                rel="noopener"
              >
                Открыть
              </a>
            </p>
          `
          : ""
      }

    </div>
  `;

  const approve =
    $("submissionApprove");

  const reject =
    $("submissionReject");

  if (approve) {
    approve.hidden =
      submission.status !==
      "pending";
  }

  if (reject) {
    reject.hidden =
      submission.status !==
      "pending";
  }

  modal.hidden =
    false;
}


function closeSubmissionModal() {
  const modal =
    $("submissionModal");

  if (modal) {
    modal.hidden =
      true;
  }

  state.selectedSubmission =
    null;
}


/* ============================================================
   APPROVE
============================================================ */

async function approveSelectedSubmission() {
  const submission =
    state.selectedSubmission;

  if (!submission) {
    return;
  }

  const confirmed =
    confirm(
      "Опубликовать эту заявку на сайте?"
    );

  if (!confirmed) {
    return;
  }

  try {
    await api(
      `/api/admin/submissions/${encodeURIComponent(
        submission.id
      )}/approve`,
      {
        method: "POST"
      }
    );

    closeSubmissionModal();

    await refreshEverything();

    alert(
      "✅ Публикация размещена на сайте."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      closeSubmissionModal();
      return;
    }

    alert(
      error.message ||
        "Не удалось опубликовать."
    );
  }
}


/* ============================================================
   REJECT
============================================================ */

async function rejectSelectedSubmission() {
  const submission =
    state.selectedSubmission;

  if (!submission) {
    return;
  }

  const reason =
    prompt(
      "Укажите причину отклонения:"
    );

  if (reason === null) {
    return;
  }

  try {
    await api(
      `/api/admin/submissions/${encodeURIComponent(
        submission.id
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

    closeSubmissionModal();

    await refreshEverything();

    alert(
      "Заявка отклонена и находится в корзине."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      closeSubmissionModal();
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
    loading.hidden =
      false;
  }

  if (errorBox) {
    errorBox.hidden =
      true;
  }

  try {
    const data =
      await api(
        "/api/admin/posts"
      );

    state.posts =
      data.posts ||
      [];

    renderPosts();

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить посты.";

      errorBox.hidden =
        false;
    }

  } finally {
    if (loading) {
      loading.hidden =
        true;
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

  list.innerHTML =
    "";

  let posts =
    [...state.posts];

  if (
    state.postFilter !==
    "all"
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
      empty.hidden =
        false;
    }

    return;
  }

  if (empty) {
    empty.hidden =
      true;
  }

  for (
    const post of posts
  ) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "admin-post-card";

    card.innerHTML = `
      <div class="admin-post-main">

        ${
          post.image_url
            ? `
              <img
                class="admin-post-image"
                src="${escapeAttr(
                  post.image_url
                )}"
                alt=""
                loading="lazy"
              >
            `
            : ""
        }

        <div class="admin-post-info">

          <h3>
            ${escapeHtml(
              post.title ||
                "Без названия"
            )}
          </h3>

          <div class="admin-post-meta">

            <span>
              ${escapeHtml(
                post.category ||
                  "Без категории"
              )}
            </span>

            <span>
              ${formatDate(
                post.published_at
              )}
            </span>

            <span>
              ${escapeHtml(
                post.author_name ||
                  "Автор не указан"
              )}
            </span>

          </div>

          <p>
            ${escapeHtml(
              (post.content ||
                "").slice(
                  0,
                  250
                )
            )}${
              (post.content ||
                "").length >
              250
                ? "…"
                : ""
            }
          </p>

        </div>

      </div>

      <div class="admin-post-actions">

        <button
          type="button"
          class="admin-post-open"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          👁 Открыть
        </button>

        <button
          type="button"
          class="admin-post-edit"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          ✏️ Редактировать
        </button>

        <button
          type="button"
          class="admin-post-delete"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          🗑 В корзину
        </button>

      </div>
    `;

    card
      .querySelector(
        ".admin-post-open"
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
        ".admin-post-edit"
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
        ".admin-post-delete"
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
}


/* ============================================================
   OPEN POST
============================================================ */

function openPost(id) {
  const post =
    state.posts.find(
      item =>
        item.id === id
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

  body.innerHTML = `
    <div class="post-details">

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

      <h2>
        ${escapeHtml(
          post.title ||
            ""
        )}
      </h2>

      <p>
        <strong>
          Категория:
        </strong>
        ${escapeHtml(
          post.category ||
            "—"
        )}
      </p>

      <p>
        <strong>
          Автор:
        </strong>
        ${escapeHtml(
          post.author_name ||
            "—"
        )}
      </p>

      <p>
        <strong>
          Контакт:
        </strong>
        ${escapeHtml(
          post.contact ||
            "—"
        )}
      </p>

      <p>
        <strong>
          Опубликовано:
        </strong>
        ${formatDate(
          post.published_at
        )}
      </p>

      <hr>

      <div>
        ${escapeHtml(
          post.content ||
            ""
        ).replace(
          /\n/g,
          "<br>"
        )}
      </div>

      ${
        post.link_url
          ? `
            <p>
              <a
                href="${escapeAttr(
                  post.link_url
                )}"
                target="_blank"
                rel="noopener"
              >
                🔗 Открыть ссылку
              </a>
            </p>
          `
          : ""
      }

    </div>
  `;

  modal.hidden =
    false;
}


function closePostModal() {
  const modal =
    $("postModal");

  if (modal) {
    modal.hidden =
      true;
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
        item.id === id
    );

  if (!post) {
    return;
  }

  state.selectedPost =
    post;

  const modal =
    $("postEditModal");

  const form =
    $("postEditForm");

  if (!modal || !form) {
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

  modal.hidden =
    false;
}


function closePostEditModal() {
  const modal =
    $("postEditModal");

  if (modal) {
    modal.hidden =
      true;
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
      "Выберите категорию."
    );

    return;
  }

  const confirmed =
    confirm(
      "Сохранить изменения этого поста?"
    );

  if (!confirmed) {
    return;
  }

  const button =
    $("postEditSave");

  if (button) {
    button.disabled =
      true;

    button.textContent =
      "Сохраняем...";
  }

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

    closePostEditModal();

    await Promise.all([
      loadPosts(),
      loadStats()
    ]);

    alert(
      "✅ Пост успешно изменён."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      closePostEditModal();
      return;
    }

    alert(
      error.message ||
        "Не удалось изменить пост."
    );

  } finally {

    if (button) {
      button.disabled =
        false;

      button.textContent =
        "Сохранить изменения";
    }
  }
}


/* ============================================================
   MOVE POST TO TRASH
============================================================ */

async function trashPost(id) {
  const post =
    state.posts.find(
      item =>
        item.id === id
    );

  if (!post) {
    return;
  }

  const confirmed =
    confirm(
      `Переместить «${post.title}» в корзину?`
    );

  if (!confirmed) {
    return;
  }

  try {
    await api(
      `/api/admin/posts/${encodeURIComponent(
        id
      )}/trash`,
      {
        method: "POST"
      }
    );

    await Promise.all([
      loadPosts(),
      loadTrash(),
      loadStats()
    ]);

    alert(
      "🗑 Пост перемещён в корзину."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось переместить пост в корзину."
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
    loading.hidden =
      false;
  }

  if (errorBox) {
    errorBox.hidden =
      true;
  }

  try {
    const data =
      await api(
        "/api/admin/trash"
      );

    state.trashPosts =
      data.posts ||
      [];

    state.rejectedSubmissions =
      data.rejected_submissions ||
      [];

    renderTrash();

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить корзину.";

      errorBox.hidden =
        false;
    }

  } finally {

    if (loading) {
      loading.hidden =
        true;
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

  list.innerHTML =
    "";

  const deletedPosts =
    state.trashPosts || [];

  const rejected =
    state.rejectedSubmissions || [];

  const total =
    deletedPosts.length +
    rejected.length;

  if (!total) {

    if (empty) {
      empty.hidden =
        false;
    }

    return;
  }

  if (empty) {
    empty.hidden =
      true;
  }


  /* УДАЛЁННЫЕ ПОСТЫ */

  for (
    const post
    of deletedPosts
  ) {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "admin-post-card";

    card.innerHTML = `
      <div class="admin-post-main">

        ${
          post.image_url
            ? `
              <img
                class="admin-post-image"
                src="${escapeAttr(
                  post.image_url
                )}"
                alt=""
                loading="lazy"
              >
            `
            : ""
        }

        <div class="admin-post-info">

          <h3>
            🗑
            ${escapeHtml(
              post.title ||
                "Без названия"
            )}
          </h3>

          <div class="admin-post-meta">

            <span>
              ${escapeHtml(
                post.category ||
                  "Без категории"
              )}
            </span>

            <span>
              Удалён:
              ${formatDate(
                post.deleted_at
              )}
            </span>

          </div>

          <p>
            ${escapeHtml(
              (post.content ||
                "").slice(
                  0,
                  200
                )
            )}${
              (post.content ||
                "").length >
              200
                ? "…"
                : ""
            }
          </p>

        </div>

      </div>

      <div class="admin-post-actions">

        <button
          type="button"
          class="admin-trash-restore"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          ♻️ Восстановить
        </button>

        <button
          type="button"
          class="admin-trash-delete"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          ❌ Удалить из корзины
        </button>

      </div>
    `;

    card
      .querySelector(
        ".admin-trash-restore"
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
        ".admin-trash-delete"
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


  /* ОТКЛОНЁННЫЕ ЗАЯВКИ */

  for (
    const submission
    of rejected
  ) {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "admin-submission-card";

    card.innerHTML = `
      <div class="admin-card-content">

        <h3>
          ❌
          ${escapeHtml(
            submission.title ||
              "Без названия"
          )}
        </h3>

        <div class="admin-card-meta">

          <span>
            ${escapeHtml(
              submission.category ||
                "Без категории"
            )}
          </span>

          <span>
            Отклонено:
            ${formatDate(
              submission.reviewed_at
            )}
          </span>

          <span>
            ${escapeHtml(
              submission.author_name ||
                "Автор не указан"
            )}
          </span>

        </div>

        <p>
          <strong>
            Причина:
          </strong>
          ${escapeHtml(
            submission.rejection_reason ||
              "Причина не указана."
          )}
        </p>

      </div>

      <div class="admin-card-actions">

        <button
          type="button"
          class="admin-trash-restore-submission"
          data-id="${escapeAttr(
            submission.id
          )}"
        >
          ♻️ Восстановить
        </button>

        <button
          type="button"
          class="admin-trash-delete-submission"
          data-id="${escapeAttr(
            submission.id
          )}"
        >
          ❌ Удалить из корзины
        </button>

      </div>
    `;

    card
      .querySelector(
        ".admin-trash-restore-submission"
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
        ".admin-trash-delete-submission"
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
}


/* ============================================================
   RESTORE POST
============================================================ */

async function restorePost(id) {
  const confirmed =
    confirm(
      "Восстановить этот пост и снова показать его на сайте?"
    );

  if (!confirmed) {
    return;
  }

  try {
    await api(
      `/api/admin/posts/${encodeURIComponent(
        id
      )}/restore`,
      {
        method: "POST"
      }
    );

    await Promise.all([
      loadPosts(),
      loadTrash(),
      loadStats()
    ]);

    alert(
      "♻️ Пост восстановлен."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось восстановить пост."
    );
  }
}


/* ============================================================
   PERMANENT DELETE POST
============================================================ */

async function permanentDeletePost(
  id
) {
  const confirmed =
    confirm(
      "Удалить этот пост окончательно?"
    );

  if (!confirmed) {
    return;
  }

  const second =
    confirm(
      "ВНИМАНИЕ!\n\nПост будет удалён из базы данных без возможности восстановления.\n\nПродолжить?"
    );

  if (!second) {
    return;
  }

  try {
    await api(
      `/api/admin/posts/${encodeURIComponent(
        id
      )}/permanent`,
      {
        method: "DELETE"
      }
    );

    await Promise.all([
      loadTrash(),
      loadStats()
    ]);

    alert(
      "❌ Пост окончательно удалён."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось удалить пост."
    );
  }
}


/* ============================================================
   RESTORE REJECTED SUBMISSION
============================================================ */

async function restoreRejectedSubmission(
  id
) {
  const confirmed =
    confirm(
      "Вернуть эту заявку из корзины на повторную модерацию?"
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
      "♻️ Заявка восстановлена и снова ожидает проверки."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось восстановить заявку."
    );
  }
}


/* ============================================================
   PERMANENT DELETE REJECTED SUBMISSION
============================================================ */

async function permanentDeleteRejectedSubmission(
  id
) {
  const confirmed =
    confirm(
      "Удалить отклонённую заявку окончательно?"
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

    await Promise.all([
      loadTrash(),
      loadStats()
    ]);

    alert(
      "❌ Заявка окончательно удалена."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось удалить заявку."
    );
  }
}


/* ============================================================
   EMPTY TRASH
============================================================ */

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
      "ВНИМАНИЕ!\n\nВсе материалы из корзины будут удалены окончательно и восстановить их будет невозможно.\n\nПродолжить?"
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

    await Promise.all([
      loadTrash(),
      loadStats()
    ]);

    alert(
      "🧹 Корзина полностью очищена."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось очистить корзину."
    );
  }
}


/* ============================================================
   MOVE ALL POSTS TO TRASH
============================================================ */

async function trashAllPosts() {
  if (!state.posts.length) {
    alert(
      "Опубликованных постов нет."
    );

    return;
  }

  const confirmed =
    confirm(
      `Переместить ВСЕ ${state.posts.length} опубликованных постов в корзину?`
    );

  if (!confirmed) {
    return;
  }

  const second =
    confirm(
      "ВНИМАНИЕ!\n\nВсе опубликованные посты исчезнут с сайта и будут перемещены в корзину.\n\nПродолжить?"
    );

  if (!second) {
    return;
  }

  try {
    await api(
      "/api/admin/posts/all/trash",
      {
        method: "POST"
      }
    );

    await Promise.all([
      loadPosts(),
      loadTrash(),
      loadStats()
    ]);

    alert(
      "🗑 Все публикации перемещены в корзину."
    );

  } catch (error) {

    if (
      error.status === 401
    ) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось переместить публикации."
    );
  }
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
                item => {
                  item.classList.toggle(
                    "active",
                    item ===
                      button
                  );
                }
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
                item => {
                  item.classList.toggle(
                    "active",
                    item ===
                      button
                  );
                }
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
                item => {
                  item.classList.toggle(
                    "active",
                    item ===
                      button
                  );
                }
              );

            renderTrash();
          }
        );
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
      approveSelectedSubmission
    );


  $("submissionReject")
    ?.addEventListener(
      "click",
      rejectSelectedSubmission
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


  /*
   * Закрытие модальных окон
   * по клику на затемнение.
   */

  [
    "submissionModal",
    "postModal",
    "postEditModal"
  ].forEach(
    id => {

      $(id)
        ?.addEventListener(
          "click",
          event => {

            if (
              event.target ===
              $(id)
            ) {

              if (
                id ===
                "submissionModal"
              ) {
                closeSubmissionModal();
              }

              if (
                id ===
                "postModal"
              ) {
                closePostModal();
              }

              if (
                id ===
                "postEditModal"
              ) {
                closePostEditModal();
              }
            }
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
    }
  );
}


/* ============================================================
   START
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupEvents();

    setupFilters();

    checkAuthentication();

  }
);
