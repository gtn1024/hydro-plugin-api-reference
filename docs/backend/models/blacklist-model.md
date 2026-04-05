---
title: BlackListModel
description: 用于按 ID 封禁用户或实体的黑名单模型，支持可选过期时间
source: packages/hydrooj/src/model/blacklist.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/blacklist.ts
---
# BlackListModel

用于按 ID 封禁用户或实体的黑名单模型，支持可选过期时间。

> **源码**: [`packages/hydrooj/src/model/blacklist.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/blacklist.ts)
>
> **导出**: `import { BlackListModel } from 'hydrooj';`

`BlackListModel` 是纯静态类。所有方法均通过类本身调用（如 `BlackListModel.add(...)`）。

所有方法均使用 `@ArgMethod` 装饰 —— 可通过参数/CLI 模式调用。

---

## 方法

### 查找

#### `get(id: string): Promise<WithId<Document> | null>`

按 ID 查找黑名单条目。未找到时返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | 要查找的实体 ID |
| **返回值** | `Promise<WithId<Document> \| null>` | | |

### 创建与变更

#### `add(id: string, expire?: Date | number): Promise<WithId<Document>>`

将 ID 添加到黑名单，支持可选过期时间。使用 upsert —— 如果条目已存在则更新 `expireAt`。

**过期逻辑：**
- `expire === 0` → 从现在起 1000 个月（实际上永久）
- `expire` 为 `number` → 从现在起该月数
- `expire` 为 `Date` → 直接使用
- `expire` 省略 → 从现在起 365 天

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | 要封禁的实体 ID |
| `expire` | `Date \| number` | `365 天` | 过期时间：Date 直接使用，number 为月数，0 为永久 |
| **返回值** | `Promise<WithId<Document>>` | | 新建或更新后的文档 |

### 删除

#### `del(id: string): Promise<DeleteResult>`

按 ID 删除黑名单条目。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | 要解封的实体 ID |
| **返回值** | `Promise<DeleteResult>` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection` | MongoDB `blacklist` 集合（模块级 `db.collection` 引用，非类属性） |

---

## 备注

- 集合在 `expireAt` 上使用 MongoDB TTL 索引 —— 过期条目由 MongoDB 自动删除。
- `add` 设置 `expire=0` 时将过期时间设为 1000 个月，并非真正永久。
- TTL 索引在启动时由 `apply()` 创建：`{ expireAt: -1 }`（`expireAfterSeconds: 0`）。
