import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Wallet error:', error);
    return NextResponse.json({ error: '获取交易记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: '充值金额无效' }, { status: 400 });
    }

    // 生成订单号
    const orderId = `RECHARGE_${user.id}_${Date.now()}`;

    // 创建支付订单记录
    const payment = await prisma.payment.create({
      data: {
        amount,
        type: 'deposit',
        status: 'pending',
        paymentOrderId: orderId,
        userId: user.id,
      },
    });

    // 调用支付平台创建订单
    const provider = getPaymentProvider();
    const result = await provider.createOrder({
      orderId,
      amount,
      subject: `技能悬赏箱充值 ${amount} 元`,
      description: `为技能悬赏箱账户充值 ${amount} 元`,
    });

    return NextResponse.json({
      orderId: result.orderId,
      paymentUrl: result.paymentUrl,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Recharge error:', error);
    return NextResponse.json(
      { error: '创建充值订单失败' },
      { status: 500 }
    );
  }
}
