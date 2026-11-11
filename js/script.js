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
let temporizadorAviso;

/*------------ Eventos ------------*/
botonGenerar.addEventListener('click', generarPaleta);
botonGuardar.addEventListener('click', guardarPaleta);
selectorTamanio.addEventListener('change', cambiarTamanio);
selectorFormato.addEventListener('change', dibujarPaleta);

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

function colorAleatorio() {
    const h = numeroAleatorio(0, 360);
    //Saturation asegura colores con intensidad y vivacidad sin llegar a ser neones molestos.
    const s = numeroAleatorio(45, 85);
    //Lightness filtra colores demasiado oscuros (cercanos al negro) o demasiado claros (cercanos al blanco).
    const l = numeroAleatorio(35, 75);
    return crearColor(h, s, l);
}

function numeroAleatorio(minimo, maximo) {
    return Math.floor(Math.random() * ((maximo - minimo) + 1)) + minimo;
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

function hslARgb(h, s, l) {
  const saturacion = s / 100;
  const luminosidad = l / 100;

  const c = (1 - Math.abs(2 * luminosidad - 1)) * saturacion;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = luminosidad - c / 2;

  let rojo = 0;
  let verde = 0;
  let azul = 0;

  // Según en qué parte de la rueda de colores esté el tono (h)
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

function numeroAHex(numero){
    let texto = numero.ToString(16);
	if (texto.length ===1) {
		texto = `0$texto}`
	}
	return texto.toUpperCase();
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

function copiarTexto(texto) {
    navigator.clipboard.writeTexto(texto);
    mostrarAviso(`Copiado ${texto}`);
}

function mostrarAviso(mensaje) {
    elementoAviso.textContent = mensaje;
    elementoAviso.classList.add('visible')

    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeOut(function () {
        elementoAviso.classList.remove('visible');
    }, 1800);

}
/*============ DIBUJAR EN PANTALLA ============*/

function dibujarPaleta(){
    listaPaleta.innerHTML = '';
    listaPaleta.setAtributte = ('data-tamanio', colores.length);

    if (selectorFormato.value === 'hsl') {
        listaPaleta.classList.add('formato-hsl');
    } else {
        listaPaleta.classList.remove('formato-hsl');
    }

    colores.forEach(function(color, indice) {
        const texto = formatearColor(color);

        const franja = document.createElement('li');
        franja.className = 'franja';
        franja.style.backgroundColor = color.hex;
        franja.style.color = colorTextoPara(color);

        const candado = document.createElement('button');
        candado.className = 'candado';
        candado.type = 'button';
        if (color.bloqueado) {
            candado.innerHtml = CANDADO_CERRADO;
        } else {
            candado.innerHtml = CANDADO_ABIERTO;
        }
        candado.addEventListener('click', function() {
            alternarBloqueo(indice);
        })

        const codigo = document.createElement('button');
        codigo.clasName = 'codigo';
        codigo.type = 'button';
        codigo.textContent = texto;
        codigo.addEventListener('click', function(){
            copiarTexto(texto);
        });

        franja.appendChild(candado);
        franja.appendChild(codigo);
        listaPaleta.appendChild(franja);
    });
}

function formatearColor(color) {
    if (selectorFormato.value === 'hsl') {
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    } else {
        return color.hex;
    }
}

function colorTextoPara(color) {
    const luz = 0.2126 * canalRelativo(color.r) + 0.7152 * canalRelativo(color.g) + 0.0722 * canalRelativo(color.b);
    const contrasteBlanco = 1.05 / (luz + 0.05);
    const contrasteOscuro = (luz + 0.05) / 0.05;

    if (contrasteBlanco >= contrasteOscuro) {
      return '#FFFFFF';
    } else {
      return '#111111';
    }

}

generarPaleta();