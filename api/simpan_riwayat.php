<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->username) && isset($data->penyakit) && isset($data->solusi)) {
    $username = $conn->real_escape_string($data->username);
    $penyakit = $conn->real_escape_string($data->penyakit);
    $solusi = $conn->real_escape_string($data->solusi);

    $sql = "INSERT INTO riwayat (username, penyakit, solusi) VALUES ('$username', '$penyakit', '$solusi')";
    
    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "sukses"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => $conn->error]);
    }
}
?>