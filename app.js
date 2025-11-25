// ==========================================
// 1. CONFIGURACIÓN
// ==========================================
const SUPABASE_URL = 'https://rljvnsqnzxqwogmppqzi.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsanZuc3Fuenhxd29nbXBwcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY3NzcsImV4cCI6MjA3OTY3Mjc3N30.Kv5_9Ny3u1TwfgHeCEvE5w3JbBuMMHcpw-L1FGT8O1A'; // <--- ¡NO OLVIDES PEGAR TU CLAVE!
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. ELEMENTOS DEL DOM
// ==========================================
const authSection = document.getElementById('auth-section');

// ==========================================
// 3. FUNCIONES DE AUTH
// ==========================================

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        updateNavbarLoggedIn(session.user);
    }
}

async function loginWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://quoboost.vercel.app/' }
    });
    if (error) console.error("Login Error:", error);
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}

// ==========================================
// 4. UI UPDATES
// ==========================================

async function updateNavbarLoggedIn(user) {
    if (!authSection) return;

    // Obtener estado Premium
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

    const isPremium = profile?.is_premium;
    const badgeColor = isPremium ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-700';
    const badgeText = isPremium ? 'PRO' : 'FREE';

    // Reemplazar botones de login por Perfil de Usuario
    authSection.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
                <div class="text-xs text-gray-400 uppercase font-bold tracking-wider">Welcome</div>
                <div class="text-sm font-bold text-white truncate max-w-[150px]">${user.email.split('@')[0]}</div>
            </div>
            <div class="relative group cursor-pointer">
                <div class="w-10 h-10 rounded-full ${badgeColor} flex items-center justify-center text-white font-bold border-2 border-white/10 overflow-hidden">
                    ${user.user_metadata.avatar_url 
                        ? `<img src="${user.user_metadata.avatar_url}" class="w-full h-full object-cover">` 
                        : user.email[0].toUpperCase()}
                </div>
                <div class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-black rounded border border-white/20 text-[10px] font-bold ${isPremium ? 'text-blue-400' : 'text-gray-400'}">
                    ${badgeText}
                </div>

                <div class="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <div class="p-2 space-y-1">
                        <div class="px-3 py-2 text-xs text-gray-500 border-b border-white/10 mb-1">${user.email}</div>
                        ${isPremium 
                            ? `<a href="download.html" class="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"><i data-lucide="download" class="w-4"></i> Download App</a>` 
                            : `<a href="pricing.html" class="block px-3 py-2 text-sm text-yellow-400 hover:bg-white/10 rounded flex items-center gap-2"><i data-lucide="zap" class="w-4"></i> Go Premium</a>`
                        }
                        <button onclick="logout()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded flex items-center gap-2">
                            <i data-lucide="log-out" class="w-4"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Reinicializar iconos para el nuevo contenido inyectado
    if(window.lucide) lucide.createIcons();
}

// Init
checkSession();
