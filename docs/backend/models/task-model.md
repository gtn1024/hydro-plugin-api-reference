---
title: TaskModel
description: 后台任务队列模型，用于入队、消费和管理异步任务
source: packages/hydrooj/src/model/task.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/task.ts
import: "import { TaskModel } from 'hydrooj'"
---
# TaskModel

后台任务队列模型，用于入队、消费和管理异步任务。

`TaskModel` 是一个纯静态类。所有方法直接在类上调用（如 `TaskModel.add(...)`）。

---

## 类型导出

### `Task`

```typescript
interface Task {
    _id: ObjectId;
    type: string;
    subType?: string;
    priority: number;
    [key: string]: any;
}
```

引用自 `packages/hydrooj/src/interface.ts`。

---

## 方法

### 入队

#### `add(task: Partial<Task> & { type: string }): Promise<ObjectId>`

向队列插入单条任务。自动生成 `_id`，`priority` 默认为 `0`。返回插入的任务 ID。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `task` | `Partial<Task> & { type: string }` | — | 任务对象，`type` 必填 |
| **返回值** | `Promise<ObjectId>` | | 新任务 ID |

#### `addMany(tasks: Task[]): Promise<ObjectId[]>`

批量插入多条任务。返回插入的 ID 数组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tasks` | `Task[]` | — | 任务数组 |
| **返回值** | `Promise<ObjectId[]>` | | 新任务 ID 数组 |

### 读取

#### `get(_id: ObjectId): Promise<Task | null>`

通过 ID 获取单条任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 任务 ID |
| **返回值** | `Promise<Task \| null>` | | |

#### `count(query: Filter<Task>): Promise<number>`

返回匹配给定查询的任务数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<Task>` | — | 查询条件 |
| **返回值** | `Promise<number>` | | |

### 删除

#### `del(_id: ObjectId): Promise<DeleteResult>`

通过 ID 删除单条任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `_id` | `ObjectId` | — | 任务 ID |
| **返回值** | `Promise<DeleteResult>` | | |

#### `deleteMany(query: Filter<Task>): Promise<DeleteResult>`

删除匹配给定查询的所有任务。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<Task>` | — | 查询条件 |
| **返回值** | `Promise<DeleteResult>` | | |

### 消费

#### `getFirst(query: Filter<Task>): Promise<Task | null>`

原子性地查找并移除匹配查询中优先级最高的任务（按 `priority` 降序）。未找到任务或在 CI 模式下返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `Filter<Task>` | — | 匹配条件 |
| **返回值** | `Promise<Task \| null>` | | |

#### `consume(query: any, cb: (t: Task) => Promise<void>, destroyOnError?: boolean, concurrency?: number): Consumer`

创建一个 `Consumer` 实例，持续轮询匹配的任务并通过回调处理。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | `any` | — | 任务匹配条件 |
| `cb` | `(t: Task) => Promise<void>` | — | 任务处理回调 |
| `destroyOnError` | `boolean` | `true` | 出错时是否销毁消费者 |
| `concurrency` | `number` | `1` | 最大并发处理数 |
| **返回值** | `Consumer` | | 消费者实例 |

```typescript
// 创建一个并发度为 4 的任务消费者
const consumer = TaskModel.consume(
    { type: 'judge' },
    async (task) => {
        // 处理判题任务
        await processJudgeTask(task);
    },
    true,   // destroyOnError
    4,      // concurrency
);

// 停止消费
consumer.destroy();
```

---

## Consumer

由 `TaskModel.consume()` 返回。管理一个拾取任务并并发处理的轮询循环。

| 方法 | 说明 |
|------|------|
| `consume()` | 内部轮询循环。不应直接调用。 |
| `destroy()` | 停止消费者并取消轮询循环。在 `app/exit` 时也会自动调用。 |
| `setConcurrency(n: number)` | 更新并行处理任务的最大数量。 |
| `setQuery(query: string)` | 更新任务匹配的过滤查询。 |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection` | MongoDB `task` 集合 |

---

## 备注

- `getFirst` 是原子操作（使用 `findOneAndDelete`）——并发消费者安全。
- 任务失败时不会自动重试。`Consumer` 类捕获错误后可选销毁自身（`destroyOnError`）。
- `apply()` 函数还通过 `event` 集合和变更流（副本集）或轮询回退来设置跨进程事件广播。
- `Consumer` 的轮询间隔与可用并发槽位成反比。
- **索引**：在启动时通过 `apply()` 创建（仅在 `NODE_APP_INSTANCE=0` 时）——`{ type: 1, subType: 1, priority: -1 }` 优化 `getFirst` 查询。
