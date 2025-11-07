<?php
class Inbentarioa {
    public $etiketa;
    public $idEkipamendu;
    public $erosketaData;

    public function __construct($row = null) {
        if ($row) {
            $this->etiketa = $row['etiketa'];
            $this->idEkipamendu = $row['idEkipamendu'];
            $this->erosketaData = $row['erosketaData'];
        }
    }
}
?>