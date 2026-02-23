import { laporTanam, ambilJadwal, kirimPesanTeks, selesaikanJadwal } from './api.js';

const currentUser = localStorage.getItem('username');
let dataJadwalGlobal = []; 

// Variabel penampung cuaca agar bisa dibaca oleh AI
let globalWeatherData = { 
    kota: "Mendeteksi...", 
    suhu: 0, 
    hujan: 0, 
    lembap: 0, 
    kondisi: "Normal" 
};

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!currentUser) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "index.html";
        return;
    }

    // Set tanggal default
    document.getElementById('jdw-tanggal').valueAsDate = new Date();
    
    // Jalankan satelit cuaca saat halaman dibuka
    initWeather();

    const formJadwal = document.getElementById('form-jadwal');
    if (formJadwal) {
        formJadwal.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const tanaman = document.getElementById('jdw-tanaman').value;
            const lokasi = document.getElementById('jdw-lokasi').value; // Ambil kota yang sudah terisi otomatis
            const tanggal = document.getElementById('jdw-tanggal').value;
            const btnSimpan = document.getElementById('btn-simpan-jadwal');

            btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm"></span> 🤖 AI Menganalisa Cuaca...';
            btnSimpan.disabled = true;

            const tglObj = new Date(tanggal);
            const tglIndo = tglObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            // ==========================================
            // PROMPT SUPER AI (Berdasarkan Data Iklim Real-Time)
            // ==========================================
            const promptGemini = `
            Saya adalah petani yang akan menanam "${tanaman}" di wilayah "${lokasi}" mulai tanggal ${tglIndo}.
            Kondisi cuaca saat ini di lokasi saya adalah: Suhu ${globalWeatherData.suhu}°C, Kelembapan ${globalWeatherData.lembap}%, Curah Hujan ${globalWeatherData.hujan} mm, dengan cuaca umum ${globalWeatherData.kondisi}.
            
            Tolong buatkan analisa dan panduan jadwal tanam yang sangat detail dan terstruktur berdasarkan data iklim nyata tersebut.
            Gunakan format HTML modern (seperti <h5>, <strong>, <ul>, <li>, dan <div class="p-3 mb-2 bg-light rounded border text-dark">) agar tampilannya rapi. DILARANG KERAS menggunakan markdown.

            Wajib buatkan struktur berurutan seperti ini:
            1. 🌍 Analisa Kecocokan Cuaca: Jelaskan apakah "${tanaman}" cocok ditanam dengan suhu ${globalWeatherData.suhu}°C dan kelembapan ${globalWeatherData.lembap}%. Jika kurang cocok, berikan trik mengakalinya (misal: beri naungan).
            2. 🗓️ Estimasi Panen: Kapan perkiraan bulan/tanggal panennya.
            3. 🌱 Fase Persiapan & Hari 1: Apa yang harus saya lakukan hari ini saat bibit ditanam.
            4. ⏳ Jadwal Perawatan Berkala: Panduan per minggu (Minggu 1, Minggu 2, dst) yang disesuaikan dengan kondisi cuaca (misal: jika curah hujan tinggi, kurangi penyiraman).
            5. 🌾 Tanda Siap Panen: Ciri fisik tanaman saat siap dipetik.
            `;

            let hasilAI = "";
            try {
                hasilAI = await kirimPesanTeks(promptGemini);
            } catch (error) {
                alert("Gagal menghubungi AI. Pastikan internet stabil.");
                btnSimpan.innerHTML = "🤖 Buat Rencana Tanam";
                btnSimpan.disabled = false;
                return;
            }

            btnSimpan.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan ke Database...';

            const hasilSimpan = await laporTanam(currentUser, tanaman, tanggal, hasilAI);
            
            if (hasilSimpan && hasilSimpan.status === "sukses") {
                formJadwal.reset();
                document.getElementById('jdw-tanggal').valueAsDate = new Date();
                document.getElementById('jdw-lokasi').value = globalWeatherData.kota; // Isi ulang lokasinya
                
                await muatJadwal(); 
                bukaPanduanLokal(0); 
            } else {
                alert("❌ Gagal menyimpan jadwal.");
            }

            btnSimpan.innerHTML = "🤖 Buat Rencana Tanam";
            btnSimpan.disabled = false;
        });
    }

    muatJadwal();
});

// ==========================================
// FUNGSI MEMUAT & MENAMPILKAN JADWAL (DENGAN FILTER)
// ==========================================
async function muatJadwal() {
    dataJadwalGlobal = await ambilJadwal(currentUser); 
    renderJadwal(); // Panggil fungsi render pembuat HTML
}

// Deteksi perubahan pada dropdown filter
document.getElementById('filter-jadwal').addEventListener('change', () => {
    renderJadwal();
});

// Fungsi untuk menggambar ulang daftar berdasarkan filter
function renderJadwal() {
    const listEl = document.getElementById('jadwal-list');
    const filterAktif = document.getElementById('filter-jadwal').value; // 'Semua', 'Aktif', atau 'Selesai'
    
    listEl.innerHTML = '';

    // Saring data berdasarkan dropdown
    const dataTersaring = dataJadwalGlobal.filter(item => {
        if (filterAktif === "Semua") return true;
        return item.status === filterAktif;
    });

    if (dataTersaring.length === 0) {
        listEl.innerHTML = `
            <div class="col-12 text-center py-4 bg-white rounded-4 shadow-sm border border-light">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">🍃</div>
                <h6 class="text-muted fw-bold mb-1">Tidak ada data jadwal.</h6>
            </div>`;
        return;
    }

    dataTersaring.forEach((item) => {
        // Cari index aslinya di dataJadwalGlobal agar tombol pop-up tidak salah ambil data
        const indexAsli = dataJadwalGlobal.findIndex(x => x.id === item.id);
        
        const tgl = new Date(item.tanggal_mulai);
        const tglIndo = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Tentukan warna badge dan tombol berdasarkan status
        const isAktif = item.status === 'Aktif';
        const badgeHTML = isAktif ? `<span class="badge bg-warning text-dark rounded-pill">🌱 Sedang Tanam</span>` 
                                  : `<span class="badge bg-success rounded-pill">✅ Panen/Selesai</span>`;
        
        const tombolPanenHTML = isAktif ? `
            <button class="btn btn-sm btn-outline-success w-100 rounded-pill fw-bold mt-2" onclick="tandaiPanen(${item.id})">
                ✅ Tandai Sudah Panen
            </button>` : '';

        const cardHTML = `
        <div class="col-12 col-md-6">
            <div class="card shadow-sm border-0 h-100 ${!isAktif ? 'bg-light opacity-75' : ''}" style="border-radius: 16px; border-left: 5px solid ${isAktif ? '#198754' : '#6c757d'} !important;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h5 class="fw-bold text-success mb-0">${item.tanaman}</h5>
                        ${badgeHTML}
                    </div>
                    <small class="text-muted d-block mb-3">📅 Mulai: ${tglIndo}</small>
                    
                    <button class="btn btn-sm btn-success w-100 rounded-pill fw-bold" onclick="bukaPanduanLokal(${indexAsli})">
                        📖 Lihat Panduan AI
                    </button>
                    ${tombolPanenHTML}
                </div>
            </div>
        </div>`;
        listEl.innerHTML += cardHTML;
    });
}

// Fungsi membuka modal pop-up AI
window.bukaPanduanLokal = function(index) {
    const item = dataJadwalGlobal[index];
    const modal = new bootstrap.Modal(document.getElementById('modalAI'));
    const contentEl = document.getElementById('ai-response-content');
    contentEl.innerHTML = item.panduan_ai || "<em>Panduan AI tidak tersedia.</em>";
    modal.show();
};

// Fungsi mengubah status menjadi selesai
window.tandaiPanen = async function(idJadwal) {
    const konfirmasi = confirm("Apakah kamu yakin tanaman ini sudah selesai dipanen?");
    if (konfirmasi) {
        const hasil = await selesaikanJadwal(idJadwal);
        if (hasil.status === "sukses") {
            alert("🎉 Selamat atas hasil panenmu!");
            muatJadwal(); // Refresh tabel data dari database
        } else {
            alert("❌ Gagal memperbarui status.");
        }
    }
};

window.bukaPanduanLokal = function(index) {
    const item = dataJadwalGlobal[index];
    const modal = new bootstrap.Modal(document.getElementById('modalAI'));
    const contentEl = document.getElementById('ai-response-content');
    contentEl.innerHTML = item.panduan_ai || "<em>Panduan AI tidak tersedia.</em>";
    modal.show();
};

// ==========================================
// FUNGSI CUACA (KODE MILIK MAS DUTA)
// ==========================================
function initWeather() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            document.getElementById('w-coords').innerText = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
            getCityName(lat, lon);
            getWeatherData(lat, lon);
        }, (error) => {
            showWeatherError("Mohon izinkan akses GPS (Lokasi).");
            // Fallback lokasi jika GPS ditolak (Tangerang)
            getCityName(-6.1783, 106.6319);
            getWeatherData(-6.1783, 106.6319);
        });
    } else {
        showWeatherError("Browser tidak mendukung GPS.");
    }
}

async function getCityName(lat, lon) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
        const data = await res.json();
        const kota = data.locality || data.city || data.principalSubdivision || "Lokasi Saya";
        
        document.getElementById('w-city').innerText = kota;
        globalWeatherData.kota = kota; 

        // OTOMATIS MENGISI INPUT FORM WILAYAH
        const inputLokasi = document.getElementById('jdw-lokasi');
        if(inputLokasi) inputLokasi.value = kota;

    } catch (e) {
        document.getElementById('w-city').innerText = "Lokasi Terdeteksi";
    }
}

async function getWeatherData(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        const curr = data.current;

        document.getElementById('w-temp').innerText = Math.round(curr.temperature_2m) + "°C";
        document.getElementById('w-humid').innerText = curr.relative_humidity_2m + "%";
        document.getElementById('w-rain').innerText = curr.precipitation + " mm";
        
        const infoCuaca = getWeatherIcon(curr.weather_code);
        document.getElementById('w-icon').innerText = infoCuaca.icon;
        document.getElementById('w-desc').innerText = infoCuaca.desc;

        // SIMPAN KE VARIABEL GLOBAL UNTUK AI
        globalWeatherData.suhu = curr.temperature_2m;
        globalWeatherData.hujan = curr.precipitation;
        globalWeatherData.lembap = curr.relative_humidity_2m;
        globalWeatherData.kondisi = infoCuaca.desc;

        let forecastHtml = "";
        for(let i=1; i<=3; i++) {
            const dayCode = data.daily.weather_code[i];
            const dayMax = Math.round(data.daily.temperature_2m_max[i]);
            const dayInfo = getWeatherIcon(dayCode);
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayName = date.toLocaleDateString('id-ID', {weekday: 'short'});

            forecastHtml += `
            <div class="col-4 text-center border-end border-white border-opacity-25">
                <small class="d-block opacity-75" style="font-size: 0.7rem;">${dayName}</small>
                <div class="my-1" style="font-size: 1.5rem;">${dayInfo.icon}</div>
                <small class="fw-bold">${dayMax}°C</small>
            </div>`;
        }
        document.getElementById('forecast-list').innerHTML = forecastHtml.replace(/border-end/g, (match, offset, string) => offset === string.lastIndexOf("border-end") ? "" : match);
        document.getElementById('weather-loading').classList.add('d-none');
        document.getElementById('weather-content').classList.remove('d-none');
    } catch (error) {
        showWeatherError("Gagal memuat cuaca.");
    }
}

function getWeatherIcon(code) {
    if (code === 0) return { icon: "☀️", desc: "Cerah" };
    if (code >= 1 && code <= 3) return { icon: "⛅", desc: "Berawan" };
    if (code >= 45 && code <= 48) return { icon: "🌫️", desc: "Kabut" };
    if (code >= 51 && code <= 67) return { icon: "🌧️", desc: "Hujan" };
    if (code >= 80 && code <= 99) return { icon: "⛈️", desc: "Badai" };
    return { icon: "🌡️", desc: "Normal" };
}

function showWeatherError(msg) {
    document.getElementById('weather-loading').innerHTML = `<p class="small mb-0 text-white-50">${msg}</p>`;
}