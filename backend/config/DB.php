<?php
class DB {
    private $konexioa;
    private $user ;
    private $host;
    private $pass ;
    private $db;
    
    public function __construct()
    {
        $env = require __DIR__ . '/../../config.php';

        $this->user = $env['DB_USER'];
        $this->host = $env['DB_HOST'];
        $this->pass = $env['DB_PASS'];
        $this->db   = $env['DB_DATABASE'];
    }

    public function konektatu() {
        $this->konexioa = new mysqli(
            $this->host,
            $this->user,
            $this->pass,
            $this->db,
            3306
        );

        if ($this->konexioa->connect_errno) {
            die("Konexio errorea: " . $this->konexioa->connect_error);
        }

        return $this->konexioa;
    }
}
