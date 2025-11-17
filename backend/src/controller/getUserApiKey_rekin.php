<?php
/**
 * Endpoint auxiliar para recuperar los datos del usuario a partir de una API key.
 * Se admite tanto query param como cuerpo JSON para mayor flexibilidad.
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/ErabiltzaileaService.php';

$dbObj = new DB();
$conn = $dbObj->konektatu();

$service = new ErabiltzaileaService($conn);

$data = json_decode(file_get_contents("php://input"));
$api_key = $_GET['api_key'] ?? ($data->api_key ?? null);

if (!empty($api_key)) {
    $user = $service->select_ApiKey($api_key);

    if ($user) {
        echo json_encode([
            "success" => true,
            "user" => [
                "nan" => $user->nan,
                "izena" => $user->izena,
                "abizena" => $user->abizena,
                "erabiltzailea" => $user->erabiltzailea,
                "rola" => $user->rola,
                "api_key" => $user->api_key
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "API key ez da aurkitu."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "API key falta da."]);
}
?>
