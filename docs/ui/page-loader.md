---
title: initPageLoader
description: 前端页面加载器初始化函数
source: packages/ui-default/hydro.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/hydro.ts
---
# initPageLoader

源码：[`packages/ui-default/hydro.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/hydro.ts)，从 [`packages/ui-default/api.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/api.ts) 重新导出

## 函数

### initPageLoader

```ts
async function initPageLoader(): Promise<void>
```

初始化前端页面加载器：创建 `PageLoader`，从 `data-page` 属性解析当前页面名称，构建生命周期回调序列（autoload beforeLoading → 命名 beforeLoading → autoload afterLoading → 命名 afterLoading），并按顺序执行每个回调。完成后隐藏页面加载遮罩层，触发区块动画，并触发 `vjPageFullyInitialized` DOM 事件。

**行为细节：**

- **页面解析** — 读取 `document.documentElement.getAttribute('data-page')` 确定当前路由名称。
- **回调序列** — 调用 `buildSequence()` 收集具有匹配 `beforeLoading`/`afterLoading` 钩子的页面，然后按以下顺序迭代：autoload before → 命名 before → autoload after → 命名 after。
- **嵌套加载** — 每个回调接收一个 `loadPage(depth, type)` 函数，可以按模块名递归调用另一个页面的生命周期钩子，深度上限为 32。
- **错误处理** — 单个回调失败会被捕获，通过 `window.captureException?.(e)`（Sentry）报告，并以 `Notification.warn()` 通知；继续执行剩余回调。
- **性能日志** — 开发模式下，耗时 >16ms 的回调会被记录；生产环境下仅记录 >256ms 的回调。
- **加载后处理** — 所有回调完成后：隐藏 `.page-loader`，运行区块淡入动画，在 `.section` 元素上触发 `vjLayout` 事件，并在 `$(document)` 上触发 `vjPageFullyInitialized`。

## 内部辅助函数

以下函数未导出，但被 `initPageLoader` 引用：

### buildSequence

```ts
function buildSequence(pages: Page[], type: 'before' | 'after'): Array<{ page: Page; func: Callback; type: string }>
```

过滤具有 `beforeLoading` 或 `afterLoading` 钩子的页面，返回 `{ page, func, type }` 对象数组用于顺序执行。

### PageLoader (类)

源码：[`packages/ui-default/misc/PageLoader.js`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/misc/PageLoader.js)

```ts
class PageLoader {
  pageInstances: Page[]

  constructor()
  getAutoloadPages(): Page[]
  getNamedPage(pageName: string): Page[]
  getPage(moduleName: string): Page[]
}
```

收集所有已注册页面（通过 `require.context` 从 `pages/` 和 `components/` 目录加载的内置页面，加上 `window.Hydro.extraPages`），过滤出有效的 `Page` 实例，并立即调用纯函数入口。

| 方法 | 说明 |
|------|------|
| `getAutoloadPages()` | 返回所有 `autoload = true` 的页面实例。 |
| `getNamedPage(pageName)` | 通过 `isNameMatch()` 返回名称匹配给定路由名称的页面实例。 |
| `getPage(moduleName)` | 返回匹配给定 `moduleName` 属性的页面实例。 |

## 另见

- [页面注册系统](./page.md) — `Page`、`NamedPage`、`AutoloadPage`、`addPage()`
