'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatRelativeTime } from '@/lib/utils';

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState(100);
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, transRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/wallet'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupLoading(true);

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: topupAmount }),
      });

      const data = await res.json();

      if (res.ok && data.orderId) {
        // Mock payment - simulate success
        await fetch('/api/payment/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId, amount: topupAmount }),
        });

        alert('充值成功！');
        fetchData();
      } else {
        alert(data.error || '充值失败');
      }
    } catch (error) {
      alert('充值失败');
    } finally {
      setTopupLoading(false);
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

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">💰 我的钱包</h1>

        <div className="bg-gradient-to-br from-bounty-500 to-bounty-700 text-white rounded-xl p-6 mb-6">
          <div className="text-sm opacity-80 mb-1">账户余额</div>
          <div className="text-4xl font-bold mb-4">
            ¥{user.balance.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">充值</h2>

          <form onSubmit={handleTopup} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">¥</span>
              <input
                type="number"
                min="1"
                max="50000"
                value={topupAmount}
                onChange={e => setTopupAmount(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bounty-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 500, 1000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    topupAmount === amt
                      ? 'bg-bounty-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ¥{amt}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={topupLoading}
              className="w-full bg-bounty-500 text-white py-2 rounded-lg hover:bg-bounty-600 transition font-medium disabled:opacity-50"
            >
              {topupLoading ? '处理中...' : '确认充值'}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-3">
            💡 开发模式使用模拟支付，确认后立即到账。
          </p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold mb-4">交易记录</h2>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {tx.type === 'recharge' ? '💳 充值' : tx.type === 'bounty' ? '💰 悬赏' : '📝 ' + tx.type}
                    </div>
                    <div className="text-xs text-gray-400">{formatRelativeTime(tx.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      tx.type === 'recharge' || tx.type === 'bounty_received' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {tx.type === 'recharge' || tx.type === 'bounty_received' ? '+' : '-'}¥{tx.amount.toFixed(2)}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status === 'success' ? '成功' : '处理中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">暂无交易记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
