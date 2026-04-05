---
title: TokenModel
description: 令牌管理模型，用于创建、查询、更新和删除各种令牌类型
source: packages/hydrooj/src/model/token.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/token.ts
import: "import { TokenModel } from 'hydrooj'"
---
# TokenModel

令牌管理模型，用于创建、查询、更新和删除各种令牌类型（会话、注册、密码重置、OAuth 等）。

`TokenModel` 是一个纯静态类。所有方法直接在类上调用（如 `TokenModel.add(...)`）。

---

## 类型导出

### `TokenDoc`

定义在 `packages/hydrooj/src/interface.ts` 中：

```typescript
interface TokenDoc {
    _id: string;
    tokenType: number;
    createAt: Date;
    updateAt: Date;
    expireAt: Date;
    [key: string]: any;
}
```

索引签名允许根据令牌类型携带任意数据字段（如 `uid`、`email`、`challenge`）。

---

## 常量

### 令牌类型

| 常量 | 值 | 标签 | 说明 |
|------|-----|------|------|
| `TYPE_SESSION` | `0` | Session | 浏览器会话令牌 |
| `TYPE_REGISTRATION` | `2` | Registration | 邮箱注册验证码 |
| `TYPE_CHANGEMAIL` | `3` | Change Email | 邮箱变更验证码 |
| `TYPE_OAUTH` | `4` | OAuth | OAuth 提供商令牌 |
| `TYPE_LOSTPASS` | `5` | Lost Password | 密码重置验证码 |
| `TYPE_EXPORT` | `6` | Export | 数据导出任务令牌 |
| `TYPE_IMPORT` | `7` | Import | 数据导入任务令牌 |
| `TYPE_WEBAUTHN` | `8` | WebAuthn | WebAuthn 挑战令牌 |

`TYPE_TEXTS` 将每个类型编号映射为可读标签。

---

## 方法

### 增删改查

#### `add(tokenType: number, expireSeconds: number, data: any, id?: string): Promise<[string, TokenDoc]>`

创建一条新令牌记录，ID 可自动生成或自定义。自动设置 `createAt`、`updateAt` 和 `expireAt`（now + `expireSeconds`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tokenType` | `number` | — | 令牌类型常量（如 `TYPE_SESSION`） |
| `expireSeconds` | `number` | — | 令牌有效时长（秒） |
| `data` | `any` | — | 令牌附加数据（如 `uid`、`email`） |
| `id` | `string` | `randomstring(32)` | 自定义令牌 ID |
| **返回值** | `Promise<[string, TokenDoc]>` | | `[tokenId, tokenDoc]` 元组 |

```typescript
// 创建注册验证令牌
const [tokenId, tokenDoc] = await TokenModel.add(
  TokenModel.TYPE_REGISTRATION,
  3600,           // 1 小时有效
  { email: 'user@example.com', uid: 12345 },
);
```

#### `get(tokenId: string, tokenType: number): Promise<TokenDoc | null>`

按 ID 和类型查找单条令牌。`@ArgMethod`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tokenId` | `string` | — | 令牌 ID |
| `tokenType` | `number` | — | 令牌类型常量 |
| **返回值** | `Promise<TokenDoc \| null>` | | |

#### `getMulti(tokenType: number, query?: Filter<TokenDoc>): Cursor<TokenDoc>`

按类型查找多条令牌，可附加 MongoDB 过滤条件。返回游标（非数组），使用 `.toArray()` 获取完整数据。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tokenType` | `number` | — | 令牌类型常量 |
| `query` | `Filter<TokenDoc>` | `{}` | 附加过滤条件 |
| **返回值** | `Cursor<TokenDoc>` | | |

#### `update(tokenId: string, tokenType: number, expireSeconds: number, data: object): Promise<TokenDoc | null>`

更新令牌数据并延长过期时间。将 `updateAt` 设为当前时间，`expireAt` 设为当前时间 + `expireSeconds`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tokenId` | `string` | — | 令牌 ID |
| `tokenType` | `number` | — | 令牌类型常量 |
| `expireSeconds` | `number` | — | 新的有效时长（秒） |
| `data` | `object` | — | 更新的数据 |
| **返回值** | `Promise<TokenDoc \| null>` | | 更新后的文档，未找到返回 `null` |

#### `del(tokenId: string, tokenType: number): Promise<boolean>`

按 ID 和类型删除单条令牌。`@ArgMethod`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tokenId` | `string` | — | 令牌 ID |
| `tokenType` | `number` | — | 令牌类型常量 |
| **返回值** | `Promise<boolean>` | | 文档被删除时返回 `true` |

#### `createOrUpdate(tokenType: number, expireSeconds: number, data: any): Promise<string>`

创建令牌，或更新匹配 `tokenType` + `data` 的已有令牌。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tokenType` | `number` | — | 令牌类型常量 |
| `expireSeconds` | `number` | — | 有效时长（秒） |
| `data` | `any` | — | 令牌附加数据（也作为查找条件） |
| **返回值** | `Promise<string>` | | 令牌 ID（已有或新创建的） |

### 会话查询

#### `getSessionListByUid(uid: number): Promise<TokenDoc[]>`

获取用户的最多 100 条会话令牌，按最近更新排序。`@ArgMethod`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<TokenDoc[]>` | | |

#### `getMostRecentSessionByUid(uid: number, projection: string[]): Promise<TokenDoc | null>`

获取用户最近更新的会话，可选择返回字段。仅返回 `projection` 中列出的字段（不含 `_id`）。`@ArgMethod`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `projection` | `string[]` | — | 要返回的字段列表 |
| **返回值** | `Promise<TokenDoc \| null>` | | |

### 批量操作

#### `delByUid(uid: number): Promise<any>`

删除用户的所有令牌（所有类型）。用于用户封禁/登出流程，一次性撤销所有会话和待处理令牌。`@ArgMethod`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<any>` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<TokenDoc>` | MongoDB `token` 集合 |

---

## 备注

- 启动时通过 `apply()` 创建索引：`{ uid: 1, tokenType: 1, updateAt: -1 }`（稀疏索引）、`{ expireAt: -1 }`（TTL 索引，`expireAfterSeconds: 0`，MongoDB 自动删除过期令牌）。
- 标记 `@ArgMethod` 的方法可通过参数/CLI 模式调用：`get`、`del`、`getSessionListByUid`、`getMostRecentSessionByUid`、`delByUid`。
