/*
 Navicat Premium Data Transfer

 Source Server         : cashbook
 Source Server Type    : SQLite
 Source Server Version : 3030001
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3030001
 File Encoding         : 65001

 Date: 17/05/2023 11:45:49
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for books
-- ----------------------------
CREATE TABLE IF NOT EXISTS "books" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "book_name" TEXT,
  "book_key" TEXT,
  "create_date" TEXT
);

-- ----------------------------
-- Records of books
-- ----------------------------

-- ----------------------------
-- Table structure for dists
-- ----------------------------
CREATE TABLE IF NOT EXISTS "dists" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "type" TEXT,
  "dist_key" TEXT,
  "dist_value" TEXT,
  "sort" INTEGER
);

-- ----------------------------
-- Records of dists
-- ----------------------------

-- ----------------------------
-- Table structure for flows
-- ----------------------------
CREATE TABLE IF NOT EXISTS"flows" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "book_key" TEXT,
  "day" TEXT,
  "type" TEXT,
  "money" REAL,
  "pay_type" TEXT,
  "name" TEXT,
  "description" TEXT
);

-- ----------------------------
-- Records of flows
-- ----------------------------

-- ----------------------------
-- Table structure for server
-- ----------------------------
CREATE TABLE IF NOT EXISTS "server" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "version" TEXT,
  "environment" TEXT,
  "create_date" TEXT
);


CREATE TABLE IF NOT EXISTS "plans" (
  "month" TEXT NOT NULL,
  "limit_money" integer,
  "used_money" integer,
  PRIMARY KEY ("month")
);

PRAGMA foreign_keys = true;
