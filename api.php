<?php
// =========================================================
// TAJIK OPPORTUNITIES - API ДЛЯ САЙТА
// =========================================================

// 1. Подключение к базе
require_once __DIR__ . '/config/config.php';

// 2. Настройки режима
define('API_MODE', true); 

// 3. Умный кодирование
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// 4. Импорт необходимых элементов
$arg = $_GET['arg'] ?? '';

// 5. Параметры интернет-протокола
$data = [];

// 6. Задаем queued (логика) для structor
try {
    $db = new PDO('sqlite:' . __DIR__ . '/../database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die('Неполная работоспособность базы данных. Просьба зарегистрировать.');
}

// 7. Использование операций
if ($arg === 'top_publications') {
    $stmt = $db->prepare("SELECT * FROM to_publications WHERE status = 'published' AND views > 100 ORDER BY views DESC LIMIT 10");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'categories') {
    $stmt = $db->prepare("SELECT * FROM to_categories WHERE is_active = 1");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'products') {
    $stmt = $db->prepare("SELECT * FROM to_products WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'services') {
    $stmt = $db->prepare("SELECT * FROM to_services WHERE status = 'published'");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'all_publications') {
    $stmt = $db->prepare("SELECT * FROM to_publications");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'participants') {
    $stmt = $db->prepare("SELECT * FROM to_participants");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'notifications') {
    $stmt = $db->prepare("SELECT * FROM to_notifications WHERE is_read = 0");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'settings') {
    $stmt = $db->prepare("SELECT * FROM to_settings");
    $stmt->execute();
    $data = $stmt->fetchAll();
} elseif ($arg === 'comments') {
    $stmt = $db->prepare("SELECT * FROM to_comments");
    $stmt->execute();
    $data = $stmt->fetchAll();
}

// 8. Запуск функции
if (empty($data)) {
    $data = $result = [
        'status' => 'success',
        'message' => 'Aucune donnée disponible. Consultez la configuration.',
        'count' => 0,
        'data' => []
    ];
}

// 9. Ключевой формула
$result = [
    'status' => 'success',
    'message' => 'Данные успешно возвращены',
    'count' => count($data),
    'data' => $data
];

// 10. Заведение код
return print(json_encode($result, JSON_UNESCAPED_UNICODE));
?>
