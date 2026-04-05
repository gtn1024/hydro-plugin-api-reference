---
title: OauthModel
description: OAuth 提供商与账号关联模型，用于注册第三方登录和管理平台到用户映射
source: packages/hydrooj/src/model/oauth.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/oauth.ts
---
# OauthModel

OAuth 提供商与账号关联模型，用于注册第三方登录提供商、查找关联账号以及管理平台到用户的映射。

> **源码**: [`packages/hydrooj/src/model/oauth.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/oauth.ts)
>
> **导出**: `import { OauthModel } from 'hydrooj';`
> **访问**: `ctx.oauth`（服务实例，非静态类）

与大多数模型不同，`OauthModel` 继承自 `Service`，通过 `ctx.oauth` 访问而非使用静态方法。

---

## 类型导出

### `OauthMap`

```typescript
interface OauthMap {
    platform: string;  // OAuth 平台名称（如 'github'、'google'、'mail'）
    id: string;        // 来自提供商的 openId
    uid: number;       // 目标 Hydro 用户 ID
}
```

### `OAuthProvider`

```typescript
interface OAuthProvider {
    text: string;              // 显示标签
    name: string;              // 提供商标识符
    icon?: string;             // 图标 URL 或标识符
    hidden?: boolean;          // 若为 true，不在登录界面显示
    get: (this: Handler) => Promise<void>;                         // 发起 OAuth 流程
    callback: (this: Handler, args: Record<string, any>) => Promise<OAuthUserResponse>;  // 处理 OAuth 回调
    canRegister?: boolean;     // 该提供商是否允许新用户注册
    lockUsername?: boolean;    // 关联后用户名是否锁定
}
```

### `OAuthUserResponse`

```typescript
interface OAuthUserResponse {
    _id: string;                           // 外部用户 ID
    email: string;                         // 用户邮箱
    avatar?: string;                       // 头像 URL
    bio?: string;                          // 用户简介
    uname?: string[];                      // 用户名候选列表
    viewLang?: string;                     // 首选语言
    set?: Record<string, any>;             // 需设置到用户文档的字段
    setInDomain?: Record<string, any>;     // 需设置到域用户文档的字段
}
```

---

## 方法

### 查找

#### `get(platform: string, id: string): Promise<number | null>`

查找与平台+openId 对关联的 Hydro 用户 ID。返回关联的 `uid`，若无映射则返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `platform` | `string` | — | OAuth 平台名称（如 `'github'`） |
| `id` | `string` | — | 来自提供商的 openId |
| **返回值** | `Promise<number \| null>` | | 关联的用户 UID，或 `null` |

### 账号关联

#### `set(platform: string, id: string, uid: number): Promise<number>`

创建或更新 OAuth 账号映射。使用 upsert 操作。返回 upsert 文档的 `uid`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `platform` | `string` | — | OAuth 平台名称 |
| `id` | `string` | — | 来自提供商的 openId |
| `uid` | `number` | — | Hydro 用户 UID |
| **返回值** | `Promise<number>` | | 关联的用户 UID |

#### `unbind(platform: string, uid: number): Promise<void>`

按平台和用户 ID 移除 OAuth 账号映射。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `platform` | `string` | — | OAuth 平台名称 |
| `uid` | `number` | — | Hydro 用户 UID |
| **返回值** | `Promise<void>` | | |

#### `list(uid: number): Promise<OauthMap[]>`

列出用户的所有 OAuth 账号映射。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | Hydro 用户 UID |
| **返回值** | `Promise<OauthMap[]>` | | |

### 提供商注册

#### `provide(name: string, provider: OAuthProvider): Promise<void>`

注册一个 OAuth 提供商。若同名提供商已存在则抛出异常。当服务上下文销毁时，提供商会自动清理。使用 `ctx.effect()` 注册并附带清理逻辑——上下文销毁时自动移除提供商。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | — | 提供商标识符 |
| `provider` | `OAuthProvider` | — | 提供商配置对象 |
| **返回值** | `Promise<void>` | | |

```typescript
// 注册自定义 OAuth 提供商
ctx.oauth.provide('github', {
    text: 'GitHub',
    name: 'github',
    icon: 'github',
    async get() { /* 重定向到 GitHub OAuth */ },
    async callback(args) {
        // 用 code 换取用户信息
        return { _id: '...', email: '...', uname: ['...'] };
    },
});

// 查找关联用户
const uid = await ctx.oauth.get('github', openId);

// 关联账号
await ctx.oauth.set('github', openId, uid);

// 列出用户的关联账号
const links = await ctx.oauth.list(uid);

// 解除关联
await ctx.oauth.unbind('github', uid);
```

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<OauthMap>` | MongoDB `oauth` 集合 |
| `providers` | `Record<string, OAuthProvider>` | 已注册的 OAuth 提供商，按名称索引 |

---

## 备注

- **索引**：在启动时通过 `[Context.init]` 创建——`{ platform: 1, id: 1 }`（唯一索引，每个 platform+openId 仅一条映射）、`{ uid: 1, platform: 1 }`（列出用户的关联账号）。
