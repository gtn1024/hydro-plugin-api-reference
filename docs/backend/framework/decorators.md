---
title: @hydrooj/framework 装饰器与验证器
description: 用于路由处理方法的参数绑定装饰器和类型验证器
source: framework/framework/decorators.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/framework/framework/decorators.ts
---
# @hydrooj/framework 装饰器与验证器

用于路由处理方法的参数绑定装饰器和类型验证器。

> **源码**: [`framework/framework/decorators.ts`](https://github.com/hydro-dev/Hydro/blob/master/framework/framework/decorators.ts)、[`framework/framework/validator.ts`](https://github.com/hydro-dev/Hydro/blob/master/framework/framework/validator.ts) —— 通过 `hydrooj` 重新导出

```ts
import { param, query, post, route, Types } from 'hydrooj';
```

## 参数装饰器

将处理方法的参数绑定到特定请求源的装饰器。它们在将值传递给方法之前进行提取、验证和转换。

| 装饰器 | 来源 | 说明 |
|--------|------|------|
| `param` | 全部（query + body） | 从合并后的请求参数中绑定参数。 |
| `query` | 查询字符串 | 从 `request.query` 绑定参数（GET 参数）。 |
| `get` | 查询字符串 | `query` 的别名。 |
| `post` | 请求体 | 从 `request.body` 绑定参数（POST body）。 |
| `route` | 路由参数 | 从路由路径参数及 `domainId` 绑定参数。 |
| `subscribe` | — | 将方法（或类）注册为指定频道名的 WebSocket 订阅处理器。 |

### 用法

每个参数装饰器接受 `(name: string, type?: Type, ...options)`：

```ts
class MyHandler extends Handler {
    @param('name', Types.ShortString)
    @param('page', Types.PositiveInt, true)       // 可选
    @param('tags', Types.CommaSeperatedArray)
    async run(name: string, page: number | undefined, tags: string[]) { }
}
```

### 签名

```ts
(name: string, type: Type, validate?: Validator | null, convert?: Converter) => MethodDecorator
(name: string, type?: Type, isOptional?: boolean, validate?: Validator, convert?: Converter) => MethodDecorator
```

`Type` 可以是 Schemastery schema 或元组 `[convert, validate?, isOptional?]`。

## 类型验证器 — `Types`

预置的类型定义，组合了转换器和验证器。每个都是 `Type<T>`，可用作任何参数装饰器的第二个参数。

### 字符串类型

| 名称 | 输出 | 说明 |
|------|------|------|
| `Types.Content` | `string` | 多行文本内容（去除首尾空格，最长 65535 字符）。 |
| `Types.Key` | `string` | 标识符键（`/^\w-$/`，1–255 字符，SASLprep）。 |
| `Types.Name` | `string` | 通用名称字段（1–255 字符，SASLprep）。**@deprecated** |
| `Types.Username` | `string` | 用户名（3–31 字符或 2 个以上 CJK 字符，SASLprep）。 |
| `Types.Password` | `string` | 密码字符串（6–255 字符）。 |
| `Types.UidOrName` | `string` | 用户 ID（数字）或用户名（3–31 字符或 2 个以上 CJK 字符，SASLprep）。 |
| `Types.Email` | `string` | 邮箱地址（`user@domain.tld`，SASLprep）。 |
| `Types.Filename` | `string` | 文件名（1–255 字符，不含 `\/?#~!|*`，SASLprep）。 |
| `Types.DomainId` | `string` | 域标识符（字母开头，4–32 个 `\w` 字符，SASLprep）。 |
| `Types.ProblemId` | `string \| number` | 题目 ID —— 数字字符串自动转换为 `number`。 |
| `Types.Role` | `string` | 角色名（1–31 个 `\w` 或 CJK 字符，SASLprep）。 |
| `Types.Title` | `string` | 短标题（1–64 字符，去除首尾空格）。 |
| `Types.ShortString` | `string` | 短字符串（1–255 字符）。 |
| `Types.String` | `string` | 任意非空字符串。 |
| `Types.Emoji` | `string` | 单个 emoji 字符。 |

### 数值类型

| 名称 | 输出 | 说明 |
|------|------|------|
| `Types.Int` | `number` | 有符号整数（从字符串转换）。 |
| `Types.UnsignedInt` | `number` | 非负整数（允许零）。 |
| `Types.PositiveInt` | `number` | 正整数（≥ 1）。 |
| `Types.Float` | `number` | 有限浮点数（从字符串转换）。 |

### 特殊类型

| 名称 | 输出 | 说明 |
|------|------|------|
| `Types.ObjectId` | `ObjectId` | MongoDB ObjectId（通过 `ObjectId.isValid` 验证）。 |
| `Types.Boolean` | `boolean` | 布尔值 —— 除 `'false'`/`'off'`/`'no'`/`'0'` 外的值为真；始终可选。 |
| `Types.Date` | `string` | `YYYY-MM-DD` 格式的日期字符串（零填充）。 |
| `Types.Time` | `string` | `HH:MM` 格式的时间字符串（零填充）。 |

### 组合类型

| 名称 | 输出 | 说明 |
|------|------|------|
| `Types.Range(arr \| obj)` | `T` | 接受给定数组或对象键中的任意值；数字字符串自动转换为 `number`。 |
| `Types.NumericArray` | `number[]` | 有限数字数组（逗号分隔字符串或 JSON 数组）。 |
| `Types.CommaSeperatedArray` | `string[]` | 以逗号分隔的字符串数组。 |
| `Types.Set` | `Set<any>` | 将数组或单个值转换为 `Set`。 |
| `Types.Any` | `any` | 透传，不做验证。 |
| `Types.ArrayOf(type, isOptional?)` | `T[]` | 将任意 `Type<T>` 包装为数组变体；可选元素变为 `undefined`。 |
| `Types.AnyOf(...types)` | `T` | 联合类型 —— 接受匹配给定类型中任意一个的值。 |

## 工具类型

重新导出的 TypeScript 类型，用于构建自定义验证器：

| 类型 | 说明 |
|------|------|
| `Converter<T>` | `(value: any) => T` —— 将原始输入转换为类型化输出。 |
| `Validator` | `(value: any) => boolean` —— 值有效时返回 `true`。 |
| `Type<T>` | `Schema<T> \| readonly [Converter<T>, Validator?, (boolean \| 'convert')?]` —— Schemastery schema 或 `[convert, validate?, optional?]` 元组。 |
