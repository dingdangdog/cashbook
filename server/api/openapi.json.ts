// server/api/openapi.json.ts
import swaggerJsdoc from "swagger-jsdoc";
import options from "../../swagger.config"; // 导入你的 OpenAPI 配置

let swaggerSpec: any;

/**
 * @swagger
 * /api/openapi.json:
 *   get:
 *     summary: 获取OpenAPI规范文档
 *     tags: ["Base"]
 *     responses:
 *       200:
 *         description: OpenAPI规范文档
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: OpenAPI规范对象
 *               }
 */
export default defineEventHandler((event) => {
  if (!swaggerSpec) {
    swaggerSpec = swaggerJsdoc(options);
  }
  // 设置响应头为 JSON
  setHeader(event, "Content-Type", "application/json");
  return swaggerSpec;
});
