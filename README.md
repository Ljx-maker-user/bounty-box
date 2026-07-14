# 🎯 技能悬赏箱 | BountyBox

> 知识有价，悬赏问答 — 让懂的人赚到钱

一个基于 **Next.js 14** 的技能悬赏平台。提问者发布问题并设定答谢金额 → 金额预扣托管 → 多人可回答 → 提问者采纳满意答案 → 金额自动转入回答者账户。

## 核心功能

- ❓ **发布悬赏** — 描述问题、选分类、设金额，系统预扣到平台托管
- 💡 **多人回答** — 多个回答者可提交答案，每人只能回答一次
- ✅ **采纳付款** — 提问者点采纳，答谢金自动转入回答者余额
- 💰 **钱包系统** — 充值（模拟/支付宝）、余额查看、交易记录
- 🏷️ **分类筛选** — 编程/设计/数学/翻译/法律/生活/职场/学习
- 📱 **响应式 UI** — 手机、PC 都适配

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) + Tailwind CSS |
| 后端 | Next.js API Routes |
| 数据库 | SQLite + Prisma ORM |
| 认证 | JWT (jose) + Cookie |
| 支付 | Mock 默认 / 支付宝当面付（个人可用） |

## 快速开始

```bash
cd bounty-box
npm install
npx prisma db push
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
bounty-box/
├── prisma/schema.prisma          # 数据库模型（User/Question/Answer/Payment/Withdrawal）
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页（统计数据 + 最新悬赏）
│   │   ├── layout.tsx / globals.css
│   │   ├── login/page.tsx        # 登录页（Client Component）
│   │   ├── register/page.tsx     # 注册页（新用户送 ¥100）
│   │   ├── ask/page.tsx          # 发布悬赏（滑块设金额，预扣校验）
│   │   ├── questions/page.tsx    # 悬赏广场（状态+分类筛选）
│   │   ├── questions/[id]/page.tsx # 问题详情 + 回答列表 + 采纳按钮
│   │   ├── wallet/page.tsx       # 钱包（充值 + 交易记录）
│   │   ├── me/page.tsx           # 个人中心（我的提问/回答/已赚金额）
│   │   └── api/
│   │       ├── auth/login/route.ts       # 登录
│   │       ├── auth/register/route.ts    # 注册
│   │       ├── auth/logout/route.ts      # 登出
│   │       ├── user/route.ts             # 获取当前用户
│   │       ├── questions/route.ts        # 问题列表 GET / 发布 POST
│   │       ├── questions/[id]/route.ts   # 问题详情 GET / 采纳答案 PATCH
│   │       ├── answers/route.ts          # 提交回答
│   │       ├── wallet/route.ts           # 钱包余额 GET / 创建充值订单 POST
│   │       └── payment/callback/route.ts # Mock 支付回调
│   ├── components/
│   │   ├── Navbar.tsx            # 顶部导航（登录态 + 菜单）
│   │   ├── QuestionCard.tsx      # 问题卡片组件
│   │   └── Badges.tsx            # 状态/金额/分类标签
│   └── lib/
│       ├── prisma.ts             # Prisma 客户端（全局单例）
│       ├── auth.ts               # JWT 签发/验证/取用户
│       ├── payment/index.ts      # 支付抽象接口 + Mock Provider
│       ├── payment/alipay-provider.ts # 支付宝当面付实现
│       └── utils.ts              # 格式化时间/货币
├── .env / .env.example
├── .gitignore
└── README.md
```

## 业务流程

```
1. 用户 A 注册 → 系统赠送 ¥100 体验金
2. 用户 A 发布悬赏（设定金额 ¥50）→ 系统预扣 ¥50 托管
3. 用户 B、C 浏览到问题 → 提交回答
4. 用户 A 浏览回答 → 点击「采纳此回答」
5. 系统把 ¥50 转入回答者 B 的钱包
6. 用户 B 可在钱包查看余额和交易记录
```

## 支付集成

### Mock 模式（默认）

- 充值立即到账，无需真实支付
- 用于本地开发和功能验证

### 支付宝当面付（个人可用）

1. 注册 https://open.alipay.com（个人支付宝即可）
2. 创建应用 → 开通「当面付」
3. 生成 RSA2 密钥 → 配置 `.env`
4. 修改 `.env`:

```env
PAYMENT_PROVIDER=alipay
ALIPAY_APP_ID=你的APPID
ALIPAY_PRIVATE_KEY=***
ALIPAY_PUBLIC_KEY=***
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
NEXT_PUBLIC_APP_URL=https://你的域名.com
```

## 部署

### Cloudflare Pages

1. 推送到 GitHub
2. Cloudflare Dashboard → Pages → 连接 GitHub 仓库
3. 构建设置：
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
4. 添加环境变量（DATABASE_URL、JWT_SECRET 等）
5. 部署

### Vercel

1. 连接 GitHub 仓库 → 自动识别 Next.js
2. 添加环境变量
3. 部署

## License

MIT
