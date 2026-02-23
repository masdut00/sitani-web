<?php
require 'koneksi.php';

// Ambil semua produk dari tabel produk
$sql = "SELECT * FROM produk ORDER BY id DESC";
$result = $conn->query($sql);

$produk = [];
if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $produk[] = $row;
    }
}

echo json_encode($produk);
?>