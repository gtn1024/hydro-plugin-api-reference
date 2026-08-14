---
title: 前端插件系统核心
description: 前端插件系统基于 Cordis 的核心类型和全局上下文实例
source: packages/ui-default/context.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/context.ts
import: "import { Context, ctx, Service } from '@hydrooj/ui-default'"
---
# 前端插件系统核心

源码: [`packages/ui-default/context.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/context.ts)、[`packages/ui-default/api.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/api.ts)

前端插件系统基于 [Cordis](https://github.com/shigma/cordis)，与 Hydro 后端使用的插件框架相同。本页文档化前端插件可用的核心类型和全局上下文实例。

## 导出

### Context

```ts
export { Context } from 'cordis'
```

核心插件上下文。前端插件接收一个 `Context` 实例用于注册生命周期钩子、服务和事件监听器。`Context` 即 `cordis.Context` 本体 —— `context.ts` 直接 re-export，未添加额外方法，所有功能来自 Cordis 基类。

### ctx

```ts
const ctx: Context
```

全局前端插件上下文单例。在模块加载时以 `new Context()` 创建。导入并使用它来在前端注册插件、监听事件和访问服务。

用法示例：
```ts
import { ctx } from '@hydrooj/ui-default';

ctx.on('some-event', (payload) => { /* handle */ });
```

### Service

```ts
abstract class Service<out T = never, out C extends Context = Context>
```

前端服务的基类，从 `cordis` 直接 re-export，未添加额外方法。插件通过继承 `Service` 来提供可通过 Cordis 依赖注入使用的可复用功能。泛型参数 `T` 为服务的配置类型（默认 `never`），`C` 为上下文类型（默认 `Context`）。

### EventMap

```ts
interface EventMap { }
```

空接口，作为前端事件类型声明的扩展点。插件可通过 TypeScript 声明合并添加自定义事件签名：

```ts
declare module '@hydrooj/ui-default' {
  interface EventMap {
    'my-plugin/event': (data: MyData) => void
  }
}
```

### Events

```ts
declare module 'cordis' {
  export interface Events extends EventMap { }
}
```

`Events` 并非 `@hydrooj/ui-default` 的导出，而是 `context.ts` 中通过 `declare module 'cordis'` 声明合并将前端 `EventMap` 并入 Cordis 的 `Events` 接口（无泛型参数）。合并后，Cordis 内置事件与前端插件通过 `EventMap` 添加的自定义事件在事件系统中共用同一类型，可通过 `Context[typeof Context.events]` 访问。

### Fiber

```ts
class Fiber<out C extends Context = Context>
```

从 `cordis` 直接 re-export 的泛型类。表示插件在上下文树中的生命周期作用域，泛型参数 `C` 为上下文类型（默认 `Context`）。

> 注：`Fiber` 未从 `@hydrooj/ui-default` 顶层导出，需从 `@hydrooj/ui-default/context` 内部路径或 `cordis` 直接导入。

### Disposable

```ts
type Disposable = cordis.Disposable
```

从 Cordis 重新导出。由注册方法（如 `ctx.on()`、`ctx.effect()`）返回的清理函数。调用它可移除已注册的资源。

> 注：`Disposable` 未从 `@hydrooj/ui-default` 顶层导出，需从 `@hydrooj/ui-default/context` 内部路径或 `cordis` 直接导入。

### FiberState

```ts
const enum FiberState {
  PENDING, LOADING, ACTIVE, FAILED, DISPOSED, UNLOADING
}
```

从 `cordis` 直接 re-export 的 `const enum`。表示 Fiber 的生命周期状态，成员为 `PENDING`、`LOADING`、`ACTIVE`、`FAILED`、`DISPOSED`、`UNLOADING`。

> 注：`FiberState` 未从 `@hydrooj/ui-default` 顶层导出，需从 `@hydrooj/ui-default/context` 内部路径或 `cordis` 直接导入。

### Plugin

```ts
type Plugin = cordis.Plugin
```

从 Cordis 重新导出。使用 `ctx.plugin()` 定义和注册插件时的插件描述符类型。

> 注：`Plugin` 未从 `@hydrooj/ui-default` 顶层导出，需从 `@hydrooj/ui-default/context` 内部路径或 `cordis` 直接导入。

## 架构说明

- `context.ts` 直接 re-export cordis 的 `Context`/`Service`/`Fiber`/`FiberState`/`Disposable`/`Plugin`，声明 `Events` 合并，并创建 `ctx` 单例。所有实际的插件功能（生命周期钩子、依赖注入、事件系统）来自 Cordis 基类。
- `api.ts` 从 `context.ts` 重新导出 `Context`、`ctx` 和 `Service`，使其作为 `@hydrooj/ui-default` 公开 API 的一部分可用。
- `EventMap` 在 `api.ts` 中声明为空，设计为通过 TypeScript 声明合并由插件扩展。
- 前端 `Context` 与后端 `Context` 是独立的实例 —— 它们共享相同的 Cordis 架构，但运行在不同环境中（浏览器 vs Node.js）。
