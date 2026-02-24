<?php
require 'koneksi.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->id) && isset($data->panduan_ai)) {
    $id = (int)$data->id;
    $panduan_ai = $conn->real_escape_string($data->panduan_ai);
    $conn->query("UPDATE jadwal SET panduan_ai='$panduan_ai' WHERE id=$id");
    echo json_encode(["status" => "sukses"]);
}
?>