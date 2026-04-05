---
title: OplogModel
description: 操作日志模型，用于记录和查询审计日志条目
source: packages/hydrooj/src/model/oplog.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/oplog.ts
import: "import { OplogModel } from 'hydrooj'"
---
# OplogModel

操作日志模型，用于记录和查询审计日志条目。

`OplogModel` 是一个纯模块，导出函数而非类。所有方法直接调用（如 `OplogModel.log(...)`）。

---

## 方法

### 日志记录

#### `log(handler: Handler | ConnectionHandler, type: string, data: any): Promise<ObjectId>`

从 HTTP 处理器上下文记录一条操作日志。自动捕获请求元数据（域、user-agent、referer、路径、IP、操作者）。在插入前触发 `oplog/log` 总线事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `handler` | `Handler \| ConnectionHandler` | — | 请求处理器，用于提取请求上下文 |
| `type` | `string` | — | 操作类型标识符（如 `"problem.create"`、`"user.login"`） |
| `data` | `any` | — | 与日志条目一起存储的附加数据 |
| **返回值** | `Promise<ObjectId>` | | 新插入文档的 `_id` |

#### `add(data: Partial<OplogDoc> & { type: string }): Promise<ObjectId>`

插入一条原始操作日志，不带请求上下文。适用于系统级或后台任务的日志记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `Partial<OplogDoc> & { type: string }` | — | 部分操作日志文档。必须包含 `type`。若提供 `_id`，则重映射为 `id` |
| **返回值** | `Promise<ObjectId>` | | 新插入文档的 `_id` |

### 查询

#### `get(id: ObjectId): Promise<OplogDoc | null>`

通过 `_id` 获取单条操作日志。未找到则返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `ObjectId` | — | 日志条目 `_id` |
| **返回值** | `Promise<OplogDoc> \| null` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<OplogDoc>` | MongoDB `oplog` 集合，用于自定义查询 |

---

## 备注

- `log()` 在存储前会对处理器参数进行清洗：去除 `password`/`verifyPassword` 字段及以 `__` 开头的键，并将键名中的 `$` 和 `.` 字符替换为 `_`。
- `log()` 通过 `bus.parallel()` 在数据库插入前触发 `oplog/log` 总线事件，允许插件响应或增强日志条目。
- `add()` **不会**自动填充请求元数据（时间、domainId、操作者等）——调用方需按需手动提供。
