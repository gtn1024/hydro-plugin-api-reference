---
title: ProblemModel
description: 题目管理模型，提供增删改查操作、测试数据管理和导入导出
source: packages/hydrooj/src/model/problem.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/problem.ts
---
# ProblemModel

题目管理模型，提供增删改查操作、测试数据/附件管理、导入导出以及每用户状态跟踪。

> **源码**: [`packages/hydrooj/src/model/problem.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/problem.ts)
>
> **导出**: `import { ProblemModel } from 'hydrooj';`

`ProblemModel` 是一个纯静态类。所有方法直接在类上调用（如 `ProblemModel.get(...)`）。它封装了 `document` 子系统，文档类型为 `TYPE_PROBLEM`。

---

## 类型导出

### `ProblemDoc`

主要题目文档类型。继承 `Document`（提供 `_id`、`docId`、`docType`、`domainId`、`owner`、`maintainer?`）。通过 `interface.ts` 中的模块扩充声明的额外字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `pid` | `string` | 题目标识符（如 `"A"`、`"abc-123"`） |
| `title` | `string` | 题目标题 |
| `content` | `string` | 题面（纯文本、HTML 或多语言 JSON） |
| `nSubmit` | `number` | 总提交数 |
| `nAccept` | `number` | 总通过数 |
| `tag` | `string[]` | 标签/分类 |
| `data` | `FileInfo[]` | 测试数据文件元数据 |
| `additional_file` | `FileInfo[]` | 附加文件元数据 |
| `hidden` | `boolean?` | 是否隐藏题目 |
| `html` | `boolean?` | 内容是否为原始 HTML |
| `stats` | `any?` | 统计对象 |
| `difficulty` | `number?` | 难度等级 |
| `sort` | `string?` | 用于排序的排序键 |
| `config` | `string?` | 评测配置（YAML 字符串） |
| `reference` | `{ domainId: string, pid: number }?` | 源题目引用（用于复制的题目） |

### `ProblemDict`

```typescript
type ProblemDict = NumericDictionary<ProblemDoc>
```

以 `docId`（数字）和 `pid`（字符串）为键的字典。

### `ProblemStatusDoc`

每用户题目状态文档。继承 `StatusDocBase`。

| 字段 | 类型 | 说明 |
|------|------|------|
| `docId` | `number` | 题目 docId |
| `docType` | `10` | 始终为 `TYPE_PROBLEM` |
| `uid` | `number` | 用户 ID |
| `rid` | `ObjectId?` | 最佳/最新提交的记录 ID |
| `score` | `number?` | 最佳分数 |
| `status` | `number?` | 最佳状态码 |
| `star` | `boolean?` | 用户是否收藏了该题目 |

### `Field`

```typescript
type Field = keyof ProblemDoc;
```

所有 ProblemDoc 字段名的联合类型。用于投影数组。

---

## 常量

### 投影常量

为常见查询模式预构建的字段投影数组。

| 常量 | 字段 | 用途 |
|------|------|------|
| `PROJECTION_LIST` | `_id`, `domainId`, `docType`, `docId`, `pid`, `owner`, `title`, `nSubmit`, `nAccept`, `difficulty`, `tag`, `hidden`, `stats` | 题目列表页 |
| `PROJECTION_CONTEST_LIST` | `PROJECTION_BASE` + `config` | 比赛题目列表 |
| `PROJECTION_CONTEST_DETAIL` | `PROJECTION_CONTEST_LIST` + `content`, `html`, `data`, `additional_file`, `reference`, `maintainer` | 比赛题目详情 |
| `PROJECTION_PUBLIC` | `PROJECTION_LIST` + `content`, `html`, `data`, `config`, `additional_file`, `reference`, `maintainer` | 完整公开题目视图 |

---

## 方法

### 增删改查

#### `add(domainId: string, pid?: string, title: string, content: string, owner: number, tag?: string[], meta?: ProblemCreateOptions): Promise<number>`

创建新题目，`docId` 自动递增。触发 `problem/before-add` 和 `problem/add` 事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `string` | `''` | 题目标识符 |
| `title` | `string` | — | 题目标题 |
| `content` | `string` | — | 题面 |
| `owner` | `number` | — | 拥有者用户 ID |
| `tag` | `string[]` | `[]` | 标签 |
| `meta` | `ProblemCreateOptions` | `{}` | 附加选项 |
| **返回值** | `Promise<number>` | | 新 `docId` |

```typescript
// 创建新题目
const docId = await ProblemModel.add(
  'system',             // domainId
  'A',                  // pid
  '两数之和',            // title
  '给定两个整数 a 和 b', // content
  uid,                  // owner
  ['数学', '入门'],      // tag
);

// 创建隐藏题目
const hiddenDocId = await ProblemModel.add(
  'system', 'B', '隐藏题', '题面内容', uid,
  [],
  { hidden: true },
);
```

#### `addWithId(domainId: string, docId: number, pid?: string, title: string, content: string, owner: number, tag?: string[], meta?: ProblemCreateOptions): Promise<number>`

使用指定 `docId` 创建题目。由 `add` 和导入逻辑内部使用。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docId` | `number` | — | 指定的 `docId` |
| `pid` | `string` | `''` | 题目标识符 |
| `title` | `string` | — | 题目标题 |
| `content` | `string` | — | 题面 |
| `owner` | `number` | — | 拥有者用户 ID |
| `tag` | `string[]` | `[]` | 标签 |
| `meta` | `ProblemCreateOptions` | `{}` | 附加选项 |
| **返回值** | `Promise<number>` | | 新 `docId` |

#### `get(domainId: string, pid: string | number, projection?: Projection<ProblemDoc>, rawConfig?: boolean): Promise<ProblemDoc | null>`

通过数字 `docId` 或字符串 `pid` 获取单个题目。除非 `rawConfig` 为 `true`，否则自动解析评测配置。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `string \| number` | — | 题目 ID 或 pid |
| `projection` | `Projection<ProblemDoc>` | `PROJECTION_PUBLIC` | 要返回的字段 |
| `rawConfig` | `boolean` | `false` | 跳过配置解析 |
| **返回值** | `Promise<ProblemDoc \| null>` | | |

#### `getMulti(domainId: string, query: Filter<ProblemDoc>, projection?: Field[]): MongoDB.Cursor<ProblemDoc>`

获取查询多个题目的 MongoDB 游标，按 `sort` 字段排序。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<ProblemDoc>` | — | MongoDB 过滤器 |
| `projection` | `Field[]` | `PROJECTION_LIST` | 要返回的字段 |
| **返回值** | `MongoDB.Cursor<ProblemDoc>` | | |

#### `list(domainId: string, query: Filter<ProblemDoc>, page: number, pageSize: number, projection?: Field[]): Promise<[ProblemDoc[], number, number]>` *(已弃用)*

分页题目列表。返回 `[docs, count, page]`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<ProblemDoc>` | — | MongoDB 过滤器 |
| `page` | `number` | — | 页码 |
| `pageSize` | `number` | — | 每页数量 |
| `projection` | `Field[]` | `PROJECTION_LIST` | 要返回的字段 |
| **返回值** | `Promise<[ProblemDoc[], number, number]>` | | `[docs, count, page]` |

#### `edit(domainId: string, _id: number, $set: Partial<ProblemDoc>): Promise<ProblemDoc>`

更新题目字段。`pid` 变更时重新计算 `sort` 键。触发 `problem/before-edit` 和 `problem/edit` 事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `number` | — | 题目 `docId` |
| `$set` | `Partial<ProblemDoc>` | — | 要更新的字段 |
| **返回值** | `Promise<ProblemDoc>` | | 更新后的文档 |

#### `del(domainId: string, docId: number): Promise<boolean>`

删除题目、其状态和关联的存储文件。触发 `problem/before-del` 和 `problem/delete` 事件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docId` | `number` | — | 题目 `docId` |
| **返回值** | `Promise<boolean>` | | 是否有内容被删除 |

#### `count(domainId: string, query: Filter<ProblemDoc>): Promise<number>`

统计匹配过滤条件的题目数量。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<ProblemDoc>` | — | MongoDB 过滤器 |
| **返回值** | `Promise<number>` | | |

#### `copy(domainId: string, _id: number, target: string, pid?: string, hidden?: boolean): Promise<void>`

将题目复制到另一个域，创建指向原始题目的引用链接。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 源域 ID |
| `_id` | `number` | — | 题目 `docId` |
| `target` | `string` | — | 目标域 ID |
| `pid` | `string` | — | 目标域中的题目 PID |
| `hidden` | `boolean` | — | 是否在目标域中隐藏 |

#### `random(domainId: string, query: Filter<ProblemDoc>): Promise<string | number | null>`

获取匹配过滤条件的随机题目 `pid` 或 `docId`。未找到则返回 `null`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<ProblemDoc>` | — | MongoDB 过滤器 |
| **返回值** | `Promise<string \| number \| null>` | | |

### 批量查找

#### `getList(domainId: string, pids: number[], canViewHidden?: number | boolean, doThrow?: boolean, projection?: Field[], indexByDocIdOnly?: boolean): Promise<ProblemDict>`

获取多个题目作为 `ProblemDict`。解析引用、解析配置，可选对缺失题目抛出异常。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pids` | `number[]` | — | `docId` 数组 |
| `canViewHidden` | `number \| boolean` | `false` | UID（检查拥有者/维护者关系）或 `true` 跳过检查 |
| `doThrow` | `boolean` | `true` | 题目缺失时抛出异常 |
| `projection` | `Field[]` | `PROJECTION_PUBLIC` | 要返回的字段 |
| `indexByDocIdOnly` | `boolean` | `false` | 仅按 `docId` 索引，跳过 `pid` 键 |
| **返回值** | `Promise<ProblemDict>` | | |

### 状态跟踪

#### `getStatus(domainId: string, docId: number, uid: number): Promise<ProblemStatusDoc | null>`

获取指定用户在特定题目上的状态记录。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `docId` | `number` | — | 题目 `docId` |
| `uid` | `number` | — | 用户 ID |
| **返回值** | `Promise<ProblemStatusDoc \| null>` | | |

#### `getMultiStatus(domainId: string, query: Filter<ProblemStatusDoc>): MongoDB.Cursor<ProblemStatusDoc>`

获取查询题目状态文档的游标。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `query` | `Filter<ProblemStatusDoc>` | — | MongoDB 过滤器 |
| **返回值** | `MongoDB.Cursor<ProblemStatusDoc>` | | |

#### `getListStatus(domainId: string, uid: number, pids: number[]): Promise<NumericDictionary<ProblemStatusDoc>>`

获取多个题目的状态记录，以 `docId` 为键的字典。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `uid` | `number` | — | 用户 ID |
| `pids` | `number[]` | — | `docId` 数组 |
| **返回值** | `Promise<NumericDictionary<ProblemStatusDoc>>` | | |

#### `updateStatus(domainId: string, pid: number, uid: number, rid: ObjectId, status: number, score: number): Promise<boolean>`

更新用户在题目上的状态。仅在新状态更优时更新（通过始终优先）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `uid` | `number` | — | 用户 ID |
| `rid` | `ObjectId` | — | 记录 ID |
| `status` | `number` | — | 状态码 |
| `score` | `number` | — | 分数 |
| **返回值** | `Promise<boolean>` | | 状态是否被更新 |

#### `incStatus(domainId: string, pid: number, uid: number, key: string, count: number): Promise<void>`

递增用户题目状态上的数字字段。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `uid` | `number` | — | 用户 ID |
| `key` | `string` | — | 要递增的字段名 |
| `count` | `number` | — | 递增量 |

#### `setStar(domainId: string, pid: number, uid: number, star: boolean): Promise<void>`

设置或取消用户题目状态上的收藏标记。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `uid` | `number` | — | 用户 ID |
| `star` | `boolean` | — | `true` 收藏，`false` 取消收藏 |

### 测试数据管理

#### `addTestdata(domainId: string, pid: number, name: string, f: Readable | Buffer | string, operator?: number): Promise<void>`

上传测试数据文件。更新题目文档中的 `data` 数组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `name` | `string` | — | 文件名 |
| `f` | `Readable \| Buffer \| string` | — | 文件内容或路径 |
| `operator` | `number` | `1` | 操作者用户 ID |

#### `renameTestdata(domainId: string, pid: number, file: string, newName: string, operator?: number): Promise<void>`

在存储和文档元数据中重命名测试数据文件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `file` | `string` | — | 原文件名 |
| `newName` | `string` | — | 新文件名 |
| `operator` | `number` | `1` | 操作者用户 ID |

#### `delTestdata(domainId: string, pid: number, name: string | string[], operator?: number): Promise<void>`

删除一个或多个测试数据文件。`name` 可以是单个字符串或数组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `name` | `string \| string[]` | — | 要删除的文件名 |
| `operator` | `number` | `1` | 操作者用户 ID |

### 附加文件管理

#### `addAdditionalFile(domainId: string, pid: number, name: string, f: Readable | Buffer | string, operator?: number, skipUpload?: boolean): Promise<void>`

上传附加文件（如附件）。类似 `addTestdata`，但操作 `additional_file` 数组。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `name` | `string` | — | 文件名 |
| `f` | `Readable \| Buffer \| string` | — | 文件内容或路径 |
| `operator` | `number` | `1` | 操作者用户 ID |
| `skipUpload` | `boolean` | `false` | 跳过存储上传（仅元数据） |

#### `renameAdditionalFile(domainId: string, pid: number, file: string, newName: string, operator?: number): Promise<void>`

重命名附加文件。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `file` | `string` | — | 原文件名 |
| `newName` | `string` | — | 新文件名 |
| `operator` | `number` | `1` | 操作者用户 ID |

#### `delAdditionalFile(domainId: string, pid: number, name: string | string[], operator?: number): Promise<void>`

删除一个或多个附加文件。`name` 接受 `string | string[]`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `name` | `string \| string[]` | — | 要删除的文件名 |
| `operator` | `number` | `1` | 操作者用户 ID |

### 子文档辅助

#### `push(domainId: string, _id: number, key: ArrayKeys<ProblemDoc>, value: ProblemDoc[typeof key][0]): Promise<[Doc, ObjectId]>`

向数组字段（`data` 或 `additional_file`）追加元素。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `number` | — | 题目 `docId` |
| `key` | `ArrayKeys<ProblemDoc>` | — | 数组字段名 |
| `value` | `ProblemDoc[typeof key][0]` | — | 要追加的元素 |
| **返回值** | `Promise<[Doc, ObjectId]>` | | 更新后的文档和新元素 ID |

#### `pull(domainId: string, pid: number, key: ArrayKeys<ProblemDoc>, values: ProblemDoc[typeof key][0][]): Promise<DocType[typeof key]>`

按值从数组字段中移除元素。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pid` | `number` | — | 题目 `docId` |
| `key` | `ArrayKeys<ProblemDoc>` | — | 数组字段名 |
| `values` | `ProblemDoc[typeof key][0][]` | — | 要移除的值 |
| **返回值** | `Promise<DocType[typeof key]>` | | 更新后的文档 |

#### `inc(domainId: string, _id: number, field: NumberKeys<ProblemDoc> | string, n: number): Promise<ProblemDoc>`

递增数字字段（如 `nSubmit`、`nAccept`）。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `_id` | `number` | — | 题目 `docId` |
| `field` | `NumberKeys<ProblemDoc> \| string` | — | 要递增的字段名 |
| `n` | `number` | — | 递增量（负数为递减） |
| **返回值** | `Promise<ProblemDoc>` | | 更新后的文档 |

### 权限检查

#### `canViewBy(pdoc: ProblemDoc, udoc: User): boolean`

检查用户是否可以查看题目。若用户拥有 `PERM_VIEW_PROBLEM` 且拥有/维护该题目，或拥有 `PERM_VIEW_PROBLEM_HIDDEN`，或题目未隐藏，则返回 `true`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pdoc` | `ProblemDoc` | — | 题目文档 |
| `udoc` | `User` | — | 用户文档 |
| **返回值** | `boolean` | | |

### 导入 / 导出

#### `import(domainId: string, filepath: string, options?: ProblemImportOptions): Promise<void>`

从 ZIP 归档或目录导入题目。支持 Hydro、ICPC 和 DOMjudge 包格式。触发进度回调并处理配置合并。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 目标域 |
| `filepath` | `string` | — | `.zip` 文件或目录路径 |
| `options.preferredPrefix` | `string?` | — | 导入时替换 PID 前缀 |
| `options.progress` | `Function?` | — | 进度回调 |
| `options.override` | `boolean` | `false` | 覆盖已有题目 |
| `options.operator` | `number` | `1` | 操作者用户 ID |
| `options.delSource` | `boolean?` | — | 导入后删除源文件 |
| `options.hidden` | `boolean?` | — | 将导入的题目标记为隐藏 |

```typescript
// 从 ZIP 文件导入题目
await ProblemModel.import('system', '/tmp/problems.zip');

// 导入时指定前缀和进度回调
await ProblemModel.import('system', '/tmp/problems.zip', {
  preferredPrefix: 'contest-',
  override: true,
  progress: (current, total) => {
    console.log(`导入进度: ${current}/${total}`);
  },
});

// 导入目录并标记为隐藏
await ProblemModel.import('system', '/data/problems/', {
  hidden: true,
  operator: uid,
});
```

#### `export(domainId: string, pidFilter?: string): Promise<void>`

导出所有题目（或匹配 PID 正则过滤器的题目）为 ZIP 归档，保存到当前工作目录。输出文件路径打印到控制台。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域 ID |
| `pidFilter` | `string` | `''` | PID 正则过滤器（留空导出全部） |
| **返回值** | `Promise<void>` | | 无返回值 |

```typescript
// 导出域内所有题目
const zipPath = await ProblemModel.export('system');

// 仅导出匹配前缀的题目
const partialPath = await ProblemModel.export('system', '^contest-');

// zipPath/partialPath 为生成的 ZIP 文件路径
```

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `default` | `ProblemDoc` | 模板 `ProblemDoc`，所有字段设为安全默认值 |
| `deleted` | `ProblemDoc` | 哨兵 `ProblemDoc`，用作已删除题目的占位符 |

---

## 事件

以下事件在 ProblemModel 操作期间通过 `bus` 触发：

| 事件 | 参数 | 触发时机 |
|------|------|----------|
| `problem/before-add` | `domainId, content, owner, docId, args` | 创建题目前 |
| `problem/add` | `args, result` | 创建题目后 |
| `problem/before-edit` | `$set, $unset` | 编辑题目前 |
| `problem/edit` | `result` | 编辑题目后 |
| `problem/before-del` | `domainId, docId` | 删除题目前 |
| `problem/delete` | `domainId, docId` | 删除题目后 |
| `problem/addTestdata` | `domainId, pid, name, payload` | 添加测试数据后 |
| `problem/renameTestdata` | `domainId, pid, file, newName` | 重命名测试数据后 |
| `problem/delTestdata` | `domainId, pid, names` | 删除测试数据后 |
| `problem/addAdditionalFile` | `domainId, pid, name, payload` | 添加附加文件后 |
| `problem/renameAdditionalFile` | `domainId, pid, file, newName` | 重命名附加文件后 |
| `problem/delAdditionalFile` | `domainId, pid, names` | 删除附加文件后 |
