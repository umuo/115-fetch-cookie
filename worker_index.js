export default {
  async fetch(request) {
    const url = new URL(request.url);
    // 从查询参数中获取目标URL
    const targetUrl = url.searchParams.get('target');

    if (!targetUrl) {
      return new Response('请求错误: "target" 查询参数缺失', { status: 400 });
    }

    // 创建一个新的请求到目标URL，复制原始请求的方法和headers
    // 特别注意要为POST请求复制body
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'POST' ? await request.text() : null,
    });
    
    // 发送请求到115服务器
    const response = await fetch(newRequest);

    // 创建一个新的响应，以便我们可以修改headers
    const newResponse = new Response(response.body, response);

    // **关键：添加CORS头，允许任何来源(*)访问**
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return newResponse;
  },
};
