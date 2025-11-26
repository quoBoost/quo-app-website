// ==========================================
// 1. SUPABASE CONFIG Y LOGIC (CORRECCIONES FINALES)
// ==========================================

// Asegúrate de que esta URL y CLAVE sean correctas. 
const SUPABASE_URL = 'https://rljvnsqnzxqwogmppqzi.supabase.co';  
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsanZuc3Fuenhxd29nbXBwcXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY3NzcsImV4cCI6MjA3OTY3Mjc3N30.Kv5_9Ny3u1TwfgHeCEvE5w3JbBuMMHcpw-L1FGT8O1A';

// CORRECCIÓN DE BUG: Usamos 'supabaseClient' para evitar el ReferenceError.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); 

// ----------------------------------------------------
// FUNCIONES GLOBALES (ACCESIBLES DESDE EL HTML)
// ----------------------------------------------------

async function loginWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://quoboost.com/' } 
    });
    if (error) console.error("Login Error:", error);
}
window.loginWithGoogle = loginWithGoogle; 


async function logout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}
window.logout = logout;


// ----------------------------------------------------
// 2. FUNCIÓN DE RASTREO DE MOUSE (PARA EL EFECTO SPOTLIGHT)
// ----------------------------------------------------

function handleMouseMove(e) {
    const cards = document.getElementsByClassName("spotlight-card");
    for (const card of cards) {
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


// ----------------------------------------------------
// 3. CHECK USER SESSION Y ACTUALIZACIÓN DE UI
// ----------------------------------------------------

async function checkUser() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const authSection = document.getElementById('auth-section');

    if (session) {
        // CORRECCIÓN DE BUG: Cambiado de 'profiles' a 'profile' (singular)
        const { data: profile } = await supabaseClient
            .from('profile') 
            .select('is_premium')
            .eq('id', session.user.id)
            .single();
        
        const isPremium = profile?.is_premium;
        const badgeColor = isPremium ? 'bg-brand' : 'bg-gray-700';
        const badgeText = isPremium ? 'PRO' : 'FREE';
        
        const avatarUrl = session.user.user_metadata.avatar_url;
        const userEmail = session.user.email;
        
        if (authSection) {
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
            if(window.lucide) lucide.createIcons();
        }

    } // Si no hay sesión, el HTML original del login se mantiene.
}


// ----------------------------------------------------
// 4. FUNCIÓN WEBGL PARA EFECTO PRISM
// ----------------------------------------------------

function initializePrismEffect() {
    const container = document.getElementById('prism-container');
    // Verifica si la librería OGL está disponible
    if (!container || typeof OGL === 'undefined') return; 

    // Usamos el namespace global OGL de la CDN
    const { Renderer, Triangle, Program, Mesh } = OGL; 

    const vertex = /* glsl */ `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragment = /* glsl */ `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform float uSpeed;

        mat2 rotate(float a) {
            float s=sin(a), c=cos(a);
            return mat2(c, -s, s, c);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            vec2 p = uv - 0.5;
            p.x *= iResolution.x / iResolution.y;

            float angle = iTime * uSpeed * 0.1;
            p = rotate(angle) * p;

            float d = length(p * 2.5);
            float bands = sin(p.x * 10.0 + iTime * uSpeed * 0.5) * 0.5 + 0.5;
            bands *= sin(p.y * 10.0 + iTime * uSpeed * 0.5) * 0.5 + 0.5;
            float pulse = sin(iTime * uSpeed * 0.5) * 0.5 + 0.5;

            float c = sin(d * 5.0 + iTime * uSpeed + bands * 2.0);
            c = pow(c * 0.5 + 0.5, 3.0) * (1.0 - d * 0.5);

            vec3 red = vec3(1.0, 0.0, 0.23); 
            
            vec3 finalColor = c * red * 1.5;
            finalColor += bands * 0.1; 

            finalColor *= (1.0 + pulse * 0.1); 
            
            finalColor = mix(vec3(0.03, 0.03, 0.03), finalColor, c * 0.75 + 0.25);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({
        dpr,
        alpha: true,
        antialias: false
    });
    const gl = renderer.gl;
    
    Object.assign(gl.canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        display: 'block'
    });
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const iResBuf = new Float32Array(2);

    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            iResolution: { value: iResBuf },
            iTime: { value: 0 },
            uSpeed: { value: 1.0 },
        }
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        iResBuf[0] = gl.drawingBufferWidth;
        iResBuf[1] = gl.drawingBufferHeight;
    };
    
    const ro = window.ResizeObserver ? new window.ResizeObserver(resize) : { observe: () => resize(), disconnect: () => {} };
    ro.observe(container);
    resize();

    let raf = 0;
    const t0 = performance.now();
    const render = (t) => {
        const time = (t - t0) * 0.001;
        program.uniforms.iTime.value = time;

        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(render);
    };
    
    render(t0);
}


// ----------------------------------------------------
// 5. INICIALIZACIÓN DE LIBRERÍAS AL CARGAR EL DOCUMENTO
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar la comprobación de sesión.
    checkUser();
    
    // 1. Inicializar el efecto PRISM (WebGL) para la sección de descarga.
    initializePrismEffect();

    // 2. Inicialización del Carrusel de Features (#ui-carousel)
    if (document.getElementById('ui-carousel') && typeof Splide !== 'undefined') {
        new Splide('#ui-carousel', {
            type: 'loop', 
            perPage: 4, 
            perMove: 1, 
            autoplay: true, 
            interval: 5000, 
            pauseOnHover: true, 
            arrows: true, 
            pagination: true, 
            gap: '1.5rem', 
            breakpoints: {
                1024: { perPage: 2, gap: '1rem', },
                768: { perPage: 1, gap: '1rem', },
            },
        }).mount();
    }
    
    // 3. Inicialización del Carrusel de Testimonios (#testimonial-carousel)
    if (document.getElementById('testimonial-carousel') && typeof Splide !== 'undefined') {
        new Splide('#testimonial-carousel', {
            type: 'loop', 
            perPage: 4, 
            perMove: 1, 
            autoplay: true, 
            interval: 4000, 
            pauseOnHover: true, 
            arrows: true, 
            pagination: false, 
            gap: '1.5rem',
            breakpoints: {
                1280: { perPage: 3, },
                1024: { perPage: 2, },
                768: { perPage: 1, gap: '1rem', },
            },
        }).mount();
    }
});

