<?php
/**
 * Ekipamendua API REST exposatzen duen prozedurazko kontroladorea.
 * Bide guztiek Authorization header-a Bearer token batekin espero dute
 * eta negozio logika dagokion zerbitzuari delegatzen zaio.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/EkipamenduaService.php';

// Zerbitzuaren eta konexioaren hasieratze oinarrizkoa
$dbObj = new DB();
$conn = $dbObj->konektatu();
$service = new EkipamenduaService($conn);

$action = $_GET['action'] ?? null;

/**
 * Authorization header-a irakurtzen du eta Bearer token-a itzultzen du soilik.
 *
 * @return string|null Eskaeratik lortutako API key-a edo null ez bada existitzen.
 */
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

// GET -> ekipamendu guztiak lortu
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getAll') {
    $api_key = getApiKeyFromHeaders();
    if (!$api_key) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Authorization header falta da."]);
        exit;
    }
    $resultado = $service->getAllEkipamenduak($api_key);
    echo json_encode($resultado);
    exit;
}

// GET -> ekipamendua id bidez lortu
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

// POST -> ekipamendua sortu
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $api_key = getApiKeyFromHeaders();
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo JSON gorputza)."]);
        exit;
    }
    $resultado = $service->createEkipamendua($api_key, $data);
    echo json_encode($resultado);
    exit;
}

// POST -> ekipamendua eguneratu
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$id || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization, id edo JSON gorputza)."]);
        exit;
    }
    $resultado = $service->updateEkipamendua($api_key, $id, $data);
    echo json_encode($resultado);
    exit;
}

// DELETE -> ekipamendua ezabatu
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$api_key || !$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo id)."]);
        exit;
    }
    $resultado = $service->deleteEkipamendua($api_key, $id);
    echo json_encode($resultado);
    exit;
}

// POST -> ekipamendua ezabatu (kompatibilitatea)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$api_key || !$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo id)."]);
        exit;
    }
    $resultado = $service->deleteEkipamendua($api_key, $id);
    echo json_encode($resultado);
    exit;
}

http_response_code(404);
echo json_encode(["success" => false, "message" => "Ekintza ez da aurkitu."]);
?>