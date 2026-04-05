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
class Context extends cordis.Context { }
```

核心插件上下文。前端插件接收一个 `Context` 实例用于注册生命周期钩子、服务和事件监听器。继承自 `cordis.Context`，未添加额外方法 —— 所有功能来自 Cordis 基类。

上下文有一个 `broadcast` 属性别名指向 `emit`，为广播事件到所有监听器提供了语义化的简写。

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
class Service<C extends Context = Context> extends cordis.Service<C> { }
```

前端服务的基类。继承自 `cordis.Service`，未添加额外方法。插件通过子类化 `Service` 来提供可通过 Cordis 依赖注入使用的可复用功能。

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
interface Events<C extends Context = Context> extends cordis.Events<C>, EventMap { }
```

组合事件接口，合并了 Cordis 内置事件与 Hydro 前端 `EventMap`。可通过 `Context[Context.events]` 访问。

### Fiber

```ts
type Fiber = cordis.Fiber<Context>
```

以 Hydro 的 `Context` 参数化的 Cordis Fiber 类型别名。表示插件在上下文树中的生命周期作用域。

### Disposable

```ts
type Disposable = cordis.Disposable
```

从 Cordis 重新导出。由注册方法（如 `ctx.on()`、`ctx.effect()`）返回的清理函数。调用它可移除已注册的资源。

### FiberState

```ts
type FiberState = cordis.FiberState
```

从 Cordis 重新导出。表示 Fiber 的生命周期状态（如 `active`、`disposed`）。

### Plugin

```ts
type Plugin = cordis.Plugin
```

从 Cordis 重新导出。使用 `ctx.plugin()` 定义和注册插件时的插件描述符类型。

## 架构说明

- `context.ts` 定义了 Cordis 基础原语的 Hydro 特定子类/包装器，而所有实际的插件功能（生命周期钩子、依赖注入、事件系统）来自 Cordis 基类。
- `api.ts` 从 `context.ts` 重新导出 `Context`、`ctx` 和 `Service`，使其作为 `@hydrooj/ui-default` 公开 API 的一部分可用。
- `EventMap` 在 `api.ts` 中声明为空，设计为通过 TypeScript 声明合并由插件扩展。
- 前端 `Context` 与后端 `Context` 是独立的实例 —— 它们共享相同的 Cordis 架构，但运行在不同环境中（浏览器 vs Node.js）。
