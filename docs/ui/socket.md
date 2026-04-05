---
title: Socket (Sock)
description: 支持自动重连、心跳及可选 Shorty 压缩的 WebSocket 客户端
source: packages/ui-default/components/socket/index.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/socket/index.ts
---
# Socket (Sock)

源码：[`packages/ui-default/components/socket/index.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/socket/index.ts)

支持自动重连、心跳及可选 Shorty 压缩的 WebSocket 客户端。

---

## Sock

```ts
class Sock
```

封装 `ReconnectingWebSocket`，提供 ping/pong 心跳、Shorty 解压及基于会话的认证。

### 构造函数

**`new Sock(url: string, nocookie?: boolean, shorty?: boolean)`**

创建到 `url` 的 WebSocket 连接。URL 协议会自动从 `http`/`https` 转换为 `ws`/`wss`。如果目标主机与当前页面不同且存在 `sid` cookie，则会将会话 ID 作为查询参数附加（除非 `nocookie` 为 `true`）。如果 `shorty` 为 `true`，则发送 `shorty=on` 查询参数以请求压缩消息。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | — | WebSocket 端点 URL（http/https 协议自动转换为 ws/wss） |
| `nocookie` | `boolean` | `false` | 跳过向跨域主机自动转发会话 ID |
| `shorty` | `boolean` | `false` | 请求服务器发送 Shorty 压缩消息 |

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 解析后的 WebSocket URL（公开属性，通过构造函数设置） |
| `sock` | `ReconnectingWebSocket` | 底层 WebSocket 实例（自动重连，最大重试 100 次，最大延迟 10s） |
| `interval` | `NodeJS.Timeout` | 心跳定时器句柄（连接期间每 30s 发送 `"ping"`） |

### 事件回调

可赋值的函数属性 — 直接设置或通过 `on()` 设置。

| 回调 | 签名 | 说明 |
|------|------|------|
| `onopen` | `(sock: ReconnectingWebSocket) => void` | 连接建立时触发。 |
| `onclose` | `(code: number, reason: string) => void` | 连接关闭时触发。code >= 4000 会触发自动 `close()`。 |
| `onmessage` | `(message: MessageEvent, data: string) => void` | 应用层消息到达时触发（ping/pong/shorty 握手已过滤）。 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `on` | `(event: 'message' \| 'close' \| 'open', callback: (...args: any[]) => void) => void` | 注册事件回调（设置 `onmessage`、`onclose` 或 `onopen`）。 |
| `send` | `(data: any) => void` | 通过 WebSocket 发送数据。 |
| `close` | `() => void` | 关闭连接（可安全多次调用）。 |

### 内部消息处理

底层 socket 的 `onmessage` 处理器在分发给用户回调之前会处理多种协议级消息：

| 收到的消息 | 行为 |
|------------|------|
| `"pong"` | 静默消费（心跳响应）。 |
| `"ping"` | 回复 `"pong"`（服务端发起的心跳）。 |
| `"shorty"` | 为后续消息启用 Shorty 解压。 |
| `PermissionError` / `PrivilegeError` JSON | 调用 `close()` — 认证错误时终止连接。 |
| 其他所有消息 | 若 Shorty 已激活，先解压再解析为 JSON；分发给 `this.onmessage`。 |
