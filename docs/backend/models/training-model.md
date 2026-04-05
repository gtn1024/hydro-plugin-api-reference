---
title: TrainingModel
description: 训练计划（课程）模型，用于管理 DAG 结构的训练计划和进度跟踪
source: packages/hydrooj/src/model/training.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/training.ts
---
# TrainingModel

训练计划（课程）模型，用于管理 DAG 结构的训练计划、用户注册和进度跟踪。

> **源码**: [`packages/hydrooj/src/model/training.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/training.ts)
>
> **导出**: `import { TrainingModel } from 'hydrooj';`（可通过 `ctx.model.training` 访问）

与 `TaskModel` 不同，`TrainingModel` 是一个纯模块，导出函数而非类。所有函数直接调用（如 `TrainingModel.add(...)`）。

---

## 类型导出

### `TrainingNode`

```typescript
interface TrainingNode {
    _id: number;
    title: string;
    requireNids: number[];
    pids: number[];
}
```

### `TrainingDoc`

```typescript
interface TrainingDoc extends Omit<Tdoc, 'docType'> {
    docType: 40; // document.TYPE_TRAINING
    description: string;
    pin?: number;
    dag: TrainingNode[];
}
```

引用自 `packages/hydrooj/src/interface.ts`。

---

## 方法

### 增删改查

#### `add(domainId: string, title: string, content: string, owner: number, dag?: TrainingNode[], description?: string, pin?: number): Promise<TrainingDoc>`

创建一条新训练计划。默认值：`dag=[]`、`description=''`、`pin=0`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `title` | `string` | — | 训练计划标题 |
| `content` | `string` | — | 训练计划内容 |
| `owner` | `number` | — | 创建者 UID |
| `dag` | `TrainingNode[]` | `[]` | DAG 节点数组 |
| `description` | `string` | `''` | 描述文本 |
| `pin` | `number` | `0` | 置顶权重 |
| **返回值** | `Promise<TrainingDoc>` | | 新训练计划文档 |

#### `edit(domainId: string, tid: ObjectId, $set: Partial<TrainingDoc>): Promise<void>`

更新匹配给定部分文档的训练计划字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tid` | `ObjectId` | — | 训练计划 ID |
| `$set` | `Partial<TrainingDoc>` | — | 要更新的字段 |
| **返回值** | `Promise<void>` | | |

#### `del(domainId: string, tid: ObjectId): Promise<[void, void]>`

删除训练计划及其所有关联的用户状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tid` | `ObjectId` | — | 训练计划 ID |
| **返回值** | `Promise<[void, void]>` | | |

#### `get(domainId: string, tid: ObjectId): Promise<TrainingDoc>`

通过 ID 获取单条训练计划。未找到则抛出 `TrainingNotFoundError`。同时将 DAG 中的 `pids` 值规范化为整数。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tid` | `ObjectId` | — | 训练计划 ID |
| **返回值** | `Promise<TrainingDoc>` | | |

#### `getMulti(domainId: string, query?: Filter<TrainingDoc>): FindCursor<TrainingDoc>`

返回匹配查询的训练计划游标，按 `pin` 降序然后 `_id` 降序排列。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `query` | `Filter<TrainingDoc>` | — | 查询条件 |
| **返回值** | `FindCursor<TrainingDoc>` | | |

#### `getList(domainId: string, tids: ObjectId[]): Promise<Record<string, TrainingDoc>>`

通过 ID 获取多条训练计划，返回以 `docId.toString()` 为键的映射。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tids` | `ObjectId[]` | — | 训练计划 ID 数组 |
| **返回值** | `Promise<Record<string, TrainingDoc>>` | | |

#### `count(domainId: string, query: Filter<TrainingDoc>): Promise<number>`

返回匹配给定查询的训练计划数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `query` | `Filter<TrainingDoc>` | — | 查询条件 |
| **返回值** | `Promise<number>` | | |

### 注册与状态

#### `enroll(domainId: string, tid: ObjectId, uid: number): Promise<number>`

将用户注册到训练计划中。若已注册则抛出 `TrainingAlreadyEnrollError`。递增训练计划的 `attend` 计数器并返回新计数。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tid` | `ObjectId` | — | 训练计划 ID |
| `uid` | `number` | — | 用户 UID |
| **返回值** | `Promise<number>` | | 新的 `attend` 计数 |

```typescript
// 注册用户到训练计划
const newCount = await TrainingModel.enroll(
    'system',           // domainId
    trainingId,         // tid
    12345,              // uid
);
// 若用户已注册，抛出 TrainingAlreadyEnrollError
```

#### `getStatus(domainId: string, tid: ObjectId, uid: number): Promise<TrainingStatusDoc | null>`

获取指定用户在特定训练计划中的状态。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tid` | `ObjectId` | — | 训练计划 ID |
| `uid` | `number` | — | 用户 UID |
| **返回值** | `Promise<TrainingStatusDoc \| null>` | | |

#### `getMultiStatus(domainId: string, query: Filter<TrainingDoc>): FindCursor<TrainingStatusDoc>`

返回匹配给定查询的训练计划状态游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `query` | `Filter<TrainingDoc>` | — | 查询条件 |
| **返回值** | `FindCursor<TrainingStatusDoc>` | | |

#### `getListStatus(domainId: string, uid: number, tids: ObjectId[]): Promise<Record<string, TrainingStatusDoc>>`

获取指定用户在多条训练计划中的状态，返回以 `docId` 为键的映射。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `uid` | `number` | — | 用户 UID |
| `tids` | `ObjectId[]` | — | 训练计划 ID 数组 |
| **返回值** | `Promise<Record<string, TrainingStatusDoc>>` | | |

#### `setStatus(domainId: string, tid: ObjectId, uid: number, $set: any): Promise<void>`

设置（覆盖）用户在特定训练计划中的状态字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `tid` | `ObjectId` | — | 训练计划 ID |
| `uid` | `number` | — | 用户 UID |
| `$set` | `any` | — | 要设置的状态字段 |
| **返回值** | `Promise<void>` | | |

### DAG 辅助函数

用于评估训练计划 DAG 中节点完成状态的工具函数。

#### `getPids(dag: TrainingNode[]): number[]`

提取 DAG 中所有节点的唯一父 ID（`pids`）集合。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dag` | `TrainingNode[]` | — | DAG 节点数组 |
| **返回值** | `number[]` | | 唯一 `pids` 集合 |

#### `isDone(node: TrainingNode, doneNids: Set<number>, donePids: Set<number>): boolean`

若节点的必需节点 ID 和父题目 ID 均已满足，返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `TrainingNode` | — | DAG 节点 |
| `doneNids` | `Set<number>` | — | 已完成的节点 ID 集合 |
| `donePids` | `Set<number>` | — | 已完成的题目 ID 集合 |
| **返回值** | `boolean` | | |

#### `isProgress(node: TrainingNode, doneNids: Set<number>, donePids: Set<number>, progPids: Set<number>): boolean`

若节点的要求已满足但部分父题目未完成，且至少一个父题目正在进行中，返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `TrainingNode` | — | DAG 节点 |
| `doneNids` | `Set<number>` | — | 已完成的节点 ID 集合 |
| `donePids` | `Set<number>` | — | 已完成的题目 ID 集合 |
| `progPids` | `Set<number>` | — | 进行中的题目 ID 集合 |
| **返回值** | `boolean` | | |

#### `isOpen(node: TrainingNode, doneNids: Set<number>, donePids: Set<number>, progPids: Set<number>): boolean`

若节点的要求已满足，且无父题目已完成或正在进行中，返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `TrainingNode` | — | DAG 节点 |
| `doneNids` | `Set<number>` | — | 已完成的节点 ID 集合 |
| `donePids` | `Set<number>` | — | 已完成的题目 ID 集合 |
| `progPids` | `Set<number>` | — | 进行中的题目 ID 集合 |
| **返回值** | `boolean` | | |

#### `isInvalid(node: TrainingNode, doneNids: Set<number>): boolean`

若节点的必需节点 ID **未**全部满足（即前置条件未达成），返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `node` | `TrainingNode` | — | DAG 节点 |
| `doneNids` | `Set<number>` | — | 已完成的节点 ID 集合 |
| **返回值** | `boolean` | | |

---

## 备注

- 训练计划是一种文档类型模型（`TYPE_TRAINING = 40`）。增删改查和状态操作委托给共享的 `document` 模块。
- `enroll` 是原子操作——使用 `setIfNotStatus` 防止重复注册，冲突时抛出 `TrainingAlreadyEnrollError`。
- `get` 会规范化 DAG 的 `pids` 值（将数字字符串解析为整数）以保持向后兼容。
- DAG 辅助函数（`isDone`、`isProgress`、`isOpen`、`isInvalid`）接受 `Set<number>` 和 `number[]`——内部会自动转换为 `Set`。
