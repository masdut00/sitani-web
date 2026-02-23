<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->detail_pesanan) && isset($data->total_harga)) {
    $username = $conn->real_escape_string($data->username);
    $detail_pesanan = $conn->real_escape_string($data->detail_pesanan); // Berisi daftar barang & jumlah
    $total_harga = (int) $data->total_harga;

    // Masukkan ke tabel orders, status defaultnya 'Pending'
    $sql = "INSERT INTO orders (username, detail_pesanan, total_harga, status) VALUES ('$username', '$detail_pesanan', '$total_harga', 'Pending')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sukses", "pesan" => "Pesanan berhasil dibuat!"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Error Database: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "Data pesanan tidak lengkap!"]);
}
?>