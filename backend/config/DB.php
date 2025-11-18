<?php
/**
 * Clase ligera para gestionar la conexión MySQL procedente de mysqli.
 * Encapsula credenciales, apertura y cierre de la conexión para centralizar
 * la configuración del backend.
 */
class DB {
    /** @var mysqli|null Referencia al recurso de conexión activo */
    private $konexioa;
    /** @var string Usuario configurado para la BD */
    private $user ;
    /** @var string Host del servidor MySQL */
    private $host;
    /** @var string Contraseña del usuario */
    private $pass ;
    /** @var string Nombre de la base de datos */
    private $db;
    
    /**
     * Carga los parámetros de la conexión. Idealmente deberían venir de
     * variables de entorno, pero por ahora se fijan en duro.
     */
    public function __construct()
    {
        $env = require __DIR__ . '/../config.php';

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
