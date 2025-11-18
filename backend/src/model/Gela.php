<?php
/**
 * `gela` taularen ilara bat ordezkatzen duen transferentzia klasea.
 */
class Gela {
    public $id;
    public $izena;
    public $taldea;

    /**
     * mysqli-tik datorren array batetik objektua inicializatzen du.
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
