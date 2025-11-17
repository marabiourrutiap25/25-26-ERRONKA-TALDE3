<?php
require_once __DIR__ . '/../model/Kokalekua.php';
require_once __DIR__ . '/ErabiltzaileaService.php';
require_once __DIR__ . '/InbentarioaService.php';
require_once __DIR__ . '/GelaService.php';

/**
 * Servicio de negocio para las ubicaciones de cada equipo.
 */
class KokalekuaService
{
    private $conn;
    private $table_name = "kokalekua";
    private $erabiltzaileaService;
    private $inbentarioaService;
    private $gelaService;

    /**
     * Inyecta la conexión común y servicios auxiliares para validaciones.
     */
    public function __construct($db)
    {
        $this->conn = $db;
        $this->erabiltzaileaService = new ErabiltzaileaService($db);
        $this->inbentarioaService = new InbentarioaService($db);
        $this->gelaService = new GelaService($db);
    }

    /**
     * Comprueba que el token pertenezca a un usuario válido.
     */
    private function validateApiKey($api_key)
    {
        $user = $this->erabiltzaileaService->select_ApiKey($api_key);
        if (!$user) {
            return false;
        }
        return $user;
    }

    /**
     * Confirma la existencia previa de inventario y aula.
     */
    private function validateReferences($etiketa, $idGela)
    {
        // Validar inventario
        $query = "SELECT COUNT(*) as total FROM inbentarioa WHERE etiketa = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["valid" => false, "message" => "Inbentarioa ez da existitzen."];
        }

        // Validar gela
        $query = "SELECT COUNT(*) as total FROM gela WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $idGela);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["valid" => false, "message" => "Gela ez da existitzen."];
        }

        return ["valid" => true];
    }

    /**
     * Devuelve el histórico de ubicaciones con nombre de aula.
     */
    public function getAllKokalekuak($api_key)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT k.*, g.izena as gela_izena 
                 FROM " . $this->table_name . " k
                 JOIN gela g ON k.idGela = g.id
                 ORDER BY k.hasieraData DESC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                "kokalekua" => new Kokalekua($row),
                "gela_izena" => $row['gela_izena']
            ];
        }

        return ["success" => true, "count" => count($items), "kokalekuak" => $items];
    }

    /**
     * Lista las ubicaciones asociadas a una etiqueta concreta.
     */
    public function getByEtiketa($api_key, $etiketa)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT k.*, g.izena as gela_izena 
                 FROM " . $this->table_name . " k
                 JOIN gela g ON k.idGela = g.id
                 WHERE k.etiketa = ?
                 ORDER BY k.hasieraData DESC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                "kokalekua" => new Kokalekua($row),
                "gela_izena" => $row['gela_izena']
            ];
        }

        if (count($items) > 0) {
            return ["success" => true, "kokalekuak" => $items];
        }

        return ["success" => false, "message" => "Ez dira kokalekuak aurkitu etiketa honentzat."];
    }

    /**
     * Crea un nuevo registro de ubicación validando solapamientos.
     */
    public function createKokalekua($api_key, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->etiketa) || !isset($data->idGela) || !isset($data->hasieraData)) {
            return ["success" => false, "message" => "Derrigorrezko eremuak falta dira."];
        }

        // Validar referencias
        $validation = $this->validateReferences($data->etiketa, $data->idGela);
        if (!$validation['valid']) {
            return ["success" => false, "message" => $validation['message']];
        }

        // Verificar si hay una ubicación activa (sin fecha fin) para esta etiqueta
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " 
                      WHERE etiketa = ? AND amaieraData IS NULL";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $data->etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Ekipamendu honek badauka kokaleku aktibo bat."];
        }

        $query = "INSERT INTO " . $this->table_name . " 
                 (etiketa, idGela, hasieraData, amaieraData) 
                 VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $amaieraData = $data->amaieraData ?? null;
        $stmt->bind_param("siss", 
            $data->etiketa,
            $data->idGela,
            $data->hasieraData,
            $amaieraData
        );

        if ($stmt->execute()) {
            return ["success" => true, 
                    "message" => "Kokalekua sortu da.",
                    "etiketa" => $data->etiketa];
        }

        return ["success" => false, "message" => "Errorea kokalekua sortzean."];
    }

    /**
     * Permite modificar aula o fecha de fin de una asignación.
     */
    public function updateKokalekua($api_key, $etiketa, $hasieraData, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Verificar que existe
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " 
                      WHERE etiketa = ? AND hasieraData = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("ss", $etiketa, $hasieraData);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Kokalekua ez da existitzen."];
        }

        // Si se actualiza la gela, validar que existe
        if (isset($data->idGela)) {
            $query = "SELECT COUNT(*) as total FROM gela WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $data->idGela);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            if ($row['total'] == 0) {
                return ["success" => false, "message" => "Gela ez da existitzen."];
            }
        }

        $fields = [];
        $types = '';
        $values = [];

        if (isset($data->idGela)) {
            $fields[] = "idGela = ?";
            $types .= 'i';
            $values[] = $data->idGela;
        }
        if (isset($data->amaieraData)) {
            $fields[] = "amaieraData = ?";
            $types .= 's';
            $values[] = $data->amaieraData;
        }

        if (count($fields) === 0) {
            return ["success" => false, "message" => "Ez dira eguneratzeko datuak bidali."];
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . 
                " WHERE etiketa = ? AND hasieraData = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        // Añadir etiketa y hasieraData al final
        $types .= 'ss';
        $values[] = $etiketa;
        $values[] = $hasieraData;

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
                return ["success" => true, "message" => "Kokalekua eguneratu da."];
            }
            return ["success" => false, "message" => "Ez da aldaketarik egin."];
        }

        return ["success" => false, "message" => "Errorea kokalekua eguneratzean."];
    }

    /**
     * Elimina una asignación concreta identificada por etiqueta+inicio.
     */
    public function deleteKokalekua($api_key, $etiketa, $hasieraData)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE etiketa = ? AND hasieraData = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("ss", $etiketa, $hasieraData);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Kokalekua ezabatu da."];
            }
            return ["success" => false, "message" => "Kokalekua ez da aurkitu."];
        }

        return ["success" => false, "message" => "Errorea kokalekua ezabatzean."];
    }
}
?>