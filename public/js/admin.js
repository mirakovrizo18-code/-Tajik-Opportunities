<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#101827">
<title>Tajik Opportunities — Admin</title>

<style>
:root{
  --bg:#f4f7fb;
  --panel:#ffffff;
  --panel2:#f8fafc;
  --text:#172033;
  --muted:#718096;
  --line:#e6ebf2;
  --primary:#2563eb;
  --primary2:#1d4ed8;
  --success:#16a34a;
  --danger:#dc2626;
  --warning:#d97706;
  --purple:#7c3aed;
  --dark:#0f172a;
  --shadow:0 18px 55px rgba(15,23,42,.09);
  --radius:18px;
}

*{box-sizing:border-box}

html,body{
  margin:0;
  padding:0;
  min-height:100%;
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:var(--bg);
  color:var(--text);
}

button,input,select,textarea{
  font:inherit;
}

button{
  cursor:pointer;
}

.hidden{
  display:none!important;
}

/* LOGIN */

.login-screen{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:25px;
  background:
    radial-gradient(circle at 10% 10%,rgba(37,99,235,.22),transparent 30%),
    radial-gradient(circle at 90% 90%,rgba(124,58,237,.2),transparent 30%),
    #0b1220;
}

.login-card{
  width:min(460px,100%);
  background:rgba(255,255,255,.97);
  border-radius:28px;
  padding:38px;
  box-shadow:0 30px 100px rgba(0,0,0,.3);
}

.brand{
  display:flex;
  align-items:center;
  gap:14px;
  margin-bottom:30px;
}

.brand-logo{
  width:54px;
  height:54px;
  border-radius:17px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#2563eb,#7c3aed);
  color:white;
  font-size:25px;
  box-shadow:0 10px 30px rgba(37,99,235,.3);
}

.brand-title{
  font-size:21px;
  font-weight:900;
}

.brand-sub{
  color:var(--muted);
  font-size:13px;
  margin-top:3px;
}

.login-card h1{
  margin:0 0 8px;
  font-size:28px;
}

.login-card p{
  color:var(--muted);
  line-height:1.6;
}

.field{
  margin-bottom:17px;
}

.field label{
  display:block;
  font-size:13px;
  font-weight:800;
  margin-bottom:8px;
}

.field input,
.field select,
.field textarea{
  width:100%;
  border:1px solid var(--line);
  background:white;
  border-radius:13px;
  padding:13px 14px;
  outline:none;
  color:var(--text);
  transition:.2s;
}

.field input:focus,
.field select:focus,
.field textarea:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 4px rgba(37,99,235,.09);
}

.login-button{
  width:100%;
  border:0;
  color:white;
  padding:14px;
  border-radius:14px;
  background:linear-gradient(135deg,#2563eb,#4f46e5);
  font-weight:900;
  box-shadow:0 12px 30px rgba(37,99,235,.25);
}

.login-error{
  margin-top:14px;
  padding:12px;
  border-radius:12px;
  background:#fef2f2;
  color:#b91c1c;
  font-size:13px;
}

/* APP */

.app{
  display:flex;
  min-height:100vh;
}

.sidebar{
  width:275px;
  position:fixed;
  inset:0 auto 0 0;
  background:#0d1525;
  color:white;
  overflow-y:auto;
  z-index:50;
  border-right:1px solid rgba(255,255,255,.06);
}

.sidebar-top{
  padding:23px 19px;
  border-bottom:1px solid rgba(255,255,255,.07);
}

.sidebar-brand{
  display:flex;
  gap:12px;
  align-items:center;
}

.sidebar-logo{
  width:43px;
  height:43px;
  border-radius:13px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#2563eb,#7c3aed);
  font-size:21px;
}

.sidebar-brand strong{
  display:block;
  font-size:15px;
}

.sidebar-brand span{
  color:#9aa8be;
  font-size:11px;
}

.nav{
  padding:15px 10px 30px;
}

.nav-section{
  color:#69778f;
  font-size:10px;
  text-transform:uppercase;
  letter-spacing:1.2px;
  font-weight:900;
  padding:15px 12px 7px;
}

.nav-item{
  width:100%;
  border:0;
  background:transparent;
  color:#b9c3d3;
  padding:11px 12px;
  border-radius:11px;
  display:flex;
  align-items:center;
  gap:11px;
  text-align:left;
  font-size:13px;
  margin:2px 0;
  transition:.18s;
}

.nav-item:hover{
  background:rgba(255,255,255,.06);
  color:white;
}

.nav-item.active{
  background:linear-gradient(90deg,rgba(37,99,235,.9),rgba(79,70,229,.85));
  color:white;
  box-shadow:0 7px 22px rgba(37,99,235,.2);
}

.nav-icon{
  width:21px;
  text-align:center;
  font-size:15px;
}

.nav-badge{
  margin-left:auto;
  min-width:20px;
  padding:2px 6px;
  text-align:center;
  border-radius:20px;
  background:#ef4444;
  color:white;
  font-size:10px;
  font-weight:900;
}

.main{
  margin-left:275px;
  width:calc(100% - 275px);
  min-width:0;
}

.topbar{
  height:72px;
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(18px);
  border-bottom:1px solid var(--line);
  position:sticky;
  top:0;
  z-index:30;
  display:flex;
  align-items:center;
  gap:14px;
  padding:0 25px;
}

.mobile-menu{
  display:none;
  border:0;
  background:#eef2ff;
  width:40px;
  height:40px;
  border-radius:12px;
}

.global-search{
  flex:1;
  max-width:620px;
  position:relative;
}

.global-search input{
  width:100%;
  border:1px solid var(--line);
  background:#f7f9fc;
  padding:11px 15px 11px 42px;
  border-radius:13px;
  outline:none;
}

.search-icon{
  position:absolute;
  left:14px;
  top:10px;
  color:#8a96a9;
}

.top-actions{
  margin-left:auto;
  display:flex;
  align-items:center;
  gap:9px;
}

.icon-button{
  width:40px;
  height:40px;
  border:1px solid var(--line);
  background:white;
  border-radius:12px;
  position:relative;
}

.admin-mini{
  display:flex;
  align-items:center;
  gap:9px;
  padding-left:8px;
}

.admin-avatar{
  width:39px;
  height:39px;
  border-radius:12px;
  background:linear-gradient(135deg,#1e293b,#475569);
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
}

.admin-mini strong{
  display:block;
  font-size:12px;
}

.admin-mini span{
  display:block;
  color:var(--muted);
  font-size:10px;
}

.content{
  padding:25px;
  max-width:1800px;
  margin:auto;
}

.page-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:15px;
  margin-bottom:22px;
}

.page-title{
  margin:0;
  font-size:27px;
  font-weight:950;
  letter-spacing:-.5px;
}

.page-description{
  color:var(--muted);
  margin-top:6px;
  font-size:13px;
}

.head-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.btn{
  border:1px solid var(--line);
  background:white;
  color:var(--text);
  padding:10px 14px;
  border-radius:11px;
  font-weight:800;
  font-size:12px;
}

.btn:hover{
  transform:translateY(-1px);
  box-shadow:0 7px 20px rgba(15,23,42,.07);
}

.btn-primary{
  background:var(--primary);
  color:white;
  border-color:var(--primary);
}

.btn-success{
  background:#ecfdf3;
  color:#15803d;
  border-color:#bbf7d0;
}

.btn-danger{
  background:#fef2f2;
  color:#b91c1c;
  border-color:#fecaca;
}

.btn-warning{
  background:#fff7ed;
  color:#c2410c;
  border-color:#fed7aa;
}

.btn-dark{
  background:#111827;
  color:white;
  border-color:#111827;
}

/* DASHBOARD */

.stat-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:15px;
  margin-bottom:20px;
}

.stat-card{
  background:white;
  border:1px solid var(--line);
  border-radius:17px;
  padding:19px;
  box-shadow:0 5px 20px rgba(15,23,42,.035);
}

.stat-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.stat-icon{
  width:40px;
  height:40px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#eff6ff;
  font-size:18px;
}

.stat-label{
  color:var(--muted);
  font-size:12px;
  font-weight:700;
}

.stat-value{
  font-size:27px;
  font-weight:950;
  margin-top:11px;
}

.stat-foot{
  margin-top:7px;
  color:#94a3b8;
  font-size:11px;
}

.dashboard-grid{
  display:grid;
  grid-template-columns:1.5fr 1fr;
  gap:18px;
}

.card{
  background:white;
  border:1px solid var(--line);
  border-radius:18px;
  box-shadow:0 5px 25px rgba(15,23,42,.035);
  overflow:hidden;
}

.card-head{
  padding:17px 19px;
  border-bottom:1px solid var(--line);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.card-head h3{
  margin:0;
  font-size:14px;
}

.card-body{
  padding:19px;
}

/* TABLE */

.toolbar{
  display:flex;
  gap:9px;
  flex-wrap:wrap;
  padding:15px;
  border-bottom:1px solid var(--line);
  background:#fbfcfe;
}

.toolbar input,
.toolbar select{
  border:1px solid var(--line);
  background:white;
  padding:10px 12px;
  border-radius:10px;
  outline:none;
  min-width:150px;
}

.table-wrap{
  width:100%;
  overflow-x:auto;
}

table{
  width:100%;
  border-collapse:collapse;
  min-width:850px;
}

th{
  text-align:left;
  color:#7b8799;
  font-size:10px;
  text-transform:uppercase;
  letter-spacing:.7px;
  padding:13px 15px;
  background:#fbfcfe;
  border-bottom:1px solid var(--line);
}

td{
  padding:13px 15px;
  border-bottom:1px solid #edf0f4;
  font-size:12px;
  vertical-align:middle;
}

tr:hover td{
  background:#fbfdff;
}

.status{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:5px 8px;
  border-radius:30px;
  font-size:10px;
  font-weight:900;
}

.status-published{background:#ecfdf3;color:#15803d}
.status-pending{background:#fff7ed;color:#c2410c}
.status-rejected{background:#fef2f2;color:#b91c1c}
.status-archived{background:#f1f5f9;color:#64748b}
.status-deleted{background:#fef2f2;color:#991b1b}
.status-active{background:#ecfdf3;color:#15803d}
.status-blocked{background:#fef2f2;color:#b91c1c}

.row-actions{
  display:flex;
  gap:5px;
  flex-wrap:wrap;
}

.small-btn{
  border:1px solid var(--line);
  background:white;
  border-radius:8px;
  padding:6px 8px;
  font-size:10px;
  font-weight:800;
}

.small-btn:hover{
  background:#f8fafc;
}

/* MODALS */

.modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.58);
  backdrop-filter:blur(5px);
  z-index:100;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
}

.modal{
  width:min(1000px,100%);
  max-height:calc(100vh - 36px);
  overflow:auto;
  background:white;
  border-radius:22px;
  box-shadow:0 30px 100px rgba(0,0,0,.25);
}

.modal.large{
  width:min(1250px,100%);
}

.modal-head{
  position:sticky;
  top:0;
  z-index:2;
  background:white;
  padding:18px 20px;
  border-bottom:1px solid var(--line);
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.modal-head h2{
  margin:0;
  font-size:18px;
}

.modal-close{
  width:36px;
  height:36px;
  border:0;
  background:#f1f5f9;
  border-radius:10px;
}

.modal-body{
  padding:20px;
}

.form-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:15px;
}

.form-full{
  grid-column:1/-1;
}

.modal-foot{
  position:sticky;
  bottom:0;
  background:white;
  padding:15px 20px;
  border-top:1px solid var(--line);
  display:flex;
  justify-content:flex-end;
  gap:8px;
}

/* CHAT */

.chat-layout{
  display:grid;
  grid-template-columns:330px 1fr;
  min-height:620px;
}

.chat-list{
  border-right:1px solid var(--line);
  overflow:auto;
}

.chat-search{
  padding:12px;
  border-bottom:1px solid var(--line);
}

.chat-search input{
  width:100%;
  padding:10px;
  border:1px solid var(--line);
  border-radius:10px;
}

.chat-user{
  padding:13px;
  border-bottom:1px solid #edf0f4;
  cursor:pointer;
  display:flex;
  gap:10px;
}

.chat-user:hover,
.chat-user.active{
  background:#f5f8ff;
}

.chat-avatar{
  width:40px;
  height:40px;
  flex:none;
  border-radius:12px;
  background:#e8eefc;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
}

.chat-info{
  min-width:0;
  flex:1;
}

.chat-info strong{
  display:block;
  font-size:12px;
}

.chat-info span{
  display:block;
  color:var(--muted);
  font-size:10px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  margin-top:3px;
}

.chat-window{
  display:flex;
  flex-direction:column;
  min-width:0;
}

.chat-header{
  padding:15px 18px;
  border-bottom:1px solid var(--line);
}

.chat-header strong{
  font-size:13px;
}

.chat-header small{
  display:block;
  color:var(--muted);
  margin-top:4px;
}

.chat-messages{
  flex:1;
  padding:20px;
  background:#f7f9fc;
  overflow:auto;
  min-height:440px;
}

.message{
  max-width:72%;
  margin-bottom:12px;
}

.message.mine{
  margin-left:auto;
}

.message-bubble{
  padding:10px 13px;
  border-radius:15px;
  background:white;
  border:1px solid var(--line);
  font-size:12px;
  line-height:1.5;
}

.message.mine .message-bubble{
  background:#2563eb;
  color:white;
  border-color:#2563eb;
}

.message-time{
  font-size:9px;
  color:#94a3b8;
  margin-top:3px;
}

.chat-compose{
  padding:12px;
  border-top:1px solid var(--line);
  display:flex;
  gap:8px;
}

.chat-compose textarea{
  flex:1;
  resize:none;
  height:43px;
  border:1px solid var(--line);
  border-radius:12px;
  padding:11px;
}

/* SETTINGS */

.settings-grid{
  display:grid;
  grid-template-columns:250px 1fr;
}

.settings-nav{
  border-right:1px solid var(--line);
  padding:12px;
}

.settings-tab{
  width:100%;
  text-align:left;
  padding:11px;
  border:0;
  background:transparent;
  border-radius:10px;
  font-weight:800;
  font-size:12px;
}

.settings-tab.active{
  background:#eff6ff;
  color:#1d4ed8;
}

.setting-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:15px 0;
  border-bottom:1px solid #edf0f4;
  gap:20px;
}

.setting-row strong{
  display:block;
  font-size:12px;
}

.setting-row span{
  display:block;
  color:var(--muted);
  font-size:10px;
  margin-top:4px;
}

.switch{
  width:44px;
  height:24px;
  border-radius:20px;
  background:#cbd5e1;
  position:relative;
  border:0;
  flex:none;
}

.switch::after{
  content:"";
  position:absolute;
  width:18px;
  height:18px;
  top:3px;
  left:3px;
  border-radius:50%;
  background:white;
  transition:.2s;
}

.switch.on{
  background:#2563eb;
}

.switch.on::after{
  left:23px;
}

/* EMPTY */

.empty{
  padding:55px 20px;
  text-align:center;
  color:var(--muted);
}

.empty-icon{
  font-size:38px;
  margin-bottom:10px;
}

/* TOAST */

.toast-box{
  position:fixed;
  right:20px;
  bottom:20px;
  z-index:300;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.toast{
  min-width:270px;
  max-width:380px;
  background:#111827;
  color:white;
  padding:13px 15px;
  border-radius:13px;
  box-shadow:0 15px 40px rgba(0,0,0,.2);
  font-size:12px;
  animation:toastIn .2s ease;
}

.toast.success{border-left:4px solid #22c55e}
.toast.error{border-left:4px solid #ef4444}

@keyframes toastIn{
  from{transform:translateY(10px);opacity:0}
  to{transform:translateY(0);opacity:1}
}

/* RESPONSIVE */

@media(max-width:1150px){
  .stat-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .dashboard-grid{
    grid-template-columns:1fr;
  }
}

@media(max-width:850px){
  .sidebar{
    transform:translateX(-100%);
    transition:.25s;
  }

  .sidebar.open{
    transform:translateX(0);
  }

  .main{
    margin-left:0;
    width:100%;
  }

  .mobile-menu{
    display:block;
  }

  .admin-mini .admin-text{
    display:none;
  }

  .content{
    padding:17px;
  }

  .settings-grid{
    grid-template-columns:1fr;
  }

  .settings-nav{
    border-right:0;
    border-bottom:1px solid var(--line);
    display:flex;
    overflow:auto;
  }

  .settings-tab{
    min-width:130px;
  }
}

@media(max-width:600px){
  .topbar{
    padding:0 12px;
  }

  .global-search{
    display:none;
  }

  .stat-grid{
    grid-template-columns:1fr;
  }

  .page-head{
    flex-direction:column;
  }

  .form-grid{
    grid-template-columns:1fr;
  }

  .form-full{
    grid-column:auto;
  }

  .chat-layout{
    grid-template-columns:1fr;
  }

  .chat-list{
    max-height:230px;
    border-right:0;
    border-bottom:1px solid var(--line);
  }

  .login-card{
    padding:25px;
  }
}
</style>
</head>

<body>

<!-- LOGIN -->

<section id="loginScreen" class="login-screen">
  <div class="login-card">

    <div class="brand">
      <div class="brand-logo">🇹🇯</div>
      <div>
        <div class="brand-title">Tajik Opportunities</div>
        <div class="brand-sub">Administrative Control Center</div>
      </div>
    </div>

    <h1>Административный вход</h1>
    <p>
      Панель полного управления платформой.
      Участникам не требуется регистрация или обычный вход.
    </p>

    <form id="loginForm">

      <div class="field">
        <label>Имя администратора</label>
        <input id="loginUsername" value="admin" autocomplete="username" required>
      </div>

      <div class="field">
        <label>Пароль</label>
        <input id="loginPassword" type="password" autocomplete="current-password" required>
      </div>

      <button class="login-button" type="submit">
        Войти в панель
      </button>

      <div id="loginError" class="login-error hidden"></div>

    </form>
  </div>
</section>


<!-- APP -->

<div id="app" class="app hidden">

  <aside id="sidebar" class="sidebar">

    <div class="sidebar-top">
      <div class="sidebar-brand">
        <div class="sidebar-logo">🇹🇯</div>
        <div>
          <strong>Tajik Opportunities</strong>
          <span>ADMIN CONTROL CENTER</span>
        </div>
      </div>
    </div>

    <nav class="nav">

      <div class="nav-section">Главное</div>

      <button class="nav-item active" data-page="dashboard">
        <span class="nav-icon">📊</span>
        Обзор
      </button>

      <button class="nav-item" data-page="publications">
        <span class="nav-icon">📰</span>
        Публикации
        <span id="pendingBadge" class="nav-badge hidden">0</span>
      </button>

      <button class="nav-item" data-page="pending">
        <span class="nav-icon">⏳</span>
        Ожидают разрешения
      </button>

      <button class="nav-item" data-page="participants">
        <span class="nav-icon">👥</span>
        Участники
      </button>

      <div class="nav-section">Общение</div>

      <button class="nav-item" data-page="chats">
        <span class="nav-icon">💬</span>
        Чаты
        <span id="chatBadge" class="nav-badge hidden">0</span>
      </button>

      <button class="nav-item" data-page="comments">
        <span class="nav-icon">💭</span>
        Комментарии
      </button>

      <button class="nav-item" data-page="notifications">
        <span class="nav-icon">🔔</span>
        Уведомления
      </button>

      <button class="nav-item" data-page="reports">
        <span class="nav-icon">🚨</span>
        Жалобы
      </button>

      <div class="nav-section">Социальные функции</div>

      <button class="nav-item" data-page="reactions">
        <span class="nav-icon">❤️</span>
        Реакции
      </button>

      <button class="nav-item" data-page="saves">
        <span class="nav-icon">🔖</span>
        Сохранения
      </button>

      <button class="nav-item" data-page="shares">
        <span class="nav-icon">🔁</span>
        Репосты и поделились
      </button>

      <button class="nav-item" data-page="follows">
        <span class="nav-icon">➕</span>
        Подписки
      </button>

      <button class="nav-item" data-page="groups">
        <span class="nav-icon">👨‍👩‍👧‍👦</span>
        Группы
      </button>

      <button class="nav-item" data-page="stories">
        <span class="nav-icon">⭕</span>
        Истории
      </button>

      <button class="nav-item" data-page="polls">
        <span class="nav-icon">📊</span>
        Опросы
      </button>

      <div class="nav-section">Контент</div>

      <button class="nav-item" data-page="hashtags">
        <span class="nav-icon">#️⃣</span>
        Хэштеги
      </button>

      <button class="nav-item" data-page="categories">
        <span class="nav-icon">🗂️</span>
        Категории
      </button>

      <button class="nav-item" data-page="locations">
        <span class="nav-icon">🌍</span>
        Страны и города
      </button>

      <button class="nav-item" data-page="translations">
        <span class="nav-icon">🌐</span>
        Переводы
      </button>

      <div class="nav-section">Бизнес</div>

      <button class="nav-item" data-page="payments">
        <span class="nav-icon">💳</span>
        Платежи
      </button>

      <button class="nav-item" data-page="ads">
        <span class="nav-icon">📢</span>
        Реклама
      </button>

      <button class="nav-item" data-page="support">
        <span class="nav-icon">🆘</span>
        Поддержка
      </button>

      <div class="nav-section">Система</div>

      <button class="nav-item" data-page="analytics">
        <span class="nav-icon">📈</span>
        Аналитика
      </button>

      <button class="nav-item" data-page="settings">
        <span class="nav-icon">⚙️</span>
        Настройки
      </button>

      <button class="nav-item" data-page="audit">
        <span class="nav-icon">📋</span>
        Журнал действий
      </button>

      <button class="nav-item" data-page="system">
        <span class="nav-icon">🛡️</span>
        Система
      </button>

      <div class="nav-section">Сайт</div>

      <button class="nav-item" onclick="openSite()">
        <span class="nav-icon">🌐</span>
        Открыть сайт
      </button>

      <button class="nav-item" onclick="logout()">
        <span class="nav-icon">🚪</span>
        Выйти
      </button>

    </nav>
  </aside>


  <main class="main">

    <header class="topbar">

      <button class="mobile-menu" onclick="toggleSidebar()">☰</button>

      <div class="global-search">
        <span class="search-icon">🔎</span>
        <input id="globalSearch" placeholder="Поиск по панели...">
      </div>

      <div class="top-actions">

        <button class="icon-button" onclick="refreshCurrentPage()" title="Обновить">
          ↻
        </button>

        <button class="icon-button" onclick="goPage('notifications')" title="Уведомления">
          🔔
        </button>

        <div class="admin-mini">
          <div class="admin-avatar">A</div>
          <div class="admin-text">
            <strong id="adminName">admin</strong>
            <span>Super Administrator</span>
          </div>
        </div>

      </div>

    </header>


    <section id="content" class="content"></section>

  </main>

</div>


<div id="modalRoot"></div>
<div id="toastBox" class="toast-box"></div>


<script>
"use strict";

/* =========================================================
   CORE
========================================================= */

const state = {
  page: "dashboard",
  stats: {},
  publications: [],
  participants: [],
  comments: [],
  reports: [],
  notifications: [],
  chats: [],
  currentParticipant: null,
  currentChatMessages: [],
  settings: {},
  admin: null
};

const API_BASE = "/api";

async function api(path, options = {}) {

  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  };

  try {

    const response = await fetch(API_BASE + path, config);

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401) {
      showLogin();
      throw new Error(data?.error || "Сессия администратора завершена");
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Ошибка сервера"
      );
    }

    return data;

  } catch (error) {

    if (error.message !== "Сессия администратора завершена") {
      toast(error.message, "error");
    }

    throw error;
  }
}


/* =========================================================
   LOGIN
========================================================= */

document.getElementById("loginForm").addEventListener("submit", async e => {

  e.preventDefault();

  const username =
    document.getElementById("loginUsername").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  const errorBox =
    document.getElementById("loginError");

  errorBox.classList.add("hidden");

  try {

    await api("/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    await startAdmin();

  } catch (error) {

    errorBox.textContent =
      error.message || "Не удалось выполнить вход";

    errorBox.classList.remove("hidden");
  }
});


async function startAdmin() {

  try {

    const me = await api("/admin/me");

    state.admin = me?.data || me?.admin || me;

    document.getElementById("loginScreen")
      .classList.add("hidden");

    document.getElementById("app")
      .classList.remove("hidden");

    document.getElementById("adminName").textContent =
      state.admin?.username || "admin";

    await goPage("dashboard");

  } catch {

    showLogin();

  }
}


function showLogin() {

  document.getElementById("loginScreen")
    .classList.remove("hidden");

  document.getElementById("app")
    .classList.add("hidden");
}


async function logout() {

  try {
    await api("/admin/logout", {
      method:"POST"
    });
  } catch {}

  showLogin();
}


/* =========================================================
   NAVIGATION
========================================================= */

document.querySelectorAll(".nav-item[data-page]")
.forEach(button => {

  button.addEventListener("click", () => {
    goPage(button.dataset.page);
  });

});


async function goPage(page) {

  state.page = page;

  document.querySelectorAll(".nav-item[data-page]")
    .forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.page === page
      );
    });

  document.getElementById("sidebar")
    .classList.remove("open");

  const loaders = {
    dashboard: renderDashboard,
    publications: renderPublications,
    pending: renderPending,
    participants: renderParticipants,
    chats: renderChats,
    comments: renderComments,
    reports: renderReports,
    notifications: renderNotifications,
    reactions: renderSimpleModule,
    saves: renderSimpleModule,
    shares: renderSimpleModule,
    follows: renderSimpleModule,
    groups: renderSimpleModule,
    stories: renderSimpleModule,
    polls: renderSimpleModule,
    hashtags: renderSimpleModule,
    categories: renderSimpleModule,
    locations: renderSimpleModule,
    translations: renderSimpleModule,
    payments: renderSimpleModule,
    ads: renderSimpleModule,
    support: renderSimpleModule,
    analytics: renderAnalytics,
    settings: renderSettings,
    audit: renderAudit,
    system: renderSystem
  };

  const loader = loaders[page];

  if (loader) {
    await loader();
  }
}


function refreshCurrentPage() {
  goPage(state.page);
}

function toggleSidebar() {
  document.getElementById("sidebar")
    .classList.toggle("open");
}

function openSite() {
  window.open("/", "_blank", "noopener");
}


/* =========================================================
   DASHBOARD
========================================================= */

async function renderDashboard() {

  const root = document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Панель управления</h1>
        <div class="page-description">
          Полный обзор Tajik Opportunities и текущей активности платформы.
        </div>
      </div>

      <div class="head-actions">
        <button class="btn" onclick="refreshCurrentPage()">↻ Обновить</button>
        <button class="btn btn-primary" onclick="goPage('pending')">
          ⏳ Проверить публикации
        </button>
      </div>
    </div>

    <div id="statsGrid" class="stat-grid">
      ${loadingStats()}
    </div>

    <div class="dashboard-grid">

      <div class="card">
        <div class="card-head">
          <h3>⚡ Быстрые действия</h3>
        </div>

        <div class="card-body">

          <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
            gap:10px;
          ">

            <button class="btn" onclick="goPage('pending')">
              ⏳ Ожидают разрешения
            </button>

            <button class="btn" onclick="goPage('participants')">
              👥 Участники
            </button>

            <button class="btn" onclick="goPage('chats')">
              💬 Чаты
            </button>

            <button class="btn" onclick="goPage('reports')">
              🚨 Жалобы
            </button>

            <button class="btn" onclick="goPage('comments')">
              💭 Комментарии
            </button>

            <button class="btn" onclick="goPage('analytics')">
              📈 Аналитика
            </button>

            <button class="btn" onclick="goPage('settings')">
              ⚙️ Настройки
            </button>

            <button class="btn btn-dark" onclick="openSite()">
              🌐 Открыть сайт
            </button>

          </div>

        </div>
      </div>


      <div class="card">

        <div class="card-head">
          <h3>🛡️ Статус системы</h3>
        </div>

        <div class="card-body">

          <div class="setting-row">
            <div>
              <strong>Администрация</strong>
              <span>Права главного администратора</span>
            </div>
            <span class="status status-active">АКТИВНА</span>
          </div>

          <div class="setting-row">
            <div>
              <strong>Регистрация участников</strong>
              <span>Участники используют сайт без регистрации</span>
            </div>
            <span class="status status-active">ОТКЛ.</span>
          </div>

          <div class="setting-row">
            <div>
              <strong>Публичная публикация</strong>
              <span>Требуется одобрение администратора</span>
            </div>
            <span class="status status-active">МОДЕРАЦИЯ</span>
          </div>

        </div>

      </div>

    </div>
  `;

  try {

    const result = await api("/admin/stats");

    state.stats =
      result?.data ||
      result?.stats ||
      result ||
      {};

    renderStats();

    updateBadges();

  } catch {}

}


function loadingStats() {

  return `
    <div class="stat-card">
      <div class="stat-label">Загрузка...</div>
      <div class="stat-value">—</div>
    </div>
  `.repeat(4);
}


function renderStats() {

  const s = state.stats;

  const stats = [
    ["📰","Публикации",
      val(s.total_publications ?? s.publications ?? s.total)],
    ["⏳","Ожидают разрешения",
      val(s.pending_publications ?? s.pending)],
    ["👥","Участники",
      val(s.total_participants ?? s.participants)],
    ["💬","Непрочитанные чаты",
      val(s.unread_messages ?? s.unread_chats)],
    ["👁️","Просмотры",
      val(s.views)],
    ["❤️","Реакции",
      val(s.reactions ?? s.likes)],
    ["🔁","Поделились",
      val(s.shares)],
    ["🔖","Сохранения",
      val(s.saves)],
    ["🚨","Жалобы",
      val(s.reports)],
    ["💭","Комментарии",
      val(s.comments)]
  ];

  const grid =
    document.getElementById("statsGrid");

  if (!grid) return;

  grid.innerHTML = stats.map(x => `
    <div class="stat-card">

      <div class="stat-top">
        <div class="stat-label">${x[1]}</div>
        <div class="stat-icon">${x[0]}</div>
      </div>

      <div class="stat-value">${x[2]}</div>

      <div class="stat-foot">
        Управляется из административной панели
      </div>

    </div>
  `).join("");
}


function val(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) return "0";

  return Number(value).toLocaleString("ru-RU");
}


function updateBadges() {

  const pending =
    state.stats.pending_publications ??
    state.stats.pending ??
    0;

  const badge =
    document.getElementById("pendingBadge");

  if (pending > 0) {
    badge.textContent = val(pending);
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}


/* =========================================================
   PUBLICATIONS
========================================================= */

async function loadPublications(params = "") {

  const result =
    await api("/admin/publications" + params);

  return result?.data ||
         result?.publications ||
         result?.items ||
         [];
}


async function renderPublications() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">

      <div>
        <h1 class="page-title">Публикации</h1>
        <div class="page-description">
          Полное управление всеми публикациями платформы.
        </div>
      </div>

      <div class="head-actions">
        <button class="btn" onclick="loadPublicationTable()">↻ Обновить</button>
        <button class="btn btn-primary" onclick="openCreatePublication()">
          ＋ Создать публикацию
        </button>
      </div>

    </div>

    <div class="card">

      <div class="toolbar">

        <input
          id="pubSearch"
          placeholder="Поиск по публикациям..."
        >

        <select id="pubStatus">
          <option value="">Все статусы</option>
          <option value="pending">Ожидает</option>
          <option value="published">Опубликовано</option>
          <option value="rejected">Отклонено</option>
          <option value="draft">Черновик</option>
          <option value="archived">Архив</option>
          <option value="deleted">Удалено</option>
          <option value="awaiting_payment">Ожидает оплаты</option>
          <option value="paid">Оплачено</option>
        </select>

        <select id="pubVisibility">
          <option value="">Любая видимость</option>
          <option value="public">Публичная</option>
          <option value="private">Приватная</option>
          <option value="hidden">Скрытая</option>
        </select>

        <button class="btn" onclick="loadPublicationTable()">
          Применить
        </button>

      </div>

      <div id="publicationTable"></div>

    </div>
  `;

  await loadPublicationTable();
}


async function loadPublicationTable() {

  const box =
    document.getElementById("publicationTable");

  if (!box) return;

  box.innerHTML =
    `<div class="empty">Загрузка публикаций...</div>`;

  try {

    const search =
      encodeURIComponent(
        document.getElementById("pubSearch")?.value || ""
      );

    const status =
      encodeURIComponent(
        document.getElementById("pubStatus")?.value || ""
      );

    const visibility =
      encodeURIComponent(
        document.getElementById("pubVisibility")?.value || ""
      );

    const params =
      `?search=${search}&status=${status}&visibility=${visibility}`;

    state.publications =
      await loadPublications(params);

    box.innerHTML =
      publicationTable(state.publications);

  } catch {

    box.innerHTML =
      `<div class="empty">Не удалось загрузить публикации.</div>`;
  }
}


function publicationTable(items) {

  if (!items.length) {
    return `
      <div class="empty">
        <div class="empty-icon">📰</div>
        Публикаций пока нет.
      </div>
    `;
  }

  return `
    <div class="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Публикация</th>
            <th>Автор</th>
            <th>Статус</th>
            <th>Просмотры</th>
            <th>Реакции</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>

        <tbody>

          ${items.map(p => `

            <tr>

              <td>
                <strong>${escapeHtml(
                  p.title || "Без названия"
                )}</strong>

                <div style="color:#94a3b8;margin-top:4px">
                  ID: ${escapeHtml(String(p.id ?? ""))}
                </div>
              </td>

              <td>
                ${escapeHtml(
                  p.author_name ||
                  p.username ||
                  "Участник"
                )}

                ${
                  p.username
                    ? `<div style="color:#94a3b8">${escapeHtml(p.username)}</div>`
                    : ""
                }
              </td>

              <td>
                ${statusBadge(p.status)}
              </td>

              <td>
                ${val(p.views_count ?? p.views)}
              </td>

              <td>
                ${val(
                  p.likes_count ??
                  p.reactions_count ??
                  p.likes
                )}
              </td>

              <td>
                ${formatDate(
                  p.created_at ||
                  p.published_at
                )}
              </td>

              <td>

                <div class="row-actions">

                  <button class="small-btn"
                    onclick="openPublication('${esc(p.id)}')">
                    Открыть
                  </button>

                  ${
                    p.status === "pending"
                    ? `
                      <button class="small-btn"
                        onclick="publicationAction('${esc(p.id)}','approve')">
                        ✓ Одобрить
                      </button>
                    `
                    : ""
                  }

                  <button class="small-btn"
                    onclick="editPublication('${esc(p.id)}')">
                    ✎
                  </button>

                  <button class="small-btn"
                    onclick="editCounters('${esc(p.id)}')">
                    🔢
                  </button>

                  <button class="small-btn"
                    onclick="publicationAction('${esc(p.id)}','delete')">
                    🗑
                  </button>

                </div>

              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>
  `;
}


function statusBadge(status) {

  const names = {
    published:"Опубликовано",
    pending:"Ожидает",
    rejected:"Отклонено",
    archived:"Архив",
    deleted:"Удалено",
    draft:"Черновик",
    awaiting_payment:"Ожидает оплаты",
    paid:"Оплачено"
  };

  return `
    <span class="status status-${escapeHtml(status || "pending")}">
      ${escapeHtml(names[status] || status || "Не указан")}
    </span>
  `;
}


async function publicationAction(id, action) {

  const labels = {
    approve:"одобрить",
    reject:"отклонить",
    publish:"опубликовать",
    hide:"скрыть",
    archive:"архивировать",
    restore:"восстановить",
    delete:"удалить",
    pin:"закрепить",
    unpin:"открепить",
    feature:"выделить"
  };

  if (
    !confirm(
      `Вы действительно хотите ${labels[action] || action} публикацию?`
    )
  ) return;

  try {

    await api(`/admin/publications/${encodeURIComponent(id)}/action`, {
      method:"POST",
      body:JSON.stringify({ action })
    });

    toast("Действие выполнено", "success");

    await loadPublicationTable();

  } catch {}
}


async function openPublication(id) {

  try {

    const result =
      await api(
        `/admin/publications/${encodeURIComponent(id)}`
      );

    const p =
      result?.data ||
      result?.publication ||
      result;

    showModal(`
      <div class="modal large">

        <div class="modal-head">
          <h2>📰 Публикация</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <div class="modal-body">

          <h2>${escapeHtml(p.title || "Без названия")}</h2>

          <div style="margin:10px 0">
            ${statusBadge(p.status)}
          </div>

          <div style="
            white-space:pre-wrap;
            line-height:1.7;
            font-size:13px;
            margin:20px 0;
          ">
            ${escapeHtml(p.body || p.description || "")}
          </div>

          <div class="form-grid">

            ${infoField("Автор",
              p.author_name || p.username || "Участник")}

            ${infoField("Username",
              p.username || "—")}

            ${infoField("Категория",
              p.category || "—")}

            ${infoField("Страна",
              p.country || "—")}

            ${infoField("Город",
              p.city || "—")}

            ${infoField("Видимость",
              p.visibility || "—")}

            ${infoField("Просмотры",
              val(p.views_count))}

            ${infoField("Лайки",
              val(p.likes_count))}

            ${infoField("Комментарии",
              val(p.comments_count))}

            ${infoField("Поделились",
              val(p.shares_count))}

            ${infoField("Сохранения",
              val(p.saves_count))}

            ${infoField("Жалобы",
              val(p.reports_count))}

          </div>

        </div>

        <div class="modal-foot">

          <button class="btn"
            onclick="editPublication('${esc(p.id)}')">
            ✎ Редактировать
          </button>

          <button class="btn"
            onclick="editCounters('${esc(p.id)}')">
            🔢 Изменить счётчики
          </button>

          <button class="btn btn-primary"
            onclick="closeModal()">
            Закрыть
          </button>

        </div>

      </div>
    `);

  } catch {}
}


async function editPublication(id) {

  try {

    const result =
      await api(
        `/admin/publications/${encodeURIComponent(id)}`
      );

    const p =
      result?.data ||
      result?.publication ||
      result;

    showModal(`
      <div class="modal large">

        <div class="modal-head">
          <h2>✎ Редактирование публикации</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <form class="modal-body" id="editPublicationForm">

          <div class="form-grid">

            ${inputField("title","Заголовок",p.title || "",true)}

            ${inputField("category","Категория",p.category || "")}

            ${inputField("country","Страна",p.country || "")}

            ${inputField("city","Город",p.city || "")}

            ${inputField("location","Место",p.location || "")}

            ${inputField("scope","Охват",p.scope || "")}

            ${inputField("deadline","Дедлайн",p.deadline || "")}

            ${inputField("price","Цена / зарплата",p.price ?? "")}

            ${inputField("currency","Валюта",p.currency || "")}

            ${inputField("employment_type","Тип занятости",p.employment_type || "")}

            ${inputField("work_format","Формат работы",p.work_format || "")}

            ${inputField("experience","Опыт",p.experience || "")}

            ${inputField("education","Образование",p.education || "")}

            ${inputField("languages","Языки",p.languages || "")}

            ${inputField("tags","Теги",p.tags || "")}

            ${selectField(
              "status",
              "Статус",
              p.status,
              [
                "pending",
                "published",
                "rejected",
                "draft",
                "archived",
                "deleted",
                "awaiting_payment",
                "paid"
              ]
            )}

            ${selectField(
              "visibility",
              "Видимость",
              p.visibility,
              ["public","private","hidden"]
            )}

            ${textareaField(
              "body",
              "Текст публикации",
              p.body || p.description || ""
            )}

            ${textareaField(
              "media_urls",
              "Медиа URL",
              Array.isArray(p.media)
                ? p.media.join("\\n")
                : (p.media_urls || "")
            )}

            ${textareaField(
              "admin_note",
              "Заметка администратора",
              p.admin_note || ""
            )}

          </div>

        </form>

        <div class="modal-foot">

          <button class="btn" onclick="closeModal()">
            Отмена
          </button>

          <button class="btn btn-primary"
            onclick="savePublication('${esc(id)}')">
            Сохранить изменения
          </button>

        </div>

      </div>
    `);

  } catch {}
}


async function savePublication(id) {

  const form =
    document.getElementById("editPublicationForm");

  const data =
    Object.fromEntries(
      new FormData(form).entries()
    );

  try {

    await api(
      `/admin/publications/${encodeURIComponent(id)}`,
      {
        method:"PUT",
        body:JSON.stringify(data)
      }
    );

    closeModal();

    toast("Публикация сохранена", "success");

    await loadPublicationTable();

  } catch {}
}


async function editCounters(id) {

  const p =
    state.publications.find(
      x => String(x.id) === String(id)
    ) || {};

  showModal(`
    <div class="modal">

      <div class="modal-head">
        <h2>🔢 Управление счётчиками</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>

      <div class="modal-body">

        <p style="color:#718096;font-size:12px">
          Администратор может вручную установить любое
          неотрицательное значение счётчика.
        </p>

        <div class="form-grid">

          ${counterField("views_count","Просмотры",p.views_count)}

          ${counterField("likes_count","Лайки",p.likes_count)}

          ${counterField("comments_count","Комментарии",p.comments_count)}

          ${counterField("shares_count","Поделились",p.shares_count)}

          ${counterField("saves_count","Сохранения",p.saves_count)}

          ${counterField("reports_count","Жалобы",p.reports_count)}

          ${counterField("reaction_love","❤️ Love",p.reaction_love)}

          ${counterField("reaction_support","👍 Support",p.reaction_support)}

          ${counterField("reaction_funny","😂 Funny",p.reaction_funny)}

          ${counterField("reaction_wow","😮 Wow",p.reaction_wow)}

          ${counterField("reaction_sad","😢 Sad",p.reaction_sad)}

          ${counterField("reaction_angry","😡 Angry",p.reaction_angry)}

        </div>

      </div>

      <div class="modal-foot">

        <button class="btn" onclick="closeModal()">Отмена</button>

        <button class="btn btn-primary"
          onclick="saveCounters('${esc(id)}')">
          Сохранить счётчики
        </button>

      </div>

    </div>
  `);
}


async function saveCounters(id) {

  const inputs =
    document.querySelectorAll(
      "#modalRoot input[data-counter]"
    );

  const counters = {};

  inputs.forEach(input => {

    let number =
      Number(input.value);

    if (!Number.isFinite(number) || number < 0) {
      number = 0;
    }

    counters[input.dataset.counter] =
      Math.floor(number);
  });

  try {

    await api(
      `/admin/publications/${encodeURIComponent(id)}/counters`,
      {
        method:"PUT",
        body:JSON.stringify(counters)
      }
    );

    closeModal();

    toast("Счётчики обновлены", "success");

    await loadPublicationTable();

  } catch {}
}


/* =========================================================
   CREATE PUBLICATION
========================================================= */

function openCreatePublication() {

  showModal(`
    <div class="modal large">

      <div class="modal-head">
        <h2>＋ Создать публикацию</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>

      <form id="createPublicationForm" class="modal-body">

        <div class="form-grid">

          ${inputField("title","Заголовок","")}

          ${inputField("category","Категория","")}

          ${inputField("country","Страна","")}

          ${inputField("city","Город","")}

          ${inputField("location","Место","")}

          ${inputField("scope","Охват","international")}

          ${inputField("deadline","Дедлайн","")}

          ${inputField("price","Цена / зарплата","")}

          ${inputField("currency","Валюта","TJS")}

          ${inputField("employment_type","Тип занятости","")}

          ${inputField("work_format","Формат работы","")}

          ${inputField("experience","Опыт","")}

          ${inputField("education","Образование","")}

          ${inputField("languages","Языки","")}

          ${inputField("tags","Теги","")}

          ${selectField(
            "status",
            "Статус",
            "published",
            ["draft","pending","published"]
          )}

          ${selectField(
            "visibility",
            "Видимость",
            "public",
            ["public","private","hidden"]
          )}

          ${textareaField("body","Текст","")}

          ${textareaField(
            "media_urls",
            "URL изображений / видео / аудио",
            ""
          )}

        </div>

      </form>

      <div class="modal-foot">

        <button class="btn" onclick="closeModal()">
          Отмена
        </button>

        <button class="btn btn-primary"
          onclick="createPublication()">
          Создать
        </button>

      </div>

    </div>
  `);
}


async function createPublication() {

  const form =
    document.getElementById("createPublicationForm");

  const data =
    Object.fromEntries(
      new FormData(form).entries()
    );

  try {

    await api("/admin/publications", {
      method:"POST",
      body:JSON.stringify(data)
    });

    closeModal();

    toast("Публикация создана", "success");

    await loadPublicationTable();

  } catch {}
}


/* =========================================================
   PENDING
========================================================= */

async function renderPending() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">

      <div>
        <h1 class="page-title">⏳ Ожидают разрешения</h1>
        <div class="page-description">
          Публикации, которые ещё не разрешены к публичному показу.
        </div>
      </div>

      <button class="btn" onclick="renderPending()">
        ↻ Обновить
      </button>

    </div>

    <div class="card">
      <div id="pendingTable"></div>
    </div>
  `;

  try {

    const items =
      await loadPublications("?status=pending");

    document.getElementById("pendingTable")
      .innerHTML = publicationTable(items);

  } catch {}
}


/* =========================================================
   PARTICIPANTS
========================================================= */

async function renderParticipants() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">

      <div>
        <h1 class="page-title">👥 Участники</h1>
        <div class="page-description">
          Участники автоматически появляются при использовании сайта.
          Регистрация и вход участникам не требуются.
        </div>
      </div>

      <button class="btn" onclick="loadParticipants()">
        ↻ Обновить
      </button>

    </div>

    <div class="card">

      <div class="toolbar">

        <input
          id="participantSearch"
          placeholder="Имя, @username..."
        >

        <select id="participantStatus">
          <option value="">Все</option>
          <option value="active">Активные</option>
          <option value="blocked">Заблокированные</option>
          <option value="deleted">Удалённые</option>
        </select>

        <button class="btn"
          onclick="loadParticipants()">
          Поиск
        </button>

      </div>

      <div id="participantsTable"></div>

    </div>
  `;

  await loadParticipants();
}


async function loadParticipants() {

  const box =
    document.getElementById("participantsTable");

  if (!box) return;

  box.innerHTML =
    `<div class="empty">Загрузка участников...</div>`;

  try {

    const search =
      encodeURIComponent(
        document.getElementById("participantSearch")?.value || ""
      );

    const status =
      encodeURIComponent(
        document.getElementById("participantStatus")?.value || ""
      );

    const result =
      await api(
        `/admin/participants?search=${search}&status=${status}`
      );

    state.participants =
      result?.data ||
      result?.participants ||
      result?.items ||
      [];

    box.innerHTML =
      participantTable(state.participants);

  } catch {

    box.innerHTML =
      `<div class="empty">Не удалось загрузить участников.</div>`;
  }
}


function participantTable(items) {

  if (!items.length) {
    return `
      <div class="empty">
        <div class="empty-icon">👥</div>
        Участников пока нет.
      </div>
    `;
  }

  return `
    <div class="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Участник</th>
            <th>Username</th>
            <th>Статус</th>
            <th>Проверка</th>
            <th>Публикации</th>
            <th>Последняя активность</th>
            <th>Действия</th>
          </tr>
        </thead>

        <tbody>

          ${items.map(u => `

            <tr>

              <td>
                <strong>
                  ${escapeHtml(
                    u.name ||
                    u.display_name ||
                    "Участник"
                  )}
                </strong>
              </td>

              <td>
                ${escapeHtml(
                  u.username ||
                  "—"
                )}
              </td>

              <td>
                ${statusBadge(
                  u.status || "active"
                )}
              </td>

              <td>
                ${
                  u.verified
                    ? "✅ Да"
                    : "—"
                }
              </td>

              <td>
                ${val(
                  u.publications_count ??
                  u.posts_count
                )}
              </td>

              <td>
                ${formatDate(
                  u.last_active_at ||
                  u.updated_at
                )}
              </td>

              <td>

                <div class="row-actions">

                  <button class="small-btn"
                    onclick="openParticipant('${esc(u.id)}')">
                    Открыть
                  </button>

                  <button class="small-btn"
                    onclick="openChat('${esc(u.id)}')">
                    💬 Чат
                  </button>

                  <button class="small-btn"
                    onclick="editParticipant('${esc(u.id)}')">
                    ✎
                  </button>

                  ${
                    u.status === "blocked"
                    ?
                    `<button class="small-btn"
                      onclick="participantAction('${esc(u.id)}','unblock')">
                      Разблокировать
                    </button>`
                    :
                    `<button class="small-btn"
                      onclick="participantAction('${esc(u.id)}','block')">
                      Блок
                    </button>`
                  }

                </div>

              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

    </div>
  `;
}


async function openParticipant(id) {

  try {

    const result =
      await api(
        `/admin/participants/${encodeURIComponent(id)}`
      );

    const u =
      result?.data ||
      result?.participant ||
      result;

    showModal(`
      <div class="modal">

        <div class="modal-head">
          <h2>👤 Профиль участника</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <div class="modal-body">

          <div style="
            display:flex;
            align-items:center;
            gap:15px;
            margin-bottom:25px;
          ">

            <div class="admin-avatar">
              ${(u.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 style="margin:0">
                ${escapeHtml(u.name || "Участник")}
              </h2>

              <div style="color:#718096;margin-top:4px">
                ${escapeHtml(u.username || "Без username")}
              </div>
            </div>

          </div>

          <div class="form-grid">

            ${infoField("Страна",u.country || "—")}
            ${infoField("Город",u.city || "—")}
            ${infoField("Статус",u.status || "active")}
            ${infoField("Роль",u.role || "participant")}
            ${infoField("Проверен",u.verified ? "Да" : "Нет")}
            ${infoField("Публикации",val(u.publications_count))}
            ${infoField("Создан",formatDate(u.created_at))}
            ${infoField("Активность",formatDate(u.last_active_at))}

          </div>

          ${
            u.bio
              ? `
                <div style="margin-top:20px">
                  <strong>О себе</strong>
                  <p style="line-height:1.6">
                    ${escapeHtml(u.bio)}
                  </p>
                </div>
              `
              : ""
          }

        </div>

        <div class="modal-foot">

          <button class="btn"
            onclick="editParticipant('${esc(u.id)}')">
            ✎ Редактировать
          </button>

          <button class="btn"
            onclick="openChat('${esc(u.id)}')">
            💬 Открыть чат
          </button>

          <button class="btn btn-primary"
            onclick="closeModal()">
            Закрыть
          </button>

        </div>

      </div>
    `);

  } catch {}
}


async function editParticipant(id) {

  try {

    const result =
      await api(
        `/admin/participants/${encodeURIComponent(id)}`
      );

    const u =
      result?.data ||
      result?.participant ||
      result;

    showModal(`
      <div class="modal">

        <div class="modal-head">
          <h2>✎ Управление участником</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <form id="participantForm" class="modal-body">

          <div class="form-grid">

            ${inputField("name","Имя",u.name || "")}

            ${inputField("username","Username",u.username || "")}

            ${inputField("country","Страна",u.country || "")}

            ${inputField("city","Город",u.city || "")}

            ${inputField("profession","Профессия",u.profession || "")}

            ${inputField("company","Компания",u.company || "")}

            ${inputField("website","Сайт",u.website || "")}

            ${inputField("languages","Языки",u.languages || "")}

            ${inputField("skills","Навыки",u.skills || "")}

            ${selectField(
              "role",
              "Роль",
              u.role || "participant",
              [
                "participant",
                "verified_participant",
                "moderator",
                "editor",
                "manager",
                "super_admin"
              ]
            )}

            ${selectField(
              "status",
              "Статус",
              u.status || "active",
              [
                "active",
                "blocked",
                "deleted",
                "deactivated"
              ]
            )}

            ${textareaField(
              "bio",
              "О себе",
              u.bio || ""
            )}

          </div>

        </form>

        <div class="modal-foot">

          <button class="btn"
            onclick="closeModal()">
            Отмена
          </button>

          <button class="btn btn-primary"
            onclick="saveParticipant('${esc(id)}')">
            Сохранить
          </button>

        </div>

      </div>
    `);

  } catch {}
}


async function saveParticipant(id) {

  const form =
    document.getElementById("participantForm");

  const data =
    Object.fromEntries(
      new FormData(form).entries()
    );

  try {

    await api(
      `/admin/participants/${encodeURIComponent(id)}`,
      {
        method:"PUT",
        body:JSON.stringify(data)
      }
    );

    closeModal();

    toast("Участник обновлён", "success");

    await loadParticipants();

  } catch {}
}


async function participantAction(id, action) {

  if (
    !confirm(
      action === "block"
        ? "Заблокировать участника?"
        : "Разблокировать участника?"
    )
  ) return;

  try {

    await api(
      `/admin/participants/${encodeURIComponent(id)}`,
      {
        method:"PUT",
        body:JSON.stringify({
          status:
            action === "block"
              ? "blocked"
              : "active"
        })
      }
    );

    toast("Статус участника изменён","success");

    await loadParticipants();

  } catch {}
}


/* =========================================================
   CHAT
========================================================= */

async function renderChats() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">

      <div>
        <h1 class="page-title">💬 Чаты с участниками</h1>
        <div class="page-description">
          Приватные разговоры Tajik Opportunities с отдельными участниками.
        </div>
      </div>

    </div>

    <div class="card">

      <div class="chat-layout">

        <div class="chat-list">

          <div class="chat-search">
            <input
              id="chatSearch"
              placeholder="Поиск участника..."
              oninput="filterChats()"
            >
          </div>

          <div id="chatListItems">
            <div class="empty">Загрузка...</div>
          </div>

        </div>

        <div class="chat-window">

          <div id="chatHeader" class="chat-header">
            <strong>Выберите участника</strong>
            <small>
              Здесь отображается приватная переписка.
            </small>
          </div>

          <div id="chatMessages" class="chat-messages">
            <div class="empty">
              <div class="empty-icon">💬</div>
              Выберите чат слева.
            </div>
          </div>

          <div class="chat-compose">

            <textarea
              id="chatInput"
              placeholder="Написать сообщение участнику..."
            ></textarea>

            <button class="btn btn-primary"
              onclick="sendChatMessage()">
              Отправить
            </button>

          </div>

        </div>

      </div>

    </div>
  `;

  try {

    const result =
      await api("/admin/chat");

    state.chats =
      result?.data ||
      result?.chats ||
      result?.items ||
      [];

    renderChatList();

  } catch {}
}


function renderChatList() {

  const box =
    document.getElementById("chatListItems");

  if (!box) return;

  if (!state.chats.length) {

    box.innerHTML = `
      <div class="empty">
        <div class="empty-icon">💬</div>
        Чатов пока нет.
      </div>
    `;

    return;
  }

  box.innerHTML =
    state.chats.map(c => `

      <div class="chat-user"
        data-chat-name="${escapeHtml(
          (c.name || c.username || "").toLowerCase()
        )}"
        onclick="openChat('${esc(
          c.participant_id || c.user_id || c.id
        )}')">

        <div class="chat-avatar">
          ${(c.name || "U").charAt(0).toUpperCase()}
        </div>

        <div class="chat-info">

          <strong>
            ${escapeHtml(
              c.name ||
              c.username ||
              "Участник"
            )}
          </strong>

          <span>
            ${escapeHtml(
              c.last_message ||
              c.username ||
              "Открыть чат"
            )}
          </span>

        </div>

      </div>

    `).join("");
}


function filterChats() {

  const q =
    document.getElementById("chatSearch")
      ?.value
      .toLowerCase()
      .trim() || "";

  document.querySelectorAll(".chat-user")
    .forEach(item => {

      item.style.display =
        !q ||
        item.dataset.chatName.includes(q)
          ? ""
          : "none";

    });
}


async function openChat(participantId) {

  state.currentParticipant =
    participantId;

  try {

    const result =
      await api(
        `/admin/chat/${encodeURIComponent(participantId)}/messages`
      );

    state.currentChatMessages =
      result?.data ||
      result?.messages ||
      result?.items ||
      [];

    const chat =
      state.chats.find(c =>
        String(
          c.participant_id ||
          c.user_id ||
          c.id
        ) === String(participantId)
      ) || {};

    const header =
      document.getElementById("chatHeader");

    if (header) {

      header.innerHTML = `
        <strong>
          🇹🇯 Tajik Opportunities
          <span style="color:#16a34a">✓</span>
          — ${escapeHtml(
            chat.name ||
            chat.username ||
            "Участник"
          )}
        </strong>

        <small>
          ${escapeHtml(
            chat.username || ""
          )}
          · Приватный чат
        </small>
      `;
    }

    renderMessages();

  } catch {}
}


function renderMessages() {

  const box =
    document.getElementById("chatMessages");

  if (!box) return;

  if (!state.currentChatMessages.length) {

    box.innerHTML = `
      <div class="empty">
        Сообщений пока нет.
      </div>
    `;

    return;
  }

  box.innerHTML =
    state.currentChatMessages.map(m => {

      const mine =
        m.sender_role === "admin" ||
        m.is_admin === true ||
        m.sender === "admin";

      return `
        <div class="message ${mine ? "mine" : ""}">

          <div class="message-bubble">
            ${escapeHtml(
              m.message ||
              m.text ||
              m.body ||
              ""
            )}
          </div>

          <div class="message-time">
            ${formatDate(
              m.created_at
            )}
          </div>

        </div>
      `;

    }).join("");

  box.scrollTop =
    box.scrollHeight;
}


async function sendChatMessage() {

  const input =
    document.getElementById("chatInput");

  const text =
    input?.value.trim();

  if (!text || !state.currentParticipant) {
    return;
  }

  try {

    await api(
      `/admin/chat/${encodeURIComponent(
        state.currentParticipant
      )}/send`,
      {
        method:"POST",
        body:JSON.stringify({
          message:text,
          text
        })
      }
    );

    input.value = "";

    await openChat(
      state.currentParticipant
    );

  } catch {}
}


/* =========================================================
   COMMENTS
========================================================= */

async function renderComments() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">💭 Комментарии</h1>
        <div class="page-description">
          Управление комментариями, ответами и модерацией.
        </div>
      </div>
      <button class="btn" onclick="loadComments()">↻ Обновить</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <input id="commentSearch" placeholder="Поиск комментария...">
        <select id="commentStatus">
          <option value="">Все</option>
          <option value="visible">Видимые</option>
          <option value="hidden">Скрытые</option>
          <option value="deleted">Удалённые</option>
        </select>
        <button class="btn" onclick="loadComments()">Поиск</button>
      </div>
      <div id="commentsTable"></div>
    </div>
  `;

  await loadComments();
}


async function loadComments() {

  const box =
    document.getElementById("commentsTable");

  if (!box) return;

  try {

    const result =
      await api("/admin/comments");

    state.comments =
      result?.data ||
      result?.comments ||
      result?.items ||
      [];

    if (!state.comments.length) {

      box.innerHTML = `
        <div class="empty">
          <div class="empty-icon">💭</div>
          Комментариев нет.
        </div>
      `;

      return;
    }

    box.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Автор</th>
              <th>Комментарий</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>

            ${state.comments.map(c => `

              <tr>

                <td>
                  ${escapeHtml(
                    c.author_name ||
                    c.username ||
                    "Участник"
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    c.body ||
                    c.text ||
                    c.comment ||
                    ""
                  )}
                </td>

                <td>
                  ${statusBadge(
                    c.status || "visible"
                  )}
                </td>

                <td>
                  ${formatDate(c.created_at)}
                </td>

                <td>

                  <div class="row-actions">

                    <button class="small-btn"
                      onclick="editComment('${esc(c.id)}')">
                      ✎
                    </button>

                    <button class="small-btn"
                      onclick="deleteComment('${esc(c.id)}')">
                      🗑
                    </button>

                  </div>

                </td>

              </tr>

            `).join("")}

          </tbody>
        </table>
      </div>
    `;

  } catch {

    box.innerHTML =
      `<div class="empty">Ошибка загрузки.</div>`;
  }
}


async function editComment(id) {

  const comment =
    state.comments.find(
      x => String(x.id) === String(id)
    ) || {};

  showModal(`
    <div class="modal">

      <div class="modal-head">
        <h2>✎ Редактирование комментария</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>

      <div class="modal-body">

        ${textareaField(
          "comment_body",
          "Текст комментария",
          comment.body ||
          comment.text ||
          ""
        )}

        ${selectField(
          "comment_status",
          "Статус",
          comment.status || "visible",
          ["visible","hidden","deleted"]
        )}

      </div>

      <div class="modal-foot">

        <button class="btn" onclick="closeModal()">
          Отмена
        </button>

        <button class="btn btn-primary"
          onclick="saveComment('${esc(id)}')">
          Сохранить
        </button>

      </div>

    </div>
  `);
}


async function saveComment(id) {

  const body =
    document.querySelector(
      "#modalRoot textarea[name='comment_body']"
    )?.value || "";

  const status =
    document.querySelector(
      "#modalRoot select[name='comment_status']"
    )?.value || "visible";

  try {

    await api(
      `/admin/comments/${encodeURIComponent(id)}`,
      {
        method:"PUT",
        body:JSON.stringify({
          body,
          status
        })
      }
    );

    closeModal();

    toast("Комментарий обновлён","success");

    await loadComments();

  } catch {}
}


async function deleteComment(id) {

  if (!confirm("Удалить комментарий?")) return;

  try {

    await api(
      `/admin/comments/${encodeURIComponent(id)}`,
      {
        method:"DELETE"
      }
    );

    toast("Комментарий удалён","success");

    await loadComments();

  } catch {}
}


/* =========================================================
   REPORTS
========================================================= */

async function renderReports() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">🚨 Жалобы</h1>
        <div class="page-description">
          Все жалобы пользователей и обращения по контенту.
        </div>
      </div>
      <button class="btn" onclick="loadReports()">↻ Обновить</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <select id="reportStatus">
          <option value="">Все статусы</option>
          <option value="open">Открытые</option>
          <option value="reviewed">Рассмотренные</option>
          <option value="resolved">Решённые</option>
          <option value="rejected">Отклонённые</option>
        </select>
        <button class="btn" onclick="loadReports()">Применить</button>
      </div>
      <div id="reportsTable"></div>
    </div>
  `;

  await loadReports();
}


async function loadReports() {

  const box =
    document.getElementById("reportsTable");

  if (!box) return;

  try {

    const result =
      await api("/admin/reports");

    state.reports =
      result?.data ||
      result?.reports ||
      result?.items ||
      [];

    if (!state.reports.length) {

      box.innerHTML = `
        <div class="empty">
          <div class="empty-icon">🚨</div>
          Жалоб нет.
        </div>
      `;

      return;
    }

    box.innerHTML = `
      <div class="table-wrap">
        <table>

          <thead>
            <tr>
              <th>Причина</th>
              <th>Кто пожаловался</th>
              <th>Объект</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>

            ${state.reports.map(r => `

              <tr>

                <td>
                  <strong>
                    ${escapeHtml(
                      r.reason ||
                      "Жалоба"
                    )}
                  </strong>

                  ${
                    r.description
                    ? `<div style="color:#718096;margin-top:4px">
                        ${escapeHtml(r.description)}
                       </div>`
                    : ""
                  }
                </td>

                <td>
                  ${escapeHtml(
                    r.reporter_name ||
                    r.username ||
                    "Участник"
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    r.target_type ||
                    "—"
                  )}
                  <div style="color:#94a3b8">
                    ${escapeHtml(
                      String(r.target_id || "")
                    )}
                  </div>
                </td>

                <td>
                  ${statusBadge(
                    r.status || "open"
                  )}
                </td>

                <td>
                  ${formatDate(r.created_at)}
                </td>

                <td>

                  <div class="row-actions">

                    <button class="small-btn"
                      onclick="updateReport('${esc(r.id)}','reviewed')">
                      Рассмотреть
                    </button>

                    <button class="small-btn"
                      onclick="updateReport('${esc(r.id)}','resolved')">
                      Решить
                    </button>

                    <button class="small-btn"
                      onclick="updateReport('${esc(r.id)}','rejected')">
                      Отклонить
                    </button>

                  </div>

                </td>

              </tr>

            `).join("")}

          </tbody>

        </table>
      </div>
    `;

  } catch {}
}


async function updateReport(id,status) {

  try {

    await api(
      `/admin/reports/${encodeURIComponent(id)}`,
      {
        method:"PUT",
        body:JSON.stringify({status})
      }
    );

    toast("Жалоба обновлена","success");

    await loadReports();

  } catch {}
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function renderNotifications() {

  const root =
    document.getElementById("content");

  root.innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">🔔 Уведомления</h1>
        <div class="page-description">
          Контроль событий, новых публикаций, сообщений и системных предупреждений.
        </div>
      </div>
      <button class="btn" onclick="loadNotifications()">↻ Обновить</button>
    </div>

    <div class="card">
      <div id="notificationsList">
        <div class="empty">Загрузка...</div>
      </div>
    </div>
  `;

  await loadNotifications();
}


async function loadNotifications() {

  try {

    const result =
      await api("/admin/notifications");

    state.notifications =
      result?.data ||
      result?.notifications ||
      result?.items ||
      [];

    const box =
      document.getElementById("notificationsList");

    if (!state.notifications.length) {

      box.innerHTML = `
        <div class="empty">
          <div class="empty-icon">🔔</div>
          Уведомлений нет.
        </div>
      `;

      return;
    }

    box.innerHTML =
      state.notifications.map(n => `

        <div style="
          padding:16px 19px;
          border-bottom:1px solid #edf0f4;
        ">

          <strong>
            ${escapeHtml(
              n.title ||
              n.type ||
              "Уведомление"
            )}
          </strong>

          <div style="
            color:#64748b;
            font-size:12px;
            margin-top:5px;
          ">
            ${escapeHtml(
              n.message ||
              n.body ||
              ""
            )}
          </div>

          <div style="
            color:#94a3b8;
            font-size:10px;
            margin-top:7px;
          ">
            ${formatDate(n.created_at)}
          </div>

        </div>

      `).join("");

  } catch {}
}


/* =========================================================
   SIMPLE MODULES
========================================================= */

async function renderSimpleModule() {

  const names = {
    reactions:["❤️","Реакции","Управление всеми реакциями публикаций и пользователей."],
    saves:["🔖","Сохранения","Сохранённые публикации и коллекции."],
    shares:["🔁","Репосты и поделились","Контроль распространения публикаций."],
    follows:["➕","Подписки","Подписки между участниками и официальными страницами."],
    groups:["👨‍👩‍👧‍👦","Группы","Сообщества и группы платформы."],
    stories:["⭕","Истории","Временные публикации и статусы."],
    polls:["📊","Опросы","Опросы, голосования и результаты."],
    hashtags:["#️⃣","Хэштеги","Хэштеги и поиск публикаций по ним."],
    categories:["🗂️","Категории","Категории и типы контента."],
    locations:["🌍","Страны и города","География публикаций и участников."],
    translations:["🌐","Переводы","Перевод публикаций на доступные языки."],
    payments:["💳","Платежи","Суммы, оплаты и статусы публикаций."],
    ads:["📢","Реклама","Рекламные публикации и кампании."],
    support:["🆘","Поддержка","Обращения и заявки участников."]
  };

  const item =
    names[state.page] ||
    ["⚙️",state.page,""];

  document.getElementById("content").innerHTML = `

    <div class="page-head">

      <div>
        <h1 class="page-title">
          ${item[0]} ${item[1]}
        </h1>

        <div class="page-description">
          ${item[2]}
        </div>
      </div>

    </div>

    <div class="card">

      <div class="empty">

        <div class="empty-icon">
          ${item[0]}
        </div>

        <h3 style="color:#172033">
          Модуль управления
        </h3>

        <p>
          Раздел подготовлен в административной панели.
          Здесь можно централизованно управлять этим направлением
          без изменения остальных разделов сайта.
        </p>

        <button class="btn btn-primary"
          onclick="goPage('dashboard')">
          Вернуться в обзор
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   ANALYTICS
========================================================= */

async function renderAnalytics() {

  const root =
    document.getElementById("content");

  root.innerHTML = `

    <div class="page-head">

      <div>
        <h1 class="page-title">📈 Аналитика</h1>

        <div class="page-description">
          Статистика платформы, публикаций, участников и активности.
        </div>
      </div>

      <button class="btn"
        onclick="renderAnalytics()">
        ↻ Обновить
      </button>

    </div>

    <div class="stat-grid">

      <div class="stat-card">
        <div class="stat-label">Просмотры</div>
        <div class="stat-value">
          ${val(state.stats.views)}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Реакции</div>
        <div class="stat-value">
          ${val(state.stats.reactions)}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Комментарии</div>
        <div class="stat-value">
          ${val(state.stats.comments)}
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Поделились</div>
        <div class="stat-value">
          ${val(state.stats.shares)}
        </div>
      </div>

    </div>

    <div class="dashboard-grid">

      <div class="card">

        <div class="card-head">
          <h3>📊 Метрики платформы</h3>
        </div>

        <div class="card-body">

          ${metricRow(
            "Публикации",
            state.stats.total_publications ??
            state.stats.publications
          )}

          ${metricRow(
            "Опубликовано",
            state.stats.published_publications
          )}

          ${metricRow(
            "Ожидают разрешения",
            state.stats.pending_publications ??
            state.stats.pending
          )}

          ${metricRow(
            "Участники",
            state.stats.total_participants ??
            state.stats.participants
          )}

          ${metricRow(
            "Жалобы",
            state.stats.reports
          )}

          ${metricRow(
            "Сохранения",
            state.stats.saves
          )}

        </div>

      </div>

      <div class="card">

        <div class="card-head">
          <h3>🎯 Контроль активности</h3>
        </div>

        <div class="card-body">

          <p style="color:#718096;font-size:12px;line-height:1.7">
            Администратор может отслеживать публикации,
            участников, реакции, сообщения, жалобы,
            просмотры, сохранения и распространение контента.
          </p>

          <button class="btn btn-primary"
            onclick="goPage('publications')">
            Открыть публикации
          </button>

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   SETTINGS
========================================================= */

async function renderSettings() {

  const root =
    document.getElementById("content");

  root.innerHTML = `

    <div class="page-head">

      <div>
        <h1 class="page-title">⚙️ Настройки</h1>

        <div class="page-description">
          Центральное управление конфигурацией платформы.
        </div>
      </div>

      <button class="btn btn-primary"
        onclick="saveSettings()">
        Сохранить
      </button>

    </div>

    <div class="card">

      <div class="settings-grid">

        <div class="settings-nav">

          <button class="settings-tab active">
            Основные
          </button>

          <button class="settings-tab">
            Участники
          </button>

          <button class="settings-tab">
            Модерация
          </button>

          <button class="settings-tab">
            Языки
          </button>

          <button class="settings-tab">
            Уведомления
          </button>

          <button class="settings-tab">
            Безопасность
          </button>

        </div>

        <div class="card-body">

          <div class="field">
            <label>Название сайта</label>
            <input
              id="settingSiteName"
              value="Tajik Opportunities"
            >
          </div>

          <div class="field">
            <label>Официальный username</label>
            <input
              id="settingOfficialUsername"
              value="@tajikopportunities"
            >
          </div>

          <div class="field">
            <label>Язык по умолчанию</label>
            <select id="settingLanguage">
              <option value="ru">Русский</option>
              <option value="tg">Тоҷикӣ</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="field">
            <label>Часовой пояс</label>
            <input
              id="settingTimezone"
              value="Asia/Dushanbe"
            >
          </div>

          <div class="setting-row">

            <div>
              <strong>Участники без регистрации</strong>
              <span>
                Участник открывает сайт и пользуется им без аккаунта.
              </span>
            </div>

            <button class="switch on" type="button"></button>

          </div>

          <div class="setting-row">

            <div>
              <strong>Участники без обычного входа</strong>
              <span>
                Не показывать форму входа участникам.
              </span>
            </div>

            <button class="switch on" type="button"></button>

          </div>

          <div class="setting-row">

            <div>
              <strong>Модерация публикаций</strong>
              <span>
                Новые публикации сначала попадают администратору.
              </span>
            </div>

            <button class="switch on" type="button"></button>

          </div>

          <div class="setting-row">

            <div>
              <strong>Приватные чаты</strong>
              <span>
                У каждого участника отдельная переписка с официальным аккаунтом.
              </span>
            </div>

            <button class="switch on" type="button"></button>

          </div>

        </div>

      </div>

    </div>
  `;

  try {

    const result =
      await api("/admin/settings");

    state.settings =
      result?.data ||
      result?.settings ||
      result ||
      {};

    const s = state.settings;

    if (s.site_name)
      document.getElementById("settingSiteName").value =
        s.site_name;

    if (s.official_username)
      document.getElementById("settingOfficialUsername").value =
        s.official_username;

    if (s.default_language)
      document.getElementById("settingLanguage").value =
        s.default_language;

    if (s.timezone)
      document.getElementById("settingTimezone").value =
        s.timezone;

  } catch {}
}


async function saveSettings() {

  const data = {
    site_name:
      document.getElementById("settingSiteName")?.value,

    official_username:
      document.getElementById("settingOfficialUsername")?.value,

    default_language:
      document.getElementById("settingLanguage")?.value,

    timezone:
      document.getElementById("settingTimezone")?.value,

    participant_registration:false,
    participant_login:false,
    publication_moderation:true,
    private_chat:true
  };

  try {

    await api("/admin/settings", {
      method:"PUT",
      body:JSON.stringify(data)
    });

    toast("Настройки сохранены","success");

  } catch {}
}


/* =========================================================
   AUDIT
========================================================= */

async function renderAudit() {

  const root =
    document.getElementById("content");

  root.innerHTML = `

    <div class="page-head">

      <div>
        <h1 class="page-title">📋 Журнал действий</h1>

        <div class="page-description">
          История административных изменений и действий.
        </div>
      </div>

      <button class="btn"
        onclick="renderAudit()">
        ↻ Обновить
      </button>

    </div>

    <div class="card">

      <div id="auditList">
        <div class="empty">Загрузка...</div>
      </div>

    </div>
  `;

  try {

    const result =
      await api("/admin/audit");

    const items =
      result?.data ||
      result?.audit ||
      result?.items ||
      [];

    const box =
      document.getElementById("auditList");

    if (!items.length) {

      box.innerHTML = `
        <div class="empty">
          <div class="empty-icon">📋</div>
          Журнал пока пуст.
        </div>
      `;

      return;
    }

    box.innerHTML =
      items.map(a => `

        <div style="
          padding:15px 19px;
          border-bottom:1px solid #edf0f4;
        ">

          <strong>
            ${escapeHtml(
              a.action ||
              a.event ||
              "Действие"
            )}
          </strong>

          <div style="
            color:#64748b;
            font-size:11px;
            margin-top:5px;
          ">
            ${escapeHtml(
              a.description ||
              a.target_type ||
              ""
            )}
          </div>

          <div style="
            color:#94a3b8;
            font-size:10px;
            margin-top:5px;
          ">
            ${formatDate(a.created_at)}
          </div>

        </div>

      `).join("");

  } catch {}
}


/* =========================================================
   SYSTEM
========================================================= */

async function renderSystem() {

  const root =
    document.getElementById("content");

  root.innerHTML = `

    <div class="page-head">

      <div>
        <h1 class="page-title">🛡️ Система</h1>

        <div class="page-description">
          Техническое состояние административной системы.
        </div>
      </div>

      <button class="btn"
        onclick="renderSystem()">
        ↻ Проверить
      </button>

    </div>

    <div class="card">

      <div class="card-body">

        <div class="setting-row">

          <div>
            <strong>Cloudflare Worker API</strong>
            <span>Основной сервер приложения</span>
          </div>

          <span class="status status-active">
            ДОСТУПЕН
          </span>

        </div>

        <div class="setting-row">

          <div>
            <strong>D1 Database</strong>
            <span>Хранилище данных платформы</span>
          </div>

          <span class="status status-active">
            ПОДКЛЮЧЕНА
          </span>

        </div>

        <div class="setting-row">

          <div>
            <strong>Права администратора</strong>
            <span>Полный набор разрешений</span>
          </div>

          <span class="status status-active">
            *
          </span>

        </div>

        <div class="setting-row">

          <div>
            <strong>Участническая регистрация</strong>
            <span>Не используется</span>
          </div>

          <span class="status status-active">
            ОТКЛЮЧЕНА
          </span>

        </div>

        <div class="setting-row">

          <div>
            <strong>Участнический вход</strong>
            <span>Не используется</span>
          </div>

          <span class="status status-active">
            ОТКЛЮЧЕН
          </span>

        </div>

      </div>

    </div>
  `;
}


/* =========================================================
   MODAL
========================================================= */

function showModal(html) {

  const root =
    document.getElementById("modalRoot");

  root.innerHTML = `
    <div class="modal-backdrop"
      onclick="backdropClose(event)">
      ${html}
    </div>
  `;
}


function backdropClose(event) {

  if (
    event.target.classList.contains(
      "modal-backdrop"
    )
  ) {
    closeModal();
  }
}


function closeModal() {

  document.getElementById("modalRoot")
    .innerHTML = "";
}


/* =========================================================
   FORM HELPERS
========================================================= */

function inputField(name,label,value="",required=false) {

  return `
    <div class="field">

      <label>${escapeHtml(label)}</label>

      <input
        name="${escapeHtml(name)}"
        value="${escapeAttr(value)}"
        ${required ? "required" : ""}
      >

    </div>
  `;
}


function textareaField(name,label,value="") {

  return `
    <div class="field form-full">

      <label>${escapeHtml(label)}</label>

      <textarea
        name="${escapeHtml(name)}"
        rows="6"
      >${escapeHtml(value)}</textarea>

    </div>
  `;
}


function selectField(name,label,value,options) {

  return `
    <div class="field">

      <label>${escapeHtml(label)}</label>

      <select name="${escapeHtml(name)}">

        ${options.map(o => `
          <option
            value="${escapeAttr(o)}"
            ${String(o) === String(value) ? "selected" : ""}
          >
            ${escapeHtml(o)}
          </option>
        `).join("")}

      </select>

    </div>
  `;
}


function counterField(name,label,value) {

  return `
    <div class="field">

      <label>${escapeHtml(label)}</label>

      <input
        type="number"
        min="0"
        step="1"
        data-counter="${escapeAttr(name)}"
        value="${escapeAttr(value ?? 0)}"
      >

    </div>
  `;
}


function infoField(label,value) {

  return `
    <div style="
      padding:13px;
      background:#f8fafc;
      border:1px solid #edf0f4;
      border-radius:12px;
    ">

      <div style="
        color:#94a3b8;
        font-size:10px;
        font-weight:800;
        text-transform:uppercase;
      ">
        ${escapeHtml(label)}
      </div>

      <div style="
        margin-top:5px;
        font-size:12px;
        font-weight:800;
      ">
        ${escapeHtml(String(value ?? "—"))}
      </div>

    </div>
  `;
}


function metricRow(label,value) {

  return `
    <div class="setting-row">

      <div>
        <strong>${escapeHtml(label)}</strong>
        <span>Текущее значение</span>
      </div>

      <strong>
        ${val(value)}
      </strong>

    </div>
  `;
}


/* =========================================================
   UTILITIES
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


function escapeAttr(value) {
  return escapeHtml(value);
}


function esc(value) {
  return String(value ?? "")
    .replace(/\\/g,"\\\\")
    .replace(/'/g,"\\'")
    .replace(/"/g,"&quot;");
}


function formatDate(value) {

  if (!value) return "—";

  try {

    return new Date(value)
      .toLocaleString(
        "ru-RU",
        {
          dateStyle:"short",
          timeStyle:"short"
        }
      );

  } catch {

    return String(value);
  }
}


function toast(message,type="success") {

  const box =
    document.getElementById("toastBox");

  const item =
    document.createElement("div");

  item.className =
    `toast ${type}`;

  item.textContent =
    message;

  box.appendChild(item);

  setTimeout(() => {
    item.remove();
  },4000);
}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

document.getElementById("globalSearch")
.addEventListener("keydown", e => {

  if (e.key !== "Enter") return;

  const q =
    e.target.value.trim();

  if (!q) return;

  if (
    q.startsWith("@") ||
    q.length > 2
  ) {

    goPage("participants");

    setTimeout(() => {

      const input =
        document.getElementById(
          "participantSearch"
        );

      if (input) {

        input.value = q;
        loadParticipants();

      }

    },100);

  }

});


/* =========================================================
   START
========================================================= */

startAdmin();

</script>

</body>
</html>
