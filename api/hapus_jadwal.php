<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->id)) {
    $id = (int)$data->id;
    $conn->query("DELETE FROM jadwal WHERE id=$id");
    echo json_encode(["status" => "sukses"]);
}
?>