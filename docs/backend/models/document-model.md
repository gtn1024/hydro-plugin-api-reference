---
title: DocumentModel
description: 通用文档存储模型，提供跨所有文档类型的类型化 CRUD 和子文档操作
source: packages/hydrooj/src/model/document.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/document.ts
---
# DocumentModel

通用文档存储模型，提供跨所有文档类型（题目、比赛、训练计划、讨论等）的类型化 CRUD、子文档操作和每用户状态追踪。

> **源码**: [`packages/hydrooj/src/model/document.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/document.ts)
>
> **导出**: `import * as document from 'hydrooj';`（可通过 `ctx.model.document` 访问）

DocumentModel 是导出函数的普通模块（非类）。所有函数直接调用。它是高级模型（ProblemModel、ContestModel、TrainingModel、DiscussionModel）委托的基础数据访问层。

---

## 类型导出

### DocType

将类型常量映射到对应的文档接口：

```typescript
interface DocType {
    [TYPE_PROBLEM]: ProblemDoc;
    [TYPE_PROBLEM_SOLUTION]: any;
    [TYPE_PROBLEM_LIST]: any;
    [TYPE_DISCUSSION_NODE]: any;
    [TYPE_DISCUSSION]: DiscussionDoc;
    [TYPE_DISCUSSION_REPLY]: DiscussionReplyDoc;
    [TYPE_CONTEST]: Tdoc;
    [TYPE_CONTEST_PRINT]: ContestPrintDoc;
    [TYPE_CONTEST_CLARIFICATION]: ContestClarificationDoc;
    [TYPE_TRAINING]: TrainingDoc;
}
```

### DocStatusType

将类型常量映射到状态文档接口（如 `TYPE_PROBLEM` 对应 `ProblemStatusDoc`）。

---

## 常量

### DocType 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `TYPE_PROBLEM` | `10` | 题目文档 |
| `TYPE_PROBLEM_SOLUTION` | `11` | 题解题 |
| `TYPE_PROBLEM_LIST` | `12` | 题单 / 作业 |
| `TYPE_DISCUSSION_NODE` | `20` | 讨论分类节点 |
| `TYPE_DISCUSSION` | `21` | 讨论帖 |
| `TYPE_DISCUSSION_REPLY` | `22` | 讨论回复 |
| `TYPE_CONTEST` | `30` | 比赛文档 |
| `TYPE_CONTEST_CLARIFICATION` | `31` | 比赛答疑请求 |
| `TYPE_CONTEST_PRINT` | `32` | 比赛打印任务 |
| `TYPE_TRAINING` | `40` | 训练计划 |

---

## 方法

### 文档 CRUD

#### `add(domainId: string, content: string, owner: number, docType: number, docId?: ObjectId, parentType?: number, parentId?: ObjectId | number | string, args?: any): Promise<ObjectId>`

插入新文档。如果提供了 `docId` 则返回 `docId`，否则返回生成的 `ObjectId`。插入前触发 `document/add` 总线事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `content` | `string` | — | 文档内容 |
| `owner` | `number` | — | 所有者 UID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 指定文档 ID（可选） |
| `parentType` | `number` | — | 父文档类型 |
| `parentId` | `ObjectId \| number \| string` | — | 父文档 ID |
| `args` | `any` | — | 附加字段 |
| **返回值** | `Promise<ObjectId>` | | 新文档 ID |

#### `get(domainId: string, docType: number, docId: ObjectId, projection?: any): Promise<Doc | null>`

按组合键 `(domainId, docType, docId)` 获取单个文档。未找到时返回 `null`。接受可选字段投影。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `projection` | `any` | — | 字段投影 |
| **返回值** | `Promise<Doc \| null>` | | |

#### `getMulti(domainId: string, docType: number, query?: Filter<Doc>, projection?: any): FindCursor<Doc>`

返回匹配查询的多文档 `FindCursor`。接受可选过滤器和投影。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `query` | `Filter<Doc>` | — | 过滤条件 |
| `projection` | `any` | — | 字段投影 |
| **返回值** | `FindCursor<Doc>` | | |

#### `set(domainId: string, docType: number, docId: ObjectId, $set?: any, $unset?: any, $push?: any): Promise<Doc>`

使用 `$set`、`$unset` 和/或 `$push` 操作符原子性更新文档。返回更新后的文档。更新前触发 `document/set` 总线事件。文档不存在时执行 upsert。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `$set` | `any` | — | 要设置的字段 |
| `$unset` | `any` | — | 要移除的字段 |
| `$push` | `any` | — | 要推入数组的元素 |
| **返回值** | `Promise<Doc>` | | 更新后的文档 |

#### `inc(domainId: string, docType: number, docId: ObjectId, key: string, value: number): Promise<Doc>`

原子性递增数值字段 `value`。返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `key` | `string` | — | 要递增的字段名 |
| `value` | `number` | — | 递增量 |
| **返回值** | `Promise<Doc>` | | 更新后的文档 |

#### `incAndSet(domainId: string, docType: number, docId: ObjectId, key: string, value: number, args: any): Promise<Doc>`

在单次操作中原子性递增数值字段并设置附加字段。返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `key` | `string` | — | 要递增的字段名 |
| `value` | `number` | — | 递增量 |
| `args` | `any` | — | 附加设置字段 |
| **返回值** | `Promise<Doc>` | | 更新后的文档 |

#### `count(domainId: string, docType: number, query?: Filter<Doc>): Promise<number>`

统计匹配过滤器的文档数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `query` | `Filter<Doc>` | — | 过滤条件 |
| **返回值** | `Promise<number>` | | 匹配的文档数量 |

#### `deleteOne(domainId: string, docType: number, docId: ObjectId): Promise<void>`

删除单个文档及其关联的状态记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| **返回值** | `Promise<void>` | | |

#### `deleteMulti(domainId: string, docType: number, query?: Filter<Doc>): Promise<void>`

删除匹配过滤器的多个文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `query` | `Filter<Doc>` | — | 过滤条件 |
| **返回值** | `Promise<void>` | | |

### 子文档操作

这些方法操作文档内的数组字段（如回复、标签）。

#### `push(domainId: string, docType: number, docId: ObjectId, key: string, ...): Promise<[Doc, ObjectId]>` *（两个重载）*

**对象形式**: `push(domainId, docType, docId, key, value)` —— 将对象推入数组字段。
**内容形式**: `push(domainId, docType, docId, key, content, owner, args?)` —— 推入带自动生成 `_id` 的新子文档。
返回 `[updatedDoc, subId]`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `key` | `string` | — | 数组字段名 |
| `value` | `any` | — | 要推入的对象（对象形式） |
| `content` | `string` | — | 子文档内容（内容形式） |
| `owner` | `number` | — | 子文档所有者 UID（内容形式） |
| `args` | `any` | — | 附加字段（内容形式） |
| **返回值** | `Promise<[Doc, ObjectId]>` | | 更新后的文档和子文档 ID |

#### `pull(domainId: string, docType: number, docId: ObjectId, setKey: string, contents: any): Promise<Doc>`

从数组字段中移除匹配给定过滤器的子文档。返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `setKey` | `string` | — | 数组字段名 |
| `contents` | `any` | — | 移除过滤器 |
| **返回值** | `Promise<Doc>` | | 更新后的文档 |

#### `getSub(domainId: string, docType: number, docId: ObjectId, key: string, subId: ObjectId): Promise<[Doc | null, SubDoc | null]>`

从数组字段中按 `_id` 获取特定子文档。返回 `[parentDoc, subDoc]`，未找到时返回 `[null, null]`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `key` | `string` | — | 数组字段名 |
| `subId` | `ObjectId` | — | 子文档 ID |
| **返回值** | `Promise<[Doc \| null, SubDoc \| null]>` | | |

#### `setSub(domainId: string, docType: number, docId: ObjectId, key: string, subId: ObjectId, args: any): Promise<Doc>`

更新按 `_id` 标识的特定子文档字段。使用位置 `$` 操作符。返回更新后的父文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `key` | `string` | — | 数组字段名 |
| `subId` | `ObjectId` | — | 子文档 ID |
| `args` | `any` | — | 要设置的字段 |
| **返回值** | `Promise<Doc>` | | 更新后的父文档 |

#### `deleteSub(domainId: string, docType: number, docId: ObjectId, key: string, subId: ObjectId | ObjectId[]): Promise<Doc>`

从数组字段中按 `_id` 移除一个或多个子文档。接受单个 ID 或 ID 数组。返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `key` | `string` | — | 数组字段名 |
| `subId` | `ObjectId \| ObjectId[]` | — | 子文档 ID（单个或数组） |
| **返回值** | `Promise<Doc>` | | 更新后的文档 |

#### `addToSet(domainId: string, docType: number, docId: ObjectId, setKey: string, content: string): Promise<Doc>`

仅在数组字段中不存在时添加字符串值（通过 `$addToSet` 去重）。返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `setKey` | `string` | — | 数组字段名 |
| `content` | `string` | — | 要添加的值 |
| **返回值** | `Promise<Doc>` | | 更新后的文档 |

### 状态 CRUD

状态记录追踪每用户状态（分数、提交、报名），以 `(domainId, docType, docId, uid)` 为键。

#### `getStatus(domainId: string, docType: number, docId: ObjectId, uid: number): Promise<StatusDoc | null>`

获取单个状态记录。未找到时返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<StatusDoc \| null>` | | |

#### `getMultiStatus(domainId: string, docType: number, args: any): FindCursor<StatusDoc>`

返回匹配过滤器的状态记录 `FindCursor`（限定域范围）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `args` | `any` | — | 过滤条件 |
| **返回值** | `FindCursor<StatusDoc>` | | |

#### `getMultiStatusWithoutDomain(docType: number, args: any): FindCursor<StatusDoc>`

返回匹配过滤器的状态记录 `FindCursor`（跨域）。用于系统级查询。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `docType` | `number` | — | 文档类型常量 |
| `args` | `any` | — | 过滤条件 |
| **返回值** | `FindCursor<StatusDoc>` | | |

#### `setStatus(domainId: string, docType: number, docId: ObjectId, uid: number, args: any, returnDocument?: 'before' | 'after'): Promise<StatusDoc>`

设置状态记录字段，不存在时 upsert。`returnDocument` 控制返回的文档是更新 `'before'` 还是 `'after'`（默认 `'after'`）。返回 `'before'` 时使用 `readConcern: 'majority'`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `args` | `any` | — | 要设置的字段 |
| `returnDocument` | `'before' \| 'after'` | `'after'` | 返回更新前还是更新后的文档 |
| **返回值** | `Promise<StatusDoc>` | | |

```typescript
// 设置用户对题目的状态
const status = await document.setStatus(
  'system',                          // domainId
  document.TYPE_PROBLEM,             // docType
  problemDocId,                      // docId
  12345,                             // uid
  { score: 100, accept: true },      // args
);

// 获取更新前的状态（用于检测变更）
const before = await document.setStatus(
  'system',
  document.TYPE_PROBLEM,
  problemDocId,
  12345,
  { star: true },
  'before',                          // returnDocument
);
```

#### `setMultiStatus(domainId: string, docType: number, query: any, args: any): Promise<void>`

批量更新匹配过滤器的多个状态记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `query` | `any` | — | 过滤条件 |
| `args` | `any` | — | 要设置的字段 |
| **返回值** | `Promise<void>` | | |

#### `countStatus(domainId: string, docType: number, query?: any): Promise<number>`

统计匹配过滤器的状态记录数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `query` | `any` | — | 过滤条件 |
| **返回值** | `Promise<number>` | | |

#### `deleteMultiStatus(domainId: string, docType: number, query?: any): Promise<void>`

删除匹配过滤器的状态记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `query` | `any` | — | 过滤条件 |
| **返回值** | `Promise<void>` | | |

#### `incStatus(domainId: string, docType: number, docId: ObjectId, uid: number, key: string, value: number): Promise<StatusDoc>`

原子性递增状态记录上的数值字段。不存在时 upsert。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `key` | `string` | — | 要递增的字段名 |
| `value` | `number` | — | 递增量 |
| **返回值** | `Promise<StatusDoc>` | | |

#### `setStatusIfCondition(domainId: string, docType: number, docId: ObjectId, uid: number, filter: any, args?: any, returnDocument?: 'before' | 'after'): Promise<StatusDoc | false>`

条件性设置状态字段 —— 仅在附加 `filter` 匹配时更新。出错时返回 `false`（捕获异常）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `filter` | `any` | — | 额外过滤条件 |
| `args` | `any` | — | 要设置的字段 |
| `returnDocument` | `'before' \| 'after'` | `'after'` | 返回更新前还是更新后的文档 |
| **返回值** | `Promise<StatusDoc \| false>` | | 条件不满足时返回 `false` |

#### `setIfNotStatus(domainId: string, docType: number, docId: ObjectId, uid: number, key: string, value: any, ifNot: any, args: any, returnDocument?: 'before' | 'after'): Promise<StatusDoc | false>`

仅当字段当前值不为 `ifNot` 时设置为 `value`。委托 `setStatusIfCondition` 使用 `$ne` 过滤器。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `key` | `string` | — | 字段名 |
| `value` | `any` | — | 目标值 |
| `ifNot` | `any` | — | 排除的当前值 |
| `args` | `any` | — | 附加设置字段 |
| `returnDocument` | `'before' \| 'after'` | `'after'` | 返回更新前还是更新后的文档 |
| **返回值** | `Promise<StatusDoc \| false>` | | 条件不满足时返回 `false` |

#### `cappedIncStatus(domainId: string, docType: number, docId: ObjectId, uid: number, key: string, value: number, minValue?: number, maxValue?: number, setPayload?: any): Promise<StatusDoc>`

原子性递增数值字段但限制在 `[minValue, maxValue]` 范围内（默认 `[-1, 1]`）。字段将超出上限时递增被静默跳过。可选择在同一操作中设置附加字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `key` | `string` | — | 要递增的字段名 |
| `value` | `number` | — | 递增量 |
| `minValue` | `number` | `-1` | 最小值 |
| `maxValue` | `number` | `1` | 最大值 |
| `setPayload` | `any` | — | 同步设置的附加字段 |
| **返回值** | `Promise<StatusDoc>` | | |

```typescript
// 比赛签到：attendance 字段从 -1 → 0 → 1，上限为 1
const status = await document.cappedIncStatus(
  'system',                          // domainId
  document.TYPE_CONTEST,             // docType
  contestDocId,                      // docId
  12345,                             // uid
  'attendance',                      // key
  1,                                 // value
  -1,                                // minValue
  1,                                 // maxValue
  { attendAt: new Date() },          // setPayload
);
```

### 基于修订号的状态操作

这些方法在状态记录上维护 `rev`（修订计数器）用于乐观并发控制。

#### `revInitStatus(domainId: string, docType: number, docId: ObjectId, uid: number): Promise<StatusDoc>`

初始化或递增状态记录上的 `rev` 计数器。不存在时 upsert。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<StatusDoc>` | | |

#### `revPushStatus(domainId: string, docType: number, docId: ObjectId, uid: number, key: string, value: any, id?: ObjectId): Promise<StatusDoc>`

将值推入带修订追踪的状态数组字段。如果已存在匹配 `id` 的元素，则替换而非推入。两种情况均递增 `rev`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `key` | `string` | — | 数组字段名 |
| `value` | `any` | — | 要推入/替换的值 |
| `id` | `ObjectId` | — | 子元素 ID（匹配则替换） |
| **返回值** | `Promise<StatusDoc>` | | |

```typescript
// 比赛排行榜：推入每题提交详情，带修订追踪
const status = await document.revPushStatus(
  'system',                          // domainId
  document.TYPE_CONTEST,             // docType
  contestDocId,                      // docId
  12345,                             // uid
  'detail',                          // key
  { pid: problemId, score: 100 },    // value
  detailId,                          // id（如果匹配则替换，否则推入）
);
```

#### `revSetStatus(domainId: string, docType: number, docId: ObjectId, uid: number, rev: number, args: any): Promise<StatusDoc>`

仅当当前 `rev` 匹配提供的值时设置状态字段，然后递增 `rev`。用于乐观锁。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `number` | — | 文档类型常量 |
| `docId` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| `rev` | `number` | — | 期望的当前修订号 |
| `args` | `any` | — | 要设置的字段 |
| **返回值** | `Promise<StatusDoc>` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<Doc>` | MongoDB `document` 集合 —— 存储所有文档记录 |
| `collStatus` | `Collection<StatusDoc>` | MongoDB `document.status` 集合 —— 存储每用户状态记录 |

---

## 备注

- `apply(ctx)` 注册数据库索引和 `domain/delete` 清理处理器。在应用启动时调用一次。
- 插入前触发 `document/add` 总线事件；更新前触发 `document/set` 总线事件。
- `push` 方法有两个重载：对象形式和内容形式。
