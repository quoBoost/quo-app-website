// ==========================================
// 1. CONFIGURACIÓN FINAL (CORREGIDA)
// ==========================================
// URL del proyecto
const SUPABASE_URL = 'https://rljvnsqnzxqwogmppqzi.supabase.co'; 

// CLAVE ANÓNIMA (¡PEGA TU CLAVE COMPLETA REAL AQUI!)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsanZuc3Fuenhxd29nbXBwcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY3NzcsImV4cCI6MjA3OTY3Mjc3N30.Kv5_9Ny3u1TwfgHeCEvE5w3JbBuMMHcpw-L1FGT8O1A'; 

// Inicializar cliente con nombre único para evitar conflicto de SCOPE
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del DOM (HTML)
const authSection = document.getElementById('auth-section');
const loginCta = document.getElementById('login-cta');
const dashboardPanel = document.getElementById('dashboard-panel');
const userEmailDisplay = document.getElementById('user-email-display');
const statusBadge = document.getElementById('status-badge');
const contentFree = document.getElementById('content-free');
const contentPremium = document.getElementById('content-premium');

// ==========================================
// 2. FUNCIONES PRINCIPALES DE AUTENTICACIÓN
// ==========================================

async function checkSession() {
    // Usamos supabaseClient
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showLoggedInUI(session.user);
    } else {
        showGuestUI();
    }
}

async function loginWithGoogle() {
    // Usamos supabaseClient
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.href 
        }
    });
    if (error) console.error("Error al iniciar sesión con Google:", error);
}

async function logout() {
    // Usamos supabaseClient
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error("Error al cerrar sesión:", error);
    window.location.reload();
}

// ==========================================
// 3. MANEJO DE INTERFAZ (UI) Y ESTADO PREMIUM
// ==========================================

function showGuestUI() {
    loginCta.classList.remove('hidden');
    dashboardPanel.classList.add('hidden');
    authSection.innerHTML = `<button onclick="loginWithGoogle()" class="px-5 py-2 border border-gray-700 rounded hover:bg-gray-800 transition text-sm text-gray-300">LOGIN</button>`;
}

async function showLoggedInUI(user) {
    loginCta.classList.add('hidden');
    dashboardPanel.classList.remove('hidden');
    authSection.innerHTML = `<span class="text-green-500 text-xs mr-2">● ONLINE</span>`;
    userEmailDisplay.textContent = user.email;

    // CONSULTAR BASE DE DATOS: ¿ES PREMIUM?
    // Usamos supabaseClient
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('is_premium') 
        .eq('id', user.id)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error("Error al consultar el perfil de usuario:", error);
    }
    
    if (profile && profile.is_premium === true) {
        // ES PREMIUM
        statusBadge.textContent = "PREMIUM USER";
        statusBadge.className = "px-3 py-1 bg-blue-900 text-blue-200 border border-blue-500 rounded text-xs font-bold shadow-[0_0_10px_rgba(37,99,235,0.5)]";
        contentFree.classList.add('hidden');
        contentPremium.classList.remove('hidden');
    } else {
        // ES GRATIS
        statusBadge.textContent = "FREE TIER";
        statusBadge.className = "px-3 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded text-xs font-bold";
        contentFree.classList.remove('hidden');
        contentPremium.classList.add('hidden');
    }
}

// Arrancar la app
checkSession();

