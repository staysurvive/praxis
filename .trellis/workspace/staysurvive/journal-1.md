# Journal - staysurvive (Part 1)

> AI development session journal
> Started: 2026-07-24

---



## Session 1: Praxis foundation

**Date**: 2026-07-25
**Task**: Praxis foundation
**Branch**: `main`

### Summary

Implemented and verified the first static Praxis blog foundation, including unified MDX content, local practice activity, editorial UI, themes, tests, deployment boundary, and Trellis coding specs.

### Main Changes

- Detailed change bullets were not supplied; see the summary above.

### Git Commits

| Hash | Message |
|------|---------|
| `73bd822` | (see git log) |
| `f985fe5` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 2: Editorial magazine UI polish

**Date**: 2026-07-26
**Task**: Editorial magazine UI polish
**Branch**: `main`

### Summary

Applied the magazine-style editorial redesign across apps/web, verified with check/build/e2e and screenshots, recorded styling guidelines in the frontend spec, and committed Claude Code Trellis platform assets plus CLAUDE.md.

### Main Changes

### Main Changes

- Applied the editorial magazine visual language across `apps/web/src` (17 files): warm-paper palette, scotch rules with folio counters, serif display typography (system stacks only, no webfonts), justified CJK article prose, flat 2px radii, red seal chip, and a CSS-only heatmap that opens scrolled to the newest weeks (rtl container + ltr grid).
- Extended `.text-link` with an invisible hit-area (`::before { inset: -0.65rem 0 }`) for comfortable tap targets without layout shift.
- Recorded the new design language in `.trellis/spec/frontend/styling.md` ("Editorial magazine patterns" section) and refreshed the stale token examples.
- Committed the Claude Code Trellis platform assets (`.claude/` agents, skills, commands, hooks) and the repository `CLAUDE.md` guide.

### Testing

- `npm run check`: format + lint + typecheck + 31/31 unit tests passing.
- `npm run build`: 7 pages, sitemap generated.
- `npm run test:e2e`: 24/24 passing across chromium and mobile-chromium (metadata, RSS/sitemap/robots, 404, themes, no-JS reading, Axe, 320px overflow).
- 7 screenshots (home/list/detail/404/empty, light/dark, desktop/mobile) reviewed and confirmed good.

### Notes

- `apps/web/shoot.mjs` and `apps/web/shots/` are temporary screenshot tooling, intentionally left uncommitted.
- Task `07-25-praxis-v0-1-public-release` stays `in_progress`: all pre-deployment acceptance criteria are checked, but the production-deployment gate (real domain + existing Caddy/Compose integration) is still open per the PRD's external release gate.


### Git Commits

| Hash | Message |
|------|---------|
| `634faea` | (see git log) |
| `da0225e` | (see git log) |
| `999dbbf` | (see git log) |
| `47a01a7` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 3: 安全审查与修复:构建期 RCE、CSP 契约、路径穿越

**Date**: 2026-07-26
**Task**: 安全审查与修复:构建期 RCE、CSP 契约、路径穿越
**Branch**: `main`

### Summary

多视角安全审查确认 6 项漏洞并修复:gray-matter 构建期 RCE、CSP 内联脚本/样式测试契约、Docker digest 锁定文档、Trellis/hook 路径穿越;完整质量门全绿。

### Main Changes

## 背景

对 Praxis 仓库做了一次多视角对抗式安全审查(5 路并行 Find + top-10 对抗式 Verify)。18 条原始发现去重后确认 6 项,4 项被驳回,7 项透传。随后按严重度修复并跑通完整质量门。威胁模型:静态站点 + 站主自撰(半可信)内容 + Caddy CSP。

## 已修复(commit)

- `82770b5` fix(web):封掉 gray-matter 默认启用的可执行 frontmatter 引擎。内容文件以 `---js` 开头会被 eval() 解析 —— 构建期任意代码执行(medium)。生成器改为仅允许 YAML,js/javascript 引擎抛错。文件:`apps/web/scripts/generate-practice-data.ts`。
- `8e24ce8` test(web):新增详情页断言 + 全 `dist/` 扫描,断言产出 HTML 无内联 `<script>`/`<style>`,锁定 Caddy CSP `script-src/style-src 'self'` 契约(low)。文件:`apps/web/tests/e2e/site.spec.ts`。
- `3c59aab` docs(infra):记录基镜像 digest 锁定要求与 `imagetools` 取值命令(low)。因本机无镜像仓库访问,未插入真实 digest 以免破坏构建 —— 待联网机器执行后补 `@sha256:`。文件:`infra/Dockerfile.web`。
- `5e825a8` fix(tooling):Trellis `task create` 拒绝穿越 slug、`archive` 在移动前将目标限定在 tasks 目录内;子代理 hook 文件/目录读取限定在基准目录内(low)。文件:`.trellis/scripts/common/task_store.py`、`.claude/hooks/inject-subagent-context.py`。

## 验证

- `npm run check`:format ✓ / lint ✓ / typecheck 0 errors ✓ / 31 单测 ✓(generate:practice 经新 parseFrontmatter 仍正确产出 7 events / 2 days)。
- `npm run build`:7 页 ✓。
- `npm run test:e2e`:26/26 通过(chromium + mobile-chromium),含 2 项新增/扩展的 CSP 断言。
- Python 冒烟:`task.py list` ✓;穿越 slug 被拒 ✓;越界 archive 被拒且未移动探针目录 ✓。

## 遗留 / 注意

- #3 仅文档化,digest 尚未真正 pin —— 需在有网络/Docker 的机器上执行 Dockerfile 中留的 `docker buildx imagetools inspect ... --format '{{.Manifest.Digest}}'` 后补上。
- `5e825a8` 改动的是 vendored 的 Trellis / `.claude` 工具代码;未来 Trellis 模板同步可能覆盖这些补丁,并可能触发 `.trellis/.template-hashes.json` 不匹配告警。
- 有意排除、保持未跟踪:`apps/web/shoot.mjs`、`apps/web/shots/`(截图工具与产物)。


### Git Commits

| Hash | Message |
|------|---------|
| `82770b5` | (see git log) |
| `8e24ce8` | (see git log) |
| `3c59aab` | (see git log) |
| `5e825a8` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 4: 产品章程落地:内容事件、截图工具正规化、charter 持久化

**Date**: 2026-07-26
**Task**: 产品章程落地:内容事件、截图工具正规化、charter 持久化
**Branch**: `main`

### Summary

对齐产品章程与仓库现状:裁决 React 缓引入与 roadmap 随内容两项偏差并写入 docs/charter.md;praxis.mdx 记录安全加固实践事件;shoot.mjs 正规化为 npm run shots;check + e2e 全绿。

### Main Changes

## 背景

用户发布了 Praxis 产品章程(CTO/PM/设计/Reviewer 四重角色、产品>UX>维护>质量>效率的优先级、8 步工作模式),并授权由 Claude 自主决策推进。本会话完成章程与仓库现状的对齐审计,并落地三项收尾工作。

## 决策

- **React**:章程允许少量交互组件,但裁决为「未来授权而非现在义务」——保持零框架,直到出现原生脚本难以维护的复杂交互。
- **roadmap 内容类型**:内容先行——第一篇真实 roadmap 内容出现时再扩展 `domain.ts` 注册表,空路由违背「只展示已发生的实践」。
- 两项裁决连同章程全文持久化到 `docs/charter.md`,CLAUDE.md 增加指针。

## 变更(commit)

- `0c7839e` content:praxis.mdx 增加 2026-07-26 安全加固 practice 事件,updatedAt 升至 07-26,e2e 的 article:modified_time 断言同步。热力图数据集从 7 事件/2 天增长到 8 事件/3 天。
- `0d9d32e` chore(web):游离的 shoot.mjs 正规化为 `scripts/capture-screenshots.mjs` + `npm run shots`,shots/ 产物目录进 .gitignore。评审辅助工具,不进 CI。
- `58675ff` docs:新增 `docs/charter.md`(定位、优先级、事实源红线、视觉原则、8 步流程、两项已裁决偏差),CLAUDE.md 指向它。

## 验证

- `npm run check` 全绿(format/lint/typecheck 0 errors/31 单测)。
- `npm run test:e2e` 26/26 通过(chromium + mobile-chromium),含更新后的 modified_time 断言。
- `npm run shots` 冒烟通过,截图正常产出。

## 遗留

- Docker 基镜像 digest pin 仍被网络阻塞(auth.docker.io 持续超时),Dockerfile 内已留命令,待联网环境执行。
- v0.1 生产部署段(署名/域名/Caddy 接入/上线检查)依赖用户提供外部信息,checklist 保持未勾选。


### Git Commits

| Hash | Message |
|------|---------|
| `0c7839e` | (see git log) |
| `0d9d32e` | (see git log) |
| `58675ff` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete
