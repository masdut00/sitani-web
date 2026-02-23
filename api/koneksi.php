<?php
// Izinkan akses dari mana saja (CORS) agar JS tidak diblokir browser
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Konfigurasi Database XAMPP/Localhost
$host = "localhost";
$user = "root";      // Default username XAMPP
$pass = "";          // Default password XAMPP (kosong)
$db   = "db_sitani"; // Nama database yang tadi kita buat

// Membuat koneksi
$conn = new mysqli($host, $user, $pass, $db);

// Cek koneksi
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "pesan" => "Koneksi database gagal: " . $conn->connect_error]));
}
?>