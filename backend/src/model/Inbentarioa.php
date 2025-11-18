<?php
/**
 * Objektu sinplea, `inbentarioa` taularen eremu gakoak dituena.
 */
class Inbentarioa {
    public $etiketa;
    public $idEkipamendu;
    public $erosketaData;

    /**
     * Datu-baseak itzulitako ilaretik modelo-a eraikitzen du.
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