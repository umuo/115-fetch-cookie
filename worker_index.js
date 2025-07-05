// =================================================================
// 安全配置: 请根据您的部署情况修改此部分
// =================================================================

/**
 * 允许代理访问的目标 API 域名列表。
 * @type {string[]}
 */
const ALLOWED_TARGET_HOSTNAMES = [
  'qrcodeapi.115.com',
  'passportapi.115.com',
];

/**
 * 允许调用此代理的前端页面源（协议+域名+端口）。
 * 部署后，请务必将其修改为您自己的前端页面地址。
 * @type {string[]}
 */
const ALLOWED_ORIGINS = [
  // 示例: 部署在 Vercel 或 Cloudflare Pages 上的地址
  // 'https://your-app-name.vercel.app', 
  // 'https://your-project.pages.dev',
  
  // 用于在本地电脑上直接打开 HTML 文件进行测试 (file://)
  'null',
  'https://115.lacknb.cn',
  'https://115-fetch-cookie.vercel.app',

  // 用于本地开发服务器, 例如 Vite 或 a live-server
  // 如果你的本地服务器是 http://localhost:3000, 则应写 'http://localhost:3000'
  // 这里使用 startsWith('http://localhost:') 来匹配任意端口
  'http://localhost', 
];


// =================================================================
// 代理逻辑
// =================================================================

export default {
  async fetch(request) {
    // 1. 获取并校验 Origin (请求来源)
    const origin = request.headers.get('Origin');
    
    // 检查 Origin 是否在白名单内
    const isOriginAllowed = origin && ALLOWED_ORIGINS.some(allowed => {
      if (allowed.startsWith('http://localhost')) {
        return origin.startsWith('http://localhost');
      }
      return origin === allowed;
    });

    if (!isOriginAllowed) {
      // 如果是预检请求但来源不允许，也直接拒绝
      if (request.method === 'OPTIONS') {
         return new Response('OPTIONS request from disallowed origin', { status: 403 });
      }
      // 对于非同源的 `file://` 请求, origin header 是 'null'
      if (origin !== 'null' || !ALLOWED_ORIGINS.includes('null')) {
        return new Response(`Request from origin '${origin}' is not allowed.`, { status: 403 });
      }
    }

    // 2. 处理 CORS 预检请求 (Preflight)
    if (request.method === 'OPTIONS') {
      return handleOptions(request, origin);
    }
    
    // 3. 校验目标 URL
    const url = new URL(request.url);
    const targetUrlString = url.searchParams.get('target');

    if (!targetUrlString) {
      return new Response('Error: "target" query parameter is missing', { status: 400 });
    }

    let targetUrl;
    try {
      targetUrl = new URL(targetUrlString);
    } catch (e) {
      return new Response('Error: Invalid "target" URL provided', { status: 400 });
    }
    
    // 检查目标 URL 的 hostname 是否在白名单内
    if (!ALLOWED_TARGET_HOSTNAMES.includes(targetUrl.hostname)) {
      return new Response(`Target host '${targetUrl.hostname}' is not allowed.`, { status: 403 });
    }

    // 4. 转发请求
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const response = await fetch(newRequest);
    const newResponse = new Response(response.body, response);

    // 5. 添加必要的 CORS 头到最终响应中
    // 使用具体的 origin 而不是 '*'，安全性更高
    newResponse.headers.set('Access-Control-Allow-Origin', origin);
    newResponse.headers.set('Vary', 'Origin'); // 告诉缓存，响应根据 Origin 不同而不同
    
    return newResponse;
  },
};

/**
 * 处理预检 OPTIONS 请求
 */
function handleOptions(request, origin) {
  const headers = {
    'Access-Control-Allow-Origin': origin, // 必须是请求的来源
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', // 允许的请求头
    'Access-Control-Max-Age': '86400', // 预检结果缓存一天
  };
  return new Response(null, { headers });
}
