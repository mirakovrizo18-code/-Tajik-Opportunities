/* ============================================================
   TAJIK OPPORTUNITIES
   Закрытая панель администратора
   ============================================================ */

(() => {
  "use strict";

  // ==========================================================
  // СОСТОЯНИЕ
  // ==========================================================

  const state = {
    authenticated: false,
    loading: false,
    submissions: [],
    filter: "pending",
    selectedSubmission: null,
  };

  // ==========================================================
  // DOM
  // ==========================================================

  const elements = {
    loginSection: document.getElementById("adminLogin"),
    dashboardSection: document.getElementById("adminDashboard"),

    loginForm: document.getElementById("adminLoginForm"),
    passwordInput: document.getElementById("adminPassword"),
    loginButton: document.getElementById("adminLoginButton"),
    loginMessage: document.getElementById("adminLoginMessage"),

    logoutButton: document.getElementById("adminLogout"),
    refreshButton: document.getElementById("adminRefresh"),

    filterButtons: Array.from(
      document.querySelectorAll("[data-admin-filter]")
    ),

    submissionsList:
      document.getElementById("submissionsList"),

    loadingState:
      document.getElementById("adminLoading"),

    emptyState:
      document.getElementById("adminEmpty"),

    errorState:
      document.getElementById("adminError"),

    errorMessage:
      document.getElementById("adminErrorMessage"),

    retryButton:
      document.getElementById("adminRetry"),

    pendingCount:
      document.getElementById("pendingCount"),

    approvedCount:
      document.getElementById("approvedCount"),

    rejectedCount:
      document.getElementById("rejectedCount"),

    totalCount:
      document.getElementById("totalCount"),

    modal:
      document.getElementById("submissionModal"),

    modalClose:
      document.getElementById("submissionModalClose"),

    modalBody:
      document.getElementById("submissionModalBody"),

    modalApprove:
      document.getElementById("submissionApprove"),

    modalReject:
      document.getElementById("submissionReject"),

    rejectModal:
      document.getElementById("rejectModal"),

    rejectForm:
      document.getElementById("rejectForm"),

    rejectReason:
      document.getElementById("rejectReason"),

    rejectCancel:
      document.getElementById("rejectCancel"),

    rejectSubmit:
      document.getElementById("rejectSubmit"),
  };

  // ==========================================================
  // API
  // ==========================================================

  async function apiRequest(
    url,
    options = {}
  ) {
    const requestOptions = {
      credentials: "same-origin",
      ...options,
      headers: {
        "Accept": "application/json",
        ...(options.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),
        ...(options.headers || {}),
      },
    };

    const response =
      await fetch(
        url,
        requestOptions
      );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.error ||
          data?.message ||
          `Ошибка сервера: ${response.status}`
        );

      error.status =
        response.status;

      error.data = data;

      throw error;
    }

    return data;
  }

  async function getJson(url) {
    return apiRequest(url);
  }

  async function postJson(
    url,
    body = {}
  ) {
    return apiRequest(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // ==========================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ==========================================================

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeExternalUrl(value) {
    const raw =
      String(value || "").trim();

    if (!raw) {
      return "";
    }

    try {
      const url =
        new URL(raw);

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function truncateText(
    text,
    maxLength = 220
  ) {
    const value =
      String(text || "").trim();

    if (value.length <= maxLength) {
      return value;
    }

    return (
      value.slice(
        0,
        maxLength
      ).trim() + "…"
    );
  }

  function formatDateTime(value) {
    if (!value) {
      return "Не указано";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Не указано";
    }

    return new Intl.DateTimeFormat(
      "ru-RU",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  }

  function formatRelativeDate(value) {
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

    const now =
      Date.now();

    const diff =
      now - date.getTime();

    const minute =
      60 * 1000;

    const hour =
      60 * minute;

    const day =
      24 * hour;

    if (diff < minute) {
      return "только что";
    }

    if (diff < hour) {
      const minutes =
        Math.floor(
          diff / minute
        );

      return `${minutes} мин. назад`;
    }

    if (diff < day) {
      const hours =
        Math.floor(
          diff / hour
        );

      return `${hours} ч. назад`;
    }

    if (diff < 7 * day) {
      const days =
        Math.floor(
          diff / day
        );

      return `${days} дн. назад`;
    }

    return formatDateTime(value);
  }

  function getCategoryLabel(
    category
  ) {
    const labels = {
      education: "Образование",
      jobs: "Работа",
      competitions: "Конкурсы",
      grants: "Гранты",
      scholarships: "Стипендии",
      programs: "Программы",
      internships: "Стажировки",
      events: "Мероприятия",
      business: "Бизнес",
      volunteering: "Волонтёрство",
      other: "Другое",
    };

    return (
      labels[
        String(category || "")
          .toLowerCase()
      ] ||
      category ||
      "Другое"
    );
  }

  function getCategoryIcon(
    category
  ) {
    const icons = {
      education: "🎓",
      jobs: "💼",
      competitions: "🏆",
      grants: "💰",
      scholarships: "🎓",
      programs: "🚀",
      internships: "🧑‍💻",
      events: "📅",
      business: "🏢",
      volunteering: "🤝",
      other: "📌",
    };

    return (
      icons[
        String(category || "")
          .toLowerCase()
      ] || "📌"
    );
  }

  function getStatusLabel(
    status
  ) {
    const labels = {
      pending: "На модерации",
      approved: "Одобрено",
      rejected: "Отклонено",
    };

    return (
      labels[
        String(status || "")
          .toLowerCase()
      ] ||
      "Неизвестно"
    );
  }

  function getStatusIcon(
    status
  ) {
    const icons = {
      pending: "🕐",
      approved: "✅",
      rejected: "❌",
    };

    return (
      icons[
        String(status || "")
          .toLowerCase()
      ] || "📄"
    );
  }

  function getErrorMessage(
    error,
    fallback
  ) {
    if (
      error &&
      error.message
    ) {
      return error.message;
    }

    return fallback;
  }

  function setButtonLoading(
    button,
    loading,
    loadingText = "Загрузка..."
  ) {
    if (!button) {
      return;
    }

    if (loading) {
      if (!button.dataset.originalText) {
        button.dataset.originalText =
          button.textContent.trim();
      }

      button.disabled = true;
      button.textContent =
        loadingText;
    } else {
      button.disabled = false;

      if (
        button.dataset.originalText
      ) {
        button.textContent =
          button.dataset.originalText;

        delete button.dataset
          .originalText;
      }
    }
  }

  function showToast(
    message,
    type = "info"
  ) {
    const toast =
      document.getElementById(
        "toast"
      );

    if (!toast) {
      console.log(message);
      return;
    }

    const messageElement =
      toast.querySelector(
        ".toast-message"
      );

    if (messageElement) {
      messageElement.textContent =
        message;
    } else {
      toast.textContent =
        message;
    }

    toast.hidden = false;

    toast.classList.remove(
      "success",
      "error",
      "warning",
      "info"
    );

    toast.classList.add(
      type
    );

    clearTimeout(
      showToast.timer
    );

    showToast.timer =
      setTimeout(() => {
        toast.hidden = true;
      }, 4000);
  }

  // ==========================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================================================

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

  async function init() {
    bindEvents();

    await checkAuthentication();
  }

  // ==========================================================
  // СОБЫТИЯ
  // ==========================================================

  function bindEvents() {
    if (elements.loginForm) {
      elements.loginForm.addEventListener(
        "submit",
        handleLogin
      );
    }

    if (elements.logoutButton) {
      elements.logoutButton.addEventListener(
        "click",
        handleLogout
      );
    }

    if (elements.refreshButton) {
      elements.refreshButton.addEventListener(
        "click",
        () => {
          loadSubmissions();
        }
      );
    }

    elements.filterButtons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            state.filter =
              button.dataset.adminFilter ||
              "pending";

            updateFilterButtons();
            renderSubmissions();
          }
        );
      }
    );

    if (elements.retryButton) {
      elements.retryButton.addEventListener(
        "click",
        loadSubmissions
      );
    }

    if (elements.modalClose) {
      elements.modalClose.addEventListener(
        "click",
        closeSubmissionModal
      );
    }

    if (elements.modalApprove) {
      elements.modalApprove.addEventListener(
        "click",
        handleApprove
      );
    }

    if (elements.modalReject) {
      elements.modalReject.addEventListener(
        "click",
        openRejectModal
      );
    }

    if (elements.rejectForm) {
      elements.rejectForm.addEventListener(
        "submit",
        handleReject
      );
    }

    if (elements.rejectCancel) {
      elements.rejectCancel.addEventListener(
        "click",
        closeRejectModal
      );
    }

    document.addEventListener(
      "keydown",
      handleKeyboard
    );

    if (elements.modal) {
      elements.modal.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            elements.modal
          ) {
            closeSubmissionModal();
          }
        }
      );
    }

    if (elements.rejectModal) {
      elements.rejectModal.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            elements.rejectModal
          ) {
            closeRejectModal();
          }
        }
      );
    }
  }

  function handleKeyboard(event) {
    if (
      event.key !== "Escape"
    ) {
      return;
    }

    closeSubmissionModal();
    closeRejectModal();
  }

  // ==========================================================
  // АВТОРИЗАЦИЯ
  // ==========================================================

  async function checkAuthentication() {
    try {
      const response =
        await getJson(
          "/api/admin/me"
        );

      if (
        response &&
        (
          response.authenticated === true ||
          response.ok === true
        )
      ) {
        state.authenticated =
          true;

        showDashboard();

        await loadSubmissions();

        return;
      }

      showLogin();
    } catch (error) {
      showLogin();
    }
  }

  // ==========================================================
  // ВХОД
  // ==========================================================

  async function handleLogin(
    event
  ) {
    event.preventDefault();

    if (!elements.passwordInput) {
      return;
    }

    const password =
      elements.passwordInput.value;

    if (!password) {
      showLoginMessage(
        "Введите пароль администратора.",
        "error"
      );

      return;
    }

    setButtonLoading(
      elements.loginButton,
      true,
      "Входим..."
    );

    clearLoginMessage();

    try {
      const response =
        await postJson(
          "/api/admin/login",
          {
            password,
          }
        );

      if (
        !response ||
        (
          response.authenticated !== true &&
          response.ok !== true
        )
      ) {
        throw new Error(
          "Не удалось выполнить вход."
        );
      }

      state.authenticated =
        true;

      elements.passwordInput.value =
        "";

      showDashboard();

      await loadSubmissions();

      showToast(
        "Вы успешно вошли в панель администратора.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка входа",
        error
      );

      showLoginMessage(
        getErrorMessage(
          error,
          "Неверный пароль или ошибка сервера."
        ),
        "error"
      );
    } finally {
      setButtonLoading(
        elements.loginButton,
        false
      );
    }
  }

  // ==========================================================
  // ВЫХОД
  // ==========================================================

  async function handleLogout() {
    try {
      await postJson(
        "/api/admin/logout",
        {}
      );
    } catch (error) {
      console.warn(
        "Tajik Opportunities: ошибка выхода",
        error
      );
    }

    state.authenticated =
      false;

    state.submissions = [];

    state.selectedSubmission =
      null;

    closeSubmissionModal();
    closeRejectModal();

    showLogin();

    showToast(
      "Вы вышли из панели.",
      "success"
    );
  }

  // ==========================================================
  // ЗАГРУЗКА ЗАЯВОК
  // ==========================================================

  async function loadSubmissions() {
    if (
      !state.authenticated ||
      state.loading
    ) {
      return;
    }

    state.loading = true;

    showAdminLoading();
    hideAdminError();

    try {
      /*
       * Worker возвращает заявки через:
       * GET /api/admin/submissions
       */
      const response =
        await getJson(
          "/api/admin/submissions"
        );

      const submissions =
        extractSubmissions(
          response
        );

      state.submissions =
        Array.isArray(
          submissions
        )
          ? submissions
          : [];

      updateCounters();
      renderSubmissions();

      hideAdminLoading();
      hideAdminError();
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка загрузки заявок",
        error
      );

      hideAdminLoading();

      if (
        error &&
        (
          error.status === 401 ||
          error.status === 403
        )
      ) {
        state.authenticated =
          false;

        showLogin();

        showLoginMessage(
          "Сессия закончилась. Войдите снова.",
          "error"
        );

        return;
      }

      showAdminError(
        getErrorMessage(
          error,
          "Не удалось загрузить заявки."
        )
      );
    } finally {
      state.loading = false;
    }
  }

  function extractSubmissions(
    response
  ) {
    if (
      Array.isArray(response)
    ) {
      return response;
    }

    if (
      response &&
      Array.isArray(
        response.submissions
      )
    ) {
      return response.submissions;
    }

    if (
      response &&
      response.data &&
      Array.isArray(
        response.data.submissions
      )
    ) {
      return response.data
        .submissions;
    }

    return [];
  }

  // ==========================================================
  // СЧЁТЧИКИ
  // ==========================================================

  function updateCounters() {
    const submissions =
      state.submissions;

    const pending =
      submissions.filter(
        (item) =>
          String(
            item.status || ""
          ).toLowerCase() ===
          "pending"
      ).length;

    const approved =
      submissions.filter(
        (item) =>
          String(
            item.status || ""
          ).toLowerCase() ===
          "approved"
      ).length;

    const rejected =
      submissions.filter(
        (item) =>
          String(
            item.status || ""
          ).toLowerCase() ===
          "rejected"
      ).length;

    if (elements.pendingCount) {
      elements.pendingCount.textContent =
        pending;
    }

    if (elements.approvedCount) {
      elements.approvedCount.textContent =
        approved;
    }

    if (elements.rejectedCount) {
      elements.rejectedCount.textContent =
        rejected;
    }

    if (elements.totalCount) {
      elements.totalCount.textContent =
        submissions.length;
    }
  }

  // ==========================================================
  // ФИЛЬТРЫ
  // ==========================================================

  function updateFilterButtons() {
    elements.filterButtons.forEach(
      (button) => {
        const active =
          button.dataset.adminFilter ===
          state.filter;

        button.classList.toggle(
          "active",
          active
        );

        button.setAttribute(
          "aria-pressed",
          active
            ? "true"
            : "false"
        );
      }
    );
  }

  function getFilteredSubmissions() {
    if (
      state.filter ===
      "all"
    ) {
      return [
        ...state.submissions,
      ];
    }

    return state.submissions.filter(
      (submission) =>
        String(
          submission.status ||
          ""
        ).toLowerCase() ===
        state.filter
    );
  }

  // ==========================================================
  // ОТРИСОВКА СПИСКА
  // ==========================================================

  function renderSubmissions() {
    if (
      !elements.submissionsList
    ) {
      return;
    }

    const submissions =
      getFilteredSubmissions();

    if (!submissions.length) {
      elements.submissionsList.innerHTML =
        "";

      showAdminEmpty();

      return;
    }

    hideAdminEmpty();

    submissions.sort(
      (a, b) => {
        const dateA =
          new Date(
            a.created_at ||
            a.createdAt ||
            0
          ).getTime();

        const dateB =
          new Date(
            b.created_at ||
            b.createdAt ||
            0
          ).getTime();

        return (
          dateB - dateA
        );
      }
    );

    elements.submissionsList.innerHTML =
      submissions
        .map(
          renderSubmissionCard
        )
        .join("");

    bindSubmissionCards();
  }

  function renderSubmissionCard(
    submission
  ) {
    const id =
      String(
        submission.id || ""
      );

    const title =
      escapeHtml(
        submission.title ||
        "Без названия"
      );

    const category =
      submission.category ||
      "other";

    const categoryLabel =
      escapeHtml(
        getCategoryLabel(
          category
        )
      );

    const categoryIcon =
      getCategoryIcon(
        category
      );

    const status =
      String(
        submission.status ||
        "pending"
      ).toLowerCase();

    const statusLabel =
      escapeHtml(
        getStatusLabel(
          status
        )
      );

    const statusIcon =
      getStatusIcon(
        status
      );

    const dateValue =
      submission.created_at ||
      submission.createdAt ||
      "";

    const date =
      dateValue
        ? formatRelativeDate(
            dateValue
          )
        : "";

    const author =
      submission.author_name ||
      submission.authorName ||
      "Автор не указан";

    const safeAuthor =
      escapeHtml(
        author
      );

    const trackingCode =
      submission.tracking_code ||
      submission.trackingCode ||
      "";

    const safeTrackingCode =
      escapeHtml(
        trackingCode
      );

    const excerpt =
      escapeHtml(
        truncateText(
          submission.content ||
          "",
          220
        )
      );

    return `
      <article
        class="admin-submission-card"
        data-submission-id="${escapeHtml(id)}"
      >

        <div class="admin-submission-header">

          <div class="admin-submission-category">
            <span aria-hidden="true">
              ${categoryIcon}
            </span>

            <span>
              ${categoryLabel}
            </span>
          </div>

          <div
            class="admin-submission-status status-${escapeHtml(status)}"
          >
            <span aria-hidden="true">
              ${statusIcon}
            </span>

            <span>
              ${statusLabel}
            </span>
          </div>

        </div>

        <h3 class="admin-submission-title">
          ${title}
        </h3>

        <p class="admin-submission-excerpt">
          ${excerpt}
        </p>

        <div class="admin-submission-info">

          <span>
            👤 ${safeAuthor}
          </span>

          ${
            date
              ? `
                <span>
                  🕐 ${escapeHtml(date)}
                </span>
              `
              : ""
          }

          ${
            safeTrackingCode
              ? `
                <span>
                  🔑 ${safeTrackingCode}
                </span>
              `
              : ""
          }

        </div>

        <div class="admin-submission-actions">

          <button
            type="button"
            class="btn btn-secondary admin-view-button"
            data-id="${escapeHtml(id)}"
          >
            👁 Подробнее
          </button>

          ${
            status === "pending"
              ? `
                <button
                  type="button"
                  class="btn btn-primary admin-approve-button"
                  data-id="${escapeHtml(id)}"
                >
                  ✓ Одобрить
                </button>

                <button
                  type="button"
                  class="btn btn-danger admin-reject-button"
                  data-id="${escapeHtml(id)}"
                >
                  ✕ Отклонить
                </button>
              `
              : ""
          }

        </div>

      </article>
    `;
  }

  // ==========================================================
  // СОБЫТИЯ КАРТОЧЕК
  // ==========================================================

  function bindSubmissionCards() {
    document
      .querySelectorAll(
        ".admin-view-button"
      )
      .forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              openSubmissionModal(
                button.dataset.id
              );
            }
          );
        }
      );

    document
      .querySelectorAll(
        ".admin-approve-button"
      )
      .forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              const submission =
                findSubmission(
                  button.dataset.id
                );

              if (submission) {
                state.selectedSubmission =
                  submission;

                handleApprove();
              }
            }
          );
        }
      );

    document
      .querySelectorAll(
        ".admin-reject-button"
      )
      .forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              const submission =
                findSubmission(
                  button.dataset.id
                );

              if (submission) {
                state.selectedSubmission =
                  submission;

                openRejectModal();
              }
            }
          );
        }
      );
  }

  // ==========================================================
  // ПОИСК
  // ==========================================================

  function findSubmission(
    id
  ) {
    return state.submissions.find(
      (submission) =>
        String(
          submission.id
        ) ===
        String(id)
    );
  }

  // ==========================================================
  // ПРОСМОТР
  // ==========================================================

  function openSubmissionModal(
    id
  ) {
    const submission =
      findSubmission(id);

    if (!submission) {
      return;
    }

    state.selectedSubmission =
      submission;

    renderSubmissionModal(
      submission
    );

    if (elements.modal) {
      elements.modal.hidden =
        false;

      document.body.classList.add(
        "modal-open"
      );
    }
  }

  function closeSubmissionModal() {
    if (elements.modal) {
      elements.modal.hidden =
        true;
    }

    document.body.classList.remove(
      "modal-open"
    );
  }

  function renderSubmissionModal(
    submission
  ) {
    if (
      !elements.modalBody
    ) {
      return;
    }

    const title =
      escapeHtml(
        submission.title ||
        "Без названия"
      );

    const content =
      escapeHtml(
        submission.content ||
        ""
      );

    const category =
      submission.category ||
      "other";

    const categoryLabel =
      escapeHtml(
        getCategoryLabel(
          category
        )
      );

    const categoryIcon =
      getCategoryIcon(
        category
      );

    const author =
      escapeHtml(
        submission.author_name ||
        submission.authorName ||
        "Не указан"
      );

    const contact =
      escapeHtml(
        submission.contact ||
        "Не указан"
      );

    const trackingCode =
      escapeHtml(
        submission.tracking_code ||
        submission.trackingCode ||
        "Не указан"
      );

    const createdAt =
      submission.created_at ||
      submission.createdAt ||
      "";

    const formattedDate =
      escapeHtml(
        createdAt
          ? formatDateTime(
              createdAt
            )
          : "Не указано"
      );

    const linkUrl =
      safeExternalUrl(
        submission.link_url ||
        submission.linkUrl ||
        ""
      );

    const imageUrl =
      safeExternalUrl(
        submission.image_url ||
        submission.imageUrl ||
        ""
      );

    const status =
      String(
        submission.status ||
        "pending"
      ).toLowerCase();

    const rejectionReason =
      submission.rejection_reason ||
      submission.rejectionReason ||
      "";

    elements.modalBody.innerHTML = `
      <div class="admin-detail">

        <div class="admin-detail-top">

          <span class="admin-detail-category">
            ${categoryIcon}
            ${categoryLabel}
          </span>

          <span
            class="admin-detail-status status-${escapeHtml(status)}"
          >
            ${getStatusIcon(status)}
            ${escapeHtml(
              getStatusLabel(
                status
              )
            )}
          </span>

        </div>

        <h2 class="admin-detail-title">
          ${title}
        </h2>

        ${
          imageUrl
            ? `
              <div class="admin-detail-image">
                <img
                  src="${escapeHtml(imageUrl)}"
                  alt="${title}"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                >
              </div>
            `
            : ""
        }

        <div class="admin-detail-content">
          ${formatAdminContent(
            content
          )}
        </div>

        <div class="admin-detail-data">

          <div class="admin-detail-row">
            <strong>Автор:</strong>
            <span>${author}</span>
          </div>

          <div class="admin-detail-row">
            <strong>Контакт:</strong>
            <span>${contact}</span>
          </div>

          <div class="admin-detail-row">
            <strong>Код:</strong>
            <span>${trackingCode}</span>
          </div>

          <div class="admin-detail-row">
            <strong>Отправлено:</strong>
            <span>${formattedDate}</span>
          </div>

          ${
            linkUrl
              ? `
                <div class="admin-detail-row">
                  <strong>Ссылка:</strong>

                  <a
                    href="${escapeHtml(linkUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Открыть источник
                  </a>
                </div>
              `
              : ""
          }

          ${
            rejectionReason
              ? `
                <div class="admin-detail-row admin-rejection-reason">

                  <strong>
                    Причина отклонения:
                  </strong>

                  <span>
                    ${escapeHtml(
                      rejectionReason
                    )}
                  </span>

                </div>
              `
              : ""
          }

        </div>

      </div>
    `;

    updateModalActions(
      status
    );
  }

  function formatAdminContent(
    content
  ) {
    return String(
      content || ""
    )
      .split(/\n{2,}/)
      .map(
        (paragraph) => {
          const value =
            paragraph.trim();

          if (!value) {
            return "";
          }

          return `<p>${value.replace(
            /\n/g,
            "<br>"
          )}</p>`;
        }
      )
      .join("");
  }

  function updateModalActions(
    status
  ) {
    const pending =
      status === "pending";

    if (elements.modalApprove) {
      elements.modalApprove.hidden =
        !pending;
    }

    if (elements.modalReject) {
      elements.modalReject.hidden =
        !pending;
    }
  }

  // ==========================================================
  // ОДОБРЕНИЕ
  // ==========================================================

  async function handleApprove() {
    const submission =
      state.selectedSubmission;

    if (!submission) {
      return;
    }

    if (
      String(
        submission.status ||
        ""
      ).toLowerCase() !==
      "pending"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Одобрить публикацию «${submission.title || "Без названия"}»?\n\nПосле одобрения она появится на сайте.`
      );

    if (!confirmed) {
      return;
    }

    setButtonLoading(
      elements.modalApprove,
      true,
      "Одобряем..."
    );

    try {
      const response =
        await postJson(
          `/api/admin/submissions/${encodeURIComponent(
            submission.id
          )}/approve`,
          {}
        );

      const updated =
        response?.submission ||
        response?.data?.submission;

      if (updated) {
        replaceSubmission(
          updated
        );
      } else {
        updateLocalSubmission(
          submission.id,
          {
            status:
              "approved",
          }
        );
      }

      closeSubmissionModal();

      updateCounters();
      renderSubmissions();

      showToast(
        "Публикация одобрена и опубликована.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка одобрения",
        error
      );

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        state.authenticated =
          false;

        closeSubmissionModal();
        showLogin();

        showLoginMessage(
          "Сессия закончилась. Войдите снова.",
          "error"
        );

        return;
      }

      showToast(
        getErrorMessage(
          error,
          "Не удалось одобрить публикацию."
        ),
        "error"
      );
    } finally {
      setButtonLoading(
        elements.modalApprove,
        false
      );
    }
  }

  // ==========================================================
  // ОТКЛОНЕНИЕ
  // ==========================================================

  function openRejectModal() {
    if (
      !state.selectedSubmission
    ) {
      return;
    }

    if (elements.rejectReason) {
      elements.rejectReason.value =
        "";
    }

    if (elements.rejectModal) {
      elements.rejectModal.hidden =
        false;

      document.body.classList.add(
        "modal-open"
      );
    }

    setTimeout(
      () => {
        if (
          elements.rejectReason
        ) {
          elements.rejectReason.focus();
        }
      },
      50
    );
  }

  function closeRejectModal() {
    if (
      elements.rejectModal
    ) {
      elements.rejectModal.hidden =
        true;
    }

    document.body.classList.remove(
      "modal-open"
    );
  }

  async function handleReject(
    event
  ) {
    event.preventDefault();

    const submission =
      state.selectedSubmission;

    if (!submission) {
      return;
    }

    const reason =
      elements.rejectReason
        ? elements.rejectReason.value.trim()
        : "";

    if (!reason) {
      showToast(
        "Укажите причину отклонения.",
        "error"
      );

      return;
    }

    if (
      reason.length < 5
    ) {
      showToast(
        "Причина должна содержать минимум 5 символов.",
        "error"
      );

      return;
    }

    if (
      reason.length > 2000
    ) {
      showToast(
        "Причина слишком длинная.",
        "error"
      );

      return;
    }

    setButtonLoading(
      elements.rejectSubmit,
      true,
      "Отклоняем..."
    );

    try {
      const response =
        await postJson(
          `/api/admin/submissions/${encodeURIComponent(
            submission.id
          )}/reject`,
          {
            reason,
          }
        );

      const updated =
        response?.submission ||
        response?.data?.submission;

      if (updated) {
        replaceSubmission(
          updated
        );
      } else {
        updateLocalSubmission(
          submission.id,
          {
            status:
              "rejected",
            rejection_reason:
              reason,
          }
        );
      }

      closeRejectModal();
      closeSubmissionModal();

      updateCounters();
      renderSubmissions();

      showToast(
        "Публикация отклонена.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка отклонения",
        error
      );

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        state.authenticated =
          false;

        closeRejectModal();
        closeSubmissionModal();

        showLogin();

        showLoginMessage(
          "Сессия закончилась. Войдите снова.",
          "error"
        );

        return;
      }

      showToast(
        getErrorMessage(
          error,
          "Не удалось отклонить публикацию."
        ),
        "error"
      );
    } finally {
      setButtonLoading(
        elements.rejectSubmit,
        false
      );
    }
  }

  // ==========================================================
  // ЛОКАЛЬНЫЕ ДАННЫЕ
  // ==========================================================

  function replaceSubmission(
    updated
  ) {
    if (
      !updated ||
      !updated.id
    ) {
      return;
    }

    const index =
      state.submissions.findIndex(
        (submission) =>
          String(
            submission.id
          ) ===
          String(
            updated.id
          )
      );

    if (index === -1) {
      state.submissions.push(
        updated
      );

      return;
    }

    state.submissions[index] =
      {
        ...state.submissions[
          index
        ],
        ...updated,
      };
  }

  function updateLocalSubmission(
    id,
    changes
  ) {
    const submission =
      findSubmission(id);

    if (!submission) {
      return;
    }

    Object.assign(
      submission,
      changes
    );
  }

  // ==========================================================
  // LOGIN UI
  // ==========================================================

  function showLogin() {
    if (
      elements.loginSection
    ) {
      elements.loginSection.hidden =
        false;
    }

    if (
      elements.dashboardSection
    ) {
      elements.dashboardSection.hidden =
        true;
    }
  }

  function showDashboard() {
    if (
      elements.loginSection
    ) {
      elements.loginSection.hidden =
        true;
    }

    if (
      elements.dashboardSection
    ) {
      elements.dashboardSection.hidden =
        false;
    }

    updateFilterButtons();
  }

  function showLoginMessage(
    message,
    type = "error"
  ) {
    if (
      !elements.loginMessage
    ) {
      return;
    }

    elements.loginMessage.hidden =
      false;

    elements.loginMessage.textContent =
      message;

    elements.loginMessage.classList.remove(
      "success",
      "error",
      "warning"
    );

    elements.loginMessage.classList.add(
      type
    );
  }

  function clearLoginMessage() {
    if (
      !elements.loginMessage
    ) {
      return;
    }

    elements.loginMessage.hidden =
      true;

    elements.loginMessage.textContent =
      "";

    elements.loginMessage.classList.remove(
      "success",
      "error",
      "warning"
    );
  }

  // ==========================================================
  // ADMIN UI
  // ==========================================================

  function showAdminLoading() {
    if (
      elements.loadingState
    ) {
      elements.loadingState.hidden =
        false;
    }

    if (
      elements.submissionsList
    ) {
      elements.submissionsList.hidden =
        true;
    }

    if (
      elements.emptyState
    ) {
      elements.emptyState.hidden =
        true;
    }
  }

  function hideAdminLoading() {
    if (
      elements.loadingState
    ) {
      elements.loadingState.hidden =
        true;
    }

    if (
      elements.submissionsList
    ) {
      elements.submissionsList.hidden =
        false;
    }
  }

  function showAdminEmpty() {
    if (
      elements.emptyState
    ) {
      elements.emptyState.hidden =
        false;
    }
  }

  function hideAdminEmpty() {
    if (
      elements.emptyState
    ) {
      elements.emptyState.hidden =
        true;
    }
  }

  function showAdminError(
    message
  ) {
    if (
      elements.errorState
    ) {
      elements.errorState.hidden =
        false;
    }

    if (
      elements.errorMessage
    ) {
      elements.errorMessage.textContent =
        message;
    }

    if (
      elements.submissionsList
    ) {
      elements.submissionsList.hidden =
        true;
    }
  }

  function hideAdminError() {
    if (
      elements.errorState
    ) {
      elements.errorState.hidden =
        true;
    }
  }
})();
