<?php

function generujMenu($slozka, $prefix = "sceny/") {
    $soubory = scandir($slozka);
    foreach ($soubory as $soubor) {
        if ($soubor === "." || $soubor === "..") continue;
        $cesta = $slozka . "/" . $soubor;

        if (is_dir($cesta)) {
            // Pokud je složka, zavolej funkci rekurzivně
            generujMenu($cesta, $prefix . $soubor . "/");
        } else {
            // Pokud je soubor HTML, vytvoř tlačítko
            if (pathinfo($soubor, PATHINFO_EXTENSION) === "html") {
                // Sestavení relativní cesty se zpětnými lomítky a pevnou předponou
                $relativniCesta = str_replace("/", "\\", $prefix . $soubor); 
                echo "<li><a href='#' class='scene-btn' data-target='" . htmlspecialchars($relativniCesta) . "'>" . htmlspecialchars($relativniCesta) . "</a></li>";
            }
        }
    }
}


// Zavolej funkci pro hlavní adresář scén
generujMenu(__DIR__ . "/sceny");

?>