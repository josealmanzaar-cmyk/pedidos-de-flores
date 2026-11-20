// ==================== ADMIN: login, pedidos y flores ====================
// Todo el texto que viene de la base de datos se escribe con textContent
// (nunca con innerHTML), para que nadie pueda meter código en un pedido.

const $ = (id) => document.getElementById(id);

// Ayudante para crear elementos: el("p", { textContent: "hola" }, hijo1, hijo2)
function el(tag, props = {}, ...hijos) {
    const e = document.createElement(tag);
    Object.assign(e, props);
    hijos.forEach((h) => e.append(h));
    return e;
}

function fechaBonita(texto) {
    if (!texto) return "";
    // "creado" no trae zona horaria: viene en UTC
    const t = /Z|[+-]\d\d:?\d\d$/.test(texto) ? texto : texto + "Z";
    return new Date(t).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

// ==================== LOGIN ====================
$("login_form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("login_msg").textContent = "Entrando...";
    const { error } = await db.auth.signInWithPassword({
        email: $("correo").value.trim(),
        password: $("clave").value
    });
    if (error) {
        $("login_msg").textContent = "Correo o contraseña incorrectos.";
        return;
    }
    $("clave").value = "";
    $("login_msg").textContent = "";
    mostrarPanel();
});

$("btn_salir").addEventListener("click", async () => {
    await db.auth.signOut();
    $("panel").hidden = true;
    $("login").hidden = false;
});

function mostrarPanel() {
    $("login").hidden = true;
    $("panel").hidden = false;
    cargarPedidos();
    cargarFlores();
}

// Si ya había sesión abierta, entra directo
db.auth.getSession().then(({ data }) => {
    if (data.session) mostrarPanel();
});

// ==================== PESTAÑAS ====================
function cambiarTab(cual) {
    const verPedidos = cual === "pedidos";
    $("vista_pedidos").hidden = !verPedidos;
    $("vista_flores").hidden = verPedidos;
    $("tab_pedidos").classList.toggle("activa", verPedidos);
    $("tab_flores").classList.toggle("activa", !verPedidos);
}
$("tab_pedidos").addEventListener("click", () => cambiarTab("pedidos"));
$("tab_flores").addEventListener("click", () => cambiarTab("flores"));
$("btn_recargar").addEventListener("click", cargarPedidos);

// ==================== PEDIDOS ====================
const ESTADOS = ["pendiente", "en proceso", "entregado", "cancelado"];

async function cargarPedidos() {
    const cont = $("lista_pedidos");
    cont.textContent = "Cargando...";
    const { data, error } = await db
        .from("pedidos")
        .select("*")
        .order("creado", { ascending: false });

    if (error) { cont.textContent = "Error: " + error.message; return; }
    cont.textContent = "";
    if (data.length === 0) { cont.textContent = "Aún no hay pedidos."; return; }
    data.forEach((p) => cont.append(tarjetaPedido(p)));
}

function tarjetaPedido(p) {
    const tarjeta = el("article", { className: "tarjeta estado-" + p.estado.replace(" ", "-") });

    tarjeta.append(
        el("div", { className: "fila_top" },
            el("strong", { textContent: "#" + p.id + " · " + p.cliente }),
            el("span", { className: "etiqueta_estado", textContent: p.estado })
        ),
        el("p", { className: "chico_txt", textContent: fechaBonita(p.creado) })
    );

    // Teléfono con enlace a WhatsApp (solo dígitos, así que es seguro)
    const digitos = String(p.telefono).replace(/\D/g, "");
    const numWa = digitos.length === 10 ? "52" + digitos : digitos;
    tarjeta.append(
        el("p", {},
            "📞 ",
            el("a", { href: "https://wa.me/" + numWa, target: "_blank", rel: "noopener", textContent: p.telefono })
        )
    );

    tarjeta.append(el("p", { textContent: "🚚 " + p.entrega + (p.direccion ? " — " + p.direccion : "") }));
    if (p.fecha_entrega) tarjeta.append(el("p", { textContent: "📅 Para: " + p.fecha_entrega }));
    if (p.pago) tarjeta.append(el("p", { textContent: "💵 Pago: " + p.pago }));
    if (p.notas) tarjeta.append(el("p", { className: "notas", textContent: "📝 " + p.notas }));

    const ul = el("ul", { className: "productos" });
    (p.productos || []).forEach((x) => {
        ul.append(el("li", { textContent: x.nombre + " x" + x.cantidad + " — $" + x.subtotal }));
    });
    tarjeta.append(ul, el("p", { className: "total", textContent: "Total: $" + Number(p.total).toFixed(2) }));

    // Cambiar estado
    const sel = el("select");
    ESTADOS.forEach((s) => sel.append(el("option", { value: s, textContent: s, selected: s === p.estado })));
    sel.addEventListener("change", async () => {
        const { error } = await db.from("pedidos").update({ estado: sel.value }).eq("id", p.id);
        if (error) { alert("No se pudo cambiar: " + error.message); return; }
        cargarPedidos();
    });

    const btnBorrar = el("button", { className: "btn chico peligro", textContent: "Borrar" });
    btnBorrar.addEventListener("click", async () => {
        if (!confirm("¿Borrar el pedido #" + p.id + "? No se puede deshacer.")) return;
        const { error } = await db.from("pedidos").delete().eq("id", p.id);
        if (error) { alert("No se pudo borrar: " + error.message); return; }
        cargarPedidos();
    });

    tarjeta.append(el("div", { className: "acciones" }, sel, btnBorrar));
    return tarjeta;
}

// ==================== FLORES ====================
async function cargarFlores() {
    const cont = $("lista_admin");
    cont.textContent = "Cargando...";
    const { data, error } = await db.from("flores").select("*").order("id");
    if (error) { cont.textContent = "Error: " + error.message; return; }
    cont.textContent = "";
    data.forEach((f) => cont.append(filaFlor(f)));
}

function filaFlor(f) {
    const precio = el("input", { type: "number", min: "0", step: "0.01", value: f.precio });
    const disp = el("input", { type: "checkbox", checked: f.disponible });

    const btnGuardar = el("button", { className: "btn chico principal", textContent: "Guardar" });
    btnGuardar.addEventListener("click", async () => {
        const { error } = await db
            .from("flores")
            .update({ precio: Number(precio.value), disponible: disp.checked })
            .eq("id", f.id);
        alert(error ? "Error: " + error.message : "Guardado ✅");
    });

    const btnBorrar = el("button", { className: "btn chico peligro", textContent: "Borrar" });
    btnBorrar.addEventListener("click", async () => {
        if (!confirm("¿Borrar " + f.nombre + "?")) return;
        const { error } = await db.from("flores").delete().eq("id", f.id);
        if (error) { alert("Error: " + error.message); return; }
        cargarFlores();
    });

    return el("div", { className: "fila" },
        el("div", { className: "info_flor" },
            el("strong", { textContent: f.nombre }),
            el("label", {}, "$ ", precio),
            el("label", {}, disp, " Disponible")
        ),
        el("div", { className: "acciones" }, btnGuardar, btnBorrar)
    );
}

$("form_flor").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { error } = await db.from("flores").insert({
        nombre: $("f_nombre").value.trim(),
        precio: Number($("f_precio").value),
        imagen: $("f_imagen").value.trim() || null,
        descripcion: $("f_desc").value.trim() || null
    });
    if (error) { alert("Error: " + error.message); return; }
    e.target.reset();
    cargarFlores();
});
