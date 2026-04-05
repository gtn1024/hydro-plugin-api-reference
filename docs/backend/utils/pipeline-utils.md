---
title: pipelineUtils
description: 批量迭代工具，用于遍历系统中给定类型的所有文档
source: packages/hydrooj/src/pipelineUtils.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/pipelineUtils.ts
import: "import { iterateAllDomain, iterateAllUser, ... } from 'hydrooj'"
---
# pipelineUtils

批量迭代工具，用于遍历系统中给定类型的所有文档。适用于迁移脚本、批量数据处理和后台维护任务。

所有函数**顺序**处理文档（逐个处理），完成时返回 `Promise<true>`。

---

## 函数

### iterateAllDomain

```typescript
iterateAllDomain(
  cb: (ddoc: DomainDoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

加载所有域并逐一调用回调。提供 `current`（从 0 开始的索引）和 `total` 进度计数器。

### iterateAllUser

```typescript
iterateAllUser(
  cb: (udoc: Udoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

加载所有用户并逐一调用回调。提供 `current`（从 0 开始的索引）和 `total` 进度计数器。

### iterateAllContest

```typescript
iterateAllContest(
  cb: (tdoc: Tdoc) => Promise<any>
): Promise<true>
```

迭代所有域，再迭代每个域中的所有比赛。**不**提供进度计数器。

### iterateAllPsdoc

```typescript
iterateAllPsdoc(
  filter: Filter<ProblemStatusDoc>,
  cb: (psdoc: ProblemStatusDoc) => Promise<any>
): Promise<true>
```

迭代所有域，再迭代每个域中匹配 `filter` 的所有题目状态文档（docType 为 `TYPE_PROBLEM`）。使用基于游标的迭代。

### iterateAllProblemInDomain

```typescript
iterateAllProblemInDomain(
  domainId: string,
  fields: (Field | string)[],
  cb: (pdoc: PartialProblemDoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

迭代单个域中的所有题目，仅获取指定的 `fields`。自动注入 `domainId` 和 `docId` 到字段列表中。

如果回调返回真值，则通过 `problem.edit()` **自动更新**该文档。这支持在迭代期间就地修改文档。提供从 1 开始的 `current` 和 `total` 进度计数器。

### iterateAllProblem

```typescript
iterateAllProblem(
  fields: (Field | string)[],
  cb: (pdoc: PartialProblemDoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

迭代所有域，再迭代每个域中的所有题目。字段投影和自动编辑行为与 `iterateAllProblemInDomain` 相同。

### iterateAllRecord

```typescript
iterateAllRecord(
  cb: (rdoc: RecordDoc, current: number, total: number) => any
): Promise<true>
```

迭代系统中的**所有**评测记录，按 `_id` 升序排列。与其他函数不同，回调签名中 `current` 和 `total` 是必需的（非可选）。使用基于游标的迭代。

---

## 类型

```typescript
interface PartialProblemDoc extends ProblemDoc {
    [key: string]: any;
}
```

`ProblemDoc` 的宽松版本，在通过 `iterateAllProblemInDomain` / `iterateAllProblem` 投影特定字段时使用。

---

## 备注

- 所有函数在迭代前会将完整结果集加载到内存中（`iterateAllPsdoc` 和 `iterateAllRecord` 除外，它们使用游标）。对于非常大的集合，需注意内存使用。
- `iterateAllProblemInDomain` 是唯一支持就地文档修改的函数 — 回调返回真值会触发自动 `problem.edit()` 调用。
- `iterateAllContest`、`iterateAllPsdoc` 和 `iterateAllProblem` 是组合迭代器，以 `iterateAllDomain` 作为外层循环嵌套。
