---
title: db (MongoService) & Collections
description: MongoDB 数据库服务，提供集合访问、索引管理、分页和排名工具
source: packages/hydrooj/src/service/db.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/service/db.ts
---
# db (MongoService) & Collections

MongoDB 数据库服务，提供集合访问、索引管理、分页和排名工具。

> **源码**: [`packages/hydrooj/src/service/db.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/service/db.ts)
>
> **导出**: `import { db, Collections } from 'hydrooj';`
> **访问**: `ctx.db`（推荐）或 `db`（已弃用的全局代理）

---

## MongoService (`ctx.db`)

注册为 `'db'` 键的 Cordis `Service`。在 `database/connect` 生命周期事件后可通过 `ctx.db` 使用。

### 属性

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `client` | `MongoClient` | 底层 MongoDB 客户端实例 |
| `db` | `Db` | 已连接数据库的原生 MongoDB `Db` 实例 |

### 方法

#### `collection<K extends keyof Collections>(c: K): Collection<Collections[K]>`

返回带类型的 MongoDB 集合。遵循 `prefix` 和 `collectionMap` 配置进行名称重映射。

#### `paginate<T>(cursor: FindCursor<T>, page: number, pageSize: number): Promise<[docs: T[], numPages: number, count: number]>`

对查找游标进行分页。返回一个元组，包含当前页文档、总页数和总文档数。`page <= 0` 时抛出 `ValidationError`。

#### `ranked<T>(cursor: T[] | FindCursor<T>, equ: (a: T, b: T) => boolean): Promise<[number, T][]>`

为已排序的结果分配密集排名。带有 `unrank: true` 的文档排名为 `0`。并列文档（根据 `equ` 比较器判断）共享相同排名。

#### `ensureIndexes<T>(coll: Collection<T>, ...indexes: IndexDescription[]): Promise<void>`

在集合上创建或更新索引。仅在 `NODE_APP_INSTANCE=0` 时运行。按名称/键比较现有索引，若定义已更改则先删除再重建。文本索引有特殊处理以避免冲突。

#### `clearIndexes<T>(coll: Collection<T>, dropIndex?: string[]): Promise<void>`

删除集合中已存在的指定索引。仅在 `NODE_APP_INSTANCE=0` 时运行。

#### `fixExpireAfter(): Promise<void>`

针对 MongoDB TTL 索引在非副本集模式下无法自动过期的变通方案。手动删除超过 `expireAfterSeconds` 阈值的文档。每小时通过定时器调用。

### 静态方法

#### `MongoService.getUrl(): Promise<string | null>`

从配置或环境变量解析 MongoDB 连接 URL。未加载配置时返回 `null`。CI 模式下启动内存中的 `mongodb-memory-server` 实例。

---

## Collections

将集合名称映射到其文档类型的 TypeScript 接口。通过 `packages/hydrooj/src/interface.ts` 中的模块声明合并进行扩展。

**导出**: `import { Collections } from 'hydrooj';`

### 已定义集合

| 集合名称 | 文档类型 | 说明 |
|-----------------|---------------|-------------|
| `blacklist` | `BlacklistDoc` | IP/邮箱黑名单条目 |
| `domain` | `DomainDoc` | 域（站点）文档 |
| `domain.user` | `any` | 域用户成员记录 |
| `record` | `RecordDoc` | 提交/评测记录 |
| `record.stat` | `RecordStatDoc` | 聚合记录统计 |
| `record.history` | `RecordHistoryDoc` | 记录变更历史 |
| `document` | `any` | 通用文档（题目、比赛、训练、讨论等） |
| `document.status` | `StatusDocBase & { [K in keyof DocStatusType]: { docType: K } & DocStatusType[K] }[keyof DocStatusType]` | 用户级别的文档状态（`StatusDocBase` 与按 docType 区分的判别联合类型的交集） |
| `discussion.history` | `DiscussionHistoryDoc` | 讨论/回复编辑历史 |
| `user` | `Udoc` | 用户账户 |
| `user.preference` | `UserPreferenceDoc` | 用户偏好设置 |
| `vuser` | `VUdoc` | 虚拟用户 |
| `user.group` | `GDoc` | 用户组 |
| `check` | `System` | 系统健康检查记录 |
| `message` | `MessageDoc` | 用户消息/通知 |
| `token` | `TokenDoc` | 认证令牌 |
| `status` | `any` | 系统状态记录 |
| `oauth` | `OauthMap` | OAuth 提供商映射 |
| `system` | `System` | 系统配置文档 |
| `task` | `Task` | 后台任务队列条目 |
| `storage` | `FileNode` | 文件存储元数据 |
| `oplog` | `OplogDoc` | 操作审计日志条目 |
| `event` | `EventDoc` | 域事件记录 |
| `opcount` | `OpCountDoc` | 频率限制操作计数器 |
| `schedule` | `Schedule` | 定时任务定义 |
| `contest.balloon` | `ContestBalloonDoc` | 比赛气球（通知）记录 |
| `lock` | `LockDoc` | 分布式锁条目 |

### 用法

```typescript
import { Collections } from 'hydrooj';

// 通过 ctx.db 访问带类型的集合
const coll = ctx.db.collection('document');       // Collection<any>
const userColl = ctx.db.collection('user');       // Collection<Udoc>
```

---

## 备注

- `db`（默认导出）是一个已弃用的 Proxy，转发到 `app.get('db')`。插件中推荐使用 `ctx.db`。
- `Collections` 接口在 `service/db.ts` 中声明为空，通过 `interface.ts` 中的 `declare module './service/db'` 进行扩展。
- 插件可通过相同的声明合并模式扩展 `Collections` 来注册自定义集合类型。
