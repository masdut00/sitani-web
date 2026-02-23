<?php
require 'koneksi.php';

if(isset($_GET['u'])) {
    $username = $conn->real_escape_string($_GET['u']);
    
    // Ambil jadwal yang statusnya aktif, diurutkan dari yang paling baru
    $sql = "SELECT id, tanaman, tanggal_mulai, panduan_ai, status FROM jadwal WHERE username='$username' ORDER BY id DESC";
    $result = $conn->query($sql);

    $jadwal = [];
    if($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $jadwal[] = $row;
        }
    }
    
    echo json_encode($jadwal);
} else {
    echo json_encode([]);
}
?>