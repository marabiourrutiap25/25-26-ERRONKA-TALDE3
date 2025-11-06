<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/ErabiltzaileaService.php';

$dbObj = new DB();
$conn = $dbObj->konektatu();
$service = new ErabiltzaileaService($conn);

$action = $_GET['action'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'aldatuIzena') {

    $headers = getallheaders();
    $api_key = null;
    if (isset($headers['Authorization'])) {
        $authHeader = trim($headers['Authorization']);
        if (stripos($authHeader, 'Bearer ') === 0) {
            $api_key = trim(substr($authHeader, 7));
        }
    }

    $data = json_decode(file_get_contents("php://input"));
    $izena_berria = $data->izena ?? null;

    if (!$api_key || !$izena_berria) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan parámetros (Authorization o izena)."]);
        exit;
    }

    $resultado = $service->aldatuIzena($api_key, $izena_berria);
    echo json_encode($resultado);

} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Ekintza ez da aurkitu."]);
}
?>