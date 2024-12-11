document.addEventListener("DOMContentLoaded", () => {
    const pantalla = document.getElementById("resultado");
    const historial = document.getElementById("historial");
    const botonesTema = document.querySelectorAll('.boton-tema');
    let operacionActual = "0";
    let operacionAnterior = "";
    let operador = "";
    let reiniciarPantalla = false;

    // Gestión de temas
    const temaGuardado = localStorage.getItem('calculadoraTema') || '1';
    document.body.className = `tema-${temaGuardado}`;
    botonesTema.forEach(boton => {
        if (boton.dataset.tema === temaGuardado) {
            boton.classList.add('activo');
        }
    });

    botonesTema.forEach(boton => {
        boton.addEventListener('click', () => {
            botonesTema.forEach(b => b.classList.remove('activo'));
            boton.classList.add('activo');
            const tema = boton.dataset.tema;
            document.body.className = `tema-${tema}`;
            localStorage.setItem('calculadoraTema', tema);
        });
    });

    // Manejo del teclado físico
    document.addEventListener("keydown", (e) => {
        const tecla = e.key;

        if (/[0-9.]/.test(tecla)) {
            e.preventDefault();
            procesarNumero(tecla);
        } else if (["+", "-", "*", "/"].includes(tecla)) {
            e.preventDefault();
            procesarOperador(tecla);
        } else if (tecla === "Enter" || tecla === "=") {
            e.preventDefault();
            calcularResultado();
        } else if (tecla === "Backspace") {
            e.preventDefault();
            borrarUltimo();
        } else if (tecla === "Escape") {
            e.preventDefault();
            resetearCalculadora();
        }
    });

    // Manejo de clics
    document.querySelector(".teclado").addEventListener("click", (e) => {
        if (!e.target.matches("button")) return;

        const tecla = e.target;
        const valor = tecla.dataset.valor;
        const accion = tecla.dataset.accion;

        if (valor) {
            if (!isNaN(valor) || valor === ".") {
                procesarNumero(valor);
            } else if (["+", "-", "*", "/"].includes(valor)) {
                procesarOperador(valor);
            } else if (valor === "=") {
                calcularResultado();
            }
        } else if (accion) {
            if (accion === "borrar") {
                borrarUltimo();
            } else if (accion === "reset") {
                resetearCalculadora();
            }
        }
    });

    function procesarNumero(numero) {
        if (reiniciarPantalla) {
            pantalla.textContent = numero;
            reiniciarPantalla = false;
        } else {
            if (pantalla.textContent === "0" && numero !== ".") {
                pantalla.textContent = numero;
            } else {
                if (numero === "." && pantalla.textContent.includes(".")) return;
                if (pantalla.textContent.length >= 12) return;
                pantalla.textContent += numero;
            }
        }
        operacionActual = pantalla.textContent;
    }

    function procesarOperador(op) {
        if (operacionActual === "") return;

        if (operacionAnterior !== "") {
            calcularResultado();
        }

        operador = op;
        operacionAnterior = operacionActual;
        historial.textContent = `${formatearNumero(operacionAnterior)} ${operador}`;
        reiniciarPantalla = true;
    }

    function calcularResultado() {
        if (operacionAnterior === "" || operacionActual === "") return;

        try {
            const anterior = parseFloat(operacionAnterior);
            const actual = parseFloat(operacionActual);
            let resultado;

            switch (operador) {
                case "+":
                    resultado = anterior + actual;
                    break;
                case "-":
                    resultado = anterior - actual;
                    break;
                case "*":
                    resultado = anterior * actual;
                    break;
                case "/":
                    if (actual === 0) throw new Error("División por cero");
                    resultado = anterior / actual;
                    break;
                default:
                    return;
            }

            resultado = formatearNumero(resultado);
            historial.textContent = `${formatearNumero(anterior)} ${operador} ${formatearNumero(actual)} =`;
            pantalla.textContent = resultado;
            operacionActual = resultado;
            operacionAnterior = "";
            reiniciarPantalla = true;
            
        } catch (error) {
            pantalla.textContent = "Error";
            historial.textContent = error.message;
            resetearCalculadora();
        }
    }

    function formatearNumero(numero) {
        let num = Number(numero);
        if (isNaN(num)) return "Error";
        
        let resultado = num.toFixed(8);
        resultado = parseFloat(resultado).toString();
        
        if (resultado.length > 12) {
            if (resultado.includes('e')) {
                return resultado.slice(0, 12);
            }
            return parseFloat(numero).toPrecision(8);
        }
        
        return resultado;
    }

    function borrarUltimo() {
        if (pantalla.textContent === "Error" || 
            pantalla.textContent.length === 1) {
            pantalla.textContent = "0";
        } else {
            pantalla.textContent = pantalla.textContent.slice(0, -1);
        }
        operacionActual = pantalla.textContent;
    }

    function resetearCalculadora() {
        pantalla.textContent = "0";
        historial.textContent = "";
        operacionActual = "0";
        operacionAnterior = "";
        operador = "";
        reiniciarPantalla = false;
    }
});