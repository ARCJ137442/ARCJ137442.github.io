# 2025 vs 2026 简历对比分析 & 2026 简历草稿

---

## 一、2025 黑客松简历的核心叙事

### 自我定位
> 「一个普通小镇成长起来、喜欢对现有状况展开场景想象，并乐于将有意思的想象带到现实中来的人」

### 核心动机
> 「自己头脑中觉得有趣，然后想把它带到世界上看看」

### 关键弱点
- 沟通表达有弱点（「对方听不懂」）
- 活在自己的世界中
- 控制写代码的时间

### 转变意识
> 「仅靠自娱自乐并不能真正给他人、给自己带来什么」

### 网站自我描述
> 「只是个很简单的H5原生界面，因为许久没折腾过」

---

## 二、2025 到 2026 的变化

| 维度 | 2025 简历 | 2026 实际状态 |
|---|---|---|
| **身份** | 「辅助者」「帮助团队主干展开想法」 | exomind-team 核心贡献者（115 PR, 540 Issues） |
| **技术栈** | JS, AS3, Python, Julia, TS, Rust/WASM | 同上 + Kotlin(OpenSwipe), Shell(termux-agent-top), 更深的 Rust |
| **NARS** | 「品玩和研究」，写了 NARust-158 | 继续维护，但不再是唯一焦点 |
| **Agent** | 未提及 | session-extract-skill, entp-skill, termux-agent-top — Agent 工具链开发者 |
| **团队协作** | 「希望能作为辅助者」 | 已经在 exomind-team 中深度协作 |
| **产品** | 无 | 参与 ExoMind「生命成长助手」产品开发 |
| **开源贡献** | 提过 PR（PikaParser.jl） | opennars 9 个合并 PR, exomind 115 PR, codex PR, vibe-kanban PR |
| **个人系统** | 无 | life-series (数字花园), ob-notes (174MB 笔记) |
| **理论** | 无 | ACA 理论, CCC, DAG523 — 但未公开 |
| **自我认知** | 「自娱自乐」「活在自己的世界中」 | 仍然如此，但已经在行动上转变 |

### 最大的变化

**从「想成为辅助者」到「已经是核心贡献者」。** 2025 简历里说「希望能作为一位辅助者」，2026 年他已经在 exomind-team 里做了 115 个 PR、540 个 Issue，涉及 Focus Timer、Overlay Workbench、Release 工程、PTY 终端、SQLite/Rust 修复等核心功能。

**从「自娱自乐」到「构建生命操作系统」。** 2025 年只是 NARS 的「品玩者」，2026 年已经在参与构建一个完整的产品（ExoMind），有理论框架、有系统架构、有实际用户。

**但公开 profile 没有变。** GitHub 上仍然是「测试网站」和散装项目列表。这个鸿沟正是网站翻新要解决的。

---

## 三、2026 简历草稿

### 个人简历 · 2026

**ARCJ137442 / Argon**

> 从 Minecraft 模组到认知推理系统到 Agent 工具链——一个用代码探索「智能机器如何思考和工作」的人。

---

#### 核心身份

- **ExoMind 核心贡献者** — 参与构建「生命成长助手」产品，负责 Focus Timer、Overlay Workbench、PTY 终端、Release 工程等模块（115+ PR, 540+ Issues）
- **NARS 生态构建者** — 用 Rust/Julia/TypeScript 实现非公理推理系统的多语言工具链
- **Agent 工具链开发者** — 构建 Claude Code/Codex 的 session 提取、结构化辩论等 skill

---

#### 技术栈

| 领域 | 语言/工具 | 深度 |
|---|---|---|
| **系统编程** | Rust, WASM | 深 — NARust-158, NAVM.rs, BabelNAR.rs |
| **科学计算** | Julia | 深 — JuNarsese.jl (⭐5), BabelNAR.jl |
| **前端** | TypeScript, Vue 3, Vite | 中 — ExoMind Overlay, Narsese 演示 |
| **移动/桌面** | Kotlin, Tauri | 中 — OpenSwipe, TouchAI |
| **脚本/工具** | Python, Shell | 中 — session-extract-skill, termux-agent-top |
| **嵌入式** | Rust (ESP32) | 初步 — ESP32S3 视觉传输 |

---

#### 代表性项目

**开源产品贡献**
- **ExoMind** — 生命成长助手（exomind-team）。Focus Timer handoff 逻辑修复、Overlay Workbench IPC 初始化、PTY 终端生命周期规范化、Release 工程管理
- **OpenNARS-for-Applications** — 9 个合并 PR，包括 Windows 构建脚本、NAL 改进、代码清理

**推理系统实现**
- **NARust-158** — OpenNARS 1.5.8 的 Rust 重实现（⭐2, 活跃维护中）
- **JuNarsese.jl** — Narsese 数据结构与转换接口（⭐5, Julia 生态核心库）
- **Narsese-structure-illustrator+** — 交互式 Narsese 语法树可视化（Vue + WASM）

**Agent 工具链**
- **session-extract-skill** — 从 Claude Code/Codex session 文件中提取上下文
- **entp-skill** — 结构化辩论 skill，让 Agent 像辩论家一样切磋观点
- **termux-agent-top** — Termux 上的 Agent 树监控工具

**独立工具**
- **OpenSwipe** — 开源安卓手势导航（AccessibilityService）
- **TWayFoil** — 二进制 ↔ PNG 图像转换器（Rust WASM, 三语言实现）
- **ggwave-framing** — GGWave 声波数据传输分帧协议

---

#### 自我叙述

小学时在 Minecraft PE 里写模组，初二开始用 Flash/ActionScript 写游戏，高中用 Python 写小工具，大学接触 Julia 和 Rust，从此走上了「用代码把想象中的画面带到世界上」的路。

2024 年前主要在做 NARS（非公理推理系统）的多语言实现——用 Julia 写数据结构、用 Rust 写推理引擎、用 TypeScript 写模拟环境。2025 年开始转向 Agent 工具链和产品开发，加入 exomind-team 参与「生命成长助手」的构建。

现在的状态是：**白天在做 ExoMind 产品开发，夜晚在探索 NARS 和 Agent 的交叉地带，始终在追问一个问题——智能机器如何从经验中学习和推理？**

---

#### 个人特质

- **INTP** — 内在逻辑驱动，善于从「觉得有趣」出发探索事物的潜能
- **阶段性深度投入** — 每个阶段选定一个方向做到「能跑起来」，然后转向下一个兴奋点
- **「想象→实现」循环** — 脑海中想象画面 → 自学积累方法 → 工程编码实现，这个循环从 Minecraft 模组时代就没变过
- **从自娱自乐到协作** — 正在从「活在自己的世界中」走出来，通过 ExoMind 贡献和开源协作学习与人连接

---

#### 链接

- **GitHub**: [ARCJ137442](https://github.com/ARCJ137442)
- **个人网站**: [arcj137442.github.io](https://arcj137442.github.io/)
- **ExoMind**: [exomind-team](https://github.com/exomind-team)

---

## 四、2025 vs 2026 简历叙事对比

| 维度 | 2025 叙事 | 2026 叙事 |
|---|---|---|
| **开头** | 「一个普通小镇成长起来的人」 | 「从 Minecraft 模组到认知推理系统到 Agent 工具链」 |
| **核心动机** | 「觉得有趣，想带到世界上」 | 「探索智能机器如何思考和工作」 |
| **技术定位** | 列举语言（JS, AS3, Python...） | 按领域组织（系统编程, 科学计算, 前端...） |
| **团队协作** | 「希望能作为辅助者」 | 「ExoMind 核心贡献者」 |
| **NARS** | 「品玩和研究」 | 「NARS 生态构建者」 |
| **Agent** | 未提及 | 「Agent 工具链开发者」 |
| **弱点** | 「沟通表达有弱点」 | 「正在从自娱自乐走向协作」 |
| **网站** | 「只是个很简单的H5原生界面」 | 待更新... |

### 关键变化

**从「想要」到「已经」。** 2025 说「希望能作为辅助者」，2026 已经是核心贡献者。2025 说「品玩 NARS」，2026 已经构建了完整的多语言工具链。

**从「列举技能」到「讲故事」。** 2025 按语言列举技术栈，2026 按「我在探索什么问题」组织叙事。

**从「自娱自乐」到「系统构建」。** 2025 的所有项目都是个人实验，2026 有了团队协作、产品开发、理论框架。

**唯一的不变：仍然是那个「觉得有趣就去实现」的人。** 只是现在有趣的东西更大了——从 Minecraft 模组变成了生命操作系统。

---

*分析基于：2025-07-11 黑客松简历 PDF + GitHub 仓库分析 + 提交活动分析 + exomind-team 贡献分析*
