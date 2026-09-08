/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   CHAT UI CONTROLLER
   File: public/js/chat-ui.js
   Version: 2026.09.09 POWER CHAT UI

   Связывает интерфейс сайта с public/js/chat.js
   ============================================================ */

(() => {
  "use strict";

  const CONFIG = {
    CHAT_SELECTOR: "[data-chat]",

    BUTTONS: {
      OPEN_CHAT:
        "[data-open-chat]",

      CONTACT_ADMIN:
        "[data-contact-admin]",

      OPEN_SYSTEM:
        "[data-open-system-chat]",

      OPEN_PRIVATE:
        "[data-open-private-chat]",

      CLOSE:
        "[data-close-chat]",

      BACK:
        "[data-chat-back]",

      MINIMIZE:
        "[data-chat-minimize]"
    },

    STORAGE: {
      OPEN:
        "to_chat_ui_open_v1",

      MODE:
        "to_chat_ui_mode_v1"
    }
  };

  const state = {
    initialized: false,

    open: false,

    mode: "participant",

    mountedContainer: null,

    originalBodyOverflow: "",

    unreadCount: 0
  };


  /* ==========================================================
     HELPERS
     ========================================================== */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(
      root.querySelectorAll(selector)
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function storageGet(key, fallback = null) {
    try {
      const value =
        localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch {
      // Ignore unavailable storage.
    }
  }

  function dispatch(name, detail = {}) {
    document.dispatchEvent(
      new CustomEvent(
        name,
        { detail }
      )
    );
  }


  /* ==========================================================
     CHAT MODULE
     ========================================================== */

  function getChatModule() {
    return (
      window.TOChat ||
      window.Chat ||
      null
    );
  }


  /* ==========================================================
     FIND / CREATE CONTAINER
     ========================================================== */

  function findContainer() {
    return (
      $(CONFIG.CHAT_SELECTOR) ||
      $("#chat") ||
      $(".chat-page") ||
      $(".chat-container") ||
      null
    );
  }

  function createContainer() {
    let container =
      findContainer();

    if (container) {
      return container;
    }

    container =
      document.createElement("div");

    container.dataset.chat =
      "true";

    container.className =
      "to-chat-container";

    document.body.appendChild(
      container
    );

    return container;
  }


  /* ==========================================================
     OPEN / CLOSE
     ========================================================== */

  async function openChat(options = {}) {
    const chat =
      getChatModule();

    if (!chat) {
      console.error(
        "[TO Chat UI] TOChat is not loaded."
      );

      return false;
    }

    const container =
      createContainer();

    state.mountedContainer =
      container;

    state.originalBodyOverflow =
      document.body.style.overflow;

    state.open = true;

    document.body.classList.add(
      "to-chat-open"
    );

    container.classList.add(
      "is-open"
    );

    container.setAttribute(
      "aria-hidden",
      "false"
    );

    storageSet(
      CONFIG.STORAGE.OPEN,
      true
    );

    if (
      options.mode
    ) {
      state.mode =
        options.mode;

      storageSet(
        CONFIG.STORAGE.MODE,
        state.mode
      );

      if (
        typeof chat.setMode ===
        "function"
      ) {
        chat.setMode(
          state.mode
        );
      }
    }

    if (
      options.conversationId
    ) {
      await chat.openConversation(
        options.conversationId
      );
    }

    dispatch(
      "to:chat-ui:opened",
      {
        mode:
          state.mode,

        conversationId:
          options.conversationId ||
          null
      }
    );

    return true;
  }


  function closeChat() {
    const container =
      state.mountedContainer ||
      findContainer();

    state.open = false;

    document.body.classList.remove(
      "to-chat-open"
    );

    if (container) {
      container.classList.remove(
        "is-open"
      );

      container.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    document.body.style.overflow =
      state.originalBodyOverflow || "";

    storageSet(
      CONFIG.STORAGE.OPEN,
      false
    );

    dispatch(
      "to:chat-ui:closed"
    );
  }


  function toggleChat() {
    if (state.open) {
      closeChat();
    } else {
      openChat();
    }
  }


  /* ==========================================================
     OPEN PRIVATE ADMIN CHAT
     ========================================================== */

  async function openAdminChat(
    options = {}
  ) {
    const chat =
      getChatModule();

    if (!chat) {
      return false;
    }

    await openChat({
      mode: "participant"
    });

    if (
      typeof chat.openAdminChat ===
      "function"
    ) {
      await chat.openAdminChat({
        anonymous:
          options.anonymous === true,

        source:
          options.source ||
          "contact_admin",

        target:
          options.target ||
          "admin",

        participantId:
          options.participantId ||
          null
      });
    } else if (
      typeof chat.createAdminConversation ===
      "function"
    ) {
      await chat.createAdminConversation({
        anonymous:
          options.anonymous === true,

        source:
          options.source ||
          "contact_admin"
      });
    }

    dispatch(
      "to:chat-ui:admin-opened"
    );

    return true;
  }


  /* ==========================================================
     OPEN SYSTEM CHAT
     ========================================================== */

  async function openSystemChat() {
    const chat =
      getChatModule();

    if (!chat) {
      return false;
    }

    await openChat();

    const conversations =
      typeof chat.getConversations ===
      "function"
        ? chat.getConversations()
        : [];

    const systemConversation =
      conversations.find(
        (conversation) =>
          conversation?.type ===
          "system"
      );

    if (
      systemConversation &&
      typeof chat.openConversation ===
      "function"
    ) {
      await chat.openConversation(
        systemConversation.id
      );

      return true;
    }

    /*
     * Если системного диалога ещё нет
     * в списке, запрашиваем его через
     * сервер.
     */

    try {
      if (
        typeof chat.request ===
        "function"
      ) {
        const response =
          await chat.request(
            "/api/chat/conversations/system"
          );

        const conversation =
          response?.conversation ||
          response?.data ||
          response;

        if (
          conversation?.id &&
          typeof chat.openConversation ===
          "function"
        ) {
          await chat.openConversation(
            conversation.id
          );
        }
      }
    } catch (error) {
      console.error(
        "[TO Chat UI] system chat:",
        error
      );
    }

    return true;
  }


  /* ==========================================================
     OPEN PRIVATE EXISTING CHAT
     ========================================================== */

  async function openPrivateChat(
    conversationId
  ) {
    const chat =
      getChatModule();

    if (!chat) {
      return false;
    }

    await openChat();

    if (
      conversationId &&
      typeof chat.openConversation ===
      "function"
    ) {
      await chat.openConversation(
        conversationId
      );

      return true;
    }

    return openAdminChat({
      source:
        "private_chat_button"
    });
  }


  /* ==========================================================
     BUTTON HANDLERS
     ========================================================== */

  function bindButtons() {
    $all(
      CONFIG.BUTTONS.OPEN_CHAT
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            toggleChat();
          }
        );
      }
    );


    $all(
      CONFIG.BUTTONS.CONTACT_ADMIN
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          async (event) => {
            event.preventDefault();

            await openAdminChat({
              anonymous:
                button.dataset.anonymous ===
                "true",

              source:
                button.dataset.source ||
                "contact_admin"
            });
          }
        );
      }
    );


    $all(
      CONFIG.BUTTONS.OPEN_SYSTEM
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          async (event) => {
            event.preventDefault();

            await openSystemChat();
          }
        );
      }
    );


    $all(
      CONFIG.BUTTONS.OPEN_PRIVATE
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          async (event) => {
            event.preventDefault();

            await openPrivateChat(
              button.dataset.conversationId ||
              null
            );
          }
        );
      }
    );


    bindDynamicCloseButtons();
  }


  function bindDynamicCloseButtons() {
    $all(
      CONFIG.BUTTONS.CLOSE
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            closeChat();
          }
        );
      }
    );


    $all(
      CONFIG.BUTTONS.BACK
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            dispatch(
              "to:chat-ui:back"
            );
          }
        );
      }
    );


    $all(
      CONFIG.BUTTONS.MINIMIZE
    ).forEach(
      (button) => {
        if (
          button.dataset.toChatUiBound
        ) {
          return;
        }

        button.dataset.toChatUiBound =
          "1";

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            minimizeChat();
          }
        );
      }
    );
  }


  /* ==========================================================
     MINIMIZE
     ========================================================== */

  function minimizeChat() {
    const container =
      state.mountedContainer ||
      findContainer();

    if (!container) {
      return;
    }

    container.classList.toggle(
      "is-minimized"
    );

    const minimized =
      container.classList.contains(
        "is-minimized"
      );

    dispatch(
      "to:chat-ui:minimized",
      {
        minimized
      }
    );
  }


  /* ==========================================================
     UNREAD BADGES
     ========================================================== */

  function updateUnreadBadge(
    count
  ) {
    const numeric =
      Math.max(
        0,
        Number(count || 0)
      );

    state.unreadCount =
      numeric;

    $all(
      "[data-chat-unread-count]"
    ).forEach(
      (element) => {
        element.textContent =
          numeric > 99
            ? "99+"
            : String(numeric);

        element.hidden =
          numeric === 0;
      }
    );

    $all(
      "[data-chat-unread-badge-global]"
    ).forEach(
      (element) => {
        element.textContent =
          numeric > 99
            ? "99+"
            : String(numeric);

        element.hidden =
          numeric === 0;
      }
    );

    $all(
      "[data-open-chat]"
    ).forEach(
      (button) => {
        if (numeric > 0) {
          button.classList.add(
            "has-unread"
          );

          button.setAttribute(
            "data-unread",
            String(numeric)
          );
        } else {
          button.classList.remove(
            "has-unread"
          );

          button.removeAttribute(
            "data-unread"
          );
        }
      }
    );

    document.title =
      numeric > 0
        ? `(${numeric > 99 ? "99+" : numeric}) Tajik Opportunities`
        : document.title;
  }


  /* ==========================================================
     CHAT EVENTS
     ========================================================== */

  function bindChatEvents() {
    document.addEventListener(
      "to:chat:unread-changed",
      (event) => {
        updateUnreadBadge(
          event.detail?.count || 0
        );
      }
    );


    document.addEventListener(
      "to:chat:ready",
      (event) => {
        const chatState =
          event.detail?.state;

        if (
          chatState
        ) {
          updateUnreadBadge(
            chatState.unreadCount ||
            0
          );
        }

        bindDynamicCloseButtons();
      }
    );


    document.addEventListener(
      "to:chat:conversation-opened",
      () => {
        bindDynamicCloseButtons();

        const container =
          state.mountedContainer ||
          findContainer();

        container?.classList.remove(
          "is-minimized"
        );
      }
    );


    document.addEventListener(
      "to:chat-ui:back",
      () => {
        /*
         * На мобильном интерфейсе можно
         * вернуться к списку диалогов.
         */
        const container =
          state.mountedContainer ||
          findContainer();

        if (container) {
          container.classList.add(
            "show-sidebar"
          );
        }
      }
    );


    document.addEventListener(
      "to:chat:messages-received",
      (event) => {
        const messages =
          event.detail?.messages ||
          [];

        if (
          document.hidden &&
          messages.length
        ) {
          updateUnreadBadge(
            state.unreadCount +
            messages.length
          );
        }
      }
    );


    document.addEventListener(
      "to:chat:message-sent",
      () => {
        bindDynamicCloseButtons();
      }
    );
  }


  /* ==========================================================
     KEYBOARD
     ========================================================== */

  function bindKeyboard() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          state.open
        ) {
          const modal =
            $(
              "[data-to-chat-forward-dialog]"
            );

          if (modal) {
            modal.remove();
            return;
          }

          const picker =
            $(
              "[data-to-chat-reaction-picker]"
            );

          if (picker) {
            picker.remove();
            return;
          }

          const menu =
            $(
              "[data-to-chat-menu]"
            );

          if (menu) {
            menu.remove();
            return;
          }

          closeChat();
        }
      }
    );
  }


  /* ==========================================================
     OUTSIDE CLICK
     ========================================================== */

  function bindOutsidePopups() {
    document.addEventListener(
      "click",
      (event) => {
        const popupSelectors = [
          "[data-to-chat-menu]",
          "[data-to-chat-reaction-picker]",
          "[data-to-chat-forward-dialog]"
        ];

        popupSelectors.forEach(
          (selector) => {
            const popup =
              $(selector);

            if (
              !popup ||
              popup.contains(
                event.target
              )
            ) {
              return;
            }

            /*
             * Не закрываем модальные
             * окна случайно при клике
             * внутри самого чата.
             */
          }
        );
      }
    );
  }


  /* ==========================================================
     MOBILE BEHAVIOR
     ========================================================== */

  function setupResponsiveState() {
    const media =
      window.matchMedia(
        "(max-width: 760px)"
      );

    const update =
      () => {
        const container =
          state.mountedContainer ||
          findContainer();

        if (!container) {
          return;
        }

        if (media.matches) {
          container.classList.add(
            "is-mobile"
          );
        } else {
          container.classList.remove(
            "is-mobile"
          );
        }
      };

    update();

    if (
      typeof media.addEventListener ===
      "function"
    ) {
      media.addEventListener(
        "change",
        update
      );
    } else if (
      typeof media.addListener ===
      "function"
    ) {
      media.addListener(
        update
      );
    }
  }


  /* ==========================================================
     AUTO OPEN
     ========================================================== */

  async function restoreState() {
    const shouldOpen =
      storageGet(
        CONFIG.STORAGE.OPEN,
        false
      );

    const mode =
      storageGet(
        CONFIG.STORAGE.MODE,
        "participant"
      );

    state.mode =
      mode || "participant";

    if (
      shouldOpen === true
    ) {
      await openChat({
        mode:
          state.mode
      });
    }
  }


  /* ==========================================================
     PUBLIC HELPERS
     ========================================================== */

  async function contactAdmin(
    options = {}
  ) {
    return openAdminChat(
      options
    );
  }

  async function showSystemNotifications() {
    return openSystemChat();
  }

  async function openConversation(
    conversationId
  ) {
    return openPrivateChat(
      conversationId
    );
  }


  /* ==========================================================
     INIT
     ========================================================== */

  async function init(
    options = {}
  ) {
    if (
      state.initialized &&
      !options.force
    ) {
      return api;
    }

    state.initialized =
      true;

    state.mode =
      options.mode ||
      storageGet(
        CONFIG.STORAGE.MODE,
        "participant"
      );

    const container =
      createContainer();

    state.mountedContainer =
      container;

    /*
     * Сам chat.js отвечает за
     * внутреннюю разметку чата.
     */
    const chat =
      getChatModule();

    if (chat) {
      if (
        typeof chat.setMode ===
        "function"
      ) {
        chat.setMode(
          state.mode
        );
      }

      if (
        typeof chat.init ===
        "function"
      ) {
        await chat.init({
          mode:
            state.mode,

          conversationId:
            options.conversationId ||
            null,

          force:
            options.force === true
        });
      }
    }

    bindButtons();
    bindChatEvents();
    bindKeyboard();
    bindOutsidePopups();
    setupResponsiveState();

    if (
      options.open === true
    ) {
      await openChat({
        conversationId:
          options.conversationId ||
          null,

        mode:
          state.mode
      });
    } else if (
      options.restore !== false
    ) {
      await restoreState();
    }

    dispatch(
      "to:chat-ui:ready",
      {
        state
      }
    );

    return api;
  }


  /* ==========================================================
     DESTROY
     ========================================================== */

  function destroy() {
    state.initialized =
      false;

    state.open =
      false;

    document.body.classList.remove(
      "to-chat-open"
    );
  }


  /* ==========================================================
     API
     ========================================================== */

  const api = {
    init,

    destroy,

    openChat,

    closeChat,

    toggleChat,

    openAdminChat,

    contactAdmin,

    openSystemChat,

    showSystemNotifications,

    openPrivateChat,

    openConversation,

    minimizeChat,

    updateUnreadBadge,

    getState() {
      return {
        ...state
      };
    },

    config:
      CONFIG
  };


  /* ==========================================================
     GLOBALS
     ========================================================== */

  window.TOChatUI =
    api;

  window.ChatUI =
    api;


  /* ==========================================================
     AUTO INIT
     ========================================================== */

  function boot() {
    /*
     * Если chat.js ещё не загружен,
     * UI всё равно ждёт короткое время.
     */
    if (
      !window.TOChat &&
      !window.Chat
    ) {
      setTimeout(
        boot,
        100
      );

      return;
    }

    init();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {
        once: true
      }
    );
  } else {
    boot();
  }

})();
