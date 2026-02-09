// Cek apakah ada data user di LocalStorage
const user = localStorage.getItem('user_si_tani');

if (!user) {
    // Kalau tidak ada, tendang balik ke halaman login
    alert("Silakan login dulu!");
    window.location.href = 'index.html';
}

// Opsi: Tampilkan nama user di pojok kanan atas (jika ada elemennya)
document.addEventListener('DOMContentLoaded', () => {
    const userLabel = document.getElementById('user-display');
    if(userLabel) userLabel.innerText = "Halo, " + user;
});

// Fungsi Logout
function logout() {
    localStorage.removeItem('user_si_tani');
    window.location.href = 'index.html';
}