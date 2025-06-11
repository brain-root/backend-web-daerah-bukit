-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: aws-mysql.cnoiawuws42w.ap-southeast-1.rds.amazonaws.com    Database: webdaerah
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (1,'dapur nikisae','Dapur Nikisae mempersembahkan dua camilan renyah favorit keluarga: Stik Ubi Ungu yang manis dan kaya antioksidan, serta Stik Bawang yang gurih menggoda dengan aroma khas bawang. Keduanya dikemas praktis dan higienis, cocok untuk teman ngopi, bekal, atau oleh-oleh. Tersedia dengan harga terjangkau Rp12.000 per bungkus.','Jl. Ipuah Mandiangin Gang Firdaus no 45b','Kuliner','wa.me/+6285151515151','http://localhost:3000/uploads/business/6b11d532-aa41-4b97-ab47-a87d0d978044-01JE2RZGPM5B4875ZEBEX4DQ0X.jpeg','2025-06-04 20:36:16','2025-06-11 14:15:07'),(2,'dendeng daun singkong (densiko)','Dendeng Daun Singkong (Densiko) by Dapur Ami adalah camilan inovatif berbahan dasar daun singkong yang diolah secara higienis dan dibumbui dengan racikan rempah khas, menghasilkan cita rasa gurih, pedas, dan renyah. Densiko menawarkan alternatif sehat dan lezat bagi pecinta kuliner tradisional dengan sentuhan kekinian, cocok disantap kapan saja sebagai pelengkap nasi maupun camilan ringan.','JALAN GURU TUO NO 18 PINTU KABUN','Kuliner','wa.me/+628777777777','http://localhost:3000/uploads/business/fe6abd52-4376-497a-83cb-ec26adb57efb-01JD2MSR2QS5801FV4H9XDQKXG.png','2025-06-04 20:42:55','2025-06-11 14:14:05');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `date` varchar(100) DEFAULT NULL,
  `time` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Jam Gadang Criterium','Pemerintah Kota Bukittinggi melalui Dinas Pemuda dan Olahraga berkolaborasi bersama Ikatan Sport Sepeda Indonesia (ISSI) Kota Bukittinggi akan gelar event Jam Gadang Criterium tahun 2025.','jam gadang','21 - 25 September 2025','07:00 - 18:00','http://localhost:3000/uploads/events/ff3888ba-252e-4bfb-b6fd-3a50db54f3b1-image_750x500_6736ede55bef4_1.jpg','2025-06-04 20:59:14','2025-06-11 14:17:05'),(2,'Kesenian Tradisional di Jam Gadang','Jam Gadang di Bukittinggi sering menjadi lokasi penampilan kesenian tradisional Minangkabau. Beberapa kesenian yang ditampilkan di sana termasuk Randai, Saluang, Talempong, dan berbagai tarian Minangkabau. Selain itu, kegiatan Tambua juga terkadang diadakan di pelataran Jam Gadang. ','alun alun kota','17 - 20 agustus 2025','07:00 - 18:00','http://localhost:3000/uploads/events/5f6e5e37-dbfc-42a9-99a5-6965265a512c-20240823173033000000ArifNugraha081364656700MainTambuaDiJamGadang.webp','2025-06-11 14:18:10','2025-06-11 14:18:10');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_categories`
--

DROP TABLE IF EXISTS `forum_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_categories`
--

LOCK TABLES `forum_categories` WRITE;
/*!40000 ALTER TABLE `forum_categories` DISABLE KEYS */;
INSERT INTO `forum_categories` VALUES (1,'tes','test','2025-06-04 22:19:00');
/*!40000 ALTER TABLE `forum_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_posts`
--

DROP TABLE IF EXISTS `forum_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `thread_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `thread_id` (`thread_id`),
  CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_posts_ibfk_2` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_posts`
--

LOCK TABLES `forum_posts` WRITE;
/*!40000 ALTER TABLE `forum_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_reactions`
--

DROP TABLE IF EXISTS `forum_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) NOT NULL,
  `thread_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `reaction_type` enum('like','dislike') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_thread_reaction` (`user_id`,`thread_id`),
  UNIQUE KEY `unique_post_reaction` (`user_id`,`post_id`),
  KEY `idx_forum_reactions_thread` (`thread_id`),
  KEY `idx_forum_reactions_post` (`post_id`),
  KEY `idx_forum_reactions_user` (`user_id`),
  CONSTRAINT `forum_reactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_reactions_ibfk_2` FOREIGN KEY (`thread_id`) REFERENCES `forum_threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_reactions_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_reactions`
--

LOCK TABLES `forum_reactions` WRITE;
/*!40000 ALTER TABLE `forum_reactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_threads`
--

DROP TABLE IF EXISTS `forum_threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_threads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text,
  `user_id` varchar(36) NOT NULL,
  `category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `forum_threads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_threads_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `forum_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_threads`
--

LOCK TABLES `forum_threads` WRITE;
/*!40000 ALTER TABLE `forum_threads` DISABLE KEYS */;
INSERT INTO `forum_threads` VALUES (1,'kuliner paling baru','geprek gg mantap ges','8cf23251-d567-44f8-8be7-209ffd086f86',1,'2025-06-04 22:27:31','2025-06-04 22:27:31');
/*!40000 ALTER TABLE `forum_threads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tourism_destinations`
--

DROP TABLE IF EXISTS `tourism_destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tourism_destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tourism_category` (`category`),
  KEY `idx_tourism_featured` (`featured`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tourism_destinations`
--

LOCK TABLES `tourism_destinations` WRITE;
/*!40000 ALTER TABLE `tourism_destinations` DISABLE KEYS */;
INSERT INTO `tourism_destinations` VALUES (17,'Istana Pagaruyung','Istano Basa Pagaruyung yang lebih terkenal dengan nama Istana Besar Kerajaan Pagaruyung adalah museum berupa replika istana Kerajaan Pagaruyung terletak di Nagari Pagaruyung, Kecamatan Tanjung Emas, Kabupaten Tanah Datar, Sumatera Barat. Istana ini berjarak lebih kurang 5 kilometer dari Batusangkar.','Jl. Sutan Alam Bagagarsyah, Pagaruyung,','Budaya','http://localhost:3000/uploads/tourism/1c9c2ab0-6603-4774-9603-884b058e45af-bukittinggi-(2).jpg',1,'2025-06-11 14:04:55','2025-06-11 14:06:00'),(18,'Jam Gadang Bukittinggi','Jam Gadang adalah menara jam ikonik di Kota Bukittinggi, Sumatera Barat, Indonesia. Menara ini memiliki empat jam besar berukuran 80 cm di setiap sisinya, sehingga disebut \"Jam Gadang\" yang berarti \"jam besar\" dalam bahasa Minangkabau. Jam Gadang menjadi penanda kota dan objek wisata yang populer','pusat Kota Bukittinggi','Budaya','http://localhost:3000/uploads/tourism/a98dbff2-1a3d-486c-9f35-5c5f7b98d62a-62f098752ad92.jpg',1,'2025-06-11 14:07:55','2025-06-11 14:07:56'),(19,'Puncak Lawang','Puncak Lawang adalah salah satu objek wisata alam yang terletak di dataran tinggi di Nagari Lawang, Kecamatan Matur, Kabupaten Agam, Sumatera Barat. Keindahan Puncak Lawang ditandai dengan birunya alam Danau Maninjau serta rindangnya pohon pinus dan udara yang sejuk.','l. Panorama Puncak, Lawang, Kec. Matur','Pemandangan','http://localhost:3000/uploads/tourism/257a4aef-c753-43b3-9c01-f63183353915-overlooking-maninjau.jpg',1,'2025-06-11 14:09:56','2025-06-11 14:09:56'),(20,'Ngarai Sianok','Ngarai Sianok merupakan sebuah lembah curam yang terletak di perbatasan Kota Bukittinggi, di Kecamatan IV Koto, Kabupaten Agam, Sumatera Barat. Lembah ini memanjang dan berkelok sebagai garis batas kota dari selatan Ngarai Koto Gadang sampai ke nagari Sianok Anam Suku, dan berakhir di Kecamatan Palupuh.','Taman Jl. Panorama, Kayu Kubu, Kec. Guguk Panjang','Pemandangan','http://localhost:3000/uploads/tourism/06ba1bc3-8d35-4972-9611-e3dbab89210c-Ngaraisianok.jpg',0,'2025-06-11 14:10:56','2025-06-11 14:10:56');
/*!40000 ALTER TABLE `tourism_destinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tourism_images`
--

DROP TABLE IF EXISTS `tourism_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tourism_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tourism_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tourism_images_tourism_id` (`tourism_id`),
  KEY `idx_tourism_images_is_primary` (`is_primary`),
  CONSTRAINT `tourism_images_ibfk_1` FOREIGN KEY (`tourism_id`) REFERENCES `tourism_destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tourism_images`
--

LOCK TABLES `tourism_images` WRITE;
/*!40000 ALTER TABLE `tourism_images` DISABLE KEYS */;
INSERT INTO `tourism_images` VALUES (28,17,'http://localhost:3000/uploads/tourism/1c9c2ab0-6603-4774-9603-884b058e45af-bukittinggi-(2).jpg',NULL,1,1,'2025-06-11 14:04:55'),(29,17,'http://localhost:3000/uploads/tourism/4a1ed911-67ac-4196-966a-09353be4627d-bukittinggi-(4).jpg',NULL,0,1,'2025-06-11 14:04:55'),(30,17,'http://localhost:3000/uploads/tourism/c87ab8a7-cc4e-4ff0-b2ca-8335ad5bb150-Museum_Rumah_Adat_Baanjuang_Bukittinggi.jpg',NULL,0,2,'2025-06-11 14:06:00'),(31,18,'http://localhost:3000/uploads/tourism/a98dbff2-1a3d-486c-9f35-5c5f7b98d62a-62f098752ad92.jpg',NULL,1,1,'2025-06-11 14:07:56'),(32,18,'http://localhost:3000/uploads/tourism/e10d1bc5-0e53-4470-838a-890d513dd3bf-bukittinggi-(3).jpg',NULL,0,1,'2025-06-11 14:07:56'),(33,18,'http://localhost:3000/uploads/tourism/8168de0f-8234-40da-981d-8a2c8f2e3ae5-Jam_Gadang_memanjang.jpg',NULL,0,2,'2025-06-11 14:07:56'),(34,19,'http://localhost:3000/uploads/tourism/257a4aef-c753-43b3-9c01-f63183353915-overlooking-maninjau.jpg',NULL,1,1,'2025-06-11 14:09:56'),(35,19,'http://localhost:3000/uploads/tourism/f2efad59-4a8b-4ec4-8b31-960b39d8aec0-image.jpeg',NULL,0,1,'2025-06-11 14:09:56'),(36,20,'http://localhost:3000/uploads/tourism/06ba1bc3-8d35-4972-9611-e3dbab89210c-Ngaraisianok.jpg',NULL,1,1,'2025-06-11 14:10:56'),(37,20,'http://localhost:3000/uploads/tourism/d8071c73-d9b8-41c1-9642-051b8c93668f-NgaraiSianok01.JPG',NULL,0,1,'2025-06-11 14:10:56');
/*!40000 ALTER TABLE `tourism_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('61d630ad-a504-499d-9829-de1cdb9dd0bf','admin@mail.com','$2b$10$w5Pt0Hqndj4/pzncXU.s3uiUTUN61Ns2PpK32Gthr3NFiKnT1USNa','admin','admin','2025-06-04 23:20:08','2025-06-04 23:20:30'),('8cf23251-d567-44f8-8be7-209ffd086f86','carlos@gmail.com','$2b$10$McprF3pUNwGm1ZL/hHT8J.SYp4AO5vk2DdDM9STaw58Lb.F6co52a','carlos','user','2025-06-04 22:27:05','2025-06-04 22:27:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-11 21:33:02
