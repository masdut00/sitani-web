<?php
require 'koneksi.php';

// Menangkap data JSON dari Javascript
$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->password)) {
    $username = $conn->real_escape_string($data->username);
    $password = $conn->real_escape_string($data->password);

    // Cari user di tabel users
    $sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
    $result = $conn->query($sql);

    if($result->num_rows > 0) {
        // Jika ketemu, ambil datanya
        $row = $result->fetch_assoc();
        
        echo json_encode([
            "status" => "sukses", 
            "username_id" => $row['username'], // Dikirim ke localStorage
            "user" => $row['nama'],            // Dikirim ke localStorage
            "role" => $row['role']             // Dikirim ke localStorage
        ]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Username atau password salah!"]);
    }
} else {
    echo json_encode(["status" => "gagal", "pesan" => "Data tidak lengkap!"]);
}
?>