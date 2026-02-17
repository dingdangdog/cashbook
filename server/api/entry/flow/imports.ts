import crypto from "crypto";
import prisma from "~~/server/lib/prisma";
import {
  recalcFundAccountFromFlows,
  resolveFlowAccountDelta,
} from "~~/server/utils/db";

/** 根据时间+金额+方式+名称生成唯一流水编号（无第三方订单号时用于去重） */
function genFlowNoByContent(
  userId: number,
  flow: {
    day?: string | Date;
    money?: number;
    payType?: string;
    name?: string;
  },
): string {
  const day =
    flow.day instanceof Date
      ? flow.day.toISOString().slice(0, 10)
      : flow.day
        ? new Date(flow.day).toISOString().slice(0, 10)
        : "";
  const money = Number(flow.money);
  const payType = String(flow.payType ?? "").trim();
  const name = String(flow.name ?? "").trim();
  const hash = crypto
    .createHash("sha256")
    .update(`${userId}|${day}|${money}|${payType}|${name}`)
    .digest("hex")
    .slice(0, 45);
  return `imp_${hash}`;
}

/**
 * @swagger
 * /api/entry/flow/imports:
 *   post:
 *     summary: 批量导入流水记录
 *     tags: ["Flow"]
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             mode: string 导入模式（add-追加，overwrite-覆盖）
 *             flows: [] #[Flow流水记录数组，可含 flowNo 用于去重]
 *     responses:
 *       200:
 *         description: 导入成功
 *         content:
 *           application/json:
 *             schema:
 *               Result:
 *                 d: { count, skipped } 导入条数与被去重跳过条数
 *       400:
 *         description: 导入失败
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const mode = String(body.mode ?? "add");
  const flows: any[] = Array.isArray(body.flows) ? body.flows : [];
  const userId = await getUserId(event);

  if (mode === "overwrite") {
    await prisma.flow.deleteMany({ where: { userId } });
  }

  if (flows.length === 0) {
    return success({ count: 0, skipped: 0 });
  }

  // 1) 为每条流水确定 flowNo：有则用传入的，无则用 时间+金额+方式+名称 生成
  const withFlowNo = flows.map((flow, index) => {
    const rawNo =
      flow.flowNo != null && String(flow.flowNo).trim() !== ""
        ? String(flow.flowNo).trim()
        : "";
    const flowNo =
      rawNo !== ""
        ? rawNo.slice(0, 50)
        : genFlowNoByContent(userId, {
            day: flow.day,
            money: flow.money,
            payType: flow.payType,
            name: flow.name,
          });
    return { flow, flowNo, index };
  });

  // 2) 本批内按 flowNo 去重，保留首次出现
  const seen = new Set<string>();
  const deduped = withFlowNo.filter(({ flowNo }) => {
    if (seen.has(flowNo)) return false;
    seen.add(flowNo);
    return true;
  });

  const flowNos = deduped.map(({ flowNo }) => flowNo);

  // 3) 查询库中已存在的 flowNo（仅追加模式下需要）
  let existingSet = new Set<string>();
  if (mode === "add" && flowNos.length > 0) {
    const existing = await prisma.flow.findMany({
      where: { userId, flowNo: { in: flowNos } },
      select: { flowNo: true },
    });
    existingSet = new Set(existing.map((r) => r.flowNo));
  }

  // 4) 仅插入不存在的
  const toInsert = deduped.filter(({ flowNo }) => !existingSet.has(flowNo));
  const skipped = flows.length - toInsert.length;

  const datas = toInsert.map(({ flow, flowNo }) => ({
    userId,
    flowNo,
    name: flow.name != null ? String(flow.name) : "",
    day: new Date(flow.day),
    description: flow.description != null ? String(flow.description) : null,
    flowType: flow.flowType != null ? String(flow.flowType) : null,
    invoice: flow.invoice ? String(flow.invoice) : null,
    money: Number(flow.money),
    payType: flow.payType != null ? String(flow.payType) : null,
    accountId: flow.accountId ? Number(flow.accountId) : null,
    accountDelta:
      flow.accountDelta !== undefined && flow.accountDelta !== null
        ? Number(flow.accountDelta)
        : null,
    accountBal: null,
    industryType:
      flow.type != null
        ? String(flow.type)
        : flow.industryType != null
          ? String(flow.industryType)
          : "",
    attribution: flow.attribution != null ? String(flow.attribution) : null,
    origin:
      flow.origin != null && String(flow.origin).trim() !== ""
        ? String(flow.origin).trim().slice(0, 200)
        : null,
  }));

  let created = { count: 0 };
  const hasAccountData = datas.some((d) => !!d.accountId);
  if (!hasAccountData) {
    created =
      datas.length > 0
        ? await prisma.flow.createMany({ data: datas })
        : { count: 0 };
  } else {
    const count = await prisma.$transaction(async (tx) => {
      let inserted = 0;
      const accountIds = new Set<number>();
      for (const row of datas) {
        const delta = resolveFlowAccountDelta({
          flowType: row.flowType,
          money: Number(row.money || 0),
          accountDelta: row.accountDelta,
        });
        await tx.flow.create({
          data: {
            ...row,
            accountDelta: row.accountId ? delta : null,
            accountBal: null,
          },
        });
        if (row.accountId) accountIds.add(row.accountId);
        inserted++;
      }
      for (const accountId of accountIds) {
        await recalcFundAccountFromFlows(accountId, tx);
      }
      return inserted;
    });
    created = { count };
  }

  return success({
    count: created.count,
    skipped,
  });
});
