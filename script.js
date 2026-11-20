// ==================== AJUSTES ====================
const NUMERO_WHATSAPP = "523122982723";
const ABRIR_WHATSAPP = true; // true = al guardar el pedido, abre WhatsApp con el resumen

// ==================== ELEMENTOS ====================
const catalogo = document.getElementById("catalogo");
const div = document.querySelector(".barra_carrito");
const piezas = document.getElementById("piezas");
const total = document.getElementById("total");
const lista = document.getElementById("lista");
const precio_f = document.getElementById("final");
const btn_enviar = document.querySelector(".btn-enviar");
const entrega = document.getElementById("entrega");
const bloqueDireccion = document.getElementById("bloqueDireccion");
const inputFecha = document.getElementById("fecha");

let suma_total = 0;
piezas.textContent = "0";

// Ayudante para crear elementos: el("p", { textContent: "hola" })
function el(tag, props) {
    const e = document.createElement(tag);
    Object.assign(e, props || {});
    return e;
}

// ==================== CATÁLOGO DESDE SUPABASE ====================
// Cada flor se dibuja con el mismo HTML que tenías a mano, así que tu CSS no cambia.
async function cargarCatalogo() {
    const { data, error } = await db.from("flores").select("*").order("id");
    catalogo.textContent = "";

    if (error) {
        catalogo.append(el("p", { className: "aviso_catalogo", textContent: "No se pudo cargar el catálogo. Recarga la página." }));
        return;
    }
    if (data.length === 0) {
        catalogo.append(el("p", { className: "aviso_catalogo", textContent: "Pronto agregaremos flores." }));
        return;
    }
    data.forEach(function (flor) { catalogo.append(crearTarjeta(flor)); });
}

function crearTarjeta(f) {
    const tarjeta = el("article");

    // Solo nombres de archivo normales (sin rutas raras)
    if (f.imagen && /^[\w.\- ]+$/.test(f.imagen)) {
        tarjeta.append(el("img", { src: f.imagen, alt: f.nombre }));
    }

    const nombre = el("h3", { className: "nm_flor", textContent: f.nombre });
    const precio = el("p", {
        className: "precio",
        textContent: "$" + Number(f.precio) + " " + (f.unidad || "c/u")
    });
    precio.dataset.precio = Number(f.precio);
    const descripcion = el("p", { textContent: f.descripcion || "" });

    const quitar = el("button", { className: "quitar", textContent: "-" });
    const cantidad = el("span", { className: "cantidad", textContent: "0" });
    const agregar = el("button", { className: "agregar", textContent: "+" });
    const alCarrito = el("button", { className: "pal_carrito ver_car", textContent: "Agregar al carrito" });

    tarjeta.append(nombre, precio, descripcion, quitar, cantidad, agregar, alCarrito);

    // Si en el admin la marcaste como no disponible
    if (f.disponible === false) {
        tarjeta.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
        tarjeta.style.opacity = "0.5";
        tarjeta.append(el("p", { textContent: "❌ No disponible por ahora", style: "font-weight:bold" }));
    }
    return tarjeta;
}

// ==================== BOTONES DEL CATÁLOGO (un solo listener) ====================
catalogo.addEventListener("click", function (e) {
    const boton = e.target.closest("button");
    if (!boton || boton.disabled) return;
    const tarjeta = boton.closest("article");
    if (!tarjeta) return;

    const cantidad = tarjeta.querySelector(".cantidad");
    let numero = Number(cantidad.textContent);

    if (boton.classList.contains("agregar")) {
        cantidad.textContent = numero + 1;

    } else if (boton.classList.contains("quitar")) {
        if (numero > 0) { cantidad.textContent = numero - 1; }

    } else if (boton.classList.contains("ver_car")) {
        if (numero === 0) {
            alert("No se ha agregado ningún producto");
            return;
        }
        agregarAlCarrito(
            tarjeta.querySelector(".nm_flor").textContent,
            Number(tarjeta.querySelector(".precio").dataset.precio),
            numero
        );
        cantidad.textContent = "0";
    }
});

// ==================== CARRITO ====================
function agregarAlCarrito(nombre, dinero, numero) {
    suma_total += dinero * numero;
    piezas.textContent = Number(piezas.textContent) + numero;
    div.classList.replace("barra_carrito", "visible");

    // Cada línea del carrito guarda sus datos para poder restarlos o enviarlos
    const li = el("li", { className: "listo" });
    li.dataset.nombre = nombre;
    li.dataset.precio = dinero * numero;
    li.dataset.piezas = numero;
    li.append(nombre + " x " + numero + " ");
    li.append(el("button", { className: "eliminar quit", textContent: "🗑️" }));
    lista.append(li);

    actualizarTotales();
}

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

// ==================== DIRECCIÓN SOLO SI ES ENVÍO ====================
entrega.addEventListener("change", function () {
    bloqueDireccion.style.display = entrega.value === "Envío a domicilio" ? "block" : "none";
});

// No dejar elegir fechas pasadas
inputFecha.min = new Date().toLocaleDateString("en-CA"); // formato AAAA-MM-DD

// ==================== ENVIAR PEDIDO ====================
btn_enviar.addEventListener("click", async function () {
    const items = lista.querySelectorAll("li");
    const nombre = document.getElementById("nombreCliente").value.trim();
    const telefono = document.getElementById("telefono").value.replace(/\D/g, ""); // solo números
    const tipoEntrega = entrega.value;
    const direccion = document.getElementById("direccion").value.trim();
    const fecha = inputFecha.value;
    const notas = document.getElementById("notas").value.trim();
    const pago = document.getElementById("pago").value;

    // --- Validaciones ---
    if (items.length === 0) { alert("Agrega al menos una flor al carrito."); return; }
    if (nombre === "") { alert("Escribe tu nombre."); return; }
    if (telefono.length < 10 || telefono.length > 15) { alert("Escribe un teléfono válido de 10 dígitos."); return; }
    if (tipoEntrega === "Envío a domicilio" && direccion === "") { alert("Escribe la dirección de entrega."); return; }
    if (pago === "") { alert("Elige la forma de pago."); return; }

    // --- Armar la lista de productos (se guarda como JSON) ---
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

    // --- Resumen para WhatsApp (se arma ANTES de vaciar el carrito) ---
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

    // --- Limpiar todo ---
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

// ==================== ARRANQUE ====================
cargarCatalogo();
