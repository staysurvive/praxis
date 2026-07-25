# Praxis

知而思，思而行，行而成。

Praxis 是一个以“知行合一”为核心理念的个人实践站。正文由 Git 管理的 Markdown/MDX 驱动，Astro 负责静态构建，实践热力图由内容中的 `publishedAt` 与显式 `practiceLog` 在构建时生成。

## 技术边界

- Astro + TypeScript + MDX
- Tailwind CSS 用于布局，CSS Custom Properties 管理设计 token 与 Light/Dark 主题
- 根目录 `content/` 是内容事实源
- `apps/web` 是当前静态站点
- `apps/api` 保留给未来 FastAPI，不在首版实现
- `infra/` 提供复用现有 Docker Compose + Caddy 的部署示例

## 本地启动

### 环境要求

- Node.js `>= 22.12.0`
- npm（随 Node.js 安装）

所有命令均在仓库根目录执行。

### 首次运行

```powershell
npm ci
npm run dev
```

开发服务器启动后访问：<http://localhost:4321/>

`npm run dev` 会先扫描根目录 `content/`，生成 Practice Heatmap 所需的本地数据，然后启动 Astro 开发服务器。修改页面、组件或内容后，浏览器会自动刷新。

### 生产构建与预览

```powershell
npm run build
npm run preview
```

生产文件会生成到 `apps/web/dist/`。本地预览默认同样使用 <http://localhost:4321/>；如果开发服务器仍在运行，请先停止开发服务器再执行预览。

## 验证

```powershell
npm run check
npm run audit:deps
npm run test:e2e
npm run build
```

## 部署

构建产物位于 `apps/web/dist/`。部署说明见 [`infra/README.md`](./infra/README.md)。
