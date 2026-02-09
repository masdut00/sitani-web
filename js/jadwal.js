import { kirimPesanTeks, laporTanam } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('jadwal-result'); // Container list jadwal
    const btnBuat = document.getElementById('btn-buat-jadwal');
    const listKegiatanContainer = document.getElementById('list-kegiatan'); // Isi detail jadwal
    
    const currentUser = localStorage.getItem('user_si_tani') || "Tamu";
    const STORAGE_KEY = `jadwal_multi_${currentUser}`; // Key baru (Array)

    // 1. RENDER AWAL: Tampilkan Daftar Tanaman
    renderDaftarTanaman();

    // 2. TOMBOL BUAT JADWAL BARU
    btnBuat.addEventListener('click', async () => {
        const tanaman = document.getElementById('jenis-tanaman').value;
        const tgl = document.getElementById('tgl-tanam').value;

        if (!tgl) { alert("Pilih tanggal tanam!"); return; }

        btnBuat.innerHTML = '⏳ Meracik Jadwal...';
        btnBuat.disabled = true;

        try {
            // A. Minta AI
            const prompt = `
            Bertindaklah sebagai Konsultan Pertanian. 
            Buatkan Checklist Kegiatan Perawatan tanaman: ${tanaman}.
            Mulai tanam: ${tgl}.
            Berikan 5 kegiatan kunci.
            OUTPUT HTML (Tanpa Markdown):
            <div class="list-group-item d-flex gap-3 align-items-start">
                <input class="form-check-input flex-shrink-0" type="checkbox">
                <div>
                    <h6 class="mb-1 fw-bold text-success">Hari ke-X (${tgl})</h6>
                    <p class="mb-0 small text-muted">Deskripsi kegiatan.</p>
                </div>
            </div>`;

            const hasilHTML = await kirimPesanTeks(prompt);

            // B. Simpan ke Array LocalStorage
            const jadwalBaru = {
                id: Date.now(), // ID Unik pakai waktu sekarang
                tanaman: tanaman,
                tglMulai: tgl,
                kontenHTML: hasilHTML
            };

            tambahKeStorage(jadwalBaru);

            // C. Lapor Admin
            laporTanam(currentUser, tanaman, tgl);

            // D. Refresh Tampilan
            renderDaftarTanaman();
            alert(`✅ Jadwal ${tanaman} berhasil dibuat!`);

        } catch (error) {
            console.error(error);
            alert("Gagal membuat jadwal.");
        } finally {
            btnBuat.innerHTML = '🤖 Buat Jadwal Otomatis';
            btnBuat.disabled = false;
        }
    });

    // 3. FUNGSI RENDER LIST (DASHBOARD)
    function renderDaftarTanaman() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Bersihkan area hasil dulu
        // Kita butuh elemen khusus untuk list summary
        let dashboardArea = document.getElementById('dashboard-area');
        if (!dashboardArea) {
            // Kalau belum ada di HTML, buat via JS
            dashboardArea = document.createElement('div');
            dashboardArea.id = 'dashboard-area';
            dashboardArea.className = 'mt-4';
            inputSection.parentNode.insertBefore(dashboardArea, resultSection);
        }

        if (data.length === 0) {
            dashboardArea.innerHTML = '<div class="alert alert-info small">Belum ada tanaman. Yuk tanam sekarang!</div>';
            return;
        }

        // Buat List Card Ringkas
        let html = '<h6 class="fw-bold mb-3">🌱 Tanaman Saya:</h6>';
        data.forEach(item => {
            html += `
            <div class="card mb-2 shadow-sm border-0">
                <div class="card-body d-flex justify-content-between align-items-center p-3">
                    <div>
                        <h6 class="mb-0 fw-bold text-success">${item.tanaman}</h6>
                        <small class="text-muted">Mulai: ${item.tglMulai}</small>
                    </div>
                    <div>
                        <button onclick="lihatDetail(${item.id})" class="btn btn-sm btn-outline-success">Lihat</button>
                        <button onclick="hapusTanaman(${item.id})" class="btn btn-sm btn-outline-danger">×</button>
                    </div>
                </div>
            </div>`;
        });
        
        dashboardArea.innerHTML = html;
        
        // Sembunyikan detail saat mode dashboard
        resultSection.classList.add('d-none');
        inputSection.classList.remove('d-none'); // Tampilkan form tambah
    }

    // 4. FUNGSI STORAGE
    function tambahKeStorage(item) {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        data.push(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // 5. WINDOW FUNCTIONS (Agar bisa dipanggil onclick HTML)
    window.hapusTanaman = function(id) {
        if(!confirm("Hapus jadwal tanaman ini?")) return;
        
        let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        data = data.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderDaftarTanaman();
    }

    window.lihatDetail = function(id) {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const item = data.find(i => i.id === id);
        
        if(item) {
            // Sembunyikan Dashboard, Tampilkan Detail
            document.getElementById('dashboard-area').innerHTML = `
                <button onclick="location.reload()" class="btn btn-sm btn-secondary mb-3">⬅ Kembali</button>
                <h5 class="text-success fw-bold">${item.tanaman}</h5>
            `;
            
            // Masukkan HTML Checklist
            listKegiatanContainer.innerHTML = item.kontenHTML;
            resultSection.classList.remove('d-none');
            inputSection.classList.add('d-none');

            // Restore status centang (Logika simpan centang agak kompleks di multi-item,
            // untuk MVP kita load HTML statis dulu. Jika user centang, perlu update array spesifik)
            // *Fitur Auto-Save Centang untuk Multi-Item butuh logika update array by ID*
            setupChecklistListener(id);
        }
    }

    function setupChecklistListener(id) {
        // Hapus listener lama biar gak numpuk (Clone node trick)
        const newElement = listKegiatanContainer.cloneNode(true);
        listKegiatanContainer.parentNode.replaceChild(newElement, listKegiatanContainer);
        
        // Listener Baru
        newElement.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                // Update Style
                const textDiv = e.target.nextElementSibling;
                e.target.checked ? textDiv.style.opacity="0.5" : textDiv.style.opacity="1";
                
                // Set Attribute di HTML string
                e.target.checked ? e.target.setAttribute('checked', 'true') : e.target.removeAttribute('checked');

                // SIMPAN PERUBAHAN KE ARRAY LOCALSTORAGE
                let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                const index = data.findIndex(i => i.id === id);
                if (index !== -1) {
                    data[index].kontenHTML = newElement.innerHTML; // Update HTML-nya
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                }
            }
        });
        
        // Re-assign variable karena node berubah
        // listKegiatanContainer = newElement; (Error const, biarkan saja DOM handle)
    }
});