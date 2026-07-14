import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export interface JWTData {
  userId: string;
  username: string;
}

export async function signToken(userId: string, username: string): Promise<string> {
  return new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTData | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTData;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const jwtData = await verifyToken(token);
  if (!jwtData) return null;

  const user = await prisma.user.findUnique({
    where: { id: jwtData.userId },
    select: {
      id: true,
      username: true,
      nickname: true,
      balance: true,
    },
  });

  return user;
}
