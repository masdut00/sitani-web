import { GoogleGenerativeAI } from "@google/generative-ai";

// KONFIGURASI
const API_KEY_GEMINI = "AIzaSyBHZZ9vGGBRRXpCnXPntmaykhUiJpRSUTk"; 
const SCRIPT_ID = "AKfycbyMQzRrTlR0QPe9k61RtrwVwtQQrfoe3nRVFIZhf0MkiiTitpNaEDBLnBw0eBXRzklw"; 
const URL_APPS_SCRIPT = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);

// --- GEMINI AI ---
export async function kirimKeGemini(file, promptText) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const imageParts = await fileToGenerativePart(file);
        const result = await model.generateContent([promptText, imageParts]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error Gemini Gambar:", error);
        throw error;
    }
}

export async function kirimPesanTeks(promptText) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(promptText);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error Gemini Teks:", error);
        throw error;
    }
}

async function fileToGenerativePart(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
            inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
        });
        reader.readAsDataURL(file);
    });
}

// --- DATABASE (GOOGLE SHEETS) ---

export async function ambilProduk() {
    try {
        const response = await fetch(`${URL_APPS_SCRIPT}?aksi=ambil_produk`);
        if (!response.ok) throw new Error("Gagal");
        const data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
}

export async function kirimPesanan(namaPembeli, namaProduk, harga) {
    const tgl = new Date().toLocaleString();
    const payload = {
        aksi: "tambah",
        nama_sheet: "orders",
        isi_baris: [tgl, namaPembeli, namaProduk, harga, "Menunggu"] 
    };
    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (error) { return false; }
}

export async function loginUser(username, password) {
    try {
        // Kirim parameter u dan p
        const url = `${URL_APPS_SCRIPT}?aksi=login&u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}`;
        
        const response = await fetch(url);
        const hasil = await response.json(); 
        // hasil = {status: "sukses", user: "Budi"} ATAU {status: "gagal", pesan: "..."}
        
        return hasil;

    } catch (error) {
        console.error("Login Error:", error);
        return {status: "error", pesan: "Gagal terhubung ke server database."};
    }
}

export async function registerUser(username, password, namaLengkap) {
    const payload = {
        aksi: "register",
        username: username,
        password: password,
        nama: namaLengkap
    };

    try {
        // Kita pakai no-cors, jadi kita tidak bisa baca respon "DUPLIKAT" atau "SUKSES" secara langsung.
        // TAPI, kita bisa berasumsi jika fetch berhasil, data terkirim.
        // Untuk validasi duplikat yang akurat, idealnya pakai GET dulu untuk cek user, baru POST.
        // Agar simpel untuk skripsi: Kita kirim saja.
        
        await fetch(URL_APPS_SCRIPT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
        
        return true; // Anggap sukses terkirim

    } catch (error) {
        console.error("Register Error:", error);
        return false;
    }
}

// --- FUNGSI BARU: SIMPAN RIWAYAT ---
export async function simpanRiwayat(username, penyakit, solusi) {
    const tgl = new Date().toLocaleString();
    
    // Payload sesuai dengan yang diminta Code.gs bagian 'simpan_riwayat'
    const payload = {
        aksi: "simpan_riwayat",
        nama_sheet: "riwayat", // Pastikan nama tab sheet kecil semua
        isi_baris: [tgl, username, penyakit, solusi, "-"] 
    };

    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST",
            mode: "no-cors", // Wajib no-cors untuk POST ke GAS
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
        console.log("Riwayat terkirim ke server!");
        return true;
    } catch (error) {
        console.error("Gagal simpan riwayat:", error);
        return false;
    }
}

// --- TAMBAHAN BAGIAN 5: LAPOR JADWAL ---
export async function laporTanam(username, tanaman, tglMulai) {
    const payload = {
        aksi: "simpan_jadwal",
        nama_sheet: "jadwal",
        isi_baris: [tglMulai, username, tanaman, "Sedang Tanam"] 
    };

    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST", mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (error) {
        console.error("Gagal lapor jadwal:", error);
        return false;
    }
}