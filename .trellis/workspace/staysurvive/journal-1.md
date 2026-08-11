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


## Session 5: 第二篇真实内容：先审后信（安全审查实践笔记）

**Date**: 2026-07-26
**Task**: 第二篇真实内容：先审后信（安全审查实践笔记）
**Branch**: `main`

### Summary

Session summary was not supplied.

### Main Changes

## 本次会话完成

写入站点第二篇真实内容：`content/notes/ai-code-security-review.md`（praxis-note-0001，type=note，stage=act-achieve，status=reflected）。主题是上一轮对 AI 写的代码做的对抗式安全审查——多视角并行查找、相互否证、结论契约化，符合章程"只记录已经发生的实践"。

### 关键决策

- **不写显式 practiceLog**：该实践已记录在项目条目（praxis.mdx 2026-07-26 practice 事件）中，笔记只贡献 publishedAt 合成的一条 publish 事件，避免热力图重复计数。数据集 8→9 事件、3 活跃天。
- **标点统一为全角**：初稿混用半角逗号/引号，与项目条目的排版规范不一致；提交前全文改为全角标点（，、：、“”），符合章程"优秀中文排版"。
- 正文修正一处事实精度：18 条原始发现 → 去重合并为 10 条 → 6 确认 4 驳回。

### 测试与验证

- e2e 更新（site.spec.ts）：RSS 断言 2 个 item + 新笔记 link；sitemap 增加 /notes/ai-code-security-review；新增导航测试（笔记列表 → 详情，role-scoped 选择器避免 strict mode 冲突）。
- npm run check 绿（31 单测）；npm run test:e2e 28/28 通过（chromium + mobile-chromium）。
- 截图目检：详情页排版、Journey 六段、时间轴、列表页均符合编辑型设计。

### 提交

- 2b500ee content: add security-review practice note

### 遗留

- 生产部署仍等待用户提供署名/域名/服务器接入信息；任务不归档。
- Docker digest 锁定仍待联网环境。


### Git Commits

| Hash | Message |
|------|---------|
| `2b500ee` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 6: 发布第一篇日志：门禁全绿之后

**Date**: 2026-07-26
**Task**: 发布第一篇日志：门禁全绿之后
**Branch**: `main`

### Summary

Session summary was not supplied.

### Main Changes

发布第一篇日志 content/journal/what-green-gates-miss.md（praxis-journal-0001，status: reflected）。

流程：初稿 → ultracode 对抗式评审 workflow（11 项去重发现：8 项确认并全部落地，1 项证伪，2 项 verify agent 两次 ECONNRESET 丢失后依据仓库证据自行裁决——其一为 status completed→reflected 已应用，其一判定失效）。所有门禁复跑全绿：npm run check（astro check 0 错误 / 31 单测）、npm run test:e2e 30/30。截图目检完成（详情页 meta 行确认渲染「已复盘」）。

配套改动同 commit：e2e 新增日志导航/RSS 3-item/sitemap 断言；首页 currentProject 改用 listEntries({type:'project'}) 与 Latest top-3 解耦；日志页并入 capture-screenshots.mjs 并删除一次性截图脚本。

Spec 更新：frontend/index.md 中 "only production entry" 注释改为多类型表述（cfd7832）；内容/测试/页面改动均沿既有模式，无其他 spec 变更必要。

遗留：v0.1 生产部署待用户提供署名/域名/服务器事实；任务 07-25-praxis-v0-1-public-release 保持 in_progress，不归档。


### Git Commits

| Hash | Message |
|------|---------|
| `c5ecb32` | (see git log) |

### Testing

- Validation was not recorded for this session.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 7: v0.1 视觉、品牌与热力图迭代

**Date**: 2026-08-01
**Task**: v0.1 视觉、品牌与热力图迭代
**Branch**: `main`

### Summary

同步 2026-07-30 至 2026-08-01 的 8 次本地提交：完善首页版式、统一编辑型面板、优化交互动效与 Practice Heatmap，并接入品牌 favicon 和站点页眉标识。

### Main Changes

- 首页 Hero 按桌面视口重新对齐，删除已与最新内容重复的 Now 区块；全站编辑型面板统一最小高度、边框、留白和纵向节奏，相关可复用约束已随 `8a51804` 写入 frontend styling spec。
- 交互动效改为只过渡 `opacity`、`transform` 和必要颜色属性，移除 `transition: all` 与布局属性动画；保留 reduced-motion 和无 JavaScript 阅读边界。
- Practice Heatmap 增加月份/星期标尺、年度实践总数、色阶图例和本地化 tooltip；月份标签由 `buildHeatmapMonths()` 纯函数生成并有单元测试，顶行 tooltip 通过滚动容器预留 gutter 防止裁切。
- 品牌资产集中保存在 `apps/web/public/brand/`，根路径 favicon 作为生产入口；`BaseLayout.astro` 声明 SVG、16/32/48 PNG 与 ICO fallback，页眉使用 32px mini mark，资产用途记录在 `docs/brand-assets.md`。
- E2E 覆盖首页视口、品牌标识与 favicon 声明、Heatmap tooltip 几何边界，以及交互动效不得引发布局变化等回归契约。

### Git Commits

| Hash | Message |
|------|---------|
| `653cfb1` | (see git log) |
| `8a51804` | (see git log) |
| `fbe5657` | (see git log) |
| `6a753d3` | (see git log) |
| `ae1f632` | (see git log) |
| `093faf4` | (see git log) |
| `6104c59` | (see git log) |
| `64104a8` | (see git log) |

### Testing

- 各提交包含对应的 Vitest / Playwright 回归断言；本次操作仅同步 Trellis 记录，未重新执行完整质量门禁。

### Status

[OK] **Completed**

### Next Steps

- 生产部署仍等待公开署名、正式域名与现有服务器 Caddy/Compose 接入边界；`07-25-praxis-v0-1-public-release` 保持 `in_progress`，完成线上 smoke 后再归档。


## Session 8: Architecture refactor phases 3-5

**Date**: 2026-08-11
**Task**: Architecture refactor phases 3-5
**Branch**: `main`

### Summary

Unified authored source and identity rules, extracted Knowledge and Practice Heatmap view-models, removed presentation labels from ContentSummary, preserved public behavior and Practice JSON, and synchronized the resulting contracts into Trellis specs and task records.

### Git Commits

| Hash | Message |
|------|---------|
| `f4e1b6e` | (see git log) |
| `34ba1b4` | (see git log) |
| `873b257` | (see git log) |
| `b9e25fc` | (see git log) |
| `2917e3d` | (see git log) |
| `6755a8d` | (see git log) |

### Status

[OK] **Completed**


## Session 9: Trellis archive reference validation

**Date**: 2026-08-11
**Task**: Trellis archive reference validation
**Branch**: `main`

### Summary

Updated the frontend spec and archived task context manifests to their final archive paths, then revalidated all context references after task archival.

### Git Commits

| Hash | Message |
|------|---------|
| `404c36d` | (see git log) |

### Status

[OK] **Completed**


## Session 10: Phase 6B Journey Experience

**Date**: 2026-08-12
**Task**: Phase 6B Journey Experience
**Branch**: `main`

### Summary

Implemented a data-backed Journey projection, compact trajectory UI, Journey Heatmap mode, accessible source-linked timeline, focused regression coverage, responsive browser validation, and synchronized frontend Trellis contracts.

### Git Commits

| Hash | Message |
|------|---------|
| `5ee155e` | (see git log) |

### Status

[OK] **Completed**
