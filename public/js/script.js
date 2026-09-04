document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       YEAR
    ========================= */

    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* =========================
       MOBILE MENU
    ========================= */

    const menuToggle =
        document.getElementById("menuToggle");

    const mainNav =
        document.getElementById("mainNav");

    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", () => {
            mainNav.classList.toggle("open");
        });


        mainNav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
            });

        });

    }


    /* =========================
       TOAST
    ========================= */

    window.showToast = function(message, type = "") {

        const toast =
            document.getElementById("toast");

        if (!toast) return;

        toast.textContent = message;

        toast.className = "toast show";

        if (type) {
            toast.classList.add(type);
        }


        clearTimeout(window.toastTimer);

        window.toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 3500);

    };


    /* =========================
       HOME POSTS
    ========================= */

    const postsContainer =
        document.getElementById("postsContainer");

    if (postsContainer) {

        loadPublications();

        setupFilters();

        setupSearch();

    }


    /* =========================
       LOAD PUBLICATIONS
    ========================= */

    async function loadPublications() {

        try {

            postsContainer.innerHTML = `
                <div class="loading-card">
                    <div class="spinner"></div>
                    <p>Загрузка публикаций...</p>
                </div>
            `;


            const response =
                await fetch("/api/publications");


            if (!response.ok) {
                throw new Error("Ошибка загрузки");
            }


            const data =
                await response.json();


            const posts =
                Array.isArray(data)
                    ? data
                    : (data.publications || data.posts || []);


            window.allPublications = posts;

            renderPosts(posts);

        }

        catch (error) {

            console.error(error);

            postsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Не удалось загрузить публикации</h3>
                    <p>
                        Попробуйте обновить страницу.
                    </p>
                </div>
            `;

        }

    }


    /* =========================
       RENDER POSTS
    ========================= */

    function renderPosts(posts) {

        if (!posts.length) {

            postsContainer.innerHTML = "";

            const empty =
                document.getElementById("emptyPosts");

            if (empty) {
                empty.classList.remove("hidden");
            }

            return;
        }


        const empty =
            document.getElementById("emptyPosts");

        if (empty) {
            empty.classList.add("hidden");
        }


        postsContainer.innerHTML =
            posts.map(post => createPostCard(post)).join("");

    }


    /* =========================
       POST CARD
    ========================= */

    function createPostCard(post) {

        const category =
            getCategoryName(post.category);


        const date =
            formatDate(post.created_at || post.createdAt);


        const image =
            post.image || post.image_url;


        return `

            <article class="post-card">

                ${
                    image
                    ? `
                        <img
                            class="post-image"
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(post.title || "")}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >
                    `
                    : ""
                }


                <div class="post-content">

                    <span class="post-category">
                        ${category}
                    </span>


                    <h3>
                        ${escapeHTML(post.title || "Без названия")}
                    </h3>


                    <p>
                        ${escapeHTML(post.description || "")}
                    </p>


                    <div class="post-meta">

                        <span>
                            👤 ${escapeHTML(post.author_name || post.authorName || "Участник")}
                        </span>

                        <span>
                            ${date}
                        </span>

                    </div>

                </div>

            </article>

        `;

    }


    /* =========================
       FILTERS
    ========================= */

    function setupFilters() {

        const filters =
            document.querySelectorAll(".filter");


        filters.forEach(button => {

            button.addEventListener("click", () => {

                filters.forEach(item =>
                    item.classList.remove("active")
                );

                button.classList.add("active");


                const category =
                    button.dataset.category;


                let posts =
                    window.allPublications || [];


                if (category !== "all") {

                    posts =
                        posts.filter(post =>
                            post.category === category
                        );

                }


                renderPosts(posts);

            });

        });


        document
            .querySelectorAll(".category-card")
            .forEach(card => {

                card.addEventListener("click", () => {

                    const category =
                        card.dataset.category;


                    document
                        .querySelector(
                            `.filter[data-category="${category}"]`
                        )
                        ?.click();


                    document
                        .getElementById("news")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                });

            });


        document
            .getElementById("refreshPosts")
            ?.addEventListener(
                "click",
                loadPublications
            );

    }


    /* =========================
       SEARCH
    ========================= */

    function setupSearch() {

        const input =
            document.getElementById("searchInput");

        const clear =
            document.getElementById("clearSearch");


        if (!input) return;


        input.addEventListener("input", () => {

            const query =
                input.value.trim().toLowerCase();


            let posts =
                window.allPublications || [];


            if (query) {

                posts =
                    posts.filter(post => {

                        const text = [
                            post.title,
                            post.description,
                            post.author_name,
                            post.location,
                            post.category
                        ]
                        .join(" ")
                        .toLowerCase();


                        return text.includes(query);

                    });

            }


            renderPosts(posts);

        });


        clear?.addEventListener("click", () => {

            input.value = "";

            renderPosts(
                window.allPublications || []
            );

            input.focus();

        });

    }


    /* =========================
       CATEGORY NAME
    ========================= */

    window.getCategoryName = function(category) {

        const categories = {

            news: "📰 Новости",

            education: "🎓 Образование",

            work: "💼 Работа",

            opportunity: "🚀 Возможность",

            events: "📅 Мероприятия",

            volunteer: "🤝 Волонтёрство",

            technology: "💻 Технологии",

            connection: "📡 Связь",

            announcement: "📢 Объявление",

            other: "📌 Другое"

        };


        return categories[category] || "📌 Другое";

    };


    /* =========================
       DATE
    ========================= */

    window.formatDate = function(date) {

        if (!date) return "—";


        const d = new Date(date);


        if (Number.isNaN(d.getTime())) {
            return "—";
        }


        return d.toLocaleDateString(
            "ru-RU",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    };


    /* =========================
       ESCAPE HTML
    ========================= */

    window.escapeHTML = function(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    };


    window.escapeAttribute =
        window.escapeHTML;

});


/* =========================
   GLOBAL HELPERS
========================= */


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

                       }
