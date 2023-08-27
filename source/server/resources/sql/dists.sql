/*
 Navicat Premium Data Transfer

 Source Server         : cashbook
 Source Server Type    : SQLite
 Source Server Version : 3030001
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3030001
 File Encoding         : 65001

 Date: 23/05/2023 12:35:42
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Records of dists
-- ----------------------------
INSERT INTO "dists" VALUES (1, 'distType', 'distType', '字典类型', 1, NULL);
INSERT INTO "dists" VALUES (2, 'distType', 'expenseType', '消费类型', 2, NULL);
INSERT INTO "dists" VALUES (3, 'distType', 'paymentType', '支付方式', 3, NULL);
INSERT INTO "dists" VALUES (4, 'expenseType', '饮食', '饮食', 1, NULL);
INSERT INTO "dists" VALUES (5, 'expenseType', '娱乐', '娱乐', 2, NULL);
INSERT INTO "dists" VALUES (6, 'expenseType', '生活', '生活', 3, NULL);
INSERT INTO "dists" VALUES (7, 'expenseType', '鞋服', '鞋服', 4, NULL);
INSERT INTO "dists" VALUES (8, 'expenseType', '医护', '医护', 5, NULL);
INSERT INTO "dists" VALUES (9, 'expenseType', '学习', '学习', 6, NULL);
INSERT INTO "dists" VALUES (10, 'expenseType', '社交', '社交', 7, NULL);
INSERT INTO "dists" VALUES (11, 'expenseType', '通讯', '通讯', 8, NULL);
INSERT INTO "dists" VALUES (12, 'expenseType', '交通', '交通', 9, NULL);
INSERT INTO "dists" VALUES (13, 'expenseType', '住宿', '住宿', 10, NULL);
INSERT INTO "dists" VALUES (14, 'expenseType', '其他', '其他', 11, NULL);
INSERT INTO "dists" VALUES (15, 'paymentType', '支付宝', '支付宝', 1, NULL);
INSERT INTO "dists" VALUES (16, 'paymentType', '微信', '微信', 2, NULL);
INSERT INTO "dists" VALUES (17, 'paymentType', '京东白条', '京东白条', 3, NULL);
INSERT INTO "dists" VALUES (18, 'paymentType', '刷卡', '刷卡', 4, NULL);
INSERT INTO "dists" VALUES (19, 'paymentType', '现金', '现金', 5, NULL);
INSERT INTO "dists" VALUES (20, 'paymentType', '其他', '其他', 6, NULL);

-- ----------------------------
-- Auto increment value for dists
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 21 WHERE name = 'dists';

PRAGMA foreign_keys = true;
