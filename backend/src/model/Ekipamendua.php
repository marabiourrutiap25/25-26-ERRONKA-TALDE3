<?php
/**
 * DTO simple que representa la fila de la tabla `ekipamendua`.
 */
class Ekipamendua {
    public $id;
    public $izena;
    public $deskribapena;
    public $marka;
    public $modelo;
    public $stock;
    public $idKategoria;
    public $kategoria_izena;

    /**
     * Permite construir el objeto directamente desde un array asociativo.
     *
     * @param array|null $row
     */
    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
            $this->deskribapena = $row['deskribapena'];
            $this->marka = $row['marka'];
            $this->modelo = $row['modelo'];
            $this->stock = $row['stock'];
            $this->idKategoria = $row['idKategoria'];
            $this->kategoria_izena = $row['kategoria_izena'] ?? null;
        }
    }
}
?>