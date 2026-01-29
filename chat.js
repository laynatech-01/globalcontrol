console.log("chat.js cargado");

const API_URL = "https://hf-api.eligiolayna01.workers.dev";
let PROMPT_BASE = "";

document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("user-input");
    const button = document.getElementById("send-btn");

    button.addEventListener("click", enviarMensaje);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviarMensaje();
    });

    await cargarPrompt();
    setEstado("Sistema listo");
});

async function cargarPrompt() {
    try {
        // Cargamos el JSON combinado con toda la descripción de equipos
        const r = await fetch("conocimiento.json");
        const data = await r.json();
        PROMPT_BASE = JSON.stringify(data); 
        console.log("Conocimiento técnico cargado");
    } catch {
        PROMPT_BASE = "";
        console.warn("No se pudo cargar conocimiento.json");
    }
}

function setEstado(texto, error = false) {
    const e = document.getElementById("status-monitor");
    e.innerText = "Estado: " + texto;
    e.style.color = error ? "red" : "lime";
}

async function enviarMensaje() {
    const input = document.getElementById("user-input");
    const texto = input.value.trim();
    if (!texto) return;

    agregarMensaje(texto, "user-msg");
    input.value = "";

    const id = "bot_" + Date.now();
    agregarMensaje("Analizando...", "bot-msg", id);
    setEstado("Consultando...");

    try {
        const r = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pregunta: texto,
                prompt: PROMPT_BASE // Enviamos toda la base de datos de equipos
            })
        });

        const data = await r.json();
        document.getElementById(id).innerText = data.answer || "No encontré detalles sobre eso en mi base de datos.";
        setEstado("Listo");
    } catch (e) {
        document.getElementById(id).innerText = "Error de conexión";
        setEstado("Error", true);
    }
}

function agregarMensaje(texto, clase, id = null) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = "msg " + clase;
    div.innerText = texto;
    if (id) div.id = id;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}