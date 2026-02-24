import { GoogleGenerativeAI } from "@google/generative-ai";

// ==========================================
// 1. KONFIGURASI API GEMINI (TETAP SAMA)
// ==========================================
const API_KEY_GEMINI = "AIzaSyBp6S0R0gf7RCOUtueU6xUSMpRVIHpiIpE"; // Pastikan API Key Gemini kamu masih ada di sini
const genAI = new GoogleGenerativeAI(API_KEY_GEMINI);

// ==========================================
// 2. KONFIGURASI DATABASE LOCALHOST (BARU)
// ==========================================
// Menunjuk ke folder 'api' di dalam XAMPP/htdocs/SITANI-WEB
const BASE_URL = "http://localhost/SITANI-WEB/api/";


// ==========================================
// FUNGSI GEMINI AI (Tidak Berubah)
// ==========================================
export async function kirimKeGemini(file, promptText) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const imageParts = await fileToGenerativePart(file);
        const result = await model.generateContent([promptText, imageParts]);
        return (await result.response).text();
    } catch (error) {
        console.error("Error Gemini Gambar:", error);
        throw error;
    }
}

export async function kirimPesanTeks(promptText) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(promptText);
        return (await result.response).text();
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


// ==========================================
// FUNGSI DATABASE (DIUBAH KE LOCALHOST PHP)
// ==========================================

// 1. Fungsi Login
export async function loginUser(username, password) {
    try {
        const response = await fetch(`${BASE_URL}login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        return await response.json();
    } catch (error) {
        console.error("Error Login:", error);
        return { status: "gagal", pesan: "Tidak dapat terhubung ke server lokal (XAMPP mungkin mati)." };
    }
}

// 2. Fungsi Register (Nanti kita buat file PHP-nya)
export async function registerUser(username, password, nama, role = 'petani') {
    try {
        const response = await fetch(`${BASE_URL}register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, nama, role })
        });
        return await response.json();
    } catch (error) {
        console.error("Error Register:", error);
        return { status: "gagal", pesan: "Gagal terhubung ke server." };
    }
}

// 3. Fungsi Simpan Riwayat (Nanti kita buat file PHP-nya)
export async function simpanRiwayat(username, penyakit, solusi) {
    try {
        console.log("➡️ Mengirim data ke PHP:", { username, penyakit, solusi });
        
        const response = await fetch(`${BASE_URL}simpan_riwayat.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, penyakit, solusi })
        });
        
        // Kita tangkap sebagai text biasa dulu untuk melihat apakah ada pesan Error PHP
        const textResult = await response.text(); 
        console.log("⬅️ Respon dari PHP:", textResult);
        
        try {
            const json = JSON.parse(textResult);
            if (json.status !== "sukses") {
                console.error("❌ Gagal dari Database:", json.pesan);
            } else {
                console.log("✅ Data Riwayat berhasil masuk ke phpMyAdmin!");
            }
        } catch (e) {
            console.error("❌ File PHP mengalami error (Syntax/SQL):", textResult);
        }
        
    } catch (error) {
        console.error("❌ Gagal menghubungi server PHP:", error);
    }
}

// 4. Fungsi Ambil Riwayat (Nanti kita buat file PHP-nya)
export async function ambilRiwayat(username) {
    try {
        const response = await fetch(`${BASE_URL}ambil_riwayat.php?u=${username}`);
        if (!response.ok) throw new Error("Gagal ambil data");
        return await response.json();
    } catch (error) {
        console.error("Error Ambil Riwayat:", error);
        return [];
    }
}

// 5. Fungsi Simpan Jadwal (Nanti kita buat file PHP-nya)
export async function laporTanam(username, tanaman, tgl, panduan_ai) {
    try {
        const response = await fetch(`${BASE_URL}simpan_jadwal.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, tanaman, tanggal_mulai: tgl, panduan_ai: panduan_ai }) // Kirim ke PHP
        });
        return await response.json();
    } catch (error) {
        console.error("Error Simpan Jadwal:", error);
        return { status: "gagal", pesan: "Error jaringan." };
    }
}

// 6. Fungsi Ambil Produk dari Database
export async function ambilProduk() {
    try {
        const response = await fetch(`${BASE_URL}ambil_produk.php`);
        if (!response.ok) throw new Error("Gagal ambil data produk");
        return await response.json();
    } catch (error) {
        console.error("Error Ambil Produk:", error);
        return [];
    }
}

// 7. Fungsi Checkout Pesanan Toko
export async function checkoutPesanan(username, detail_pesanan, total_harga) {
    try {
        const response = await fetch(`${BASE_URL}checkout.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, detail_pesanan, total_harga })
        });
        return await response.json();
    } catch (error) {
        console.error("Error Checkout:", error);
        return { status: "gagal", pesan: "Gagal menghubungi server lokal." };
    }
}

// 8. Fungsi Tambah Produk Jualan
export async function tambahProdukBaru(formData) {
    try {
        const response = await fetch(`${BASE_URL}tambah_produk.php`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error("Error Tambah Produk:", error);
        return { status: "gagal", pesan: "Gagal menghubungi server lokal." };
    }
}
// 9. Fungsi Ambil Riwayat Pesanan
export async function ambilPesanan(username) {
    try {
        const response = await fetch(`${BASE_URL}ambil_pesanan.php?u=${username}`);
        if (!response.ok) throw new Error("Gagal ambil data pesanan dari server");
        return await response.json();
    } catch (error) {
        console.error("Error Ambil Pesanan:", error);
        return []; // Kembalikan array kosong jika error agar web tidak crash
    }
}

// 10. Fungsi Ambil Daftar Jadwal
export async function ambilJadwal(username) {
    try {
        const response = await fetch(`${BASE_URL}ambil_jadwal.php?u=${username}`);
        if (!response.ok) throw new Error("Gagal ambil jadwal");
        return await response.json();
    } catch (error) {
        console.error("Error Ambil Jadwal:", error);
        return [];
    }
}

// 11. Fungsi Mengubah Status Jadwal (Panen/Selesai)
export async function selesaikanJadwal(idJadwal) {
    try {
        const response = await fetch(`${BASE_URL}update_status.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idJadwal })
        });
        return await response.json();
    } catch (error) {
        console.error("Error Update Status:", error);
        return { status: "gagal", pesan: "Gagal menghubungi server." };
    }
}