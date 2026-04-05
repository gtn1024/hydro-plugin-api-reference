# Handler, ConnectionHandler & requireSudo

服务端处理类及用于请求处理的 sudo 装饰器。

> **源码**: [`packages/hydrooj/src/service/server.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/service/server.ts)
>
> **导出**: `import { Handler, ConnectionHandler, requireSudo } from 'hydrooj';`

---

## 类

### `Handler`

HTTP 请求处理类，继承自 `@hydrooj/framework` 的 `HandlerOriginal<Context>`。新增 `domain` 属性，并继承框架的全部 handler 工具方法（`request`、`response`、`args`、`user`、`checkPerm`、`checkPriv`、`url`、`renderHTML` 等）。这是所有 Hydro HTTP 路由处理器的基类。

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `domain` | `DomainDoc` | 当前域文档，在 handler 创建时注入 |

```typescript
import { Handler } from 'hydrooj';

class MyHandler extends Handler {
  async get() {
    const { domain, user } = this;
    // domain._id, domain.host, etc.
  }
}
```

### `ConnectionHandler`

WebSocket 连接处理类，继承自 `@hydrooj/framework` 的 `ConnectionHandlerOriginal<Context>`。新增 `domain` 属性，并继承框架的 WebSocket 工具方法（`send`、`close` 等）。这是所有 Hydro WebSocket 连接处理器的基类。

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `domain` | `DomainDoc` | 当前域文档，在 handler 创建时注入 |

```typescript
import { ConnectionHandler } from 'hydrooj';

class MyConnection extends ConnectionHandler {
  async prepare() {
    this.send({ type: 'welcome', domain: this.domain._id });
  }
}
```

---

## 装饰器

### `requireSudo`

方法装饰器，在执行被装饰的处理方法前强制要求 sudo（重新认证）权限。若用户拥有有效的 sudo 会话（最近一小时内），则正常执行原方法；否则重定向至 sudo 确认页面。

**行为**：
- 检查 `session.sudo` 时间戳 —— 有效期为 1 小时
- sudo 有效时：恢复已保存的 `referer` 请求头，继续执行原方法
- sudo 缺失或过期时：将请求上下文保存至 `session.sudoArgs`，重定向至 `user_sudo` 页面

```typescript
import { Handler, requireSudo } from 'hydrooj';

class AdminHandler extends Handler {
  @requireSudo
  async post() {
    // 此处理器要求用户在过去一小时内
    // 通过 sudo 确认页面完成重新认证
  }
}
```

---

## 备注

- `Handler` 和 `ConnectionHandler` 均为框架类的重新导出，使用 Hydro 的 `Context` 类型参数并新增了 `domain` 属性。`domain` 通过 `handler/create` 生命周期钩子注入。
- 额外的 handler 混入方法（`paginate`、`limitRate`、`checkPerm`、`checkPriv`、`progress`、`renderTitle`、`url`、`translate`）在服务启动时通过 `server.handlerMixin()` 注册 —— 参见 `@hydrooj/framework` 的 `HandlerCommon` 基础接口。
- `requireSudo` 专为安全敏感操作设计，防止在共享计算机上利用记住的密码进行误操作。
