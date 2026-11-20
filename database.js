const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const loginError = document.getElementById('login-error');

// Revisar si ya hay sesión iniciada
db.auth.getSession().then(({ data: { session } }) => {
    if (session) mostrarPanel();
});

btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
        loginError.textContent = "Error: " + error.message;
    } else {
        loginError.textContent = "";
        mostrarPanel();
    }
});

btnLogout.addEventListener('click', async () => {
    await db.auth.signOut();
    dashboardScreen.style.display = 'none';
    loginScreen.style.display = 'block';
});

async function mostrarPanel() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    cargarPedidos();
}

async function cargarPedidos() {
    const contenedor = document.getElementById('lista-pedidos');
    // Usamos db en lugar de supabase
    const { data: pedidos, error } = await db.from('pedidos').select('*').order('id', { ascending: false });
    
    if (error) {
        contenedor.innerHTML = `<p style="color:red">Error al cargar: ${error.message}</p>`;
        return;
    }
    
    if (pedidos.length === 0) {
        contenedor.innerHTML = "<p>No hay pedidos aún.</p>";
        return;
    }

    contenedor.innerHTML = pedidos.map(p => `
        <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #ddd;">
            <p><strong>Cliente:</strong> ${p.cliente || p.nombre || 'Sin nombre'}</p>
            <p><strong>Total:</strong> $${p.total || '?'}</p>
        </div>
    `).join('');
}

// Agregar flor
document.getElementById('btn-agregar-flor').addEventListener('click', async () => {
    const nombre = document.getElementById('nueva-flor-nombre').value;
    const precio = document.getElementById('nueva-flor-precio').value;
    
    if(!nombre || !precio) return alert('Llena ambos campos');
    
    const { error } = await db.from('flores').insert([{ nombre, precio }]);
    if (error) alert('Error: ' + error.message);
    else {
        alert('Flor agregada');
        document.getElementById('nueva-flor-nombre').value = '';
        document.getElementById('nueva-flor-precio').value = '';
    }
});