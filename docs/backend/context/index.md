---
title: Context 与 Service
description: 构成 Hydro 可扩展性基础的核心插件系统类
source: packages/hydrooj/src/context.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/context.ts
import: "import { Context, Service, Fiber, FiberState } from 'hydrooj'"
---
# Context 与 Service

构成 Hydro 可扩展性基础的核心插件系统类。基类来自 `cordis`。

```ts
import { Context, Service, Fiber, FiberState } from 'hydrooj';
```

## Context

每个插件可访问的核心对象。提供事件订阅、服务注入、路由注册和生命周期管理功能。

`Context` 继承自 `cordis.Context`，通过 `ApiMixin` 服务添加了 Hydro 特有的方法。`WebService` 还混入了 `Route`、`Connection` 和 `withHandlerClass`。

### 路由方法

由 `WebService` 混入，用于注册 HTTP 和 WebSocket 处理器。

| 方法 | 说明 |
|------|------|
| `Route(name, path, Handler, ...permPrivChecker)` | 注册 HTTP 路由；绑定 `name`、`path` 和 `Handler` 类，可附加权限/特权守卫。 |
| `Connection(name, path, Handler, ...permPrivChecker)` | 注册 WebSocket 连接端点；签名与 `Route` 相同，但用于持久连接。 |

### 事件方法

继承自 `cordis.Context`。Hydro 定义了自己的 `EventMap`（参见 `Events`），包含领域相关事件。

| 方法 | 说明 |
|------|------|
| `on(event, callback)` | 订阅事件；返回一个 `Disposable`，调用即可移除监听器。 |
| `emit(event, ...args)` | 同步触发事件，通知所有已注册的监听器。 |
| `parallel(event, ...args)` | 触发事件并并发运行所有监听器；返回 `Promise`，在所有监听器完成后 resolve。 |
| `broadcast(event, ...args)` | 跨所有集群进程广播事件（PM2 或 MongoDB 总线）；在每个节点上调用 `parallel`。 |

### 生命周期与插件方法

继承自 `cordis.Context`，用于管理插件和副作用。

| 方法 | 说明 |
|------|------|
| `plugin(Plugin, config?)` | 在当前上下文注册并初始化插件（类或函数）；返回 `Fiber`。 |
| `effect(() => Disposable)` | 注册副作用；返回的清理函数在上下文销毁时调用。 |
| `mixin(serviceId, methods)` | 将服务实例上的命名方法混入上下文原型，使其可通过 `ctx.method()` 调用。 |
| `inject` | 在插件/服务类上声明服务依赖（静态 `inject` 数组）。 |

### Hydro 特有方法

由 `ApiMixin` 添加 —— 可作为每个上下文实例的直接方法调用。

| 方法 | 说明 |
|------|------|
| `addScript(name, description, schema, run)` | 注册一个具名管理脚本，包含输入验证和异步执行函数。 |
| `provideModule(type, id, module)` | 注册一个可插拔模块（如 `'hash'`、`'problemSearch'`）到全局模块注册表。 |
| `injectUI(node, name, args?, ...permPrivChecker)` | 将 UI 组件注入到前端插槽（`Nav`、`ProblemAdd`、`ControlPanel` 等），可附加权限守卫。 |
| `setImmediate(callback)` | 在下一个事件循环 tick 调度回调；上下文销毁时自动清理。 |

### Context 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `loader` | `Loader` | 管理插件生命周期和热重载的插件加载器服务。 |
| `check` | `CheckService` | 用于健康监测的检查/ping 服务。 |
| `domain` | `DomainDoc?` | 当前域文档（在域作用域的上下文中可用）。 |
| `geoip` | `GeoIP?` | GeoIP 解析服务（可选，可能未加载）。 |

---

## Service

所有 Hydro 服务的抽象基类。继承 `cordis.Service<T, Context>`。

```ts
import { Service } from 'hydrooj';

export default class MyService extends Service {
    static inject = ['database'];  // 声明依赖

    constructor(ctx: Context) {
        super(ctx, 'myService');
    }
}
```

服务通过 `ctx.plugin(MyService)` 注册，以其服务 ID 在上下文中可用。其他插件通过静态 `inject` 数组声明依赖。

---

## 类型

`Fiber` 和 `FiberState` 从 `hydrooj` 重新导出（源自 `cordis`，适配 Hydro 的 `Context`）。`Disposable` 和 `Plugin` 为 `cordis` 内部类型，供参考。

| 类型 | 说明 |
|------|------|
| `Fiber` | `cordis.Fiber<Context>` —— 表示插件在上下文树中的生命周期节点；追踪状态（pending、loading、active、disposed）。 |
| `FiberState` | Fiber 生命周期状态枚举：`PENDING`、`LOADING`、`ACTIVE`、`DISPOSED` 等。 |
| `Disposable` | `() => void` —— 由 `on()`、`effect()` 等注册方法返回的清理函数（`cordis` 类型，需从 `cordis` 直接导入）。 |
| `Plugin` | 插件定义的类型别名 —— 可以是继承 `Service` 的类或 `(ctx, config) => void` 函数（`cordis` 类型，需从 `cordis` 直接导入）。 |
