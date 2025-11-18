<?php
require_once __DIR__ . '/../model/Erabiltzailea.php';

/**
 * `erabiltzailea` taularako datu-atzealde zerbitzua.
 * Baldintza partekatuak eta API key sortzeak zentralizatzen ditu.
 */
class ErabiltzaileaService
{

    private $dbObj;
    private $conn;

    /**
     * Bere konexioa irekitzen du, zerbitzu hau beste zerbitzu eta kontroladoreetatik
     * ere erabiltzen baita.
     */
    public function __construct(){
        $this->dbObj = new DB();
        $this->conn = $this->dbObj->konektatu();
    }
    

    private $table_name = "erabiltzailea";


    /**
     * Erabiltzaile bat lortzen du bere login izenaren arabera.
     *
     * @param string $username
     */
    public function select_Erabiltzailea($username)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE erabiltzailea = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            die("Errorea kontsulta prestatzean: " . $this->conn->error);
        }

        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();

            return new Erabiltzailea($row);
        }
        return null;
    }

    /**
     * Kredentzialak egiaztatzen ditu eta API key bat sortzen du baldin eta ez badago.
     */
    public function logina_kontsultatu($username, $password)
    {
        $user = $this->select_Erabiltzailea($username);
        if ($user && password_verify($password, $user->pasahitza)) {

            if (empty($user->api_key)) {

                $newApiKey = $this->sortuApiKeyBerria();

                $updateQuery = "UPDATE " . $this->table_name . " SET api_key = ? WHERE nan = ?";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bind_param("ss", $newApiKey, $user->nan);
                $updateStmt->execute();

                $user->api_key = $newApiKey;
            }

            return $user;
        }

        return null;
    }

    /**
     * Jasotako API key-arekin lotutako erabiltzailea itzultzen du.
     */
    public function select_ApiKey($api_key)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE api_key = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            die("Errorea kontsulta prestatzean: " . $this->conn->error);
        }

        $stmt->bind_param("s", $api_key);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return new Erabiltzailea($row);
        }
        return null;
    }

    /**
     * API key ausazko bat sortzen du, bakartasuna bermatuz.
     */
    private function sortuApiKeyBerria()
    {
        do {
            $api_key = bin2hex(random_bytes(16));
            $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE api_key = ?";
            $stmt = $this->conn->prepare($checkQuery);
            $stmt->bind_param("s", $api_key);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
        } while ($row['total'] > 0);

        return $api_key;
    }

    /**
     * Eremu bakar baten eguneratze zuzena adibidez.
     */
    public function aldatuIzena($api_key, $izena_berria) // Esta es la prueba.
    {
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "UPDATE " . $this->table_name . " SET izena = ? WHERE nan = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ss", $izena_berria, $user->nan);

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Izena ongi eguneratu da.", "nuevo_izena" => $izena_berria];
        } else {
            return ["success" => false, "message" => "Errorea izena eguneratzean."];
        }
    }

    /**
     * Administraziorako erabiltzaileen zerrenda osoa itzultzen du.
     */
    public function getAllErabiltzaileak($api_key)
    {
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT nan, izena, abizena, erabiltzailea, rola, api_key FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean: " . $this->conn->error];
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }

        return ["success" => true, "count" => count($items), "users" => $items];
    }
    /**
     * API key bati lotutako datu oinarrizkoak lortzen ditu.
     */
    public function getByApiKey($api_key){
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }
        $query = "SELECT nan, izena, abizena, erabiltzailea FROM " . $this->table_name . " WHERE api_key = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean: " . $this->conn->error];
        }
        $stmt->bind_param("s", $api_key);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return ["success" => true, "user" => $row];
        }

        return ["success" => false, "message" => "Erabiltzailea ez da aurkitu."];
    }

    /**
     * NAN-aren arabera erabiltzaile zehatz bat bilatzen du.
     */
    public function getByNan($api_key, $nan)
    {
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "SELECT nan, izena, abizena, erabiltzailea, rola, api_key FROM " . $this->table_name . " WHERE nan = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean: " . $this->conn->error];
        }
        $stmt->bind_param("s", $nan);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return ["success" => true, "user" => $row];
        }

        return ["success" => false, "message" => "Erabiltzailea ez da aurkitu."];
    }

    /**
     * Erabiltzaile bat ezabatzen du, deitzailea autentikatuta badago.
     */
    public function deleteByNan($api_key, $nan)
    {
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE nan = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean: " . $this->conn->error];
        }
        $stmt->bind_param("s", $nan);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ["success" => true, "message" => "Erabiltzailea ezabatu da."];
            } else {
                return ["success" => false, "message" => "Erabiltzailea ez da aurkitu."];
            }
        }

        return ["success" => false, "message" => "Errorea erabiltzailea ezabatzean."];
    }

    /**
     * Payload-ean bidalitako eremuak modu dinamikoan eguneratzen ditu.
     */
    public function updateErabiltzailea($api_key, $data, $nanParam = null)
    {
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        $nan = $nanParam ?? ($data->nan ?? null);
        if (!$nan) {
            return ["success" => false, "message" => "Nan falta da eguneraketarako."];
        }

        $fields = [];
        $types = '';
        $values = [];

        if (isset($data->izena)) {
            $fields[] = "izena = ?";
            $types .= 's';
            $values[] = $data->izena;
        }
        if (isset($data->abizena)) {
            $fields[] = "abizena = ?";
            $types .= 's';
            $values[] = $data->abizena;
        }
        if (isset($data->erabiltzailea)) {
            $fields[] = "erabiltzailea = ?";
            $types .= 's';
            $values[] = $data->erabiltzailea;
        }
        if (isset($data->pasahitza)) {
            $hashed = password_hash($data->pasahitza, PASSWORD_DEFAULT);
            $fields[] = "pasahitza = ?";
            $types .= 's';
            $values[] = $hashed;
        }
        if (isset($data->rola)) {
            $fields[] = "rola = ?";
            $types .= 's';
            $values[] = $data->rola;
        }

        if (count($fields) === 0) {
            return ["success" => false, "message" => "Ezin da eguneratu: ez dira aldagairik igorri."];
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE nan = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ["success" => false, "message" => "Errorea kontsulta prestatzean: " . $this->conn->error];
        }

        // Añadir el nan al final de los parámetros
        $types .= 's';
        $values[] = $nan;

        // bind_param requiere referencias
        $bind_names[] = $types;
        for ($i = 0; $i < count($values); $i++) {
            $bind_name = 'bind' . $i;
            $$bind_name = $values[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array([$stmt, 'bind_param'], $bind_names);

        if ($stmt->execute()) {
            if ($stmt->affected_rows >= 0) {
                return ["success" => true, "message" => "Erabiltzailea eguneratu da."];
            }
            return ["success" => false, "message" => "Ez da aldaketarik egin."];
        }

        return ["success" => false, "message" => "Errorea eguneratzean."];
    }

    /**
     * Erabiltzaile berri bat txertatzen du, eta eremu bakarrak eta derrigorrezkoak egiaztatzen ditu.
     */
    public function createErabiltzailea($api_key, $data)
    {
        $user = $this->select_ApiKey($api_key);
        if (!$user) {
            return ["success" => false, "message" => "API key ez da baliozkoa."];
        }

        // Campos requeridos por la tabla
        $required = ['nan', 'izena', 'abizena', 'erabiltzailea', 'pasahitza', 'rola'];
        foreach ($required as $r) {
            if (!isset($data->$r) || $data->$r === '') {
                return ["success" => false, "message" => "Campo requerido falta: $r"];
            }
        }

        // Comprobar existencia por nan
        $checkQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE nan = ?";
        $stmtCheck = $this->conn->prepare($checkQuery);
        $stmtCheck->bind_param("s", $data->nan);
        $stmtCheck->execute();
        $res = $stmtCheck->get_result();
        $row = $res->fetch_assoc();
        if ($row['total'] > 0) {
            return ["success" => false, "message" => "Erabiltzailea nan honekin existitzen da."];
        }

        // También podríamos comprobar usuario único
        $checkUserQ = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE erabiltzailea = ?";
        $stmtCheck2 = $this->conn->prepare($checkUserQ);
        $stmtCheck2->bind_param("s", $data->erabiltzailea);
        $stmtCheck2->execute();
        $res2 = $stmtCheck2->get_result();
        $row2 = $res2->fetch_assoc();
        if ($row2['total'] > 0) {
            return ["success" => false, "message" => "Erabiltzaile izen hau dagoeneko erabiltzen da."];
        }

        $hashed = password_hash($data->pasahitza, PASSWORD_DEFAULT);

        $insertQ = "INSERT INTO " . $this->table_name . " (nan, izena, abizena, erabiltzailea, pasahitza, rola) VALUES (?, ?, ?, ?, ?, ?)";
        $stmtIns = $this->conn->prepare($insertQ);
        if (!$stmtIns) {
            return ["success" => false, "message" => "Errorea prestatzean: " . $this->conn->error];
        }
        $stmtIns->bind_param("ssssss", $data->nan, $data->izena, $data->abizena, $data->erabiltzailea, $hashed, $data->rola);
        if ($stmtIns->execute()) {
            return ["success" => true, "message" => "Erabiltzailea sortu da."];
        }

        return ["success" => false, "message" => "Errorea erabiltzailea sortzean."];
    }

    /**
     * API key-etik rol-a bakarrik berreskuratzeko atajoa.
     */
    public function getRoleByApiKey($api_key) {
    // Obtener usuario por API key
    $user = $this->select_ApiKey($api_key);

    if (!$user) {
        return ["success" => false, "message" => "API key ez da baliozkoa."];
    }

    return ["success" => true, "rola" => $user->rola];
}


}
?>
