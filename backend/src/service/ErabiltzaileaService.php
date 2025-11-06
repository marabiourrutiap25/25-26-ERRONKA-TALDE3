<?php
require_once __DIR__ . '/../model/Erabiltzailea.php';

class ErabiltzaileaService
{
    private $conn;
    private $table_name = "erabiltzailea";

    public function __construct($db)
    {
        $this->conn = $db;
    }

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
}
?>
