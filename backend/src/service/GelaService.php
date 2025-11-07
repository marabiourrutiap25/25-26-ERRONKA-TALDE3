<?php
require_once __DIR__ . '/../model/Gela.php';
require_once __DIR__ . '/ErabiltzaileaService.php';

class GelaService
{
    private $conn;
    private $table_name = "gela";
    private $erabiltzaileaService;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->erabiltzaileaService = new ErabiltzaileaService($db);
    }

    private function validateApiKey($api_key)
    {
        $user = $this->erabiltzaileaService->select_ApiKey($api_key);
        if (!$user) {
            return false;
        }
        return $user;
    }

    // Obtener todas las gelak
    public function getAllGelak($api_key)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT id, izena, taldea FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = new Gela($row);
        }

        return ["success" => true, "count" => count($items), "gelak" => $items];
    }

    // Obtener gela por ID
    public function getById($api_key, $id)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT id, izena, taldea FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return ["success" => true, "gela" => new Gela($row)];
        }

        return ["success" => false, "message" => "Gela ez da aurkitu."];
    }

    // Crear nueva gela
    public function createGela($api_key, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->izena) || trim($data->izena) === '') {
            return ["success" => false, "message" => "Izena beharrezkoa da."];
        }

        // Comprobar si ya existe una gela con ese nombre
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE izena = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $data->izena);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Gela hau existitzen da."];
        }

        // Obtener el siguiente ID disponible
        $maxIdQuery = "SELECT MAX(id) as max_id FROM " . $this->table_name;
        $result = $this->conn->query($maxIdQuery);
        $row = $result->fetch_assoc();
        $nextId = ($row['max_id'] ?? 0) + 1;

        $query = "INSERT INTO " . $this->table_name . " (id, izena, taldea) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $taldea = isset($data->taldea) ? $data->taldea : null;
        $stmt->bind_param("iss", $nextId, $data->izena, $taldea);
        if ($stmt->execute()) {
            return ["success" => true, "message" => "Gela sortu da.", "id" => $nextId];
        }

        return ["success" => false, "message" => "Errorea gela sortzean."];
    }

    // Actualizar gela
    public function updateGela($api_key, $id, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->izena) || trim($data->izena) === '') {
            return ["success" => false, "message" => "Izena beharrezkoa da."];
        }

        // Comprobar si existe la gela
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Gela ez da existitzen."];
        }

        // Comprobar si ya existe otra gela con ese nombre
        $checkNameQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE izena = ? AND id != ?";
        $stmt = $this->conn->prepare($checkNameQuery);
        $stmt->bind_param("si", $data->izena, $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Beste gela bat existitzen da izen horrekin."];
        }

        $query = "UPDATE " . $this->table_name . " SET izena = ?, taldea = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $taldea = isset($data->taldea) ? $data->taldea : null;
        $stmt->bind_param("ssi", $data->izena, $taldea, $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Gela eguneratu da."];
            }
            return ["success" => false, "message" => "Ez da aldaketarik egin."];
        }

        return ["success" => false, "message" => "Errorea gela eguneratzean."];
    }

    // Eliminar gela
    public function deleteGela($api_key, $id)
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
            return ["success" => false, "message" => "Gela ez da existitzen."];
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Gela ezabatu da."];
            }
            return ["success" => false, "message" => "Ezin izan da gela ezabatu."];
        }

        return ["success" => false, "message" => "Errorea gela ezabatzean."];
    }
}
?>
