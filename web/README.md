# Auto Answer Web

基于 Bun + Next.js + shadcn ui + TailwindCSS 的答题管理页面。

## 功能

- 登录页（账号 + 密码）
- 登录后展示当月答题统计（已答题 / 待补答 / 休息日）
- 日历视图展示每天状态
- 未答题日期支持单日补答
- 支持当月一键补答

## 环境变量

在 `web/.env.local` 配置：

```env
KEY=你的Base64密钥
IV=你的IV
```

## 运行

```bash
cd web
bun install
bun run dev
```

生产构建：

```bash
bun run build
bun run start
```
