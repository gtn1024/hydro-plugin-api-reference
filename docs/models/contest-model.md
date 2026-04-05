# ContestModel

比赛模型，用于管理多种评分规则（ACM/ICPC、OI、IOI、IOI Strict、Ledo、Assignment）的比赛、排行榜生成、气球通知、答疑和打印任务。

> **源码**: [`packages/hydrooj/src/model/contest.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/contest.ts)
> **导出**: `import * as contest from 'hydrooj/model/contest';`（可通过 `ctx.model.contest` 访问）

ContestModel 是导出函数的普通模块（非类）。所有函数直接调用。它将 CRUD 和状态操作委托给共享的 `document` 模块，使用 `TYPE_CONTEST = 30`。

---

## 类型导出

### `PrintTaskStatus`

枚举值：`pending`、`printing`、`printed`、`failed`。用于比赛打印任务状态追踪。

---

## 常量

### `RULES: ContestRules`

将规则名映射到其规则定义的对象。键：`acm`、`oi`、`homework`、`ioi`、`ledo`、`strictioi`。每个规则定义评分逻辑、排行榜渲染、可见性控制和记录投影行为。

### `buildContestRule<T>(def): ContestRule<T>`

工厂函数，从部分定义构建新的比赛规则，继承并绑定基础规则中所有未指定的函数。内部用于创建内置规则。

---

## 方法

### 状态谓词

根据比赛的 `beginAt`/`endAt` 时间戳评估当前阶段的工具函数。

#### `isNew(tdoc: Tdoc, days?: number): boolean`

比赛在距今 `days` 天之后开始时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `days` | `number` | `1` | 天数阈值 |
| **返回值** | `boolean` | | |

#### `isUpcoming(tdoc: Tdoc, days?: number): boolean`

比赛在 `days` 天内开始但尚未开始时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `days` | `number` | `7` | 天数阈值 |
| **返回值** | `boolean` | | |

#### `isNotStarted(tdoc: Tdoc): boolean`

当前时间早于 `tdoc.beginAt` 时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| **返回值** | `boolean` | | |

#### `isOngoing(tdoc: Tdoc, tsdoc?: any): boolean`

当前时间在 `beginAt` 和 `endAt` 之间时返回 `true`。对于限时比赛，还会检查用户的 `startAt` 未超过允许的时长。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `tsdoc` | `any` | — | 用户比赛状态文档 |
| **返回值** | `boolean` | | |

#### `isDone(tdoc: Tdoc, tsdoc?: any): boolean`

比赛已结束时返回 `true`。对于限时比赛，还会考虑用户的 `startAt` 加上时长。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `tsdoc` | `any` | — | 用户比赛状态文档 |
| **返回值** | `boolean` | | |

#### `isLocked(tdoc: Tdoc, time?: Date): boolean`

排行榜已锁定（`lockAt` 已设置且已过）且尚未解锁时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `time` | `Date` | `new Date()` | 用于比较的时间点 |
| **返回值** | `boolean` | | |

#### `isExtended(tdoc: Tdoc): boolean`

当前时间在罚时/延期时段（在 `penaltySince` 和 `endAt` 之间）时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| **返回值** | `boolean` | | |

#### `statusText(tdoc: Tdoc, tsdoc?: any): string`

返回可读的状态字符串：`'New'`、`'Ready (☆▽☆)'`、`'Live...'` 或 `'Done'`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `tsdoc` | `any` | — | 用户比赛状态文档 |
| **返回值** | `string` | | |

---

### CRUD

#### `add(domainId: string, title: string, content: string, owner: number, rule: string, beginAt?: Date, endAt?: Date, pids?: number[], rated?: boolean, data?: any): Promise<ObjectId>`

创建新比赛。验证规则存在且 `beginAt < endAt`。触发 `contest/before-add` 和 `contest/add` 总线事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `title` | `string` | — | 比赛标题 |
| `content` | `string` | — | 比赛描述/正文 |
| `owner` | `number` | — | 创建者 UID |
| `rule` | `string` | — | 比赛规则名（`acm`、`oi`、`ioi` 等） |
| `beginAt` | `Date` | — | 开始时间 |
| `endAt` | `Date` | — | 结束时间 |
| `pids` | `number[]` | — | 题目 ID 列表 |
| `rated` | `boolean` | — | 是否为 rated 比赛 |
| `data` | `any` | — | 附加数据（如比赛特定配置） |
| **返回值** | `Promise<ObjectId>` | | 新比赛 ID |

```typescript
// 创建 ACM 规则的比赛
const tid = await contest.add(
  'system',
  '2024 校内选拔赛',
  '## 比赛说明\n...',
  session.uid,
  'acm',
  new Date('2024-06-01T09:00:00'),
  new Date('2024-06-01T14:00:00'),
  [1001, 1002, 1003, 1004, 1005],
  true,
);
```

#### `edit(domainId: string, tid: ObjectId, $set: Partial<Tdoc>): Promise<Tdoc>`

更新比赛字段。如果规则有变更则验证。触发 `contest/before-edit` 和 `contest/edit` 总线事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `$set` | `Partial<Tdoc>` | — | 要更新的字段 |
| **返回值** | `Promise<Tdoc>` | | 更新后的比赛文档 |

```typescript
// 延长比赛结束时间
const updated = await contest.edit(
  'system',
  tid,
  { endAt: new Date('2024-06-01T15:00:00') },
);

// 修改比赛规则并更新题目列表
await contest.edit('system', tid, {
  rule: 'oi',
  pids: [1001, 1002, 1003],
});
```

#### `del(domainId: string, tid: ObjectId): Promise<void>`

删除比赛及所有关联的用户状态。触发 `contest/del` 总线事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| **返回值** | `Promise<void>` | | |

#### `get(domainId: string, tid: ObjectId): Promise<Tdoc>`

按 ID 获取单个比赛。未找到时抛出 `ContestNotFoundError`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| **返回值** | `Promise<Tdoc>` | | 比赛文档 |

#### `getMulti(domainId: string, query?: any): FindCursor<Tdoc>`

返回匹配查询的比赛游标，按 `beginAt` 降序排列。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `FindCursor<Tdoc>` | | 比赛游标 |

#### `getRelated(domainId: string, pid: number, rule?: string): Promise<Tdoc[]>`

查找包含指定题目（`pids` 中包含 `pid`）的比赛。除非指定了 `rule`，否则过滤隐藏规则。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 ID |
| `rule` | `string` | — | 按规则过滤（如 `'acm'`） |
| **返回值** | `Promise<Tdoc[]>` | | 关联的比赛列表 |

#### `count(domainId: string, query: any): Promise<number>`

返回匹配查询的比赛数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `Promise<number>` | | 匹配数量 |

---

### 状态管理

#### `getStatus(domainId: string, tid: ObjectId, uid: number): Promise<Tsdoc | null>`

获取单个用户的比赛状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<Tsdoc \| null>` | | 用户状态或 `null` |

#### `getMultiStatus(domainId: string, query: any): FindCursor`

返回匹配查询的比赛状态游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `FindCursor` | | 状态游标 |

#### `getListStatus(domainId: string, uid: number, tids: ObjectId[]): Promise<Record<string, Tsdoc>>`

批量获取指定用户多场比赛的状态，以 `tid.toHexString()` 为键的映射返回。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `number` | — | 用户 ID |
| `tids` | `ObjectId[]` | — | 比赛 ID 数组 |
| **返回值** | `Promise<Record<string, Tsdoc>>` | | 以十六进制 ID 为键的状态映射 |

#### `setStatus(domainId: string, tid: ObjectId, uid: number, $set: any): Promise<void>`

覆盖用户在指定比赛上的状态字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `uid` | `number` | — | 用户 ID |
| `$set` | `any` | — | 要设置的状态字段 |
| **返回值** | `Promise<void>` | | |

#### `updateStatus(domainId: string, tid: ObjectId, uid: number, rid: ObjectId, pid: number, opts?: any): Promise<Tsdoc>`

推入新的日志条目（提交结果），并使用比赛规则的 `stat` 函数重新计算用户统计。使用基于修订号的状态更新以确保并发安全。同时对通过的提交触发气球创建。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `uid` | `number` | — | 用户 ID |
| `rid` | `ObjectId` | — | 评测记录 ID |
| `pid` | `number` | — | 题目 ID |
| `opts` | `any` | — | 额外选项 |
| **返回值** | `Promise<Tsdoc>` | | 更新后的用户状态 |

```typescript
// 提交通过后更新比赛状态
const tsdoc = await contest.updateStatus(
  'system',
  tid,
  session.uid,
  rid,
  1001,
  { status: STATUS.STATUS_ACCEPTED, score: 100 },
);
```

#### `countStatus(domainId: string, query: any): Promise<number>`

返回匹配查询的比赛状态数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `Promise<number>` | | 匹配数量 |

#### `attend(domainId: string, tid: ObjectId, uid: number, payload?: any): Promise<{}>`

为用户报名比赛。已报名时抛出 `ContestAlreadyAttendedError`。使用 `cappedIncStatus` 原子性防止重复报名。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `uid` | `number` | — | 用户 ID |
| `payload` | `any` | — | 附加报名信息 |
| **返回值** | `Promise<{}>` | | |

```typescript
// 用户报名比赛
await contest.attend('system', tid, session.uid);

// 带附加信息报名（如队伍名）
await contest.attend('system', tid, session.uid, {
  teamName: '测试小队',
});
```

#### `getAndListStatus(domainId: string, tid: ObjectId): Promise<[Tdoc, Tsdoc[]]>`

获取比赛文档及按规则的 `statusSort` 排序的所有用户状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| **返回值** | `Promise<[Tdoc, Tsdoc[]]>` | | 比赛文档和排序后的状态列表 |

#### `recalcStatus(domainId: string, tid: ObjectId): Promise<Tsdoc[]>`

使用比赛规则的 `stat` 函数从日志重新计算所有用户状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| **返回值** | `Promise<Tsdoc[]>` | | 重新计算后的状态列表 |

#### `unlockScoreboard(domainId: string, tid: ObjectId): Promise<void>`

解锁已锁定的排行榜，设置 `unlocked: true` 并重新计算所有状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| **返回值** | `Promise<void>` | | |

---

### 排行榜

检查用户是否可以查看某些比赛信息的函数。均使用 `this` 上下文，包含 `{ user: User }`。

#### `canViewHiddenScoreboard(this: { user }, tdoc: Tdoc): boolean`

用户拥有比赛或具有 `PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD`（作业为 `PERM_VIEW_HOMEWORK_HIDDEN_SCOREBOARD`）时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `this` | `{ user: User }` | — | 上下文，包含当前用户 |
| `tdoc` | `Tdoc` | — | 比赛文档 |
| **返回值** | `boolean` | | |

#### `canShowRecord(this: { user }, tdoc: Tdoc, allowPermOverride?: boolean): boolean`

比赛规则允许在当前时间显示所有记录，或用户具有排行榜覆盖权限时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `this` | `{ user: User }` | — | 上下文，包含当前用户 |
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `allowPermOverride` | `boolean` | `true` | 是否允许权限覆盖 |
| **返回值** | `boolean` | | |

#### `canShowSelfRecord(this: { user }, tdoc: Tdoc, allowPermOverride?: boolean): boolean`

比赛规则允许显示用户自己的记录，或用户具有排行榜覆盖权限时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `this` | `{ user: User }` | — | 上下文，包含当前用户 |
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `allowPermOverride` | `boolean` | `true` | 是否允许权限覆盖 |
| **返回值** | `boolean` | | |

#### `canShowScoreboard(this: { user }, tdoc: Tdoc, allowPermOverride?: boolean): boolean`

比赛规则允许显示排行榜，或用户具有排行榜覆盖权限时返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `this` | `{ user: User }` | — | 上下文，包含当前用户 |
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `allowPermOverride` | `boolean` | `true` | 是否允许权限覆盖 |
| **返回值** | `boolean` | | |

#### `getScoreboard(this: Handler, domainId: string, tid: ObjectId, config: any): Promise<[Tdoc, ScoreboardRow[], BaseUserDict, ProblemDict]>`

使用规则的 `scoreboard` 函数构建完整排行榜。排行榜不可见时抛出 `ContestScoreboardHiddenError`。触发 `contest/scoreboard` 总线事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `this` | `Handler` | — | 请求处理上下文 |
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `config` | `any` | — | 排行榜配置选项 |
| **返回值** | `Promise<[Tdoc, ScoreboardRow[], BaseUserDict, ProblemDict]>` | | 比赛文档、排行榜行、用户字典、题目字典 |

```typescript
// 获取完整排行榜
const [tdoc, rows, udict, pdict] = await contest.getScoreboard.call(
  handler,
  'system',
  tid,
  { showDisplayName: true },
);

// rows 为排行数据，udict 为用户信息字典，pdict 为题目信息字典
for (const row of rows) {
  console.log(row.rank, udict[row.uid]?.uname, row.score);
}
```

---

### 气球

ACM 风格首 A 通知的气球管理。

#### `addBalloon(domainId: string, tid: ObjectId, uid: number, rid: ObjectId, pid: number): Promise<ObjectId | null>`

为通过的提交添加气球。判断是否为该题目的首次通过。触发 `contest/balloon` 事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `uid` | `number` | — | 用户 ID |
| `rid` | `ObjectId` | — | 评测记录 ID |
| `pid` | `number` | — | 题目 ID |
| **返回值** | `Promise<ObjectId \| null>` | | 气球 ID，非首次通过返回 `null` |

#### `getBalloon(domainId: string, tid: ObjectId, _id: ObjectId): Promise<BalloonDoc>`

按 ID 获取单个气球。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `_id` | `ObjectId` | — | 气球 ID |
| **返回值** | `Promise<BalloonDoc>` | | 气球文档 |

#### `getMultiBalloon(domainId: string, tid: ObjectId, query?: any): FindCursor`

返回比赛的气球游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `FindCursor` | | 气球游标 |

#### `updateBalloon(domainId: string, tid: ObjectId, _id: ObjectId, $set: any): Promise<BalloonDoc>`

更新气球字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `_id` | `ObjectId` | — | 气球 ID |
| `$set` | `any` | — | 要更新的字段 |
| **返回值** | `Promise<BalloonDoc>` | | 更新后的气球文档 |

---

### 答疑

比赛答疑（提问/回答）管理，以 `TYPE_CONTEST_CLARIFICATION` 类型的子文档存储。

#### `addClarification(domainId: string, tid: ObjectId, owner: number, content: string, ip: string, subject?: string): Promise<ObjectId>`

在比赛上创建新的答疑问题。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `owner` | `number` | — | 提问者 UID |
| `content` | `string` | — | 问题内容 |
| `ip` | `string` | — | 提问者 IP 地址 |
| `subject` | `string` | — | 答疑主题 |
| **返回值** | `Promise<ObjectId>` | | 答疑 ID |

#### `addClarificationReply(domainId: string, did: ObjectId, owner: number, content: string, ip: string): Promise<void>`

为已有答疑追加回复。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 答疑 ID |
| `owner` | `number` | — | 回复者 UID |
| `content` | `string` | — | 回复内容 |
| `ip` | `string` | — | 回复者 IP 地址 |
| **返回值** | `Promise<void>` | | |

#### `getClarification(domainId: string, did: ObjectId): Promise<ClarificationDoc>`

按 ID 获取单个答疑。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `did` | `ObjectId` | — | 答疑 ID |
| **返回值** | `Promise<ClarificationDoc>` | | 答疑文档 |

#### `getMultiClarification(domainId: string, tid: ObjectId, owner?: number): Promise<ClarificationDoc[]>`

列出比赛的答疑。如果指定 `owner`，则仅包含该用户可见的答疑（owner `$in: [owner, 0]`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `owner` | `number` | — | 过滤可见答疑的用户 ID |
| **返回值** | `Promise<ClarificationDoc[]>` | | 答疑列表 |

---

### 打印任务

现场比赛的打印任务管理。使用 `TYPE_CONTEST_PRINT`。

#### `addPrintTask(domainId: string, tid: ObjectId, uid: number, name: string, content: string): Promise<ObjectId>`

创建 `pending` 状态的新打印任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `uid` | `number` | — | 提交者 UID |
| `name` | `string` | — | 打印任务名称 |
| `content` | `string` | — | 打印内容 |
| **返回值** | `Promise<ObjectId>` | | 打印任务 ID |

#### `updatePrintTask(domainId: string, tid: ObjectId, taskId: ObjectId, $set: any): Promise<boolean>`

更新打印任务字段。修改成功返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `taskId` | `ObjectId` | — | 打印任务 ID |
| `$set` | `any` | — | 要更新的字段 |
| **返回值** | `Promise<boolean>` | | 是否修改成功 |

#### `allocatePrintTask(domainId: string, tid: ObjectId): Promise<PrintDoc | null>`

原子性地领取下一个待处理打印任务，将其状态设为 `printing`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| **返回值** | `Promise<PrintDoc \| null>` | | 打印任务文档或 `null`（无待处理任务） |

#### `getMultiPrintTask(domainId: string, tid: ObjectId, query?: any): FindCursor`

返回比赛的打印任务游标，按 `_id` 升序排列。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `tid` | `ObjectId` | — | 比赛 ID |
| `query` | `any` | — | MongoDB 查询过滤器 |
| **返回值** | `FindCursor` | | 打印任务游标 |

---

### 其他

#### `applyProjection(tdoc: Tdoc, rdoc: RecordDoc, udoc: User): RecordDoc`

应用比赛规则的 `applyProjection`，在比赛进行期间脱敏记录中的敏感字段（分数、时间、内存、测试用例等）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tdoc` | `Tdoc` | — | 比赛文档 |
| `rdoc` | `RecordDoc` | — | 评测记录文档 |
| `udoc` | `User` | — | 用户文档 |
| **返回值** | `RecordDoc` | | 脱敏后的记录文档 |

#### `apply(ctx: Context): Promise<void>`

生命周期钩子。注册 `contest/balloon` 事件监听器（发送首 A 消息）并确保气球集合上的数据库索引。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ctx` | `Context` | — | 插件上下文 |
| **返回值** | `Promise<void>` | | |

---

## 备注

- 比赛是文档类型模型（`TYPE_CONTEST = 30`）。CRUD 和状态操作委托给共享的 `document` 模块。
- 六种内置规则：`acm`（XCPC）、`oi`、`ioi`、`strictioi`、`ledo`、`homework`（隐藏）。每个规则定义 `stat`、`scoreboard`、`scoreboardRow`、`scoreboardHeader`、`showScoreboard`、`showRecord`、`showSelfRecord`、`applyProjection` 和 `check`。
- `updateStatus` 使用基于修订号的状态（`revPushStatus` + `revSetStatus`）实现日志更新的乐观并发控制。
- `attend` 使用 `cappedIncStatus`（上限为 1）原子性防止重复报名；重新抛出为 `ContestAlreadyAttendedError`。
- `add` 和 `edit` 触发前/后总线事件（`contest/before-add`、`contest/add`、`contest/before-edit`、`contest/edit`）。
- 答疑使用 `TYPE_CONTEST_CLARIFICATION` 作为独立 docType，通过父引用关联比赛。
- 打印任务使用 `TYPE_CONTEST_PRINT` 作为独立 docType，通过父引用关联比赛。
