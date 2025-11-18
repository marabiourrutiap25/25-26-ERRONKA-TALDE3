<?php
/**
 * Controlador de inventario. Ofrece endpoints CRUD para inbentarioak y
 * protege cada operación con una API key en la cabecera Authorization.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/InbentarioaService.php';

$dbObj = new DB();
$conn = $dbObj->konektatu();
$service = new InbentarioaService($conn);

$action = $_GET['action'] ?? null;

// Extraer API key desde header Authorization: Bearer <key>
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

// GET -> obtener todos los inventarios
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getAll') {
    $api_key = getApiKeyFromHeaders();
    if (!$api_key) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Authorization header falta da."]);
        exit;
    }
    $resultado = $service->getAllInbentarioak($api_key);
    echo json_encode($resultado);
    exit;
}

// GET -> obtener inventario por etiqueta
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getByEtiketa') {
    $api_key = getApiKeyFromHeaders();
    $etiketa = $_GET['etiketa'] ?? null;
    if (!$api_key || !$etiketa) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo etiketa)."]);
        exit;
    }
    $resultado = $service->getByEtiketa($api_key, $etiketa);
    echo json_encode($resultado);
    exit;
}

// POST -> crear inventario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $api_key = getApiKeyFromHeaders();
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo JSON gorputza)."]);
        exit;
    }
    $resultado = $service->createInbentarioa($api_key, $data);
    echo json_encode($resultado);
    exit;
}

// POST -> actualizar inventario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    $api_key = getApiKeyFromHeaders();
    $etiketa = $_GET['etiketa'] ?? null;
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$etiketa || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization, etiketa edo JSON gorputza)."]);
        exit;
    }
    $resultado = $service->updateInbentarioa($api_key, $etiketa, $data);
    echo json_encode($resultado);
    exit;
}

// DELETE -> eliminar inventario
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $etiketa = $_GET['etiketa'] ?? null;
    if (!$api_key || !$etiketa) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo etiketa)."]);
        exit;
    }
    $resultado = $service->deleteInbentarioa($api_key, $etiketa);
    echo json_encode($resultado);
    exit;
}

// POST -> eliminar inventario (compatibilidad)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $etiketa = $_GET['etiketa'] ?? null;
    if (!$api_key || !$etiketa) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization edo etiketa)."]);
        exit;
    }
    $resultado = $service->deleteInbentarioa($api_key, $etiketa);
    echo json_encode($resultado);
    exit;
}

http_response_code(404);
echo json_encode(["success" => false, "message" => "Ekintza ez da aurkitu."]);
?>