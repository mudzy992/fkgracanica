import { NextResponse, type NextRequest } from 'next/server';
import { getApiUrl } from '../../../../lib/media';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const url = `${getApiUrl()}/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });

  const { accessToken, refreshToken, user } = data as {
    accessToken: string;
    refreshToken: string;
    user: unknown;
  };
  const response = NextResponse.json({ user, accessToken, refreshToken });
  const secure = process.env.NODE_ENV === 'production';
  const common = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };
  if (accessToken) response.cookies.set('fk_access_token', accessToken, { ...common, maxAge: 900 });
  if (refreshToken) response.cookies.set('fk_refresh_token', refreshToken, { ...common, maxAge: 60 * 60 * 24 * 7 });
  return response;
}
