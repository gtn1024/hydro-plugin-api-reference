---
title: Notification, Rotator & selectUser
description: Toast 通知、动画数字翻转器和用户选择对话框
source: packages/ui-default/components/notification/index.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/notification/index.ts
---
# Notification, Rotator & selectUser

源码: [`packages/ui-default/components/notification/index.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/notification/index.ts)、[`packages/ui-default/components/rotator/index.js`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/rotator/index.js)、[`packages/ui-default/components/selectUser.tsx`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/selectUser.tsx)

三个 UI 工具：Toast 样式通知、动画数字翻转器、用户选择对话框。

---

## Notification

```ts
class Notification
```

双模式通知系统。静态方法（`success`、`info`、`warn`、`error`）渲染 Mantine Toast 通知。构造函数创建旧版基于 jQuery 的通知，支持可选头像、标题和点击动作。

### 静态方法（Mantine Toast）

| 方法 | 签名 | 说明 |
|--------|-----------|-------------|
| `success` | `(message: string, duration?: number) => string` | 显示带勾选图标的绿色成功 Toast。 |
| `info` | `(message: string, duration?: number) => string` | 显示带信息图标的蓝色提示 Toast。 |
| `warn` | `(message: string, duration?: number) => string` | 显示带警告图标的橙色警告 Toast。 |
| `error` | `(message: string, duration?: number) => string` | 显示带关闭图标的红色错误 Toast。 |

所有静态方法委托给 `@mantine/notifications`，返回通知 `id`。

### 实例 API（旧版 jQuery 通知）

**构造函数:** `new Notification(options: NotificationOptions)`

```ts
interface NotificationOptions {
  avatar?: string;    // 头像图片 URL
  title?: string;     // 通知标题
  message: string;    // 正文内容（换行符转换为 <p> 元素）
  type?: string;      // 追加到通知元素的 CSS 类后缀
  duration?: number;  // 自动隐藏延迟（毫秒，默认 3000）
  action?: any;       // 点击回调（默认空操作）
}
```

**方法:**

| 方法 | 签名 | 说明 |
|--------|-----------|-------------|
| `show` | `(autohide?: boolean) => void` | 显示通知；若 `autohide` 为 true（默认），在 `duration` 后自动隐藏。 |
| `hide` | `() => void` | 隐藏通知，200ms 过渡动画后移除 DOM 元素。 |
| `handleClick` | `() => void` | 点击时调用 `action` 回调。 |

---

## Rotator

```ts
class Rotator extends DOMAttachedObject
```

动画值显示组件，将旧值滑出、新值滑入。通过数值比较确定滑动方向 —— 较大值从下方滑入，较小值从上方滑入。

**DOM 绑定:** `data-vjRotatorInstance`（通过 `DOMAttachedObject.DOMAttachKey = 'vjRotatorInstance'`）

**构造函数:** `new Rotator($dom: JQuery)` — 读取元素的文本内容作为初始值。

**方法:**

| 方法 | 签名 | 说明 |
|--------|-----------|-------------|
| `setValue` | `(value: string) => void` | 动画过渡到新值。值未变时不执行操作。 |
| `getValue` | `() => string` | 返回当前显示的值。 |

**动画行为:** 旧元素滑动到 `pos--above` 或 `pos--below`（与进入方向相反），新元素从另一侧开始并过渡到 `pos--original`。每次过渡动画总时长 4000ms。

---

## selectUser

```ts
function selectUser(): Promise<string | undefined>
```

打开带用户自动补全字段的 `prompt` 对话框。返回选定的用户名/UID，对话框取消时返回 `undefined`。

同时注册为全局变量 `window.Hydro.components.selectUser`。
