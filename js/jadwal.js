import { laporTanam, ambilJadwal, kirimPesanTeks, selesaikanJadwal } from './api.js';

const currentUser = localStorage.getItem('username');
let dataJadwalGlobal = []; 
let jadwalAktifDiModal = null; // Menyimpan ID jadwal yang sedang dibuka

// Variabel cuaca
let globalWeatherData = { kota: "Mendeteksi...", suhu: 0, hujan: 0, lembap: 0, kondisi: "Normal" };

document.addEventListener('DOMContentLoaded', async () => {
    if (!currentUser) { window.location.href = "index.html"; return; }

    document.getElementById('jdw-tanggal').valueAsDate = new Date();
    initWeather();
    muatJadwal();

    const formJadwal = document.getElementById('form-jadwal');
    if (formJadwal) {
        formJadwal.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const tanaman = document.getElementById('jdw-tanaman').value;
            const lokasi = document.getElementById('jdw-lokasi').value;
            const tanggal = document.getElementById('jdw-tanggal').value;
            const btnSimpan = document.getElementById('btn-simpan-jadwal');

            btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm"></span> AI Menyusun Fase...';
            btnSimpan.disabled = true;

            const tglIndo = new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            // PROMPT MEMAKSA HASIL JSON
            const promptGemini = `
            Saya menanam "${tanaman}" di "${lokasi}" pada ${tglIndo}. 
            Cuaca saat ini: Suhu ${globalWeatherData.suhu}°C, Kelembapan ${globalWeatherData.lembap}%, Curah Hujan ${globalWeatherData.hujan} mm.
            
            Keluarkan jawaban HANYA dalam format JSON valid (tanpa markdown blok \`\`\`json). Struktur JSON wajib seperti ini:
            {
              "analisa": "Analisa singkat kecocokan cuaca...",
              "estimasi_panen": "Bulan/Tahun perkiraan panen",
              "fase": [
                {"id": 1, "judul": "Fase 1: Persiapan", "deskripsi": "Lakukan X...", "selesai": false},
                {"id": 2, "judul": "Fase 2: Minggu ke-1", "deskripsi": "Lakukan Y...", "selesai": false}
              ]
            }
            Buatkan minimal 4 fase sampai panen.
            `;

            let jsonAI = "";
            try {
                const teksKotor = await kirimPesanTeks(promptGemini);
                // Bersihkan teks kalau AI ngeyel pakai markdown
                const teksBersih = teksKotor.replace(/```json/gi, '').replace(/```/g, '').trim();
                JSON.parse(teksBersih); // Test parse
                jsonAI = teksBersih;
            } catch (error) {
                alert("AI gagal merespon dalam format yang benar. Coba lagi.");
                btnSimpan.innerHTML = "🤖 Buat Panduan Interaktif";
                btnSimpan.disabled = false;
                return;
            }

            btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';
            
            // Simpan JSON mentah ke database
            const hasilSimpan = await laporTanam(currentUser, tanaman, tanggal, jsonAI);
            
            if (hasilSimpan && hasilSimpan.status === "sukses") {
                formJadwal.reset();
                document.getElementById('jdw-tanggal').valueAsDate = new Date();
                document.getElementById('jdw-lokasi').value = globalWeatherData.kota;
                await muatJadwal();
            } else { alert("❌ Gagal menyimpan."); }

            btnSimpan.innerHTML = "🤖 Buat Panduan Interaktif";
            btnSimpan.disabled = false;
        });
    }

    document.getElementById('filter-jadwal').addEventListener('change', renderJadwal);
    
    // Fungsi Tombol Hapus di Modal
    document.getElementById('btn-hapus-jadwal').addEventListener('click', async () => {
        if(confirm("Yakin ingin menghapus tanaman ini secara permanen?")) {
            await hapusJadwal(jadwalAktifDiModal.id);
            bootstrap.Modal.getInstance(document.getElementById('modalAI')).hide();
            muatJadwal();
        }
    });

    // Fungsi Tombol Selesai di Modal
    document.getElementById('btn-selesai-jadwal').addEventListener('click', async () => {
        if(confirm("Tandai tanaman ini sudah panen/selesai?")) {
            await selesaikanJadwal(jadwalAktifDiModal.id);
            bootstrap.Modal.getInstance(document.getElementById('modalAI')).hide();
            muatJadwal();
        }
    });
});

async function muatJadwal() {
    dataJadwalGlobal = await ambilJadwal(currentUser); 
    renderJadwal();
}

function renderJadwal() {
    const listEl = document.getElementById('jadwal-list');
    const filterAktif = document.getElementById('filter-jadwal').value;
    listEl.innerHTML = '';

    const dataTersaring = dataJadwalGlobal.filter(item => item.status === filterAktif);

    if (dataTersaring.length === 0) {
        listEl.innerHTML = `<div class="col-12 text-center py-5"><h5 class="text-muted">Belum ada tanaman di kategori ini.</h5></div>`;
        return;
    }

    dataTersaring.forEach((item) => {
        const indexAsli = dataJadwalGlobal.findIndex(x => x.id === item.id);
        const tgl = new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        let info = { estimasi_panen: "Menunggu..." };
        try { info = JSON.parse(item.panduan_ai); } catch(e) {}

        const isAktif = item.status === 'Aktif';
        const cardHTML = `
        <div class="col-12 col-md-6">
            <div class="card shadow-sm border-0 h-100 ${!isAktif ? 'bg-light' : ''}" style="border-radius: 16px; border-left: 5px solid ${isAktif ? '#198754' : '#6c757d'} !important;">
                <div class="card-body p-3">
                    <h5 class="fw-bold text-success mb-1">${item.tanaman}</h5>
                    <small class="text-muted d-block mb-1">📅 Ditanam: ${tgl}</small>
                    <small class="text-primary fw-bold d-block mb-3">🎯 Estimasi Panen: ${info.estimasi_panen}</small>
                    <button class="btn btn-sm ${isAktif ? 'btn-success' : 'btn-secondary'} w-100 rounded-pill fw-bold" onclick="bukaPanduanLokal(${indexAsli})">
                        ${isAktif ? '📋 Update Fase Tanam' : '📖 Lihat Riwayat Tanam'}
                    </button>
                </div>
            </div>
        </div>`;
        listEl.innerHTML += cardHTML;
    });
}

// BUKA MODAL & RENDER CHECKLIST JSON
window.bukaPanduanLokal = function(index) {
    const item = dataJadwalGlobal[index];
    jadwalAktifDiModal = item; // Simpan ke variabel global
    
    document.getElementById('modal-title-tanaman').innerText = `📋 Panduan: ${item.tanaman}`;
    const contentEl = document.getElementById('ai-response-content');
    
    try {
        const dataPanduan = JSON.parse(item.panduan_ai);
        
        let htmlContent = `
            <div class="alert alert-info border-0 shadow-sm rounded-3 mb-4">
                <strong>🌍 Analisa Lokasi:</strong><br>${dataPanduan.analisa}
            </div>
            <h6 class="fw-bold text-success mb-3">Fase Perawatan:</h6>
            <div class="list-group list-group-flush shadow-sm rounded-3">
        `;

        dataPanduan.fase.forEach((fase, i) => {
            const isChecked = fase.selesai ? 'checked' : '';
            const textClass = fase.selesai ? 'text-decoration-line-through text-muted' : 'text-dark fw-bold';
            
            htmlContent += `
                <div class="list-group-item p-3 border-bottom" style="background-color: ${fase.selesai ? '#f8f9fa' : '#ffffff'};">
                    <div class="form-check d-flex align-items-start">
                        <input class="form-check-input mt-1 me-3 border-success" style="transform: scale(1.3);" type="checkbox" ${isChecked} onchange="updateFase(${index}, ${i}, this.checked)" ${item.status === 'Selesai' ? 'disabled' : ''}>
                        <label class="form-check-label w-100">
                            <span class="d-block ${textClass}">${fase.judul}</span>
                            <small class="text-muted">${fase.deskripsi}</small>
                        </label>
                    </div>
                </div>
            `;
        });
        
        htmlContent += `</div>`;
        contentEl.innerHTML = htmlContent;

    } catch(e) {
        contentEl.innerHTML = `<div class="alert alert-warning">Gagal membaca data struktur.</div>`;
    }

    new bootstrap.Modal(document.getElementById('modalAI')).show();
};

// UPDATE STATUS CENTANG KE DATABASE
window.updateFase = async function(indexJadwal, indexFase, isChecked) {
    let item = dataJadwalGlobal[indexJadwal];
    let dataPanduan = JSON.parse(item.panduan_ai);
    
    // Ubah status array JSON di memori
    dataPanduan.fase[indexFase].selesai = isChecked;
    item.panduan_ai = JSON.stringify(dataPanduan); // Timpa string lokal
    
    // Kirim JSON terbaru ke server PHP
    bukaPanduanLokal(indexJadwal); // Render ulang agar tercoret
    await updatePanduanDB(item.id, item.panduan_ai); 
};

// --- FUNGSI CUACA (TIDAK BERUBAH) ---
function initWeather() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            getCityName(pos.coords.latitude, pos.coords.longitude);
            getWeatherData(pos.coords.latitude, pos.coords.longitude);
        }, () => { getCityName(-6.1783, 106.6319); getWeatherData(-6.1783, 106.6319); });
    }
}
async function getCityName(lat, lon) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
        const data = await res.json();
        const kota = data.locality || data.city || "Lokasi Saya";
        document.getElementById('w-city').innerText = kota;
        globalWeatherData.kota = kota; 
        const inputLokasi = document.getElementById('jdw-lokasi');
        if(inputLokasi) inputLokasi.value = kota;
    } catch (e) {}
}
async function getWeatherData(lat, lon) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=auto`);
        const curr = (await res.json()).current;
        document.getElementById('w-temp').innerText = Math.round(curr.temperature_2m) + "°C";
        document.getElementById('w-humid').innerText = curr.relative_humidity_2m + "%";
        document.getElementById('w-rain').innerText = curr.precipitation + " mm";
        
        globalWeatherData.suhu = curr.temperature_2m;
        globalWeatherData.hujan = curr.precipitation;
        globalWeatherData.lembap = curr.relative_humidity_2m;
        
        document.getElementById('weather-loading').classList.add('d-none');
        document.getElementById('weather-content').classList.remove('d-none');
    } catch (e) {}
}

// --- FUNGSI KOMUNIKASI API LOKAL (DIPINDAH KE SINI AGAR CEPAT) ---
async function updatePanduanDB(id, jsonBaru) {
    await fetch(`api/update_panduan.php`, { method: 'POST', body: JSON.stringify({ id: id, panduan_ai: jsonBaru }) });
}
async function hapusJadwal(id) {
    await fetch(`api/hapus_jadwal.php`, { method: 'POST', body: JSON.stringify({ id: id }) });
}