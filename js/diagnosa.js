import { kirimKeGemini, kirimPesanTeks, simpanRiwayat, ambilRiwayat } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const imageInput = document.getElementById('imageInput');
    const btnAnalisa = document.getElementById('btn-analisa');
    const resultArea = document.getElementById('result-area');
    const panduanArea = document.getElementById('panduan-area'); 
    const outputText = document.getElementById('output-text');
    
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const btnSendChat = document.getElementById('btn-send-chat');

    const btnLoadHistory = document.getElementById('btn-load-history');
    const historyList = document.getElementById('history-list');

    // Modal Elements
    const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
    const detailTitle = document.getElementById('detail-title');
    const detailSolusi = document.getElementById('detail-solusi');
    const detailTgl = document.getElementById('detail-tgl');

    const currentUser = localStorage.getItem('user_si_tani') || "Tamu";
    let lastDiagnosisContext = ""; 

    // --- 1. DIAGNOSA UTAMA ---
    btnAnalisa.addEventListener('click', async () => {
        if (imageInput.files.length === 0) {
            alert("Upload foto daun dulu ya!");
            return;
        }

        const textAsli = btnAnalisa.innerHTML;
        btnAnalisa.innerHTML = '⏳ Menganalisa Penyakit...';
        btnAnalisa.disabled = true;
        resultArea.classList.add('d-none');

        try {
            const file = imageInput.files[0];

            // PROMPT DIAGNOSA (Tetap HTML untuk Laporan Medis)
            const prompt = `
                Kamu adalah Dokter Tanaman Profesional (Si Tani).
                Tugas: Diagnosa penyakit dari foto daun ini.
                Target User: Petani Indonesia.

                LANGKAH 1: Validasi
                Jika BUKAN TANAMAN, Output HTML: <div class='alert alert-danger'>❌ Gambar Tidak Dikenali.</div>
                
                LANGKAH 2: Diagnosa Detail
                OUTPUT WAJIB FORMAT HTML (Tanpa Markdown):
                
                <h4 class="text-danger fw-bold mb-3">Diagnosa: [NAMA PENYAKIT]</h4>
                
                <div class="mb-3">
                    <span class="badge bg-warning text-dark mb-2">Gejala & Penyebab</span>
                    <p class="small text-muted">[Jelaskan penyebab singkat]</p>
                </div>

                <hr>

                <h6 class="fw-bold text-success mb-2">💊 Rekomendasi Pengobatan:</h6>
                <ol class="small mb-3 ps-3">
                    <li>[Langkah 1]</li>
                    <li>[Langkah 2]</li>
                    <li>[Langkah 3]</li>
                </ol>

                <div class="card bg-light border-0 p-3 mb-3">
                    <h6 class="fw-bold text-primary mb-2">🛒 Rekomendasi Produk:</h6>
                    <ul class="small mb-0 ps-3">
                        <li>
                            <b>Obat/Pestisida:</b> [Bahan Aktif] <br>
                            <i>Contoh Merk: [Sebutkan 2-3 Merk Indonesia]</i>
                        </li>
                        <li class="mt-2">
                            <b>Dosis:</b> <br>
                            [Takaran sendok/tutup per liter]
                        </li>
                    </ul>
                </div>
                
                <div class="alert alert-info small border-0">
                    <b>💡 Tips Vitamin:</b> [Nama Pupuk/ZPT] untuk pemulihan.
                </div>
            `;

            const hasilHTML = await kirimKeGemini(file, prompt);

            // Tampilkan Hasil
            outputText.innerHTML = hasilHTML;
            resultArea.classList.remove('d-none');
            panduanArea.classList.add('d-none');
            resultArea.scrollIntoView({ behavior: 'smooth' });

            // Simpan Context (Bersihkan tag HTML untuk ingatan Chatbot)
            lastDiagnosisContext = hasilHTML.replace(/<[^>]*>?/gm, ' '); 

            // Simpan ke Database
            if (hasilHTML.includes('<h4')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = hasilHTML;
                let namaPenyakit = tempDiv.querySelector('h4')?.innerText.replace('Diagnosa:', '').trim() || "Penyakit Tanaman";
                let solusiText = tempDiv.innerText.replace(namaPenyakit, "").replace(/\n+/g, "; ").trim().substring(0, 500);

                if (!namaPenyakit.includes("Tidak Dikenali")) {
                    await simpanRiwayat(currentUser, namaPenyakit, solusiText);
                }
            }

        } catch (error) {
            console.error(error);
            alert("Gagal diagnosa: " + error.message);
        } finally {
            btnAnalisa.innerHTML = textAsli;
            btnAnalisa.disabled = false;
        }
    });

    // --- 2. CHAT LANJUTAN (YANG DIPERBAIKI) ---
    btnSendChat.addEventListener('click', async () => {
        const pesanUser = chatInput.value.trim();
        if(!pesanUser) return;

        // Tampilkan pesan user (User pakai text biasa agar aman)
        appendChat(pesanUser, 'user');
        chatInput.value = '';
        
        // Loading
        const loadingId = appendChat("Sedang mengetik...", 'ai', true);

        try {
            const promptChat = `
            CONTEXT PENYAKIT: "${lastDiagnosisContext}"
            PERTANYAAN USER: "${pesanUser}"
            
            INSTRUKSI GAYA BAHASA (PENTING):
            1. Jawablah layaknya chat WhatsApp dengan seorang pakar. 
            2. Gunakan bahasa Indonesia yang luwes, ramah, tapi tetap ahli.
            3. JANGAN gunakan format Markdown seperti (###, ---, atau ##).
            4. Jika ingin menebalkan kata penting, gunakan tanda bintang dua (**kata**).
            5. Jika ingin membuat poin, gunakan strip (-) atau angka biasa.
            6. Jawab singkat dan padat (maksimal 3-4 kalimat per bubble chat).
            `;

            const balasanAI = await kirimPesanTeks(promptChat);
            
            // Hapus loading
            document.getElementById(loadingId).remove();
            
            // Format Balasan AI (Bersihkan Markdown jadi HTML cantik)
            const formattedReply = formatMessage(balasanAI);
            
            // Tampilkan (Pakai innerHTML karena sudah diformat)
            appendChat(formattedReply, 'ai', false, true); // true = isHTML

        } catch (e) {
            document.getElementById(loadingId).innerText = "Gagal membalas.";
        }
    });

    // FUNGSI PEMBERSIH TEXT (MAGIC FUNCTION) 🪄
    function formatMessage(text) {
        // 1. Hapus tanda pagar heading (### Judul) -> jadi Bold biasa
        let clean = text.replace(/#{1,6}\s?/g, '');
        
        // 2. Ubah **Teks Tebal** menjadi <b>Teks Tebal</b>
        clean = clean.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        
        // 3. Ubah *Teks Miring* menjadi <i>Teks Miring</i>
        clean = clean.replace(/\*(.*?)\*/g, '<i>$1</i>');

        // 4. Ubah Baris Baru (\n) menjadi <br> agar turun baris di HTML
        clean = clean.replace(/\n/g, '<br>');

        return clean;
    }

    function appendChat(text, sender, isLoading = false, isHTML = false) {
        const div = document.createElement('div');
        div.className = sender === 'user' ? 'msg-user clearfix' : 'msg-ai clearfix';
        
        if (isHTML) {
            div.innerHTML = text; // Untuk AI yang sudah diformat
        } else {
            div.innerText = text; // Untuk User (Text biasa)
        }

        if(isLoading) div.id = 'loading-' + Date.now();
        
        const wrapper = document.createElement('div');
        wrapper.className = "clearfix";
        wrapper.appendChild(div);
        
        chatContainer.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return div.id;
    }

    // --- 3. RIWAYAT ---
    btnLoadHistory.addEventListener('click', async () => {
        historyList.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-success spinner-border-sm"></div></div>';
        const data = await ambilRiwayat(currentUser);

        if(data.length === 0) {
            historyList.innerHTML = '<div class="text-center p-4 text-muted small">Belum ada riwayat.</div>';
            return;
        }

        let html = '';
        data.forEach((item) => {
            const safeSolusi = item.solusi.replace(/"/g, '&quot;'); 
            const dateObj = new Date(item.tanggal);
            const tglIndo = dateObj.toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});

            html += `
            <button class="list-group-item list-group-item-action border-0 shadow-sm mb-2 rounded-3 p-3 btn-detail-history" 
                data-penyakit="${item.penyakit}" 
                data-tgl="${tglIndo}"
                data-solusi="${safeSolusi}">
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <h6 class="mb-0 fw-bold text-success text-truncate" style="max-width: 70%;">${item.penyakit}</h6>
                    <small class="text-muted" style="font-size: 0.7rem;">${tglIndo}</small>
                </div>
                <small class="text-muted d-block mt-1">Ketuk untuk lihat detail obat ➔</small>
            </button>`;
        });
        
        historyList.innerHTML = html;

        document.querySelectorAll('.btn-detail-history').forEach(btn => {
            btn.addEventListener('click', function() {
                detailTitle.innerText = this.getAttribute('data-penyakit');
                detailTgl.innerText = this.getAttribute('data-tgl');
                detailSolusi.innerHTML = this.getAttribute('data-solusi').replace(/;/g, '<br><br>• '); 
                detailModal.show();
            });
        });
    });
});