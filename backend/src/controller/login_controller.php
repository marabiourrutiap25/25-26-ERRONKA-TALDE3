<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../../config/DB.php';
require_once __DIR__ . '/../service/ErabiltzaileaService.php';

$dbObj = new DB();
$conn = $dbObj->konektatu();

$service = new ErabiltzaileaService($conn);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->erabiltzailea) && !empty($data->pasahitza)) {
    $user = $service->logina_kontsultatu($data->erabiltzailea, $data->pasahitza);

    if ($user) {
        echo json_encode([
            "success" => true,
            "message" => "Saioa hasita!",
            "user" => [
                "nan" => $user->nan,
                "izena" => $user->izena,
                "abizena" => $user->abizena,
                "rola" => $user->rola,
                "api_key" => $user->api_key
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Erabiltzailea edo pasahitza okerra da."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datuak falta dira."]);
}
?>