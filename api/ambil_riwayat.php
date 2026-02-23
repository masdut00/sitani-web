<?php
require 'koneksi.php';

if(isset($_GET['u'])) {
    $username = $conn->real_escape_string($_GET['u']);
    
    // HAPUS 'LIMIT 20' agar semua data ditarik dari database
    $sql = "SELECT penyakit, solusi, tanggal FROM riwayat WHERE username='$username' ORDER BY id DESC";
    $result = $conn->query($sql);

    $riwayat = [];
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $riwayat[] = $row;
        }
    }
    
    echo json_encode($riwayat);
} else {
    echo json_encode([]);
}
?>