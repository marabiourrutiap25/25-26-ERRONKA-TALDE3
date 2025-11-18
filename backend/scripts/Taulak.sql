-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: Erronka1
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;

/*!40101 SET NAMES utf8mb4 */;

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;

/*!40103 SET TIME_ZONE='+00:00' */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;

/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ekipamendua`
--
DROP TABLE IF EXISTS `ekipamendua`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!40101 SET character_set_client = utf8 */;

CREATE TABLE
  `ekipamendua` (
    `id` int (11) NOT NULL,
    `izena` varchar(50) NOT NULL,
    `deskribapena` varchar(200) NOT NULL,
    `marka` varchar(20) DEFAULT NULL,
    `modelo` varchar(100) DEFAULT NULL,
    `stock` int (11) NOT NULL,
    `idKategoria` int (11) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_kategoria` (`idKategoria`),
    CONSTRAINT `fk_kategoria` FOREIGN KEY (`idKategoria`) REFERENCES `kategoria` (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ekipamendua`
--
LOCK TABLES `ekipamendua` WRITE;

/*!40000 ALTER TABLE `ekipamendua` DISABLE KEYS */;

/*!40000 ALTER TABLE `ekipamendua` ENABLE KEYS */;

UNLOCK TABLES;

--
-- Table structure for table `erabiltzailea`
--
DROP TABLE IF EXISTS `erabiltzailea`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!40101 SET character_set_client = utf8 */;

CREATE TABLE
  `erabiltzailea` (
    `nan` varchar(9) NOT NULL,
    `izena` varchar(20) NOT NULL,
    `abizena` varchar(50) NOT NULL,
    `erabiltzailea` varchar(20) NOT NULL,
    `pasahitza` varchar(255) NOT NULL,
    `api_key` varchar(255) DEFAULT NULL,
    `rola` char(1) NOT NULL,
    PRIMARY KEY (`nan`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `erabiltzailea`
--
LOCK TABLES `erabiltzailea` WRITE;

/*!40000 ALTER TABLE `erabiltzailea` DISABLE KEYS */;

/*!40000 ALTER TABLE `erabiltzailea` ENABLE KEYS */;

UNLOCK TABLES;

--
-- Table structure for table `gela`
--
DROP TABLE IF EXISTS `gela`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!40101 SET character_set_client = utf8 */;

CREATE TABLE
  `gela` (
    `id` int (11) NOT NULL,
    `izena` varchar(4) NOT NULL,
    `taldea` varchar(5) DEFAULT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gela`
--
LOCK TABLES `gela` WRITE;

/*!40000 ALTER TABLE `gela` DISABLE KEYS */;

/*!40000 ALTER TABLE `gela` ENABLE KEYS */;

UNLOCK TABLES;

--
-- Table structure for table `inbentarioa`
--
DROP TABLE IF EXISTS `inbentarioa`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!40101 SET character_set_client = utf8 */;

CREATE TABLE
  `inbentarioa` (
    `etiketa` varchar(10) NOT NULL,
    `idEkipamendu` int (11) NOT NULL,
    `erosketaData` date NOT NULL,
    PRIMARY KEY (`etiketa`),
    KEY `fk_ekipamendua` (`idEkipamendu`),
    CONSTRAINT `fk_ekipamendua` FOREIGN KEY (`idEkipamendu`) REFERENCES `ekipamendua` (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inbentarioa`
--
LOCK TABLES `inbentarioa` WRITE;

/*!40000 ALTER TABLE `inbentarioa` DISABLE KEYS */;

/*!40000 ALTER TABLE `inbentarioa` ENABLE KEYS */;

UNLOCK TABLES;

--
-- Table structure for table `kategoria`
--
DROP TABLE IF EXISTS `kategoria`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!40101 SET character_set_client = utf8 */;

CREATE TABLE
  `kategoria` (
    `id` int (11) NOT NULL,
    `izena` varchar(20) NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategoria`
--
LOCK TABLES `kategoria` WRITE;

/*!40000 ALTER TABLE `kategoria` DISABLE KEYS */;

/*!40000 ALTER TABLE `kategoria` ENABLE KEYS */;

UNLOCK TABLES;

--
-- Table structure for table `kokalekua`
--
DROP TABLE IF EXISTS `kokalekua`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;

/*!40101 SET character_set_client = utf8 */;

CREATE TABLE
  `kokalekua` (
    `etiketa` varchar(10) NOT NULL,
    `idGela` int (11) NOT NULL,
    `hasieraData` date NOT NULL,
    `amaieraData` date DEFAULT NULL,
    PRIMARY KEY (`etiketa`, `hasieraData`),
    KEY `fk_gela` (`idGela`),
    CONSTRAINT `fk_gela` FOREIGN KEY (`idGela`) REFERENCES `gela` (`id`),
    CONSTRAINT `fk_inbentarioa` FOREIGN KEY (`etiketa`) REFERENCES `inbentarioa` (`etiketa`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kokalekua`
--
LOCK TABLES `kokalekua` WRITE;

/*!40000 ALTER TABLE `kokalekua` DISABLE KEYS */;

/*!40000 ALTER TABLE `kokalekua` ENABLE KEYS */;

UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;

/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;

/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-05 13:11:25