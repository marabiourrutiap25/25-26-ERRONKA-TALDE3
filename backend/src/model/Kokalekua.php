<?php
/**
 * Ekipamendu konkretu baten mugimendu/kokaleku modeloa.
 */
class Kokalekua {
    public $etiketa;
    public $idGela;
    public $hasieraData;
    public $amaieraData;

    /**
     * mysqli-k itzultzen dituen zutabeak automatikoki mapatzen ditu.
     *
     * @param array|null $row
     */
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