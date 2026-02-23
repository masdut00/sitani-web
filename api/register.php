<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->password) && isset($data->nama)) {
    $username = $conn->real_escape_string($data->username);
    $password = $conn->real_escape_string($data->password);
    $nama = $conn->real_escape_string($data->nama);
    $role = isset($data->role) ? $conn->real_escape_string($data->role) : 'petani';

    // Cek apakah username sudah ada
    $cek = $conn->query("SELECT id FROM users WHERE username='$username'");
    if($cek->num_rows > 0) {
        echo json_encode(["status" => "gagal", "pesan" => "Username sudah dipakai! Pilih yang lain."]);
    } else {
        // Masukkan data baru
        $sql = "INSERT INTO users (username, password, nama, role) VALUES ('$username', '$password', '$nama', '$role')";
        if($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "sukses", "pesan" => "Pendaftaran berhasil!"]);
        } else {
            echo json_encode(["status" => "gagal", "pesan" => "Error database: " . $conn->error]);
        }
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "Data tidak lengkap!"]);
}
?>