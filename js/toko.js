import { ambilProduk, kirimPesanan } from './api.js';

// Variabel Global untuk Keranjang
let keranjang = [];

document.addEventListener('DOMContentLoaded', async () => {
    
    const container = document.getElementById('produk-list');
    const currentUser = localStorage.getItem('user_si_tani') || "Tamu";
    
    // Elemen UI Keranjang
    const cartCount = document.getElementById('cart-count');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const btnCheckout = document.getElementById('btn-checkout');

    // 1. Load Produk
    try {
        const products = await ambilProduk();

        if (!products || products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">Toko sedang tutup / kosong.</div>';
            return;
        }

        let html = "";
        products.forEach(p => {
            const imgUrl = p.Gambar ? p.Gambar : "https://dummyimage.com/300x300/2E8B57/fff?text=Tani";
            const hargaIndo = formatRupiah(p.Harga);

            html += `
            <div class="col-6 col-md-4">
                <div class="card h-100 border-0 shadow-sm product-card">
                    <img src="${imgUrl}" class="card-img-top p-2 rounded" style="height: 140px; object-fit: cover;">
                    <div class="card-body p-2 d-flex flex-column">
                        <h6 class="card-title small fw-bold text-truncate mb-1">${p.Nama}</h6>
                        <p class="card-text text-success fw-bold small mb-2">${hargaIndo}</p>
                        <button class="btn btn-sm btn-outline-success w-100 mt-auto btn-add-cart" 
                            data-nama="${p.Nama}" 
                            data-harga="${p.Harga}">
                            + Keranjang
                        </button>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;

        // Event Listener: Tambah ke Keranjang
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const nama = this.getAttribute('data-nama');
                const harga = parseInt(this.getAttribute('data-harga'));
                
                tambahKeKeranjang(nama, harga);
                
                // Efek visual sederhana (Ganti teks sebentar)
                const oriText = this.innerHTML;
                this.innerHTML = "✅ Masuk";
                this.classList.replace('btn-outline-success', 'btn-success');
                setTimeout(() => {
                    this.innerHTML = oriText;
                    this.classList.replace('btn-success', 'btn-outline-success');
                }, 1000);
            });
        });

    } catch (error) {
        container.innerHTML = `<div class="text-danger small text-center">Gagal memuat toko.<br>${error.message}</div>`;
    }

    // --- LOGIKA KERANJANG ---

    function tambahKeKeranjang(nama, harga) {
        // Cek apakah barang sudah ada?
        const itemAda = keranjang.find(item => item.nama === nama);
        
        if (itemAda) {
            itemAda.qty += 1; // Tambah jumlahnya
        } else {
            keranjang.push({ nama: nama, harga: harga, qty: 1 }); // Masukkan baru
        }
        
        updateUIKeranjang();
    }

    // Fungsi Render Tampilan Keranjang (Di dalam Modal)
    window.hapusItem = function(nama) { // Harus window agar bisa dipanggil onclick HTML
        keranjang = keranjang.filter(item => item.nama !== nama);
        updateUIKeranjang();
    }

    function updateUIKeranjang() {
        // 1. Update Badge Angka
        const totalItems = keranjang.reduce((sum, item) => sum + item.qty, 0);
        cartCount.innerText = totalItems;

        // 2. Render List di Modal
        if (keranjang.length === 0) {
            cartItemsList.innerHTML = '<li class="list-group-item text-center text-muted small">Keranjang kosong.</li>';
            btnCheckout.disabled = true;
            cartTotal.innerText = "Rp 0";
            return;
        }

        let listHtml = "";
        let totalHarga = 0;

        keranjang.forEach(item => {
            const subtotal = item.harga * item.qty;
            totalHarga += subtotal;
            
            listHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center p-2">
                <div>
                    <h6 class="my-0 small fw-bold">${item.nama}</h6>
                    <small class="text-muted">${item.qty} x ${formatRupiah(item.harga)}</small>
                </div>
                <div class="d-flex align-items-center">
                    <span class="text-success fw-bold small me-3">${formatRupiah(subtotal)}</span>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="hapusItem('${item.nama}')">×</button>
                </div>
            </li>`;
        });

        cartItemsList.innerHTML = listHtml;
        cartTotal.innerText = formatRupiah(totalHarga);
        btnCheckout.disabled = false;
        
        // Simpan total harga di tombol checkout biar gampang diambil
        btnCheckout.setAttribute('data-total', totalHarga);
    }

    // --- CHECKOUT ---
    btnCheckout.addEventListener('click', async () => {
        if(keranjang.length === 0) return;

        btnCheckout.innerHTML = "Mengirim...";
        btnCheckout.disabled = true;

        // 1. Susun Data Pesanan menjadi String Rapi
        // Contoh: "Pupuk (2), Sekop (1)"
        const detailPesanan = keranjang.map(item => `${item.nama} (${item.qty})`).join(", ");
        const totalBayar = btnCheckout.getAttribute('data-total');

        // 2. Kirim ke Database
        const sukses = await kirimPesanan(currentUser, detailPesanan, totalBayar);

        if (sukses) {
            alert(`✅ Pesanan Berhasil!\n\nItem: ${detailPesanan}\nTotal: ${formatRupiah(totalBayar)}\n\nAdmin akan segera menghubungi Anda.`);
            // Reset Keranjang
            keranjang = [];
            updateUIKeranjang();
            // Tutup Modal (Bootstrap 5 way)
            const modalEl = document.getElementById('cartModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
        } else {
            alert("❌ Gagal mengirim pesanan.");
        }
        
        btnCheckout.innerHTML = "Checkout";
        btnCheckout.disabled = false;
    });

    // Helper: Format Rupiah
    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    }
});