// js/components.js

document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    updateActiveMenu();
});

function renderNavbar() {
    // 1. Ambil User Login
    const user = localStorage.getItem('user_si_tani') || "Tamu";
    // Buat Avatar otomatis berdasarkan inisial nama (Pakai API UI Avatars)
    const avatarUrl = `https://ui-avatars.com/api/?name=${user}&background=fff&color=2E8B57&bold=true&size=128`;

    // 2. HTML Navbar ATAS (Modern Glassmorphism)
    // Perhatikan class 'fixed-top' agar dia melayang
    const topNavHTML = `
    <nav class="navbar modern-nav fixed-top">
        <div class="container d-flex justify-content-between align-items-center px-3">
            
            <a class="text-decoration-none d-flex align-items-center gap-3" href="#">
                <div class="logo-box">
                    🌱
                </div>
                <div class="brand-text">
                    <h1>Si Tani</h1>
                    <small>Asisten Cerdas</small>
                </div>
            </a>

            <div class="d-flex align-items-center gap-2">
                <button class="nav-icon-btn" onclick="alert('Belum ada notifikasi baru')">
                    🔔
                    <span class="notif-dot"></span>
                </button>
                
                <div class="position-relative" onclick="logout()">
                    <img src="${avatarUrl}" class="user-avatar shadow-sm" alt="Profil">
                </div>
            </div>

        </div>
    </nav>`;

    // 3. HTML Navbar BAWAH (Bottom Nav - Tetap Sama tapi lebih rapi)
    const bottomNavHTML = `
    <nav class="navbar fixed-bottom navbar-light bg-white border-top shadow-lg" style="height: 70px; border-radius: 25px 25px 0 0;">
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

    // 4. Masukkan ke Body
    document.body.insertAdjacentHTML('afterbegin', topNavHTML);
    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
}

function updateActiveMenu() {
    const currentPath = window.location.pathname.split("/").pop(); 
    const links = document.querySelectorAll('.nav-link-item');

    links.forEach(link => {
        // Efek aktif: Warna Hijau & Ikon naik sedikit
        if (link.getAttribute('href') === currentPath) {
            link.classList.remove('text-muted');
            link.classList.add('text-success');
            link.querySelector('div').style.transform = "translateY(-3px)";
            link.querySelector('div').style.transition = "transform 0.2s";
        }
    });
}

// Fungsi Logout
window.logout = function() {
    // Pakai SweetAlert bawaan browser (Confirm)
    if(confirm("Ingin keluar akun?")) {
        localStorage.removeItem('user_si_tani');
        window.location.href = 'index.html';
    }
}