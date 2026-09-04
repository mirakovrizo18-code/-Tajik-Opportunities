document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("publicationForm");

    if (!form) return;


    const title =
        document.getElementById("title");

    const description =
        document.getElementById("description");

    const titleCount =
        document.getElementById("titleCount");

    const descriptionCount =
        document.getElementById("descriptionCount");

    const image =
        document.getElementById("image");

    const imagePreview =
        document.getElementById("imagePreview");

    const submitButton =
        document.getElementById("submitButton");

    const errorBox =
        document.getElementById("formError");

    const successBox =
        document.getElementById("successBox");

    const trackingCode =
        document.getElementById("trackingCode");

    const copyCode =
        document.getElementById("copyCode");


    /* =========================
       CHARACTER COUNTERS
    ========================= */

    title?.addEventListener("input", () => {

        titleCount.textContent =
            title.value.length;

    });


    description?.addEventListener("input", () => {

        descriptionCount.textContent =
            description.value.length;

    });


    /* =========================
       IMAGE PREVIEW
    ========================= */

    image?.addEventListener("input", () => {

        const url =
            image.value.trim();


        if (!url) {

            imagePreview.innerHTML = "";

            imagePreview.classList.add("hidden");

            return;

        }


        if (!/^https?:\/\//i.test(url)) {
            return;
        }


        imagePreview.innerHTML = `
            <img
                src="${escapeAttribute(url)}"
                alt="Предпросмотр"
                onerror="
                    this.parentElement.classList.add('hidden')
                "
            >
        `;


        imagePreview.classList.remove("hidden");

    });


    /* =========================
       SUBMIT
    ========================= */

    form.addEventListener("submit", async event => {

        event.preventDefault();


        hideError();


        const formData =
            new FormData(form);


        const payload = {

            category:
                formData.get("category"),

            title:
                formData.get("title")?.trim(),

            description:
                formData.get("description")?.trim(),

            location:
                formData.get("location")?.trim(),

            source:
                formData.get("source")?.trim(),

            image:
                formData.get("image")?.trim(),

            authorName:
                formData.get("authorName")?.trim(),

            contact:
                formData.get("contact")?.trim()

        };


        /* =========================
           VALIDATION
        ========================= */

        if (!payload.category) {

            showError(
                "Пожалуйста, выберите категорию."
            );

            return;

        }


        if (!payload.title || payload.title.length < 5) {

            showError(
                "Заголовок должен содержать минимум 5 символов."
            );

            title.focus();

            return;

        }


        if (
            !payload.description ||
            payload.description.length < 20
        ) {

            showError(
                "Описание должно содержать минимум 20 символов."
            );

            description.focus();

            return;

        }


        if (
            !payload.authorName ||
            payload.authorName.length < 2
        ) {

            showError(
                "Укажите ваше имя."
            );

            document
                .getElementById("authorName")
                ?.focus();

            return;

        }


        if (
            payload.source &&
            !/^https?:\/\//i.test(payload.source)
        ) {

            showError(
                "Ссылка на источник должна начинаться с https:// или http://"
            );

            return;

        }


        if (
            payload.image &&
            !/^https?:\/\//i.test(payload.image)
        ) {

            showError(
                "Ссылка на изображение должна начинаться с https:// или http://"
            );

            return;

        }


        /* =========================
           BUTTON LOADING
        ========================= */

        submitButton.disabled = true;

        submitButton.dataset.originalText =
            submitButton.textContent;

        submitButton.textContent =
            "Отправка...";


        try {

            const response =
                await fetch(
                    "/api/publications",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Не удалось отправить публикацию."
                );

            }


            /* =========================
               SUCCESS
            ========================= */

            const code =
                data.code ||
                data.trackingCode ||
                data.publication?.code;


            if (!code) {

                throw new Error(
                    "Публикация отправлена, но сервер не вернул код."
                );

            }


            trackingCode.textContent =
                code;


            form.classList.add("hidden");

            successBox.classList.remove("hidden");


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            localStorage.setItem(
                "lastPublicationCode",
                code
            );


        }

        catch (error) {

            console.error(error);

            showError(
                error.message ||
                "Произошла ошибка. Попробуйте ещё раз."
            );

        }

        finally {

            submitButton.disabled = false;

            submitButton.textContent =
                submitButton.dataset.originalText ||
                "Отправить на модерацию";

        }

    });


    /* =========================
       COPY CODE
    ========================= */

    copyCode?.addEventListener("click", async () => {

        const code =
            trackingCode.textContent.trim();


        try {

            await navigator.clipboard.writeText(code);

            copyCode.textContent = "✓";

            window.showToast?.(
                "Код скопирован",
                "success"
            );


            setTimeout(() => {
                copyCode.textContent = "📋";
            }, 1500);

        }

        catch {

            window.showToast?.(
                "Не удалось скопировать код",
                "error"
            );

        }

    });


    /* =========================
       ERROR
    ========================= */

    function showError(message) {

        errorBox.textContent =
            message;

        errorBox.classList.remove("hidden");

        errorBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    function hideError() {

        errorBox.textContent = "";

        errorBox.classList.add("hidden");

    }

});
