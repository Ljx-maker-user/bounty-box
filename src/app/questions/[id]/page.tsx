'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BountyBadge, CategoryBadge } from '@/components/Badges';
import { formatRelativeTime } from '@/lib/utils';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestion();
    fetchUser();
  }, [params.id]);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/questions/${params.id}`);
      const data = await res.json();
      setQuestion(data);
    } catch (error) {
      console.error('Fetch question error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!confirm('确认采纳此回答？打赏金额将转入回答者账户。')) return;

    try {
      const res = await fetch(`/api/questions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', answerId }),
      });

      if (res.ok) {
        alert('已采纳该回答！');
        fetchQuestion();
      } else {
        const data = await res.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: params.id, content: answerContent }),
      });

      if (res.ok) {
        alert('回答已提交！');
        setAnswerContent('');
        fetchQuestion();
      } else {
        const data = await res.json();
        alert(data.error || '提交失败');
      }
    } catch (error) {
      alert('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-6xl mb-4">🤷</p>
          <p className="text-gray-500 text-lg">问题不存在</p>
          <Link href="/questions" className="text-bounty-600 hover:underline">返回悬赏广场</Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === question.authorId;
  const acceptedAnswer = question.answers?.find((a: any) => a.isAccepted);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/questions" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← 返回悬赏广场
        </Link>

        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <BountyBadge amount={question.bounty} />
            <CategoryBadge category={question.category} />
            {question.status === 'closed' && (
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">🔒 已结单</span>
            )}
            {acceptedAnswer && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">✅ 已采纳</span>
            )}
          </div>

          <h1 className="text-xl font-bold mb-3">{question.title}</h1>
          <div className="prose prose-sm text-gray-700 whitespace-pre-wrap mb-4">{question.description}</div>

          {question.tags && (
            <div className="flex gap-2 flex-wrap">
              {question.tags.split(',').filter(Boolean).map((tag: string) => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
            <span>提问者: {question.author.nickname || question.author.username}</span>
            <span>{formatRelativeTime(question.createdAt)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">
            {question.answers?.length || 0} 个回答
          </h2>

          {question.answers && question.answers.length > 0 ? (
            <div className="space-y-4">
              {question.answers.map((answer: any) => (
                <div
                  key={answer.id}
                  className={`bg-white rounded-xl p-5 ${
                    answer.isAccepted ? 'border-2 border-green-400 ring-4 ring-green-50' : 'border border-gray-100'
                  }`}
                >
                  {answer.isAccepted && (
                    <div className="flex items-center gap-1 text-green-600 font-medium text-sm mb-2">
                      ✅ 提问者采纳了此回答
                    </div>
                  )}
                  <div className="text-gray-700 whitespace-pre-wrap mb-3">{answer.content}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>回答者: {answer.author.nickname || answer.author.username}</span>
                    <span>{formatRelativeTime(answer.createdAt)}</span>
                  </div>

                  {isAuthor && question.status !== 'closed' && !answer.isAccepted && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className="mt-3 bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600 transition"
                    >
                      ✅ 采纳此回答
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl">
              <p className="text-gray-500">还没有人回答，等待有缘人...</p>
            </div>
          )}
        </div>

        {user && !isAuthor && question.status !== 'closed' && (
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold mb-4">💡 我来回答</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={answerContent}
                onChange={e => setAnswerContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bounty-500 focus:border-transparent outline-none h-32 resize-y"
                placeholder="写下你的专业回答..."
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-bounty-500 text-white px-6 py-2 rounded-lg hover:bg-bounty-600 transition font-medium disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交回答'}
              </button>
            </form>
          </div>
        )}

        {!user && question.status !== 'closed' && (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-gray-500 mb-3">登录后才能回答问题</p>
            <Link href="/login" className="bg-bounty-500 text-white px-6 py-2 rounded-lg hover:bg-bounty-600 transition font-medium">
              登录 / 注册
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
