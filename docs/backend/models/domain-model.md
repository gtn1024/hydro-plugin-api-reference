---
title: DomainModel
description: 域（租户/组织）模型，提供域 CRUD、用户角色成员管理和角色权限管理
source: packages/hydrooj/src/model/domain.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/domain.ts
---
# DomainModel

域（租户/组织）模型，提供域 CRUD、用户角色成员管理、角色权限管理和加入设置。

> **源码**: [`packages/hydrooj/src/model/domain.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/domain.ts)
>
> **导出**: `import { DomainModel } from 'hydrooj';`

`DomainModel` 是纯静态类。所有方法均通过类本身调用（如 `DomainModel.get(...)`）。

---

## 类型导出

### `DomainDoc`

定义在 `packages/hydrooj/src/interface.ts`：

```typescript
interface DomainDoc extends Record<string, any> {
    _id: string;          // 域 ID
    owner: number;        // 所有者 UID
    roles: Dictionary<string>;  // 角色名 → 权限 bigint 字符串
    avatar: string;       // 域头像 URL
    bulletin: string;     // 域公告文本
    _join?: any;          // 加入设置（method, role, expire, code）
    host?: string[];      // 自定义 host 头
}
```

注意：`DomainDoc` 继承 `Record<string, any>`，因此允许任意附加字段。

---

## 常量

### 加入方式

| 常量 | 值 | 说明 |
|------|-----|------|
| `JOIN_METHOD_NONE` | `0` | 不允许任何用户加入此域 |
| `JOIN_METHOD_ALL` | `1` | 允许任何用户加入此域 |
| `JOIN_METHOD_CODE` | `2` | 允许任何用户通过邀请码加入 |

### 加入有效期

| 常量 | 值 | 说明 |
|------|-----|------|
| `JOIN_EXPIRATION_KEEP_CURRENT` | `0` | 保持当前有效期 |
| `JOIN_EXPIRATION_UNLIMITED` | `-1` | 永不过期 |
| _(数字键)_ | `3`, `24`, `72`, `168`, `720` | 3 小时 / 1 天 / 3 天 / 1 周 / 1 个月 |

---

## 方法

### 域 CRUD

#### `add(domainId: string, owner: number, name: string, bulletin: string): Promise<string>`

创建新域，指定所有者、名称和公告；将所有者设为 `root` 角色。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `owner` | `number` | — | 所有者 UID |
| `name` | `string` | — | 域名称 |
| `bulletin` | `string` | — | 域公告文本 |
| **返回值** | `Promise<string>` | | |

#### `get(domainId: string): Promise<DomainDoc | null>`

按 ID 获取域（对 `lower` 字段不区分大小写查找），带 LRU 缓存。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| **返回值** | `Promise<DomainDoc \| null>` | | |

#### `getByHost(host: string): Promise<DomainDoc | null>`

按 `host` 字段获取域，带 LRU 缓存（也缓存 `null` 未命中）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `host` | `string` | — | 自定义 host 头值 |
| **返回值** | `Promise<DomainDoc \| null>` | | |

#### `getMulti(query?: Filter<DomainDoc>): Cursor<DomainDoc>`

获取匹配过滤器的域游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<DomainDoc>` | — | MongoDB 过滤条件 |
| **返回值** | `Cursor<DomainDoc>` | | |

#### `getList(domainIds: string[]): Promise<Record<string, DomainDoc | null>>`

以域 ID 为键的字典形式获取多个域（内部使用 `get`，遵循缓存）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainIds` | `string[]` | — | 域 ID 数组 |
| **返回值** | `Promise<Record<string, DomainDoc \| null>>` | | |

#### `edit(domainId: string, $set: Partial<DomainDoc>): Promise<DomainDoc | null>`

按 ID 更新城字段；广播缓存失效。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `$set` | `Partial<DomainDoc>` | — | 要更新的字段 |
| **返回值** | `Promise<DomainDoc \| null>` | | |

#### `inc(domainId: string, field: NumberKeys<DomainDoc>, n: number): Promise<number | null>`

原子性递增域上的数值字段；广播缓存失效。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `field` | `NumberKeys<DomainDoc>` | — | 要递增的数值字段名 |
| `n` | `number` | — | 递增量 |
| **返回值** | `Promise<number \| null>` | | |

#### `getPrefixSearch(prefix: string, limit?: number): Promise<DomainDoc[]>`

按 ID 或名称前缀搜索域（正则，不区分大小写）；默认限制 50。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prefix` | `string` | — | 搜索前缀 |
| `limit` | `number` | `50` | 返回数量上限 |
| **返回值** | `Promise<DomainDoc[]>` | | |

#### `del(domainId: string): Promise<void>`

删除域及所有用户关联；触发 `domain/delete` 事件并使缓存失效。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| **返回值** | `Promise<void>` | | |

### 域用户管理

#### `countUser(domainId: string, role?: string): Promise<number>`

统计域中的已加入用户，可选按角色过滤。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `role` | `string` | — | 可选角色过滤 |
| **返回值** | `Promise<number>` | | |

#### `getDomainUser(domainId: string, udoc: { _id: number, priv: number }): Promise<any>`

获取域用户记录，包含有效角色和计算后的 `perm`（考虑用户特权如 `PRIV_MANAGE_ALL_DOMAIN`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `udoc` | `{ _id: number, priv: number }` | — | 用户文档（至少含 `_id` 和 `priv`） |
| **返回值** | `Promise<any>` | | |

#### `getDomainUserMulti(domainId: string, uids: number[]): Cursor<any>`

按 UID 获取多个域用户记录的游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uids` | `number[]` | — | 用户 ID 数组 |
| **返回值** | `Cursor<any>` | | |

#### `getDictUserByDomainId(uid: number): Promise<Record<string, any>>`

获取用户的所有已加入域用户记录，以 `domainId` 为键。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<Record<string, any>>` | | |

#### `setUserRole(domainId: string, uid: MaybeArray<number>, role: string, autojoin?: boolean): Promise<any>`

设置域中的用户角色；支持单个或批量 UID；可选自动加入。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `MaybeArray<number>` | — | 单个或批量用户 ID |
| `role` | `string` | — | 目标角色名 |
| `autojoin` | `boolean` | `false` | 是否自动加入域 |
| **返回值** | `Promise<any>` | | |

#### `setJoin(domainId: string, uid: MaybeArray<number>, join: boolean): Promise<void>`

设置域中用户的加入状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `MaybeArray<number>` | — | 单个或批量用户 ID |
| `join` | `boolean` | — | 加入状态 |
| **返回值** | `Promise<void>` | | |

#### `setUserInDomain(domainId: string, uid: number, params: any): Promise<any>`

设置域用户记录的指定字段（upsert）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `number` | — | 用户 ID |
| `params` | `any` | — | 要设置的字段 |
| **返回值** | `Promise<any>` | | |

#### `updateUserInDomain(domainId: string, uid: number, update: any): Promise<any>`

对域用户记录应用任意 MongoDB 更新（upsert）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `number` | — | 用户 ID |
| `update` | `any` | — | MongoDB 更新操作 |
| **返回值** | `Promise<any>` | | |

#### `setMultiUserInDomain(domainId: string, query: any, params: any): Promise<any>`

批量使用 `$set` 更新匹配查询的域用户（upsert）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | 匹配条件 |
| `params` | `any` | — | 要设置的字段 |
| **返回值** | `Promise<any>` | | |

#### `getMultiUserInDomain(domainId: string, query?: any): Cursor<any>`

获取匹配查询的域用户游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | 匹配条件 |
| **返回值** | `Cursor<any>` | | |

#### `incUserInDomain(domainId: string, uid: number, field: string, n: number = 1): Promise<any>`

对域用户记录执行读-改-写递增数值字段；返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `number` | — | 用户 ID |
| `field` | `string` | — | 要递增的字段名 |
| `n` | `number` | `1` | 递增量 |
| **返回值** | `Promise<any>` | | |

### 角色管理

#### `getRoles(domainId: string | DomainDoc, count?: boolean): Promise<any[]>`

获取域的所有角色（内置 + 自定义），可选附带每角色的用户计数。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string \| DomainDoc` | — | 域 ID 或域文档 |
| `count` | `boolean` | — | 是否附带每角色用户计数 |
| **返回值** | `Promise<any[]>` | | |

#### `setRoles(domainId: string, roles: Dictionary<bigint | string>): Promise<any>`

设置多个角色及其权限（合并到已有角色中）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `roles` | `Dictionary<bigint \| string>` | — | 角色名 → 权限映射 |
| **返回值** | `Promise<any>` | | |

#### `addRole(domainId: string, name: string, permission: bigint): Promise<any>`

添加具有指定权限的新自定义角色。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `name` | `string` | — | 角色名 |
| `permission` | `bigint` | — | 角色权限 |
| **返回值** | `Promise<any>` | | |

#### `deleteRoles(domainId: string, roles: string[]): Promise<void>`

删除角色并将所有受影响的用户重置为 `default` 角色。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `roles` | `string[]` | — | 要删除的角色名数组 |
| **返回值** | `Promise<void>` | | |

### 加入设置

#### `getJoinSettings(ddoc: DomainDoc, roles: string[]): any | null`

如果域允许加入且角色被允许，则获取加入设置；加入被禁用或已过期时返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ddoc` | `DomainDoc` | — | 域文档 |
| `roles` | `string[]` | — | 允许加入的角色列表 |
| **返回值** | `any \| null` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection` | MongoDB `domain` 集合 |
| `collUser` | `Collection` | MongoDB `domain.user` 集合 |

---

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `domain/create` | `ddoc: DomainDoc` | 域创建时触发（DB 插入前） |
| `domain/before-get` | `query: Filter<DomainDoc>` | 域查询前触发；允许修改查询条件 |
| `domain/get` | `ddoc: DomainDoc` | 域成功获取后触发 |
| `domain/before-update` | `domainId, $set` | 域更新前触发 |
| `domain/update` | `domainId, $set, ddoc` | 域更新后触发（含更新后的文档） |
| `domain/delete` | `domainId` | 域删除后触发 |
| `domain/delete-cache` | `domainId` | 跨集群广播使域缓存失效 |

---

## 备注

- 使用 `LRUCache`，最大 1000 条目，TTL 300000ms（5 分钟）。
- 缓存键：ID 查找使用 `id::{lower}`，host 查找使用 `host::{host}`。
- 缓存通过 `domain/delete-cache` 广播（跨集群）在编辑、递增、角色变更和删除时失效。
- `getByHost` 缓存 `null` 结果（未找到 host 对应的域）。
