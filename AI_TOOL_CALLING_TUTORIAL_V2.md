# AI 调用 + 本地工具调用实战教程（基于最新 chat-agent）

本文基于当前项目最新版 `server/lib/ai/chat-agent.ts`，讲清楚如何实现一个可落地的对话系统：

- 能调用第三方 AI 服务做理解和规划
- 能调用本地工具函数执行业务（记账、查询、统计）
- 当某种 AI 能力不支持时自动切换策略
- 全链路可观测（日志可追踪“最终执行了什么”）

---

## 1. 你要实现的核心能力

目标不是“让 AI 只会聊天”，而是让 AI 成为一个“任务编排器”：

1. 接收用户自然语言  
   例：`查一下今天的总支出`
2. 识别意图 + 参数  
   例：`query_flows` + `{ flowType: "支出", startDay: "...", endDay: "..." }`
3. 调用本地工具函数  
   例：`executeTool("query_flows", args, { userId })`
4. 返回对用户友好的自然语言结果

---

## 2. 当前实现的总体架构（双策略）

最新版 `runChatAgent()` 不是单一路径，而是两套策略：

- **方案1：tool_calls**  
  标准 Function Calling（`tools` + `tool_calls`）
- **方案2：json**  
  让模型输出结构化 JSON 指令，再由后端执行本地工具

执行顺序：

1. 先尝试 `runWithToolCalls()`
2. 如果失败，自动尝试 `runWithJsonPlan()`
3. 若两者都失败，抛出组合错误（包含两边失败原因）

这就是“第三方能力不稳定时，业务仍尽可能可用”的关键设计。

---

## 3. 方案1：tool_calls（函数调用模式）

入口：`runWithToolCalls()`

核心步骤：

1. 组装消息：
   - `system`（含时间上下文）
   - 历史 `messages`
2. 调用 AI：
   - `client.chat.completions.create({ tools: CHAT_TOOLS, ... })`
3. 处理 `msg.tool_calls`：
   - 解析函数名和参数
   - 执行 `applyTemporalHints()` 做日期修正
   - 调 `executeTool(name, args, { userId })`
4. 把工具结果作为 `role: "tool"` 回灌模型
5. 最后再请求一轮生成自然语言回复

你可以把它理解为：  
**模型负责“决定做什么”，后端负责“真的去做”。**

---

## 4. 方案2：JSON 抽取模式（无 tool_calls 兼容）

入口：`runWithJsonPlan()`

为什么需要这个模式：  
有些 OpenAI 兼容服务端不支持（或没开启）`tool_calls`，这时方案1会失败。

实现方式：

1. 发送一条 `user` 消息，让模型只返回 JSON（固定结构）
2. 解析 JSON 得到：
   - `action.name`（`add_flow | query_flows | get_statistics | none`）
   - `action.args`
   - `reply`
3. 若 `action.name` 是工具：
   - 执行本地 `executeTool`
   - 调 `summarizeToolResult()` 生成最终文本
4. 若 `none`：
   - 直接返回 `reply`

这个模式把“函数调用协议”从模型接口层，转移到了你的业务层，兼容性更高。

---

## 5. 本地工具层：第三方 AI 与业务代码的桥梁

在 `chat-agent.ts` 内，真正执行业务的是：

- `executeTool(name, args, { userId })`

工具具体定义/执行在 `server/lib/ai/tools.ts`：

- `add_flow`：新增流水（最终落库）
- `query_flows`：按条件查流水
- `get_statistics`：聚合统计

这层是关键：  
AI 不直接操作数据库，它只能“请求调用工具”；  
真正的写库、查库由你可控的本地代码完成。

---

## 6. 时间准确性优化（避免 AI 瞎猜日期）

最新版做了两层防护：

### 6.1 提示词注入当前服务器时间

通过 `buildTimeAwareSystemPrompt(now)` / `getNowContext(now)`：

- 把当前时间明确告诉 AI
- 约束“今天/昨天/本月”等语义按服务器时间解释

### 6.2 后端参数强修正（确定性逻辑）

通过 `applyTemporalHints(toolName, args, latestUserText, now)`：

- 用户说“今天” => 强制 `startDay=endDay=今天`
- 用户说“昨天” => 强制日期减一天
- 用户说“本月/上月” => 强制 `month=YYYY-MM`

结论：  
**时间语义最终由后端控制，不依赖 AI 是否算对日期。**

---

## 7. 可观测性：如何知道 AI 最终执行了什么

最新版加入统一日志 `logAIExecution()`，事件包括：

- `start`
- `tool_execute`
- `strategy_failed`
- `final_success`
- `all_failed`

日志里会包含：

- 用户原话（`userText`）
- 使用策略（`tool_calls` 或 `json`）
- 最终工具名和参数（`toolCalls`）
- 错误原因（`detail.error`）

这样你就能明确看到：

- AI 是否理解正确
- 实际执行了哪个本地函数
- 参数是否符合预期

---

## 8. 关键代码结构建议（可复用到你自己的项目）

如果你要从零做一套类似能力，建议按这个分层：

1. **client 层**（第三方服务接入）  
   统一封装 `getAIClient()` / `getConfig()`
2. **agent 层**（编排层）  
   先 A 策略，再 B 策略，统一错误处理
3. **tool 层**（能力层）  
   每个工具一个明确业务动作，返回结构化结果
4. **db/service 层**（数据层）  
   所有读写都走本地业务函数
5. **observability 层**（观测层）  
   对“输入、决策、执行、输出、失败”全链路打点

---

## 9. 典型请求完整链路（示例）

用户输入：`查一下今天的总支出`

可能链路：

1. 方案1 `tool_calls` 失败（服务端未启用 auto tool choice）
2. 自动切到方案2 `json`
3. JSON 抽取得到：
   - `action.name = query_flows`
   - `args = { flowType: "支出" }`
4. `applyTemporalHints()` 注入今天日期范围
5. 执行本地 `executeTool("query_flows", args, { userId })`
6. 汇总结果并回复用户
7. 日志记录最终执行参数

---

## 10. 你可以继续优化的方向

1. **JSON 结构加版本号**：`schemaVersion`，便于演进
2. **工具参数严格校验**：`zod` / `valibot`，防止脏参数
3. **日志加 traceId**：串联一次完整对话请求
4. **结果模板化**：不同工具使用稳定回复模板，减少波动
5. **超时与重试策略**：AI 调用增加超时和有限重试

---

## 11. 总结

这份最新实现的本质是：

- 用 AI 做“理解和决策”
- 用本地工具做“可控执行”
- 用双策略做“兼容与稳定”
- 用日志做“可验证与可调试”

当你把这四点搭起来，就能实现一个真正可上线、可维护、可排障的“对话驱动业务系统”。
