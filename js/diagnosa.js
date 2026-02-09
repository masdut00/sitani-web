import { kirimKeGemini, simpanRiwayat } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const btnAnalisa = document.getElementById('btn-analisa');
    const resultArea = document.getElementById('result-area');
    const outputText = document.getElementById('output-text');

    // 1. Preview Gambar
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('d-none');
            }
            reader.readAsDataURL(file);
        }
    });

    // 2. Tombol Analisa
    btnAnalisa.addEventListener('click', async () => {
        
        if (imageInput.files.length === 0) {
            alert("Upload foto daun dulu!");
            return;
        }

        const checkboxes = document.querySelectorAll('.bahan-check:checked');
        let listBahan = [];
        checkboxes.forEach((cb) => listBahan.push(cb.value));
        const bahanString = listBahan.length > 0 ? listBahan.join(", ") : "Tidak ada bahan (Hanya air)";
        const currentUser = localStorage.getItem('user_si_tani') || "Tamu";

        // Tampilan Loading
        btnAnalisa.innerHTML = '⏳ Sedang Menganalisa...';
        btnAnalisa.disabled = true;
        resultArea.classList.add('d-none');

        try {
            const file = imageInput.files[0];

            // --- PROMPT ENGINEERING ---
            // Kita paksa format HTML yang spesifik agar mudah "dicuri" datanya oleh kodingan kita
            const prompt = `
                Bertindaklah sebagai Ahli Patologi Tanaman.
                Analisis gambar daun ini.
                BAHAN TERSEDIA: [ ${bahanString} ].

                OUTPUT WAJIB HTML (Tanpa Markdown):
                <h5 id="hasil-penyakit" class="text-danger fw-bold">Diagnosa: [NAMA PENYAKIT]</h5>
                <p><b>Penyebab:</b> [PENJELASAN SINGKAT]</p>
                <hr>
                <h6 class="text-success fw-bold">💊 Resep Obat:</h6>
                <ul id="hasil-solusi">
                    <li>Gunakan bahan: [BAHAN YANG RELEVAN]</li>
                    <li>Caranya: [CARA RACIK & DOSIS]</li>
                    <li>Aplikasi: [CARA SEMPROT/SIRAM]</li>
                </ul>
                <div class="alert alert-warning mt-2 small"><b>Saran:</b> [SARAN FISIK]</div>
            `;

            // 3. Kirim ke AI
            const hasilHTML = await kirimKeGemini(file, prompt);

            // 4. Tampilkan Hasil ke User
            outputText.innerHTML = hasilHTML;
            resultArea.classList.remove('d-none');
            resultArea.scrollIntoView({ behavior: 'smooth' });

            // --- TEKNIK EKSTRAKSI DATA CERDAS ---
            console.log("Mengekstrak data untuk laporan...");

            // Kita buat elemen HTML bayangan (tidak terlihat) untuk membaca strukturnya
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = hasilHTML;

            // A. Ambil Nama Penyakit (Cari elemen h5)
            let namaPenyakit = "Penyakit Terdeteksi";
            const h5 = tempDiv.querySelector('h5'); 
            if (h5) {
                // Hapus kata "Diagnosa:" biar bersih
                namaPenyakit = h5.innerText.replace('Diagnosa:', '').trim();
            }

            // B. Ambil Solusi (Cari elemen ul/list)
            let solusiLengkap = "Cek Aplikasi";
            const listItems = tempDiv.querySelectorAll('ul li');
            if (listItems.length > 0) {
                // Ambil teks dari setiap <li>, bersihkan spasi, lalu gabung
                const solusiArray =Array.from(listItems).map(li => li.innerText.trim());
                solusiLengkap = solusiArray.join("; "); 
            }
            
            if (listObat) {
                // Ambil teks di dalam list, ganti baris baru dengan titik koma (;) agar rapi di Excel/Sheet
                // Contoh: "Gunakan Sabun; Caranya Campur Air; Aplikasi Semprot Sore"
                solusiLengkap = listObat.innerText.replace(/\n/g, '; ').trim();
            }

            console.log("Simpan ke DB:", namaPenyakit, "| Solusi:", solusiLengkap);

            // 5. Kirim ke Google Sheets
            await simpanRiwayat(currentUser, namaPenyakit, solusiLengkap);

        } catch (error) {
            console.error("Error:", error);
            alert("Gagal diagnosa. Cek koneksi internet.");
        } finally {
            btnAnalisa.innerHTML = '🔍 Periksa Sekarang';
            btnAnalisa.disabled = false;
        }
    });
});