# @hydrooj/framework 重新导出

通过 `hydrooj` 从 `@hydrooj/framework` 重新导出的核心 Web 框架接口。

> **源码**: [`packages/hydrooj/src/plugin-api.ts:8-11`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/plugin-api.ts#L8-L11)

## 概述

这些符号是 Hydro 插件中定义路由、处理器和 API 操作的基础构建块。

```ts
import {
    Apis, APIS, HandlerCommon, httpServer,
    Mutation, Query, Router, Subscription, WebService,
} from 'hydrooj';
```

## API 定义辅助工具

| 导出 | 类型 | 说明 |
|------|------|------|
| `Query` | Function | 定义只读 API 操作；返回 `ApiCall<'Query', Arg, Res>`。 |
| `Mutation` | Function | 定义写入 API 操作；返回 `ApiCall<'Mutation', Arg, Res>`。 |
| `Subscription` | Function | 定义实时事件流 API 操作；返回带 `emit` 回调的 `ApiCall<'Subscription', Arg, Res>`。 |

## API 注册表

| 导出 | 类型 | 说明 |
|------|------|------|
| `Apis` | Interface | 描述所有已注册 API 操作按命名空间组织的类型化形状的 TypeScript 接口。 |
| `APIS` | Object | 运行时字典，持有所有已注册的 API 调用定义。插件通过 `ApiService.provide()` 将其 API 注册到此对象。 |

## 处理器

| 导出 | 类型 | 说明 |
|------|------|------|
| `HandlerCommon` | Class | HTTP 和 WebSocket 处理器的基类；提供 `request`、`response`、`args`、`user` 及工具方法如 `checkPerm()`、`checkPriv()`、`url()`、`renderHTML()`。 |

## 路由与服务器

| 导出 | 类型 | 说明 |
|------|------|------|
| `Router` | Class | 扩展的 Koa Router（`@koa/router`），支持 WebSocket（`ws()` 方法）和可释放的路由注册。 |
| `httpServer` | `http.Server` | 底层 Node.js `http.Server` 实例。 |
| `WebService` | Class | 核心 Web 服务器服务（继承 cordis `Service`）；管理路由/连接注册（`ctx.Route()`、`ctx.Connection()`）、中间件层、处理器混入和模板渲染器。 |
