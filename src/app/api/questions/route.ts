import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (status && status !== 'all') where.status = status;

    const questions = await prisma.question.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Questions error:', error);
    return NextResponse.json({ error: '获取问题列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { title, description, category, bounty } = await request.json();

    if (!title || !description || !category || bounty === undefined) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
    }

    if (bounty <= 0) {
      return NextResponse.json({ error: '悬赏金额必须大于0' }, { status: 400 });
    }

    if (user.balance < bounty) {
      return NextResponse.json({ error: '余额不足' }, { status: 400 });
    }

    // Deduct balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: bounty } },
    });

    // Create question
    const question = await prisma.question.create({
      data: {
        title,
        description,
        category,
        bounty,
        status: 'open',
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: '发布问题失败' }, { status: 500 });
  }
}
