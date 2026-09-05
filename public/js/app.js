/* ============================================================
   TAJIK OPPORTUNITIES
   Global frontend utilities
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     MOBILE MENU
     ========================================================== */

  function initMobileMenu() {
    const button = document.querySelector(".mobile-menu-button");
    const nav = document.querySelector(".site-nav");

    if (!button || !nav) return;

    button.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      button.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("no-scroll", isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;

      if (
        !nav.contains(event.target) &&
        !button.contains(event.target)
      ) {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      }
    });
  }

  /* ==========================================================
     ESCAPE KEY
     ========================================================== */

  function initEscapeKey() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      document
        .querySelectorAll(".modal.show")
        .forEach((modal) => {
          modal.classList.remove("show");
        });

      document.body.classList.remove("no-scroll");

      const nav = document.querySelector(".site-nav");
      const button = document.querySelector(".mobile-menu-button");

      if (nav) nav.classList.remove("open");

      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ==========================================================
     MODALS
     ========================================================== */

  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const modalId = trigger.getAttribute("data-modal-open");
        const modal = document.getElementById(modalId);

        if (!modal) return;

        modal.classList.add("show");
        document.body.classList.add("no-scroll");
      });
    });

    document.querySelectorAll("[data-modal-close]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const modal = trigger.closest(".modal");

        if (!modal) return;

        modal.classList.remove("show");
        document.body.classList.remove("no-scroll");
      });
    });

    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target !== modal) return;

        modal.classList.remove("show");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  /* ==========================================================
     TOAST
     ========================================================== */

  function showToast(message, type = "success") {
    let toast = document.querySelector(".toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  /* ==========================================================
     COPY TO CLIPBOARD
     ========================================================== */

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Скопировано", "success");
      return true;
    } catch {
      showToast("Не удалось скопировать", "error");
      return false;
    }
  }

  function initCopyButtons() {
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        const value = button.getAttribute("data-copy");

        if (!value) return;

        await copyText(value);
      });
    });
  }

  /* ==========================================================
     EXTERNAL LINKS
     ========================================================== */

  function initExternalLinks() {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");

      if (!href) return;

      if (
        href.startsWith("http://") ||
        href.startsWith("https://")
      ) {
        try {
          const url = new URL(href, window.location.href);

          if (url.origin !== window.location.origin) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
          }
        } catch {
          // Ignore invalid URLs.
        }
      }
    });
  }

  /* ==========================================================
     IMAGE ERROR HANDLING
     ========================================================== */

  function initImageFallbacks() {
    document.querySelectorAll("img").forEach((image) => {
      image.addEventListener("error", () => {
        image.classList.add("image-error");
      });
    });
  }

  /* ==========================================================
     CURRENT YEAR
     ========================================================== */

  function initCurrentYear() {
    const year = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = year;
    });
  }

  /* ==========================================================
     INITIALIZATION
     ========================================================== */

  function init() {
    initMobileMenu();
    initEscapeKey();
    initModals();
    initCopyButtons();
    initExternalLinks();
    initImageFallbacks();
    initCurrentYear();

    window.TajikOpportunities = {
      showToast,
      copyText
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
