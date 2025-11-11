<?php
class Kategoria {
    public $id;
    public $izena;

    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
        }
    }
}
?>