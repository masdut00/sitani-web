import { ambilProduk, checkoutPesanan } from './api.js';

// Variabel untuk menyimpan barang belanjaan di memori sementara
let keranjang = [];
// Ambil username yang sedang login (Sesuaikan dengan key localStorage saat login)
const currentUser = localStorage.getItem('username') || 'petani_duta'; 

document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');

    // 1. Ambil data dari database MySQL
    const produk = await ambilProduk();
    productList.innerHTML = '';

    // 2. Jika toko kosong
    if (produk.length === 0) {
        productList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div style="font-size: 3rem; margin-bottom: 15px;">📦</div>
                <h6 class="text-muted fw-bold">Toko masih kosong.</h6>
                <small class="text-muted">Belum ada produk yang dijual saat ini.</small>
            </div>`;
        return;
    }

    // 3. Render Daftar Produk
    produk.forEach(item => {
        const hargaRupiah = parseInt(item.harga).toLocaleString('id-ID');
        const cardHTML = `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 product-card shadow-sm border-0 overflow-hidden" style="border-radius: 16px;">
                <img src="${item.gambar}" class="card-img-top bg-light" alt="${item.nama_produk}" style="height: 120px; object-fit: cover;">
                <div class="card-body p-3 d-flex flex-column">
                    <span class="badge bg-success bg-opacity-10 text-success mb-2" style="width: fit-content; font-size: 0.65rem;">${item.kategori}</span>
                    <h6 class="card-title fw-bold text-dark mb-1 lh-sm" style="font-size: 0.9rem;">${item.nama_produk}</h6>
                    <small class="text-muted d-block mb-3" style="font-size: 0.7rem;">
                        Per <b>${item.satuan}</b> <br>
                        <span class="opacity-75">Oleh: ${item.penjual_username}</span>
                    </small>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-success" style="font-size: 0.95rem;">Rp ${hargaRupiah}</span>
                        <button class="btn btn-sm btn-success rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 35px; height: 35px; font-size: 1.2rem;" onclick="tambahKeranjang(${item.id}, '${item.nama_produk}', ${item.harga})">
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        productList.innerHTML += cardHTML;
    });

    // 4. Logika Tombol Checkout
    document.getElementById('btn-checkout').addEventListener('click', async () => {
        if (keranjang.length === 0) {
            alert("Keranjang masih kosong! Silakan pilih barang dulu.");
            return;
        }

        // Susun teks pesanan, contoh: "Pupuk NPK (2), Bibit Cabai (1)"
        const detailPesanan = keranjang.map(item => `${item.nama} (${item.qty})`).join(", ");
        const totalHarga = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);

        // Ubah tombol jadi loading
        const btnCheckout = document.getElementById('btn-checkout');
        const teksAsli = btnCheckout.innerHTML;
        btnCheckout.innerHTML = "Memproses...";
        btnCheckout.disabled = true;

        // Tembak ke API (PHP)
        const hasil = await checkoutPesanan(currentUser, detailPesanan, totalHarga);

        if (hasil.status === "sukses") {
            alert("🎉 " + hasil.pesan + "\nPenjual akan segera menghubungi Anda.");
            keranjang = []; // Kosongkan keranjang setelah berhasil
            updateUIKeranjang(); // Update tampilan keranjang agar kosong lagi
            
            // Tutup modal secara otomatis
            const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            if(cartModal) cartModal.hide();
        } else {
            alert("❌ Gagal checkout: " + hasil.pesan);
        }

        // Kembalikan tombol seperti semula
        btnCheckout.innerHTML = teksAsli;
        btnCheckout.disabled = false;
    });
});

// ==========================================
// FUNGSI KERANJANG (CART SYSTEM)
// ==========================================

// Fungsi tambah barang ke array keranjang
window.tambahKeranjang = function(id, nama, harga) {
    const index = keranjang.findIndex(item => item.id === id);
    if (index > -1) {
        keranjang[index].qty += 1; // Jika barang sudah ada, tambah jumlahnya
    } else {
        keranjang.push({ id, nama, harga, qty: 1 }); // Jika belum ada, masukkan data baru
    }
    updateUIKeranjang();
};

// Fungsi menghapus barang dari keranjang
window.hapusItem = function(index) {
    keranjang.splice(index, 1);
    updateUIKeranjang();
};

// Fungsi menggambar ulang isi Modal Keranjang
function updateUIKeranjang() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    let totalItem = 0;
    let totalHarga = 0;
    let htmlKeranjang = '';

    if (keranjang.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center text-muted small py-5">
                <div style="font-size: 3rem; margin-bottom: 10px;">🛒</div>
                Keranjang masih kosong.<br>Yuk, mulai belanja!
            </div>`;
        cartCount.innerText = "0";
        cartTotalEl.innerText = "Rp 0";
        return;
    }

    keranjang.forEach((item, index) => {
        totalItem += item.qty;
        let subtotal = item.harga * item.qty;
        totalHarga += subtotal;

        htmlKeranjang += `
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <div>
                    <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">${item.nama}</h6>
                    <small class="text-muted">Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty}</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold text-success d-block" style="font-size: 0.9rem;">Rp ${subtotal.toLocaleString('id-ID')}</span>
                    <button class="btn btn-sm text-danger p-0" onclick="hapusItem(${index})"><small>Hapus</small></button>
                </div>
            </div>
        `;
    });

    // Tampilkan ke layar
    cartItemsContainer.innerHTML = htmlKeranjang;
    cartCount.innerText = totalItem;
    cartTotalEl.innerText = `Rp ${totalHarga.toLocaleString('id-ID')}`;
    
    // Animasi getar ikon keranjang (UI/UX)
    const cartBtn = cartCount.parentElement;
    cartBtn.style.transform = "scale(1.2)";
    setTimeout(() => { cartBtn.style.transform = "scale(1)"; }, 200);
}

// ==========================================
// LOGIKA TAMBAH PRODUK (PENJUAL)
// ==========================================
const formTambah = document.getElementById('form-tambah-produk');
if (formTambah) {
    formTambah.addEventListener('submit', async (e) => {
        e.preventDefault(); // Cegah halaman reload

        const dataProduk = {
            penjual_username: currentUser, // Ambil dari user yang sedang login
            nama_produk: document.getElementById('add-nama').value,
            kategori: document.getElementById('add-kategori').value,
            satuan: document.getElementById('add-satuan').value,
            harga: document.getElementById('add-harga').value,
            gambar: document.getElementById('add-gambar').value || 'https://via.placeholder.com/150',
            deskripsi: 'Produk asli dari ' + currentUser
        };

        const btnSimpan = document.getElementById('btn-simpan-produk');
        const teksAsli = btnSimpan.innerHTML;
        btnSimpan.innerHTML = "Menyimpan...";
        btnSimpan.disabled = true;

        const hasil = await tambahProdukBaru(dataProduk);

        if (hasil.status === "sukses") {
            alert("✅ " + hasil.pesan);
            
            // Tutup modal
            const modalForm = bootstrap.Modal.getInstance(document.getElementById('modalTambahProduk'));
            if(modalForm) modalForm.hide();
            
            // Reset isi form
            formTambah.reset();

            // Refresh halaman untuk memunculkan produk baru
            window.location.reload(); 
        } else {
            alert("❌ Gagal: " + hasil.pesan);
        }

        btnSimpan.innerHTML = teksAsli;
        btnSimpan.disabled = false;
    });
}