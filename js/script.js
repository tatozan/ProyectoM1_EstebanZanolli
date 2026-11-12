/* ==========================================================================
   Elementos del DOM
   ========================================================================== */

const selectorTamanio = document.querySelector('#tamanio');
const selectorFormato = document.querySelector('#formato');
const botonGenerar = document.querySelector('#generar');
const botonGuardar = document.querySelector('#guardar');
const listaPaleta = document.querySelector('#paleta');
const listaGuardadas = document.querySelector('#guardadas');
const elementoAviso = document.querySelector('#aviso');

/* ==========================================================================
   Constantes
   ========================================================================== */

const CANDADO_CERRADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const CANDADO_ABIERTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>';
const CLAVE_ALMACENAMIENTO = 'colorfly-paletas';
const MAX_GUARDADAS = 6;

/* ==========================================================================
   Estado de la aplicación
   ========================================================================== */

let colores = [];
let temporizadorAviso;

/* ==========================================================================
   Generación de colores
   ========================================================================== */

function numeroAleatorio(minimo, maximo) {
    return Math.floor(Math.random() * ((maximo - minimo) + 1)) + minimo;
}

function hslARgb(h, s, l) {
    const saturacion = s / 100;
    const luminosidad = l / 100;

    const c = (1 - Math.abs(2 * luminosidad - 1)) * saturacion;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = luminosidad - c / 2;

    let rojo = 0;
    let verde = 0;
    let azul = 0;

    // La rueda de colores se divide en 6 tramos de 60 grados: en cada uno domina un canal distinto
    if (h < 60) {
        rojo = c;
        verde = x;
    } else if (h < 120) {
        rojo = x;
        verde = c;
    } else if (h < 180) {
        verde = c;
        azul = x;
    } else if (h < 240) {
        verde = x;
        azul = c;
    } else if (h < 300) {
        rojo = x;
        azul = c;
    } else {
        rojo = c;
        azul = x;
    }

    return {
        r: Math.round((rojo + m) * 255),
        g: Math.round((verde + m) * 255),
        b: Math.round((azul + m) * 255)
    };
}

function numeroAHex(numero) {
    let texto = numero.toString(16);

    if (texto.length === 1) {
        texto = `0${texto}`;
    }
    return texto.toUpperCase();
}

function crearColor(h, s, l) {
    const rgb = hslARgb(h, s, l);

    return {
        h: h,
        s: s,
        l: l,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        hex: `#${numeroAHex(rgb.r)}${numeroAHex(rgb.g)}${numeroAHex(rgb.b)}`,
        bloqueado: false
    };
}

function colorAleatorio() {
    const h = numeroAleatorio(0, 360);
    // Saturación y luminosidad acotadas para evitar grises, neones y colores casi negros o blancos
    const s = numeroAleatorio(45, 85);
    const l = numeroAleatorio(35, 75);

    return crearColor(h, s, l);
}

/* ==========================================================================
   Formato y contraste
   ========================================================================== */

function formatearColor(color) {
    if (selectorFormato.value === 'hsl') {
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    } else {
        return color.hex;
    }
}

function canalRelativo(valor) {
    const c = valor / 255;

    if (c <= 0.03928) {
        return c / 12.92;
    } else {
        return Math.pow((c + 0.055) / 1.055, 2.4);
    }
}

// Elige blanco o negro según cuál contraste mejor con el fondo (fórmula de accesibilidad WCAG)
function colorTextoPara(color) {
    const luz = 0.2126 * canalRelativo(color.r) + 0.7152 * canalRelativo(color.g) + 0.0722 * canalRelativo(color.b);
    const contrasteBlanco = 1.05 / (luz + 0.05);
    const contrasteOscuro = (luz + 0.05) / 0.05;

    if (contrasteBlanco >= contrasteOscuro) {
        return '#FFFFFF';
    } else {
        return '#000000';
    }
}

/* ==========================================================================
   Acciones sobre la paleta
   ========================================================================== */

// Cambia todos los colores, menos los que tienen el candado cerrado
function generarPaleta() {
    const cantidad = Number(selectorTamanio.value);
    const nuevos = [];

    for (let i = 0; i < cantidad; i++) {
        if (i < colores.length && colores[i].bloqueado) {
            nuevos.push(colores[i]);
        } else {
            nuevos.push(colorAleatorio());
        }
    }

    colores = nuevos;
    dibujarPaleta();
}

// Conserva los colores que ya había y agrega los que falten
function cambiarTamanio() {
    const cantidad = Number(selectorTamanio.value);
    const nuevos = [];

    for (let i = 0; i < cantidad; i++) {
        if (i < colores.length) {
            nuevos.push(colores[i]);
        } else {
            nuevos.push(colorAleatorio());
        }
    }

    colores = nuevos;
    dibujarPaleta();
}

function alternarBloqueo(indice) {
    if (colores[indice].bloqueado) {
        colores[indice].bloqueado = false;
        dibujarPaleta();
        mostrarAviso('Color desbloqueado');
    } else {
        colores[indice].bloqueado = true;
        dibujarPaleta();
        mostrarAviso('Color bloqueado');
    }
}

/* ==========================================================================
   Dibujo en pantalla
   ========================================================================== */

function dibujarPaleta() {
    listaPaleta.innerHTML = '';
    listaPaleta.setAttribute('data-tamanio', colores.length);

    if (selectorFormato.value === 'hsl') {
        listaPaleta.classList.add('formato-hsl');
    } else {
        listaPaleta.classList.remove('formato-hsl');
    }

    colores.forEach(function (color, indice) {
        const texto = formatearColor(color);

        const franja = document.createElement('li');
        franja.className = 'franja';
        franja.style.backgroundColor = color.hex;
        franja.style.color = colorTextoPara(color);

        const candado = document.createElement('button');
        candado.className = 'candado';
        candado.type = 'button';
        if (color.bloqueado) {
            candado.innerHTML = CANDADO_CERRADO;
            candado.setAttribute('aria-label', `Desbloquear color ${texto}`);
        } else {
            candado.innerHTML = CANDADO_ABIERTO;
            candado.setAttribute('aria-label', `Bloquear color ${texto}`);
        }
        candado.addEventListener('click', function () {
            alternarBloqueo(indice);
        });

        const codigo = document.createElement('button');
        codigo.className = 'codigo';
        codigo.type = 'button';
        codigo.textContent = texto;
        codigo.setAttribute('aria-label', `Copiar ${texto}`);
        codigo.addEventListener('click', function () {
            copiarTexto(texto);
        });

        franja.appendChild(candado);
        franja.appendChild(codigo);
        listaPaleta.appendChild(franja);
    });
}

function dibujarGuardadas() {
    listaGuardadas.innerHTML = '';
    const guardadas = cargarGuardadas();

    guardadas.forEach(function (paleta, indice) {
        const item = document.createElement('li');

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.setAttribute('aria-label', `Cargar paleta guardada ${indice + 1}`);

        paleta.forEach(function (c) {
            const muestra = document.createElement('span');
            muestra.style.backgroundColor = crearColor(c.h, c.s, c.l).hex;
            boton.appendChild(muestra);
        });

        boton.addEventListener('click', function () {
            cargarPaleta(paleta);
        });

        item.appendChild(boton);
        listaGuardadas.appendChild(item);
    });
}

/* ==========================================================================
   Avisos y portapapeles
   ========================================================================== */

function mostrarAviso(mensaje) {
    elementoAviso.textContent = mensaje;
    elementoAviso.classList.add('visible');

    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () {
        elementoAviso.classList.remove('visible');
    }, 1800);
}

function copiarTexto(texto) {
    navigator.clipboard.writeText(texto);
    mostrarAviso(`Copiado ${texto}`);
}

/* ==========================================================================
   Paletas guardadas (localStorage)
   ========================================================================== */

// localStorage solo guarda texto: JSON.stringify para guardar y JSON.parse para leer
function cargarGuardadas() {
    const textoGuardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (textoGuardado === null) {
        return [];
    } else {
        return JSON.parse(textoGuardado);
    }
}

// De cada color se guardan solo h, s y l: con eso crearColor reconstruye el resto
function guardarPaleta() {
    const guardadas = cargarGuardadas();

    const paletaNueva = [];
    colores.forEach(function (color) {
        paletaNueva.push({ h: color.h, s: color.s, l: color.l });
    });

    guardadas.unshift(paletaNueva);
    if (guardadas.length > MAX_GUARDADAS) {
        guardadas.pop();
    }

    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(guardadas));
    dibujarGuardadas();
    mostrarAviso('Paleta guardada');
}

function cargarPaleta(paletaGuardada) {
    selectorTamanio.value = paletaGuardada.length;

    colores = [];
    paletaGuardada.forEach(function (c) {
        colores.push(crearColor(c.h, c.s, c.l));
    });

    dibujarPaleta();
}

/* ==========================================================================
   Eventos
   ========================================================================== */

botonGenerar.addEventListener('click', generarPaleta);
botonGuardar.addEventListener('click', guardarPaleta);
selectorTamanio.addEventListener('change', cambiarTamanio);
selectorFormato.addEventListener('change', dibujarPaleta);

/* ==========================================================================
   Inicialización
   ========================================================================== */

generarPaleta();
dibujarGuardadas();
