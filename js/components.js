// js/components.js

// 1. DEFINISI HTML (Langsung dieksekusi saat file dibaca browser)
const user = localStorage.getItem('user_si_tani') || "Tamu";
const avatarUrl = `https://ui-avatars.com/api/?name=${user}&background=fff&color=2E8B57&bold=true&size=128`;

// HTML Navbar Atas
const topNav = `
<nav class="navbar modern-nav fixed-top" style="z-index: 1050;">
    <div class="container d-flex justify-content-between align-items-center px-3">
        <a class="text-decoration-none d-flex align-items-center gap-3" href="#">
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
            <div class="position-relative" onclick="logout()">
                <img src="${avatarUrl}" class="user-avatar shadow-sm" alt="Profil">
            </div>
        </div>
    </div>
</nav>`;

// HTML Navbar Bawah
const bottomNav = `
<nav class="navbar fixed-bottom navbar-light bg-white border-top shadow-lg" style="height: 70px; border-radius: 25px 25px 0 0; z-index: 1040;">
    <div class="container-fluid d-flex justify-content-around align-items-center h-100">
        <a href="diagnosa.html" class="nav-link-item text-center text-decoration-none text-muted w-25">
            <div style="font-size: 1.4rem; margin-bottom: -5px;">🌿</div>
            <small style="font-size: 0.65rem; font-weight: 600;">Diagnosa</small>
        </a>
        <a href="toko.html" class="nav-link-item text-center text-decoration-none text-muted w-25">
            <div style="font-size: 1.4rem; margin-bottom: -5px;">🛒</div>
            <small style="font-size: 0.65rem; font-weight: 600;">Toko</small>
        </a>
        <a href="jadwal.html" class="nav-link-item text-center text-decoration-none text-muted w-25">
            <div style="font-size: 1.4rem; margin-bottom: -5px;">📅</div>
            <small style="font-size: 0.65rem; font-weight: 600;">Jadwal</small>
        </a>
        <a href="profil.html" class="nav-link-item text-center text-decoration-none text-muted w-25">
            <div style="font-size: 1.4rem; margin-bottom: -5px;">👤</div>
            <small style="font-size: 0.65rem; font-weight: 600;">Profil</small>
        </a>
    </div>
</nav>`;

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