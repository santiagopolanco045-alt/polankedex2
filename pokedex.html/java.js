const listapokemon = document.querySelector("#listapokemon");
const botonesheader = document.querySelectorAll(".btn-header");
const inputbusqueda = document.querySelector("#busqueda");
const listaEquipo = document.querySelector("#lista-equipo");
const detallePokemon = document.querySelector("#detalle-pokemon");
const estadoCargando = document.querySelector("#estado-cargando");
const mensajeError = document.querySelector("#mensaje-error");
const sinResultados = document.querySelector("#sin-resultados");
const URL = "https://pokeapi.co/api/v2/pokemon/";

let miEquipo = JSON.parse(localStorage.getItem("miEquipo")) || [];
actualizarEquipo();

async function cargarIniciales() {
    try {
        estadoCargando.style.display = "block";
        mensajeError.style.display = "none";
        for (let i = 1; i <= 151; i++) {
            const res = await fetch(URL + i);
            if (!res.ok) throw new Error("Error HTTP");
            const data = await res.json();
            mostrarpokemon(data);
        }
    } catch (error) {
        mensajeError.style.display = "block";
    } finally {
        estadoCargando.style.display = "none";
    }
}

cargarIniciales();

function mostrarpokemon(poke) {
    let tipos = poke.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join("");

    const div = document.createElement("div");
    div.classList.add("pokemon");

    div.innerHTML = `
        <p class="pokemon-id-back">#${poke.id}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${poke.id}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height}M</p>
                <p class="stat">${poke.weight}kg</p>
            </div>
        </div>
    `;

    div.addEventListener("click", () => mostrarDetalle(poke));

    listapokemon.append(div);
}

function mostrarDetalle(poke) {
    let tipos = poke.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join("");
    let stats = poke.stats.map(s => `<p class="stat"><b>${s.stat.name.toUpperCase()}:</b> ${s.base_stat}</p>`).join("");

    detallePokemon.style.display = "flex";
    detallePokemon.innerHTML = `
        <div class="detalle-card">
            <button id="cerrar-detalle">X</button>
            <div class="pokemon-imagen">
                <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
            </div>
            <h2>#${poke.id} ${poke.name}</h2>
            <div class="pokemon-tipos">${tipos}</div>
            <p>${poke.height}M | ${poke.weight}kg</p>
            <div class="pokemon-stats">
                ${stats}
            </div>
            <button id="btn-agregar">Agregar al Equipo</button>
        </div>
    `;

    document.querySelector("#cerrar-detalle").addEventListener("click", () => {
        detallePokemon.style.display = "none";
    });

    document.querySelector("#btn-agregar").addEventListener("click", () => {
        agregarAlEquipo(poke);
    });
}

function agregarAlEquipo(poke) {
    if (miEquipo.length >= 6) {
        alert("¡Tu equipo ya tiene 6 Pokémon!");
        return;
    }

    let yaExiste = miEquipo.some(p => p.id === poke.id);
    if (yaExiste) {
        alert("Este Pokémon ya está en tu equipo");
        return;
    }

    miEquipo.push(poke);
    localStorage.setItem("miEquipo", JSON.stringify(miEquipo));
    actualizarEquipo();
    alert(`¡${poke.name} se unió al equipo!`);
}

function actualizarEquipo() {
    listaEquipo.innerHTML = "";

    miEquipo.forEach((poke, index) => {
        const div = document.createElement("div");
        div.classList.add("pokemon");
        div.innerHTML = `
            <div class="pokemon-imagen">
                <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
            </div>
            <div class="pokemon-info">
                <h2 class="pokemon-nombre">${poke.name}</h2>
                <button class="btn-quitar">Quitar</button>
            </div>
        `;

        div.querySelector(".btn-quitar").addEventListener("click", (e) => {
            e.stopPropagation();
            miEquipo.splice(index, 1);
            localStorage.setItem("miEquipo", JSON.stringify(miEquipo));
            actualizarEquipo();
        });

        listaEquipo.append(div);
    });
}

botonesheader.forEach(boton => boton.addEventListener("click", async (event) => {
    const botonid = event.currentTarget.id;
    listapokemon.innerHTML = "";
    estadoCargando.style.display = "block";
    mensajeError.style.display = "none";

    try {
        for (let i = 1; i <= 151; i++) {
            const res = await fetch(URL + i);
            if (!res.ok) throw new Error("Error HTTP");
            const data = await res.json();
            const tipos = data.types.map(type => type.type.name);

            if (botonid === "ver-todos" || tipos.includes(botonid)) {
                mostrarpokemon(data);
            }
        }
    } catch (error) {
        mensajeError.style.display = "block";
    } finally {
        estadoCargando.style.display = "none";
    }
}));

inputbusqueda.addEventListener("keyup", () => {
    const texto = inputbusqueda.value.toLowerCase().trim();
    const pokemones = listapokemon.querySelectorAll(".pokemon");
    let encontrados = 0;

    pokemones.forEach(poke => {
        const nombre = poke.querySelector(".pokemon-nombre").textContent.toLowerCase();
        const id = poke.querySelector(".pokemon-id").textContent.toLowerCase();

        if (nombre.includes(texto) || id.includes(texto)) {
            poke.style.display = "block";
            encontrados++;
        } else {
            poke.style.display = "none";
        }
    });

    if (encontrados === 0) {
        sinResultados.style.display = "block";
    } else {
        sinResultados.style.display = "none";
    }
});