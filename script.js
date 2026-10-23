console.log("script cargado");

const tecla = document.querySelectorAll(".tecla");

//creamos un contexto de audio 
const audio = new AudioContext();

// ---------- TECLAS Y WAV ----------

// notas que tenemos en los archivos WAV
const notas = [
  "C3", "C#3", "D3", "D#3", "E3", "F3",
  "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4"
];

// aquí guardaremos todos los sonidos cargados
const sonidos = {};

// cargamos todos los archivos WAV
// async permite usar await dentro de la función
// await significa que esperamos <accion> antes de continuar
async function cargarSonidos() {
  for (const nota of notas) {
     
    const archivo = nota.replace("#", "s");                             // cambia # por s
    const respuesta = await fetch("sounds/piano/" + archivo + ".wav");  // pide el archivo WAV

    // Comprobamos si el archivo existe y se ha cargado bien
    if (!respuesta.ok) {
      console.error("No se ha podido cargar:", archivo + ".wav");
      continue;
    }

    const datos = await respuesta.arrayBuffer();                  // lee los datos del archivo
    sonidos[nota] = await audio.decodeAudioData(datos);           // decodifica el audio y lo guarda asociado a su nota
    console.log("Sonido cargado:", nota);
  }
}

cargarSonidos();   // se ejecuta una sola vez, al abrir la página


// función sonar reproduce la nota que se pulsa (la envia el AddEventListener)
function sonar(nota) {
    audio.resume();                             // enciende audio, apagado hasta primer click
    const fuente = audio.createBufferSource();  // crea reproductor nuevo (un solo uso)
    fuente.buffer = sonidos[nota];              // busca el sonido que corresponde a la nota
    fuente.connect(audio.destination);          // conecta con altavoces
    fuente.start();                             // reproduce el audio
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
  if (pulso === 0) {
    sonidoAcento.start(time);     // primer pulso: sonido de acento, en el instante exacto del reloj
  } else {
    sonidoPulso.start(time);      // pulsos 2, 3 y 4: el otro sonido
  }
  pulso = (pulso + 1) % 4;        // suma 1 y vuelve a 0 después del 3
}, "4n");

// cuando el reloj se para, el conteo vuelve al primer pulso
Tone.Transport.on("stop", function () {
  pulso = 0;
});

// coge el botón TIC
const botonTic = document.querySelector("#tic");

// al pulsarlo, arranca o para el reloj (provisional, solo para probar)
botonTic.addEventListener("click", async function () {
  await Tone.start();                              // desbloquea el audio de Tone, pide un gesto del usuario
  if (Tone.Transport.state === "started") {        // si el reloj está corriendo...
    Tone.Transport.stop();                         // ...lo para (vuelve al compás 1)
  } else {
    Tone.Transport.start();                        // si no, lo arranca
  }
});