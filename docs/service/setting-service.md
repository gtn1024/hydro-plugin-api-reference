# SettingService

系统配置服务，提供配置读写、基于 Schema 的校验，以及插件设置注册功能。

> **源码**: [`packages/hydrooj/src/settings.ts`](https://github.com/hydro-dev/Hydro/blob/master/packages/hydrooj/src/settings.ts)
> **导出**: `import { SettingService } from 'hydrooj';`
> **访问**: `ctx.setting`（Cordis 服务，以 `'setting'` 注入）

`SettingService` 是一个 Cordis `Service`，负责管理 Hydro 基于 YAML 的系统配置。它从 `system` MongoDB 集合加载配置，根据已注册的 Schema 进行校验，并通过基于代理的 getter 提供响应式访问。插件通过五个注册方法（PreferenceSetting、AccountSetting 等）注册设置 Schema，当插件的上下文被销毁时自动清理。

---

## 属性

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `settings` | `Schema[]` | 当前已注册的配置 Schema 数组 |
| `configSource` | `string` | 当前系统配置的原始 YAML 字符串 |
| `systemConfig` | `any`（私有） | 解析后的配置对象 |
| `applied` | `any`（私有） | 经 Schema 校验后的配置对象 |

---

## 公开方法

### `get(key: string): any`

通过点分路径键读取配置值。解析顺序：先查找域配置（`ctx.domain.config`），再查找系统配置，最后以 `global.Hydro.model.system.get` 作为兜底。未找到时返回 `null`。

### `setConfig(key: string, value: any): Promise<void>`

将指定配置键（点分路径）设为给定值。将增量应用到当前配置，根据所有已注册的 Schema 进行校验，持久化到数据库并重新加载。

### `requestConfig<T, S>(s: Schema<T, S>, dynamic?: boolean): S`

注册一个 Schema 用于配置校验，并返回当前已校验的配置值。当 `dynamic` 为 `true`（默认值）时，返回值为响应式代理：读取嵌套属性正常工作，**写入**属性时会自动调用 `setConfig` 持久化更改。Schema 在上下文销毁时自动移除。

### `loadConfig(): Promise<void>`

从 `system` MongoDB 集合加载系统配置（YAML 格式），根据所有已注册的 Schema 进行校验，并触发 `system/setting` 事件。在服务初始化期间自动调用。

### `saveConfig(config: any): Promise<void>`

根据所有已注册的 Schema 校验给定配置对象（校验失败时抛出异常），序列化为 YAML，持久化到 `system` 集合，然后调用 `loadConfig` 刷新内存状态并通知监听器。

---

## 注册方法

这些方法封装了 `SettingModel` 中对应的函数（参见 [SettingModel 文档](../models/setting-model.md)），并添加了基于上下文的自动清理。每个方法返回 `void`，注册的设置与插件上下文生命周期绑定。

### `PreferenceSetting(...args): void`

注册偏好级设置（用户级别，跨域）。委托给 `SettingModel.PreferenceSetting`。上下文结束时自动清理。

### `AccountSetting(...args): void`

注册账户级设置（用户级别的认证/安全设置）。委托给 `SettingModel.AccountSetting`。上下文结束时自动清理。

### `DomainSetting(...args): void`

注册域级设置（域级别配置）。委托给 `SettingModel.DomainSetting`。上下文结束时自动清理。

### `DomainUserSetting(...args): void`

注册域用户级设置（作用域限定在特定域的用户偏好）。委托给 `SettingModel.DomainUserSetting`。上下文结束时自动清理。

### `SystemSetting(...args): void`

注册系统级设置（对所有域可见的全局配置）。委托给 `SettingModel.SystemSetting`。上下文结束时自动清理。

---

## 内部方法

以下方法供内部使用，插件开发者通常不需要直接调用。

| 方法 | 说明 |
|--------|-------------|
| `_applySchema()` | 根据所有已注册的 Schema 校验 `systemConfig`，将结果存储在 `applied` 中 |
| `_get(key: string)` | 按点分路径遍历已校验的 `applied` 配置；拒绝黑名单路径段 |
| `applyDelta(source, key, value)` | 返回 `source` 的深拷贝，其中指定键设为 `value` |
| `isPatchValid(key, value)` | 测试应用增量后是否能通过 Schema 校验 |
| `_tryMigrateConfig(schema)` | 将旧格式设置（每个键一个文档）迁移到统一 YAML 配置（排队执行） |
