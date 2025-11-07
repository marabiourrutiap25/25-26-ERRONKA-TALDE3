<?php
class Kokalekua {
    public $etiketa;
    public $idGela;
    public $hasieraData;
    public $amaieraData;

    public function __construct($row = null) {
        if ($row) {
            $this->etiketa = $row['etiketa'];
            $this->idGela = $row['idGela'];
            $this->hasieraData = $row['hasieraData'];
            $this->amaieraData = $row['amaieraData'];
        }
    }
}
?>