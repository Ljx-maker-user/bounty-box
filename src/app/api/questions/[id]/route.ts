import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Question detail error:', error);
    return NextResponse.json({ error: '获取问题详情失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { action, answerId } = await request.json();

    if (action === 'accept' && answerId) {
      const question = await prisma.question.findUnique({
        where: { id: params.id },
        include: { answers: true },
      });

      if (!question) {
        return NextResponse.json({ error: '问题不存在' }, { status: 404 });
      }

      if (question.authorId !== user.id) {
        return NextResponse.json({ error: '只有提问者可以采纳回答' }, { status: 403 });
      }

      if (question.status === 'closed') {
        return NextResponse.json({ error: '该问题已关闭' }, { status: 400 });
      }

      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        include: { author: true },
      });

      if (!answer || answer.questionId !== params.id) {
        return NextResponse.json({ error: '回答不存在' }, { status: 404 });
      }

      // Mark answer as accepted
      await prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      });

      // Close question
      await prisma.question.update({
        where: { id: params.id },
        data: { status: 'closed' },
      });

      // Transfer bounty to answerer
      await prisma.user.update({
        where: { id: answer.authorId },
        data: { balance: { increment: question.bounty } },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
