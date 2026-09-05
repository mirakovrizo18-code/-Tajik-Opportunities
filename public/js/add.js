/* ============================================================
   TAJIK OPPORTUNITIES
   Форма отправки публикации на модерацию
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
    submitting: false,
    submitted: false,
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
  // ИНИЦИАЛИЗАЦИЯ
  // ==========================================================

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindEvents();
    setupCounters();
    setupUrlPreview();
  }

  // ==========================================================
  // СОБЫТИЯ
  // ==========================================================

  function bindEvents() {
    form.addEventListener("submit", handleSubmit);

    if (contentInput) {
      contentInput.addEventListener(
        "input",
        updateContentCounter
      );
    }

    if (titleInput) {
      titleInput.addEventListener(
        "input",
        updateTitleCounter
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
  // СЧЁТЧИКИ СИМВОЛОВ
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

    const length = titleInput.value.length;

    counter.textContent = `${length}/180`;
  }

  function updateContentCounter() {
    if (!contentInput) {
      return;
    }

    const counter =
      document.getElementById("contentCounter");

    if (!counter) {
      return;
    }

    const length = contentInput.value.length;

    counter.textContent = `${length}/10000`;
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

  function updateSingleUrlPreview(input, previewId) {
    const preview =
      document.getElementById(previewId);

    if (!input || !preview) {
      return;
    }

    const value = input.value.trim();

    if (!value) {
      preview.textContent = "";
      preview.hidden = true;
      return;
    }

    const safeUrl = TO.safeExternalUrl(value);

    if (!safeUrl) {
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
  // ОТПРАВКА ФОРМЫ
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (state.submitting) {
      return;
    }

    clearMessage();

    const data = collectFormData();

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

    TO.setButtonLoading(
      submitButton,
      true,
      "Отправляем..."
    );

    try {
      const response =
        await TO.postJson(
          "/api/submissions",
          data
        );

      handleSuccessfulSubmission(
        response
      );
    } catch (error) {
      console.error(
        "Tajik Opportunities: ошибка отправки",
        error
      );

      showMessage(
        TO.getErrorMessage(
          error,
          "Не удалось отправить публикацию. Попробуйте ещё раз."
        ),
        "error"
      );
    } finally {
      state.submitting = false;

      TO.setButtonLoading(
        submitButton,
        false
      );
    }
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

      // Honeypot.
      // Обычный пользователь оставляет это поле пустым.
      website: getInputValue(websiteInput),
    };
  }

  function getInputValue(input) {
    if (!input) {
      return "";
    }

    return input.value.trim();
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
      "Другое",
    ];

    if (!allowedCategories.includes(data.category)) {
      return "Выберите корректную категорию.";
    }

    if (data.image_url) {
      if (!TO.isSafeUrl(data.image_url)) {
        return "Укажите корректную ссылку на изображение.";
      }
    }

    if (data.link_url) {
      if (!TO.isSafeUrl(data.link_url)) {
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
  // УСПЕШНАЯ ОТПРАВКА
  // ==========================================================

  function handleSuccessfulSubmission(response) {
    state.submitted = true;

    const trackingCode =
      response?.tracking_code ||
      response?.trackingCode ||
      response?.data?.tracking_code ||
      "";

    showSuccessState(trackingCode);

    TO.showToast(
      "Публикация отправлена на модерацию.",
      "success"
    );
  }

  function showSuccessState(trackingCode) {
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

    if (trackingStatusLink && trackingCode) {
      trackingStatusLink.href =
        `/status.html?code=${encodeURIComponent(
          trackingCode
        )}`;
    }

    if (trackingStatusLink && !trackingCode) {
      trackingStatusLink.href =
        "/status.html";
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

    const copied =
      await TO.copyText(code);

    if (copied) {
      TO.showToast(
        "Код отслеживания скопирован.",
        "success"
      );

      return;
    }

    TO.showToast(
      "Не удалось скопировать код.",
      "error"
    );
  }

  // ==========================================================
  // СООБЩЕНИЯ
  // ==========================================================

  function showMessage(message, type) {
    if (!formMessage) {
      return;
    }

    formMessage.hidden = false;
    formMessage.textContent = message;

    formMessage.classList.remove(
      "success",
      "error",
      "warning"
    );

    formMessage.classList.add(
      type || "error"
    );

    formMessage.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
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
})();
