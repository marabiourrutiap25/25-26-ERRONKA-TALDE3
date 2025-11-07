<?php
class Ekipamendua {
    public $id;
    public $izena;
    public $deskribapena;
    public $marka;
    public $modelo;
    public $stock;
    public $idKategoria;

    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
            $this->deskribapena = $row['deskribapena'];
            $this->marka = $row['marka'];
            $this->modelo = $row['modelo'];
            $this->stock = $row['stock'];
            $this->idKategoria = $row['idKategoria'];
        }
    }
}
?>