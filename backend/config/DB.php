<?php
class DB {
    private $konexioa;
    private $user ;
    private $host;
    private $pass ;
    private $db;
    
    public function __construct()
    {
        $this->user = "root";
        $this->host = "localhost";
        $this->pass = "abcd*1234";
        $this->db = "Erronka1";
    }

    public function konektatu() {
        $this->konexioa = new mysqli($this->host,$this->user,$this->pass,$this->db, 3306);
        if ($this->konexioa->connect_errno) {
            printf("Konexio errorea: %s\n", $this->konexioa->connect_error);
            die();
        }
        else {
            return $this->konexioa;
        }       
    }
    public function getKonexioa() {
        return $this->konexioa;
    }
    public function __destruct() {
        if ($this->konexioa) {
            $this->konexioa->close();
        }
    }
}