/* ============================================================
   TAJIK OPPORTUNITIES
   ADD PUBLICATION — V6
   Создание публикации + несколько URL медиа
   ============================================================ */

(() => {
  "use strict";

  const state = {
    submitting: false,
    mediaIndex: 1
  };

  const form = document.getElementById("submissionForm");

  if (!form) {
    return;
  }


  /* ==========================================================
     DOM
  ========================================================== */

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const categoryInput = document.getElementById("category");
  const countryInput = document.getElementById("country");
  const cityInput = document.getElementById("city");
  const scopeInput = document.getElementById("scope");
  const locationInput = document.getElementById("location");

  const eventStartInput =
    document.getElementById("event_start");

  const eventEndInput =
    document.getElementById("event_end");

  const deadlineInput =
    document.getElementById("deadline");

  const priceInput =
    document.getElementById("price");

  const currencyInput =
    document.getElementById("currency");

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

  const subcategoryInput =
    document.getElementById("subcategory");

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

  const trackingCodeElement =
    document.getElementById("trackingCode");

  const copyTrackingButton =
    document.getElementById("copyTrackingButton");


  /* ==========================================================
     HELPERS
  ========================================================== */

  function value(element) {
    return element
      ? element.value.trim()
      : "";
  }


  function safeUrl(url) {
    if (!url) {
      return true;
    }

    try {
      const parsed =
        new URL(url);

      return (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      );
    } catch {
      return false;
    }
  }


  function showToast(
    message,
    type = "success"
  ) {
    const toast =
      document.getElementById("toast");

    if (!toast) {
      return;
    }

    toast.textContent =
      message;

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

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(() => {
        toast.classList.remove(
          "show"
        );
      }, 3500);
  }


  function setLoading(loading) {
    if (!submitButton) {
      return;
    }

    if (loading) {

      submitButton.disabled =
        true;

      submitButton.dataset.oldText =
        submitButton.innerHTML;

      submitButton.innerHTML =
        "⏳ Отправляем публикацию...";

    } else {

      submitButton.disabled =
        false;

      if (
        submitButton.dataset.oldText
      ) {
        submitButton.innerHTML =
          submitButton.dataset.oldText;
      }
    }
  }


  /* ==========================================================
     COUNTERS
  ========================================================== */

  function updateCounters() {

    const titleCounter =
      document.getElementById(
        "titleCounter"
      );

    if (titleCounter) {
      titleCounter.textContent =
        `${value(titleInput).length}`;
    }


    const contentCounter =
      document.getElementById(
        "contentCounter"
      );

    if (contentCounter) {
      contentCounter.textContent =
        `${value(contentInput).length}`;
    }
  }


  /* ==========================================================
     MEDIA
  ========================================================== */

  function addMediaItem() {

    if (!mediaList) {
      return;
    }

    state.mediaIndex++;

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "media-item";

    item.dataset.mediaIndex =
      String(
        state.mediaIndex
      );

    item.innerHTML = `
      <div class="media-item-header">

        <strong>
          Медиа #${state.mediaIndex}
        </strong>

        <button
          type="button"
          class="remove-media"
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
          placeholder="Описание медиа"
        >

      </div>
    `;

    mediaList.appendChild(
      item
    );

    const removeButton =
      item.querySelector(
        ".remove-media"
      );

    if (removeButton) {
      removeButton.addEventListener(
        "click",
        () => {
          item.remove();
          renumberMedia();
        }
      );
    }
  }


  function renumberMedia() {

    if (!mediaList) {
      return;
    }

    const items =
      mediaList.querySelectorAll(
        ".media-item"
      );

    items.forEach(
      (item, index) => {

        const title =
          item.querySelector(
            ".media-item-header strong"
          );

        if (title) {
          title.textContent =
            `Медиа #${index + 1}`;
        }
      }
    );

    state.mediaIndex =
      items.length;
  }


  function collectMedia() {

    if (!mediaList) {
      return [];
    }

    const items =
      mediaList.querySelectorAll(
        ".media-item"
      );

    const result = [];

    items.forEach(
      item => {

        const type =
          item.querySelector(
            ".media-type"
          );

        const url =
          item.querySelector(
            ".media-url"
          );

        const caption =
          item.querySelector(
            ".media-caption"
          );

        const mediaUrl =
          value(url);

        if (!mediaUrl) {
          return;
        }

        result.push({
          type: value(type) ||
            "other",

          url: mediaUrl,

          caption:
            value(caption)
        });
      }
    );

    return result;
  }


  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validate() {

    const title =
      value(titleInput);

    const content =
      value(contentInput);

    const category =
      value(categoryInput);


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


    if (!category) {
      return "Выберите категорию.";
    }


    if (
      value(externalUrlInput) &&
      !safeUrl(
        value(externalUrlInput)
      )
    ) {
      return "Укажите корректную официальную ссылку.";
    }


    if (
      value(contactEmailInput)
    ) {

      const email =
        value(contactEmailInput);

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(email)
      ) {
        return "Укажите корректный email.";
      }
    }


    if (
      value(priceInput) &&
      Number(value(priceInput)) < 0
    ) {
      return "Цена или зарплата не может быть отрицательной.";
    }


    const media =
      collectMedia();


    for (
      let i = 0;
      i < media.length;
      i++
    ) {

      if (
        !safeUrl(
          media[i].url
        )
      ) {
        return (
          `Некорректная ссылка в медиа #${i + 1}.`
        );
      }
    }


    return null;
  }


  /* ==========================================================
     COLLECT PUBLICATION
  ========================================================== */

  function collectPublication() {

    const media =
      collectMedia();


    const languages =
      value(languagesInput);


    const tags =
      value(tagsInput);


    return {

      title:
        value(titleInput),

      content:
        value(contentInput),

      category:
        value(categoryInput),

      subcategory:
        value(subcategoryInput),

      country:
        value(countryInput),

      city:
        value(cityInput),

      location:
        value(locationInput),

      scope:
        value(scopeInput),

      event_start:
        value(eventStartInput),

      event_end:
        value(eventEndInput),

      deadline:
        value(deadlineInput),

      price:
        value(priceInput),

      currency:
        value(currencyInput),

      employment_type:
        value(employmentInput),

      work_format:
        value(workFormatInput),

      experience:
        value(experienceInput),

      education:
        value(educationInput),

      languages:
        languages,

      tags:
        tags,

      contact_name:
        value(contactNameInput),

      contact_phone:
        value(contactPhoneInput),

      contact_email:
        value(contactEmailInput),

      contact_telegram:
        value(contactTelegramInput),

      external_url:
        value(externalUrlInput),

      author_name:
        value(authorInput),

      language:
        value(languageInput) ||
        "ru",

      translate_all:
        Boolean(
          translateAllInput &&
          translateAllInput.checked
        ),

      media
    };
  }


  /* ==========================================================
     SEND
  ========================================================== */

  async function submitPublication(
    publication
  ) {

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

          body:
            JSON.stringify(
              publication
            )
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

      throw new Error(
        result?.error ||
        result?.message ||
        "Не удалось отправить публикацию."
      );
    }


    return result;
  }


  /* ==========================================================
     SUCCESS
  ========================================================== */

  function showSuccess(result) {

    form.hidden =
      true;


    if (formMessage) {
      formMessage.hidden =
        true;
    }


    if (!successState) {
      return;
    }


    successState.hidden =
      false;


    const code =
      result?.tracking_code ||
      result?.trackingCode ||
      result?.submission_code ||
      result?.code ||
      result?.data?.tracking_code ||
      result?.id ||
      "";


    if (trackingCodeElement) {

      trackingCodeElement.textContent =
        code || "Отправлено";
    }


    const statusLink =
      document.querySelector(
        "#trackingStatusLink"
      );


    if (
      statusLink &&
      code
    ) {

      statusLink.href =
        `/status.html?code=${encodeURIComponent(
          code
        )}`;
    }


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* ==========================================================
     COPY TRACKING CODE
  ========================================================== */

  async function copyTrackingCode() {

    if (!trackingCodeElement) {
      return;
    }


    const code =
      trackingCodeElement.textContent.trim();


    if (
      !code ||
      code === "—"
    ) {
      return;
    }


    try {

      if (
        navigator.clipboard
      ) {

        await navigator.clipboard.writeText(
          code
        );

      } else {

        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value =
          code;

        textarea.style.position =
          "fixed";

        textarea.style.left =
          "-9999px";

        document.body.appendChild(
          textarea
        );

        textarea.select();

        document.execCommand(
          "copy"
        );

        textarea.remove();
      }


      showToast(
        "Код скопирован.",
        "success"
      );

    } catch {

      showToast(
        "Не удалось скопировать код.",
        "error"
      );
    }
  }


  /* ==========================================================
     MESSAGE
  ========================================================== */

  function showMessage(
    message,
    type = "error"
  ) {

    if (!formMessage) {
      return;
    }


    formMessage.hidden =
      false;


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
      block: "center"
    });
  }


  function clearMessage() {

    if (!formMessage) {
      return;
    }


    formMessage.hidden =
      true;


    formMessage.textContent =
      "";


    formMessage.classList.remove(
      "success",
      "error",
      "warning"
    );
  }


  /* ==========================================================
     SUBMIT HANDLER
  ========================================================== */

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    if (
      state.submitting
    ) {
      return;
    }


    clearMessage();


    /*
      Honeypot.
      Если бот заполнил скрытое поле —
      не отправляем публикацию.
    */

    if (
      value(websiteInput)
    ) {

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


    state.submitting =
      true;


    setLoading(true);


    try {

      const result =
        await submitPublication(
          publication
        );


      showSuccess(
        result
      );


      showToast(
        "Публикация отправлена на модерацию.",
        "success"
      );


    } catch (error) {

      console.error(
        "Tajik Opportunities:",
        error
      );


      showMessage(
        error?.message ||
        "Произошла ошибка при отправке публикации.",
        "error"
      );


      showToast(
        "Не удалось отправить публикацию.",
        "error"
      );

    } finally {

      state.submitting =
        false;

      setLoading(false);
    }
  }


  /* ==========================================================
     CATEGORY SMART HELP
  ========================================================== */

  function setupCategoryHelp() {

    if (!categoryInput) {
      return;
    }


    categoryInput.addEventListener(
      "change",
      () => {

        const category =
          value(categoryInput);


        /*
          Автоматически предлагаем
          полезные поля для некоторых категорий.
        */

        if (
          category === "jobs" ||
          category === "job_seekers" ||
          category === "employees"
        ) {

          if (
            employmentInput
          ) {
            employmentInput
              .closest(".form-group")
              ?.classList
              .remove("hidden");
          }
        }
      }
    );
  }


  /* ==========================================================
     INIT
  ========================================================== */

  function init() {

    form.addEventListener(
      "submit",
      handleSubmit
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


    if (copyTrackingButton) {

      copyTrackingButton.addEventListener(
        "click",
        copyTrackingCode
      );
    }


    setupCategoryHelp();

    updateCounters();
  }


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
