<?php
    require("../models/profila.php");

    $json = file_get_contents('php://input');
    $data = json_decode($json);


    if($_SERVER["REQUEST_METHOD"]=="PUT"){
        $nombre=$data["nombre"];
        http_response_code(200);
    }




?>