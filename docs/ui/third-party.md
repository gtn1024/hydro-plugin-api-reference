---
title: 第三方库重新导出
description: 预打包的第三方库，由 @hydrooj/ui-default 重新导出
source: packages/ui-default/api.ts
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/api.ts
---
# 第三方库重新导出

源码：[`packages/ui-default/api.ts:17-29`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/api.ts#L17-L29)

预打包的第三方库，由 `@hydrooj/ui-default` 重新导出，供前端插件直接使用。这些是简单的重新导出 — 没有 Hydro 特定的封装或修改。

## 导出

### $

```ts
import { $ } from '@hydrooj/ui-default';
```

重新导出 [jQuery](https://jquery.com/)（`jquery` 的默认导出）。同时注册为全局变量 `window.$` 和 `window.jQuery`（api.ts 第 59-61 行）。

### _

```ts
import { _ } from '@hydrooj/ui-default';
```

重新导出 [Lodash](https://lodash.com/)（`lodash` 的默认导出）。

### React

```ts
import { React } from '@hydrooj/ui-default';
```

重新导出 [React](https://react.dev/)（`react` 的默认导出）。

### ReactDOM

```ts
import { ReactDOM } from '@hydrooj/ui-default';
```

合并重新导出，结合 `react-dom` 和 `react-dom/client`。通过 `Object.assign` 将 `react-dom/client` 的所有导出合并到主 `react-dom` 模块上，在单个对象中同时提供旧版（`render`、`unmountComponentAtNode`）和现代（`createRoot`、`hydrateRoot`）API。

### jsxRuntime

```ts
import { jsxRuntime } from '@hydrooj/ui-default';
```

重新导出 `react/jsx-runtime` — React 使用的 JSX 转换运行时。提供 `jsx`、`jsxs` 和 `Fragment` 用于 JSX 编译。

### redux

```ts
import { redux } from '@hydrooj/ui-default';
```

通过 `export * as redux` 对 [react-redux](https://react-redux.js.org/) 进行命名空间重新导出。包含所有 react-redux 导出：`Provider`、`connect`、`useSelector`、`useDispatch`、`createSelectorHook`、`createDispatchHook` 等。

### AnsiUp

```ts
import { AnsiUp } from '@hydrooj/ui-default';
```

重新导出来自 `ansi_up` 包的 [AnsiUp](https://github.com/drudru/ansi_up)。将 ANSI 终端转义序列转换为 HTML 以便在浏览器中显示。
