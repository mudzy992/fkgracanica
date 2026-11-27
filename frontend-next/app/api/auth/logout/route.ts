import { NextResponse, type NextRequest } from 'next/server';
import { getApiUrl } from '../../../../lib/media';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('fk_refresh_token')?.value;
  try {
    await fetch(`${getApiUrl()}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {}
  const res = NextResponse.json({ ok: true });
  res.cookies.set('fk_access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('fk_refresh_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
