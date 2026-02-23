<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->penjual_username) && isset($data->nama_produk) && isset($data->harga)) {
    $penjual = $conn->real_escape_string($data->penjual_username);
    $kategori = $conn->real_escape_string($data->kategori);
    $nama = $conn->real_escape_string($data->nama_produk);
    $harga = (int) $data->harga;
    $satuan = $conn->real_escape_string($data->satuan);
    $gambar = $conn->real_escape_string($data->gambar);
    $deskripsi = $conn->real_escape_string($data->deskripsi);

    $sql = "INSERT INTO produk (penjual_username, kategori, nama_produk, harga, satuan, gambar, deskripsi) 
            VALUES ('$penjual', '$kategori', '$nama', $harga, '$satuan', '$gambar', '$deskripsi')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sukses", "pesan" => "Produk berhasil ditambahkan!"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Error Database: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "Data produk tidak lengkap!"]);
}
?>