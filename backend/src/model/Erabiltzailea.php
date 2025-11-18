<?php
/**
 * Representación de un usuario tal y como se almacena en la base de datos.
 */
class Erabiltzailea {
    public $nan;
    public $izena;
    public $abizena;
    public $erabiltzailea;
    public $pasahitza;
    public $rola;
    public $api_key;

    /**
     * Rellena las propiedades desde un array asociativo, útil para mysqli.
     *
     * @param array|null $row
     */
    public function __construct($row = null) {
        if ($row) {
            $this->nan = $row['nan'];
            $this->izena = $row['izena'];
            $this->abizena = $row['abizena'];
            $this->erabiltzailea = $row['erabiltzailea'];
            $this->pasahitza = $row['pasahitza'];
            $this->rola = $row['rola'];
            $this->api_key = $row['api_key'] ?? null;
        }
    }
}
?>
