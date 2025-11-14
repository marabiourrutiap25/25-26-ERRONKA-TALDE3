<?php
require_once __DIR__ . '/../model/Kategoria.php';
require_once __DIR__ . '/ErabiltzaileaService.php';

class KategoriaService
{
    private $conn;
    private $table_name = "kategoria";
    private $erabiltzaileaService;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->erabiltzaileaService = new ErabiltzaileaService($db);
    }

    // Validar API key usando ErabiltzaileaService
    private function validateApiKey($api_key)
    {
        $user = $this->erabiltzaileaService->select_ApiKey($api_key);
        if (!$user) {
            return false;
        }
        return $user;
    }

    // Obtener todas las categorías
    public function getAllKategoriak($api_key)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT id, izena FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = new Kategoria($row);
        }

        return ["success" => true, "count" => count($items), "kategoriak" => $items];
    }

    // Obtener categoría por ID
    public function getById($api_key, $id)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT id, izena FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return ["success" => true, "kategoria" => new Kategoria($row)];
        }

        return ["success" => false, "message" => "Kategoria ez da aurkitu."];
    }

    // Crear nueva categoría
    public function createKategoria($api_key, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->izena) || trim($data->izena) === '') {
            return ["success" => false, "message" => "Izena beharrezkoa da."];
        }

        // Comprobar si ya existe una categoría con ese nombre
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE izena = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $data->izena);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Kategoria hau existitzen da."];
        }

        // Obtener el siguiente ID disponible
        $maxIdQuery = "SELECT MAX(id) as max_id FROM " . $this->table_name;
        $result = $this->conn->query($maxIdQuery);
        $row = $result->fetch_assoc();
        $nextId = ($row['max_id'] ?? 0) + 1;

        $query = "INSERT INTO " . $this->table_name . " (id, izena) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("is", $nextId, $data->izena);
        if ($stmt->execute()) {
            return ["success" => true, "message" => "Kategoria sortu da.", "id" => $nextId];
        }

        return ["success" => false, "message" => "Errorea kategoria sortzean."];
    }

    // Actualizar categoría
    public function updateKategoria($api_key, $id, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->izena) || trim($data->izena) === '') {
            return ["success" => false, "message" => "Izena beharrezkoa da."];
        }

        // Comprobar si existe la categoría
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Kategoria ez da existitzen."];
        }

        // Comprobar si ya existe otra categoría con ese nombre
        $checkNameQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE izena = ? AND id != ?";
        $stmt = $this->conn->prepare($checkNameQuery);
        $stmt->bind_param("si", $data->izena, $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Beste kategoria bat existitzen da izen horrekin."];
        }

        $query = "UPDATE " . $this->table_name . " SET izena = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("si", $data->izena, $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Kategoria eguneratu da."];
            }
            return ["success" => false, "message" => "Ez da aldaketarik egin."];
        }

        return ["success" => false, "message" => "Errorea kategoria eguneratzean."];
    }

    // Eliminar categoría
    public function deleteKategoria($api_key, $id)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Primero verificar si existe
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Kategoria ez da existitzen."];
        }

        // Comprobar dependencias en ekipamendua
        $dependencyQuery = "SELECT COUNT(*) as total FROM ekipamendua WHERE idKategoria = ?";
        $dependencyStmt = $this->conn->prepare($dependencyQuery);
        if ($dependencyStmt) {
            $dependencyStmt->bind_param("i", $id);
            $dependencyStmt->execute();
            $dependencyResult = $dependencyStmt->get_result();
            $dependencyRow = $dependencyResult->fetch_assoc();
            if (!empty($dependencyRow['total']) && intval($dependencyRow['total']) > 0) {
                return ["success" => false, "message" => "Ezin da ezabatu: kategoria honek ekipamenduak lotuta ditu."];
            }
        } else {
            return ["success" => false, "message" => "Errorea mendekotasunak egiaztatzean."];
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Kategoria ezabatu da."];
            }
            return ["success" => false, "message" => "Ezin izan da kategoria ezabatu."];
        }

        return ["success" => false, "message" => "Errorea kategoria ezabatzean."];
    }
}
?>
