# Model 模板参考

本文档定义 `docs/models/*.md` 的规范格式。所有模型文档必须遵循此结构，以确保一致性和可读性。

---

## 文档头部

每个模型文档必须包含以下 YAML frontmatter：

```yaml
---
title: ModelName
description: 一句话中文描述该模型的职责和用途
source: packages/hydrooj/src/model/filename.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/filename.ts
import: "import { ModelName } from 'hydrooj'"
---
```

**frontmatter 字段说明：**

1. **title** — 模型导出名（如 `ProblemModel`）
2. **description** — 一句话描述模型用途
3. **source** — Hydro 仓库中的相对源码路径
4. **source_url** — GitHub 上对应源码的完整 URL
5. **import** — 推荐的导入语句（统一从 `'hydrooj'` 顶层导入，不使用深路径）

---

文档正文必须以以下头部开始：

```
# ModelName

一段中文简要描述该模型的职责和用途。

`ModelName` 是纯静态类。所有方法均通过类本身调用（如 `ModelName.method(...)`）。
```

**头部包含要素：**

1. **标题** — `# ModelName`（与导出名一致）
2. **描述** — 一句话说明模型用途
3. **性质说明** — 简要说明类的性质（纯静态类、实例类等）及其底层集合

---

## 章节顺序

文档按以下固定顺序组织章节。若某章节为空则跳过，不保留空标题。

```
## 类型导出        ← 如有类型/接口定义
## 常量            ← 如有常量或投影数组
## 方法            ← 必需，使用 ### 功能分组 + #### 方法块
## 属性            ← 如有静态属性、集合引用等
## 事件            ← 如有 bus 事件
## 备注            ← 如有补充说明
```

---

## 类型导出

使用 `###` 列出每个类型。用表格描述字段，用代码块展示类型别名。

```markdown
### `TypeName`

类型说明文字。

| 字段 | 类型 | 说明 |
|------|------|------|
| `field1` | `string` | 字段说明 |
| `field2` | `number` | 字段说明 |

### `TypeAlias`

\```typescript
type TypeAlias = SomeOtherType
\```

类型别名的简要说明。
```

---

## 常量

使用表格或 `###` 子标题展示常量分组。

```markdown
### 常量组名称

| 常量 | 值 | 说明 |
|------|-----|------|
| `CONST_A` | `0` | 说明 |
| `CONST_B` | `1` | 说明 |
```

---

## 方法

方法是文档的核心。使用 `###` 进行功能分组，`####` 描述每个具体方法。

### 功能分组（###）

按职责将方法分为逻辑组。常见分组示例：

- `查找` / `用户查找` / `题目查找`
- `创建`
- `变更` / `更新`
- `删除`
- `状态跟踪`
- `导入 / 导出`
- `权限检查`
- `批量操作`

### 方法块（####）

每个方法使用 `####` 标题，格式为 TypeScript 风格签名：

```markdown
#### `methodName(param1: Type, param2?: Type): ReturnType`

方法功能的简要描述。补充说明副作用、触发事件等。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `param1` | `string` | — | 参数说明 |
| `param2` | `number` | `50` | 参数说明 |
| **返回值** | `Promise<Doc \| null>` | | |
```

**签名格式规则：**

- 使用反引号包裹整个签名
- 参数标注类型：`param: Type`
- 可选参数加 `?`：`param?: Type`
- 返回类型用 `: ReturnType`
- 无返回值可省略返回类型或写 `: void`

**参数表规则：**

- 四列：参数、类型、默认值、说明
- 必填参数默认值列写 `—`（em dash）
- 可选参数标注实际默认值
- 返回值行作为表末行，参数列写 `**返回值**`
- 无参数的简单方法可省略参数表

### 代码示例

复杂方法应附上 `ts` 代码示例。

**何时添加示例：**
- 多参数方法（≥3 个参数）
- 有副作用的方法（写操作、触发事件）
- 行为不直观的方法（复杂逻辑、特殊参数组合）
- 涉及多个模型协作的方法

**何时跳过示例：**
- 简单 getter（如 `getById`）
- 无参数或单参数的查询方法
- 行为自解释的 CRUD 方法（参数表已足够）

**示例格式：**

```markdown
\```typescript
// 创建用户
const uid = await UserModel.create(
  'user@example.com',  // mail
  '张三',               // uname
  'securePassword',     // password
);

// 批量封禁用户
await UserModel.ban(uid, '违反社区规范');
\```
```

---

## 属性

使用表格列出静态属性。

```markdown
| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<Doc>` | MongoDB 集合引用 |
| `cache` | `LRUCache<string, T>` | 缓存实例 |
| `default` | `Doc` | 默认文档模板 |
```

---

## 事件

使用表格列出 `bus` 触发的事件。

```markdown
| 事件 | 参数 | 说明 |
|------|------|------|
| `model/before-add` | `domainId, doc` | 创建前触发 |
| `model/add` | `domainId, doc` | 创建后触发 |
| `model/delete` | `domainId, docId` | 删除后触发 |
```

---

## 备注

自由文本，补充说明缓存行为、索引、注意事项等。

```markdown
- 集合使用 TTL 索引，过期条目由 MongoDB 自动清理。
- 编辑操作会自动使 LRU 缓存失效。
```

---

## 完整示例

以下是一个完整的最小模型文档示例：

```markdown
# ExampleModel

示例管理模型，提供 CRUD 操作和缓存。

`ExampleModel` 是纯静态类。所有方法均通过类本身调用。

---

## 类型导出

### `ExampleDoc`

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | `string` | 文档 ID |
| `title` | `string` | 标题 |
| `count` | `number` | 计数 |

---

## 方法

### 查找

#### `get(domainId: string, id: string): Promise<ExampleDoc | null>`

按 ID 获取单个文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `id` | `string` | — | 文档 ID |
| **返回值** | `Promise<ExampleDoc \| null>` | | |

### 创建与变更

#### `add(domainId: string, title: string, extra?: Partial<ExampleDoc>): Promise<string>`

创建新文档。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `domainId` | `string` | — | 域上下文 |
| `title` | `string` | — | 标题 |
| `extra` | `Partial<ExampleDoc>` | `{}` | 附加字段 |
| **返回值** | `Promise<string>` | | 新文档 ID |

\```typescript
const docId = await ExampleModel.add(
  'system',
  '我的文档',
  { count: 10 },
);
\```

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `coll` | `Collection<ExampleDoc>` | MongoDB `example` 集合 |

---

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `example/add` | `domainId, docId` | 文档创建后 |
| `example/delete` | `domainId, docId` | 文档删除后 |
```
