/* =========================================
   TAJIK OPPORTUNITIES
   Main JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuButton = document.getElementById("menuButton");
    const mainNav = document.getElementById("mainNav");

    if (menuButton && mainNav) {

        menuButton.addEventListener("click", () => {

            mainNav.classList.toggle("open");

            const isOpen = mainNav.classList.contains("open");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuButton.textContent = isOpen ? "✕" : "☰";
        });


        mainNav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                mainNav.classList.remove("open");

                menuButton.textContent = "☰";

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });
    }


    /* =====================================
       SMOOTH SCROLL
    ===================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#" ||
                targetId.length < 2
            ) {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================
       ALL NEWS BUTTON
    ===================================== */

    const allNewsButton =
        document.getElementById("allNewsButton");

    if (allNewsButton) {

        allNewsButton.addEventListener("click", () => {

            const newsSection =
                document.getElementById("news");

            if (newsSection) {

                newsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    }


    /* =====================================
       HEADER SHADOW ON SCROLL
    ===================================== */

    const header =
        document.querySelector(".site-header");

    if (header) {

        const updateHeader = () => {

            if (window.scrollY > 10) {

                header.style.boxShadow =
                    "0 8px 25px rgba(15, 23, 42, 0.07)";

            } else {

                header.style.boxShadow = "none";

            }

        };

        updateHeader();

        window.addEventListener(
            "scroll",
            updateHeader,
            { passive: true }
        );

    }


    /* =====================================
       SIMPLE REVEAL ANIMATION
    ===================================== */

    const animatedElements =
        document.querySelectorAll(
            ".news-card, .news-item, " +
            ".operator-card, .technology-card, " +
            ".opportunity-card, " +
            ".education-card"
        );

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.08
                }
            );

        animatedElements.forEach(element => {

            element.classList.add(
                "reveal"
            );

            observer.observe(element);

        });

    }


    /* =====================================
       CURRENT YEAR
    ===================================== */

    const year =
        document.querySelector(
            ".footer-bottom span:first-child"
        );

    if (year) {

        year.textContent =
            `© ${new Date().getFullYear()} Tajik Opportunities`;

    }


    /* =====================================
       CONSOLE MESSAGE
    ===================================== */

    console.log(
        "🇹🇯 Tajik Opportunities loaded successfully."
    );

});
