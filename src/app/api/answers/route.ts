import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { questionId, content } = await request.json();

    if (!questionId || !content) {
      return NextResponse.json({ error: '请填写回答内容' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: '问题不存在' }, { status: 404 });
    }

    if (question.status === 'closed') {
      return NextResponse.json({ error: '该问题已关闭' }, { status: 400 });
    }

    if (question.authorId === user.id) {
      return NextResponse.json({ error: '不能回答自己的问题' }, { status: 400 });
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: user.id,
        isAccepted: false,
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

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Answer error:', error);
    return NextResponse.json({ error: '提交回答失败' }, { status: 500 });
  }
}
