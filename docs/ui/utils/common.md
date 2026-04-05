# @hydrooj/utils/lib/common

> **源码**：[`framework/utils/lib/common.ts`](https://github.com/hydro-dev/Hydro/blob/master/framework/utils/lib/common.ts)
>
> **导出**：通过 `packages/ui-default/api.ts:16` 重新导出

所有前端插件可通过 `import { ... } from 'hydrooj'` 使用的通用工具函数。

## 函数

### 字符串工具

| API | 说明 |
|-----|------|
| `randomstring(digit?, dict?)` | 生成 `digit` 长度（默认 32）的随机字符串，使用 `dict` 中的字符（默认字母数字）。 |
| `formatDate(date, fmt?)` | 使用 printf 风格占位符（`%Y`、`%m`、`%d`、`%H`、`%M`、`%S`）格式化 `Date` 对象。默认格式：`'%Y-%m-%d %H:%M:%S'`。 |
| `formatSeconds(seconds?, showSeconds?)` | 将以秒为单位的时长格式化为 `HH:MM:SS`（当 `showSeconds` 为 false 时为 `H:MM`）。 |
| `getAlphabeticId(i)` | 将零基索引转换为字母 ID（`A`、`B`、... `Z`、`AA`、`AB`、...）。缓存至 `AZ` 以提升性能。 |

### 解析

| API | 说明 |
|-----|------|
| `parseTimeMS(str, throwOnError?)` | 将时间字符串（如 `"1s"`、`"500ms"`、`"100us"`）解析为毫秒。纯数字原样返回。解析失败默认返回：`1000`。 |
| `parseMemoryMB(str, throwOnError?)` | 将内存字符串（如 `"256mb"`、`"1gb"`、`"512kb"`）解析为 MiB。纯数字原样返回。解析失败默认返回：`256`。 |

### 大小写转换

| API | 说明 |
|-----|------|
| `camelCase(source)` | 深度转换对象键或字符串，从 `snake_case`/`kebab-case` 转为 `camelCase`。递归处理嵌套对象和数组。 |
| `paramCase(source)` | 深度转换对象键或字符串为 `param-case`（将 `_` 和大写字母替换为 `-lowercase`）。 |
| `snakeCase(source)` | 深度转换对象键或字符串为 `snake_case`（将 `-` 和大写字母替换为 `_lowercase`）。 |

### 数组与集合

| API | 说明 |
|-----|------|
| `diffArray(a, b)` | 按排序内容比较两个数组；内容不同时返回 `true`。 |
| `sortFiles(files, key?)` | 对字符串或对象数组按 `_id`（或指定键）进行自然排序。数字段按数值比较。 |
| `randomPick(arr)` | 从数组中随机返回一个元素。 |

### 异步与杂项

| API | 说明 |
|-----|------|
| `sleep(timeout)` | 基于 Promise 的延迟 — 在 `timeout` 毫秒后 resolve `true`。 |
| `size(s, base?)` | 将字节数格式化为人类可读字符串（如 `"1.5 GiB"`）。格式化前应用 `base` 乘数。 |
| `noop()` | 空函数 — 适合用作默认回调。 |

## 类型

| API | 说明 |
|-----|------|
| `StringKeys<O>` | 工具类型，提取 `O` 中值类型扩展 `string` 的键。 |

## 全局原型扩展

导入此模块会在内置原型上安装以下扩展：

| 扩展 | 说明 |
|------|------|
| `String.prototype.format(...args)` | 使用 `{key}` 占位符（对象参数）或 `{0}`、`{1}` 位置占位符（数组参数）格式化字符串。 |
| `String.prototype.formatFromArray(args)` | 使用数组中的位置 `{0}`、`{1}`、... 占位符格式化字符串。 |
| `String.prototype.rawformat(object)` | 按 `{@}` 分割字符串并用提供的对象拼接 — 简单模板插值。 |
| `Math.sum(...args)` | 求和所有参数，展平嵌套数组。 |
| `Set.isSuperset(set, subset)` | 检查 `set` 是否包含 `subset` 的所有元素。 |
| `Set.union(setA, setB)` | 返回包含两个输入元素的新 `Set`。 |
| `Set.intersection(setA, setB)` | 返回仅包含两个输入共有元素的新 `Set`。 |
