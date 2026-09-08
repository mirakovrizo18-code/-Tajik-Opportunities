<?php
// =========================================================
// TAJIK OPPORTUNITIES - КОНФИГУРАЦИЯ СИСТЕМЫ
// =========================================================

// 1. Настройки сайта
define('SITE_NAME', 'Tajik Opportunities');
define('SITE_URL', 'https://your-username.github.io/');
define('ADMIN_EMAIL', 'admin@example.com');

// 2. Настройки базы данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'tajik_opportunities');
define('DB_USER', 'root');
define('DB_PASS', '');

// 3. Настройки режима
define('MODERATION_ENABLED', true); // Включена ли модерация публикаций
define('THEME', 'light'); // Тема сайта
define('MAX_UPLOAD_SIZE', 5242880); // 5 MB в байтах

// 4. Оборудование со временем
define('TIMEZONE', 'Asia/Dushanbe');
date_default_timezone_set(TIMEZONE);

// 5. Настройки логирования
define('LOG_ENABLED', true);
define('LOG_FILE', __DIR__ . '/logs/app.log');

// 6. Ключ для шифрования (генерируйте его случайно!)
define('ENCRYPTION_KEY', 'your-random-secret-key-here');

// 7. Подключение к базу данных (SQLite, так как она используется в схеме)
try {
    $db = new PDO('sqlite:' . __DIR__ . '/../database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Если база данных не подключена, выводим ошибку
    die('Ошибка подключения к базе данных: ' . $e->getMessage());
}

// 8. Оценка публикаций, чтобы веб-сайт был эффективным
function get_settings($key) {
    global $db;
    $stmt = $db->prepare("SELECT setting_value FROM to_settings WHERE setting_key = :key");
    $stmt->execute([':key' => $key]);
    return $stmt->fetchColumn();
}

// 9. Настройка ПДО по умолчанию (эффективные показатели)
$settings = [
    'site_name' => get_settings('site_name'),
    'theme' => get_settings('theme'),
    'moderation_enabled' => get_settings('moderation_enabled'),
];

// 10. Выполнение настройки сайта
if (isset($settings['site_name'])) {
    define('ACTIVE_SITE_NAME', $settings['site_name']);
} else {
    define('ACTIVE_SITE_NAME', SITE_NAME);
}

// 11. Активация использования данных
if (isset($settings['moderation_enabled'])) {
    define('ACTIVE_MODERATION', (bool)$settings['moderation_enabled']);
} else {
    define('ACTIVE_MODERATION', MODERATION_ENABLED);
}

// 12. Вызываем автоматическое подключение
if (LOG_ENABLED) {
    // Примечание: Не забывайте закрывать файл! Log записи будут использовать только PDO.
    $logFile = fopen(LOG_FILE, 'a');
    if ($logFile) {
        fwrite($logFile, '[' . date('Y-m-d H:i:s') . '] Система запущена.' . PHP_EOL);
        fclose($logFile);
    }
}

// 13. Потенциальный запрос для публикации
function get_top_publications() {
    global $db;
    $stmt = $db->prepare("SELECT * FROM to_publications WHERE status = 'published' AND views > 100 ORDER BY views DESC LIMIT 10");
    $stmt->execute();
    return $stmt->fetchAll();
}

// 14. Проверка доступности сессии
if (!isset($_SESSION)) {
    session_start();
}

// 15. Тестовая доступность (sanity check)
if (!file_exists(__DIR__ . '/../database.sqlite')) {
    echo "База данных не найден! Проверьте файл database.sqlite.";
}
?>
