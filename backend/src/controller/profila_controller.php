<?php
    require("../model/Erabiltzailea.php");
    require("../service/ErabiltzaileaService.php");

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if($_SERVER["REQUEST_METHOD"]=="PUT"){
        
        $izena=$data["izena"] ?? null;
        $abizena=$data["abizena"] ?? null;
        $erabiltzailea=$data["erabiltzailea"] ?? null;
        $pasahitza=$data["pasahitza"] ?? null;

        $pasahitza_hash=password_hash($pasahitza, PASSWORD_BCRYPT);
        
        
        $user= new Erabiltzailea([
            "izena"=>$izena, 
            "abizena"=>$abizena,
            "erabiltzailea"=>$erabiltzailea]);

        



        http_response_code(200);
        echo json_encode([
            "message" => $pasahitza_hash
        ]);
    }




?>