$(document).on("click", "a[data-target]", function (e) {
    e.preventDefault();
    var target = $(this).data("target");
    if (target) {
        if (synth.speaking) {
            synth.cancel();
        }
        loadSceneByTarget(target);
    }
});

// Načtení výchozí scény při startu
$(document).ready(function () {
    var target = "sceny/main/00_intro_video.html";
    loadSceneByTarget(target);
});


// Funkce pro načítání scény podle data-target
function loadSceneByTarget(target) {
    $("#sceny").fadeOut(300, function () {
        $("#sceny").load(`${target}`, function () {
            $("#sceny").fadeIn(300);
            afterLoadScene($(this)); // Zavolá afterLoadScene pro novou scénu
        });
    });
}

// Inicializace SpeechSynthesis
const synth = window.speechSynthesis;
let currentUtterance = null;

/**
 * Funkce pro čtení textu s nastavením pitch
 * @param {string} text - Text k přečtení
 * @param {number} pitch - Výška hlasu (0.1 - 2.0)
 */
function readText(text, pitch = 1.0) {
    return new Promise((resolve) => {
        // Zastaví aktuální přehrávání
        if (synth.speaking) {
            synth.cancel();
        }

        // Nastaví nový text
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = "cs-CZ"; // Český jazyk
        currentUtterance.pitch = pitch;

        // Nastaví callback pro událost 'end'
        currentUtterance.onend = function() {
            resolve(); // Uvolní promise po dokončení čtení
        };

        // Spustí čtení
        synth.speak(currentUtterance);
    });
}


function stopAllHudba(){
    $('audio').each(function(){
        this.pause(); // Stop playing
        this.currentTime = 0; // Reset time
    }); 
}
function playHudba(id_audio) {
    if($(id_audio).length>0){
        $(id_audio)[0].play();
        $(id_audio).prop('volume', 0.2);
    }
}

// Funkce čeká, dokud video neskončí
function waitForVideoToEnd(videoElement) {
    return new Promise((resolve) => {
        videoElement.onended = () => {
            resolve(); // Uvolní promise, jakmile video skončí
        };
    });
}

async function afterLoadScene(scena) {
    
    if(scena.find('section').attr('id') == 'vyber_koleje'){
        stopAllHudba();
        playHudba('#hudba_skola');
    }
    if(scena.find('section').attr('id') == 'intro_boj'){
        stopAllHudba();
        playHudba('#hudba_battle');
    }
    if(scena.find('section').attr('id') == 'intro' || scena.find('section').attr('id') == 'vyhra'){
        stopAllHudba();
        playHudba('#hudba_doma');
    }

    setScenaClass(scena);

    initKouzla(scena);

    //vypravěč a grinchdemort
    if($('h1:not(.skola)').length>0) await readText($('h1').text(), 0.1);
    //profesoři
    if($('h1.skola').length>0) await readText($('h1.skola').text(), 1);
    //kouzelníček
    if($('h2').length>0) await readText($('h2').text(), 2);

    // Zkontroluj, zda je na scéně video
    const videoElement = scena.find('video').get(0);
    if (videoElement) {
        await waitForVideoToEnd(videoElement);
    }

    // Spustí další scénu po dokončení čtení
    loadNextScene();

    // Přidání události pro tlačítka
    $("#sceny").off('mouseenter', '.btn').on('mouseenter', '.btn', function () {
        const text = $(this).text().trim(); // Načte text z obsahu tlačítka
        readText(text, 2);
    });
}


function setScenaClass(scena) {
    var sekce = scena.find('section');
    if(sekce.length>0){
        var trida = sekce.attr('class');
        $('#sceny').removeAttr('class');
        $('#sceny').addClass(trida);
    }
}

// Funkce pro načtení další scény podle data-target z elementu s třídou "dalsi_scena"
function loadNextScene() {
    if($(".dalsi_scena").length>0){
        var target = $(".dalsi_scena").data("target");  // Používáme třídu místo konkrétního ID
        if (target) {
            setTimeout(function() {
                loadSceneByTarget(target);
            }, 2000);

            // Čeká na vlastní událost (např. customEvent) pro načtení další scény
            /* $(document).on("customEvent", function() {
                loadNextScene(); // Načte další scénu až po vyvolání události
            }); */
        }
    }
}


// Funkce pro inicializaci všech kouzel ve scéně
function initKouzla(scena) {
    if ($('.uceni_kouzlo').length > 0) {
        if($('.moznosti').length>0){
            $('.moznosti').hide();
        }
        scena.find(".uceni_kouzlo").each(function () {
            const kouzloElement = $(this); // Aktuální kouzlo
            const targetPath = kouzloElement.data("target"); // Cesta k šabloně kouzla

            if (targetPath) {
                /* MÍSTO SET TIMEOUT - SPUSTUT až když se dořekne nějakej text */
                setTimeout(function () {
                    kouzloElement.load(targetPath, function () {
                        // Přidání efektu přiblížení
                        kouzloElement.addClass("visible"); 
                        afterLoadKouzlo(kouzloElement); // Spustí další logiku po načtení kouzla
                    });
                }, 2000);
            }
        });
    }
}

// Funkce volaná po načtení kouzla
function afterLoadKouzlo(kouzloElement) {
    const svgContainer = kouzloElement.find("div.svg-container"); // Najde kontejner pro SVG

    if (svgContainer.length > 0) {
        initSvgInteraction(svgContainer); // Inicializace interakce pro kouzlo
    }
}

// Funkce pro inicializaci SVG interakce
function initSvgInteraction(svgContainer) {
    const svg = svgContainer.find("svg");
    const startElement = svg.find("#start")[0];
    const kouzloElement = svg.find("#kouzlo")[0];
    const finishElement = svg.find("#finish")[0];
    const pozadiElement = svg.find("#pozadi")[0];

    const kouzlo_carovani_zvuk = $("audio#kouzlo_carovani")[0];
    const kouzlo_koste_zvuk = $("audio#kouzlo_koste")[0];
    const kouzlo_mandragora_zvuk = $("audio#kouzlo_mandragora")[0];
    const kouzlo_klofan_zvuk = $("audio#kouzlo_klofan")[0];
    const kouzlo_lektvary_zvuk = $("audio#kouzlo_lektvary")[0];
    const kouzlo_finish_zvuk = $("audio#kouzlo_finish")[0];
    const kouzlo_fail_zvuk = $("audio#kouzlo_fail")[0];


    let gameStarted = false;

    svg.on("mousemove", (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);

        var kouzlo_zvuk = kouzlo_carovani_zvuk;
        if(svgContainer.hasClass('letani')){ kouzlo_zvuk = kouzlo_koste_zvuk; }
        else if(svgContainer.hasClass('mandragora')){ kouzlo_zvuk = kouzlo_mandragora_zvuk; }
        else if(svgContainer.hasClass('klofan')){ kouzlo_zvuk = kouzlo_klofan_zvuk; }
        else if(svgContainer.hasClass('lektvary')){ kouzlo_zvuk = kouzlo_lektvary_zvuk; }

        if (!gameStarted) {
            // Hra nezačala, umožňuje volný pohyb
            if (target === startElement) {
                start_carovani(kouzlo_zvuk);
            }
        } else {
            // Hra běží
            if (target === finishElement) {
                end_carovani(true, kouzlo_zvuk);
            } else if (target === pozadiElement) {
                console.log("Mimo cílovou oblast! Prohrál jsi. Restart hry.");
                end_carovani(false, kouzlo_zvuk);
            } else if (target !== startElement && target !== kouzloElement) {
                console.log("Mimo povolené oblasti! Prohrál jsi. Restart hry.");
                end_carovani(false, kouzlo_zvuk);
            }
        }
    });

    function start_carovani(kouzlo_zvuk){
        //console.log("Hra odstartována!");
        $("#kouzlo").addClass('carovani');
        kouzlo_zvuk.play();
        gameStarted = true;
    }
    function end_carovani(uspech, kouzlo_zvuk) {
        $("#kouzlo").removeClass('carovani');
        kouzlo_zvuk.pause(); // Zastaví přehrávání
        kouzlo_zvuk.currentTime = 0; // Nastaví přehrávání na začátek
        gameStarted = false; // Reset hry

        if(uspech==true){
            //console.log("Hra dokončena! Vyhrál jsi!");
            kouzlo_finish_zvuk.play();
            if($('.moznosti').length>0){
                $('.moznosti').show(500);
            }
        }else{
            kouzlo_fail_zvuk.play();
        }
    }
}
