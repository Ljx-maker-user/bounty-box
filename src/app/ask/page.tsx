'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const categories = [
  { value: '', label: '选择分类' },
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

export default function AskPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    bounty: 50,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '发布失败');
      router.push(`/questions/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/questions" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
          ← 返回悬赏广场
        </Link>

        <h1 className="text-2xl font-bold mb-6">📝 发布悬赏</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">问题标题</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bounty-500 focus:border-transparent outline-none"
              placeholder="简明扼要地描述你的问题"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">问题详情</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bounty-500 focus:border-transparent outline-none h-36 resize-y"
              placeholder="尽可能详细地描述问题，方便回答者理解"
              maxLength={5000}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bounty-500 focus:border-transparent outline-none"
                required
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                答谢金额 <span className="text-bounty-600 font-bold">¥{form.bounty}</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                step="1"
                value={form.bounty}
                onChange={e => setForm({ ...form, bounty: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bounty-500 focus:border-transparent outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">发布时将从余额中预扣</p>
            </div>
          </div>

          <div className="bg-bounty-50 border border-bounty-200 rounded-lg p-4">
            <p className="text-sm text-bounty-800">
              💡 当前余额: <span className="font-bold">¥{user.balance.toFixed(2)}</span>
            </p>
            {user.balance < form.bounty && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ 余额不足，请先<Link href="/wallet" className="underline">充值</Link>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || user.balance < form.bounty}
            className="w-full bg-bounty-500 text-white py-3 rounded-lg hover:bg-bounty-600 transition font-medium text-lg disabled:opacity-50"
          >
            {loading ? '发布中...' : `发布悬赏（预扣 ¥${form.bounty}）`}
          </button>
        </form>
      </div>
    </div>
  );
}
