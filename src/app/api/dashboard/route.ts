import { NextResponse } from 'next/server';

const EDGE_FN_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/dashboard';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  
  const res = await fetch(EDGE_FN_URL, {
    headers: { 'cookie': cookie },
  });
  
  const html = await res.text();
  
  // Forward set-cookie headers
  const headers = new Headers();
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) headers.set('set-cookie', setCookie);
  
  return new Response(html, { status: res.status, headers });
}

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const contentType = request.headers.get('content-type') || '';
  
  let body: BodyInit | undefined;
  if (contentType.includes('form')) {
    body = await request.text();
  } else {
    body = undefined;
  }
  
  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: { 
      'cookie': cookie,
      ...(contentType ? { 'content-type': contentType } : {}),
    },
    body,
  });
  
  const responseText = await res.text();
  const resContentType = res.headers.get('content-type') || '';
  
  const headers = new Headers();
  // If edge function redirected (login success), forward redirect
  if (res.status === 302) {
    headers.set('Location', '/api/dashboard');
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) headers.set('set-cookie', setCookie);
    return new Response(null, { status: 302, headers });
  }
  
  // If JSON response (refresh result), pass through
  if (resContentType.includes('json')) {
    headers.set('Content-Type', 'application/json');
    return new Response(responseText, { status: res.status, headers });
  }
  
  // HTML response (login page with error)
  headers.set('Content-Type', 'text/html; charset=utf-8');
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) headers.set('set-cookie', setCookie);
  return new Response(responseText, { status: res.status, headers });
}
