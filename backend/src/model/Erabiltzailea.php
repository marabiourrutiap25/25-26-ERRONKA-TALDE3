<?php
class Erabiltzailea {
    public $nan;
    public $izena;
    public $abizena;
    public $erabiltzailea;
    public $pasahitza;
    public $rola;

    public function __construct($row = null) {
        if ($row) {
            $this->nan = $row['nan'];
            $this->izena = $row['izena'];
            $this->abizena = $row['abizena'];
            $this->erabiltzailea = $row['erabiltzailea'];
            $this->pasahitza = $row['pasahitza'];
            $this->rola = $row['rola'];
        }
    }
}
?>
