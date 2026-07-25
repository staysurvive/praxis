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

## 开发

```powershell
npm install
npm run dev
```

## 验证

```powershell
npm run check
npm run test:e2e
npm run build
```

## 部署

构建产物位于 `apps/web/dist/`。部署说明见 [`infra/README.md`](./infra/README.md)。
