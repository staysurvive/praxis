# Knowledge 侧栏 CC Switch 风格优化：实施计划

## 1. Source and Context

- [x] 保存用户两张参考截图。
- [x] 检查 CC Switch 官方文档实页、编译后源码与 CSS token。
- [x] 测量 1280px 视口的侧栏、搜索框和导航行几何。
- [x] 读取 Product Design、Browser、Trellis 与前端规范。

## 2. Implementation

- [x] 安装 `lucide-astro`。
- [x] 重构 `KnowledgeSidebar.astro` 的搜索、图标、链接行与移动 summary。
- [x] 把宽屏左轨收紧到 `18rem`。
- [x] 更新集中式文案和前端组件规范。
- [x] 更新 E2E 几何、图标和无可见计数断言。

## 3. Verification

- [x] 定向 Prettier、Lint、TypeCheck、Unit、Build。
- [x] 全量 E2E，覆盖桌面、移动、no-JS、Axe 和 overflow。
- [x] 捕获 Light、Dark、移动截图与同图对比。
- [x] 更新 `design-qa.md` 到 `final result: passed`。

## 4. Handoff

- [x] 保持本地预览运行并打开最终 Knowledge 页面。
- [x] 汇总视觉变化、测试结果和剩余 P3。
