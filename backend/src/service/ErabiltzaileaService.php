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

            $newErabiltzaile=new Erabiltzailea();
            $newErabiltzaile->sortu_erabiltzaile_array_asociativo($row); 
            return $newErabiltzaile;
        }
        return null;
    }

    public function logina_kontsultatu($username, $password)
    {
        $user = $this->select_Erabiltzailea($username);

        // La contraseña tiene que estar hasheada, por eso lo del password_verify.
        if ($user && password_verify($password, $user->pasahitza)) {
            return $user;
        }

        return null;
    }

    public function update_Erabiltzailea(){
        
    }
}
?>