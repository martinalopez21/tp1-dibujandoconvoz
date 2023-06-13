let trazos = [];
let trazos1 = [];
let cantidad = 2;
let cantidad1= 3;
let tamañoImagen = 100; // Tamaño inicial de la imagen
let opacidad = 0;

// GRAVES OPACIDAD CHICOS 
// AGUDOS SIN OPACIDAD GRANDES

//copiado
let monitorear = true;

let mic;
let pitch;
let audioContext;

let c;
let gestorAmp;
let gestorPitch;
let haySonido;
let antesHabiaSonido;

let AMP_MIN = 0.01; // umbral mínimo de amplitud. Señal que supera al ruido de fondo
let AMP_MAX = 0.1; // umbral máximo de amplitud. 
let FREC_MIN = 880;
let FREC_MAX = 2000;

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';


let classifier;
const options = { probabilityThreshold: 0.9 };
let label;
let etiqueta;

const classModel = 'https://teachablemachine.withgoogle.com/models/QHOLEoD1T/'; //url del modelo producido con Teachable Machine


function preload() {
  miPaleta = new Paleta( "img/paleta.jpg" );
  for (let i = 0; i < cantidad; i++) {
    let nombre = "img/pincelviejo" + i + ".png";
    trazos[i] = loadImage(nombre);
  }


  for (let i = 0; i < cantidad1; i++) {
    let nombre1 = "img/linea" + i + ".png";
    trazos1[i] = loadImage(nombre1);
  }

    // Load SpeechCommands18w sound classifier model
    classifier = ml5.soundClassifier(classModel + 'model.json', options);
}


function setup() {
  createCanvas(displayWidth, displayHeight);
  frameRate(10);
  background(7, 11, 70);
  imageMode(CENTER);


  //------CLASIFICADOR-----
  classifier.classify(gotResult);
  

  //inicializo la escucha de sonido
  audioContext = getAudioContext();
	mic = new p5.AudioIn();
  //acá le pido que llame a startPitch
  mic.start( startPitch );

  gestorAmp = new GestorSenial( 0.01 , 0.4 );
  gestorPitch = new GestorSenial( 40 , 75 );

  //hay que agregar esto
	userStartAudio();

  antesHabiaSonido = false;
}

function draw() {

  let vol = mic.getLevel();
  gestorAmp.actualizar( vol );

  haySonido = gestorAmp.filtrada>0.1;
  let inicioElSonido = haySonido && !antesHabiaSonido;
  let finDelSonido = !haySonido && antesHabiaSonido;

if(haySonido){
  let esteColor =  miPaleta.darColor();
  let cual = int(random(cantidad));
  let x = random(width);
  let y = random(height);



  let nuevoTamaño = map(gestorPitch.filtrada, 0, 1, 100, 1000); // Nuevo tamaño de la imagen basado en el movimiento del mouse en el eje x
 // let nuevaOpacidad = opacidad + mouseX;

 let nuevaOpacidad = map(gestorPitch.filtrada, 0, 1, 255, 100);

  tint( red(esteColor) , green(esteColor) , blue(esteColor) , nuevaOpacidad );
//   //if (random() < 0.5) {
//   tint(random(100, 255), 0, 0, nuevaOpacidad);
// } else {
//   tint(0, 0, random(100, 255), nuevaOpacidad);
// } cambiar entre azul y rojo
  

  image(trazos[cual], x, y, nuevoTamaño, nuevoTamaño); // Dibuja la imagen con el nuevo tamaño
  tint( 0,0,0 , nuevaOpacidad );

}


if(label == 'Class 2'){

  let cual1 = int(random(cantidad1));

  let x1 = random(width);
  let y1 = random (height);
  
  image(trazos1[cual1], x1, y1, 200, 200); // Dibuja la imagen con el nuevo tamaño

}
 
  if( monitorear ){
    gestorAmp.dibujar( 100 , 100 );
    gestorPitch.dibujar( 100 , 300 );
  }
  
  antesHabiaSonido = haySonido;

}


function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  //console.log(results);
  // Show the first label and confidence
  label = results[0].label;
  etiqueta = label;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
//--------------------------------------------------------------------
function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext , mic.stream, modelLoaded);
}
//--------------------------------------------------------------------
function modelLoaded() {
//select('#status').html('Model Loaded');
getPitch();
//console.log( "entro aca !" );

}
//--------------------------------------------------------------------
function getPitch() {
  pitch.getPitch(function(err, frequency) {
  if (frequency) {    	
    let midiNum = freqToMidi(frequency);
    //console.log( midiNum );

    gestorPitch.actualizar( midiNum );

  }
  getPitch();
})
}
