document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("statusForm");

    if (!form) return;


    const input =
        document.getElementById("trackingCodeInput");

    const button =
        document.getElementById("statusButton");

    const error =
        document.getElementById("statusError");

    const result =
        document.getElementById("statusResult");


    const resultCode =
        document.getElementById("resultCode");

    const resultStatus =
        document.getElementById("resultStatus");

    const resultCategory =
        document.getElementById("resultCategory");

    const resultTitle =
        document.getElementById("resultTitle");

    const resultDescription =
        document.getElementById("resultDescription");

    const resultAuthor =
        document.getElementById("resultAuthor");

    const resultDate =
        document.getElementById("resultDate");

    const rejectionReason =
        document.getElementById("rejectionReason");

    const rejectionText =
        document.getElementById("rejectionText");


    /* =========================
       PREVIOUS CODE
    ========================= */

    const savedCode =
        localStorage.getItem(
            "lastPublicationCode"
        );


    if (savedCode) {

        input.value =
            savedCode;

    }


    /* =========================
       UPPERCASE
    ========================= */

    input.addEventListener("input", () => {

        input.value =
            input.value
                .toUpperCase()
                .replace(/\s/g, "");

    });


    /* =========================
       SUBMIT
    ========================= */

    form.addEventListener("submit", async event => {

        event.preventDefault();


        hideError();

        result.classList.add("hidden");


        const code =
            input.value.trim();


        if (!code) {

            showError(
                "Введите код публикации."
            );

            return;

        }


        button.disabled = true;

        button.textContent =
            "Проверка...";


        try {

            const response =
                await fetch(
                    `/api/publications/status?code=${encodeURIComponent(code)}`
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Публикация не найдена."
                );

            }


            const post =
                data.publication ||
                data.post ||
                data;


            renderResult(post, code);

        }

        catch (err) {

            console.error(err);

            showError(
                err.message ||
                "Не удалось проверить статус."
            );

        }

        finally {

            button.disabled = false;

            button.textContent =
                "Проверить";

        }

    });


    /* =========================
       RENDER
    ========================= */

    function renderResult(post, code) {

        result.classList.remove("hidden");


        resultCode.textContent =
            post.code ||
            post.tracking_code ||
            code;


        const status =
            post.status ||
            "pending";


        resultStatus.className =
            "status-badge";


        if (status === "approved") {

            resultStatus.textContent =
                "✓ Опубликовано";

            resultStatus.classList.add(
                "approved"
            );

        }

        else if (status === "rejected") {

            resultStatus.textContent =
                "✕ Отклонено";

            resultStatus.classList.add(
                "rejected"
            );

        }

        else {

            resultStatus.textContent =
                "🟡 На модерации";

            resultStatus.classList.add(
                "pending"
            );

        }


        resultCategory.textContent =
            window.getCategoryName
                ? window.getCategoryName(post.category)
                : post.category || "Другое";


        resultTitle.textContent =
            post.title ||
            "Без названия";


        resultDescription.textContent =
            post.description ||
            "";


        resultAuthor.textContent =
            post.author_name ||
            post.authorName ||
            "Участник";


        resultDate.textContent =
            window.formatDate
                ? window.formatDate(
                    post.created_at ||
                    post.createdAt
                )
                : "—";


        if (status === "rejected") {

            const reason =
                post.rejection_reason ||
                post.rejectionReason ||
                "Причина не указана.";


            rejectionText.textContent =
                reason;


            rejectionReason.classList.remove(
                "hidden"
            );

        }

        else {

            rejectionReason.classList.add(
                "hidden"
            );

        }


        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    /* =========================
       ERROR
    ========================= */

    function showError(message) {

        error.textContent =
            message;

        error.classList.remove("hidden");

    }


    function hideError() {

        error.textContent = "";

        error.classList.add("hidden");

    }

});
