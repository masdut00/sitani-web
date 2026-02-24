-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 24 Feb 2026 pada 05.56
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_sitani`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal`
--

CREATE TABLE `jadwal` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `tanaman` varchar(100) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `panduan_ai` longtext DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jadwal`
--

INSERT INTO `jadwal` (`id`, `username`, `tanaman`, `tanggal_mulai`, `panduan_ai`, `status`) VALUES
(1, 'petani', 'Cabai Merah', '2026-02-24', '{\"analisa\":\"Suhu 29.2°C dan kelembapan 70% sangat ideal untuk pertumbuhan cabai merah. Curah hujan 0 mm saat ini menguntungkan untuk proses penanaman awal, namun pastikan ketersediaan air melalui penyiraman rutin untuk menjaga kelembapan tanah yang konsisten, mengingat cabai membutuhkan banyak air terutama di fase pertumbuhan awal dan pembuahan.\",\"estimasi_panen\":\"Mei/Juni 2026\",\"fase\":[{\"id\":1,\"judul\":\"Fase 1: Persiapan Lahan & Penyemaian (Minggu ke-1)\",\"deskripsi\":\"Lakukan persiapan lahan dengan membersihkan gulma, menggemburkan tanah, dan membuat bedengan. Siapkan media semai yang steril dan kaya nutrisi. Semai benih cabai merah pada 24 Februari 2026. Siram secara teratur untuk menjaga kelembapan media semai.\",\"selesai\":true},{\"id\":2,\"judul\":\"Fase 2: Persemaian & Pindah Tanam (Minggu ke-3 - ke-5)\",\"deskripsi\":\"Pada minggu ke-3 atau ke-4 (sekitar pertengahan Maret 2026), bibit cabai yang sudah memiliki 4-6 daun sejati siap dipindahkan ke lahan tanam utama. Lakukan pindah tanam sore hari untuk mengurangi stres bibit. Segera lakukan penyiraman setelah pindah tanam.\",\"selesai\":false},{\"id\":3,\"judul\":\"Fase 3: Pemeliharaan Vegetatif & Pembungaan (Minggu ke-6 - ke-10)\",\"deskripsi\":\"Fokus pada pertumbuhan vegetatif yang kuat (daun dan batang). Lakukan pemupukan susulan pertama dan kedua (sekitar akhir Maret hingga April 2026) sesuai dosis. Lakukan penyiangan gulma, pengendalian hama penyakit secara preventif, dan perempelan tunas air agar nutrisi fokus ke pertumbuhan utama. Tanaman akan mulai mengeluarkan bunga di akhir fase ini.\",\"selesai\":false},{\"id\":4,\"judul\":\"Fase 4: Pembuahan & Awal Panen (Minggu ke-11 - ke-15)\",\"deskripsi\":\"Bunga akan berkembang menjadi buah cabai. Lakukan pemupukan buah (sekitar Mei 2026) untuk mendukung pembentukan dan pembesaran buah. Pantau secara intensif terhadap serangan hama dan penyakit. Pastikan kebutuhan air tercukupi dengan penyiraman rutin. Panen perdana buah cabai merah diperkirakan dapat dimulai pada akhir Mei hingga awal Juni 2026.\",\"selesai\":false}]}', 'Selesai');

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `detail_pesanan` text DEFAULT NULL,
  `total_harga` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `tanggal` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `orders`
--

INSERT INTO `orders` (`id`, `username`, `detail_pesanan`, `total_harga`, `status`, `tanggal`) VALUES
(1, 'petani', 'Cabai Merah (3)', 90000, 'Pending', '2026-02-24 04:14:44'),
(2, 'petani', 'Obat Vitamin Tanah (4)', 200000, 'Pending', '2026-02-24 04:18:52');

-- --------------------------------------------------------

--
-- Struktur dari tabel `produk`
--

CREATE TABLE `produk` (
  `id` int(11) NOT NULL,
  `penjual_username` varchar(50) DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `nama_produk` varchar(100) DEFAULT NULL,
  `harga` int(11) DEFAULT NULL,
  `satuan` varchar(20) DEFAULT NULL,
  `gambar` text DEFAULT NULL,
  `deskripsi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `produk`
--

INSERT INTO `produk` (`id`, `penjual_username`, `kategori`, `nama_produk`, `harga`, `satuan`, `gambar`, `deskripsi`) VALUES
(1, 'petani', 'Hasil Panen', 'Cabai Merah', 30000, 'Kg', 'images/1771906478_ilustrasi-cabai-rawit-merah_169.jpeg', 'Produk asli dari petani'),
(2, 'petani', 'Bibit', 'Obat Vitamin Tanah', 50000, 'Liter', 'images/1771906626_b92af48d990095ca80c48e58bc3ea316.png', 'Produk asli dari petani');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('petani','penjual','customer') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama`, `role`) VALUES
(1, 'petani', '123', 'petani', 'petani');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_jadwal_user` (`username`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_user` (`username`);

--
-- Indeks untuk tabel `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_produk_user` (`penjual_username`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `produk`
--
ALTER TABLE `produk`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `jadwal`
--
ALTER TABLE `jadwal`
  ADD CONSTRAINT `fk_jadwal_user` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `produk`
--
ALTER TABLE `produk`
  ADD CONSTRAINT `fk_produk_user` FOREIGN KEY (`penjual_username`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
