# OpenNARS 3.0.4 TypeScript Web Terminal

这个目录是 `https://arcj137442.github.io/opennars-304-ts/` 的静态网页源。

## 文件职责

- `index.html`、`styles.css`、`app.js`：人工维护的网页壳与交互逻辑；
- `nars-worker.js`：由 OpenNARS TypeScript 源码生成的浏览器 Worker bundle；
- `build-meta.json`：生成时所用的版本、源码 commit 与构建时间。

Worker 中嵌入 OpenNARS 的 `config/defaultConfig.xml`，并为 jree 暴露但浏览器不具备的 Node.js 内置模块提供最小只读适配。文件系统、子进程、会话保存和加载不属于网页运行时能力。

## 可复现构建

默认情况下，构建脚本从本仓库相邻开发目录中的 `OpenNARS-304-ts` 读取源码；也可以显式指定路径：

    npm install
    $env:OPENNARS_TS_ROOT = "C:\path\to\clean\OpenNARS-304-ts"
    npm run build:opennars-304-ts
    npm run check:opennars-304-ts

构建脚本拒绝使用带有已跟踪修改的 OpenNARS 工作区。若主开发目录正在被其他 Agent 修改，应从目标 commit 创建干净 worktree，再把 `OPENNARS_TS_ROOT` 指向该 worktree。只有明确接受不可复现产物时，才应设置 `ALLOW_DIRTY_OPENNARS=1`。

如果干净 worktree 没有安装依赖，可以令 `OPENNARS_NODE_MODULES` 指向同版本 OpenNARS 工作区的 `node_modules`。

## 本地验收

在站点仓库根目录运行静态服务器：

    python -m http.server 8765 --bind 127.0.0.1

访问 `http://127.0.0.1:8765/opennars-304-ts/`，至少验证：

1. 页面显示 core 3.0.4、TS 包版本、源码 commit 和构建时间；
2. Worker 状态从 `BOOTING WORKER` 变为 `WORKER ONLINE`；
3. 依次提交 `<bird --> animal>.`、`<bird --> animal>?` 和 `:cycles 10`；
4. 输出包含稳定的 `OUT:`、`Answer:` 与 `[shell] cycles=10 time=10`；
5. `↑` 能召回历史命令，`Ctrl+L` 能清屏，`Ctrl+C` 或 `RESET SESSION` 能中断并创建全新 reasoner；
6. 390px 宽移动视口没有横向溢出，终端输入和快捷按钮可操作。

站点仓库的 `main` 推送后由 GitHub Pages 自动部署。
