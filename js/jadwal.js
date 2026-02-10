import { kirimPesanTeks, laporTanam } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES ---
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('jadwal-result');
    const btnBuat = document.getElementById('btn-buat-jadwal');
    const listKegiatanContainer = document.getElementById('list-kegiatan');
    const currentUser = localStorage.getItem('user_si_tani') || "Tamu";
    const STORAGE_KEY = `jadwal_multi_${currentUser}`;

    let globalWeatherData = {
        kota: "Lokasi Tidak Terdeteksi",
        suhu: "30",
        hujan: "0",
        lembap: "80",
        kondisi: "Cerah"
    };

    // --- INIT ---
    initWeather();       
    renderDaftarTanaman(); 

    // --- EVENT LISTENER ---
    btnBuat.addEventListener('click', async () => {
        const tanaman = document.getElementById('jenis-tanaman').value; 
        const tgl = document.getElementById('tgl-tanam').value;

        if (!tanaman) { alert("Isi nama tanaman dulu!"); return; }
        if (!tgl) { alert("Pilih tanggal tanam!"); return; }

        btnBuat.innerHTML = '🧠 Meracik Jadwal Rapi...';
        btnBuat.disabled = true;

        try {
            // PROMPT YANG MEMAKSA HTML MURNI & PADDING
            const prompt = `
            Bertindaklah sebagai Ahli Agronomi Senior.
            User ingin menanam: ${tanaman}.
            Mulai tanggal: ${tgl}.
            
            DATA LINGKUNGAN: Lokasi ${globalWeatherData.kota}, Suhu ${globalWeatherData.suhu}°C, Hujan ${globalWeatherData.hujan}mm.

            TUGAS 1: ANALISIS KECOCOKAN
            Analisis apakah cuaca cocok.
            
            JIKA KURANG COCOK (Hujan Ekstrim/Panas Ekstrim):
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
                <div class="card-header bg-danger text-white p-4">
                    <h5 class="fw-bold mb-0">⚠️ KURANG COCOK</h5>
                </div>
                <div class="card-body bg-white p-4"> <h6 class="fw-bold text-danger">Alasan Utama:</h6>
                    <p class="text-muted mb-3">[Jelaskan alasan teknis]</p>
                    <div class="alert alert-warning border-0 p-3 rounded-3 mb-0">
                        <b>Saran:</b> Tunda tanam sampai cuaca membaik.
                    </div>
                </div>
            </div>

            JIKA COCOK (LANJUT KE TUGAS 2):
            <div class="card border-0 shadow-sm rounded-4 mb-4">
                <div class="card-header bg-success text-white p-4">
                    <h5 class="fw-bold mb-0">✅ KONDISI IDEAL</h5>
                    <small class="opacity-75">Lokasi: ${globalWeatherData.kota}</small>
                </div>
                <div class="card-body bg-white p-4"> <p class="mb-0 text-muted">Suhu ${globalWeatherData.suhu}°C mendukung pertumbuhan ${tanaman}.</p>
                </div>
            </div>

            TUGAS 2: JADWAL DETAIL (HANYA JIKA COCOK)
            Buat jadwal STEP-BY-STEP dari Hari ke-1 sampai Panen.
            
            ATURAN FORMAT (PENTING):
            1. JANGAN gunakan simbol Markdown seperti (###, ***, **, ---). HARAM.
            2. Gunakan tag HTML <b> untuk menebalkan kata.
            3. Gunakan tag HTML <ul> dan <li> untuk poin-poin.
            4. Gunakan class "p-4" pada container agar teks tidak mentok pinggir.

            FORMAT OUTPUT ITEM JADWAL (ULANGI SAMPAI PANEN):
            <div class="list-group-item border-0 border-bottom p-4"> <div class="d-flex gap-3">
                    <input class="form-check-input flex-shrink-0 mt-1" type="checkbox" style="width: 20px; height: 20px;">
                    <div class="w-100">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="mb-0 fw-bold text-success">Hari ke-[HARI] ([TANGGAL])</h6>
                            <span class="badge bg-light text-dark border rounded-pill px-3">Fase [NAMA FASE]</span>
                        </div>
                        
                        <p class="fw-bold mb-2 text-dark">[JUDUL KEGIATAN]</p>
                        
                        <ul class="small text-muted ps-3 mb-0" style="line-height: 1.6;">
                            <li>[Rincian 1]</li>
                            <li>[Rincian 2]</li>
                        </ul>
                    </div>
                </div>
            </div>
            `;

            const rawResponse = await kirimPesanTeks(prompt);
            
            // --- JURUS PEMBERSIH ---
            // Kita bersihkan lagi output AI jaga-jaga dia masih bandel pakai Markdown
            const cleanHTML = cleanAIResponse(rawResponse);

            if (cleanHTML.includes("KURANG COCOK")) {
                const warningDiv = document.createElement('div');
                warningDiv.innerHTML = `
                    <div class="mb-3 animate-fade-in">
                        ${cleanHTML}
                        <button onclick="location.reload()" class="btn btn-outline-secondary w-100 py-3 rounded-3 fw-bold mt-2">
                            🔄 Coba Tanaman Lain
                        </button>
                    </div>
                `;
                inputSection.classList.add('d-none');
                resultSection.innerHTML = ""; 
                resultSection.appendChild(warningDiv);
                resultSection.classList.remove('d-none');
                
            } else {
                const jadwalBaru = {
                    id: Date.now(),
                    tanaman: tanaman,
                    tglMulai: tgl,
                    kontenHTML: cleanHTML
                };

                tambahKeStorage(jadwalBaru);
                laporTanam(currentUser, tanaman, tgl);
                renderDaftarTanaman();
                
                document.getElementById('jenis-tanaman').value = '';
                alert("✅ Jadwal Rapi Siap!");
            }

        } catch (error) {
            console.error(error);
            alert("Gagal analisa: " + error.message);
        } finally {
            btnBuat.innerHTML = '🤖 Buat Rencana Tanam';
            btnBuat.disabled = false;
        }
    });

    // --- FUNGSI PEMBERSIH MARKDOWN (SANITIZER) ---
    function cleanAIResponse(text) {
        let clean = text;
        
        // 1. Hapus ### Header Markdown
        clean = clean.replace(/#{1,6}\s?/g, '');
        
        // 2. Ubah **Tebal** jadi <b>Tebal</b>
        clean = clean.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        
        // 3. Ubah *Miring* jadi <i>Miring</i>
        clean = clean.replace(/\*(.*?)\*/g, '<i>$1</i>');
        
        // 4. Hapus ```html atau ``` (Code block markers)
        clean = clean.replace(/```html/g, '').replace(/```/g, '');

        return clean;
    }

    // --- FUNGSI CUACA ---
    function initWeather() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById('w-coords').innerText = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
                getCityName(lat, lon);
                getWeatherData(lat, lon);
            }, (error) => {
                showWeatherError("Aktifkan GPS.");
            });
        } else {
            showWeatherError("Browser no GPS.");
        }
    }

    async function getCityName(lat, lon) {
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
            const data = await res.json();
            const kota = data.locality || data.city || data.principalSubdivision || "Lokasi Saya";
            document.getElementById('w-city').innerText = kota;
            globalWeatherData.kota = kota; 
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

    // --- RENDER DAFTAR JADWAL ---
    function renderDaftarTanaman() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        let dashboardArea = document.getElementById('dashboard-area');
        
        if (!dashboardArea) {
            dashboardArea = document.createElement('div');
            dashboardArea.id = 'dashboard-area';
            dashboardArea.className = 'mt-4';
            inputSection.parentNode.insertBefore(dashboardArea, resultSection);
        }

        if (data.length === 0) {
            dashboardArea.innerHTML = '<div class="alert alert-light border text-center small">Belum ada jadwal aktif.</div>';
            return;
        }

        let html = '<h6 class="fw-bold mb-3 ps-1">🌱 Tanaman Saya:</h6>';
        data.forEach(item => {
            html += `
            <div class="card mb-2 shadow-sm border-0 rounded-4 overflow-hidden">
                <div class="card-body d-flex justify-content-between align-items-center p-3">
                    <div onclick="lihatDetail(${item.id})" style="cursor: pointer; flex-grow: 1;">
                        <h6 class="mb-0 fw-bold text-success">${item.tanaman}</h6>
                        <small class="text-muted">Mulai: ${item.tglMulai}</small>
                    </div>
                    <button onclick="hapusTanaman(${item.id})" class="btn btn-sm btn-light text-danger ms-2 px-3 py-2 rounded-3">🗑️</button>
                </div>
            </div>`;
        });
        
        dashboardArea.innerHTML = html;
        resultSection.classList.add('d-none');
        inputSection.classList.remove('d-none');
    }

    function tambahKeStorage(item) {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        data.push(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    window.hapusTanaman = function(id) {
        if(!confirm("Hapus jadwal ini?")) return;
        let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        data = data.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderDaftarTanaman();
    }

    window.lihatDetail = function(id) {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const item = data.find(i => i.id === id);
        
        if(item) {
            document.getElementById('dashboard-area').innerHTML = `
                <button onclick="location.reload()" class="btn btn-white border shadow-sm mb-3 rounded-pill px-4">⬅ Kembali</button>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-success fw-bold mb-0">${item.tanaman}</h4>
                    <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">${item.tglMulai}</span>
                </div>
            `;
            
            listKegiatanContainer.innerHTML = item.kontenHTML;
            resultSection.classList.remove('d-none');
            inputSection.classList.add('d-none');
            setupChecklistListener(id);
        }
    }

    function setupChecklistListener(id) {
        const newElement = listKegiatanContainer.cloneNode(true);
        listKegiatanContainer.parentNode.replaceChild(newElement, listKegiatanContainer);
        
        newElement.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                e.target.checked ? e.target.setAttribute('checked', 'true') : e.target.removeAttribute('checked');
                
                const wrapper = e.target.closest('.list-group-item');
                if(wrapper) {
                    e.target.checked ? wrapper.style.opacity="0.5" : wrapper.style.opacity="1";
                    const textP = wrapper.querySelector('p');
                    if(textP) e.target.checked ? textP.style.textDecoration="line-through" : textP.style.textDecoration="none";
                }

                let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                const index = data.findIndex(i => i.id === id);
                if (index !== -1) {
                    data[index].kontenHTML = newElement.innerHTML;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                }
            }
        });
    }
});