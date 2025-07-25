// server/api/openapi.json.ts
import swaggerJsdoc from "swagger-jsdoc";
import options from "../../swagger.config"; // 导入你的 OpenAPI 配置

let swaggerSpec: any;

export default defineEventHandler((event) => {
  if (!swaggerSpec) {
    swaggerSpec = swaggerJsdoc(options);
  }
  // 设置响应头为 JSON
  setHeader(event, "Content-Type", "application/json");
  return success(swaggerSpec);
});
