<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<title>Tajik Opportunities — Чёрный список</title>

<style>
*{
  box-sizing:border-box;
}

:root{
  --bg:#f4f7fb;
  --card:#fff;
  --text:#172033;
  --muted:#6b7280;
  --border:#e5e7eb;
  --primary:#2563eb;
  --primary-dark:#1d4ed8;
  --danger:#dc2626;
  --danger-bg:#fee2e2;
  --success:#16a34a;
  --success-bg:#dcfce7;
  --warning:#d97706;
  --warning-bg:#fef3c7;
  --shadow:0 12px 35px rgba(15,23,42,.08);
  --radius:18px;
}

html,body{
  margin:0;
  padding:0;
  min-height:100%;
  background:var(--bg);
  color:var(--text);
  font-family:Inter,Arial,sans-serif;
}

button,
input,
textarea,
select{
  font:inherit;
}

button{
  cursor:pointer;
}

.app{
  min-height:100vh;
}

/* TOP */

.topbar{
  height:72px;
  background:rgba(255,255,255,.94);
  border-bottom:1px solid var(--border);
  display:flex;
  align-items:center;
  padding:0 25px;
  position:sticky;
  top:0;
  z-index:100;
  backdrop-filter:blur(14px);
}

.back{
  border:0;
  background:#f1f5f9;
  color:#334155;
  border-radius:11px;
  padding:10px 13px;
  font-weight:800;
  margin-right:15px;
}

.logo{
  font-size:19px;
  font-weight:950;
}

.spacer{
  flex:1;
}

.admin{
  background:#eef2ff;
  color:#3730a3;
  padding:9px 13px;
  border-radius:11px;
  font-size:13px;
  font-weight:800;
}

/* CONTENT */

.content{
  max-width:1450px;
  margin:auto;
  padding:28px;
}

.head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:15px;
  margin-bottom:22px;
}

.title{
  margin:0;
  font-size:30px;
  font-weight:950;
}

.subtitle{
  margin:7px 0 0;
  color:var(--muted);
  font-size:14px;
}

/* BUTTONS */

.btn{
  border:0;
  border-radius:11px;
  padding:10px 14px;
  font-size:13px;
  font-weight:850;
  transition:.18s;
}

.btn:hover{
  transform:translateY(-1px);
}

.primary{
  background:var(--primary);
  color:#fff;
}

.primary:hover{
  background:var(--primary-dark);
}

.secondary{
  background:#f1f5f9;
  color:#334155;
}

.danger{
  background:var(--danger-bg);
  color:#991b1b;
}

.success{
  background:var(--success-bg);
  color:#166534;
}

.warning{
  background:var(--warning-bg);
  color:#92400e;
}

.small-btn{
  padding:7px 10px;
  font-size:12px;
}

/* STATS */

.stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:17px;
  margin-bottom:20px;
}

.stat{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:20px;
  position:relative;
}

.stat-label{
  color:var(--muted);
  font-size:13px;
  font-weight:750;
}

.stat-value{
  margin-top:7px;
  font-size:30px;
  font-weight:950;
}

.stat-icon{
  position:absolute;
  right:18px;
  top:18px;
  width:43px;
  height:43px;
  border-radius:13px;
  background:#fef2f2;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:21px;
}

/* CARD */

.card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
}

.card-head{
  padding:18px 20px;
  border-bottom:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.card-title{
  font-weight:900;
  font-size:16px;
}

.card-body{
  padding:20px;
}

/* FILTER */

.filters{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-bottom:18px;
}

.input,
.select,
.textarea{
  width:100%;
  border:1px solid var(--border);
  border-radius:11px;
  padding:11px 13px;
  background:#fff;
  color:var(--text);
  outline:none;
}

.input:focus,
.select:focus,
.textarea:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 3px rgba(37,99,235,.1);
}

.search{
  flex:1;
  min-width:250px;
}

.filter-select{
  width:auto;
  min-width:180px;
}

/* TABLE */

.table-wrap{
  overflow:auto;
}

table{
  width:100%;
  min-width:1050px;
  border-collapse:collapse;
}

th{
  background:#f8fafc;
  color:#64748b;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.04em;
  text-align:left;
  padding:13px 15px;
  border-bottom:1px solid var(--border);
}

td{
  padding:15px;
  border-bottom:1px solid #edf0f3;
  font-size:13px;
  vertical-align:top;
}

tr:hover td{
  background:#fafcff;
}

.id{
  font-family:monospace;
  font-size:11px;
  word-break:break-all;
  max-width:230px;
}

.reason{
  max-width:250px;
}

.note{
  max-width:260px;
  color:#475569;
}

.status{
  display:inline-flex;
  padding:5px 9px;
  border-radius:999px;
  font-size:11px;
  font-weight:850;
}

.status-blocked{
  background:var(--danger-bg);
  color:#991b1b;
}

.status-active{
  background:var(--success-bg);
  color:#166534;
}

/* MODAL */

.modal{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.58);
  display:none;
  justify-content:center;
  align-items:center;
  padding:20px;
  z-index:1000;
  backdrop-filter:blur(5px);
}

.modal.open{
  display:flex;
}

.modal-box{
  width:min(700px,100%);
  max-height:92vh;
  overflow:auto;
  background:#fff;
  border-radius:22px;
  box-shadow:0 30px 90px rgba(0,0,0,.25);
}

.modal-head{
  padding:20px 22px;
  border-bottom:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.modal-title{
  font-size:19px;
  font-weight:950;
}

.close{
  width:36px;
  height:36px;
  border:0;
  border-radius:10px;
  background:#f1f5f9;
  font-size:20px;
}

.modal-body{
  padding:22px;
}

.modal-footer{
  padding:16px 22px;
  border-top:1px solid var(--border);
  display:flex;
  justify-content:flex-end;
  gap:9px;
}

.form-group{
  margin-bottom:16px;
}

.label{
  display:block;
  font-size:12px;
  font-weight:850;
  color:#475569;
  margin-bottom:7px;
}

.textarea{
  min-height:120px;
  resize:vertical;
}

/* TOAST */

.toast-wrap{
  position:fixed;
  right:20px;
  bottom:20px;
  z-index:5000;
  display:flex;
  flex-direction:column;
  gap:9px;
}

.toast{
  min-width:280px;
  max-width:430px;
  padding:14px 16px;
  border-radius:13px;
  color:#fff;
  background:#111827;
  font-size:13px;
  font-weight:750;
  box-shadow:0 15px 40px rgba(0,0,0,.22);
}

.toast.success{
  background:#166534;
}

.toast.error{
  background:#991b1b;
}

/* EMPTY */

.empty{
  padding:50px 20px;
  text-align:center;
  color:var(--muted);
}

.empty-icon{
  font-size:44px;
  margin-bottom:10px;
}

/* MOBILE */

@media(max-width:900px){

  .stats{
    grid-template-columns:repeat(2,1fr);
  }

}

@media(max-width:650px){

  .content{
    padding:15px;
  }

  .topbar{
    padding:0 14px;
  }

  .logo{
    font-size:15px;
  }

  .admin{
    display:none;
  }

  .head{
    align-items:flex-start;
    flex-direction:column;
  }

  .title{
    font-size:23px;
  }

  .stats{
    grid-template-columns:1fr;
  }

}
</style>
</head>

<body>

<div class="app">

<header class="topbar">

  <button class="back"
          onclick="goAdmin()">
    ← Админ-панель
  </button>

  <div class="logo">
    🇹🇯 Tajik Opportunities
  </div>

  <div class="spacer"></div>

  <div class="admin">
    👑 Администратор
  </div>

</header>

<main class="content">

  <div class="head">

    <div>
      <h1 class="title">
        🚫 Чёрный список
      </h1>

      <p class="subtitle">
        Полное управление заблокированными участниками платформы
      </p>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap">

      <button class="btn secondary"
              onclick="loadBlacklist()">
        🔄 Обновить
      </button>

      <button class="btn danger"
              onclick="openBlockModal()">
        🚫 Заблокировать участника
      </button>

    </div>

  </div>


  <!-- STATS -->

  <div class="stats">

    <div class="stat">

      <div class="stat-label">
        Всего записей
      </div>

      <div class="stat-value"
           id="statTotal">
        0
      </div>

      <div class="stat-icon">
        🚫
      </div>

    </div>


    <div class="stat">

      <div class="stat-label">
        Активные блокировки
      </div>

      <div class="stat-value"
           id="statActive">
        0
      </div>

      <div class="stat-icon">
        🔴
      </div>

    </div>


    <div class="stat">

      <div class="stat-label">
        Разблокированные
      </div>

      <div class="stat-value"
           id="statUnblocked">
        0
      </div>

      <div class="stat-icon">
        🟢
      </div>

    </div>


    <div class="stat">

      <div class="stat-label">
        Сегодня
      </div>

      <div class="stat-value"
           id="statToday">
        0
      </div>

      <div class="stat-icon">
        📅
      </div>

    </div>

  </div>


  <!-- FILTER -->

  <div class="filters">

    <input
      id="search"
      class="input search"
      placeholder="🔎 Поиск по ID, причине или заметке..."
      oninput="renderBlacklist()"
    >

    <select
      id="statusFilter"
      class="select filter-select"
      onchange="renderBlacklist()">

      <option value="">Все</option>
      <option value="blocked">Заблокированные</option>
      <option value="unblocked">Разблокированные</option>

    </select>

  </div>


  <!-- TABLE -->

  <div class="card">

    <div class="card-head">

      <div class="card-title">
        Список участников
      </div>

      <div class="small"
           id="countText">
        0 записей
      </div>

    </div>

    <div class="table-wrap">

      <table>

        <thead>

          <tr>

            <th>Участник</th>
            <th>Статус</th>
            <th>Причина</th>
            <th>Заметка администратора</th>
            <th>Заблокирован</th>
            <th>Последняя активность</th>
            <th>Управление</th>

          </tr>

        </thead>

        <tbody id="blacklistTable">

          <tr>

            <td colspan="7">

              <div class="empty">
                <div class="empty-icon">⏳</div>
                Загрузка...
              </div>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>

</main>

</div>


<!-- BLOCK MODAL -->

<div class="modal"
     id="blockModal">

  <div class="modal-box">

    <div class="modal-head">

      <div class="modal-title">
        🚫 Блокировка участника
      </div>

      <button class="close"
              onclick="closeModal('blockModal')">
        ×
      </button>

    </div>


    <div class="modal-body">

      <div class="form-group">

        <label class="label">
          ID участника
        </label>

        <input
          id="blockParticipantId"
          class="input"
          placeholder="Например: visitor_xxxxxxxxx"
        >

      </div>


      <div class="form-group">

        <label class="label">
          Причина блокировки
        </label>

        <select
          id="blockReason"
          class="select">

          <option value="spam">
            Спам
          </option>

          <option value="fraud">
            Мошенничество
          </option>

          <option value="scam">
            Обман
          </option>

          <option value="abuse">
            Оскорбления / нарушение правил
          </option>

          <option value="illegal">
            Запрещённый контент
          </option>

          <option value="harassment">
            Преследование
          </option>

          <option value="fake">
            Ложная информация
          </option>

          <option value="other">
            Другая причина
          </option>

        </select>

      </div>


      <div class="form-group">

        <label class="label">
          Дополнительная причина
        </label>

        <textarea
          id="blockReasonText"
          class="textarea"
          placeholder="Подробно укажите причину блокировки..."
        ></textarea>

      </div>


      <div class="form-group">

        <label class="label">
          Внутренняя заметка администратора
        </label>

        <textarea
          id="blockNote"
          class="textarea"
          placeholder="Эта заметка видна только администратору..."
        ></textarea>

      </div>

    </div>


    <div class="modal-footer">

      <button class="btn secondary"
              onclick="closeModal('blockModal')">
        Отмена
      </button>

      <button class="btn danger"
              onclick="blockParticipant()">
        🚫 Заблокировать
      </button>

    </div>

  </div>

</div>


<!-- EDIT MODAL -->

<div class="modal"
     id="editModal">

  <div class="modal-box">

    <div class="modal-head">

      <div class="modal-title">
        ✏️ Изменить запись ЧС
      </div>

      <button class="close"
              onclick="closeModal('editModal')">
        ×
      </button>

    </div>


    <div class="modal-body">

      <input type="hidden"
             id="editId">


      <div class="form-group">

        <label class="label">
          ID участника
        </label>

        <input
          id="editParticipantId"
          class="input"
          readonly
        >

      </div>


      <div class="form-group">

        <label class="label">
          Причина
        </label>

        <input
          id="editReason"
          class="input"
        >

      </div>


      <div class="form-group">

        <label class="label">
          Заметка администратора
        </label>

        <textarea
          id="editNote"
          class="textarea"
        ></textarea>

      </div>


      <div class="form-group">

        <label class="label">
          Статус
        </label>

        <select
          id="editBlocked"
          class="select">

          <option value="true">
            Заблокирован
          </option>

          <option value="false">
            Разблокирован
          </option>

        </select>

      </div>

    </div>


    <div class="modal-footer">

      <button class="btn secondary"
              onclick="closeModal('editModal')">
        Отмена
      </button>

      <button class="btn primary"
              onclick="saveBlacklistEntry()">
        💾 Сохранить
      </button>

    </div>

  </div>

</div>


<!-- TOAST -->

<div class="toast-wrap"
     id="toastWrap"></div>


<script>

/* =========================================================
   TAJIK OPPORTUNITIES
   ADMIN BLACKLIST
========================================================= */

const API="/api";

let blacklist=[];


/* =========================================================
   HELPERS
========================================================= */

function $(id){
  return document.getElementById(id);
}


function esc(value){

  if(value===null || value===undefined){
    return "";
  }

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function formatDate(value){

  if(!value){
    return "—";
  }

  try{

    return new Date(value)
      .toLocaleString("ru-RU");

  }catch{

    return String(value);

  }

}


function number(value){

  return Number(value || 0)
    .toLocaleString("ru-RU");

}


function toast(message,type=""){

  const el=document.createElement("div");

  el.className="toast "+type;

  el.textContent=message;

  $("toastWrap").appendChild(el);

  setTimeout(()=>{
    el.remove();
  },3500);

}


/* =========================================================
   API
========================================================= */

async function api(path,options={}){

  try{

    const response=await fetch(
      API+path,
      {
        ...options,

        headers:{
          "Content-Type":"application/json",
          ...(options.headers || {})
        }
      }
    );


    const text=await response.text();

    let data={};

    try{

      data=text
        ? JSON.parse(text)
        : {};

    }catch{

      data={
        ok:false,
        error:text ||
          "Сервер вернул неправильный ответ"
      };

    }


    if(!response.ok){

      throw new Error(
        data.error ||
        data.message ||
        `Ошибка сервера: ${response.status}`
      );

    }


    return data;

  }catch(error){

    console.error(error);

    toast(
      error.message ||
      "Ошибка соединения с сервером",
      "error"
    );

    throw error;

  }

}


/* =========================================================
   LOAD
========================================================= */

async function loadBlacklist(){

  $("blacklistTable").innerHTML=`

    <tr>

      <td colspan="7">

        <div class="empty">

          <div class="empty-icon">
            ⏳
          </div>

          Загрузка чёрного списка...

        </div>

      </td>

    </tr>

  `;


  try{

    const data=
      await api("/admin/blacklist");


    blacklist=
      data.items ||
      data.blacklist ||
      data.rows ||
      data.participants ||
      [];


    updateStats();

    renderBlacklist();

  }catch(error){

    $("blacklistTable").innerHTML=`

      <tr>

        <td colspan="7">

          <div class="empty">

            <div class="empty-icon">
              ⚠️
            </div>

            Не удалось загрузить чёрный список

          </div>

        </td>

      </tr>

    `;

  }

}


/* =========================================================
   STATS
========================================================= */

function updateStats(){

  const total=blacklist.length;

  const active=
    blacklist.filter(
      x=>Boolean(x.blocked)
    ).length;

  const unblocked=
    total-active;


  const todayStart=
    new Date();

  todayStart.setHours(
    0,0,0,0
  );


  const today=
    blacklist.filter(x=>{

      const date=
        new Date(
          x.blocked_at ||
          x.created_at
        );

      return date>=todayStart;

    }).length;


  $("statTotal").textContent=
    number(total);

  $("statActive").textContent=
    number(active);

  $("statUnblocked").textContent=
    number(unblocked);

  $("statToday").textContent=
    number(today);

}


/* =========================================================
   RENDER
========================================================= */

function renderBlacklist(){

  const search=
    ($("search").value || "")
      .trim()
      .toLowerCase();


  const filter=
    $("statusFilter").value;


  let rows=
    blacklist.filter(item=>{

      const participant=
        String(
          item.participant_id ||
          item.visitor_id ||
          item.id ||
          ""
        ).toLowerCase();


      const reason=
        String(
          item.reason ||
          item.reason_text ||
          ""
        ).toLowerCase();


      const note=
        String(
          item.note ||
          item.admin_note ||
          ""
        ).toLowerCase();


      const matchesSearch=
        !search ||
        participant.includes(search) ||
        reason.includes(search) ||
        note.includes(search);


      const blocked=
        Boolean(item.blocked);


      const matchesStatus=
        !filter ||
        (filter==="blocked" && blocked) ||
        (filter==="unblocked" && !blocked);


      return matchesSearch &&
             matchesStatus;

    });


  $("countText").textContent=
    `${rows.length.toLocaleString("ru-RU")} записей`;


  if(!rows.length){

    $("blacklistTable").innerHTML=`

      <tr>

        <td colspan="7">

          <div class="empty">

            <div class="empty-icon">
              🛡️
            </div>

            В чёрном списке ничего не найдено

          </div>

        </td>

      </tr>

    `;

    return;

  }


  $("blacklistTable").innerHTML=
    rows.map(renderRow).join("");

}


function renderRow(item){

  const id=
    item.id ||
    item.participant_id ||
    item.visitor_id ||
    "";


  const participantId=
    item.participant_id ||
    item.visitor_id ||
    item.id ||
    "—";


  const blocked=
    Boolean(item.blocked);


  return `

    <tr>

      <td>

        <div class="id">
          ${esc(participantId)}
        </div>

        ${
          item.publications_count !== undefined
          ?
          `
          <div class="muted"
               style="margin-top:6px">
            📰 Публикаций:
            ${number(item.publications_count)}
          </div>
          `
          :
          ""
        }

      </td>


      <td>

        ${
          blocked

          ?

          `
          <span class="status status-blocked">
            🔴 Заблокирован
          </span>
          `

          :

          `
          <span class="status status-active">
            🟢 Разблокирован
          </span>
          `

        }

      </td>


      <td>

        <div class="reason">

          <strong>
            ${esc(
              item.reason ||
              "Без причины"
            )}
          </strong>


          ${
            item.reason_text
            ?
            `
            <div class="muted"
                 style="margin-top:5px">
              ${esc(item.reason_text)}
            </div>
            `
            :
            ""
          }

        </div>

      </td>


      <td>

        <div class="note">

          ${esc(
            item.note ||
            item.admin_note ||
            "Нет заметки"
          )}

        </div>

      </td>


      <td>
        ${formatDate(
          item.blocked_at ||
          item.created_at
        )}
      </td>


      <td>
        ${formatDate(
          item.last_seen_at ||
          item.updated_at
        )}
      </td>


      <td>

        <div style="
          display:flex;
          gap:6px;
          flex-wrap:wrap;
        ">

          <button
            class="btn small-btn secondary"
            onclick="editEntry('${esc(id)}')">
            ✏️ Изменить
          </button>


          ${
            blocked

            ?

            `
            <button
              class="btn small-btn success"
              onclick="unblock('${esc(id)}')">
              🔓 Разблокировать
            </button>
            `

            :

            `
            <button
              class="btn small-btn danger"
              onclick="blockExisting('${esc(id)}')">
              🚫 Заблокировать
            </button>
            `

          }


          <button
            class="btn small-btn danger"
            onclick="deleteEntry('${esc(id)}')">
            🗑 Удалить
          </button>

        </div>

      </td>

    </tr>

  `;

}


/* =========================================================
   OPEN BLOCK
========================================================= */

function openBlockModal(){

  $("blockParticipantId").value="";
  $("blockReason").value="spam";
  $("blockReasonText").value="";
  $("blockNote").value="";

  openModal("blockModal");

}


/* =========================================================
   BLOCK
========================================================= */

async function blockParticipant(){

  const participantId=
    $("blockParticipantId")
      .value
      .trim();


  if(!participantId){

    toast(
      "Введите ID участника",
      "error"
    );

    return;

  }


  const reason=
    $("blockReason").value;


  const reasonText=
    $("blockReasonText")
      .value
      .trim();


  const note=
    $("blockNote")
      .value
      .trim();


  try{

    await api(
      "/admin/blacklist",
      {
        method:"POST",

        body:JSON.stringify({

          participant_id:
            participantId,

          visitor_id:
            participantId,

          reason,

          reason_text:
            reasonText,

          note,

          blocked:true

        })

      }
    );


    closeModal("blockModal");


    toast(
      "Участник добавлен в ЧС",
      "success"
    );


    loadBlacklist();

  }catch(error){}

}


/* =========================================================
   BLOCK EXISTING
========================================================= */

async function blockExisting(id){

  if(!confirm(
    "Заблокировать этого участника?"
  )){
    return;
  }


  try{

    await api(
      "/admin/blacklist/"+encodeURIComponent(id),
      {
        method:"PATCH",

        body:JSON.stringify({

          blocked:true

        })

      }
    );


    toast(
      "Участник заблокирован",
      "success"
    );


    loadBlacklist();

  }catch(error){}

}


/* =========================================================
   UNBLOCK
========================================================= */

async function unblock(id){

  if(!confirm(
    "Разблокировать этого участника?"
  )){
    return;
  }


  try{

    await api(
      "/admin/blacklist/"+encodeURIComponent(id),
      {
        method:"PATCH",

        body:JSON.stringify({

          blocked:false

        })

      }
    );


    toast(
      "Участник разблокирован",
      "success"
    );


    loadBlacklist();

  }catch(error){}

}


/* =========================================================
   EDIT
========================================================= */

function editEntry(id){

  const item=
    blacklist.find(
      x=>String(
        x.id ||
        x.participant_id ||
        x.visitor_id
      )===String(id)
    );


  if(!item){

    toast(
      "Запись не найдена",
      "error"
    );

    return;

  }


  $("editId").value=
    item.id ||
    item.participant_id ||
    item.visitor_id ||
    "";


  $("editParticipantId").value=
    item.participant_id ||
    item.visitor_id ||
    item.id ||
    "";


  $("editReason").value=
    item.reason ||
    "";


  $("editNote").value=
    item.note ||
    item.admin_note ||
    "";


  $("editBlocked").value=
    item.blocked
    ? "true"
    : "false";


  openModal("editModal");

}


async function saveBlacklistEntry(){

  const id=
    $("editId").value;


  if(!id){

    toast(
      "Не найден ID записи",
      "error"
    );

    return;

  }


  try{

    await api(
      "/admin/blacklist/"+
      encodeURIComponent(id),
      {
        method:"PATCH",

        body:JSON.stringify({

          reason:
            $("editReason").value,

          note:
            $("editNote").value,

          blocked:
            $("editBlocked").value==="true"

        })

      }
    );


    closeModal("editModal");


    toast(
      "Запись сохранена",
      "success"
    );


    loadBlacklist();

  }catch(error){}

}


/* =========================================================
   DELETE
========================================================= */

async function deleteEntry(id){

  if(!confirm(
    "Удалить эту запись из чёрного списка?\n\n"+
    "Это действие удалит саму запись ЧС."
  )){
    return;
  }


  try{

    await api(
      "/admin/blacklist/"+
      encodeURIComponent(id),
      {
        method:"DELETE"
      }
    );


    toast(
      "Запись удалена",
      "success"
    );


    loadBlacklist();

  }catch(error){}

}


/* =========================================================
   MODALS
========================================================= */

function openModal(id){

  $(id).classList.add("open");

}


function closeModal(id){

  $(id).classList.remove("open");

}


document.querySelectorAll(".modal")
.forEach(modal=>{

  modal.addEventListener(
    "click",
    event=>{

      if(event.target===modal){

        modal.classList.remove("open");

      }

    }
  );

});


document.addEventListener(
  "keydown",
  event=>{

    if(event.key==="Escape"){

      document
        .querySelectorAll(".modal.open")
        .forEach(modal=>{
          modal.classList.remove("open");
        });

    }

  }
);


/* =========================================================
   BACK
========================================================= */

function goAdmin(){

  location.href="/admin.html";

}


/* =========================================================
   INIT
========================================================= */

loadBlacklist();

</script>

</body>
</html>
