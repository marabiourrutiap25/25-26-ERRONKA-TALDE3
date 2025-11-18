<?php
/**
 * Representa una categoría de equipamiento.
 */
class Kategoria {
    public $id;
    public $izena;

    /**
     * Permite mapear resultados mysqli a propiedades del objeto.
     *
     * @param array|null $row
     */
    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
        }
    }
}
?>