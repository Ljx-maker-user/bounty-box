import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      balance: user.balance,
    });
  } catch (error) {
    console.error('User error:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
