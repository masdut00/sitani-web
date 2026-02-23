<?php
require 'koneksi.php';

if(isset($_GET['u'])) {
    $username = $conn->real_escape_string($_GET['u']);
    
    // Ambil data pesanan milik user ini dari yang paling baru (DESC)
    $sql = "SELECT detail_pesanan, total_harga, status, tanggal FROM orders WHERE username='$username' ORDER BY id DESC";
    $result = $conn->query($sql);

    $pesanan = [];
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $pesanan[] = $row;
        }
    }
    
    echo json_encode($pesanan);
} else {
    echo json_encode([]);
}
?>