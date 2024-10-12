class Jugador {
    constructor(nombre, turno = false, eliminado = false) {
        this.nombre = nombre;
        this.turno = turno;
        this.eliminado = eliminado;
        this.cartas = [];
    }

    // Método para contar las cartas de desactivación
    numCartasDesactivar() {
        return this.cartas.filter(carta => carta.tipo === "Desactivador").length;
    }

    // Método para eliminar todas las cartas de desactivación
    gastarCartasDesactivar() {
        this.cartas = this.cartas.filter(carta => carta.tipo !== "Desactivador");
    }

    // Método para contar las cartas de "Saltar turno"
    numCartasSaltoTurno() {
        return this.cartas.filter(carta => carta.tipo === "Saltar turno").length;
    }

    // Método para eliminar una carta de "Saltar turno"
    gastarCartaSaltarTurno() {
        const index = this.cartas.findIndex(carta => carta.tipo === "Saltar turno");
        if (index !== -1) {
            this.cartas.splice(index, 1); // Elimina solo una carta de "Saltar turno"
        }
    }

    // Obtener puntos totales
    getPuntosTotales() {
        return this.cartas.reduce((total, carta) => total + (carta.tipo === "Puntos" ? carta.valor : 0), 0);
    }
}

class Carta {
    constructor(tipo, valor = null) {
        this.tipo = tipo;
        this.valor = valor;
    }

    getImagen() {
        // Obtener la ruta de la imagen según el tipo de carta
        switch (this.tipo) {
            case "Bomba":
                return "./img/bomba/bomba.png"; // Asegúrate de tener la imagen en esta ruta
            case "Desactivador":
                return "./img/herramienta/herramienta.png"; // Asegúrate de tener la imagen en esta ruta
            case "Saltar turno":
                return "./img/pasarTurno/pasarTurno.png"; // Asegúrate de tener la imagen en esta ruta
            case "Puntos":
                return getRandomPathImg(); // Ruta para las cartas de robots
            default:
                return "";
        }
    }
}

let jugadores = [];
let baraja = [];
let jugadorActualIndex = 0;

// Iniciar juego
function iniciarJuego() {
    // Crear jugadores
    jugadores.push(new Jugador("Jugador 1"));
    jugadores.push(new Jugador("Jugador 2"));
    jugadores.push(new Jugador("Jugador 3"));

    // Crear y mezclar baraja
    baraja = crearBaraja();
    mostrarBaraja(); // Mostrar la baraja en la consola

    // Iniciar turnos
    jugadores[jugadorActualIndex].turno = true;

    actualizarInterfaz();
}

function crearBaraja() {
    const baraja = [];
    
    // Agregar cartas bomba
    for (let i = 0; i < 6; i++) {
        baraja.push(new Carta("Bomba"));
    }

    // Agregar cartas desactivación
    for (let i = 0; i < 6; i++) {
        baraja.push(new Carta("Desactivador"));
    }

    // Agregar cartas saltar turno
    for (let i = 0; i < 10; i++) {
        baraja.push(new Carta("Saltar turno"));
    }

    // Agregar cartas de puntos
    for (let i = 0; i < 33; i++) {
        const valor = Math.floor(Math.random() * 10) + 1;
        baraja.push(new Carta("Puntos", valor));
    }

    // Mezclar cartas
    return mezclarBaraja(baraja);
}

function mezclarBaraja(baraja) {
    for (let i = baraja.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
    }
    return baraja;
}

// Nuevo método para mostrar la baraja en la consola
function mostrarBaraja() {
    console.log("Baraja creada:", baraja);
}

function actualizarInterfaz() {
    // Actualiza las estadísticas de los jugadores
    jugadores.forEach((jugador, index) => {
        const jugadorElement = document.querySelector(`.contenedorJugador:nth-child(${index + 1})`);
        
        // Limpiar clases anteriores
        jugadorElement.classList.remove('jugadorTurno', 'jugadorEliminado');

        // Asignar clase según el estado del jugador
        if (jugador.eliminado) {
            jugadorElement.classList.add('jugadorEliminado');
        } else if (jugador.turno) {
            jugadorElement.classList.add('jugadorTurno');
        }

        // Actualizar estadísticas
        document.getElementById(`J${index + 1}NumCartas`).textContent = `⚪️ Número de cartas: ${jugador.cartas.length}`;
        document.getElementById(`J${index + 1}Puntos`).textContent = `⚪️ Puntos totales: ${jugador.getPuntosTotales()}`;
        document.getElementById(`J${index + 1}saltoTurno`).textContent = `⚪️ Cartas salto turno: ${jugador.numCartasSaltoTurno()}`;
        document.getElementById(`J${index + 1}Desactivacion`).textContent = `⚪️ Cartas desactivación: ${jugador.numCartasDesactivar()}`;
    });

    // Actualiza el estado del botón de pasar
    document.getElementById("btnPasar").disabled = jugadores[jugadorActualIndex].numCartasSaltoTurno() === 0;
}

function robarCarta() {
    if (baraja.length === 0) {
        alert("No quedan cartas en el mazo.");
        return;
    }

    const cartaRobada = baraja.pop();
    const jugadorActual = jugadores[jugadorActualIndex];

    jugadorActual.cartas.push(cartaRobada);
    
    // Mostrar la imagen de la carta robada
    const imgCartaRobada = document.getElementById("imgCartaRobada");
    imgCartaRobada.src = cartaRobada.getImagen();

    // Lógica para manejar el robo de la carta
    if (cartaRobada.tipo === "Bomba") {
        if (jugadorActual.numCartasDesactivar() > 0) {
            jugadorActual.gastarCartasDesactivar();
            alert(`${jugadorActual.nombre} ha desactivado la bomba!`);
            // Mover bomba y desactivador a descarte
        } else {
            alert(`${jugadorActual.nombre} ha robado una bomba y ha sido eliminado!`);
            jugadorActual.eliminado = true;
            // Actualizar descarte y eliminar jugador
        }
    }

    // Cambiar al siguiente jugador
    cambiarTurno();
}

function getRandomPathImg(){
    let random = Math.floor(Math.random() * 20) + 1;
    if (random < 10) {
        return `./img/card/robot_0${random}.png`;
    }
    return `./img/card/robot_${random}.png`;
}

function cambiarTurno() {
    jugadores[jugadorActualIndex].turno = false;
    jugadorActualIndex = (jugadorActualIndex + 1) % jugadores.length;

    // Encontrar el siguiente jugador que no esté eliminado
    while (jugadores[jugadorActualIndex].eliminado) {
        jugadorActualIndex = (jugadorActualIndex + 1) % jugadores.length;
    }
    jugadores[jugadorActualIndex].turno = true;

    // Comprobar condiciones de victoria
    comprobarCondicionesVictoria();
    actualizarInterfaz();
}

function comprobarCondicionesVictoria() {
    const jugadoresEliminados = jugadores.filter(jugador => jugador.eliminado);
    if (jugadoresEliminados.length === jugadores.length - 1) {
        const ganador = jugadores.find(jugador => !jugador.eliminado);
        alert(`${ganador.nombre} ha ganado!`);
        // Mostrar botón de reinicio
        mostrarBotonReinicio();
    } else if (baraja.length === 0) {
        // Si no quedan cartas en el mazo
        const ganador = jugadores.reduce((a, b) => (a.getPuntosTotales() > b.getPuntosTotales() ? a : b));
        alert(`${ganador.nombre} ha ganado por puntos!`);
        mostrarBotonReinicio();
    }
}

function mostrarBotonReinicio() {
    const btnRobar = document.getElementById("btnRobar");
    btnRobar.style.display = "none";

    const btnReiniciar = document.createElement("button");
    btnReiniciar.textContent = "Jugar de nuevo";
    btnReiniciar.onclick = reiniciarJuego;
    document.getElementById("contenedorAcciones").appendChild(btnReiniciar);
    btnReiniciar.setAttribute("id", "btnReiniciar");
}

function reiniciarJuego() {
    window.location.reload();
}

// Vincular botones a funciones
document.getElementById("btnRobar").addEventListener("click", robarCarta);
document.getElementById("btnPasar").addEventListener("click", cambiarTurno);

// Iniciar el juego al cargar la página
window.onload = iniciarJuego;

