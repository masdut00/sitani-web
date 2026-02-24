// js/components.js

// 1. DEFINISI HTML (Langsung dieksekusi saat file dibaca browser)
const user = localStorage.getItem('user_si_tani') || "Tamu";
const avatarUrl = `https://ui-avatars.com/api/?name=${user}&background=fff&color=2E8B57&bold=true&size=128`;

// 1. Deteksi otomatis halaman mana yang sedang dibuka saat ini
const pathSaatIni = window.location.pathname.toLowerCase();
const halamanAktif = pathSaatIni.split('/').pop() || 'beranda.html'; // Default ke beranda jika kosong

// 2. Fungsi penentu status warna & gaya (Aktif vs Tidak Aktif)
const getTextColor = (halaman) => halamanAktif.includes(halaman) ? 'text-success active-nav' : 'text-muted';
const getIconStyle = (halaman) => halamanAktif.includes(halaman) ? 'active-icon' : 'inactive-icon';

const styleNav = `
<style>
    .bottom-nav-glass {
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(12px); /* Efek Kaca Blur */
        -webkit-backdrop-filter: blur(12px);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.04);
        height: 75px;
        border-radius: 24px 24px 0 0;
        z-index: 1040;
        padding-bottom: env(safe-area-inset-bottom); /* Aman untuk layar iPhone */
    }
    .nav-item-wrapper {
        width: 20%; /* Karena ada 5 ikon */
        position: relative;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
    }
    .nav-item-wrapper:active {
        transform: scale(0.9); /* Efek membal saat ditekan */
    }
    .nav-icon {
        font-size: 1.4rem;
        margin-bottom: 2px;
        transition: all 0.3s ease;
    }
    .inactive-icon {
        filter: grayscale(100%); /* Bikin emoji jadi abu-abu */
        opacity: 0.5;
    }
    .active-icon {
        transform: translateY(-4px) scale(1.15); /* Naik sedikit & membesar */
        filter: grayscale(0%); /* Warna emoji kembali normal */
        opacity: 1;
    }
    .active-nav::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 5px;
        height: 5px;
        background-color: #198754; /* Titik hijau di bawah teks */
        border-radius: 50%;
    }
    .nav-text {
        font-size: 0.65rem;
        font-weight: 700;
        transition: color 0.3s ease;
    }
</style>
`;

// HTML Navbar Atas
const topNav = `
<nav class="navbar modern-nav fixed-top" style="z-index: 1050;">
    <div class="container d-flex justify-content-between align-items-center px-3">
        <a class="text-decoration-none d-flex align-items-center gap-3" href="beranda.html">
            <div class="logo-box">🌱</div>
            <div class="brand-text">
                <h1>Si Tani</h1>
                <small>Asisten Cerdas</small>
            </div>
        </a>
        <div class="d-flex align-items-center gap-2">
            <button class="nav-icon-btn" onclick="alert('Tidak ada notifikasi')">
                🔔 <span class="notif-dot"></span>
            </button>
            <div class="position-relative" onclick="window.location.href='profil.html'" style="cursor: pointer;">
                <img src="${avatarUrl}" class="user-avatar shadow-sm" alt="Profil">
            </div>
        </div>
    </div>
</nav>`;

// HTML Navbar Bawah
const bottomNav = `
${styleNav}
<nav class="navbar fixed-bottom bottom-nav-glass px-2">
    <div class="container-fluid d-flex justify-content-between align-items-center h-100">
        
        <a href="beranda.html" class="nav-item-wrapper text-center text-decoration-none d-flex flex-column align-items-center ${getTextColor('beranda')}">
            <div class="nav-icon ${getIconStyle('beranda')}">🏠</div>
            <small class="nav-text">Beranda</small>
        </a>

        <a href="diagnosa.html" class="nav-item-wrapper text-center text-decoration-none d-flex flex-column align-items-center ${getTextColor('diagnosa')}">
            <div class="nav-icon ${getIconStyle('diagnosa')}">🌿</div>
            <small class="nav-text">Diagnosa</small>
        </a>

        <a href="toko.html" class="nav-item-wrapper text-center text-decoration-none d-flex flex-column align-items-center ${getTextColor('toko')}">
            <div class="nav-icon ${getIconStyle('toko')}">🛒</div>
            <small class="nav-text">Toko</small>
        </a>

        <a href="jadwal.html" class="nav-item-wrapper text-center text-decoration-none d-flex flex-column align-items-center ${getTextColor('jadwal')}">
            <div class="nav-icon ${getIconStyle('jadwal')}">📅</div>
            <small class="nav-text">Jadwal</small>
        </a>

        <a href="profil.html" class="nav-item-wrapper text-center text-decoration-none d-flex flex-column align-items-center ${getTextColor('profil')}">
            <div class="nav-icon ${getIconStyle('profil')}">👤</div>
            <small class="nav-text">Profil</small>
        </a>

    </div>
</nav>
`;

// 2. INJEKSI LANGSUNG (TANPA MENUNGGU)
// 'afterbegin' berarti masukkan di paling atas body.
// Karena posisi:fixed, urutan di DOM tidak masalah, tapi eksekusi harus cepat.
document.body.insertAdjacentHTML("afterbegin", topNav + bottomNav);

// 3. LOGIKA MENU AKTIF (Langsung jalan)
const currentPath = window.location.pathname.split("/").pop(); 
const links = document.querySelectorAll('.nav-link-item');

links.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.remove('text-muted');
        link.classList.add('text-success');
        const iconDiv = link.querySelector('div');
        if(iconDiv) {
            iconDiv.style.transform = "translateY(-3px)";
            iconDiv.style.transition = "transform 0.2s";
        }
    }
});

// Fungsi Logout Global
window.logout = function() {
    if(confirm("Yakin ingin keluar?")) {
        localStorage.removeItem('user_si_tani');
        window.location.href = 'index.html';
    }
}