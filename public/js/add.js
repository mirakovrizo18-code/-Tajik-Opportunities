/* ============================================================
   TAJIK OPPORTUNITIES
   Форма отправки публикации на модерацию
   ============================================================ */

(() => {
  "use strict";

  const state = {
    submitting: false,
    submitted: false
  };

  // ==========================================================
  // DOM
  // ==========================================================

  const form = document.getElementById("submissionForm");

  if (!form) {
    return;
  }

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const categoryInput = document.getElementById("category");
  const imageInput = document.getElementById("image_url");
  const linkInput = document.getElementById("link_url");
  const contactInput = document.getElementById("contact");
  const authorInput = document.getElementById("author_name");
  const websiteInput = document.getElementById("website");

  const submitButton =
    form.querySelector('button[type="submit"]');

  const formMessage =
    document.getElementById("formMessage");

  const successState =
    document.getElementById("submissionSuccess");

  const trackingCodeElement =
    document.getElementById("trackingCode");

  const trackingStatusLink =
    document.getElementById("trackingStatusLink");

  const copyTrackingButton =
    document.getElementById("copyTrackingButton");

  // ==========================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ==========================================================

  function getInputValue(input) {
    if (!input) {
      return "";
    }

    return input.value.trim();
  }

  function isSafeUrl(value) {
    if (!value) {
      return false;
    }

    try {
      const url = new URL(value);

      return (
        url.protocol === "https:" ||
        url.protocol === "http:"
      );
    } catch {
      return false;
    }
  }

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
      return;
    }

    toast.textContent = message;

    toast.classList.remove(
      "success",
      "error",
      "warning",
      "show"
    );

    toast.classList.add(
      type,
      "show"
    );

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  function setButtonLoading(loading) {
    if (!submitButton) {
      return;
    }

    if (loading) {
      if (!submitButton.dataset.originalText) {
        submitButton.dataset.originalText =
          submitButton.textContent;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Отправляем...";
    } else {
      submitButton.disabled = false;

      if (submitButton.dataset.originalText) {
        submitButton.textContent =
          submitButton.dataset.originalText;
      }
    }
  }

  // ==========================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================================================

  function init() {
    bindEvents();
    setupCounters();
    setupUrlPreview();
  }

  // ==========================================================
  // СОБЫТИЯ
  // ==========================================================

  function bindEvents() {
    form.addEventListener(
      "submit",
      handleSubmit
    );

    if (titleInput) {
      titleInput.addEventListener(
        "input",
        updateTitleCounter
      );
    }

    if (contentInput) {
      contentInput.addEventListener(
        "input",
        updateContentCounter
      );
    }

    if (imageInput) {
      imageInput.addEventListener(
        "input",
        updateUrlPreview
      );
    }

    if (linkInput) {
      linkInput.addEventListener(
        "input",
        updateUrlPreview
      );
    }

    if (copyTrackingButton) {
      copyTrackingButton.addEventListener(
        "click",
        copyTrackingCode
      );
    }
  }

  // ==========================================================
  // СЧЁТЧИК ЗАГОЛОВКА
  // ==========================================================

  function setupCounters() {
    updateTitleCounter();
    updateContentCounter();
  }

  function updateTitleCounter() {
    if (!titleInput) {
      return;
    }

    const counter =
      document.getElementById("titleCounter");

    if (!counter) {
      return;
    }

    counter.textContent =
      `${titleInput.value.length}/180`;
  }

  // ==========================================================
  // СЧЁТЧИК ТЕКСТА
  // ==========================================================

  function updateContentCounter() {
    if (!contentInput) {
      return;
    }

    const counter =
      document.getElementById("contentCounter");

    if (!counter) {
      return;
    }

    counter.textContent =
      `${contentInput.value.length}/10000`;
  }

  // ==========================================================
  // ПРОВЕРКА URL
  // ==========================================================

  function setupUrlPreview() {
    updateUrlPreview();
  }

  function updateUrlPreview() {
    updateSingleUrlPreview(
      imageInput,
      "imageUrlPreview"
    );

    updateSingleUrlPreview(
      linkInput,
      "linkUrlPreview"
    );
  }

  function updateSingleUrlPreview(
    input,
    previewId
  ) {
    const preview =
      document.getElementById(previewId);

    if (!input || !preview) {
      return;
    }

    const value =
      input.value.trim();

    if (!value) {
      preview.textContent = "";
      preview.hidden = true;
      return;
    }

    if (!isSafeUrl(value)) {
      preview.textContent =
        "⚠️ Укажите корректную ссылку.";

      preview.hidden = false;
      return;
    }

    preview.textContent =
      "✓ Ссылка выглядит корректно.";

    preview.hidden = false;
  }

  // ==========================================================
  // СБОР ДАННЫХ
  // ==========================================================

  function collectFormData() {
    return {
      title: getInputValue(titleInput),
      content: getInputValue(contentInput),
      category: getInputValue(categoryInput),
      image_url: getInputValue(imageInput),
      link_url: getInputValue(linkInput),
      contact: getInputValue(contactInput),
      author_name: getInputValue(authorInput),

      // Honeypot для защиты от ботов.
      website: getInputValue(websiteInput)
    };
  }

  // ==========================================================
  // ВАЛИДАЦИЯ
  // ==========================================================

  function validateFormData(data) {
    if (!data.title) {
      return "Введите заголовок публикации.";
    }

    if (data.title.length < 5) {
      return "Заголовок должен содержать минимум 5 символов.";
    }

    if (data.title.length > 180) {
      return "Заголовок слишком длинный. Максимум — 180 символов.";
    }

    if (!data.content) {
      return "Введите текст публикации.";
    }

    if (data.content.length < 20) {
      return "Текст публикации должен содержать минимум 20 символов.";
    }

    if (data.content.length > 10000) {
      return "Текст публикации слишком длинный. Максимум — 10 000 символов.";
    }

    if (!data.category) {
      return "Выберите категорию.";
    }

    const allowedCategories = [
      "Новости",
      "Вакансии",
      "Образование",
      "Гранты",
      "Конкурсы",
      "Стажировки",
      "Мероприятия",
      "Волонтёрство",
      "Другое"
    ];

    if (
      !allowedCategories.includes(
        data.category
      )
    ) {
      return "Выберите корректную категорию.";
    }

    if (data.image_url) {
      if (!isSafeUrl(data.image_url)) {
        return "Укажите корректную ссылку на изображение.";
      }
    }

    if (data.link_url) {
      if (!isSafeUrl(data.link_url)) {
        return "Укажите корректную ссылку на источник или дополнительную информацию.";
      }
    }

    if (data.contact.length > 500) {
      return "Контактная информация слишком длинная.";
    }

    if (data.author_name.length > 120) {
      return "Имя автора слишком длинное.";
    }

    return null;
  }

  // ==========================================================
  // ОТПРАВКА
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.submitting) {
      return;
    }

    clearMessage();

    const data =
      collectFormData();

    const validationError =
      validateFormData(data);

    if (validationError) {
      showMessage(
        validationError,
        "error"
      );

      return;
    }

    state.submitting = true;

    setButtonLoading(true);

    try {
      const response =
        await fetch(
          "/api/submissions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            body: JSON.stringify(data)
          }
        );

      let result = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        const message =
          result?.error ||
          result?.message ||
          "Не удалось отправить публикацию. Попробуйте ещё раз.";

        throw new Error(message);
      }

      handleSuccessfulSubmission(
        result
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка отправки",
        error
      );

      showMessage(
        error?.message ||
          "Не удалось отправить публикацию. Попробуйте ещё раз.",
        "error"
      );
    } finally {
      state.submitting = false;

      setButtonLoading(false);
    }
  }

  // ==========================================================
  // УСПЕШНАЯ ОТПРАВКА
  // ==========================================================

  function handleSuccessfulSubmission(
    response
  ) {
    state.submitted = true;

    const trackingCode =
      response?.tracking_code ||
      response?.trackingCode ||
      response?.data?.tracking_code ||
      "";

    showSuccessState(
      trackingCode
    );

    showToast(
      "Публикация отправлена на модерацию.",
      "success"
    );
  }

  function showSuccessState(
    trackingCode
  ) {
    form.hidden = true;

    if (formMessage) {
      formMessage.hidden = true;
    }

    if (!successState) {
      return;
    }

    successState.hidden = false;

    if (trackingCodeElement) {
      trackingCodeElement.textContent =
        trackingCode || "—";
    }

    if (trackingStatusLink) {
      if (trackingCode) {
        trackingStatusLink.href =
          `/status.html?code=${encodeURIComponent(
            trackingCode
          )}`;
      } else {
        trackingStatusLink.href =
          "/status.html";
      }
    }
  }

  // ==========================================================
  // КОПИРОВАНИЕ КОДА
  // ==========================================================

  async function copyTrackingCode() {
    if (!trackingCodeElement) {
      return;
    }

    const code =
      trackingCodeElement.textContent.trim();

    if (!code || code === "—") {
      return;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          code
        );

        showToast(
          "Код отслеживания скопирован.",
          "success"
        );

        return;
      }

      fallbackCopy(code);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );

      fallbackCopy(code);
    }
  }

  function fallbackCopy(value) {
    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value = value;

    textarea.style.position =
      "fixed";

    textarea.style.left = "-9999px";

    document.body.appendChild(
      textarea
    );

    textarea.focus();
    textarea.select();

    try {
      const copied =
        document.execCommand(
          "copy"
        );

      if (copied) {
        showToast(
          "Код отслеживания скопирован.",
          "success"
        );
      } else {
        showToast(
          "Не удалось скопировать код.",
          "error"
        );
      }
    } catch {
      showToast(
        "Не удалось скопировать код.",
        "error"
      );
    }

    textarea.remove();
  }

  // ==========================================================
  // СООБЩЕНИЯ
  // ==========================================================

  function showMessage(
    message,
    type = "error"
  ) {
    if (!formMessage) {
      return;
    }

    formMessage.hidden = false;

    formMessage.textContent =
      message;

    formMessage.classList.remove(
      "success",
      "error",
      "warning"
    );

    formMessage.classList.add(
      type
    );

    formMessage.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  function clearMessage() {
    if (!formMessage) {
      return;
    }

    formMessage.hidden = true;

    formMessage.textContent = "";

    formMessage.classList.remove(
      "success",
      "error",
      "warning"
    );
  }

  // ==========================================================
  // ЗАПУСК
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
