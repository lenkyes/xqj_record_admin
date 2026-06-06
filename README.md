# 小晴记 Admin 管理平台

基于 Vue 3、Vite、TypeScript、Pinia、Vue Router、Element Plus、ECharts 构建，对接后台 `/api/v1/admin` 接口。

```bash
npm.cmd install
npm.cmd run dev
```

默认接口前缀为 `/api/v1/admin`，本地开发代理目标可在 `.env` 中设置：

```env
VITE_API_BASE_URL=/api/v1/admin
VITE_API_PROXY_TARGET=http://127.0.0.1:8080
```
