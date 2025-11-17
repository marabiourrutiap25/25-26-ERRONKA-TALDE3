<?php
/**
 * Clase de transferencia que representa una fila de la tabla `gela`.
 */
class Gela {
    public $id;
    public $izena;
    public $taldea;

    /**
     * Inicializa el objeto a partir de un array procedente de mysqli.
     *
     * @param array|null $row
     */
    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
            $this->taldea = isset($row['taldea']) ? $row['taldea'] : null;
        }
    }
}
?>
