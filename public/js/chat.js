/* ============================================================
   🇹🇯 TAJIK OPPORTUNITIES
   PUBLIC CHAT SYSTEM
   File: public/js/chat.js
   Version: 2026.09.09 POWER CHAT

   PURPOSE
   ------------------------------------------------------------
   Полноценный клиентский модуль чата:

   • приватный чат участник ↔ администрация
   • официальный системный чат
   • анонимный/гостевой режим
   • отдельные диалоги
   • сообщения
   • ответы
   • редактирование
   • удаление
   • реакции
   • закрепление
   • пересылка
   • вложения
   • фото / видео / аудио / voice / документы
   • прочитано / доставлено
   • typing
   • online / last seen
   • поиск
   • черновики
   • непрочитанные
   • уведомления
   • внутренние заметки администратора
   • admin acting mode
   • системные уведомления
   • безопасная обработка HTML
   • совместимость с будущим Worker API

   IMPORTANT
   ------------------------------------------------------------
   Этот файл не хранит сообщения как источник истины.
   Все сообщения и состояния должны храниться на сервере/D1.

   LocalStorage используется только для:
   • черновиков
   • UI-настроек
   • временного состояния
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIG
     ========================================================== */

  const CONFIG = {
    APP_NAME: "Tajik Opportunities",

    API: {
      conversations: "/api/chat/conversations",
      conversation: (id) =>
        `/api/chat/conversations/${encodeURIComponent(id)}`,

      messages: (id) =>
        `/api/chat/conversations/${encodeURIComponent(id)}/messages`,

      message: (id) =>
        `/api/chat/messages/${encodeURIComponent(id)}`,

      messageReaction: (id) =>
        `/api/chat/messages/${encodeURIComponent(id)}/reactions`,

      messageRead: (id) =>
        `/api/chat/messages/${encodeURIComponent(id)}/read`,

      typing: (id) =>
        `/api/chat/conversations/${encodeURIComponent(id)}/typing`,

      presence: (id) =>
        `/api/chat/conversations/${encodeURIComponent(id)}/presence`,

      search: "/api/chat/search",

      upload: "/api/chat/upload",

      participants: "/api/chat/participants",

      profile: "/api/profile",

      notifications: "/api/notifications"
    },

    STORAGE: {
      DRAFTS: "to_chat_drafts_v1",
      ACTIVE_CONVERSATION: "to_chat_active_conversation_v1",
      MODE: "to_chat_mode_v1",
      UI: "to_chat_ui_v1"
    },

    POLLING: {
      MESSAGES: 4000,
      CONVERSATIONS: 6000,
      PRESENCE: 15000,
      TYPING: 2500
    },

    MESSAGE_LIMIT: 50,

    MAX_MESSAGE_LENGTH: 10000,

    MAX_SEARCH_LENGTH: 200,

    MAX_ATTACHMENTS: 20,

    SUPPORTED_ATTACHMENT_TYPES: [
      "image/*",
      "video/*",
      "audio/*",
      "application/pdf",
      "application/zip",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/octet-stream"
    ],

    MESSAGE_TYPES: {
      TEXT: "text",
      IMAGE: "image",
      VIDEO: "video",
      AUDIO: "audio",
      VOICE: "voice",
      FILE: "file",
      SYSTEM: "system",
      ADMIN_NOTE: "admin_note"
    },

    CONVERSATION_TYPES: {
      PRIVATE: "private",
      SYSTEM: "system",
      ADMIN: "admin"
    },

    USER_ROLES: {
      PARTICIPANT: "participant",
      ADMIN: "admin",
      SUPERADMIN: "superadmin",
      MODERATOR: "moderator",
      SUPPORT: "support"
    },

    SYSTEM_SENDER: {
      NAME: "🇹🇯 𝑻𝒂𝒋𝒊𝒌 𝑶𝒑𝒑𝒐𝒓𝒕𝒖𝒏𝒊𝒕𝒊𝒆𝒔 ✓",
      USERNAME: "tajik_opportunities",
      VERIFIED: true
    }
  };


  /* ==========================================================
     STATE
     ========================================================== */

  const state = {
    initialized: false,

    mode: "participant",

    currentUser: null,

    currentProfile: null,

    activeConversationId: null,

    activeConversation: null,

    conversations: [],

    messages: [],

    totalMessages: 0,

    hasMoreMessages: false,

    loadingConversations: false,

    loadingMessages: false,

    sending: false,

    searching: false,

    uploading: false,

    unreadCount: 0,

    unreadByConversation: {},

    typingUsers: {},

    presence: {},

    drafts: {},

    pendingReply: null,

    pendingEdit: null,

    pendingForward: null,

    pendingAttachments: [],

    selectedMessageIds: [],

    searchQuery: "",

    searchResults: [],

    messageSearchResults: [],

    lastMessageId: null,

    lastConversationUpdatedAt: null,

    polling: {
      messages: null,
      conversations: null,
      presence: null,
      typing: null
    },

    observers: [],

    ui: {
      mounted: false,
      container: null,
      list: null,
      header: null,
      messages: null,
      composer: null,
      search: null,
      badge: null
    }
  };


  /* ==========================================================
     GENERIC HELPERS
     ========================================================== */

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value)
      .replace(/`/g, "&#096;");
  }

  function normalizeText(value) {
    return String(value ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  function truncate(value, length = 100) {
    const text = String(value ?? "");

    if (text.length <= length) {
      return text;
    }

    return `${text.slice(0, Math.max(0, length - 1))}…`;
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatDateTime(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatBytes(bytes) {
    const value = Number(bytes);

    if (!Number.isFinite(value) || value < 0) {
      return "";
    }

    if (value < 1024) {
      return `${value} Б`;
    }

    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} КБ`;
    }

    if (value < 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
    }

    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} ГБ`;
  }

  function isAdminMode() {
    return [
      CONFIG.USER_ROLES.ADMIN,
      CONFIG.USER_ROLES.SUPERADMIN,
      CONFIG.USER_ROLES.MODERATOR,
      CONFIG.USER_ROLES.SUPPORT
    ].includes(state.mode);
  }

  function isSystemConversation(conversation) {
    return conversation?.type === CONFIG.CONVERSATION_TYPES.SYSTEM;
  }

  function isPrivateConversation(conversation) {
    return conversation?.type === CONFIG.CONVERSATION_TYPES.PRIVATE;
  }

  function getConversationId(conversation) {
    return (
      conversation?.id ||
      conversation?.conversation_id ||
      conversation?.public_id ||
      null
    );
  }

  function getMessageId(message) {
    return (
      message?.id ||
      message?.message_id ||
      message?.public_id ||
      null
    );
  }

  function getMessageText(message) {
    return (
      message?.text ??
      message?.content ??
      message?.body ??
      ""
    );
  }

  function getMessageCreatedAt(message) {
    return (
      message?.created_at ||
      message?.createdAt ||
      message?.timestamp ||
      null
    );
  }

  function getAuthorName(message) {
    if (
      message?.is_system ||
      message?.sender_type === "system"
    ) {
      return CONFIG.SYSTEM_SENDER.NAME;
    }

    return (
      message?.author_name ||
      message?.sender_name ||
      message?.username ||
      "Пользователь"
    );
  }

  function getAuthorAvatar(message) {
    return (
      message?.author_avatar ||
      message?.sender_avatar ||
      message?.avatar ||
      ""
    );
  }

  function isOwnMessage(message) {
    if (message?.is_mine === true) {
      return true;
    }

    if (
      state.currentProfile?.id &&
      message?.sender_profile_id
    ) {
      return (
        String(message.sender_profile_id) ===
        String(state.currentProfile.id)
      );
    }

    if (
      state.currentProfile?.username &&
      message?.sender_username
    ) {
      return (
        String(message.sender_username).toLowerCase() ===
        String(state.currentProfile.username).toLowerCase()
      );
    }

    return false;
  }


  /* ==========================================================
     STORAGE
     ========================================================== */

  function loadStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return safeJsonParse(value, fallback);
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in privacy mode.
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  }

  function loadDrafts() {
    state.drafts = loadStorage(
      CONFIG.STORAGE.DRAFTS,
      {}
    );
  }

  function saveDraft(conversationId, text) {
    if (!conversationId) {
      return;
    }

    const value = String(text ?? "");

    if (!value.trim()) {
      delete state.drafts[conversationId];
    } else {
      state.drafts[conversationId] = value;
    }

    saveStorage(
      CONFIG.STORAGE.DRAFTS,
      state.drafts
    );
  }

  function getDraft(conversationId) {
    return state.drafts[conversationId] || "";
  }

  function loadUiState() {
    const ui = loadStorage(
      CONFIG.STORAGE.UI,
      {}
    );

    if (
      ui &&
      typeof ui === "object"
    ) {
      state.uiState = ui;
    }
  }


  /* ==========================================================
     API
     ========================================================== */

  async function request(
    url,
    options = {}
  ) {
    const method =
      options.method ||
      "GET";

    const headers = {
      Accept: "application/json",
      ...(options.headers || {})
    };

    let body = options.body;

    if (
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob)
    ) {
      headers["Content-Type"] =
        "application/json";

      body = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include",
      cache: "no-store"
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = text
        ? { data: text }
        : {};
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
        data?.error ||
        `HTTP ${response.status}`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }


  /* ==========================================================
     NORMALIZATION
     ========================================================== */

  function normalizeConversation(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    return {
      ...item,

      id: getConversationId(item),

      type:
        item.type ||
        CONFIG.CONVERSATION_TYPES.PRIVATE,

      title:
        item.title ||
        item.name ||
        (
          item.type === CONFIG.CONVERSATION_TYPES.SYSTEM
            ? CONFIG.SYSTEM_SENDER.NAME
            : "Администрация"
        ),

      unread_count:
        Number(
          item.unread_count ??
          item.unread ??
          0
        ),

      last_message:
        item.last_message ||
        null,

      updated_at:
        item.updated_at ||
        item.last_message_at ||
        item.created_at ||
        null
    };
  }

  function normalizeMessage(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    return {
      ...item,

      id: getMessageId(item),

      text: getMessageText(item),

      created_at: getMessageCreatedAt(item),

      type:
        item.type ||
        CONFIG.MESSAGE_TYPES.TEXT,

      sender_name:
        getAuthorName(item),

      sender_avatar:
        getAuthorAvatar(item),

      reactions:
        Array.isArray(item.reactions)
          ? item.reactions
          : [],

      attachments:
        Array.isArray(item.attachments)
          ? item.attachments
          : [],

      reply_to:
        item.reply_to ||
        item.reply_message ||
        null,

      is_deleted:
        Boolean(
          item.is_deleted ||
          item.deleted
        ),

      is_edited:
        Boolean(
          item.is_edited ||
          item.edited
        ),

      is_pinned:
        Boolean(
          item.is_pinned ||
          item.pinned
        )
    };
  }


  /* ==========================================================
     CURRENT PROFILE
     ========================================================== */

  async function loadCurrentProfile() {
    try {
      const response =
        await request(
          CONFIG.API.profile
        );

      state.currentProfile =
        response?.profile ||
        response?.data ||
        response ||
        null;

      return state.currentProfile;
    } catch {
      return null;
    }
  }


  /* ==========================================================
     CONVERSATIONS
     ========================================================== */

  async function loadConversations(
    options = {}
  ) {
    if (state.loadingConversations) {
      return state.conversations;
    }

    state.loadingConversations = true;

    try {
      const params =
        new URLSearchParams();

      if (isAdminMode()) {
        params.set(
          "admin",
          "1"
        );
      }

      if (options.search) {
        params.set(
          "search",
          options.search
        );
      }

      if (options.unreadOnly) {
        params.set(
          "unread",
          "1"
        );
      }

      const url =
        `${CONFIG.API.conversations}` +
        (
          params.toString()
            ? `?${params.toString()}`
            : ""
        );

      const response =
        await request(url);

      const list =
        response?.conversations ||
        response?.data ||
        response?.items ||
        [];

      state.conversations =
        Array.isArray(list)
          ? list
              .map(normalizeConversation)
              .filter(Boolean)
          : [];

      state.unreadCount =
        Number(
          response?.unread_count ??
          response?.unread ??
          state.conversations.reduce(
            (sum, item) =>
              sum +
              Number(item.unread_count || 0),
            0
          )
        );

      state.unreadByConversation = {};

      state.conversations.forEach(
        (conversation) => {
          state.unreadByConversation[
            conversation.id
          ] = Number(
            conversation.unread_count || 0
          );
        }
      );

      renderConversationList();
      updateGlobalBadges();

      return state.conversations;
    } catch (error) {
      console.error(
        "[TO Chat] conversations:",
        error
      );

      showError(
        "Не удалось загрузить список чатов."
      );

      return [];
    } finally {
      state.loadingConversations = false;
    }
  }


  async function createAdminConversation(
    options = {}
  ) {
    const body = {
      type:
        CONFIG.CONVERSATION_TYPES.PRIVATE,

      target:
        options.target ||
        "admin",

      participant_id:
        options.participantId ||
        state.currentProfile?.id ||
        null,

      anonymous:
        options.anonymous === true,

      source:
        options.source ||
        "user_contact_admin"
    };

    const response =
      await request(
        CONFIG.API.conversations,
        {
          method: "POST",
          body
        }
      );

    const conversation =
      normalizeConversation(
        response?.conversation ||
        response?.data ||
        response
      );

    if (conversation?.id) {
      const exists =
        state.conversations.some(
          (item) =>
            String(item.id) ===
            String(conversation.id)
        );

      if (!exists) {
        state.conversations.unshift(
          conversation
        );
      }

      await openConversation(
        conversation.id
      );
    }

    return conversation;
  }


  /* ==========================================================
     OPEN CONVERSATION
     ========================================================== */

  async function openConversation(
    conversationId,
    options = {}
  ) {
    if (!conversationId) {
      return null;
    }

    state.activeConversationId =
      String(conversationId);

    saveStorage(
      CONFIG.STORAGE.ACTIVE_CONVERSATION,
      state.activeConversationId
    );

    const existing =
      state.conversations.find(
        (item) =>
          String(item.id) ===
          String(conversationId)
      );

    state.activeConversation =
      existing || null;

    renderChatShell();
    renderConversationHeader();

    await loadMessages(
      conversationId,
      {
        reset: true,
        scroll:
          options.scroll !== false
      }
    );

    await markConversationRead(
      conversationId
    );

    startMessagePolling();
    startPresencePolling();
    startTypingPolling();

    dispatch(
      "to:chat:conversation-opened",
      {
        conversation:
          state.activeConversation
      }
    );

    return state.activeConversation;
  }


  /* ==========================================================
     MESSAGES
     ========================================================== */

  async function loadMessages(
    conversationId,
    options = {}
  ) {
    if (
      state.loadingMessages &&
      !options.force
    ) {
      return state.messages;
    }

    state.loadingMessages = true;

    try {
      const params =
        new URLSearchParams();

      params.set(
        "limit",
        String(
          options.limit ||
          CONFIG.MESSAGE_LIMIT
        )
      );

      if (options.before) {
        params.set(
          "before",
          options.before
        );
      }

      if (options.after) {
        params.set(
          "after",
          options.after
        );
      }

      const url =
        `${CONFIG.API.messages(conversationId)}` +
        `?${params.toString()}`;

      const response =
        await request(url);

      const raw =
        response?.messages ||
        response?.data ||
        response?.items ||
        [];

      const messages =
        Array.isArray(raw)
          ? raw
              .map(normalizeMessage)
              .filter(Boolean)
          : [];

      if (
        options.reset ||
        !options.before
      ) {
        state.messages =
          messages;

        state.totalMessages =
          Number(
            response?.total ??
            messages.length
          );
      } else {
        state.messages = [
          ...messages,
          ...state.messages
        ];
      }

      state.hasMoreMessages =
        Boolean(
          response?.has_more ??
          response?.hasMore ??
          (
            messages.length >=
            Number(
              options.limit ||
              CONFIG.MESSAGE_LIMIT
            )
          )
        );

      renderMessages();

      if (options.scroll !== false) {
        requestAnimationFrame(
          scrollMessagesToBottom
        );
      }

      return state.messages;
    } catch (error) {
      console.error(
        "[TO Chat] messages:",
        error
      );

      showError(
        "Не удалось загрузить сообщения."
      );

      return [];
    } finally {
      state.loadingMessages = false;
    }
  }


  async function loadOlderMessages() {
    if (
      !state.activeConversationId ||
      !state.messages.length ||
      !state.hasMoreMessages
    ) {
      return;
    }

    const first =
      state.messages[0];

    const container =
      state.ui.messages;

    const oldHeight =
      container?.scrollHeight || 0;

    await loadMessages(
      state.activeConversationId,
      {
        before:
          getMessageId(first),
        reset: false,
        scroll: false
      }
    );

    if (container) {
      const newHeight =
        container.scrollHeight;

      container.scrollTop =
        newHeight - oldHeight;
    }
  }


  /* ==========================================================
     SEND MESSAGE
     ========================================================== */

  async function sendMessage(
    text = null,
    options = {}
  ) {
    if (
      !state.activeConversationId
    ) {
      return null;
    }

    const conversation =
      state.activeConversation;

    if (
      isSystemConversation(
        conversation
      ) &&
      !isAdminMode()
    ) {
      showError(
        "В официальный системный чат нельзя отправлять сообщения."
      );

      return null;
    }

    const composer =
      state.ui.composer;

    const input =
      composer
        ? $(
            "[data-chat-input]",
            composer
          )
        : null;

    const messageText =
      normalizeText(
        text !== null
          ? text
          : input?.value || ""
      );

    const attachments =
      Array.isArray(
        options.attachments
      )
        ? options.attachments
        : state.pendingAttachments;

    if (
      !messageText &&
      attachments.length === 0
    ) {
      return null;
    }

    if (
      messageText.length >
      CONFIG.MAX_MESSAGE_LENGTH
    ) {
      showError(
        `Сообщение слишком длинное. Максимум ${CONFIG.MAX_MESSAGE_LENGTH} символов.`
      );

      return null;
    }

    if (state.sending) {
      return null;
    }

    state.sending = true;

    const body = {
      text: messageText,

      type:
        options.type ||
        (
          attachments.length
            ? attachments[0]?.type ||
              CONFIG.MESSAGE_TYPES.FILE
            : CONFIG.MESSAGE_TYPES.TEXT
        ),

      attachments,

      reply_to:
        options.replyTo ||
        state.pendingReply?.id ||
        null,

      forwarded_from:
        options.forwardedFrom ||
        null,

      anonymous:
        options.anonymous === true,

      acting_as_profile_id:
        isAdminMode()
          ? (
              options.actingAsProfileId ||
              null
            )
          : null
    };

    try {
      const response =
        await request(
          CONFIG.API.messages(
            state.activeConversationId
          ),
          {
            method: "POST",
            body
          }
        );

      const message =
        normalizeMessage(
          response?.message ||
          response?.data ||
          response
        );

      if (message) {
        state.messages.push(
          message
        );

        state.lastMessageId =
          getMessageId(message);

        renderMessages();

        requestAnimationFrame(
          scrollMessagesToBottom
        );

        updateConversationPreview(
          message
        );

        clearComposer();
        clearReply();
        clearPendingAttachments();

        dispatch(
          "to:chat:message-sent",
          {
            message,
            conversation:
              state.activeConversation
          }
        );
      }

      return message;
    } catch (error) {
      console.error(
        "[TO Chat] send:",
        error
      );

      showError(
        error?.message ||
        "Не удалось отправить сообщение."
      );

      return null;
    } finally {
      state.sending = false;
    }
  }


  /* ==========================================================
     EDIT MESSAGE
     ========================================================== */

  async function editMessage(
    messageId,
    text
  ) {
    const value =
      normalizeText(text);

    if (!messageId || !value) {
      return null;
    }

    if (
      value.length >
      CONFIG.MAX_MESSAGE_LENGTH
    ) {
      showError(
        "Сообщение слишком длинное."
      );

      return null;
    }

    try {
      const response =
        await request(
          CONFIG.API.message(messageId),
          {
            method: "PATCH",
            body: {
              text: value
            }
          }
        );

      const updated =
        normalizeMessage(
          response?.message ||
          response?.data ||
          response
        );

      const index =
        state.messages.findIndex(
          (message) =>
            String(
              getMessageId(message)
            ) ===
            String(messageId)
        );

      if (
        index >= 0 &&
        updated
      ) {
        state.messages[index] =
          updated;
      } else if (index >= 0) {
        state.messages[index] = {
          ...state.messages[index],
          text: value,
          is_edited: true
        };
      }

      state.pendingEdit = null;

      renderMessages();

      dispatch(
        "to:chat:message-edited",
        {
          message:
            updated ||
            state.messages[index]
        }
      );

      return updated;
    } catch (error) {
      console.error(
        "[TO Chat] edit:",
        error
      );

      showError(
        error?.message ||
        "Не удалось изменить сообщение."
      );

      return null;
    }
  }


  /* ==========================================================
     DELETE MESSAGE
     ========================================================== */

  async function deleteMessage(
    messageId,
    options = {}
  ) {
    if (!messageId) {
      return false;
    }

    const message =
      state.messages.find(
        (item) =>
          String(
            getMessageId(item)
          ) ===
          String(messageId)
      );

    if (!message) {
      return false;
    }

    const confirmed =
      options.force === true ||
      window.confirm(
        "Вы действительно хотите удалить это сообщение?"
      );

    if (!confirmed) {
      return false;
    }

    try {
      await request(
        CONFIG.API.message(messageId),
        {
          method: "DELETE",
          body: {
            delete_for_everyone:
              options.forEveryone !== false
          }
        }
      );

      const index =
        state.messages.indexOf(
          message
        );

      if (index >= 0) {
        state.messages[index] = {
          ...message,

          text:
            "Сообщение удалено",

          is_deleted: true,

          attachments: [],

          reactions: []
        };
      }

      renderMessages();

      dispatch(
        "to:chat:message-deleted",
        {
          messageId
        }
      );

      return true;
    } catch (error) {
      console.error(
        "[TO Chat] delete:",
        error
      );

      showError(
        error?.message ||
        "Не удалось удалить сообщение."
      );

      return false;
    }
  }


  /* ==========================================================
     REPLY
     ========================================================== */

  function setReply(message) {
    if (!message) {
      return;
    }

    state.pendingReply =
      message;

    renderComposerState();

    const input =
      $(
        "[data-chat-input]",
        state.ui.composer || document
      );

    input?.focus();

    dispatch(
      "to:chat:reply-started",
      {
        message
      }
    );
  }

  function clearReply() {
    state.pendingReply = null;
    renderComposerState();
  }


  /* ==========================================================
     FORWARD
     ========================================================== */

  function setForward(message) {
    if (!message) {
      return;
    }

    state.pendingForward =
      message;

    dispatch(
      "to:chat:forward-started",
      {
        message
      }
    );

    openForwardDialog(
      message
    );
  }

  async function forwardMessage(
    messageId,
    conversationId
  ) {
    if (
      !messageId ||
      !conversationId
    ) {
      return null;
    }

    try {
      const response =
        await request(
          CONFIG.API.messages(
            conversationId
          ),
          {
            method: "POST",
            body: {
              forwarded_from:
                messageId
            }
          }
        );

      const message =
        normalizeMessage(
          response?.message ||
          response?.data ||
          response
        );

      state.pendingForward =
        null;

      return message;
    } catch (error) {
      console.error(
        "[TO Chat] forward:",
        error
      );

      showError(
        error?.message ||
        "Не удалось переслать сообщение."
      );

      return null;
    }
  }


  /* ==========================================================
     REACTIONS
     ========================================================== */

  async function reactToMessage(
    messageId,
    reaction
  ) {
    if (
      !messageId ||
      !reaction
    ) {
      return null;
    }

    try {
      const response =
        await request(
          CONFIG.API.messageReaction(
            messageId
          ),
          {
            method: "POST",
            body: {
              reaction
            }
          }
        );

      const messageIndex =
        state.messages.findIndex(
          (message) =>
            String(
              getMessageId(message)
            ) ===
            String(messageId)
        );

      if (
        messageIndex >= 0 &&
        response?.reactions
      ) {
        state.messages[
          messageIndex
        ].reactions =
          response.reactions;
      }

      renderMessages();

      dispatch(
        "to:chat:reaction",
        {
          messageId,
          reaction
        }
      );

      return response;
    } catch (error) {
      console.error(
        "[TO Chat] reaction:",
        error
      );

      showError(
        error?.message ||
        "Не удалось поставить реакцию."
      );

      return null;
    }
  }


  /* ==========================================================
     PIN
     ========================================================== */

  async function togglePinMessage(
    messageId,
    pinned = null
  ) {
    if (
      !messageId ||
      !isAdminMode()
    ) {
      return null;
    }

    try {
      const response =
        await request(
          CONFIG.API.message(
            messageId
          ),
          {
            method: "PATCH",
            body: {
              pinned:
                pinned === null
                  ? undefined
                  : Boolean(pinned)
            }
          }
        );

      const index =
        state.messages.findIndex(
          (message) =>
            String(
              getMessageId(message)
            ) ===
            String(messageId)
        );

      if (index >= 0) {
        state.messages[index] = {
          ...state.messages[index],

          is_pinned:
            pinned === null
              ? !state.messages[index]
                  .is_pinned
              : Boolean(pinned)
        };
      }

      renderMessages();

      return response;
    } catch (error) {
      console.error(
        "[TO Chat] pin:",
        error
      );

      showError(
        error?.message ||
        "Не удалось изменить закрепление."
      );

      return null;
    }
  }


  /* ==========================================================
     READ
     ========================================================== */

  async function markMessageRead(
    messageId
  ) {
    if (!messageId) {
      return false;
    }

    try {
      await request(
        CONFIG.API.messageRead(
          messageId
        ),
        {
          method: "POST",
          body: {
            read_at: nowIso()
          }
        }
      );

      return true;
    } catch {
      return false;
    }
  }


  async function markConversationRead(
    conversationId
  ) {
    if (!conversationId) {
      return false;
    }

    try {
      await request(
        CONFIG.API.conversation(
          conversationId
        ),
        {
          method: "PATCH",
          body: {
            mark_read: true
          }
        }
      );

      state.unreadByConversation[
        conversationId
      ] = 0;

      const conversation =
        state.conversations.find(
          (item) =>
            String(item.id) ===
            String(conversationId)
        );

      if (conversation) {
        conversation.unread_count = 0;
      }

      state.unreadCount =
        Object.values(
          state.unreadByConversation
        ).reduce(
          (sum, count) =>
            sum + Number(count || 0),
          0
        );

      renderConversationList();
      updateGlobalBadges();

      return true;
    } catch {
      return false;
    }
  }


  /* ==========================================================
     TYPING
     ========================================================== */

  async function sendTyping(
    typing = true
  ) {
    if (
      !state.activeConversationId
    ) {
      return;
    }

    try {
      await request(
        CONFIG.API.typing(
          state.activeConversationId
        ),
        {
          method: "POST",
          body: {
            typing: Boolean(typing)
          }
        }
      );
    } catch {
      // Typing is best effort.
    }
  }

  async function loadTyping() {
    if (
      !state.activeConversationId
    ) {
      return;
    }

    try {
      const response =
        await request(
          CONFIG.API.typing(
            state.activeConversationId
          )
        );

      state.typingUsers =
        response?.users ||
        response?.typing ||
        {};

      renderTyping();
    } catch {
      // Ignore polling errors.
    }
  }


  /* ==========================================================
     PRESENCE
     ========================================================== */

  async function loadPresence() {
    if (
      !state.activeConversationId
    ) {
      return;
    }

    try {
      const response =
        await request(
          CONFIG.API.presence(
            state.activeConversationId
          )
        );

      state.presence =
        response?.participants ||
        response?.users ||
        response ||
        {};

      renderConversationHeader();
    } catch {
      // Ignore presence errors.
    }
  }


  /* ==========================================================
     ATTACHMENTS
     ========================================================== */

  function validateAttachment(
    file
  ) {
    if (!(file instanceof File)) {
      return {
        valid: false,
        reason: "Некорректный файл."
      };
    }

    const maxSize =
      100 * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        valid: false,
        reason:
          "Размер файла не должен превышать 100 МБ."
      };
    }

    return {
      valid: true
    };
  }

  async function uploadFile(
    file
  ) {
    const validation =
      validateAttachment(file);

    if (!validation.valid) {
      showError(
        validation.reason
      );

      return null;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    if (state.activeConversationId) {
      formData.append(
        "conversation_id",
        state.activeConversationId
      );
    }

    state.uploading = true;

    try {
      const response =
        await request(
          CONFIG.API.upload,
          {
            method: "POST",
            body: formData
          }
        );

      return (
        response?.attachment ||
        response?.file ||
        response?.data ||
        response
      );
    } catch (error) {
      console.error(
        "[TO Chat] upload:",
        error
      );

      showError(
        error?.message ||
        "Не удалось загрузить файл."
      );

      return null;
    } finally {
      state.uploading = false;
    }
  }

  async function handleFiles(
    files
  ) {
    const list =
      Array.from(files || []);

    if (!list.length) {
      return;
    }

    if (
      list.length >
      CONFIG.MAX_ATTACHMENTS
    ) {
      showError(
        `Можно добавить максимум ${CONFIG.MAX_ATTACHMENTS} файлов.`
      );

      return;
    }

    for (const file of list) {
      const attachment =
        await uploadFile(file);

      if (attachment) {
        state.pendingAttachments.push(
          attachment
        );
      }
    }

    renderPendingAttachments();
  }

  function clearPendingAttachments() {
    state.pendingAttachments = [];
    renderPendingAttachments();
  }


  /* ==========================================================
     SEARCH
     ========================================================== */

  async function searchMessages(
    query
  ) {
    const value =
      normalizeText(query);

    if (
      !value ||
      value.length >
      CONFIG.MAX_SEARCH_LENGTH
    ) {
      state.messageSearchResults = [];
      return [];
    }

    state.searching = true;

    try {
      const params =
        new URLSearchParams();

      params.set(
        "q",
        value
      );

      if (state.activeConversationId) {
        params.set(
          "conversation_id",
          state.activeConversationId
        );
      }

      const response =
        await request(
          `${CONFIG.API.search}?${params.toString()}`
        );

      state.messageSearchResults =
        response?.messages ||
        response?.results ||
        response?.data ||
        [];

      renderSearchResults();

      return state.messageSearchResults;
    } catch (error) {
      console.error(
        "[TO Chat] search:",
        error
      );

      showError(
        "Не удалось выполнить поиск."
      );

      return [];
    } finally {
      state.searching = false;
    }
  }


  /* ==========================================================
     RENDER CHAT SHELL
     ========================================================== */

  function findChatContainer() {
    return (
      $("[data-chat]") ||
      $("#chat") ||
      $(".chat-page") ||
      $(".chat-container") ||
      null
    );
  }

  function renderChatShell() {
    const container =
      state.ui.container ||
      findChatContainer();

    if (!container) {
      return;
    }

    state.ui.container =
      container;

    container.innerHTML = `
      <div class="to-chat-app" data-to-chat-app>

        <aside
          class="to-chat-sidebar"
          data-chat-sidebar
        >
          <div class="to-chat-sidebar-top">
            <div class="to-chat-title">
              <span>💬</span>
              <strong>Чаты</strong>
            </div>

            <button
              type="button"
              class="to-chat-icon-btn"
              data-chat-new-admin
              title="Написать администрации"
              aria-label="Написать администрации"
            >
              ✎
            </button>
          </div>

          <div class="to-chat-search">
            <input
              type="search"
              data-chat-conversation-search
              placeholder="Поиск чатов..."
              autocomplete="off"
            />
          </div>

          <div
            class="to-chat-conversation-list"
            data-chat-conversation-list
          ></div>
        </aside>

        <section
          class="to-chat-main"
          data-chat-main
        >
          <header
            class="to-chat-header"
            data-chat-header
          ></header>

          <div
            class="to-chat-search-panel"
            data-chat-search-panel
            hidden
          >
            <input
              type="search"
              data-chat-message-search
              placeholder="Поиск сообщений..."
              autocomplete="off"
            />

            <button
              type="button"
              data-chat-close-search
            >
              ✕
            </button>
          </div>

          <div
            class="to-chat-messages"
            data-chat-messages
          ></div>

          <div
            class="to-chat-typing"
            data-chat-typing
          ></div>

          <div
            class="to-chat-composer"
            data-chat-composer
          ></div>
        </section>

      </div>
    `;

    state.ui.list =
      $(
        "[data-chat-conversation-list]",
        container
      );

    state.ui.header =
      $(
        "[data-chat-header]",
        container
      );

    state.ui.messages =
      $(
        "[data-chat-messages]",
        container
      );

    state.ui.composer =
      $(
        "[data-chat-composer]",
        container
      );

    state.ui.search =
      $(
        "[data-chat-search-panel]",
        container
      );

    state.ui.mounted = true;

    renderConversationList();
    renderConversationHeader();
    renderMessages();
    renderComposer();

    bindChatEvents();
  }


  /* ==========================================================
     CONVERSATION LIST
     ========================================================== */

  function renderConversationList() {
    const list =
      state.ui.list;

    if (!list) {
      return;
    }

    if (
      state.loadingConversations &&
      !state.conversations.length
    ) {
      list.innerHTML = `
        <div class="to-chat-loading">
          Загрузка чатов…
        </div>
      `;

      return;
    }

    if (!state.conversations.length) {
      list.innerHTML = `
        <div class="to-chat-empty">
          <div class="to-chat-empty-icon">💬</div>
          <strong>Нет диалогов</strong>
          <span>
            Здесь появятся ваши сообщения.
          </span>

          <button
            type="button"
            data-chat-new-admin
          >
            💬 Написать администрации
          </button>
        </div>
      `;

      return;
    }

    list.innerHTML =
      state.conversations
        .map(
          renderConversationItem
        )
        .join("");
  }

  function renderConversationItem(
    conversation
  ) {
    const id =
      getConversationId(
        conversation
      );

    const active =
      String(id) ===
      String(
        state.activeConversationId
      );

    const system =
      isSystemConversation(
        conversation
      );

    const unread =
      Number(
        conversation.unread_count || 0
      );

    const last =
      conversation.last_message;

    const preview =
      typeof last === "string"
        ? last
        : getMessageText(last);

    const title =
      system
        ? CONFIG.SYSTEM_SENDER.NAME
        : (
            conversation.title ||
            "Администрация"
          );

    const avatar =
      conversation.avatar ||
      (
        system
          ? ""
          : conversation.other_user_avatar ||
            ""
      );

    return `
      <button
        type="button"
        class="to-chat-conversation-item ${
          active
            ? "is-active"
            : ""
        }"
        data-chat-conversation-id="${escapeAttribute(id)}"
      >

        <span class="to-chat-avatar">
          ${
            avatar
              ? `
                <img
                  src="${escapeAttribute(avatar)}"
                  alt=""
                  loading="lazy"
                />
              `
              : `
                <span>
                  ${
                    system
                      ? "🇹🇯"
                      : "👤"
                  }
                </span>
              `
          }
        </span>

        <span class="to-chat-conversation-content">

          <span class="to-chat-conversation-top">
            <strong>
              ${escapeHtml(title)}
            </strong>

            <time>
              ${formatTime(
                conversation.updated_at
              )}
            </time>
          </span>

          <span class="to-chat-conversation-bottom">

            <span>
              ${escapeHtml(
                truncate(
                  preview ||
                  (
                    system
                      ? "Системные уведомления"
                      : "Новый диалог"
                  ),
                  90
                )
              )}
            </span>

            ${
              unread > 0
                ? `
                  <b
                    class="to-chat-unread-badge"
                  >
                    ${
                      unread > 99
                        ? "99+"
                        : unread
                    }
                  </b>
                `
                : ""
            }

          </span>

        </span>

      </button>
    `;
  }


  /* ==========================================================
     HEADER
     ========================================================== */

  function renderConversationHeader() {
    const header =
      state.ui.header;

    if (!header) {
      return;
    }

    const conversation =
      state.activeConversation;

    if (!conversation) {
      header.innerHTML = `
        <div class="to-chat-header-empty">
          <strong>Выберите чат</strong>
        </div>
      `;

      return;
    }

    const system =
      isSystemConversation(
        conversation
      );

    const title =
      system
        ? CONFIG.SYSTEM_SENDER.NAME
        : (
            conversation.title ||
            "Администрация"
          );

    const online =
      getConversationOnlineStatus(
        conversation
      );

    header.innerHTML = `
      <div class="to-chat-header-left">

        <button
          type="button"
          class="to-chat-mobile-back"
          data-chat-back
          aria-label="Назад"
        >
          ‹
        </button>

        <div class="to-chat-avatar to-chat-avatar-header">

          ${
            conversation.avatar
              ? `
                <img
                  src="${escapeAttribute(
                    conversation.avatar
                  )}"
                  alt=""
                />
              `
              : `
                <span>
                  ${
                    system
                      ? "🇹🇯"
                      : "👤"
                  }
                </span>
              `
          }

        </div>

        <div class="to-chat-header-info">

          <div class="to-chat-header-title">

            <strong>
              ${escapeHtml(title)}
            </strong>

            ${
              system
                ? `
                  <span
                    class="to-chat-verified"
                    title="Официальный аккаунт"
                  >
                    ✓
                  </span>
                `
                : ""
            }

          </div>

          <span
            class="to-chat-presence"
            data-chat-presence
          >
            ${
              system
                ? "Официальные системные уведомления"
                : online
                  ? "в сети"
                  : (
                      conversation.last_seen
                        ? `был(а) в сети ${formatDateTime(
                            conversation.last_seen
                          )}`
                        : "Администрация"
                    )
            }
          </span>

        </div>

      </div>

      <div class="to-chat-header-actions">

        <button
          type="button"
          data-chat-open-search
          title="Поиск"
        >
          🔎
        </button>

        <button
          type="button"
          data-chat-conversation-menu
          title="Дополнительно"
        >
          ⋮
        </button>

      </div>
    `;
  }


  function getConversationOnlineStatus(
    conversation
  ) {
    const id =
      getConversationId(
        conversation
      );

    const presence =
      state.presence[id];

    if (
      presence?.online === true
    ) {
      return true;
    }

    return Boolean(
      conversation?.online
    );
  }


  /* ==========================================================
     MESSAGES RENDER
     ========================================================== */

  function renderMessages() {
    const container =
      state.ui.messages;

    if (!container) {
      return;
    }

    if (
      state.loadingMessages &&
      !state.messages.length
    ) {
      container.innerHTML = `
        <div class="to-chat-loading">
          Загрузка сообщений…
        </div>
      `;

      return;
    }

    if (!state.messages.length) {
      container.innerHTML = `
        <div class="to-chat-empty-messages">
          <div class="to-chat-empty-icon">
            ${
              isSystemConversation(
                state.activeConversation
              )
                ? "🇹🇯"
                : "💬"
            }
          </div>

          <strong>
            ${
              isSystemConversation(
                state.activeConversation
              )
                ? "Системный чат"
                : "Начните разговор"
            }
          </strong>

          <span>
            ${
              isSystemConversation(
                state.activeConversation
              )
                ? "Здесь будут официальные уведомления Tajik Opportunities."
                : "Напишите администрации, если вам нужна помощь."
            }
          </span>
        </div>
      `;

      return;
    }

    const groups =
      groupMessagesByDate(
        state.messages
      );

    let html = "";

    for (
      const group of groups
    ) {
      html += `
        <div class="to-chat-date-divider">
          <span>
            ${escapeHtml(
              group.label
            )}
          </span>
        </div>
      `;

      html += group.messages
        .map(
          renderMessage
        )
        .join("");
    }

    container.innerHTML =
      html;

    observeMessages();

    renderTyping();
  }


  function groupMessagesByDate(
    messages
  ) {
    const groups = [];

    let currentKey =
      null;

    let currentGroup =
      null;

    for (const message of messages) {
      const created =
        getMessageCreatedAt(
          message
        );

      const date =
        created
          ? new Date(created)
          : new Date();

      const key =
        `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (key !== currentKey) {
        currentKey = key;

        currentGroup = {
          key,
          label:
            formatDateDivider(
              date
            ),
          messages: []
        };

        groups.push(
          currentGroup
        );
      }

      currentGroup.messages.push(
        message
      );
    }

    return groups;
  }


  function formatDateDivider(
    date
  ) {
    const today =
      new Date();

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      date.toDateString() ===
      today.toDateString()
    ) {
      return "Сегодня";
    }

    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Вчера";
    }

    return new Intl.DateTimeFormat(
      "ru-RU",
      {
        day: "numeric",
        month: "long",
        year:
          date.getFullYear() !==
          today.getFullYear()
            ? "numeric"
            : undefined
      }
    ).format(date);
  }


  function renderMessage(
    message
  ) {
    const id =
      getMessageId(
        message
      );

    const own =
      isOwnMessage(
        message
      );

    const system =
      message.type ===
        CONFIG.MESSAGE_TYPES.SYSTEM ||
      message.is_system;

    const note =
      message.type ===
      CONFIG.MESSAGE_TYPES.ADMIN_NOTE;

    const deleted =
      message.is_deleted;

    const reply =
      message.reply_to;

    const attachments =
      message.attachments || [];

    return `
      <article
        class="
          to-chat-message-row
          ${own ? "is-own" : "is-other"}
          ${system ? "is-system" : ""}
          ${note ? "is-admin-note" : ""}
          ${deleted ? "is-deleted" : ""}
        "
        data-chat-message-id="${escapeAttribute(id)}"
      >

        ${
          !own && !system
            ? `
              <div class="to-chat-message-avatar">
                ${
                  message.sender_avatar
                    ? `
                      <img
                        src="${escapeAttribute(
                          message.sender_avatar
                        )}"
                        alt=""
                        loading="lazy"
                      />
                    `
                    : "👤"
                }
              </div>
            `
            : ""
        }

        <div class="to-chat-message">

          ${
            !own &&
            !system
              ? `
                <div class="to-chat-message-author">
                  ${escapeHtml(
                    message.sender_name
                  )}
                </div>
              `
              : ""
          }

          ${
            note
              ? `
                <div class="to-chat-admin-note-label">
                  🔐 Внутренняя заметка администратора
                </div>
              `
              : ""
          }

          ${
            system
              ? `
                <div class="to-chat-system-label">
                  ${escapeHtml(
                    CONFIG.SYSTEM_SENDER.NAME
                  )}
                  <span>✓</span>
                </div>
              `
              : ""
          }

          ${
            reply
              ? renderReplyPreview(
                  reply
                )
              : ""
          }

          ${
            attachments.length
              ? `
                <div class="to-chat-attachments">
                  ${attachments
                    .map(
                      renderAttachment
                    )
                    .join("")}
                </div>
              `
              : ""
          }

          ${
            deleted
              ? `
                <div class="to-chat-deleted">
                  🚫 Сообщение удалено
                </div>
              `
              : (
                  message.text
                    ? `
                      <div class="to-chat-message-text">
                        ${formatMessageText(
                          message.text
                        )}
                      </div>
                    `
                    : ""
                )
          }

          ${
            message.reactions?.length
              ? renderReactions(
                  message.reactions
                )
              : ""
          }

          <div class="to-chat-message-meta">

            <time>
              ${formatTime(
                getMessageCreatedAt(
                  message
                )
              )}
            </time>

            ${
              message.is_edited &&
              !deleted
                ? `
                  <span>
                    изменено
                  </span>
                `
                : ""
            }

            ${
              own
                ? renderMessageStatus(
                    message
                  )
                : ""
            }

          </div>

          ${
            !deleted
              ? `
                <div
                  class="to-chat-message-actions"
                  data-chat-message-actions
                >
                  ${renderMessageActions(
                    message
                  )}
                </div>
              `
              : ""
          }

        </div>
      </article>
    `;
  }


  function formatMessageText(
    text
  ) {
    let value =
      escapeHtml(text);

    value =
      value.replace(
        /\n/g,
        "<br>"
      );

    value =
      value.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

    return value;
  }


  function renderReplyPreview(
    reply
  ) {
    return `
      <div class="to-chat-reply-preview">
        <strong>
          ${escapeHtml(
            reply.sender_name ||
            reply.author_name ||
            "Сообщение"
          )}
        </strong>

        <span>
          ${escapeHtml(
            truncate(
              getMessageText(reply),
              160
            )
          )}
        </span>
      </div>
    `;
  }


  function renderAttachment(
    attachment
  ) {
    if (!attachment) {
      return "";
    }

    const url =
      attachment.url ||
      attachment.download_url ||
      attachment.src ||
      "";

    const name =
      attachment.name ||
      attachment.filename ||
      "Файл";

    const type =
      attachment.type ||
      attachment.mime_type ||
      "";

    if (!url) {
      return `
        <div class="to-chat-file">
          📎 ${escapeHtml(name)}
        </div>
      `;
    }

    if (
      type.startsWith("image/") ||
      attachment.kind === "image"
    ) {
      return `
        <a
          class="to-chat-image"
          href="${escapeAttribute(url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="${escapeAttribute(url)}"
            alt="${escapeAttribute(name)}"
            loading="lazy"
          />
        </a>
      `;
    }

    if (
      type.startsWith("video/") ||
      attachment.kind === "video"
    ) {
      return `
        <video
          class="to-chat-video"
          controls
          preload="metadata"
        >
          <source
            src="${escapeAttribute(url)}"
            type="${escapeAttribute(type)}"
          />
        </video>
      `;
    }

    if (
      type.startsWith("audio/") ||
      attachment.kind === "audio" ||
      attachment.kind === "voice"
    ) {
      return `
        <div class="to-chat-audio">
          <div class="to-chat-audio-icon">
            ${
              attachment.kind === "voice"
                ? "🎙️"
                : "🎵"
            }
          </div>

          <div>
            <strong>
              ${escapeHtml(name)}
            </strong>

            <audio
              controls
              preload="metadata"
            >
              <source
                src="${escapeAttribute(url)}"
                type="${escapeAttribute(type)}"
              />
            </audio>
          </div>
        </div>
      `;
    }

    return `
      <a
        class="to-chat-file"
        href="${escapeAttribute(url)}"
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        <span class="to-chat-file-icon">
          📎
        </span>

        <span>
          <strong>
            ${escapeHtml(name)}
          </strong>

          ${
            attachment.size
              ? `
                <small>
                  ${formatBytes(
                    attachment.size
                  )}
                </small>
              `
              : ""
          }
        </span>
      </a>
    `;
  }


  function renderReactions(
    reactions
  ) {
    const grouped = {};

    reactions.forEach(
      (reaction) => {
        const emoji =
          typeof reaction === "string"
            ? reaction
            : (
                reaction.emoji ||
                reaction.reaction ||
                "❤️"
              );

        if (!grouped[emoji]) {
          grouped[emoji] = 0;
        }

        grouped[emoji] += 1;
      }
    );

    return `
      <div class="to-chat-reactions">
        ${Object.entries(grouped)
          .map(
            ([emoji, count]) => `
              <button
                type="button"
                data-chat-reaction-value="${escapeAttribute(
                  emoji
                )}"
              >
                ${escapeHtml(emoji)}
                ${
                  count > 1
                    ? `<span>${count}</span>`
                    : ""
                }
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }


  function renderMessageStatus(
    message
  ) {
    if (
      message.read_at ||
      message.status === "read" ||
      message.delivery_status === "read"
    ) {
      return `
        <span
          class="to-chat-message-status is-read"
          title="Прочитано"
        >
          ✓✓
        </span>
      `;
    }

    if (
      message.delivered_at ||
      message.status === "delivered" ||
      message.delivery_status === "delivered"
    ) {
      return `
        <span
          class="to-chat-message-status"
          title="Доставлено"
        >
          ✓✓
        </span>
      `;
    }

    if (
      message.status === "sending"
    ) {
      return `
        <span
          class="to-chat-message-status"
          title="Отправляется"
        >
          ◌
        </span>
      `;
    }

    return `
      <span
        class="to-chat-message-status"
        title="Отправлено"
      >
        ✓
      </span>
    `;
  }


  /* ==========================================================
     MESSAGE ACTIONS
     ========================================================== */

  function renderMessageActions(
    message
  ) {
    const id =
      getMessageId(message);

    const own =
      isOwnMessage(
        message
      );

    return `
      <button
        type="button"
        data-chat-action="reply"
        data-chat-message-id="${escapeAttribute(id)}"
      >
        ↩️ Ответить
      </button>

      <button
        type="button"
        data-chat-action="reaction"
        data-chat-message-id="${escapeAttribute(id)}"
      >
        ❤️ Реакция
      </button>

      ${
        own
          ? `
            <button
              type="button"
              data-chat-action="edit"
              data-chat-message-id="${escapeAttribute(id)}"
            >
              ✏️ Изменить
            </button>
          `
          : ""
      }

      <button
        type="button"
        data-chat-action="forward"
        data-chat-message-id="${escapeAttribute(id)}"
      >
        📤 Переслать
      </button>

      ${
        isAdminMode()
          ? `
            <button
              type="button"
              data-chat-action="pin"
              data-chat-message-id="${escapeAttribute(id)}"
            >
              ${
                message.is_pinned
                  ? "📌 Открепить"
                  : "📌 Закрепить"
              }
            </button>
          `
          : ""
      }

      ${
        own || isAdminMode()
          ? `
            <button
              type="button"
              data-chat-action="delete"
              data-chat-message-id="${escapeAttribute(id)}"
            >
              🗑️ Удалить
            </button>
          `
          : ""
      }
    `;
  }


  /* ==========================================================
     COMPOSER
     ========================================================== */

  function renderComposer() {
    const composer =
      state.ui.composer;

    if (!composer) {
      return;
    }

    const system =
      isSystemConversation(
        state.activeConversation
      );

    const canSend =
      !system ||
      isAdminMode();

    if (!canSend) {
      composer.innerHTML = `
        <div class="to-chat-system-composer">

          <div>
            🇹🇯
          </div>

          <span>
            Это официальный системный чат.
            Здесь публикуются только уведомления Tajik Opportunities.
          </span>

          <button
            type="button"
            data-chat-contact-admin
          >
            💬 Ответить администрации
          </button>

        </div>
      `;

      return;
    }

    composer.innerHTML = `
      ${
        state.pendingReply
          ? `
            <div
              class="to-chat-reply-bar"
              data-chat-reply-bar
            >
              <div>
                <strong>
                  Ответ на сообщение
                </strong>

                <span>
                  ${escapeHtml(
                    truncate(
                      getMessageText(
                        state.pendingReply
                      ),
                      120
                    )
                  )}
                </span>
              </div>

              <button
                type="button"
                data-chat-clear-reply
              >
                ✕
              </button>
            </div>
          `
          : ""
      }

      ${
        state.pendingEdit
          ? `
            <div class="to-chat-edit-bar">
              <strong>
                ✏️ Редактирование
              </strong>

              <button
                type="button"
                data-chat-cancel-edit
              >
                ✕
              </button>
            </div>
          `
          : ""
      }

      <div
        class="to-chat-pending-attachments"
        data-chat-pending-attachments
      ></div>

      <div class="to-chat-composer-row">

        <button
          type="button"
          class="to-chat-attach-btn"
          data-chat-attach
          title="Прикрепить файл"
        >
          📎
        </button>

        <input
          type="file"
          data-chat-file-input
          multiple
          hidden
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        />

        <textarea
          data-chat-input
          rows="1"
          maxlength="${CONFIG.MAX_MESSAGE_LENGTH}"
          placeholder="Напишите сообщение..."
          autocomplete="off"
        ></textarea>

        <button
          type="button"
          class="to-chat-send-btn"
          data-chat-send
          title="Отправить"
        >
          ➤
        </button>

      </div>

      ${
        isAdminMode()
          ? `
            <div class="to-chat-admin-mode-bar">
              🛡️ Административный режим активен
            </div>
          `
          : ""
      }
    `;

    const input =
      $(
        "[data-chat-input]",
        composer
      );

    const draft =
      getDraft(
        state.activeConversationId
      );

    if (
      input &&
      draft &&
      !state.pendingEdit
    ) {
      input.value =
        draft;
    }

    renderPendingAttachments();
    autoResizeInput();
  }


  function renderComposerState() {
    renderComposer();
  }


  function clearComposer() {
    const input =
      $(
        "[data-chat-input]",
        state.ui.composer ||
        document
      );

    if (input) {
      input.value = "";
    }

    saveDraft(
      state.activeConversationId,
      ""
    );

    autoResizeInput();
  }


  function renderPendingAttachments() {
    const container =
      $(
        "[data-chat-pending-attachments]",
        state.ui.composer ||
        document
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      state.pendingAttachments
        .map(
          (attachment, index) => `
            <div
              class="to-chat-pending-file"
            >
              <span>
                ${
                  attachment.thumbnail
                    ? `
                      <img
                        src="${escapeAttribute(
                          attachment.thumbnail
                        )}"
                        alt=""
                      />
                    `
                    : "📎"
                }
              </span>

              <strong>
                ${escapeHtml(
                  attachment.name ||
                  attachment.filename ||
                  "Файл"
                )}
              </strong>

              <button
                type="button"
                data-chat-remove-attachment="${index}"
              >
                ✕
              </button>
            </div>
          `
        )
        .join("");
  }


  /* ==========================================================
     TYPING RENDER
     ========================================================== */

  function renderTyping() {
    const container =
      $(
        "[data-chat-typing]",
        state.ui.container ||
        document
      );

    if (!container) {
      return;
    }

    const users =
      Object.values(
        state.typingUsers || {}
      );

    if (!users.length) {
      container.innerHTML = "";
      return;
    }

    const names =
      users
        .map(
          (user) =>
            user.name ||
            user.username ||
            "Пользователь"
        )
        .slice(0, 3);

    container.innerHTML = `
      <span>
        ${escapeHtml(
          names.join(", ")
        )}
        ${
          names.length > 1
            ? " печатают"
            : " печатает"
        }…
      </span>
    `;
  }


  /* ==========================================================
     SEARCH UI
     ========================================================== */

  function renderSearchResults() {
    const panel =
      state.ui.search;

    if (!panel) {
      return;
    }

    const input =
      $(
        "[data-chat-message-search]",
        panel
      );

    if (
      !state.messageSearchResults.length
    ) {
      return;
    }

    let resultBox =
      $(
        "[data-chat-search-results]",
        panel
      );

    if (!resultBox) {
      resultBox =
        document.createElement(
          "div"
        );

      resultBox.dataset.chatSearchResults =
        "true";

      panel.appendChild(
        resultBox
      );
    }

    resultBox.innerHTML =
      state.messageSearchResults
        .map(
          (message) => `
            <button
              type="button"
              data-chat-search-message-id="${escapeAttribute(
                getMessageId(message)
              )}"
            >
              <strong>
                ${escapeHtml(
                  message.sender_name ||
                  "Пользователь"
                )}
              </strong>

              <span>
                ${escapeHtml(
                  truncate(
                    getMessageText(
                      message
                    ),
                    180
                  )
                )}
              </span>

              <time>
                ${formatDateTime(
                  getMessageCreatedAt(
                    message
                  )
                )}
              </time>
            </button>
          `
        )
        .join("");

    if (input) {
      input.focus();
    }
  }


  /* ==========================================================
     FORWARD DIALOG
     ========================================================== */

  function openForwardDialog(
    message
  ) {
    const existing =
      $(
        "[data-to-chat-forward-dialog]"
      );

    existing?.remove();

    const dialog =
      document.createElement(
        "div"
      );

    dialog.dataset.toChatForwardDialog =
      "true";

    dialog.innerHTML = `
      <div class="to-chat-modal-backdrop">

        <div class="to-chat-modal">

          <div class="to-chat-modal-header">
            <strong>
              📤 Переслать сообщение
            </strong>

            <button
              type="button"
              data-chat-forward-close
            >
              ✕
            </button>
          </div>

          <div class="to-chat-modal-preview">
            ${escapeHtml(
              truncate(
                getMessageText(
                  message
                ),
                300
              )
            )}
          </div>

          <div
            class="to-chat-forward-list"
            data-chat-forward-list
          >
            ${state.conversations
              .filter(
                (conversation) =>
                  String(
                    conversation.id
                  ) !==
                  String(
                    state.activeConversationId
                  )
              )
              .map(
                (conversation) => `
                  <button
                    type="button"
                    data-chat-forward-to="${escapeAttribute(
                      conversation.id
                    )}"
                  >
                    <span>
                      ${
                        isSystemConversation(
                          conversation
                        )
                          ? "🇹🇯"
                          : "👤"
                      }
                    </span>

                    <strong>
                      ${escapeHtml(
                        conversation.title ||
                        "Чат"
                      )}
                    </strong>
                  </button>
                `
              )
              .join("")}
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(
      dialog
    );
  }


  /* ==========================================================
     MENU
     ========================================================== */

  function openConversationMenu() {
    const conversation =
      state.activeConversation;

    if (!conversation) {
      return;
    }

    const old =
      $(
        "[data-to-chat-menu]"
      );

    old?.remove();

    const menu =
      document.createElement(
        "div"
      );

    menu.dataset.toChatMenu =
      "true";

    menu.innerHTML = `
      <div class="to-chat-popup-menu">

        ${
          isPrivateConversation(
            conversation
          )
            ? `
              <button
                type="button"
                data-chat-menu-action="close"
              >
                🔒 Закрыть диалог
              </button>

              <button
                type="button"
                data-chat-menu-action="archive"
              >
                🗄️ Архивировать
              </button>
            `
            : ""
        }

        <button
          type="button"
          data-chat-menu-action="search"
        >
          🔎 Поиск сообщений
        </button>

        <button
          type="button"
          data-chat-menu-action="refresh"
        >
          🔄 Обновить
        </button>

        ${
          isAdminMode()
            ? `
              <button
                type="button"
                data-chat-menu-action="admin-info"
              >
                🛡️ Информация администратора
              </button>
            `
            : ""
        }

      </div>
    `;

    document.body.appendChild(
      menu
    );
  }


  /* ==========================================================
     GLOBAL BADGES
     ========================================================== */

  function updateGlobalBadges() {
    const count =
      state.unreadCount;

    $all(
      "[data-chat-unread-badge-global]"
    ).forEach(
      (element) => {
        if (count > 0) {
          element.hidden = false;
          element.textContent =
            count > 99
              ? "99+"
              : String(count);
        } else {
          element.hidden = true;
          element.textContent = "";
        }
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "to:chat:unread-changed",
        {
          detail: {
            count
          }
        }
      )
    );
  }


  /* ==========================================================
     OBSERVER
     ========================================================== */

  function observeMessages() {
    state.observers.forEach(
      (observer) =>
        observer.disconnect()
    );

    state.observers = [];

    if (!state.ui.messages) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              const id =
                entry.target.dataset
                  .chatMessageId;

              if (id) {
                markMessageRead(
                  id
                );
              }
            }
          );
        },
        {
          root:
            state.ui.messages,
          threshold: 0.6
        }
      );

    $all(
      "[data-chat-message-id]",
      state.ui.messages
    ).forEach(
      (element) =>
        observer.observe(element)
    );

    state.observers.push(
      observer
    );
  }


  /* ==========================================================
     SCROLL
     ========================================================== */

  function scrollMessagesToBottom() {
    const container =
      state.ui.messages;

    if (!container) {
      return;
    }

    container.scrollTop =
      container.scrollHeight;
  }


  /* ==========================================================
     POLLING
     ========================================================== */

  function stopPolling() {
    Object.keys(
      state.polling
    ).forEach(
      (key) => {
        if (
          state.polling[key]
        ) {
          clearInterval(
            state.polling[key]
          );

          state.polling[key] =
            null;
        }
      }
    );
  }


  function startMessagePolling() {
    if (
      state.polling.messages
    ) {
      clearInterval(
        state.polling.messages
      );
    }

    state.polling.messages =
      setInterval(
        async () => {
          if (
            !state.activeConversationId ||
            document.hidden
          ) {
            return;
          }

          try {
            const response =
              await request(
                CONFIG.API.messages(
                  state.activeConversationId
                ) +
                `?limit=${CONFIG.MESSAGE_LIMIT}&after=${encodeURIComponent(
                  state.lastMessageId || ""
                )}`
              );

            const raw =
              response?.messages ||
              response?.data ||
              response?.items ||
              [];

            if (
              !Array.isArray(raw) ||
              !raw.length
            ) {
              return;
            }

            const incoming =
              raw
                .map(normalizeMessage)
                .filter(Boolean);

            const existingIds =
              new Set(
                state.messages.map(
                  (message) =>
                    String(
                      getMessageId(
                        message
                      )
                    )
                )
              );

            let changed =
              false;

            incoming.forEach(
              (message) => {
                const id =
                  String(
                    getMessageId(
                      message
                    )
                  );

                if (
                  !existingIds.has(id)
                ) {
                  state.messages.push(
                    message
                  );

                  changed = true;

                  state.lastMessageId =
                    getMessageId(
                      message
                    );
                }
              }
            );

            if (changed) {
              renderMessages();

              requestAnimationFrame(
                scrollMessagesToBottom
              );

              dispatch(
                "to:chat:messages-received",
                {
                  messages:
                    incoming
                }
              );
            }
          } catch {
            // Polling failure is silent.
          }
        },
        CONFIG.POLLING.MESSAGES
      );
  }


  function startPresencePolling() {
    if (
      state.polling.presence
    ) {
      clearInterval(
        state.polling.presence
      );
    }

    state.polling.presence =
      setInterval(
        loadPresence,
        CONFIG.POLLING.PRESENCE
      );
  }


  function startTypingPolling() {
    if (
      state.polling.typing
    ) {
      clearInterval(
        state.polling.typing
      );
    }

    state.polling.typing =
      setInterval(
        loadTyping,
        CONFIG.POLLING.TYPING
      );
  }


  function startConversationPolling() {
    if (
      state.polling.conversations
    ) {
      clearInterval(
        state.polling.conversations
      );
    }

    state.polling.conversations =
      setInterval(
        async () => {
          if (
            document.hidden
          ) {
            return;
          }

          await loadConversations();
        },
        CONFIG.POLLING.CONVERSATIONS
      );
  }


  /* ==========================================================
     CONVERSATION PREVIEW
     ========================================================== */

  function updateConversationPreview(
    message
  ) {
    const conversation =
      state.conversations.find(
        (item) =>
          String(item.id) ===
          String(
            state.activeConversationId
          )
      );

    if (!conversation) {
      return;
    }

    conversation.last_message =
      message;

    conversation.updated_at =
      getMessageCreatedAt(
        message
      ) ||
      nowIso();

    conversation.unread_count = 0;

    state.conversations =
      [
        conversation,
        ...state.conversations.filter(
          (item) =>
            String(item.id) !==
            String(conversation.id)
        )
      ];

    renderConversationList();
  }


  /* ==========================================================
     EVENT DISPATCH
     ========================================================== */

  function dispatch(
    name,
    detail = {}
  ) {
    document.dispatchEvent(
      new CustomEvent(
        name,
        {
          detail
        }
      )
    );
  }


  /* ==========================================================
     ERROR
     ========================================================== */

  function showError(
    message
  ) {
    if (
      window.TOApp &&
      typeof window.TOApp.showToast ===
        "function"
    ) {
      window.TOApp.showToast(
        message,
        "error"
      );

      return;
    }

    if (
      window.showToast &&
      typeof window.showToast ===
        "function"
    ) {
      window.showToast(
        message,
        "error"
      );

      return;
    }

    console.error(
      "[Tajik Opportunities Chat]",
      message
    );
  }


  /* ==========================================================
     EVENTS
     ========================================================== */

  let eventsBound = false;

  function bindChatEvents() {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

    document.addEventListener(
      "click",
      async (event) => {
        const target =
          event.target.closest(
            "[data-chat-conversation-id]"
          );

        if (target) {
          await openConversation(
            target.dataset
              .chatConversationId
          );

          return;
        }

        if (
          event.target.closest(
            "[data-chat-new-admin]"
          )
        ) {
          await createAdminConversation();
          return;
        }

        if (
          event.target.closest(
            "[data-chat-send]"
          )
        ) {
          await handleSend();
          return;
        }

        if (
          event.target.closest(
            "[data-chat-attach]"
          )
        ) {
          const input =
            $(
              "[data-chat-file-input]",
              state.ui.composer ||
              document
            );

          input?.click();

          return;
        }

        if (
          event.target.closest(
            "[data-chat-clear-reply]"
          )
        ) {
          clearReply();
          return;
        }

        if (
          event.target.closest(
            "[data-chat-cancel-edit]"
          )
        ) {
          cancelEdit();
          return;
        }

        const removeAttachment =
          event.target.closest(
            "[data-chat-remove-attachment]"
          );

        if (removeAttachment) {
          const index =
            Number(
              removeAttachment.dataset
                .chatRemoveAttachment
            );

          if (
            Number.isInteger(index)
          ) {
            state.pendingAttachments.splice(
              index,
              1
            );

            renderPendingAttachments();
          }

          return;
        }

        const actionButton =
          event.target.closest(
            "[data-chat-action]"
          );

        if (actionButton) {
          await handleMessageAction(
            actionButton
          );

          return;
        }

        const reactionButton =
          event.target.closest(
            "[data-chat-reaction-value]"
          );

        if (reactionButton) {
          const row =
            reactionButton.closest(
              "[data-chat-message-id]"
            );

          if (row) {
            await reactToMessage(
              row.dataset
                .chatMessageId,
              reactionButton.dataset
                .chatReactionValue
            );
          }

          return;
        }

        if (
          event.target.closest(
            "[data-chat-open-search]"
          )
        ) {
          openSearchPanel();
          return;
        }

        if (
          event.target.closest(
            "[data-chat-close-search]"
          )
        ) {
          closeSearchPanel();
          return;
        }

        if (
          event.target.closest(
            "[data-chat-conversation-menu]"
          )
        ) {
          openConversationMenu();
          return;
        }

        const menuAction =
          event.target.closest(
            "[data-chat-menu-action]"
          );

        if (menuAction) {
          await handleConversationMenuAction(
            menuAction.dataset
              .chatMenuAction
          );

          return;
        }

        if (
          event.target.closest(
            "[data-chat-contact-admin]"
          )
        ) {
          await createAdminConversation({
            source:
              "system_chat_reply"
          });

          return;
        }

        const forwardTo =
          event.target.closest(
            "[data-chat-forward-to]"
          );

        if (forwardTo) {
          if (
            state.pendingForward
          ) {
            await forwardMessage(
              getMessageId(
                state.pendingForward
              ),
              forwardTo.dataset
                .chatForwardTo
            );
          }

          forwardTo.closest(
            "[data-to-chat-forward-dialog]"
          )?.remove();

          return;
        }

        if (
          event.target.closest(
            "[data-chat-forward-close]"
          )
        ) {
          event.target.closest(
            "[data-to-chat-forward-dialog]"
          )?.remove();

          state.pendingForward =
            null;

          return;
        }

        if (
          event.target.closest(
            "[data-chat-back]"
          )
        ) {
          dispatch(
            "to:chat:back"
          );

          return;
        }

        const searchMessage =
          event.target.closest(
            "[data-chat-search-message-id]"
          );

        if (searchMessage) {
          focusMessage(
            searchMessage.dataset
              .chatSearchMessageId
          );

          return;
        }
      }
    );


    document.addEventListener(
      "input",
      (event) => {
        const target =
          event.target;

        if (
          target.matches(
            "[data-chat-input]"
          )
        ) {
          saveDraft(
            state.activeConversationId,
            target.value
          );

          autoResizeInput();

          sendTyping(
            Boolean(
              target.value.trim()
            )
          );

          return;
        }

        if (
          target.matches(
            "[data-chat-conversation-search]"
          )
        ) {
          filterConversationList(
            target.value
          );

          return;
        }

        if (
          target.matches(
            "[data-chat-message-search]"
          )
        ) {
          searchMessages(
            target.value
          );
        }
      }
    );


    document.addEventListener(
      "keydown",
      async (event) => {
        const target =
          event.target;

        if (
          target.matches(
            "[data-chat-input]"
          )
        ) {
          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();

            await handleSend();
          }

          return;
        }

        if (
          target.matches(
            "[data-chat-message-search]"
          ) &&
          event.key === "Enter"
        ) {
          event.preventDefault();

          await searchMessages(
            target.value
          );
        }
      }
    );


    document.addEventListener(
      "change",
      async (event) => {
        const target =
          event.target;

        if (
          target.matches(
            "[data-chat-file-input]"
          )
        ) {
          await handleFiles(
            target.files
          );

          target.value = "";
        }
      }
    );


    if (state.ui.messages) {
      state.ui.messages.addEventListener(
        "scroll",
        () => {
          if (
            state.ui.messages.scrollTop <
            120
          ) {
            loadOlderMessages();
          }
        }
      );
    }


    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) {
          if (
            state.activeConversationId
          ) {
            loadMessages(
              state.activeConversationId,
              {
                reset: true,
                scroll: false,
                force: true
              }
            );

            markConversationRead(
              state.activeConversationId
            );
          }

          loadConversations();
        }
      }
    );
  }


  /* ==========================================================
     SEND HANDLER
     ========================================================== */

  async function handleSend() {
    const input =
      $(
        "[data-chat-input]",
        state.ui.composer ||
        document
      );

    const text =
      input?.value || "";

    if (state.pendingEdit) {
      await editMessage(
        getMessageId(
          state.pendingEdit
        ),
        text
      );

      clearComposer();

      return;
    }

    await sendMessage(
      text
    );
  }


  /* ==========================================================
     MESSAGE ACTION HANDLER
     ========================================================== */

  async function handleMessageAction(
    button
  ) {
    const action =
      button.dataset
        .chatAction;

    const messageId =
      button.dataset
        .chatMessageId;

    const message =
      state.messages.find(
        (item) =>
          String(
            getMessageId(item)
          ) ===
          String(messageId)
      );

    if (!message) {
      return;
    }

    switch (action) {
      case "reply":
        setReply(message);
        break;

      case "reaction":
        openReactionPicker(
          message
        );
        break;

      case "edit":
        startEditMessage(
          message
        );
        break;

      case "forward":
        setForward(message);
        break;

      case "pin":
        await togglePinMessage(
          messageId
        );
        break;

      case "delete":
        await deleteMessage(
          messageId
        );
        break;

      default:
        break;
    }
  }


  /* ==========================================================
     REACTION PICKER
     ========================================================== */

  function openReactionPicker(
    message
  ) {
    const old =
      $(
        "[data-to-chat-reaction-picker]"
      );

    old?.remove();

    const picker =
      document.createElement(
        "div"
      );

    picker.dataset.toChatReactionPicker =
      "true";

    picker.innerHTML = `
      <div class="to-chat-reaction-picker">

        ${[
          "❤️",
          "👍",
          "😂",
          "🔥",
          "👏",
          "😍",
          "😢",
          "😡",
          "😮",
          "🎉",
          "🙏",
          "🇹🇯"
        ]
          .map(
            (emoji) => `
              <button
                type="button"
                data-chat-picker-reaction="${emoji}"
              >
                ${emoji}
              </button>
            `
          )
          .join("")}

      </div>
    `;

    document.body.appendChild(
      picker
    );

    picker.addEventListener(
      "click",
      async (event) => {
        const button =
          event.target.closest(
            "[data-chat-picker-reaction]"
          );

        if (!button) {
          return;
        }

        await reactToMessage(
          getMessageId(message),
          button.dataset
            .chatPickerReaction
        );

        picker.remove();
      }
    );
  }


  /* ==========================================================
     EDIT
     ========================================================== */

  function startEditMessage(
    message
  ) {
    if (!message) {
      return;
    }

    state.pendingEdit =
      message;

    const input =
      $(
        "[data-chat-input]",
        state.ui.composer ||
        document
      );

    if (input) {
      input.value =
        getMessageText(
          message
        );

      input.focus();

      autoResizeInput();
    }

    renderComposer();
  }


  function cancelEdit() {
    state.pendingEdit =
      null;

    clearComposer();
    renderComposer();
  }


  /* ==========================================================
     SEARCH PANEL
     ========================================================== */

  function openSearchPanel() {
    const panel =
      state.ui.search;

    if (!panel) {
      return;
    }

    panel.hidden = false;

    const input =
      $(
        "[data-chat-message-search]",
        panel
      );

    input?.focus();
  }

  function closeSearchPanel() {
    const panel =
      state.ui.search;

    if (!panel) {
      return;
    }

    panel.hidden = true;

    const input =
      $(
        "[data-chat-message-search]",
        panel
      );

    if (input) {
      input.value = "";
    }

    const resultBox =
      $(
        "[data-chat-search-results]",
        panel
      );

    resultBox?.remove();

    state.messageSearchResults =
      [];
  }


  function focusMessage(
    messageId
  ) {
    const element =
      $(
        `[data-chat-message-id="${CSS.escape(
          String(messageId)
        )}"]`,
        state.ui.messages ||
        document
      );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    element.classList.add(
      "to-chat-message-highlight"
    );

    setTimeout(
      () => {
        element.classList.remove(
          "to-chat-message-highlight"
        );
      },
      1800
    );
  }


  /* ==========================================================
     FILTER CONVERSATIONS
     ========================================================== */

  function filterConversationList(
    query
  ) {
    const value =
      normalizeText(
        query
      ).toLowerCase();

    const items =
      $all(
        "[data-chat-conversation-id]",
        state.ui.list ||
        document
      );

    items.forEach(
      (element) => {
        const conversation =
          state.conversations.find(
            (item) =>
              String(item.id) ===
              String(
                element.dataset
                  .chatConversationId
              )
          );

        if (!conversation) {
          return;
        }

        const text =
          [
            conversation.title,
            conversation.username,
            conversation.last_message &&
              getMessageText(
                conversation.last_message
              )
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        element.hidden =
          Boolean(
            value &&
            !text.includes(value)
          );
      }
    );
  }


  /* ==========================================================
     CONVERSATION MENU ACTIONS
     ========================================================== */

  async function handleConversationMenuAction(
    action
  ) {
    $(
      "[data-to-chat-menu]"
    )?.remove();

    switch (action) {
      case "search":
        openSearchPanel();
        break;

      case "refresh":
        if (
          state.activeConversationId
        ) {
          await loadMessages(
            state.activeConversationId,
            {
              reset: true,
              force: true
            }
          );
        }

        await loadConversations();
        break;

      case "close":
        await closeConversation();
        break;

      case "archive":
        await archiveConversation();
        break;

      case "admin-info":
        showAdminConversationInfo();
        break;

      default:
        break;
    }
  }


  async function closeConversation() {
    if (
      !state.activeConversationId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Вы действительно хотите закрыть этот диалог?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await request(
        CONFIG.API.conversation(
          state.activeConversationId
        ),
        {
          method: "PATCH",
          body: {
            status: "closed"
          }
        }
      );

      state.activeConversation =
        {
          ...state.activeConversation,
          status: "closed"
        };

      renderConversationHeader();
      renderComposer();

      showInfo(
        "Диалог закрыт."
      );
    } catch (error) {
      showError(
        error?.message ||
        "Не удалось закрыть диалог."
      );
    }
  }


  async function archiveConversation() {
    if (
      !state.activeConversationId
    ) {
      return;
    }

    try {
      await request(
        CONFIG.API.conversation(
          state.activeConversationId
        ),
        {
          method: "PATCH",
          body: {
            archived: true
          }
        }
      );

      await loadConversations();

      showInfo(
        "Диалог перемещён в архив."
      );
    } catch (error) {
      showError(
        error?.message ||
        "Не удалось архивировать диалог."
      );
    }
  }


  function showAdminConversationInfo() {
    const conversation =
      state.activeConversation;

    if (!conversation) {
      return;
    }

    const info = [
      `ID диалога: ${conversation.id || "—"}`,
      `Тип: ${conversation.type || "—"}`,
      `Участник ID: ${conversation.participant_id || "—"}`,
      `Username: ${conversation.username || "—"}`,
      `Имя: ${conversation.name || conversation.title || "—"}`,
      `Технический ID: ${conversation.technical_id || "—"}`,
      `Создан: ${formatDateTime(conversation.created_at) || "—"}`
    ].join("\n");

    window.alert(info);
  }


  function showInfo(
    message
  ) {
    if (
      window.TOApp &&
      typeof window.TOApp.showToast ===
        "function"
    ) {
      window.TOApp.showToast(
        message,
        "info"
      );

      return;
    }

    console.info(
      "[TO Chat]",
      message
    );
  }


  /* ==========================================================
     INPUT
     ========================================================== */

  function autoResizeInput() {
    const input =
      $(
        "[data-chat-input]",
        state.ui.composer ||
        document
      );

    if (!input) {
      return;
    }

    input.style.height =
      "auto";

    input.style.height =
      `${Math.min(
        input.scrollHeight,
        180
      )}px`;
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

    if (options.mode) {
      state.mode =
        options.mode;
    } else {
      state.mode =
        loadStorage(
          CONFIG.STORAGE.MODE,
          "participant"
        );
    }

    state.currentUser =
      options.user ||
      null;

    loadDrafts();
    loadUiState();

    renderChatShell();

    await loadCurrentProfile();

    await loadConversations();

    if (
      options.conversationId
    ) {
      await openConversation(
        options.conversationId
      );
    } else {
      const storedConversation =
        loadStorage(
          CONFIG.STORAGE.ACTIVE_CONVERSATION,
          null
        );

      if (
        storedConversation
      ) {
        const exists =
          state.conversations.some(
            (conversation) =>
              String(
                conversation.id
              ) ===
              String(
                storedConversation
              )
          );

        if (exists) {
          await openConversation(
            storedConversation,
            {
              scroll: false
            }
          );
        }
      }
    }

    startConversationPolling();

    dispatch(
      "to:chat:ready",
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
    stopPolling();

    state.observers.forEach(
      (observer) =>
        observer.disconnect()
    );

    state.observers = [];

    state.initialized =
      false;

    state.ui.mounted =
      false;

    eventsBound =
      false;
  }


  /* ==========================================================
     PUBLIC API
     ========================================================== */

  const api = {
    init,

    destroy,

    request,

    loadCurrentProfile,

    loadConversations,

    createAdminConversation,

    openConversation,

    loadMessages,

    loadOlderMessages,

    sendMessage,

    editMessage,

    deleteMessage,

    setReply,

    clearReply,

    setForward,

    forwardMessage,

    reactToMessage,

    togglePinMessage,

    markMessageRead,

    markConversationRead,

    sendTyping,

    loadTyping,

    loadPresence,

    uploadFile,

    handleFiles,

    searchMessages,

    openSearchPanel,

    closeSearchPanel,

    getState() {
      return {
        ...state,

        polling: {
          ...state.polling
        },

        messages: [
          ...state.messages
        ],

        conversations: [
          ...state.conversations
        ]
      };
    },

    getActiveConversation() {
      return state.activeConversation;
    },

    getMessages() {
      return [
        ...state.messages
      ];
    },

    getConversations() {
      return [
        ...state.conversations
      ];
    },

    setMode(mode) {
      state.mode =
        mode ||
        "participant";

      saveStorage(
        CONFIG.STORAGE.MODE,
        state.mode
      );

      renderChatShell();
    },

    setProfile(profile) {
      state.currentProfile =
        profile || null;

      renderConversationHeader();
      renderComposer();
    },

    openAdminChat:
      createAdminConversation,

    send:
      sendMessage,

    edit:
      editMessage,

    remove:
      deleteMessage,

    reply:
      setReply,

    react:
      reactToMessage,

    forward:
      forwardMessage,

    pin:
      togglePinMessage,

    config:
      CONFIG
  };


  /* ==========================================================
     GLOBALS
     ========================================================== */

  window.TOChat =
    api;

  window.Chat =
    api;


  /* ==========================================================
     AUTO INIT
     ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const container =
          findChatContainer();

        if (container) {
          init();
        }
      },
      {
        once: true
      }
    );
  } else {
    const container =
      findChatContainer();

    if (container) {
      init();
    }
  }

})();
