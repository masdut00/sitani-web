// js/components.js

document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    updateActiveMenu();
});

function renderNavbar() {
    // 1. Ambil User Login
    const user = localStorage.getItem('user_si_tani') || "Tamu";

    // 2. HTML Navbar ATAS (Top Nav) + Tombol Logout Kecil
    const topNavHTML = `
    <nav class="navbar navbar-dark bg-tani sticky-top shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
            <a class="navbar-brand mb-0 h1 fw-bold text-white text-decoration-none" href="#">
                🌱 Si Tani
            </a>
            <div class="d-flex align-items-center gap-2">
                <span class="text-white small me-1">Halo, ${user}</span>
                <button onclick="logout()" class="btn btn-sm btn-danger py-0 px-2" style="font-size: 0.7rem;">
                    Keluar
                </button>
            </div>
        </div>
    </nav>`;

    // 3. HTML Navbar BAWAH (Bottom Nav)
    const bottomNavHTML = `
    <nav class="navbar fixed-bottom navbar-light bg-white border-top shadow-lg" style="height: 60px;">
        <div class="container-fluid d-flex justify-content-around">
            <a href="diagnosa.html" class="nav-link-item text-center text-decoration-none text-muted">
                <div style="font-size: 1.2rem;">🌿</div>
                <small style="font-size: 0.7rem;">Diagnosa</small>
            </a>
            <a href="toko.html" class="nav-link-item text-center text-decoration-none text-muted">
                <div style="font-size: 1.2rem;">🛒</div>
                <small style="font-size: 0.7rem;">Toko</small>
            </a>
            <a href="jadwal.html" class="nav-link-item text-center text-decoration-none text-muted">
                <div style="font-size: 1.2rem;">📅</div>
                <small style="font-size: 0.7rem;">Jadwal</small>
            </a>
            <a href="profil.html" class="nav-link-item text-center text-decoration-none text-muted">
                <div style="font-size: 1.2rem;">👤</div>
                <small style="font-size: 0.7rem;">Profil</small>
            </a>
        </div>
    </nav>`;

    // 4. Masukkan ke Body
    // Masukkan Top Nav di paling atas body
    document.body.insertAdjacentHTML('afterbegin', topNavHTML);
    // Masukkan Bottom Nav di paling bawah body
    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
}

function updateActiveMenu() {
    // Cari link yang href-nya sama dengan URL saat ini
    const currentPath = window.location.pathname.split("/").pop(); // misal: "toko.html"
    const links = document.querySelectorAll('.nav-link-item');

    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.remove('text-muted');
            link.classList.add('text-success', 'fw-bold');
        }
    });
}

// Fungsi Logout Global
window.logout = function() {
    if(confirm("Yakin ingin keluar akun?")) {
        localStorage.removeItem('user_si_tani');
        window.location.href = 'index.html';
    }
}