import { ambilPesanan } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ambil data User dari LocalStorage
    const currentUser = localStorage.getItem('username');
    const namaUser = localStorage.getItem('namaUser') || 'Pengguna';
    const roleUser = localStorage.getItem('roleUser') || 'petani';

    // Jika belum login, tendang ke halaman depan
    if (!currentUser) {
        alert("Sesi Anda telah habis. Silakan login kembali.");
        window.location.href = 'index.html';
        return;
    }

    // 2. Isi data ke HTML Profil
    document.getElementById('profil-nama').innerText = namaUser;
    document.getElementById('profil-username').innerText = currentUser;
    document.getElementById('profil-inisial').innerText = namaUser.charAt(0).toUpperCase();
    
    // Ubah tulisan role biar lebih rapi
    let teksRole = '👨‍🌾 Petani';
    if(roleUser === 'penjual') teksRole = '🏪 Penjual Tani';
    if(roleUser === 'customer') teksRole = '🛒 Customer';
    document.getElementById('profil-role').innerText = teksRole;

    // 3. Ambil data pesanan dari Database
    const pesananListEl = document.getElementById('pesanan-list');
    const pesanan = await ambilPesanan(currentUser);
    
    pesananListEl.innerHTML = ''; // Hapus loading

    // 4. Jika belum pernah belanja
    if (pesanan.length === 0) {
        pesananListEl.innerHTML = `
            <div class="col-12 text-center py-4 bg-light rounded-4 border border-light">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">🛍️</div>
                <h6 class="text-muted fw-bold mb-1">Belum ada pesanan.</h6>
                <small class="text-muted">Ayo mulai belanja kebutuhan tanammu di Toko.</small>
            </div>`;
    } else {
        // 5. Looping riwayat belanja dan buat list
        pesanan.forEach(item => {
            const hargaRupiah = parseInt(item.total_harga).toLocaleString('id-ID');
            
            // Format Tanggal MySQL ke format Indonesia
            const tgl = new Date(item.tanggal);
            const tglIndo = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            // Warna status
            let badgeClass = 'bg-warning text-dark';
            if(item.status.toLowerCase() === 'selesai' || item.status.toLowerCase() === 'sukses') badgeClass = 'bg-success';
            if(item.status.toLowerCase() === 'batal') badgeClass = 'bg-danger';

            const cardHTML = `
            <div class="col-12">
                <div class="card shadow-sm border-0" style="border-radius: 12px;">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <small class="text-muted fw-bold">${tglIndo}</small>
                            <span class="badge ${badgeClass} rounded-pill" style="font-size: 0.7rem;">${item.status}</span>
                        </div>
                        <h6 class="fw-bold mb-1 text-dark" style="font-size: 0.95rem;">Total: Rp ${hargaRupiah}</h6>
                        <small class="text-muted d-block" style="font-size: 0.8rem; line-height: 1.4;">
                            ${item.detail_pesanan}
                        </small>
                    </div>
                </div>
            </div>`;
            pesananListEl.innerHTML += cardHTML;
        });
    }

    // 6. Logika Tombol Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        const konfirmasi = confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
        if (konfirmasi) {
            // Hapus semua data memori login
            localStorage.clear();
            // Arahkan ke halaman login
            window.location.href = "index.html";
        }
    });
});