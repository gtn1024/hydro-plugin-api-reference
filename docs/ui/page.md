---
title: 前端页面注册系统
description: 页面注册系统，组织每个页面的初始化逻辑和生命周期回调
source: packages/ui-default/misc/Page.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/misc/Page.ts
---
# 前端页面注册系统

源码：[`packages/ui-default/misc/Page.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/misc/Page.ts)、[`packages/ui-default/api.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/api.ts)

Hydro 前端使用页面注册系统来组织每个页面的初始化逻辑。插件通过 `addPage()` 注册页面实例，页面加载器在页面切换时适时调用生命周期回调（`beforeLoading`、`afterLoading`）。

## 类

### Page

```ts
class Page {
  name: string | string[];
  moduleName?: string;
  autoload: boolean;        // Page 中始终为 false
  afterLoading?: Callback;
  beforeLoading?: Callback;

  constructor(pagename: string | string[], afterLoading?: Callback, beforeLoading?: Callback);
  constructor(pagename: string | string[], moduleName: string, afterLoading?: Callback, beforeLoading?: Callback);

  isNameMatch(name: string): boolean;
}
```

所有页面注册的基类。匹配特定路由名称并提供生命周期钩子。

**构造函数参数（重载）：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `pagename` | `string \| string[]` | 要匹配的页面路由名称。对应 `<html>` 上的 `data-page` 属性。 |
| `moduleName` | `string` | *（可选）* 当第二个参数为字符串类型时提供，用作 `PageLoader.getPage()` 的模块名标识符。 |
| `afterLoading` | `Callback` | 页面 DOM 加载完成后调用。 |
| `beforeLoading` | `Callback` | 页面 DOM 加载前调用。 |

构造函数会检测第二个参数是字符串（`moduleName`）还是函数（`afterLoading`），并据此解构。

**回调类型：**

```ts
type Callback = (pagename: string, loadPage: (name: string) => Promise<any>) => any;
```

- `pagename` — 当前页面的路由名称。
- `loadPage` — 按模块名动态加载另一个已注册页面的函数，支持嵌套页面加载（深度限制为 32，防止无限递归）。

**属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string \| string[]` | *（构造函数）* | 此页面匹配的路由名称。 |
| `moduleName` | `string \| undefined` | `undefined` | 可选模块名，用于通过 `PageLoader.getPage()` 查找。 |
| `autoload` | `boolean` | `false` | 此页面的钩子是否在每条路由上运行。 |
| `afterLoading` | `Callback \| undefined` | `undefined` | 加载后生命周期钩子。 |
| `beforeLoading` | `Callback \| undefined` | `undefined` | 加载前生命周期钩子。 |

**方法：**

| 方法 | 签名 | 说明 |
|------|------|------|
| `isNameMatch` | `(name: string) => boolean` | 测试给定路由名称是否匹配此页面。字符串名称时检查严格相等；数组名称时检查包含关系。 |

### NamedPage

```ts
class NamedPage extends Page { }
```

`Page` 的空子类，无额外行为。语义上用于表示该页面是路由特定的（非自动加载）。`autoload` 始终为 `false`。

这是最常用的类 — Hydro 中大多数页面注册为 `new NamedPage(...)`。

### AutoloadPage

```ts
class AutoloadPage extends Page {
  constructor(pagename: string | string[], afterLoading?: Callback, beforeLoading?: Callback);
  constructor(pagename: string | string[], moduleName: string, afterLoading?: Callback, beforeLoading?: Callback);
}
```

继承 `Page` 并在构造函数中设置 `autoload = true`。自动加载页面的生命周期钩子在**每次**路由变更时都会调用，无论路由名称是否匹配。适用于全局页面增强（如通知、提示框、键盘快捷键）。

## 函数

### addPage

```ts
function addPage(page: Page | (() => Promise<void> | void)): void
```

向页面加载器注册页面实例或初始化函数。

- **`page: Page`** — `Page`、`NamedPage` 或 `AutoloadPage` 实例。将被 `PageLoader` 收集并与路由匹配。
- **`page: () => Promise<void> | void`** — 纯函数。在 `PageLoader` 构造时立即调用（处理完所有 `Page` 实例之后）。用于不需要路由匹配的副作用初始化。

页面存储在 `window.Hydro.extraPages` 中。`PageLoader` 构造函数将内置页面（来自 `pages/` 和 `components/` 目录）与额外页面合并，过滤出有效的 `Page` 实例，并直接调用纯函数。

## 生命周期

页面加载器在 `initPageLoader()` 期间按特定顺序运行生命周期回调：

```
1. 自动加载页面 — beforeLoading   （所有自动加载页面，按注册顺序）
2. 命名页面     — beforeLoading   （匹配当前路由的页面）
3. 自动加载页面 — afterLoading    （所有自动加载页面，按注册顺序）
4. 命名页面     — afterLoading     （匹配当前路由的页面）
```

### beforeLoading

```ts
beforeLoading?: (pagename: string, loadPage: (name: string) => Promise<any>) => any
```

在页面 DOM 内容处理**之前**调用。适用于：
- 设置全局事件监听器
- 渲染前修改 DOM
- 加载外部资源

### afterLoading

```ts
afterLoading?: (pagename: string, loadPage: (name: string) => Promise<any>) => any
```

在页面 DOM 内容可用**之后**调用。适用于：
- 为 DOM 元素绑定事件处理器
- 初始化 UI 组件
- 获取数据并更新页面

### 嵌套加载

传递给回调的 `loadPage` 参数支持递归页面加载：

```ts
new NamedPage('problem_edit', async (pagename, loadPage) => {
  // 按模块名加载另一个页面的钩子
  await loadPage('editor');
}, async (pagename, loadPage) => {
  await loadPage('editor');
});
```

深度上限为 32，防止无限递归。

## 用法示例

### 带生命周期钩子的 NamedPage

```ts
import { NamedPage } from '@hydrooj/ui-default';

export default new NamedPage('user_detail', async (pagename, loadPage) => {
  // beforeLoading — 准备数据
  console.log('Loading user page...');
}, async (pagename, loadPage) => {
  // afterLoading — 绑定 DOM
  document.querySelector('.avatar')?.addEventListener('click', handleAvatarClick);
});
```

### 匹配多个路由的 NamedPage

```ts
new NamedPage(['contest_detail', 'contest_scoreboard'], () => {
  // contest_detail 和 contest_scoreboard 页面的 beforeLoading
}, () => {
  // 两个页面的 afterLoading
});
```

### 用于全局行为的 AutoloadPage

```ts
import { AutoloadPage } from '@hydrooj/ui-default';

export default new AutoloadPage('tooltips', () => {
  // 在每个页面上运行 — 初始化提示框库
}, () => {
  // DOM 就绪后绑定提示框元素
});
```

### 通过 addPage 注册

```ts
import { addPage, AutoloadPage } from '@hydrooj/ui-default';

addPage(new AutoloadPage('my-plugin-init', () => {
  // beforeLoading — 在每个页面上运行
}, () => {
  // afterLoading — 在每个页面上运行
}));

// 或者注册一个纯初始化函数
addPage(() => {
  console.log('Plugin initialized');
});
```
