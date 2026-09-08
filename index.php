<?php
// =========================================================
// TAJIK OPPORTUNITIES - ГЛАВНЫЙ ФАЙЛ САЙТА
// =========================================================

// 1. Подключение к базе
require_once __DIR__ . '/config/config.php';

// 2. Политика содержимого
header('Content-Type: text/html; charset=utf-8');

// 3. Мета-описание
define('SITE_TITLE', 'Tajik Opportunities');
define('DESCRIPTION', 'Мощь, стиль и бесконечные возможности.');

// 4. Обработка данных
$data = [];

// 5. Обработка публикаций
if (isset($_GET['arg'])) {
    $arg = $_GET['arg'];
    $result = get_top_publications();
    if ($result) {
        $data = $result;
    }
}

// 6. Политика и аналитика
if (isset($_SESSION['user_id'])) {
    // Наsten
    $user_id = $_SESSION['user_id'];
    $stmt = $db->prepare("SELECT * FROM to_participants WHERE id = :id");
    $stmt->execute([':id' => $user_id]);
    $user = $stmt->fetchAll();
    if ($user) {
        $data = $user;
    }
}

// 7. Секция подключения
if (isset($_GET['arg']) && $_GET['arg'] === 'all_data') {
    $stmt = $db->prepare("SELECT * FROM to_publications WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 8. Классификация системы
if (isset($_GET['arg']) && $_GET['arg'] === 'categories') {
    $stmt = $db->prepare("SELECT * FROM to_categories WHERE is_active = 1");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 9. Декодирование
if (isset($_GET['arg']) && $_GET['arg'] === 'media') {
    $stmt = $db->prepare("SELECT * FROM to_media");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 10. Важное копирование
if (isset($_GET['arg']) && $_GET['arg'] === 'all_sales') {
    $stmt = $db->prepare("SELECT * FROM to_products WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 11. Усиление
if (isset($_GET['arg']) && $_GET['arg'] === 'services') {
    $stmt = $db->prepare("SELECT * FROM to_services WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 12. Возврат
if (isset($_GET['arg']) && $_GET['arg'] === 'notifications') {
    $stmt = $db->prepare("SELECT * FROM to_notifications WHERE is_read = 0");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 13. Дата
if (isset($_GET['arg']) && $_GET['arg'] === 'categorie_priorities') {
    $stmt = $db->prepare("SELECT * FROM to_categories WHERE is_active = 1 AND sort_order > 0");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 14. Логический индекс
if (isset($_GET['arg']) && $_GET['arg'] === 'chat') {
    $stmt = $db->prepare("SELECT * FROM to_chat_messages");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 15. Мета-теги
if (isset($_GET['arg']) && $_GET['arg'] === 'all_data_meta') {
    $stmt = $db->prepare("SELECT * FROM to_publication_meta");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 16. Аргументы для экспорта
if (isset($_GET['arg']) && $_GET['arg'] === 'admin_settings') {
    $stmt = $db->prepare("SELECT * FROM to_settings");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 17. Замечание
if (isset($_GET['arg']) && $_GET['arg'] === 'categorie_full_metrics') {
    $stmt = $db->prepare("SELECT * FROM to_categories");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 18. Result
if (isset($_GET['arg']) && $_GET['arg'] === 'publications_full_metrics') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 19. Notifications
if (isset($_GET['arg']) && $_GET['arg'] === 'notifications_all') {
    $stmt = $db->prepare("SELECT * FROM to_notifications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 20. Выявление
if (isset($_GET['arg']) && $_GET['arg'] === 'categories_only') {
    $stmt = $db->prepare("SELECT * FROM to_categories WHERE is_active = 1");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 21. Использование
if (isset($_GET['arg']) && $_GET['arg'] === 'phone')
{
    $stmt = $db->prepare("SELECT * FROM to_services WHERE city = 'Dushanbe'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 22. Выполнение
if (isset($_GET['arg']) && $_GET['arg'] === 'region_details') {
    $stmt = $db->prepare("SELECT * FROM to_organizations WHERE is_verified = 1");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 23. Консалтинг
if (isset($_GET['arg']) && $_GET['arg'] === 'region_all') {
    $stmt = $db->prepare("SELECT * FROM to_organizations");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 24. Цена
if (isset($_GET['arg']) && $_GET['arg'] === 'payments') {
    $stmt = $db->prepare("SELECT * FROM to_ad_campaigns");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 25. Алгоритм
if (isset($_GET['arg']) && $_GET['arg'] === 'all_financials') {
    $stmt = $db->prepare("SELECT * FROM to_products WHERE status = 'published' AND price > 0");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 26. Расход
if (isset($_GET['arg']) && $_GET['arg'] === 'result') {
    $stmt = $db->prepare("SELECT * FROM to_settings");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 27. Вступление
if (isset($_GET['arg']) && $_GET['arg'] === 'categories_more') {
    $stmt = $db->prepare("SELECT * FROM to_categories WHERE is_active = 1 AND type = 'publication'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 28. Финальный аргумент
if (isset($_GET['arg']) && $_GET['arg'] === 'all_in_one') {
    $stmt = $db->prepare("SELECT * FROM to_publications WHERE status = 'published' AND is_featured = 1");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 29. Очистка
if (isset($_GET['arg']) && $_GET['arg'] === 'clear_notifications') {
    $stmt = $db->prepare("DELETE FROM to_notifications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 30. Повторение
if (isset($_GET['arg']) && $_GET['arg'] === 'repeat') {
    $stmt = $db->prepare("SELECT * FROM to_publications WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 31. Функция
if (isset($_GET['arg']) && $_GET['arg'] === 'func') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 32. Операция
if (isset($_GET['arg']) && $_GET['arg'] === 'operation') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 33. Конец
if (isset($_GET['arg']) && $_GET['arg'] === 'end') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 34. Дискриптор
if (isset($_GET['arg']) && $_GET['arg'] === 'descriptor') {
    $stmt = $db->prepare("SELECT * FROM to_communities");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 35. Внешний канал
if (isset($_GET['arg']) && $_GET['arg'] === 'channel') {
    $stmt = $db->prepare("SELECT * FROM to_media");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 36. Сколько
if (isset($_GET['arg']) && $_GET['arg'] === 'how_many') {
    $stmt = $db->prepare("SELECT * FROM to_publications WHERE status = 'published' AND views > 1000");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 37. Возврат
if (isset($_GET['arg']) && $_GET['arg'] === 'back') {
    $stmt = $db->prepare("SELECT * FROM to_notifications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 38. Окно
if (isset($_GET['arg']) && $_GET['arg'] === 'window') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 39. Платеж
if (isset($_GET['arg']) && $_GET['arg'] === 'pay') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 40. Чтение
if (isset($_GET['arg']) && $_GET['arg'] === 'read') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 41. Терминал
if (isset($_GET['arg']) && $_GET['arg'] === 'terminal') {
    $stmt = $db->prepare("SELECT * FROM to_communities");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 42. Витрина
if (isset($_GET['arg']) && $_GET['arg'] === 'showcase') {
    $stmt = $db->prepare("SELECT * FROM to_products WHERE status = 'published' AND favorites > 0");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 43. Выставка
if (isset($_GET['arg']) && $_GET['arg'] === 'exhibit') {
    $stmt = $db->prepare("SELECT * FROM to_services WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 44. Речь
if (isset($_GET['arg']) && $_GET['arg'] === 'speech') {
    $stmt = $db->prepare("SELECT * FROM to_notifications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 45. Точка
if (isset($_GET['arg']) && $_GET['arg'] === 'point') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 46. Вербальная
if (isset($_GET['arg']) && $_GET['arg'] === 'verbal') {
    $stmt = $db->prepare("SELECT * FROM to_communities");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 47. Экономика
if (isset($_GET['arg']) && $_GET['arg'] === 'economy') {
    $stmt = $db->prepare("SELECT * FROM to_ad_campaigns");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 48. Заседание
if (isset($_GET['arg']) && $_GET['arg'] === 'meeting') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 49. Конец
if (isset($_GET['arg']) && $_GET['arg'] === 'end_of_days') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 50. Замок
if (isset($_GET['arg']) && $_GET['arg'] === 'castle') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 51. Душа
if (isset($_GET['arg']) && $_GET['arg'] === 'soul') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 52. Ядро
if (isset($_GET['arg']) && $_GET['arg'] === 'core') {
    $stmt = $db->prepare("SELECT * FROM to_notifications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 53. Закон
if (isset($_GET['arg']) && $_GET['arg'] === 'law') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 54. Весы
if (isset($_GET['arg']) && $_GET['arg'] === 'scale') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 55. Готово
if (isset($_GET['arg']) && $_GET['arg'] === 'done') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 56. Конфигурация
if (isset($_GET['arg']) && $_GET['arg'] === 'configuration') {
    $stmt = $db->prepare("SELECT * FROM to_settings");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 57. Потенциал
if (isset($_GET['arg']) && $_GET['arg'] === 'potential') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 58. Конечная точка
if (isset($_GET['arg']) && $_GET['arg'] === 'end_point') {
    $stmt = $db->prepare("SELECT * FROM to_communities");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 59. Библиотека
if (isset($_GET['arg']) && $_GET['arg'] === 'library') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 60. Прогресс
if (isset($_GET['arg']) && $_GET['arg'] === 'progress') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 61. География
if (isset($_GET['arg']) && $_GET['arg'] === 'geography') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 62. Публикация
if (isset($_GET['arg']) && $_GET['arg'] === 'publication') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 63. Заключение
if (isset($_GET['arg']) && $_GET['arg'] === 'conclusion') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 64. Наблюдение
if (isset($_GET['arg']) && $_GET['arg'] === 'observation') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 65. Расширение
if (isset($_GET['arg']) && $_GET['arg'] === 'extension') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 66. Возврат денег
if (isset($_GET['arg']) && $_GET['arg'] === 'return_money') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 67. Действие
if (isset($_GET['arg']) && $_GET['arg'] === 'action') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 68. Обзор
if (isset($_GET['arg']) && $_GET['arg'] === 'review') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 69. Эконом
if (isset($_GET['arg']) && $_GET['arg'] === 'economic') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 70. Информация
if (isset($_GET['arg']) && $_GET['arg'] === 'information') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 71. Политика
if (isset($_GET['arg']) && $_GET['arg'] === 'policy') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 72. Материал
if (isset($_GET['arg']) && $_GET['arg'] === 'material') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 73. Действия
if (isset($_GET['arg']) && $_GET['arg'] === 'actions') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 74. Оценка
if (isset($_GET['arg']) && $_GET['arg'] === 'evaluation') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 75. Система
if (isset($_GET['arg']) && $_GET['arg'] === 'system') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 76. Тема
if (isset($_GET['arg']) && $_GET['arg'] === 'theme') {
    $stmt = $db->prepare("SELECT * FROM to_settings");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 77. Место
if (isset($_GET['arg']) && $_GET['arg'] === 'place') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 78. Цепочка
if (isset($_GET['arg']) && $_GET['arg'] === 'chain') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 79. Звено
if (isset($_GET['arg']) && $_GET['arg'] === 'link') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 80. Личный
if (isset($_GET['arg']) && $_GET['arg'] === 'personal') {
    $stmt = $db->prepare("SELECT * FROM to_notifications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 81. Заметка
if (isset($_GET['arg']) && $_GET['arg'] === 'note') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 82. День
if (isset($_GET['arg']) && $_GET['arg'] === 'day') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 83. Зона
if (isset($_GET['arg']) && $_GET['arg'] === 'zone') {
    $stmt = $db->prepare("SELECT * FROM to_categories");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 84. Другой
if (isset($_GET['arg']) && $_GET['arg'] === 'other') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 85. Открытие
if (isset($_GET['arg']) && $_GET['arg'] === 'opening') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 86. Метод
if (isset($_GET['arg']) && $_GET['arg'] === 'method') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 87. Золото
if (isset($_GET['arg']) && $_GET['arg'] === 'gold') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 88. Выбор
if (isset($_GET['arg']) && $_GET['arg'] === 'choice') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 89. Модель
if (isset($_GET['arg']) && $_GET['arg'] === 'model') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 90. Анализ
if (isset($_GET['arg']) && $_GET['arg'] === 'analysis') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 91. Портал
if (isset($_GET['arg']) && $_GET['arg'] === 'portal') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 92. Служба
if (isset($_GET['arg']) && $_GET['arg'] === 'service') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 93. Финальный
if (isset($_GET['arg']) && $_GET['arg'] === 'final') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 94. Смотреть
if (isset($_GET['arg']) && $_GET['arg'] === 'watch') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 95. Читать
if (isset($_GET['arg']) && $_GET['arg'] === 'read_more') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 96. Легенда
if (isset($_GET['arg']) && $_GET['arg'] === 'legend') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 97. Мета
if (isset($_GET['arg']) && $_GET['arg'] === 'meta') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 98. Правда
if (isset($_GET['arg']) && $_GET['arg'] === 'truth') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 99. Центр
if (isset($_GET['arg']) && $_GET['arg'] === 'center') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 100. Доллар
if (isset($_GET['arg']) && $_GET['arg'] === 'dollar') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 101. Ресурс
if (isset($_GET['arg']) && $_GET['arg'] === 'resource') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 102. Оборот
if (isset($_GET['arg']) && $_GET['arg'] === 'turnover') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 103. Число
if (isset($_GET['arg']) && $_GET['arg'] === 'number') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 104. Граница
if (isset($_GET['arg']) && $_GET['arg'] === 'border') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 105. Вывод
if (isset($_GET['arg']) && $_GET['arg'] === 'output') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 106. Работа
if (isset($_GET['arg']) && $_GET['arg'] === 'work') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 107. Жизнь
if (isset($_GET['arg']) && $_GET['arg'] === 'life') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 108. Право
if (isset($_GET['arg']) && $_GET['arg'] === 'right') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 109. Дом
if (isset($_GET['arg']) && $_GET['arg'] === 'home') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 110. Итог
if (isset($_GET['arg']) && $_GET['arg'] === 'total') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 111. Промежуток
if (isset($_GET['arg']) && $_GET['arg'] === 'gap') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 112. Адрес
if (isset($_GET['arg']) && $_GET['arg'] === 'address') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 113. Задача
if (isset($_GET['arg']) && $_GET['arg'] === 'task') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 114. Срок
if (isset($_GET['arg']) && $_GET['arg'] === 'term') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 115. Сессия
if (isset($_GET['arg']) && $_GET['arg'] === 'session') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 116. Долг
if (isset($_GET['arg']) && $_GET['arg'] === 'debt') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 117. Люди
if (isset($_GET['arg']) && $_GET['arg'] === 'people') {
    $stmt = $db->prepare("SELECT * FROM to_participants");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 118. Приказ
if (isset($_GET['arg']) && $_GET['arg'] === 'order') {
    $stmt = $db->prepare("SELECT * FROM to_products");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 119. Канал
if (isset($_GET['arg']) && $_GET['arg'] === 'channel_v') {
    $stmt = $db->prepare("SELECT * FROM to_media");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 120. Просмотр
if (isset($_GET['arg']) && $_GET['arg'] === 'view') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 121. Продолжение
if (isset($_GET['arg']) && $_GET['arg'] === 'continuation') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 122. Функция по имени
if (isset($_GET['arg']) && $_GET['arg'] === 'func_name') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 123. Преимущество
if (isset($_GET['arg']) && $_GET['arg'] === 'advantage') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 124. Проблема
if (isset($_GET['arg']) && $_GET['arg'] === 'problem') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 125. Душа
if (isset($_GET['arg']) && $_GET['arg'] === 'spirit') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 126. Механизм
if (isset($_GET['arg']) && $_GET['arg'] === 'mechanism') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 127. Идея
if (isset($_GET['arg']) && $_GET['arg'] === 'idea') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 128. Режим
if (isset($_GET['arg']) && $_GET['arg'] === 'mode') {
    $stmt = $db->prepare("SELECT * FROM to_services");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 129. Образ
if (isset($_GET['arg']) && $_GET['arg'] === 'image') {
    $stmt = $db->prepare("SELECT * FROM to_media");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 130. Причина
if (isset($_GET['arg']) && $_GET['arg'] === 'cause') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 131. Точка входа
if (isset($_GET['arg']) && $_GET['arg'] === 'entry') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute
