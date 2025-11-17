<?php
/**
 * Modelo para los movimientos/ubicaciones de un equipo concreto.
 */
class Kokalekua {
    public $etiketa;
    public $idGela;
    public $hasieraData;
    public $amaieraData;

    /**
     * Mapear automáticamente las columnas devueltas por mysqli.
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