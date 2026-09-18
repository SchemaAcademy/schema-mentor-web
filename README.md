# SchemaMentor

一个用于理解存储引擎内部原理的中文交互学习平台。通过亲手操作、结构动画和同步解释，观察 B+ Tree 如何定位、写入与分裂。

## 设计与 AI 开发约定

**[设计与交互原则](docs/design-principles.md)** 是后续页面开发的主要依据，包含学习闭环、布局与视觉 token、动画规范、状态架构、交互边界、可复用 AI 任务模板和验收清单。AI 入口约定位于 [AGENTS.md](AGENTS.md)。

## 当前能力

- `/`：探索空间，含可操作的插入分裂小实验。
- `/simulators`：实验目录，包含 3 个可体验的存储引擎实验。
- `/simulators/bptree`：唯一整数键插入、逐层查找、临时溢出与分裂、不可变快照、暂停/单步/回放/速度、自定义输入、3 个预设与 2–5 键容量。
- `/simulators/lsm`：MemTable 有序写入、冻结、顺序 Flush、Level 0 文件与重复 key 的 Compaction；支持阈值调整、自定义键值和逐帧回放。
- `/simulators/bitcask`：追加日志、Keydir 到最新 offset 的映射、旧记录可见状态与合并回收；支持自定义键值和逐帧回放。
- `/guide`：观察任务、学习路径与教学模型边界。

WAL、数据页布局、删除、并发与真实磁盘 I/O 等主题尚未实现。每个实验明确标注了教学模型的边界；当前 B+ Tree 用键数模拟容量，单次分裂帧展示所有级联分裂的最终结构。

## 运行与验证

使用 Node.js 20.9+：

```bash
npm ci
npm run dev
# http://127.0.0.1:3000

npm run lint
npm run test
npm run build
```

Next.js 16、React 19、TypeScript、Tailwind CSS 4、Vitest。使用系统字体；无需配置数据库、账号或远程字体服务。

## 结构

```text
app/components/     导航、目录、树图、首页小实验、B+ Tree 实验界面
app/simulators/     实验目录和 B+ Tree 路由
app/guide/          学习指南
app/globals.css     全站视觉 token、布局、响应式与减少动画支持
lib/bPlusTreeSimulator.ts       领域模型
lib/bPlusTreeLesson.ts          教学快照、查找路径与结构统计
lib/*.test.ts                  领域与内容模型测试
content/                       MDX 内容模型示例（尚未接入页面渲染）
docs/design-principles.md       可持续迭代的设计与交互约定
AGENTS.md                      AI 开发入口
```

## 静态部署

配置保留 `output: 'export'`、`trailingSlash` 和可选 `BASE_PATH`。`npm run build` 生成 `out/`，可部署到 GitHub Pages 等静态托管服务。静态导出不要使用 `npm run start` 预览，可运行 `npx serve out`。

GitHub Actions 工作流位于 `.github/workflows/deploy-github-pages.yml`。在仓库 Settings → Pages 中选择 GitHub Actions；项目站点通过 `BASE_PATH=/<repo>` 构建。当前静态站点没有服务端存储，刷新页面会重新开始实验。
