# Auto Answer

基于 Bun 的自动化答题工具，用于每日答题和补答。

## 功能特性

- 每日自动答题
- 月度补答（补做未完成题目）
- AES 加密认证
- GitHub Actions 定时执行
- Telegram 消息通知

## 项目结构

```
.
├── index.ts           # 每日答题入口
├── index2.ts          # 月度补答入口
├── api/
│   └── api.ts         # API 客户端：登录、获取题目、提交答案
├── utils/
│   └── utils.ts       # AES 加密、请求封装、日志工具
├── types/
│   ├── app.d.ts       # 类型定义
│   └── global.d.ts    # 全局类型声明
└── .github/workflows/
    ├── answer.yml     # 每日定时执行
    └── answerMonth.yml # 手动触发月度补答
```

## 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `ACCOUNT` | 账号 | 是 |
| `PASSWORD` | 密码 | 是 |
| `KEY` | AES 密钥（Base64 编码） | 是 |
| `IV` | AES 初始向量 | 是 |
| `DATE` | 指定日期（可选，默认今天） | 否 |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | 否 |
| `TELEGRAM_CHAT_ID` | Telegram Chat ID | 否 |

## 本地运行

```bash
# 安装依赖
bun install

# 每日答题
bun run index.ts

# 月度补答
bun run index2.ts
```

## GitHub Actions 部署

### 1. 配置 Secrets

在仓库设置中添加以下 Secrets：

- `ACCOUNT` - 账号
- `PASSWORD` - 密码
- `KEY` - AES 密钥
- `IV` - AES 初始向量
- `TELEGRAM_BOT_TOKEN` - Telegram Bot Token（可选）
- `TELEGRAM_CHAT_ID` - Telegram Chat ID（可选）

### 2. 工作流说明

| 工作流 | 触发方式 | 说明 |
|--------|----------|------|
| `answer.yml` | 定时（每日 10:30 北京时间） | 自动完成当日答题 |
| `answerMonth.yml` | 手动触发 | 补答本月未完成的题目 |

### 3. 手动执行

在 Actions 页面选择工作流，点击 "Run workflow" 即可手动执行。

## 技术栈

- [Bun](https://bun.sh/) - JavaScript 运行时
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [crypto-js](https://github.com/brix/crypto-js) - AES 加密
- [dayjs](https://day.js.org/) - 日期处理

## 注意事项

- 休息日自动跳过答题
- 已完成的题目不会重复提交
- 执行结果会输出到 `output.txt` 文件

## License

MIT