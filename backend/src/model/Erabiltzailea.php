<?php
class Erabiltzailea {
    public $nan;
    public $izena;
    public $abizena;
    public $erabiltzailea;
    public $pasahitza;
    public $rola;

    public function __construct($nan=null, $izena=null, $abizena=null, $erabiltzailea=null, $pasahitza=null, $rola=null) {
        $this->nan = $nan;
        $this->izena = $izena;
        $this->abizena = $abizena;
        $this->erabiltzailea = $erabiltzailea;
        $this->pasahitza = $pasahitza;
        $this->rola = $rola;
    }



    public function sortu_erabiltzaile_array_asociativo($row = null){
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
