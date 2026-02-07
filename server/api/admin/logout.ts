/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: 管理员退出登录
 *     tags: ["Admin"]
 *     security:
 *       - Admin: []
 *     responses:
 *       200:
 *         description: 退出成功
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: "退出成功"
 *               }
 */
export default defineEventHandler(async (event) => {
  // const Authorization = getHeader(event, "Admin");

  deleteCookie(event, "Admin");

  return success("退出成功");
});
