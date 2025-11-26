// ==========================================
// 1. SUPABASE CONFIG Y LOGIC (CORREGIDO)
// ==========================================

// Asegúrate de que esta URL y CLAVE sean correctas. 
// La clave anon aquí es solo para el Frontend.
const SUPABASE_URL = 'https://rljvnsqnzxqwogmppqzi.supabase.co';  
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsanZuc3Fuenhxd29nbXBwcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY3NzcsImV4cCI6MjA3OTY3Mjc3N30.Kv5_9Ny3u1TwfgHeCEvE5w3JbBuMMHcpw-L1FGT8O1A';

// CORRECCIÓN: Usamos supabaseClient para evitar el conflicto con la librería global.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); 

// Función global llamada por el botón del HTML
async function loginWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        // Redirección forzada al sitio en vivo
        options: { redirectTo: 'https://quoboost.vercel.app/' } 
    });
    if (error) console.error("Login Error:", error);
}

// Función de logout (usada en el menú desplegable)
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}

// 2. FUNCIÓN DE RASTREO DE MOUSE (PARA EL EFECTO SPOTLIGHT)
// Nota: Esta función es opcional si el efecto de mouse tracking no es crítico.
// La mantenemos para que el diseño funcione.

function handleMouseMove(e) {
    const cards = document.getElementsByClassName("spotlight-card");
    for (const card of cards) {
        // Solo actualizar si el mouse está cerca del card
        if (card.matches(':hover')) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    }
}
document.addEventListener('mousemove', handleMouseMove);


// 3. CHECK USER SESSION Y ACTUALIZACIÓN DE UI
async function checkUser() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        // ** Aquí se añade la lógica de actualización del Navbar **
        const authSection = document.getElementById('auth-section');
        if (authSection) {
            
            // Lógica simple de Premium (puedes ampliarla)
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('is_premium')
                .eq('id', session.user.id)
                .single();
            
            const isPremium = profile?.is_premium;
            const badgeColor = isPremium ? 'bg-brand' : 'bg-gray-700';
            const badgeText = isPremium ? 'PRO' : 'FREE';
            
            const avatarUrl = session.user.user_metadata.avatar_url;
            const userEmail = session.user.email;
            
            authSection.innerHTML = `
                <div class="relative group cursor-pointer flex items-center gap-3">
                    <div class="hidden md:flex flex-col text-right">
                        <span class="text-[10px] text-gray-500 uppercase">Status</span>
                        <span class="text-sm font-bold ${isPremium ? 'text-brand' : 'text-gray-400'}">${badgeText}</span>
                    </div>

                    <div class="w-10 h-10 rounded-full ${badgeColor} flex items-center justify-center text-white font-bold border-2 border-white/10 overflow-hidden">
                        ${avatarUrl 
                            ? `<img src="${avatarUrl}" class="w-full h-full object-cover">` 
                            : userEmail[0].toUpperCase()}
                    </div>
                    
                    <div class="absolute right-0 mt-2 top-full w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                        <div class="p-2 space-y-1">
                            <div class="px-3 py-2 text-xs text-gray-500 border-b border-white/10 mb-1 truncate">${userEmail}</div>
                            <a href="download.html" class="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><i data-lucide="download" class="w-4"></i> Download App</a>
                            <button onclick="logout()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded flex items-center gap-2">
                                <i data-lucide="log-out" class="w-4"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            `;
            // Reinicializar iconos para el nuevo contenido inyectado
            if(window.lucide) lucide.createIcons();
        }

    } else {
        // Si no está logueado, se mantiene el contenido original del HTML.
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('ui-carousel')) {
        new Splide('#ui-carousel', {
            type: 'loop', // El carrusel se repite infinitamente
            perPage: 4, // Mostrar 4 tarjetas en desktop
            perMove: 1, // Mover una tarjeta a la vez
            autoplay: true, // Auto-reproducción activada
            interval: 5000, // Cada 5 segundos
            pauseOnHover: true, // Pausar al pasar el ratón
            arrows: true, // Mostrar flechas de navegación
            pagination: true, // Mostrar puntos de paginación
            gap: '1.5rem', // Espacio entre las tarjetas (corresponde a 'gap-6' de Tailwind)
            breakpoints: {
                1024: { // Para pantallas pequeñas (lg: o menos)
                    perPage: 2, // Mostrar 2 tarjetas en tablet
                    gap: '1rem', // Espacio más pequeño
                },
                768: { // Para pantallas aún más pequeñas (md: o menos)
                    perPage: 1, // Mostrar 1 tarjeta en móvil
                    gap: '1rem',
                },
            },
        }).mount();
    }
});

// Inicializar la comprobación de sesión
checkUser();

