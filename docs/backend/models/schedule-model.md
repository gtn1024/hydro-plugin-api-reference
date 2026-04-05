---
title: ScheduleModel
description: 定时任务模型，用于创建、查询和删除延迟或周期性任务
source: packages/hydrooj/src/model/schedule.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/schedule.ts
---
# ScheduleModel

定时任务模型，用于创建、查询和删除延迟或周期性任务。

> **源码**: [`packages/hydrooj/src/model/schedule.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/schedule.ts)
>
> **导出**: `import { ScheduleModel } from 'hydrooj';`

`ScheduleModel` 是一个纯静态类。所有方法直接在类上调用（如 `ScheduleModel.add(...)`）。

---

## 类型导出

### `Schedule`

定义在 `packages/hydrooj/src/interface.ts` 中：

```typescript
interface Schedule {
    _id: ObjectId;
    type: string;
    subType?: string;
    executeAfter: Date;
    interval?: [number, moment.UnitOfTime]; // 周期性间隔（moment 时间单位参数）
    [key: string]: any;
}
```

索引签名允许根据任务类型携带任意字段（如 `domainId`、自定义负载数据）。

---

## 方法

### 创建

#### `add(task: Partial<Schedule> & { type: string }): Promise<ObjectId>`

插入一条新的定时任务。若省略 `executeAfter`，默认为 `new Date()`（立即执行）。返回插入文档的 `_id`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `task` | `Partial<Schedule> & { type: string }` | — | 任务定义。必须包含 `type` |
| **返回值** | `Promise<ObjectId>` | | 新文档的 `_id` |

### 查询

#### `get(_id: ObjectId): Promise<Schedule | null>`

通过 `_id` 查找单条定时任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 任务 `_id` |
| **返回值** | `Promise<Schedule \| null>` | | |

#### `count(query: Filter<Schedule>): Promise<number>`

统计匹配给定过滤条件的文档数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<Schedule>` | — | MongoDB 过滤条件 |
| **返回值** | `Promise<number>` | | |

#### `getFirst(query: Filter<Schedule>): Promise<Schedule | null>`

原子性地查找并删除匹配过滤条件中最早到期的任务（`executeAfter < now`）。若任务设有 `interval`，则自动重新调度——将 `executeAfter` 推进一个间隔周期。若无到期任务（或在 CI 环境中运行）则返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<Schedule>` | — | MongoDB 过滤条件 |
| **返回值** | `Promise<Schedule \| null>` | | |

```typescript
// 消费到期任务
const task = await ScheduleModel.getFirst({ type: 'judge' });
if (task) {
  // 处理任务...
  // 若 task.interval 存在，已自动重新调度
}
```

### 删除

#### `del(_id: ObjectId): Promise<DeleteResult>`

通过 `_id` 删除单条定时任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 任务 `_id` |
| **返回值** | `Promise<DeleteResult>` | | |

#### `deleteMany(query: Filter<Schedule>): Promise<DeleteResult>`

删除匹配给定过滤条件的所有定时任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<Schedule>` | — | MongoDB 过滤条件 |
| **返回值** | `Promise<DeleteResult>` | | |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<Schedule>` | MongoDB `schedule` 集合 |

---

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `domain/delete` | `domainId` | 清理被删除域的所有定时任务 |
| `task/daily` | — | 插件运行每日维护逻辑的钩子 |
| `task/daily/finish` | `pref` | 每日任务完成后触发，负载包含计时统计 |

---

## 备注

- `apply()` 函数注册了一个内置的 `task.daily` 工作处理器，用于运行清理（预测试/生成记录）、RP 重算、题目统计和可选的更新检查。
- 每日任务在首次启动时自动创建（次日凌晨 03:00），以 1 天为周期循环执行。
- `getFirst` 使用 `findOneAndDelete` 实现原子消费——并发工作者安全。
- 复合索引 `{ type: 1, subType: 1, executeAfter: -1 }` 用于按类型高效查找任务。
