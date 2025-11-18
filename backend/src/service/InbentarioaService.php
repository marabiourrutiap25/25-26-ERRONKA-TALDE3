<?php
require_once __DIR__ . '/../model/Inbentarioa.php';
require_once __DIR__ . '/ErabiltzaileaService.php';
require_once __DIR__ . '/EkipamenduaService.php';

/**
 * `inbentarioa` taulari dedikatutako zerbitzua, erabiltzaile, ekipamendu
 * eta kokalekuen arteko egiaztaapenak barne.
 */
class InbentarioaService
{
    private $conn;
    private $table_name = "inbentarioa";
    private $erabiltzaileaService;
    private $ekipamenduaService;

    /**
     * Konexioa jasotzen du eta zerbitzu lagunak eraikitzen ditu.
     */
    public function __construct($db)
    {
        $this->conn = $db;
        $this->erabiltzaileaService = new ErabiltzaileaService($db);
        $this->ekipamenduaService = new EkipamenduaService($db);
    }

    /**
     * Egiaztatzen du API key-a erabiltzaile baliozko bati dagokiola.
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
     * Ekipamendu bat existitzen dela bermatzen du aipuak egin aurretik.
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
     * Unitate fisiko bakoitza itzultzen du, ekipamendu izenarekin.
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
     * Etiketa konkretu bat bilatzen du.
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
     * Inbentarioan etiketa berri bat txertatzen du, negozio-baldintzak egiaztatuta.
     */
    public function createInbentarioa($api_key, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        if (!isset($data->etiketa) || !isset($data->idEkipamendu) || !isset($data->erosketaData)) {
            return ["success" => false, "message" => "Derrigorrezko eremuak falta dira."];
        }

        // Etiketaren formatua egiaztatu (behar izanez gero moldatu)
        if (!preg_match('/^[A-Za-z0-9-]{1,10}$/', $data->etiketa)) {
            return ["success" => false, "message" => "Etiketa formatu okerra."];
        }

        // Ekipamendua existitzen dela egiaztatu
        if (!$this->validateEkipamendua($data->idEkipamendu)) {
            return ["success" => false, "message" => "Ekipamendua ez da existitzen."];
        }

        // Etiketa dagoeneko existitzen ez dela egiaztatu
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
     * Etiketarekin lotutako eremu aukerakoak eguneratzen ditu.
     */
    public function updateInbentarioa($api_key, $etiketa, $data)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Existitzen den egiaztatu
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Inbentarioa ez da existitzen."];
        }

        // Ekipamendua eguneratzen bada, existitzen den egiaztatu
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

        // Azkenean etiketa gehitu
        $types .= 's';
        $values[] = $etiketa;

        // bind_param erreferentziak behar ditu
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
     * Inbentario sarrera bat betiko ezabatzen du.
     */
    public function deleteInbentarioa($api_key, $etiketa)
    {
        if (!$this->validateApiKey($api_key)) {
            return ["success" => false, "message" => "API key ez da baliozkoa111111."];
            
        }

        // Existitzen den egiaztatu
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE etiketa = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $etiketa);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['total'] == 0) {
            return ["success" => false, "message" => "Inbentarioa ez da existitzen."];
        }

        // Kokalekuan erregistroak dauden egiaztatu
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