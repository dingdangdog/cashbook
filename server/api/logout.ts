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
 *         content:
 *           application/json:
 *             schema:
 *               Result: {
 *                 d: "退出成功"
 *               }
 */
export default defineEventHandler(async (event) => {
  // const Authorization = getHeader(event, "Admin");

  deleteCookie(event, "Authorization");

  return success("退出成功");
});
