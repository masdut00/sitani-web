<?php
require 'koneksi.php';

// Menangkap data dari FormData (bukan JSON lagi)
if(isset($_POST['penjual_username']) && isset($_POST['nama_produk'])) {
    $penjual = $conn->real_escape_string($_POST['penjual_username']);
    $kategori = $conn->real_escape_string($_POST['kategori']);
    $nama = $conn->real_escape_string($_POST['nama_produk']);
    $harga = (int) $_POST['harga'];
    $satuan = $conn->real_escape_string($_POST['satuan']);
    $deskripsi = $conn->real_escape_string($_POST['deskripsi']);

    $gambar_path = "images/default_produk.jpg"; // Path jika gambar gagal diupload

    // 1. LOGIKA MENGUNGGAH GAMBAR KE FOLDER LOKAL
    if(isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        
        // Buat folder 'images' di luar folder 'api' jika belum ada
        $target_dir = "../images/"; 
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        // Beri nama unik agar gambar tidak bentrok (menggunakan waktu + nama asli)
        $file_name = time() . '_' . basename($_FILES["gambar"]["name"]); 
        $target_file = $target_dir . $file_name;
        
        // Path ini yang akan disimpan ke database (relatif ke index.html)
        $db_path = "images/" . $file_name; 

        // Pindahkan file dari memori sementara ke folder images
        if(move_uploaded_file($_FILES["gambar"]["tmp_name"], $target_file)) {
            $gambar_path = $db_path; // Jika sukses, gunakan path baru ini
        }
    }

    // 2. SIMPAN KE DATABASE
    $sql = "INSERT INTO produk (penjual_username, kategori, nama_produk, harga, satuan, gambar, deskripsi) 
            VALUES ('$penjual', '$kategori', '$nama', $harga, '$satuan', '$gambar_path', '$deskripsi')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sukses", "pesan" => "Produk & Gambar berhasil disimpan!"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Error Database: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "Data form tidak lengkap!"]);
}
?>