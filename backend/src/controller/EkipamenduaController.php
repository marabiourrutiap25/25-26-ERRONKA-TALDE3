<?php
/**
 * Controlador procedimental que expone la API REST de Ekipamendua.
 * Todas las rutas esperan una cabecera Authorization con un token Bearer
 * y delegan la lógica de negocio en el servicio correspondiente.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/EkipamenduaService.php';

// Inicialización básica del servicio y la conexión
$dbObj = new DB();
$conn = $dbObj->konektatu();
$service = new EkipamenduaService($conn);

$action = $_GET['action'] ?? null;

/**
 * Lee la cabecera Authorization y devuelve únicamente el token Bearer.
 *
 * @return string|null API key extraída de la petición o null si no existe.
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

// GET -> obtener todos los equipamientos
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

// GET -> obtener equipamiento por id
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

// POST -> crear equipamiento
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

// POST -> actualizar equipamiento
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

// DELETE -> eliminar equipamiento
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

// POST -> eliminar equipamiento (compatibilidad)
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