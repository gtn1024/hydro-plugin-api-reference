# OpcountModel

频率限制模型，用于跟踪和强制执行时间窗口内的操作计数。

> **源码**: [`packages/hydrooj/src/model/opcount.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/opcount.ts)
>
> **导出**: `import { OpcountModel } from 'hydrooj';`

`OpcountModel` 是一个纯模块，导出函数而非类。所有方法直接调用（如 `OpcountModel.inc(...)`）。

---

## 方法

### 频率限制

#### `inc(op: string, ident: string, periodSecs: number, maxOperations: number): Promise<number>`

在当前时间窗口内，对指定操作类型和标识符的操作计数器进行原子递增。返回新计数值。若已达到限制则抛出 `OpcountExceededError`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `op` | `string` | — | 操作类型标识符（如 `"login"`、`"submit"`） |
| `ident` | `string` | — | 调用者的唯一标识（如用户 ID、IP 地址） |
| `periodSecs` | `number` | — | 频率限制窗口的时长（秒） |
| `maxOperations` | `number` | — | 一个窗口内允许的最大操作次数 |
| **返回值** | `Promise<number>` | | 新计数值 |

### 生命周期

#### `apply(): Promise<void>`

在启动时创建所需的 MongoDB 索引。在应用初始化期间调用一次。

---

## 备注

- 时间窗口对齐到固定边界（基于 `periodSecs`），而非从首次请求开始滑动。
- 当 upsert 命中唯一约束（计数器已存在且达到上限）时，捕获 duplicate key error 并以 `OpcountExceededError` 重新抛出。
- `OpcountExceededError` 继承自 `ForbiddenError`，消息为：*"Too frequent operations of {op} (limit: {maxOperations} operations in {periodSecs} seconds)."*
- `apply()` 创建以下索引：`{ expireAt: -1 }`（TTL，自动删除过期窗口）、`{ op: 1, ident: 1, expireAt: 1 }`（unique，确保每个操作/标识/窗口仅一个计数器）。
