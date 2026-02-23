<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));

// Pastikan panduan_ai juga ditangkap
if(isset($data->username) && isset($data->tanaman) && isset($data->tanggal_mulai) && isset($data->panduan_ai)) {
    $username = $conn->real_escape_string($data->username);
    $tanaman = $conn->real_escape_string($data->tanaman);
    $tgl = $conn->real_escape_string($data->tanggal_mulai);
    $panduan_ai = $conn->real_escape_string($data->panduan_ai); // Teks dari Gemini

    // Masukkan ke dalam tabel (termasuk panduan_ai)
    $sql = "INSERT INTO jadwal (username, tanaman, tanggal_mulai, panduan_ai, status) VALUES ('$username', '$tanaman', '$tgl', '$panduan_ai', 'Aktif')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sukses", "pesan" => "Jadwal berhasil disimpan!"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "Data tidak lengkap!"]);
}
?>