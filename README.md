# 🇹🇯 Tajik Opportunities

> **International Social Platform for Opportunities, Jobs, Professional Networking and Communication**

Tajik Opportunities — это современная многофункциональная социальная платформа нового поколения, объединяющая возможности поиска работы, публикации объявлений, профессионального общения, социальных публикаций, отзывов, реакций, личных сообщений, административного управления и интеллектуальных рекомендаций.

Проект построен на **Cloudflare Workers + Cloudflare D1 + Cloudflare R2** и рассчитан не на демонстрационную версию, а на дальнейшее развитие в полноценную production-платформу международного уровня.

---

## 📌 Основная идея

Tajik Opportunities создаётся как единая экосистема, в которой пользователь может:

- находить работу;
- публиковать вакансии;
- искать сотрудников;
- публиковать проекты;
- искать партнёров;
- находить образовательные возможности;
- публиковать услуги;
- находить мероприятия;
- искать инвестиционные возможности;
- создавать профессиональные публикации;
- общаться с администрацией;
- общаться с другими участниками;
- ставить реакции;
- писать комментарии;
- отвечать на комментарии;
- оставлять отзывы;
- ставить оценки от 1 до 5;
- сохранять публикации;
- делиться публикациями;
- подписываться на участников;
- использовать поиск;
- получать уведомления;
- пользоваться персональной лентой;
- получать рекомендации;
- управлять собственным профилем;
- получать уровни, достижения и статусы.

Администратор при этом получает расширенный центр управления всей платформой.

---

# 🚀 Цели проекта

Основные цели Tajik Opportunities:

1. Создать современную платформу возможностей.
2. Объединить социальную сеть, профессиональную платформу и messenger.
3. Сделать публикации удобными как в современных социальных сетях.
4. Сделать коммуникацию удобной как в современных мессенджерах.
5. Создать мощную административную систему.
6. Сделать систему разрешений максимально гибкой.
7. Обеспечить масштабируемость.
8. Обеспечить безопасность.
9. Поддерживать несколько языков.
10. Подготовить платформу к международному использованию.

---

# 🏗 Архитектура

Проект использует:

- Cloudflare Workers — backend/API;
- Cloudflare D1 — основная SQL-база данных;
- Cloudflare R2 — хранение медиафайлов;
- HTML/CSS/JavaScript — frontend;
- TypeScript — backend utilities и сервисы;
- REST API — взаимодействие frontend/backend.

---

# 📁 Структура проекта

```text
tajik-opportunities/
│
├── package.json
├── wrangler.toml
├── tsconfig.json
├── README.md
│
├── src/
│   ├── index.ts
│   │
│   ├── constants/
│   │   ├── app.ts
│   │   ├── permissions.ts
│   │   ├── statuses.ts
│   │   ├── reactions.ts
│   │   ├── publications.ts
│   │   └── reviews.ts
│   │
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.sql
│   │   └── migrations/
│   │       └── 002_reviews.sql
│   │
│   ├── services/
│   │   └── reviews.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── review.ts
│   │
│   └── utils/
│       ├── array.ts
│       ├── cache.ts
│       ├── cookie.ts
│       ├── crypto.ts
│       ├── date.ts
│       ├── encoding.ts
│       ├── error.ts
│       ├── file.ts
│       ├── form.ts
│       ├── http.ts
│       ├── id.ts
│       ├── json.ts
│       ├── logger.ts
│       ├── mime.ts
│       ├── number.ts
│       ├── object.ts
│       ├── pagination.ts
│       ├── permissions.ts
│       ├── request.ts
│       ├── response.ts
│       ├── security.ts
│       ├── slug.ts
│       ├── string.ts
│       └── url.ts
│
├── worker/
│   └── workers.js
│
└── public/
    ├── index.html
    ├── admin.html
    │
    ├── css/
    │   ├── main.css
    │   ├── components.css
    │   ├── chat.css
    │   └── admin.css
    │
    └── js/
        ├── app.js
        ├── api.js
        ├── publications.js
        ├── reviews.js
        ├── chat.js
        ├── chat-ui.js
        ├── notifications.js
        ├── notification-settings.js
        ├── search.js
        └── admin.js
