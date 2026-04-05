# RecordModel

评测记录模型，提供提交创建、评测任务分发、结果更新、重测/重置和提交统计。

> **源码**: [`packages/hydrooj/src/model/record.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/record.ts)
> **导出**: `import { RecordModel } from 'hydrooj';`

`RecordModel` 是一个纯静态类。所有方法直接在类上调用（如 `RecordModel.get(...)`）。

---

## 类型导出

### `RecordDoc`

主要记录文档类型。在 `packages/hydrooj/src/interface.ts` 中定义为基于 `RecordPayload`（来自 `@hydrooj/common`）的映射类型：

```typescript
type RecordDoc = {
    [K in keyof RecordPayload]: K extends 'hackTarget' | 'contest' ? ObjectId : RecordPayload[K];
} & {
    _id: ObjectId;
    notify?: boolean;
};
```

`RecordPayload`（继承 `RecordJudgeInfo`）中的关键字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `domainId` | `string` | 记录所属的域 |
| `pid` | `number` | 题目 ID |
| `uid` | `number` | 提交者用户 ID |
| `lang` | `string` | 提交语言 |
| `code` | `string` | 提交的源代码 |
| `status` | `number` | 评测状态（来自 `STATUS` 枚举） |
| `score` | `number` | 总分 |
| `time` | `number` | 总用时（毫秒） |
| `memory` | `number` | 总内存（KB） |
| `rejudged` | `boolean` | 是否为重测 |
| `progress` | `number?` | 评测进度百分比 |
| `source` | `string?` | 来源标识符 |
| `contest` | `ObjectId?` | 比赛 ID（或预测试/生成的哨兵值） |
| `input` | `string \| string[]?` | 预测试输入数据 |
| `hackTarget` | `ObjectId?` | Hack 提交的目标记录 ID |
| `files` | `Record<string, string>?` | 附加文件 |
| `judgeTexts` | `(string \| JudgeMessage)[]` | 评测输出消息 |
| `compilerTexts` | `string[]` | 编译器输出消息 |
| `testCases` | `Required<TestCase>[]` | 每个测试点的结果 |
| `judger` | `number` | 评测者用户 ID |
| `judgeAt` | `Date` | 评测时间戳 |
| `subtasks` | `Record<number, SubtaskResult>?` | 子任务结果 |

### `RecordStatDoc`

存储在 `record.stat` 集合中的统计文档，用于唯一提交/通过提交跟踪：

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | `ObjectId` | 与记录的 `_id` 相同 |
| `domainId` | `string` | 域 ID |
| `pid` | `number` | 题目 ID |
| `uid` | `number` | 用户 ID |
| `time` | `number` | 用时 |
| `memory` | `number` | 内存 |
| `length` | `number` | 代码长度 |
| `lang` | `string` | 语言 |

### `RecordHistoryDoc`

记录重置重测时归档到 `record.history` 中的评测结果：

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | `ObjectId` | 历史条目 ID |
| `rid` | `ObjectId` | 原始记录 ID |
| *(继承自 `RecordJudgeInfo`)* | | `score`、`time`、`memory`、`status`、`judgeTexts`、`compilerTexts`、`testCases`、`subtasks`、`judger`、`judgeAt` |

### `JudgeMeta`

传递给评测任务的元数据：

| 字段 | 类型 | 说明 |
|------|------|------|
| `problemOwner` | `number` | 题目拥有者 UID |
| `hackRejudge?` | `string` | Hack 重测标识符 |
| `rejudge?` | `boolean \| 'controlled'` | 重测模式 |
| `type?` | `string` | 评测类型提示 |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<RecordDoc>` | MongoDB 集合 `record` |
| `collStat` | `Collection<RecordStatDoc>` | MongoDB 集合 `record.stat` |
| `collHistory` | `Collection<RecordHistoryDoc>` | MongoDB 集合 `record.history` |
| `PROJECTION_LIST` | `(keyof RecordDoc)[]` | 列表视图中包含的字段（15 个字段） |
| `STAT_QUERY` | `object` | 统计查询的排序方式（`time`、`memory`、`length`、`date`） |
| `RECORD_PRETEST` | `ObjectId` | 预测试记录的哨兵 ID（`000...000`） |
| `RECORD_GENERATE` | `ObjectId` | 生成记录的哨兵 ID（`000...001`） |

---

## 方法

### 查找

#### `get(_id: ObjectId): Promise<RecordDoc | null>`

通过 ObjectId 获取单条记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 记录 ID |
| **返回值** | `Promise<RecordDoc \| null>` | | |

#### `get(domainId: string, _id: ObjectId): Promise<RecordDoc | null>`

通过 domainId 和 ObjectId 获取单条记录。若记录的 domainId 不匹配则返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `ObjectId` | — | 记录 ID |
| **返回值** | `Promise<RecordDoc \| null>` | | |

#### `getMulti(domainId: string, query: any, options?: FindOptions): Cursor<RecordDoc>`

查询多条记录。自动按 `domainId` 限定范围。返回 MongoDB 游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| `options` | `FindOptions` | — | 查询选项（排序、投影等） |
| **返回值** | `Cursor<RecordDoc>` | | 记录游标 |

#### `getMultiStat(domainId: string, query: any, sortBy?: any): Cursor<RecordStatDoc>`

查询多条统计文档。默认按 `_id` 降序排序。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| `sortBy` | `any` | — | 排序方式 |
| **返回值** | `Cursor<RecordStatDoc>` | | 统计文档游标 |

#### `getList(domainId: string, rids: ObjectId[], fields?: (keyof RecordDoc)[]): Promise<Record<string, Partial<RecordDoc>>>`

通过 ID 数组获取记录，返回以十六进制字符串 `_id` 为键的映射。对输入 ID 去重。可选择投影特定字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `rids` | `ObjectId[]` | — | 记录 ID 数组 |
| `fields` | `(keyof RecordDoc)[]` | — | 投影字段列表 |
| **返回值** | `Promise<Record<string, Partial<RecordDoc>>>` | | 以十六进制 ID 为键的记录映射 |

#### `count(domainId: string, query: any): Promise<number>`

统计匹配查询的记录数，按 `domainId` 限定范围。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `Promise<number>` | | 匹配数量 |

---

### 统计

#### `stat(domainId?: string): Promise<{ d5min, d1h, day, week, month, year, total }>`

获取各时间窗口的提交计数：5 分钟、1 小时、1 天、1 周、1 月、1 年和总计。可按域限定范围。

使用 `@ArgMethod` 装饰器修饰。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID（省略则统计全部） |
| **返回值** | `Promise<{ d5min, d1h, day, week, month, year, total }>` | | 各时间窗口计数 |

---

### 提交与评测

#### `add(domainId: string, pid: number, uid: number, lang: string, code: string, addTask: boolean, args?: any): Promise<ObjectId>`

创建新的评测记录。插入到 `coll` 中并可选分发评测任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 ID |
| `uid` | `number` | — | 提交者 UID |
| `lang` | `string` | — | 语言标识符 |
| `code` | `string` | — | 源代码 |
| `addTask` | `boolean` | — | 是否立即分发评测任务 |
| `args.type` | `'judge' \| 'rejudge' \| 'pretest' \| 'hack' \| 'generate'` | `'judge'` | 提交类型 |
| `args.contest` | `ObjectId?` | — | 比赛 ID |
| `args.input` | `string[]?` | — | 预测试输入数据 |
| `args.files` | `Record<string, string>?` | — | 附加文件 |
| `args.hackTarget` | `ObjectId?` | — | Hack 的目标记录 |
| `args.notify` | `boolean?` | — | 评测完成时是否发送通知 |
| **返回值** | `Promise<ObjectId>` | | 插入记录的 ObjectId |

```typescript
// 标准提交
const rid = await RecordModel.add(
  'system',
  1001,
  session.uid,
  'cpp',
  '#include <bits/stdc++.h>\nint main() {}',
  true,
);

// 预测试提交
const pretestRid = await RecordModel.add(
  'system',
  1001,
  session.uid,
  'cpp',
  code,
  true,
  { type: 'pretest', input: ['1 2\n', '3 4\n'] },
);

// Hack 提交
const hackRid = await RecordModel.add(
  'system',
  1001,
  session.uid,
  'cpp',
  hackInput,
  true,
  { type: 'hack', hackTarget: targetRid, contest: tid },
);
```

#### `judge(domainId: string, rids: MaybeArray<ObjectId> | RecordDoc, priority?: number, config?: ProblemConfigFile, meta?: Partial<JudgeMeta>): Promise<any>`

提交一条或多条记录进行评测。解析题目（跟随引用），删除这些记录的已有任务，并创建新的评测任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `rids` | `MaybeArray<ObjectId> \| RecordDoc` | — | 记录 ID 或文档 |
| `priority` | `number` | `0` | 任务优先级 |
| `config` | `ProblemConfigFile` | `{}` | 覆盖评测配置 |
| `meta` | `Partial<JudgeMeta>` | `{}` | 评测元数据 |
| **返回值** | `Promise<any>` | | |

```typescript
// 提交单条记录评测
await RecordModel.judge('system', rid);

// 重测多条记录（带自定义优先级和元数据）
await RecordModel.judge(
  'system',
  [rid1, rid2, rid3],
  1,
  {},
  { rejudge: true, problemOwner: uid },
);

// 使用自定义评测配置重测
await RecordModel.judge(
  'system',
  rid,
  0,
  { timeLimit: 5000, memoryLimit: 512 },
  { type: 'rejudge' },
);
```

#### `submissionPriority(uid: number, base?: number): Promise<number>`

计算用户的动态提交优先级。根据近期提交量和待处理任务降低优先级。用于限制高频提交者。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `uid` | `number` | — | 用户 ID |
| `base` | `number` | — | 基础优先级 |
| **返回值** | `Promise<number>` | | 计算后的优先级 |

---

### 更新

#### `update(domainId: string, _id: ObjectId | ObjectId[], $set?: any, $push?: any, $unset?: any, $inc?: any): Promise<RecordDoc | null>`

更新单条或多条记录。接受 MongoDB 更新操作符（`$set`、`$push`、`$unset`、`$inc`）。当 `_id` 为数组时执行 `updateMany` 并返回 `null`；否则返回更新后的文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `ObjectId \| ObjectId[]` | — | 记录 ID 或 ID 数组（数组时批量更新） |
| `$set` | `any` | — | 要设置的字段 |
| `$push` | `any` | — | 要追加的字段 |
| `$unset` | `any` | — | 要删除的字段 |
| `$inc` | `any` | — | 要增减的字段 |
| **返回值** | `Promise<RecordDoc \| null>` | | 更新后的文档（批量更新返回 `null`） |

#### `updateMulti(domainId: string, $match: any, $set?: any, $push?: any, $unset?: any): Promise<number>`

更新匹配过滤器的多条记录。返回修改的文档数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `$match` | `any` | — | MongoDB 匹配过滤器 |
| `$set` | `any` | — | 要设置的字段 |
| `$push` | `any` | — | 要追加的字段 |
| `$unset` | `any` | — | 要删除的字段 |
| **返回值** | `Promise<number>` | | 修改的文档数量 |

#### `reset(domainId: string, rid: ObjectId | ObjectId[], isRejudge: boolean): Promise<RecordDoc | null>`

重置一条或多条记录以进行重测。将当前评测结果归档到 `record.history`，将所有评测字段清除为默认值，并删除关联的统计条目和任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `rid` | `ObjectId \| ObjectId[]` | — | 记录 ID 或 ID 数组 |
| `isRejudge` | `boolean` | — | 是否为重测（`true` 时标记 `rejudged`） |
| **返回值** | `Promise<RecordDoc \| null>` | | 重置后的文档（批量重置返回 `null`） |

```typescript
// 重测单条记录
await RecordModel.reset('system', rid, true);
// 记录状态清除，旧结果归档到 record.history，随后可调用 judge 重新评测
await RecordModel.judge('system', rid, 0, {}, { rejudge: true });

// 批量重测某题目的所有记录
const rids = await RecordModel.getMulti('system', { pid: 1001 }).map(r => r._id).toArray();
await RecordModel.reset('system', rids, true);
await RecordModel.judge('system', rids);
```

---

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `record/change` | `RecordDoc` | 创建新记录时广播（通过 `add()`） |
| `record/judge` | `rdoc: RecordDoc, updated: boolean` | 评测完成时触发；对通过的提交更新 `record.stat` 并发送通知 |
