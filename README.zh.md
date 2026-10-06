> 社区翻译（草稿）—— NTARI 政策 P2-002《全球多语言广播》。来源：README.md（英文原版，2026-10-05 快照）。本文件为机器辅助的社区草稿，依据 P2-002 §3.1 尚待区域维护者审校。根据 §2.2，核心技术规范仍以英文为准。
>
> 如发现译文有误，欢迎 fork 仓库并提交 Pull Request
> 来改进翻译：https://github.com/NTARI-RAND/agrinet-docs。翻译修正与代码贡献同样宝贵，我们诚挚欢迎。

# 网站

本网站使用 [Docusaurus](https://docusaurus.io/) 构建，这是一款现代化的静态网站生成器。

## 安装

```bash
yarn
```

## 本地开发

```bash
yarn start
```

此命令会启动本地开发服务器并打开一个浏览器窗口。大多数更改会实时生效，无需重启服务器。

## 构建

```bash
yarn build
```

此命令会将静态内容生成到 `build` 目录中，生成的内容可以由任何静态内容托管服务提供。

## 部署

使用 SSH：

```bash
USE_SSH=true yarn deploy
```

不使用 SSH：

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

如果您使用 GitHub Pages 进行托管，此命令可以便捷地构建网站并推送到 `gh-pages` 分支。

## 搜索配置

本站点内置了一个本地文档搜索功能，无需任何外部服务即可运行，因此本地开发和预览部署始终带有可用的搜索栏。当存在真实的 Algolia DocSearch 凭据时，我们会自动切换到 Algolia。Ask AI 现在单独配置，因此您可以根据所提供的凭据，只启用 Algolia 搜索而不启用 Ask AI，反之亦然。由 Algolia 驱动的搜索体验采用受 React.dev 启发的胶囊形触发按钮，并带有专门的 Ask AI 徽标，使访问者在对话式回答可用时能立即发现。

创建一个 `.env` 文件（或在 shell 中导出这些变量），填入以下值，以启用 Algolia 搜索和 Ask AI：

```bash
ALGOLIA_APP_ID="..."
ALGOLIA_API_KEY="..."          # Search-only API key
ALGOLIA_INDEX_NAME="..."

# Optional Ask AI configuration
ALGOLIA_ASSISTANT_ID="..."     # Algolia Ask AI assistant identifier

# Optional overrides if your Ask AI integration uses a dedicated application or index
# ALGOLIA_AI_APP_ID="..."
# ALGOLIA_AI_API_KEY="..."
# ALGOLIA_AI_INDEX_NAME="..."
```

仅当您的 DocSearch 应用已为该体验完成配置时，才需设置 Ask AI 变量；否则可以不设置。在没有这些变量的情况下，站点会继续使用内置的本地文档搜索（如果提供了 Algolia 凭据，则使用 Algolia），而不会尝试激活 Ask AI。当 Algolia 凭据和 Ask AI 助手同时存在时，配置会自动将该助手接入 DocSearch，使搜索弹窗能够像 React.dev 的体验一样显示对话面板。如果提供了 Algolia 凭据但将 Ask AI 字段留空，则会得到传统的仅 DocSearch 界面。
