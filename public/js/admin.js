const state = {
  authenticated: false,
  loading: false,
  submissions: [],
  posts: [],
  filter: "pending",
  postFilter: "all",
  selectedSubmission: null,
  selectedPost: null,
};

const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.error || `Ошибка ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

function showLogin() {
  const loginSection = $("adminLogin");
  const dashboard = $("adminDashboard");

  if (loginSection) {
    loginSection.hidden = false;
  }

  if (dashboard) {
    dashboard.hidden = true;
  }

  state.authenticated = false;
}

function showDashboard() {
  const loginSection = $("adminLogin");
  const dashboard = $("adminDashboard");

  if (loginSection) {
    loginSection.hidden = true;
  }

  if (dashboard) {
    dashboard.hidden = false;
  }

  state.authenticated = true;
}

function showMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = type
    ? `admin-message ${type}`
    : "admin-message";
}

async function checkAuthentication() {
  try {
    await api("/api/admin/me");

    showDashboard();

    await Promise.all([
      loadSubmissions(),
      loadPosts(),
      loadStats(),
    ]);
  } catch {
    showLogin();
  }
}

async function handleLogin() {
  const passwordInput = $("adminPassword");
  const button = $("adminLoginButton");
  const message = $("adminLoginMessage");

  const password =
    passwordInput?.value || "";

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
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
    });

    if (passwordInput) {
      passwordInput.value = "";
    }

    showMessage(
      message,
      "Вход выполнен.",
      "success"
    );

    showDashboard();

    await Promise.all([
      loadSubmissions(),
      loadPosts(),
      loadStats(),
    ]);
  } catch (error) {
    showMessage(
      message,
      error.message || "Не удалось войти.",
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
    await api("/api/admin/logout", {
      method: "POST",
    });
  } catch {
    // Даже если запрос завершился ошибкой,
    // всё равно показываем форму входа.
  }

  state.authenticated = false;
  state.submissions = [];
  state.posts = [];

  showLogin();
}

async function loadStats() {
  try {
    const data =
      await api("/api/admin/stats");

    const stats = data.stats || {};

    if ($("pendingCount")) {
      $("pendingCount").textContent =
        stats.pending ?? 0;
    }

    if ($("approvedCount")) {
      $("approvedCount").textContent =
        stats.approved ?? 0;
    }

    if ($("rejectedCount")) {
      $("rejectedCount").textContent =
        stats.rejected ?? 0;
    }

    if ($("totalCount")) {
      $("totalCount").textContent =
        stats.total_posts ??
        stats.total_submissions ??
        0;
    }
  } catch (error) {
    if (error.status === 401) {
      showLogin();
    }
  }
}

async function loadSubmissions() {
  const list = $("submissionsList");
  const loading = $("submissionsLoading");
  const errorBox = $("submissionsError");
  const empty = $("submissionsEmpty");

  if (loading) {
    loading.hidden = false;
  }

  if (errorBox) {
    errorBox.hidden = true;
  }

  try {
    const data =
      await api(
        `/api/admin/submissions?status=${encodeURIComponent(
          state.filter
        )}`
      );

    state.submissions =
      data.submissions || [];

    renderSubmissions();
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить заявки.";

      errorBox.hidden = false;
    }
  } finally {
    if (loading) {
      loading.hidden = true;
    }
  }
}

function renderSubmissions() {
  const list = $("submissionsList");
  const empty = $("submissionsEmpty");

  if (!list) return;

  list.innerHTML = "";

  if (!state.submissions.length) {
    if (empty) {
      empty.hidden = false;
    }

    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  for (const submission of state.submissions) {
    const card =
      document.createElement("article");

    card.className =
      "admin-submission-card";

    const title =
      escapeHtml(
        submission.title || "Без названия"
      );

    const category =
      escapeHtml(
        submission.category || "Без категории"
      );

    const author =
      escapeHtml(
        submission.author_name ||
          "Не указан"
      );

    const status =
      escapeHtml(
        submission.status || ""
      );

    const date =
      formatDate(
        submission.created_at
      );

    card.innerHTML = `
      <div class="admin-card-content">
        <h3>${title}</h3>

        <div class="admin-card-meta">
          <span>${category}</span>
          <span>${date}</span>
          <span>${author}</span>
        </div>

        <div class="admin-status">
          ${status}
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
          Открыть
        </button>
      </div>
    `;

    const button =
      card.querySelector(
        ".admin-view-button"
      );

    button?.addEventListener(
      "click",
      () => {
        openSubmission(submission.id);
      }
    );

    list.appendChild(card);
  }
}

function openSubmission(id) {
  const submission =
    state.submissions.find(
      (item) => item.id === id
    );

  if (!submission) return;

  state.selectedSubmission =
    submission;

  const modal =
    $("submissionModal");

  const body =
    $("submissionModalBody");

  if (!modal || !body) return;

  body.innerHTML = `
    <div class="submission-details">

      <h2>
        ${escapeHtml(
          submission.title || "Без названия"
        )}
      </h2>

      <p>
        <strong>Категория:</strong>
        ${escapeHtml(
          submission.category || "—"
        )}
      </p>

      <p>
        <strong>Автор:</strong>
        ${escapeHtml(
          submission.author_name || "—"
        )}
      </p>

      <p>
        <strong>Контакт:</strong>
        ${escapeHtml(
          submission.contact || "—"
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
          submission.tracking_code || "—"
        )}
      </p>

      <hr>

      <div class="submission-text">
        ${escapeHtml(
          submission.content || ""
        ).replace(/\n/g, "<br>")}
      </div>

      ${
        submission.image_url
          ? `
            <p>
              <strong>Изображение:</strong>
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
              <strong>Ссылка:</strong>
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

  const approveButton =
    $("submissionApprove");

  const rejectButton =
    $("submissionReject");

  if (approveButton) {
    approveButton.hidden =
      submission.status !== "pending";
  }

  if (rejectButton) {
    rejectButton.hidden =
      submission.status !== "pending";
  }

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

async function approveSelectedSubmission() {
  const submission =
    state.selectedSubmission;

  if (!submission) return;

  const confirmed =
    confirm(
      "Опубликовать эту заявку?"
    );

  if (!confirmed) return;

  try {
    await api(
      `/api/admin/submissions/${encodeURIComponent(
        submission.id
      )}/approve`,
      {
        method: "POST",
      }
    );

    closeSubmissionModal();

    await Promise.all([
      loadSubmissions(),
      loadPosts(),
      loadStats(),
    ]);

    alert(
      "Заявка опубликована."
    );
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      closeSubmissionModal();
      return;
    }

    alert(
      error.message ||
        "Не удалось опубликовать заявку."
    );
  }
}

async function rejectSelectedSubmission() {
  const submission =
    state.selectedSubmission;

  if (!submission) return;

  const reason =
    prompt(
      "Причина отклонения:",
      "Материал не соответствует требованиям платформы."
    );

  if (reason === null) return;

  try {
    await api(
      `/api/admin/submissions/${encodeURIComponent(
        submission.id
      )}/reject`,
      {
        method: "POST",
        body: JSON.stringify({
          reason,
        }),
      }
    );

    closeSubmissionModal();

    await Promise.all([
      loadSubmissions(),
      loadStats(),
    ]);

    alert(
      "Заявка отклонена."
    );
  } catch (error) {
    if (error.status === 401) {
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
   ВСЕ ОПУБЛИКОВАННЫЕ ПОСТЫ
   ============================================================ */

async function loadPosts() {
  const list =
    $("adminPostsList");

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
    const data =
      await api(
        "/api/admin/posts"
      );

    state.posts =
      data.posts || [];

    renderPosts();
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }

    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Не удалось загрузить посты.";

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

  if (!list) return;

  list.innerHTML = "";

  let posts =
    [...state.posts];

  if (
    state.postFilter !== "all"
  ) {
    posts =
      posts.filter(
        (post) =>
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

  for (const post of posts) {
    const card =
      document.createElement("article");

    card.className =
      "admin-post-card";

    const title =
      escapeHtml(
        post.title ||
          "Без названия"
      );

    const category =
      escapeHtml(
        post.category ||
          "Без категории"
      );

    const author =
      escapeHtml(
        post.author_name ||
          "Не указан"
      );

    const date =
      formatDate(
        post.published_at
      );

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

          <h3>${title}</h3>

          <div class="admin-post-meta">
            <span>${category}</span>
            <span>${date}</span>
            <span>${author}</span>
          </div>

          <p>
            ${escapeHtml(
              (post.content || "")
                .slice(0, 220)
            )}${post.content?.length > 220 ? "…" : ""}
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
          Открыть
        </button>

        <button
          type="button"
          class="admin-post-edit"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          Редактировать
        </button>

        <button
          type="button"
          class="admin-post-delete"
          data-id="${escapeAttr(
            post.id
          )}"
        >
          Удалить
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
          openPost(post.id)
      );

    card
      .querySelector(
        ".admin-post-edit"
      )
      ?.addEventListener(
        "click",
        () =>
          editPost(post.id)
      );

    card
      .querySelector(
        ".admin-post-delete"
      )
      ?.addEventListener(
        "click",
        () =>
          deletePost(post.id)
      );

    list.appendChild(card);
  }
}

function openPost(id) {
  const post =
    state.posts.find(
      (item) => item.id === id
    );

  if (!post) return;

  state.selectedPost =
    post;

  const modal =
    $("postModal");

  const body =
    $("postModalBody");

  if (!modal || !body) {
    editPost(id);
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
              style="max-width:100%;border-radius:12px;"
            >
          `
          : ""
      }

      <h2>
        ${escapeHtml(
          post.title || ""
        )}
      </h2>

      <p>
        <strong>Категория:</strong>
        ${escapeHtml(
          post.category || "—"
        )}
      </p>

      <p>
        <strong>Автор:</strong>
        ${escapeHtml(
          post.author_name || "—"
        )}
      </p>

      <p>
        <strong>Контакт:</strong>
        ${escapeHtml(
          post.contact || "—"
        )}
      </p>

      <p>
        <strong>Дата публикации:</strong>
        ${formatDate(
          post.published_at
        )}
      </p>

      <hr>

      <div>
        ${escapeHtml(
          post.content || ""
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
                Открыть ссылку поста
              </a>
            </p>
          `
          : ""
      }

    </div>
  `;

  modal.hidden = false;
}

function closePostModal() {
  const modal =
    $("postModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedPost = null;
}

function editPost(id) {
  const post =
    state.posts.find(
      (item) => item.id === id
    );

  if (!post) return;

  state.selectedPost =
    post;

  const modal =
    $("postEditModal");

  const form =
    $("postEditForm");

  if (!modal || !form) {
    alert(
      "В admin.html ещё нет формы редактирования поста."
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

async function savePost() {
  const post =
    state.selectedPost;

  if (!post) return;

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

  if (title.length < 5) {
    alert(
      "Заголовок должен содержать минимум 5 символов."
    );

    return;
  }

  if (content.length < 20) {
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
      "Сохранить изменения этого поста?"
    );

  if (!confirmed) return;

  const button =
    $("postEditSave");

  if (button) {
    button.disabled = true;
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
          author_name,
        }),
      }
    );

    closePostEditModal();

    await Promise.all([
      loadPosts(),
      loadStats(),
    ]);

    alert(
      "Пост успешно изменён."
    );
  } catch (error) {
    if (error.status === 401) {
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
      button.disabled = false;
      button.textContent =
        "Сохранить изменения";
    }
  }
}

function closePostEditModal() {
  const modal =
    $("postEditModal");

  if (modal) {
    modal.hidden = true;
  }

  state.selectedPost = null;
}

async function deletePost(id) {
  const post =
    state.posts.find(
      (item) => item.id === id
    );

  if (!post) return;

  const confirmed =
    confirm(
      `Удалить пост «${post.title}»?\n\nЭто действие нельзя отменить.`
    );

  if (!confirmed) return;

  const secondConfirm =
    confirm(
      "Вы действительно хотите окончательно удалить этот пост?"
    );

  if (!secondConfirm) return;

  try {
    await api(
      `/api/admin/posts/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
      }
    );

    await Promise.all([
      loadPosts(),
      loadStats(),
    ]);

    alert(
      "Пост удалён."
    );
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      return;
    }

    alert(
      error.message ||
        "Не удалось удалить пост."
    );
  }
}

function setupFilters() {
  document
    .querySelectorAll(
      "[data-admin-filter]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        async () => {
          const filter =
            button.dataset.adminFilter;

          if (!filter) return;

          state.filter =
            filter;

          document
            .querySelectorAll(
              "[data-admin-filter]"
            )
            .forEach((item) => {
              item.classList.toggle(
                "active",
                item === button
              );
            });

          await loadSubmissions();
        }
      );
    });

  document
    .querySelectorAll(
      "[data-post-filter]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          state.postFilter =
            button.dataset.postFilter ||
            "all";

          document
            .querySelectorAll(
              "[data-post-filter]"
            )
            .forEach((item) => {
              item.classList.toggle(
                "active",
                item === button
              );
            });

          renderPosts();
        }
      );
    });
}

function setupEvents() {
  $("adminLoginButton")
    ?.addEventListener(
      "click",
      handleLogin
    );

  $("adminPassword")
    ?.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter"
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
      async () => {
        await Promise.all([
          loadSubmissions(),
          loadPosts(),
          loadStats(),
        ]);
      }
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
      (event) => {
        event.preventDefault();
        savePost();
      }
    );

  setupFilters();
}

function setValue(id, value) {
  const element = $(id);

  if (element) {
    element.value =
      value ?? "";
  }
}

function getValue(id) {
  return String(
    $(id)?.value || ""
  ).trim();
}

function formatDate(value) {
  if (!value) return "—";

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
      timeStyle: "short",
    }
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

function escapeAttr(value) {
  return escapeHtml(value);
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    setupEvents();
    checkAuthentication();
  }
);
