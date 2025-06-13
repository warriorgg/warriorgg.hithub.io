const chat = document.getElementById("chat");
const options = document.getElementById("options");
const puntosDiv = document.getElementById("puntos");
const recordDiv = document.getElementById("record");
const menu = document.getElementById("menu");
const inicio = document.getElementById("inicio");
const jugarBtn = document.getElementById("boton-jugar");
const contenedorChat = document.querySelector(".chat-container");
const victorySound = document.getElementById("victory-sound");

const bgMusic = new Audio("https://cdn.pixabay.com/audio/2022/10/12/audio_11352f1ba4.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

let puntos = parseInt(localStorage.getItem("puntos")) || 0;
let record = parseInt(localStorage.getItem("record")) || 0;
let personaje = null;
let historial = [];
let vida = 100;

const personajes = {
  mago: { nombre: "🧙 Mago", fuerza: 4, suerte: 14, magia: 10 },
  guerrero: { nombre: "🛡 Guerrero", fuerza: 12, suerte: 10, magia: 2 },
  ladron: { nombre: "🦊 Ladrón", fuerza: 7, suerte: 12, magia: 3 }
};

function actualizarPuntos(cantidad) {
  puntos += cantidad;
  if (puntos > record) {
    record = puntos;
    localStorage.setItem("record", record);
  }
  localStorage.setItem("puntos", puntos);
  puntosDiv.textContent = `Puntos: ${puntos}`;
  recordDiv.textContent = `Récord: ${record}`;
}

function actualizarVida(cantidad) {
  vida += cantidad;
  if (vida > 100) vida = 100;
  if (vida < 0) vida = 0;

  const barra = document.getElementById("vida-bar");
  const texto = document.getElementById("vida-texto");
  barra.style.width = vida + "%";
  texto.textContent = vida + "%";

  if (vida > 60) {
    barra.style.backgroundColor = "#27ae60"; // Verde
  } else if (vida > 30) {
    barra.style.backgroundColor = "#f1c40f"; // Amarillo
  } else {
    barra.style.backgroundColor = "#c0392b"; // Rojo
  }

  if (vida <= 0) {
    mensaje("💀 Has muerto. El destino no fue piadoso.");
    setTimeout(reiniciarJuego, 3000);
  }
}

function mensaje(texto) {
  const linea = document.createElement("p");
  linea.textContent = texto;
  linea.style.opacity = 0;
  chat.appendChild(linea);
  chat.scrollTop = chat.scrollHeight;
  setTimeout(() => linea.style.opacity = 1, 100);
}

function crearBoton(texto, accion) {
  const btn = document.createElement("button");
  btn.textContent = texto;
  btn.className = "option-button";
  btn.onclick = accion;
  btn.style.opacity = 0;
  options.appendChild(btn);
  setTimeout(() => btn.style.opacity = 1, 200);
}

function eventoAleatorio() {
  options.innerHTML = "";
  if (historial.length >= eventos.length) historial = [];
  let candidatos = eventos.filter(ev => !historial.includes(ev.id));
  const evento = candidatos[Math.floor(Math.random() * candidatos.length)];
  historial.push(evento.id);
  const texto = typeof evento.texto === "function" ? evento.texto() : evento.texto;
  mensaje(texto);
  evento.opciones.forEach(op => crearBoton(op.texto, () => {
    mensaje(`> ${op.texto}`);
    op.accion();
  }));
}

function combateAvanzado() {
  const enemigo = Math.ceil(Math.random() * 10 + 5);
  const suerte = Math.floor(Math.random() * personaje.suerte);
  const ataqueJugador = Math.ceil(Math.random() * personaje.fuerza + suerte);
  mensaje(`Tu ataque: ${ataqueJugador} | Defensa enemiga: ${enemigo}`);

  setTimeout(() => {
    if (ataqueJugador >= enemigo) {
      mensaje("✔ ¡Victoria! Derrotaste al enemigo.");
      victorySound.play();
      actualizarPuntos(10);
    } else {
      mensaje("❌ Has sido herido. Perdés 20% de vida.");
      actualizarVida(-20);
      actualizarPuntos(-2);
    }
    eventoAleatorio();
  }, 1200);
}

function mostrarMenuPersonaje() {
  menu.innerHTML = "<h2>Elegí tu personaje:</h2>";
  options.innerHTML = "";
  chat.innerHTML = "";
  puntos = 0;
  vida = 100;
  localStorage.setItem("puntos", "0");
  actualizarPuntos(0);
  actualizarVida(0);
  for (const key in personajes) {
    const p = personajes[key];
    const btn = document.createElement("button");
    btn.className = "option-button";
    btn.innerHTML = `${p.nombre}<br>Fuerza: ${p.fuerza} | Suerte: ${p.suerte} | Magia: ${p.magia}`;
    btn.onclick = () => {
      personaje = p;
      menu.innerHTML = `<p>Elegiste: ${p.nombre}</p>`;
      eventoAleatorio();
    };
    options.appendChild(btn);
  }
}

function reiniciarJuego() {
  personaje = null;
  historial = [];
  mostrarMenuPersonaje();
}

jugarBtn.onclick = () => {
  inicio.style.display = "none";
  contenedorChat.style.display = "block";
  bgMusic.play();
  mostrarMenuPersonaje();
};

const enemigos = ["💀 Esqueleto", "👺 Bandido", "🐉 Dragón", "👻 Fantasma", "🧛 Vampiro"];

const eventos = [
  {
    id: "acertijo1",
    texto: "Un sabio te pregunta: '¿Qué sube pero nunca baja?'",
    opciones: [
      { texto: "Tu edad", accion: () => { mensaje("Correcto!"); actualizarPuntos(5); eventoAleatorio(); } },
      { texto: "La marea", accion: () => { mensaje("Fallo."); eventoAleatorio(); } }
    ]
  },
  {
    id: "combate1",
    texto: () => `Un ${enemigos[Math.floor(Math.random() * enemigos.length)]} aparece. ¡Te ataca!`,
    opciones: [
      { texto: "Luchar", accion: combateAvanzado },
      { texto: "Huir", accion: () => { mensaje("Escapas, pero pierdes puntos."); actualizarPuntos(-5); eventoAleatorio(); } }
    ]
  },
  {
    id: "romance",
    texto: "Te cruzas con un alma solitaria en la posada. ¿Te acercas?",
    opciones: [
      { texto: "Sí", accion: () => { mensaje("Pasás una noche inolvidable. Recuperás energía."); actualizarVida(10); eventoAleatorio(); } },
      { texto: "No", accion: () => { mensaje("Te perdés una oportunidad única."); eventoAleatorio(); } }
    ]
  },
  {
    id: "trampaMagica",
    texto: "Una niebla mágica te envuelve. Tirá el dado para disiparla.",
    opciones: [
      { texto: "Tirar dado", accion: combateAvanzado }
    ]
  },
  {
    id: "chiste",
    texto: "Te resbalás con una cáscara de banana medieval. Nadie te vio... ¿o sí?",
    opciones: [
      { texto: "Reírte solo", accion: () => { mensaje("Al menos nadie lo grabó."); actualizarPuntos(2); eventoAleatorio(); } },
      { texto: "Hacer como que fue a propósito", accion: () => { mensaje("Un bardo empieza a cantarlo..."); actualizarPuntos(4); eventoAleatorio(); } }
    ]
  },
  {
    id: "fantasma",
    texto: "Un fantasma aparece y te pregunta: '¿Por qué el esqueleto no fue a la fiesta?'",
    opciones: [
      { texto: "Porque no tenía cuerpo", accion: () => { mensaje("JAJAJA... El fantasma ríe y te deja ir."); actualizarPuntos(3); eventoAleatorio(); } },
      { texto: "Porque estaba muerto", accion: () => { mensaje("Muy literal... El fantasma se ofende."); actualizarVida(-10); eventoAleatorio(); } }
    ]
  }
];
