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
