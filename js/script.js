const selectorTamanio = document.querySelector('#tamanio');
const selectorFormato = document.querySelector('#formato');
const botonGenerar = document.querySelector('#generar');
const botonGuardar = document.querySelector('#guardar');
const listaPaleta = document.querySelector('#paleta');
const listaGuardadas = document.querySelector('#guardadas');
const elementoAviso = document.querySelector('#aviso');

const CANDADO_CERRADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><patrue"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0h d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const CANDADO_ABIERTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>';

let colores = [];
/*------------ Eventos ------------*/
botonGenerar.addEventListener('click', generarPaleta);
botonGuardar.addEventListener('click', guardarPaleta);
selectorTamanio.addEventListener('change', cambiarTamanio);
selectorFormato.addEventListener('change', dibujarPaleta);

function generarPaleta() {
    const cantidad = Number(selectorTamanio.value);
    const nuevos = [];

    for(let i = 0; i < cantidad; i++) {
        if(i < colores.length && colores[i].bloqueado) {
            nuevos.push(colores[i]);
        } else {
            nuevos.push(colorAleatorio());
        }
    }
}

colores = nuevos;
dibujarPaleta();

