---
title: StorageModel
description: 文件存储模型，用于管理通过对象存储后端进行的文件上传、下载和生命周期
source: packages/hydrooj/src/model/storage.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/storage.ts
---
# StorageModel

文件存储模型，用于管理通过对象存储后端进行的文件上传、下载和生命周期管理。

> **源码**: [`packages/hydrooj/src/model/storage.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/storage.ts)
>
> **导出**: `import { StorageModel } from 'hydrooj';`

`StorageModel` 是一个纯静态类。所有方法直接在类上调用（如 `StorageModel.put(...)`）。

---

## 方法

### 上传与写入

#### `put(path: string, file: string | Buffer | Readable, owner?: number): Promise<string>`

将文件上传到指定路径的存储中。先删除同路径的已有文件，生成唯一存储 ID，并同时存储到对象存储和 MongoDB 中。返回 `path`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string` | — | 存储路径 |
| `file` | `string \| Buffer \| Readable` | — | 文件路径、Buffer 或可读流 |
| `owner` | `number` | — | 文件所有者 UID |
| **返回值** | `Promise<string>` | | 存储 `path` |

```typescript
// 从 Buffer 上传
const path = await StorageModel.put(
  'problem/1000/statement.md',
  Buffer.from('# Hello World\n题目描述...'),
  session.uid,
);

// 从文件路径上传
const path2 = await StorageModel.put(
  'problem/1000/testdata/in.txt',
  '/tmp/test_input.txt',
);
```

#### `copy(src: string, dst: string): Promise<string>`

在目标路径创建文件副本。副本通过 `link` 字段引用原始存储对象（不重复存储）。先删除 `dst` 处的已有文件。返回新的存储 `_id`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 源文件路径 |
| `dst` | `string` | — | 目标文件路径 |
| **返回值** | `Promise<string>` | | 新存储 `_id` |

### 读取与下载

#### `get(path: string, savePath?: string): Promise<Readable | string>`

按路径获取文件。更新 `lastUsage` 时间戳。若文档包含 `link` 字段，则跟踪到实际存储对象。若提供 `savePath`，则保存到磁盘并返回文件路径；否则返回 `Readable` 流。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string` | — | 文件存储路径 |
| `savePath` | `string` | — | 可选本地保存路径；提供则返回文件路径字符串 |
| **返回值** | `Promise<Readable \| string>` | | `Readable` 流或本地文件路径 |

#### `getMeta(path: string): Promise<object | null>`

按路径返回文件元数据：`Content-Type`、`size`、`lastModified`、`etag` 及自定义元数据。未找到则返回 `null`。更新 `lastUsage` 时间戳。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string` | — | 文件存储路径 |
| **返回值** | `Promise<object \| null>` | | 元数据对象或 `null` |

#### `signDownloadLink(target: string, filename?: string, noExpire?: boolean, useAlternativeEndpointFor?: 'user' | 'judge'): Promise<string>`

生成用于下载文件的签名 URL。支持可选的文件名覆盖、禁用过期时间，以及为用户或评测端指定备用端点路由。更新 `lastUsage` 时间戳。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `target` | `string` | — | 文件存储路径 |
| `filename` | `string` | — | 下载时显示的文件名 |
| `noExpire` | `boolean` | — | 禁用签名 URL 过期 |
| `useAlternativeEndpointFor` | `'user' \| 'judge'` | — | 使用备用端点路由 |
| **返回值** | `Promise<string>` | | 签名下载 URL |

```typescript
// 生成带自定义文件名的下载链接
const url = await StorageModel.signDownloadLink(
  'problem/1000/statement.md',
  '题目描述.md',
);

// 为评测端生成不过期链接
const judgeUrl = await StorageModel.signDownloadLink(
  'problem/1000/testdata/in.txt',
  undefined,
  true,
  'judge',
);
```

### 文件操作

#### `rename(path: string, newPath: string, operator?: null | number): Promise<UpdateResult>`

在数据库中重命名文件路径。可选择记录执行重命名的操作者。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string` | — | 当前文件路径 |
| `newPath` | `string` | — | 新文件路径 |
| `operator` | `null \| number` | — | 执行重命名的用户 UID |
| **返回值** | `Promise<UpdateResult>` | | |

#### `move(src: string, dst: string): Promise<boolean>`

将文件从 `src` 移动到 `dst` 路径。若源文件存在并已移动则返回 `true`，否则返回 `false`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 源文件路径 |
| `dst` | `string` | — | 目标文件路径 |
| **返回值** | `Promise<boolean>` | | 是否成功移动 |

#### `del(path: string[], operator?: number): Promise<void>`

将文件标记为待删除。不会立即删除——将 `autoDelete` 设为 7 天后。处理关联文件时会交换 ID，确保仍被其他文档引用的文件保持可访问。操作者信息记录用于审计。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string[]` | — | 要删除的文件路径数组 |
| `operator` | `number` | — | 执行删除的用户 UID |
| **返回值** | `Promise<void>` | | |

```typescript
// 标记文件为待删除（7天后自动清理）
await StorageModel.del(
  ['problem/1000/old_statement.md', 'problem/1000/old_testdata.zip'],
  session.uid,
);
```

#### `list(target: string, recursive?: boolean): Promise<object[]>`

列出目标路径前缀下的文件。返回包含额外 `name` 字段（相对路径）的文件文档数组。非递归模式仅列出直接子项。拒绝包含 `..` 或 `//` 的路径。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `target` | `string` | — | 路径前缀 |
| `recursive` | `boolean` | — | 是否递归列出子目录 |
| **返回值** | `Promise<object[]>` | | 文件文档数组（含 `name` 字段） |

#### `exists(path: string): Promise<boolean>`

检查给定路径是否存在文件（排除已自动删除的文件）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `string` | — | 文件存储路径 |
| **返回值** | `Promise<boolean>` | | |

### 工具方法

#### `generateId(ext: string): string`

生成格式为 `{3字符nanoid}/{nanoid}{ext}` 的唯一存储 ID。将 `_` 和 `-` 替换为 `0` 以确保文件名安全。始终小写。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ext` | `string` | — | 文件扩展名（含 `.`） |
| **返回值** | `string` | | 唯一存储 ID |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection` | MongoDB `storage` 集合 |

---

## 类型导出

该文件还导出一个内部使用的非类函数：

- `apply(ctx: Context)` — 注册域删除处理器（域删除时清理文件）和 `storage.prune` 工作器，定期移除过期文件。

---

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `storage.prune` | — | 定时任务（每小时运行），清理过期文件 |

---

## 备注

- 文件不会通过 `del()` 立即删除——它们被标记为 `autoDelete`（7 天），由 `storage.prune` 定时任务（每小时运行）清理。
- `copy()` 创建一个轻量级引用（`link` 字段）指向原始存储对象，而非在对象存储中重复数据。
- `_swapId` 是一个私有方法，交换两条文件记录的元数据以安全处理关联文件的删除。
- `storage.prune` 任务还会清理超过 `submission.saveDays` 系统设置的提交文件，并遵循 `server.keepFiles` 跳过清理。

**索引**：在启动时通过 `apply()` 创建（仅在 `NODE_APP_INSTANCE=0` 时）：

| 键 | 选项 | 说明 |
|-----|------|------|
| `{ path: 1 }` | — | 按文件路径的主查找 |
| `{ path: 1, autoDelete: 1 }` | sparse | 从查询中排除已删除的文件 |
| `{ link: 1 }` | sparse | 解析关联/复制的文件 |
