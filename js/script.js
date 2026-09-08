/* =========================================================
   TAJIK OPPORTUNITIES - СКРИПТ ДЛЯ ЭФФЕКТОВ
   Файл: js/script.js
   ========================================================= */

// 1. Плавная прокрутка для всех ссылок (если они есть)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 2. Эффект "Параллакс" на горах (горы двигаются чуть медленнее при скролле)
const mountains = document.querySelector('.mountain-effect');
if (mountains) {
    window.addEventListener('scroll', () => {
        let scrollPosition = window.scrollY;
        // Двигаем горы с меньшей скоростью (эффект глубины)
        mountains.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    });
}

// 3. Создание динамических звезд на фоне (чтобы их было больше)
const starfield = document.querySelector('.starfield');
if (starfield) {
    // Генерируем дополнительные мерцающие точки
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Случайное положение
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Случайный размер
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        
        // Случайная скорость мерцания
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        starfield.appendChild(star);
    }
}

// 4. Плавное появление карточек при прокрутке (Intersection Observer)
const cards = document.querySelectorAll('.card');
if (cards.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    // Начальное состояние карточек - скрыты
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        observer.observe(card);
    });
}

// 5. Статус кнопки "Отправить" (если есть форма)
const submitBtn = document.querySelector('.primary-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        // Просто меняем цвет текста для теста
        submitBtn.textContent = 'ОТПРАВЛЕНО!';
        setTimeout(() => {
            submitBtn.textContent = 'НАЧАТЬ';
        }, 2000);
    });
}
