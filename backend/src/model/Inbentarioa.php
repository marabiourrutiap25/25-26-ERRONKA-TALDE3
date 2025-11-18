<?php
/**
 * Objeto simple que contiene los campos claves de la tabla `inbentarioa`.
 */
class Inbentarioa {
    public $etiketa;
    public $idEkipamendu;
    public $erosketaData;

    /**
     * Construye el modelo desde una fila devuelta por la base de datos.
     *
     * @param array|null $row
     */
    public function __construct($row = null) {
        if ($row) {
            $this->etiketa = $row['etiketa'];
            $this->idEkipamendu = $row['idEkipamendu'];
            $this->erosketaData = $row['erosketaData'];
        }
    }
}
?>