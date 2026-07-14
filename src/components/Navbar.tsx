'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(setUser)
      .catch(() => {});
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🎯</span>
          <span className="text-bounty-700">技能悬赏箱</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/questions" className="text-gray-600 hover:text-bounty-600 transition">
            悬赏广场
          </Link>

          {user ? (
            <>
              <Link href="/ask" className="bg-bounty-500 text-white px-4 py-1.5 rounded-full hover:bg-bounty-600 transition font-medium">
                发布悬赏
              </Link>
              <Link href="/wallet" className="text-gray-600 hover:text-bounty-600 transition">
                💰 钱包
              </Link>
              <Link href="/me" className="flex items-center gap-1.5 text-gray-700 hover:text-bounty-600 transition">
                <span className="w-7 h-7 bg-bounty-100 text-bounty-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </span>
                {user.username}
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-gray-400 hover:text-red-500 transition text-xs">
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-bounty-600 transition">
                登录
              </Link>
              <Link href="/register" className="bg-bounty-500 text-white px-4 py-1.5 rounded-full hover:bg-bounty-600 transition font-medium">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
