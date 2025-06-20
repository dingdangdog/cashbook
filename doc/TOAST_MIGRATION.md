# Toast 消息通知系统迁移指南

## 概述

系统已从原有的 Vuetify Alert 组件迁移到了基于 `vue-toastification` 的 Toast 消息通知系统。

## 变更内容

### 1. 新增依赖
- 安装了 `vue-toastification@next`
- 新增了 `plugins/toast.client.ts` 插件配置

### 2. 组件更新
- `GlobalAlert.vue` 组件已简化，不再负责消息显示逻辑
- 消息显示现在由 toast 系统全局处理

### 3. 工具类更新
- `utils/alert.ts` 已更新为使用 toast
- 新增了 `utils/toast.ts` 提供更现代化的 API

## 使用方法

### 方法一：使用原有的 Alert 类（推荐用于兼容性）

```typescript
import { Alert } from "~/utils/alert"

// 成功消息
Alert.success("操作成功")

// 错误消息
Alert.error("操作失败")

// 警告消息
Alert.warning("请注意")

// 信息消息
Alert.info("提示信息")
```

### 方法二：使用新的 useAppToast composable（推荐用于新代码）

```vue
<script setup>
import { useAppToast } from "~/utils/toast"

const toast = useAppToast()

const handleSuccess = () => {
  toast.success("操作成功")
}

const handleError = () => {
  toast.error("操作失败", {
    timeout: 5000  // 自定义显示时间
  })
}

const clearAllToasts = () => {
  toast.clear()
}
</script>
```

## Toast 配置

Toast 的全局配置在 `plugins/toast.client.ts` 中：

- **位置**: 右下角
- **默认显示时间**: 3秒（错误消息4秒）
- **最大数量**: 5个
- **支持拖拽**: 是
- **悬停暂停**: 是

## 样式定制

Toast 的样式在 `assets/css/main.css` 中定制，包括：

- 圆角边框
- 阴影效果
- 颜色主题
- 响应式设计

## 向后兼容性

- 所有现有的 `Alert.success()`、`Alert.error()` 等调用都能正常工作
- `GlobalAlert` 组件仍然存在，但不再处理显示逻辑
- 布局文件中的 `<GlobalAlert />` 可以保留或移除

## 优势

1. **更好的用户体验**: Toast 不会阻挡页面内容
2. **更丰富的交互**: 支持拖拽、悬停暂停等
3. **更好的性能**: 不需要复杂的状态管理
4. **更现代**: 使用现代化的 toast 组件库
5. **移动端友好**: 更好的响应式支持

## 注意事项

- Toast 只在客户端生效，服务端渲染时不会显示
- 旧的 `newAlert` ref 仍然存在但不再使用
- `GlobalAlert` 组件可以在后续版本中完全移除 