---
title: 对话框系统
description: 模态覆盖层用于用户交互，从简单提示到复杂的多字段表单
source: packages/ui-default/components/dialog/index.tsx
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/dialog/index.tsx
import: "import { Dialog, InfoDialog, ActionDialog, ConfirmDialog, prompt, confirm, alert } from '@hydrooj/ui-default'"
---
# 对话框系统

源码: [`packages/ui-default/components/dialog/index.tsx`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/dialog/index.tsx)、[`packages/ui-default/components/dialog/DomDialog.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/dialog/DomDialog.ts)

对话框系统提供模态覆盖层用于用户交互 —— 从简单提示到复杂的多字段表单。基于 jQuery DOM 操作构建，表单内容使用 React 渲染。

## 类

### Dialog

```ts
class Dialog
```

基础模态对话框。构造一个基于 jQuery 的覆盖层，包含主体区域和操作按钮栏。包装 `DomDialog` 实现显示/隐藏动画和操作分发。

**属性:** `options`（DialogOptions）、`$dom`（JQuery）、`domDialogInstance`（DomDialog）

**方法:**
- `open()` — 显示对话框；返回 `Promise<string>`，在操作名称（如 `"ok"`、`"cancel"`）上 resolve。
- `close()` — 隐藏对话框。

### InfoDialog

```ts
class InfoDialog extends Dialog
```

预配置了 "Ok" 按钮的 `Dialog`。支持通过点击背景和 Escape 键关闭。

### ActionDialog

```ts
class ActionDialog extends Dialog
```

预配置了 "Cancel" 和 "Ok" 按钮的 `Dialog`。支持通过点击背景和 Escape 键关闭。包含 `clear()` 方法，重置所有输入值。

### ConfirmDialog

```ts
class ConfirmDialog extends Dialog
```

预配置了 "No" 和 "Yes" 按钮的 `Dialog`。当 `options.canCancel` 为 true 时，增加 "Cancel" 按钮并启用背景/Escape 关闭。

## 函数

### prompt

```ts
async function prompt<T extends string, R extends Record<T, Field>>(
  title: string, fields: R, options?: PromptOptions
): Promise<Result<T, R> | null>
```

显示包含给定字段的模态表单。返回将字段名映射到值的类型化对象，取消时返回 `null`。接受前会校验 `required` 字段。

### confirm

```ts
async function confirm(text: string): Promise<boolean>
```

显示包含给定消息的 `ConfirmDialog`。点击 "Yes" 返回 `true`，否则返回 `false`。

### alert

```ts
async function alert(text: string): Promise<string>
```

显示包含给定消息的 `InfoDialog`。关闭时以操作字符串 resolve。

## 接口

### Field

```ts
interface Field {
  type: 'text' | 'checkbox' | 'user' | 'userId' | 'username' | 'domain';
  options?: string[] | Record<string, string>;
  placeholder?: string;
  label?: string;
  autofocus?: boolean;
  required?: boolean;
  default?: string;
  columns?: number;  // 网格列宽；负值触发换行
}
```

描述 `prompt()` 的单个表单字段。`type` 同时决定 UI 控件和结果对象中的返回类型：

| type | 控件 | 结果类型 |
|------|--------|-------------|
| `'text'` | 文本输入 / 下拉选择（有 `options` 时） | `string` |
| `'checkbox'` | 复选框 | `boolean` |
| `'user'` | 用户自动补全 | `any`（用户对象） |
| `'userId'` | 用户自动补全 | `number` |
| `'username'` | 用户自动补全 | `string` |
| `'domain'` | 域自动补全 | `string` |

### DialogOptions

```ts
interface DialogOptions {
  classes: string;
  $body: HTMLElement | JQuery<HTMLElement> | string;
  $action: any;
  width?: string;
  height?: string;
  cancelByClickingBack?: boolean;
  cancelByEsc?: boolean;
  canCancel?: boolean;
  onDispatch?: (data: any) => any;
}
```

所有对话框类的配置。`onDispatch` 返回 `false` 可阻止对话框关闭。
