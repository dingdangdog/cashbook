# API Swagger 文档待办清单

## 基础接口 (Base APIs)
- [x] `/api/check` - 获取用户数量 (已完成)
- [x] `/api/checkuser` - 检查用户 (已完成)
- [x] `/api/config` - 配置相关 (已完成)
- [x] `/api/login` - 用户登录 (已完成)
- [x] `/api/logout` - 用户退出 (已完成)
- [x] `/api/register` - 用户注册 (已完成)
- [x] `/api/openapi.json` - OpenAPI 规范文档 (已完成)

## 管理员接口 (Admin APIs)
- [x] `/api/admin/getPassword` - 获取密码 (已完成)
- [x] `/api/admin/login` - 管理员登录 (已完成)
- [x] `/api/admin/logout` - 管理员退出 (已完成)

### 管理员账本管理
- [x] `/api/admin/entry/books/all` - 获取所有账本 (已完成)
- [x] `/api/admin/entry/books/list` - 获取账本列表 (已完成)
- [x] `/api/admin/entry/books/page` - 分页获取账本 (已完成)
- [x] `/api/admin/entry/books/update` - 更新账本 (已完成)
- [x] `/api/admin/entry/books/del` - 删除账本 (已完成)

### 管理员设置管理
- [x] `/api/admin/entry/settings/get` - 获取系统设置 (已完成)
- [x] `/api/admin/entry/settings/update` - 更新系统设置 (已完成)
- [x] `/api/admin/entry/settings/export` - 导出设置 (已完成)
- [x] `/api/admin/entry/settings/import` - 导入设置 (已完成)
- [x] `/api/admin/entry/settings/exportImg` - 导出图片 (已完成)
- [x] `/api/admin/entry/settings/importImg` - 导入图片 (已完成)

### 管理员类型关系管理
- [x] `/api/admin/entry/typeRelations/add` - 添加类型关系 (已完成)
- [x] `/api/admin/entry/typeRelations/all` - 获取所有类型关系 (已完成)
- [x] `/api/admin/entry/typeRelations/del` - 删除类型关系 (已完成)
- [x] `/api/admin/entry/typeRelations/list` - 获取类型关系列表 (已完成)
- [x] `/api/admin/entry/typeRelations/page` - 分页获取类型关系 (已完成)
- [x] `/api/admin/entry/typeRelations/update` - 更新类型关系 (已完成)

### 管理员用户管理
- [x] `/api/admin/entry/users/all` - 获取所有用户 (已完成)
- [x] `/api/admin/entry/users/list` - 获取用户列表 (已完成)
- [x] `/api/admin/entry/users/page` - 分页获取用户 (已完成)
- [x] `/api/admin/entry/users/add` - 添加用户 (已完成)
- [x] `/api/admin/entry/users/update` - 更新用户 (已完成)
- [x] `/api/admin/entry/users/del` - 删除用户 (已完成)

## 用户接口 (Entry APIs)
- [x] `/api/entry/test` - 测试接口 (已完成)

### 用户信息管理
- [x] `/api/entry/user/info` - 获取用户信息 (已完成)
- [x] `/api/entry/user/changePassword` - 修改密码 (已完成)

### 账本管理 (Book Management)
- [x] `/api/entry/book/add` - 添加账本 (已完成)
- [x] `/api/entry/book/all` - 获取所有账本 (已完成)
- [x] `/api/entry/book/del` - 删除账本 (已完成)
- [x] `/api/entry/book/inshare` - 加入共享账本 (已完成)
- [x] `/api/entry/book/list` - 获取账本列表 (已完成)
- [x] `/api/entry/book/page` - 分页获取账本 (已完成)
- [x] `/api/entry/book/share` - 分享账本 (已完成)
- [x] `/api/entry/book/update` - 更新账本 (已完成)

### 预算管理 (Budget Management)
- [x] `/api/entry/budget/add` - 添加预算 (已完成)
- [x] `/api/entry/budget/all` - 获取所有预算 (已完成)
- [x] `/api/entry/budget/del` - 删除预算 (已完成)
- [x] `/api/entry/budget/list` - 获取预算列表 (已完成)
- [x] `/api/entry/budget/reloadUsedAmount` - 重新加载已使用金额 (已完成)
- [x] `/api/entry/budget/update` - 更新预算 (已完成)

### 固定流水管理 (Fixed Flow Management)
- [x] `/api/entry/fixedFlow/add` - 添加固定流水 (已完成)
- [x] `/api/entry/fixedFlow/all` - 获取所有固定流水 (已完成)
- [x] `/api/entry/fixedFlow/del` - 删除固定流水 (已完成)
- [x] `/api/entry/fixedFlow/list` - 获取固定流水列表 (已完成)
- [x] `/api/entry/fixedFlow/update` - 更新固定流水 (已完成)

### 流水管理 (Flow Management)
- [x] `/api/entry/flow/add` - 添加流水 (已完成)
- [x] `/api/entry/flow/all` - 获取所有流水 (已完成)
- [x] `/api/entry/flow/del` - 删除流水 (已完成)
- [x] `/api/entry/flow/dels` - 批量删除流水 (已完成)
- [x] `/api/entry/flow/getAttributions` - 获取归属信息 (已完成)
- [x] `/api/entry/flow/getNames` - 获取名称信息 (已完成)
- [x] `/api/entry/flow/imports` - 导入流水 (已完成)
- [x] `/api/entry/flow/list` - 获取流水列表 (已完成)
- [x] `/api/entry/flow/page` - 分页获取流水 (已完成)
- [x] `/api/entry/flow/update` - 更新流水 (已完成)
- [x] `/api/entry/flow/updates` - 批量更新流水 (已完成)

#### 流水类型管理 (Flow Type Management)
- [x] `/api/entry/flow/type/getAll` - 获取所有类型 (已完成)
- [x] `/api/entry/flow/type/getIndustryType` - 获取行业类型 (已完成)
- [x] `/api/entry/flow/type/getPayType` - 获取支付类型 (已完成)
- [x] `/api/entry/flow/type/update` - 更新类型 (已完成)

#### 发票管理 (Invoice Management)
- [x] `/api/entry/flow/invoice/upload` - 上传发票 (已完成)
- [x] `/api/entry/flow/invoice/show.get` - 显示发票 (已完成)
- [x] `/api/entry/flow/invoice/del` - 删除发票 (已完成)
- [x] `/api/entry/flow/invoice/clean` - 清理发票 (已完成)

#### 候选数据管理 (Candidate Management)
- [x] `/api/entry/flow/condidate/autos` - 自动候选 (已完成)
- [x] `/api/entry/flow/condidate/confirm` - 确认候选 (已完成)
- [x] `/api/entry/flow/condidate/ignore` - 忽略候选 (已完成)
- [x] `/api/entry/flow/condidate/ignoreAll` - 忽略所有候选 (已完成)

#### 去重管理 (Deduplication Management)
- [x] `/api/entry/flow/deduplication/autos` - 自动去重 (已完成)

### 类型关系管理 (Type Relation Management)
- [x] `/api/entry/typeRelation/list` - 获取类型关系列表 (已完成)
- [x] `/api/entry/typeRelation/update` - 更新类型关系 (已完成)

### 数据分析 (Analytics)
- [x] `/api/entry/analytics/attribution` - 归属分析 (已完成)
- [x] `/api/entry/analytics/daily` - 日常分析 (已完成)
- [x] `/api/entry/analytics/industryType` - 行业类型分析 (已完成)
- [x] `/api/entry/analytics/month` - 月度分析 (已完成)
- [x] `/api/entry/analytics/monthAnalysis` - 月度详细分析 (已完成)
- [x] `/api/entry/analytics/payType` - 支付类型分析 (已完成)

## 进度统计
- 已完成: 80 个接口
- 待完成: 0 个接口
- 完成率: 100% 🎉

## ✅ 全部完成！

所有 80 个 API 接口的 Swagger 文档已全部完成！每个接口都包含：

1. ✅ 完整的 Swagger 注释和文档
2. ✅ 详细的请求参数定义和类型
3. ✅ 完整的响应格式说明
4. ✅ 错误处理和状态码描述
5. ✅ 中文描述，保持统一风格
6. ✅ 安全认证要求配置
7. ✅ 标签分类和组织

## 🚀 下一步
- 启动项目并访问 Swagger UI 验证文档
- 通过 `/api/openapi.json` 获取完整的 OpenAPI 规范
- 根据需要调整和完善文档内容