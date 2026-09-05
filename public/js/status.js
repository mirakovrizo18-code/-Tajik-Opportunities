/* ============================================================
   TAJIK OPPORTUNITIES
   Проверка статуса отправленной публикации
   ============================================================ */

(() => {
  "use strict";

  const TO = window.TO;

  if (!TO) {
    console.error("Tajik Opportunities: utils.js не загружен.");
    return;
  }

  const state = {
    loading: false,
  };

  // ==========================================================
  // DOM
  // ==========================================================

  const form = document.getElementById("statusForm");
  const codeInput = document.getElementById("trackingCodeInput");
  const submitButton = form
    ? form.querySelector('button[type="submit"]')
    : null;

  const loadingState =
    document.getElementById("statusLoading");

  const resultState =
    document.getElementById("statusResult");

  const emptyState =
    document.getElementById("statusEmpty");

  const errorState =
    document.getElementById("statusError");

  const errorMessage =
    document.getElementById("statusErrorMessage");

  const retryButton =
    document.getElementById("statusRetry");

  const resultTitle =
    document.getElementById("statusTitle");

  const resultCategory =
    document.getElementById("statusCategory");

  const resultStatus =
    document.getElementById("statusValue");

  const resultStatusIcon =
    document.getElementById("statusIcon");

  const resultDate =
    document.getElementById("statusDate");

  const resultReason =
    document.getElementById("statusReason");

  const resultReasonBlock =
    document.getElementById("statusReasonBlock");

  const resultPostLink =
    document.getElementById("statusPostLink");

  // ==========================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================================================

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindEvents();

    const code =
      TO.getQueryParam("code");

    if (code && codeInput) {
      codeInput.value = code.trim();

      checkStatus(code.trim());
    }
  }

  // ==========================================================
  // СОБЫТИЯ
  // ==========================================================

  function bindEvents() {
    if (form) {
      form.addEventListener(
        "submit",
        handleSubmit
      );
    }

    if (codeInput) {
      codeInput.addEventListener(
        "input",
        normalizeInput
      );

      codeInput.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.preventDefault();

            if (form) {
              form.requestSubmit();
            }
          }
        }
      );
    }

    if (retryButton) {
      retryButton.addEventListener(
        "click",
        () => {
          const code =
            codeInput
              ? codeInput.value.trim()
              : "";

          if (code) {
            checkStatus(code);
          }
        }
      );
    }
  }

  // ==========================================================
  // НОРМАЛИЗАЦИЯ КОДА
  // ==========================================================

  function normalizeInput() {
    if (!codeInput) {
      return;
    }

    codeInput.value =
      codeInput.value
        .replace(/\s+/g, "")
        .slice(0, 100);
  }

  // ==========================================================
  // ОТПРАВКА
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.loading) {
      return;
    }

    normalizeInput();

    const code =
      codeInput
        ? codeInput.value.trim()
        : "";

    if (!code) {
      showError(
        "Введите код отслеживания."
      );

      return;
    }

    if (code.length < 6) {
      showError(
        "Код отслеживания слишком короткий."
      );

      return;
    }

    await checkStatus(code);
  }

  // ==========================================================
  // ПРОВЕРКА СТАТУСА
  // ==========================================================

  async function checkStatus(code) {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    TO.setButtonLoading(
      submitButton,
      true,
      "Проверяем..."
    );

    try {
      const response =
        await TO.getJson(
          `/api/submissions/status?code=${encodeURIComponent(
            code
          )}`
        );

      const submission =
        extractSubmission(response);

      if (!submission) {
        throw new Error(
          "Публикация с таким кодом не найдена."
        );
      }

      renderStatus(submission);

      updateUrl(code);

      hideLoading();
      hideError();
      showResult();

      TO.showToast(
        "Статус успешно получен.",
        "success"
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка проверки статуса",
        error
      );

      hideLoading();

      showError(
        TO.getErrorMessage(
          error,
          "Не удалось проверить статус."
        )
      );
    } finally {
      state.loading = false;

      TO.setButtonLoading(
        submitButton,
        false
      );
    }
  }

  // ==========================================================
  // ПОЛУЧЕНИЕ ДАННЫХ
  // ==========================================================

  function extractSubmission(response) {
    if (!response) {
      return null;
    }

    if (
      response.id ||
      response.title ||
      response.status
    ) {
      return response;
    }

    if (response.submission) {
      return response.submission;
    }

    if (
      response.data &&
      response.data.submission
    ) {
      return response.data.submission;
    }

    if (
      response.data &&
      response.data.status
    ) {
      return response.data;
    }

    return null;
  }

  // ==========================================================
  // ОТРИСОВКА
  // ==========================================================

  function renderStatus(submission) {
    const title =
      submission.title ||
      "Без названия";

    const category =
      submission.category ||
      "Другое";

    const status =
      String(
        submission.status || "pending"
      ).toLowerCase();

    // --------------------------------------------------------
    // Заголовок
    // --------------------------------------------------------

    if (resultTitle) {
      resultTitle.textContent =
        title;
    }

    // --------------------------------------------------------
    // Категория
    // --------------------------------------------------------

    if (resultCategory) {
      const icon =
        TO.getCategoryIcon(category);

      const label =
        TO.getCategoryLabel(category);

      resultCategory.textContent =
        `${icon} ${label}`;
    }

    // --------------------------------------------------------
    // Статус
    // --------------------------------------------------------

    const statusLabel =
      TO.getStatusLabel(status);

    const statusIcon =
      TO.getStatusIcon(status);

    if (resultStatus) {
      resultStatus.textContent =
        statusLabel;

      resultStatus.className =
        `status-value status-${status}`;
    }

    if (resultStatusIcon) {
      resultStatusIcon.textContent =
        statusIcon;
    }

    // --------------------------------------------------------
    // Дата
    // --------------------------------------------------------

    const date =
      submission.created_at ||
      submission.published_at ||
      "";

    if (resultDate) {
      if (date) {
        resultDate.textContent =
          TO.formatDateTime(date);

        resultDate.hidden = false;
      } else {
        resultDate.hidden = true;
      }
    }

    // --------------------------------------------------------
    // Причина отклонения
    // --------------------------------------------------------

    const rejectionReason =
      submission.rejection_reason ||
      "";

    if (
      resultReasonBlock &&
      resultReason
    ) {
      if (
        status === "rejected" &&
        rejectionReason
      ) {
        resultReason.textContent =
          rejectionReason;

        resultReasonBlock.hidden =
          false;
      } else {
        resultReason.textContent = "";

        resultReasonBlock.hidden =
          true;
      }
    }

    // --------------------------------------------------------
    // Ссылка на опубликованную запись
    // --------------------------------------------------------

    if (resultPostLink) {
      const postId =
        submission.post_id ||
        submission.published_post_id ||
        "";

      if (
        status === "approved" &&
        postId
      ) {
        resultPostLink.href =
          `/post.html?id=${encodeURIComponent(
            postId
          )}`;

        resultPostLink.hidden =
          false;
      } else {
        resultPostLink.hidden =
          true;
        resultPostLink.removeAttribute(
          "href"
        );
      }
    }
  }

  // ==========================================================
  // URL
  // ==========================================================

  function updateUrl(code) {
    if (!code) {
      return;
    }

    TO.setQueryParams(
      {
        code,
      },
      true
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  function showLoading() {
    if (loadingState) {
      loadingState.hidden = false;
    }

    if (resultState) {
      resultState.hidden = true;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    if (errorState) {
      errorState.hidden = true;
    }
  }

  function hideLoading() {
    if (loadingState) {
      loadingState.hidden = true;
    }
  }

  function showResult() {
    if (resultState) {
      resultState.hidden = false;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }
  }

  function showError(message) {
    if (loadingState) {
      loadingState.hidden = true;
    }

    if (resultState) {
      resultState.hidden = true;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    if (errorState) {
      errorState.hidden = false;
    }

    if (errorMessage) {
      errorMessage.textContent =
        message;
    }
  }

  function hideError() {
    if (errorState) {
      errorState.hidden = true;
    }
  }
})();
