import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    // Extract userId from orderId (format: pay_{timestamp}_{random})
    const parts = orderId.split('_');
    if (parts.length < 3) {
      return NextResponse.json({ error: '订单号格式错误' }, { status: 400 });
    }

    // In mock mode, we need to get the user from the request or use a test user
    // For now, let's find the first user (in production, this would come from the payment provider)
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        amount,
        type: 'recharge',
        status: 'success',
        paymentOrderId: orderId,
        userId: user.id,
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: amount } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ error: '处理支付回调失败' }, { status: 500 });
  }
}
