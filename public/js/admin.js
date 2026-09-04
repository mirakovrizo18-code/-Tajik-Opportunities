/**
 * ============================================================
 * TAJIK OPPORTUNITIES — ADMIN SCRIPT
 * ============================================================
 * @version 2.0.0
 * @description Панель администратора для модерации заявок
 * @author Your Team
 * @license MIT
 * ============================================================
 */

(function() {
    'use strict';

    // ============================================================
    // КОНСТАНТЫ
    // ============================================================

    const CONFIG = {
        API: {
            LOGIN: '/api/admin/login',
            LOGOUT: '/api/admin/logout',
            SUBMISSIONS: '/api/admin/submissions',
            APPROVE: '/api/admin/submissions/:id/approve',
            REJECT: '/api/admin/submissions/:id/reject',
        },
        UI: {
            LOGIN_BOX: '#loginBox',
            ADMIN_BOX: '#adminBox',
            LOGIN_FORM: '#loginForm',
            LOGIN_RESULT: '#loginResult',
            PENDING_LIST: '#pendingList',
            LOGOUT_BTN: '#logoutBtn',
            RELOAD_BTN: '#reloadBtn',
            VIEW_ALL_BTN: '#viewAllBtn',
            PASSWORD_INPUT: '#password',
            STATS: {
                PENDING: '#statPending',
                APPROVED: '#statApproved',
                REJECTED: '#statRejected',
                TOTAL: '#statTotal',
            },
        },
        STATUS: {
            PENDING: 'pending',
            APPROVED: 'approved',
            REJECTED: 'rejected',
        },
        MESSAGES: {
            LOADING: 'Загружаем заявки…',
            EMPTY: 'Новых заявок нет',
            CONFIRM_APPROVE: 'Одобрить заявку и опубликовать её на сайте?',
            CONFIRM_REJECT: 'Отклонить заявку?',
            REJECT_REASON: 'Не соответствует требованиям публикации.',
            LOGIN_ERROR: 'Ошибка входа. Проверьте пароль.',
            NETWORK_ERROR: 'Ошибка сети. Проверьте подключение.',
        },
    };

    // ============================================================
    // DOM ЭЛЕМЕНТЫ
    // ============================================================

    const loginBox = document.querySelector(CONFIG.UI.LOGIN_BOX);
    const adminBox = document.querySelector(CONFIG.UI.ADMIN_BOX);
    const loginForm = document.querySelector(CONFIG.UI.LOGIN_FORM);
    const loginResult = document.querySelector(CONFIG.UI.LOGIN_RESULT);
    const pendingList = document.querySelector(CONFIG.UI.PENDING_LIST);
    const logoutButton = document.querySelector(CONFIG.UI.LOGOUT_BTN);
    const reloadBtn = document.querySelector(CONFIG.UI.RELOAD_BTN);
    const viewAllBtn = document.querySelector(CONFIG.UI.VIEW_ALL_BTN);
    const passwordInput = document.querySelector(CONFIG.UI.PASSWORD_INPUT);

    // Статистика
    const statPending = document.querySelector(CONFIG.UI.STATS.PENDING);
    const statApproved = document.querySelector(CONFIG.UI.STATS.APPROVED);
    const statRejected = document.querySelector(CONFIG.UI.STATS.REJECTED);
    const statTotal = document.querySelector(CONFIG.UI.STATS.TOTAL);

    // Состояние
    let currentStatus = CONFIG.STATUS.PENDING;
    let isProcessing = false;

    // ============================================================
    // УТИЛИТЫ
    // ============================================================

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;',
        };
        return String(value).replace(/[&<>"'`=/]/g, function(char) {
            return map[char] || char;
        });
    }

    function formatDate(dateString) {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    }

    function formatRelativeTime(dateString) {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'Только что';
            if (diff < 3600000) return Math.floor(diff / 60000) + ' мин. назад';
            if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч. назад';
            
            return formatDate(dateString);
        } catch {
            return dateString;
        }
    }

    function getStatusBadge(status) {
        const config = {
            [CONFIG.STATUS.PENDING]: {
                label: 'На проверке',
                icon: '⏳',
                css: 'pending',
            },
            [CONFIG.STATUS.APPROVED]: {
                label: 'Одобрено',
                icon: '✅',
                css: 'approved',
            },
            [CONFIG.STATUS.REJECTED]: {
                label: 'Отклонено',
                icon: '❌',
                css: 'rejected',
            },
        };
        return config[status] || config[CONFIG.STATUS.PENDING];
    }

    function getCategoryIcon(category) {
        const icons = {
            'новости': '📰',
            'news': '📰',
            'образование': '🎓',
            'education': '🎓',
            'работа': '💼',
            'job': '💼',
            'возможности': '⭐',
            'opportunity': '⭐',
            'мероприятия': '🎪',
            'event': '🎪',
            'объявления': '📢',
            'announcement': '📢',
            'другое': '📌',
            'other': '📌',
        };
        return icons[category?.toLowerCase()] || '📌';
    }

    function getCategoryColor(category) {
        const colors = {
            'новости': '#3b82f6',
            'news': '#3b82f6',
            'образование': '#8b5cf6',
            'education': '#8b5cf6',
            'работа': '#22c55e',
            'job': '#22c55e',
            'возможности': '#f59e0b',
            'opportunity': '#f59e0b',
            'мероприятия': '#ec4899',
            'event': '#ec4899',
            'объявления': '#06b6d4',
            'announcement': '#06b6d4',
            'другое': '#64748b',
            'other': '#64748b',
        };
        return colors[category?.toLowerCase()] || colors['другое'];
    }

    // ============================================================
    // ОТРИСОВКА ЗАЯВОК
    // ============================================================

    function renderSubmissions(submissions) {
        if (!submissions || submissions.length === 0) {
            pendingList.innerHTML = `
                <div class="empty-state" role="status">
                    <div class="empty-icon" aria-hidden="true">🎉</div>
                    <h3>${CONFIG.MESSAGES.EMPTY}</h3>
                    <p>Все заявки обработаны. Отличная работа!</p>
                </div>
            `;
            return;
        }

        pendingList.innerHTML = submissions.map((item) => {
            const badge = getStatusBadge(item.status);
            const categoryIcon = getCategoryIcon(item.category);
            const categoryColor = getCategoryColor(item.category);
            const createdAt = formatDate(item.created_at);
            const reviewedAt = item.reviewed_at ? formatDate(item.reviewed_at) : null;
            const relativeTime = formatRelativeTime(item.created_at);
            const hasLink = item.link_url && item.link_url.trim();
            const hasImage = item.image_url && item.image_url.trim();
            
            // Обрезка контента для предпросмотра
            const contentPreview = item.content && item.content.length > 500 
                ? item.content.slice(0, 500) + '…' 
                : item.content;

            return `
                <article class="submission-card" data-id="${escapeHtml(item.id)}">
                    <div class="submission-header">
                        <h3 class="submission-title">${escapeHtml(item.title)}</h3>
                        <div class="submission-meta">
                            <span class="submission-category" style="background: ${categoryColor}20; color: ${categoryColor};">
                                ${categoryIcon} ${escapeHtml(item.category)}
                            </span>
                            <span class="status-badge ${badge.css}">
                                ${badge.icon} ${badge.label}
                            </span>
                        </div>
                    </div>

                    <div class="submission-content">
                        ${escapeHtml(contentPreview)}
                        ${item.content && item.content.length > 500 ? `
                            <button class="submission-expand" onclick="AdminUI.toggleContent('${escapeHtml(item.id)}')">
                                Читать полностью ↓
                            </button>
                        ` : ''}
                    </div>

                    <div class="submission-meta">
                        <span>📅 ${relativeTime}</span>
                        ${reviewedAt ? `<span>🔄 Проверено: ${reviewedAt}</span>` : ''}
                        <span>🔑 ${escapeHtml(item.tracking_code)}</span>
                    </div>

                    ${hasLink || hasImage ? `
                        <div class="submission-links">
                            ${hasLink ? `
                                <a href="${escapeHtml(item.link_url)}" target="_blank" rel="noopener noreferrer">
                                    🔗 ${escapeHtml(item.link_url)}
                                </a>
                            ` : ''}
                            ${hasImage ? `
                                <a href="${escapeHtml(item.image_url)}" target="_blank" rel="noopener noreferrer">
                                    🖼️ Изображение
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}

                    <div class="submission-actions">
                        <button class="btn btn-success btn-approve" 
                                onclick="AdminUI.approve('${escapeHtml(item.id)}')"
                                ${item.status !== CONFIG.STATUS.PENDING ? 'disabled' : ''}>
                            ✅ Одобрить
                        </button>
                        <button class="btn btn-danger btn-reject" 
                                onclick="AdminUI.reject('${escapeHtml(item.id)}')"
                                ${item.status !== CONFIG.STATUS.PENDING ? 'disabled' : ''}>
                            ❌ Отклонить
                        </button>
                        <button class="btn btn-secondary btn-view" 
                                onclick="AdminUI.preview('${escapeHtml(item.id)}')">
                            👁️ Просмотр
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    // ============================================================
    // ОБНОВЛЕНИЕ СТАТИСТИКИ
    // ============================================================

    function updateStats(submissions) {
        if (!submissions) {
            statPending.textContent = '0';
            statApproved.textContent = '0';
            statRejected.textContent = '0';
            statTotal.textContent = '0';
            return;
        }

        const pending = submissions.filter(s => s.status === CONFIG.STATUS.PENDING).length;
        const approved = submissions.filter(s => s.status === CONFIG.STATUS.APPROVED).length;
        const rejected = submissions.filter(s => s.status === CONFIG.STATUS.REJECTED).length;
        const total = submissions.length;

        statPending.textContent = pending;
        statApproved.textContent = approved;
        statRejected.textContent = rejected;
        statTotal.textContent = total;
    }

    // ============================================================
    // ЗАГРУЗКА ЗАЯВОК
    // ============================================================

    async function loadSubmissions(status = CONFIG.STATUS.PENDING) {
        const url = new URL(CONFIG.API.SUBMISSIONS, window.location.origin);
        if (status) {
            url.searchParams.set('status', status);
        }

        try {
            const response = await fetch(url.toString());

            if (response.status === 401) {
                // Не авторизован
                loginBox.classList.remove('hidden');
                adminBox.classList.add('hidden');
                logoutButton.classList.add('hidden');
                return;
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Ошибка загрузки заявок');
            }

            const data = await response.json();
            const submissions = data.submissions || [];

            renderSubmissions(submissions);
            updateStats(submissions);

        } catch (error) {
            console.error('Error loading submissions:', error);
            pendingList.innerHTML = `
                <div class="result-error" role="alert">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <div>
                        <strong>Ошибка загрузки</strong>
                        <p>${escapeHtml(error.message || 'Не удалось загрузить заявки')}</p>
                        <button class="btn btn-secondary btn-small" onclick="AdminUI.reload()">
                            🔄 Попробовать снова
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // ============================================================
    // АВТОРИЗАЦИЯ
    // ============================================================

    async function handleLogin(event) {
        event.preventDefault();

        const password = passwordInput.value.trim();
        if (!password) {
            loginResult.innerHTML = `
                <div class="result-error">
                    <span class="error-icon">⚠️</span>
                    <div>Введите пароль</div>
                </div>
            `;
            return;
        }

        loginResult.innerHTML = `
            <div class="result-loading">
                <span class="spinner"></span>
                Проверяем пароль…
            </div>
        `;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const response = await fetch(CONFIG.API.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || CONFIG.MESSAGES.LOGIN_ERROR);
            }

            // Успешный вход
            passwordInput.value = '';
            loginResult.innerHTML = '';
            loginResult.className = '';

            // Показываем админ-панель
            loginBox.classList.add('hidden');
            adminBox.classList.remove('hidden');
            logoutButton.classList.remove('hidden');

            // Загружаем заявки
            await loadSubmissions(currentStatus);

        } catch (error) {
            loginResult.innerHTML = `
                <div class="result-error">
                    <span class="error-icon">⚠️</span>
                    <div>${escapeHtml(error.message)}</div>
                </div>
            `;
            passwordInput.focus();
            passwordInput.select();
        } finally {
            submitBtn.disabled = false;
        }
    }

    // ============================================================
    // ОДОБРЕНИЕ ЗАЯВКИ
    // ============================================================

    async function approveSubmission(id) {
        if (isProcessing) return;

        if (!confirm(CONFIG.MESSAGES.CONFIRM_APPROVE)) {
            return;
        }

        isProcessing = true;
        const btn = document.querySelector(`[onclick*="approve('${id}')"]`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Обработка...';
        }

        try {
            const url = CONFIG.API.APPROVE.replace(':id', encodeURIComponent(id));
            const response = await fetch(url, { method: 'POST' });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при одобрении');
            }

            // Обновляем список
            await loadSubmissions(currentStatus);

        } catch (error) {
            console.error('Approve error:', error);
            alert(error.message);
            if (btn) {
                btn.disabled = false;
                btn.textContent = '✅ Одобрить';
            }
        } finally {
            isProcessing = false;
        }
    }

    // ============================================================
    // ОТКЛОНЕНИЕ ЗАЯВКИ
    // ============================================================

    async function rejectSubmission(id) {
        if (isProcessing) return;

        const reason = prompt(
            'Причина отклонения:',
            CONFIG.MESSAGES.REJECT_REASON
        );

        if (reason === null) return;

        if (!reason.trim()) {
            alert('Пожалуйста, укажите причину отклонения.');
            return;
        }

        isProcessing = true;
        const btn = document.querySelector(`[onclick*="reject('${id}')"]`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Обработка...';
        }

        try {
            const url = CONFIG.API.REJECT.replace(':id', encodeURIComponent(id));
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: reason.trim() }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при отклонении');
            }

            // Обновляем список
            await loadSubmissions(currentStatus);

        } catch (error) {
            console.error('Reject error:', error);
            alert(error.message);
            if (btn) {
                btn.disabled = false;
                btn.textContent = '❌ Отклонить';
            }
        } finally {
            isProcessing = false;
        }
    }

    // ============================================================
    // ПРЕДПРОСМОТР ЗАЯВКИ
    // ============================================================

    function previewSubmission(id) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (!card) return;

        const title = card.querySelector('.submission-title')?.textContent || 'Заявка';
        const content = card.querySelector('.submission-content')?.innerHTML || '';
        const meta = card.querySelectorAll('.submission-meta span');
        const links = card.querySelector('.submission-links');

        let metaHtml = '';
        meta.forEach(el => {
            metaHtml += `<div class="info-row"><span class="info-label">${el.textContent.split(':')[0]}</span><span class="info-value">${el.textContent}</span></div>`;
        });

        const modalContent = `
            <div class="status-card">
                <h3>${escapeHtml(title)}</h3>
                <div class="status-info">
                    ${metaHtml}
                </div>
                <div style="margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 8px;">
                    ${content}
                </div>
                ${links ? `<div style="margin-top: 12px;">${links.innerHTML}</div>` : ''}
            </div>
        `;

        // Используем глобальную функцию из admin.html
        if (window.AdminUI && typeof window.AdminUI.openModal === 'function') {
            window.AdminUI.openModal(modalContent);
        }
    }

    // ============================================================
    // ВЫХОД
    // ============================================================

    async function handleLogout() {
        if (!confirm('Выйти из панели администратора?')) {
            return;
        }

        try {
            await fetch(CONFIG.API.LOGOUT, { method: 'POST' });
            location.reload();
        } catch {
            location.reload();
        }
    }

    // ============================================================
    // ПЕРЕКЛЮЧЕНИЕ КОНТЕНТА
    // ============================================================

    function toggleContent(id) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (!card) return;

        const content = card.querySelector('.submission-content');
        const btn = card.querySelector('.submission-expand');
        if (!content || !btn) return;

        const isExpanded = content.classList.contains('expanded');
        if (isExpanded) {
            content.classList.remove('expanded');
            btn.textContent = 'Читать полностью ↓';
        } else {
            content.classList.add('expanded');
            btn.textContent = 'Свернуть ↑';
        }
    }

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    function init() {
        // Обработчики
        loginForm.addEventListener('submit', handleLogin);

        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        if (reloadBtn) {
            reloadBtn.addEventListener('click', function() {
                this.disabled = true;
                this.textContent = '⏳ Загрузка...';
                loadSubmissions(currentStatus).finally(() => {
                    this.disabled = false;
                    this.textContent = '↻ Обновить';
                });
            });
        }

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function() {
                const isAll = this.dataset.view === 'all';
                if (isAll) {
                    currentStatus = CONFIG.STATUS.PENDING;
                    this.textContent = '📋 Все';
                    this.dataset.view = 'pending';
                } else {
                    currentStatus = null;
                    this.textContent = '📋 Только на проверке';
                    this.dataset.view = 'all';
                }
                loadSubmissions(currentStatus);
            });
        }

        // Enter для логина
        passwordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit', { bubbles: true }));
                e.preventDefault();
            }
        });

        console.log('✅ Admin panel initialized');
    }

    // ============================================================
    // ПУБЛИЧНЫЙ API
    // ============================================================

    window.AdminUI = {
        approve: approveSubmission,
        reject: rejectSubmission,
        preview: previewSubmission,
        reload: () => loadSubmissions(currentStatus),
        toggleContent: toggleContent,
        loadSubmissions: loadSubmissions,
    };

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Загружаем заявки при старте
    loadSubmissions(CONFIG.STATUS.PENDING);

})();
