---
title: DiscussionModel
description: 讨论（论坛）模型，用于管理线程化讨论、回复、表情回应和讨论节点
source: packages/hydrooj/src/model/discussion.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/discussion.ts
---
# DiscussionModel

讨论（论坛）模型，用于管理线程化讨论、回复、嵌套尾隔回复、表情回应、讨论节点（分类）和父实体解析。

> **源码**: [`packages/hydrooj/src/model/discussion.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/discussion.ts)
>
> **导出**: `import { DiscussionModel } from 'hydrooj';`（可通过 `ctx.model.discussion` 访问）

DiscussionModel 是导出函数的普通模块（非类）。所有函数直接调用（如 `DiscussionModel.add(...)`）。

---

## 类型导出

### `DiscussionDoc`

继承 `Document` —— 讨论文档的形状。

### `Field`

```typescript
type Field = keyof DiscussionDoc
```

所有讨论文档字段名的联合类型。

---

## 常量

### `typeDisplay: Record<number, string>`

将文档类型常量映射到可读名称：`{ 10: 'problem', 20: 'node', 30: 'contest', 40: 'training' }`。

### `PROJECTION_LIST: Field[]`

列表视图中返回的字段：`_id`、`domainId`、`docType`、`docId`、`highlight`、`nReply`、`views`、`pin`、`updateAt`、`owner`、`parentId`、`parentType`、`title`、`hidden`。

### `PROJECTION_PUBLIC: Field[]`

详情视图中返回的字段 —— 在 `PROJECTION_LIST` 基础上增加 `content`、`edited`、`react`、`maintainer`、`lock`。

### `HISTORY_PROJECTION_PUBLIC: (keyof DiscussionHistoryDoc)[]`

历史视图中返回的字段：`title`、`content`、`docId`、`uid`、`time`。

---

## 方法

### 讨论 CRUD

#### `add(domainId: string, parentType: number, parentId: ObjectId | number | string, owner: number, title: string, content: string, ip: string | null = null, highlight: boolean, pin: boolean, hidden?: boolean): Promise<ObjectId>`

在父实体（题目、比赛、训练计划或节点）下创建新讨论。触发 `discussion/before-add` 和 `discussion/add` 总线事件。返回新讨论 ID。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `parentType` | `number` | — | 父实体类型常量 |
| `parentId` | `ObjectId \| number \| string` | — | 父实体 ID |
| `owner` | `number` | — | 创建者 UID |
| `title` | `string` | — | 讨论标题 |
| `content` | `string` | — | 讨论内容 |
| `ip` | `string \| null` | `null` | 创建者 IP 地址 |
| `highlight` | `boolean` | — | 是否高亮 |
| `pin` | `boolean` | — | 是否置顶 |
| `hidden` | `boolean` | — | 是否隐藏 |
| **返回值** | `Promise<ObjectId>` | | 新讨论 ID |

```typescript
// 在题目下创建讨论
const did = await DiscussionModel.add(
  'system',                          // domainId
  10,                                // parentType (TYPE_PROBLEM)
  problemId,                         // parentId
  12345,                             // owner
  '关于时间限制的疑问',               // title
  '这道题的 1s 时限是否合理？',       // content
  '127.0.0.1',                       // ip
  false,                             // highlight
  false,                             // pin
);

// 在讨论节点下创建置顶讨论
const pinnedDid = await DiscussionModel.add(
  'system',
  30,                                // parentType (TYPE_DISCUSSION_NODE)
  'general',                         // parentId (节点字符串 ID)
  12345,
  '版规公告',
  '请遵守社区规范...',
  undefined,                         // ip
  true,                              // highlight
  true,                              // pin
  false,                             // hidden
);
```

#### `get<T extends Field>(domainId: string, did: ObjectId, projection?: T[]): Promise<Pick<DiscussionDoc, T>>`

按 ID 获取单个讨论，支持指定字段投影。默认为 `PROJECTION_PUBLIC`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `projection` | `T[]` | `PROJECTION_PUBLIC` | 返回字段列表 |
| **返回值** | `Promise<Pick<DiscussionDoc, T>>` | | |

#### `edit(domainId: string, did: ObjectId, $set: Partial<DiscussionDoc>): Promise<DiscussionDoc>`

更新讨论字段。如果 `content` 有变更，自动在 `coll` 集合中插入历史记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `$set` | `Partial<DiscussionDoc>` | — | 要更新的字段 |
| **返回值** | `Promise<DiscussionDoc>` | | |

#### `del(domainId: string, did: ObjectId): Promise<void>`

删除讨论及所有关联的回复、状态和历史记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| **返回值** | `Promise<void>` | | |

#### `inc(domainId: string, did: ObjectId, key: NumberKeys<DiscussionDoc>, value: number): Promise<DiscussionDoc | null>`

原子性递增讨论上的数字字段（如 `views`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `key` | `NumberKeys<DiscussionDoc>` | — | 要递增的字段名 |
| `value` | `number` | — | 递增量 |
| **返回值** | `Promise<DiscussionDoc \| null>` | | |

#### `getMulti(domainId: string, query?: Filter<DiscussionDoc>, projection?: Field[]): FindCursor<DiscussionDoc>`

返回匹配查询的讨论游标，按 `pin` 降序然后 `docId` 降序排列。默认为 `PROJECTION_LIST`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<DiscussionDoc>` | — | 过滤条件 |
| `projection` | `Field[]` | `PROJECTION_LIST` | 返回字段列表 |
| **返回值** | `FindCursor<DiscussionDoc>` | | |

#### `count(domainId: string, query: Filter<DiscussionDoc>): Promise<number>`

返回匹配给定查询的讨论数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<DiscussionDoc>` | — | 过滤条件 |
| **返回值** | `Promise<number>` | | |

### 回复 CRUD

#### `addReply(domainId: string, did: ObjectId, owner: number, content: string, ip: string): Promise<ObjectId>`

为讨论添加回复。原子性递增 `nReply` 并更新父讨论的 `updateAt`。返回新回复 ID。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `owner` | `number` | — | 回复者 UID |
| `content` | `string` | — | 回复内容 |
| `ip` | `string` | — | 回复者 IP 地址 |
| **返回值** | `Promise<ObjectId>` | | 新回复 ID |

#### `getReply(domainId: string, drid: ObjectId): Promise<DiscussionReplyDoc | null>`

按 ID 获取单个回复。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 回复 ID |
| **返回值** | `Promise<DiscussionReplyDoc \| null>` | | |

#### `editReply(domainId: string, drid: ObjectId, content: string, uid: number, ip: string): Promise<DiscussionReplyDoc | null>`

更新回复内容。自动插入历史记录并设置 `edited: true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 回复 ID |
| `content` | `string` | — | 新内容 |
| `uid` | `number` | — | 编辑者 UID |
| `ip` | `string` | — | 编辑者 IP 地址 |
| **返回值** | `Promise<DiscussionReplyDoc \| null>` | | |

#### `delReply(domainId: string, drid: ObjectId): Promise<void>`

删除回复及所有尾隔回复和历史记录。原子性递减父讨论的 `nReply`。回复不存在时抛出 `DocumentNotFoundError`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 回复 ID |
| **返回值** | `Promise<void>` | | |

#### `getMultiReply(domainId: string, did: ObjectId): FindCursor<DiscussionReplyDoc>`

返回讨论的回复游标，按 `_id` 降序排列。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| **返回值** | `FindCursor<DiscussionReplyDoc>` | | |

#### `getListReply(domainId: string, did: ObjectId): Promise<DiscussionReplyDoc[]>`

以数组形式返回讨论的所有回复（`getMultiReply` 的便捷封装）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| **返回值** | `Promise<DiscussionReplyDoc[]>` | | |

### 尾隔回复

尾隔回复是嵌套在顶级回复中的二级回复，存储在 `DiscussionReplyDoc` 的 `reply` 数组字段中。

#### `addTailReply(domainId: string, drid: ObjectId, owner: number, content: string, ip: string): Promise<[DiscussionReplyDoc, ObjectId]>`

为顶级回复添加嵌套回复。同时更新父讨论的 `updateAt`。返回更新后的父回复文档和新尾隔回复 ID。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 父回复 ID |
| `owner` | `number` | — | 回复者 UID |
| `content` | `string` | — | 回复内容 |
| `ip` | `string` | — | 回复者 IP 地址 |
| **返回值** | `Promise<[DiscussionReplyDoc, ObjectId]>` | | 父回复文档和新尾隔回复 ID |

```typescript
// 向回复添加尾隔回复（二级嵌套）
const [updatedReply, tailReplyId] = await DiscussionModel.addTailReply(
  'system',                          // domainId
  replyId,                           // drid (父回复 ID)
  12345,                             // owner
  '感谢解答，非常清楚！',             // content
  '127.0.0.1',                       // ip
);
console.log('新尾隔回复 ID:', tailReplyId);
```

#### `getTailReply(domainId: string, drid: ObjectId, drrid: ObjectId): Promise<[DiscussionReplyDoc, DiscussionTailReplyDoc] | [null, null]>`

获取父回复中的指定尾隔回复。未找到时返回 `[null, null]`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 父回复 ID |
| `drrid` | `ObjectId` | — | 尾隔回复 ID |
| **返回值** | `Promise<[DiscussionReplyDoc, DiscussionTailReplyDoc] \| [null, null]>` | | |

#### `editTailReply(domainId: string, drid: ObjectId, drrid: ObjectId, content: string, uid: number, ip: string): Promise<DiscussionTailReplyDoc>`

更新尾隔回复内容。自动插入历史记录并设置 `edited: true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 父回复 ID |
| `drrid` | `ObjectId` | — | 尾隔回复 ID |
| `content` | `string` | — | 新内容 |
| `uid` | `number` | — | 编辑者 UID |
| `ip` | `string` | — | 编辑者 IP 地址 |
| **返回值** | `Promise<DiscussionTailReplyDoc>` | | |

#### `delTailReply(domainId: string, drid: ObjectId, drrid: ObjectId): Promise<[void, void]>`

删除尾隔回复及其关联的历史记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `drid` | `ObjectId` | — | 父回复 ID |
| `drrid` | `ObjectId` | — | 尾隔回复 ID |
| **返回值** | `Promise<[void, void]>` | | |

### 表情回应

#### `react(domainId: string, docType: keyof DocType, did: ObjectId, id: string, uid: number, reverse?: boolean): Promise<[any, any]>`

切换用户对讨论或回复的表情回应（`id`）。如果 `reverse` 为 true，则移除回应。返回 `[updatedDoc, statusDoc]`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `keyof DocType` | — | 文档类型 |
| `did` | `ObjectId` | — | 讨论/回复 ID |
| `id` | `string` | — | emoji ID |
| `uid` | `number` | — | 用户 ID |
| `reverse` | `boolean` | `false` | 为 `true` 时移除回应 |
| **返回值** | `Promise<[any, any]>` | | `[updatedDoc, statusDoc]` |

```typescript
// 对讨论点赞（emoji ID "like"）
const [doc, status] = await DiscussionModel.react(
  'system',                          // domainId
  21,                                // docType (TYPE_DISCUSSION)
  discussionId,                      // did
  'like',                            // id (emoji ID)
  12345,                             // uid
);

// 取消点赞
await DiscussionModel.react(
  'system',
  21,
  discussionId,
  'like',
  12345,
  true,                              // reverse = true → 移除
);
```

#### `getReaction(domainId: string, docType: keyof DocType, did: ObjectId, uid: number): Promise<Record<string, number>>`

返回用户对文档的回应状态，以 emoji ID 到值的映射返回。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docType` | `keyof DocType` | — | 文档类型 |
| `did` | `ObjectId` | — | 文档 ID |
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<Record<string, number>>` | | emoji ID → 值的映射 |

### 历史

#### `getHistory(domainId: string, docId: ObjectId, query?: Filter<DiscussionHistoryDoc>, projection?: (keyof DiscussionHistoryDoc)[]): Promise<DiscussionHistoryDoc[]>`

返回讨论或回复的编辑历史记录，按 `time` 降序排列。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docId` | `ObjectId` | — | 讨论/回复 ID |
| `query` | `Filter<DiscussionHistoryDoc>` | — | 过滤条件 |
| `projection` | `(keyof DiscussionHistoryDoc)[]` | — | 返回字段列表 |
| **返回值** | `Promise<DiscussionHistoryDoc[]>` | | |

### 用户状态

#### `setStar(domainId: string, did: ObjectId, uid: number, star: boolean): Promise<void>`

设置或清除用户对讨论的星标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `uid` | `number` | — | 用户 ID |
| `star` | `boolean` | — | `true` 星标，`false` 取消 |
| **返回值** | `Promise<void>` | | |

#### `getStatus(domainId: string, did: ObjectId, uid: number): Promise<any>`

获取用户对讨论的状态记录（包括星标、回应等）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<any>` | | |

#### `setStatus(domainId: string, did: ObjectId, uid: number, $set: any): Promise<void>`

覆盖用户对讨论的状态字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 讨论 ID |
| `uid` | `number` | — | 用户 ID |
| `$set` | `any` | — | 要设置的状态字段 |
| **返回值** | `Promise<void>` | | |

### 节点（分类）

讨论节点作为顶层分类，用于组织讨论。

#### `addNode(domainId: string, _id: string, category: string, args?: any): Promise<any>`

创建具有指定 ID 和分类名称的讨论节点。可选 `args` 用于附加字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `string` | — | 节点 ID |
| `category` | `string` | — | 分类名称 |
| `args` | `any` | — | 附加字段 |
| **返回值** | `Promise<any>` | | |

#### `getNode(domainId: string, _id: string): Promise<any>`

按字符串 ID 获取单个讨论节点。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `string` | — | 节点 ID |
| **返回值** | `Promise<any>` | | |

#### `getNodes(domainId: string): Promise<any[]>`

以数组形式返回域的所有讨论节点。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| **返回值** | `Promise<any[]>` | | |

#### `flushNodes(domainId: string): Promise<any>`

删除域的所有讨论节点。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| **返回值** | `Promise<any>` | | |

### 虚拟节点（父实体）

虚拟节点解析讨论所附属的父实体（题目、比赛、训练计划或讨论节点）。

#### `getVnode(domainId: string, type: number, id: string, uid?: number): Promise<any>`

解析讨论的父实体。处理题目（按数字 ID）、比赛/训练计划（按 ObjectId）和讨论节点（按字符串 ID）。可选地为指定用户填充 `attend` 状态。未找到时抛出 `DiscussionNodeNotFoundError`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `type` | `number` | — | 父实体类型 |
| `id` | `string` | — | 父实体 ID |
| `uid` | `number` | — | 用于填充 `attend` 状态的用户 ID |
| **返回值** | `Promise<any>` | | |

#### `getListVnodes(domainId: string, ddocs: any, getHidden?: boolean, assign?: string[]): Promise<Record<number, Record<string, any>>>`

批量解析多个讨论的父实体。返回嵌套映射 `{ [parentType]: { [parentId]: vnode } }`。默认过滤隐藏节点和受作业组限制的项目。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `ddocs` | `any` | — | 讨论文档数组 |
| `getHidden` | `boolean` | `false` | 是否包含隐藏节点 |
| `assign` | `string[]` | — | 作业组限制过滤 |
| **返回值** | `Promise<Record<number, Record<string, any>>>` | | |

#### `checkVNodeVisibility(type: number, vnode: any, user: User): boolean`

用户被允许查看父实体时返回 `true`。检查隐藏题目可见性和比赛/训练计划的作业组限制。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `number` | — | 父实体类型 |
| `vnode` | `any` | — | 虚拟节点对象 |
| `user` | `User` | — | 当前用户 |
| **返回值** | `boolean` | | 是否可见 |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<DiscussionHistoryDoc>` | MongoDB `discussion.history` 集合 —— 存储编辑历史记录 |

---

## 备注

- 讨论是文档类型模型（`TYPE_DISCUSSION = 21`）。CRUD 和状态操作委托给共享的 `document` 模块。
- 模型支持三级嵌套：**讨论** → **回复** → **尾隔回复**。
- 所有内容变更（讨论编辑、回复编辑、尾隔回复编辑）会自动在 `discussion.history` 集合中插入历史记录。
- `add()` 触发总线事件（`discussion/before-add`、`discussion/add`），使插件可以拦截或响应讨论创建。
- `apply(ctx)` 注册生命周期钩子：题目删除时级联删除关联讨论，题目编辑时同步 `hidden` 状态到关联讨论。
