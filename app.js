// 1. Configuración SUPABASE
const SUPABASE_URL = 'https://rljvnsqnzxqwogmppqzi.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsanZuc3Fuenhxd29nbXBwcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY3NzcsImV4cCI6MjA3OTY3Mjc3N30.Kv5_9Ny3u1TwfgHeCEvE5w3JbBuMMHcpw-L1FGT8O1A';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Inicialización de UI
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    if(window.AOS) AOS.init({ duration: 800, once: true });
    
    checkSession();
    initSpotlightEffect();
    initPerformanceBars();
});

// 3. Efecto Spotlight (Estilo React.bits)
function initSpotlightEffect() {
    const cards = document.querySelectorAll('.spotlight-card');
    const container = document.getElementById('cards-container');

    if (container) {
        container.onmousemove = e => {
            for(const card of cards) {
                const rect = card.getBoundingClientRect(),
                      x = e.clientX - rect.left,
                      y = e.clientY - rect.top;

                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            }
        }
    }
}

// 4. Animación de Barras de Rendimiento (Observer)
function initPerformanceBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.perf-bar');
                bars.forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }
        });
    }, { threshold: 0.5 });

    const section = document.querySelector('#benchmarks');
    if(section) observer.observe(section);
}

// 5. Autenticación (Supabase)
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    const authContainer = document.getElementById('auth-section');
    
    if (session && authContainer) {
        // Obtener estado premium
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', session.user.id)
            .single();
            
        const isPro = profile?.is_premium;
        
        authContainer.innerHTML = `
            <div class="flex items-center gap-3 relative group">
                <div class="text-right hidden sm:block">
                    <p class="text-xs text-gray-400 font-bold">Welcome</p>
                    <p class="text-sm font-bold text-white">${session.user.email.split('@')[0]}</p>
                </div>
                <div class="w-10 h-10 rounded-lg ${isPro ? 'bg-gradient-to-br from-red-600 to-purple-600 shadow-[0_0_15px_#ef4444]' : 'bg-gray-800'} flex items-center justify-center border border-white/10 cursor-pointer">
                    ${session.user.user_metadata.avatar_url ? `<img src="${session.user.user_metadata.avatar_url}" class="rounded-lg">` : '<i data-lucide="user" class="text-white w-5"></i>'}
                </div>
                
                <div class="absolute right-0 top-12 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl">
                    <a href="download.html" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg hover:text-white transition">
                        <i data-lucide="download" class="w-4"></i> Download
                    </a>
                    <button onclick="logout()" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/10 rounded-lg transition text-left">
                        <i data-lucide="log-out" class="w-4"></i> Sign Out
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
}

async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
}

async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
}
