---
contentId: praxis-project-0001
title: '构建 Praxis：从知到行的第一项长期实践'
slug: praxis-foundation
type: project
stage: think-act
status: ongoing
publishedAt: '2026-07-24'
updatedAt: '2026-07-26'
summary: '从内容模型、编辑型首页到静态部署，记录 Praxis 如何把“知行合一”变成一套可以长期维护的个人实践系统。'
tags:
  - 知行合一
  - 个人博客
  - Astro
  - 产品设计
journey:
  question: '怎样建立一个不止用于发布文章，而是能够持续记录认知、行动和成果的个人网站？'
  thinking: '内容必须长期属于作者本人，因此 Markdown 与 Git 是事实源；type 负责内容组织，stage 负责表达实践进度，两者不应互相替代。'
  action: '从 Astro 官方基础项目搭建静态站点，建立统一内容 schema、Practice Heatmap、编辑型首页和可复用的部署边界。'
  outcome: 'Praxis v0.1 发布候选已经完成：静态首页、内容详情、实践热力图、双主题、SEO、RSS、Sitemap、404 与移动端体验共享同一套内容事实源，并通过类型、单元、静态构建、浏览器与可访问性验证；Docker build 与 Scout 待 daemon 可用时补验。'
  reflection: '先建立稳定的内容边界，再让视觉和统计从真实内容中生长，减少了后续返工。但“能构建”不等于“适合公开分享”，发现性、内容状态和生产门禁仍需要独立验收。'
  nextStep: '确认公开署名、个人简介和正式域名，备份并审阅现有 Caddy/Compose 配置；生产部署和线上 smoke 全部通过后再记录首次公开发布。'
practiceLog:
  - date: '2026-07-24'
    kind: learn
    note: '完成内容模型、URL、首页信息架构和部署边界的需求收敛。'
  - date: '2026-07-24'
    kind: practice
    note: '启动 Astro、TypeScript、Markdown 与 Tailwind CSS 的首个实现切片。'
  - date: '2026-07-24'
    kind: milestone
    note: 'Praxis 从规划阶段正式进入实现阶段。'
  - date: '2026-07-25'
    kind: milestone
    note: '首个静态基础切片通过类型、单元、静态构建与浏览器验证；Docker build 待 daemon 可用时补验。'
  - date: '2026-07-25'
    kind: practice
    note: '启动 Praxis v0.1 公开发布准备，建立可验证的上线门禁。'
  - date: '2026-07-25'
    kind: milestone
    note: 'Praxis v0.1 发布候选通过 SEO、RSS、Sitemap、可访问性与移动端验证；Docker build 待 daemon 可用时补验。'
  - date: '2026-07-26'
    kind: practice
    note: '完成一轮多视角安全审查：修复构建期代码执行风险，用测试锁定“无内联脚本样式”的 CSP 契约，并封堵工具链路径穿越。'
---

## 为什么开始 Praxis

很多内容系统擅长保存“已经写完的文章”，却很难呈现一个想法如何经过思考、行动和复盘，逐渐成为真正的成果。

Praxis 想解决的不是“再做一个博客”，而是建立一个可以长期使用的个人实践系统：正文负责完整表达，`journey` 沉淀当前认识，`practiceLog` 记录每一次值得被记住的实践。

## 当前选择

- 使用 Astro、TypeScript 与 Markdown，保持静态优先和高度可定制。
- 以 Git 管理全部内容，让修改历史和正文始终掌握在自己手中。
- 使用统一内容集合，通过 `type` 区分博客、笔记、日志和项目，通过 `stage` 表达实践进度。
- 使用 type-first URL，保证内容阶段变化时永久链接保持稳定。
- 复用现有 Docker Compose 与 Caddy，不为首版增加新的代理或服务端渲染层。

## 什么才算实践

Practice Heatmap 不统计 GitHub Commit，也不会把每一次错字修正当成进步。只有明确写入 `practiceLog` 的学习、实践、复盘和阶段成果，才会成为 Praxis 的实践记录。

这让统计保持克制：它不追求漂亮的数字，而是提醒我，真正重要的是有没有把理解转化为行动。

## 首个结果

当前阶段仍是“思而行”，但首个静态切片已经不再停留在方案里。首页、内容详情、热力图、主题系统和部署产物都已经运行起来，并通过了桌面、移动端、无 JavaScript 与可访问性验证；Docker build 仍待 daemon 可用时补验。

这也暴露出下一层问题：一个站点能够构建，不代表它已经适合公开分享。因此 v0.1 又补齐了 SEO、RSS、Sitemap、真实内容状态和可验证的发布门禁，并完成了本地发布候选验收。

正式发布仍没有被提前宣布。接下来需要确认公开署名、正式域名和服务器集成，在真实 HTTPS 环境完成上线后检查；只有这些事实真正发生，首次公开发布才算完成。

这篇内容不会在 v0.1 结束。它会继续补充结果、问题和复盘，成为 Praxis 长期演进的第一条记录。
