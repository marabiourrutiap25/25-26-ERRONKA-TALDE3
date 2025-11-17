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
        $this->user = "root";
        $this->host = "localhost";
        $this->pass = "abcd*1234";
        $this->db = "Erronka1";
    }

    /**
     * Abre la conexión y la guarda en la propiedad interna para futuras
     * operaciones. Finaliza la ejecución si la conexión no es posible.
     *
     * @return mysqli Conexión abierta lista para usar.
     */
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
    /**
     * Devuelve la conexión actual para evitar recrearla.
     *
     * @return mysqli|null
     */
    public function getKonexioa() {
        return $this->konexioa;
    }
    /**
     * Cierra la conexión automaticamente cuando el objeto se destruye.
     */
    public function __destruct() {
        if ($this->konexioa) {
            $this->konexioa->close();
        }
    }
}