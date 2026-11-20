
const NUMERO_WHATSAPP = "523122982723";
const ABRIR_WHATSAPP = true; 


const btn_agregar = document.querySelectorAll(".agregar");
const cantidad = document.querySelectorAll(".cantidad");
const btn_quitar = document.querySelectorAll(".quitar");
const ver_pedido = document.querySelectorAll(".ver_car");
const div = document.querySelector(".barra_carrito");
const piezas = document.getElementById("piezas");
const precio = document.querySelectorAll(".precio");
const total = document.getElementById("total");
const lista = document.getElementById("lista");
const nm_flor = document.querySelectorAll(".nm_flor");
const precio_f = document.getElementById("final");
const btn_enviar = document.querySelector(".btn-enviar");
const entrega = document.getElementById("entrega");
const bloqueDireccion = document.getElementById("bloqueDireccion");
const inputFecha = document.getElementById("fecha");

let suma_total = 0;
piezas.textContent = "0";

btn_agregar.forEach(function (boton, i) {
    boton.addEventListener("click", function () {
        let numero = Number(cantidad[i].textContent);
        numero += 1;
        cantidad[i].textContent = numero;
    });
});

btn_quitar.forEach(function (boton, i) {
    boton.addEventListener("click", function () {
        let numero = Number(cantidad[i].textContent);
        if (numero > 0) { numero -= 1; }
        cantidad[i].textContent = numero;
    });
});

ver_pedido.forEach(function (boton, i) {
    boton.addEventListener("click", function () {
        if (Number(cantidad[i].textContent) === 0) {
            alert("No se ha agregado ningún producto");
            return;
        }
        const numero = Number(cantidad[i].textContent);
        const dinero = Number(precio[i].dataset.precio);
        const pedido = nm_flor[i].textContent;

        suma_total += dinero * numero;
        piezas.textContent = Number(piezas.textContent) + numero;
        div.classList.replace("barra_carrito", "visible");
        cantidad[i].textContent = "0";

        // Cada línea del carrito guarda sus datos para poder restarlos o enviarlos
        const li = document.createElement("li");
        li.className = "listo";
        li.dataset.nombre = pedido;
        li.dataset.precio = dinero * numero;
        li.dataset.piezas = numero;
        li.append(pedido + " x " + numero + " ");
        const borrar = document.createElement("button");
        borrar.className = "eliminar quit";
        borrar.textContent = "🗑️";
        li.append(borrar);
        lista.append(li);

        actualizarTotales();
    });
});

lista.addEventListener("click", function (e) {
    if (e.target.classList.contains("quit")) {
        const li = e.target.closest("li");
        suma_total -= Number(li.dataset.precio);
        piezas.textContent = Number(piezas.textContent) - Number(li.dataset.piezas);
        li.remove();
        actualizarTotales();
        if (Number(piezas.textContent) === 0) {
            div.classList.replace("visible", "barra_carrito");
        }
    }
});

function actualizarTotales() {
    total.textContent = suma_total.toFixed(2);
    precio_f.textContent = "Total: $" + suma_total.toFixed(2);
}

function reiniciarCarrito() {
    lista.innerHTML = "";
    suma_total = 0;
    piezas.textContent = "0";
    actualizarTotales();
    div.classList.replace("visible", "barra_carrito");
}

entrega.addEventListener("change", function () {
    bloqueDireccion.style.display = entrega.value === "Envío a domicilio" ? "block" : "none";
});

inputFecha.min = new Date().toLocaleDateString("en-CA"); // formato AAAA-MM-DD

btn_enviar.addEventListener("click", async function () {
    const items = lista.querySelectorAll("li");
    const nombre = document.getElementById("nombreCliente").value.trim();
    const telefono = document.getElementById("telefono").value.replace(/\D/g, ""); // solo números
    const tipoEntrega = entrega.value;
    const direccion = document.getElementById("direccion").value.trim();
    const fecha = inputFecha.value;
    const notas = document.getElementById("notas").value.trim();
    const pago = document.getElementById("pago").value;

    if (items.length === 0) { alert("Agrega al menos una flor al carrito."); return; }
    if (nombre === "") { alert("Escribe tu nombre."); return; }
    if (telefono.length < 10 || telefono.length > 15) { alert("Escribe un teléfono válido de 10 dígitos."); return; }
    if (tipoEntrega === "Envío a domicilio" && direccion === "") { alert("Escribe la dirección de entrega."); return; }
    if (pago === "") { alert("Elige la forma de pago."); return; }

    const productos = [];
    items.forEach(function (li) {
        productos.push({
            nombre: li.dataset.nombre,
            cantidad: Number(li.dataset.piezas),
            subtotal: Number(li.dataset.precio)
        });
    });

    btn_enviar.disabled = true;
    btn_enviar.textContent = "Enviando...";

    const { error } = await db.from("pedidos").insert({
        cliente: nombre,
        telefono: telefono,
        entrega: tipoEntrega,
        direccion: tipoEntrega === "Envío a domicilio" ? direccion : null,
        fecha_entrega: fecha || null,
        notas: notas || null,
        pago: pago,
        productos: productos,
        total: suma_total
    });

    btn_enviar.disabled = false;
    btn_enviar.textContent = "ENVIAR PEDIDO";

    if (error) {
        alert("No se pudo enviar el pedido. Intenta de nuevo.\n(" + error.message + ")");
        return;
    }

    let mensaje = "Hola, hice un pedido en la página:\n";
    productos.forEach(function (p) {
        mensaje += "- " + p.nombre + " x" + p.cantidad + " ($" + p.subtotal + ")\n";
    });
    mensaje += "Total: $" + suma_total.toFixed(2) + "\n";
    mensaje += "Nombre: " + nombre + "\n";
    mensaje += "Entrega: " + tipoEntrega + (tipoEntrega === "Envío a domicilio" ? " - " + direccion : "") + "\n";
    if (fecha) { mensaje += "Fecha: " + fecha + "\n"; }
    mensaje += "Pago: " + pago;
    if (notas) { mensaje += "\nNotas: " + notas; }

    reiniciarCarrito();
    document.getElementById("nombreCliente").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("direccion").value = "";
    inputFecha.value = "";
    document.getElementById("notas").value = "";
    document.getElementById("pago").value = "";

    alert("¡Pedido enviado! Gracias por tu compra 🌸");

    if (ABRIR_WHATSAPP) {
        window.location.href = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
    }
});
