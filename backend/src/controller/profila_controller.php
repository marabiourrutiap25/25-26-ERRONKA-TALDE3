<?php
    require("../model/profila.php");

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);


    if($_SERVER["REQUEST_METHOD"]=="PUT"){
        
        $nombre=$data["izena"] ?? null;
        http_response_code(200);
        echo json_encode([
            "message" => $nombre
        ]);
    }




?>