---
title: uploadFiles
description: 文件上传工具，带进度对话框、浏览器关闭防护和逐文件回调
source: packages/ui-default/components/upload.tsx
source_url: https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/upload.tsx
---
# uploadFiles

源码：[`packages/ui-default/components/upload.tsx`](https://github.com/hydro-dev/Hydro/blob/master/packages/ui-default/components/upload.tsx)

将文件上传到服务器端点，带有进度对话框、浏览器关闭防护和逐文件回调。

## 函数

### uploadFiles

```ts
async function uploadFiles(
  endpoint?: string,
  files?: File[] | FileList,
  options?: UploadOptions
): Promise<void>
```

通过 `request.postFile` 将文件顺序上传到 `endpoint`。显示带有两个 `Progress` 条（总体 + 单文件）的 `Dialog`。成功或失败时显示 Toast 通知。通过 `beforeunload` 在上传期间阻止浏览器导航。

**参数：**
- `endpoint`（默认 `''`）— 接收文件 POST 请求的服务器 URL。
- `files`（默认 `[]`）— 要上传的文件。接受 `File[]` 或 `FileList`（来自 `<input>`）。
- `options` — 参见下方 `UploadOptions`。

**行为：**
1. 显示信息 Toast "Uploading files..." 并打开进度对话框。
2. 顺序遍历文件。对每个文件：
   - 构建 `FormData`，包含 `filename`、`file`、`type`（如已设置）和 `operation: 'upload_file'`。
   - POST 到端点，带有 XHR 进度跟踪（更新两个进度条）。
   - 每个文件上传成功后调用 `singleFileUploadCallback(file)`。
3. 成功时：显示成功 Toast，可选通过 PJAX 导航。
4. 出错时：记录到控制台，显示带有消息的错误 Toast。
5. 完成后：等待 500ms，关闭对话框。

## 接口

### UploadOptions

```ts
interface UploadOptions {
  type?: string;                          // 作为 'type' 附加到 FormData 中
  pjax?: boolean;                         // 上传后通过 PJAX 导航
  sidebar?: boolean;                      // 在 PJAX URL 中附加 'sidebar=true'
  singleFileUploadCallback?: (file: File) => any;  // 每个文件成功后调用
  filenameCallback?: (file: File) => string;       // 自定义文件名覆盖
}
```

- `type` — 作为表单字段传递；用于在服务端对上传进行分类。
- `pjax` — 为 `true` 时，所有上传完成后执行 PJAX 导航到 `endpoint`（`type` 值作为查询参数 `d` 传递，`sidebar` 作为 `sidebar=true` 传递；使用 `push: false` 不产生历史记录）。
- `sidebar` — 在 PJAX URL 中添加 `sidebar=true`。
- `singleFileUploadCallback` — 每个单独文件上传成功后调用的异步回调。
- `filenameCallback` — 覆盖发送到服务器的文件名；默认为 `file.name`。
