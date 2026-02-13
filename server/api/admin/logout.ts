/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: 管理员退出登录
 *     tags: ["Admin"]
 *     responses:
 *       200:
 *         description: 退出成功
 */
export default defineEventHandler(async (event) => {
  deleteCookie(event, "Authorization");
  deleteCookie(event, "Admin");
  return success("退出成功");
});
