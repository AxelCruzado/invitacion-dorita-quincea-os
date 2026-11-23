import "./style.css";
import { Howl } from "howler";

const datos = {
  nombre: "Dorita Natalyn",
  apellidos: "Calderon Rosales",
  papa: "Erlyn Calderon",
  mama: "Judith Rosales",
  padrino: "[Nombre]",
  madrina: "[Nombre]",
  fecha: "2026-12-16T20:00:00-05:00",
  zona: "America/Lima",
  direccion: "Santo Tomás, Mz. C, Lt. 18",
  referencia: "Por el parque Santo Thomas",
  ciudad: "Nuevo Chimbote",
  vestimenta: "Elegante",
  mapa: "https://www.google.com/maps?q=-9.121814,-78.515702",
  whatsappPapa: "51985618273",
  whatsappMama: "51944667762",
  musica: "/audio/musica.mp3", // Reemplaza por el nombre de tu canción.
};
// Personalización de textos, fecha peruana y enlaces.
const el = (id) => document.getElementById(id);
document.querySelectorAll("[data-field]").forEach((node) => {
  node.textContent = datos[node.dataset.field];
});
const fecha = new Date(datos.fecha);
const formato = (opciones) =>
  new Intl.DateTimeFormat("es-PE", {
    timeZone: datos.zona,
    ...opciones,
  }).format(fecha);
const diaMes = formato({ day: "numeric", month: "long" });
const fechaLarga = formato({
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
el("cover-date").textContent =
  fechaLarga[0].toUpperCase() + fechaLarga.slice(1);
el("date").textContent = el("cover-date").textContent;
el("hour").textContent = formato({
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
}).replace(/p\.\s*m\./i, "p.m.");
el("map-link").href = datos.mapa;
const mapa = new URL(datos.mapa);
mapa.searchParams.set("output", "embed");
el("map").addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.title = "Mapa del lugar";
  frame.className = "map";
  frame.src = mapa.href;
  el("map").replaceWith(frame);
});
const mensaje =
  "Hola, confirmo mi asistencia a los XV años de " +
  datos.nombre +
  " " +
  datos.apellidos +
  " el " +
  diaMes +
  ". Mi nombre es: ";
for (const [id, rol, nombre, numero] of [
  ["dad", "Papá", datos.papa, datos.whatsappPapa],
  ["mom", "Mamá", datos.mama, datos.whatsappMama],
]) {
  el(id).textContent =
    rol +
    " " +
    nombre.split(" ")[0] +
    " · " +
    numero.slice(-9).match(/.{3}/g).join(" ");
  el(id).href =
    "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);
}

// Sincronizar con la hora real incluso después de volver desde WhatsApp.
const cifras = el("timer").querySelectorAll("strong");
let reloj;
function actualizarReloj() {
  const segundos = Math.max(
    0,
    Math.ceil((fecha.getTime() - Date.now()) / 1000),
  );
  if (!segundos) {
    el("timer").hidden = true;
    el("today").hidden = false;
    clearInterval(reloj);
    return;
  }
  const valores = [
    Math.floor(segundos / 86400),
    Math.floor(segundos / 3600) % 24,
    Math.floor(segundos / 60) % 60,
    segundos % 60,
  ];
  cifras.forEach((n, i) => {
    n.textContent = String(valores[i]).padStart(2, "0");
  });
}
reloj = setInterval(actualizarReloj, 1000);
actualizarReloj();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) actualizarReloj();
});

const fallback =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><defs><linearGradient id="g"><stop stop-color="#e6d9f5"/><stop offset="1" stop-color="#c9b1e8"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>',
  );
function replaceMissing(image) {
  if (!(image instanceof HTMLImageElement) || image.src === fallback) return;
  const source = image.closest("picture")?.querySelector("source");
  if (source) {
    source.remove();
    return;
  }
  image.classList.add("fallback");
  image.src = fallback;
}
document.addEventListener(
  "error",
  (event) => replaceMissing(event.target),
  true,
);
document.querySelectorAll("img").forEach((img) => {
  if (img.complete && !img.naturalWidth) replaceMissing(img);
});

const music = el("music");
function showPlayback(playing) {
  music.setAttribute("aria-pressed", String(playing));
  music.setAttribute(
    "aria-label",
    playing ? "Pausar música" : "Reproducir música",
  );
  music
    .querySelector("path")
    .setAttribute(
      "d",
      playing
        ? "M8 5v14 M16 5v14"
        : "M9 17V6l11-3v11 M9 9l11-3 M9 17c0 4-7 6-7 2 0-3 7-6 7-2z M20 14c0 4-7 6-7 2 0-3 7-6 7-2z",
    );
}
const song = new Howl({
  src: [datos.musica],
  html5: true,
  preload: false,
  loop: true,
  volume: 0,
  onplay() {
    showPlayback(true);
    song.fade(0, 0.4, 3000);
  },
  onpause() {
    showPlayback(false);
  },
  onloaderror: audioUnavailable,
  onplayerror: audioUnavailable,
});
function audioUnavailable() {
  showPlayback(false);
  el("status").textContent = "La música aún no está disponible.";
  setTimeout(() => {
    el("status").textContent = "";
  }, 3500);
}
function play() {
  if (song.state() === "unloaded") song.load();
  song.volume(0);
  song.play();
}
music.addEventListener("click", () => (song.playing() ? song.pause() : play()));
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let opening = false;
let finished = false;
let stopOpening;
function enter() {
  if (finished) return;
  finished = true;
  stopOpening?.();
  el("skip").hidden = true;
  el("gate").hidden = true;
  el("page").inert = false;
  document.body.classList.remove("sealed");
  music.hidden = false;
  el("cover").focus({ preventScroll: true });
  if (!reduced.matches)
    import("./effects.js").then((module) => module.decorate());
}
el("skip").addEventListener("click", enter);
el("gate").addEventListener("click", async () => {
  if (opening) return;
  opening = true;
  play();
  if (reduced.matches) return enter();
  el("skip").hidden = false;
  el("skip").focus();
  try {
    const { openEnvelope } = await import("./effects.js");
    if (!finished) stopOpening = openEnvelope(enter);
  } catch {
    enter();
  }
});
reduced.addEventListener("change", () => {
  if (reduced.matches && opening) enter();
});
