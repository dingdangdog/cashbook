/*
 Navicat Premium Data Transfer

 Source Server         : cashbook
 Source Server Type    : SQLite
 Source Server Version : 3030001
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3030001
 File Encoding         : 65001

 Date: 17/05/2023 14:31:22
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Records of dists
-- ----------------------------
INSERT INTO "dists" VALUES (1, 'expenseType', '饮食', '饮食', 1);
INSERT INTO "dists" VALUES (2, 'expenseType', '娱乐', '娱乐', 2);
INSERT INTO "dists" VALUES (3, 'expenseType', '生活', '生活', 3);
INSERT INTO "dists" VALUES (4, 'expenseType', '鞋服', '鞋服', 4);
INSERT INTO "dists" VALUES (5, 'expenseType', '医护', '医护', 5);
INSERT INTO "dists" VALUES (6, 'expenseType', '学习', '学习', 6);
INSERT INTO "dists" VALUES (7, 'expenseType', '社交', '社交', 7);
INSERT INTO "dists" VALUES (8, 'expenseType', '通讯', '通讯', 8);
INSERT INTO "dists" VALUES (9, 'expenseType', '交通', '交通', 9);
INSERT INTO "dists" VALUES (10, 'expenseType', '住宿', '住宿', 10);
INSERT INTO "dists" VALUES (11, 'expenseType', '其他', '其他', 11);
INSERT INTO "dists" VALUES (12, 'paymentType', '支付宝', '支付宝', 12);
INSERT INTO "dists" VALUES (13, 'paymentType', '微信', '微信', 13);
INSERT INTO "dists" VALUES (14, 'paymentType', '京东白条', '京东白条', 14);
INSERT INTO "dists" VALUES (15, 'paymentType', '刷卡', '刷卡', 15);
INSERT INTO "dists" VALUES (16, 'paymentType', '现金', '现金', 16);
INSERT INTO "dists" VALUES (17, 'paymentType', '其他', '其他', 17);

-- ----------------------------
-- Auto increment value for dists
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 18 WHERE name = 'dists';

PRAGMA foreign_keys = true;
