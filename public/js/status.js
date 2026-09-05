/* ============================================================
   TAJIK OPPORTUNITIES
   Проверка статуса отправленной публикации
   ============================================================ */

(() => {
  "use strict";

  const API_URL = "/api/submissions/status";

  const state = {
    loading: false
  };

  // ==========================================================
  // DOM
  // ==========================================================

  const form =
    document.getElementById("statusForm");

  const codeInput =
    document.getElementById("trackingCodeInput");

  const submitButton =
    form
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

  const checkAgainButton =
    document.getElementById("statusCheckAgain");

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

  const resultPostUrl =
    document.getElementById("statusPostUrl");

  // ==========================================================
  // HELPERS
  // ==========================================================

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

  function setText(element, value) {
    if (element) {
      element.textContent = String(value ?? "");
    }
  }

  function getQueryCode() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("code") || ""
    ).trim();
  }

  function updateUrl(code) {
    if (!code) {
      return;
    }

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "code",
      code
    );

    window.history.replaceState(
      {},
      "",
      url.toString()
    );
  }

  function normalizeCode() {
    if (!codeInput) {
      return "";
    }

    const normalized =
      codeInput.value
        .replace(/\s+/g, "")
        .trim()
        .slice(0, 100);

    codeInput.value =
      normalized;

    return normalized;
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const parsed =
      new Date(value);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "ru-RU",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(parsed);
  }

  function getStatusInfo(status) {
    const normalized =
      String(
        status || "pending"
      ).toLowerCase();

    const statuses = {
      pending: {
        label: "На модерации",
        icon: "⏳"
      },

      approved: {
        label: "Одобрено",
        icon: "✅"
      },

      rejected: {
        label: "Отклонено",
        icon: "❌"
      }
    };

    return (
      statuses[normalized] ||
      statuses.pending
    );
  }

  function getCategoryIcon(category) {
    const icons = {
      "Новости": "📰",
      "Вакансии": "💼",
      "Образование": "🎓",
      "Гранты": "💰",
      "Конкурсы": "🏆",
      "Стажировки": "🧑‍💻",
      "Мероприятия": "📅",
      "Волонтёрство": "🤝",
      "Другое": "✨"
    };

    return (
      icons[category] ||
      "✨"
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

  // ==========================================================
  // INITIALIZATION
  // ==========================================================

  function init() {
    bindEvents();

    const code =
      getQueryCode();

    if (
      code &&
      codeInput
    ) {
      codeInput.value =
        code;

      checkStatus(code);
    } else {
      showEmpty();
    }
  }

  // ==========================================================
  // EVENTS
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
          if (
            event.key === "Enter"
          ) {
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
            normalizeCode();

          if (code) {
            checkStatus(code);
          }
        }
      );
    }

    if (checkAgainButton) {
      checkAgainButton.addEventListener(
        "click",
        resetStatus
      );
    }
  }

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
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (state.loading) {
      return;
    }

    const code =
      normalizeCode();

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
  // API
  // ==========================================================

  async function checkStatus(
    code
  ) {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();
    setButtonLoading(
      submitButton,
      true
    );

    try {
      const url =
        `${API_URL}?code=${encodeURIComponent(
          code
        )}`;

      const response =
        await fetch(
          url,
          {
            method: "GET",

            headers: {
              "Accept":
                "application/json"
            },

            cache: "no-store"
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          "Не удалось проверить статус заявки."
        );
      }

      const submission =
        extractSubmission(data);

      if (!submission) {
        throw new Error(
          "Заявка с таким кодом не найдена."
        );
      }

      renderStatus(
        submission
      );

      updateUrl(code);

      hideLoading();
      hideError();
      showResult();

      showToast(
        "Статус успешно получен."
      );

    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка проверки статуса",
        error
      );

      hideLoading();

      showError(
        getErrorMessage(
          error,
          "Не удалось проверить статус заявки. Попробуйте ещё раз."
        )
      );

    } finally {
      state.loading = false;

      setButtonLoading(
        submitButton,
        false
      );
    }
  }

  // ==========================================================
  // EXTRACT SUBMISSION
  // ==========================================================

  function extractSubmission(
    response
  ) {
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

    if (
      response.submission
    ) {
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
      (
        response.data.id ||
        response.data.title ||
        response.data.status
      )
    ) {
      return response.data;
    }

    return null;
  }

  // ==========================================================
  // RENDER STATUS
  // ==========================================================

  function renderStatus(
    submission
  ) {
    const title =
      submission.title ||
      "Без названия";

    const category =
      submission.category ||
      "Другое";

    const status =
      String(
        submission.status ||
        "pending"
      ).toLowerCase();

    const statusInfo =
      getStatusInfo(
        status
      );

    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    setText(
      resultTitle,
      title
    );

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    setText(
      resultCategory,
      `${getCategoryIcon(
        category
      )} ${category}`
    );

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    setText(
      resultStatus,
      statusInfo.label
    );

    if (resultStatus) {
      resultStatus.className =
        `status-value status-${status}`;
    }

    setText(
      resultStatusIcon,
      statusInfo.icon
    );

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    const date =
      submission.created_at ||
      submission.submitted_at ||
      submission.published_at ||
      "";

    if (resultDate) {
      if (date) {
        resultDate.textContent =
          formatDate(date);

        resultDate.hidden =
          false;
      } else {
        resultDate.textContent =
          "—";

        resultDate.hidden =
          false;
      }
    }

    // --------------------------------------------------------
    // REJECTION REASON
    // --------------------------------------------------------

    const rejectionReason =
      submission.rejection_reason ||
      submission.reason ||
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
        resultReason.textContent =
          "";

        resultReasonBlock.hidden =
          true;
      }
    }

    // --------------------------------------------------------
    // APPROVED POST
    // --------------------------------------------------------

    const postId =
      submission.post_id ||
      submission.published_post_id ||
      "";

    if (
      resultPostLink &&
      resultPostUrl
    ) {
      if (
        status === "approved" &&
        postId
      ) {
        const postUrl =
          `/post.html?id=${encodeURIComponent(
            postId
          )}`;

        resultPostUrl.href =
          postUrl;

        resultPostLink.hidden =
          false;
      } else {
        resultPostLink.hidden =
          true;

        resultPostUrl.removeAttribute(
          "href"
        );
      }
    }
  }

  // ==========================================================
  // UI STATES
  // ==========================================================

  function showLoading() {
    show(
      loadingState
    );

    hide(
      resultState
    );

    hide(
      emptyState
    );

    hide(
      errorState
    );
  }

  function hideLoading() {
    hide(
      loadingState
    );
  }

  function showResult() {
    hide(
      loadingState
    );

    hide(
      emptyState
    );

    hide(
      errorState
    );

    show(
      resultState
    );
  }

  function showEmpty() {
    hide(
      loadingState
    );

    hide(
      resultState
    );

    hide(
      errorState
    );

    show(
      emptyState
    );
  }

  function showError(
    message
  ) {
    hide(
      loadingState
    );

    hide(
      resultState
    );

    hide(
      emptyState
    );

    show(
      errorState
    );

    setText(
      errorMessage,
      message
    );
  }

  function hideError() {
    hide(
      errorState
    );
  }

  function resetStatus() {
    if (state.loading) {
      return;
    }

    if (codeInput) {
      codeInput.value =
        "";
      codeInput.focus();
    }

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.delete(
      "code"
    );

    window.history.replaceState(
      {},
      "",
      url.pathname +
      url.search +
      url.hash
    );

    showEmpty();
  }

  // ==========================================================
  // BUTTON
  // ==========================================================

  function setButtonLoading(
    button,
    loading
  ) {
    if (!button) {
      return;
    }

    if (loading) {
      if (
        !button.dataset.originalText
      ) {
        button.dataset.originalText =
          button.textContent.trim();
      }

      button.disabled =
        true;

      button.textContent =
        "⏳ Проверяем...";
    } else {
      button.disabled =
        false;

      if (
        button.dataset.originalText
      ) {
        button.textContent =
          button.dataset.originalText;
      }
    }
  }

  // ==========================================================
  // TOAST
  // ==========================================================

  function showToast(
    message
  ) {
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
      setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        3000
      );
  }

  // ==========================================================
  // START
  // ==========================================================

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
