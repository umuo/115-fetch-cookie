# 115-fetch-cookie
扫码读取115 Cookie

## 简介
本项目模板提供扫码读取 115 cookie 功能。

项目代码采用尽可能采用前端模式，以减少对后端服务器的依赖，但由于需要向 115 官方发送 RESTFUL 请求，跨域问题难以完全在前端解决，因此引入 Cloudflare worker 代理的方式解决跨域问题。

## Cloudflare 代理部署方案

Cloudflare Workers 提供了一个绝佳的免费方案来创建代理。步骤如下：

1. 注册 Cloudflare: 如果您还没有账户，请注册一个。
2. 进入 Workers & Pages: 在仪表盘中找到并进入。
3. 创建 Worker:
4. 点击 "Create Application" -> "Create Worker"。
5. 给你的 Worker 起一个名字 (例如 my-115-proxy)，然后点击 "Deploy"。
6. 编辑代码:点击新创建的 Worker 上的 "Edit code" 按钮。
7. 将编辑器中的默认代码替换为`worker_index.js`中代码
8. 保存并部署: 点击 "Save and deploy"。
9. 部署后，你的 Worker 会有一个 URL，例如 my-115-proxy.your-username.workers.dev。
10. 修改 index.html 文件，修改 PROXY_URL 常量：
```JavaScript
const PROXY_URL = 'https://my-115-proxy.your-username.workers.dev/?target=';
```
11. 修改`worker_index.js`中的 `ALLOWED_ORIGINS`：
- 如果您在本地测试：代码中默认包含了 'null' (用于 file:// 协议) 和对 http://localhost 的支持，您无需修改。
- 如果您部署到线上：假设您将 index.html 部署到了 Vercel，地址是 https://my-115-login.vercel.app。您需要将 `ALLOWED_ORIGINS` 数组修改为：
```JavaScript
const ALLOWED_ORIGINS = [
  'https://my-115-login.vercel.app',
  'null',
  'http://localhost', 
];
```

现在，当用浏览器打开 index.html 时，所有的 API 请求都会通过 Cloudflare Worker 代理，成功绕过 CORS 限制，整个流程就能顺利完成了，也可以自行部署前端。
