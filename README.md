# 🌌 Display-The-Work | 静态 Release 安全发布中心

这是一个基于 **GitHub Pages** 托管的暗黑玻璃拟态（Glassmorphism）风格静态发布主页，用于安全、灵活、全自动地将**私人仓库（Private Repository）**中特定的 Release 二进制包、压缩包及更新日志发布出来。

---

## ✨ 项目亮点与核心安全机制

在将私有仓库的资产发布到静态网页时，本系统提供了以下核心机制：

1. **绝对安全（零 Token 泄露）**：
   - 传统的静态网页通过前端硬编码个人访问令牌（PAT）请求 GitHub 私有 API 是极度危险的。
   - **安全原理**：仅在**私人仓库**配置 GitHub Action。当手动触发 Action 时，工作流会自动从私有仓库下载本次 Release 的资产并拉取日志，自动**推送到此公开的 Pages 仓库中**进行物理托管。前端静态页面仅需读取本公开仓库内的相对路径文件，**无需在浏览器端暴露任何 Token！**
2. **100% 手动发布控制（非强制自动）**：
   - 本项目提供的 Action 采用 `workflow_dispatch` 手动触发机制，由开发者自行决定将哪一个稳定版本（Tag）公开给外界，测试版和未就绪版本不会发生流出。
3. **极佳的视觉与交互体验**：
   - 采用现代化暗黑极光太空背景，配合毛玻璃模糊容器。
   - 动态识别资产文件后缀（如 `.dmg`、`.zip`、`.crx` 等），智能分发专属的高清内联 SVG 图标，零时延渲染。
   - 内置高规格的骨架屏（Skeleton Loading）过渡动画和异常状态（空状态、报错重试）状态转移。
   - 对所有富文本进行安全防注入转义，防范 XSS 漏洞。

---

## 📂 项目目录结构

```text
Display-The-Work/
├── .github/
│   └── templates/
│       └── sync-to-public.yml  # 💡 共享的通用一键手动同步 Action 模板
├── data/
│   └── releases.json           # 存放已同步的 Release 元数据数据库（由 Action 自动写入）
├── downloads/                  # 存放已同步并分发的 Release 二进制/压缩资产包
├── index.html                  # 静态发布主页（集成骨架屏和 Marked.js 富文本解析）
├── index.css                   # 暗黑极光毛玻璃拟态 CSS 样式表（响应式设计系统）
├── index.js                    # 前端核心控制引擎（图标分发、时间转换与生命周期控制）
├── .gitignore                  # Git 忽略规则文件
└── README.md                   # 项目官方指引手册
```

---

## 🛠️ 三步对接私有仓库

要把此页面配置为某个私人仓库（如插件、桌面客户端、命令行工具等）的发布页面，只需执行以下三个步骤：

### 步骤 1：在私有仓库中创建工作流文件
直接复制本公开仓库中 `[.github/templates/sync-to-public.yml](.github/templates/sync-to-public.yml)` 的内容，保存到**私有仓库**的 `.github/workflows/sync-to-public.yml` 文件中。

### 步骤 2：在私有仓库中配置公开仓库写入密钥 (`SYNC_PAT`)
1. **生成 Token (Classic)**：
   - 访问路径：`GitHub 头像` -> `Settings` -> `Developer settings` -> `Personal access tokens` -> `Tokens (classic)`。
   - 点击 `Generate new token`，**勾选 `public_repo`** 权限（如果当前的 `Display-The-Work` 是公开仓库）。
   - 生成并安全复制该 Token 秘钥。
2. **将 Token 配置到私有仓库的 Secrets 中**：
   - 进入**私有开发仓库主页** -> 点击右上角 `Settings` 选项卡。
   - 在左侧边栏找到 `Secrets and variables` -> 点击 `Actions`。
   - 点击右上角的 `New repository secret`，名称（Name）填入：**`SYNC_PAT`**，内容（Value）填入刚才生成的 Token 秘钥，点击保存。

### 步骤 3：一键运行手动分发
1. 访问**私有开发仓库**的 `Actions` 选项卡，在左侧选择 `Universal Release Sync to Public Pages` 工作流。
2. 点击右侧的 `Run workflow` 绿色下拉按钮：
   - **【版本号】** 输入需要对外公开下载的私有 Release Tag（例如 `v1.2.0`）。
   - **【目标公开仓库】** 默认为 `Dhgaj/Display-The-Work`。
3. 点击绿色 `Run workflow` 按钮启动运行。
4. 运行完成后，本公开仓库的 `data/releases.json` 和 `downloads/` 目录就会被全自动更新，静态网页便会顺畅呈现最新版本。

---

## 🧪 本地开发与预览指南

在本地修改或预览网站设计效果的步骤：

1. **进入工作目录**：
   ```bash
   cd Display-The-Work
   ```
2. **启动本地静态服务器**（避免直接双击 index.html 触发浏览器同源策略限制）：
   ```bash
   npx http-server -p 8088
   ```
3. **在浏览器中访问**：
   👉 **[http://localhost:8088](http://localhost:8088)**
