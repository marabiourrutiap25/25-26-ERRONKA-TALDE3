<?php
/**
 * Ekipamendu kategoria bat adierazten du.
 */
class Kategoria {
    public $id;
    public $izena;

    /**
     * mysqli emaitzak objektuaren propietateetara mapatzeko aukera ematen du.
     *
     * @param array|null $row
     */
    public function __construct($row = null) {
        if ($row) {
            $this->id = $row['id'];
            $this->izena = $row['izena'];
        }
    }
}
?>