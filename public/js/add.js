/* ============================================================
   TAJIK OPPORTUNITIES
   PUBLIC/JS/ADD.JS
   Создание публикации
   V7 — синхронизирован с public/add.html
   ============================================================ */

(() => {
  "use strict";

  const state = {
    submitting: false,
    mediaIndex: 1,
    formChanged: false
  };

  const form = document.getElementById("submissionForm");

  if (!form) {
    console.warn("Tajik Opportunities: форма публикации не найдена.");
    return;
  }

  /* ============================================================
     ELEMENTS
     ============================================================ */

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const categoryInput = document.getElementById("category");
  const subcategoryInput = document.getElementById("subcategory");

  const countryInput = document.getElementById("country");
  const cityInput = document.getElementById("city");
  const locationInput = document.getElementById("location");
  const scopeInput = document.getElementById("scope");

  const eventStartInput = document.getElementById("event_start");
  const eventEndInput = document.getElementById("event_end");
  const deadlineInput = document.getElementById("deadline");

  const priceInput = document.getElementById("price");
  const currencyInput = document.getElementById("currency");

  const employmentInput =
    document.getElementById("employment_type");

  const workFormatInput =
    document.getElementById("work_format");

  const experienceInput =
    document.getElementById("experience");

  const educationInput =
    document.getElementById("education");

  const languagesInput =
    document.getElementById("languages");

  const tagsInput =
    document.getElementById("tags");

  const contactNameInput =
    document.getElementById("contact_name");

  const contactPhoneInput =
    document.getElementById("contact_phone");

  const contactEmailInput =
    document.getElementById("contact_email");

  const contactTelegramInput =
    document.getElementById("contact_telegram");

  const externalUrlInput =
    document.getElementById("external_url");

  const authorInput =
    document.getElementById("author_name");

  const languageInput =
    document.getElementById("language");

  const translateAllInput =
    document.getElementById("translateAll");

  const websiteInput =
    document.getElementById("website");

  const mediaList =
    document.getElementById("mediaList");

  const addMediaButton =
    document.getElementById("addMediaButton");

  const submitButton =
    document.getElementById("submitSubmission");

  const formMessage =
    document.getElementById("formMessage");

  const successState =
    document.getElementById("submissionSuccess");

  const submitCard =
    document.getElementById("submitCard");

  const trackingCodeElement =
    document.getElementById("trackingCode");

  const copyTrackingButton =
    document.getElementById("copyTrackingButton");

  const trackingStatusLink =
    document.getElementById("trackingStatusLink");

  const toast =
    document.getElementById("toast");

  const titleCounter =
    document.getElementById("titleCounter");

  const contentCounter =
    document.getElementById("contentCounter");


  /* ============================================================
     HELPERS
     ============================================================ */

  function getValue(element) {
    if (!element) return "";
    return String(element.value || "").trim();
  }


  function getChecked(element) {
    return Boolean(element && element.checked);
  }


  function safeUrl(url) {
    if (!url) return true;

    try {
      const parsed = new URL(url);

      return (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      );
    } catch {
      return false;
    }
  }


  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function showToast(message, type = "success") {
    if (!toast) return;

    toast.textContent = message;

    toast.className = "toast";

    toast.classList.add("show");

    if (type) {
      toast.classList.add(type);
    }

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }


  function showMessage(message, type = "error") {
    if (!formMessage) return;

    formMessage.hidden = false;

    formMessage.textContent = message;

    formMessage.className =
      "form-message " + type;

    try {
      formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    } catch {
      /* ignore */
    }
  }


  function clearMessage() {
    if (!formMessage) return;

    formMessage.hidden = true;

    formMessage.textContent = "";

    formMessage.className =
      "form-message";
  }


  function setLoading(loading) {
    if (!submitButton) return;

    if (loading) {
      submitButton.disabled = true;

      submitButton.dataset.originalText =
        submitButton.innerHTML;

      submitButton.innerHTML =
        "⏳ Отправляем публикацию...";
    } else {
      submitButton.disabled = false;

      if (submitButton.dataset.originalText) {
        submitButton.innerHTML =
          submitButton.dataset.originalText;
      }
    }
  }


  /* ============================================================
     COUNTERS
     ============================================================ */

  function updateCounters() {
    if (titleCounter) {
      titleCounter.textContent =
        String(getValue(titleInput).length);
    }

    if (contentCounter) {
      contentCounter.textContent =
        String(getValue(contentInput).length);
    }
  }


  /* ============================================================
     MEDIA
     ============================================================ */

  function createMediaItem(index) {
    const item =
      document.createElement("div");

    item.className = "media-item";

    item.dataset.mediaIndex =
      String(index);

    item.innerHTML = `
      <div class="media-item-header">
        <strong>Медиа #${index}</strong>

        <button
          type="button"
          class="remove-media"
          title="Удалить медиа"
        >
          ✕ Удалить
        </button>
      </div>

      <div class="form-grid-2">

        <div class="form-group">

          <label>
            Тип медиа
          </label>

          <select
            name="media_type"
            class="media-type"
          >

            <option value="image">
              🖼️ Изображение
            </option>

            <option value="gallery">
              🖼️ Галерея
            </option>

            <option value="video">
              🎬 Видео
            </option>

            <option value="music">
              🎵 Музыка
            </option>

            <option value="audio">
              🔊 Аудио
            </option>

            <option value="link">
              🔗 Ссылка
            </option>

            <option value="document">
              📄 Документ
            </option>

            <option value="other">
              📎 Другое
            </option>

          </select>

        </div>

        <div class="form-group">

          <label>
            URL
          </label>

          <input
            type="url"
            name="media_url"
            class="media-url"
            placeholder="https://example.com/..."
            inputmode="url"
          >

        </div>

      </div>

      <div class="form-group">

        <label>
          Подпись
        </label>

        <input
          type="text"
          name="media_caption"
          class="media-caption"
          maxlength="300"
          placeholder="Описание медиа"
        >

      </div>
    `;

    return item;
  }


  function addMediaItem() {
    if (!mediaList) return;

    state.mediaIndex++;

    const item =
      createMediaItem(state.mediaIndex);

    mediaList.appendChild(item);

    state.formChanged = true;

    const input =
      item.querySelector(".media-url");

    if (input) {
      input.focus();
    }
  }


  function renumberMedia() {
    if (!mediaList) return;

    const items =
      mediaList.querySelectorAll(
        ".media-item"
      );

    items.forEach((item, index) => {
      const number = index + 1;

      item.dataset.mediaIndex =
        String(number);

      const title =
        item.querySelector(
          ".media-item-header strong"
        );

      if (title) {
        title.textContent =
          `Медиа #${number}`;
      }
    });

    state.mediaIndex =
      items.length || 1;
  }


  function collectMedia() {
    if (!mediaList) return [];

    const items =
      mediaList.querySelectorAll(
        ".media-item"
      );

    const result = [];

    items.forEach((item) => {
      const type =
        item.querySelector(".media-type");

      const url =
        item.querySelector(".media-url");

      const caption =
        item.querySelector(".media-caption");

      const mediaUrl =
        getValue(url);

      if (!mediaUrl) {
        return;
      }

      result.push({
        type:
          getValue(type) || "other",

        url:
          mediaUrl,

        caption:
          getValue(caption)
      });
    });

    return result;
  }


  /* ============================================================
     VALIDATION
     ============================================================ */

  function validate() {
    const title =
      getValue(titleInput);

    const content =
      getValue(contentInput);

    const category =
      getValue(categoryInput);

    if (!title) {
      return "Введите заголовок публикации.";
    }

    if (title.length < 5) {
      return "Заголовок должен содержать минимум 5 символов.";
    }

    if (title.length > 180) {
      return "Заголовок не должен превышать 180 символов.";
    }

    if (!content) {
      return "Введите описание публикации.";
    }

    if (content.length < 20) {
      return "Описание должно содержать минимум 20 символов.";
    }

    if (content.length > 10000) {
      return "Описание не должно превышать 10000 символов.";
    }

    if (!category) {
      return "Выберите категорию.";
    }


    const externalUrl =
      getValue(externalUrlInput);

    if (
      externalUrl &&
      !safeUrl(externalUrl)
    ) {
      return "Укажите корректную официальную ссылку.";
    }


    const email =
      getValue(contactEmailInput);

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return "Укажите корректный email.";
    }


    const price =
      getValue(priceInput);

    if (price) {
      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        return "Укажите корректную цену или зарплату.";
      }
    }


    const eventStart =
      getValue(eventStartInput);

    const eventEnd =
      getValue(eventEndInput);

    if (
      eventStart &&
      eventEnd &&
      new Date(eventEnd) < new Date(eventStart)
    ) {
      return "Дата окончания не может быть раньше даты начала.";
    }


    const media =
      collectMedia();

    for (
      let index = 0;
      index < media.length;
      index++
    ) {
      if (!safeUrl(media[index].url)) {
        return (
          `Некорректная ссылка в медиа #${index + 1}.`
        );
      }
    }


    return null;
  }


  /* ============================================================
     COLLECT PUBLICATION
     ============================================================ */

  function collectPublication() {
    const media =
      collectMedia();

    return {

      title:
        getValue(titleInput),

      content:
        getValue(contentInput),

      category:
        getValue(categoryInput),

      subcategory:
        getValue(subcategoryInput),

      country:
        getValue(countryInput),

      city:
        getValue(cityInput),

      location:
        getValue(locationInput),

      scope:
        getValue(scopeInput),

      event_start:
        getValue(eventStartInput),

      event_end:
        getValue(eventEndInput),

      deadline:
        getValue(deadlineInput),

      price:
        getValue(priceInput),

      currency:
        getValue(currencyInput),

      employment_type:
        getValue(employmentInput),

      work_format:
        getValue(workFormatInput),

      experience:
        getValue(experienceInput),

      education:
        getValue(educationInput),

      languages:
        getValue(languagesInput),

      tags:
        getValue(tagsInput),

      contact_name:
        getValue(contactNameInput),

      contact_phone:
        getValue(contactPhoneInput),

      contact_email:
        getValue(contactEmailInput),

      contact_telegram:
        getValue(contactTelegramInput),

      external_url:
        getValue(externalUrlInput),

      author_name:
        getValue(authorInput),

      language:
        getValue(languageInput) || "ru",

      translate_all:
        getChecked(translateAllInput),

      media
    };
  }


  /* ============================================================
     API
     ============================================================ */

  async function submitPublication(publication) {

    const response =
      await fetch(
        "/api/publications",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          credentials:
            "include",

          body:
            JSON.stringify(publication)
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

      if (response.status === 401) {
        throw new Error(
          "Чтобы отправить публикацию, сначала войдите в аккаунт."
        );
      }

      if (response.status === 403) {
        throw new Error(
          result?.error ||
          result?.message ||
          "Отправка публикаций сейчас недоступна."
        );
      }

      if (response.status === 429) {
        throw new Error(
          "Слишком много запросов. Подождите немного и попробуйте снова."
        );
      }

      throw new Error(
        result?.error ||
        result?.message ||
        "Не удалось отправить публикацию."
      );
    }


    return result;
  }


  /* ============================================================
     SUCCESS
     ============================================================ */

  function getTrackingCode(result) {

    return (
      result?.tracking_code ||
      result?.trackingCode ||
      result?.submission_code ||
      result?.submissionCode ||
      result?.code ||
      result?.data?.tracking_code ||
      result?.data?.trackingCode ||
      result?.data?.submission_code ||
      result?.data?.submissionCode ||
      result?.data?.code ||
      result?.publication?.tracking_code ||
      result?.publication?.id ||
      result?.id ||
      ""
    );
  }


  function showSuccess(result) {

    const code =
      getTrackingCode(result);


    if (trackingCodeElement) {

      trackingCodeElement.textContent =
        code || "Отправлено";
    }


    if (
      trackingStatusLink &&
      code
    ) {

      trackingStatusLink.href =
        `/status.html?code=${encodeURIComponent(code)}`;
    }


    if (submitCard) {
      submitCard.hidden = true;
    }


    if (successState) {
      successState.hidden = false;
    }


    if (formMessage) {
      formMessage.hidden = true;
    }


    state.formChanged = false;


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* ============================================================
     COPY TRACKING CODE
     ============================================================ */

  async function copyTrackingCode() {

    if (!trackingCodeElement) {
      return;
    }

    const code =
      trackingCodeElement.textContent.trim();


    if (
      !code ||
      code === "—" ||
      code === "Отправлено"
    ) {
      showToast(
        "Код публикации ещё недоступен.",
        "warning"
      );

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

      } else {

        const textarea =
          document.createElement("textarea");

        textarea.value = code;

        textarea.style.position =
          "fixed";

        textarea.style.left =
          "-9999px";

        textarea.style.top =
          "0";

        document.body.appendChild(
          textarea
        );

        textarea.focus();

        textarea.select();

        document.execCommand(
          "copy"
        );

        textarea.remove();
      }


      showToast(
        "Код публикации скопирован.",
        "success"
      );

    } catch (error) {

      console.error(
        "Copy tracking code error:",
        error
      );

      showToast(
        "Не удалось скопировать код.",
        "error"
      );
    }
  }


  /* ============================================================
     SUBMIT
     ============================================================ */

  async function handleSubmit(event) {

    event.preventDefault();


    if (state.submitting) {
      return;
    }


    clearMessage();


    /*
     * Honeypot.
     * Если скрытое поле заполнено,
     * считаем отправку подозрительной.
     */

    if (getValue(websiteInput)) {

      showMessage(
        "Не удалось обработать форму.",
        "error"
      );

      return;
    }


    const validationError =
      validate();


    if (validationError) {

      showMessage(
        validationError,
        "error"
      );

      return;
    }


    const publication =
      collectPublication();


    state.submitting = true;

    setLoading(true);


    try {

      const result =
        await submitPublication(
          publication
        );


      state.formChanged = false;


      showSuccess(result);


      showToast(
        "Публикация отправлена на модерацию.",
        "success"
      );


    } catch (error) {

      console.error(
        "Tajik Opportunities publication error:",
        error
      );


      showMessage(
        error?.message ||
        "Произошла ошибка при отправке публикации. Попробуйте ещё раз.",
        "error"
      );


      showToast(
        "Не удалось отправить публикацию.",
        "error"
      );


    } finally {

      state.submitting = false;

      setLoading(false);
    }
  }


  /* ============================================================
     MEDIA EVENTS
     ============================================================ */

  function handleMediaClick(event) {

    const removeButton =
      event.target.closest(
        ".remove-media"
      );

    if (!removeButton) {
      return;
    }


    const item =
      removeButton.closest(
        ".media-item"
      );

    if (!item) {
      return;
    }


    const items =
      mediaList
        ? mediaList.querySelectorAll(
            ".media-item"
          )
        : [];


    /*
     * Оставляем хотя бы один блок.
     */

    if (items.length <= 1) {

      const url =
        item.querySelector(
          ".media-url"
        );

      const caption =
        item.querySelector(
          ".media-caption"
        );

      if (url) {
        url.value = "";
      }

      if (caption) {
        caption.value = "";
      }

      state.formChanged = true;

      return;
    }


    item.remove();

    renumberMedia();

    state.formChanged = true;
  }


  /* ============================================================
     FORM CHANGED
     ============================================================ */

  function markChanged() {
    state.formChanged = true;
  }


  /* ============================================================
     CATEGORY HELP
     ============================================================ */

  function setupCategoryHelp() {

    if (!categoryInput) {
      return;
    }


    categoryInput.addEventListener(
      "change",
      () => {

        const category =
          getValue(categoryInput);


        if (
          category === "jobs" ||
          category === "job_seekers" ||
          category === "employees"
        ) {

          if (employmentInput) {

            const wrapper =
              employmentInput.closest(
                ".form-group"
              );

            wrapper?.classList.remove(
              "hidden"
            );
          }
        }


        markChanged();
      }
    );
  }


  /* ============================================================
     BEFORE UNLOAD
     ============================================================ */

  function setupBeforeUnload() {

    window.addEventListener(
      "beforeunload",
      (event) => {

        if (!state.formChanged) {
          return;
        }

        event.preventDefault();

        event.returnValue = "";
      }
    );
  }


  /* ============================================================
     INITIALIZE
     ============================================================ */

  function init() {

    form.addEventListener(
      "submit",
      handleSubmit
    );


    form.addEventListener(
      "input",
      markChanged
    );


    form.addEventListener(
      "change",
      markChanged
    );


    if (titleInput) {

      titleInput.addEventListener(
        "input",
        updateCounters
      );
    }


    if (contentInput) {

      contentInput.addEventListener(
        "input",
        updateCounters
      );
    }


    if (addMediaButton) {

      addMediaButton.addEventListener(
        "click",
        addMediaItem
      );
    }


    if (mediaList) {

      mediaList.addEventListener(
        "click",
        handleMediaClick
      );
    }


    if (copyTrackingButton) {

      copyTrackingButton.addEventListener(
        "click",
        copyTrackingCode
      );
    }


    setupCategoryHelp();

    setupBeforeUnload();

    updateCounters();

    renumberMedia();


    /*
     * Если форма отправлена успешно,
     * предупреждение beforeunload отключается.
     */

    state.formChanged = false;
  }


  /* ============================================================
     START
     ============================================================ */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );

  } else {

    init();
  }


  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.TajikOpportunitiesAdd = {

    submit: handleSubmit,

    validate,

    collectPublication,

    collectMedia,

    addMedia: addMediaItem,

    resetMedia: () => {

      if (!mediaList) return;

      const items =
        mediaList.querySelectorAll(
          ".media-item"
        );

      items.forEach(
        (item, index) => {

          if (index > 0) {
            item.remove();
          }
        }
      );

      renumberMedia();
    }

  };

})();
