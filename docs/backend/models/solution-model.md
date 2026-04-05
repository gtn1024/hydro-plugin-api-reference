# SolutionModel

题解模型，用于管理题目题解、回复和投票。

> **源码**: [`packages/hydrooj/src/model/solution.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/solution.ts)
>
> **导出**: `import { SolutionModel } from 'hydrooj';`

`SolutionModel` 是一个纯静态类。所有方法直接在类上调用（如 `SolutionModel.add(...)`）。

所有方法委托给通用的 `document` 子系统，使用 `document.TYPE_PROBLEM_SOLUTION` 作为文档类型。

---

## 方法

### 增删改查

#### `add(domainId: string, pid: number, owner: number, content: string): Promise<ObjectId>`

为题目 `pid` 创建一条新题解。初始化时 `reply` 数组为空，`vote: 0`。返回插入文档的 `_id`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `pid` | `number` | — | 题目 ID |
| `owner` | `number` | — | 创建者 UID |
| `content` | `string` | — | 题解内容 |
| **返回值** | `Promise<ObjectId>` | | 新文档 ID |

#### `get(domainId: string, psid: ObjectId): Promise<Document>`

通过 ID 获取单条题解。未找到则抛出 `SolutionNotFoundError`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| **返回值** | `Promise<Document>` | | |

#### `getMany(domainId: string, query: any, sort: any, page: number, limit: number): Promise<Document[]>`

分页获取匹配 `query` 的题解列表，按 `sort` 排序。使用 `skip`/`limit` 进行分页。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `query` | `any` | — | 查询条件 |
| `sort` | `any` | — | 排序条件 |
| `page` | `number` | — | 页码（从 1 开始） |
| `limit` | `number` | — | 每页数量 |
| **返回值** | `Promise<Document[]>` | | |

#### `edit(domainId: string, psid: ObjectId, content: string): Promise<void>`

更新已有题解的内容。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| `content` | `string` | — | 新内容 |
| **返回值** | `Promise<void>` | | |

#### `del(domainId: string, psid: ObjectId): Promise<[void, void]>`

并行删除题解及其所有关联的状态记录（投票）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| **返回值** | `Promise<[void, void]>` | | |

#### `count(domainId: string, query: any): Promise<number>`

统计匹配给定查询的题解数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `query` | `any` | — | 查询条件 |
| **返回值** | `Promise<number>` | | |

### 列表

#### `getMulti(domainId: string, pid: number, query?: any): Cursor<Document>`

获取指定题目的所有题解。结果按 `vote` 降序排列（最高票优先）。可传入额外的查询过滤条件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `pid` | `number` | — | 题目 ID |
| `query` | `any` | — | 额外过滤条件 |
| **返回值** | `Cursor<Document>` | | |

#### `getByUser(domainId: string, uid: number): Cursor<Document>`

获取指定用户的所有题解。结果按 `_id` 降序排列（最新优先）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `uid` | `number` | — | 用户 UID |
| **返回值** | `Cursor<Document>` | | |

### 回复

#### `reply(domainId: string, psid: ObjectId, owner: number, content: string): Promise<void>`

为题解添加一条回复。追加到 `reply` 子文档数组中。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| `owner` | `number` | — | 回复者 UID |
| `content` | `string` | — | 回复内容 |
| **返回值** | `Promise<void>` | | |

#### `getReply(domainId: string, psid: ObjectId, psrid: ObjectId): Promise<Document>`

通过 ID 获取题解中的特定回复。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| `psrid` | `ObjectId` | — | 回复 ID |
| **返回值** | `Promise<Document>` | | |

#### `editReply(domainId: string, psid: ObjectId, psrid: ObjectId, content: string): Promise<void>`

更新已有回复的内容。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| `psrid` | `ObjectId` | — | 回复 ID |
| `content` | `string` | — | 新内容 |
| **返回值** | `Promise<void>` | | |

#### `delReply(domainId: string, psid: ObjectId, psrid: ObjectId): Promise<void>`

删除题解中的特定回复。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| `psrid` | `ObjectId` | — | 回复 ID |
| **返回值** | `Promise<void>` | | |

### 投票

#### `vote(domainId: string, psid: ObjectId, uid: number, value: number): Promise<Document>`

对题解进行投票或更新投票。跟踪每用户的投票状态——若用户已投票，则调整投票差值（不重复计数）。若新投票与现有投票相同则为空操作。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psid` | `ObjectId` | — | 题解 ID |
| `uid` | `number` | — | 投票者 UID |
| `value` | `number` | — | 投票值（正/负） |
| **返回值** | `Promise<Document>` | | |

#### `getListStatus(domainId: string, psids: ObjectId[], uid: number): Promise<Record<string, { docId: ObjectId, vote: number }>>`

批量获取当前用户对多条题解的投票状态。返回以题解 ID 字符串为键的映射。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `psids` | `ObjectId[]` | — | 题解 ID 数组 |
| `uid` | `number` | — | 用户 UID |
| **返回值** | `Promise<Record<string, { docId: ObjectId, vote: number }>>` | | |

---

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `problem/delete` | `domainId, pid` | 删除被删除题目的所有题解及其状态记录 |

---

## 备注

- 题解使用通用 `document` 子系统，文档类型为 `TYPE_PROBLEM_SOLUTION`，父类型为 `TYPE_PROBLEM`。
- `vote` 使用 `document.setStatus` 配合 `'before'` 策略检测先前的投票，然后通过 `document.inc` 调整题解的 `vote` 计数——防止重复计数。
- `del` 执行两个并行删除：文档本身和所有关联的状态记录。
