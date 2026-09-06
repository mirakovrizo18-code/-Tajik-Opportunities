<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#071a12">

  <title>Профиль — Tajik Opportunities</title>

  <style>
    :root {
      --bg: #06130e;
      --bg2: #0a1e16;
      --card: rgba(15, 38, 28, .88);
      --card2: rgba(19, 48, 35, .92);
      --border: rgba(255,255,255,.09);
      --text: #f7faf8;
      --muted: #9caea5;
      --green: #20c77a;
      --green2: #0c9b5a;
      --gold: #e5c76b;
      --danger: #ff5e67;
      --shadow: 0 25px 80px rgba(0,0,0,.35);
      --radius: 24px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background:
        radial-gradient(circle at 15% 0%, rgba(20, 160, 96, .18), transparent 35%),
        radial-gradient(circle at 90% 10%, rgba(229, 199, 107, .08), transparent 30%),
        linear-gradient(135deg, #04100b, #071a12 45%, #06130e);
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Arial,
        sans-serif;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .hidden {
      display: none !important;
    }

    .container {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
    }

    /* HEADER */

    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 72px;
      border-bottom: 1px solid rgba(255,255,255,.07);
      background: rgba(4, 15, 10, .82);
      backdrop-filter: blur(20px);
    }

    .topbar-inner {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      display: grid;
      place-items: center;
      background:
        linear-gradient(145deg, rgba(32,199,122,.22), rgba(229,199,107,.1));
      border: 1px solid rgba(32,199,122,.3);
      box-shadow: 0 8px 30px rgba(32,199,122,.12);
      font-size: 21px;
      flex: 0 0 auto;
    }

    .brand-title {
      font-weight: 850;
      letter-spacing: -.4px;
      font-size: 16px;
      white-space: nowrap;
    }

    .brand-subtitle {
      color: var(--muted);
      font-size: 11px;
      margin-top: 2px;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav a,
    .nav button {
      border: 0;
      background: transparent;
      color: #d9e4de;
      padding: 10px 12px;
      border-radius: 12px;
      transition: .2s ease;
    }

    .nav a:hover,
    .nav button:hover {
      background: rgba(255,255,255,.06);
      color: #fff;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-btn {
      width: 42px;
      height: 42px;
      padding: 0;
      border-radius: 13px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.04);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 18px;
    }

    .primary-btn {
      border: 0;
      color: #06130e;
      background: linear-gradient(135deg, #38df91, #16b86e);
      font-weight: 800;
      padding: 11px 17px;
      border-radius: 13px;
      box-shadow: 0 10px 25px rgba(32,199,122,.18);
      transition: transform .18s ease, box-shadow .18s ease;
    }

    .primary-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 32px rgba(32,199,122,.25);
    }

    .secondary-btn {
      border: 1px solid var(--border);
      color: #fff;
      background: rgba(255,255,255,.05);
      padding: 11px 17px;
      border-radius: 13px;
      font-weight: 700;
    }

    .danger-btn {
      border: 1px solid rgba(255,94,103,.25);
      color: #ffadb2;
      background: rgba(255,94,103,.08);
      padding: 11px 17px;
      border-radius: 13px;
      font-weight: 700;
    }

    /* PROFILE */

    main {
      padding: 30px 0 70px;
    }

    .profile-shell {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 30px;
      background: rgba(7, 24, 16, .75);
      box-shadow: var(--shadow);
    }

    .cover {
      height: 250px;
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 20% 20%, rgba(32,199,122,.28), transparent 30%),
        radial-gradient(circle at 80% 10%, rgba(229,199,107,.18), transparent 25%),
        linear-gradient(125deg, #0b3423, #071b13 48%, #102c20);
    }

    .cover::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: .35;
      background:
        linear-gradient(115deg, transparent 20%, rgba(255,255,255,.05) 20.5%, transparent 21%),
        linear-gradient(70deg, transparent 45%, rgba(255,255,255,.04) 45.5%, transparent 46%);
      background-size: 100px 100px;
    }

    .cover-glow {
      position: absolute;
      width: 340px;
      height: 340px;
      border-radius: 50%;
      right: -100px;
      top: -180px;
      background: rgba(32,199,122,.15);
      filter: blur(10px);
    }

    .cover-label {
      position: absolute;
      left: 25px;
      bottom: 22px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(0,0,0,.25);
      border: 1px solid rgba(255,255,255,.1);
      backdrop-filter: blur(12px);
      color: #dbece4;
      font-size: 12px;
    }

    .profile-main {
      padding: 0 28px 28px;
    }

    .profile-head {
      display: flex;
      gap: 20px;
      align-items: flex-end;
      margin-top: -65px;
      position: relative;
    }

    .avatar {
      width: 138px;
      height: 138px;
      border-radius: 38px;
      object-fit: cover;
      border: 6px solid #081b12;
      background: linear-gradient(145deg, #174f35, #0a2619);
      box-shadow: 0 18px 50px rgba(0,0,0,.4);
      flex: 0 0 auto;
    }

    .avatar-placeholder {
      width: 138px;
      height: 138px;
      border-radius: 38px;
      border: 6px solid #081b12;
      background:
        linear-gradient(145deg, rgba(32,199,122,.3), rgba(229,199,107,.1)),
        #102e20;
      box-shadow: 0 18px 50px rgba(0,0,0,.4);
      display: grid;
      place-items: center;
      font-size: 55px;
      flex: 0 0 auto;
    }

    .profile-info {
      flex: 1;
      min-width: 0;
      padding-bottom: 8px;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .profile-name {
      font-size: clamp(27px, 4vw, 39px);
      line-height: 1.05;
      font-weight: 900;
      letter-spacing: -1.2px;
      margin: 0;
    }

    .verified {
      width: 23px;
      height: 23px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #07150e;
      background: linear-gradient(135deg, #55e7a0, #17ae68);
      font-size: 13px;
      font-weight: 900;
    }

    .username {
      color: #8fb2a1;
      margin-top: 7px;
      font-size: 15px;
    }

    .profile-actions {
      display: flex;
      gap: 8px;
      padding-bottom: 8px;
    }

    .bio {
      max-width: 760px;
      margin: 20px 0 0;
      color: #d4dfda;
      line-height: 1.65;
      font-size: 15px;
    }

    .meta-row {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-top: 14px;
      color: var(--muted);
      font-size: 13px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stats {
      margin-top: 25px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border: 1px solid var(--border);
      background: rgba(255,255,255,.025);
      border-radius: 20px;
      overflow: hidden;
    }

    .stat {
      padding: 18px;
      text-align: center;
      border-right: 1px solid var(--border);
    }

    .stat:last-child {
      border-right: 0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 900;
    }

    .stat-label {
      color: var(--muted);
      font-size: 12px;
      margin-top: 4px;
    }

    /* PUBLICATIONS */

    .section {
      margin-top: 28px;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }

    .section-title {
      margin: 0;
      font-size: 21px;
      font-weight: 850;
    }

    .section-subtitle {
      color: var(--muted);
      font-size: 13px;
    }

    .publications {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .publication {
      min-height: 180px;
      padding: 19px;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--card);
      transition: transform .2s ease, border-color .2s ease;
    }

    .publication:hover {
      transform: translateY(-3px);
      border-color: rgba(32,199,122,.25);
    }

    .publication-title {
      font-size: 17px;
      font-weight: 800;
      margin-bottom: 9px;
    }

    .publication-text {
      color: #b9c9c1;
      line-height: 1.55;
      font-size: 13px;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .publication-footer {
      display: flex;
      gap: 12px;
      color: var(--muted);
      font-size: 12px;
      margin-top: 17px;
    }

    .empty {
      padding: 45px 20px;
      border: 1px dashed rgba(255,255,255,.13);
      border-radius: 20px;
      text-align: center;
      color: var(--muted);
      background: rgba(255,255,255,.02);
    }

    .empty-icon {
      font-size: 35px;
      margin-bottom: 10px;
    }

    /* MODAL */

    .modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(0,0,0,.72);
      backdrop-filter: blur(10px);
    }

    .modal-card {
      width: min(530px, 100%);
      max-height: calc(100vh - 36px);
      overflow-y: auto;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 25px;
      background: #0a2116;
      box-shadow: 0 35px 100px rgba(0,0,0,.55);
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      padding: 20px 22px;
      border-bottom: 1px solid var(--border);
    }

    .modal-title {
      margin: 0;
      font-size: 21px;
      font-weight: 850;
    }

    .close-btn {
      width: 38px;
      height: 38px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: rgba(255,255,255,.04);
      color: #fff;
      font-size: 20px;
    }

    .modal-body {
      padding: 22px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 7px;
      color: #cddbd5;
      font-size: 13px;
      font-weight: 700;
    }

    .input,
    .textarea,
    .select {
      width: 100%;
      border: 1px solid rgba(255,255,255,.1);
      outline: none;
      color: #fff;
      background: rgba(0,0,0,.2);
      border-radius: 13px;
      padding: 13px 14px;
      transition: .2s;
    }

    .input:focus,
    .textarea:focus,
    .select:focus {
      border-color: rgba(32,199,122,.6);
      box-shadow: 0 0 0 3px rgba(32,199,122,.08);
    }

    .textarea {
      min-height: 105px;
      resize: vertical;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .check-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 14px;
      margin-top: 9px;
      background: rgba(255,255,255,.025);
    }

    .check-row input {
      margin-top: 3px;
      accent-color: var(--green);
    }

    .check-title {
      font-size: 13px;
      font-weight: 750;
    }

    .check-description {
      color: var(--muted);
      font-size: 11px;
      margin-top: 3px;
      line-height: 1.4;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      padding-top: 7px;
    }

    /* AUTH */

    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      padding: 5px;
      background: rgba(255,255,255,.045);
      border-radius: 14px;
      margin-bottom: 20px;
    }

    .auth-tab {
      border: 0;
      border-radius: 10px;
      padding: 11px;
      color: #9eb1a8;
      background: transparent;
      font-weight: 800;
    }

    .auth-tab.active {
      color: #fff;
      background: rgba(32,199,122,.15);
      box-shadow: inset 0 0 0 1px rgba(32,199,122,.2);
    }

    .auth-note {
      margin: 0 0 17px;
      color: var(--muted);
      line-height: 1.55;
      font-size: 13px;
    }

    .error-box {
      display: none;
      padding: 11px 13px;
      border-radius: 12px;
      border: 1px solid rgba(255,94,103,.25);
      background: rgba(255,94,103,.08);
      color: #ffb1b5;
      font-size: 13px;
      line-height: 1.45;
      margin-bottom: 15px;
    }

    .error-box.show {
      display: block;
    }

    .success-box {
      display: none;
      padding: 11px 13px;
      border-radius: 12px;
      border: 1px solid rgba(32,199,122,.25);
      background: rgba(32,199,122,.08);
      color: #9af0c4;
      font-size: 13px;
      line-height: 1.45;
      margin-bottom: 15px;
    }

    .success-box.show {
      display: block;
    }

    .username-status {
      font-size: 11px;
      margin-top: 5px;
      min-height: 15px;
    }

    .username-status.ok {
      color: #68e7a5;
    }

    .username-status.bad {
      color: #ff858c;
    }

    .loading {
      opacity: .65;
      pointer-events: none;
    }

    /* TOAST */

    .toast {
      position: fixed;
      z-index: 2000;
      left: 50%;
      bottom: 25px;
      transform: translate(-50%, 30px);
      opacity: 0;
      pointer-events: none;
      width: min(440px, calc(100% - 30px));
      padding: 13px 16px;
      border-radius: 15px;
      border: 1px solid var(--border);
      background: rgba(11,31,21,.96);
      box-shadow: 0 20px 60px rgba(0,0,0,.4);
      transition: .25s ease;
      color: #fff;
      font-size: 13px;
    }

    .toast.show {
      opacity: 1;
      transform: translate(-50%, 0);
    }

    .toast.success {
      border-color: rgba(32,199,122,.3);
    }

    .toast.error {
      border-color: rgba(255,94,103,.3);
    }

    /* MOBILE */

    .mobile-menu {
      display: none;
    }

    @media (max-width: 900px) {
      .nav {
        display: none;
      }

      .publications {
        grid-template-columns: repeat(2, 1fr);
      }

      .mobile-menu {
        display: block;
      }
    }

    @media (max-width: 650px) {
      .topbar {
        height: 64px;
      }

      .container {
        width: min(100% - 18px, 1180px);
      }

      main {
        padding-top: 14px;
      }

      .brand-subtitle {
        display: none;
      }

      .brand-logo {
        width: 38px;
        height: 38px;
      }

      .brand-title {
        font-size: 14px;
      }

      .header-actions .secondary-btn {
        display: none;
      }

      .cover {
        height: 180px;
      }

      .profile-shell {
        border-radius: 22px;
      }

      .profile-main {
        padding: 0 15px 20px;
      }

      .profile-head {
        margin-top: -48px;
        display: block;
      }

      .avatar,
      .avatar-placeholder {
        width: 105px;
        height: 105px;
        border-radius: 29px;
      }

      .avatar-placeholder {
        font-size: 42px;
      }

      .profile-info {
        padding-top: 15px;
      }

      .profile-actions {
        padding-top: 15px;
      }

      .profile-actions button {
        flex: 1;
      }

      .stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .stat:nth-child(2) {
        border-right: 0;
      }

      .stat:nth-child(-n+2) {
        border-bottom: 1px solid var(--border);
      }

      .publications {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-card {
        border-radius: 20px;
      }

      .modal-body {
        padding: 17px;
      }
    }
  </style>
</head>

<body>

<header class="topbar">
  <div class="container topbar-inner">

    <a class="brand" href="/">
      <div class="brand-logo">🇹🇯</div>
      <div>
        <div class="brand-title">Tajik Opportunities</div>
        <div class="brand-subtitle">Возможности Таджикистана</div>
      </div>
    </a>

    <nav class="nav">
      <a href="/">Главная</a>
      <a href="/add.html">Создать</a>
      <a href="/saved.html">Сохранённые</a>
      <a href="/messages.html">Сообщения</a>
      <a href="/notifications.html">Уведомления</a>
    </nav>

    <div class="header-actions">
      <button class="icon-btn mobile-menu" id="mobileMenuBtn" title="Меню">☰</button>
      <button class="secondary-btn" id="authHeaderBtn">Войти</button>
    </div>

  </div>
</header>

<main>
  <div class="container">

    <section class="profile-shell">

      <div class="cover">
        <div class="cover-glow"></div>
        <div class="cover-label">🇹🇯 Tajik Opportunities</div>
      </div>

      <div class="profile-main">

        <div class="profile-head">

          <div id="avatarContainer">
            <div class="avatar-placeholder">👤</div>
          </div>

          <div class="profile-info">

            <div class="name-row">
              <h1 class="profile-name" id="profileName">Пользователь</h1>
              <span class="verified hidden" id="verifiedBadge">✓</span>
            </div>

            <div class="username" id="profileUsername">@username</div>

            <div class="meta-row">
              <div class="meta-item" id="locationMeta">📍 Место не указано</div>
              <div class="meta-item" id="languageMeta">🌐 Русский</div>
            </div>

          </div>

          <div class="profile-actions">
            <button class="secondary-btn hidden" id="messageBtn">💬 Написать</button>
            <button class="primary-btn hidden" id="editProfileBtn">✏️ Изменить</button>
            <button class="primary-btn" id="loginProfileBtn">Войти</button>
          </div>

        </div>

        <p class="bio" id="profileBio">
          Добро пожаловать в профиль Tajik Opportunities.
        </p>

        <div class="stats">
          <div class="stat">
            <div class="stat-value" id="publicationsCount">0</div>
            <div class="stat-label">Публикации</div>
          </div>

          <div class="stat">
            <div class="stat-value" id="followersCount">0</div>
            <div class="stat-label">Подписчики</div>
          </div>

          <div class="stat">
            <div class="stat-value" id="followingCount">0</div>
            <div class="stat-label">Подписки</div>
          </div>

          <div class="stat">
            <div class="stat-value" id="viewsCount">0</div>
            <div class="stat-label">Просмотры</div>
          </div>
        </div>

        <section class="section">
          <div class="section-head">
            <div>
              <h2 class="section-title">Публикации</h2>
              <div class="section-subtitle" id="publicationsSubtitle">
                Публикации пользователя
              </div>
            </div>
          </div>

          <div class="publications" id="publicationsList">
            <div class="empty">
              <div class="empty-icon">⏳</div>
              Загружаем публикации...
            </div>
          </div>
        </section>

      </div>
    </section>

  </div>
</main>

<!-- AUTH MODAL -->

<div class="modal hidden" id="authModal">
  <div class="modal-card">

    <div class="modal-head">
      <h2 class="modal-title">Аккаунт</h2>
      <button class="close-btn" data-close="authModal">×</button>
    </div>

    <div class="modal-body">

      <div class="auth-tabs">
        <button class="auth-tab active" id="loginTab">Войти</button>
        <button class="auth-tab" id="registerTab">Регистрация</button>
      </div>

      <div id="authError" class="error-box"></div>
      <div id="authSuccess" class="success-box"></div>

      <!-- LOGIN -->

      <form id="loginForm">

        <p class="auth-note">
          Войдите в свой аккаунт Tajik Opportunities,
          чтобы управлять профилем и публикациями.
        </p>

        <div class="form-group">
          <label class="form-label">Имя пользователя</label>
          <input
            class="input"
            id="loginUsername"
            name="username"
            autocomplete="username"
            placeholder="@username"
            required
          >
        </div>

        <div class="form-group">
          <label class="form-label">Пароль</label>
          <input
            class="input"
            id="loginPassword"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="Введите пароль"
            required
          >
        </div>

        <button class="primary-btn" type="submit" id="loginSubmit" style="width:100%;">
          Войти
        </button>

      </form>

      <!-- REGISTER -->

      <form id="registerForm" class="hidden">

        <p class="auth-note">
          Создайте бесплатный аккаунт, чтобы публиковать возможности,
          вакансии, объявления и управлять своим профилем.
        </p>

        <div class="form-group">
          <label class="form-label">Ваше имя</label>
          <input
            class="input"
            id="registerName"
            name="name"
            autocomplete="name"
            placeholder="Например: Ризо Мироков"
            required
            maxlength="100"
          >
        </div>

        <div class="form-group">
          <label class="form-label">Имя пользователя</label>
          <input
            class="input"
            id="registerUsername"
            name="username"
            autocomplete="username"
            placeholder="rizomirakov"
            minlength="3"
            maxlength="40"
            required
          >
          <div class="username-status" id="usernameStatus"></div>
        </div>

        <div class="form-group">
          <label class="form-label">Email <span style="color:#75887f;">(необязательно)</span></label>
          <input
            class="input"
            id="registerEmail"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="example@mail.com"
          >
        </div>

        <div class="form-group">
          <label class="form-label">Пароль</label>
          <input
            class="input"
            id="registerPassword"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="Минимум 6 символов"
            minlength="6"
            required
          >
        </div>

        <div class="form-group">
          <label class="form-label">Повторите пароль</label>
          <input
            class="input"
            id="registerPassword2"
            name="password2"
            type="password"
            autocomplete="new-password"
            placeholder="Повторите пароль"
            minlength="6"
            required
          >
        </div>

        <button class="primary-btn" type="submit" id="registerSubmit" style="width:100%;">
          Создать аккаунт
        </button>

      </form>

    </div>
  </div>
</div>

<!-- EDIT PROFILE MODAL -->

<div class="modal hidden" id="editModal">
  <div class="modal-card">

    <div class="modal-head">
      <h2 class="modal-title">Редактировать профиль</h2>
      <button class="close-btn" data-close="editModal">×</button>
    </div>

    <div class="modal-body">

      <div id="profileError" class="error-box"></div>

      <form id="profileForm">

        <div class="form-group">
          <label class="form-label">Имя</label>
          <input class="input" id="editName" maxlength="100">
        </div>

        <div class="form-group">
          <label class="form-label">Имя пользователя</label>
          <input class="input" id="editUsername" maxlength="40">
          <div class="username-status" id="editUsernameStatus"></div>
        </div>

        <div class="form-group">
          <label class="form-label">О себе</label>
          <textarea class="textarea" id="editBio" maxlength="1000"></textarea>
        </div>

        <div class="form-row">

          <div class="form-group">
            <label class="form-label">Страна</label>
            <input class="input" id="editCountry" placeholder="Таджикистан">
          </div>

          <div class="form-group">
            <label class="form-label">Город</label>
            <input class="input" id="editCity" placeholder="Душанбе">
          </div>

        </div>

        <div class="form-group">
          <label class="form-label">Язык</label>

          <select class="select" id="editLanguage">
            <option value="ru">Русский</option>
            <option value="tg">Тоҷикӣ</option>
            <option value="en">English</option>
            <option value="fa">فارسی</option>
            <option value="uz">O'zbek</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Ссылка на аватар</label>
          <input
            class="input"
            id="editAvatar"
            placeholder="https://..."
          >
        </div>

        <label class="check-row">
          <input type="checkbox" id="allowMessages">
          <span>
            <div class="check-title">Разрешить сообщения</div>
            <div class="check-description">
              Другие пользователи смогут написать вам.
            </div>
          </span>
        </label>

        <label class="check-row">
          <input type="checkbox" id="showFollowers">
          <span>
            <div class="check-title">Показывать подписчиков</div>
            <div class="check-description">
              Разрешить отображение информации о подписчиках.
            </div>
          </span>
        </label>

        <label class="check-row">
          <input type="checkbox" id="isPublic">
          <span>
            <div class="check-title">Публичный профиль</div>
            <div class="check-description">
              Ваш профиль сможет просматривать любой посетитель.
            </div>
          </span>
        </label>

        <div class="modal-footer">
          <button type="button" class="secondary-btn" data-close="editModal">
            Отмена
          </button>

          <button type="submit" class="primary-btn" id="saveProfileBtn">
            Сохранить
          </button>
        </div>

      </form>

    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
"use strict";

const API = {
  me: "/api/auth/me",
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",
  profile: "/api/profile",
  publicProfile: "/api/profile/public",
  usernameCheck: "/api/username/check",
  publications: "/api/publications"
};

let currentUser = null;
let viewedUser = null;
let usernameTimer = null;

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "") {
  const toast = $("toast");

  toast.textContent = message;
  toast.className = "toast show " + type;

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

function showAuthError(message) {
  const box = $("authError");
  box.textContent = message || "Произошла ошибка.";
  box.classList.add("show");
  $("authSuccess").classList.remove("show");
}

function showAuthSuccess(message) {
  const box = $("authSuccess");
  box.textContent = message || "Готово.";
  box.classList.add("show");
  $("authError").classList.remove("show");
}

function clearAuthMessages() {
  $("authError").classList.remove("show");
  $("authSuccess").classList.remove("show");
  $("authError").textContent = "";
  $("authSuccess").textContent = "";
}

function showProfileError(message) {
  const box = $("profileError");
  box.textContent = message || "Не удалось сохранить профиль.";
  box.classList.add("show");
}

function clearProfileError() {
  $("profileError").classList.remove("show");
  $("profileError").textContent = "";
}

function openModal(id) {
  $(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  $(id).classList.add("hidden");

  if (
    $("authModal").classList.contains("hidden") &&
    $("editModal").classList.contains("hidden")
  ) {
    document.body.style.overflow = "";
  }
}

function setAuthMode(mode) {
  clearAuthMessages();

  if (mode === "register") {
    $("loginTab").classList.remove("active");
    $("registerTab").classList.add("active");

    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");
  } else {
    $("registerTab").classList.remove("active");
    $("loginTab").classList.add("active");

    $("registerForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");
  }
}

async function api(url, options = {}) {
  const config = {
    credentials: "include",
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  };

  let response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new Error(
      "Не удалось соединиться с сервером. Проверьте интернет и адрес сайта."
    );
  }

  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message =
      data?.message ||
      data?.error ||
      data?.detail ||
      `Ошибка сервера (${response.status})`;

    if (response.status === 409) {
      message = data?.message || "Такое имя пользователя уже занято.";
    }

    if (response.status === 401) {
      message = data?.message || "Неверное имя пользователя или пароль.";
    }

    throw new Error(message);
  }

  return data;
}

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    id: user.id ?? user.user_id ?? null,
    username: user.username ?? "",
    name: user.name ?? user.display_name ?? user.username ?? "Пользователь",
    bio: user.bio ?? "",
    avatar: user.avatar ?? "",
    country: user.country ?? "",
    city: user.city ?? "",
    language: user.language ?? "ru",
    verified: Boolean(user.verified),
    allow_messages:
      user.allow_messages === undefined
        ? true
        : Boolean(user.allow_messages),
    show_followers:
      user.show_followers === undefined
        ? true
        : Boolean(user.show_followers),
    is_public:
      user.is_public === undefined
        ? true
        : Boolean(user.is_public)
  };
}

function getProfileId() {
  const params = new URLSearchParams(location.search);

  return (
    params.get("id") ||
    params.get("user_id") ||
    params.get("username") ||
    ""
  ).trim();
}

function isViewingOwnProfile() {
  if (!currentUser || !viewedUser) return false;

  if (currentUser.id && viewedUser.id) {
    return String(currentUser.id) === String(viewedUser.id);
  }

  return (
    currentUser.username &&
    viewedUser.username &&
    currentUser.username.toLowerCase() ===
      viewedUser.username.toLowerCase()
  );
}

function setAvatar(user) {
  const container = $("avatarContainer");

  if (user?.avatar) {
    const img = document.createElement("img");

    img.className = "avatar";
    img.alt = user.name || "Аватар";
    img.src = user.avatar;

    img.onerror = () => {
      container.innerHTML =
        '<div class="avatar-placeholder">👤</div>';
    };

    container.innerHTML = "";
    container.appendChild(img);
  } else {
    const first =
      String(user?.name || user?.username || "П")
        .trim()
        .charAt(0)
        .toUpperCase() || "👤";

    container.innerHTML =
      `<div class="avatar-placeholder">${escapeHtml(first)}</div>`;
  }
}

function renderProfile(user) {
  viewedUser = normalizeUser(user);

  setAvatar(viewedUser);

  $("profileName").textContent =
    viewedUser.name || viewedUser.username || "Пользователь";

  $("profileUsername").textContent =
    viewedUser.username
      ? "@" + viewedUser.username.replace(/^@/, "")
      : "@username";

  $("profileBio").textContent =
    viewedUser.bio ||
    "Пользователь Tajik Opportunities пока не добавил описание.";

  $("locationMeta").textContent =
    viewedUser.city || viewedUser.country
      ? `📍 ${[viewedUser.city, viewedUser.country]
          .filter(Boolean)
          .join(", ")}`
      : "📍 Место не указано";

  const languages = {
    ru: "Русский",
    tg: "Тоҷикӣ",
    en: "English",
    fa: "فارسی",
    uz: "O'zbek"
  };

  $("languageMeta").textContent =
    `🌐 ${languages[viewedUser.language] || viewedUser.language || "Русский"}`;

  $("verifiedBadge").classList.toggle(
    "hidden",
    !viewedUser.verified
  );

  const own = isViewingOwnProfile();

  $("editProfileBtn").classList.toggle("hidden", !own);
  $("loginProfileBtn").classList.toggle("hidden", Boolean(currentUser));

  const canMessage =
    Boolean(currentUser) &&
    !own &&
    viewedUser.allow_messages !== false;

  $("messageBtn").classList.toggle("hidden", !canMessage);

  if (own) {
    $("publicationsSubtitle").textContent =
      "Ваши публикации";
  } else {
    $("publicationsSubtitle").textContent =
      `Публикации ${viewedUser.name || "пользователя"}`;
  }

  $("publicationsCount").textContent =
    viewedUser.publications_count ??
    viewedUser.posts_count ??
    viewedUser.publications ??
    0;

  $("followersCount").textContent =
    viewedUser.followers_count ??
    viewedUser.followers ??
    0;

  $("followingCount").textContent =
    viewedUser.following_count ??
    viewedUser.following ??
    0;

  $("viewsCount").textContent =
    viewedUser.views_count ??
    viewedUser.views ??
    0;
}

async function loadMe() {
  try {
    const data = await api(API.me);

    if (data?.ok === false) {
      currentUser = null;
      return null;
    }

    currentUser = normalizeUser(
      data?.user ||
      data?.profile ||
      (data?.id || data?.username ? data : null)
    );

    return currentUser;
  } catch {
    currentUser = null;
    return null;
  }
}

async function loadProfile() {
  const profileId = getProfileId();

  let user = null;

  if (!profileId) {
    user = currentUser;

    if (!user) {
      renderProfile({
        name: "Ваш профиль",
        username: "guest",
        bio: "Войдите или создайте аккаунт, чтобы заполнить свой профиль."
      });
    }
  } else {
    try {
      const query =
        profileId.startsWith("@")
          ? `username=${encodeURIComponent(profileId.slice(1))}`
          : `id=${encodeURIComponent(profileId)}`;

      const data = await api(
        `${API.publicProfile}?${query}`
      );

      user = normalizeUser(
        data?.user ||
        data?.profile ||
        data
      );
    } catch {
      if (
        currentUser &&
        (
          String(currentUser.id) === String(profileId) ||
          currentUser.username === profileId.replace(/^@/, "")
        )
      ) {
        user = currentUser;
      }
    }
  }

  if (user) {
    renderProfile(user);
    await loadPublications(user);
  } else {
    renderProfile({
      name: "Профиль не найден",
      username: "not-found",
      bio: "Пользователь не найден или профиль недоступен."
    });

    $("publicationsList").innerHTML = `
      <div class="empty">
        <div class="empty-icon">🔎</div>
        Профиль не найден.
      </div>
    `;
  }

  updateHeader();
}

async function loadPublications(user) {
  const list = $("publicationsList");

  list.innerHTML = `
    <div class="empty">
      <div class="empty-icon">⏳</div>
      Загружаем публикации...
    </div>
  `;

  try {
    const params = new URLSearchParams();

    if (user?.id) {
      params.set("user_id", user.id);
    } else if (user?.username) {
      params.set("username", user.username);
    }

    const data = await api(
      `${API.publications}?${params.toString()}`
    );

    let publications = [];

    if (Array.isArray(data)) {
      publications = data;
    } else if (Array.isArray(data?.publications)) {
      publications = data.publications;
    } else if (Array.isArray(data?.items)) {
      publications = data.items;
    } else if (Array.isArray(data?.results)) {
      publications = data.results;
    }

    if (!publications.length) {
      list.innerHTML = `
        <div class="empty" style="grid-column:1/-1;">
          <div class="empty-icon">📝</div>
          <div>Пока нет опубликованных материалов.</div>
          ${
            isViewingOwnProfile()
              ? `<div style="margin-top:14px;">
                  <a href="/add.html" class="primary-btn">
                    Создать публикацию
                  </a>
                </div>`
              : ""
          }
        </div>
      `;

      return;
    }

    list.innerHTML = publications.map(renderPublication).join("");

  } catch (error) {
    list.innerHTML = `
      <div class="empty" style="grid-column:1/-1;">
        <div class="empty-icon">⚠️</div>
        Не удалось загрузить публикации.
      </div>
    `;
  }
}

function renderPublication(post) {
  const id =
    post.id ??
    post.publication_id ??
    post.post_id ??
    "";

  const title =
    post.title ||
    post.name ||
    "Без названия";

  const text =
    post.content ||
    post.text ||
    post.description ||
    "";

  const date =
    post.created_at ||
    post.published_at ||
    post.date ||
    "";

  let formattedDate = "";

  if (date) {
    try {
      formattedDate = new Date(date).toLocaleDateString(
        "ru-RU",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }
      );
    } catch {
      formattedDate = String(date);
    }
  }

  return `
    <a
      class="publication"
      href="/post.html?id=${encodeURIComponent(id)}"
    >
      <div class="publication-title">
        ${escapeHtml(title)}
      </div>

      <div class="publication-text">
        ${escapeHtml(text)}
      </div>

      <div class="publication-footer">
        ${
          formattedDate
            ? `<span>📅 ${escapeHtml(formattedDate)}</span>`
            : ""
        }

        <span>
          👁 ${escapeHtml(
            post.views_count ??
            post.views ??
            0
          )}
        </span>

        <span>
          ❤️ ${escapeHtml(
            post.likes_count ??
            post.likes ??
            0
          )}
        </span>
      </div>
    </a>
  `;
}

function updateHeader() {
  const btn = $("authHeaderBtn");

  if (currentUser) {
    btn.textContent = "Профиль";

    btn.onclick = () => {
      const username =
        currentUser.username
          ? `?username=${encodeURIComponent(currentUser.username)}`
          : "";

      if (location.search !== username) {
        location.href = `/profile.html${username}`;
      }
    };
  } else {
    btn.textContent = "Войти";
    btn.onclick = () => {
      setAuthMode("login");
      openModal("authModal");
    };
  }
}

function fillEditForm() {
  if (!currentUser) return;

  $("editName").value =
    currentUser.name || "";

  $("editUsername").value =
    currentUser.username || "";

  $("editBio").value =
    currentUser.bio || "";

  $("editCountry").value =
    currentUser.country || "";

  $("editCity").value =
    currentUser.city || "";

  $("editLanguage").value =
    currentUser.language || "ru";

  $("editAvatar").value =
    currentUser.avatar || "";

  $("allowMessages").checked =
    currentUser.allow_messages !== false;

  $("showFollowers").checked =
    currentUser.show_followers !== false;

  $("isPublic").checked =
    currentUser.is_public !== false;

  clearProfileError();
}

async function checkUsername(username, statusElement, currentUsername = "") {
  username = username
    .trim()
    .replace(/^@/, "")
    .toLowerCase();

  if (!username) {
    statusElement.textContent = "";
    statusElement.className = "username-status";
    return true;
  }

  if (username === String(currentUsername).toLowerCase()) {
    statusElement.textContent = "✓ Ваше текущее имя пользователя";
    statusElement.className = "username-status ok";
    return true;
  }

  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    statusElement.textContent =
      "Можно использовать латинские буквы, цифры, _, . и -";
    statusElement.className = "username-status bad";
    return false;
  }

  try {
    const data = await api(
      `${API.usernameCheck}?username=${encodeURIComponent(username)}`
    );

    const available =
      data?.available ??
      data?.ok ??
      data?.is_available;

    if (available === true) {
      statusElement.textContent =
        "✓ Имя пользователя свободно";
      statusElement.className =
        "username-status ok";
      return true;
    }

    if (available === false) {
      statusElement.textContent =
        "✕ Это имя пользователя уже занято";
      statusElement.className =
        "username-status bad";
      return false;
    }

    statusElement.textContent = "";
    statusElement.className = "username-status";

    return true;

  } catch {
    statusElement.textContent = "";
    statusElement.className = "username-status";
    return true;
  }
}

/* AUTH: LOGIN */

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAuthMessages();

  const username = $("loginUsername").value
    .trim()
    .replace(/^@/, "");

  const password = $("loginPassword").value;

  if (!username || !password) {
    showAuthError("Введите имя пользователя и пароль.");
    return;
  }

  const button = $("loginSubmit");

  button.disabled = true;
  button.textContent = "Входим...";

  try {
    const data = await api(API.login, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    currentUser = normalizeUser(
      data?.user ||
      data?.profile ||
      data
    );

    if (!currentUser) {
      currentUser = await loadMe();
    }

    showAuthSuccess("Вход выполнен успешно.");

    showToast("Добро пожаловать! 👋", "success");

    setTimeout(async () => {
      closeModal("authModal");
      await loadProfile();
      updateHeader();
    }, 500);

  } catch (error) {
    showAuthError(
      error.message ||
      "Не удалось войти. Проверьте данные."
    );
  } finally {
    button.disabled = false;
    button.textContent = "Войти";
  }
});

/* AUTH: REGISTER */

$("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAuthMessages();

  const name = $("registerName").value.trim();

  const username = $("registerUsername").value
    .trim()
    .replace(/^@/, "")
    .toLowerCase();

  const email = $("registerEmail").value.trim();

  const password = $("registerPassword").value;

  const password2 = $("registerPassword2").value;

  if (!name) {
    showAuthError("Введите ваше имя.");
    $("registerName").focus();
    return;
  }

  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    showAuthError(
      "Имя пользователя должно содержать от 3 до 40 символов: латинские буквы, цифры, _, . или -."
    );
    $("registerUsername").focus();
    return;
  }

  if (password.length < 6) {
    showAuthError(
      "Пароль должен содержать минимум 6 символов."
    );
    $("registerPassword").focus();
    return;
  }

  if (password !== password2) {
    showAuthError("Пароли не совпадают.");
    $("registerPassword2").focus();
    return;
  }

  const button = $("registerSubmit");

  button.disabled = true;
  button.textContent = "Создаём аккаунт...";

  try {
    /*
      ВАЖНО:
      Отправляем именно те поля, которые ожидает Worker:
      name, username, email, password.
    */

    const payload = {
      name,
      username,
      password
    };

    if (email) {
      payload.email = email;
    }

    const data = await api(API.register, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (data?.ok === false) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Не удалось создать аккаунт."
      );
    }

    currentUser = normalizeUser(
      data?.user ||
      data?.profile ||
      data
    );

    /*
      Worker после успешной регистрации устанавливает
      cookie to_session. Если пользователь не вернулся
      в ответе — дополнительно проверяем текущую сессию.
    */

    if (!currentUser?.username) {
      currentUser = await loadMe();
    }

    showAuthSuccess(
      "Аккаунт успешно создан! Вы вошли в систему."
    );

    showToast(
      "Аккаунт создан успешно 🎉",
      "success"
    );

    $("registerForm").reset();
    $("usernameStatus").textContent = "";
    $("usernameStatus").className =
      "username-status";

    setTimeout(async () => {
      closeModal("authModal");

      if (currentUser?.username) {
        const url =
          `/profile.html?username=${encodeURIComponent(
            currentUser.username
          )}`;

        if (
          location.pathname === "/profile.html" &&
          location.search !==
            `?username=${encodeURIComponent(currentUser.username)}`
        ) {
          history.replaceState({}, "", url);
        }
      }

      await loadProfile();
      updateHeader();
    }, 700);

  } catch (error) {
    showAuthError(
      error.message ||
      "Не удалось создать аккаунт."
    );
  } finally {
    button.disabled = false;
    button.textContent = "Создать аккаунт";
  }
});

/* USERNAME CHECK */

$("registerUsername").addEventListener("input", () => {
  clearTimeout(usernameTimer);

  const value = $("registerUsername").value;
  const status = $("usernameStatus");

  status.textContent = "Проверяем...";
  status.className = "username-status";

  usernameTimer = setTimeout(() => {
    checkUsername(value, status);
  }, 450);
});

$("editUsername").addEventListener("input", () => {
  clearTimeout(usernameTimer);

  const value = $("editUsername").value;
  const status = $("editUsernameStatus");

  status.textContent = "Проверяем...";
  status.className = "username-status";

  usernameTimer = setTimeout(() => {
    checkUsername(
      value,
      status,
      currentUser?.username || ""
    );
  }, 450);
});

/* PROFILE SAVE */

$("profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showToast("Сначала войдите в аккаунт.", "error");
    return;
  }

  clearProfileError();

  const name = $("editName").value.trim();

  const username = $("editUsername").value
    .trim()
    .replace(/^@/, "")
    .toLowerCase();

  const bio = $("editBio").value.trim();

  const country = $("editCountry").value.trim();

  const city = $("editCity").value.trim();

  const language = $("editLanguage").value;

  const avatar = $("editAvatar").value.trim();

  if (!name) {
    showProfileError("Введите имя.");
    return;
  }

  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    showProfileError(
      "Имя пользователя должно содержать от 3 до 40 символов."
    );
    return;
  }

  const button = $("saveProfileBtn");

  button.disabled = true;
  button.textContent = "Сохраняем...";

  try {
    const data = await api(API.profile, {
      method: "PUT",
      body: JSON.stringify({
        name,
        username,
        bio,
        country,
        city,
        language,
        avatar,
        allow_messages:
          $("allowMessages").checked,
        show_followers:
          $("showFollowers").checked,
        is_public:
          $("isPublic").checked
      })
    });

    currentUser = normalizeUser(
      data?.user ||
      data?.profile ||
      data
    );

    if (!currentUser?.username) {
      currentUser = await loadMe();
    }

    showToast(
      "Профиль успешно сохранён ✓",
      "success"
    );

    closeModal("editModal");

    await loadProfile();
    updateHeader();

  } catch (error) {
    showProfileError(
      error.message ||
      "Не удалось сохранить профиль."
    );
  } finally {
    button.disabled = false;
    button.textContent = "Сохранить";
  }
});

/* EDIT BUTTON */

$("editProfileBtn").addEventListener("click", () => {
  if (!currentUser) {
    setAuthMode("login");
    openModal("authModal");
    return;
  }

  fillEditForm();
  openModal("editModal");
});

/* LOGIN BUTTONS */

$("loginProfileBtn").addEventListener("click", () => {
  setAuthMode("login");
  openModal("authModal");
});

$("authHeaderBtn").addEventListener("click", () => {
  if (currentUser) {
    const username =
      currentUser.username
        ? `?username=${encodeURIComponent(currentUser.username)}`
        : "";

    location.href =
      `/profile.html${username}`;
  } else {
    setAuthMode("login");
    openModal("authModal");
  }
});

/* MESSAGE BUTTON */

$("messageBtn").addEventListener("click", () => {
  if (!currentUser) {
    setAuthMode("login");
    openModal("authModal");
    return;
  }

  if (!viewedUser?.id) {
    showToast(
      "Не удалось определить пользователя.",
      "error"
    );
    return;
  }

  location.href =
    `/messages.html?with=${encodeURIComponent(
      viewedUser.id
    )}`;
});

/* AUTH TABS */

$("loginTab").addEventListener("click", () => {
  setAuthMode("login");
});

$("registerTab").addEventListener("click", () => {
  setAuthMode("register");
});

/* CLOSE BUTTONS */

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

$("authModal").addEventListener("click", (event) => {
  if (event.target === $("authModal")) {
    closeModal("authModal");
  }
});

$("editModal").addEventListener("click", (event) => {
  if (event.target === $("editModal")) {
    closeModal("editModal");
  }
});

/* ESC */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (!$("authModal").classList.contains("hidden")) {
    closeModal("authModal");
  }

  if (!$("editModal").classList.contains("hidden")) {
    closeModal("editModal");
  }
});

/* MOBILE MENU */

$("mobileMenuBtn").addEventListener("click", () => {
  const links = [
    ["/", "🏠 Главная"],
    ["/add.html", "➕ Создать публикацию"],
    ["/saved.html", "🔖 Сохранённые"],
    ["/messages.html", "💬 Сообщения"],
    ["/notifications.html", "🔔 Уведомления"]
  ];

  const existing = document.querySelector(".mobile-panel");

  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement("div");

  panel.className = "mobile-panel";

  panel.style.cssText = `
    position:fixed;
    top:72px;
    right:12px;
    z-index:500;
    width:230px;
    padding:9px;
    border:1px solid rgba(255,255,255,.1);
    border-radius:17px;
    background:rgba(8,27,18,.97);
    box-shadow:0 20px 60px rgba(0,0,0,.45);
    backdrop-filter:blur(20px);
  `;

  panel.innerHTML = links.map(([url, text]) => `
    <a
      href="${url}"
      style="
        display:block;
        padding:12px;
        border-radius:11px;
        color:#dbe7e1;
      "
    >
      ${text}
    </a>
  `).join("");

  document.body.appendChild(panel);
});

/* START */

(async function init() {

  /*
    Сначала проверяем существующую сессию.
    Это важно: если регистрация уже прошла,
    пользователь должен сразу остаться авторизованным.
  */

  await loadMe();

  updateHeader();

  await loadProfile();

})();
</script>

</body>
</html>
