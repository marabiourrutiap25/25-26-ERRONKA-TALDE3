<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/GelaService.php';

$dbObj = new DB();
$conn = $dbObj->konektatu();
$service = new GelaService($conn);

$action = $_GET['action'] ?? null;

function getApiKeyFromHeaders()
{
    $headers = getallheaders();
    $api_key = null;
    if (isset($headers['Authorization'])) {
        $authHeader = trim($headers['Authorization']);
        if (stripos($authHeader, 'Bearer ') === 0) {
            $api_key = trim(substr($authHeader, 7));
        }
    }
    return $api_key;
}

// GET -> obtener todas las gelak
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getAll') {
    $api_key = getApiKeyFromHeaders();
    if (!$api_key) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Authorization header falta da."]);
        exit;
    }
    $resultado = $service->getAllGelak($api_key);
    echo json_encode($resultado);
    exit;
}

// GET -> obtener gela por id
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getById') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$api_key || !$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo id)."]);
        exit;
    }
    $resultado = $service->getById($api_key, $id);
    echo json_encode($resultado);
    exit;
}

// POST -> crear gela
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $api_key = getApiKeyFromHeaders();
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo JSON gorputza)."]);
        exit;
    }
    $resultado = $service->createGela($api_key, $data);
    echo json_encode($resultado);
    exit;
}

// POST -> actualizar gela
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$id || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization, id edo JSON gorputza)."]);
        exit;
    }
    $resultado = $service->updateGela($api_key, $id, $data);
    echo json_encode($resultado);
    exit;
}

// DELETE -> eliminar gela
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$api_key || !$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo id)."]);
        exit;
    }
    $resultado = $service->deleteGela($api_key, $id);
    if (!$resultado['success']) {
        http_response_code(409);
    }
    echo json_encode($resultado);
    exit;
}

// POST -> eliminar gela (compatibilidad)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$api_key || !$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo id)."]);
        exit;
    }
    $resultado = $service->deleteGela($api_key, $id);
    echo json_encode($resultado);
    exit;
}

http_response_code(404);
echo json_encode(["success" => false, "message" => "Ekintza ez da aurkitu."]);
?>
