document.addEventListener("DOMContentLoaded", () => {

    const loginSection =
        document.getElementById("adminLogin");

    const dashboard =
        document.getElementById("adminDashboard");

    const loginForm =
        document.getElementById("adminLoginForm");

    const tokenInput =
        document.getElementById("adminToken");

    const loginError =
        document.getElementById("loginError");

    const loginButton =
        document.getElementById("loginButton");

    const logoutButton =
        document.getElementById("adminLogout");


    const postsContainer =
        document.getElementById("adminPosts");

    const empty =
        document.getElementById("adminEmpty");


    const modal =
        document.getElementById("moderationModal");


    let adminToken =
        sessionStorage.getItem(
            "tajik_admin_token"
        );


    let currentStatus =
        "pending";


    let currentPublication =
        null;


    /* =========================
       START
    ========================= */

    if (adminToken) {

        showDashboard();

        loadDashboard();

    }


    /* =========================
       LOGIN
    ========================= */

    loginForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            hideLoginError();


            const token =
                tokenInput.value.trim();


            if (!token) {

                showLoginError(
                    "Введите ключ администратора."
                );

                return;

            }


            loginButton.disabled = true;

            loginButton.textContent =
                "Проверка...";


            try {

                const response =
                    await fetch(
                        "/api/admin/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    token
                                })
                        }
                    );


                const data =
                    await response.json()
                        .catch(() => ({}));


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Неверный ключ администратора."
                    );

                }


                adminToken =
                    token;


                sessionStorage.setItem(
                    "tajik_admin_token",
                    token
                );


                showDashboard();

                await loadDashboard();


            }

            catch (error) {

                showLoginError(
                    error.message ||
                    "Ошибка входа."
                );

            }

            finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    "Войти";

            }

        }
    );


    /* =========================
       LOGOUT
    ========================= */

    logoutButton?.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "tajik_admin_token"
            );

            adminToken = null;

            dashboard.classList.add(
                "hidden"
            );

            loginSection.classList.remove(
                "hidden"
            );

            tokenInput.value = "";

        }
    );


    /* =========================
       TABS
    ========================= */

    document
        .querySelectorAll(".admin-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".admin-tab"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    tab.classList.add(
                        "active"
                    );


                    currentStatus =
                        tab.dataset.status;


                    loadPublications();

                }
            );

        });


    /* =========================
       REFRESH
    ========================= */

    document
        .getElementById("adminRefresh")
        ?.addEventListener(
            "click",
            loadDashboard
        );


    /* =========================
       LOAD DASHBOARD
    ========================= */

    async function loadDashboard() {

        await Promise.all([
            loadStatistics(),
            loadPublications()
        ]);

    }


    /* =========================
       STATISTICS
    ========================= */

    async function loadStatistics() {

        try {

            const response =
                await adminFetch(
                    "/api/admin/statistics"
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            setText(
                "statTotal",
                data.total ?? 0
            );


            setText(
                "statPending",
                data.pending ?? 0
            );


            setText(
                "statApproved",
                data.approved ?? 0
            );


            setText(
                "statRejected",
                data.rejected ?? 0
            );

        }

        catch (error) {

            console.error(
                "Statistics error:",
                error
            );

        }

    }


    /* =========================
       PUBLICATIONS
    ========================= */

    async function loadPublications() {

        postsContainer.innerHTML = `
            <div class="loading-card">
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>
        `;


        empty.classList.add("hidden");


        try {

            let url =
                "/api/admin/publications";


            if (currentStatus !== "all") {

                url +=
                    `?status=${encodeURIComponent(
                        currentStatus
                    )}`;

            }


            const response =
                await adminFetch(url);


            if (!response.ok) {

                if (response.status === 401) {

                    logout();

                    return;

                }


                throw new Error(
                    "Не удалось загрузить публикации."
                );

            }


            const data =
                await response.json();


            const posts =
                data.publications ||
                data.posts ||
                data ||
                [];


            renderAdminPosts(
                Array.isArray(posts)
                    ? posts
                    : []
            );

        }

        catch (error) {

            console.error(error);

            postsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Ошибка загрузки</h3>
                    <p>${escapeHTML(error.message)}</p>
                </div>
            `;

        }

    }


    /* =========================
       RENDER ADMIN POSTS
    ========================= */

    function renderAdminPosts(posts) {

        if (!posts.length) {

            postsContainer.innerHTML = "";

            empty.classList.remove("hidden");

            return;

        }


        empty.classList.add("hidden");


        postsContainer.innerHTML =
            posts.map(post =>
                createAdminPost(post)
            ).join("");


        postsContainer
            .querySelectorAll(
                "[data-open-publication]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .openPublication;

                        const post =
                            posts.find(
                                item =>
                                    String(item.id) ===
                                    String(id)
                            );


                        if (post) {
                            openModal(post);
                        }

                    }
                );

            });

    }


    /* =========================
       ADMIN POST
    ========================= */

    function createAdminPost(post) {

        const status =
            post.status || "pending";


        const category =
            window.getCategoryName
                ? window.getCategoryName(
                    post.category
                )
                : post.category || "Другое";


        const title =
            escapeHTML(
                post.title ||
                "Без названия"
            );


        const description =
            escapeHTML(
                post.description ||
                ""
            );


        const author =
            escapeHTML(
                post.author_name ||
                post.authorName ||
                "Участник"
            );


        const date =
            window.formatDate
                ? window.formatDate(
                    post.created_at ||
                    post.createdAt
                )
                : "—";


        let statusLabel =
            "🟡 На модерации";


        if (status === "approved") {
            statusLabel =
                "🟢 Опубликовано";
        }

        if (status === "rejected") {
            statusLabel =
                "🔴 Отклонено";
        }


        return `

            <article class="admin-post">

                <div class="admin-post-info">

                    <span class="post-category">
                        ${category}
                    </span>

                    <h3>${title}</h3>

                    <p>
                        ${description}
                    </p>

                    <div class="admin-post-meta">

                        <span>
                            👤 ${author}
                        </span>

                        <span>
                            📅 ${date}
                        </span>

                        <span>
                            ${statusLabel}
                        </span>

                    </div>

                </div>


                <div class="admin-post-actions">

                    <button
                        class="btn btn-outline"
                        data-open-publication="${escapeAttribute(
                            post.id
                        )}"
                    >
                        Просмотреть
                    </button>

                    ${
                        status === "pending"
                        ? `
                            <button
                                class="btn btn-success quick-approve"
                                data-id="${escapeAttribute(post.id)}"
                            >
                                ✓ Одобрить
                            </button>

                            <button
                                class="btn btn-danger quick-reject"
                                data-id="${escapeAttribute(post.id)}"
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


    /* =========================
       EVENT DELEGATION
    ========================= */

    postsContainer.addEventListener(
        "click",
        async event => {

            const approve =
                event.target.closest(
                    ".quick-approve"
                );


            const reject =
                event.target.closest(
                    ".quick-reject"
                );


            if (approve) {

                await changeStatus(
                    approve.dataset.id,
                    "approved"
                );

            }


            if (reject) {

                currentPublication = {
                    id: reject.dataset.id
                };

                openRejectFromList();

            }

        }
    );


    /* =========================
       OPEN MODAL
    ========================= */

    function openModal(post) {

        currentPublication =
            post;


        document.getElementById(
            "modalTitle"
        ).textContent =
            post.title || "Без названия";


        document.getElementById(
            "modalDescription"
        ).textContent =
            post.description || "";


        document.getElementById(
            "modalAuthor"
        ).textContent =
            post.author_name ||
            post.authorName ||
            "—";


        document.getElementById(
            "modalContact"
        ).textContent =
            post.contact || "—";


        document.getElementById(
            "modalLocation"
        ).textContent =
            post.location || "—";


        document.getElementById(
            "modalDate"
        ).textContent =
            window.formatDate
                ? window.formatDate(
                    post.created_at ||
                    post.createdAt
                )
                : "—";


        const imageContainer =
            document.getElementById(
                "modalImageContainer"
            );


        const modalImage =
            document.getElementById(
                "modalImage"
            );


        if (post.image || post.image_url) {

            modalImage.src =
                post.image ||
                post.image_url;


            modalImage.alt =
                post.title || "";


            imageContainer.classList.remove(
                "hidden"
            );

        }

        else {

            imageContainer.classList.add(
                "hidden"
            );

        }


        const sourceContainer =
            document.getElementById(
                "modalSourceContainer"
            );


        const source =
            document.getElementById(
                "modalSource"
            );


        if (post.source) {

            source.href =
                post.source;

            sourceContainer.classList.remove(
                "hidden"
            );

        }

        else {

            sourceContainer.classList.add(
                "hidden"
            );

        }


        document
            .getElementById("rejectForm")
            ?.classList.add("hidden");


        modal.classList.remove(
            "hidden"
        );

    }


    /* =========================
       CLOSE MODAL
    ========================= */

    document
        .querySelectorAll("[data-close-modal]")
        .forEach(element => {

            element.addEventListener(
                "click",
                closeModal
            );

        });


    function closeModal() {

        modal.classList.add(
            "hidden"
        );

        currentPublication =
            null;

    }


    /* =========================
       APPROVE
    ========================= */

    document
        .getElementById("approveButton")
        ?.addEventListener(
            "click",
            async () => {

                if (!currentPublication) {
                    return;
                }


                await changeStatus(
                    currentPublication.id,
                    "approved"
                );

            }
        );


    /* =========================
       REJECT FORM
    ========================= */

    document
        .getElementById("rejectButton")
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "rejectForm"
                    )
                    .classList
                    .remove("hidden");

            }
        );


    document
        .getElementById("confirmReject")
        ?.addEventListener(
            "click",
            async () => {

                if (!currentPublication) {
                    return;
                }


                const reason =
                    document
                        .getElementById(
                            "rejectReason"
                        )
                        .value
                        .trim();


                if (!reason) {

                    window.showToast?.(
                        "Укажите причину отклонения.",
                        "error"
                    );

                    return;

                }


                await changeStatus(
                    currentPublication.id,
                    "rejected",
                    reason
                );

            }
        );


    /* =========================
       EDIT
    ========================= */

    document
        .getElementById("editButton")
        ?.addEventListener(
            "click",
            () => {

                if (!currentPublication) {
                    return;
                }


                window.showToast?.(
                    "Редактирование будет доступно после подключения API редактирования.",
                    ""
                );

            }
        );


    /* =========================
       CHANGE STATUS
    ========================= */

    async function changeStatus(
        id,
        status,
        rejectionReason = ""
    ) {

        try {

            const response =
                await adminFetch(
                    `/api/admin/publications/${encodeURIComponent(id)}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                status,
                                rejectionReason
                            })
                    }
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Не удалось изменить статус."
                );

            }


            closeModal();


            window.showToast?.(
                status === "approved"
                    ? "Публикация одобрена."
                    : "Публикация отклонена.",
                status === "approved"
                    ? "success"
                    : "error"
            );


            await loadDashboard();

        }

        catch (error) {

            console.error(error);

            window.showToast?.(
                error.message ||
                "Ошибка.",
                "error"
            );

        }

    }


    /* =========================
       REJECT FROM LIST
    ========================= */

    function openRejectFromList() {

        const reason =
            prompt(
                "Введите причину отклонения:"
            );


        if (reason === null) {
            return;
        }


        if (!reason.trim()) {

            window.showToast?.(
                "Причина не может быть пустой.",
                "error"
            );

            return;

        }


        changeStatus(
            currentPublication.id,
            "rejected",
            reason.trim()
        );

    }


    /* =========================
       ADMIN FETCH
    ========================= */

    async function adminFetch(
        url,
        options = {}
    ) {

        const headers =
            new Headers(
                options.headers || {}
            );


        headers.set(
            "Authorization",
            `Bearer ${adminToken}`
        );


        return fetch(
            url,
            {
                ...options,
                headers
            }
        );

    }


    /* =========================
       SHOW DASHBOARD
    ========================= */

    function showDashboard() {

        loginSection.classList.add(
            "hidden"
        );

        dashboard.classList.remove(
            "hidden"
        );

    }


    /* =========================
       LOGIN ERROR
    ========================= */

    function showLoginError(message) {

        loginError.textContent =
            message;

        loginError.classList.remove(
            "hidden"
        );

    }


    function hideLoginError() {

        loginError.textContent = "";

        loginError.classList.add(
            "hidden"
        );

    }


    /* =========================
       LOGOUT
    ========================= */

    function logout() {

        sessionStorage.removeItem(
            "tajik_admin_token"
        );

        adminToken = null;

        dashboard.classList.add(
            "hidden"
        );

        loginSection.classList.remove(
            "hidden"
        );

    }


    /* =========================
       TEXT
    ========================= */

    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value;
        }

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g
