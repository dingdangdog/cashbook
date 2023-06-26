/*
 Navicat Premium Data Transfer

 Source Server         : app_cashbook
 Source Server Type    : SQLite
 Source Server Version : 3030001
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3030001
 File Encoding         : 65001

 Date: 25/06/2023 15:17:18
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for auth_info
-- ----------------------------
-- DROP TABLE IF EXISTS "auth_info";
CREATE TABLE IF NOT EXISTS "auth_info" (
    "key" TEXT NOT NULL,
    "state" integer,
    "limit" integer,
    "day" integer,
    PRIMARY KEY ("key")
);

CREATE TABLE IF NOT EXISTS "log_download" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT,
    "day" TEXT,
    "time" TEXT,
    "file_path" TEXT
);

CREATE TABLE IF NOT EXISTS "log_upload" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT,
    "day" TEXT,
    "time" TEXT,
    "file_path" TEXT
);

PRAGMA foreign_keys = true;
