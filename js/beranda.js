import { ambilProduk } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Pastikan user sudah login (Opsional, tapi baik untuk keamanan)
    const currentUser = localStorage.getItem('username');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Ambil elemen wadah produk
    const previewContainer = document.getElementById('preview-produk');
    
    // Tarik data produk dari database menggunakan fungsi API yang sudah ada
    const produk = await ambilProduk();
    previewContainer.innerHTML = '';

    if (produk.length === 0) {
        previewContainer.innerHTML = `
            <div class="col-12 text-center py-4 bg-white rounded-4 shadow-sm border border-light">
                <p class="text-muted mb-0 small">Belum ada produk di toko.</p>
            </div>`;
        return;
    }

    // Ambil MAKSIMAL 4 produk terbaru saja untuk ditampilkan di Beranda
    const produkPreview = produk.slice(0, 4);

    produkPreview.forEach(item => {
        const hargaRupiah = parseInt(item.harga).toLocaleString('id-ID');
        
        const cardHTML = `
        <div class="col-6 col-md-3">
            <a href="toko.html" class="text-decoration-none">
                <div class="card h-100 product-card shadow-sm border-0 overflow-hidden" style="border-radius: 16px;">
                    <img src="${item.gambar}" class="card-img-top bg-light" alt="${item.nama_produk}" style="height: 110px; object-fit: cover;">
                    <div class="card-body p-3 d-flex flex-column">
                        <span class="badge bg-success bg-opacity-10 text-success mb-1" style="width: fit-content; font-size: 0.6rem;">${item.kategori}</span>
                        <h6 class="card-title fw-bold text-dark mb-1 lh-sm" style="font-size: 0.85rem;">${item.nama_produk}</h6>
                        <span class="fw-bold text-success mt-auto" style="font-size: 0.9rem;">Rp ${hargaRupiah}</span>
                    </div>
                </div>
            </a>
        </div>`;
        previewContainer.innerHTML += cardHTML;
    });
});