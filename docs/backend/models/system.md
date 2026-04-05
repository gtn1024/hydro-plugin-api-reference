---
title: SystemModel
description: 系统级键值设置存储，基于 MongoDB 并带有内存缓存
source: packages/hydrooj/src/model/system.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/system.ts
---
# SystemModel

系统级键值设置存储，基于 MongoDB 并带有内存缓存。

> **源码**: [`packages/hydrooj/src/model/system.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/system.ts)
>
> **导出**: `import { SystemModel } from 'hydrooj';`

`SystemModel` 是 `SystemModelService`（继承 `Service`）的 `serviceInstance` 代理。在启动时将所有系统设置加载到内存缓存中，并通过广播总线保持集群节点间同步。

---

## 方法

### 读写操作

#### `get(key: K): SystemKeys[K]`

从内存缓存中获取单个系统设置。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `K extends keyof SystemKeys` \| `string` | — | 设置键 |
| **返回值** | `SystemKeys[K]` \| `any` | | 缓存值 |

```typescript
const serverName = SystemModel.get('server.name'); // string
const smtpPort = SystemModel.get('smtp.port');      // number
```

#### `getMany(keys: (keyof SystemKeys)[]): any[]`

一次获取多个系统设置。对最多 6 个键提供类型化元组返回。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `keys` | `(keyof SystemKeys)[]` | — | 设置键数组 |
| **返回值** | `any[]`（对 ≤6 个键为类型化元组） | | 按相同顺序排列的缓存值数组 |

```typescript
const [name, url] = SystemModel.getMany(['server.name', 'server.url']);
```

#### `set(_id: K, value: SystemKeys[K], broadcast?: boolean): Promise<SystemKeys[K]>`

将设置写入 MongoDB，更新本地缓存，并可选地广播到其他集群节点。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `K extends keyof SystemKeys` \| `string` | — | 设置键 |
| `value` | `SystemKeys[K]` \| `any` | — | 要存储的值 |
| `broadcast` | `boolean` | `true` | 是否在集群节点间同步 |
| **返回值** | `Promise<SystemKeys[K]>` | | 存储的值 |

```typescript
await SystemModel.set('server.name', 'My Judge');
await SystemModel.set('custom.key', data, false); // 仅本地
```

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `MongoDB.Collection` | `system` MongoDB 集合 |
| `cache` | `Record<string, any>` | 所有设置的内存缓存；启动时从默认值和数据库填充 |

---

## 类型导出

### `SystemKeys`

`SystemKeys` 接口（`packages/hydrooj/src/interface.ts`）中定义的已知类型化键：

| 键 | 类型 |
|-----|------|
| `smtp.user` | `string` |
| `smtp.from` | `string` |
| `smtp.pass` | `string` |
| `smtp.host` | `string` |
| `smtp.port` | `number` |
| `smtp.secure` | `boolean` |
| `installid` | `string` |
| `server.name` | `string` |
| `server.url` | `string` |
| `server.xff` | `string` |
| `server.xhost` | `string` |
| `server.host` | `string` |
| `server.port` | `number` |
| `server.language` | `string` |
| `limit.problem_files_max` | `number` |
| `problem.categories` | `string` |
| `session.keys` | `string[]` |
| `session.saved_expire_seconds` | `number` |
| `session.unsaved_expire_seconds` | `number` |
| `user.quota` | `number` |

也可使用任意字符串键——返回类型为 `any`。

---

## 备注

- 在服务启动时（`[Service.init]`），SystemModel 执行以下操作：
  1. 从 `SYSTEM_SETTINGS` 加载默认值
  2. 读取 `system` MongoDB 集合中的所有文档并填充 `cache`
  3. 触发 `database/config` 事件
  4. 订阅 `system/setting` 广播事件以保持集群节点间缓存同步
