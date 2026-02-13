/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: 用户退出登录
 *     tags: ["Base"]
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: 退出成功
 */
export default defineEventHandler(async (event) => {
  deleteCookie(event, "Authorization");
  deleteCookie(event, "Admin");
  return success("退出成功");
});
