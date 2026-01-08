# Idea Planner

一个极简黑白风格的桌面应用，包含：
- 番茄时钟计时（专注 + 休息，可拖动调整时长）。
- 每日规划与任务清单（本地保存 + 线性流程图）。
- 开机自启动开关（Electron 登录项）。
- 一键跳转到 ChatGPT 与 Gemini 的对话入口。
- 日间/夜间模式自由切换。

## 安装与运行

```bash
npm install
npm run start
```

## 打包为 Windows .exe

```bash
npm run build:win
```

生成的安装包位于 `dist/` 目录中，运行 `IdeaPlanner-Setup-1.0.0.exe` 安装即可。
