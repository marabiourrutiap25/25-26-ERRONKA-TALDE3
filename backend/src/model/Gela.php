<?php
class Gela {
    public $id;
    public $izena;
    public $taldea;

    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
            $this->taldea = isset($row['taldea']) ? $row['taldea'] : null;
        }
    }
}
?>
