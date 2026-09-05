/* ============================================================
   TAJIK OPPORTUNITIES
   Закрытая панель администратора
   ============================================================ */

(() => {
  "use strict";

  const TO = window.TO;

  if (!TO) {
    console.error("Tajik Opportunities: utils.js не загружен.");
    return;
  }

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
    // --------------------------------------------------------
    // Вход
    // --------------------------------------------------------

    if (elements.loginForm) {
      elements.loginForm.addEventListener(
        "submit",
        handleLogin
      );
    }

    // --------------------------------------------------------
    // Выход
    // --------------------------------------------------------

    if (elements.logoutButton) {
      elements.logoutButton.addEventListener(
        "click",
        handleLogout
      );
    }

    // --------------------------------------------------------
    // Обновление
    // --------------------------------------------------------

    if (elements.refreshButton) {
      elements.refreshButton.addEventListener(
        "click",
        () => {
          loadSubmissions();
        }
      );
    }

    // --------------------------------------------------------
    // Фильтры
    // --------------------------------------------------------

    elements.filterButtons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const filter =
              button.dataset.adminFilter ||
              "pending";

            state.filter = filter;

            updateFilterButtons();
            renderSubmissions();
          }
        );
      }
    );

    // --------------------------------------------------------
    // Повторная загрузка
    // --------------------------------------------------------

    if (elements.retryButton) {
      elements.retryButton.addEventListener(
        "click",
        loadSubmissions
      );
    }

    // --------------------------------------------------------
    // Закрытие основной модалки
    // --------------------------------------------------------

    if (elements.modalClose) {
      elements.modalClose.addEventListener(
        "click",
        closeSubmissionModal
      );
    }

    // --------------------------------------------------------
    // Одобрение
    // --------------------------------------------------------

    if (elements.modalApprove) {
      elements.modalApprove.addEventListener(
        "click",
        handleApprove
      );
    }

    // --------------------------------------------------------
    // Отклонение
    // --------------------------------------------------------

    if (elements.modalReject) {
      elements.modalReject.addEventListener(
        "click",
        openRejectModal
      );
    }

    // --------------------------------------------------------
    // Форма отклонения
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // ESC
    // --------------------------------------------------------

    document.addEventListener(
      "keydown",
      handleKeyboard
    );

    // --------------------------------------------------------
    // Клик по фону модалок
    // --------------------------------------------------------

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
    if (event.key !== "Escape") {
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
        await TO.getJson(
          "/api/admin/me"
        );

      if (
        response &&
        (
          response.authenticated === true ||
          response.ok === true
        )
      ) {
        state.authenticated = true;

        showDashboard();

        await loadSubmissions();

        return;
      }

      showLogin();
    } catch (error) {
      /*
       * Если сервер ответил 401,
       * пользователь просто ещё не вошёл.
       */

      showLogin();
    }
  }

  // ==========================================================
  // ВХОД
  // ==========================================================

  async function handleLogin(event) {
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

    TO.setButtonLoading(
      elements.loginButton,
      true,
      "Входим..."
    );

    clearLoginMessage();

    try {
      const response =
        await TO.postJson(
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

      state.authenticated = true;

      elements.passwordInput.value = "";

      showDashboard();

      await loadSubmissions();

      TO.showToast(
        "Вы успешно вошли в панель администратора.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка входа",
        error
      );

      showLoginMessage(
        TO.getErrorMessage(
          error,
          "Неверный пароль или ошибка сервера."
        ),
        "error"
      );
    } finally {
      TO.setButtonLoading(
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
      await TO.postJson(
        "/api/admin/logout",
        {}
      );
    } catch (error) {
      console.warn(
        "Tajik Opportunities: ошибка выхода",
        error
      );
    }

    state.authenticated = false;
    state.submissions = [];
    state.selectedSubmission = null;

    closeSubmissionModal();
    closeRejectModal();

    showLogin();

    TO.showToast(
      "Вы вышли из панели.",
      "success"
    );
  }

  // ==========================================================
  // ЗАГРУЗКА ЗАЯВОК
  // ==========================================================

  async function loadSubmissions() {
    if (!state.authenticated) {
      return;
    }

    if (state.loading) {
      return;
    }

    state.loading = true;

    showAdminLoading();
    hideAdminError();

    try {
      const response =
        await TO.getJson(
          "/api/admin/submissions"
        );

      const submissions =
        extractSubmissions(response);

      state.submissions =
        Array.isArray(submissions)
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

      /*
       * Если сессия закончилась,
       * возвращаем пользователя на вход.
       */

      if (
        error &&
        (
          error.status === 401 ||
          error.status === 403
        )
      ) {
        state.authenticated = false;
        showLogin();

        showLoginMessage(
          "Сессия закончилась. Войдите снова.",
          "error"
        );

        return;
      }

      showAdminError(
        TO.getErrorMessage(
          error,
          "Не удалось загрузить заявки."
        )
      );
    } finally {
      state.loading = false;
    }
  }

  function extractSubmissions(response) {
    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      Array.isArray(response.submissions)
    ) {
      return response.submissions;
    }

    if (
      response &&
      response.data &&
      Array.isArray(response.data.submissions)
    ) {
      return response.data.submissions;
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
          item.status === "pending"
      ).length;

    const approved =
      submissions.filter(
        (item) =>
          item.status === "approved"
      ).length;

    const rejected =
      submissions.filter(
        (item) =>
          item.status === "rejected"
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
          active ? "true" : "false"
        );
      }
    );
  }

  function getFilteredSubmissions() {
    if (state.filter === "all") {
      return [...state.submissions];
    }

    return state.submissions.filter(
      (submission) =>
        submission.status ===
        state.filter
    );
  }

  // ==========================================================
  // ОТРИСОВКА СПИСКА
  // ==========================================================

  function renderSubmissions() {
    if (!elements.submissionsList) {
      return;
    }

    const submissions =
      getFilteredSubmissions();

    if (!submissions.length) {
      elements.submissionsList.innerHTML = "";

      showAdminEmpty();

      return;
    }

    hideAdminEmpty();

    submissions.sort(
      (a, b) => {
        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateB - dateA;
      }
    );

    elements.submissionsList.innerHTML =
      submissions
        .map(renderSubmissionCard)
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
      TO.escapeHtml(
        submission.title ||
        "Без названия"
      );

    const category =
      submission.category ||
      "Другое";

    const categoryLabel =
      TO.escapeHtml(
        TO.getCategoryLabel(
          category
        )
      );

    const categoryIcon =
      TO.getCategoryIcon(
        category
      );

    const status =
      String(
        submission.status ||
        "pending"
      ).toLowerCase();

    const statusLabel =
      TO.escapeHtml(
        TO.getStatusLabel(
          status
        )
      );

    const statusIcon =
      TO.getStatusIcon(
        status
      );

    const date =
      submission.created_at
        ? TO.formatRelativeDate(
            submission.created_at
          )
        : "";

    const author =
      submission.author_name
        ? TO.escapeHtml(
            submission.author_name
          )
        : "Автор не указан";

    const trackingCode =
      submission.tracking_code
        ? TO.escapeHtml(
            submission.tracking_code
          )
        : "";

    const excerpt =
      TO.escapeHtml(
        TO.truncateText(
          submission.content ||
            "",
          220
        )
      );

    return `
      <article
        class="admin-submission-card"
        data-submission-id="${TO.escapeHtml(id)}"
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
            class="admin-submission-status status-${TO.escapeHtml(
              status
            )}"
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
            👤 ${author}
          </span>

          ${
            date
              ? `
                <span>
                  🕐 ${TO.escapeHtml(date)}
                </span>
              `
              : ""
          }

          ${
            trackingCode
              ? `
                <span>
                  🔑 ${trackingCode}
                </span>
              `
              : ""
          }

        </div>

        <div class="admin-submission-actions">

          <button
            type="button"
            class="btn btn-secondary admin-view-button"
            data-id="${TO.escapeHtml(id)}"
          >
            👁 Подробнее
          </button>

          ${
            status === "pending"
              ? `
                <button
                  type="button"
                  class="btn btn-primary admin-approve-button"
                  data-id="${TO.escapeHtml(id)}"
                >
                  ✓ Одобрить
                </button>

                <button
                  type="button"
                  class="btn btn-danger admin-reject-button"
                  data-id="${TO.escapeHtml(id)}"
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
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            openSubmissionModal(
              button.dataset.id
            );
          }
        );
      });

    document
      .querySelectorAll(
        ".admin-approve-button"
      )
      .forEach((button) => {
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
      });

    document
      .querySelectorAll(
        ".admin-reject-button"
      )
      .forEach((button) => {
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
      });
  }

  // ==========================================================
  // ПОИСК ЗАЯВКИ
  // ==========================================================

  function findSubmission(id) {
    return state.submissions.find(
      (submission) =>
        String(submission.id) ===
        String(id)
    );
  }

  // ==========================================================
  // ПРОСМОТР ЗАЯВКИ
  // ==========================================================

  function openSubmissionModal(id) {
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
      elements.modal.hidden = false;
      document.body.classList.add(
        "modal-open"
      );
    }
  }

  function closeSubmissionModal() {
    if (elements.modal) {
      elements.modal.hidden = true;
    }

    document.body.classList.remove(
      "modal-open"
    );

    state.selectedSubmission = null;
  }

  function renderSubmissionModal(
    submission
  ) {
    if (!elements.modalBody) {
      return;
    }

    const title =
      TO.escapeHtml(
        submission.title ||
        "Без названия"
      );

    const content =
      TO.escapeHtml(
        submission.content ||
        ""
      );

    const category =
      submission.category ||
      "Другое";

    const categoryLabel =
      TO.escapeHtml(
        TO.getCategoryLabel(
          category
        )
      );

    const categoryIcon =
      TO.getCategoryIcon(
        category
      );

    const author =
      submission.author_name
        ? TO.escapeHtml(
            submission.author_name
          )
        : "Не указан";

    const contact =
      submission.contact
        ? TO.escapeHtml(
            submission.contact
          )
        : "Не указан";

    const trackingCode =
      submission.tracking_code
        ? TO.escapeHtml(
            submission.tracking_code
          )
        : "Не указан";

    const createdAt =
      submission.created_at
        ? TO.escapeHtml(
            TO.formatDateTime(
              submission.created_at
            )
          )
        : "Не указано";

    const linkUrl =
      TO.safeExternalUrl(
        submission.link_url ||
          ""
      );

    const imageUrl =
      TO.safeExternalUrl(
        submission.image_url ||
          ""
      );

    const status =
      String(
        submission.status ||
        "pending"
      ).toLowerCase();

    const rejectionReason =
      submission.rejection_reason
        ? TO.escapeHtml(
            submission.rejection_reason
          )
        : "";

    elements.modalBody.innerHTML = `
      <div class="admin-detail">

        <div class="admin-detail-top">

          <span class="admin-detail-category">
            ${categoryIcon}
            ${categoryLabel}
          </span>

          <span
            class="admin-detail-status status-${TO.escapeHtml(
              status
            )}"
          >
            ${TO.getStatusIcon(status)}
            ${TO.escapeHtml(
              TO.getStatusLabel(status)
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
                  src="${TO.escapeHtml(imageUrl)}"
                  alt="${title}"
                  loading="lazy"
                >
              </div>
            `
            : ""
        }

        <div class="admin-detail-content">
          ${formatAdminContent(content)}
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
            <span>${createdAt}</span>
          </div>

          ${
            linkUrl
              ? `
                <div class="admin-detail-row">
                  <strong>Ссылка:</strong>
                  <a
                    href="${TO.escapeHtml(
                      linkUrl
                    )}"
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
                    ${rejectionReason}
                  </span>
                </div>
              `
              : ""
          }

        </div>

      </div>
    `;

    updateModalActions(status);
  }

  function formatAdminContent(content) {
    return String(content)
      .split(/\n{2,}/)
      .map(
        (paragraph) =>
          paragraph.trim()
            ? `<p>${paragraph.trim()}</p>`
            : ""
      )
      .join("");
  }

  function updateModalActions(status) {
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
      submission.status !==
      "pending"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Одобрить публикацию «${submission.title}»?\n\nПосле одобрения она появится на сайте.`
      );

    if (!confirmed) {
      return;
    }

    if (elements.modalApprove) {
      TO.setButtonLoading(
        elements.modalApprove,
        true,
        "Одобряем..."
      );
    }

    try {
      const response =
        await TO.postJson(
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
            status: "approved",
          }
        );
      }

      closeSubmissionModal();

      updateCounters();
      renderSubmissions();

      TO.showToast(
        "Публикация одобрена и опубликована.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка одобрения",
        error
      );

      TO.showToast(
        TO.getErrorMessage(
          error,
          "Не удалось одобрить публикацию."
        ),
        "error"
      );
    } finally {
      if (elements.modalApprove) {
        TO.setButtonLoading(
          elements.modalApprove,
          false
        );
      }
    }
  }

  // ==========================================================
  // ОТКЛОНЕНИЕ
  // ==========================================================

  function openRejectModal() {
    if (!state.selectedSubmission) {
      return;
    }

    if (elements.rejectReason) {
      elements.rejectReason.value = "";
    }

    if (elements.rejectModal) {
      elements.rejectModal.hidden =
        false;

      document.body.classList.add(
        "modal-open"
      );
    }

    setTimeout(() => {
      if (elements.rejectReason) {
        elements.rejectReason.focus();
      }
    }, 50);
  }

  function closeRejectModal() {
    if (elements.rejectModal) {
      elements.rejectModal.hidden =
        true;
    }

    document.body.classList.remove(
      "modal-open"
    );
  }

  async function handleReject(event) {
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
      TO.showToast(
        "Укажите причину отклонения.",
        "error"
      );

      return;
    }

    if (reason.length < 5) {
      TO.showToast(
        "Причина должна содержать минимум 5 символов.",
        "error"
      );

      return;
    }

    if (reason.length > 2000) {
      TO.showToast(
        "Причина слишком длинная.",
        "error"
      );

      return;
    }

    TO.setButtonLoading(
      elements.rejectSubmit,
      true,
      "Отклоняем..."
    );

    try {
      const response =
        await TO.postJson(
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
            status: "rejected",
            rejection_reason:
              reason,
          }
        );
      }

      closeRejectModal();
      closeSubmissionModal();

      updateCounters();
      renderSubmissions();

      TO.showToast(
        "Публикация отклонена.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка отклонения",
        error
      );

      TO.showToast(
        TO.getErrorMessage(
          error,
          "Не удалось отклонить публикацию."
        ),
        "error"
      );
    } finally {
      TO.setButtonLoading(
        elements.rejectSubmit,
        false
      );
    }
  }

  // ==========================================================
  // ОБНОВЛЕНИЕ ЛОКАЛЬНЫХ ДАННЫХ
  // ==========================================================

  function replaceSubmission(
    updated
  ) {
    if (!updated || !updated.id) {
      return;
    }

    const index =
      state.submissions.findIndex(
        (submission) =>
          String(submission.id) ===
          String(updated.id)
      );

    if (index === -1) {
      state.submissions.push(
        updated
      );

      return;
    }

    state.submissions[index] =
      {
        ...state.submissions[index],
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
  // UI: LOGIN
  // ==========================================================

  function showLogin() {
    if (elements.loginSection) {
      elements.loginSection.hidden =
        false;
    }

    if (elements.dashboardSection) {
      elements.dashboardSection.hidden =
        true;
    }
  }

  function showDashboard() {
    if (elements.loginSection) {
      elements.loginSection.hidden =
        true;
    }

    if (elements.dashboardSection) {
      elements.dashboardSection.hidden =
        false;
    }

    updateFilterButtons();
  }

  function showLoginMessage(
    message,
    type
  ) {
    if (!elements.loginMessage) {
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
      type || "error"
    );
  }

  function clearLoginMessage() {
    if (!elements.loginMessage) {
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
  // UI: ADMIN
  // ==========================================================

  function showAdminLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden =
        false;
    }

    if (elements.submissionsList) {
      elements.submissionsList.hidden =
        true;
    }

    if (elements.emptyState) {
      elements.emptyState.hidden =
        true;
    }
  }

  function hideAdminLoading() {
    if (elements.loadingState) {
      elements.loadingState.hidden =
        true;
    }

    if (elements.submissionsList) {
      elements.submissionsList.hidden =
        false;
    }
  }

  function showAdminEmpty() {
    if (elements.emptyState) {
      elements.emptyState.hidden =
        false;
    }
  }

  function hideAdminEmpty() {
    if (elements.emptyState) {
      elements.emptyState.hidden =
        true;
    }
  }

  function showAdminError(message) {
    if (elements.errorState) {
      elements.errorState.hidden =
        false;
    }

    if (elements.errorMessage) {
      elements.errorMessage.textContent =
        message;
    }

    if (elements.submissionsList) {
      elements.submissionsList.hidden =
        true;
    }
  }

  function hideAdminError() {
    if (elements.errorState) {
      elements.errorState.hidden =
        true;
    }
  }
})();
