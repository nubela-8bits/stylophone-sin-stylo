console.log("script cargado");

const tecla = document.querySelectorAll(".tecla");

// ---------- TECLAS Y WAV ----------

// notas que tenemos en los archivos WAV
const notas = [
  "C3", "C#3", "D3", "D#3", "E3", "F3",
  "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4"
];

// cada nota con la ruta de su archivo, ej. "C#3" -> "sounds/piano/Cs3.wav"
const archivosPiano = {};
for (const nota of notas) {
  archivosPiano[nota] = "sounds/piano/" + nota.replace("#", "s") + ".wav";   // cambiamos # por s, como antes
}

// Players carga todos los WAV a la vez y los deja listos para tocar
// toDestination() los conecta a los altavoces, como audio.destination
const piano = new Tone.Players(archivosPiano).toDestination();

// función para reproducir una nota concreta
async function sonar(nota) {
  await Tone.start();            // enciende el audio de Tone, apagado hasta el primer gesto del usuario
  if (!piano.loaded) return;     // si los WAV aún no han terminado de cargar, no hace nada
  piano.player(nota).start();    // coge el reproductor de esa nota y lo arranca
  console.log(nota);
}


tecla.forEach(function (tecla) {                          // a cada tecla
  tecla.addEventListener("pointerdown", function () {     // le añade un listener
    sonar(tecla.dataset.note);                            // escribe en la funcion "sonar" los datos "note" de la tecla
  });
});

// ---------- RELOJ Y TIC ----------

// tempo del reloj en bpm
Tone.Transport.bpm.value = 100;

// el reloj hace bucle: al llegar al compás 4, vuelve al compás 0
Tone.Transport.loop = true;
Tone.Transport.setLoopPoints(0, "4m");   // desde el inicio hasta 4 compases ("m" = compás)

// sonidos TIC
const sonidoAcento = new Tone.Player("sounds/tic/tic_agudo.wav").toDestination();
const sonidoPulso = new Tone.Player("sounds/tic/tic_grave.wav").toDestination();

// pulso actual dentro del compás: 0, 1, 2 o 3
let pulso = 0;

// en cada negra ("4n") se ejecuta lo de dentro
Tone.Transport.scheduleRepeat(function (time) {
  if (ticActivo){
    if (pulso === 0) {
      sonidoAcento.start(time);     // primer pulso: sonido de acento, en el instante exacto del reloj
    } else {
      sonidoPulso.start(time);      // pulsos 2, 3 y 4: el otro sonido
    }
    pulso = (pulso + 1) % 4;        // suma 1 y vuelve a 0 después del 3
  }
}, "4n");

// cuando el reloj se para, el conteo vuelve al primer pulso
Tone.Transport.on("stop", function () {
  pulso = 0;
});

// ---------- ESTADOS DEL INSTRUMENTO ----------
let ticActivo = false;     // ¿suena el metrónomo?
let playActivo = false;    // ¿se reproduce el bucle?
let recActivo = false;     // ¿se graba?

// coge los tres botones
const botonTic = document.querySelector("#tic");
const botonPlay = document.querySelector("#play");
const botonRec = document.querySelector("#rec");

// el reloj corre si TIC o PLAY están activos; si no, se para y vuelve al compás 1
async function actualizarReloj() {
  if (ticActivo || playActivo) {
    await Tone.start();                          // desbloquea el audio (viene de un clic)
    if (Tone.Transport.state !== "started") {    // si ya corre, no lo reiniciamos
      Tone.Transport.start();
    }
  } else {
    Tone.Transport.stop();
  }
}

// enciende o apaga el color de cada botón según su estado
// classList.toggle(clase, condición): pone la clase si es true, la quita si es false
function pintarBotones() {
  botonTic.classList.toggle("activo", ticActivo);
  botonPlay.classList.toggle("activo", playActivo);
  botonRec.classList.toggle("activo", recActivo);
}

// TIC: independiente de PLAY y REC
botonTic.addEventListener("click", function () {
  ticActivo = !ticActivo;       // ! da la vuelta: si era true pasa a false, y al revés
  actualizarReloj();
  pintarBotones();
});

// PLAY: si se apaga, apaga también REC y TIC 
botonPlay.addEventListener("click", function () {
  playActivo = !playActivo;
  if (!playActivo) {
    recActivo = false;
    ticActivo = false;
  }
  actualizarReloj();
  pintarBotones();
});

// REC: si se enciende, enciende también PLAY
botonRec.addEventListener("click", function () {
  recActivo = !recActivo;
  if (recActivo) {
    playActivo = true;
  }
  actualizarReloj();
  pintarBotones();
});

// ---------- DESLIZADOR TEMPO ----------

// coge deslizador y texto
const ruedaTempo = document.querySelector("#tempo");
const tempoValor = document.querySelector("#tempoValor");

// "input" se dispara mientras arrastras la rueda
ruedaTempo.addEventListener("input", function () {
  const bpm = Number(ruedaTempo.value);      // el valor llega como texto; Number() lo convierte en número
  Tone.Transport.bpm.value = bpm;            // cambia el tempo del reloj, también si está corriendo
  tempoValor.textContent = bpm;              // actualiza el número que se ve en pantalla
});