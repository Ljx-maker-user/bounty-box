import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { QuestionCard } from '@/components/QuestionCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const recentQuestions = await prisma.question.findMany({
    where: { status: { in: ['open', 'answered'] } },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      author: { select: { username: true, nickname: true } },
      _count: { select: { answers: true } },
    },
  });

  const stats = await prisma.$transaction([
    prisma.question.count({ where: { status: { in: ['open', 'answered'] } } }),
    prisma.question.count({ where: { status: 'closed' } }),
    prisma.user.count(),
    prisma.answer.count(),
  ]);

  const [openCount, closedCount, userCount, answerCount] = stats;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="bg-gradient-to-br from-bounty-500 to-bounty-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">🎯 技能悬赏箱</h1>
          <p className="text-xl text-bounty-100 mb-8">知识有价，悬赏问答 — 让每个专业回答都获得回报</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/ask" className="bg-white text-bounty-700 px-6 py-3 rounded-full font-semibold hover:bg-bounty-50 transition">
              发布悬赏
            </Link>
            <Link href="/questions" className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition">
              浏览问题
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-bounty-600">{openCount}</div>
            <div className="text-sm text-gray-500">等待回答</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{closedCount}</div>
            <div className="text-sm text-gray-500">已结单</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userCount}</div>
            <div className="text-sm text-gray-500">注册用户</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{answerCount}</div>
            <div className="text-sm text-gray-500">专业回答</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">最新悬赏</h2>
          <Link href="/questions" className="text-bounty-600 hover:text-bounty-700 text-sm font-medium">
            查看全部 →
          </Link>
        </div>

        {recentQuestions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentQuestions.map(q => (
              <QuestionCard
                key={q.id}
                {...q}
                createdAt={q.createdAt.toISOString()}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 mb-4">还没有悬赏问题，成为第一个提问者吧！</p>
            <Link href="/ask" className="inline-block bg-bounty-500 text-white px-6 py-2 rounded-full hover:bg-bounty-600 transition">
              发布第一个悬赏
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">如何使用</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl mb-3">❓</div>
              <h3 className="font-semibold mb-2">提问并悬赏</h3>
              <p className="text-sm text-gray-600">描述你的问题，设定答谢金额，系统会预扣金额到平台</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-semibold mb-2">等待回答</h3>
              <p className="text-sm text-gray-600">懂行的用户看到后会给出专业回答，多人可以回答</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold mb-2">采纳并付款</h3>
              <p className="text-sm text-gray-600">对答案满意就采纳，答谢金自动转入回答者账户</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>© 2024 技能悬赏箱 | 知识有价，互助共赢</p>
      </footer>
    </div>
  );
}
