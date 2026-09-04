/**
 * ============================================================
 * TAJIK OPPORTUNITIES — MAIN SCRIPT
 * ============================================================
 * @version 2.0.0
 * @description Основной скрипт для загрузки и отображения публикаций
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
            POSTS: '/api/posts',
            STATUS: '/api/submissions/status',
        },
        UI: {
            POSTS_SELECTOR: '#posts',
            EMPTY_SELECTOR: '#empty',
            REFRESH_SELECTOR: '#refreshBtn',
            LOAD_MORE_SELECTOR: '#loadMoreBtn',
            LOADING_SELECTOR: '#loading',
        },
        POSTS: {
            PER_PAGE: 10,
            MAX_CONTENT_PREVIEW: 320,
            CACHE_KEY: 'tajik_posts_cache',
            CACHE_TTL: 300000, // 5 минут
        },
        IMAGES: {
            PLACEHOLDER: '/images/placeholder.jpg',
            DEFAULT_ALT: 'Изображение публикации',
        },
    };

    // ============================================================
    // DOM ЭЛЕМЕНТЫ
    // ============================================================

    const postsBox = document.querySelector(CONFIG.UI.POSTS_SELECTOR);
    const emptyBox = document.querySelector(CONFIG.UI.EMPTY_SELECTOR);
    const refreshBtn = document.querySelector(CONFIG.UI.REFRESH_SELECTOR);
    const loadMoreBtn = document.querySelector(CONFIG.UI.LOAD_MORE_SELECTOR);
    const loadingState = document.querySelector(CONFIG.UI.LOADING_SELECTOR);

    // Состояние
    let allPosts = [];
    let currentPage = 0;
    let isLoading = false;
    let hasMorePosts = true;

    // ============================================================
    // УТИЛИТЫ
    // ============================================================

    /**
     * Экранирование HTML-сущностей
     */
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

    /**
     * Форматирование даты
     */
    function formatDate(dateString) {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
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

    /**
     * Форматирование даты для отображения (относительное время)
     */
    function formatRelativeTime(dateString) {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'Только что';
            if (diff < 3600000) return Math.floor(diff / 60000) + ' мин. назад';
            if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч. назад';
            if (diff < 172800000) return 'Вчера';
            if (diff < 259200000) return 'Позавчера';
            
            return formatDate(dateString);
        } catch {
            return dateString;
        }
    }

    /**
     * Обрезка текста с сохранением слов
     */
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        const trimmed = text.slice(0, maxLength);
        const lastSpace = trimmed.lastIndexOf(' ');
        
        if (lastSpace > maxLength * 0.7) {
            return trimmed.slice(0, lastSpace) + '…';
        }
        return trimmed + '…';
    }

    /**
     * Валидация URL изображения
     */
    function isValidImageUrl(url) {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    }

    /**
     * Получение цвета для категории
     */
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

    /**
     * Получение иконки для категории
     */
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

    // ============================================================
    // КЭШИРОВАНИЕ
    // ============================================================

    function getCachedPosts() {
        try {
            const cached = localStorage.getItem(CONFIG.POSTS.CACHE_KEY);
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            const now = Date.now();
            
            if (now - data.timestamp > CONFIG.POSTS.CACHE_TTL) {
                return null;
            }
            
            return data.posts;
        } catch {
            return null;
        }
    }

    function setCachedPosts(posts) {
        try {
            localStorage.setItem(CONFIG.POSTS.CACHE_KEY, JSON.stringify({
                posts: posts,
                timestamp: Date.now(),
            }));
        } catch {
            // Игнорируем ошибки localStorage
        }
    }

    // ============================================================
    // ОТРИСОВКА ПУБЛИКАЦИЙ
    // ============================================================

    function renderPosts(posts, append = false) {
        if (!posts || posts.length === 0) {
            postsBox.innerHTML = '';
            emptyBox.classList.remove('hidden');
            return;
        }

        emptyBox.classList.add('hidden');

        const postsHtml = posts.map((post) => {
            const date = formatDate(post.published_at);
            const relativeDate = formatRelativeTime(post.published_at);
            const shortContent = truncateText(post.content, CONFIG.POSTS.MAX_CONTENT_PREVIEW);
            const categoryColor = getCategoryColor(post.category);
            const categoryIcon = getCategoryIcon(post.category);
            const hasImage = isValidImageUrl(post.image_url);
            const hasLink = isValidImageUrl(post.link_url);

            return `
                <article class="post-card" data-id="${escapeHtml(post.id)}">
                    ${hasImage ? `
                        <img 
                            src="${escapeHtml(post.image_url)}" 
                            loading="lazy" 
                            alt="${escapeHtml(post.title || CONFIG.IMAGES.DEFAULT_ALT)}"
                            onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'; this.onerror=null;"
                            class="post-image"
                            width="400"
                            height="200"
                        >
                    ` : `
                        <div class="post-image-placeholder" style="background: ${categoryColor}20;">
                            <span class="placeholder-icon">${categoryIcon}</span>
                        </div>
                    `}

                    <div class="post-body">
                        <div class="post-meta">
                            <span class="post-category" style="background: ${categoryColor}20; color: ${categoryColor};">
                                ${categoryIcon} ${escapeHtml(post.category)}
                            </span>
                            <span class="post-date" title="${date}">
                                🕐 ${relativeDate}
                            </span>
                        </div>

                        <h3>
                            <a href="/post/${escapeHtml(post.id)}" rel="bookmark">
                                ${escapeHtml(post.title)}
                            </a>
                        </h3>

                        <p class="post-excerpt">${escapeHtml(shortContent)}</p>

                        <div class="post-footer">
                            ${post.author_name ? `
                                <div class="post-author">
                                    <span class="avatar">👤</span>
                                    <span>${escapeHtml(post.author_name)}</span>
                                </div>
                            ` : ''}

                            <div class="post-stats">
                                ${post.view_count !== undefined ? `
                                    <span title="Просмотры">👁️ ${post.view_count}</span>
                                ` : ''}
                                ${post.share_count !== undefined ? `
                                    <span title="Поделились">🔄 ${post.share_count}</span>
                                ` : ''}
                                ${hasLink ? `
                                    <a href="${escapeHtml(post.link_url)}" 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       class="post-link"
                                       title="Перейти по ссылке">
                                        🔗
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        if (append) {
            postsBox.insertAdjacentHTML('beforeend', postsHtml);
        } else {
            postsBox.innerHTML = postsHtml;
        }
    }

    // ============================================================
    // ЗАГРУЗКА ПУБЛИКАЦИЙ
    // ============================================================

    async function loadPosts(forceRefresh = false) {
        if (isLoading) return;
        isLoading = true;

        // Показываем спиннер
        if (!forceRefresh) {
            postsBox.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Загрузка публикаций...</p>
                </div>
            `;
        }

        try {
            // Проверяем кэш
            if (!forceRefresh) {
                const cached = getCachedPosts();
                if (cached && cached.length > 0) {
                    allPosts = cached;
                    renderPosts(allPosts);
                    isLoading = false;
                    return;
                }
            }

            // Запрос к API
            const response = await fetch(CONFIG.API.POSTS);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка загрузки публикаций');
            }

            const posts = data.posts || [];
            allPosts = posts;

            // Сохраняем в кэш
            if (posts.length > 0) {
                setCachedPosts(posts);
            }

            renderPosts(posts);

        } catch (error) {
            console.error('Error loading posts:', error);
            postsBox.innerHTML = `
                <div class="result-error" role="alert">
                    <span class="error-icon" aria-hidden="true">⚠️</span>
                    <div>
                        <strong>Ошибка загрузки</strong>
                        <p>${escapeHtml(error.message || 'Не удалось загрузить публикации. Попробуйте позже.')}</p>
                        <button class="btn btn-secondary btn-small" onclick="loadPosts(true)">
                            🔄 Попробовать снова
                        </button>
                    </div>
                </div>
            `;
        } finally {
            isLoading = false;
        }
    }

    // ============================================================
    // ЗАГРУЗКА ЕЩЁ (пагинация)
    // ============================================================

    function loadMorePosts() {
        if (isLoading || !hasMorePosts) return;

        const start = currentPage * CONFIG.POSTS.PER_PAGE;
        const end = start + CONFIG.POSTS.PER_PAGE;
        const morePosts = allPosts.slice(start, end);

        if (morePosts.length === 0) {
            hasMorePosts = false;
            loadMoreBtn.style.display = 'none';
            return;
        }

        renderPosts(morePosts, true);
        currentPage++;

        if (end >= allPosts.length) {
            hasMorePosts = false;
            loadMoreBtn.style.display = 'none';
        }
    }

    // ============================================================
    // ОБНОВЛЕНИЕ СТАТУСА ЗАЯВКИ (опционально)
    // ============================================================

    async function checkSubmissionStatus(code) {
        if (!code || code.length < 4) {
            return { error: 'Введите код заявки' };
        }

        try {
            const response = await fetch(
                `${CONFIG.API.STATUS}?code=${encodeURIComponent(code)}`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка проверки статуса');
            }

            return data;
        } catch (error) {
            console.error('Status check error:', error);
            return { error: error.message };
        }
    }

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    function init() {
        // Загрузка публикаций
        loadPosts();

        // Кнопка обновления
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.disabled = true;
                this.textContent = '⏳ Загрузка...';
                
                loadPosts(true).finally(() => {
                    this.disabled = false;
                    this.textContent = '↻ Обновить';
                });
            });
        }

        // Кнопка "Загрузить ещё"
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMorePosts);
        }

        // Автообновление при видимости страницы
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // Проверяем кэш при возврате на страницу
                const cached = getCachedPosts();
                if (!cached || cached.length === 0) {
                    loadPosts();
                }
            }
        });

        console.log('✅ Tajik Opportunities script initialized');
        console.log(`📚 ${allPosts.length} posts loaded`);
    }

    // ============================================================
    // ЭКСПОРТ ДЛЯ ВНЕШНЕГО ИСПОЛЬЗОВАНИЯ
    // ============================================================

    window.TajikOpportunities = {
        loadPosts,
        checkSubmissionStatus,
        getCategoryColor,
        getCategoryIcon,
        formatDate,
        formatRelativeTime,
        truncateText,
        escapeHtml,
        CONFIG,
    };

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // ОБРАБОТЧИК ОШИБОК ДЛЯ ИЗОБРАЖЕНИЙ
    // ============================================================

    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.src = CONFIG.IMAGES.PLACEHOLDER;
            e.target.onerror = null;
        }
    }, true);

})();
