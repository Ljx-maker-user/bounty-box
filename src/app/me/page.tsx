'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatRelativeTime } from '@/lib/utils';

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/user');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);

        // Fetch user's questions and answers
        const [questionsRes, answersRes] = await Promise.all([
          fetch(`/api/questions?authorId=${userData.id}`),
          fetch(`/api/answers?authorId=${userData.id}`),
        ]);

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData);
        }

        if (answersRes.ok) {
          const answersData = await answersRes.json();
          setAnswers(answersData);
        }
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  const earned = answers.filter(a => a.isAccepted).reduce((sum, a) => sum + (a.question?.bounty || 0), 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-bounty-100 text-bounty-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.username}</h1>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-bounty-600">¥{user.balance.toFixed(2)}</div>
            <div className="text-xs text-gray-500">余额</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-xl font-bold">{questions.length}</div>
            <div className="text-xs text-gray-500">提问</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-xl font-bold">{answers.length}</div>
            <div className="text-xs text-gray-500">回答</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-green-600">¥{earned.toFixed(2)}</div>
            <div className="text-xs text-gray-500">已赚</div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">我的提问</h2>
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map(q => (
                <Link key={q.id} href={`/questions/${q.id}`} className="block">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-bounty-300 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{q.title}</h3>
                        <span className="text-xs text-gray-400">{formatRelativeTime(q.createdAt)}</span>
                      </div>
                      <span className="text-sm font-medium text-bounty-600">¥{q.bounty.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 text-sm">
              还没有提问，去发布你的第一个悬赏吧！
              <Link href="/ask" className="text-bounty-600 hover:underline ml-1">发布悬赏</Link>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">我的回答</h2>
          {answers.length > 0 ? (
            <div className="space-y-3">
              {answers.map(a => (
                <Link key={a.id} href={`/questions/${a.questionId}`} className="block">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-bounty-300 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-700 text-sm line-clamp-2">{a.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          问题: {a.question?.title} · {formatRelativeTime(a.createdAt)}
                        </p>
                      </div>
                      {a.isAccepted && (
                        <span className="text-green-600 text-sm font-medium">✅ 已采纳</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 text-sm">
              还没有回答，去发挥你的专长赚取赏金吧！
              <Link href="/questions" className="text-bounty-600 hover:underline ml-1">浏览问题</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
