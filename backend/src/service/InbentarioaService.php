<?php
require_once __DIR__ . '/../model/Inbentarioa.php';
require_once __DIR__ . '/ErabiltzaileaService.php';
require_once __DIR__ . '/EkipamenduaService.php';

/**
 * Servicio dedicado a la tabla `inbentarioa`, con validaciones cruzadas
 * contra usuarios, equipamientos y ubicaciones.
 */
class InbentarioaService
{
    private $conn;
    private $table_name = "inbentarioa";
    private $erabiltzaileaService;
    private $ekipamenduaService;

    /**
     * Recibe la conexión y construye los servicios auxiliares.
     */
    public function __construct($db)
    {
        $this->conn = $db;
        $this->erabiltzaileaService = new ErabiltzaileaService($db);
        $this->ekipamenduaService = new EkipamenduaService($db);
    }

    /**
     * Comprueba si la API key pertenece a un usuario válido.
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
     * Garantiza que un equipo existe antes de referenciarlo.
     */
    private function validateEkipamendua($idEkipamendu)
    {
        $query = "SELECT COUNT(*) as total FROM ekipamendua WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $idEkipamendu);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row['total'] > 0;
    }

    /**
     * Devuelve cada unidad física junto con el nombre del equipamiento.
     */
    public function getAllInbentarioak($api_key)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT i.*, e.izena as ekipamendu_izena 
                 FROM " . $this->table_name . " i
                 JOIN ekipamendua e ON i.idEkipamendu = e.id";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                "inbentarioa" => new Inbentarioa($row),
                "ekipamendu_izena" => $row['ekipamendu_izena']
            ];
        }

        return ["success" => true, "count" => count($items), "inbentarioak" => $items];
    }

    /**
     * Localiza una etiqueta concreta.
     */
    public function getByEtiketa($api_key, $etiketa)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT i.*, e.izena as ekipamendu_izena 
                 FROM " . $this->table_name . " i
                 JOIN ekipamendua e ON i.idEkipamendu = e.id
                 WHERE i.etiketa = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return ["success" => true, 
                    "inbentarioa" => new Inbentarioa($row),
                    "ekipamendu_izena" => $row['ekipamendu_izena']];
        }

        return ["success" => false, "message" => "Inbentarioa ez da aurkitu."];
    }

    /**
     * Inserta una nueva etiqueta en inventario validando negocio.
     */
    public function createInbentarioa($api_key, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->etiketa) || !isset($data->idEkipamendu) || !isset($data->erosketaData)) {
            return ["success" => false, "message" => "Derrigorrezko eremuak falta dira."];
        }

        // Validar formato de etiqueta (puedes ajustar según tus necesidades)
        if (!preg_match('/^[A-Za-z0-9-]{1,10}$/', $data->etiketa)) {
            return ["success" => false, "message" => "Etiketa formatu okerra."];
        }

        // Validar que existe el equipamiento
        if (!$this->validateEkipamendua($data->idEkipamendu)) {
            return ["success" => false, "message" => "Ekipamendua ez da existitzen."];
        }

        // Validar que la etiqueta no existe
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $data->etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Etiketa hau dagoeneko existitzen da."];
        }

        $query = "INSERT INTO " . $this->table_name . " (etiketa, idEkipamendu, erosketaData) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("sis", 
            $data->etiketa,
            $data->idEkipamendu,
            $data->erosketaData
        );

        if ($stmt->execute()) {
            return ["success" => true, 
                    "message" => "Inbentarioa sortu da.",
                    "etiketa" => $data->etiketa];
        }

        return ["success" => false, "message" => "Errorea inbentarioa sortzean."];
    }

    /**
     * Actualiza campos opcionales asociados a la etiqueta.
     */
    public function updateInbentarioa($api_key, $etiketa, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Verificar que existe
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Inbentarioa ez da existitzen."];
        }

        // Si se actualiza el equipamiento, validar que existe
        if (isset($data->idEkipamendu) && !$this->validateEkipamendua($data->idEkipamendu)) {
            return ["success" => false, "message" => "Ekipamendua ez da existitzen."];
        }

        $fields = [];
        $types = '';
        $values = [];

        if (isset($data->idEkipamendu)) {
            $fields[] = "idEkipamendu = ?";
            $types .= 'i';
            $values[] = $data->idEkipamendu;
        }
        if (isset($data->erosketaData)) {
            $fields[] = "erosketaData = ?";
            $types .= 's';
            $values[] = $data->erosketaData;
        }

        if (count($fields) === 0) {
            return ["success" => false, "message" => "Ez dira eguneratzeko datuak bidali."];
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        // Añadir la etiqueta al final
        $types .= 's';
        $values[] = $etiketa;

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
                return ["success" => true, "message" => "Inbentarioa eguneratu da."];
            }
            return ["success" => false, "message" => "Ez da aldaketarik egin."];
        }

        return ["success" => false, "message" => "Errorea inbentarioa eguneratzean."];
    }

    /**
     * Elimina definitivamente una entrada del inventario.
     */
    public function deleteInbentarioa($api_key, $etiketa)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa111111."];
            
        }

        // Verificar si existe
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Inbentarioa ez da existitzen."];
        }

        // Verificar si hay registros en kokalekua
        $checkKokQuery = "SELECT COUNT(*) as total FROM kokalekua WHERE etiketa = ?";
        $stmt = $this->conn->prepare($checkKokQuery);
        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Ezin da ezabatu: kokalekuan erregistroak ditu."];
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean."];
        }

        $stmt->bind_param("s", $etiketa);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Inbentarioa ezabatu da."];
            }
            return ["success" => false, "message" => "Ezin izan da inbentarioa ezabatu."];
        }

        return ["success" => false, "message" => "Errorea inbentarioa ezabatzean."];
    }
}
?>