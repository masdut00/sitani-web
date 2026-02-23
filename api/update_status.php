<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $id = (int)$data->id;
    // Ubah status menjadi Selesai
    $sql = "UPDATE jadwal SET status='Selesai' WHERE id=$id";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sukses", "pesan" => "Tanaman berhasil dipanen!"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Error Database: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "ID tidak ditemukan!"]);
}
?>