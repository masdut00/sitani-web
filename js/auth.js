// 1. Ambil data sesi login yang BENAR
const currentUser = localStorage.getItem('username');
const namaUser = localStorage.getItem('namaUser');

// 2. Cek posisi halaman saat ini
const currentPage = window.location.pathname.toLowerCase();
const isLoginPage = currentPage.includes('index.html') || currentPage.endsWith('/');
const isRegisterPage = currentPage.includes('register.html');

// 3. Logika Penjaga Pintu (Bouncer)
if (!currentUser) {
    // Jika BELUM login, dan sedang mencoba buka halaman dalam (seperti jadwal/toko)
    if (!isLoginPage && !isRegisterPage) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = 'index.html';
    }
} else {
    // Jika SUDAH login, tapi malah mencoba buka halaman Login/Register lagi
    if (isLoginPage || isRegisterPage) {
        window.location.href = 'diagnosa.html'; // Langsung arahkan ke dalam aplikasi
    }
}

// 4. Opsi: Tampilkan nama user di pojok kanan atas (jika ada elemennya)
document.addEventListener('DOMContentLoaded', () => {
    const userLabel = document.getElementById('user-display');
    if(userLabel && namaUser) {
        userLabel.innerText = "Halo, " + namaUser;
    }
});

// 5. Fungsi Logout Global
window.logout = function() {
    localStorage.clear(); // Bersihkan semua memori login
    window.location.href = 'index.html';
};