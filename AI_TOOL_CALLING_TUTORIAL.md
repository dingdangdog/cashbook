# AI 调用与本地工具调用教学（第三方服务 + 本地代码交互）

本文基于本项目当前实现，讲解如何编写一个“可调用第三方 AI，又能执行本地业务函数”的完整能力链路。目标是让你能独立实现：

1. 接收用户自然语言请求（如“记一笔午饭 50”）
2. 调用第三方大模型进行意图理解与工具规划
3. 执行本地工具函数（数据库读写）
4. 在第三方服务能力受限时进行本地兜底，保证核心功能可用

---

## 1. 整体架构（先建立心智模型）

在本项目中，核心链路是：

- API 入口：`server/api/entry/ai/chat.post.ts`
- AI 客户端与配置：`server/lib/ai/client.ts`
- AI 代理主循环：`server/lib/ai/chat-agent.ts`
- 工具定义与执行：`server/lib/ai/tools.ts`
- DB 封装函数：`server/utils/db/*`

执行流程可以概括为：

1. 前端把用户消息发到 `/api/entry/ai/chat`
2. 后端读取会话历史，组装 `messages`
3. `runChatAgent()` 调用大模型，允许模型发起 `tool_calls`
4. 服务端收到工具调用后执行本地 `executeTool()`
5. 把工具结果回灌给模型，生成自然语言回复
6. 若模型工具调用失败（兼容后端限制），走本地兜底解析并直接调用本地工具完成记账

---

## 2. 第三方服务接入：客户端与配置管理

文件：`server/lib/ai/client.ts`

### 2.1 设计原则

- **统一客户端工厂**：所有业务都通过 `getAIClient()` 获取 AI 客户端
- **配置可切换**：支持 `providerId` 指定服务商，不传则取默认可用项
- **协议兼容**：使用 OpenAI SDK + `baseURL` 兼容不同厂商/网关

### 2.2 关键实现点

- `getProvider(providerId)`：优先读指定 provider，否则读第一个启用的 provider
- `getAIClient(providerId)`：从 DB 读 `apiKey + apiEndpoint` 创建客户端
- `getAIProviderConfig(providerId)`：统一返回 `model/temperature/maxTokens`

这样做的好处是：**业务层不关心你接的是 OpenAI、DeepSeek 还是自建兼容服务**，只关心“我能拿到一个可调用对象”。

---

## 3. 工具调用层：把“模型意图”变成“本地函数执行”

文件：`server/lib/ai/tools.ts`

### 3.1 工具定义（声明层）

`CHAT_TOOLS` 是给模型看的“函数菜单”，每个工具都要包含：

- `name`：工具名（如 `add_flow`）
- `description`：什么时候用
- `parameters`：参数 JSON Schema（类型、枚举、必填）

这相当于告诉模型：“你可以调用哪些后端能力，以及参数如何填”。

### 3.2 工具执行（实现层）

`executeTool(name, args, ctx)` 是路由分发器：

- `add_flow` -> `execAddFlow()`
- `query_flows` -> `execQueryFlows()`
- `get_statistics` -> `execGetStatistics()`

每个 `execXxx` 的实质是调用 `server/utils/db` 的封装函数，而不是直接把 SQL/ORM 逻辑散落在业务层。比如：

- 新增流水：`createFlow(data)`
- 查询流水分页：`getFlowsPage(where, page)`
- 统计：`prisma.flow.groupBy(...)`

### 3.3 为什么优先用 `server/utils/db`

因为它具备：

- 更稳定的参数接口（复用查询条件/分页约定）
- 更容易测试（工具函数只测业务，不测 ORM 拼装细节）
- 更易维护（换 ORM 或调整模型时，改动面可控）

---

## 4. Agent 主循环：函数调用对话范式

文件：`server/lib/ai/chat-agent.ts`

`runChatAgent()` 做了三件关键事情：

1. 拼接系统提示词 + 历史消息
2. 调用 `chat.completions.create(...)`，传入 `tools`
3. 处理 `tool_calls`，执行本地函数，再把工具结果写回消息流继续让模型推理

典型伪代码：

```ts
while (round < maxToolRounds) {
  const res = await llm.create({ messages, tools });
  const msg = res.choices[0].message;
  messages.push(msg);

  if (!msg.tool_calls?.length) break;

  for (const call of msg.tool_calls) {
    const args = JSON.parse(call.function.arguments || "{}");
    const output = await executeTool(call.function.name, args, { userId });
    messages.push({ role: "tool", tool_call_id: call.id, content: output });
  }
}
```

这就是标准的“模型计划 -> 本地执行 -> 回灌结果 -> 模型总结”模式。

---

## 5. 兼容性问题实战：`tool_choice: "auto"` 报错如何处理

你遇到的典型报错：

`"auto" tool choice requires --enable-auto-tool-choice and --tool-call-parser to be set`

含义是：你使用的 OpenAI 兼容后端（如某些网关/Ollama 兼容层）没有启用自动工具选择能力，但当前请求触发了工具调用模式。

### 5.1 本项目中的处理策略

在 `runChatAgent()` 中增加了 `try/catch`：

- 先按标准 `tools` 模式调用
- 捕获该特定报错（`isAutoToolChoiceError()`）
- 触发 `tryLocalBookkeepingFallback()` 本地兜底

### 5.2 本地兜底做了什么

`tryLocalBookkeepingFallback()` 主要步骤：

1. 从最近用户消息提取文本（`getLatestUserText`）
2. 规则解析“金额/收支方向/分类/支付方式/名称”（`parseSimpleBookkeepingText`）
3. 直接调用本地 `executeTool("add_flow", ...)`
4. 将结果组织成用户可读回复

即使第三方服务工具调用能力不可用，仍能保证“记账”这个核心业务可落库完成。

---

## 6. 设计一个可落地的“第三方 + 本地”能力时的通用模板

你可以按下面模板复用到其他业务（客服工单、订单管理、报表系统等）：

### 第 1 步：定义工具协议（模型可见）

- 明确工具名、适用场景、参数类型、必填字段
- 参数尽量结构化，少让模型自由文本发挥

### 第 2 步：实现工具函数（后端可控）

- 每个工具函数只做一类业务动作
- 入参做校验，返回结构化 JSON（`success/message/data`）
- 内部优先调用你项目已有的 service/db 封装

### 第 3 步：搭建 agent 循环（编排）

- 调模型 -> 识别 `tool_calls` -> 执行 -> 回灌 -> 再调模型总结
- 增加 `maxToolRounds` 防止死循环

### 第 4 步：做降级兜底（可靠性）

- 识别第三方常见错误（超时、限流、协议不支持）
- 对核心路径提供本地规则/默认行为
- 兜底逻辑只保证“完成关键任务”，不追求“最聪明”

### 第 5 步：可观测性

- 记录每轮调用耗时、工具名、参数摘要、错误码
- 区分“模型失败”与“本地执行失败”
- 有条件可加 traceId 串联一次会话

---

## 7. 代码层面的关键实践建议

1. **工具函数返回 JSON 字符串而不是自然语言**  
   这样模型更容易读取结构化结果，后续总结也更稳定。

2. **本地工具要幂等/可审计**  
   尤其是“记账、扣款、下单”类操作，建议记录来源（如 `origin: "AI对话记账"`）。

3. **参数收敛优先于模型猜测**  
   与其让模型自由生成，不如你在 schema 里约束枚举和必填项。

4. **错误要分层处理**
   - AI 调用失败：给出用户可理解提示 + 降级
   - 工具执行失败：返回具体业务错误
   - 系统异常：统一异常处理和日志

5. **会话上下文要可控**  
   历史消息过长会增加成本和不稳定性，可做裁剪或摘要。

---

## 8. 如何扩展：新增一个“删除流水”工具

如果你要新增能力，按这四处改：

1. 在 `CHAT_TOOLS` 新增 `delete_flow` 定义（含参数 schema）
2. 在 `tools.ts` 新增 `execDeleteFlow(args, ctx)`
3. 在 `executeTool()` 的 `switch` 里加分发
4. 在 `SYSTEM_PROMPT` 写明何时使用该工具

这样模型就能在对话中自动决定是否调用该本地能力。

---

## 9. 小结

把第三方 AI 与本地业务交互做稳，本质是三层分离：

- **AI 层**：负责理解和规划（会说“做什么”）
- **工具层**：负责执行能力暴露（定义“能做什么”）
- **业务层/DB 层**：负责真实读写（保证“正确地做”）

再加上一层降级兜底，你就能得到一个“智能 + 可控 + 可用”的生产级对话系统。
