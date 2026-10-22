console.log("script cargado");

const tecla = document.querySelectorAll(".tecla");

//creamos un contexto de audio 
const audio = new AudioContext();

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
     
    const archivo = nota.replace("#", "s");                             // Cambiamos # por s
    const respuesta = await fetch("sounds/piano/" + archivo + ".wav");  // Pedimos el archivo WAV

    // Comprobamos si el archivo existe y se ha cargado bien
    if (!respuesta.ok) {
      console.error("No se ha podido cargar:", archivo + ".wav");
      continue;
    }

    const datos = await respuesta.arrayBuffer();                  // Leemos los datos del archivo
    sonidos[nota] = await audio.decodeAudioData(datos); // Decodificamos el audio y lo guardamos asociado a su nota
    console.log("Sonido cargado:", nota);
  }
}
cargarSonidos();   // se ejecuta una sola vez, al abrir la página

// creamos la funcion sonar
/*function sonar(nota) {
  audio.resume();                               // enciende audio, apagado hasta primer click
  const oscilador = audio.createOscillator();   // crea oscilador nuevo 
  oscilador.frequency.value = 220;              // define frecuencia de nota 
  oscilador.connect(audio.destination);         // conecta con los altavoces
  oscilador.start();                            // arranca
  oscilador.stop(audio.currentTime + 0.5);      // para al medio segundo
  console.log(nota);
}*/

// función para reproducir una nota concreta
function sonar(nota) {
    audio.resume();                             // enciende audio, apagado hasta primer click
    const fuente = audio.createBufferSource();  // crea reproductor nuevo (un solo uso)
    fuente.buffer = sonidos[nota];              // busca el sonido que corresponde a la nota
    fuente.connect(audio.destination);
    fuente.start();
    console.log(nota);
}

// a cada tecla
// le añadimos un listener de click
//e scribe en la funcion "sonar" los datos "note" de la tecla
tecla.forEach(function (tecla) {
  tecla.addEventListener("click", function () {
    sonar(tecla.dataset.note);
  });
});