'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { QuestionCard } from '@/components/QuestionCard';
import { formatRelativeTime } from '@/lib/utils';

const categories = [
  { value: 'all', label: '全部分类' },
  { value: '编程开发', label: '💻 编程开发' },
  { value: '设计创意', label: '🎨 设计创意' },
  { value: '数学科学', label: '🔬 数学科学' },
  { value: '语言翻译', label: '🌍 语言翻译' },
  { value: '法律财务', label: '📊 法律财务' },
  { value: '生活百科', label: '🏠 生活百科' },
  { value: '职场求职', label: '💼 职场求职' },
  { value: '学习教育', label: '📚 学习教育' },
  { value: '其他', label: '🔮 其他' },
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, [category, status]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (status !== 'all') params.set('status', status);

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error('Fetch questions error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">悬赏广场</h1>

        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'open', 'answered', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  status === s
                    ? 'bg-bounty-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? '全部状态' : s === 'open' ? '等待回答' : s === 'answered' ? '已有回答' : '已结单'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  category === c.value
                    ? 'bg-bounty-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : questions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {questions.map(q => (
              <QuestionCard
                key={q.id}
                {...q}
                createdAt={q.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg mb-2">没有找到相关问题</p>
            <p className="text-gray-400 text-sm">试试其他筛选条件，或发布新的悬赏问题</p>
            <Link href="/ask" className="inline-block mt-4 bg-bounty-500 text-white px-6 py-2 rounded-full hover:bg-bounty-600 transition">
              发布悬赏
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
