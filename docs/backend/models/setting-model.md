---
title: SettingModel
description: 设置注册模型，用于声明用户级、域级和系统级设置
source: packages/hydrooj/src/model/setting.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/setting.ts
---
# SettingModel

设置注册模型，用于声明用户级、域级和系统级设置。

> **源码**: [`packages/hydrooj/src/model/setting.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/model/setting.ts)
>
> **导出**: `import { SettingModel } from 'hydrooj';`

`SettingModel` 是一个纯模块，导出常量和注册函数而非类。插件使用它将自定义设置注册到相应的分类中。

---

## 类型导出

### `SettingType`

```typescript
type SettingType = "text" | "yaml" | "number" | "float" | "markdown" | "password" | "boolean" | "textarea" | [string, string][] | Record<string, string> | "json"
```

设置值类型的类型别名。

---

## 常量

### 标志常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `FLAG_HIDDEN` | `1` | 在设置界面隐藏 |
| `FLAG_DISABLED` | `2` | 显示但不可编辑 |
| `FLAG_SECRET` | `4` | 密钥字段（如密码） |
| `FLAG_PRO` | `8` | 需要 Hydro Pro |
| `FLAG_PUBLIC` | `16` | 对非管理员用户可见 |
| `FLAG_PRIVATE` | `32` | 仅对拥有者可见 |

### 集合常量

由注册函数填充的只读数组：

| 常量 | 说明 |
|------|------|
| `PREFERENCE_SETTINGS` | 所有已注册的偏好设置 |
| `ACCOUNT_SETTINGS` | 所有已注册的账户设置 |
| `DOMAIN_SETTINGS` | 所有已注册的域设置 |
| `DOMAIN_USER_SETTINGS` | 所有已注册的域用户设置 |
| `SYSTEM_SETTINGS` | 所有已注册的系统设置 |
| `SETTINGS` | 合并的偏好 + 账户设置数组（扁平） |

由注册函数填充的只读字典（按键索引）：

| 常量 | 说明 |
|------|------|
| `SETTINGS_BY_KEY` | 偏好 + 账户设置的查找映射 |
| `DOMAIN_SETTINGS_BY_KEY` | 域设置的查找映射 |
| `DOMAIN_USER_SETTINGS_BY_KEY` | 域用户设置的查找映射 |
| `SYSTEM_SETTINGS_BY_KEY` | 系统设置的查找映射 |

---

## 方法

### 设置工厂

#### `Setting(family: string, key: string, value?: any, type?: SettingType, name?: string, desc?: string, flag?: number, validation?: (val: any) => boolean): Setting`

创建一个设置描述符对象。这是所有注册函数使用的底层工厂函数。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `family` | `string` | — | 用于 UI 分类的组/族名（如 `"setting_basic"`） |
| `key` | `string` | — | 唯一设置键（如 `"pagination.problem"`） |
| `value` | `any` | `null` | 默认值 |
| `type` | `SettingType` | `"text"` | 输入类型。对象类型渲染为 `<select>` |
| `name` | `string` | `""` | 显示名称 |
| `desc` | `string` | `""` | 描述文本 |
| `flag` | `number` | `0` | `FLAG_*` 常量的位运算组合 |
| `validation` | `(val: any) => boolean` | _(optional)_ | 可选验证器 |
| **返回值** | `Setting` | | 设置描述符对象 |

### 注册函数

每个注册函数接受 `Setting[]` 或 schemastery `Schema` 对象，将其注册到相应集合中，并返回一个**销毁函数**（`() => void`）用于移除这些设置。

#### `PreferenceSetting(...settings: (Setting | Schema)[]): () => void`

注册偏好级设置（每用户的显示/UI 偏好，如语言、时区）。添加到 `PREFERENCE_SETTINGS`、`SETTINGS` 和 `SETTINGS_BY_KEY`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `...settings` | `(Setting \| Schema)[]` | — | 设置描述符或 schemastery Schema |
| **返回值** | `() => void` | | 销毁函数，调用后移除已注册设置 |

#### `AccountSetting(...settings: (Setting | Schema)[]): () => void`

注册账户级设置（用户资料信息，如头像、简介、手机）。添加到 `ACCOUNT_SETTINGS`、`SETTINGS` 和 `SETTINGS_BY_KEY`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `...settings` | `(Setting \| Schema)[]` | — | 设置描述符或 schemastery Schema |
| **返回值** | `() => void` | | 销毁函数，调用后移除已注册设置 |

#### `DomainSetting(...settings: (Setting | Schema)[]): () => void`

注册域级设置（每域配置，如名称、公告）。添加到 `DOMAIN_SETTINGS` 和 `DOMAIN_SETTINGS_BY_KEY`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `...settings` | `(Setting \| Schema)[]` | — | 设置描述符或 schemastery Schema |
| **返回值** | `() => void` | | 销毁函数，调用后移除已注册设置 |

#### `DomainUserSetting(...settings: (Setting | Schema)[]): () => void`

注册域用户级设置（每用户每域的数据，如显示名称、排名）。添加到 `DOMAIN_USER_SETTINGS` 和 `DOMAIN_USER_SETTINGS_BY_KEY`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `...settings` | `(Setting \| Schema)[]` | — | 设置描述符或 schemastery Schema |
| **返回值** | `() => void` | | 销毁函数，调用后移除已注册设置 |

#### `SystemSetting(...settings: (Setting | Schema)[]): () => void`

注册系统级设置（全局服务器配置，如 SMTP、限制、分页）。添加到 `SYSTEM_SETTINGS` 和 `SYSTEM_SETTINGS_BY_KEY`。

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `...settings` | `(Setting \| Schema)[]` | — | 设置描述符或 schemastery Schema |
| **返回值** | `() => void` | | 销毁函数，调用后移除已注册设置 |

---

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `langs` | `Record<string, LangConfig>` | 从 `hydrooj.langs` 系统设置解析得到的语言配置。该设置变更时动态更新 |

---

## 备注

- 所有注册函数除 `Setting` 描述符外还接受 **schemastery `Schema` 对象**——会通过 `schemaToSettings()` 自动转换。
- 每个注册函数返回一个销毁回调。调用它可从所有相关集合中移除设置，支持插件清理。
- 重复的设置键会触发警告日志但不会被阻止。
- `Setting` 接口（来自 `hydrooj/src/interface.ts`）定义了结构：`{ family, key, range, value, type, subType?, name, desc, flag, validation? }`。
