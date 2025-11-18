<?php
/**
 * `Erabiltzaileak` kontroladorea.
 * Frontend-etik exekutatzen diren CRUD eragiketak kudeatzen ditu.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/ErabiltzaileaService.php';

// Zerbitzua konekzio partekatuarekin instantziatzen da
$dbObj = new DB();
$conn = $dbObj->konektatu();
$service = new ErabiltzaileaService($conn);

$action = $_GET['action'] ?? null;

/**
 * Authorization headerr-etik ateratako API key-a bueltatzen du.
 *
 * @return string|null
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

// GET -> guztiak lortu
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getAll') {
    $api_key = getApiKeyFromHeaders();
    if (!$api_key) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Authorization header falta."]);
        exit;
    }
    $resultado = $service->getAllErabiltzaileak($api_key);
    echo json_encode($resultado);
    exit;
}

// GET -> api_key-arekin lortu
if($_SERVER['REQUEST_METHOD']=== 'GET' && $action==='getByApi'){
    $api_key = getApiKeyFromHeaders();
    if (!$api_key) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No estas autorizado."]);
        exit;
    }
    $resultado=$service->getByApiKey($api_key);
    echo json_encode($resultado);
    exit;
}

// GET -> nan bidez lortu
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getById') {
    $api_key = getApiKeyFromHeaders();
    $nan = $_GET['nan'] ?? null;
    if (!$api_key || !$nan) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization o nan)."]);
        exit;
    }
    $resultado = $service->getByNan($api_key, $nan);
    echo json_encode($resultado);
    exit;
}

// POST -> erabiltzailea sortu (action=create)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $api_key = getApiKeyFromHeaders();
    $data = json_decode(file_get_contents("php://input"));
    if (!$api_key || !$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization o cuerpo JSON)."]);
        exit;
    }
    $resultado = $service->createErabiltzailea($api_key, $data);
    echo json_encode($resultado);
    exit;
}

// POST -> erabiltzailea eguneratu (action=update) - nan gehienetan query param bidez pasatu
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    $api_key = getApiKeyFromHeaders();
    $data = json_decode(file_get_contents("php://input"));
    $nan = $_GET['nan'] ?? null; // preferir query param
    if(!$nan){
        $nan=$data->nan;
    }
    if (!$api_key || !$data || !$nan) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization, nan en query o cuerpo JSON)."]);
        exit;
    }
    $resultado = $service->updateErabiltzailea($api_key, $data, $nan);
    echo json_encode($resultado);
    exit;
}

// DELETE -> erabiltzailea nan-aren bidez ezabatu (action=delete) (nan query param-ean)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $nan = $_GET['nan'] ?? null;
    if (!$api_key || !$nan) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization o nan en query)."]);
        exit;
    }
    $resultado = $service->deleteByNan($api_key, $nan);
    echo json_encode($resultado);
    exit;
}

// Kompatibilitateagatik, onartu POST delete nan-a query-n edukita ere
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $api_key = getApiKeyFromHeaders();
    $nan = $_GET['nan'] ?? null;
    if (!$api_key || !$nan) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization o nan en query)."]);
        exit;
    }
    $resultado = $service->deleteByNan($api_key, $nan);
    echo json_encode($resultado);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getRole') {
    $api_key = getApiKeyFromHeaders();
    if (!$api_key) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Authorization header falta."]);
        exit;
    }
    $resultado = $service->getRoleByApiKey($api_key);
    echo json_encode($resultado);
    exit;
}


http_response_code(404);
echo json_encode(["success" => false, "message" => "Ekintza ez da aurkitu."]);
?>