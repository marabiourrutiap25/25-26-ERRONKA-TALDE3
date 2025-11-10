<?php
require_once __DIR__ . '/../model/Ekipamendua.php';
require_once __DIR__ . '/ErabiltzaileaService.php';
require_once __DIR__ . '/KategoriaService.php';

class EkipamenduaService
{
    private $conn;
    private $table_name = "ekipamendua";
    private $erabiltzaileaService;
    private $kategoriaService;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->erabiltzaileaService = new ErabiltzaileaService($db);
        $this->kategoriaService = new KategoriaService($db);
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

    // Validar que existe la categoría
    private function validateKategoria($idKategoria)
    {
        $query = "SELECT COUNT(*) as total FROM kategoria WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $idKategoria);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row['total'] > 0;
    }

    // Obtener siguiente ID disponible
    private function getNextId()
    {
        $maxIdQuery = "SELECT MAX(id) as max_id FROM " . $this->table_name;
        $result = $this->conn->query($maxIdQuery);
        $row = $result->fetch_assoc();
        return ($row['max_id'] ?? 0) + 1;
    }

    // Obtener todos los equipamientos
    public function getAllEkipamenduak($api_key)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT e.*, k.izena as kategoria_izena 
                 FROM " . $this->table_name . " e 
                 LEFT JOIN kategoria k ON e.idKategoria = k.id";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = new Ekipamendua($row);
        }

        return ["success" => true, "count" => count($items), "ekipamenduak" => $items];
    }

    // Obtener equipamiento por ID
    public function getById($api_key, $id)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT e.*, k.izena as kategoria_izena 
                 FROM " . $this->table_name . " e 
                 LEFT JOIN kategoria k ON e.idKategoria = k.id 
                 WHERE e.id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return ["success" => true, "ekipamendua" => new Ekipamendua($row)];
        }

        return ["success" => false, "message" => "Ekipamendua ez da aurkitu."];
    }

    // Crear nuevo equipamiento
    public function createEkipamendua($api_key, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Validar campos requeridos
        if (!isset($data->izena) || !isset($data->deskribapena) || !isset($data->stock) || !isset($data->idKategoria)) {
            return ["success" => false, "message" => "Derrigorrezko eremuak falta dira."];
        }

        // Validar que existe la categoría
        if (!$this->validateKategoria($data->idKategoria)) {
            return ["success" => false, "message" => "Kategoria ez da existitzen."];
        }

        // Obtener siguiente ID
        $nextId = $this->getNextId();

        $query = "INSERT INTO " . $this->table_name . " 
                 (id, izena, deskribapena, marka, modelo, stock, idKategoria) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $marka = $data->marka ?? null;
        $modelo = $data->modelo ?? null;

        $stmt->bind_param("isssiii", 
            $nextId,
            $data->izena,
            $data->deskribapena,
            $marka,
            $modelo,
            $data->stock,
            $data->idKategoria
        );

        if ($stmt->execute()) {
            return ["success" => true, 
                    "message" => "Ekipamendua sortu da.",
                    "id" => $nextId];
        }

        return ["success" => false, "message" => "Errorea ekipamendua sortzean."];
    }

    // Actualizar equipamiento
    public function updateEkipamendua($api_key, $id, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Verificar que existe
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Ekipamendua ez da existitzen."];
        }

        // Si se actualiza la categoría, validar que existe
        if (isset($data->idKategoria) && !$this->validateKategoria($data->idKategoria)) {
            return ["success" => false, "message" => "Kategoria ez da existitzen."];
        }

        $fields = [];
        $types = '';
        $values = [];

        if (isset($data->izena)) {
            $fields[] = "izena = ?";
            $types .= 's';
            $values[] = $data->izena;
        }
        if (isset($data->deskribapena)) {
            $fields[] = "deskribapena = ?";
            $types .= 's';
            $values[] = $data->deskribapena;
        }
        if (isset($data->marka)) {
            $fields[] = "marka = ?";
            $types .= 's';
            $values[] = $data->marka;
        }
        if (isset($data->modelo)) {
            $fields[] = "modelo = ?";
            $types .= 's';
            $values[] = $data->modelo;
        }
        if (isset($data->stock)) {
            $fields[] = "stock = ?";
            $types .= 'i';
            $values[] = $data->stock;
        }
        if (isset($data->idKategoria)) {
            $fields[] = "idKategoria = ?";
            $types .= 'i';
            $values[] = $data->idKategoria;
        }

        if (count($fields) === 0) {
            return ["success" => false, "message" => "Ez dira eguneratzeko datuak bidali."];
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        // Añadir el id al final de los parámetros
        $types .= 'i';
        $values[] = $id;

        // bind_param requiere referencias
        $bind_names[] = $types;
        for ($i = 0; $i < count($values); $i++) {
            $bind_name = 'bind' . $i;
            $$bind_name = $values[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array([$stmt, 'bind_param'], $bind_names);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Ekipamendua eguneratu da."];
            }
            return ["success" => false, "message" => "Ez da aldaketarik egin."];
        }

        return ["success" => false, "message" => "Errorea ekipamendua eguneratzean."];
    }

    // Eliminar equipamiento
    public function deleteEkipamendua($api_key, $id)
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
            return ["success" => false, "message" => "Ekipamendua ez da existitzen."];
        }

        // Verificar si hay registros relacionados en inbentarioa
        $checkInbQuery = "SELECT COUNT(*) as total FROM inbentarioa WHERE idEkipamendu = ?";
        $stmt = $this->conn->prepare($checkInbQuery);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Ezin da ezabatu: inbentarioan erregistroak ditu."];
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Ekipamendua ezabatu da."];
            }
            return ["success" => false, "message" => "Ezin izan da ekipamendua ezabatu."];
        }

        return ["success" => false, "message" => "Errorea ekipamendua ezabatzean."];
    }
}
?>