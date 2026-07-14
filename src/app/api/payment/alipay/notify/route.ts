import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const data: any = {};
    
    params.forEach((value, key) => {
      data[key] = value;
    });

    const provider = getPaymentProvider();
    const result = await provider.processCallback(data);

    if (!result.success) {
      return new NextResponse('fail', { status: 200 });
    }

    // 查找订单
    const payment = await prisma.payment.findFirst({
      where: { 
        paymentOrderId: result.orderId, 
        status: 'pending' 
      },
    });

    if (!payment) {
      console.error('Payment order not found:', result.orderId);
      return new NextResponse('fail', { status: 200 });
    }

    // 验证金额
    if (Math.abs(payment.amount - result.amount) > 0.01) {
      console.error('Amount mismatch:', payment.amount, result.amount);
      return new NextResponse('fail', { status: 200 });
    }

    // 更新用户余额和订单状态
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'success' },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { balance: { increment: payment.amount } },
      }),
    ]);

    // 返回 success 告诉支付宝已收到通知
    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('Alipay callback error:', error);
    // 即使出错也返回 fail，支付宝会重试
    return new NextResponse('fail', { status: 200 });
  }
}
